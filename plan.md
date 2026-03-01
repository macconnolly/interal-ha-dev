# Tunet Suite Dashboard - Implementation Plan (V2 Next)

Working branch: `claude/dashboard-nav-research-QnOBs`
Last updated: 2026-03-01

## Current Reality Snapshot (Fact Base)
- DONE SNAP.01: New dashboard YAML exists at `Dashboard/Tunet/tunet-suite-config.yaml`; Outcome: repo has a single source of truth for the POC dashboard config; Verify: the file exists on this branch.
- DONE SNAP.02: Dashboard YAML is deployed to HA at `/config/dashboards/tunet-suite.yaml`; Outcome: HA has the YAML file available on disk; Verify: HA host filesystem shows the file at that path.
- TODO SNAP.03: `tunet-suite` is NOT registered in HA dashboards yet; Outcome: it must be registered before it shows up; Verify: Settings -> Dashboards does not list it (yet).
- DONE SNAP.04: V2 cards are deployed to HA under `/config/www/tunet/v2_next/`; Outcome: HA can serve `/local/tunet/v2_next/*.js`; Verify: direct browser fetch of a resource returns JS (200).
- DONE SNAP.05: Lovelace resources were repointed to `/local/tunet/v2_next/...`; Outcome: HA frontend loads v2_next modules; Verify: Settings -> Dashboards -> Resources shows `/local/tunet/v2_next/` URLs.
- DONE SNAP.06: `tunet-nav-card` exists (POC), 3 items, breakpoint 900; Outcome: persistent nav chrome exists; Verify: `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` exists and is loaded as a resource.
- DONE SNAP.07: Bug 1 and Bug 2 are implemented in V2 `tunet_status_card`; Outcome: status tiles are uniform and aux pill respects `aux_show_when`; Verify: see Phase 0 verification tasks.
- DONE SNAP.08: Bug 3 removed from repo YAMLs (`sensor.aqi` removed); Outcome: repo dashboards no longer reference missing `sensor.aqi`; Verify: `rg "sensor\\.aqi" Dashboard/Tunet/*.yaml` returns no matches.
- TODO SNAP.09: Bug 3 still exists in at least one HA Storage dashboard; Outcome: must be manually removed in HA UI storage dashboards; Verify: searching storage dashboard YAML in HA still finds `sensor.aqi`.
- TODO SNAP.10: Bug 4 (V2 config editors) not validated end-to-end; Outcome: cannot assume `getConfigForm()` works in the current HA frontend/browser; Verify: Phase 0 diagnostics.
- DONE SNAP.11: Office is merged into Living Room (no Office room/subview); Outcome: no Office view to build; Verify: there is no `path: office` in `tunet-suite-config.yaml`.

## Goals
- Make `tunet-suite` a real HA dashboard: registered, visible, loads without red error cards or custom-element collisions.
- Use Sections layout correctly: no forced vertical sizing; cards self-size by content; grid constraints use columns/min/max only.
- Establish navigation architecture: Overview -> room popups (hash) -> room subviews, with persistent `tunet-nav-card`.
- Start from ONE working room popup (Living Room) and converge on the pattern: minimal quick actions + ONE expandable lighting surface + "Open Room" link to subview.
- Rollback stays easy: keep `v2_next` as staging; keep a stable resource root available for quick revert.

## Non-Goals
- Full visual UI editors for complex nested arrays (tiles/zones/sensors) unless required; YAML remains acceptable for power-user configs.
- Creating an Office room/surface (Office is part of Living Room).
- Retheming/redesigning cards beyond what is required for correctness, navigation, and readability.
- Migrating every legacy HA Storage dashboard (only fix those blocking progress and known-bad entities like `sensor.aqi`).

## Constraints / Rules Of Engagement
- Grid sizing strategy: do NOT force vertical rows; let Sections auto-size height; only use columns/min/max in `getGridOptions()` and avoid `rows:` in YAML configs.
- Popup strategy: prefer ONE consolidated, expandable lighting surface inside the popup (do not duplicate many `tunet-light-tile` cards).
- V1 cards may be used selectively if they are better, but avoid custom element tag collisions:
- Do NOT load V1 and V2 resources that define the same `customElements.define('tunet-*')` tags at the same time.
- If a V1 card is required, either rename its custom element tag(s) or isolate it into a dashboard/resource set that does not load the V2 suite.

## Phase 0 - Make The POC Reachable And Safe (Registration, Resources, Cache, Baselines)

