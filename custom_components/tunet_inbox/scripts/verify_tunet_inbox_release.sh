#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"

log() {
  printf '[tinbox:verify] %s\n' "$*"
}

cd "$REPO_ROOT"

log "running static governance and backend checks"
npm run tinbox:check

log "running targeted local HA integration tests"
npm run tinbox:test

log "running deterministic runtime probe"
npm run tinbox:probe:runtime

log "backend release verification passed"
