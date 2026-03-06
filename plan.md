# Tunet Suite Dashboard - Implementation Plan (V2 Next)

Working branch: `codex/unified-microinteractions`
Last updated: 2026-03-06

## Canonical Control Documents

- `plan.md` is the single execution source of truth for phase order, deployment order, and current status.
- `FIX_LEDGER.md` is the detailed findings, remediation, and validation backlog.
- `Dashboard/Tunet/Docs/agent_driver_pack.md` is the orchestration source of truth for multi-agent Tunet review runs.
- `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md` and the tranche prompt docs are the execution source of truth once broad planning has selected a single slice.
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` is the design-direction source of truth for the next four product decisions: nav, popup, integrated UI / UX, and home layout.
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` is the responsive Sections layout source of truth (view/section/card width model).
- `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` is the deployment-path and staging-root reality source of truth.
- `Dashboard/Tunet/CLAUDE.md` is the Tunet UI / UX quality bar.
- If a contributor needs to know what to do next, start here.
- If a contributor needs exact defects, exact files, exact validation, or a sub-agent-ready backlog, use `FIX_LEDGER.md`.
- If a contributor is executing one small slice, use the tranche docs rather than the broad agent driver.

### Control Document Precedence

If the control documents disagree, use this precedence order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/Docs/agent_driver_pack.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Contributors must not silently resolve these conflicts. Record them explicitly.

## Sync Snapshot (2026-03-06)

This sync captures what is now learned and locked before further UI changes:

- lock the utility band as dual strips (`actions` + `scenes/chips`)
- remove stale Bubble/hash popup instructions from active execution paths
- keep popup platform lock as Browser Mod with one popup per room
- lock room gesture contract as `tap -> toggle`, `hold -> Browser Mod popup`
- enforce anti-drift governance so micro-interaction changes cannot bypass docs and validation

## Execution Reset (2026-03-06)

This section is a mandatory execution override for all near-term Tunet work.

### Change Gate (Mandatory Before Any Implementation)

Every change must include:

- a `Change ID` (for example: `CP-01`, `LAY-02`, `INT-01`, `POP-01`)
- a cross-card impact statement (`nav`, `rooms`, `status`, `sensor`, and affected YAML surfaces)
- a surface declaration (`Repo Architecture Surface` vs `Storage/Hybrid Evaluation Surface`)
- a validation checklist (visual + interaction + regression)
- a rollback/cache-bust path when frontend modules or dashboard config change

If one of those is missing, implementation is not allowed to start.

### WIP Budget (Mandatory)

- One active tranche at a time.
- Maximum three active implementation items inside that tranche.
- No side-scope edits outside the active tranche objective.

### Definition Of Ready / Done

- `Ready`: decision-locked spec + impact map + concrete validation cases.
- `Done`: code/config changed, deployed where required, visually validated, and synced in `plan.md` + `FIX_LEDGER.md`.

## Current Execution Tranche

The current work is a control + layout foundation tranche, then interaction implementation.

### User-Locked Next Decision Order

The next four major decisions must be handled one at a time, in this order:

1. `NAV`
2. `POPUP`
3. `INTEGRATED UI / UX`
4. `HOME LAYOUT`

Contributors must not silently reorder these back into an older implementation-driven sequence without explicit user approval.

### What That Means Operationally

- Do not keep polishing the home layout while nav and popup direction are still unsettled.
- Do not treat the current storage overview composition as "the" final overview architecture.
- Do not use the current forced-mobile nav configuration as the baseline product direction.
- Do not continue investing in Bubble hash popups as the canonical path when the user preference is now Browser Mod.
- Do not treat popup work as generic card stacks; the product direction is one polished popup per room, styled like an iOS-grade sheet rather than a lazy default overlay.
- Do not treat component width as the only Sections concern; placement, role, one-touch controllability, and interaction hierarchy matter as much as span ratios.

### Current Active Tranche

`CP-02 - Governance + Direction Sync (Docs/Plan Lock)`

This tranche is intentionally bounded to stop execution drift before more card-level micro-interaction rollout.

### Tranche Deliverables

- a mandatory change gate and WIP budget applied to every new Tunet change
- a locked micro-interaction contract for room and light surfaces
- a locked dual utility band contract (`actions + scenes/chips`)
- a Sections-native layout research matrix and validated reference compositions
- no ad-hoc popup/nav behavior changes outside the locked contract

## System State Model

This section replaces the old mixed "reality snapshot."

For Tunet, three different truths must be kept separate:

1. `REPO STATE`
2. `LIVE HA STATE`
3. `PRODUCT STATE`

If these are blended together, future work will incorrectly treat:

- code existence as product acceptance
- live deployment as design completion
- historical experiments as current architecture

### Surface Model

Tunet now has more than one meaningful dashboard surface in play.

That is not inherently a problem. It becomes a problem only when contributors fail to say which surface they are optimizing.

For this project, the surfaces must be interpreted like this:

#### 1. Repo-Controlled Architecture Surface

- `Dashboard/Tunet/tunet-suite-config.yaml`
- role:
  - architecture source
  - repo-controlled reference implementation
  - deployment-safe staging baseline
- use this surface for:
  - canonical entity modeling
  - structural dashboard architecture
  - resource-root and deployment-path discipline
  - branch-reviewable changes
