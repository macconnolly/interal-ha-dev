# OAL v13 Phase 4 Plan — Pressure Test

Exhaustive logic tracing of every code path that interacts with the proposed changes.
Findings are categorized as **BUG** (must fix), **EDGE CASE** (should document), or **IMPROVEMENT** (optional enhancement).

---

## Methodology

Every automation and script that sets or clears `manual_control` was traced to determine how it interacts with the proposed reverse watcher (Change 1). Every path that modifies `oal_active_configuration` was traced to verify the reverse watcher's condition guard holds. The engine's `mode: queued` (max: 20) behavior was accounted for in all concurrency analysis.

### Manual Control Clearing Paths (11 total)

| # | Location | Automation/Script | Transition Locked? |
|---|----------|-------------------|--------------------|
| 1 | L1509 | Config Manager — Baseline path | YES |
| 2 | L1558 | Config Manager — Force-On path | YES |
| 3 | L1626 | Config Manager — Override cleanup | YES |
| 4 | L1990 | Column morning exit RGB | NO |
| 5 | L2291 | Isolated override exit (desk lamp only) | NO |
| 6 | L2525 | Movie mode end (ALL switches) | NO |
| 7 | L2632 | Nightly maintenance (ALL switches) | NO |
| 8 | L3739 | Soft reset — columns outside window | Inside script |
| 9 | L3752 | Soft reset — non-column zones | Inside script |
| 10 | L3902 | Room reset — target zones | NO |
| 11 | — | AL autoreset timer (HACS-internal) | NO |

Paths 1-3 are locked (`oal_config_transition_active = on`), so the reverse watcher's condition guard blocks them. Correct.

Paths 4-7, 10-11 are NOT locked. The reverse watcher CAN fire for these. Each is traced below.

Paths 8-9 are inside `oal_reset_soft`. The soft reset sets config to "Adaptive" before the watcher's 3s debounce expires, so the watcher's condition (`state: "Manual"`) fails. Correct.

---

## Finding 1: Movie Mode End — Uncovered in Plan (EDGE CASE)

**Path**: `oal_movie_mode_handler_v13` end_movie sequence (L2505-2529).

When a movie ends:
1. `scene.turn_on` restores pre-movie state (transition: 3) — L2512
2. `set_manual_control: false` on ALL switches — L2525
3. `movie_mode_active` turned off — L2527

Currently, after step 2, config stays stuck on "Manual" (if forward watcher set it during movie start). No engine trigger fires. AL resumes managing lights with whatever stale settings were last pushed.

**With Change 1**: After step 2, the reverse watcher's template evaluates `count == 0` → 3s debounce starts. At ~T+3.1s, watcher fires → resets warmth → sets "Adaptive" → Config Manager fires Baseline path → engine runs.

**Timeline analysis**:
- T+0.0s: Scene restore begins (3s fade)
- T+0.1s: manual_control cleared
- T+0.2s: movie_mode_active off
- T+3.0s: Scene fade complete
- T+3.1s: Reverse watcher fires
- T+3.3s: Config Manager engine run → pushes current AL settings

The scene fade completes at ~T+3.0s. The engine runs at ~T+3.3s and pushes AL-calculated brightness/warmth for the current time of day. If the movie lasted hours (e.g., started at dusk, ended at night), the engine's calculated settings will differ from the restored scene's stale settings. The user sees a brightness snap at T+3.3s.

**Assessment**: This is a net improvement. Currently the stale settings persist until the next 15-minute periodic engine run (or indefinitely if config stays "Manual"). The 3.3s snap is far better. However, the plan should:

1. **List movie mode end** as a covered path in Change 1's coverage list (currently omitted)
2. **Add a verification test** for this interaction

**Severity**: Edge case — the plan works correctly here but doesn't document it.

---

## Finding 2: Room Reset `adaptive_lighting.apply` on Empty Target (BUG)

**Path**: Change 4 Part B — the `adaptive_lighting.apply` call at the end.

```yaml
      - service: adaptive_lighting.apply
        target:
          entity_id: "{{ non_column_switches }}"
        data:
          turn_on_lights: true
          transition: 1
```

When `oal_reset_room` targets ONLY column lights, `non_column_switches` evaluates to `[]` (empty list). The `adaptive_lighting.apply` call receives an empty `entity_id`. HA behavior for empty service call targets is inconsistent across integrations — some silently no-op, others log warnings, and some throw errors.

