# Tunet Inbox Fix Ledger

Working branch: `tunet/inbox-integration`  
Last updated: 2026-04-20

## Session Delta (2026-04-20, TI5A closeout — Apple TV authoritative cutover live-proven)

Change marker: close the split Apple TV tranche against real phone, dashboard, and resolver proof without reopening backend scope or widening into OAL TV-family work

- `CHOSEN INTERPRETATION`
  - TI5A closes on the governed functional boundary, not just package shape:
    - package deploy to HA disk
    - `script.reload`
    - `automation.reload`
    - phone body-tap proof
    - phone keep-on proof
    - phone confirm-off proof
    - dashboard-card `tunet_inbox.respond` proof
    - duplicate replay rejection
    - natural context-clear resolver proof
  - the natural-clear path is only credible when the item exists in the real paused/on eligible state; proving it from an already-cleared state would be misleading
  - TI5A should close only after restoring the living-room entities and helper guard to a clean post-proof baseline
- `CHOSEN IMPLEMENTATION`
  - deploy only `packages/sonos_package.yaml` using the existing backup-and-verify pattern rather than the broader all-package helper
  - record remote backup `Backups/tunet_inbox/packages/sonos_package.20260419_222907.remote.yaml`
  - prove:
    - user-confirmed body tap opened the inbox
    - user-confirmed `No, Keep On` cleared the notification while Apple TV and TV stayed on
    - user-confirmed `Yes, Turn Off` cleared the notification while Apple TV and TV both turned off
    - dashboard-card `tunet_inbox.respond(... source='dashboard_card')` was accepted, then duplicate replay returned `accepted: false, reason: item_not_found`
    - `automation.sonos_apple_tv_auto_off_shadow_resolver` triggered from `input_boolean.apple_tv_no_auto_off via template` and cleared the pending item
  - restore `input_boolean.apple_tv_no_auto_off = off` and both living-room media players to `off`
- `RESULT`
  - TI5A is closed
  - `TINBOX-SONOS-3` is closed
  - `TI5B` is now the next `READY TO START` tranche
  - the known-broken Apple TV confirm path is now fixed through the governed inbox lifecycle

## Session Delta (2026-04-19, TI5A in flight — Apple TV auto-off extracted off confirmable_notification)

Change marker: start the first split TI5 tranche by removing the last live Sonos dependency on the raw mobile confirmable bridge without widening into OAL TV-family or unified-timer work

- `CHOSEN INTERPRETATION`
  - the true TI5A boundary is package-only Sonos Apple TV auto-off:
    - authoritative writer
    - governed action handler
    - existing natural context resolver
  - `script.confirmable_notification` can remain defined in the package as an inert helper, but it must no longer be used by any live production path
  - the cleanest cutover is to keep the existing action ids:
    - `SONOS_ATV_CONFIRM_OFF`
    - `SONOS_ATV_KEEP_ON`
  - `TI5B` and `TI5C` stay frozen behind TI5A rather than widening the next slice
- `CHOSEN IMPLEMENTATION`
  - update only `packages/sonos_package.yaml`
  - change `script.apple_tv_auto_off_notification` from:
    - shadow `tunet_inbox.post(send_mobile=false)` plus `script.confirmable_notification`
  - to:
    - authoritative `tunet_inbox.post(send_mobile=true)` with governed mobile clear
  - add a dedicated `tunet_inbox_action` handler for the two Apple TV actions
  - keep the existing Apple TV context-clear resolver
- `RESULT`
  - local package shape now matches TI5A intent:
    - the Apple TV auto-off writer is authoritative
    - the legacy confirmable bridge is removed from the production path
    - a dedicated governed action handler now owns confirm/keep-on behavior
    - the context-clear resolver remains the natural clear owner
  - remaining tranche gate:
    - static validation
    - package deploy/reload
    - full HA/live proof with final user feedback

## Session Delta (2026-04-19, TI5 planning freeze — split the remaining expansion bucket by actual mechanism)

Change marker: replace the broad TI5 placeholder with tranche boundaries that follow the actual remaining package mechanisms instead of one generic "expansion" bucket

- `CHOSEN INTERPRETATION`
  - the existing TI5 bucket is not maximally pure architecture:
    - `sonos_apple_tv_auto_off` is a Sonos-specific Apple TV inactivity flow that still routes through `script.confirmable_notification`
    - the remaining OAL TV-family flows share one OAL TV session handler/resolver state machine
    - unified timer expiry is a separate OAL arbiter with its own writer/handler path
  - these are related at a program level but not one coherent implementation slice
  - the clean governance move is to split them before any new coding starts
- `CHOSEN IMPLEMENTATION`
  - replace `TI5` with:
    - `TI5A` = `sonos_apple_tv_auto_off` authoritative extraction off `script.confirmable_notification`
    - `TI5B` = OAL TV-family compare-mode retirement
    - `TI5C` = OAL unified timer authoritative cutover
  - author tranche specs for each new slice
  - update `plan.md`, `handoff.md`, and `Docs/execution_ledger.md` to make `TI5A` the next ready tranche
- `RESULT`
  - the next tranche is now a real frozen execution authority instead of a backlog bucket
  - the known broken Apple TV auto-off action is the next governed coding target
  - later TV-family and unified-timer work now have explicit proof obligations instead of being implied future scope

## Session Delta (2026-04-19, TI4A closeout — evening-alarm extraction proven, TI5 prepared)

Change marker: close the separate evening-alarm Sonos tranche against live phone and dashboard evidence, then normalize the next tranche around TI5 with explicit end-of-tranche user validation

- `CHOSEN INTERPRETATION`
  - TI4A closes on the governed functional boundary, not on perfect notify-group fan-out behavior
  - the duplicate notification symptom observed on `Mac's iPhone personal` is not the old shadow path:
    - one inbox item was created
    - the governed phone and dashboard actions worked
    - queue cleanup returned to `meta.total: 0`
  - the remaining duplication is delivery routing through `notify.tunet_inbox_all_devices`, which the user explicitly scoped out of TI4A
  - TI5 is the next tranche and should already carry the rule that closure requires final live user feedback and end-of-tranche testing
- `CHOSEN IMPLEMENTATION`
  - close TI4A in governance
  - update the Sonos compare-mode inventory so `sonos_evening_alarm_check` is authoritative
  - promote TI5 to the next ready tranche
  - record the package reload rule proved by TI4A:
    - `automation.reload` is insufficient when the package change touches `script:` bodies
    - mixed script/automation package edits must run both `script.reload` and `automation.reload`
- `RESULT`
  - live TI4A proof passed:
    - body tap opened the inbox correctly
    - `Keep Enabled` cleared the notification
    - dashboard-card `Disable` produced the nightly domain outcome:
      - `input_text.sonos_alarms_disabled_for_tomorrow = switch.sonos_alarm_182`
      - `switch.sonos_alarm_182` turned `off`
    - alarm state was restored after proof:
      - `switch.sonos_alarm_182` back `on`
      - disabled helper cleared
      - `sensor.sonos_alarms_for_tomorrow` back to `1 alarm(s) scheduled for tomorrow.`
    - final `tunet_inbox.list_items` returned `meta.total: 0`
    - the user confirmed the governed functionality is fully baked
  - governance result:
    - `TINBOX-SONOS-2` can close
    - `TI4A` can close
    - `TI5` is now the next ready tranche
  - carried-forward watchpoints:
    - duplicate delivery on `Mac's iPhone personal` is treated as notify-group fan-out outside TI4A scope
    - the Apple TV turn-off failure remains owned evidence for TI5

