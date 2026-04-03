# Agent 3: Codebase Mapper + Key Function Reviewer

**Date:** 2026-03-06
**Agent role:** Codebase Mapper + Key Function Reviewer (Agent 3 of 4)
**Branch:** `claude/dashboard-nav-research-QnOBs`
**HEAD:** `98d961c`
**Plan:** `Dashboard/Tunet/Docs/popup-fix.md` (decision-locked 2026-03-06)

---

## BRANCH_AND_HEAD

```
Branch: claude/dashboard-nav-research-QnOBs
HEAD:   98d961c
```

---

## A. Code Map (by topic)

### A1. Sections Sizing (`getGridOptions` + `getCardSize`)

| Card | File | `getGridOptions()` line | Return value | `getCardSize()` line | Return value |
|------|------|------------------------|--------------|---------------------|--------------|
| tunet-nav-card | tunet_nav_card.js | L250-256 | `{columns:'full', min_columns:12, max_columns:12}` | L246-248 | `1` |
| tunet-rooms-card | tunet_rooms_card.js | L389-395 | `{columns:12, min_columns:6, max_columns:12}` | L381-386 | `max(2, ceil(rooms/4)+1)` |
| tunet-lighting-card | tunet_lighting_card.js | L878-884 | `{columns:12, min_columns:6, max_columns:12}` | L868-875 | dynamic based on layout/rows |
| tunet-light-tile | tunet_light_tile.js | L424-430 | `{columns:3, min_columns:3, max_columns:12}` | L419-421 | `1` (horiz) / `2` (vert) |
| tunet-status-card | tunet_status_card.js | L590-596 | `{columns:12, min_columns:6, max_columns:12}` | L585-588 | `max(2, ceil(tiles/cols)+1)` |
| tunet-actions-card | tunet_actions_card.js | L353-359 | `{columns:12, min_columns:6, max_columns:12}` | L345-350 | `2` (compact) / `1+ceil(actions/4)` |
| tunet-climate-card | tunet_climate_card.js | L739-745 | `{columns:6, min_columns:3, max_columns:12}` | L734-736 | `4` |
| tunet-sensor-card | tunet_sensor_card.js | L513-519 | `{columns:12, min_columns:6, max_columns:12}` | L508-510 | `1+sensors.length` |
| tunet-media-card | tunet_media_card.js | L618-624 | `{columns:12, min_columns:6, max_columns:12}` | L613-615 | `3` |
| tunet-speaker-grid-card | tunet_speaker_grid_card.js | L579-585 | `{columns:12, min_columns:6, max_columns:12}` | L571-576 | `1+ceil(speakers/cols)` |
| tunet-weather-card | tunet_weather_card.js | L240-246 | `{columns:6, min_columns:3, max_columns:12}` | L234-237 | `5` (forecast) / `3` |
| tunet-sonos-card | tunet_sonos_card.js | L705-711 | `{columns:12, min_columns:6, max_columns:12}` | L702 | `3` |

**Hard cap analysis (`max_columns:12` = full-width cap):**

- 10 of 12 cards set `max_columns: 12` -- this is the Sections default full-width and does NOT restrict column span. Not a cap issue.
- `tunet-nav-card` uses `columns: 'full'` which is non-standard HA API -- Sections expects a number. This may cause layout issues.
- `tunet-light-tile` is the only card with a low `min_columns: 3`, which is appropriate for an atomic tile.
- `tunet-climate-card` and `tunet-weather-card` both use `columns: 6, min_columns: 3` -- these are correctly sized to be half-width or smaller.

**Conclusion:** No hard `max_columns` caps that need removal. The plan's LAY-02 concern about hard caps is moot -- most cards use `max_columns: 12` which is already "full width available." The `columns: 'full'` string in nav card is the only non-standard value.

### A2. Row Handling / Height Constraints

