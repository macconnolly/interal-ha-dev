# Tunet Dashboard Card Suite — Session Start Document

**Read this first. Then read the files it points to. Then build.**

---

## What This Is

A custom Home Assistant dashboard called **Tunet** — a suite of vanilla JS custom elements (HTMLElement + Shadow DOM, no frameworks, no build tools) that provide Apple-level UI for controlling a sophisticated lighting automation system (OAL) and other home devices. Cards render in HA's Chromium WebView via the Companion app and desktop browser.

## Where Everything Lives

```
Dashboard/Tunet/
├── Mockups/
│   └── design_language.md          ← THE canonical design spec (v8.0). Every token, every rule.
│   └── tunet-new-cards-v3.html     ← Multi-card mockup (status tiles, action chips, lighting grid)
│   └── living_room_scrollable_mockup.html  ← Scroll-mode lighting mockup
├── Cards/
│   ├── tunet_climate_card.js       ← GOLD STANDARD (1513 lines). Match this quality.
│   ├── tunet_media_card.js         ← Production Sonos card (1284 lines). Study the patterns.
│   ├── tunet_status_card.js        ← Status grid (803 lines). Needs refinement.
│   ├── tunet_lighting_card.js      ← Light tiles + drag-to-dim (685 lines). Needs scroll mode.
│   ├── tunet_actions_card.js       ← OAL quick actions (~200 lines). Needs polish.
│   ├── tunet_rooms_card.js         ← Room capsules (~400 lines). Needs polish.
│   ├── tunet_sensor_card.js        ← EMPTY placeholder (1 line).
│   ├── tunet_weather_card.js       ← Weather display. Exists.
│   ├── tunet_scenes_card.js        ← Scene chips. Exists.
│   └── tunet_header_card.js        ← Header. Exists.
├── tunet-overview-config.yaml      ← Dashboard card config (actions + lighting + rooms currently)
├── tunet-design-system.md          ← OLDER design spec (v2.1). SUPERSEDED by design_language.md v8.0.
└── CLAUDE.md                       ← Memory context for this directory
```

**The single most important file is `Dashboard/Tunet/Mockups/design_language.md` (v8.0).** It defines every token, surface, header pattern, control, animation, shadow, and interaction rule. All cards must comply with it. When any other document or card code contradicts it, design_language.md v8.0 wins.

---

## The Gold Standard

`tunet_climate_card.js` (v1.0.0, 1513 lines) is the quality bar. Every other card must match its level of:

- **Token compliance**: Its `:host` and `:host(.dark)` blocks are pixel-identical to design_language.md v8.0 §2.1/§2.2
- **Header pattern**: Uses the §5 info-tile pattern (42px tappable entity identifier with icon + title + subtitle)
- **Surface treatment**: Glass + `::before` XOR stroke + inset ring + two-layer shadows everywhere
- **Interaction**: 4px drag threshold, three-part thumb (stroke/disc/dot), press feedback, keyboard support
- **Accessibility**: ARIA roles, `prefers-reduced-motion`, focus-visible outlines
- **State system**: `data-action` attributes driving accent color across all controls uniformly
- **Editor**: `static getConfigForm()` — no imperative editor class

When building any card, open the climate card side-by-side and ask: "Does my card match this standard?"

---

## The Correct Token Values

**DO NOT use `tunet-design-system.md` v2.1 values. They are outdated.**

The canonical tokens are in `design_language.md` v8.0 §2.1 (light) and §2.2 (dark). The climate card implements them correctly. Here are the critical ones that other cards get wrong:

### Light Mode (`:host`)
```css
--glass: rgba(255,255,255, 0.68);           /* NOT 0.55 */
--shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);  /* NOT 4px/12px */
```

### Dark Mode (`:host(.dark)`)
```css
--glass: rgba(44,44,46, 0.72);              /* NOT rgba(255,255,255,0.06), NOT rgba(30,41,59,0.65) */
--shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);  /* NOT 4px/12px */
--tile-bg: rgba(44,44,46, 0.90);            /* NOT rgba(255,255,255,0.08) */
--amber: #E8961E;                            /* design_language.md v8.0 value */
--text-sub: rgba(245,245,247, 0.50);        /* NOT 0.55 */
```

