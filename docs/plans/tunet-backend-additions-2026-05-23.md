# Tunet Backend Additions — Plan B

**Portfolio**: see `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
**Owner**: Mac, executed via `/claude-mem:do`
**Tranche tag**: β-plumbing / backend (OAL + sensors + HVAC + automations)
**Depends on**: Plan A complete (entity IDs confirmed, areas cleaned)
**Estimated effort**: 4-6 hours

## Intent

Land the backend HA changes that future dashboards + ZEN32 + HomeKit will surface:
- Per-room sensor parity (Kitchen temp, Office environment, Living Room fix-or-replace)
- HVAC equipment + template sensors for graphable heating/cooling tracking
- OAL "slightly dimmer" mode (NEW preset)
- Kitchen counter night-lower-bound adjustment
- Entry main spot auto-off automation (entity from Plan A4)
- OAL sensor enhancement — more meaningful aggregations

## Required reading

1. `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
2. `/home/mac/HA/implementation_10/CLAUDE.md` — full OAL architecture section (lines 200+)
3. `/home/mac/HA/implementation_10/packages/oal_lighting_control_package.yaml` — the canonical OAL package
4. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md` § sensor card + climate card (for surfacing contracts)
5. Plan A's documented outcomes (areas, dead sensors, entry main spot entity)

## Constraint catalog (CRITICAL — see CLAUDE.md OAL section)

- **System invariants** (CLAUDE.md OAL Section, "SYSTEM INVARIANTS" table): brightness bounds, Govee color temp range (2700-6500K only!), manual auto-reset, force-mode override, environmental-additive, ZEN32 LED sync, no calculation during pause. Violation = redesign required.
- **Govee constraint**: bedroom_primary + column_lights are Govee zones — color temp output MUST be clamped 2700-6500K regardless of what OAL calculates.
- **All changes** must enter via the OAL Configuration Manager pipeline; do NOT bypass to call `light.turn_on` directly with brightness values.

## Phase B1: Per-room sensor parity

**Goal**: Every room area gets at minimum: temperature, lights-on-count, occupancy-state. Some get humidity + lux + power if applicable.

**Inventory** (current state per discovery):

| Room | Temp | Humidity | Lux | Occupancy | Power | Action |
|------|------|----------|-----|-----------|-------|--------|
| Living Room | sensor.living_room_temperature (DEAD or replaced per Plan A3) | sensor.living_room_humidity (DEAD or replaced) | sensor.living_room_presence_light_sensor_light_level | binary_sensor.living_room_presence + couch_presence | LR presence dimmer (42.3W) | Confirm sensor health |
| Kitchen | NONE | sensor.kitchen_humidity | NONE | binary_sensor.kitchen_presence | NONE | **ADD: temp + lux** |
| Dining Room | sensor.dining_room_temperature | (shared) | (shared) | binary_sensor.dining_room_presence | NONE | OK |
| Master Bedroom | sensor.bedroom_temp_humidity_sensor_temperature | sensor.bedroom_temp_humidity_sensor_humidity | NONE | binary_sensor.master_presence_occupancy | TV (DEAD or replaced) | **ADD: lux** |
| Office | NONE | NONE | NONE | binary_sensor.office_presence_sensor_presence | NONE | **ADD: temp + humidity + lux** |
| Entryway | (depends on Plan A2 — may not exist) | | | | | Depends |

**Steps**:

1. **Hardware question for Mac**: which rooms have a free Zigbee/Matter sensor slot? Kitchen + Office + Master Bedroom each need a multi-sensor (Aqara T1 or similar). Options:
   - (a) Mac orders new sensors; defer Phase B1 until they arrive.
   - (b) Reuse existing devices (e.g., move an Aqara from a low-priority area).
   - (c) Use template sensors derived from other sources (e.g., Office temp = average of LR + Bedroom).
   - (d) Accept the gaps — surface "NO DATA" on per-room dashboards.

2. **Template sensors for derivable values**:
   - `sensor.lights_on_<room>` — count of lights with state=on in each room area.
   - `sensor.occupancy_<room>` — derived from presence sensor(s) with a stickiness/timeout.
   - `sensor.power_<room>` — sum of all power sensors in the room area (only LR has anything today).

3. **Wire into HA area registry** (Plan A2 covers temperature_entity_id / humidity_entity_id; this phase adds template sensors).

4. **Add to `packages/tunet_room_sensors.yaml`** (NEW package file).

**Verification**:
- For each room: `sensor.lights_on_<room>` returns a number; `sensor.occupancy_<room>` returns home/away.
- New hardware sensors (if Mac picked (a) or (b)) report live values.

**Commit**: `feat(ha): per-room sensor parity — lights-on counts, occupancy, area wiring`.

---

## Phase B2: HVAC equipment + template sensors

**Goal**: Make heating/cooling activity graphable.

**Current state** (per discovery):
- Only `climate.dining_room` thermostat + one template `sensor.hero_climate_state`.
- No compressor sensors, no equipment power, no cycle time.
- Nest credentials configured but Nest sensors not exposed in packages.

**Steps**:

1. **Mac picks strategy**:
   - (a) **Template-only** (cheap, no hardware): derive from state changes of `climate.dining_room`'s `hvac_action`. Track time-in-heat, time-in-cool, last cycle duration.
   - (b) **Add equipment power sensor** (mid-cost): power-monitoring smart plug on the HVAC air handler or a Shelly EM clamp. Combined with (a) gives real metering.
   - (c) **Expose Nest integration**: since Nest creds are already there, expose `nest.*` entities for thermostat history, runtime, etc.
   - Recommend (a) + (c) as the immediate path.

2. **Template sensors** (a):
   - `sensor.hvac_action_today_minutes_heating` — minutes today where `climate.dining_room.hvac_action == 'heating'`.
   - `sensor.hvac_action_today_minutes_cooling` — same for cooling.
   - `sensor.hvac_last_cycle_duration` — duration of the most recent heat or cool cycle.
   - `sensor.hvac_setpoint_drift` — current_temperature minus target_temp_high (positive = above setpoint).
   - `binary_sensor.hvac_running` — true when hvac_action != idle.

3. **Nest integration** (c) — `ha_set_integration_enabled` for the Nest config entry if disabled; expose entities; add the most useful ones to the new dashboard surface.

4. **Add to `packages/tunet_hvac_sensors.yaml`** (NEW).

**Verification**:
- New sensors return numeric values that change with thermostat activity.
- Mac can graph `sensor.hvac_action_today_minutes_heating` in the new dashboard.

**Commit**: `feat(ha): HVAC equipment + template sensors for graphable heating/cooling tracking`.

---

## Phase B3: OAL "slightly dimmer" mode

**Goal**: Add the OAL mode Mac actually wants for cycling. Based on his words: "the one where everything is slightly dimmer and the kitchen main lights, and entry main lights are off, everything is slightly dimmer."

**Pending Mac decision** (Plan A5 question 2):
- (a) New preset "Dim Ambient Plus" between Adaptive and Dim Ambient — kitchen_main + kitchen_counter + entry off, others dimmed.
- (b) Reuse Dim Ambient + script-side force-off for kitchen + entry.
- (c) New preset with different name (Mac picks).

Assume (a) for the plan; adjust at execution time.

**Steps** (NON-NEGOTIABLE — follow the CLAUDE.md OAL section rigorously):

1. **CONTEXT phase output** (per CLAUDE.md global operating contract):
   - Memory search "OAL slightly dimmer mode"
   - Files read: `packages/oal_lighting_control_package.yaml:188-200` (input_select), `:1917-1928` (Dim Ambient config), `:9000+` (configuration_manager automation)
   - Live state: current `input_select.oal_active_configuration`, system status

2. **ANALYSIS phase output**:
   - **Upstream**: input_select.oal_active_configuration → configuration_manager automation → per-zone brightness configs
   - **Downstream**: ZEN32 cycle_oal_config script (Line 710), status card mode chip, OAL sensors, ZEN32 LED priority
   - **Invariant risk**: #1 (bounds), #2 (Govee), #5 (additive) — all Low IF the new mode follows existing pattern; #6 (ZEN32 LED) requires Plan C to update LED state machine

3. **DESIGN phase output**:
   - New mode name: "Dim Ambient Plus" (or Mac's pick)
   - Add to `input_select.oal_active_configuration` options
   - Add to OAL configuration_manager dispatch with explicit per-zone config:
     - main_living: same as Dim Ambient (40%)
     - kitchen_island: **0 / off**
     - kitchen_undercabinet: 5% night, 20% day
     - bedroom_primary: same as Dim Ambient
     - accent_spots: 20% (Dim Ambient value)
     - recessed_ceiling: 1% (Dim Ambient value)
     - column_lights: 30% (Dim Ambient value)
     - entryway lamp / entry main spots: **0 / off** (per Plan A4 entity ID)
     - office: per Dim Ambient
   - Update `zen32_cycle_oal_config` allowed_configs list (Plan C handles)
   - Update OAL real-time monitor sensor display

4. **IMPLEMENTATION**:
   - Edit `packages/oal_lighting_control_package.yaml` per design
   - Deploy via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh packages/oal_lighting_control_package.yaml`
   - Verify activation: `ha_call_service "input_select" "select_option" entity_id="input_select.oal_active_configuration" option="Dim Ambient Plus"`. Observe per-zone brightness reaches the configured values.

