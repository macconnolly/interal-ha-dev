# Agent 1: Master Ledger (Corrected)

**Date:** 2026-03-06
**Branch:** `claude/dashboard-nav-research-QnOBs`
**HEAD:** `98d961c`
**Role:** Manager / Ledger Integrator (Agent 1 of 4)
**Status:** FIRST PASS -- awaiting Agent 4 attack review

---

## Preamble: Reconciliation Notes

### Stale Finding Reconciliation

| Finding | Claimed Status | Verified Status | Evidence |
|---|---|---|---|
| FL-025 (nav inactive items invisible) | DONE in ledger | DONE -- confirmed | Fix deployed, user confirmed 2026-03-06. `tunet_nav_card.js` uses `var(--text-muted)` + dark override. |
| FL-026 (nav icon spacing) | DONE in ledger | DONE -- confirmed | Fix deployed, user confirmed 2026-03-06. `line-height: 22px; overflow: hidden` on `.btn .icon`, gap reduced to 2px. |
| FL-010 (nav amber-strong token) | DONE in ledger | DONE -- confirmed | `tunet_nav_card.js` line 101: `color: var(--amber)`. No reference to `--amber-strong` remains. |
| FL-009 (back_path on subviews) | CODE-DONE / HA-VERIFY in ledger | DONE -- confirmed in both surfaces | `tunet-suite-config.yaml`: lines 523, 576, 611, 646. `tunet-suite-storage-config.yaml`: lines 537, 590, 625, 660. |
| `back_path` already present | Reconciled findings list | CONFIRMED present on both YAML and storage surfaces | See above |
| Storage Living Room popup uses consolidated lighting card | Reconciled findings list | CONFIRMED | `tunet-suite-storage-config.yaml` lines 207-230: single `tunet-lighting-card` with 5 zones |
| Nav active color token drift | Reconciled findings list | FIXED | Uses `var(--amber)` correctly |
| `escapeHtml` in `TunetCardFoundation` | Memory claim | NOT PRESENT | `grep escapeHtml tunet_base.js` returns zero matches. Memory entry is stale/aspirational. |

### Control Document Conflicts (CONTROL_DOC_CONFLICTS)

| Conflict | Source A | Source B | Resolution |
|---|---|---|---|
| Tranche ordering | `plan.md`: T-005 Nav, T-006 Popup, T-007 UI/UX, T-008 Home Layout | `popup-fix.md`: CP-01, LAY-01, LAY-02, INT-01, POP-01, NAV-01, POP-02 | plan.md has precedence. popup-fix.md's ordering is superseded. This ledger uses a reconciled order. |
| Popup architecture | `popup-fix.md`: `fire-dom-event` + hidden `popup-card` definitions | `tunet-suite-storage-config.yaml`: `call-service browser_mod.popup` with inline content | Storage config approach is proven and deployed. Plan's approach is unverified. This ledger recommends the proven mechanism for POP-01. |
| Browser Mod field name | `popup-fix.md`: uses `initial_style: wide` | `tunet-suite-storage-config.yaml`: uses `size: wide` and `size: normal` | Browser Mod 2.8.x supports `initial_style`. The deployed config uses `size` which may be deprecated. Needs verification. |
| Nav item count | `popup-fix.md`: 7 destinations | `plan.md`: no specific count, defers to tranche | 7 destinations unvalidated at 320px. This ledger recommends 3-4 items for NAV-01, with expansion gated on small-screen validation. |

---

## Section 1: DONE Items (Closed, No Reopening Without Evidence)

### FL-000: Control-Plane Hardening
- **Status:** DONE
- **Category:** Governance
- **Evidence:** All control docs exist, precedence documented, branch guards in place.

### FL-001: Deployment Resource Path Drift
- **Status:** DONE
- **Category:** Documentation
- **Evidence:** `DEPLOYMENT_RESOURCES.md` corrected to `v2_next`.

