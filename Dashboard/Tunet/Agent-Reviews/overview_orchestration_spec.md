# Tunet Suite — Deliberate Interaction-First Orchestration

Date: 2026-03-06
Branch: `claude/dashboard-nav-research-QnOBs`
HEAD: `1161c39`
Status: PROPOSED (requires user lock before implementation)
Method: 4-agent parallel analysis + lead synthesis, interaction-first design

This is the definitive page-by-page specification for the Tunet Suite dashboard.
Every component is placed by answering: "What does the user want to DO when they open this page?"

---

## Design Philosophy

### Placement Hierarchy

1. **CONTROL** — surfaces the user taps to change something. These go first.
2. **NAVIGATE** — surfaces the user taps to go somewhere deeper. These go second.
3. **AMBIENT** — surfaces the user reads without tapping. These go last.

A surface earns width and position through **interaction value**, not because a card happens to exist.

### Sizing Principle

- Chrome strips (mode, brightness, scenes): always **span 4**, card **columns: 'full'**
- Hero content (lighting, rooms): always **span 4** or **span 3** in a companion pair
- Companion content (media, climate, weather): **span 1** beside a hero, or stacked in its own section
- Ambient content (status, chips): positioned after control surfaces

### Responsive Contract

- Phone (1 col): everything stacks. Section order IS the scroll order. This is the primary design target.
- Tablet (2 col): limited pairing. Full-span sections fill row. Companion pairs stack.
- Desktop (3 col): companion pairs still stack (3+1 doesn't fit in 3).
- Wide desktop (4 col): companion 3+1 pairs resolve side-by-side. Full premium layout.

### Global View Policies (All Pages)

```yaml
type: sections
max_columns: 4
dense_section_placement: false
```

Footer on every view:
```yaml
footer:
  max_width: 1400
  card: *tunet_nav_footer    # tunet-nav-card, defined once via YAML anchor
```

---

## Page 1: Overview

### Intent
"I just opened the dashboard. I want to control my lights, see what's going on, or drill into a room."

### Section Map (Ordered by Intent)

| Order | Section Name | Role | Span | Why This Position |
|-------|-------------|------|------|-------------------|
| 1 | Quick Chips | [Support] Ambient glance | 4 | Tiny footprint. Glanceable info (home status, sun, temp) before you act. One row of pills on phone. |
| 2 | Mode Strip | [Hero] Control | 4 | First-touch action: switch system mode. One tap. |
| 3 | Quick Actions | [Hero] Control | 4 | First-touch action: brightness up/down/reset. One tap. |
| 4 | Lighting Hero | [Hero] Control | 4 | Primary interaction surface: per-zone toggle and dim. |
| 5a | Rooms | [Hero] Navigate | 3 | Navigation hub: see all rooms, toggle, hold for popup. |
| 5b | Media | [Companion] | 1 | Now Playing alongside rooms. Pairs at 4-col, stacks below at <4. |
| 6a | Home Status | [Companion] Ambient | 3 | OAL system detail: adaptive/manual/boost/mode. Second-touch. |
| 6b | Environment | [Companion] Ambient | 1 | Climate + weather beside status. Pairs at 4-col, stacks below at <4. |

Popup-card definitions (4x invisible): merged into Section 5a (Rooms) to eliminate wasted section slot.

### Why This Order (Not the Current One)

Current order puts Quick Chips first, then Mode, then Scenes, then Status+Env, then Lighting at position 6.
This buries the lighting hero — the surface you use most — below two ambient sections (Status, Environment) that you READ but rarely TAP.

The new order puts all three CONTROL surfaces (mode, brightness, zones) in positions 2-4, immediately after the one-row ambient glance strip. NAVIGATE (rooms + media) comes next. AMBIENT detail (status + environment) comes last because it's second-touch information.

---

### Section 1: Quick Chips

**Role**: Ambient glance band. Read-only. Tells you the state of the world in one row.

```
View: max_columns 4
Section: column_span 4
Card: tunet-status-card, getGridOptions { columns: 'full' }  [CORRECT TODAY]
```

**Card config**:
- show_header: false
- tile_size: compact
- custom_css: pill-shaped tiles (border-radius: 999px)
- columns: 6
- column_breakpoints: <=640 -> 3, <=960 -> 4, <=1280 -> 5, default -> 6

**Tiles (7)**:

| # | Type | Entity | Label | Accent | Attribute | Format | Behavior |
|---|------|--------|-------|--------|-----------|--------|----------|
| 1 | value | person.mac_connolly | Home | green | -- | state | dot_rules: Home=green, *=red |
| 2 | value | sensor.oal_system_status | Manual | red | active_zonal_overrides | integer | Shows manual override count |
| 3 | value | sun.sun | Sunset | amber | next_setting | time | show_when: above_horizon only |
| 4 | value | sun.sun | Sunrise | amber | next_rising | time | show_when: below_horizon only |
| 5 | value | sensor.dining_room_temperature | Temp | amber | -- | integer | unit: F |
| 6 | value | sensor.0x54ef4410016279b4_humidity | Humidity | blue | -- | integer | unit: % |
| 7 | value | sensor.hero_media_state | Media | green | room | state | show_when: is_playing=true; tap_action: navigate to /media |

**Responsive**: Full width at all viewports. On phone (1 col, ~390px), 3 chips per row = 2-3 rows of pills. On desktop, 6 chips = 1 row.

---

### Section 2: Mode Strip

**Role**: First-touch control. "What mode is my home in? Change it with one tap."

```
View: max_columns 4
Section: column_span 4
Card: tunet-actions-card (mode_strip variant), getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

**Card config**:
- variant: mode_strip
- compact: true
- mode_entity: input_select.oal_active_configuration

**Internal**: Mode strip renders one chip per input_select option. Chips use flex:1 (equal width). Tap cycles option.

**Responsive**: Full width at all viewports. Chip count adapts to input_select options (typically 3-5).

---

### Section 3: Quick Actions

**Role**: First-touch control. "Make it brighter. Make it dimmer. Reset overrides."

```
View: max_columns 4
Section: column_span 4
Card: tunet-scenes-card, getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

**Card config**:
- show_header: false
- compact: true
- allow_wrap: false

**Scenes (3)**:

| # | Entity | Name | Icon | Accent |
|---|--------|------|------|--------|
| 1 | script.oal_global_manual_brighter | Brighter | add | amber |
| 2 | script.oal_global_manual_dimmer | Dimmer | remove | blue |
| 3 | script.oal_reset_soft | Reset | restart_alt | red |

**Responsive**: Full width at all viewports. 3 chips always fit in one row even at 320px.

---

### Section 4: Lighting Hero

**Role**: Primary interaction surface. "Control specific light zones — toggle on/off, drag to dim."

```
View: max_columns 4
Section: column_span 4
Card: tunet-lighting-card, getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

**Card config**:
- name: Lighting
- surface: section
- layout: grid
- expand_groups: false
- show_adaptive_toggle: false (overview is for quick control, not adaptive management)
- tile_size: compact
- columns: 4
- column_breakpoints: <=640 -> 2, <=1024 -> 3, default -> 4
- primary_entity: sensor.oal_system_status

**Zones (6)**:

| # | Entity | Name | Icon |
|---|--------|------|------|
| 1 | light.living_room_lights | Living | lightbulb |
| 2 | light.kitchen_island_lights | Kitchen | kitchen |
| 3 | light.bedroom_primary_lights | Bedroom | bed |
| 4 | light.accent_spots_lights | Spots | highlight |
| 5 | light.recessed_ceiling_lights | Ceiling | light |
| 6 | light.column_lights | Columns | view_column |

**Internal grid**:
- Phone (<=640px): 2 columns x 3 rows — all 6 zones visible without scroll
- Tablet (<=1024px): 3 columns x 2 rows — compact 2-row grid
- Desktop (>1024px): 4 columns x 2 rows (4 + 2) — optimal density

**Interaction**: Tap tile = toggle zone. Horizontal drag = adjust brightness. Info-tile header = more-info.

**Responsive**: Card fills section at all viewports. Internal grid adapts via column_breakpoints.

---

### Section 5a: Rooms

**Role**: Navigation hub. "See all rooms. Toggle a room's lights. Hold for room popup."

```
View: max_columns 4
Section: column_span 3
Card: tunet-rooms-card, getGridOptions { columns: 'full' }  [CORRECT TODAY]
```

**IMPORTANT**: Remove the `layout-card` conditional wrapper. The layout-card has no getGridOptions, causing the card to default to 12/36 = 33% width in this span-3 section. Either:
- Use a single `layout_variant: tiles` and accept tiles at all viewports, OR
- Move the conditional variant logic into the rooms-card itself (config-driven breakpoint), OR
- Add `grid_options: { columns: full }` to the layout-card in YAML (if supported)

**Recommended**: Accept tiles at all viewports for now. Tiles work on mobile (compact capsules with orbs). Row variant requires INT-01 gesture reconciliation before it can be the default.

**Card config**:
- name: Rooms
- layout_variant: tiles

**Rooms (4)**:

| # | Name | Icon | Lights | hold_action |
|---|------|------|--------|-------------|
| 1 | Living Room | weekend | 6 (Couch, Floor, Spots, Credenza, Desk, Columns) | fire-dom-event -> living-room-popup |
| 2 | Kitchen | kitchen | 3 (Pendants, Main, Under-cab) | fire-dom-event -> kitchen-popup |
| 3 | Dining Room | restaurant | 2 (Spots, Columns) | fire-dom-event -> dining-room-popup |
| 4 | Bedroom | bed | 3 (Main, Accent, Table Lamps) | fire-dom-event -> bedroom-popup |

**Interaction** (tiles variant):
- Tap room tile: toggle all room lights
- Hold room tile (>=400ms): open room popup via Browser Mod fire-dom-event
- Per-light orbs: visible state indicators (on/off color)

**Popup-card definitions**: 4x invisible `custom:popup-card` blocks merged into this section as additional cards (see Popup Specifications below).

---

### Section 5b: Media

**Role**: Companion. "What's playing? Quick transport controls."

```
View: max_columns 4
Section: column_span 1
Card: tunet-media-card, getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12, correct by coincidence in span-1]
```

**Card config**:
- entity: media_player.living_room
- name: Now Playing
- coordinator_sensor: sensor.sonos_smart_coordinator
- active_group_sensor: sensor.sonos_active_group_coordinator

**Responsive**:
- At 4-col desktop: sits beside Rooms as 25% companion column (3+1). Compact media card with album art, transport, volume.
- At <4 cols: drops to own row below Rooms (full width). Acceptable — media is secondary.

---

### Section 6a: Home Status

**Role**: Ambient detail. "How is the OAL system doing? Any manual overrides? What mode?"

```
View: max_columns 4
Section: column_span 3
Card: tunet-status-card, getGridOptions { columns: 'full' }  [CORRECT TODAY]
```

**Card config**:
- name: Home Status
- show_header: false
- tile_size: compact
- columns: 5
- column_breakpoints: <=640 -> 3, <=1024 -> 4, default -> 5

**Tiles (5)** — reduced from current 8 by removing duplicates already in Quick Chips or Environment:

| # | Type | Entity | Label | Accent | Key Config | Why Keep |
|---|------|--------|-------|--------|------------|----------|
| 1 | value | sensor.oal_system_status | Adaptive | green | attribute: zones_adaptive, format: integer | Unique: zone count not in chips |
| 2 | value | sensor.oal_system_status | Manual | red | attribute: active_zonal_overrides, aux_action: Reset, show_when: not Adaptive | Unique: aux_action Reset pill. Chips version has no action. |
| 3 | value | sensor.oal_global_brightness_offset | Boost | amber | attribute: total_offset, secondary: current_config | Unique: total offset not in chips |
| 4 | dropdown | input_select.oal_active_configuration | Mode | muted | -- | Unique: explicit dropdown select. Mode strip is one-tap cycle, this is precise pick. |
| 5 | value | sensor.oal_global_brightness_offset | Config | muted | attribute: current_config, format: state | Keep: provides always-visible config name even when dropdown is closed |

**Removed from current 8-tile set**:
- Weather (state text) — redundant with weather-card in Section 6b
- Humidity — duplicate of Quick Chips tile 6
- Inside temp — duplicate of Quick Chips tile 5

**Internal grid**:
- Phone (<=640px): 3 columns. 5 tiles = 2 rows (3+2)
- Tablet (<=1024px): 4 columns. 5 tiles = 2 rows (4+1)
- Desktop (>1024px): 5 columns. 5 tiles = 1 row (optimal)

---

### Section 6b: Environment

**Role**: Ambient companion. "What's the weather? What's the thermostat doing?"

```
View: max_columns 4
Section: column_span 1
Card 1: tunet-climate-card, getGridOptions { columns: 6, min_columns: 3 }  [CORRECT]
Card 2: tunet-weather-card, getGridOptions { columns: 6, min_columns: 3 }  [CORRECT]
```

**Card configs**:
- Climate: entity: climate.dining_room, name: Climate
- Weather: entity: weather.home, forecast_days: 4, forecast_hours: 8, forecast_view: auto, forecast_metric: auto, show_view_toggle: true, show_metric_toggle: true, auto_precip_threshold: 45

**Internal layout**: Both cards return columns: 6. In span-1 section (internal grid 12), each card is 6/12 = 50%. They tile side-by-side.

**Responsive**:
- At 4-col desktop: section is 25% of page. Each card is 50% of that = 12.5% of page. Narrow but functional for climate (just thermostat state) and weather (condensed forecast).
- At 1-col phone: section is full width. Each card is 50%. Climate on left, weather on right. Good density.
- At 2-3 col: section drops to own row below Status. Full width of its row. Cards still 50/50.

---

### Overview Responsive Summary

| Viewport | Cols | Scroll Order (Top to Bottom) |
|----------|------|------------------------------|
| Phone (1) | 1 | Chips -> Mode -> Actions -> Lighting -> Rooms -> Media -> Status -> Environment |
| Tablet (2) | 2 | Chips -> Mode -> Actions -> Lighting -> Rooms -> Media (own row) -> Status -> Environment (own row) |
| Desktop (3) | 3 | Same as tablet (3+1 doesn't pair at 3 cols) |
| Wide (4) | 4 | Chips -> Mode -> Actions -> Lighting -> [Rooms | Media] -> [Status | Environment] |

---

## Page 2: Rooms Directory

### Intent
"I want to see all rooms at once and drill into any one."

```yaml
type: sections
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card |
|-------|---------|------|------|------|
| 1 | Rooms | [Hero] Full-page rooms | 4 | tunet-rooms-card |