| Card | Mechanism | File:Line | Detail |
|------|-----------|-----------|--------|
| tunet-lighting-card | `grid-auto-rows` | L332 | `var(--grid-row, 124px)` -- fixed row height for tile grid |
| tunet-lighting-card | `min-height` | L571 | `88px` at <440px breakpoint |
| tunet-lighting-card | `rows` config | L24 | Config option `rows: 'auto'\|2-6` limits visible tiles in `_render()`, not CSS |
| tunet-nav-card | `position: fixed` | L38 | `.wrap` is fixed-positioned -- NOT in Sections flow |
| tunet-nav-card | fixed height | L119 | Mobile: `height: 64px`, Desktop: `height: calc(100vh - 24px)` |
| tunet-nav-card | fixed width | L133 | Desktop rail: `width: 72px` |
| tunet-light-tile | `aspect-ratio` | L81 | `1 / 0.95` (vertical), changes to `1 / 1.05` at <440px |
| tunet-rooms-card | `aspect-ratio` | L103 | `1` on room tiles (square) |
| tunet-status-card | `grid-auto-rows: auto` | L82 | Correct -- intrinsic height |
| tunet-speaker-grid-card | `min-height` | L142 | `62px` per tile, `56px` at compact |
| tunet-media-card | `min-height` | L52,L102 | `42px` on info-tile, `42px` on transport buttons |
| tunet-sonos-card | `min-height` | L91 | `40px` on transport buttons |

### A3. Navigation / Routing (`history.pushState`, `location-changed`)

| Card | File:Line | Usage |
|------|-----------|-------|
| tunet-nav-card | L332-333 | `_navigate()`: `history.pushState` + `location-changed` dispatch |
| tunet-nav-card | L260-261 | Listens for `location-changed` and `popstate` to update active state |
| tunet-rooms-card | L465-467 | `onPointerUp`: `navigate_path` fallback via `history.pushState` + `location-changed` |
| tunet-rooms-card | L545-546 | `_handleTapAction` navigate branch: same `history.pushState` pattern |
| tunet-status-card | L871-872 | `_handleTapAction` navigate branch: `window.history.pushState` + `location-changed` |

**Pattern:** Three cards independently implement the same `history.pushState` + `location-changed` navigation pattern. This is the exact duplication the shared `executeAction` adapter would eliminate.

### A4. Tap/Hold/Action Handling

| Card | File:Lines | Tap behavior | Hold behavior | Action routing |
|------|------------|-------------|---------------|----------------|
| tunet-rooms-card | L447-484 | `onPointerUp` (L459-474): `tap_action` -> `navigate_path` -> `hass-more-info` | `onPointerDown` timer (L450-456): `_toggleRoomGroup` after 400ms | `_handleTapAction` (L524-571): more-info, navigate, url, call-service |
| tunet-light-tile | L645-701 | Tap-to-toggle via `_callService` (L688-693) | Long-press 500ms -> `_openMoreInfo` (L652-655) | Direct service calls only |
| tunet-status-card | L788-804 | Via `_bindTileAction` (L788-804): `tap_action` -> default handler | No hold action | `_handleTapAction` (L857-892): more-info, navigate, url, call-service |
| tunet-actions-card | L395 | Click -> `_callService` (L436-442) | None | Direct service calls only |
| tunet-climate-card | L805 | Info-tile click -> `hass-more-info` | None | Direct `hass-more-info` only |
| tunet-lighting-card | L1096-1106 | Info-tile click -> `hass-more-info` | Adaptive button long-press (L1112-1134): reset manual / more-info | Direct `hass-more-info` / service calls |
| tunet-media-card | L788,797 | Info-tile click -> `hass-more-info` | None | Direct `hass-more-info` only |
| tunet-speaker-grid-card | L674-680 | Tile tap -> toggle group membership | Long-press 500ms -> `hass-more-info` (L791-800) | Direct service/script calls |
| tunet-sonos-card | L896,1174 | Tile tap -> toggle group; info-tile -> more-info | Long-press 500ms -> `hass-more-info` | Direct service/script calls |
| tunet-sensor-card | L629-664 | Row click -> `more_info` or custom `tunet-navigate` event | None | `activateRow` switch: navigate, more_info, none |
| tunet-weather-card | L294-300 | Info-tile click -> `hass-more-info` | None | Direct `hass-more-info` only |
| tunet-nav-card | L369-371 | Button click -> `_navigate` | None | `_navigate` via `history.pushState` |

