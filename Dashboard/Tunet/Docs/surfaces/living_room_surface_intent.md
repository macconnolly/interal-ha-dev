# Surface 1: Living Room Page — Intent Document

**Tranche**: was 1A (surface-driven order); now deferred to CD12 (consistency-driver order)  
**Status**: DRAFT REFERENCE ONLY — not an active implementation driver until CD12 surface assembly. This document will be rewritten from scratch when CD12 begins.  
**Branch**: main @ aae417f  
**Date**: 2026-04-02  
**Surface leadership**: `tunet-suite-storage` leads UX evaluation; `tunet-suite-config.yaml` leads architecture truth.

---

## Page Intent

One-touch room lighting control. Climate and media as companions.

The user should be able to control every light in the living room — on/off, brightness, adaptive toggle — without navigating elsewhere. Climate and media provide ambient room context without competing for the lighting hero.

---

## Scan Order

What the user sees first → secondary → on-demand:

### Phone (390×844 — single column, everything stacks)
1. **Actions strip** — instant one-tap: All On, All Off, Brighter, Dimmer, Reset
2. **Lighting card** — 6 zone tiles with brightness bars (2-col at phone width)
3. **Climate card** — thermostat controls for the living space
4. **Media card** — Sonos now playing + transport
5. **Nav footer** — persistent navigation chrome

### Tablet / Desktop (768+ — hero beside companion when room allows)
1. **Actions strip** (top of hero section) — quick actions always visible
2. **Lighting card** (hero section body) — dominant interaction surface, 3-col tiles
3. **Climate card** (companion section, top) — glanceable thermostat
4. **Media card** (companion section, bottom) — now playing context
5. **Nav footer** — persistent below content

---

## Target Card Set

Derived from the v3 card suite, validated against page intent. 5 cards total.

| Card | Role | Entity / Config | Why |
|------|------|----------------|-----|
| `tunet-actions-card` | SUPPORT | All On, All Off, Brighter, Dimmer, Reset | Quick one-tap room control; consolidated from current actions + scenes |
| `tunet-lighting-card` | HERO | 6 zones: Couch, Floor, Spots, Credenza, Desk, Columns | Primary interaction surface — the reason this page exists |
| `tunet-climate-card` | COMPANION | `climate.dining_room`, variant: `thin` | Plan says "climate as companion"; gold standard card; currently missing |
| `tunet-media-card` | COMPANION | `media_player.living_room` | Room media context + transport controls |
| `tunet-nav-card` | NAVIGATION | footer.card placement | Persistent chrome, not content |

### Changes from current live config

| Change | Rationale |
|--------|-----------|
| **ADD** `tunet-climate-card` | Plan explicitly states "climate and media/context as companions." Currently missing from the Living Room page. |
| **REMOVE** `tunet-scenes-card` | Current scenes (Brighter, Dimmer, Reset) are script calls, not actual HA scene activations. Merge into the actions card as additional chips. Eliminates duplicate Reset chip. |
| **MOVE** `tunet-nav-card` to `footer.card` | Nav is dashboard chrome, not content. HA 2026.3 footer.card is the correct placement (per sections_layout_matrix.md). Needs validation on subviews. |
| **RESTRUCTURE** sections | From 1 undifferentiated section to 2 role-tagged sections (hero + companion). |

### Cards NOT included (with rationale)

| Card | Why excluded |
|------|-------------|
| `tunet-scenes-card` | Merged into actions (see above) |
| `tunet-rooms-card` | This IS a room page — room navigation belongs on overview |
| `tunet-status-card` | G3S bugfix-only lock; OAL status is overview-level |
| `tunet-weather-card` | Outdoor weather is overview context, not room context |
| `tunet-sensor-card` | Climate card already shows temperature; would be redundant |
| `tunet-speaker-grid-card` | Speaker management is media page scope |
| `tunet-sonos-card` | Redundant with tunet-media-card |
| `tunet-light-tile` | Lighting card provides per-zone tiles internally |

