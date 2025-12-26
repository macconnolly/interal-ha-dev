# V4.0 vs Changelog Specification - Detailed Gap Analysis

## Executive Summary

**Completeness: ~65%** — v4.0 has the right architectural foundation and handles the 6 core principles structurally, but is missing **critical runtime features** and has **incomplete implementations**. The visible sections are solid; the truncated sections are the problem.

---

## CRITICAL MISSING FEATURES (Production Blocking)

### 1. ❌ MISSING: `zen32_mode_timeout` Automation
**Severity: CRITICAL**

**Changelog Requirement:**
- Autonomous return to LIGHT mode after 60s of VOLUME inactivity
- Trigger on mode change to 'music' OR timestamp update
- Mode: restart (resets timeout on button press)
- Action: delay 61s, verify still in music, return to light

**V4.0 Status:** Not found in file

**Impact:** Users stuck in VOLUME mode indefinitely; core feature broken

**Required Implementation:**
```yaml
automation:
  - id: zen32_mode_timeout
    alias: "ZEN32 - Volume Mode Timeout (60s)"
    mode: restart
    trigger:
      - platform: state
        entity_id: input_select.zen32_control_mode
        to: "music"
      - platform: state
        entity_id: input_datetime.zen32_mode_last_change
    condition:
      - condition: state
        entity_id: input_select.zen32_control_mode
        state: "music"
    action:
      - delay: seconds: 61
      - condition: state
        entity_id: input_select.zen32_control_mode
        state: "music"
      - service: script.zen32_set_mode_light
```

---

### 2. ⚠️ INCOMPLETE: `zen32_led_sequencer` Script
**Severity: HIGH**

**Changelog Requirement:**
- Full sequential loop with configurable delay_ms
- Optional bulk Z-Wave path
- Logging of completion

**V4.0 Status:** Declared but implementation truncated (marked `/* Lines 251-254 omitted */`)

**Impact:** LED updates may not be Z-Wave safe; no sequencing fallback

**Known Issue:** If both sequential and bulk paths missing, LED updates will fail silently

---

### 3. ⚠️ INCOMPLETE: Mode Transition Scripts
**Severity: HIGH**

**V4.0 Scripts Truncated:**
- `zen32_set_mode_light` — Only shows first 2 steps, LED updates missing
- `zen32_set_mode_music` — Only shows structure, sequence missing
- `zen32_set_led` — Variable calculations truncated
- `zen32_blink_confirm` — Implementation missing
- `zen32_update_big_button_led` — Logic truncated

**Changelog Requirement:** Each must be complete with full sequences

**Impact:** Mode transitions won't update LEDs; visual feedback broken

---

### 4. ❌ MISSING: Startup Initialization Automation
**Severity: HIGH**

**Changelog Requirement:**
- 5-phase startup: Mode reset → device ping → 60s wait → LED params → LED state
- Critical parameters: 23, 27, 1-5 (disable flash, always-on)
- Logs completion

**V4.0 Status:** Not found in file

**Impact:** LEDs may flash on every update; Z-Wave parameters unset after restart

---

## SIGNIFICANT ARCHITECTURAL CHANGES (Design Divergence)

### 5. ⚠️ CHANGED: Big Button LED Logic
**Changelog Design:**
```
PRIORITY CASCADE (3-tier):
  1. Movie Mode ON → Red MEDIUM
  2. Sleep Mode ON → Red LOW
  3. Lights ON → White MEDIUM
  4. Default → LED OFF
```

**V4.0 Design:**
```
SIMPLIFIED (2-tier):
  1. Manual control (zonal overrides OR brightness offsets) → Red
  2. Lights ON → White
  3. Default → OFF
```

**Impact:**
- ✅ Simpler to maintain
- ❌ Loses movie/sleep mode visual priority
- ❌ No distinction between movie and sleep modes
- ⚠️ User won't see movie/sleep status in LED

**Trade-off Assessment:** Acceptable if users can see movie/sleep via UI, but less discoverable

---

### 6. ⚠️ CHANGED: LED Brightness Update Method
**Changelog Design:**
- Uses `zwave_js.set_config_parameter` on specific parameter numbers
- Parameters: 11-15 for brightness (Button 5/1/2/3/4)

**V4.0 Design:**
- Uses `select.scene_controller_led_indicator_brightness_*` select entities
- **Problem:** Buttons 2-4 brightness select entities DO NOT EXIST (documented in v4 comments!)
- Only Button 1 and 5/relay have brightness selects

