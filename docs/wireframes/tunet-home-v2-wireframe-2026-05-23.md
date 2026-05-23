# Tunet Home v2 — Wireframe + Interaction Spec

**Status**: DESIGN DOCUMENT. Not implementation.
**Created**: 2026-05-23 after Mac directed: "Do not build the dashboard. Build the outline."
**Authority**: this doc takes precedence over any prior dashboard YAML built in this session (`/tunet-home-v2/home` exists as a side-effect of earlier iteration but is NOT canonical).

---

## How to read this document

Each section presents:
1. **Question** — the design decision Mac needs to make
2. **Options** — 2-4 concrete alternatives with tradeoffs
3. **Mac's pick** — empty for Mac to fill in
4. **Notes** — anything else worth knowing

When all picks are made, this doc becomes the build spec.

---

## §0 — What problem this dashboard solves

Mac uses Home Assistant on his iPhone, iPad, and laptop. Daily friction the current `/tunet-overview` doesn't solve well:

- **Scene access is buried**. The actually-used scenes (Adaptive, dim-with-kitchen-and-entry-off, full-dim) require navigating to the mode dropdown each time.
- **Room state isn't honest**. Rooms tile shows "Off · 67°F" when LR lights are definitely on (verified live 2026-05-23). The tile variant doesn't accurately reflect room state.
- **No graphable HVAC tracking**. No way to see heating/cooling time today.
- **Light counts per room** are noise — Mac said "I don't care."
- **TV mode is broken** — notifications fire without debounce. Out of scope for THIS dashboard but flagged.

**Goal**: a dashboard where the 2-3 scenes Mac actually toggles between are immediate, the room state is accurate, and the few graphable sensors that matter (HVAC, environment) are surfaced.

---

## §1 — Scene Model (THIS IS THE LOAD-BEARING DECISION)

Mac said: "I think that was much more important would be a set of scenes that are a little bit more helpful like a brighter one for most of the time 1 that's a little bit dimmer where we turn off the overhead lights in the kitchen and the entryway main lights and maybe reduce the kitchen island pendants a little bit and same with the bedroom. Like there's really only two or three modes that I care about."

### Q1.1 — How many scenes in the cycle?

**Option A (2 modes — minimal):**
- `Adaptive` (full brightness daily)
- `Evening` (NEW name; replaces "Dim Ambient Plus" — kitchen mains OFF, entry main OFF, pendants reduced, bedroom reduced)

**Option B (3 modes — slight expansion):**
- `Adaptive` (default)
- `Evening` (kitchen + entry off, others dimmed)
- `Late Night` (everything significantly dimmer, near-dark)

**Option C (3 modes including TV):**
- `Adaptive`
- `Evening`
- `TV Mode` (fix the debouncing bug as part of this rebuild)

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ Other: _______

**Notes**: ZEN32 B5 2x already cycles. Other modes (Full Bright, Warm Ambient, TV, TV Bridge, Sleep, Manual) stay available via dashboard / voice / HomeKit but NOT in the B5 cycle.

---

### Q1.2 — "Evening" mode exact per-zone behavior

Mac's wording: "turn off the overhead lights in the kitchen and the entryway main lights and maybe reduce the kitchen island pendants a little bit and same with the bedroom."

**Option A (verbose explicit):**

| Zone | State |
|------|-------|
| `light.main_living_lights` | dim to 40% |
| `light.kitchen_main_lights` | **OFF** |
| `light.entryway_lamp` | **OFF** |
| `light.kitchen_island_pendants` | reduce to 20% (was 30%) |
| `light.kitchen_counter_cabinet_underlights` | reduce to 8% |
| `light.bedroom_primary_lights` | reduce to 25% |
| `light.accent_spots_lights` | dim to 20% |
| `light.column_lights` | dim to 30% |
| `light.recessed_ceiling_lights` | dim to 1% (safety glow) |
| `light.office_lights` | dim to 30% |

**Option B (terser — match existing Dim Ambient deltas):**

Use Dim Ambient (b: -30, k: -500) as baseline, ADD:
- `lights_off`: kitchen_main_lights, entryway_lamp
- `lights_dimmed override`: kitchen_island_pendants 20, bedroom_primary 25