### A5. Popup / Browser Mod References

| Location | Type | Detail |
|----------|------|--------|
| tunet-suite-storage-config.yaml L175-230 | YAML config | Living Room `tap_action: call-service browser_mod.popup` with inline `vertical-stack` content |
| tunet-suite-storage-config.yaml L253-300 | YAML config | Kitchen `tap_action: call-service browser_mod.popup` (full chrome variant) |
| tunet-suite-storage-config.yaml L398-436 | YAML config | Kitchen Rooms-view `tap_action: call-service browser_mod.popup` (minimal variant B) |
| tunet-rooms-card.js L556-561 | JS code | `_handleTapAction` `call-service` branch handles `browser_mod.popup` calls |

**Key finding:** The current popup approach uses `call-service browser_mod.popup` via the rooms card's generic `call-service` action handler. The plan's `fire-dom-event` approach is different -- it requires a NEW branch in `_handleTapAction` and uses `popup-card` with `popup_card_id` instead of inline content. These are incompatible patterns; the migration must update both JS and YAML config.

### A6. Config Editors (`getConfigForm` / `getConfigElement`)

| Card | File:Line | Method | Notes |
|------|-----------|--------|-------|
| tunet-rooms-card | L294-308 | `static getConfigForm()` | schema: name, rooms (object selector -- limited UI) |
| tunet-nav-card | L180-205 | `static getConfigForm()` | schema: home_path, rooms_path, media_path, subview_paths, desktop_breakpoint, show_settings |
| tunet-lighting-card | L672 | `static getConfigForm()` | Full config schema |
| tunet-light-tile | L775-790 | `static getConfigForm()` | schema: entity, name, icon, variant |
| tunet-status-card | L456-481 | `static getConfigForm()` | schema: name, columns, tile_size, custom_css (expandable) |
| tunet-actions-card | L269-285 | `static getConfigForm()` | schema: variant, mode_entity, compact |
| tunet-climate-card | L630 | `static getConfigForm()` | Full config schema |
| tunet-sensor-card | L397-407 | `static getConfigForm()` | schema: title, icon |
| tunet-media-card | L481 | `static getConfigForm()` | Full config schema |
| tunet-speaker-grid-card | L446-488 | `static getConfigForm()` | Full config schema with expandable advanced section |
| tunet-weather-card | L175-193 | `static getConfigForm()` | schema: entity, name, forecast_days, show_last_updated |
| tunet-sonos-card | L578 | `static getConfigForm()` | Full config schema |

**No card uses imperative `getConfigElement()`.** All use the declarative `static getConfigForm()` pattern. This is correct per the Tunet CLAUDE.md rule.

### A7. Hardcoded Widths/Heights That Fight Sections

| Card | File:Line | Issue | Severity |
|------|-----------|-------|----------|
| tunet-nav-card | L38-42 | `position: fixed; z-index: 1000` -- card is NOT in Sections flow at all | **High** -- affects all other cards via margin offsets |
| tunet-nav-card | L119,133 | Fixed `height: 64px` (mobile), `width: 72px` (desktop) | Expected -- nav is chrome, not content |
| tunet-lighting-card | L331 | `grid-template-columns: repeat(var(--cols), minmax(0, 180px))` -- `180px` max per tile column | **Low** -- only affects internal grid, not card sizing |
| tunet-lighting-card | L332 | `grid-auto-rows: var(--grid-row, 124px)` -- fixed 124px row height | **Medium** -- fights intrinsic Sections height |
| tunet-light-tile | L81 | `aspect-ratio: 1 / 0.95` -- fixed aspect | **Low** -- tile-internal |
| tunet-rooms-card | L103 | `aspect-ratio: 1` (square tiles) | **Low** -- tile-internal |
| tunet-speaker-grid-card | L142 | `min-height: 62px` | **Low** -- minimum, not maximum |

