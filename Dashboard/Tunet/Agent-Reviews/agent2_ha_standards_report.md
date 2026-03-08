# Agent 2: HA Standards + Integration Researcher Report

Working branch: `claude/dashboard-nav-research-QnOBs`
HEAD: `98d961c`
Date: 2026-03-06
HA Version: 2026.3.0b1
Context: Validates the adopted plan in `Dashboard/Tunet/Docs/popup-fix.md` against modern Home Assistant truth.

---

## A. HA Fact Report

### A1. Sections Grid System

**FACT**: The Sections view uses a 12-column grid. Each cell is approximately 30px wide (section width / 12) and 56px tall, with 8px gaps between cells. Cards specify how many cells they occupy via `getGridOptions()`.

**FACT**: `getGridOptions()` accepts the following properties:

| Property | Default | Purpose |
|---|---|---|
| `columns` | 12 | Default number of columns the card occupies |
| `min_columns` | 1 | Minimum columns (user cannot shrink below) |
| `max_columns` | undefined | Maximum columns (user cannot grow beyond) |
| `rows` | undefined | Default number of rows the card occupies |
| `min_rows` | 1 | Minimum rows |
| `max_rows` | undefined | Maximum rows |

**FACT**: `columns: "full"` forces the card to span the entire section width regardless of section layout configuration. This is a special string value, not a number.

**FACT**: If `getGridOptions()` is not defined, cards default to 12 columns (full width) and ignore row constraints.

**FACT**: HA recommends using multiples of 3 (3, 6, 9, or 12) for default column values to ensure optimal appearance.

**FACT**: HA 2026.3 introduces **footer cards** in Sections view: "The sections view now supports footer cards, giving you a sticky card at the bottom of the viewport, similar to the existing view header." This is directly relevant to the nav card architecture.

**REPO IMPLICATION**: The adopted plan's `getGridOptions()` policy ("no hard `max_columns` caps by default") is partially correct. Cards should avoid arbitrary `max_columns: 12` when they could work at smaller widths. However, the current codebase universally sets `max_columns: 12` on every card, which means none of them constrain their maximum width -- this is functionally the same as not setting it at all, since 12 is the grid maximum.

### A2. When to Omit Rows

**FACT**: `rows` in `getGridOptions()` defines the default number of *56px-tall* grid cells the card occupies vertically. When omitted, the card height is determined by its content (intrinsic sizing).

**FACT**: `min_rows` defaults to 1. When neither `rows` nor `max_rows` is set, the card can grow vertically without limit.

**INFERENCE**: Omitting `rows` is correct for content-driven cards (status, rooms, lighting) where the height depends on how many tiles/entities are configured. Setting `rows` is appropriate only for cards with a known fixed layout (e.g., a nav bar that is always exactly 64px).

**REPO IMPLICATION**: All Tunet cards currently omit `rows` from `getGridOptions()`. This is correct for content cards. For the nav card specifically, since it uses `position: fixed` and renders outside the normal flow, the rows value is irrelevant to visual layout but still affects the grid space the card's placeholder occupies. The nav card should set `rows: 1` and `max_rows: 1` to minimize its grid footprint since its visual content is positioned outside the flow.

### A3. columns: "full" Policy

**FACT**: `columns: "full"` makes a card span the entire section width unconditionally.

**INFERENCE**: `columns: "full"` is appropriate for:
- Chrome/navigation cards that must span the viewport
- Full-width hero surfaces
- Cards that would look broken at partial widths

**INFERENCE**: `columns: "full"` is NOT appropriate for:
- Content cards that work well at 6 or 9 columns alongside other cards
- Cards that should participate in side-by-side layouts

**REPO IMPLICATION**: Currently only `tunet-nav-card` uses `columns: "full"`. This is correct for a fixed-position nav chrome element. No other card should use `"full"` unless it is explicitly a full-width chrome surface.

### A4. Navigation API

**FACT**: The HA frontend's official `navigate()` function (from `src/common/navigate.ts`) uses:
```typescript
mainWindow.history.pushState(options?.data ?? null, "", path);
fireEvent(mainWindow, "location-changed", { replace });
```

**FACT**: The `navigate` action type is one of HA's six standard dashboard actions: `more-info`, `toggle`, `perform-action`, `navigate`, `url`, `assist`, `none`. The `navigate` action uses `navigation_path` for the destination and supports `navigation_replace` to control history behavior.

