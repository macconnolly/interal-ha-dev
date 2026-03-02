# Tunet Suite Fix Ledger

Working branch: `claude/dashboard-nav-research-QnOBs`
Last updated: 2026-03-01
Scope: `/home/mac/HA/implementation_10`

## Purpose

This file is the machine-actionable findings ledger for the Tunet Suite work.

- `plan.md` is the execution source of truth.
- `FIX_LEDGER.md` is the detailed findings and remediation source of truth.
- When a sub-agent needs exact work items, use this file first.
- When a human needs phase order, rollout order, or deployment order, use `plan.md`.

## Canonical Decisions Already Made

- Dashboard target: new YAML dashboard at `/tunet-suite`, not in-place mutation of the existing overview dashboard.
- Resource strategy: keep `v2_next` as the active staging root until cutover is explicitly approved.
- Layout strategy: native HA Sections layout is the primary layout engine.
- Vertical sizing strategy: do not force vertical rows in production sections cards unless there is a compelling card-specific exception.
- Navigation strategy: custom `tunet-nav-card` is the navigation foundation.
- Room strategy: Office is not a room; Office lighting is part of Living Room.
- Popup strategy: current POC uses Bubble Card for room quick-control popups; this is still a decision area for long-term standardization.
- Card editor strategy: `getConfigForm()` remains acceptable for simple/scalar configs; nested array editing is not considered solved.

## How To Use This Ledger

For each item:
- Read the `Exact Fix`.
- Read the `Why This Matters`.
- Respect the `Dependency` ordering.
- Do not mark the item done until the `Validation` step is complete.
- If a code change is made but HA has not yet been refreshed or redeployed, keep the status as `CODE-DONE / HA-VERIFY`.

## File Scorecard

These grades are implementation-health grades, not value judgments. They reflect current production readiness relative to the stated Tunet goals.

| File | Grade | Summary | Primary Reason |
|---|---|---|---|
| `plan.md` | B | Strong execution framing, but needed linkage to the concrete findings backlog | Plan and repo state were drifting |
| `FIX_LEDGER.md` | A | Detailed backlog and validation source | Created to remove ambiguity |
| `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` | D | Operationally dangerous before reconciliation | Documented `v2` while staging actually uses `v2_next` |
| `Dashboard/Tunet/tunet-suite-config.yaml` | C | Correct macro architecture, but still had entity/config drift and incomplete POC composition | Mixed popup/subview patterns, stale entities, forced rows |
| `Dashboard/Tunet/tunet-overview-config.yaml` | C | Useful legacy reference, but not fully aligned with sections auto-height policy | Still forced `rows: 2` |
| `Dashboard/Tunet/tunet-v2-test-config.yaml` | C | Good harness, but still contained stale sizing assumptions | Still forced `rows: 2` |
| `Dashboard/Tunet/Docs/dashboard_navigation_research.md` | C | Valuable historical research, but not a safe implementation reference without qualification | Describes browser_mod-first world, not current POC reality |
| `Dashboard/Tunet/Cards/v2/tunet_base.js` | B+ | Shared tokens and registration foundation are strong | Needs more discipline from consuming cards |
| `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` | C | Correct high-level concept, but global layout side effects are too broad | Global offsets, direct `pushState`, weak config editor story |
| `Dashboard/Tunet/Cards/v2/tunet_status_card.js` | B | Bug 1 and Bug 2 work is present | Still uses manual history navigation pattern |
| `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` | B- | Flexible and reusable, but still carries legacy fixed-row semantics | `rows` still influences visible tile count |
| `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` | B | Focused and relatively isolated | Less strategically important once consolidated room surfaces are used |
| `Dashboard/Tunet/Cards/v2/tunet_climate_card.js` | B | Architecturally sound and stable | No major audit blocker surfaced |
| `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` | B | Generally sound | Depends on broader entity consistency |
| `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` | C- | Needed real functionality fix for attribute-based sensors | Missing `value_attribute` support, stale AQI stub |
| `Dashboard/Tunet/Cards/v2/tunet_media_card.js` | C | Good UI surface, but config contract and speaker invalidation need work | Group sensor contract drift and stale cache risk |
| `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js` | C | Viable card, but responsive density needs refinement | Mobile column behavior too rigid |
| `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` | C | Right role in IA, but still relies on direct history manipulation | Navigation implementation is brittle |
| `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js` | B- | Rich capability surface, but not currently in production path | Needs explicit role decision |
| `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` | B | Straightforward and low-risk | No major issue surfaced in this tranche |

