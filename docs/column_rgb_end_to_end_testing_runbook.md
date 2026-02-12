# Column RGB End-to-End Testing Runbook

## Objective

Validate the complete Column Lights RGB protection architecture in `packages/oal_lighting_control_package.yaml`:
- lifecycle ownership (prepare -> transition -> sleep -> morning exit)
- cross-automation protection (engine/config/reset/movie/manual force flows)
- startup recovery and reconciliation
- resilience under rapid trigger/concurrency conditions

## Success Criteria

1. Protected RGB session is never overwritten by non-explicit force paths.
2. Deep-night behavior converges to AL sleep ownership and canonical sleep color.
3. Startup and self-heal recover correctly without introducing loops.
4. All key decisions are traceable via `oal_column_rgb_debug` events.
5. Explicit override behavior works only when intentionally requested.

## Required Entities and Controls

Core helpers:
- `input_boolean.oal_column_rgb_session_active`
- `input_boolean.oal_column_rgb_guard_kill_switch`
- `input_boolean.oal_column_rgb_debug_events`
- `binary_sensor.oal_column_rgb_window_active`
- `binary_sensor.oal_column_rgb_protect_active`

Column test harness (effective-sun overrides):
- `input_boolean.oal_test_mode`
- `input_number.oal_test_sun_elevation`
- `input_boolean.oal_test_sun_rising`
- `sensor.oal_effective_sun_elevation`
- `binary_sensor.oal_effective_sun_rising`

Column ownership and mode:
- `switch.adaptive_lighting_column_lights`
- `switch.adaptive_lighting_sleep_mode_column_lights`
- `light.living_column_strip_light_matter`
- `light.dining_column_strip_light_matter`

Key flows under test:
- `automation.oal_v13_column_lights_prepare_rgb_mode`
- `automation.oal_v13_column_lights_rgb_transition`
- `automation.oal_v13_column_lights_rgb_self_heal`
- `automation.oal_v13_column_lights_sleep_mode_final_safety`
- `automation.oal_v13_column_lights_morning_exit_rgb_mode`
- `automation.oal_v13_core_adjustment_engine_master`
- `automation.oal_v13_configuration_manager_power_handoff`
- `automation.oal_v13_movie_mode_handler`
- `automation.oal_v13_system_startup_initialization`
- `script.oal_reset_soft`
- `script.oal_reset_room`
- `script.oal_global_adjustment_start`

## Observability Setup

1. Set:
   - `input_boolean.oal_column_rgb_guard_kill_switch = off`
   - `input_boolean.oal_column_rgb_debug_events = on`
2. In Developer Tools -> Events, listen on:
   - `oal_column_rgb_debug`
   - `oal_watchdog_trigger`
3. Keep traces open for:
   - core engine
   - config manager
   - prepare RGB
   - sleep trigger
   - startup initialization
4. Pin these states:
   - session active boolean
   - both column binary sensors
   - column sleep switch
   - column AL `manual_control` attribute
   - effective sun elevation/rising
   - test mode + test sun controls

## Test Data Contract

Canonical protection window:
- descending only
- `-5 <= elevation < 3`

Canonical sleep color:
- `sleep_rgb_color: [245, 120, 0]` on `switch.adaptive_lighting_column_lights`

Expected debug decisions:
- `prepare_on_start`
- `protect_engage`
- `protect_skip`
- `release_forced`
- `heal_executed`
- `engine_protect_filter`
- `startup_reconcile`

---

## Suite 0: Harness Fast Path (Column-First)

Purpose:
- Execute the full column lifecycle in minutes without waiting for real sun movement.

Harness setup:
1. Set `input_boolean.oal_test_mode = on`.
2. Set `input_boolean.oal_test_sun_rising = off` (descending/evening simulation).
3. Ensure at least one column light is ON.
4. Confirm debug events are enabled.

Execution matrix:
1. Set `input_number.oal_test_sun_elevation` to `4.0`.
   Expected:
   - Outside window.
   - Session/protect remain off.