## Session Delta (2026-04-19, TI4A in flight — evening-alarm prompt extracted off inline raw mobile waits)

Change marker: start the separate evening-alarm Sonos tranche and remove the legacy inline phone-wait mechanics without widening into Apple TV or reopening the alarm-playing pilot

- `CHOSEN INTERPRETATION`
  - `sonos_evening_alarm_check` is still a distinct extraction problem, not leftover TI4 cleanup
  - the true minimal change set is package-only:
    - authoritative writer
    - governed action handler
    - preserve the existing resolver for timeout/window/no-alarms ownership
  - the old direct `notify.notify` writer, dynamic raw action ids, and inline `wait_for_trigger` all belong to the same legacy control path and must be removed together
  - `sonos_alarm_playing` remains closed and `sonos_apple_tv_auto_off` remains with `TI5`
- `CHOSEN IMPLEMENTATION`
  - update only `packages/sonos_package.yaml`
  - convert `script.evening_alarm_check_notification` to `tunet_inbox.post(send_mobile=true)` with:
    - stable action ids:
      - `SONOS_DISABLE_TOMORROW`
      - `SONOS_KEEP_TOMORROW`
    - `mobile.clear_on_resolve: true`
  - remove:
    - direct `notify.notify`
    - dynamic `context.id`-derived mobile action ids
    - inline `wait_for_trigger` over `mobile_app_notification_action`
  - add a dedicated `tunet_inbox_action` handler for the two nightly actions
  - keep the existing nightly resolver as the owner for timeout/window/no-alarm cleanup
- `RESULT`
  - local package shape now matches TI4A intent:
    - authoritative mobile delivery is owned by `tunet_inbox`
    - stable governed action ids replace the dynamic raw action ids
    - no inline raw mobile wait path remains in the nightly prompt
    - timeout/window/no-alarm cleanup stays with the dedicated resolver
  - static validation passed:
    - YAML parse check for `packages/sonos_package.yaml`
    - `npm run tinbox:check`
  - governance normalization while in flight:
    - `TI4A` is now `ACTIVE`
    - stale handoff/ledger statements that still implied Sonos alarm-playing was merely mirrored are corrected
  - remaining tranche gate:
    - package deploy/reload and full HA/live proof, including final live user feedback, still remain before TI4A can close

## Session Delta (2026-04-19, TI4 closeout — Sonos alarm-playing pilot closed, TI4A promoted)

Change marker: close the first Sonos authoritative pilot against live phone and dashboard evidence, then promote the evening-alarm extraction tranche

- `CHOSEN INTERPRETATION`
  - TI4 can close without widening into other Sonos flows
  - the missing closeout evidence was purely live proof:
    - explicit body-tap confirmation
    - explicit clear behavior after a second live test
  - the reported Apple TV turn-off failure is real but remains owned by `TI5`, not TI4
- `CHOSEN IMPLEMENTATION`
  - keep the TI4 code boundary unchanged after the package cutover
  - close TI4 in governance
  - promote `TI4A` to `READY TO START`
  - carry the Apple TV failure forward as governed `TI5` evidence
- `RESULT`
  - final TI4 live user feedback completed:
    - tapping the notification body opened the inbox surface correctly
    - the governed Sonos alarm controls worked from both the phone notification action and the dashboard
    - both notifications cleared on the second live test
  - final live queue proof passed:
    - `tunet_inbox.list_items` returned `meta.total: 0`
  - governance result:
    - `TINBOX-SONOS-1` can close
    - `TI4` can close
    - `TI4A` is now `READY TO START`
  - carried-forward watchpoint:
    - live user feedback indicates the current `sonos_apple_tv_auto_off` turn-off action still fails, reinforcing that this flow stays in `TI5`

## Session Delta (2026-04-19, TI4 in flight — Sonos alarm-playing pilot cut over and live action proof recorded)

Change marker: promote TI4 to active, execute the package-only alarm-playing cutover, and record only the proof actually gathered so far

- `CHOSEN INTERPRETATION`
  - TI4 can execute wholly inside `packages/sonos_package.yaml`
  - the minimal correct change set is:
    - authoritative writer
    - canonical action handler
    - natural-stop resolver alignment
  - the direct mobile writer and raw `mobile_app_notification_action` triggers are the duplicated legacy path for this pilot and must be removed together
  - `sonos_apple_tv_auto_off` remains out of scope for TI4, but live user feedback that its actual turn-off action still fails is relevant evidence for `TI5`
- `CHOSEN IMPLEMENTATION`
  - promote `TI4` to `ACTIVE` in governance
  - edit only the `sonos_alarm_playing` writer, handler, and natural clear branches in `packages/sonos_package.yaml`
  - remove the direct package-owned phone send
  - convert the shadow queue post into `tunet_inbox.post(send_mobile=true)`
  - remove raw `mobile_app_notification_action` triggers from the pilot handler so only `tunet_inbox_action` remains
  - align the natural clear path to `tunet_inbox.resolve` using the same key fallback as the writer
- `RESULT`
  - local validation passed:
    - YAML parse check for `packages/sonos_package.yaml`
    - `npm run tinbox:check`
    - `npm run tinbox:test` -> `28 passed`
  - package deploy/reload passed:
    - remote backup: `Backups/tunet_inbox/packages/sonos_package.20260419_124445.remote.yaml`
    - remote package copy verified by byte count
    - `ha_check_config() -> valid`
    - `automation.reload` succeeded
  - live pilot proof recorded:
    - real writer trace posted `sonos_alarm_playing:media_player.bedroom` through `tunet_inbox.post(send_mobile=true)` with mobile tag `sonos_alarm_playing`
    - user confirmed mobile delivery succeeded
    - user confirmed the governed alarm controls worked from both the phone notification action and the dashboard
    - action-handler traces show only `tunet_inbox_action` triggers for the live pilot actions
    - duplicate replay proof passed with `accepted: false, reason: item_not_found` on a completed pilot item
  - remaining TI4 closeout gap:
    - explicit proof that notification body tap opens the governed inbox surface
    - a separate natural-stop proof where the alarm stops without an inbox action and the queue/mobile clear path still completes deterministically
  - forward signal for later scope:
    - live user feedback indicates the current `sonos_apple_tv_auto_off` turn-off action still does not work and should remain a governed `TI5` issue, not a TI4 scope expansion

## Session Delta (2026-04-19, TI4 scope reframe — split Sonos rollout by actual package boundary)

Change marker: re-check whether the narrow TI4 scope was stale governance residue, then split the Sonos rollout where the package mechanics actually diverge

- `CHOSEN INTERPRETATION`
  - the narrow `TI4` scope is not just an inherited freeze
  - the actual Sonos package shapes are different enough to justify separate tranches:
    - `sonos_alarm_playing` already has the right authoring shape for a first authoritative pilot:
      - direct mobile writer
      - shadow `tunet_inbox.post`
      - shared action handler that already listens to both raw mobile events and `tunet_inbox_action`
      - natural stop resolver
    - `sonos_evening_alarm_check` is a distinct extraction problem:
      - direct `notify.notify`
      - shadow `tunet_inbox.post`
      - dynamic raw mobile action ids derived from `context.id`
      - inline `wait_for_trigger`
    - `sonos_apple_tv_auto_off` belongs with the later confirmable/TV cleanup:
      - it still routes through `script.confirmable_notification`
      - it resolves its shadow item immediately after the legacy confirmable path returns
  - the correct governance move is therefore:
    - keep `TI4` for `sonos_alarm_playing`
    - create `TI4A` for `sonos_evening_alarm_check`
    - move `sonos_apple_tv_auto_off` explicitly into `TI5`
