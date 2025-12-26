# ZEN32 Modal Scene Controller - Design Specification

## Status: v3.0 - Complete Redesign (2025-12-25)

---

## Executive Summary

The ZEN32 functions as a **modal controller** with two primary control contexts:
- **LIGHT Mode** (default) - Controls OAL lighting brightness and color temperature
- **VOLUME Mode** - Controls Sonos playback and volume

LED colors indicate the active mode. UP/DOWN buttons are context-sensitive.

---

## Hardware Reference

### Zooz ZEN32 Specifications
- 5 physical buttons: 1 large center (relay) + 4 small corners
- Each button: 7 LED colors, 3 brightness levels
- Each button: 7 interactions (1x-5x tap, hold, release)
- Z-Wave multi-tap detection window: ~300-500ms (device-level constraint)

### Physical Layout

```
        ┌─────────────────────────┐
        │                         │
        │   ┌─────────────────┐   │
        │   │    💡           │   │
        │   │   LIGHTS        │   │  [5] Big button (relay)
        │   │              •  │   │  LED: White=on, Red=Manual, Off=off
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡    • │ │ •    +  ││  [1] LIGHT    [2] UP
        │  │ LIGHT   │ │   UP    ││  Mode select   Increase
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵    • │ │ •    -  ││  [3] VOLUME   [4] DOWN
        │  │ VOLUME  │ │  DOWN   ││  Mode+Play    Decrease
        │  └─────────┘ └─────────┘│
        │                         │
        └─────────────────────────┘
```

---

## Unified Button/Parameter Reference

| Position | Name | Scene # | Event Key | Z-Wave Params | Select Entity Suffix |
|----------|------|---------|-----------|---------------|---------------------|
| Top-Left | LIGHT | 1 | '001' | Toggle:2, Color:7, Bright:12 | `button_1` |
| Top-Right | UP | 2 | '002' | Toggle:3, Color:8, Bright:13 | `button_2` |
| Bottom-Left | VOLUME | 3 | '003' | Toggle:4, Color:9, Bright:14 | `button_3` |
| Bottom-Right | DOWN | 4 | '004' | Toggle:5, Color:10, Bright:15 | `button_4` |
| Center | LIGHTS | 5 | '005' | Toggle:1, Color:6, Bright:11 | `relay` |

### Event Entity Mapping

| Button | Event Entity | Event Types |
|--------|--------------|-------------|
| 1 (LIGHT) | `event.scene_controller_scene_001` | KeyPressed, KeyPressed2x, KeyPressed3x, KeyHeldDown, KeyReleased |
| 2 (UP) | `event.scene_controller_scene_002` | (same) |
| 3 (VOLUME) | `event.scene_controller_scene_003` | (same) |
| 4 (DOWN) | `event.scene_controller_scene_004` | (same) |
| 5 (BIG) | `event.scene_controller_scene_005` | (same) |

---

## LED Control Implementation

### Available Select Entities

#### Color Control
| Entity | Options |
|--------|---------|
| `select.scene_controller_led_indicator_color_relay` | White, Blue, Green, Red, Magenta, Yellow, Cyan |
| `select.scene_controller_led_indicator_color_button_1` | (same) |
| `select.scene_controller_led_indicator_color_button_2` | (same) |
| `select.scene_controller_led_indicator_color_button_3` | (same) |
| `select.scene_controller_led_indicator_color_button_4` | (same) |

#### Toggle Mode Control
| Entity | Options |
|--------|---------|
| `select.scene_controller_led_indicator_button_1` | On when load is off, On when load is on, Always off, Always on |
| `select.scene_controller_led_indicator_button_2` | (same) |
| `select.scene_controller_led_indicator_button_3` | (same) |
| `select.scene_controller_led_indicator_button_4` | (same) |

#### Flash Disable (Critical)
| Entity | Required Value | Purpose |
|--------|----------------|---------|
| `select.scene_controller_led_settings_indicator` | **Disable** | Prevents LED flash on button press |

### Service Call Pattern

```yaml
# Set color
- service: select.select_option
  target:
    entity_id: select.scene_controller_led_indicator_color_button_1
  data:
    option: "Yellow"

# Turn LED on
- service: select.select_option
  target:
    entity_id: select.scene_controller_led_indicator_button_1
  data:
    option: "Always on"

# Turn LED off
- service: select.select_option
  target:
    entity_id: select.scene_controller_led_indicator_button_1
  data:
    option: "Always off"
```

---

## LED State Specification

### Core Principle

**Same color = same function.** All buttons in the active mode share the same color.

### LIGHT Mode (Default)

```
        ┌─────────────────────────┐
        │   ┌─────────────────┐   │
        │   │    💡       ○   │   │  [5] BIG: White/Red/Off (see below)
        │   │   LIGHTS        │   │
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡  🟡  │ │  🟡  +  ││  [1] LIGHT: YELLOW ON
        │  │ LIGHT   │ │   UP    ││  [2] UP: YELLOW ON
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵  ⚫  │ │  🟡  -  ││  [3] VOLUME: OFF
        │  │ VOLUME  │ │  DOWN   ││  [4] DOWN: YELLOW ON
        │  └─────────┘ └─────────┘│
        └─────────────────────────┘
```

