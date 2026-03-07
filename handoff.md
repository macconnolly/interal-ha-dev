# Tunet Dashboard Handoff (Source Of Truth)

Last updated: 2026-03-06 (America/Denver)  
Intended reader: next Codex run in a new chat  
Primary instruction: treat this file as session continuity + execution map, then verify live state before changing behavior.

## 0B) Session Delta (2026-03-06 Late 3)

Completed focused `R1` tranche (`T-009F`) plus sections-model correction:

- Card-gallery layout model correction (`Dashboard/Tunet/tunet-suite-config.yaml`):
  - reverted incorrect section/view span compression
  - restored section structure (`max_columns: 12`, original `column_span` flow)
  - moved width control to card-level `grid_options` in YAML
  - added explicit climate+weather side-by-side section pattern (`column_span: 4`, each card `grid_options.columns: 18`)
- Weather refactor implemented (`Dashboard/Tunet/Cards/v2/tunet_weather_card.js`, `v1.6.0`):
  - precipitation fallback keys (probability + amount)
  - hourly-precip parity rule (`hourly precip count = forecast_days`)
  - tighter forecast tile density
  - stronger segmented-toggle containment in narrow cards
- R1 density/readability follow-up:
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js` (`v3.1.3`)
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js` (`v3.2.2`)
- Validation:
  - `node --check` passed for weather/speaker-grid/media
  - YAML parse check passed for `Dashboard/Tunet/tunet-suite-config.yaml`

## 0C) Session Delta (2026-03-06 Late 4)

User clarified a critical interpretation correction for tile visuals:

- The issue is **not** “content should be centered.”
- The issue is **vertical lane alignment regression** across tile families:
  - room name line
  - brightness/status value line
  - progress/brightness bar lane
- This appears across multiple tile surfaces (rooms, lights, related tiles), so next agent must treat this as a cross-surface alignment bug, not a one-card tweak.
- Root-cause path to inspect first:
  - shared/base style behavior in `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - then tile-specific offsets in:
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`

Implementation constraint from user:
- Do **not** “fix” by globally re-centering card content.
- Fix lane alignment relationship so value text aligns correctly between name and bar.

## 0D) Reality Correction (2026-03-06 Late 5)

Critical correction for next agent:

- Prior notes that sounded like "`R1` completed" should be interpreted as **partial code pass only**, not end-state acceptance.
- Cross-family sizing/readability consistency is still not solved across the full v2 suite.
- Multiple cards were adjusted, but not all card families were validated live at phone/tablet/desktop breakpoints after these changes.
- The project still needs a full deliberate Sections architecture pass for the final dashboard, not incremental local span edits.

Practical truth:
- Some focused improvements landed (weather/media/speaker-grid refinements, card-gallery `grid_options` model correction).
- However, large portions remain unverified or still drifted in real usage.

## 0A) Session Delta (2026-03-06 Late 2)

Completed focused mobile-density tranche `T-009E`:

- Shared baseline:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - added centralized density tokens for mobile card/section/tile/control/dropdown sizing
    - wired shared surfaces to use those tokens
    - added `text-size-adjust` guard for iOS consistency
- Adoption in high-impact tiles:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Cache path safety:
  - all v2 cards now import `tunet_base.js?v=20260306g3`
- Parallel audit docs added for remaining cards:
  - `Dashboard/Tunet/Docs/mobile_density_audit_weather_climate.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_media_audio.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_sensor_actions_scenes.md`
  - `Dashboard/Tunet/Docs/mobile_density_crosscard_gap_review.md`
  - `Dashboard/Tunet/Docs/mobile_density_master_matrix.md`

## 0) Session Delta (2026-03-06 Late)

Completed in current pass:

- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - increased compact readability (value/label/secondary sizing)
  - enforced stable tile row heights for visual consistency
  - raised dropdown layering (`dd-open`/menu z-index) to reduce overlap clipping
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - increased row/slim mobile orb/action/icon sizes for touch usability

New docs created for next implementation slices:

- `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
  - full issue matrix + tranche plan for weather precip/view-density/toggle containment refactor
- `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
  - root cause and resolution guidance for status/chips readability + dropdown layering
