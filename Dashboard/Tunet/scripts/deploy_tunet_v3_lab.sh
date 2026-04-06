#!/usr/bin/env bash
#
# Deploy Tunet v3 built card outputs to HA server and sync Lovelace resource URLs.
#
# Usage:
#   ./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh          # deploy built cards
#   ./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source  # deploy source (pre-build, rollback)
#
# Prerequisites:
#   - sshpass installed (apt install sshpass)
#   - .env file with HA_SSH_PASSWORD (HA_SSH_HOST / HA_SSH_USER optional)
#   - For built outputs: run `npm run tunet:build` first
#   - For automatic cache-busting: .env must include HA_LONG_LIVED_ACCESS_TOKEN or HA_TOKEN

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DIST_DIR="$REPO_ROOT/Dashboard/Tunet/Cards/v3/dist"
SOURCE_DIR="$REPO_ROOT/Dashboard/Tunet/Cards/v3"
HA_HOST_DEFAULT="10.0.0.21"
HA_USER_DEFAULT="root"
HA_TARGET="/config/www/tunet/v3/"
ENV_FILE="$REPO_ROOT/.env"

get_env_value() {
  local key="$1"
  local default_value="${2:-}"
  local value

  value="$(grep -E "^${key}=" "$ENV_FILE" 2>/dev/null | tail -n 1 | cut -d= -f2- || true)"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"

  if [[ -n "$value" ]]; then
    printf '%s' "$value"
  else
    printf '%s' "$default_value"
  fi
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: .env file not found at $ENV_FILE"
  exit 1
fi

HA_HOST="$(get_env_value HA_SSH_HOST "$HA_HOST_DEFAULT")"
HA_USER="$(get_env_value HA_SSH_USER "$HA_USER_DEFAULT")"
HA_PASSWORD="$(get_env_value HA_SSH_PASSWORD)"

if [[ -z "$HA_PASSWORD" ]]; then
  echo "ERROR: HA_SSH_PASSWORD is missing in $ENV_FILE"
  exit 1
fi

DEPLOY_SOURCE="$DIST_DIR"
if [[ "${1:-}" == "--source" ]]; then
  DEPLOY_SOURCE="$SOURCE_DIR"
  echo "  Mode: deploying SOURCE files (rollback/pre-build)"
else
  echo "  Mode: deploying BUILT files from dist/"
  if [[ ! -d "$DIST_DIR" ]]; then
    echo "ERROR: dist/ not found. Run 'npm run tunet:build' first."
    exit 1
  fi
fi

CARDS=(
  tunet_actions_card.js
  tunet_scenes_card.js
  tunet_light_tile.js
  tunet_lighting_card.js
  tunet_rooms_card.js
  tunet_climate_card.js
  tunet_sensor_card.js
  tunet_weather_card.js
  tunet_media_card.js
  tunet_sonos_card.js
  tunet_speaker_grid_card.js
  tunet_nav_card.js
  tunet_status_card.js
)

# Also deploy tunet_base.js if deploying source (unbundled mode needs it)
if [[ "${1:-}" == "--source" ]]; then
  CARDS+=(tunet_base.js)
fi

echo "  Target: $HA_USER@$HA_HOST:$HA_TARGET"
echo ""

FAILED=0
for card in "${CARDS[@]}"; do
  SRC="$DEPLOY_SOURCE/$card"
  if [[ ! -f "$SRC" ]]; then
    echo "  SKIP (missing): $card"
    continue
  fi

  if sshpass -p "$HA_PASSWORD" scp -o StrictHostKeyChecking=no "$SRC" "$HA_USER@$HA_HOST:$HA_TARGET$card" 2>/dev/null; then
    echo "  ✓ $card"
  else
    echo "  ✗ FAILED: $card"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo ""
  if [[ "${1:-}" == "--source" ]]; then
    RESOURCE_VERSION="${TUNET_RESOURCE_VERSION:-source_$(date -u +%Y%m%d_%H%M%SZ)}"
    echo "  Syncing Lovelace resources with source deploy token: $RESOURCE_VERSION"
    node "$REPO_ROOT/Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs" --version "$RESOURCE_VERSION"
  else
    echo "  Syncing Lovelace resources from dist manifest"
    node "$REPO_ROOT/Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs" --manifest "$DIST_DIR/manifest.json"
  fi
  echo "  Deploy complete: ${#CARDS[@]} files → $HA_USER@$HA_HOST:$HA_TARGET"
else
  echo "  Deploy finished with $FAILED failures."
  exit 1
fi