**FACT**: HA's own navigate function does `history.pushState` + `fireEvent(window, 'location-changed')`. The Tunet cards' current implementation (`history.pushState(null, '', path); window.dispatchEvent(new Event('location-changed'))`) is functionally identical to what HA does internally, minus the `replace` option and the `data` parameter support.

**REPO IMPLICATION**: FL-012 classifies the `history.pushState` + `location-changed` pattern as "brittle." This assessment requires nuancing. The pattern itself is exactly what HA does internally. What makes it fragile in Tunet cards is:
1. It is duplicated across 3 cards instead of centralized
2. It lacks the `replace` option
3. It lacks the `data` parameter
4. It does not call `ensureDialogsClosed()` like the official function does (which closes open dialogs before navigating)

The adopted plan's shared action adapter addresses points 1-3 correctly. Point 4 (dialog closing) should be added to the INT-01 implementation.

### A5. fire-dom-event and ll-custom

**FACT**: `fire-dom-event` is NOT one of HA's officially documented action types. The six official actions are: `more-info`, `toggle`, `perform-action`, `navigate`, `url`, `assist`, `none`.

**FACT**: `fire-dom-event` is a *convention* used by Browser Mod and other HACS integrations. It works by dispatching a `CustomEvent` named `ll-custom` with `bubbles: true` and `composed: true`.

**FACT**: `composed: true` on a CustomEvent means the event will cross shadow DOM boundaries and bubble up through the document. This is critical for Browser Mod to receive the event regardless of how deeply nested the dispatching card is in shadow DOM.

**INFERENCE**: The adopted plan's `fire-dom-event` implementation dispatching `ll-custom` with `composed: true` will work correctly from within a custom card's shadow DOM. Browser Mod listens for `ll-custom` events at the document level. The `composed: true` flag ensures the event reaches the document root.

**REPO IMPLICATION**: The popup-fix.md implementation snippet is architecturally correct:
```javascript
this.dispatchEvent(new CustomEvent('ll-custom', {
  bubbles: true,
  composed: true,
  detail: actionConfig,
}));
```

### A6. Browser Mod Popup Mechanism

**FACT**: Browser Mod v2.8.2 (released 2026-03-06) is the current version. It supports two popup mechanisms:
1. **Service call**: `browser_mod.popup` service with `title`, `content`, `size`/`initial_style`, `dismissable`, and `popup_styles` parameters.
2. **Popup card**: `custom:popup-card` with `popup_card_id` that can replace more-info dialogs or serve as templates for the popup service.

**FACT**: The migration from Browser Mod 1.x to 2.x changed the fire-dom-event format from `command: popup` to `service: browser_mod.popup`.

**INFERENCE**: The adopted plan uses TWO different popup mechanisms in different places:
- POP-01/POP-02 YAML snippets use `custom:popup-card` with `popup_card_id`
- The room config uses `fire-dom-event` with `browser_mod.service: browser_mod.popup`

These are two different approaches. The `popup_card_id` approach requires a hidden card definition in the dashboard. The service call approach does not require a hidden card but embeds the popup content in the room config. The plan should pick ONE approach and be consistent.

**REPO IMPLICATION**: The current storage config (`tunet-suite-storage-config.yaml`) already uses `action: call-service` with `service: browser_mod.popup` (not fire-dom-event). The adopted plan proposes switching to `fire-dom-event` + hidden `popup-card` definitions, which is a different architecture than what's currently deployed. This is not wrong, but it is a meaningful migration.

### A7. Storage vs YAML Dashboards

**FACT**: Storage dashboards are stored in the HA backend database and edited through the UI. YAML dashboards are loaded from files and require manual editing.

**FACT**: There is no official "hybrid" dashboard mode. Once a storage dashboard exists, it is either UI-edited or "taken control" of (which converts it to manual YAML editing within the UI editor).

**FACT**: Sections layout works in both storage and YAML modes.

**FACT**: HA 2026.2 made the "Home Dashboard" the official default, suggesting Sections is the primary layout going forward.

**FACT**: YAML dashboard resources must be registered in `configuration.yaml`. Storage dashboard resources are managed through the UI (Settings > Dashboards > Resources).

**REPO IMPLICATION**: The project uses both surfaces:
- `tunet-suite` (YAML) as the repo-controlled architecture surface
- `tunet-suite-storage` (storage) as the primary evaluation surface

This dual-surface model is operationally valid but requires explicit sync discipline. The adopted plan's CP-01 tranche correctly identifies this as a governance requirement.