### Section 1: Rooms (Full Page)

```
Section: column_span 4
Card: tunet-rooms-card, getGridOptions { columns: 'full' }
```

**Card config**:
- name: Rooms
- layout_variant: tiles (or conditional row/tiles via layout-card, pending INT-01)
- rooms: same config as Overview (YAML anchor *rooms_overview_config)

**Interaction**: Same as Overview rooms section. Tap toggles, hold opens popup.

**Why span 4**: This is the only content on the page. It should fill the view.

---

## Page 3: Media

### Intent
"I want to manage all my speakers and control what's playing."

```yaml
type: sections
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card |
|-------|---------|------|------|------|
| 1 | Speaker Grid | [Hero] All speakers | 4 | tunet-speaker-grid-card |
| 2 | Now Playing | [Hero] Active playback | 4 | tunet-media-card |

### Section 1: Speaker Grid

```
Section: column_span 4
Card: tunet-speaker-grid-card, getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

**Card config**:
- entity: media_player.living_room
- name: Speakers
- coordinator_sensor: sensor.sonos_smart_coordinator
- columns: 4
- tile_size: standard
- show_group_actions: true

**Speakers (5)**:

| # | Entity | Name | Icon |
|---|--------|------|------|
| 1 | media_player.living_room | Living Room | speaker |
| 2 | media_player.dining_room | Dining Room | speaker |
| 3 | media_player.kitchen | Kitchen | speaker |
| 4 | media_player.bath | Bathroom | speaker |
| 5 | media_player.bedroom | Bedroom | speaker |