| Button | Color | Toggle State |
|--------|-------|--------------|
| 1 (LIGHT) | Yellow | Always on |
| 2 (UP) | Yellow | Always on |
| 3 (VOLUME) | - | **Always off** |
| 4 (DOWN) | Yellow | Always on |

### VOLUME Mode

```
        ┌─────────────────────────┐
        │   ┌─────────────────┐   │
        │   │    💡       ○   │   │  [5] BIG: (unchanged)
        │   │   LIGHTS        │   │
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡  ⚫  │ │  🔵  +  ││  [1] LIGHT: OFF
        │  │ LIGHT   │ │   UP    ││  [2] UP: BLUE ON
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵  🔵  │ │  🔵  -  ││  [3] VOLUME: BLUE ON
        │  │ VOLUME  │ │  DOWN   ││  [4] DOWN: BLUE ON
        │  └─────────┘ └─────────┘│
        └─────────────────────────┘
```

| Button | Color | Toggle State |
|--------|-------|--------------|
| 1 (LIGHT) | - | **Always off** |
| 2 (UP) | Blue | Always on |
| 3 (VOLUME) | Blue | Always on |
| 4 (DOWN) | Blue | Always on |

### Big Button (5/Relay) - Mode Independent

| Condition | Color | Toggle State |
|-----------|-------|--------------|
| `input_select.oal_active_configuration` == "Manual" | **Red** | Always on |
| `light.all_adaptive_lights` == "on" | White | Always on |
| `light.all_adaptive_lights` == "off" | - | Always off |

**Note:** Big button state is independent of LIGHT/VOLUME mode. It always reflects light system state.

**Big button LED implementation detail:** Use the relay-specific select entities for the big button LED — `select.scene_controller_led_indicator_color_relay` and `select.scene_controller_led_indicator_brightness_relay` — rather than repurposing per-button toggle selects. This keeps the relay LED authoritative and avoids conflicting logic between per-button trackers and the relay state.

**Big button LED implementation detail:** Use the relay-specific select entities for the big button LED — `select.scene_controller_led_indicator_color_relay` and `select.scene_controller_led_indicator_brightness_relay` — rather than repurposing per-button toggle selects. This keeps the relay LED authoritative and avoids conflicting logic between per-button trackers and the relay state.

---

## Mode Timeout Behavior

### Specification

- **Timeout:** 60 seconds of no interaction while in VOLUME mode
- **Trigger:** Any button press resets the timer
- **Action:** Silently return to LIGHT mode (update LEDs)
- **Playback:** Music continues - only control context changes

### Implementation (Timer Helper)

```yaml
timer:
  zen32_volume_timeout:
    name: "ZEN32 Volume Mode Timeout"
    duration: "00:01:00"
    restore: true  # Survives HA restarts
    icon: mdi:timer-outline

automation:
  - id: zen32_timeout_handler
    alias: "ZEN32 - Volume Mode Timeout"
    trigger:
      - platform: event
        event_type: timer.finished
        event_data:
          entity_id: timer.zen32_volume_timeout
    action:
      - service: script.zen32_set_mode_light
```

**Why Timer Helper vs Automation Delay:**
- `restore: true` survives HA restarts
- Remaining time visible in UI
- Can be cancelled explicitly
- Cleaner separation of concerns

**Implementation rules (critical):**
- **Every interaction must `timer.start`** — all button handlers, mode-switch scripts, and interaction entry points MUST call `timer.start` for `timer.zen32_volume_timeout` to reliably extend the timeout window.
- **Cancel on return to LIGHT mode:** `script.zen32_set_mode_light` must call `timer.cancel` for `timer.zen32_volume_timeout` to avoid false timeouts after mode transitions.
- **Confirm configuration:** Ensure `timer.zen32_volume_timeout` is created with `restore: true` and add a small validation test that calls `service: timer.start` and verifies `timer.finished` fires as expected after the duration.

---

## Complete Action Mapping

### Button 1 (LIGHT) - Mode Selector

| Action | LIGHT Mode | VOLUME Mode |
|--------|------------|-------------|
| **1x Press** | Cycle OAL presets (skip Manual) | Switch to LIGHT mode |
| **2x Press** | Full brightness (100%) | Switch + Full brightness |
| **Hold** | Color temp warmer | Switch to LIGHT mode |

### Button 2 (UP) - Context-Sensitive Increase

| Action | LIGHT Mode (on) | LIGHT Mode (off) | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|-----------------|------------------|----------------------|----------------------|
| **1x Press** | Brightness +15% | Turn ON | Volume +10% | Start playback |
| **2x Press** | Full brightness | Turn ON → 100% | Default volume (50%) | Start → 50% |
| **Hold** | Color temp cooler | Turn ON → cooler | Next track | Start → next track |

### Button 3 (VOLUME) - Mode Selector + Play Control

| Action | LIGHT Mode | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|------------|----------------------|----------------------|
| **1x Press** | Switch + Start if stopped | Pause | Start playback |
| **2x Press** | Switch + Ungroup all | Ungroup all | Ungroup all |
| **Hold** | Switch + Group all | Group all speakers | Group all speakers |

