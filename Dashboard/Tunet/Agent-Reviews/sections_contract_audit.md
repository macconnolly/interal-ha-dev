# Sections Contract Audit (Tunet v2)

Date: 2026-03-07  
Scope: `Dashboard/Tunet/Cards/v2/*.js`  
Intent: decision-support audit only (no implementation decision)

## Scope + Contract Baseline

Audit lens applied per card:
- `getGridOptions()` quality/consistency vs Sections 3-layer model
- `getCardSize()` realism vs observed/declared internal height behavior
- internal fixed sizing that can fight `rows: auto`
- viewport-width logic vs container-width logic
- places where card internals can make section sizing feel "wrong"

Primary control references reviewed: `Dashboard/Tunet/AGENTS.md`, `plan.md`, `FIX_LEDGER.md`, `handoff.md`, `Dashboard/Tunet/Docs/sections_layout_matrix.md`.

Non-card runtime helper reviewed:
- `Dashboard/Tunet/Cards/v2/tunet_base.js` has no `getCardSize()` / `getGridOptions()` and no direct Sections host mutation; treated as shared token/style substrate, not a Sections-sizing contract owner.

## Issue Matrix

| Card | File:Line | Current Behavior | Why It Breaks Sections Expectations | Severity (P0/P1/P2) | Fix Pattern Candidates (not final decision) |
|---|---|---|---|---|---|
| `tunet_nav_card` | `Dashboard/Tunet/Cards/v2/tunet_nav_card.js:187`, `...:193`, `...:194`, `...:201`, `...:477` | Injects global offsets (`margin-bottom`, `padding-bottom`, `min-height`) into `hui-view` / `hui-sections-view` and computes bottom offset with viewport/safe-area math. | Card-local internals mutate whole-view geometry, so section/card sizing can appear wrong even when section spans are correct. | P0 | Move to explicit layout slot contract (footer/rail host) or isolate offset effects to scoped container instead of global host selectors. |
| `tunet_nav_card` | `Dashboard/Tunet/Cards/v2/tunet_nav_card.js:162`, `...:435`, `...:438` | Desktop mode and rail height are viewport-driven (`100vh`, `matchMedia`). | Behavior is tied to viewport breakpoint, not actual section/container width; can mismatch embedded width scenarios. | P1 | Derive mode from container width when embedded; keep viewport mode only for truly global dock contexts. |
| `tunet_lighting_card` | `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js:360`, `...:361`, `...:1155`, `...:1160` | Uses fixed row-height model (`grid-auto-rows` driven by JS-set px values) plus fixed per-column max width (`minmax(0, 180px)`). | Internal pixel row model can dominate perceived height and make outer Sections `rows: auto` feel unpredictable. | P0 | Prefer content-driven row sizing or tokenized min/max bands with less hard coupling to fixed px row math. |
| `tunet_lighting_card` | `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js:996`, `...:998`, `...:1003`, `...:1153`, `...:1697` | Responsive columns/subtitle behavior based on `window.innerWidth` and `matchMedia`. | Section width can be narrow while viewport is wide; card reacts to viewport, not container, causing local density mismatch. | P0 | Use container measurement (ResizeObserver/card width) for breakpoint resolution; reserve viewport checks for explicit global-only features. |
| `tunet_lighting_card` | `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js:978`, `...:983`, `...:985`, `...:989` | `getCardSize()` estimates from configured/visible rows (`2 + visibleRows*2`) while tile internals and row px vary by mode/mobile. | Size hint can diverge from true rendered height (especially with dynamic tile height/dense modes), making section allocation appear off. | P1 | Calibrate hint model to actual row-height tokens/modes or clamp via simpler conservative hint profile. |
| `tunet_status_card` | `Dashboard/Tunet/Cards/v2/tunet_status_card.js:127`, `...:138`, `...:141`, `...:178`, `...:199` | Tile grid is hard row-height based (`--tile-row-h`, fixed `height/min-height`). | Fixed tile row contract can resist natural content growth and make outside auto-row behavior feel rigid. | P1 | Keep fixed rows for predictability but align size hints/overflow policy to avoid mismatch; or loosen fixed height where long values/aux controls exist. |
| `tunet_status_card` | `Dashboard/Tunet/Cards/v2/tunet_status_card.js:637`, `...:641`, `...:653`, `...:670`, `...:679` | Uses container-aware responsive columns via ResizeObserver and applies grid columns dynamically. | This is mostly correct; residual fallback to viewport exists only when width is unavailable. | P2 | Keep model; reduce fallback reliance and ensure first-render width is container-derived before paint where feasible. |
| `tunet_status_card` | `Dashboard/Tunet/Cards/v2/tunet_status_card.js:831`, `...:833`, `...:837` | `getCardSize()` uses `tiles/cols` arithmetic, not accounting for dropdown expansions/alarm extra controls. | Interactive/expanded states can exceed static height hints, making section auto-fit feel inconsistent during interaction. | P1 | Base hint on worst-case enabled tile types or reserve interaction overflow strategy that avoids changing card block height. |
| `tunet_rooms_card` | `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js:768`, `...:771`, `...:773`, `...:778` | `getCardSize()` scales linearly by room count in row/slim modes (`roomCount + 1`). | Actual row heights vary by mode/mobile media rules; linear estimate can overshoot or undershoot at breakpoints. | P1 | Mode-aware hint table or measured row density mapping by variant. |
| `tunet_rooms_card` | `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js:154`, `...:548`, `...:561`, `...:551` | Grid layout shifts by viewport media queries (`max-width:440`, `min-width:500`) and hard min tile heights. | Narrow section on wide viewport may not trigger compact behavior; card density responds to viewport, not section/container width. | P1 | Prefer container query/observer at card container level for column/tile-mode transitions. |
| `tunet_speaker_grid_card` | `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js:619`, `...:621`, `...:623`, `...:389`, `...:392`, `...:753` | `getCardSize()` uses configured `columns`; CSS mobile path forces `--cols-sm` (set to `1`) and larger tile minimums. | Height hint can significantly diverge from actual rows at mobile breakpoints/forced cols-sm, making outer section sizing feel wrong. | P0 | Compute hint from effective columns (post-breakpoint), not raw config; unify cols-sm policy with size estimator. |
| `tunet_speaker_grid_card` | `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js:143`, `...:166`, `...:171`, `...:396` | Multiple hard min-heights (58/68/72/84) plus mode-specific shifts. | Internal minima increase row demand independent of outer row auto behavior; perceived "too tall" sections possible. | P1 | Consolidate min-height tiers and tie to explicit size tokens used by hint model. |
| `tunet_sonos_card` | `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js:217`, `...:220`, `...:236`, `...:426`, `...:702` | Card uses horizontal scroll tiles with fixed tile widths (150/100 mobile) and constant `getCardSize() = 3`. | Content density can vary with tile count/header state while size hint is static; section height can feel detached from real composition. | P1 | Estimate size by active vertical blocks (header + transport + scroll strip), or set conservative fixed height contract explicitly in matrix docs. |
| `tunet_media_card` | `Dashboard/Tunet/Cards/v2/tunet_media_card.js:622`, `...:627`, `...:348`, `...:352` | Constant `getCardSize() = 3`; responsive behavior uses viewport media query; view toggles (`media-row`/`vol-row`) share space. | Height hint may be stable but can mismatch when typography/control sizes shift by viewport rather than container width. | P1 | Container-based breakpoint switching for compact mode, plus validate fixed size hint against both media/volume states. |
| `tunet_weather_card` | `Dashboard/Tunet/Cards/v2/tunet_weather_card.js:454`, `...:456`, `...:460`, `...:175`, `...:223`, `...:239` | `getCardSize()` is binary (`5` with forecast, else `3`) while forecast/detail layout changes by media queries and day count. | Height estimate is coarse relative to variable forecast tile count and responsive detail collapse; section row fit can drift. | P1 | Use forecast-day-aware and mode-aware size estimate bands; or explicitly cap rendered forecast rows. |
| `tunet_sensor_card` | `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js:519`, `...:520`, `...:524`, `...:112`, `...:116` | `getCardSize()` based on sensor row count (`1 + n`), with flexible row list and no hard card height lock. | Better than most; residual drift possible from optional sparkline/trend content density, but generally aligned with content. | P2 | Minor calibration only if live tests show over/under-allocation. |
| `tunet_scenes_card` | `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js:142`, `...:150`, `...:421`, `...:423`, `...:427` | Can be single-row horizontal scroll or wrapped chips; `getCardSize()` assumes wrap row math (`ceil(count/4)`). | Chip width variability makes `count/4` weak predictor; wrapped heights can diverge from hint. | P1 | Derive row estimate from effective chip widths or provide explicit fixed/non-wrap contracts in config matrix. |
| `tunet_actions_card` | `Dashboard/Tunet/Cards/v2/tunet_actions_card.js:186`, `...:199`, `...:374`, `...:377`, `...:382` | Action row is single flex lane (no wrap); `getCardSize()` assumes multi-row by `ceil(actionCount/4)`. | Height hint can overestimate when chips stay in one row (or hidden), causing section space reservation drift. | P1 | Align estimator with real layout mode (single-row strip vs wrapped variant) and visible-chip count. |
| `tunet_climate_card` | `Dashboard/Tunet/Cards/v2/tunet_climate_card.js:783`, `...:784`, `...:788`, `...:56`, `...:69` | Card uses fixed variant hints (`3` thin, `4` standard), while internal slider/header structures differ by variant and optional details. | Static hint may be acceptable but can diverge if content slots evolve; not container-aware. | P2 | Keep static contract only if live tests confirm consistent fit across breakpoints; otherwise mode-state-aware hint bands. |
| `tunet_light_tile` | `Dashboard/Tunet/Cards/v2/tunet_light_tile.js:439`, `...:440`, `...:444`, `...:103`, `...:106` | Variant-based fixed hint (`1` horizontal, `2` otherwise) with viewport media-query min-height adjustments. | If used directly in Sections, viewport-driven compaction can diverge from section width context. | P2 | Container-aware compact trigger if standalone card is used in narrow sections on wide screens. |

