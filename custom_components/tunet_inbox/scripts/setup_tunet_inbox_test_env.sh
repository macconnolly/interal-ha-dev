#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
VENV_DIR="${TINBOX_TEST_VENV:-$REPO_ROOT/.venv-tinbox}"
UV_CACHE_DIR="${TINBOX_TEST_UV_CACHE:-$REPO_ROOT/.uv-cache}"
DEFAULT_PYTHON_BIN="$(readlink -f "$(command -v python3)")"
PYTHON_BIN="${TINBOX_TEST_PYTHON:-$DEFAULT_PYTHON_BIN}"

log() {
  printf '[tinbox:test:setup] %s\n' "$*"
}

if ! command -v uv >/dev/null 2>&1; then
  printf '[tinbox:test:setup] missing required command: uv\n' >&2
  exit 1
fi

export UV_CACHE_DIR

log "creating or updating venv at $VENV_DIR"
uv venv "$VENV_DIR" --clear --python "$PYTHON_BIN"

log "installing pinned test dependencies"
uv pip install --python "$VENV_DIR/bin/python" --upgrade pip setuptools wheel
uv pip install --python "$VENV_DIR/bin/python" --prerelease=allow --upgrade -r "$REPO_ROOT/requirements_test.txt"

log "ready"
printf '%s\n' "$VENV_DIR"