### Button 4 (DOWN) - Context-Sensitive Decrease

| Action | LIGHT Mode (on) | LIGHT Mode (off) | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|-----------------|------------------|----------------------|----------------------|
| **1x Press** | Brightness -15% | Turn ON → minimum | Volume -10% | (no action) |
| **2x Press** | Minimum brightness | Turn ON → minimum | Mute toggle | (no action) |
| **Hold** | Color temp warmer | Turn ON → warmer | Previous track | (no action) |

### Button 5 (BIG) - Mode-Independent Master

| Action | Behavior |
|--------|----------|
| **1x Press** | Toggle all adaptive lights |
| **2x Press** | Clear all manual overrides (reset to Adaptive preset) |
| **Hold** | (reserved) |

---

## State Architecture

### Required Helpers (Minimal Footprint)

```yaml
input_select:
  zen32_control_mode:
    name: "ZEN32 Control Mode"
    options:
      - "light"
      - "volume"
    initial: "light"
    icon: mdi:toggle-switch-variant

timer:
  zen32_volume_timeout:
    name: "ZEN32 Volume Mode Timeout"
    duration: "00:01:00"
    restore: true
    icon: mdi:timer-outline
```

### State NOT Stored (Derived Instead)

| State | Derived From |
|-------|--------------|
| Big button color | `input_select.oal_active_configuration`, `light.all_adaptive_lights` |
| Sonos playing | `states('media_player.living_room')` in ['playing', 'buffering', 'paused'] |
| Lights on/off | `states('light.all_adaptive_lights')` |
| Manual control active | `states('input_select.oal_active_configuration') == 'Manual'` |

### Entities That Already Exist (No Changes)

- `input_select.oal_active_configuration` - OAL preset selector
- `light.all_adaptive_lights` - Light group
- `media_player.living_room` - Sonos coordinator
- `input_number.sonos_favorite_index` - Favorites cycling counter

---

## Home Assistant Best Practices for Modal Controllers

### 1. Event-Driven vs State-Driven Architecture

**Recommendation:**
- Use **event-driven triggers** for button presses that are stateless (Central Scene, multi-tap, hold)
- Use **state-driven triggers** when the device exposes persistent state you care about (relay on/off)

**Why:**
- Events are precise and intentful (scene/multi-tap/hold) - no ambiguity, simpler to map to modes
- State triggers are good for long-lived conditions with built-in `for:` and attribute semantics

**Latency & Reliability:**
- Latency is dominated by wireless and node processing, not HA trigger choice
- Events are slightly faster (no intermediate entity update), but both are millisecond-comparable
- State triggers are more "forgiving" when entities are stable
- Events are more precise but require careful filtering and debouncing

**Practical Pattern for ZEN32:**
```yaml
# Button presses: use event entity triggers
trigger:
  - platform: state
    entity_id: event.scene_controller_scene_001
    id: "button_1"

# Relay state: use switch state trigger
trigger:
  - platform: state
    entity_id: switch.scene_controller_relay
```

---

### 2. Adaptive Lighting Manual Control Detection

**Key Rule:** Inspect the actual entity in Developer Tools - different AL versions expose fields differently.

**Common Forms:**
```yaml
# Direct attribute (most common)
state_attr('switch.adaptive_lighting_X', 'manual_control')

# Nested under configuration
state_attr('switch.adaptive_lighting_X', 'configuration')['manual_control']
```

**What the List Contains:** Entity IDs of lights in manual control (e.g., `["light.kitchen", "light.shelf"]`)

**Robust Template Check (safe across versions):**
```yaml
"{{ 'light.zone' in (state_attr('switch.adaptive_lighting_zone', 'manual_control') | default([]))
    or 'light.zone' in (state_attr('switch.adaptive_lighting_zone', 'configuration') | default({}).get('manual_control', [])) }}"
```

**For This Implementation:** We use `input_select.oal_active_configuration == 'Manual'` which is simpler and authoritative.

---

### 3. Mode Timeout Implementation

**Best Practice (Robust, Restart-Friendly):**
- Use **Timer helper** (`timer` integration) - persists across restarts
- Alternative: `input_datetime` + time trigger
- Avoid: automation with `delay:` - does NOT survive HA restart

**Recommended Patterns:**

**Timer Helper (Preferred):**
```yaml
timer:
  zen32_volume_timeout:
    duration: "00:01:00"
    restore: true  # CRITICAL: survives restarts

# On any interaction:
- service: timer.start
  target:
    entity_id: timer.zen32_volume_timeout

# On timeout:
trigger:
  - platform: event
    event_type: timer.finished
    event_data:
      entity_id: timer.zen32_volume_timeout
```

**Automation with mode: restart (Simpler but not restart-safe):**
```yaml
automation:
  mode: restart  # Each trigger restarts the delay
  trigger:
    - platform: state
      entity_id: input_select.zen32_control_mode
      to: "volume"
  action:
```

**Note on using `mode: restart`:** Use `mode: restart` only where intended — for example, automations that use an internal `delay:` to implement a timeout should use `mode: restart` so each trigger restarts the delay window. Prefer using the **Timer helper** for restart-safe, restart-surviving timeouts; use `mode: restart` for short-lived behavior where a running automation should be restarted on a new trigger.
    - delay: { seconds: 60 }
    - condition: state
        entity_id: input_select.zen32_control_mode
        state: "volume"
    - service: script.zen32_set_mode_light
