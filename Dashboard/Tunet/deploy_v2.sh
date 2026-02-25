#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Tunet v2 Deploy Script
# ═══════════════════════════════════════════════════════════════
# Deploys bundled v2 cards to Home Assistant instance.
#
# Usage:
#   ./deploy_v2.sh              # Deploy to default HA host
#   ./deploy_v2.sh 10.0.0.21   # Deploy to specific host
#   ./deploy_v2.sh --dry-run    # Show what would be deployed
#
# Prerequisites:
#   - SSH access to HA instance (key-based auth recommended)
#   - Node.js (for bundle step)
#
# What it does:
#   1. Re-bundles v2 cards (node Cards/v2/bundle.js)
#   2. Creates /config/www/tunet/dist/ on HA if needed
#   3. Backs up existing dist/ on HA
#   4. Copies bundled cards via SCP
#   5. Prints cache-bust URLs for Lovelace resources
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DIST_DIR="${SCRIPT_DIR}/Cards/dist"
BUNDLE_SCRIPT="${SCRIPT_DIR}/Cards/v2/bundle.js"

# ── Config ─────────────────────────────────────────────────────
HA_HOST="${1:-10.0.0.21}"
HA_USER="root"
HA_WWW_DIR="/config/www/tunet/dist"
CACHE_VERSION="2.0.$(date +%s)"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  HA_HOST="10.0.0.21"
fi

echo "═══════════════════════════════════════════════════"
echo "  Tunet v2 Deploy"
echo "═══════════════════════════════════════════════════"
echo "  Host:    ${HA_USER}@${HA_HOST}"
echo "  Target:  ${HA_WWW_DIR}"
echo "  Version: ${CACHE_VERSION}"
echo "  Dry run: ${DRY_RUN}"
echo "═══════════════════════════════════════════════════"
echo ""

# ── Step 1: Bundle ─────────────────────────────────────────────
echo "▸ Step 1: Bundling v2 cards..."
node "${BUNDLE_SCRIPT}"
echo ""

# ── Step 2: Validate ──────────────────────────────────────────
echo "▸ Step 2: Validating syntax..."
errors=0
for f in "${DIST_DIR}"/tunet_*_card.js; do
  if ! node --check "$f" 2>/dev/null; then
    echo "  ✗ $(basename "$f")"
    errors=$((errors + 1))
  else
    echo "  ✓ $(basename "$f")"
  fi
done
if [ "$errors" -gt 0 ]; then
  echo "ERROR: ${errors} cards failed syntax check. Aborting."
  exit 1
fi
echo ""

# ── Step 3: Deploy ─────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
  echo "▸ Step 3: DRY RUN — would deploy these files:"
  ls -la "${DIST_DIR}"/tunet_*_card.js
  echo ""
  echo "  To: ${HA_USER}@${HA_HOST}:${HA_WWW_DIR}/"
else
  echo "▸ Step 3: Creating remote directory..."
  ssh "${HA_USER}@${HA_HOST}" "mkdir -p ${HA_WWW_DIR}"

  echo "▸ Step 3b: Backing up existing cards..."
  BACKUP_DIR="/config/www/tunet/dist.bak.$(date +%Y%m%d_%H%M%S)"
  ssh "${HA_USER}@${HA_HOST}" "if [ -d ${HA_WWW_DIR} ] && [ \"\$(ls -A ${HA_WWW_DIR} 2>/dev/null)\" ]; then cp -r ${HA_WWW_DIR} ${BACKUP_DIR}; echo 'Backed up to ${BACKUP_DIR}'; else echo 'No existing files to backup'; fi"

  echo "▸ Step 3c: Deploying bundled cards..."
  scp "${DIST_DIR}"/tunet_*_card.js "${HA_USER}@${HA_HOST}:${HA_WWW_DIR}/"
  echo "  ✓ Deployed $(ls "${DIST_DIR}"/tunet_*_card.js | wc -l) cards"
fi
echo ""

# ── Step 4: Resource URLs ─────────────────────────────────────
echo "▸ Step 4: Lovelace resource URLs (update cache-bust version):"
echo ""
for f in "${DIST_DIR}"/tunet_*_card.js; do
  name=$(basename "$f")
  echo "  /local/tunet/dist/${name}?v=${CACHE_VERSION}"
done
echo ""
echo "═══════════════════════════════════════════════════"
echo "  Deploy complete. Clear browser cache or update"
echo "  ?v= parameters in Lovelace resources."
echo "═══════════════════════════════════════════════════"
