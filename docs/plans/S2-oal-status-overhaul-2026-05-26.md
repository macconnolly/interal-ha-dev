# Tranche S.2 — OAL Zone Status Hybrid Overhaul + HVAC Energy

**Created**: 2026-05-26 ~6:15pm MDT
**Parent**: `docs/plans/next-tranche-rollup-2026-05-26.md` (originally listed as S.1d in rollup; renumbered S.2 because Mac stamped a hybrid architecture rather than the original naive split)
**Authority**: Mac-stamped scope after sub-agent architecture research (best-in-class HA 2026 path = hybrid). HVAC sensor undeferred with Mac's explicit acceptance of estimate risk in exchange for Energy dashboard integration.

---

## Phase 1: Context

### Empirical baseline
Sub-agent sensor inventory (2026-05-26 ~5:30pm) + architecture research (~6:00pm) both completed. Key empirical findings:

- 9 `sensor.oal_<zone>_status` sensors with state mashing mode+override into string ("M 3h 53m"). Attributes carry the real payload.
- **ZERO active Tunet production dashboard consumers** of any `_status` sensor. Only 2 stale Feb-2026 files reference `sensor.oal_main_living_status`: `Dashboard/living_room_card_v3.yaml:698` + `Dashboard/living_room_popup_v4.yaml:505`. Both pre-Tunet-rehab; not in dashboard registry.
- HA 2026 architectural constraint: `history-graph`, `statistics-graph`, `mini-graph-card`, and long-term statistics all bind to `entity.state`, not to attributes. Anything you want to graph MUST be the state of its own entity.
- Mac's HVAC: First Co. 48HBQ4-F fan-coil unit (condo). Nameplate-verified blower motor 10.7A @ 120V (~1.0 kW running) + pump 0.57A (~70W) = **~1.1 kW heating electrical**. Cooling estimated **~3.5 kW** for typical 2.5-ton condenser sized for 1,600 sq ft condo.

### Architecture decision (Mac stamp)
Hybrid approach (27 entities total, NOT the naive 45):
- 9 existing `_status` sensors: REFACTOR state expression to output mode enum (`adaptive`/`manual`/`sleep`/`off`) instead of mashed string. Keep all attributes.
- 18 new sensors: 9 zones × 2 signals (`brightness_target` + `color_temp_k`) — the only continuous numerics worth graphing.
- Skip splitting: override_remaining_s, lights_overridden, lights_total, env_sensitivity — these are status readouts, not time series; attributes are correct.

### HVAC sensor un-deferred (Mac stamp)
Ship `sensor.hvac_estimated_energy_today` with:
- `heating_kw = 1.1` (nameplate-derived)
- `cooling_kw = 3.5` (estimated; refine when roof condenser nameplate accessible)
- WITH `device_class: energy` per Mac's explicit acceptance of the estimate-vs-authority trade-off
- Refines later when condenser nameplate is read

This is a documented user override of the `feedback_device_class_authority` lesson. The lesson stands; Mac is making the trade-off informed.

### Out of scope (deferred to follow-up tranches)
- Stale dashboard file deletion (`living_room_card_v3.yaml`, `living_room_popup_v4.yaml`, `split_hero.yaml`) — Mac wants to inspect first
- `sensor.hero_*` sensor deletion (only stale consumers, but blocked by stale file decision)
- 15 new room aggregates (`<room>_brightness_avg_pct`, `_color_temp_avg_k`, `_any_manual_override`) — needs own scope decision under "graphable vs status" lens
- Light entity management architecture — Mac's explicit backlog item
- Custom integration (`custom_components/oal/`) — v14 endgame if OAL ever leaves the package world

---

## Phase 2: Analysis

### Component: 4 file edits across 4 packages

