# Living Room Card — Complete Implementation Specification

## Architecture Overview

This specification describes a single room card for a Home Assistant dashboard, designed for wall-mounted tablet and mobile use. The card is built entirely within the Bubble Card ecosystem, augmented by card-mod for CSS overrides, Mushroom template chips for contextual data display, and browser-mod for advanced popup orchestration. The architecture prioritizes touch-first interaction where the primary control surface is per-light brightness adjustment via horizontal drag on individual button cards.

### Design Philosophy

The card follows a "progressive disclosure" model: the most-used interaction (individual light brightness) is always one drag away on the main view. Less-used controls (room-level brightness, all on/off, reset manual overrides, OAL config cycling) are tucked into a settings popup behind a gear icon. Media controls surface contextually — Sonos gets a rich popup, other media devices are simple toggles.

### Required Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `bubble-card` | ≥3.1.0 | Core card framework — separator, button cards, pop-ups, sub-buttons |
| `card-mod` | ≥3.4.0 | CSS injection for styling overrides on every card element |
| `mushroom-chips-card` | ≥3.2.0 | Template chips for conditional context display (alarm, temp, presence, timer) |
| `browser-mod` | ≥2.3.0 | Enhanced popup management, bottom-sheet presentation style, swipe-to-dismiss |
| `my-cards (slider-entity-row)` | latest | Slider rows inside popups for volume and room brightness |
| `layout-card` | latest | Grid layout orchestration for the 3-column button card matrix |
| `stack-in-card` | latest | Seamless stacking of separator + grid + media row without visible card boundaries |
| `config-template-card` | latest | Dynamic entity resolution and conditional rendering with Jinja2 templates |

### Card Nesting Hierarchy

```
stack-in-card (outer container, single card appearance)
├── bubble-card type: separator (header)
│   └── sub_button[0]: gear icon → fires pop-up event
├── mushroom-chips-card (context chips row — conditional)
│   ├── template chip: alarm
│   ├── template chip: temperature
│   ├── template chip: presence
│   └── template chip: manual timer (zone-wide)
├── layout-card type: grid (3-column light grid)
│   ├── bubble-card type: button (Floor lamp)
│   ├── bubble-card type: button (Couch lamp)
│   ├── bubble-card type: button (Entry lamp)
│   ├── bubble-card type: button (Spots)
│   ├── bubble-card type: button (Columns)
│   └── bubble-card type: button (Recessed)
├── layout-card type: grid (media row — asymmetric)
│   ├── bubble-card type: button (Sonos) — wider
│   ├── bubble-card type: button (Apple TV)
│   └── bubble-card type: button (Samsung TV)
├── bubble-card type: pop-up (Settings sheet)
│   ├── slider-entity-row (room brightness)
│   ├── mushroom-chips (OAL config options)
│   ├── bubble-card type: button (All On/Off)
│   ├── bubble-card type: button (Reset Manual)
│   ├── bubble-card type: button (Brighten)
│   ├── bubble-card type: button (Dim)
│   └── bubble-card type: button (Movie Mode)
└── bubble-card type: pop-up (Sonos sheet)
    ├── mushroom-media-player-card (now playing + transport)
    ├── slider-entity-row (volume)
    └── [conditional] speaker group buttons
```

---

## Entity Reference

### Lights (6 entities)

| Friendly Name | Entity ID | Icon (MDI) | Notes |
|---------------|-----------|------------|-------|
| Floor | `light.living_room_floor_lamp` | `mdi:floor-lamp` | |
| Couch | `light.living_room_couch_lamp` | `mdi:lamp` | |
| Entry | `light.living_room_entry_lamp` | `mdi:desk-lamp` | |
| Spots | `light.living_room_spots` | `mdi:spotlight-beam` | |
| Columns | `light.living_room_columns` | `mdi:pillar` | |
| Recessed | `light.living_room_recessed` | `mdi:ceiling-light-outline` | |

### Light Group

| Entity | Purpose |
|--------|---------|
| `light.main_living_lights` | Group entity for room-level brightness control (used in settings popup slider) |

### Adaptive Lighting / Manual Control

| Entity | Purpose |
|--------|---------|
| `switch.adaptive_lighting_main_living` | Master OAL switch for the zone |
| `switch.adaptive_lighting_sleep_mode_main_living` | Sleep mode toggle |
| `sensor.adaptive_lighting_main_living_manual_control` | Zone-wide manual control state. Attribute `manual_control` is a list of entity_ids currently overridden |
| `timer.adaptive_lighting_main_living` | Zone-wide timer showing seconds remaining until adaptive lighting reclaims control. State = `active`/`idle`, attribute `remaining` in `HH:MM:SS` format |

### Media

| Friendly Name | Entity ID | Purpose |
|---------------|-----------|---------|
| Sonos Credenza | `media_player.living_room_credenza` | Primary Sonos speaker for this room |
| Sonos Soundbar | `media_player.living_room_soundbar` | Secondary — available for grouping |
| Sonos Kitchen | `media_player.kitchen` | Groupable speaker |
| Sonos Bathroom | `media_player.bathroom` | Groupable speaker |
| Apple TV | `media_player.living_room_apple_tv` | Simple on/off toggle |
| Samsung TV | `media_player.living_room_samsung_tv` | Simple on/off toggle |

### Sensors (for context chips)

| Chip | Entity ID | Display Logic |
|------|-----------|---------------|
| Alarm | `sensor.next_alarm` or `sensor.iphone_next_alarm` | Show chip when state ≠ `unavailable` and ≠ `unknown`. Format: `{{ as_timestamp(states('sensor.next_alarm')) \| timestamp_custom('%I:%M %p') }}` |
| Temperature | `sensor.living_room_temperature` | Show chip when available. Format: `{{ states('sensor.living_room_temperature') \| round(0) }}°` |
| Presence | `binary_sensor.living_room_presence` | Show chip always for rooms with presence sensors. Display: "Occupied" (green dot) or "Empty" (gray dot) based on `on`/`off` |
| Manual Timer | `timer.adaptive_lighting_main_living` | Show chip only when state = `active`. Display remaining time with countdown. Format: `{{ state_attr('timer.adaptive_lighting_main_living', 'remaining') }}` |

---

## Section 1: Separator Header

The separator is the top element of the card. It contains the room icon, room name, a smart subtitle, and a gear button that opens the settings popup.

### Bubble Card Configuration

```yaml
type: custom:bubble-card
card_type: separator
name: Living Room
icon: mdi:sofa
```

### 1.1 Room Icon (Left)

**Element:** Bubble Card separator's built-in icon position.

| Property | Value | Rationale |
|----------|-------|-----------|
| Icon | `mdi:sofa` | Semantic room identifier visible from across the room |
| Size | 46×46px logical | Large enough for wall-mounted readability |
| Shape | Rounded square, `border-radius: 14px` | Consistent with iOS/Apple HIG rounded rect language |
| Background (lights on) | `rgba(255,149,0,0.13)` dark / `rgba(255,149,0,0.08)` light | Warm amber tint signals "this room has active lights" |
| Background (all off) | `rgba(128,128,128,0.08)` dark / `rgba(0,0,0,0.03)` light | Neutral gray signals inactive |
| Icon color (lights on) | `#ff9500` | Amber — the system accent for lighting |
| Icon color (all off) | `rgba(255,255,255,0.25)` dark / `rgba(0,0,0,0.2)` light | Desaturated to match inactive state |
| Transition | `all 0.3s ease` | Smooth state change when last light turns on/off |

**card-mod CSS target:** `.bubble-icon`

```yaml
card_mod:
  style: |
    .bubble-icon {
      --mdc-icon-size: 22px;
      width: 46px !important;
      height: 46px !important;
      border-radius: 14px !important;
      background: {% if is_state('light.main_living_lights', 'on') %}
        rgba(255,149,0,0.13)
      {% else %}
        rgba(128,128,128,0.08)
      {% endif %} !important;
      transition: all 0.3s ease !important;
    }
```

### 1.2 Room Title

**Element:** Bubble Card separator's built-in name.

| Property | Value |
|----------|-------|
| Text | "Living Room" |
| Font size | 20px |
| Font weight | 700 |
| Letter spacing | -0.03em (tight tracking for display type) |
| Color | Primary text — `var(--primary-text-color)` |

