  ## OAL v14 Revised Implementation Spec (Updated and Corrected)

  ### Summary

  Implement a single-control-plane architecture for OAL where input_select.oal_active_configuration
  is authoritative, TV behavior is an adapter into that plane, and all light execution remains in
  implementation, deterministic bridge behavior, and full legacy notifier/movie-boolean cleanup.
  ———
  ## 1. Final Decisions (Locked)
  1. Use dedicated internal mode TV Bridge in input_select.oal_active_configuration.
  2. TV auto-follow policy is selectable: Off, Night + Presence, Always Follow.
  3. Presence gate source is group.oal_tv_presence_sensors.
  4. Timed modes are Full Bright, Dim Ambient, Warm Ambient.
  5. Timeout-exempt modes are Adaptive, Manual, TV Mode, TV Bridge, Sleep.
  7. Manual clears return to Adaptive (existing auto-switch flow).
  9. Unified timeout notification arbiter replaces legacy zone-only expiring notifier.
  10. input_boolean.oal_movie_mode_active is compatibility-only during rollout, then replaced by


  ## 2. Entity Contract (Exact)

  ### Add/modify in input_select

  1. Modify input_select.oal_active_configuration options to include TV Bridge.
  2. Add input_select.oal_tv_autofollow_gate with options:
  3. Add input_select.oal_mode_timeout_state with options:

  ### Add in input_number
  1. input_number.oal_control_mode_timeout_hours (0.5..12, step 0.5, initial 4).

  ### Add in input_boolean
  1. input_boolean.oal_policy_snapshot_restore_enabled (global restore policy, initial on).
  2. input_boolean.oal_policy_tv_snapshot_restore_enabled (TV restore policy, initial on).
  5. input_boolean.oal_mode_timeout_enabled (initial on).
  7. input_boolean.oal_tv_bridge_active (initial off).
  ### Add in timer
  1. timer.oal_mode_timeout with restore: true.
  2. timer.oal_tv_bridge_timer with restore: true.
  ### Add in group

  1. group.oal_tv_presence_sensors with default entities:
     binary_sensor.couch_presence, binary_sensor.living_room_presence.

  ### Add in input_datetime

  1. input_datetime.oal_last_timeout_notification (date+time) for enforced 90s cooldown.


  ## 3. Config Manager Changes
  ### Profile extension
  1. In oal_configuration_manager_v13 config_profiles, add TV Bridge profile directly after TV Mode.
  2. Use bridge profile values exactly:
  - b: -40
  - k: -800
  - lights_dimmed:
      - light.living_room_couch_lamp: 8
      - light.kitchen_island_pendants: 10
      - light.accent_spots_lights: 8
      - light.entryway_lamp: 10


  2. Wrap restore-to-Adaptive scene.turn_on scene.oal_before_config_mode with policy decision:
  - If from_state in TV Mode or TV Bridge, use oal_policy_tv_snapshot_restore_enabled.

  3. Keep exactly one watchdog force-trigger in baseline return path (remove duplicates).

  ### Bridge cancellation on mode exit


  - input_boolean.turn_off input_boolean.oal_tv_bridge_active
  ———

  ## 4. Replace Movie Handler with TV Trigger Adapter

  ### Replace entire old movie automation block with:
  1. automation.oal_tv_mode_controller_v14 with triggers:
  - Apple TV to: playing id tv_start
  - Apple TV stop states with for: 00:00:25 id tv_stop_short
  - HA start id startup_reconcile



  - gate_setting
  - presence_detected from group.oal_tv_presence_sensors, unavailable treated as off
  - sun_below from sun.sun elevation < 0
  - gate_passes from selected gate mode

  2. Startup reconcile:

  - Recompute all variables after delay.
  - If not playing and follow session on, clear session and return Adaptive if mode is TV Mode/TV



  4. Stop path:
  - If bridge enabled and gate passes, use short debounce branch:
      - set bridge active
      - start timer.oal_tv_bridge_timer for configured minutes
  - Else use long debounce branch:
      - clear follow session

  ### Compatibility shim during rollout


  - Mirrors input_boolean.oal_movie_mode_active from mode state.

  ———

  ## 5. TV Bridge Manager

  2. Conditions: oal_tv_bridge_active == on and mode TV Bridge.

  - OAL_RETURN_ADAPTIVE

  4. Wait for action 5 minutes.
  5. Action behavior:

  - RETURN_ADAPTIVE: clear bridge active, set mode Adaptive.
  - KEEP_BRIDGE: clear bridge active and do not restart timer.
  6. Default on timeout: clear bridge active, set mode Adaptive.

  ———
  ## 6. Mode Timeout Manager (Corrected)
  ### Add automation.oal_v14_mode_timeout_manager

  1. Triggers:

  - mode change
  - timer.finished for timer.oal_mode_timeout
  - HA startup
  - input_boolean.oal_mode_timeout_enabled state change

  2. No global automation condition on oal_mode_timeout_enabled.

  - set timeout state idle
  - stop
  4. Mode branches:
  - If mode in timed set:
      - set state armed.
      - timer.pause mode timer if active
  - If mode in Manual, Adaptive, Sleep:
      - set state idle.

  5. On timer finished:
  - set timeout state expired
  - if current mode still in timed set, set mode Adaptive.
  6. Startup reconcile:
  - If mode in timed set and timer idle, arm timer.
  - If mode in TV/Bridge and timer active, pause and mark suspended.
  ———


  ### Replace old oal_v13_override_expiring_notification

  1. Disable/remove legacy override notifier to prevent duplicate alerts.
  2. Add automation.oal_v14_unified_timer_notification (minute cadence).

  - zonal override expiring (sensor.oal_soonest_override.seconds_remaining <=300 and >0)

  4. Enforce cooldown using input_datetime.oal_last_timeout_notification:


  6. Use static action list (no templated action-array ambiguity):
  - OAL_EXTEND_MODE
  - OAL_EXTEND_BOTH
  - OAL_RETURN_ADAPTIVE
  - OAL_LET_EXPIRE
  7. Add automation.oal_v14_timer_notification_handler:

  - Extend mode: restart timer.oal_mode_timeout with configured duration.
  - Return adaptive: select Adaptive (not hard-reset script).


  ## 8. Auto-switch Guard Cleanup


  1. Remove input_boolean.oal_movie_mode_active condition in oal_auto_switch_to_manual_config.
  3. Keep mode-based guards:
  - to-Manual only from Adaptive
  - to-Adaptive only from Manual

  4. Keep transition lock/system pause guards.

  ———
  ## 9. Status/Observability Updates
  ### Update system status sensor
  1. Replace movie-boolean state mapping with mode-based mapping:
  - show TV Mode when mode TV Mode


  - tv_bridge_active
  - mode_timeout_state
  - mode_timeout_remaining
  - tv_autofollow_gate

  ### Update hero helper labels
  1. Add TV Bridge mapping wherever mode display labels are generated.




  1. Clear:

  - oal_tv_follow_session_active
  2. Cancel:
  - timer.oal_mode_timeout

  3. Set timeout state idle.
  4. Keep setting mode Adaptive.
  ### Startup automation enable list

  - automation.oal_tv_mode_controller_v14
  - automation.oal_v14_mode_timeout_manager
  - automation.oal_v14_unified_timer_notification

  ———
  ## 11. Phase 7 Cleanup (After 2-3 Stable Cycles)

  1. Remove compatibility shim automation.
  3. Add derived template binary sensor:
  - binary_sensor.oal_movie_mode_active
  - true when mode TV Mode and Apple TV playing.
  4. Replace all remaining references to helper boolean with mode/derived sensor semantics.
  ———

  ## 12. Acceptance Tests (Must Pass)

  1. ha_check_config valid after each phase.

  - Night+presence: follows only when both true.
  - Always: follows whenever Apple TV plays.


  - bridge disabled/non-gated path uses 90s, returns Adaptive.
  4. Timeout behavior:
  - timed mode arms timer.
  - returning to timed mode resumes timer (not reset).
  - timer expiry in timed mode returns Adaptive.

  5. Notification behavior:

  - only one oal_timer_expiring notification appears in overlap.
  - cooldown respected.

  6. Reset behavior:

  - timers canceled, bridge/session flags off, mode Adaptive.

  7. No light mutations exist in TV adapter automation; only mode/session/timer actions.

  ———

  ## 13. Assumptions/Defaults

  1. Bridge duration default: 10 minutes.
  2. Mode timeout default: 4 hours.
  3. Night gate threshold: sun elevation < 0.
  4. Missing/unavailable presence entities count as off.
  5. Manual takeover means user done with timed mode (Option B).