- do not use this surface alone to claim the daily-use product is correct

#### 2. Primary Evaluation / UI-Edit Surface

- `tunet-suite-storage`
- role:
  - user-facing evaluation surface
  - storage/hybrid editing surface
  - fastest place to judge whether the product actually feels right
- use this surface for:
  - tranche-by-tranche UX evaluation
  - testing whether a direction works for real daily use
  - checking whether UI-editability is acceptable
  - judging nav, popup, shell, and home-layout quality
- do not treat this surface as the only architecture source when it drifts from repo state

#### 3. Historical / Reference Surfaces

- `Dashboard/Tunet/tunet-overview-config.yaml`
- `Dashboard/Tunet/tunet-v2-test-config.yaml`
- older live storage dashboards
- role:
  - historical reference
  - component harness
  - migration/comparison aid
- use these surfaces for:
  - finding older behavior worth restoring
  - comparing V1/V2 behavior
  - validating isolated card behavior
- do not use these surfaces to define the next major product decision unless explicitly promoted

### Surface Leadership Rules

These rules exist to stop future work from optimizing the wrong thing:

- If the task is about:
  - product feel
  - one-touch usability
  - family-grade clarity
  - visual hierarchy
  - nav / popup / shell / home-layout judgment
  then the `Primary Evaluation / UI-Edit Surface` leads.

- If the task is about:
  - canonical architecture
  - branch truth
  - deployable reference config
  - entity normalization
  - resource pathing
  - long-term maintainability
  then the `Repo-Controlled Architecture Surface` leads.

- If the two surfaces drift:
  - contributors must say so explicitly
  - contributors must state which surface is being corrected first
  - contributors must not silently claim both are current and equivalent

- For this project’s current stage:
  - architectural direction should remain repo-legible
  - experiential judgment should be made on the storage/hybrid evaluation surface

### Direction Locks

These are active product-direction locks, not implementation facts:

- The next four major decisions must happen in this order:
  1. `NAV`
  2. `POPUP`
  3. `INTEGRATED UI / UX`
  4. `HOME LAYOUT`
- Browser Mod is the preferred direction for the next popup tranche.
- One popup per room is the intended popup model.
- Overview utility band is a dual-strip contract:
  - strip 1: `custom:tunet-actions-card`
  - strip 2: `custom:tunet-scenes-card`
- The interaction quality bar is Apple-grade in the sense of:
  - one-touch primaries
  - low cognitive load
  - premium but quiet chrome
  - progressive disclosure
- Sections decisions are about role, placement, hierarchy, and one-touch value, not just width ratios.

### Top-Down Product Considerations

These considerations flow from the intended daily-use experience:

- The suite must be understandable to people who did not build it.
- The first action and current location should be obvious without explanation.
- Nav is not just routing; it is the first premium product surface.
- Popups are not generic overlays; they are intentional, high-value room surfaces.
- Home layout should not be finalized before nav, popup, and shell language are settled.
- A surface earns width and prominence through interaction value, not because a card happens to exist.

### Bottom-Up System Considerations

These considerations flow from Home Assistant mechanics and maintainability:

- YAML and storage dashboards are both in play; contributors must state which surface they are touching.
- `v2_next` is still the staging root and remains the safe deployment target until cutover is approved.
- Custom cards can be implemented, deployed, and even visually improved before they are accepted as product direction.
- Historical Bubble/hash work exists in the branch and can still mislead future work unless explicitly fenced.
- V1 cards may be selectively reused, but custom element collisions must be avoided.

### Repo State

These are facts about the branch contents:

- DONE REPO.01: New dashboard YAML exists at `Dashboard/Tunet/tunet-suite-config.yaml`; Verify: the file exists on this branch.
- DONE REPO.02: V2 cards are deployed from repo under the `v2_next` staging path convention; Verify: `Dashboard/Tunet/Cards/v2/` is the active working suite.
- DONE REPO.03: `tunet-nav-card` exists in repo as the custom navigation foundation; Verify: `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` exists.
- DONE REPO.04: Bug 1 and Bug 2 code work exists in repo `tunet_status_card`; Verify: see Phase 0 verification tasks.
- DONE REPO.05: Bug 3 is removed from repo YAMLs (`sensor.aqi` removed); Verify: `rg "sensor\\.aqi" Dashboard/Tunet/*.yaml` returns no matches.
- DONE REPO.06: Office is merged into Living Room in repo configs; Verify: there is no `path: office` in `tunet-suite-config.yaml`.
- DONE REPO.07: Detailed remediation backlog exists in `FIX_LEDGER.md`; Verify: the file exists.
- DONE REPO.08: Multi-agent orchestration and tranche workflow docs exist on this branch; Verify: `agent_driver_pack.md` and tranche docs exist.

### Live HA State

These are facts about the deployed Home Assistant environment and should be re-validated before relying on them:

- DONE HA.01: Dashboard YAML is deployed to HA at `/config/dashboards/tunet-suite.yaml`; Verify: HA host filesystem shows the file at that path.
- DONE HA.02: `tunet-suite` YAML dashboard is registered in HA and reachable; Verify: Settings -> Dashboards lists `tunet-suite` and `/tunet-suite/overview` opens.
- DONE HA.03: V2 card resources are deployed under `/config/www/tunet/v2_next/`; Verify: direct browser fetch of a resource returns JS (200).
- DONE HA.04: Lovelace resources were repointed to `/local/tunet/v2_next/...`; Verify: Settings -> Dashboards -> Resources shows `/local/tunet/v2_next/` URLs.
- DONE HA.05: HA Core version is `2026.3.0b1`; Verify: Settings -> About shows `2026.3.0b1`.
- TODO HA.06: At least one HA Storage dashboard still contains stale `sensor.aqi` references; Verify: searching storage dashboard YAML in HA still finds `sensor.aqi`.
- TODO HA.07: V2 config-editor behavior is not validated end-to-end in the live UI; Verify: Phase 0 diagnostics.

### Product State

These are facts about what the product has and has not actually achieved yet. They are not satisfied merely because code or deployment exists.

- DONE PRODUCT.01: The project now has a credible control-plane model: branch discipline, doc precedence, tranche workflow, and explicit direction locks.
- DONE PRODUCT.02: The order of the next major decisions is now aligned to actual user intent: nav, popup, integrated UI / UX, home layout.
- PARTIAL PRODUCT.03: The custom nav exists, but it is not yet accepted as the real premium chrome experience.
- PARTIAL PRODUCT.04: The overview is structurally better than the original vertical-stack state, but the home-screen product direction is not yet settled.
- PARTIAL PRODUCT.05: Status-card parity work reduced one visible regression, but it did not solve the upper-overview product hierarchy.
- PARTIAL PRODUCT.06: Browser Mod room popup standard is implemented for Living + Kitchen; Dining + Bedroom still need completion.
- DONE PRODUCT.07: Room micro-interaction contract is locked (`tap toggle`, `hold popup`) and enforced in control docs.
- DONE PRODUCT.08: Utility-band direction is locked as dual strips (`actions + scenes/chips`).
- TODO PRODUCT.09: The V1 atmosphere / shell language has not yet been recovered in a Sections-compatible way.
- TODO PRODUCT.10: The home hero and overview hierarchy are not yet accepted as the final daily-use product direction.

## Supersession Register

This register exists so future work does not silently reuse displaced assumptions.

| Old Assumption | Replaced By | Why | Do Not Use For | Still Reusable For |
|---|---|---|---|---|
| Bubble/hash popup POC is the active popup path | Browser Mod preferred, one popup per room | The user explicitly redirected popup architecture toward a more robust and premium overlay model | choosing the next popup platform | harvesting narrow implementation ideas from historical POC work |
| Layout should keep being refined before nav/popup/UI direction is settled | Nav first, popup second, integrated UI / UX third, home layout fourth | Product-decision order is now locked | choosing the next major tranche | critiquing what is structurally wrong with the current overview |
| Lighting + Environment is a locked final overview answer | Lighting + companion is only the current leading home-layout candidate | Home layout is still downstream of nav, popup, and shell decisions | claiming the home-screen design is settled | starting later home-layout exploration |
| Implemented in repo means effectively done | Repo state, live HA state, and product state must be tracked separately | This project is design-led and daily-use quality matters as much as code existence | claiming a product surface is complete | operational rollout tracking |

## Branch And Findings Discipline

- Broad Tunet planning work is authoritative only on branch `claude/dashboard-nav-research-QnOBs`.
- Contributors must record the live current branch and HEAD before producing planning artifacts.
- Prior findings must be classified as:
  - `OPEN`
  - `ALREADY FIXED IN REPO`
  - `FIXED IN REPO BUT NOT DEPLOYED`
  - `FIXED IN YAML BUT NOT STORAGE`
- Contributors must not repeat older findings as open without checking current branch state first.

### Known Findings That Must Be Reconciled Before Reuse

- `back_path` is already present on Tunet suite subviews on this branch.
- the storage Living Room popup already uses one consolidated `tunet-lighting-card` on this branch.
- `tunet_sensor_card.js` `value_attribute` support must be checked against current branch state before restating it as open.
- nav active color token drift in `tunet_nav_card.js` must be checked against current branch state before restating it as open.

## Goals
- Make `tunet-suite` a real HA dashboard: registered, visible, loads without red error cards or custom-element collisions.
- Use Sections layout correctly: no forced vertical sizing; cards self-size by content; default grid hints use columns + min_columns (no hard max unless explicitly justified).
- Establish navigation architecture with the custom `tunet-nav-card` as a real product surface, not a hidden POC.
- Prefer Browser Mod for the next popup tranche rather than continuing to treat hash popups as canonical.
- Lock and implement a dual utility band (`tunet-actions-card` + `tunet-scenes-card`) as the top control surface.
- Prevent micro-interaction drift through mandatory contract + validation updates before behavior changes.
- Start from ONE working popup proof, then converge on a repeatable pattern: minimal quick actions + one intentional interaction surface + clear route to deeper control.
- Rollback stays easy: keep `v2_next` as staging; keep a stable resource root available for quick revert.

## Non-Goals
- Full visual UI editors for complex nested arrays (tiles/zones/sensors) unless required; YAML remains acceptable for power-user configs.
- Creating an Office room/surface (Office is part of Living Room).
- Retheming/redesigning cards beyond what is required for correctness, navigation, and readability.
- Migrating every legacy HA Storage dashboard (only fix those blocking progress and known-bad entities like `sensor.aqi`).