**card-mod CSS target:** `.bubble-name`

```yaml
    .bubble-name {
      font-size: 20px !important;
      font-weight: 700 !important;
      letter-spacing: -0.03em !important;
    }
```

### 1.3 Subtitle (Smart Status Line)

**Element:** Bubble Card separator's built-in sub text, using a Jinja2 template.

The subtitle dynamically displays:
- Light count: "{n} of {total} on"
- Manual override count (conditional): " · 🔴 {n}" — only when `sensor.adaptive_lighting_main_living_manual_control` attribute `manual_control` list length > 0
- Music indicator (conditional): " · ♪" — only when `media_player.living_room_credenza` state is `playing` or `paused`

```yaml
sub: >-
  {% set on_count = expand('light.main_living_lights') | selectattr('state', 'eq', 'on') | list | count %}
  {% set total = expand('light.main_living_lights') | list | count %}
  {% set manual = state_attr('sensor.adaptive_lighting_main_living_manual_control', 'manual_control') | default([]) | count %}
  {% set playing = is_state('media_player.living_room_credenza', 'playing') or is_state('media_player.living_room_credenza', 'paused') %}
  {{ on_count }} of {{ total }} on
  {% if manual > 0 %} · 🔴 {{ manual }}{% endif %}
  {% if playing %} · ♪{% endif %}
```

| Property | Value |
|----------|-------|
| Font size | 12px |
| Font weight | 400 |
| Color | `var(--secondary-text-color)` with 0.5 opacity |
| Manual count color | `#ff3b30` (system red) |
| Music indicator color | `#34c759` (system green) |

**card-mod CSS target:** `.bubble-sub`

```yaml
    .bubble-sub {
      font-size: 12px !important;
      opacity: 0.5 !important;
    }
```

### 1.4 Settings Gear Button (Right)

**Element:** Bubble Card `sub_button` at index 0, positioned at the right end of the separator.

| Property | Value |
|----------|-------|
| Icon | `mdi:cog` |
| Size | 42×42px |
| Shape | `border-radius: 13px` |
| Background | `rgba(255,255,255,0.05)` dark / `rgba(0,0,0,0.04)` light |
| Border | `1.5px solid rgba(255,255,255,0.06)` dark / `1.5px solid rgba(0,0,0,0.06)` light |
| Icon color | `rgba(255,255,255,0.45)` dark / `rgba(0,0,0,0.3)` light |
| Tap action | `fire-dom-event` → triggers settings popup |

```yaml
sub_button:
  - icon: mdi:cog
    show_background: true
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

**card-mod for sub-button:**

```yaml
    .bubble-sub-button-0 {
      width: 42px !important;
      height: 42px !important;
      border-radius: 13px !important;
      border: 1.5px solid rgba(255,255,255,0.06) !important;
      --mdc-icon-size: 17px;
      opacity: 0.45;
      transition: all 0.2s ease;
    }
```

---

## Section 2: Context Chips Row

A `mushroom-chips-card` placed directly below the separator, providing at-a-glance environmental context. The entire row is conditional — it renders only when at least one chip has data to display. Each chip is independently conditional.

### 2.1 Layout

| Property | Value |
|----------|-------|
| Alignment | Left-aligned, with `padding-left: 58px` to align with the separator title text (clearing the 46px icon + 12px gap) |
| Gap between chips | 5px |
| Chip height | ~24px (auto from padding) |
| Chip border radius | 8px |
| Row visibility | Entire `mushroom-chips-card` wrapped in `conditional` card — show when ANY chip entity is available |
| Margin | `margin-top: -4px` to tuck close to separator, `margin-bottom: 4px` before grid |

```yaml
type: custom:mushroom-chips-card
alignment: start
card_mod:
  style: |
    ha-card {
      --chip-spacing: 5px !important;
      padding-left: 58px !important;
      margin-top: -4px !important;
      margin-bottom: 4px !important;
      background: none !important;
      box-shadow: none !important;
    }
chips:
  - type: conditional
    conditions: [...]
    chip:
      type: template
      ...
```

### 2.2 Alarm Chip

**Condition:** Show only when `sensor.next_alarm` state ≠ `unavailable` AND ≠ `unknown`.
**Most relevant in bedroom cards but included for completeness in the design system.**

| Property | Value |
|----------|-------|
| Icon | `mdi:alarm` |
| Content | Time formatted as `6:30 AM` |
| Background | `rgba(255,204,0,0.08)` dark / `rgba(255,176,0,0.06)` light |
| Border | `1px solid rgba(255,204,0,0.10)` dark / `1px solid rgba(255,176,0,0.08)` light |
| Text color | `rgba(255,204,0,0.85)` dark / `#cc8800` light |
| Icon color | Same as text |
| Font | 11px, weight 600, `font-variant-numeric: tabular-nums` |

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: sensor.next_alarm
      state_not: unavailable
    - condition: state
      entity: sensor.next_alarm
      state_not: unknown
  chip:
    type: template
    icon: mdi:alarm
    icon_color: amber
    content: >-
      {{ as_timestamp(states('sensor.next_alarm')) | timestamp_custom('%I:%M %p') | replace(' 0', ' ') }}
    card_mod:
      style: |
        ha-card {
          background: rgba(255,204,0,0.08) !important;
          border: 1px solid rgba(255,204,0,0.10) !important;
          --chip-font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
```

### 2.3 Temperature Chip

**Condition:** Show when `sensor.living_room_temperature` state ≠ `unavailable`.

| Property | Value |
|----------|-------|
| Icon | `mdi:thermometer` |
| Content | `72°` (rounded integer, no decimal) |
| Background | `rgba(0,122,255,0.06)` dark / `rgba(0,122,255,0.04)` light |
| Border | `1px solid rgba(0,122,255,0.08)` dark / `1px solid rgba(0,122,255,0.06)` light |
| Text color | `rgba(100,180,255,0.85)` dark / `#0066cc` light |
| Tap action | Navigate to climate detail view or show temperature history popup |

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: sensor.living_room_temperature
      state_not: unavailable
  chip:
    type: template
    icon: mdi:thermometer
    icon_color: blue
    content: "{{ states('sensor.living_room_temperature') | round(0) }}°"
    card_mod:
      style: |
        ha-card {
          background: rgba(0,122,255,0.06) !important;
          border: 1px solid rgba(0,122,255,0.08) !important;
          --chip-font-size: 11px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;
        }
```

### 2.4 Presence Chip

**Condition:** Show when `binary_sensor.living_room_presence` is available. Two visual states:

| State | Dot Color | Label | Background |
|-------|-----------|-------|------------|
| `on` (occupied) | `#34c759` (green) | "Occupied" | `rgba(52,199,89,0.06)` dark / `rgba(52,199,89,0.04)` light |
| `off` (empty) | `#8e8e93` (gray) | "Empty" | `rgba(128,128,128,0.06)` dark / `rgba(128,128,128,0.04)` light |

The "dot" is rendered via an icon — `mdi:circle-small` colored to match state.

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: binary_sensor.living_room_presence
      state_not: unavailable
  chip:
    type: template
    icon: mdi:circle-small
    icon_color: >-
      {{ 'green' if is_state('binary_sensor.living_room_presence', 'on') else 'grey' }}
    content: >-
      {{ 'Occupied' if is_state('binary_sensor.living_room_presence', 'on') else 'Empty' }}
    card_mod:
      style: |
        ha-card {
          {% if is_state('binary_sensor.living_room_presence', 'on') %}
          background: rgba(52,199,89,0.06) !important;
          border: 1px solid rgba(52,199,89,0.08) !important;
          {% else %}
          background: rgba(128,128,128,0.06) !important;
          border: 1px solid rgba(128,128,128,0.06) !important;
          {% endif %}
          --chip-font-size: 11px;
          font-weight: 600;
        }
```

### 2.5 Manual Timer Chip (Zone-Wide)

**Condition:** Show only when `timer.adaptive_lighting_main_living` state = `active`.

This is the zone-wide adaptive lighting manual control timer. When any light in the room is manually overridden, this timer counts down to when adaptive lighting will reclaim control. It is a SINGLE timer for the entire zone, not per-light.

| Property | Value |
|----------|-------|
| Icon | `mdi:timer-outline` |
| Content | Remaining time in `MM:SS` or `HH:MM:SS` format |
| Background | `rgba(255,59,48,0.08)` dark / `rgba(255,59,48,0.05)` light |
| Border | `1px solid rgba(255,59,48,0.10)` dark / `1px solid rgba(255,59,48,0.08)` light |
| Text color | `#ff3b30` at 0.85 opacity |
| Font | 11px, weight 700, monospace `font-variant-numeric: tabular-nums` |
| Update frequency | Every second (timer entity updates automatically) |

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: timer.adaptive_lighting_main_living
      state: active
  chip:
    type: template
    icon: mdi:timer-outline
    icon_color: red
    content: >-
      {{ state_attr('timer.adaptive_lighting_main_living', 'remaining') }}
    card_mod:
      style: |
        ha-card {
          background: rgba(255,59,48,0.08) !important;
          border: 1px solid rgba(255,59,48,0.10) !important;
          --chip-font-size: 11px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          font-family: 'SF Mono', 'Menlo', monospace;
        }
```

---

## Section 3: Light Tile Grid

The core interaction surface. Six Bubble Card button cards arranged in a 3×2 grid. Every tile is independently draggable for brightness control. All lights are ALWAYS visible regardless of on/off state — off lights are visually muted but never hidden.

### 3.1 Grid Layout

| Property | Value |
|----------|-------|
| Type | `layout-card` with `grid` layout |
| Columns | 3 |
| Gap | 8px |
| Padding | `2px 12px 8px 12px` (tight top, generous sides, small bottom) |
| Aspect ratio | Each card: `1 / 1` (square tiles) |

```yaml
type: custom:layout-card
layout_type: grid
layout:
  grid-template-columns: 1fr 1fr 1fr
  gap: 8px
  padding: 2px 12px 8px 12px
cards:
  - !include tiles/living_room_floor.yaml
  - !include tiles/living_room_couch.yaml
  - !include tiles/living_room_entry.yaml
  - !include tiles/living_room_spots.yaml
  - !include tiles/living_room_columns.yaml
  - !include tiles/living_room_recessed.yaml
```

### 3.2 Individual Light Tile

Each light tile is a `bubble-card` of `card_type: button` with `button_type: slider`. This is the critical configuration that makes the entire tile surface a horizontal drag target for brightness control.

#### Base Configuration (per tile)

```yaml
type: custom:bubble-card
card_type: button
button_type: slider
entity: light.living_room_floor_lamp
name: Floor
icon: mdi:floor-lamp
show_state: true
show_last_changed: false
scrolling_effect: false
```

#### 3.2.1 Tile Background — Static Gradient (Binary On/Off State)

The tile background uses a static warm gradient that does NOT vary with brightness, temperature, or any continuous variable. It is a binary state indicator:

**ON state:**
```
Dark mode:  linear-gradient(180deg, rgba(48,40,28,0.95) 0%, rgba(36,33,28,0.93) 100%)
Light mode: linear-gradient(180deg, rgba(255,250,240,0.97) 0%, rgba(255,248,235,0.95) 100%)
```

This is a very subtle warm cast — barely perceptible but enough to differentiate from off-state tiles at a glance from across the room. The gradient goes top-to-bottom only for visual warmth, not to communicate any data.

**OFF state:**
```
Dark mode:  rgba(32,32,34,0.7)
Light mode: rgba(246,246,248,0.95)
```

Cold, neutral, clearly inactive.

**card-mod CSS:**

```yaml
card_mod:
  style: |
    ha-card {
      aspect-ratio: 1 / 1 !important;
      border-radius: 20px !important;
      overflow: hidden !important;
      {% if is_state(config.entity, 'on') %}
      background: linear-gradient(180deg, rgba(48,40,28,0.95) 0%, rgba(36,33,28,0.93) 100%) !important;
      border: 1.5px solid rgba(255,149,0,0.14) !important;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3) !important;
      {% else %}
      background: rgba(32,32,34,0.7) !important;
      border: 1.5px solid rgba(255,255,255,0.04) !important;
      box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important;
      {% endif %}
      transition: border-color 0.15s ease, box-shadow 0.25s ease, background 0.3s ease !important;
    }
