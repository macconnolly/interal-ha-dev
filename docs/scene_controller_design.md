# ZEN32 Modal Scene Controller - Design Specification

## Status: v4.0 - Simplified UX + Robustness (2025-12-25)

---

## Executive Summary

The ZEN32 functions as a **modal controller** with two primary control contexts:
- **LIGHT Mode** (default) - Controls OAL lighting brightness and color temperature
- **VOLUME Mode** - Controls Sonos playback and volume

**Key UX Principle:** User explicitly controls mode. No auto-timeout.

LED colors indicate the active mode. UP/DOWN buttons are context-sensitive. Mode persists until the user explicitly switches it - this is simpler, more predictable, and respects user intent.

---

## Hardware Reference

### Zooz ZEN32 Specifications
- 5 physical buttons: 1 large center (relay) + 4 small corners
- Each button: 7 LED colors, 3 brightness levels
- Each button: 7 interactions (1x-5x tap, hold, release)
- Z-Wave multi-tap detection window: ~300-500ms (device-level constraint)

### Physical Layout

```
        +---------------------------+
        |                           |
        |   +-------------------+   |
        |   |                   |   |
        |   |   LIGHTS          |   |  [5] Big button (relay)
        |   |              *    |   |  LED: White=on, Red=Manual, Off=off
        |   +-------------------+   |
        |                           |
        |  +---------+ +---------+  |
        |  |      *  | |  *      |  |  [1] LIGHT    [2] UP
        |  | LIGHT   | |   UP    |  |  Mode select   Increase
        |  +---------+ +---------+  |
        |                           |
        |  +---------+ +---------+  |
        |  |      *  | |  *      |  |  [3] VOLUME   [4] DOWN
        |  | VOLUME  | |  DOWN   |  |  Mode+Play    Decrease
        |  +---------+ +---------+  |
        |                           |
        +---------------------------+
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

### Z-Wave Safe LED Updates (CRITICAL)

**Problem:** Parallel `select.select_option` calls flood the Z-Wave radio, causing message drops or device resets.

**Solution:** Use sequential updates with delays via the LED sequencer script.

```yaml
# WRONG - floods Z-Wave radio
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
    # ... more parallel calls

# CORRECT - sequential with delays
- service: script.zen32_led_sequencer
  data:
    delay_ms: 100
    updates:
      - entity: select.scene_controller_led_indicator_color_button_1
        option: "Yellow"
      - entity: select.scene_controller_led_indicator_button_1
        option: "Always on"
      - entity: select.scene_controller_led_indicator_color_button_2
        option: "Yellow"
      - entity: select.scene_controller_led_indicator_button_2
        option: "Always on"
```

**LED Sequencer Script Pattern:**
```yaml
script:
  zen32_led_sequencer:
    alias: "ZEN32 - LED Sequencer"
    description: "Sequential LED updates with configurable delay to prevent Z-Wave flooding"
    mode: single
    fields:
      updates:
        description: "List of {entity, option} dicts"
        required: true
      delay_ms:
        description: "Milliseconds between calls (default: 100)"
        default: 100
    sequence:
      - repeat:
          for_each: "{{ updates }}"
          sequence:
            - service: select.select_option
              target:
                entity_id: "{{ repeat.item.entity }}"
              data:
                option: "{{ repeat.item.option }}"
            - delay:
                milliseconds: "{{ delay_ms | default(100) }}"
```

**Guidelines:**
- Use 50-200ms delay between calls (100ms is safe default)
- Mode transitions (4 buttons) take ~400-800ms total - acceptable latency
- For startup/bulk updates, consider `zwave_js.bulk_set_partial_config_parameters`

---

## LED State Specification

### Core Principle

**Same color = same function.** All buttons in the active mode share the same color. Inactive mode button is OFF (not dimmed).

### LIGHT Mode (Default)

```
        +---------------------------+
        |   +-------------------+   |
        |   |              O    |   |  [5] BIG: White/Red/Off (see below)
        |   |   LIGHTS          |   |
        |   +-------------------+   |
        |                           |
        |  +---------+ +---------+  |
        |  |      Y  | |  Y      |  |  [1] LIGHT: YELLOW ON
        |  | LIGHT   | |   UP    |  |  [2] UP: YELLOW ON
        |  +---------+ +---------+  |
        |                           |
        |  +---------+ +---------+  |
        |  |      -  | |  Y      |  |  [3] VOLUME: OFF
        |  | VOLUME  | |  DOWN   |  |  [4] DOWN: YELLOW ON
        |  +---------+ +---------+  |
        +---------------------------+