```

**Why Timer is Preferred:**
- Survives HA restarts
- Remaining time visible in UI
- Explicit cancel/start semantics
- Easier to debug

---

### 4. LED Control: Select Entities vs zwave_js.set_config_parameter

**Recommendation:**
- Use **native select entities** (`select.scene_controller_led_indicator_*`) when available
- Use `zwave_js.set_config_parameter` only if select entity not exposed or bulk atomic update needed

**Why Select Entities:**
- Higher-level, readable, safer
- No need to remember parameter numbers or bitmasks
- Validation at integration level
- Easier to debug in UI

**Reliability & Latency:**
- Both route to same Z-Wave network - latency is similar
- Dominated by Z-Wave command throughput, not HA service choice

**Batching Considerations:**
```yaml
# Multiple select calls can run in parallel (but beware flooding the Z-Wave network)
- parallel:
    - service: select.select_option
      target:
        entity_id: select.scene_controller_led_indicator_color_button_1
      data:
        option: "Yellow"
    - service: select.select_option
      target:
        entity_id: select.scene_controller_led_indicator_color_button_2
      data:
        option: "Yellow"
```

**Caution:** Each call generates a Z-Wave message. For mass reconfiguration you have two safe approaches:

- **Small sequencing:** issue `select.select_option` calls with short, explicit delays (e.g., 50-200ms) or a small sequential loop instead of a large parallel block to avoid saturating the radio.

- **Bulk API:** when supported by the device, use `zwave_js.bulk_set_partial_config_parameters` to batch writes into a single node-level message.

Choose sequencing for frequent UI-driven updates and bulk API for initial/mass reconfiguration (firmware/config changes). Document the chosen approach in scripts that perform LED mass updates so the runbook clearly states the selected policy and parameters.

**Parallelization & variable safety:** When using `parallel:` in scripts or automations, **use unique variable names per parallel branch**, or avoid parallelizing actions that depend on shared script variables. Parallel branches run concurrently and can clobber shared variables or produce race conditions — prefer passing explicit per-branch data (e.g., `repeat.item`) and avoid relying on mutable shared variables inside parallel blocks.

---

### 5. Minimal State Footprint

**Guiding Principles:**
1. Derive state from authoritative entities (lights, media players, switches) wherever possible
2. Only store in helpers when persistence, UI visibility, or authoritative control is required

**Practical Guidelines:**

| Do This | Not This |
|---------|----------|
| `states('light.all_adaptive_lights')` | `input_boolean.lights_are_on` |
| `states('media_player.living_room')` | `input_boolean.music_playing` |
| Derive LED color from mode | `input_text.button_1_color` |
| `device_id('event.scene_controller_scene_001')` | `sensor.zen32_device_id` |

**When to Use Helpers (Decision Matrix):**

| Requirement | Use Helper? | Example |
|-------------|-------------|---------|
| Must persist across HA restart | Yes | `input_select.zen32_control_mode` |
| User needs to see/control in UI | Yes | `timer.zen32_volume_timeout` |
| No authoritative source exists | Yes | Control mode (invented concept) |
| Value exists on another entity | **No** | Light on/off state |
| Value can be computed | **No** | LED color based on mode |
| Transient state during script | **No** | Use script variables |

**State Derivation Examples:**
```yaml
# Big button color - derived, not stored
{% if states('input_select.oal_active_configuration') == 'Manual' %}
  Red
{% elif states('light.all_adaptive_lights') == 'on' %}
  White
{% else %}
  Off
{% endif %}

# Button colors - derived from mode, not stored
{% set mode = states('input_select.zen32_control_mode') %}
{% if mode == 'light' %}
  Yellow  # for buttons 1, 2, 4
{% else %}
  Blue    # for buttons 2, 3, 4
{% endif %}

# Sonos playing - read directly, never store
{% set playing = states('media_player.living_room') in ['playing', 'buffering'] %}
```

**Small Checklist:**
- [ ] Persist helper if restart robustness or manual override exposure needed
- [ ] Use short-lived helpers (`timer`) for timeouts
- [ ] Keep computed state derived via templates
- [ ] Do not write computed attributes back to helpers unless necessary

---

## Response Time Optimization

### Problem

OAL core adjustment engine runs periodically. When brightness is changed via button press, the change may not apply immediately.

### Solution

Immediately trigger the OAL engine after any brightness/warmth modification:

```yaml
# After changing brightness offset
- service: input_number.set_value
  target:
    entity_id: input_number.oal_offset_global_manual_brightness
  data:
    value: "{{ new_value }}"

# IMMEDIATELY trigger engine
- service: automation.trigger
  target:
    entity_id: automation.oal_core_adjustment_engine_v13
