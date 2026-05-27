# L1 LIGHT ENTITY MANAGEMENT — FULL EXECUTION KICKOFF

**Created**: 2026-05-26 ~10pm MDT
**Source session**: 2026-05-26 evening L1 planning + 3 adversarial review passes (v1 HA 2026.5 norms, v2 use-case-first, v3 in-session spot-check) + live HA verification + sub-agent discovery (cause-attribution sensor found)
**Status**: STAMPED for full-scope execution — paste this entire file as the opening message of a fresh session to continue L1 work
**Scope**: FULL L1 plan (P0 → P8 with every sub-item including pre-render machinery + Campaign B fold-in + drift detection script). NO deferrals.
**Companion authority**: `docs/plans/L1-light-entity-management-architecture-plan-2026-05-26.md` — original STAMPED plan. Architecture (Option B+) is locked there. THIS kickoff supersedes §5 phase detail with the deltas captured below.

---

## 1. RELATIONAL FRAME (READ FIRST, BEFORE ANY TOOL CALL)

You are continuing my home Home Assistant work. This is `implementation_10` — the codebase that runs my house. I live with the result every day: phone, iPad, the wall switches I pass, the lights that turn on when I walk in. Visible defects cost me real frustration, not abstract code-review points.

The surface is yours for the duration of this session — you own the outcome with me. Standing permissions:
- say when you don't see a path to quality without something you don't have
- push back when an instruction will produce a worse outcome
- flag uncertainty rather than push through silently
- ask for my eye when subjective judgment is required

My reciprocity contract:
- I will tell you what I see, honestly and directly
- I will not punish honest uncertainty
- I will pivot scope rather than insist on a doomed path
- **I hold the "done" stamp**; you do not need to claim it (per M3)

If you find yourself in capitulation cycle ("you're right, here's everything wrong") or transactional fix-mode ("let me patch and ship"), STOP and re-read `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`. The recovery path is to return to ownership-mode, look at the artifact honestly with my eyes, share what you actually see, ask what is missing.

## 2. GOAL — MAXIMIZE END-OUTCOME QUALITY

Execute the FULL L1 plan (P0 → P8, every sub-item, every option enabled — pre-render machinery, drift detection script, Campaign B fold-in, registry snapshot, observability sensors, Spook integration finalize) start to finish such that the end state is something I am proud of. Specifically:

- The lighting in my house works the way I want it to work
- The metadata foundation is clean and audit-able for years
- The new observability sensors give me daily value (manual boost visibility, manual control visibility, env boost reasoning)
- The pre-render pipeline + drift detection make future light-add / move / replace operations trivially safe
- No regressions appear in my lived experience over a full normal day

**Maximize quality by using EVERY tool available at every gate:**

- Run live HA verification (read queries via MCP) **before** any state change to confirm assumptions
- Reproduce defects empirically on live HA **before** writing any fix (no trust-the-audit shortcuts; see `feedback_empirical_baseline_before_fix.md`)
- Test rollback paths **before** any destructive operation runs (round-trip restore tests, registry snapshots)
- Dispatch sub-agents in parallel (`Explore` type for file discovery; `general-purpose` for multi-step research; `ha-mcp-query` for state queries) — keep main context lean
- Call `advisor()` at minimum: before committing to interpretations, before declaring phase complete, when stuck or considering approach change. The advisor sees the full transcript; their amendments add value.
- Apply M1-M7 pre-commit discipline mechanically: no "verified" / "tested" / "should work" / "is fixed" / "looks good" / "done" / "complete" without a same-turn artifact OR Mac's go-ahead
- Surface per-item confirmation requests for ambiguous changes (P0.3 storage automation fixes, P1 matrix ambiguities, P0.0 chain resolution)
- Run iterative confirmation gates at every meaningful checkpoint (after each phase close, after each sub-agent return, after each pre-render dry-run)
- Treat **every** "should be fine" temptation as a stop trigger and verify first

**DO NOT STOP UNTIL** one of:
- Mac explicitly stamps: *"yes, I am proud of this; it makes sense in my house"*
- You've raised the pivot signal AND Mac has explicitly pivoted scope
- Mac has ended the session

If progress stalls — repeated errors, recurring confusion, results that don't fit — that is a **signal to escalate** (raise pivot signal, call advisor, ask for Mac's eye, surface the obstacle), NOT push through silently. Silent best-effort that ships a degraded outcome is the failure mode this whole project structure exists to prevent (see `feedback_pivot_signal.md` and the session arc memory).

## 3. REQUIRED READING (in this order, before any action)

