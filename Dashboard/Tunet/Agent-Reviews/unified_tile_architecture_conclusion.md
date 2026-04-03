# Tunet Profile Consumption Architecture
**Version:** 3.3 — Status Alignment Deferral Update
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
- 5-family registry with size-indexed `PROFILE_BASE` shared inheritance (all-em values)
- Preset-to-family mapping and two-function API (`selectProfileSize` + `resolveSizeProfile`)
- End-to-end density scaling: card chrome, tile internals, control surfaces, radii, spacing, typography, status subtypes
- CSS custom property protection model and token consumer boundaries
- Token ownership rules for registry maintenance
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
| `tunet_status_card.js` | Deferred (G3S) | Excluded from current tranche gates | Bugfix-only until dedicated status tranche starts |
| `tunet_rooms_card.js` | In scope (G3) | In scope | None |
| `tunet_light_tile.js` | In scope (G4) | In scope | None |
| `tunet_nav_card.js` | Excluded from migration | Excluded | **Neutralize before G3:** `ensureGlobalOffsetsStyle()` must be scoped or stubbed so it cannot inject offsets that corrupt section sizing measurements during G3 regression testing. Does not need to be fixed — only neutralized |
| `tunet_media_card.js` | Excluded | Excluded | None |
| `tunet_sonos_card.js` | Excluded | Excluded | None |
| `tunet_weather_card.js` | Excluded | Excluded | None |
| `tunet_climate_card.js` | Excluded | Excluded | None — gold standard card, profile adoption deferred until post-G6 |
| `tunet_actions_card.js` | Excluded | Excluded | None — strip layout, not tile-based |
| `tunet_scenes_card.js` | Excluded | Excluded | None — strip layout, not tile-based |
| `tunet_sensor_card.js` | Excluded | Excluded | None — may adopt `indicator-row` family in future gate |

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
| D18 | All token values are em strings, not raw px numbers | Single `font-size` on `:host` becomes a master density lever; proportions stay coherent at any base size; responsive scaling via `font-size: clamp(...)` becomes trivially possible |
| D19 | Size-indexed `PROFILE_BASE`: `{ compact: {...}, standard: {...}, large: {...} }` | Each family spreads the correct size's base and only overrides what diverges — no ambiguity about which base applies |
| D20 | Status subtype internals should be progressively aligned with shared profile lanes where low-risk | Full subtype tokenization is deferred; current path is bugfix-only + lightweight alignment in deferred `G3S` |
| D21 | End-to-end density surface: card chrome, control surfaces, radii, spacing, dropdown geometry, secondary typography all scale with profile | Profiles own the entire density experience, not just tile-core geometry |
| D22 | `ddRadius` added to PROFILE_BASE (dropdown border-radius, 0.5em standard) | Dropdowns need tighter radius than tiles; fixed radius at varying density breaks visual coherence |

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

Lives in `tunet_base.js`. All values are pre-formatted CSS em strings. No raw numbers, no px — everything scales from the card host's `font-size`.

### Unit Rule (D18)

| Category | Unit | Rationale |
|---|---|---|
| Typography (fonts) | em | Cascading scale from host font-size |
| Geometry (padding, gaps, heights, sizes) | em | Proportional density at any base size |
| Radii | em | Scales with density to maintain visual coherence |
| Letter-spacing | em | Relative to text context |
| Line-height | unitless ratio | Standard CSS best practice |

### PROFILE_BASE (size-indexed, D19)

Shared across all families per size. Override only where a family genuinely diverges — spread first, then override explicitly.

