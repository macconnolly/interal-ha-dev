# Tunet Unified Interaction + Sections Layout System Plan

## Status
- **Decision-complete**: All interaction, layout, and governance decisions are locked.
- **Supersedes**: Previous popup-fix.md (inline-only architecture)
- **Branch**: `claude/dashboard-nav-research-QnOBs`
- **Date locked**: 2026-03-06

---

## Summary

Establish one governance system and one layout/interaction contract before further card/page changes.

### Locked Decisions

| Decision | Value |
|---|---|
| Room tile tap | Toggle all room lights |
| Room tile hold (>=400ms) | Open Browser Mod popup (`fire-dom-event`) |
| Light tile tap | Toggle (existing behavior preserved) |
| Light tile hold | Details/more-info (existing behavior preserved) |
| Popup platform | Browser Mod only for this tranche |
| Nav IA | Home + Media + Living + Kitchen + Dining + Bedroom (7 destinations) |
| Mobile nav | Icons-only condensed dock; horizontal swipe/scroll allowed |
| First popup POC | Living Room |
| Layout policy | Flexible by default; hard caps only as documented exceptions |
| `getGridOptions()` | No hard `max_columns` caps by default |

---

## Key Implementation Changes

### 1) Control-Plane Reset (CP-01) — management fix first

Add a strict execution gate across `plan.md`, `FIX_LEDGER.md`, and runbook workflow:

- **Mandatory preflight for every change:**
  - Interaction contract impact check
  - Sections-layout impact check
  - Cross-card impact map (rooms/nav/status/sensor/lighting)
  - Surface scope callout (repo YAML vs storage/hybrid vs live)
  - Rollback/cache-bust plan if JS/resources touched
- **WIP budget:**
  - One active tranche at a time
  - Max 3 active implementation items in that tranche
  - No "side fixes" outside tranche objective
- **Required traceability:**
  - Change IDs (e.g., `INT-001`, `LAY-001`, `NAV-001`) must appear in plan, ledger, and validation notes
- **DoR/DoD:**
  - Ready: decision-locked spec + layout/interaction acceptance tests
  - Done: code/config + deploy path + visual validation + control-doc sync

### 2) Sections Layout Research + Design System (LAY-01) — new mandatory tranche

Create a formal "Sections-native responsive model" before broad implementation:

- **Produce a breakpoint/layout matrix for:**
  - Overall view behavior
  - Section-level proportional sizing
  - Card-level span behavior within sections
- **Define canonical patterns (not ad-hoc):**
  - Role-based compositions (e.g., 60/40, 50/50, 1/3-2/3)
  - When to use 2-up vs 3-up sections at tablet/desktop
  - Smallest-phone behavior with nav + content priority
- **Validate with prototypes:**
  - Overview + one room subview as reference templates
- **Promote this as the layout standard used by all future tranches**

### 3) Card Grid Policy Normalization (LAY-02)

Unify custom card layout mechanics around Sections-native responsiveness:

- **`getGridOptions()` policy:**
  - Default to flexible/intrinsic behavior
  - Avoid hard `max_columns` caps by default
- **Hard constraints allowed only as documented exceptions:**
  - Explicit rationale
  - Target breakpoints
  - Visual validation proof
- **Apply this policy across all Tunet cards** so page-level layout controls work predictably
- **Add a shared "layout contract" table in control docs:**
  - Allowed card grid options
  - Disallowed fixed-cap patterns
  - Exception workflow (ID, rationale, validation evidence)

### 4) Interaction Contract Unification (INT-01)

Create a single interaction matrix and enforce it across cards/config:

- **Room surfaces:**
  - Tap toggles room group
  - Hold (>=400ms) opens room popup (`fire-dom-event`, browser-scoped)
- **Popup standard:**
  - One popup per room
  - Quick control-first content
  - Deeper room path available via nav (and optional popup affordance)
- **Remove contradictory plan/ledger language** so docs and implementation match
- **Shared action adapter:**
  - Introduce one shared action execution helper (in base layer) supporting:
    - `more-info`
    - `call-service`
    - `navigate` (single standardized mechanism)
    - `fire-dom-event` (Browser Mod)
  - Update cards that currently diverge (nav, rooms, status, sensor) to use the shared adapter
  - Remove card-specific ad-hoc route/event simulations once shared path is in place
  - Keep backward compatibility for existing config fields during migration; add deprecation notes

**Card-specific interface changes:**

- **`tunet-nav-card`:**
  - Add explicit configurable nav items (label/icon/path) to support 7-destination model
  - Keep legacy `home_path`/`rooms_path`/`media_path` as fallback for compatibility
- **`tunet-rooms-card`:**
  - Add explicit `hold_action` support per room (same action schema style as existing tap actions)
  - Default behavior lock: tap toggles group, hold triggers `hold_action` popup
  - Existing popup `tap_action` usage migrated to `hold_action` for room tiles

