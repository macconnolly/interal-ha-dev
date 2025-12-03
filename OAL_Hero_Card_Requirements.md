# OAL Hero Card - Complete Requirements & Gap Analysis

## Document Purpose
This document provides a deep analysis of the existing `OAL_lighting_control_package.yaml` to identify exactly what exists, what can be extended, and what must be added for the hero card dashboard implementation.

---

## Part 1: Existing Infrastructure Analysis

### 1.1 Current Zones (5 Defined in Package)

| Zone ID | Light Group Entity | Lights Count | AL Switch | In Control Group |
|---------|-------------------|--------------|-----------|------------------|
| main_living | `light.main_living_lights` | 6 | `switch.adaptive_lighting_main_living` | ✅ |
| kitchen_island | `light.kitchen_island_lights` | 1 | `switch.adaptive_lighting_kitchen_island` | ✅ |
| bedroom_primary | `light.bedroom_primary_lights` | 2 | `switch.adaptive_lighting_bedroom_primary` | ✅ |
| accent_spots | `light.accent_spots_lights` | 2 | `switch.adaptive_lighting_accent_spots` | ✅ |
| recessed_ceiling | `light.recessed_ceiling_lights` | 2 | `switch.adaptive_lighting_recessed_ceiling` | ✅ |

**MISSING ZONE:** Column Lights exists in HA (`switch.adaptive_lighting_column_lights`) but is NOT in the package.

### 1.2 Current Input Entities

#### Scene Presets (ALREADY EXISTS - Line 82-92)
```yaml
input_select.oal_active_configuration:
  options:
    - "Config 1: Baseline (All On)"
    - "Config 2: Reduced Overhead (Recessed 2%)"
    - "Config 3: Evening Relax (Recessed/Tracks Off)"
    - "Config 4: Accents Only"
    - "Global Manual Adjustment"
```
**Status:** ✅ Complete - Can use directly for scene selector in hero card

#### Per-Zone Manual Offsets (Lines 194-238)
- `input_number.oal_manual_offset_main_living_brightness`
- `input_number.oal_manual_offset_kitchen_island_brightness`
- `input_number.oal_manual_offset_bedroom_primary_brightness`
- `input_number.oal_manual_offset_accent_spots_brightness`
- `input_number.oal_manual_offset_recessed_ceiling_brightness`

**Status:** ⚠️ Missing `input_number.oal_manual_offset_column_lights_brightness` (exists in HA but not in package)

#### Control Parameters (Lines 177-192)
- `input_number.oal_control_zonal_timeout_hours` - Controls autoreset time (default 4 hours)
- `input_number.oal_control_transition_speed` - Transition duration (default 2 sec)

**Status:** ✅ Complete

### 1.3 Current Template Sensors Analysis

#### sensor.oal_real_time_monitor (Lines 1888-1975)
**Current State Values:**
- "Force Sleep Mode"
- "Scheduled Sleep Mode"
- "Baseline"
- "Boosted"

**Current Attributes:**
| Attribute | Purpose | Hero Card Use |
|-----------|---------|---------------|
| `b_config_offset` | Config brightness offset | Info only |
| `b_environmental_offset` | Env boost value | ✅ Weather modifier chip |
| `b_sunset_offset` | Sunset boost value | ✅ Time modifier chip |
| `k_*` offsets | Color temp offsets | Not needed for hero card |
| `*_baseline_brightness_pct` | AL's target brightness | ✅ Zone brightness display |
| `*_effective_min_brightness_pct` | Current min limit | Info only |
| `*_effective_max_brightness_pct` | Current max limit | Info only |
| `*_manual_offset_brightness_pct` | Manual offset applied | Info only |

**MISSING from this sensor:**
- Override mode (adaptive vs manual) per zone
- Override time remaining per zone
- Column lights zone data

#### sensor.oal_system_status (Lines 2010-2038)
**Current State Values:**
- "Paused"
- "Movie Mode"
- "Isolated: Work (Office Desk)"
- Config name (when not baseline)
- "Environmental Boost"
- "Baseline Adaptation"

**Current Attributes:**
- `engine_health`: "Normal" or "Stale (>30m) - Watchdog Active"
- `active_zonal_overrides`: Count of zones with manual_control

**MISSING:**
- Which zones are overridden (only count, not names)
- Soonest reset time
- Next preset change time