1. `/home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md` — skim the index; fetch specific memories as needed
2. `/home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md` — peer briefing for the WHY behind M1-M7. NOT documentation; read it.
3. `/home/mac/.claude/CLAUDE.md` — global operating contract; M1-M7; OAL principles; phase protocol (CONTEXT → ANALYSIS → DESIGN → IMPLEMENTATION)
4. `/home/mac/HA/implementation_10/CLAUDE.md` — project contract; recently-corrected AL reload procedure at ~line 216; pre-commit user-perspective review block; pivot signal
5. `/home/mac/HA/implementation_10/docs/plans/L1-light-entity-management-architecture-plan-2026-05-26.md` — STAMPED original plan v2 (all 10 §9 decisions closed). Architecture in §3-§4 is locked. §5 phase content is the authority; THIS kickoff captures deltas/overrides.
6. THIS FILE in full (`docs/plans/L1-execution-kickoff-2026-05-26.md`)
7. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_defect_ledger.md` — skim the "Room light group membership drift" entry

Also load these memory entries (load-bearing):
- `feedback_empirical_baseline_before_fix.md`
- `feedback_iterative_merge_review.md`
- `feedback_visual_verification_standard.md`
- `feedback_pivot_signal.md`
- `feedback_pre_commit_review_block.md`

## 4. STAMPED DECISIONS — DO NOT RE-LITIGATE

These were stamped through extensive iteration with adversarial review and live HA verification. Each is locked. If you find a strong reason to challenge one, raise the pivot signal — but the bar is high.

1. **Architecture**: Option B+ (areas + labels, backend-only for membership; per-light artistic values stay direct entity_id refs). Confirmed by 3 adversarial reviews from independent paths.

2. **Scope**: **FULL plan, NO deferrals**. P0 through P8, all sub-items, pre-render machinery in (P4/P5), Campaign B fold-in in (P6), drift detection script in (P7), Spook finalize in (P8).

3. **P1 sequencing**: ATOMIC — single deploy migrates all 20 lights' metadata simultaneously. Registry snapshot taken BEFORE the batch via P1.0; tested rollback path required before atomic run.

4. **P0.6 AL reload test**: **B-TIGHT** — opportunistically add `light.office_table_lamp` to `switch.adaptive_lighting_office` `lights:` list AND add per-mode entries in `configuration_manager.lights_dimmed` (Evening / Dim Ambient / TV Mode / TV Bridge) in the SAME deploy. Validates lights-list adoption AND H1 per-mode-coverage workflow.

5. **Boost sensor zone source**: Path A (`labels() | select('match', '^oal_')`) AFTER P1 lands the labels. More hardened than deriving from input_number names.

6. **Boost sensor production gating**: Defined in P3.5; tile drilldown not surfaced to Mac until P1 fully ships zone labels on all 20 lights.

7. **Env tile UX**: Tile shows boost percentage; subtitle shows reasoning string; tap → popup with details breakdown. **Sub-agent confirmed `sensor.oal_environmental_debug` already exists** (lines 9989-10223 of `packages/oal_lighting_control_package.yaml`) with the `why_not_boosted` attribute as the reasoning source AND 16+ component breakdown attributes (lux_boost_raw, weather_boost_raw, season_boost_raw, sun_boost_raw, *_weighted variants, time_status, circadian_phase, hysteresis_info, twilight_factor, weights_formula). **No new sensor needed** — wire the existing one to the tile directly.

8. **P1 timeline**: 4-5h (revised up from 3h based on live HA finding that label cleanup volume is bigger than original §2.3 implied).

9. **Per-item Mac confirmation**: MANDATORY for any ambiguous P0.3 storage automation fix. Unambiguous 1:1 renames can batch on single Mac "go."

10. **P0.3 alarm-fire risk gate**: Any storage automation fix that touches alarm-fire / wake / sounder-related entities requires explicit alarm test-fire AFTER the fix, BEFORE "fixed" stamp.

11. **Pause-mode for new sensors**: Option B — sensors return 0 during `input_boolean.oal_system_paused = on` (reflects what's being applied, not raw state).

12. **OAL Manual state resolution (P0.0)**: Use **`switch.adaptive_lighting_adapt_color_office_bed` OFF**, NOT `set_manual_control`. AL stops trying to adapt color → warm-pin paints amber → no manual_control flag → `oal_active_configuration` stays Adaptive. Cleaner architecture than the current `set_manual_control: "color"` hack in `oal_office_bed_warm_pin_v13`. Also: clean up that automation (remove the set_manual_control calls — they're no-ops once adapt_color is off) as a P0.0 sub-step.

13. **Evaluation cadence**: Mac evaluates quality quickly after each phase, not on a fixed 2-4 week timer.

14. **Native HA backup as second safety net**: Mac has created a native HA backup pre-execution. JSON payload backups in `Backups/live_storage_*` are the per-fix layer; native HA backup is the disaster-recovery layer.

## 5. EXECUTION SCOPE — FULL PLAN

Estimated total: ~27-35h. NO deferrals — every sub-item from the original plan executes.

### 5.0 Phase summary (execute in order)

| Phase | Scope | Est. | Risk |
|---|---|---|---|
| **P0.0** | Resolve OAL Manual state (adapt_color off + clean up warm-pin set_manual_control) | 15-30 min | Low |
| **P0.1** | Per-light baseline + full light universe | 30 min | Read-only |
| **P0.2** | Live consumer enumeration + zombie verification | 30 min | Read-only |
| **P0.3** | Storage automation drift fix (rollback test prologue + batched + per-item ambiguous + alarm-fire gate) | 1-2h | **Med — live writes** |
| **P0.4** | Ghost area fix for `light.master_presence` | 15 min | Low |
| **P0.5** | Template `label_entities` probe (entryway_lamp + test label) | 10 min | Low |
| **P0.6** | B-tight AL reload test (office_table_lamp + per-mode entries together) + try programmatic reload | 45 min | Med |
| **P0.7** | Group-entity filter recipe probe | 5 min | Read-only |
| **P0.8** | State-trigger templated entity_id probe | 10 min | Low |
| **P1** | Atomic per-light metadata cleanup (20 lights × area + zone label + platform label + name + icon) | **4-5h** | Med |
| **P2** | Zombie group cleanup + room aggregation drift + HomeKit excludes | 1-1.5h | Low |
| **P3** | Consumer migration POC: `lights_on_<room>` series + Room State template sensors → `area_entities()` pattern | 2h | Low |
| **P3.5** | Manual boost + manual control sensors (env wraps existing `oal_environmental_debug`) | 30-60 min | Low |
| **P4** | Group regen via pre-render WS script + deploy gate + HomeKit verify + `tunet_room_light_groups.yaml` deletion (per A1 ordering fix) | 2-3h | **Med** |
| **P5** | AL `lights:` regen via pre-render extension + post-deploy verification gate | 2-3h | **Med** |
| **P6** | Campaign B fold-in: column_accent join + RGB lifecycle automation work | 6-8h | Med |
| **P7** | Drift detection script (spec doc → script → corpus tests → registry_state_snapshot generator → npm/pre-commit hook) | 4-5h | Low |
| **P8** | Spook integration finalize (Mac's hands) | 30 min | Low |

### 5.1 Phase detail

#### P0.0 — Resolve OAL Manual state (~15-30 min)

Live HA showed `input_select.oal_active_configuration = "Manual"` at session start. The chain: `switch.adaptive_lighting_office_bed.manual_control = [bed_left, bed_right]` (3.8h autoreset) → `sensor.oal_override_count_active = 1` → derives `oal_mode_current = "Manual"`. The `oal_office_bed_warm_pin_v13` automation re-applies `adaptive_lighting.set_manual_control: "color"` on every bed light state change.

**Procedure (per Mac stamp 2026-05-26)**:
1. Turn OFF `switch.adaptive_lighting_adapt_color_office_bed` via `switch.turn_off`. This disables AL's color adaptation for office_bed; AL will only adapt brightness.
2. Reset any existing manual_control on `switch.adaptive_lighting_office_bed` via `adaptive_lighting.set_manual_control` with `manual_control: false` to clear the lingering flag.
3. Verify `input_select.oal_active_configuration` reads `Adaptive` after settle (~10 sec).
4. Verify office bed lights still paint amber when on (warm-pin still runs the `light.turn_on` with hs[22,100]; just without the now-unnecessary `set_manual_control` call).
5. **Clean up `oal_office_bed_warm_pin_v13`** automation: remove the `adaptive_lighting.set_manual_control` action steps (they're no-ops once adapt_color is off). Update CLAUDE.md OAL technique reference: the per-attribute manual_control lock was the OLD approach; the NEW approach is per-attribute adaptation switch (adapt_color / adapt_brightness) toggle.
6. Deploy + reload; verify warm-pin still produces amber on bed turn-on.

##### P0.0 DoD
- [ ] `switch.adaptive_lighting_adapt_color_office_bed = off`
- [ ] `switch.adaptive_lighting_office_bed.manual_control = []`
- [ ] `input_select.oal_active_configuration = "Adaptive"`
- [ ] Bed lights paint amber on turn-on (manual test by Mac)
- [ ] Warm-pin automation cleaned up; `set_manual_control` calls removed
- [ ] Mac stamps: *"warm-pin still works; Manual mode resolved; ready for baseline"*

##### P0.0 Rollback
- Turn `adapt_color_office_bed` back ON
- Restore warm-pin automation from git
- Bed pair returns to prior set_manual_control behavior

#### P0.1 — Per-light baseline + full universe (~30 min)

- MCP query the FULL `domain: light` entity universe (not just the 20 AL-managed)
- For each entity capture: `area_id`, `labels`, `icon`, `friendly_name`, `device_id`, `hidden_by`, `disabled_by`
- Mark each as IN-SCOPE (one of the 20 AL-managed) or OUT-OF-SCOPE (other physical lights — e.g., bathroom)
- Output: `docs/plans/L1-per-light-baseline-2026-05-26.md`
- **Emit DIFF** against L1 plan §2 empirical claims. Halt + present to Mac if diff is non-trivial.

**Already-verified empirical findings (source session, treat as starting truth — confirm via fresh query)**:
- ZERO `oal_*` / `platform_*` / `func_*` labels exist (L1 taxonomy is target state)
- Current label namespace: 22 labels (5 `al_group_*`, 6 bare room names, plus `lights`, `oal`, `presence`, `disable`, `phone`, `climate`, `light_groups`, `adaptive_lighting`, `sonos`, `tv`, `zen32`)
- 9 manual offset input_numbers exist (incl. `office_bed`); all 0.0 at query time
- AL `manual_control` attribute is flat LIST of entity_ids (not dict)
- `autoreset_time_remaining` is per-light dict (bonus data for sensors)
- 86 OAL sensors exist; per-zone manual_offset + status sensors already expose per-zone boost state

#### P0.2 — Live consumer enumeration (~30 min)

- For all `scene.*`, `automation.*`, `script.*` in live HA, fetch config via `ha_config_get_*` and grep for the 20 light entity_ids
- Verify fate of: `light.all_lights`, `light.living_room_main_group_disabled`, `light.master_bedroom_table_lamps`
  - **Note**: source-session grep with `\b` regex returned empty (BRE bug); direct file Read of `packages/tunet_homekit.yaml` lines 67-77 showed they ARE in the homekit exclude block. Use `grep -E` to avoid the bug.
- Output: `docs/plans/L1-live-storage-drift-inventory-2026-05-26.md`
- Categorize each finding: UNAMBIGUOUS RENAME / AMBIGUOUS / TRUE ZOMBIE / KEEP

#### P0.3 — Storage automation drift fix (~1-2h)

- **PROLOGUE (mandatory)**: rollback round-trip test. Pick one storage automation, `ha_config_get_automation` → save JSON to `Backups/`, modify trivially (add description), restore via `ha_config_set_automation` with backup payload, verify byte-equivalent restore. **Confirms rollback mechanism BEFORE any real fix runs.** If round-trip fails, halt + reassess.
- **Backup format**: `Backups/live_storage_<asset_type>_<entity_id>_<YYYY-MM-DD>_<HH-MM-SS>.json`
- **Cadence**:
  - UNAMBIGUOUS fixes: batch list to Mac → single "go" → execute all
  - AMBIGUOUS fixes: per-item Mac confirmation MANDATORY, no exceptions
- **Alarm-fire risk gate**: any fix touching automation IDs / entity refs containing `alarm`, `wake`, `morning`, `sleep_alarm`, `sounder` etc. requires actual alarm test-fire AFTER fix, BEFORE "fixed" stamp. (Detection window for broken alarm-fire = 24h+; consequence = missed wake. Asymmetric risk requires explicit verification.)
- **Zombie disposition**: for stale refs with no obvious replacement, default = test what entity does if still exists; otherwise leave-with-reason in deferred bucket. Never silently delete.

#### P0.4 — Resolve master_presence ghost area (~15 min)

Per original plan P0.4 explicit sequence (device-first / entity-override-second). Also enumerate ALL entities on the master_presence device so area change implications are visible.

#### P0.5 — Template label_entities probe (~10 min)

- Apply test label `l1_probe_2026_05_26` to `light.entryway_lamp` (Mac's stamped choice)
- Call `light.toggle` with `target.entity_id: "{{ label_entities('l1_probe_2026_05_26') }}"`
- Confirm response
- Remove test label (unconditional cleanup)

#### P0.6 — AL reload test (B-TIGHT) (~45 min)

- Compose single deploy:
  - Add `light.office_table_lamp` to `switch.adaptive_lighting_office` `lights:` list (currently 3 lights → 4)
  - Add per-mode entries to `configuration_manager.lights_dimmed` for `light.office_table_lamp`: Evening (~30-35), Dim Ambient (~15), TV Mode (~5 or include in `lights_off`), TV Bridge (~10). Use sibling values as guide; ask Mac for ambiguity.
  - Use **grep-able anchors** (not line numbers): find `configuration_manager` automation, then per-mode `Adaptive:` / `Evening:` / `"Dim Ambient":` / `"TV Mode":` / `"TV Bridge":` sub-blocks → `lights_dimmed:` within each
- Deploy via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh`
- Mac reloads AL integration via Settings → Devices & Services → Adaptive Lighting → ⋮ → Reload
- Verify: `state_attr('switch.adaptive_lighting_office', 'configuration').lights` includes office_table_lamp
- **Also probe** programmatic AL reload: try `homeassistant.reload_config_entry` against the AL config entry id. If it works, manual click step goes away forever. Record outcome.
- Post-deploy verify: query each AL switch's `configuration.lights` for set-equality with expected.