## Remediation Ledger

### Immediate Operational Alignment

#### FL-001
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
  - `plan.md`
- Problem:
  - Repo documentation described `/config/www/tunet/v2/` and `/local/tunet/v2/` as the active root even though the active staging deployment is `/config/www/tunet/v2_next/` and `/local/tunet/v2_next/`.
- Exact Fix:
  - Rewrite deployment documentation so it explicitly distinguishes:
    - active staging root: `v2_next`
    - optional stable rollback root: `v2`
  - Use one consistent version string example across the doc.
  - State that `tunet_base.js` is not a Lovelace resource but must exist beside the modules.
- Why This Matters:
  - A deployment guide that points at the wrong root can silently load stale JS and invalidate every UI result.
- Dependency:
  - None.
- Validation:
  - Read the doc and confirm every example path matches the actual active HA resource list.

#### FL-002
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The dashboard configs still force `rows: 2` on the lighting card even though the agreed sections policy is auto-height.
- Exact Fix:
  - Remove `rows: 2` from all shipped YAML lighting-card configs unless there is a documented exception.
- Why This Matters:
  - In the current lighting card, `rows` is not just a height hint; it limits the number of visible tiles.
  - This violates the new “let sections size vertically” policy and can hide content.
- Dependency:
  - None.
- Validation:
  - `rg -n "rows:\\s*2" Dashboard/Tunet/*.yaml` returns zero matches.

### Entity Drift And Config Contract Fixes

#### FL-003
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Bedroom config in the suite still references `light.bedroom_accent_light` while the repo’s other dashboard YAMLs and live HA validation indicate the correct accent entity is `light.master_bedroom_corner_accent_govee`.
- Exact Fix:
  - Replace all Bedroom accent references in the suite config with `light.master_bedroom_corner_accent_govee`.
- Why This Matters:
  - This is a straight entity drift bug. It produces missing controls or broken room surfaces.
- Dependency:
  - None.
- Validation:
  - `rg -n "bedroom_accent_light|master_bedroom_corner_accent_govee" Dashboard/Tunet/tunet-suite-config.yaml` shows only the Govee entity.

#### FL-004
- Status: `DONE`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- Problem:
  - The media card’s default contract expects `active_group_sensor: sensor.sonos_active_group_coordinator`, but the suite YAML used `sensor.sonos_smart_coordinator`.
- Exact Fix:
  - Align the suite YAML with the card’s own documented contract and use `sensor.sonos_active_group_coordinator` everywhere `active_group_sensor` is configured for `tunet-media-card`.
- Why This Matters:
  - Live HA currently exposes `group_members` on both sensors, so this is not necessarily a hard runtime failure today.
  - It is still a contract drift bug that makes future debugging harder and makes the production suite disagree with its own component defaults.
- Dependency:
  - None.
- Validation:
  - `rg -n "active_group_sensor:" Dashboard/Tunet/tunet-suite-config.yaml` shows only `sensor.sonos_active_group_coordinator`.

#### FL-005
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The sensor card YAML uses `value_attribute: temperature` for `weather.home`, but the V2 sensor card did not implement `value_attribute`.
- Exact Fix:
  - In `tunet_sensor_card.js`, use `entity.attributes[cfg.value_attribute]` for current-value rendering when `value_attribute` is provided.
  - In history fetches, do not strip attributes for rows that rely on `value_attribute`; parse historical points from the named attribute when present.
- Why This Matters:
  - Without this, the “Outside” row can show the weather condition string instead of a temperature value and all threshold logic becomes meaningless.