### Known Drift Per Card

| Card | Light `--glass` | Dark `--glass` | Dark `--tile-bg` | Dark `--shadow` |
|------|----------------|----------------|-------------------|-----------------|
| climate (gold) | 0.68 | rgba(44,44,46,0.72) | n/a | Correct |
| media | 0.68 | rgba(44,44,46,0.72) | n/a | Correct |
| status | **0.55** | **rgba(255,255,255,0.06)** | **rgba(255,255,255,0.08)** | **Wrong values** |
| lighting | **0.55** | **rgba(255,255,255,0.06)** | **rgba(255,255,255,0.08)** | **Wrong values** |
| actions | needs audit | **rgba(255,255,255,0.06)** | n/a | needs audit |
| rooms | needs audit | **rgba(255,255,255,0.06)** | n/a | needs audit |

**Bold = wrong. Fix to match climate card / design_language.md v8.0.**

---

## Header Pattern (§5 of design_language.md)

Every card must use this header:

```
[Info tile: icon + title + subtitle] [flex spacer] [Toggle(s)...] [Selector btn]
```

The **info tile** is a 42px-min-height tappable container with:
- `--ctrl-bg` / `--ctrl-border` / `--ctrl-sh` idle surface (same as all header controls)
- 24x24 entity icon (6px radius, color-only accent, no background)
- Title: 13px/700/`--text-sub`
- Subtitle: 10.5px/600/`--text-muted` with ellipsis, inline accent spans for state
- Tap fires `hass-more-info`
- Active: accent fill/border when entity is doing something

**Most cards currently DON'T have this header pattern.** The climate card does. It's the reference.

---

## Card Architecture Patterns

Every Tunet card follows this exact skeleton:

```javascript
const VERSION = '1.0.0';
const STYLES = `...`;  // All CSS in template literal

class TunetXxxCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    TunetXxxCard._injectFonts();  // Static, idempotent
  }

  connectedCallback() { /* attach listeners, ResizeObserver */ }
  disconnectedCallback() { /* cleanup */ }

  static _injectFonts() { /* DM Sans + Material Symbols to document.head */ }
  static getConfigForm() { /* Declarative schema for HA editor */ }
  static getStubConfig() { /* Default config */ }

  setConfig(config) { /* Normalize + store config, reset caches */ }
  set hass(hass) { /* Dark mode toggle, change detection, _render() or _update() */ }
  getCardSize() { /* Return row count for HA layout */ }

  _render() { /* Create DOM once */ }
  _update() { /* Sync DOM with entity states */ }
}

customElements.define('tunet-xxx-card', TunetXxxCard);
window.customCards.push({ type: 'tunet-xxx-card', ... });
console.info(`%c TUNET-XXX %c v${VERSION} `, ...);
```

Key conventions:
- Change detection: `oldHass.states[entity] !== hass.states[entity]` (reference equality)
- Dark mode: `hass.themes.darkMode` → toggle `.dark` on `:host`
- Events: `new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } })`
- No LitElement, no build tools, no external dependencies beyond Google Fonts CDN

---

## HA Entity Inventory (What the Cards Can Read)

### OAL System (Lighting Automation)

**GOLD MINE: `sensor.oal_system_status`** — Single entity with entire system state:
- `state`: "Environmental Boost" / "Active" / "Manual Override" / etc.
- `attributes.active_configuration`: "Adaptive"
- `attributes.lights_on`: 13, `lights_total`: 16
- `attributes.override_count`: 0
- `attributes.active_modifiers`: `[{"name": "Partlycloudy", "value": 9}]`
- `attributes.sun_phase`: "morning"
- `attributes.tv_mode_active`, `movie_mode_active`, `sleep_mode_active`

**Input Selects:**
- `input_select.oal_active_configuration` — Options: Adaptive, Full Bright, Dim Ambient, Warm Ambient, TV Mode, TV Bridge, Sleep, Manual
- `input_select.oal_mode_timeout_state` — idle / armed / expired
- `input_select.oal_tv_autofollow_gate` — Off, Night + Presence, Always Follow, Ask First