### FL-002: Forced `rows: 2` in YAML Configs
- **Status:** DONE
- **Category:** Sections Compliance
- **Evidence:** `rg -n "rows:\s*2" Dashboard/Tunet/*.yaml` returns zero matches.

### FL-003: Bedroom Entity Drift (`bedroom_accent_light`)
- **Status:** DONE
- **Category:** Entity Contract
- **Evidence:** Suite config uses `light.master_bedroom_corner_accent_govee`.

### FL-004: Media Card Sensor Contract Drift
- **Status:** DONE
- **Category:** Entity Contract
- **Evidence:** Suite YAML uses `sensor.sonos_active_group_coordinator`.

### FL-006: Sensor Card Stub AQI Reference
- **Status:** DONE
- **Category:** Entity Hygiene
- **Evidence:** Stub config no longer references `sensor.aqi`.

### FL-010: Nav amber-strong Token Undefined
- **Status:** DONE
- **Category:** Token Compliance
- **Evidence:** Nav card line 101 uses `var(--amber)`. No `--amber-strong` reference remains.

### FL-022: Popup Direction Lock
- **Status:** DONE / DIRECTION LOCKED
- **Category:** Product Direction
- **Evidence:** Browser Mod preferred, one popup per room, documented in plan.md and nav_popup_ux_direction.md.

### FL-025: Nav Inactive Items Invisible
- **Status:** DONE
- **Category:** Accessibility / Rendering
- **Evidence:** Fix deployed, user confirmed 2026-03-06.

### FL-026: Nav Icon Spacing Excessive
- **Status:** DONE
- **Category:** Visual Polish
- **Evidence:** Fix deployed, user confirmed 2026-03-06.

---

## Section 2: VERIFIED BUT NOT FULLY DEPLOYED

### FL-005: Sensor Card Missing `value_attribute` Support
- **Status:** CODE-DONE / HA-VERIFY
- **Severity:** HIGH
- **Category:** Feature Gap
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
- **Current State:** Code implements `value_attribute` handling but runtime verification on live HA incomplete.
- **Intended State:** "Outside" sensor row shows numeric temperature from `weather.home` attribute, not weather condition string.
- **Exact Change:** Already implemented in JS. Needs deploy + cache-bust + visual confirmation.
- **Dependencies:** None.
- **Validation:** Open dashboard, confirm "Outside" row shows a numeric temperature value.
- **Deploy Impact:** HA RESOURCE UPDATE (copy JS, bump `?v=`).
- **Can Ship Independently:** Yes.

### FL-007: Living Room Popup Uses Consolidated Lighting Surface
- **Status:** CODE-DONE / HA-VERIFY (YAML surface); DONE (Storage surface)
- **Severity:** HIGH
- **Category:** POC Structure
- **Files:** `Dashboard/Tunet/tunet-suite-config.yaml`, `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- **Current State:** Storage config confirmed at lines 207-230 with single `tunet-lighting-card`. YAML config needs verification.
- **Intended State:** Both surfaces use one consolidated lighting card in the Living Room popup.
- **Validation:** Open Living Room popup on both surfaces; confirm exactly one lighting card.
- **Can Ship Independently:** Yes.

### FL-008: Living Room Subview Consolidated
- **Status:** CODE-DONE / HA-VERIFY
- **Severity:** MEDIUM-HIGH
- **Category:** POC Structure
- **Files:** `Dashboard/Tunet/tunet-suite-config.yaml`
- **Validation:** Open `/tunet-suite/living-room` and confirm one consolidated lighting card.
- **Can Ship Independently:** Yes.

### FL-009: Room Subviews Declare `back_path`
- **Status:** DONE (upgrading from CODE-DONE / HA-VERIFY)
- **Severity:** MEDIUM
- **Category:** Navigation
- **Files:** `Dashboard/Tunet/tunet-suite-config.yaml`, `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- **Evidence:** Confirmed present on both surfaces: YAML config (lines 523, 576, 611, 646) and storage config (lines 537, 590, 625, 660).
- **Can Ship Independently:** Already shipped.

