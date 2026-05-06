# Tunet V3 Cards Reference

Every Tunet custom card: config contract, interaction behavior, editor architecture.  
Updated as cards are rehabilitated through the consistency-driver program (CD0-CD12).

---

## Interaction Model Contract

Unified interaction categories across all cards. Decided Apr 3, 2026.
This section is the target contract; per-card entries call out current divergences and planned alignment tranche.

### 1. Control Tiles (light_tile, lighting l-tiles)
- **Tap** = toggle on/off
- **Hold** (400ms + haptic) = enter drag mode
- **Drag** (after hold) = adjust brightness horizontally
- **Release** = commit value, exit drag mode

### 2. Speaker Tiles (speaker_grid, sonos speaker tiles)
- **Tap** = select as active speaker (controls which speaker transport/volume affects)
- **Hold** (400ms + haptic) = enter drag mode
- **Drag** (after hold) = adjust volume
- **Icon area tap/hold** = more-info popup
- **Group badge** (+/- icon, top-right) = toggle group membership
- **Visual**: blue outline = in active group

### 3. Room Tiles (rooms tile variant)
- **Tap** = toggle all room lights (on/off); `tap_action` override if configured
- **Hold** (400ms + haptic) = navigate to room page or popup (Browser Mod via `hold_action`)
- **No drag** — rooms are not sliders

### 4. Navigation Rows (rooms row variant)
- **Body tap** = navigate to room page
- **Orb tap** = toggle individual light (stopPropagation prevents navigation)
- **Power button** = toggle all room lights ("any-on-then-off")
- **No hold** — row has explicit controls, no ambiguity needed

### 5. Dedicated Controls (climate thumbs, volume slider thumbs)
- **Instant drag** — no hold gate. The thumb IS the drag handle.
- **Release** = commit value
- **No tap** on thumbs

### 6. Action Chips (actions, scenes)
- **Tap** = execute service / activate scene
- **No hold, no drag**

### 7. Information Tiles (status, sensor rows, weather)
- **Tap** = more-info dialog or configured tap_action
- **No hold** (unless aux_action configured), **no drag**

### Shared Pattern
Hold-to-drag is used ONLY on tiles where the user adjusts a continuous value (brightness, volume). Navigation and action surfaces never use it. This is consistent and learnable.

### Group Volume Decision (Locked, Revised Apr 6 2026)
Across `tunet-media-card`, `tunet-sonos-card`, and `tunet-speaker-grid-card`:
- volume adjusts the currently selected target
- selecting an individual speaker targets that speaker only
- selecting the grouped coordinator / current group leader targets the active group proportionally
- no synthetic extra group row is required if the coordinator row already serves as the grouped target
- group membership changes remain explicit badge/action controls, not side effects of volume drag

### Speaker Tile Unification Target (CD9 Contract)
Across `tunet-media-card`, `tunet-sonos-card`, and `tunet-speaker-grid-card`:
- tile body tap selects active speaker
- hold (400ms) then drag adjusts volume
- icon tap/hold opens more-info
- group badge tap toggles group membership

Current state: `tunet-sonos-card` and `tunet-speaker-grid-card` now align for visible tiles; `tunet-media-card` still keeps a semantics/accessibility tail because speaker targeting lives in dropdown rows rather than visible tiles.

---

## Editor Architecture Contract

The editor does NOT mirror the full runtime config 1:1. Each card uses a three-layer model:

### 1. Authoring Model (editor surface)
Small, opinionated, asks for high-level intent. The user should never need to understand internal config structures. Examples: `layout = grid | scroll`, `mode = alarm | summary`, `entities = [pick lights]`.

### 2. Synthesizer (setConfig normalization)
Converts editor choices into the full runtime config shape. Infers:
- Default arrays from entity selections
- Per-item flags from high-level mode choices
- Fallback entities from discovery
- Breakpoint maps from tile_size + layout
- Derived labels/icons from entity attributes
- Conditional controls from mode selection
- Hidden legacy compatibility keys

### 3. Runtime Model (what the card consumes)
Can stay richer and uglier than what the editor exposes. Legacy keys, derived arrays, internal state flags — all live here. The card's `_config` after `setConfig()` is the runtime model.

### Editor Mechanism Levels

| Level | Mechanism | Use When |
|-------|-----------|----------|
| 1 | `getConfigForm()` + simple selectors | All top-level flags (booleans, selects, entity pickers) |
| 2 | `object` + `fields` + `multiple: true` | Simple arrays where ALL item fields are representable (zones, speakers, scenes) |
| 3 | `choose` selector | Polymorphic/union types where one field switches sub-shapes (status tile types) |
| 4 | `getConfigElement()` custom editor | When built-in form + synthesis can't do the job; full merge-on-save control |
| 5 | Hybrid | getConfigForm for simple stuff, custom sub-elements for complex parts |

### Per-Card Documentation Rule

