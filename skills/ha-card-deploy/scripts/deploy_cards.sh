#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------------------------
# deploy_cards.sh — Deploy Tunet custom dashboard cards to Home Assistant
#
# Usage:
#   deploy_cards.sh [--root PATH] [--env-file PATH] [--dry-run] [--help]
#                   [card_file.js ...]
#
# Positional arguments (optional):
#   card_file.js ...   One or more specific card filenames to deploy.
#                      If omitted, all .js files in the source dir are deployed.
# ---------------------------------------------------------------------------

usage() {
  cat <<'EOF'
Deploy Tunet custom dashboard card JS files to Home Assistant with backup.

Usage:
  deploy_cards.sh [--root PATH] [--env-file PATH] [--dry-run] [--help]
                  [card_file.js ...]

Options:
  --root PATH        Project root (default: resolved from script location)
  --env-file PATH    Path to .env (default: <root>/.env)
  --dry-run          Print actions without SSH/SCP writes
  -h, --help         Show this help

Positional arguments:
  card_file.js ...   Specific card filename(s) to deploy (e.g. tunet_climate_card.js).
                     Omit to deploy ALL .js files in Dashboard/Tunet/Cards/.

Examples:
  # Deploy all cards
  ./deploy_cards.sh

  # Deploy a single card
  ./deploy_cards.sh tunet_climate_card.js

  # Deploy two cards, dry-run
  ./deploy_cards.sh --dry-run tunet_status_card.js tunet_lighting_card.js
EOF
}

# ---------------------------------------------------------------------------
# Logging helpers
# ---------------------------------------------------------------------------

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log() {
  printf '[INFO] %s\n' "$*"
}

log_ok() {
  printf "${GREEN}[OK]${RESET}   %s\n" "$*"
}

log_fail() {
  printf "${RED}[FAIL]${RESET} %s\n" "$*" >&2
}

warn() {
  printf "${YELLOW}[WARN]${RESET} %s\n" "$*" >&2
}

fail() {
  printf "${RED}[ERROR]${RESET} %s\n" "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Missing required command: $1"
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------

DRY_RUN=0

# Script lives at <root>/skills/ha-card-deploy/scripts/deploy_cards.sh
# Walk up three levels to reach repo root.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
ENV_FILE=""

declare -a FILTER_CARDS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --root)
      [[ $# -ge 2 ]] || fail "--root requires a value"
      ROOT_DIR="$(cd "$2" && pwd)"
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
    -h|--help)
      usage
      exit 0
      ;;
    *.js)
      FILTER_CARDS+=("$1")
      shift
      ;;
    *)
      fail "Unknown argument: $1  (card filenames must end in .js)"
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Environment
# ---------------------------------------------------------------------------

if [[ -z "$ENV_FILE" ]]; then
  ENV_FILE="${ROOT_DIR}/.env"
fi

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
else
  warn ".env not found at ${ENV_FILE}; relying on environment variables / defaults"
fi

HA_SSH_HOST="${HA_SSH_HOST:-10.0.0.21}"
HA_SSH_USER="${HA_SSH_USER:-root}"
HA_SSH_PASSWORD="${HA_SSH_PASSWORD:-password}"

# ---------------------------------------------------------------------------
# Path constants
# ---------------------------------------------------------------------------

LOCAL_CARDS_DIR="${ROOT_DIR}/Dashboard/Tunet/Cards"
REMOTE_CARDS_DIR="/config/www/tunet"
BACKUP_DIR="${ROOT_DIR}/Backups/tunet_cards_$(date +%Y%m%d_%H%M%S)"

# ---------------------------------------------------------------------------
# Dependency checks
# ---------------------------------------------------------------------------

require_cmd find
require_cmd sort
require_cmd wc
if [[ "$DRY_RUN" -eq 0 ]]; then
  require_cmd sshpass
  require_cmd ssh
  require_cmd scp
fi