---

## Section 3: OPEN Defects

### FL-011: Nav Card Global DOM Pollution
- **Status:** OPEN
- **Severity:** HIGH
- **Category:** Architecture / Sections Compliance
- **Requirement Alignment:** REQ-NAV-001, REQ-NAV-002
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (lines 143-156, 258-260, 265-280, 303-308)
- **Current State:** Nav card injects `<style>` into `document.head` targeting `hui-view` and sets CSS variables on `document.documentElement`. Cleanup depends on fragile `window.__tunetNavCardCount` reference counting.
- **Intended State:** Nav offsets scoped to Tunet dashboard only. Zero cross-dashboard side effects.
- **Exact Change:** Two options: (1) Use HA 2026.3 footer card for mobile positioning, eliminating offsets entirely. (2) Add route-awareness so offsets apply only when `location.pathname` starts with the Tunet dashboard path.
- **Dependencies:** SPIKE-01 (footer card investigation) should inform the approach.
- **Validation:** Open a non-Tunet dashboard after loading Tunet; confirm no extra spacing.
- **Deploy Impact:** HA RESOURCE UPDATE.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 2 SV-001, Agent 3 A7, Agent 4 A4.

### FL-012: Navigation via Direct History Manipulation
- **Status:** OPEN
- **Severity:** HIGH
- **Category:** Architecture
- **Requirement Alignment:** REQ-NAV-001, REQ-UX-001
- **Files:** `tunet_nav_card.js` (L332-333), `tunet_rooms_card.js` (L465-467, L545-546), `tunet_status_card.js` (L871-872)
- **Current State:** Three cards independently implement `history.pushState` + `location-changed` dispatch. Missing `ensureDialogsClosed()` and `replace` mode.
- **Intended State:** Centralized via shared `executeAction` adapter in `tunet_base.js`. Includes dialog-closing behavior.
- **Exact Change:** Add `executeAction()` to `tunet_base.js`. Migrate rooms, status, and nav cards to use it. Add `ensureDialogsClosed()` behavior.
- **Dependencies:** None, but should be consistent across cards.
- **Validation:** Browser back/forward works correctly. Open dialogs close before navigation. No custom history shims remain.
- **Deploy Impact:** HA RESOURCE UPDATE.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 2 SV-002 (A4 nuance: the pattern itself matches HA internal, but missing dialog close + replace + duplication make it a real defect), Agent 3 A3/B1.

### FL-013: Nav `subview_paths` Config Editor Schema Mismatch
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Config Editor
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (L187-189)
- **Current State:** `subview_paths` exposed as `object` selector; card consumes array of strings.
- **Intended State:** Either implement a real repeatable string list editor or remove from visual schema (YAML-only).
- **Exact Change:** Remove `subview_paths` from `getConfigForm()` schema. Document as YAML-only.
- **Dependencies:** Broader config editor decision (FL-018).
- **Validation:** UI editor no longer shows broken `subview_paths` field.
- **Deploy Impact:** HA RESOURCE UPDATE.
- **Can Ship Independently:** Yes.

