# OAL Away Mode Implementation Plan

**Issue:** GitHub #3 - Comprehensive Away Mode System
**Status:** Ready for Implementation
**Target File:** `/home/mac/HA/implementation_10/packages/OAL_lighting_control_package.yaml`
**Created:** 2025-12-25

---

## Table of Contents

1. [Overview](#1-overview)
2. [New Entities (LAYER 2)](#2-new-entities-layer-2)
3. [New Automations](#3-new-automations)
4. [Existing Automation Modifications](#4-existing-automation-modifications)
5. [Script Modifications](#5-script-modifications)
6. [Template Sensors](#6-template-sensors)
7. [Dashboard Integration](#7-dashboard-integration)
8. [Implementation Sequence](#8-implementation-sequence)
9. [Testing Protocol](#9-testing-protocol)
10. [Rollback Plan](#10-rollback-plan)
11. [Entity Reference Table](#11-entity-reference-table)

---

## 1. Overview

### Design Principles

- **Manual activation only** - No automatic presence triggers (user has dog)
- **Multi-system coordination** - Lighting, Sonos alarms, Climate, Security notifications
- **Snapshot/restore pattern** - Preserve pre-away state for restoration
- **Graceful degradation** - `continue_on_error: true` for parallel operations
- **Dog-aware climate** - Conservative temperature limits (pet always home)

### State Machine

```
Normal ──[manual toggle ON]──► Away
   ▲                            │
   │                            ▼
   └──[manual toggle OFF]──── Alert ◄──[unexpected motion]
```

### Affected Systems

| System | Away Behavior | Restore Behavior |
|--------|--------------|------------------|
| Lighting | Disable sunrise/wake-up sequences | Re-enable sequences |
| Sonos | Suspend alarms (preserve config) | Restore alarm states |
| Climate | ECO mode (18°C min / 24°C max) | Restore saved setpoint |
| Security | Monitor for unexpected motion | Disable monitoring |

---

## 2. New Entities (LAYER 2)

### Insertion Point
**File:** `OAL_lighting_control_package.yaml`
**Location:** Insert AFTER line 385 (`oal_force_sleep`), BEFORE line 387 (`living_room_expanded`)

### Code Block

```yaml
  # ---------------------------------------------------------------------------
  # Away Mode Controls
  # ---------------------------------------------------------------------------
  oal_away_mode_active:
    name: "OAL Away Mode Active"
    initial: false
    icon: mdi:airplane-takeoff

  oal_away_lighting_disabled:
    name: "OAL Away - Lighting Sequences Disabled"
    initial: false
    icon: mdi:lightbulb-off

  oal_away_sonos_suspended:
    name: "OAL Away - Sonos Alarms Suspended"
    initial: false
    icon: mdi:speaker-off

  oal_away_climate_eco:
    name: "OAL Away - Climate ECO Mode"
    initial: false
    icon: mdi:thermostat

  oal_away_security_monitoring:
    name: "OAL Away - Security Monitoring"
    initial: false
    icon: mdi:shield-home

input_datetime:
  oal_away_mode_activated:
    name: "Away Mode Activation Time"
    has_date: true
    has_time: true
    icon: mdi:clock-start

input_text:
  oal_away_climate_snapshot:
    name: "Away Mode Climate Snapshot"
    initial: ""
    max: 255
    icon: mdi:content-save

  oal_away_sonos_snapshot:
    name: "Away Mode Sonos Alarm Snapshot"
    initial: ""
    max: 255
    icon: mdi:content-save
```

### Line Reference After Insertion

| Line (approx) | Entity |
|---------------|--------|
| 386 | `oal_away_mode_active` |
| 390 | `oal_away_lighting_disabled` |
| 394 | `oal_away_sonos_suspended` |
| 398 | `oal_away_climate_eco` |
| 402 | `oal_away_security_monitoring` |
| 407 | `oal_away_mode_activated` (input_datetime) |
| 413 | `oal_away_climate_snapshot` (input_text) |
| 418 | `oal_away_sonos_snapshot` (input_text) |

---

## 3. New Automations

### Insertion Point
**Location:** Insert AFTER line 2224 (end of `oal_global_pause_manager_v13`), BEFORE line 2226

---

### 3.1 Away Mode Primary Controller

```yaml
  # ---------------------------------------------------------------------------
  # 4.16 Away Mode - Primary Controller
  # ---------------------------------------------------------------------------
  - id: oal_away_mode_controller_v13
    alias: "OAL v13 - Away Mode Controller"
    description: "Coordinates all systems when away mode is toggled"
    mode: single
    trigger:
      - platform: state
        entity_id: input_boolean.oal_away_mode_active
    variables:
      is_activating: "{{ trigger.to_state.state == 'on' }}"
      climate_entity: "climate.dining_room"
      eco_temp_heat: 18
      eco_temp_cool: 24
    action:
      - choose:
          # ===== ACTIVATION SEQUENCE =====
          - conditions:
              - condition: template
                value_template: "{{ is_activating }}"
            sequence:
              # Record activation timestamp
              - service: input_datetime.set_datetime
                target:
                  entity_id: input_datetime.oal_away_mode_activated
                data:
                  datetime: "{{ now().strftime('%Y-%m-%d %H:%M:%S') }}"

              # Parallel snapshot and activation
              - parallel:
                  # --- Lighting: Disable sequences ---
                  - sequence:
                      - service: input_boolean.turn_on
                        target:
                          entity_id: input_boolean.oal_disable_next_sonos_wakeup
                      - service: input_boolean.turn_on
                        target:
                          entity_id: input_boolean.oal_away_lighting_disabled

                  # --- Sonos: Snapshot and suspend alarms ---
                  - sequence:
                      - service: input_text.set_value
                        target:
                          entity_id: input_text.oal_away_sonos_snapshot
                        data:
                          value: >
                            {% set alarms = state_attr('sensor.sonos_upcoming_alarms', 'alarms') | default([]) %}
                            {{ alarms | selectattr('enabled', 'eq', true) | map(attribute='id') | list | join(',') }}
                      # Disable Sonos alarms via switch entities if available
                      - service: input_boolean.turn_on
                        target:
                          entity_id: input_boolean.oal_away_sonos_suspended
                    continue_on_error: true

                  # --- Climate: Snapshot and set ECO ---
                  - sequence:
                      - service: input_text.set_value
                        target:
                          entity_id: input_text.oal_away_climate_snapshot
                        data:
                          value: >
                            {% set climate = states.climate.dining_room %}
                            {{ {
                              'temperature': climate.attributes.temperature | default(21),
                              'hvac_mode': climate.state
                            } | to_json }}
                      - service: climate.set_temperature
                        target:
                          entity_id: "{{ climate_entity }}"
                        data:
                          temperature: >
                            {% if state_attr(climate_entity, 'hvac_action') == 'heating' %}
                              {{ eco_temp_heat }}
                            {% else %}
                              {{ eco_temp_cool }}
                            {% endif %}
                      - service: input_boolean.turn_on
                        target:
                          entity_id: input_boolean.oal_away_climate_eco
                    continue_on_error: true

                  # --- Security: Enable monitoring ---
                  - sequence:
                      - service: input_boolean.turn_on
                        target:
                          entity_id: input_boolean.oal_away_security_monitoring

              # Log activation
              - service: logbook.log
                data:
                  name: "Away Mode"
                  message: "Activated - All systems configured for away state"
                  entity_id: input_boolean.oal_away_mode_active

          # ===== DEACTIVATION SEQUENCE =====
          - conditions:
              - condition: template
                value_template: "{{ not is_activating }}"
            sequence:
              - parallel:
                  # --- Lighting: Re-enable sequences ---
                  - sequence:
                      - service: input_boolean.turn_off
                        target:
                          entity_id: input_boolean.oal_disable_next_sonos_wakeup
                      - service: input_boolean.turn_off
                        target:
                          entity_id: input_boolean.oal_away_lighting_disabled

                  # --- Sonos: Restore alarms ---
                  - sequence:
                      - service: input_boolean.turn_off
                        target:
                          entity_id: input_boolean.oal_away_sonos_suspended
                      # Future: Restore individual alarm states from snapshot
                    continue_on_error: true

                  # --- Climate: Restore previous settings ---
                  - sequence:
                      - variables:
                          snapshot: "{{ states('input_text.oal_away_climate_snapshot') | from_json if states('input_text.oal_away_climate_snapshot') else {} }}"
                      - condition: template
                        value_template: "{{ snapshot.temperature is defined }}"
                      - service: climate.set_temperature
                        target:
                          entity_id: "{{ climate_entity }}"
                        data:
                          temperature: "{{ snapshot.temperature }}"
                      - service: input_boolean.turn_off
                        target:
                          entity_id: input_boolean.oal_away_climate_eco
                    continue_on_error: true

                  # --- Security: Disable monitoring ---
                  - sequence:
                      - service: input_boolean.turn_off
                        target:
                          entity_id: input_boolean.oal_away_security_monitoring

              # Clear activation timestamp
              - service: input_datetime.set_datetime
                target:
                  entity_id: input_datetime.oal_away_mode_activated
                data:
                  datetime: "1970-01-01 00:00:00"

              # Log deactivation
              - service: logbook.log
                data:
                  name: "Away Mode"
                  message: "Deactivated - All systems restored to normal operation"
                  entity_id: input_boolean.oal_away_mode_active
```

---

### 3.2 Away Mode Activity Monitor

```yaml
  # ---------------------------------------------------------------------------
  # 4.17 Away Mode - Activity Monitor (Security Alerts)
  # ---------------------------------------------------------------------------
  - id: oal_away_mode_activity_monitor_v13
    alias: "OAL v13 - Away Mode Activity Monitor"
    description: "Detect unexpected motion during away mode and send alerts"
    mode: single
    trigger:
      # Motion sensors
      - platform: state
        entity_id:
          - binary_sensor.living_room_motion
          - binary_sensor.hue_motion_sensor_1_motion
        to: "on"
        id: motion
      # FP2 Presence sensors (zones 1-6)
      - platform: state
        entity_id:
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_1
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_2
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_3
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_4
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_5
          - binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_6
        to: "on"
        id: presence
    condition:
      # Only when away mode AND security monitoring are active
      - condition: state
        entity_id: input_boolean.oal_away_mode_active
        state: "on"
      - condition: state
        entity_id: input_boolean.oal_away_security_monitoring
        state: "on"
      # Rate limit: No alert in last 15 minutes
      - condition: template
        value_template: >
          {% set last_alert = state_attr('automation.oal_away_mode_activity_monitor_v13', 'last_triggered') %}
          {% if last_alert %}
            {{ (now() - last_alert).total_seconds() > 900 }}
          {% else %}
            true
          {% endif %}
    variables:
      sensor_name: "{{ trigger.to_state.attributes.friendly_name | default(trigger.entity_id) }}"
      away_duration: >
        {% set activated = states('input_datetime.oal_away_mode_activated') %}
        {% if activated and activated != '1970-01-01 00:00:00' %}
          {% set duration = now() - strptime(activated, '%Y-%m-%d %H:%M:%S') %}
          {{ duration.days }}d {{ (duration.seconds // 3600) }}h {{ ((duration.seconds % 3600) // 60) }}m
        {% else %}
          Unknown
        {% endif %}
    action:
      # Send push notification
      - service: notify.mobile_app_mac_s_iphone
        data:
          title: "Activity Detected While Away"
          message: |
            Sensor: {{ sensor_name }}
            Time: {{ now().strftime('%I:%M %p') }}
            Away duration: {{ away_duration }}
          data:
            push:
              sound:
                name: default
                critical: 0
                volume: 0.5
            actions:
              - action: "AWAY_MODE_DISMISS"
                title: "Dismiss"
              - action: "AWAY_MODE_DISABLE"
                title: "Disable Away Mode"

      # Log alert
      - service: logbook.log
        data:
          name: "Away Mode Alert"
          message: "Activity detected: {{ sensor_name }}"
          entity_id: input_boolean.oal_away_mode_active
```

---

### 3.3 Away Mode Notification Action Handler

```yaml
  # ---------------------------------------------------------------------------
  # 4.18 Away Mode - Notification Action Handler
  # ---------------------------------------------------------------------------
  - id: oal_away_mode_notification_handler_v13
    alias: "OAL v13 - Away Mode Notification Handler"
    description: "Handle actionable notification responses"
    mode: single
    trigger:
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "AWAY_MODE_DISABLE"
    action:
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.oal_away_mode_active
      - service: notify.mobile_app_mac_s_iphone
        data:
          title: "Away Mode Disabled"
          message: "Systems restored to normal operation"
```

---

## 4. Existing Automation Modifications

### 4.1 Dynamic Sunrise Manager (Line 1876)

**Current condition block (lines 1876-1879):**
```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
```

**Replace with:**
```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
      - condition: state
        entity_id: input_boolean.oal_away_mode_active
        state: "off"
```

---

### 4.2 Wake-up Sequence (Line 1920)

**Current condition block (lines 1920-1923):**
```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
```

**Replace with:**
```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
      - condition: state
        entity_id: input_boolean.oal_away_mode_active
        state: "off"
```

---

## 5. Script Modifications

### 5.1 Soft Reset Script

**Location:** Find `script.oal_reset_soft` in the file (search for `oal_reset_soft`)

**Add to beginning of sequence:**
```yaml
      # Preserve away mode state during soft reset
      - condition: state
        entity_id: input_boolean.oal_away_mode_active
        state: "off"
```

**OR if you want soft reset to always run but preserve away mode:**
```yaml
      # Skip away mode reset if active
      - if:
          - condition: state
            entity_id: input_boolean.oal_away_mode_active
            state: "on"
        then:
          - stop: "Away mode active - preserving state"
```

---

## 6. Template Sensors

### Insertion Point
Add to template sensor section (search for existing `template:` block with sensors)

```yaml
  - sensor:
      - name: "OAL Away Mode Status"
        unique_id: oal_away_mode_status
        icon: >
          {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
            mdi:airplane
          {% else %}
            mdi:home
          {% endif %}
        state: >
          {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
            Away
          {% else %}
            Home
          {% endif %}
        attributes:
          activated: "{{ states('input_datetime.oal_away_mode_activated') }}"
          duration: >
            {% set activated = states('input_datetime.oal_away_mode_activated') %}
            {% if activated and activated != '1970-01-01 00:00:00' and is_state('input_boolean.oal_away_mode_active', 'on') %}
              {% set duration = now() - strptime(activated, '%Y-%m-%d %H:%M:%S') %}
              {{ duration.days }}d {{ (duration.seconds // 3600) }}h {{ ((duration.seconds % 3600) // 60) }}m
            {% else %}
              --
            {% endif %}
          lighting_disabled: "{{ is_state('input_boolean.oal_away_lighting_disabled', 'on') }}"
          sonos_suspended: "{{ is_state('input_boolean.oal_away_sonos_suspended', 'on') }}"
          climate_eco: "{{ is_state('input_boolean.oal_away_climate_eco', 'on') }}"
          security_monitoring: "{{ is_state('input_boolean.oal_away_security_monitoring', 'on') }}"
          climate_snapshot: "{{ states('input_text.oal_away_climate_snapshot') }}"
```

---

## 7. Dashboard Integration

### 7.1 Away Mode Toggle Card

```yaml
type: custom:mushroom-template-card
primary: Away Mode
secondary: >
  {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
    Active for {{ state_attr('sensor.oal_away_mode_status', 'duration') }}
  {% else %}
    Inactive
  {% endif %}
icon: >
  {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
    mdi:airplane
  {% else %}
    mdi:home
  {% endif %}
icon_color: >
  {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
    orange
  {% else %}
    grey
  {% endif %}
entity: input_boolean.oal_away_mode_active
tap_action:
  action: toggle
hold_action:
  action: more-info
```

### 7.2 Away Mode Status Chip (for Hero Card)

```yaml
type: custom:mushroom-chips-card
chips:
  - type: template
    entity: input_boolean.oal_away_mode_active
    icon: >
      {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
        mdi:airplane
      {% else %}
        mdi:home
      {% endif %}
    icon_color: >
      {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
        orange
      {% else %}
        ''
      {% endif %}
    content: >
      {% if is_state('input_boolean.oal_away_mode_active', 'on') %}
        Away
      {% endif %}
    tap_action:
      action: toggle
```

### 7.3 Away Mode Detail Popup

```yaml
type: custom:mushroom-template-card
primary: Away Mode Details
secondary: ""
icon: mdi:airplane-cog
card_mod:
  style: |
    ha-card { background: none; }
tap_action:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      title: Away Mode Configuration
      content:
        type: vertical-stack
        cards:
          - type: entities
            entities:
              - entity: input_boolean.oal_away_mode_active
                name: Away Mode
              - type: divider
              - entity: input_boolean.oal_away_lighting_disabled
                name: Lighting Sequences
              - entity: input_boolean.oal_away_sonos_suspended
                name: Sonos Alarms
              - entity: input_boolean.oal_away_climate_eco
                name: Climate ECO
              - entity: input_boolean.oal_away_security_monitoring
                name: Security Monitoring
              - type: divider
              - entity: sensor.oal_away_mode_status
                name: Status
```

---

## 8. Implementation Sequence

### Phase 1: Entities (5 minutes)
1. Open `OAL_lighting_control_package.yaml`
2. Navigate to line 385 (after `oal_force_sleep`)
3. Insert new input_boolean, input_datetime, input_text blocks from Section 2
4. Save file

### Phase 2: Condition Modifications (5 minutes)
1. Navigate to line 1876 (sunrise manager condition)
2. Add away mode condition per Section 4.1
3. Navigate to line 1920 (wake-up sequence condition)
4. Add away mode condition per Section 4.2
5. Save file

### Phase 3: New Automations (10 minutes)
1. Navigate to line 2224 (after global pause manager)
2. Insert all three new automations from Section 3
3. Save file

### Phase 4: Template Sensor (5 minutes)
1. Find template sensor section
2. Add `oal_away_mode_status` sensor from Section 6
3. Save file

### Phase 5: Reload & Validate (10 minutes)
1. Run: Developer Tools → YAML → Reload Automations
2. Run: Developer Tools → YAML → Reload Input Booleans
3. Run: Developer Tools → YAML → Reload Template Entities
4. Verify all new entities appear in States
5. Check logs for errors

### Phase 6: Dashboard (5 minutes)
1. Add away mode card to appropriate dashboard
2. Test toggle functionality

---

## 9. Testing Protocol

### Test 1: Entity Creation
```
States → Filter: oal_away
Expected: 8 new entities visible
```

### Test 2: Activation Sequence
1. Toggle `input_boolean.oal_away_mode_active` ON
2. Verify:
   - [ ] `input_boolean.oal_disable_next_sonos_wakeup` → ON
   - [ ] `input_boolean.oal_away_lighting_disabled` → ON
   - [ ] `input_boolean.oal_away_sonos_suspended` → ON
   - [ ] `input_boolean.oal_away_climate_eco` → ON
   - [ ] `input_boolean.oal_away_security_monitoring` → ON
   - [ ] `input_datetime.oal_away_mode_activated` → Current time
   - [ ] `input_text.oal_away_climate_snapshot` → JSON with temperature
   - [ ] `climate.dining_room` temperature changed to ECO

### Test 3: Deactivation Sequence
1. Toggle `input_boolean.oal_away_mode_active` OFF
2. Verify:
   - [ ] All feature booleans → OFF
   - [ ] `input_datetime.oal_away_mode_activated` → 1970-01-01
   - [ ] `climate.dining_room` temperature restored from snapshot

### Test 4: Activity Alert
1. Enable away mode
2. Trigger `binary_sensor.living_room_motion`
3. Verify:
   - [ ] Push notification received
   - [ ] Logbook entry created
   - [ ] 15-minute cooldown prevents duplicate alerts

### Test 5: Sunrise Manager Blocked
1. Enable away mode
2. Check automation trace for `oal_dynamic_sunrise_manager_v13`
3. Verify: Condition fails due to away mode check

### Test 6: Wake-up Sequence Blocked
1. Enable away mode
2. Check automation trace for `oal_wake_up_sequence_v13`
3. Verify: Condition fails due to away mode check

---

## 10. Rollback Plan

### Quick Disable
```yaml
# Turn off away mode
service: input_boolean.turn_off
target:
  entity_id: input_boolean.oal_away_mode_active

# Disable automation if problematic
service: automation.turn_off
target:
  entity_id: automation.oal_away_mode_controller_v13
```

### Full Rollback
```bash
cd /home/mac/HA/implementation_10
git checkout packages/OAL_lighting_control_package.yaml
# Then reload automations in HA
```

---

## 11. Entity Reference Table

### New Entities Created

| Entity ID | Type | Purpose |
|-----------|------|---------|
| `input_boolean.oal_away_mode_active` | Toggle | Master away mode switch |
| `input_boolean.oal_away_lighting_disabled` | Status | Lighting sequences disabled |
| `input_boolean.oal_away_sonos_suspended` | Status | Sonos alarms suspended |
| `input_boolean.oal_away_climate_eco` | Status | Climate in ECO mode |
| `input_boolean.oal_away_security_monitoring` | Status | Security monitoring active |
| `input_datetime.oal_away_mode_activated` | Timestamp | When away mode was activated |
| `input_text.oal_away_climate_snapshot` | JSON | Pre-away climate settings |
| `input_text.oal_away_sonos_snapshot` | JSON | Pre-away alarm states |
| `sensor.oal_away_mode_status` | Template | Status with duration and attributes |

### Motion/Presence Sensors Used

| Entity ID | Friendly Name | Type |
|-----------|--------------|------|
| `binary_sensor.living_room_motion` | Living Room Motion | Motion |
| `binary_sensor.hue_motion_sensor_1_motion` | Bedroom Motion | Motion |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_1` | FP2 Zone 1 | Presence |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_2` | FP2 Zone 2 | Presence |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_3` | FP2 Zone 3 | Presence |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_4` | FP2 Zone 4 | Presence |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_5` | FP2 Zone 5 | Presence |
| `binary_sensor.presence_sensor_fp2_a1a8_presence_sensor_6` | FP2 Zone 6 | Presence |

### Climate Entity

| Entity ID | Current State |
|-----------|--------------|
| `climate.dining_room` | heat_cool (Thermostat) |

---

## Future Enhancements

1. **Scheduled Away Mode** - Calendar integration for vacation planning
2. **Random Lighting Simulation** - Occasional light activity to simulate occupancy
3. **Geofence Integration** - Optional auto-activate when all phones leave (with dog override)
4. **Sonos Individual Alarm Control** - Per-alarm suspend/restore
5. **ZEN32 Button Integration** - Physical button for quick toggle

---

*Generated: 2025-12-25 | GitHub Issue #3*