**Upstream sources** (all existing, no new dependencies):
- `switch.adaptive_lighting_<zone>.attributes.brightness_pct` — source for `brightness_target` sensors
- `switch.adaptive_lighting_<zone>.attributes.color_temp_kelvin` — source for `color_temp_k` sensors
- `switch.adaptive_lighting_<zone>.attributes.manual_control` — source for mode enum derivation
- `input_select.oal_active_configuration` — source for `sleep` mode detection
- `sensor.hvac_heating_minutes_today` + `sensor.hvac_cooling_minutes_today` — sources for hvac_estimated_energy

**Downstream**:
- Adaptive dashboard page (future tranche) — primary consumer of the new sensors
- Stats dashboard page (future tranche) — consumer of `hvac_estimated_energy_today`
- Stale files (`Dashboard/living_room_*.yaml`) — currently consume `sensor.oal_main_living_status`; will continue to work after refactor since the sensor still exists, just with different state semantics. If those files do `is_state('sensor.oal_main_living_status', 'A')` it would break; if they read attributes only it continues to work. Risk: low (files are stale, Mac is inspecting them separately).

**Invariants at risk**:
- OAL invariant #6 (ZEN32 LED sync): NO — sensor state is read-only consumption of switch state, doesn't drive any output
- All other invariants: NO — sensors are observability scaffolding
- **Status sensor state schema break**: low risk per zero active consumers. Will be discovered immediately if it breaks anything.

**Change classification**: Type B (Cascading) — touches 4 files, refactors 9 sensors, adds ~19 new entities, modifies 6. Downstream consumers minimal but real.

---

## Phase 3: Design — line-level changes

### Change Set 1: Refactor 9 `sensor.oal_<zone>_status` state to mode enum

**File**: `packages/oal_lighting_control_package.yaml` lines 9069-9595 area

**Strategy**: replace the state expression in each of the 9 zone status templates. Keep all attributes intact (the override_remaining_seconds, color_temp_kelvin, etc. remain accessible attribute-side).

**Current state expression** (pattern across 9 sensors):
```yaml
state: >
  {% if manual_control %}
    {% if remaining_h > 0 %}M {{ remaining_h }}h {{ remaining_m }}m
    {% else %}M {{ remaining_m }}m{% endif %}
  {% else %}A{% endif %}
```

**Replacement state expression** (v2 — adversarial review C1 fix: per-zone sleep_mode switch instead of global input_select; M2 fix: precedence swapped so sleep correctly identifies even when AL switch is off):
```yaml
state: >
  {% set has_manual = state_attr('switch.adaptive_lighting_<zone>', 'manual_control') | default([]) | length > 0 %}
  {% set is_sleep = is_state('switch.adaptive_lighting_sleep_mode_<zone>', 'on') %}
  {% set is_off = states('switch.adaptive_lighting_<zone>') != 'on' %}
  {% if is_sleep %}sleep
  {% elif is_off %}off
  {% elif has_manual %}manual
  {% else %}adaptive{% endif %}
```

**Why per-zone sleep instead of global input_select**: adversarial review C1 caught that OAL has per-zone `switch.adaptive_lighting_sleep_mode_<zone>` switches that are NOT always in sync with the global `input_select.oal_active_configuration`. Specifically, `column_lights` sleep is carved out as a special case (per OAL package lines 1943, 2290, 2305, 3077+) — during global Sleep mode, column_lights sleep_mode may be off. Using the per-zone switch is the authoritative signal.

**Why sleep precedence over off**: a zone that is off because Sleep mode turned it off should report "sleep" (the cause) rather than "off" (the effect). Adversarial review M2.

**Why `length` instead of `count`**: matches the existing pattern in the OAL package (lines 9076-9077). Functionally identical on lists but consistent with the source file's style.

**Per zone** — substitute `<zone>` with the actual zone name (main_living, kitchen_island, kitchen_undercabinet, bedroom_primary, accent_spots, recessed_ceiling, column_lights, office, office_bed).

**Attributes preserved unchanged** — all existing attribute logic (mode, brightness_target, override_remaining_seconds, color_temp_kelvin, lights_overridden, etc.) stays intact.

