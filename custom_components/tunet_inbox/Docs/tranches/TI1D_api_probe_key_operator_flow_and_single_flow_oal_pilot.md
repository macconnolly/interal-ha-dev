# TI1D — API Probe, Key-Addressable Operator Flow, And Single-Flow OAL Pilot

## TRANCHE_ID

- `TI1D`

## TITLE

- API probe, key-addressable operator flow, and single-flow OAL pilot.

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `DEFAULT EXECUTION`
- The tranche has already been promoted in `plan.md`, its purpose is frozen, and the current work stays inside a bounded backend/operator file set.
- Re-enter planning mode only if:
  - the public service contract changes beyond `item_id or key`
  - more than one OAL flow is proposed
  - Tunet UI files become necessary
  - Sonos migration is pulled forward

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`

## GOAL

- Prove that `tunet_inbox` can be operated through the live HA API without Tunet UI, and land one real OAL pilot flow that uses the governed backend path.

## WHY_NOW

- The backend is already productized and tested, but the recovery goal is still unproven without a real operator surface.
- A narrow API-first pilot proves the service/event contract before any Tunet UI work widens scope.

## USER_VISIBLE_OUTCOME

- An operator can interact with `tunet_inbox` through the HA API using the long-lived token from `.env`.
- One real OAL notification flow can be posted, responded to, and resolved through `tunet_inbox` without relying on raw mobile action events.

## FILES_ALLOWED

- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/services.yaml`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/config_flow.py`
- `custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- `custom_components/tunet_inbox/scripts/tunet_inbox_api_probe.mjs`
- `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `tests/components/tunet_inbox/test_services.py`
- `tests/components/tunet_inbox/test_events.py`
- `tests/components/tunet_inbox/test_manager.py`
- `tests/components/tunet_inbox/test_mobile.py`
- `tests/components/tunet_inbox/test_config_flow.py`
- `package.json`
- `packages/oal_lighting_control_package.yaml`
- `Configuration/configuration.yaml`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/sonos_package.yaml`
- any other `packages/*.yaml`
- any repo-root dashboards outside explicit operator documentation

## CURRENT_STATE

- `tunet_inbox` backend services exist, are deployed, and have live HA proof.
- `respond`, `resolve`, `fail`, and `dismiss` remain item-instance-oriented in the operator path, which makes manual API interaction awkward when the operator only knows the logical key.
- No token-backed API probe helper exists yet.
- No real OAL flow has been migrated to the governed backend path.
- The runtime accepts explicit `notify.*` service strings for mobile routing, and the active contract/docs now state that explicitly.
- Backend tests now cover:
  - direct `notify.*` passthrough
  - helper-backed mobile target resolution
  - blank-target rejection
- Live proof now exists for:
  - key-addressable operator service support
  - token-backed API probe
  - one real OAL pilot flow
- Functional tranche goals are complete.
- The remaining import-precedence defect was carried forward as non-blocking supportability debt instead of holding this tranche open.

## INTENDED_STATE

- `tunet_inbox` operator services accept `item_id` or `key` where contractually appropriate.
- A governed API probe script can exercise list/post/respond/resolve behavior against live HA using `.env`.
- The OAL override reminder flow is migrated as the only real pre-UI pilot.
- The notify-target contract is explicit: helper entity or direct `notify.*` service, with notify groups recommended for multi-device delivery.

## EXACT_CHANGE_IN_ENGLISH

- Add key-addressable service resolution for operator-facing actions.
- Add a token-backed live API probe script.
- Migrate only the OAL override reminder flow to `tunet_inbox`.
- Clarify notify-target semantics in config/options/operator docs.
- Add backend tests for operator addressing and notify-target resolution.

## ARCHITECTURAL_INTENTION

- This tranche creates the narrow seam between “backend exists” and “UI exists.”
- It proves that the integration contract is usable from a real operator surface before a Tunet card locks in UX and workflow assumptions.

## ACCEPTANCE_CRITERIA

- `custom_components/tunet_inbox/Docs/tranches/TI1D_api_probe_key_operator_flow_and_single_flow_oal_pilot.md` exists.
- `tunet_inbox` operator-facing services support `item_id` or `key` where declared by contract.
- a token-backed API probe exists and runs against live HA.
- the OAL override reminder is the only migrated flow in this tranche.
- import-sourced `tunet_inbox` config must apply the imported default notify target even when stale options exist from earlier runs.
- the OAL override reminder pilot must generate a true UTC `expires_at` so live operator responses are not rejected as immediately expired.
- notify-target docs explicitly state that the default target may be either:
  - a helper entity containing a mobile-app device id
  - a direct `notify.*` service such as a notify group
- no `Dashboard/Tunet/**` files change.
- no Sonos package files change.

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `python3 -m py_compile tests/components/tunet_inbox/*.py`
- `node --check custom_components/tunet_inbox/scripts/tunet_inbox_api_probe.mjs`
- `npm run tinbox:check`

### Runtime validation

- `npm run tinbox:test`
- operator path rejects invalid `key` and stale references correctly
- mobile routing tests prove:
  - direct `notify.*` is passed through unchanged
  - helper entity ids map to `notify.mobile_app_<device_id>`
  - blank target remains invalid

### HA/live validation

- token-backed API probe succeeds against live HA
- migrated OAL pilot can be posted and resolved through the governed path
- migrated OAL pilot can deliver to the configured notify group without `mobile_send_failed`
- on the next planned HA code reload or restart, import-sourced config-entry options are cleared or normalized so overlapping stale options no longer override imported YAML defaults
- if backend Python changes are deployed, post-deploy smoke passes

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`
- `HA RESTART` if Python integration code changes concurrently

## ROLLBACK

- revert the changed backend/operator files
- revert the OAL pilot package section if migrated
- if deployed:
  - restore the latest integration backup
  - restore the touched package backup
  - restart HA if Python changed
  - re-run `npm run tinbox:smoke`

## DEPENDENCIES

- `TI1C` is closed
- `.env` resolves a valid long-lived HA token
- the hardened backend deploy/smoke path is already proven

## UNKNOWNS

- whether the OAL override reminder needs any small runtime adjustments once the pilot runs against the live package set
- whether the service path should accept `key` only for terminal/operator actions or also for future query helpers

## STOP_CONDITIONS

- stop if the pilot requires touching any Tunet frontend file
- stop if more than one OAL flow becomes necessary
- stop if the service/event contract needs broader redesign beyond key-addressable operator support
- stop if Sonos migration becomes entangled with the pilot

## OUT_OF_SCOPE

- Tunet inbox card
- rehab dashboard YAML
- standalone inbox dashboard
- Sonos migration
- broader OAL TV/timer migration
- notification history/audit UI

## REVIEW_FOCUS

- operator-path contract fidelity
- API probe safety
- single-flow pilot containment
- notify-target clarity and multi-device guidance
