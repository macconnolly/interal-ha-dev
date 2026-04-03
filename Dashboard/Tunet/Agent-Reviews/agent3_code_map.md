# Agent 3: Comprehensive Codebase Map — Post-CD1
**Branch:** main @ c718b93
**Generated:** 2026-04-03
**Scope:** tunet_base.js + 13 v3 cards (sole implementation authority)
**Purpose:** CD2-CD4 consistency-driven pass execution reference

---

## 1. FILE METRICS SUMMARY

| File | Lines | Exports | Methods | Lifecycle | getGridOptions |
|------|-------|---------|---------|-----------|-----------------|
| **tunet_base.js** | 1847 | 40 | 114 | N/A | N/A |
| tunet_actions_card.js | 504 | — | 42 | 0 | ✓ static |
| tunet_climate_card.js | 1453 | — | 118 | 2 | ✓ static |
| tunet_light_tile.js | 916 | — | 74 | 2 | ✓ static |
| tunet_lighting_card.js | 1943 | — | 202 | 2 | ✓ static |
| tunet_media_card.js | 1271 | — | 106 | 2 | ✓ static |
| tunet_nav_card.js | 562 | — | 49 | 2 | ✓ static |
| tunet_rooms_card.js | 1440 | — | 148 | 2 | ✓ static |
| tunet_scenes_card.js | 596 | — | 42 | 0 | ✓ static |
| tunet_sensor_card.js | 960 | — | 105 | 2 | ✓ static |
| tunet_sonos_card.js | 1383 | — | 121 | 2 | ✓ static |
| tunet_speaker_grid_card.js | 1104 | — | 90 | 2 | ✓ static |
| tunet_status_card.js | 1651 | — | 171 | 2 | ✓ static |
| tunet_weather_card.js | 909 | — | 97 | 1 | ✓ static |
| **TOTAL** | **16,539** | **40** | **1,519** | **23** | **13** |

**Largest cards by method count:** lighting_card (202), status_card (171), rooms_card (148)
**Largest cards by LOC:** lighting_card (1943), base (1847), status_card (1651)

---

## 2. INTERACTION DEBT — CD2 REMEDIATION TARGETS

### 2.1 Transition: all Instances (41 total)

Unguarded `transition: all` declarations across 11 cards. **CD2 action:** Replace with explicit property transitions (opacity, transform, box-shadow) to avoid painting/layout thrashing.

| Card | Count | Line Numbers | Priority |
|------|-------|--------------|----------|
| tunet_actions_card.js | 1 | 216 | Medium |
| tunet_climate_card.js | 5 | 113, 136, 192, 236, 319 | High |
| tunet_light_tile.js | 1 | 152 | Medium |
| tunet_lighting_card.js | 5 | 200, 224, 304, 428, 580 | High |
| tunet_media_card.js | 8 | 56, 67, 108, 168, 241, 262, 281, 342 | High |
| tunet_rooms_card.js | 5 | 139, 204, 235, 403, 448 | High |
| tunet_sensor_card.js | 3 | 98, 124, 160 | High |
| tunet_sonos_card.js | 3 | 131, 156, 312 | High |
| tunet_speaker_grid_card.js | 3 | 108, 116, 235 | High |
| tunet_status_card.js | 3 | 211, 535, 609 | High |
| tunet_weather_card.js | 3 | 63, 114, 181 | Medium |

**Note:** tunet_base.js has 0 `transition: all` — good baseline for shared styles.

---

### 2.2 Unguarded :hover Selectors (2 instances)

**Missing @media (hover: hover) protection** for touch device handling.

| Card | Count | Line Numbers | Selectors |
|------|-------|--------------|-----------|
| tunet_lighting_card.js | 2 | 203, 310, 437 | `.info-tile:hover`, `.toggle-btn:hover`, `.l-tile:hover` |

**Action:** Wrap all `:hover` blocks in `@media (hover: hover) { ... }` to prevent hover-on-touch issues.