### Section 2: Now Playing

```
Section: column_span 4
Card: tunet-media-card, getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

Same config as Overview Section 5b but in span-4 gets full width for premium playback surface.

---

## Page 4: Living Room Subview

### Intent
"I'm in the living room. I want detailed control of every light, plus Sonos."

```yaml
type: sections
title: Living Room
path: living-room
subview: true
back_path: /tunet-suite-storage/overview
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card(s) |
|-------|---------|------|------|---------|
| 1a | Room Controls | [Hero] Room actions + lighting | 3 | actions-card + scenes-card + lighting-card |
| 1b | Media | [Companion] Sonos | 1 | media-card |

### Section 1a: Room Controls

```
Section: column_span 3
```

**Card 1: tunet-actions-card**

```
getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

- compact: true
- 3 actions: All On (light.turn_on, 6 entities), All Off (light.turn_off, 6 entities), Reset (script.oal_reset_soft)

**Card 2: tunet-scenes-card**

```
getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

- show_header: false, compact: true
- 3 scenes: Brighter, Dimmer, Reset

**Card 3: tunet-lighting-card**

```
getGridOptions { columns: 'full' }  [NEEDS FIX: currently 12]
```

- name: Living Room
- surface: section, layout: grid
- expand_groups: false, show_adaptive_toggle: true
- tile_size: compact
- columns: 3
- column_breakpoints: <=640 -> 2, default -> 3