- `CHOSEN IMPLEMENTATION`
  - add `custom_components/tunet_inbox/Docs/tranches/TI4A_sonos_evening_alarm_authoritative_extraction.md`
  - update `plan.md` program order and dependency rules to insert `TI4A`
  - reframe `TI4` as the alarm-playing pilot specifically
  - update `execution_ledger.md`, `handoff.md`, and `TI1E` flow inventory to reflect:
    - `TI4` = `sonos_alarm_playing`
    - `TI4A` = `sonos_evening_alarm_check`
    - `TI5` = `sonos_apple_tv_auto_off` plus broader confirmable/TV cleanup
- `RESULT`
  - the Sonos rollout is now split by real implementation boundary rather than by a generic “mirror-only” label
  - the next session can start `TI4` directly without carrying evening-alarm or Apple-TV ambiguity
  - `TI4A` is now explicit instead of being hidden future work
  - `TI5` now clearly owns `sonos_apple_tv_auto_off`

## Session Delta (2026-04-18, TI4 planning freeze — Sonos pilot tranche spec authored with user-feedback closeout)

Change marker: freeze the next Sonos pilot before execution and make final live user feedback part of tranche closure rather than an optional follow-up

- `CHOSEN INTERPRETATION`
  - `TI3` is closed and the next governed slice is now the first Sonos authoritative pilot
  - `sonos_alarm_playing` is the only Sonos flow currently classified as safe to cut over:
    - `shadow + action-ready`
  - `sonos_evening_alarm_check` and `sonos_apple_tv_auto_off` remain `shadow + mirror-only` and must stay out of scope
  - because this tranche affects a live phone flow, backend and package proof alone is not sufficient for closeout
  - tranche closure must include final live user validation of the delivered phone experience and that feedback must be recorded in governance
- `CHOSEN IMPLEMENTATION`
  - author `custom_components/tunet_inbox/Docs/tranches/TI4_sonos_pilot_migration.md`
  - wire the tranche doc into `plan.md`
  - keep `TI4` at `READY TO START`, not `ACTIVE`
  - make these end-of-tranche checks explicit:
    - real governed mobile delivery
    - body tap opens the governed inbox surface
    - one chosen phone action is confirmed by the user
    - the user feedback is recorded before TI4 closes
- `RESULT`
  - `TI4` now has a frozen execution authority instead of only a program-level placeholder
  - the next session can start directly from the TI4 tranche doc without re-planning the Sonos pilot
  - governance now treats live user feedback as part of TI4 closeout evidence, not as optional anecdotal follow-up

## Session Delta (2026-04-18, TI3 closeout — frozen OAL cutover set promoted and closed)

Change marker: finish the first authoritative OAL cutover without widening the tranche beyond its frozen file and flow boundary

- `CHOSEN INTERPRETATION`
  - the frozen TI3 set was already closer to authoritative than the tranche doc implied:
    - `oal_override_reminder` and `oal_override_expiring:<zone>` already posted via `tunet_inbox` and handled `tunet_inbox_action`
    - `oal_tv_mode_prompt:living_room` already handled `tunet_inbox_action` for the cutover actions
  - the remaining contract drift inside TI3 was narrower:
    - the cutover writers still carried raw `mobile.url` literals even though `TI2C` made backend-owned tap defaults authoritative
  - the correct TI3 code change is therefore:
    - remove raw `mobile.url` from the frozen OAL cutover writers only
    - leave bridge, presence-loss, TV-mode-activated, unified-timer, and Sonos flows untouched
- `CHOSEN IMPLEMENTATION`
  - edit only `packages/oal_lighting_control_package.yaml`
  - remove `mobile.url` from:
    - `oal_override_reminder`
    - `oal_override_expiring:<zone>`
    - both `oal_tv_mode_prompt:living_room` writer branches
  - keep action IDs, keys, handlers, and resolvers unchanged
  - prove the cutover set with:
    - real override-reminder writer + dashboard action + natural resolver proof
    - real override-expiring writer + simulated phone action proof
    - bounded synthetic TV prompt proof for swipe-dismiss safety, dismiss handling, and natural resolver ownership because Apple TV playback manipulation was intentionally out of scope
- `RESULT`
  - local/static validation passed:
    - YAML parse check for `packages/oal_lighting_control_package.yaml`
    - `npm run tinbox:check`
    - `npm run tinbox:test` -> `28 passed`
  - package deploy/reload passed:
    - remote backup: `Backups/tunet_inbox/packages/oal_lighting_control_package.20260418_120035.remote.yaml`
    - remote copy verified by size
    - `ha_check_config() -> valid`
    - `automation.reload` succeeded
  - live proof passed:
    - override reminder writer created an item with normalized `mobile.url = http://10.0.0.21:8123/tunet-inbox-yaml/inbox`
    - dashboard `OAL_RESET_LIGHTS` action was accepted and returned active overrides to `0`
    - duplicate replay returned `accepted: false, reason: item_not_found`
    - override-reminder natural resolver closed the item after `script.oal_reset_soft`
    - override-expiring writer created an item with normalized configured route
    - simulated phone action through `mobile_app_notification_action` produced a real `tunet_inbox_action` handler trace and resolved the item
    - TV prompt package writers no longer carry `mobile.url`
    - simulated `mobile_app_notification_cleared` left the TV prompt inbox item intact
    - dashboard `OAL_TV_DISMISS` drove the real handler branch, clearing the queue item and setting the expected helper/timer state
    - TV prompt resolver ownership was proven by flipping `input_boolean.oal_tv_mode_prompt_pending` off and observing queue resolution
    - final `tunet_inbox.list_items` returned `total: 0`
  - governance result:
    - `TINBOX-OAL-1` and `TINBOX-OAL-2` can close
    - `TI3` can close
    - `TI4` can move to `READY TO START`

## Session Delta (2026-04-18, TI2C closeout — browser-reload proof accepted, TI3 promoted)

Change marker: close the tap-contract tranche against the evidence the user approved, then promote the frozen OAL cutover tranche

- `CHOSEN INTERPRETATION`
  - the restart-specific failure mode was real and the fix remains necessary
  - the current operator policy is also real:
    - no further HA restarts should be used for this workstream unless the user explicitly requests one
    - browser reload of the integration is the governed live activation path
  - `TI2C` therefore closes on:
    - local regression covering import-option preservation
    - browser-reload live activation
    - live canonical/compatibility/rejection proof for the configured route
  - full-restart validation is no longer a tranche gate under the current user policy
- `CHOSEN IMPLEMENTATION`
  - keep the import-preservation fix in `custom_components/tunet_inbox/config_flow.py`
  - keep the targeted regression in `tests/components/tunet_inbox/test_config_flow.py`
  - reload `Tunet Inbox` from the HA integrations UI instead of restarting HA
  - re-run configured-route proof after reload and normalize governance to:
    - close `TI2C`
    - close `TINBOX-CONTRACT-3`
    - close `TINBOX-TEST-3`
    - promote `TI3`