---

### 2.3 Hardcoded Press Scale Values (56 total hardcoded)

**Should use var(--press-scale) or var(--press-scale-strong)** for consistency.

| Card | Hardcoded Count | Example Values | Severity |
|------|---|---|---|
| tunet_media_card.js | 10 | .90, .97, .98, 1.08 | **Critical** |
| tunet_status_card.js | 9 | .95, .97, 1.08 | **Critical** |
| tunet_climate_card.js | 8 | .94, .97, .98, 1.08 | **Critical** |
| tunet_sonos_card.js | 6 | .90, .97, 1.06 | High |
| tunet_rooms_card.js | 5 | 0.90, 0.94, 0.95, 0.96 | High |
| tunet_speaker_grid_card.js | 4 | .97, .98, 1.03 | High |
| tunet_lighting_card.js | 4 | .94, .98 | High |
| tunet_base.js | 4 | 0.97, 1 (keyframes) | High |
| tunet_sensor_card.js | 2 | 0.97, 0.99 | Medium |
| tunet_weather_card.js | 1 | .98 | Medium |
| tunet_scenes_card.js | 1 | 0.96 | Medium |
| tunet_light_tile.js | 1 | 1.05 | Medium |
| tunet_actions_card.js | 1 | .96 | Medium |

**Base token contract:** `--press-scale: 0.96` (standard), `--press-scale-strong: 0.94` (strong feedback)

---

### 2.4 Missing :focus-visible on Interactive Elements

**Focus handling matrix:**

| Card | Interactive Elements | Has :focus-visible Rules | Gap | Status |
|------|---|---|---|---|
| tunet_media_card.js | 14 | 0 | **14** | **CRITICAL** |
| tunet_sonos_card.js | 10 | 0 | **10** | **CRITICAL** |
| tunet_status_card.js | 6 | 3 | 3 | High |
| tunet_climate_card.js | 6 | 1 | **5** | **CRITICAL** |
| tunet_weather_card.js | 5 | 0 | **5** | **CRITICAL** |
| tunet_lighting_card.js | 4 | 11 | 0 | OK |
| tunet_rooms_card.js | 4 | 3 | 1 | Good |
| tunet_speaker_grid_card.js | 3 | 3 | 0 | OK |
| tunet_nav_card.js | 1 | 3 | 0 | OK |
| tunet_sensor_card.js | 1 | 3 | 0 | OK |
| tunet_scenes_card.js | 1 | 3 | 0 | OK |
| tunet_actions_card.js | 1 | 3 | 0 | OK |
| tunet_base.js | 1 | 15 | 0 | OK |
| tunet_light_tile.js | 0 | — | — | N/A |

**CD2 action:** Add `:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }` to all interactive elements (buttons, tiles with click handlers, etc.)

---

### 2.5 -webkit-tap-highlight-color Usage

**Status:** ALL 14 files MISSING this property.

**Action:** Add to root `:host { -webkit-tap-highlight-color: transparent; }` or shared card surface styles to suppress default mobile tap flash.

**Location:** Should be added in CARD_SURFACE or RESET exports in tunet_base.js, or per-card overrides.

---

## 3. SEMANTICS DEBT — CD3 ACCESSIBILITY TARGETS

### 3.1 Click-Only Interactive Elements

Handlers registered via `addEventListener('click', ...)` without corresponding keyboard semantics (role, tabindex, or button elements).

| Card | Click Handlers | Pattern | Severity |
|------|---|---|---|
| tunet_media_card.js | 14 | Modal/dropdown close handlers, speaker selection, volume buttons | High |
| tunet_sonos_card.js | 10 | Album art expand, volume overlay, action buttons | High |
| tunet_climate_card.js | 6 | Fan mode, temperature slider thumb, mode selection | High |
| tunet_status_card.js | 6 | Alarm snooze, info tile, dropdown menu | High |
| tunet_speaker_grid_card.js | 3 | Info tile, group button | Medium |
| tunet_rooms_card.js | 4 | Room tile, toggle/reset buttons | Medium |
| tunet_lighting_card.js | 3 | Info tile, adaptive toggle | Medium |
| tunet_weather_card.js | 5 | Info tile, view mode buttons | Medium |
| tunet_sensor_card.js | 1 | Sensor list interaction | Low |
| tunet_nav_card.js | 1 | Navigation button | Low |
| tunet_scenes_card.js | 1 | Scene chip activation | Low |
| tunet_actions_card.js | 1 | Action chip handler | Low |

