# HA Instance Organizer — Operational Runbook

This runbook is the detailed execution reference for the `ha-instance-organizer` skill. The skill's `SKILL.md` provides trigger logic, safety rails, and phase overview. This file provides the full operational detail for each phase.

---

## Phase 0 — Access Validation and Baseline Capture

Use MCP first, SSH second.

### MCP baseline calls

Run these before any interpretation:

| Call | Purpose |
|------|---------|
| `ha_config_info` | HA version, components, unit system |
| `ha_get_overview` | High-level instance summary |
| `ha_get_system_health` | Integration health, resource usage |
| `ha_config_list_areas` | All areas |
| `ha_config_list_floors` | All floors |
| `ha_config_get_label` | All labels |
| `ha_config_list_groups` | All groups |
| `ha_get_zone` | All zones |
| `ha_get_integration` | All integrations |
| `ha_config_list_helpers` | All helpers |

### SSH inspection checklist

- Inspect repo layout and identify YAML-managed vs UI-managed assets
- Locate custom components and custom helpers
- Inspect `.storage` read-only if needed to understand categories, storage-mode items, or metadata not exposed by MCP
- Identify whether a git repo exists
- Create no changes

### Phase 0 output

Produce a baseline summary:

- What surfaces are available
- What is MCP-manageable vs SSH-only vs approval-gated
- Integration count, entity count, device count, area count, floor count, label count, zone count, helper count, group count

---

## Phase 1 — Deep Exploratory Inventory

Build the deepest possible picture before proposing any change.

### 1.1 Entity and device inventory

Use: `ha_search_entities`, `ha_get_entity`, `ha_get_state`, `ha_get_states`, `ha_get_device`, `ha_get_integration`, `ha_get_entity_exposure`

Build inventories for:

- All entities by domain
- All entities by area
- All unassigned entities
- All hidden entities
- All disabled entities
- All entities with aliases
- All exposed entities
- All entities with `entity_category` when available
- All devices by area and manufacturer
- All entities with no device
- All devices with suspicious entity sprawl
- All entities that appear to be room aggregates
- All entities that appear to be helpers or proxies

### 1.2 History, noise, and dead-entity analysis

Use: `ha_get_history`, `ha_get_statistics`, `ha_get_logbook`

Distinguish:

- Truly stale or unavailable entities
- Noisy entities with high churn
- Diagnostic entities with little user value
- Entities rarely used but still important
- Aggregates or helper controls that are actively used and should remain visible

### 1.3 Dependency and reference tracing

**You must not recommend disablement, hiding, area removal, or zone changes until references are traced.**

Use: `ha_deep_search`, `ha_config_get_automation`, `ha_config_get_script`, `ha_get_automation_traces`, `ha_eval_template`

Also use SSH grep to search:

- YAML automations
- YAML scripts
- Packages
- Template definitions
- Custom components
- Any reference to zones, labels, areas, helpers, room aggregates, and likely canonical room controls

### 1.4 Read-only dashboard dependency tracing

Dashboard edits are off-limits, but dashboard references are not.

Use read-only only: `ha_config_get_dashboard`, `ha_dashboard_find_card`, `ha_get_card_types`, `ha_get_card_documentation`, `ha_get_dashboard_guide`

Understand:

- Which entities are surfaced on dashboards
- Which room aggregates appear to be intentional primary controls
- Which hidden candidates are actually visible in cards
- Which areas are relied on by area cards or overview surfaces

### 1.5 Helpers, groups, templates, and synthetic control surfaces

Use: `ha_config_list_helpers`, `ha_get_helper_schema`, `ha_config_list_groups`, `ha_get_integration`, `ha_eval_template`

Map:

- Input helpers (`input_boolean`, `input_number`, `input_select`, `counter`, `timer`, `schedule`)
- Groups
- Template helpers
- Utility meters
- Statistics and derivative helpers
- Filter, threshold, min_max, trend, and integration helpers
- Adaptive-lighting and similar control entities
- `switch_as_x` or similar wrappers
- Script-backed control surfaces if present