```

#### 3.2.2 Tile Border

Three states:

| State | Border |
|-------|--------|
| On (idle) | `1.5px solid rgba(255,149,0,0.14)` dark / `rgba(255,149,0,0.20)` light |
| On (dragging) | `1.5px solid rgba(255,149,0,0.45)` dark / `rgba(255,149,0,0.55)` light |
| Off | `1.5px solid rgba(255,255,255,0.04)` dark / `rgba(0,0,0,0.04)` light |

The drag state border is handled via Bubble Card's built-in active/pressed state CSS, augmented by card-mod. The amber border brightens during drag to give tactile visual feedback that the slider is engaged.

#### 3.2.3 Icon Circle

Centered in the upper portion of the tile.

| Property | ON | OFF |
|----------|-----|-----|
| Size | 50×50px | 50×50px |
| Border radius | 15px | 15px |
| Background | `rgba(255,149,0,0.14)` | `rgba(128,128,128,0.06)` |
| Border | `1px solid rgba(255,149,0,0.18)` | `none` |
| Icon color | `#ff9500` (amber) | `rgba(255,255,255,0.25)` (muted) |
| Icon size | 24px | 24px |
| Opacity | 1.0 | 0.35 |
| Filter (off) | `grayscale(1) opacity(0.7)` | — |
| Transition | `opacity 0.25s ease` | — |

**card-mod CSS target:** `.bubble-icon`

```yaml
    .bubble-icon {
      width: 50px !important;
      height: 50px !important;
      border-radius: 15px !important;
      --mdc-icon-size: 24px;
      {% if is_state(config.entity, 'on') %}
      background: rgba(255,149,0,0.14) !important;
      border: 1px solid rgba(255,149,0,0.18) !important;
      opacity: 1 !important;
      {% else %}
      background: rgba(128,128,128,0.06) !important;
      opacity: 0.35 !important;
      filter: grayscale(1);
      {% endif %}
      transition: opacity 0.25s ease, background 0.25s ease !important;
    }
```

#### 3.2.4 Light Name

Centered below the icon.

| Property | ON | OFF |
|----------|-----|-----|
| Font size | 15px | 15px |
| Font weight | 600 | 600 |
| Color | `var(--primary-text-color)` | `rgba(255,255,255,0.22)` dark / `rgba(0,0,0,0.18)` light |
| Transition | `color 0.25s ease` | — |

**card-mod CSS target:** `.bubble-name`

```yaml
    .bubble-name {
      font-size: 15px !important;
      font-weight: 600 !important;
      {% if not is_state(config.entity, 'on') %}
      color: rgba(255,255,255,0.22) !important;
      {% endif %}
      transition: color 0.25s ease !important;
    }
```

#### 3.2.5 Brightness Percentage Text

Displayed below the name. Shows `{brightness}%` when on, `Off` when off. Hidden during drag (the tooltip takes over).

| Property | ON | OFF |
|----------|-----|-----|
| Font size | 13px | 13px |
| Font weight | 500 | 500 |
| Color | `rgba(255,149,0,0.85)` dark / `#d97b00` light | `rgba(255,255,255,0.12)` dark / `rgba(0,0,0,0.12)` light |
| Font variant | `tabular-nums` (prevents layout shift as digits change) | — |
| Value | `{{ state_attr(config.entity, 'brightness') \| int(0) * 100 / 255 \| round(0) }}%` | `Off` |

**card-mod CSS target:** `.bubble-state` or `.bubble-sub`

```yaml
    .bubble-state {
      font-size: 13px !important;
      font-weight: 500 !important;
      font-variant-numeric: tabular-nums !important;
      {% if is_state(config.entity, 'on') %}
      color: rgba(255,149,0,0.85) !important;
      {% else %}
      color: rgba(255,255,255,0.12) !important;
      {% endif %}
      transition: color 0.25s ease !important;
    }
```

#### 3.2.6 Bottom Fill Bar (Brightness Indicator)

A 4px horizontal bar at the absolute bottom of the tile. Width scales proportionally to brightness (0–100%). Fills left-to-right. This is the visual representation of the continuous brightness value.