### FL-014: Media Card Speaker Cache Never Invalidated
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Performance
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_media_card.js`, `tunet_sonos_card.js`
- **Current State:** `_cachedSpeakers` never invalidated when entity topology changes.
- **Intended State:** Cache invalidated on relevant media-player or Sonos group entity changes.
- **Validation:** Add/remove a speaker from Sonos group; card reflects change without full browser refresh.
- **Can Ship Independently:** Yes.

### FL-015: Adaptive Lighting Full-Registry Scan
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Performance
- **Files:** `tunet_rooms_card.js` (L374-378, L603-613), `tunet_lighting_card.js` (L863, L1421-1424)
- **Current State:** Both cards iterate `Object.keys(hass.states)` to find `switch.adaptive_lighting_*` entities on every state change.
- **Intended State:** Cache AL switch entity IDs on first scan; recompute only when count changes.
- **Exact Change:** Add `_alSwitchCache` property. Populate once per update cycle. Reuse in change detection and update loops.
- **Validation:** Code no longer performs repeated full-registry scans.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 2 SV-003, Agent 3 A8.

### FL-016: Navigation Research Doc Not Labeled Historical
- **Status:** OPEN
- **Severity:** LOW
- **Category:** Documentation
- **Files:** `Dashboard/Tunet/Docs/dashboard_navigation_research.md`
- **Exact Change:** Add header marking as historical; point to plan.md and FIX_LEDGER.md.
- **Can Ship Independently:** Yes.

### FL-017: Entity Inventory Drift Across Dashboard YAMLs
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Entity Hygiene
- **Files:** `tunet-suite-config.yaml`, `tunet-overview-config.yaml`, `tunet-v2-test-config.yaml`
- **Current State:** Three YAMLs with inconsistent entity references.
- **Intended State:** Canonical inventory in suite config; legacy files labeled at top.
- **Dependencies:** FL-003 (done).
- **Can Ship Independently:** Yes.

### FL-018: Config Editor Schema/Reality Gap
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Config Editor
- **Files:** All V2 cards with `getConfigForm()`
- **Current State:** Complex array fields (rooms, zones, tiles, sensors) are either exposed as broken `object` selector or omitted.
- **Intended State:** Explicit simple-editor vs YAML-first classification per card. Cards with complex nested arrays exclude those fields from `getConfigForm()` schema.
- **Agent Sources:** Agent 2 SV-004, Agent 3 A6.
- **Can Ship Independently:** Yes (one card at a time).

### FL-019: Bug 4 Live Verification
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Validation Task
- **Exact Change:** Test "Add card" in HA UI for nav, weather, climate, and rooms cards. Record pass/fail matrix.
- **Dependencies:** Cache bust.
- **Can Ship Independently:** Yes.

### FL-020: Storage Dashboard `sensor.aqi` References
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Entity Hygiene
- **Exact Change:** Search and remove `sensor.aqi` from all HA storage dashboards.
- **Dependencies:** Live HA access.
- **Can Ship Independently:** Yes.

---

## Section 4: OPEN Product-Direction Decisions

### FL-021: Comparison Strategy (Switch-in-Place vs Separate Tags)
- **Status:** OPEN / DECISION
- **Can Ship Independently:** N/A -- decision, not code.

### FL-023: `tile_size` Knobs vs Sections Auto-Height
- **Status:** OPEN / DECISION
- **Can Ship Independently:** N/A -- decision.

### FL-024: `columns: "full"` Policy
- **Status:** OPEN / DECISION
- **Note:** Agent 3 confirmed only nav card uses `columns: "full"`. Agent 2 notes this is appropriate for chrome. Decision: keep for nav only. Other cards should use numeric values.
- **Can Ship Independently:** N/A -- decision.

---

## Section 5: NEW FINDINGS (from Agents 2, 3, 4 + Session)

### FL-027: HA 2026.3 Footer Cards -- Potential Nav Architecture Replacement
- **Status:** OPEN / INVESTIGATION
- **Severity:** HIGH (opportunity)
- **Category:** Architecture
- **Requirement Alignment:** REQ-NAV-001
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- **Current State:** Nav card uses `position: fixed` + global CSS variable injection.
- **Intended State:** Mobile nav uses HA 2026.3 native footer card positioning. Desktop retains `position: fixed` for side-rail.
- **Exact Change:** Spike investigation: deploy `tunet-nav-card` as a Sections footer card. If viable, remove `ensureGlobalOffsetsStyle()`, `_applyOffsets()`, and `window.__tunetNavCardCount` hack.
- **Dependencies:** Must be investigated before NAV-01 architectural commitment.
- **Validation:** Nav card renders correctly as footer card on mobile. No global offset injection.
- **Deploy Impact:** None for spike; HA RESOURCE UPDATE if adopted.
- **Can Ship Independently:** Yes (spike is non-destructive).
- **Agent Sources:** Agent 2 A10/G1, Agent 4 A4.

### FL-028: Popup Architecture Inconsistency (Two Mechanisms in Plan)
- **Status:** OPEN / DECISION REQUIRED
- **Severity:** HIGH
- **Category:** Architecture
- **Requirement Alignment:** REQ-POP-001
- **Current State:** popup-fix.md defines hidden `custom:popup-card` + `fire-dom-event`. Storage config uses `call-service browser_mod.popup` with inline content. These are incompatible.
- **Resolution:** Use `call-service browser_mod.popup` (proven) for POP-01. Evaluate `popup-card`/`fire-dom-event` approach in a later tranche only if inline approach proves unmaintainable.
- **Agent Sources:** Agent 2 E1/G2, Agent 4 A5/G2.

### FL-029: 7-Item Nav Breaks at 320px (Touch Target Violation)
- **Status:** OPEN / DESIGN BLOCKED
- **Severity:** HIGH
- **Category:** UX / Accessibility
- **Requirement Alignment:** REQ-NAV-002, REQ-UX-001
- **Current State:** 7 items at 320px yields 42px per item, below the 44px minimum touch target in the design language.
- **Intended State:** Nav items meet 44px minimum touch target at all supported viewport widths.
- **Resolution Options:** (1) Keep 3-4 items for initial NAV-01. (2) Implement overflow/"more" pattern. (3) Accept Rooms index + popup as room-routing paths and drop per-room nav items.
- **Agent Sources:** Agent 4 A2, F3.

### FL-030: Missing `hold_action` Support in Rooms Card
- **Status:** OPEN
- **Severity:** HIGH (blocks POP-01)
- **Category:** Feature Gap
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- **Current State:** `setConfig` (line 340) does not read `hold_action`. Long-press handler (lines 450-456) is hardcoded to `_toggleRoomGroup()`.
- **Intended State:** `hold_action` read from room config. Long-press handler checks `hold_action` first, falls back to toggle.
- **Exact Change:**
  1. Line 340: Add `hold_action: room.hold_action || null,`
  2. Lines 450-456: Replace timer callback to check `hold_action` before toggle
  3. Lines 459-474: Change tap default from navigate to toggle
- **Dependencies:** None.
- **Validation:** Hold triggers hold_action when configured; falls back to toggle when not configured.
- **Deploy Impact:** HA RESOURCE UPDATE.
- **Can Ship Independently:** Yes (pairs with POP-01 YAML changes).
- **Agent Sources:** Agent 2 SV-005, Agent 3 D1, Agent 4 C4.

### FL-031: Missing `fire-dom-event` in Action Handlers
- **Status:** OPEN
- **Severity:** MEDIUM (HIGH if popup-card approach adopted)
- **Category:** Feature Gap
- **Files:** `tunet_rooms_card.js` (L524-571), `tunet_status_card.js` (L857-892)
- **Current State:** Neither card's `_handleTapAction` handles `fire-dom-event`.
- **Intended State:** `fire-dom-event` case dispatches `ll-custom` CustomEvent with `composed: true`.
- **Exact Change:** Add 6-line block after call-service case in both cards.
- **Note:** NOT required for POP-01 if `call-service` mechanism is used instead. Becomes required only if `popup-card`/`fire-dom-event` approach is adopted later.
- **Dependencies:** None.
- **Validation:** `fire-dom-event` action dispatches correctly; Browser Mod receives event.
- **Deploy Impact:** HA RESOURCE UPDATE.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 2 SV-006, Agent 3 D1/D2.

### FL-032: Tap/Hold Interaction Inversion Required
- **Status:** OPEN
- **Severity:** HIGH (blocks POP-01)
- **Category:** Interaction Model
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (L442-503)
- **Current State:** Tap = navigate/popup (via tap_action or navigate_path). Hold = toggle lights.
- **Intended State:** Tap = toggle lights (default). Hold = popup (via hold_action).
- **Exact Change:**
  1. Lines 459-474: Change `onPointerUp` to default to `_toggleRoomGroup()` instead of navigate
  2. Lines 450-456: Change pressTimer to check `hold_action` before toggle
  3. Remove `navigate_path` fallback from tap handler
- **Dependencies:** FL-030 (hold_action support must exist first).
- **Validation:** Tap toggles room lights. Hold opens popup when hold_action configured.
- **Risk:** Interaction model inversion requires user re-learning. Ship on storage surface first for evaluation.
- **Deploy Impact:** HA RESOURCE UPDATE + YAML config changes.
- **Can Ship Independently:** Yes (pairs with FL-030).
- **Agent Sources:** Agent 2 SV-007, Agent 3 F4, Agent 4 A1.

### FL-033: No Hold-Feedback During 400ms Window
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** UX Polish
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- **Current State:** User sees `scale(0.95)` on press, then nothing for 400ms, then `scale(0.9)` pulse at popup fire.
- **Intended State:** Progressive visual feedback during hold (e.g., CSS transition that reaches visible threshold at 400ms).
- **Exact Change:** Add CSS transition on pointerdown: `transition: transform 0.4s ease` targeting a slightly deeper scale. Reset on pointerup/cancel.
- **Dependencies:** FL-032 (tap/hold inversion).
- **Validation:** Visible progressive feedback during hold gesture.
- **Can Ship Independently:** Yes (enhancement, not blocker).
- **Agent Sources:** Agent 4 A1, B2.

### FL-034: Keyboard Accessibility for hold_action
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Accessibility
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (L487-492)
- **Current State:** Enter/Space mapped only to tap handler. No keyboard path to hold_action.
- **Intended State:** Shift+Enter or visible affordance triggers hold_action.
- **Dependencies:** FL-030 (hold_action support).
- **Validation:** Keyboard-only user can trigger popup.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 4 A1 (edge case 3).

### FL-035: Nav Card Hardcoded to 3 Destinations
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Feature Gap
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- **Current State:** `_render()` generates exactly 3 buttons. Desktop rail CSS uses `repeat(3, 72px)`.
- **Intended State:** Dynamic nav items from config `items: [{label, icon, path}]` array.
- **Dependencies:** FL-029 (7-item viability must be validated first).
- **Validation:** Nav renders correct number of items from config. Active state works for all items.
- **Can Ship Independently:** Yes (part of NAV-01).
- **Agent Sources:** Agent 2 G6, Agent 3 D4, Agent 4 A2.

### FL-036: Storage Config Uses `size` Instead of `initial_style` for Popups
- **Status:** OPEN
- **Severity:** LOW-MEDIUM
- **Category:** API Hygiene
- **Files:** `Dashboard/Tunet/tunet-suite-storage-config.yaml` (lines 179, 257, 406)
- **Current State:** Uses `size: wide` and `size: normal` in Browser Mod popup config.
- **Intended State:** Uses `initial_style: wide` (Browser Mod 2.8.x preferred parameter).
- **Exact Change:** Replace `size:` with `initial_style:` in all 3 popup configurations.
- **Dependencies:** Verify Browser Mod 2.8.2 accepts both.
- **Validation:** Popups open at correct size after change.
- **Can Ship Independently:** Yes.

### FL-037: `navigate_path` Removal Creates Single Point of Failure
- **Status:** OPEN / DESIGN DECISION
- **Severity:** MEDIUM-HIGH
- **Category:** UX / Resilience
- **Files:** `tunet-suite-storage-config.yaml` (8 locations with `navigate_path`)
- **Current State:** 8 room entries across 2 views have `navigate_path` configured.
- **Plan Intention:** Remove `navigate_path`; nav bar becomes only direct path to room pages.
- **Risk:** If nav card fails to render, room pages become unreachable.
- **Resolution Options:** (1) Keep `navigate_path` as optional fallback, not as default tap behavior. (2) Add visible chevron/icon affordance on room tile for navigation. (3) Accept single point of failure and ensure nav reliability.
- **Agent Sources:** Agent 4 B1, F5.

### FL-038: Nav Card Duplicated 7 Times in Storage Config
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Maintainability
- **Files:** `tunet-suite-storage-config.yaml` (7 nav card config blocks)
- **Current State:** Identical nav card config copy-pasted into every view.
- **Intended State:** Either minimized config or native footer card placement (declared once).
- **Note:** Footer card investigation (FL-027 / SPIKE-01) may eliminate this entirely.
- **Agent Sources:** Agent 3 F7, Agent 4 G7.

### FL-039: Rooms Card `innerHTML` with Unsanitized Room Names
- **Status:** OPEN
- **Severity:** LOW
- **Category:** Security
- **Files:** `tunet_rooms_card.js` (L436)
- **Current State:** `roomCfg.name` interpolated directly into `innerHTML`.
- **Intended State:** Use `textContent` or escape HTML entities.
- **Note:** Risk is low since config comes from YAML, not runtime user input. `escapeHtml` is NOT currently in `tunet_base.js` despite memory claims.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 2 G4.

### FL-040: Lighting Card `grid-auto-rows: 124px` Fixed Height
- **Status:** OPEN
- **Severity:** MEDIUM
- **Category:** Sections Compliance
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` (L332)
- **Current State:** `grid-auto-rows: var(--grid-row, 124px)` creates fixed tile row height.
- **Intended State:** Default to `auto`; use fixed height only when `rows` config is explicitly set.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 3 A2/F10, Agent 4 E.

