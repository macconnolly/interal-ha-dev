# OAL System Technical Requirements & Implementation Request

## Document Purpose

This document provides complete technical specifications for enhancing the OAL (Optimized Adaptive Lighting) system in Home Assistant. The primary goal is **dashboard enablement** - creating sensors and attributes that expose OAL's internal state in formats consumable by Lovelace cards.

**Target Agent:** Claude Code (or equivalent) with access to:
- Home Assistant MCP tools
- File system access to `packages/OAL_lighting_control_package.yaml`
- Ability to create/modify template sensors, automations, and scripts

**Deliverables:**
1. Gap remediation (new sensors, extended attributes)
2. Dashboard-ready entity specifications
3. New automation logic for user notifications
4. Implementation plan with YAML code

---

## System Context

### What is OAL?

OAL (Optimized Adaptive Lighting) is a Home Assistant package that orchestrates the [Adaptive Lighting integration](https://github.com/basnijholt/adaptive-lighting) across 6 lighting zones (15 total lights). It provides:

- **Zonal control:** 6 zones with independent brightness/color temp targets
- **Scene presets:** 5 configurations (Baseline, Reduced Overhead, Evening Relax, Accents Only, Global Manual)
- **Override management:** Detects manual changes, tracks timeout until auto-reset
- **Environmental adaptation:** Weather-based brightness modifiers
- **Time-based adaptation:** Sunrise/sunset curves, sleep mode scheduling
- **Physical controller integration:** Zen32 scene controllers for preset switching

### Dashboard Requirements

We are building a **hero card** for the main dashboard that serves as a room control center:

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                             │
│ [📺 TV] [🔊 Sonos] [⏰ Alarm]    [☀️+10%] [🌆+5%]    71°F          │
│                                                                     │
│ SCENE BAR                                                           │
│ Scene: [Evening Dim ▼]                    [💡 All] [↻ Reset]       │
├─────────────────────────────────────────────────────────────────────┤
│ ZONE CARDS                                                          │
│ ┌──────────┐    ┌──────────┐    ┌──────────┐                       │
│ │ LIVING   │    │ KITCHEN  │    │ BEDROOM  │                       │
│ │   91%    │    │   45%    │    │   40%    │                       │
│ │    A     │    │    A     │    │  M 23m   │  ← Mode badge         │
│ │ ▰▰▰▰▰▰▱▱ │    │ ▰▰▰▰▱▱▱▱ │    │ ▰▰▰▱▱▱▱▱ │  ← Slider with marker │
│ └──────────┘    └──────────┘    └──────────┘                       │
├─────────────────────────────────────────────────────────────────────┤
│ FOOTER                                                              │
│ Bedroom resets in 23m  │  Night Mode in 1h 15m  │  System: Normal  │
└─────────────────────────────────────────────────────────────────────┘
```

Additionally, we need **per-area cards** throughout the dashboard that show:
- Current brightness with a visual marker if boosted/dimmed from baseline
- Mode indicator (Adaptive / Manual / Preset override)
- Quick access to zone-specific controls

---

## Use Cases

### UC-01: Zone Mode Display
**User Story:** "I want to see at a glance which zones are under OAL control vs manually overridden."

**Display:** Mode badge on each zone card
- `A` = Adaptive (OAL controlling)
- `M 23m` = Manual override, resets in 23 minutes
- `M` = Manual override, no timer / indefinite

**Technical Basis:**
- Source: `switch.adaptive_lighting_*.manual_control` (list of overridden lights)
- Source: `switch.adaptive_lighting_*.autoreset_time_remaining` (dict of light → seconds)
- Transform: If `manual_control` length > 0, format min timer as "Xh Ym"

**Gap:** No sensor exists with pre-formatted output. Dashboard must do complex Jinja2 inline.

---

### UC-02: Override Timer Countdown
**User Story:** "I want to see how long until my manual adjustment resets back to adaptive."

**Display:** "23m" or "3h 45m" countdown per zone

**Technical Basis:**
- Source: `switch.adaptive_lighting_*.autoreset_time_remaining`
- Format: `{"light.entity": 14148.518962}` (seconds per light)
- Logic: Take minimum across all lights in zone, format as human-readable

**Gap:** Raw seconds available but no formatted sensor.

---

### UC-03: Soonest System Reset
**User Story:** "I want to know which zone will reset soonest and when."

**Display:** Footer text: "Bedroom resets in 23m"

**Technical Basis:**
- Must iterate all 6 AL switches
- Find minimum `autoreset_time_remaining` across all zones
- Return zone name + formatted time

**Gap:** No aggregated sensor. Currently requires 6 entity checks.

---

### UC-04: Current Scene/Preset Display
**User Story:** "I want to see which lighting configuration is active."

**Display:** Scene selector showing "Evening Relax" (parsed from full option text)

**Technical Basis:**
- Source: `input_select.oal_active_configuration`
- Current format: "Config 3: Evening Relax"
- Desired format: "Evening Relax" (strip prefix)

**Gap:** Minor - just needs regex in template or UI.

---

### UC-05: Global Brightness Offset Display
**User Story:** "I want to see if the system is running brighter or dimmer than baseline."

**Display:** Badge showing "+15%" or "-10%" or "Baseline"

**Technical Basis:**
- Sum of all offset input_numbers:
  - `input_number.oal_offset_global_manual_brightness`
  - `input_number.oal_offset_config_brightness`
  - `input_number.oal_offset_environmental_brightness`
  - `input_number.oal_offset_sunset_brightness`

**Gap:** No aggregated sensor. Must sum 4+ entities.

---

### UC-06: Active Modifier Badges
**User Story:** "I want to see what factors are affecting current brightness (weather, sunset, etc.)."

**Display:** Chips like `[☀️ Snow +10%]` `[🌆 Sunset +5%]`

**Technical Basis:**
- Check each offset input_number
- If non-zero, create badge with contextual name
- Weather name from `weather.home` state

**Gap:** No structured `active_modifiers[]` array sensor.

---

### UC-07: Brightness Explainability
**User Story:** "Why is my living room at 85%? I want to see the breakdown."

**Display:** Expandable/tooltip showing:
```
Base adaptive: 70%
+ Snow reflection: +10%
+ Evening comfort: +5%
= Target: 85%
```

**Technical Basis:**
- `brightness_base`: From `sensor.oal_real_time_monitor.[zone]_baseline_brightness_pct`
- `brightness_target`: From `switch.adaptive_lighting_*.brightness_pct`
- Individual modifiers: From respective offset input_numbers

**Gap:** Data scattered across multiple entities. No unified breakdown sensor.

---

### UC-08: Slider Position Marker
**User Story:** "On the brightness slider, show me where the baseline is vs current."

**Display:** Slider with a tick mark showing adaptive baseline position

**Technical Basis:**
- Current: `switch.adaptive_lighting_*.brightness_pct`
- Baseline: `sensor.oal_real_time_monitor.[zone]_baseline_brightness_pct`
- If current ≠ baseline, show marker at baseline position

**Gap:** Requires both values exposed and accessible to card. Baseline exists but may not be in convenient format.

---

### UC-09: Media Integration Chips
**User Story:** "Show me TV status, Sonos playing, and next alarm on the lighting card."

**Display:** Conditional chips in top bar

**Technical Basis:**
- TV: `media_player.living_room_samsung_q60` (show when state ≠ "off")
- Sonos: `sensor.sonos_current_playing_group_coordinator` (show when ≠ "none")
- Alarm: `sensor.soonest_sonos_alarm_info` (show when ≠ "unknown")

**Gap:** ✅ NO GAP - Entities exist and are ready.

---

### UC-10: System Health/Status
**User Story:** "Is OAL running normally? Is it paused? Is movie mode on?"

**Display:** Status indicator or chips for special modes

**Technical Basis:**
- Paused: `input_boolean.oal_system_paused`
- Movie mode: `input_boolean.oal_movie_mode_active`
- Work mode: `input_select.oal_isolated_override_mode`
- Engine health: `sensor.oal_system_status.engine_health`

**Gap:** Entities exist but not aggregated into system state.

---

### UC-11: Area Card Mode Indicator
**User Story:** "On individual room cards, show if that room is manually controlled."

**Display:** Small icon/badge on room card (e.g., hand icon for manual)

**Technical Basis:**
- Need per-zone `mode` attribute: "adaptive" | "manual" | "preset_override"
- Need to know if zone offset ≠ 0 (boosted/dimmed)

**Gap:** No per-zone sensor with mode enum.

---

### UC-12: Manual Override Notification
**User Story:** "After sunset, remind me that lights are still manually controlled and offer to reset."

**Display:** Mobile notification with actionable button

**Technical Basis:**
- Trigger: Sun below horizon + zone(s) in manual mode
- Delay: X minutes after sunset (configurable)
- Action: "Reset to Adaptive" button calls `script.oal_reset_soft`

**Gap:** Automation does not exist. Similar pattern exists for Sonos alarms.

---

### UC-13: Next Preset Transition
**User Story:** "When will the lighting automatically change to the next preset?"

**Display:** "Night Mode in 1h 15m"

**Technical Basis:**
- Would require parsing automation schedules
- Or explicit `input_datetime` for next transition

**Gap:** COMPLEX - Presets are triggered by Zen32 or manual selection, not scheduled. May not be feasible without architecture change.

**Question:** Are there any automations that change `input_select.oal_active_configuration` on a schedule? If so, we could parse their triggers.

---

### UC-14: Per-Light Override Status
**User Story:** "Which specific lights in a zone are overridden?"

**Display:** Detailed view showing "3 of 6 lights manual"

**Technical Basis:**
- Source: `switch.adaptive_lighting_*.manual_control` (list of entity_ids)
- Source: `switch.adaptive_lighting_*.configuration.lights` (total lights)

**Gap:** Data exists but not in user-friendly sensor format.

---

### UC-15: Color Temperature Display
**User Story:** "What color temperature is the zone at? Show it visually."

**Display:** Icon tint (warm orange → cool white) based on Kelvin

**Technical Basis:**
- Source: `switch.adaptive_lighting_*.color_temp_kelvin`
- Map: 2700K = warm amber, 4000K = neutral, 5500K+ = cool white

**Gap:** ✅ NO GAP - Attribute exists. Just needs UI implementation.

---

## Current Entity Inventory

### Entities That EXIST and Are READY

| Entity | Purpose | Attributes Available |
|--------|---------|---------------------|
| `switch.adaptive_lighting_main_living` | Zone 1 AL switch | brightness_pct, color_temp_kelvin, manual_control[], autoreset_time_remaining{}, configuration{} |
| `switch.adaptive_lighting_kitchen_island` | Zone 2 AL switch | Same as above |
| `switch.adaptive_lighting_bedroom_primary` | Zone 3 AL switch | Same as above |
| `switch.adaptive_lighting_accent_spots` | Zone 4 AL switch | Same as above |
| `switch.adaptive_lighting_recessed_ceiling` | Zone 5 AL switch | Same as above |
| `switch.adaptive_lighting_column_lights` | Zone 6 AL switch | Same as above |
| `input_number.oal_offset_global_manual_brightness` | Global brightness offset | state (float) |
| `input_number.oal_offset_config_brightness` | Config-based offset | state (float) |
| `input_number.oal_offset_environmental_brightness` | Weather offset | state (float) |
| `input_number.oal_offset_sunset_brightness` | Sunset curve offset | state (float) |
| `input_number.oal_manual_offset_*_brightness` (6x) | Per-zone manual offsets | state (float) |
| `input_select.oal_active_configuration` | Scene preset selector | options[], state |
| `input_boolean.oal_system_paused` | System pause toggle | state |
| `input_boolean.oal_movie_mode_active` | Movie mode toggle | state |
| `input_select.oal_isolated_override_mode` | Work mode selector | state (Off/Work) |
| `sensor.oal_real_time_monitor` | Zone monitoring | [zone]_baseline_brightness_pct, [zone]_target_brightness, etc. |
| `sensor.oal_system_status` | System status | engine_health, active_zonal_overrides |
| `light.all_adaptive_lights` | Master light group | state, brightness |
| `script.oal_reset_soft` | Soft reset script | - |
| `media_player.living_room_samsung_q60` | TV entity | state |
| `sensor.sonos_current_playing_group_coordinator` | Sonos playing | state |
| `sensor.soonest_sonos_alarm_info` | Next alarm | state |

### Entities That MUST BE CREATED

| Entity | Purpose | Priority |
|--------|---------|----------|
| `sensor.oal_zone_main_living` | Zone 1 dashboard sensor | HIGH |
| `sensor.oal_zone_kitchen_island` | Zone 2 dashboard sensor | HIGH |
| `sensor.oal_zone_bedroom_primary` | Zone 3 dashboard sensor | HIGH |
| `sensor.oal_zone_accent_spots` | Zone 4 dashboard sensor | HIGH |
| `sensor.oal_zone_recessed_ceiling` | Zone 5 dashboard sensor | HIGH |
| `sensor.oal_zone_column_lights` | Zone 6 dashboard sensor | HIGH |
| `sensor.oal_global_brightness_offset` | Global offset display | HIGH |

### Entities That MUST BE EXTENDED

| Entity | Current Attributes | Required Additions |
|--------|-------------------|-------------------|
| `sensor.oal_system_status` | engine_health, active_zonal_overrides | zones_adaptive, overridden_zones[], soonest_reset_zone, soonest_reset_formatted, current_preset, active_modifiers[], total_modification, sun_phase, weather_modifier_active, weather_modifier_value, system_paused, movie_mode_active |

---

## Detailed Gap Analysis

### GAP-01: Per-Zone Dashboard Sensors (CRITICAL)

**Current State:** No `sensor.oal_zone_*` entities exist.

**Required Sensor Specification:**

```yaml
sensor.oal_zone_[zone_name]:
  state: "A" | "M" | "M Xh Ym"  # Mode badge text
  attributes:
    mode: "adaptive" | "manual"
    brightness_target: 0-100  # What AL is targeting
    brightness_base: 0-100    # Pure adaptive baseline
    brightness_offset: -50 to +50  # Zone-specific offset
    override_remaining_seconds: int
    override_remaining_formatted: "Xh Ym" | "N/A"
    lights_overridden: int
    lights_total: int
    color_temp_kelvin: int
    modifiers: [
      {name: "Global Manual", value: +10},
      {name: "Snow", value: +5},
      ...
    ]
    total_modification: int  # Sum of all modifiers
```

**Implementation Notes:**
- Create 6 sensors (one per zone)
- Use Jinja2 templates to aggregate data from AL switches + input_numbers
- Format timer from seconds to human-readable

---

### GAP-02: Global Brightness Offset Sensor (HIGH)

**Current State:** No aggregated global offset sensor.

**Required Sensor Specification:**

```yaml
sensor.oal_global_brightness_offset:
  state: "+15%" | "-10%" | "Baseline"
  attributes:
    global_manual_offset: int
    config_offset: int
    environmental_offset: int
    sunset_offset: int
    total: int
    average_zone_brightness: int  # Average across 6 zones
    current_config: "Evening Relax"  # Parsed preset name
```

---

### GAP-03: System Status Extensions (MEDIUM)

**Current State:** `sensor.oal_system_status` has only:
- engine_health: "Normal"
- active_zonal_overrides: 5

**Required Additions:**

| Attribute | Type | Source |
|-----------|------|--------|
| zones_adaptive | int | 6 - active_zonal_overrides |
| overridden_zones | list[str] | Iterate AL switches, check manual_control |
| soonest_reset_zone | str | Zone with min autoreset_time_remaining |
| soonest_reset_formatted | str | Formatted time "Xh Ym" |
| soonest_reset_seconds | int | Raw seconds for calculations |
| current_preset | str | Parsed from input_select |
| active_modifiers | list[dict] | Non-zero offsets with names |
| total_modification | int | Sum of all offsets |
| sun_phase | str | "night" / "dawn" / "morning" / "day" / "evening" / "dusk" |
| weather_modifier_active | bool | environmental_offset ≠ 0 |
| weather_modifier_value | int | environmental_offset value |
| system_paused | bool | From input_boolean |
| movie_mode_active | bool | From input_boolean |
| isolated_mode | str | From input_select |

---

### GAP-04: Manual Override Notification Automation (NEW)

**Current State:** No automation for post-sunset override reminder.

**Required Automation Specification:**

```yaml
automation:
  alias: "OAL: Post-Sunset Manual Override Reminder"
  trigger:
    - platform: state
      entity_id: sun.sun
      to: "below_horizon"
      for: "00:30:00"  # 30 min after sunset
  condition:
    - condition: numeric_state
      entity_id: sensor.oal_system_status
      attribute: active_zonal_overrides
      above: 0
    - condition: state
      entity_id: input_boolean.oal_system_paused
      state: "off"
  action:
    - service: notify.mobile_app_[device]
      data:
        title: "Lights Still Manual"
        message: >
          {{ state_attr('sensor.oal_system_status', 'overridden_zones') | join(', ') }} 
          {{ 'is' if state_attr('sensor.oal_system_status', 'overridden_zones') | length == 1 else 'are' }} 
          still manually controlled. Reset to adaptive?
        data:
          actions:
            - action: "RESET_LIGHTS"
              title: "Reset to Adaptive"
            - action: "DISMISS"
              title: "Keep Manual"
```

**Companion Automation for Action Response:**

```yaml
automation:
  alias: "OAL: Handle Override Reminder Response"
  trigger:
    - platform: event
      event_type: mobile_app_notification_action
      event_data:
        action: "RESET_LIGHTS"
  action:
    - service: script.oal_reset_soft
```

**Reference:** Similar pattern exists in `packages/sonos_package.yaml` for alarm notifications.

---

### GAP-05: Brightness Baseline Marker Data (MEDIUM)

**Current State:** Baseline brightness exists in `sensor.oal_real_time_monitor` attributes but naming is inconsistent.

**Required Investigation:**
1. Confirm attribute naming pattern: `[zone]_baseline_brightness_pct`
2. Verify all 6 zones have baseline attributes
3. Determine if baseline updates in real-time or is static

**For Dashboard Slider Marker:**
- Need both `brightness_target` and `brightness_base` exposed per zone
- Marker position = `brightness_base`
- Slider thumb position = `brightness_target`
- If different, show marker as reference point

---

## Questions Requiring Investigation

### Q1: Preset Transition Scheduling
**Question:** Are there automations that change `input_select.oal_active_configuration` on a schedule?

**Why It Matters:** UC-13 (Next Preset Transition) requires knowing when presets will change.

**Investigation Path:**
```python
ha_deep_search(query="oal_active_configuration", search_types=["automation"])
ha_deep_search(query="input_select", search_types=["automation"])
```

**If Found:** Parse automation triggers to expose next transition time.
**If Not Found:** Feature not feasible without architecture change.

---

### Q2: Sleep Mode Integration
**Question:** How do the `switch.adaptive_lighting_sleep_mode_*` entities interact with the main AL switches?

**Why It Matters:** Sleep mode may affect brightness calculations in ways not captured by offset sensors.

**Investigation Path:**
```python
ha_get_state("switch.adaptive_lighting_sleep_mode_main_living")
ha_deep_search(query="sleep_mode", search_types=["automation", "script"])
```

---

### Q3: Nightly Maintenance Reset
**Question:** What does the `oal_v13_nightly_maintenance_clear_stuck_manual` automation do?

**Why It Matters:** May provide a "system reset time" for UC-03 (scheduled full reset).

**Investigation Path:**
```python
ha_config_get_automation("oal_v13_nightly_maintenance_clear_stuck_manual")
```

---

### Q4: Real-Time Monitor Attribute Coverage
**Question:** Does `sensor.oal_real_time_monitor` have baseline attributes for all 6 zones including column_lights?

**Why It Matters:** UC-08 (Slider Marker) requires baseline for each zone.

**Investigation Path:**
```python
ha_get_state("sensor.oal_real_time_monitor")
# Check for: column_lights_baseline_brightness_pct
```

---

### Q5: Override Detection Mechanism
**Question:** How does OAL detect when a light is manually adjusted?

**Why It Matters:** Understanding the mechanism helps ensure timer accuracy and may reveal edge cases.

**Investigation Path:**
- Check AL integration documentation
- Review `detect_non_ha_changes` configuration option
- Review automations that set manual_control state

---

### Q6: Environmental Offset Source
**Question:** What automation/logic sets `input_number.oal_offset_environmental_brightness`?

**Why It Matters:** Needed to create accurate modifier badges (e.g., "Snow +10%" vs generic "Weather +10%").

**Investigation Path:**
```python
ha_deep_search(query="oal_offset_environmental", search_types=["automation"])
```

---

## Additional Logical Functionality Recommendations

### REC-01: Override Expiring Soon Warning
**Trigger:** Zone timer < 5 minutes remaining
**Action:** Flash zone card or show warning icon
**Implementation:** Template sensor with `override_expiring_soon: true` when < 300 seconds

---

### REC-02: All Zones Manual Alert
**Trigger:** All 6 zones in manual mode simultaneously
**Action:** Prominent banner or notification
**Rationale:** Likely indicates system issue or user forgot to reset
**Implementation:** Condition in system_status sensor: `all_zones_manual: true`

---

### REC-03: Brightness Deviation Alert
**Trigger:** Actual brightness differs from target by > 10% for > 5 minutes
**Action:** Health warning in system status
**Rationale:** May indicate unresponsive lights or integration issue
**Implementation:** Template sensor comparing target vs actual (requires actual brightness query)

---

### REC-04: Movie Mode Auto-Disable
**Trigger:** TV turns off + movie mode active
**Action:** Disable movie mode after X minutes
**Rationale:** User may forget to disable movie mode
**Implementation:** Automation watching `media_player.living_room_samsung_q60`

---

### REC-05: Config Change Confirmation
**Trigger:** `input_select.oal_active_configuration` changes
**Action:** Brief notification showing new config name
**Rationale:** Confirms Zen32 button press was registered
**Implementation:** Simple automation with notify service

---

## Dashboard Sensor Requirements Summary

### Main Hero Card Needs

| UI Element | Sensor/Entity | Attribute |
|------------|---------------|-----------|
| Zone mode badge | `sensor.oal_zone_*` | `state` ("A" / "M 23m") |
| Zone brightness | `sensor.oal_zone_*` | `brightness_target` |
| Zone baseline marker | `sensor.oal_zone_*` | `brightness_base` |
| Global offset badge | `sensor.oal_global_brightness_offset` | `state` ("+15%") |
| Modifier chips | `sensor.oal_system_status` | `active_modifiers[]` |
| Scene selector | `input_select.oal_active_configuration` | Direct |
| Footer: soonest reset | `sensor.oal_system_status` | `soonest_reset_formatted`, `soonest_reset_zone` |
| System status | `sensor.oal_system_status` | `engine_health`, `system_paused`, `movie_mode_active` |

### Per-Area Card Needs

| UI Element | Sensor/Entity | Attribute |
|------------|---------------|-----------|
| Mode indicator icon | `sensor.oal_zone_*` | `mode` ("adaptive" / "manual") |
| Boosted/dimmed marker | `sensor.oal_zone_*` | `total_modification` (≠ 0 = show marker) |
| Brightness with baseline | `sensor.oal_zone_*` | `brightness_target`, `brightness_base` |
| Timer countdown | `sensor.oal_zone_*` | `override_remaining_formatted` |

### Visual Indicators Specification

| Condition | Visual Treatment |
|-----------|------------------|
| Zone adaptive | No badge or subtle "A" |
| Zone manual with timer | Hand icon + "23m" countdown |
| Zone manual no timer | Hand icon, no countdown |
| Zone boosted (offset > 0) | Upward arrow marker on slider |
| Zone dimmed (offset < 0) | Downward arrow marker on slider |
| Baseline ≠ current | Tick mark on slider at baseline position |
| Movie mode active | Film icon chip |
| System paused | Pause icon, cards dimmed |

---

## Implementation Request

### Phase 1: Investigation (Before Coding)

1. **Verify real_time_monitor attributes** - Confirm all 6 zones have baseline data
2. **Check preset automation schedules** - Determine if next_preset feature is feasible
3. **Review nightly maintenance** - Get scheduled reset time if available
4. **Trace environmental offset** - Find automation that sets weather modifier

### Phase 2: Core Sensor Creation

1. **Create 6 per-zone sensors** (`sensor.oal_zone_*`)
   - Full attribute set as specified in GAP-01
   - Test with current system state

2. **Create global offset sensor** (`sensor.oal_global_brightness_offset`)
   - Aggregate all offset input_numbers
   - Format as "+X%" / "-X%" / "Baseline"

3. **Extend system status sensor** (`sensor.oal_system_status`)
   - Add 12+ new attributes as specified in GAP-03
   - Maintain backward compatibility with existing attributes

### Phase 3: Notification Automation

1. **Create post-sunset override reminder**
   - With actionable notification
   - Test on mobile device

2. **Create action handler automation**
   - Respond to notification button press

### Phase 4: Documentation & Testing

1. **Update package documentation**
2. **Create entity reference for dashboard developers**
3. **Test all sensors with various system states**
   - All zones adaptive
   - Mixed override states
   - All zones manual
   - Movie mode active
   - System paused

---

## File Locations

| File | Purpose | Changes Required |
|------|---------|------------------|
| `packages/OAL_lighting_control_package.yaml` | Main OAL package | Add sensors, extend existing, add automations |
| `packages/sonos_package.yaml` | Reference for notification pattern | Read-only reference |

---

## Success Criteria

1. ✅ All 6 `sensor.oal_zone_*` sensors created and updating
2. ✅ `sensor.oal_global_brightness_offset` shows correct aggregated value
3. ✅ `sensor.oal_system_status` has all 15+ required attributes
4. ✅ Post-sunset notification fires correctly with actionable button
5. ✅ Dashboard can display mode badges without inline Jinja2
6. ✅ Slider baseline markers have required data
7. ✅ Documentation updated with new entity reference

---

## Appendix: Existing AL Switch Attribute Reference

From MCP query of `switch.adaptive_lighting_column_lights`:

```json
{
  "state": "on",
  "attributes": {
    "brightness_pct": 80,
    "color_temp_kelvin": 3200,
    "manual_control": ["light.dining_col_accent", "light.living_col_accent"],
    "autoreset_time_remaining": {
      "light.dining_col_accent": 2609.571605,
      "light.living_col_accent": 2609.590059
    },
    "configuration": {
      "lights": ["light.dining_col_accent", "light.living_col_accent"],
      "prefer_rgb_color": false,
      "transition": 45,
      ...
    },
    "friendly_name": "Adaptive Lighting: column_lights",
    ...
  }
}
```

**Key Fields for Sensors:**
- `brightness_pct` → brightness_target
- `manual_control` → mode detection, lights_overridden count
- `autoreset_time_remaining` → timer formatting
- `configuration.lights` → lights_total count
- `color_temp_kelvin` → color temp display