2. Set test elevation to `2.0` (crosses below `<3`).
   Expected:
   - Prepare automation fires.
   - Session on, manual list populated, RGB prepare sequence runs.
   - Debug includes `decision=protect_engage`.
3. While still at `2.0`, run:
   - `script.oal_reset_soft`
   - `script.oal_reset_room` (column targets)
   Expected:
   - Protection preserved.
   - No forced release.
4. Set test elevation to `-6.0` (crosses below `<-5`).
   Expected:
   - Sleep safety fires evening release branch.
   - Session off, sleep switch on.
   - Debug includes `decision=release_forced`, `reason=evening_final_below_minus5`.
5. Set `input_boolean.oal_test_sun_rising = on`, then set test elevation to `6.0` (crosses `>5`).
   Expected:
   - Morning sleep exit branch fires.
   - Sleep switch off.
6. Set test elevation to `9.0` (crosses `>8`).
   Expected:
   - Morning exit automation runs if session is on.
   - Manual clears and AL ownership restored.

Cleanup:
1. Set `input_boolean.oal_test_mode = off`.
2. Trigger `automation.oal_v13_column_lights_sleep_mode_final_safety`.
3. Confirm live-sun state is reasserted.

---

## Suite A: Preflight Integrity

### A1. Configuration sanity

Action:
1. Verify column AL switch sleep color is `[245, 120, 0]`.
2. Verify all automations/scripts in scope are enabled.

Expected:
- No stale sleep color override exists in reset behavior.
- Required automation graph is active.

### A2. Baseline ownership

Action:
1. Outside protection window, run `script.oal_reset_soft`.
2. Inspect column `manual_control`.

Expected:
- Session stays off.
- Manual list remains empty or is cleared.
- No unexpected `protect_engage` event.

---

## Suite B: Evening Lifecycle (Primary E2E Path)

### B1. Prepare RGB entry

Setup:
- Ensure at least one column light is ON.
- Wait for descent into `<3` and `>=-5`.

Action:
1. Let `oal_column_lights_prepare_rgb_mode` trigger naturally.

Expected state transitions:
1. brightness to 35%
2. RGB set to `[255, 200, 0]`
3. manual control set for both columns
4. session boolean set ON
5. hold brightness set to 5%

Expected debug:
- `decision=protect_engage`, `source=oal_column_lights_prepare_rgb_mode_v13`

### B2. RGB transition drive

Action:
1. While in window, monitor `input_number.oal_offset_column_rgb_green` changes.
2. Confirm `oal_column_lights_rgb_transition` applies updates.

Expected:
- Color updates continue while session is on and sleep is off.
- No color_temp takeover.

### B3. Protected reset behavior in-window

Action:
1. Trigger `script.oal_reset_soft`.
2. Trigger `script.oal_reset_room` targeting column lights.
3. Trigger `script.oal_reset_room` targeting mixed zones.

Expected:
- Columns remain RGB-protected.
- Manual remains set for columns.
- Debug includes `protect_engage` (source reset scripts), not `release_forced`.

---

## Suite C: Cross-Automation Bypass Protection

### C1. Force watchdog safety (`column_safe`)

Action:
1. Emit or trigger force flows that call engine with `force: true` and `force_intent: column_safe`.
2. Observe core engine column branch behavior.

Expected:
- Protected column lights filtered from forced apply path.
- Debug:
  - `decision=engine_protect_filter`
  - `result=columns_filtered`

### C2. Explicit override (`override_all`)

Action:
1. Emit watchdog with `force: true`, `force_intent: override_all` during active protect window.

Expected:
- Explicit override allowed.
- Debug:
  - `decision=engine_protect_filter`
  - `result=override_all_bypass`

### C3. Config manager paths

Action:
1. Switch `input_select.oal_active_configuration`:
   - `Adaptive` -> `Full Bright` -> `Adaptive`
2. Perform sequence while protected window is active.

Expected:
- Non-column zones follow config intent.
- Protected columns are not cleared/applied by baseline/full-bright/cleanup paths.

### C4. Movie mode exit scope

Action:
1. Enter and exit movie mode flow.
2. Validate end-movie manual clear targets.

