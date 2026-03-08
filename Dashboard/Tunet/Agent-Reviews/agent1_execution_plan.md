# Agent 1: Corrected Execution Plan

**Date:** 2026-03-06
**Branch:** `claude/dashboard-nav-research-QnOBs`
**HEAD:** `98d961c`
**Role:** Manager / Ledger Integrator (Agent 1 of 4)
**Status:** FIRST PASS -- awaiting Agent 4 attack review

---

## Design Rationale

This execution plan incorporates Agent 4's critique of the 7-tranche popup-fix.md plan.

**Key corrections applied:**

1. **CP-01 declared DONE.** The governance infrastructure already exists (plan.md, FIX_LEDGER.md, TRANCHE_TEMPLATE.md, Change ID scheme, control doc precedence, branch guards). Adding more governance documentation before shipping code is bureaucratic drift.

2. **LAY-01 eliminated.** Layout research merged into first implementation tranche. The working popup IS the layout prototype that validates Sections behavior.

3. **LAY-02 eliminated.** Agent 3 proved there is no `max_columns` cap problem. All cards consistently use `max_columns: 12` (the grid maximum). The `columns: 'full'` anomaly and lighting card fixed row height are backlog items, not a tranche.

4. **INT-01 split and shrunk.** The shared adapter and `hold_action` support are popup prerequisites -- merged into POP-01. Nav expansion is separate scope (NAV-01). Interaction contract documentation is already substantially done in popup-fix.md.

5. **Footer card spike added before NAV-01.** HA 2026.3 native footer cards could eliminate FL-011 (global offset pollution) entirely. This one-hour investigation must happen before committing to the current nav architecture.

6. **Popup mechanism simplified.** POP-01 uses the proven `call-service browser_mod.popup` mechanism (already deployed in storage config) instead of the unverified `popup-card` + `fire-dom-event` combination.

7. **Nav scoped to 3-4 items initially.** 7-destination nav is unvalidated at 320px. Expansion gated on small-screen touch target validation.

---

## Tranche Sequence

```
SPIKE-01 (footer card test, 1 hour, no code committed)
    |
    v
POP-01 (Living Room popup POC, half day)
    |
    v
POP-02 (popup scale-out to remaining rooms, 2-3 hours)
    |
    v
NAV-01 (nav architecture based on SPIKE-01 results, 1 day)
```

Total estimated effort: approximately 2 days of implementation work.

---

## SPIKE-01: Footer Card Investigation

### TRANCHE_ID
SPIKE-01

### TITLE
Test nav card as HA 2026.3 Sections footer card

### STATUS
PLANNED

### SOURCE_ITEMS
- `FIX_LEDGER.md: FL-011, FL-027`
- Agent 2: A10, G1
- Agent 4: A4

### GOAL
Determine whether `tunet-nav-card` can be deployed as a native Sections footer card, eliminating global offset injection.

### WHY_NOW
This is a one-hour investigation that could save 10+ hours of offset debugging in NAV-01. The answer fundamentally changes the nav architecture approach. HA 2026.3.0b1 is already running.

### USER_VISIBLE_OUTCOME
No user-visible outcome. Internal architectural decision recorded.

### FILES_ALLOWED
- None committed. Test in HA UI only.

### FILES_FORBIDDEN_UNLESS_BLOCKED
- All JS files
- All YAML config files

### CURRENT_STATE
Nav card uses `position: fixed` + `ensureGlobalOffsetsStyle()` + `document.documentElement.style.setProperty()` for mobile bottom dock. This injects global side effects (FL-011).

### INTENDED_STATE
Decision recorded: either "footer card viable for mobile" or "footer card not viable, keep position: fixed."

### EXACT_CHANGE_IN_ENGLISH
- In HA UI (not in code), attempt to place `tunet-nav-card` as a Sections footer card
- Observe: Does the card render at the bottom? Does it remain sticky during scroll? Does it affect other dashboards?
- If footer card works for mobile dock: record this as the preferred approach for NAV-01 mobile mode
- If footer card does not work (e.g., does not support fixed positioning, or does not render correctly): record why and proceed with route-scoped `position: fixed` approach

### ARCHITECTURAL_INTENTION
Determine whether HA's native extension point can replace the fragile global offset injection pattern.