## Global Patterns

1. Viewport-coupled responsiveness is still common.
Evidence: `window.innerWidth`/`matchMedia` in `tunet_lighting_card.js:998`, `...:1153`, `...:1697`; nav viewport breakpoint in `tunet_nav_card.js:435`; broad `@media` usage in climate/media/rooms/weather/sonos/speaker-grid/light-tile.

2. `getCardSize()` heuristics often use simplified arithmetic not tightly tied to runtime layout.
Evidence: actions (`tunet_actions_card.js:377`), scenes (`tunet_scenes_card.js:423`), weather (`tunet_weather_card.js:456`), speaker-grid (`tunet_speaker_grid_card.js:621`), sonos/media static (`tunet_sonos_card.js:702`, `tunet_media_card.js:622`).

3. Fixed internal row/tile heights are used as layout anchors.
Evidence: lighting `grid-auto-rows` (`tunet_lighting_card.js:361`), status fixed tile rows (`tunet_status_card.js:178`, `...:199`), multiple hard min-heights in room/speaker/weather/light-tile cards.

4. Full-width grid hints are overused without row/min-row intent.
Evidence: many cards return only `columns` + `min_columns`; no card-level `rows/min_rows/max_rows` hints to reflect true block-height intent.

5. One card (`tunet_nav_card`) modifies global host layout outside its own section.
This is the highest-risk drift vector for "Sections feels wrong" reports.

