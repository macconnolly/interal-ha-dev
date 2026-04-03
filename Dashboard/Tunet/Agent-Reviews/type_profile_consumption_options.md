# Type/Profile Consumption Options (Parallel Analysis #3)

## Scope And Position

This document evaluates whether a reusable type/profile consumption model should replace or complement current ad-hoc `tile_size` handling.

It does **not** make the final design decision.

Current code reality used for this review:
- Shared tokens and responsive baseline exist in `Dashboard/Tunet/Cards/v2/tunet_base.js`.
- Heavy card-local scaling logic still exists in:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`

## Working Definition: Profile Consumption

Proposed model being evaluated:
- Profiles define reusable proportional scaling contracts for a component family.
- Cards opt in via explicit profile key.
- Cards can apply lane-level hooks (icon lane, text lane, value lane, controls lane) instead of hardcoded size branches.
- Overrides remain controlled and explicit, not fully automatic.

## Current-State Evidence (Code)

- `tile_size` is implemented independently in multiple cards:
  - lighting: host attributes + dense compact mode + per-size row heights
  - status: host attributes + per-type compact/large overrides + dropdown-specific behavior
  - speaker grid: host attributes + compact/large + container queries
- Responsive width strategy is inconsistent:
  - lighting uses `window.innerWidth` for breakpoint column rules.
  - status uses card/container width (`getBoundingClientRect`) + `ResizeObserver`.
- Rooms card uses `layout_variant` (`tiles|row|slim`) with many lane-specific CSS branches and row button tokens.
- `tunet_base.js` centralizes many primitives (`TOKENS`, `RESPONSIVE_BASE`, type tokens, density tokens), but does not yet centralize profile-level lane contracts per family.

## Issue Matrix

| Broken / Inconsistent Today | Likely Root Cause | Where Profile Consumption Helps | Where It Will Not Help |
|---|---|---|---|
| Compact behavior diverges across tile families (`lighting`, `status`, `speaker`) despite same `tile_size` concept | `tile_size` is semantic-only; each card maps it differently with local CSS | Shared profile contracts can define per-family compact/standard/large lane ratios once | Profile does not solve family-specific interaction constraints (drag bars, dropdown overflow) by itself |
| Breakpoint logic differs (`window.innerWidth` vs container width) | No shared sizing policy API in base | Profile hooks can require one width source per family (container-first for dense tiles) | Need runtime plumbing changes; profile layer alone cannot force measurement correctness |
| Repeated per-card magic numbers for icon/text/progress lane spacing | No shared lane abstraction | Lane hooks can map `icon/text/value/progress` proportions consistently | Cards with fundamentally different anatomy (e.g., status alarm buttons) still need local exception blocks |
| Rooms row/slim control sizing required recent repeated tuning | Global tokens exist, but row family still tuned with card-local fallback rules | Row profile can stabilize `row-main`, `orbs`, `all-toggle`, `status-lines` as a reusable contract | Room behavior semantics (navigate vs per-light toggle vs all-toggle) remain logic-level, not profile-level |
| Heavy card-local CSS still required even after token centralization | Tokens describe values, not structural relationships | Profile contracts can add structure to how tokens are consumed | Profile does not eliminate need for card-local visuals and custom interaction affordances |
| Migration risk across active tranches | Multiple cards import base with pinned query versions and custom CSS injection points | Explicit opt-in profile keys allow incremental rollout card-by-card | If forced globally, regressions likely across live surfaces and pending orchestration work |

## Architectural Options (2-4)

### Option A: Fully Global Token-Only (No Explicit Profiles)

Summary:
- Keep improving `tunet_base.js` tokens and `RESPONSIVE_BASE` only.
- Cards continue local mapping from tokens to lane geometry.

Pros:
- Lowest immediate migration effort.
- Minimal runtime/API changes.
- Preserves current card autonomy.

Cons:
- Does not solve semantic drift of `tile_size` across card families.
- Repeated tuning cycles likely continue.
- Harder to reason about parity and regression.

Fit Score (this repo): **5.5/10**

### Option B: Per-Card Local Scaling Maps (Formalized But Isolated)

Summary:
- Standardize each card’s internal sizing map object but keep it card-local.
- No cross-card profile registry.

Pros:
- Moderate cleanup without base refactor.
- Easier unit reasoning per card.

Cons:
- Still duplicates family logic across cards.
- Hard to enforce parity between `lighting`, `status`, `speaker`, `rooms` row variants.
- Creates “organized fragmentation.”

Fit Score (this repo): **6.5/10**

### Option C: Family Profile Consumption (Recommended Candidate, Not Final Decision)

Summary:
- Add profile registry in `tunet_base.js` for families (`tile-grid`, `status-grid`, `rooms-row`, `speaker-tile`).
- Cards opt in via explicit profile key.
- Lane hooks expose controlled variables only (icon box, text scale, value scale, progress lane, control lane).

Pros:
- Directly addresses cross-card inconsistency while preserving explicit card ownership.
- Compatible with existing shared tokens and controlled overrides requirement.
- Supports incremental migration per card/surface.

Cons:
- Requires disciplined schema design; over-generalization risk.
- Needs migration coordination across cards already under active live tuning.
- Some interactions remain card-specific and will still need local code.

Fit Score (this repo): **8.5/10**

### Option D: Full Automated Layout Engine (Implicit Profiles + Auto Derivation)

Summary:
- Attempt to infer scaling from context automatically (viewport, columns, tile count).
- Minimal explicit card profile keys.

Pros:
- Ambitious long-term consistency if perfect.

Cons:
- Conflicts with project constraint: controlled overrides over full automation.
- High regression risk with interaction-heavy cards.
- Hard to debug and tune in HA live workflows.

Fit Score (this repo): **3.5/10**

## Decision Rubric (Weighted)

| Criterion | Weight | What To Measure |
|---|---:|---|
| Cross-card consistency of compact/standard/large behavior | 25 | Visual and interaction parity across lighting/status/speaker/rooms at same profile intent |
| Migration risk during active surface lock work | 20 | Number of cards touched per tranche, blast radius, rollback ease |
| Override control (explicit, predictable) | 15 | Can a card intentionally diverge without forking system semantics |
| Runtime correctness across breakpoints | 15 | Behavior at `390x844`, `768x1024`, `1024x1366`, `1440x900` |
| Developer maintainability | 10 | Reduction in duplicated size math and one-off CSS branches |
| Fit with existing base token architecture | 10 | Reuse of `tunet_base.js` patterns without large redesign |
| Debuggability in live HA tuning loop | 5 | Ability to isolate profile vs card-local defects quickly |

Scoring method:
- Score each option 1-10 per criterion.
- Multiply by weight.
- Prefer highest weighted score that also passes live regression gates.

## Prerequisites (Must Be Resolved First)

1. Width source standardization (container-first) is non-negotiable.
- Profile consumption will fail if cards still mix viewport and container width logic.
- Current required fixes:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`: remove `window.innerWidth` column resolution path and container-independent `matchMedia` row-height branches
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`: remove residual `window.resize` dependency from responsive column flow and keep container-first measurement path
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`: stop relying on hard viewport media breakpoints in `RESPONSIVE_BASE` as the primary density decision mechanism for profile-driven families

