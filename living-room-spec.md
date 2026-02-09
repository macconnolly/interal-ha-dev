# Living Room Card — V3 Specification

> **Version**: V3 (Best-of-Both)
> **File**: `Dashboard/living_room_card.yaml`
> **Last updated**: 2026-02-09

## Design Philosophy

The living room card is the primary home control surface. Its goal: **the user never needs to think about lighting or media**. The header provides a room title with contextual alarm indicator and settings access. Six draggable light tiles give instant brightness control. Three media tiles handle Sonos, Apple TV, and Samsung. A settings popup tucks all secondary controls — brightness presets, OAL configuration, temperature readout, alarm management — behind a single gear icon.

Every element uses glassmorphism, state-driven color, and dark mode support. Lights are amber-accented. Media devices have per-device accent colors (Sonos blue, Apple TV blue, Samsung purple). The card is self-contained — popup content is defined inline, not via `!include`.

---

## Entity Reference

### Primary Entities

| Entity | Type | Usage |
|--------|------|-------|
| `light.living_room_lights` | Light group | Room toggle, brightness slider |
| `sensor.room_living_state` | Sensor | Room status (state: idle/active/playing), attributes: `lights_on`, `has_upcoming_alarm`, `next_alarm_entity`, `has_override`, `manually_controlled_lights`, `brightness_offset` |
| `light.living_room_floor_lamp` | Light | Floor lamp tile (main_living zone) |
| `light.living_room_couch_lamp` | Light | Couch lamp tile (main_living zone) |
| `light.entryway_lamp` | Light | Entry lamp tile (main_living zone) |
| `light.living_room_spot_lights` | Light | Spot lights tile (accent_spots zone) |
| `light.column_lights` | Light | Column lights tile (column_lights zone) |
| `light.living_room_hallway_lights` | Light | Recessed lights tile (recessed_ceiling zone) |
| `media_player.living_room` | Media player | Sonos tile |
| `media_player.living_room_apple_tv` | Media player | Apple TV tile |
| `media_player.living_room_samsung_q60` | Media player | Samsung TV tile |
| `binary_sensor.sonos_living_room_in_playing_group` | Binary sensor | Sonos group membership |

### Adaptive Lighting Switches (for manual control detection)

| AL Switch | Zone | Lights |
|-----------|------|--------|
| `switch.adaptive_lighting_main_living` | main_living | Floor, Couch, Entry |
| `switch.adaptive_lighting_accent_spots` | accent_spots | Spot lights |
| `switch.adaptive_lighting_column_lights` | column_lights | Column lights |
| `switch.adaptive_lighting_recessed_ceiling` | recessed_ceiling | Recessed/Hallway |

### Alarm & Popup Entities

| Entity | Type | Usage |
|--------|------|-------|
| `sensor.sonos_next_alarm_chip` | Sensor | Alarm sub-button entity |
| `sensor.hero_button_alarm_state` | Sensor | Attributes: `is_enabled`, `formatted_time` — drives alarm time display |
| `input_text.sonos_manually_toggled_alarm_living_room` | Input text | Tracks last toggled alarm for living room |
| `script.sonos_toggle_next_alarm` | Script | Toggles next upcoming alarm |
| `script.sonos_load_alarm_for_edit` | Script | Opens alarm edit popup |
| `switch.sonos_alarm_520` | Switch | Living room Sonos alarm 1 |
| `switch.sonos_alarm_521` | Switch | Living room Sonos alarm 2 |
| `input_select.oal_active_configuration` | Input select | Current OAL mode (Adaptive, Full Bright, Dim Ambient, Warm Ambient, TV Mode, Sleep, Manual) |
| `sensor.living_room_temperature` | Sensor | Room temperature reading |

---

## Card Nesting Hierarchy

```
custom:mod-card (glassmorphism outer, card_mod on :host)
└── vertical-stack
    ├── HEADER: bubble-card separator
    │   ├── entity: light.living_room_lights
    │   ├── icon: mdi:sofa (52×52px rounded-square)
    │   ├── tap_action: toggle
    │   ├── hold_action: more-info
    │   ├── sub_button[0]: Alarm (conditional, shows time via ::after)
    │   └── sub_button[1]: Gear (opens browser_mod popup inline)
    │       └── Popup content (vertical-stack):
    │           ├── Header row (title "Living Room Settings" + close X)
    │           ├── Room Brightness slider
    │           ├── All On/Off toggle
    │           ├── Reset Manual Overrides (conditional)
    │           ├── Brighten / Dim (side-by-side)
    │           ├── Room Info separator
    │           │   ├── Lighting Mode (color-coded OAL config)
    │           │   ├── Temperature
    │           │   └── Lights On (count + manual indicator)
    │           └── Alarms separator
    │               ├── Alarm 520 (switch toggle with time)
    │               └── Alarm 521 (switch toggle with time)
    ├── layout-card (3-column light grid, 3×2)
    │   ├── Floor Lamp (main_living)
    │   ├── Couch Lamp (main_living)
    │   ├── Entry Lamp (main_living)
    │   ├── Spot Lights (accent_spots)
    │   ├── Column Lights (column_lights)
    │   └── Recessed (recessed_ceiling)
    └── layout-card (asymmetric media grid)
        ├── Sonos (1.4fr, slider, blue)
        ├── Apple TV (0.8fr, state, blue)
        └── Samsung TV (0.8fr, state, purple)
```

---

## Section 1: Outer Container & Header

### 1.1 Outer Container (`custom:mod-card`)

The outermost card is a `custom:mod-card` that provides the glassmorphism shell. Its `card_mod` targets `:host` for the frosted glass effect. A `@media (prefers-color-scheme: dark)` block handles dark mode.

```yaml
type: custom:mod-card
card_mod:
  style: |
    :host {
      display: block !important;
      background: rgba(248, 248, 250, 0.98) !important;
      backdrop-filter: blur(32px) saturate(1.1) !important;
      -webkit-backdrop-filter: blur(32px) saturate(1.1) !important;
      border-radius: 26px !important;
      padding: 4px 0 6px 0 !important;
      margin-bottom: 12px !important;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
      border: 1px solid rgba(0, 0, 0, 0.04) !important;
      overflow: hidden !important;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        background: rgba(28, 28, 30, 0.75) !important;
        backdrop-filter: blur(40px) saturate(1.4) !important;
        -webkit-backdrop-filter: blur(40px) saturate(1.4) !important;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02) !important;
        border: 1px solid rgba(255, 255, 255, 0.04) !important;
      }
    }
    #root { gap: 0 !important; }
    #root > * { margin-top: 0 !important; margin-bottom: 0 !important; }
card:
  type: vertical-stack
  cards:
    # ... header, light grid, media grid ...
```

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Background | `rgba(248, 248, 250, 0.98)` | `rgba(28, 28, 30, 0.75)` |
| Backdrop filter | `blur(32px) saturate(1.1)` | `blur(40px) saturate(1.4)` |
| Border radius | `26px` | `26px` |
| Padding | `4px 0 6px 0` | `4px 0 6px 0` |
| Margin bottom | `12px` | `12px` |
| Box shadow | `0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)` | `0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02)` |
| Border | `1px solid rgba(0, 0, 0, 0.04)` | `1px solid rgba(255, 255, 255, 0.04)` |

### 1.2 Header Separator

A single `bubble-card` separator that combines room title, status icon, and sub-buttons (alarm + gear). The separator's tap toggles all living room lights; hold opens more-info.

```yaml
- type: custom:bubble-card
  card_type: separator
  entity: light.living_room_lights
  name: Living Room
  icon: mdi:sofa
  tap_action:
    action: toggle
  hold_action:
    action: more-info
  sub_button:
    - entity: sensor.sonos_next_alarm_chip
      icon: mdi:alarm
      show_background: false
      tap_action:
        action: perform-action
        perform_action: script.sonos_toggle_next_alarm
        data:
          alarm_entity: "{{ state_attr('sensor.room_living_state', 'next_alarm_entity') }}"
          tracker: input_text.sonos_manually_toggled_alarm_living_room
      hold_action:
        action: more-info
    - icon: mdi:cog
      show_background: false
      tap_action:
        action: fire-dom-event
        browser_mod:
          service: browser_mod.popup
          data:
            content:
              type: vertical-stack
              cards:
                # ... popup content (Section 4) ...
            style:
              --popup-border-radius: 24px 24px 0 0
              --popup-padding: 0
            right_button: Close
            dismissable: true
```

#### 1.2.1 Header Icon (`.bubble-icon-container`)

The header icon is a rounded square (not circular). Its color reflects room state: playing (blue), active/lights on (amber), or idle (muted).

| Property | Playing | Active (lights on) | Idle (light) | Idle (dark) |
|----------|---------|-------------------|--------------|-------------|
| Size | 52×52px | 52×52px | 52×52px | 52×52px |
| Border radius | `14px` | `14px` | `14px` | `14px` |
| Icon size | `30px` | `30px` | `30px` | `30px` |
| Icon color | `rgb(0, 122, 255)` | `rgb(255, 149, 0)` | `rgba(60, 60, 60, 0.55)` | `rgba(255, 255, 255, 0.35)` |
| Background | `rgba(0, 122, 255, 0.18)` | `rgba(255, 149, 0, 0.18)` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.06)` |
| Border | `1.5px solid rgba(0, 122, 255, 0.25)` | `1.5px solid rgba(255, 149, 0, 0.25)` | — | — |
| Icon glow | `drop-shadow(0 0 4px rgb(0, 122, 255)66)` | `drop-shadow(0 0 4px rgb(255, 149, 0)66)` | none | none |

State detection logic:
```javascript
const roomState = hass.states['sensor.room_living_state']?.state || 'idle';
const lightsOn = parseInt(hass.states['sensor.room_living_state']?.attributes?.lights_on || '0');
if (roomState === 'playing') { /* blue */ }
else if (roomState === 'active' || lightsOn > 0) { /* amber */ }
else { /* idle/muted */ }
```

#### 1.2.2 Room Title (`.bubble-name`)

| Property | Value |
|----------|-------|
| Font size | `22px` |
| Font weight | `700` |
| Letter spacing | `-0.3px` |
| White space | `normal` (wraps if needed) |
| Color (light) | `rgba(25, 25, 25, 0.95)` |
| Color (dark) | `rgba(255, 255, 255, 0.95)` |

#### 1.2.3 Alarm Sub-button (sub_button[0])

**Conditional:** Hidden via `display: none` in styles when `sensor.room_living_state` attribute `has_upcoming_alarm` is not `true`.

**Entity:** `sensor.sonos_next_alarm_chip`

**Tap action:** `perform-action` → `script.sonos_toggle_next_alarm` with:
- `alarm_entity`: template resolving to `state_attr('sensor.room_living_state', 'next_alarm_entity')`
- `tracker`: `input_text.sonos_manually_toggled_alarm_living_room`

**Hold action:** `more-info`

**Time display:** A `::after` pseudo-element on `.bubble-sub-button-1` shows the formatted alarm time from `sensor.hero_button_alarm_state`:

```javascript
const alarmState = hass.states['sensor.hero_button_alarm_state'];
const alarmEnabled = alarmState?.attributes?.is_enabled === true || alarmState?.attributes?.is_enabled === 'True';
const alarmTime = alarmState?.attributes?.formatted_time || '';
```

| Property | Alarm Enabled | Alarm Disabled |
|----------|--------------|----------------|
| Background | `rgba(66, 133, 244, 0.10)` | `rgba(60, 60, 60, 0.08)` |
| Border | `1px solid rgba(66, 133, 244, 0.25)` | `1px solid rgba(60, 60, 60, 0.15)` |
| Icon color | `rgb(66, 133, 244)` | `rgba(60, 60, 60, 0.6)` |
| Min width | `46px` | `46px` |
| `::after` content | `'{formattedTime}'` | `'{formattedTime} OFF'` |
| `::after` position | `absolute, bottom: 1px, right: 3px` | same |
| `::after` font | `7px, weight 600` | same |
| `::after` color | `rgba(66, 133, 244, 0.9)` | `rgba(60, 60, 60, 0.5)` |

#### 1.2.4 Gear Sub-button (sub_button[1])

Always visible. Opens the settings popup (Section 4) via `fire-dom-event` → `browser_mod.popup`.

| Property | Light Mode | Dark Mode |
|----------|-----------|-----------|
| Icon | `mdi:cog` | `mdi:cog` |
| Icon color | `rgba(60, 60, 60, 0.55)` | `rgba(255, 255, 255, 0.45)` |

#### 1.2.5 Header Interaction Summary

| Gesture | Target | Action |
|---------|--------|--------|
| Tap (separator) | `light.living_room_lights` | Toggle all lights |
| Hold (separator) | `light.living_room_lights` | Open more-info dialog |
| Tap (alarm) | `script.sonos_toggle_next_alarm` | Toggle specific next alarm with tracker |
| Hold (alarm) | `sensor.sonos_next_alarm_chip` | Open more-info dialog |
| Tap (gear) | Settings popup | Open popup (Section 4) |

---

## Section 2: Light Tile Grid

Six Bubble Card button cards arranged in a 3×2 grid via `layout-card`. Every tile is a horizontal drag target for brightness control. All lights are ALWAYS visible regardless of on/off state.

### 2.1 Grid Layout

```yaml
- type: custom:layout-card
  layout_type: custom:grid-layout
  layout:
    grid-template-columns: repeat(3, 1fr)
    gap: 8px
    padding: 2px 12px 4px 12px
    mediaquery:
      "(max-width: 400px)":
        grid-template-columns: repeat(2, 1fr)
  card_mod:
    style: |
      ha-card {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        margin: 0 !important;
      }
```

| Property | Value |
|----------|-------|
| Layout type | `custom:grid-layout` |
| Columns | 3 (collapses to 2 below 400px) |
| Gap | `8px` |
| Padding | `2px 12px 4px 12px` |

### 2.2 Individual Light Tile

Each light tile is a `bubble-card` of `card_type: button` with `button_type: slider`.

#### Base Configuration (per tile)

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: slider
  entity: light.living_room_floor_lamp
  name: Floor
  icon: mdi:floor-lamp
  show_state: false
  show_attribute: true
  attribute: brightness
  scrolling_effect: false
  tap_action:
    action: toggle
  hold_action:
    action: more-info
  double_tap_action:
    action: call-service
    service: light.turn_on
    target:
      entity_id: light.living_room_floor_lamp
    data:
      brightness_pct: 100
  card_mod:
    style: |
      ha-card {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
```

**Light tile mapping:**

| Name | Entity | Icon | AL Switch | Zone |
|------|--------|------|-----------|------|
| Floor | `light.living_room_floor_lamp` | `mdi:floor-lamp` | `switch.adaptive_lighting_main_living` | main_living |
| Couch | `light.living_room_couch_lamp` | `mdi:lamp` | `switch.adaptive_lighting_main_living` | main_living |
| Entry | `light.entryway_lamp` | `mdi:desk-lamp` | `switch.adaptive_lighting_main_living` | main_living |
| Spots | `light.living_room_spot_lights` | `mdi:spotlight-beam` | `switch.adaptive_lighting_accent_spots` | accent_spots |
| Columns | `light.column_lights` | `mdi:led-strip-variant` | `switch.adaptive_lighting_column_lights` | column_lights |
| Recessed | `light.living_room_hallway_lights` | `mdi:ceiling-light-outline` | `switch.adaptive_lighting_recessed_ceiling` | recessed_ceiling |

#### 2.2.1 Tile Container (`.bubble-button-card-container`)

| Property | Value |
|----------|-------|
| Display | Grid: `auto auto 1fr auto` rows, centered |
| Min height | `110px` |
| Aspect ratio | `1 / 1` |
| Padding | `10px 6px 8px 6px` |
| Border radius | `18px` |
| Clip | `clip-path: inset(0 round 18px)` |
| Press feedback | `transform: scale(0.96)` on `:active` |

| Property | ON (light) | ON (dark) |
|----------|-----------|-----------|
| Background | `linear-gradient(180deg, rgba(255, 250, 240, 0.97) 0%, rgba(255, 248, 235, 0.95) 100%)` | `linear-gradient(180deg, rgba(48, 40, 28, 0.95) 0%, rgba(36, 33, 28, 0.93) 100%)` |
| Border | `1.5px solid rgba(255, 149, 0, 0.20)` | `1.5px solid rgba(255, 149, 0, 0.14)` |
| Box shadow | `0 2px 10px rgba(0, 0, 0, 0.12)` | `0 2px 10px rgba(0, 0, 0, 0.3)` |

| Property | OFF (light) | OFF (dark) |
|----------|-----------|-----------|
| Background | `rgba(246, 246, 248, 0.95)` | `rgba(32, 32, 34, 0.7)` |
| Border | `1.5px solid rgba(0, 0, 0, 0.04)` | `1.5px solid rgba(255, 255, 255, 0.08)` |
| Box shadow | `0 1px 4px rgba(0, 0, 0, 0.08)` | `0 1px 4px rgba(0, 0, 0, 0.15)` |

**Drag state:** `.bubble-button-card-container.is-dragging` gets `border: 1.5px solid rgba(255, 149, 0, 0.45)`

**Transitions:** `transform 0.15s ease-out, border-color 0.2s ease, background 0.3s ease, box-shadow 0.3s ease`

#### 2.2.2 Icon Container (`.bubble-icon-container`)

| Property | ON | OFF (light) | OFF (dark) |
|----------|-----|------------|------------|
| Size | `50×50px` | `50×50px` | `50×50px` |
| Border radius | `15px` (rounded square) | `15px` | `15px` |
| Background | `rgba(255, 149, 0, 0.14)` | `rgba(0, 0, 0, 0.04)` | `rgba(128, 128, 128, 0.12)` |
| Border | `1px solid rgba(255, 149, 0, 0.18)` | none | none |
| Grid row | `1` | `1` | `1` |
| Margin | `0 0 4px 0` | `0 0 4px 0` | `0 0 4px 0` |
| Icon size | `24px` | `24px` | `24px` |
| Icon color | `#ff9500` | `rgba(60, 60, 60, 0.35)` | `rgba(255, 255, 255, 0.45)` |
| Icon opacity | `1` | `0.35` | `0.35` |
| Icon filter | none | `grayscale(1) opacity(0.7)` | `grayscale(1) opacity(0.7)` |

#### 2.2.3 Light Name (`.bubble-name`)

| Property | ON (light) | ON (dark) | OFF (light) | OFF (dark) |
|----------|-----------|-----------|------------|------------|
| Font size | `15px` | `15px` | `15px` | `15px` |
| Font weight | `600` | `600` | `600` | `600` |
| Line height | `1.2` | `1.2` | `1.2` | `1.2` |
| Color | `rgba(30, 30, 30, 0.9)` | `rgba(255, 255, 255, 0.92)` | `rgba(0, 0, 0, 0.18)` | `rgba(255, 255, 255, 0.50)` |
| Alignment | Center | Center | Center | Center |

#### 2.2.4 Brightness Display (`.bubble-attribute` + `::after`)

The raw `.bubble-attribute` text is hidden (`font-size: 0`). A `::after` pseudo-element renders the computed brightness percentage:

```javascript
const brightness = hass.states['light.entity']?.attributes?.brightness || 0;
const brightnessPct = Math.round((brightness / 255) * 100);
const brightnessLabel = isOn ? `${brightnessPct}%` : 'Off';
```

| Property | ON (light) | ON (dark) | OFF (light) | OFF (dark) |
|----------|-----------|-----------|------------|------------|
| Font size | `13px` | `13px` | `13px` | `13px` |
| Font weight | `500` | `500` | `500` | `500` |
| Font variant | `tabular-nums` | `tabular-nums` | `tabular-nums` | `tabular-nums` |
| Color | `#d97b00` | `rgba(255, 149, 0, 0.85)` | `rgba(0, 0, 0, 0.12)` | `rgba(255, 255, 255, 0.30)` |
| Content | `'{brightnessPct}%'` | — | `'Off'` | — |
| Drag behavior | `opacity: 0` when `.is-dragging` | — | — | — |

#### 2.2.5 Bottom Fill Bar (`.bubble-range-slider` + `.bubble-range-fill`)

| Property | Value |
|----------|-------|
| Height | `4px` |
| Position | Absolute bottom, full width |
| Track background (light) | `rgba(0, 0, 0, 0.04)` |
| Track background (dark) | `rgba(255, 255, 255, 0.04)` |
| Track border radius | `0 0 18px 18px` |
| Fill color (normal) | `#e8a000` |
| Fill color (manual override) | `#ff9500` |
| Fill border radius | `0 2px 0 0` |
| Z-index | `10` |
| Drag transition | `width 0.04s linear` (vs `0.3s ease` normal) |

#### 2.2.6 Slider Value Pill (`.bubble-range-value`)

| Property | Value |
|----------|-------|
| Position | `bottom: 58px`, `left: 50%`, `transform: translateX(-50%)` |
| Font | `14px`, weight `700` |
| Color | Same as fill color (`#e8a000` or `#ff9500`) |
| Background (light) | `rgba(255, 255, 255, 0.92)` |
| Background (dark) | `rgba(30, 30, 32, 0.92)` |
| Padding | `2px 8px` |
| Border radius | `8px` |
| Box shadow | `0 1px 6px rgba(0, 0, 0, 0.35)` |
| Default opacity | `0` (hidden) |
| Drag opacity | `1` (via `.is-dragging .bubble-range-value`) |
| Z-index | `30` |
| White space | `nowrap` |
| Transition | `opacity 0.15s ease` |

#### 2.2.7 Manual Control Red Dot (`::after` pseudo-element)

| Property | Active (manual) | Inactive |
|----------|----------------|----------|
| Size | `7×7px` | `0×0px` |
| Position | `top: 8px`, `right: 8px` |
| Color | `rgb(255, 59, 48)` | transparent |
| Border | `1.5px solid rgba(255, 255, 255, 0.9)` | none |
| Box shadow | `0 0 4px rgba(255, 59, 48, 0.5)` | none |
| Z-index | `25` |
| Transition | `all 0.2s ease` |

**Per-tile AL switch mapping:**

| Light Entity | AL Switch | Detection Method |
|---|---|---|
| `light.living_room_floor_lamp` | `switch.adaptive_lighting_main_living` | `.includes('light.living_room_floor_lamp')` |
| `light.living_room_couch_lamp` | `switch.adaptive_lighting_main_living` | `.includes('light.living_room_couch_lamp')` |
| `light.entryway_lamp` | `switch.adaptive_lighting_main_living` | `.includes('light.entryway_lamp')` |
| `light.living_room_spot_lights` | `switch.adaptive_lighting_accent_spots` | `.includes('light.living_room_spot_lights')` |
| `light.column_lights` | `switch.adaptive_lighting_column_lights` | `.length > 0` (single entity) |
| `light.living_room_hallway_lights` | `switch.adaptive_lighting_recessed_ceiling` | `.includes('light.living_room_hallway_lights')` |

#### 2.2.8 Tile Interaction Summary

| Gesture | Action |
|---------|--------|
| Horizontal drag | Adjust brightness (built-in `button_type: slider`) |
| Tap | Toggle light on/off |
| Hold | Open more-info dialog |
| Double-tap | Set brightness to 100% |

---

## Section 3: Media Row

Three media device tiles in an asymmetric horizontal row. Sonos gets more width for the volume slider. Each device has its own accent color.

### 3.1 Media Row Layout

```yaml
- type: custom:layout-card
  layout_type: custom:grid-layout
  layout:
    grid-template-columns: 1.4fr 0.8fr 0.8fr
    gap: 6px
    padding: 2px 12px 4px 12px
    mediaquery:
      "(max-width: 400px)":
        grid-template-columns: repeat(2, 1fr)
```