- `RESULT`
  - browser reload confirmation was observed in HA UI
  - post-reload live proof passed:
    - configured route: `http://10.0.0.21:8123/tunet-inbox-yaml/inbox`
    - canonical `send_mobile=true` post accepted and persisted
    - matching legacy `mobile.url` accepted and persisted
    - mismatched legacy `mobile.url` rejected with `service_validation_error`
    - queue cleanup returned the live queue to `total: 0`
  - `TI2C` is now closed on the governed proof set
  - `TI3` is the active tranche

## Session Delta (2026-04-18, User policy lock — prefer browser integration reload over HA restart)

Change marker: make the operator preference explicit so future sessions do not drift back to restart-heavy validation

- `CHOSEN INTERPRETATION`
  - the user explicitly does not want further HA restarts used as the default activation/validation path for this workstream
  - for `tunet_inbox`, the preferred live activation step is manual browser reload of the integration entry
- `CHOSEN IMPLEMENTATION`
  - record the exact UI reload path in `custom_components/tunet_inbox/AGENTS.md`
  - mirror the same preference into current tranche governance and handoff notes
- `RESULT`
  - future sessions should prefer:
    - `Settings -> Devices & Services -> Integrations -> Tunet Inbox -> service row menu -> Reload`
  - full HA restart now requires explicit user request rather than being treated as the default next step

## Session Delta (2026-04-18, TI2C blocker proved — import restart wipe fixed locally, activation deferred)

Change marker: prove the hidden restart failure mode, narrow the fix to import-option preservation, and stop short of false closure when the user deferred another HA reboot

- `CHOSEN INTERPRETATION`
  - the configurable tap URL looked complete until the live import-backed entry was exercised through a restart
  - proof showed the real blocker:
    - the options flow could set `mobile_tap_url`
    - the current runtime honored that non-default route
    - but a normal HA restart wiped the option because the YAML import path cleared `entry.options` wholesale
  - this is not a package or dashboard issue
  - it is a config-entry import precedence defect inside the `TI2C` boundary
- `CHOSEN IMPLEMENTATION`
  - keep YAML authoritative only for overlapping imported keys
  - preserve non-overlapping options on import so settings-only values such as `mobile_tap_url` survive restart when YAML does not specify them
  - implement the fix narrowly in `custom_components/tunet_inbox/config_flow.py`
  - add a targeted regression in `tests/components/tunet_inbox/test_config_flow.py`
  - redeploy the integration payload, but do not claim activation without a new HA restart
- `RESULT`
  - local validation passed:
    - `source .venv-tinbox/bin/activate && pytest -q tests/components/tunet_inbox/test_config_flow.py` -> `6 passed`
    - `npm run tinbox:test` -> `28 passed`
    - `npm run tinbox:check`
  - live no-restart proof passed on the current runtime with configured route:
    - `mobile_tap_url = http://10.0.0.21:8123/tunet-inbox-yaml/inbox`
    - `tunet_inbox.post(send_mobile=true)` accepted and persisted that configured route
    - matching legacy `mobile.url` was accepted and persisted
    - mismatched legacy `mobile.url` was rejected at the websocket service boundary with `service_validation_error`
    - proof item cleanup returned the queue to `total: 0`
  - activation state:
    - the updated integration payload is deployed to `/config/custom_components/tunet_inbox/`
    - one future HA restart is still required to activate and prove the import-preservation fix in the live runtime
    - the user explicitly deferred that extra reboot, so `TI2C` stays active

## Session Delta (2026-04-18, Integration deploy helper clarified and hardened)

Change marker: remove ambiguity between integration deploy and package-only reload work while HA restart is pending

- `CHOSEN INTERPRETATION`
  - the operator path must say plainly that `tinbox:deploy:integration` deploys the `custom_components/tunet_inbox` integration, not package YAML
  - because `TI2C` currently depends on repeated live backend proof, the deploy helper should verify the remote integration payload landed before telling the operator to restart HA
- `CHOSEN IMPLEMENTATION`
  - harden `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh` with:
    - local integration sentinel checks before deploy
    - explicit logging of the integration source and remote target
    - remote sentinel verification for `manifest.json`, `__init__.py`, and `services.py` after copy
  - sync operator docs so the deploy path is clearly separated from package-only reload work
- `RESULT`
  - the governed deploy helper now explicitly covers the integration payload
  - package-only TI3 work remains a separate deploy/reload path and is not conflated with integration deploy

## Session Delta (2026-04-18, TI2C reopened — configurable default tap URL required)

Change marker: the backend-owned default route is correct, but it must be user-configurable in integration settings with the current inbox route as fallback

- `CHOSEN INTERPRETATION`
  - hardcoding `/tunet-inbox-yaml/inbox` as the only backend-owned default is no longer sufficient
  - the governed default tap URL must come from integration settings when configured and fall back to `/tunet-inbox-yaml/inbox` when unset
  - this changes the validation boundary:
    - compatibility `mobile.url` can only be validated against the currently configured governed route
    - config-entry and runtime settings must therefore participate in the contract
- `CHOSEN IMPLEMENTATION`
  - reopen `TI2C` instead of closing it
  - widen the file boundary to config-entry/runtime configuration files and their tests
  - keep package files and `Dashboard/Tunet/**` out of scope
  - preserve the already-proven fallback route behavior while adding configuration support
  - send a fresh live notification through `tunet_inbox` for manual user tap validation during the reopened tranche
- `RESULT`
  - `TI2C` stays active and `TI3` stays not ready
  - the sent manual validation notification is:
    - `key: ti2c_user_mobile_test_20260418_104151`
    - `item_id: 2b252621-c8bb-4fc1-b04e-ec9e911f2b26`
  - local proof already in hand for the fallback route remains valid:
    - `npm run tinbox:test` -> `24 passed`
    - `npm run tinbox:check`
    - integration-only deploy
    - HA restart
    - `npm run tinbox:smoke`
    - live fallback-route `post/list/dismiss` proof returned the queue to `total: 0` before the new manual test notification was sent

## Session Delta (2026-04-18, TI2C planning freeze — inbox tap contract canonicalization)

Change marker: step back before `TI3`, turn the user-visible tap intent into the next governed backend tranche, and re-sequence the program before any implementation widens again

- `CHOSEN INTERPRETATION`
  - the core user-visible intent is:
    - a person taps a mobile notification
    - the app opens the governed inbox surface
    - the newest item is available at the top of the stack for action
  - that intent does not require item-specific deep links
  - `TI2B` remains a valid closed tranche, but only as a parity patch:
    - it aligned the public service schema with the existing `mobile.url` model/runtime path
    - it did not settle the durable contract boundary for inbox tap ownership
  - the durable contract should be:
    - backend-owned inbox tap behavior
    - HA-native `data.url` emitted by the integration adapter
    - caller-owned raw route strings treated as temporary compatibility only
  - the next correct step is therefore a new control tranche before `TI3`, not immediate OAL package cutover
- `CHOSEN IMPLEMENTATION`
  - insert `TI2C — Inbox Tap Contract Canonicalization` between `TI2B` and `TI3`
  - make `TI2C` the active control tranche
  - push `TI3` back behind `TI2C`
  - keep `TI2C` backend-only plus governance docs:
    - no package edits
    - no `Dashboard/Tunet/**` edits
  - freeze the first `TI4` Sonos authoritative pilot to:
    - `sonos_alarm_playing` only
  - keep these Sonos flows out of `TI4` until explicitly reclassified:
    - `sonos_evening_alarm_check`
    - `sonos_apple_tv_auto_off`
