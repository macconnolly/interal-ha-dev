# Tunet HomeKit Integration — Plan D

**Portfolio**: see `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
**Owner**: Mac, executed via `/claude-mem:do`
**Tranche tag**: β-plumbing / HomeKit bridge
**Depends on**: Plan C (scenes exist), Plan B (sensors exist), Plan A (areas clean)
**Estimated effort**: 2-3 hours

## Intent

Create the HomeKit integration from scratch (currently NOT configured in HA) and expose the right entities — including:
- The 3 scenes from Plan C as HomeKit scenes
- Lights, climate, key sensors
- Fix the "visibility sensors" Mac mentioned (binary sensors that pass to HomeKit as binary status)
- Proper room organization (maps HA areas → HomeKit rooms)

## Required reading

1. `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
2. `/home/mac/HA/implementation_10/Configuration/configuration.yaml`
3. Plan A outcomes (area registry)
4. Plan B outcomes (new sensor inventory)
5. Plan C outcomes (3-scene cycle)
6. HA HomeKit Bridge documentation: https://www.home-assistant.io/integrations/homekit/

## Current state

- **HomeKit NOT configured** in HA. No `homekit:` block in configuration.yaml. No HomeKit bridge.
- Google Assistant has 18 entities explicitly exposed (per discovery).
- Mac referred to "visibility sensors passed to HomeKit" — these likely don't exist yet OR may have existed in a prior HA config that was removed. Verify.

## Phase D1: Decide bridge structure

**Pending Mac decision** (roadmap question 5):

- **(a) Single bridge** — one HomeKit accessory in Apple Home, exposes all curated entities. Simple but max-accessories-per-bridge cap is 150.
- **(b) Multiple bridges** — e.g. Lights bridge, Climate bridge, Scenes bridge. Each pairs separately in Apple Home; more flexibility for selective sharing with Apple Home users.
- **(c) Single bridge per floor** — only useful if floors are configured (Plan A2).

Recommend (a) unless Mac wants the flexibility.

## Phase D2: Configure bridge + curate entity list

**Steps**:

1. **Add `homekit:` block** to `Configuration/configuration.yaml` (or split out into `packages/tunet_homekit.yaml`):

```yaml
homekit:
  - name: "Tunet Home"
    port: 21063   # pick any unused port
    auto_start: true
    advertise_ip: 10.0.0.21
    filter:
      include_domains:
        - light
        - climate
        - scene
      include_entities:
        # Sensors curated for HomeKit (avoid spam)
        - sensor.dining_room_temperature
        - sensor.bedroom_temp_humidity_sensor_temperature
        - sensor.bedroom_temp_humidity_sensor_humidity
        - sensor.aqi
        # Per-room occupancy
        - binary_sensor.living_room_presence
        - binary_sensor.kitchen_presence
        - binary_sensor.dining_room_presence
        - binary_sensor.master_presence_occupancy
        - binary_sensor.office_presence_sensor_presence
        # OAL state proxies (visibility sensors)
        - binary_sensor.oal_tv_mode_active
        - binary_sensor.oal_movie_mode_active
        - binary_sensor.hvac_running   # from Plan B2
      exclude_entities:
        # Exclude the noise — diagnostic, debug, internal-only
        - sensor.living_room_temperature   # if Plan A3 confirmed dead
        - sensor.living_room_humidity      # if dead
        - light.living_room_main_group_disabled
        - light.master_presence            # presence-indicator light, not user-facing
    entity_config:
      # Per-entity overrides for naming / type
      binary_sensor.living_room_presence:
        type: occupancy
        name: Living Room Occupancy
      binary_sensor.kitchen_presence:
        type: occupancy
        name: Kitchen Occupancy
      # ... etc
      climate.dining_room:
        name: Thermostat
      # 3 scenes from Plan C
      scene.tunet_oal_adaptive:
        name: Adaptive (Main)
      scene.tunet_oal_dim_ambient_plus:
        name: Dim Ambient Plus
      scene.tunet_oal_dim_ambient:
        name: Dim Ambient
```

2. **Create the 3 scenes** if they don't already exist as scene entities:
   - `scene.tunet_oal_adaptive` → calls `input_select.select_option` for Adaptive on `input_select.oal_active_configuration`
   - `scene.tunet_oal_dim_ambient_plus` → same for the new mode
   - `scene.tunet_oal_dim_ambient` → same for Dim Ambient
   - Add to `packages/tunet_scenes.yaml` (NEW) OR inline in homekit package

3. **Reload HA core** to activate the homekit integration.

4. **Pair from iPhone**: Mac scans the QR code; bridge pairs.

5. **Configure Apple Home rooms**: assign each entity to the right Apple Home room (Living Room, Kitchen, etc.) — Apple Home does this on first add. Confirm rooms match Plan A2 area assignments.

**Verification**:
- Bridge appears in Apple Home.
- All curated entities reachable from iPhone.
- 3 scenes execute correctly (tapping Adaptive in Apple Home → OAL goes to Adaptive).
- No "visibility sensor" reports as wrong type (e.g., occupancy presented as motion, etc.).

**Commit**: `feat(ha): HomeKit bridge — Tunet Home with curated entity exposure`.

---

## Phase D3: Visibility sensor type fixes

**Goal**: Mac said "fix all of the visibility sensors passed to HomeKit." Once Phase D2 lands, walk through HomeKit and confirm each binary sensor presents as the right Apple Home accessory type.

**Common type confusions**:
- `binary_sensor.*` exposed as a generic switch → wrong; should be occupancy / motion / opening / contact based on device_class
- Sensors without proper `device_class` → present as generic
- Mode booleans (input_boolean.oal_*) → present as switches; consider whether they SHOULD be exposed (probably not — internal state)

**Steps**:

1. After Phase D2, audit each binary_sensor in HomeKit. For each that's wrong-typed:
   - Add `entity_config:<entity>:type:` override in the homekit block.
   - Valid types per HA docs: `occupancy`, `motion`, `door`, `window`, `contact`, `garage_door`, `smoke`, `co`, `leak`, `temperature`, etc.

2. Re-deploy + re-verify.

**Commit**: `fix(homekit): correct visibility sensor types for binary entities`.

---

## Verification (Plan D overall)

- HomeKit bridge active.
- 3 scenes work from Apple Home.
- All exposed sensors present correctly in iOS.
- Room organization in Apple Home matches HA area registry.
- Mac confirms iPhone HomeKit UX is clean.

## Out of scope

- New dashboard (Plan F).
- ZEN32 changes (Plan C handles).
- Anything that isn't "exposed via HomeKit" — local HA dashboard is separate.
