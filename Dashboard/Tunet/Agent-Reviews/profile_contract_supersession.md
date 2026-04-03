# Profile Resolver Contract Supersession

**Decision Date**: April 2, 2026
**Status**: Ratified as policy. Code removal is incremental and surface-driven.
**Approved By**: User (during surface-driven reset planning session)

---

## What Is Being Superseded

The profile resolver contract established in `design_language.md` v9.0 and `unified_tile_architecture_conclusion.md`:

- `selectProfileSize({ preset, layout, widthHint, userSize })` — decides family + size
- `resolveSizeProfile({ family, size })` — pure profile lookup
- `_setProfileVars(hostElement, profile, { bridgePublicOverrides })` — injects tokens as inline styles
- `SIZE_PROFILES` — 5 families × 3 sizes = 15 profile objects with 40+ tokens each
- `TOKEN_MAP` — maps profile keys to `--_tunet-*` CSS custom properties
- `FAMILY_KEYS`, `PRESET_FAMILY_MAP`, `PROFILE_BASE`, `OVERRIDE_PAIRS`

## Why It Is Being Superseded

### Problem 1: Visual regressions from mathematical scaling
The profile system applied mathematical multipliers to spacing, font sizes, and dimensions. These multipliers were tuned for standard mode but produced near-zero values in compact mode:
- Light tile compact: `margin-top: calc(0.25em × 0.2) = 0.05em` — icons crushed to top
- Light tile compact: drag bar thickness multiplied beyond proportion
- Status card: missing `font-size: 16px` em anchor caused all profile em values to resolve at wrong scale
- Rooms card: `rowControlSize` token set to same value as orb size (3.16em = 3.16em), defeating the purpose

### Problem 2: Excessive indirection obscures simple problems
Debugging a spacing issue requires tracing: config → selectProfileSize → PRESET_FAMILY_MAP → family → resolveSizeProfile → SIZE_PROFILES → profile object → TOKEN_MAP → CSS variable → CSS cascade with fallbacks. A developer fixing a visual bug must understand 6+ layers of abstraction to find the wrong value.

### Problem 3: Values tuned by math, not by eye
The profile token values were computed mathematically (e.g., `compact = standard × 0.85`) rather than hand-tuned for each card's visual needs. Visual design requires aesthetic judgment that mathematical scaling cannot provide.

### Problem 4: 600+ individual values to maintain
15 profile objects × 40+ tokens = 600+ values that must all be correct. When one is wrong, it's buried in a profile object in tunet_base.js, not in the card's CSS where a developer can see and adjust it.

### Problem 5: Cards hadn't been visually perfected before parameterization
The profile system was built on top of cards whose visual design wasn't locked down. It parameterized values that were already wrong, then amplified the errors through scaling.

## What Replaces It

A lightweight sizing contract with ~20 lines of shared code:

```javascript
// Shared helper
function resolveSize(el, userSize) {
  if (userSize) return userSize;  // Explicit config wins
  const w = el.getBoundingClientRect().width;
  return w < 300 ? 'compact' : w < 600 ? 'standard' : 'large';
}
// + ResizeObserver to re-evaluate on container resize
```

Cards use hand-tuned CSS variants:
```css
:host([tile-size="compact"]) { /* hand-tuned compact values */ }
:host([tile-size="standard"]) { /* hand-tuned standard values */ }
:host([tile-size="large"]) { /* hand-tuned large values */ }
```

### Key properties of the replacement:
1. `tile_size` config override wins when explicitly set by user
2. Otherwise auto-resolves from host/container width
3. Resolved size exposed via `tile-size` attribute on host element
4. CSS values are visible, debuggable, and tuned by eye in each card's stylesheet
5. ResizeObserver re-evaluates on container resize
6. No token injection, no profile objects, no family/size matrices

## Migration Plan

- **Existing profile code stays** in tunet_base.js and continues to function for untouched cards
- **Code removal is incremental**: each surface tranche migrates its touched cards from legacy profiles to the new sizing contract
- **No blanket removal tranche** — profile code is removed card-by-card as surfaces are built
- **Shared sizing helper** introduced in Tranche 2 (Build Migration) with replacement tests
- **Legacy behavior available** until every consuming card has been migrated

### Cards consuming legacy profiles (6 of 13):
1. `tunet_light_tile.js` — tile-grid family
2. `tunet_lighting_card.js` — tile-grid family
3. `tunet_rooms_card.js` — tile-grid + rooms-row families
4. `tunet_sensor_card.js` — indicator-tile family
5. `tunet_speaker_grid_card.js` — speaker-tile family
6. `tunet_status_card.js` — indicator-tile family

### Replacement test contract (introduced in Tranche 2):
- Width bucket resolution (container width → compact/standard/large)
- `tile_size` config override precedence
- Resize-triggered re-resolution
- Host attribute application (`tile-size` set on element)
- Non-mutating/idempotent sizing behavior

## Acceptance Criteria

The supersession is successful when:
1. All 6 profile-consuming cards have been migrated to CSS tile-size variants
2. Legacy profile code can be removed from tunet_base.js without breaking any card
3. Replacement unit tests pass
4. Playwright screenshots at all 4 locked breakpoints show acceptable visual quality
5. No card requires understanding the profile system to debug or modify

## What This Decision Does NOT Change

- `tile_size` config option remains available to users
- Cards still auto-size responsively based on container width
- `tunet_base.js` remains the shared primitive source for tokens, surfaces, and utilities
- CSS custom properties remain the token delivery mechanism
- The climate card visual baseline remains the quality reference
