# Status + Chips Resolution Guide

Date: 2026-03-06  
Primary file: `Dashboard/Tunet/Cards/v2/tunet_status_card.js`

## Goal

Improve legibility/density and interaction reliability for Home Status tiles while preserving existing entity wiring and behavior contracts.

## Root Causes

1. Tile text hierarchy was too compressed in compact mode.
   - Value/label/secondary typography was under-scaled relative to tile height.
2. Tile sizing looked inconsistent in mixed content.
   - Grid rows were not treated as deterministic tile-height lanes in all cases.
3. Dropdown layering failed in multi-card stacks.
   - Dropdown tile itself had high z-index, but parent card/host stacking contexts could still sit below adjacent cards.
4. Dropdown option feedback looked stale.
   - Optimistic selection update targeted `valEl` instead of dropdown display label.

## Implemented Fixes

### 1) Deterministic tile sizing

- Enforced row-based sizing with shared row-height token:
  - `.grid { grid-auto-rows: var(--tile-row-h) }`
  - `.tile { height: var(--tile-row-h); min-height: var(--tile-row-h) }`
- Updated row-height tuning:
  - standard: `98px`
  - compact: `92px`
  - large: `118px`

### 2) Readability and density

- Increased compact value typography.
- Increased label and secondary text size for compact/mobile readability.
- Reduced top-heavy whitespace by adjusting tile padding/gaps.
- Slightly increased icon baseline sizing for visual balance with text.

### 3) Dropdown overlay reliability

- Elevated host and nearest `ha-card` during open dropdown state:
  - host class `dd-open` now sits at very high z-index
  - runtime `ha-card` z-index elevation on open and restoration on close
- Kept overflow permissive at card/wrap level and isolated grid stacking context.

### 4) Dropdown selection feedback

- Updated optimistic UI path:
  - write selected option into `.tile-dd-val .dd-text`
  - no longer writes to missing `valEl` for dropdown tiles

## Styling Rules/Tokens Used

- `--tile-row-h`
- Compact typography rules on:
  - `.tile-val`
  - `.tile-label`
  - `.tile-secondary`
  - `.tile-dd-val`
- Existing shadow + surface tokens were preserved:
  - `--tile-shadow-rest`
  - `--tile-shadow-lift`
  - `--ctrl-*` and `--dd-*`

## Breakpoint Behavior

### Base

- Stable row-height grid, improved readability, unified tile proportions.

### `@media (max-width: 440px)`

- Compact typography retained/increased for value-first scanability.
- Compact tile padding/gap tuned to reduce wasted whitespace while preventing text clipping.

## Known Limitations / Follow-up

1. If an ancestor outside this card applies hard clipping (`overflow: hidden`) at a higher layout container, dropdown visibility can still be constrained.
2. Status card does not yet provide per-tile custom density tiers.
3. Additional live QA is required for edge cases where adjacent sections have custom stacking contexts.

## Validation Checklist

- `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Manual QA:
  - Open Home Status dropdown with cards above/below; confirm menu overlays neighbors.
  - Select mode and confirm immediate visible selection label update.
  - Verify compact mode readability on phone width.