**Total click handlers:** 56 across all cards

**CD3 Action:** 
- Add `role="button"` + `tabindex="0"` to div/span elements with click handlers
- Implement `keydown` handler for Enter/Space key navigation
- Ensure all controls exposed via keyboard

---

### 3.2 cursor:pointer Without Keyboard Semantics

**Direct count:** 44 instances across all cards.

| Card | Instances | Lines | Examples |
|------|---|---|---|
| tunet_media_card.js | 9 | 56, 108, 138, 168, 241, 262, 281, 342, (+ 1 merged) | Info tile, buttons, controls |
| tunet_sonos_card.js | 6 | 131, 156, 195, 266, 387, (+ 1 merged) | Transport, volume, source |
| tunet_speaker_grid_card.js | 3 | 108, 157, 401 | Info tile, group button, action |
| tunet_base.js | 3 | 1078, 1155, 1223 | Shared drag/modal patterns |
| tunet_status_card.js | 4 | 210, 401, 503, 616 | Tile, dropdown, alarm |
| tunet_rooms_card.js | 4 | 138, 203, 402, 448 | Section/room buttons, toggles |
| tunet_climate_card.js | 4 | 112, 191, 235, 284 | Header, fan, mode buttons |
| tunet_lighting_card.js | 3 | 199, 303, 415 | Info tile, toggle, drag |
| tunet_sensor_card.js | 2 | 93, 123 | Section, action buttons |
| tunet_weather_card.js | 2 | 63, 113 | Info tile, view button |
| tunet_light_tile.js | 1 | 74 | Tile interaction |
| tunet_nav_card.js | 1 | 71 | Navigation item |
| tunet_scenes_card.js | 1 | 177 | Scene chip |
| tunet_actions_card.js | 1 | 215 | Action chip |

**Problem:** All `cursor: pointer` indicates clickable intent, but many lack proper role/tabindex attributes.

**CD3 Action:** Audit each and add semantic attributes (role="button", tabindex="0", aria-pressed for toggles).

---

### 3.3 Custom Sliders Missing Semantics

**No custom `role="slider"` implementations found** — climate card and speaker card use native `<input type="range">` which is semantic.

**Status:** No critical semantic slider gaps (likely using HTML5 native sliders).

---

## 4. SIZING DEBT — CD4 RESPONSIVE ARCHITECTURE TARGETS

### 4.1 Legacy Profile Usage (selectProfileSize/resolveSizeProfile)

**Status:** 7 cards + base still using profile resolver contract (marked for supersession Apr 2, 2026).

| Card | selectProfileSize | resolveSizeProfile | _setProfileVars | Status |
|------|---|---|---|---|
| tunet_base.js | ✓ export | ✓ export | ✓ export | Supplier |
| tunet_light_tile.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |
| tunet_lighting_card.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |
| tunet_rooms_card.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |
| tunet_sensor_card.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |
| tunet_speaker_grid_card.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |
| tunet_status_card.js | ✓ used | ✓ used | ✓ used | **Depends on profiles** |

**Migration path (CD4):** Replace with explicit `tile_size` config + ResizeObserver-driven `:host([tile-size="compact|standard|large"])` CSS blocks.

**Action:** Leave legacy code in place for now; incremental removal during active surface assembly tranche.

---

### 4.2 ResizeObserver Usage

**Used for:** Dynamic width-based sizing, responsive layout adjustments.