#### sensor.oal_average_active_color_temperature (Lines 1980-2005)
**Status:** ✅ Complete - Provides average K for color display

#### sensor.oal_sunrise_times (Lines 2043-2057)
**Status:** ✅ Complete - Shows next Sonos-driven sunrise time

#### sensor.oal_environmental_debug (Lines 2062-2192)
**Status:** ✅ Complete - Debug info for environmental boost

### 1.4 Current Scripts Analysis

| Script | Purpose | Hero Card Use |
|--------|---------|---------------|
| `script.oal_reset_soft` | Clear manual overrides, reset to baseline | ✅ Reset button |
| `script.oal_reset_global` | Nuclear reset including env/sunset | Optional |
| `script.oal_global_manual_brighter` | Increase brightness | Zone control popup |
| `script.oal_global_manual_dimmer` | Decrease brightness | Zone control popup |
| `script.oal_global_manual_cooler` | Cooler color temp | Not needed |
| `script.oal_global_manual_warmer` | Warmer color temp | Not needed |

---

## Part 2: Data Available from Adaptive Lighting (NOT in Package)

The Adaptive Lighting integration provides these attributes on each `switch.adaptive_lighting_*` entity that ARE NOT currently exposed via template sensors:

### 2.1 Override/Manual Control Data
```json
"manual_control": ["light.entryway_lamp", "light.living_room_corner_accent", ...]
```
- **Type:** List of light entity_ids currently under manual control
- **Use:** Determine if zone is in adaptive or manual mode
- **Access:** `state_attr('switch.adaptive_lighting_main_living', 'manual_control')`

### 2.2 Autoreset Timer Data (CRITICAL DISCOVERY)
```json
"autoreset_time_remaining": {
  "light.entryway_lamp": 13528.995344,
  "light.living_room_corner_accent": 13529.010639
}
```
- **Type:** Dict of light entity_id → seconds remaining
- **Use:** Display "M 3h 45m" timer in hero card
- **Access:** `state_attr('switch.adaptive_lighting_main_living', 'autoreset_time_remaining')`

### 2.3 Current Brightness
```json
"brightness_pct": 100
```
- **Already exposed via:** `sensor.oal_real_time_monitor` attributes
- **Direct access:** `state_attr('switch.adaptive_lighting_main_living', 'brightness_pct')`

### 2.4 Current Color Temperature
```json
"color_temp_kelvin": 2910
```
- **Aggregated via:** `sensor.oal_average_active_color_temperature`
- **Direct access:** `state_attr('switch.adaptive_lighting_main_living', 'color_temp_kelvin')`

---

## Part 3: Complete Gap Analysis

### 3.1 Missing Zone: Column Lights

**Current State in HA:**
- `switch.adaptive_lighting_column_lights` - EXISTS
- `light.column_lights` - EXISTS
- `input_number.oal_manual_offset_column_lights_brightness` - EXISTS in HA

**Missing from Package:**
1. Light group definition (may not be needed if already defined elsewhere)
2. Addition to `group.oal_control_switches` (Line 69-76)
3. Addition to `light.all_adaptive_lights` group (Lines 50-66)
4. Addition to `adaptive_lighting:` section (Lines 308-392)
5. Addition to Core Engine `zone_configs` (Lines 454-503)
6. Addition to `script.oal_manual_brightness_step` parallel sequence (Lines 1627-1761)
7. Addition to `script.oal_reset_soft` entity list (Lines 1830-1841)
8. Addition to `sensor.oal_real_time_monitor` attributes (Lines 1917-1975)

### 3.2 Missing Template Sensors for Hero Card

#### Gap 3.2.1: Per-Zone Override Status Sensors
**Need 6 sensors** (one per zone) that provide:
```yaml
sensor.oal_zone_main_living_status:
  state: "A" | "M 3h 45m"
  attributes:
    mode: "adaptive" | "manual"
    brightness_pct: 100
    color_temp_kelvin: 2910
    override_seconds_remaining: 13528
    override_formatted: "3h 45m"
    lights_manual_count: 5
    lights_total: 6
```

**Why not extend existing sensor.oal_real_time_monitor?**
- Already has 25+ attributes
- Per-zone status with timers would add 6+ more complex attributes
- Separate sensors enable conditional display in cards
- State value ("A" or "M Xh Xm") is directly usable as badge text