```js
export const FAMILY_KEYS = ['tile-grid', 'speaker-tile', 'rooms-row', 'indicator-tile', 'indicator-row'];
export const SIZE_KEYS   = ['compact', 'standard', 'large'];

const PROFILE_BASE = {
  compact: {
    cardPad: '0.875em',
    sectionPad: '0.875em',
    sectionGap: '0.75em',
    headerHeight: '2.375em',
    headerFont: '0.75em',
    sectionFont: '0.8125em',
    tilePad: '0.625em',
    tileGap: '0.25em',
    tileRadius: '0.75em',
    ddRadius: '0.4375em',
    iconBox: '2.125em',
    iconGlyph: '1.0625em',
    nameFont: '0.75em',
    valueFont: '1.0625em',
    subFont: '0.6875em',
    unitFont: '0.6875em',
    ctrlMinH: '2.375em',
    ctrlPadX: '0.625em',
    ctrlIconSize: '1.125em',
    ddOptionFont: '0.75em',
    ddOptionPadY: '0.5em',
    ddOptionPadX: '0.625em',
    dropdownMinH: '7.5em',
    dropdownMaxH: '13.75em',
    progressH: '0.375em'
  },
  standard: {
    cardPad: '1.25em',
    sectionPad: '1.25em',
    sectionGap: '1em',
    headerHeight: '2.625em',
    headerFont: '0.8125em',
    sectionFont: '0.875em',
    tilePad: '0.875em',
    tileGap: '0.375em',
    tileRadius: '0.875em',
    ddRadius: '0.5em',
    iconBox: '2.375em',
    iconGlyph: '1.1875em',
    nameFont: '0.8125em',
    valueFont: '1.125em',
    subFont: '0.6875em',
    unitFont: '0.6875em',
    ctrlMinH: '2.625em',
    ctrlPadX: '0.75em',
    ctrlIconSize: '1.25em',
    ddOptionFont: '0.8125em',
    ddOptionPadY: '0.5625em',
    ddOptionPadX: '0.75em',
    dropdownMinH: '7.5em',
    dropdownMaxH: '15em',
    progressH: '0.5em'
  },
  large: {
    cardPad: '1.5em',
    sectionPad: '1.5em',
    sectionGap: '1.25em',
    headerHeight: '2.75em',
    headerFont: '0.875em',
    sectionFont: '1em',
    tilePad: '1em',
    tileGap: '0.5em',
    tileRadius: '1em',
    ddRadius: '0.5625em',
    iconBox: '2.75em',
    iconGlyph: '1.375em',
    nameFont: '0.875em',
    valueFont: '1.25em',
    subFont: '0.75em',
    unitFont: '0.75em',
    ctrlMinH: '2.75em',
    ctrlPadX: '0.875em',
    ctrlIconSize: '1.375em',
    ddOptionFont: '0.875em',
    ddOptionPadY: '0.625em',
    ddOptionPadX: '0.875em',
    dropdownMinH: '8em',
    dropdownMaxH: '17.5em',
    progressH: '0.625em'
  }
};
```

### SIZE_PROFILES (family entries)

Each family spreads `PROFILE_BASE[size]` and overrides only diverging values.

