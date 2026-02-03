# ZEN32 LED State Machine & Mode Configuration Reference

## Overview

The ZEN32 LED system has **two independent layers**:
1. **Buttons 1-4**: Control mode driven (brightness/volume/warmth)
2. **Button 5 (Big Button)**: OAL system state driven (sleep/manual/config/on-off)

---

## 1. Control Mode LED Colors (Buttons 1-4)

**Location**: `packages/zen32_modal_controller_package.yaml` - Lines 1297-1331

### mode_configs Map

```yaml
mode_configs:
  brightness:
    - {button: 1, color: yellow, toggle: always_on, brightness: bright}
    - {button: 2, color: yellow, toggle: always_on, brightness: bright}
    - {button: 3, toggle: always_off}
    - {button: 4, color: yellow, toggle: always_on, brightness: bright}

  volume:
    - {button: 1, toggle: always_off}
    - {button: 2, color: blue, toggle: always_on, brightness: bright}
    - {button: 3, color: blue, toggle: always_on, brightness: bright}
    - {button: 4, color: blue, toggle: always_on, brightness: bright}

  warmth:
    - {button: 1, color: cyan, toggle: always_on, brightness: bright}
    - {button: 2, color: cyan, toggle: always_on, brightness: bright}
    - {button: 3, toggle: always_off}
    - {button: 4, color: cyan, toggle: always_on, brightness: bright}
```

### Summary Table

| Control Mode | Button 1 | Button 2 | Button 3 | Button 4 |
|--------------|----------|----------|----------|----------|
| **Brightness** | YELLOW | YELLOW | OFF | YELLOW |
| **Volume** | OFF | BLUE | BLUE | BLUE |
| **Warmth** | CYAN | CYAN | OFF | CYAN |

---

## 2. OAL Configuration LED (Big Button / Button 5)

**Location**: `packages/zen32_modal_controller_package.yaml` - Lines 795-905 (`zen32_update_big_button_led` script)

### Priority-Ordered State Machine

| Priority | Condition | LED Color | Brightness |
|----------|-----------|-----------|------------|
| 0 (Highest) | Sleep Mode (`input_boolean.oal_force_sleep == 'on'`) | BLUE | Low (30%) |
| 1 | Manual Control Active | RED | Bright (100%) |
| 2 | Non-Adaptive Config | GREEN | Medium (60%) |
| 3 | Lights ON (Adaptive, No Manual) | WHITE | Medium (60%) |
| Default | Lights OFF | OFF | - |

### Manual Control Detection Triggers

- `sensor.oal_system_status.active_zonal_overrides > 0`
- ANY non-zero zone brightness offset:
  - `input_number.oal_manual_offset_main_living_brightness`
  - `input_number.oal_manual_offset_kitchen_island_brightness`
  - `input_number.oal_manual_offset_bedroom_primary_brightness`
  - `input_number.oal_manual_offset_accent_spots_brightness`
  - `input_number.oal_manual_offset_recessed_ceiling_brightness`
  - `input_number.oal_manual_offset_column_lights_brightness`

### Non-Adaptive Configurations

Configs that show GREEN: `Full Bright`, `Dim Ambient`, `Warm Ambient`, `TV Mode`

Configs that show WHITE (when lights on): `Adaptive`, `Manual`

---

## 3. LED Color Value Mapping

**Location**: `zen32_led_sequencer` script (Lines 274-295)

```yaml
_color_map:
  white: "White"
  blue: "Blue"
  green: "Green"
  red: "Red"
  magenta: "Magenta"
  yellow: "Yellow"
  cyan: "Cyan"

_toggle_map:
  always_on: "Always on"
  always_off: "Always off"
  on_when_on: "On when load is on"
  on_when_off: "On when load is off"

_brightness_map:
  bright: "Bright (100%)"
  medium: "Medium (60%)"
  low: "Low (30%)"
```

---

## 4. Z-Wave Entity References

**Location**: Lines 100-126