[[ -d "$LOCAL_CARDS_DIR" ]] || fail "Local cards directory not found: ${LOCAL_CARDS_DIR}"

# ---------------------------------------------------------------------------
# SSH/SCP helpers
# ---------------------------------------------------------------------------

ssh_opts=(
  -o StrictHostKeyChecking=no
  -o UserKnownHostsFile=/dev/null
  -o LogLevel=ERROR
)

run_ssh() {
  local remote_cmd="$1"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] ssh ${HA_SSH_USER}@${HA_SSH_HOST} \"${remote_cmd}\""
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" ssh "${ssh_opts[@]}" \
    "${HA_SSH_USER}@${HA_SSH_HOST}" "$remote_cmd"
}

run_scp_from_remote() {
  local remote_file="$1"
  local local_file="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] scp ${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file} ${local_file}"
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" scp "${ssh_opts[@]}" \
    "${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}" "$local_file"
}

run_scp_to_remote() {
  local local_file="$1"
  local remote_file="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] scp ${local_file} ${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}"
    return 0
  fi
  sshpass -p "$HA_SSH_PASSWORD" scp "${ssh_opts[@]}" \
    "$local_file" "${HA_SSH_USER}@${HA_SSH_HOST}:${remote_file}"
}

# ---------------------------------------------------------------------------
# Phase 1: Resolve the set of cards to deploy
# ---------------------------------------------------------------------------

printf '\n%b--- Phase 1/4: Resolving card list%b\n' "${CYAN}" "${RESET}"

mapfile -t all_local_cards < <(
  find "$LOCAL_CARDS_DIR" -maxdepth 1 -type f -name '*.js' -exec basename {} \; | sort
)

if [[ "${#all_local_cards[@]}" -eq 0 ]]; then
  fail "No .js card files found in ${LOCAL_CARDS_DIR}"
fi

declare -a target_cards=()

if [[ "${#FILTER_CARDS[@]}" -gt 0 ]]; then
  # Validate each requested card exists locally
  for requested in "${FILTER_CARDS[@]}"; do
    found=0
    for candidate in "${all_local_cards[@]}"; do
      if [[ "$candidate" == "$requested" ]]; then
        target_cards+=("$requested")
        found=1
        break
      fi
    done
    if [[ "$found" -eq 0 ]]; then
      fail "Requested card not found in ${LOCAL_CARDS_DIR}: ${requested}"
    fi
  done
  log "Deploying ${#target_cards[@]} specified card(s):"
else
  target_cards=("${all_local_cards[@]}")
  log "Deploying all ${#target_cards[@]} card(s) found in source directory:"
fi

printf '  - %s\n' "${target_cards[@]}"

# ---------------------------------------------------------------------------
# Phase 2: Backup — create local dir, pull existing remote files into it
# ---------------------------------------------------------------------------

printf '\n%b--- Phase 2/4: Backing up remote cards%b\n' "${CYAN}" "${RESET}"

mkdir -p "$BACKUP_DIR"
log "Backup directory: ${BACKUP_DIR}"

# Ensure remote directory exists (create it if needed)
run_ssh "mkdir -p '${REMOTE_CARDS_DIR}'"
log "Remote directory confirmed: ${REMOTE_CARDS_DIR}"

declare -a backed_up=()
declare -a backup_skipped=()

for card in "${target_cards[@]}"; do
  remote_path="${REMOTE_CARDS_DIR}/${card}"
  local_backup="${BACKUP_DIR}/${card}"

  # Check whether the file actually exists on the remote before trying to copy
  if [[ "$DRY_RUN" -eq 1 ]]; then
    log "[DRY RUN] Would backup ${remote_path} -> ${local_backup}"
    backed_up+=("$card")
    continue
  fi

  remote_exists="$(
    sshpass -p "$HA_SSH_PASSWORD" ssh "${ssh_opts[@]}" \
      "${HA_SSH_USER}@${HA_SSH_HOST}" \
      "test -f '${remote_path}' && echo yes || echo no"
  )"

  if [[ "$remote_exists" == "yes" ]]; then
    if run_scp_from_remote "$remote_path" "$local_backup"; then
      log_ok "Backed up: ${card}"
      backed_up+=("$card")
    else
      warn "Backup failed for ${card} — aborting to protect remote state"
      fail "Backup step failed. No files have been deployed."
    fi
  else
    warn "No existing remote file for ${card} (new deployment — no backup needed)"
    backup_skipped+=("$card")
  fi