```js
export const SIZE_PROFILES = {

  // Interactive grid tiles — lighting, rooms (grid mode)
  'tile-grid': {
    compact:  { ...PROFILE_BASE.compact,  tileMinH: '5.125em' },
    standard: { ...PROFILE_BASE.standard, tileMinH: '5.75em'  },
    large:    { ...PROFILE_BASE.large,    tileMinH: '6.375em' }
  },

  // Speaker grid tiles — same tile-core, tighter geometry for audio density
  'speaker-tile': {
    compact: {
      ...PROFILE_BASE.compact,
      tilePad: '0.5em',
      tileGap: '0.25em',
      tileMinH: '5.25em',
      progressH: '0.375em'
    },
    standard: {
      ...PROFILE_BASE.standard,
      tilePad: '0.625em',
      tileGap: '0.3125em',
      tileMinH: '5.875em',
      subFont: '0.71875em',
      progressH: '0.4375em'
    },
    large: {
      ...PROFILE_BASE.large,
      tilePad: '0.75em',
      tileGap: '0.4375em',
      tileMinH: '6.5em',
      progressH: '0.5625em'
    }
  },

  // Rooms row layout — core tile lane + row-specific controls
  'rooms-row': {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: '0.96875em',
      rowMinH: '6.8125em',
      rowGap: '0.34em',
      rowTitleFont: '0.9375em',
      rowStatusFont: '0.8125em',
      orbSize: '2.96em',
      orbIcon: '1.56em',
      toggleSize: '2.96em',
      toggleIcon: '1.56em',
      chevronSize: '1.28em',
      rowBtnRadius: '0.5625em'
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: '1.0625em',
      rowMinH: '7.3125em',
      rowGap: '0.52em',
      rowTitleFont: '1.03125em',
      rowStatusFont: '0.90625em',
      orbSize: '3.16em',
      orbIcon: '1.62em',
      toggleSize: '3.16em',
      toggleIcon: '1.62em',
      chevronSize: '1.56em',
      rowBtnRadius: '0.75em'
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: '1.125em',
      rowMinH: '7.875em',
      rowGap: '0.625em',
      rowTitleFont: '1.125em',
      rowStatusFont: '0.96875em',
      orbSize: '3.4em',
      orbIcon: '1.76em',
      toggleSize: '3.4em',
      toggleIcon: '1.76em',
      chevronSize: '1.7em',
      rowBtnRadius: '0.8125em'
    }
  },

  // Status indicator tiles — interactive subtypes (dropdown, alarm, timer)
  // D20 target values live here; full subtype consumption is deferred to G3S.
  'indicator-tile': {
    compact: {
      ...PROFILE_BASE.compact,
      headerFont: '0.875em',
      sectionFont: '0.875em',
      tileMinH: '5.5em',
      timerFont: '1.0625em',
      timerLetterSpacing: '0.02em',
      alarmPillFont: '0.875em',
      alarmBtnH: '1.125em',
      alarmBtnFont: '0.5em',
      alarmIconSize: '0.625em',
      dropdownMaxH: '13.75em'
    },
    standard: {
      ...PROFILE_BASE.standard,
      headerFont: '1em',
      sectionFont: '0.9375em',
      tileMinH: '5.875em',
      timerFont: '1.125em',
      timerLetterSpacing: '0.03125em',
      alarmPillFont: '0.9375em',
      alarmBtnH: '1.25em',
      alarmBtnFont: '0.5625em',
      alarmIconSize: '0.6875em',
      dropdownMaxH: '15em'
    },
    large: {
      ...PROFILE_BASE.large,
      headerFont: '1.125em',
      sectionFont: '1em',
      tileMinH: '7.125em',
      timerFont: '1.25em',
      timerLetterSpacing: '0.04em',
      alarmPillFont: '1em',
      alarmBtnH: '1.375em',
      alarmBtnFont: '0.625em',
      alarmIconSize: '0.75em',
      dropdownMaxH: '17.5em'
    }
  },

  // Sensor / environment rows — horizontal list, sparkline, trend arrow
  'indicator-row': {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: '0.875em',
      rowMinH: '3em',
      rowGap: '0.625em',
      rowPadY: '0.625em',
      rowPadX: '0.125em',
      iconBox: '2em',
      iconGlyph: '1.125em',
      nameFont: '0.75em',
      subFont: '0.6875em',
      valueFont: '1.125em',
      unitFont: '0.6875em',
      sparklineW: '2.5em',
      sparklineH: '1.25em',
      trendBox: '1.125em',
      trendGlyph: '0.875em',
      sparkStroke: '0.09375em'
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: '0.9375em',
      rowMinH: '3.5em',
      rowGap: '0.75em',
      rowPadY: '0.75em',
      rowPadX: '0.25em',
      iconBox: '2.25em',
      iconGlyph: '1.25em',
      nameFont: '0.8125em',
      subFont: '0.6875em',
      valueFont: '1.25em',
      unitFont: '0.6875em',
      sparklineW: '3em',
      sparklineH: '1.5em',
      trendBox: '1.25em',
      trendGlyph: '1em',
      sparkStroke: '0.09375em'
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: '1em',
      rowMinH: '4em',
      rowGap: '0.875em',
      rowPadY: '0.875em',
      rowPadX: '0.3125em',
      iconBox: '2.5em',
      iconGlyph: '1.375em',
      nameFont: '0.875em',
      subFont: '0.75em',
      valueFont: '1.375em',
      unitFont: '0.75em',
      sparklineW: '3.5em',
      sparklineH: '1.75em',
      trendBox: '1.375em',
      trendGlyph: '1.125em',
      sparkStroke: '0.109375em'
    }
  }
};
```

### Registry Discipline

- **No color, opacity, or theme-conditional values** in `PROFILE_BASE` or any family entry. Geometry and typography only. (D17 dark mode policy)
- **All values are em strings** — the resolver returns them as-is. `_setProfileVars()` sets them directly with no unit conversion.
- **Override only where a family genuinely diverges** from `PROFILE_BASE[size]`. If a family entry has 0 overrides at a given size, it still explicitly spreads the base for readability.
- **`ddRadius` (D22):** Dropdown border-radius, slightly tighter than `tileRadius`. Available to any family that renders dropdown surfaces.

### Status Subtype Geometry (D20)