Each card entry below documents BOTH layers:
- **Authoring model**: what the editor exposes (the user's view)
- **Runtime model**: what the card ultimately consumes (the code's view)
- **Synthesis**: what setConfig infers from authoring choices

---

## Sections Grid Model Contract (Source-Validated)

This is the sizing model all `getGridOptions()` decisions must follow.

### Layer 1: View (sections column count)

- View columns are computed from available view width plus theme vars (`--ha-view-sections-column-min-width`, `--ha-view-sections-column-gap`) and then clamped to `1..max_columns`.
- In desktop layouts with HA sidebar visible, content columns are reduced by one (`max(1, columnCount - 1)`), so breakpoint behavior differs from raw viewport math.
- Implication: a view configured as `max_columns: 4` often behaves like 3 content columns when sidebar is open.

### Layer 2: Section (`column_span`)

- Section `column_span` is clamped to available content columns.
- If a section requests `column_span: 3` but only 2 content columns are available, effective span is 2.

### Layer 3: Card (`grid_options` / `getGridOptions()`)

- Section internal card grid is `12 * effective section column_span`.
- Numeric `columns` spans that internal grid:
  - `columns: 12` is full width only when effective section span is 1.
  - In wider sections it is fractional (`12/24`, `12/36`, `12/48`, etc.).
- `columns: 'full'` always spans the full section width.

### `getGridOptions()` Decision Rules

- `getGridOptions()` has no section-context input; it can only provide defaults.
- Tunet defaults should assume standard sections (`column_span: 1`) unless the card is intentionally full-section chrome.
- Use numeric columns for default ratios in standard sections (`6` half-width, `12` full in span-1 sections).
- Use `columns: 'full'` only for cards that must span full section width in every section context.
- Use `rows: 'auto'` for variable-content cards; use `min_rows` as a useful floor, not a guessed fixed height.
- Context-specific sizing belongs in dashboard YAML/UI `grid_options` overrides, not hidden card heuristics.

### Rows/Columns Translation Requirement (Locked for CD4+)

For cards with internal multi-item layouts, HA grid hints must correspond to actual rendered layout behavior:

- `getGridOptions()` and `getCardSize()` must derive from the same card config that determines visible rows/columns.
- Avoid generic static values that do not map to what the card actually renders.
- Lighting-family and rooms-family cards must document and maintain explicit mapping between:
  - internal item columns/rows (card content layout)
  - external HA `grid_options` hints (`columns`, `rows`, `min_rows`, etc.)
- When exact mapping cannot be guaranteed due missing section context, document the assumption (`column_span: 1`) and expected YAML override path.

---

## Whole-Home Usage Contract

This section is the composition contract for later whole-home dashboard work. It defines what each card is for before any surface assembly resumes.

| Card | Surface role | Whole-home default use | Phone-safe default | Not phone-default | Owning implementation tranche |
|------|--------------|------------------------|--------------------|-------------------|-------------------------------|
| `tunet-actions-card` | utility strip | small dispatch strip for global or contextual utility actions | short chip sets only | dense chip sets in narrow spans | CD5 |
| `tunet-scenes-card` | utility strip | scene/script/automation strip with wrap-first behavior | wrapped strip (`allow_wrap: true`) | forced horizontal strip in narrow spans unless explicitly chosen | CD5 |
| `tunet-light-tile` | detail | atomic single-light control tile inside room-detail compositions | compact/standard detail tile within a detail stack | standalone overview surface | CD6 |
| `tunet-lighting-card` | detail | canonical room-detail light-control surface | 2-column phone-safe lighting/detail layouts | dense stress fixtures with verbose names and no explicit short labels | CD6 |
| `tunet-rooms-card` | overview | room overview/navigation hub | `tiles` or `slim`, depending on density; `row` is card-level healthy, but final room-page composition remains a later surface decision | detailed room-light evaluation (use `tunet-lighting-card` instead) | CD7 |
| `tunet-climate-card` | information | climate companion/reference surface | single-card climate presentation | cramped paired-phone compositions treated as a climate-card default | CD8 |
| `tunet-weather-card` | information | weather companion/info surface | fixed daily/hourly variants | toggle-heavy auto-control variants as the default phone composition | CD8 |
| `tunet-sensor-card` | information | environment/status rows and glanceable metrics | concise labeled rows with controlled sensor counts | unlabeled or alias-ambiguous fixture contracts | CD8 |
| `tunet-status-card` | information | mode-aware status surface where summary/detail/row/info/alarm roles are distinct jobs | `home_summary` fixed `4x2` phone matrix, `room_row` row strip, `info_only` passive glance surface, and `alarms` alarm cluster as context-specific defaults; `custom` preserves authored flexibility | treating legacy `custom` grids as the universal phone default | CD11 |
| `tunet-media-card` | media control | primary transport/media state surface | compact/default labels preserve room identity; selected-target volume, dropdown behavior, and art resilience accepted | explicit long-name authoring polish only | CD9 |
| `tunet-sonos-card` | media control | alternate inline-speaker Sonos control surface | default/autodiscovered source + speaker path width-safe; visible tiles align with suite speaker-tile semantics | explicit long-name authoring polish only | CD9 |
| `tunet-speaker-grid-card` | media control | dedicated speaker-management grid | compact 2-column phone baseline with card-level mobile fallback for larger/dense configs | desktop-facing dense authoring without phone overrides | CD9 |
| `tunet-nav-card` | chrome | persistent navigation chrome | bottom dock | desktop rail as a layout reference while offset/sidebar strategy is unstable | CD10 |

Locked decisions:
- `tunet-rooms-card` is the room overview/navigation surface, not the canonical detailed room-light surface.
- `tunet-lighting-card` is the canonical detailed room-light surface.
- `tunet-light-tile` is an atomic detail tile, not an overview card.
- `tunet-nav-card` is chrome, not ordinary content composition.
- `tunet-status-card` CD11 now has six landed status roles: `home_summary`, `home_detail`, `room_row`, `info_only`, `alarms`, and `custom`. Historical `CD11a` language about later modes being pending is superseded as of 2026-05-05.

Classification note: composition misuse is not a card defect — use the table above before classifying a visual problem as card failure. Historical tranche language in per-card sections below is context only; check `visual_defect_ledger.md` for current open-issue status.

---

## 1. tunet-actions-card

**Version**: v2.4.4  
**Tier**: yaml-first  
**File**: `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`

### Purpose

Quick-action chip strip. Two modes:
- **default**: Custom action array — each chip calls an HA service, shows active state, can be conditionally hidden
- **mode_strip**: Zero-YAML OAL mode switcher — auto-generates chips from `DEFAULT_MODE_ACTIONS` with `__MODE_ENTITY__` template substitution for the configured `mode_entity`

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `variant` | string | `'default'` | `'default'`, `'mode_strip'` | Y | editor |
| `mode_entity` | string | `'input_select.oal_active_configuration'` | any `input_select` entity | Y | editor |
| `compact` | boolean | `true` | true/false | Y | editor |
| `actions` | array | `DEFAULT_ACTIONS` or `DEFAULT_MODE_ACTIONS` | action objects (see below) | Y | editor + yaml-compatible |

#### Per-action properties (structured editor + yaml-compatible runtime)

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `name` | string | `''` | Chip label text |
| `icon` | string | `'circle'` | Material Symbol name |
| `accent` | string | `'amber'` | amber, blue, green, purple, red, muted |
| `service` | string | `''` | HA service (e.g., `light.turn_on`, `script.turn_on`, `input_select.select_option`) |
| `entity_id` | string | `''` | Editor-backed service target helper; synthesized into `service_data.entity_id` when raw `service_data` does not already provide one |
| `option` | string | `''` | Editor-backed helper for `input_select.select_option`; synthesized into `service_data.option` when needed |
| `state_entity` | string | `''` | Entity to monitor for active state |
| `active_when` | string | `'on'` | State value that triggers active visual |
| `active_when_operator` | string | `'equals'` | `equals`, `contains`, `not_equals`, `gt`, `gte`, `lt`, `lte` |
| `show_when_entity` | string | `''` | Editor-backed conditional visibility source |
| `show_when_attribute` | string | `''` | Optional attribute for conditional visibility |
| `show_when_operator` | string | `'equals'` | Conditional operator for show/hide |
| `show_when_state` | string | `''` | Conditional comparison value |
| `service_data` | object | `{}` | YAML-compatible raw service payload. Preserved when supplied directly. |
| `show_when` | object\|null | `null` | YAML-compatible raw conditional visibility object. Structured editor fields synthesize this shape. |
| `tap_action` | object\|null | `null` | HA action override (navigate, more-info, etc.). YAML power-user path. |

### Editor

4 top-level fields: variant (select), mode_entity (entity picker, input_select filter), compact (boolean), and a structured `actions` object editor.

The card still remains `yaml-first` because raw `service_data`, raw `show_when`, and `tap_action` remain richer than the editor surface. The editor now covers the common structured authoring path while preserving existing YAML action objects.

### Stub Config

```yaml
variant: mode_strip
compact: true
```

Stub works without entity — mode_strip auto-populates actions with template substitution.

### Grid Options

```javascript
// compact default strip
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 }
// mode_strip or relaxed (compact:false)
{ columns: 12, min_columns: 9, rows: 'auto', min_rows: 2 }
```

Variant-aware sizing (CD5): compact default strips stay thin (min_rows:1, min_columns:6). Mode strips and relaxed strips (compact:false) request more space (min_rows:2, min_columns:9) because they wrap under phone-width pressure and fill each row on mobile. Compact default strips scroll horizontally.

### Interaction

- **Category**: Dedicated controls
- **Chip tap**: calls configured service
- **Active state**: chip highlights when `state_entity` matches `active_when` via `active_when_operator`; chips with `state_entity` get `aria-pressed="true|false"`; chips without persistent state remain ordinary buttons
- **Conditional visibility**: `show_when` hides chips entirely when condition is false (e.g., Reset chip hides when `active_zonal_overrides == 0`)
- **No drag, no hold**

### Unique Behavior

- `evaluateCondition()` (L137-158): 7 operators for both `show_when` and `active_when` — `equals`, `not_equals`, `contains`, `gt`, `gte`, `lt`, `lte`. Undocumented to users.
- `mode_strip` template substitution: `__MODE_ENTITY__` in `state_entity` and `service_data.entity_id` gets replaced with the configured `mode_entity` value.
- Mixed service dispatch: a single strip can call `light.turn_on`, `script.turn_on`, and `input_select.select_option`.

### Sections Safety

Generally safe: overflow visible, auto height, no forced internal row grid.
Section-span caveat: default numeric `columns` is a default, not a universal full-width guarantee across all section spans.

### Editor Architecture

**Authoring model** (what the editor exposes):
- `variant`: default vs mode_strip (select)
- `mode_entity`: which input_select controls OAL modes (entity picker)
- `compact`: chip density (boolean)
- `actions[]`: structured action editor for the common path (name, icon, accent, service, target entity/option, active state, show-when fields)

**Synthesizer** (what setConfig infers):
- If `variant = mode_strip` and no explicit `actions[]`: auto-generates `DEFAULT_MODE_ACTIONS` with `__MODE_ENTITY__` → `mode_entity` substitution
- If `variant = default` and no explicit `actions[]`: auto-generates `DEFAULT_ACTIONS`
- Per-action normalization: fills defaults for icon ('circle'), accent ('amber'), active_when ('on'), operator ('equals')

**Runtime model** (what the card consumes):
- Fully normalized `actions[]` array with structured editor fields synthesized into the richer runtime shape

**Editor level**: Level 1 + structured object editor. The mode_strip variant remains the zero-YAML authoring-model path; the structured `actions[]` editor now covers the common custom-strip path without replacing the richer YAML runtime model.

**Future consideration**: Level 2 (object+fields+multiple) for actions[] with a nested raw object selector for service_data. Would let power users build custom action strips without YAML. Not CD1 scope.

### Known Limitations

- Arbitrary raw `service_data`, raw `show_when`, and `tap_action` remain power-user YAML paths even though the common `actions[]` structure is now editable
- The 7-operator condition system (`evaluateCondition`) is powerful but still under-documented to users
- mode_strip is effectively an inference-driven authoring model — pick variant + entity, get a complete action strip
- Phone chip overflow resolved in CD5: mode_strip and relaxed strips wrap and fill each row on mobile; compact default strips scroll horizontally

---

## 2. tunet-scenes-card

**Version**: v0.1.2  
**Tier**: editor-complete  
**File**: `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`

### Purpose

Scene/script/automation activation strip. Domain-aware — automatically calls `scene.turn_on`, `script.turn_on`, or `automation.trigger` based on the entity's domain. Users don't configure the service.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `show_header` | boolean | `false` | true/false | Y | editor |
| `name` | string | `'Scenes'` | any | Y | editor |
| `compact` | boolean | `true` | true/false | Y | editor |
| `allow_wrap` | boolean | `true` | true/false | Y | editor |
| `scenes` | array | `DEFAULT_SCENES` | scene objects (see below) | Y | editor |

#### Per-scene properties (all in editor via object+fields+multiple)

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `entity` | string | `''` | **Required**. Scene, script, or automation entity ID |
| `name` | string | `''` | Chip label (falls back to entity friendly name) |
| `icon` | string | `''` | Material Symbol name |
| `accent` | string | `'amber'` | amber, blue, green, purple, red |
| `state_entity` | string | `''` | External entity for active state detection |
| `active_when` | string | `'on'` | State value that triggers active visual |
| `active_when_operator` | string | `'equals'` | equals, contains, not_equals |

### Editor

5 top-level fields + scenes array with per-item editor (object+fields+multiple, fixed in CD1.7). All 7 per-scene fields are in the schema — no unlisted fields at risk of stripping. Editor-complete.

### Stub Config

```yaml
show_header: false
name: Scenes
compact: true
allow_wrap: true
scenes:
  - entity: ''
    name: All On
    icon: lightbulb
    accent: amber
  # ... (DEFAULT_SCENES)
```

### Grid Options

```javascript
// wrap + no header
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: ceil(scenes/4) }
// wrap + header
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 1 + ceil(scenes/4) }
// strip (allow_wrap:false)
{ columns: 12, min_columns: 9, rows: 'auto', min_rows: 1 or 2 }
```

Allow_wrap/show_header-aware sizing (CD5): wrap mode uses min_columns:6 with row count from scene count; strip mode requests min_columns:9 for horizontal scroll room.

### Interaction

- **Category**: Dedicated controls
- **Chip tap**: domain-aware dispatch — scene.turn_on, script.turn_on, or automation.trigger
- **1300ms recent-entity tracking** (L543-544): tapped chip stays visually "active" for 1300ms even without `state_entity`. Provides instant visual feedback. Not configurable — built-in UX.
- **Decoupled active state**: `state_entity` can be any entity, independent of the scene entity
- **Unavailable**: chip gets `disabled` attribute + `.is-unavailable` class; disabled chips never dispatch even if triggered programmatically (early-return guard in _activate)
- **No drag, no hold**

### Sections Safety

**Resolved in CD4**: `allow_wrap: true` is now the Sections-safe default (stub config changed). Strip mode (`allow_wrap: false`) is retained as an opt-in YAML exception for users who explicitly want horizontal scroll. Height grows naturally with `rows: 'auto'` in wrap mode.

### Editor Architecture

**Authoring model**: show_header, name, compact, allow_wrap + scenes[] array with per-item fields.

**Synthesizer**: minimal — scenes are passed through with normalization (normalizeIcon, normalizeAccent, normalizeOperator). Domain-aware dispatch is automatic (scene → scene.turn_on, script → script.turn_on, automation → automation.trigger).

**Runtime model**: normalized scenes array. No additional synthesis needed — the authoring model IS close to the runtime model for this card.

**Editor level**: Level 2 (object+fields+multiple for scenes[]) — DONE (CD1.7). All 7 per-scene fields are in the schema. Reference pattern for other array editors.

### Known Limitations

- Strip mode (`allow_wrap: false`) is the opt-in narrow-width exception; wrap mode is the live default and the preferred whole-home/phone contract
- `active_when_operator` only supports 3 operators (equals, contains, not_equals) vs actions card's 7

---

## 3. tunet-light-tile

**Version**: v1.1.0  
**Tier**: editor-complete  
**File**: `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`

### Purpose

Standalone single-light control tile with drag-to-dim. The atomic unit of the lighting system. Two visual variants: vertical (tall, icon above name) and horizontal (wide, icon beside name). Used in room subviews for per-light control. This is an atomic detail tile, not a standalone overview surface.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `light.*` entity | Y | editor |
| `name` | string | entity friendly name | any | Y | editor |
| `icon` | string | `''` | Material Symbol name | Y | editor |
| `variant` | string | `'vertical'` | `'vertical'`, `'horizontal'` | Y | editor |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `show_manual` | boolean | `true` | true/false | N | yaml-only (hidden) |

### Editor

6 fields, all simple selectors. Editor-complete. `show_manual` is a hidden YAML-only key for OAL adaptive lighting integration — controls whether a "manual override" indicator appears when `entity.attributes.manual_override === true`. Not normalized in setConfig (read via spread).

### Stub Config

```yaml
entity: light.living_room
variant: vertical
tile_size: standard
use_profiles: true
```

Note: stub provides a real entity ID, not empty. Card renders unavailable if entity doesn't exist — correct HA behavior.

### Grid Options

```javascript
{ columns: 3, min_columns: 3, rows: 'auto', min_rows: 1, max_rows: 4 }
```

Dense-tile default for standard (`column_span: 1`) sections; intentionally not a full-width card.
In wider sections, relative tile width shrinks further unless dashboard-level overrides are applied.
Current HA grid hints remain dense-tile defaults and do not differentiate vertical vs horizontal at the grid-hint layer. Runtime phone readability is now handled in-card for narrow horizontal tiles; dashboard-level overrides still own context-specific placement.

### Interaction

- **Current runtime**:
  - tap toggles light on/off
  - horizontal drag adjusts brightness via `createAxisLockedDrag()` with deadzone `8` and axisBias `1.3`
  - long press (`500ms`) opens more-info
- **Drag visual**: `.sliding` class scales tile to 1.05x
- **Keyboard** (L809-838): Enter/Space toggle, Arrow ±5% (Shift ±10%)
- **Contract note**: current runtime still behaves as a dual-purpose tile. Do not read the suite-wide control-tile target as already fully normalized here.

### Profile System

Uses `selectProfileSize` + `resolveSizeProfile` + `_setProfileVars`. Controls tile geometry (padding, icon size, font size, progress bar height) based on `tile_size` and container width via ResizeObserver. This is retained current-runtime machinery; do not read old shared-pass notes as meaning the card has already been re-authored around a different sizing system.

### Lighting-Tile Family Contract

This card is governed by the formal lighting-tile family contract in the `tunet-lighting-card` section below.

Current lock:
1. `tunet-light-tile` and `tunet-lighting-card` are the same lighting-tile family.
2. When they drift visually without an explicit documented exception, treat that as contract failure.
3. Shared family geometry belongs in `Dashboard/Tunet/Cards/v3/tunet_base.js`; this atomic tile should consume it rather than invent a separate visual language.

### Accessibility

Has `role="button"`, `tabindex="0"`, and `aria-label` with brightness state. Current runtime still exposes arrow-key brightness adjustment without full slider semantics. Treat that as residual runtime semantics debt, not as a whole-home composition issue.

### Editor Architecture

**Type**: Level 1 — `getConfigForm()` with simple selectors. No arrays, no custom editor.

**Authoring model** (6 fields):
- `entity` (required, light domain) — which light
- `variant` (select: vertical/horizontal) — card shape
- `tile_size` (select: compact/standard/large) — density
- `name` (text) — override friendly_name; inferred if blank
- `icon` (icon) — override entity icon; inferred if blank
- `use_profiles` (boolean) — toggle profile geometry

**Synthesizer**: minimal — `tile_size` normalized to lowercase enum, `use_profiles` defaults true. Name/icon left to render-time resolution from entity attributes.

**Runtime model**: flat config + spread of all remaining keys. `show_manual` is a hidden runtime flag (OAL integration) preserved via spread, never in editor.

**Status**: Already correct. No CD1 editor changes needed.

### Sections Safety

Generally safe: overflow visible, profile-driven min-height, no forced internal row grid.
Section-span caveat: tile density depends on section span because numeric `columns` is relative to section internal grid.
Whole-home note: when this card feels visually "orphaned", that is usually a composition problem rather than a card-contract failure.

### Narrow Horizontal Runtime Behavior

- Host width `<=420px` with `variant: horizontal` sets the host `narrow-horizontal` attribute.
- In `narrow-horizontal` mode, `.name` switches from single-line truncation to a 2-line `-webkit-line-clamp`.
- In `narrow-horizontal` mode, the `.val` lane shrinks to `min-width: 3ch`.
- In `narrow-horizontal` mode, horizontal gap/padding tighten so the icon, value, and progress bar remain visible while reclaiming label room.

### Known Limitations

- No active card-level runtime defect is open in the current rehab fixtures
- This card should be judged inside room-detail/detail-stack compositions, not as an overview/navigation surface
- Broad long-name policy across media/status/rooms remains a later suite-level design problem, not a reopened CD6 card defect

---

## 4. tunet-lighting-card

**Version**: v3.5.0  
**Tier**: editor-lite
**File**: `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`

### Purpose

Multi-zone lighting control surface. The most-used card in the dashboard — appears on overview, room subviews, and popups. ~1900 lines, most complex card in the suite. Shows a grid or scrollable strip of light tiles with brightness bars, optional header with adaptive lighting controls. This is the canonical room-detail light-control surface; `tunet-rooms-card` is the overview/navigation companion, not a replacement for this card's detailed-control role.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `zones` | array | `[]` | `[{entity, name, icon}]` objects | Y | editor |
| `entities` | array | `[]` | string entity IDs | Y | editor |
| `name` | string | `'Lighting'` | any | Y | editor |
| `primary_entity` | string | `''` | any entity ID for header info-tile more-info | Y | editor |
| `adaptive_entity` | string | `''` | legacy single adaptive entity | N | legacy |
| `adaptive_entities` | array | `[]` | switch entity IDs | Y | editor |
| `show_adaptive_toggle` | boolean | `true` | true/false | Y | editor |
| `show_manual_reset` | boolean | `true` | true/false | Y | editor |
| `surface` | string | `'card'` | `'card'`, `'section'`, `'tile'` | Y | editor |
| `layout` | string | `'grid'` | `'grid'`, `'scroll'` | Y | editor |
| `columns` | number | `3` | 2-8 | Y | editor |
| `column_breakpoints` | array | synthesized from `tile_size` when omitted | `[{min_width?, max_width?, columns}]` | Y | editor |
| `scroll_rows` | number | `2` | 1-3 | Y | editor |
| `rows` | string\|null | `null` | `'auto'` or 1-6 | Y | editor |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `expand_groups` | boolean | `true` | true/false | Y | editor |
| `custom_css` | string | `''` | CSS text | Y (advanced) | editor |
| `subtitle` | string | `''` | any | N | yaml-only |
| `light_group` | string | — | single entity ID | N | legacy |
| `light_overrides` | object | — | `{entity: {name, icon}}` | N | legacy |

### Dual Entity Paths (complementary, not competing)

- **`entities[]`**: simple string array of entity IDs. Supports light GROUPS with `expand_groups: true`. Primary "what lights to show" input.
- **`zones[]`**: rich objects `{entity, name, icon}`. Per-entity display overrides. Individual lights.
- Both can coexist — entities for group picking, zones for display customization.

### Legacy Key Precedence

`zones[]` > `entities[]` > `light_overrides` (legacy) > `light_group` (legacy). Legacy keys are fallback-only — never used when zones or entities are present. See `legacy_key_precedence.md` for full rules.

### Editor

16 primary fields + expandable advanced section. `zones` and `column_breakpoints` now use explicit `object`+`fields`+`multiple` schemas (CD1.8) so the editor path matches runtime normalization.

### 6 Rendering Paths

3 surfaces × 2 layouts:
- card + grid, card + scroll
- section + grid, section + scroll
- tile + grid, tile + scroll

### Stub Config

```yaml
entities: []
name: Lighting
use_profiles: true
```

Empty entities renders config placeholder (fixed in CD1.2).

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Default assumes standard (`column_span: 1`) sections where numeric `12` behaves as full-width.
In wider sections, numeric `12` becomes fractional unless dashboard-level overrides are applied.
`min_rows` still needs config-aware tuning (`zones/entities`, `layout`, and header controls).

### Interaction

- **Current runtime**:
  - l-tile tap toggles individual light
  - l-tile horizontal drag adjusts brightness via `createAxisLockedDrag()` on the grid
  - header info tile supports tap/keyboard activation and opens more-info
- **Adaptive toggle**: tap toggles adaptive lighting switch
- **Manual reset**: tap calls `script.oal_reset_soft`
- **Keyboard** (L1391): Arrow ±5% (Shift ±10%), Enter/Space toggle on focused tile
- **Contract note**: room-detail lighting runtime still uses toggle-plus-drag tile behavior. Treat any interaction redesign question as CD6-owned, not as an open shared-pass ambiguity.

### Profile System

Uses `selectProfileSize` + `resolveSizeProfile` + `_setProfileVars`. ResizeObserver remains part of the current runtime. Treat older shared-pass migration wording as historical, not as active program state.

### Sections Safety

Grid-context caveat:
1. default numeric `columns` is section-span-relative and not universal full-width in wider sections.

Current runtime position:
1. default breakpoint synthesis is now phone-safe when `column_breakpoints` is omitted:
   - compact/standard → `{640: 2, default: 3}`
   - large → `{640: 1, default: 2}`
2. `normalizeColumnBreakpoints()` now clamps the minimum column count to `1` instead of `2`, so the synthesized `large` phone case remains valid.
3. grid tracks now use `repeat(var(--cols, 3), minmax(0, 1fr))`, replacing the old `180px` width cap.
4. grid layout no longer relies on `justify-content: center`, so the chosen column count consumes the available section width instead of leaving centered dead gutters.
5. scroll layout now includes inline inset plus matching scroll padding:
   - desktop/base: `padding-inline: 0.5em`, `scroll-padding-inline: 0.5em`
   - mobile: `padding-inline: 0.375em`, `scroll-padding-inline: 0.375em`
6. row-limit and layout-branch logic at L1259 remains part of the live sizing contract.
7. `CD6` follow-on closure: lighting-family parity is now accepted. Current implementation split is:
   - shared tile identity and size-tier semantics in `tunet_base.js`
   - container placement/column mechanics in `tunet-lighting-card`
   - scroll transport behavior tracked separately from the closed tile-geometry parity work

### Formal Lighting-Tile Family Contract

#### North Star

Perfect is not “scroll and grid both look acceptable.” Perfect is one lighting-tile family, and every context shows the same object with the same visual grammar. Scroll only changes locomotion. Section/card/grid only change placement. The tile itself should not feel like a different component.

#### Visual Design

1. The tile reads as a vertically balanced stack:
   - icon
   - name
   - value
   - brightness bar
2. Those four lanes should feel optically centered with deliberate breathing room between them. `%` crowded into the brightness bar lane is a contract failure.
3. The brightness bar should sit slightly in from the left and right tile edges. It follows the lighting-family progress inset, not the raw content padding.
4. Tile width is capped at an ideal readable width. Extra desktop space creates outer breathing room, not wider and wider tiles.
5. Tile height scales with width so the card keeps a stable proportion. Wide-and-flat tiles are not acceptable.
6. `compact`, `standard`, and `large` must be meaningfully different:
   - `compact` = denser, still readable
   - `standard` = baseline
   - `large` = clearly larger icon, label, value, spacing, and bar presence
7. `large` must never mean “same content inside a bigger empty box.”
8. `scroll`, `grid`, `section`, and atomic light-tile contexts share the same tile geometry language. If one variant looks right, the others converge to it.
9. Surface mode may change the outer shell, but it must not restyle the tile identity.
10. On/off state must stay legible at a glance:
   - `on` = stronger icon/value/bar emphasis
   - `off` = quieter but still readable
   - unavailable/manual states remain clear without breaking the family rhythm

#### UI / Interaction

1. A lighting tile is a control tile:
   - tap = toggle
   - hold-then-drag = brightness adjust
   - keyboard = same intent, accessible
2. Scroll behavior must never make tiles feel visually different. It changes transport, not tile identity.
3. Press feedback communicates the action in progress:
   - tap press = clear toggle feedback
   - hold/drag = stronger engaged state
4. Vertical page scroll wins unless the user clearly intends a brightness drag.
5. Long names must preserve the tile structure first and then truncate gracefully.

#### Implementation Contract

1. The lighting-tile family contract lives in `Dashboard/Tunet/Cards/v3/tunet_base.js`, not as silent drift across cards.
2. Base owns lighting-tile identity:
   - preset mapping `lighting -> lighting-tile`
   - size-tier semantics (`compact` / `standard` / `large`)
   - icon, label, value, progress-lane inset/bottom-offset, and vertical-rhythm tokens
3. `tunet-lighting-card` owns container behavior only:
   - scroll vs grid mechanics
   - column count
   - group expansion
   - explicit context-specific container exceptions
4. Any card-local visual exception must be explicit, documented, and temporary.

#### Acceptance Criteria

1. At desktop, grid tiles do not stretch endlessly; they sit in a centered composition with stable proportions.
2. The value lane has obvious air above the brightness bar.
3. `large` is visibly more legible than `standard` from across the room.
4. `section`, `scroll`, `grid`, and atomic light-tile captures look like the same product.
5. If the tile is cropped out of its container, the context should not be obvious from the tile alone.

Authoring note: dense stress fixtures should use explicit short config names (`Living`, `Dining`, etc.) instead of assuming raw friendly names will always fit in narrow 2-column phone layouts.
Runtime note: when `expand_groups: true` auto-discovers member lights without explicit `zones[].name` overrides, the card compacts derived display names by stripping redundant room context and trailing lighting nouns where possible. Explicit `zones[].name` always wins and remains the preferred authoring path for intentional dense layouts.

### Editor Architecture

**Type**: Level 1+2 hybrid — `getConfigForm()` with simple selectors for primary fields + `object`+`fields`+`multiple` for `zones[]` and `column_breakpoints[]`.

**Authoring model** (6 primary decisions):
| Field | Selector | What it synthesizes |
|-------|----------|---------------------|
| `entities` | entity (multiple, light) | → zones[], adaptive_entities[] (auto-discovered) |
| `layout` | select: grid / scroll | → columns, column_breakpoints, scroll_rows |
| `tile_size` | select: compact / standard / large | → columns, column_breakpoints |
| `surface` | select: card / section / tile | → CSS rendering mode |
| `show_adaptive_toggle` | boolean | direct |
| `show_manual_reset` | boolean | direct |

**Advanced overrides** (expandable):
| Field | Selector | Purpose |
|-------|----------|---------|
| `name` | text | Override auto-generated name |
| `zones` | object+fields+multiple | Override per-entity names/icons |
| `columns` | number 2-8 | Override synthesized column count |
| `expand_groups` | boolean | Override default true |
| `primary_entity` | entity | OAL status sensor override |
| `custom_css` | text multiline | CSS injection |

**Synthesizer** (setConfig):
- `zones[]` ← auto-generate from entities if zones not explicit
- `columns` ← derive from tile_size: compact→3, standard→3, large→2
- `column_breakpoints` ← derive from tile_size: compact/standard→[{max_width:640,columns:2},{columns:3}], large→[{max_width:640,columns:1},{columns:2}]
- `scroll_rows` ← 2 when layout=scroll
- `adaptive_entities[]` ← discover by scanning `switch.adaptive_lighting_*` whose `lights` attribute overlaps selected entities
- `primary_entity` ← default `sensor.oal_system_status`
- All defaults use **explicit > synthesized** precedence — existing YAML keeps working

**Hidden from editor** (runtime-only):
adaptive_entity (deprecated singular), light_group (legacy), light_overrides (legacy), subtitle

### Known Limitations

- Current editor exposes 16 primary fields instead of the 6-field authoring model — contract simplification remains desirable
- 6 rendering paths (3 surfaces × 2 layouts) need validation at all breakpoints
- `surface: tile` is now accepted by editor/runtime, but currently shares card styling until a dedicated tile-surface CSS contract is defined
- Use explicit short `name` values for intentionally dense fixtures when raw friendly names are verbose
- D2/D3 are visually confirmed fixed; D4 was confirmed present with no code change needed
- Legacy key precedence documented in `legacy_key_precedence.md`

---

## 5. tunet-rooms-card

**Version**: v3.1.0  
**Tier**: editor-lite
**File**: `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`

### Purpose

Room navigation and control hub. Three distinct layout variants (tiles, row, slim) with fundamentally different interaction models. Row mode shows individual light orbs per room. Tile mode uses tap/hold gesture split. Integrates with adaptive lighting for manual control detection. This is an overview/navigation surface, not the canonical detailed room-light control surface.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `name` | string | `'Rooms'` | any | Y | editor |
| `layout_variant` | string | `'tiles'` | `'tiles'`, `'row'`, `'slim'` | Y | editor |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `rooms` | array | **required** | room objects | Y | editor |

#### Per-room properties

| Key | Type | Default | Editor | Classification | Notes |
|-----|------|---------|:------:|----------------|-------|
| `name` | string | `'Room'` | Y | editor | Room display name |
| `icon` | string | `'home'` | Y | editor | Material Symbol |
| `navigate_path` | string | `''` | Y | editor | Dashboard path for tap navigation |
| `temperature_entity` | string | `''` | Y | editor | Sensor for temp display |
| `humidity_entity` | string | `''` | Y | editor | Sensor for humidity display |
| `light_entities` | array | `[]` | Y | editor | Multi-entity picker (light domain). Synthesized → `lights[]` by setConfig. |
| `lights` | array | `[]` | N | yaml-only | Rich per-light objects `[{entity, icon, name}]`. Wins over `light_entities`. |
| `tap_action` | object\|null | `null` | N | yaml-only | Override default tap behavior |
| `hold_action` | object\|null | `null` | N | yaml-only | Long-press action (tile mode: popup) |

#### Lights Precedence

1. Explicit `lights[]` (YAML, per-light icon/name overrides) → used as-is
2. `light_entities` (editor, flat entity list) → synthesized to `lights[]` with default icon/name
3. Neither → empty lights array (room shows no orbs/brightness)

### Three Layout Variants — Current Implementation UX

| Aspect | Tiles | Row | Slim |
|--------|-------|-----|------|
| Layout | Vertical cards in grid | Horizontal rows | Row with reduced control scale but readability-preserved desktop type |
| Primary tap | `tap_action` override if configured; otherwise toggle all room lights | Navigate to room | Navigate to room |
| Light orbs | None | Yes, one per light | Yes, scaled 70% |
| Power button | None | Yes, toggles all room lights | Yes |
| Hold (400ms) | Fire hold_action (popup) | N/A | N/A |
| Min height | 5.75em | 7.3125em | 5.12em |
| Progress bar | Yes (avg brightness) | Hidden | Hidden |

### Route/Control Contract (Locked Card Contract)

**Row mode**: body tap navigates, orb tap toggles individual light, power button toggles all. Pointer and keyboard events on row controls are isolated so nested buttons never trigger row navigation. Row/slim buttons expose desktop hover titles from the light or room label. Priority: `navigate_path` > `tap_action` > `hold_action`.

**Tile mode**: quick tap (<400ms) toggles all room lights (on/off). If `tap_action` is configured, it fires instead. Fallback chain: `tap_action` > room-light toggle > temperature more-info. Long press (≥400ms) fires `hold_action` with haptic scale feedback (0.9x for 120ms), falling back to `navigate_path` when no explicit hold action exists. This is the locked contract — tile tap = toggle, hold = navigate.

Whole-home evaluation rule: judge this card primarily on room overview/navigation behavior and compact room status/control density. Do not judge it as a substitute for `tunet-lighting-card` when evaluating room-detail light control.

### Room Toggle Logic

"Any-on-then-off": if ANY light is on → turn all off. If ALL off → turn all on. Mixed state → off.

### Adaptive Lighting Integration

- `_resolveAdaptiveEntitiesForRooms()`: auto-discovers `switch.adaptive_lighting_*` entities whose `lights` attribute overlaps with room lights
- `_getManualLights()`: reads `manual_control` attribute array from AL switches
- Visual: red shadow glow on manually-controlled orbs, "X manual" in status text
- Reset button calls `adaptive_lighting.set_manual_control` with `manual_control: false`
- **Dependency**: Adaptive Lighting HACS integration must be installed and configured with `manual_control` attribute exposed. If AL entities are unavailable, manual indicators and reset button are hidden automatically.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Default assumes standard (`column_span: 1`) sections where numeric `12` behaves as full-width.
In wider sections, numeric `12` is fractional unless dashboard-level overrides are applied.
`getCardSize()` is already mode-aware (row/slim vs tiles); `getGridOptions()` still needs matching context-aware floor tuning.

### Interaction

- **Contract (locked)**:
  - Tile variant: tap toggles room lights, hold navigates/popup, no drag
  - Row/slim variant: body tap navigate, orb tap light toggle, power tap room all-toggle, no hold
- **Implementation**:
  - Tile: short tap toggles room lights; `tap_action` override when configured; hold fires `hold_action` or `navigate_path`
  - Row/slim: navigate + explicit controls with pointer/keyboard isolation on row controls
- **CD7 changes**: tightened phone row density, equalized row lead-icon/orb/power sizing, added control-press-active isolation, lifted desktop row/slim typography for readability, row/slim status now shows plain percent without the `bri` suffix, row buttons expose hover titles from room/light labels, hardened common room-icon aliases like `sofa` / `couch` to valid glyphs, locked tile tap = toggle contract.

### Sections Safety

- Variable-content card with two structural modes (`tiles` grid vs `row/slim` flex-column) and fixed min-height contracts per mode.
- `getGridOptions()` currently static; row/slim and tiles have different real vertical density and should still be judged carefully when later surface/layout work chooses room-page composition.
- Section-span caveat: numeric default `columns` is relative to section width; room-page YAML overrides are expected for intentional multi-column section compositions.
- Phone density (CD7 closed card-level): runtime now tightens row/slim control sizing and spacing at phone width while keeping the lead icon, orb buttons, and power button in the same size family. Status copy uses plain percent when brightness is shown so phone rows do not burn width on the word `brightness`. This closeout applies to the card on the YAML rehab dashboard only; it does not decide final room-page/storage composition.
- Phone-default recommendation: prefer `tiles` or `slim` for lighter phone overview layouts; keep `row` for cases where per-light orb control is worth the denser presentation.

### Editor Architecture

**Type**: Level 2 — `getConfigForm()` with `object`+`fields`+`multiple` for rooms[].

**Authoring model** (3 primary + per-room):
| Field | Selector | Purpose |
|-------|----------|---------|
| `layout_variant` | select: tiles / row | Interaction model (slim = row + compact tile_size) |
| `tile_size` | select: compact / standard / large | Density |
| `rooms` | object+fields+multiple | Room list (see per-room fields below) |

**Per-room fields** (in object selector):
| Field | Selector | Synthesized if blank |
|-------|----------|---------------------|
| `name` | text (required) | — must be provided |
| `icon` | icon | defaults to 'home' |
| `navigate_path` | text (URL input) | could synthesize from name convention |
| `temperature_entity` | entity (sensor) | leave empty |
| `humidity_entity` | entity (sensor) | leave empty |
| `light_entities` | entity (multiple, light domain) | → synthesized to lights[] by setConfig |

**Hidden per-room** (YAML-only, runtime model):
- `lights[]`: rich per-light objects {entity, icon, name}. YAML-only but WINS over `light_entities` when both present. Power users who need custom per-light icons/names use this path.
- `hold_action`: popup config — could synthesize default Browser Mod popup keyed to room name
- `tap_action`: override default navigation — rarely needed

**Synthesizer**:
- `navigate_path`: if blank, could default to `/tunet-suite-storage/${slugify(name)}`
- `hold_action`: if blank, could default to Browser Mod popup `{popup_card_id: '${slugify(name)}-popup'}`
- `icon`: if blank, default 'home'
- `use_profiles`: default true

**Future**: `getConfigElement()` custom editor with nested lights[] sub-list per room. OR: flat `entities` multi-selector with area-based room inference.

### Known Limitations

- Nested `lights[]` is the core content but can't be in the object selector — YAML-only for CD1
- Route/control contract relies on `stopPropagation()` — fragile
- Slim is CSS-only scale of row — not a separate code path

---

## 6. tunet-climate-card

**Version**: v1.2.0  
**Tier**: editor-lite  
**File**: `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`

### Purpose

Climate control with dual-thumb heat/cool slider. The **gold standard** for single-card visual and interaction baseline work. Glass surface, smart color state machine, container-native responsiveness via ResizeObserver (no profile system). This does not imply every paired or cramped phone composition is climate-card-optimal.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `climate.*` entity | Y | editor |
| `name` | string | `'Climate'` | any | Y | editor |
| `variant` | string | `'standard'` | `'standard'`, `'thin'` | Y | editor |
| `surface` | string | `'card'` | `'card'`, `'section'` | Y | editor |
| `humidity_entity` | string | `''` | sensor with device_class: humidity | Y | editor |
| `display_min` | number\|null | auto-calculated | 0-120 | Y | editor |
| `display_max` | number\|null | auto-calculated | 0-120 | Y | editor |

### Dual-Thumb Slider

- **Thumb selection**: determined at drag start by event target ('heat' or 'cool')
- **Dead zone**: 4px movement before committing to drag (prevents accidental moves from taps)
- **Constraint**: heat cannot exceed cool - 2°F, cool cannot go below heat + 2°F (minimum 2° deadband)
- **Service calls**: debounced 300ms. `climate.set_temperature` with `target_temp_low`/`target_temp_high` (heat_cool) or `temperature` (single setpoint)
- **Drag visual**: transition disabled during drag, thumb scales to 1.08x, lifted shadow
- **Mode-driven visibility**: heat-only mode hides cool thumb + fill via CSS (no JS branching)

### Variant 'thin' vs 'standard'

CSS-only difference — same DOM, same render path. Thin hides the `.temps` display and moves temperatures into the subtitle text: `"72° in · H 68° · C 78°"`. Slider height reduces from 44px to 36px.

### display_min / display_max

**Cosmetic only** — define the visible slider range, not setpoint limits. User can still drag beyond display range up to entity's actual min/max. Lets dashboard creators zoom into the normal temperature range. Auto-calculated: `max(minTemp, heat - 10)` to `min(maxTemp, cool + 10)`.

### Gold Standard Qualities

1. **Glass surface**: backdrop-filter blur + gradient stroke pseudo-element simulating light reflection
2. **State cascade**: single `data-action` attribute drives border, header, mode button, and fan button colors (heating=amber, cooling=blue)
3. **Smart UI pruning**: fan button hidden if entity has no fan_modes; eco option hidden if no eco preset; unsupported HVAC modes hidden
4. **Mode normalization**: 'auto' mapped to 'heat_cool' internally, mapped back for service calls
5. **Container-native**: ResizeObserver on slider element (not viewport), recalculates all positions on resize
6. **Full ARIA**: thumbs have `role="slider"`, `aria-valuenow/min/max/valuetext`, `tabindex="0"`
7. **Three-tier motion**: fast (0.12s), ui (0.18s), surface (0.28s) with Apple Material curves
8. **Mid-mark suppression**: middle scale mark fades when current temp is within 3° (prevents visual clutter)

### Grid Options

```javascript
{ columns: 6, min_columns: 3, rows: 'auto', min_rows: 3 }
```

Static. Wants half-section width (6 of 12). Appropriate for companion placement.

### Interaction

- **Category**: Dedicated controls + information tile
- Header info tile supports tap/keyboard activation and opens more-info for the climate entity.
- Slider thumbs are immediate drag handles (no hold gate), with preserved keyboard slider behavior.
- No card-body hold gesture and no card-body drag gesture.

### Sections Safety

- Uses `rows: 'auto'` with `min_rows: 3`, which fits variable subtitle/humidity metadata without forcing fixed-height clipping.
- Container-native ResizeObserver behavior keeps geometry tied to card/container width rather than viewport assumptions.
- No forced `grid-auto-rows` contract inside card content; primary risk is semantic (header click-only) rather than layout clipping.

### Editor Architecture

**Type**: Level 1 — `getConfigForm()` with simple selectors. No arrays.

**Authoring model** (3 primary + 4 advanced):
Primary: `entity` (climate, required), `variant` (standard/thin), `name`
Advanced: `surface`, `humidity_entity`, `display_min`, `display_max`

**Synthesizer**: minimal. `display_min`/`display_max` auto-calculated from entity's min/max temp ± 10° if not explicitly set. Variant drives CSS class, not separate render path.

**Runtime model**: flat config. No synthesis gap — authoring model ≈ runtime model.

**Status**: Already correct. No CD1 editor changes needed. Gold-standard single-card reference, not a blanket surface-composition guarantee.

### Known Limitations

- No profile system — ResizeObserver provides container-native responsiveness instead
- `display_min`/`display_max` are cosmetic; users might expect them to limit setpoints
- Crowded phone pairings are usually a surface/composition issue, not a climate-card redesign signal

---

## 7. tunet-weather-card

**Version**: v1.6.3  
**Tier**: editor-complete  
**File**: `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`

### Purpose

Weather forecast card with auto-mode switching between daily/hourly and temperature/precipitation. WebSocket subscription for live forecast data with triple-fallback chain.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `weather.*` entity | Y | editor |
| `name` | string | `'Weather'` | any | Y | editor |
| `forecast_days` | number | `5` | 1-7 | Y | editor |
| `forecast_hours` | number | `8` | 4-24 | Y | editor |
| `forecast_view` | string | `'auto'` | `'auto'`, `'daily'`, `'hourly'` | Y | editor |
| `forecast_metric` | string | `'auto'` | `'auto'`, `'temperature'`, `'precipitation'` | Y | editor |
| `show_view_toggle` | boolean | `true` | true/false | Y | editor |
| `show_metric_toggle` | boolean | `true` | true/false | Y | editor |
| `auto_precip_threshold` | number | `45` | 0-100 | Y | editor |
| `show_pressure` | boolean | `false` | true/false | Y | editor |
| `show_last_updated` | boolean | `true` | true/false | Y | editor |

### Auto-Mode Switching

When `forecast_view: 'auto'` and/or `forecast_metric: 'auto'`:
- Card detects precipitation likelihood from current condition + hourly forecast data
- If precip likely (condition is rainy/snowy/hail OR maxPrecip ≥ threshold): switches to hourly view + precipitation metric
- If both view and metric are `auto`, precip is not likely, and the hourly forecast exposes UV data: prefers hourly view + temperature metric so the default auto card can surface the UV cue
- **Pin state**: user clicking Daily/Hourly or Temp/Precip toggle sets `_viewPinned`/`_metricPinned = true`, locking against auto-override. Pins are runtime-only — reset on page reload.

### WebSocket Subscription Chain

1. **Primary**: `weather/subscribe_forecast` WebSocket message — live push updates
2. **Fallback 1**: `weather.get_forecasts` service call (one-shot)
3. **Fallback 2**: `entity.attributes.forecast` (legacy integrations, daily only)
Failures silently caught; falls through to next method.

### Grid Options

```javascript
{ columns: 6, min_columns: 3, rows: 'auto', min_rows: 3 }
```

Static. Same as climate — wants half-section width. Should be config-aware: daily with 7 items needs more width than 3 items. Toggle-heavy variants are the primary phone-density risk; fixed daily/hourly variants are healthier phone defaults.

### Interaction

- **Category**: Information tile + header flip-chips
- Header info tile supports tap/keyboard activation and opens more-info for the weather entity.
- Daily/Hourly and Temp/Precip flip-chips are explicit native controls.
- Forecast tiles may look interactive depending on state styling; semantic cleanup is tracked for CD3.

### Sections Safety

- `rows: 'auto'` is appropriate for variable forecast counts and toggles.
- Static `min_rows: 3` is a baseline; dense daily forecasts can need wider section placement to avoid crowding.
- No forced fixed row-height grid in card internals; main risk is content density at narrow widths.
- Whole-home phone contract: fixed daily/hourly variants are safer defaults than toggle-heavy auto-control presentations.

### Editor Architecture

**Type**: Level 1 — `getConfigForm()` with simple selectors. No arrays.

**Authoring model**: All 10 fields are the authoring model. No synthesis needed — weather config is flat, well-scoped, and already complete. `forecast_view: 'auto'` and `forecast_metric: 'auto'` ARE the inference — the card auto-switches at runtime based on precipitation data.

**Synthesizer**: runtime-only (not setConfig). `_applyAutoModes()` switches view/metric based on live weather data. User can pin via toggle buttons (runtime state, not config).

**Runtime model**: flat config + runtime pin state (`_viewPinned`, `_metricPinned`).

**Status**: Already correct. Editor-complete. No CD1 changes needed. Reference for "all fields editable" pattern.

### Known Limitations

- Forecast tiles with `cursor: pointer` but no button semantics — fake-interactive (CD3)
- All 10 config fields already in editor — genuinely editor-complete
- No arrays in config — no editor upgrade needed
- Flip-chip/header weather variants are the intended phone-default presentation; broad old segmented-control wording is stale

### CD8 Accepted Contract (Phone Density)

Current accepted phone contract:
- current conditions render as one condensed summary lane beside the large temperature
- weather view/metric controls are compact flip-chips in the header
- pressure is off by default
- hourly + temperature forecast tiles may show a compact UV badge in the top-right when forecast data provides UV, including the dry `auto/auto` path when hourly UV is available

**Target layout (phone)**:
```
┌──────────────────────────────────────┐
│ ☀️ Header             [Hourly] [Temp]│  ← flip-chips in header row
│                                      │
│  42°  Sunny    💨4mph 💧30% ☀️6     │  ← one line: big temp + details
│                                      │
│ ┌─────┬─────┬─────┬─────┬─────┬────┐│
│ │ NOW │ MON │ TUE │ WED │ THU │ FRI││  ← forecast tiles get max space
│ │ ☀️  │ ⛅  │ ⛅  │ ⛅  │ 🌧  │ ☁️ ││
│ │ 57° │ 59° │ 60° │ 60° │ 59° │ 43°││
│ │ 40° │ 27° │ 28° │ 34° │ 33° │ 38°││
│ └─────┴─────┴─────┴─────┴─────┴────┘│
└──────────────────────────────────────┘
```

**Accepted changes**:

1. **Details row**: Wind, Humidity, UV, ~~Pressure~~ become icon-only values in a single horizontal row beside the large temperature. No labels on phone — icons are self-explanatory. Pressure dropped from all views (user never references it).

2. **Toggle chips**: Replace the two full-width segmented button rows with small inline flip-chips in the header area. Each chip shows the **alternate** state label — what you'll switch TO (e.g. "Hourly" when currently viewing daily). Tapping flips the view and updates the chip label. Same for Temp/Precip. One chip per toggle, not a two-button pair.

3. **Hourly temperature cue**: In hourly + temperature mode, forecast tiles may render a compact UV badge in the top-right when the source forecast data provides UV. Dry `forecast_view: auto` + `forecast_metric: auto` may also prefer the hourly temperature presentation when UV is available so the default auto card can surface that cue. This is supplemental and should never displace the core hourly temp hierarchy.

4. **Vertical savings**: ~120px recovered (4 detail rows → 0 extra rows; 2 toggle rows → 0 extra rows). Forecast tiles move above the fold on all phone layouts.

**Desktop**: detail labels can remain visible (space permits). Chips stay compact. Hourly UV badges remain optional supplemental cues, not a second primary metric lane.

**Config changes**: `show_pressure` defaults to `false`. Existing `show_view_toggle` / `show_metric_toggle` continue to control chip visibility.

---

## 8. tunet-sensor-card

**Version**: v3.1.0  
**Tier**: editor-complete  
**File**: `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`

### Purpose

Environment sensor display with SVG sparkline charts, trend arrows, threshold-driven color coding, and support for non-sensor entities via `value_attribute`.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `title` | string | `'Environment'` | any | Y | editor |
| `icon` | string | `'sensors'` | Material Symbol | Y | editor |
| `icon_color` | string | `'blue'` | accent name | N | yaml-only |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `show_sparkline` | boolean | `true` | true/false | Y | editor |
| `show_trend` | boolean | `true` | true/false | Y | editor |
| `history_hours` | number | `6` | any positive | N | yaml-only |
| `sensors` | array | **required** | sensor objects `[{entity, label, icon, accent, unit, precision}]` | Y | editor (object+fields+multiple) |

#### Per-sensor properties

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| `entity` | string | **required** | Any entity ID |
| `label` | string | `''` | Display name. This is the supported display-name override key; `name` is not a documented runtime alias in the current contract. |
| `icon` | string | `''` | Material Symbol |
| `accent` | string | `''` | Color accent |
| `unit` | string | `''` | Display unit |
| `precision` | number | `0` | Decimal places |
| `value_attribute` | string | `''` | Read attribute instead of state (e.g., weather.home → temperature) |
| `thresholds` | array | `[]` | `[{value, condition, style}]` — color rules |
| `show_range` | boolean | `false` | Show min/max range |

### Sparkline Rendering

SVG path generation from historical data:
- Fetches via HA REST API: `history/period/{start}?filter_entity_id=...`
- Runs on connect + every 5 minutes, cached with 2-minute freshness
- Renders as `<svg viewBox="0 0 48 24"><path class="spark-line" />` 
- Respects `value_attribute` for attribute-based history

### Threshold System

Evaluates per sensor on every state update:
- Numeric conditions: `gte`, `gt`, `lte`, `lt`, `eq`, `neq`
- Returns style name: `warning` (amber), `error` (red), `success` (green)
- Applied to icon background, value text color, and sparkline stroke

### Trend Indicator

Computes slope from last 3 history points:
- Rising (delta > 0.5): upward arrow, red
- Falling (delta < -0.5): downward arrow, blue
- Stable: horizontal arrow, muted
Updates every history fetch (~5 min), not real-time.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Static. Should compute `min_rows` from `sensors.length + 1` (header).

### Interaction

- **Category**: Information rows
- Row interaction is per-item configurable: `more_info`, `navigate`, or `none`.
- Interactive rows are keyboard-reachable (`role="button"`, `tabindex="0"`); `interaction: none` rows are non-interactive.
- No hold and no drag interaction in this card.

### Sections Safety

- `rows: 'auto'` aligns with variable row count and optional sparkline/trend density.
- Static `min_rows/max_rows` are guardrails only; real height should be derived by content and row count.
- No fixed clipping grid; row readability under high sensor counts is the main validation concern.

### Editor Architecture

**Type**: Level 2 — `getConfigForm()` with `object`+`fields`+`multiple` for sensors[].

**Authoring model** (6 top-level + sensors array):
Primary: `title`, `show_sparkline`, `show_trend`, `tile_size`
sensors[] per-item: `entity` (required), `label`, `icon`, `accent`, `unit`, `precision`

**Synthesizer**:
- `icon_color`: default 'blue' — add to editor or leave YAML-only
- `history_hours`: default 6 — add to editor as number field
- `value_attribute`: per-sensor YAML-only — lets non-sensor entities work (weather.home → temperature attribute)
- `thresholds[]`: per-sensor nested array — can't go in object selector. YAML-only.
- `show_range`: per-sensor boolean — could go in object selector fields

**Runtime model**: normalized sensors array with all per-sensor fields + history caching + sparkline SVG paths.

**Key design**: The object+fields+multiple for sensors covers the 80% case (pick entities, set labels). Thresholds are the 20% power-user path that stays YAML.
Fixture/contract note: use `label` consistently for display-name overrides unless the runtime is explicitly expanded to support `name`.

### Known Limitations

- `thresholds[]` is a nested array within sensor items — YAML-only (no nested arrays in object selector)
- `icon_color` and `history_hours` are yaml-only — should be added to editor as simple fields
- `data-interaction="none"` guard correctly disables hover/active on non-interactive rows
- Raw entity-ID rendering is not an active coherent-build defect; the remaining doc debt is naming-contract clarity around `label` vs any fixture-level aliasing

---

## 9. tunet-status-card

**Version**: v3.4.0
**Tier**: editor-lite (Level 2 narrow)
**File**: `Dashboard/Tunet/Cards/v3/tunet_status_card.js`

### Purpose

Mode-aware status surface. `CD11` now separates the compact phone-summary job from the richer detail, strip, and passive info jobs:

- `home_summary`: curated fixed `4x2` summary matrix with compact labels, compact aux affordances, and collapse/reflow behavior
- `home_detail`: richer authored detail surface with full labels/secondary values and authored breakpoint control
- `room_row`: compact horizontal strip with value/indicator-only filtering and collapse/reflow behavior
- `info_only`: calmer informational grid with value/indicator-only filtering and passive-by-default interaction
- `alarms`: alarm/timer-focused density with dropdown rejection and collapsed hidden-tile behavior
- `custom`: backward-compatible authored grid; omitted `layout_variant` still lands here

Important:
- `layout_variant` changes presentation and interaction rules only
- tile/entity choice remains per-instance YAML authoring, so different status surfaces can carry different content on the same shared runtime

### Config Properties (top-level)

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `name` | string | `'Home Status'` | any | Y | editor |
| `show_header` | boolean | `true` | true/false | Y | editor |
| `columns` | number | `4` | 2-8 | Y | editor |
| `column_breakpoints` | array | `[]` | responsive rules | N | yaml-only |
| `layout_variant` | string | runtime default `'custom'`; UI stub default `'home_summary'` | `'home_summary'`, `'home_detail'`, `'room_row'`, `'info_only'`, `'alarms'`, `'custom'` | Y | editor |
| `recipe_tiles` | array | `[]` | recipe authoring objects | Y | editor (object+fields+multiple) |
| `recipes` | array/string | `[]` | legacy alias for recipe names/objects | N | yaml-only alias |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `custom_css` | string | `''` | CSS text | Y (advanced) | editor |
| `tiles` | array | `[]` | tile objects | N | yaml-only |

### Tile-Level CD11 Keys

- `compact_label`: short mode-safe label used by `home_summary`, `room_row`, and `info_only`
- `recipe`: optional semantic recipe name
- `action_entity`: default more-info target when display entity != control entity
- `navigate_path`: default navigation shortcut; wins over recipe defaults

### CD11 Authoring Model

Status now uses a three-tier model:

1. **Authoring**: UI/editor users choose `layout_variant` and add `recipe_tiles[]`.
2. **Synthesizer**: `setConfig()` expands `recipe_tiles[]` or `recipes[]` into the rich runtime tile objects.
3. **Runtime**: rendering still consumes normalized `tiles[]` with type, entity, icon, accent, format, dot rules, aux action, visibility, and primary action already resolved.

`recipe_tiles[]` is canonical. The `recipes` key remains as a YAML shorthand alias and may be an array of recipe names or recipe objects. If both `recipe_tiles` and `recipes` are present, `recipe_tiles` wins and the card logs a warning. If either recipe authoring key is present alongside raw `tiles[]`, recipe authoring wins and raw `tiles[]` is ignored for runtime synthesis.

Editor-exposed recipe tile fields:

| Field | Purpose |
|-------|---------|
| `recipe` | Canonical semantic recipe name |
| `entity` | Required external entity binding for user-bound recipes |
| `label` | Optional full-label override |
| `compact_label` | Optional compact-label override |
| `action_entity` | Optional more-info/control target |
| `navigate_path` | Optional navigation shortcut |

Raw `tiles[]` remains YAML-only for advanced/custom cases because it is polymorphic across five tile types. `custom` stubs still demonstrate raw `tiles[]`; the editor path intentionally stays at the variant + recipe layer.

### Five Tile Types

**Value** (default): Icon + large value + optional secondary + optional unit + label. Supports `attribute` for reading entity attributes, `format` for display (state/integer/time), `dot_rules` for status dots, `secondary` for sub-value display. `dot_rules` use exact case-insensitive state matching plus `'*'` wildcard fallback.

Status-tile icons use raw Material Symbols glyph names. `normalizeStatusIcon()` only strips an optional `mdi:` prefix and applies a very small alias map; it does not translate arbitrary HA/MDI weather icon names into valid glyphs. If an unknown glyph name is authored, the text name will render.

**Indicator**: Icon + value + label + status dot. Simpler than value — no secondary, no unit.

**Timer**: Icon + live HH:MM:SS countdown + label. Updates every 1 second via `setInterval`. Reads `entity.attributes.remaining`, calculates elapsed since `last_updated`.

**Alarm**: Three visual states — off (muted), set (blue pill with time), ringing (blue background + shaking icon animation + snooze/dismiss buttons). `playing_entity` controls ringing state, `snooze_action` and `dismiss_action` fire configured actions.

**Dropdown**: Icon + current value + chevron + label. Opens a custom glassmorphic overlay menu with flip/cap-height heuristics. Options read from entity's `options` attribute (input_select). Current phone runtime still needs more conservative wording than "smart positioning" implies.

### CD11 Recipes

Implemented recipes:

- `home_presence`
- `lights_on`
- `manual_overrides`
- `mode_selector`
- `boost_offset` (composite — see notes below)
- `inside_temperature`
- `outside_temperature`
- `outside_weather`
- `inside_humidity`
- `next_sun_event`
- `next_alarm`
- `enabled_alarms`
- `mode_ttl`
- `now_playing`

Canonical recipe defaults (v3.6.0 — CD11 Polish X1 — recipe consolidation + signed_percent, 2026-05-05):

| Recipe | Target variant(s) | Default type | Encoded defaults | Entity binding |
|--------|-------------------|--------------|------------------|----------------|
| `home_presence` | `home_summary`, optional detail/info surfaces | `value` | `icon: home`, `label: Presence`, `compact_label: Presence` (downgraded to `Status` in `room_row` so the label fits a 151px tile), `accent: green`, `format: state` (humanizes `home`/`not_home` to `Home`/`Away`), `dot_rules: home -> green, * -> red`, default action opens entity more-info | User supplies `entity` |
| `lights_on` | `home_summary`, `home_detail`, `room_row` | `value` | `entity: sensor.oal_system_status`, `icon: lightbulb`, `label: Lights On`, `compact_label: Lights`, `accent: amber`, `attribute: lights_on_formatted` ("15/16"), `format: state`, `dot_rules: on -> amber, * -> muted`, default action opens entity more-info | Fixed source |
| `manual_overrides` | `home_summary`, `home_detail`, optional row/info surfaces | `value` | `icon: front_hand`, `label/compact_label: Manual`, `accent: red`, `attribute: active_zonal_overrides`, `format: integer`, `show_when.active_zonal_overrides > 0`, reset `aux_action` to `script.oal_reset_soft`, default action opens entity more-info | User supplies `entity`; `show_when.entity` is filled from it |
| `mode_selector` | `home_summary`, `home_detail`, `custom` | `dropdown` | `entity: input_select.oal_active_configuration`, `icon: tune`, `label/compact_label: Mode`, `accent: muted`, summary option aliases, dropdown default action | Fixed source |
| `boost_offset` (composite) | `home_summary`, `home_detail`, `room_row`, `info_only` | `value` | `entity: sensor.oal_system_status`, `icon: bolt`, **`label: Boost` (default; replaced at render time with the dominant cause)**, `compact_label: Boost`, `accent: amber`, `attribute: total_modification`, `format: signed_percent`, default action opens entity more-info | Fixed source |
| `inside_temperature` | `home_summary`, `home_detail`, `room_row`, `info_only` | `value` | `icon: thermostat`, `label/compact_label: Inside`, `accent: amber`, `format: integer`, default action prefers `action_entity` | User supplies `entity`; optional `action_entity` binds control target |
| `outside_temperature` | `home_summary`, `home_detail`, `room_row`, `info_only` | `value` | `entity: weather.home`, `icon: thermostat`, `label/compact_label: Outside`, `accent: blue`, `attribute: temperature`, `format: integer`, `unit: °F`, default action opens entity more-info | Fixed source |
| `outside_weather` | `home_summary`, `home_detail`, optional info surface | `value` | `entity: weather.home`, `icon: cloud`, `label/compact_label: Weather`, `accent: blue`, `format: state` (humanized: "snowy" → "Snowy", "partlycloudy" → "Partly Cloudy"), default action opens entity more-info | Fixed source |
| `inside_humidity` | `home_summary`, `home_detail`, `room_row`, `info_only` | `value` | `icon: water_drop`, `label/compact_label: Humidity`, `accent: blue`, `format: integer`, `unit: %`, default action opens entity more-info except passive variants | User supplies `entity` |
| `next_sun_event` | `home_summary`, `home_detail`, `info_only` | `value` | `entity: sensor.sun_next_setting`, `alt_entity: sensor.sun_next_rising`, `sun_entity: sun.sun`, `icon: weather_sunset_down`, `label/compact_label: Sunset`, `accent: amber`, `format: time`, passive default action | Fixed source |
| `next_alarm` | `alarms`, `home_detail` | `value`; promoted to `alarm` in `alarms` unless `type` is authored | `icon: alarm`, `label/compact_label: Alarm`, `accent: blue`, `format: time_short`, default action prefers `action_entity` then entity more-info | User supplies `entity` |
| `enabled_alarms` | `alarms`, optional `home_detail` | `value` | `icon: alarm_on`, `label/compact_label: Enabled`, `accent: blue`, `format: integer`, default action prefers `action_entity` then entity more-info | User supplies `entity` |
| `mode_ttl` | `alarms`, optional `home_detail` | `value` | `entity: sensor.oal_system_status`, `attribute: mode_timeout_remaining`, `icon: timer`, `label: Mode Timer`, `compact_label: Timer`, `accent: amber`, `format: state`, `show_when.mode_timeout_state == 'active'`, default action opens entity more-info | Fixed source |
| `now_playing` | `home_summary`, `home_detail`, optional info surface | `value` | `entity: sensor.sonos_current_playing_group_coordinator`, `icon: speaker`, `label/compact_label: Playing`, `accent: blue`, `attribute: group_members`, `format: array_length` (renders the count of speakers in the active group, not the coordinator name), `show_when.binary_sensor.sonos_playing_status == 'on'`, default tap navigates to `#sonos-now-playing` Bubble Card 3.2 popup | Fixed source |

This table is the canonical CD11 recipe surface. The `status_bespoke.test.js` recipe-default self-containment block asserts the synthesized runtime tile for each shorthand recipe, so `{ recipe: 'mode_ttl' }` and the equivalent expanded runtime tile stay aligned.

**X1 (v3.6.0) consolidation note** — the previously-separate `adaptive_count`, `weather_modifier`, and `system_state` recipes are removed from the registry. Authoring the single `boost_offset` composite recipe now answers all three of: "how much is OAL deviating from baseline?" (value, signed % from `total_modification`), "why?" (label, dynamically resolved from `active_modifiers[0].name`, `tv_mode_active`, `system_paused`, `mode_timeout_state`, or `current_preset`), and "is the system in an active modifier state?" (encoded in the cause label itself). This collapses three redundant tiles into one source-of-truth surface and aligns with HA's "tile = one signal" architectural principle. `active_zonal_overrides` is intentionally NOT in the cause priority — manual overrides don't contribute to `total_modification` and are already represented by the dedicated `manual_overrides` tile.

**X2 (v3.7.0) tap intent contract** — every recipe now declares (or inherits) the most-likely user intent at the moment of tap, not a generic more-info fallback. The resolution chain is: authored `tap_action` → authored `navigate_path` → recipe-specific intent (`_recipeSpecificAction`) → authored `action_entity` more-info → entity more-info. Recipe-specific intents currently wired:

| Recipe | Tap intent | Stopgap status |
|--------|-----------|----------------|
| `lights_on` | `light.toggle` on `action_entity` (default `light.all_adaptive_lights`, the canonical OAL group) | live |
| `next_sun_event` | more-info on `action_entity` (default `weather.home`) | live |
| `next_alarm` | call `script.sonos_load_alarm_for_edit` with the alarm switch entity read from `next_alarm_entity` attribute | stopgap pending SA3 retarget to Bubble Card 3.2 Adaptive popup; recipe contract stays identical when the underlying script's popup mechanism changes |

Other recipes use the generic resolution chain. Future tap intents (CD11+): `inside_temperature` → Adaptive popup with `tunet-climate-card` (per claude-mem #11191), `home_presence` → household summary popup, `manual_overrides` → zonal override list popup, `boost_offset` (composite) → modifier breakdown popup, `enabled_alarms` → alarms list popup. All of those need their target popup surfaces built before wiring; until then, generic more-info is the safe fallback.

**X2 (v3.7.0) variant-aware reset** — the `manual_overrides` aux pill renders the full "Reset" text on tablet/desktop (where the tile is wide enough to accommodate the pill without overlapping the icon) and collapses to a compact round button at viewport ≤ 390px (iPhone 12 Pro). Implemented as a `@media (max-width: 390px)` rule that forces `display: none` on `.tile-aux .aux-label` and reduces the pill to a 2.25em circle. Bypasses the per-variant `summary-compact` class so the responsive collapse applies to every variant uniformly.

**X2 (v3.7.0) home icon centering** — `.tile-icon-glyph` now sets `place-self: center` and `text-align: center` so glyphs whose advance width exceeds the wrap (notably `home` in Material Symbols Rounded, which renders ~1.56em wide at the home_summary scale) center their visible representation around the wrap's center axis instead of left-aligning. Fixes a long-standing visual offset in `home_summary` that didn't reproduce in `home_detail` (where the wrap is wide enough to fully contain the glyph). The home_summary `--_tunet-status-icon-box` was also bumped from 2em to 2.5em so the wrap fully contains the rendered glyph (em-cascade math: width:1.5625em on a font-size:1.5625em element = 2.44em effective width, requiring a wrap ≥ 2.5em to avoid overflow).

**X3 (v3.8.0) mobile row variant wrap** — at viewport ≤ 47.9375em (≈ 767px) the `room_row` variant transitions from a horizontal-scroll layout (`flex-wrap: nowrap; overflow-x: auto`) to a wrapped grid of compact vertical-stack tiles (`flex-wrap: wrap; overflow-x: visible`, tiles flex `1 1 6em` with `flex-direction: column`). The original 10.75em fixed tile width was too wide for mobile (only 2-3 tiles fit at 390px before horizontal scroll hid the rest); the wrapped layout reclaims width by removing the side-by-side icon|label|value horizontal arrangement in favor of the icon-top / value-mid / label-bottom stack used by `home_summary`. Typography stays at the row variant scale — the wrap rescues space without shrinking text. Tablet and desktop (≥ 768px) keep the original horizontal aesthetic.

Current recipe behavior:

- recipes provide defaults; authored `recipe_tiles[]`, `recipes[]`, or raw `tiles[]` still own render order
- user-bound recipes warn when authored without `entity`, because entity binding is the one intentional external input in the shorthand contract
- `home_summary` uses recipe priority only for slot-budget arbitration when more than 8 visible tiles compete for the summary matrix
- `inside_temperature` defaults tile activation to `action_entity`
- `next_sun_event` auto-switches between sunrise/sunset icon + label
- `next_alarm` prefers authored `navigate_path`, otherwise falls back to `action_entity`/entity more-info
- `next_alarm` auto-renders as an `alarm` tile in `layout_variant: alarms` unless the author explicitly overrides the tile type
- `next_alarm` in `home_summary` auto-applies `format: time_short_hm` (HH:MM, no seconds) so the matrix tile reads as a clean time string
- `enabled_alarms` is intended for `alarms` and optional `home_detail`
- `mode_ttl` is bundled into `sensor.oal_system_status` attributes (state via `mode_timeout_remaining`, visibility via `mode_timeout_state == 'active'`); the timer entity `timer.oal_mode_timeout` is no longer the recipe default but remains available for explicit author overrides
- `lights_on` is fixed-source on `sensor.oal_system_status.lights_on_formatted` to avoid the "X / total" three-line tile shape — the formatted attribute renders as a single "15/16" string
- `boost_offset` is the composite OAL deviation tile: `format: signed_percent` renders the magnitude with explicit sign and built-in `%` (no `unit:` needed), and `_resolveDynamicLabel` replaces the static `Boost` label with the dominant cause from `sensor.oal_system_status` attributes — `Paused` > `Movie` > `Manual` (active zonal overrides) > preset+countdown when timer active > single active modifier name (e.g. `Snowy`, `Sunset`) > `Mixed` for multiple modifiers > `current_preset` if not Adaptive > fallback `Adaptive`. User-authored `label`/`compact_label` always win over the dynamic resolution; user-authored `label_entity` likewise wins, preserving existing dynamic-label authoring patterns.
- `signed_percent` format is self-contained — never combine with `unit: '%'` or you'll render `+21%%`
- `weather_modifier` reads `sensor.oal_system_status.weather_modifier_value` and only renders when `weather_modifier_active == true`; surfaces the active environmental modifier (e.g., +20% during rainy conditions)

### Conditional Visibility (show_when)

Per-tile condition: `{entity, state, operator, attribute}`. Operators: equals, not_equals, contains, not_contains, gt, lt. Evaluated on every HA state change.

Mode behavior differs:

- `home_summary`: hidden tiles collapse with `display: none` and the grid reflows
- `home_detail`: hidden tiles also collapse and reflow
- `room_row`: hidden tiles collapse and the strip reflows
- `info_only`: hidden tiles also collapse and reflow
- `alarms`: hidden tiles also collapse and reflow
- `custom`: hidden tiles preserve space with `visibility: hidden`

### Auxiliary Actions (aux_action)

Small top-right action affordance. Visible only when `aux_show_when` matches.

- `home_summary`: compact icon affordance only
- `home_detail`: full pill treatment remains allowed
- `room_row`: aux actions are suppressed
- `info_only`: aux actions are suppressed
- `custom`: full pill treatment remains allowed

### Tile Grid

- `home_summary`
  - fixed 4 columns regardless of width hints
  - `grid-auto-rows: minmax(var(--tile-row-h), auto)`
  - compact summary rhythm
- `home_detail`
  - honors authored `columns` + `column_breakpoints`
  - preserves richer label / secondary / aux treatment while hidden tiles still collapse
- `room_row`
  - horizontal flex strip rather than grid columns
  - allows only `value` and `indicator`
  - compact labels, no secondary values, no aux actions
  - hidden tiles collapse/reflow
- `info_only`
  - authored `columns` + `column_breakpoints`
  - allows only `value` and `indicator`
  - calmer/lighter informational treatment with compact labels
  - no secondary values, no aux actions
  - hidden tiles collapse/reflow
- `alarms`
  - allows only `alarm`, `timer`, `value`, and `indicator`
  - uses a slightly taller alarm/timer rhythm than summary
- `custom`
  - authored `columns` + `column_breakpoints`
  - same `minmax(var(--tile-row-h), auto)` structural fix, but legacy flexibility otherwise remains

### Grid Options

`getGridOptions()` is variant-aware in CD11 while preserving the suite-wide Sections rule that rows remain `auto`.

| Variant | `getGridOptions()` | `getCardSize()` estimate |
|---------|--------------------|--------------------------|
| `home_summary` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 4 }` | fixed 4-column summary matrix, clamped to the 8-slot summary budget plus optional header |
| `home_detail` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 12 }` | authored columns/breakpoints + tile count, with room for richer detail rows |
| `room_row` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 1, max_rows: 2 }` | one row when headerless, two rows with header |
| `info_only` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 6 }` | compact passive information rows with a short ceiling |
| `alarms` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 3, max_rows: 8 }` | timer/alarm cluster with a taller minimum for alarm sub-shapes |
| `custom` | `{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }` | legacy authored grid estimate |

These values mirror `Dashboard/Tunet/Docs/sections_layout_matrix.md` and are locked by the `Status: variant-aware Sections sizing contract` block in `status_bespoke.test.js`.

### Legacy Keys

`status_dot` (string) → auto-converted to `dot_rules: [{match: '*', dot: status_dot}]`. One-way conversion.

### Interaction

- **Category**: Information tiles with optional action controls
- Primary activation precedence is: explicit `tap_action` -> explicit `navigate_path` -> recipe default -> `action_entity` more-info -> tile-entity more-info.
- Interactive tiles use tap/keyboard (`Enter`/`Space`) button semantics; passive recipe tiles may intentionally render without button behavior.
- `info_only` is passive by default; tiles only become interactive when the author explicitly provides `tap_action`, `navigate_path`, or `action_entity`.
- Dropdown tiles open a custom overlay with `listbox` / `option` semantics and explicit option-button actions.
- `home_summary` dropdowns center the selected value text and hide the visible chevron so the card reads like the other summary tiles.
- Implemented status modes now intentionally use a larger icon/value/label scale than the first CD11 landing; if they drift back to a small/sparse look, treat that as a regression.
- The current density target is closer to `tunet-sensor-card` `standard` / `use_profiles: false` than to the early sparse CD11 status prototypes.
- Aux action executes when visible; `home_summary` renders the compact icon affordance rather than the full pill treatment.
- No hold gesture and no drag gesture in status tiles.

### Sections Safety

- `CD11a` removed the old fixed-height cap: status rows now use `grid-auto-rows: minmax(var(--tile-row-h), auto)` so taller content can grow without clipping.
- `rows: 'auto'` in `getGridOptions()` still describes the helper contract; variant-specific `min_rows` / `max_rows` describe the intrinsic shape without forcing fixed rows.
- `home_summary` is intentionally phone-first with a fixed `4x2` summary target; do not reinterpret it as a desktop/tablet-only density.
- `custom` remains the legacy escape hatch for authored freeform grids now that the opinionated `CD11` variants are implemented.

### Editor Architecture

**Type**: Level 2 narrow. The editor exposes the semantic CD11 authoring layer (`layout_variant` + `recipe_tiles[]`), while raw polymorphic `tiles[]` remains YAML-only.

**Editor authoring fields**:
`name`, `layout_variant`, `recipe_tiles`, `show_header`, `columns`, `tile_size`, `use_profiles`, `custom_css`

**Synthesizer precedence**:
1. `recipe_tiles[]`
2. `recipes[]` alias
3. raw `tiles[]`

**Stub configs**:
`getStubConfig()` returns the `home_summary` starter config. `getStubConfigForVariant(variant)` returns a coherent starter for each implemented variant:

| Variant | Stub authoring shape |
|---------|----------------------|
| `home_summary` | Four-recipe summary: presence, mode selector, manual overrides, inside temperature |
| `home_detail` | Recipe detail mix: presence, manual overrides, boost, indoor environment, sun, alarm |
| `room_row` | Row-safe recipe mix: presence, temperature, humidity, system state |
| `info_only` | Passive information recipe mix: temperature, humidity, sun, system state |
| `alarms` | Alarm recipe mix: next alarm, enabled alarms, mode TTL |
| `custom` | Raw tile starter with indicator, dropdown, timer, and alarm |

The editor/stub contract is locked by the `Status: variant + recipe authoring contract` block in `status_bespoke.test.js`.

### CD11 Coverage Anchors

The CD11 status contract is intentionally locked from multiple directions so future work cannot change the user-facing status semantics from only one layer.

| Contract surface | Regression anchor |
|------------------|-------------------|
| structural row growth, hidden-tile collapse, dropdown semantics, and per-variant render paths | `Status: structural CSS contract`, `Status: dropdown accessibility contract`, and each variant mode-contract block in `status_bespoke.test.js` |
| recipe shorthand defaults, action precedence, dot rules, passive recipes, and recipe warnings | `Status: recipe and action precedence` in `status_bespoke.test.js` |
| variant-aware `getGridOptions()` / `getCardSize()` values | `Status: variant-aware Sections sizing contract` in `status_bespoke.test.js` |
| editor schema, `recipe_tiles[]`, `recipes[]` alias, synthesizer precedence, and per-variant stubs | `Status: variant + recipe authoring contract` in `status_bespoke.test.js` |
| §9 docs, Sections sizing docs, rehab-lab fixture coverage for every variant/recipe, and dedicated conditional signal stress coverage | `Status: CD11 cross-contract coverage anchors` in `status_bespoke.test.js` |

### Known Limitations

- `tiles[]` remains yaml-only — polymorphic (5 types with different fields per type)
- `column_breakpoints` is yaml-only
- live breakpoint and aesthetic-polish work remains open, even though all planned `CD11` status runtime variants are now landed

---

## 10. tunet-media-card

**Version**: v3.2.2  
**Tier**: editor-lite  
**File**: `Dashboard/Tunet/Cards/v3/tunet_media_card.js`

### Purpose

Sonos media player with album art, transport controls, volume slider, speaker dropdown with group management. Uses coordinator sensor for group-aware playback control.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `media_player.*` entity | Y | editor |
| `name` | string | `'Sonos'` | any | Y | editor |
| `coordinator_sensor` | string | `'sensor.sonos_smart_coordinator'` | any sensor | Y | editor |
| `active_group_sensor` | string | `'sensor.sonos_active_group_coordinator'` | any sensor | Y | editor |
| `playing_status_sensor` | string | `'sensor.sonos_playing_status'` | any sensor | Y | editor |
| `show_progress` | boolean | `true` | true/false | Y | editor |
| `speakers` | array | `[]` | speaker objects `[{entity, name, icon}]` | Y | editor (object+fields+multiple) |

### Coordinator Resolution Chain

1. Try `coordinator_sensor` state → entity ID of current group leader
2. Fall back to `_activeEntity` (user's last selected speaker in dropdown)
3. Fall back to `config.entity`

**Why it matters**: transport commands still go to the coordinator (group leader), but volume now follows the selected target explicitly. Selecting the grouped coordinator means group volume; selecting any other speaker means speaker-only volume.

### Speaker Dropdown

- Tap speaker row → selects the active target (changes display and volume target, doesn't affect grouping)
- Tap check icon → calls `sonos_toggle_group_membership` (optimistic UI: check toggles immediately). This explicit menu action is the accepted grouped-membership control for the media dropdown path.
- Group All / Ungroup All buttons at bottom (call `sonos_group_all_to_playing` / `sonos_ungroup_all` scripts)
- Default compact labels now preserve room identity aggressively (`Living`, `Dining`, `Kitchen`, `Bed`, etc.), even when the authored label is long. Full names should live in metadata/title text, not the primary phone label lane.

### Volume Drag

Pointer capture via `setPointerCapture()`. Debounce 200ms before service call. Cooldown 1500ms after call completes. `_volDragging` flag blocks `_updateAll()` during drag to prevent visual jitter.

### Progress Bar

When `show_progress: true`: reads `media_position` + `media_duration` from coordinator. `setInterval` updates fill every 1 second during playback. Shows current/total time labels.

### Album Art

- Preferred image source order: `entity_picture_local` → `media_image_url` → `entity_picture`
- Relative URLs normalize against the active HA origin
- If HA returns a broken proxy/image URL, the failed URL is suppressed temporarily so the card does not keep hammering the same failing art endpoint on every refresh cycle
- A new art URL is still allowed immediately, so normal track/art changes recover automatically

### "Nothing Playing" State

Track name: "Nothing playing", artist: "Select a source to play", card gets `data-state="idle"` with `opacity: 0.65`.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2 }
```

