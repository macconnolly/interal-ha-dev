# TI5B — OAL TV-Family Compare-Mode Retirement

## TRANCHE_ID

- `TI5B`

## TITLE

- `Retire compare-mode writers and raw mobile handlers for the remaining OAL TV-family flows using domain-real playback proof`

## STATUS

- `READY TO START`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this freezes a new tranche
  - TI3 closed part of this family only on bounded synthetic proof
  - this tranche changes multiple tightly coupled OAL TV-family flows that share one handler/resolver state machine

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI5B — OAL TV-Family Compare-Mode Retirement`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI5 planning freeze — split the remaining expansion bucket by actual mechanism`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-OAL-3`
- `custom_components/tunet_inbox/handoff.md`
  - TV-family watchpoints from TI3
- `packages/oal_lighting_control_package.yaml`
  - `oal_tv_mode_activated`
  - `oal_bridge_expiring`
  - `oal_tv_presence_prompt`
  - shared TV notification handler/resolver

## GOAL

- Convert the remaining OAL TV-family compare-mode flows to inbox-authoritative ownership using real Apple TV playback and presence proof instead of bounded synthetic items.

## WHY_NOW

- TI3 intentionally left the adjacent TV-family compare-mode paths in place because the prompt proof was bounded synthetic. The next clean OAL move is to finish that state machine coherently rather than leave mixed-authority TV flows behind.

## USER_VISIBLE_OUTCOME

- The remaining OAL TV-family notifications use one governed inbox lifecycle from phone and dashboard, and the direct compare-mode phone writers are retired.

## FILES_ALLOWED

- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI5B_oal_tv_family_compare_mode_retirement.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Dashboard/Tunet/**`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `oal_tv_mode_prompt` is already authoritative from TI3, but its proof was bounded synthetic.
- `oal_tv_mode_activated`, `oal_bridge_expiring`, and `oal_tv_presence_prompt` still dual-run:
  - direct `notify.notify`
  - `tunet_inbox.post(send_mobile=false)`
- The shared OAL TV notification handler still accepts both:
  - `mobile_app_notification_action`
  - `tunet_inbox_action`
- The shared TV resolver already owns natural context clear for all four TV-family keys.

## INTENDED_STATE

- The remaining TV-family flows post authoritatively through `tunet_inbox.post(send_mobile=true)`.
- The shared TV notification handler accepts only `tunet_inbox_action` for the migrated actions.
- The shared TV resolver remains the natural clear owner.
- Real Apple TV playback and presence transitions are used to prove the state machine end to end.

## EXACT_CHANGE_IN_ENGLISH

- Remove direct `notify.notify` writers from:
  - `oal_tv_mode_activated`
  - `oal_bridge_expiring`
  - `oal_tv_presence_prompt`
- Convert their queue posts from compare mode to authoritative mobile delivery.
- Remove raw `mobile_app_notification_action` triggers for the migrated TV-family actions.
- Keep the existing shared OAL TV resolver as the natural clear owner.
- Re-prove the already-authoritative `oal_tv_mode_prompt` on the real playback path while not widening into Apple TV auto-off.

## ARCHITECTURAL_INTENTION

- These flows belong together because they share one OAL TV session state machine, one action handler, and one resolver. Retiring compare mode piecemeal inside that family would leave mixed authority inside the same control loop.

## ACCEPTANCE_CRITERIA

- only the OAL TV-family flows change inside `packages/oal_lighting_control_package.yaml`
- direct `notify.notify` writers are removed for `oal_tv_mode_activated`, `oal_bridge_expiring`, and `oal_tv_presence_prompt`
- the TV-family writer set posts through `tunet_inbox.post(send_mobile=true)`
- the shared TV-family action handler no longer accepts raw `mobile_app_notification_action` for the migrated actions
- the shared TV-family resolver still owns natural context clear
- real Apple TV playback proof exists for prompt, activated, and bridge paths
- real presence proof exists for presence-loss prompt paths
- duplicate or stale responses are rejected safely
- final live user feedback is recorded before closure

## VALIDATION

### Static validation

- YAML parse-check for `packages/oal_lighting_control_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the shared TV-family writer/handler/resolver set for:
  - authoritative post ownership
  - no raw mobile action triggers for migrated TV-family actions
  - resolver continuity across all TV-family keys

### HA/live validation

- ensure HA is stable and the queue is clean before proof
- deploy the changed OAL package and run `automation.reload`
- exercise domain-real Apple TV playback transitions
- validate on fresh proof items:
  - `oal_tv_mode_prompt`
  - `oal_tv_mode_activated`
  - `oal_bridge_expiring`
  - `oal_tv_presence_prompt`
- prove for the relevant flow set:
  - body tap opens the governed inbox surface
  - phone actions work
  - dashboard actions work
  - natural resolver clears govern the queue correctly
  - duplicate/stale responses are rejected safely
- conclude with recorded live user feedback on at least one phone-delivered TV-family path

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/oal_lighting_control_package.yaml`
- run `automation.reload`
- verify the TV-family compare-mode writers and raw mobile handlers are restored

## DEPENDENCIES

- `TI5A` is closed
- `TI3` is closed
- real Apple TV playback can be exercised safely for validation

## UNKNOWNS

- whether the cleanest live proof sequence should start from prompt, activated, or bridge transition
- whether the presence-loss prompt requires a dedicated user-walkthrough to avoid false negatives from occupancy timing

## STOP_CONDITIONS

- stop if real Apple TV playback proof cannot be safely isolated from normal use
- stop if the shared TV-family handler cannot lose raw mobile triggers without widening into backend changes
- stop if the TV-family compare-mode retirement unexpectedly couples to unified timer behavior

## OUT_OF_SCOPE

- unified timer flow
- Sonos Apple TV auto-off
- already-closed OAL override and evening prompt tranches
- dashboard/frontend changes
- backend Python changes

## REVIEW_FOCUS

- inspect the OAL TV-family writers, shared notification handler, and shared resolver together
- verify this tranche retires compare mode coherently across one state machine
- verify that TI3's bounded synthetic TV proof is replaced by domain-real playback evidence