**Option C (different bed: "and same with the bedroom" → also bedroom mains off?):**
Like Option A but also `light.bedroom_primary_lights` → OFF (not dimmed). Closer to "going to bed" mode.

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ Custom (specify per-zone): _______

**Notes**: This refines or replaces the "Dim Ambient Plus" mode I already created. Could be renamed "Evening" or "Dim+" for short — Mac picks the name.

---

### Q1.3 — Scene presentation on the dashboard

**Option A — Strip of chips (visible always):**
```
[ Adaptive ] [ Evening ] [ TV Mode ]
```
Tap = activate. Active scene is highlighted. Lives at top of every view.

**Option B — Big buttons (hero treatment):**
```
+----------+  +----------+  +----------+
| ADAPTIVE |  | EVENING  |  | TV MODE  |
+----------+  +----------+  +----------+
```
Bigger touch targets, more visually anchored.

**Option C — Toggle bar (single component cycles):**
```
[ Mode: Adaptive  ⇄ Tap to cycle ]
```
Tap cycles through the 2-3 scenes. Less screen real estate but less discoverable.

**Option D — Hidden behind a popup:**
A single status tile shows current mode; tap opens a popup with scene chips. Smaller footprint, more taps for routine use.

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ D  ☐ Other: _______

---

## §2 — Page Taxonomy

Pages this dashboard can host. Each page is a "view" in HA Sections terminology.

### Q2.1 — Which pages should exist?

**Always-on (every option):**
- `Home` — overview / daily-use surface