Static. Full section width. Should account for show_progress (adds height).

### Interaction

- **Current implementation**:
  - Header info tile tap opens more-info
  - Album art tap opens more-info
  - Speaker dropdown row tap selects the active target
  - Group check tap toggles membership as an explicit menu action
  - Volume drag operates on slider control (not hold-gated tile drag)
- **CD9 closeout note**: media remains a dropdown-first audio surface rather than a visible speaker-tile surface; sonos/speaker-grid own the visible speaker-tile contract.
- **Group volume policy**: selected-target volume control during drag. Selecting the grouped coordinator routes proportional group volume; selecting any other speaker routes speaker-only volume.
- **Volume view lifecycle requirement**:
  - entering volume view happens via the volume button
  - volume view exits immediately via `X` close button
  - after any volume adjustment, volume view auto-exits to regular track view after 5 seconds of inactivity
  - active manual dragging pauses the inactivity timer; the 5-second timer re-arms on drag end
  - each new volume adjustment resets the 5-second timer

### Sections Safety

- Uses `rows: 'auto'` and variable content (progress bar on/off, dropdown open state, grouped count text).
- Static `min_rows` is conservative but not context-aware; dashboard-level overrides may be needed in wider section spans.
- No forced fixed row grid in card CSS; primary risk is content height growth from optional controls rather than clipping.