**Zones (6)**: Couch (table_lamp), Floor (floor_lamp), Spots (highlight), Credenza (light), Desk (desk), Columns (view_column)

**Internal grid**:
- Phone: 2 columns x 3 rows
- Tablet+: 3 columns x 2 rows

### Section 1b: Media

```
Section: column_span 1
Card: tunet-media-card, getGridOptions { columns: 'full' }
```

- entity: media_player.living_room, name: Sonos

**Responsive**: At 4-col, sits beside controls. At <4-col, drops below.

---

## Page 5: Kitchen Subview

### Intent
"I'm in the kitchen. I want to control the 3 kitchen lights."

```yaml
type: sections
title: Kitchen
path: kitchen
subview: true
back_path: /tunet-suite-storage/overview
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card(s) |
|-------|---------|------|------|---------|
| 1a | Kitchen Lights | [Hero] Individual light control | 3 | 3x tunet-light-tile (horizontal) |
| 1b | Media | [Companion] Kitchen speaker | 1 | media-card |

### Section 1a: Kitchen Lights

```
Section: column_span 3
```

**Cards: 3x tunet-light-tile (variant: horizontal)**

```
Each card: getGridOptions { columns: 'full' }  [NEEDS FIX: currently columns: 3]
```

Note: `variant: horizontal` renders as a full-width card with icon on left, slider on right. It MUST fill the section width. The current `columns: 3` makes horizontal tiles 3/36 = 8.3% wide in span-3 — completely broken. The getGridOptions should return `columns: 'full'` when variant is 'horizontal', and `columns: 3` when variant is default (square tile).

**Tiles**:

| # | Entity | Name |
|---|--------|------|
| 1 | light.kitchen_island_pendants | Pendants |
| 2 | light.kitchen_main_lights | Main |
| 3 | light.kitchen_counter_cabinet_underlights | Under-cab |

**Interaction**: Tap tile = toggle light. Drag slider = adjust brightness.

### Section 1b: Media (NEW — currently missing)

```
Section: column_span 1
Card: tunet-media-card, getGridOptions { columns: 'full' }
```

- entity: media_player.kitchen, name: Kitchen Speaker

**Why add**: media_player.kitchen exists. A kitchen subview without its speaker is incomplete.

---

## Page 6: Dining Room Subview

### Intent
"I'm in the dining room. I want to control lights and the thermostat."

```yaml
type: sections
title: Dining Room
path: dining-room
subview: true
back_path: /tunet-suite-storage/overview
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card(s) |
|-------|---------|------|------|---------|
| 1a | Dining Lights | [Hero] Light control | 3 | 2x tunet-light-tile (horizontal) |
| 1b | Climate + Media | [Companion] Thermostat + speaker | 1 | climate-card + media-card |

