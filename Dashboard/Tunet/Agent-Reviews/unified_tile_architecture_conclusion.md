# Tunet Profile Consumption Architecture
**Version:** 3.0 — Finalized (5-Family Expansion)
**Status:** Implementation-ready  
**Implementation authority:** `Dashboard/Tunet/Cards/v2/`  
**Design-intent reference:** `design_language.md` and `Cards/` (read-only; `v2/` governs behavior)  
**Schema version:** `PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD'`
**Tranche owner:** Mac Connolly

---

## 1. Scope

This document is the single authoritative reference for the Tunet family profile consumption system. It supersedes the parallel analysis document (v1) and all associated gap review notes. All decisions are locked here.

Covers:
- Profile pipeline position and data flow
- 5-family registry with `PROFILE_BASE` shared inheritance
- Preset-to-family mapping and two-function API (`selectProfileSize` + `resolveSizeProfile`)
- CSS custom property protection model and token consumer boundaries
- Lifecycle, trigger model, and instance state
- Feature flag and rollback strategy
- Base API / version handshake
- Gate sequence with operational per-file exit criteria
- Out-of-scope declarations and neutralization requirements

---

## 2. Out-of-Scope Declaration

Three distinct states. All excluded cards must be explicitly classified.

| Card | Migration | Regression testing | Pre-gate action |
|---|---|---|---|
| `tunet_lighting_card.js` | In scope (G2) | In scope | None |
| `tunet_speaker_grid_card.js` | In scope (G2) | In scope | See §10 container query resolution |
| `tunet_status_card.js` | In scope (G3) | In scope | None |
| `tunet_rooms_card.js` | In scope (G3) | In scope | None |
| `tunet_light_tile.js` | In scope (G4) | In scope | None |
| `tunet_nav_card.js` | Excluded from migration | Excluded | **Neutralize before G3:** `ensureGlobalOffsetsStyle()` must be scoped or stubbed so it cannot inject offsets that corrupt section sizing measurements during G3 regression testing. Does not need to be fixed — only neutralized |
| `tunet_media_card.js` | Excluded | Excluded | None |
| `tunet_sonos_card.js` | Excluded | Excluded | None |
| `tunet_weather_card.js` | Excluded | Excluded | None |

Regression failures in excluded cards do not block gate passage but must be logged.

---

## 3. Decision Log

All contested decisions locked here. Do not re-open without a written tranche-owner record attached to this file.

| ID | Decision | Rationale |
|---|---|---|
| D1 | Option C: family profile consumption, gated rollout | Weighted score 8.15/10 — see §4 for full matrix |
| D2 | 5 families: `tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row` | Speakers have different spacing/progress geometry from lighting; status tiles and sensor rows are different feature clusters, not layout variants |
| D3 | `PROFILE_BASE` shared object spread into each family | Makes cross-family typography drift visible at a glance; override only where a family genuinely diverges |
| D4 | Two-function API: `selectProfileSize()` for family+size selection; `resolveSizeProfile()` for pure registry lookup | Separation of concerns — caller decides what to request; resolver only fetches it |
| D5 | Resolver accepts `family` and `size` only — no `widthHint`, no `densityMode` | Width-to-size mapping happens in `selectProfileSize()` before the resolver is called; resolver is pure |
| D6 | Unknown family: `console.warn` + fallback to `tile-grid` standard | More resilient in HA production than throwing; silent blank card is worse than graceful degradation |
| D7 | Unknown size: `console.warn` + fallback to `standard` for that family | Same rationale as D6 |
| D8 | `densityMode` parameter removed entirely; three sizes only: `compact`, `standard`, `large` | Compact IS the dense mode — same axis, different name |
| D9 | Two-name CSS var protection model: public hook `--profile-*`, internal alias `--_tunet-*` | Inline `style.setProperty` loses to injected CSS on the same element without this pattern |
| D10 | Instance-level memoization cache | Module-level cache creates stale state across same-family cards with different configs |
| D11 | `_setProfileVars()` clears all `--_tunet-*` before setting new family tokens | Prevents stale tokens when card switches family (e.g. rooms grid → rooms row) |
| D12 | Feature flag `use_profiles: true\|false` required; legacy scaling code kept until G6 | Rollback must not require a JS file rollback |
| D13 | Version handshake failure renders visible in-card error via `_renderError()` | Uncaught JS in HA freezes the card silently — visible degradation is required |
| D14 | Container-first width measurement; `window.innerWidth` forbidden | Profile resolution fails for embedded/sidebar panel scenarios if viewport width is used |
| D15 | Two-tier versioning: `v1-YYYYMMDD`; public config keys get migration shims; internal registry tokens get unit test coverage only | User YAML is not cache-busted by resource URL changes — public keys are a persisted API surface |
| D16 | `slim` is a layout variant flag, not a size key | Different DOM structure, not a sizing variant |
| D17 | Rooms preset maps to `tile-grid` or `rooms-row` based on `mergedConfig.layout` post-merge | Layout is resolved during merge; family lookup must happen after |

---

## 4. Option Scoring (D1 Audit Trail)

Scores are 0–10 per criterion, multiplied by weight, summed.

| Criterion | Wt | A: Token-only | B: Per-card maps | C: Family profiles | D: Auto engine |
|---|---:|---:|---:|---:|---:|
| Cross-card consistency (compact/standard/large parity) | 25 | 4 (1.00) | 5 (1.25) | 9 (2.25) | 6 (1.50) |
| Migration risk during active surface lock | 20 | 9 (1.80) | 7 (1.40) | 7 (1.40) | 3 (0.60) |
| Override control (explicit, predictable) | 15 | 7 (1.05) | 7 (1.05) | 8 (1.20) | 3 (0.45) |
| Runtime correctness across breakpoints | 15 | 5 (0.75) | 6 (0.90) | 8 (1.20) | 5 (0.75) |
| Developer maintainability | 10 | 5 (0.50) | 6 (0.60) | 9 (0.90) | 4 (0.40) |
| Fit with existing base token architecture | 10 | 8 (0.80) | 7 (0.70) | 8 (0.80) | 4 (0.40) |
| Debuggability in live HA tuning loop | 5 | 7 (0.35) | 7 (0.35) | 8 (0.40) | 3 (0.15) |
| **Weighted total** | **100** | **6.25** | **6.25** | **8.15** | **4.25** |

Option C selected. Migration risk weight penalizes Option C slightly vs. a greenfield scenario due to active surface lock work in progress.

---

## 5. Full Pipeline

