# TI1E — Shadow Translation And Compare-Mode Notification Coverage

## TRANCHE_ID

- `TI1E`

## TITLE

- `Mirror documented OAL and Sonos actionable notifications into tunet_inbox while preserving the current mobile notification flows for side-by-side comparison`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche materially changes program order
  - it widens from one OAL pilot into both `packages/oal_lighting_control_package.yaml` and `packages/sonos_package.yaml`
  - it introduces a dual-running compare-mode contract that must be explicit before code starts

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI1E — Shadow Translation And Compare-Mode Notification Coverage`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-SHADOW-1`
  - `TINBOX-SHADOW-2`
  - `TINBOX-SHADOW-3`
- `HA-References/tunet_inbox_enhancement_matrix.md`
  - compare-mode direction and inventory question set
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`

## GOAL

- Translate as many documented actionable notification contexts as practical into `tunet_inbox` in shadow mode so the queue receives the same pending work items while the existing phone notifications and their current handlers continue to run unchanged for comparison.

## WHY_NOW

- User direction changed: the next highest-value step is broader notification translation coverage, not UI-first work.
- The backend is stable enough to mirror contexts now.
- Keeping the current phone flows alive while mirroring into `tunet_inbox` reduces regression risk and gives a comparison window before any authoritative cutover.

## USER_VISIBLE_OUTCOME

- Existing phone notifications continue to arrive and behave as they do today.
- The same logical contexts are also posted into `tunet_inbox`.
- Operator/API validation can compare old mobile behavior against queue behavior without removing the current production path.
- No notification family is silently cut over in this tranche.

## FILES_ALLOWED

- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
- `custom_components/tunet_inbox/Docs/tranches/TI3_oal_pilot_migration.md`
- `HA-References/tunet_inbox_enhancement_matrix.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `Configuration/configuration.yaml`
- any non-inbox package file outside:
  - `packages/oal_lighting_control_package.yaml`
  - `packages/sonos_package.yaml`

## CURRENT_STATE

- `TI1D` is closed and its post-restart import-entry proof has now been observed live:
  - `tunet_inbox` is `loaded`
  - config-entry `source` is `import`
  - config-entry `options` is `{}` after restart
- Existing mobile notification flows remain authoritative in both OAL and Sonos.
- The documented compare-mode OAL and Sonos flow set has now been mirrored into `tunet_inbox`.
- Representative OAL TV-family, OAL timer/expiry-family, and Sonos alarm-playing proofs are recorded live.

## INTENDED_STATE

- Most documented actionable notification families are mirrored into `tunet_inbox` in shadow mode.
- Current phone notifications and raw `mobile_app_notification_action` handlers remain active.
- Each translated flow is explicitly classified as either:
  - `shadow + action-ready`
  - `shadow + mirror-only`
- Queue posts do not generate duplicate mobile pushes.
- Resolver ownership is documented and implemented for every translated shadow item.

## EXACT_CHANGE_IN_ENGLISH

- Add parallel `tunet_inbox.post` calls to the documented notification writers while leaving the existing mobile notification sends intact.
- Use `send_mobile: false` for compare-mode queue posts so shadow translation does not create duplicate phone pushes.
- Preserve existing notification tags so queue-side resolve can clear the current phone notification when applicable.
- Keep existing raw mobile handlers intact.
- Add `tunet_inbox_action` handlers only where business logic can be safely shared or duplicated without destabilizing the current production path.
- Add explicit queue resolver paths for every translated flow so queue items do not linger after the underlying condition clears.
- Do not remove or replace current mobile notification behavior in this tranche.

## ARCHITECTURAL_INTENTION

- This tranche creates a safe comparison phase between:
  - today’s mobile-only production flows
  - tomorrow’s inbox-authoritative flows
- It maximizes real queue coverage before UI and cutover work.
- It also separates:
  - `shadow translation`
  - `dashboard rendering`
  - `authoritative cutover`
  into distinct governed phases.

## FLOW INVENTORY AND TARGET MODE

### OAL flows

- `oal_override_reminder`
  - status: `migrated in TI3 and live-proven`
  - final mode: `authoritative`
- `oal_override_expiring`
  - status: `migrated in TI3 and live-proven`
  - final mode: `authoritative`
- `oal_tv_mode_activated`
  - status: `implemented`
  - final mode: `shadow + action-ready`
- `oal_tv_mode_prompt`
  - status: `migrated in TI3 with bounded synthetic prompt proof`
  - final mode: `authoritative`