### ACCEPTANCE_CRITERIA
- Decision recorded with evidence
- If viable: list what can be deleted from nav card (estimate: `ensureGlobalOffsetsStyle()`, `_applyOffsets()`, `__tunetNavCardCount`)
- If not viable: list what approach NAV-01 will take instead (route-scoped offsets)

### VALIDATION
- Static: N/A (no code changes)
- Runtime: observe footer card behavior in HA UI
- HA/live: test on HA 2026.3.0b1

### DEPLOY_IMPACT
NONE

### ROLLBACK
Remove footer card placement in HA UI (one click).

### DEPENDENCIES
- HA 2026.3.0b1 running (confirmed HA.05)

### UNKNOWNS
- Does footer card support custom cards with `position: fixed`?
- Does footer card support the desktop side-rail pattern?
- Does footer card appear on all views or only the view where it is defined?
- Can a footer card have `columns: 'full'` or does it use a different sizing model?

### STOP_CONDITIONS
- If HA 2026.3 does not actually have footer card support (beta feature removed)
- If footer card requires a fundamentally different card API than current `tunet-nav-card`

### OUT_OF_SCOPE
- Any code changes
- Nav expansion to 7 items
- Popup work
- Config editor work

### REVIEW_FOCUS
- Was the test actually performed on the live HA instance?
- Is the decision clearly documented with evidence?
- Are the implications for NAV-01 spelled out?

---

## POP-01: Living Room Popup POC

### TRANCHE_ID
POP-01

### TITLE
Living Room hold-to-popup with tap-to-toggle (proven mechanism)

### STATUS
PLANNED

### SOURCE_ITEMS
- `FIX_LEDGER.md: FL-030, FL-031, FL-032`
- `popup-fix.md: Section 5 (POP-01)`
- Agent 3: D1, D3
- Agent 4: C4, G2

### GOAL
Room tile tap toggles all room lights. Room tile hold (>=400ms) opens a Browser Mod popup showing the room's lighting controls.

### WHY_NOW
This is the minimum viable deliverable that produces user-visible progress and validates the locked interaction model (tap=toggle, hold=popup). Uses the proven `call-service browser_mod.popup` mechanism already deployed in the storage config.

### USER_VISIBLE_OUTCOME
- Tapping a Living Room tile toggles all Living Room lights on/off
- Holding a Living Room tile for 400ms opens a Browser Mod popup with lighting controls
- Popup contains "All Off" button, "Open Room" navigation, and a compact `tunet-lighting-card`

### FILES_ALLOWED
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- `tunet_base.js` (shared adapter is desirable but not required for POC)
- `tunet_nav_card.js`
- `tunet-suite-config.yaml` (YAML surface update deferred to after storage validation)
- All other card JS files

### CURRENT_STATE
- `tunet_rooms_card.js`:
  - `setConfig` (L329-352): does NOT read `hold_action`
  - `onPointerDown` timer (L450-456): hardcoded to `_toggleRoomGroup()`
  - `onPointerUp` (L459-474): tap defaults to navigate/tap_action
  - `_handleTapAction` (L524-571): supports more-info, navigate, url, call-service. Does NOT support `fire-dom-event`.
- `tunet-suite-storage-config.yaml`:
  - Living Room (L170-246): has `navigate_path` (L173) and `tap_action: call-service browser_mod.popup` (L174-230)
  - Popup uses `size: wide` (L179) -- should verify if `initial_style` is preferred

### INTENDED_STATE
- `tunet_rooms_card.js`:
  - `setConfig` reads `hold_action` from room config
  - `onPointerDown` timer checks `hold_action` before falling back to toggle
  - `onPointerUp` defaults to `_toggleRoomGroup()` (not navigate)
  - `_handleTapAction` gains `fire-dom-event` support (6 lines)
- `tunet-suite-storage-config.yaml`:
  - Living Room: popup config moved from `tap_action` to `hold_action`
  - `navigate_path` kept as fallback (not removed yet, per FL-037 decision)
  - Tap defaults to toggle (no `tap_action` specified means toggle is default)

### EXACT_CHANGE_IN_ENGLISH

