# Tunet Dashboard Card Suite – Readiness Audit & Consolidation Plan

**Date:** 2026-02-20
**Spec baseline:** design_language.md v8.3
**Cards audited:** 10 files, 9,756 total lines

---

## 1. Card Readiness Grades

Grading scale: **A** (production-ready, spec-aligned) → **B** (functional, minor drift) → **C** (works but notable gaps) → **D** (needs significant rework)

### Tier 1 – Gold Standard

| Card | Lines | Version | Grade | Summary |
|------|-------|---------|-------|---------|
| **Climate** | 1,558 | 1.0.0 | **A** | Full spec compliance. Dual-range slider, ARIA slider roles, keyboard ±1°/±5°, deadband visualization, fan/eco/mode controls, unified accent system. The reference implementation. |
| **Lighting** | 1,795 | 3.1.0 | **A−** | Most sophisticated card. Drag-to-dim, floating pill, scroll/grid layouts, group expansion. One token drift issue (see below). |
| **Status** | 978 | 2.1.0 | **A−** | Clean tile-type system (indicator/timer/value/dropdown). Full keyboard + ARIA. Smart dropdown repositioning. Minimal header (title only, no toggles) but appropriate for its role. |

### Tier 2 – Solid, Needs Polish

| Card | Lines | Version | Grade | Summary |
|------|-------|---------|-------|---------|
| **Media** | 1,382 | 3.0.0 | **B+** | Rich Sonos integration, speaker auto-detection, progress timer. 4 hardcoded rgba fills in progress/volume bars. Partial ARIA (only `aria-expanded`). No `role="slider"` on volume track. |
| **Sensor** | 1,046 | 1.0.0 | **B+** | History fetching, sparkline SVGs, threshold-driven accents, trend detection. Strong keyboard support. Missing explicit `aria-label` on sensor rows. Has extra tokens not in spec (`--bg`, `--r-icon`). |
| **Rooms** | 857 | 2.1.0 | **B** | Orb-based architecture works well. Per-room temperature, navigation support. Good ARIA on room icon buttons. Uses non-spec `--r-section: 38px` (spec says 32px). Missing `--green-border` token. |
| **Actions** | 520 | 2.1.0 | **B** | Clean quick-action strip. State comparison operators (equals/contains/not_equals). No ARIA labels on action chips. No hass-more-info support. |
| **Speaker Grid** | 846 | 1.0.0 | **B−** | Drag-to-volume, long-press more-info, group management. 4 hardcoded colors (volume bar + floating pill). Best ARIA among secondary cards. Not in overview composition contract. |

### Tier 3 – Needs Work

| Card | Lines | Version | Grade | Summary |
|------|-------|---------|-------|---------|
| **Weather** | 486 | 1.1.0 | **C+** | Functional forecast display. Zero keyboard accessibility. Zero ARIA attributes. Info-tile click only works with mouse. Loads both Material Symbols variants but only uses Outlined. |
| **Scenes** | 295 | 1.0.0 | **C** | Minimal chip row. No glass stroke `::before`. No hass-more-info. No ARIA labels. Dark mode glass is radically different (`rgba(255,255,255,0.06)` vs spec `rgba(44,44,46,0.72)`). Not in overview baseline per spec. |

---

## 2. Token Drift Analysis

This is the core problem. Each card was built in isolation, and the tokens have drifted apart. Here's every deviation from design_language.md v8.3.

### 2.1 Critical Drift: Dark Mode Glass Surface

The spec defines two variants. Most cards use the neutral gray, but the lighting card uses the midnight blue.

| Card | Dark `--glass` | Matches spec? |
|------|---------------|---------------|
| Climate | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| **Lighting** | **`rgba(30,41,59, 0.72)`** | **Midnight blue – user preference, not spec default** |
| Status | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Media | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Sensor | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Rooms | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Actions | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Speaker | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| Weather | `rgba(44,44,46, 0.72)` | Neutral gray ✓ |
| **Scenes** | **`rgba(255,255,255, 0.06)`** | **Completely wrong – white tint instead of glass** |

### 2.2 Dark Mode Text Tokens

