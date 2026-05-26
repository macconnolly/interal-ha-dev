# Tranche S.1 — Sensor Package (S.1a + S.1b + S.1c stamped scope)

**Created**: 2026-05-26 ~5:30pm MDT
**Parent**: `docs/plans/next-tranche-rollup-2026-05-26.md` (Tranche S — Stats + Adaptive Pages)
**Authority**: Mac-stamped scope = S.1a + S.1b + S.1c combined (rejected smaller-scope alternative; deferred S.1d zone-status overhaul + S.1e polish to follow-up)
**Foundation**: empirical sensor inventory completed 2026-05-26 ~5:10pm (sub-agent research); full inventory captured in plan body below.

---

## Phase 1: Context

### Empirical baseline — inventory finding
Sub-agent research of HA MCP state + `packages/*.yaml` revealed:
- **Most of Plan F's 19 planned sensors already exist** (shipped in commit `6caad51` 2026-05-23). The "build 19 new sensors" framing was wrong.
- **Only 4 planned sensors are actually missing** (S.1a scope below).
- **`sensor.oal_real_time_monitor` is a 40+ attribute monster** carrying load-bearing data buried as attributes. Adaptive page wireframe cannot render properly without extraction. This is the high-leverage finding (S.1b scope below).
- **5-7 bucket-E discoveries** the original plan missed: climate attributes (indoor temp/humidity), lux, HVAC runtime sum, lights power sums, setpoint numeric values. Stats page wireframe needs these (S.1c scope below).
- **One out-of-scope defect discovered during AL state probe**: `light.office_bed_light_right` is persistently manual-control flagged on `switch.adaptive_lighting_office_bed` (only the right bed light, not the left). Logged as separate follow-up.

### Out-of-scope items (logged for follow-up)
- **S.1d**: 9 OAL `_status` zone sensors split into mode/color_temp/override sensors — deferred
- **S.1e**: Polish + string-state fixes (`sonos_alarm_playing` String→binary_sensor, `oal_*_minutes_today` rename, state_class additions) — deferred
- **bed-lights manual-control bug**: `light.office_bed_light_right` repeatedly flagged manual; likely warm-pin automation interaction with AL `manual_control: "color"` per-attribute lock. Investigation deferred to its own defect tranche.
- **office vs office_bed fusion**: per Mac's direction, office_bed is treated as part of office (not a separate dashboard zone). NO `oal_zone_office_bed_brightness` sensor is added in S.1b.

### Memory + prior work
- Plan F §9-10 (`docs/plans/tunet-home-v2-interaction-spec-2026-05-23.md`) defines the original 19 planned sensors
- Rollup plan §S identifies Stats + Adaptive page buildout as the next net-new-value tranche
- Memory `feedback_npm_test_in_m1_gate` + `feedback_empirical_baseline_before_fix` apply: pre-implementation inventory done; tests after deploy

### Files read
- `packages/tunet_stats_sensors.yaml` (170+ lines — most planned sensors already here)
- `packages/tunet_hvac_sensors.yaml` (HVAC source + derived sensors)
- `packages/tunet_oal_zone_snapshot.yaml` (8 zone brightness sensors already)
- `packages/tunet_oal_enhancements.yaml` (OAL mode current + override count + bedroom_sonos_healthy)
- `packages/tunet_room_sensors.yaml` (lights_on counts per room + occupancy)
- Live HA state via MCP for ~60 entities across all five domains

### Gaps closed by inventory
- The assumption "we need to build 19 sensors" → corrected to "4 missing + 30-40 extractions + 6 discoveries"
- The assumption "office_bed is a 9th zone" → corrected to "office_bed is part of office; no separate sensor"
- The assumption "Plan F §8 MA routing" → already invalidated by M.1 today; not relevant to S.1

---

## Phase 2: Analysis

### Component: Sensor package additions across 2 new package files + 1 existing file edit