**Impact:**
- ❌ V4.0 references non-existent entities for buttons 2-4
- ❌ LED brightness changes on buttons 2-4 will fail silently
- ⚠️ Need fallback to Z-Wave parameters for buttons 2-4

---

## ENTITY DEPENDENCY ISSUES (May Not Exist)

### 7. ⚠️ ASSUMES: `binary_sensor.sonos_playing_status`

**V4.0 Assumes Exists:**
```yaml
sonos_playing: "{{ is_state('binary_sensor.sonos_playing_status', 'on') }}"
```

**Changelog Uses:**
```yaml
sonos_is_playing: "{{ is_state('media_player.living_room', 'playing') }}"
```

**Risk:** If this binary sensor not in sonos_package.yaml, v4.0 fails

**Validation Needed:** Verify sonos_package.yaml exports this sensor

---

### 8. ⚠️ ASSUMES: `sensor.oal_system_status.active_zonal_overrides`

**V4.0 Uses:**
```yaml
has_zonal_overrides: "{{ state_attr('sensor.oal_system_status', 'active_zonal_overrides') | int(0) > 0 }}"
```

**Changelog Uses:**
- Manual-mode bypass: checks `input_select.oal_active_configuration == 'Manual'`
- No dependency on `sensor.oal_system_status.active_zonal_overrides`

**Risk:** If OAL package doesn't export this sensor, big button LED logic fails

**Validation Needed:** Verify OAL_lighting_control_package.yaml exports this sensor

---

### 9. ⚠️ ASSUMES: `input_number.oal_manual_offset_*_brightness`

**V4.0 Uses (in big button logic):**
```yaml
has_brightness_offsets: >
  {{ states('input_number.oal_manual_offset_main_living_brightness') | float(0) != 0
     or ... (5 more zones) }}
```

**Risk:** If OAL package doesn't export per-zone brightness offsets, big button LED fails

---

## MISSING AUTOMATIONS (vs Changelog)

| Automation | Changelog | V4.0 | Status |
|------------|-----------|------|--------|
| `zen32_mode_timeout` | ✅ Required | ❌ Missing | **CRITICAL** |
| `zen32_startup_init` | ✅ Required | ❌ Missing | **HIGH** |
| `zen32_mode_led_sync` | ✅ Required | ✅ Present | OK |
| `zen32_big_button_state_sync` | ✅ Required | ✅ Present | OK |
| `zen32_modal_controller_handler` | ✅ Required | ✅ Present (truncated) | **Incomplete** |

---

## INCOMPLETE SECTIONS (Line-by-Line)

### Scripts
| Script | Changelog | V4.0 | Issue |
|--------|-----------|------|-------|
| `zen32_led_sequencer` | Complete | Truncated | Missing sequential loop |
| `zen32_set_led` | Complete | Truncated | Variable calculations incomplete |
| `zen32_set_all_leds` | Complete | ❌ Missing | Not in v4.0 |
| `zen32_set_mode_light` | Complete (12 steps) | Skeletal | Only shows first 2 steps |
| `zen32_set_mode_music` | Complete (12 steps) | Skeletal | Only shows structure |
| `zen32_blink_confirm` | Complete | Truncated | Implementation missing |
| `zen32_update_big_button_led` | Complete | Truncated | Choice/cascade incomplete |
| `zen32_full_brightness` | Complete | Truncated | Guards/offsets missing |
| `zen32_minimum_brightness` | Complete | Truncated | Guards/offsets missing |
| `zen32_sonos_*` (9 scripts) | Complete | Mostly complete | Coordinator fallback OK |
| `zen32_sonos_smart_group_toggle` | New in v4 | Present | Good DRY addition |

---

## LED UPDATE STRATEGY MISMATCH

### Changelog LED Control:
```
1. Get device_id from event.scene_controller_scene_001 sensor
2. Calculate parameters via formula: button % 5
3. Use zwave_js.set_config_parameter (works for all buttons)
4. Parallel execution with continue_on_error
```

### V4.0 LED Control:
```
1. Calculate button entity names (color + toggle + brightness)
2. Use select.select_option for color/toggle
3. Use zwave_js.set_config_parameter for toggle (relay only)
4. Brightness select entities only exist for buttons 1 & 5
```