### A8. getConfigForm() and Config Editors

**FACT**: `getConfigForm()` is a static method that returns a schema object with `schema`, `computeLabel`, `computeHelper`, and `assertConfig` properties.

**FACT**: Supported schema field types include: `text`, `boolean`, `number`, `select`, `entity`, `icon`, `attribute`, `theme`, and `label` selectors. Grid layouts (`type: "grid"`) and expandable panels (`type: "expandable"`) are also supported.

**FACT**: `object` selector exists but is designed for flat key-value objects, not for arrays of complex objects (like rooms with nested lights arrays, or tiles with nested config).

**FACT**: `getConfigElement()` is the alternative approach that returns a full custom HTMLElement for the editor, supporting arbitrary complexity.

**INFERENCE**: For cards with simple scalar configs (nav, weather, climate, actions), `getConfigForm()` works well. For cards with complex nested arrays (rooms, lighting zones, status tiles, sensor rows), `getConfigForm()` cannot provide a useful editing experience. The `object` selector will render a flat JSON editor, which is worse than YAML.

**REPO IMPLICATION**: FL-013 correctly identifies that `subview_paths` as `object` selector is wrong (it is an array of strings, not an object). FL-018 correctly identifies the broader config editor reality gap. The adopted plan should accept that rooms, lighting, status, and sensor cards are YAML-first for their complex fields.

### A9. HA 2026.3 Breaking Changes

**FACT**: HA 2026.3 removes `color_temp`, `kelvin`, `min_mireds`, and `max_mireds` light entity attributes. Users must migrate to `color_temp_kelvin`, `min_color_temp_kelvin`, and `max_color_temp_kelvin`.

**INFERENCE**: This could affect the lighting card if it reads color temperature attributes directly. The lighting card's drag-to-dim interaction uses brightness, not color temp, so the impact is likely limited. However, any tooltip or display showing color temperature should be audited.

**REPO IMPLICATION**: Audit `tunet_lighting_card.js` for any references to deprecated light attributes (`color_temp`, `kelvin`, `min_mireds`, `max_mireds`).

### A10. Footer Cards in Sections (2026.3)

**FACT**: HA 2026.3 adds native footer card support to Sections view. Footer cards are "sticky at the bottom of the viewport."

**INFERENCE**: This is the exact behavior that `tunet-nav-card` currently achieves through `position: fixed` + global offset injection. The native footer card mechanism could potentially replace the custom positioning approach, eliminating FL-011 (global offset side effects) entirely.

**REPO IMPLICATION**: This is a significant architectural option that the adopted plan does not account for. NAV-01 should investigate whether `tunet-nav-card` can be deployed as a Sections footer card instead of using `position: fixed` + global offsets. If viable, this would:
- Eliminate global `hui-view` margin injection (FL-011)
- Make the nav card participate in the normal Sections flow
- Reduce cross-dashboard side effects to zero
- Align with HA's intended extension point

---

## B. Standards Violations

### SV-001: Global DOM Pollution from Nav Card

| Field | Value |
|---|---|
| **Standard** | Custom cards should not modify elements outside their own shadow DOM or card boundary |
| **File** | `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` lines 143-156, 258-260, 303-308 |
| **Violation** | `ensureGlobalOffsetsStyle()` injects a `<style>` into `document.head` targeting `hui-view`. `_applyOffsets()` sets CSS custom properties on `document.documentElement`. |
| **Impact** | Affects all dashboards on the same HA instance. If user navigates to a non-Tunet dashboard, leftover offsets may persist (the `disconnectedCallback` cleanup depends on `window.__tunetNavCardCount` reaching 0). |
| **Remediation** | (1) Investigate HA 2026.3 footer card as a replacement for fixed positioning. (2) If fixed positioning is kept, scope the offset style to a Tunet-specific selector or route guard. (3) Add route-awareness: only apply offsets when `location.pathname` starts with the Tunet dashboard path. |
| **Linked Findings** | FL-011 |
| **Severity** | HIGH |

### SV-002: Navigation via Direct History Manipulation