Status subtype geometry is a deferred alignment surface. Current policy is incremental: adopt shared profile lanes where low-risk, keep behavior stable, and avoid deep subtype rewrites in the active unification tranche.

### Slim Variant

Not in the registry. `layout_variant: 'slim'` triggers a CSS class in `tunet_rooms_card.js` that scales `rowMinH` to ~70% and hides secondary controls. The resolver is not involved.

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
 * @returns {Object} Flat token map — all values are pre-formatted CSS strings (e.g. '0.875em')
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

Since all registry values are pre-formatted em strings (D18), the implementation is a data-driven loop — no unit conversion, no family-conditional blocks.

```js
// Static token map: registry key → CSS custom property name
// Family-specific tokens are only present in their family's profile objects,
// so the undefined check naturally handles family filtering.
const TOKEN_MAP = {
  // Card chrome
  cardPad:      '--_tunet-card-pad',
  sectionPad:   '--_tunet-section-pad',
  sectionGap:   '--_tunet-section-gap',
  headerHeight: '--_tunet-header-height',
  headerFont:   '--_tunet-header-font',
  sectionFont:  '--_tunet-section-font',
  // Tile core
  tilePad:      '--_tunet-tile-pad',
  tileGap:      '--_tunet-tile-gap',
  tileRadius:   '--_tunet-tile-radius',
  tileMinH:     '--_tunet-tile-min-h',
  iconBox:      '--_tunet-icon-box',
  iconGlyph:    '--_tunet-icon-glyph',
  nameFont:     '--_tunet-name-font',
  valueFont:    '--_tunet-value-font',
  subFont:      '--_tunet-sub-font',
  unitFont:     '--_tunet-unit-font',
  progressH:    '--_tunet-progress-h',
  // Control surfaces
  ctrlMinH:     '--_tunet-ctrl-min-h',
  ctrlPadX:     '--_tunet-ctrl-pad-x',
  ctrlIconSize: '--_tunet-ctrl-icon-size',
  // Dropdown (shared)
  ddRadius:     '--_tunet-dd-radius',
  ddOptionFont: '--_tunet-dd-option-font',
  ddOptionPadY: '--_tunet-dd-option-pad-y',
  ddOptionPadX: '--_tunet-dd-option-pad-x',
  dropdownMinH: '--_tunet-dropdown-min-h',
  dropdownMaxH: '--_tunet-dropdown-max-h',
  // rooms-row extensions
  rowMinH:       '--_tunet-row-min-h',
  rowGap:        '--_tunet-row-gap',
  rowTitleFont:  '--_tunet-row-title-font',
  rowStatusFont: '--_tunet-row-status-font',
  orbSize:       '--_tunet-orb-size',
  orbIcon:       '--_tunet-orb-icon',
  toggleSize:    '--_tunet-toggle-size',
  toggleIcon:    '--_tunet-toggle-icon',
  chevronSize:   '--_tunet-chevron-size',
  rowBtnRadius:  '--_tunet-row-btn-radius',
  // indicator-tile extensions
  timerFont:          '--_tunet-timer-font',
  timerLetterSpacing: '--_tunet-timer-ls',
  alarmPillFont:      '--_tunet-alarm-pill-font',
  alarmBtnH:          '--_tunet-alarm-btn-h',
  alarmBtnFont:       '--_tunet-alarm-btn-font',
  alarmIconSize:      '--_tunet-alarm-icon-size',
  // indicator-row extensions
  rowPadY:      '--_tunet-row-pad-y',
  rowPadX:      '--_tunet-row-pad-x',
  sparklineW:   '--_tunet-sparkline-w',
  sparklineH:   '--_tunet-sparkline-h',
  trendBox:     '--_tunet-trend-box',
  trendGlyph:   '--_tunet-trend-glyph',
  sparkStroke:  '--_tunet-spark-stroke',
};

_setProfileVars(profile) {
  // Step 1: Clear all existing internal aliases — prevents stale tokens on family switch (D11)
  for (const prop of [...this.style]) {
    if (prop.startsWith('--_tunet-')) this.style.removeProperty(prop);
  }

  // Step 2: Set all tokens present in this profile — data-driven, no conditionals
  // Values are pre-formatted em strings — set directly, no unit conversion
  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    if (profile[key] !== undefined) {
      this.style.setProperty(cssVar, profile[key]);
    }
  }

  // Step 3: Bridge public hooks — if user has set --profile-*, let it win
  const OVERRIDE_PAIRS = [
    ['--profile-card-pad',     '--_tunet-card-pad'],
    ['--profile-tile-pad',     '--_tunet-tile-pad'],
    ['--profile-tile-gap',     '--_tunet-tile-gap'],
    ['--profile-icon-box',     '--_tunet-icon-box'],
    ['--profile-name-font',    '--_tunet-name-font'],
    ['--profile-value-font',   '--_tunet-value-font'],
    ['--profile-header-font',  '--_tunet-header-font'],
    ['--profile-section-font', '--_tunet-section-font'],
    ['--profile-progress-h',   '--_tunet-progress-h'],
  ];
  const computed = getComputedStyle(this);
  for (const [pub, priv] of OVERRIDE_PAIRS) {
    const override = computed.getPropertyValue(pub).trim();
    if (override) this.style.setProperty(priv, override);
  }
}
```