## What Is Actually Fine

1. `tunet_status_card` has the strongest container-aware column model (`ResizeObserver` + dynamic `gridTemplateColumns`) (`tunet_status_card.js:653`, `...:679`).
2. `tunet_sensor_card` uses a mostly content-linear height contract (`1 + sensor count`) with flexible rows and no hard card-height lock (`tunet_sensor_card.js:519`).
3. `tunet_climate_card` slider uses `ResizeObserver` for slider geometry (interaction quality) without forcing global layout side effects (`tunet_climate_card.js:896`).
4. Cards generally avoid static fixed outer card width caps (`width: 100%` is common), which is compatible with section-level width control.

## Unknown / Needs Live Test

1. Sonos and Media fixed `getCardSize()` realism under all states:
- `tunet_sonos_card.js:702`
- `tunet_media_card.js:622`

2. Weather binary size hint (`3/5`) vs forecast-day permutations and actual rendered height:
- `tunet_weather_card.js:454`

3. Status dropdown expansion behavior in dense section stacks (z-index, overflow, temporary max-height caps):
- `tunet_status_card.js:1408`, `...:1423`, `...:1427`

4. Lighting scroll mode card-size estimate vs visible rows under mixed tile-size + dense-compact combinations:
- `tunet_lighting_card.js:979`, `...:985`, `...:1155`

5. Speaker-grid mobile effective columns/hint mismatch impact on section auto-placement:
- `tunet_speaker_grid_card.js:621`, `...:392`, `...:753`

## Contradictions / Alignment Notes

1. `Dashboard/Tunet/AGENTS.md` enforces Sections abstract model over pixel-first reasoning, but several cards still rely on fixed pixel row contracts and viewport breakpoints as primary behavior drivers.
2. `plan.md` / `handoff.md` call out container-driven responsiveness improvements (notably Status). That is true for Status, but not yet consistent across Lighting/Rooms/Weather/Media/Sonos/Speaker-Grid.
3. `sections_layout_matrix.md` stresses Page -> Section -> Card tuning order; `tunet_nav_card` global host CSS offsets bypass this layering by mutating page host geometry directly.

## Breakpoint Validation Checklist (Required)

Use this checklist at: `390x844`, `768x1024`, `1024x1366`, `1440x900`.

1. Record active page columns, section `column_span` effects, and observed card widths per surface.
2. For each audited card instance, compare expected `getCardSize()` intent vs actual rendered height blocks.
3. Verify whether responsive mode switch was triggered by container width or viewport width.
4. Check for clipped controls/text where card has fixed row/tile heights.
5. Check for excess vertical slack where size hint overestimates actual content.
6. For Nav card, confirm whether global offsets alter unrelated section spacing/scroll behavior.
7. For dropdown/overlay cards (Status/Media/Sonos), test open-state overflow in dense section stacks.
8. Confirm no section appears "wrong-sized" purely due to internal card min-height or global host mutation.
9. Capture pass/fail per card and screenshot any mismatch with file-line references.
