#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
VENV_DIR="${TINBOX_TEST_VENV:-$REPO_ROOT/.venv-tinbox}"

if [[ ! -x "$VENV_DIR/bin/python" ]]; then
  printf '[tinbox:test] missing test venv at %s\n' "$VENV_DIR" >&2
  printf '[tinbox:test] run npm run tinbox:test:setup first\n' >&2
  exit 1
fi

export PYTHONPATH="$REPO_ROOT${PYTHONPATH:+:$PYTHONPATH}"
exec "$VENV_DIR/bin/python" -m pytest tests/components/tunet_inbox "$@"
