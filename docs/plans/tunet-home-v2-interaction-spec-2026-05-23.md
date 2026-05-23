# Tunet Home v2 — Interaction Model + Wireframe Plan (2026-05-23)

## Context

Mac's 2026-05-23 directive: "Plan the interaction model from the home page all the way through wireframe — what is on the home page including the room tiles, what's in the room tile popup, what's in the room page itself, what other pages do we need like media, how are we going to control media on the main page, how are we going to fix all of the broken media players, what other controls do we want like adaptive lighting stats a page with all of our statistics heating cooling electricity. Is the popup contract that you clarified actually the best possible use? Have you pressure tested it have you done an adversarial review? Like think about this like your wireframing through as a user every single page every single interaction like what is the best in class what would Apple do?"

Earlier in this session I built `/tunet-home-v2/home` (commit `38c9d66`) without first wireframing the interaction model. Mac stopped that and asked for the plan. He then explicitly authorized: **"Any sensors that we don't have you can create them."**

Three parallel discovery subagents ran 2026-05-23 and surfaced:

1. **Media is structurally broken**: 5 Sonos speakers each have two parallel entities (native Sonos + Music Assistant), state desyncs, `media_player.office` is actually the bedroom Sonos (naming bug), bedroom Play:3 drops off network for 70+ min intervals. The M5 transport FF/RW rejection on Spotify+Sonos has a confirmed root cause: native Sonos integration rejects skip commands because Spotify owns the queue; MA entity has queue ownership and accepts skip. **Fix: route transport to MA entity family when MA is the active source.**
2. **Energy/electricity gap is large**: only 2 power sensors exist (LR dimmer 42.3W, master bedroom 6.4W). No whole-home metering. Two parallel HVAC sensor families exist (one in hours measurement, one in minutes total_increasing) — should be consolidated.
3. **Apple's interaction contract is unambiguous and Tunet should mirror it**: tap-on-icon = toggle, tap-on-name = open accessory control, long-press = detail sheet. Apple uses detent-based sheets (medium ~50vh, large ~90vh) with grabber + spring physics — the exact fix for the CLAUDE.md-recorded "fixed-height popup empty/clipped" defect that Bubble Card 3.2.1's bottom-offset partially addresses but does not fully solve.

**Goal of this plan**: produce a wireframe + interaction spec for every page and every interaction, including an adversarial review of the popup contract and a roadmap for fixing the media surfaces and adding a stats page. NO dashboard YAML or HA config changes happen until Mac stamps this plan. Once stamped, the dashboard rebuild is mechanical.

---

## 1. Architecture decision: Apple-style interaction contract

**RECOMMENDATION (R1, locked unless Mac says no)**: Adopt Apple's tap-vs-long-press contract verbatim across the entire Tunet card suite:

- **Tap on icon region** = primary toggle / activate (single light → toggle; scene chip → activate; transport button → play/pause)
- **Tap on name/body region** = open detail sheet for that entity (room → room popup; light → more-info-equivalent; media → expanded transport)
- **Long-press (500ms)** = open detail sheet (same as name-tap) — provides redundant discoverability for users who don't notice the name-vs-icon split
- **Drag** = continuous value adjustment (brightness, volume, temperature setpoint)
- **Pan inside a sheet** = scroll content

**Rationale**: Apple Home on iOS 18 uses this exact split. Users have muscle memory from iOS for "tap icon = quick, tap row = detail." Long-press is the second-tier discoverability fallback.

