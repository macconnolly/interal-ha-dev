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
- **Icon area tap** = more-info popup
- **Group badge** (+/- icon, top-right) = toggle group membership
- **Visual**: blue outline = in active group
- Volume controls the SELECTED speaker specifically

### 3. Navigation Tiles (rooms tile variant)
- **Tap** = navigate to room page
- **Hold** (400ms + haptic) = popup (Browser Mod)
- **No drag** — rooms are destinations, not sliders

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

### Group Volume Decision (Locked)
When the active speaker is in a group:
- volume drag adjusts only the selected speaker
- group-wide volume changes are explicit actions, not implicit side effects of tile drag

### Speaker Tile Unification Target (CD9 Contract)
Across `tunet-media-card`, `tunet-sonos-card`, and `tunet-speaker-grid-card`:
- tile body tap selects active speaker
- hold (400ms) then drag adjusts volume
- icon tap opens more-info
- group badge tap toggles group membership

Current implementations still diverge from this target and are reconciled in CD9.

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
| `tunet-lighting-card` | detail | canonical room-detail light-control surface | 2-column phone-safe lighting/detail layouts | 3-column phone defaults at `390px` | CD6 |
| `tunet-rooms-card` | overview | room overview/navigation hub | `tiles` or `slim`, depending on density | `row` as the default phone overview layout; detailed room-light evaluation | CD7 |
| `tunet-climate-card` | information | climate companion/reference surface | single-card climate presentation | cramped paired-phone compositions treated as a climate-card default | CD8 |
| `tunet-weather-card` | information | weather companion/info surface | fixed daily/hourly variants | toggle-heavy auto-control variants as the default phone composition | CD8 |
| `tunet-sensor-card` | information | environment/status rows and glanceable metrics | concise labeled rows with controlled sensor counts | unlabeled or alias-ambiguous fixture contracts | CD8 |
| `tunet-status-card` | information | status/summary matrix where explicitly needed | 2-column phone-safe density unless labels are substantially shortened | 4-column phone summary matrix at `390px` | CD11 / G3S lock |
| `tunet-media-card` | media control | primary transport/media state surface | current compact phone layout with full speaker identity preserved | compact naming that erases room identity | CD9 |
| `tunet-sonos-card` | media control | alternate inline-speaker Sonos control surface | only after width-safe source/speaker handling is validated | current narrow-width source/dropdown and speaker-strip defaults | CD9 |
| `tunet-speaker-grid-card` | media control | dedicated speaker-management grid | compact 2-column speaker grid | 4-column standard/default on phone | CD9 |
| `tunet-nav-card` | chrome | persistent navigation chrome | bottom dock | desktop rail as a layout reference while offset/sidebar strategy is unstable | CD10 |

Locked decisions:
- `tunet-rooms-card` is the room overview/navigation surface, not the canonical detailed room-light surface.
- `tunet-lighting-card` is the canonical detailed room-light surface.
- `tunet-light-tile` is an atomic detail tile, not an overview card.
- `tunet-nav-card` is chrome, not ordinary content composition.
- `tunet-status-card` remains G3S/CD11 locked for structural changes.

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
Current HA grid hints remain dense-tile defaults and do not yet differentiate vertical vs horizontal or `tile_size` at the grid-hint layer. Any further tuning belongs to CD6, not shared-pass cleanup.

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

### Known Limitations

- Horizontal-variant label truncation on phone remains the main open polish issue for this card family
- This card should be judged inside room-detail/detail-stack compositions, not as an overview/navigation surface

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
| `column_breakpoints` | array | `[]` | `[{min_width?, max_width?, columns}]` | Y | editor |
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

### Sections Safety — Worst in Suite

Grid-context caveat:
1. default numeric `columns` is section-span-relative and not universal full-width in wider sections.

