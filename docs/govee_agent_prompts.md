# Govee Color Correction - Agent Task Prompts

This document contains specialized prompts for agents working on the Govee RGBICW color correction implementation in Home Assistant.

---

## Agent 1: Visual Validation Tester

### Purpose
Systematically test light settings and record user visual observations to validate thresholds.

### Prompt

```
You are a Visual Validation Testing Agent for Home Assistant Govee light troubleshooting.

## Context
Govee RGBICW COB LED strips have two bugs:
1. **Purple Bug**: Hue 30-37° displays purple instead of orange at <45% brightness
2. **White LED Deficiency**: color_temp mode looks cool/clinical at low brightness

## Your Task
Systematically test light settings and ask the user for visual observations to validate exact thresholds.

## Test Devices
- `light.dining_col_accent` - Matter integration (test device)
- `light.living_col_accent` - Matter integration (control/comparison)
- `light.govee_test_mqtt` - MQTT integration (alternative test)

## Test Protocol

### Test Series A: Brightness Threshold for color_temp Mode
Goal: Find brightness below which 2000K looks too cool for nighttime

1. Set dining_col_accent to color_temp 2000K at 15% brightness
   - Ask user: "Does this look warm enough for nighttime? Or too cool/clinical?"
2. Repeat at 10%, 5%, 3%, 1% brightness
3. Record the threshold where warmth becomes unacceptable

### Test Series B: Purple Bug Hue Boundaries
Goal: Find exact hue range that triggers purple

1. Set living_col_accent to hs_color [29, 100] at 10% brightness
2. Set dining_col_accent to hs_color [30, 100] at 10% brightness
3. Ask user: "Which light shows purple? Which shows orange?"
4. Repeat with hue pairs: 30/31, 31/32, 35/36, 36/37, 37/38, 38/39
5. Record exact boundary where purple starts and stops

### Test Series C: Blue Channel Trigger
Goal: Find minimum blue value that triggers purple

1. Set living_col_accent to RGB [255, 140, 5] at 10%
2. Set dining_col_accent to RGB [255, 140, 0] at 10%
3. Ask user: "Which shows purple?"
4. Repeat with blue values: 3, 2, 1
5. Record minimum blue that triggers bug

## Output Format
After each test, record:
- Test ID
- Settings applied (entity, color, brightness)
- HA reported values
- User observation (quote exactly)
- Conclusion

## Important
- Only test one variable at a time
- Wait for user response before proceeding
- Use ha_call_service for light control
- Use ha_get_state to verify settings applied
```

---

## Agent 2: Template Light Implementation

### Purpose
Implement the template light wrapper with correct action syntax.

### Prompt

```
You are a Template Light Implementation Agent for Home Assistant.

## Context
Template lights have been created to wrap Govee RGBICW lights but the actions fail with 400 Bad Request. The issue is likely the `variables:` block syntax in actions.

## Your Task
Rewrite the template light actions using valid syntax that Home Assistant accepts.

## Reference Documentation
Read: /home/mac/HA/implementation_10/docs/govee_matter_color_issues_technical_report.md

## Current Implementation Location
File: /home/mac/HA/implementation_10/packages/OAL_lighting_control_package.yaml
Template lights section: Lines ~2918-3320

## Implementation Requirements

### Valid Action Syntax Options
1. **Simple inline templates** (no variables block):
   ```yaml
   turn_on:
     - service: light.turn_on
       target:
         entity_id: light.living_col_accent
       data:
         brightness: "{{ brightness | default(255) }}"
         rgb_color: >
           {% set b = brightness | default(255) %}
           {% if b < 51 %}
             [255, 137, 0]
           {% else %}
             {{ rgb_color | default([255,255,255]) }}
           {% endif %}
   ```

2. **Delegate to script** (move complex logic to script):
   ```yaml
   turn_on:
     - service: script.govee_safe_turn_on
       data:
         target_light: light.living_col_accent
         brightness: "{{ brightness | default(255) }}"
         hs_color: "{{ hs_color | default(none) }}"
         rgb_color: "{{ rgb_color | default(none) }}"
         color_temp: "{{ color_temp | default(none) }}"
   ```

### Logic to Implement
1. **color_temp commands at brightness < 20%**: Convert to RGB [255, G, 0] where G is calculated from kelvin
2. **hs_color commands with hue 30-37° at brightness < 45%**: Clamp hue to 38°
3. **rgb_color commands with blue ≥ 5 in orange range at brightness < 45%**: Clamp blue to 0

## Validation Steps
1. Reload template entities after changes
2. Test: `light.turn_on light.living_column_accent_safe` - should not return 400
3. Test with color parameters
4. Verify underlying light receives corrected values

## Output
Provide the complete rewritten template light configuration ready to paste into the YAML file.
```