**Input Booleans (22 total):** `oal_system_paused`, `oal_environmental_boost_enabled`, `oal_night_dimming_enabled`, `oal_disable_sleep_mode` (=on, sleep disabled), `oal_mode_timeout_enabled`, TV policy flags, locks, column RGB flags, test mode

**Input Numbers (20 total):**
- Offset pipeline (display): `oal_offset_environmental_brightness` (+9%), sunset, night, config offsets
- Per-zone manual offsets: 7 zones, all at 0.0
- Controls: `oal_control_zonal_timeout_hours` (4h), `oal_control_transition_speed` (0.3s)

**Sensors:**
- `sensor.oal_global_brightness_offset` — state: "+9%", `total_offset`=9, `average_zone_brightness`=77
- `sensor.oal_real_time_monitor` — per-zone baseline, effective min/max, manual offset
- `sensor.oal_environmental_debug` — `lux_current`=1489, `weather_current`="partlycloudy"
- 7 per-zone status sensors (e.g., `sensor.oal_zone_status_main_living`) with `brightness_target`, `color_temp_kelvin`, `lights_total`

### Lights
- `light.all_adaptive_lights` — 16 members, `attributes.entity_id` gives the array
- Individual lights: Hue lamps (color temp), Govee accent (2700-6500K safe range), column strips (Matter), brightness-only lights
- **2 unavailable:** `light.living_room_corner_accent`, `light.living_column_strip_light_matter`

### Adaptive Lighting (HACS)
- 7 AL switches (`switch.adaptive_lighting_*`), all `on`
- Each exposes: `attributes.manual_control` (array of overridden light entity_ids), `min_brightness`, `max_brightness`, `min_color_temp_kelvin`, `max_color_temp_kelvin`
- Regex to find main switches: `^switch\.adaptive_lighting_(?!sleep_mode_|adapt_)(.+)$`

### Climate
- `climate.dining_room` — heat_cool, `current_temperature`=71, `hvac_action`=cooling, `current_humidity`=27%

### Media
- `media_player.living_room` (Sonos Soundbar, paused), `media_player.kitchen` (Sonos), `media_player.dining_room`, `media_player.bath`, `media_player.bedroom` (unavailable)
- `input_select.hero_media_player_target` = `media_player.living_room`

### Environment
- `weather.home` — partlycloudy, temp=16, humidity=62%, cloud_coverage=82%
- `sun.sun` — above_horizon, elevation=26.01, rising=true

### Presence
- `person.mac_connolly` — Home
- `binary_sensor.couch_presence` — on (TV watching)
- `binary_sensor.overall_main_presnce` — on (occupancy)

---

## Current State of Each Card

### Status Card (`tunet_status_card.js`, 803 lines, v2.0.0)
**What works:** 4 tile types (indicator/timer/value/dropdown), conditional visibility, real-time timer countdown, inline dropdown with 140ms enter animation and overflow flip, dot rules, change detection, glass + XOR stroke.

