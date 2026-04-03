# Tunet Sections Layout Matrix (2026-03-06 Reset)

Purpose: reset Sections layout work to the three real HA control layers:

1. page/view width budget
2. section width/span
3. card width/span

Status: provisional baseline. This doc is now grounded in HA docs + frontend source and must be completed with live tuning evidence.

## Applied Baseline (Storage Surface, 2026-03-06)

Applied to `Dashboard/Tunet/tunet-suite-storage-config.yaml`:

- all sections views use `max_columns: 4`
- all sections views use `dense_section_placement: false`
- overview span strategy normalized to `4/3/1` composition roles
- one concrete subview example (`living-room`) now uses explicit `3/1` split
- nav moved to view `footer.card` across sections views (HA 2026.3 capability), with ongoing validation against nav-card JS behavior

Remaining required step:
- live breakpoint pass at `390x844`, `768x1024`, `1024x1366`, `1440x900` before this doc can move from provisional to accepted.

Important:
- `4/3/1` is a composition pattern for specific surfaces (for example Overview hero/support rows), not a universal rule for every view.
- Each page/subview must use role-based placement decisions per section (hero, companion, support) instead of blindly inheriting one ratio.

## Surface-By-Surface Queue (T-011A Active)

This queue is the active execution order. Only one surface may be in-flight at a time.

| Order | Surface | Status | Goal |
|---|---|---|---|
| 1 | Living Room page | `ACTIVE` | lock the reusable room-page template |
| 2 | Living Room popup | `PENDING` | lock popup companion pattern for the room template |
| 3 | Overview page | `PENDING` | lock home scan order and hero/support balance |
| 4 | Media page | `PENDING` | lock media-first composition and companions |
| 5 | Bedroom, Kitchen, Dining pages | `PENDING` | apply room template + document room-specific deltas |

### Surface Spec Template (Required Before Implementation)

For each surface, document all fields below before changing layout code/config:

- Page intent:
  - primary action users should complete in one touch
  - ordered scan path (phone then tablet/desktop)
- Interaction contract:
  - card body behavior
  - sub-control behavior
  - popup/navigation relationship
- Page-level settings:
  - `max_columns`
  - `dense_section_placement`
- Section-level composition:
  - section list with `hero` / `companion` / `support` role tags
  - `column_span` / `row_span` per section
- Card-level placement:
  - per-card `grid_options`
  - explicit rules for `columns: full` vs shared-row placement
- Breakpoint checks:
  - `390x844`
  - `768x1024`
  - `1024x1366`
  - `1440x900`

### Surface 1 Planning Baseline (Living Room Page)

- Intent:
  - one-touch room lighting first
  - media/context as companions
- First-pass composition target:
  - view: `max_columns: 4`, `dense_section_placement: false`
  - hero section: room status/chips + primary lighting control
  - companion section: media + utility/context card(s)
- Breakpoint behavior target:
  - phone: hero and companions stack full-width
  - tablet/desktop: hero remains dominant, companions side-by-side only if readability stays intact
- Lock rule:
  - do not start Surface 2 until Living Room page has documented breakpoint outcomes and accepted section/card sizing decisions

## Canonical 3-Layer Model

### Layer 1: View (Page-Level Width Budget)

Controls:
- `type: sections`
- `max_columns` (view-level cap on section columns)
- `dense_section_placement` (fills horizontal gaps)

Runtime behavior (important):
- `max_columns` is an upper bound, not a guaranteed rendered column count.
- Rendered columns are derived from viewport/container width and theme variables:
  - `--ha-view-sections-column-min-width` (default `320px`)
  - `--ha-view-sections-column-gap` (default `32px`)
  - `--ha-view-sections-column-max-width` (default `500px`)

Implication:
- With default theme values and typical devices, Sections usually resolves to `1-4` page columns.
- Setting `max_columns: 12` does not mean "show 12 columns" on common screens.

### Layer 2: Section (Composition Width)

Controls:
- section `column_span` (default `1`)
- section `row_span` (default `1`)

Runtime behavior:
- Section span is clamped to currently available content columns.
- Section width decisions are made here (hero/companion/support), not in card internals.

Implication:
- 60/40, 50/50, or 1/3-2/3 compositions work only when the active page column count supports them.

### Layer 3: Card (In-Section Width)

Controls:
- card `grid_options` in YAML/UI
- custom card `getGridOptions()`

Grid options supported by HA:
- `columns`, `rows`
- `min_columns`, `max_columns`
- `min_rows`, `max_rows`
- `fixed_columns`, `fixed_rows`

Runtime behavior:
- `layout_options` is deprecated; use `grid_options`.
- If unset, HA defaults card size to `columns: 12`, `rows: auto`.
- Section grid width is `12 * section column_span`; card `columns` applies inside that section grid.
- `columns: full` means full width of the current section, not full page width.

## Tuning Order (Mandatory)

Apply changes in this order only:

1. view-level (`max_columns`, `dense_section_placement`)
2. section-level (`column_span`, `row_span`)
3. card-level (`grid_options` / `getGridOptions`)

Rule:
- One layer per tuning step.
- Do not tune card internals while view/section behavior is still undefined.

## Deliberate Design Workflow (Page -> Section -> Card)

This is required for the final dashboard build (overview + all room/detail pages).

### Step 1: Page Intent

For each page, explicitly document:
- primary user intent (what must be reachable first)
- hero surface(s) vs companion/support surface(s)
- expected first-scan order on phone and tablet/desktop

### Step 2: Section Orchestration

Assign section roles before touching card internals:
- hero section: dominant width (`column_span` that reflects priority)
- companion section(s): side-by-side when comparison or dual-control is valuable
- support section(s): lower prominence, often narrower or lower in reading order

### Step 3: Card Placement And Sizing

Within each section, use card `grid_options` deliberately:
- full-width in-section card when interaction density is high or readability is critical
- side-by-side cards only when both can remain readable/tappable at target breakpoints
- avoid stacking narrow cards just because spans allow it; prioritize interaction quality

### Step 4: Breakpoint Validation

Validate each page composition at:
- `390x844`
- `768x1024`
- `1024x1366`
- `1440x900`

Record for each page:
- which sections are full-width vs side-by-side
- where two cards intentionally share a row
- where cards must always be full width
- any card-level `grid_options` exceptions and why

### Practical Placement Heuristic

Use this decision logic:
- choose full-width when a card is the primary interaction target or has dense controls
- choose side-by-side when cards are glanceable companions and both remain legible
- if either card clips, compresses controls, or harms first-touch use, revert to full-width

## Breakpoint Baseline (Default Theme Vars)

Assuming default `--ha-view-sections-column-min-width: 320px` and default gaps:

| Width Range | Typical Active Page Columns | Section Strategy | Card Strategy |
|---|---:|---|---|
| `<= 735px` | 1 | stack primary surfaces; avoid fake side-by-side spans | prefer `columns: full` for primary cards |
| `736-1087px` | 2 | use `1/1` or `2/2`; limited 50/50 pairings | avoid hard `max_columns` |
| `1088-1439px` | 3 | viable `2/1` and `1/1/1` sections | use role-based card widths within each section |
| `>= 1440px` | 4 | stable `3/1`, `2/2`, and selective 4-up support sections | keep hero cards wide; companions narrower |

## Legacy 12-Span Normalization (Current Tunet Gap)

Current Tunet YAML heavily uses 12-based section spans (for example `7/5`).
With default HA Sections runtime, these values collapse to available runtime columns and can mask intent.

Until a deliberate theme-width strategy is adopted, normalize authoring intent to active runtime columns:

- `12` -> full width of active columns
- `8` or `7` -> dominant span (`~3/4` or `2/3` depending on active columns)
- `6` or `5` -> medium span (`~1/2`)
- `4` or `3` -> support span (`~1/3`)

This is an interpretation guide for migration and tuning, not a claim that all current YAML is already corrected.

## Authoring Example (Page -> Section -> Card)

```yaml
type: sections
max_columns: 4
dense_section_placement: false
sections:
  - type: grid
    column_span: 3
    cards:
      - type: custom:tunet-status-card
        grid_options:
          columns: full
          min_columns: 6
  - type: grid
    column_span: 1
    cards:
      - type: custom:tunet-weather-card
        grid_options:
          columns: 6
          min_columns: 3
```

## Policy Rules

- Do not optimize by card width in isolation.
- Do not use hard `max_columns` card caps by default.
- Any `max_columns` use must include:
  - Change ID
  - rationale
  - target breakpoints
  - before/after validation evidence

## Validation Loop (Required To Exit Provisional Status)

Test at:
- `390x844`
- `768x1024`
- `1024x1366`
- `1440x900`

Capture for each:
- active page columns observed
- section span behavior observed
- card span behavior observed
- clipping/overflow/stacking defects

Acceptance:
- no accidental one-card-per-section fallback from span mismatch
- no clipped controls in primary interaction surfaces
- no nav/content obstruction on smallest width
- overview + at least one room subview pass the same matrix rules

## Footer Card Note (HA 2026.3+)

- Sections views support `footer.card` and optional `footer.max_width`.
- For Tunet, this is now the preferred placement surface for persistent nav on storage views.
- This does not automatically solve nav-card global offset side effects; those remain a JS-level concern tracked in `FL-011`.

## Primary Sources (For This Reset)

- https://www.home-assistant.io/dashboards/views/
- https://www.home-assistant.io/dashboards/sections/
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/data/lovelace/config/view.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/data/lovelace/config/section.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/data/lovelace/config/card.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/types.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/views/hui-sections-view.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/views/hui-view-footer.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/sections/hui-grid-section.ts
- https://raw.githubusercontent.com/home-assistant/frontend/dev/src/panels/lovelace/common/compute-card-grid-size.ts
- https://www.home-assistant.io/blog/2026/03/04/release-20263/