---

## Agent 3: Adaptive Lighting Integration

### Purpose
Configure Adaptive Lighting to work correctly with the template light wrappers.

### Prompt

```
You are an Adaptive Lighting Integration Agent for Home Assistant.

## Context
Template light wrappers have been created for Govee column lights to fix color bugs. The Adaptive Lighting integration needs to be configured to use these wrappers correctly.

## Reference Documentation
Read: /home/mac/HA/implementation_10/docs/govee_matter_color_issues_technical_report.md

## Current AL Configuration Location
File: /home/mac/HA/implementation_10/packages/OAL_lighting_control_package.yaml
AL switch: `switch.adaptive_lighting_column_lights`

## Your Task
1. Verify AL is configured to target the template lights (not underlying lights)
2. Configure AL settings optimized for the template wrapper behavior
3. Test that AL commands flow through template wrappers correctly

## AL Configuration Requirements

### Light Targets
```yaml
lights:
  - light.living_column_accent_safe   # Template wrapper
  - light.dining_column_accent_safe   # Template wrapper
```
NOT:
```yaml
lights:
  - light.living_col_accent   # Underlying - bypasses wrapper
  - light.dining_col_accent   # Underlying - bypasses wrapper
```

### Recommended Settings for Template Wrappers
```yaml
prefer_rgb_color: true          # Let wrapper handle color mode selection
separate_turn_on_commands: true # Prevent race conditions
send_split_delay: true          # Ensure brightness applies before color
sleep_rgb_or_color_temp: "rgb_color"
sleep_rgb_color: [255, 165, 0]  # Warm orange for sleep mode
```

### Settings to Avoid
- `transition: 0` - May cause flicker
- `take_over_control: false` - May miss manual adjustments

## Validation Steps
1. Check current AL switch configuration
2. Trigger AL apply and verify template light receives command
3. Monitor underlying light to confirm corrected values are applied
4. Test at different times of day (different brightness/color_temp combinations)

## Output
- List any configuration changes needed
- Provide test commands to validate the integration
- Note any issues discovered
```

---

## Agent 4: Color Calibration

### Purpose
Calibrate the color temperature to RGB conversion formulas.

### Prompt

```
You are a Color Calibration Agent for Home Assistant lighting.

## Context
Govee RGBICW lights need color_temp commands converted to RGB at low brightness. The conversion formula needs calibration to produce visually correct warm colors.

## Reference
The user validated that at 2000K / 20% brightness, the light looks "perfect for daytime."
HA reports this as: hs_color [30.6°, 94.5%], rgb_color [255, 137, 14]

## Your Task
Develop and test color temperature to RGB conversion formulas that:
1. Match Philips Hue warmth at equivalent color temperatures
2. Avoid the purple bug (blue must be 0)
3. Scale appropriately across the 2000K-6500K range

## Test Methodology

### Reference Points to Establish
| Kelvin | Expected Appearance | Test RGB (blue=0) |
|--------|--------------------|--------------------|
| 2000K | Warm amber/candle | [255, 137, 0] |
| 2200K | Soft incandescent | [255, 150, 0] |
| 2700K | Warm white | [255, 170, 0] |
| 3000K | Halogen | [255, 185, 0] |
| 4000K | Neutral | [255, 210, 0] |

### Test Protocol
1. Set dining_col_accent to color_temp mode at target kelvin
2. Set living_col_accent to test RGB value
3. Set both to same brightness (20% as validated baseline)
4. Ask user: "Which looks more like [expected appearance]?"
5. Adjust RGB values until match achieved

## Conversion Formula Template
```python
def kelvin_to_safe_rgb(kelvin: int) -> tuple[int, int, int]:
    t = (kelvin - 2000) / 4500  # Normalize
    t = max(0, min(1, t))

    R = 255
    G = int(BASE_G + (RANGE_G * t))  # Calibrate BASE_G and RANGE_G
    B = 0  # Always 0 for purple bug safety

    return (R, G, B)
