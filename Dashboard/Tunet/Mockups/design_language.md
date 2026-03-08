# Tunet V2 Design Language and Profile Contracts

Version 9.0 - 2026-03-07  
Status: Active canonical spec for Tunet V2  
Implementation authority: `Dashboard/Tunet/Cards/v2/`  
Legacy reference only: `Dashboard/Tunet/Cards/`

This document replaces the previous v8.x mixed-era design language for implementation decisions.

## 0. Purpose and Use

Use this file as the implementation contract for:
- visual language guardrails
- profile family sizing system
- width-source and sections compatibility rules
- migration gate criteria

If this doc conflicts with implementation behavior, update this doc and control docs in the same session.

### Control-Doc Precedence

When docs disagree, use this order:
1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
5. this file

## 1. Scope

In scope:
- Tunet V2 custom cards under `Dashboard/Tunet/Cards/v2/`
- profile geometry contracts (`compact|standard|large`)
- token ownership boundaries and cascade policy
- sections compatibility requirements for card sizing behavior

Out of scope:
- legacy V1 card remediation
- dashboard content strategy and entity choices
- popup navigation architecture decisions not related to geometry contracts

## 2. Canonical Source Lock

These locks are normative:
1. `Cards/v2/` is the only implementation authority
2. `Cards/` is historical and read-only for migration context
3. `design_language` guidance must never require changes in legacy paths first
4. references to canonical implementations must point at `Cards/v2/`

## 3. Locked Direction (Normative)

1. Unification strategy is family profile consumption (Option C)
2. Container-first width-source migration is a prerequisite gate, not optional
3. Rooms row and slim are one family with a layout variant modifier, not separate families
4. Profile keys are domain-keyed (what geometry contract applies), not component-keyed
5. Interaction contracts stay outside profile resolution
6. Dark and light theme handling is orthogonal to profile geometry

## 4. Visual Language Baseline

These remain active regardless of profile rollout:
1. Neutral container rule: card shell conveys structure, not entity state
2. Grid of equals: peer cards share elevation/surface semantics
3. Two-layer shadow physics only (contact + ambient)
4. Unified idle control surfaces for header controls
5. Icon semantics: outlined idle/off, filled active/on unless telemetry icon class is explicitly always-filled
6. Midnight dark baseline remains locked (`#0f172a` canvas context, `#1e293b` card family)

Implementation note:
- global surface/color tokens are owned by `tunet_base.js` (`TOKENS`, `TOKENS_MIDNIGHT`, shared base CSS)
- profile registry must not duplicate theme color tokens

## 5. Profile System Architecture

### 5.1 Pipeline

```text
preset -> card_defaults -> tile_defaults -> tile_config
      -> merged config
      -> selectProfileSize({ preset, layout, widthHint, userSize? })
      -> { family, size }
      -> resolveSizeProfile({ family, size })
      -> _setProfileVars(profile)
      -> component CSS consumption
```

Rules:
1. Merge runs before profile resolution
2. `selectProfileSize` decides family and size
3. `resolveSizeProfile` is pure lookup only
4. Profile output is geometry/typography tokens only

### 5.2 Family Keys

The active family taxonomy is five keys:
- `tile-grid`
- `speaker-tile`
- `rooms-row`
- `indicator-tile`
- `indicator-row`

### 5.3 Preset-to-Family Mapping

```js
const PRESET_FAMILY_MAP = {
  lighting: 'tile-grid',
  speakers: 'speaker-tile',
  rooms: 'tile-grid',
  'rooms-row': 'rooms-row',
  status: 'indicator-tile',
  environment: 'indicator-row',
};
```

Rooms lookup is layout-aware after merge:
- `mergedConfig.layout === 'row' ? 'rooms-row' : 'tile-grid'`

### 5.4 API Lock

Use two functions with strict separation:

```js
selectProfileSize({ preset, layout, widthHint, userSize? })
resolveSizeProfile({ family, size })
```

Rules:
1. `resolveSizeProfile` must not accept `widthHint`
2. `resolveSizeProfile` must not branch on theme mode
3. `resolveSizeProfile` fallback behavior is explicit:
- unknown family -> warn + `tile-grid/standard`
- unknown size -> warn + `<family>/standard`
4. If temporary compatibility exists for legacy args, it is one-gate only and must warn

### 5.5 Registry Shape

Required shared base layer:

```js
const PROFILE_BASE = {
  iconBox: 38,
  iconGlyph: 19,
  nameFont: 13,
  valueFont: 18,
};
```

Rules:
1. Shared typography/icon scale tokens live in `PROFILE_BASE`
2. Family geometry diverges in family entries
3. Large size may override base values explicitly
4. Registry keys are internal implementation keys, not user config API

## 6. Token Ownership and CSS Precedence

### 6.1 Two-Name Protection Pattern

Use separate names for public hooks and internal consumed values:
- public: `--profile-*`
- internal: `--_tunet-*`

Reason:
- custom property precedence can let user CSS override host values unexpectedly
- internal aliases provide controlled ownership and predictable consumption

### 6.2 Consumer Boundaries (Locked)

1. Card host is write-only for profile vars
2. `tile-core` is exclusive consumer of core lane tokens
3. `tunet-row`, `indicator-tile`, and `indicator-row` consume only their family extension tokens
4. Composing components pass core tokens through and do not reinterpret core geometry
5. On family/layout switch, clear profile vars then set the new family token set

