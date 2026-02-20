# Tunet Dashboard Card Suite - Phase 1 to Phase 5 Testing Checklist

Last updated: 2026-02-20
Owner: Tunet Card Architecture Program

This checklist is the execution gate for each implementation phase. The goal is to validate behavior at the card-contract level before dashboard composition polish.

## How To Use This Checklist

1. Run phases in order. Do not skip forward.
2. Mark each item `PASS` or `FAIL` with timestamp and tester initials.
3. Capture evidence for every gate:
   - Screenshot (desktop + mobile where applicable)
   - HA entity state snapshot
   - Browser console snippet if failure occurs
4. A phase is complete only when all gate items are `PASS`.
5. If any gate fails, fix code, redeploy, and rerun the full phase.

---

## Phase 1 - Shared Foundation Hardening

### Objective
Validate cross-card safety primitives and interaction consistency:
- shared service wrapper (`callServiceSafe`)
- icon normalization fallback
- keyboard activation parity for interactive non-button surfaces
- safe dynamic rendering paths

### Prerequisites
- Updated JS resources are deployed to `/config/www/tunet/`
- Browser hard-refresh completed (`Ctrl+Shift+R`)
- Open devtools console

### Test Items

1. Foundation availability per card
- Scope: `actions`, `climate`, `lighting`, `media`, `rooms`, `scenes`, `sensor`, `speaker_grid`, `status`, `weather`
- Step: Load each card and confirm no console errors during render.
- Expected: No `TypeError` about missing `TunetCardFoundation`; no registration errors.
- Evidence: Console screenshot.

2. Service call failure resilience
- Scope: any control that calls HA service (example: media group toggle, action chip, room orb).
- Step: Temporarily use an invalid entity in one control, trigger action.
- Expected: UI does not crash; error is logged and card remains interactive.
- Evidence: Console error + continued card interactivity screenshot.

3. Keyboard activation parity
- Scope: info tiles and any `div`-style interactive surfaces.
- Step: Tab to target, press `Enter`, then `Space`.
- Expected: Same behavior as pointer click (more-info or action).
- Evidence: Short video/GIF.

4. Icon fallback integrity
- Scope: cards using icon aliases/normalization.
- Step: Inject an invalid icon token in config (example: `not_a_real_icon`).
- Expected: Fallback icon renders; no literal ligature text artifacts.
- Evidence: Before/after screenshot.

5. Dynamic content safety check
- Scope: `climate`, `status`, `sensor`, `rooms`, `weather`.
- Step: Feed high-churn state updates (temp/humidity changes, mode changes).
- Expected: No malformed HTML fragments; labels remain stable.
- Evidence: 30s observation notes + screenshot.

### Phase 1 Gate
- PASS when all 5 items pass on desktop and mobile webview.

---

## Phase 2 - Sonos Active-Group Data Contract

### Objective
Ensure Sonos grouping UI reflects actual grouped state even when playback is idle.

### Prerequisites
- `packages/sonos_package.yaml` deployed to `/config/packages/sonos_package.yaml`
- Template reload executed (`template.reload`) or equivalent package reload cycle

### Test Items

1. New active-group sensor presence
- Step: Verify entity exists: `sensor.sonos_active_group_members`.
- Expected:
  - numeric state = grouped count
  - attributes include `coordinator`, `source`, `group_members`, `member_names`
- Evidence: Entity state dump.

2. Smart coordinator fallback attributes
- Step: Inspect `sensor.sonos_smart_coordinator` attributes.
- Expected: contains `group_members` and `grouped_count`.
- Evidence: Entity attributes screenshot.

3. Idle grouped state correctness
- Step: Group 2+ Sonos speakers, pause playback.
- Expected:
  - `sensor.sonos_active_group_members` remains > 1
  - media card grouped checkmarks still shown
- Evidence: Media card screenshot while paused.

4. Fallback chain behavior
- Step: Temporarily disable one group signal source (simulate missing active-group attr).
- Expected: media card still derives grouping via fallback (smart coordinator or binaries).
- Evidence: Console + UI confirmation.

5. Legacy compatibility guard
- Step: Validate legacy entities still exist:
  - `binary_sensor.sonos_*_in_playing_group`
- Expected: Entities present and non-breaking for old consumers.
- Evidence: States panel screenshot.

### Phase 2 Gate
- PASS when grouped state remains correct in both `playing` and `paused/idle` conditions.

---

## Phase 3 - Token and Interaction Parity

### Objective
Verify visual and interaction consistency across all cards according to current locked design contract.

