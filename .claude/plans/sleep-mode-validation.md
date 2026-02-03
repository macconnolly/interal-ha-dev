# Sleep Mode Unification — Post-Deployment Validation

## What Changed (Summary)

Eliminated `input_boolean.oal_force_sleep` and the `oal_force_sleep_sync_v13` automation. Sleep mode now flows through one path:

- **Intent**: `input_select.oal_active_configuration` = "Sleep"
- **Mechanism**: AL native sleep mode switches (`group.oal_sleep_mode_switches`)
- **Entry points**: ZEN32 B5 3x, config dropdown, scheduled sleep — all set the config dropdown, Config Manager toggles AL sleep switches

Also added a gate to prevent column lights from auto-turning-on at sunset when they're off.

### Files Modified
- `packages/oal_lighting_control_package.yaml`
- `packages/zen32_modal_controller_package.yaml`
- `Dashboard/chips_card.yaml`
- `CLAUDE.md`, `docs/OAL_ENTITY_REFERENCE.md`, `docs/zen32_led_state_machine_reference.md`, `docs/claude-enforcement-guide.md`

### Key Technical Details
- Core Engine sleep block (line ~762): checks `oal_active_configuration == 'Sleep'`, turns on AL sleep switches, calls `adaptive_lighting.apply`, stops
- Config Manager (line ~1449): toggles `group.oal_sleep_mode_switches` on/off based on Sleep config
- Config Manager baseline path (line ~1482): turns off sleep switches when exiting Sleep, re-triggers column lights sleep evaluation
- Startup automation (line ~2570): clears all AL sleep switches on boot (they persist across restarts)
- ZEN32 `zen32_toggle_sleep_mode` script: sets config to Sleep or Adaptive (was `zen32_toggle_force_sleep` toggling a boolean)

---

## Validation Prompt

Paste this after deploying and reloading:

---

I just deployed the sleep mode unification changes. The packages have been reloaded. I need you to help me validate 13 items. For each one, tell me what to check in HA or what MCP queries to run, and I'll confirm the result. Work through them in this order:

**Phase 1: Entity cleanup**
1. Verify `input_boolean.oal_force_sleep` no longer exists in HA (search entities)

**Phase 2: Sleep activation via ZEN32**
2. I'll press ZEN32 B5 triple-press. Check that `input_select.oal_active_configuration` shows "Sleep" and all 6 `switch.adaptive_lighting_sleep_mode_*` switches are ON
3. Check main_living lights are at ~25% brightness (AL sleep_brightness for that zone)
4. Check bedroom lights are showing warm orange RGB [255,165,0] — not purple/pink
5. Check column lights are showing deep orange RGB [245,120,0] — not purple/pink
6. Check ZEN32 big button LED is dim blue
7. Check `sensor.oal_realtime_monitor` shows "Sleep Mode"

**Phase 3: Sleep deactivation**
8. I'll press ZEN32 B5 triple-press again. Check config shows "Adaptive" and all 6 sleep switches are OFF

**Phase 4: Config dropdown path**
9. I'll set config dropdown to "Sleep" from the UI. Verify same behavior as ZEN32 path

**Phase 5: Column lights sunset fix**
10. If column lights are currently OFF, verify the RGB prepare automation does NOT turn them on (check automation trace or just confirm they stay off)
11. If column lights are ON and it's after sunset, verify RGB transition still works

**Phase 6: Edge cases**
12. Verify scheduled sleep automation (`oal_manage_sleep_mode_v13`) is still present and its action sets the config dropdown (not the deleted boolean)
13. After exiting sleep, verify column lights' independent sun-elevation sleep automation (`oal_column_lights_sleep_trigger_v13`) re-evaluates correctly

For items that depend on time of day or physical observation, tell me what to check and I'll report back.
