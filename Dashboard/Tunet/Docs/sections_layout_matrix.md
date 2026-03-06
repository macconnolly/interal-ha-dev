# Tunet Sections Layout Matrix (2026-03-06)

Purpose: define how Tunet uses native Home Assistant Sections at three levels:

1. overall view width behavior
2. section composition (role-based spans)
3. card-level span hints (`getGridOptions()`)

This file is mandatory input for responsive layout work in all tranches.

## Design Rules

- Do not optimize by card width in isolation.
- Do not lock card widths with hard `max_columns` by default.
- Use role-based compositions (hero vs companion vs support), not one-card-per-section scrolling stacks.
- Any hard width cap must be a documented exception with rationale and validation evidence.

## Breakpoint Matrix

The project uses a 12-column mental model for composition planning.

| Range | Intent | View / Section Pattern | Card Behavior |
|---|---|---|---|
| <= 480px (phone) | fast one-hand control | mostly 1-up flow; selected 2-up only for small support surfaces | cards should expand naturally; nav is icons-only dock with horizontal overflow |
| 481-900px (large phone / small tablet) | preserve hierarchy with low clutter | 1-up and 60/40 alternation where needed | cards remain intrinsic; avoid forcing narrow fixed widths |
| 901-1280px (tablet / laptop) | parallel context + control | 60/40, 50/50, 1/3-2/3 based on role | card spans follow section role, not card internals |
| > 1280px (desktop wide) | high-density but readable | selective 3-up sections when each section has clear interaction value | avoid decorative filler sections; maintain role hierarchy |

## Reference Compositions

## Overview

- top action strip: full width
- primary state/control block + companion context: 60/40
- lighting hero: full width or 2/3 depending on density
- rooms + media companion row: 60/40
- hidden/system popup cards: isolated to minimum span to avoid layout pollution

## Room subview

- room lighting surface: primary (2/3 or full)
- room companion (media/climate/status): 1/3 or stacked after primary on smaller widths
- nav remains persistent; room page content should not depend on popup-only affordances

## Card Grid Policy

- `getGridOptions()` defaults:
  - `columns`: `'full'` or role-appropriate numeric minimum
  - `min_columns`: smallest reasonable value for content readability
  - no hard `max_columns` by default
- exception process:
  - add change ID + rationale
  - specify target breakpoints
  - provide before/after validation screenshots

## Validation Checklist

- overview and at least one room subview tested at:
  - 390x844
  - 768x1024
  - 1024x1366
  - 1440x900
- no accidental one-card-per-section fallback due span misconfiguration
- no clipped controls or horizontal overflow in primary interaction surfaces
- nav does not obscure content at smallest tested width