**Optional:**
- `Rooms` — per-room subviews (one per room: Living, Kitchen, Dining, Bedroom, Office)
- `Media` — Sonos deep player + speaker grouping
- `System` — sensor graphs, HVAC, OAL detail (graphable stuff)
- `Settings` — OAL config, alarms, away mode
- `Info` — passive read-only info (Mac's "info-only" status-card variant)

**Option A — Minimal (Home only, everything via popups):**
- 1 view: Home
- Rooms / Media / OAL / System surfaced via Bubble Card 3.2.1 popups invoked from Home

**Option B — Home + System (graphs need their own view):**
- 2 views: Home, System
- Rooms / Media via popups
- Settings via HA Settings page (not Tunet)

**Option C — Full taxonomy:**
- 5+ views as listed
- Each room has its own subview
- Media has dedicated page
- Bubble popups for transient interactions only (e.g., "edit alarm")

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ Other: _______

---

### Q2.2 — Navigation between pages

**Option A — `tunet-nav-card` as persistent chrome (current pattern):**
Bottom dock on mobile, left rail on desktop. 4-6 icons routing to top-level pages.

**Option B — HA native sidebar only:**
Pages appear in HA sidebar; no in-dashboard nav.

**Option C — Hash-routing only (Bubble Card 3.2 hashes):**
Single Home view; every "page" is a popup invoked by hash. No nav-card.

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ Other: _______

---

## §3 — Home Page Composition

For the Home view, what's above the fold on phone (390px) and how does the rest sequence below?

### Q3.1 — Phone (390x844) section order

Each section is a row. Mac scrolls vertically.

**Option A — Scenes-first (recommended given Mac's scene emphasis):**
1. **Scenes strip** (2-3 scenes, large tap targets)
2. **Home Summary** (8-tile status matrix: mode age, HVAC running, inside/outside temp, humidity, etc.)
3. **Climate** (thermostat)
4. **Lighting** (6 zones grid)
5. **Rooms** (5 rooms, row variant with accurate state)
6. **Media** (Sonos transport)
7. **Speakers** (5-speaker grid with grouping)
8. **Inbox** (when items present)
9. **Nav** (chrome at bottom)

**Option B — Status-first:**
1. **Home Summary** (top)
2. **Scenes**
3. ...rest as A

**Option C — Rooms-first:**
1. **Rooms** (room access is primary)
2. **Scenes**
3. **Home Summary**
4. ...rest as A

**Option D — Custom (please specify):** _______

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ D

---

### Q3.2 — Home Summary tile contents (8 tiles in 4×2 matrix)

The `home_summary` variant of `tunet-status-card` shows 8 tiles. Which 8 matter most?

**Option A (mode + climate-heavy):**
1. Adaptive zones count
2. Manual overrides count
3. Active OAL mode + age ("Adaptive · 1h 11m")
4. HVAC running (state)
5. Inside temp
6. Outside temp
7. Humidity
8. AQI

**Option B (HVAC-heavy):**
1. Active OAL mode + age
2. HVAC running
3. Heating today (minutes)
4. Cooling today (minutes)
5. Inside temp
6. Outside temp
7. Setpoint drift (high or low)
8. AQI

**Option C (rooms-summary):**
1. Mode
2. HVAC
3. Inside temp
4. Outside temp
5. Living Room occupancy
6. Kitchen occupancy
7. Bedroom occupancy
8. Office occupancy

**Option D (Mac specifies which 8):**
_____________________________________

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ D

---

### Q3.3 — Desktop composition (1440×900)

On desktop with `max_columns: 4`, sections can sit side-by-side. Which sections go full-width vs split?

**Option A — Phone layout stacks identically on desktop (no side-by-side):**
Every section `column_span: 4`. Tall scroll on desktop. Simplest.

**Option B — Selective split:**
- Climate + Weather side-by-side (`column_span: 2` each)
- Media + Speakers side-by-side (`column_span: 2` each)
- Everything else full-width

**Option C — Heavy split:**
- Climate + Weather + HVAC (3 across)
- Lighting + Rooms (2 across)
- Media + Speakers + Inbox (3 across)
- Rest full-width

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ Other: _______

---

## §4 — Per-Card Variant Catalog

For each of the 15 Tunet cards, which variant to use IN THE HOME VIEW. (Per-room subviews may use different variants.)

### §4.1 — `tunet-actions-card`

**Variants available**:
- `compact` (default) — single-row utility strip, no wrap
- `relaxed` — taller chips, wraps at narrow widths
- `mode_strip` — mode-aware chips that highlight when active mode matches
- `tap_action_strip` — chips that fire arbitrary tap_action (not service)

**Mac's pick for Home page**: ☐ compact  ☐ relaxed  ☐ mode_strip  ☐ tap_action_strip

**What it controls**: light.all_adaptive_lights (All On / All Off) + scenes (Bedtime / Sleep)

---

### §4.2 — `tunet-scenes-card`

**Variants available**:
- `wrap` (default) — chips wrap to multiple rows
- `strip` — horizontal scroll, single row

**Mac's pick for Home page**: ☐ wrap  ☐ strip

**Variant-specific**: with 3 scenes total, strip vs wrap is moot (both fit in 1 row at phone width). Pick `strip` for visual consistency with actions-card OR `wrap` to allow it to grow.

**What it controls**: scene.tunet_oal_adaptive / dim_ambient_plus / dim_ambient (the 3-scene cycle)

---

### §4.3 — `tunet-status-card`

**Variants available** (the most-flexible card):
- `home_summary` — 4×2 phone matrix, 8 tiles, compact
- `home_detail` — verbose grid, more tiles, larger tile_size
- `room_row` — single horizontal row of per-room state
- `info_only` — passive read-only grid
- `alarms` — alarm-focused list
- `custom` — author-defined tile grid

**Mac's picks (per position on Home page)**:
- Top status: ☐ home_summary  ☐ home_detail  ☐ custom
- Rooms row (if used): ☐ room_row  ☐ skip
- System info row (if used): ☐ info_only  ☐ skip

**What it controls**: per-tile tap_action (more-info or configured nav)

---

### §4.4 — `tunet-rooms-card`

**Variants available**:
- `tiles` (default) — 2×3 square tile grid
- `row` — list of horizontal rows with orbs + status + chevron
- `slim` — compact single-line rows (mobile-optimized)

**Mac's pick for Home page**: ☐ tiles  ☐ row  ☐ slim

**Variant differences (per discovery)**:
- `tiles`: shows room name + status; "Off" when no lights on; minimal extra info
- `row`: shows room name + status + orbs (one per light) + power-toggle button + chevron-navigate
- `slim`: like row but more compact

**Recommended**: `row` — gives Mac orbs (visual feedback of which lights on) without claiming as much vertical space as tiles

**What it controls**:
- Tap on tile/row body: configurable `tap_action` (nav OR toggle-all OR popup)
- Tap on orb: toggles individual light
- Tap on power button: toggle ALL room lights
- Hold: configurable hold_action

---

### §4.5 — `tunet-rooms-card` interaction model (load-bearing)

Mac said 2026-05-23: "On the rooms card, open the wider rooms popup."

This **REVERSES** the 2026-05-04 lock (which was: tap = toggle, hold = navigate to subview).

**Option A — Revert to popup-on-tap:**
- Tile/row body: **tap = open Bubble popup** with room detail (lighting + climate + sensors)
- Orb: tap toggles individual light (unchanged)
- Power button: toggle all (unchanged)
- Hold: nothing (no subview page exists)

**Option B — Tap toggles, hold opens popup:**
- Tile/row body: tap = toggle all room lights (current 2026-05-04 lock)
- Hold (400ms) = open Bubble popup
- Orb: tap toggles individual light

**Option C — Tap navigates, hold toggles:**
- Tile body: tap = navigate to dedicated `/tunet-home-v2/<room>` subview
- Hold = toggle all
- Orb: tap toggles individual light

**Option D — Three affordances (tap, hold, chevron):**
- Tile body: tap = toggle all
- Chevron icon on row: tap = open Bubble popup
- Hold: navigate to subview
- Orb: tap toggles individual

**Mac's pick:**  ☐ A  ☐ B  ☐ C  ☐ D

**What goes IN the rooms popup**: see §6 below.

---

### §4.6 — `tunet-light-tile`

**Variants available**:
- Orientation: `vertical` (icon + bar + label stacked) | `horizontal` (icon + bar + label side-by-side)
- Tile size: `compact` | `standard` | `large`

**Use cases on Home**:
- Direct-access tiles for KEY individual lights (kitchen counter, entry lamp, master bedroom main)
- Or skip entirely on Home, only inside room popups/subviews

**Mac's pick**:
- Include light-tile direct access on Home? ☐ Yes  ☐ No
- If yes, which lights? (multi-select):
  - ☐ light.kitchen_counter_cabinet_underlights
  - ☐ light.entryway_lamp
  - ☐ light.master_presence (bedroom)
  - ☐ Other: _______
- Orientation: ☐ vertical  ☐ horizontal
- Tile size: ☐ compact  ☐ standard  ☐ large

---

### §4.7 — `tunet-lighting-card`

**Variants available**:
- Surface: `card` | `section`
- Layout: `grid` | `section` | `scroll`
- Tile size: `compact` | `standard` | `large`
- Columns/rows: 2/2, 3/2, 3/3, etc.

**Mac's pick for Home page**:
- Surface: ☐ card  ☐ section
- Layout: ☐ grid  ☐ section  ☐ scroll
- Tile size: ☐ compact  ☐ standard  ☐ large
- Columns × rows: _______

**Default recommendation**: surface section, layout grid, tile_size compact, columns 3 × rows 2 (fits 6 zones).

**What it controls**: 6 OAL zone groups (Living, Kitchen, Bedroom, Spots, Ceiling, Columns)

---

### §4.8 — `tunet-climate-card`

**Variants available**:
- `standard` (default) — full dual-thumb thermostat surface
- `thin` — compact horizontal strip variant

**Mac's pick for Home page**: ☐ standard  ☐ thin

**What it controls**: `climate.dining_room` (the only thermostat). Drag thumbs to adjust setpoints.

---

### §4.9 — `tunet-weather-card`

**Variants available**:
- `view_mode`: `daily` | `hourly`
- `metric_mode`: `temperature` | `precipitation`
- `show_pressure`: true/false
- `show_last_updated`: true/false
- `forecast_days`: 1-10
- `forecast_hours`: 1-24
- compact toggle

**Mac's pick for Home page**:
- View mode: ☐ daily  ☐ hourly  ☐ auto (let card decide)
- Metric mode: ☐ temperature  ☐ precipitation
- Forecast days: ☐ 3  ☐ 5  ☐ 7
- Show pressure: ☐ yes  ☐ no
- Show last updated: ☐ yes  ☐ no

**What it controls**: `weather.home` (read-only display)

---

### §4.10 — `tunet-sensor-card`

**Variants available**:
- `show_sparkline`: true/false (mini-graph per sensor)
- `show_trend`: true/false (up/down arrow per sensor)
- Multiple sensor entries

**Mac's pick for Home page (or System view)**:
- Show sparkline: ☐ yes  ☐ no
- Show trend: ☐ yes  ☐ no
- Which sensors (multi-select from below):
  - ☐ sensor.dining_room_temperature (Inside)
  - ☐ sensor.kitchen_humidity (Humidity)
  - ☐ sensor.aqi (AQI)
  - ☐ weather.home.temperature (Outside)
  - ☐ sensor.hvac_setpoint_drift_high
  - ☐ sensor.hvac_setpoint_drift_low
  - ☐ sensor.hvac_heating_minutes_today
  - ☐ sensor.hvac_cooling_minutes_today

---

### §4.11 — `tunet-media-card`

**Variants available**: limited (`show_progress` toggle)

**Mac's pick**: include on Home page? ☐ Yes  ☐ No  ☐ Only in Media subview/popup

**What it controls**: `media_player.living_room` (Sonos coordinator). Transport, volume, art.

---

### §4.12 — `tunet-sonos-card`

**Variants available**: alternative Sonos surface (more detail than media-card). Per the 2026-05-04 lock: mobile uses media+speaker_grid; desktop uses sonos-card.

**Mac's pick**: include on Home? ☐ Mobile only  ☐ Desktop only  ☐ Both  ☐ Skip (popup only)

---

### §4.13 — `tunet-speaker-grid-card`

**Variants available**: columns count (3, 4, 5), `show_group_actions`

**Mac's pick**:
- Include on Home page? ☐ Yes  ☐ No  ☐ Only in Media popup
- Columns: ☐ 3  ☐ 4  ☐ 5

**What it controls**: per-speaker selection (sets `_activeEntity` for volume/transport routing), group toggles, per-speaker volume drag.

---

### §4.14 — `tunet-nav-card`

**Mac's pick**: include? ☐ Yes  ☐ No

**If yes**, which nav items?
- ☐ Home
- ☐ Rooms
- ☐ Media
- ☐ System (graphs)
- ☐ Settings
- ☐ Info

---

### §4.15 — `tunet-inbox-card`

**Mac's pick**: include on Home? ☐ Yes  ☐ No (Inbox is its own dashboard already)

**Notes**: Inbox card only renders when items are present. Surfaces actionable notifications.

---

### §4.16 — `tunet-alarm-card`

**Mac's pick**: include on Home? ☐ Yes  ☐ No  ☐ Only in Bedroom popup

**What it controls**: Sonos alarm switches. Per-row tap=toggle, hold=edit popup (Browser Mod exception).

---

## §5 — Per-Card Interaction Contract

Once variants are chosen above, what does each interaction do? This is the SPEC for what tap/hold/drag mean on each card-in-position.

### Standard interaction primitives

- **Tap** = single touch, <250ms
- **Hold (400ms)** = press-and-hold without movement
- **Long-press (800ms)** = optional second-tier hold
- **Drag** = press + horizontal/vertical movement
- **Swipe** = quick swipe gesture (rarely used in Tunet)

### Per-card-in-position interaction table

(Filled in per Mac's variant choices above. Below is a representative template.)

| Card position | Tap | Hold (400ms) | Long-press (800ms) | Drag |
|---------------|-----|-------------|---------------------|------|
| Scenes strip | activate scene | — | — | — |
| Home Summary tile (mode) | open #oal-detail popup | — | — | — |
| Home Summary tile (HVAC) | more-info on climate.dining_room | — | — | — |
| Home Summary tile (temp) | more-info on sensor | — | — | — |
| Climate | more-info | — | — | dual-thumb temp adjust |
| Weather | more-info on weather.home | — | — | — |
| Lighting zone tile | toggle zone group | more-info on switch | — | brightness slider (after hold gate) |
| Light-tile (direct) | toggle | more-info | — | brightness slider |
| Rooms tile/row | (per Q4.5 Mac's pick) | (per Q4.5) | — | — |
| Rooms orb | toggle single light | — | — | — |
| Rooms power button | toggle all room lights | — | — | — |
| Media art | more-info on media_player | — | — | — |
| Media transport | play/pause/skip | — | — | — |
| Sonos volume | — | — | — | volume adjust |
| Speaker tile | select as active speaker | more-info | — | volume adjust |
| Inbox item | execute action / more-info | — | — | — |
| Alarm row | toggle alarm | open edit popup | — | — |

**Mac to validate or override any row above**.

---

## §6 — Popup Composition (Bubble Card 3.2.1)

Popups are top-level cards on the dashboard, invoked via `#hash` navigation. `popup_mode: fit-content` (Adaptive sizing), `bottom_offset: true` (nav-aware in 3.2.1).

### §6.1 — `#room-living-room` popup contents

**Option A — Lighting-focused:**
- Living Room Lights (4 zones: couch, floor, spots, credenza) — large lighting-card grid
- Temperature + occupancy sensors row

**Option B — Full room control:**
- Lighting (large grid)
- Climate (since dining/living share thermostat) — thin variant
- Sensors row
- Quick action chips (All On / All Off)

**Option C — Minimal:**
- Lighting only

**Mac's pick:**  ☐ A  ☐ B  ☐ C

---

### §6.2 — `#room-kitchen` popup contents

**Option A:**
- Lighting (3 zones: island, main, under-cab)
- Humidity + occupancy sensors

**Option B:**
- Lighting
- Sensors
- Quick action: "Cook mode" (bright kitchen scene)

**Mac's pick:**  ☐ A  ☐ B  ☐ Other: _______

---

### §6.3 — `#room-bedroom` popup contents

**Option A — Lighting + alarms:**
- Lighting (3 zones: main, accent, lamps)
- Temperature + humidity + occupancy
- `tunet-alarm-card` (Sonos alarms)

**Option B — Lighting + alarms + sleep mode:**
- Same as A
- + "Sleep" scene tap (which is currently in Actions strip — duplicate access)

**Mac's pick:**  ☐ A  ☐ B  ☐ Other: _______

---

### §6.4 — `#media-living-room` popup contents

**Option A — Sonos deep view:**
- `tunet-sonos-card` (full transport + favorites + source)
- `tunet-speaker-grid-card` (5-speaker grouping)

**Option B — Sonos + source switcher:**
- `tunet-sonos-card`
- Source-selector chips (TV / Spotify / Sonos)
- Speaker grid

**Mac's pick:**  ☐ A  ☐ B  ☐ Other: _______

---

### §6.5 — `#oal-detail` popup contents

**Option A — Compact mode + scenes:**
- Mode dropdown (input_select.oal_active_configuration)
- 5 scene chips (Adaptive, Evening, Dim, Sleep, Bright)

**Option B — Verbose:**
- Mode dropdown
- Override count + reset button
- Boost offset + sensitivity
- Scene chips
- Per-zone override status

**Mac's pick:**  ☐ A  ☐ B  ☐ Other: _______

---

## §7 — What Each Control Controls (Entity Mapping)

For every interactive element, what entity/service does it actually affect?

### Lights

| Control | Entity / Service |
|---------|------------------|
| Scenes strip "Adaptive" | `scene.tunet_oal_adaptive` → sets `input_select.oal_active_configuration` |
| Scenes strip "Evening" | `scene.tunet_oal_dim_ambient_plus` |
| Scenes strip "Dim" | `scene.tunet_oal_dim_ambient` |
| Actions "All On" | `light.turn_on` on `light.all_adaptive_lights` |
| Actions "All Off" | `light.turn_off` on `light.all_adaptive_lights` |
| Lighting card zone tap | `light.toggle` on the zone group entity |
| Lighting card zone drag | `light.turn_on` with brightness |
| Light-tile (direct) | `light.toggle` / `light.turn_on` with brightness |
| Rooms power button | toggle all room.lights via `light.turn_off` / `light.turn_on` |
| Rooms orb | toggle individual `light.X` |

### Climate

| Control | Entity / Service |
|---------|------------------|
| Climate card drag | `climate.set_temperature` on `climate.dining_room` |

### Media

| Control | Entity / Service |
|---------|------------------|
| Media transport play/pause | `media_player.media_play` / `media_player.media_pause` on `_transportTarget` (selected speaker OR coordinator) |
| Media transport next/prev | `media_player.media_next_track` / `media_player.media_previous_track` |
| Volume slider | `media_player.volume_set` |
| Speaker tile tap | sets `_activeEntity` (no HA service; routes subsequent transport calls) |
| Group toggle | `media_player.join` / `media_player.unjoin` |

### Mode / OAL

| Control | Entity / Service |
|---------|------------------|
| Mode dropdown | `input_select.select_option` on `input_select.oal_active_configuration` |
| Status tile "Adaptive" tap | navigate to `#oal-detail` popup |
| OAL detail reset button | `script.oal_reset_soft` |

### HVAC

| Control | Entity / Service |
|---------|------------------|
| HVAC tile tap | `more-info` on `climate.dining_room` |

### Sensor card

| Control | Entity / Service |
|---------|------------------|
| Sensor row tap | `more-info` on the sensor entity |

---

## §8 — Per-Room Subview Pages (if Mac picks taxonomy Option C)

Only relevant if Q2.1 = Option C (full taxonomy with subview pages).

### Per-room subview template

```
+---------------------------------------+
|  [Back] Living Room                   |
+---------------------------------------+
|  Lighting (large grid, 4 zones)       |
+---------------------------------------+
|  Climate (if room has thermostat)     |
+---------------------------------------+
|  Sensors (temp / humidity / lux /     |
|           occupancy)                  |
+---------------------------------------+
|  Media (if room has speakers)         |
|  - Speaker grid filtered to room      |
+---------------------------------------+
|  Quick actions (room-scoped scenes)   |
+---------------------------------------+
```

**Mac's pick on per-room subview**: ☐ Build subviews  ☐ Popups only  ☐ Both

---

## §9 — Sensors that need fixing or adding

From Mac's 2026-05-23 inputs:

### Already added (live now)
- ✅ `sensor.hvac_heating_minutes_today` / `_cooling_minutes_today` (Plan B2)
- ✅ `sensor.hvac_setpoint_drift_high` / `_low`
- ✅ `binary_sensor.hvac_running`
- ✅ `sensor.oal_mode_current` (with `age_human`)
- ✅ `sensor.oal_override_count_active`
- ✅ `binary_sensor.oal_in_default_cycle`
- ✅ `binary_sensor.occupancy_<room>` × 5 rooms

### Mac de-prioritized
- `sensor.lights_on_<room>` — keep code (doesn't hurt) but DO NOT surface on dashboard

### Missing — Mac wants
- Per-room temperature where missing (Kitchen has none; Office has none)
- Per-room humidity where missing (Living Room sensor returns unknown — dead device)
- Lux sensors for Office + Bedroom
- HVAC equipment power (requires hardware: Shelly EM or smart plug clamp)

### TV Mode notification debouncing bug
Mac said "TVI watch occasionally but the notifications are broken on that there's no debouncing and there are just so many problems here." Separate workstream from this dashboard. Tracked but out of scope.

---

## §10 — Acceptance Criteria

When this wireframe is locked, the dashboard build (separate later tranche) must satisfy:

1. **All Q1.* picks** answered. Scene model unambiguous.
2. **Q2.* page taxonomy** locked.
3. **Q3.* Home composition** locked.
4. **Q4.* per-card variant** locked.
5. **Q5 interaction contract** validated row-by-row.
6. **Q6.* popup composition** locked.
7. **Q7 entity mapping** confirmed (no phantom entities).
8. Mac signs off "ship the build" per M3.

**No dashboard YAML changes happen between now and Mac's sign-off.**

---

## §11 — Mac's working notes / feedback section

(Mac writes here as he goes through the doc.)

```
[Mac's notes]
```

---

## §12 — Build sequence (post-signoff)

When Mac signs off:

1. Update `packages/oal_lighting_control_package.yaml` to refine "Dim Ambient Plus" (or rename to Evening) per Q1.2.
2. Rewrite `Dashboard/Tunet/tunet-home-v2-config.yaml` per the locked picks.
3. Deploy via `tunet:deploy:dashboards:storage --dashboard tunet-home-v2`.
4. Production-mirror capture at 390x844 + one desktop breakpoint.
5. Read each captured PNG into context (M1 mandate).
6. Produce M1 review block.
7. Iterate per Mac's feedback (capitulation guard — ask WHAT SPECIFICALLY).
8. Cutover decision: replace `/tunet-overview` as production OR leave as parallel.

This step is NOT happening until Mac stamps the wireframe.