### 1.6 Zones and presence structure

Use: `ha_get_zone`, `ha_search_entities`, `ha_get_state`/`ha_get_states`, `ha_deep_search`, `ha_config_get_automation`, `ha_config_get_script`, `ha_config_get_dashboard`

Audit:

- Zone names and radii
- Zone overlap
- Person and device_tracker relationships
- Automations or scripts that reference zones
- Map/dashboard references
- Zones that duplicate areas or act as pseudo-rooms

---

## Phase 2 — Taxonomy Design

Design an instance-specific taxonomy from the live instance. Start from these seed buckets but add additional classes only if they materially improve clarity.

### Taxonomy class definitions

#### Physical endpoint

Usually a hardware-backed entity or device endpoint.

Detection signals:
- Backed by a real device
- Exposed by a hardware integration
- Represents real sensing or actuation
- Should often inherit from the parent device area

Metadata expectations:
- Should carry device area (inherited)
- Should carry function labels (lighting, climate, etc.)
- Usually visible
- Often voice-exposed

#### Room aggregate control

Usually a same-domain aggregate or canonical room control surface.

Detection signals:
- Light group, group entity
- Template light or switch acting as a room surface
- Script-backed room action surface
- Pluralized or collective room semantics
- Actively used on dashboards or voice surfaces

Metadata expectations:
- Should carry room area when it is the intentional control surface
- Should carry an implementation label (aggregate)
- Should remain visible and dashboard-friendly
- One canonical surface per room preferred

#### Automation helper

Usually an operational helper, not a real device endpoint.

Detection signals:
- `input_boolean`, `input_number`, `input_select`, `counter`, `timer`, `schedule`
- Control-only state used by automations

Metadata expectations:
- Usually needs function labels more than room assignments
- Usually hidden from user dashboards
- Not voice-exposed unless intentionally user-facing
- Area assignment only if the helper is an intentional room surface

#### Adaptive-lighting or control proxy

Usually a control-layer entity that should not be mistaken for a room endpoint.

Detection signals:
- Adaptive-lighting switches or related entities
- Control selects or numbers
- Circadian controls
- Proxy surfaces that influence another device set

Metadata expectations:
- Should be hidden or specially labeled
- Should not carry room area (use function labels instead)
- Not voice-exposed
- Implementation label: proxy

#### Template or synthetic

Usually a derived entity, synthetic control, or calculated view.

Detection signals:
- Template integration, derivative, statistics, trend, threshold
- Utility meter, filter, integration helper
- Group-like wrapper without real hardware

Metadata expectations:
- Needs implementation labels (template, synthetic, derived)
- May need function labels
- Area assignment only if it is the intentional room surface
- If it is the room surface, classify as room aggregate instead

#### Diagnostic or config

Usually not a primary user-facing surface.

Detection signals:
- `entity_category` diagnostic or config
- RSSI, firmware, battery voltage internals
- Identify buttons, config toggles
- Maintenance-only controls

Metadata expectations:
- Hide candidates first, disable candidates second
- Not voice-exposed
- Should not clutter room views
- Area inherited from device is acceptable but visibility should be restricted

### Per-entity capture fields

For every entity or device class you classify, capture:

| Field | Description |
|-------|-------------|
| Primary class | One of the taxonomy classes above |
| Confidence | High / Medium / Low |
| Why | Evidence for classification |
| User-facing | Yes / No |
| Should carry area | Yes / No / Inherited |
| Should inherit from device | Yes / No / N/A |
| Labels recommended | List of labels |
| Visibility | Visible / Hidden / Disable candidate |

---

## Phase 3 — Danger Map

Produce a danger-aware map before any write recommendation.

### Dependency trace checklist

For every proposed action, trace:

- [ ] Automation references
- [ ] Script references
- [ ] Helper dependencies
- [ ] Template dependencies
- [ ] Dashboard references (read-only)
- [ ] Area card or overview dependence
- [ ] Voice exposure and alias implications
- [ ] Zone-based presence implications
- [ ] Device-to-entity inheritance side effects
- [ ] Hidden vs disabled behavioral impact