The non-column `set_manual_control` call above IS properly guarded:
```yaml
      - if:
          - condition: template
            value_template: "{{ non_column_switches | length > 0 }}"
```

But the apply call is NOT inside this guard — it's in the general "Apply + Engine Trigger" section.

**Fix**: Wrap the apply in the same guard:
```yaml
      - if:
          - condition: template
            value_template: "{{ non_column_switches | length > 0 }}"
        then:
          - service: adaptive_lighting.apply
            target:
              entity_id: "{{ non_column_switches }}"
            data:
              turn_on_lights: true
              transition: 1
```

**Severity**: Minor bug. Column-only room resets are infrequent, and HA typically handles empty targets gracefully (silent no-op or warning log). But it should be fixed for correctness.

---

## Finding 3: Column RGB Entry Triggers Forward Watcher → "Manual" Config Every Evening (PRE-EXISTING, EDGE CASE)

**Path**: `oal_column_lights_prepare_rgb_mode_v13` (L1831) fires at sun < 3° every evening.

1. Sets `manual_control: true` on column lights — L1890
2. Forward watcher (`oal_auto_switch_to_manual_config`) triggers: count > 0, config == "Adaptive" → sets "Manual"
3. Config Manager processes "Manual": MANUAL SHORTCUT (L1653-1660) — just unlocks `oal_config_transition_active`
4. ZEN32 B5 LED changes to red (Manual indicator) — user hasn't pressed anything

**With Change 1**: In the morning, column exit RGB (L1938) clears `manual_control` at sun > 8°. If columns were the only manual zone, reverse watcher fires → "Adaptive" → LED returns to white/green. This is correct cleanup.

**Assessment**: The evening LED flip to red is a pre-existing UX issue (not introduced by this plan). The reverse watcher actually improves it by ensuring cleanup in the morning. The plan doesn't need to fix this, but should note it as known behavior.

**However**, there's a downstream question: does the "Manual" config state during the evening affect anything beyond the LED? Looking at the engine's calculation:
- Config Manager's MANUAL SHORTCUT doesn't change any offsets (L1653-1660 just unlocks the transition)
- The engine doesn't branch on `oal_active_configuration == "Manual"` — it reads offset values regardless
- No automation treats "Manual" differently except the reverse watcher and forward watcher

So the functional impact is zero — only the LED is affected. The reverse watcher's condition `state: "Manual"` will correctly match this state, and the morning exit will trigger the return to "Adaptive".

**Severity**: Pre-existing cosmetic issue. No action needed in this plan.

---

## Finding 4: Nightly Maintenance + Reverse Watcher Interaction (EDGE CASE — CORRECT)

**Path**: `oal_v13_nightly_maintenance_clear_stuck_manual` (L2621) at 03:00.

1. Clears ALL `manual_control` — L2628-2632
2. Checks zen32 last-press condition — L2634-2636
3. If condition passes: calls `script.oal_reset_soft` — L2637

**Scenario A**: Config is "Manual", zen32 condition passes:
- T+0.0s: manual_control cleared
- T+0.1s: Condition passes, soft reset starts
- `was_non_adaptive = true` (config still "Manual")
- Soft reset clears manual_control (already cleared), resets offsets, sets "Adaptive"
- Config Manager fires → engine runs once
- T+3.0s: Reverse watcher debounce expires → condition `config == "Manual"` → FALSE (already "Adaptive") → doesn't fire
- **Result**: 1 engine run. Correct.

**Scenario B**: Config is "Manual", zen32 condition fails:
- T+0.0s: manual_control cleared
- T+0.1s: Condition fails, no soft reset
- T+3.0s: Reverse watcher fires → sets "Adaptive" → Config Manager fires
- **Result**: 1 engine run. Correct.

**Scenario C**: Config is "Sleep" at 03:00:
- manual_control cleared (safety)
- Reverse watcher: `config == "Manual"` → FALSE → doesn't fire
- AL sleep mode switches still active — lights stay in sleep mode
- **Result**: No engine run, no disruption. Correct.

**Severity**: No issue. All scenarios handled correctly.

---

## Finding 5: Sunrise Sequence + Reverse Watcher (EDGE CASE — CORRECT)

**Path**: Sonos alarm sunrise automation (L2392-2419).

