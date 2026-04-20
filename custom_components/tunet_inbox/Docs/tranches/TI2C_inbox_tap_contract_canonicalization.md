# TI2C — Inbox Tap Contract Canonicalization

## TRANCHE_ID

- `TI2C`

## TITLE

- `Move inbox tap ownership into the backend so tunet_inbox mobile deliveries open the governed inbox surface by default`
  - `The governed default tap URL must be configurable in integration settings and fall back to /tunet-inbox-yaml/inbox when unset`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche changes a public backend contract
  - it is the control tranche that sits between the parity patch in `TI2B` and the first authoritative package cutover in `TI3`
  - it must freeze a narrow backend-only file boundary so the durable tap contract is settled before OAL or Sonos work widens again

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI2C — Inbox Tap Contract Canonicalization`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI2B closure — public mobile.url service-schema parity proven`
  - `TI2C planning freeze — inbox tap contract canonicalization`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-CONTRACT-3`
  - `TINBOX-TEST-3`
- `custom_components/tunet_inbox/Docs/contracts.md`
  - current live compatibility surface for `mobile.url`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
  - current mobile tap-through compatibility surface and planned durable direction

## GOAL

- Replace caller-owned raw inbox route strings as the normal mobile tap contract with backend-owned governed default behavior so `tunet_inbox` mobile deliveries open the inbox surface by intent.

## WHY_NOW

- `TI2B` proved the narrow parity patch but did not settle the durable contract boundary.
- `TI3` package cutover should not resume while backend tap ownership is still caller-owned.
- The user-visible intent is simple:
  - tap the notification
  - open the inbox
  - act on the latest item at the top of the stack

## USER_VISIBLE_OUTCOME

- Mobile notifications sent by `tunet_inbox` open the governed inbox surface by default.
- New callers no longer need to supply raw route strings for the normal inbox tap behavior.
- Legacy `mobile.url` remains temporarily compatible only for the governed inbox route.
- `TI3` can legally resume once the backend-owned contract is implemented and proven.

## FILES_ALLOWED

- `custom_components/tunet_inbox/const.py`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/config_flow.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/services.yaml`
- `custom_components/tunet_inbox/translations/en.json`
- `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh`
- `tests/components/tunet_inbox/test_config_flow.py`
- `tests/components/tunet_inbox/test_services.py`
- `tests/components/tunet_inbox/test_mobile.py`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI2B_mobile_url_public_service_schema_parity.md`
- `custom_components/tunet_inbox/Docs/tranches/TI2C_inbox_tap_contract_canonicalization.md`
- `custom_components/tunet_inbox/Docs/tranches/TI3_oal_pilot_migration.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `Dashboard/Tunet/**`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `TI2B` is closed and live-proven:
  - `services.py` public `MOBILE_SCHEMA` accepts `mobile.url`
  - `models.py` persists `mobile.url`
  - `mobile.py` forwards `item.mobile.url` into the HA-native mobile payload
- current fallback governed callers use `/tunet-inbox-yaml/inbox` as the inbox route value
- the latest item appears at the top of the inbox stack, so the product intent does not require item-specific deep links
- the configured non-default route `http://10.0.0.21:8123/tunet-inbox-yaml/inbox` is live-proven on the current runtime
- the hidden restart blocker is now proved:
  - import-sourced startup was clearing all options
  - `mobile_tap_url` therefore disappeared after restart when it was set only in integration settings
- a narrow fix is implemented in `config_flow.py`:
  - YAML import still wins for overlapping keys
  - non-overlapping options such as `mobile_tap_url` are preserved
- the targeted config-flow regression now locks that behavior locally
- live activation and configured-route proof were completed using the governed browser reload path
- `TI3` is no longer blocked by this tranche

## INTENDED_STATE

- all `tunet_inbox` mobile deliveries open the governed inbox surface by default
- backend-owned mapping in `mobile.py` emits the HA-native `data.url`
- the default tap URL comes from integration settings when configured and falls back to `/tunet-inbox-yaml/inbox` when unset
- raw `mobile.url` is no longer the normal public operator contract for new callers
- legacy `mobile.url` is accepted only for the currently configured governed inbox route and is normalized by the backend as a temporary compatibility path
- local and live proof cover the service boundary, adapter emission, rejection of non-canonical values, and live cleanup

## EXACT_CHANGE_IN_ENGLISH