- `RESULT`
  - governance now records `TI2B` as the closed parity patch and `TI2C` as the durable contract tranche
  - `TI3` is no longer treated as ready to start
  - the next implementation session has a bounded backend contract target instead of implicit architecture debate
  - planning-control audit revalidated the current parity baseline:
    - `npm run tinbox:check`
    - `npm run tinbox:test` -> `21 passed`
    - `npm run tinbox:smoke`
    - live `tunet_inbox.post(send_mobile=false)` with canonical `mobile.url` returned `accepted: true`
    - live `tunet_inbox.list_items` showed the persisted canonical `mobile.url`
    - the audit item was dismissed successfully
  - one stale live ops probe item remains and is now recorded for cleanup before the next fresh proof run:
    - `ti2b_mobile_delivery_probe_20260418_002343`

## Session Delta (2026-04-18, TI2B closure — public mobile.url service-schema parity proven)

Change marker: close the narrow backend contract-control tranche after local validation, integration-only deploy, HA restart, smoke proof, and live `mobile.url` service proof

- `CHOSEN INTERPRETATION`
  - the blocker was real:
    - `models.py` and `mobile.py` already supported `mobile.url`
    - the public `tunet_inbox.post` service schema in `services.py` rejected it
    - that mismatch was sufficient to block authoritative TI3 cutover even though the lower layers already worked
  - architecture pressure test result:
    - keep the current HA-native `mobile.url` path to `/tunet-inbox-yaml/inbox`
    - do not introduce Browser Mod or any standalone server/bridge for notification body tap-through
    - this decision is now recorded as the narrow parity choice that unblocked the next control tranche, not as the final durable contract direction
  - chosen implementation:
    - add only `url` to the public `MOBILE_SCHEMA`
    - document `mobile.url` in `services.yaml`
    - add one service-boundary regression proving `tunet_inbox.post` accepts and persists `mobile.url`
    - keep the fix intentionally limited to public schema parity
    - do not mix any OAL or Sonos package changes into this tranche
- `RESULT`
  - local validation passed:
    - `python3 -m py_compile custom_components/tunet_inbox/*.py`
    - `python3 -m py_compile tests/components/tunet_inbox/*.py`
    - `npm run tinbox:check`
    - `npm run tinbox:test` -> `21 passed`
  - live validation passed:
    - integration-only deploy from the worktree
    - `ha_check_config() -> valid`
    - HA restart
    - `npm run tinbox:smoke`
    - live `tunet_inbox.post` with `mobile.url` returned `accepted: true`
    - live `tunet_inbox.list_items` showed stored `mobile.url: "/tunet-inbox-yaml/inbox"`
    - proof item cleanup returned the queue to `total: 0`
  - governance result:
    - `TINBOX-CONTRACT-2` can close
    - `TI2B` can close
    - `TI3` can return to `READY TO START`
  - scope integrity result:
    - no package changes were mixed into the tranche

## Session Delta (2026-04-17, TI2B planning freeze — narrow backend unblock tranche)

Change marker: write the unblock tranche spec before implementation so the next backend pass stays contract-focused and does not drift back into package work

- `CHOSEN INTERPRETATION`
  - the correct next step is not “fix the bug somewhere.” It is to freeze a narrow tranche that reconciles one public contract mismatch:
    - `mobile.url` is already supported by the model layer and mobile sender
    - the public `tunet_inbox.post` service schema rejects it
  - chosen implementation:
    - insert `TI2B` between `TI2A` and `TI3`
    - make `TI2B` the next active control tranche
    - keep `TI3` blocked until `TINBOX-CONTRACT-2` is closed
    - define `TI2B` as:
      - one schema fix in `services.py`
      - one operator-doc sync in `services.yaml`
      - service-boundary regression tests
      - live `tunet_inbox.post` proof with `mobile.url`
- `RESULT`
  - the next implementation session can execute against a narrow, production-grade contract-control slice
  - OAL package work remains frozen until the backend service path is truly aligned with the documented contract

## Session Delta (2026-04-17, TI3 stop condition — `mobile.url` service-schema blocker)

Change marker: attempt the frozen TI3 OAL authoritative cutover set, prove the live blocker, restore package safety, and freeze the tranche as blocked

- `CHOSEN INTERPRETATION`
  - TI3 required these three OAL flows to become inbox-authoritative while still preserving notification-body tap-through to `/tunet-inbox-yaml/inbox`
  - live proof showed a contract split:
    - `InboxMobileConfig` and `mobile.py` already support `mobile.url`
    - `services.py` rejects `mobile.url` because `MOBILE_SCHEMA` does not allow it
  - chosen implementation:
    - prove the blocker live with direct API calls:
      - `tunet_inbox.post` without `mobile.url` succeeds
      - `tunet_inbox.post` with `mobile.url` returns `400 Bad Request`
    - stop TI3 inside the tranche boundary instead of widening backend code
    - restore the three touched OAL flows to safe compare-mode so direct iOS notifications keep working and inbox shadowing remains available where safe
    - redeploy the OAL package and reload automations
- `RESULT`
  - TI3 cannot legally complete inside package-only scope
  - the precise blocker is now documented:
    - authoritative mobile delivery with tap-through requires a backend service-schema change
  - the frozen TI3 flows were restored to safe compare-mode:
    - `oal_override_reminder`
    - `oal_override_expiring:<zone>`
    - `oal_tv_mode_prompt:living_room`
  - live recovery proof recorded:
    - package redeployed from the worktree
    - `ha_check_config() -> valid`
    - `automation.reload` succeeded
    - probe item was dismissed
    - `tunet_inbox.list_items` returned an empty queue

## Session Delta (2026-04-17, Governance normalization before TI3)

Change marker: reconcile the governance stack into a Codex-optimized current-state order before starting authoritative OAL cutover

- `CHOSEN INTERPRETATION`
  - the user wanted the governance pack to be the fastest reliable entry point for the next Codex session, not a historical narrative with stale tranche notes
  - chosen implementation:
    - normalize `handoff.md` into current state, latest proof, known gaps, and next tranche only
    - remove stale `TI2A active` / `TI3 blocked` language from `execution_ledger.md`
    - update the execution appendix so it reflects that UI proof already exists and the remaining functional gap is authoritative cutover
    - freeze the initial TI3 cutover set inside the tranche doc:
      - `oal_override_reminder`
      - `oal_override_expiring:<zone>`
      - `oal_tv_mode_prompt:living_room`
    - align `plan.md` terminology with `TI3 — OAL Authoritative Cutover And Resolver Cleanup`
- `RESULT`
  - the next Codex session can start directly from the active tranche doc without re-planning the whole project
  - the governance stack now distinguishes clearly between:
    - completed compare-mode, UI, and mobile continuity work
    - remaining authoritative cutover work
    - intentionally deferred Sonos and expansion work
  - known gaps are now explicit and non-stale

## Session Delta (2026-04-17, TI2A closure — mobile continuity and compare-mode repair)

Change marker: close the post-UI repair tranche by keeping current iOS delivery live, wiring notification-body tap-through to the inbox, removing receipt spam, and fixing the Sonos alarm startup path