2. Profile taxonomy should be family-first, not card-first.
- Avoid profile keys named by individual card (`lighting_compact_v2`).
- Use stable families (`tile-grid`, `speaker-tile`, `status-grid`, `rooms-row`).

3. Interaction contracts stay outside profile contracts.
- Example: rooms row tap/hold/toggle semantics in `tunet_rooms_card.js` remain logic-level.
- Profiles control geometry/typography lanes, not action routing.

4. Profile hooks need explicit override boundaries.
- Allow token/ratio override points only at approved lanes.
- Forbid arbitrary freeform overrides that silently bypass profile.

5. Versioning strategy is required.
- Introduce profile schema version in `tunet_base.js` to avoid silent drift across cache-busted card imports.

6. Canonical-source conflict must be resolved before broad migration.
- `design_language.md` parity lock names canonical cards under `Dashboard/Tunet/Cards/`, while active work is in `Dashboard/Tunet/Cards/v2/`.
- Profile rollout must declare `Cards/v2` as implementation authority for this tranche.

7. Nav global layout mutation must be isolated before profile validation.
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` currently injects global offsets via `ensureGlobalOffsetsStyle()` across multiple HA host view types.
- Until this is scoped/removed, section sizing validation can be polluted by nav side effects.

## Do Not Do (Anti-Patterns)

- Do not replace all card-local sizing with one monolithic universal profile.
- Do not tie profile contracts directly to viewport breakpoints only.
- Do not encode interaction semantics (tap/hold/service behavior) in profile definitions.
- Do not allow unbounded custom CSS to become a second profile system.
- Do not migrate all five cards in one tranche; regression risk is too high.
- Do not treat `tile_size` string parity as success if lane proportions still differ materially.

## Uncertainties And Live Tests Required

Uncertainties:
- Whether a shared profile can cover both `status` dropdown/alarm tiles and `lighting` drag-to-dim without overfitting.
- Whether speaker grid container-query behavior should be profile-owned or remain local.
- Rooms row/slim split should be treated as one family profile with modifiers, not two separate family profiles.

Live tests that should be run before any final choice:
1. Run Option C pilot directly on one family pair: `tunet_lighting_card.js` + `tunet_speaker_grid_card.js`.
2. Validate compact readability and control hit targets at all locked breakpoints.
3. Validate dropdown overflow/elevation (`tunet_status_card.js`) and row control parity (`tunet_rooms_card.js`) after profile hook adoption.
4. Validate no regressions in `getGridOptions()` behavior inside Sections layouts.

## Concrete Migration Envelope (If Option C Is Piloted)

Phase 1 (base primitives only):
- File: `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Add profile registry + lane hook resolver helpers.
- No visual change expected yet.