- define a canonical inbox tap target in backend-owned code, not in packages or callers
- source the canonical default tap target from integration settings with a fallback to `/tunet-inbox-yaml/inbox`
- update model and service validation so the normal contract is intent-driven rather than arbitrary route-string driven
- keep temporary backward compatibility for legacy `mobile.url` only when it matches the governed inbox route
- reject non-canonical `mobile.url` values at service ingress
- extend config-entry/options flow so operators can set the governed default tap URL without package edits
- document the operator-facing contract change in `services.yaml`
- add the proof cases that `TI2B` intentionally did not try to own:
  - service-boundary test with `send_mobile=true`
  - adapter emission test proving canonical `data.url`
  - rejection test for non-canonical `mobile.url`
  - config-flow test proving the configured default tap URL persists into runtime options
  - live post/list/cleanup proof against HA

## ARCHITECTURAL_INTENTION

- The inbox is the governed recovery surface.
- Mobile notifications are a delivery surface, not the authority that owns navigation semantics.
- Callers should express intent to open the inbox, not raw route strings.
- The backend should translate that intent into the HA-native mobile payload shape.
- Operators should be able to change the governed default tap URL in integration settings without package edits.
- This tranche exists to settle that ownership boundary before package cutover work resumes.

## ACCEPTANCE_CRITERIA

- backend-owned code defines the governed inbox tap target
- all `tunet_inbox` mobile deliveries open the governed inbox surface by default
- integration settings can override the default tap URL, with `/tunet-inbox-yaml/inbox` as fallback when unset
- raw `mobile.url` is no longer the normal public operator contract for new callers
- legacy `mobile.url` is accepted only when it equals the currently configured governed inbox route
- non-canonical `mobile.url` values are rejected at the public service boundary
- local HA-style tests prove:
  - `send_mobile=true` uses the canonical inbox tap contract
  - the adapter emits the canonical `data.url`
  - non-canonical `mobile.url` is rejected
- config-flow tests prove the configured default tap URL persists into the live runtime options
- live HA proof confirms a fresh post succeeds and cleanup returns the queue to the expected post-proof state
- local import-flow regression proves `mobile_tap_url` survives import-backed YAML updates when YAML does not specify it
- browser reload activates the deployed integration payload and the configured-route live proof passes afterward
- `TINBOX-CONTRACT-3` and `TINBOX-TEST-3` are closed in governance docs
- no package files or `Dashboard/Tunet/**` files are changed in this tranche

## VALIDATION

### Static validation

- `npm run tinbox:check`
- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `python3 -m py_compile tests/components/tunet_inbox/*.py`

### Runtime validation

- `npm run tinbox:test`
- specifically verify:
  - a `test_config_flow.py` case that stores the configured default tap URL through user/options flow
  - a new `test_services.py` case that posts with `send_mobile: true` and proves canonical inbox tap handling
  - a new `test_services.py` case that rejects non-canonical `mobile.url`
  - a `test_mobile.py` case that proves the emitted notify payload contains the canonical `data.url`

### HA/live validation

- deploy integration code only
- reload `Tunet Inbox` from the browser integrations page
- run `npm run tinbox:smoke`
- run a live `tunet_inbox.post` call that uses the durable inbox tap contract
- verify the service response is accepted
- verify `tunet_inbox.list_items` returns the expected canonical mobile tap metadata
- clean up the proof item
- verify the queue is back in the expected post-proof state before closing the tranche

## DEPLOY_IMPACT

- `HA INTEGRATION RELOAD`
- current user override for this tranche:
  - prefer browser reload of the `Tunet Inbox` integration instead of full HA restart
  - UI path:
    - `Settings -> Devices & Services -> Integrations -> Tunet Inbox -> service row menu -> Reload`

## ROLLBACK

- restore prior backend files:
  - `const.py`
  - `models.py`
  - `mobile.py`
  - `services.py`
  - `services.yaml`
- restore prior test updates if needed
- deploy integration rollback
- reload `Tunet Inbox`
- verify the previous `mobile.url` compatibility path still behaves as before

## DEPENDENCIES

- `TI2B` is closed
- `TINBOX-CONTRACT-2` is closed
- no new package or dashboard changes are in flight

## UNKNOWNS

- whether the cleanest implementation is:
- whether existing pending items should retain the effective tap URL captured at creation time when the configured default changes later
- whether HA service metadata needs a brief compatibility note for operators while the legacy field remains temporarily accepted

## STOP_CONDITIONS

- stop if the durable tap contract requires package edits to prove correctness
- stop if the clean implementation would widen into `manager.py`, `__init__.py`, or dashboard files without a new control point
- stop if backward compatibility requires preserving arbitrary raw route strings instead of only the governed inbox route
- stop if deploy/restart sequencing becomes ambiguous

## OUT_OF_SCOPE

- all OAL package migration work
- all Sonos package migration work
- any Tunet card or dashboard change
- Browser Mod or frontend navigation experiments
- retirement of direct package-owned mobile notification writers

## REVIEW_FOCUS

- contract ownership
- schema narrowness
- backward-compatibility discipline
- test quality at the public service boundary
- proof that the backend, not callers, now owns inbox tap behavior
