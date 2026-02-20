# Claude Code Prompt: Create `tunet_base.js` – Shared Base Module

**Goal:** Create a shared JavaScript module (`Dashboard/Tunet/Cards/tunet_base.js`) that centralizes all duplicated CSS tokens, shared component styles, and utility functions currently copy-pasted across 10 independent Tunet card files. Then migrate each card to import from this module instead of defining its own tokens.

---

## Context You Must Read First

Before writing any code, read these files in order:

1. `Dashboard/Tunet/Mockups/design_language.md` (v8.3) – THE canonical spec. Every token value comes from here
2. `Dashboard/Tunet/Docs/card_readiness_audit.md` – Audit showing exact drift per card
3. `Dashboard/Tunet/Docs/lighting_tile_spec.md` – Pixel-exact tile spec from the polished lighting mockup
4. `Dashboard/Tunet/Cards/tunet_climate_card.js` – Gold standard card (Grade A). Copy its token block structure and registration pattern exactly
5. `Dashboard/Tunet/Cards/tunet_lighting_card.js` – Most sophisticated card (Grade A−). Has the midnight navy dark mode variant that is the canonical dark baseline per the parity lock

---

## Architecture: String Exports, Not Inheritance

`tunet_base.js` exports **CSS string constants** and **utility functions**. It does NOT export a base class. Each card remains a standalone `HTMLElement` subclass – the module is purely compositional.

### Why strings, not a base class

- Cards have radically different DOM structures and lifecycles
- Shadow DOM means each card must inject its own `<style>` – there's no shared stylesheet
- String concatenation is the simplest, most debuggable approach for Shadow DOM CSS
- No coupling between cards; each imports only what it needs
- Easy to diff: the extracted strings are identical to what each card already has

### File structure

```
Dashboard/Tunet/Cards/
├── tunet_base.js          ← NEW: shared module
├── tunet_climate_card.js  ← imports from tunet_base.js
├── tunet_lighting_card.js
├── tunet_status_card.js
├── tunet_media_card.js
├── tunet_sensor_card.js
├── tunet_rooms_card.js
├── tunet_actions_card.js
├── tunet_weather_card.js
├── tunet_scenes_card.js
└── tunet_speaker_grid_card.js
```

### Import pattern

Each card file will use a standard ES module import at the top:

```js
import { TOKENS, RESET, ICON_BASE, CARD_SURFACE, SECTION_SURFACE, TILE_SURFACE, UTILS } from './tunet_base.js';
```

Then in the card's STYLES constant:

```js
const STYLES = `
  ${TOKENS}
  ${RESET}
  ${ICON_BASE}
  ${CARD_SURFACE}
  /* ... card-specific styles below ... */
`;
```

---

## Part 1: Token System

### Design Decision – Dark Mode Baseline

The parity lock in design_language.md v8.3 (line 42) is authoritative:

> "Dark-mode visual baseline for Tunet cards is the midnight variant (`#0f172a` canvas context, `#1e293b` card surfaces, amber family anchored to `#fbbf24` in dark interactions)."

However, the spec's own `:host(.dark)` token block (§2.2) still uses neutral gray `rgba(44,44,46,0.72)` for `--glass` and `#E8961E` for `--amber`. The parity lock also says (line 109): "Keep dark amber token at `#E8961E` across all cards."

**Resolution:** The base module must export TWO dark mode token sets:

1. **`TOKENS`** – The spec-default dark tokens (neutral gray glass, `#E8961E` amber). This is what most cards use today and what the spec's §2.2 defines
2. **`TOKENS_MIDNIGHT`** – The midnight navy dark tokens (blue-gray glass, `#fbbf24` amber). This is what the lighting card uses and what the parity lock names as the "visual baseline"

Each card chooses which to use. The lighting card uses `TOKENS_MIDNIGHT`. All others use `TOKENS` until a deliberate migration is decided.

### 1.1 `TOKENS` – Light Mode (canonical, from spec §2.1)

Export a string constant containing the complete `:host { ... }` block. Every value below comes verbatim from design_language.md v8.3 §2.1:

```css
:host {
  /* Glass Surfaces */
  --glass: rgba(255,255,255, 0.68);
  --glass-border: rgba(255,255,255, 0.45);

  /* Shadows (two-layer: contact + ambient) */
  --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
  --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
  --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

  /* Text */
  --text: #1C1C1E;
  --text-sub: rgba(28,28,30, 0.55);
  --text-muted: #8E8E93;

  /* Accent: Amber */
  --amber: #D4850A;
  --amber-fill: rgba(212,133,10, 0.10);
  --amber-border: rgba(212,133,10, 0.22);

  /* Accent: Blue */
  --blue: #007AFF;
  --blue-fill: rgba(0,122,255, 0.09);
  --blue-border: rgba(0,122,255, 0.18);

  /* Accent: Green */
  --green: #34C759;
  --green-fill: rgba(52,199,89, 0.12);
  --green-border: rgba(52,199,89, 0.15);

  /* Accent: Purple */
  --purple: #AF52DE;
  --purple-fill: rgba(175,82,222, 0.10);
  --purple-border: rgba(175,82,222, 0.18);

  /* Accent: Red */
  --red: #FF3B30;
  --red-fill: rgba(255,59,48, 0.10);
  --red-border: rgba(255,59,48, 0.22);

  /* Track / Slider */
  --track-bg: rgba(28,28,30, 0.055);
  --track-h: 44px;

  /* Thumb */
  --thumb-bg: #fff;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

  /* Radii */
  --r-card: 24px;
  --r-section: 32px;
  --r-tile: 16px;
  --r-pill: 999px;
  --r-track: 14px;

  /* Controls */
  --ctrl-bg: rgba(255,255,255, 0.52);
  --ctrl-border: rgba(0,0,0, 0.05);
  --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);

  /* Chips */
  --chip-bg: rgba(255,255,255, 0.48);
  --chip-border: rgba(0,0,0, 0.05);
  --chip-sh: 0 1px 3px rgba(0,0,0,0.04);

  /* Dropdown Menu */
  --dd-bg: rgba(255,255,255, 0.84);
  --dd-border: rgba(255,255,255, 0.60);

  /* Dividers */
  --divider: rgba(28,28,30, 0.07);

  /* Toggle Switch */
  --toggle-off: rgba(28,28,30, 0.10);
  --toggle-on: rgba(52,199,89, 0.28);
  --toggle-knob: rgba(255,255,255, 0.96);

  /* Tile Surfaces */
  --tile-bg: rgba(255,255,255, 0.92);
  --tile-bg-off: rgba(28,28,30, 0.04);
  --gray-ghost: rgba(0, 0, 0, 0.035);
  --border-ghost: transparent;

  /* Section Container */
  --section-bg: rgba(255,255,255, 0.35);
  --section-shadow: 0 8px 40px rgba(0,0,0,0.10);

  color-scheme: light;
  display: block;
}
```

### 1.2 `TOKENS` – Dark Mode (spec §2.2 defaults)

Append the `:host(.dark) { ... }` block to the same `TOKENS` string:

```css
:host(.dark) {
  --glass: rgba(44,44,46, 0.72);
  --glass-border: rgba(255,255,255, 0.08);

  --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
  --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
  --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);

  --text: #F5F5F7;
  --text-sub: rgba(245,245,247, 0.50);
  --text-muted: rgba(245,245,247, 0.35);

  --amber: #E8961E;
  --amber-fill: rgba(232,150,30, 0.14);
  --amber-border: rgba(232,150,30, 0.25);

  --blue: #0A84FF;
  --blue-fill: rgba(10,132,255, 0.13);
  --blue-border: rgba(10,132,255, 0.22);

  --green: #30D158;
  --green-fill: rgba(48,209,88, 0.14);
  --green-border: rgba(48,209,88, 0.18);

  --purple: #BF5AF2;
  --purple-fill: rgba(191,90,242, 0.14);
  --purple-border: rgba(191,90,242, 0.22);

  --red: #FF453A;
  --red-fill: rgba(255,69,58, 0.14);
  --red-border: rgba(255,69,58, 0.25);

  --track-bg: rgba(255,255,255, 0.06);
  --thumb-bg: #F5F5F7;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);

  --ctrl-bg: rgba(255,255,255, 0.08);
  --ctrl-border: rgba(255,255,255, 0.08);
  --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);

  --chip-bg: rgba(58,58,60, 0.50);
  --chip-border: rgba(255,255,255, 0.06);
  --chip-sh: 0 1px 3px rgba(0,0,0,0.18);

  --dd-bg: rgba(58,58,60, 0.88);
  --dd-border: rgba(255,255,255, 0.08);

  --divider: rgba(255,255,255, 0.06);

  --toggle-off: rgba(255,255,255, 0.10);
  --toggle-on: rgba(48,209,88, 0.30);
  --toggle-knob: rgba(255,255,255, 0.92);

  --tile-bg: rgba(44,44,46, 0.90);
  --tile-bg-off: rgba(255,255,255, 0.04);
  --gray-ghost: rgba(255, 255, 255, 0.05);
  --border-ghost: rgba(255, 255, 255, 0.08);

  --section-bg: rgba(255,255,255, 0.05);
  --section-shadow: 0 8px 40px rgba(0,0,0,0.25);

  color-scheme: dark;
}
```