### 0.1 - Safety Baseline (HA-Side)
- TODO P0.01: Create a full HA backup named `pre_tunet_suite_2026_03_01`; Outcome: rollback point exists; Verify: Settings -> System -> Backups lists the new backup with the expected name/timestamp.
- TODO P0.02: Capture current Lovelace Resources list (URLs + types) before edits; Outcome: exact rollback path for resources; Verify: screenshot or copied text is saved somewhere outside HA cache (notes).
- TODO P0.03: Capture current Dashboards list (URL paths + modes) before edits; Outcome: exact rollback path for dashboards; Verify: screenshot/notes of Settings -> Dashboards.

### 0.2 - Register `tunet-suite` YAML Dashboard (Do Not Assume It Is Registered)
- TODO P0.04: Confirm `/config/dashboards/tunet-suite.yaml` exists on HA; Outcome: registration will not point to a missing file; Verify: HA file editor or SSH shows the file.
- TODO P0.05: Register `tunet-suite` in `/config/configuration.yaml` under `lovelace: dashboards:` (mode: yaml, filename: `dashboards/tunet-suite.yaml`); Outcome: HA knows about the dashboard; Verify: YAML passes validation (no syntax errors).
- TODO P0.06: Restart HA after `configuration.yaml` edit; Outcome: dashboard registration loads; Verify: Settings -> System -> Logs shows restart completed without config errors.
- TODO P0.07: Confirm `tunet-suite` appears in Settings -> Dashboards; Outcome: dashboard is registered; Verify: it shows with correct title/icon and opens.
- TODO P0.08: Open `/tunet-suite/overview`; Outcome: Overview view loads; Verify: no "dashboard not found" and no red error banners.

### 0.3 - Resource Hygiene (V2 Next + Collision Avoidance)
- DONE P0.09: V2 JS is deployed to `/config/www/tunet/v2_next/`; Outcome: HA can serve the files; Verify: open `/local/tunet/v2_next/tunet_status_card.js` in a browser and see source.
- TODO P0.10: Confirm `tunet_base.js` exists at `/config/www/tunet/v2_next/tunet_base.js`; Outcome: runtime imports succeed; Verify: open `/local/tunet/v2_next/tunet_base.js` and it loads (200).
- DONE P0.11: Lovelace resources point to `/local/tunet/v2_next/...` and are `type: module`; Outcome: correct import semantics; Verify: Settings -> Dashboards -> Resources list.
- TODO P0.12: Confirm Bubble Card resource is installed and loaded; Outcome: hash popups can render; Verify: no "Custom element doesn't exist: bubble-card" error on `/tunet-suite/overview`.
- TODO P0.13: Confirm there are no duplicate Tunet resources (V1 + V2) defining the same tag names; Outcome: no registry collisions; Verify: browser console has no `Failed to execute 'define'` errors mentioning `tunet-`.

### 0.4 - Cache Bust Strategy (So Testing Is Real)
- TODO P0.14: Bump a single coherent `?v=` on all `/local/tunet/v2_next/*.js` resources (same version string across all cards); Outcome: HA frontend reloads modules; Verify: DevTools Network shows 200 (not 304) for these resources.
- TODO P0.15: Hard refresh with DevTools "Disable cache" enabled; Outcome: no stale resources; Verify: Network tab shows resources fetched with the bumped `?v=`.

### 0.5 - Grid Sizing Alignment (Sections Auto-Height)
- TODO P0.31: Remove `rows: 2` from the Overview `custom:tunet-lighting-card` in `Dashboard/Tunet/tunet-suite-config.yaml`; Outcome: Overview lighting card height is intrinsic; Verify: zones are not clipped and there is no forced empty vertical space.
- DONE P0.32: V2 cards implement columns-only `getGridOptions()` (no `rows`, `min_rows`, `max_rows`); Outcome: Sections sizing hints follow policy; Verify: code search shows no `min_rows`/`max_rows` and `getGridOptions()` returns `{ columns, min_columns, max_columns }` only.
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

### Phase 0 Verification Checklist (Click/Observe)
- TODO P0.V01: Settings -> Dashboards shows "Tunet Suite (POC)" and it opens; Verify: `/tunet-suite/overview` loads.
- TODO P0.V02: `/tunet-suite/overview` renders all custom cards without red error cards; Verify: scroll through Overview and confirm no "Custom element doesn't exist" errors.
- TODO P0.V03: Browser console is clean of registry collisions and 404 module loads; Verify: no `customElements.define` collisions and no failed module imports.
- TODO P0.V04: DevTools Network shows Tunet card modules loaded from `/local/tunet/v2_next/` with the latest `?v=`; Verify: every `tunet_*.js` resource request includes the bumped version.

## Phase 1 - POC-First Walking Skeleton (Living Room Popup Only)