```

| Button | Color | Toggle State |
|--------|-------|--------------|
| 1 (LIGHT) | Yellow | Always on |
| 2 (UP) | Yellow | Always on |
| 3 (VOLUME) | - | **Always off** |
| 4 (DOWN) | Yellow | Always on |

### VOLUME Mode

```
        +---------------------------+
        |   +-------------------+   |
        |   |              O    |   |  [5] BIG: (unchanged)
        |   |   LIGHTS          |   |
        |   +-------------------+   |
        |                           |
        |  +---------+ +---------+  |
        |  |      -  | |  B      |  |  [1] LIGHT: OFF
        |  | LIGHT   | |   UP    |  |  [2] UP: BLUE ON
        |  +---------+ +---------+  |
        |                           |
        |  +---------+ +---------+  |
        |  |      B  | |  B      |  |  [3] VOLUME: BLUE ON
        |  | VOLUME  | |  DOWN   |  |  [4] DOWN: BLUE ON
        |  +---------+ +---------+  |
        +---------------------------+
```

| Button | Color | Toggle State |
|--------|-------|--------------|
| 1 (LIGHT) | - | **Always off** |
| 2 (UP) | Blue | Always on |
| 3 (VOLUME) | Blue | Always on |
| 4 (DOWN) | Blue | Always on |

### Big Button (5/Relay) - Mode Independent

| Priority | Condition | Color | Toggle State |
|----------|-----------|-------|--------------|
| 1 (highest) | `input_select.oal_active_configuration` == "Manual" | **Red** | Always on |
| 2 | `input_boolean.oal_movie_mode_active` == "on" | Red | Always on |
| 3 | `input_boolean.oal_disable_sleep_mode` == "on" | Red | Always on |
| 4 | `light.all_adaptive_lights` == "on" | White | Always on |
| 5 (default) | `light.all_adaptive_lights` == "off" | - | Always off |

**Note:** Big button state is independent of LIGHT/VOLUME mode. It always reflects system state with Manual mode as highest priority.

---

## Mode Behavior (No Auto-Timeout)

### Design Decision

**No automatic timeout.** Mode persists until user explicitly switches.

**Rationale:**
1. **Respects user intent** - User chose VOLUME mode, we respect that choice
2. **Predictable behavior** - Same action always produces same result
3. **No confusion** - User doesn't wonder "when will it switch back?"
4. **Simpler code** - No timer management, restart logic, or edge cases
5. **LED feedback sufficient** - Colors clearly show current mode

**Switching modes is trivial:**
- Press LIGHT button → LIGHT mode
- Press VOLUME button → VOLUME mode

### Implementation

```yaml
# Mode set scripts simply update the input_select and LEDs
# No timers, no delays, no timeout logic

script:
  zen32_set_mode_light:
    sequence:
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "light"
      - service: script.zen32_led_sequencer
        data:
          delay_ms: 100
          updates:
            # ... LIGHT mode LED updates

  zen32_set_mode_music:
    sequence:
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "music"
      - service: script.zen32_led_sequencer
        data:
          delay_ms: 100
          updates:
            # ... VOLUME mode LED updates