**tunet_rooms_card.js:**
1. In `setConfig` (after L340): Add `hold_action: room.hold_action || null,` to the room mapping
2. In pressTimer callback (L450-456): Replace `this._toggleRoomGroup(roomCfg)` with a conditional: if `roomCfg.hold_action` exists, call `this._handleTapAction(roomCfg.hold_action, roomCfg)`, else call `this._toggleRoomGroup(roomCfg)`
3. In `onPointerUp` (L459-474): Replace the tap handler body: if `roomCfg.tap_action`, call `this._handleTapAction(roomCfg.tap_action, roomCfg)`, else call `this._toggleRoomGroup(roomCfg)`. Remove `navigate_path` and `hass-more-info` fallback from tap path.
4. After `call-service` case in `_handleTapAction` (after L561): Add `fire-dom-event` case that dispatches `new CustomEvent('ll-custom', { bubbles: true, composed: true, detail: tapAction })`

**tunet-suite-storage-config.yaml (Living Room on overview, L170-246):**
1. Move the entire `tap_action:` block (L174-230) to `hold_action:` (same content, different key)
2. Do NOT remove `navigate_path` yet (keep as fallback until FL-037 decision is made)
3. The absence of `tap_action` means tap defaults to toggle (new behavior from JS change)

### ARCHITECTURAL_INTENTION
Validate the room-popup interaction pattern (tap=toggle, hold=popup) using the proven `call-service browser_mod.popup` mechanism before scaling to other rooms. This is the foundation for POP-02.

### ACCEPTANCE_CRITERIA
- [ ] Tapping Living Room tile toggles all Living Room lights (on->off, off->on)
- [ ] Holding Living Room tile for >=400ms opens a Browser Mod popup
- [ ] Popup contains exactly one `tunet-lighting-card` with 5 Living Room zones
- [ ] Popup has "All Off" button that turns off all Living Room lights
- [ ] Popup has "Open Room" button that navigates to Living Room subview
- [ ] Short tap on other rooms still works as before (tap_action or navigate)
- [ ] No regression on Kitchen/Dining/Bedroom rooms (their behavior unchanged)
- [ ] Keyboard Enter/Space on Living Room tile triggers toggle (tap behavior)

### VALIDATION
- **Static:** `hold_action: room.hold_action || null` present in setConfig mapping
- **Static:** pressTimer callback contains `hold_action` conditional
- **Static:** `fire-dom-event` case exists in `_handleTapAction`
- **Runtime:** No JS errors in console on page load or interaction
- **HA/live:** Tap Living Room tile -> lights toggle. Hold -> popup opens. Popup controls work.

### DEPLOY_IMPACT
HA RESOURCE UPDATE:
- Copy updated `tunet_rooms_card.js` to `/config/www/tunet/v2_next/`
- Bump `?v=` on rooms card resource in Lovelace Resources
- Update storage config YAML (through HA UI or raw editor)
- Hard refresh with cache disabled

### ROLLBACK
- Revert `tunet_rooms_card.js` to pre-change version
- Revert storage config: move `hold_action` back to `tap_action`
- Bump `?v=` and hard refresh

### DEPENDENCIES
- Browser Mod v2.8.x installed and working (confirmed: storage config already uses `browser_mod.popup`)
- Living Room light entities exist and are controllable
- Rooms card resource is loaded and cache-bustable

### UNKNOWNS
- Does the `call-service` action in `_handleTapAction` correctly pass `service_data` with the full popup content to `browser_mod.popup`? (It should -- this is how the current tap_action works.)
- Will `size: wide` continue to work in Browser Mod 2.8.2 or does it need `initial_style: wide`?

### STOP_CONDITIONS
- If `call-service browser_mod.popup` stops working (test current tap behavior first before changing)
- If the rooms card JS changes break other rooms' behavior
- If Browser Mod popup does not render inside the storage dashboard

### OUT_OF_SCOPE
- Kitchen/Dining/Bedroom popups (POP-02)
- Nav expansion (NAV-01)
- Shared `executeAction` adapter (FL-012 -- nice to have but not required)
- `navigate_path` removal (FL-037 -- decision deferred)
- Hold visual feedback (FL-033 -- enhancement)
- Keyboard hold_action accessibility (FL-034 -- enhancement)
- Config editor changes
- YAML surface config update (port after storage validation)