| Property | Value |
|----------|-------|
| Height | 4px |
| Position | Absolute bottom, full width of tile |
| Track background | `rgba(255,255,255,0.04)` dark / `rgba(0,0,0,0.04)` light |
| Fill color (normal) | `#e8a000` dark / `#e89400` light |
| Fill color (manual override) | `#ff9500` (brighter amber to signal override) |
| Fill width | `{brightness_pct}%` of tile width |
| Border radius (fill end) | `0 2px 0 0` (rounded right edge only) |
| Transition (idle) | `width 0.3s ease` |
| Transition (dragging) | `width 0.04s linear` (near-instant for responsiveness) |

This is implemented via Bubble Card's built-in slider fill styling. The `button_type: slider` configuration creates a range input overlay on the card. The fill bar position corresponds to the slider value.

**card-mod CSS to style the slider track and fill:**

```yaml
    .bubble-range-fill {
      height: 4px !important;
      bottom: 0 !important;
      top: auto !important;
      border-radius: 0 2px 0 0 !important;
      {% set manual_list = state_attr('sensor.adaptive_lighting_main_living_manual_control', 'manual_control') | default([]) %}
      {% if config.entity in manual_list %}
      background: #ff9500 !important;
      {% else %}
      background: #e8a000 !important;
      {% endif %}
      transition: width 0.3s ease !important;
    }
    .bubble-range-slider {
      height: 4px !important;
      bottom: 0 !important;
      top: auto !important;
      background: rgba(255,255,255,0.04) !important;
    }
```

#### 3.2.7 Manual Control Red Dot

A breathing red dot at the top-right corner of any tile whose entity appears in the `manual_control` attribute list of the zone's adaptive lighting sensor.

| Property | Value |
|----------|-------|
| Size | 8×8px |
| Position | Absolute, top: 8px, right: 8px |
| Color | `#ff3b30` |
| Box shadow | `0 0 6px rgba(255,59,48,0.55)` |
| Animation | `breathe 2.5s ease-in-out infinite` — opacity pulses 1.0 → 0.3 → 1.0, scale pulses 1.0 → 0.8 → 1.0 |
| Visibility | Conditional — only when entity is in manual control list |

**Implementation via sub_button:**

```yaml
sub_button:
  - icon: mdi:circle
    show_background: false
    visibility:
      - condition: template
        value: >-
          {{ config.entity in state_attr('sensor.adaptive_lighting_main_living_manual_control', 'manual_control') | default([]) }}
    card_mod:
      style: |
        .bubble-sub-button-icon {
          color: #ff3b30 !important;
          width: 8px !important;
          height: 8px !important;
          --mdc-icon-size: 8px;
          box-shadow: 0 0 6px rgba(255,59,48,0.55);
          border-radius: 50%;
          animation: breathe 2.5s ease-in-out infinite;
          position: absolute;
          top: 8px;
          right: 8px;
        }
        @keyframes breathe {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(0.8); }
        }
```

#### 3.2.8 Slider Value Pill (Native Bubble Card Drag Indicator)

Bubble Card's `button_type: slider` includes a native value pill that appears during drag interaction — a rounded capsule that follows the user's finger along the slider track, displaying the current brightness percentage. This is Mac's original implementation and should be preserved exactly as Bubble Card renders it, with card-mod refinements for visual consistency only.

**Do NOT replace this with a custom tooltip.** The native pill behavior is superior because it tracks the drag position spatially (moves with the finger), whereas a fixed-position tooltip in the corner forces the user's eyes away from the interaction point. The pill keeps feedback co-located with the gesture.

| Property | Value |
|----------|-------|
| Content | `{brightness}%` (live, updates continuously during drag) |
| Position | Follows the slider thumb horizontally along the drag axis |
| Shape | Rounded capsule / pill |
| Background | Bubble Card default (override only if needed for contrast) |
| Font | Ensure `font-variant-numeric: tabular-nums` to prevent layout jitter as digits change |
| Visibility | Appears on drag start, disappears on drag end |
| Behavior | Native to `button_type: slider` — no custom implementation needed |

**card-mod refinements (style only, not position or behavior):**

```yaml
    /* Style the native slider pill — do NOT reposition it */
    .bubble-range-value,
    .bubble-range-display {
      font-variant-numeric: tabular-nums !important;
      font-weight: 700 !important;
      font-size: 13px !important;
      border-radius: 10px !important;
      min-width: 42px !important;
      text-align: center !important;
    }
```

**Key principle:** The slider pill is part of Bubble Card's built-in interaction model. It has been tested across touch devices, handles edge cases (dragging past tile boundaries, rapid value changes, multi-touch conflicts), and renders at the correct z-index relative to other tile elements. Reimplementing this as a custom element would lose all of that for no UX gain. Style it; don't replace it.

#### 3.2.9 Tile Tap Action

| Gesture | Action |
|---------|--------|
| Horizontal drag | Adjust brightness (built-in `button_type: slider` behavior) |
| Tap | Toggle light on/off |
| Hold | Open more-info dialog (default HA behavior) |

```yaml
tap_action:
  action: toggle
hold_action:
  action: more-info
```

---

## Section 4: Media Row

Three media device tiles in a horizontal row below the light grid. Sonos takes more horizontal space than the other two because it has richer contextual information to display. The row uses an asymmetric grid.

### 4.1 Media Row Layout

```yaml
type: custom:layout-card
layout_type: grid
layout:
  grid-template-columns: 1.4fr 0.8fr 0.8fr
  gap: 6px
  padding: 2px 12px 14px 12px
```

### 4.2 Sonos Tile (Primary Media)

The Sonos tile is wider than the other two. When playing, it shows the artist name and volume percentage below the "Sonos" label. A green activity dot appears at the top-right. Tapping opens the Sonos popup.

| Property | Idle | Playing |
|----------|------|---------|
| Background | `rgba(36,36,38,0.8)` | `rgba(52,199,89,0.10)` |
| Border | `1.5px solid rgba(255,255,255,0.04)` | `1.5px solid rgba(52,199,89,0.15)` |
| Icon background | `rgba(128,128,128,0.08)` | `rgba(52,199,89,0.15)` |
| Icon | `mdi:speaker` | `mdi:speaker` |
| Icon color | `rgba(255,255,255,0.3)` | `#34c759` |
| Name color | `rgba(255,255,255,0.3)` | `var(--primary-text-color)` |
| Subtitle | (none) | `{artist} · {volume}%` |
| Subtitle color | — | `rgba(52,199,89,0.65)` |
| Activity dot | (none) | 7×7px green circle, `top: 7px, right: 7px`, with `box-shadow: 0 0 6px rgba(52,199,89,0.5)` |
| Tap action | Open Sonos popup | Open Sonos popup |

**Configuration:**

```yaml
type: custom:bubble-card
card_type: button
entity: media_player.living_room_credenza
name: Sonos
icon: mdi:speaker
show_state: false
tap_action:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      content: !include popups/living_room_sonos.yaml
      style:
        --popup-border-radius: 24px 24px 0 0
      right_button: Close
sub: >-
  {% if is_state('media_player.living_room_credenza', 'playing') %}
  {{ state_attr('media_player.living_room_credenza', 'media_artist') }} · {{ (state_attr('media_player.living_room_credenza', 'volume_level') * 100) | round(0) }}%
  {% endif %}
```

**card-mod for Sonos tile:**

```yaml
card_mod:
  style: |
    ha-card {
      border-radius: 16px !important;
      {% if is_state('media_player.living_room_credenza', 'playing') or is_state('media_player.living_room_credenza', 'paused') %}
      background: rgba(52,199,89,0.10) !important;
      border: 1.5px solid rgba(52,199,89,0.15) !important;
      {% else %}
      background: rgba(36,36,38,0.8) !important;
      border: 1.5px solid rgba(255,255,255,0.04) !important;
      {% endif %}
      transition: all 0.2s ease !important;
    }
    .bubble-icon {
      width: 36px !important;
      height: 36px !important;
      border-radius: 11px !important;
      --mdc-icon-size: 17px;
      {% if is_state('media_player.living_room_credenza', 'playing') %}
      background: rgba(52,199,89,0.15) !important;
      color: #34c759 !important;
      {% else %}
      background: rgba(128,128,128,0.08) !important;
      color: rgba(255,255,255,0.3) !important;
      {% endif %}
    }
    .bubble-name {
      font-size: 13px !important;
      font-weight: 600 !important;
    }
    .bubble-sub {
      font-size: 11px !important;
      color: rgba(52,199,89,0.65) !important;
    }
```