done

log "Backup complete: ${#backed_up[@]} backed up, ${#backup_skipped[@]} skipped (new files)"

# ---------------------------------------------------------------------------
# Phase 3: Deploy — SCP each card to remote
# ---------------------------------------------------------------------------

printf '\n%b--- Phase 3/4: Deploying cards to HA%b\n' "${CYAN}" "${RESET}"

deploy_ok=0
deploy_fail=0
declare -a failed_cards=()

for card in "${target_cards[@]}"; do
  local_path="${LOCAL_CARDS_DIR}/${card}"
  remote_path="${REMOTE_CARDS_DIR}/${card}"

  if run_scp_to_remote "$local_path" "$remote_path"; then
    if [[ "$DRY_RUN" -eq 0 ]]; then
      # Verify byte-count matches
      local_size="$(wc -c < "$local_path" | tr -d '[:space:]')"
      remote_size="$(run_ssh "wc -c < '${remote_path}'" | tr -d '[:space:]')"
      if [[ "$local_size" == "$remote_size" ]]; then
        log_ok "Deployed: ${card}  (${local_size} bytes)"
        (( deploy_ok++ )) || true
      else
        log_fail "Size mismatch: ${card}  local=${local_size}  remote=${remote_size}"
        failed_cards+=("$card")
        (( deploy_fail++ )) || true
      fi
    else
      log_ok "[DRY RUN] Would deploy: ${card}"
      (( deploy_ok++ )) || true
    fi
  else
    log_fail "SCP failed: ${card}"
    failed_cards+=("$card")
    (( deploy_fail++ )) || true
  fi
done

# ---------------------------------------------------------------------------
# Phase 4: Summary
# ---------------------------------------------------------------------------

printf '\n%b--- Phase 4/4: Summary%b\n' "${CYAN}" "${RESET}"

if [[ "$DRY_RUN" -eq 1 ]]; then
  log "Dry-run mode — no files were written."
fi

printf '  Target cards  : %d\n' "${#target_cards[@]}"
printf '  Backed up     : %d\n' "${#backed_up[@]}"
printf '  Skipped backup: %d  (new remote files)\n' "${#backup_skipped[@]}"
printf "  ${GREEN}Deployed OK${RESET}   : %d\n" "$deploy_ok"

if [[ "$deploy_fail" -gt 0 ]]; then
  printf "  ${RED}Failed${RESET}        : %d\n" "$deploy_fail"
  printf '    '
  printf '%s  ' "${failed_cards[@]}"
  printf '\n'
  printf '\n%bBackup location (for rollback):%b\n' "${YELLOW}" "${RESET}"
  printf '  %s\n' "$BACKUP_DIR"
  printf '\n%bTo rollback a card manually:%b\n' "${YELLOW}" "${RESET}"
  printf '  scp %s/<card>.js %s@%s:%s/<card>.js\n' \
    "$BACKUP_DIR" "$HA_SSH_USER" "$HA_SSH_HOST" "$REMOTE_CARDS_DIR"
  exit 1
fi

if [[ "$DRY_RUN" -eq 0 ]]; then
  printf '\n%bAll cards deployed successfully.%b\n\n' "${GREEN}" "${RESET}"
  printf 'Backups stored in: %s\n' "$BACKUP_DIR"
  printf '\n%bNote:%b If cards are not appearing, clear your browser cache\n' \
    "${YELLOW}" "${RESET}"
  printf '       or trigger a Lovelace resource reload in HA developer tools.\n'
fi