#### Gap 3.2.2: Soonest Override Reset Sensor
**Need:** One sensor showing the next reset across all zones
```yaml
sensor.oal_soonest_override:
  state: "3h 45m" | "None"
  attributes:
    zone_id: "main_living"
    zone_friendly: "Main Living"
    reset_timestamp: 1234567890
    seconds_remaining: 13528
```

#### Gap 3.2.3: Sonos Alarm Display Sensor
**Need:** Formatted display for alarm chip
```yaml
sensor.oal_next_sonos_alarm:
  state: "7:00 AM" | "No Alarm"
  attributes:
    timestamp: 1234567890
    room: "Kitchen"
    hours_until: 8.5
```

**Why not use existing sensor.oal_sunrise_times?**
- Current sensor uses 24h format ("%H:%M")
- State includes quotes: `"No Alarm"` vs `No Alarm`
- Missing room attribution
- Could extend instead of creating new

#### Gap 3.2.4: Sonos Playing Status Sensor
**Need:** Which room(s) are playing for chip display
```yaml
sensor.sonos_playing_status:
  state: "Living Room" | "2 rooms" | "Off"
  attributes:
    playing_rooms: ["Living Room", "Kitchen"]
    coordinator: "media_player.living_room"
    is_playing: true
```

**Note:** This is Sonos-specific, NOT OAL-specific. Should be in separate package or templates.yaml.

### 3.3 Existing Sensors That Can Be Extended

#### Extend: sensor.oal_real_time_monitor
**Current lines:** 1888-1975 (88 lines)

**Add to attributes:**
```yaml
# Column lights data (to match other zones)
column_lights_baseline_brightness_pct: >
  {{ state_attr('switch.adaptive_lighting_column_lights', 'brightness_pct') | float(0) }}
column_lights_effective_min_brightness_pct: >
  {{ state_attr('switch.adaptive_lighting_column_lights', 'configuration').min_brightness }}
column_lights_effective_max_brightness_pct: >
  {{ state_attr('switch.adaptive_lighting_column_lights', 'configuration').max_brightness }}
column_lights_manual_offset_brightness_pct: >
  {{ states('input_number.oal_manual_offset_column_lights_brightness') | float(0) }}
```

#### Extend: sensor.oal_system_status
**Current lines:** 2010-2038 (29 lines)

**Add to attributes:**
```yaml
overridden_zones: >
  {% set zones = [] %}
  {% set switches = [
    ('main_living', 'switch.adaptive_lighting_main_living'),
    ('kitchen_island', 'switch.adaptive_lighting_kitchen_island'),
    ('bedroom_primary', 'switch.adaptive_lighting_bedroom_primary'),
    ('accent_spots', 'switch.adaptive_lighting_accent_spots'),
    ('recessed_ceiling', 'switch.adaptive_lighting_recessed_ceiling'),
    ('column_lights', 'switch.adaptive_lighting_column_lights')
  ] %}
  {% for zone_id, switch_id in switches %}
    {% if state_attr(switch_id, 'manual_control') | default([]) | length > 0 %}
      {% set zones = zones + [zone_id] %}
    {% endif %}
  {% endfor %}
  {{ zones }}

soonest_reset_zone: >
  {# Calculate which zone resets soonest #}
  ...

soonest_reset_time: >
  {# Formatted time until soonest reset #}
  ...
```

#### Extend: sensor.oal_sunrise_times
**Current lines:** 2043-2057 (15 lines)

**Modify state template to remove quotes and use 12h format:**
```yaml
state: >
  {% set alarm_ts = state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') %}
  {% if alarm_ts and alarm_ts | int > 0 %}
    {{ alarm_ts | timestamp_custom('%-I:%M %p', true) }}
  {% else %}
    No Alarm
  {% endif %}
```

**Add attributes:**
```yaml
room: >
  {{ state_attr('sensor.sonos_upcoming_alarms', 'rooms') | first | default('Unknown') }}
hours_until: >
  {% set alarm_ts = state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') | int(0) %}
  {% if alarm_ts > 0 %}
    {{ ((alarm_ts - now().timestamp()) / 3600) | round(1) }}
  {% else %}
    null
  {% endif %}
```

---

## Part 4: Complete Change Specification

### 4.1 Changes to group.oal_control_switches (Line 68-76)

