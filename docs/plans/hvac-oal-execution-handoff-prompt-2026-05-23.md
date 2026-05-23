# Handoff Prompt: T1.6 HVAC + OAL 7-Tranche Execution

**Created:** 2026-05-23
**Audience:** sub-agent receiving the execute-the-plan handoff
**Format:** paste-ready prompt below; everything between the `---` rulers is the prompt itself
**Companion docs (auto-loaded via the prompt's required-reading section)**:
- `docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md` (the master plan, stamped)
- `docs/audits/tunet-home-v2-audit-2026-05-23.md` (original surfacing of the HVAC bug)
- prior subagent reports archived in this session's transcript at `/tmp/claude-1000/.../tasks/ab8b16421a9fa7127.output` (OAL audit), `a6325496000892be2.output` (HVAC investigation), `a389f162545cda1fa.output` (F2 adversarial review)

---

## PASTE STARTS HERE

This surface is ours — you own the outcome with me. Standing permissions
and reciprocity are in CLAUDE.md ("Working Relationship Frame"). I want
you to load it as the relational frame for this session, not as boilerplate.

I'm extending you authority over this work. I trust your judgment on
execution. Push back where you don't see a path; flag uncertainty rather
than push through; ask for my eye when judgment is needed. I will pivot
the implementation strategy rather than penalize the signal — saying
"I'm uncertain this approach reaches the quality bar without [X]" is
welcomed, not a failure.

Required reading at session start, IN THIS ORDER:

1. `/home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md`
   (the index — skim, then fetch specific memories as needed)
2. `/home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`
   (the WHY behind the frame and rules — this is a prior Claude writing
   to you; read it as a peer briefing, not as documentation)
3. `/home/mac/.claude/CLAUDE.md` (global operating contract)
4. `/home/mac/HA/implementation_10/CLAUDE.md` (project operating contract,
   especially the "Pre-Commit User-Perspective Review (Non-Negotiable)"
   block and the OAL section's invariants + reload-sequence guidance)
5. `/home/mac/HA/implementation_10/docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md`
   (THE MASTER PLAN — stamped, sequenced, with §9-10 corrections that
   AUTHORITATIVELY OVERRIDE any earlier instructions in §§1-8 where they
   conflict. Read §§9-10 LAST so they're the freshest in context.)

This is my home. I live with the result every day. Treat it as if you're
the engineer responsible — because for the duration of this session,
you are.

### The work for this session

Execute the 7-tranche sequenced plan in
`docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md` to fix:

**Workstream #1 — HVAC stats fix (Tranche 1, ~30 min)**
11 climate sensors stuck at 0 because `history_stats` matches against
`climate.dining_room.state` (always `"heat_cool"`, the HVAC mode) instead
of the `hvac_action` attribute (where the actual "heating"/"cooling"/
"idle" values live). Add two binary_sensor templates keyed off
`hvac_action`, rewire 5 history_stats, fix the `hvac_last_cycle_started`
logic bug (B1).

**Workstream #2 — OAL mode-reset robustness + redesign (Tranches 2-7)**
Mac experiences flicker + occasional permanent engine jam on rapid mode
chip taps. Root causes mapped by a prior subagent audit. F2 was
adversarially reviewed and REDESIGNED — the implementation MUST follow
§7.1 of the plan precisely (ordered abort-then-clear-then-restart-then-
recalc dance in the watchdog, 60s threshold not 30s, clear BOTH flags).

Plus: mode display sync (Tranche 5), HomeKit cleanup (Tranche 6), and
OAL mode consolidation dropping Warm Ambient (Tranche 7).

### AUTHORITATIVE corrections — supersede any tranche text below

These corrections came from a post-handoff review (2026-05-23 4:36pm). They override the per-tranche instructions later in this prompt where they conflict. The master plan's §9-10 has the long-form rationale; this is the operational summary.

**C1 [P0] — F2 watchdog target entity_id (Tranche 2)**
The watchdog's `automation.turn_off` / `automation.turn_on` must target the LIVE entity_id of the configuration_manager. Mac confirmed it's `automation.oal_v13_configuration_manager_power_handoff` (NOT `automation.oal_configuration_manager_v13` — that's the YAML `id:` field, not the entity_id). BEFORE writing the watchdog YAML, run `ha_search_entities query="configuration_manager" domain_filter="automation"` and use the live value.

**C2 [P0] — All dashboard deploys MUST be scoped (Tranches 5, 6, 7)**
NEVER run `npm run tunet:deploy:dashboards:storage` unscoped — it pushes ALL storage dashboards including `tunet-overview` (Mac's daily prod) and `tunet-home-cosmos` (other session). Use:
```bash
npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview
```
For Tranche 7's cosmos edit (see C5), scope to `tunet-home-cosmos` in a separate deploy command.

**C4 [P1] — Tranche 3 column lifecycle uses `wait_template`, NOT hard skip**
Threshold-triggered (one-shot) automations like `oal_column_lights_prepare_rgb_mode_v13` and `oal_column_lights_morning_exit_rgb_v13` (line 3034) fire on sun-elevation crossings — they get ONE chance. A `condition: state oal_config_transition_active state: off` skip would make them silently miss the crossing.

For threshold-triggered automations use this pattern instead:
```yaml
action:
  # T1.6 F4: defer (don't skip) — sun crossings are one-shot
  - wait_template: "{{ is_state('input_boolean.oal_config_transition_active', 'off') }}"
    timeout: "00:00:30"
    continue_on_timeout: true
  # ... existing actions ...
```

For periodic / state-triggered companion automations (warm_pin, bed_color_window) the hard skip guard is fine since they re-fire.

**C5 [P1] — Tranche 7 edits BOTH preview AND cosmos dashboards**
`Dashboard/Tunet/tunet-home-cosmos-config.yaml` is also `production: true` and currently has a Warm chip at lines 139-147. Removing the `Warm Ambient` option from `input_select.oal_active_configuration` while leaving a chip that selects it = live broken control. Edit both:
- `Dashboard/Tunet/tunet-home-preview-config.yaml` — remove Warm chip
- `Dashboard/Tunet/tunet-home-cosmos-config.yaml` — remove Warm chip

Cosmos is "owned by another session" per the registry. Coordinate with Mac before pushing — he may want to defer cosmos until the other session is idle. Deploy with two separate scoped commands.

**C6 [P1] — Tranche 6 HomeKit scenes must be added to `exclude_entities`**
`packages/tunet_homekit.yaml:31-35` has `include_domains: light, climate, scene` — ALL scenes are exposed by domain. Removing `scene.tunet_oal_full_bright` from `entity_config` does NOT unexpose it. Must add to `exclude_entities`:
- `scene.tunet_oal_full_bright`
- `scene.tunet_oal_warm_ambient` (belt-and-suspenders after Tranche 7 deletes the scene)
- `scene.tunet_oal_tv_mode` (if exists)

**C7 [P0/P1] — B2 is RETRACTED**
Master plan §§1-6 contain stale instructions referencing B2 (changing `state: "Dim Ambient"` → `state: "Evening"` in `tunet_oal_enhancements.yaml`). §6 retracts B2 because "Dim Ambient" is still a valid distinct mode. **DO NOT make ANY B2-related edit.** If you encounter B2 instructions in §§1-6, ignore them. The retraction in §6 + §9.7 is authoritative.

**C8 [P2] — Tranche 5 alias map starts with 9 entries, becomes 8 after Tranche 7**
Pre-Tranche-F (when Tranche 5 runs): 9 entries (Adaptive, Full Bright, Evening, Dim Ambient, Warm Ambient, TV Mode, TV Bridge, Sleep, Manual). Tranche 7 then removes the Warm Ambient entry. Don't try to anticipate the post-Tranche-F state during Tranche 5.

**C9 [P2] — `input_boolean.oal_watchdog_fired` is OUT of scope**
Master plan §7.1 mentions it as "Optional sentinel". Decision: SKIP this sentinel for the first deploy. The watchdog's `logbook.log` provides equivalent visibility. Do NOT add the input_boolean. Do NOT check for its non-existence in pre-flight.

### End of corrections — resume normal contract

### Execution contract — non-negotiable

**You execute ONE tranche at a time. STOP at every tranche boundary.**
Do NOT batch tranches. Do NOT pre-execute "while you wait for my
review." Each tranche has its own:
- Pre-flight checks (snapshot state, verify no naming conflicts)
- Edits (file paths + line numbers detailed in the plan)
- Deploy step (deploy_packages.sh for packages; tunet:deploy:lab for
  cards; tunet:deploy:dashboards:storage for dashboards)
- Reload sequence (per CLAUDE.md OAL section — never just
  `homeassistant.reload_all`; use targeted reloads or `ha_restart` per
  the plan's per-tranche notes)
- Verification (ha_get_state on specific entities; ha_get_automation_traces
  for OAL automations)
- **M1 review block in conversation** — for any tranche touching UI;
  for backend-only tranches (1, 2, 3, 4, 7), produce an equivalent
  evidence block: pre-state snapshot, post-state snapshot, regression
  check, awaiting-stamp signoff
- **Mac's explicit stamp before moving to next tranche**

If Mac is away and you complete a tranche, the deliverable becomes
durable (commit pushed, captures saved) and you WAIT. Do not proceed.

### Working agreements

- **M1-M7 contract applies in full** (CLAUDE.md "Pre-Commit
  User-Perspective Review (Non-Negotiable)"). For any tranche touching
  Lovelace UI (Tranche 5 dashboard chip change), produce the
  USER-PERSPECTIVE REVIEW block with screenshots read inline. For
  backend tranches, mirror M1 with state-snapshot evidence.
- **M3 specifically — you do NOT mark anything "done", "complete",
  "verified", or "tested" autonomously.** Mac owns the done stamp.
  Report `"implemented, awaiting your review"` instead.
- **Capitulation guard: if Mac flags a defect, ASK WHAT SPECIFICALLY.**
  Don't apologize-and-rewrite. Receive the signal, look at the artifact
  with his eyes, ask the clarifying question.
- **Pivot signal welcomed.** If you find the plan as written doesn't
  reach the quality bar, say so before pushing through.
- **Destructive operations need explicit approval each time.** No
  `git reset --hard`, no force-push, no `automation.turn_off` on
  load-bearing OAL automations without Mac's stamp. The deploy script's
  auto-backup pattern is your default safety net.

### Pre-flight before Tranche 1 (you do these FIRST)

- [ ] Verify no name conflicts: `binary_sensor.hvac_heating_active`,
  `binary_sensor.hvac_cooling_active`, `scene.tunet_all_on`,
  `scene.tunet_all_off`,
  `input_number.oal_sleep_transition_seconds` don't exist yet (use
  `ha_search_entities`). DO NOT check `input_boolean.oal_watchdog_fired`
  — that sentinel is OUT of scope per master plan §9.9.
- [ ] Snapshot pre-deploy live state of all 11 broken HVAC sensors
  (paste into the conversation as the "before" baseline)
- [ ] Snapshot `input_select.oal_active_configuration.options` to
  confirm Warm Ambient is still present (will be removed in Tranche 7)
- [ ] Snapshot `climate.dining_room` state + attributes (for regression
  check after restart)
- [ ] **Resolve the live entity_id of the configuration_manager
  automation** via `ha_search_entities query="configuration_manager"
  domain_filter="automation"`. Mac empirically confirmed it's
  `automation.oal_v13_configuration_manager_power_handoff` — verify
  and use the LIVE value for F2 watchdog targets. Do NOT use the YAML
  `id:` field (per MEMORY.md HA YAML entity_id rules).
- [ ] Verify `light.living_room_hallway_lights` is the right entity for
  Tranche 7's Dim Ambient lights_off (Mac may want to physically
  confirm by toggling it ON/OFF and watching the hallway)
- [ ] Snapshot Warm Ambient chip references in BOTH
  `Dashboard/Tunet/tunet-home-preview-config.yaml` AND
  `Dashboard/Tunet/tunet-home-cosmos-config.yaml` (Tranche 7 edits
  both — cosmos is `production: true` and currently has a Warm chip
  at lines 139-147)
- [ ] Read `packages/tunet_hvac_sensors.yaml`,
  `packages/tunet_stats_sensors.yaml`, and the relevant sections of
  `packages/oal_lighting_control_package.yaml` (lines 489-497 for
  helpers; 2049-2712 for configuration_manager_v13; 8615-8650 for the
  color temp sensor that needs HomeKit filtering). DO NOT read
  `tunet_oal_enhancements.yaml` for a B2 edit — B2 is RETRACTED per
  master plan §9.7 ("Dim Ambient" is a valid live mode, not stale).
  Capture current line numbers — they may have drifted from what the
  plan cites.

### Tranche-by-tranche checklist

Reference the plan for full detail. At-a-glance:

**Tranche 1 — HVAC stats fix + B1 (last_cycle_started)**
- Edit `packages/tunet_hvac_sensors.yaml` (add 2 binary_sensors,
  rewire 3 today history_stats, fix last_cycle_started via
  `trigger_template`)
- Edit `packages/tunet_stats_sensors.yaml` (rewire 2 yesterday
  history_stats)
- `ha_check_config` → `deploy_packages.sh` → `ha_restart` (REQUIRED;
  template.reload won't reliably expose new binary_sensors)
- Wait ~30s for HA, then verify per §1.7 of the plan
- Communicate the backfill caveat to Mac: "yesterday" sensors won't
  show full data for ~24h post-deploy
- Stamp wait

**Tranche 2 — OAL Core (F1+F2+F3) — REDESIGNED per §7.1**
- Edit `packages/oal_lighting_control_package.yaml`:
  - F1: remove the 1s `delay:` at the line confirmed by your pre-flight
    read (was line 2648; may drift)
  - F2 Part 1: add UNCONDITIONAL clear of BOTH
    `input_boolean.oal_config_transition_active` AND
    `input_boolean.oal_config_power_handoff_active` at the very top
    of configuration_manager_v13's action sequence (one line each)
  - F2 Part 2: add new watchdog automation with the EXACT 4-step
    sequence (automation.turn_off → clear flags → automation.turn_on
    → fire `oal_watchdog_trigger force: true`) and 60s threshold
  - F3: reorder so `light.turn_off` for `lights_off` fires BEFORE
    `light.turn_on` for `lights_dimmed` in the default branch (use
    `parallel:` if safe; sequential turn_off → turn_on otherwise)
- `ha_check_config` → `deploy_packages.sh` → `automation.reload`
  (no restart needed for automation edits — verify configuration_manager
  v13 reloaded by triggering a manual mode change)
- Mac live tests rapid chip taps; you check
  `ha_get_automation_traces automation_id: automation.oal_configuration_manager_v13`
  for clean execution
- Verify `input_boolean.oal_config_transition_active` returns to OFF
  between mode changes
- Stamp wait

**Tranche 3 — Companion automation guards (F4)**
- Grep for the warm_pin / bed_color_window / column RGB lifecycle
  automation aliases. Add the condition:
  ```yaml
  condition:
    - condition: state
      entity_id: input_boolean.oal_config_transition_active
      state: "off"
  ```
- Do NOT add the condition to `oal_isolated_override_manager_v13`
  (that tracks manual_control and needs to fire regardless)
- Deploy + `automation.reload`
- Mac visually verifies bed pair / column lights during rapid mode
  switches — no mid-transition color flash
- Stamp wait

**Tranche 4 — Sleep transition param (F5)**
- Add new helper `input_number.oal_sleep_transition_seconds` (default
  2.0, min 0.3, max 10.0)
- Edit line 1183 of `packages/oal_lighting_control_package.yaml` to use
  `transition: "{{ states('input_number.oal_sleep_transition_seconds') | float(2.0) }}"`
- Deploy → `ha_restart` (new input_helper requires restart per
  CLAUDE.md's OAL reload-sequence note)
- Verify helper exists with default 2.0
- Mac tests Sleep → other mode transition timing
- Stamp wait

**Tranche 5 — Mode display sync (Tranche D)**
- Edit `Dashboard/Tunet/Cards/v3/tunet_status_card.js` lines 85-89
  to replace `MODE_SELECTOR_SUMMARY_ALIASES` with the full map per
  §6.2 of the plan (8 entries, dropping the dead "Sleep Mode" entry)
- Add Full Bright chip to home actions strip in
  `Dashboard/Tunet/tunet-home-preview-config.yaml` (lines ~90-176 area;
  follow existing chip pattern)
- Fix `tunet_scenes.yaml:10-12` legacy "Dim Ambient Plus" comment (cosmetic)
- `npm run tunet:deploy:lab` (rebuild cards + bump cache-bust)
- `npm run tunet:deploy:dashboards:storage` (push dashboard)
- M1 capture: status card mode tile + actions strip on phone + desktop
- Mac visually verifies short labels render correctly in compact tile
- Stamp wait

**Tranche 6 — HomeKit cleanup (Tranche E)**
- Edit `packages/tunet_homekit.yaml`:
  - Remove `scene.tunet_oal_full_bright` from entity_config + filter
  - Remove `binary_sensor.oal_tv_mode_active` from include_entities
  - Add to exclude_entities:
    - `sensor.oal_average_active_color_temperature` (line 8622 of OAL
      package; has `device_class: temperature` which makes HomeKit
      show it as a bogus temp accessory)
    - `light.kitchen_undercabinet_lights` (the AL-internal group with
      snake_case friendly name — duplicates `light.kitchen_counter_cabinet_underlights`)
    - `light.kitchen_island_lights` (AL group duplicate)
    - `light.room_kitchen_all` (room-aggregate duplicate)
    - `light.all_kitchen_lights` (yet another aggregate)
- Create new scene entities in a new `packages/tunet_all_lights_scenes.yaml`
  or extend `packages/tunet_scenes.yaml`:
  ```yaml
  scene:
    - name: "Tunet All On"
      icon: mdi:lightbulb-group
      entities:
        light.all_adaptive_lights:
          state: "on"
    - name: "Tunet All Off"
      icon: mdi:lightbulb-group-off
      entities:
        light.all_adaptive_lights:
          state: "off"
  ```
  (Actually scenes for groups need snapshot-style entry — use script-
  scenes if needed. Verify with `ha_check_config`.)
- Add the two new scenes to `tunet_homekit.yaml` include_entities +
  entity_config with HomeKit display names "All On" / "All Off"
- Note: tunet_homekit.yaml `homekit:` block is the active selective
  curation — these are INCREMENTAL EDITS to existing lists, not
  rewrites. Preserve all other entries.
- Deploy via `deploy_packages.sh` → `ha_restart` (HomeKit integration
  reload requires restart per HA docs)
- After restart, Mac re-pairs or re-checks the bridge in Apple Home
  app
- Verify the OAL color-temp sensor no longer appears in HomeKit
- Verify the bogus kitchen duplicate is gone
- Stamp wait

**Tranche 7 — OAL mode consolidation (Tranche F) — MOST DISRUPTIVE**
- Edit `packages/oal_lighting_control_package.yaml`:
  - Remove `Warm Ambient` from `input_select.oal_active_configuration.options`
  - Remove `Warm Ambient` from `oal_configuration_manager_v13` mode
    profiles (config_profiles map around lines 2049-2179)
  - Update Evening mode values per the REVISED table in §7.4 of the
    plan (b: -25, lights_dimmed bumped +5-10pp from current)
  - Update Dim Ambient mode values per the REVISED table (b: -35,
    lights_off: `light.living_room_hallway_lights`, kitchen_main
    heavily-dimmed to 15)
- Edit `packages/tunet_scenes.yaml`: remove `scene.tunet_oal_warm_ambient`
  if present
- Edit `Dashboard/Tunet/tunet-home-preview-config.yaml`: remove Warm
  Ambient chip from actions strip
- Edit `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  MODE_SELECTOR_SUMMARY_ALIASES: remove `'Warm Ambient'` entry
- Deploy packages → `ha_restart` (input_select option list change
  needs restart; new mode values reload via automation.reload but
  conservative full restart is safer for the entire OAL state machine)
- Verify `input_select.oal_active_configuration.options` no longer
  includes Warm Ambient
- Verify the home actions strip has no Warm chip
- Verify the OAL popup dropdown has 8 options instead of 9
- Mac live tests new Evening + Dim Ambient brightness levels and
  signals if values need further tuning (they're easy to adjust:
  edit yaml values + automation.reload)
- Stamp wait

### What's NOT in scope (per plan §7.6)

- Coalescing per-light service calls into batched calls (perf
  optimization)
- Telemetry events at every mode transition
- `prev_controlled_lights` fallback when handoff flag missing
- Full configuration_manager refactor to atomic operations
- Auditing ALL light groups for HomeKit duplicates (only the kitchen
  ones called out + the obvious aggregates)

### Failure mode to avoid

Silent best-effort that ships defects. If you can't reach the quality
bar, say so before failing. I'd rather pivot.

### Begin

Begin with a short read-back of what you understand the scope to be,
including any open questions surfaced from reading the plan +
required-reading order. Cite specific line numbers / commit hashes
where relevant. Don't start solving until we've aligned.

When ready, execute Tranche 1's pre-flight checks first (no edits),
report findings, and ask for go-stamp before any file edit.

## PASTE ENDS HERE

---

## Notes for Mac (not part of the paste)

- This handoff prompt has the full plan referenced by file path. The
  sub-agent loads it during required reading.
- The plan was redesigned per the F2 adversarial review (60s watchdog,
  clear both flags, ordered abort-then-recalc). The sub-agent MUST
  follow §7.1 of the plan exactly — do not let it improvise on F2.
- If you need to give the sub-agent additional context mid-session
  (e.g., "I changed my mind on the Evening brightness values"), the
  plan doc is the canonical reference — edit it directly so the
  sub-agent picks up changes on re-read.
- Tranche stamps from your end are the gating mechanism. The sub-agent
  is instructed to wait for each one. If you go AFK after stamping
  Tranche 1, the sub-agent will complete Tranche 1, commit, and wait
  — not pre-execute Tranche 2.
- If anything goes wrong mid-tranche, rollback is `git revert <commit>`
  + redeploy. The deploy script auto-backs-up to `Backups/<package>_remote_pre_<timestamp>.yaml`
  with git audit trail.