### FL-041: HA 2026.3 Light Attribute Deprecation
- **Status:** OPEN / AUDIT REQUIRED
- **Severity:** MEDIUM-HIGH
- **Category:** Breaking Change Preparation
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- **Current State:** Grep for `color_temp|kelvin|min_mireds|max_mireds` returns zero matches in `tunet_lighting_card.js`. No immediate breakage.
- **Intended State:** Confirmed clean. No references to deprecated attributes.
- **Resolution:** AUDIT COMPLETE -- no remediation needed for lighting card. Other cards (light-tile, sensor) should be spot-checked.
- **Agent Sources:** Agent 2 A9/G3, Agent 4 G6.
- **Note:** Severity downgraded from HIGH to MEDIUM-HIGH. The lighting card does not reference these attributes. The broader Tunet suite appears clean. OAL package may need separate audit.

### FL-042: Sensor Card `tunet-navigate` Dead Code
- **Status:** OPEN
- **Severity:** LOW
- **Category:** Dead Code
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` (L639-648)
- **Current State:** Dispatches `tunet-navigate` event, then immediately dispatches `hass-more-info`. No listener for `tunet-navigate` exists anywhere.
- **Intended State:** Remove dead `tunet-navigate` dispatch.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 3 B2/F8.

### FL-043: `columns: 'full'` String May Be Non-Standard API
- **Status:** OPEN / VERIFICATION
- **Severity:** LOW-MEDIUM
- **Category:** API Compliance
- **Files:** `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (L252)
- **Current State:** `getGridOptions()` returns `columns: 'full'`. HA API may expect a number.
- **Intended State:** Verify whether `'full'` is supported in HA 2026.3. If not, change to `columns: 12`.
- **Note:** If footer card approach is adopted (FL-027), this becomes moot.
- **Can Ship Independently:** Yes.
- **Agent Sources:** Agent 3 F1, Agent 4 G3.