### Editor Architecture

**Type**: Level 1 primary + Level 2 for speakers[] in advanced.

**Authoring model** (3 primary):
| Field | Selector | Purpose |
|-------|----------|---------|
| `entity` | entity (media_player) | Main speaker — the only required input |
| `name` | text | Card title (default: 'Sonos') |
| `show_progress` | boolean | Show/hide progress bar |

**Advanced** (expandable):
| Field | Selector | Purpose |
|-------|----------|---------|
| `speakers` | object+fields+multiple | Explicit speaker list: entity, name, icon |
| `coordinator_sensor` | entity (sensor) | Override default Sonos coordinator sensor |
| `active_group_sensor` | entity (sensor) | Override default group sensor |

**Synthesizer** (already exists in setConfig):
- `coordinator_sensor` ← defaults to `'sensor.sonos_smart_coordinator'`
- `active_group_sensor` ← defaults to `'sensor.sonos_active_group_coordinator'`
- `playing_status_sensor` ← defaults to `'sensor.sonos_playing_status'`
- `speakers[]` ← auto-discovered via `binary_sensor.sonos_*_in_active_group` regex when empty

**Key insight**: 3 of the current 6 editor fields are Sonos sensor defaults that are ALWAYS THE SAME. Remove from primary editor; keep in advanced. User just picks entity + name + progress toggle.
Best-in-class naming rule: compact speaker naming must not erase room identity.

