# Tunet Lighting Card V2 Config

Updated: 2026-03-06

## Supported Options

| Key | Type | Default | Notes |
|---|---|---|---|
| `name` | string | `"Lighting"` | Header title. |
| `subtitle` | string | `""` | Static subtitle override. If omitted, card builds dynamic summary. |
| `entities` | string[] | `[]` | Light entity list. Groups can expand (see `expand_groups`). |
| `zones` | object[] | `[]` | Rich zone objects: `{ entity, name, icon }`. |
| `primary_entity` | string | `""` | Entity for info-tile tap (`hass-more-info`). |
| `adaptive_entity` | string | `""` | Legacy single adaptive entity fallback. |
| `adaptive_entities` | string[] | `[]` | Preferred multi-zone adaptive entities. |
| `show_adaptive_toggle` | boolean | `true` | Shows/hides adaptive toggle button. |
| `show_manual_reset` | boolean | `true` | Shows/hides reset-manual button when manual overrides exist. |
| `layout` | `"grid" \| "scroll"` | `"grid"` | Tile layout mode. |
| `columns` | number (2-8) | `3` | Base column count for grid layout. |
| `column_breakpoints` | object/array | `[]` | Responsive column rules by viewport width. |
| `rows` | `"auto"` or number | `"auto"` | Max visible rows in grid mode. |
| `scroll_rows` | number (1-3) | `2` | Rows in scroll mode. |
| `tile_size` | `"compact" \| "standard" \| "large"` | `"standard"` | Tile density preset. |
| `surface` | `"card" \| "section"` | `"card"` | Surface style. |
| `expand_groups` | boolean | `true` | Expand group entities into member lights. |
| `custom_css` | string | `""` | Injected into shadow DOM. |

## Breakpoint Syntax

Array form:

```yaml
column_breakpoints:
  - max_width: 600
    columns: 4
  - max_width: 1024
    columns: 6
  - columns: 8
```

Object form:

```yaml
column_breakpoints:
  "600": 4
  "1024": 6
  default: 8
```

## Multi-Adaptive Example

```yaml
type: custom:tunet-lighting-card
name: Lighting
layout: grid
columns: 8
column_breakpoints:
  - max_width: 600
    columns: 4
  - max_width: 1100
    columns: 6
  - columns: 8
show_adaptive_toggle: true
show_manual_reset: true
adaptive_entities:
  - switch.adaptive_lighting_living_room
  - switch.adaptive_lighting_kitchen
  - switch.adaptive_lighting_spot
zones:
  - entity: light.living_room_lights
    name: Living
    icon: lightbulb
  - entity: light.kitchen_island_lights
    name: Kitchen
    icon: kitchen
```

Behavior notes:
- If `adaptive_entities` is omitted, the card auto-matches `switch.adaptive_lighting_*` by intersection with current zone lights.
- Manual red dots and manual counts are scoped to lights represented by the card.