### Definition Of Done (Walking Skeleton)
- Living Room tile opens a hash popup (`#living-room`) reliably.
- Popup contains minimal actions and ONE consolidated, expandable lighting surface.
- Popup contains a clear "Open Room" navigation link to `/tunet-suite/living-room`.
- Popup does not duplicate many individual `tunet-light-tile` cards.

### 1.1 - Living Room Popup (Prefer One Expandable Lighting Surface)
- IN-PROGRESS P1.01: Living Room popup exists (`hash: '#living-room'`) in `tunet-suite-config.yaml`; Outcome: popup routing is wired; Verify: tapping Living Room tile changes URL hash and opens popup.
- DONE P1.02: Popup includes "Open Room" navigate button to `/tunet-suite/living-room`; Outcome: popup links to full room subview; Verify: tap navigates to the subview.
- TODO P1.03: Replace the multiple `custom:tunet-light-tile` cards in the Living Room popup with ONE `custom:tunet-lighting-card`; Outcome: a single lighting surface replaces duplicated tiles; Verify: popup shows one lighting card, not a vertical stack of many tiles.
- TODO P1.04: Configure the popup `tunet-lighting-card` for expansion (use room group + `expand_groups: true`); Outcome: per-light controls exist inside the one card; Verify: Couch/Floor/Spots/Credenza/Desk are controllable from within the lighting card UI.
- TODO P1.05: Remove `rows:` limits from the popup lighting card config; Outcome: popup height is intrinsic and not clipped; Verify: all items visible without forced empty space or truncation.
- TODO P1.06: Keep one "All Off" action targeting `light.living_room_lights`; Outcome: one-tap off works; Verify: all Living Room lights turn off.
- TODO P1.07: Ensure popup lighting surface density works at 390px and 520px widths; Outcome: no accidental horizontal overflow; Verify: mobile viewport has no sideways scroll in the popup.

### 1.2 - Link To The Larger Subview (Keep Popup Minimal)
- TODO P1.08: Ensure popup content is intentionally minimal (quick actions + lighting surface + Open Room) and does not replicate full-room media/sensors; Outcome: popup stays focused; Verify: subview has more content than popup.
- TODO P1.09: Add `hold_action` on Living Room tile to navigate directly to `/tunet-suite/living-room`; Outcome: power users can skip popup; Verify: long-press on room tile opens subview.

### 1.3 - Deploy And Cache Bust
- TODO P1.10: Deploy updated `Dashboard/Tunet/tunet-suite-config.yaml` to HA `/config/dashboards/tunet-suite.yaml`; Outcome: HA uses updated YAML; Verify: changes appear after refresh.
- TODO P1.11: If lighting-card behavior changes are needed, deploy updated `/config/www/tunet/v2_next/` JS and bump `?v=`; Outcome: UI reflects new JS; Verify: DevTools Network shows new resource versions.

### Phase 1 Verification Checklist (Click/Observe)
- TODO P1.V01: On `/tunet-suite/overview`, tap Living Room; Verify: popup opens and hash is `#living-room`.
- TODO P1.V02: In popup, confirm exactly one lighting surface exists; Verify: no duplicated stacks of `tunet-light-tile`.
- TODO P1.V03: Toggle each Living Room light from inside the single lighting surface; Verify: HA states change and UI updates.
- TODO P1.V04: Tap "Open Room"; Verify: navigates to `/tunet-suite/living-room` and popup closes.

## Phase 2 - Room Subviews (Living Room First, Then Kitchen/Dining/Bedroom)

### 2.1 - Living Room Subview (Full Surface)
- TODO P2.01: Convert Living Room subview from multiple `tunet-light-tile` cards to ONE `tunet-lighting-card`; Outcome: consolidated room lighting; Verify: one lighting card controls all Living Room lights.
- TODO P2.02: Add `tunet-actions-card` at top of Living Room subview (room-scoped actions); Outcome: room quick actions exist; Verify: actions affect intended entities only.
- TODO P2.03: Keep/add `tunet-media-card` for `media_player.living_room`; Outcome: media controls accessible; Verify: play/pause works.
- TODO P2.04: Add a minimal sensors/status surface only if entities exist (temp, humidity, motion); Outcome: context without empty shells; Verify: no missing entity error rows.

### 2.2 - Kitchen Subview
- TODO P2.05: Replace Kitchen subview tiles with one `tunet-lighting-card` for Kitchen lights; Outcome: consolidated lighting; Verify: pendants/main/under-cab appear in one surface.
- TODO P2.06: Add `tunet-actions-card` for Kitchen (All Off/All On); Outcome: quick actions exist; Verify: actions work.
- TODO P2.07: Add `tunet-media-card` for `media_player.kitchen` only if entity exists; Outcome: no red errors; Verify: card present only when entity exists.