### Finding categories

| Category | Meaning |
|----------|---------|
| Critical | Must address — active breakage or high risk |
| Recommended | Should address — improves clarity or maintainability |
| Optional | Nice to have — low impact |
| Manual review | Cannot be automated safely — needs human judgment |

### Risk levels

| Risk | Meaning |
|------|---------|
| None | Pure metadata, no behavioral impact |
| Low | Metadata change, minor inheritance shift |
| Medium | Visibility change, area reassignment with dashboard impact |
| High | Disablement, zone edit, integration change |
| Blocked | Violates hard blocks — cannot proceed |

### Danger map table format

| Item | Current state | Proposed change | Why | Dependencies | Risk | MCP calls | Approval required |
|------|---------------|-----------------|-----|--------------|------|-----------|------------------|

### Batch categorization

- **Safe after approval**: Low/None risk, dependencies traced, single MCP call
- **Needs extra approval**: Medium risk, multiple dependencies, or touches user-facing surfaces
- **Manual review only**: Cannot be automated, needs human judgment, or evidence is weak
- **Blocked by policy**: Violates hard blocks

---

## Phase 4 — Approved Batched Execution

### Pre-execution

1. Create a backup: `ha_backup_create`
2. SSH file backup if config files are involved

### Execution order

Apply changes in small batches, in this order:

1. Areas and floors
2. Device/entity inheritance cleanup
3. Labels and categories
4. Groups and room aggregates
5. Visibility (hiding)
6. Aliases and exposure (if separately approved)
7. Zone edits (if separately approved)
8. Disablement (if separately approved)

### Post-batch verification

After each batch:

- Re-query touched objects
- Re-run focused dependency checks
- Confirm no broken references
- Run `ha_check_config` if files changed
- Use `ha_reload_core` only if needed and approved

### Post-batch reporting

For each batch, report:

- What changed
- What did not change
- What remains risky
- What needs follow-up

---

## MCP Tool Routing Map

### Baseline and health

- `ha_config_info`
- `ha_get_overview`
- `ha_get_system_health`

### Entity inventory and metadata

- `ha_search_entities`
- `ha_get_entity`
- `ha_get_state`
- `ha_get_states`
- `ha_get_entity_exposure`

### History, usage, and churn

- `ha_get_history`
- `ha_get_statistics`
- `ha_get_logbook`

### Live reasoning and reference search

- `ha_eval_template`
- `ha_deep_search`

### Device and integration registry

- `ha_get_device`
- `ha_update_device` (approval-gated)
- `ha_get_integration`
- `ha_set_integration_enabled` (approval-gated, usually out of scope)
- `ha_delete_config_entry` (approval-gated, usually out of scope)

### Automations and scripts

- `ha_config_get_automation`
- `ha_config_set_automation` (approval-gated)
- `ha_get_automation_traces`
- `ha_config_get_script`
- `ha_config_set_script` (approval-gated)

### Helpers and synthetic entities

- `ha_config_list_helpers`
- `ha_config_set_helper` (approval-gated)
- `ha_config_remove_helper` (blocked in first pass)
- `ha_get_helper_schema`
- `ha_create_config_entry_helper` (approval-gated)

### Organization primitives

- `ha_config_list_areas` / `ha_config_set_area` / `ha_config_remove_area` (remove blocked without approval)
- `ha_config_list_floors` / `ha_config_set_floor` / `ha_config_remove_floor` (remove blocked without approval)
- `ha_config_get_label` / `ha_config_set_label` / `ha_config_remove_label` (remove blocked without approval)
- `ha_config_list_groups` / `ha_config_set_group` / `ha_config_remove_group` (remove blocked without approval)

### Zones

- `ha_get_zone`
- `ha_create_zone` (approval-gated)
- `ha_update_zone` (approval-gated)
- `ha_delete_zone` (blocked unless explicitly approved)

### Dashboards (read-only only)

- `ha_config_get_dashboard`
- `ha_dashboard_find_card`
- `ha_get_card_types`
- `ha_get_card_documentation`
- `ha_get_dashboard_guide`