### FL-044: `fireEvent` Utility Underused (9 Cards Manual Construction)
- **Status:** OPEN
- **Severity:** LOW
- **Category:** Code Consistency
- **Files:** All V2 cards; `tunet_base.js` (L726-732)
- **Current State:** `fireEvent()` exists in base but only `tunet-light-tile` uses it. 9 other cards manually construct `CustomEvent('hass-more-info')`.
- **Intended State:** All cards use `fireEvent` from base, or all use the shared `executeAction` adapter.
- **Note:** Low priority. Will be partially resolved by `executeAction` adapter (FL-012).
- **Agent Sources:** Agent 3 A9/B1/F3.

---

## Section 6: NEW USER-REPORTED BUGS (from Session Testing)

User stated "none fully bother me yet" -- all categorized as DEFERRED unless promoted.

### FL-045: Status Card Bug -- [To Be Cataloged]
- **Status:** DEFERRED
- **Severity:** LOW (user assessment)
- **Note:** 11 bugs were mentioned during user testing across status, lighting, and rooms cards. User stated none are blocking. Exact symptoms need to be captured from the session transcript if they are to be promoted. This ledger reserves FL-045 through FL-055 for those items once documented.

---

## Section 7: Superseded Assumptions (Unchanged from FIX_LEDGER.md)