| Field | Value |
|---|---|
| **Standard** | Cards should use HA's navigate pattern consistently |
| **Files** | `tunet_nav_card.js:331-334`, `tunet_rooms_card.js:466-467, 545-546`, `tunet_status_card.js:870-872` |
| **Violation** | Three cards independently implement `history.pushState()` + `window.dispatchEvent(new Event('location-changed'))`. While functionally equivalent to HA's `navigate()`, the implementation misses `ensureDialogsClosed()` (HA's navigate closes open dialogs before routing) and the `replace`/`data` parameters. |
| **Impact** | Open more-info dialogs or Browser Mod popups may persist during navigation. No `replace` mode means every tap creates a new history entry. |
| **Remediation** | Centralize into the shared action adapter (INT-01). Add dialog-closing behavior: dispatch `'dialog-closed'` or check for open dialogs before navigating. Support `replace` mode. |
| **Linked Findings** | FL-012 |
| **Severity** | HIGH |

### SV-003: Adaptive Lighting Switch Full-Registry Scan

| Field | Value |
|---|---|
| **Standard** | Cards should minimize state iteration; watch only relevant entities |
| **Files** | `tunet_rooms_card.js:375-378, 604-612`, `tunet_lighting_card.js:862-863` |
| **Violation** | `_entitiesChanged()` and `_updateAll()` iterate `Object.keys(hass.states)` to find `switch.adaptive_lighting_*` entities. This runs on every `hass` setter call. |
| **Impact** | Performance degradation proportional to total entity count. Acceptable on small installs, problematic on larger ones. |
| **Remediation** | Cache the set of AL switch entity IDs once (e.g., on first `hass` set or when AL switch count changes). Reuse the cached set in change detection and update loops. |
| **Linked Findings** | FL-015 |
| **Severity** | MEDIUM |

### SV-004: Config Editor Schema Mismatch (rooms, status tiles, lighting zones)

| Field | Value |
|---|---|
| **Standard** | `getConfigForm()` schema must accurately represent the config shape |
| **Files** | `tunet_rooms_card.js:294-307` (`rooms` as `object`), `tunet_nav_card.js:187-189` (`subview_paths` as `object`), `tunet_status_card.js:456-481` (no `tiles` in schema), `tunet_lighting_card.js:672+` (no `zones` in schema) |
| **Violation** | Complex array fields are either exposed as `object` selector (renders as flat JSON, not as a useful list editor) or omitted from the schema entirely. This creates a misleading visual editor experience. |
| **Impact** | Users who try the visual editor for these cards will get a broken or incomplete editing experience. Some fields will be silently dropped if the form does not include them. |
| **Remediation** | For cards with complex nested arrays, either: (a) Explicitly exclude array fields from the schema and document them as YAML-only, or (b) Implement `getConfigElement()` with a proper list editor. Option (a) is the pragmatic path. The `getConfigForm()` should only expose fields that the visual editor can handle correctly (name, tile_size, columns, surface, layout). |
| **Linked Findings** | FL-013, FL-018 |
| **Severity** | MEDIUM |

### SV-005: Missing hold_action Support in Rooms Card

| Field | Value |
|---|---|
| **Standard** | Card config schema should support the interaction model defined in the control docs |
| **File** | `tunet_rooms_card.js:329-352` (setConfig), lines 442-503 (interaction handlers) |
| **Violation** | The adopted plan defines `hold_action` as a room-level config property for opening Browser Mod popups, but the current rooms card code does not read `hold_action` from config. The current long-press behavior is hardcoded to `_toggleRoomGroup()`. |
| **Impact** | The popup-fix.md plan cannot be implemented without code changes to the rooms card. |
| **Remediation** | Implement the exact changes described in popup-fix.md section 5 (POP-01): read `hold_action` in `setConfig`, check it in the long-press handler, fall back to `_toggleRoomGroup()` if not defined. |
| **Linked Findings** | INT-01, POP-01 |
| **Severity** | HIGH (blocks popup implementation) |

### SV-006: Missing fire-dom-event Support in Action Handlers

| Field | Value |
|---|---|
| **Standard** | Action handlers should support the `fire-dom-event` action type for Browser Mod integration |
| **Files** | `tunet_rooms_card.js:524-571` (`_handleTapAction`), `tunet_status_card.js:857-892` (`_handleTapAction`) |
| **Violation** | Neither card's `_handleTapAction` method handles the `fire-dom-event` action type. The popup plan requires this action type to trigger Browser Mod popups. |
| **Impact** | Browser Mod popup integration cannot work until this action type is supported. |
| **Remediation** | Add `fire-dom-event` case to all card action handlers as described in popup-fix.md, or centralize via the shared action adapter (INT-01). |
| **Linked Findings** | INT-01, POP-01 |
| **Severity** | HIGH (blocks popup implementation) |