### 5) Living Room Popup POC (POP-01)

Browser Mod popup-card + hold-to-open from room tile, tap-to-toggle preserved.

#### tunet_rooms_card.js — Add `fire-dom-event` and `hold_action` support

**`fire-dom-event` branch** (add to `_handleTapAction`, after `call-service`):

```javascript
if (action === 'fire-dom-event') {
  this.dispatchEvent(new CustomEvent('ll-custom', {
    bubbles: true,
    composed: true,
    detail: tapAction,
  }));
  return;
}
```

**`hold_action` in long press handler** — replace `_toggleRoomGroup` in `onPointerDown` timer:

```javascript
// Current (line ~452):
pressTimer = setTimeout(() => {
  didLongPress = true;
  this._toggleRoomGroup(roomCfg);  // ← currently toggles lights
  // ...
}, 400);

// After: check hold_action first, fall back to toggle
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

**`setConfig` update** — read `hold_action` from room config:

```javascript
// Add to room mapping (around line 340):
hold_action: room.hold_action || null,
```

**Tap handler update** — tap now toggles (not popup):

```javascript
// Current onPointerUp (line ~459):
// Priority: tap_action → navigate_path → hass-more-info

// After: tap defaults to toggle, no navigate
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

#### Hidden popup-card definitions

One hidden card per room. Living Room is the first POC:

```yaml
- type: custom:popup-card
  popup_card_id: living-room-popup
  popup_card_all_views: true
  title: Living Room
  initial_style: wide
  dismissable: true
  card:
    type: custom:tunet-lighting-card
    name: Living Room
    surface: section
    layout: grid
    expand_groups: false
    show_adaptive_toggle: false
    tile_size: compact
    columns: 3
    zones:
      - entity: light.living_room_couch_lamp
        name: Couch
        icon: table_lamp
      - entity: light.living_room_floor_lamp
        name: Floor
        icon: floor_lamp
      - entity: light.living_room_spot_lights
        name: Spots
        icon: highlight
      - entity: light.living_room_credenza_light
        name: Credenza
        icon: light
      - entity: light.office_desk_lamp
        name: Desk
        icon: desk
```

#### Room config (Living Room hold_action):

```yaml
- name: Living Room
  icon: weekend
  temperature_entity: sensor.dining_room_temperature
  hold_action:
    action: fire-dom-event
    browser_mod:
      service: browser_mod.popup
      data:
        popup_card_id: living-room-popup
  lights:
    - entity: light.living_room_couch_lamp
      icon: table_lamp
      name: Couch
    # ... remaining lights
```

Note: `navigate_path` is removed from room config. Room page access is via nav bar.

### 6) Nav Expansion (NAV-01)

Expand nav to support 7 destinations with consistent behavior:

- Home, Media, Living, Kitchen, Dining, Bedroom (+ Rooms as utility index if retained)
- Mobile: icons-first compressed presentation with horizontal overflow handling
- Route highlighting and active-state logic must support all room paths consistently
- Add explicit configurable nav items (label/icon/path array) to `tunet-nav-card`

### 7) Popup Scale-Out (POP-02)

Apply popup/gesture contract to remaining rooms using same template:

```yaml
# Kitchen popup-card
- type: custom:popup-card
  popup_card_id: kitchen-popup
  popup_card_all_views: true
  title: Kitchen
  initial_style: wide
  dismissable: true
  card:
    type: custom:tunet-lighting-card
    name: Kitchen
    surface: section
    layout: grid
    expand_groups: false
    show_adaptive_toggle: false
    tile_size: compact
    columns: 3
    zones:
      - entity: light.kitchen_island_pendants
        name: Pendants
        icon: light
      - entity: light.kitchen_main_lights
        name: Main
        icon: kitchen
      - entity: light.kitchen_counter_cabinet_underlights
        name: Under-cab
        icon: kitchen

# Dining Room popup-card
- type: custom:popup-card
  popup_card_id: dining-room-popup
  popup_card_all_views: true
  title: Dining Room
  initial_style: wide
  dismissable: true
  card:
    type: custom:tunet-lighting-card
    name: Dining Room
    surface: section
    layout: grid
    expand_groups: false
    show_adaptive_toggle: false
    tile_size: compact
    columns: 3
    zones:
      - entity: light.dining_room_spot_lights
        name: Spots
        icon: highlight
      - entity: light.dining_column_strip_light_matter
        name: Columns
        icon: view_column

# Bedroom popup-card
- type: custom:popup-card
  popup_card_id: bedroom-popup
  popup_card_all_views: true
  title: Bedroom
  initial_style: wide
  dismissable: true
  card:
    type: custom:tunet-lighting-card
    name: Bedroom
    surface: section
    layout: grid
    expand_groups: false
    show_adaptive_toggle: false
    tile_size: compact
    columns: 3
    zones:
      - entity: light.bedroom_primary_lights
        name: Main
        icon: bed
      - entity: light.master_bedroom_corner_accent_govee
        name: Accent
        icon: palette
      - entity: light.master_bedroom_table_lamps
        name: Table Lamps
        icon: table_lamp
```

