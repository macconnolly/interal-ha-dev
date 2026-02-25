#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# Tunet Local Card Audit Script
# ═══════════════════════════════════════════════════════════════
# Run this from WSL to audit card files across all local copies.
#
# Usage:  bash audit_local.sh > audit_report.txt
# Then paste or push audit_report.txt for review.
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Locations to scan ──────────────────────────────────────────
LOCATIONS=(
  "/mnt/c/Users/Mac Connolly/ha-live - Copy"
  "/mnt/c/Users/Mac Connolly/Code/Design"
)

divider() {
  echo ""
  echo "═══════════════════════════════════════════════════════════════"
  echo "  $1"
  echo "═══════════════════════════════════════════════════════════════"
  echo ""
}

section() {
  echo ""
  echo "─── $1 ───"
  echo ""
}

# ── Audit a single JS card file ───────────────────────────────
audit_js() {
  local f="$1"
  local name
  name=$(basename "$f")
  local lines
  lines=$(wc -l < "$f")
  local bytes
  bytes=$(wc -c < "$f")

  # Version
  local version
  version=$(grep -oP "(?:CARD_VERSION|VERSION|TUNET_\w+_VERSION)\s*=\s*['\"]([^'\"]+)" "$f" | head -1 || echo "none")

  # Custom element tag
  local tag
  tag=$(grep -oP "customElements\.define\(\s*['\"]([^'\"]+)" "$f" | sed "s/customElements.define(['\"]//;s/['\"]//g" | head -1 || echo "")
  if [ -z "$tag" ]; then
    tag=$(grep -oP "registerCard\(\s*['\"]([^'\"]+)" "$f" | sed "s/registerCard(['\"]//;s/['\"]//g" | head -1 || echo "none")
  fi

  # Import count
  local imports
  imports=$(grep -c "^import " "$f" 2>/dev/null || echo "0")

  # Syntax check
  local syntax="SKIP"
  if command -v node &>/dev/null; then
    if node --check "$f" 2>/dev/null; then
      syntax="PASS"
    else
      syntax="FAIL"
    fi
  fi

  # IIFE wrapped?
  local iife="no"
  if head -20 "$f" | grep -q "(function()"; then
    iife="yes"
  fi

  # Has dark mode?
  local darkmode="no"
  if grep -q "\.dark\|darkMode\|dark-mode\|color-scheme:\s*dark" "$f" 2>/dev/null; then
    darkmode="yes"
  fi

  # Has responsive?
  local responsive
  responsive=$(grep -c "@media" "$f" 2>/dev/null || echo "0")

  printf "  %-35s %6s lines  tag=%-28s v=%-8s imports=%s  syntax=%s  iife=%s  dark=%s  @media=%s\n" \
    "$name" "$lines" "$tag" "$version" "$imports" "$syntax" "$iife" "$darkmode" "$responsive"
}

# ── Main ───────────────────────────────────────────────────────
echo "Tunet Local Card Audit — $(date)"
echo "Node: $(node --version 2>/dev/null || echo 'not found')"
echo ""

for loc in "${LOCATIONS[@]}"; do
  divider "$loc"

  if [ ! -d "$loc" ]; then
    echo "  *** DIRECTORY NOT FOUND — skipping ***"
    continue
  fi

  # Git info
  section "Git State"
  if [ -d "$loc/.git" ]; then
    echo "  Branch: $(git -C "$loc" branch --show-current 2>/dev/null || echo 'detached/unknown')"
    echo "  Last commit: $(git -C "$loc" log --oneline -1 2>/dev/null || echo 'unknown')"
    echo "  Dirty: $(git -C "$loc" status --porcelain 2>/dev/null | wc -l) files"
    echo ""
    echo "  Worktrees:"
    git -C "$loc" worktree list 2>/dev/null | sed 's/^/    /' || echo "    none"
  else
    echo "  Not a git repo"
  fi

  # Find all tunet JS card files
  section "JavaScript Card Files"
  local_js_files=()
  while IFS= read -r -d '' f; do
    local_js_files+=("$f")
  done < <(find "$loc" -name "tunet_*.js" -not -path "*/node_modules/*" -not -path "*/.git/*" -print0 2>/dev/null | sort -z)

  if [ ${#local_js_files[@]} -eq 0 ]; then
    echo "  No tunet_*.js files found"
  else
    echo "  Found ${#local_js_files[@]} files:"
    echo ""

    # Group by directory
    local prev_dir=""
    for f in "${local_js_files[@]}"; do
      local dir
      dir=$(dirname "$f" | sed "s|^$loc/||")
      if [ "$dir" != "$prev_dir" ]; then
        echo ""
        echo "  [$dir]"
        prev_dir="$dir"
      fi
      audit_js "$f"
    done
  fi

  # Find YAML configs
  section "YAML Dashboard Configs"
  while IFS= read -r -d '' f; do
    local rel
    rel=$(echo "$f" | sed "s|^$loc/||")
    local lines
    lines=$(wc -l < "$f")
    # Count tunet card references
    local card_refs
    card_refs=$(grep -c "custom:tunet-" "$f" 2>/dev/null || echo "0")
    printf "  %-60s %5s lines  tunet-refs=%s\n" "$rel" "$lines" "$card_refs"
  done < <(find "$loc" -name "*.yaml" -not -path "*/.git/*" -not -path "*/node_modules/*" -print0 2>/dev/null | sort -z | head -z -100)

  # Find HTML mockups
  section "HTML Mockups"
  find "$loc" -name "*.html" -not -path "*/.git/*" -not -path "*/node_modules/*" -print 2>/dev/null | sed "s|^$loc/|  |" | sort | head -30

  # Find markdown docs
  section "Design Documents (*.md)"
  find "$loc" -name "*.md" -not -path "*/.git/*" -not -path "*/node_modules/*" -print 2>/dev/null | sed "s|^$loc/|  |" | sort | head -30

done

divider "CROSS-LOCATION COMPARISON"
echo "Checking for duplicate card files across locations..."
echo ""

# Build a map of card name → locations
declare -A card_map
for loc in "${LOCATIONS[@]}"; do
  [ ! -d "$loc" ] && continue
  while IFS= read -r -d '' f; do
    local name
    name=$(basename "$f")
    local size
    size=$(wc -c < "$f")
    local rel_dir
    rel_dir=$(dirname "$f" | sed "s|^$loc/||")
    local loc_short
    loc_short=$(basename "$loc")
    card_map["$name"]+="  ${loc_short}/${rel_dir}  (${size} bytes)"$'\n'
  done < <(find "$loc" -name "tunet_*.js" -not -path "*/.git/*" -not -path "*/node_modules/*" -print0 2>/dev/null)
done

for card in $(echo "${!card_map[@]}" | tr ' ' '\n' | sort); do
  local count
  count=$(echo "${card_map[$card]}" | grep -c "bytes" || echo "0")
  if [ "$count" -gt 1 ]; then
    echo "  $card — FOUND IN $count LOCATIONS:"
    echo "${card_map[$card]}"
  fi
done

divider "DONE"
echo "Paste this output into the Claude Code session for analysis."
