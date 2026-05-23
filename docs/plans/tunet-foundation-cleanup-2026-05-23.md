# Tunet Foundation Cleanup — Plan A

**Portfolio**: see `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
**Owner**: Mac, executed via `/claude-mem:do`
**Tranche tag**: β-plumbing / foundation
**Depends on**: nothing (parallel-safe with Plan E card hardening)
**Estimated effort**: 2-3 hours

## Intent

Land the prerequisite cleanups that all other plans (B-F) depend on:
- Bubble Card 3.2.1 server upgrade (3.1.1 → 3.2.1)
- Area registry cleanup (Entryway ghost, LR/Dining cross-contamination, floor structure)
- Dead-sensor triage (LR temp/humidity, Bedroom TV)
- Entity ID clarifications with Mac (entry main spot, etc.)

## Required reading

1. `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md` — portfolio overview
2. `/home/mac/HA/implementation_10/CLAUDE.md` — M1-M7
3. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/deploy_workflow_canary.md` — workflow contract
4. `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_tunet_dashboard_inventory.md`

## Phase A1: Bubble Card 3.2.1 server upgrade

**Steps**:

1. Confirm current version on server:
   ```bash
   sshpass -e ssh root@10.0.0.21 "head -5 /config/hacsfiles/Bubble-Card/bubble-card.js | head -3"
   ```
   Or query HACS via MCP `ha_hacs_repository_info` for "Bubble-Card".

2. Upgrade via HACS:
   - `ha_hacs_download` for "Bubble-Card" at version 3.2.1 (or latest stable).
   - Confirm new file at `/config/hacsfiles/Bubble-Card/bubble-card.js` reports 3.2.1.

3. Bump Lovelace resource cache version:
   - Find current resource: `/hacsfiles/Bubble-Card/bubble-card.js?hacstag=680112919321`
   - Update via WS `lovelace/resources/update` (use `update_tunet_v3_resources.mjs` pattern as template if needed).

4. Smoke test on existing Browser Mod popups:
   - Trigger an existing popup (alarm-edit) — confirm it still works (3.2 should be backward-compatible with Browser Mod-style invocations).
   - Trigger any existing Bubble Card popup if present — confirm it renders.

5. If 3.2.0's one-time migrator surfaces (standalone-popup migration prompt), let Mac review before accepting.

**Verification**:
- Server reports 3.2.1.
- Existing popups still work.
- No console errors in browser DevTools on `/tunet-overview/overview`.

**Out of scope**: Building new popups (Plan F).

**Commit**: This is a config-side change (HACS install + Lovelace resource bump), NOT a repo commit. Document the upgrade in `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` under a new "External Dependencies" section if not already there.

---

## Phase A2: Area registry cleanup

**Pre-flight**: Mac confirms these area decisions before starting:

1. **Entryway ghost area** — current state: exists, 0 entities. Options:
   - (a) Delete area. Move `light.entryway_lamp` (if it belongs there) into Living Room.
   - (b) Populate area. Assign `light.entryway_lamp`, any nearby presence sensor, etc.
2. **LR/Dining cross-contamination** — current state: devices like the Inovelli presence dimmer and Aqara FP2 appear in BOTH area searches. Confirm physical location: which devices are in Living Room vs Dining Room? Decide canonical assignment.
3. **Floors** — current state: 0 floors. Options:
   - (a) Add a single "Main Floor" floor; assign all 6 areas to it.
   - (b) Add "Upstairs" / "Downstairs" if applicable.
   - (c) Skip floors — Mac never needs floor-level navigation.

**Steps** (after Mac's decisions land):

1. **Apply area decisions** via MCP:
   - `ha_config_set_area` for any new areas (none expected — 6 areas already exist).
   - `ha_update_device` to reassign devices that need cleanup.
   - `ha_config_remove_area` for Entryway if Mac picked (a).

2. **Wire area climate sensors** (currently none set):
   - Living Room area: `temperature_entity_id = sensor.living_room_temperature`, `humidity_entity_id = sensor.living_room_humidity` (only if Phase A3 confirms these aren't dead — otherwise skip).
   - Dining Room area: `temperature_entity_id = sensor.dining_room_temperature`.
   - Master Bedroom area: `temperature_entity_id = sensor.bedroom_temp_humidity_sensor_temperature`, `humidity_entity_id = sensor.bedroom_temp_humidity_sensor_humidity`.
   - Kitchen area: `humidity_entity_id = sensor.kitchen_humidity` (no temp sensor exists yet — Plan B adds).

3. **Floors** (if Mac picked (a) or (b)):
   - `ha_config_set_floor` per floor.
   - `ha_config_set_area` to update each area's `floor_id`.

**Verification**:
- `ha_config_list_areas` returns the corrected inventory.
- Cross-contamination resolved: querying entities by area returns the expected set per Mac's confirmation.

**Commit**: None — area registry lives in HA's `.storage/`, not repo. Document the canonical area map in a new memory entry `reference_ha_area_inventory.md` for future agents.

---

## Phase A3: Dead-sensor triage

**Steps**:

1. **Living Room temp/humidity** (currently state=unknown):
   - `ha_get_entity` for `sensor.living_room_temperature` and `sensor.living_room_humidity`. Read full state including device_id, last_changed, attributes.
   - `ha_get_device` for the parent device. Confirm: is the device offline (Zigbee unreachable)? Is the device deleted? Is the entity orphaned?
   - Mac decides: re-pair the device, replace the device, or delete the entity if the device is permanently gone.

2. **Bedroom TV** (currently state=unknown):
   - Same diagnostic loop for the Samsung Q60 power/energy/channel sensors.
   - Mac decides: integration refresh, re-pair, or accept that TV sensors are flaky.

3. **Document outcomes** in `Dashboard/Tunet/Docs/visual_defect_ledger.md` under a new "Hardware / Device Health" section. Each sensor: device, last-known-good state, remediation taken or deferred.

**Verification**:
- Either: sensors now report state≠unknown (live values), OR document the gap with a follow-up action.

**Commit**: `docs(ha): record dead-sensor triage outcomes (LR temp/humidity, Bedroom TV)`.

---

## Phase A4: Entity ID clarification

**The "entry main spot" question is the load-bearing one.** Mac said in the goal: "auto turn off the entry main spot lights". Discovery couldn't uniquely identify the entity.

**Steps**:

1. Mac names the entity. Candidates from discovery:
   - `light.entryway_lamp` — Entry Table Lamp (mdi:lamp icon)
   - `light.living_room_spot_lights` — track spots over living/dining
   - `light.dining_room_spot_lights` — track spots over dining
   - `light.accent_spots_lights` — group of the above two
   - Something else entirely (e.g., a smart switch on a recessed can)

2. Once identified, confirm:
   - Is it currently in any auto-off automation? (grep `packages/*.yaml` for the entity ID)
   - What's the current OAL behavior for this entity?
   - What's Mac's desired trigger (time-based? presence-based? combination?)

**Verification**:
- Entity ID locked. Documented in this plan's section for Plan B to consume.

**Commit**: None this phase; informational only.

---

## Verification (Phase A overall)

- Bubble Card 3.2.1 active on server.
- Area registry cleaned per Mac's decisions.
- Dead sensors triaged.
- Entry main spot entity ID confirmed.
- All decisions documented for Plans B-F to consume.

## Out of scope

- New OAL mode (Plan B).
- ZEN32 redesign (Plan C).
- HomeKit (Plan D).
- Card hardening (Plan E).
- New dashboard (Plan F).
