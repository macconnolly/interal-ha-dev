# Sections View Width Research — Desktop Layout Fix
**Date:** 2026-03-09
**Status:** Research complete, actionable
**Applies to:** HA 2026.3+ frontend, `tunet-overview` storage dashboard

---

## Executive Summary

The narrow desktop layout is caused by `max_columns: 1` on the G5 Sections test view. This limits the view to a single 320-500px section column, centered on screen. The fix involves two independent levers: (1) increasing `max_columns` to allow more section columns, and (2) overriding CSS custom properties to control the width of each column. layout-card from HACS **cannot** help here -- it does not support the `sections` view type.

---

## Question 1: What does `max_columns: N` control?

### Answer

`max_columns` controls the **maximum number of section columns** (not card columns) that the Sections view will display side by side. It is a view-level property, not a card-level property.

**Source code** (`hui-sections-view.ts`):
```typescript
export const DEFAULT_MAX_COLUMNS = 4;

// In the ResizeController callback:
const maxColumns = this._config?.max_columns ?? DEFAULT_MAX_COLUMNS;
return clamp(columns, 1, maxColumns);
```

The actual column count displayed is computed dynamically via a `ResizeController` that measures the container width:
```typescript
const columns = Math.floor(
  (totalWidth - padding + columnGap) / (minColumnWidth + columnGap)
);
```

Then clamped: `clamp(columns, 1, maxColumns)`.

**Critically**, `columnCount` is also clamped to `totalSectionCount`:
```typescript
const columnCount = Math.max(
  Math.min(maxColumnCount, totalSectionCount),
  1
);
```

This means if you have only 1 section in the view, `max_columns: 4` still renders 1 column. You need multiple sections (or sections with `column_span > 1`) to fill the columns.

### Current state

The G5 test view has `max_columns: 1` and a single section with `column_span: 6`. The `column_span: 6` is irrelevant because `max_columns: 1` caps the column count to 1. The section renders as a single column, capped at `--column-max-width: 500px` (the default), centered on the page.

### What increasing max_columns does

Setting `max_columns: 2` (or higher) allows the view to render multiple section columns side by side. Each section column gets its own 12-column internal grid. Cards with `columns: 12` span the full width of their section, but not the full viewport.

**However**: With a single section, increasing `max_columns` alone does nothing. You either need:
- Multiple sections (each becomes its own column), or
- A single section with `column_span > 1` AND `max_columns` high enough to allow it

### Can it be increased?

Yes. Valid range is any positive integer. The default is 4. Setting `max_columns: 4` with a single section that has `column_span: 4` would make that section span 4 column slots wide.

---

## Question 2: Can layout-card customize a Sections view?

### Answer: No.

layout-card (HACS, by Thomas Loven) operates as a **custom view type replacement** or **card wrapper**. It provides four view types:
- `custom:masonry-layout`
- `custom:horizontal-layout`
- `custom:vertical-layout`
- `custom:grid-layout`

It does **not** interact with or modify HA's native `type: sections` view. The layout-card documentation contains zero references to sections views. These are fundamentally different systems:

- **layout-card**: Replaces the entire view rendering engine with its own layout algorithm
- **Sections view**: HA's native CSS Grid-based layout engine with `hui-grid-section` components

layout-card cannot be used as a wrapper inside a sections view to modify column widths or breakpoints. It is irrelevant to this problem.

**What layout-card CAN do**: If you abandon the sections view entirely and use `type: custom:grid-layout`, you get full control over column widths, breakpoints via `mediaquery`, and CSS grid properties. But you lose sections-native features (drag-and-drop editing, section titles, `getGridOptions()` integration, dense mode).

---

## Question 3: Relationship between view `max_columns` and card `getGridOptions().columns`

### Answer: Two independent grid levels.

These operate at completely different layers:

| Property | Level | Controls |
|----------|-------|----------|
| View `max_columns` | View | How many **section columns** display side-by-side |
| Section `column_span` | Section | How many view column slots a section occupies |
| Card `getGridOptions().columns` | Card | How many of the section's internal **12-column grid** the card spans |

**The relationship:**

1. The **view** has a responsive column count (1 to `max_columns`), determined by viewport width and `--column-min-width`.
2. Each **section** occupies 1 or more view columns (via `column_span`).
3. Within each section, there is a **12-column CSS grid** (defined by `--base-column-count: 12` in `hui-grid-section.ts`).
4. Each **card** spans some number of those 12 columns (via `getGridOptions().columns`).

When the section's `column_span` is greater than 1, the internal grid scales: `--grid-column-count = 12 * column_span`. So a `column_span: 2` section has a 24-column internal grid, and a card with `columns: 12` would span half its width.

**For your cards** (`columns: 12, min_columns: 6`):
- In a single-section view (`column_span: 1`): card spans 12/12 = full section width
- In a `column_span: 2` section: card spans 12/24 = half the section width
- With `columns: 'full'`: card spans `1 / -1` (full width regardless of grid column count)

---

## Question 4: CSS approaches to make Sections use full desktop width