```

---

## Complete Action Mapping

### Button 1 (LIGHT) - Mode Selector

| Action | LIGHT Mode | VOLUME Mode |
|--------|------------|-------------|
| **1x Press** | Cycle OAL presets (skip Manual) + trigger engine | Switch to LIGHT mode |
| **2x Press** | Full brightness (100%) | Switch + Full brightness |
| **Hold** | Color temp warmer | Switch to LIGHT mode |

### Button 2 (UP) - Context-Sensitive Increase

| Action | LIGHT Mode (on) | LIGHT Mode (off) | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|-----------------|------------------|----------------------|----------------------|
| **1x Press** | Brightness +15% | Turn ON | Volume +10% | Start playback |
| **2x Press** | Full brightness | Turn ON + 100% | Default volume (50%) | Start + 50% |
| **Hold** | Color temp cooler | Turn ON + cooler | Next track | Start + next track |

### Button 3 (VOLUME) - Mode Selector + Play Control

| Action | LIGHT Mode | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|------------|----------------------|----------------------|
| **1x Press** | Switch + Start if stopped | Pause | Start playback |
| **2x Press** | Switch + Ungroup all | Ungroup all | Ungroup all |
| **Hold** | Switch + Group all | Group all speakers | Group all speakers |
| **3x Press** | Switch + Cycle favorites | Cycle favorites | Cycle favorites |

### Button 4 (DOWN) - Context-Sensitive Decrease

| Action | LIGHT Mode (on) | LIGHT Mode (off) | VOLUME Mode (playing) | VOLUME Mode (stopped) |
|--------|-----------------|------------------|----------------------|----------------------|
| **1x Press** | Brightness -15% | Turn ON + minimum | Volume -10% | (no action) |
| **2x Press** | Minimum brightness | Turn ON + minimum | Mute toggle | (no action) |
| **Hold** | Color temp warmer | Turn ON + warmer | Previous track | (no action) |

### Button 5 (BIG) - Mode-Independent Master

| Action | Behavior |
|--------|----------|
| **1x Press** | Toggle all adaptive lights |
| **2x Press** | Toggle movie mode |
| **3x Press** | Toggle sleep mode |
| **Hold** | Soft reset (clear manual overrides) |

---

## State Architecture

### Required Helpers (Minimal)

```yaml
input_select:
  zen32_control_mode:
    name: "ZEN32 Control Mode"
    options:
      - "light"
      - "music"
    initial: "light"
    icon: mdi:toggle-switch-variant

input_datetime:
  zen32_mode_last_change:
    name: "ZEN32 Mode Last Change"
    has_date: true
    has_time: true
    icon: mdi:clock-check-outline
    # For diagnostics/debugging only - no timeout logic

  zen32_last_button_press:
    name: "ZEN32 Last Button Press"
    has_date: true
    has_time: true
    icon: mdi:gesture-tap
    # For OAL 24h activity check
```

### State NOT Stored (Derived Instead)

| State | Derived From |
|-------|--------------|
| Big button color | `input_select.oal_active_configuration`, `light.all_adaptive_lights` |
| Sonos playing | `states('media_player.living_room')` in ['playing', 'buffering', 'paused'] |
| Lights on/off | `states('light.all_adaptive_lights')` |
| Manual control active | `states('input_select.oal_active_configuration') == 'Manual'` |
| LED colors | Derived from `input_select.zen32_control_mode` |

### Entities That Already Exist (No Changes)

- `input_select.oal_active_configuration` - OAL preset selector
- `light.all_adaptive_lights` - Light group
- `media_player.living_room` - Sonos coordinator
- `input_number.sonos_favorite_index` - Favorites cycling counter

---

## Startup Initialization (Race Condition Safe)

### Problem

After HA restart, Z-Wave entities may not be immediately available. Arbitrary delays (e.g., 60s) are unreliable - entities might be ready in 10s or take 120s.

### Solution

Use `wait_template` to wait for entity availability with explicit timeout handling.

```yaml
automation:
  - id: zen32_startup_init
    alias: "ZEN32 - Initialize on Startup"
    trigger:
      - platform: homeassistant
        event: start
    action:
      # Force LIGHT mode immediately (input_select is always available)
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "light"

      # Wait for Z-Wave LED entities to be available
      - wait_template: >
          {{ states('select.scene_controller_led_indicator_color_button_1')
             not in ['unavailable', 'unknown'] }}
        timeout:
          seconds: 120
        continue_on_timeout: true

      # Check if entities are actually available
      - if:
          - condition: template
            value_template: >
              {{ states('select.scene_controller_led_indicator_color_button_1')
                 in ['unavailable', 'unknown'] }}
        then:
          - service: system_log.write
            data:
              message: "ZEN32 startup: LED entities unavailable after 120s timeout"
              level: warning
        else:
          # Disable LED flash (critical for automation control)
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_settings_indicator
            data:
              option: "Disable"

          # Set LIGHT mode LEDs via sequencer
          - service: script.zen32_set_mode_light

          # Set big button based on current state
          - service: script.zen32_update_big_button_led

          - service: system_log.write
            data:
              message: "ZEN32 startup: Initialization complete"
              level: info