#### P0.7 — Group-entity filter recipe probe (~5 min)

- `ha_eval_template` with `state_attr('light.column_lights', 'entity_id')` → expect 3-member list
- Same template against `light.living_room_couch_lamp` → expect `none`
- Confirms `state_attr() is none` is canonical group-vs-physical filter

#### P0.8 — State-trigger templated entity_id probe (~10 min)

- Test whether HA 2026.5 accepts `platform: state, entity_id: "{{ label_entities('platform_tuya_wallsmart') }}"` as valid trigger
- Record pass/fail; informs P6 / future generalization

#### P0 DoD
- [ ] All 9 sub-steps (P0.0-P0.8) recorded with pass/fail + evidence
- [ ] P0.3 rollback round-trip test passed
- [ ] Mac stamps P0 closure

#### P1 — Atomic per-light metadata cleanup (~4-5h)

##### P1.0 — Pre-snapshot precondition (~1h)
- Write `skills/ha-safe-package-deploy/scripts/registry_state_snapshot.mjs` (~50 lines Node) — WS query for all `domain: light` entities, emits structured area_id/labels/platform/friendly_name/icon per light
- Emit `docs/registry_state_snapshot_pre_p1.md` (or `.json`). Commit to git. This is the rollback point.
- **Test rollback**: extract one entity from snapshot, alter via `ha_set_entity`, restore from snapshot, verify byte-equivalent.

