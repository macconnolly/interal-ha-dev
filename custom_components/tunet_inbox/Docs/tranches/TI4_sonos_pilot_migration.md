# TI4 — Sonos Alarm-Playing Authoritative Pilot

## TRANCHE_ID

- `TI4`

## TITLE

- `Cut `sonos_alarm_playing` over from dual-running compare mode to inbox-authoritative notification logic with end-of-tranche live user feedback`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this freezes a new tranche
  - it changes live package notification behavior in `packages/sonos_package.yaml`
  - it introduces end-of-tranche live user validation as a required closeout input, not an optional follow-up

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI4 — Sonos Alarm-Playing Authoritative Pilot`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI3 closeout — frozen OAL cutover set promoted and closed`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-SONOS-1`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
  - Sonos flow classification and compare-mode baseline
- `packages/sonos_package.yaml`
  - current `sonos_alarm_playing` writer/handler/resolver path

## GOAL

- Make `sonos_alarm_playing` inbox-authoritative while preserving existing alarm outcomes and requiring final live user feedback on the delivered phone experience before tranche closure.

## WHY_NOW

- `TI3` is closed, so the first Sonos authoritative pilot is the next governed slice.
- `sonos_alarm_playing` is the narrowest Sonos flow that already has the right writer/handler/resolver shape for authoritative cutover.
- `sonos_evening_alarm_check` is now split into `TI4A` because its current inline `wait_for_trigger` structure is a distinct extraction problem.
- Closing the first Sonos pilot with real user confirmation de-risks later Sonos and TV/timer tranches.

## USER_VISIBLE_OUTCOME

- A live Sonos alarm-playing notification is delivered through `tunet_inbox`, not by a direct package-owned mobile writer.
- The same pending work appears in the inbox surface and on the phone.
- Phone actions and dashboard actions both drive the same governed event path.
- The tranche only closes after the user confirms the final delivered mobile experience behaves correctly.

## FILES_ALLOWED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
- `custom_components/tunet_inbox/Docs/tranches/TI4_sonos_pilot_migration.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `sonos_alarm_playing` has been cut over inside `packages/sonos_package.yaml`:
  - the direct package-owned mobile writer was removed
  - the former shadow post now calls `tunet_inbox.post` with `send_mobile: true`
  - the live handler now listens to `tunet_inbox_action` only
  - `sonos_alarm_notification_clear` resolves through `tunet_inbox.resolve` using the same key fallback as the writer
- local validation is green:
  - YAML parse check for `packages/sonos_package.yaml`
  - `npm run tinbox:check`
  - `npm run tinbox:test` -> `28 passed`
- live proof so far:
  - package writer no longer dual-runs a direct mobile send
  - remote backup: `Backups/tunet_inbox/packages/sonos_package.20260419_124445.remote.yaml`
  - `ha_check_config() -> valid`
  - `automation.reload` succeeded
  - a real writer trace posted `sonos_alarm_playing:media_player.bedroom` through `tunet_inbox.post(send_mobile=true)`
  - user confirmed mobile delivery
  - user confirmed tapping the notification body opened the governed inbox surface
  - user confirmed the governed alarm controls worked from both the phone notification action and the dashboard
  - duplicate replay returned `accepted: false, reason: item_not_found`
  - user confirmed both notifications cleared on the second live test
  - final `tunet_inbox.list_items` returned `meta.total: 0`
- `sonos_evening_alarm_check` is now owned by `TI4A`.
- `sonos_apple_tv_auto_off` is now owned by `TI5`.

## INTENDED_STATE

- `sonos_alarm_playing` posts through `tunet_inbox` as the authoritative writer with `send_mobile: true`.
- The pilot flow relies on backend-owned tap routing and backend mobile delivery.
- The pilot action handler listens to `tunet_inbox_action` only.
- Natural stop/resolution still clears both the queue item and the phone notification deterministically.
- The other Sonos flows remain unchanged.

## EXACT_CHANGE_IN_ENGLISH

