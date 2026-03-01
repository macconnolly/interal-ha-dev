# Tunet Dashboard — Implementation Plan v2
## Bug Fixes + Per-Room Views + Navigation Architecture

**Supersedes:** Previous V1 Stabilization Plan
**Working branch:** `claude/dashboard-nav-research-QnOBs`
**Card suite:** V2 ES modules (`Dashboard/Tunet/Cards/v2/*.js`) importing from `tunet_base.js`

---

## File Inventory (V2 Active Cards)

| File | Version | Lines | Config Editor |
|------|---------|------:|:---:|
| `v2/tunet_base.js` | — | 778 | N/A (shared module) |
| `v2/tunet_actions_card.js` | — | 446 | `getConfigForm()` line 269 |
| `v2/tunet_climate_card.js` | — | 1383 | `getConfigForm()` line 630 |
| `v2/tunet_light_tile.js` | — | 802 | `getConfigForm()` line 766 |
| `v2/tunet_lighting_card.js` | — | 1667 | `getConfigForm()` line 672 |
| `v2/tunet_media_card.js` | — | 1234 | `getConfigForm()` line 481 |
| `v2/tunet_rooms_card.js` | — | 578 | `getConfigForm()` line 294 |
| `v2/tunet_sensor_card.js` | — | 833 | `getConfigForm()` line 397 |
| `v2/tunet_sonos_card.js` | — | 1367 | `getConfigForm()` line 578 |
| `v2/tunet_speaker_grid_card.js` | — | 932 | `getConfigForm()` line 446 |
| `v2/tunet_status_card.js` | 2.4.0 | 1111 | `getConfigForm()` line 414 |
| `v2/tunet_weather_card.js` | — | 440 | `getConfigForm()` line 175 |

| Config File | Lines |
|-------------|------:|
| `Dashboard/Tunet/tunet-overview-config.yaml` | 360 |
| `Dashboard/Tunet/tunet-v2-test-config.yaml` | 380 |

---

## Phase 0: Bug Fixes

### Bug 1: Status Tiles Not Same Size

**File:** `Dashboard/Tunet/Cards/v2/tunet_status_card.js`

**Root cause:** The `.tile.has-aux` CSS rule at **line 177** adds `padding-top: 26px` to tiles that have an aux action button, while the base `.tile` rule at **line 92** uses `padding: 14px 8px 10px`. Combined with `grid-auto-rows: auto` at **line 82**, each row auto-sizes to its tallest member. Tiles without `has-aux` in the same row are vertically centered inside the taller row, making them appear visually smaller.

The aux button itself is `position: absolute; top: 8px; right: 8px` (lines 155-156), so it's removed from flow and does NOT need layout clearance.

**Fix (Option B — uniform padding):**

| Change | Location | What |
|--------|----------|------|
| 1 | Line 92 | Change `.tile` padding from `14px 8px 10px` to `26px 8px 10px` |
| 2 | Line 177 | **Delete** the entire rule `.tile.has-aux { padding-top: 26px; }` |

**Effect:** Every tile gets the same 26px top padding uniformly. Aux buttons occupy the same top-right space in every tile but are only rendered when configured. Zero conditional height difference.

**Risk:** Tiles become 12px taller overall. This is acceptable — the extra space gives the icon/label/value stack more breathing room and ensures the aux pill never overlaps the icon.

---

### Bug 2: Reset Button (Aux Action Pill) Always Showing

**File:** `Dashboard/Tunet/Cards/v2/tunet_status_card.js`

**Root cause:** Three pieces are missing:

1. **No reference to aux element.** The `_buildGrid()` method at **lines 676-691** creates and appends the aux button unconditionally when `tile.aux_action` is truthy, but the `_tileEls` array push at **lines 694-702** does NOT store a reference to the aux DOM element. There are 7 properties stored (`el`, `config`, `index`, `valEl`, `dotEl`, `ddMenuEl`, `ddValEl`) — `auxEl` is missing.

2. **No visibility update method.** The `_updateValues()` method at **lines 821-850** iterates tiles and dispatches to type-specific update methods, but never evaluates aux button visibility. The existing `_evaluateVisibility()` at **lines 738-751** handles tile-level `show_when` but not `aux_action.show_when`.

