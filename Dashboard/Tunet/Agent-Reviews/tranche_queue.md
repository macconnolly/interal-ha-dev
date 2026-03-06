# Tunet Tranche Queue

## DONE RECENTLY

### T-005
- `Custom nav chrome recovery POC`
- Outcome:
  - nav now supports bottom dock (mobile) and side rail (desktop)
  - nav includes room destinations and stable route highlighting baseline
  - remaining hardening stays in future tranches (offset scope, UI editor truth, live-state hints)

### CP-02
- `Governance + Direction Sync`
- Outcome:
  - Bubble/hash popup instructions removed from active plan execution
  - Browser Mod popup direction remains explicitly locked
  - utility band locked as dual strips (`actions` + `scenes/chips`)
  - micro-interaction drift prevention rules locked into `plan.md`

## NOW

### T-006
- `Browser Mod popup completion + interaction contract finish`
- Why now:
  - popup is the second locked major decision
  - room interaction contract must be complete on all rooms, not only partial
  - this tranche closes the highest remaining daily-use interaction risk
- Scope:
  - finish one-popup-per-room for Dining + Bedroom
  - enforce `hold_action: fire-dom-event` + `browser_mod.popup` across overview/rooms surfaces
  - add clear "Open Room" affordance in each popup
  - keep popup content minimal: quick actions + one primary lighting surface

## NEXT

### T-007
- `Integrated UI / UX utility-band implementation`
- Why next:
  - utility-band direction is now locked but not yet consistently implemented across repo + live storage
  - we need compact, responsive dual-strip behavior on phone/tablet/desktop
- Scope:
  - standardize top-band composition (`tunet-actions-card` + `tunet-scenes-card`)
  - normalize compact sizing and spacing contracts for both strips
  - ensure strips feel intentional and not oversized on small screens

### T-008
- `Sections layout matrix enforcement pass`
- Why next:
  - matrix exists but still needs full runtime enforcement and screenshot-backed validation
- Scope:
  - validate overview + one room subview at the four target breakpoints
  - close remaining `max_columns` default drift and document any explicit exceptions

## LATER

### T-009
- `Home overview layout and hero finalization`
- Dependency:
  - nav + popup + integrated UI/UX decisions must be complete first

### T-010
- `Config editor reality matrix`
- Scope:
  - establish which cards are truly visual-editor friendly vs YAML-first

### T-011
- `Nav architecture hardening`
- Scope:
  - eliminate global layout side effects and finalize offset ownership model

## ORDER LOCK

The user-locked major decision order remains:

1. `NAV`
2. `POPUP`
3. `INTEGRATED UI / UX`
4. `HOME LAYOUT`