### Change Set 2: Add 18 new graphable sensors

**File**: `packages/tunet_oal_extracted_sensors.yaml` (existing; append to end of template block)

**18 sensors**: 9 zones × 2 (brightness_target + color_temp_k).

**Pattern** (replicated 9 times with zone substitution):
```yaml
- name: "OAL Zone Main Living Brightness Target"
  unique_id: "tunet_oal_zone_main_living_brightness_target_pct"
  icon: mdi:lightbulb-variant
  unit_of_measurement: "%"
  state_class: measurement
  state: >
    {{ state_attr('switch.adaptive_lighting_main_living', 'brightness_pct') | float(none) | round(1) }}

- name: "OAL Zone Main Living Color Temp"
  unique_id: "tunet_oal_zone_main_living_color_temp_k"
  icon: mdi:thermometer-lines
  unit_of_measurement: "K"
  state_class: measurement
  # device_class deliberately omitted — Kelvin is technically temperature but
  # mixing with HVAC/weather temperatures in LTS UI is confusing.
  state: >
    {{ state_attr('switch.adaptive_lighting_main_living', 'color_temp_kelvin') | float(none) | round(0) }}
```

**office_bed**: EXCLUDED per Mac's stamp (2026-05-26 6:30pm). Strict "fused with office" direction applies at sensor layer too. 18 new sensors total = 9 zones × 2 metrics, where the 9 zones are: main_living, kitchen_island, kitchen_undercabinet, bedroom_primary, accent_spots, recessed_ceiling, column_lights, office, and... wait — that's 8 zones not 9 since office_bed is excluded. **Corrected count: 8 zones × 2 metrics = 16 new sensors** (not 18). office_bed status sensor stays alive in CS1 refactor (still gets the mode enum); but doesn't gain the 2 graphable companions.

### Change Set 3 (v2 — adversarial review C2 fix): `hvac_estimated_energy_today` + utility_meter wrapper for Energy dashboard

**File 1**: `packages/tunet_stats_sensors.yaml` — append to existing `template: sensor:` block

```yaml
- name: "HVAC Estimated Energy Today"
  unique_id: "tunet_hvac_estimated_energy_today"
  icon: mdi:flash
  unit_of_measurement: "kWh"
  device_class: energy
  state_class: measurement  # CORRECTED v2: was total_increasing in v1, but source
                            # sensors reset at midnight via history_stats today-window;
                            # total_increasing on a midnight-resetting derived value
                            # generates phantom zero-cross events in LTS. measurement
                            # is correct for a "current today value" snapshot.
                            # Energy dashboard integration happens via the wrapping
                            # utility_meter below.
  state: >
    {# Mac's First Co. 48HBQ4-F nameplate values:
       Heating = blower 10.7A * 120V + pump 0.57A * 120V = ~1.1 kW running.
       Cooling = same blower+pump + condenser estimated 2.5 kW for 2.5-ton unit
       sized for 1,600 sq ft condo = ~3.5 kW total.
       Refine cooling_kw when roof condenser nameplate is accessible. #}
    {% set heating_min = states('sensor.hvac_heating_minutes_today') | float(0) %}
    {% set cooling_min = states('sensor.hvac_cooling_minutes_today') | float(0) %}
    {% set heating_kw = 1.1 %}
    {% set cooling_kw = 3.5 %}
    {{ ((heating_min * heating_kw / 60) + (cooling_min * cooling_kw / 60)) | round(2) }}
```

**File 1 (same file)**: append to existing `utility_meter:` block

```yaml
# CS3 — wraps the estimated energy in a utility_meter for clean Energy
# dashboard integration. Daily cycle with last_reset semantics handled
# by the utility_meter platform instead of relying on total_increasing
# on a midnight-resetting derived template sensor (which would produce
# phantom zero-cross events in LTS).
hvac_estimated_energy_daily:
  source: sensor.hvac_estimated_energy_today
  cycle: daily
  name: "HVAC Estimated Energy Daily"
```

