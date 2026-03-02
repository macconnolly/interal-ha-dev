# Tunet Tranche Queue

## NOW

### T-001
- `Storage dashboard Manual tile Reset pill only appears when total offset is non-zero`
- Why now:
  - directly user-visible
  - small file surface
  - validates storage-path parity with intended suite behavior
  - clean acceptance criteria

## NEXT

### T-002
- `Storage Living Room tile long-press navigates directly to room subview while tap keeps popup behavior`
- Likely scope:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - possibly `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` only if the card cannot express hold behavior declaratively
- Why next:
  - strengthens the core overview -> popup -> subview interaction model
  - still small and architectural

### T-003
- `Storage Overview desktop/tablet composition stops degenerating into long single-column scroll`
- Likely scope:
  - storage dashboard config only first
  - no card-core changes unless blocked
- Why next:
  - directly addresses current desktop/tablet usability pain
  - should be attempted as dashboard composition before reopening card internals

## LATER

### T-004
- `Validate simple Tunet config-editor behavior in live HA UI with one card that should fully support getConfigForm()`

### T-005
- `Evaluate tunet-nav-card as chrome vs layout participant and harden its storage-dashboard presentation`

### T-006
- `Convert Kitchen storage subview from stacked light tiles to one consolidated lighting surface`

### T-007
- `Convert Dining storage subview from stacked light tiles to one consolidated lighting surface`

### T-008
- `Convert Bedroom storage subview from stacked light tiles to one consolidated lighting surface`
