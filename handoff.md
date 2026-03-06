# Tunet Dashboard Handoff (Source Of Truth)

Last updated: 2026-03-06 (America/Denver)  
Intended reader: next Codex run in a new chat  
Primary instruction: treat this file as session continuity + execution map, then verify live state before changing behavior.

## 1) Session Objective
Build and deploy a production-quality Tunet dashboard system with:
- native HA sections view
- 5+ pages plus room popups
- unified micro-interaction model
- reusable v2 custom cards
- storage dashboard deployment for live testing

User preference is explicit: prioritize complete, working UI surfaces first, then polish.

## 2) Environment / Working Context
- Primary development worktree used in session:
  - `/home/mac/HA/implementation_10/worktrees/unified-microinteractions`
  - Branch: `codex/unified-microinteractions`
- Also merged into root worktree branch:
  - `/home/mac/HA/implementation_10`
  - Branch: `claude/dashboard-nav-research-QnOBs`
  - Both now include commit `7f1ad16`.
- Active modified files are intentionally dirty (do not reset).
- Home Assistant target is reachable and was actively deployed to during this session.

### Merge/Oversight Correction
- There was a branch/worktree continuity oversight during chat.
- Final state correction:
  - `codex/unified-microinteractions` was fast-forward merged into `claude/dashboard-nav-research-QnOBs`.
  - `origin/claude/dashboard-nav-research-QnOBs` was pushed to `7f1ad16`.
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

Important: there is behavior drift between plan lock and latest user intent.  
Plan currently states room tile `tap -> toggle`, `hold -> popup`.  
Latest user intent now leans toward row cards where:
- row sub-buttons toggle individual lights
- tapping main room card should navigate/open popup
- desktop and mobile variants differ (desktop tiles, mobile row)

This mismatch must be reconciled in docs before broad refactor.

## 4) What Was Implemented

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
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - Version `3.2.1`
  - Speaker dropdown compacted heavily.
  - Dropdown rows changed to single-line state label (`Playing` / `Paused` / `Idle`) rather than long title+artist text.
  - Volume/mute path already moved to coordinator/group target model.
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - Version `2.8.0`
  - Added `layout_variant: slim`.
  - Row/slim CSS and control wiring expanded.
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - Version `3.1.1`
  - Tiny-tile icon hidden to avoid icon/text overlap in narrow tiles.

### 4.2 Dashboard YAML changes
- `Dashboard/Tunet/tunet-suite-config.yaml`
  - Added large example gallery view:
    - `title: Card Gallery`, `path: card-gallery`
  - Added broad variant demonstrations across status/actions/scenes/rooms/lighting/climate/weather/media/speaker-grid/light-tile.
  - Added/retained layout exploration surfaces (`Layout Lab`, `Vacuum Lab`).
  - Added/updated popup action strips in YAML popup blocks (for `tunet-suite` YAML flow).
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - Updated popup blocks (local source) to compact action-strip style and adaptive/manual-reset wiring.

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
This is the authoritative unresolved list from latest user messages.

### P0 (fix first)
1. Status tile mode dropdown (Adaptive/Manual/etc.) opens under tile below; selecting option appears non-functional.
2. `/tunet-suite/overview` appears blank to user (verify route + YAML registration + console errors).
3. Popups are inconsistent; popup “Room” link sometimes does not navigate.
4. Media density test section fails (identify exact failing card and JS console error path).
5. `type: custom:tunet-media-card` dynamic volume control does not work (slider/value updates and/or service path not applying as expected).

### P1 (major interaction refactor)
5. `tunet-rooms-card` row variant needs structural rewrite:
   - Sub-buttons must toggle their specific light.
   - Tapping room card body should navigate to room (or popup), not no-op.
   - Current behavior inversion exists (some sub-elements navigate instead of toggle).
   - Manual-control dot is incorrect and appears persistently.
   - Replace separate All On / All Off with one toggle-all control.
   - Normalize icon scale: room icon vs sub-icons currently mismatched.
6. Desktop/mobile behavior split needed:
   - Desktop: tiles rooms card.
   - Mobile: row rooms card.
   - Implement with layout-card + breakpoints.

### P2 (feature completion)
7. Add bedroom tile for “next Sonos alarm” sensor on bedroom page.
8. Add dynamic sunrise/sunset chip logic on overview:
   - daytime: show sunset
   - nighttime: show sunrise
9. Lighting card scroll layout compact mode:
   - brightness value text overlaps slider; needs size/position fix.
10. Weather card variants not implemented:
   - daily vs hourly
   - precipitation vs temperature toggle/segment.

## 7) Current Behavior Drift / Decision Conflicts
- Docs/plan lock says room `tap -> toggle`, `hold -> popup`.
- User now requests row-card body tap navigation/open popup and dedicated sub-control toggles.
- Before implementing more interaction changes:
  - update `plan.md` interaction contract section
  - update `FIX_LEDGER.md` affected items
  - keep one explicit contract and enforce it

If this is not reconciled, implementation drift will continue.

## 8) Files Most Relevant For Next Run

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
- `Dashboard/Tunet/Docs/mockup_vs_build_gap_log.md`

## 9) Fast Verification Checklist (Next Agent)
Run immediately before coding:
1. `git status --short`
2. Confirm current branch/worktree context:
   - root branch expected: `claude/dashboard-nav-research-QnOBs`
   - alt worktree branch expected: `codex/unified-microinteractions`
3. Open live `tunet-suite-storage` config via MCP and confirm hash.
4. Confirm JS resources still point to `v=20260306_gallery01`.
5. Verify whether `/tunet-suite/overview` blank is reproducible and collect browser console errors.
6. Reproduce dropdown issue on status tile and identify whether card logic or z-index/overflow.
7. Reproduce row-card tap/sub-button mismatch in `tunet-rooms-card`.

## 10) Build / Validate / Deploy Commands

### JS syntax validation
```bash
cd /home/mac/HA/implementation_10/worktrees/unified-microinteractions
for f in Dashboard/Tunet/Cards/v2/tunet_*.js; do node --check "$f"; done
```

### YAML parse validation
```bash
cd /home/mac/HA/implementation_10/worktrees/unified-microinteractions
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
cd /home/mac/HA/implementation_10/worktrees/unified-microinteractions
set -a && source /home/mac/HA/implementation_10/.env && set +a
sshpass -p "$HA_SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Dashboard/Tunet/Cards/v2/tunet_*.js "$HA_SSH_USER@$HA_SSH_HOST:/config/www/tunet/v2_next/"
```

### Deploy YAML to HA
```bash
cd /home/mac/HA/implementation_10/worktrees/unified-microinteractions
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