```
User YAML / HA storage config
        │
        ▼
deepMerge(PRESETS[preset].card_defaults, user_config)
        │  card-level merge
        ▼
deepMerge(preset.tile_defaults, per_tile_config)
        │  per-tile merge
        ▼
merged config: { preset, layout, tile_size, entity,
                 accent, tap_action, drag, use_profiles, ... }
        │
        ▼
selectProfileSize({ preset, layout, widthHint, userSize })
        │  decides family + size from merged config + runtime width
        ▼
{ family, size }
        │
        ▼
resolveSizeProfile({ family, size })
        │  pure registry lookup — no decisions, no defaults
        ▼
flat object: { tilePad, tileGap, iconBox, iconGlyph,
               nameFont, valueFont, progressH, ... }
        │
        ▼
_setProfileVars(profile)
        │  clears existing --_tunet-*, sets new family tokens on card host (this)
        ▼
CSS cascade through shadow boundaries
        │
        ▼
tile-core renders 5 lanes using var(--_tunet-*, fallback)
```

**Pipeline invariants:**
- Resolver is read-only — never writes to merged config
- `size` is fully resolved by `selectProfileSize()` before the resolver is called
- `widthHint` enters the pipeline from ResizeObserver only, never from config
- `_applyProfile()` is the single convergence point for both trigger paths
- Profile values are geometry only: numbers in pixels, no color, no opacity, no theme variants
- Dark mode is handled at the token layer (`TOKENS` / `TOKENS_MIDNIGHT`) above this pipeline, independent of profile resolution
- Merge system and profile system are independent: merge does not know about profiles; profiles do not participate in merging

---

## 6. Preset-to-Family Mapping and Two-Function API

Lives in `tunet_base.js`. Static lookup, no runtime logic.

### Family Taxonomy

| Family key | Preset(s) | Layout | Component |
|---|---|---|---|
| `tile-grid` | `lighting`, `rooms` (grid) | grid | `tunet-tile` → `tile-core` |
| `speaker-tile` | `speakers` | grid | `tunet-tile` → `tile-core` |
| `rooms-row` | `rooms` (row/slim) | row | `tunet-row` → `tile-core` |
| `indicator-tile` | `status` | grid | `indicator-tile` |
| `indicator-row` | `environment` | list | `indicator-row` |

**Why 5 families, not 3:**
- `speaker-tile` separates from `tile-grid` because speaker tiles have tighter pad/gap ratios and different progress geometry — same tile-core, different proportions
- `indicator-tile` and `indicator-row` split because status grid tiles (dropdown, alarm, timer) and environment sensor rows (sparkline, trend arrow) are different feature clusters, not layout variants of the same component

```js
export const PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD';

export const PRESET_FAMILY_MAP = {
  lighting:    'tile-grid',
  speakers:    'speaker-tile',
  rooms:       'tile-grid',        // grid layout mode — see rooms-row below
  'rooms-row': 'rooms-row',        // row and slim layout modes
  status:      'indicator-tile',
  environment: 'indicator-row',
};
```

### `selectProfileSize()` — Caller Layer

Determines family and size from merged config and runtime width. Called by `_applyProfile()`.

```js
/**
 * Decides family + size from already-merged config + runtime widthHint.
 * Width-to-size mapping lives here — not in the resolver.
 */
export function selectProfileSize({ preset, layout, widthHint, userSize }) {
  const mapKey = layout === 'row' ? 'rooms-row' : preset;
  const family = PRESET_FAMILY_MAP[mapKey];

  if (!family) {
    console.warn(`[TunetProfile] Unknown preset "${preset}" (layout: "${layout}"). Falling back to tile-grid.`);
    return { family: 'tile-grid', size: userSize ?? autoSizeFromWidth(widthHint) };
  }

  const size = userSize ?? autoSizeFromWidth(widthHint);
  return { family, size };
}

// Auto-select size from container width — used when tile_size absent in merged config
export function autoSizeFromWidth(widthPx) {
  if (!widthPx || widthPx <= 0) return 'standard'; // first-render fallback
  if (widthPx < 600) return 'compact';
  return 'standard';
  // 'large' is only reachable via explicit tile_size config — never auto-selected
}

// Width bucket for memoization cache key
export function bucketFromWidth(widthPx) {
  if (!widthPx || widthPx <= 0) return 'md';
  if (widthPx < 400) return 'xs';
  if (widthPx < 600) return 'sm';
  if (widthPx < 800) return 'md';
  return 'lg';
}
```

**Rooms mapping:** `rooms` preset maps to `tile-grid` in grid layout, `rooms-row` in row/slim layout. The layout value is resolved during merge. `selectProfileSize()` reads `mergedConfig.layout` after merge — the split is clean.

**Lighting vs. speakers:** Different families now. Geometry diverges (tighter spacing for speaker grid density). Behavior differences (amber vs. blue accent, drag target) remain in preset defaults.

---

## 7. SIZE_PROFILES Registry

Lives in `tunet_base.js`. All values are raw numbers (no units). Applied as `${value}px`.

```js
export const FAMILY_KEYS = ['tile-grid', 'speaker-tile', 'rooms-row', 'indicator-tile', 'indicator-row'];
export const SIZE_KEYS    = ['compact', 'standard', 'large'];

// Shared typography/icon base — geometry diverges per family
// Override only where a family genuinely differs; spread first, then override
const PROFILE_BASE = {
  iconBox: 38, iconGlyph: 19, nameFont: 13, valueFont: 18,
};

export const SIZE_PROFILES = {

  // Interactive grid tiles — lighting, rooms (grid mode)
  'tile-grid': {
    compact:  { ...PROFILE_BASE, tilePad: 10, tileGap: 4, progressH: 7 },
    standard: { ...PROFILE_BASE, tilePad: 14, tileGap: 6, progressH: 8 },
    large:    { ...PROFILE_BASE, iconBox: 44, iconGlyph: 22, tilePad: 16, tileGap: 8, progressH: 10 },
  },

  // Speaker grid tiles — same tile-core, tighter geometry for audio density
  'speaker-tile': {
    compact:  { ...PROFILE_BASE, tilePad: 8,  tileGap: 4, progressH: 6 },
    standard: { ...PROFILE_BASE, tilePad: 12, tileGap: 6, progressH: 8 },
    large:    { ...PROFILE_BASE, iconBox: 44, iconGlyph: 22, tilePad: 16, tileGap: 8, progressH: 10 },
  },

  // Rooms row layout — core tile lane + row-specific controls
  'rooms-row': {
    compact:  { ...PROFILE_BASE, tilePad: 8,  tileGap: 4, progressH: 6, rowHeight: 48, orbSize: 28, orbGap: 3, toggleSize: 36, chevronSize: 20 },
    standard: { ...PROFILE_BASE, tilePad: 12, tileGap: 6, progressH: 7, rowHeight: 56, orbSize: 32, orbGap: 4, toggleSize: 42, chevronSize: 24 },
    large:    { ...PROFILE_BASE, iconBox: 44, iconGlyph: 22, tilePad: 16, tileGap: 8, progressH: 9, rowHeight: 72, orbSize: 40, orbGap: 5, toggleSize: 52, chevronSize: 28 },
  },

  // Status indicator tiles — grid, interactive subtypes (dropdown, alarm, timer)
  // progressH: 0 — no progress bar at profile level; subtype geometry is card-local
  'indicator-tile': {
    compact:  { ...PROFILE_BASE, tilePad: 8,  tileGap: 4, progressH: 0, dropdownPad: 6,  auxActionSize: 32 },
    standard: { ...PROFILE_BASE, tilePad: 12, tileGap: 6, progressH: 0, dropdownPad: 8,  auxActionSize: 38 },
    large:    { ...PROFILE_BASE, iconBox: 44, iconGlyph: 22, tilePad: 16, tileGap: 8, progressH: 0, dropdownPad: 10, auxActionSize: 44 },
  },

  // Sensor / environment rows — horizontal list, sparkline, trend arrow
  'indicator-row': {
    compact:  { ...PROFILE_BASE, tilePad: 6,  tileGap: 4, progressH: 0, sparklineH: 24, trendSize: 16 },
    standard: { ...PROFILE_BASE, tilePad: 10, tileGap: 6, progressH: 0, sparklineH: 32, trendSize: 20 },
    large:    { ...PROFILE_BASE, iconBox: 44, iconGlyph: 22, tilePad: 14, tileGap: 8, progressH: 0, sparklineH: 40, trendSize: 24 },
  },
};
```