### 4.3 Apple TV Tile

Simple power toggle. Smaller than Sonos.

| Property | Off | On |
|----------|-----|-----|
| Background | `rgba(36,36,38,0.8)` | `rgba(0,122,255,0.10)` |
| Border | `rgba(255,255,255,0.04)` | `rgba(0,122,255,0.15)` |
| Icon | `mdi:apple` | `mdi:apple` |
| Icon bg | `rgba(128,128,128,0.07)` | `rgba(0,122,255,0.15)` |
| Icon color | `rgba(255,255,255,0.3)` | `#007aff` |
| Layout | Vertical: icon above name |
| Icon size | 32×32px, `border-radius: 10px` |
| Name | 11px, weight 600 |
| Tap action | `toggle` |
| Hold action | `more-info` |

```yaml
type: custom:bubble-card
card_type: button
entity: media_player.living_room_apple_tv
name: Apple TV
icon: mdi:apple
tap_action:
  action: toggle
```

### 4.4 Samsung TV Tile

Identical structure to Apple TV, with purple accent.

| Property | Off | On |
|----------|-----|-----|
| Background | `rgba(36,36,38,0.8)` | `rgba(168,85,247,0.10)` |
| Border | `rgba(255,255,255,0.04)` | `rgba(168,85,247,0.15)` |
| Icon color | `rgba(255,255,255,0.3)` | `#a855f7` |
| Accent | `#a855f7` |

---

## Section 5: Settings Popup (Bottom Sheet)

Opened by tapping the gear icon on the separator. Contains all "secondary" controls that don't need to be on the main card surface. Presented as a bottom sheet via browser-mod.

### 5.1 Popup Container

| Property | Value |
|----------|-------|
| Presentation | Bottom sheet (slides up from bottom) |
| Border radius | `24px 24px 0 0` (top corners only) |
| Background | `rgba(28,28,30,0.98)` dark / `rgba(255,255,255,0.98)` light |
| Backdrop | `rgba(0,0,0,0.50)` with `backdrop-filter: blur(16px) saturate(1.5)` |
| Box shadow | `0 -8px 40px rgba(0,0,0,0.3)` |
| Animation | Slide up with `cubic-bezier(0.16,1,0.3,1)` easing, 0.3s duration |
| Dismiss | Tap backdrop, swipe down, or tap "Close" button |
| Max width | 400px, centered |
| Bottom padding | 40px (safe area for gesture bar on iPhones) |

### 5.2 Handle Bar

| Property | Value |
|----------|-------|
| Width | 36px |
| Height | 4px |
| Border radius | 2px |
| Color | `rgba(255,255,255,0.15)` dark / `rgba(0,0,0,0.12)` light |
| Position | Centered, `padding: 10px 0 4px` |
| Purpose | Visual affordance for swipe-to-dismiss |

### 5.3 Popup Header

| Property | Value |
|----------|-------|
| Title | "Living Room" — 18px, weight 700 |
| Subtitle | "{n} of {total} lights on · {avg_brightness}% avg" — 13px, color `var(--secondary-text-color)` at 0.5 opacity |
| Padding | `8px 24px 0` |

### 5.4 Room Brightness Slider

A full-width slider for controlling all on-state lights simultaneously. Uses `slider-entity-row` or a Bubble Card separator with `button_type: slider` targeting `light.main_living_lights`.

| Property | Value |
|----------|-------|
| Section label | "ROOM BRIGHTNESS" — 11px, weight 600, uppercase, `letter-spacing: 0.05em`, color secondary text |
| Slider height | 44px |
| Slider border radius | 14px |
| Track background | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.05)` light |
| Fill color | `rgba(255,149,0,0.3)` dark / `rgba(255,149,0,0.2)` light |
| Fill border radius | 14px |
| Left label | "All Lights" — 13px, weight 500 |
| Right label | `{brightness}%` — 16px, weight 700, `tabular-nums` |
| Entity | `light.main_living_lights` |
| Padding | `18px 24px 0` |

### 5.5 Quick Action Buttons

All quick actions are full-width rows, stacked vertically with 4px gap. Each is a tappable button with icon, label, and optional right-side status.

#### 5.5.1 All On / All Off Toggle

| Property | Value |
|----------|-------|
| Section label | "CONTROLS" — same style as Room Brightness label |
| Icon | `mdi:lightbulb-group` (lights on) / `mdi:lightbulb-group-off` (all off) |
| Label | "Turn All Off" (when lights on) / "Turn All On" (when all off) |
| Background (lights on) | `rgba(255,149,0,0.10)` dark / `rgba(255,149,0,0.06)` light |
| Background (all off) | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.04)` light |
| Height | 48px |
| Border radius | 14px |
| Icon size | 18px |
| Label font | 14px, weight 500 |
| Tap action | Call `light.toggle` on `light.main_living_lights` |

#### 5.5.2 Reset Manual Overrides

**Conditional:** Only visible when `manual_control` list length > 0.

| Property | Value |
|----------|-------|
| Icon | `mdi:restore` |
| Label | "Reset {n} Manual Override(s)" |
| Right badge | Red count badge showing `{n}` |
| Background | `rgba(255,59,48,0.08)` dark / `rgba(255,59,48,0.05)` light |
| Badge color | `#ff3b30` |
| Height | 48px |
| Border radius | 14px |
| Tap action | Call `switch.turn_off` then `switch.turn_on` on `switch.adaptive_lighting_main_living` (this resets all manual overrides) |

#### 5.5.3 Brighten / Dim (Side by Side)

Two buttons sharing a row, each taking 50% width.

| Property | Brighten | Dim |
|----------|----------|-----|
| Icon | `mdi:weather-sunny` | `mdi:weather-night` |
| Label | "Brighten" | "Dim" |
| Background | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.06)` |
| Height | 48px |
| Border radius | 14px |
| Font | 13px, weight 500 |
| Tap action | Call `light.turn_on` with `brightness_step_pct: 15` on each on-state light | Call `light.turn_on` with `brightness_step_pct: -15` on each on-state light |

#### 5.5.4 Movie Mode

| Property | Value |
|----------|-------|
| Icon | `mdi:movie-open` |
| Label | "Movie Mode" |
| Right status | "On" (purple) / "Off" (muted) |
| Background (active) | `rgba(175,82,222,0.12)` dark / `rgba(175,82,222,0.06)` light |
| Background (inactive) | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.04)` light |
| Active color | `#af52de` |
| Height | 48px |
| Border radius | 14px |
| Tap action | Activate `scene.living_room_movie_mode` or trigger an automation |

---

## Section 6: Sonos Popup (Bottom Sheet — Tabbed)

Opened by tapping the Sonos tile in the media row. This is the richest popup in the system. It uses a tabbed interface with two views: **Controls** (transport, volume, speaker grouping with per-speaker volume) and **Media** (Sonos media browser for song/playlist selection). The tab system keeps the popup height manageable while giving full media control without leaving the dashboard.

### 6.1 Popup Container

Same container styling as Settings Popup (Section 5.1). The popup shell is identical across all popups for visual consistency — only the content cards inside change.

### 6.2 Tab Bar

A horizontal tab strip directly below the handle bar. Two tabs, mutually exclusive. The active tab is indicated by a bottom border accent and text color change.

| Property | Value |
|----------|-------|
| Layout | Flex row, centered, full width, `padding: 0 24px` |
| Tab count | 2: "Controls" and "Media" |
| Tab height | 40px |
| Gap | 0 (tabs share the full width, each `flex: 1`) |
| Divider | 1px bottom border on the full tab bar, `rgba(255,255,255,0.06)` |

**Per-tab styling:**

| State | Text Color | Font | Bottom Border | Background |
|-------|------------|------|---------------|------------|
| Active | `var(--primary-text-color)` | 13px, weight 600 | 2px solid `#34c759` (green accent) | `transparent` |
| Inactive | `rgba(255,255,255,0.3)` dark / `rgba(0,0,0,0.25)` light | 13px, weight 500 | none | `transparent` |