Phase 2 (two-card pilot):
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- Replace hardcoded compact/large lane values with profile consumption.
- Keep card-specific interactions untouched.

Phase 3 (status + rooms row):
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Migrate only sizing lanes first, then optional secondary cleanup.

Phase 4 (atomic tile alignment):
- File: `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
- Align standalone tile with same family profile contracts used by lighting card.

## Direct Challenges To Assumptions

- Assumption: “Global tokens are enough.”
  - Disagreement: tokens alone do not enforce lane relationships; current drift proves this.

- Assumption: “Profile consumption can replace card-local rules entirely.”
  - Disagreement: interaction-heavy cards need local behavior logic and selective visual exceptions.

- Assumption: “One profile model should unify everything.”
  - Disagreement: family-level profiles are plausible; universal profile is likely counterproductive here.

- Assumption: “Automation should decide scaling at runtime.”
  - Disagreement: this repo’s workflow and constraints favor explicit, controlled overrides and live-tuned predictability.

## Decision-Ready Scoring (Applied)

Using the weighted rubric above (`0-10` per criterion, weighted to `100` total):

| Option | Weighted Score | Decision |
|---|---:|---|
| A: token-only | `6.5` | better than current for low-risk cleanup, but does not solve semantic drift |
| B: per-card local maps | `6.4` | organizes drift but keeps fragmentation |
| C: family profile consumption | `8.5` | best tradeoff for consistency + controlled migration |
| D: automated layout engine | `3.8` | too risky and too implicit for current constraints |

Current recommendation for this repo: **Option C**, with a gated rollout.

## Recommended Path (Execution-Grade)

### Path Summary

Adopt **family profile consumption** as a constrained sizing layer in `tunet_base.js`, while keeping interaction logic in each card.

This should be treated as a **post-surface-lock unification tranche**, not as a broad in-flight refactor during active surface orchestration.

### Why This Fits Current Locks

- Aligns with centralized styling direction (`Dashboard/Tunet/AGENTS.md`, section `7A`)
- Preserves one-surface-at-a-time execution by staging profile adoption behind a gate
- Keeps Browser Mod / room interaction contracts untouched

### Gate Sequence

1. **Gate G0: prerequisite ordering lock**
   - Finish current `T-011A` active surface lock milestone before migrating multiple card families
   - Complete container-first width migration on profile-target families
   - Isolate or remove nav global offset injection side effects before using breakpoint evidence for profile validation
   - Keep this phase docs-only or base-primitives-only
2. **Gate G1: base profile primitives**
   - Add versioned profile registry + resolver helpers to `tunet_base.js`
   - No card behavior changes
3. **Gate G2: two-card pilot**
   - Migrate only `tunet_lighting_card.js` + `tunet_speaker_grid_card.js`
   - Verify compact/standard/large parity and no interaction regressions
4. **Gate G3: interaction-heavy families**
   - Migrate sizing lanes in `tunet_status_card.js` + `tunet_rooms_card.js`
   - Keep dropdown mechanics and row action semantics logic-local
5. **Gate G4: standalone tile parity**
   - Align `tunet_light_tile.js` to the same family profile contract
6. **Gate G5: Sections size-hint calibration**
   - Calibrate `getCardSize()` and `getGridOptions()` against measured rendered height/lanes after profile pilot
   - Validate stacking/section behavior in real Sections layouts, not isolated card assumptions

### Hard Constraints

- Do not move navigation/popup action routing into profile layer
- Do not migrate all families in one tranche
- Do not use viewport-only width decisions for profile resolution
- Do not bypass profile schema with per-card custom freeform sizing maps

## Profile Contract Draft (V1)

Proposed base registry shape:

```js
const PROFILE_SCHEMA_VERSION = 'v1';

