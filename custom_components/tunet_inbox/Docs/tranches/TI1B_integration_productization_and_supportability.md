# TI1B — Integration Productization And Supportability

## TRANCHE_ID

- `TI1B`

## TITLE

- `Finish the backend integration shape before any dashboard work begins`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche changes the backend packaging and setup model
  - it widens the public integration shape without touching package migrations
  - it must freeze the backend again before any UI tranche starts

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI1B — Integration Productization And Supportability`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-PROD-1`
  - `TINBOX-PROD-2`

## GOAL

- Convert `tunet_inbox` from a governed backend prototype into a supportable custom integration with config-entry setup, diagnostics coverage, translation-backed UI strings, hardened metadata, and warning-free local tests.

## WHY_NOW

- The backend is functionally real, but it is still shaped like an internal prototype.
- The dashboard work should not start while the integration itself is missing supportability basics.
- OAL/Sonos migrations should target the finalized integration shape, not a pre-productization runtime.

## USER_VISIBLE_OUTCOME

- `tunet_inbox` can be configured through the Home Assistant UI and imported from existing YAML bootstrap.
- diagnostics are available for active queue state
- the integration surfaces proper config/options labels instead of raw internal field keys
- local pytest runs without the tracked UTC deprecation warning

## FILES_ALLOWED

- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/const.py`
- `custom_components/tunet_inbox/manifest.json`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/services.yaml`
- `custom_components/tunet_inbox/storage.py`
- `custom_components/tunet_inbox/config_flow.py`
- `custom_components/tunet_inbox/diagnostics.py`
- `custom_components/tunet_inbox/translations/en.json`
- `tests/components/tunet_inbox/conftest.py`
- `tests/components/tunet_inbox/test_services.py`
- `tests/components/tunet_inbox/test_config_flow.py`
- `tests/components/tunet_inbox/test_diagnostics.py`
- `requirements_test.txt`
- `package.json`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1B_integration_productization_and_supportability.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- any new dashboard YAML surface

## CURRENT_STATE

- YAML bootstrap works and imports a governed manager directly.
- The service/event path is live-proven and locally tested.
- The integration has no config-entry setup path.
- There is no diagnostics surface.
- The local pytest suite still reports the tracked `utcnow_iso()` deprecation warning.

## INTENDED_STATE

- `tunet_inbox` supports a single config entry plus YAML import into that config entry.
- services and event listeners remain globally governed and still route through one active manager.
- diagnostics export redacted queue/config state.
- translation-backed config flow and options flow strings exist.
- manifest metadata no longer uses placeholder documentation URLs.
- local test suite is warning-clean for the tracked UTC helper.

## EXACT_CHANGE_IN_ENGLISH

- Add `config_flow.py` and enable `config_flow` in the manifest.
- Convert YAML bootstrap into import-to-config-entry instead of direct runtime setup.
- Keep the current backend contract intact while moving runtime ownership to the config entry.
- Add diagnostics support and tests.
- Add translation-backed config/options strings.
- Remove the `datetime.utcnow()` usage from `utcnow_iso()`.
- Do not start any Tunet card or dashboard work in this tranche.

## ACCEPTANCE_CRITERIA

- a user flow can create the single `tunet_inbox` config entry
- YAML import creates or reuses the same single config entry
- the runtime still registers the same six services and two public events
- diagnostics return redacted integration state
- `npm run tinbox:check` passes
- `npm run tinbox:test` passes
- the prior `utcnow_iso()` deprecation warning is gone
- docs sync is complete for all touched inbox docs

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `npm run tinbox:check`

### Runtime validation

- `npm run tinbox:test`
- targeted local proof for:
  - config flow create-entry
  - YAML import path
  - diagnostics export

### HA/live validation

- `npm run tinbox:deploy:integration`
- restart HA
- `npm run tinbox:smoke`
- confirm `tunet_inbox` still loads from the existing YAML bootstrap after the import path changes

## DEPLOY_IMPACT

- `HA RESTART`

## ROLLBACK

- restore the previous integration files from the local backup
- if config-entry setup regresses, keep the YAML bootstrap in place and revert the import path changes
- restart HA
- rerun `npm run tinbox:smoke`

## STOP_CONDITIONS

- stop if config-entry conversion requires changing the public service or event contract
- stop if diagnostics require widening into dashboard files
- stop if YAML import cannot coexist safely with the current deploy/bootstrap model

## OUT_OF_SCOPE

- Tunet inbox card
- rehab dashboard YAML
- standalone inbox dashboard
- OAL migration
- Sonos migration