### 2.3 - Dining Room Subview
- TODO P2.08: Replace Dining subview tiles with one `tunet-lighting-card` for Dining lights; Outcome: consolidated lighting; Verify: spots/columns appear.
- TODO P2.09: Keep/add `tunet-climate-card` for `climate.dining_room`; Outcome: climate controls exist; Verify: setpoint changes persist.
- TODO P2.10: Add media only if `media_player.dining_room` exists; Outcome: no missing media; Verify: card renders or is omitted.

### 2.4 - Bedroom Subview
- TODO P2.11: Replace Bedroom subview tiles with one `tunet-lighting-card` for Bedroom lights; Outcome: consolidated lighting; Verify: main/accent/table lamps appear.
- TODO P2.12: Ensure Bedroom lighting UI does not expose unsupported controls for Govee (if applicable); Outcome: no broken sliders; Verify: controls match device capabilities.
- TODO P2.13: Add media only if `media_player.bedroom` exists; Outcome: no missing media; Verify: card renders or is omitted.

### 2.5 - Office Is Not A Room (Regression Guard)
- DONE P2.14: Office merged into Living Room; Outcome: no Office view to implement; Verify: `tunet-suite-config.yaml` has no Office view path.
- TODO P2.15: Ensure "Office" never appears as a room tile label; Outcome: nav remains consistent; Verify: room list only includes Living/Kitchen/Dining/Bedroom.

### Phase 2 Verification Checklist (Click/Observe)
- TODO P2.V01: Open each subview (`/tunet-suite/living-room`, `/kitchen`, `/dining-room`, `/bedroom`); Verify: no red error cards.
- TODO P2.V02: In each subview, confirm exactly one lighting surface exists; Verify: lighting is consolidated per room.
- TODO P2.V03: Toggle each room light; Verify: HA states update and UI reflects.
- TODO P2.V04: Dining: adjust thermostat; Verify: climate responds.
- TODO P2.V05: Living: play/pause media; Verify: media responds.

## Phase 3 - Expand Popups (Kitchen, Dining, Bedroom) Using The Same Pattern

### 3.1 - Popup Pattern Template (Shared)
- TODO P3.01: Define a standard popup template (Bubble pop-up + quick actions + one lighting surface + Open Room link); Outcome: consistent UX; Verify: all room popups share structure and styles.
- TODO P3.02: Ensure popup styles work in both light and dark modes; Outcome: readable in both; Verify: switch theme and re-test popups.

### 3.2 - Implement Each Room Popup
- TODO P3.03: Add Kitchen popup `#kitchen` using one expandable lighting surface (group expansion) and "Open Room" to `/tunet-suite/kitchen`; Outcome: kitchen popup works; Verify: tap tile opens popup and controls toggle lights.
- TODO P3.04: Add Dining popup `#dining-room` (or `#dining`) using one lighting surface and "Open Room" to `/tunet-suite/dining-room`; Outcome: dining popup works; Verify: lights toggle.
- TODO P3.05: Add Bedroom popup `#bedroom` using one lighting surface and "Open Room" to `/tunet-suite/bedroom`; Outcome: bedroom popup works; Verify: lights toggle.
- TODO P3.06: Update `tunet-rooms-card` tile behavior: tap -> popup hash, hold -> subview path; Outcome: consistent nav; Verify: tap/hold behavior matches across rooms.

### Phase 3 Verification Checklist (Click/Observe)
- TODO P3.V01: Tap each room tile on Overview; Verify: correct popup opens (hash matches room).
- TODO P3.V02: In each popup, confirm exactly one lighting surface exists; Verify: no duplicated tile stacks.
- TODO P3.V03: Tap "Open Room" from each popup; Verify: navigates to matching subview and popup closes.
- TODO P3.V04: Use browser back; Verify: returns to Overview and hash popups behave correctly.

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
- TODO DEP.03: Ensure Lovelace resources are `type: module` and point at `/local/tunet/v2_next/` (plus Bubble Card resource); Outcome: correct loader; Verify: resource list matches.

### Deploy Dashboard YAML
- DONE DEP.04: `Dashboard/Tunet/tunet-suite-config.yaml` is copied to `/config/dashboards/tunet-suite.yaml`; Outcome: YAML exists on HA; Verify: file present and readable.
- TODO DEP.05: After YAML changes, refresh `/tunet-suite/overview`; Outcome: YAML changes take effect; Verify: UI reflects edits.

### Register Dashboard (One-Time)
- TODO DEP.06: Add `lovelace: dashboards: tunet-suite:` entry in `/config/configuration.yaml`; Outcome: dashboard registered; Verify: Settings -> Dashboards lists it.
- TODO DEP.07: Restart HA after registration; Outcome: registration loaded; Verify: dashboard opens successfully.

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