---

## Section Composition

### Page-level settings

```yaml
type: sections
title: Living Room
path: living-room
icon: mdi:sofa
subview: true
back_path: /tunet-suite-storage/overview
max_columns: 4
dense_section_placement: false
```

### Section 1 — HERO (lighting control)

```yaml
- type: grid
  column_span: 3
  cards:
    - type: custom:tunet-actions-card
      compact: true
      actions:
        - name: All On
          icon: lightbulb
          accent: amber
          service: light.turn_on
          service_data:
            entity_id:
              - light.living_room_couch_lamp
              - light.living_room_floor_lamp
              - light.living_room_spot_lights
              - light.living_room_credenza_light
              - light.office_desk_lamp
              - light.column_lights
        - name: All Off
          icon: power_settings_new
          accent: amber
          service: light.turn_off
          service_data:
            entity_id:
              - light.living_room_couch_lamp
              - light.living_room_floor_lamp
              - light.living_room_spot_lights
              - light.living_room_credenza_light
              - light.office_desk_lamp
              - light.column_lights
        - name: Brighter
          icon: add
          accent: amber
          service: script.turn_on
          service_data:
            entity_id: script.oal_global_manual_brighter
        - name: Dimmer
          icon: remove
          accent: blue
          service: script.turn_on
          service_data:
            entity_id: script.oal_global_manual_dimmer
        - name: Reset
          icon: restart_alt
          accent: red
          service: script.turn_on
          service_data:
            entity_id: script.oal_reset_soft
          show_when:
            entity: sensor.oal_system_status
            attribute: active_zonal_overrides
            operator: gt
            state: 0
      grid_options:
        columns: 12
        rows: auto
    - type: custom:tunet-lighting-card
      name: Living Room
      surface: tile
      layout: grid
      expand_groups: false
      show_adaptive_toggle: true
      tile_size: compact
      columns: 3
      column_breakpoints:
        - max_width: 640
          columns: 2
        - columns: 3
      zones:
        - entity: light.living_room_couch_lamp
          name: Couch
          icon: table_lamp
        - entity: light.living_room_floor_lamp
          name: Floor
          icon: floor_lamp
        - entity: light.living_room_spot_lights
          name: Spots
          icon: highlight
        - entity: light.living_room_credenza_light
          name: Credenza
          icon: light
        - entity: light.office_desk_lamp
          name: Desk
          icon: desk
        - entity: light.column_lights
          name: Columns
          icon: view_column
      show_manual_reset: true
      adaptive_entities:
        - switch.adaptive_lighting_main_living
        - switch.adaptive_lighting_accent_spots
        - switch.adaptive_lighting_column_lights
      grid_options:
        columns: 12
        min_columns: 6
        rows: auto
```

### Section 2 — COMPANION (context)

```yaml
- type: grid
  column_span: 1
  cards:
    - type: custom:tunet-climate-card
      entity: climate.dining_room
      name: Climate
      variant: thin
      grid_options:
        columns: 12
        rows: auto
    - type: custom:tunet-media-card
      entity: media_player.living_room
      name: Sonos
      coordinator_sensor: sensor.sonos_smart_coordinator
      active_group_sensor: sensor.sonos_active_group_coordinator
      grid_options:
        columns: 12
        rows: auto
```

### Footer

```yaml
footer:
  card:
    type: custom:tunet-nav-card
    home_path: /tunet-suite-storage/overview
    rooms_path: /tunet-suite-storage/rooms
    media_path: /tunet-suite-storage/media
    subview_paths:
      - /tunet-suite-storage/living-room
      - /tunet-suite-storage/kitchen
      - /tunet-suite-storage/dining-room
      - /tunet-suite-storage/bedroom
    desktop_breakpoint: 1024
    show_settings: false
```

---

## Interaction Contract (this surface)