Expected:
- Column manual state is untouched by movie exit clear.
- No session break caused by movie mode.

---

## Suite D: Deep Night and Release Convergence

### D1. Sleep boundary release

Setup:
- Let elevation cross below `-5`.

Action:
1. Observe `oal_column_lights_sleep_mode_final_safety`.
2. Trigger `script.oal_reset_soft` once below `-5`.

Expected:
- Sleep switch ON.
- Session OFF.
- Columns converge to AL sleep ownership.

Expected debug:
- `decision=release_forced`, source sleep trigger/reset path.

### D2. No stale RGB hold

Action:
1. Check columns after release convergence.

Expected:
- No persistent twilight-protected state deep night.
- No unexpected re-protect outside window.

---

## Suite E: Startup and Recovery

### E1. Restart outside recoverable window

Action:
1. Restart HA when conditions are not startup-recoverable.

Expected:
- `prepare_on_start` emits `skip` with reason.
- `startup_reconcile` emits session-clear/already-off result.

### E2. Restart inside recoverable window

Setup:
- descending, `-5 <= elevation < 3`
- sleep switch off
- at least one column light on
- manual list empty

Action:
1. Restart HA.

Expected:
- `prepare_on_start` emits `execute`.
- Session and manual protection are restored.

### E3. Self-heal recovery

Setup:
- Active protected window with session ON.

Action:
1. Simulate accidental manual clear.

Expected:
- Self-heal re-applies RGB + manual.
- Debug:
  - `decision=heal_executed`

---

## Suite F: Morning Exit

### F1. Sleep exit and color mode normalization

Setup:
- Let sunrise progression occur naturally.

Action:
1. Observe sleep trigger around `>5` rising.
2. Observe morning exit trigger around `>8` rising.

Expected:
- Session OFF.
- Manual cleared.
- AL ownership restored in color_temp mode.
- No unintended RGB re-lock in morning.

---

## Suite G: Concurrency and Soak

### G1. Rapid reset stress

Action:
1. Fire `script.oal_reset_room` and `script.oal_reset_soft` rapidly (20+ mixed invocations).

Expected:
- Deterministic final state.
- No stuck partial manual/session state.

### G2. Config and force stress

Action:
1. Rapidly toggle configurations during active window.
2. Trigger manual adjustment force path concurrently.

Expected:
- Protected columns retain correct ownership under `column_safe`.
- No trace storms or automation loop warnings.

### G3. Startup plus active traffic

Action:
1. During test window, restart HA while background triggers remain active.

Expected:
- Startup reconciliation and prepare-on-start do not conflict.
- End state converges consistently.

---

## Pass/Fail Checklist

Mark all `PASS` before rollout signoff:
1. `PASS/FAIL` protected columns survive all non-explicit force/config/reset/movie flows.
2. `PASS/FAIL` deep-night convergence releases to sleep ownership.
3. `PASS/FAIL` startup recovery and startup reconciliation match eligibility contract.
4. `PASS/FAIL` self-heal restores only when contract says it should.
5. `PASS/FAIL` morning exit clears session/manual and restores AL ownership.
6. `PASS/FAIL` debug events emitted with correct decision/source/reason.
7. `PASS/FAIL` no persistent oscillation or queue deadlock under soak.

## Failure Triage Sequence

1. Verify kill switch is off and debug events are on.
2. Confirm current window predicate (`sun` rising/elevation) matches expectation.
3. Confirm session boolean and manual list are coherent.
4. Inspect the most recent `oal_column_rgb_debug` event:
   - decision
   - source
   - reason/result
5. Inspect core engine trace for `force_intent` handling.
6. Inspect config manager trace for column filtering decisions.
7. If instability persists, temporarily set `oal_column_rgb_guard_kill_switch = on`, run `script.oal_reset_soft`, then retest.

## Signoff Record Template

- Date:
- Tester:
- Environment:
- Sunset window tested:
- Restart scenarios tested:
- Soak duration:
- Overall result: `PASS` or `FAIL`
- Open defects:
- Recommended next action:
