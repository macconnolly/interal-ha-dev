# Living Room Card — Complete Implementation Specification

## Architecture Overview

This specification describes a single room card for a Home Assistant dashboard, designed for wall-mounted tablet and mobile use. The card is built entirely within the Bubble Card ecosystem, augmented by card-mod for outer container CSS overrides and layout-card for grid orchestration. The architecture prioritizes touch-first interaction where the primary control surface is per-light brightness adjustment via horizontal drag on individual button cards, and room-level quick controls are always visible in the header.

### Design Philosophy

The card follows a "progressive disclosure" model: the most-used interaction (individual light brightness) is always one drag away on the main view. The header provides room brightness via slider and a contextual alarm indicator. Less-used controls (all on/off, reset manual overrides, OAL brightness stepping, movie mode) are tucked into a settings popup behind a gear icon. Media play/pause is handled directly on the media tiles (tap), and Sonos group management is accessed via hold on the Sonos tile.

### Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `bubble-card` | ≥3.1.0 | Core card framework — separator, button cards, sub-buttons, sliders, pop-ups |
| `card-mod` | ≥3.4.0 | CSS injection for outer container styling and popup overrides |
| `layout-card` | latest | Grid layout orchestration for 3-column tile matrices |
| `browser-mod` | ≥2.3.0 | Enhanced popup management, bottom-sheet presentation, swipe-to-dismiss |

### Card Nesting Hierarchy

```
vertical-stack (outer container, card_mod on :host for card appearance)
├── bubble-card type: separator (header)
│   └── sub_button:
│       ├── main[0]: slider (room brightness) + hold to toggle
│       └── bottom[0]: Quick Controls group (inline buttons)
│           ├── All (toggle light.living_room_lights)
│           ├── Alarm (Sonos alarm toggle — conditional)
│           └── Gear (settings icon → fires settings popup)
├── layout-card type: custom:grid-layout (3-column light grid)
│   ├── bubble-card type: button, button_type: slider (Floor lamp)
│   ├── bubble-card type: button, button_type: slider (Couch lamp)
│   ├── bubble-card type: button, button_type: slider (Entry lamp)
│   ├── bubble-card type: button, button_type: slider (Spots)
│   ├── bubble-card type: button, button_type: slider (Columns)
│   └── bubble-card type: button, button_type: slider (Recessed)
├── layout-card type: custom:grid-layout (3-column media grid)
│   ├── bubble-card type: button, button_type: slider (Sonos — tap: play/pause, hold: group toggle)
│   ├── bubble-card type: button, button_type: state (Apple TV — tap: play/pause)
│   └── bubble-card type: button, button_type: state (Samsung TV — tap: toggle)
├── bubble-card type: pop-up (Settings sheet)
│   ├── Room Brightness slider (light.living_room_lights)
│   ├── All On/Off toggle
│   ├── Reset Manual Overrides (conditional)
│   ├── Brighten / Dim (side by side)
│   └── Movie Mode toggle
└── bubble-card type: pop-up (Sonos sheet)
    ├── Now Playing row (album art, track info)
    ├── Transport controls (prev, play/pause, next)
    ├── Primary volume slider
    └── Speaker grouping (per-speaker volume sliders)
```

---

## Entity Reference

### Lights (6 entities)

| Friendly Name | Entity ID | Icon (MDI) | AL Zone |
|---------------|-----------|------------|---------|
| Floor | `light.living_room_floor_lamp` | `mdi:floor-lamp` | `main_living` |
| Couch | `light.living_room_couch_lamp` | `mdi:lamp` | `main_living` |
| Entry | `light.entryway_lamp` | `mdi:desk-lamp` | `main_living` |
| Spots | `light.living_room_spot_lights` | `mdi:spotlight-beam` | `accent_spots` |
| Columns | `light.column_lights` | `mdi:led-strip-variant` | `column_lights` |
| Recessed | `light.living_room_hallway_lights` | `mdi:light-recessed` | `recessed_ceiling` |

### Light Group

| Entity | Purpose |
|--------|---------|
| `light.living_room_lights` | Group entity for room-level brightness control and all on/off toggle |

### Adaptive Lighting / Manual Control

| Entity | Purpose |
|--------|---------|
| `switch.adaptive_lighting_main_living` | Main zone AL switch (also has `manual_control` attribute for Floor, Couch, Entry) |
| `switch.adaptive_lighting_accent_spots` | Spots zone AL switch (has `manual_control` attribute for Spots) |
| `switch.adaptive_lighting_column_lights` | Column zone AL switch (has `manual_control` attribute for Columns) |
| `switch.adaptive_lighting_recessed_ceiling` | Recessed zone AL switch (has `manual_control` attribute for Recessed) |
| `sensor.room_living_state` | Room state sensor — attributes: `lights_on`, `manually_controlled_lights`, `has_upcoming_alarm`, `next_alarm_entity` |
| `input_number.oal_manual_offset_main_living_brightness` | Manual brightness offset value (positive = brighter, negative = dimmer) |

### Room State Sensor

The `sensor.room_living_state` entity drives header styling and sub-button visibility:

| State | Meaning |
|-------|---------|
| `playing` | Media is actively playing in the room |
| `active` | Lights are on but no media playing |
| `idle` | Everything off |

Key attributes:
- `lights_on` — integer count of lights currently on
- `manually_controlled_lights` — list of entity_ids with manual overrides
- `has_upcoming_alarm` — boolean for alarm chip visibility
- `next_alarm_entity` — entity_id of the upcoming alarm

### Media

| Friendly Name | Entity ID | Purpose |
|---------------|-----------|---------|
| Living Room (Sonos group) | `media_player.living_room` | Primary Sonos speaker / group |
| Apple TV | `media_player.living_room_apple_tv` | Apple TV media player |
| Samsung TV | `media_player.living_room_samsung_q60` | Samsung TV |

### Sonos Group Detection

| Entity | Purpose |
|--------|---------|
| `binary_sensor.sonos_living_room_in_playing_group` | On when Sonos is part of an active playing group |

---

## Outer Container

The entire card is a `type: vertical-stack` with `card_mod` applied to the `:host` selector. This provides a clean card background without needing `stack-in-card`.

### Light Mode Container

```yaml
type: vertical-stack
cards:
  # ... all child cards ...
card_mod:
  style: |
    :host {
      display: block !important;
      background: rgba(248, 248, 250, 0.98) !important;
      border-radius: 22px !important;
      padding: 4px 0 6px 0 !important;
      margin-bottom: 12px !important;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid rgba(0, 0, 0, 0.04) !important;
      overflow: hidden !important;
    }
    #root {
      gap: 0 !important;
    }
    #root > * {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
```

### Dark Mode Container

When implementing dark mode support, the `:host` background and border should change:

| Property | Light Mode | Dark Mode |
|----------|------------|-----------|
| Background | `rgba(248, 248, 250, 0.98)` | `rgba(28, 28, 30, 0.98)` |
| Border | `1px solid rgba(0, 0, 0, 0.04)` | `1px solid rgba(255, 255, 255, 0.04)` |
| Box shadow | `0 2px 16px rgba(0, 0, 0, 0.06)` | `0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02)` |
| Border radius | 22px | 22px |

The `#root` gap reset ensures child cards stack seamlessly without visible spacing between the separator, light grid, and media grid.

---

## Section 1: Separator Header

The separator is the top element of the card. It contains the room icon, room name, a room brightness slider, and a row of quick control sub-buttons. The bottom row has the all-lights toggle, a conditional alarm indicator, and a gear icon that opens the settings popup for less-used controls. Media play/pause is not on the header — it's handled directly on each media tile.

### Bubble Card Configuration

```yaml
- type: custom:bubble-card
  card_type: separator
  entity: light.living_room_lights
  name: Living Room
  icon: mdi:sofa
  rows: 1.5
  sub_button:
    bottom_layout: inline
    main:
      - entity: light.living_room_lights
        sub_button_type: slider
        name: Brightness
        icon: mdi:brightness-7
        hold_action:
          action: toggle
    bottom:
      - name: Quick Controls
        buttons_layout: inline
        justify_content: center
        group:
          # ... sub-buttons defined below ...
```

### 1.1 Room Icon (Left)

**Element:** Bubble Card separator's built-in icon position. Color is driven by `sensor.room_living_state`.

| Room State | Icon Color | Icon Background | Rationale |
|------------|------------|-----------------|-----------|
| `playing` | `rgb(66, 133, 244)` (blue) | `rgba(66, 133, 244, 0.18)` | Blue signals active media |
| `active` (lights on) | `rgb(255, 149, 0)` (amber) | `rgba(255, 149, 0, 0.18)` | Amber signals lighting activity |
| `idle` | `rgba(50, 50, 50, 0.55)` | `rgba(80, 80, 80, 0.10)` | Neutral gray signals inactive |

| Property | Value |
|----------|-------|
| Shape | Circular (`border-radius: 50%`) |
| Size | 52×52px |
| Icon size | 30px (`--mdc-icon-size`) |
| Border | `1.5px solid` at 0.25 opacity of the active color |
| Glow (active) | `drop-shadow(0 0 4px)` at 0.4 opacity of active color |
| Transition | Color/background via `0.3s ease` |

### 1.2 Room Title

| Property | Value |
|----------|-------|
| Text | "Living Room" |
| Font size | 22px |
| Font weight | 700 |
| Letter spacing | -0.3px |
| Color (light mode) | `rgba(25, 25, 25, 0.95)` |
| Color (dark mode) | `var(--primary-text-color)` |

### 1.3 Room Brightness Slider (Main Sub-Button)

The first element in `sub_button.main` is a slider controlling `light.living_room_lights`. This provides room-level brightness control directly in the header, without needing a popup.

| Property | Value |
|----------|-------|
| Entity | `light.living_room_lights` |
| Type | `sub_button_type: slider` |
| Icon | `mdi:brightness-7` |
| Name | "Brightness" |
| Hold action | Toggle all lights on/off |

The slider uses Bubble Card's native sub-button slider rendering. No custom CSS is needed for slider behavior.

### 1.4 Quick Control Sub-Buttons (Bottom Row)

The bottom sub-button row contains a centered group of icon-only action buttons. Each button is 32px tall, circular, with dynamic coloring based on state.

**Container styling:**

| Property | Value |
|----------|-------|
| Layout | Inline, centered (`justify_content: center`) |
| Background | `rgba(60, 60, 60, 0.05)` with `backdrop-filter: blur(4px)` |
| Border | `1px solid rgba(60, 60, 60, 0.10)` |
| Border radius | 10px |
| Padding | `3px 5px` |
| Gap | 4px |
| Width | `fit-content` (shrinks to content) |
| Margin | `4px auto 0 auto` (centered) |

**Per-button defaults:**

| Property | Value |
|----------|-------|
| `show_name` | false |
| `show_icon` | true |
| `show_background` | true |
| `state_background` | false |
| `custom_height` | 32 |
| `fill_width` | false |
| Background (inactive) | `rgba(60, 60, 60, 0.07)` |
| Border (inactive) | `1px solid rgba(60, 60, 60, 0.12)` |
| Icon color (inactive) | `rgba(60, 60, 60, 0.55)` |
| Border radius | 8px |
| Press animation | `transform: scale(0.90)` on `:active` |

#### 1.4.1 All Lights Toggle

| Property | Value |
|----------|-------|
| Entity | `light.living_room_lights` |
| Icon | `mdi:lightbulb-group` |
| Active condition | `light.living_room_lights` state = `on` |
| Active background | `rgba(255, 149, 0, 0.16)` |
| Active border | `1px solid rgba(255, 149, 0, 0.35)` |
| Active icon color | `rgb(255, 149, 0)` |
| Tap action | `toggle` on `light.living_room_lights` |
| Hold action | `more-info` |

#### 1.4.2 Alarm Chip

| Property | Value |
|----------|-------|
| Entity | `sensor.sonos_next_alarm_chip` |
| Icon | `mdi:alarm` |
| Visibility | Only when `sensor.room_living_state` attribute `has_upcoming_alarm` = true |
| Active condition | Alarm is enabled (`sensor.hero_button_alarm_state` attribute `is_enabled` = true) |
| Active background | `rgba(66, 133, 244, 0.14)` |
| Active border | `1px solid rgba(66, 133, 244, 0.35)` |
| Active icon color | `rgb(66, 133, 244)` |
| Tap action | `script.sonos_toggle_next_alarm` with alarm entity and tracker |
| Hold action | `more-info` |
| Time badge | `::after` pseudo-element shows formatted time (7px font, absolute bottom-right) |

#### 1.4.3 Settings Gear Icon

| Property | Value |
|----------|-------|
| Icon | `mdi:cog` |
| Background (inactive) | `rgba(60, 60, 60, 0.07)` |
| Border (inactive) | `1px solid rgba(60, 60, 60, 0.12)` |
| Icon color | `rgba(60, 60, 60, 0.55)` (light mode) / `rgba(255, 255, 255, 0.45)` (dark mode) |
| Tap action | `fire-dom-event` → triggers settings popup (see Section 4) |

```yaml
- entity: ""
  icon: mdi:cog
  show_name: false
  show_icon: true
  show_background: true
  state_background: false
  custom_height: 32
  fill_width: false
  tap_action:
    action: fire-dom-event
    browser_mod:
      service: browser_mod.popup
      data:
        content: !include popups/living_room_settings.yaml
        style:
          --popup-border-radius: 24px 24px 0 0
          --popup-padding: 0
        right_button: Close
        dismissable: true
        autoclose: true
```

### 1.5 Header Styling (JavaScript `styles` Block)

The header uses Bubble Card's JavaScript `styles` property (not card-mod Jinja2) for dynamic state-based styling. All color decisions are computed in a single IIFE that reads room state from `sensor.room_living_state` and related entities.

```yaml
styles: |-
  ${(() => {
    const roomState = hass.states['sensor.room_living_state']?.state || 'idle';
    const lightsOn = parseInt(hass.states['sensor.room_living_state']?.attributes?.lights_on || '0');
    let iconColor, iconBg;
    if (roomState === 'playing') {
      iconColor = 'rgb(66, 133, 244)';
      iconBg = 'rgba(66, 133, 244, 0.18)';
    } else if (roomState === 'active' || lightsOn > 0) {
      iconColor = 'rgb(255, 149, 0)';
      iconBg = 'rgba(255, 149, 0, 0.18)';
    } else {
      iconColor = 'rgba(50, 50, 50, 0.55)';
      iconBg = 'rgba(80, 80, 80, 0.10)';
    }
    // ... derive per-button state from hass.states ...
    return `
      ha-card { ... }
      .bubble-icon-container { background: ${iconBg} !important; ... }
      .bubble-icon { color: ${iconColor} !important; ... }
      ...
    `;
  })()}
```

**Key CSS targets within the styles block:**

| Selector | Purpose |
|----------|---------|
| `ha-card` | Transparent background, no border/shadow (outer card_mod handles container) |
| `.bubble-icon-container` | Circular icon area, state-driven background/border |
| `.bubble-icon` | Icon color, size (30px), optional glow filter |
| `.bubble-name` | Room title typography |
| `.bubble-sub-button-container` | Main sub-button row gap |
| `.bubble-sub-button` | Default sub-button shape (circular, 36px) |
| `.bubble-sub-button-bottom-container` | Quick controls pill container |
| `.bubble-sub-button-N` | Per-button state coloring (N = global index) |

**Important:** Sub-button global indices account for the main slider occupying index 0/1. Bottom group buttons start at index 2:
- Index 2 = All Lights
- Index 3 = Alarm (conditional)
- Index 4 = Gear (settings popup)

---

## Section 2: Light Tile Grid

The core interaction surface. Six Bubble Card button cards arranged in a 3×2 grid via `layout-card`. Every tile is independently draggable for brightness control. All lights are ALWAYS visible regardless of on/off state — off lights are visually muted but never hidden.

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
  cards:
    # ... 6 light tiles ...
```

| Property | Value |
|----------|-------|
| Layout type | `custom:grid-layout` |
| Columns | 3 (collapses to 2 below 400px) |
| Gap | 8px |
| Padding | `2px 12px 4px 12px` |

### 2.2 Individual Light Tile

Each light tile is a `bubble-card` of `card_type: button` with `button_type: slider`. This makes the entire tile surface a horizontal drag target for brightness control.

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

**Key configuration notes:**
- `show_state: false` + `show_attribute: true` + `attribute: brightness` displays the brightness value below the name
- `scrolling_effect: false` prevents unwanted scroll behavior during drag
- `card_mod` makes the ha-card itself transparent — all visual styling is handled by the `styles` block on `.bubble-button-card-container`
- `double_tap_action` sets brightness to 100% for quick full-brightness
- `sub_button: main: [] bottom: []` on non-header tiles to avoid inheriting defaults

#### 2.2.1 Tile Container (`.bubble-button-card-container`)

The tile container uses a centered vertical grid layout with the icon on top, name below, brightness below that, and the slider bar at the absolute bottom.

| Property | Value |
|----------|-------|
| Display | Grid: `auto auto 1fr auto` rows, centered |
| Min height | 100px |
| Padding | `8px 4px 8px 4px` |
| Border radius | 14px |
| Clip | `clip-path: inset(0 round 14px)` (ensures slider fill respects radius) |
| Press feedback | `transform: scale(0.95)` on `:active` |

**ON state (light mode):**

| Property | Value |
|----------|-------|
| Background | `linear-gradient(180deg, rgba(255, 149, 0, 0.13) 0%, rgba(255, 255, 255, 0.06) 100%)` |
| Backdrop filter | `blur(12px) saturate(140%)` |
| Border | `1px solid rgba(255, 149, 0, 0.40)` |
| Box shadow | `0 4px 20px rgba(255, 149, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.25)` |

**OFF state (light mode):**

| Property | Value |
|----------|-------|
| Background | `rgba(255, 255, 255, 0.08)` |
| Backdrop filter | `blur(8px) saturate(110%)` |
| Border | `1px solid rgba(160, 160, 165, 0.30)` |
| Box shadow | `0 1px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.15)` |

**ON state (dark mode):**

| Property | Value |
|----------|-------|
| Background | `linear-gradient(180deg, rgba(48, 40, 28, 0.95) 0%, rgba(36, 33, 28, 0.93) 100%)` |
| Border | `1.5px solid rgba(255, 149, 0, 0.14)` |
| Box shadow | `0 2px 10px rgba(0, 0, 0, 0.3)` |

**OFF state (dark mode):**

| Property | Value |
|----------|-------|
| Background | `rgba(32, 32, 34, 0.7)` |
| Border | `1.5px solid rgba(255, 255, 255, 0.04)` |
| Box shadow | `0 1px 4px rgba(0, 0, 0, 0.15)` |

**Transitions:** `transform 0.15s ease-out, border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease`

#### 2.2.2 Icon Circle (`.bubble-icon-container`)

Centered at the top of the tile grid.

| Property | ON | OFF |
|----------|-----|-----|
| Size | 36×36px | 36×36px |
| Border radius | 50% (circular) | 50% |
| Background | `rgba(255, 149, 0, 0.12)` | `rgba(150, 150, 155, 0.10)` |
| Border | `1.5px solid rgba(255, 149, 0, 0.25)` | `1.5px solid rgba(150, 150, 155, 0.18)` |
| Backdrop filter | `blur(4px)` | `blur(4px)` |
| Icon size | 24px | 24px |
| Icon color | `rgb(255, 149, 0)` | `rgba(80, 80, 80, 0.45)` |
| Icon glow (on) | `drop-shadow(0 0 6px rgba(255, 149, 0, 0.45))` | none |
| Transition | `background 0.3s ease, border-color 0.3s ease` | — |

#### 2.2.3 Light Name (`.bubble-name`)

| Property | ON | OFF |
|----------|-----|-----|
| Font size | 14px | 14px |
| Font weight | 650 | 650 |
| Line height | 1.2 | 1.2 |
| Color (light mode) | `rgba(25, 25, 25, 0.95)` | `rgba(70, 70, 70, 0.65)` |
| Color (dark mode) | `var(--primary-text-color)` | `rgba(255, 255, 255, 0.22)` |
| Alignment | Center | Center |

#### 2.2.4 Brightness Attribute (`.bubble-attribute`)

Shows the raw brightness value (0–255) from the `brightness` attribute. Displayed below the name. Hidden during drag (the pill tooltip takes over).

| Property | ON | OFF |
|----------|-----|-----|
| Font size | 13px | 13px |
| Font weight | 600 | 600 |
| Color (light mode) | `rgb(255, 149, 0)` | `rgba(100, 100, 100, 0.5)` |
| Color (dark mode) | `rgba(255, 149, 0, 0.85)` | `rgba(255, 255, 255, 0.12)` |
| Drag behavior | `opacity: 0` when `.is-dragging` | — |

#### 2.2.5 Bottom Fill Bar (`.bubble-range-slider` + `.bubble-range-fill`)

A 4px horizontal bar at the absolute bottom of the tile. Width scales proportionally to brightness. This is implemented via Bubble Card's built-in slider mechanism.

| Property | Value |
|----------|-------|
| Height | 4px |
| Position | Absolute bottom, full width |
| Track background (`.bubble-range-slider`) | `rgba(0, 0, 0, 0.06)` |
| Fill color (`.bubble-range-fill`) | `rgb(255, 149, 0)` |
| Fill border radius | `0 0 14px 0` (rounded bottom-right to match tile) |
| Track border radius | `0 0 14px 14px` (rounded bottom corners) |
| Z-index | 10 |
| Overflow | `visible` (allows pill tooltip to extend above) |

#### 2.2.6 Slider Value Pill (`.bubble-range-value`)

Bubble Card's native slider pill displays the current brightness percentage during drag. It is positioned centered above the tile content, appearing as a floating capsule that shows during interaction.

**Do NOT replace this with a custom tooltip.** The native pill behavior is tested across touch devices and handles edge cases (dragging past tile boundaries, rapid value changes, multi-touch conflicts).

| Property | Value |
|----------|-------|
| Position | Absolute, `bottom: 50px`, `left: 50%`, `transform: translateX(-50%)` |
| Font size | 14px |
| Font weight | 700 |
| Color | `rgb(255, 149, 0)` |
| Background | `rgba(255, 255, 255, 0.92)` |
| Padding | `2px 8px` |
| Border radius | 8px |
| Box shadow | `0 1px 6px rgba(0, 0, 0, 0.10)` |
| Default opacity | 0 (hidden) |
| Drag opacity | 1 (via `.is-dragging .bubble-range-value`) |
| Pointer events | none |
| Z-index | 30 |
| White space | `nowrap` |
| Transition | `opacity 0.15s ease` |

**Key interaction: During drag, the pill appears and both `.bubble-attribute` and `.bubble-state` fade to 0 opacity, preventing visual overlap.**

#### 2.2.7 Manual Control Red Dot (`::after` pseudo-element)

A red indicator dot at the top-right corner of any tile whose entity appears in the `manual_control` attribute of its zone's AL switch. Implemented via `::after` on `.bubble-button-card-container`.

| Property | Active | Inactive |
|----------|--------|----------|
| Size | 7×7px | 0×0px |
| Position | Absolute, `top: 5px`, `right: 5px` |
| Color | `rgb(255, 110, 90)` | transparent |
| Border | `1.5px solid rgba(255, 255, 255, 0.9)` | none |
| Box shadow | `0 0 4px rgba(255, 110, 90, 0.5)` | none |
| Z-index | 25 |
| Transition | `all 0.2s ease` |

**Per-tile AL switch mapping:**

| Light Entity | AL Switch for manual_control check |
|---|---|
| `light.living_room_floor_lamp` | `switch.adaptive_lighting_main_living` |
| `light.living_room_couch_lamp` | `switch.adaptive_lighting_main_living` |
| `light.entryway_lamp` | `switch.adaptive_lighting_main_living` |
| `light.living_room_spot_lights` | `switch.adaptive_lighting_accent_spots` |
| `light.column_lights` | `switch.adaptive_lighting_column_lights` |
| `light.living_room_hallway_lights` | `switch.adaptive_lighting_recessed_ceiling` |

The check uses `.includes()` on the AL switch's `manual_control` attribute array:
```javascript
(hass.states['switch.adaptive_lighting_main_living']?.attributes?.manual_control || [])
  .includes('light.living_room_floor_lamp')
```

For the column_lights zone (single entity), `.length > 0` is used instead of `.includes()`.

#### 2.2.8 Tile Interaction Summary

| Gesture | Action |
|---------|--------|
| Horizontal drag | Adjust brightness (built-in `button_type: slider`) |
| Tap | Toggle light on/off |
| Hold | Open more-info dialog |
| Double-tap | Set brightness to 100% |

#### 2.2.9 Tile Styling (JavaScript `styles` Block)

Each tile uses Bubble Card's JavaScript `styles` property for dynamic state-driven CSS. The `state` variable is available directly (provided by Bubble Card's template engine). Entity state for manual control detection is accessed via `hass.states[...]`.

```yaml
styles: |
  .bubble-button-card-container {
    ...
    background: ${state === 'on'
      ? 'linear-gradient(180deg, rgba(255, 149, 0, 0.13) 0%, rgba(255, 255, 255, 0.06) 100%)'
      : 'rgba(255, 255, 255, 0.08)'} !important;
    border: ${state === 'on'
      ? '1px solid rgba(255, 149, 0, 0.40)'
      : '1px solid rgba(160, 160, 165, 0.30)'} !important;
    ...
  }
  .bubble-icon {
    color: ${state === 'on'
      ? 'rgb(255, 149, 0)'
      : 'rgba(80, 80, 80, 0.45)'} !important;
    ...
  }
  .bubble-button-card-container::after {
    /* Manual control dot */
    width: ${(hass.states['switch.adaptive_lighting_main_living']?.attributes?.manual_control || []).includes('light.living_room_floor_lamp') ? '7px' : '0px'} !important;
    ...
  }
```

---

## Section 3: Media Row

Three media device tiles in a horizontal row below the light grid. All three share equal width in a 3-column grid. The Sonos tile has a volume slider; Apple TV and Samsung TV are state-only buttons.

### 3.1 Media Row Layout

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
  cards:
    # ... 3 media tiles ...
```

### 3.2 Sonos Tile (Volume Slider)

The Sonos tile uses `button_type: slider` with the `volume_level` attribute for drag-to-adjust volume. Its active state is driven by `binary_sensor.sonos_living_room_in_playing_group` rather than the raw entity state.

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
    action: call-service
    service: script.sonos_toggle_group_membership
    data:
      target_speaker: media_player.living_room
```

| Property | Active (in playing group) | Inactive |
|----------|--------------------------|----------|
| Accent color | `rgb(66, 133, 244)` (blue) | `rgba(80, 80, 80, 0.45)` |
| Background | `linear-gradient(180deg, rgba(66, 133, 244, 0.13) 0%, rgba(255, 255, 255, 0.06) 100%)` | `rgba(255, 255, 255, 0.08)` |
| Border | `1px solid rgba(66, 133, 244, 0.40)` | `1px solid rgba(160, 160, 165, 0.30)` |
| Group indicator dot | 7×7px blue circle, `top: 5px, right: 5px` | Hidden (0px) |
| Slider fill color | `rgb(66, 133, 244)` | `rgb(66, 133, 244)` |
| Pill tooltip color | `rgb(66, 133, 244)` | — |

The Sonos tile uses an IIFE `styles` block to check `binary_sensor.sonos_living_room_in_playing_group` state:
```javascript
const inGroup = hass.states['binary_sensor.sonos_living_room_in_playing_group']?.state === 'on';
```

### 3.3 Apple TV Tile (State Button)

Simple play/pause toggle. Uses `button_type: state` (no slider).

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: media_player.living_room_apple_tv
  name: Apple TV
  icon: mdi:apple
  show_state: false
  tap_action:
    action: perform-action
    perform_action: media_player.media_play_pause
    target:
      entity_id: media_player.living_room_apple_tv
  hold_action:
    action: more-info
```

| Property | Playing | Not Playing |
|----------|---------|-------------|
| Accent color | `rgb(66, 133, 244)` (blue) | gray |
| Background | Same gradient pattern as Sonos active | `rgba(255, 255, 255, 0.08)` |
| Active condition | `hass.states['media_player.living_room_apple_tv']?.state === 'playing'` | — |

### 3.4 Samsung TV Tile (State Button)

Toggle on/off. Same visual pattern as Apple TV.

```yaml
- type: custom:bubble-card
  card_type: button
  button_type: state
  entity: media_player.living_room_samsung_q60
  name: Samsung
  icon: mdi:television
  show_state: false
  tap_action:
    action: toggle
  hold_action:
    action: more-info
```

| Property | On | Off |
|----------|-----|-----|
| Accent color | `rgb(66, 133, 244)` (blue) | gray |
| Active condition | `hass.states['media_player.living_room_samsung_q60']?.state === 'on'` | — |

### 3.5 Media Tile Interaction Summary

| Tile | Gesture | Action |
|------|---------|--------|
| Sonos | Drag | Adjust volume (`button_type: slider`) |
| Sonos | Tap | `media_player.media_play_pause` on `media_player.living_room` |
| Sonos | Hold | `script.sonos_toggle_group_membership` with `target_speaker: media_player.living_room` — adds/removes from current playing group using the Sonos package's smart coordinator discovery |
| Apple TV | Tap | `media_player.media_play_pause` on `media_player.living_room_apple_tv` |
| Apple TV | Hold | `more-info` dialog |
| Samsung TV | Tap | `toggle` on `media_player.living_room_samsung_q60` |
| Samsung TV | Hold | `more-info` dialog |

---

## Section 4: Settings Popup (Bottom Sheet)

Opened by tapping the gear icon on the separator header. Contains all "secondary" controls that don't need to be on the main card surface. Presented as a bottom sheet via browser-mod.

### 4.1 Popup Container

| Property | Value |
|----------|-------|
| Presentation | Bottom sheet (slides up from bottom) |
| Border radius | `24px 24px 0 0` (top corners only) |
| Background (dark) | `rgba(28, 28, 30, 0.98)` |
| Background (light) | `rgba(255, 255, 255, 0.98)` |
| Backdrop | `rgba(0, 0, 0, 0.50)` with `backdrop-filter: blur(16px) saturate(1.5)` |
| Box shadow | `0 -8px 40px rgba(0, 0, 0, 0.3)` |
| Animation | Slide up with `cubic-bezier(0.16, 1, 0.3, 1)` easing, 0.3s duration |
| Dismiss | Tap backdrop, swipe down, or tap "Close" button |
| Max width | 400px, centered |
| Bottom padding | 40px (safe area for gesture bar on iPhones) |

### 4.2 Handle Bar

| Property | Value |
|----------|-------|
| Width | 36px |
| Height | 4px |
| Border radius | 2px |
| Color (dark) | `rgba(255, 255, 255, 0.15)` |
| Color (light) | `rgba(0, 0, 0, 0.12)` |
| Position | Centered, `padding: 10px 0 4px` |
| Purpose | Visual affordance for swipe-to-dismiss |

### 4.3 Popup Header

| Property | Value |
|----------|-------|
| Title | "Living Room" — 18px, weight 700 |
| Subtitle | "{n} of {total} lights on · {avg_brightness}% avg" — 13px, `var(--secondary-text-color)` at 0.5 opacity |
| Padding | `8px 24px 0` |

### 4.4 Room Brightness Slider

A full-width slider for controlling all on-state lights simultaneously. Uses `slider-entity-row` or a Bubble Card separator with `button_type: slider` targeting `light.living_room_lights`.

| Property | Value |
|----------|-------|
| Section label | "ROOM BRIGHTNESS" — 11px, weight 600, uppercase, `letter-spacing: 0.05em`, secondary text color |
| Slider height | 44px |
| Slider border radius | 14px |
| Track background (dark) | `rgba(255, 255, 255, 0.06)` |
| Track background (light) | `rgba(0, 0, 0, 0.05)` |
| Fill color (dark) | `rgba(255, 149, 0, 0.3)` |
| Fill color (light) | `rgba(255, 149, 0, 0.2)` |
| Fill border radius | 14px |
| Left label | "All Lights" — 13px, weight 500 |
| Right label | `{brightness}%` — 16px, weight 700, `tabular-nums` |
| Entity | `light.living_room_lights` |
| Padding | `18px 24px 0` |

### 4.5 Quick Action Buttons

All quick actions are full-width rows, stacked vertically with 4px gap. Each is a tappable button with icon, label, and optional right-side status.

#### 4.5.1 All On / All Off Toggle

| Property | Value |
|----------|-------|
| Section label | "CONTROLS" — same style as Room Brightness label |
| Icon | `mdi:lightbulb-group` (lights on) / `mdi:lightbulb-group-off` (all off) |
| Label | "Turn All Off" (when lights on) / "Turn All On" (when all off) |
| Background (lights on, dark) | `rgba(255, 149, 0, 0.10)` |
| Background (lights on, light) | `rgba(255, 149, 0, 0.06)` |
| Background (all off, dark) | `rgba(255, 255, 255, 0.06)` |
| Background (all off, light) | `rgba(0, 0, 0, 0.04)` |
| Height | 48px |
| Border radius | 14px |
| Icon size | 18px |
| Label font | 14px, weight 500 |
| Tap action | Call `light.toggle` on `light.living_room_lights` |

#### 4.5.2 Reset Manual Overrides

**Conditional:** Only visible when `manually_controlled_lights` list length > 0.

| Property | Value |
|----------|-------|
| Icon | `mdi:restore` |
| Label | "Reset {n} Manual Override(s)" |
| Right badge | Red count badge showing `{n}` |
| Background (dark) | `rgba(255, 59, 48, 0.08)` |
| Background (light) | `rgba(255, 59, 48, 0.05)` |
| Badge color | `#ff3b30` |
| Height | 48px |
| Border radius | 14px |
| Tap action | `adaptive_lighting.set_manual_control` with `manual_control: false` on all 4 AL zones |

Reset targets all four living room AL switches:
- `switch.adaptive_lighting_main_living`
- `switch.adaptive_lighting_accent_spots`
- `switch.adaptive_lighting_column_lights`
- `switch.adaptive_lighting_recessed_ceiling`

#### 4.5.3 Brighten / Dim (Side by Side)

Two buttons sharing a row, each taking 50% width.

| Property | Brighten | Dim |
|----------|----------|-----|
| Icon | `mdi:weather-sunny` | `mdi:weather-night` |
| Label | "Brighten" | "Dim" |
| Background (dark) | `rgba(255, 255, 255, 0.06)` | `rgba(255, 255, 255, 0.06)` |
| Background (light) | `rgba(0, 0, 0, 0.04)` | `rgba(0, 0, 0, 0.04)` |
| Active (dark) | `rgba(138, 100, 200, 0.12)` | `rgba(138, 100, 200, 0.12)` |
| Active border | `1px solid rgba(138, 100, 200, 0.30)` | `1px solid rgba(138, 100, 200, 0.30)` |
| Height | 48px |
| Border radius | 14px |
| Font | 13px, weight 500 |
| Tap action | `script.oal_global_manual_brighter` with `lights: light.living_room_lights` | `script.oal_global_manual_dimmer` with `lights: light.living_room_lights` |

#### 4.5.4 Movie Mode

| Property | Value |
|----------|-------|
| Icon | `mdi:movie-open` |
| Label | "Movie Mode" |
| Right status | "On" (purple) / "Off" (muted) |
| Background (active, dark) | `rgba(175, 82, 222, 0.12)` |
| Background (active, light) | `rgba(175, 82, 222, 0.06)` |
| Background (inactive, dark) | `rgba(255, 255, 255, 0.06)` |
| Background (inactive, light) | `rgba(0, 0, 0, 0.04)` |
| Active color | `#af52de` |
| Height | 48px |
| Border radius | 14px |
| Tap action | Activate `scene.living_room_movie_mode` or trigger movie mode automation |

---

## Section 5: Sonos Popup (Bottom Sheet)