- Remove the direct package-owned mobile send from the `sonos_alarm_playing` writer path.
- Convert the existing shadow queue post into the authoritative queue post with `send_mobile: true`.
- Preserve the current Sonos action ids, queue key shape, severity/priority, and notification tag.
- Remove raw `mobile_app_notification_action` triggers from the alarm-playing cutover path so the pilot uses `tunet_inbox_action` as the canonical event.
- Keep natural stop clear behavior explicit and deterministic.
- Leave `sonos_evening_alarm_check` and `sonos_apple_tv_auto_off` untouched.
- End the tranche with a final live user phone test and record that feedback before closure.

## ARCHITECTURAL_INTENTION

- This tranche proves that a second domain can follow the OAL cutover pattern without reopening backend contract work.
- It keeps business logic inside the Sonos package while moving queueing, mobile delivery, and accepted action routing under governed inbox ownership.
- The required live user feedback closes the gap between backend proof and the actual on-device experience.

## ACCEPTANCE_CRITERIA

- only `sonos_alarm_playing` changes inside `packages/sonos_package.yaml`
- the pilot writer no longer sends a direct mobile notification from package YAML
- the pilot queue post sends mobile through `tunet_inbox`
- the pilot action handler listens to `tunet_inbox_action`, not raw `mobile_app_notification_action`
- natural alarm stop clears the queue item and the matching phone notification deterministically
- dashboard action and phone action both preserve the original Sonos alarm outcome
- stale or duplicate responses are rejected safely
- `sonos_evening_alarm_check` and `sonos_apple_tv_auto_off` remain unchanged and are governed by later tranches
- the tranche closes only after live user feedback on the final delivered phone flow is recorded in governance

## VALIDATION

### Static validation

- YAML parse-check for `packages/sonos_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the migrated Sonos writer/handler/resolver branches for:
  - authoritative `tunet_inbox.post(send_mobile=true)` ownership
  - preserved action ids and notification tag
  - `tunet_inbox_action` as the only accepted action event for the pilot flow
  - explicit clear/resolve ownership on natural alarm stop
- no drift into `sonos_evening_alarm_check` or `sonos_apple_tv_auto_off`

### HA/live validation

- ensure HA is stable and the queue is clean before proof starts
- deploy the changed Sonos package and reload automations
- trigger the Sonos alarm-playing pilot flow through a controlled live path
- validate on one fresh pilot item:
  - mobile delivery arrives
  - body tap opens the governed inbox surface
  - dashboard action works
  - phone action works
  - resulting Sonos alarm domain behavior still occurs
  - queue item clears appropriately
  - phone notification clears appropriately
- validate natural stop behavior on a separate fresh pilot item:
  - the alarm stops without manual action
  - the queue item clears
  - the phone notification clears
- validate stale/duplicate response handling
- conclude with live user feedback:
  - send or trigger one final governed pilot notification for the user
  - the user confirms the delivered phone UX, including body tap and one chosen action
  - record that feedback in `FIX_LEDGER.md` and `handoff.md` before closing `TI4`

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/sonos_package.yaml`
- reload automations
- confirm the compare-mode dual-running alarm-playing path is back in place

## DEPENDENCIES

- `TI3` is closed
- `TI2C` is closed
- `TI1E` Sonos flow classifications remain authoritative
- the notify-group delivery path is still working on the live HA instance

## UNKNOWNS

- the safest controlled live path for proving the alarm-playing pilot without disturbing any real household alarm schedule
- whether the final user validation should end on `dismiss` or on a controlled `snooze` outcome for the cleanest cleanup

## STOP_CONDITIONS

- stop if the pilot requires backend contract changes
- stop if safe controlled proof cannot be isolated from a real user alarm schedule
- stop if the pilot requires dashboard changes to be considered valid
- stop if `sonos_evening_alarm_check` or `sonos_apple_tv_auto_off` must be modified to complete the pilot

## OUT_OF_SCOPE

- `sonos_evening_alarm_check`
- `sonos_apple_tv_auto_off`
- all OAL flows
- dashboard/frontend changes
- backend Python or service-contract changes

## REVIEW_FOCUS

- inspect the `sonos_alarm_playing` writer, handler, and natural resolver together
- verify the pilot no longer dual-runs a direct phone writer
- verify scope control around the later Sonos tranches
- verify the tranche cannot close without recorded live user feedback
