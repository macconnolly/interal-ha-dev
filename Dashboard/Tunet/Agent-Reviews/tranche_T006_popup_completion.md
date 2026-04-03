# T-006 - Browser Mod Popup Completion + Room Interaction Contract

### TRANCHE_ID
- `T-006`

### TITLE
- `Finish one-popup-per-room Browser Mod pattern and enforce final room interaction contract`

### STATUS
- `PLANNED / NEXT`

### SOURCE_ITEMS
- `plan.md` (`POPUP` decision is second in locked order)
- `FIX_LEDGER.md` (`FL-022`, `FL-030`)
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

### GOAL
- Complete the locked popup and room interaction model so all core rooms behave consistently:
  - tap on room tile toggles that room
  - hold on room tile opens Browser Mod popup
  - each room has one intentional popup surface with a clear route to the full room view

### USER_VISIBLE_OUTCOME
- All four rooms (Living, Kitchen, Dining, Bedroom) have hold-to-popup behavior.
- No room falls back to navigation or undefined behavior on hold.
- Every room popup feels consistent and minimal (quick actions + one primary lighting surface + Open Room route).

### FILES_ALLOWED
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/tunet-suite-config.yaml`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (only if required)
- `plan.md`
- `FIX_LEDGER.md`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- broad visual redesign files
- global home layout recomposition
- unrelated card-core refactors

### ACCEPTANCE_CRITERIA
- Dining and Bedroom popups exist and are wired through `popup_card_id`.
- Room tiles use `hold_action: fire-dom-event` + `browser_mod.popup` on all room surfaces.
- Room tile tap behavior remains room toggle everywhere.
- Popups do not contain stacked duplicate control surfaces.
- Popup content includes explicit route to full room view.

### VALIDATION

#### Static validation
- diff stays inside popup/rooms interaction scope
- no stale Bubble/hash popup instructions reintroduced in docs

#### Runtime validation
- long-press each room tile opens the matching popup
- tap each room tile toggles room lights

#### HA/live validation
- test at phone/tablet/desktop widths
- verify popup layout has no overflow and nav path remains available

### STOP_CONDITIONS
- Stop if this turns into full integrated shell redesign.
- Stop if this turns into broad home layout experimentation.
- Stop if this reopens nav architecture hardening scope.