**Implementation:** Use an `input_select` helper or `input_boolean` to track which tab is active. Each tab body is wrapped in a `conditional` card that shows/hides based on the helper state.

```yaml
# Helper entity (create in HA)
input_select:
  living_room_sonos_tab:
    options:
      - controls
      - media
    initial: controls
```

**Tab bar as mushroom-chips-card:**

```yaml
# ─── Tab bar ───
- type: custom:mushroom-chips-card
  alignment: center
  card_mod:
    style: |
      ha-card {
        --chip-spacing: 0 !important;
        padding: 0 24px !important;
        margin: 0 !important;
        background: none !important;
        box-shadow: none !important;
        border-bottom: 1px solid rgba(255,255,255,0.06) !important;
      }
  chips:
    - type: template
      content: Controls
      icon: mdi:tune-variant
      tap_action:
        action: call-service
        service: input_select.select_option
        target:
          entity_id: input_select.living_room_sonos_tab
        data:
          option: controls
      card_mod:
        style: |
          ha-card {
            border-radius: 0 !important;
            flex: 1 !important;
            justify-content: center !important;
            {% if is_state('input_select.living_room_sonos_tab', 'controls') %}
            border-bottom: 2px solid #34c759 !important;
            --chip-font-weight: 600;
            {% else %}
            border-bottom: 2px solid transparent !important;
            opacity: 0.4;
            {% endif %}
            background: none !important;
            --chip-font-size: 13px;
            transition: all 0.2s ease;
          }
    - type: template
      content: Media
      icon: mdi:playlist-music
      tap_action:
        action: call-service
        service: input_select.select_option
        target:
          entity_id: input_select.living_room_sonos_tab
        data:
          option: media
      card_mod:
        style: |
          ha-card {
            border-radius: 0 !important;
            flex: 1 !important;
            justify-content: center !important;
            {% if is_state('input_select.living_room_sonos_tab', 'media') %}
            border-bottom: 2px solid #34c759 !important;
            --chip-font-weight: 600;
            {% else %}
            border-bottom: 2px solid transparent !important;
            opacity: 0.4;
            {% endif %}
            background: none !important;
            --chip-font-size: 13px;
            transition: all 0.2s ease;
          }
```

---

### 6.3 Tab 1: Controls

Visible when `input_select.living_room_sonos_tab` = `controls`. Contains now-playing, transport, primary volume, and speaker section with per-speaker volume sliders.

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: input_select.living_room_sonos_tab
      state: controls
  card:
    type: vertical-stack
    cards:
      # ... all controls tab content below ...
```

#### 6.3.1 Now Playing Row

Horizontal layout: album art on left, track info on right.

| Property | Value |
|----------|-------|
| Layout | Flexbox row, `gap: 16px`, `padding: 14px 24px 16px` |
| Album art size | 80×80px |
| Album art border radius | 18px |
| Album art placeholder | `linear-gradient(135deg, rgba(52,199,89,0.18), rgba(0,122,255,0.12))` dark — shown when `entity_picture` is null |
| Album art source | `{{ state_attr('media_player.living_room_credenza', 'entity_picture') }}` — actual album art when available |
| Album art shadow | `0 4px 16px rgba(0,0,0,0.15)` |
| Track title | `{{ state_attr('media_player.living_room_credenza', 'media_title') }}` — 19px, weight 600 |
| Artist | `{{ state_attr('media_player.living_room_credenza', 'media_artist') }}` — 14px, secondary text color |
| Source badge | Small pill: green 5px dot + source name — 11px, weight 600, `rgba(52,199,89,0.1)` background, `padding: 2px 8px`, `border-radius: 6px` |
| Source entity | `{{ state_attr('media_player.living_room_credenza', 'source') }}` |
| Overflow | Track title and artist truncate with `text-overflow: ellipsis` when too long |

#### 6.3.2 Transport Controls

Centered row of three buttons: Previous, Play/Pause, Next.

| Button | Icon (playing) | Icon (paused) | Size | Background |
|--------|---------------|---------------|------|------------|
| Previous | `mdi:skip-previous` | `mdi:skip-previous` | 38×38px, `border-radius: 12px` | transparent |
| Play/Pause | `mdi:pause` | `mdi:play` | 58×58px, `border-radius: 18px` | `rgba(255,255,255,0.08)` dark / `rgba(0,0,0,0.04)` light |
| Next | `mdi:skip-next` | `mdi:skip-next` | 38×38px, `border-radius: 12px` | transparent |

| Property | Value |
|----------|-------|
| Layout | Flex row, `justify-content: center` |
| Gap | 32px |
| Padding | `0 24px 20px` |
| Prev/Next opacity | 0.4 |
| Play/Pause opacity | 1.0 |
| Tap actions | `media_player.media_previous_track`, `media_player.media_play_pause`, `media_player.media_next_track` |

#### 6.3.3 Primary Volume Slider (Room Speaker)

This is the volume control for the room's primary Sonos speaker. It uses Bubble Card's separator slider pattern, styled with the green Sonos accent.

| Property | Value |
|----------|-------|
| Section label | "VOLUME" — standard section label style |
| Entity | `media_player.living_room_credenza` |
| Slider height | 38px |
| Slider border radius | 12px |
| Track background | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.05)` light |
| Fill color | `rgba(52,199,89,0.35)` dark / `rgba(52,199,89,0.25)` light |
| Left label | "Credenza" — 13px, weight 500 |
| Right label | `{volume}%` — 14px, weight 600, `tabular-nums` |
| Value pill | Native Bubble Card slider pill (same principle as light tiles — do NOT replace with custom tooltip) |
| Padding | `0 24px` |
| Slider type | `button_type: slider` on a Bubble Card separator |

```yaml
    # ─── Primary volume ───
    - type: custom:bubble-card
      card_type: separator
      entity: media_player.living_room_credenza
      name: Credenza
      button_type: slider
      card_mod:
        style: |
          .bubble-range-slider {
            height: 38px !important;
            border-radius: 12px !important;
            background: rgba(255,255,255,0.06) !important;
          }
          .bubble-range-fill {
            height: 100% !important;
            border-radius: 12px !important;
            background: rgba(52,199,89,0.35) !important;
          }
          .bubble-name {
            position: absolute; left: 14px; top: 50%;
            transform: translateY(-50%); z-index: 2;
            font-size: 13px !important; font-weight: 500 !important;
          }
          .bubble-state {
            position: absolute; right: 14px; top: 50%;
            transform: translateY(-50%); z-index: 2;
            font-size: 14px !important; font-weight: 600 !important;
            font-variant-numeric: tabular-nums !important;
          }
```

#### 6.3.4 Speaker Section with Per-Speaker Volume Sliders

**Conditional:** Only rendered when the room has multiple Sonos speakers (controlled by a per-room flag or by checking available speakers).

This is the critical improvement over the previous spec. Each speaker is not just a join/unjoin toggle — it's a **full-width draggable volume slider** with join/unjoin as a secondary action. When a speaker is grouped, its slider is active and controls that speaker's individual volume. When ungrouped, the slider is disabled/muted and tapping it joins the speaker.

**Section label:** "SPEAKERS" — standard section label style, `padding: 14px 24px 6px`

#### Primary Speaker Row (Always Shown, Not a Slider Here — Already Covered by 6.3.3)

The primary speaker (Credenza) already has its volume slider above in 6.3.3. In the speakers section, it appears as a static status row to anchor the group visually.

| Property | Value |
|----------|-------|
| Label | "Credenza" |
| Right status | "Playing" in green |
| Icon | `mdi:speaker` with green color |
| Background | `rgba(52,199,89,0.08)` |
| Border | `1px solid rgba(52,199,89,0.10)` |
| Height | 40px |
| Border radius | 14px |
| Not interactive | This row is informational — volume is controlled via 6.3.3 above |

#### Groupable Speaker Rows (Draggable Volume Sliders)

Each additional speaker (Soundbar, Kitchen, Bathroom) is rendered as a **Bubble Card separator with `button_type: slider`** targeting that speaker's `media_player` entity. The entire row is a drag-to-adjust volume surface. Join/unjoin is handled via a sub-button icon on the left side.

**Two visual states per speaker:**