### SV-007: Inconsistent Tap/Hold Interaction Model

| Field | Value |
|---|---|
| **Standard** | The adopted interaction contract defines tap=toggle, hold=popup for room tiles |
| **File** | `tunet_rooms_card.js:442-503` |
| **Violation** | Current behavior is inverted relative to the adopted plan: tap navigates (or fires tap_action), hold toggles lights. The plan wants tap=toggle, hold=popup. The code change requires swapping the timer callback and the pointer-up handler logic. |
| **Impact** | Until corrected, room tile interaction does not match the locked interaction contract. |
| **Remediation** | Implement the interaction swap as described in popup-fix.md: move toggle to tap (pointer-up default), move popup/hold_action to the 400ms timer. |
| **Linked Findings** | INT-01 |
| **Severity** | HIGH |

---

## C. Card Policy Table

| Card | Sections-Native? | `columns` | `min_columns` | `max_columns` | `rows` | Config Editor | Notes |
|---|---|---|---|---|---|---|---|
| `tunet-nav-card` | Partial | `"full"` | 12 | 12 | omitted | Simple scalar OK | Fixed-position renders outside flow. Consider HA 2026.3 footer card. Should set `rows: 1, max_rows: 1` to minimize grid footprint. |
| `tunet-rooms-card` | Yes | 12 | 6 | 12 | omitted (correct) | `rooms` as `object` is BROKEN; must be YAML-only | Complex nested array; remove `rooms` from schema |
| `tunet-status-card` | Yes | 12 | 6 | 12 | omitted (correct) | `tiles` not in schema (correct) | Columns/name/tile_size work in editor |
| `tunet-lighting-card` | Yes | 12 | 6 | 12 | omitted (correct) | `zones` not in schema (correct) | Internal `rows` config limits visible tiles -- separate from grid rows |
| `tunet-speaker-grid-card` | Yes | 12 | 6 | 12 | omitted (correct) | Complex nested; YAML-first | OK as-is |
| `tunet-climate-card` | Yes | 6 | 3 | 12 | omitted (correct) | Full schema works | Gold standard; `columns: 6` allows side-by-side |
| `tunet-weather-card` | Yes | 6 | 3 | 12 | omitted (correct) | Full schema works | Good companion at `columns: 6` |
| `tunet-actions-card` | Yes | 12 | 6 | 12 | omitted (correct) | YAML-first for actions array | Simple header fields OK |
| `tunet-media-card` | Yes | 12 | 6 | 12 | omitted (correct) | YAML-first for complex fields | OK |
| `tunet-sonos-card` | Yes | 12 | 6 | 12 | omitted (correct) | YAML-first for complex fields | OK |
| `tunet-sensor-card` | Yes | 12 | 6 | 12 | omitted (correct) | YAML-first for sensors array | OK |
| `tunet-light-tile` | Yes | 3 | 3 | 12 | omitted (correct) | Simple scalar OK | Individual tile; `columns: 3` is good |

**Policy Summary:**
- All cards correctly omit `rows` from `getGridOptions()` (intrinsic height).
- Most content cards use `columns: 12, min_columns: 6, max_columns: 12` which means they default to full section width but can be manually resized down to half.
- Climate and weather use `columns: 6` which is better for side-by-side layouts.
- Nav card is the only card using `columns: "full"` which is correct for chrome.
- No card uses `min_rows` or `max_rows` -- this is correct for the adopted "flexible by default" policy.

---

## D. Storage/YAML Recommendation

### Recommendation: YAML-primary for architecture, storage-primary for daily evaluation

**Rationale:**

1. **YAML for architecture** (`tunet-suite`):
   - Version-controlled, branch-reviewable
   - Canonical entity inventory
   - Safe deployment baseline
   - Required for Sections layout features like subviews with `back_path`
   - Required for `custom:popup-card` hidden card definitions (if that approach is used)