Core lane tokens:
- `--_tunet-tile-pad`
- `--_tunet-tile-gap`
- `--_tunet-icon-box`
- `--_tunet-icon-glyph`
- `--_tunet-name-font`
- `--_tunet-value-font`
- `--_tunet-progress-h`

Family extension examples:
- rooms row: orb/toggle/chevron/row-height tokens
- indicator tile: dropdown and aux-action geometry tokens
- indicator row: sparkline and trend geometry tokens

### 6.3 Apply Pattern

`_setProfileVars(profile)` behavior:
1. remove stale `--_tunet-*` tokens before applying new family values
2. write the full new family token set on host (`this.style`)
3. if public overrides are supported, bridge intentionally and explicitly
4. do not diff-apply partial token subsets on family switches

## 7. Width Source Contract

Container-first is mandatory:
1. Width hints come from host/container measurement (`ResizeObserver` + host bounds)
2. Viewport width (`window.innerWidth`, `matchMedia`) is forbidden for profile size selection
3. Base responsive assumptions in `tunet_base.js` must use container-aware paths
4. First render fallback must be defined and deterministic

Recommended first render behavior:
- default to `standard` until first non-zero container width is observed

## 8. Sections Compatibility Contract

Profile rollout must remain compatible with sections model:
1. page-level width budget (`max_columns`) is not pixel width
2. section-level spans and card `grid_options` drive layout behavior
3. profile geometry cannot rely on viewport assumptions
4. global nav style injection side effects must be neutralized before profile parity validation

Related workstream requirements:
- calibrate `getCardSize()` and `getGridOptions()` expectations against actual rendered geometry
- define parity checks in terms of lane proportions and interaction outcomes, not just string tile-size parity

## 9. Theme Boundary

Profiles are mode-agnostic.

Rules:
1. Profile registry includes geometry and typography only
2. Dark/light behavior is handled by token layer above profiles
3. No theme branches in profile resolver
4. If mode-aware geometry is ever needed, it is a separate approved axis, not an implicit profile mutation

## 10. Public Config and Schema Versioning

Version marker remains required in base:

```js
const PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD';
```

Two-tier versioning policy:
1. Public persisted config keys (`preset`, `layout`, `tile_size`) need migration policy and compatibility handling
2. Internal registry key renames do not require long-lived runtime shims
3. Internal key rename safety is enforced by tests and short-lived development warnings when needed

## 11. Test Requirements

### 11.1 Resolver Unit Tests (G1 Exit)

Required categories:
1. valid pair coverage (`5 families x 3 sizes`)
2. unknown family fallback behavior
3. unknown size fallback behavior
4. output shape checks by family
5. `PROFILE_BASE` inheritance checks
6. idempotency checks

### 11.2 Integration/Live Checks

Required for migration gates:
1. compact/standard/large parity checks across in-scope families
2. no interaction regressions (tap, hold, drag, dropdown, row controls)
3. breakpoint checks at `390x844`, `768x1024`, `1024x1366`, `1440x900`
4. sections placement and density behavior remains valid

## 12. Migration Gates

### G0: Prerequisites

Must be complete before profile primitives:
1. container-first width-source migration on target cards
2. nav global offset injection neutralized/scoped for sizing validation runs
3. canonical source lock updated (`Cards/v2` authority)

### G1: Base Primitives

Deliverables:
1. profile registry in `tunet_base.js`
2. `selectProfileSize` and `resolveSizeProfile` APIs
3. token consumer boundary implementation contracts documented
4. resolver unit tests passing

### G2: Pilot Families

Pilot cards:
- `tunet_lighting_card.js`
- `tunet_speaker_grid_card.js`

Pass criteria:
1. parity definition applied and validated
2. no interaction regressions
3. no viewport-based profile sizing logic remains

### G3: Indicator and Rooms Rollout

Cards:
- `tunet_status_card.js`
- `tunet_rooms_card.js`
- `tunet_sensor_card.js` (environment/indicator-row path if in active scope)

Pass criteria:
1. family split behavior verified (`indicator-tile` vs `indicator-row`)
2. rooms layout variant routing verified (grid vs row)
3. stale-token cleanup behavior verified on layout switches

### G4: Supporting Tile Alignment

Card:
- `tunet_light_tile.js`

Pass criteria:
1. core lane token consumption aligns with `tile-core` contract
2. no local reinterpretation of shared core geometry

### G5: Hardening and Cleanup

1. remove one-gate compatibility shims
2. remove dead legacy scaling branches where flag no longer needed
3. finalize docs and guardrails

## 13. Anti-Patterns (Do Not Do)

1. Do not migrate all cards in one tranche
2. Do not treat tile-size string parity as success when lane proportions diverge
3. Do not let custom CSS become a second unmanaged profile system
4. Do not push interaction routing into profile registries
5. Do not reintroduce viewport width sizing in profile selection
6. Do not maintain dual canonical implementation roots (`Cards/` and `Cards/v2/`)

## 14. Documentation Sync Policy

Any change to profile contracts, family taxonomy, width source policy, or consumer boundaries must update in the same session:
1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. this file

## 15. Immediate Checklist for New Tranches

Before coding:
1. confirm gate and active surface scope
2. confirm target families and cards
3. confirm container-width source path is intact

Before merge:
1. resolver tests pass
2. no stale token leakage on family/layout switch
3. sections checks complete across required breakpoints
4. docs sync complete