1. T+0: `adaptive_lighting.apply` on bedroom with `set_manual_control: true` — L2398
2. T+0.1s: `adaptive_lighting.apply` on entryway with `set_manual_control: true` — L2406
3. T+10m: `adaptive_lighting.apply` on kitchen with `set_manual_control: true` — L2414
4. Forward watcher fires at step 1: config → "Manual"

The 600-second transition fades are protected because `manual_control: true` on each zone keeps count > 0. The reverse watcher cannot fire during the fade.

After AL autoreset clears each zone's manual_control one by one (over minutes), the last zone clearing triggers the reverse watcher → "Adaptive". This is correct: the sunrise sequence has completed by then.

**Severity**: No issue. The 3s debounce is irrelevant here (minutes between zone clears).

---

## Finding 6: Isolated Override Exit — Desk Lamp Only (EDGE CASE — CORRECT)

**Path**: `oal_isolated_override_manager_v13` (L2275) when exiting "Work" mode.

The isolated override only controls `light.office_desk_lamp` on `switch.adaptive_lighting_main_living`. When it clears `manual_control` for that single light:
- If desk lamp was the ONLY light with manual_control across ALL switches → count = 0 → reverse watcher fires
- If other lights are still manual → count > 0 → reverse watcher doesn't fire

The isolated override exit does NOT set `oal_active_configuration`. If config was "Manual" (from a prior ZEN32 press that happened to be active when Work mode was enabled), the reverse watcher correctly returns to "Adaptive" when the desk lamp is the last manual light.

If config was NOT "Manual" (e.g., user explicitly set "Dim Ambient" then enabled Work mode), the watcher's condition fails → doesn't fire. Correct — we don't override intentional config selections.

**Severity**: No issue.

---

## Finding 7: Override "Extend 1 Hour" Notification → Re-Sets manual_control (EDGE CASE — CORRECT)

**Path**: `oal_v13_override_expiring_notification` (L2780) → user clicks "Extend 1 Hour" → `set_manual_control: true` at L2824-2829.

This re-sets `manual_control: true` on one zone's switch. Since config is already "Manual" and count was about to hit 0 (override was expiring), this re-adds to the count. The reverse watcher's debounce timer (if started) sees count > 0 → template becomes false → timer resets. Watcher doesn't fire. Correct.

When the extended override eventually expires (AL autoreset), the reverse watcher fires normally.

**Severity**: No issue.

---

## Finding 8: Forward + Reverse Watcher Oscillation Analysis (EDGE CASE — IMPOSSIBLE)

Could the two watchers create a feedback loop?

- Forward fires when: `count > 0 AND config == "Adaptive"` → sets "Manual"
- Reverse fires when: `count == 0 AND config == "Manual"` (after 3s) → sets "Adaptive"

For oscillation: count must rapidly toggle between 0 and >0 while both watchers alternate. But:

1. After forward fires → config = "Manual". Forward can't re-fire (condition requires "Adaptive").
2. For reverse to fire → count must be 0 for 3 continuous seconds.
3. After reverse fires → config = "Adaptive". For forward to fire again → count must be > 0.
4. count going from 0 to > 0 requires something to SET manual_control — that's a user action (ZEN32 press) or system action (column RGB enter, movie start, etc.).

So each "cycle" requires a real event (user press → autoreset timeout → watcher → ...). This is normal usage (minutes per cycle), not pathological oscillation.

**Pathological case**: Rapid manual_control set/clear in the same second. The forward watcher fires instantly (no debounce), setting "Manual". Then if manual_control clears immediately, the reverse watcher starts its 3s debounce. If manual_control is re-set within 3s, the template toggles false → timer resets. No reverse fire. Even without the re-set, the forward watcher can't fire again during the 3s (config is "Manual", not "Adaptive"). After 3s, if count is still 0, reverse fires → "Adaptive". Then if count goes > 0 again (next user action), forward fires. This is sequential, not oscillating.

**Severity**: Impossible. No oscillation can occur.

---

## Finding 9: `was_non_adaptive` Race When Reverse Watcher Fires During Soft Reset (EDGE CASE — CORRECT)

The plan documents this race in Change 2's interaction table, but let me trace the exact HA event loop ordering:

**Scenario**: Config is "Manual", all zones have manual_control.