3. **No `show_when` in YAML config.** The Manual tile's `aux_action` config (overview YAML lines 92-98, test YAML lines 81-87) has no conditional visibility — it always renders.

**Existing infrastructure to reuse:**
- `_matchesShowWhen()` at **lines 753-780** — already supports 6 operators (`equals`, `not_equals`, `contains`, `not_contains`, `gt`, `lt`). No changes needed.
- `_evaluateVisibility()` at **lines 738-751** — pattern to follow for the new method.

**Fix — 4 changes:**

| # | Location | What |
|---|----------|------|
| 1 | Lines 694-702 (`_tileEls.push`) | Add `auxEl: tile.aux_action ? el.querySelector('.tile-aux') : null` to the object literal |
| 2 | After line 751 (after `_evaluateVisibility`) | Add new `_updateAuxVisibility()` method. For each tile with `auxEl` and `config.aux_action.show_when`, call `_matchesShowWhen()` and toggle `auxEl.style.display` between `''` and `'none'` |
| 3 | Line 522 (in `set hass()`, after `this._evaluateVisibility()`) | Add call to `this._updateAuxVisibility()` |
| 4 | YAML configs (see below) | Add `show_when` block to the Manual tile's `aux_action` |

**YAML change — both files:**

`tunet-overview-config.yaml` lines 92-98 and `tunet-v2-test-config.yaml` lines 81-87:
Add `show_when` block to `aux_action` on the Manual tile. Condition: `input_number.oal_manual_brightness_offset` with operator `not_equals` and state `'0'`. This makes the "Reset" pill only appear when there's actually a manual brightness offset to reset.

**Note on Bug 1 interaction:** With Option B's uniform padding, the `has-aux` class no longer affects layout, so there's no need to toggle it in `_updateAuxVisibility()`. The class still exists for potential future CSS targeting but is layout-neutral.

---

### Bug 3: Weather AQI Not Present

**Files:**
- `Dashboard/Tunet/tunet-overview-config.yaml` **lines 245-259**
- `Dashboard/Tunet/tunet-v2-test-config.yaml` **lines 234-248**

**Root cause:** Both configs reference `sensor.aqi` which does not exist as a HA entity. The sensor card renders it as `?` with an orphan row.

**Fix:** Remove the entire `sensor.aqi` block (15 lines) from both files. This reduces the sensor card from 4 rows to 3. If `sensor.bedroom_temp_humidity_sensor_temperature` exists, it can be added as a replacement row. Otherwise, 3 rows (Living Room temp, Humidity, Outside temp) is a clean layout.

**Verification needed:** Confirm `sensor.bedroom_temp_humidity_sensor_temperature` exists before adding it as a replacement. If it doesn't exist, just delete the AQI block.

---

### Bug 4: UI Configuration Forms Not Working (All V2 Cards)

**Files:** All 12 V2 card files in `Dashboard/Tunet/Cards/v2/`

**Symptom:** None of the V2 cards display a visual configuration editor in the HA dashboard UI. Users see only the YAML editor.

**What the code does:** Every V2 card implements `static getConfigForm()` (see File Inventory table above for line numbers) returning `{ schema: [...], computeLabel: fn }`. Every card has `static get configurable() { return true; }`. Card registration via `registerCard()` in `tunet_base.js` (lines 740-752) correctly calls `customElements.define()` and pushes to `window.customCards`.

**Root cause investigation — three hypotheses:**

**Hypothesis A: HA version too old.** `getConfigForm()` was merged into HA frontend in PR #16142 (early 2025). If the user's HA instance predates this merge, the frontend won't look for this static method. The traditional pattern is `getConfigElement()` which returns a custom element.

*How to verify:* Check HA version in Settings → About. `getConfigForm()` requires HA 2025.2+ (approximate).

**Hypothesis B: Browser cache.** The community forum reports that config editors don't appear until:
- Resource URLs have a version parameter bumped (e.g., `?v=2` → `?v=3`)
- Browser DevTools "Disable cache" is enabled
- Hard refresh (Ctrl+Shift+R) is performed

*How to verify:* Bump resource version, hard refresh, try adding a card via the UI picker.

