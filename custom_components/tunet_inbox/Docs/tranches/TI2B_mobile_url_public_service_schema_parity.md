# TI2B — mobile.url Public Service-Schema Parity

## TRANCHE_ID

- `TI2B`

## TITLE

- `Make the public tunet_inbox.post service accept the already-supported mobile.url field and prove it live`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche changes a public backend contract
  - it is a control tranche inserted between a blocked package migration and the next implementation pass
  - it must freeze a narrow file boundary so the unblock work does not drift back into OAL package changes

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI2B — mobile.url Public Service-Schema Parity`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI3 stop condition — mobile.url service-schema blocker`
  - `TI2B planning freeze — narrow backend unblock tranche`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-CONTRACT-2`
- `custom_components/tunet_inbox/Docs/contracts.md`
  - current live compatibility surface for `mobile.url`

## GOAL

- Align the public `tunet_inbox.post` service schema with the already-supported `mobile.url` model/mobile path so the existing inbox tap-through behavior is live-proven as a narrow compatibility surface.

## WHY_NOW

- `TI3` is blocked on exactly one known backend mismatch.
- The blocker is narrow, isolated, and already proven live.
- Fixing it now restores a clean path back to the frozen OAL authoritative cutover without reopening broader planning.

## USER_VISIBLE_OUTCOME

- A live `tunet_inbox.post` call with `mobile.url: "/tunet-inbox-yaml/inbox"` succeeds through the public service path.
- The resulting mobile notification can still deep-link to the inbox dashboard when tapped.
- `TI2C` can start from a clean parity baseline without reopening package scope.

## FILES_ALLOWED

- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/services.yaml`
- `tests/components/tunet_inbox/test_services.py`
- `tests/components/tunet_inbox/test_mobile.py`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI2B_mobile_url_public_service_schema_parity.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `Dashboard/Tunet/**`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/__init__.py`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `models.py` accepts `mobile.url` through `InboxMobileConfig`.
- `mobile.py` forwards `item.mobile.url` into the mobile notification payload.
- `services.py` public `MOBILE_SCHEMA` accepts `mobile.url`.
- `services.yaml` exposes `mobile.url` in the operator-facing `post` service contract.
- `Docs/contracts.md` and `Docs/deploy_and_test.md` record `mobile.url` as the current live compatibility surface, not the durable contract decision.
- Local validation passed:
  - `python3 -m py_compile custom_components/tunet_inbox/*.py`
  - `python3 -m py_compile tests/components/tunet_inbox/*.py`
  - `npm run tinbox:check`
  - `npm run tinbox:test` -> `21 passed`
- Live HA proof passed after integration-only deploy and HA restart:
  - `npm run tinbox:smoke`
  - `tunet_inbox.post` with `mobile.url` returned `accepted: true`
  - `tunet_inbox.list_items` showed stored `mobile.url: "/tunet-inbox-yaml/inbox"`
  - the proof item was cleaned up
- `TI2C` is now the contract-control tranche that owns the durable inbox-tap decision.

## INTENDED_STATE

- The public `tunet_inbox.post` service accepts `mobile.url`.
- Service metadata in `services.yaml` exposes the field to operators.
- Local HA-style tests prove the service boundary accepts and persists `mobile.url`.
- Live HA proof confirms the public service call succeeds with `mobile.url`.
- `TI2B` is closed as a parity patch that unblocks the next control tranche.

## EXACT_CHANGE_IN_ENGLISH

- Add `url` to the public `MOBILE_SCHEMA` in `services.py`.
- Keep `extra=vol.PREVENT_EXTRA`; do not widen any other service fields.
- Update `services.yaml` so `post` documents the `mobile` object including `url`.
- Add a service-boundary regression test proving `tunet_inbox.post` accepts `mobile.url` and persists it.
- Optionally add one stronger service-to-mobile test if needed, but only if the service-boundary test leaves ambiguity.
- Update governance docs to:
  - close `TINBOX-CONTRACT-2` when the fix is proven
  - record `TI2B` as the closed parity patch that precedes `TI2C`

## ARCHITECTURAL_INTENTION

- The queue contract must not differ across:
  - docs
  - service validation
  - model validation
  - runtime mobile delivery
- This tranche restores a single governed truth for `mobile.url`.
- It intentionally does not decide the durable inbox-tap ownership boundary.
- That ownership decision is explicitly deferred to `TI2C`.

## ACCEPTANCE_CRITERIA

- `services.py` public `MOBILE_SCHEMA` accepts `url`
- `services.yaml` documents `mobile.url` for `tunet_inbox.post`
- local HA-style tests pass with a service-boundary case that includes `mobile.url`
- live `tunet_inbox.post` with `mobile.url` succeeds against HA
- the resulting item stores `mobile.url`
- `TINBOX-CONTRACT-2` is closed in governance docs
- `TI2B` is recorded as a parity patch, not the final tap-contract architecture
- no package files were changed in this tranche

## VALIDATION

### Static validation

- `npm run tinbox:check`
- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `python3 -m py_compile tests/components/tunet_inbox/*.py`

### Runtime validation

- `npm run tinbox:test`
- specifically verify the new `test_services.py` case that posts with:
  - `send_mobile: false`
  - `mobile.tag`
  - `mobile.url`
- assert the created item retains `mobile.url`

### HA/live validation

- deploy integration code only
- restart HA because Python code changed
- run `npm run tinbox:smoke`
- run a live `tunet_inbox.post` call with:
  - `mobile.tag`
  - `mobile.url: "/tunet-inbox-yaml/inbox"`
- verify the service response is accepted
- verify `tunet_inbox.list_items` returns the stored `mobile.url`
- clean up the probe item

## DEPLOY_IMPACT

- `HA RESTART`

## ROLLBACK

- restore prior `custom_components/tunet_inbox/services.py`
- restore prior `custom_components/tunet_inbox/services.yaml`
- restore prior test file changes if needed
- deploy integration rollback
- restart HA
- verify the public service path is back to the prior state

## DEPENDENCIES

- `TI2A` is closed
- `TINBOX-CONTRACT-2` is closed
- `TI2C` is now the active successor tranche
- no new package changes are in flight

## UNKNOWNS

- no material tranche-scoped unknowns remain

## STOP_CONDITIONS

- stop if allowing `mobile.url` requires widening beyond the public service schema into unrelated backend contract changes
- stop if the live `400 Bad Request` turns out to be caused by another validation layer outside `services.py`
- stop if the fix requires package-file changes to prove correctness
- stop if restart/deploy sequencing becomes ambiguous

## OUT_OF_SCOPE

- all OAL package migration work
- all Sonos package migration work
- any Tunet card or dashboard change
- Browser Mod or frontend navigation experiments
- changing `mobile.py` unless a service-boundary test proves a second independent bug

## REVIEW_FOCUS

- schema narrowness
- public contract parity
- test quality at the service boundary
- proof that the live blocker is actually removed
- clean restoration path back to `TI3`
