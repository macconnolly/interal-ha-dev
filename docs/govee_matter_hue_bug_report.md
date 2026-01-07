# Govee Matter Integration - Hue Color Interpretation Bug

## Summary

Govee RGBICW COB LED Strip Light Pro devices connected via Matter incorrectly display certain hue values as purple instead of orange. Hue values in the approximate range of 30-37° are affected.

## Device Information

- **Device**: Govee RGBICW COB LED Strip Light Pro
- **Integration**: Matter (via Home Assistant)
- **Home Assistant Version**: [Your version]
- **Firmware Version**: [Check Govee app for firmware version]

## Problem Description

When sending HS (Hue-Saturation) color commands to the device via Matter, hue values between approximately 30° and 37° are incorrectly interpreted and displayed as **purple/magenta** instead of the expected **orange/amber** color.

Hue values at or above 38° display correctly as orange.

## Evidence

### Test Results (Controlled Side-by-Side Comparison)

| Test | Command Sent | HA Reports | Physical Color |
|------|--------------|------------|----------------|
| 1 | `hs_color: [35.47, 97]` | HS [35.4°, 97%], RGB [255, 154, 8] | **Purple** ❌ |
| 2 | `rgb_color: [255, 165, 0]` | HS [38.3°, 100%], RGB [255, 163, 0] | **Orange** ✓ |
| 3 | `hs_color: [38.3, 100]` | HS [38.3°, 100%], RGB [255, 163, 0] | **Orange** ✓ |
| 4 | `hs_color: [30.5, 94.5]` | HS [30.5°, 94.5%], RGB [255, 137, 14] | **Purple** ❌ |

### Color Space Reference

For context, in the HSV/HSL color wheel:
- 0° = Red
- 30° = Orange-Red
- 38° = Orange
- 60° = Yellow

Both 30° and 38° should appear in the orange spectrum, but only 38°+ displays correctly on these Govee devices.

### Entity Attributes

```yaml
# Device capabilities reported by Home Assistant
supported_color_modes: ["color_temp", "hs", "xy"]
min_color_temp_kelvin: 15
max_color_temp_kelvin: 6535
```

Note: The device does NOT report native RGB support. Home Assistant converts RGB commands to HS/XY before sending to the Matter integration.

## Steps to Reproduce

1. Connect Govee RGBICW COB LED Strip Light Pro via Matter to Home Assistant
2. Send command: `light.turn_on` with `hs_color: [35, 97]`
3. Observe the physical light color - it displays purple/magenta
4. Send command: `light.turn_on` with `hs_color: [38, 100]`
5. Observe the physical light color - it correctly displays orange

## Expected Behavior

Hue values between 30-37° should display as shades of orange/amber, consistent with the standard HSV color wheel.

## Actual Behavior

Hue values between 30-37° display as purple/magenta, which is completely wrong (purple should be around 270-300° on the color wheel).

## Impact

This bug affects any automation or integration that calculates color values dynamically:

- **Adaptive Lighting integration**: Calculates color temperature transitions that produce hue values in the 30-37° range, resulting in purple lights instead of warm orange
- **Any scene or automation** using warm amber colors with hue values in the affected range

## Workaround

Force the use of hue values ≥38° for orange colors:
- Use `rgb_color: [255, 165, 0]` which converts to HS [38.8°, 100%]
- Use `hs_color: [38, 100]` or higher for orange
- Avoid calculated color values that produce hue in the 30-37° range

For Adaptive Lighting users:
- Enable sleep mode at night to force a known-working color value
- Use `sleep_rgb_color: [255, 165, 0]` which produces the safe HS [38.8°]

## Technical Analysis

### Hypothesis

The Matter firmware on the Govee device appears to have an error in its hue value interpretation, possibly:

1. **Hue range mapping error**: The firmware may be incorrectly mapping the 0-360° hue range, causing values around 30-37° to be interpreted as values around 270-300° (purple)

2. **Color space conversion bug**: There may be an error in the conversion from HS to the device's internal color representation

3. **Wrap-around error**: The firmware might have an off-by-one or boundary condition error that causes low hue values to wrap into the purple range

### Matter Protocol Consideration

Since this occurs via Matter integration, the bug is likely in:
- Govee's Matter firmware implementation (most likely)
- The device's internal color processing after receiving Matter commands

The same devices may work correctly via:
- Govee's native app (uses different protocol)
- govee2mqtt integration (uses Govee's LAN API) - **Recommended alternative**

### govee2mqtt as Alternative

GitHub: https://github.com/wez/govee2mqtt

govee2mqtt communicates with Govee devices via their LAN API rather than Matter, which:
- **CONFIRMED**: Native RGB support (`supported_color_modes: ["color_temp", "rgb"]`)
- Sends RGB values directly without converting to HS - bypasses the hue bug
- Provides additional features like segment control for RGBIC devices
- 150+ scene/effect options

**Tested and verified**: Sending `rgb_color: [255, 165, 0]` via govee2mqtt displays correctly as orange.

## Recommended Action

**For Govee**: Investigate and fix the hue interpretation in Matter firmware for values between 30-37°.

## Environment Details

```
Home Assistant Integration: Matter
Connection: Matter over Thread/WiFi
Device Model: Govee RGBICW COB LED Strip Light Pro
Issue Discovery Date: December 2024
```

## Related Issues

- This may affect other Govee Matter-enabled devices
- Users of Adaptive Lighting integration are particularly impacted as it calculates dynamic color values

---

## For Adaptive Lighting Users

If you're experiencing purple lights instead of orange with Govee Matter devices, the issue is NOT with Adaptive Lighting - it's a Govee firmware bug.

### Quick Fix

Enable sleep mode at night with a known-working color:

```yaml
# In your AL configuration
sleep_rgb_color: [255, 165, 0]  # Produces HS [38.8°] - works correctly
sleep_rgb_or_color_temp: "rgb_color"
```

Then create an automation to enable sleep mode after sunset for affected lights.