| Property | Value |
|----------|-------|
| Layout type | `custom:grid-layout` |
| Columns | `1.4fr 0.8fr 0.8fr` (asymmetric — Sonos wider) |
| Gap | `6px` |
| Padding | `2px 12px 4px 12px` |

### 3.2 Sonos Tile (Volume Slider)

Uses `button_type: slider` with `volume_level` attribute. Active state driven by `binary_sensor.sonos_living_room_in_playing_group`.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: slider
  entity: media_player.living_room
  name: Sonos
  icon: mdi:speaker
  show_state: false
  show_attribute: true
  attribute: volume_level
  scrolling_effect: false
  tap_action:
    action: perform-action
    perform_action: media_player.media_play_pause
    target:
      entity_id: media_player.living_room
  hold_action:
    action: more-info
  double_tap_action:
    action: call-service
    service: script.sonos_toggle_group_membership
    data:
      target_speaker: media_player.living_room
```

| Property | In Group (active) | Not in Group |
|----------|------------------|--------------|
| Accent | `rgb(0, 122, 255)` | — |
| Background (dark) | `rgba(0, 122, 255, 0.14)` | `rgba(255, 255, 255, 0.08)` |
| Background (light) | `rgba(0, 122, 255, 0.10)` | `rgba(255, 255, 255, 0.9)` |
| Border (dark) | `1px solid rgba(0, 122, 255, 0.30)` | `1px solid rgba(255, 255, 255, 0.12)` |
| Border (light) | `1px solid rgba(0, 122, 255, 0.35)` | `1px solid rgba(0, 0, 0, 0.08)` |
| Icon bg | `rgba(0, 122, 255, 0.14)` | `rgba(255, 255, 255, 0.06)` / `rgba(0, 0, 0, 0.04)` |
| Icon border | `1.5px solid rgba(0, 122, 255, 0.25)` | `1.5px solid rgba(255, 255, 255, 0.12)` / `rgba(0, 0, 0, 0.08)` |
| Icon glow | `drop-shadow(0 0 6px rgba(0, 122, 255, 0.45))` | none |
| Group dot | `7×7px` blue at `top: 5px, right: 5px` | `0×0px` |
| Slider fill | `rgb(0, 122, 255)` | — |

### 3.3 Apple TV Tile (State Button)

`button_type: state`. Tap sends play/pause; hold opens more-info.

```yaml
tap_action:
  action: perform-action
  perform_action: media_player.media_play_pause
  target:
    entity_id: media_player.living_room_apple_tv
```

**Active condition:** `hass.states['media_player.living_room_apple_tv']?.state === 'playing'`

| Property | Playing | Inactive |
|----------|---------|----------|
| Accent | `rgb(0, 122, 255)` | — |
| Background (dark) | `rgba(0, 122, 255, 0.14)` | `rgba(255, 255, 255, 0.08)` |
| Icon bg | `rgba(0, 122, 255, 0.14)` | `rgba(255, 255, 255, 0.06)` / `rgba(0, 0, 0, 0.04)` |
| Icon glow | `drop-shadow(0 0 6px rgba(0, 122, 255, 0.45))` | none |

### 3.4 Samsung TV Tile (State Button)

`button_type: state`. Tap toggles; hold opens more-info.

**Active condition:** `hass.states['media_player.living_room_samsung_q60']?.state === 'on'`

| Property | On | Off |
|----------|-----|-----|
| Accent | `rgb(168, 85, 247)` | — |
| Background (dark) | `rgba(168, 85, 247, 0.14)` | `rgba(255, 255, 255, 0.08)` |
| Background (light) | `rgba(168, 85, 247, 0.10)` | `rgba(255, 255, 255, 0.9)` |
| Border (dark) | `1px solid rgba(168, 85, 247, 0.30)` | `1px solid rgba(255, 255, 255, 0.12)` |
| Icon bg | `rgba(168, 85, 247, 0.14)` | — |
| Icon glow | `drop-shadow(0 0 6px rgba(168, 85, 247, 0.45))` | none |

### 3.5 Common Media Tile Properties

All three media tiles share:

| Property | Value |
|----------|-------|
| Min height | `100px` |
| Padding | `8px 4px` |
| Border radius | `14px` |
| Clip path | `inset(0 round 14px)` |
| Icon size | `36×36px`, border-radius `11px` |
| Icon `--mdc-icon-size` | `24px` |
| Icon backdrop filter | `blur(4px)` |
| Name font | `14px`, weight `650`, line-height `1.2` |
| Name ON (dark) | `rgba(255, 255, 255, 0.95)` |
| Name OFF (dark) | `rgba(255, 255, 255, 0.50)` |
| Name ON (light) | `rgba(20, 20, 20, 0.95)` |
| Name OFF (light) | `rgba(40, 40, 40, 0.55)` |
| Press | `scale(0.95)` |

### 3.6 Media Tile Interaction Summary

| Tile | Gesture | Action |
|------|---------|--------|
| Sonos | Drag | Adjust volume (`button_type: slider`) |
| Sonos | Tap | `media_player.media_play_pause` on `media_player.living_room` |
| Sonos | Hold | `more-info` dialog |
| Sonos | Double-tap | `script.sonos_toggle_group_membership` with `target_speaker: media_player.living_room` |
| Apple TV | Tap | `media_player.media_play_pause` on `media_player.living_room_apple_tv` |
| Apple TV | Hold | `more-info` dialog |
| Samsung TV | Tap | `toggle` on `media_player.living_room_samsung_q60` |
| Samsung TV | Hold | `more-info` dialog |

---

## Section 4: Settings Popup (Bottom Sheet)

Opened by tapping the gear sub-button on the header separator. Contains secondary controls, room info, and alarm management. Presented as a bottom sheet via browser-mod.

### 4.1 Popup Container

| Property | Value |
|----------|-------|
| Presentation | Bottom sheet (slides up from bottom) |
| Border radius | `24px 24px 0 0` (top corners only) |
| Padding | `--popup-padding: 0` |
| Dismiss | Tap backdrop, swipe down, or tap Close button / right_button |
| `right_button` | `Close` |
| `dismissable` | `true` |

### 4.2 Popup Header Row

Replaces the old handle bar. A `custom:mod-card` wrapping a `horizontal-stack` with title and close button.

```yaml
- type: custom:mod-card
  card_mod:
    style: |
      ha-card {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
        padding: 16px 8px 0 16px !important;
      }
  card:
    type: horizontal-stack
    cards:
      - type: markdown
        content: "## Living Room Settings"
      - type: custom:bubble-card  # Close button
        card_type: button
        button_type: state
        entity: light.living_room_lights
        icon: mdi:close
        tap_action:
          action: fire-dom-event
          browser_mod:
            service: browser_mod.close_popup