### A8. Adaptive Lighting Entity Scans

| Card | File:Lines | Purpose |
|------|------------|---------|
| tunet-rooms-card | L374-378 | `_entitiesChanged`: iterates ALL `switch.adaptive_lighting_*` keys for change detection |
| tunet-rooms-card | L603-613 | `_updateAll`: iterates ALL `switch.adaptive_lighting_*` keys to count manual controls per room |
| tunet-lighting-card | L863 | `_entitiesChanged`: iterates ALL `switch.adaptive_lighting_*` keys for change detection |
| tunet-lighting-card | L1421-1424 | `_getManuallyControlled`: scans ALL AL switches for `manual_control` attribute |
| tunet-lighting-card | L1519-1526 | `_resetManualControl`: scans and calls `adaptive_lighting.set_manual_control` |

**Performance concern:** Both rooms-card and lighting-card do `Object.keys(this._hass.states)` full scans every state change to find `switch.adaptive_lighting_*` entities. With many entities, this is O(n) per update cycle. Should be cached.

### A9. `fireEvent` / `hass-more-info` Dispatches

| Card | File:Lines | Mechanism |
|------|------------|-----------|
| tunet-rooms-card | L469-472 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-rooms-card | L534-538 | Direct `new CustomEvent('hass-more-info', ...)` in `_handleTapAction` |
| tunet-rooms-card | L566-570 | Direct `new CustomEvent('hass-more-info', ...)` fallback |
| tunet-status-card | L782-786 | `_fireMoreInfo`: Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-light-tile | L769 | Uses `fireEvent(this, 'hass-more-info', ...)` from tunet_base.js |
| tunet-lighting-card | L1101-1105 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-lighting-card | L1127-1131 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-climate-card | L805 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-media-card | L788,797 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-speaker-grid-card | L676-679 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-speaker-grid-card | L794-797 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-weather-card | L296-299 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-sonos-card | L896, L1174 | Direct `new CustomEvent('hass-more-info', ...)` |
| tunet-sensor-card | L639-648 | Direct `new CustomEvent('hass-more-info', ...)` + custom `tunet-navigate` event |
| tunet_base.js | L726-732 | `fireEvent()` utility -- only used by tunet-light-tile |

**Pattern inconsistency:** `fireEvent` exists in tunet_base.js but only 1 of 12 cards uses it. All others create `CustomEvent` manually. The shared `executeAction` adapter should centralize this.

### A10. Responsive Breakpoints

| Card | Breakpoint | Effect |
|------|------------|--------|
| tunet_base.js | `max-width: 440px` | Reduces card/section padding |
| tunet-rooms-card | `min-width: 500px` | Larger grid columns; `max-width: 440px`: 3-col fixed, smaller font |
| tunet-lighting-card | `max-width: 440px` | Smaller padding, gap, tile height, scroll column width |
| tunet-status-card | `max-width: 440px` | 2-column grid, smaller tiles |
| tunet-actions-card | `max-width: 440px` | Smaller font |
| tunet-weather-card | `max-width: 440px` | 3-column forecast (from 5) |
| tunet-speaker-grid-card | `max-width: 440px` | Single-column speaker grid, smaller tiles |
| tunet-sensor-card | `max-width: 440px` | Smaller padding, font, sparkline |
| tunet-nav-card | `desktop_breakpoint` config (default 900px) | Switches between mobile dock and desktop rail |
| tunet-light-tile | `max-width: 440px` | Taller aspect ratio, smaller icon/text |

---

## B. Repeated-Pattern Report

### B1. Systemic Issues