### Safety, backup, and validation

- `ha_backup_create` (before first approved write)
- `ha_check_config` (after file changes)
- `ha_reload_core` (prefer over restart)
- `ha_restart` (approval-gated)

---

## Forbidden Call List

Unless the user explicitly changes the rules:

- `ha_rename_entity`
- `ha_rename_entity_and_device`
- `ha_remove_device`
- `ha_config_set_dashboard`
- `ha_config_update_dashboard_metadata`
- `ha_config_delete_dashboard`

Also: no delete-style call for entities, devices, areas, floors, labels, groups, helpers, or zones unless the user explicitly approves that specific removal.

---

## SSH Responsibilities

Use SSH for tasks MCP cannot cover:

- Grep across YAML, packages, and custom components
- Inspect `.storage` metadata read-only
- Identify custom template logic
- Detect source-of-truth files
- Create file-level backups before approved edits
- Create git commits or diffs if the repo is under version control
- Inspect logs or config fragments that explain odd metadata patterns

Do not edit `.storage` without approval.

---

## Reporting Templates

### Executive summary

| Metric | Count |
|--------|-------|
| Total entities | |
| Total devices | |
| Areas | |
| Floors | |
| Labels | |
| Groups | |
| Zones | |
| Helpers | |
| Top risks | |
| Top opportunities | |

### Taxonomy proposal

| Class | Count | Example entities |
|-------|-------|------------------|
| Physical endpoint | | |
| Room aggregate control | | |
| Automation helper | | |
| Adaptive-lighting proxy | | |
| Template or synthetic | | |
| Diagnostic or config | | |

### Room-control model (per complex room)

| Aspect | Value |
|--------|-------|
| Physical endpoints | |
| Canonical room aggregate | |
| Duplicate/secondary controls | |
| Internal helpers and proxies | |
| Visibility recommendation | |
| Area and label recommendation | |

### Metadata misalignment report

- Device/entity area misalignment
- Label duplication
- Category duplication
- Entity overrides that should be removed
- Unsupported cleanup dimensions
- Items needing manual review

### Recommended batches

| Batch | Category | Items | Risk | Approval |
|-------|----------|-------|------|----------|
| 1 | Safe after approval | | Low | Standard |
| 2 | Needs extra approval | | Medium | Explicit |
| 3 | Manual review only | | Varies | Human judgment |
| 4 | Blocked by policy | | N/A | Policy override required |

---

## Cleanup Dimension Quick Reference

### Zones

- Treat as presence regions, not rooms
- Audit names, radii, overlap, person/tracker relationships
- Edit only with approval via `ha_update_zone` or `ha_create_zone`
- Never delete without explicit approval and confirmed no references

### Areas and floors

- Areas = physical spaces, floors = parent grouping
- Look for duplicates, empty areas, missing floors, misassigned helpers
- Avoid assigning helpers/proxies to areas unless intentionally user-facing

### Device-entity inheritance

- Device metadata is default, entity overrides are exceptional
- Look for entity area overrides conflicting with parent device
- Sub-entities needing different functional labels but not different location

### Labels

- Main cross-cutting organizational system
- Keep taxonomy small: function, implementation, lifecycle, protocol, selective place overlay
- No duplicate labels differing only in casing or pluralization

### Categories

- Page-local organization only, not a global taxonomy
- Short and table-friendly
- Primarily for automations, scripts, scenes, helpers

### Groups and room aggregates

- First-class audit objects
- One primary room aggregate per room preferred
- Separate user-facing from internal helpers

### Visibility

- Hiding != disabling (disabled entities not added to HA at all)
- Prefer hiding before disablement
- Never disable without dependency tracing
- Keep selected room-wide controls visible

### Aliases

- Preferred over entity ID renames for voice usability
- Short, natural aliases for exposed entities
- Approval-gated

### Helpers and synthetics

- Separate layer from physical devices
- Usually need function labels more than room assignments
- If synthetic entity is the intentional room surface, classify as room aggregate