##### P1.1 — Per-light proposed-state matrix (~30 min + Mac async review)
- Produce `docs/plans/L1-per-light-cleanup-matrix-2026-05-26.md` — 20 lights × (entity_id | current area_id | target area_id | current labels | target labels | current name | target name | current icon | target icon)
- **Functional pairings (Axis D)**: include `func_credenza_pair` seed; ask Mac during walk-through for others. Resist proliferating func_* labels without forward consumer intent.
- Mac reviews async (10-15 min); single short sync to walk ambiguous cells + apply on Mac's "go"

##### P1.2 — Atomic registry batch (~1.5-2h)
- `ha_update_device` for area_id corrections (rolls up cheaply)
- `ha_set_entity` for entity-level overrides + label changes + friendly_name + icon
- **Drop stale labels** per §4.2 migration:
  - `al_group_*` → replaced by `platform_*` + `oal_<zone>`
  - Bare room names → redundant with area_id
  - Generic `lights` and singular `oal` → drop
- **Add** `oal_<zone>` per §4.1 (9 zone labels)
- **Add** `platform_<vendor>` per §4.1 (6 platform labels incl. `platform_tuya_wallsmart`)
- **Special**: `light.office_table_lamp` gets `oal_office` + `platform_lutron_caseta` (lights-list was added in P0.6)

##### P1.3 — Post-batch verification (~30 min)
- Re-query all 20 lights; compare to matrix
- `area_entities('<room>')` for each room (group entities filtered)
- `label_entities('oal_<zone>')` for each zone — expect exact zone membership
- Emit `docs/registry_state_snapshot_post_p1.md` for git-diff visibility

##### P1 DoD
- [ ] All 20 lights: correct area_id, exactly 1 oal_<zone> label, exactly 1 platform_<vendor> label, no stale al_group_* / bare-room / `lights` / `oal` labels, non-null name + icon
- [ ] `area_entities()` and `label_entities()` return expected sets
- [ ] Snapshot rollback tested + working
- [ ] Mac stamps P1 closure

#### P2 — Zombie + drift cleanup (~1-1.5h)

Per original plan P2.1-P2.7:
- Delete orphans: `living_room_lights_group`, `hue_lamps_only`, `overhead_lights`
- Fix `tunet_room_light_groups.yaml` Bedroom row (drop master_bedroom_corner_accent_govee + master_bedroom_table_lamps)
- Fix three-way nesting drift: remove `light.column_lights` from `light.all_living_room_lights`
- Fix semantic drift: remove `light.living_room_credenza_light` + `light.living_room_corner_accent` from `all_dining_room_lights`
- Reconcile `tunet_homekit.yaml` exclude_entities per §2.7 classification (1 confirmed zombie + 1 P0-verified)