| Pattern | Cards affected | Description | Classification |
|---------|---------------|-------------|----------------|
| **Duplicated `history.pushState` navigation** | nav, rooms, status (3 cards) | Each card independently implements `history.pushState(null, '', path); window.dispatchEvent(new Event('location-changed'))` | Systemic -- shared adapter eliminates |
| **Manual `CustomEvent('hass-more-info')` construction** | rooms, status, lighting, climate, media, speaker-grid, weather, sonos, sensor (9 cards) | Direct `new CustomEvent` instead of using `fireEvent` from base | Systemic -- `fireEvent` exists but unused |
| **Duplicated `_handleTapAction` action routing** | rooms (L524-571), status (L857-892) | Near-identical switch on action type (more-info/navigate/url/call-service) | Systemic -- shared adapter eliminates |
| **Full `Object.keys` AL scan** | rooms (L374-378, L603-613), lighting (L863, L1421-1424) | O(n) iteration over all entities to find `switch.adaptive_lighting_*` | Systemic -- should cache entity keys |
| **`getGridOptions` boilerplate** | 10 cards | Identical `{columns:12, min_columns:6, max_columns:12}` return | Systemic -- could be a base default |
| **Missing `fire-dom-event` action type** | rooms, status | Both `_handleTapAction` implementations lack `fire-dom-event` support | Systemic -- required for Browser Mod popup-card pattern |

### B2. One-Off Issues

| Pattern | Card | Description |
|---------|------|-------------|
| `columns: 'full'` string | nav | Non-standard HA API value; should be a number |
| `position: fixed` nav | nav | Card opts out of Sections flow entirely; uses global CSS offsets |
| `grid-auto-rows: 124px` fixed height | lighting | Hard-coded tile row height; not intrinsic |
| `tunet-navigate` custom event | sensor | Unique event not used by any other card; dead code path |
| Inline popup content in YAML config | storage-config.yaml | Living Room/Kitchen rooms have `tap_action: call-service browser_mod.popup` with 30+ lines of inline YAML |

---

## C. Card-by-Card Sections Matrix

| Card | Sections-native | Evidence | Blocking issues |
|------|----------------|----------|-----------------|
| tunet-nav-card | **NOT** | `position: fixed`, injects global margin offsets, `columns: 'full'` non-standard | By design -- nav is chrome, not content |
| tunet-rooms-card | **Partial** | Correct `getGridOptions` but `max_columns: 12` forces full width | None blocking |
| tunet-lighting-card | **Partial** | `grid-auto-rows: 124px` fixed height; `max_columns: 12` | Fixed row height fights intrinsic sizing |
| tunet-light-tile | **Yes** | `min_columns: 3` correct for atomic tile; intrinsic height via aspect-ratio | None |
| tunet-status-card | **Yes** | `grid-auto-rows: auto`, proper `getGridOptions` | None |
| tunet-actions-card | **Yes** | Flex layout, proper `getGridOptions`, compact mode | None |
| tunet-climate-card | **Yes** | `columns: 6, min_columns: 3` allows half-width; intrinsic height | None |
| tunet-sensor-card | **Partial** | `max_columns: 12` forces full width; section-container layout | None blocking |
| tunet-media-card | **Partial** | `max_columns: 12` forces full width | None blocking |
| tunet-speaker-grid-card | **Partial** | `max_columns: 12` forces full width | None blocking |
| tunet-weather-card | **Yes** | `columns: 6, min_columns: 3` allows half-width | None |
| tunet-sonos-card | **Partial** | `max_columns: 12` forces full width | None blocking |

**Note:** `max_columns: 12` does NOT "force full width" in the way the plan feared. In HA Sections, `max_columns: 12` means "I can span up to all 12 columns if available" -- Sections still uses the `columns` value as the default span. The real issue is that most cards set `columns: 12` as default, which makes them full-width by default. The `columns` value (not `max_columns`) is what controls default span.

---

## D. Exact Change Points for popup-fix.md Plan

### D1. `tunet_rooms_card.js` -- Add `hold_action` support

**1. `setConfig` -- read `hold_action` from room config (L335-346)**
```
File: Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
Line 340: Add after `tap_action: room.tap_action || null,`
Add:      hold_action: room.hold_action || null,
```

