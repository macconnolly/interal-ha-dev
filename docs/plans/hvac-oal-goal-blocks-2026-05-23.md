# T1.6 Goal Blocks — Sequential `/goal` prompts for HVAC + OAL execution

Paste-ready `/goal` prompts for each logical block. Five blocks total; ship sequentially with stamp gates between. Block 1 ↔ Tranches 1+2, Block 2 ↔ Tranches 3+4, Block 3 ↔ Tranche 5, Block 4 ↔ Tranche 6, Block 5 ↔ Tranche 7.

Each block references the master plan `docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md` for execution detail and §9-10 for the authoritative corrections.

---

## Goal Block 1 — HVAC stats + OAL Core (Tranches 1 + 2)

```
/goal Fix the broken HVAC stats sensors (current heating/cooling/idle, yesterday, weekly all stuck at 0) by wiring history_stats to new binary_sensor templates keyed off climate.dining_room's hvac_action attribute per master plan §1 + §9.7. Then harden the OAL configuration_manager per §7.1 + §9.1: remove the 1-second dead-weight delay that causes flicker on mode chip taps, add a guaranteed unlock that clears BOTH oal_config_transition_active and oal_config_power_handoff_active at the top of every run, add a 60-second self-recovery watchdog (target the LIVE entity_id from ha_search_entities — Mac confirmed it's automation.oal_v13_configuration_manager_power_handoff, NOT the YAML id field), and reorder light.turn_off before light.turn_on in the default mode branch so kitchen mains turn off cleanly before the rest dim. Verify Tranche 1 by ha_get_state on the 11 affected sensors before/after restart + waiting for the next HVAC cycle to see today's counters tick. Verify Tranche 2 by Mac tapping mode chips rapidly on /tunet-home-preview/home (no flicker, no stuck state) and ha_get_automation_traces showing clean execution. Awaiting-stamp at each tranche boundary; do NOT batch.
```

**End-state in plain English**: Stats page reports real heating + cooling time (today, yesterday, weekly) instead of zeros. Mode chips on home dashboard feel snappy with no flicker even on rapid taps; engine can never get permanently jammed thanks to the 60s watchdog.

**Expected wall-clock**: ~60-75 min focused work (T1 ~30 min, T2 ~30 min) + your verification gates + HVAC cycle wait.