### Known Limitations

- `speakers[]` editor support is implemented (advanced object+fields+multiple); keep schema tests as regression guard
- Album art opens more-info for transport target entity (verified in code at L885)
- Default compact naming now uses a shared room-preserving compaction rule; explicit speaker names no longer bypass it.
- No active CD9 runtime defect remains; any future slider-keyboard enhancement or authoring polish should be treated as a new enhancement pass, not a tranche-close blocker.

---

## 11. tunet-sonos-card

**Version**: v1.0.0  
**Tier**: editor-lite  
**File**: `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`

### Purpose

Alternative Sonos player with inline speaker tiles (always visible, not hidden in dropdown). Compact header with transport controls. Source selection dropdown. Volume overlay appears below tiles.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `media_player.*` entity | Y | editor |
| `name` | string | `'Sonos'` | any | Y | editor |
| `coordinator_sensor` | string | `'sensor.sonos_smart_coordinator'` | any sensor | Y | editor |
| `active_group_sensor` | string | `'sensor.sonos_active_group_coordinator'` | any sensor | Y | editor |
| `playing_status_sensor` | string | `'sensor.sonos_playing_status'` | any sensor | Y | editor |
| `speakers` | array | `[]` | speaker objects `[{entity, name, icon}]` | Y | editor (object+fields+multiple) |