| Card | `--text` dark | `--text-sub` dark | Spec match? |
|------|--------------|-------------------|-------------|
| Spec | `#F5F5F7` | `rgba(245,245,247, 0.50)` | – |
| Climate | `#F5F5F7` | `rgba(245,245,247, 0.50)` | ✓ |
| **Lighting** | **`#F8FAFC`** | **`rgba(248,250,252, 0.65)`** | **Both wrong** |
| Status | `#F5F5F7` | `rgba(245,245,247, 0.50)` | ✓ |
| Media | `#F5F5F7` | `rgba(245,245,247, 0.50)` | ✓ |
| Actions | `#F5F5F7` | `rgba(245,245,247, 0.55)` | **sub opacity 0.55 vs 0.50** |
| Weather | `#F5F5F7` | `rgba(245,245,247, 0.55)` | **sub opacity 0.55 vs 0.50** |
| Scenes | `#F5F5F7` | `rgba(245,245,247, 0.55)` | **sub opacity 0.55 vs 0.50** |

### 2.3 Dark Amber Token

The spec mandates `#E8961E` for dark amber. The lighting card uses a completely different amber.

| Card | `--amber` dark | Spec match? |
|------|---------------|-------------|
| Spec | `#E8961E` | – |
| Climate | `#E8961E` | ✓ |
| **Lighting** | **`#fbbf24`** | **Wrong – Tailwind amber-400, much lighter** |
| **Lighting** | **`--amber-fill: rgba(251,191,36, 0.18)`** | **Wrong base color + higher opacity** |
| **Lighting** | **`--amber-border: rgba(251,191,36, 0.32)`** | **Wrong base color + much higher opacity** |
| Status | `#E8961E` | ✓ |
| All others | `#E8961E` | ✓ |

### 2.4 Blue Border/Fill Variations

Minor but visible inconsistencies in the blue accent derivatives:

| Card | `--blue-fill` dark | `--blue-border` dark | Spec |
|------|-------------------|---------------------|------|
| Spec | `rgba(10,132,255, 0.13)` | `rgba(10,132,255, 0.22)` | – |
| Climate | 0.13 / 0.22 | ✓ | ✓ |
| Status | **0.14** / **0.24** | drift | drift |
| Actions | **0.14** / **0.24** | drift | drift |
| Weather | **0.14** / **0.24** | drift | drift |
| Sensor | **0.14** / **0.24** | drift | drift |

### 2.5 Section Radius

| Card | `--r-section` | Spec |
|------|--------------|------|
| Spec | `32px` | – |
| Lighting | `32px` | ✓ |
| Climate | **`38px`** | drift |
| Rooms | **`38px`** | drift |
| Sensor | **`38px`** | drift |

### 2.6 Missing Tokens by Card

Tokens that should exist per spec but are absent from certain cards:

| Token | Missing from |
|-------|-------------|
| `--chip-bg`, `--chip-border`, `--chip-sh` | Status, Actions, Rooms, Sensor, Weather |
| `--toggle-off/on/knob` | Status, Actions, Media, Sensor, Weather, Speaker, Scenes |
| `--tile-bg` | Weather, Scenes |
| `--dd-bg`, `--dd-border` | Actions, Rooms, Sensor, Scenes, Speaker |
| `--thumb-bg/sh/sh-a` | Status, Actions, Rooms, Sensor, Scenes |
| `--track-h` | Most cards except Climate, Lighting |
| `--purple` accent family | Status, Media, Rooms, Speaker, Weather |

Not all missing tokens are problems – cards that don't use dropdowns don't need `--dd-*`. But it means a card that later adds a dropdown will define new tokens from scratch and likely drift.

### 2.7 Extra/Non-Spec Tokens

| Card | Extra token | Purpose |
|------|------------|---------|
| Sensor | `--bg: #f4f4f9` (light), `#0f172a` (dark) | Page background – **spec violation** (§19 rule 19) |
| Sensor | `--r-icon: 16px` | Icon radius – not in spec |
| Sensor | `--border-ghost` | Ghost border – custom invention |
| Rooms | `--gray-ghost`, `--parent-bg` | Custom surface variants |
| Speaker | `--tile-bg-off` | Off-state tile – not in spec |
| Lighting | `--tile-shadow-rest/lift` | Tile physics – in spec's parity lock but not in §2 tokens |