5. **Mac live-verifies** at home — does the actual room look right?

**Verification**:
- New mode selectable via UI; per-zone brightness matches design.
- Mac confirms visual result in the living room.

**Commit**: Already auto-committed by `deploy_packages.sh` (backup + audit message). Add a follow-up commit: `feat(oal): add Dim Ambient Plus mode — kitchen main + entry off variant`.

---

## Phase B4: Kitchen counter night lower bound

**Goal**: Mac says "lower the lower bound by default for kitchen counter lights at night." Current bound is 5% (Warm Ambient) / 10% (baseline night).

**Steps**:

1. Mac picks new bound (e.g., 2%, 3%). Constraint: must be ≥ 1% to remain Govee-safe and prevent flicker.

2. Edit OAL package: per-zone config for `kitchen_undercabinet` zone night value. Line ~1940.

3. Deploy + verify.

**Verification**:
- At night with OAL active, kitchen counter lights settle to the new lower bound.

**Commit**: `feat(oal): lower kitchen counter night bound to N%`.

---

## Phase B5: Entry main spot auto-off

**Goal**: "Auto turn off the entry main spot lights."

**Pending Plan A4 entity ID**.

**Steps**:

1. Define trigger condition:
   - Time-based (e.g., after sunset + 30min)?
   - Activity-based (no entryway presence for N minutes)?
   - State-based (when OAL mode is Sleep, Dim Ambient, or Dim Ambient Plus)?
   - Mac picks.

