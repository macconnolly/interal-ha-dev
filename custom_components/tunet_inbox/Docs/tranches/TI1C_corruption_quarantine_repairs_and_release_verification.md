# TI1C — Corruption Quarantine, Repairs, And Release Verification

## TRANCHE_ID

- `TI1C`

## TITLE

- `Close the remaining backend production blocker before any UI work starts`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche changes the persisted-state supportability model
  - it introduces repair surfacing and a new operator verification contract
  - it is an intentional program-order exception that must be frozen before coding

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI1C — Corruption Quarantine, Repairs, And Release Verification`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI1B implementation And TI1C promotion`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-PROD-3`
  - `TINBOX-PROD-4`

## GOAL

- Ensure malformed persisted inbox state is quarantined and surfaced through repairs, then add one governed local release-verification path for the backend.

## WHY_NOW

- The backend is productized, but it still violates a locked governance rule by logging and skipping malformed persisted items.
- Starting UI work before fixing that would put a renderer on top of a backend that can silently drop corrupted state.
- The release-verification path should exist before the next tranche widens into frontend or package migration.

## USER_VISIBLE_OUTCOME

- Corrupted persisted inbox entries no longer disappear silently on startup.
- Home Assistant surfaces a repair issue when quarantined inbox state exists.
- Operators can run one backend verification command locally before deploy.

## FILES_ALLOWED

- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/const.py`
- `custom_components/tunet_inbox/diagnostics.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/storage.py`
- `custom_components/tunet_inbox/manifest.json`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/run_tunet_inbox_pytest.sh`
- `custom_components/tunet_inbox/scripts/verify_tunet_inbox_release.sh`
- `custom_components/tunet_inbox/translations/en.json`
- `tests/components/tunet_inbox/conftest.py`
- `tests/components/tunet_inbox/test_diagnostics.py`
- `tests/components/tunet_inbox/test_manager.py`
- `tests/components/tunet_inbox/test_repairs.py`
- `package.json`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1C_corruption_quarantine_repairs_and_release_verification.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- any dashboard YAML surface
- any widening of the public `tunet_inbox` service or event contract

## CURRENT_STATE

- `manager.py` logs malformed persisted active items during restore and increments `restore_stats`, but does not keep the bad payload anywhere.
- `storage.py` persists only `active_items`, `archive_items`, `last_reconcile_at`, and `last_prune_at`.
- `diagnostics.py` exposes current runtime state but has no quarantine summary.
- there is no repair issue if restore corruption is detected.
- operators currently run `tinbox:check`, `tinbox:test`, and `tinbox:probe:runtime` separately.

## INTENDED_STATE

- restore-time corruption is captured into a persisted quarantine collection with error metadata and a redacted diagnostics summary.
- a repair issue is created when the quarantine collection is non-empty and removed when the collection is empty again.
- one local operator command runs the governed backend verification sequence before deploy.
- the public service and event contract remains unchanged.

## EXACT_CHANGE_IN_ENGLISH

- Extend storage to persist a quarantine collection for malformed restored items.
- Capture malformed active and archive payloads into quarantine records instead of only logging them.
- Surface quarantine presence through Home Assistant Repairs.
- Extend diagnostics to report quarantine counts and redacted quarantine samples.
- Add targeted tests for restore quarantine and repair issue lifecycle.
- Add one release-verification script and npm command that run `tinbox:check`, `tinbox:test`, and `tinbox:probe:runtime`.

## ARCHITECTURAL_INTENTION

- The inbox backend is the control plane. It cannot silently discard corrupted state and still satisfy its governance contract.
- Repairs and quarantine keep corruption handling inside the backend instead of leaking it into the future card or package logic.
- The release-verification command gives later tranches one stable backend gate instead of ad hoc operator sequencing.

## ACCEPTANCE_CRITERIA

- malformed restored active items are persisted into quarantine with an error reason
- malformed restored archive items are persisted into quarantine with an error reason
- diagnostics return quarantine count and redacted quarantine sample data
- a repair issue exists when quarantine is non-empty
- the repair issue clears when quarantine is empty
- `npm run tinbox:verify` passes locally
- `npm run tinbox:check` passes
- `npm run tinbox:test` passes

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `npm run tinbox:check`

### Runtime validation

- `npm run tinbox:test`
- targeted local proof for:
  - malformed restore quarantine
  - repair issue creation/clear
  - `tinbox:verify`

### HA/live validation

- `npm run tinbox:deploy:integration`
- restart HA
- `npm run tinbox:smoke`
- confirm the integration still loads cleanly with the new quarantine storage shape

## DEPLOY_IMPACT

- `HA RESTART`

## ROLLBACK

- restore the previous integration files from the local backup
- if the quarantine storage shape regresses runtime restore, restore the previous `.storage/tunet_inbox` backup on HA if needed
- restart HA
- rerun `npm run tinbox:smoke`

## DEPENDENCIES

- `TI1B` must be closed
- no Tunet UI files may be active in this tranche

## UNKNOWNS

- whether any existing live `.storage/tunet_inbox` payloads need one-time migration handling beyond additive quarantine fields
- whether repair issue translation strings need placeholders beyond a simple quarantined-item count

## STOP_CONDITIONS

- stop if quarantine support requires changing the public service or event contract
- stop if repair surfacing requires widening into dashboard or package files
- stop if storage migration would destroy existing active queue state

## OUT_OF_SCOPE

- Tunet inbox card
- rehab dashboard YAML
- standalone inbox dashboard
- OAL migration
- Sonos migration
- HACS packaging

## REVIEW_FOCUS

- restore-path corruption handling
- repair issue lifecycle correctness
- storage compatibility
- diagnostics redaction
- operator verification path correctness