| Card | Has ResizeObserver | Purpose | Lines |
|------|---|---|---|
| tunet_light_tile.js | ✓ 7 refs | Tile size resolution on container resize | ~300-400 |
| tunet_lighting_card.js | ✓ 7 refs | Column layout, tile size adjustment | ~500-700 |
| tunet_rooms_card.js | ✓ 7 refs | Section grid responsiveness | ~400-600 |
| tunet_sensor_card.js | ✓ 7 refs | Card width-based sizing | ~200-300 |
| tunet_speaker_grid_card.js | ✓ 7 refs | Grid responsiveness | ~300-500 |
| tunet_status_card.js | ✓ 7 refs | Tile layout, width-aware rendering | ~300-400 |
| tunet_climate_card.js | ✓ 1 ref | Minimal resize handling | ~50-100 |
| All others | — | Static sizing or no resize logic | — |

**Status:** Good coverage on responsive cards. Non-responsive cards (actions, nav, scenes, weather) don't need ResizeObserver.

---

### 4.3 getGridOptions Return Patterns

All cards implement static getGridOptions() with Sections-native parameters.

| Card | columns | min_columns | rows | min_rows | max_rows | Notes |
|------|---------|-------------|------|----------|----------|-------|
| tunet_actions_card.js | 12 | 6 | auto | 1 | — | Full width action row |
| tunet_climate_card.js | 6 | 3 | auto | 3 | — | 2-column layout |
| tunet_light_tile.js | 3 | 3 | auto | 1 | 4 | Narrow tile (for grids) |
| tunet_lighting_card.js | 12 | 6 | auto | 2 | 12 | Full-width, tall |
| tunet_media_card.js | 12 | 6 | auto | 2 | — | Full-width music player |
| tunet_nav_card.js | full | 6 | auto | 1 | — | Navigation (full width) |
| tunet_rooms_card.js | 12 | 6 | auto | 2 | 12 | Full-width section list |
| tunet_scenes_card.js | 12 | 6 | auto | 1 | — | Action row |
| tunet_sensor_card.js | 12 | 6 | auto | 2 | 12 | Full-width sensor grid |
| tunet_sonos_card.js | 12 | 6 | auto | 2 | — | Full-width music player |
| tunet_speaker_grid_card.js | 12 | 6 | auto | 2 | 12 | Full-width speaker grid |
| tunet_status_card.js | 12 | 6 | auto | 2 | 12 | Full-width status grid |
| tunet_weather_card.js | 6 | 3 | auto | 3 | — | 2-column weather |

**Pattern:** 
- **Full-width (columns: 12):** lighting, media, rooms, scenes, sensor, sonos, speaker, status, actions
- **2-column (columns: 6):** climate, weather
- **Narrow tile (columns: 3):** light_tile only
- **Special (columns: full):** nav_card

**Config-aware return:** NO — all return static values. CD4 should not modify this; getGridOptions is a declaration, not runtime-responsive.

---

### 4.4 Forced Height/Sizing Issues

**Detected:** Line-by-line analysis of grid-auto-rows, fixed min-height, and px-based sizing.

| Card | Hardcoded Heights | Pattern | Severity |
|------|---|---|---|
| tunet_media_card.js | 19 | Track heights, button heights, volume display | Medium |
| tunet_climate_card.js | 16 | Mode button grid, fan button sizing | Medium |
| tunet_speaker_grid_card.js | 15 | Speaker tile grid, button grid | Medium |
| tunet_lighting_card.js | 12 | Adaptive info, tile sizes | Medium |
| tunet_sonos_card.js | 11 | Volume overlay, album art, controls | Medium |
| tunet_nav_card.js | 5 | Nav item sizing | Low |
| tunet_scenes_card.js | 7 | Chip sizing | Low |
| tunet_weather_card.js | 7 | Weather icon sizing | Low |
| tunet_sensor_card.js | 1 | Minimal hardcoding | Low |
| tunet_rooms_card.js | 0 | Intrinsic sizing ✓ | Good |
| tunet_status_card.js | 0 | Intrinsic sizing ✓ | Good |
| tunet_light_tile.js | 2 | Minimal hardcoding | Good |
| tunet_actions_card.js | 0 | Intrinsic sizing ✓ | Good |