- Dependency:
  - None.
- Validation:
  - Static: code search shows `cfg.value_attribute` handling in both current-value and history parsing logic.
  - Runtime: the “Outside” sensor row shows a numeric temperature value.

#### FL-006
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
- Problem:
  - The V2 sensor card stub config still advertises `sensor.aqi`, even though Bug 3 was explicitly removed from active dashboard YAMLs.
- Exact Fix:
  - Replace the stub config row with a safe, likely-to-exist example, or remove the fourth sample row entirely.
- Why This Matters:
  - This reintroduces a known-bad entity into the UI editor path and confuses verification.
- Dependency:
  - None.
- Validation:
  - `rg -n "sensor\\.aqi" Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` returns zero matches.

### POC Structure Fixes

#### FL-007
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room popup POC still uses a vertical stack of `tunet-light-tile` instances instead of one consolidated lighting surface.
- Exact Fix:
  - Replace the five `tunet-light-tile` cards in the Living Room popup with one `custom:tunet-lighting-card`.
  - Use explicit `zones` for:
    - `light.living_room_couch_lamp`
    - `light.living_room_floor_lamp`
    - `light.living_room_spot_lights`
    - `light.living_room_credenza_light`
    - `light.office_desk_lamp`
  - Keep the popup focused:
    - `All Off`
    - one lighting surface
    - `Open Room`
- Why This Matters:
  - The whole point of the POC is to validate the final pattern, not a temporary duplicate-tile fallback.
- Dependency:
  - FL-003 if Bedroom entities are being normalized in the same change set; otherwise independent.
- Validation:
  - Open Living Room popup and confirm there is exactly one lighting card, not a tile stack.

#### FL-008
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room subview still uses stacked `tunet-light-tile` cards instead of a consolidated room lighting surface.
- Exact Fix:
  - Replace the stacked tiles in the Living Room subview with one `custom:tunet-lighting-card` using the same explicit Living Room zone list as the popup.
- Why This Matters:
  - The subview should represent the scalable room pattern the rest of the project will follow.
- Dependency:
  - FL-007 preferred, so popup and subview share the same entity model.
- Validation:
  - Open `/tunet-suite/living-room` and confirm one consolidated lighting card controls all living-room lights.

#### FL-009
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Room subviews do not declare explicit `back_path`.
- Exact Fix:
  - Add `back_path: /tunet-suite/overview` to each room subview.
- Why This Matters:
  - Direct links, refreshes, and unusual navigation history should still return users to the intended dashboard destination.
- Dependency:
  - None.
- Validation:
  - Open a room subview directly in a fresh tab and confirm the HA back button returns to `/tunet-suite/overview`.

### Navigation Foundation Hardening

#### FL-010
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Problem:
  - `tunet-nav-card` uses `var(--amber-strong)` for the active nav color, but that token is not defined in the shared token layer.
- Exact Fix:
  - Replace `var(--amber-strong)` with an existing token such as `var(--amber)`, or define `--amber-strong` centrally in `tunet_base.js`.
- Why This Matters:
  - Active-state styling should not depend on undefined-token fallback behavior.
- Dependency:
  - None.
- Validation:
  - Search confirms the token is either defined centrally or no longer referenced.

#### FL-011
- Status: `OPEN`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `tunet-nav-card` injects global `hui-view` offsets and document-root CSS variables from every card instance on every view.
- Exact Fix:
  - Scope nav layout offsets so they only affect the Tunet dashboard and only once.
  - Acceptable patterns:
    - a single shared dashboard-scoped root owner
    - route-aware offset application limited to `/tunet-suite`
    - layout reserved in the card’s host tree instead of document-global margin injection
- Why This Matters:
  - The current behavior can affect non-Tunet dashboards and introduces order-dependent layout behavior.
- Dependency:
  - None, but architectural care is required.
- Validation:
  - Open a non-Tunet dashboard after loading Tunet and confirm no extra left or bottom spacing remains.

