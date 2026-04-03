# Mobile Density Master Matrix (Post T-009E)

Date: 2026-03-06  
Scope: Remaining v2 cards after shared baseline + light/rooms/status adoption pass.

## Why This Exists

This consolidates four parallel audits into one execution matrix so density work stays deliberate and does not drift card-by-card.

Inputs:
- `mobile_density_audit_weather_climate.md`
- `mobile_density_audit_media_audio.md`
- `mobile_density_audit_sensor_actions_scenes.md`
- `mobile_density_crosscard_gap_review.md`

## Root-Cause Model

Most remaining cards are `mixed` root cause:
- shared-token adoption is partial
- card-local hardcoded compact/mobile values still dominate (`padding`, `min-height`, `font-size`)

Important structural gap:
- `RESPONSIVE_BASE` is exported from `tunet_base.js` but not consumed by cards, so central mobile token switching does not auto-propagate.

## Remaining Card Matrix

| Card | Primary Problem | Root Cause | Priority |
|---|---|---|---|
| `tunet_weather_card.js` | tiny segmented controls + tall forecast rhythm + narrow overflow pressure | mixed | `P1` |
| `tunet_speaker_grid_card.js` | oversized compact tile heights with undersized text | mixed | `P1` |
| `tunet_media_card.js` | tiny selector/state text relative to shell footprint | mixed | `P1` |
| `tunet_sonos_card.js` | mobile speaker tile text too small vs card footprint | mixed | `P1` |
| `tunet_climate_card.js` | roomy vertical rhythm + small support text | mixed | `P1` |
| `tunet_sensor_card.js` | small secondary/unit text + loose row padding | mixed | `P2` |
| `tunet_actions_card.js` | compact chip text/tap target too small | card-local dominant | `P1` |
| `tunet_scenes_card.js` | compact chip size borderline for iOS tap/readability | mixed | `P2` |
| `tunet_nav_card.js` | independent styling system, separate density model | independent | `R4` |

## Tranche Order (Recommended)

1. `R1` (highest immediate UX lift):
   - `tunet_weather_card.js`
   - `tunet_speaker_grid_card.js`
   - `tunet_media_card.js`
2. `R2` (heavy daily-use interaction surfaces):
   - `tunet_sonos_card.js`
   - `tunet_climate_card.js`
3. `R3` (consistency polish):
   - `tunet_sensor_card.js`
   - `tunet_actions_card.js`
   - `tunet_scenes_card.js` (pair with actions)
4. `R4`:
   - `tunet_nav_card.js` (isolate from content-card density changes)

## Cross-Card Standards To Enforce

1. Readability floor:
   - Avoid `9-10px` for primary/secondary interactive text on mobile.
2. Compact hit-target floor:
   - Chips/buttons should remain comfortably tappable (practical floor around mid-30px+ depending on role).
3. Token-first policy:
   - Use base density tokens for shell/spacing first.
   - Keep card-local fixed values only where interaction mechanics require it.
4. Actions/scenes unification:
   - Share one compact chip token contract (`min-height`, `font-size`, `padding`, `icon-size`).

## Reusable Subagent Formula

Use this exact worker prompt pattern for any future density pass:

1. Card scope (1-3 cards max, disjoint ownership).
2. Analysis rubric:
   - mobile repro context
   - current compact/mobile CSS values
   - issue classification (whitespace/tiny text/hit-target/clipping)
   - root cause (base vs local vs mixed)
   - prioritized fix plan (`P1/P2/P3`)
   - acceptance checks (phone portrait + tablet)
3. Output path in `Dashboard/Tunet/Docs/`.
4. No code edits unless explicitly requested.
5. State “not alone in codebase; do not revert others.”

## Definition Of Done For Each Density Tranche

1. Card-level syntax checks pass (`node --check`).
2. Resource cache-bust path is updated when shared imports change.
3. Live mobile validation confirms:
   - improved readability
   - reduced dead whitespace
   - no regression to tap targets or clipping.