### Answer: Yes, via CSS custom properties (theme or card_mod).

The Sections view exposes six CSS custom properties with `--ha-view-sections-*` prefix:

| CSS Variable | Default | Controls |
|-------------|---------|----------|
| `--ha-view-sections-column-max-width` | `500px` | Maximum width of each section column |
| `--ha-view-sections-column-min-width` | `320px` | Minimum width for column count calculation |
| `--ha-view-sections-column-gap` | `32px` | Horizontal gap between section columns |
| `--ha-view-sections-row-gap` | `8px` | Vertical gap between sections |
| `--ha-view-sections-row-height` | `56px` | Base row height for cards with numeric `rows` |
| `--ha-view-sections-narrow-column-gap` | `var(--row-gap)` | Column gap on mobile (<=600px) |

The critical constraint is the `.container` max-width:
```css
max-width: calc(
  var(--column-count) * var(--column-max-width) +
    (var(--column-count) - 1) * var(--column-gap)
);
```

With `max_columns: 1` and default `--column-max-width: 500px`, the container is capped at **500px**. That is the root cause of the narrow layout.

### Approach A: Theme override (recommended for global change)

Create or modify a theme in `configuration.yaml` or `themes/` directory:

```yaml
# In themes/tunet_wide.yaml (or inline in configuration.yaml under frontend: themes:)
tunet_wide:
  ha-view-sections-column-max-width: "1200px"
  ha-view-sections-column-min-width: "400px"
  ha-view-sections-column-gap: "24px"
  ha-view-sections-row-gap: "8px"
  ha-section-grid-column-gap: "8px"
  ha-section-grid-row-gap: "8px"
```

Then set the view's theme:
```yaml
views:
  - title: G5 Sections Test
    path: g5-test
    type: sections
    max_columns: 4
    theme: tunet_wide
```

### Approach B: card_mod view-level styling (recommended for per-view control)

Using card_mod's `card-mod-view-yaml` in a theme:

```yaml
tunet_sections:
  card-mod-theme: tunet_sections
  ha-view-sections-column-max-width: "1200px"
  ha-view-sections-column-min-width: "400px"
  ha-view-sections-column-gap: "24px"
```

Or via card_mod on the view itself (if using YAML-mode dashboard):
```yaml
views:
  - title: Overview
    type: sections
    max_columns: 4
    card_mod:
      style:
        .: |
          :host {
            --column-max-width: 1200px !important;
            --column-min-width: 400px !important;
          }
```

**Note**: For a storage dashboard, view-level card_mod styling must be applied via a theme (Approach A or B) since you cannot add arbitrary `card_mod:` to a storage view config through the HA UI. The theme approach works universally.

### Approach C: Override via `--column-max-width` directly

The internal (non-prefixed) variables `--column-max-width`, `--column-min-width`, etc. are set from the `--ha-view-sections-*` prefixed variables on the `:host` element of `hui-sections-view`. You can override either level.

---

## Question 5: Recommended approach for responsive Sections dashboard

### Recommended Configuration

For a dashboard that uses ~50% width on mobile but fills a 1440px desktop, the approach is:

**Step 1: Set `max_columns` appropriately.**

For a single-section dashboard where all cards should be in one vertical flow:
```yaml
views:
  - title: Overview
    type: sections
    max_columns: 4
    sections:
      - type: grid
        column_span: 1
        cards: [...]
```

`max_columns: 4` lets the ResizeController decide how many columns fit. With default `--column-min-width: 320px`, a 1440px viewport yields `floor((1440 + 32) / (320 + 32)) = 4` columns. But if you only have 1 section, it stays at 1 column.

**Step 2: Override column max-width to allow wider sections.**

The key insight: if you want a single section to be wide on desktop, you need to increase `--column-max-width` beyond 500px. The container's `max-width` is calculated from `column-count * column-max-width`.

For a **single wide section** approach (all cards in one flow, full width):
```yaml
# Theme
tunet_wide:
  ha-view-sections-column-max-width: "1400px"
  ha-view-sections-column-min-width: "320px"
```

```yaml
# View config
views:
  - title: Overview
    type: sections
    max_columns: 1
    theme: tunet_wide
    sections:
      - type: grid
        cards: [...]
```

This gives you a single section column that can be up to 1400px wide on desktop, with the internal 12-column grid spanning that full width. Cards with `columns: 6` would be ~700px wide; cards with `columns: 12` would be ~1400px wide.

**For responsive behavior**: The `--column-min-width` still governs the column count calculation. On a 375px mobile viewport, the ResizeController computes `floor((375 + 32) / (320 + 32)) = 1` column, so you get 1 column regardless. The difference is the `max-width` allows it to grow on desktop.

**Step 3 (optional): Multi-section layout for desktop.**

For a 2-column desktop layout where content reflows to 1 column on mobile:
```yaml
tunet_responsive:
  ha-view-sections-column-max-width: "700px"
  ha-view-sections-column-min-width: "400px"
  ha-view-sections-column-gap: "24px"
```