```

| Component | Property | Value |
|-----------|----------|-------|
| Title | Text | "Living Room Settings" |
| Title | Font size | `20px` |
| Title | Font weight | `700` |
| Title | Letter spacing | `-0.3px` |
| Close button | Size | `36×36px` |
| Close button | Border radius | `50%` (circular) |
| Close button | Background | `rgba(128, 128, 128, 0.12)` |
| Close button | Icon | `mdi:close`, `20px` |
| Close button | Icon color | `rgba(128, 128, 128, 0.7)` |
| Close button | Tap action | `browser_mod.close_popup` via `fire-dom-event` |

### 4.3 Room Brightness Slider

Full-width slider for controlling all on-state lights simultaneously.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: slider
  entity: light.living_room_lights
  name: Room Brightness
  icon: mdi:brightness-7
  show_state: false
  show_attribute: true
  attribute: brightness
  scrolling_effect: false
  tap_action:
    action: toggle
  hold_action:
    action: more-info
```

### 4.4 Quick Action Buttons

All quick actions are full-width rows with icon + text label, using IIFE `styles` blocks with `isDark` support.

**Common styling:**

| Property | Value |
|----------|-------|
| Height | `48px` |
| Border radius | `14px` |
| Icon size | `18px` |
| Label font | `14px`, weight `500` |
| Padding | `0 16px` |

#### 4.4.1 All On / All Off Toggle

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: light.living_room_lights
  name: "Turn All Off"
  icon: mdi:lightbulb-group
  show_name: true
  show_state: false
  tap_action:
    action: toggle
```

| Property | Lights On (light) | Lights On (dark) | All Off (light) | All Off (dark) |
|----------|------------------|------------------|----------------|----------------|
| Background | `rgba(255, 149, 0, 0.06)` | `rgba(255, 149, 0, 0.10)` | `rgba(0, 0, 0, 0.04)` | `rgba(255, 255, 255, 0.06)` |
| Icon color | `rgb(255, 149, 0)` | `rgb(255, 149, 0)` | `rgba(60, 60, 60, 0.45)` | `rgba(255, 255, 255, 0.30)` |

#### 4.4.2 Reset Manual Overrides

**Conditional:** Hidden via `display: ${n === 0 ? 'none' : 'flex'}` when no overrides active.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: sensor.room_living_state
  name: "Reset Manual Overrides"
  icon: mdi:restore
  tap_action:
    action: call-service
    service: adaptive_lighting.set_manual_control
    data:
      manual_control: false
    target:
      entity_id:
        - switch.adaptive_lighting_main_living
        - switch.adaptive_lighting_accent_spots
        - switch.adaptive_lighting_column_lights
        - switch.adaptive_lighting_recessed_ceiling
```

| Property | Value |
|----------|-------|
| Background (light) | `rgba(255, 59, 48, 0.05)` |
| Background (dark) | `rgba(255, 59, 48, 0.08)` |
| Icon color | `#ff3b30` |
| Right badge | Red count badge via `::after` showing override count |
| Badge bg | `#ff3b30`, white text, `11px` weight `700`, `20px` height, `10px` radius |

#### 4.4.3 Brighten / Dim (Side by Side)

Two buttons sharing a row via `horizontal-stack`.

```yaml
- type: horizontal-stack
  cards:
    - type: custom:bubble-card  # Brighten
      entity: light.living_room_lights
      name: "Brighten"
      icon: mdi:weather-sunny
      tap_action:
        action: call-service
        service: script.oal_global_manual_brighter
        data:
          lights: light.living_room_lights
    - type: custom:bubble-card  # Dim
      entity: light.living_room_lights
      name: "Dim"
      icon: mdi:weather-night
      tap_action:
        action: call-service
        service: script.oal_global_manual_dimmer
        data:
          lights: light.living_room_lights
```

| Property | Value |
|----------|-------|
| Background (light) | `rgba(0, 0, 0, 0.04)` |
| Background (dark) | `rgba(255, 255, 255, 0.06)` |
| Icon color | `rgba(120, 80, 180, 0.85)` |
| Label font | `13px`, weight `500` |
| Gap | `8px` |
| Layout | `center` justified |

### 4.5 Room Info Section

A section separator labeled "Room Info" followed by three status rows showing OAL configuration, temperature, and lights count.

#### 4.5.1 Section Separator

```yaml
- type: custom:bubble-card
  card_type: separator
  name: Room Info
  icon: mdi:information-outline
```

| Property | Value |
|----------|-------|
| Name font | `13px`, weight `600`, `uppercase`, `letter-spacing: 0.5px` |
| Opacity | `0.5` |
| Icon container | Hidden (`display: none`) |
| Line | Hidden (`display: none`) |
| Padding | `12px 14px 4px 14px` |

#### 4.5.2 Lighting Mode

Shows the current OAL active configuration with color coding per mode.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: input_select.oal_active_configuration
  name: "Lighting Mode"
  icon: mdi:lightbulb-auto
  tap_action:
    action: more-info
```

**Color mapping:**

| OAL Config | Accent Color |
|------------|-------------|
| Adaptive | `#34c759` (green) |
| Full Bright | `#ff9500` (orange) |
| Dim Ambient | `#8e8e93` (gray) |
| Warm Ambient | `#ff6b35` (deep orange) |
| TV Mode | `#af52de` (purple) |
| Sleep | `#5e5ce6` (indigo) |
| Manual | `#ff3b30` (red) |