2. Create `automation.tunet_entry_main_spot_auto_off`:
   - Trigger per (1)
   - Action: `light.turn_off` on the Plan A4 entity
   - Condition: not currently in Manual/Sleep OAL mode (don't fight the user)
   - Mode: single

3. Add to a new or existing package YAML. Probably `packages/tunet_room_automations.yaml` (NEW) since it's not pure OAL.

4. Deploy + verify.

**Verification**:
- Automation fires on the configured trigger.
- Light actually turns off.

**Commit**: `feat(ha): auto-off entry main spot on <trigger>`.

---

## Phase B6: OAL sensor enhancement

**Goal**: Mac said "enhance the OAL sensors to be more meaningful." Discovery showed 8 zone sensors + system status + real-time monitor + sun elevation. What's missing or unclear?

**Inventory** (current OAL sensors):
- `sensor.oal_system_status` — high-level
- `sensor.oal_real_time_monitor` — per-zone effective brightness
- `sensor.oal_effective_sun_elevation`
- `sensor.oal_global_brightness_offset`
- `sensor.oal_average_active_color_temperature`
- 8 zone-specific `sensor.oal_<zone>_status` sensors
- `binary_sensor.oal_*` — tv mode, movie mode, sunrise

**Steps**:

1. Mac articulates what's not meaningful. Candidate enhancements:
   - **Time-since-last-manual-override per zone** (currently shown but verbose)
   - **Override rate** (overrides per day — pattern detection)
   - **Mode-time-share** (time spent in each OAL mode this week)
   - **Sunset offset effectiveness** (how much the sunset curve actually shifted things tonight)
   - **Adaptive vs override conflict count** (how often OAL "wins" vs "loses" to manual)

2. Implement 2-3 of the above as template sensors.

3. Expose in the new dashboard (Plan F).

**Verification**:
- New sensors return values; Mac confirms they're informative.

**Commit**: `feat(oal): enhanced sensor aggregations — <list>`.

---

## Verification (Plan B overall)

- All new sensors return live values.
- New OAL mode cycles correctly.
- Kitchen counter night bound landed at Mac's value.
- Entry main spot auto-off fires when expected.
- Mac signs off on the backend additions.

## Out of scope

- ZEN32 redesign (Plan C — depends on the new OAL mode landing here)
- HomeKit (Plan D)
- New dashboard (Plan F — consumes these sensors)
