# Tunet Weather Card Refactor Plan

Date: 2026-03-06  
Target file: `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`

## Scope

This is a design + implementation plan for the weather card issues reported in live use.
It is intentionally implementation-ready (function-level) but does not apply code yet.

## Problem Matrix

| ID | Repro Path | Current Behavior | Desired Behavior | Likely Root Cause | Code Regions |
|---|---|---|---|---|---|
| WTH-01 | Overview -> weather card -> set `metric=precipitation` | Precip values often display `0` or `--` | Show meaningful precip signal with correct unit/label | Narrow key usage (`precipitation_probability` and `precipitation`) with no multi-key fallback per provider | `_renderForecast()`, `_applyAutoModes()` |
| WTH-02 | Toggle `Daily/Hourly` + `Temp/Precip` | Hourly item count differs from daily count logic and creates inconsistent information density | Precip mode should show the same number of hourly items as daily mode shows daily items | `limit` selection is split by mode (`forecast_hours` vs `forecast_days`) | `_renderForecast()` |
| WTH-03 | Mobile/compact view | Forecast tiles are too tall; card dominates vertical space | Forecast tiles should be compact and glanceable | Tile padding/gaps/icon sizes are too large for 5-item strip | `CARD_STYLES` (`.weather-forecast`, `.forecast-tile`, `.forecast-icon`, `.forecast-temps`, `.forecast-precip-wrap`) |
| WTH-04 | Narrow card width (phone + stacked sections) | View/metric toggles overflow the card bounds | Toggle controls stay inside card and wrap gracefully | Header layout has no hard containment strategy for two segmented control groups | `CARD_STYLES` (`.hdr`, `.hdr-controls`, `.seg-group`, `.seg-btn`) |

## Data Source Plan (Precipitation)

Implement a normalized precipitation extraction pipeline:

1. `probability` candidate keys (priority order):
   - `precipitation_probability`
   - `precipitation_chance`
   - `precip_probability`
   - `rain_probability`
2. `amount` candidate keys (priority order):
   - `precipitation`
   - `rain`
   - `snow`
3. Normalize:
   - `probability`: clamp `0..100` integer
   - `amount`: mm as float with one decimal for display

Planned helper functions:

- `_resolvePrecipProbability(fc)`
- `_resolvePrecipAmount(fc)`
- `_resolvePrecipPresentation(fc)` -> `{ barPercent, label, source }`

Fallback behavior:

- If probability exists, primary label is `%`.
- Else if amount exists, primary label is `mm`.
- Else show `--` and render a neutral/empty bar.

## UI Contract

### Mode Matrix

| View Mode | Metric Mode | Tile Count Rule | Value Presentation |
|---|---|---|---|
| `daily` | `temperature` | `forecast_days` | High / low |
| `daily` | `precipitation` | `forecast_days` | Daily precip probability/amount |
| `hourly` | `temperature` | `forecast_hours` | Hourly temperature |
| `hourly` | `precipitation` | **`forecast_days` parity rule** | Hourly precip for the next N hours where `N = forecast_days` |

Implementation note:

- Add `_resolveForecastLimit()` to enforce parity rule.
- Keep existing explicit config behavior for non-precip hourly temperature.

## Layout + Density Contract (HA Sections Model)

This card remains card-level responsive and should not use pixel-based page assumptions.

- `getGridOptions()`: keep `columns: 6`, `min_columns: 3`.
- Internal card density:
  - Reduce forecast tile vertical padding.
  - Reduce icon size and inter-element gaps.
  - Preserve readable label/value sizes while minimizing empty vertical area.

Target compact profile:

- Forecast strip should fit as a compact companion row under weather summary.
- No mode should exceed current card height envelope by more than ~10%.

## Toggle Containment Strategy

Header controls should never overflow container:

1. Convert `.hdr` into a 2-row safe layout when narrow:
   - Row 1: info tile
   - Row 2: toggle groups
2. Add `min-width: 0` and controlled wrapping on `.hdr-controls`.
3. Reduce segmented button padding/font in narrow widths.
4. Prefer stacking `view` and `metric` groups vertically under tight width if required.

## Implementation Tranche Plan

### Tranche WTH-A (safe + high impact)

- Add precipitation key fallback helpers.
- Add parity-limited hourly precipitation.
- Add compact forecast tile density tuning.
- Add header/toggle containment changes.

### Tranche WTH-B (optional refinement)

- Add explicit config switch for parity override (`hourly_precip_count_source: days|hours`).
- Add tooltip/debug mode showing precip source key used per tile.

## Acceptance Checklist

1. Precip mode no longer shows all zeros on providers that supply non-standard precip keys.
2. Hourly precip count equals `forecast_days` count (parity requirement).
3. Weather card height is visibly reduced in compact/mobile without truncating core values.
4. Daily/Hourly + Temp/Precip toggles remain inside card bounds at narrow widths.
5. `node --check Dashboard/Tunet/Cards/v2/tunet_weather_card.js` passes after implementation.

## Non-Goals

- No changes to navigation/popup behavior.
- No changes to non-weather cards in this tranche.
- No forced dashboard-level span changes inside this weather refactor.