### Section 1a: Dining Lights

```
Section: column_span 3
```

**Cards: 2x tunet-light-tile (variant: horizontal)**

```
Each card: getGridOptions { columns: 'full' }  [NEEDS FIX: currently columns: 3]
```

| # | Entity | Name |
|---|--------|------|
| 1 | light.dining_room_spot_lights | Spots |
| 2 | light.dining_column_strip_light_matter | Columns |

### Section 1b: Climate + Media

```
Section: column_span 1
Card 1: tunet-climate-card, getGridOptions { columns: 6 }  [CORRECT in span-1]
Card 2: tunet-media-card, getGridOptions { columns: 'full' }
```

- Climate: entity: climate.dining_room (currently in span-4 section; move to span-1 companion)
- Media (NEW): entity: media_player.dining_room, name: Dining Speaker

**Why restructure**: Currently dining room has lights + climate all in one span-4 section. Splitting to 3+1 gives climate its own companion column and adds the missing media card. At phone (1 col), everything stacks — same UX. At desktop, climate/media sit beside lights.

---

## Page 7: Bedroom Subview

### Intent
"I'm in the bedroom. Control lights, check next alarm, see speaker status."

```yaml
type: sections
title: Bedroom
path: bedroom
subview: true
back_path: /tunet-suite-storage/overview
max_columns: 4
dense_section_placement: false
```

