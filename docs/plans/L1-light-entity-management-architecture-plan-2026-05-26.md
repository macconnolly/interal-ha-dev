# L1 — Light Entity Management Architecture Plan

**Created**: 2026-05-26 ~7:35pm MDT
**Last revised**: 2026-05-26 ~9:20pm MDT (room-aggregation collapse approved; all decisions closed)
**Status**: **STAMPED** — all 10 open decisions in §9 closed. Plan is durable on disk at this path. Ready for execution starting at P0 in a future session (or this one continued, at Mac's call).
**Authority**: Backend metadata architecture for light entities; dashboard/card surface migration is OUT OF SCOPE (owned by the parallel preview-dashboard agent).
**Source**: Backlog `docs/plans/L1-light-entity-management-architecture-backlog-2026-05-26.md` + kickoff `docs/plans/L1-kickoff-prompt-2026-05-26.md`
**Empirical baseline**: Verified 2026-05-26 via direct file reads, live HA MCP queries, and three parallel sub-agents (package inventory, dashboard inventory, HA 2026.5 capability research).

---

## 1. Problem Statement

When Mac moves, renames, or replaces a physical light, several places in the configuration reference that light's entity_id directly. Updating each reference manually is error-prone. Missing one creates silent drift — sensors lie, automations target nothing, scenes leave lights orphaned. Current state has accumulated drift from past migrations (Campaigns A2/A3, in-flight Campaign B) that surfaced during S.2's sensor inventory.

L1's job: establish a registry-driven backend so that moving/renaming/replacing a light is a one-place operation, with the rest of the package layer regenerating mechanically at deploy time.

L1 is NOT trying to migrate dashboards or cards. That work is owned by the preview-dashboard agent. L1's job is to make the backend a single source of truth that future card work can read from.

---

## 2. Empirical Baseline (verified 2026-05-26)

### 2.1 Universe of physical lights — 20 entities (all AL-managed after L1)

The canonical universe is 20 physical lights across 6 areas (living_room, dining_room, kitchen, master_bedroom, office, entryway) and 5 hardware platforms (Hue, Lutron Caseta, Matter, Govee local, zigbee2mqtt/MQTT).

**Pre-L1 state**: `light.all_adaptive_lights` (`packages/oal_lighting_control_package.yaml:64-85`) has 19 members. `light.office_table_lamp` is in `office_lights` group but NOT in any AL switch — historically free-running.

**Post-L1 state** (per Mac decision 2026-05-26 ~8:30pm MDT): `light.office_table_lamp` joins the office AL zone. After L1, all 20 lights are AL-managed; `light.all_adaptive_lights` expands to 20 members. **This is an intentional behavior change** — `office_table_lamp` will adapt at the office zone's 2700K pin + brightness curve, no longer free-running.

### 2.2 Reference matrix — blast radius

| Surface | Direct entity_id refs | Group-mediated refs | Card-source refs |
|---------|----------------------|---------------------|------------------|
| Packages | ~462 in `oal_lighting_control_package.yaml` alone (95% of total); ~510 across all packages | varies | n/a |
| Dashboards (OUT OF L1 SCOPE) | ~508 (70%) | ~218 (30%) | n/a |
| Card source (OUT OF L1 SCOPE) | n/a | n/a | 6 |

L1's actionable blast radius is the package side: ~390 refs, of which the heaviest concentrations are:
- `light.living_column_strip_light_matter` — 41 refs (column RGB lifecycle cluster)
- `light.master_bedroom_column_accent` — 39 refs (same cluster, plus Campaign B target)
- `light.dining_column_strip_light_matter` — 40 refs (same cluster)
- `light.entryway_lamp` + `light.living_room_credenza_light` — 24 refs each

### 2.3 Current metadata state (HA registry, verified 2026-05-26)

| Metric | Count | Notes |
|--------|-------|-------|
| area_id correctly set | 5/20 | entryway_lamp, living_room_couch_lamp, living_room_credenza_light, master_bedroom_corner_accent_govee (post-A3), master_bedroom_column_accent |
| area_id actively wrong | 3/20 | living_room_floor_lamp→dining_room, office_desk_lamp→living_room (stale Campaign A), `light.master_presence`→`bedroom` (ghost area; only `master_bedroom` exists in registry) |
| area_id null | 12/20 | most kitchen lights, most office lights, several living room lights |
| Labels present | 19/20 | every light except office_bed_left/right has at least one room label; al_group_* labels partially in place |
| Friendly name null | 7/20 | credenza, spots (LR + dining), kitchen pendants/undercabinet/main, office_bed_right |
| Icon null | 11/20 | most ceiling + accent lights |

### 2.4 Drift inventory verified (file-level)

- **Two member-equivalent Living Room groups**: `living_room_lights_group` (lines 87-98) and `all_living_room_lights` (lines 107-118). Identical 9-light memberships, different entity_ids. The legacy one has **zero consumers** (verified by Agent A grep) — pure orphan.
- **Three other fully orphaned groups**: `hue_lamps_only`, `overhead_lights`, and the legacy `living_room_lights_group` above. All defined, zero consumers.
- **Three-way nesting drift**: `all_living_room_lights` contains `light.column_lights` which contains `master_bedroom_column_accent`. Any "lights in living room" expansion via these groups counts a master bedroom light as living-room.
- **Semantic misclassifications**: `all_dining_room_lights` contains `light.living_room_credenza_light` (drift; physically LR) and `light.living_room_corner_accent` (drift; physically LR).
- **Campaign A3 residue**: `light.master_bedroom_corner_accent_govee` (entity_id still has `master_bedroom_` prefix despite being moved to office) still appears in `light.room_bedroom_all` (`tunet_room_light_groups.yaml:62`); also still carries `al_group_master_adapt` label (stale).
- **Campaign A residue**: `light.office_desk_lamp` still has `area_id: living_room` AND `living_room` label despite Campaign A move.
- **Live-only consumer references** (live HA but not in YAML repo): `Configuration/configuration.yaml:144-153` references `scenes/`, `groups/`, `automations.yaml`, `automations_manual/` directories that don't exist locally. `tunet_homekit.yaml` excludes `light.all_lights` and `light.living_room_main_group_disabled` — neither defined in repo. P0 reconciles these.

### 2.5 Critical constraints from research (Agent C — HA 2026.5)

1. **`area_entities()`** is the HA-native primitive for "all entities in area X" (introduced HA 2021.11, mature in 2026.5). Rolls up from device → entity (single area assignment per device covers all its entities).
2. **`label_entities()`** is the HA-native primitive for "all entities with label X" (introduced HA 2024.4). Does NOT roll up device → entity — labels must be applied at entity level.
3. **Group entities pass `area_entities()` filters**. Must filter with `state_attr(eid, 'entity_id') is none` to exclude groups from "physical lights in area X" queries. **Footgun if forgotten.**
4. **`label_id` as service-call target has an unresolved upstream bug** ([core#115608](https://github.com/home-assistant/core/issues/115608)). P0 includes an empirical test before plumbing depends on it.
5. **AL `lights:` config schema accepts entity_id strings only** ([basnijholt/adaptive-lighting:const.py:184 uses `cv.entity_ids`](https://github.com/basnijholt/adaptive-lighting)). Cannot accept area_id, label_id, templates, or (semantically) group references. **Mac's lived experience confirms: AL behaves poorly when given group references vs explicit single-entity lists.** L1's path is pre-render-at-deploy: deploy script reads label_entities() and emits explicit entity_id lists into the AL YAML.
6. **Scenes encode entity_ids structurally** — cannot target by area/label at definition time. L1 leaves scenes static (per Mac), with Spook providing missing-entity monitoring.
7. **HA core does not support label intersection** in service targets. The composability is template-side only: `area_entities('living_room') | select('in', label_entities('al_group_hue_adapt'))`.

### 2.6 In-flight migrations folded into L1

- **Campaign A (office area onboard + corner_accent relocation)** — A0-A3 complete per `~/.claude/plans/office-corner-accent-relocation.md`. L1's P1 metadata cleanup catches the residue: area_id correction on office_desk_lamp, stale label removal on corner_accent_govee, friendly_name normalization.
- **Campaign B (column_accent → column_lights AL + RGB lifecycle)** — pending; ~6-8h of work detailed in same plan. L1's P6 folds Campaign B execution into L1's timeline after the metadata foundation is in place. The campaign's existing plan stays as authority for implementation detail; L1 owns the calendar slot and the integration with the registry-driven approach.

---

## 3. Recommendation: Option B+ (areas + labels), backend-only scope

### 3.1 Architecture summary

- **Three orthogonal axes**:
  - **Room** — `area_id` set on the *device* (rolls up to all its entities for free)
  - **Function/zone** — labels at entity level (OAL zone semantics: `oal_main_living`, `oal_accent_spots`, etc.)
  - **Platform** — labels at entity level (`platform_hue`, `platform_matter`, etc.) for platform-aware behavior
- **Source of truth**: the HA entity registry (areas + labels) is canonical. Light groups + AL switch `lights:` lists are GENERATED from registry queries at deploy time.
- **Per-light value blocks** (mode brightness in `configuration_manager`, OAL CCT pins, Work-mode automation, bed color window) stay direct entity_id references. They COULD technically be regenerated from labels-as-tier-encoding, but they **SHOULD NOT BE** — these are artistic decisions where the encoded value IS Mac's lived preference, not derivable from membership metadata. Per S8.5 of v2 review.
- **AL `lights:` lists in final YAML stay as explicit entity_id arrays** (honoring Mac's "AL behaves poorly with groups" experience and the upstream `cv.entity_ids` schema). Pre-render is a mechanical transform at deploy time — the YAML the AL integration reads is still explicit entity_ids.
- **Scenes stay static**; Spook installed to monitor missing entity references.
- **Dashboard / card consumer migration**: explicitly OUT OF L1 SCOPE. Owned by the preview-dashboard agent.

### 3.2 Why B+ fits this codebase specifically

- **Metadata is ~70% built already.** 19/20 lights have at least one label, 5/20 have correct area_id, plus partial al_group_* labeling. The work isn't "build the metadata layer from scratch"; it's "complete what's started and connect it to consumers."
- **`area_entities()` rolls up from device** — Mac doesn't need to set area_id on every entity; one device assignment covers it. Significantly reduces the per-light cleanup burden.
- **Cross-area functional groups (`accent_spots`, `recessed_ceiling`, `column_lights`) cannot be expressed via area_id alone.** Pure Option B fails on this; B+ handles it via labels.
- **The 50+ per-light brightness values in OAL `configuration_manager` (mode blocks at lines 2120-2240)** are explicit artistic decisions that B+ correctly leaves alone — the architecture scopes itself to membership queries, not per-light values.
- **The blast radius is concentrated**: 95% of package refs are in one file. Pre-render targets that file; everything else is incidental.

### 3.3 Critical constraints L1 commits to honoring

1. AL `lights:` stays explicit entity_id arrays in final YAML (pre-rendered from label query at deploy).
2. Per-light value blocks stay direct entity_id references.
3. Scenes stay static. **L1 does NOT rename any entity_id** in any phase — therefore scenes are unaffected by L1's changes. Future entity_id renames (out of L1 scope) will require a separate scene audit pass.
4. Group entity filter (`state_attr(eid, 'entity_id') is none`) is used everywhere "physical lights in area X" is queried. **Canonical template pattern**: `{{ area_entities('living_room') | select('in', label_entities('oal_main_living')) | list }}` — emits the entity_ids that are BOTH in the room AND in the OAL zone, suitable for direct service targets.
5. **L1 does NOT depend on `label_id` as a service-call target.** Upstream HA closed [core#115608](https://github.com/home-assistant/core/issues/115608) as NOT PLANNED. The canonical workaround is template-resolved entity lists: `target.entity_id: "{{ label_entities('oal_main_living') }}"`. P0 verifies this workaround works on this HA version (does NOT test label_id-as-target — that's settled upstream).
6. Manual AL integration reload step is documented as the deploy procedure for any AL YAML change (CLAUDE.md correction landed today).
7. Dashboards/cards stay out of L1 scope.
8. Pre-render scripts in P4/P5 fail closed on partial WS responses; never emit a `lights:` array shorter than the previous known-good count without an explicit `--force` flag (per H2 in the adversarial review — silent membership truncation can break adaptation across the home).

---

## 4. Label Taxonomy — Proposed (awaiting Mac approval in stamp)

### 4.1 Four orthogonal axes (one taxonomy per axis)

- **Axis A — Room** (canonical: `area_id` set on device)
  - Areas: `living_room`, `dining_room`, `kitchen`, `master_bedroom`, `office`, `entryway`
  - One area per device. Inherits to all entities of that device.

- **Axis B — OAL Zone** (canonical: labels at entity level)
  - One zone label per AL-managed light: `oal_main_living`, `oal_kitchen_island`, `oal_kitchen_undercabinet`, `oal_bedroom_primary`, `oal_accent_spots`, `oal_recessed_ceiling`, `oal_column_lights`, `oal_office`, `oal_office_bed`
  - These map 1:1 to the 9 AL switches and their corresponding group entities. **Drives the AL pre-render in P5.**
  - All 20 lights post-L1 have exactly one zone label (per Mac decision on office_table_lamp).

- **Axis C — Hardware Platform** (canonical: labels at entity level)
  - One platform label per light: `platform_hue`, `platform_lutron_caseta`, `platform_matter`, `platform_govee`, `platform_mqtt`, `platform_tuya_wallsmart`
  - **`platform_tuya_wallsmart`** (added per M5 of v2 review): the Tuya WallSmart bed pair has a documented hardware quirk (CCT declared 2000-6500K but driver renders 2700K as neutral white; must drive amber via `hs_color`). This quirk drives the entire `oal_office_bed_color_window_v13` automation (`oal_lighting_control_package.yaml:3753-3924`). Without a distinct platform label, future Tuya WallSmart additions cannot be matched by label query and would require code edits. Currently 2 lights bear this label (office_bed_light_left/right); 0 expected future additions but the label keeps the option open.
  - Useful for platform-aware behavior (e.g., the Govee warm-pin augmentation only fires on Govee-platform lights; chroma-adapt behavior is implicit-equivalent to `platform_hue`).

- **Axis D — Functional Pairing / Sub-zone Cluster** (canonical: labels at entity level, optional per light)
  - Zero-or-more `func_*` labels per light. Captures physical or use-pattern groupings that DON'T align with OAL zones.
  - Distinct from Axis B because: zone is about adaptive-lighting management; function is about physical/use co-location.
  - **Canonical seed example (Mac decision 2026-05-26)**: `func_credenza_pair` = `light.living_room_credenza_light` + `light.living_room_corner_accent`. These two lights are physically co-located on the credenza and used as a pair.
  - **Additional candidate pairings** (to inventory + confirm with Mac during P1):
    - Already covered by OAL zones (no func_* needed): `oal_office_bed` covers bed pair; `oal_accent_spots` covers overhead spot pair; `oal_recessed_ceiling` covers ceiling track pair; `oal_column_lights` covers column strip cluster.
    - **Candidates needing func_* labels** (P1 inventory):
      - `func_credenza_pair` — credenza_light + corner_accent (CONFIRMED 2026-05-26)
      - Any other pairings Mac identifies during P1 walk-through (e.g., entry hall + entryway_lamp; floor lamp + couch lamp ambient pairing; etc.)
  - **Use cases enabled by Axis D**:
    - Scene definitions that target functional pairs ("dim the credenza pair for movie")
    - Dashboard tap_action targeting `{{ label_entities('func_credenza_pair') }}` instead of two entity_ids
    - Future automations that respond to "credenza pair on" as a single state signal
  - **NOT** in scope for Axis D: derived/transient groupings (e.g., "all lights I just turned on") — those stay runtime templates, not labels.

### 4.2 Migration from current al_group_* labels

| Current label | Proposed | Notes |
|---------------|----------|-------|
| `al_group_hue_adapt` | Replaced by `platform_hue` + zone label | "hue_adapt" was conflating two axes (platform + adaptation behavior). Split into platform axis + implicit "any AL-managed light adapts." |
| `al_group_track_lights` | Replaced by `oal_recessed_ceiling` (which is the zone these are in) | Naming was inconsistent — "track" vs "recessed" — and overlapped with zone name. |
| `al_group_non_hue` | Replaced by platform labels (`platform_matter`, `platform_govee`) | Defines by absence; better to define by presence. |
| `al_group_kitchen_island` | Replaced by `oal_kitchen_island` | Same concept, normalized naming. |
| `al_group_master_adapt` | Removed entirely (stale on `corner_accent_govee` post-A3; was a transitional label during Campaign A planning) | No longer needed. |
| (Generic `lights`) | Removed | Redundant — every entity in `domain: light` is implicitly a light. |
| (Bare room name labels e.g., `living_room`) | Removed at entity level | Redundant with area_id. Keep area_id authoritative; drop room labels. |

### 4.3 Per-light label assignment (Phase 1 work)

The full per-light matrix (20 lights × 5 dimensions: area_id + zone label + platform label + func_* labels [0-N] + friendly_name + icon) is produced as a structured artifact in Phase 1 before any registry changes land. Mac stamps the matrix before changes apply.

**Functional pairings sub-pass in P1**: as part of the matrix walk-through, Mac and the L1 executor identify all functional pairings worth labeling. The credenza pair is the seed; others (if any) are added during the matrix review. P1 doesn't require every light to have a func_* label — most won't.

---

## 5. Execution Phases

### Phase 0 — Live-HA reconciliation + storage-managed drift fix (~2-3h)

**Goal**: confirm the empirical baseline against live HA state AND fix discovered drift in storage-managed scenes/automations/scripts. Scope expanded 2026-05-26 per Mac: enumerate AND fix in P0, don't punt to a derivative tranche. Dashboards remain out of L1 scope (owned by preview-dashboard agent).

- **0.1** Query live HA registry via MCP for the canonical 20-light universe; capture as `docs/plans/L1-per-light-baseline-2026-05-26.md` (audit artifact).
- **0.2** Live-only consumer enumeration (MCP):
  - Scenes: `ha_search_entities(query="", domain_filter="scene")` → for each, `ha_config_get_*` to read entity_id refs; cross-check against canonical 20-light universe + group entities. Identify references to non-existent entities + references to entities that have been renamed.
  - Automations: `ha_search_entities(query="", domain_filter="automation")` → `ha_config_get_automation` for each → grep for `light.*` patterns in triggers/conditions/actions.
  - Scripts: same shape via `ha_config_get_script`.
  - Confirm fate of repo-referenced-but-not-locally-defined entity_ids: `light.all_lights`, `light.living_room_main_group_disabled`, `light.master_bedroom_table_lamps`. Either they exist on live (UI-managed groups, document and treat as known) or they don't (zombies, fix at source).
  - Output: `docs/plans/L1-live-storage-drift-inventory-2026-05-26.md` listing every storage-managed asset referencing a stale entity_id.
- **0.3** **Fix discovered drift in storage-managed scenes/automations/scripts.** For each item in the 0.2 inventory:
  - If it references a renamed entity → update via `ha_config_set_automation` / `ha_config_set_script` / `ha_config_set_*` with the corrected entity_id (or with a group reference where appropriate).
  - If it references a zombie entity (non-existent in registry) → either substitute a valid replacement or remove the reference, with Mac's per-item confirmation for ambiguous cases.
  - Each fix: backup the original to `Backups/live_storage_<asset_type>_<id>_<timestamp>.json` BEFORE applying the fix, for audit trail + rollback.
- **0.4** Resolve the `bedroom` ghost-area on `light.master_presence` using this explicit sequence:
  1. `ha_get_device` for the device backing `light.master_presence` (the master bedroom Zigbee/MQTT controller). Report its current area_id.
  2. If the **device** area_id is `bedroom` (the ghost) → `ha_update_device area_id=master_bedroom` so the device-level assignment propagates correctly going forward.
  3. If the device area is already `master_bedroom` but the entity has an explicit `area_id: bedroom` override → `ha_set_entity area_id=null` (to clear the override and let device area roll up) OR `area_id=master_bedroom` directly.
  4. Verify post-fix via `ha_get_entity` that `light.master_presence.area_id` reads `master_bedroom`.
  5. Re-run `area_entities('master_bedroom')` template to confirm `light.master_presence` appears in the list.
- **0.5** **Verify the canonical template-resolution workaround for label-based dispatch** (not testing label_id-as-target — that's closed-as-not-planned upstream): pick a safe single-light label (e.g., apply test label `l1_probe` to one light), call `light.toggle, target: { entity_id: "{{ label_entities('l1_probe') }}" }`, confirm the light responds, then remove the test label. This validates that template-resolution works on this HA version. **If this fails, halt L1 and reassess** — without template resolution, the architecture has no label-dispatch path.
- **0.6** Verify the AL reload procedure: change a single AL `lights:` list entry in YAML, deploy, manually reload AL integration via UI (Settings → Devices & Services → Adaptive Lighting → Reload), confirm new lights list is honored. This empirically validates the CLAUDE.md correction.
- **0.7** **Verify the group-entity filter recipe in HA 2026.5**: call `ha_eval_template` with `{{ state_attr('light.column_lights', 'entity_id') }}` — should return a list of 3 member entity_ids (confirming group entities still expose `entity_id` as the members-list attribute). Call same template against `light.living_room_couch_lamp` — should return `none`. If either result is different from expected, the group-filter recipe needs revision before P3/P4 use it.
- **0.8** **Verify HA 2026.5 state-trigger template entity_id support** (per M7 of v2 review): test whether `platform: state, entity_id: "{{ label_entities('platform_tuya_wallsmart') }}", from: 'off', to: 'on'` actually works as a valid trigger definition. If yes → future tranche can generalize the office bed off→on color re-paint trigger (`:3802-3808`). If no → that hardcode is permanent until HA core changes. Result documented in P0 outcome.

**DoD**:
- [ ] Per-light baseline artifact written and verified against live MCP query
- [ ] Live-only consumer inventory documented (`L1-live-storage-drift-inventory-2026-05-26.md`)
- [ ] Every drift item in the 0.2 inventory has a corresponding entry in 0.3 — either FIXED + backed up, or explicitly DEFERRED with reason
- [ ] Ghost area resolved per the explicit P0.4 sequence (device area_id correct AND entity reads correctly)
- [ ] Template-resolution workaround PASS recorded (P0.5)
- [ ] Group-entity filter recipe PASS recorded (P0.7)
- [ ] AL reload test: re-imported new entity confirmed in `state_attr('switch.adaptive_lighting_X', 'configuration').lights`
- [ ] Re-run the 0.2 enumeration post-fix to confirm zero drift remaining (or only known-deferred items)

**Rollback**: storage-managed fixes are reversible via the JSON backups under `Backups/live_storage_*`. Restore via `ha_config_set_automation` etc. with the original payload. Other P0 steps are read-only + one test label add/remove.

**Risk note**: this phase touches LIVE HA configuration directly (storage-mode automations/scenes/scripts). Per-item confirmation for ambiguous cases is mandatory — don't bulk-apply fixes without Mac's eye on the per-item drift list first.

---

### Phase 1 — Per-light metadata cleanup (~3h)

**Goal**: every physical light has correct area_id (on device), correct zone label, correct platform label, complete friendly_name, complete icon.

- **1.1** Produce the per-light proposed-state matrix (all 20 lights × area_id + zone label + platform label + friendly_name + icon). Format: markdown table in `docs/plans/L1-per-light-cleanup-matrix.md`. **Mac stamps the matrix before changes apply.**
- **1.2** Apply area_id corrections via MCP `ha_update_device` (set area on the device, which rolls up to all its entities — cheapest path). For lights whose device area is ambiguous (e.g., a single device with entities in two areas), apply at entity level via `ha_set_entity`.
- **1.3** Apply label additions (zone + platform + func) via MCP `ha_set_entity` per light. Strip stale labels (`al_group_master_adapt` from corner_accent_govee, `living_room` from office_desk_lamp, generic `lights`, etc.). **Special case — `light.office_table_lamp`**: per Mac decision 2026-05-26, this light joins the office AL zone. Apply `oal_office` zone label + `platform_lutron_caseta` + verify area_id is `office`. Phase 5 will then pick it up into the office AL `lights:` list during regeneration; Phase 4 will add it to the all_adaptive_lights group expansion (see P4.5 below for the documented one-time membership expansion).
- **1.3.b** **Functional pairings walk-through (Axis D)**: Mac and executor review the 20-light matrix together. For each light, decide whether it belongs to a functional pairing not already captured by Axis B (OAL zone). Seed: `func_credenza_pair` applied to `light.living_room_credenza_light` + `light.living_room_corner_accent` (Mac confirmed 2026-05-26). Other candidates emerge during walk-through; most lights will have zero func_* labels. Per Axis D semantics (§4.1), func_* labels are optional and zero-or-more per light.
- **1.4** Set friendly_name override on the 7 lights with null friendly_name. Use logical, dashboard-friendly names per Mac's spec.
- **1.5** Set icon override on the 11 lights with null icon. Use `mdi:` family icons consistent with existing assignments (`mdi:lamp`, `mdi:floor-lamp`, `mdi:desk-lamp`, etc.).
- **1.6** Verify post-cleanup state via MCP batch query against the canonical universe.

**DoD**:
- [ ] All 20 lights have correct `area_id` (or correctly null if intentional)
- [ ] All 20 lights carry exactly one `oal_*` zone label (matching their OAL zone)
- [ ] All 20 lights carry exactly one `platform_*` label
- [ ] No light carries a stale `al_group_*` label
- [ ] All 20 lights have a non-null `name` and `icon` value
- [ ] `area_entities('<room>')` returns the expected physical light set for each room (group entities filtered)
- [ ] `label_entities('oal_main_living')` returns exactly the 5 main_living lights, etc. for each zone label

**Rollback**: registry changes are reversible via MCP. Backup the pre-state matrix to `Backups/L1_pre_phase1_registry_<timestamp>.md`.

---

### Phase 2 — Package-side zombie + orphan cleanup (~1h)

**Goal**: remove dead code in packages so the source-of-truth layer matches reality.

- **2.1** Delete orphaned group `living_room_lights_group` (`packages/oal_lighting_control_package.yaml:87-98`) — zero consumers verified.
- **2.2** Delete orphaned group `hue_lamps_only` (lines 134-141) — zero consumers verified.
- **2.3** Delete orphaned group `overhead_lights` (lines 143-147) — **zero ACTIVE consumers** (no references in active Lovelace dashboards per `Configuration/configuration.yaml:73-126`). Note: 4 decoupled references exist in `Dashboard/cards/split-hero.yaml`, `Dashboard/cards/split-hero-v2.yaml`, `Dashboard/cards/hero-lights.yaml`, `Dashboard/split_hero.yaml` — these are non-Tunet legacy artifacts not wired into any live dashboard. Deleting the group is safe; the orphaned dashboard references stay as pre-existing stale artifacts (out of L1 scope per Mac's dashboards-out-of-scope decision).
- **2.4** Fix `tunet_room_light_groups.yaml` Bedroom row: remove `light.master_bedroom_corner_accent_govee` (post-A3 — now office), remove `light.master_bedroom_table_lamps` (entity does not exist).
- **2.5** Fix three-way nesting drift: remove `light.column_lights` from `light.all_living_room_lights` membership (the column_accent → bedroom counts as LR via this nesting). The column_strip lights stay direct members where appropriate.
- **2.6** Fix semantic misclassifications: remove `light.living_room_credenza_light` and `light.living_room_corner_accent` from `all_dining_room_lights`.
- **2.7** Reconcile `tunet_homekit.yaml` exclude_entities block (lines 67-77). Full classification per file comments + adversarial review:

  | Entity | Status | Action |
  |--------|--------|--------|
  | `light.living_room_main_group_disabled` | True zombie (no comment, no registry entry) | REMOVE from exclude — Phase 0.2 verifies it doesn't exist on live |
  | `light.master_presence` | INTENTIONAL ("presence-indicator light, not user-facing" per comment) | KEEP |
  | `light.all_lights` | Comment treats as real ("group-of-everything; would duplicate per-room") but entity not defined in repo | P0.2 verifies on live — if exists, KEEP; if zombie, REMOVE |
  | `light.all_adaptive_lights` | INTENTIONAL ("OAL-internal group" per comment) | KEEP |
  | `light.kitchen_undercabinet_lights` | INTENTIONAL (per-comment duplicate kitchen accessory) | KEEP |
  | `light.kitchen_island_lights` | INTENTIONAL (same) | KEEP |
  | `light.room_kitchen_all` | INTENTIONAL (same) | KEEP |
  | `light.all_kitchen_lights` | INTENTIONAL (same) | KEEP |

  Net: 1 confirmed zombie removal + 1 P0-verification-dependent removal possible. Do NOT bulk-delete the exclude block.

**DoD**:
- [ ] All listed orphaned groups deleted
- [ ] Bedroom group has only entities physically in master bedroom
- [ ] Dining group has only entities physically in dining room
- [ ] `expand('light.all_living_room_lights') | length` returns a count that matches the canonical living room physical light count (no column_accent cross-contamination)
- [ ] HomeKit zombie references resolved

**Rollback**: pure git revert.

---

### Phase 3 — Consumer migration POC (~2h)

**Goal**: prove the registry-query pattern works end-to-end on one high-value consumer.

- **3.1** Migrate `sensor.lights_on_<room>` series in `packages/tunet_room_sensors.yaml` to use `area_entities(room) | <group-filter> | list` pattern (filter group entities via `state_attr() is none`).
- **3.1.b** **Area-id authoritative precedence (M2 of v2 review)**: post-L1, `area_id` set on device is THE canonical room source for room-aggregator sensors. Specifically: `light.master_bedroom_corner_accent_govee` (Campaign A3 result) has `area_id: office`, so `sensor.lights_on_office` counts it; `sensor.lights_on_master_bedroom` does NOT. This resolves the current asymmetry where `lights_on_office` uses `light.office_lights` zone group while others use `all_<room>_lights` room group — POST-L1 ALL room-aggregator sensors use `area_entities(<room>)` uniformly. Document this in the file header comment so future-Mac knows where each light counts.
- **3.2** Deduplicate the 5 `Room <X> State` template sensors in OAL package — each repeats its room's light list 3-4 times. Hoist to a single `{% set lights = area_entities(room) | <group-filter> | list %}` block at the top of each sensor.
- **3.3** **Decide parallel room-aggregation surfaces (M3 of v2 review)**: two surfaces currently coexist with overlapping intent but different memberships:
  - `tunet_room_light_groups.yaml`: `light.room_<x>_all` (4 lights in LR, etc.)
  - `oal_lighting_control_package.yaml:99-132`: `light.all_<x>_lights` (9 lights in LR including dining spots + columns)
  - **Recommendation**: COLLAPSE to one. Delete `tunet_room_light_groups.yaml` entirely; regenerate `light.all_<x>_lights` from `area_entities()` as the canonical room aggregator. Justification: two parallel systems generated different ways are what created drift in the first place. The `room_<x>_all` set was an attempt to be "more accurate" than the OAL `all_<x>_lights` set, but with the L1 architecture making `all_<x>_lights` accurate via `area_entities()`, the redundancy is eliminated. **Mac to confirm collapse direction before P3.3 executes** (see §9).
- **3.4** Validate sensor outputs match expected post-cleanup counts (manual cross-check against live HA states).

**DoD**:
- [ ] All 6 `lights_on_*` sensors return correct counts post-cleanup (verified against MCP state query)
- [ ] All 5 Room State template sensors deduplicate to single hoisted `lights` var
- [ ] Sensor output documented before/after for Mac visual confirmation

**Rollback**: revert `tunet_room_sensors.yaml` and Room State sections of OAL package.

---

### Phase 4 — OAL group regeneration via deploy pre-render (~2-3h)

**Goal**: light group definitions in OAL package become a MACHINE OUTPUT of label queries, not a hand-maintained list. Source of truth shifts to the registry.

- **4.1** Write `skills/ha-safe-package-deploy/scripts/render_light_groups.mjs` (or equivalent Node script) that queries HA via WebSocket API for `label_entities(zone_label)` for each of the 9 OAL zone labels, plus the cross-room groupings (`all_<room>_lights` via `area_entities()`).
- **4.2** Script emits a YAML block of group definitions, ready to splice into `oal_lighting_control_package.yaml` at the canonical group block range (currently lines 11-154).
- **4.3** **Regression guards baked into the script** (per H2 of adversarial review v1 + H2 of v2):
  - Script maintains a baseline snapshot at `skills/ha-safe-package-deploy/baselines/light_groups_baseline.json` (member-count per group).
  - On run: query current memberships; compare to baseline. **REFUSE to emit YAML with a `lights:` array shorter than baseline without `--force`** (catches transient WS failures).
  - **Fail closed on partial WS responses**: if any query times out or returns malformed data, exit non-zero with no YAML written. The deploy must NOT proceed.
  - Always print a diff to stdout: `group X: was [a,b,c], now [a,b,c,d] (+d)` or `group X: was [a,b,c], now [a,b] (-c) WARNING: shrink detected — use --force to apply`.
  - **Missing-zone-label scan (H2 of v2 review)**: before emitting any YAML, query for `domain: light` entities whose `entity_id` is in the canonical AL universe (filter group entities via `state_attr() is none`) AND whose labels do NOT contain any `oal_*` zone label. If the count is > 0, FAIL non-zero with the list of unlabeled lights. This catches "Mac added a new light, forgot to label it" — without this scan, the silent failure mode is "new light free-runs because no zone label" (caught only by manual audit invocation, never by deploy gate). The scan can be bypassed with `--allow-unlabeled` if Mac is intentionally leaving a light non-AL.
  - On successful run, update the baseline file (committed alongside the regenerated YAML).
- **4.4** Wire into `deploy_packages.sh`: pre-deploy step regenerates the group block, checks the script's exit code, **aborts the deploy if non-zero**. Commits the regenerated diff to `Backups/` for audit trail; then proceeds with normal deploy.
- **4.5** **Preserve `light.all_adaptive_lights` membership** (M3 of adversarial review). This group has at least 2 downstream consumers: `packages/mmwave_tracking.yaml` (motion-triggered all-off) and `packages/zen32_modal_controller_package.yaml` (lights-on indicator). The regenerated `all_adaptive_lights` membership MUST equal `previous_members ∪ {light.office_table_lamp}` exactly — **the office_table_lamp addition is the documented one-time Mac-stamped behavior change per §2.1**. Any OTHER addition or removal needs an explicit, documented label-change rationale and Mac approval BEFORE the regeneration runs. Pre-render script's `--force` flag is required for any other shrink/expand; the office_table_lamp addition is "expansion" (not shrink) and does NOT require `--force`, but the diff log MUST surface this as the expected expansion.
- **4.6** Validate: post-deploy `expand('light.<group>')` membership matches the expected per-zone count from registry labels.

**DoD**:
- [ ] Pre-render script exists, idempotent (running twice produces the same output)
- [ ] Script's regression guards verified: simulating a transient WS failure produces a non-zero exit with no YAML written
- [ ] Script's shrink-detection verified: synthetically removing a label from one light → script outputs WARNING and refuses without `--force`
- [ ] Deploy script wires render step in before the SCP step AND aborts on non-zero exit
- [ ] Regenerated group block matches the canonical 9-zone structure (no orphans, no nesting drift)
- [ ] `light.all_adaptive_lights` membership post-regeneration = pre-regeneration ∪ `{light.office_table_lamp}` exactly (verified via diff; no other adds/drops)
- [ ] Audit-trail commit shows the regeneration was a no-op (or shows exactly what changed if not)
- [ ] mmwave + zen32 downstream consumers verified post-deploy: their dependent automations still see the expected light set

**Rollback**: revert the script and the deploy_packages.sh wire-in. Manual group editing returns.

---

### Phase 5 — AL `lights:` pre-render (~2-3h)

**Goal**: same pattern for the 9 AL switch `lights:` lists. Each AL switch's membership becomes a MACHINE OUTPUT of `label_entities('oal_<zone>')`.

- **5.1** Extend the Phase 4 script (or write a sibling) to emit AL `lights:` arrays per zone, splicing into the AL config block range (currently lines 706-945 in OAL package).
- **5.2** **Apply the same regression guards as Phase 4** (per H2): baseline snapshot of per-AL-switch membership; refuse to emit shorter `lights:` array without `--force`; fail closed on partial WS responses; print diff to stdout.
- **5.3** Validate the rendered AL config matches the current AL config exactly post-cleanup (no membership drift introduced by the regeneration).
- **5.4** Deploy + manual AL integration reload (per CLAUDE.md corrected procedure); verify each AL switch's `state_attr('switch.adaptive_lighting_X', 'configuration').lights` returns the new entity list.
- **5.5** Document the deploy procedure with the AL reload step in `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` (or its OAL equivalent).

**DoD**:
- [ ] AL config block regenerates idempotently from registry queries
- [ ] Regression guards verified (same shape as P4: shrink detection + fail-closed on partial WS)
- [ ] Manual reload validation: all 9 AL switches show expected entity_id lists in their configuration attribute
- [ ] Pre-render diff matches expected membership post-cleanup; no surprising adds or drops
- [ ] Deploy procedure documents the AL reload step explicitly

**Rollback**: revert script; manual AL `lights:` editing returns.

---

### Phase 6 — Campaign B fold-in (~6-8h via existing plan)

**Goal**: execute `~/.claude/plans/office-corner-accent-relocation.md` Campaign B (column_accent → column_lights AL + RGB lifecycle) with the L1 foundation in place.

- **6.1** Apply label changes: `light.master_bedroom_column_accent` gains `oal_column_lights` label + retains `platform_govee` + area_id stays `master_bedroom`.
- **6.2** Deploy regenerates the column_lights group + AL switch lights to include column_accent automatically (mechanical via Phase 4/5 pipelines).
- **6.3** Execute the 17-site column RGB lifecycle automation changes per the existing Campaign B plan. These are per-light automation actions and stay direct entity_id refs (per-light value block exclusion).
- **6.4** Manual AL reload; validate column_lights AL switch now manages 3 lights including column_accent.
- **6.5** Validate RGB sunset/sunrise/self-heal cycles work on column_accent per the campaign's test matrix.

**DoD**:
- [ ] Column_accent appears in `switch.adaptive_lighting_column_lights.configuration.lights` post-reload
- [ ] Column_accent participates correctly in sunset/sunrise/self-heal cycles (validation per `docs/column_rgb_sunset_validation_runbook.md`)
- [ ] No regression on the 2 existing column strips

**Rollback**: revert the per-light automation diffs; remove the `oal_column_lights` label from column_accent; deploy regenerates 2-member column_lights group/AL.

---

### Phase 7 — Drift detection script (~4-5h)

**Goal**: prevent future drift by mechanizing the "find all references to this entity" check.

- **7.0** **Write the regex/parsing spec first** (per M4 of adversarial review) at `docs/L1-drift-detection-spec.md` BEFORE writing the script. The spec defines:
  - **Match patterns**: `\blight\.[a-z_0-9]+\b` is the core, BUT distinguish from `light:` YAML key (the platform declaration). The regex must be position-aware (after a `:` or in a list, not as a YAML key prefix).
  - **In-scope file tree**:
    - `packages/*.yaml` (all)
    - `Configuration/*.yaml`
    - `Dashboard/Tunet/**/*.yaml` (active Tunet only)
    - `Dashboard/Tunet/Cards/v3/*.js` (active card source)
    - **OUT of scope** for the drift script: `Dashboard/cards/*.yaml`, `Dashboard/split_hero.yaml`, anything under `Backups/`, `Dashboard/Tunet/Cards/v2/`, `.audit_thumbs/`, screenshots
  - **False-positive handling**:
    - References inside `#` comments → ignore
    - References inside YAML `description:` / `example:` blocks → ignore (e.g., `sonos_package.yaml:1620` has a doc-string `light.living_room` that is not a real reference)
    - References inside `getStubConfig()` blocks in JS → ignore (editor-only stubs)
  - **Template-resolved references**: any `light.{{ var }}` or `` `light.${x}` `` patterns are EXCLUDED from "find missing entity" detection because they can't be resolved statically. Flag them in a separate "dynamic references" report category instead of failing.
  - **Canonical labels-vs-area policy**: room-name labels at entity level are CANONICALLY DROPPED (per L1 taxonomy decision). The script must NOT flag "missing room label" — room is canonically `area_id`, not a label.
  - **Corpus of test cases**: include in the spec doc a list of "must match" and "must NOT match" examples so the script's regex correctness is verifiable.
- **7.1** Write `scripts/audit_light_references.mjs` (Node, consistent with existing deploy tooling). Reads:
  - Live HA registry via WS API (areas, labels, entities, devices)
  - File tree per the P7.0 in-scope spec
- **7.2** Produces a structured report:
  - **Orphan entities**: in registry but not referenced anywhere → flag as candidates for removal
  - **Zombie references**: referenced but not in registry → flag as broken
  - **Area_id mismatches**: an entity is referenced as "in living_room" in a group/sensor but its area_id is something else
  - **Label coverage gaps**: any AL-managed light missing its expected `oal_*` zone label OR `platform_*` label
  - **`lights_dimmed` coverage gap (H1 of v2 adversarial review — CRITICAL)**: for each AL-managed light, check whether it appears in every mode's `configuration_manager.lights_dimmed` dict where any of its zone-siblings appear. If a sibling has an explicit value for Evening but this light does not, FLAG. Mac may have intended sibling-default, but the omission must be explicit — not a forgotten-to-add. This catches the silent-miscalibration failure mode where a newly-added light free-runs in mode contexts where siblings have artistic values.
  - **`lights_off` coverage gap**: same logic for the `lights_off` lists per mode — a new light should be explicitly classified as "off in this mode" or "controlled in this mode," never silently omitted from both.
  - **Dynamic references** (separate category): templated `light.{{ var }}` patterns that couldn't be resolved — manual review only
- **7.2.b** **Registry state snapshot** (per H3 of v2 review): emit `docs/registry_state_snapshot.md` (or `.json`) on every audit run — a structured dump of `area_id`, `labels`, `platform`, `friendly_name`, `icon` per physical light. Commit this file to the repo. Git diff on it makes registry mutations reviewable; uncommitted changes mean a registry edit happened outside the L1-tracked workflow.
- **7.3** Wire into pre-commit (or a `npm run audit:lights` target). Recommend `npm run audit:lights` invoked manually after any hardware change AND automated at deploy time as a pre-deploy guard.
- **7.4** Make the report file-format machine-parseable (JSON) AND human-readable (markdown with sections). Default to markdown for the human-friendly form; JSON for CI/automation.

**DoD**:
- [ ] P7.0 spec doc exists with "must match" / "must NOT match" corpus
- [ ] Audit script passes the corpus (every "must match" flagged; every "must NOT match" skipped)
- [ ] Audit script catches synthetic drift (e.g., manually rename one entity_id in a package, confirm script flags it)
- [ ] Audit script catches a deliberately missing label (e.g., strip `oal_main_living` from one entity → script flags coverage gap)
- [ ] Script produces a report file checked into the repo as a baseline (clean baseline post-cleanup = expected)
- [ ] Pre-commit / npm hook invokes the script

**Rollback**: drop the script; pre-commit removal.

---

### Phase 8 — Spook install (~PARTIALLY COMPLETE as of 2026-05-26)

**Goal**: install Spook for free baseline missing-entity-reference detection.

**Status update 2026-05-26 ~7:40pm MDT**: Mac confirmed Spook downloaded via HACS. Remaining steps for Mac to close the loop:

1. ~~HACS install~~ ✓ DONE
2. **Restart Home Assistant** so Spook loads.
3. After restart: Settings → Devices & Services → **Add Integration** → search **Spook** → add it (no config required).
4. Verify: Settings → System → **Repairs** dashboard is accessible; check whether any missing-entity-reference repair entries appear there.
5. Optional verification: Developer Tools → Services → search for `homeassistant.update_entity_id` (Spook-provided service) — confirms Spook is loaded.

**DoD**:
- [x] Spook installed via HACS (Mac confirmed 2026-05-26)
- [ ] HA restarted
- [ ] Spook integration added via Settings → Devices & Services
- [ ] Repairs dashboard reviewed; any existing missing-entity-reference repairs surfaced as additional L1 inputs

**Rollback**: HACS → Spook → Uninstall.

---

## 6. Definition of Done (overall L1)

L1 is COMPLETE when:

1. All 8 phases above have their per-phase DoD met.
2. Moving a light to a different area in HA (set device area_id via UI) → next deploy automatically updates the OAL group memberships AND the AL switch `lights:` lists. No manual YAML edits required for the membership-change.
3. Renaming a light's entity_id (e.g., via Spook's `homeassistant.update_entity_id`) → drift detection script catches all package references to the old name → Mac runs a one-time package-side replacement → groups + AL pre-render reconciles automatically.
4. The audit script reports zero zombie references and zero orphan entities against the canonical universe.
5. S.2's `lights_on_*` sensors return correct counts (no double-counting from nesting drift).
6. Campaign B (column_accent) is shipped and validated.

The user (Mac) holds the "done" stamp per M3 — L1 is not done autonomously.

---

## 7. What L1 Does NOT Solve

- **Dashboard / card consumer migration**. Owned by the preview-dashboard agent. L1 just makes the registry authoritative; cards still pass entity_ids in their config until the other agent migrates them.
- **Scenes**. They encode entity_ids structurally per HA design. Stay static; Spook monitors for missing references. **Note from v2 review M8**: the 5 OAL mode scenes target `input_select.oal_active_configuration`, not lights — so Spook's scene-side light coverage is essentially nil in this codebase. The "scenes stay static + Spook monitors" carve-out is free.
- **Per-light value blocks** in `configuration_manager` (mode brightness ~50 values), OAL CCT pins, Office Work-mode automation, bed color window automation. Per-light artistic decisions; stay direct entity_id refs. **L1 DOES** add audit coverage for the membership of these dicts (P7.2 H1 rule) so a forgotten entry surfaces.
- **HomeKit exposure** in `tunet_homekit.yaml`. Stays static; v2 review confirmed 2026.5 still has no `area_id`/`label_id` filter support.
- **Multi-label intersection at HA-core target level**. Not supported by HA; template-side intersection is the workaround.
- **Renaming the `master_bedroom_corner_accent_govee` entity_id itself.** L1 doesn't propose a renaming pass — the L1 architecture makes future renames cheap, but doesn't perform them.

### Known follow-ups L1 surfaces but does not address (per v2 review)

The v2 adversarial review surfaced three subsystems with technical debt that L1 doesn't fix but that future tranches will want to address. Documenting here so they're not "surprise debt":

- **ZEN32 Full Bright / Min Brightness presets** (`zen32_modal_controller_package.yaml:921-1012`) hardcode 7 OAL zones (main_living, kitchen_island, kitchen_undercabinet, bedroom_primary, accent_spots, recessed_ceiling, column_lights). Missing **office + office_bed** — Campaign A drift not caught by L1 because these are `input_number` zone offsets, not lights. Onboarding runbook should mention this; future generalization is a label-driven loop over a `oal_zone_*` label set.
- **Column RGB lifecycle hardcoded entity_id refs** (~120 across configuration_manager column-protect path + 6 lifecycle automations at `oal_lighting_control_package.yaml:2293-2329`, `:2459-2497`, `:2651-2680`, `:2939+`, `:3163+`, `:3199+`, `:3300+`, `:3500+`, `:4209+`). L1 P6 folds Campaign B (column_accent joining) via the new pipeline but the **lifecycle automations themselves** still hardcode the 3 column entity_ids. Future tranche could template the list from `label_entities('oal_column_lights')` at sensor scope, then reference it in automation actions. Out of L1 scope.
- **Office bed color window** (`:3753-3924`) uses 6 hardcoded `[light.office_bed_light_left, light.office_bed_light_right]` lists in one automation. Adding a `platform_tuya_wallsmart` label (per M5 / Axis C update above) enables label-driven generalization IF HA 2026.5 state triggers accept template entity_ids. Verify in P0; if supported, future tranche generalizes. If not, hardcode is permanent until HA core changes.

---

## 8. Rollback (overall)

Each phase has its own rollback noted. Cumulative rollback path: phases revert in REVERSE order. Phases 4-5 (pre-render scripts) are the riskiest in terms of "can't easily revert" — if the scripts produce malformed YAML, the OAL package needs manual restore from `Backups/` directory.

Mitigation: every deploy via `deploy_packages.sh` already backs up the live OAL package YAML to `Backups/oal_lighting_control_package_<timestamp>.yaml` before pushing. L1's pre-render scripts must run BEFORE that backup step — wrong YAML in repo gets backed up as the new "live" if order is wrong.

---

## 9. Open Decisions — RESOLVED 2026-05-26 ~8:30pm MDT

All open decisions are CLOSED. The plan is stamped pending final read-through.

1. ✅ **Label taxonomy (§4.2)** — APPROVED as proposed (`oal_<zone>` + `platform_<vendor>` axes; al_group_* labels replaced/removed per §4.2 migration table).
2. ✅ **Phase sequencing** — APPROVED as proposed (P0 → P8).
3. ✅ **Phase 7 (drift detection script) scope** — EXTENDED scope confirmed (orphan/zombie + label coverage gaps + area_id mismatch detection).
4. ✅ **Phase 4/5 pre-render scripts** — Node (matches existing deploy tooling).
5. ✅ **AL reload UX** — document as deploy checklist step in `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` (or its OAL equivalent).
6. ✅ **Live-only consumer scope (Phase 0.2)** — enumerate AND fix in P0. Storage-managed scene/automation/script drift gets fixed during reconciliation, not punted. P0 time estimate revised to ~2-3h. Per-item Mac confirmation for ambiguous cases is required.
7. ✅ **Capability label `cap_chroma_adapt`** — SKIP. `platform_hue` is implicit-equivalent for current and likely future use cases. If a non-Hue chroma-capable light enters the fleet later, the label can be added then.
8. ✅ **`office_table_lamp` taxonomy** — RESOLVED via behavior-change route: office_table_lamp joins the office AL zone (added to `switch.adaptive_lighting_office` lights: list + `light.all_adaptive_lights` group). Gets `oal_office` zone label + `platform_lutron_caseta`. The all_adaptive_lights membership expansion is documented in §2.1 and P4.5.

9. ✅ **Collapse the two parallel room-aggregation surfaces?** — APPROVED 2026-05-26 ~9:20pm MDT. Per Mac stamp: COLLAPSE. P3.3 will delete `tunet_room_light_groups.yaml` entirely; `light.all_<x>_lights` becomes the canonical room aggregator, regenerated from `area_entities()` by the P4 pre-render. Audit: before deletion, P3.3 confirms zero consumers of `light.room_<x>_all` outside of `tunet_room_light_groups.yaml` itself; if any are found, they migrate to the canonical `light.all_<x>_lights` first.

10. **One additional consideration on Axis D (`func_*` labels)**: v2 review M4 noted that `func_credenza_pair` is currently a label without a consumer (no scene reads it; no dashboard tile is wired to query it). The reviewer recommended either tying it to a concrete consumer or deferring Axis D until consumers exist. Mac specifically asked to add coverage; the seed stays per Mac's stamp. **But**: P1.3.b should resist proliferating func_* labels without forward-looking consumer intent (a label-without-consumer creates the same kind of "named-but-unused" drift the architecture is trying to prevent). The plan accepts func_credenza_pair as a seed with implicit consumer intent (likely a future dashboard tile or scene) and does not pre-apply other func_* labels.

---

## 10. Adversarial Review Summary

### v2 — Deep use-case-first review (completed 2026-05-26 ~9:00pm MDT)

Second pass per Mac's request. Reviewer built an independent system model from packages (OAL, ZEN32, scenes, room sensors, homekit, mmwave, room automations) BEFORE reading the plan. Inventoried 28 distinct use cases, then evaluated the plan against each.

**Verdict**: Option B+ confirmed as right architecture — but **three HIGH-priority findings + several MEDIUM** identified. All folded into this revision:

**HIGH findings addressed**:

- **H1 — `lights_dimmed` per-mode membership coupling (CRITICAL)**. The OAL `configuration_manager` mode blocks at `:2120-2240` carry not just per-light values but per-mode MEMBERSHIP. If a new light joins a zone via label + AL pickup but is missing from the mode dicts, it will free-run at the zone's default while siblings adapt to their explicit values — **visibly miscalibrated on day one**. Audit (P7) added coverage check: every AL-managed light must appear in every mode's `lights_dimmed` dict where its zone-siblings appear, OR absence must be explicit (commented). Onboarding runbook step 6 changed from OPTIONAL to REQUIRED for new lights joining zones with existing per-mode values, with concrete copy-paste templates.
- **H2 — Pre-render regression guard caught shrinks but not omissions**. Mac forgets to apply `oal_*` zone label → no shrink → deploy proceeds → AL `lights:` omits the new fixture → it free-runs. P4.3 now includes a missing-zone-label scan: query for `domain: light` entities lacking any `oal_*` label and FAIL the deploy if count > 0. Bypassable with `--allow-unlabeled` for intentional exclusions.
- **H3 — Registry-as-truth introduces git-invisible state**. `ha_set_entity area_id=...` changes aren't reviewable in git diff. P7.2.b now emits `docs/registry_state_snapshot.md` (or `.json`) on every audit run — committed file makes registry mutations visible via git diff.

**MEDIUM findings addressed**:

- **M2 — area_id authoritative precedence**. P3.1.b now documents: post-L1, `area_id` is THE canonical room source. corner_accent_govee counts in `lights_on_office` only.
- **M3 — Two parallel room-aggregation surfaces**. Reopened as §9.9 — recommendation is COLLAPSE (delete `tunet_room_light_groups.yaml`; regenerate `light.all_<x>_lights` as canonical). Mac to confirm.
- **M5 — Missing platform label**. Added `platform_tuya_wallsmart` to Axis C — distinct from generic MQTT because the WallSmart driver's CCT quirk is platform-specific.
- **M1 / M6 / M7 — Adjacent debt L1 surfaces but doesn't fix**. Added a "Known follow-ups" sub-section to §7 documenting ZEN32 preset 7-zone hardcode (Campaign A drift), column RGB lifecycle's ~120 hardcoded entity_id refs, and the bed-color-window automation's hardcoded entity_ids. P0.8 added to verify if HA 2026.5 state triggers accept template entity_ids (which would enable future generalization of the bed trigger).
- **M4 — Axis D weakly motivated**. §9.10 added: P1.3.b should resist proliferating func_* labels without forward consumer intent. Credenza pair stays as seed (Mac's stamp) with implicit consumer intent.
- **M8 — Spook scene coverage essentially nil**. Documented in §7 — not a defect, just observation that the "scenes static + Spook monitors" carve-out is free.

**Polish (S8.5 reword applied)**: §3.1 changed "CANNOT be regenerated from registry metadata" → "SHOULD NOT BE — these are artistic decisions where the encoded value IS Mac's lived preference."

**Single open decision remaining from v2 review**: §9.9 (collapse parallel room-aggregation surfaces).

---

### v1 — HA 2026.5 norms verification (completed 2026-05-26 ~8:00pm MDT)

Aggressive adversarial review run against HA 2026.5 norms. Full report archived inline below; summary:

**Verdict**: NOT-READY-TO-STAMP at original draft; addressed via the edits in revision 2026-05-26 ~8:15pm MDT. The architectural recommendation (Option B+) was confirmed as the right direction; review hardened execution detail.

**HIGH-priority findings addressed in this plan revision**:

1. **H1 — `label_id` as service target is closed-as-not-planned upstream** (HA core#115608). The plan no longer treats it as a "test and decide" gate. P0.5 now verifies the canonical template-resolution workaround (`target.entity_id: "{{ label_entities('X') }}"`) instead. §3.3.5 updated to reflect this is settled architecture, not a contingent test.
2. **H2 — Pre-render scripts need regression guards**. P4.3 and P5.2 now bake in baseline-snapshot + shrink-detection + fail-closed-on-partial-WS behavior. P4 DoD verifies these guards via synthetic failure injection. `light.all_adaptive_lights` preservation made explicit (M3).
3. **H3 — "Zero consumers" wording for `light.overhead_lights` was misleading**. P2.3 now clarifies: zero ACTIVE Lovelace dashboard consumers; 4 decoupled artifacts in `Dashboard/cards/*.yaml` exist but are not wired into any active dashboard. Out-of-scope per dashboards-out-of-L1.

**MEDIUM-priority findings addressed**:

- M2: `tunet_homekit.yaml` exclude_entities full 8-entity classification table added to P2.7 (1 confirmed zombie + 1 P0-dependent + 6 intentional).
- M4: P7 now has a P7.0 sub-step requiring a regex/parsing spec doc BEFORE the script is written, with explicit in-scope tree, false-positive policy, and test corpus.
- M5/M6: New-light onboarding runbook added as §11 (covers the registry-add → label-apply → AL pickup → per-mode tune workflow).
- M7: P0.4 ghost-area resolution sequence now explicit (device-first, entity-override-second).
- M8: §3.3.3 now explicitly states "L1 does NOT rename any entity_id in any phase — therefore scenes are unaffected." Future renames out of scope.

**Open decisions raised by adversarial review** (added to §9):
- Cap label `cap_chroma_adapt` — needed as additional axis, or implied by `platform_hue`?
- `office_table_lamp` taxonomy — `oal_office_unmanaged` zone label OR no zone label (just area_id + platform)?

**LOW-priority nits accepted**:
- Realistic estimate revised to ~25-32h (up from ~19-25h) — see §6.
- Reference count (§2.2): actual is 462+ in `oal_lighting_control_package.yaml` alone; total across all packages is higher than the original ~390 estimate.
- New HA 2026.5 template fns (`label_devices()`, `label_areas()`, `labels(entity)`) noted as P7 tooling options.

**Primary source citations from the review**:
- [HA template fn area_entities](https://www.home-assistant.io/template-functions/area_entities/)
- [HA template fn label_entities](https://www.home-assistant.io/template-functions/label_entities/)
- [HA core#115608 — closed-as-not-planned](https://github.com/home-assistant/core/issues/115608)
- [Adaptive Lighting #1315 — open, no 2026 maintainer activity](https://github.com/basnijholt/adaptive-lighting/issues/1315)
- [HA 2026.5 release notes](https://www.home-assistant.io/blog/2026/05/06/release-20265/)
- [Spook scene docs](https://spook.boo/scene/) + [Spook entities](https://spook.boo/entities/)
- [HomeKit integration filter docs](https://www.home-assistant.io/integrations/homekit/) — confirms entity_id-only filters (no area/label support in 2026.5)
- [Group integration docs](https://www.home-assistant.io/integrations/group/) — `light: - platform: group` not deprecated as of 2026.5

The plan is now stamp-ready pending Mac's resolution of the two open decisions in §9 (cap_chroma_adapt + office_table_lamp taxonomy).

---

## 11. New-Light Onboarding Runbook (post-L1 workflow)

Once L1 lands, this is the workflow for adding a new physical light to the system:

### Step 1 — Pair the light via HA integration

- Hue: pair via Hue bridge as normal; entity appears in HA registry automatically
- Lutron Caseta: pair via Caseta bridge as normal
- Matter: pair via Matter via QR or manual code
- Govee local: discovered automatically by `govee_light_local` integration
- MQTT/Zigbee2MQTT: pair via z2m UI as normal

### Step 2 — Set device area (the critical step)

- Settings → Devices & Services → click the device → set Area to the correct room
- This rolls up to all the device's entities (including the new light)
- Verify: Developer Tools → States → search the new light entity_id → check `area_id` attribute is set

### Step 3 — Apply labels at entity level (until P7 audit catches gaps)

- Settings → Devices & Services → click the new light entity → Settings → Labels
- Apply: `oal_<zone>` (which OAL zone manages this light) + `platform_<vendor>` (which hardware platform)
- Save

### Step 4 — Deploy with regenerated groups + AL config

```bash
cd /home/mac/HA/implementation_10
bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh
# Pre-render script picks up new label assignments
# Regenerates light groups + AL switch lights: lists
# Deploys + commits backup
```

### Step 5 — Manual AL integration reload

- Settings → Devices & Services → Adaptive Lighting → ⋮ → Reload
- AL picks up the new entity in its `lights:` list
- New light begins adapting per zone's CCT/brightness curve

### Step 6 — Update `configuration_manager` mode coverage (REQUIRED when joining a zone whose siblings have explicit per-mode values; otherwise optional)

**WHY THIS IS REQUIRED, NOT OPTIONAL** (per H1 of v2 adversarial review): the `configuration_manager.lights_dimmed` and `lights_off` blocks at `packages/oal_lighting_control_package.yaml:2120-2240` define per-light brightness per OAL mode (Evening, Dim Ambient, TV Mode, TV Bridge). If a new light joins a zone where its siblings have explicit values in these blocks but the new light does NOT, the configuration_manager's override path will NOT apply a value to the new light. Result: the light runs the zone's default AL curve adjusted by the config offset — **visibly out of sync with siblings on day one**. This is a real defect mode the L1 audit catches but cannot auto-fix.

**Procedure**:
1. Check siblings: `grep "<sibling_entity_id>" packages/oal_lighting_control_package.yaml | grep -E "Adaptive|Evening|Dim Ambient|TV Mode|TV Bridge"` for any sibling in the new light's zone.
2. For every mode where a sibling has an explicit value, decide for the new light: explicit value, sibling-default, or off. Add an entry for each mode (lights_dimmed: <value> OR lights_off: include the entity).
3. Redeploy + AL reload.

**Template for new-light per-mode entries** (replace `<entity_id>` and tune values to match Mac's intended tier):

```yaml
# In configuration_manager.Adaptive.lights_dimmed (around line 2143):
# (Adaptive typically uses ~50 for ambient lights)
<entity_id>: 50

# In configuration_manager.Evening.lights_dimmed (around line 2186):
# (Evening typically uses ~35 for ambient lights, ~20-30 for accent)
<entity_id>: 35

# In configuration_manager."Dim Ambient" (around line 2160):
# (Dim Ambient is mid-low — ~10-25 typical)
<entity_id>: 15

# In configuration_manager."TV Mode" (around line 2218):
# (TV Mode is heavy dim — ~3-10 typical, OR included in lights_off if bright fixture)
<entity_id>: 5
# OR add to lights_off list at line 2214:
- <entity_id>

# In configuration_manager."TV Bridge" (around line 2232):
# (TV Bridge is mid-dim between TV Mode and Evening)
<entity_id>: 10
```

4. After committing the per-mode entries, re-run `npm run audit:lights` — the coverage check (P7.2 H1 rule) should now report zero gaps for this entity.

If the new light SHOULD use zone-default behavior in some modes (not all siblings have explicit values for every mode — e.g., `living_room_corner_accent` has `Adaptive: 50` and `Evening: 35` but no `Dim Ambient` value at lines 2143/2186), explicitly note this in a comment so the audit script's "absence is explicit" rule passes.

### Step 7 — Run drift audit

```bash
npm run audit:lights
```

- Should report the new light with all expected labels + area_id
- If labels are missing, fix them (back to step 3) before considering onboarding complete

### Failure modes to watch for

- **New light has no labels** → AL doesn't pick it up; light doesn't adapt. Audit script flags missing zone label.
- **Device area is wrong** → light shows up in wrong room aggregation; `lights_on_<wrong_room>` sensor inflates. Audit script flags area_id mismatch.
- **New light is in a NEW area not previously in the registry** → may need to create the area first (Settings → Areas) before assigning. Audit script flags as orphan-area.
- **AL doesn't pick up after deploy + reload** → check `state_attr('switch.adaptive_lighting_X', 'configuration').lights` — if the new light isn't there, the pre-render script may have failed silently. Check deploy logs.

---

## Cross-References

- Backlog: `docs/plans/L1-light-entity-management-architecture-backlog-2026-05-26.md`
- Kickoff prompt: `docs/plans/L1-kickoff-prompt-2026-05-26.md`
- Drift baseline: `Dashboard/Tunet/Docs/visual_defect_ledger.md` (Room light group membership drift section)
- Campaign A + B authority: `~/.claude/plans/office-corner-accent-relocation.md`
- S.2 sensor consumer context: `docs/plans/S2-oal-status-overhaul-2026-05-26.md` (CS4 lights_on_* sensors)
- HA reload procedure: `/home/mac/HA/implementation_10/CLAUDE.md` line 216 (corrected 2026-05-26)