### 1.3 `TOKENS_MIDNIGHT` – Midnight Navy Dark Override

This is an ADDITIONAL string that a card concatenates AFTER `TOKENS` to override just the dark mode values with the midnight navy palette. It re-declares `:host(.dark)` – CSS cascade means the later declaration wins.

Source: `lighting-section-mockup-polish.html` dark tokens + parity lock values.

```css
:host(.dark) {
  /* Midnight Navy – Parity Lock baseline */
  --glass: rgba(30,41,59, 0.72);
  --glass-border: rgba(255,255,255, 0.10);

  --text: #F8FAFC;
  --text-sub: rgba(248,250,252, 0.65);
  --text-muted: rgba(248,250,252, 0.40);

  --amber: #fbbf24;
  --amber-fill: rgba(251,191,36, 0.12);
  --amber-border: rgba(251,191,36, 0.25);

  --tile-bg: rgba(255,255,255, 0.08);
  --tile-bg-off: rgba(255,255,255, 0.04);
  --gray-ghost: rgba(255,255,255, 0.04);
  --border-ghost: rgba(255,255,255, 0.05);

  --section-bg: rgba(30,41,59, 0.60);

  --track-bg: rgba(255,255,255, 0.08);
  --shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5);
  --shadow-up: 0 1px 4px rgba(0,0,0,0.40), 0 20px 40px rgba(0,0,0,0.35);
}
```

### 1.4 Usage in cards

```js
// Climate card (uses spec defaults):
import { TOKENS, RESET, ... } from './tunet_base.js';
const STYLES = `${TOKENS} ${RESET} ${ICON_BASE} ...`;

// Lighting card (uses midnight navy dark):
import { TOKENS, TOKENS_MIDNIGHT, RESET, ... } from './tunet_base.js';
const STYLES = `${TOKENS} ${TOKENS_MIDNIGHT} ${RESET} ${ICON_BASE} ...`;
```

---

## Part 2: Shared CSS Blocks

Export each as a named string constant. These are blocks duplicated across 8+ cards.