**Current:**
```yaml
group:
  oal_control_switches:
    name: "OAL Control Switches"
    entities:
      - switch.adaptive_lighting_main_living
      - switch.adaptive_lighting_kitchen_island
      - switch.adaptive_lighting_bedroom_primary
      - switch.adaptive_lighting_accent_spots
      - switch.adaptive_lighting_recessed_ceiling
```

**Required Change:** Add column_lights
```yaml
      - switch.adaptive_lighting_column_lights
```

### 4.2 Changes to light.all_adaptive_lights (Lines 50-66)

**Required Change:** Add column lights if not present
```yaml
      - light.dining_col_accent
      - light.living_col_accent
```

### 4.3 New Adaptive Lighting Zone (After Line 392)

```yaml
  - name: "column_lights"
    lights: light.column_lights
    interval: 90
    transition: 1
    initial_transition: 3
    take_over_control: true
    detect_non_ha_changes: true
    adapt_delay: 1
    include_config_in_attributes: true
    autoreset_control_seconds: 14400
    min_brightness: 1
    max_brightness: 80
    min_color_temp: 2000
    max_color_temp: 3500
    sleep_brightness: 1
    sleep_color_temp: 2000
```

**Note:** This may conflict with existing AL config. Verify if column_lights AL is defined elsewhere.

### 4.4 Changes to Core Engine zone_configs (Lines 454-503)

**Add after recessed_ceiling (Line 503):**
```yaml
        - entity_id: switch.adaptive_lighting_column_lights
          id: column_lights
          comfort_min_b: 1
          comfort_max_b: 80
          min_k: 2000
          max_k: 3500
          env_sensitivity: 0.7
          hard_min_b: 1
          hard_max_b: 100
```

### 4.5 Changes to Core Engine per-zone manual helper (Lines 566-579)

**Add after recessed_ceiling case:**
```yaml
                  {% elif repeat.item.id == 'column_lights' %}
                    {{ states('input_number.oal_manual_offset_column_lights_brightness') | float(0) }}
```

### 4.6 Changes to script.oal_manual_brightness_step (Lines 1627-1761)

**Add new parallel sequence after Recessed Ceiling (Line 1761):**
```yaml
          # Column Lights
          - sequence:
              - variables:
                  b_base: >
                    {{ state_attr('switch.adaptive_lighting_column_lights', 'brightness_pct') | float(50) }}
                  base_step: >
                    {% if dir == 1 %}
                      {% if b_base < 30 %} 10
                      {% elif b_base < 60 %} 15
                      {% else %} 20
                      {% endif %}
                    {% else %}
                      {% if b_base < 40 %} 10
                      {% elif b_base < 70 %} 15
                      {% else %} 20
                      {% endif %}
                    {% endif %}
                  step: "{{ base_step * 0.7 }}"
                  current_offset: "{{ states('input_number.oal_manual_offset_column_lights_brightness') | float(0) }}"
                  raw_new: "{{ current_offset + (step * dir) }}"
                  new_value: "{{ [-100, [100, raw_new] | min] | max }}"
              - service: input_number.set_value
                target:
                  entity_id: input_number.oal_manual_offset_column_lights_brightness
                data:
                  value: "{{ new_value }}"
```

### 4.7 Changes to script.oal_reset_soft (Lines 1830-1841)

**Add to entity list:**
```yaml
            - input_number.oal_manual_offset_column_lights_brightness
```

### 4.8 Changes to sensor.oal_real_time_monitor (Lines 1888-1975)

**Add to zones list in state template (Line 1900-1906):**
```yaml
            states('input_number.oal_manual_offset_column_lights_brightness') | float(0)
```

**Add column_lights attributes (after Line 1975):**
```yaml
          # Column lights
          column_lights_baseline_brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'brightness_pct') | float(0) }}
          column_lights_effective_min_brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'configuration').min_brightness | default(1) }}
          column_lights_effective_max_brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'configuration').max_brightness | default(80) }}
          column_lights_manual_offset_brightness_pct: >
            {{ states('input_number.oal_manual_offset_column_lights_brightness') | float(0) }}
```

### 4.9 Extend sensor.oal_system_status (Lines 2010-2038)