Content/layout risks:
1. `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` at L383 caps tile width and creates dead space when combined with centered justification.
2. `justify-content: center` at L389 produces stranded dead space in wider sections instead of filling available detail-surface width.
3. scroll-layout clipping pressure remains active around the scroll/tile overflow contract at L396 and tile overflow handling at L434-L435.
4. row-limit and layout-branch logic at L1259 remains part of the live sizing/clipping contract.

Best-in-class requirement: `3` columns at `390px` is not an acceptable default for the room-detail surface.

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

- Current editor exposes 16 primary fields instead of the 6-field authoring model — CD1.8 should simplify
- 6 rendering paths (3 surfaces × 2 layouts) need validation at all breakpoints
- `surface: tile` is now accepted by editor/runtime, but currently shares card styling until a dedicated tile-surface CSS contract is defined
- Sections safety issues are the most significant in the suite (fixed-width cap, centered dead space, overflow/clipping, scroll pressure)
- Legacy key precedence documented in `legacy_key_precedence.md`

---

## 5. tunet-rooms-card

**Version**: v3.0.0  
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
| Layout | Vertical cards in grid | Horizontal rows | Row at 70% scale |
| Primary tap | Toggle room lights today; target contract is navigate-first | Navigate to room | Navigate to room |
| Light orbs | None | Yes, one per light | Yes, scaled 70% |
| Power button | None | Yes, toggles all room lights | Yes |
| Hold (400ms) | Fire hold_action (popup) | N/A | N/A |
| Min height | 5.75em | 7.3125em | 5.12em |
| Progress bar | Yes (avg brightness) | Hidden | Hidden |

### Route/Control Contract (FRAGILE)

**Row mode**: body tap navigates, orb tap toggles individual light, power button toggles all. `stopPropagation()` on orbs and power button prevents navigation when controls are tapped. Priority: `navigate_path` > `tap_action` > `hold_action`.

**Tile mode**: quick tap (<400ms) toggles lights or fires `tap_action`. Long press (≥400ms) fires `hold_action` with haptic scale feedback (0.9x for 120ms). Priority: `tap_action` > toggle > temp more-info.

Whole-home evaluation rule: judge this card primarily on room overview/navigation behavior and compact room status/control density. Do not judge it as a substitute for `tunet-lighting-card` when evaluating room-detail light control.

### Room Toggle Logic

"Any-on-then-off": if ANY light is on → turn all off. If ALL off → turn all on. Mixed state → off.

### Adaptive Lighting Integration

- `_resolveAdaptiveEntitiesForRooms()` (L1198): auto-discovers `switch.adaptive_lighting_*` entities whose `lights` attribute overlaps with room lights
- `_getManualLights()` (L1214): reads `manual_control` attribute array from AL switches
- Visual: red shadow glow on manually-controlled orbs, "X manual" in status text
- Reset button calls `adaptive_lighting.set_manual_control` with `manual_control: false`

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Default assumes standard (`column_span: 1`) sections where numeric `12` behaves as full-width.
In wider sections, numeric `12` is fractional unless dashboard-level overrides are applied.
`getCardSize()` is already mode-aware (row/slim vs tiles); `getGridOptions()` still needs matching context-aware floor tuning.

### Interaction

- **Target contract**:
  - Tile variant: tap navigate, hold popup, no drag
  - Row/slim variant: body tap navigate, orb tap light toggle, power tap room all-toggle, no hold
- **Current implementation**:
  - Tile variant short tap toggles room lights (unless `tap_action` override); long hold triggers `hold_action` or navigation fallback
  - Row/slim already matches navigate + explicit controls model with stop-bubbling on row controls
- **Planned delta**: CD7 aligns tile variant to the navigation-tile contract without regressing row control ownership.

### Sections Safety

- Variable-content card with two structural modes (`tiles` grid vs `row/slim` flex-column) and fixed min-height contracts per mode.
- `getGridOptions()` currently static; row/slim and tiles have different real vertical density and should be validated against shared sizing rules in CD4/CD7.
- Section-span caveat: numeric default `columns` is relative to section width; room-page YAML overrides are expected for intentional multi-column section compositions.
- Known risk: row variant text density/truncation and control crowding at mobile breakpoints require explicit breakpoint evidence, not inferred parity.
- Phone-default recommendation: prefer `tiles` or `slim` for overview surfaces; treat `row` as the densest and least phone-safe variant until CD7 closes.

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