## Constraints / Rules Of Engagement
- Grid sizing strategy: do NOT force vertical rows; let Sections auto-size height; default to `columns` + `min_columns` in `getGridOptions()` and avoid `rows:` in YAML configs.
- Popup strategy: Browser Mod is the preferred direction for the next popup tranche. Existing Bubble/hash work is historical POC material unless explicitly re-approved.
- Popup content strategy: prefer ONE intentional interaction surface inside the popup (do not duplicate many `tunet-light-tile` cards).
- Popup product strategy: one popup per room, polished like an iOS-grade overlay, no lazy default styling, no generic pill grabber.
- Interaction standard: optimize for one-touch controllability on primary actions in the Apple sense of clarity, immediacy, and progressive disclosure.
- V1 cards may be used selectively if they are better, but avoid custom element tag collisions:
- Do NOT load V1 and V2 resources that define the same `customElements.define('tunet-*')` tags at the same time.
- If a V1 card is required, either rename its custom element tag(s) or isolate it into a dashboard/resource set that does not load the V2 suite.

## Near-Term Tranche Sequence (Supersedes Older Near-Term Order)

The near-term product sequence is now:

1. `CP-02 - Governance + Direction Sync (Docs/Plan Lock)`
2. `T-006 - Browser Mod popup completion + interaction contract finish`
3. `T-007 - Integrated UI / UX utility-band implementation`
4. `T-008 - Sections layout matrix runtime enforcement`
5. `T-009 - Home layout and hero finalization`

These tranches must be handled one at a time and verified before the next tranche starts.

### Locked Micro-Interaction Contract (2026-03-06)

- Room tile:
  - tap -> toggle all room lights
  - hold (>= 400ms) -> room popup (Browser Mod, `fire-dom-event`)
  - room tile navigation gesture is not required because global nav provides room-page access
- Light controls:
  - keep tap-to-toggle behavior as default
  - hold semantics are per-control and must be documented where used
- Popup platform:
  - Browser Mod only for active popup work unless an explicit exception is recorded

### Micro-Interaction Drift Prevention (Locked)

Any change that touches tap/hold/double-tap/navigation/popup behavior must include all of the following before merge or deploy:

1. `Change ID` + touched interaction surfaces (`rooms`, `status`, `lighting`, `nav`, popup YAML)
2. explicit before/after contract statement in this plan
3. matching ledger entry update in `FIX_LEDGER.md` (`OPEN`, `PARTIAL`, or `DONE` with validation)
4. live validation evidence across at least:
   - one phone width
   - one tablet width
   - one desktop width

If any one of those artifacts is missing, the interaction change is considered drift and must be rolled back or re-scoped.

### Sections Layout Research Contract (2026-03-06)

- Native Sections responsiveness is mandatory.
- Card-level hard width caps are disallowed by default.
- `getGridOptions()` should prefer flexible sizing (no hard `max_columns`) unless a documented exception exists.
- Layout decisions must be validated at phone, tablet, and desktop widths using role-based compositions (for example 60/40, 50/50, 1/3-2/3), not just one-card-per-section stacking.

### Directional Notes For The Next Four Decisions

- `NAV`:
  - nav should act as premium chrome and may carry tiny live-state hints where they materially improve scannability
  - avoid turning nav into a full content surface too early
- `POPUP`:
  - one popup per room
  - Browser Mod preferred
  - visually polished like an iOS-grade sheet, not a generic card stack
- `INTEGRATED UI / UX`:
  - recover V1 atmosphere, rhythm, and polish in a Sections-compatible way
  - prioritize one-touch clarity over decorative complexity
- `HOME LAYOUT`:
  - decide placement by interaction role and one-touch value, not just by span ratios or card dimensions

## Phase 0 - Make The POC Reachable And Safe (Registration, Resources, Cache, Baselines)

### 0.1 - Safety Baseline (HA-Side)
- TODO P0.01: Create a full HA backup named `pre_tunet_suite_2026_03_01`; Outcome: rollback point exists; Verify: Settings -> System -> Backups lists the new backup with the expected name/timestamp.
- TODO P0.02: Capture current Lovelace Resources list (URLs + types) for rollback; Outcome: exact rollback path for resources; Verify: screenshot or copied text is saved somewhere outside HA cache (notes).
- TODO P0.03: Capture current Dashboards list (URL paths + modes) for rollback; Outcome: exact rollback path for dashboards; Verify: screenshot/notes of Settings -> Dashboards.

### 0.2 - Register `tunet-suite` YAML Dashboard (Do Not Assume It Is Registered)
- DONE P0.04: Confirm `/config/dashboards/tunet-suite.yaml` exists on HA; Outcome: registration points to a real file; Verify: `/tunet-suite/overview` opens.
- DONE P0.05: Register `tunet-suite` in `/config/configuration.yaml` under `lovelace: dashboards:` (mode: yaml, filename: `dashboards/tunet-suite.yaml`); Outcome: HA knows about the dashboard; Verify: Settings -> Dashboards shows it.
- DONE P0.06: Restart HA after `configuration.yaml` edit; Outcome: dashboard registration loads; Verify: HA returns to RUNNING state and dashboards list is accessible.
- DONE P0.07: Confirm `tunet-suite` appears in Settings -> Dashboards; Outcome: dashboard is registered; Verify: it shows with correct title/icon and opens.
- TODO P0.08: Open `/tunet-suite/overview` in the UI and sanity-check rendering; Outcome: Overview view loads; Verify: no "dashboard not found" and no red error banners.