- `CHOSEN INTERPRETATION`
  - the user did not want inbox shadowing to replace current iOS notifications
  - chosen implementation:
    - add optional `mobile.url` support to the `tunet_inbox` backend mobile payload
    - standardize the current tap-through route on `/tunet-inbox-yaml/inbox`
    - leave current direct OAL/Sonos iOS writers in place and add `data.url` to the touched direct-notification paths
    - replace the touched informational confirmation/receipt notifications with `clear_notification`
    - keep the OAL TV prompt debounce explicit and global via `input_datetime.oal_last_tv_mode_prompt_notification`
    - abandon the fragile trigger-based `sensor.sonos_alarm_playing` model in favor of a simpler state-tracked template sensor that survives reload/startup cleanly
- `RESULT`
  - the direct-notification compare-mode path remains intact; inbox did not replace iOS delivery
  - notification-body tap-through is now explicitly supported in both:
    - backend mobile payloads sent by `tunet_inbox`
    - touched direct package-owned iOS notifications
  - the touched Sonos and OAL handlers no longer emit confirmation receipts after action/timeout paths
  - the OAL TV prompt writers now share an explicit 5-minute send debounce
  - local validation passed:
    - `python3 -m py_compile custom_components/tunet_inbox/*.py`
    - `python3 -m py_compile tests/components/tunet_inbox/*.py`
    - `npm run tinbox:check`
    - `npm run tinbox:test` -> `20 passed`
  - live validation passed:
    - integration and package deploy from the worktree
    - `ha_check_config() -> valid`
    - HA restart
    - `npm run tinbox:smoke`
    - `npm run tinbox:probe:api`
    - a timed `script.confirmable_notification` probe proved the direct iOS path still sends and times out without a confirmation receipt
    - `sensor.sonos_alarm_playing` now evaluates to `False` after template reload instead of staying restored/unavailable

## Session Delta (2026-04-06, TI2 activation — Tunet Inbox UI Work Reopened)

Change marker: user explicitly authorized the inbox card and dashboard work to proceed in this worktree

- `CHOSEN INTERPRETATION`
  - do not treat the earlier backend-first resequencing as a permanent UI cancellation
  - chosen implementation:
    - promote `TI2` from `READY TO START` to `ACTIVE`
    - re-enter the Tunet scoped governance pack before any `Dashboard/Tunet/**` changes
    - keep package and backend files frozen unless a TI2 stop condition forces a new control point
- `RESULT`
  - inbox UI implementation can proceed now under the TI2 file boundary
  - the next promotion target becomes `TI3`, not another planning-only control point

## Session Delta (2026-04-06, Post-Restart Import Proof)

Change marker: verify the remaining import-precedence concern after the user performed a normal Home Assistant restart

- `CHOSEN INTERPRETATION`
  - the earlier stale-options concern was no longer hypothetical once the user restarted HA
  - chosen implementation:
    - probe the live `tunet_inbox` config entry after restart
    - treat empty imported options as sufficient closure evidence instead of carrying the issue to a later hardening tranche
- `RESULT`
  - the live `tunet_inbox` entry now shows:
    - `state = loaded`
    - `source = import`
    - `options = {}`
  - the carried supportability debt around stale overlapping options can be closed on evidence

## Session Delta (2026-04-06, TI1E Compare-Mode Translation Closeout)

Change marker: broaden the shadow translation tranche from one OAL pilot into the documented OAL/Sonos compare set and close it on live evidence

- `CHOSEN INTERPRETATION`
  - the user wanted as many documented notification contexts translated as practical while leaving current phone behavior intact for comparison
  - chosen implementation:
    - add `tunet_inbox.post(send_mobile=false)` shadow posts to the documented OAL and Sonos writers
    - keep existing mobile writers and `mobile_app_notification_action` handlers in place
    - add `tunet_inbox_action` handling only where side effects were bounded and safe
    - add explicit resolver ownership for each mirrored family
    - treat Sonos evening alarm check and Apple TV auto-off as `shadow + mirror-only`
    - treat OAL flows and Sonos alarm playing as `shadow + action-ready`
- `RESULT`
  - compare-mode coverage now exists for:
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
  - a real Sonos legacy defect was found and fixed:
    - raw 32-character helper values were being converted into non-existent `notify.mobile_app_<device_id>` service names
    - the alarm path now falls back to `notify.tunet_inbox_all_devices` in that case
  - representative live proofs now exist for:
    - one OAL TV-family action-ready flow
    - one OAL timer/expiry-family action-ready flow
    - Sonos alarm playing action-ready flow
    - Sonos evening alarm check writer mirror
    - Sonos Apple TV auto-off writer mirror

## Session Delta (2026-04-06, TI0 — Governance Scaffold)

Change marker: establish a local governed workstream before implementation widens into backend services, UI, or package migrations

- `CHOSEN INTERPRETATION`
  - user required the inbox work to be tranchable and governed similarly to the Tunet dashboard program
  - chosen implementation:
    - give `tunet_inbox` its own scoped `AGENTS.md`
    - create a local `plan.md`, `handoff.md`, and `FIX_LEDGER.md`
    - create explicit contract and deploy/test docs under `custom_components/tunet_inbox/Docs/`
    - make deploy/check/smoke capability part of tranche zero rather than an afterthought
- `RESULT`
  - the backend now has a local execution authority
  - later service/event/item contract changes will have a dedicated place to be recorded
  - package migrations and Tunet UI work can now reference a stable backend ledger instead of broad chat context

## Session Delta (2026-04-06, TI0 — Tranche Hardening)

Change marker: convert `TI0` from a broad active intention into a fully specified execution tranche and lock the planning-mode policy

- `CHOSEN INTERPRETATION`
  - the top-level program plan is necessary but not sufficient for safe execution
  - chosen implementation:
    - create a full tranche doc for `TI0`
    - make tranche docs mandatory before execution
    - document when explicit planning mode is required versus when default execution should continue
- `RESULT`
  - `TI0` can now be reviewed and executed against exact file boundaries, validation, stop conditions, and rollback
  - future tranches have a clear governance pattern to follow instead of relying on implicit chat agreement

## Session Delta (2026-04-06, Program Ledger Alignment)

Change marker: add a program-level ledger equivalent to Tunet's `visual_defect_ledger.md`

- `CHOSEN INTERPRETATION`
  - this project needs a normalized status surface above the tranche docs, not just a plan and handoff
  - chosen implementation:
    - create `custom_components/tunet_inbox/Docs/execution_ledger.md`
    - treat it as the cross-tranche normalized backlog and status authority for the inbox project
    - add it to the local governance review pack and precedence chain
- `RESULT`
  - `tunet_inbox` now has:
    - a program plan
    - a program ledger
    - tranche specs
    - session continuity docs
  - issue tracking can now stay normalized across backend, UI, OAL, Sonos, and rollout work

## Session Delta (2026-04-06, Planning Layer Deepening)

Change marker: harden the normalized planning layer from minimal governance into production-grade execution planning

- `CHOSEN INTERPRETATION`
  - the user wanted planning to start from the missing middle layer, not from more backend code
  - chosen implementation:
    - expand `execution_ledger.md` into the normalized issue authority
    - deepen `plan.md` with tranche dependencies, entry/exit gates, and program control rules
    - author full tranche specs for `TI1`, `TI2`, and `TI3`
    - replace the stale enhancement tracker with an inbox-specific enhancement matrix
- `RESULT`
  - the project now has a complete planning stack:
    - policy
    - program plan
    - normalized ledger
    - tranche execution docs
    - continuity docs
    - enhancement decision matrix
- the next implementation step can proceed without reopening planning ambiguity

