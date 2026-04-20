# TI1A — Local HA Integration Test Harness

## TRANCHE_ID

- `TI1A`

## TITLE

- `Add a local Home Assistant pytest harness and the first targeted backend regression suite`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this is a new tranche inserted between the backend service-proof tranche and the UI tranche
  - it widens scope into repo-level Python packaging and root-level `tests/**`
  - it changes the program order by making local regression coverage a hard dependency before UI and package migration

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI1A — Local HA Integration Test Harness`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-TEST-1`
  - `TINBOX-TEST-2`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI1 Closure And Test-Harness Resequencing`

## GOAL

- Add a reproducible local test environment for `tunet_inbox` and land the first focused tests for manager state transitions, service responses, and canonical event emission.

## WHY_NOW

- The backend runtime is now proven live, but it is still protected only by manual proofs and ad hoc probes.
- The next tranches should not depend on a backend that has no local regression suite.
- This is the narrowest point to add the harness before UI and migration work broaden the surface area.

## USER_VISIBLE_OUTCOME

- Operators can create a local Python test environment with one governed command.
- Operators can run the inbox pytest suite locally with one governed command.
- The repo contains executable tests covering the backend behavior that UI and package tranches will rely on.

## FILES_ALLOWED

- `.gitignore`
- `package.json`
- `pytest.ini`
- `requirements_test.txt`
- `custom_components/__init__.py`
- `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/setup_tunet_inbox_test_env.sh`
- `custom_components/tunet_inbox/scripts/run_tunet_inbox_pytest.sh`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1A_local_ha_integration_test_harness.md`
- `tests/__init__.py`
- `tests/conftest.py`
- `tests/components/__init__.py`
- `tests/components/tunet_inbox/__init__.py`
- `tests/components/tunet_inbox/conftest.py`
- `tests/components/tunet_inbox/test_events.py`
- `tests/components/tunet_inbox/test_manager.py`
- `tests/components/tunet_inbox/test_services.py`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/events.py`
- `custom_components/tunet_inbox/storage.py`
- any file under `custom_components/tunet_inbox/tests/**`

## CURRENT_STATE

- `TI1` is closed and the backend service/event/storage path has live HA proof plus deterministic `lock_conflict` proof.
- There is no repo-level Python test packaging:
  - no `pytest.ini`
  - no test requirements file
  - no isolated venv workflow
- There is no canonical HA-style test tree under `tests/components/tunet_inbox/`.
- The only local backend proof today is the static check harness plus the deterministic runtime probe.

## INTENDED_STATE

- The repo has a governed local Python test harness for `tunet_inbox`.
- Operators can run:
  - `npm run tinbox:test:setup`
  - `npm run tinbox:test`
- The test harness uses:
  - `pytest-homeassistant-custom-component`
  - Home Assistant-style test layout under `tests/components/tunet_inbox/`
  - `asyncio_mode = auto`
  - `enable_custom_integrations`
- The initial suite covers:
  - manager state transitions
  - service responses
  - canonical event emission

## EXACT_CHANGE_IN_ENGLISH

- Add root-level Python test configuration and pinned test requirements.
- Add an isolated local venv setup script using `uv`.
- Add a governed pytest runner script scoped to the inbox suite.
- Add repo-level npm commands for test-env setup and test execution.
- Extend `tinbox:check` so it statically validates the new Python tests and harness files.
- Add HA-style tests under `tests/components/tunet_inbox/` for:
  - manager state transitions
  - service responses
  - canonical event emission
- Add the minimum package marker file needed for custom-component imports during tests.
- Update deploy/test docs and governance docs to reflect the new local test workflow.

## ARCHITECTURAL_INTENTION

- This tranche creates a regression harness around the backend before UI or domain migration depends on it.
- It keeps the first local test investment tightly scoped to the already-frozen backend contract.
- It intentionally does not change backend behavior; it adds reproducible proof and operator workflow around that behavior.

## ACCEPTANCE_CRITERIA

- `requirements_test.txt` exists and pins `pytest-homeassistant-custom-component`.
- `pytest.ini` exists and sets `asyncio_mode = auto`.
- `custom_components/__init__.py` exists for custom-component import compatibility.
- `package.json` contains:
  - `tinbox:test:setup`
  - `tinbox:test`
- `custom_components/tunet_inbox/scripts/setup_tunet_inbox_test_env.sh` exists and creates/updates a local inbox test venv.
- `custom_components/tunet_inbox/scripts/run_tunet_inbox_pytest.sh` exists and runs only the inbox pytest suite.
- `tests/components/tunet_inbox/` exists with targeted tests for:
  - manager state transitions
  - service responses
  - canonical event emission
- `npm run tinbox:check` passes and statically validates the new test files.
- `npm run tinbox:test:setup` passes.
- `npm run tinbox:test` passes.
- Docs sync is complete across:
  - `plan.md`
  - `FIX_LEDGER.md`
  - `handoff.md`
  - `Docs/execution_ledger.md`
  - `Docs/deploy_and_test.md`
  - this tranche doc

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `python3 -m py_compile tests/conftest.py tests/components/tunet_inbox/*.py`
- `bash -n custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `bash -n custom_components/tunet_inbox/scripts/setup_tunet_inbox_test_env.sh`
- `bash -n custom_components/tunet_inbox/scripts/run_tunet_inbox_pytest.sh`
- `npm run tinbox:check`

### Runtime validation

- `npm run tinbox:test:setup`
- `npm run tinbox:test`

### HA/live validation

- none required
- deploy to HA is explicitly out of scope for this tranche

## DEPLOY_IMPACT

- `REPO ONLY`

## ROLLBACK

- revert the repo files touched by `TI1A`
- remove the local inbox test venv directory if created
- re-run `npm run tinbox:check` to confirm the repo is back to the prior backend-only state

## DEPENDENCIES

- `TI1` is closed
- the backend contract in `Docs/contracts.md` is stable
- `uv` and `python3` are available locally

## UNKNOWNS

- whether the latest pinned `pytest-homeassistant-custom-component` release introduces any Python-version or fixture behavior that requires small local config adjustments
- whether the observed `utcnow_iso()` deprecation warning should be addressed in a later hardening tranche

## STOP_CONDITIONS

- stop if implementation requires changing backend runtime behavior rather than only adding harness/test coverage
- stop if package or frontend files become necessary
- stop if the test harness requires introducing a devcontainer or broader repo-wide Python packaging strategy
- stop if the harness cannot run reproducibly with a local venv and pinned requirements

## OUT_OF_SCOPE

- Tunet inbox card
- rehab or standalone dashboard YAML
- OAL migration
- Sonos migration
- backend behavior changes
- diagnostics and repairs

## REVIEW_FOCUS

- reproducibility of the local test environment
- correctness of the HA-style test layout
- targeted coverage of manager/service/event behavior
- operator ergonomics of the new test commands