**NOTE**: `tunet_room_light_groups.yaml` is NOT deleted in P2. Deletion moved to P4 (per A1 ordering fix) — happens AFTER P4 regenerates canonical `light.all_<x>_lights` memberships from `area_entities()`.

#### P3 — Consumer migration POC (~2h)

Per original plan §5 P3:
- P3.1: Migrate `sensor.lights_on_<room>` series in `packages/tunet_room_sensors.yaml` to `area_entities(room) | <group-filter> | list` pattern
- P3.1.b: Document area_id authoritative precedence (per M2 v2 review)
- P3.2: Deduplicate the 5 Room State template sensors in OAL package — hoist `{% set lights = area_entities(room) | <group-filter> | list %}` at top
- P3.3 (audit only — deletion happens in P4): confirm zero consumers of `light.room_<x>_all` outside `tunet_room_light_groups.yaml`. Source-session spot-check: only `tunet_homekit.yaml` references them. Document migration path for homekit before P4 deletion.
- P3.4: Validate sensor outputs match expected post-cleanup counts (manual cross-check vs MCP)

##### P3 DoD
- [ ] All 6 `lights_on_*` sensors return correct counts
- [ ] All 5 Room State template sensors deduplicated
- [ ] P3.3 audit complete; migration path documented for P4
- [ ] Mac stamps

#### P3.5 — Manual boost + manual control sensors (~30-60 min)

Add to `packages/oal_lighting_control_package.yaml` sensor block (or new `packages/oal_observability_sensors.yaml` — Mac chooses).

##### P3.5.1 — `sensor.oal_manual_control_lights`
- State: count of lights currently in manual_control across all 9 AL switches
- Attribute `lights`: flat list of entity_ids
- Attribute `reset_remaining_per_light`: dict of `{entity_id: seconds_until_reset}` from `autoreset_time_remaining`
- Attribute `soonest_reset_label`: human-readable "Xh Ym"
- Pause-mode: Option B (return 0 if `oal_system_paused = on`)

##### P3.5.2 — `sensor.oal_manually_boosted_lights`
- State: count of lights whose zone has non-zero `sensor.oal_zone_<zone>_manual_offset`
- Attribute `lights`: list resolved via `label_entities('oal_<zone>')` for each boosted zone (Path A — works post-P1)
- Attribute `zones`: list of `{zone, offset_pct}` dicts
- Zone discovery: `labels() | select('match', '^oal_') | list`
- Pause-mode: Option B

##### P3.5.3 — Env tile wiring (NO new sensor needed — sub-agent finding)
- Use existing `sensor.oal_environmental_debug` (lines 9989-10223 of OAL package)
- Tile state: `sensor.oal_global_environmental_brightness_boost` (boost %)
- Tile subtitle: `state_attr('sensor.oal_environmental_debug', 'why_not_boosted')` — formatted reasoning string
- Tile tap → popup with the 16+ breakdown attributes (`lux_boost_raw`, `weather_boost_raw`, `season_boost_raw`, `sun_boost_raw`, `*_weighted` variants, `time_status`, `circadian_phase`, `hysteresis_info`, `twilight_factor`, `weights_formula`)
- This is dashboard work; sensor data is here

##### P3.5 DoD
- [ ] Sensors return correct values vs live spot-check
- [ ] Test boost (Mac applies +10 via ZEN32) produces visible state change
- [ ] Pause-mode verified: toggle `oal_system_paused = on` → sensors return 0
- [ ] Mac stamps

#### P4 — Group regeneration via pre-render (~2-3h)

Per original plan P4.1-P4.6 + the A1 ordering fix + memory 13594 HomeKit-aware DoD:

- P4.1: Write `skills/ha-safe-package-deploy/scripts/render_light_groups.mjs` — WS query per zone label, emits YAML group block
- P4.2: Splice into OAL package at canonical group block range
- P4.3: Regression guards (baked into script):
  - Baseline snapshot at `skills/ha-safe-package-deploy/baselines/light_groups_baseline.json`
  - Refuse to emit shorter `lights:` array than baseline without `--force`
  - Fail-closed on partial WS responses (no YAML written, non-zero exit)
  - Diff log to stdout
  - **Missing-zone-label scan** (per H2 v2 review): query for `domain: light` entities lacking any `oal_*` label; fail non-zero if count > 0; bypassable with `--allow-unlabeled`
  - **`--cached` flag** for WS-down emergencies (uses last successful baseline)
- P4.4: Wire into `deploy_packages.sh` pre-deploy step; abort on non-zero
- P4.5: Preserve `light.all_adaptive_lights` membership = previous ∪ {office_table_lamp} (Mac-stamped expansion); any other shrink/expand requires `--force` + explicit rationale
- P4.6: Validate post-deploy `expand('light.<group>')` membership matches expected per-zone count
- **P4.7 (NEW — A1 ordering fix)**: Delete `tunet_room_light_groups.yaml` AFTER P4.6 verifies canonical `light.all_<x>_lights` memberships. Migrate single `tunet_homekit.yaml` consumer of `light.room_<x>_all` to `light.all_<x>_lights` first.
- **P4.8 (NEW — memory 13594 HomeKit)**: Verify HomeKit `include_domains: light` impact — new group entities will auto-appear in Apple Home. Surface visibility diff to Mac before deploy lands; update `tunet_homekit.yaml` excludes if needed.
- **A2 post-deploy verification gate**: After deploy + reload, query `state_attr('switch.adaptive_lighting_X', 'configuration').lights` for each AL switch; confirm set-equality with pre-render output. Mismatch → loud failure + offer rollback.