**2. Long-press handler -- check `hold_action` before toggle (L450-456)**
```
File: Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
Lines 450-456: Replace the pressTimer callback body

CURRENT:
        pressTimer = setTimeout(() => {
          didLongPress = true;
          this._toggleRoomGroup(roomCfg);
          // Brief haptic feedback via scale
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);

CHANGE TO:
        pressTimer = setTimeout(() => {
          didLongPress = true;
          if (roomCfg.hold_action) {
            this._handleTapAction(roomCfg.hold_action, roomCfg);
          } else {
            this._toggleRoomGroup(roomCfg);
          }
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);
```

**3. Tap handler -- change default from navigate to toggle (L459-474)**
```
File: Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
Lines 459-474: Replace onPointerUp handler body

CURRENT:
      const onPointerUp = (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        // Short tap -> room action if defined, otherwise navigate.
        if (roomCfg.tap_action) {
          this._handleTapAction(roomCfg.tap_action, roomCfg);
        } else if (roomCfg.navigate_path) {
          history.pushState(null, '', roomCfg.navigate_path);
          window.dispatchEvent(new Event('location-changed'));
        } else if (roomCfg.lights.length && roomCfg.lights[0].entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: roomCfg.lights[0].entity },
          }));
        }
      };

CHANGE TO:
      const onPointerUp = (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        if (roomCfg.tap_action) {
          this._handleTapAction(roomCfg.tap_action, roomCfg);
        } else {
          this._toggleRoomGroup(roomCfg);
        }
      };
```

**4. Add `fire-dom-event` branch to `_handleTapAction` (after L561, before the fallback)**
```
File: Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
Line 562: Insert new block before the final fallback (L564-570)

ADD:
    if (action === 'fire-dom-event') {
      this.dispatchEvent(new CustomEvent('ll-custom', {
        bubbles: true,
        composed: true,
        detail: tapAction,
      }));
      return;
    }
```

### D2. `tunet_status_card.js` -- Add `fire-dom-event` branch

```
File: Dashboard/Tunet/Cards/v2/tunet_status_card.js
Line 889: Insert before the fallback (L891)

ADD:
    if (action === 'fire-dom-event') {
      this.dispatchEvent(new CustomEvent('ll-custom', {
        bubbles: true,
        composed: true,
        detail: tapAction,
      }));
      return;
    }
```

### D3. `tunet-suite-storage-config.yaml` -- Update room configs

**Living Room -- move popup from `tap_action` to `hold_action`, make tap = toggle (default)**
```
File: Dashboard/Tunet/tunet-suite-storage-config.yaml
Lines 173-230: Room config for Living Room on overview

CURRENT: Has `navigate_path` (L173) and `tap_action: call-service browser_mod.popup` (L174-230)
CHANGE: Remove `tap_action` block, remove `navigate_path`, add `hold_action` with fire-dom-event
```

**Same pattern for Kitchen (L248-310), and Rooms-view rooms (L376-462)**

### D4. `tunet_nav_card.js` -- Expand to 7 destinations

```
File: Dashboard/Tunet/Cards/v2/tunet_nav_card.js

1. setConfig (L217-233): Add `items` array config with label/icon/path objects,
   falling back to legacy home_path/rooms_path/media_path for backward compat

2. _render (L337-376): Replace hardcoded 3-button HTML with dynamic template
   generated from config.items array

3. _updateActive (L314-328): Replace hardcoded key matching with dynamic path matching
   across all items

4. CSS (L118-141):
   - Mobile: Change `grid-template-columns: repeat(3, 1fr)` to `repeat(var(--nav-items, 3), 1fr)`
   - Desktop: Change `grid-template-rows: repeat(3, 72px)` to `repeat(var(--nav-items, 3), 72px)`
   - Add mobile overflow handling for 7 items (horizontal scroll or icon-only condensed mode)

5. getConfigForm (L180-205): Add `items` array schema
```

### D5. `tunet_base.js` -- Add shared `executeAction` helper

