# TI4A — Sonos Evening Alarm Authoritative Extraction

## TRANCHE_ID

- `TI4A`

## TITLE

- `Convert the nightly Sonos evening-alarm check from inline legacy mobile wait handling to an inbox-authoritative flow with final live user validation`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this freezes a new tranche
  - it changes live package notification behavior in `packages/sonos_package.yaml`
  - it extracts a structurally distinct inline `wait_for_trigger` phone flow into governed inbox ownership

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI4A — Sonos Evening Alarm Authoritative Extraction`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI4 scope reframe — split Sonos rollout by actual package boundary`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-SONOS-2`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
  - Sonos flow classification and compare-mode baseline
- `packages/sonos_package.yaml`
  - current `evening_alarm_check_notification` path

## GOAL

- Make `sonos_evening_alarm_check` inbox-authoritative while preserving the nightly alarm-disable outcome and requiring final live user feedback on the delivered phone experience before tranche closure.

## WHY_NOW

- `TI4` proves the simpler alarm-playing pilot first.
- `sonos_evening_alarm_check` is the next Sonos flow, but its current structure is materially different from `sonos_alarm_playing`.
- Splitting this extraction keeps the first Sonos pilot narrow while still making the next Sonos step explicit.

## USER_VISIBLE_OUTCOME

- The nightly Sonos alarm-check prompt is delivered through `tunet_inbox`, not through a direct `notify.notify` plus raw mobile-only wait path.
- Phone and dashboard use the same governed actions to disable tomorrow's alarms or keep them enabled.
- The tranche only closes after the user confirms the final delivered phone experience behaves correctly.

## FILES_ALLOWED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
- `custom_components/tunet_inbox/Docs/tranches/TI4A_sonos_evening_alarm_authoritative_extraction.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- TI4A is closed.
- Package implementation now:
  - removes the direct `notify.notify` writer
  - converts the nightly prompt to `tunet_inbox.post(send_mobile=true)`
  - replaces dynamic raw mobile action ids with stable governed action ids
  - removes the inline `wait_for_trigger` on `mobile_app_notification_action`
  - adds a dedicated `tunet_inbox_action` handler for the nightly actions
- Live proof closed the tranche on:
  - phone body tap opening the governed inbox surface
  - `Keep Enabled` clearing the notification
  - dashboard-card `Disable` producing the nightly domain outcome
  - restored alarm state after proof
  - final queue cleanup to `meta.total: 0`
  - recorded live user feedback that the governed functionality is fully baked
- Duplicate delivery on `Mac's iPhone personal` is treated as notify-group fan-out outside TI4A scope because only one governed queue item existed and the governed action lifecycle worked correctly.
- `sonos_alarm_playing` and `sonos_apple_tv_auto_off` remained untouched in this tranche.

## INTENDED_STATE

- `sonos_evening_alarm_check` posts through `tunet_inbox` as the authoritative writer with `send_mobile: true`.
- Stable governed action ids replace the current dynamic raw mobile action ids.
- Action handling listens to `tunet_inbox_action`, not inline raw mobile waits.
- Timeout/window/no-alarms resolvers remain explicit and deterministic.
- The other Sonos flows remain unchanged.

## EXACT_CHANGE_IN_ENGLISH

- Remove the direct package-owned `notify.notify` send from the authoritative evening-alarm path.
- Convert the shadow queue post into the authoritative queue post with `send_mobile: true`.
- Replace the current dynamic raw mobile action ids with stable governed action ids.
- Remove the inline `wait_for_trigger` raw mobile path from the authoritative flow.
- Preserve the nightly domain outcome for both "disable" and "keep enabled".
- Keep `sonos_alarm_playing` and `sonos_apple_tv_auto_off` untouched.
- End the tranche with a final live user phone test and record that feedback before closure.

## ARCHITECTURAL_INTENTION

- This tranche extracts the first Sonos flow that still depends on inline legacy phone mechanics rather than a reusable governed event path.
- It proves the inbox-authoritative pattern can absorb a nightly prompt with timeout semantics, not just an alarm-now pilot.
- It keeps the more complex confirmable Apple TV path out of scope until the later confirmable/TV tranche.

## ACCEPTANCE_CRITERIA

- only `sonos_evening_alarm_check` changes inside `packages/sonos_package.yaml`
- the authoritative evening-alarm writer no longer sends a direct `notify.notify` mobile notification
- the queue post sends mobile through `tunet_inbox`
- stable governed action ids replace the current dynamic raw mobile action ids
- the authoritative path no longer relies on inline `wait_for_trigger` over `mobile_app_notification_action`
- phone and dashboard preserve the original nightly domain outcomes
- timeout/window/no-alarms resolution remains deterministic
- `sonos_alarm_playing` and `sonos_apple_tv_auto_off` remain unchanged
- stale or duplicate responses are rejected safely
- the tranche closes only after live user feedback on the final delivered phone flow is recorded in governance

## VALIDATION

### Static validation

- YAML parse-check for `packages/sonos_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the migrated evening-alarm writer/handler/resolver branches for:
  - authoritative `tunet_inbox.post(send_mobile=true)` ownership
  - stable governed action ids
  - `tunet_inbox_action` as the only accepted action event for the authoritative path
  - deterministic timeout/window/no-alarms resolve ownership
  - no drift into `sonos_alarm_playing` or `sonos_apple_tv_auto_off`

### HA/live validation

- ensure HA is stable and the queue is clean before proof starts
- deploy the changed Sonos package and reload automations
- trigger the evening-alarm prompt through a controlled live path
- validate on one fresh pilot item:
  - mobile delivery arrives
  - body tap opens the governed inbox surface
  - dashboard action works
  - phone action works
  - the resulting domain outcome still occurs for both "disable" and "keep enabled" across the proof set
  - queue item clears appropriately
  - phone notification clears appropriately
- validate timeout/window/no-alarms resolution on separate fresh proof items as needed
- validate stale/duplicate response handling
- conclude with live user feedback:
  - send or trigger one final governed evening-alarm notification for the user
  - the user confirms the delivered phone UX, including body tap and one chosen action
  - record that feedback in `FIX_LEDGER.md` and `handoff.md` before closing `TI4A`

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/sonos_package.yaml`
- reload automations
- confirm the compare-mode nightly alarm-check flow is back in place

## DEPENDENCIES

- `TI4` is closed
- `TI2C` is closed
- `TI1E` Sonos flow classifications remain authoritative until this tranche closes
- the notify-group delivery path is still working on the live HA instance

## UNKNOWNS

- the safest controlled live path for proving the tomorrow-alarm prompt without disrupting real overnight schedules
- whether the cleanest final user validation should end on the disable path or the keep-enabled path

## STOP_CONDITIONS

- stop if the extraction requires backend contract changes
- stop if safe controlled proof cannot be isolated from real overnight schedule state
- stop if the authoritative path still requires dynamic raw mobile action ids
- stop if `sonos_alarm_playing` or `sonos_apple_tv_auto_off` must be modified to complete the tranche

## OUT_OF_SCOPE

- `sonos_alarm_playing`
- `sonos_apple_tv_auto_off`
- all OAL flows
- dashboard/frontend changes
- backend Python or service-contract changes

## REVIEW_FOCUS

- inspect the `evening_alarm_check_notification` writer, action handling, and timeout/no-alarm resolvers together
- verify the authoritative path no longer depends on inline raw mobile waits
- verify the split from `TI4` is justified by the legacy flow structure rather than by generic caution
- verify the tranche cannot close without recorded live user feedback