#### FL-012
- Status: `OPEN`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - Navigation is implemented via direct `history.pushState` plus manual `location-changed` dispatch.
- Exact Fix:
  - Replace direct history manipulation with Home Assistant’s supported navigation mechanism everywhere a Tunet card changes the route.
- Why This Matters:
  - This is brittle against HA frontend router changes and mixes app routing with custom event simulation.
- Dependency:
  - None, but should be done consistently across all cards once started.
- Validation:
  - Browser back/forward, route highlighting, and subview transitions work without custom history shims.

#### FL-013
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `subview_paths` is exposed as an `object` selector even though the card consumes an array of strings.
- Exact Fix:
  - Either:
    - implement a real editor path for repeated strings, or
    - explicitly treat `subview_paths` as YAML-only and remove it from the simple visual schema.
- Why This Matters:
  - A broken or misleading config editor is worse than an explicit YAML-only field.
- Dependency:
  - Depends on the broader config editor decision.
- Validation:
  - UI editor either renders a valid repeatable list or no longer pretends to support the field.

### Performance And Update Behavior

#### FL-014
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
- Problem:
  - Speaker discovery is cached and never deliberately invalidated when entity topology changes.
- Exact Fix:
  - Invalidate `_cachedSpeakers` when relevant media-player or Sonos group entities change.
- Why This Matters:
  - Frontend state should reflect group membership changes without requiring a full reload.
- Dependency:
  - None.
- Validation:
  - Add/remove a speaker from a Sonos group and confirm the card reflects it without a full browser refresh.

#### FL-015
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Problem:
  - Cards scan the entire HA state registry for adaptive-lighting switches more often than necessary.
- Exact Fix:
  - Precompute the adaptive-lighting switch set once per update cycle and reuse it instead of re-scanning `Object.keys(hass.states)` inside repeated paths.
- Why This Matters:
  - It is avoidable work and will scale poorly on larger HA installs.
- Dependency:
  - None.
- Validation:
  - Code path no longer performs repeated full-registry scans during ordinary updates.

### Documentation And Architecture Consistency

