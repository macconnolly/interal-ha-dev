# Backlog: Light Entity Management Architecture (L1)

**Created**: 2026-05-26 6:40pm MDT
**Status**: PLANNING-STAGE BACKLOG (no implementation; captures requirements + open architectural questions for a future dedicated tranche)
**Origin**: Mac flagged this as a backlog item during S.1 planning (2026-05-26 ~6:00pm):
> "We need a better approach to how we add and manage light entities globally (e.g, if we move a light, rename an entity, replace a light., etc. and getting all entity references updated is hard and easy to mess up; so either a documented process, or a better architecture"

Reinforced during S.2 sensor inventory when the existing room light groups were found to have drift/overlap defects from past entity moves (logged in `Dashboard/Tunet/Docs/visual_defect_ledger.md`).

---

## The Problem in Concrete Terms

When Mac moves, renames, or replaces a physical light:
1. The entity_id may change (HA registry change)
2. Several places in the configuration reference the entity_id directly:
   - Light group definitions (`packages/oal_lighting_control_package.yaml` ~20 groups)
   - Adaptive Lighting switch configurations (the `lights:` list per AL zone)
   - Scenes (`packages/tunet_scenes.yaml` — N scenes referencing entity_ids)
   - Automations (OAL automations + room automations)
   - Dashboards (`Dashboard/Tunet/*-config.yaml` — popups, cards, tap_actions)
   - HomeKit exposure (`packages/tunet_homekit.yaml`)
   - Custom card configurations
3. Updating each reference manually is error-prone. Missing one creates silent drift (sensors lie, automations target nothing, scenes leave lights orphaned).

**Real example from the system**: `light.master_bedroom_corner_accent_govee` was moved from master bedroom to office per Campaign A3 (per `~/.claude/plans/office-corner-accent-relocation.md`). After the move:
- ✓ Added to `office_lights` group + `switch.adaptive_lighting_office` lights list
- ✗ NOT removed from any master bedroom references that may have existed
- ✗ NOT removed from any scenes that still trigger master-bedroom-style behavior

Net: drift accumulates. The room light groups currently double-count and misclassify members because of these accumulated moves.

---

## Architectural Questions to Answer

### Q1: HA Areas + `area_id` as the canonical room mapping?

HA 2024+ has a first-class **area** concept. Every entity can be assigned an `area_id`. The entity registry tracks this. Templates can filter by area:

```jinja
{{ states.light | selectattr('attributes.area_id', 'eq', 'living_room') | list }}
```

OR using the newer (HA 2024+) `area_entities` helper:
```jinja
{{ area_entities('living_room') | select('match', '^light\.') | list }}
```

**Pro**: single source of truth (the entity registry). Move a light to a different room → change one `area_id`. All consumers update automatically.

**Con**: requires consumers to use the area-based filter pattern. Existing groups are static yaml lists; migration is non-trivial. Also: area-based filtering loses any "logical" grouping (e.g., "accent_spots" is two lights across living + dining; not an area).

### Q2: Auto-generated groups from area_id at template-evaluation time?

Combine Q1 + the existing group pattern: generate room-light-groups dynamically from area_id at HA startup. No more static `entities:` lists; the group's membership is whatever's currently in that area.

Implementation: HA's template integration supports auto-generating entity lists. OR: a small Python custom_component that reads the registry on startup and creates HA groups via the websocket API.

**Pro**: matches Q1's single-source-of-truth + preserves the room-group consumer interface (existing sensors/automations don't need to change).

**Con**: more moving parts. New light goes into wrong area → silently appears in wrong room group. Need a discipline for setting area_id correctly when adding lights.

### Q3: A "light identity registry" abstraction layer?

Introduce a layer of stable "logical names" that map to physical entity_ids. Example:
```yaml
light_registry:
  living_room.couch_lamp: light.living_room_couch_lamp_zigbee_xyz
  living_room.floor_lamp: light.living_room_floor_lamp_hue_abc
  ...
```

Every consumer references the logical name. The registry is the only place physical entity_ids appear. Renaming a physical entity → change one row.

**Pro**: maximum decoupling. Logical names are stable across hardware replacements.

**Con**: introduces a layer HA doesn't natively understand. Requires custom_component to translate logical names → physical at lookup time. Heavy upfront.