**What's wrong:**
- Tokens are wrong (see drift table above). Light `--glass` is 0.55, dark `--glass` is near-invisible 0.06, dark `--tile-bg` is transparent 0.08
- Header is just "icon + title" — needs the §5 info-tile pattern with subtitle
- Missing `--ctrl-bg`/`--ctrl-border`/`--ctrl-sh` on controls (Principle #6 unified idle surfaces)
- Card border uses `var(--ctrl-border)` but other structural tokens don't match v8.0
- Dropdown menu `backdrop-filter` is `blur(24px)` — matches v8.0 (this is correct)
- Missing `--purple` token pair
- Not in the overview config yet — no tiles configured
- Tile `--dd-bg` in light mode is `0.92` — v8.0 says `0.84`

### Lighting Card (`tunet_lighting_card.js`, 685 lines, v2.0.0)
**What works:** Drag-to-dim with floating pill, group auto-expansion from `light.all_adaptive_lights`, manual override red dots via AL switch scanning, adaptive pill (tap=toggle, long-press=more-info), All Off button, change detection with AL cache (10s TTL).

**What's wrong:**
- Same token drift as status card
- No responsive scroll mode (16 lights = ~13 HA units on mobile)
- Header is custom (not §5 info-tile pattern)
- Drag threshold is 4px (correct for grid mode) but needs 250ms hold-to-lock for scroll mode
- Service debounce is 300ms per entity — missing the 1500ms cooldown guard the media card has
- No `connectedCallback`/`disconnectedCallback` (no cleanup of timers/observers)
- OFF tiles don't dim to 0.55 opacity
- Drag scale is 1.05 (v8.0 §10.2 says 1.05 for tiles — this is actually correct)
- Icon orb radius is 10px (should audit against v8.0 — §3.8 says icon container is 6px)

### Actions Card (`tunet_actions_card.js`, ~200 lines, v1.0.0)
**What works:** 4 hardcoded OAL chips (All On, Pause, Sleep, All Off), proper service calls.

**What's wrong:**
- Token drift (same issues)
- Active chip missing `background: var(--amber-fill)` (only has border + color, not the full triad)
- No §5 header pattern
- Touch targets may be undersized

### Rooms Card (`tunet_rooms_card.js`, ~400 lines, v1.0.0)
**What works:** Per-room capsules with icon orb, info stack, light orbs, toggle, chevron.

**What's wrong:**
- Token drift
- Missing per-room adaptive lighting toggle button (36x36px)
- Touch targets undersized
- `navigate_path` destinations don't exist yet
- No §5 header pattern

---

## Design Decisions Made This Session

1. **Quality bar**: Climate card is THE reference. Match it.
2. **Canonical spec**: `design_language.md` v8.0 supersedes `tunet-design-system.md` v2.1
3. **Header pattern**: All cards get the §5 info-tile header (42px, tappable, entity-driven)
4. **Approach**: Design-to-build, one card at a time, sequential
5. **Current focus**: Status card refinement first
6. **Config flexibility**: Full flexibility in tile layout, add constraints later
7. **Entity config**: Support rich per-entity YAML, entity list + group expansion, and named zones

### Token Decisions (CORRECTED)
The earlier session proposed "blue variant" dark glass `rgba(30,41,59,0.65)` — this was based on the outdated v2.1 design system. The CORRECT value per v8.0 (and per the gold standard climate card) is:
- Dark `--glass: rgba(44,44,46, 0.72)` (neutral gray)
- Dark `--amber: #E8961E` (v8.0 value; production memory says `#F0A030` but climate card uses `#E8961E`)

**When in doubt, match the climate card. It matches design_language.md v8.0.**

---

## How to Build a Card Right

1. **Read `design_language.md` v8.0** — every section relevant to your card
2. **Read the mockup** — `tunet-new-cards-v3.html` has the status grid, action chips, lighting grid
3. **Read the climate card** — understand how it implements every spec
4. **Audit the existing card** against BOTH the mockup AND design_language.md v8.0 — not just tokens but header, surfaces, shadows, interactions, typography, spacing, accessibility
5. **List every gap** between current code and the target
6. **Fix everything** — tokens, header, surfaces, interactions, ARIA, reduced motion, responsive
7. **Run the §14 preflight checklist** from design_language.md

The climate card was built by:
1. Starting from an HTML mockup
2. Extracting every CSS value, interaction, and animation
3. Building production JS that matches the mockup pixel-for-pixel
4. Verifying against the design language at every step

Every card must go through this same process.

---

## Important HA Facts

- **Sleep mode is disabled** at both levels (`input_boolean.oal_disable_sleep_mode`=on AND sleep schedule automation=off). UI can show it but it won't do anything.
- **Movie mode handler is `unavailable`**. Related UI should be disabled/hidden.
- **2 lights unavailable**: `light.living_room_corner_accent`, `light.living_column_strip_light_matter`. Cards must handle gracefully.
- **Recessed ceiling max brightness = 28%** — intentional architectural choice, not a bug.
- **Accent spots have color adaptation disabled** — no color temp control for that zone.
- **37 OAL automations**, 7 AL zones, 16 total lights (14 currently available).

---

## File Reading Order for Any Card Work

1. `Dashboard/Tunet/Mockups/design_language.md` — THE rulebook
2. `Dashboard/Tunet/Cards/tunet_climate_card.js` — THE quality bar
3. The specific card you're modifying
4. `Dashboard/Tunet/Mockups/tunet-new-cards-v3.html` — for status/action/lighting mockup
5. `Dashboard/Tunet/tunet-overview-config.yaml` — current dashboard config
