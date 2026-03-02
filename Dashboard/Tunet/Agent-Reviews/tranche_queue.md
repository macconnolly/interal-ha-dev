# Tunet Tranche Queue

## NOW

### T-003
- `Storage Overview composition stops degenerating into a full-row stack and gives Lighting a real hero row`
- Why now:
  - directly addresses the current desktop/tablet structural failure
  - resets the page hierarchy before card-core fixes
  - removes dependency on the broken overview hash popup path

## NEXT

### T-004
- `Status-card internal tile width normalization so Home Status stops looking uneven`
- Likely scope:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - possibly storage dashboard config only if one tile type must be temporarily removed or simplified for proof
- Why next:
  - user-visible pain remains even after composition fixes
  - this is now the main blocker to Home Status reading as one coherent grid

### T-005
- `Actions strip visual density and V1 page polish recovery in a Sections-compatible way`
- Likely scope:
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - overview-level styling path compatible with Sections
- Why next:
  - current actions strip still feels wrong
  - the lost Tunet page atmosphere is a real regression

### T-006
- `Browser Mod replaces broken overview hash popup behavior for room/media quick overlays`
- Likely scope:
  - storage dashboard config
  - Home Assistant Browser Mod integration/service usage
- Why next:
  - user explicitly wants Browser Mod over Bubble hash popups
  - current overview hash popup path is not a reliable interaction surface

## LATER

### T-007
- `Convert Kitchen storage subview from stacked light tiles to one consolidated lighting surface`

### T-008
- `Convert Dining storage subview from stacked light tiles to one consolidated lighting surface`

### T-009
- `Convert Bedroom storage subview from stacked light tiles to one consolidated lighting surface`

### T-010
- `Validate simple Tunet config-editor behavior in live HA UI with one card that should fully support getConfigForm()`

### T-011
- `Evaluate tunet-nav-card as chrome vs layout participant and harden its storage-dashboard presentation`