**Note:** rooms_card and status_card do NOT force heights (good baseline).

---

## 5. IMPORTS & SHARED PATTERNS — CROSS-REFERENCE MAP

### 5.1 Imports from tunet_base.js (Per Card)

**All imports use version query string: `from './tunet_base.js?v=20260309g7'`**

| Card | Import Count | Key Exports | Pattern |
|------|---|---|---|
| tunet_actions_card.js | 14 | TOKENS, RESET, ICON_BASE, CARD_SURFACE, runCardAction | Basic card + action runner |
| tunet_climate_card.js | 11 | TOKENS, RESET, CARD_SURFACE, renderConfigPlaceholder | Basic card + config UI |
| tunet_light_tile.js | 28 | TOKENS_MIDNIGHT, TILE_SURFACE, selectProfileSize, resolveSizeProfile, _setProfileVars, createAxisLockedDrag | **Profile-heavy + drag** |
| tunet_lighting_card.js | 12 | TOKENS, RESET, selectProfileSize, resolveSizeProfile, _setProfileVars, createAxisLockedDrag | **Profile-heavy + drag** |
| tunet_media_card.js | 11 | TOKENS, RESET, CARD_SURFACE, renderConfigPlaceholder | Basic card + config UI |
| tunet_nav_card.js | 11 | TOKENS, RESET, normalizePath, navigatePath | Navigation + routing |
| tunet_rooms_card.js | 14 | TOKENS, RESET, SECTION_SURFACE, selectProfileSize, resolveSizeProfile, _setProfileVars, navigatePath, runCardAction | Section + routing + actions |
| tunet_scenes_card.js | 8 | TOKENS, RESET, CARD_SURFACE | Basic card only |
| tunet_sensor_card.js | 10 | TOKENS, RESET, SECTION_SURFACE, selectProfileSize, resolveSizeProfile, _setProfileVars | Section + profiles |
| tunet_sonos_card.js | 12 | TOKENS, RESET, CARD_SURFACE, clamp, renderConfigPlaceholder | Basic card + math |
| tunet_speaker_grid_card.js | 15 | TOKENS, RESET, selectProfileSize, resolveSizeProfile, _setProfileVars, createAxisLockedDrag | **Profile-heavy + drag** |
| tunet_status_card.js | 12 | TOKENS, RESET, selectProfileSize, resolveSizeProfile, _setProfileVars, runCardAction | **Profile + actions** |
| tunet_weather_card.js | 12 | TOKENS, RESET, CARD_SURFACE, renderConfigPlaceholder | Basic card + config UI |

**Shared export summary from tunet_base.js (40 total):**

**CSS/Design (8 exports):**
- TOKENS, TOKENS_MIDNIGHT, RESET, BASE_FONT, ICON_BASE
- CARD_SURFACE, CARD_SURFACE_GLASS_STROKE, SECTION_SURFACE, TILE_SURFACE
- HEADER_PATTERN, CTRL_SURFACE, DROPDOWN_MENU, REDUCED_MOTION, RESPONSIVE_BASE, FONT_LINKS

**Profile contract (7 exports):** — **Marked for supersession**
- PROFILE_SCHEMA_VERSION, FAMILY_KEYS, SIZE_KEYS, PRESET_FAMILY_MAP
- PROFILE_BASE, SIZE_PROFILES, TOKEN_MAP, OVERRIDE_PAIRS
- selectProfileSize, resolveSizeProfile, _setProfileVars, autoSizeFromWidth, bucketFromWidth

**Core utilities (14 exports):**
- injectFonts, detectDarkMode, applyDarkClass, fireEvent
- normalizePath, navigatePath, runCardAction
- createAxisLockedDrag, renderConfigPlaceholder
- registerCard, logCardVersion, clamp