**Public hook surface:** Only core layout tokens are exposed as `--profile-*` overrides. Family-specific extension tokens (timer, alarm, orb, sparkline) stay internal-only — users override those by changing the size (`tile_size: compact`), not individual tokens.

### tile-core CSS Contract

tile-core shadow root consumes internal aliases with em fallback values. Never references `--profile-*`.

```css
/* tile-core shadow root — consume-only */
:host        { padding:    var(--_tunet-tile-pad,     0.875em);
               min-height: var(--_tunet-tile-min-h,   5.75em);
               border-radius: var(--_tunet-tile-radius, 0.875em); }
.icon-wrap   { width:      var(--_tunet-icon-box,     2.375em);
               height:     var(--_tunet-icon-box,     2.375em); }
.icon        { font-size:  var(--_tunet-icon-glyph,   1.1875em); }
.name        { font-size:  var(--_tunet-name-font,    0.8125em); }
.value       { font-size:  var(--_tunet-value-font,   1.125em); }
.sub         { font-size:  var(--_tunet-sub-font,     0.6875em); }
.unit        { font-size:  var(--_tunet-unit-font,    0.6875em); }
.progress    { height:     var(--_tunet-progress-h,   0.5em); }
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

### Token Lanes

Organized by consumption scope. Every token in a lane must be present in the profile object for families that use that lane.

**Card Chrome Lane (all families via PROFILE_BASE):**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-card-pad` | Card host outer padding | `cardPad` |
| `--_tunet-section-pad` | Section container padding | `sectionPad` |
| `--_tunet-section-gap` | Gap between card sections | `sectionGap` |
| `--_tunet-header-height` | Card header bar min-height | `headerHeight` |
| `--_tunet-header-font` | Card title font-size | `headerFont` |
| `--_tunet-section-font` | Section title font-size | `sectionFont` |

**Tile Core Lane (all families via PROFILE_BASE):**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-tile-pad` | `tile-core :host` padding | `tilePad` |
| `--_tunet-tile-gap` | `tile-core` lane gap | `tileGap` |
| `--_tunet-tile-radius` | Tile border-radius | `tileRadius` |
| `--_tunet-tile-min-h` | Tile minimum height | `tileMinH` |
| `--_tunet-icon-box` | `.icon-wrap` width/height | `iconBox` |
| `--_tunet-icon-glyph` | `.icon` font-size | `iconGlyph` |
| `--_tunet-name-font` | `.name` font-size | `nameFont` |
| `--_tunet-value-font` | `.value` font-size | `valueFont` |
| `--_tunet-sub-font` | `.sub` secondary text font-size | `subFont` |
| `--_tunet-unit-font` | `.unit` suffix font-size | `unitFont` |
| `--_tunet-progress-h` | `.progress` height | `progressH` |

**Control Surface Lane (all families via PROFILE_BASE):**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-ctrl-min-h` | Button/toggle/chip min-height | `ctrlMinH` |
| `--_tunet-ctrl-pad-x` | Horizontal padding inside controls | `ctrlPadX` |
| `--_tunet-ctrl-icon-size` | Icon size inside controls | `ctrlIconSize` |