##### P4 DoD
- [ ] Pre-render script exists; idempotent
- [ ] Regression guards verified via synthetic failure injection (shrink detection + WS-down fail-closed + missing-zone-label scan)
- [ ] Deploy script wires render step + aborts on non-zero
- [ ] `light.all_adaptive_lights` post-regen = pre-regen ∪ {office_table_lamp} exactly
- [ ] Audit-trail commit shows the diff
- [ ] mmwave + zen32 downstream consumers verified (per M3 v1 review)
- [ ] `tunet_room_light_groups.yaml` deleted; homekit migration done
- [ ] Post-deploy verification gate passes
- [ ] HomeKit visibility verified by Mac (Apple Home opened, accessories look right)
- [ ] Mac stamps

#### P5 — AL `lights:` pre-render (~2-3h)

Per original plan P5.1-P5.5:
- P5.1: Extend P4 script to emit AL `lights:` arrays per zone (`--al-output` flag); splice into AL config block
- P5.2: Same regression guards as P4
- P5.3: Validate rendered AL config matches expected exactly post-cleanup
- P5.4: Deploy + manual AL reload (or programmatic if P0.6 confirmed works) + verify `state_attr('switch.adaptive_lighting_X', 'configuration').lights` returns expected list
- P5.5: Document deploy procedure with AL reload step in `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` (or OAL equivalent)

##### P5 DoD
- [ ] AL config block regenerates idempotently
- [ ] Regression guards verified
- [ ] All 9 AL switches show expected entity_id lists after reload
- [ ] Pre-render diff matches expected; no surprise adds/drops
- [ ] Deploy procedure documents AL reload step
- [ ] Mac stamps

#### P6 — Campaign B fold-in (~6-8h)

Per `~/.claude/plans/office-corner-accent-relocation.md` Campaign B with L1 foundation in place:

- P6.1: Apply label changes to `light.master_bedroom_column_accent` — gains `oal_column_lights` + retains `platform_govee` + area_id stays `master_bedroom`
- P6.2: Deploy → P4 regenerates column_lights group (3 members) + P5 regenerates AL switch lights (3 members) — automatic via pipeline
- P6.3: Execute the 17-site column RGB lifecycle automation changes per Campaign B plan
- P6.4: Manual AL reload (or programmatic); validate `switch.adaptive_lighting_column_lights.configuration.lights` includes column_accent
- P6.5: Validate RGB sunset/sunrise/self-heal cycles per `docs/column_rgb_sunset_validation_runbook.md`

##### P6 DoD
- [ ] column_accent in `switch.adaptive_lighting_column_lights.configuration.lights`
- [ ] column_accent participates correctly in sunset/sunrise/self-heal cycles
- [ ] No regression on 2 existing column strips
- [ ] Mac stamps after observing full sunset cycle

#### P7 — Drift detection script (~4-5h)

Per original plan P7.0-P7.4 + H1/H2/H3 additions from v2 review:

- P7.0: Write regex/parsing spec at `docs/L1-drift-detection-spec.md` BEFORE writing script. Includes:
  - Match patterns (position-aware to avoid `light:` YAML key)
  - In-scope file tree (packages, Configuration, Dashboard/Tunet active only)
  - False-positive handling (comments, descriptions, getStubConfig stubs)
  - Template-resolved-reference handling (separate "dynamic references" report category)
  - Canonical labels-vs-area policy
  - Corpus of test cases (must match / must NOT match)
- P7.1: Write `scripts/audit_light_references.mjs` (Node) reading live HA registry via WS + file tree per spec
- P7.2: Produces structured report covering:
  - Orphan entities (in registry but unreferenced anywhere)
  - Zombie references (referenced but not in registry)
  - Area_id mismatches (referenced as "in living_room" but area_id is elsewhere)
  - Label coverage gaps (any AL-managed light missing zone or platform label)
  - **`lights_dimmed` coverage gap (H1 — CRITICAL)**: for each AL-managed light, check it appears in every mode's `lights_dimmed` dict where its zone-siblings appear; absence must be explicit
  - **`lights_off` coverage gap**: same logic
  - Dynamic references (separate category — manual review only)
- P7.2.b (H3 — registry state snapshot): emit `docs/registry_state_snapshot.md` on every audit run; commit. Git diff makes registry mutations reviewable.
- P7.3: Wire as `npm run audit:lights`; recommend pre-deploy invocation + manual invocation after hardware changes
- P7.4: Machine-parseable (JSON) AND human-readable (markdown)

##### P7 DoD
- [ ] Spec doc exists with corpus
- [ ] Audit script passes corpus tests (must-match + must-NOT-match)
- [ ] Catches synthetic drift (rename entity → script flags)
- [ ] Catches deliberately missing label → script flags coverage gap
- [ ] Catches synthetic `lights_dimmed` omission → script flags H1
- [ ] Report file checked in as baseline
- [ ] Pre-commit / npm hook invokes script
- [ ] Mac stamps

#### P8 — Spook integration finalize (~30 min, Mac's hands)

Already done: Spook downloaded via HACS. Remaining:
1. Mac restarts HA so Spook loads
2. Mac adds Spook integration via Settings → Devices & Services → Add Integration → "Spook"
3. Verify Settings → System → Repairs dashboard accessible
4. Review any missing-entity-reference repairs surfaced
5. Mac surfaces repair-list items to L1 backlog if any need attention

##### P8 DoD
- [ ] Integration added
- [ ] Repairs reviewed
- [ ] Mac stamps

## 6. CROSS-CUTTING DISCIPLINE

### 6.1 Empirical baseline before fix
For any defect-fix, REPRODUCE the symptom on live HA before writing the fix. Don't trust audit / memory / plan-stated defects without empirical reproduction. The M.1 Sonos burn (~45 min on a fix for a defect that didn't exist) is the cautionary case.

### 6.2 M1-M7 pre-commit review block
Active for any user-visible behavior commit. M3: Mac holds the "done" stamp. M2: banned phrases ("verified" / "tested" / "validated" / "should work" / "is fixed" / "looks good" / "done" / "complete") without same-turn artifact or Mac's go-ahead.