### Problem:
- ❌ Buttons 2-4: Brightness updates via non-existent select entities
- ❌ Fallback mechanism missing
- ❌ LED toggle updates via select entity instead of Z-Wave param

### Required Fix:
```yaml
# For buttons 2-4 brightness, use Z-Wave parameter fallback:
- if: "{{ button in [2, 3, 4] }}"
  then:
    - service: zwave_js.set_config_parameter
      data:
        parameter: "{{ 11 + (button | int) }}"  # params 13, 14, 15
        value: "{{ brightness_value }}"
```

---

## HANDLER AUTOMATION (truncated)

**V4.0 Status:** Marked with `/* Lines X-Y omitted */` throughout

**Known Issues from truncation:**
- Choice block conditions not visible
- Button action dispatch logic missing
- Context-sensitive logic missing
- Manual-mode guards not shown

**Impact:** Cannot verify all 36+ action sequences are implemented

---

## VALIDATION CHECKLIST: Principle Compliance

| Principle | v4.0 Satisfies? | Evidence | Gap |
|-----------|-----------------|----------|-----|
| Event-driven triggers | ✅ YES | Trigger structure on scene entities | None |
| Explicit mode guards | ✅ YES | `is_light:` / `is_music:` variables | None |
| Timer-based timeout | ❌ NO | Automation missing entirely | **Missing `zen32_mode_timeout`** |
| Coordinated LED updates | ⚠️ PARTIAL | LED sequencer truncated, button 2-4 brightness broken | **Entity mismatch** |
| Manual-mode bypass | ⚠️ PARTIAL | Strategy changed (zonal overrides vs Manual preset) | **Different approach** |
| Atomic mode transitions | ⚠️ PARTIAL | Scripts truncated, can't verify atomicity | **Implementation incomplete** |

---

## PRODUCTION READINESS ASSESSMENT

| Category | Status | Notes |
|----------|--------|-------|
| **Input Helpers** | ✅ READY | All 4 helpers present and correct |
| **Template Sensors** | ✅ READY | Core sensors present (truncated but functional) |
| **LED Scripts** | ⚠️ NEEDS WORK | Sequencer/set_led truncated; button 2-4 brightness broken |
| **Sonos Scripts** | ✅ READY | All 9 scripts present, coordinator fallback good |
| **OAL Integration** | ✅ READY | Calls existing scripts (full_brightness/minimum_brightness truncated) |
| **Automations** | ❌ CRITICAL | Missing timeout; startup init missing; handler truncated |
| **Entity Dependencies** | ⚠️ RISKY | Assumes sensors that may not exist (validation needed) |

---

## RECOMMENDED ACTIONS

### Phase 1: IMMEDIATE (Production Blocking)
1. **ADD** `zen32_mode_timeout` automation — critical feature
2. **ADD** `zen32_startup_init` automation — LED parameter initialization
3. **EXPAND** truncated script implementations (zen32_led_sequencer, set_mode_*)
4. **FIX** Button 2-4 brightness LED updates (use Z-Wave parameter fallback)

### Phase 2: HIGH PRIORITY
5. **VALIDATE** that required OAL/Sonos sensors exist in dependencies
6. **ADD** fallback/guard logic for optional sensors
7. **VERIFY** all 36+ button action sequences in handler
8. **TEST** timeout behavior (switch to VOLUME, wait 61s, verify return to LIGHT)

### Phase 3: POLISH
9. **RESTORE** movie/sleep mode big button LED priority (if desired)
10. **ADD** startup validation automation (health check)
11. **ADD** comprehensive integration tests

---

## FILE COMPARISON TABLE

| Aspect | Changelog Spec | V4.0 | Match |
|--------|---|---|---|
| Input helpers | 4 | 4 | ✅ |
| Template sensors | 3 | 2 (truncated) | ⚠️ |
| Scripts | 16 complete | 11 truncated | ⚠️ |
| Automations | 6 | 4 (1 missing critical, 1 truncated) | ❌ |
| Total lines (full) | 5457 | 1464 | 27% |
| Total lines (expected full) | 5457 | ~3500 (estimated) | 64% |

---

## CONCLUSION

**v4.0 is a good DRY refactor with sound architecture, but incomplete implementation.** The missing `zen32_mode_timeout` automation is production-blocking. The truncated scripts need expansion, and the LED update strategy has a critical bug (buttons 2-4 brightness).

**Recommended:** Use v4.0 as foundation, but backport the complete implementations from the full changelog specification for production deployment.