### 0.3 - Resource Hygiene (V2 Next + Collision Avoidance)
- DONE P0.09: V2 JS is deployed to `/config/www/tunet/v2_next/`; Outcome: HA can serve the files; Verify: open `/local/tunet/v2_next/tunet_status_card.js` in a browser and see source.
- TODO P0.10: Confirm `tunet_base.js` exists at `/config/www/tunet/v2_next/tunet_base.js`; Outcome: runtime imports succeed; Verify: open `/local/tunet/v2_next/tunet_base.js` and it loads (200).
- DONE P0.11: Lovelace resources point to `/local/tunet/v2_next/...` and are `type: module`; Outcome: correct import semantics; Verify: Settings -> Dashboards -> Resources list.
- DONE P0.12: Confirm Browser Mod resource is installed and loaded; Outcome: popup-card and Browser Mod actions can render; Verify: Lovelace Resources includes `/browser_mod.js`.
- TODO P0.13: Confirm there are no duplicate Tunet resources (V1 + V2) defining the same tag names; Outcome: no registry collisions; Verify: browser console has no `Failed to execute 'define'` errors mentioning `tunet-`.

### 0.4 - Cache Bust Strategy (So Testing Is Real)
- DONE P0.14: Bump a single coherent `?v=` on all `/local/tunet/v2_next/*.js` resources (same version string across all cards); Outcome: HA frontend reloads modules; Verify: Lovelace Resources show consistent `?v=` values.
- TODO P0.15: Hard refresh with DevTools "Disable cache" enabled; Outcome: no stale resources; Verify: Network tab shows resources fetched with the bumped `?v=`.

### 0.5 - Grid Sizing Alignment (Sections Auto-Height)
- DONE P0.31: Remove stale `rows:` constraints from Tunet YAML dashboards (`tunet-suite-config.yaml`, `tunet-overview-config.yaml`, `tunet-v2-test-config.yaml`); Outcome: lighting cards now use intrinsic height in Sections at the repo level; Verify: `rg -n "rows:\\s*2" Dashboard/Tunet/*.yaml` returns no matches.
- DONE P0.32: V2 cards implement columns-only `getGridOptions()` (no `rows`, `min_rows`, `max_rows`); Outcome: Sections sizing hints follow policy; Verify: code search shows no `min_rows`/`max_rows` and default hints use `{ columns, min_columns }` unless an explicit exception is documented.
- TODO P0.33: Verify Sections auto-height visually on `/tunet-suite/overview`; Outcome: cards expand to fit content; Verify: no cut-off content in lighting/status/sensor cards at multiple viewport widths.

### 0.6 - Entity Inventory Audit (Prevent Red Error Cards)
- TODO P0.16: In HA Developer Tools -> States, confirm core system entities exist: `sensor.oal_system_status`, `sensor.oal_global_brightness_offset`, `input_select.oal_active_configuration`; Outcome: status/actions cards can render; Verify: each entity is present and has state.
- TODO P0.17: Confirm core services/scripts exist: `script.oal_reset_soft`; Outcome: aux actions work; Verify: calling script works (or update config to match real script).
- TODO P0.18: Confirm room light group entities exist: `light.living_room_lights`, `light.kitchen_island_lights`, `light.bedroom_primary_lights`; Outcome: consolidated room lighting surfaces can use group expansion; Verify: each entity exists and toggles.
- TODO P0.19: Confirm per-light entities referenced in `tunet-suite-config.yaml` exist (Living: couch/floor/spots/credenza/desk; Kitchen: pendants/main/under-cab; Dining: spots/columns; Bedroom: main/accent/table lamps); Outcome: no missing lights; Verify: no entity rows are missing in States.
- TODO P0.20: Confirm media entities exist: `media_player.living_room`, `media_player.kitchen`, `media_player.dining_room`, `media_player.bedroom`; Outcome: media cards can render; Verify: each entity exists (or remove speakers from config).
- TODO P0.21: Confirm climate entity exists: `climate.dining_room`; Outcome: climate card works; Verify: entity exists and responds.
- TODO P0.22: Confirm sensor entities exist: `sensor.dining_room_temperature`, `sensor.kitchen_humidity`; Outcome: sensor/status cards populate; Verify: values are numeric and update.

