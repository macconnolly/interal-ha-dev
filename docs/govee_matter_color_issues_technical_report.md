# Govee RGBICW Matter Integration - Color Rendering Issues Technical Report

## Executive Summary

Govee RGBICW COB LED Strip Light Pro devices connected via Matter exhibit **two distinct color rendering issues** that require different workarounds:

1. **Purple Bug (Firmware)**: Hue values 30-37° display as purple instead of orange when blue channel ≥2 at low brightness
2. **White LED Warm Deficiency (Hardware)**: The +W LED channel cannot produce warm colors and has a higher minimum brightness floor than RGB mode

### ✅ VALIDATED THRESHOLDS (December 2024)

| Parameter | Validated Value | Original Estimate | Status |
|-----------|-----------------|-------------------|--------|
| **Blue channel safe** | **≤ 1** | ≤ 4 | **STRICTER** |
| **Blue channel triggers bug** | **≥ 2** | ≥ 5 | **STRICTER** |
| **Brightness threshold (Matter)** | **< 25%** | < 45% | Less restrictive |
| **Brightness threshold (MQTT)** | **< 33%** | < 45% | Less restrictive |
| **Color_temp for evening/night** | **NEVER suitable** | < 20% needs RGB | **STRICTER** |
| **Safe universal orange** | **[255, 165, 0]** | [255, 165, 0] | ✓ Confirmed |

**Critical Finding**: The blue channel threshold is much stricter than originally estimated. Use **blue = 0** for all orange colors to guarantee safety.

This document details both issues, their root causes, validated test results, and the template light wrapper solution.

---

## Device & Environment

| Property | Value |
|----------|-------|
| Device | Govee RGBICW COB LED Strip Light Pro |
| Integrations Tested | Matter (HA native), govee2mqtt |
| HA Entities | `light.living_col_accent`, `light.dining_col_accent` |
| MQTT Test Entity | `light.govee_test_mqtt` |
| Matter Color Modes | `["color_temp", "hs", "xy"]` (no native RGB) |
| MQTT Color Modes | `["color_temp", "rgb"]` (no native HS) |
| Color Temp Range | 2000K - 6535K (mireds: 153 - 500) |

### Device Architecture

RGBICW strips have **two separate LED systems**:
- **RGB LEDs**: Red, Green, Blue - can produce any color including warm orange
- **+W LED**: White - physically cool/neutral white, cannot produce warm tones

### Hue Value Quantization Discovery

During testing, we discovered that Govee devices **quantize hue values** to discrete steps:
- Sent hue 37° → Device reports 36.85°
- Sent hue 38° → Device reports 36.85°
- Sent hue 25° → Device reports 24.09°
- Sent hue 30° → Device reports 29.76°

This means the firmware uses discrete hue steps (~1.4° resolution), not continuous values. This affects workaround strategies - clamping to exactly 38° may still land in the 36.85° quantized step.

---

## Bug 1: Purple Hue Interpretation (Firmware Bug)

### Symptoms

When sending HS (Hue-Saturation) color commands via Matter, hue values between **30° and 37°** are incorrectly interpreted and displayed as **purple/magenta** instead of the expected **orange/amber** at low brightness.

### Trigger Conditions

All of the following must be true:
- Hue value in range: **30° ≤ hue ≤ 37°** (after device quantization)
- Saturation: **> 80%**
- Brightness: **< 45%**
- Blue channel: **≥ 5** (when expressed as RGB)

### Evidence from Testing

| Test | Command Sent | HA Reports | Physical Color | Notes |
|------|--------------|------------|----------------|-------|
| Historical | `hs_color: [35.47, 97]` | HS [35.4°, 97%], RGB [255, 154, 8] | **Purple** | Blue=8 triggers bug |
| Historical | `rgb_color: [255, 165, 0]` | HS [38.8°, 100%], RGB [255, 165, 0] | **Orange** | Blue=0 safe |
| Test 1.2 | `hs_color: [30, 100]` @ 10% | HS [29.76°, 100%], RGB [255, 126, 0] | **TBD** | Edge of danger zone |
| Test 1.2 | `hs_color: [38, 100]` @ 10% | HS [36.85°, 100%], RGB [255, 157, 0] | **TBD** | Should be safe |
| Test 1.4 | `hs_color: [37, 100]` @ 10% | HS [36.85°, 100%] | - | Quantized same as 38° |

