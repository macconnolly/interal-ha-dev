#!/usr/bin/env bash
#
# Deploy Tunet v3 built card outputs to HA server.
#
# Usage:
#   ./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh          # deploy built cards
#   ./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source  # deploy source (pre-build, rollback)
#
# Prerequisites:
#   - sshpass installed (apt install sshpass)
#   - .env file with HA_SSH_PASSWORD
#   - For built outputs: run `npm run tunet:build` first

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
DIST_DIR="$REPO_ROOT/Dashboard/Tunet/Cards/v3/dist"
SOURCE_DIR="$REPO_ROOT/Dashboard/Tunet/Cards/v3"
HA_HOST="10.0.0.21"
HA_TARGET="/config/www/tunet/v3/"
ENV_FILE="$REPO_ROOT/.env"

# Read password from .env
if [[ -f "$ENV_FILE" ]]; then
  HA_PASSWORD=$(grep '^HA_SSH_PASSWORD=' "$ENV_FILE" | cut -d= -f2)
else
  echo "ERROR: .env file not found at $ENV_FILE"
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

echo "  Target: root@$HA_HOST:$HA_TARGET"
echo ""

FAILED=0
for card in "${CARDS[@]}"; do
  SRC="$DEPLOY_SOURCE/$card"
  if [[ ! -f "$SRC" ]]; then
    echo "  SKIP (missing): $card"
    continue
  fi

  if sshpass -p "$HA_PASSWORD" scp -o StrictHostKeyChecking=no "$SRC" "root@$HA_HOST:$HA_TARGET$card" 2>/dev/null; then
    echo "  ✓ $card"
  else
    echo "  ✗ FAILED: $card"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "  Deploy complete: ${#CARDS[@]} files → $HA_HOST:$HA_TARGET"
else
  echo "  Deploy finished with $FAILED failures."
  exit 1
fi