**Net new entities for CS3**: 2 (the template sensor + the utility_meter-generated sensor).

**Energy dashboard integration**: consume `sensor.hvac_estimated_energy_daily` (the utility_meter output), not the template sensor directly. The utility_meter handles the daily rollover cleanly with `last_period` attribute for yesterday's total.

### Change Set 4: Polish `lights_on_*` sensors

**File**: `packages/tunet_room_sensors.yaml` — add `state_class: measurement` + `unit_of_measurement: "lights"` to the 6 existing sensors (5 per-room + 1 total).

**Pattern** (apply to each of 6):
```yaml
- name: "Lights On Living Room"
  unique_id: "tunet_lights_on_living_room"
  icon: mdi:lightbulb-multiple
  state_class: measurement       # NEW
  unit_of_measurement: "lights"  # NEW
  # ... existing state + attributes unchanged ...
```

---

## Phase 4: Deploy + Validation

### Deploy chain (no new package files this time — deploy_packages.sh works cleanly)
1. Edit 4 existing package files (Change Sets 1-4)
2. Deploy via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh`
3. HA reload: `ha_call_service('homeassistant', 'reload_all')` — sufficient since no new package file is being introduced (script handles modified files; reload_all picks up template changes)

### Validation
- [ ] All 9 `sensor.oal_<zone>_status` sensors now have state of `adaptive` / `manual` / `sleep` / `off` (NOT mashed string)
- [ ] All 16 new `_brightness_target_pct` + `_color_temp_k` sensors return numeric live values (8 zones × 2, office_bed excluded per Mac stamp)
- [ ] `sensor.hvac_estimated_energy_today` returns sensible kWh value (e.g., 373 min runtime × ~2.5 kW average = ~15 kWh today)
- [ ] All 6 `lights_on_*` sensors carry state_class + unit_of_measurement
- [ ] No regression on existing `sensor.oal_<zone>_brightness` (the S.1 baseline brightness sensors — those stay unchanged)
- [ ] `sensor.oal_main_living_status` attribute payload unchanged so stale Feb-2026 files continue to function until Mac inspects + decides

### Defect ledger entries

Append to `Dashboard/Tunet/Docs/visual_defect_ledger.md`:
- **S.2 ships with state-schema break on _status sensors** (LOW risk: adversarial review L2 confirmed the 2 stale Feb-2026 files read `override_remaining_formatted` ATTRIBUTE, not the state string. Attributes are preserved by CS1. Files will NOT break from the state schema change. Mac's pending file inspection is for general cleanup, not blocker.)
- **HVAC energy sensor ships with estimate + device_class:energy** (Mac explicitly chose this trade-off; cooling kw=3.5 is a 1,600 sq ft condo estimate; refine when roof condenser nameplate accessible)

---

## Phase 5: Stop triggers

- If `state_attr('switch.adaptive_lighting_<zone>', 'manual_control')` returns unexpected type (not a list), STOP — refactor the mode enum derivation
- If any of the 18 new sensors returns `None` on first probe, STOP and verify the switch attribute path
- If HVAC estimated energy reads as ridiculously high or negative, STOP and re-verify the kW values

---

## Open decisions for Mac stamp

- (a) Run adversarial review on this plan before implementation? Recommendation: SKIP — the architecture sub-agent already absorbed the equivalent. Mac may differ. Default: skip; proceed to implementation on `Proceed`.
- (b) Confirm office_bed treatment in Change Set 2 — adding `brightness_target` + `color_temp_k` for office_bed for symmetry, even though dashboard "fuses" it with office. OK?
- (c) Confirm `Proceed to implementation` token.

---

## Plan version history

- v1 (6:15pm 2026-05-26): initial plan — hybrid architecture + HVAC un-defer + lights_on polish; all major decisions pre-stamped via sub-agent research + Mac's explicit choices