#### FL-016
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Docs/dashboard_navigation_research.md`
- Problem:
  - The research doc is still valuable but it does not describe the current POC implementation accurately.
- Exact Fix:
  - Add a clear header that the file is historical/comparative research.
  - Point readers to `plan.md` and `FIX_LEDGER.md` for the current implementation state.
- Why This Matters:
  - Future contributors must not mistake the research document for the current architecture contract.
- Dependency:
  - None.
- Validation:
  - The document clearly identifies itself as historical and redirects to the current plan.

#### FL-017
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The repo still has entity inventory drift across active, overview, and test dashboards.
- Exact Fix:
  - Choose one canonical entity inventory and normalize the dashboards against it.
  - If a file is intentionally legacy, label it clearly at the top of the file.
- Why This Matters:
  - Three different YAMLs with different entity truth is a guaranteed debugging trap.
- Dependency:
  - FL-003 and any live HA entity audit outcomes.
- Validation:
  - Cross-file search shows consistent room inventories or explicit legacy disclaimers.

### Config Editor Reality Check

#### FL-018
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - The suite contains `getConfigForm()` usage, but nested-array editing is not fully solved and runtime verification in HA UI is still incomplete.
- Exact Fix:
  - Split cards into two classes:
    - simple-editor cards: keep `getConfigForm()`
    - YAML-first cards: document complex fields as YAML-only until a proper `getConfigElement()` investment is approved
  - Verify the actual HA UI behavior on 2026.3.0b1 for at least one simple card and one complex card.
- Why This Matters:
  - The goal is truthful UX, not nominal editor support.
- Dependency:
  - Live HA UI verification.
- Validation:
  - A short matrix exists showing which cards are truly visual-editor friendly and which remain YAML-first.

#### FL-019
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA live dashboard configuration, not repo-only
- Problem:
  - Bug 4 is not fully closed until the real HA UI confirms editors work where expected.
- Exact Fix:
  - In HA UI, try “Add card” for:
    - `tunet-nav-card`
    - `tunet-weather-card`
    - `tunet-climate-card`
    - one complex nested-config card such as `tunet-rooms-card`
  - Record actual outcomes.
- Why This Matters:
  - The repo code can look correct while the editor path still fails in the real frontend.
- Dependency:
  - Resource cache bust and live HA test cycle.
- Validation:
  - A factual pass/fail matrix is written into `plan.md`.

### Legacy Dashboard Cleanup

#### FL-020
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA storage dashboards
- Problem:
  - Known-bad `sensor.aqi` references may still exist in storage dashboards even if repo YAMLs are clean.
- Exact Fix:
  - Search storage dashboards and remove or replace every `sensor.aqi` occurrence.
- Why This Matters:
  - The user still sees broken rows if legacy dashboards continue to reference dead entities.
- Dependency:
  - Live HA access.
- Validation:
  - Storage dashboard search returns zero hits for `sensor.aqi`.

### Design And Strategy Decisions Still Requiring Fresh Eyes

#### FL-021
- Status: `OPEN`
- Severity: `DECISION`
- Files:
  - Architecture-level
- Problem:
  - Comparison strategy is still unresolved:
    - switch resources in-place
    - or register separate card tags such as `tunet-status-card-next`
- Exact Fix:
  - Decide whether this project needs true side-by-side comparison or staged-root comparison is enough.
- Why This Matters:
  - It affects deployment complexity, rollback simplicity, and QA repeatability.
- Dependency:
  - Human product/QA decision.
- Validation:
  - Decision recorded in `plan.md`.

#### FL-022
- Status: `OPEN`
- Severity: `DECISION`
- Files:
  - Architecture-level
- Problem:
  - Popup standardization is unresolved:
    - keep Bubble Card for Tunet quick-control popups
    - or return to browser_mod for all cross-view popup behavior
- Exact Fix:
  - Decide based on the intended scope of popups:
    - overview-only lightweight room quick controls: Bubble Card is acceptable
    - reusable cross-view overlays: browser_mod is architecturally cleaner
- Why This Matters:
  - This should be a deliberate platform choice, not an accidental mix.
- Dependency:
  - Human architecture decision.
- Validation:
  - One popup standard is documented in `plan.md`.

#### FL-023
- Status: `OPEN`
- Severity: `DECISION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - `tile_size` and richer per-card sizing knobs were useful in older cards, but the current strategy favors native sections auto-height.
- Exact Fix:
  - Decide whether V2 cards should preserve these knobs for card-internal density only, or remove them when they mislead users into expecting full layout control.
- Why This Matters:
  - This affects the boundary between card design and HA layout behavior.
- Dependency:
  - Human design decision.
- Validation:
  - Decision recorded and the cards/docs agree.

#### FL-024
- Status: `OPEN`
- Severity: `DECISION`
- Files:
  - All V2 cards with `getGridOptions()`
- Problem:
  - There is still a policy question around how broadly `columns: "full"` should be used.
- Exact Fix:
  - Decide the default rule:
    - chrome cards and full-width hero surfaces may use `columns: "full"`
    - most content cards should stay on numeric widths in multiples of 3
- Why This Matters:
  - This is the core sections-layout policy and needs to be explicit to avoid future churn.
- Dependency:
  - Human architecture decision.
- Validation:
  - `plan.md` contains the explicit rule and the code follows it.

## Recommended Execution Order

1. FL-001, FL-002, FL-003, FL-004, FL-005, FL-006
2. FL-007, FL-008, FL-009, FL-010
3. FL-019, FL-020
4. FL-011, FL-012, FL-013, FL-014, FL-015
5. FL-016, FL-017
6. FL-021, FL-022, FL-023, FL-024

## “Done” Standard For This Project

An item is only actually done when all of the following are true:

- Repo code or repo docs are updated.
- If HA deployment is needed, the change is deployed.
- Resources are cache-busted if frontend JS changed.
- The validation step in this ledger is completed.
- `plan.md` no longer contradicts the repo state.