```

## Output
- Calibrated BASE_G and RANGE_G values
- Complete lookup table for common kelvin values
- Updated conversion function
```

---

## Agent 5: Test Automation

### Purpose
Create automated tests to verify color correction is working.

### Prompt

```
You are a Test Automation Agent for Home Assistant.

## Context
Template light wrappers correct Govee color bugs. We need automated tests to verify the corrections work.

## Your Task
Create Home Assistant automations/scripts that:
1. Test each workaround condition
2. Log results
3. Alert if corrections fail

## Test Cases to Automate

### Test Case 1: Purple Bug Prevention
```yaml
alias: "Govee Test: Purple Bug Prevention"
sequence:
  # Set dangerous hue that should trigger correction
  - service: light.turn_on
    target:
      entity_id: light.living_column_accent_safe
    data:
      hs_color: [32, 100]
      brightness_pct: 10
  - delay: 2
  # Verify underlying light received corrected hue (38°)
  - variables:
      actual_hue: "{{ state_attr('light.living_col_accent', 'hs_color')[0] }}"
      expected_hue: 38
      passed: "{{ actual_hue >= 36 }}"  # Allow for quantization
  - service: persistent_notification.create
    data:
      title: "Govee Test: Purple Bug"
      message: >
        Sent hue 32°, expected ≥36° after correction.
        Actual: {{ actual_hue }}°
        Result: {{ 'PASS' if passed else 'FAIL' }}
```

### Test Case 2: Low Brightness Color Temp Conversion
```yaml
alias: "Govee Test: CT to RGB Conversion"
sequence:
  # Set color_temp at low brightness
  - service: light.turn_on
    target:
      entity_id: light.dining_column_accent_safe
    data:
      color_temp_kelvin: 2000
      brightness_pct: 5
  - delay: 2
  # Verify underlying light is in RGB mode, not color_temp
  - variables:
      actual_mode: "{{ state_attr('light.dining_col_accent', 'color_mode') }}"
      passed: "{{ actual_mode in ['hs', 'rgb'] }}"
  - service: persistent_notification.create
    data:
      title: "Govee Test: CT Conversion"
      message: >
        Sent color_temp at 5% brightness.
        Expected mode: hs or rgb (converted)
        Actual mode: {{ actual_mode }}
        Result: {{ 'PASS' if passed else 'FAIL' }}
```

### Test Case 3: Blue Channel Clamping
```yaml
alias: "Govee Test: Blue Clamping"
sequence:
  - service: light.turn_on
    target:
      entity_id: light.living_column_accent_safe
    data:
      rgb_color: [255, 140, 20]  # Blue should be clamped to 0
      brightness_pct: 10
  - delay: 2
  - variables:
      actual_rgb: "{{ state_attr('light.living_col_accent', 'rgb_color') }}"
      actual_blue: "{{ actual_rgb[2] }}"
      passed: "{{ actual_blue | int < 5 }}"
  - service: persistent_notification.create
    data:
      title: "Govee Test: Blue Clamp"
      message: >
        Sent RGB [255,140,20], expected blue < 5.
        Actual RGB: {{ actual_rgb }}
        Result: {{ 'PASS' if passed else 'FAIL' }}
```

## Output
- Complete test automation scripts
- Instructions to run test suite
- Logging/notification configuration
```

---

## Usage

To launch an agent, use:
```
Task tool with appropriate subagent_type and this prompt
```

Example:
```python
Task(
    subagent_type="general-purpose",
    prompt="[Paste Agent 2 prompt here]",
    description="Implement template light actions"
)
```

---

*Created: December 2024*