- `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
  - root cause analysis and recommended fix path for brightness/status vertical drift

## 1) Session Objective
Build and deploy a production-quality Tunet dashboard system with:
- native HA sections view
- 5+ pages plus room popups
- unified micro-interaction model
- reusable v2 custom cards
- storage dashboard deployment for live testing

User preference is explicit: prioritize complete, working UI surfaces first, then polish.

## 2) Environment / Working Context
- Single worktree to use for all follow-up work:
  - `/home/mac/HA/implementation_10`
- Current branch:
  - `claude/dashboard-nav-research-QnOBs`
- Active modified files are intentionally dirty (do not reset).
- Home Assistant target is reachable and was actively deployed to during this session.

### Merge/Oversight Correction
- There was a branch/worktree continuity oversight during chat.
- Final state correction:
  - previous parallel worktree changes were merged into `claude/dashboard-nav-research-QnOBs`.
  - going forward: do not create or use additional worktrees for this project.
- During merge, one untracked file in root worktree would have been overwritten and was preserved as:
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js.premerge_untracked_backup`
  - Do not delete blindly; inspect/diff before cleanup.

## 3) Locked Product Direction (Docs Alignment)
From `plan.md`, `FIX_LEDGER.md`, and `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`:
- Decision order is locked:
  1. NAV
  2. POPUP
  3. UI/UX shell
  4. HOME LAYOUT
- Popup direction is locked to Browser Mod (FL-022 done/direction-locked).
- Bubble/hash popup path is historical only unless explicitly re-approved.
- Popup invocation standard: browser-scoped `fire-dom-event` (not server-scoped popup service calls).
- Popup card style field should be `initial_style` (not deprecated `size`).

### Popup UX Direction Linkage (Do Not Drift)
Use this doc as mandatory execution reference:
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`

Required implications for implementation:
- Browser Mod remains the popup platform (`FL-022` direction lock).
- Popup trigger actions on cards are browser-scoped (`fire-dom-event`) unless a specific exception is approved.
- One popup per room remains the interaction model.
- Popup surface complements room subviews; it does not replace nav hierarchy.
- `layout-card` is an approved pattern for breakpoint-specific composition differences (for example: rooms tiles on desktop, rooms row on mobile).
- Prefer Home Assistant `2026.3` native UI configuration capabilities wherever they can replace brittle YAML-only patterns.

Important: there is behavior drift between plan lock and latest user intent.  
Plan currently states room tile `tap -> toggle`, `hold -> popup`.  
Latest user intent now leans toward row cards where:
- row sub-buttons toggle individual lights
- tapping main room card should navigate/open popup
- desktop and mobile variants differ (desktop tiles, mobile row)

This mismatch must be reconciled in docs before broad refactor.

## 4) What Was Implemented

### 4.0 Session Delta (2026-03-06, latest)
- Added weather design plan doc:
  - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
- Added status/chips resolution guide:
  - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- Added brightness alignment RCA doc:
  - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
- Updated cards:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (compact readability + dropdown layering polish)
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js` (chips density/readability)
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (mobile row variant scaling)
- Syntax validation completed:
  - `node --check` passed for all three updated card files.

### 4.1 Core v2 card code changes
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Updated Material Symbols font load URL to full range (`GRAD -50..200`) with `display=swap`.
- All v2 cards now import `tunet_base.js` with cache-busting suffix:
  - `from './tunet_base.js?v=20260306g1'`
  - Files affected: actions, climate, lighting, light_tile, media, nav, rooms, scenes, sensor, sonos, speaker_grid, status, weather.
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Version `2.6.2`
  - Added `weather_sunset_down` icon alias fallback to `wb_twilight`.
  - Added `format: time` rendering support (local time formatting).
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - Version `2.4.0`
  - Added `show_when` visibility evaluation.
  - Added `tap_action` support using shared `runCardAction(...)`.
  - Chips now support navigate/fire-dom-event/call-service without fallback hacks.
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Added shared `createAxisLockedDrag(...)` utility for iOS-safe gesture intent locking (vertical passthrough, horizontal drag lock).
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - Version `3.4.1`
  - Refactored tile drag handling to shared axis-lock helper.
  - Updated tile touch policy to `touch-action: pan-y` and added scroll-container overscroll behavior guard.
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - Version `1.0.1`
  - Refactored tap/drag/long-press handling to shared axis-lock helper.
  - Removed pointer-capture style drag flow that blocked vertical scrolling.
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - Version `3.1.2`
  - Refactored speaker tile drag handling to shared axis-lock helper.
  - Updated tile touch policy to `touch-action: pan-y`.
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - Version `3.2.1`
  - Speaker dropdown compacted heavily.
  - Dropdown rows changed to single-line state label (`Playing` / `Paused` / `Idle`) rather than long title+artist text.
  - Volume/mute path already moved to coordinator/group target model.
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - Version `2.8.0`
  - Added `layout_variant: slim`.
  - Row/slim CSS and control wiring expanded.