**Version**: v1.6.1  
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
| `show_last_updated` | boolean | `true` | true/false | Y | editor |

### Auto-Mode Switching

When `forecast_view: 'auto'` and/or `forecast_metric: 'auto'`:
- Card detects precipitation likelihood from current condition + hourly forecast data
- If precip likely (condition is rainy/snowy/hail OR maxPrecip ≥ threshold): switches to hourly view + precipitation metric
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

- **Category**: Information tile + segmented controls
- Header info tile supports tap/keyboard activation and opens more-info for the weather entity.
- Daily/Hourly and Temp/Precip segmented buttons are explicit native controls.
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
- Toggle-heavy variants remain a P2 usability issue on phone; they should not be treated as the phone-default presentation

---

## 8. tunet-sensor-card

**Version**: v3.0.0  
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

**Version**: v3.0.0  
**Tier**: yaml-first  
**File**: `Dashboard/Tunet/Cards/v3/tunet_status_card.js`

### Purpose

Polymorphic tile grid with 5 tile subtypes: value, indicator, timer, alarm, dropdown. The most complex card for configuration due to per-type field differences. Supports conditional visibility, auxiliary actions, secondary displays, and status dots.

### Config Properties (top-level)

| Key | Type | Default | Accepted | Editor | Classification |
|-----|------|---------|----------|:------:|----------------|
| `name` | string | `'Home Status'` | any | Y | editor |
| `show_header` | boolean | `true` | true/false | Y | editor |
| `columns` | number | `4` | 2-8 | Y | editor |
| `column_breakpoints` | array | `[]` | responsive rules | N | yaml-only |
| `tile_size` | string | `'standard'` | `'compact'`, `'standard'`, `'large'` | Y | editor |
| `use_profiles` | boolean | `true` | true/false | Y | editor |
| `custom_css` | string | `''` | CSS text | Y (advanced) | editor |
| `tiles` | array | `[]` | tile objects | N | yaml-only |

### Five Tile Types

**Value** (default): Icon + large value + optional secondary + optional unit + label. Supports `attribute` for reading entity attributes, `format` for display (state/integer/time), `dot_rules` for status dots, `secondary` for sub-value display.

**Indicator**: Icon + value + label + status dot. Simpler than value — no secondary, no unit.

**Timer**: Icon + live HH:MM:SS countdown + label. Updates every 1 second via `setInterval`. Reads `entity.attributes.remaining`, calculates elapsed since `last_updated`.

**Alarm**: Three visual states — off (muted), set (blue pill with time), ringing (blue background + shaking icon animation + snooze/dismiss buttons). `playing_entity` controls ringing state, `snooze_action` and `dismiss_action` fire configured actions.

**Dropdown**: Icon + current value + chevron + label. Opens a custom glassmorphic overlay menu with flip/cap-height heuristics. Options read from entity's `options` attribute (input_select). Current phone runtime still needs more conservative wording than "smart positioning" implies.

### Conditional Visibility (show_when)

Per-tile condition: `{entity, state, operator, attribute}`. Operators: equals, not_equals, contains, not_contains, gt, lt. Evaluated on every HA state change. Hidden tiles use `visibility: hidden` (preserve grid space).

### Auxiliary Actions (aux_action)

Small pill button in tile top-right. Visible only when `aux_show_when` condition matches. Has "danger" styling when label contains "reset". Fires custom action on tap.

### Tile Grid

`grid-auto-rows: var(--tile-row-h)` — intentionally forced uniform row height. Standard: 5.875em, compact: 5.5em, large: 7.125em. Responsive columns via ResizeObserver.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Static. Should compute from `ceil(tiles.length / columns) + (show_header ? 1 : 0)`. The current 4-column summary default is not phone-safe at `390px`; `2` columns is the safe default unless labels are substantially shortened.