## Session Delta (2026-04-06, TI0 Closeout And TI1 Activation)

Change marker: close the repo-only TI0 blockers on evidence and begin the first live backend-proof tranche

- `CHOSEN INTERPRETATION`
  - TI0 could be closed once its stated exit gate was met even though the first live smoke proof remained open
  - chosen implementation:
    - close TI0 on package wiring, local YAML bootstrap, and static validation evidence
    - promote TI1 as the active tranche for runtime and HA/live proof
- `RESULT`
  - `package.json` now exposes the governed `tinbox:*` operator commands
  - local `Configuration/configuration.yaml` now contains the `tunet_inbox:` bootstrap block and logger entries
  - static validation passed and TI0 can be treated as closed in the normalized ledger

## Session Delta (2026-04-06, TI1 Contract Enforcement And Live Proof)

Change marker: align the runtime with the written contract, harden the deploy path, and record first HA/live service proof

- `CHOSEN INTERPRETATION`
  - the existing runtime had real contract mismatches:
    - titles were being validated as safe IDs
    - helper-driven mobile targeting was treated like a direct notify service
    - dismiss did not clear the matching mobile prompt
    - the deploy helper could not safely sync required YAML bootstrap because local and remote `configuration.yaml` had diverged
  - chosen implementation:
    - treat render text as free text while keeping identifiers strict
    - resolve helper-driven defaults into `notify.mobile_app_<device_id>`
    - make `dismiss` clear the matching mobile tag when configured
    - emit queue refresh when timeout recovery returns an item to `pending`
    - patch only the governed `tunet_inbox` fragments into remote `configuration.yaml` instead of overwriting the full file
- `RESULT`
  - HA logs show `tunet_inbox` loading successfully on the live instance
  - smoke now passes against `/api/services`
  - live service probes proved:
    - `post`
    - `list_items`
    - `respond`
    - `fail`
    - `resolve`
    - `dismiss`
  - live rejection proofs now exist for:
    - `item_not_found`
    - `invalid_action`
    - `expired`
    - `not_pending`
  - timeout recovery is now live-proven:
    - a probe item returned from `responding` to `pending`
    - `last_error` was set to `handler_timeout`
  - concurrent response proof is now live-proven:
    - exactly one response was accepted
    - competing responses were rejected as `not_pending`
- remaining TI1 gap is explicit:
  - the direct `lock_conflict` branch still needs a documented acceptance decision or a later deterministic harness

## Session Delta (2026-04-06, TI1 Closure And Test-Harness Resequencing)

Change marker: close the remaining TI1 evidence gap and insert a dedicated backend regression tranche before any UI or package migration

- `CHOSEN INTERPRETATION`
  - the deterministic runtime probe is sufficient to close the literal `lock_conflict` branch because it exercises the exact manager path with the per-item lock pre-held
  - the user then explicitly prioritized a real local HA integration test harness with `pytest-homeassistant-custom-component` before frontend or package work
  - chosen implementation:
    - treat `TI1` as closed
    - insert a new tranche `TI1A` between `TI1` and `TI2`
    - make local pytest harness work and targeted backend tests a hard dependency for UI and migration tranches
- `RESULT`
  - the program order now requires backend regression coverage before the Tunet card or OAL/Sonos migration can advance
  - `TINBOX-TI1-2` can be closed on deterministic runtime evidence
  - new owned issues are:
    - `TINBOX-TEST-1`
    - `TINBOX-TEST-2`

## Session Delta (2026-04-06, TI1A Test Harness Implementation)

Change marker: implement the local HA custom-integration test harness and close the backend regression tranche on passing evidence

- `CHOSEN INTERPRETATION`
  - the fastest acceptable local workflow is a repo-local venv plus `pytest-homeassistant-custom-component`, not a devcontainer-first setup
  - the latest package release visible from the local Python index was not usable:
    - the newest GitHub release required Python 3.14
    - the current Python 3.12-compatible index head was `0.13.205`
  - chosen implementation:
    - pin `pytest-homeassistant-custom-component==0.13.205`
    - use `uv` with a repo-local cache and repo-local venv
    - add operator scripts and npm wiring for setup and execution
    - add HA-style tests under `tests/components/tunet_inbox/`
- `RESULT`
  - `TI1A` acceptance is now satisfied
  - backend regression coverage now exists for:
    - manager state transitions
    - service responses
    - canonical event emission
  - one known warning remains visible and tracked:
    - `datetime.utcnow()` deprecation in `utcnow_iso()`

## Session Delta (2026-04-06, TI1B insertion And TI2 Deferral)

Change marker: user re-sequenced the program to finish productizing the integration before starting any Tunet inbox surface

- `CHOSEN INTERPRETATION`
  - the backend now exists and is tested, but it is not yet “integration-finished”
  - the concrete gaps are:
    - no config-entry setup path
    - no diagnostics surface
    - no translation-backed config UX
    - placeholder manifest metadata and a tracked Python 3.12 warning
  - chosen implementation:
    - insert `TI1B` between `TI1A` and `TI2`
    - demote `TI2` back to `READY TO START`
    - return Tunet root docs to their normal `CD9` state because no Tunet implementation is active now
- `RESULT`
  - the active tranche is backend-only again
  - no `Dashboard/Tunet/**` edits are authorized until `TI1B` closes
  - `TI2` remains the next UI control point after integration productization

## Session Delta (2026-04-06, TI1B implementation And TI1C promotion)

Change marker: close the integration-productization tranche on evidence, then immediately open a narrower backend hardening tranche for the remaining production blocker

- `CHOSEN INTERPRETATION`
  - `TI1B` is complete because the originally declared supportability gaps are now closed:
    - single config-entry runtime exists
    - YAML bootstrap imports into that runtime
    - diagnostics exist
    - translation-backed config/options strings exist
    - placeholder manifest metadata is gone
    - the tracked UTC warning is fixed
  - however, the backend still violates a locked governance rule:
    - malformed persisted queue items are logged and skipped instead of logged and quarantined
  - chosen implementation:
    - close `TI1B` on local and HA/live evidence
    - insert `TI1C` before any UI work
    - make quarantine, repair surfacing, and one governed release-verification path the next active backend-only tranche
- `RESULT`
  - the backend integration is now productized enough to be configured and supported in HA
  - the remaining blocker before UI work is explicit, narrow, and governance-driven
  - `TI2` is no longer the immediate next action; `TI1C` is

## Session Delta (2026-04-06, TI1B implementation Evidence Pack)

Change marker: record the concrete implementation and evidence that closed the productization tranche

- `IMPLEMENTATION`
  - runtime ownership moved to a single config entry in `__init__.py`
  - YAML bootstrap now imports into that config entry instead of instantiating a parallel runtime
  - `config_flow.py` and `translations/en.json` provide config/options flow UX
  - `diagnostics.py` exports redacted integration state
  - `manager.py` now exposes restore/config snapshots for diagnostics
  - `services.py` now resolves the active manager through the config-entry-owned runtime
  - `manifest.json` now reflects the config-flow runtime shape and no longer carries placeholder URLs
  - `utcnow_iso()` now uses timezone-aware UTC and no longer emits the tracked Python 3.12 warning
  - new HA-style tests were added for:
    - config flow
    - YAML import path
    - diagnostics redaction