### REVIEW_FOCUS
- Scope discipline: only rooms card JS and storage config changed
- Interaction swap correctness: tap=toggle, hold=popup
- No regression on rooms without hold_action configured
- Popup mechanism uses proven `call-service`, not unverified `fire-dom-event`
- Deployment step included (cache bust)

---

## POP-02: Popup Scale-Out

### TRANCHE_ID
POP-02

### TITLE
Apply hold-to-popup pattern to Kitchen, Dining, Bedroom

### STATUS
PLANNED (blocked on POP-01 completion)

### SOURCE_ITEMS
- `popup-fix.md: Section 7 (POP-02)`
- `FIX_LEDGER.md: FL-030, FL-032` (prerequisite code already done in POP-01)

### GOAL
All four rooms have working hold-to-popup behavior with room-specific lighting controls.

### WHY_NOW
POP-01 validates the pattern. POP-02 applies it uniformly. This is mechanical work using a proven template.

### USER_VISIBLE_OUTCOME
- Hold on any room tile (Living, Kitchen, Dining, Bedroom) opens a room-specific lighting popup
- Each popup shows the correct lights for that room
- Tap on any room tile toggles that room's lights

### FILES_ALLOWED
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- All JS files (no code changes needed -- POP-01 already added the capability)
- `tunet-suite-config.yaml` (YAML surface deferred)

### CURRENT_STATE
After POP-01:
- Living Room has `hold_action` with popup
- Kitchen (L248-310): has `tap_action: call-service browser_mod.popup`
- Dining (L315): has `navigate_path` only
- Bedroom (L326): has `navigate_path` only

### INTENDED_STATE
All four rooms have `hold_action` with `call-service browser_mod.popup` containing room-appropriate lighting card zones. Kitchen popup already exists as `tap_action` -- move to `hold_action`. Dining and Bedroom need new popup definitions.

### EXACT_CHANGE_IN_ENGLISH
1. **Kitchen (overview):** Move existing `tap_action` popup block to `hold_action`. Remove `tap_action` so tap defaults to toggle.
2. **Dining (overview):** Add `hold_action` with `call-service browser_mod.popup` containing a `tunet-lighting-card` with dining zones (spots, columns).
3. **Bedroom (overview):** Add `hold_action` with `call-service browser_mod.popup` containing a `tunet-lighting-card` with bedroom zones (main, accent, table lamps).
4. **Rooms view:** Apply same pattern to room entries on the Rooms view if they exist.

### ACCEPTANCE_CRITERIA
- [ ] Hold on Kitchen tile opens Kitchen popup with pendants/main/under-cab
- [ ] Hold on Dining tile opens Dining popup with spots/columns
- [ ] Hold on Bedroom tile opens Bedroom popup with main/accent/table lamps
- [ ] Tap on all rooms toggles lights
- [ ] Each popup has "All Off" and "Open Room" buttons

### VALIDATION
- **Static:** Each room in storage config has `hold_action` with popup definition
- **HA/live:** Hold each room tile; confirm popup opens with correct room lights
- **HA/live:** Tap each room tile; confirm lights toggle

### DEPLOY_IMPACT
HA DASHBOARD UPDATE (storage config changes only, no JS changes)

### ROLLBACK
Revert storage config changes in HA raw editor.

### DEPENDENCIES
- POP-01 completed and validated
- Room light entities exist for all rooms

### OUT_OF_SCOPE
- YAML surface update
- Nav changes
- Popup styling polish
- Additional popup content (temperature, media)

---

## NAV-01: Nav Architecture Decision + Implementation

### TRANCHE_ID
NAV-01

### TITLE
Nav card architecture improvement based on footer card investigation

### STATUS
PLANNED (blocked on SPIKE-01 and POP-01)

### SOURCE_ITEMS
- `FIX_LEDGER.md: FL-011, FL-027, FL-029, FL-035, FL-038`
- Agent 2: A10, G1
- Agent 4: A2, A4

### GOAL
Resolve the nav card's global DOM pollution (FL-011) and establish a sustainable nav architecture for the Tunet dashboard.

### WHY_NOW
The popup POC (POP-01/POP-02) can ship without nav changes. NAV-01 addresses the most significant architectural defect in the codebase (global offset injection) and is informed by SPIKE-01 results.