### Differences from Media Card

- No separate volume "view" — volume overlay appears inline below speaker tiles
- Speaker tiles always visible in horizontal scroll strip (not hidden in dropdown)
- Compact header (no large album art area)
- Source selection dropdown now uses the same full shell/action model as the media dropdown
- No Group All/Ungroup All buttons — grouping done per-tile

### Album Art

- Uses the same image source preference order as the media card:
  - `entity_picture_local` → `media_image_url` → `entity_picture`
- Failed art URLs are suppressed temporarily so the card does not repeatedly retry a broken HA media proxy on every render/update

### Speaker Tiles

Each tile shows icon, name, volume %, volume bar fill. States: `.grouped` (blue border, highlighted), `.selected` (green active-target ring), not grouped (muted). Interactions now follow the suite speaker-tile contract: body tap selects the active target, hold (400ms) then drag adjusts volume, icon tap/hold opens more-info, and the badge toggles group membership. Default/autodiscovered narrow-width runtime is now materially healthier with compact room-preserving labels and the media dropdown shell; explicit full-name authoring can still overpressure phone widths.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2 }
```

### Interaction

- **Current implementation**:
  - Speaker tile body tap selects the active target
  - Hold (400ms) then drag adjusts volume for the selected target
  - Speaker icon tap/hold opens more-info
  - Group badge toggles membership
  - Dropdown option tap also selects the active target
- **CD9 status**: closed. Visible speaker-tile semantics align with the suite speaker-tile contract, and the remaining explicit long-name pressure is authored-density guidance rather than a runtime blocker.
- **Group volume policy**: selected-target volume drag. Selecting the grouped coordinator routes proportional group volume; selecting any other speaker routes speaker-only volume.
- **Volume overlay lifecycle requirement**:
  - volume overlay exits immediately via `X` close button
  - after any volume adjustment, overlay auto-exits to regular view after 5 seconds of inactivity
  - active manual dragging pauses the inactivity timer; the 5-second timer re-arms on drag end
  - each new volume adjustment resets the 5-second timer

### Sections Safety

- Scrollable speaker-tile strip plus optional volume overlay means vertical size is mostly stable; the old default dropdown width failure is closed.
- `rows: 'auto'` is appropriate; any remaining narrow-width pressure is authored long-name/header pressure or later enhancement work, not a current default-runtime blocker.
- Requires breakpoint verification that strip controls remain tappable at `390x844` and `768x1024`.

### Editor Architecture

**Type**: Level 1 primary + Level 2 for speakers[] in advanced. Same pattern as media card.

**Authoring model** (2 primary):
| Field | Selector | Purpose |
|-------|----------|---------|
| `entity` | entity (media_player) | Main speaker |
| `name` | text | Card title (default: 'Sonos') |

**Advanced**: `speakers` (object+fields+multiple), `coordinator_sensor`, `active_group_sensor`

**Synthesizer**: identical to media card — defaults Sonos sensors, auto-discovers speakers.

### Known Limitations

- `speakers[]` editor support is implemented (object+fields+multiple)
- ~~Hardcoded press scales (.90)~~ — resolved in CD2 (tokenized)
- ~~`--spring` CSS variable undefined~~ — resolved in CD2 (replaced with `--ease-emphasized`)
- Default/autodiscovered source dropdown width handling is now aligned to the media dropdown shell and visually healthy on rehab phone/tablet captures.
- No active CD9 runtime defect remains; explicit long-name authoring pressure is guidance-level follow-up only.

---

## 12. tunet-speaker-grid-card

**Version**: v3.2.0  
**Tier**: editor-lite  
**File**: `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`

### Purpose

Dedicated speaker management grid. Each speaker tile shows volume level, playing status, and group membership with per-tile volume drag. Group All / Ungroup All action buttons.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `entity` | string | **required** | any `media_player.*` entity | Y | editor |
| `name` | string | `'Speakers'` | any | Y | editor |
| `coordinator_sensor` | string | `'sensor.sonos_smart_coordinator'` | any sensor | Y | editor |
| `columns` | number | `4` | 2-8 | Y | editor |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `show_group_actions` | boolean | `true` | true/false | Y | editor |
| `custom_css` | string | `''` | CSS text | Y (advanced) | editor |
| `speakers` | array | `[]` | speaker objects `[{entity, name, icon}]` | Y | editor (object+fields+multiple) |

### Speaker Auto-Discovery

When `config.speakers` is empty, `_getEffectiveSpeakers()` (L784) scans for `binary_sensor.sonos_*_in_active_group` entities, extracts room names via regex, and finds matching `media_player.*` entities. This is the dual-mode: explicit config OR auto-discover.

### Per-Tile Volume Control

Not display-only — each tile now uses the suite speaker-tile interaction model: body tap selects active target, hold (400ms) then drag adjusts selected-target volume, icon tap/hold opens more-info, and badge toggles group membership. Floating pill shows percentage during drag.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Static. Should compute from `ceil(speakers.length / columns) + (show_group_actions ? 1 : 0) + 1` (header). `4` columns is not a phone-safe default at `390px`; compact `2`-column layouts are the healthy narrow-width baseline.

### Interaction

- **Current implementation**:
  - Tile body tap selects the active target
  - Hold (400ms) then drag adjusts selected-target volume
  - Icon tap/hold opens more-info
  - Group badge toggles group membership
  - Group All / Ungroup All remain explicit action buttons
- **CD9 status**: closed. Visible speaker-tile semantics align with the suite speaker-tile model, and the blocking mobile density issue is resolved by the card-level phone column fallback.
- **Group volume policy**: once the suite speaker-tile model is aligned, volume follows the selected target; selecting the grouped coordinator routes proportional group volume.

### Phone Column Policy

- At `<=440px`, speaker-grid now applies a card-level mobile column fallback:
  - `tile_size: large` → `1` column
  - `tile_size: compact` / `standard` → maximum `2` columns
- This fallback applies even when `use_profiles: true`, so explicit desktop-facing configs like `columns: 3` or `columns: 4` no longer force the same density on phone widths.

### Sections Safety

- Variable-height risk comes from `show_group_actions` and speaker count density; `rows: 'auto'` is appropriate.
- Compact `2`-column layouts remain the viable phone baseline; the card-level fallback now prevents desktop-facing explicit column counts from forcing the same density on phone.
- Static `max_rows: 12` may mask truncation risks in high-count speaker sets; verify with dense lab fixtures.

### Editor Architecture

**Type**: Level 1 primary + Level 2 for speakers[] in advanced.

**Authoring model** (5 primary):
| Field | Selector | Purpose |
|-------|----------|---------|
| `entity` | entity (media_player) | Main speaker |
| `name` | text | Card title |
| `columns` | number 2-8 | Grid density |
| `tile_size` | select: compact / standard / large | Tile density |
| `show_group_actions` | boolean | Group All / Ungroup All buttons |

**Advanced**: `speakers` (object+fields+multiple: entity, name, icon), `coordinator_sensor`, `use_profiles`, `custom_css`

**Synthesizer**: same Sonos sensor defaults + speaker auto-discovery. `speakers[]` empty → _getEffectiveSpeakers() discovers from binary_sensor.sonos_*_in_active_group regex.

### Known Limitations

- Profile system remains part of current runtime behavior; do not read that alone as an active defect classification
- ~~Hover `translateY(-1px)`~~ — resolved in CD2 (removed, shadow-lift only)
- ~~`--spring` CSS variable undefined~~ — resolved in CD2 (replaced with `--ease-emphasized`)
- ~~Focus ring uses `var(--accent)` instead of `var(--focus-ring-color)`~~ — resolved in CD2
- No active CD9 runtime defect remains; treat any future dense/default complaints as new composition/authoring issues unless a fresh runtime regression is proven.

---

## 13. tunet-nav-card

**Version**: v0.2.4  
**Tier**: editor-complete  
**File**: `Dashboard/Tunet/Cards/v3/tunet_nav_card.js`

### Purpose

Persistent navigation chrome. Two modes: mobile bottom dock and desktop left rail. Active route detection via path prefix matching. Footer placement support (HA 2026.3). Strong interaction/accessibility reference, but not yet a stable layout-reference card while the offset strategy and desktop/sidebar coexistence remain open.

### Config Properties

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `home_path` | string | `'/tunet-suite/overview'` | dashboard path | Y | editor |
| `rooms_path` | string | `'/tunet-suite/rooms'` | dashboard path | Y | editor |
| `media_path` | string | `'/tunet-suite/media'` | dashboard path | Y | editor |
| `subview_paths` | array | `[]` | string paths | Y | editor |
| `include_rooms_index` | boolean | `true` | true/false | Y | editor |
| `items` | array | `[]` | nav item objects | Y | editor |
| `desktop_breakpoint` | number | `900` | 600-1400 | Y | editor |
| `desktop_left_offset` | number | `108` | 72-220 | Y | editor |
| `mobile_bottom_offset` | number | `108` | 84-220 | Y | editor |

### Active Route Detection

`_updateActive()` (L501): compares `window.location.pathname` against each nav item's path using `startsWith()` prefix matching. Custom `match_paths` array per item for additional pattern matching. Subview paths trigger "Rooms" active state.

### Mobile vs Desktop

`desktop_breakpoint` (default 900px) via `matchMedia()`. Below: bottom dock (64px, horizontal). Above: left rail (84px, vertical). Card stays visible in both — layout changes, not visibility. The open runtime issue is the desktop rail/sidebar coexistence path, not a universal mobile instability claim.

### Safe Area Handling

Mobile dock padding includes `env(safe-area-inset-bottom)` for iOS home bar. `mobile_bottom_offset` config overrides the measured clearance.

### Global CSS Injection

Injects `<style id="tunet-nav-card-offsets">` into `document.head` with margins/padding on HA view elements. Sets `--tunet-nav-offset-left` and `--tunet-nav-offset-bottom` CSS variables. Cleanup on disconnect. Disable via `window.TUNET_NAV_OFFSETS_DISABLED` flag. The active validation risk is offset leakage / competition with HA's own sidebar in desktop rail mode.

### Grid Options

```javascript
{ columns: 'full', min_columns: 6, rows: 'auto', min_rows: 1 }
```

Uses `columns: 'full'` — spans entire section width. This is chrome, not content.

### Interaction

- **Category**: Navigation chrome
- Nav item button tap/keyboard activates route navigation.
- Active route is reflected visually via path matching logic.
- No hold and no drag interactions in nav.

### Sections Safety

- Uses `columns: 'full'` intentionally because nav is global chrome, not content card composition.
- `rows: 'auto'` + `min_rows: 1` keeps nav height intrinsic while respecting section placement.
- Global offset style injection affects surrounding layout and must be validated with sidebar/mobile dock states.
- Best-in-class rule: nav can remain the interaction/accessibility reference while desktop offset strategy is still under CD10 validation; do not treat it as the layout-reference card until that conflict is closed.

### Editor Architecture

**Type**: Level 1 — `getConfigForm()` with simple selectors. Reference implementation.

**Authoring model** (9 fields — ALL exposed, ALL simple):
Primary: `home_path` (text), `rooms_path` (text), `media_path` (text), `subview_paths` (object), `include_rooms_index` (boolean)
Layout: `desktop_breakpoint` (number 600-1400), `desktop_left_offset` (number 72-220), `mobile_bottom_offset` (number 84-220)
Advanced: `items` (object — custom nav items)

**Synthesizer**: minimal — path normalization via `normalizePath()`, breakpoint clamping. No inference. All paths are explicit user decisions.

**Runtime model**: flat config. Authoring model ≈ runtime model. This is what "editor-complete" looks like.

**Status**: Already correct. Reference for how every card's editor SHOULD feel.

### Reference Implementation Status

All fields editable. Native `<button>` elements with `aria-label`. `<nav>` landmark. Uses shared tokens (`--press-scale`, `--motion-ui`, `--ease-standard`, `--focus-ring-*`). Multi-property transitions. No `transition: all`. This remains the interaction/accessibility reference implementation, but desktop rail + HA sidebar coexistence and offset leakage are still open CD10 layout-validation issues.
