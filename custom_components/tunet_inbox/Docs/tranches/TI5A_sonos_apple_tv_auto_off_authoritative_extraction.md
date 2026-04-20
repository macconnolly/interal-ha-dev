# TI5A — Sonos Apple TV Auto-Off Authoritative Extraction

## TRANCHE_ID

- `TI5A`

## TITLE

- `Remove the legacy confirmable-notification bridge from sonos_apple_tv_auto_off and make the Apple TV inactivity flow inbox-authoritative`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this freezes a new tranche
  - it removes the only remaining live use of `script.confirmable_notification`
  - it changes the authority boundary for a user-visible phone flow that is currently known-broken in live feedback

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI5A — Sonos Apple TV Auto-Off Authoritative Extraction`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI5 planning freeze — split the remaining expansion bucket by actual mechanism`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-SONOS-3`
- `custom_components/tunet_inbox/handoff.md`
  - TI5 watchpoints and Apple TV live feedback
- `packages/sonos_package.yaml`
  - `confirmable_notification`
  - `apple_tv_auto_off_notification`
  - `apple_tv_auto_off_after_inactivity`
  - `sonos_apple_tv_auto_off_shadow_resolver`

## GOAL

- Make `sonos_apple_tv_auto_off` own one governed inbox lifecycle from post through response/resolve without routing through `script.confirmable_notification`.

## WHY_NOW

- This is the last remaining Sonos flow that still depends on an arbitrary-service raw mobile confirmable script, and live user feedback already says its real turn-off action does not work.

## USER_VISIBLE_OUTCOME

- When the Apple TV inactivity condition fires, the user gets one governed notification that opens the inbox, the chosen action works, and the inbox/mobile lifecycle stays consistent.

## FILES_ALLOWED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI5A_sonos_apple_tv_auto_off_authoritative_extraction.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Dashboard/Tunet/**`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `script.apple_tv_auto_off_notification` now posts the Apple TV inactivity prompt through `tunet_inbox.post(send_mobile=true)` as the authoritative writer.
- `script.confirmable_notification` remains defined in the package but is no longer used by any live production path.
- `automation.sonos_apple_tv_auto_off_action_handler` now owns both governed user actions:
  - `SONOS_ATV_CONFIRM_OFF`
  - `SONOS_ATV_KEEP_ON`
- `automation.sonos_apple_tv_auto_off_shadow_resolver` remains the natural context-clear owner.
- Live proof closed the previously broken turn-off path on the real living-room Apple TV and TV entities.

## INTENDED_STATE

- `script.apple_tv_auto_off_notification` posts through `tunet_inbox.post(send_mobile=true)` as the authoritative writer.
- Phone and dashboard actions both route through `tunet_inbox_action`.
- The flow no longer depends on `script.confirmable_notification`.
- Resolve ownership becomes explicit:
  - user confirm action
  - user keep-on action
  - natural context clear
- The flow clears the matching mobile notification through governed inbox mechanics, not through a separate raw-notify cleanup path.

## EXACT_CHANGE_IN_ENGLISH

- Remove `script.confirmable_notification` from the Apple TV auto-off path.
- Replace the shadow post with an authoritative post.
- Add a dedicated `tunet_inbox_action` handler for:
  - confirm turn off
  - keep on
- Keep resolver ownership explicit for context-clear conditions.
- Do not widen into `sonos_alarm_playing` or `sonos_evening_alarm_check`.

## ARCHITECTURAL_INTENTION

- This tranche removes the last live Sonos path that still depends on raw mobile-only action waits and arbitrary service-call lists instead of the governed inbox event contract.
- It is intentionally isolated from OAL TV-family work even though both touch Apple TV semantics; the business domains and state machines are different.

## ACCEPTANCE_CRITERIA