**Upstream**:
- Live HA state via existing entities (climate, weather, OAL monitor, AL switches, presence dimmers, history_stats counters)
- `sensor.oal_real_time_monitor.attributes.*` (40+ attributes) — the load-bearing source for S.1b extractions
- `climate.dining_room.attributes.{current_temperature, current_humidity, target_temp_low, target_temp_high}` — source for S.1c indoor temp/humidity/setpoint
- `sensor.oal_environmental_debug.attributes.lux_current` — source for S.1c lux

**Downstream**:
- Stats page wireframe (Plan F §9) will consume the 4 missing + 6 discovered sensors
- Adaptive page wireframe (Plan F §10) will consume the 36 OAL extraction sensors + existing 8 zone-brightness sensors
- Existing dashboards (overview, home-preview) are unaffected — additive only

**Invariants at risk**:
- **OAL state integrity**: extracting attribute values into separate sensors must NOT modify the source `sensor.oal_real_time_monitor` or its update timing. All new sensors are template-pulls from existing attributes — read-only consumption.
- **Recorder load**: adding ~46 new sensors (4 + 36 + 6) increases recorder write rate. Each template sensor only writes on state change, so the actual load impact depends on how often the attributes change. The OAL effective_min/max change only when config changes (~once per scene); manual_offsets change only on ZEN32 press; baselines change on every AL cycle (15-90s). Estimated overhead: <5% on recorder size growth.
- **Template performance**: 36 template sensors triggered by the same source entity (`sensor.oal_real_time_monitor`) means a single state change fires 36 evaluations. Manageable but should be batched into one template `sensor:` block with shared trigger.

**Change classification**: Type B (Cascading) — touches multiple package files, introduces ~46 new entities. Downstream dashboards will consume them but those are separate tranches; this tranche only ships the sensors.

---

## Phase 3: Design — line-level changes

### Change Set S.1a (v2 — H1 fix applied): Complete the 3 missing planned sensors (was 4 — `hvac_estimated_energy_today` DEFERRED)

**File**: edit `packages/tunet_stats_sensors.yaml` (existing — append to existing template + utility_meter sections)

**v1 → v2 change**: `sensor.hvac_estimated_energy_today` REMOVED from S.1a scope. Adversarial review H1 flagged that shipping with placeholder kW values + `device_class: energy` would pollute HA's Energy dashboard with authoritative-looking garbage (a residential gas furnace blower draws 300-600 W, not 30 kW; the "30 kW" was thermal nameplate misused as electrical). Three resolutions were available:
- (a) defer entirely until Mac has real watt measurements (chosen)
- (b) ship as `unit_of_measurement: "min"` runtime proxy with no device_class
- (c) strip device_class and label "estimated"