| Property | Value |
|----------|-------|
| Height | `48px` |
| Border radius | `14px` |
| Background (light) | `rgba(0, 0, 0, 0.04)` |
| Background (dark) | `rgba(255, 255, 255, 0.06)` |
| Right text | Mode name via `::after`, `13px` weight `600`, colored per mode |

#### 4.5.3 Temperature

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: sensor.living_room_temperature
  name: "Temperature"
  icon: mdi:thermometer
  tap_action:
    action: more-info
```

| Property | Value |
|----------|-------|
| Right text | `'{temp}{unit}'` via `::after`, primary text color |

#### 4.5.4 Lights On

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: sensor.room_living_state
  name: "Lights On"
  icon: mdi:lightbulb-group-outline
  tap_action:
    action: more-info
```

| Property | Value |
|----------|-------|
| Right text | `'{lightsOn} / 6'` via `::after` |
| With overrides | Appends `' (manual)'`, red color |
| Icon color (overrides) | `#ff3b30` |
| Icon color (lights on) | `#ff9500` |
| Icon color (all off) | Muted |

### 4.6 Alarms Section

A section separator labeled "Alarms" followed by two alarm toggle switches for the living room Sonos alarms.

#### 4.6.1 Section Separator

Same style as Room Info separator (4.5.1), with `name: Alarms` and `icon: mdi:alarm`.

#### 4.6.2 Alarm Toggle Cards

Two identical alarm cards for `switch.sonos_alarm_520` and `switch.sonos_alarm_521`.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: switch
  entity: switch.sonos_alarm_520
  show_name: true
  show_attribute: true
  attribute: recurrence
  icon: mdi:alarm
  tap_action:
    action: toggle
  hold_action:
    action: call-service
    service: script.sonos_load_alarm_for_edit
    data:
      alarm_entity: switch.sonos_alarm_520
  card_mod:
    style: |
      .bubble-name::after {
        font-size: 18px;
        font-weight: 700;
        content: '{{ state_attr("switch.sonos_alarm_520", "time")[:5] }}';
      }
      .bubble-attribute::after {
        content: '{% set r = state_attr("switch.sonos_alarm_520", "recurrence") %}{% if r == "DAILY" %}Every day{% elif r == "WEEKDAYS" %}Weekdays{% elif r == "WEEKENDS" %}Weekends{% elif r == "ONCE" %}Once{% elif r and r.startswith("ON_") %}Custom{% else %}{{ r }}{% endif %}';
      }
```

| Property | Enabled (on) | Disabled (off) |
|----------|-------------|----------------|
| Height | `56px` | `56px` |
| Border radius | `14px` | `14px` |
| Background (dark) | `rgba(66, 133, 244, 0.10)` | `rgba(255, 255, 255, 0.06)` |
| Background (light) | `rgba(66, 133, 244, 0.06)` | `rgba(0, 0, 0, 0.04)` |
| Icon color | `rgb(66, 133, 244)` | `rgba(255, 255, 255, 0.30)` / `rgba(60, 60, 60, 0.45)` |
| Name display | `font-size: 0` (hidden, time shown via `card_mod ::after`) |
| Time display | `18px`, weight `700` via `::after` |
| Recurrence | Rendered via Jinja template in `::after` |

| Gesture | Action |
|---------|--------|
| Tap | Toggle alarm on/off |
| Hold | `script.sonos_load_alarm_for_edit` with `alarm_entity` |

---

## Section 5: Sonos Popup (Bottom Sheet)

> **Note:** The Sonos popup is a separate card defined in `Dashboard/sonos_alarm_popup.yaml` and `Dashboard/cards/sonos_alarms_popup.yaml`. It is not part of this card's inline content. See those files for the full Sonos popup specification including now-playing, transport controls, volume slider, and speaker grouping.

---

## Section 6: Global Styles & Design Tokens

### 6.1 Color System

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Amber accent | `rgb(255, 149, 0)` / `#ff9500` | `rgb(255, 149, 0)` / `#ff9500` | Light icon active, manual slider fill |
| Amber fill (auto) | `#e8a000` | `#e8a000` | Slider fill (non-manual) |
| Amber tint | `rgba(255, 149, 0, 0.14)` | `rgba(255, 149, 0, 0.14)` | Icon backgrounds |
| Blue accent (system) | `rgb(0, 122, 255)` | `rgb(0, 122, 255)` | Playing state, Sonos, Apple TV |
| Blue accent (alarm) | `rgb(66, 133, 244)` | `rgb(66, 133, 244)` | Alarm enabled |
| Purple accent (media) | `rgb(168, 85, 247)` | `rgb(168, 85, 247)` | Samsung TV |
| Purple accent (controls) | `rgba(120, 80, 180, 0.85)` | `rgba(120, 80, 180, 0.85)` | Brighten/Dim buttons |
| Red accent | `rgb(255, 59, 48)` / `#ff3b30` | `rgb(255, 59, 48)` / `#ff3b30` | Manual override dot, reset button |
| Green accent (OAL) | `#34c759` | `#34c759` | OAL Adaptive mode |
| Inactive icon (light) | `rgba(60, 60, 60, 0.35)` | — | Off-state light tile icons |
| Inactive icon (dark) | — | `rgba(255, 255, 255, 0.45)` | Off-state light tile icons |
| Inactive name (light) | `rgba(0, 0, 0, 0.18)` | — | Off-state light names |
| Inactive name (dark) | — | `rgba(255, 255, 255, 0.50)` | Off-state light names |
| Surface ON (light) | `linear-gradient(180deg, rgba(255, 250, 240, 0.97)..rgba(255, 248, 235, 0.95))` | — | Active tile bg |
| Surface ON (dark) | — | `linear-gradient(180deg, rgba(48, 40, 28, 0.95)..rgba(36, 33, 28, 0.93))` | Active tile bg |
| Surface OFF (light) | `rgba(246, 246, 248, 0.95)` | — | Inactive tile bg |
| Surface OFF (dark) | — | `rgba(32, 32, 34, 0.7)` | Inactive tile bg |

