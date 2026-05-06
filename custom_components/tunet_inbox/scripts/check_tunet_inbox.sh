#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
INBOX_ROOT="$REPO_ROOT/custom_components/tunet_inbox"

log() {
  printf '[tinbox:check] %s\n' "$*"
}

require_file() {
  local path="$1"
  [[ -f "$path" ]] || {
    printf '[tinbox:check] missing required file: %s\n' "$path" >&2
    exit 1
  }
}

log "checking governance files"
require_file "$INBOX_ROOT/AGENTS.md"
require_file "$INBOX_ROOT/plan.md"
require_file "$INBOX_ROOT/handoff.md"
require_file "$INBOX_ROOT/FIX_LEDGER.md"
require_file "$INBOX_ROOT/Docs/execution_ledger.md"
require_file "$INBOX_ROOT/Docs/contracts.md"
require_file "$INBOX_ROOT/Docs/deploy_and_test.md"
require_file "$INBOX_ROOT/Docs/TRANCHE_TEMPLATE.md"
require_file "$INBOX_ROOT/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md"
require_file "$INBOX_ROOT/Docs/tranches/TI1_service_pipeline_and_storage_enforcement.md"
require_file "$INBOX_ROOT/Docs/tranches/TI1A_local_ha_integration_test_harness.md"
require_file "$INBOX_ROOT/Docs/tranches/TI1B_integration_productization_and_supportability.md"
require_file "$INBOX_ROOT/Docs/tranches/TI1C_corruption_quarantine_repairs_and_release_verification.md"
require_file "$REPO_ROOT/custom_components/__init__.py"
require_file "$REPO_ROOT/pytest.ini"
require_file "$REPO_ROOT/requirements_test.txt"
require_file "$INBOX_ROOT/config_flow.py"
require_file "$INBOX_ROOT/diagnostics.py"
require_file "$INBOX_ROOT/translations/en.json"
require_file "$INBOX_ROOT/scripts/verify_tunet_inbox_release.sh"
require_file "$REPO_ROOT/tests/components/tunet_inbox/test_repairs.py"

log "python syntax check"
python3 -m py_compile "$INBOX_ROOT"/*.py
python3 -m py_compile "$INBOX_ROOT"/scripts/tunet_inbox_runtime_probe.py
python3 -m py_compile "$REPO_ROOT/custom_components/__init__.py"
python3 -m py_compile "$REPO_ROOT/tests"/conftest.py "$REPO_ROOT/tests/components/tunet_inbox"/*.py

log "shell syntax check"
bash -n \
  "$INBOX_ROOT/scripts/check_tunet_inbox.sh" \
  "$INBOX_ROOT/scripts/deploy_tunet_inbox.sh" \
  "$INBOX_ROOT/scripts/setup_tunet_inbox_test_env.sh" \
  "$INBOX_ROOT/scripts/run_tunet_inbox_pytest.sh" \
  "$INBOX_ROOT/scripts/verify_tunet_inbox_release.sh"

log "manifest json check"
python3 - <<'PY' "$INBOX_ROOT/manifest.json" "$INBOX_ROOT/translations/en.json"
import json
import pathlib
import sys

for arg in sys.argv[1:]:
    path = pathlib.Path(arg)
    with path.open("r", encoding="utf-8") as handle:
        json.load(handle)
    print(f"{path.name}: ok")
PY

log "yaml parse check"
python3 - <<'PY' "$REPO_ROOT/Configuration/configuration.yaml" "$INBOX_ROOT/services.yaml"
import pathlib
import sys

import yaml

class HALoader(yaml.SafeLoader):
    pass

def _construct_passthrough(loader, node):
    if isinstance(node, yaml.ScalarNode):
        return loader.construct_scalar(node)
    if isinstance(node, yaml.SequenceNode):
        return loader.construct_sequence(node)
    if isinstance(node, yaml.MappingNode):
        return loader.construct_mapping(node)
    raise TypeError(f"Unsupported YAML node: {type(node)!r}")

HALoader.add_multi_constructor("!", lambda loader, suffix, node: _construct_passthrough(loader, node))

for arg in sys.argv[1:]:
    path = pathlib.Path(arg)
    with path.open("r", encoding="utf-8") as handle:
        yaml.load(handle, Loader=HALoader)
    print(f"{path.name}: ok")
PY

log "done"
