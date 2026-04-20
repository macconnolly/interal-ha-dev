# TI2A — Mobile Notification Continuity And Compare-Mode Repairs

## TRANCHE_ID

- `TI2A`

## TITLE

- `Preserve current iOS notification delivery, add dashboard tap-through, remove receipt spam, and harden the Sonos/OAL compare-mode writers`

## STATUS

- `DONE`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche inserts itself between the closed UI tranche and the planned authoritative cutover
  - it changes live package notification behavior across both OAL and Sonos
  - it widens from package-only repair into a narrow backend mobile delivery contract update so current `tunet_inbox`-sent iOS notifications can participate in the same tap-through rule

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - new tranche inserted before `TI3`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - current session delta for mobile continuity and compare-mode repairs

## GOAL

- Keep current iOS actionable notifications running, make notification taps open the inbox dashboard, remove noisy confirmation receipts, repair the Sonos alarm path, and add an anti-spam debounce to the OAL TV prompt.

## WHY_NOW

- the user explicitly does not want iOS notifications replaced by the inbox
- current compare-mode direct phone writers still own most live notification sends
- some current-state flows are noisy or broken:
  - Sonos alarm sounding is not dependable enough
  - OAL TV prompts can retrigger too aggressively
  - several handlers still replace actionable pushes with receipt notifications
- these are current-production issues and should be fixed before `TI3` removes more legacy paths

## USER_VISIBLE_OUTCOME

- current actionable iOS notifications still arrive
- tapping those notifications opens the Tunet inbox dashboard path
- Sonos alarm notifications no longer follow up with confirmation receipts
- OAL TV prompt behavior is less spammy under state flapping

## FILES_ALLOWED

- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/mobile.py`
- `tests/components/tunet_inbox/test_mobile.py`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/tranches/TI2A_mobile_notification_continuity_and_compare_mode_repairs.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/config_flow.py`
- `Configuration/configuration.yaml`
- any file outside the worktree root

## CURRENT_STATE

- many compare-mode flows still send direct `notify.notify` or resolved `notify.mobile_app_*` pushes and shadow into `tunet_inbox`
- those direct pushes do not carry a dashboard tap-through URL
- `tunet_inbox` mobile sends also lack a tap-through URL field
- Sonos alarm action handling still emits confirmation receipts
- the generic confirmable notification script still emits confirm/dismiss receipts
- the OAL TV prompt gates on `pending` / `declined`, but it has no dedicated send debounce helper
- `sensor.sonos_alarm_playing` currently restores as `unavailable` after startup and needs a startup-safe evaluation model

## INTENDED_STATE

- direct compare-mode phone notifications keep sending
- the notification body tap opens `/tunet-inbox-yaml/inbox`
- `tunet_inbox`-sent phone notifications support the same `url` contract
- Sonos alarm and generic confirmable flows stop sending informational receipt notifications and instead clear or retire the original actionable prompt
- OAL TV prompts use a dedicated cooldown helper to prevent rapid retriggering
- `sensor.sonos_alarm_playing` uses a startup-safe state-tracked template model and no longer sits restored/unavailable

## EXACT_CHANGE_IN_ENGLISH

- add optional `mobile.url` support to `tunet_inbox` queue items and mobile send payloads
- add test coverage proving mobile URL passthrough
- add a dashboard tap URL to the current direct actionable iOS notifications in OAL and Sonos compare-mode flows
- remove Sonos alarm receipt notifications and replace them with clear-by-tag behavior
- remove generic confirmable receipt notifications and replace them with clear-by-tag behavior
- add a dedicated OAL TV prompt debounce helper and gate both prompt-writer paths with it
- replace the fragile trigger-based Sonos alarm sensor with a startup-safe state-tracked template path

## ARCHITECTURAL_INTENTION

- this tranche preserves compare-mode safety while fixing current-state user experience problems
- it does not cut over authority away from the existing live phone writers
- it aligns current direct notifications with the governed inbox recovery surface before `TI3` makes the inbox more authoritative

## ACCEPTANCE_CRITERIA

- direct compare-mode OAL and Sonos phone notifications still send after the tranche
- those direct notifications include a dashboard tap URL in YAML
- `tunet_inbox` mobile payload construction supports an optional URL and has targeted test coverage
- Sonos alarm confirm/dismiss actions no longer send confirmation receipt pushes
- generic confirmable notifications no longer send confirmation receipt pushes
- OAL TV prompt writers both gate on a dedicated debounce helper
- `sensor.sonos_alarm_playing` no longer sits in restored/unavailable state after reload/startup

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `python3 -m py_compile tests/components/tunet_inbox/*.py`
- `npm run tinbox:check`
- YAML parse validation for:
  - `packages/oal_lighting_control_package.yaml`
  - `packages/sonos_package.yaml`

### Runtime validation

- `npm run tinbox:test`
- inspect the changed YAML blocks and verify:
  - URL is present on direct actionable notifications
  - confirmation receipts are gone from the touched handlers
  - TV prompt debounce helper is written on send and checked on entry
  - the Sonos alarm sensor is defined as a state-tracked template, not a trigger-timed template

### HA/live validation

- deploy updated integration and package files
- if integration Python changes are deployed, perform `ha_check_config()` and restart HA
- reload automations for package changes
- verify:
  - `sensor.sonos_alarm_playing` is no longer stuck restored/unavailable after reload/startup
  - a live or synthetic direct-notification path still sends and logs timeout/clear behavior without confirmation receipts
  - representative OAL direct-notification paths still carry the inbox tap-through URL and prompt debounce guard

## DEPLOY_IMPACT

- `HA RESTART`
- package behavior also requires `HA PACKAGE RELOAD` / automation reload after deploy

## ROLLBACK

- restore prior versions of:
  - `custom_components/tunet_inbox/models.py`
  - `custom_components/tunet_inbox/mobile.py`
  - `packages/oal_lighting_control_package.yaml`
  - `packages/sonos_package.yaml`
- restart HA if backend files were rolled back
- reload automations

## DEPENDENCIES

- `TI2` is closed
- no Tunet frontend file changes are needed for this tranche
- inbox dashboard route `/tunet-inbox-yaml/inbox` already exists live

## UNKNOWNS

- whether any current iOS action handlers depend on the old receipt notifications for operator feedback
- whether Sonos alarm prompting needs an additional cooldown helper beyond the startup-trigger repair

## STOP_CONDITIONS

- stop if this tranche requires widening into `Dashboard/Tunet/**`
- stop if direct phone tap-through needs Browser Mod popup semantics instead of standard notification URL support
- stop if the Sonos alarm failure requires a deeper rewrite of the alarm-detection model instead of a safe trigger/notification repair

## OUT_OF_SCOPE

- authoritative OAL cutover
- Sonos authoritative cutover
- new inbox card work
- changing `tunet_inbox` service semantics beyond the optional mobile URL field

## REVIEW_FOCUS

- preservation of current phone delivery
- correctness of dashboard tap-through URL wiring
- removal of confirmation receipt spam without losing clear behavior
- debounce safety on the OAL TV prompt
- Sonos alarm-path stability after restart