### Q4: Documented process instead of architecture?

Skip the architecture; document a checklist for "when you move/rename/replace a light, update these N places." Make the documentation discoverable + the checklist mechanical.

**Pro**: zero implementation cost. Works with HA as-is.

**Con**: still error-prone. Mac will sometimes miss a step. Documentation rots if not maintained.

### Q5: Hybrid — Q1 (areas) + Q4 (documented process for legacy groups)?

Use HA's area_id as the SOURCE OF TRUTH for "what room a light is in." Migrate room sensors / dashboards to use area-based filters going forward. Keep the static legacy groups for now, with documented deprecation timeline. New lights only need area_id set; old groups are deprecated but functional.

**Pro**: pragmatic transition path. Doesn't require touching everything at once.

**Con**: dual systems coexist for a transitional period.

---

## Research Questions for the Future Tranche

1. **HA 2026 native area_id capabilities** — what's the best-in-class pattern for "all lights in living room" templates? `area_entities()` vs `area_id` attribute filter vs `device_attr('area_id')` — which is most reliable across light platforms (Zigbee, Hue, Matter, Govee)?

2. **Per-room sensors via area_id** — can the existing `sensor.lights_on_<room>` series be rewritten to compute from area_id without losing functionality? What about per-room brightness/color-temp aggregates (deferred from S.1e)?

3. **Custom card consumer migration** — the Tunet cards (lighting, rooms, etc.) accept entity lists as config. Can they also accept an area_id parameter and look up lights from there? OR is that a card-architecture decision separate from the sensor architecture?

4. **OAL integration impact** — Adaptive Lighting switches have hardcoded `lights:` lists. Can AL be configured to use area-based light selection, or does it need the explicit list? Would need to read AL custom_component docs.

5. **Scenes + automations** — same question. Can scenes target "all lights in living room" without hardcoding entity_ids?

6. **Migration path** — if we shift to area-based, how do we audit existing dashboards/automations for stale entity_id references? Sub-agent task or static analysis script?

7. **HACS solutions** — any community integration that solves this pattern? Spook has some entity-management features; is there anything more pointed at "light groups by area"?

---

## Scope Candidates for the Future Tranche

Listed roughly in order of pragmatism:

**Option A (small, ~2h)**: Document the manual checklist. Audit current group drift. Fix the broken groups (deduplicate, remove misplaced members, complete master bedroom). Add a `Dashboard/Tunet/Docs/light_entity_management_runbook.md` with steps for the common operations (move, rename, replace, add). Accept Q4 trade-off; no architecture change.

**Option B (medium, ~5-6h)**: Migrate sensors to area-based filtering. Q1 + Q2 hybrid. Keep existing groups as deprecated-but-functional during transition. Auto-generate new room sensors via area_id (`sensor.lights_on_<area>` regenerated at startup from registry). Document the area_id assignment discipline.

**Option C (large, ~10-15h)**: Custom Python component (`custom_components/tunet_lights/`) that introduces the logical name registry (Q3). All consumers reference logical names. Implementation includes config flow, websocket bridge for HA group creation, migration script for existing entity refs. The "v14 endgame" path.

**Option D (variable)**: Punt to HA 2027+ — wait for HA to mature its area-based primitives further. Maintain current state with periodic manual cleanup.

---

## Next Move (when this tranche is picked up)

1. Research questions Q1-Q7 — likely dispatch sub-agent
2. Empirical baseline — full inventory of light entity references across all packages + dashboards + cards
3. Mac chooses Option A/B/C/D per pragmatism vs longevity trade-off
4. Detailed plan with adversarial review
5. Execute

---

## Cross-References

- Current drift inventory: `Dashboard/Tunet/Docs/visual_defect_ledger.md` (room light group membership drift entry)
- Office corner_accent migration: `~/.claude/plans/office-corner-accent-relocation.md` (Campaign A3 — example of a successful light move that updated some but not all consumers)
- Existing room groups: `packages/oal_lighting_control_package.yaml:86-154`
- Existing room sensors: `packages/tunet_room_sensors.yaml`
- Rollup of tranches: `docs/plans/next-tranche-rollup-2026-05-26.md`