### 6.2 Typography

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Room title | `22px` | `700` | `letter-spacing: -0.3px` |
| Popup title | `20px` | `700` | `letter-spacing: -0.3px` |
| Light name | `15px` | `600` | `line-height: 1.2` |
| Media name | `14px` | `650` | `line-height: 1.2` |
| Brightness value | `13px` | `500` | `font-variant-numeric: tabular-nums` |
| Slider pill | `14px` | `700` | `white-space: nowrap` |
| Popup button label | `14px` | `500` | Primary text color |
| Popup section label | `13px` | `600` | `uppercase`, `letter-spacing: 0.5px`, `opacity: 0.5` |
| Popup right status | `13px` | `600` | Via `::after` |
| Alarm time badge | `7px` | `600` | `::after` on sub-button |
| Alarm card time | `18px` | `700` | `::after` on `.bubble-name` |

### 6.3 Spacing System

| Context | Value |
|---------|-------|
| Outer card border radius | `26px` |
| Outer card padding | `4px 0 6px 0` |
| Outer card margin bottom | `12px` |
| Light tile border radius | `18px` |
| Light tile min-height | `110px` (with `aspect-ratio: 1/1`) |
| Light tile padding | `10px 6px 8px 6px` |
| Media tile border radius | `14px` |
| Media tile min-height | `100px` |
| Media tile padding | `8px 4px` |
| Light grid gap | `8px` |
| Media grid gap | `6px` |
| Grid padding | `2px 12px 4px 12px` |
| Header padding | `8px 14px 0 14px` |
| Light icon container | `50×50px`, `15px` radius |
| Media icon container | `36×36px`, `11px` radius |
| Header icon container | `52×52px`, `14px` radius |
| Manual control dot | `7×7px`, offset `8px 8px` from top-right |
| Sonos group dot | `7×7px`, offset `5px 5px` from top-right |
| Popup button height | `48px` |
| Popup alarm height | `56px` |
| Popup close button | `36×36px`, circular |

### 6.4 Transition System

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Tile container | `transform` | `0.15s` | `ease-out` |
| Tile container | `border-color` | `0.2s` | `ease` |
| Tile container | `background, box-shadow` | `0.3s` | `ease` |
| Icon | `opacity` | `0.25s` | `ease` |
| Icon container | `background, opacity` | `0.25s` | `ease` |
| Name | `color` | `0.25s` | `ease` |
| Attribute | `color` | `0.25s` | `ease` |
| Manual dot | `all` | `0.2s` | `ease` |
| Slider pill | `opacity` | `0.15s` | `ease` |
| Media tiles | `border-color, background, box-shadow` | `0.3s` | `ease` |
| Media icon | `color, filter` | `0.3s` | `ease` |

### 6.5 Shadow System

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Outer card | `0 4px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)` | `0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02)` |
| Tile ON | `0 2px 10px rgba(0, 0, 0, 0.12)` | `0 2px 10px rgba(0, 0, 0, 0.3)` |
| Tile OFF | `0 1px 4px rgba(0, 0, 0, 0.08)` | `0 1px 4px rgba(0, 0, 0, 0.15)` |
| Slider pill | `0 1px 6px rgba(0, 0, 0, 0.35)` | `0 1px 6px rgba(0, 0, 0, 0.35)` |
| Manual dot | `0 0 4px rgba(255, 59, 48, 0.5)` | `0 0 4px rgba(255, 59, 48, 0.5)` |
| Media ON | `0 2px 10px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.04)` | same |
| Media OFF | `0 1px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)` | same |

---

## Section 7: Conditional Visibility Summary

| Element | Condition | When Hidden |
|---------|-----------|-------------|
| Alarm sub-button | `has_upcoming_alarm` !== true (in styles IIFE) | `display: none` |
| Manual red dot | Entity NOT in zone's AL `manual_control` list | Dot shrinks to `0×0px` |
| Sonos group dot | `binary_sensor.sonos_living_room_in_playing_group` !== on | Dot shrinks to `0×0px` |
| Light tiles | NEVER hidden | All 6 always visible regardless of on/off |
| Media tiles | NEVER hidden | All 3 always visible regardless of state |
| Settings popup | Opened by gear sub-button tap | Dismissed by backdrop tap, swipe, Close X, or right_button |
| Reset button (popup) | `manually_controlled_lights` length === 0 | `display: none` via styles IIFE |
| Room Info section | Always visible | — |
| Alarms section | Always visible | — |

---

## Section 8: Replication Guide

This card design is a template. To create cards for other rooms:

1. **Copy the card structure** — `custom:mod-card` wrapping `vertical-stack` with separator header, light grid, media grid
2. **Adjust light count** — some rooms may have 3 lights (1×3 grid), 4 lights (2×2), or 8 lights (3×3 with gap). Update `grid-template-columns` accordingly
3. **Adjust media row** — some rooms have no media devices (remove media grid entirely), one Sonos (no group toggle), or different media devices
4. **Adjust room state sensor** — each room needs its own `sensor.room_X_state` entity
5. **Adjust AL switches** — each room has different adaptive lighting zones. Update the manual control dot checks and the reset button's target list
6. **Adjust room icon** — `mdi:sofa` (living), `mdi:bed` (bedroom), `mdi:silverware-fork-knife` (dining), `mdi:chef-hat` (kitchen)
7. **Adjust accent colors** — all rooms use amber for lighting; media accent colors may vary per device type
8. **Adjust alarm entities** — each room has its own Sonos alarm switches. Update `switch.sonos_alarm_XXX` entities and the `sensor.room_X_state` alarm attributes
9. **Adjust popup Room Info** — temperature sensor and OAL entities are room-specific

### Rooms to implement:
- Living Room (this spec — 6 lights, 3 media, Sonos group)
- Kitchen (lights TBD, single Sonos)
- Dining Room (lights TBD, no dedicated media)
- Bedroom (lights TBD, single Sonos, alarm chip priority)
- Accents (lights TBD, no media)
