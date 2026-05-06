#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
PRIMARY_ROOT="/home/mac/HA/implementation_10"
LOCAL_INTEGRATION_DIR="$REPO_ROOT/custom_components/tunet_inbox"
BACKUP_ROOT="$REPO_ROOT/Backups/tunet_inbox"
REMOTE_PARENT="/config/custom_components"
REMOTE_DIR="$REMOTE_PARENT/tunet_inbox"
REMOTE_CONFIG="/config/configuration.yaml"

log() {
  printf '[tinbox:deploy] %s\n' "$*"
}

fail() {
  printf '[tinbox:deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing command: $1"
}

resolve_env_file() {
  if [[ -f "$REPO_ROOT/.env" ]]; then
    printf '%s' "$REPO_ROOT/.env"
    return
  fi
  if [[ -f "$PRIMARY_ROOT/.env" ]]; then
    printf '%s' "$PRIMARY_ROOT/.env"
    return
  fi
  fail ".env not found in worktree or primary root"
}

require_cmd sshpass
require_cmd ssh
require_cmd scp
require_cmd tar

[[ -d "$LOCAL_INTEGRATION_DIR" ]] || fail "local integration directory not found: $LOCAL_INTEGRATION_DIR"
[[ -f "$LOCAL_INTEGRATION_DIR/manifest.json" ]] || fail "local integration manifest missing"
[[ -f "$LOCAL_INTEGRATION_DIR/__init__.py" ]] || fail "local integration __init__.py missing"

ENV_FILE="$(resolve_env_file)"
# shellcheck disable=SC1090
source "$ENV_FILE"

HA_SSH_HOST="${HA_SSH_HOST:-10.0.0.21}"
HA_SSH_USER="${HA_SSH_USER:-root}"
HA_SSH_PASSWORD="${HA_SSH_PASSWORD:-password}"

mkdir -p "$BACKUP_ROOT"
TIMESTAMP="$(date '+%Y%m%d_%H%M%S')"
BACKUP_FILE="$BACKUP_ROOT/tunet_inbox_remote_${TIMESTAMP}.tar.gz"
CONFIG_BACKUP_FILE="$BACKUP_ROOT/configuration_remote_${TIMESTAMP}.yaml"

SSH_OPTS=(-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null)

log "backing up remote integration if present"
if sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" "test -d '$REMOTE_DIR'"; then
  sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" \
    "tar -czf - -C '$REMOTE_PARENT' tunet_inbox" > "$BACKUP_FILE"
  log "backup created: $BACKUP_FILE"
else
  log "no remote tunet_inbox directory found; skipping remote backup"
fi

log "backing up remote configuration.yaml"
if sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" "test -f '$REMOTE_CONFIG'"; then
  sshpass -p "$HA_SSH_PASSWORD" scp "${SSH_OPTS[@]}" \
    "$HA_SSH_USER@$HA_SSH_HOST:$REMOTE_CONFIG" "$CONFIG_BACKUP_FILE"
  log "configuration backup created: $CONFIG_BACKUP_FILE"
else
  fail "remote configuration file not found at $REMOTE_CONFIG"
fi

log "ensuring remote configuration.yaml contains tunet_inbox bootstrap"
sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" "python3 - '$REMOTE_CONFIG'" <<'PY'
import pathlib
import re
import sys

TINBOX_BLOCK = """tunet_inbox:
  notify_device_helper: notify.tunet_inbox_all_devices
  max_pending_items: 64
  response_timeout_seconds: 30
  archive_retention_days: 3
  privacy_mode_default: false
  debug_events: false
"""

NOTIFY_GROUP_BLOCK = """notify:
  - platform: group
    name: tunet_inbox_all_devices
    services:
      - action: mobile_app_ipad
      - action: mobile_app_iphone
      - action: mobile_app_iphone_4
      - action: mobile_app_iphone_deloitte
      - action: mobile_app_iphone_mc
      - action: mobile_app_mac_s_iphone
      - action: mobile_app_macs_iphone_personal
      - action: mobile_app_macs_work_phone
      - action: mobile_app_old_iphone
"""

LOGGER_ENTRIES = [
    "    custom_components.tunet_inbox: debug",
    "    custom_components.tunet_inbox.mobile: info",
]