- `oal_bridge_expiring`
  - status: `implemented and live-proven post-restart`
  - final mode: `shadow + action-ready`
- `oal_tv_presence_prompt`
  - status: `implemented`
  - final mode: `shadow + action-ready`
- `oal_timer_expiring`
  - status: `implemented`
  - final mode: `shadow + action-ready`
- `oal_learning_log`
  - out of scope

### Sonos flows

- `sonos_alarm_playing`
  - status: `authoritative via TI4 closeout`
  - final mode: `authoritative`
- `sonos_evening_alarm_check`
  - status: `authoritative via TI4A closeout`
  - final mode: `authoritative`
- `sonos_apple_tv_auto_off`
  - status: `current compare-mode baseline; confirmable/TV cleanup deferred to TI5`
  - final mode: `authoritative after TI5`
- `sonos_alarm_notification_clear`
  - not a standalone queue item
  - remains a resolver/clear path only

## IMPLEMENTATION COMPLETED

- `packages/oal_lighting_control_package.yaml`
  - mirrored:
    - `oal_override_reminder`
    - `oal_override_expiring`
    - `oal_tv_mode_activated`
    - `oal_tv_mode_prompt`
    - `oal_bridge_expiring`
    - `oal_tv_presence_prompt`
    - `oal_timer_expiring`
  - added compare-mode `tunet_inbox_action` handling where safe:
    - override reminder
    - override expiring
    - TV-family handler branches
    - unified timer handler
  - added resolver ownership:
    - override reminder natural clear
    - override expiring mobile, timeout/supersession clear
    - TV-family shadow resolver
    - unified timer shadow resolver
- `packages/sonos_package.yaml`
  - mirrored:
    - `sonos_alarm_playing`
    - `sonos_evening_alarm_check`
    - `sonos_apple_tv_auto_off`
  - added compare-mode `tunet_inbox_action` handling where safe:
    - alarm playing only
  - kept mirror-only where action duplication remained intentionally deferred:
    - evening alarm check
    - Apple TV auto-off
  - added resolver ownership:
    - evening alarm check timeout/window/no-alarms
    - Apple TV auto-off context clear
    - alarm-playing natural stop clear
  - patched legacy alarm notify routing so a raw 32-character mobile device id falls back to `notify.tunet_inbox_all_devices` instead of constructing a non-existent `notify.mobile_app_<device_id>` action

## LIVE EVIDENCE SUMMARY

- post-restart config-entry proof:
  - `tunet_inbox` import entry is `loaded` with `options: {}`
- OAL TV-family proof:
  - manual `automation.oal_v14_tv_bridge_manager` trigger with `skip_condition: true`
  - queue item appeared with key `oal_bridge_expiring:living_room`
  - `tunet_inbox.respond(action_id='OAL_BRIDGE_KEEP')` was accepted
  - queue cleared afterward
- OAL timer/expiry-family proof:
  - manual `automation.oal_v13_override_expiring_soon_warning` trigger with `skip_condition: true`
  - queue item appeared with key `oal_override_expiring:unknown`
  - `tunet_inbox.respond(action_id='OAL_LET_EXPIRE')` was accepted
  - queue cleared afterward
- Sonos alarm-playing proof:
  - manual `automation.sonos_alarm_playing_notification` trigger with `skip_condition: true`
  - queue item appeared with key `sonos_alarm_playing:unknown_speaker`
  - `tunet_inbox.respond(action_id='SONOS_DISMISS_ALARM')` was accepted
  - queue cleared afterward
- Sonos mirror-only writer proofs:
  - `script.evening_alarm_check_notification` created `sonos_evening_alarm_check:2026-04-07`
  - `script.apple_tv_auto_off_notification` created `sonos_apple_tv_auto_off:media_player.living_room_apple_tv`

## COMPARE-MODE RULES

### Rule 1: Old mobile flow stays authoritative

- Existing `notify.notify` / `notify.mobile_app_*` sends remain in place.
- Existing `mobile_app_notification_action` handlers remain in place.
- Existing inline `wait_for_trigger` mobile-action branches remain in place unless the tranche explicitly documents a shared helper extraction.

### Rule 2: Queue posts are additive only

- New shadow posts must use `tunet_inbox.post`.
- New shadow posts must set:
  - `send_mobile: false`
- Shadow posts should still include:
  - `mobile.tag`
  - `family`
  - `priority`
  - `severity`
  - `context`
  so queue-side resolve can clear the live phone notification and the future card can render correctly.

### Rule 3: Action-ready classification requires explicit safety