**`PROFILE_BASE` discipline:** Do not add color, opacity, or theme-conditional values to `PROFILE_BASE`. Geometry only. Override `iconBox`/`iconGlyph` in the large entry only — spread first, then override explicitly.

**Status subtype geometry:** Alarm button sizing, dropdown overflow height, and timer display dimensions are card-local CSS layered on top of `indicator-tile` profile vars. The profile registry owns structural geometry only.

**Slim variant:** Not in the registry. `layout_variant: 'slim'` triggers a CSS class in `tunet_rooms_card.js` that scales `rowHeight` to ~70% and hides secondary controls. The resolver is not involved.

---

## 8. Resolver API

```js
/**
 * Pure sizing lookup.
 * Given family + size, returns flat geometry values.
 * Never reads config. Never writes state. Never decides which size to use.
 *
 * @param {string} params.family  - Key from FAMILY_KEYS
 * @param {string} params.size    - 'compact' | 'standard' | 'large'
 * @returns {Object} Flat geometry values (raw numbers, no units)
 */
export function resolveSizeProfile({ family, size }) {
  const familyProfiles = SIZE_PROFILES[family];

  if (!familyProfiles) {
    console.warn(`[TunetProfile] Unknown family "${family}". Falling back to tile-grid standard.`);
    return SIZE_PROFILES['tile-grid'].standard;
  }

  if (!familyProfiles[size]) {
    console.warn(`[TunetProfile] Unknown size "${size}" for family "${family}". Falling back to standard.`);
    return familyProfiles.standard;
  }

  return familyProfiles[size];
}
```

**Resolver contract:**
- Two params only: `family` and `size`
- No `widthHint` — width-to-size mapping belongs in `selectProfileSize()`
- Warn + fallback on unknown keys (D6, D7) — silent blank card is worse than graceful degradation
- Idempotent: same input always returns structurally equal output
- Cache key for instance-level memoization: `${family}:${size}:${bucketFromWidth(widthHint)}` — pass `widthHint` to the cache keying layer only, not to this function

**Note on instance-level caching (D10):** Each card instance initializes its own `Map()` cache. Module-level caching is prohibited because it creates stale state across same-family cards with different configs.

---

## 9. CSS Custom Property Protection Model

### The Problem with Single-Name Vars

If the card sets `--profile-tile-pad: 12px` via `style.setProperty()` and a user injects `.card { --profile-tile-pad: 20px }` in custom CSS, the injected CSS wins because external selectors have higher specificity than inline styles for custom properties. The internal system has no way to protect values.

### Two-Name Pattern

```
Card host element (this)
  Receives via cascade:  --profile-tile-pad: 20px   ← public hook (user override, optional)
  Set programmatically:  --_tunet-tile-pad: 12px    ← internal alias (set by _setProfileVars)

tile-core shadow root
  Reads: var(--_tunet-tile-pad, 12px)               ← internal alias only
  Never reads --profile-* directly
```

Public hooks (`--profile-*`) are the declared override surface. Internal aliases (`--_tunet-*`) are consumed by tile-core and never exposed as targets.

### `_setProfileVars(profile)` Implementation

Applied to `this` (the card host element), not `this.shadowRoot`. Must target the host so vars cascade through shadow boundaries into tile-core.

```js
_setProfileVars(profile) {
  // Step 1: Clear all existing internal aliases — prevents stale tokens on family switch
  for (const prop of [...this.style]) {
    if (prop.startsWith('--_tunet-')) this.style.removeProperty(prop);
  }

  // Step 2: Set core lane tokens (all families share these)
  this.style.setProperty('--_tunet-tile-pad',   `${profile.tilePad}px`);
  this.style.setProperty('--_tunet-tile-gap',   `${profile.tileGap}px`);
  this.style.setProperty('--_tunet-icon-box',   `${profile.iconBox}px`);
  this.style.setProperty('--_tunet-icon-glyph', `${profile.iconGlyph}px`);
  this.style.setProperty('--_tunet-name-font',  `${profile.nameFont}px`);
  this.style.setProperty('--_tunet-value-font', `${profile.valueFont}px`);
  this.style.setProperty('--_tunet-progress-h', `${profile.progressH}px`);

  // Step 3: Set family-specific extension tokens (only present in their family)
  if (profile.rowHeight !== undefined) {       // rooms-row
    this.style.setProperty('--_tunet-row-height',   `${profile.rowHeight}px`);
    this.style.setProperty('--_tunet-orb-size',     `${profile.orbSize}px`);
    this.style.setProperty('--_tunet-orb-gap',      `${profile.orbGap}px`);
    this.style.setProperty('--_tunet-toggle-size',  `${profile.toggleSize}px`);
    this.style.setProperty('--_tunet-chevron-size', `${profile.chevronSize}px`);
  }
  if (profile.dropdownPad !== undefined) {     // indicator-tile
    this.style.setProperty('--_tunet-dropdown-pad',    `${profile.dropdownPad}px`);
    this.style.setProperty('--_tunet-aux-action-size', `${profile.auxActionSize}px`);
  }
  if (profile.sparklineH !== undefined) {      // indicator-row
    this.style.setProperty('--_tunet-sparkline-h', `${profile.sparklineH}px`);
    this.style.setProperty('--_tunet-trend-size',  `${profile.trendSize}px`);
  }

  // Step 4: Bridge public hooks — if user has set --profile-*, let it win
  const overridePairs = [
    ['--profile-tile-pad',   '--_tunet-tile-pad'],
    ['--profile-icon-box',   '--_tunet-icon-box'],
    ['--profile-name-font',  '--_tunet-name-font'],
    ['--profile-value-font', '--_tunet-value-font'],
    ['--profile-progress-h', '--_tunet-progress-h'],
  ];
  const computed = getComputedStyle(this);
  for (const [pub, priv] of overridePairs) {
    const override = computed.getPropertyValue(pub).trim();
    if (override) this.style.setProperty(priv, override);
  }
}
```