TOP_LEVEL_RE = re.compile(r"^[^ \t#][^:]*:")
ANCHOR_LINES = [
    "# Setup the custom dashboard",
    "lovelace:",
]


def find_block(lines, block_name):
    start = None
    for index, line in enumerate(lines):
        if line.startswith(f"{block_name}:"):
            start = index
            break
    if start is None:
        return None, None

    end = len(lines)
    for index in range(start + 1, len(lines)):
        line = lines[index]
        if not line or line.startswith("#"):
            continue
        if TOP_LEVEL_RE.match(line):
            end = index
            break
    return start, end


def find_anchor_index(lines):
    for candidate in ANCHOR_LINES:
        for index, line in enumerate(lines):
            if line.strip() == candidate:
                return index
    return None


def replace_or_insert_block(text, block_name, new_block):
    lines = text.splitlines()
    start, end = find_block(lines, block_name)
    new_lines = new_block.strip("\n").splitlines()
    changed = False

    if start is not None:
        if lines[start:end] != new_lines:
            lines[start:end] = new_lines
            changed = True
        return "\n".join(lines) + "\n", changed

    anchor_index = find_anchor_index(lines)
    if anchor_index is None:
        raise SystemExit(f"Could not find anchor for inserting {block_name} block")
    lines[anchor_index:anchor_index] = new_lines + [""]
    return "\n".join(lines) + "\n", True


def ensure_notify_group(text):
    if "name: tunet_inbox_all_devices" in text:
        return text, False

    lines = text.splitlines()
    notify_start, notify_end = find_block(lines, "notify")
    group_lines = [
        "  - platform: group",
        "    name: tunet_inbox_all_devices",
        "    services:",
        "      - action: mobile_app_ipad",
        "      - action: mobile_app_iphone",
        "      - action: mobile_app_iphone_4",
        "      - action: mobile_app_iphone_deloitte",
        "      - action: mobile_app_iphone_mc",
        "      - action: mobile_app_mac_s_iphone",
        "      - action: mobile_app_macs_iphone_personal",
        "      - action: mobile_app_macs_work_phone",
        "      - action: mobile_app_old_iphone",
    ]

    if notify_start is None:
        return replace_or_insert_block(text, "notify", NOTIFY_GROUP_BLOCK)

    lines[notify_end:notify_end] = group_lines
    return "\n".join(lines) + "\n", True

path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
changed = False

text, block_changed = replace_or_insert_block(text, "tunet_inbox", TINBOX_BLOCK)
changed = changed or block_changed
text, notify_changed = ensure_notify_group(text)
changed = changed or notify_changed

lines = text.splitlines()
missing_logger_entries = [entry for entry in LOGGER_ENTRIES if entry not in lines]
if missing_logger_entries:
    insert_after = None
    for index, line in enumerate(lines):
        if line.strip().startswith("custom_components.tunet_inbox"):
            insert_after = index
    if insert_after is None:
        for index, line in enumerate(lines):
            if line.strip().startswith("custom_components.lighting_manager:"):
                insert_after = index
    if insert_after is None:
        for index, line in enumerate(lines):
            if line.strip() == "logs:":
                insert_after = index
    if insert_after is None:
        raise SystemExit("Could not find logger.logs anchor for tunet_inbox logger entries")
    lines[insert_after + 1:insert_after + 1] = missing_logger_entries
    changed = True

if changed:
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")

print("updated" if changed else "unchanged")
PY

log "creating remote parent path"
sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" \
  "mkdir -p '$REMOTE_PARENT'"

log "deploying tunet_inbox integration from $LOCAL_INTEGRATION_DIR to $REMOTE_DIR"
sshpass -p "$HA_SSH_PASSWORD" scp -r "${SSH_OPTS[@]}" "$LOCAL_INTEGRATION_DIR" \
  "$HA_SSH_USER@$HA_SSH_HOST:$REMOTE_PARENT/"

log "verifying remote integration payload"
sshpass -p "$HA_SSH_PASSWORD" ssh "${SSH_OPTS[@]}" "$HA_SSH_USER@$HA_SSH_HOST" \
  "test -f '$REMOTE_DIR/manifest.json' && test -f '$REMOTE_DIR/__init__.py' && test -f '$REMOTE_DIR/services.py'" \
  || fail "remote integration verification failed at $REMOTE_DIR"

log "integration deploy complete"
log "restart Home Assistant before running tinbox:smoke"