2. **Storage for evaluation** (`tunet-suite-storage`):
   - Fastest iteration for UX judgment
   - UI-editable for card repositioning and section resizing
   - Better for testing popup service calls (Browser Mod's `call-service` approach works without hidden card definitions)
   - More forgiving of experimental changes

3. **No hybrid mode exists** in HA. The "take control" option in storage dashboards converts to manual YAML editing within the UI editor, which is not the same as a true hybrid.

4. **Sync discipline is required**: Changes validated on the storage surface must be manually ported to the YAML surface. The CP-01 tranche correctly identifies this as a governance requirement.

**Specific recommendation for popup architecture:**
- If using `custom:popup-card` with `popup_card_id` (hidden card approach): YAML is required because hidden cards must be defined somewhere in the dashboard config.
- If using `browser_mod.popup` service call (inline content approach): Either surface works because the popup content is embedded in the room config, not in a separate hidden card.

The adopted plan's YAML snippets use `custom:popup-card` with `popup_card_id`, but the room config uses `fire-dom-event` targeting `browser_mod.popup`. This is an inconsistency -- see Section E.

---

## E. Browser Mod + Popup-Card Validation

### E1. Architecture Inconsistency in Adopted Plan

The adopted plan (`popup-fix.md`) describes **two different popup mechanisms** that need to be reconciled:

**Mechanism A (Sections 5, 7 -- hidden popup-card definitions):**
```yaml
- type: custom:popup-card
  popup_card_id: living-room-popup
  popup_card_all_views: true
  card:
    type: custom:tunet-lighting-card
    # ...
```

**Mechanism B (Section 5 -- room hold_action config):**
```yaml
hold_action:
  action: fire-dom-event
  browser_mod:
    service: browser_mod.popup
    data:
      popup_card_id: living-room-popup
```

**Issue**: Mechanism A requires `custom:popup-card` HACS component to be installed. Mechanism B with `popup_card_id` references a popup-card definition, meaning both are needed together. However, the `popup_card_id` in the `fire-dom-event` payload is a Browser Mod feature that references popup-card definitions.

**Versus the current storage config** which uses a simpler approach:
```yaml
tap_action:
  action: call-service
  service: browser_mod.popup
  service_data:
    title: Living Room
    content:
      type: vertical-stack
      cards: [...]
```

### E2. Validation of Browser Mod Popup Approach

| Criterion | Status | Notes |
|---|---|---|
| Browser Mod v2.8.2 supports popup service | VALID | Latest release (2026-03-06) confirms active maintenance |
| `browser_mod.popup` service works from custom card | VALID | Service calls work from any context with `hass.callService()` |
| `fire-dom-event` dispatches `ll-custom` with `composed: true` | VALID | Events cross shadow DOM boundaries |
| `popup_card_id` references hidden popup-card definitions | NEEDS VERIFICATION | Requires `custom:popup-card` HACS component; availability must be confirmed |
| `popup_card_all_views: true` makes popup available on all views | NEEDS VERIFICATION | This is a popup-card feature, not a Browser Mod feature |
| Popup styling with `initial_style: wide` | VALID | Browser Mod supports `initial_style` parameter |
| Popups work in Sections layout | LIKELY VALID | No known incompatibility, but Sections footer cards (2026.3) may need testing |

### E3. Recommendation

**Pick one approach and be consistent:**

- **Option 1: `browser_mod.popup` service call with inline content** (simpler)
  - No hidden card definitions needed
  - Works on both YAML and storage surfaces
  - Popup content is co-located with the room config
  - Already proven in the current storage config
  - Downside: popup content definition duplicated in room config rather than centralized

- **Option 2: `custom:popup-card` with `popup_card_id` + `fire-dom-event`** (more structured)
  - Popup content defined once in hidden cards
  - Room config only references the popup ID
  - Better separation of concerns
  - Requires `custom:popup-card` HACS component
  - More complex setup; hidden cards may consume layout space in Sections

**My recommendation**: Option 1 is safer and already proven. The storage config demonstrates it works. Option 2 introduces an additional HACS dependency (`custom:popup-card`) whose Sections compatibility is unverified. If the project later needs Option 2's separation of concerns, it can be migrated without changing the interaction model.

If Option 2 is chosen, validate that hidden `custom:popup-card` definitions do not consume visible layout space in Sections view. The adopted plan's known risks section mentions this (PR #747) but does not have a resolution.

---

## F. Interaction Model Validation

### F1. Tap = Toggle, Hold = Popup

| Criterion | Status | Notes |
|---|---|---|
| Tap to toggle room lights | ARCHITECTURALLY SOUND | `_toggleRoomGroup()` already exists; just needs to be the tap handler instead of the hold handler |
| Hold (>=400ms) to open popup | ARCHITECTURALLY SOUND | Timer-based long press pattern is proven |
| `fire-dom-event` from shadow DOM | VALID | `composed: true` ensures event crosses shadow boundaries |
| No accidental navigation from room gestures | VALID if navigate_path removed | Current code has `navigate_path` fallback in tap handler; must be removed per plan |
| Browser Mod receives `ll-custom` event | VALID | Browser Mod listens on document; composed events reach it |

### F2. Event Propagation Path

For a room tile in `tunet-rooms-card`:
1. User holds tile >= 400ms
2. Timer fires, calls `_handleTapAction(roomCfg.hold_action, roomCfg)`
3. Action handler hits `fire-dom-event` case
4. Card dispatches `new CustomEvent('ll-custom', { bubbles: true, composed: true, detail: actionConfig })`
5. Event path: `tunet-rooms-card` shadow root -> `tunet-rooms-card` host element -> parent card container -> `hui-card` -> section container -> `hui-view` -> `home-assistant` -> `document`
6. Browser Mod's event listener on `document` (or wherever it listens) receives the event
7. Browser Mod reads `detail.browser_mod.service` and calls `browser_mod.popup`

**This propagation path is valid.** The key requirement is `composed: true`, which is correctly specified in the plan.

### F3. Edge Cases to Handle

1. **Pointer cancel during hold**: The current `pointercancel`/`pointerleave` handlers clear the timer. This must be preserved.
2. **Scroll during hold**: On mobile, the pointer may move enough to trigger scroll, which should cancel the hold. The current `pointerleave` handler covers this.
3. **Keyboard accessibility**: The current `keydown` handler only maps Enter/Space to tap (pointer-up). There is no keyboard equivalent for hold/popup. Consider adding Shift+Enter or a dedicated keyboard shortcut.
4. **Context menu suppression**: The current `contextmenu` handler prevents the browser context menu on long press. This must remain.
5. **Dialog closing before popup**: If a more-info dialog is open when the user holds a room tile, the popup should close the existing dialog first. The shared action adapter should handle this.

### F4. Current vs Target Interaction Matrix

| Surface | Current Tap | Current Hold | Target Tap | Target Hold |
|---|---|---|---|---|
| Room tile | Navigate / tap_action | Toggle lights | Toggle lights | Open popup |
| Light tile | Toggle light | N/A | Toggle light (no change) | More-info (no change) |
| Nav item | Navigate | N/A | Navigate (no change) | N/A |

The interaction swap for room tiles is the primary change. It requires:
1. Moving `_toggleRoomGroup()` from the hold timer to the tap handler (pointer-up)
2. Moving tap_action/navigate_path to hold_action or removing them
3. Adding `hold_action` config field
4. Adding `fire-dom-event` support to `_handleTapAction`

---

## G. NEW DISCOVERIES

### G1. HA 2026.3 Footer Cards -- Potential Nav Architecture Replacement

**Discovery**: HA 2026.3 adds native footer card support to Sections view. This is a first-class extension point for sticky bottom content, which is exactly what `tunet-nav-card` currently implements via `position: fixed` + global offset injection.

**Impact**: If the nav card can be deployed as a Sections footer card:
- FL-011 (global offset side effects) becomes moot
- No more `ensureGlobalOffsetsStyle()` or `document.documentElement.style.setProperty()`
- The nav card participates in the normal Sections layout flow
- Zero cross-dashboard side effects
- The `position: fixed` CSS becomes unnecessary for mobile mode

**Recommended Action**: Before implementing NAV-01, test whether `tunet-nav-card` works as a Sections footer card in HA 2026.3. If yes, this fundamentally simplifies the nav architecture. The card would still need its desktop side-rail behavior, but the mobile bottom dock could use native footer card positioning.

**Risk**: Footer cards may not support the desktop side-rail pattern. The nav card may need to remain `position: fixed` for desktop while using footer card positioning for mobile. This dual mode is more complex but eliminates the global offset problem.

### G2. Adopted Plan Has Two Incompatible Popup Architectures

**Discovery**: The popup-fix.md defines hidden `custom:popup-card` definitions (popup_card_id approach) in Sections 5 and 7, but the room config uses `fire-dom-event` targeting `browser_mod.popup`. These are different systems:
- `custom:popup-card` is a separate HACS component
- `browser_mod.popup` is a Browser Mod service

The `popup_card_id` in the fire-dom-event payload suggests the plan intends to use popup-card definitions as templates for Browser Mod, but this requires both HACS components to be installed and correctly interoperating.

**Recommended Action**: Simplify to a single mechanism. The `browser_mod.popup` service call with inline content (already proven in the storage config) is the lower-risk path. Defer `custom:popup-card` evaluation to a future tranche.

### G3. Light Entity Attribute Deprecation in HA 2026.3

**Discovery**: HA 2026.3 removes `color_temp`, `kelvin`, `min_mireds`, and `max_mireds` light entity attributes. The replacements are `color_temp_kelvin`, `min_color_temp_kelvin`, and `max_color_temp_kelvin`.

**Impact**: Any Tunet card that reads these deprecated attributes will break. The lighting card is the primary concern.

**Recommended Action**: Audit `tunet_lighting_card.js` for references to deprecated attributes. If found, add a migration to read the new `*_kelvin` attributes with fallback to the deprecated ones during transition.

### G4. Rooms Card Uses innerHTML with Unsanitized Room Names

**Discovery**: `tunet_rooms_card.js` line 436:
```javascript
tile.innerHTML = `
  <div class="room-tile-dot"></div>
  <div class="room-tile-icon">
    <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
  </div>
  <span class="room-tile-name">${roomCfg.name}</span>
  ...
`;
```

`roomCfg.name` is interpolated directly into innerHTML without escaping. While the risk is low (config comes from YAML, not user input at runtime), this is an XSS vector if config is ever sourced from untrusted input (e.g., a community config share, a future import feature).

**Recommended Action**: Use `textContent` assignment instead of innerHTML for user-provided text, or escape HTML entities in `roomCfg.name`. The `tunet_base.js` module does not currently export an `escapeHtml` helper, though the CLAUDE.md mentions `TunetCardFoundation.escapeHtml` as a pattern -- this may be from an older version or planned but not yet implemented.

### G5. Status Card `statusEl.innerHTML` with Parts Array

**Discovery**: `tunet_rooms_card.js` line 627:
```javascript
ref.statusEl.innerHTML = parts.join(' · ');
```

The `parts` array contains HTML spans with entity-derived values (temperature, count). While these values come from HA state (numeric), a malformed entity state could theoretically inject HTML.

**Recommended Action**: Low priority, but consider using DOM APIs instead of innerHTML for status line construction.

### G6. Nav Card Hard-Codes 3 Destinations

**Discovery**: The nav card renders exactly 3 buttons (Home, Rooms, Media) in its `_render()` method. The adopted plan specifies 7 destinations. The card has no mechanism to dynamically render nav items from config.

**Recommended Action**: NAV-01 must add configurable nav items (`items: [{label, icon, path}]`) as specified in popup-fix.md Section 6. The current `home_path`/`rooms_path`/`media_path` config pattern cannot scale to 7 destinations.

### G7. Desktop Rail Grid Assumes 3 Items

**Discovery**: The desktop rail CSS uses `grid-template-rows: repeat(3, 72px)` (line 135). When NAV-01 adds more items, this must become dynamic (`repeat(N, 72px)` where N is the item count), or use `auto-fit`.

### G8. `configurable` Static Getter Has No HA Documentation

**Discovery**: Several cards define `static get configurable() { return true; }`. This property is not documented in HA's custom card API. It may be a Browser Mod or community convention, but it is not an official HA requirement.

**Recommended Action**: Low priority. Investigate whether any HACS tool or HA version actually reads this property. If not, it can be removed to reduce confusion.

---

## Summary of Critical Findings

| # | Finding | Severity | Blocks |
|---|---|---|---|
| G1 | HA 2026.3 footer cards could replace nav card fixed positioning | HIGH (opportunity) | NAV-01 architecture decision |
| G2 | Plan has two incompatible popup architectures | HIGH | POP-01 implementation |
| SV-001 | Nav card global DOM pollution | HIGH | NAV-01, FL-011 |
| SV-002 | Duplicated navigate pattern missing dialog close | HIGH | INT-01, FL-012 |
| SV-005 | Missing hold_action in rooms card | HIGH | POP-01 |
| SV-006 | Missing fire-dom-event in action handlers | HIGH | POP-01 |
| SV-007 | Tap/hold interaction model inverted vs plan | HIGH | INT-01 |
| G3 | HA 2026.3 light attribute deprecation | MEDIUM | Lighting card audit |
| G6 | Nav card hardcoded to 3 items vs 7 in plan | MEDIUM | NAV-01 |
| SV-003 | AL switch full-registry scan | MEDIUM | FL-015 |
| SV-004 | Config editor schema mismatch | MEDIUM | FL-013, FL-018 |