### USER_VISIBLE_OUTCOME
- Nav card works without affecting other dashboards
- Mobile bottom dock uses native or properly scoped positioning
- Desktop side-rail behavior preserved
- Active state highlighting works for all routes including subviews

### FILES_ALLOWED
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/tunet-suite-config.yaml`

### SCOPE DEPENDS ON SPIKE-01 RESULT

**If SPIKE-01 succeeds (footer card viable for mobile):**
- Remove `position: fixed` for mobile mode
- Remove `ensureGlobalOffsetsStyle()` function
- Remove `_applyOffsets()` method
- Remove `window.__tunetNavCardCount` reference counting
- Remove global CSS variable injection from `connectedCallback`/`disconnectedCallback`
- Keep `position: fixed` for desktop side-rail mode only (if footer card does not support side-rail)
- Resolve FL-038 (nav duplication) if footer card is declared once per dashboard

**If SPIKE-01 fails (footer card not viable):**
- Add route-awareness to offset application (only apply when path starts with Tunet dashboard path)
- Scope the injected `<style>` to Tunet-specific selectors
- Keep existing architecture but reduce blast radius
- Do NOT expand to 7 items (keep 3-4 until scoping is solved)

### NAV ITEM COUNT DECISION

This tranche does NOT expand to 7 destinations by default. Expansion is gated on:
1. SPIKE-01 result (footer card may change the layout model entirely)
2. Validated touch target compliance at 320px for the expanded item count
3. Explicit user decision on whether per-room nav items are needed when popups provide room access

If expansion is approved, the card must support:
- Configurable `items: [{label, icon, path}]` array
- Dynamic CSS grid (`repeat(var(--nav-items, N), ...)`)
- Mobile overflow handling (icons-only condensed mode or horizontal scroll)
- `getConfigForm()` update (if feasible for arrays)

### ACCEPTANCE_CRITERIA
- [ ] Opening a non-Tunet dashboard after loading Tunet shows no extra spacing
- [ ] Mobile bottom dock renders correctly on smallest supported viewport
- [ ] Desktop side-rail renders correctly
- [ ] Active state highlighting updates on navigation and browser back/forward
- [ ] Subview pages show correct active state (e.g., Living Room subview highlights correct parent)

### DEPLOY_IMPACT
HA RESOURCE UPDATE (JS + cache bust)

### ROLLBACK
Revert `tunet_nav_card.js` to pre-change version. Bump `?v=` and hard refresh.

### OUT_OF_SCOPE
- Popup changes
- Live-state affordances on nav (now-playing indicator, per-destination state hints) -- future tranche
- Mini-player in nav
- Config editor improvements

---

## Future Backlog (Not Scheduled)

These items are tracked in the master ledger but not scheduled into the current 4-tranche plan.

| ID | Title | Priority | Notes |
|---|---|---|---|
| FL-012 | Shared `executeAction` adapter | Medium | Desirable infrastructure, not blocking |
| FL-015 | AL scan performance | Medium | Optimization, not user-visible |
| FL-033 | Hold feedback animation | Medium | UX polish for POP-01 interaction |
| FL-034 | Keyboard hold_action | Medium | Accessibility |
| FL-036 | Browser Mod `size` vs `initial_style` | Low | API hygiene |
| FL-037 | `navigate_path` removal decision | Medium | Depends on nav reliability |
| FL-039 | innerHTML sanitization | Low | Security hardening |
| FL-040 | Lighting card fixed row height | Medium | Sections compliance |
| FL-042 | Sensor card dead code | Low | Cleanup |
| FL-043 | `columns: 'full'` verification | Low | May be moot with footer card |
| FL-044 | `fireEvent` consolidation | Low | Code consistency |
| FL-005 | Sensor `value_attribute` deploy | Medium | Needs HA verification |
| FL-013/018 | Config editor work | Medium | YAML-first is acceptable |
| FL-014 | Speaker cache invalidation | Medium | Performance |
| FL-016/017 | Doc cleanup | Low | Non-blocking |
| FL-020 | Storage AQI cleanup | Medium | Live HA task |
| FL-041 | Light attribute deprecation audit | Low | Confirmed clean for lighting card |