```

**Benefits:**
- Proceeds as soon as entities ready (faster)
- Explicit timeout with logging (observable)
- Graceful degradation (doesn't crash if unavailable)

---

## Home Assistant Best Practices

### 1. Event-Driven Button Handling

**Use event entity triggers** for button presses (Central Scene, multi-tap, hold):

```yaml
trigger:
  - platform: state
    entity_id: event.scene_controller_scene_001
    id: "button_1"
  - platform: state
    entity_id: event.scene_controller_scene_002
    id: "button_2"
  # ...
```

**Why:**
- Events are precise and intentful
- Lower latency than state-based triggers
- Clear mapping between physical action and automation

### 2. Adaptive Lighting Manual Control Detection

**For this implementation:** Use `input_select.oal_active_configuration == 'Manual'` which is simpler and authoritative.

**Robust Template Check (if checking AL directly):**
```yaml
"{{ 'light.zone' in (state_attr('switch.adaptive_lighting_zone', 'manual_control') | default([]))
    or 'light.zone' in (state_attr('switch.adaptive_lighting_zone', 'configuration') | default({}).get('manual_control', [])) }}"
```

### 3. LED Control: Select Entities vs zwave_js.set_config_parameter

**Recommendation:** Use **native select entities** (`select.scene_controller_led_indicator_*`)

**Why:**
- Higher-level, readable, safer
- No parameter numbers or bitmasks to remember
- Validation at integration level
- Easier to debug in UI

**CRITICAL:** Use the LED sequencer for multiple updates to avoid Z-Wave flooding.

### 4. Parallel Block Variable Safety

When using `parallel:` in scripts:
- Use **unique variable names** per parallel branch
- Avoid parallelizing actions that depend on shared script variables
- Prefer passing explicit per-branch data (e.g., `repeat.item`)

**Best practice:** Avoid parallel LED updates entirely - use the sequencer script instead.

### 5. Minimal State Footprint

| Do This | Not This |
|---------|----------|
| `states('light.all_adaptive_lights')` | `input_boolean.lights_are_on` |
| `states('media_player.living_room')` | `input_boolean.music_playing` |
| Derive LED color from mode | `input_text.button_1_color` |
| `device_id('event.scene_controller_scene_001')` | `sensor.zen32_device_id` |

**When to Use Helpers:**
- Must persist across HA restart (e.g., control mode)
- No authoritative source exists (mode is an invented concept)
- NOT for values that exist on other entities

---

## Response Time Optimization

### Problem

OAL core adjustment engine runs periodically. Button-triggered changes may not apply immediately.

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

### Required Trigger Locations

- Brightness increase (UP in LIGHT mode)
- Brightness decrease (DOWN in LIGHT mode)
- Color temp warmer (HOLD on DOWN or LIGHT)
- Color temp cooler (HOLD on UP)
- Preset changes (1x on LIGHT button)
- Manual override clears (2x on BIG button)

---

## Reference Implementation

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

      # Update timestamp for diagnostics
      - service: input_datetime.set_datetime
        target:
          entity_id: input_datetime.zen32_mode_last_change
        data:
          datetime: "{{ now() }}"

      # Set LEDs sequentially to avoid Z-Wave flooding
      - service: script.zen32_led_sequencer
        data:
          delay_ms: 100
          updates:
            # Button 1 (LIGHT): Yellow ON
            - entity: select.scene_controller_led_indicator_color_button_1
              option: "Yellow"
            - entity: select.scene_controller_led_indicator_button_1
              option: "Always on"
            # Button 2 (UP): Yellow ON
            - entity: select.scene_controller_led_indicator_color_button_2
              option: "Yellow"
            - entity: select.scene_controller_led_indicator_button_2
              option: "Always on"
            # Button 3 (VOLUME): OFF
            - entity: select.scene_controller_led_indicator_button_3
              option: "Always off"
            # Button 4 (DOWN): Yellow ON
            - entity: select.scene_controller_led_indicator_color_button_4
              option: "Yellow"
            - entity: select.scene_controller_led_indicator_button_4
              option: "Always on"
```