### Color Selection Entities
```
select.scene_controller_led_indicator_color_relay      (Button 5)
select.scene_controller_led_indicator_color_button_1
select.scene_controller_led_indicator_color_button_2
select.scene_controller_led_indicator_color_button_3
select.scene_controller_led_indicator_color_button_4
```
Options: White, Blue, Green, Red, Magenta, Yellow, Cyan

### Toggle Entities
```
select.scene_controller_led_indicator_relay
select.scene_controller_led_indicator_button_1
select.scene_controller_led_indicator_button_2
select.scene_controller_led_indicator_button_3
select.scene_controller_led_indicator_button_4
```
Options: On when load is off, On when load is on, Always off, Always on

### Brightness Entities
```
select.scene_controller_led_indicator_brightness_relay
select.scene_controller_led_indicator_brightness_button_1
select.scene_controller_led_indicator_brightness_button_2
select.scene_controller_led_indicator_brightness_button_3
select.scene_controller_led_indicator_brightness_button_4
```
Options: Bright (100%), Medium (60%), Low (30%)

### Global Control
```
select.scene_controller_led_settings_indicator
```
**MUST be "Disable" for automation control to work**

---

## 5. Architecture Patterns

### Pattern 1: Z-Wave Parameter Serialization
- All LED commands go through Z-Wave mesh (~80-120ms per command)
- LED Sequencer fires ALL commands without delays (Line 321-330)
- Z-Wave driver queues internally

### Pattern 2: Mode-Centric Dispatch
- Single source of truth: `mode_configs` variable
- Central automation triggers on mode change
- All button 1-4 LEDs update together in one sequencer call

### Pattern 3: Priority-Based Big Button State
- Evaluated in order: Sleep > Manual > Config > On/Off
- Uses `choose` block - first matching condition wins

---

## 6. Conflict Analysis

**The two systems are orthogonal - no direct conflict**

| Aspect | ZEN32 Control Mode | OAL Configuration |
|--------|-------------------|-------------------|
| What it controls | Button 1-4 functions | Lighting preset |
| LED Indicators | Buttons 1-4 colors | Big button color |
| State Entity | `input_select.zen32_control_mode` | `input_select.oal_active_configuration` |
| Options | brightness/volume/warmth | Adaptive/Full Bright/Dim Ambient/etc. |

### Potential Confusion Scenarios

1. **BRIGHTNESS mode + TV Mode config**: Yellow buttons + Green big button
2. **WARMTH mode + Force Sleep**: Cyan buttons + Blue big button
3. **VOLUME mode + Manual Override**: Blue buttons + Red big button

---

## 7. Big Button Sync Triggers

**Automation**: `zen32_big_button_state_sync_v4` (Lines 1262-1289)

The big button LED updates on ANY change to:
- `light.all_adaptive_lights` state
- `sensor.oal_system_status.active_zonal_overrides`
- All 6 `input_number.oal_manual_offset_*_brightness` entities
- `input_boolean.oal_force_sleep`
- `input_select.oal_active_configuration` (implicit)

---

## 8. Complete LED Reference Table

| Component | Sleep Mode | Manual Control | Non-Adaptive | Adaptive Clean | Lights Off |
|-----------|------------|----------------|--------------|----------------|------------|
| **Button 5** | Blue (Low) | Red (Bright) | Green (Med) | White (Med) | OFF |
| **B1,2,4 (Brightness)** | Yellow | Yellow | Yellow | Yellow | Yellow |
| **B2,3,4 (Volume)** | Blue | Blue | Blue | Blue | Blue |
| **B1,2,4 (Warmth)** | Cyan | Cyan | Cyan | Cyan | Cyan |

---

## Key File Locations

- **LED State Machine**: `zen32_modal_controller_package.yaml:1297-1331`
- **Big Button Update Script**: `zen32_modal_controller_package.yaml:795-905`
- **LED Sequencer**: `zen32_modal_controller_package.yaml:274-295`
- **Entity Definitions**: `zen32_modal_controller_package.yaml:100-126`
- **Control Mode Options**: `zen32_modal_controller_package.yaml:701`