```yaml
views:
  - title: Overview
    type: sections
    max_columns: 2
    theme: tunet_responsive
    sections:
      - type: grid
        title: "Main"
        cards:
          - ... # primary cards
      - type: grid
        title: "Secondary"
        cards:
          - ... # secondary cards
```

At 1440px: `floor((1440 + 24) / (400 + 24)) = 3`, clamped to `max_columns: 2` = 2 columns, each up to 700px.
At 375px: `floor((375 + 24) / (400 + 24)) = 0`, clamped to minimum 1 = 1 column, everything stacks.

---

## Concrete Fix for Current Dashboard

### Current state of `tunet-overview` G5 test view:
```json
{
  "title": "G5 Sections Test",
  "path": "g5-test",
  "type": "sections",
  "max_columns": 1,
  "sections": [{ "type": "grid", "column_span": 6, "cards": [...] }]
}
```

### Problem
- `max_columns: 1` caps the view to 1 section column
- Default `--column-max-width: 500px` means that column is 500px max
- `column_span: 6` is meaningless because `max_columns: 1` prevents it from spanning multiple columns

### Fix Option 1: Single wide section (simplest, preserves current card order)

1. Create theme override:
```yaml
tunet_wide:
  ha-view-sections-column-max-width: "1400px"
  ha-view-sections-column-min-width: "320px"
  ha-view-sections-column-gap: "24px"
  ha-section-grid-column-gap: "12px"
  ha-section-grid-row-gap: "8px"
```

2. Update view config:
```yaml
title: G5 Sections Test
path: g5-test
type: sections
max_columns: 1
theme: tunet_wide
sections:
  - type: grid
    cards: [...]  # all existing cards, no column_span needed
```

**Result**: Single column, up to 1400px wide on desktop. Cards with `columns: 12` span full width. Cards with `columns: 6` (climate, weather) sit side by side within the 12-column grid. Cards with `columns: 'full'` span edge to edge.

### Fix Option 2: Multi-section layout (allows independent section titles + drag-drop reorder between sections)

1. Create theme override:
```yaml
tunet_sections:
  ha-view-sections-column-max-width: "700px"
  ha-view-sections-column-min-width: "350px"
  ha-view-sections-column-gap: "24px"
```

2. Split cards into multiple sections:
```yaml
title: G5 Sections Test
path: g5-test
type: sections
max_columns: 2
theme: tunet_sections
sections:
  - type: grid
    title: "Controls"
    cards:
      - # actions card (columns: 12 = full width of this section)
      - # status card (columns: full)
      - # lighting card (columns: 12)
  - type: grid
    title: "Environment & Media"
    cards:
      - # climate card (columns: 6 = half section)
      - # weather card (columns: 6 = half section)
      - # sensor card (columns: 12)
      - # media card (columns: 12)
      - # speaker grid (columns: full)
      - # rooms card (columns: full)
```

**Result**: Two sections side-by-side on desktop (each ~700px), stacking to single column on mobile.

---

## Summary of Findings

| Question | Answer |
|----------|--------|
| Can `max_columns` be increased? | Yes. Default is 4. Set to any positive integer. |
| What does `max_columns` control? | Max number of section columns, not card columns. |
| Can layout-card help? | **No.** It does not support sections view type. |
| View `max_columns` vs card `columns`? | Independent layers. View controls section columns; card controls 12-grid span within section. |
| CSS approaches for full width? | Override `--ha-view-sections-column-max-width` via theme. Default 500px is the bottleneck. |
| Recommended approach? | Theme override + `max_columns` adjustment. Single wide section is simplest. |

---

## Sources

### HA Frontend Source Code (authoritative)
- `hui-sections-view.ts`: [GitHub dev branch](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-sections-view.ts)
- `hui-grid-section.ts`: [GitHub dev branch](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/sections/hui-grid-section.ts)
- `types.ts` (LovelaceGridOptions): [GitHub dev branch](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/types.ts)

### HA Official Documentation
- [Sections View](https://www.home-assistant.io/dashboards/sections/)
- [Custom Card Sections Support (Dev Blog)](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/)

### Community / HACS
- [Controlling columnwidth in sections view](https://community.home-assistant.io/t/controling-columnwidth-in-sections-view/905373)
- [Card-mod Super-charge your themes - #2401](https://community.home-assistant.io/t/card-mod-super-charge-your-themes/212176/2401)
- [WTH column-gap requires theme](https://community.home-assistant.io/t/wth-i-need-to-install-a-theme-to-change-the-ha-view-sections-column-gap/803464)
- [layout-card README](https://github.com/thomasloven/lovelace-layout-card)
- [card-mod theme variables reference (Gist)](https://gist.github.com/Mariusthvdb/6e43803973505483a4d418d4e20c0a8b)

### Prior Project Memory
- Observation #8191: G5 Sections Validation confirming view-level width is the problem
- Observation #8107: hui-grid-section.ts source examination
- Observation #8126: PR #22366 12-column grid history
- Observation #8102: LovelaceGridOptions interface reference