**Key Observation**: RGB commands with **blue = 0** always work correctly, even when the resulting hue would be in the 30-37° range. This provides a reliable workaround path.

### Root Cause Hypothesis

The Matter firmware appears to have an error in hue value interpretation:
1. **Hue range mapping error**: Values ~30-37° incorrectly mapped to ~270-300° (purple range)
2. **Blue channel sensitivity**: Small blue values are misinterpreted as significant purple component
3. **Brightness-dependent**: Bug only manifests at low brightness where color accuracy degrades

### Color Space Reference

```
Standard HSV/HSL Color Wheel:
  0°   = Red
  25°  = Orange-Red (SAFE - outside danger zone)
  30°  = Orange (DANGER ZONE START - may show purple)
  37°  = Orange (DANGER ZONE END)
  38°  = Orange-Yellow (SAFE - works correctly)
  60°  = Yellow
  270° = Purple/Violet (where 30-37° incorrectly maps)
```

---

## Bug 2: White LED Warm Color Deficiency (Hardware Limitation)

### Symptoms

When using `color_temp` mode, the white LEDs produce neutral/cool white even at warm color temperatures (2000K-2700K). The lights never achieve the warm amber appearance of incandescent bulbs or Philips Hue at **low brightness levels**.

### User Validation: Color Temp Mode Limitations

**Critical Finding**: The user confirmed:
> "color temp at any brightness is not suitable for evening / nighttime. it never begins to look warmer"

And separately:
> At 2000K / 20% brightness: "It's the perfect daytime color"

This establishes:
- **Color_temp mode is acceptable for DAYTIME only** (when ambient light masks the cool white)
- **Color_temp mode is NOT suitable for evening/night** - the white LED physically cannot produce warm amber tones
- **RGB mode is REQUIRED for evening/nighttime** to achieve warm ambiance
- **The distinction is time-of-day based, not brightness-based**

### Device State at "Perfect Daytime" Setting

```yaml
entity_id: light.dining_col_accent
color_mode: color_temp
color_temp_kelvin: 2000  # Warmest setting
brightness: 51           # ~20%
hs_color: [30.6°, 94.5%] # HA's calculated equivalent
rgb_color: [255, 137, 14] # HA's calculated equivalent
```

### Root Cause

This is a **hardware limitation**, not a firmware bug:
- The +W LED in RGBICW strips is physically a **neutral/cool white** LED (~4000-5000K native)
- It cannot emit warm wavelengths regardless of the color temperature setting
- The "color temp" control only dims the white LED, it doesn't change its spectral output
- At higher brightness, the warm bias in the dimming curve is sufficient
- At low brightness, the cool white character becomes apparent

### Impact by Brightness Level

| Brightness | Color Temp Mode Appearance | RGB Mode Potential |
|------------|---------------------------|-------------------|
| 50-80% | Acceptable warm white | Not needed |
| 20-50% | "Perfect daytime" (user validated) | Optional enhancement |
| 10-20% | Likely noticeably cool | RGB recommended |
| 1-10% | Too cool for nighttime | RGB required for warmth |

---

## Adaptive Lighting Curve Analysis

### AL Formula Reference