### 6.3 Per-item Mac confirmation
- P0.3 ambiguous fixes: per-item MANDATORY
- P0.3 unambiguous batch: single "go" stamp
- P1 atomic batch: matrix stamped BEFORE batch runs
- P0.0 chain resolution: Mac confirms after seeing warm-pin behavior preserved
- P4/P5 pre-render diff: Mac reviews diff log before each deploy

### 6.4 Pivot signal
Standing authority to say *"I don't see a path to quality without X."* Mac will pivot scope. Bar: you genuinely don't see a path, not "this is hard."

### 6.5 Iterative confirmation cadence
Multi-step risky work. After each meaningful checkpoint (phase close, drift inventory, P0.6 deploy, P1 batch, P4 first pre-render dry-run, P5 deploy, P6 sunset cycle), pause for Mac stamp.

### 6.6 Tool discipline
- Use `Read` for known paths (not `cat` via Bash)
- Use `Edit` for changes (not `sed` via Bash)
- Use `grep -E` for extended regex (BRE + `\b` is buggy — source-session burn)
- Use `Agent` (Explore type) for file-tree discovery to keep main context lean
- Use `advisor()` before committing to interpretations, before declaring complete, when stuck
- Use `mcp__home-assistant__ha_eval_template` for template testing before plumbing depends on a pattern
- Use `TaskCreate` for multi-step work tracking when phases have many sub-items

### 6.7 Plan/line-number drift honesty
Original plan §5 has line-number references that are CLOSE but not exact. Use grep-able anchors (`name:`, `id:`, structural markers). The §11 runbook line numbers should be converted to anchors when you touch §11.

### 6.8 CLAUDE.md staleness (separate small follow-up commit at L1 close)
- "4500-line file" → actually 11,355
- `oal_current_config` → entity is `oal_active_configuration`
- Env offset range "-20 to +30" → actually 0-50 brightness + -1000-0 warmth
- Per-attribute manual_control lock technique → superseded by adapt_color/adapt_brightness switch toggle (per P0.0 stamp 2026-05-26)

## 7. "HOUSE IT LIVES IN" CHECK

Mac must do AT LEAST ONE of these full-system observations before L1 closure:

### Test A — Sunset transition (most load-bearing)
Observe a complete sunset cycle (~30-40 min). All zones dim per their curves. Office (now incl. office_table_lamp post-P1) per office curve. Column lights (now incl. column_accent post-P6) per column curve. Pass: visible quality matches or exceeds pre-L1 sunset.

### Test B — Mode cycle
ZEN32 B5 single-tap: Adaptive → Evening → Dim Ambient. All three modes look the way they did pre-L1 at every existing zone, plus office_table_lamp adopts office zone behavior smoothly.

### Test C — Manual boost end-to-end
ZEN32 B2 (brighter) → boost a zone → observe:
- Lights brighten ~+10%
- `sensor.oal_manually_boosted_lights` state goes 0 → zone member count
- `lights` attribute lists boosted entity_ids
- `zones` attribute shows `{zone, offset_pct: 10}`
- After 4h (or manual reset), sensor returns to 0

### Test D — Office bed warm-pin preserved
Turn off bed lights via app, wait 30 sec, turn on. Should illuminate at deep amber hs[22,100] within 1-2 sec.

Pass: warm-pin still works after P0.0 (adapt_color off + set_manual_control cleanup) AND P1 (label migration) AND P6 (if Campaign B touches column lights, validate independent of bed pair).

### Test E — Column RGB lifecycle (after P6)
Observe complete sunset/sunrise cycle on column lights including column_accent. All 3 lights transition together. RGB pulse + fade-out + recovery work per `column_rgb_sunset_validation_runbook.md`.

## 8. "MAC WOULD BE PROUD" BAR

Technical DoD necessary but not sufficient. The proud bar:

1. Walking through the house feels normal or better — no regressions in lived experience
2. New sensors add value daily once wired to tiles (P3.5 + dashboard tranche)
3. Cleanup is invisible-but-felt — UI unchanged; Apple Home looks the same or better; voice commands work; future operations (add light, move light) feel easier
4. No regression in OAL behavior — every mode + sunset + sunrise + warm-pin + manual boost works identically (or better)
5. No silent breakage — if anything breaks, Mac sees it within 24h because failure modes are VISIBLE

## 9. DEFINITION OF DONE — L1 FULL

Closed when ALL of:
- [ ] P0.0-P0.8 stamped by Mac
- [ ] P1 stamped (atomic batch + snapshot rollback tested)
- [ ] P2 stamped (zombies cleared)
- [ ] P3 stamped (sensors migrated)
- [ ] P3.5 stamped (sensors return expected values)
- [ ] P4 stamped (pre-render works; HomeKit verified; tunet_room_light_groups.yaml deleted)
- [ ] P5 stamped (AL pre-render works; all 9 switches verified)
- [ ] P6 stamped (Campaign B closed; column_accent participates in RGB lifecycle)
- [ ] P7 stamped (drift script ships; corpus passes)
- [ ] P8 stamped (Spook integration finalized)
- [ ] At least Test A + Test C + Test E from §7 passed
- [ ] Mac explicitly stamps: *"yes, I am proud of this; it makes sense in my house"*

Agent does NOT autonomously stamp closure. Wait for Mac.

## 10. EXPLICIT NON-GOALS