```

### Implementation Locations

Add engine trigger after:
- Brightness increase (UP in LIGHT mode)
- Brightness decrease (DOWN in LIGHT mode)
- Color temp warmer (HOLD on DOWN or LIGHT)
- Color temp cooler (HOLD on UP)
- Preset changes (1x on LIGHT button)
- Manual override clears (2x on BIG button)

---

## Startup Initialization

```yaml
automation:
  - id: zen32_startup_init
    alias: "ZEN32 - Initialize on Startup"
    trigger:
      - platform: homeassistant
        event: start
    action:
      # Force LIGHT mode
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "light"

      # Disable LED flash on button press
      - service: select.select_option
        target:
          entity_id: select.scene_controller_led_settings_indicator
        data:
          option: "Disable"

      # Set all toggle modes to "Always on" (except we'll turn some off)
      - service: select.select_option
        target:
          entity_id:
            - select.scene_controller_led_indicator_button_1
            - select.scene_controller_led_indicator_button_2
            - select.scene_controller_led_indicator_button_4
        data:
          option: "Always on"

      # Set LIGHT mode LEDs
      - service: script.zen32_set_mode_light

      # Set big button state
      - service: script.zen32_update_big_button_led
```

---

## Scripts

### zen32_set_mode_light

```yaml
script:
  zen32_set_mode_light:
    alias: "ZEN32 - Set LIGHT Mode"
    mode: single
    sequence:
      # Update mode state
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "light"

      # Cancel volume timeout if running
      - service: timer.cancel
        target:
          entity_id: timer.zen32_volume_timeout

      # Set LEDs in parallel
      - parallel:
          # Button 1 (LIGHT): Yellow ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_1
            data:
              option: "Yellow"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_1
            data:
              option: "Always on"

          # Button 2 (UP): Yellow ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_2
            data:
              option: "Yellow"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_2
            data:
              option: "Always on"

          # Button 3 (VOLUME): OFF
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_3
            data:
              option: "Always off"

          # Button 4 (DOWN): Yellow ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_4
            data:
              option: "Yellow"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_4
            data:
              option: "Always on"
```

### zen32_set_mode_volume

```yaml
script:
  zen32_set_mode_volume:
    alias: "ZEN32 - Set VOLUME Mode"
    mode: single
    sequence:
      # Update mode state
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "volume"

      # Start/restart 60-second timeout
      - service: timer.start
        target:
          entity_id: timer.zen32_volume_timeout
        data:
          duration: "00:01:00"

      # Set LEDs in parallel
      - parallel:
          # Button 1 (LIGHT): OFF
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_1
            data:
              option: "Always off"

          # Button 2 (UP): Blue ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_2
            data:
              option: "Blue"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_2
            data:
              option: "Always on"

          # Button 3 (VOLUME): Blue ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_3
            data:
              option: "Blue"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_3
            data:
              option: "Always on"

          # Button 4 (DOWN): Blue ON
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_color_button_4
            data:
              option: "Blue"
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_4
            data:
              option: "Always on"
```

### zen32_update_big_button_led

```yaml
script:
  zen32_update_big_button_led:
    alias: "ZEN32 - Update Big Button LED"
    mode: single
    sequence:
      - choose:
          # Manual Control Active: RED
          - conditions:
              - condition: state
                entity_id: input_select.oal_active_configuration
                state: "Manual"
            sequence:
              - service: select.select_option
                target:
                  entity_id: select.scene_controller_led_indicator_color_relay
                data:
                  option: "Red"

          # Lights ON: WHITE
          - conditions:
              - condition: state
                entity_id: light.all_adaptive_lights
                state: "on"
            sequence:
              - service: select.select_option
                target:
                  entity_id: select.scene_controller_led_indicator_color_relay
                data:
                  option: "White"

        # Default (Lights OFF): Use toggle off approach
        # Note: Relay doesn't have a toggle select, use low brightness or leave white
```

---

## Reference Implementation Patterns

### Key Behaviors (High Level)

1. **Button presses** → event trigger → choose by press type and current mode
2. **Any button interaction** → restart `timer.zen32_mode_timeout` (extends timeout)
3. **When Manual mode active** (`input_select.oal_active_configuration == "Manual"`):
   - Avoid automatic changes that would override manual control
   - Skip automated brightness/warmth changes to OAL
   - Still update LEDs as normal
4. **On `timer.finished`** → set mode back to `light` if still in `volume`

### Entities Required

| Entity | Type | Purpose |
|--------|------|---------|
| `input_select.zen32_control_mode` | input_select | Canonical mode state (light/volume) |
| `timer.zen32_mode_timeout` | timer | 60s timeout with restore:true |
| `input_select.oal_active_configuration` | input_select | Manual detection authority |
| `event.scene_controller_scene_00X` | event | Button press events |
| `select.scene_controller_led_indicator_*` | select | LED control |

---

### Timer Helper Pattern

```yaml
timer:
  zen32_mode_timeout:
    name: "ZEN32 Mode Timeout"
    duration: "00:01:00"
    restore: true  # CRITICAL: survives restarts
    icon: mdi:timer-outline
```

**Usage (on any interaction):**
```yaml
- service: timer.start
  target:
    entity_id: timer.zen32_mode_timeout
```

**Timeout Automation:**
```yaml
automation:
  - id: zen32_mode_timeout
    alias: "ZEN32 - Mode timeout -> Light"
    trigger:
      - platform: event
        event_type: timer.finished
        event_data:
          entity_id: timer.zen32_mode_timeout
    condition:
      - condition: state
        entity_id: input_select.zen32_control_mode
        state: "volume"
    action:
      - service: script.zen32_set_mode_light