**GROUPED (active, in the Sonos group):**

| Property | Value |
|----------|-------|
| Card type | `bubble-card` separator, `button_type: slider` |
| Entity | The speaker's `media_player` entity (e.g., `media_player.kitchen`) |
| Slider height | 40px |
| Slider border radius | 12px |
| Track background | `rgba(0,122,255,0.06)` |
| Fill color | `rgba(0,122,255,0.25)` dark / `rgba(0,122,255,0.18)` light |
| Border | `1px solid rgba(0,122,255,0.12)` |
| Left icon | `mdi:speaker` — blue, tappable (tap to unjoin) |
| Name | Speaker name (e.g., "Kitchen") — 13px, weight 500, primary text |
| Right value | `{volume}%` — 13px, weight 600, `tabular-nums`, `#007aff` |
| Drag behavior | Adjusts this speaker's individual volume via `media_player.volume_set` |
| Value pill | Native Bubble Card slider pill during drag |
| Sub-button (left) | `mdi:speaker` icon — tap calls `sonos.unjoin` on this speaker |

```yaml
    # ─── Grouped speaker: Kitchen ───
    - type: conditional
      conditions:
        - condition: template
          value: >-
            {{ 'media_player.kitchen' in
               state_attr('media_player.living_room_credenza', 'group_members')
               | default([]) }}
      card:
        type: custom:bubble-card
        card_type: separator
        entity: media_player.kitchen
        name: Kitchen
        button_type: slider
        sub_button:
          - icon: mdi:speaker
            show_background: false
            tap_action:
              action: call-service
              service: sonos.unjoin
              target:
                entity_id: media_player.kitchen
        card_mod:
          style: |
            :host { padding: 2px 24px !important; }
            .bubble-range-slider {
              height: 40px !important;
              border-radius: 12px !important;
              background: rgba(0,122,255,0.06) !important;
              border: 1px solid rgba(0,122,255,0.12) !important;
            }
            .bubble-range-fill {
              height: 100% !important;
              border-radius: 12px !important;
              background: rgba(0,122,255,0.25) !important;
            }
            .bubble-name {
              position: absolute; left: 42px; top: 50%;
              transform: translateY(-50%); z-index: 2;
              font-size: 13px !important; font-weight: 500 !important;
            }
            .bubble-state {
              position: absolute; right: 14px; top: 50%;
              transform: translateY(-50%); z-index: 2;
              font-size: 13px !important; font-weight: 600 !important;
              font-variant-numeric: tabular-nums !important;
              color: #007aff !important;
            }
            .bubble-sub-button-0 {
              position: absolute; left: 8px; top: 50%;
              transform: translateY(-50%); z-index: 5;
              --mdc-icon-size: 18px;
              color: #007aff !important;
            }
```

**NOT GROUPED (inactive, available to join):**

When a speaker is not in the group, it renders as a static (non-slider) button. The entire row is tappable to join. No drag interaction — there's nothing to control until it's grouped.

| Property | Value |
|----------|-------|
| Card type | `mushroom-template-card` (not a slider — no volume to control) |
| Background | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.04)` light |
| Border | `1px solid rgba(255,255,255,0.04)` |
| Icon | `mdi:speaker-off` at 0.3 opacity |
| Name | Speaker name — 13px, weight 500, secondary text color |
| Right status | "Join" — secondary text color |
| Height | 40px |
| Border radius | 12px |
| Tap action | `sonos.join` with `master: media_player.living_room_credenza` |

```yaml
    # ─── Ungrouped speaker: Kitchen ───
    - type: conditional
      conditions:
        - condition: template
          value: >-
            {{ 'media_player.kitchen' not in
               state_attr('media_player.living_room_credenza', 'group_members')
               | default([]) }}
      card:
        type: custom:mushroom-template-card
        entity: media_player.kitchen
        primary: Kitchen
        secondary: Join
        icon: mdi:speaker-off
        icon_color: grey
        tap_action:
          action: call-service
          service: sonos.join
          target:
            entity_id: media_player.kitchen
          data:
            master: media_player.living_room_credenza
        card_mod:
          style: |
            ha-card {
              border: 1px solid rgba(255,255,255,0.04) !important;
              border-radius: 12px !important;
              margin: 2px 24px !important;
              background: rgba(255,255,255,0.06) !important;
              box-shadow: none !important;
              min-height: 40px !important;
              max-height: 40px !important;
            }
            mushroom-shape-icon {
              --icon-size: 18px;
              --shape-size: 32px;
              opacity: 0.3;
            }
```

**Speaker list for Living Room:**

| Speaker | Entity | Role |
|---------|--------|------|
| Credenza | `media_player.living_room_credenza` | Primary (status row + volume in 6.3.3) |
| Soundbar | `media_player.living_room_soundbar` | Groupable slider |
| Kitchen | `media_player.kitchen` | Groupable slider |
| Bathroom | `media_player.bathroom` | Groupable slider |

Each groupable speaker needs BOTH conditional cards (grouped slider + ungrouped join button). Only one renders at a time based on `group_members` attribute.

---

### 6.4 Tab 2: Media Browser

Visible when `input_select.living_room_sonos_tab` = `media`. This tab embeds a Sonos media browser that allows the user to browse and select music, playlists, radio stations, and favorites without leaving the popup.

```yaml
- type: conditional
  conditions:
    - condition: state
      entity: input_select.living_room_sonos_tab
      state: media
  card:
    type: vertical-stack
    cards:
      # ... media tab content ...
```

#### 6.4.1 Implementation Options (Choose Best Available)

There are three approaches to embedding a media browser inside the popup, listed in order of preference:

**Option A: `mini-media-player` with media browser integration**

The `mini-media-player` card (HACS) has a built-in source selector and media browsing capability. Styled with card-mod to match the popup's visual language.

```yaml
      - type: custom:mini-media-player
        entity: media_player.living_room_credenza
        artwork: full-cover
        hide:
          volume: true       # Volume is on the Controls tab
          controls: true     # Transport is on the Controls tab
          power: true
          name: true
        source: full
        sound_mode: full
        card_mod:
          style: |
            ha-card {
              background: none !important;
              box-shadow: none !important;
              border: none !important;
              padding: 8px 12px !important;
              --mini-media-player-overlay-color: transparent;
            }
            .entity__info__media {
              font-size: 14px !important;
            }
```

**Option B: `sonos-card` (HACS — `custom:sonos-card`)**

A purpose-built Sonos card with full media browsing, queue management, and favorites. This is the most feature-rich option but requires additional HACS installation.

```yaml
      - type: custom:sonos-card
        entityId: media_player.living_room_credenza
        sections:
          - media browser
          - favorites
          - queue
        card_mod:
          style: |
            ha-card {
              background: none !important;
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              padding: 8px 12px !important;
            }
            /* Override sonos-card internals to match popup styling */
            .bento-grid, .bento-container {
              background: none !important;
            }
            .bento-item {
              background: rgba(255,255,255,0.06) !important;
              border-radius: 14px !important;
              border: 1px solid rgba(255,255,255,0.04) !important;
            }
```

**Option C: Native HA Media Browser via `iframe` or `media-browser`**

Home Assistant has a built-in media browser accessible at `/media-browser/media_player.living_room_credenza`. This can be embedded via a `webpage` card, though styling is limited.

```yaml
      - type: iframe
        url: /media-browser/media_player.living_room_credenza
        aspect_ratio: 65%
        card_mod:
          style: |
            ha-card {
              background: none !important;
              box-shadow: none !important;
              border: none !important;
              overflow: hidden !important;
              border-radius: 14px !important;
              margin: 8px 24px !important;
            }