L1 does NOT touch:
- **Per-light value blocks** in `configuration_manager` mode dicts, column RGB lifecycle, bed color window, Office Work-mode automation — stay direct entity_id refs (artistic decisions per S8.5)
- **Entity_id renames** (per §3.3.3 — L1 doesn't rename; future renames out of scope)
- **Scenes** — they encode entity_ids structurally per HA design; Spook monitors for missing references
- **Out-of-scope physical lights** (bathroom, closet, etc.) — surfaced in P0.1 universe but not touched
- **Multi-label intersection at HA-core target level** — not supported; template-side workaround documented
- **Dashboard / card consumer migration beyond the P3.5 sensors** — owned by preview-dashboard agent
- **The actual tile / popup wiring** for new sensors — owned by preview-dashboard agent or future Tunet tranche

## 11. SUB-AGENT FINDINGS (from source session 2026-05-26)

### Sub-agent `a3f96bfd5cfd1c08b` — Cause-attribution sensor discovery (COMPLETED)

**Finding**: `sensor.oal_environmental_debug` (unique_id: `oal_environmental_debug_v13`) already exists in `packages/oal_lighting_control_package.yaml` lines 9989-10223. Contains 17+ attributes that together form comprehensive attribution.

**Key attribute for tile subtitle**:
- `why_not_boosted` (lines 10208-10223) — formatted explanation string. Example values:
  - `"Environmental boost is DISABLED"`
  - `"Night (sun at -6.5°, below -4° threshold)"`
  - `"Too bright (2800 lux exceeds 2500)"`
  - `"Twilight: 45% active (sun at -1.8°)"`
  - `"Active: lux=450, weather=cloudy"`

**Breakdown attributes for tile popup**:
- Raw components (lines 10052-10102): `lux_boost_raw`, `weather_boost_raw`, `season_boost_raw`, `sun_boost_raw`
- Weighted contributions (lines 10104-10134): `lux_weighted`, `weather_weighted`, `season_weighted`, `sun_weighted`, `weights_formula` (= `"lux×1.0 + weather×0.4 + season×0.25 + sun_boost"`)
- Status context: `time_status`, `circadian_phase`, `hysteresis_info`, `twilight_factor`

**Recommendation**: No new env-tile sensor needed. Wire existing `sensor.oal_environmental_debug` directly. Tile state = `sensor.oal_global_environmental_brightness_boost` (the applied boost %). Tile subtitle = `state_attr('sensor.oal_environmental_debug', 'why_not_boosted')`. Tap popup = the 16+ breakdown attributes as a structured table.

## APPENDIX A — Cause-attribution sub-agent prompt (for re-dispatch if needed)

(Already returned in source session — see §11 for findings. Re-dispatch only if discovering a NEW sensor type.)

```
Discovery task — find OAL [SUBSYSTEM] sensor in /home/mac/HA/implementation_10.

CONTEXT: [describe what you're looking for + why]
ALREADY VERIFIED NOT TO HAVE [X]: [list to skip]
SEARCH SCOPE: packages/*.yaml + Configuration/*.yaml (read-only)
LOOK FOR: [keywords + patterns]
REPORT FORMAT: under 400 words; (1) entity_id, (2) file:line, (3) attr structure,
  (4) ranking if multiple, (5) if NOT found list wrap candidates
DO NOT modify; discovery only.
```

## APPENDIX B — Existing OAL sensor inventory (86 sensors at session start)

**Per-zone (9 zones × 6 sensors)**:
- `sensor.oal_zone_<zone>_brightness` / `_brightness_target` / `_color_temp` / `_effective_max` / `_effective_min` / `_manual_offset` (THE BOOST SOURCE)

**Per-zone status (9)**: `sensor.oal_<zone>_status`

**Global override/boost**:
- `sensor.oal_override_count_active` (state + `zones` attr + `soonest_reset` attr)
- `sensor.oal_soonest_override`, `sensor.oal_real_time_monitor`, `sensor.oal_mode_current`, `sensor.oal_system_status`

**Environmental**:
- `sensor.oal_global_environmental_brightness_boost` (raw boost value)
- `sensor.oal_environmental_debug` (RICH — see §11 sub-agent finding)
- `sensor.oal_lux_current`, `sensor.oal_effective_sun_elevation`, `sensor.oal_night_debug`

**Stats**: `sensor.oal_<config>_minutes_today` per config + `sensor.oal_mode_total_minutes_today`

Don't duplicate; consume.

## APPENDIX C — Commands cheat sheet

### Deploy
```bash
bash /home/mac/HA/implementation_10/skills/ha-safe-package-deploy/scripts/deploy_packages.sh
bash /home/mac/HA/implementation_10/skills/ha-safe-package-deploy/scripts/deploy_packages.sh --dry-run --assume-remote-match
```

### Post-deploy reload (per CLAUDE.md correction)
1. `input_boolean.reload`, `input_number.reload`, `input_select.reload` if new helpers
2. `automation.reload` / `script.reload` / `template.reload`
3. **Manual AL integration reload** if AL `lights:` changed: Settings → Devices & Services → Adaptive Lighting → ⋮ → Reload
4. (Probe in P0.6: try `homeassistant.reload_config_entry` against AL config entry for programmatic alternative)

### MCP patterns
- `ha_get_state(entity_id)` — state + attrs
- `ha_get_entity(entity_id)` — registry metadata
- `ha_set_entity(entity_id, area_id=, labels=, name=, icon=)` — registry mutation
- `ha_update_device(device_id, area_id=)` — device-level (rolls up)
- `ha_eval_template(template)` — Jinja against live state
- `ha_config_get_automation(automation_id)` / `ha_config_set_automation` — storage get/set
- `area_entities('<area_id>')` → list (filter group entities via `state_attr() is none`)
- `label_entities('<label_id>')` → list

### Grep tips (BRE bug avoidance)
- Use `grep -E` for extended regex with alternation
- `\b` word boundary is unreliable in BRE — use explicit context or `grep -E`
- Multi-pattern: `grep -E "(p1|p2|p3)"` not `"p1\|p2"`

---

## END OF KICKOFF

Begin with: produce the CONTEXT block per global CLAUDE.md phase protocol, then a short read-back of your understanding. Don't touch live HA until Mac has confirmed the read-back.

— Mac