```

---

### Button Handler Pattern (Event-Driven)

```yaml
automation:
  - id: zen32_button_handler
    alias: "ZEN32 - Button Event Handler"
    mode: parallel
    max: 10
    trigger:
      - platform: state
        entity_id: event.scene_controller_scene_001
        id: "button_1"
      - platform: state
        entity_id: event.scene_controller_scene_002
        id: "button_2"
      - platform: state
        entity_id: event.scene_controller_scene_003
        id: "button_3"
      - platform: state
        entity_id: event.scene_controller_scene_004
        id: "button_4"
      - platform: state
        entity_id: event.scene_controller_scene_005
        id: "button_5"
    variables:
      event_type: "{{ trigger.to_state.attributes.event_type | default('unknown') }}"
      button_id: "{{ trigger.id }}"
      is_light_mode: "{{ is_state('input_select.zen32_control_mode', 'light') }}"
      is_volume_mode: "{{ is_state('input_select.zen32_control_mode', 'volume') }}"
      is_manual: "{{ is_state('input_select.oal_active_configuration', 'Manual') }}"
    action:
      # ALWAYS restart timeout on any button press
      - service: timer.start
        target:
          entity_id: timer.zen32_mode_timeout

      # Route to appropriate handler based on button and event type
      - choose:
          # Button 1 (LIGHT) - KeyPressed
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_1' and event_type == 'KeyPressed' }}"
            sequence:
              - if:
                  - condition: template
                    value_template: "{{ is_light_mode }}"
                then:
                  - service: script.zen32_cycle_presets
                else:
                  - service: script.zen32_set_mode_light

          # Button 3 (VOLUME) - KeyPressed
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_3' and event_type == 'KeyPressed' }}"
            sequence:
              - if:
                  - condition: template
                    value_template: "{{ is_volume_mode }}"
                then:
                  - service: script.zen32_toggle_playback
                else:
                  - service: script.zen32_set_mode_volume

          # Button 2 (UP) - KeyPressed in LIGHT mode
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_2' and event_type == 'KeyPressed' and is_light_mode }}"
            sequence:
              - service: script.zen32_brightness_up

          # Button 2 (UP) - KeyPressed in VOLUME mode
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_2' and event_type == 'KeyPressed' and is_volume_mode }}"
            sequence:
              - service: script.zen32_volume_up

          # Button 4 (DOWN) - KeyPressed in LIGHT mode
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_4' and event_type == 'KeyPressed' and is_light_mode }}"
            sequence:
              - service: script.zen32_brightness_down

          # Button 4 (DOWN) - KeyPressed in VOLUME mode
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_4' and event_type == 'KeyPressed' and is_volume_mode }}"
            sequence:
              - service: script.zen32_volume_down

          # Button 5 (BIG) - KeyPressed
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_5' and event_type == 'KeyPressed' }}"
            sequence:
              - service: light.toggle
                target:
                  entity_id: light.all_adaptive_lights
              - service: script.zen32_update_big_button_led
```

**Key Points:**
- Keep button automations small - call scripts for complex logic
- Always restart timer in first action so timeout extends on every press
- Use variables to DRY up conditions

---

### Manual Mode Guard Pattern

Scripts should check `input_select.oal_active_configuration` and:
- **If Manual:** Avoid applying brightness/warmth to OAL, but still update LEDs
- **If Auto:** Perform normal automated commands

**Template Check:**
```yaml
{% set is_manual = is_state('input_select.oal_active_configuration', 'Manual') %}
```

**Guard Condition Example:**
```yaml
# Only apply OAL changes if NOT in Manual mode
- condition: template
  value_template: "{{ not is_state('input_select.oal_active_configuration', 'Manual') }}"
# Then apply OAL changes
- service: input_number.set_value
  target:
    entity_id: input_number.oal_offset_global_manual_brightness
  data:
    value: "{{ new_value }}"
- service: automation.trigger
  target:
    entity_id: automation.oal_core_adjustment_engine_v13
```

**Brightness Script with Manual Guard:**
```yaml
script:
  zen32_brightness_up:
    alias: "ZEN32 - Brightness Up"
    mode: single
    sequence:
      # Turn on lights if off
      - if:
          - condition: state
            entity_id: light.all_adaptive_lights
            state: "off"
        then:
          - service: light.turn_on
            target:
              entity_id: light.all_adaptive_lights

      # Only adjust OAL offset if NOT in Manual mode
      - if:
          - condition: template
            value_template: "{{ not is_state('input_select.oal_active_configuration', 'Manual') }}"
        then:
          - service: input_number.set_value
            target:
              entity_id: input_number.oal_offset_global_manual_brightness
            data:
              value: >
                {{ [states('input_number.oal_offset_global_manual_brightness') | float + 15, 100] | min }}
          # Immediately trigger OAL engine
          - service: automation.trigger
            target:
              entity_id: automation.oal_core_adjustment_engine_v13
        else:
          # Log skip for debugging
          - service: system_log.write
            data:
              message: "ZEN32: Skipping brightness change - OAL in Manual mode"
              level: info
