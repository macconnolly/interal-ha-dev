# TI1 — Service Pipeline And Storage Enforcement

## TRANCHE_ID

- `TI1`

## TITLE

- `Finalize governed service semantics, storage enforcement, timeout recovery, and HA service proof`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `DEFAULT EXECUTION`
- Rationale:
  - the tranche boundary and public contract have already been frozen
  - implementation is now proceeding inside the approved file boundary
  - re-enter planning only if service/event/item contracts or deploy semantics must widen again

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI1 — Service Pipeline And Storage Enforcement`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-TI1-1`
  - `TINBOX-TI1-2`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - all `TI0` deltas must already be recorded before this tranche starts

## GOAL

- Make the `tunet_inbox` backend service/event/storage path production-safe by enforcing the public state machine in code, wiring it into HA bootstrap and repo commands, and proving the service domain live in Home Assistant.

## WHY_NOW

- This is the tranche that separates “scaffold exists” from “backend is trustworthy.”
- The card and package migrations cannot safely begin until this service layer is proven.
- It converts the contract from a documented intention into a validated operating surface.

## USER_VISIBLE_OUTCOME

- There is still no new end-user dashboard surface.
- The operator-visible outcome is:
  - `tunet_inbox` loads in HA
  - the `tunet_inbox` service domain exists
  - queue items can be posted, listed, responded to, failed, resolved, and dismissed through governed service calls
  - stale and conflicting actions are rejected deterministically

## FILES_ALLOWED

- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/const.py`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/storage.py`
- `custom_components/tunet_inbox/events.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/services.yaml`
- `custom_components/tunet_inbox/manifest.json`
- `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1_service_pipeline_and_storage_enforcement.md`
- `package.json`
- `Configuration/configuration.yaml`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `HA-References/**`
- `custom_components/tunet_inbox/tests/**`
- `custom_components/tunet_inbox/config_flow.py`
- `custom_components/tunet_inbox/diagnostics.py`
- `custom_components/tunet_inbox/translations/**`
- `custom_components/tunet_inbox/brand/**`

## CURRENT_STATE

- `TI0` is closed with governance, package wiring, YAML bootstrap, and static validation in place.
- The backend is now deployed to the live HA host and the `tunet_inbox` domain has been observed loading during startup.
- HA/live proof now exists for:
  - service-domain registration
  - smoke discovery of all six public services
  - governed `post -> list_items -> respond -> fail(return_to_pending) -> respond -> resolve`
  - governed `dismiss`
  - `respond` rejection for:
    - `item_not_found`
    - `invalid_action`
    - `expired`
    - `not_pending`
- The literal `lock_conflict` branch has now been proven by the deterministic local runtime probe in `scripts/tunet_inbox_runtime_probe.py`.
- Package and card tranches remain intentionally blocked.

## INTENDED_STATE

- `tunet_inbox` registers its six public services in HA.
- The queue persists and restores correctly through the storage layer.
- `respond` enforces:
  - item existence
  - pending-only acceptance
  - action allowlisting
  - expiry checks
  - lock conflict checks
- accepted responses emit exactly one `tunet_inbox_action`.
- queue mutations emit `tunet_inbox_updated`.
- startup reconcile and periodic sweep handle:
  - expired pending items
  - timed-out responding items
- operator commands work:
  - `npm run tinbox:check`
  - `npm run tinbox:deploy:integration`
  - `npm run tinbox:smoke`

## EXACT_CHANGE_IN_ENGLISH

- Align backend runtime code with the documented service, event, item, and state-machine contract.
- Correct the runtime contract so:
  - render text fields accept normal user-facing strings
  - response sources are validated
  - dismiss clears the matching mobile prompt when configured
  - responding-timeout recovery emits queue refresh events
  - helper-driven mobile targets resolve to `notify.mobile_app_<device_id>`
- Harden the deploy helper so it:
  - backs up remote `configuration.yaml`
  - patches only the governed `tunet_inbox` bootstrap/logger fragments
  - avoids overwriting unrelated remote dashboard/resource changes
- Ensure `post`, `respond`, `resolve`, `fail`, `dismiss`, and `list_items` use deterministic response payloads.
- Ensure timeout recovery and startup reconcile are explicit and testable.
- Prove the service domain exists in HA via the smoke script.
- Record live validation evidence in the docs after execution.

## ARCHITECTURAL_INTENTION

- This tranche validates the backend as an operational subsystem before the UI and package layers depend on it.
- It is the contract-proof tranche for the service layer.
- It also deliberately keeps package and frontend scope out so the backend can be reviewed on its own merits.

## ACCEPTANCE_CRITERIA

- `package.json` contains:
  - `tinbox:check`
  - `tinbox:deploy:integration`
  - `tinbox:smoke`
- `Configuration/configuration.yaml` contains:
  - `tunet_inbox:` block
  - logger entries for `custom_components.tunet_inbox`
- `python3 -m py_compile custom_components/tunet_inbox/*.py` passes.
- `bash custom_components/tunet_inbox/scripts/check_tunet_inbox.sh` passes.
- `node --check custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs` passes.
- after deploy + restart:
  - `npm run tinbox:smoke` passes
  - `/api/services` contains `tunet_inbox`
  - the following services exist:
    - `post`
    - `respond`
    - `resolve`
    - `fail`
    - `dismiss`
    - `list_items`
- `respond` rejects:
  - missing item
  - non-pending item
  - expired item
  - invalid action
  - lock conflict
- `respond` accepts a valid action exactly once per `item_id`.
- `resolve`, `fail`, and `dismiss` produce deterministic queue state transitions and update events.
- `execution_ledger.md`, `handoff.md`, and `FIX_LEDGER.md` are updated with the tranche outcome.

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `node --check custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- `bash custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `npm run tinbox:probe:runtime`

### Runtime validation

- `npm run tinbox:check`
- inspect script output for:
  - manifest parse
  - governance docs presence
  - YAML parse success
- perform local code review against `Docs/contracts.md`

### HA/live validation

- `npm run tinbox:deploy:integration`
- restart HA
- `npm run tinbox:smoke`
- use Developer Tools to inspect the `tunet_inbox` service domain
- optionally post a controlled test item and verify it appears in `list_items`

## DEPLOY_IMPACT

- `HA RESTART`
- Reason:
  - Python integration files and `Configuration/configuration.yaml` are both in scope

## ROLLBACK

- revert repo files changed by `TI1`
- restore the latest backup created by `deploy_tunet_inbox.sh`
- restart HA
- re-run `npm run tinbox:smoke`

## DEPENDENCIES

- `TI0` is closed
- `.env` resolution path works
- remote HA host is reachable
- the active public contract in `Docs/contracts.md` is accepted before code execution begins

## UNKNOWNS

- whether any HA runtime nuance forces small service-registration adjustments after first smoke run
- whether `notify_device_helper` should remain helper-driven or move to a direct notify service default later
- whether additional logging granularity will be needed before package migration

## STOP_CONDITIONS

- stop if the public contract must change materially to make the backend run
- stop if implementation requires touching `Dashboard/Tunet/**`
- stop if implementation requires touching package YAML
- stop if successful smoke depends on adding diagnostics, config flow, or tests outside this tranche
- stop if deploy/restart safety cannot be achieved with the scoped integration deploy helper

## OUT_OF_SCOPE

- Tunet inbox card
- rehab dashboard YAML
- standalone inbox dashboard
- OAL migration
- Sonos migration
- diagnostics
- repairs
- config flow

## REVIEW_FOCUS

- service contract fidelity
- state-machine enforcement
- lock/race behavior
- storage and timeout behavior
- operator safety of deploy and smoke workflow