**Add new attributes (after Line 2038):**
```yaml
          overridden_zones: >
            {% set zones = [] %}
            {% set ns = namespace(zones=[]) %}
            {% set switches = [
              ('main_living', 'switch.adaptive_lighting_main_living'),
              ('kitchen_island', 'switch.adaptive_lighting_kitchen_island'),
              ('bedroom_primary', 'switch.adaptive_lighting_bedroom_primary'),
              ('accent_spots', 'switch.adaptive_lighting_accent_spots'),
              ('recessed_ceiling', 'switch.adaptive_lighting_recessed_ceiling'),
              ('column_lights', 'switch.adaptive_lighting_column_lights')
            ] %}
            {% for zone_id, switch_id in switches %}
              {% if state_attr(switch_id, 'manual_control') | default([]) | length > 0 %}
                {% set ns.zones = ns.zones + [zone_id] %}
              {% endif %}
            {% endfor %}
            {{ ns.zones }}

          soonest_reset_formatted: >
            {% set all_times = [] %}
            {% set ns = namespace(times=[]) %}
            {% set switches = [
              ('main_living', 'switch.adaptive_lighting_main_living'),
              ('kitchen_island', 'switch.adaptive_lighting_kitchen_island'),
              ('bedroom_primary', 'switch.adaptive_lighting_bedroom_primary'),
              ('accent_spots', 'switch.adaptive_lighting_accent_spots'),
              ('recessed_ceiling', 'switch.adaptive_lighting_recessed_ceiling'),
              ('column_lights', 'switch.adaptive_lighting_column_lights')
            ] %}
            {% for zone_id, switch_id in switches %}
              {% set times = state_attr(switch_id, 'autoreset_time_remaining') | default({}) %}
              {% for light, secs in times.items() %}
                {% set ns.times = ns.times + [{'zone': zone_id, 'secs': secs}] %}
              {% endfor %}
            {% endfor %}
            {% if ns.times | length > 0 %}
              {% set soonest = ns.times | sort(attribute='secs') | first %}
              {% set hours = (soonest.secs / 3600) | int %}
              {% set minutes = ((soonest.secs % 3600) / 60) | int %}
              {% if hours > 0 %}{{ hours }}h {{ minutes }}m{% else %}{{ minutes }}m{% endif %}
            {% else %}
              None
            {% endif %}

          soonest_reset_zone: >
            {% set ns = namespace(times=[]) %}
            {% set switches = [
              ('Main Living', 'switch.adaptive_lighting_main_living'),
              ('Kitchen', 'switch.adaptive_lighting_kitchen_island'),
              ('Bedroom', 'switch.adaptive_lighting_bedroom_primary'),
              ('Spots', 'switch.adaptive_lighting_accent_spots'),
              ('Ceiling', 'switch.adaptive_lighting_recessed_ceiling'),
              ('Columns', 'switch.adaptive_lighting_column_lights')
            ] %}
            {% for zone_name, switch_id in switches %}
              {% set times = state_attr(switch_id, 'autoreset_time_remaining') | default({}) %}
              {% for light, secs in times.items() %}
                {% set ns.times = ns.times + [{'zone': zone_name, 'secs': secs}] %}
              {% endfor %}
            {% endfor %}
            {% if ns.times | length > 0 %}
              {{ (ns.times | sort(attribute='secs') | first).zone }}
            {% else %}
              None
            {% endif %}
```

### 4.10 Modify sensor.oal_sunrise_times (Lines 2043-2057)

**Replace entire sensor:**
```yaml
      - name: "OAL Sunrise Times"
        unique_id: oal_sunrise_times_v13
        icon: mdi:weather-sunset-up
        availability: >
          {{ has_value('sensor.sonos_upcoming_alarms') }}
        state: >
          {% set alarm_ts = state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') %}
          {% if alarm_ts and alarm_ts | int > 0 %}
            {{ alarm_ts | timestamp_custom('%-I:%M %p', true) }}
          {% else %}
            No Alarm
          {% endif %}
        attributes:
          timestamp: >
            {{ state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') | default(none) }}
          room: >
            {% set rooms = state_attr('sensor.sonos_upcoming_alarms', 'rooms') | default([]) %}
            {{ rooms | first | default('Unknown') if rooms else 'Unknown' }}
          hours_until: >
            {% set alarm_ts = state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') %}
            {% if alarm_ts and alarm_ts | int > 0 %}
              {{ ((alarm_ts | int - now().timestamp()) / 3600) | round(1) }}
            {% else %}
              null
            {% endif %}
          last_processed_alarm: >
            {{ state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') | default('', true) }}
```

