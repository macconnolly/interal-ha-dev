#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Safely deploy Home Assistant package YAML files with backup and git traceability.

Usage:
  deploy_packages.sh [--root PATH] [--env-file PATH]
                     [--dry-run --assume-remote-match]
                     [--help]

Options:
  --root PATH               Project root (default: current directory)
  --env-file PATH           Path to .env (default: <root>/.env)
  --dry-run                 Print actions without SSH/SCP/git writes
  --assume-remote-match     In dry-run only, treat local files as matched
  -h, --help                Show this help
EOF
}

log() {
  printf '[INFO] %s\n' "$*"
}

warn() {
  printf '[WARN] %s\n' "$*" >&2
}

fail() {
  printf '[ERROR] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

DRY_RUN=0
ASSUME_REMOTE_MATCH=0
ROOT_DIR="$PWD"
ENV_FILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root)
      [[ $# -ge 2 ]] || fail "--root requires a value"
      ROOT_DIR="$2"
      shift 2
      ;;
    --env-file)
      [[ $# -ge 2 ]] || fail "--env-file requires a value"
      ENV_FILE="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --assume-remote-match)
      ASSUME_REMOTE_MATCH=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      fail "Unknown argument: $1"
      ;;
  esac
done

if [[ "$ASSUME_REMOTE_MATCH" -eq 1 && "$DRY_RUN" -ne 1 ]]; then
  fail "--assume-remote-match is allowed only with --dry-run"
fi

ROOT_DIR="$(cd "$ROOT_DIR" && pwd)"
if [[ -z "$ENV_FILE" ]]; then
  ENV_FILE="${ROOT_DIR}/.env"
fi

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  warn ".env not found at ${ENV_FILE}; using defaults"
fi

HA_SSH_HOST="${HA_SSH_HOST:-10.0.0.21}"
HA_SSH_USER="${HA_SSH_USER:-root}"
HA_SSH_PASSWORD="${HA_SSH_PASSWORD:-password}"
HA_PACKAGES_PATH="${HA_PACKAGES_PATH:-/config/packages}"
LOCAL_PACKAGES_PATH="${LOCAL_PACKAGES_PATH:-${ROOT_DIR}/packages}"
BACKUPS_PATH="${HA_BACKUPS_PATH:-${ROOT_DIR}/Backups}"

require_cmd bash
require_cmd find
require_cmd sort
require_cmd git
require_cmd wc
if [[ "$DRY_RUN" -eq 0 || "$ASSUME_REMOTE_MATCH" -eq 0 ]]; then
  require_cmd sshpass
  require_cmd ssh
  require_cmd scp
fi

[[ -d "$LOCAL_PACKAGES_PATH" ]] || fail "Local packages directory not found: $LOCAL_PACKAGES_PATH"

ssh_opts=(-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

run_ssh() {
  local remote_cmd="$1"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] ssh ${HA_SSH_USER}@${HA_SSH_HOST} \"$remote_cmd\""
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" ssh "${ssh_opts[@]}" "${HA_SSH_USER}@${HA_SSH_HOST}" "$remote_cmd"
}

run_scp_from_remote() {
  local remote_file="$1"
  local local_file="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] scp ${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file} ${local_file}"
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" scp "${ssh_opts[@]}" "${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}" "$local_file"
}

run_scp_to_remote() {
  local local_file="$1"
  local remote_file="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] scp ${local_file} ${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}"
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" scp "${ssh_opts[@]}" "$local_file" "${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}"
}

contains_value() {
  local needle="$1"
  shift
  local value
  for value in "$@"; do
    if [[ "$value" == "$needle" ]]; then
      return 0
    fi
  done
  return 1
}

mapfile -t local_files < <(
  find "$LOCAL_PACKAGES_PATH" -maxdepth 1 -type f -name '*.yaml' -exec basename {} \; | sort
)
if [[ "${#local_files[@]}" -eq 0 ]]; then
  fail "No local package YAML files found in ${LOCAL_PACKAGES_PATH}"
fi
log "Phase 1/4: Found ${#local_files[@]} local package file(s)"
printf '  - %s\n' "${local_files[@]}"

declare -a remote_files=()
if [[ "$DRY_RUN" -eq 1 && "$ASSUME_REMOTE_MATCH" -eq 1 ]]; then
  remote_files=("${local_files[@]}")
  log "Phase 1/4: Dry-run remote list assumed from local files"
else
  mapfile -t remote_files < <(
    run_ssh "find \"${HA_PACKAGES_PATH}\" -maxdepth 1 -type f -name '*.yaml' | sed 's#^.*/##' | sort"
  )
  log "Phase 1/4: Found ${#remote_files[@]} remote package file(s)"
fi

declare -a matches=()
local_file=""
for local_file in "${local_files[@]}"; do
  if contains_value "$local_file" "${remote_files[@]}"; then
    matches+=("$local_file")
  fi
done

if [[ "${#matches[@]}" -eq 0 ]]; then
  fail "No matching package filenames found. Clarify expected package targets before deployment."
fi

log "Phase 1/4: ${#matches[@]} matched package(s) will be updated"
printf '  - %s\n' "${matches[@]}"

mkdir -p "$BACKUPS_PATH"
log "Phase 2/4: Backups directory ready: ${BACKUPS_PATH}"

declare -a backup_files=()
declare -a backup_timestamps=()
declare -a package_bases=()
pkg=""
for pkg in "${matches[@]}"; do
  pkg_base="${pkg%.yaml}"
  timestamp="$(date '+%F_%H-%M-%S')"
  backup_file="${BACKUPS_PATH}/${pkg_base}_${timestamp}.yaml"

  run_scp_from_remote "${HA_PACKAGES_PATH}/${pkg}" "$backup_file" || fail "Backup failed for ${pkg}"
  if [[ "$DRY_RUN" -eq 0 && ! -s "$backup_file" ]]; then
    fail "Backup file missing or empty: ${backup_file}"
  fi

  package_bases+=("$pkg_base")
  backup_timestamps+=("$timestamp")
  backup_files+=("$backup_file")
  log "Phase 2/4: Backup ready for ${pkg} -> ${backup_file}"
done

log "Phase 3/4: Committing backups"
for i in "${!backup_files[@]}"; do
  backup_file="${backup_files[$i]}"
  pkg_base="${package_bases[$i]}"
  timestamp="${backup_timestamps[$i]}"
  commit_msg="Backup: ${pkg_base} before deployment ${timestamp}"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] git -C ${ROOT_DIR} add ${backup_file}"
    log "[DRY RUN] git -C ${ROOT_DIR} commit -m \"${commit_msg}\""
    continue
  fi

  git -C "$ROOT_DIR" add "$backup_file" || fail "git add failed for ${backup_file}"
  git -C "$ROOT_DIR" commit -m "$commit_msg" || fail "git commit failed for ${backup_file}"
  log "Phase 3/4: Committed ${backup_file}"
done

log "Phase 4/4: Deploying matched packages"
for pkg in "${matches[@]}"; do
  local_path="${LOCAL_PACKAGES_PATH}/${pkg}"
  remote_path="${HA_PACKAGES_PATH}/${pkg}"

  run_scp_to_remote "$local_path" "$remote_path" || fail "Transfer failed for ${pkg}"

  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "Phase 4/4: [DRY RUN] Transfer verified for ${pkg}"
    continue
  fi

  local_size="$(wc -c < "$local_path" | tr -d '[:space:]')"
  remote_size="$(run_ssh "wc -c < \"${remote_path}\"" | tr -d '[:space:]')"
  if [[ "$local_size" != "$remote_size" ]]; then
    fail "Size mismatch for ${pkg}: local=${local_size}, remote=${remote_size}"
  fi
  log "Phase 4/4: Transfer verified for ${pkg} (${local_size} bytes)"
done

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "Dry-run complete. No files were modified."
else
  log "Deployment complete."
fi
