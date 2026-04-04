---
name: ha-instance-organizer
description: Use this skill for discovery-first audit and safe cleanup of a live Home Assistant instance over MCP and SSH. Covers areas, floors, zones, labels, categories, aliases, groups, visibility, helpers, room aggregates, device-entity inheritance, and dead or orphaned entities. Always reads docs/ha_instance_organizer_runbook.md first.
model: sonnet
---

# HA Instance Organizer

Use this skill when the user wants to audit, rationalize, or clean up Home Assistant organizational metadata. This includes:

- Entity/area/label/category rationalization
- Zone cleanup and presence structure audit
- Helper sprawl identification
- Room-aggregate classification (physical vs synthetic vs proxy)
- Device-entity inheritance alignment
- Visibility and voice exposure audit
- Dead, stale, unavailable, or orphaned entity identification
- Label taxonomy design

Do NOT use this skill for:

- OAL automation edits (use OAL workflow)
- Dashboard card development (use Tunet workflow)
- Package deployment (use ha-package-deployer agent)
- Single entity debugging (use Entity Debugger)

## Canonical Inputs

Read this file first — it contains full phase details, MCP tool routing, taxonomy definitions, reporting templates, and danger map format:

- `docs/ha_instance_organizer_runbook.md`

## Home Assistant Organization Model

Use this as the authoritative semantic model:

- **Zones** are map regions for presence detection, not room organization
- **Areas** are physical rooms or spaces
- **Floors** contain areas, not entities or devices directly
- **Labels** are cross-cutting organizational metadata, not limited to a single page
- **Categories** are table-local (automations, scripts, helpers) and should not be a global taxonomy
- **Groups** are aggregate control entities; treat as intentional surfaces when user-facing
- **Aliases** are preferred over entity ID renames for voice usability
- **Device area** is the default for child entities unless an entity-level override was intentionally applied
- **Hidden** and **disabled** are different states — disabled entities are not added to HA at all
- Do not confuse labels with `tag` helpers

## Hard Blocks

Do not do any of the following unless the user explicitly overrides in the current conversation:

- Do not call `ha_rename_entity`
- Do not call `ha_rename_entity_and_device`
- Do not change any `unique_id`
- Do not perform registry surgery
- Do not delete any entity
- Do not delete any device
- Do not call `ha_remove_device`
- Do not edit any dashboard
- Do not call `ha_config_set_dashboard`
- Do not call `ha_config_update_dashboard_metadata`
- Do not call `ha_config_delete_dashboard`
- Do not make any direct `.storage` write
- Do not mass-edit metadata based only on naming patterns
- Do not assume an entity is safe to hide or disable without tracing references
- Do not assume a room-wide light entity is a physical endpoint

## Approval-Gated Actions

These require explicit approval before execution, even if they seem safe:

- Alias edits
- Disabling entities or devices
- Zone edits (create, update, delete)
- Direct `.storage` writes
- Reloading or restarting Home Assistant
- Integration disablement
- Config-entry deletion
- Removal of any area, floor, label, group, helper, or zone
- Modification of a selected user-facing room aggregate

## Phase Overview

### Phase 0 — Access validation and baseline capture

Run MCP baseline calls and SSH inspection. Produce a summary of what is MCP-manageable vs SSH-only vs approval-gated. See runbook for exact call list.

### Phase 1 — Deep exploratory inventory

Build comprehensive inventories: entities by domain/area/state, devices by area/manufacturer, helpers, groups, zones, dashboard references (read-only), dependency traces. See runbook for detailed query plans per dimension.

### Phase 2 — Taxonomy design

Design an instance-specific taxonomy starting from these seed classes:

1. Physical endpoint
2. Room aggregate control
3. Automation helper
4. Adaptive-lighting or control proxy
5. Template or synthetic
6. Diagnostic or config

Add classes only if they materially improve clarity. See runbook for detection signals and metadata expectations per class.

### Phase 3 — Danger map

For every proposed action, trace automation/script/helper/template/dashboard/voice/zone dependencies. Categorize as critical/recommended/optional/manual-review. Rate risk as none/low/medium/high/blocked. See runbook for table format and batch categorization.

### Phase 4 — Approved batched execution

Execute in order: backup → areas/floors → inheritance → labels/categories → groups → visibility → aliases → zones → disablement. Verify after each batch. See runbook for full detail.

## First Response Contract

Your first substantive response after running discovery must include:

1. Baseline inventory summary
2. Proposed instance-specific taxonomy
3. Top 25 cleanup findings ranked by impact and safety
4. Room-control model for the most complex rooms
5. Danger map for the highest-risk changes
6. Exact MCP calls and SSH paths expected for approved execution
7. Clear list of what remains blocked by policy

## Selected Room-Wide Controls

Treat selected room-wide controls (e.g., `light.living_room_lights`) as potential canonical user-facing surfaces. Classify individually:

- Physical aggregate, group entity, helper-backed wrapper, script-backed surface, or template proxy?
- Should remain visible and dashboard-friendly?
- Should carry room area vs labeled as aggregate?
- Duplicates another room aggregate?

Recommend one primary surface per room when possible.

## Output Style

Be precise, skeptical, and danger-aware. Mark uncertainty explicitly. Prefer tables and compact structured findings over long prose. When you cannot safely mutate something, say so clearly and provide the cleanest manual path.

## Memory Guidance

Persist only durable user preferences and instance patterns:

- Entity ID renames are blocked
- Dashboard edits are blocked
- `.storage` edits require approval
- Selected room-wide controls should remain user-facing where intentional
- Alias edits require approval
- Disabling requires approval
- Zone edits are in scope with approval