### zen32_set_mode_music

```yaml
script:
  zen32_set_mode_music:
    alias: "ZEN32 - Set VOLUME Mode"
    mode: single
    sequence:
      # Update mode state
      - service: input_select.select_option
        target:
          entity_id: input_select.zen32_control_mode
        data:
          option: "music"

      # Update timestamp for diagnostics
      - service: input_datetime.set_datetime
        target:
          entity_id: input_datetime.zen32_mode_last_change
        data:
          datetime: "{{ now() }}"

      # Set LEDs sequentially to avoid Z-Wave flooding
      - service: script.zen32_led_sequencer
        data:
          delay_ms: 100
          updates:
            # Button 1 (LIGHT): OFF
            - entity: select.scene_controller_led_indicator_button_1
              option: "Always off"
            # Button 2 (UP): Blue ON
            - entity: select.scene_controller_led_indicator_color_button_2
              option: "Blue"
            - entity: select.scene_controller_led_indicator_button_2
              option: "Always on"
            # Button 3 (VOLUME): Blue ON
            - entity: select.scene_controller_led_indicator_color_button_3
              option: "Blue"
            - entity: select.scene_controller_led_indicator_button_3
              option: "Always on"
            # Button 4 (DOWN): Blue ON
            - entity: select.scene_controller_led_indicator_color_button_4
              option: "Blue"
            - entity: select.scene_controller_led_indicator_button_4
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
          # Manual Mode: RED (highest priority)
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

          # Movie Mode: RED
          - conditions:
              - condition: state
                entity_id: input_boolean.oal_movie_mode_active
                state: "on"
            sequence:
              - service: select.select_option
                target:
                  entity_id: select.scene_controller_led_indicator_color_relay
                data:
                  option: "Red"

          # Sleep Mode: RED
          - conditions:
              - condition: state
                entity_id: input_boolean.oal_disable_sleep_mode
                state: "on"
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

        # Default (Lights OFF): OFF
        default:
          - service: select.select_option
            target:
              entity_id: select.scene_controller_led_indicator_button_relay
            data:
              option: "Always off"
```

### Manual Mode Guard Pattern

Scripts that modify OAL should check Manual mode first:

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

      # Only adjust OAL if NOT in Manual mode
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
          - service: automation.trigger
            target:
              entity_id: automation.oal_core_adjustment_engine_v13
        else:
          - service: system_log.write
            data:
              message: "ZEN32: Skipping brightness change - OAL in Manual mode"
              level: info
```

### Big Button LED Sync Automation

```yaml
automation:
  - id: zen32_big_button_sync
    alias: "ZEN32 - Sync Big Button LED"
    mode: restart
    trigger:
      # Trigger on Manual mode changes (highest priority)
      - platform: state
        entity_id: input_select.oal_active_configuration
      # Trigger on movie/sleep mode changes
      - platform: state
        entity_id: input_boolean.oal_movie_mode_active
      - platform: state
        entity_id: input_boolean.oal_disable_sleep_mode
      # Trigger on light state changes
      - platform: state
        entity_id: light.all_adaptive_lights
    action:
      - service: script.zen32_update_big_button_led