### 0.7 - Validate Phase 0 Bugs In Real UI (Even If Code Is Done)
- DONE P0.23: Bug 1 implemented in V2 `tunet_status_card` (uniform padding; no conditional `has-aux` padding); Outcome: row height is uniform across tiles.
- TODO P0.24: Verify Bug 1 on `/tunet-suite/overview`; Outcome: tiles with/without aux pill appear equal height; Verify: visually inspect mixed tiles in same row.
- DONE P0.25: Bug 2 implemented (`aux_show_when` respected + state tracking); Outcome: aux pill shows only when condition passes.
- TODO P0.26: Verify Bug 2 by forcing global offset to 0 and non-0; Outcome: "Reset" pill toggles visibility without reload; Verify: observe pill appear/disappear as the entity changes.
- DONE P0.27: Bug 3 removed from repo YAMLs (`sensor.aqi` removed); Outcome: repo YAMLs are clean.
- TODO P0.28: Locate and remove any `sensor.aqi` references in HA Storage dashboards; Outcome: no missing entity rows remain; Verify: in HA dashboard YAML editor search `sensor.aqi` returns zero matches.
- TODO P0.29: Verify legacy Storage dashboards no longer show `?` for AQI; Outcome: clean sensor rows; Verify: open affected dashboards and confirm no AQI row.
- TODO P0.30: Validate Bug 4 by adding a simple Tunet card via the UI card picker; Outcome: confirm whether config editors appear; Verify: Add card -> pick a Tunet card (nav/weather/climate) shows a form instead of YAML-only.

### 0.8 - Findings Backlog Reconciliation
- DONE P0.34: `FIX_LEDGER.md` exists and is linked from this plan; Outcome: there is now one detailed backlog for findings and fixes; Verify: `FIX_LEDGER.md` exists at repo root.
- TODO P0.35: Work immediate operational items from `FIX_LEDGER.md` first (FL-001 through FL-010); Outcome: plan, repo, and live staging state stop drifting; Verify: each item is either closed in code/docs or explicitly deferred with rationale.

### Phase 0 Verification Checklist (Click/Observe)
- TODO P0.V01: Settings -> Dashboards shows "Tunet Suite (POC)" and it opens; Verify: `/tunet-suite/overview` loads.
- TODO P0.V02: `/tunet-suite/overview` renders all custom cards without red error cards; Verify: scroll through Overview and confirm no "Custom element doesn't exist" errors.
- TODO P0.V03: Browser console is clean of registry collisions and 404 module loads; Verify: no `customElements.define` collisions and no failed module imports.
- TODO P0.V04: DevTools Network shows Tunet card modules loaded from `/local/tunet/v2_next/` with the latest `?v=`; Verify: every `tunet_*.js` resource request includes the bumped version.

## Phase 1 - Browser Mod Room Popup Standard (Active)

### Definition Of Done (Working Contract)
- all room popups use Browser Mod (`custom:popup-card` + `browser_mod.popup`)
- one popup per room (`living-room`, `kitchen`, `dining-room`, `bedroom`)
- room tile interaction is consistent:
  - tap -> room toggle
  - hold -> room popup (`fire-dom-event`, browser-scoped)
- each popup stays intentionally narrow:
  - quick actions
  - one primary interaction surface
  - route to full room view

### 1.1 - Current Progress Snapshot
- DONE P1.01: Living Room popup-card exists and routes from room hold action.
- DONE P1.02: Kitchen popup-card exists and routes from room hold action.
- DONE P1.03: Popup cards use `initial_style` (no deprecated `size` field).
- DONE P1.04: Living/Kitchen popups use one consolidated `tunet-lighting-card` each (no tile stacks).
- DONE P1.05: Room tile interaction contract implemented in `tunet-rooms-card` (`tap toggle`, `hold popup`).

### 1.2 - Remaining Room Popup Work
- TODO P1.06: Add Dining room popup-card and wire hold action to `popup_card_id: dining-room-popup`.
- TODO P1.07: Add Bedroom popup-card and wire hold action to `popup_card_id: bedroom-popup`.
- TODO P1.08: Add explicit "Open Room" route action inside each popup surface.
- TODO P1.09: Ensure each popup has quick actions without oversized controls.
- TODO P1.10: Validate popup behavior at 390px and 520px widths (no horizontal overflow).

### Phase 1 Verification Checklist (Click/Observe)
- TODO P1.V01: Long-press each room tile; verify matching room popup opens.
- TODO P1.V02: In each popup, verify exactly one primary lighting surface.
- TODO P1.V03: Tap popup "Open Room"; verify correct subview opens.
- TODO P1.V04: Verify browser back/forward keeps nav and popup behavior coherent.

## Phase 2 - Room Subviews (Consolidation + Companion Surfaces)

### 2.1 - Living Room Subview
- DONE P2.01: Living Room subview uses one consolidated `tunet-lighting-card`.
- TODO P2.02: Add room-scoped actions row for Living Room.
- TODO P2.03: Keep/add media companion for `media_player.living_room`.
- TODO P2.04: Keep room companion sensors minimal and non-empty (no placeholder shells).

### 2.2 - Kitchen / Dining / Bedroom Subviews
- TODO P2.05: Kitchen subview uses one consolidated `tunet-lighting-card`.
- TODO P2.06: Dining subview uses one consolidated `tunet-lighting-card`.
- TODO P2.07: Bedroom subview uses one consolidated `tunet-lighting-card`.
- TODO P2.08: Keep Dining climate and validate Bedroom control capability-fit.
- TODO P2.09: Add media companions only where entities exist.

### 2.3 - Regression Guard
- DONE P2.10: Office remains merged into Living Room.
- TODO P2.11: Ensure no room lists or nav items reintroduce Office.