**Dropdown Lane (all families via PROFILE_BASE):**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-dd-radius` | Dropdown border-radius | `ddRadius` |
| `--_tunet-dd-option-font` | Dropdown option font-size | `ddOptionFont` |
| `--_tunet-dd-option-pad-y` | Dropdown option vertical padding | `ddOptionPadY` |
| `--_tunet-dd-option-pad-x` | Dropdown option horizontal padding | `ddOptionPadX` |
| `--_tunet-dropdown-min-h` | Dropdown minimum height | `dropdownMinH` |
| `--_tunet-dropdown-max-h` | Dropdown maximum height | `dropdownMaxH` |

### Family Extension Tokens

Consumed only by the component that uses them. Not set for other families.

**`rooms-row` family → consumed by `tunet-row` only:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-row-min-h` | Row container min-height | `rowMinH` |
| `--_tunet-row-gap` | Gap between rows | `rowGap` |
| `--_tunet-row-title-font` | Room name font-size | `rowTitleFont` |
| `--_tunet-row-status-font` | Room status text font-size | `rowStatusFont` |
| `--_tunet-orb-size` | Orb button width/height | `orbSize` |
| `--_tunet-orb-icon` | Icon size inside orbs | `orbIcon` |
| `--_tunet-toggle-size` | All-toggle button size | `toggleSize` |
| `--_tunet-toggle-icon` | Icon size inside toggle | `toggleIcon` |
| `--_tunet-chevron-size` | Chevron icon size | `chevronSize` |
| `--_tunet-row-btn-radius` | Row button border-radius | `rowBtnRadius` |