### 2.1 `RESET`

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
```

### 2.2 `BASE_FONT`

```css
.card-wrap {
  font-family: "DM Sans", system-ui, -apple-system, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 2.3 `ICON_BASE`

The Material Symbols Rounded icon base class. Copy from `tunet_climate_card.js` lines 101–126 exactly (it uses the CSS custom property approach for `font-variation-settings` which is the cleanest pattern):

```css
.icon {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  white-space: nowrap;
  direction: ltr;
  vertical-align: middle;
  flex-shrink: 0;
  -webkit-font-smoothing: antialiased;
  --ms-fill: 0;
  --ms-wght: 100;
  --ms-grad: 200;
  --ms-opsz: 20;
  font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
}
.icon.filled { --ms-fill: 1; }
.icon-28 { font-size: 28px; width: 28px; height: 28px; }
.icon-24 { font-size: 24px; width: 24px; height: 24px; }
.icon-20 { font-size: 20px; width: 20px; height: 20px; }
.icon-18 { font-size: 18px; width: 18px; height: 18px; }
.icon-16 { font-size: 16px; width: 16px; height: 16px; }
.icon-14 { font-size: 14px; width: 14px; height: 14px; }
```

**Important:** The font-family MUST be `'Material Symbols Rounded'` only. The climate card has `'Material Symbols Outlined', 'Material Symbols Rounded'` with Outlined first – that is a bug. The spec mandates Rounded only. Fix this in the base module.

### 2.4 `CARD_SURFACE`

The universal card shell. From spec §3.1:

```css
.card {
  position: relative;
  border-radius: var(--r-card);
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--ctrl-border);
  box-shadow: var(--shadow), var(--inset);
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  overflow: hidden;
}
```

### 2.5 `CARD_SURFACE_GLASS_STROKE`

The glass stroke `::before` pseudo-element. From spec §3.2:

```css
.card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--r-card);
  padding: 1px;
  pointer-events: none;
  z-index: 0;
  background: linear-gradient(
    160deg,
    rgba(255,255,255, 0.60),
    rgba(255,255,255, 0.10) 40%,
    rgba(255,255,255, 0.02) 60%,
    rgba(255,255,255, 0.25)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

:host(.dark) .card::before {
  background: linear-gradient(
    160deg,
    rgba(255,255,255, 0.12),
    rgba(255,255,255, 0.03) 40%,
    rgba(255,255,255, 0.01) 60%,
    rgba(255,255,255, 0.06)
  );
}
```

### 2.6 `SECTION_SURFACE`

For cards that use a section container (status, lighting):

```css
.section-container {
  border-radius: var(--r-section);
  background: var(--section-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--ctrl-border);
  box-shadow: var(--section-shadow);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
```

### 2.7 `TILE_SURFACE`

The shared tile base for status tiles, lighting tiles, etc. This is the critical surface variant system.

```css
/* Base tile – used by status, lighting, sensor tiles */
.tile {
  border-radius: var(--r-tile);
  background: var(--tile-bg);
  border: 1px solid var(--border-ghost);
  box-shadow: var(--shadow);
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: background .2s, border-color .2s, box-shadow .2s, transform .2s;
  cursor: pointer;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
}

.tile:hover {
  box-shadow: var(--shadow-up);
}

.tile:active {
  transform: scale(0.97);
}

/* Off-state tile */
.tile.off {
  background: var(--tile-bg-off);
  box-shadow: none;
}

.tile.off .tile-icon {
  background: var(--gray-ghost);
  color: var(--text-muted);
}
```

### 2.8 `HEADER_PATTERN`

The shared header row (section title + optional controls):

```css
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: var(--text-sub);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}
```

### 2.9 `CTRL_SURFACE`

Shared control button surfaces (info tile, toggle buttons, selectors):

```css
.ctrl-btn {
  min-height: 42px;
  border-radius: 10px;
  border: 1px solid var(--ctrl-border);
  background: var(--ctrl-bg);
  box-shadow: var(--ctrl-sh);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  cursor: pointer;
  transition: all .15s;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-sub);
}

.ctrl-btn:hover {
  box-shadow: var(--shadow);
}

.ctrl-btn:active {
  transform: scale(0.95);
}
```

### 2.10 `DROPDOWN_MENU`

Shared dropdown menu (speaker selector, mode selector, etc.):

```css
.dd-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 220px;
  padding: 5px;
  border-radius: var(--r-tile);
  background: var(--dd-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--dd-border);
  box-shadow: var(--shadow-up);
  z-index: 10;
  display: none;
  flex-direction: column;
  gap: 1px;
}

.dd-menu.open {
  display: flex;
  animation: menuIn .14s ease forwards;
}

@keyframes menuIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.dd-option {
  padding: 9px 12px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background .1s;
  user-select: none;
}

.dd-option:hover {
  background: var(--track-bg);
}

.dd-option:active {
  transform: scale(0.97);
}

.dd-divider {
  height: 1px;
  background: var(--divider);
  margin: 3px 8px;
}
```

### 2.11 `REDUCED_MOTION`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 2.12 `RESPONSIVE_BASE`

```css
@media (max-width: 440px) {
  .card { padding: 16px; }
  .section-container { padding: 16px; border-radius: 28px; }
}
```

---

## Part 3: Utility Functions

### 3.1 `detectDarkMode(hass)`

Standardized dark mode detection. Currently each card implements this slightly differently.

```js
export function detectDarkMode(hass) {
  if (!hass?.themes) return false;
  const theme = hass.themes?.darkMode;
  if (typeof theme === 'boolean') return theme;
  // Fallback: check selectedTheme
  const selected = hass.themes?.theme;
  if (selected && selected.toLowerCase().includes('dark')) return true;
  return false;
}
```

### 3.2 `applyDarkClass(element, isDark)`

Apply or remove the `.dark` class on the host element:

```js
export function applyDarkClass(element, isDark) {
  element.classList.toggle('dark', isDark);
}
```

### 3.3 `fireEvent(element, type, detail)`

Standardized HA event firing (for `hass-more-info`, etc.):

```js
export function fireEvent(element, type, detail = {}) {
  const event = new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail,
  });
  element.dispatchEvent(event);
}
```

### 3.4 `registerCard(tagName, cardClass, meta)`

Idempotent card registration:

```js
export function registerCard(tagName, cardClass, meta) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, cardClass);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.some(c => c.type === tagName)) {
    window.customCards.push({
      type: tagName,
      preview: true,
      ...meta,
    });
  }
}
```

### 3.5 `logCardVersion(name, version, color)`

Console branding:

```js
export function logCardVersion(name, version, color = '#D4850A') {
  const bg2 = color + '20'; // approximate light bg
  console.info(
    `%c ${name} %c v${version} `,
    `color: #fff; background: ${color}; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `color: ${color}; background: ${bg2}; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;`
  );
}
```

### 3.6 `clamp(value, min, max)`

```js
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
```

---

## Part 4: Module Structure

The complete `tunet_base.js` file structure:

```js
/**
 * Tunet Base Module
 * Shared tokens, CSS blocks, and utilities for the Tunet card suite
 * Version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// TOKENS
// ═══════════════════════════════════════════════════════════

export const TOKENS = `
  /* -- Tokens: Light (spec §2.1) -- */
  :host { ... }

  /* -- Tokens: Dark (spec §2.2) -- */
  :host(.dark) { ... }