### Phase 2 Verification Checklist (Click/Observe)
- TODO P2.V01: Open each room subview and verify no red error cards.
- TODO P2.V02: Verify one consolidated lighting surface per room subview.
- TODO P2.V03: Verify room-level actions/media companions behave as configured.

## Phase 3 - Utility Band And Integrated UI / UX Prep

### 3.1 - Utility Band Contract (Locked)
- DONE P3.01: Utility band direction is dual-strip (`actions` + `scenes/chips`) in control docs.
- TODO P3.02: Ensure repo storage config and live storage config both carry the dual strip consistently.
- TODO P3.03: Define minimal sizing and spacing contract so strips remain compact on phone/tablet/desktop.

### 3.2 - Integrated UI / UX Lessons To Carry Forward
- Keep primary actions one-touch and obvious.
- Keep overlays intentionally minimal and non-duplicative.
- Keep section span decisions role-based, not card-size-driven.
- Keep card-level `max_columns` as explicit exception only.

## Phase 4 - Navigation Card Hardening (Beyond POC)

### 4.1 - Active Route Highlighting
- DONE P4.01: `tunet-nav-card` exists with 3 items and desktop breakpoint 900; Outcome: nav renders; Verify: nav card appears in `tunet-suite-config.yaml`.
- TODO P4.02: Verify active highlighting updates on view navigation and browser back/forward; Outcome: no stale active state; Verify: active icon changes correctly when navigating Overview/Rooms/Media.
- TODO P4.03: Verify room subviews count as Rooms active; Outcome: Rooms stays highlighted in subviews; Verify: open `/tunet-suite/living-room` and Rooms is active.

### 4.2 - Safe Area, Offsets, And Kiosk
- TODO P4.04: Validate safe-area padding on mobile (iOS/Android); Outcome: nav not clipped; Verify: device with notch shows full nav.
- TODO P4.05: Validate global offsets applied by nav card do not affect non-Tunet dashboards; Outcome: offsets are scoped or safe; Verify: open a non-Tunet dashboard and confirm layout unchanged.
- TODO P4.06: Decide kiosk-mode approach for `tunet-suite` (kiosk-mode HACS vs native) and implement; Outcome: tablet view has clean chrome; Verify: header/sidebar hidden as desired.

### 4.3 - Optional Media Mini-Player (Only If Worth It)
- TODO P4.07: Decide whether to add a mini-player to nav card or rely on Media view; Outcome: avoid feature creep; Verify: decision captured as DONE/TODO in this plan.
- TODO P4.08: If mini-player is kept, implement minimal now-playing + play/pause + tap to `/tunet-suite/media`; Outcome: lightweight media access; Verify: controls work and do not degrade performance.

### Phase 4 Verification Checklist (Click/Observe)
- TODO P4.V01: Resize viewport below/above 900px; Verify: bottom bar becomes side rail without layout breakage.
- TODO P4.V02: Navigate Overview -> Rooms -> Media -> Rooms; Verify: active state always correct.
- TODO P4.V03: Confirm nav does not cover the last content on any view/subview; Verify: bottom-most cards remain accessible.

## Phase 5 - Bugs, Config Editors, V1 Selective Use, And Cutover

### 5.1 - Bug 4: Config Editors (Do Not Assume)
- TODO P5.01: Record HA Core + Frontend versions from Settings -> About; Outcome: known compatibility baseline; Verify: versions are written into this plan under a new DONE snapshot line.
- TODO P5.02: Test `getConfigForm()` support by adding `custom:tunet-nav-card` via UI card picker; Outcome: confirm schema editor works (or not); Verify: either a form appears or it stays YAML-only.
- TODO P5.03: If `getConfigForm()` is unsupported, decide between implementing `getConfigElement()` (at least for nav/weather/climate) vs accepting YAML-only; Outcome: clear direction; Verify: decision is recorded as DONE with rationale.
- TODO P5.04: If implementing `getConfigElement()`, spike on `tunet-nav-card` first (small surface); Outcome: one working visual editor element; Verify: visual editor appears for nav card.

### 5.2 - HA Storage Dashboard Cleanup (Targeted)
- TODO P5.05: Remove `sensor.aqi` from any HA Storage dashboards still containing it; Outcome: no missing entity rows; Verify: storage dashboards YAML search returns zero hits.
- TODO P5.06: Remove any stale `rows:` constraints in Storage dashboards that clip Sections height; Outcome: auto-height works; Verify: no clipping in UI.

### 5.3 - V1 Cards Selective Use (If Needed)
- TODO P5.07: Identify any specific V1 card that is materially better than its V2 counterpart (document which and why); Outcome: justified exception list; Verify: list exists with at least one measurable reason (bug-free, better UX, missing V2 feature).
- TODO P5.08: For each V1 exception, choose collision-safe strategy (rename tag or isolate resources); Outcome: no `customElements.define` collisions; Verify: console clean after loading.
- TODO P5.09: If renaming tags, ensure YAML uses the renamed `custom:` type and that resources load only once; Outcome: stable mixed suite; Verify: no collisions and cards render.