1. T+0.0s: `oal_reset_soft` starts. `was_non_adaptive = true` (captured at script start).
2. T+0.1s: Soft reset clears column manual_control (L3690-3739).
3. T+0.2s: Soft reset clears non-column manual_control (L3744-3752).
4. T+0.2s: `oal_manual_control_sync_offset` fires for each zone (Change 3) — resets offsets, fires non-force watchdog events.
5. T+0.2s: Reverse watcher template evaluates: count == 0 → debounce starts.
6. T+0.3s: Soft reset resets remaining offsets (L3757-3765).
7. T+0.4s: Soft reset reaches Config/Mode Reset block (Change 2 Part B).
8. T+0.5s: Resets warmth, isolated mode, movie mode.
9. T+0.6s: Sets `oal_active_configuration` → "Adaptive". Config Manager fires.
10. T+0.7s: Config Manager locks `oal_config_transition_active`.
11. T+2.0s: Config Manager completes, unlocks, fires watchdog. Engine runs.
12. T+2.1s: Soft reset's else branch: `wait_template` passes (transition active = off). Done.
13. T+3.2s: Reverse watcher debounce expires. Condition: `config == "Manual"`? NO ("Adaptive"). Watcher doesn't fire.

Engine runs from step 4 (non-force watchdogs from sync_offset): these execute before Config Manager locks transition (step 10). So 1-6 engine runs queue up from step 4 (one per zone), PLUS 1 from Config Manager at step 11.

**Wait — this reveals a problem**: Change 3 fires a non-force watchdog PER ZONE. If 6 zones clear manual_control, that's 6 non-force watchdog events. Each queues an engine run. Plus Config Manager fires 1 more. Total: up to 7 engine runs.

The non-force watchdogs from step 4 arrive BEFORE Config Manager locks `oal_config_transition_active` at step 10. The engine condition at L628-638:
```yaml
- condition: or
  conditions:
    - condition: template
      value_template: >
        {{ trigger.platform == 'event' and
           (trigger.event.data.force | default(false)) == true }}
    - condition: state
      entity_id: input_boolean.oal_config_transition_active
      state: "off"
```