### Section Map

| Order | Section | Role | Span | Card(s) |
|-------|---------|------|------|---------|
| 1a | Bedroom Lights | [Hero] Light control | 3 | 3x tunet-light-tile (horizontal) |
| 1b | Status + Media | [Companion] Alarm + speaker | 1 | status-card (alarm tile) + media-card |

### Section 1a: Bedroom Lights

```
Section: column_span 3
```

**Cards: 3x tunet-light-tile (variant: horizontal)**

```
Each card: getGridOptions { columns: 'full' }  [NEEDS FIX: currently columns: 3]
```

| # | Entity | Name |
|---|--------|------|
| 1 | light.bedroom_primary_lights | Main |
| 2 | light.master_bedroom_corner_accent_govee | Accent |
| 3 | light.master_bedroom_table_lamps | Table Lamps |

### Section 1b: Status + Media

```
Section: column_span 1
Card 1: tunet-status-card (1 tile), getGridOptions { columns: 'full' }  [CORRECT]
Card 2: tunet-media-card, getGridOptions { columns: 'full' }
```

**Status tile**:
- type: value, entity: sensor.sonos_alarm_bedroom_display, label: Next Alarm, icon: alarm, accent: blue, format: state, tap_action: more-info

**Media** (NEW): entity: media_player.bedroom, name: Bedroom Speaker

**Why restructure**: Currently bedroom has lights + alarm all in span-4. Splitting to 3+1 gives alarm its own companion column and adds the missing media card.

---

## Popup Specifications