```

---

### Startup Initialization Pattern

```yaml
automation:
  - id: zen32_startup_init
    alias: "ZEN32 - Initialize on Startup"
    trigger:
      - platform: homeassistant
        event: start
    action:
      # Force LIGHT mode (UI mode, safe to set)
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "light"

      # Disable LED flash on button press (critical for automation control)
      - service: select.select_option
        target:
          entity_id: select.scene_controller_led_settings_indicator
        data:
          option: "Disable"

      # Set LIGHT mode LEDs
      - service: script.zen32_set_mode_light

      # Set big button state based on current conditions
      - service: script.zen32_update_big_button_led

      # If NOT in Manual mode, optionally trigger OAL engine to sync state
      - if:
          - condition: template
            value_template: "{{ not is_state('input_select.oal_active_configuration', 'Manual') }}"
        then:
          - service: automation.trigger
            target:
              entity_id: automation.oal_core_adjustment_engine_v13
```

---

### Big Button LED Sync Automation

Automatically update big button LED when relevant states change:

```yaml
automation:
  - id: zen32_big_button_sync
    alias: "ZEN32 - Sync Big Button LED"
    mode: restart
    trigger:
      # Trigger on OAL config change
      - platform: state
        entity_id: input_select.oal_active_configuration
      # Trigger on light state change
      - platform: state
        entity_id: light.all_adaptive_lights
    action:
      - service: script.zen32_update_big_button_led
```

---

### Logging & Safe Guards

Log when skipping automated changes due to Manual mode:

```yaml
- service: system_log.write
  data:
    message: "ZEN32: Skipping automatic brightness change because OAL is Manual"
    level: info