`;

export const TOKENS_MIDNIGHT = `
  /* -- Dark Override: Midnight Navy (parity lock baseline) -- */
  :host(.dark) { ... }
`;

// ═══════════════════════════════════════════════════════════
// SHARED CSS BLOCKS
// ═══════════════════════════════════════════════════════════

export const RESET = `...`;
export const BASE_FONT = `...`;
export const ICON_BASE = `...`;
export const CARD_SURFACE = `...`;
export const CARD_SURFACE_GLASS_STROKE = `...`;
export const SECTION_SURFACE = `...`;
export const TILE_SURFACE = `...`;
export const HEADER_PATTERN = `...`;
export const CTRL_SURFACE = `...`;
export const DROPDOWN_MENU = `...`;
export const REDUCED_MOTION = `...`;
export const RESPONSIVE_BASE = `...`;

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════

export function detectDarkMode(hass) { ... }
export function applyDarkClass(element, isDark) { ... }
export function fireEvent(element, type, detail = {}) { ... }
export function registerCard(tagName, cardClass, meta) { ... }
export function logCardVersion(name, version, color = '#D4850A') { ... }
export function clamp(value, min, max) { ... }
```

---

## Part 5: Migration Plan

### Phase 1 – Create `tunet_base.js` (this task)

Write the complete module with all exports listed above. Populate every CSS string with the exact values from the spec. Do not approximate or paraphrase – use the precise rgba, hex, and px values from §2.1 and §2.2 of design_language.md.

### Phase 2 – Migrate the gold standard card first

Pick `tunet_climate_card.js` (Grade A, most spec-compliant). Replace its inline token block and shared CSS blocks with imports from `tunet_base.js`. Verify the card renders identically before and after.

**Migration steps for a single card:**

1. Add `import { TOKENS, RESET, BASE_FONT, ICON_BASE, CARD_SURFACE, CARD_SURFACE_GLASS_STROKE, ... } from './tunet_base.js';` at the top
2. Replace the card's `const STYLES = \`...\`` with template literal concatenation of imported blocks + card-specific CSS
3. Replace inline `detectDarkMode` / `fireEvent` / registration code with imported functions
4. Test: card renders identically in light and dark mode
5. Test: all interactions still work (taps, sliders, keyboard, ARIA)

### Phase 3 – Migrate remaining cards (one at a time)

Order by grade (highest first, to catch regressions early):

1. `tunet_climate_card.js` (A)
2. `tunet_lighting_card.js` (A−) – uses `TOKENS_MIDNIGHT`
3. `tunet_status_card.js` (A−)
4. `tunet_media_card.js` (B+)
5. `tunet_sensor_card.js` (B+)
6. `tunet_rooms_card.js` (B)
7. `tunet_actions_card.js` (B)
8. `tunet_speaker_grid_card.js` (B−)
9. `tunet_weather_card.js` (C+)
10. `tunet_scenes_card.js` (C)

For each migration, fix any token drift discovered in the audit. The audit document (`card_readiness_audit.md` §2) lists every deviation.

### Phase 4 – Register as HA resource

Add `tunet_base.js` to the HA Lovelace resources as type `module`:

```yaml
resources:
  - url: /local/tunet/tunet_base.js
    type: module
```

Each card file also needs to be type `module` (not `js`) since they now use ES module imports.

---