All popups use `custom:popup-card` with `popup_card_all_views: true`, triggered by room tile `hold_action: fire-dom-event` with `browser_mod.popup`.

### Popup Template (All Rooms)

Each room popup contains:
1. **tunet-actions-card** (compact) — Room actions: "Open Room" navigate + room-specific All On/All Off + Reset (conditional)
2. **tunet-lighting-card** — Room-scoped zones with adaptive toggle and manual reset

### Living Room Popup

**Actions (6)**:

| # | Name | Icon | Accent | Action |
|---|------|------|--------|--------|
| 1 | Room | open_in_new | muted | navigate to /tunet-suite-storage/living-room |
| 2 | Brighter | add | amber | script.oal_global_manual_brighter |
| 3 | Dimmer | remove | blue | script.oal_global_manual_dimmer |
| 4 | All On | lightbulb | amber | light.turn_on (6 entities) |
| 5 | All Off | power_settings_new | amber | light.turn_off (6 entities) |
| 6 | Reset | restart_alt | red | script.oal_reset_soft (show_when: overrides > 0) |

**Lighting card**: 6 zones (Couch, Floor, Spots, Credenza, Desk, Columns), columns: 3, compact, show_adaptive_toggle: true, show_manual_reset: true

### Kitchen Popup [NEEDS: Actions strip currently missing]

**Actions (3)** — ADD:

| # | Name | Icon | Accent | Action |
|---|------|------|--------|--------|
| 1 | Room | open_in_new | muted | navigate to /tunet-suite-storage/kitchen |
| 2 | All On | lightbulb | amber | light.turn_on (3 entities) |
| 3 | All Off | power_settings_new | amber | light.turn_off (3 entities) |

**Lighting card**: 3 zones (Pendants, Main, Under-cab), columns: 3, compact, show_adaptive_toggle: true, show_manual_reset: true

### Dining Room Popup [NEEDS: Actions strip currently missing]

**Actions (3)** — ADD:

| # | Name | Icon | Accent | Action |
|---|------|------|--------|--------|
| 1 | Room | open_in_new | muted | navigate to /tunet-suite-storage/dining-room |
| 2 | All On | lightbulb | amber | light.turn_on (2 entities) |
| 3 | All Off | power_settings_new | amber | light.turn_off (2 entities) |

**Lighting card**: 2 zones (Spots, Columns), columns: 3, compact, show_adaptive_toggle: true, show_manual_reset: true

### Bedroom Popup [NEEDS: Actions strip currently missing]

**Actions (3)** — ADD:

| # | Name | Icon | Accent | Action |
|---|------|------|--------|--------|
| 1 | Room | open_in_new | muted | navigate to /tunet-suite-storage/bedroom |
| 2 | All On | lightbulb | amber | light.turn_on (3 entities) |
| 3 | All Off | power_settings_new | amber | light.turn_off (3 entities) |

**Lighting card**: 3 zones (Main, Accent, Table Lamps), columns: 3, compact, show_adaptive_toggle: true, show_manual_reset: true

---

## getGridOptions Master Correction Table

Every card that needs its getGridOptions changed to match the intent specified above:

| Card | File | Line | Current | Target | Reason |
|------|------|------|---------|--------|--------|
| tunet-actions-card | tunet_actions_card.js | 382 | columns: 12 | columns: 'full' | Chrome strip must fill section at any span |
| tunet-scenes-card | tunet_scenes_card.js | 429 | columns: 12 | columns: 'full' | Chrome strip must fill section at any span |
| tunet-lighting-card | tunet_lighting_card.js | 944 | columns: 12 | columns: 'full' | Hero content must fill section at any span |
| tunet-media-card | tunet_media_card.js | 627 | columns: 12 | columns: 'full' | Defensive: correct in span-1 but breaks if moved |
| tunet-speaker-grid-card | tunet_speaker_grid_card.js | 637 | columns: 12 | columns: 'full' | Hero content on Media page (span-4) |
| tunet-light-tile (horizontal) | tunet_light_tile.js | 426 | columns: 3 | columns: 'full' (when variant=horizontal) | Horizontal tiles must fill section; square tiles keep columns: 3 |
| tunet-sensor-card | tunet_sensor_card.js | 524 | columns: 12 | columns: 'full' | Defensive: not deployed but would break in multi-span |
| tunet-sonos-card | tunet_sonos_card.js | 707 | columns: 12 | columns: 'full' | Defensive: not deployed but would break in multi-span |

