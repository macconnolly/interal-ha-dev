# Column RGB Sunset Validation Runbook

## Purpose

Validate end-to-end column RGB lifecycle behavior after the full-coverage remediation in
`packages/oal_lighting_control_package.yaml`, with explicit event-level observability.

This runbook is designed for live execution on Tuesday, February 10, 2026 (and reusable on future days),
and is intentionally elevation-driven so it remains correct across seasonal sunset shifts.

## Scope

In scope:
- RGB prepare/transition/sleep/morning lifecycle
- Cross-automation protection (engine, config manager, movie, reset scripts)
- Startup recovery behavior
- Debug event emissions (`oal_column_rgb_debug`)

Out of scope:
- Cosmetic tuning beyond contract behavior
- Non-column zone visual quality tuning

## Preflight (T-30 to T-10 minutes before +3deg descent)

1. Set safety/debug toggles:
   - `input_boolean.oal_column_rgb_guard_kill_switch = off`
   - `input_boolean.oal_column_rgb_debug_events = on`
2. Confirm column AL sleep target:
   - `switch.adaptive_lighting_column_lights` attribute `sleep_rgb_color` is `[245, 120, 0]`
3. Confirm lifecycle automations are enabled:
   - `automation.oal_v13_column_lights_prepare_rgb_mode`
   - `automation.oal_v13_column_lights_rgb_transition`
   - `automation.oal_v13_column_lights_sleep_mode_final_safety`
   - `automation.oal_v13_column_lights_morning_exit_rgb_mode`
   - `automation.oal_v13_column_lights_rgb_self_heal`
4. Ensure at least one column light is ON before evening crossing.
5. Open observers:
   - Developer Tools -> Events listener for `oal_column_rgb_debug`
   - Traces for:
     - `automation.oal_v13_core_adjustment_engine_master`
     - `automation.oal_v13_configuration_manager_power_handoff`
     - `automation.oal_v13_column_lights_prepare_rgb_mode`
     - `automation.oal_v13_column_lights_sleep_mode_final_safety`
   - States view pinned to:
     - `input_boolean.oal_column_rgb_session_active`
     - `binary_sensor.oal_column_rgb_window_active`
     - `binary_sensor.oal_column_rgb_protect_active`
     - `switch.adaptive_lighting_sleep_mode_column_lights`
     - `switch.adaptive_lighting_column_lights` (`manual_control` attribute)

## Execution Timeline (Elevation-Locked)

### Phase 1: Before protect window (`elevation >= 3`, descending)

Expected:
- `oal_column_rgb_session_active = off`
- `binary_sensor.oal_column_rgb_window_active = off`
- No protect decisions active

Checks:
1. Trigger `script.oal_reset_soft`.
2. Verify columns are not forced into RGB protect.
3. Verify no erroneous `protect_engage` debug event.

### Phase 2: Entry into protect window (`3 > elevation >= -5`, descending)

Expected automation:
- `oal_column_lights_prepare_rgb_mode_v13` fires once on threshold crossing.

Expected sequence:
1. Brightness raise to 35%
2. RGB set to `[255, 200, 0]`
3. `manual_control` set true for both column lights
4. `oal_column_rgb_session_active` set on
5. Brightness reduced to 5%

Expected debug events:
- `decision=protect_engage`, `source=oal_column_lights_prepare_rgb_mode_v13`
- On HA restart in-window only: `decision=prepare_on_start` with `result=execute|skip`

Checks:
1. Confirm both column entities are present in column switch `manual_control` list.
2. Confirm `binary_sensor.oal_column_rgb_protect_active = on`.
3. Trigger `script.oal_reset_soft` and verify manual state remains locked (no forced release).

### Phase 3: Window active stress tests (`3 > elevation >= -5`, descending)

Run these while protection is active:
1. Trigger `script.oal_reset_room` with column targets.
2. Trigger `script.oal_reset_room` with mixed targets (columns + non-columns).
3. Switch `input_select.oal_active_configuration` to `Adaptive`, then `Full Bright`, then `Adaptive`.
4. Execute manual adjustment flow that emits force watchdog events.