## Part 6: Drift Corrections During Migration

When migrating each card to use the base module, fix these known token drift issues discovered in the audit (`card_readiness_audit.md`). The base module's `TOKENS` export has the correct values – simply removing the card's inline tokens and using the import fixes most of these automatically.

### 6.1 Pre-migration critical fix

**Scenes card dark glass** – Before any migration work, manually fix `tunet_scenes_card.js`:
- Current (broken): `--glass: rgba(255,255,255, 0.06)` – this is a white tint, not glass
- Correct: `--glass: rgba(44,44,46, 0.72)` – neutral gray glass per spec §2.2
- This is visually broken in dark mode and must be fixed immediately

### 6.2 `--r-section` radius

Spec says `32px`. The following cards use `38px` and must be corrected during migration:
- `tunet_climate_card.js` – uses `--r-section: 38px`
- `tunet_rooms_card.js` – uses `--r-section: 38px`
- `tunet_sensor_card.js` – uses `--r-section: 38px`

**Note:** The overview mockup (`tunet-overview-dashboard.html`) also uses `38px`. This was a mockup-level decision that was not adopted into the spec. Spec wins.

### 6.3 Blue accent opacity drift

Spec: `--blue-fill: rgba(0,122,255, 0.09)` light / `rgba(10,132,255, 0.13)` dark
Spec: `--blue-border: rgba(0,122,255, 0.18)` light / `rgba(10,132,255, 0.22)` dark

Cards using higher opacities (`0.14`/`0.24`) that need correction:
- `tunet_status_card.js`
- `tunet_actions_card.js`
- `tunet_weather_card.js`
- `tunet_sensor_card.js`

### 6.4 `--text-sub` dark mode opacity

Spec: `rgba(245,245,247, 0.50)`

Cards using `0.55` that need correction:
- `tunet_actions_card.js`
- `tunet_weather_card.js`
- `tunet_scenes_card.js`

### 6.5 Extra/non-spec tokens

Some cards define tokens that don't exist in the spec. These stay in the individual card file – do NOT extract them to the base module:
- `tunet_sensor_card.js`: `--bg`, `--r-icon`, `--border-ghost` (as custom tokens)
- `tunet_lighting_card.js`: `--parent-bg` (used for section container)

Only extract a non-spec token to the base module if 3+ cards need it.

### 6.6 Midnight dark mode boundary

`TOKENS_MIDNIGHT` is used ONLY by `tunet_lighting_card.js`. No other card should use it without explicit design approval. If future cards want midnight navy, they import `TOKENS_MIDNIGHT` themselves – the base module makes it available but does not default to it.

---

## Validation Checklist

After creating `tunet_base.js` and migrating the first card:

- [ ] `tunet_base.js` parses without errors (`node --check tunet_base.js`)
- [ ] Every token value in TOKENS matches design_language.md §2.1 and §2.2 exactly
- [ ] Every token value in TOKENS_MIDNIGHT matches lighting-section-mockup-polish.html dark tokens exactly
- [ ] ICON_BASE uses `'Material Symbols Rounded'` only (not Outlined)
- [ ] CARD_SURFACE matches spec §3.1 exactly
- [ ] CARD_SURFACE_GLASS_STROKE includes both light and `:host(.dark)` variants
- [ ] All utility functions are exported and work standalone
- [ ] Migrated card renders identically to its pre-migration state in both light and dark modes
- [ ] No hardcoded rgba values remain in the migrated card for tokens that exist in the base module
- [ ] Card-specific CSS (unique to that card) remains in the card file, not extracted to base

---

## Critical Rules

1. **Never invent token values.** Every value comes from design_language.md v8.3 or the lighting mockup. If a value doesn't exist in those sources, it stays in the individual card file
2. **Preserve card-specific CSS.** Only extract CSS that is duplicated across 3+ cards. Card-unique styles stay in the card
3. **No base class.** String exports only. Cards remain independent HTMLElement subclasses
4. **Idempotent registration.** Both `customElements.define` and `window.customCards.push` must check for duplicates before adding
5. **Fix the font-family bug.** The base module's ICON_BASE must use `'Material Symbols Rounded'` as the sole font-family, not the dual-family fallback
6. **Two dark modes coexist.** `TOKENS` has neutral gray dark. `TOKENS_MIDNIGHT` overrides to midnight navy. Cards choose. Never merge them into one
7. **ES module format.** The file uses `export const` / `export function`. No IIFE, no CommonJS, no global assignment