### Prerequisites
- All card JS files from active branch deployed
- Theme toggling available (light/dark)

### Test Items

1. Dark-mode token parity
- Step: Toggle HA dark mode on/off.
- Expected:
  - dark cards use midnight-navy family values
  - no card remains on neutral-gray legacy tokens
- Evidence: full-page screenshot light + dark.

2. Shadow physics parity
- Step: Hover/press/drag tiles in lighting/status/rooms/media controls.
- Expected: rest and lifted shadows are consistent with phase contract.
- Evidence: short interaction capture.

3. Off-state semantics
- Step: Compare on vs off tiles across cards.
- Expected: off state is conveyed by ghost treatment and muted text, not opacity collapse.
- Evidence: side-by-side screenshot.

4. Touch-target compliance
- Step: Measure key controls with devtools overlay.
- Expected: buttons >= 42px, sliders >= 44px hit area.
- Evidence: measurement screenshot.

5. Overflow and clipping checks
- Step: Drag brightness/volume controls and open floating overlays.
- Expected: no clipping of pills, shadows, or active outlines.
- Evidence: drag screenshot at peak lift state.

### Phase 3 Gate
- PASS when all parity checks hold on desktop and iOS companion webview.

---

## Phase 4 - Card Functional Depth Validation

### Objective
Confirm each card performs its real-world operational intent.

### Prerequisites
- Stable entities configured for all cards
- Known test scene/script entities available

### Test Matrix

1. Actions card
- Verify All On / All Off / Bedtime / Sleep Mode actions call correct services/options.
- Expected: state transitions occur within one refresh cycle.

2. Lighting card
- Verify layout controls (`grid`, `scroll`, `rows`, `columns`, `scroll_rows`, `tile_size`).
- Verify drag brightness accuracy on desktop + touch.
- Verify adaptive/manual indicators and All Off state coherence.

3. Rooms card
- Verify room icon toggles full room set.
- Verify orb toggle and room-level navigation/more-info semantics.
- Verify 2x2 and dense layouts do not break internal wrapping.

4. Status card
- Verify uniform tile sizing in all data conditions.
- Verify OAL dropdown interaction and optional reset affordance behavior.

5. Weather/Environment card
- Verify current conditions + metadata + 5-day forecast render.
- Verify fallback rendering when forecast service is unavailable.

6. Media and speaker-grid cards
- Verify grouped/ungrouped checkmarks independent of playback.
- Verify dropdown layering above lower cards.
- Verify volume drag behavior and script actions (`group_all`, `ungroup_all`, membership toggle).

7. Climate card
- Verify mode/fan/preset controls and dual setpoint drag behavior.
- Verify slider changes persist without bounce-back beyond cooldown window.

8. Sensor card
- Verify interaction behavior per row action mode (`more_info`, `navigate`, `none`).
- Verify no duplicate action firing.

### Phase 4 Gate
- PASS when each card passes all scoped behaviors with no console errors.

---

## Phase 5 - Integration, Deployment, and Regression Gate

### Objective
Validate production readiness and long-term maintainability after deployment.

### Prerequisites
- All intended files committed and pushed
- HA resources reconciled to canonical file set

### Test Items

1. Resource governance check
- Step: Verify one canonical resource per card type in Lovelace resources.
- Expected: no duplicate old/alt resource collisions.

2. HA config/template health
- Step: Run HA config check and template reload.
- Expected: no package/template parse errors.

3. End-to-end startup check
- Step: Reload dashboard after HA restart.
- Expected: all cards mount cleanly, no runtime define collisions.

4. Cross-device visual regression
- Step: Capture desktop + mobile screenshots for each card.
- Expected: no clipping, no z-index regressions, no missing controls.

5. Accessibility regression
- Step: Tab-order pass across all interactive controls.
- Expected: focus visible and keyboard activation complete.

6. Performance sanity
- Step: Observe interactions for 2 minutes with frequent updates.
- Expected: no UI lockups; no runaway console warning spam.

7. Rollback readiness
- Step: Confirm remote backups exist for changed JS and package files.
- Expected: timestamped backups present and restorable.

### Phase 5 Gate
- PASS when all operational, visual, and governance checks are complete and documented.

---

## Tester Run Log Template

Use this per phase:

- Phase:
- Date/Time:
- Tester:
- Build/Commit:
- Environment:
  - Desktop browser:
  - Mobile device:
  - HA version:
- Results:
  - Item 1:
  - Item 2:
  - Item 3:
  - Item 4:
  - Item 5:
- Failures/Notes:
- Evidence links:
- Gate decision: PASS / FAIL