### Legacy Keys

`status_dot` (string) → auto-converted to `dot_rules: [{match: '*', dot: status_dot}]`. One-way conversion.

### Interaction

- **Category**: Information tiles with optional action controls
- Primary tile activation is tap/keyboard (`Enter`/`Space`) via bound button semantics.
- Dropdown tiles open/close option menus with explicit option-button actions.
- Aux action pill executes configured action when visible.
- No hold gesture and no drag gesture in status tiles.

### Sections Safety

- Card intentionally uses fixed `grid-auto-rows` for uniform tile rhythm, unlike most other cards.
- `rows: 'auto'` in `getGridOptions()` does not remove internal fixed tile row-height behavior.
- This forced-height model is status-specific and remains under `G3S` lock (bugfix-only unless reopened).
- Phone-default rule: treat the 4-column summary matrix as a desktop/tablet density, not a `390px` default.

### Editor Architecture

**Type**: Level 1 currently. Future: Level 3 (choose selector) or Level 4 (custom editor).

**Current authoring model** (top-level flags only):
`name`, `show_header`, `columns`, `tile_size`, `use_profiles`, `custom_css`

**Future authoring model** (mode-driven synthesis, when G3S lifts):
| Field | Selector | What it synthesizes |
|-------|----------|---------------------|
| `mode` | select: summary / alarm / environment / custom | → tiles[] array |
| `status_entity` | entity | → adaptive/manual/boost/mode tiles (when mode=summary) |
| `weather_entity` | entity | → weather/outdoor temp/humidity tiles (when mode=summary) |
| `temperature_entity` | entity | → indoor temp tile (when mode=summary) |
| `alarm_entity` | entity | → alarm tile with ringing/snooze/dismiss (when mode=alarm) |
| `entities` | multi-entity (sensor) | → value tile per sensor (when mode=environment) |

**Future synthesizer** (setConfig, when G3S lifts):
- `mode = 'summary'` + `status_entity` → generates 8-tile OAL dashboard (adaptive, manual, boost, mode dropdown, weather, outdoor, humidity, indoor)
- `mode = 'alarm'` + `alarm_entity` → generates alarm tile with synthesized snooze/dismiss actions
- `mode = 'environment'` + `entities` → generates value tile per sensor with auto-detected unit/icon
- `mode = 'custom'` → tiles[] from YAML, no synthesis
- Precedence: explicit `tiles[]` > mode-synthesized tiles

**Implementation path**: Level 3 (choose selector for mode-dependent fields) in getConfigForm, synthesis in setConfig. OR Level 4 (getConfigElement custom editor) if choose doesn't handle the conditional field sets cleanly.

**G3S scope**: documented now, implemented when lock lifts.

### Known Limitations

- `tiles[]` is yaml-only until G3S lock lifts — polymorphic (5 types with different fields per type)
- `column_breakpoints` is yaml-only
- Alarm tile requires `playing_entity` + script entities for snooze/dismiss — complex setup
- G3S scope lock: bugfix-only until explicitly reopened
- Small-screen density and dropdown-overlay quality remain CD11 / G3S-owned issues even though broader structural work is locked

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

**Why it matters**: transport commands go to the coordinator (group leader), not necessarily the displayed speaker. Current volume targeting prefers coordinator/group context; CD9 aligns speaker-tile interaction ownership explicitly.

### Speaker Dropdown