### 4.11 NEW: Per-Zone Override Status Sensors (After Line 2192)

Add 6 new template sensors:

```yaml
      # -----------------------------------------------------------------------
      # 6.6 Per-Zone Override Status (for Hero Card)
      # -----------------------------------------------------------------------
      - name: "OAL Zone Main Living Status"
        unique_id: oal_zone_main_living_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_main_living', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_main_living') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_main_living', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_main_living', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_main_living', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_main_living', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_main_living', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_main_living', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_main_living', 'manual_control') | default([]) | length }}
          lights_total: 6

      - name: "OAL Zone Kitchen Status"
        unique_id: oal_zone_kitchen_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_kitchen_island', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_kitchen_island') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_kitchen_island', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_kitchen_island', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_kitchen_island', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_kitchen_island', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_kitchen_island', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_kitchen_island', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_kitchen_island', 'manual_control') | default([]) | length }}
          lights_total: 1

      - name: "OAL Zone Bedroom Status"
        unique_id: oal_zone_bedroom_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_bedroom_primary', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_bedroom_primary') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_bedroom_primary', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_bedroom_primary', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_bedroom_primary', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_bedroom_primary', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_bedroom_primary', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_bedroom_primary', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_bedroom_primary', 'manual_control') | default([]) | length }}
          lights_total: 2

      - name: "OAL Zone Spots Status"
        unique_id: oal_zone_spots_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_accent_spots', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_accent_spots') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_accent_spots', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_accent_spots', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_accent_spots', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_accent_spots', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_accent_spots', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_accent_spots', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_accent_spots', 'manual_control') | default([]) | length }}
          lights_total: 2

      - name: "OAL Zone Ceiling Status"
        unique_id: oal_zone_ceiling_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_recessed_ceiling', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_recessed_ceiling') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_recessed_ceiling', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_recessed_ceiling', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_recessed_ceiling', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_recessed_ceiling', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_recessed_ceiling', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_recessed_ceiling', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_recessed_ceiling', 'manual_control') | default([]) | length }}
          lights_total: 2

      - name: "OAL Zone Columns Status"
        unique_id: oal_zone_columns_status_v13
        icon: >
          {{ 'mdi:hand-back-left' if state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) | length > 0 else 'mdi:refresh-auto' }}
        availability: >
          {{ states('switch.adaptive_lighting_column_lights') not in ['unknown', 'unavailable'] }}
        state: >
          {% set manual = state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) %}
          {% if manual | length > 0 %}
            {% set times = state_attr('switch.adaptive_lighting_column_lights', 'autoreset_time_remaining') | default({}) %}
            {% if times.values() | list | length > 0 %}
              {% set min_time = times.values() | list | min %}
              {% set hours = (min_time / 3600) | int %}
              {% set minutes = ((min_time % 3600) / 60) | int %}
              M {% if hours > 0 %}{{ hours }}h {% endif %}{{ minutes }}m
            {% else %}
              M
            {% endif %}
          {% else %}
            A
          {% endif %}
        attributes:
          mode: >
            {{ 'manual' if state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) | length > 0 else 'adaptive' }}
          brightness_pct: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'brightness_pct') | default(0) }}
          color_temp_kelvin: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'color_temp_kelvin') | default(3000) }}
          override_seconds: >
            {% set times = state_attr('switch.adaptive_lighting_column_lights', 'autoreset_time_remaining') | default({}) %}
            {{ times.values() | list | min | default(0) | int if times else 0 }}
          lights_manual: >
            {{ state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) | length }}
          lights_total: 2
```

### 4.12 NEW: Sonos Playing Status Sensor (Separate from OAL Package)

This should be in a separate Sonos package or `templates.yaml`:

```yaml
      - name: "Sonos Playing Status"
        unique_id: sonos_playing_status_v1
        icon: mdi:speaker-wireless
        state: >
          {% set players = [
            states.media_player.living_room,
            states.media_player.kitchen,
            states.media_player.bedroom,
            states.media_player.bath,
            states.media_player.dining_room
          ] | selectattr('state', 'defined') | list %}
          {% set playing = players | selectattr('state', 'eq', 'playing') | list %}
          {% if playing | length == 0 %}
            Off
          {% elif playing | length == 1 %}
            {{ playing[0].name | replace(' Sonos', '') | replace(' TV Sonos Soundbar', 'Living') }}
          {% else %}
            {{ playing | length }} rooms
          {% endif %}
        attributes:
          playing_rooms: >
            {% set players = [
              states.media_player.living_room,
              states.media_player.kitchen,
              states.media_player.bedroom,
              states.media_player.bath,
              states.media_player.dining_room
            ] | selectattr('state', 'defined') | list %}
            {{ players | selectattr('state', 'eq', 'playing') | map(attribute='name') | list }}
          is_playing: >
            {% set players = [
              states.media_player.living_room,
              states.media_player.kitchen,
              states.media_player.bedroom,
              states.media_player.bath,
              states.media_player.dining_room
            ] | selectattr('state', 'defined') | list %}
            {{ players | selectattr('state', 'eq', 'playing') | list | length > 0 }}
```

---

## Part 5: Summary Checklist

### 5.1 Package Modifications (Existing Code)

| Section | Line Numbers | Change Type | Priority |
|---------|--------------|-------------|----------|
| group.oal_control_switches | 68-76 | Add column_lights | HIGH |
| light.all_adaptive_lights | 50-66 | Add column light entities | HIGH |
| Core Engine zone_configs | 454-503 | Add column_lights zone | HIGH |
| Core Engine per_zone_manual_helper | 566-579 | Add column_lights case | HIGH |
| script.oal_manual_brightness_step | 1627-1761 | Add column_lights parallel | MEDIUM |
| script.oal_reset_soft | 1830-1841 | Add column_lights input | MEDIUM |
| sensor.oal_real_time_monitor state | 1900-1906 | Add column_lights offset | MEDIUM |
| sensor.oal_real_time_monitor attrs | 1917-1975 | Add column_lights data | MEDIUM |
| sensor.oal_system_status | 2010-2038 | Add override zone tracking | HIGH |
| sensor.oal_sunrise_times | 2043-2057 | Fix format, add attributes | HIGH |

### 5.2 New Additions

| Addition | Type | Priority | Location |
|----------|------|----------|----------|
| Per-zone status sensors (6) | Template Sensor | HIGH | After line 2192 |
| Sonos playing status | Template Sensor | MEDIUM | Separate package |
| Column lights AL zone | Adaptive Lighting | LOW | Verify if needed |

### 5.3 Entities for Hero Card

| UI Element | Entity | Data Source |
|------------|--------|-------------|
| Scene selector | `input_select.oal_active_configuration` | Direct |
| All lights toggle | `light.all_adaptive_lights` | Direct |
| Reset button | `script.oal_reset_soft` | Direct |
| Zone brightness | `sensor.oal_zone_*_status` attr `brightness_pct` | New sensor |
| Zone mode badge | `sensor.oal_zone_*_status` state | New sensor |
| TV chip | `media_player.living_room_samsung_q60` | Direct |
| Sonos chip | `sensor.sonos_playing_status` | New sensor |
| Alarm chip | `sensor.oal_sunrise_times` | Modified existing |
| Weather modifier | `input_number.oal_offset_environmental_brightness` | Direct |
| Soonest reset | `sensor.oal_system_status` attr `soonest_reset_formatted` | Extended existing |
| Temperature | `sensor.dining_room_temperature` | Direct |

---

## Part 6: Implementation Order

1. **Phase 1: Column Lights Integration** (HIGH PRIORITY)
   - Add to group.oal_control_switches
   - Add to Core Engine zone_configs
   - Add to per_zone_manual_helper
   - Test that Column Lights participates in OAL properly

2. **Phase 2: Extend Existing Sensors** (HIGH PRIORITY)
   - Extend sensor.oal_system_status with override tracking
   - Modify sensor.oal_sunrise_times for better alarm display
   - Add column_lights data to sensor.oal_real_time_monitor

3. **Phase 3: Add Per-Zone Status Sensors** (HIGH PRIORITY)
   - Add 6 new template sensors for zone override status
   - Test that timer countdown displays correctly

4. **Phase 4: Add Supporting Sensors** (MEDIUM PRIORITY)
   - Add Sonos playing status sensor (separate package)
   - Update scripts for column_lights support

5. **Phase 5: Dashboard Implementation** (AFTER ALL ABOVE)
   - Build hero card using verified entity data