```
File: Dashboard/Tunet/Cards/v2/tunet_base.js
After line 778 (end of `clamp` function): Add new exported function

ADD:
export function executeAction(element, hass, actionConfig, context) {
  if (!actionConfig || !hass) return;
  const action = actionConfig.action || 'more-info';
  switch (action) {
    case 'none': return;
    case 'more-info':
      fireEvent(element, 'hass-more-info', {
        entityId: actionConfig.entity || context?.defaultEntity || '',
      });
      return;
    case 'navigate': {
      const path = actionConfig.navigation_path;
      if (!path) return;
      history.pushState(null, '', path);
      window.dispatchEvent(new Event('location-changed'));
      return;
    }
    case 'call-service': {
      const [domain, service] = (actionConfig.service || '').split('.');
      if (domain && service) {
        hass.callService(domain, service, actionConfig.service_data || {});
      }
      return;
    }
    case 'fire-dom-event':
      element.dispatchEvent(new CustomEvent('ll-custom', {
        bubbles: true, composed: true, detail: actionConfig,
      }));
      return;
    case 'url':
      window.open(actionConfig.url_path, actionConfig.new_tab ? '_blank' : '_self');
      return;
  }
}
```

---

## E. Shared Adapter Migration Map

Cards that currently implement their own action routing and would benefit from switching to `executeAction`:

| Card | Current method | File:Lines | Actions supported | Migration complexity |
|------|----------------|------------|-------------------|---------------------|
| **tunet-rooms-card** | `_handleTapAction` | L524-571 | more-info, navigate, url, call-service | Low -- near-identical to adapter |
| **tunet-status-card** | `_handleTapAction` | L857-892 | more-info, navigate, url, call-service | Low -- near-identical to adapter |
| **tunet-nav-card** | `_navigate` | L330-335 | navigate only | Low -- single method replacement |
| **tunet-sensor-card** | `activateRow` switch | L629-664 | more_info, navigate (custom event), none | Medium -- uses `tunet-navigate` custom event |

Cards that only use `hass-more-info` and/or direct service calls (adapter optional, lower priority):

| Card | Current pattern | Priority |
|------|----------------|----------|
| tunet-lighting-card | Direct `hass-more-info` + service calls | Low -- no action routing needed |
| tunet-climate-card | Direct `hass-more-info` | Low |
| tunet-media-card | Direct `hass-more-info` | Low |
| tunet-speaker-grid-card | Direct `hass-more-info` + service calls | Low |
| tunet-weather-card | Direct `hass-more-info` | Low |
| tunet-sonos-card | Direct `hass-more-info` + service calls | Low |
| tunet-actions-card | Direct service calls only | Low -- no tap_action config |
| tunet-light-tile | Uses `fireEvent` from base + service calls | Already uses base utility |

**Migration order recommendation:**
1. Add `executeAction` to `tunet_base.js` (D5 above)
2. Migrate `tunet-rooms-card` (highest impact -- popup plan depends on it)
3. Migrate `tunet-status-card` (second-highest action routing complexity)
4. Migrate `tunet-nav-card` (simplest -- just navigate)
5. Optionally migrate remaining cards to use `fireEvent` from base for `hass-more-info`

---

## F. NEW DISCOVERIES

### F1. Nav card `columns: 'full'` is non-standard
- **File:** `tunet_nav_card.js` L252
- **Issue:** `getGridOptions()` returns `columns: 'full'` but HA Sections API expects a number. The string `'full'` may be silently ignored, causing unpredictable layout behavior.
- **Fix:** Change to `columns: 12` or investigate whether `'full'` is a documented HA Sections feature.

### F2. Current popup mechanism is incompatible with plan
- **File:** `tunet-suite-storage-config.yaml` L174-230
- **Issue:** The current Living Room popup uses `tap_action: {action: call-service, service: browser_mod.popup}` which calls the service directly. The plan's approach uses `fire-dom-event` with `popup-card` (`popup_card_id`). These are fundamentally different mechanisms:
  - Current: Service call triggers Browser Mod popup with inline content
  - Planned: Custom event triggers `popup-card` element that listens for `ll-custom` events