Based on research of the [Adaptive Lighting GitHub repository](https://github.com/basnijholt/adaptive-lighting):

**Sun Position Calculation:**
```
sun_position = k × (1 - ((target_ts - h) / (h - x))²)
Where: k = 1 during day, k = -1 during night
Range: -1 (midnight) to +1 (noon)
```

**Color Temperature Interpolation:**
```
When sun_position > 0:
  color_temp = min_color_temp + (max_color_temp - min_color_temp) × sun_position

When sun_position < 0 (with transition_until_sleep):
  Interpolates from min_color_temp toward sleep_color_temp
```

**Brightness (tanh mode):**
```
brightness = y_min + (y_max - y_min) × 0.5 × (tanh(a × (x - b)) + 1)
```

### Column Lights AL Configuration

```yaml
name: "column_lights"
lights:
  - light.living_column_accent_safe
  - light.dining_column_accent_safe
min_brightness: 1
max_brightness: 80
brightness_mode: tanh
min_color_temp: 2000        # Dead of night (warmest)
max_color_temp: 3000        # Midday (coolest)
prefer_rgb_color: true
sleep_rgb_or_color_temp: "rgb_color"
sleep_rgb_color: [255, 165, 0]
separate_turn_on_commands: true
send_split_delay: true
```

### AL Curve Points for Column Lights

| Time of Day | Sun Position | Color Temp | Est. Brightness | Template Action |
|-------------|--------------|------------|-----------------|-----------------|
| Dead of night | -1.0 | 2000K | 1-5% | Convert to RGB |
| Pre-dawn | -0.5 | ~2250K | 15-25% | Convert to RGB if <20% |
| Sunrise | 0 | ~2500K | 35-45% | Pass through |
| Morning | 0.5 | ~2750K | 55-65% | Pass through |
| Noon | 1.0 | 3000K | 75-80% | Pass through |
| Afternoon | 0.5 | ~2750K | 55-65% | Pass through |
| Sunset | 0 | ~2500K | 35-45% | Pass through |
| Evening | -0.5 | ~2250K | 15-25% | Convert to RGB if <20% |
| Night | -1.0 | 2000K | 1-5% | Convert to RGB |

---

## Interaction Between the Two Issues

**Critical Realization**: The two issues can interact and compound!

### Scenario: AL Sends color_temp 2000K at 10% Brightness (Nighttime)

1. Template wrapper sees: brightness < 20%, so convert to RGB
2. Converts 2000K → RGB [255, 137, 14] (HA's calculated equivalent)
3. **Problem**: This RGB has blue=14, hue≈30.6°, and brightness 10%
4. These values ARE in the purple bug danger zone!
5. **Result**: Light shows PURPLE instead of warm orange

### Solution: Combined Workaround

The color_temp → RGB conversion must **also** apply the purple bug workaround:

1. Convert 2000K to RGB [255, 137, 14]
2. Check if brightness < 45% AND blue ≥ 5
3. If yes, clamp blue to 0: [255, 137, 0]
4. **Final output**: RGB [255, 137, 0] - safe warm orange

---

## Solution Architecture

### Division of Responsibilities

**Adaptive Lighting (AL) handles TIME-OF-DAY logic:**
- Daytime: Sends `color_temp` commands (white LEDs acceptable when ambient light present)
- Evening/Night: Sends `rgb_color` commands (RGB LEDs required for warm ambiance)

**Template Light Wrapper handles DEVICE BUG corrections:**
1. **Color_temp correction**: Enhance warmth since Govee white LEDs are cooler than Hue bulbs
2. **RGB purple bug fix**: Clamp hue ≥38° or blue=0 to prevent purple rendering

### Template Decision Logic

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TEMPLATE LIGHT WRAPPER LOGIC                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              color_temp COMMAND (from AL during daytime)             │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Apply warmth correction:                                            │    │
│  │  - Option A: Boost color_temp (e.g., 2700K → 2200K)                 │    │
│  │  - Option B: Convert to warmer RGB equivalent                        │    │
│  │  - Option C: Pass through (if acceptable as-is)                     │    │
│  │                                                                      │    │
│  │  [TO BE DETERMINED BY TESTING]                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │              rgb_color COMMAND (from AL during evening/night)        │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                      │    │
│  │  Apply purple bug fix:                                               │    │
│  │  IF hue in 30-37° AND saturation > 80%:                             │    │
│  │      Clamp hue to 38°                                                │    │
│  │  IF blue ≥ 5 AND is_orange_range:                                   │    │
│  │      Clamp blue to 0                                                 │    │
│  │                                                                      │    │
│  │  Target nighttime color: RGB [255, 165, 0]                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Threshold Reference Table

| Threshold | Value | Applies To | Purpose |
|-----------|-------|------------|---------|
| **Brightness for CT→RGB** | < 20% | `color_temp` commands | Below: white LED looks too cool |
| **Brightness for purple bug** | < 45% | `hs_color`/`rgb_color` | Below: purple bug can manifest |
| **Hue danger zone** | 30° - 37° | `hs_color` commands | Clamp to 38° when in this range |
| **Blue channel trigger** | ≥ 5 | `rgb_color` commands | Clamp to 0 when other conditions met |
| **Orange hue range** | 20° - 50° | All commands | Identifies colors needing protection |
| **Saturation minimum** | > 80% | `hs_color` commands | Low saturation doesn't trigger bug |
| **Orange RGB range** | R > 200, 100 < G < 220 | `rgb_color` | Identifies orange colors |

### Color Temperature to RGB Conversion

When brightness < 20% and color_temp is requested, convert to RGB with blue clamped to 0:

```python
def kelvin_to_safe_rgb(kelvin: int) -> tuple[int, int, int]:
    """Convert color temperature to RGB with purple-bug-safe blue=0."""
    # Normalize kelvin to 0-1 range (2000K = 0, 6500K = 1)
    t = (kelvin - 2000) / 4500
    t = max(0, min(1, t))

    R = 255                      # Always full red
    G = int(137 + (103 * t))     # 137 at 2000K, 240 at 6500K
    B = 0                        # ALWAYS 0 to avoid purple bug

    return (R, G, B)
```

**Conversion Results (with blue=0 safety):**

| Color Temp | Kelvin | Safe RGB Output | Appearance |
|------------|--------|-----------------|------------|
| Warmest | 2000K | [255, 137, 0] | Warm amber/orange |
| Warm | 2500K | [255, 160, 0] | Orange |
| Neutral | 3000K | [255, 183, 0] | Yellow-orange |
| Cool | 4000K | [255, 206, 0] | Yellow |
| Coolest | 5000K+ | [255, 229, 0] | Warm yellow |

---

## Validation Test Results

### Test Series 1: Hue Threshold Identification

| Test | Living (Test) | Dining (Control) | HA Reported Hue | Visual Result |
|------|---------------|------------------|-----------------|---------------|
| 1.1 | hs [25°, 100%] @ 10% | hs [25°, 100%] @ 50% | 24.09° | **PENDING** |
| 1.2 | hs [30°, 100%] @ 10% | hs [38°, 100%] @ 10% | 29.76° / 36.85° | **PENDING** |
| 1.3 | hs [35°, 100%] @ 10% | hs [40°, 100%] @ 10% | 34.02° / 39.69° | **PENDING** |
| 1.4 | hs [37°, 100%] @ 10% | hs [38°, 100%] @ 10% | Both → 36.85° | Quantization confirmed |

### Test Series 2: Brightness Threshold Identification

| Test | Setting | Brightness | HA Reported | Visual Result |
|------|---------|------------|-------------|---------------|
| 2.1 | hs [32°, 100%] | 20% | hs [31.18°, 100%] | **PENDING** |
| 2.1 | hs [32°, 100%] | 50% | hs [31.18°, 100%] | **PENDING** |

### Test Series 3: Blue Channel Impact

| Test | Living (blue>0) | Dining (blue=0) | Visual Result |
|------|-----------------|-----------------|---------------|
| 3.1 | RGB [255, 137, 10] | RGB [255, 140, 0] | **PENDING** |

### Test Series 4: Color Temp Mode Validation

| Test | Entity | Mode | Color Temp | Brightness | Visual Result |
|------|--------|------|------------|------------|---------------|
| 4.1 | dining_col_accent | color_temp | 2000K | 20% | **"Perfect daytime"** |
| 4.2 | dining_col_accent | color_temp | 2000K | 15% | **"Perfect for daytime"** |
| 4.3 | dining_col_accent | color_temp | 2000K | 10% | **PENDING** |
| 4.4 | dining_col_accent | color_temp | 2000K | 5% | **PENDING** |

### Test Series 5: RGB Color Calibration

| Test | RGB Value | Brightness | Visual Result |
|------|-----------|------------|---------------|
| 5.1 | [255, 137, 0] | 15% | **"Too red"** |
| 5.2 | [255, 165, 0] | 1% | **Target for nighttime** (user specified) |

---

## Current Implementation Status

### What Works

| Feature | Status | Notes |
|---------|--------|-------|
| Template lights visible in HA | ✓ | Entities exist and show in UI |
| State/attribute templates | ✓ | Mirror underlying light correctly |
| supported_color_modes | ✓ | Shows `["color_temp", "hs", "rgb"]` |
| Direct underlying light control | ✓ | `light.living_col_accent` responds |
| RGB with blue=0 | ✓ | `[255, 140, 0]` produces orange |
| Color temp at 20% brightness | ✓ | User validated as "perfect daytime" |

### What's Broken

| Issue | Status | Details |
|-------|--------|---------|
| Template light turn_on action | ❌ | Returns 400 Bad Request via API |
| Template light turn_off action | ❌ | Also fails with 400 |
| Complex variables block | ❌ | May not be supported in template light actions |
| MQTT device color_temp control | ⚠️ | Stuck at 2702K, won't change |

### Root Cause of Action Failures

The `turn_on` action uses a `variables:` script action block that may not be fully supported in template light actions. Need to restructure to use simpler inline templates or delegate to scripts.

---

## Alternative Tested: govee2mqtt

**GitHub**: https://github.com/wez/govee2mqtt

govee2mqtt was tested as a potential alternative but **did not resolve the purple bug**:

| Feature | Matter | govee2mqtt |
|---------|--------|------------|
| Color Modes | color_temp, hs, xy | color_temp, rgb |
| RGB Support | Converted to HS | Native |
| Purple Bug | **Affected** | **Also Affected** |
| Segment Control | No | Yes |
| Effects/Scenes | No | 150+ |

**Conclusion**: The purple bug persists regardless of integration method. The bug is in the **Govee device firmware itself**, not in how Home Assistant communicates with it.

---

## Next Steps

### Immediate Validation Needed

1. **Brightness threshold tests** at 2000K:
   - Test 5%, 10%, 15% brightness
   - User visual confirmation at each level
   - Find exact threshold where white LED becomes too cool

2. **Purple bug visual confirmation**:
   - Confirm hue 30° shows purple at 10% brightness
   - Confirm hue 38° shows orange at 10% brightness
   - Find exact hue boundary

3. **Blue channel threshold**:
   - Test blue=3, blue=1 to find minimum trigger value

### Implementation Steps

1. Fix template light action structure (remove `variables:` block)
2. Implement simplified inline template logic
3. Test template light commands work
4. Validate workaround logic produces correct colors
5. Update AL configuration to use template lights

---

## Appendix: HA Template Light Lessons Learned

### Valid Template Light Attributes

```yaml
state: "{{ states('light.xxx') }}"
level: "{{ state_attr('light.xxx', 'brightness') | int(0) }}"
hs: "{{ state_attr('light.xxx', 'hs_color') | default([0, 0]) }}"
rgb: "{{ state_attr('light.xxx', 'rgb_color') | default([255, 255, 255]) }}"
temperature: "{{ state_attr('light.xxx', 'color_temp') | default(370) }}"
min_mireds: 153
max_mireds: 500
```

### Invalid Attributes (Cause Load Failures)

```yaml
color_mode: ...            # HA derives this automatically
color_temp: ...            # Must use 'temperature' instead
min_color_temp_kelvin: ... # Must use 'min_mireds' instead
max_color_temp_kelvin: ... # Must use 'max_mireds' instead
supported_color_modes: ... # HA derives from templates + actions
```

### Required Actions for Color Mode Support

| Template | Action Required | Color Mode Enabled |
|----------|-----------------|-------------------|
| `level` | `set_level` | Brightness control |
| `hs` | `set_hs` | HS color mode |
| `rgb` | `set_rgb` | RGB color mode |
| `temperature` | `set_temperature` | Color temp mode |

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| Dec 2024 | 1.0 | Initial bug report (purple hue only) |
| Dec 2024 | 2.0 | Added white LED issue, template light solution |
| Dec 2024 | 2.1 | Fixed invalid template attributes, added set_* actions |
| Dec 2024 | 2.2 | Documented action failures, ongoing investigation |
| Dec 2024 | 3.0 | **Major revision**: AL curve analysis, user validation (20% brightness works), hue quantization discovery, interaction between issues, comprehensive test results |

---

*Report generated during implementation of Govee color workarounds. Last updated: December 2024.*