### 4.2 Dashboard YAML changes
- `Dashboard/Tunet/tunet-suite-config.yaml`
  - Added large example gallery view:
    - `title: Card Gallery`, `path: card-gallery`
  - Added broad variant demonstrations across status/actions/scenes/rooms/lighting/climate/weather/media/speaker-grid/light-tile.
  - Added/retained layout exploration surfaces (`Layout Lab`, `Vacuum Lab`).
  - Added/updated popup action strips in YAML popup blocks (for `tunet-suite` YAML flow).
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - Updated popup blocks (local source) to compact action-strip style and adaptive/manual-reset wiring.
  - Added Bedroom orchestration POC on storage source (`T-008B`):
    - full-width `tunet-status-card` context chips (presence/temp/humidity/light/alarm/sonos)
    - side-by-side companion sections on tablet+:
      - left: `tunet-lighting-card` + bedroom light action strip
      - right: `tunet-media-card` + alarm status/actions panel
  - Note: this is repo source state and still requires live HA validation at phone/tablet/desktop widths.

### 4.3 Sensor card outside condition update
- `Dashboard/Tunet/Cards/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - Replaced AQI/outside placeholder behavior with `weather.home` “Outdoor Conditions” styling.

## 5) Live Deployment Status

### 5.1 JS resources
- Uploaded v2 JS files to HA path:
  - `/config/www/tunet/v2_next/tunet_*.js`
- HA dashboard resources were version-bumped to:
  - `?v=20260306_gallery01`
- Confirmed via MCP resource list.

### 5.2 YAML dashboards
- Uploaded `Dashboard/Tunet/tunet-suite-config.yaml` to:
  - `/config/dashboards/tunet-suite.yaml`
- Storage dashboard was modified live through MCP transform:
  - Dashboard: `tunet-suite-storage`
  - Latest known `config_hash`: `522449b5be74c2b6`

### 5.3 Live popup updates
- Live storage dashboard popup updated via MCP transform:
  - Removed legacy `Open Room` big button.
  - Injected compact `tunet-actions-card` actions in popup.
  - Enabled popup `show_adaptive_toggle: true` and `show_manual_reset: true`.
  - Added `adaptive_entities` per room popup.

## 6) Known User-Reported Issues Still Open (Do Next)
This is the authoritative unresolved matrix from the user’s latest requirements.

### Issue Matrix (No-Context Execution)

#### `ISSUE-001` Status mode dropdown layering + selection reliability
- Status update (2026-03-06, `T-006A`):
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` now forces dropdown-capable overflow visibility at card/grid level.
  - Dropdown selection now uses async `input_select` call with `select` fallback.
  - Remaining work: live HA validation for overlay behavior at phone/tablet/desktop widths.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` (mode dropdown tile config)
- Repro:
  - Open Overview.
  - Tap the mode dropdown tile (`input_select.oal_active_configuration`).
- Current wrong behavior:
  - Menu can render beneath adjacent tile(s).
  - Option selection appears to not apply in some runs.
- Desired behavior:
  - Dropdown menu always overlays nearby tiles.
  - Selecting an option changes the input select immediately and visibly.
- Likely root cause:
  - Tile stacking context/z-index not elevated when dropdown opens.
  - Selection service path/domain mismatch or click event path conflict under overlap.

#### `ISSUE-002` Overview route appears blank for user
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - HA dashboard registration/resources state
- Repro:
  - Navigate to `/tunet-suite/overview`.
- Current wrong behavior:
  - User reports blank page.
- Desired behavior:
  - Overview renders all configured sections/cards.
- Likely root cause:
  - Resource version/cache mismatch, registration mismatch, or runtime card error causing render abort.

#### `ISSUE-003` Popup “Room/Open Room” route inconsistency
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` popup action strips
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` action routing
- Repro:
  - Open room popup, use “Room/Open Room” action.
- Current wrong behavior:
  - Route action intermittently does not navigate.
- Desired behavior:
  - Route always opens correct room subview path.
- Likely root cause:
  - Action payload mismatch (`navigation_path` path correctness) or action adapter route handling inconsistency.
- Popup UX direction linkage:
  - Must stay aligned with `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` one-popup-per-room flow.

#### `ISSUE-004` Media density test failure + dynamic volume not working
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` media card config
- Repro:
  - Run media density test surface.
  - Use media volume controls on `custom:tunet-media-card`.