Expected:
- Columns remain protected unless explicit override intent is used.
- Engine debug may emit:
  - `decision=engine_protect_filter`, `result=columns_filtered`
- No unexpected column release from config transitions or force events.

### Phase 4: Sleep handoff (`elevation < -5`)

Expected automation:
- `oal_column_lights_sleep_trigger_v13` evening branch.

Expected state:
- `switch.adaptive_lighting_sleep_mode_column_lights = on`
- `oal_column_rgb_session_active = off`
- Column manual control released by lifecycle/reset convergence

Expected debug event:
- `decision=release_forced`, `source=oal_column_lights_sleep_trigger_v13`, `reason=evening_final_below_minus5`

Checks:
1. Trigger `script.oal_reset_soft` at deep night.
2. Verify columns converge to AL sleep ownership, not stale evening RGB hold.

### Phase 5: Startup recovery checks

Scenario A: Restart in protect window (`3 > elevation >= -5`, descending, sleep off, columns on, manual empty)
- Expect `prepare_on_start` with `result=execute`.
- Expect protect re-established.

Scenario B: Restart outside recoverable conditions
- Expect `prepare_on_start` with `result=skip`.
- Expect startup reconciliation:
  - `decision=startup_reconcile`, `result=session_cleared|session_already_off|session_retained`

### Phase 6: Morning exit (`elevation > 8`, rising)

Expected:
- `oal_column_lights_morning_exit_rgb_v13` runs.
- Columns forced to color temperature mode, manual cleared, session off.

Checks:
1. Confirm `oal_column_rgb_session_active = off`.
2. Confirm `manual_control` list empty for columns.
3. Confirm AL normal ownership resumed.

## Expected Debug Decision Matrix

| decision | Typical source | Expected meaning |
|---|---|---|
| `prepare_on_start` | `oal_column_lights_prepare_rgb_mode_v13` | Startup recovery branch evaluated and either executed or skipped with reason |
| `protect_engage` | `oal_column_lights_prepare_rgb_mode_v13`, `oal_reset_soft`, `oal_reset_room` | Manual RGB protection was actively preserved |
| `protect_skip` | `oal_reset_soft`, `oal_reset_room` | Protection intentionally not applied (out of scope/not manual/not targeted) |
| `release_forced` | `oal_column_lights_sleep_trigger_v13`, `oal_reset_soft`, `oal_reset_room` | Session/manual release to AL ownership was intentionally enforced |
| `heal_executed` | `oal_column_lights_rgb_self_heal_v13` | Recovery re-locked manual RGB session |
| `engine_protect_filter` | `oal_core_adjustment_engine_v13` | Engine filtered protected columns (or explicit override bypass) |
| `startup_reconcile` | `oal_system_startup_v13` | Startup session state reconciled to runtime reality |

## Pass Criteria

All must pass:
1. No force/config/movie/reset path clears protected columns inside window.
2. At deep night, columns do not stay stuck in evening RGB due to protection reassertion.
3. Startup recovery only runs when eligibility contract is true.
4. Morning exit clears session/manual and returns columns to AL ownership.
5. Every major transition has at least one matching `oal_column_rgb_debug` event with correct `decision`/`source`.

## Triage Guide (If Any Check Fails)

1. If protected columns are overwritten during twilight:
   - Inspect `oal_core_adjustment_engine_v13` trace for `force_intent` and `engine_protect_filter`.
   - Verify emitter sent `force_intent: column_safe`.
2. If columns stay stale RGB deep night:
   - Check sleep switch state and `release_forced` events.
   - Check whether manual list was actually cleared.
3. If restart does not recover when expected:
   - Inspect `prepare_on_start` event `reason`.
   - Validate in-window, columns-on, sleep-off, manual-empty conditions.
4. If self-heal loops:
   - Check whether session is being cleared and re-enabled by competing flows.
   - Validate kill switch remains off and sleep switch logic is correct.

## Rollback Control (Operational)

If rapid stabilization is needed:
1. Set `input_boolean.oal_column_rgb_guard_kill_switch = on` (disables advanced protection policy).
2. Set `input_boolean.oal_column_rgb_debug_events = off` (reduces event noise).
3. Run `script.oal_reset_soft` to converge system state.