### tile-core CSS Contract

tile-core shadow root consumes internal aliases with fallback values. Never references `--profile-*`.

```css
/* tile-core shadow root — consume-only */
:host        { padding:   var(--_tunet-tile-pad,     12px); }
.icon-wrap   { width:     var(--_tunet-icon-box,     40px);
               height:    var(--_tunet-icon-box,     40px); }
.icon        { font-size: var(--_tunet-icon-glyph,   20px); }
.name        { font-size: var(--_tunet-name-font,    13px); }
.value       { font-size: var(--_tunet-value-font,   18px); }
.progress    { height:    var(--_tunet-progress-h,    7px); }
```

### Token Namespace Rule

- Profile system uses `--_tunet-*` (internal) and `--profile-*` (public hooks)
- Global design tokens use their own namespaces (`--glass`, `--r-tile`, `--track-h`, etc.)
- No cross-namespace collision. Never define `--_tunet-*` vars in a shadow root stylesheet — doing so creates a new scope that overrides the inherited value from the card host, silently breaking the cascade

---

## 10. Token Consumer Boundaries

Explicit per component and per family. These are interface boundaries -- violations here cause subtle cross-family token bleed.

| Role | Reads | Writes |
|---|---|---|
| **Card host** | Nothing -- write-only | Sets all `--_tunet-*` via `_setProfileVars()` |
| **tile-core** | Core lane tokens (all 7) | Nothing |
| **tunet-row** (rooms-row only) | Core lane tokens + row extension tokens | Nothing |
| **indicator-tile** | Core lane tokens + indicator-tile extension tokens | Nothing |
| **indicator-row** | Core lane tokens + indicator-row extension tokens | Nothing |
| **tunet-tile** (tile-grid, speaker-tile) | Passes core tokens through via CSS cascade | Nothing -- does not reinterpret |

### Core Lane Tokens (all families)

Consumed by `tile-core` only. Every family profile entry must include all 7.

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-tile-pad` | `tile-core :host` padding | `tilePad` |
| `--_tunet-tile-gap` | `tile-core` lane gap | `tileGap` |
| `--_tunet-icon-box` | `.icon-wrap` width/height | `iconBox` |
| `--_tunet-icon-glyph` | `.icon` font-size | `iconGlyph` |
| `--_tunet-name-font` | `.name` font-size | `nameFont` |
| `--_tunet-value-font` | `.value` font-size | `valueFont` |
| `--_tunet-progress-h` | `.progress` height | `progressH` |

### Family Extension Tokens

Consumed only by the component that uses them. Not set for other families.

**`rooms-row` family → consumed by `tunet-row` only:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-row-height` | Row container min-height | `rowHeight` |
| `--_tunet-orb-size` | Orb button width/height | `orbSize` |
| `--_tunet-orb-gap` | Orb row gap | `orbGap` |
| `--_tunet-toggle-size` | All-toggle button size | `toggleSize` |
| `--_tunet-chevron-size` | Chevron icon size | `chevronSize` |

**`indicator-tile` family → consumed by `indicator-tile` component only:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-dropdown-pad` | Dropdown menu internal padding | `dropdownPad` |
| `--_tunet-aux-action-size` | Alarm/timer action button size | `auxActionSize` |

**`indicator-row` family → consumed by `indicator-row` component only:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-sparkline-h` | Sparkline chart height | `sparklineH` |
| `--_tunet-trend-size` | Trend arrow icon size | `trendSize` |

### Composition Rule

Composing components (`tunet-tile`, `tunet-row`) pass core tokens through the shadow cascade by inheriting from the card host -- they do not read and reinterpret them. Only `tile-core` reads core lane tokens. If a composing component modifies a core token before passing it, it breaks the boundary contract.

### CSS Cascade Path

```
card host (sets --_tunet-tile-pad: 10px on this.style)
  └→ shadow DOM
       └→ tunet-tile  (does not read --_tunet-*, inherits and passes through)
            └→ shadow DOM
                 └→ tile-core (reads var(--_tunet-tile-pad) in its own CSS)
```

`--_tunet-*` vars cascade through shadow boundaries automatically because they are set on the card host (the light DOM element), not inside any shadow root.

### Instance State

Each card instance owns:

```js
this._mergedConfig  = null;       // set by setConfig, immutable after
this._lastWidth     = 0;          // updated by ResizeObserver
this._profileCache  = new Map();  // instance-level memo cache
this._currentFamily = null;       // for cache invalidation on family change
this._resizeObserver = null;
```

### Single Convergence Point

Both trigger paths call `_applyProfile()`. It is the only place the resolver is invoked.

```js
setConfig(config) {
  const preset = config.preset ?? 'lighting';
  this._mergedConfig = deepMerge(PRESETS[preset].card_defaults, config);
  this._applyProfile();
}

_onResize(width) {
  this._lastWidth = width;
  this._applyProfile();
}

_applyProfile() {
  if (!this._mergedConfig) return; // setConfig hasn't fired yet

  // Feature flag check
  if (this._mergedConfig.use_profiles === false ||
      window.TUNET_USE_PROFILES === false) {
    this._applyLegacyScaling();
    return;
  }

  const { family, size } = selectProfileSize({
    preset:    this._mergedConfig.preset,
    layout:    this._mergedConfig.layout,
    widthHint: this._lastWidth,
    userSize:  this._mergedConfig.tile_size,
  });

  // Invalidate instance cache if family changed
  if (family !== this._currentFamily) {
    this._profileCache.clear();
    this._currentFamily = family;
  }

  const bucket   = bucketFromWidth(this._lastWidth);
  const cacheKey = `${family}:${size}:${bucket}`;

  let profile;
  if (this._profileCache.has(cacheKey)) {
    profile = this._profileCache.get(cacheKey);
  } else {
    profile = resolveSizeProfile({ family, size });
    this._profileCache.set(cacheKey, profile);
  }

  this._setProfileVars(profile);
}
```

