# Mobile Density Cross-Card Gap Review

Date: 2026-03-06  
Scope:
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
- `Dashboard/Tunet/Cards/v2/tunet_*.js`

## Summary

The new base density token pass is directionally correct but only partially effective across the suite.

- `CARD_SURFACE` / `SECTION_SURFACE` are used by many cards.
- `CTRL_SURFACE` and `DROPDOWN_MENU` are currently unused by v2 cards.
- `RESPONSIVE_BASE` is not consumed by any card, so base mobile token switching does not propagate automatically.
- Several cards still use card-local fixed mobile values (`padding: 16px`, `min-height: 84-94px`, `font-size: 9-11px`) and therefore bypass central density tuning.

## Coverage Table

Legend: `Y` = used, `N` = not used, `P` = partial (imported pattern not effectively applied to main tile shell).

| Card | CARD_SURFACE | SECTION_SURFACE | TILE_SURFACE | CTRL_SURFACE | DROPDOWN_MENU |
|---|---:|---:|---:|---:|---:|
| `tunet_actions_card.js` | Y | N | N | N | N |
| `tunet_climate_card.js` | Y | N | N | N | N |
| `tunet_light_tile.js` | N | N | P | N | N |
| `tunet_lighting_card.js` | Y | N | N | N | N |
| `tunet_media_card.js` | Y | N | N | N | N |
| `tunet_nav_card.js` | N | N | N | N | N |
| `tunet_rooms_card.js` | N | Y | N | N | N |
| `tunet_scenes_card.js` | Y | N | N | N | N |
| `tunet_sensor_card.js` | N | Y | N | N | N |
| `tunet_sonos_card.js` | Y | N | N | N | N |
| `tunet_speaker_grid_card.js` | Y | N | N | N | N |
| `tunet_status_card.js` | Y | N | N | N | N |
| `tunet_weather_card.js` | Y | N | N | N | N |

## Gap List (Bypasses Shared Density Controls)

### Platform-Level Gaps

1. `RESPONSIVE_BASE` is exported but not used by v2 cards.
2. `CTRL_SURFACE` and `DROPDOWN_MENU` are not adopted in card implementations.
3. Many cards re-declare mobile compact metrics locally instead of using shared tokenized controls.

### Card-Level Gaps (Ignoring/Bending Base Density)

1. `tunet_weather_card.js`
- Uses very small forecast/control text (`9-11px`) and keeps mobile `card` padding at `16px`.
- Toggle + forecast density still card-local and not tokenized.

2. `tunet_speaker_grid_card.js`
- Keeps large compact tile heights (`84-94px`) with small text in compact meta.
- Strong contributor to perceived whitespace.

3. `tunet_sonos_card.js`
- Dense vertical spacing but text still `10-12px` in key secondary labels.
- Card-local layout sizing dominates.

4. `tunet_media_card.js`
- Compact selector/secondary text remains `10-11px`.
- Card-local dropdown and row sizing bypass shared control tokens.

5. `tunet_climate_card.js`
- Large shell/padding balance with small secondary text produces visual mismatch.
- Uses card-local mobile values.

6. `tunet_sensor_card.js`
- Uses `SECTION_SURFACE` but mobile typography still card-local and small for secondary lines.

7. `tunet_nav_card.js`
- Fully independent styling system; unaffected by base density changes.

## Likely Regression Risks From Current Base Changes

Risk is low-to-medium today because the most aggressive mobile shifts are still card-local.

Potential regressions to verify:

1. Cards that use `CARD_SURFACE` and also override `padding` at mobile may now have mixed token/override paths.
- Verify no double-compression or inconsistent radii across siblings.

2. `tunet_light_tile.js` imports `TILE_SURFACE` but its primary shell is `.lt`, not `.tile`.
- Future assumptions about base tile token propagation could be incorrect unless `.lt` is explicitly mapped to shared density tokens.

3. Control/dropdown token changes in base will have minimal effect until cards adopt `CTRL_SURFACE`/`DROPDOWN_MENU`.
- Teams may assume global fix landed when it has not materially propagated.

## Recommended Rollout Order (Next Tranches)

### Tranche R1 (Highest UX Impact, Medium Risk)
- `tunet_weather_card.js`
- `tunet_speaker_grid_card.js`
- `tunet_media_card.js`

Why:
- Most visible compact readability + whitespace complaints.
- Fastest perceived improvement on overview/mobile.

Risk notes:
- Weather has interactive mode controls + forecast layout; avoid clipping regressions.
- Speaker/media cards have drag/selection interactions; keep hit-targets >= 40px.

### Tranche R2 (High Impact, Medium Risk)
- `tunet_sonos_card.js`
- `tunet_climate_card.js`

Why:
- Heavy daily-use interaction surfaces with mixed dense/roomy hierarchy.

Risk notes:
- Avoid reducing affordance size for transport/volume and thermostat gestures.

### Tranche R3 (Medium Impact, Low Risk)
- `tunet_sensor_card.js`
- `tunet_actions_card.js`
- `tunet_scenes_card.js` (unify chip density token model with actions)

Why:
- Improves consistency polish and reduces cross-card compact drift.

Risk notes:
- Mostly typography/spacing changes; lower behavior risk.

### Tranche R4 (Structural)
- `tunet_nav_card.js`

Why:
- Separate styling model; evaluate independently after content-card density converges.

Risk notes:
- Navigation touch targets and bottom-safe-area behavior must remain stable.

## Practical Recommendation

For true global control, add one shared compact density profile that every card opts into explicitly:

1. Promote token use in each card for:
- card padding
- tile min-height
- primary/secondary text scale
- control row min-height

2. Adopt shared control/dropdown surfaces where possible.

3. Keep per-card exceptions only for interaction-specific constraints (drag tracks, graph labels, weather forecast cells).