---

### 5.2 Shared Patterns Across Card Families

#### Media Coordinators (speaker/music cards)
**Cards:** tunet_media_card.js, tunet_sonos_card.js, tunet_speaker_grid_card.js

**Shared pattern:**
- Coordinator-based media state sync
- Volume overlay + transport controls
- Dropdown/modal for source/player selection
- Document-level click handler for close modal

**Common debt:** 
- tunet_media_card: 10 hardcoded scales, 14 click handlers
- tunet_sonos_card: 6 hardcoded scales, 10 click handlers
- tunet_speaker_grid_card: 4 hardcoded scales, 3 click handlers

#### Profile-dependent Responsive Cards
**Cards:** tunet_light_tile.js, tunet_lighting_card.js, tunet_speaker_grid_card.js, tunet_rooms_card.js, tunet_sensor_card.js, tunet_status_card.js

**Shared pattern:**
- selectProfileSize() + resolveSizeProfile() + _setProfileVars()
- ResizeObserver for dynamic width-based sizing
- Hand-tuned `:host([tile-size="..."])` CSS variants

**Common debt:** All use legacy profile contract (superseded Apr 2, 2026)

#### Drag-enabled Cards
**Cards:** tunet_light_tile.js, tunet_lighting_card.js, tunet_speaker_grid_card.js (+ createAxisLockedDrag in base)

**Shared pattern:**
- createAxisLockedDrag() from tunet_base.js
- Thumb/slider interaction
- Constrained motion (X or Y axis only)

**Verified:** Drag implementation is consistent across cards.

---

## 6. SUMMARY & CD2-CD4 HANDOFF

### Consistency-Driver Pass Readiness

**CD2 (Interaction Debt) — READY TO BEGIN:**
- 41 `transition: all` instances require property-specific transitions
- 2 unguarded `:hover` selectors need @media protection
- 56 hardcoded press scales need var(--press-scale) substitution
- 56 click handlers need keyboard semantics (role, tabindex, keydown)
- ALL 14 files need `-webkit-tap-highlight-color: transparent`
- Cards with focus gaps: climate (5), media (14), sonos (10), weather (5)

**CD3 (Semantics Debt) — SCOPED:**
- Add role="button" + tabindex="0" + keydown handlers to 56 click-only elements
- Audit cursor:pointer usage (44 instances) for role assignments
- No critical slider gap found (native HTML5 sliders are semantic)

**CD4 (Sizing Debt) — PLANNED FOR SURFACE ASSEMBLY:**
- Legacy profile contract stays for now (7 cards depend on it)
- ResizeObserver coverage is good (8 cards have it where needed)
- getGridOptions() returns are all static and correct
- Forced heights present but not critical (medium severity)
- Full migration path deferred to active surface tranche

### Execution Order Recommendation

1. **CD2a:** Add -webkit-tap-highlight-color to all cards (10 min, automated)
2. **CD2b:** Replace transition: all with property-specific transitions (media/lighting/climate/rooms first — 4 high-severity cards)
3. **CD2c:** Guard all :hover with @media (hover: hover) (2 cards)
4. **CD2d:** Substitute hardcoded scales with var(--press-scale) (all 13 cards, media/status/climate priority)
5. **CD2e:** Add :focus-visible to all interactive elements (media/sonos/climate/weather priority)
6. **CD3:** Semantic audit + role/tabindex/keydown implementation (media/sonos/climate/rooms priority)
7. **CD4:** Deferred to surface assembly (when active card family moves to surface composition)

### Critical Dependencies
- tunet_base.js exports (40) are stable — no modification needed pre-CD2
- Profile contract (7 exports) superseded but still functional — removal is incremental
- All cards follow Sections-native interface (getGridOptions) — no contract change needed

---

**Report Generated:** 2026-04-03 | **Status:** Ready for CD2 implementation team