### Trigger Table

| Event | Who fires | Action |
|---|---|---|
| `setConfig(config)` | HA on card load or config edit | Full merge → `_applyProfile()` |
| ResizeObserver callback | Browser after layout | Update `_lastWidth` → `_applyProfile()` |
| `set hass(hass)` | HA on any state change | Does NOT trigger `_applyProfile()` — profile resolution is geometry-only and not state-dependent |

**hass and profile resolution:** hass updates never trigger `_applyProfile()`. The only case where a hass update could affect profile resolution is if entity count affects layout (e.g., a group with 2 lights vs. 8 lights might need different tile sizes). If this case applies to a specific card, handle it in card-specific logic that calls `_applyProfile()` when entity count changes — not generically on every hass update.

### ResizeObserver and setConfig Interleaving

`setConfig` is synchronous. ResizeObserver callbacks are microtasks. They cannot interleave. If `setConfig` fires while a resize is pending, `setConfig` completes and updates `this._mergedConfig` before the callback fires. The subsequent `_applyProfile()` call in the ResizeObserver callback reads the fresh merged config. No stale state is possible.

### First-Render Behavior

`setConfig` fires before ResizeObserver has measured the container. On first render:

- `this._lastWidth` is `0`
- `autoSizeFromWidth(0)` returns `'standard'`
- Card renders at standard profile values
- ResizeObserver fires after first layout paint; if actual width is below 600px, `_applyProfile()` re-runs at compact size

To prevent a visible size flash on first render, apply `visibility: hidden` until the first ResizeObserver measurement arrives:

```js
connectedCallback() {
  this.style.visibility = 'hidden';
  this._profileCache = new Map();

  this._resizeObserver = new ResizeObserver(entries => {
    const width = entries[0]?.contentRect?.width ?? 0;
    this._lastWidth = width;
    this.style.visibility = 'visible'; // reveal after first real measurement
    this._applyProfile();
  });
  this._resizeObserver.observe(this);
}

disconnectedCallback() {
  this._resizeObserver?.disconnect();
  this._profileCache.clear();
}
```

### Speaker Grid Container Query Interaction

`tunet_speaker_grid_card.js` uses CSS container queries for column count behavior. The profile system uses JS-driven `style.setProperty()` for tile-level geometry. These do not conflict because they target non-overlapping property namespaces:

- Container queries govern: `grid-template-columns`, column count
- Profile vars govern: `--_tunet-icon-box`, `--_tunet-tile-pad`, and all tile-level geometry

Both are triggered by the same resize event (container size change fires both the container query breakpoint and the ResizeObserver callback). They run independently against different properties. No coordination required.

Document this explicitly in `tunet_speaker_grid_card.js` code comments so future maintainers don't attempt to consolidate them.

---

## 11. Feature Flag and Rollback

### Config Schema

```yaml
# Per-card disable (YAML config)
type: custom:tunet-lighting-card
preset: lighting
use_profiles: false

# Global emergency disable (browser console or HA script)
# window.TUNET_USE_PROFILES = false
```

### Fallback Path

When `use_profiles === false`, the card calls `_applyLegacyScaling()` — the pre-migration local scaling code. This code must remain in each card file, untouched, through all migration gates until G6.

```js
// Pre-profile scaling code is preserved as _applyLegacyScaling()
// Do not delete or modify until G6 cleanup gate
_applyLegacyScaling() {
  // [existing compact/standard/large sizing logic moved here verbatim]
}
```

### Card Editor UI

The `use_profiles` toggle must be surfaced in the `TunetCardEditor` UI — not only in raw YAML. Users must be able to disable profile consumption from the HA card editor when a card renders blank after a `tunet_base.js` update.

### G6 Cleanup

Legacy scaling code and the `use_profiles` flag are removed together at G6. This gate triggers only after:
- All pilot tranche cards migrated (G1–G5 passed)
- `use_profiles: false` confirmed set by zero users (manual review of configs)
- 30-day soak period with zero profile-related regressions

Legacy code and the flag are never removed independently.

---

## 12. Base API / Version Handshake

### Declaration in tunet_base.js

```js
export const PROFILE_SCHEMA_VERSION  = 'v1-YYYYMMDD';
export const REQUIRED_PROFILE_FEATURES = [
  'selectProfileSize', 'resolveSizeProfile', 'PRESET_FAMILY_MAP', 'SIZE_PROFILES', 'deepMerge'
];
```

### Guard in Every Card (setConfig or connectedCallback)