At T+0.2s-0.6s, `oal_config_transition_active` is still "off" (Config Manager hasn't fired yet). So all 6 non-force watchdogs pass the condition and queue as engine runs.

At T+0.7s, Config Manager locks transition. The engine is now processing its queue. Any runs that START after the lock will check the condition — but queued runs have already PASSED the condition at trigger time. HA's queued mode evaluates conditions at trigger time, not at execution time... actually, let me reconsider.

In HA's automation behavior: for `mode: queued`, the trigger fires and the run starts executing the action sequence. If 6 events arrive simultaneously, they queue. Each queued run executes the full action sequence (including the condition check) when it reaches the front of the queue. Wait — actually, for automations, the condition is checked BEFORE queueing. Let me re-read the HA docs behavior...

Actually, in HA automations with `mode: queued`:
1. Trigger fires
2. **Condition is evaluated immediately**
3. If condition passes, the run enters the queue
4. When it reaches the front, the action sequence executes

So the condition is evaluated at trigger time, not execution time. At T+0.2s, all 6 non-force events arrive. For each, the condition evaluates: `trigger.platform == 'event'` AND `force == false` → first condition fails. Second condition: `config_transition_active == off` → TRUE. Condition passes. All 6 enter the queue.

**These 6 runs will all execute sequentially, each taking ~200ms, totaling ~1.2s of engine processing.** Then Config Manager's force watchdog at T+2.0s adds 1 more run. Total: 7 runs.

Is this harmful? The engine is idempotent. Each run recalculates and pushes settings. The soft reset has already zeroed all offsets by T+0.3s, so all 7 runs calculate identical values. The Zigbee/Z-Wave traffic is 7× normal, which adds ~1.4s of bus time. This is noticeable but not harmful — soft reset is infrequent.

**However**: this 6-run pile-up is specific to the soft reset path, where Change 3's per-zone watchdogs all fire simultaneously. During normal autoreset (one zone at a time, minutes apart), only 1 watchdog fires per zone. The pile-up only happens when soft reset bulk-clears all zones at once.

**Mitigation options**:
1. Accept it (7 idempotent runs during infrequent soft reset is harmless)
2. Add a `condition` to `oal_manual_control_sync_offset` that checks `oal_config_transition_active == off` (but transition isn't locked yet at this point, so this wouldn't help)
3. Add a condition that skips the watchdog if `script.oal_reset_soft` is running (HA can check `is_state('script.oal_reset_soft', 'on')`)

Option 3 is the cleanest:
```yaml
    action:
      - service: input_number.set_value
        target:
          entity_id: "{{ helper_entity }}"
        data:
          value: 0
      # Only trigger engine if this is a standalone autoreset (not bulk-clear from soft reset)
      - if:
          - condition: template
            value_template: "{{ is_state('script.oal_reset_soft', 'off') }}"
        then:
          - event: oal_watchdog_trigger
            event_data:
              source: "autoreset_offset_clear"
```

**Severity**: Minor efficiency issue. The system is correct but wastes ~1.4s of bus time during soft reset. The guard is a clean fix.

---

## Finding 10: Soft Reset `was_non_adaptive` When Config is "Sleep" (EDGE CASE — CORRECT)

If `oal_reset_soft` is called while config is "Sleep":
- `was_non_adaptive = true` ("Sleep" != "Adaptive")
- Soft reset clears manual_control, resets offsets
- Sets config to "Adaptive" → Config Manager fires
- Config Manager Baseline path: turns off AL sleep switches (L1483-1491), restores scene, releases manual controls, fires watchdog
- Soft reset else branch: waits for transition completion

This correctly exits sleep mode. The user called soft reset, which is the expected "reset everything" action.

**Severity**: No issue. Correct behavior.

---

## Finding 11: Room Reset Column Offset Reset During Gaussian Window (EDGE CASE — CORRECT)

When room reset targets columns during the Gaussian window:
1. Columns get RGB color applied + `manual_control: true`
2. Column brightness offset (`oal_manual_offset_column_lights_brightness`) reset to 0
3. Engine fires with `force: true`

The engine calculates for column_lights zone, but columns have `manual_control: true`, so AL won't push settings to them. The RGB color applied in step 1 persists. When the Gaussian window exits (morning), column exit automation clears `manual_control`, and AL resumes with offset = 0 (clean).

**Severity**: No issue.

---

## Finding 12: Reverse Watcher Warmth Reset is Redundant With Soft Reset (IMPROVEMENT)

The plan's Change 2 Part B adds an explicit warmth reset:
```yaml
      - service: input_number.set_value
        target:
          entity_id: input_number.oal_offset_global_manual_warmth
        data:
          value: 0
```

But `offset_entities_to_reset` (L3670-3679) already includes `oal_offset_global_manual_warmth` when any zone is overridden. So warmth gets reset twice during soft reset (once in the offset block at L3757, once in the Config/Mode Reset block).

The plan correctly justifies this: the explicit reset covers the edge case where `overridden_zone_names` is empty (e.g., reverse watcher already fired and cleared everything before soft reset reached the offset block).

**Recommendation**: Add a comment noting the intentional redundancy, so future maintainers don't remove it thinking it's a mistake:
```yaml
      # Explicit warmth reset (defense-in-depth: offset_entities_to_reset above
      # may skip this if reverse watcher already cleared all zones)
      - service: input_number.set_value
```

**Severity**: Documentation improvement only.

---

## Finding 13: Gaussian Window Duplication Drift Risk (IMPROVEMENT)

The Gaussian window detection logic is now in THREE places:
1. `oal_reset_soft` variables (L3628-3630)
2. `oal_reset_room` variables (Change 4 Part A)
3. `oal_column_lights_prepare_rgb_mode_v13` condition (L1838-1844, different form: `elevation < 3`)

If the window bounds are ever changed (e.g., from `[-5, 8]` to `[-6, 10]`), all three must be updated. The plan notes this risk in Invariant #2 assessment ("Low" risk because of duplication).

**Mitigation option**: Create an `input_boolean.oal_gaussian_rgb_window_active` helper set by the sunset logic automation. Both reset scripts read the helper instead of recalculating. This centralizes the logic in one place.

**However**: this adds a new entity and a dependency chain. The current approach is simpler (two identical template expressions). The risk is low because the bounds haven't changed since v13 was created.

**Recommendation**: Leave as-is but add a `# SYNC:` comment at each location pointing to the others:
```yaml
      # SYNC: Gaussian window bounds must match oal_reset_soft L3628 and prepare_rgb L1838
      in_gaussian_rgb_window: >
```

**Severity**: Low-risk improvement. Comment is sufficient.

---

## Finding 14: `oal_deferred_manual_control_set` All-Lights-Off Edge Case (EDGE CASE — BENIGN)

When all lights are off and the user presses ZEN32 brighter:
1. `oal_manual_brightness_step` adjusts offsets
2. `oal_global_adjustment_start` fires watchdog + starts `oal_deferred_manual_control_set`
3. Deferred script: `on_lights` is empty → no `manual_control` set → sets config to "Manual" (L3274)
4. Reverse watcher: count = 0 (no manual_control), config = "Manual" → debounce starts
5. T+3s: Reverse watcher fires → resets warmth → sets "Adaptive"

The user pressed brighter, but all lights were off. No visible change. Config briefly goes "Manual" then back to "Adaptive" in 3s. The warmth offset they just adjusted gets reset to 0 by the reverse watcher.

**Is the warmth reset a problem?** No — lights are off, the warmth adjustment had no visible effect. When lights turn on later, the system is in Adaptive with warmth = 0, which is correct baseline behavior.

**What about the brightness offset?** The per-zone brightness offsets were set by `oal_manual_brightness_step` but the sync_offset watcher (`oal_manual_control_sync_offset`) only fires when `manual_control` changes. Since `manual_control` was never set (lights were off), the sync_offset watcher doesn't fire. The brightness offsets persist. When lights turn on, they'll have the user's brightness adjustment applied but warmth reset to 0.

**Is this correct?** It's debatable. The user pressed brighter (expecting brighter lights), but also had warmth adjusted (expecting warmer lights). The warmth is lost but brightness is kept. This is inconsistent. However, this is an extremely rare edge case (adjusting lights that are all off) and the behavior is benign.

**Severity**: Benign edge case. Not worth adding complexity to handle.

---

## Finding 15: Test 4 Needs Simulation Guidance (IMPROVEMENT)

Test 4 (Room Reset — Columns During Gaussian Window) requires sun elevation between -5° and 8° in the evening. This can only be tested naturally during a narrow daily window (~30-60 minutes depending on latitude and season).

**Recommendation**: Add guidance for simulating this in HA dev tools:
```
Alternative: Use Developer Tools → States to temporarily set
sun.sun attributes: elevation: 2.0, rising: false.
Then set input_number.oal_offset_column_rgb_green to 185.
Run room reset and observe column behavior.
Restore sun.sun state after testing.
```

**Severity**: Test methodology improvement.

---

## Finding 16: Missing Test — Movie Mode End Recovery (BUG in test coverage)

The plan has no test for the movie mode end → reverse watcher → Adaptive path. This is a significant interaction (Finding 1) that should be verified.

**Proposed Test 10: Movie Mode End Recovery**

**Setup**: System in Adaptive mode, no manual overrides.

1. Start movie playback on `media_player.living_room_apple_tv`
2. **Verify**: `oal_movie_mode_active` is on, `oal_active_configuration` is "Manual"
3. Stop/pause playback, wait for 90s end_movie trigger
4. **Verify within 5s**: `oal_active_configuration` returns to "Adaptive"
5. **Verify**: `oal_movie_mode_active` is off
6. **Verify**: `oal_offset_global_manual_warmth` is 0
7. **Verify**: engine trace shows a run from Config Manager (Baseline path)

**What this proves**: The reverse watcher correctly catches the movie mode end clearing of manual_control and returns the system to Adaptive, with an engine recalculation using current time-of-day settings.

**Severity**: Missing test for a real interaction path.

---

## Finding 17: Config Manager `mode: restart` Interaction With Rapid Config Changes (EDGE CASE — CORRECT)

Config Manager (L1314) uses `mode: restart`. If the reverse watcher sets "Adaptive" and Config Manager starts processing, then something else immediately sets a different config, Config Manager restarts with the new config. The reverse watcher's "Adaptive" transition is abandoned mid-execution.

Is this possible? The reverse watcher sets "Adaptive" after a 3s debounce. For Config Manager to restart, something must change `oal_active_configuration` again within Config Manager's execution time (~2s). That would require a user action (ZEN32 press) or automation (sleep schedule) during the ~2s window.

If this happens: Config Manager processes the new config (e.g., "Sleep"), which is correct — the user's/system's latest intent wins. The reverse watcher's "Adaptive" is abandoned in favor of the newer request. HA's `mode: restart` ensures the latest config is applied.

**Severity**: No issue. HA's restart mode handles this correctly.

---

## Finding 18: `oal_config_transition_active` Lock Timing During Reverse Watcher (EDGE CASE — CORRECT)

When the reverse watcher fires:
1. Resets warmth — `input_number.set_value` (~50ms)
2. Sets "Adaptive" — `input_select.select_option` (~50ms)
3. Config Manager fires — locks `oal_config_transition_active`

Between steps 1 and 3 (~100ms), `oal_config_transition_active` is still "off". Could another automation sneak in?

The forward watcher checks: `config == "Adaptive"` AND `config_transition_active == off`. At step 2, config just changed to "Adaptive". If any zone has `manual_control` at this instant, the forward watcher could fire → set "Manual" → Config Manager restarts (mode: restart) processing "Manual" instead of "Adaptive".

Could any zone have `manual_control` at this point? The reverse watcher only fires when count == 0 (all zones clear). So no zone has manual_control. The forward watcher's template `count > 0` evaluates false. Forward watcher doesn't trigger. Safe.

**Severity**: No issue. The forward watcher's trigger condition prevents the race.

---

## Finding 19: Sunset Logic Column Green Snap at 5° (PRE-EXISTING, OUT OF SCOPE)

The sunset logic at L1787-1807 has this branch structure:
```jinja
{% if not rising and elevation <= 0 and elevation >= -5 %}
  {# EVENING FADE: 200 → 165 #}
{% elif rising and elevation >= 5 and elevation <= 12 %}
  {# MORNING FADE: 165 → 200 #}
{% elif elevation < 5 %}
  165
{% else %}
  200
{% endif %}
```

During evening descent at 4.9° (not rising): falls into `elif elevation < 5` → snaps to 165. At 5.0°: falls into `else` → 200. This is a 35-unit green channel snap between 5.0° and 4.9°.

This is the bug Plan 2 identified and proposed fixing. The plan under review correctly defers it as a separate follow-on change. Change 4's room reset reads `oal_offset_column_rgb_green` (already set by sunset logic), so the reset applies whatever value sunset logic calculated — including the snapped 165. The reset itself is correct; it's the sunset input that's wrong.

**Severity**: Pre-existing bug, out of scope for this plan. Documented for follow-up.

---

## Summary

### Must Fix (2)

| # | Finding | Change | Fix |
|---|---------|--------|-----|
| 2 | `adaptive_lighting.apply` on empty `non_column_switches` | Change 4 | Wrap apply in `non_column_switches | length > 0` guard |
| 9 | Soft reset bulk-clear triggers 6 redundant engine runs via Change 3 | Change 3 | Add `is_state('script.oal_reset_soft', 'off')` guard to watchdog trigger |

### Should Document (3)

| # | Finding | Location |
|---|---------|----------|
| 1 | Movie mode end is an undocumented covered path | Change 1 coverage list |
| 12 | Warmth reset redundancy is intentional defense-in-depth | Change 2 Part B comment |
| 13 | Gaussian window bounds are duplicated in 3 locations | SYNC comments at each location |

### Should Add (2)

| # | Finding | Location |
|---|---------|----------|
| 15 | Test 4 needs simulation guidance for sun elevation | Verification Plan Test 4 |
| 16 | Missing test for movie mode end recovery | Verification Plan Test 10 |

### No Action Needed (8)

| # | Finding | Reason |
|---|---------|--------|
| 3 | Column RGB entry sets "Manual" every evening | Pre-existing, reverse watcher helps cleanup |
| 4 | Nightly maintenance + reverse watcher race | All scenarios produce correct results |
| 5 | Sunrise sequence + reverse watcher | Protected by manual_control count > 0 |
| 6 | Isolated override exit | Correctly handled by reverse watcher |
| 7 | Override "Extend 1 Hour" notification | Debounce timer correctly resets |
| 8 | Forward/reverse oscillation | Structurally impossible |
| 10 | Soft reset from "Sleep" state | Correctly exits sleep mode |
| 11 | Column offset reset during Gaussian window | Engine skips manual zones |

### Out of Scope (1)

| # | Finding | Reason |
|---|---------|--------|
| 19 | Sunset logic green snap at 5° | Pre-existing, separate follow-up |