**Adversarial review** (Mac's "pressure test the popup contract"):

| Scenario | Risk | Mitigation |
|----------|------|------------|
| Accidental tap during scroll | Popup opens unexpectedly during finger drag | HA's tap detection includes movement threshold; verify Bubble Card respects it. If not, add `tap-only-if-no-movement > 8px` guard in card-level interaction code |
| Wrong-room selection (fat-finger) | Wrong popup opens | Use Apple HIG 44pt tap targets (2.75em at our 16px anchor) + 8pt gutter (0.5em) between tiles. Current Tunet tiles are smaller than this on phone — needs audit |
| Mac taps name expecting toggle | Confusing contract | The name-tap-opens-detail pattern is consistent with Apple Home; document explicitly in `cards_reference.md`. Add subtle ›chevron affordance on the right of each row indicating "drillable" |
| Popup opens, Mac dismisses, opens again | Friction | Bubble Card popups close on backdrop-tap; this is fine. But the open animation must NOT block input — current Bubble Card 3.2.1 should be tested |
| Popup-too-tall on phone | Cut-off content (the CLAUDE.md-recorded defect) | **Replace fixed-height popups with detent system**: `popup_mode: fit-content` is a half-measure. Either (a) accept Bubble Card 3.2.1's `popup_mode: fit-content` with vigilant per-popup content auditing, OR (b) introduce a `<dialog>`-based detent sheet primitive (more work, more faithful to Apple). **Recommendation: (a) for now with tested content per popup; (b) is a future improvement worthy of its own tranche** |
| Popup-too-short on phone | Empty space (the OTHER half of the CLAUDE.md defect) | Same fix as above — `popup_mode: fit-content` should adapt; verify per-popup |
| User wants to interact with background while popup open | Modal blocks | Apple Home sheets are non-modal for read-only state but modal for interactive controls. Bubble Card popups are modal by default. Accept this; if a non-modal use case arises, evaluate then |
| Voice command fires while popup open | Conflict | HA voice doesn't interact with Lovelace state directly; voice goes through HA service calls which work regardless. Safe |
| Slow network: tap → service call → stale state | User taps again, double-fires | **Optimistic state with bounded snapback** (Apple's pattern). On `pointerup`, immediately reflect intended state visually. Watch for HA confirm within ~1.5s; on timeout, snap-back with shake + toast. Never block input on round-trip |

**Pressure-test conclusion**: the popup contract Mac sketched ("tap = open rooms popup") is sound IF combined with Apple HIG tap-target sizing, optimistic state, and content-aware popup sizing. The biggest risk Bubble Card 3.2.1 does NOT solve is the **detent system** for variable-content popups — keep as a known limitation and accept; revisit if defects compound.

---

## 2. Scene model (LOAD-BEARING)

Mac's daily-use vocabulary from 2026-05-23:
- "brighter one for most of the time" = Adaptive (default daily)
- "one that's a little bit dimmer where we turn off the overhead lights in the kitchen and the entryway main lights and maybe reduce the kitchen island pendants a little bit and same with the bedroom" = the Evening mode
- "really only two or three modes"
- TV mode occasionally; notifications broken (out of scope this plan)

**RECOMMENDATION (R2, needs Mac confirmation)**:

**3-mode cycle (Adaptive, Evening, Late Night)** with these per-zone values:

| Zone | Adaptive | Evening (NEW) | Late Night = "Dim Ambient" today |
|------|---------|----------------|----------------------------------|
| `light.main_living_lights` | sun-adaptive | 40% | 40% |
| `light.kitchen_main_lights` | sun-adaptive | **OFF** | sun-adaptive |
| `light.entryway_lamp` | sun-adaptive | **OFF** | dim per main_living |
| `light.kitchen_island_pendants` | sun-adaptive | 20% (was 30) | 30% |
| `light.kitchen_counter_cabinet_underlights` | sun-adaptive | 8% | 10% (already lowered) |
| `light.bedroom_primary_lights` | sun-adaptive | 25% | sun-adaptive |
| `light.column_lights` | sun-adaptive | 30% | 30% |
| `light.accent_spots_lights` | sun-adaptive | 20% | 20% |
| `light.recessed_ceiling_lights` | sun-adaptive | 1% | 1% |
| `light.office_lights` | sun-adaptive | 30% | sun-adaptive |

This **refines the existing "Dim Ambient Plus" mode I created earlier** (with kitchen-pendant 30→20 and bedroom-primary added to 25) — rename to "Evening" for clarity per Mac's vocabulary.

ZEN32 B5 2x cycles: Adaptive → Evening → Late Night → Adaptive (already restricted to 3 in `zen32_cycle_oal_config`).

---

## 3. Page taxonomy

**RECOMMENDATION (R3)**:

| Page | URL path | Purpose | Audience |
|------|----------|---------|----------|
| **Home** | `/tunet-home-v2/home` | Glanceable status + scenes + room access + media | Primary daily-use |
| **Rooms** (5 subviews) | `/tunet-home-v2/<room>` | Full per-room control surface | Drill-down |
| **Media** | `/tunet-home-v2/media` | Sonos deep view + group control + favorites | Music sessions |
| **Stats** | `/tunet-home-v2/stats` | HVAC, electricity, OAL mode timelines | Monitoring / interest |
| **Adaptive** | `/tunet-home-v2/adaptive` | OAL state + per-zone snapshot + override management | Power user |
| **(hidden) Popups** | hashes | Bubble Card 3.2.1 popups for rooms/media/oal-detail | Transient drill-in |

**Nav**: `tunet-nav-card` as persistent bottom dock on phone + left rail on desktop. Six items: Home, Rooms, Media, Stats, Adaptive, plus a settings drawer.

Per-room subviews (5) allow drill-in WITHOUT popup if Mac wants a persistent surface. Bubble popups serve quick-edit; subviews serve sustained interaction.

---

## 4. Home page composition (wireframe)

**Phone (390×844), top → bottom**:

```
+---------------------------------------+
| [Status pill row] horizontal scroll   |  <- glanceability layer
| [Mode 1h11m]  [HVAC On]  [68° Inside] |     (NEW — Apple-style chips)
| [38% Humid]   [Manual: 1]  [AQI 36]   |     tap any chip → drillable detail
+---------------------------------------+
| [Adaptive] [Evening] [Late Night]     |  <- scene strip (3 large chips)
|       (active highlighted)            |     tap = activate scene
+---------------------------------------+
| Rooms                                  |  <- rooms row variant
|  Living Room ●●●●  →                  |     orb count = lights-on
|  Kitchen      ●●○  →                  |     tap row body = open #room popup
|  Dining Room  ●●   →                  |     tap orb = toggle single light
|  Bedroom      ●●○  →                  |     tap power-icon = toggle all room
|  Office       ●    →                  |
+---------------------------------------+
| Now Playing                            |  <- compact media (mini player)
|  [art] This Side Of H...               |     tap art/title = open #media popup
|  Max McNown  |◀  ▶  ▶|                |     transport inline
|  3:59 [====      ]                    |
+---------------------------------------+
| Quick Lights                          |  <- direct light-tile access
|  [Counter 70%] [Entry 50%]            |     for the 2-3 lights touched most
+---------------------------------------+
| [Bedtime] [Sleep] [All Off]           |  <- actions strip (compact)
+---------------------------------------+
| Inbox (when present)                   |
+---------------------------------------+
| [Nav: Home Rooms Media Stats Adapt]   |  <- persistent bottom nav
+---------------------------------------+
```

**Desktop (1440×900)** — same content but Sections grid spreads sections side-by-side:
- Top row: Status pills (full width)
- Row 2: Scene chips (1/3 width) + Rooms (2/3 width)
- Row 3: Climate (1/4) + Weather (1/4) + Now Playing (1/2)
- Row 4: Quick Lights (1/3) + Actions (1/3) + Inbox (1/3)
- Persistent left nav

**Key changes from earlier `/tunet-home-v2/home`**:
- Scene chips elevated to TOP (was buried mid-page)
- Status row converted to Apple-style horizontal pills with drill-in (was static tile matrix)
- Lights-on-per-room sensors REMOVED (Mac said: "I don't care")
- HVAC stats moved to Stats page (was in System view here)
- Now Playing converted to mini-player (was full media-card)
- Per-room subview navigation added

---

## 5. Room tile interaction model

**RECOMMENDATION (R4)** for `tunet-rooms-card` (row variant):

| Element | Tap | Long-press | Drag |
|---------|-----|------------|------|
| Row body (room name) | **Open `#room-<name>` popup** | Navigate to `/tunet-home-v2/<room>` subview | — |
| Orb (per light) | Toggle single light | Open light more-info | (drag-down might reveal brightness scrubber in future) |
| Power icon (all room) | Toggle all room lights | Show "Reset overrides" prompt | — |
| Chevron (›) | Same as row body tap (popup) | — | — |

**Why both popup AND subview?** Popup = quick-edit (turn off, set scene, brief sensor check). Subview = sustained interaction (planning a multi-light scene, browsing room media). Mac's "tap = popup" handles 80% of cases; long-press = subview handles the other 20%.

---

## 6. Room tile popup content (`#room-<name>`)

Bubble Card 3.2.1 standalone popup, `popup_mode: fit-content`, `bottom_offset: true`. Content per room:

### `#room-living-room`
```
[Living Room]                            [×]
+----------------------------------------+
| ●●●● 4 of 4 lights · 65% avg brightness|
+----------------------------------------+
| LIGHTING (large 2x2 grid)              |
|  [Couch 70%]    [Floor 70%]            |
|  [Spots 25%]    [Credenza 70%]         |
+----------------------------------------+
| CLIMATE                                 |
|  68°F | 60-65 setpoint | idle          |
+----------------------------------------+
| OCCUPANCY                               |
|  Occupied · 2 motion events last 30m   |
+----------------------------------------+
| QUICK ACTIONS                           |
|  [Evening] [Off] [Full Bright]         |
+----------------------------------------+
| [Open Living Room page →]              |
+----------------------------------------+
```

### `#room-kitchen`
- Lighting (3 zones: Island, Main, Counter Under)
- Humidity sensor
- Occupancy
- Quick: [Cook Mode] [Counter Only] [Off]

### `#room-dining-room`
- Climate (thermostat lives here)
- Lighting (2 zones: Spots, Column)
- Quick: [Dinner Mode] [Off]

### `#room-bedroom`
- Lighting (3 zones: Main, Accent, Lamps)
- Temp + humidity + occupancy
- **Sonos alarms** (this is the alarms surface — `tunet-alarm-card`)
- Quick: [Sleep] [Bedside Only] [Off]

### `#room-office`
- Lighting (Desk + Bed lights)
- Occupancy
- Quick: [Focus] [Off]

---

## 7. Per-room subview pages

Each subview is a full `type: sections` view. Template:

```
[Back to Home]    Living Room        [Settings]
+----------------------------------------+
| Hero: large lighting card (4 zones)    |
+----------------------------------------+
| Companion: climate (if applicable)     |
+----------------------------------------+
| Support: occupancy / temp / lux        |
+----------------------------------------+
| Media: room speaker (if applicable)    |
|         filtered speaker grid          |
+----------------------------------------+
| Scenes for this room                   |
|  [Cook] [Dinner] [Movie] [Off]         |
+----------------------------------------+
```

Per-room scene chips trigger room-scoped scripts (NEW — to be added per §10).

---

## 8. Media page + Now Playing on Home

**RECOMMENDATION (R5)**:

### Home page Now Playing (mini-player)
- Compact card showing: art, title, artist, transport (prev/play-next), elapsed/duration
- Tap any region → open `#media-living-room` popup OR navigate to Media page
- Drag art horizontally → switch active speaker (NEW interaction, Apple Music style)
- No volume slider here (saves space; volume in popup/page)

### `#media-living-room` popup
- Full `tunet-sonos-card` (deep transport)
- Speaker grid (5 speakers, group toggles)
- Volume per speaker (drag tiles)
- Source switcher (TV / Spotify / Sonos line-in)

### Media page (full subview)
- Full sonos-card hero
- Favorites
- Queue (if Music Assistant active)
- Per-speaker grid (large)
- Group All / Ungroup All buttons
- Volume sliders prominent
- Source selector

### Critical media fixes (from media discovery subagent)

| Issue | Fix | Owner |
|-------|-----|-------|
| `media_player.office` is bedroom Sonos via MA (naming bug) | Rename in Music Assistant to "Bedroom MA" so HA re-registers; OR add a `customize:` entry to override friendly_name. **Recommended: rename in MA UI** | Mac (1-min UI action) |
| Dual-integration duplication (5 speakers × 2 entities each) | Document canonical entity per use case in `Dashboard/Tunet/Docs/cards_reference.md`: native Sonos for alarms + grouping; MA for transport when MA-sourced | Plan: doc + card code |
| Sonos+Spotify FF/RW rejection (M5) | Card code: detect active source; if `app_name=Spotify` AND `media_content_id` indicates Spotify queue, route `media_next_track` / `media_previous_track` to MA entity (`<room>_2` or `<room>_3`) instead of native | Plan: code edit to `tunet_media_card.js` + `tunet_sonos_card.js` `_callTransport` |
| `sensor.sonos_smart_coordinator` fallback mode | Card code: read `using_fallback` attribute; if true, show subtle "no active group" state instead of acting as if the fallback coordinator is real | Plan: card UI hint |
| `sensor.sonos_alarm_living_room_display` + `sensor.sonos_alarm_kitchen_display` orphans | Remove from `sonos_package.yaml` template sensor block OR convert to conditional template that returns nothing when no alarm exists | Plan: package edit |
| Bedroom Play:3 drops 70+ min | Hardware issue. Plan: add `binary_sensor.bedroom_sonos_healthy` template sensor that flips when `media_player.bedroom` is unavailable >5min. Wire to a notification + dashboard "device offline" badge | Plan: new sensor |
| `media_player.us_vwmxqkwq7r` + `media_player.ians_macbook_pro` clutter | Remove from MA device catalog | Mac (UI action) |
| `media_player.spotify` ("Spotify-2") vestigial | Treat `media_player.spotify_plus_connect` as canonical Spotify entity; ignore vestigial | Plan: doc |

---

## 9. Stats page (heating, cooling, electricity)

**RECOMMENDATION (R6)**: build a stats page with what exists today + create the template sensors Mac authorized.

### What exists (no new code)
- `binary_sensor.hvac_running`
- `sensor.hvac_heating_minutes_today` / `_cooling_minutes_today` (total_increasing min)
- `sensor.hvac_setpoint_drift_high` / `_low`
- `sensor.living_room_presence_dimmer_power` (42.3W)
- `sensor.living_room_presence_dimmer_energy` (0.47 kWh)
- `sensor.master_presence_power` (6.4W)
- `sensor.master_presence_energy` (25.37 kWh)
- `weather.home.temperature` (outside)

### NEW SENSORS TO CREATE (Mac authorized)

In `packages/tunet_stats_sensors.yaml`:

1. **`sensor.outside_temperature`** — template wrapping `state_attr('weather.home', 'temperature')` as a graphable numeric sensor (HA's Statistics card needs numeric domain, not weather domain)

2. **`sensor.hvac_estimated_energy_today`** — template: `heating_minutes * <heating_kw> + cooling_minutes * <cooling_kw>` (Mac fills in kW values for his furnace + AC)

3. **`utility_meter.living_room_lights_daily`** — daily reset on `sensor.living_room_presence_dimmer_energy` (HA's utility_meter platform)

4. **`utility_meter.master_lights_daily`** — daily reset on `sensor.master_presence_energy`

5. **`utility_meter.hvac_heating_daily`** — daily reset on `sensor.hvac_heating_minutes_today` (already total_increasing; gives weekly/monthly via utility_meter)

6. **`utility_meter.hvac_cooling_daily`** — same for cooling

7. **`sensor.hvac_heating_yesterday`** — history_stats yesterday window for tracking day-over-day change

8. **`sensor.hvac_cooling_yesterday`** — same

9. **`sensor.hvac_cycle_count_today`** — counts state changes of `binary_sensor.hvac_running` from off→on today (number of cycles)

10. **`sensor.living_room_lights_yesterday`** — history_stats yesterday on the LR dimmer energy

11. **`sensor.master_lights_yesterday`** — same for master

### Stats page composition

```
[Stats]                              [Period: Today ▼]
+----------------------------------------+
| HVAC TODAY                              |
|  Heating: 0 min   Cooling: 0 min       |
|  Cycles: 3        Now: idle            |
|  [bar chart: heating vs cooling vs idle]|
+----------------------------------------+
| INSIDE VS OUTSIDE                       |
|  Inside: 68°F  Outside: 36°F  Δ32°F     |
|  Setpoint: 60-65°F                      |
|  [line chart: inside / outside / range] |
+----------------------------------------+
| ELECTRICITY (instrumented circuits)     |
|  Living Room lights: 42W (0.47 kWh)    |
|  Master lights:       6W (25.37 kWh)   |
|  [bar chart: per-circuit kWh today]    |
|  [+ Add whole-home meter →]             |
+----------------------------------------+
| WEEKLY                                  |
|  Heating: 0 min  (-5% vs last week)    |
|  Cooling: 0 min  (+0%)                 |
|  [7-day mini chart]                    |
+----------------------------------------+
```

Tap any tile → open detail popup with `tunet-sensor-card` + `mini-graph-card` rendering.

### Future hardware (NOT in this plan)
- Shelly EM clamp on main panel → whole-home wattage + kWh
- Smart plug on furnace circuit → actual HVAC energy

---

## 10. Adaptive Lighting Stats page

**RECOMMENDATION (R7)**: dedicated page surfacing the 30 OAL sensors that exist + a per-zone snapshot.

### NEW SENSORS TO CREATE (Mac authorized)

In `packages/tunet_oal_zone_snapshot.yaml` (new):

Extract per-zone baseline brightness from `sensor.oal_real_time_monitor` attributes:

12. **`sensor.oal_zone_main_living_brightness`** — `state_attr('sensor.oal_real_time_monitor', 'main_living_baseline_brightness_pct')`
13. **`sensor.oal_zone_kitchen_island_brightness`** — same for kitchen_island
14. **`sensor.oal_zone_kitchen_undercabinet_brightness`** — same
15. **`sensor.oal_zone_bedroom_primary_brightness`** — same
16. **`sensor.oal_zone_accent_spots_brightness`** — same
17. **`sensor.oal_zone_recessed_ceiling_brightness`** — same
18. **`sensor.oal_zone_column_lights_brightness`** — same
19. **`sensor.oal_zone_office_brightness`** — same

These give a numeric per-zone graph (currently the values are buried in attribute bags).

### Adaptive page composition

```
[Adaptive]                       [Mode: Adaptive ▼]
+----------------------------------------+
| MODE TIMELINE TODAY                     |
|  [stacked bar: minutes per mode today]  |
|  Adaptive 6m | Sleep 19m | Manual 1h41m |
+----------------------------------------+
| ACTIVE OVERRIDES                        |
|  Office  3h 37m remaining  [Reset]      |
+----------------------------------------+
| ZONE BASELINES (live)                   |
|  Main Living      70% ━━━━━━━━━━──      |
|  Kitchen Island   20% ━━━────────       |
|  Kitchen Counter  55% ━━━━━━━────       |
|  Bedroom         30% ━━━──────────      |
|  Accent Spots    25% ━━━──────────      |
|  Ceiling         1%  ──────────────     |
|  Columns         1%  ──────────────     |
|  Office          30% ━━━──────────      |
+----------------------------------------+
| ENVIRONMENT                             |
|  Sun elevation: -27.9°  (night)         |
|  Color temp avg: 3000K                  |
|  Boost: 0  (no env boost)               |
+----------------------------------------+
| LEARNING                                |
|  Events today: 31                       |
|  [link to learning log]                 |
+----------------------------------------+
```

---

## 11. Per-card variant + interaction map (locked picks)

| Card | Home page variant | Per-room subview | Notes |
|------|-------------------|------------------|-------|
| `tunet-actions-card` | `compact` (small chips at bottom) | n/a | 3 chips: Bedtime, Sleep, All Off |
| `tunet-scenes-card` | `strip` (3 large scene chips) | per-room scenes variant | Adaptive/Evening/Late Night cycle |
| `tunet-status-card` | `home_summary` (8-tile matrix) → convert to **status pills row** | `room_row` variant if used | Pills > matrix for glance |
| `tunet-rooms-card` | `row` variant (5 rooms with orbs) | n/a | Tap = popup; long-press = subview |
| `tunet-light-tile` | `horizontal` for Counter + Entry quick access | `large` `vertical` in popups | 2-3 direct lights on home |
| `tunet-lighting-card` | `grid` 3x2 (6 zones) — REMOVE from home? | `grid` 2x2 large per room | Decision: keep on Home OR move to Lighting subview |
| `tunet-climate-card` | `thin` if kept on home | `standard` in dining-room popup/subview | Probably skip on home, surface in stats |
| `tunet-weather-card` | NOT on Home (move to Stats) | n/a | Frees space on Home |
| `tunet-sensor-card` | NOT on Home (move to Stats + per-room popups) | per-room sensors in popup | Drop from Home — too detailed |
| `tunet-media-card` | mini-player on Home | n/a | Compact form |
| `tunet-sonos-card` | popup + Media page only | n/a | Desktop-only on Home if at all |
| `tunet-speaker-grid-card` | NOT on Home (Media page + popup) | n/a | Too tall for Home |
| `tunet-nav-card` | persistent chrome bottom | n/a | 6 items |
| `tunet-inbox-card` | conditional bottom of Home | n/a | Renders only when items present |
| `tunet-alarm-card` | n/a on Home | `#room-bedroom` popup only | Alarms live with bedroom |

This is a SIGNIFICANT pivot from the earlier dashboard. Home becomes leaner:
- Status pills (glance)
- Scenes (3 chips)
- Rooms (drill-in)
- Now Playing (mini)
- Quick Lights (2 tiles)
- Actions (3 chips)
- Inbox (when present)
- Nav

Everything else moves to subviews or popups.

---

## 12. Critical files to modify (post-approval)

When this plan is stamped, the build touches:

**Packages (new files)**:
- `packages/tunet_stats_sensors.yaml` (11 new sensors per §9)
- `packages/tunet_oal_zone_snapshot.yaml` (8 per-zone brightness sensors per §10)
- `packages/tunet_room_scripts.yaml` (per-room scene scripts: cook, dinner, focus, etc.)

**Packages (edits)**:
- `packages/oal_lighting_control_package.yaml` (rename "Dim Ambient Plus" → "Evening", refine per-zone values per §2)
- `packages/sonos_package.yaml` (remove orphan alarm display sensors for LR + kitchen; add `binary_sensor.bedroom_sonos_healthy`)
- `packages/zen32_modal_controller_package.yaml` (update cycle list with new mode name)
- `packages/tunet_homekit.yaml` (rename scene entity references)
- `packages/tunet_scenes.yaml` (rename `scene.tunet_oal_dim_ambient_plus` → `scene.tunet_oal_evening`)

**Card code (`Dashboard/Tunet/Cards/v3/`)**:
- `tunet_media_card.js` — `_callTransport` adds Sonos+Spotify source detection + MA-entity routing for FF/RW
- `tunet_sonos_card.js` — same routing logic
- `tunet_rooms_card.js` — chevron affordance + long-press subview navigation (in addition to tap-popup)
- `tunet_status_card.js` — new `pills` variant for the horizontal status row (or repurpose `room_row` with different content)

**Dashboard YAML**:
- `Dashboard/Tunet/tunet-home-v2-config.yaml` — full rewrite per the locked composition
- `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` — confirm production flag

**Docs**:
- `Dashboard/Tunet/Docs/cards_reference.md` — interaction contract per card-position
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` — variant choices per section
- `Dashboard/Tunet/Docs/visual_defect_ledger.md` — close items addressed; flag TV mode debounce as separate workstream
- `CLAUDE.md` + `Dashboard/Tunet/AGENTS.md` §6A — update M1 with detent-sheet note (R1 adversarial review)

---

## 12.5 Adversarial review — DEEP (the "pressure test" Mac asked for)

20 scenarios, each with: what happens today, what should happen, mitigation.

### 12.5.1 Tap during scroll (false positive)
- **Today**: HA Lovelace's default tap handler fires on pointerup; pointerup during inertial scroll can register as tap. Bubble Card popup opens unexpectedly.
- **Should**: tap requires pointerdown→pointerup at the same DOM position (movement threshold < ~8px). Standard iOS UIKit value is 10pt.
- **Mitigation**: confirm Bubble Card 3.2.1 popup invocation respects HA's tap-movement threshold. If not, wrap the rooms-card row in a custom pointer handler with movement guard. CSS `touch-action: pan-y` on the row prevents horizontal pan from interfering.

### 12.5.2 Slow network — service call doesn't return
- **Today**: tap a light → service call fires → no UI feedback until state echoes back via WebSocket. On slow link, UI looks dead.
- **Should**: optimistic state update on `pointerup`; spinner only if no confirm after 400ms; snap-back + shake on 1500ms timeout.
- **Mitigation**: card code emits optimistic state class immediately (`.tile.optimistic`); a 400ms timer adds `.tile.pending` (visible spinner); a 1500ms timer reverts state + emits shake animation + toast "Living Room couch lamp didn't respond." Apple Music uses this pattern for `now_playing` updates.

### 12.5.3 Multi-touch / two-finger drag during slider use
- **Today**: brightness slider uses single-pointer tracking. If user accidentally touches with second finger, the gesture state may corrupt.
- **Should**: ignore additional pointers once a primary pointer is captured; release primary on pointercancel.
- **Mitigation**: existing Tunet `createAxisLockedDrag` already does `setPointerCapture(e.pointerId)` per the M1-era hardening. Verify it's applied to all draggable elements (light_tile, lighting zone tile, climate thumbs, sonos volume tile, media volume slider).

### 12.5.4 Voice assistant + dashboard simultaneously
- **Today**: Mac says "turn off living room lights" via Siri/HomeKit (or "Hey Google" via Google Assistant); a moment later he taps the LR couch lamp orb on the dashboard. Two service calls fire ~simultaneously. State race.
- **Should**: HA serializes service calls per entity. Final state matches last command. UI reflects.
- **Mitigation**: HA's WebSocket state subscription gives the card the authoritative state via state_changed events. Card should not assume its own command "won." Card SHOULD reflect what HA broadcasts. This is correct behavior today; just confirm card doesn't have stale optimistic state masking the true state.

### 12.5.5 HomeKit changes state from Apple Home app while dashboard open
- **Today**: Mac taps Evening scene in Apple Home; dashboard's scene chips need to reflect new active mode.
- **Should**: scene chip "active" highlight updates within 200ms of state echo.
- **Mitigation**: actions-card's `mode_strip` variant already subscribes to `mode_entity` (input_select.oal_active_configuration) state_changed events. Confirm scenes-card does same (subscribe to scene state OR input_select that scenes drive). If not, add subscription in `tunet_scenes_card.js`.

### 12.5.6 ZEN32 B5 2x while dashboard open
- **Today**: physical button press fires `script.zen32_cycle_oal_config` → input_select changes → dashboard mode chip updates via state subscription.
- **Should**: same as 12.5.5 — feels immediate.
- **Mitigation**: same. Already wired.

### 12.5.7 HA restart mid-day
- **Today**: HA restart takes 60-180s. Dashboard shows stale state from cached WebSocket; many entities go `unavailable`. After restart, state recovers.
- **Should**: dashboard shows "connecting…" banner; cards individually fade to a stub state ("unavailable" pill); recover gracefully when WS reconnects.
- **Mitigation**: HA frontend already shows connecting banner. Per-card behavior on `entity.state === 'unavailable'`: cards should render a placeholder (`renderConfigPlaceholder` in tunet_base.js) not blank. Audit each card for unavailable-state handling.

### 12.5.8 history_stats reset at midnight
- **Today**: `sensor.hvac_heating_minutes_today` resets to 0 at midnight; if Mac is looking at the Stats page at 23:59, the chart shows a hard cliff at 00:00.
- **Should**: stats card explicitly shows "Today" period with reset behavior; offer "Yesterday" toggle.
- **Mitigation**: build `sensor.hvac_heating_yesterday` (see §9 sensor list); stats card has a Today/Yesterday/7-Day period toggle.

### 12.5.9 Bedroom Sonos drops offline (the documented Play:3 silent-fire pattern)
- **Today**: `media_player.bedroom` goes `unavailable` for 70+ min. Alarms still fire via automation but produce no audio.
- **Should**: dashboard surfaces "Bedroom speaker offline" badge; alarm-edit popup shows warning; notification to Mac if alarm time approaches and speaker still offline.
- **Mitigation**: new `binary_sensor.bedroom_sonos_healthy` template (§9) flipping on >5min `unavailable` window; tunet-alarm-card reads this and shows warning chip; existing automation reacts.

### 12.5.10 Sonos+Spotify FF/RW rejection (M5)
- **Today**: tap next-track button → `media_player.media_next_track` on `media_player.living_room` (native Sonos) → Spotify rejects → no state change → user thinks button broken.
- **Should**: detect Spotify-as-source; route to MA entity (`media_player.living_room_2`); skip works.
- **Mitigation**: in `tunet_media_card.js` and `tunet_sonos_card.js` `_callTransport`:
  ```js
  function selectTransportEntity(coordinator, hass) {
    const e = hass.states[coordinator];
    if (!e) return coordinator;
    const src = (e.attributes.source || '').toLowerCase();
    const app = (e.attributes.app_name || '').toLowerCase();
    if (src.includes('spotify') || app.includes('spotify')) {
      // Find MA shadow entity (suffix _2 or _3)
      const maCandidate = coordinator + '_2';
      if (hass.states[maCandidate]?.state) return maCandidate;
    }
    return coordinator;
  }
  ```
  Verify the `_2` suffix convention matches the live MA entities (it does per discovery).

### 12.5.11 Two phones tapping at same time
- **Today**: Mac on iPhone, partner on iPad. Both tap "Evening" within 100ms.
- **Should**: serialized service calls; final state = "Evening"; both UIs reflect.
- **Mitigation**: HA serializes. Both phones get state_changed event. UIs converge. Already correct.

### 12.5.12 Long-press to navigate, accidentally drag
- **Today**: user holds row body → drag away from row before 400ms timer fires → expected: cancel. Actual: depends on card code.
- **Should**: pointermove > 8px while hold timer pending → cancel timer + cancel gesture.
- **Mitigation**: in `tunet_rooms_card.js`, the hold timer must clear on pointermove > threshold. Audit + add if missing.

### 12.5.13 Popup opens at wrong scroll position
- **Today**: Bubble Card popup opens; backdrop scroll-locks the parent. When popup dismisses, parent scroll position retained.
- **Should**: same.
- **Mitigation**: Bubble Card 3.2.1 handles this. Verify.

### 12.5.14 Entity unavailable in tile orb
- **Today**: `light.living_room_corner_accent` is unavailable → rooms-card orb count = unclear (does it show as off? skipped? errored?).
- **Should**: orb shows "?" or grayed out; not counted as on or off; tooltip says "unavailable."
- **Mitigation**: in rooms-card orb render, check entity.state === 'unavailable' and render distinct visual state. Audit existing code.

### 12.5.15 Stale optimistic state after race
- **Today**: tap a light off → optimistic state shows off → service rejected → revert. But what if rejection takes >1.5s? UI shows "off" misleadingly.
- **Should**: timeout + revert + shake feedback.
- **Mitigation**: §12.5.2.

### 12.5.16 Tap-target too small (HIG violation)
- **Today**: some Tunet card elements are smaller than 44pt × 44pt.
- **Should**: every interactive element ≥ 44pt × 44pt with ≥ 8pt gutter.
- **Mitigation**: audit pass. Specific suspects:
  - `tunet-actions-card` chip in mode_strip compact: likely ~36pt high
  - `tunet-rooms-card` orb in row variant: ~20pt
  - `tunet-status-card` dropdown chevron: ~16pt
  - `tunet-light-tile` brightness drag-target: variable
  - `tunet-nav-card` sub-button: small
- **Plan**: pre-build audit + flag specific violations; fix in card CSS.

### 12.5.17 Popup content overflow (the documented defect)
- **Today**: popup with too much content gets clipped on phone; popup with too little gets empty space.
- **Should**: detent sheet OR `popup_mode: fit-content` with content-aware sizing.
- **Mitigation**: per §1 adversarial table, accept Bubble Card 3.2.1's `popup_mode: fit-content` as best-available; audit each popup's content for phone fit. Mark `Detent sheet primitive` as future tranche.

### 12.5.18 First-use experience (guest / unfamiliar user)
- **Today**: no onboarding tour. Long-press discoverability is zero.
- **Should**: visible affordances for primary interactions; long-press is bonus not primary.
- **Mitigation**: chevron `›` icon on rooms-card rows signals "drillable." Status pills get subtle right-edge indicator. Apple Home uses this pattern.

### 12.5.19 iPad vs iPhone vs laptop — same dashboard?
- **Today**: dashboard renders responsively but interaction model is identical across devices.
- **Should**: pointer (laptop) vs touch (phone/iPad) get appropriate hover state on laptop; touch devices use touch-active state. Touch targets remain 44pt+ on all.
- **Mitigation**: `@media (hover: hover)` for laptop-only hover. Tunet cards already use this pattern in some places; audit.

### 12.5.20 Recovery from `connection_failed` WebSocket
- **Today**: HA frontend retries WS connection. During the gap, dashboard freezes.
- **Should**: visible "reconnecting…" indicator; cards gray out; recover on reconnect.
- **Mitigation**: HA frontend handles globally. Per-card, ensure no JS errors thrown on stale entity refs (defensive checks).

---

## 12.6 User flow walkthroughs (Mac's daily journeys)

Each flow: what Mac does, what dashboard shows, what's optimal vs current.

### 12.6.1 Morning wake (~7:00 AM)
1. Mac wakes; phone on bedside.
2. Glances at iPad mounted on wall: sees Home page.
3. **Optimal**: status pill row shows "Mode: Adaptive · 8h" (slept 8h in Sleep mode), "Inside 67°F", "Outside 32°F", "HVAC: idle 4h." Scene chips show "Adaptive" highlighted. Rooms row: Bedroom On (1 lamp), others Off.
4. Mac taps Bedroom row → bedroom popup → sees alarms next firing tomorrow.
5. Mac taps "All Off" → bedroom lamp off. Status pill updates.
6. Mac leaves bedroom; ZEN32 sees presence → Adaptive engaged.

### 12.6.2 Cooking (~7:00 PM)
1. Mac in kitchen; iPad next to him.
2. Taps Kitchen row → kitchen popup.
3. Sees 3 zones: Island 30%, Main On, Counter 30%.
4. Taps Counter → toggle on; brightness slider visible.
5. Drag-down → 70%.
6. Taps backdrop → popup dismisses.
7. **Optimal**: he didn't have to leave the home view OR navigate to a subview. Popup gave quick edit. Pet UX moment.

### 12.6.3 Movie night (~9:00 PM)
1. Mac in living room.
2. Taps "TV Mode" in scenes strip (if added) OR navigates to OAL → TV Mode.
3. Living room dims; kitchen mostly off; column lights off (TV glare).
4. Tap Now Playing mini-player → opens Media popup → selects TV source.
5. Sonos coordinator updates; Apple TV starts.
6. **Optimal**: minimal taps. Current pain: TV mode notifications fire without debounce (Mac flagged).
7. **Out of scope**: TV mode debounce. In scope: making "TV Mode" accessible from scenes strip (R2 decision).

### 12.6.4 Bedtime (~11:00 PM)
1. Mac in bedroom; iPhone in hand.
2. Taps Sleep in actions strip on Home OR in bedroom popup.
3. Living room off; bedroom main off; lamps dim to bedside.
4. ZEN32 B5 triple-tap is equivalent.
5. **Optimal**: 1 tap. Confirmed working today.

### 12.6.5 Late-night kitchen run
1. 2:30 AM. Mac walks to kitchen. Doesn't want to wake partner.
2. Counter lights at 8% (Evening mode) light path safely.
3. Mac doesn't touch dashboard.
4. **Optimal**: no interaction needed because Evening mode kept kitchen counter on at minimum. THIS IS WHY EVENING MODE EXISTS.

### 12.6.6 Returning home (~6:00 PM)
1. Mac arrives; presence sensors fire.
2. Currently: not auto-routed. Mac unlocks phone, opens dashboard.
3. **Optimal future**: automation detects arrival → Adaptive engages → entry main spot on for 5 min → revert per Plan B5 auto-off.
4. **In scope this plan**: Plan B5 auto-off already shipped. Auto-on on arrival = separate Away Mode feature (out of scope here).

### 12.6.7 Troubleshooting (~mid-day)
1. Mac notices LR couch lamp didn't dim with OAL.
2. Opens dashboard → tap Adaptive pill → opens `#oal-detail` popup.
3. Sees "1 manual override · Office · 3h 37m remaining"
4. Wait — that's office not LR. Looks at zone snapshot: LR is showing 70% baseline.
5. Reads: maybe lamp is unavailable. Opens Living Room popup → sees orb 4 of 4 lit.
6. Tap orb on couch lamp → goes off. Tap again → goes on. Works manually.
7. **Diagnosis**: probably an OAL pause or lighting-card sliding gesture left manual override.
8. Tap "Reset" → `script.oal_reset_soft` fires.
9. **Optimal**: the troubleshooting surface IS the Adaptive page (§10). Status pill drills directly there.

### 12.6.8 Checking stats (passive interest)
1. Mac curious about heating usage.
2. Navigates Stats page.
3. Sees: Heating today 47 min · 3 cycles · Currently idle.
4. Inside vs Outside line chart over past 24h.
5. LR + Master lights kWh today.
6. **Optimal**: existing data + new template sensors give this. No hardware needed for v1.

---

## 12.7 Multi-modal control matrix

For every scene/control, the paths to invoke it:

| Control | Dashboard (touch) | ZEN32 (physical) | Voice (Siri/Google) | Apple Home (HomeKit) | Auto-trigger |
|---------|-------------------|------------------|---------------------|----------------------|--------------|
| **Adaptive mode** | tap chip on scenes strip | B5 2x (cycle to it) | "Set scene Adaptive Mode" | Apple Home → Adaptive Mode scene | morning wake-up automation |
| **Evening mode** | tap chip | B5 2x | "Set scene Dim Ambient Plus" | scene tile | (none currently) |
| **Late Night (Dim Ambient)** | tap chip | B5 2x | "Set Dim Ambient" | scene tile | (none) |
| **Sleep mode** | tap actions chip | B5 3x | "Set Sleep Mode" | scene tile | (none — could add 23:00 trigger) |
| **All Off** | tap actions chip | B1 1x (toggles all lights via toggle script) | "Turn off all lights" | per-light off | exit-home automation? |
| **TV Mode** | NOT in scenes strip (per R2 — Mac said no) | not in B5 cycle | via voice | scene tile | TV power-on automation |
| **Single light toggle** | tap orb on rooms-card row | n/a | "Turn off [light name]" | per-light tile | OAL adaptive |
| **Brightness adjust** | drag-down on light_tile or lighting zone tile | B2/B4 (per ZEN32 mode) | "Set [light] to 30%" | drag thumb | OAL adaptive |
| **Climate setpoint** | drag climate-card thumb | n/a (no climate button) | "Set thermostat to 70" | climate tile | thermostat schedule |
| **Sonos play/pause** | tap transport on media-card | B3 2x | "Play in living room" | media player accessory | Sonos alarm fires |
| **Sonos volume** | drag volume slider OR speaker tile | B3 1x (volume up start) + B2/B4 step | "Volume up in living room" | per-speaker | n/a |
| **Sonos skip** | tap next/prev | B2/B4 (volume mode) | "Next track" | n/a | n/a |
| **OAL Reset Manual Overrides** | tap Reset in Adaptive page | B5 1x hold | "Reset adaptive lighting" (custom intent) | n/a | nightly cleanup automation |

**Conflict resolution**:
- HA serializes service calls per entity → final state matches last command, regardless of source.
- Optimistic UI state can briefly disagree with authoritative state during round-trip — see §12.5.4.
- If two sources fire conflicting commands (e.g., voice says "off" while user taps "on" on iPad), HA sees both, processes in order received, ends in whichever was last. The "race" lasts < 100ms typically.

**Discoverability**: every control should have a primary path AND at least one secondary path. ZEN32 covers most without unlocking phone. Voice covers most without touching anything. Dashboard covers everything precisely. Apple Home covers the 3 cycle scenes.

---

## 12.8 Bubble Card 3.2.1 explicit limitations + acceptances

What Bubble Card 3.2.1 DOES (per discovery + Apple-pattern research):
- ✅ Standalone popup cards (not nested in vertical-stack — new in 3.2.0)
- ✅ `popup_mode: fit-content` adapts height to content
- ✅ `bottom_offset` (3.2.1-new) respects persistent bottom nav
- ✅ Hash-based navigation (`#room-living-room`)
- ✅ Closes on backdrop tap
- ✅ Accepts any custom Lovelace card in `cards:` array
- ✅ Inline editor in HA UI

What Bubble Card 3.2.1 DOES NOT do (Apple sheet primitives missing):
- ❌ Detent system (medium/large, no "half" sheet)
- ❌ Grabber/handle affordance at top
- ❌ Spring physics on open/close (uses ease)
- ❌ Drag-to-dismiss
- ❌ Safe-area inset awareness beyond bottom_offset
- ❌ Multi-modal dismiss (no swipe-down-to-close standard)
- ❌ Width adaptive (only height)
- ❌ Sheet stack / pushed sheets

**Acceptance**: for this build, use Bubble Card 3.2.1 as-is with `popup_mode: fit-content` + `bottom_offset: true`. Audit each popup's content for phone fit. Defer detent sheet primitive to a future tranche (it's a substantial implementation: requires `<dialog>` element + custom spring CSS + grabber CSS + safe-area JS + drag-handler).

**Mitigations during this build**:
- Each room popup content audited to fit in <650px of vertical space at 390px width (roughly 2 detents worth).
- Each popup tested at 390px, 768px, 1440px breakpoints.
- If content overflows, accept scroll inside popup (already does this).
- Chevron + close button explicit; not relying on swipe-down or backdrop-only.

---

## 12.9 Per-card-position edge case matrix

For each card-position, what happens when entity is unavailable / null / mid-transition.

| Card-position | Entity state: unavailable | Entity state: unknown | Entity state: null | User taps anyway |
|---------------|---------------------------|------------------------|---------------------|-------------------|
| Status pill — Mode | show "—" + amber border | show "—" | hide tile | open #oal-detail (still works) |
| Status pill — HVAC | show "?" | show "Off" if not running | show "?" | open climate more-info |
| Status pill — Inside temp | show "—°F" | show "—" | hide | open sensor more-info |
| Scene chip — Adaptive | shouldn't happen (scene always exists) | n/a | n/a | re-fire scene service |
| Scene chip — Evening | n/a | n/a | n/a | re-fire scene service |
| Rooms row — Living Room | show "—" status; orbs grayed | show offline pill | hide row | hold to navigate works; tap shows toast "entity unavailable, can't open popup" |
| Rooms orb — single light | grayed orb with "?" overlay | gray | gray | no service call; toast |
| Rooms power icon | disabled if all lights unavailable | enabled if any available | disabled | toast if no available lights |
| Light-tile direct (Counter) | full card grayed, no controls | partial | hidden | no service call; toast |
| Climate card | "thermostat offline" pill across card | partial | hide | no service call |
| Weather card (Stats page) | "no weather data" stub | partial | hide | no service call |
| Sensor row | "—" value; sparkline empty | partial | row hidden | more-info opens (HA handles) |
| Now Playing mini-player | hide card | "Nothing playing" stub | hide | n/a |
| Speaker grid tile | grayed; "Speaker offline" tooltip | online but idle | hide | tap reselects (might fail; toast) |
| Inbox card | hide whole card if no items | partial | hide | n/a |
| Alarm card (in bedroom popup) | "Alarms unavailable" stub | partial | hide | n/a |
| Nav card | always visible | always | always | always |

**Pattern**: never blank space. Always SOMETHING. If truly empty, hide the row but don't leave a visual hole.

---

## 12.10 Apple HIG citations (specific)

Per the research subagent's report:

- **Tap target minimum**: 44pt × 44pt (Apple HIG > Accessibility). At Tunet's `:host { font-size: 16px }` em anchor, this = 2.75em × 2.75em.
- **Gutter between tap targets**: 8pt (0.5em).
- **Sheet detents**: medium = ~50% viewport height; large = ~90% viewport height with safe-area inset.
- **Spring physics**: presented as `cubic-bezier(0.34, 1.56, 0.64, 1)` (`easeOutBack`-like) for sheet open; reverse for close.
- **Safe area**: bottom inset = `env(safe-area-inset-bottom)`; popups must respect.
- **Press-state animation**: 0.05s ease on `transform: scale(0.97)` for tap feedback. Apple "press in" feel.
- **Disclosure indicator (chevron)**: 8pt × 12pt, right-aligned, gray, indicates "drillable" without "open in new view" overhead.
- **Long-press recognition**: 0.5s default in UIKit (UILongPressGestureRecognizer.minimumPressDuration). Tunet currently uses 400ms in rooms-card hold gate — slightly shorter; acceptable.
- **Optimistic UI**: animation should complete before service call returns (Apple Music play button starts spinning immediately; only snaps back on definite error).

**Where Tunet diverges and should converge**:
- Tap target sizing: audit needed (some chips/orbs < 44pt).
- Spring physics in card transitions: Tunet uses linear `--motion-fast` / `--motion-ui` — acceptable for in-card; sheet open should use spring (but Bubble Card limitation, accept).
- Chevron affordance on drillable rows: not consistent across Tunet — add to rooms-card row variant.
- Optimistic UI: not consistent — add per §12.5.2.

---

## 13. Verification (post-build)

End-to-end test sequence:

1. **Sensor verification**: After deploying new sensor packages, restart HA. Confirm all 19 new sensors return live values via MCP `ha_get_state`. Confirm no errors in HA logs.

2. **Scene verification**: trigger each of the 3 cycle scenes (`scene.tunet_oal_adaptive`, `_evening`, `_late_night`); confirm via MCP that input_select changes AND per-zone brightness reaches expected values. Mac validates live in his living room.

3. **Media transport verification (M5 fix)**: with Spotify playing on Sonos, fire `_callTransport('media_next_track')` from the card. Confirm via logbook that the call routed to `media_player.living_room_2` (MA) not `media_player.living_room` (native). Mac validates skip works.

4. **Popup verification**: open `#room-living-room`, `#room-kitchen`, etc. on phone. Confirm each opens, fills appropriately, dismisses cleanly. Mac confirms via tap on iPhone.

5. **Production-mirror capture**: `npm run tunet:review:share -- --target production --breakpoint 390x844,1440x900 --theme light,dark`. HA push notify lands. Mac reads each PNG, produces M1 review block.

6. **Adversarial test cases**:
   - Tap room tile during scroll — popup should NOT open
   - Tap row body — popup opens
   - Long-press row body — navigate to subview
   - Tap orb — single light toggles
   - Tap power icon — all room lights toggle
   - Open popup → tap backdrop → closes
   - Slow-network simulation: card shows optimistic state with snapback if confirm doesn't arrive in 1.5s

7. **Stats page verification**: open `/tunet-home-v2/stats`. All HVAC sensors populate. Energy sensors graph. Sun elevation drives the boost band. Mac confirms readable.

8. **Adaptive page verification**: open `/tunet-home-v2/adaptive`. Per-zone brightness sensors render. Override countdown displays. Reset button fires `script.oal_reset_soft`.

9. **HomeKit verification**: 3 OAL scenes available in Apple Home; pairing the bridge from Mac's iPhone works; scene activation propagates.

10. **Build artifact**: M1 review block + Mac's explicit "ship it" required before pushing to `origin/main` AND before considering cutover from `/tunet-overview` to `/tunet-home-v2`.

---

## 14. Decision matrix (user input needed)

Before build starts, Mac confirms:

| # | Decision | Default | Mac picks |
|---|----------|---------|-----------|
| D1 | Scene count + names | Adaptive / Evening / Late Night (3) | ☐ |
| D2 | Evening mode per-zone values (§2 table) | as drafted | ☐ confirm OR ☐ adjust |
| D3 | Tap = popup; long-press = subview | (recommended) | ☐ |
| D4 | Per-room subviews built? | Yes (5 subviews) | ☐ Yes  ☐ No (popups only) |
| D5 | Stats + Adaptive as separate pages? | Yes (separate) | ☐ Yes  ☐ Merge into one |
| D6 | New sensors authorized (19 listed in §9 + §10) | Mac said yes 2026-05-23 | ✓ pre-approved |
| D7 | Sonos+Spotify FF/RW: route to MA entity | (recommended fix) | ☐ |
| D8 | Cut over /tunet-overview → /tunet-home-v2? | Parallel-run first | ☐ Parallel  ☐ Cut over  ☐ Keep both |
| D9 | Detent sheet primitive (long-term) | Accept Bubble 3.2.1 for now; revisit later | ☐ |
| D10 | TV mode debounce fix in scope? | NO — separate workstream | ☐ confirm out-of-scope |

---

## 15. Build sequence (post-approval)

1. Create the 3 new packages (stats sensors, OAL zone snapshot, room scripts).
2. Edit OAL package: rename Dim Ambient Plus → Evening; refine per-zone values.
3. Edit Sonos package: remove orphan alarm sensors; add bedroom-healthy sensor.
4. Deploy packages + restart HA.
5. Edit card code: media transport routing fix; rooms-card chevron + long-press; status pills variant.
6. Build cards + deploy: `npm run tunet:deploy:lab`.
7. Rewrite `tunet-home-v2-config.yaml` per locked composition.
8. Add 5 per-room subview YAMLs (or sections within the main config).
9. Add Stats subview YAML.
10. Add Adaptive subview YAML.
11. Deploy: `npm run tunet:deploy:dashboards:storage --dashboard tunet-home-v2`.
12. Production-mirror capture (M1 evidence step).
13. Mac grades on iPhone.
14. Iterate per Mac's feedback.
15. Mac stamps "ship it"; push to `origin/main`.

Estimated effort: ~6-10 hours of execution + Mac's review gates. Best done in 2-3 sittings.

---

## Adversarial review summary (Mac's "pressure test")

The popup contract is **structurally sound** with these acknowledged limitations:
- Bubble Card 3.2.1 popups are NOT detent sheets; they cannot dynamically resize without re-render.
- Content-aware popup sizing (`popup_mode: fit-content`) is the best Bubble Card offers; accepting per-popup content audit as the mitigation.
- Apple's spring physics + safe-area + grabber + multi-modal dismiss are NOT all present in Bubble; we accept the gap for now and flag as a future tranche.
- Tap-target sizing per Apple HIG (44pt min) requires audit on current Tunet card CSS; some elements likely fall short.

The contract IS aligned with Apple's tap-vs-long-press model. The discoverability gap on long-press is mitigated by chevron affordances + duplicate tap-on-name path.

**The 5 Apple-pattern recommendations (from research subagent) integrated above**:
- R1: Apple tap-vs-long-press verbatim (§1)
- R2: Detent sheet primitive — accepted as future-tranche; not in this build
- R3: Status pills as glanceability layer (§4)
- R4: Optimistic state with bounded snapback (§1 adversarial table)
- R5: Compose by room not by category — already drives our taxonomy (§7 per-room subviews)

---

End of plan. Mac reviews D1-D10 in §14, stamps acceptance, build proceeds per §15. Verification in §13.
