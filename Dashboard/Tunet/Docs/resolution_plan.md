     /home/mac/.claude/plans/frolicking-honking-fox.md

     Tunet Dashboard Card Suite — Complete Alt Card Review & Merge Plan

     1. PROJECT CONTEXT (read this first)

     What is Tunet?

     A custom Home Assistant dashboard built as vanilla JS custom elements
     (HTMLElement + Shadow DOM, no LitElement, no frameworks, no build tools). The
     cards render in HA's Chromium WebView via the Companion app and desktop browser.
      They provide Apple-level UI (frosted glass surfaces, drag-to-dim, scroll-snap)
     for controlling a sophisticated lighting automation system called OAL (Optimized
      Adaptive Lighting).

     File Structure

     Dashboard/Tunet/
     ├── Mockups/
     │   └── design_language.md          ← v8.0 — THE canonical design spec (every
     token, every rule)
     │   └── tunet-new-cards-v3.html     ← Multi-card visual mockup (status tiles,
     action chips, lighting grid)
     ├── Cards/
     │   ├── tunet_climate_card.js       ← GOLD STANDARD (v1.0.0, 1513 lines).
     Standard card surface.
     │   ├── tunet_climate_card_alt.js   ← ALT (v2.0.1, 1518 lines).
     Section-container surface variant.
     │   ├── tunet_lighting_card.js      ← ORIGINAL (v2.0.0, 685 lines). Grid-only,
     basic features.
     │   ├── tunet_flex_lighting.js      ← ALT (v3.0.1 Beta, 1581 lines).
     Grid+scroll, full features.
     │   ├── tunet_rooms_card.js         ← ORIGINAL (v1.0.0, 476 lines). Has room
     toggle.
     │   ├── tunet_rooms_card_alt.js     ← ALT (v2.0.0, 493 lines). Better tokens,
     but no toggle.
     │   ├── tunet_scenes_card.js        ← ORIGINAL (v1.0.0, 281 lines). Wrapping
     flex, uses <button>.
     │   ├── tunet_scenes_alt.js         ← ALT (v2.0.0, 426 lines). Scroll-snap
     pills, uses <div>.
     │   ├── tunet_media_card.js         ← Production Sonos card (1284 lines). No
     alt.
     │   ├── tunet_status_card.js        ← Status grid (803 lines). No alt. Needs
     token fixes.
     │   ├── tunet_actions_card.js       ← OAL chips (~285 lines). No alt.
     │   ├── tunet_weather_card.js       ← Weather display. No alt.
     │   ├── tunet_speaker_grid_card.js  ← Speaker grid. No alt.
     │   ├── tunet_header_card.js        ← Header. No alt.
     │   └── tunet_sensor_card.js        ← EMPTY placeholder (1 line).
     ├── tunet-overview-config.yaml      ← Dashboard card configs (actions + lighting
      + rooms currently)
     ├── tunet-design-system.md          ← OUTDATED v2.1 spec. SUPERSEDED by
     design_language.md v8.0.
     └── CLAUDE.md

     Two Surface Types

     The design language defines a standard "card" surface. The user has created alts
      that introduce a softer "section-container" surface. Both are intentional
     design variants:

     Standard Card Surface (used by: climate, media, status, actions)
     border-radius: var(--r-card);           /* 24px */
     background: var(--glass);               /* rgba(255,255,255, 0.68) light /
     rgba(44,44,46, 0.72) dark */
     backdrop-filter: blur(24px);
     border: 1px solid var(--ctrl-border);   /* token-driven, adapts to mode */
     box-shadow: var(--shadow), var(--inset); /* TWO-layer shadow + inset ring */

     Section-Container Surface (used by: lighting alt, rooms alt, scenes alt,
     climate alt)
     border-radius: 38px;                     /* NOTE: flex lighting uses 32px —
     INCONSISTENT */
     background: rgba(255,255,255, 0.35);     /* light — more transparent */
                     rgba(255,255,255, 0.05); /* dark — very subtle */
     backdrop-filter: blur(20px);             /* NOTE: flex lighting uses 24px —
     INCONSISTENT */
     border: 1px solid rgba(255,255,255, 0.08); /* hardcoded, not tokenized */
     box-shadow: 0 8px 40px rgba(0,0,0, 0.10); /* NOTE: flex lighting KEEPS inset
     ring, others DON'T */

     The Gold Standard

     tunet_climate_card.js (v1.0.0, 1513 lines) is THE quality bar. Its :host and
      :host(.dark) token blocks (lines 15-76) are pixel-identical to
     design_language.md v8.0. Every other card must match its token compliance,
     header pattern, surface treatment, interactions, and accessibility.

     Design Language v8.0 — Key Rules

     - Principle #3: Concentricity — radii nest inward: 38px section → 24px card
     → 16px tile → 10px button
     - Principle #5: Two-layer shadow physics — contact shadow (tight, high
     opacity) + ambient shadow (large blur, lower opacity). NEVER single-layer.
     - §5: Info-tile header — 42px min-height tappable container with
     --ctrl-bg/border/sh idle surface, entity icon (24×24, 6px radius), title
     (13px/700/--text-sub), subtitle (10.5px/600/--text-muted), fires
     hass-more-info on tap.
     - §11: Touch targets ≥ 42px for buttons, ≥ 44px for sliders.
     - §13: Editor must be static getConfigForm() — NEVER imperative editor
     class.

     HA Entity Inventory (what the cards read)

     - Lights: 16 in light.all_adaptive_lights group. 2 unavailable
     (light.living_room_corner_accent, light.living_column_strip_light_matter).
     - Adaptive Lighting: 7 AL switches (switch.adaptive_lighting_*), each with
      attributes.manual_control array (overridden light entity_ids).
     - OAL System: sensor.oal_system_status (gold mine: state + 10+
     attributes), input_select.oal_active_configuration (8 modes),
     sensor.oal_global_brightness_offset, etc.
     - Climate: climate.dining_room (heat_cool, 71°F, 27% humidity).
     - Weather: weather.home (partlycloudy).
     - Presence: binary_sensor.overall_main_presnce (typo in entity_id is
     permanent).

     Current Dashboard Config

     tunet-overview-config.yaml defines 3 cards:
     1. tunet-actions-card — zero-config (hardcoded OAL chips)
     2. tunet-lighting-card — uses light_group + light_overrides schema
     (ORIGINAL card schema)
     3. tunet-rooms-card — 5 rooms with light arrays and temp sensors

     Status card is NOT in the config yet.

     ---
     2. USER DECISIONS ALREADY MADE

     Decision: Section-container surface
     Choice: KEEP as a design variant
     Implication: Don't revert to
     ────────────────────────────────────────
     Decision: standard card surface on any alt
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Which cards get section-container
     Choice: ALL alts (lighting, rooms, scenes)
     Implication:
     ────────────────────────────────────────
     Decision: Climate stays standard by default, gets section option
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Climate card
     Choice: Use original, cherry-pick visual tweaks
     Implication: Add `surface:
     ────────────────────────────────────────
     Decision: 'section'` config option
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Rooms card
     Choice: Hybrid merge: alt styling + original controls
     Implication: Must restore room
     ────────────────────────────────────────
     Decision: toggle from original
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Scenes card
     Choice: Alt interaction style, fix config/sizing
     Implication: Must restore
     ────────────────────────────────────────
     Decision: <button> from original
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Lighting card
     Choice: Use flex, fix overflow + width
     Implication: Must fix tile sizing + add
     ────────────────────────────────────────
     Decision: config compat
     Choice:
     Implication:
     ────────────────────────────────────────
     Decision: Dark amber value
     Choice: #E8961E per v8.0 and gold standard
     Implication: NOT #F0A030 from
     ────────────────────────────────────────
     Decision: older production memory
     Choice:
     Implication:

     ---
     3. DECISIONS STILL NEEDED

     D1. Section-Container Standardization

     The implementations are INCONSISTENT across alts. Someone must decide on ONE
     spec:

     ┌───────────────┬────────────────────────────────┬─────────────────────────┐
     │   Property    │      Flex lighting (32px)      │   Other 3 alts (38px)   │
     ├───────────────┼────────────────────────────────┼─────────────────────────┤
     │ Border radius │ 32px                           │ 38px                    │
     ├───────────────┼────────────────────────────────┼─────────────────────────┤
     │ Inset ring    │ YES (var(--inset))             │ NO (lost)               │
     ├───────────────┼────────────────────────────────┼─────────────────────────┤
     │ Backdrop blur │ 24px (same as standard)        │ 20px                    │
     ├───────────────┼────────────────────────────────┼─────────────────────────┤
     │ Border        │ var(--ctrl-border) (tokenized) │ rgba(255,255,255, 0.08) │
     ├───────────────┼────────────────────────────────┼─────────────────────────┤
     │ (hardcoded)   │                                │                         │
     └───────────────┴────────────────────────────────┴─────────────────────────┘

     Option A: Use 38px / no inset / 20px blur (matches 3 of 4 alts, but violates
      Principle #5 on shadows)
     Option B: Use 32px / with inset / 24px blur (flex lighting's version, more
     spec-compliant, keeps shadow physics)
     Option C: Compromise — 38px radius, but restore inset ring and use tokenized
      border

     D2. Climate Card Section-Container Behavior

     Should the climate card:
     - (a) Stay standard-only (no section option) — simplest
     - (b) Get a surface: 'section' config option like the flex lighting card —
      most flexible
     - (c) Default to section-container — biggest change to gold standard

     D3. Status Card Surface

     The status card (not an alt, but needs refinement) — should it use:
     - (a) Standard card surface (like climate, its current surface)
     - (b) Section-container surface (to match the other "data display" cards)

     D4. Actions Card Surface

     Same question for the actions card — standard or section-container?

     ---
     4. COMPLETE ISSUE CATALOG

     CRITICAL — Breaks Functionality

     C1. Lighting Tile Overflow (tunet_flex_lighting.js)

     Symptom: In grid mode, tiles are SO LARGE they overflow the card container.
     Works fine in scroll mode with one row.

     Root cause — THREE contributing factors:

     (A) No grid row constraint. Lines 493-497:
     .light-grid {
       display: grid;
       grid-template-columns: repeat(var(--cols, 3), 1fr);
       gap: 10px;
     }
     No grid-auto-rows is set. CSS Grid defaults to grid-auto-rows: auto, meaning
      row height = content height. With aspect-ratio on children, "content" height =
     proportional to column width.

     (B) Unbounded aspect-ratio. Line 528:
     .l-tile {
       aspect-ratio: 1 / 0.95;
     }
     Tile height = width × 0.95. In a 3-column grid on a 400px card (360px content),
     each tile is ~113×107px — acceptable. But HA's masonry can give cards wider
     containers on desktop. At 600px width: tiles become ~183×174px each. At 800px:
     ~253×240px. The aspect-ratio scales without limit.

     (C) NaN columns. Line 883:
     const columns = config.columns != null ? Math.max(2, Math.min(5,
     Number(config.columns))) : 3;
     If config.columns is a non-numeric string (e.g., "three" from a YAML typo),
     Number("three") = NaN. Math.min(5, NaN) = NaN. Math.max(2, NaN) = NaN. CSS
      --cols: NaN invalidates repeat(NaN, 1fr) → browser falls back to single
     column. Single column at full width + aspect-ratio = massive tiles.

     (D) Dead max-rows constraint. Lines 500-503:
     :host([data-max-rows]) .light-grid {
       max-height: calc(var(--max-rows) * var(--tile-h, 120px) + (var(--max-rows) -
     1) * 10px);
       overflow: hidden;
     }
     References --tile-h which defaults to 120px but is NEVER SET in JS. The
     setConfig() method (line 926) sets --max-rows but not --tile-h. Even if it
      worked, overflow: hidden just clips — doesn't actually constrain tile size.

     Why scroll mode works: grid-auto-columns: calc(32% - 10px) fixes column
     width. Grid flows horizontally. Container height is bounded by the card.
     Overflow goes horizontal into scrollable area.

     Why original card has no overflow: tunet_lighting_card.js uses NO
     aspect-ratio. Tile height is content-determined: 44px icon + 14px name + 13px
     value + 4px bar + 24px padding ≈ 110px. Content-based sizing can't blow up.

     Fixes needed:
     1. NaN guard: const columns = Math.max(2, Math.min(5, Number(config.columns) ||  3)); — the || 3 catches NaN
     2. Add grid-auto-rows to .light-grid: grid-auto-rows: minmax(80px, 130px);
     3. Remove aspect-ratio in grid mode OR add max-height: 130px to .l-tile
     4. Set --tile-h in _buildGrid() to match actual tile height so max-rows
     works
     5. At 440px responsive breakpoint (line 700), aspect-ratio changes to 1/1.05
     (TALLER!) — should also be removed/capped

     C2. Registration Collisions

     All 4 alt/original pairs register the SAME custom element tag name:
     - tunet-lighting-card → both tunet_lighting_card.js and
     tunet_flex_lighting.js
     - tunet-climate-card → both tunet_climate_card.js and
     tunet_climate_card_alt.js
     - tunet-rooms-card → both tunet_rooms_card.js and tunet_rooms_card_alt.js
     - tunet-scenes-card → both tunet_scenes_card.js and tunet_scenes_alt.js

     customElements.define() can only be called ONCE per tag name. The second call
     throws DOMException: Failed to execute 'define' on 'CustomElements': the name "tunet-X-card" has already been used.

     Current state: Only originals are deployed to /config/www/tunet/ on the HA
      server (observation #6818). Alts exist only in the git repo. No collision is
     happening NOW, but it will if both files get deployed.

     Resolution: When promoting an alt to production:
     1. The alt file REPLACES the original filename (same element name stays)
     2. Only ONE JS file per custom element name exists on the server
     3. Delete or rename the old file to prevent double-loading
     4. Back up the old file with a .bak extension (not .js — HA would try to
     load it)

     C3. Lighting 400px Width Hard-Cap

     File: tunet_flex_lighting.js line 213: width: 400px; max-width: 100%;

     The lighting card is intended as the "hero" card — full-width at the top of the
     dashboard. A 400px cap prevents it from expanding on wider screens (tablets,
     desktop).

     The gold standard climate card uses width: 100% (no cap). The climate alt also
      uses width: 100%.

     Fix: Change to width: 100%; — remove the 400px cap.

     C4. Config Schema Mismatch — Lighting Card Swap Breaks Dashboard

     The current tunet-overview-config.yaml uses the ORIGINAL lighting card's
     config schema:
     - type: custom:tunet-lighting-card
       light_group: light.all_adaptive_lights     # ← original schema
       light_overrides:                            # ← original schema
         light.entryway_lamp:
           name: Entry
           icon: door_front

     The flex lighting card expects a COMPLETELY DIFFERENT schema:
     - type: custom:tunet-lighting-card
       entities:                                   # ← flex schema
         - light.all_adaptive_lights
       zones:                                      # ← flex schema
         - entity: light.entryway_lamp
           name: Entry
           icon: door_front

     Key differences:
     - light_group (string) → entities (array) — the group entity goes into the
     array
     - light_overrides (object keyed by entity_id) → zones (array of {entity,
     name, icon} objects)
     - light_overrides keys are entity_ids; zones have entity field
     - Flex requires at least one of entities or zones to be non-empty or it
     throws

     If you swap the JS but keep the old config, the flex card throws: "Define at least one entity via 'entities' or
     'zones'" — blank card.

     Fixes needed:
     1. Add a backward-compat shim in flex card's setConfig() that converts old
     format:
     // Backward compatibility with v2.0.0 config
     if (config.light_group && !hasZones && !hasEntities) {
       config.entities = [config.light_group];
       if (config.light_overrides) {
         config.zones = Object.entries(config.light_overrides).map(([entity, o])
     => ({
              entity, name: o.name, icon: o.icon
            }));
          }
        }
     2. Also update `tunet-overview-config.yaml` to the new schema (for clarity)

     ---

     ### HIGH — Significant UX/Functionality Gap

     #### H1. Rooms Alt Drops Master Toggle

     **File:** `tunet_rooms_card_alt.js` — the per-room toggle is COMPLETELY ABSENT.
     No DOM element, no CSS, no event handler.

     **Original behavior:** Each room has a 44×24px pill toggle (like iOS switch).
     Tap → turns all room lights on or off. The toggle checks `anyOn` (are any lights
      in this room on?) and calls either `light.turn_off` or `light.turn_on` on all
     room light entities. Toggle knob animates with `translateX(20px)`.

     **Why this matters:** Without the toggle, users must tap each light orb
     individually to turn off all lights in a room. With 4 lights in the living room,
      that's 4 taps instead of 1.

     **Fix:** Cherry-pick from `tunet_rooms_card.js`:
     - Toggle DOM creation (in `_buildRooms()`)
     - Toggle CSS (`.room-toggle`, `.room-toggle.on .knob { translateX(20px) }`)
     - Toggle event handler (click → check anyOn → call service for all room lights)
     - Toggle state update (in `_updateAll()` — set `.on` class based on any light
     being on)
     - Re-add `--toggle-off`, `--toggle-on`, `--toggle-knob` tokens to `:host` and
     `:host(.dark)` blocks

     #### H2. Scenes Alt Uses `<div>` Not `<button>` — Keyboard Inaccessible

     **File:** `tunet_scenes_alt.js` — scene tiles are created as `<div>` elements
     with `addEventListener('click', ...)`.

     **Problem:** `<div>` elements are:
     - NOT focusable (cannot Tab to them)
     - NOT activatable via keyboard (Enter/Space do nothing)
     - NOT announced by screen readers as interactive

     The original `tunet_scenes_card.js` uses `<button>` elements which are
     inherently:
     - Focusable
     - Activatable via Enter/Space
     - Announced as "button" by screen readers

     **Fix:** In the alt's DOM creation code, change `document.createElement('div')`
     to `document.createElement('button')` for scene tiles. Add `type="button"`
     attribute to prevent form submission behavior. Add `tabindex="0"` if using div
     (but `<button>` is preferred).

     #### H3. Scenes Dead `columns` Config + Wrong `getCardSize()`

     **File:** `tunet_scenes_alt.js`

     **Problem 1 — Dead config:** The card's `getConfigForm()` exposes a `columns`
     selector (2-4). `setConfig()` parses `config.columns` and sets `--cols` CSS
     property. BUT the `.scene-grid` CSS uses `display: flex` with `overflow-x: auto`
      and `scroll-snap-type: x mandatory` — it's a horizontal scrollable flex
     container, NOT a CSS grid. The `--cols` variable is never referenced in CSS. The
      `columns` config is vestigial from a grid-based design that was replaced with
     horizontal scroll.

     **Problem 2 — Wrong card size:** `getCardSize()` returns `1 + rows * 2` where
     `rows = Math.ceil(scenes.length / (columns || 3))`. With 6 scenes / 3 columns =
     2 rows → returns 5 → HA allocates ~250px. But the horizontal scroll layout is
     always ~1 row tall (~80-100px total with header). The card is allocated too much
      vertical space, creating empty whitespace below.

     **Fix:**
     1. Remove `columns` from `getConfigForm()` schema
     2. Remove `columns` parsing from `setConfig()` (or keep it but don't expose in
     editor)
     3. Change `getCardSize()` to return fixed `2` (header row + 1 scene row) for
     horizontal scroll layout

     #### H4. Lighting `getCardSize()` Under-Reports

     **File:** `tunet_flex_lighting.js` lines 972-974:
     ```js
     getCardSize() {
       const rows = Math.ceil(this._resolvedZones.length / (this._config.columns ||
     3));
       return 2 + rows * 2;
     }

     With 16 lights / 3 columns = 6 rows → returns 14 → HA allocates ~700px.
     But with aspect-ratio: 1/0.95 tiles, actual height = 6 × (tile_height + 10px
     gap) + header. If container is 500px wide, tiles are ~160px tall each → 6 × 170
     - 60px header ≈ 1080px. The card overflows its masonry slot.

     Fix: Either:
     (a) Calculate based on actual tile height: account for aspect-ratio and
     container width
     (b) Use a more conservative estimate: return 3 + rows * 3;
     (c) Fix the tile sizing first (C1), then the estimate becomes accurate for
     bounded tiles

     H5. Rooms Alt Drops hass-more-info Fallback

     File: tunet_rooms_card_alt.js — card click handler:
     - If navigate_path exists → navigates to that path
     - If navigate_path is empty → does nothing (dead click)

     Original behavior: If navigate_path is empty, card click fires
     hass-more-info event for the first light entity in the room. This opens HA's
     built-in entity detail dialog.

     Fix: Cherry-pick the fallback from original:
     if (room.navigate_path) {
       // navigate
     } else if (room.lights && room.lights.length) {
       this.dispatchEvent(new CustomEvent('hass-more-info', {
         bubbles: true, composed: true,
         detail: { entityId: room.lights[0].entity }
       }));
     }

     H6. Rooms Alt Chevron Not Independently Wired

     File: tunet_rooms_card_alt.js — the chevron icon (chevron_right) renders
      but has no separate click handler.

     Original behavior: Chevron has its own addEventListener('click', ...) with
      event.stopPropagation(). This means clicking the chevron navigates, but
     clicking the card body could do something else (like hass-more-info).

     In the alt: The entire room row handles navigation. Clicking anywhere on the
      row (including the chevron) navigates. The chevron is purely decorative — it
     visually implies "tap here to navigate" but the entire row does the same thing.

     Severity: LOW — the row-level click works fine. The missing independent
     chevron handler only matters if the card body should do something different from
      the chevron (which it doesn't in the current design).

     Fix: Optional — can keep row-level click or restore independent chevron. Not
      critical.

     ---
     MEDIUM — Correctness/Polish

     M1. Climate Alt — Intentional Design Variant, Not "No Benefit"

     The climate alt's section-container is an intentional aesthetic direction:
     - 38px radius → more rounded, modern iOS widget feel
     - More transparent bg → lets wallpaper show through
     - Softer blur → more organic
     - Muted glass stroke → less aggressive edge highlight

     The alt's JS is byte-for-byte identical to the original (same events, services,
     state, ARIA, editor). The ONLY differences are ~6 CSS surface properties on
     .card.

     Recommendation: Don't cherry-pick individual properties. Instead, add the
     section-container as a surface: 'section' config option on the climate card
     (exactly like the flex lighting card implements it at lines 264-293). This gives
      the user the choice without changing the default standard surface.

     M2. Section-Container Inconsistency Across Alts

     Four implementations exist, and they DON'T MATCH:

     | Property | Flex lighting (lines 268-293) | Climate alt (lines 118-129) | Rooms
      alt (lines 79-90) | Scenes alt (lines 98-104) |
     |----------|------|------|------|------|
     | Radius | 32px | 38px | 38px | 38px |
     | Inset ring | var(--inset) ✓ | LOST | LOST | LOST |
     | Blur | 24px | 20px | 20px | 20px |
     | Border | var(--ctrl-border) | hardcoded rgba(255,255,255,0.08) | hardcoded
      | hardcoded |
     | Glass stroke light | 0.40/0.06/0.01/0.14 | 0.40/0.06/0.01/0.14 | matches
     spec per mode | 0.40/0.06/0.01/0.14 |
     | Shadow layers | TWO (ambient + inset) | ONE (ambient only) | ONE | ONE |

     This MUST be standardized before shipping. See Decision D1 above.

     M3. Token Values Wrong in Scenes Alt

     File: tunet_scenes_alt.js — these token values deviate from
     design_language.md v8.0:

     ┌───────────────────────┬────────────────────────┬────────────────────────┐
     │         Token         │    Current (wrong)     │    Should be (v8.0)    │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │ --green-fill light    │ rgba(52,199,89, 0.10)  │ rgba(52,199,89, 0.12)  │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │ --green-border light  │ rgba(52,199,89, 0.22)  │ rgba(52,199,89, 0.15)  │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │ --green-border dark   │ rgba(48,209,88, 0.25)  │ rgba(48,209,88, 0.18)  │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │ --purple-border light │ rgba(175,82,222, 0.22) │ rgba(175,82,222, 0.18) │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │                       │                        │                        │
     ├───────────────────────┼────────────────────────┼────────────────────────┤
     │ --purple-border dark  │ rgba(191,90,242, 0.25) │ rgba(191,90,242, 0.22) │
     └───────────────────────┴────────────────────────┴────────────────────────┘

     Also wrong in rooms alt:

     ┌────────────────────┬───────────────────────┬───────────────────────┐
     │       Token        │        Current        │       Should be       │
     ├────────────────────┼───────────────────────┼───────────────────────┤
     │ --green-fill light │ rgba(52,199,89, 0.10) │ rgba(52,199,89, 0.12) │
     └────────────────────┴───────────────────────┴───────────────────────┘

     M4. Scenes Header Always Amber

     File: tunet_scenes_alt.js — header icon orb uses
     --amber-fill/--amber-border always, regardless of state.

     v8.0 §5 says: Idle controls use --ctrl-bg/border/sh. Only ACTIVE controls
     use accent fills.

     Fix: Change header icon orb to use --ctrl-bg, --ctrl-border, --ctrl-sh
      by default.

     M5. Scenes Header Title Wrong Size

     File: tunet_scenes_alt.js — header title is 14px weight 700.

     v8.0 §5 says: Header title is 13px weight 700.

     Fix: Change font-size: 14px to font-size: 13px in .section-title.

     M6. Entity Unavailability Not Visually Indicated

     Two lights are permanently unavailable: light.living_room_corner_accent,
     light.living_column_strip_light_matter. All cards render unavailable entities
     as "off" with no visual distinction. Users can't tell if a light is off vs
     broken.

     Affects: Lighting card (tiles), Rooms card (orbs).

     Fix: When entity.state === 'unavailable':
     - Reduce tile/orb opacity to 0.35
     - Show --text-muted icon color
     - Optional: add a small warning dot or strikethrough on the name

     M7. Timer/Cooldown Cleanup

     Multiple cards create timers that could fire after the element disconnects:
     - Flex lighting: _cooldownTimers (per-entity, 1500ms each) — not cleared
     in disconnectedCallback()
     - Rooms alt: _serviceCooldown map entries — not cleared
     - Climate (both): _debounceTimer, _cooldownTimer — not cleared

     Fix: In each card's disconnectedCallback(), clear all pending timers:
     disconnectedCallback() {
       // ... existing cleanup ...
       if (this._cooldownTimers) {
         for (const t of Object.values(this._cooldownTimers)) clearTimeout(t);
       }
     }

     M8. Config Migration for Overview YAML

     When swapping the lighting card, tunet-overview-config.yaml MUST be updated
     because the config schemas differ (see C4).

     Rooms card: Same rooms array schema in both original and alt. No migration
      needed.

     Scenes card: Same scenes array schema in both original and alt. No
     migration needed.

     Only the lighting card needs config migration.

     New lighting config should look like:
     - type: custom:tunet-lighting-card
       name: Lighting
       surface: section              # section-container surface
       adaptive_entity: switch.adaptive_lighting_main_living
       primary_entity: sensor.oal_system_status   # for info-tile tap → more-info
       layout: grid                  # or 'scroll' for horizontal mode
       columns: 3
       entities:
         - light.all_adaptive_lights  # auto-expands to 16 member lights
       zones:                         # name/icon overrides (merged with expanded
     entities)
         - { entity: light.entryway_lamp, name: Entry, icon: door_front }
         - { entity: light.living_room_floor_lamp, name: Floor Lamp, icon: floor_lamp
      }
         - { entity: light.office_desk_lamp, name: Office, icon: desk_lamp }
         - { entity: light.living_room_corner_accent, name: Corner, icon: lightbulb }
         - { entity: light.living_room_couch_lamp, name: Couch, icon: table_lamp }
         - { entity: light.living_room_credenza_light, name: Credenza, icon:
     shelf_auto }
         - { entity: light.kitchen_island_pendants, name: Island, icon: light }
         - { entity: light.kitchen_counter_cabinet_underlights, name: Counter, icon:
     countertops }
         - { entity: light.master_presence, name: Bedroom, icon: bed }
         - { entity: light.master_bedroom_corner_accent_govee, name: Bed Accent,
     icon: nightlight }
         - { entity: light.dining_room_spot_lights, name: Dining Spots, icon:
     highlight }
         - { entity: light.living_room_spot_lights, name: Spots, icon: highlight }
         - { entity: light.kitchen_main_lights, name: Kitchen, icon: light }
         - { entity: light.living_room_hallway_lights, name: Hallway, icon: light }
         - { entity: light.living_column_strip_light_matter, name: Living Column,
     icon: view_column }
         - { entity: light.dining_column_strip_light_matter, name: Dining Column,
     icon: view_column }

     M9. Service Call Error Handling

     No card handles failed hass.callService() calls. With optimistic UI in the
     rooms alt (toggle class immediately before server confirms), a failed call
     leaves the UI in the wrong state until the next state change.

     Fix (low effort): Add .catch() that reverts optimistic state:
     this._hass.callService('light', 'toggle', { entity_id }).catch(() => {
       orb.classList.toggle('on'); // revert
     });

     M10. -webkit-backdrop-filter Prefix

     The climate original (gold standard) does NOT have -webkit-backdrop-filter
     (line ~111). iOS Safari/HA Companion WebView may not render the glass effect.

     Cards with prefix: flex lighting (line 218), climate alt (line 125), rooms
     alt, scenes alt.
     Cards WITHOUT prefix: climate original, status, actions, media, rooms
     original, scenes original.

     Fix: Add -webkit-backdrop-filter: blur(Xpx); alongside every
     backdrop-filter declaration.

     M11. Rooms Alt Lost Deep Config Normalization

     Original setConfig() (lines ~270-300): Normalizes every room and light
     with defaults:
     rooms: (config.rooms || []).map(r => ({
       name: r.name || 'Room',
       icon: r.icon || 'meeting_room',
       temperature_entity: r.temperature_entity || '',
       navigate_path: r.navigate_path || '',
       lights: (r.lights || []).map(l => ({
         entity: l.entity || '',
         icon: l.icon || 'lightbulb',
         name: l.name || ''
       }))
     }))

     Alt setConfig(): Stores config.rooms directly with no normalization.
     Uses runtime || fallbacks in _buildRooms(). This is fragile — if a room
     config object is malformed (e.g., missing lights key), the runtime fallback
     room.lights || [] prevents a crash but doesn't provide defaults for nested
     objects.

     Fix: Restore the original's deep normalization in the alt's setConfig().

     ---
     ADDITIONAL GAPS (from validation tracker)

     A1. Status Card Tile Keyboard Accessibility

     File: tunet_status_card.js — interactive tiles (indicator, dropdown,
     value) are <div> elements with click listeners. No tabindex, no role, no
     keyboard activation. Users cannot Tab to tiles or activate them with
     Enter/Space.

     Fix: Add tabindex="0" and role="button" (or role="listbox" for
     dropdown tiles). Add keydown listener for Enter/Space activation. Add
     focus-visible outline CSS.

     A2. Sensor Card Row Keyboard Accessibility

     File: tunet_sensor_card.js (1004 lines, v1.0.0 — NOT empty!) — sensor rows
      are <div class="sensor-row"> with click listeners and cursor: pointer. They
      have data-interaction attributes for click behavior (more_info, navigate,
     none). But no keyboard semantics: no tabindex, no role, no Enter/Space
     handling.

     Additionally: Sensor card has extensive token drift from v8.0:
     - --shadow light: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04) →
     should be 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10)
     - --shadow dark: 0 1px 2px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10) →
     should be 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28)
     - --amber dark: #F0A030 → should be #E8961E
     - --tile-bg dark: rgba(255,255,255,0.08) → should be rgba(44,44,46,0.90)
     - --text-sub dark: 0.55 → should be 0.50
     - --ctrl-bg light: rgba(255,255,255,0.75) → should be
     rgba(255,255,255,0.52)
     - Missing --glass, --glass-border, --inset, --r-card tokens entirely
     - Uses section-container surface with v2.1-era shadows

     A3. Rooms Alt Cooldown Creates Stale UI Windows

     File: tunet_rooms_card_alt.js — the cooldown guard skips ALL entity
     updates during the 1500ms cooldown window (returns early from _updateAll()).
     If a light changes state for ANY reason during that window (automation, another
     user, timer), the UI shows stale state until cooldown expires.

     Fix: The cooldown should only skip updates for the SPECIFIC entity that was
     just toggled, not all entities. Check _serviceCooldown[entity_id] per-entity
     instead of returning early from the entire update loop.

     A4. customElements.get() Guard — Smarter Registration

     Instead of relying on file deletion to prevent collisions (C2), add a guard
     before customElements.define():

     if (!customElements.get('tunet-X-card')) {
       customElements.define('tunet-X-card', TunetXCard);
     }

     This makes registration idempotent — loading both files doesn't crash, the first
      one wins silently. Should be added to ALL card registrations.

     LOW — Cleanup/Documentation

     L1. Climate (both): ResizeObserver created in _setupListeners() but
     never .disconnect()ed in disconnectedCallback().

     L2. All cards: Missing color-scheme: light / color-scheme: dark
     declaration in :host blocks per v8.0.

     L3. Climate (both): Missing --green-fill and --green-border tokens. Fan
     button uses hardcoded rgba(52,199,89,...) values.

     L4. Font injection race: All cards check
     document.querySelector('link[href*="DM+Sans"]') before injecting. If 5+ cards
     initialize in the same frame, all checks pass before any link is appended →
     duplicate <link> elements.

     L5. Flex lighting: Missing adaptive toggle long-press (500ms →
     hass-more-info). Original has this, flex doesn't.

     L6. Flex lighting: "All Off" uses N individual light.turn_off calls.
     Original uses a single batch call with entity_id: [array].

     L7. Flex lighting: Floating pill uses solid var(--tile-bg) background.
     Original uses var(--glass) + backdrop-filter: blur(20px) for a glass effect.
      The glass blur is visually richer.

     ---
     5. CARD-BY-CARD IMPLEMENTATION

     Card 1: Lighting — USE FLEX + 8 fixes

     Production file: Dashboard/Tunet/Cards/tunet_lighting_card.js (replace
     current with modified flex)
     Source file: Dashboard/Tunet/Cards/tunet_flex_lighting.js

     #: 1
     Fix: NaN columns guard (C1-C)
     Type: Bug fix
     Source: Add || 3 after
     ────────────────────────────────────────
     #: Number(config.columns)
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 2
     Fix: Grid tile sizing (C1-A,B)
     Type: Bug fix
     Source: Add grid-auto-rows, remove/cap
     ────────────────────────────────────────
     #: aspect-ratio
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 3
     Fix: Set --tile-h (C1-D)
     Type: Bug fix
     Source: Set in _buildGrid() based on tile_size
     ────────────────────────────────────────
     #: config
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 4
     Fix: Remove 400px width cap (C3)
     Type: Bug fix
     Source: width: 100% instead of `width:
     ────────────────────────────────────────
     #: 400px`
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 5
     Fix: Config backward compat (C4)
     Type: Feature
     Source: Shim
     ────────────────────────────────────────
     #: light_group/light_overrides → entities/zones
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 6
     Fix: Fix getCardSize() (H4)
     Type: Bug fix
     Source: Account for actual tile height
     ────────────────────────────────────────
     #: 7
     Fix: Add long-press on adaptive (L5)
     Type: Cherry-pick
     Source: From original: 500ms →
     ────────────────────────────────────────
     #: hass-more-info
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 8
     Fix: Batch All Off (L6)
     Type: Cherry-pick
     Source: From original: single service call with
     ────────────────────────────────────────
     #: entity array
     Fix:
     Type:
     Source:

     Also: Update overview config YAML (M8). Standardize section-container per D1
      decision.

     Card 2: Rooms — HYBRID MERGE (alt base + 5 cherry-picks)

     Production file: Dashboard/Tunet/Cards/tunet_rooms_card.js (replace
     current with modified alt)
     Source file: Dashboard/Tunet/Cards/tunet_rooms_card_alt.js

     #: 1
     Fix: Restore room toggle (H1)
     Type: Cherry-pick
     Source: From original: DOM, CSS, handler,
     ────────────────────────────────────────
     #: state update, toggle tokens
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 2
     Fix: Restore hass-more-info fallback (H5)
     Type: Cherry-pick
     Source: From original: card
     ────────────────────────────────────────
     #: click fallback
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 3
     Fix: Deep config normalization (M11)
     Type: Cherry-pick
     Source: From original: setConfig()
     ────────────────────────────────────────
     #: normalization
     Fix:
     Type:
     Source:
     ────────────────────────────────────────
     #: 4
     Fix: Fix --green-fill (M3)
     Type: Token fix
     Source: 0.10 → 0.12
     ────────────────────────────────────────
     #: 5
     Fix: Timer cleanup (M7)
     Type: Bug fix
     Source: Clear cooldowns in disconnectedCallback

     No config migration needed — same rooms schema.

     Card 3: Scenes — ALT BASE + 6 fixes

     Production file: Dashboard/Tunet/Cards/tunet_scenes_card.js (replace
     current with modified alt)
     Source file: Dashboard/Tunet/Cards/tunet_scenes_alt.js

     ┌────────────────────┬─────────────────────────────────┬─────────────┬──────────────────────────────────────┐
     │         #          │               Fix               │    Type     │                Source                │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 1                  │ <div> → <button> (H2)           │ Cherry-pick │ From original: semantic,             │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ focusable elements │                                 │             │                                      │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 2                  │ Remove dead columns config (H3) │ Bug fix     │ Remove from editor,                  │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ setConfig, CSS     │                                 │             │                                      │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 3                  │ Fix getCardSize() (H3)          │ Bug fix     │ Return fixed 2 for horizontal scroll │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 4                  │ Fix token values (M3)           │ Token fix   │ green-border, purple-border,         │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ green-fill         │                                 │             │                                      │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 5                  │ Header idle surface (M4)        │ Design fix  │ --ctrl-bg/border/sh instead of       │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ amber              │                                 │             │                                      │
     ├────────────────────┼─────────────────────────────────┼─────────────┼──────────────────────────────────────┤
     │ 6                  │ Header title size (M5)          │ Design fix  │ 14px → 13px                          │
     └────────────────────┴─────────────────────────────────┴─────────────┴──────────────────────────────────────┘

     Also: Restore full getConfigForm() scene repeater from original (entity
     picker + name + icon + accent).

     Card 4: Climate — KEEP ORIGINAL + add section option

     Production file: Dashboard/Tunet/Cards/tunet_climate_card.js (keep, add
     feature)
     Source file: Dashboard/Tunet/Cards/tunet_climate_card_alt.js (for
     reference only)

     #: 1
     Fix: Add surface: 'section' option (M1)
     Type: Feature
     Details: Add section-container CSS
     ────────────────────────────────────────
     #: overrides like flex lighting lines 264-293
     Fix:
     Type:
     Details:
     ────────────────────────────────────────
     #: 2
     Fix: Add -webkit-backdrop-filter (M10)
     Type: Bug fix
     Details: Prefix for iOS Safari
     ────────────────────────────────────────
     #: 3
     Fix: Disconnect ResizeObserver (L1)
     Type: Cleanup
     Details: In disconnectedCallback
     ────────────────────────────────────────
     #: 4
     Fix: Add --green-fill/--green-border (L3)
     Type: Token fix
     Details: For fan button

     ---
     6. IMPLEMENTATION ORDER

     1. Lighting card (highest impact, most complex)
     2. Rooms card (hybrid merge)
     3. Scenes card (accessibility + cleanup)
     4. Climate card (add section option + minor fixes)

     Deployment Per Card

     # 1. Back up original on server
     ssh root@homeassistant.local 'cp /config/www/tunet/tunet_X_card.js
     /config/www/tunet/backups/tunet_X_card.v2.bak'

     # 2. Deploy new file (same filename as original)
     scp Dashboard/Tunet/Cards/tunet_X_card.js
     root@homeassistant.local:/config/www/tunet/

     # 3. Hard-refresh dashboard
     # User: Ctrl+Shift+R in browser

     ---
     7. VERIFICATION CHECKLIST

     Every card:

     - Renders in light mode with visible surface
     - Renders in dark mode with visible surface (NOT invisible)
     - Dark amber is #E8961E (not #F0A030)
     - Section-container surface consistent (same radius, blur, inset across all
     section cards)
     - prefers-reduced-motion kills all animations
     - No console errors on load

     Lighting-specific:

     - Grid mode: tiles fit within card at ANY container width (no overflow)
     - Grid mode with columns: "invalid" → falls back to 3 columns (NaN guard)
     - Scroll mode: horizontal scroll-snap, pagination dots sync to position
     - Drag-to-dim: 4px threshold, floating pill appears, brightness updates
     - Adaptive toggle: tap toggles switch, long-press opens more-info
     - Manual override: red badge shows count of manually-controlled lights
     - All Off: single service call (check HA dev tools → services log)
     - Old config format (light_group/light_overrides) still works via compat
      shim
     - width: 100% — card expands to fill container on desktop

     Rooms-specific:

     - Room toggle present (44×24px pill per room)
     - Room toggle tap → all room lights on/off
     - Orb toggle → individual light, immediate visual feedback + 1500ms cooldown
     - Card click with navigate_path → navigates
     - Card click without navigate_path → opens hass-more-info for first light
     - Temperature shows regardless of light state
     - Temperature unit reads from entity (°F/°C)

     Scenes-specific:

     - Tab through scenes with keyboard → focus-visible outline
     - Enter/Space on focused scene → activates (service call)
     - Horizontal scroll-snap on touch/trackpad
     - Active scene highlighted (persists until next click)
     - No columns option in card editor
     - Card height correct in masonry (no excess whitespace)

     Climate-specific:

     - Default: standard card surface (24px, glass, two-layer shadow)
     - With surface: section: section-container surface renders correctly
     - Glass effect visible on iOS Safari (backdrop-filter with -webkit prefix)

     "/plan open" to edit this plan in VS Code