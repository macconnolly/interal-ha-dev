# TI3 — OAL Authoritative Cutover And Resolver Cleanup

## TRANCHE_ID

- `TI3`

## TITLE

- `Cut selected OAL compare-mode flows over from dual-running notification logic to inbox-authoritative notification logic`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche crosses into live package automation behavior
  - it is the first production domain migration
  - it depends on both the backend and the dashboard surface being proven

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI3 — OAL Authoritative Cutover And Resolver Cleanup`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-OAL-1`
  - `TINBOX-OAL-2`
- `packages/oal_lighting_control_package.yaml`
  - current OAL notification flows around override reminder and override-expiring logic

## GOAL

- Retire compare-mode duplication for the selected OAL flows and make `tunet_inbox` the authoritative post/respond/resolve path while preserving existing user-facing outcomes and explicit resolver ownership.

## FROZEN_CUTOVER_SET

- `oal_override_reminder`
- `oal_override_expiring:<zone>`
- `oal_tv_mode_prompt:living_room`

These are the only OAL flows authorized for TI3 code changes.

## WHY_NOW

- `TI1E` will have created broad compare-mode coverage, so the next step is authoritative cutover rather than more mirroring.
- OAL should remain the first cutover domain before Sonos.
- Resolver ownership and removal of duplicated legacy handlers belong in a dedicated tranche, not in the compare tranche.
- `TI3` does not resume until `TI2C` closes the durable inbox-tap contract.

## USER_VISIBLE_OUTCOME

- The frozen TI3 OAL cutover set no longer relies on the old direct mobile-only path.
- Phone and dashboard both use the inbox-authoritative path.
- Legacy duplicated compare-mode paths for the cutover set are removed or explicitly retired.
- Natural resolution clears both the queue item and the mobile prompt.

## FILES_ALLOWED

- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI3_oal_pilot_migration.md`
- `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
- `HA-References/tunet_inbox_enhancement_matrix.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `TI1E` and `TI2` are complete.
- The frozen TI3 cutover set is inbox-authoritative for the migrated actions and resolvers.
- Non-cutover OAL flows remain intentionally compare-mode only.
- `TI2B` has closed the narrow backend parity gap for `mobile.url`.
- `TI2C` is closed on backend-owned tap-contract proof and no longer blocks package cutover.
- The actual TI3 code delta was narrower than expected:
  - the cutover writers already used `tunet_inbox.post`
  - the cutover handlers already used `tunet_inbox_action`
  - the remaining contract drift was the package-supplied `mobile.url` literals, which are now removed from the frozen cutover set

## INTENDED_STATE

- The frozen TI3 cutover set posts through `tunet_inbox` as the authoritative path.
- OAL action handling listens to `tunet_inbox_action` for the cutover actions.
- Natural resolver paths call `tunet_inbox.resolve`.
- Legacy direct mobile-only handler branches for the cutover set are removed or clearly retired.
- The same semantic actions work from:
  - iPhone actionable notification
  - Tunet inbox card

## EXACT_CHANGE_IN_ENGLISH

- Remove package-supplied `mobile.url` literals from the frozen TI3 writer set so the migrated OAL flows rely on backend-owned inbox tap defaults.
- Keep the already-authoritative `tunet_inbox_action` and `tunet_inbox.resolve` paths for the cutover set.
- Preserve semantic action IDs where possible.
- Keep all domain decisions and side effects inside OAL automations/scripts.
- Leave any still-shadow-only OAL flows out of scope.

## ARCHITECTURAL_INTENTION

- This tranche converts proven compare-mode coverage into authoritative ownership.
- It validates:
  - removal of duplicated legacy handlers
  - canonical response path as the only authoritative path
  - resolver ownership under cutover conditions
- It creates the concrete cutover pattern that Sonos will follow next.

## ACCEPTANCE_CRITERIA

- the cutover set is exactly the frozen TI3 set and is not widened mid-tranche
- selected OAL flows no longer depend on legacy direct mobile-only writers/handlers
- migrated OAL action handlers listen to `tunet_inbox_action`, not raw mobile events
- natural resolver automations call `tunet_inbox.resolve`
- the original domain outcomes still occur
- acting from the dashboard clears the phone notification by tag
- acting from the phone clears the dashboard item
- if the underlying OAL condition resolves before user action:
  - the inbox item auto-clears
  - the phone prompt is cleared by tag if still present

## VALIDATION

### Static validation

- YAML parse-check for `packages/oal_lighting_control_package.yaml`
- verify migrated blocks still compile as valid HA YAML

### Runtime validation

- inspect the migrated automation/script branches for:
  - correct item keys
  - correct action IDs
  - correct resolve ownership
- review that no raw mobile event handling remains for the migrated actions

### HA/live validation

- deploy the changed OAL package
- reload automations as the default TI3 activation path
- trigger override reminder
- trigger override-expiring path
- trigger TV mode prompt path
- validate:
  - phone action
  - dashboard action
  - iOS swipe-dismiss retains inbox item
  - natural resolution clears the queue
  - duplicate/stale response is rejected safely
- precondition already recorded:
  - `TI2B` live proof closed the public `mobile.url` contract gap after integration deploy, HA restart, smoke, and direct service validation

## PROOF_SUMMARY

- static/runtime:
  - YAML parse check passed for `packages/oal_lighting_control_package.yaml`
  - `npm run tinbox:check`
  - `npm run tinbox:test` -> `28 passed`
- deploy/reload:
  - remote backup: `Backups/tunet_inbox/packages/oal_lighting_control_package.20260418_120035.remote.yaml`
  - package copy verified by byte count
  - `ha_check_config() -> valid`
  - `automation.reload` succeeded
- override reminder:
  - real automation trigger created `oal_override_reminder`
  - stored mobile URL normalized to `http://10.0.0.21:8123/tunet-inbox-yaml/inbox` with no package-supplied `mobile.url`
  - dashboard `tunet_inbox.respond(source='dashboard_card', action_id='OAL_RESET_LIGHTS')` was accepted
  - `sensor.oal_system_status.active_zonal_overrides` returned to `0`
  - duplicate replay returned `accepted: false, reason: item_not_found`
  - natural resolver proof passed after creating a real override, posting the reminder, and running `script.oal_reset_soft`