**Chosen**: (a) defer. The existing `sensor.hvac_heating_minutes_today` + `sensor.hvac_cooling_minutes_today` + new `sensor.hvac_runtime_today_minutes` (S.1c #5) already provide the runtime data the Stats page wireframe needs. "Estimated energy" was speculative — adding it would require either accurate measurement (Shelly EM clamp future hardware) OR a clear "estimated" labeling pattern that the plan didn't ship cleanly. Better to wait for actual data than ship wrong data with authority.

**Items** (3, down from 4):

2-3. **`utility_meter.hvac_heating_daily` + `utility_meter.hvac_cooling_daily`** — add daily cycle to the existing utility_meter block.
   ```yaml
   utility_meter:
     # ... existing weekly + monthly entries ...
     hvac_heating_daily:
       source: sensor.hvac_heating_minutes_today
       cycle: daily
     hvac_cooling_daily:
       source: sensor.hvac_cooling_minutes_today
       cycle: daily
   ```

4-5. **`sensor.living_room_lights_yesterday` + `sensor.master_lights_yesterday`** — read `last_period` from existing daily utility_meter sensors. **v2 fix M2**: `state_class` OMITTED (was incorrectly `measurement` in v1). Pattern matches existing `sensor.hvac_heating_yesterday_hours` at `tunet_stats_sensors.yaml:97-109` which correctly omits state_class. The value is a daily snapshot, not a continuous reading — HA shouldn't generate long-term statistics for it.
   ```yaml
   - name: "Living Room Lights Yesterday"
     unique_id: "tunet_living_room_lights_yesterday"
     icon: mdi:lamp
     unit_of_measurement: "kWh"
     device_class: energy
     # state_class deliberately omitted — yesterday snapshot, not continuous signal.
     state: >
       {{ state_attr('sensor.living_room_lights_daily', 'last_period') | float(0) | round(2) }}

   - name: "Master Lights Yesterday"
     unique_id: "tunet_master_lights_yesterday"
     icon: mdi:lamp
     unit_of_measurement: "kWh"
     device_class: energy
     # state_class deliberately omitted — yesterday snapshot, not continuous signal.
     state: >
       {{ state_attr('sensor.master_lights_daily', 'last_period') | float(0) | round(2) }}
   ```

**Effort**: ~30 min implementation; deploys via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh` (backup + commit + SCP + verify per CLAUDE.md).

---

### Change Set S.1b (v2 — H2 fix applied): OAL `real_time_monitor` extraction (28 sensors, was claimed 36)

**File**: NEW `packages/tunet_oal_extracted_sensors.yaml`

**v1 → v2 change**: count corrected. v1 said "36 sensors" but the math was wrong (8 zones × 2 effective-range metrics = 16, not 24; plus 8 manual offsets + 4 globals = 28 total). Adversarial review H2 caught the discrepancy. **Actual count: 28 sensors in S.1b**.

**Strategy**: single template `sensor:` block with all 28 entries. Standard state-based template (HA auto-tracks `state_attr('sensor.oal_real_time_monitor', '<attr>')` references and only re-evaluates on relevant changes). Recommended over a `trigger-based template:` block because auto-tracking is more efficient than firing 28 evaluations on every monitor state change.

**Why one file**: keeps the extraction logically grouped, easy to verify/maintain, easy to delete if OAL refactors the monitor sensor.

**Naming convention**: `sensor.oal_zone_<zone>_<metric>_pct` for zone-specific %; `sensor.oal_offset_<source>_pct` for globals.

**v2 fix M1**: ALL % sensors omit `device_class`. `device_class: power_factor` (v1) was wrong — that's an electrical device class for power-factor sensors (0.0-1.0 scale, dimensionless). Just `unit_of_measurement: "%"` + `state_class: measurement` is correct for graphable percentage values.

**16 effective range sensors** (8 zones × 2 metrics — `min` + `max`):
- `sensor.oal_zone_main_living_effective_min_pct`
- `sensor.oal_zone_main_living_effective_max_pct`
- ... (same pattern for kitchen_island / kitchen_undercabinet / bedroom_primary / accent_spots / recessed_ceiling / column_lights / office)

**Attribute source pattern**: `state_attr('sensor.oal_real_time_monitor', '<zone>_effective_min_brightness_pct')` (sub-agent confirmed attribute names live).

**8 manual offset sensors** (one per zone):
- `sensor.oal_zone_main_living_manual_offset_pct`
- ... (same pattern for 7 other zones)

**Attribute source pattern**: `state_attr('sensor.oal_real_time_monitor', '<zone>_manual_offset_brightness_pct')`.

**4 global offset sensors** (numeric, replacing the existing string-state ones):
- `sensor.oal_offset_environmental_pct` — `state_attr('sensor.oal_real_time_monitor', 'b_environmental_offset')`
- `sensor.oal_offset_sunset_pct` — `state_attr('sensor.oal_real_time_monitor', 'b_sunset_offset')`
- `sensor.oal_offset_config_pct` — `state_attr('sensor.oal_real_time_monitor', 'b_config_offset')`
- `sensor.oal_offset_total_pct` — sum of the 3 above, OR direct attr if available

**Shared template properties** (apply to all 28):
- `unit_of_measurement: "%"`
- `state_class: measurement`
- `icon: mdi:brightness-percent` (offsets) or `mdi:brightness-7` (zone min/max)
- **NO `device_class`** — `power_factor` v1 attempt was wrong (electrical class, 0-1 scale, not 0-100). Statistics card renders fine on unit+state_class alone.

**Effort**: ~1.5 hours to write + verify 28 sensors all return correct values via `ha_eval_template` probe per zone.

---

### Change Set S.1c — Bucket E discoveries (6 sensors)

**File**: NEW `packages/tunet_climate_extracted_sensors.yaml` (for climate-source extractions) OR add to existing `packages/tunet_hvac_sensors.yaml` (logical grouping).

Recommended location: extend `tunet_hvac_sensors.yaml` since the new sensors are HVAC-adjacent.

**Items**:

1. **`sensor.thermostat_indoor_temperature`** — numeric wrap of `climate.dining_room.current_temperature`
   ```yaml
   - name: "Thermostat Indoor Temperature"
     unique_id: "tunet_thermostat_indoor_temperature"
     icon: mdi:home-thermometer
     unit_of_measurement: "°F"
     device_class: temperature
     state_class: measurement
     state: >
       {{ state_attr('climate.dining_room', 'current_temperature') | float(none) }}
   ```

2. **`sensor.thermostat_humidity`** — numeric wrap of `climate.dining_room.current_humidity`
   ```yaml
   - name: "Thermostat Humidity"
     unique_id: "tunet_thermostat_humidity"
     icon: mdi:water-percent
     unit_of_measurement: "%"
     device_class: humidity
     state_class: measurement
     state: >
       {{ state_attr('climate.dining_room', 'current_humidity') | float(none) }}
   ```

3. **`sensor.hvac_setpoint_low_f`** + **`sensor.hvac_setpoint_high_f`** — numeric versions of the setpoint band
   ```yaml
   - name: "HVAC Setpoint Low"
     unique_id: "tunet_hvac_setpoint_low_f"
     icon: mdi:thermometer-low
     unit_of_measurement: "°F"
     device_class: temperature
     state_class: measurement
     state: >
       {{ state_attr('climate.dining_room', 'target_temp_low') | float(none) }}

   - name: "HVAC Setpoint High"
     unique_id: "tunet_hvac_setpoint_high_f"
     icon: mdi:thermometer-high
     unit_of_measurement: "°F"
     device_class: temperature
     state_class: measurement
     state: >
       {{ state_attr('climate.dining_room', 'target_temp_high') | float(none) }}
   ```

4. **`sensor.oal_lux_current`** — numeric wrap of `sensor.oal_environmental_debug.attributes.lux_current` (sub-agent confirmed: 412 lx current)
   ```yaml
   - name: "OAL Lux Current"
     unique_id: "tunet_oal_lux_current"
     icon: mdi:brightness-5
     unit_of_measurement: "lx"
     device_class: illuminance
     state_class: measurement
     state: >
       {{ state_attr('sensor.oal_environmental_debug', 'lux_current') | float(none) }}
   ```
   File: add to `packages/tunet_oal_extracted_sensors.yaml` (same as S.1b — OAL attribute extraction).

5. **`sensor.hvac_runtime_today_minutes`** — heating + cooling sum (single headline tile)
   ```yaml
   - name: "HVAC Runtime Today"
     unique_id: "tunet_hvac_runtime_today"
     icon: mdi:hvac
     unit_of_measurement: "min"
     state_class: total_increasing
     state: >
       {% set h = states('sensor.hvac_heating_minutes_today') | float(0) %}
       {% set c = states('sensor.hvac_cooling_minutes_today') | float(0) %}
       {{ (h + c) | round(0) }}
   ```

6. **`sensor.living_room_lights_power_w`** + **`sensor.master_lights_power_w`** — already exist as `sensor.living_room_presence_dimmer_power` and `sensor.master_presence_power`. Aliases would be redundant; skip unless Mac wants the shorter names. **Action**: defer — keep using existing entity names.

**Net S.1c new sensors**: 5 (not 6; lights_power aliases dropped per redundancy).

**Effort**: ~30 min implementation.

---

### Change Set S.1c.6 — Defect ledger entry for bed-lights manual-control bug

**File**: edit `Dashboard/Tunet/Docs/visual_defect_ledger.md`

**Entry**: log `light.office_bed_light_right` persistent manual-control flag discovered during S.1 sensor inventory. Note that:
- Only the RIGHT bed light is flagged; left is not
- Autoreset timer is active (~3.9h remaining at discovery time)
- Suspected: `automation.oal_v13_office_bed_lights_warm_pin` warm-pin augmentation interacting with AL `manual_control: "color"` per-attribute lock asymmetrically
- Investigation deferred — not S.1 scope

---

## Phase 4: Deploy + Validation

### Deploy chain (v2 — M3 fix applied: brand-new file requires reload_all, not just template.reload)
1. Create `packages/tunet_oal_extracted_sensors.yaml` (S.1b + S.1c #4 lux)
2. Edit `packages/tunet_stats_sensors.yaml` (S.1a — 3 sensor additions + 2 utility_meter daily entries)
3. Edit `packages/tunet_hvac_sensors.yaml` (S.1c — 5 sensors: indoor temp, humidity, setpoint low/high, hvac_runtime)
4. Deploy via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh` — auto-backup, git-commit, SCP, byte-verify
5. **HA reload sequence** (M3 fix from adversarial review):
   - **For brand-new package file (`tunet_oal_extracted_sensors.yaml`)**: `template.reload` alone is INSUFFICIENT — HA must first parse and register the new file. Call `homeassistant.reload_all` to trigger package discovery + reload of all platforms. The CLAUDE.md OAL reload-sequence note (`input_boolean.reload`, `template.reload`, etc.) applies to MODIFIED existing files with new helpers; new package files need the broader reload.
   - **For modified existing files** (`tunet_stats_sensors.yaml`, `tunet_hvac_sensors.yaml`): `template.reload` is sufficient since HA already knows the files.
   - **Safest path**: call `homeassistant.reload_all` to cover both cases. Acceptable: ~5-10 second reload window where existing sensors may briefly go `unavailable`.
   - **Alternative if reload_all has problems**: HA restart (cleaner but takes ~60-90s).

### Validation (v2 — counts corrected)
- [ ] All 36 new entities (3 S.1a + 28 S.1b + 5 S.1c) return non-null state via `ha_get_state`
- [ ] S.1a yesterday sensors: match yesterday's last_period values; state_class correctly omitted
- [ ] S.1a hvac daily utility_meters: present with cycle=daily; rolls over correctly at midnight
- [ ] S.1b 16 effective range sensors (8 zones × min/max): each returns the correct `effective_min/max_brightness_pct` value live
- [ ] S.1b 8 manual offset sensors: zero by default; non-zero when ZEN32 has been pressed
- [ ] S.1b 4 global offset sensors: numeric (not string), graphable, no `device_class`
- [ ] S.1c indoor temp/humidity: match `climate.dining_room` attrs live
- [ ] S.1c lux: matches `oal_environmental_debug.lux_current`
- [ ] S.1c hvac_runtime: heating + cooling sum
- [ ] No recorder load complaint (HA logs show no template performance warnings)
- [ ] `sensor.oal_real_time_monitor` state + attrs unchanged (no regression to source)
- [ ] No regression on any existing sensor (manual `ha_get_state` spot checks on 5 random pre-existing sensors)
- [ ] **L2 check (from adversarial review)**: confirm no dashboard consumer breaks from the new `sensor.hvac_setpoint_low_f` / `_high_f` entity_ids — currently the dashboards may read `target_temp_low/high` from `sensor.hvac_setpoint_band` attributes. New first-class sensors are additive; no removal of existing attribute-paths. Grep dashboard YAMLs to confirm.

---

## Phase 5: Stop triggers

- If any planned attribute path returns `None` from `state_attr()`, STOP. Likely the sub-agent inventory had a stale attribute name; re-probe `sensor.oal_real_time_monitor` attrs live.
- If recorder load complaint appears in HA logs after deploy, STOP. Group the 36 OAL extractions into a single trigger-template with `trigger: state: sensor.oal_real_time_monitor` to throttle re-evaluation rate.
- If Mac confirms HVAC nameplate kW values differ materially from 30/3.5 placeholder, update S.1a sensor immediately.

---

## Open decisions for Mac stamp

- (a) HVAC nameplate kW values: ship with 30/3.5 placeholder (marked TODO) and Mac updates later, OR Mac provides values upfront before commit?
- (b) `device_class: power_factor` on the % sensors — HA workaround since no "percentage" device_class exists. Alternative: drop device_class entirely; relying on unit + state_class. Recommend power_factor for now (graphs cleanly in statistics card).
- (c) Confirm office_bed brightness exclusion (per Mac's "sensor fused with office" direction). Plan currently treats office as one zone; office_bed gets no new sensors. Confirmed?
- (d) `Proceed to adversarial review` before implementation? Or stamp-direct given that the inventory phase already absorbed the equivalent of one adversarial review pass?

---

## Plan version history

- v1 (~5:30pm 2026-05-26): initial plan — empirical inventory + 3-sub-tranche scope (a + b + c stamped); office_bed fusion direction applied; bed-lights manual-control bug logged as separate follow-up
- **v2 (~5:50pm 2026-05-26)**: adversarial review pass resolved — H1 deferred `hvac_estimated_energy_today` (placeholder kW + energy device_class would pollute Energy dashboard); H2 corrected sensor count 36 → 28 (math error in S.1b: 8 zones × 2 metrics = 16, not 24); M1 removed `device_class: power_factor` from % sensors; M2 omitted `state_class` on yesterday-snapshot sensors; M3 changed deploy reload from `template.reload` to `homeassistant.reload_all` for new-file registration. Net sensor count: 36 (was claimed 46).

## Appendix A — Adversarial Review v1 Findings + Disposition

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| H1 | High | HVAC energy with placeholder kW + `device_class: energy` would pollute Energy dashboard | **FIXED v2** — `hvac_estimated_energy_today` DEFERRED entirely; revisit when Mac has Shelly EM clamp measurements |
| H2 | High | Math error: "24 effective sensors" but 8 zones × 2 metrics = 16 | **FIXED v2** — corrected to 16; total S.1b = 28 (was claimed 36); total S.1 = 36 (was 46) |
| M1 | Med | `device_class: power_factor` wrong for % values | **FIXED v2** — all % sensors omit device_class; unit + state_class alone |
| M2 | Med | `state_class: measurement` semantically wrong on yesterday snapshots | **FIXED v2** — state_class omitted on yesterday sensors; pattern matches existing `hvac_heating_yesterday_hours` |
| M3 | Med | `template.reload` insufficient for brand-new package file | **FIXED v2** — deploy chain calls `homeassistant.reload_all` for new file registration |
| L1 | Low | lux source is `environmental_debug` not `real_time_monitor`; Phase 5 pivot note | **DOCUMENTED v2** — note added; auto-tracking handles correctly in default state-based template |
| L2 | Low | Setpoint low/high duplicate values already in `setpoint_band` attrs | **CLOSED** — additive; validation step added to confirm no dashboard regression |
| B | — | Attribute name correctness — verified against `oal_lighting_control_package.yaml:8724-8825` by reviewer | **CONFIRMED SAFE** — proceeding with confidence |
| F, G, H, I | — | Various confirmed-safe items | **CONFIRMED SAFE** by reviewer |
