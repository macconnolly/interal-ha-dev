# Legacy Key Precedence Rules

Documents where `setConfig()` accepts overlapping or legacy keys alongside current keys, and what happens when both are present.

---

## tunet_lighting_card.js (lines 858-892)

### Entity Sources — 4 paths, strict precedence

The lighting card accepts entities from 4 config patterns. `setConfig()` resolves them in this order:

```
1. config.zones[]     → rich per-entity objects {entity, name, icon}
2. config.entities[]  → simple string array of entity IDs
3. config.light_overrides  → LEGACY: {entity_id: {name, icon}} object → converted to zones[]
4. config.light_group      → LEGACY: single entity string → converted to entities[]
```

**Precedence rules (from setConfig lines 859-879):**

| Condition | Result |
|-----------|--------|
| `zones[]` is non-empty | Use zones. Legacy paths ignored. |
| `zones[]` empty, `entities[]` non-empty | Use entities. Legacy paths ignored. |
| Both empty, `light_overrides` exists | Convert to zones: `{entity, name, icon}` per override entry |
| Both empty, `light_group` exists (no overrides) | Convert to entities: `[light_group]` |
| All empty | Render config placeholder (was: throw) |

**Key behavior**: `zones` and `entities` CAN coexist (line 884: "Both can be mixed"). When both are present, both are used — zones provide rich per-entity config, entities provide simple IDs that may be expanded via `expand_groups`.

**Legacy keys**: `light_group` and `light_overrides` are fallback-only. They are NEVER used when `zones` or `entities` are present. They exist solely for backward compatibility with older dashboard YAML.

**Editor impact**: `getConfigForm()` exposes both `entities` (multi-entity selector) and `zones` (object selector). It does NOT expose `light_group` or `light_overrides`. Legacy keys are invisible to the editor — if a user opens an old config in the editor, the legacy entities will be visible as empty `entities`/`zones` fields, and the card still renders from the legacy path.

### Other notable keys

| Key | In editor? | In setConfig? | Notes |
|-----|:---:|:---:|---|
| `subtitle` | No | Yes (L921) | Renders below card name. YAML-only, not exposed in editor. |
| `rows` | Yes (text) | Yes (L909-915) | Accepts `'auto'` → null, or number 1-6. Used for grid mode tile count limiting. |

---

## tunet_actions_card.js (lines 318-348)

### Actions source — variant-driven default substitution

```
1. config.actions[]  → explicit action array (when non-empty)
2. DEFAULT_MODE_ACTIONS  → used when variant='mode_strip' AND no explicit actions
3. DEFAULT_ACTIONS       → used when variant='default' AND no explicit actions
```

**Precedence rules (from setConfig lines 321-330):**

| Condition | Result |
|-----------|--------|
| `config.actions` is non-empty array | Use provided actions directly |
| `variant === 'mode_strip'`, no actions | Substitute `DEFAULT_MODE_ACTIONS` with `__MODE_ENTITY__` → `mode_entity` |
| `variant === 'default'`, no actions | Substitute `DEFAULT_ACTIONS` |

**Template substitution**: When using `DEFAULT_MODE_ACTIONS`, the template entity `__MODE_ENTITY__` in `state_entity` and `service_data.entity_id` is replaced with the configured `mode_entity` value (default: `input_select.oal_active_configuration`).

**Editor impact**: `getConfigForm()` exposes only `variant`, `mode_entity`, `compact`. The `actions[]` array is NOT in the editor — the entire rich action model (service, service_data, state_entity, active_when, active_when_operator, show_when, tap_action) is YAML-only.

**Why yaml-first is correct**: The action model supports arbitrary service domains (`light.turn_on`, `input_select.select_option`, `script.turn_on`), each with different `service_data` payloads. A visual editor can't meaningfully edit arbitrary service_data objects. The mode_strip variant with `__MODE_ENTITY__` substitution provides a useful default without YAML editing for the common case.

---

## tunet_status_card.js (lines 846-850)

### status_dot → dot_rules backward compatibility

```
LEGACY: config.tiles[].status_dot  (single string: color name)
CURRENT: config.tiles[].dot_rules  (array of {match, dot} objects)
```

**Precedence (line 846-850):**

| Condition | Result |
|-----------|--------|
| `status_dot` exists AND `dot_rules` does NOT exist | Convert: `dot_rules = [{ match: '*', dot: status_dot }]` |
| `dot_rules` exists (regardless of `status_dot`) | Use `dot_rules` directly |
| Neither exists | `dot_rules = null` |

**Key behavior**: `dot_rules` always wins when present. `status_dot` is only used as a backward-compatible shorthand that gets converted to the current format. The conversion is one-way — saving the config from the editor does NOT write back `status_dot`.

---

## tunet_light_tile.js (line 637)

### show_manual — runtime-only read, no setConfig normalization

```
config.show_manual  (boolean, default: true via !== false)
```

**Gap**: This key is read directly from `this._config` during render (line 637) but is NOT normalized in `setConfig()` (line 420-437 uses spread: `...config`). It IS the raw config value, not a normalized one.

**Impact**: If `show_manual` is set to `false`, the manual override indicator is hidden. If absent, it defaults to showing. This works because the spread operator in setConfig preserves all keys, but it means:
- The key is not validated or type-coerced
- It's not in `getConfigForm()` — invisible to editor
- It IS in the runtime config via spread — works but undocumented

**Recommendation**: Either add explicit normalization in setConfig (`show_manual: config.show_manual !== false`) or document as YAML-only with boolean semantics.

---

## Summary: Legacy Keys Across All Cards

| Card | Legacy Key | Current Key | Conversion | In Editor? |
|------|-----------|-------------|------------|:---:|
| lighting | `light_group` | `entities[]` | Single string → array | No |
| lighting | `light_overrides` | `zones[]` | Object entries → zone objects | No |
| lighting | `subtitle` | — | No replacement, YAML-only feature | No |
| status | `status_dot` | `dot_rules[]` | String → `[{match:'*', dot: value}]` | No |
| light_tile | `show_manual` | — | Not normalized, read via spread | No |
| actions | — | — | No legacy keys; defaults via variant | — |
| status | `tile_size: 'regular'` | `tile_size: 'standard'` | String substitution (L796) | Via editor |