- `EVIDENCE`
  - local:
    - `npm run tinbox:check`
    - `npm run tinbox:test`
    - `10 passed`
  - live:
    - `npm run tinbox:deploy:integration`
    - `ha_check_config() -> valid`
    - `ha_restart(confirm=true)`
    - post-restart `npm run tinbox:smoke`
    - remote config-entry proof from `/config/.storage/core.config_entries`:
      - exactly one `tunet_inbox` entry
      - source `import`
      - title `Tunet Inbox`

## Session Delta (2026-04-06, TI1C implementation And Closeout)

Change marker: close the remaining backend production blocker before any UI tranche starts

- `CHOSEN INTERPRETATION`
  - the remaining blocker after `TI1B` was not UI work, but backend governance:
    - malformed persisted items were still being logged and skipped
  - chosen implementation:
    - add a persisted quarantine collection
    - surface restore corruption through Repairs
    - extend diagnostics with redacted quarantine visibility
    - add one governed local release-verification command
- `RESULT`
  - malformed restored active and archive items are now quarantined instead of disappearing silently
  - the backend now raises a persistent Repair issue when quarantine is present
  - one operator command now proves the local backend release gate:

## Session Delta (2026-04-06, TI1D live pilot blockers)

Change marker: live TI1D proof exposed two real production blockers that were not visible in local tests

- `CHOSEN INTERPRETATION`
  - the notify-group contract itself is sound, but the imported config-entry runtime can still boot with stale option values that override the newly imported YAML defaults
  - the OAL override-reminder pilot is materially correct in structure, but its `expires_at` template currently emits a value marked as UTC while being derived from local time
  - chosen implementation:
    - widen `TI1D` just enough to include `config_flow.py`
    - make the YAML import path authoritative over stale overlapping options for import-sourced entries
    - correct the pilot OAL expiry template to emit a true UTC timestamp
- `RESULT`
  - the remaining TI1D work is now concrete and bounded by live evidence rather than guesswork
  - the next deploy/restart cycle will prove both operator routing and the first real OAL action path under the intended notify-group target

## Session Delta (2026-04-06, TI1D live operator and OAL proof)

Change marker: close the functional TI1D goals on live HA evidence and isolate the one remaining supportability proof

- `CHOSEN INTERPRETATION`
  - the user manually aligned the live notify target, so a full HA restart was unnecessary for functional proof
  - the remaining import-precedence fix lives in `config_flow.py`, which affects future import/update behavior rather than the already-running manager
  - chosen implementation:
    - push the corrected OAL package and reload automations instead of restarting HA
    - prove the live operator path through `tunet_inbox.respond(key=...)`
    - keep the import-precedence fix tracked as the only remaining next-reload proof item
- `RESULT`
  - `tinbox:smoke` passed live
  - `tinbox:probe:api` passed live
  - the live OAL override-reminder pilot now posts with a correct future UTC expiry
  - the live queue item can be responded to by `key` and clears through the governed backend path
  - the only remaining TI1D debt is activation/live proof of the import-path option-clearing fix on the next HA code reload or restart

## Session Delta (2026-04-06, compare-mode translation resequencing)

Change marker: user direction changed the next tranche from UI-first to broad notification translation while keeping existing mobile flows intact for comparison

- `CHOSEN INTERPRETATION`
  - this is not a narrow implementation request; it changes the program order and the meaning of the next tranche
  - chosen implementation:
    - insert `TI1E` after `TI1D`
    - define `TI1E` as a compare-mode shadow-translation tranche
    - keep existing phone writers and raw mobile handlers alive during translation
    - move `TI2` behind `TI1E`
    - reframe `TI3` as authoritative OAL cutover rather than first translation
- `RESULT`
  - the next governed move after `TI1D` is now broad compare-mode translation
  - the program can translate many documented notifications without pretending that cutover has already happened
  - UI work stays deferred until the queue has meaningful real-world coverage

## Session Delta (2026-04-06, TI1D closure and TI1E activation)

Change marker: user manually performed the planned HA restart, which proved the import-precedence issue remains but also made clear it should no longer block compare-mode translation

- `CHOSEN INTERPRETATION`
  - the restart did not normalize the stale overlapping options on the import-sourced entry
  - however, the remaining defect is supportability-level rather than functional for compare-mode translation
  - chosen implementation:
    - close `TI1D` on functional evidence
    - carry `TINBOX-CFG-1` forward as deferred supportability debt
    - activate `TI1E` as the current tranche
- `RESULT`
  - the program can move forward into broad shadow translation now
  - the import-precedence normalization issue remains visible in governance and is not silently forgotten
    - `tinbox:check`
    - `tinbox:test`
    - `tinbox:probe:runtime`
  - `TI1C` is closed on local and HA/live evidence
  - the integration is now backend-prod-ready; the next control point is UI work, not more backend reshaping

## Session Delta (2026-04-06, TI1D exception tranche — API-first pilot before Tunet UI)

Change marker: user asked for real API testing with the HA token and a minimal way to exercise a migrated notification before building Tunet UI

- `CHOSEN INTERPRETATION`
  - the user does not want to jump into Tunet yet
  - a narrow exception tranche is justified because:
    - HA REST service calls with `return_response` are already working against the live instance
    - one real migrated flow can be exercised through `tunet_inbox.respond`
    - a plain Lovelace service-button harness becomes viable if the service layer supports `key` as well as `item_id`
  - chosen implementation:
    - insert `TI1D` before `TI2`
    - keep the tranche strictly non-Tunet
    - migrate only the OAL override reminder flow
    - add a token-backed API probe script using `.env`
- `RESULT`
  - we can prove one live notification flow end to end without waiting for the inbox card
  - `TI2` remains future UI work, not a prerequisite for this operator/API slice

## Session Delta (2026-04-06, Notify target contract clarification)

Change marker: resolve the lingering ambiguity between helper-driven routing and explicit notify-service routing

- `CHOSEN INTERPRETATION`
  - the runtime already supports both:
    - helper-backed routing via `input_text.*`
    - direct `notify.*` routing
  - the ambiguity was documentation and config UX wording, not a missing runtime capability
  - chosen implementation:
    - keep the stored config key as `notify_device_helper` for compatibility
    - clarify in active docs and config UX that the value may be either a helper entity or a direct `notify.*` service
    - state explicitly that blank routing is invalid and does not imply broadcast
    - recommend notify groups, not `notify.notify`, for multi-device delivery
- `RESULT`
  - the operator contract now matches the actual backend behavior
  - multi-device delivery has a deterministic documented path
  - future package migrations do not need to guess what blank routing means

## Open Items

- `TI1D` is active
- add key-addressable item references to the backend service/operator path
- add token-backed HA API probe coverage
- migrate OAL override reminder as the single pre-UI pilot
- package migrations remain blocked until `TI2` is explicitly closed
## Session Delta (2026-04-06, TI2 Closeout And Demo Icon Normalization)

Change marker: the governed inbox UI tranche is now live-proven, and the first manual demo payloads exposed icon names that did not resolve cleanly in the live frontend

- `CHOSEN INTERPRETATION`
  - close `TI2` explicitly on live rehab and standalone dashboard evidence
  - treat the icon mismatch as a card-level presentation bug, not a backend contract problem
  - normalize both the card alias table and the demo payload icons to conservative, live-safe symbols
- `RESULT`
  - `TI2` is closed
  - `TI3` becomes ready to start
  - live demo items now use safer icon names
  - the inbox card now degrades newer or unsupported MDI variants to stable built-in symbols instead of blank icons