### 5.4 - Cutover Strategy (When POC Is Good)
- TODO P5.10: Decide stable deployment convention: keep `/local/tunet/v2_next/` as stable or promote to `/local/tunet/v2/`; Outcome: a single stable root; Verify: decision recorded.
- TODO P5.11: If promoting, copy v2_next to v2 and repoint resources; Outcome: stable `/local/tunet/v2/` usage; Verify: resources list uses v2 and UI works after cache bust.
- TODO P5.12: Optionally hide legacy dashboards after cutover; Outcome: users land on the right dashboard; Verify: sidebar is decluttered and no broken links.

### Phase 5 Verification Checklist (Click/Observe)
- TODO P5.V01: Add a Tunet card via UI card picker; Verify: config editor behavior matches expectation and is documented.
- TODO P5.V02: Open any legacy dashboard previously affected by AQI; Verify: no missing entity rows remain.
- TODO P5.V03: Confirm cutover resources load and no collisions occur; Verify: console is clean after hard refresh.

## Deployment Runbook (HA-Side Actions, Rollback, Cache Bust)

### Deploy Cards To HA (`v2_next`)
- DONE DEP.01: V2 card JS is deployed to `/config/www/tunet/v2_next/`; Outcome: staging root exists; Verify: direct fetch works.
- TODO DEP.02: Ensure deployed directory includes all `tunet_*.js` and `tunet_base.js`; Outcome: imports succeed; Verify: each file fetch returns 200.
- TODO DEP.03: Ensure Lovelace resources are `type: module` and point at `/local/tunet/v2_next/` (plus Browser Mod resource); Outcome: correct loader; Verify: resource list matches.

### Deploy Dashboard YAML
- DONE DEP.04: `Dashboard/Tunet/tunet-suite-config.yaml` is copied to `/config/dashboards/tunet-suite.yaml`; Outcome: YAML exists on HA; Verify: file present and readable.
- TODO DEP.05: After YAML changes, refresh `/tunet-suite/overview`; Outcome: YAML changes take effect; Verify: UI reflects edits.

### Register Dashboard (One-Time)
- DONE DEP.06: Add `lovelace: dashboards: tunet-suite:` entry in `/config/configuration.yaml`; Outcome: dashboard registered; Verify: Settings -> Dashboards lists it.
- DONE DEP.07: Restart HA after registration; Outcome: registration loaded; Verify: dashboard opens successfully.

### Cache Bust (Repeatable)
- TODO DEP.08: Bump a single `?v=` across all Tunet resources every deploy; Outcome: predictable cache behavior; Verify: DevTools Network shows new query values.
- TODO DEP.09: Use hard refresh + disable cache during development; Outcome: eliminates stale frontend; Verify: resources re-fetch (200).

### Rollback (Fast Path)
- TODO DEP.10: Keep a known-good stable resource root (e.g., `/local/tunet/v2/`) available; Outcome: rollback path exists; Verify: stable resources are still present on HA.
- TODO DEP.11: If v2_next breaks, repoint resources back to stable root and hard refresh; Outcome: broken JS no longer loads; Verify: console errors disappear.
- TODO DEP.12: If `tunet-suite` YAML breaks badly, hide/remove dashboard registration temporarily; Outcome: users are not blocked; Verify: sidebar no longer shows tunet-suite.

## Known Gaps / Honesty List
- TODO GAP.01: Exact HA Core/Frontend versions are not recorded here yet; Outcome: cannot conclude config editor support; Verify: Phase 5 captures versions as DONE.
- TODO GAP.02: Some entity IDs may differ between HA and YAML; Outcome: risk of red error cards; Verify: Phase 0 entity audit completed and YAML updated as needed.
- TODO GAP.03: `v2_next` is active in HA but repo docs may mention `v2`; Outcome: confusion risk; Verify: plan/runbook clearly states active root and rollback.
- TODO GAP.04: Popup styling is optimized for dark glass; Outcome: light mode may need tweaks; Verify: Phase 3 tests both modes.
- TODO GAP.05: Mixing V1 and V2 is risky due to tag collisions; Outcome: may require renames/isolation; Verify: Phase 5 collision-safe strategy executed.

## If Config Editors Still Don't Show (Diagnostics)
- TODO DIAG.01: Confirm there are no `customElements.define` collisions in browser console; Outcome: cards register properly; Verify: console is clean on refresh.
- TODO DIAG.02: Confirm all Tunet resources are loaded as `type: module`; Outcome: module semantics valid; Verify: resource list.
- TODO DIAG.03: Confirm HA Frontend supports `getConfigForm`; Outcome: avoid chasing impossible UI; Verify: version check + HA release notes.
- TODO DIAG.04: In browser console, run `window.customCards?.map(c => c.type)` and confirm `tunet-*` entries exist; Outcome: frontend sees card metadata; Verify: list includes Tunet cards.
- TODO DIAG.05: Try adding `custom:tunet-nav-card` via "Add card"; Outcome: simplest config surface; Verify: form appears (or not) consistently after cache bust.
- TODO DIAG.06: If schema UI never appears, implement a `getConfigElement()` spike for ONE card; Outcome: prove editor pipeline; Verify: visual editor appears for that card.
- TODO DIAG.07: If even `getConfigElement()` does not work, investigate broader frontend issues (failed module loads, CSP, JS errors); Outcome: root cause identified; Verify: underlying errors resolved before continuing.