**Hypothesis C: Schema limitations for complex configs.** `getConfigForm()` can only express flat/simple schemas using HA selectors. Cards with complex nested configs (like the status card's `tiles` array with per-tile type-specific options) cannot be fully expressed in a `getConfigForm()` schema. For these cards, the basic fields (name, columns) would show up, but the complex nested config (tiles) would not be editable in the UI.

*This means:* Even if `getConfigForm()` works, it will only ever expose top-level scalar fields. The full config for cards like status, lighting (zones array), sensor (sensors array), rooms (rooms array) will still require YAML editing.

**Fix options (decide based on verification):**

| Option | Scope | Effort | Result |
|--------|-------|--------|--------|
| A: Verify HA version, bump cache | All cards | Trivial | If `getConfigForm()` IS supported, top-level fields become editable |
| B: Add `getConfigElement()` editors | Per card | Large (custom editor element per card) | Full visual editing including arrays |
| C: Accept YAML-only for complex cards | All cards | None | `getConfigForm()` for simple fields, YAML for arrays |

**Recommendation:** Start with Option A (verify + cache bust). If `getConfigForm()` works for basic fields, accept Option C for complex cards — YAML editing for `tiles`/`zones`/`sensors` arrays is fine since these are power-user configs. Full visual editors (Option B) would be a Phase 3+ effort.

**Key code locations per card:**

| Card | `configurable` | `getConfigForm()` | Schema fields exposed |
|------|:-:|:-:|---|
| `tunet_status_card.js` | Line 412 | Line 414 | name, columns, custom_css |
| `tunet_climate_card.js` | Line 628 | Line 630 | entity, humidity_entity, name, surface, display_min, display_max |
| `tunet_lighting_card.js` | Line 670 | Line 672 | (check schema — likely name, columns, layout, tile_size) |
| `tunet_actions_card.js` | Line 267 | Line 269 | variant, mode_entity, compact |
| `tunet_media_card.js` | Line 479 | Line 481 | (check schema) |
| `tunet_rooms_card.js` | Line 292 | Line 294 | (check schema) |
| `tunet_sensor_card.js` | Line 395 | Line 397 | (check schema) |
| `tunet_speaker_grid_card.js` | Line 444 | Line 446 | (check schema) |
| `tunet_sonos_card.js` | Line 576 | Line 578 | (check schema) |
| `tunet_weather_card.js` | Line 173 | Line 175 | (check schema) |
| `tunet_light_tile.js` | Line 764 | Line 766 | (check schema) |

---

## Phase 1: Foundation for Navigation

### 1a. `getGridOptions()` for Sections Layout Compatibility

**What:** Home Assistant Sections layout (introduced 2024) requires cards to implement `getGridOptions()` returning `{ columns, rows, min_columns, min_rows, max_columns, max_rows }`. Without this, cards either get wrong sizing or fail to render in Sections dashboards.

**Files:** All 12 V2 card files.

**Pattern (from HA docs):**
```js
getGridOptions() {
  return { columns: 4, rows: 'auto', min_columns: 2, max_columns: 4 };
}
```

Each card needs values appropriate to its layout:

| Card | Suggested columns | Suggested rows | Rationale |
|------|:-:|:-:|---|
| Status card | 4 | auto | Full-width 4-column grid |
| Lighting card | 4 | auto | Full-width zone grid |
| Climate card | 2 | auto | Half-width in environment row |
| Weather card | 2 | auto | Half-width in environment row |
| Actions card | 4 | 1 | Full-width single row strip |
| Media card | 4 | auto | Full-width player |
| Sensor card | 4 | auto | Full-width sparkline rows |
| Speaker grid | 4 | auto | Full-width speaker tiles |
| Rooms card | 4 | auto | Full-width room grid |
| Sonos card | 4 | auto | Full-width |
| Light tile | 1 | 1 | Single tile |

**Where to add:** After `getCardSize()` in each card. Most cards already have `getCardSize()` — search for it per card.

### 1b. Kiosk Mode Setup

**What:** Hide HA's native header, sidebar, and overflow menu for a dedicated dashboard tablet/kiosk experience.

**Dependency:** `kiosk-mode` HACS integration (verify installed).

**Config location:** Top of dashboard YAML view config.

**Implementation:** Add `kiosk_mode:` block to the dashboard view YAML. Settings: `kiosk: true` (or selective: `hide_header: true`, `hide_sidebar: true`).

### 1c. View Structure Skeleton

**What:** Create the multi-view dashboard structure with subview support.

**Current state:** Single view at `/tunet-overview` defined by `tunet-overview-config.yaml`.

**Target structure:**

```
/tunet-overview              (main view — overview cards)
/tunet-overview/living-room  (subview — living room detail)
/tunet-overview/kitchen      (subview — kitchen detail)
/tunet-overview/dining       (subview — dining room detail)
/tunet-overview/bedroom      (subview — bedroom detail)
/tunet-overview/office       (subview — office detail)
```

Each subview is defined in the dashboard's YAML with `subview: true`. The Tunet room cards or nav card provide navigation to these subviews via `tap_action: { action: navigate, navigation_path: /tunet-overview/living-room }`.

---

## Phase 2: Per-Room Subviews

### Room View Template Pattern

Every room view follows this section order. Sections with no relevant entity are **omitted entirely** — never empty shells.

```
1. Quick Actions Strip  (tunet-actions-card, room-scoped)
2. Lighting Controls    (tunet-lighting-card, individual lights as zones)
3. Climate              (tunet-climate-card, IF climate entity exists for room)
4. Media                (tunet-media-card, IF media_player exists for room)
5. Room Sensors         (tunet-status-card, 2-tile row: temp + humidity/motion)
```

### Room Entity Matrix

| Room | Lights | Climate | Media | Temp Sensor | Humidity | Motion |
|------|--------|:---:|:---:|---|---|---|
| **Living** | couch lamp, floor lamp, spots, credenza | `climate.dining_room` (shared) | `media_player.living_room` | `sensor.dining_room_temperature` | `weather.home` attr | TBD |
| **Kitchen** | island pendants, main, under-cabinet | — | `media_player.kitchen` | — | `sensor.kitchen_humidity` | TBD |
| **Dining** | spot lights, column lights | `climate.dining_room` | `media_player.dining_room` | `sensor.dining_room_temperature` | `weather.home` attr | TBD |
| **Bedroom** | main (Govee), accent (Govee), table lamps | — | `media_player.bedroom` | `sensor.bedroom_temp_humidity_sensor_temperature` | Verify: own entity or attribute? | TBD |
| **Office** | desk lamp (single light) | — | — | — | — | TBD |

### Per-Room Config Details

**Living Room** — Most complete room. All 5 sections present.
- Actions: All Off, Bedtime, Sleep (targeting `light.living_room_lights` and `input_select.oal_active_configuration`)
- Lighting: 4 zones (couch, floor, spots, credenza), `columns: 3`, `adaptive_entity: switch.adaptive_lighting_main_living`, `primary_entity: light.living_room_lights`
- Climate: `climate.dining_room` (shared open floor plan)
- Media: `media_player.living_room`, show progress, coordinator sensor
- Sensors: 2 tiles — temperature (dining room sensor, amber) + humidity (weather.home attribute, blue)

**Kitchen** — No climate, no temp sensor.
- Actions: All Off, All On (targeting `light.kitchen_island_lights`)
- Lighting: 3 zones (pendants, main, under-cabinet), `columns: 3`, `primary_entity: light.kitchen_island_lights`
- Media: `media_player.kitchen`
- Sensors: 2 tiles — humidity (`sensor.kitchen_humidity`) + outside temp (`weather.home` attribute)

**Dining Room** — Shared climate with living room.
- Actions: All Off (targeting `group.dining_lights` / `light.dining_room_spot_lights`)
- Lighting: 2 zones (spots, columns), `columns: 2`, `primary_entity: light.dining_room_spot_lights`
- Climate: `climate.dining_room` (same thermostat)
- Media: `media_player.dining_room`
- Sensors: 2 tiles — temperature + humidity

**Bedroom** — GOVEE lights (2700-6500K range, do NOT expose wide color temp controls).
- Actions: All Off, Bedtime, Sleep (targeting `light.bedroom_primary_lights`)
- Lighting: 3 zones (main, accent Govee, table lamps), `columns: 3`, `adaptive_entity: switch.adaptive_lighting_bedroom_primary`
- Media: `media_player.bedroom`
- Sensors: 2 tiles — temperature + humidity (verify: separate entity or attribute of temp sensor?)
- **Govee note:** The lighting card should not render color temp sliders for these devices (brightness only). This may require a per-zone `color_temp_control: false` config flag if not already supported.

**Office** — Minimal room. Single light, nothing else confirmed.
- Actions: Desk Off, Desk On (targeting `light.office_desk_lamp`)
- Light: Use standalone `tunet-light-tile` with `variant: horizontal` instead of wrapping a single light in the full lighting card grid. This signals "single-entity room" to future maintainers.
- No climate, media, or sensor sections.

### Entity Discovery Needed Before Deployment

| Entity | Status | How to verify |
|--------|--------|---------------|
| `sensor.bedroom_temp_humidity_sensor_humidity` | Unconfirmed — may be attribute of temp sensor | Check HA States page |
| `binary_sensor.*_motion` (all rooms) | Unconfirmed | Filter States page to `binary_sensor`, search "motion" |
| `sensor.kitchen_temperature` | Not found in config | Check States page |
| `light.office_desk_lamp` | Referenced in plan | Verify entity ID |
| `group.dining_lights` | Referenced for dining All Off | Verify exists |

### Rules for Sparse Rooms

| Condition | Approach |
|---|---|
| No media entity | Omit media card from room view |
| No climate entity | Omit climate card |
| Only 1 light | Use `tunet-light-tile` standalone, not lighting card |
| No temp sensor | Omit sensor status row |
| 2 lights, sparse look | Use `columns: 2` so tiles fill width |

---

## Phase 3: Navigation Card

### Architecture Decision: Bubble Card Pop-ups

**Decided:** Use Bubble Card hash-based pop-ups for all popups (room quick-controls, entity detail, alarm editing). This is consistent with the existing Sonos alarm popup system already working in the dashboard.

**Existing popup reference:** The Sonos alarm management popup (provided by user) demonstrates the full pattern:
- `#sonos-alarms` — overview popup with room-grouped alarm tiles
- `#edit-alarm` — detail editing popup with time, volume, recurrence controls
- Master-detail navigation via hash changes
- Full styling control via Bubble Card `styles:` + `card_mod:`

**Room popup pattern:**

```
Room tile tap → #living-room popup
  Shows: light toggles, media now-playing, quick scene buttons
  "Open Room ▸" button → navigates to /tunet-overview/living-room subview

Room tile long-press → navigates directly to subview
```

### Navigation Card (`tunet-nav-card`) — New Card

**Purpose:** Bottom navigation bar (mobile) / side rail (desktop) providing persistent navigation across views.

**Items (4 max for mobile bottom bar):**

| Position | Icon | Label | Action |
|----------|------|-------|--------|
| 1 | `home` | Home | Navigate to `/tunet-overview` |
| 2 | `meeting_room` | Rooms | Toggle `#rooms-menu` popup |
| 3 | `play_circle` | Media | Toggle `#media-overview` popup |
| 4 | `settings` | Settings | Navigate to `/tunet-overview/settings` or popup |

**Responsive behavior:**
- Mobile (< 768px): Fixed bottom bar, 56px height, safe-area padding
- Desktop (> 768px): Fixed left side rail, 72px width, vertical icon stack
- Active route highlighting via `window.location.pathname` comparison

**Media mini-player:** The nav bar includes a compact now-playing strip above the nav items (mobile) or below the nav icons (desktop). Shows: album art thumb, track name, play/pause button. Data source: the primary `media_player` entity. Tap expands to full media popup.

### Popup Definitions

All popups are defined as Bubble Card `card_type: pop-up` within the main overview view. Hash-based routing means they overlay the current view.

| Hash | Content | Notes |
|------|---------|-------|
| `#rooms-menu` | Grid of room tiles with status summaries | Tap → room popup, long-press → subview |
| `#living-room` | Quick controls for living room | Light toggles + media + "Open Room" link |
| `#kitchen` | Quick controls for kitchen | Same pattern |
| `#dining` | Quick controls for dining | Same pattern |
| `#bedroom` | Quick controls for bedroom | Same pattern |
| `#media-overview` | Speaker grid with group controls | Reuses tunet-speaker-grid-card |
| `#sonos-alarms` | Alarm management (existing) | Already built and working |
| `#edit-alarm` | Alarm detail editor (existing) | Already built and working |

---

## Phase 4: Polish and Integration

### Dark Mode Verification

All room subviews and popups must render correctly in both light and dark modes. The Midnight Navy dark theme tokens are locked (see design_language.md v8.0). User preference is `rgba(30,41,59,0.65)` dark blue glass.

### Responsive Testing

- Test nav card at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px+ (desktop)
- Verify popup content doesn't overflow on small screens
- Verify subview scrolling works correctly with fixed nav bar

### Performance

- Room subviews should load lazily (HA handles this for subviews)
- Popup content should not maintain state when closed
- Verify no duplicate `customElements.define` errors when navigating between views

---

## Execution Order

```
Phase 0: Bug Fixes (prerequisites)
  0.1  Bug 1 — Status tile uniform padding         [status_card.js lines 92, 177]
  0.2  Bug 2 — Aux button conditional visibility    [status_card.js + 2 YAML files]
  0.3  Bug 3 — Remove AQI sensor block              [2 YAML files]
  0.4  Bug 4 — Diagnose config editor issue          [verify HA version + cache]

Phase 1: Foundation
  1.1  Add getGridOptions() to all V2 cards          [12 files]
  1.2  Set up Kiosk Mode                             [dashboard YAML]
  1.3  Create view structure skeleton                [dashboard YAML — 5 subviews]

Phase 2: Room Subviews
  2.1  Entity discovery (motion sensors, bedroom humidity, etc.)
  2.2  Living Room subview config
  2.3  Kitchen subview config
  2.4  Dining Room subview config
  2.5  Bedroom subview config
  2.6  Office subview config

Phase 3: Navigation
  3.1  Build tunet-nav-card (bottom bar / side rail)
  3.2  Room quick-control popups (5 rooms)
  3.3  Media overview popup
  3.4  Nav card media mini-player
  3.5  Active route highlighting

Phase 4: Polish
  4.1  Dark mode verification across all views
  4.2  Responsive testing
  4.3  Performance audit
  4.4  Config editor improvements (if warranted)
```

---

## Reference: Sonos Alarm Popup Pattern

The working Sonos alarm system demonstrates the proven popup architecture:

**Key structural elements:**
- Bubble Card `card_type: pop-up` with `hash: "#sonos-alarms"` for routing
- Room-grouped separator headers with accent colors per room
- Horizontal-stack alarm tiles using Bubble Card `card_type: button` with `button_type: switch`
- `tap_action: toggle` for quick enable/disable
- `hold_action: perform-action` → `script.sonos_load_alarm_for_edit` for drill-down editing
- `card_mod` style overrides for Bubble Card elements
- Navigation between popups via `navigation_path: "#edit-alarm"` and `"#sonos-alarms"`

**Styling pattern:** Each alarm tile uses `card_mod` to zero-out `ha-card` background/border/shadow, then Bubble Card `styles:` for the actual tile appearance. Template expressions in `card_mod` (`content: '{{ state_attr(...) }}'`) display dynamic alarm time and recurrence.

This exact pattern should be replicated for room quick-control popups.

---

## Key Decisions Log

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | V2 ES module cards as active suite | V2 cards are what's being worked on, V1 stabilization plan is superseded |
| 2 | Bubble Card popups (not browser_mod) | Consistent with working Sonos alarm system, better styling control |
| 3 | `getConfigForm()` over `getConfigElement()` for now | Already implemented in all cards, verify before rewriting |
| 4 | Option B for tile sizing (uniform padding) | Removes conditional class entirely, zero layout disruption |
| 5 | YAML-only for complex card configs | `getConfigForm()` can't express nested arrays (tiles, zones, sensors) |
| 6 | Room subviews (not just popups) | Full room detail needs more space than a popup allows |
| 7 | Standalone `tunet-light-tile` for office | Single-entity room shouldn't use multi-zone lighting card |