Opened by tapping the Sonos tile in the media row (or by changing the Sonos tile's tap action to open this popup instead of play/pause). This is the richest popup in the system. Contains now-playing, transport controls, primary volume, and speaker grouping with per-speaker volume sliders.

### 5.1 Popup Container

Same container styling as Settings Popup (Section 4.1). The popup shell is identical across all popups for visual consistency — only the content cards inside change.

### 5.2 Now Playing Row

Horizontal layout: album art on left, track info on right.

| Property | Value |
|----------|-------|
| Layout | Flexbox row, `gap: 16px`, `padding: 14px 24px 16px` |
| Album art size | 80×80px |
| Album art border radius | 18px |
| Album art placeholder (dark) | `linear-gradient(135deg, rgba(52, 199, 89, 0.18), rgba(0, 122, 255, 0.12))` |
| Album art source | `state_attr('media_player.living_room', 'entity_picture')` |
| Album art shadow | `0 4px 16px rgba(0, 0, 0, 0.15)` |
| Track title | `state_attr('media_player.living_room', 'media_title')` — 19px, weight 600 |
| Artist | `state_attr('media_player.living_room', 'media_artist')` — 14px, secondary text color |
| Source badge | Small pill: green 5px dot + source name — 11px, weight 600, `rgba(52, 199, 89, 0.1)` bg |
| Overflow | Track title and artist truncate with `text-overflow: ellipsis` |

### 5.3 Transport Controls

Centered row of three buttons: Previous, Play/Pause, Next.

| Button | Icon (playing) | Icon (paused) | Size | Background |
|--------|---------------|---------------|------|------------|
| Previous | `mdi:skip-previous` | `mdi:skip-previous` | 38×38px, `border-radius: 12px` | transparent |
| Play/Pause | `mdi:pause` | `mdi:play` | 58×58px, `border-radius: 18px` | `rgba(255, 255, 255, 0.08)` dark / `rgba(0, 0, 0, 0.04)` light |
| Next | `mdi:skip-next` | `mdi:skip-next` | 38×38px, `border-radius: 12px` | transparent |

| Property | Value |
|----------|-------|
| Layout | Flex row, `justify-content: center` |
| Gap | 32px |
| Padding | `0 24px 20px` |
| Prev/Next opacity | 0.4 |
| Play/Pause opacity | 1.0 |
| Tap actions | `media_player.media_previous_track`, `media_player.media_play_pause`, `media_player.media_next_track` |

### 5.4 Primary Volume Slider

The volume control for the room's primary Sonos speaker. Uses Bubble Card's separator slider pattern, styled with green Sonos accent.

| Property | Value |
|----------|-------|
| Section label | "VOLUME" — standard section label style |
| Entity | `media_player.living_room` |
| Slider height | 38px |
| Slider border radius | 12px |
| Track background (dark) | `rgba(255, 255, 255, 0.06)` |
| Track background (light) | `rgba(0, 0, 0, 0.05)` |
| Fill color (dark) | `rgba(52, 199, 89, 0.35)` |
| Fill color (light) | `rgba(52, 199, 89, 0.25)` |
| Left label | Speaker name — 13px, weight 500 |
| Right label | `{volume}%` — 14px, weight 600, `tabular-nums` |
| Padding | `0 24px` |

### 5.5 Speaker Grouping Section

**Section label:** "SPEAKERS" — standard section label style, `padding: 14px 24px 6px`

Each additional speaker (Soundbar, Kitchen, Bathroom) renders as a **Bubble Card separator with `button_type: slider`** when grouped, or a static join button when ungrouped. Only one renders at a time based on `group_members` attribute.

#### Grouped Speaker (Active Volume Slider)

| Property | Value |
|----------|-------|
| Card type | `bubble-card` separator, `button_type: slider` |
| Entity | The speaker's `media_player` entity |
| Slider height | 40px |
| Slider border radius | 12px |
| Track background | `rgba(0, 122, 255, 0.06)` |
| Fill color (dark) | `rgba(0, 122, 255, 0.25)` |
| Fill color (light) | `rgba(0, 122, 255, 0.18)` |
| Border | `1px solid rgba(0, 122, 255, 0.12)` |
| Left icon | `mdi:speaker` — blue, tappable (tap to unjoin) |
| Name | Speaker name — 13px, weight 500, primary text |
| Right value | `{volume}%` — 13px, weight 600, `tabular-nums`, `#007aff` |
| Sub-button (left) | `mdi:speaker` icon — tap calls `sonos.unjoin` |

#### Ungrouped Speaker (Join Button)

| Property | Value |
|----------|-------|
| Card type | `mushroom-template-card` (not a slider — no volume to control) |
| Background (dark) | `rgba(255, 255, 255, 0.06)` |
| Background (light) | `rgba(0, 0, 0, 0.04)` |
| Border | `1px solid rgba(255, 255, 255, 0.04)` |
| Icon | `mdi:speaker-off` at 0.3 opacity |
| Name | Speaker name — 13px, weight 500, secondary text color |
| Right status | "Join" — secondary text color |
| Height | 40px |
| Border radius | 12px |
| Tap action | `sonos.join` with `master: media_player.living_room` |

**Speaker list for Living Room:**

| Speaker | Entity | Role |
|---------|--------|------|
| Living Room | `media_player.living_room` | Primary (status row + volume in 5.4) |
| Soundbar | `media_player.living_room_soundbar` | Groupable slider |
| Kitchen | `media_player.kitchen` | Groupable slider |
| Bathroom | `media_player.bathroom` | Groupable slider |

---

## Section 6: Global Styles & Design Tokens

### 4.1 Color System

| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| Amber accent | `rgb(255, 149, 0)` | `rgb(255, 149, 0)` | Light icon active, slider fill, manual override fill |
| Amber tint | `rgba(255, 149, 0, 0.12)` | `rgba(255, 149, 0, 0.14)` | Icon backgrounds, subtle fills |
| Amber border | `rgba(255, 149, 0, 0.40)` | `rgba(255, 149, 0, 0.14)` | Active tile borders |
| Blue accent | `rgb(66, 133, 244)` | `rgb(66, 133, 244)` | Media active, Sonos, alarm |
| Blue tint | `rgba(66, 133, 244, 0.12)` | `rgba(66, 133, 244, 0.18)` | Media icon backgrounds |
| Red accent | `rgb(255, 110, 90)` | `rgb(255, 110, 90)` | Manual override dot, reset button |
| Purple accent | `rgba(120, 80, 180, 0.85)` | `rgba(120, 80, 180, 0.85)` | Brighter/dimmer buttons |
| Inactive icon | `rgba(80, 80, 80, 0.45)` | `rgba(255, 255, 255, 0.25)` | Off-state icons |
| Inactive text | `rgba(70, 70, 70, 0.65)` | `rgba(255, 255, 255, 0.22)` | Off-state names |
| Subtle bg | `rgba(255, 255, 255, 0.08)` | `rgba(32, 32, 34, 0.7)` | Off-state tile backgrounds |
| Button inactive bg | `rgba(60, 60, 60, 0.07)` | `rgba(255, 255, 255, 0.06)` | Inactive sub-buttons |
| Button inactive border | `rgba(60, 60, 60, 0.12)` | `rgba(255, 255, 255, 0.04)` | Inactive sub-button borders |
| Button inactive icon | `rgba(60, 60, 60, 0.55)` | `rgba(255, 255, 255, 0.3)` | Inactive sub-button icons |

### 4.2 Typography

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Room title | 22px | 700 | `letter-spacing: -0.3px` |
| Light name | 14px | 650 | `line-height: 1.2` |
| Brightness value | 13px | 600 | — |
| Slider pill | 14px | 700 | `white-space: nowrap` |
| Sub-button icon | 18px | — | Header main buttons |
| Quick control icon | 16px | — | Bottom bar buttons |
| Alarm time badge | 7px | 600 | `::after` pseudo-element |

### 4.3 Spacing System

| Context | Value |
|---------|-------|
| Outer card border radius | 22px |
| Outer card padding | `4px 0 6px 0` |
| Outer card margin bottom | 12px |
| Tile border radius | 14px |
| Tile min-height | 100px |
| Tile padding | `8px 4px 8px 4px` |
| Grid gap | 8px |
| Grid padding | `2px 12px 4px 12px` |
| Header padding | `10px 14px 4px 14px` |
| Icon container size | 36px (tiles), 52px (header) |
| Quick controls container radius | 10px |
| Quick controls padding | `3px 5px` |
| Quick controls gap | 4px |
| Quick control button height | 32px |
| Slider bar height | 4px |
| Manual control dot | 7×7px, offset `5px 5px` from top-right |

### 4.4 Transition System

| Element | Property | Duration | Easing |
|---------|----------|----------|--------|
| Tile container | `transform` | 0.15s | `ease-out` |
| Tile container | `border-color, background, box-shadow` | 0.3s | `ease` |
| Icon | `color, filter` | 0.3s | `ease` |
| Icon container | `background, border-color` | 0.3s | `ease` |
| Manual dot | `all` | 0.2s | `ease` |
| Slider pill | `opacity` | 0.15s | `ease` |
| Brightness text | `opacity` | 0.15s | `ease` |
| Sub-button | `transform` | 0.1s | `ease` |
| Sub-button | `background` | 0.15s | `ease` |
| Press scale | `transform` | 0.1s | `ease` |

### 4.5 Shadow System

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Outer card | `0 2px 16px rgba(0, 0, 0, 0.06)` | `0 4px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.02)` |
| Tile on | `0 4px 20px rgba(255, 149, 0, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.25)` | `0 2px 10px rgba(0, 0, 0, 0.3)` |
| Tile off | `0 1px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.15)` | `0 1px 4px rgba(0, 0, 0, 0.15)` |
| Slider pill | `0 1px 6px rgba(0, 0, 0, 0.10)` | `0 1px 6px rgba(0, 0, 0, 0.10)` |
| Manual dot | `0 0 4px rgba(255, 110, 90, 0.5)` | `0 0 4px rgba(255, 110, 90, 0.5)` |

---

## Section 7: Conditional Visibility Summary

| Element | Condition | When Hidden |
|---------|-----------|-------------|
| Alarm sub-button | `has_upcoming_alarm` = true | Not rendered |
| Manual red dot | Entity in zone's AL `manual_control` list | Dot shrinks to 0×0px |
| Sonos group dot | `binary_sensor.sonos_living_room_in_playing_group` = on | Dot shrinks to 0×0px |
| Light tiles | NEVER hidden | All 6 always visible regardless of on/off |
| Media tiles | NEVER hidden | All 3 always visible regardless of state |
| Settings popup | Opened by gear icon tap | Dismissed by backdrop tap, swipe, or Close |
| Reset button (popup) | `manually_controlled_lights` list length > 0 | Button not rendered |
| Speaker grouping (popup) | Room has multiple speakers | Entire section not rendered |

---

## Section 8: Replication Guide

This card design is a template. To create cards for other rooms:

1. **Copy the card structure** — `vertical-stack` with `card_mod`, separator header, light grid, media grid
2. **Adjust light count** — some rooms may have 3 lights (1×3 grid), 4 lights (2×2), or 8 lights (3×3 with gap). Update `grid-template-columns` accordingly
3. **Adjust media row** — some rooms have no media devices (remove media grid entirely), one Sonos (no group toggle), or different media devices
4. **Adjust room state sensor** — each room needs its own `sensor.room_X_state` entity
5. **Adjust AL switches** — each room has different adaptive lighting zones. Update the manual control dot checks and the reset button's target list
6. **Adjust room icon** — `mdi:sofa` (living), `mdi:bed` (bedroom), `mdi:silverware-fork-knife` (dining), `mdi:chef-hat` (kitchen)
7. **Adjust accent colors** — all rooms use amber for lighting; media accent colors may vary per device type

### Rooms to implement:
- Living Room (this spec — 6 lights, 3 media, Sonos group)
- Kitchen (lights TBD, single Sonos)
- Dining Room (lights TBD, no dedicated media)
- Bedroom (lights TBD, single Sonos, alarm chip priority)
- Accents (lights TBD, no media)