**Pre-flight reminders** (sub-agent's checklist before T1 edits):
- Resolve live entity_id of configuration_manager via `ha_search_entities`
- Snapshot all 11 broken sensors for before/after comparison
- Confirm no naming conflicts on new binary_sensors

---

## Goal Block 2 — OAL Companion Guards + Sleep Transition (Tranches 3 + 4)

```
/goal Continue OAL hardening per master plan Tranches 3+4. Tranche 3 (§7.2 + §9.4): add transition_active guards to companion automations so they don't race the configuration_manager during mode changes — periodic/state-triggered ones (warm_pin, bed_color_window) get the hard skip condition (state: off), but threshold-triggered one-shots (oal_column_lights_prepare_rgb_mode_v13 and oal_column_lights_morning_exit_rgb_v13) get a wait_template DEFER (not skip) so they don't miss their sun-crossing window. Tranche 4 (§7.2): add new input_number.oal_sleep_transition_seconds helper (default 2.0, min 0.3, max 10.0) and replace the hardcoded transition: 5 at line 1183 with this helper so rapid Sleep→other-mode handoffs no longer fight a 5-second fade. Verify Tranche 3 by Mac watching bed pair and column lights during rapid mode switches — should see NO mid-transition color flash. Verify Tranche 4 by Mac toggling out of Sleep within 3 seconds and confirming the fade is ~2s not 5s. Awaiting-stamp at each tranche boundary; HA restart required for Tranche 4 because of the new input_helper.
```

**End-state**: Mid-transition color flashes on Govee column + Tuya bed pair are gone. Sleep mode feels comfortable (2s default fade) but doesn't fight quick exits.

**Expected wall-clock**: ~30-40 min focused work + your verification.

---

## Goal Block 3 — Mode Display Sync (Tranche 5)

```
/goal Sync the mode display labels across the dashboard so they actually match the live input_select.oal_active_configuration option list per master plan §7.3 + §9.8. Edit Dashboard/Tunet/Cards/v3/tunet_status_card.js lines 85-89: replace the broken 3-entry MODE_SELECTOR_SUMMARY_ALIASES (which has a dead "Sleep Mode" entry that never matches and no entries for Evening, Dim Ambient, Warm Ambient, Full Bright, TV Bridge, Manual) with a complete 9-entry map (this is pre-Tranche-7 state — Warm Ambient still present and will be removed in Block 5). Add a "Full Bright" chip to the home Quick Actions strip in Dashboard/Tunet/tunet-home-preview-config.yaml following the existing chip pattern. Clean up the legacy "Dim Ambient Plus" comment header in packages/tunet_scenes.yaml lines 9-12. Build + deploy cards via npm run tunet:deploy:lab (rebuilds + bumps cache-bust) and deploy ONLY the home-preview dashboard via npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview (NEVER unscoped per §9.2). Capture the status card mode tile + actions strip at 390x844 + 1440x900, read inline per M1, and stamp wait.
```

**End-state**: Compact mode tile shows readable short labels (Dim/Warm/Full/TV+) instead of dead "Sleep Mode" miss; Full Bright is reachable as a home-screen chip.

**Expected wall-clock**: ~15-20 min + your capture review.

---

## Goal Block 4 — HomeKit Cleanup (Tranche 6)

```
/goal Clean up Apple HomeKit exposure per master plan §7.3 + §9.5 + §9.6. Edit packages/tunet_homekit.yaml: REMOVE scene.tunet_oal_full_bright and binary_sensor.oal_tv_mode_active from include_entities/entity_config (Mac never uses via HomeKit); ADD to exclude_entities — (a) sensor.oal_average_active_color_temperature (line 8622 of OAL package; device_class: temperature makes HomeKit treat it as a bogus temp accessory), (b) the duplicate kitchen groups light.kitchen_undercabinet_lights / light.kitchen_island_lights / light.room_kitchen_all / light.all_kitchen_lights (the right entity is light.kitchen_counter_cabinet_underlights which include_domains: light already catches), (c) scene.tunet_oal_full_bright via exclude_entities NOT just entity_config because include_domains: scene exposes all scenes by domain. Create new scene entities scene.tunet_all_on + scene.tunet_all_off (snapshot-style on light.all_adaptive_lights) and add them to include_entities + entity_config with HomeKit display names "All On" / "All Off" — these are CURRENT incremental edits to the existing selective include/exclude lists; preserve all other entries (this is the active HomeKit curation, not a rewrite). Deploy via deploy_packages.sh (NEVER the unscoped dashboard command) and ha_restart (HomeKit integration reload requires restart). After restart, Mac re-checks the bridge in Apple Home: bogus color-temp accessory gone, no kitchen duplicate, All On/Off scenes available. Awaiting-stamp.
```

**End-state**: Apple Home is cleaner — no bogus temperature accessory for OAL color-temp, no duplicate kitchen entities, no clutter from never-used scenes, and `Hey Siri, all on / all off` works.

**Expected wall-clock**: ~30-40 min + restart + your Apple Home re-check.

---

## Goal Block 5 — OAL Mode Consolidation (Tranche 7 — most disruptive, final)

```
/goal Final consolidation: drop Warm Ambient from the OAL mode cycle and refine Evening + Dim Ambient values per master plan §7.4 + §9.5. Edit packages/oal_lighting_control_package.yaml: remove "Warm Ambient" from input_select.oal_active_configuration.options; remove the Warm Ambient mode profile from oal_configuration_manager_v13's config_profiles map (around lines 2049-2179); update Evening to use the revised lighter values (b: -25, lights_dimmed bumped +5-10pp across all zones — main_living 50, kitchen_island 30, counter 15, bedroom 35, column 35, accent 25, ceiling 3, office 35; lights_off unchanged: kitchen_main + entryway_lamp); update Dim Ambient to use the revised heavier-but-not-extreme values (b: -35, lights_off: light.living_room_hallway_lights NEW, lights_dimmed: kitchen_main 15 NEW heavily-dimmed, main_living 35, kitchen_island 20, counter 10, bedroom 25, column 25, accent 20, ceiling 2, office 30). Edit packages/tunet_scenes.yaml to remove scene.tunet_oal_warm_ambient. Edit BOTH Dashboard/Tunet/tunet-home-preview-config.yaml AND Dashboard/Tunet/tunet-home-cosmos-config.yaml (per §9.5 — cosmos is also production: true with a Warm chip at lines 139-147) to remove the Warm chip from each. Edit Dashboard/Tunet/Cards/v3/tunet_status_card.js MODE_SELECTOR_SUMMARY_ALIASES to remove the Warm Ambient entry (8 entries remain). Deploy packages via deploy_packages.sh, deploy each dashboard via npm run tunet:deploy:dashboards:storage with explicit --dashboard scoping per §9.2 (two separate commands, one for preview, one for cosmos — coordinate with Mac on cosmos timing since the other session owns it), ha_restart after package deploy (input_select option list change requires restart). Mac live-tests new Evening + Dim Ambient brightness levels and tells you if values need tuning (easy iteration: edit yaml, automation.reload). Awaiting-stamp.
```

**End-state**: Three modes (Evening, Dim Ambient, Warm Ambient) consolidated to two (Evening + Dim Ambient). Evening is lighter than today; Dim Ambient is heavier with the hallway lights turning off and kitchen mains heavily dimmed. Mac iterates brightness values from there.

**Expected wall-clock**: ~45-60 min + restart + your live brightness review + tuning iterations.

---

## Session-level cadence reminder

After each block:
- Sub-agent commits all changes per tranche
- Sub-agent reports "implemented, awaiting your review" per M3
- You stamp (or signal pivot) before next block starts
- If you go AFK after a block, sub-agent waits — does not pre-execute next block

If anything goes sideways mid-block, fallback is `git revert <commit>` + redeploy. The deploy script auto-backs-up timestamped tarballs in `Backups/` with git audit trail.

---

## Total estimated wall-clock to completion

| Block | ~Time | Restart? |
|---|---|---|
| 1 (HVAC + OAL Core) | 60-75 min | YES (T1) + no (T2) |
| 2 (Companion + Sleep) | 30-40 min | YES (T4) |
| 3 (Mode display) | 15-20 min | No |
| 4 (HomeKit) | 30-40 min | YES |
| 5 (Mode consolidation) | 45-60 min | YES |

**Cumulative**: ~3-4 hours focused work + your verification gates. Spread over 2-3 sittings recommended for fresh eyes on each verification.