```

### Button Handler Pattern

```yaml
automation:
  - id: zen32_button_handler
    alias: "ZEN32 - Button Event Handler"
    mode: single
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
      is_volume_mode: "{{ is_state('input_select.zen32_control_mode', 'music') }}"
      is_manual: "{{ is_state('input_select.oal_active_configuration', 'Manual') }}"
    condition:
      - condition: template
        value_template: "{{ event_type in ['KeyPressed', 'KeyPressed2x', 'KeyPressed3x', 'KeyHeldDown'] }}"
    action:
      # Update last button press timestamp (for OAL 24h activity check)
      - service: input_datetime.set_datetime
        target:
          entity_id: input_datetime.zen32_last_button_press
        data:
          datetime: "{{ now() }}"

      # Route to appropriate handler
      - choose:
          # Button 1 (LIGHT) - 1x Press
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_1' and event_type == 'KeyPressed' }}"
            sequence:
              - if:
                  - condition: template
                    value_template: "{{ is_light_mode }}"
                then:
                  - service: script.zen32_cycle_presets
                  - service: automation.trigger
                    target:
                      entity_id: automation.oal_core_adjustment_engine_v13
                else:
                  - service: script.zen32_set_mode_light

          # Button 3 (VOLUME) - 1x Press
          - conditions:
              - condition: template
                value_template: "{{ button_id == 'button_3' and event_type == 'KeyPressed' }}"
            sequence:
              - if:
                  - condition: template
                    value_template: "{{ is_volume_mode }}"
                then:
                  - service: script.zen32_sonos_play_pause
                else:
                  - service: script.zen32_set_mode_music

          # ... additional button handlers
```

---

## Design Intent & Validation

### Explicit Mode Control (No Timeout)
- **Intent:** Respect user's explicit choice. Mode persists until user switches.
- **Rationale:** Simpler, more predictable, matches Apple UX principles
- **Validation:** No timer entities exist; mode only changes via button press

### Event-Driven Button Handling
- **Intent:** Map taps, multi-taps, and holds precisely to UX actions
- **Validation:** Automations trigger on event entities; trace logs show correct KeyPressed/KeyPressed2x/KeyHeldDown mapping

### Manual Mode Guard
- **Intent:** Never override explicit user manual control
- **Validation:** All OAL-modifying scripts check `oal_active_configuration == 'Manual'` and log when skipped

### Z-Wave Safe LED Updates
- **Intent:** Prevent radio flooding; ensure reliable LED state changes
- **Validation:** LED scripts use sequencer with delays; no parallel `select.select_option` blocks for LEDs

### Big Button Authoritative Source
- **Intent:** Big button reflects system state (Manual > Movie > Sleep > Lights)
- **Validation:** `zen32_update_big_button_led` checks priority order; syncs on all relevant state changes

### Minimal State Footprint
- **Intent:** Derive state from authoritative entities; only persist what's necessary
- **Validation:** No redundant `input_boolean` for existing states; mode is the only custom state

---

## Implementation Checklist

- [ ] Implement `zen32_led_sequencer` script with delay parameter
- [ ] Refactor `zen32_set_mode_light` to use sequencer
- [ ] Refactor `zen32_set_mode_music` to use sequencer
- [ ] Update startup init with `wait_template` for entity availability
- [ ] Add Manual mode as highest priority in big button LED script
- [ ] Add Manual mode guards to brightness/warmth scripts
- [ ] Add OAL config trigger to big button sync automation
- [ ] Add OAL engine trigger after preset cycling
- [ ] Set inactive mode buttons to "Always off" (not dim)
- [ ] Remove any timeout-related code
- [ ] Test: mode switching, Manual mode behavior, LED sequencing, startup

---

## Blueprint Decision

### Recommendation: Do Not Use Blueprint

The `ZEN32-control-track-blueprint.yaml` file should **not be used** with this implementation.

**Reasons:**
1. Blueprint's LED tracking conflicts with modal LED logic
2. Blueprint has no concept of "modes"
3. Custom package is more maintainable
4. Avoids two systems fighting over the same device

**Action:** Blueprint file can remain but should not be instantiated.

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

### Scenario 3: Guest leaves and returns
1. Controller was in VOLUME mode (blue)
2. Guest returns later - controller still blue
3. **Intuition:** "It's where I left it" (predictable)
4. Guest presses LIGHT → back to yellow for lights

---

## Appendix: Research Sources

- [Zooz ZEN32 Programming Guide](https://www.support.getzooz.com/kb/article/601-how-to-program-your-zen32-scene-controller-on-home-assistant/)
- [Adaptive Lighting GitHub](https://github.com/basnijholt/adaptive-lighting)
- [Z-Wave JS Integration](https://www.home-assistant.io/integrations/zwave_js/)
- [ZEN32 Community Blueprint](https://community.home-assistant.io/t/zen32-scene-controller-z-wave-js/292610)