**`indicator-tile` family → consumed by status card subtypes:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-timer-font` | Timer countdown font-size | `timerFont` |
| `--_tunet-timer-ls` | Timer letter-spacing | `timerLetterSpacing` |
| `--_tunet-alarm-pill-font` | Alarm pill label font-size | `alarmPillFont` |
| `--_tunet-alarm-btn-h` | Alarm action button height | `alarmBtnH` |
| `--_tunet-alarm-btn-font` | Alarm button font-size | `alarmBtnFont` |
| `--_tunet-alarm-icon-size` | Alarm button icon size | `alarmIconSize` |

**`indicator-row` family → consumed by sensor/environment row:**

| Token | Consumed by | Source key |
|---|---|---|
| `--_tunet-row-pad-y` | Row vertical padding | `rowPadY` |
| `--_tunet-row-pad-x` | Row horizontal padding | `rowPadX` |
| `--_tunet-sparkline-w` | Sparkline chart width | `sparklineW` |
| `--_tunet-sparkline-h` | Sparkline chart height | `sparklineH` |
| `--_tunet-trend-box` | Trend arrow container size | `trendBox` |
| `--_tunet-trend-glyph` | Trend arrow icon size | `trendGlyph` |
| `--_tunet-spark-stroke` | Sparkline stroke width | `sparkStroke` |

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

## 10b. Token Ownership

Rules for who can add, modify, or remove tokens from the registry. These prevent drift as cards are added or profiles are tuned.

### Ownership Rules

| Action | Owner | Review required |
|---|---|---|
| Add token to `PROFILE_BASE` | Architecture (this doc) | Yes — affects all 5 families × 3 sizes |
| Add family extension token | Card owner + architecture review | Yes — must not collide with PROFILE_BASE keys |
| Modify `PROFILE_BASE` value | Architecture (this doc) | Yes — regression check all families |
| Modify family extension value | Card owner | Regression check that family only |
| Remove any token | Architecture (this doc) | Yes — two-tier versioning (D15) applies |
| Add new family to `SIZE_PROFILES` | Architecture (this doc) | Yes — requires new `FAMILY_KEYS` entry + `PRESET_FAMILY_MAP` routing |

### Where Tokens Live

| Scope | Definition site | Consumption site |
|---|---|---|
| PROFILE_BASE tokens | `tunet_base.js` → `PROFILE_BASE` | Any family via spread |
| Family extension tokens | `tunet_base.js` → `SIZE_PROFILES[family]` | Only that family's card/component |
| TOKEN_MAP (key→CSS var) | `tunet_base.js` → `TOKEN_MAP` constant | `_setProfileVars()` loop |
| Public override hooks | `_setProfileVars()` → `OVERRIDE_PAIRS` | User CSS on card host |

### Adding a New Token

1. Decide scope: PROFILE_BASE (all families) or family extension (one family)
2. Add the key+value to all 3 sizes (compact/standard/large)
3. Add the `key → '--_tunet-*'` mapping to `TOKEN_MAP`
4. If user-overridable, add a `['--profile-*', '--_tunet-*']` pair to `OVERRIDE_PAIRS`
5. Add the `var(--_tunet-*, fallback)` consumption in the target CSS
6. Update the token lane table in §10 of this document
7. Update unit tests to verify the new key returns a value for all family×size combinations

### Naming Conventions

- Registry keys: camelCase (`tilePad`, `orbIcon`, `rowBtnRadius`)
- CSS custom properties: kebab-case with `--_tunet-` prefix (`--_tunet-tile-pad`, `--_tunet-orb-icon`)
- Public hooks: kebab-case with `--profile-` prefix (`--profile-tile-pad`)
- No abbreviations except established ones: `dd` (dropdown), `ctrl` (control), `btn` (button), `h` (height), `w` (width), `ls` (letter-spacing), `lh` (line-height)

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

## 12b. Sections Layout Engine API Reference

Research from HA frontend source (2026-03-08). Used to inform G5 and `getGridOptions()` implementation.

### `getGridOptions()` — Current API (Sections View)

```ts
interface LovelaceGridOptions {
  columns?: number | "full";    // default 12; "full" = grid-column: 1/-1
  rows?: number | "auto";       // default "auto" = intrinsic CSS height
  min_columns?: number;         // constrain editor resize handles
  max_columns?: number;
  min_rows?: number;
  max_rows?: number;
  fixed_rows?: boolean;         // if true, user cannot resize vertically
  fixed_columns?: boolean;
}
```

Grid dimensions: each section is a **12-column** CSS grid. Row height is **56px** (`--row-height`), gap is **8px** (`--row-gap`). N rows = `N * 64 - 8` pixels.

### `getCardSize()` — Masonry Only

Returns a number (1 unit ≈ 50px). Used **only** by masonry view for column distribution. **Not used by sections.**

### `getLayoutOptions()` — Deprecated

Used a 4-column grid. Auto-migrated via `migrateLayoutToGridOptions()` which multiplies column values by 3. Both `layout_options:` and `grid_options:` accepted in YAML; `grid_options` takes priority.

### Reactivity

`getGridOptions()` is called inside `hui-grid-section`'s `render()`, re-read on section re-renders. **No `grid-options-changed` event exists.** Section re-renders are triggered by `cards` array changes or config changes — not by entity state or card-internal changes.

**Consequence:** A card that changes its grid options at runtime will **not** cause sections to re-allocate. Use `rows: "auto"` so intrinsic CSS height governs — profile changes then work naturally.

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

- [ ] At 390px: lighting card shows `--_tunet-icon-box: 2.125em` (PROFILE_BASE compact)
- [ ] At 390px: speaker card shows `--_tunet-icon-box: 2.125em` (PROFILE_BASE compact)
- [ ] At 390px: lighting card shows `--_tunet-tile-pad: 0.625em` (tile-grid compact, same as PROFILE_BASE)
- [ ] At 390px: speaker card shows `--_tunet-tile-pad: 0.5em` (speaker-tile compact — intentionally tighter)
- [ ] At 390px: lighting card shows `--_tunet-progress-h: 0.375em` (tile-grid compact, same as PROFILE_BASE)
- [ ] At 390px: speaker card shows `--_tunet-progress-h: 0.375em` (speaker-tile compact — same value, different source)
- [ ] At 700px: lighting card shows `--_tunet-icon-box: 2.375em` (PROFILE_BASE standard)
- [ ] At 700px: speaker card shows `--_tunet-icon-box: 2.375em` (same)
- [ ] With `tile_size: large` explicit in lighting config: `--_tunet-icon-box: 2.75em` regardless of container width
- [ ] At 390px: both cards show `--_tunet-card-pad: 0.875em` (PROFILE_BASE compact)
- [ ] At 700px: both cards show `--_tunet-ctrl-min-h: 2.625em` (PROFILE_BASE standard)

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

**Files changed:** `tunet_rooms_card.js`

**Changes:**

`tunet_rooms_card.js`:
- Grid layout mode: `selectProfileSize` returns family `tile-grid`
- Row layout mode: `selectProfileSize` returns family `rooms-row`
- Profile applies to tile lane and row geometry (`orbSize`, `toggleSize`, `chevronSize`, `rowHeight`)
- Row semantics (tap → navigate, hold → popup, orb toggle, all-toggle) remain entirely card-local -- not touched
- `layout_variant: 'slim'` handled by CSS class addition in card render logic, not by profile resolver

**Exit criteria:**

Rooms row:
- [ ] `--_tunet-orb-size` computed on card host is `3.16em` at standard (devtools)
- [ ] `--_tunet-row-min-h` is `7.3125em` at standard (devtools)
- [ ] Rooms grid layout: `--_tunet-icon-box` is `2.375em` at standard (tile-grid, not rooms-row value)
- [ ] Slim variant row height is approximately 70% of standard `rowMinH` (measured)
- [ ] Orb toggles function after migration
- [ ] Room navigation on row tap functions after migration
- [ ] All-toggle button functions after migration

Nav neutralization:
- [ ] `ensureGlobalOffsetsStyle()` confirmed not injecting during G3 testing session
- [ ] Section sizing measurements taken with nav injection neutralized — baseline is clean

---

### G3S: Status Alignment Tranche (Deferred, Post-Unification)

**Files changed:** `tunet_status_card.js`

**Scope lock:**
- lightweight subtype alignment for timer/alarm/dropdown/value lanes using existing shared tokens where low-risk
- continue `px` -> `em` normalization and remove obvious inline sizing formulas where safe
- keep status interaction behavior unchanged while normalizing geometry consumption

**Exit criteria:**
- [ ] Timer/alarm/dropdown/value subtype lanes are aligned with shared token semantics where low-risk
- [ ] Obvious hardcoded `px` and inline size formulas in status subtype sizing paths are reduced without behavior regressions
- [ ] Unit checks pass for affected status code paths
- [ ] Live breakpoint checks pass at `390x844`, `768x1024`, `1024x1366`, `1440x900` with real HA entities

**Policy until G3S starts:**
- status remains bugfix-only
- status regression does not block non-status family rollout gates
- full subtype tokenization is optional follow-up, not a gate blocker

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

### G5: Sections Integration Validation

**Research finding (2026-03-08):** HA sections uses `getGridOptions()` with a 12-column CSS grid (row height = 56px, gap = 8px). `getCardSize()` is masonry-only and irrelevant for sections. There is **no reactive mechanism** for cards to announce size changes — `getGridOptions()` is re-read on section re-render, but section re-renders are triggered by config changes, not card state changes.

**Implication:** `rows: "auto"` (intrinsic height) is the correct strategy for profile-driven cards. When profiles change token values, CSS height changes naturally, and sections renders the card at its new intrinsic height. No `_hint` values needed in SIZE_PROFILES.

**Files changed:** All pilot tranche cards (minor — ensure `getGridOptions()` returns correct static values)

**Changes:**
- Ensure all pilot cards return `getGridOptions()` with `rows: "auto"` (intrinsic height)
- Set `columns` and `min_columns` for horizontal constraints
- Set `min_rows` / `max_rows` to constrain UI editor resize handles
- Keep `getCardSize()` returning a static reasonable value for masonry compatibility
- No dynamic size-hint updates — unnecessary with `rows: "auto"`

**Exit criteria:**
- [ ] All pilot cards return `getGridOptions()` with `rows: "auto"` or omit `rows`
- [ ] Cards in sections do not clip or overflow at any profile size at all 4 breakpoints
- [ ] Profile size switch (compact↔standard↔large) causes smooth height transition, no layout jump
- [ ] No stacking or overlap regressions in multi-card sections views
- [ ] `getCardSize()` returns sensible static value for masonry view compatibility

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
| `tunet_status_card.js` | G3S (deferred) | Status alignment only: low-risk token adoption + em normalization | Bugfix-only behavior in current tranche sequence |
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
- [ ] Status deferral policy (`G3S`, bugfix-only until tranche start) is recorded in §2 and §15
- [ ] Breakpoint check targets declared: `390×844`, `768×1024`, `1024×1366`, `1440×900`
- [ ] Parity definition quantified (computed CSS value inspection via devtools) — §15 G2
- [ ] Regression guard behaviors defined for all 4 interaction paths — §15 G2/G3
- [ ] Feature flag `use_profiles` designed with editor UI surface — §11
- [ ] Version handshake `_renderError()` pattern specified — §12
- [ ] Nav card neutralization plan documented for G3 — §2
- [ ] Out-of-scope states declared for all excluded cards — §2
- [ ] Legacy scaling code preservation until G6 confirmed — §11
- [ ] Dark mode boundary policy stated — §17