| Card | Element | Gesture | Action |
|------|---------|---------|--------|
| actions | chip buttons | tap | call service (light.turn_on/off, script.turn_on) |
| lighting | light tiles | tap | toggle individual light |
| lighting | brightness bar | drag | set brightness level |
| lighting | adaptive toggle | tap | toggle adaptive lighting switch |
| climate | temp +/- buttons | tap | adjust target temperature |
| climate | mode selector | tap | change HVAC mode |
| climate | card body | tap | more-info dialog (native HA) |
| media | transport controls | tap | play / pause / skip |
| media | volume slider | drag | set volume |
| media | card body | tap | navigate to `/tunet-suite-storage/media` |
| nav | pill buttons | tap | navigate to target view |

No hold actions required on this surface. All interactions are one-tap or drag.

---

## Breakpoint Behavior (predicted — must validate live)

| Breakpoint | Page Cols | Hero (span:3) | Companion (span:1) | Layout |
|---|---|---|---|---|
| 390×844 | 1 | clamped to 1 (full) | wraps, full width | Vertical stack |
| 768×1024 | 2 | clamped to 2 (full row) | wraps to next row, 1 col (~384px) | Hero full, companion below half-width |
| 1024×1366 | 3 | 3 cols (full row) | wraps to next row, 1 col (~341px) | Hero full, companion below narrow |
| 1440×900 | 4 | 3 cols | 1 col | Side by side: 75/25 |

---

## Uncertainties (must validate in live tuning — 1C/1D scope)

1. **Section internal grid**: Is it always 12 cols, or 12 × column_span? Affects how card grid_options resolve. Must validate live.
2. **Footer.card on subviews**: Does `footer.card` work correctly on subview pages? Needs testing.
3. **Climate card at ~320px companion width**: Is the `thin` variant readable at narrow companion width? Climate card has ResizeObserver and should adapt, but must verify.
4. **Companion wrapping at 2-3 col views**: Is half-width companion acceptable, or should companion also be full-width? Validate with screenshots.
5. **Actions card chip count**: 5 chips (All On, All Off, Brighter, Dimmer, Reset) — does the actions card wrap or scroll at phone width?

---

## Profile System Status (relevant to 1B)

| Card | Has profile system? | Has ResizeObserver? | Notes |
|------|---|---|---|
| tunet-actions-card | No | No | Needs basic sizing awareness for section context |
| tunet-lighting-card | Yes (selectProfileSize + resolveSizeProfile) | Yes | Already profile-aware; tune within existing framework |
| tunet-climate-card | No | Yes | Has responsive width detection but no profile consumption |
| tunet-media-card | No | No | Needs basic sizing awareness for companion context |
| tunet-nav-card | No | No | Chrome — sizing is position-based, not profile-based |

Per plan 1B: "Sizing: touched cards stay on legacy profile code." Cards without profiles get hand-tuned CSS (em-based) for this surface's breakpoints. The shared sizing helper is introduced in Tranche 2.

---

## Validation Criteria (for 1D)

- [ ] Page loads with all 5 cards rendered, zero console errors
- [ ] Actions strip shows 5 chips: All On, All Off, Brighter, Dimmer, Reset
- [ ] Lighting card shows 6 zone tiles with brightness control
- [ ] Climate card shows thermostat for climate.dining_room
- [ ] Media card shows Sonos now playing (when active)
- [ ] Nav footer provides navigation back to overview and to other rooms
- [ ] At 390×844: all cards stack full-width, scan order correct
- [ ] At 768×1024: hero dominant, companion readable
- [ ] At 1024×1366: hero full row, companion below
- [ ] At 1440×900: hero (75%) beside companion (25%)
- [ ] Tap All On → all 6 lights turn on
- [ ] Tap individual light tile → toggles that light
- [ ] Drag brightness bar → adjusts brightness
- [ ] Media transport controls work
- [ ] Nav footer navigates correctly
- [ ] Back button returns to overview