### SA-001: Bubble/Hash Popup Path
- **Status:** SUPERSEDED
- **Replaced By:** Browser Mod preferred, one popup per room.

### SA-002: Home Layout Before Nav/Popup
- **Status:** SUPERSEDED
- **Replaced By:** Nav, Popup, UI/UX, Home Layout (locked order).

### SA-003: Implemented = Done
- **Status:** SUPERSEDED
- **Replaced By:** Repo state, live state, and product state tracked separately.

---

## Recommended Remediation Order (Corrected)

### Tier 0: Investigation (No Code Committed)
1. FL-027 (SPIKE-01: footer card investigation)

### Tier 1: Popup POC (POP-01)
2. FL-030 (add `hold_action` to rooms card setConfig)
3. FL-032 (swap tap/hold interaction model)
4. FL-031 (add `fire-dom-event` to action handlers -- optional for POC if using `call-service`)
5. Storage YAML config changes (move popup from `tap_action` to `hold_action`)

### Tier 2: Popup Scale-Out (POP-02)
6. Apply popup pattern to Kitchen, Dining, Bedroom rooms

### Tier 3: Nav Architecture (NAV-01)
7. FL-011 (resolve global DOM pollution -- approach depends on SPIKE-01)
8. FL-035 (configurable nav items -- scope depends on FL-029 resolution)
9. FL-038 (nav duplication -- may be resolved by footer card)

### Tier 4: Shared Infrastructure
10. FL-012 (shared `executeAction` adapter)
11. FL-044 (fireEvent consolidation)

### Tier 5: Polish and Cleanup
12. FL-015 (AL scan performance)
13. FL-033 (hold feedback)
14. FL-034 (keyboard accessibility for hold)
15. FL-036 (Browser Mod `size` vs `initial_style`)
16. FL-039 (innerHTML sanitization)
17. FL-040 (lighting card fixed row height)
18. FL-042 (sensor card dead code)
19. FL-043 (`columns: 'full'` verification)

### Deferred
- FL-005 (sensor card `value_attribute` -- needs deploy + verify)
- FL-013, FL-018, FL-019 (config editor work)
- FL-014 (speaker cache)
- FL-016, FL-017 (documentation cleanup)
- FL-020 (storage dashboard AQI)
- FL-021, FL-023, FL-024 (product direction decisions)
- FL-037 (navigate_path removal decision)
- FL-041 (light attribute deprecation -- audit shows no current impact)
- FL-045-055 (user-reported bugs, pending documentation)