```js
_checkBaseCompat() {
  const base = window.TunetBase;
  if (!base) {
    this._renderError(
      'tunet_base.js not loaded. Add it as a dashboard resource before this card.'
    );
    return false;
  }
  if (!base.PROFILE_SCHEMA_VERSION) {
    this._renderError(
      'tunet_base.js is outdated (PROFILE_SCHEMA_VERSION missing). Clear the browser cache or update the resource URL.'
    );
    return false;
  }
  // Version comparison: string lexicographic is sufficient for 'v1', 'v2', etc.
  if (base.PROFILE_SCHEMA_VERSION < 'v1') {
    this._renderError(
      `tunet_base.js v1+ required. Loaded: ${base.PROFILE_SCHEMA_VERSION}. Update the resource URL.`
    );
    return false;
  }
  return true;
}

_renderError(message) {
  this.innerHTML = `
    <ha-card>
      <div style="
        padding: 16px;
        color: var(--error-color, #f44336);
        font-size: 13px;
        font-family: monospace;
        line-height: 1.5;
      ">
        ⚠ Tunet: ${message}
      </div>
    </ha-card>
  `;
}
```

**Why visible error:** Uncaught JS in HA freezes the card element with blank output and no user-visible indication. `_renderError()` is the only acceptable failure mode — it gives the user information to act on.

### Schema Bump Policy (v1 → v2+)

When `PROFILE_SCHEMA_VERSION` increments:
1. New keys in `SIZE_PROFILES` get fallback values in the resolver (`SIZE_PROFILES[family][size][key] ?? DEFAULT_FALLBACKS[key]`)
2. Renamed keys are supported under both old and new names for one version with `console.warn`
3. Removed keys produce `console.warn` naming the key and its replacement
4. Every version bump requires an entry in `CHANGELOG.md` and an update to this document

---

## 13. Width Source Standardization (G0/G1 Prerequisite)

Container-first measurement is non-negotiable. The profile resolver accepts `widthHint` from the card's ResizeObserver — never from `window.innerWidth`.

### Required Changes (G1 blocking)

**`tunet_lighting_card.js`:**
- Remove `window.innerWidth` column resolution path entirely
- Remove `matchMedia` row-height branches that fire on viewport resize
- All responsive behavior via ResizeObserver on the card element only

**`tunet_status_card.js`:**
- Remove `window.resize` event listener
- Keep `ResizeObserver` + `getBoundingClientRect` path
- Ensure `getBoundingClientRect` is called inside the ResizeObserver callback only

**`tunet_base.js`:**
- Mark viewport media thresholds in `RESPONSIVE_BASE` as `// DEPRECATED: do not use for profile-driven families`
- Retain as documentation reference only

### Enforcement

There is no runtime enforcement — the resolver cannot know the source of `widthHint`. This is a mandatory code review criterion at G1 exit: confirm by inspection that neither `window.innerWidth` nor `matchMedia` appears in any sizing branch of pilot tranche cards.

---

## 14. deepMerge Specification

Lives in `tunet_base.js`. Used for all config merge passes.

### Merge Rules

| Value type | Rule |
|---|---|
| Plain objects (`actions`, `style`, profile blocks) | Recurse — lower-priority keys survive unless explicitly overridden |
| Primitives (string, number, boolean) | Override wins. `undefined` does NOT override — skip undefined keys |
| Arrays (`tiles`, `orbs`, `entities`) | Replace entirely. No concatenation |
| `null` | Explicit clear — overrides any inherited value with null/empty |

### Implementation

```js
export function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base ?? override;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const val = override[key];
    if (val === undefined) continue;                            // skip — don't clobber base
    if (val === null) { result[key] = null; continue; }        // explicit clear
    if (Array.isArray(val)) { result[key] = val; continue; }   // arrays replace entirely
    if (isPlainObject(val) && isPlainObject(base?.[key])) {
      result[key] = deepMerge(base[key], val);                 // recurse into plain objects
    } else {
      result[key] = val;                                        // override wins
    }
  }
  return result;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}
```

### 4-Level Application

```js
const finalTileConfig = deepMerge(
  deepMerge(
    deepMerge(preset.card_defaults, card_defaults),
    preset.tile_defaults
  ),
  per_tile_config
);
```

### Highest-Risk Merge Cases

- **`actions` object:** `tile_config: { actions: { tap: 'navigate' } }` must preserve `hold: 'more-info'` from preset. deepMerge handles this correctly — object keys are merged, not replaced
- **`style` block:** Card-level `style: { accent: 'blue' }` must merge into preset style, not replace it
- **`tiles` array:** Always replaces — intentional. Array merging produces nonsense for ordered tile lists

---

## 15. Gate Sequence with Operational Exit Criteria

### G0: Prerequisites Lock (documentation only, no code changes)

**All must be true to clear G0:**

- [ ] Width source changes planned (files + functions identified) — actual changes at G1
- [ ] `ensureGlobalOffsetsStyle()` neutralization plan documented (stub or scope guard approach chosen)
- [ ] Tranche owner (Mac Connolly) has reviewed and signed off on this document
- [ ] T-011A active surface lock milestone is complete or explicitly deferred with written justification
- [ ] `design_language.md` parity lock updated to note `v2/` as implementation authority
- [ ] All locked decisions in §3 confirmed
- [ ] Weighted scoring matrix confirmed (§4)
- [ ] Pilot tranche file list locked: `tunet_base.js`, `tunet_lighting_card.js`, `tunet_speaker_grid_card.js`, `tunet_status_card.js`, `tunet_rooms_card.js`, `tunet_light_tile.js`
- [ ] Breakpoint check targets declared: `390×844`, `768×1024`, `1024×1366`, `1440×900`

---

### G1: Base Primitives

**Files changed:** `tunet_base.js` only  
**Expected visual change:** None

**Functions/constants added:**
- `PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD'`
- `PRESET_FAMILY_MAP` (5 families)
- `FAMILY_KEYS`, `SIZE_KEYS`
- `PROFILE_BASE` shared base object
- `SIZE_PROFILES` registry (5 families × 3 sizes)
- `selectProfileSize()` — caller-layer selector
- `resolveSizeProfile()` — pure lookup with warn+fallback
- `autoSizeFromWidth()`, `bucketFromWidth()`
- `deepMerge()` with `isPlainObject()`

**Width source fixes (also at G1):**
- `tunet_lighting_card.js`: remove `window.innerWidth` and `matchMedia` sizing branches
- `tunet_status_card.js`: remove `window.resize` listener
- `tunet_base.js`: deprecate viewport thresholds in `RESPONSIVE_BASE`

**Exit criteria:**

Unit tests (run without HA):
- [ ] All 15 family+size combinations (5 families × 3 sizes) return complete token sets with no `undefined` values
- [ ] `resolveSizeProfile({ family: 'tile-grid', size: 'standard' })` returns expected values
- [ ] `resolveSizeProfile({ family: 'unknown', size: 'standard' })` warns + returns `tile-grid` standard
- [ ] `resolveSizeProfile({ family: 'tile-grid', size: 'slim' })` warns + returns `tile-grid` standard
- [ ] `PROFILE_BASE` typography values are identical across `tile-grid` standard and `speaker-tile` standard (confirms spread works)
- [ ] `indicator-tile` and `indicator-row` return `progressH: 0` for all sizes
- [ ] `rooms-row` returns row-specific keys (`orbSize`, `toggleSize`, `chevronSize`, `rowHeight`) for all sizes
- [ ] `selectProfileSize({ preset: 'rooms', layout: 'row', widthHint: 400 })` returns family `rooms-row`
- [ ] `selectProfileSize({ preset: 'rooms', layout: 'grid', widthHint: 400 })` returns family `tile-grid`
- [ ] `selectProfileSize({ preset: 'speakers', layout: 'grid', widthHint: 700 })` returns family `speaker-tile`
- [ ] `selectProfileSize` with explicit `userSize: 'large'` returns `large` regardless of `widthHint`
- [ ] `selectProfileSize` with unknown preset warns + returns `tile-grid` standard
- [ ] Second `resolveSizeProfile` call with same inputs returns cached object (reference equality)
- [ ] `autoSizeFromWidth(0)` returns `'standard'`
- [ ] `autoSizeFromWidth(350)` returns `'compact'`
- [ ] `autoSizeFromWidth(700)` returns `'standard'`
- [ ] `deepMerge` primitive override: `deepMerge({a:1},{a:2})` returns `{a:2}`
- [ ] `deepMerge` undefined skip: `deepMerge({a:1},{a:undefined})` returns `{a:1}`
- [ ] `deepMerge` null clear: `deepMerge({a:1},{a:null})` returns `{a:null}`
- [ ] `deepMerge` array replace: `deepMerge({a:[1,2]},{a:[3]})` returns `{a:[3]}`
- [ ] `deepMerge` object recurse: `deepMerge({actions:{tap:'toggle',hold:'more-info'}},{actions:{tap:'navigate'}})` returns `{actions:{tap:'navigate',hold:'more-info'}}`

Code review:
- [ ] No `window.innerWidth` in `tunet_lighting_card.js` sizing path
- [ ] No `matchMedia` in `tunet_lighting_card.js` sizing path
- [ ] No `window.resize` listener in `tunet_status_card.js`
- [ ] `RESPONSIVE_BASE` viewport thresholds marked deprecated

Regression:
- [ ] Screenshot comparison: `tunet_lighting_card` at all 4 breakpoints — identical to pre-G1 baseline
- [ ] Screenshot comparison: `tunet_status_card` at all 4 breakpoints — identical to pre-G1 baseline

---

### G2: Two-Card Pilot

**Files changed:** `tunet_lighting_card.js`, `tunet_speaker_grid_card.js`

**Changes per file:**

Both files add:
- `connectedCallback` with ResizeObserver pattern (visibility hidden/reveal)
- `disconnectedCallback` with observer disconnect and cache clear
- `_applyProfile()` as single convergence point
- `_setProfileVars(profile)` applying internal aliases to `this`
- `_renderError(message)` visible error renderer
- `_checkBaseCompat()` version guard (called in setConfig)
- `_applyLegacyScaling()` wrapping existing sizing code verbatim (kept intact)
- `use_profiles` flag check in `_applyProfile()`
- `use_profiles` toggle in card editor UI

Both files remove:
- Hardcoded compact/large lane values from render path (now consumed from `--_tunet-*` vars in CSS)

`tunet_speaker_grid_card.js` only:
- Code comment explicitly documenting that container queries govern column count and profile vars govern tile geometry — non-overlapping, no coordination required

**Parity definition:** At the same widthHint bucket, both cards must produce identical computed values for shared internal CSS custom properties. This is the quantitative pass/fail criterion.

**Exit criteria:**

Profile parity (devtools inspection):

*Note: lighting uses `tile-grid` family; speakers uses `speaker-tile` family. Core lane tokens from `PROFILE_BASE` are shared. `tilePad` differs by design.*

- [ ] At 390px: lighting card shows `--_tunet-icon-box: 38px` (PROFILE_BASE compact, tile-grid)
- [ ] At 390px: speaker card shows `--_tunet-icon-box: 38px` (PROFILE_BASE compact, speaker-tile)
- [ ] At 390px: lighting card shows `--_tunet-tile-pad: 10px` (tile-grid compact)
- [ ] At 390px: speaker card shows `--_tunet-tile-pad: 8px` (speaker-tile compact -- intentionally differs)
- [ ] At 390px: lighting card shows `--_tunet-progress-h: 7px` (tile-grid compact)
- [ ] At 390px: speaker card shows `--_tunet-progress-h: 6px` (speaker-tile compact -- intentionally differs)
- [ ] At 700px: lighting card shows `--_tunet-icon-box: 38px` (PROFILE_BASE standard -- no override)
- [ ] At 700px: speaker card shows `--_tunet-icon-box: 38px` (same)
- [ ] With `tile_size: large` explicit in lighting config: `--_tunet-icon-box: 44px` regardless of container width

Interaction regression:
- [ ] Lighting drag-to-brightness gesture: works at all 4 breakpoints (manual test)
- [ ] Speaker drag-to-volume gesture: works at all 4 breakpoints (manual test)
- [ ] Speaker group toggle: functions correctly
- [ ] Lighting tap-to-toggle: functions correctly

Feature flag:
- [ ] `use_profiles: false` on lighting card reverts to pre-G2 visual (screenshot comparison)
- [ ] `use_profiles: false` toggle accessible in card editor UI
- [ ] Global `window.TUNET_USE_PROFILES = false` in browser console disables both cards

Version handshake:
- [ ] Temporarily remove `PROFILE_SCHEMA_VERSION` from `tunet_base.js` — both cards show visible in-card error, not blank output

Screenshot regression:
- [ ] All 4 breakpoints — lighting and speaker cards visual output compared to pre-G2 baseline with `use_profiles: false`

---

### G3: Interaction-Heavy Families

**Pre-gate action required:** `tunet_nav_card.js` `ensureGlobalOffsetsStyle()` must be stubbed or scoped before regression testing runs. Section sizing measurements must be taken against a clean baseline unaffected by nav card offset injection.

**Files changed:** `tunet_status_card.js`, `tunet_rooms_card.js`

**Changes:**

`tunet_status_card.js`:
- Add profile consumption pattern (same as G2 cards)
- Profile applies to base lane geometry from `indicator-tile` family: `tilePad`, `iconBox`, `nameFont`, `valueFont`
- Subtype geometry (dropdown overflow height, alarm button sizing, timer display) remains in card-local CSS
- `progressH: 0` from `indicator-tile` profile -- status cards have no profile-level progress bar

`tunet_rooms_card.js`:
- Grid layout mode: `selectProfileSize` returns family `tile-grid`
- Row layout mode: `selectProfileSize` returns family `rooms-row`
- Profile applies to tile lane and row geometry (`orbSize`, `toggleSize`, `chevronSize`, `rowHeight`)
- Row semantics (tap → navigate, hold → popup, orb toggle, all-toggle) remain entirely card-local -- not touched
- `layout_variant: 'slim'` handled by CSS class addition in card render logic, not by profile resolver

**Exit criteria:**

Status subtypes:
- [ ] Dropdown overflow height unchanged from pre-G3 baseline at all 4 breakpoints (screenshot)
- [ ] Alarm buttons render at correct hit target size at compact and standard — measured devtools `offsetHeight` matches pre-G3
- [ ] Timer countdown continues live countdown after migration

Rooms row:
- [ ] `--_tunet-orb-size` computed on card host is `26px` at standard, `20px` at compact (devtools)
- [ ] `--_tunet-row-height` is `68px` at standard (devtools)
- [ ] Rooms grid layout: `--_tunet-icon-box` is `40px` at standard (tile-grid, not rooms-row value)
- [ ] Slim variant row height is approximately 70% of standard row height (measured)
- [ ] Orb toggles function after migration
- [ ] Room navigation on row tap functions after migration
- [ ] All-toggle button functions after migration

Nav neutralization:
- [ ] `ensureGlobalOffsetsStyle()` confirmed not injecting during G3 testing session
- [ ] Section sizing measurements taken with nav injection neutralized — baseline is clean

---

### G4: Standalone Tile Alignment

**Files changed:** `tunet_light_tile.js`

**Changes:**
- Align standalone tile to `tile-grid` family profile
- tile-core CSS updated to consume `--_tunet-*` internal aliases with fallback values
- Add `_applyProfile()` pattern (standalone tile is its own host, sets vars on itself)

**Exit criteria:**
- [ ] Standalone `tunet-light-tile` at standard size visually matches a `tunet_lighting_card` tile at standard size — screenshot comparison at 390px and 768px
- [ ] `--_tunet-icon-box` computed on standalone tile host matches lighting card at same size
- [ ] Drag-to-brightness gesture functions on standalone tile
- [ ] Tap-to-toggle functions

---

### G5: Sections Size-Hint Calibration

**Files changed:** All pilot tranche cards (minor adjustments to `getCardSize()` and `getGridOptions()`)

**Changes:**
- Measure actual rendered card heights at each profile size in a real Sections layout (not estimated)
- Update `getCardSize()` return values to match measured heights
- Update `getGridOptions()` min/max row constraints to match profile lane heights

**Exit criteria:**
- [ ] Cards in Sections layout do not clip or overflow their allocated rows at any profile size at all 4 breakpoints
- [ ] `getCardSize()` return values within 10% of actual measured card height
- [ ] No stacking or overlap regressions in multi-card Sections views

---

### G6: Cleanup (post-soak only)

**Earliest trigger:** 30 days after G5 passes with zero profile-related regressions.

**Files changed:** All pilot tranche cards

**Changes:**
- Remove all `_applyLegacyScaling()` methods
- Remove all `use_profiles` flag checks
- Remove `use_profiles` from card editor UI
- Remove global `window.TUNET_USE_PROFILES` check

**Exit criteria:**
- [ ] `use_profiles: false` confirmed set by zero users (config review)
- [ ] `_applyLegacyScaling()` removed from all 5 cards
- [ ] All G2/G3/G4 exit criteria re-verified after cleanup
- [ ] `_renderError()` and `_checkBaseCompat()` remain (still needed for version handshake)

---

## 16. Anti-Patterns

Each item here represents an implementation trap that will silently break the system.

| Anti-pattern | Why it breaks |
|---|---|
| Setting `--profile-*` public hooks in card CSS and reading them in tile-core | Removes the protection model entirely |
| Defining `--_tunet-*` internal aliases inside a shadow root stylesheet | Creates a new CSS scope that overrides the inherited card-host value, breaking cascade |
| Passing `window.innerWidth` as `widthHint` | Profile resolution becomes viewport-dependent; breaks embedded panel and sidebar scenarios |
| Adding `densityMode` back to resolver signature | Compact IS dense. Two axes with no resolution rule create irresolvable config conflicts |
| Using `slim` as a size key in `SIZE_PROFILES` | Slim is a structural layout variant, not a sizing variant |
| Treating `tile_size` config key parity as success | Success criterion is computed CSS value parity (devtools inspection), not config key parity |
| Calling `_applyProfile()` from `set hass()` generically | hass fires on every HA state change — this is a catastrophic performance regression for any card with 3+ tiles |
| Module-level `_profileCache` | Stale state shared across card instances of the same family with different configs |
| Calling `getComputedStyle()` outside ResizeObserver or setConfig | Triggers forced layout reflow |
| Deleting legacy scaling code before G6 | Removes the rollback path |
| Migrating all cards in one tranche | Regression blast radius is too high |
| Encoding interaction semantics in profile definitions | Profiles own geometry only. Behavior lives in preset defaults and card logic |
| Setting profile vars on `this.shadowRoot` instead of `this` | Vars don't cascade out of the shadow root to nested components |

---

## 17. Dark Mode Policy

Profile values are mode-agnostic geometry — raw numbers in pixels with no color, no opacity, no alpha.

Dark and light mode are handled at the token layer (`TOKENS` / `TOKENS_MIDNIGHT` in `tunet_base.js`) above this pipeline. Tokens cascade through shadow boundaries independent of profile resolution.

Profile resolution does not change when the user switches color mode. There are no dark-mode variants in `SIZE_PROFILES`. Any card that adds dark/light branches to the profile registry is in violation of this document.

---

## 18. File Authority Map

| File | Gates | What changes | What stays |
|---|---|---|---|
| `tunet_base.js` | G0 prereq → G1 code | Add profile registry, resolver, deepMerge, family map, width utilities, deprecation markers | All existing tokens, RESPONSIVE_BASE (with deprecated notes), all existing utility exports |
| `tunet_lighting_card.js` | G1 (width fix), G2 (profile) | Width source fix, profile consumption, feature flag, editor UI toggle | All gesture handlers, hass entity logic, all render logic |
| `tunet_speaker_grid_card.js` | G2 | Profile consumption, feature flag | Container query column logic, group toggle, all render logic |
| `tunet_status_card.js` | G3 | Profile consumption for base lanes | Subtype geometry (local CSS), dropdown mechanics, alarm button logic, timer display |
| `tunet_rooms_card.js` | G3 | Profile consumption (grid → tile-grid, row → rooms-row) | Row semantics, orb logic, slim CSS class, navigation/popup behavior |
| `tunet_light_tile.js` | G4 | Align to tile-grid profile, tile-core CSS to consume `--_tunet-*` | Drag gesture, hass binding, tap/hold |
| All pilot tranche cards | G6 | Remove legacy scaling + use_profiles flag | `_renderError()`, `_checkBaseCompat()`, all profile consumption code |

---

## 19. Acceptance Checklist

Path is approved to execute (G0 cleared) when all are confirmed:

- [ ] Weighted option decision recorded as Option C (gated) — §3, §4
- [ ] All 12 decisions in §3 locked and tranche owner signed off
- [ ] Profile schema v1 keys and numeric values fixed — §7
- [ ] Width source policy fixed to container-first, required file changes identified — §13
- [ ] Pilot tranche file list locked — §2
- [ ] Breakpoint check targets declared: `390×844`, `768×1024`, `1024×1366`, `1440×900`
- [ ] Parity definition quantified (computed CSS value inspection via devtools) — §15 G2
- [ ] Regression guard behaviors defined for all 4 interaction paths — §15 G2/G3
- [ ] Feature flag `use_profiles` designed with editor UI surface — §11
- [ ] Version handshake `_renderError()` pattern specified — §12
- [ ] Nav card neutralization plan documented for G3 — §2
- [ ] Out-of-scope states declared for all excluded cards — §2
- [ ] Legacy scaling code preservation until G6 confirmed — §11
- [ ] Dark mode boundary policy stated — §17