- Tap speaker name → selects as active (changes display, doesn't affect grouping)
- Tap check icon → calls `sonos_toggle_group_membership` (optimistic UI: check toggles immediately). This control still needs semantic hardening in CD9.
- Group All / Ungroup All buttons at bottom (call `sonos_group_all_to_playing` / `sonos_ungroup_all` scripts)

### Volume Drag

Pointer capture via `setPointerCapture()`. Debounce 200ms before service call. Cooldown 1500ms after call completes. `_volDragging` flag blocks `_updateAll()` during drag to prevent visual jitter.

### Progress Bar

When `show_progress: true`: reads `media_position` + `media_duration` from coordinator. `setInterval` updates fill every 1 second during playback. Shows current/total time labels.

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
  - Speaker dropdown row tap selects active speaker
  - Group check tap toggles membership (still pointer-first and not yet a finished semantics contract)
  - Volume drag operates on slider control (not hold-gated tile drag)
- **Target contract** (CD9): speaker-tile interactions converge with the suite speaker-tile model (tap select, hold-drag volume, icon more-info, badge group toggle).
- **Group volume policy**: selected-speaker-only volume control during drag.
- **Volume view lifecycle requirement**:
  - entering volume view happens via the volume button
  - volume view exits immediately via `X` close button
  - after any volume adjustment, volume view auto-exits to regular track view after 5 seconds of inactivity
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
- Volume slider needs `role="slider"` + arrow key handlers (deferred to CD9 — media bespoke)
- `_firstWordName()`-style compact naming is not an acceptable long-term default when it hides room identity on phone
- Remaining CD9 issues are primarily naming/semantics, not a broad coherent-build visual failure

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
- Source selection dropdown with per-source volume drag within dropdown
- No Group All/Ungroup All buttons — grouping done per-tile

### Speaker Tiles

Each tile shows icon, name, volume %, volume bar fill. States: `.grouped` (blue border, highlighted), not grouped (muted). Interactions: tap toggles group membership today, drag adjusts volume, hold (500ms) opens more-info. Narrow-width runtime shows active overflow pressure rather than merely theoretical width sensitivity.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2 }
```

### Interaction

- **Current implementation**:
  - Speaker tile tap toggles group membership
  - Speaker tile drag adjusts that tile's volume
  - Speaker tile long press opens more-info
  - Dropdown option tap selects active speaker
- **Target contract** (CD9): unify with speaker-tile suite contract where tile body tap selects active speaker and group toggle is owned by an explicit badge control.
- **Group volume policy**: selected-speaker-only volume drag.
- **Volume overlay lifecycle requirement**:
  - volume overlay exits immediately via `X` close button
  - after any volume adjustment, overlay auto-exits to regular view after 5 seconds of inactivity
  - each new volume adjustment resets the 5-second timer

### Sections Safety

- Scrollable speaker-tile strip plus optional volume overlay means vertical size is mostly stable but width failure is active on narrow layouts.
- `rows: 'auto'` is appropriate; the open defect is current source-button/dropdown and speaker-strip overflow at `390x844` / `768x1024`, not just hypothetical pressure.
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
- Source button/dropdown width handling and speaker-strip overflow remain active CD9 runtime failures on phone/tablet

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

Not display-only — each tile is a draggable volume slider. `createAxisLockedDrag()` per tile with debounce 200ms, cooldown 1500ms. Floating pill shows percentage during drag. `role="slider"` + `aria-valuenow` on tiles.

### Grid Options

```javascript
{ columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 }
```

Static. Should compute from `ceil(speakers.length / columns) + (show_group_actions ? 1 : 0) + 1` (header). `4` columns is not a phone-safe default at `390px`; compact `2`-column layouts are the healthy narrow-width baseline.

### Interaction

- **Current implementation**:
  - Tile tap toggles group membership
  - Drag adjusts per-tile volume
  - Hold opens more-info
  - Group All / Ungroup All are explicit action buttons
- **Target contract** (CD9): align tile behavior with suite speaker-tile model (tap select active, hold-drag volume, icon more-info, badge group toggle).
- **Group volume policy**: selected-speaker-only drag behavior.

### Sections Safety

- Variable-height risk comes from `show_group_actions` and speaker count density; `rows: 'auto'` is appropriate.
- Compact `2`-column layouts are conditionally phone-safe; the failing cases are dense/default `4`-column configurations and other high-density layouts.
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
- Treat dense/default speaker-grid configurations as the active CD9 defect; compact 2-column layouts are the viable phone baseline

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