- **Impact:** The migration requires BOTH changing the rooms card JS (add `fire-dom-event`) AND changing the YAML config format (from `call-service browser_mod.popup` to `fire-dom-event` with `popup_card_id`), AND adding hidden `popup-card` definitions to the dashboard.
- **Risk:** If `custom:popup-card` is not installed, the `fire-dom-event` approach will silently fail. The current `call-service` approach at least gives a visible error.

### F3. `fireEvent` utility in base is underused
- **File:** `tunet_base.js` L726-732
- **Issue:** `fireEvent()` was designed as the shared way to dispatch events. Only `tunet-light-tile` uses it. All other cards manually construct `new CustomEvent('hass-more-info', ...)`. This is a missed abstraction that the `executeAction` adapter should subsume.

### F4. Room tile interaction model is currently INVERTED relative to plan
- **File:** `tunet_rooms_card.js` L442-474
- **Current:** Tap = navigate/popup, Hold = toggle lights
- **Plan:** Tap = toggle lights, Hold = popup
- **Impact:** This is a complete inversion of the gesture mapping. Users who have learned the current behavior will need to re-learn. The YAML configs must also be updated to move `tap_action` content to `hold_action` and remove `navigate_path` from all room configs.

### F5. Rooms card status line scans ALL entities for AL switches
- **File:** `tunet_rooms_card.js` L603-613
- **Issue:** For EACH light in EACH room, the card iterates `Object.keys(this._hass.states)` to find `switch.adaptive_lighting_*` entities. With 5 rooms x 5 lights x hundreds of entities, this is potentially thousands of iterations per update.
- **Fix:** Cache the set of AL switch entity IDs on first scan, invalidate only when the count changes.

### F6. `navigate_path` is configured on EVERY room in storage config
- **File:** `tunet-suite-storage-config.yaml` L173, L251, L315, L326, L379, L400, L441, L452
- **Issue:** All 8 room entries across 2 views have `navigate_path` configured. The plan says to remove `navigate_path` from room configs (nav bar provides room access). This is 8 config locations to update.

### F7. Nav card duplicated across every view
- **File:** `tunet-suite-storage-config.yaml` L350-360, L464-474, L517-527, L573-583, L608-618, L643-653, L678-688
- **Issue:** The `tunet-nav-card` config block is copy-pasted identically into 7 views (overview, rooms, media, 4 subviews). The nav expansion from 3 to 7 destinations requires updating ALL 7 copies.
- **Impact:** High maintenance burden. Consider using YAML anchors or a single config source.

### F8. Sensor card emits unknown `tunet-navigate` custom event
- **File:** `tunet_sensor_card.js` L639-648
- **Issue:** When a sensor row's interaction type is `'navigate'`, it dispatches a `tunet-navigate` custom event. No other component in the codebase listens for this event. It also falls through to dispatch `hass-more-info` immediately after, making the `tunet-navigate` event effectively dead code.

### F9. Sonos card is a candidate for media + speaker consolidation
- **File:** `tunet_sonos_card.js` (entire file)
- **Issue:** The Sonos card was built as a unified replacement for `tunet_media_card.js` + `tunet_speaker_grid_card.js`, but the storage config still uses the two separate cards. The consolidation is noted as TBD in project memory.

### F10. Lighting card `grid-auto-rows: 124px` prevents intrinsic Sections height
- **File:** `tunet_lighting_card.js` L332
- **Issue:** The `grid-auto-rows: var(--grid-row, 124px)` creates a fixed row height that prevents the card from having intrinsic height based on content. In Sections layout, this means the card always occupies the same vertical space regardless of content.
- **LAY-02 relevance:** This is one of the few cases where a hard constraint genuinely fights Sections-native behavior. The fix would be to change the default to `auto` and only use the fixed height when `rows` config is explicitly set.