---

## Tranche Sequence (no overlap)

| # | ID | Name | Depends On |
|---|---|---|---|
| 1 | CP-01 | Control-plane reset (gate/budget/DoR/DoD + Change IDs) | — |
| 2 | LAY-01 | Sections layout research + prototype validation | CP-01 |
| 3 | LAY-02 | Card grid policy normalization (`getGridOptions` unification) | LAY-01 |
| 4 | INT-01 | Interaction contract lock in docs + config schema updates | CP-01 |
| 5 | POP-01 | Living Room popup POC (hold-to-open, tap-toggle preserved) | INT-01 |
| 6 | NAV-01 | Nav expansion and active-state unification | INT-01 |
| 7 | POP-02 | Scale popup pattern to Kitchen/Dining/Bedroom | POP-01 |

**Rule**: No implementation starts until CP-01 and LAY-01 are complete and accepted.

---

## Test Plan

### Governance tests

- Every change includes Change ID, preflight gate pass, and linked validation evidence.
- No cross-tranche edits; WIP budget respected.
- Any implementation PR/change includes:
  - Change ID
  - Impact map
  - Validation checklist
  - Updated plan/ledger entries

### Layout tests (mandatory)

- Card-level hard caps absent unless exception record exists.
- Cards expand proportionally — no fixed max column widths unless documented exception.
- Dashboard responds correctly at phone, tablet, and desktop breakpoints.

### Interaction tests

- Room tile tap toggles expected light group reliably.
- Room tile hold (>=400ms) opens Browser Mod popup reliably.
- No accidental navigation from room tile gestures.
- Light tap-to-toggle behavior remains stable.
- Hold behavior remains consistent with interaction contract.

### Nav tests

- 7 destinations render correctly on desktop and mobile.
- Mobile icons-only dock remains usable with swipe/scroll overflow.
- Room-page access always available from nav.
- Active highlighting correct for all room paths.

---

## Known Risks

| Risk | Mitigation |
|---|---|
| `custom:popup-card` not fully hidden in Sections (PR #747) | Isolate popup-cards in a dedicated hidden section with minimal column span if layout interference occurs |
| Browser Mod 2.8.0 breaking CSS changes (HA 2026.3) | Verify popup styling after HA update; use `initial_style` not `size` |
| 7-item nav on small phones | Icons-only mode + horizontal scroll; validate at 320px width |
| `navigate_path` removal from rooms card | Nav bar must reliably provide room page access before removing navigate fallback |

## Assumptions

- Browser Mod + popup-card resources are available and remain standard for popup tranche.
- Rooms page remains as utility/index, not primary wayfinding.
- Existing hard-capped card behaviors are considered transitional debt until normalized by LAY-02.
- No implementation starts until CP-01 and LAY-01 are complete and accepted.

---

## Interaction Contract Matrix (canonical reference)

| Surface | Tap | Hold (>=400ms) | Drag |
|---|---|---|---|
| Room tile | Toggle room light group | Open Browser Mod popup | — |
| Light tile | Toggle light on/off | Open more-info | Adjust brightness (horizontal) |
| Nav item | Navigate to destination | — | — |
| Popup content | Per-control (toggle/slider) | Per-control | Per-control (brightness drag) |
| Status tile | Open more-info / aux action | — | — |
| Action button | Fire action service | — | — |

---

## Shared Action Adapter (INT-01 deliverable)

A single shared action execution helper in `tunet_base.js` supporting all action types:

```javascript
// tunet_base.js — shared action dispatcher
function executeAction(element, hass, actionConfig, context) {
  if (!actionConfig || !hass) return;
  const action = actionConfig.action || 'more-info';

  switch (action) {
    case 'none':
      return;
    case 'more-info':
      fireEvent(element, 'hass-more-info', {
        entityId: actionConfig.entity || context?.defaultEntity || '',
      });
      return;
    case 'navigate':
      // Use HA's supported navigation — NOT history.pushState
      // Implementation TBD during INT-01: research HA navigate helper
      return;
    case 'call-service': {
      const [domain, service] = (actionConfig.service || '').split('.');
      if (domain && service) {
        hass.callService(domain, service, actionConfig.service_data || {});
      }
      return;
    }
    case 'fire-dom-event':
      element.dispatchEvent(new CustomEvent('ll-custom', {
        bubbles: true,
        composed: true,
        detail: actionConfig,
      }));
      return;
    case 'url':
      window.open(actionConfig.url_path, actionConfig.new_tab ? '_blank' : '_self');
      return;
  }
}
```

Cards import and delegate to this instead of implementing their own action routing.
This resolves FL-012 (brittle `history.pushState`) by centralizing navigation.