```

---

### Design Intent & Validation
Document the underlying intent for each high-level UX decision and include a short validation step so the implementation can be tested to confirm it matches the intended behavior even if the implementation details change later.

- **Mode timeout via timer helper**
  - Intent: Keep the controller in the user-selected mode while the user is actively interacting and automatically return to the safe default (LIGHT) after inactivity, surviving HA restarts.
  - Validation: `timer.zen32_volume_timeout` exists with `restore: true`; all interaction handlers call `timer.start`; `script.zen32_set_mode_light` cancels (`timer.cancel`) the timer and `timer.finished` triggers return to LIGHT.

- **Event-driven button handling**
  - Intent: Map taps, multi-taps and holds precisely to UX actions with minimal ambiguity and low latency.
  - Validation: Automations trigger on `zwave_js_value_notification` or event entities; trace logs show correct mapping for KeyPressed/KeyPressed2x/KeyHeldDown.

- **Manual mode guard (OAL Manual)**
  - Intent: Never override explicit user manual control of lighting.
  - Validation: All scripts that change OAL check `input_select.oal_active_configuration == 'Manual'` and log/skips changes when Manual is active.

- **LED control via select entities & batching policy**
  - Intent: Use high-level, readable entities to control LEDs and avoid Z-Wave parameter errors; avoid flooding the Z-Wave network when many LEDs change.
  - Validation: LED scripts use `select.select_option` for day-to-day updates; mass/initial updates use either small sequencing (documented) or `zwave_js.bulk_set_partial_config_parameters` where supported; run a high-frequency update test to check for failures.

- **Big button LED authoritative source**
  - Intent: The big button should reflect the relay/light system state (including Manual) and not be driven by per-button LED heuristics.
  - Validation: `script.zen32_update_big_button_led` sets `select.scene_controller_led_indicator_color_relay` and `select.scene_controller_led_indicator_brightness_relay` and is triggered on OAL config and lights state changes.

- **Minimal state footprint**
  - Intent: Derive as much state as possible from authoritative entities and use helpers only when persistence/UI visibility is required.
  - Validation: Spot-check scripts and automations to ensure no redundant `input_boolean` or copying of light states is introduced; derived templates are used for LED color and big button status.

---

### Design Intent & Validation
Document the underlying intent for each high-level UX decision and include a short validation step to ensure the implementation matches the intended behavior even if implementation details change later.

- **Mode timeout via timer helper**
  - Intent: Keep the controller in the user-selected mode while the user is actively interacting and automatically return to the safe default (LIGHT) after inactivity, surviving HA restarts.
  - Validation: `timer.zen32_volume_timeout` exists with `restore: true`; all interaction handlers call `timer.start`; `script.zen32_set_mode_light` cancels (`timer.cancel`) the timer and `timer.finished` triggers return to LIGHT.

- **Event-driven button handling**
  - Intent: Map taps, multi-taps and holds precisely to UX actions with minimal ambiguity and low latency.
  - Validation: Automations trigger on `zwave_js_value_notification` or event entities; trace logs show correct mapping for KeyPressed/KeyPressed2x/KeyHeldDown.

- **Manual mode guard (OAL Manual)**
  - Intent: Never override explicit user manual control of lighting.
  - Validation: All scripts that change OAL check `input_select.oal_active_configuration == 'Manual'` and log/skips changes when Manual is active.

- **LED control via select entities & batching policy**
  - Intent: Use high-level, readable entities to control LEDs and avoid Z-Wave parameter errors; avoid flooding the Z-Wave network when many LEDs change.
  - Validation: LED scripts use `select.select_option` for day-to-day updates; mass/initial updates use either small sequencing (documented) or `zwave_js.bulk_set_partial_config_parameters` where supported; run a high-frequency update test to check for failures.

- **Big button LED authoritative source**
  - Intent: The big button should reflect the relay/light system state (including Manual) and not be driven by per-button LED heuristics.
  - Validation: `script.zen32_update_big_button_led` sets `select.scene_controller_led_indicator_color_relay` and `select.scene_controller_led_indicator_brightness_relay` and is triggered on OAL config and lights state changes.

- **Minimal state footprint**
  - Intent: Derive as much state as possible from authoritative entities and use helpers only when persistence/UI visibility is required.
  - Validation: Spot-check scripts and automations to ensure no redundant `input_boolean` or copying of light states is introduced; derived templates are used for LED color and big button status.

---

### Implementation Checklist

- [ ] Add `timer.zen32_mode_timeout` helper (60s, restore: true)
- [ ] Add event-driven automation for scene events → call scripts
- [ ] Implement scripts: mode set, LED apply, brightness/volume handlers
- [ ] Add `condition` checks for `input_select.oal_active_configuration == "Manual"`
- [ ] Add startup init automation
- [ ] Add big button sync automation
- [ ] Add logging for Manual mode skips
- [ ] Add LED sequencing wrapper script with optional `zwave_js.bulk_set_partial_config_parameters` support and a test automation
- [ ] Test: press sequences, Manual mode behavior, restart behavior, timeout

---

## Blueprint Decision

### Recommendation: Do Not Use Blueprint

The `ZEN32-control-track-blueprint.yaml` file should **not be used** with this implementation.

**Reasons:**
1. Blueprint's LED tracking will conflict with modal LED logic
2. Blueprint has no concept of "modes"
3. Custom package is more maintainable
4. Avoids two systems fighting over the same device

**Action:** The blueprint file can remain in the packages folder but should not be instantiated. Consider adding a comment header noting it's deprecated.

---

## Guest Experience

### Scenario 1: Guest enters dark room
1. Controller shows yellow LEDs (LIGHT, UP, DOWN lit; VOLUME off)
2. Sees big "LIGHTS" button with engraving
3. Presses big button → lights turn on, big LED turns white
4. Too bright? Presses DOWN (yellow) → lights dim
5. **Intuition:** All yellow = all control lights

### Scenario 2: Guest wants to lower music
1. Music is playing, controller is yellow (LIGHT mode)
2. Guest presses VOLUME → LEDs shift to blue
3. Guest presses DOWN (blue) → volume lowers
4. **Intuition:** Color change = now controlling something different

### Scenario 3: After 60 seconds of no interaction
1. Controller was in VOLUME mode (blue)
2. 60 seconds pass with no button presses
3. LEDs silently return to yellow (LIGHT mode)
4. Music continues playing - only control context changed

---

## Implementation Checklist

### Phase 1: Refactor Package
- [ ] Replace `zwave_js.set_config_parameter` with `select.select_option`
- [ ] Remove `sensor.zen32_controller_device_id` (use inline template)
- [ ] Replace `input_datetime.zen32_mode_last_change` with `timer.zen32_volume_timeout`
- [ ] Update all LED scripts to use select entities

### Phase 2: Fix Timeout
- [ ] Add `timer.zen32_volume_timeout` with `restore: true`
- [ ] Create timeout handler automation
- [ ] Add timer start/restart to mode switching
- [ ] Add timer cancel when returning to LIGHT mode

### Phase 3: Response Time
- [ ] Add `automation.trigger` for OAL engine after brightness changes
- [ ] Add `automation.trigger` for OAL engine after warmth changes
- [ ] Add `automation.trigger` for OAL engine after preset changes

### Phase 4: Big Button
- [ ] Implement `input_select.oal_active_configuration` == "Manual" check
- [ ] Create big button LED update script
- [ ] Add triggers for OAL config changes and light state changes

### Phase 5: Testing
- [ ] Test LIGHT mode LED states (Yellow for 1,2,4; Off for 3)
- [ ] Test VOLUME mode LED states (Blue for 2,3,4; Off for 1)
- [ ] Test 60-second timeout returns to LIGHT mode
- [ ] Test big button shows Red when Manual config active
- [ ] Test brightness changes are immediately visible

---

## Appendix: Research Sources

- [Zooz ZEN32 Programming Guide](https://www.support.getzooz.com/kb/article/601-how-to-program-your-zen32-scene-controller-on-home-assistant/)
- [Adaptive Lighting GitHub](https://github.com/basnijholt/adaptive-lighting)
- [Home Assistant Timer Integration](https://www.home-assistant.io/integrations/timer/)
- [Z-Wave JS Integration](https://www.home-assistant.io/integrations/zwave_js/)
- [ZEN32 Community Blueprint](https://community.home-assistant.io/t/zen32-scene-controller-z-wave-js/292610)
- [Timer vs Automation Delay Discussion](https://community.home-assistant.io/t/lights-via-motion-and-automation-timer-vs-restart-automation/362760)