- only the Apple TV auto-off flow changes inside `packages/sonos_package.yaml`
- `script.confirmable_notification` is no longer used by any live production path
- `sonos_apple_tv_auto_off` posts via `tunet_inbox.post(send_mobile=true)`
- the authoritative user-action path listens only to `tunet_inbox_action`
- confirm turns off the Apple TV and any eligible display
- keep-on leaves devices running and clears the governed item cleanly
- natural context clear resolves the governed item cleanly
- duplicate or stale responses are rejected safely
- tranche closure records final live user feedback on body tap plus one chosen action

## VALIDATION

### Static validation

- YAML parse-check for `packages/sonos_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the Apple TV writer/handler/resolver branches for:
  - no remaining `script.confirmable_notification` dependency
  - authoritative `tunet_inbox.post(send_mobile=true)` ownership
  - `tunet_inbox_action` as the only accepted action event
  - explicit resolver ownership for context-clear paths

### HA/live validation

- ensure HA is stable and the queue is clean before proof
- deploy the changed Sonos package
- run both `automation.reload` and `script.reload`
- trigger a real Apple TV inactivity notification
- validate on fresh proof items:
  - body tap opens the governed inbox surface
  - phone action works
  - dashboard action works
  - confirm turns off the Apple TV and eligible display
  - keep-on clears the governed item without powering down
  - natural context clear resolves the item when Apple TV state no longer qualifies
  - duplicate/stale response handling is safe
- conclude with recorded live user feedback on body tap and one chosen action

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/sonos_package.yaml`
- run `script.reload`
- run `automation.reload`
- verify the legacy Apple TV auto-off path is restored

## DEPENDENCIES

- `TI4A` is closed
- the governed inbox tap contract from `TI2C` is closed
- the live Apple TV entities still exist and can be safely exercised

## UNKNOWNS

- whether display shutdown eligibility needs additional guards beyond the current entity-availability checks
- whether a dashboard-side confirm should still clear the phone push when the phone never opened it

## STOP_CONDITIONS

- stop if the flow still needs generic arbitrary service-call payload execution to remain viable
- stop if the Apple TV or display entity ownership is ambiguous enough that safe live proof cannot be isolated
- stop if solving the broken turn-off path requires backend Python changes instead of package-only migration

## OUT_OF_SCOPE

- all OAL TV-family flows
- unified timer flow
- `sonos_alarm_playing`
- `sonos_evening_alarm_check`
- dashboard/frontend changes
- backend Python changes

## CLOSURE_EVIDENCE

- package deploy backed up `/config/packages/sonos_package.yaml` to `Backups/tunet_inbox/packages/sonos_package.20260419_222907.remote.yaml`
- Home Assistant config check passed before activation
- both `script.reload` and `automation.reload` succeeded after the package deploy
- user confirmed notification body tap opened the governed inbox surface
- user confirmed phone `No, Keep On` cleared the notification while the Apple TV and TV both stayed on
- user confirmed phone `Yes, Turn Off` cleared the notification while the Apple TV and TV both turned off
- dashboard-card `tunet_inbox.respond(item_id=..., action_id='SONOS_ATV_KEEP_ON', source='dashboard_card')` returned `accepted: true`
- duplicate replay against the same resolved item returned `accepted: false, reason: item_not_found`
- natural context-clear proof succeeded when the Apple TV was in the real paused/on eligible state and `input_boolean.apple_tv_no_auto_off` flipped on, which triggered `automation.sonos_apple_tv_auto_off_shadow_resolver` via template and cleared the pending item
- post-proof cleanup restored:
  - `input_boolean.apple_tv_no_auto_off = off`
  - `media_player.living_room_apple_tv = off`
  - `media_player.living_room_samsung_q60 = off`
  - `tunet_inbox.list_items.meta.total = 0`

## REVIEW_FOCUS

- inspect `apple_tv_auto_off_notification`, the new Apple TV action handler, and the Apple TV resolver together
- verify the flow no longer depends on `script.confirmable_notification`
- verify that live proof closes the known broken turn-off action