---

## 3. CSS Duplication Quantification

Across 10 cards, here's what's being duplicated:

| Duplicated Block | Approx. lines × cards | Total wasted |
|-----------------|----------------------|--------------|
| `:host` light token block | ~35 lines × 10 | ~315 lines |
| `:host(.dark)` dark token block | ~30 lines × 10 | ~270 lines |
| `.icon` base CSS | ~12 lines × 10 | ~108 lines |
| `::before` glass stroke | ~15 lines × 8 | ~105 lines |
| DM Sans + Material Symbols font links | ~4 lines × 10 | ~36 lines |
| `_injectFonts()` static method | ~15 lines × 10 | ~135 lines |
| `prefers-reduced-motion` media query | ~6 lines × 10 | ~54 lines |
| Registration boilerplate | ~12 lines × 10 | ~108 lines |
| Dark mode detection logic | ~3 lines × 10 | ~27 lines |
| **Total estimated duplication** | | **~1,158 lines** |

That's **~12% of total codebase** (1,158 / 9,756) in pure copy-paste duplication. And every copy is a potential drift point.

---

## 4. Consolidation Strategy

### 4.1 The Core Problem

Every card independently defines its own tokens, fonts, glass stroke, icon CSS, reduced-motion, font injection, and registration. When the spec changes (and it has – v8.0 → v8.3), you'd need to update 10 files. In practice, some get updated and others don't, which is exactly how you got the drift documented above.

### 4.2 Option A: Shared Base Module (Recommended)

Create a single `tunet_base.js` that every card imports. This doesn't change any card's Shadow DOM isolation – each card still encapsulates its own styles. But the *source* of those styles is centralized.

```
Dashboard/Tunet/Cards/
├── tunet_base.js              ← NEW: shared tokens, CSS, utilities
├── tunet_climate_card.js      ← imports from base
├── tunet_lighting_card.js     ← imports from base
└── ...
```

**What `tunet_base.js` exports:**

1. **`TUNET_TOKENS`** – The canonical `:host` and `:host(.dark)` CSS token block as a string. One source of truth. Cards inject this into their `<style>`.

2. **`TUNET_ICON_CSS`** – The `.icon`, `.icon.filled`, size classes. Identical across all cards today.

3. **`TUNET_GLASS_STROKE`** – The `::before` gradient + mask CSS. Cards apply it to their card container class.

4. **`TUNET_REDUCED_MOTION`** – The `@media (prefers-reduced-motion)` block.

5. **`TUNET_FONT_LINKS`** – The `<link>` tags for DM Sans + Material Symbols as an HTML string.

6. **`injectFonts()`** – The global font injection utility (replaces 10 identical `_injectFonts()` methods).

7. **`registerCard(tag, cls, meta)`** – The guarded `customElements.define` + `window.customCards` dedup pattern.

8. **`detectDarkMode(host, hass)`** – The `.dark` class toggle.

**How cards use it:**

```javascript
import { TUNET_TOKENS, TUNET_ICON_CSS, TUNET_GLASS_STROKE,
         TUNET_REDUCED_MOTION, TUNET_FONT_LINKS,
         injectFonts, registerCard, detectDarkMode } from './tunet_base.js';

const STYLES = `
  ${TUNET_TOKENS}
  ${TUNET_ICON_CSS}
  ${TUNET_GLASS_STROKE}
  ${TUNET_REDUCED_MOTION}

  /* Card-specific styles below */
  .card { ... }
`;

const TEMPLATE = `
  ${TUNET_FONT_LINKS}
  <div class="card">...</div>
`;
```

**Impact estimate:**
- Eliminates ~1,100 lines of duplication
- Token changes happen in one place
- Cards still own their unique CSS (header layout, slider, tiles, etc.)
- Backward compatible – cards can migrate one at a time

### 4.3 Option B: CSS Custom Properties via HA Theme

Push all Tunet tokens into a HA theme so the dashboard itself defines them. Cards read from `var(--tunet-glass)` etc. without defining them.

**Pros:** Zero duplication of token values. Theme-level control.
**Cons:** Breaks Shadow DOM encapsulation (cards depend on external theme). Cards can't work standalone. Theme must be active. Harder to debug.