**Cards that are CORRECT and need no change**:

| Card | columns | Why Correct |
|------|---------|-------------|
| tunet-status-card | 'full' | Already fills any section |
| tunet-rooms-card | 'full' | Already fills any section |
| tunet-nav-card | 'full' | In footer context (irrelevant) |
| tunet-climate-card | 6 | Designed for 50/50 pairing in span-1 |
| tunet-weather-card | 6 | Designed for 50/50 pairing in span-1 |
| tunet-light-tile (default variant) | 3 | Square tiles: 4 per row in span-1 |

---

## YAML Structural Changes

### Overview: Section Reorder + Popup Merge

| Change | Current | Target |
|--------|---------|--------|
| Move Lighting from position 6 to position 4 | After Status+Env | After Quick Actions (3rd control surface) |
| Move Rooms+Media from position 7-8 to position 5 | After Lighting | After Lighting (navigate before ambient) |
| Move Status+Env from position 4-5 to position 6 | Before Lighting | After Rooms+Media (ambient last) |
| Merge S9 popup defs into Rooms section | Dedicated span-1 section | Cards inside Rooms section |
| Remove layout-card wrapper from S7 | layout-card -> conditional -> rooms-card | rooms-card directly (tiles variant) |

### Subviews: Restructure to 3+1 Companions

| Subview | Current | Target |
|---------|---------|--------|
| Kitchen | span-4 (lights only) | span-3 (lights) + span-1 (media) |
| Dining | span-4 (lights + climate) | span-3 (lights) + span-1 (climate + media) |
| Bedroom | span-4 (lights + alarm) | span-3 (lights) + span-1 (alarm + media) |
| Living | Already 3+1 (lights + media) | No structural change |

---

## Unresolved Decision: Room Gesture Contract (INT-01)

This spec does NOT resolve the row vs tile gesture inversion. It specifies `layout_variant: tiles` for Overview as the safe default. The full gesture reconciliation requires a user decision:

**Option A**: Uniform contract — both variants tap=toggle, hold=popup (matches plan.md)
**Option B**: Variant-specific — tiles tap=toggle/hold=popup; row body-tap=popup, orbs=toggle (matches code + user latest intent)

Until this is resolved, the Overview uses tiles-only (no layout-card conditional wrapper).

---

## Implementation Sequence

| Order | Scope | Files | Depends On |
|-------|-------|-------|------------|
| 1 | getGridOptions fixes (8 cards) | 8x JS files (single line each) | Nothing |
| 2 | Overview section reorder + popup merge + layout-card removal | tunet-suite-storage-config.yaml | Step 1 (cards must fill sections before reorder) |
| 3 | Subview restructure (Kitchen, Dining, Bedroom to 3+1) | tunet-suite-storage-config.yaml | Step 1 |
| 4 | Popup content parity (add actions strips to 3 rooms) | tunet-suite-storage-config.yaml | Step 2 |
| 5 | Status tile deduplication (8 -> 5 tiles) | tunet-suite-storage-config.yaml | Step 2 |
| 6 | Deployed feature validation pass | No code changes | Steps 1-5 |
| 7 | Row/tile gesture reconciliation (INT-01) | tunet_rooms_card.js + plan.md + storage config | User decision |
| 8 | Touch target remediation (orbs, chips) | tunet_rooms_card.js + tunet_scenes_card.js | INT-01 |
