# TI5C — OAL Unified Timer Authoritative Cutover

## TRANCHE_ID

- `TI5C`

## TITLE

- `Convert the unified OAL timer-expiry arbiter from compare mode to inbox-authoritative ownership`

## STATUS

- `PLANNED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this freezes a new tranche
  - unified timer is a separate OAL mechanism from the TV-family state machine
  - it carries multi-action expiry semantics that need their own proof matrix

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI5C — OAL Unified Timer Authoritative Cutover`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI5 planning freeze — split the remaining expansion bucket by actual mechanism`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-OAL-4`
- `custom_components/tunet_inbox/handoff.md`
  - TI5 sequence and OAL compare-mode leftovers
- `packages/oal_lighting_control_package.yaml`
  - `oal_v14_unified_timer_notification`
  - `oal_v14_timer_notification_handler`

## GOAL

- Make the unified OAL timer-expiring flow authoritative through `tunet_inbox` without raw mobile event handling or direct compare-mode phone writers.

## WHY_NOW

- Unified timer is still a separate compare-mode mechanism with its own writer and handler. It should not be bundled into TV-family or Sonos Apple TV work simply because all are “remaining notifications.”

## USER_VISIBLE_OUTCOME

- The timer-expiring alert is delivered through one governed inbox lifecycle, and actions like extend or return adaptive behave the same from phone and dashboard.

## FILES_ALLOWED

- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI5C_oal_unified_timer_authoritative_cutover.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Dashboard/Tunet/**`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `oal_v14_unified_timer_notification` dual-runs:
  - direct `notify.notify`
  - `tunet_inbox.post(send_mobile=false)`
- `oal_v14_timer_notification_handler` still accepts both:
  - raw `mobile_app_notification_action`
  - `tunet_inbox_action`
- The flow multiplexes several business branches:
  - extend mode
  - extend zone
  - extend both
  - return adaptive
  - let expire

## INTENDED_STATE

- Unified timer posts authoritatively through `tunet_inbox.post(send_mobile=true)`.
- The timer handler accepts only `tunet_inbox_action` for the migrated actions.
- The timer business outcomes remain unchanged.
- Queue and mobile clear behavior become governed and consistent across phone and dashboard.

## EXACT_CHANGE_IN_ENGLISH

- Remove the direct `notify.notify` writer from unified timer expiry.
- Convert the queue post to authoritative mobile delivery.
- Remove raw mobile action triggers from the unified timer handler.
- Preserve the existing business outcomes for all timer actions.

## ARCHITECTURAL_INTENTION

- Unified timer is its own cross-mode expiry arbiter and should be migrated as one mechanism. Folding it into TV-family work would mix unrelated state machines and make proof obligations ambiguous.

## ACCEPTANCE_CRITERIA

- only the unified timer flow changes inside `packages/oal_lighting_control_package.yaml`
- direct `notify.notify` is removed from the unified timer writer
- unified timer posts through `tunet_inbox.post(send_mobile=true)`
- the unified timer handler no longer accepts raw `mobile_app_notification_action`
- phone and dashboard preserve all timer action outcomes
- duplicate or stale responses are rejected safely
- final live user feedback is recorded before closure

## VALIDATION

### Static validation

- YAML parse-check for `packages/oal_lighting_control_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the unified timer writer/handler for:
  - authoritative post ownership
  - no raw mobile action triggers
  - unchanged business outcomes for all timer actions

### HA/live validation

- ensure HA is stable and the queue is clean before proof
- deploy the changed OAL package and run `automation.reload`
- trigger representative timer-expiring scenarios
- validate on fresh proof items:
  - body tap opens the governed inbox surface
  - phone actions work
  - dashboard actions work
  - business outcomes match the intended timer behavior
  - duplicate/stale responses are rejected safely
- conclude with recorded live user feedback on at least one phone-delivered timer path

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/oal_lighting_control_package.yaml`
- run `automation.reload`
- verify the unified timer compare-mode writer and raw mobile triggers are restored

## DEPENDENCIES

- `TI5B` is closed
- the relevant OAL timers and override contexts can be exercised safely for proof

## UNKNOWNS

- which timer-expiring branch is safest to prove first under live conditions
- whether `OAL_LET_EXPIRE` proof is cleaner via passive expiry or explicit action path first

## STOP_CONDITIONS

- stop if unified timer proof requires widening back into TV-family flows
- stop if safe live timer scenarios cannot be isolated from real household use
- stop if removing raw mobile triggers exposes a hidden backend contract gap

## OUT_OF_SCOPE

- OAL TV-family flows
- Sonos Apple TV auto-off
- dashboard/frontend changes
- backend Python changes

## REVIEW_FOCUS

- inspect the unified timer writer and handler together
- verify the flow is treated as its own mechanism, not leftover “miscellaneous expansion”