**Verdict:** Too fragile. Not recommended as primary strategy, but could complement Option A for page-level values.

### 4.4 Option C: Web Components Inheritance

Create a `TunetBaseCard` class that all cards extend. The base class handles `connectedCallback`, font injection, dark mode, registration, and provides a `renderStyles()` method.

**Pros:** OOP approach. Lifecycle management centralized.
**Cons:** Tight coupling. Each card's `set hass()` flow is different enough that a shared base class becomes either too rigid or too leaky. The climate card's dual-thumb slider, the lighting card's drag-to-dim, and the media card's Sonos websocket all have radically different update patterns.

**Verdict:** The string-template approach (Option A) is more practical given the diversity of card behaviors.

### 4.5 Recommended Migration Path

**Phase 1 – Create `tunet_base.js`** (no card changes yet)
- Extract canonical tokens from design_language.md v8.3 into exported constants
- Export font links, icon CSS, glass stroke, reduced-motion, registration helper

**Phase 2 – Migrate Tier 3 cards first** (Scenes, Weather)
- These need the most rework anyway
- Proves the pattern on simpler cards
- Fix their spec compliance issues at the same time

**Phase 3 – Migrate Tier 2 cards** (Actions, Rooms, Speaker, Sensor, Media)
- Replace inline tokens with base imports
- Fix drift issues documented in §2

**Phase 4 – Migrate Tier 1 cards** (Climate, Status, Lighting)
- Lighting needs a decision on midnight blue vs neutral gray
- These are production-stable; migrate carefully

**Phase 5 – Decide glass variant**
- The lighting card's midnight blue (`rgba(30,41,59, 0.72)`) looks great but breaks spec consistency
- Either update the spec to make midnight blue the canonical dark glass, or align lighting to neutral gray
- This is a design decision, not a code decision

---

## 5. Accessibility Gap Summary

| Card | Keyboard nav | ARIA labels | role attrs | focus-visible | hass-more-info |
|------|-------------|-------------|------------|---------------|----------------|
| Climate | Full (arrows, shift) | Full | slider | ✓ | ✓ |
| Lighting | Full (arrows, enter) | ✓ | button | ✓ | ✓ |
| Status | ✓ | ✓ | button | ✓ | ✓ |
| Media | Partial | Partial (`aria-expanded` only) | – | ✓ | ✓ |
| Sensor | ✓ | Partial (no `aria-label`) | button | ✓ | ✓ |
| Rooms | ✓ | ✓ | native buttons | ✓ | ✓ |
| Actions | Partial | **None** | – | ✓ | **None** |
| Speaker | ✓ | ✓ | button | ✓ | ✓ |
| **Weather** | **None** | **None** | **None** | – | Mouse only |
| **Scenes** | Focus only | **None** | **None** | ✓ | **None** |

Weather and Scenes have critical accessibility gaps that should be addressed before production deployment.

---

## 6. Priority Actions

### Immediate (before next deploy)

1. **Fix Scenes dark glass** – `rgba(255,255,255,0.06)` is visually broken; should be `rgba(44,44,46,0.72)`
2. **Add keyboard + ARIA to Weather** – info-tile needs `tabindex="0"`, `role="button"`, keydown handler
3. **Add ARIA labels to Actions** – each chip needs `aria-label`

### Short-term (this sprint)

4. **Create `tunet_base.js`** – centralize tokens and shared CSS
5. **Align `--text-sub` dark opacity** – 0.50 (spec) vs 0.55 (actions/weather/scenes)
6. **Align `--blue-fill/border` dark** – 0.13/0.22 (spec) vs 0.14/0.24 (status/actions/weather/sensor)
7. **Decide on `--r-section`** – 32px (spec/lighting) vs 38px (climate/rooms/sensor)

### Medium-term (next cycle)

8. **Migrate all cards to `tunet_base.js`** – eliminate 1,100+ lines of duplication
9. **Resolve lighting midnight blue question** – pick one canonical dark glass and update spec
10. **Add glass stroke to Scenes** – only card missing the `::before` bevel
11. **Tokenize hardcoded fills in Media + Speaker** – volume/progress bars using raw rgba

---

*Generated from audit of 10 card files against design_language.md v8.3*