- A flow may be marked `shadow + action-ready` only if:
  - the inbox path can trigger the same business outcome safely
  - duplicate side effects are idempotent or guarded
  - the old mobile path remaining active will not create unsafe races
- If that cannot be proven cleanly inside the tranche, the flow stays `shadow + mirror-only`.

### Rule 4: Every shadow item needs resolver ownership

- For every translated flow, document and implement one or more of:
  - natural condition resolver
  - timeout resolver
  - supersession resolver
  - explicit clear-by-tag path

## ACCEPTANCE_CRITERIA

- The translated-flow inventory is documented in the tranche and reflected in the ledger/matrix.
- Existing mobile notification writers remain intact for every translated flow.
- Existing raw mobile handlers remain intact for every translated flow.
- The following flows are mirrored into `tunet_inbox`:
  - OAL override reminder
  - OAL override expiring
  - OAL TV mode activated
  - OAL TV mode prompt
  - OAL bridge expiring
  - OAL TV presence prompt
  - OAL unified timer expiring
  - Sonos alarm playing
  - Sonos evening alarm check
  - Sonos Apple TV auto-off
- Each mirrored flow is classified as:
  - `shadow + action-ready`
  - or `shadow + mirror-only`
- No mirrored flow generates a duplicate mobile push from `tunet_inbox`.
- Representative live proofs exist for:
  - one OAL TV-family flow
  - one OAL timer/expiry flow
  - Sonos alarm playing
- Queue resolver paths exist for every mirrored flow.
- No `Dashboard/Tunet/**` files change.

## ACCEPTANCE_STATUS

- `SATISFIED`

## VALIDATION

### Static validation

- YAML parse-check:
  - `packages/oal_lighting_control_package.yaml`
  - `packages/sonos_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- review each translated flow for:
  - key naming
  - tag preservation
  - `send_mobile: false`
  - resolver ownership
  - classification correctness
- verify that existing mobile event handling still exists for the translated flows

### HA/live validation

- deploy the touched package files
- reload automations
- representative live proofs:
  - OAL TV-family context appears in `tunet_inbox`
  - OAL timer/expiry context appears in `tunet_inbox`
  - Sonos alarm-playing context appears in `tunet_inbox`
- verify that the legacy phone notifications still fire once, not twice
- where a flow is marked `shadow + action-ready`, prove one governed action path via API:
  - item appears
  - `tunet_inbox.respond`
  - queue clears
  - legacy phone prompt clears by tag if still present

## ACTUAL VALIDATION EXECUTED

### Static

- YAML parse-check passed for:
  - `packages/oal_lighting_control_package.yaml`
  - `packages/sonos_package.yaml`
- `npm run tinbox:check` passed after the package changes

### HA/live

- copied updated package files to `/config/packages/`
- `ha_check_config()` returned `valid`
- reloaded:
  - automations
  - scripts
- recorded representative live proofs for:
  - OAL TV-family
  - OAL timer/expiry-family
  - Sonos alarm playing
  - Sonos evening alarm check writer mirror
  - Sonos Apple TV auto-off writer mirror

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`
- `HA RESTART` only if a blocker forces backend code changes, which is outside the intended file boundary

## ROLLBACK

- restore the changed package files from backup
- reload automations
- verify that only the original phone flows remain active

## DEPENDENCIES

- `TI1D` must be closed
- compare-mode direction is accepted as a program-order change
- no UI files are required for tranche acceptance

## UNKNOWNS

- whether `sonos_evening_alarm_check` and `sonos_apple_tv_auto_off` can safely move from `shadow + mirror-only` to `shadow + action-ready` inside this tranche
- whether any OAL inline mobile-action waiters need shared helper extraction for clean compare-mode actionability
- how much of the shadow inventory should be promoted to action-ready before the UI tranche begins

## STOP_CONDITIONS

- stop if broad translation requires backend contract changes
- stop if safe compare-mode actionability cannot be isolated without removing current mobile flows
- stop if the tranche starts to depend on `Dashboard/Tunet/**`
- stop if migration pressure turns this tranche into a cutover tranche instead of a shadow tranche

## OUT_OF_SCOPE

- Tunet inbox card
- rehab dashboard YAML
- standalone inbox dashboard
- removal of current mobile notification writers
- removal of raw `mobile_app_notification_action` handlers
- authoritative cutover of OAL or Sonos flows
- OAL learning log

## REVIEW_FOCUS

- compare-mode safety
- completeness of documented notification coverage
- zero duplicate mobile pushes
- resolver ownership clarity
- preservation of current production behavior