const SIZE_PROFILES = {
  'tile-grid': {
    compact: { tilePad: 10, tileGap: 4, iconBox: 38, iconGlyph: 19, nameFont: 13, valueFont: 18, progressH: 7 },
    standard:{ ... },
    large:   { ... },
  },
  'speaker-tile': { ... },
  'status-grid':  { ... },
  'rooms-row':    { compact: {...}, standard: {...}, slim: {...} },
};
```

Resolver contract:

```js
resolveSizeProfile({
  family,        // required
  size,          // compact|standard|large (or slim for rooms-row)
  widthHint,     // container width, not viewport-only
  densityMode,   // optional: base|dense
});
```

Cards consume only exported CSS variables from resolved profile, e.g.:

- `--profile-tile-pad`
- `--profile-tile-gap`
- `--profile-icon-box`
- `--profile-icon-glyph`
- `--profile-name-font`
- `--profile-value-font`
- `--profile-status-font`
- `--profile-progress-height`
- `--profile-control-size`

## Width Source Standardization Requirement

Before broad profile adoption, unify responsive width source:

- Prefer **container/card width first**
- Use viewport width only as fallback

Code reality to reconcile:

- `tunet_status_card.js` already uses `ResizeObserver` + container width
- `tunet_lighting_card.js` still resolves columns from `window.innerWidth`
- `tunet_lighting_card.js` still applies row-height and subtitle behavior through viewport `matchMedia` checks
- `tunet_status_card.js` still attaches a `window.resize` listener in addition to `ResizeObserver`
- `tunet_base.js` `RESPONSIVE_BASE` still uses viewport media thresholds for density token switching

This is a required subtask inside `G0` before profile migration begins.

## Branch-Conflict Interpretation (Explicit)

Conflict observed:

- `design_language.md` parity block references canonical implementations under `Dashboard/Tunet/Cards/`
- Active implementation and deployment path is `Dashboard/Tunet/Cards/v2/` (`plan.md` / `handoff.md`)

Chosen interpretation for this unification path:

- Treat `v2` as implementation authority for rollout work
- Treat parity lock as behavior/design intent
- Do not start a parallel profile system under both paths

## Acceptance Checks For “Path Approved”

Path is considered ready to execute when all are true:

1. Weighted option decision is recorded as `Option C (gated)`
2. Profile schema `v1` keys are documented and fixed for the pilot tranche
3. Width-source policy is fixed to container-first
4. Pilot tranche file list is locked:
   - `tunet_base.js`
   - `tunet_lighting_card.js`
   - `tunet_speaker_grid_card.js`
5. Breakpoint checks are defined for:
   - `390x844`
   - `768x1024`
   - `1024x1366`
   - `1440x900`
6. Regression guard checklist exists for:
   - lighting drag path
   - speaker tile drag/group controls
   - status dropdown overflow behavior
   - rooms row control parity
7. Decision ownership is explicit for profile policy decisions before `G1`.

## Decision Ownership (Pre-G1)

These decisions must be locked by the tranche owner before profile code rollout:

1. `tile_size` vocabulary and semantics (compact/standard/large and family-specific modifiers)
2. Dense-mode trigger contract (container-width and/or active-column thresholds)
3. Family taxonomy keys and fallback behavior
4. Override boundary policy (which lanes are overridable and where)
5. Schema versioning and bump policy in `tunet_base.js`
6. Size-hint calibration policy (`getCardSize()` and `getGridOptions()` checkpoints after pilot)