- Current wrong behavior:
  - Density test fails.
  - Volume updates do not reliably control intended group/coordinator target.
- Desired behavior:
  - Density test passes.
  - Volume controls reliably affect configured target.
- Likely root cause:
  - Coordinator resolution mismatch, slider-to-service mapping issue, or stale entity-target wiring.

#### `ISSUE-005` Rooms row variant interaction contract drift
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` rooms card configs
- Repro:
  - On mobile/row variant, tap room body and sub-buttons.
- Current wrong behavior:
  - Interaction contract has drifted across iterations (sub-button vs card-body behavior not always consistent).
  - Manual-dot behavior has historically been inaccurate/persistent.
  - All-on/all-off controls have been oversized/cluttered in prior iterations.
- Desired behavior:
  - Sub-buttons toggle only their own lights.
  - Card body consistently performs the chosen primary action (popup or navigation).
  - Manual indicator appears only when manual control exists for room lights.
  - One compact toggle-all affordance, not duplicate oversized controls.
  - Icon sizing consistency between room icon and sub-icons.
- Likely root cause:
  - Event propagation conflicts and repeated contract flips without synchronized docs.
- Popup UX direction linkage:
  - If primary card-body action is popup, action must follow Browser Mod + `fire-dom-event` direction lock.

#### `ISSUE-006` Desktop vs mobile rooms variant split
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Repro:
  - Compare overview/rooms on desktop and mobile widths.
- Current wrong behavior:
  - Same room variant shown across widths in prior runs.
- Desired behavior:
  - Desktop/tablet: tiles variant.
  - Mobile: row variant.
  - Implemented via `layout-card` + breakpoint/visibility logic.
- Likely root cause:
  - Missing breakpoint orchestration at dashboard composition level.

#### `ISSUE-007` Bedroom next Sonos alarm tile missing
- Status update (2026-03-06, `T-008B`):
  - Bedroom subview now includes both `sensor.sonos_alarm_bedroom_display` (context strip) and `sensor.sonos_next_alarm` (alarm panel) in `Dashboard/Tunet/tunet-suite-storage-config.yaml`.
  - Remaining work: live HA verification that both tiles render and stay legible at phone/tablet widths.
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `packages/sonos_package.yaml` (source entities)
- Repro:
  - Open Bedroom subview.
- Current wrong behavior:
  - No “next Sonos alarm” tile visible.
- Desired behavior:
  - Bedroom surface includes a concise tile for next Sonos alarm.
- Likely root cause:
  - Tile not wired to live Sonos alarm sensor in storage dashboard.

#### `ISSUE-008` Sunrise/sunset dynamic chip logic missing
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (if show_when behavior is insufficient)
- Repro:
  - Check Quick Chips daytime vs nighttime.
- Current wrong behavior:
  - Static chip behavior in prior revisions.
- Desired behavior:
  - Daytime shows sunset; nighttime shows sunrise.
- Likely root cause:
  - Missing `show_when` state gating for sun condition.

#### `ISSUE-009` Lighting compact+scroll brightness overlap
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- Repro:
  - Use compact mode + scroll layout on narrow viewport.
- Current wrong behavior:
  - Brightness value overlaps slider/progress area.
- Desired behavior:
  - Clear vertical separation between value text and slider/track.
- Likely root cause:
  - Tight compact spacing and progress-track offset in scroll mode.

#### `ISSUE-015` Cross-tile vertical lane alignment regression (name/value/bar)
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- Repro:
  - Open any surface with room/light tiles.
  - Inspect relationship between tile name, brightness/status value, and progress bar.
- Current wrong behavior:
  - Brightness/status value appears vertically misaligned (shifted), and prior attempts over-corrected by re-centering composition.
- Desired behavior:
  - Maintain intended tile hierarchy while restoring correct vertical lane alignment:
    - name lane
    - value lane
    - bar lane
  - Do not enforce generic center-justified layout as the fix.
- Likely root cause:
  - Cross-card style drift from shared density/surface changes + per-card progress offset/positioning differences.

#### `ISSUE-013` iOS tile drag blocks vertical page scroll (touch-action/pointer contract)
- Status update (2026-03-06, `T-009A`):
  - Shared axis-lock helper added in `Dashboard/Tunet/Cards/v2/tunet_base.js`.
  - Refactor applied to `tunet_lighting_card`, `tunet_light_tile`, and `tunet_speaker_grid_card`.
  - Tile surfaces switched to `touch-action: pan-y` in those cards.
  - Remaining work: live iOS/WKWebView validation and potential follow-on parity refactor for `tunet_sonos_card`.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- Repro:
  - On iOS, start a vertical swipe from inside a lighting or speaker tile.
- Current wrong behavior:
  - Prior builds stalled page scrolling when gestures started on drag-enabled tile surfaces.
- Desired behavior:
  - Vertical swipes scroll page immediately.
  - Horizontal swipes still control brightness/volume as expected.
- Likely root cause:
  - `touch-action: none` and non-axis-locked pointer logic were claiming gestures before browser scroll intent could win.

#### `ISSUE-010` Weather variants (daily/hourly + temp/precip) not complete/verified
- Status update (2026-03-06, `T-009F`):
  - implemented in `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`:
    - forecast mode/metric variants are active
    - precip data fallback keys added
    - hourly precip count parity with `forecast_days`
    - compact density + control containment adjustments
  - remaining work: live HA visual/interaction verification against real forecast providers.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Repro:
  - Open weather card and switch modes/metrics.
- Current wrong behavior:
  - Prior behavior lacked required variant model.
- Desired behavior:
  - Daily/hourly view support.
  - Temperature/precipitation metric support.
  - Optional auto switch toward hourly precipitation when precip is active/likely.
- Likely root cause:
  - Card previously only subscribed/rendered daily temperature-style forecasts.

#### `ISSUE-011` Missing full parameter documentation for all custom cards
- Where to look:
  - `Dashboard/Tunet/Cards/v2/*.js` (`getConfigForm`, default config, runtime options)
  - docs target (new): `Dashboard/Tunet/Docs/cards_reference.md` (to create)
- Repro:
  - Attempt to configure advanced options from UI without source code.
- Current wrong behavior:
  - No single canonical card-parameter reference.
- Desired behavior:
  - One complete doc per card with every parameter, type, default, allowed values, examples, and caveats.
- Likely root cause:
  - Feature velocity exceeded documentation maintenance cadence.

#### `ISSUE-012` Sections layout strategy is not yet mastered (research + iterative tuning required)
- Status update (2026-03-06, `T-008A`):
  - Applied explicit view-level controls across storage sections views: `max_columns: 4` and `dense_section_placement: false`.
  - Normalized overview spans to runtime intent (`4/3/1`) and added a concrete `living-room` subview split (`3/1`).
  - Migrated nav placement to native `footer.card` across storage views (HA 2026.3 capability) while keeping nav-card JS behavior unchanged.
  - Remaining work: live breakpoint validation loop at `390x844`, `768x1024`, `1024x1366`, `1440x900`.
- Where to look:
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/*` (`getGridOptions()` behavior)
- Repro:
  - Compare same dashboard at phone/tablet/desktop sizes and inspect section/card width behavior.
- Current wrong behavior:
  - Layout decisions are still partly heuristic and not backed by a stable best-practice model.
  - Span/column/section-width settings are not yet systematically tuned for all breakpoints.
  - Baseline docs now define the explicit 3-layer model (page/view -> section -> card), but live tuning evidence is still missing.
- Desired behavior:
  - Deep internet-backed sections/layout best-practice baseline.
  - Controlled live iteration loop: user adjusts values, reports visual result, agent folds those findings into matrix/rules.
- Likely root cause:
  - Insufficient formalized research + insufficient closed-loop breakpoint testing against real hardware.

#### `ISSUE-013` 2026.3 UI-configuration-first utilization gap
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/*` (`getConfigForm`, selectors, defaults)
  - `plan.md` tranche tasks for UI-editability and card configuration ergonomics
- Repro:
  - Attempt to add/adjust tiles/sensors/options through HA UI config flows and compare with current YAML-heavy path.
- Current wrong behavior:
  - Team is underusing modern `2026.3` UI config capabilities for composing sensors/tiles/options.
- Desired behavior:
  - Use UI configuration paths in the smartest practical way first, falling back to YAML only when necessary.
  - Improve card config schema/fields so common composition can happen without code edits.
- Likely root cause:
  - Legacy YAML-first habits and incomplete exploitation of newer UI editor capabilities.

#### `ISSUE-014` Outer card height reporting mismatch blocks stacking/layout
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (tile/outer wrapper behavior)
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` section/card span usage
- Repro:
  - Place affected card near cards above/below in Sections view, then try to stack additional content where visual height appears available.
- Current wrong behavior:
  - Outer container reports/occupies height similar to neighboring cards even when visible content is shorter.
  - Prevents expected stacking/placement above or below due to inflated occupied height.
- Desired behavior:
  - Card occupied height should closely match rendered content height (or intentionally center within equalized height with explicit design choice).
  - Sections layout should permit expected stacking and flow decisions based on actual height behavior.
- Likely root cause:
  - Combination of `getGridOptions()` hints, internal wrappers/min-height/padding, and Sections equalization behavior not yet tuned as a system.

#### `ISSUE-016` Cross-family card sizing/readability consistency remains unresolved
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_climate_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Repro:
  - Compare tile density/text/icon sizing on mobile across overview + rooms + media surfaces.
  - Check for inconsistent whitespace, control heights, and legibility between card families.
- Current wrong behavior:
  - Family-to-family density/readability is inconsistent; some cards still feel roomy with small text while others are compact.
  - Not all affected cards were fully live-tested after latest token adoption passes.
- Desired behavior:
  - Unified mobile and tablet density system across all card families.
  - Predictable text scale, control scale, and spacing from shared tokens with explicit card exceptions only when justified.
- Likely root cause:
  - Partial adoption of shared density tokens plus card-local fixed values and inconsistent override paths.

#### `ISSUE-017` Full dashboard Sections architecture must be redesigned view-by-view
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/Agent-Reviews/overview_orchestration_spec.md` (reference, not final)
- Repro:
  - Review each final destination view (overview, rooms, media, each room subview) at phone/tablet/desktop.
  - Validate information hierarchy (hero vs companion vs support) and interaction-first placement per surface intent.
- Current wrong behavior:
  - Sections composition has been iterated piecemeal; some placements/spans are exploratory rather than fully deliberate final IA.
  - Earlier design path relied on incorrect assumptions in places; full-system composition has not been rebuilt end-to-end.
- Desired behavior:
  - Re-design every final view start-to-finish using the HA Sections 3-layer model:
    - page-level `max_columns`
    - section-level `column_span` / `row_span`
    - card-level `grid_options`
  - Produce locked per-view orchestration specs (hero/companion/support + interaction contracts) before broad UI polish.
  - Then execute implementation + live iterative breakpoint validation loop with user.
- Likely root cause:
  - Incremental local fixes outpaced a single locked global layout orchestration pass.

## 6A) What Worked (Keep)

The following patterns have repeatedly worked and should remain baseline:

- Browser Mod popup direction with browser-scoped `fire-dom-event` triggers.
- Card-level `grid_options` as the width control mechanism inside Sections (instead of span hacks).
- Shared axis-locked drag pattern (`pan-y` + horizontal lock) for iOS-safe scroll/drag coexistence.
- Shared base density token approach in `tunet_base.js` (requires full-family adoption, but direction is correct).
- Storage dashboard as primary live evaluation surface with YAML architecture surface in repo.

## 7) Current Behavior Drift / Decision Conflicts
- Docs/plan lock says room `tap -> toggle`, `hold -> popup`.
- User now requests row-card body tap navigation/open popup and dedicated sub-control toggles.
- Before implementing more interaction changes:
  - update `plan.md` interaction contract section
  - update `FIX_LEDGER.md` affected items
  - keep one explicit contract and enforce it

If this is not reconciled, implementation drift will continue.

## 8) Files Most Relevant For Next Run

### Mandatory Review Pack (Start Here)
- `Dashboard/Tunet/Mockups/design_language.md`
- `Dashboard/Tunet/CLAUDE.md`
- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` (treat as provisional until `ISSUE-012` research + live tuning update is completed)

### Card logic
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`

### Dashboard configs
- `Dashboard/Tunet/tunet-suite-config.yaml`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### Direction / planning control docs
- `plan.md`
- `FIX_LEDGER.md`
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` (must be revised after sections research loop)
- `Dashboard/Tunet/Docs/mockup_vs_build_gap_log.md`

## 9) Fast Verification Checklist (Next Agent)
Run immediately before coding:
1. `git status --short`
2. Confirm current branch/worktree context:
   - branch expected: `claude/dashboard-nav-research-QnOBs`
   - worktree expected: `/home/mac/HA/implementation_10` only
3. Open live `tunet-suite-storage` config via MCP and confirm hash.
4. Confirm JS resources still point to `v=20260306_gallery01`.
5. Verify whether `/tunet-suite/overview` blank is reproducible and collect browser console errors.
6. Reproduce dropdown issue on status tile and identify whether card logic or z-index/overflow.
7. Reproduce row-card tap/sub-button mismatch in `tunet-rooms-card`.

## 10) Build / Validate / Deploy Commands

### JS syntax validation
```bash
cd /home/mac/HA/implementation_10
for f in Dashboard/Tunet/Cards/v2/tunet_*.js; do node --check "$f"; done
```

### YAML parse validation
```bash
cd /home/mac/HA/implementation_10
python3 - <<'PY'
import yaml
for p in ['Dashboard/Tunet/tunet-suite-config.yaml','Dashboard/Tunet/tunet-suite-storage-config.yaml']:
    with open(p,'r',encoding='utf-8') as f:
        yaml.safe_load(f)
print('yaml-ok')
PY
```

### Deploy JS to HA
```bash
cd /home/mac/HA/implementation_10
set -a && source /home/mac/HA/implementation_10/.env && set +a
sshpass -p "$HA_SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Dashboard/Tunet/Cards/v2/tunet_*.js "$HA_SSH_USER@$HA_SSH_HOST:/config/www/tunet/v2_next/"
```

### Deploy YAML to HA
```bash
cd /home/mac/HA/implementation_10
set -a && source /home/mac/HA/implementation_10/.env && set +a
sshpass -p "$HA_SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Dashboard/Tunet/tunet-suite-config.yaml "$HA_SSH_USER@$HA_SSH_HOST:/config/dashboards/tunet-suite.yaml"
```

### Cache bust resources (MCP)
Use `ha_config_set_dashboard_resource` on each Tunet v2 resource id and bump query value.

### Storage dashboard surgical edits (MCP)
Use:
- `ha_config_get_dashboard(url_path="tunet-suite-storage")`
- `ha_config_set_dashboard(... python_transform=..., config_hash=...)`

## 11) Guardrails For Next Agent
- Do not use destructive git commands.
- Do not revert unrelated modified files.
- Treat current dirty tree as in-progress intentional work.
- Keep Browser Mod popup direction.
- Use `fire-dom-event` for browser-scoped popup actions.
- Keep `initial_style` for popup-card.
- Update docs when interaction contract changes.
- Prioritize working UX over perfect abstraction.

## 12) Suggested Immediate Execution Order
1. Stabilize overview route rendering and status dropdown behavior.
2. Fix popup room-link navigation reliability.
3. Refactor rooms row interaction model to match current user intent.
4. Add desktop/mobile rooms split via layout-card breakpoints.
5. Add sunrise/sunset dynamic chip and bedroom next-alarm tile.
6. Fix compact scroll brightness overlap.
7. Add weather daily/hourly + precipitation/temperature variant.
8. Re-run live test loop with user.
9. Create full custom-card parameter reference doc (`ISSUE-011`) after behavior stabilizes.
10. Run deep sections-layout research + live iterative breakpoint tuning with user (`ISSUE-012`).
11. Drive a `2026.3` UI-configuration-first pass for high-frequency composition flows (`ISSUE-013`).
12. Diagnose and resolve outer-card height reporting mismatch before final layout polish (`ISSUE-014`).

## 13) Latest Update (2026-03-06): T-009B

### Implemented code changes
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - compact-mode typography increased (icon/value/label/secondary)
  - deterministic tile min-height via `--tile-row-h`
  - host-level dropdown stacking (`:host(.dd-open)`) and open/close host class toggling
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - row/slim mobile controls enlarged (orbs/toggle/icon sizing + spacing)

### New docs
- `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
- `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- `Dashboard/Tunet/Docs/brightness_alignment_rca.md`

### Validation run
- `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

### Remaining live verification
- Confirm adaptive mode dropdown overlays correctly in dense status grids with cards above/below.
- Confirm compact status readability on phone/tablet.
- Confirm row/slim room controls are now comfortable tap targets on mobile.
- Execute weather refactor tranche based on `weather_card_refactor_plan.md`.
- Execute brightness alignment fix tranche based on `brightness_alignment_rca.md` (recommended Option A).