- override expiring:
  - real automation trigger created `oal_override_expiring:unknown`
  - stored mobile URL normalized to `http://10.0.0.21:8123/tunet-inbox-yaml/inbox` with no package-supplied `mobile.url`
  - simulated phone action via REST `mobile_app_notification_action` generated a real `tunet_inbox_action` trace and resolved the item
- TV prompt:
  - both package writer branches now omit `mobile.url`
  - no raw `mobile_app_notification_action` trigger remains for `OAL_TV_ENTER` or `OAL_TV_DISMISS`
  - bounded synthetic prompt proof was used because Apple TV playback control was intentionally left out of scope
  - simulated `mobile_app_notification_cleared` did not remove the inbox item
  - dashboard `OAL_TV_DISMISS` executed the real handler branch and updated the expected helper/timer state
  - resolver ownership was proven by toggling `input_boolean.oal_tv_mode_prompt_pending` off and observing queue resolution
- cleanup:
  - final `tunet_inbox.list_items` returned `meta.total: 0`

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`
- `HA RESTART` only if backend integration code changes concurrently as a blocker exception

## ROLLBACK

- restore prior `packages/oal_lighting_control_package.yaml`
- reload automations
- verify old mobile-only flow is active again

## DEPENDENCIES

- `TI1E` is closed
- `TI2` is closed
- `TI2C` is closed
- inbox card and standalone dashboard are available for validation
- OAL entity/state assumptions for the pilot flows are verified before editing

## UNKNOWNS

- whether existing OAL helper timers or soonest-override logic require small keying adjustments for `oal_override_expiring:<zone>`
- whether `oal_tv_mode_prompt:living_room` can be cut over cleanly without dragging bridge/presence logic into the tranche
- whether the current OAL automation layout needs narrow helper automations for clean resolver ownership

## STOP_CONDITIONS

- stop if migration requires new backend contract changes beyond the closed `TI2B` parity patch and the planned `TI2C` contract-canonicalization tranche
- stop if migration needs to widen into bridge, presence-loss, TV-mode-activated, or unified-timer flows
- stop if resolver ownership cannot be isolated for the frozen TI3 cutover set
- stop if package reload behavior is not sufficient and broader restart sequencing becomes unclear

## OUT_OF_SCOPE

- OAL TV mode activated
- OAL bridge expiring
- OAL TV presence-loss prompt
- OAL unified timer
- Sonos migration
- frontend card changes

## REVIEW_FOCUS

- migration narrowness
- frozen-cutover-set discipline
- action parity between phone and dashboard
- resolve ownership clarity
- preservation of OAL business logic boundaries
- stale-action safety