```

**Recommendation:** Option B (`sonos-card`) for the richest experience. Fall back to Option A (`mini-media-player`) if the Sonos card has compatibility issues. Option C is a last resort — the iframe approach has limited style control and feels embedded rather than native.

#### 6.4.2 Media Tab Styling Principles

Regardless of which media browser card is used, the following card-mod overrides ensure visual consistency with the popup:

| Property | Value |
|----------|-------|
| Card background | `transparent` (inherits popup background) |
| Card shadow | `none` |
| Card border | `none` |
| Content padding | `8px 12px` minimum |
| List item background | `rgba(255,255,255,0.06)` dark / `rgba(0,0,0,0.04)` light |
| List item border radius | 14px |
| List item height | ≥44px (touch target) |
| List item spacing | 4px gap |
| Active/selected item | Green accent border or background tint |
| Scrollable area | `overflow-y: auto`, `-webkit-overflow-scrolling: touch` |
| Max content height | Constrain to prevent popup from exceeding ~70vh; scroll within |

#### 6.4.3 Favorites Quick-Access (Optional Enhancement)

If not using the full `sonos-card`, add a favorites row at the top of the Media tab as mushroom-chips:

```yaml
      # ─── Favorites row ───
      - type: custom:mushroom-chips-card
        alignment: start
        card_mod:
          style: |
            ha-card {
              padding: 10px 24px 4px !important;
              background: none !important;
              box-shadow: none !important;
              overflow-x: auto !important;
              flex-wrap: nowrap !important;
            }
        chips:
          - type: template
            content: Jazz
            icon: mdi:music-note
            tap_action:
              action: call-service
              service: media_player.play_media
              target:
                entity_id: media_player.living_room_credenza
              data:
                media_content_type: playlist
                media_content_id: "spotify:playlist:37i9dQZF1DXbITWG1ZJKYt"
            card_mod:
              style: |
                ha-card {
                  background: rgba(52,199,89,0.08) !important;
                  border: 1px solid rgba(52,199,89,0.10) !important;
                  --chip-font-size: 12px;
                  font-weight: 600;
                }
          # Additional favorite chips...
```

---

## Section 7: Global Styles & Animations

### 7.1 Color System

| Token | Dark Mode | Light Mode | Usage |
|-------|-----------|------------|-------|
| Amber accent | `#ff9500` | `#ff9500` | Light icon active, slider fill, manual override fill |
| Amber tint | `rgba(255,149,0,0.14)` | `rgba(255,149,0,0.09)` | Icon backgrounds, subtle fills |
| Green accent | `#34c759` | `#34c759` | Sonos/media active, presence occupied |
| Blue accent | `#007aff` | `#007aff` | Apple TV, Sonos grouping, temp chip |
| Purple accent | `#a855f7` | `#a855f7` | Samsung TV, movie mode |
| Red accent | `#ff3b30` | `#ff3b30` | Manual override dot, reset button, timer chip |
| Amber alarm | `rgba(255,204,0,0.85)` | `#cc8800` | Alarm chip text |

### 7.2 CSS Animations

Inject these globally via `card-mod` theme or per-card:

```css
@keyframes breathe {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.3; transform: scale(0.8); }
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes sheetUp {
  from { transform: translateY(100%); opacity: 0.8; }
  to { transform: translateY(0); opacity: 1; }
}
```

### 7.3 Typography

| Element | Size | Weight | Tracking | Numeric |
|---------|------|--------|----------|---------|
| Room title | 20px | 700 | -0.03em | — |
| Light name | 15px | 600 | normal | — |
| Brightness % | 13px | 500 | normal | `tabular-nums` |
| Chip text | 11px | 600 | normal | `tabular-nums` |
| Timer chip | 11px | 700 | normal | `tabular-nums`, monospace |
| Section label | 11px | 600 | 0.05em | — |
| Popup title | 18px | 700 | normal | — |
| Popup button label | 14px | 500 | normal | — |
| Media subtitle | 11px | 500 | normal | — |

### 7.4 Spacing System

| Context | Value |
|---------|-------|
| Card outer padding | 12px (dashboard padding) |
| Card border radius | 26px (outer container) |
| Tile border radius | 20px (light tiles) |
| Media tile border radius | 16px |
| Chip border radius | 8px |
| Popup button border radius | 14px |
| Icon circle border radius | 15px (light tiles), 11px (media tiles) |
| Gear button border radius | 13px |
| Grid gap (lights) | 8px |
| Grid gap (media) | 6px |
| Separator padding | `18px 16px 10px` |
| Chips row left indent | 58px (46px icon + 12px gap) |
| Popup bottom padding | 40px (safe area) |
| Popup section padding | `18px 24px 0` |

### 7.5 Border System

| Element | Border |
|---------|--------|
| Outer card | `1px solid rgba(255,255,255,0.04)` dark / `rgba(0,0,0,0.04)` light |
| Light tile on | `1.5px solid rgba(255,149,0,0.14)` dark / `rgba(255,149,0,0.20)` light |
| Light tile off | `1.5px solid rgba(255,255,255,0.04)` dark / `rgba(0,0,0,0.04)` light |
| Light tile dragging | `1.5px solid rgba(255,149,0,0.45)` dark / `rgba(255,149,0,0.55)` light |
| Media tile active | `1.5px solid {accent}20` |
| Media tile inactive | `1.5px solid rgba(255,255,255,0.04)` |
| Chips | `1px solid` at low opacity matching chip color |
| Gear button | `1.5px solid rgba(255,255,255,0.06)` |
| Popup speaker rows | `1px solid` at low opacity matching state color |

### 7.6 Shadow System

| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Outer card | `0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.02)` | `0 0.5px 1px rgba(0,0,0,0.03), 0 4px 20px rgba(0,0,0,0.05)` |
| Light tile on | `0 2px 10px rgba(0,0,0,0.3)` | `0 1px 3px rgba(0,0,0,0.03), 0 3px 12px rgba(0,0,0,0.05)` |
| Light tile off | `0 1px 4px rgba(0,0,0,0.15)` | `0 1px 2px rgba(0,0,0,0.02)` |
| Media tile | `0 1px 6px rgba(0,0,0,0.12)` | `0 1px 3px rgba(0,0,0,0.02)` |
| Popup | `0 -8px 40px rgba(0,0,0,0.3)` | `0 -8px 40px rgba(0,0,0,0.15)` |
| Popup backdrop | `blur(16px) saturate(1.5)` | `blur(16px) saturate(1.5)` |

---

## Section 8: Conditional Visibility Summary

| Element | Condition | When Hidden |
|---------|-----------|-------------|
| Chips row | Any chip has data | Entire `mushroom-chips-card` removed from DOM |
| Alarm chip | `sensor.next_alarm` ≠ unavailable/unknown | Chip not rendered |
| Temp chip | `sensor.living_room_temperature` ≠ unavailable | Chip not rendered |
| Presence chip | `binary_sensor.living_room_presence` ≠ unavailable | Chip not rendered |
| Timer chip | `timer.adaptive_lighting_main_living` = active | Chip not rendered |
| Manual red dot | Entity in `manual_control` list | Dot not rendered |
| Sonos subtitle | `media_player.living_room_credenza` = playing/paused | Empty string |
| Sonos activity dot | `media_player.living_room_credenza` = playing | Dot not rendered |
| Reset manual button (popup) | `manual_control` list length > 0 | Button not rendered |
| Speaker grouping (popup) | Room has multiple speakers | Entire section not rendered |
| Music indicator in subtitle | `media_player.living_room_credenza` = playing/paused | " · ♪" not appended |
| Manual count in subtitle | `manual_control` list length > 0 | " · 🔴 {n}" not appended |
| Light tiles | NEVER hidden | All 6 always visible regardless of on/off |

---

## Section 9: Replication Guide

This card design is a template. To create cards for other rooms:

1. **Copy the card structure** and change entity references
2. **Adjust light count** — some rooms may have 3 lights (1×3 grid), 4 lights (2×2), or 8 lights (3×3 with gap)
3. **Adjust media row** — some rooms have no Sonos (remove media row entirely), one Sonos (no speaker grouping section in popup), or different media devices
4. **Adjust chips** — bedroom gets alarm chip, living room gets presence + temp, bathroom might only get temp
5. **Adjust room icon** — `mdi:sofa` (living), `mdi:bed` (bedroom), `mdi:silverware-fork-knife` (dining), `mdi:chef-hat` (kitchen)
6. **Adjust accent colors** — all rooms use amber for lighting, but media accent colors may vary per device type

### Rooms to implement:
- Living Room (this spec — 6 lights, 3 media, multi-speaker Sonos)
- Kitchen (lights TBD, single Sonos)
- Dining Room (lights TBD, no dedicated Sonos)
- Bedroom (lights TBD, single Sonos, alarm chip priority)
- Accents (lights TBD, no media)