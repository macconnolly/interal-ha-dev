# Brightness Alignment RCA (Light Tile + Rooms Card)

Date: 2026-03-06  
Scope:
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

## Reported Symptom

The brightness percent appears top-aligned, breaking the intended visual center relationship between:

1. room/light name
2. brightness/status value
3. bottom progress bar

## Repro Conditions

1. Use tile-style room/light surfaces (not only row controls).
2. Compare prior visual expectation: centered name/value block with bottom bar.
3. Observe current cards: value appears visually shifted upward.

## Root Cause Analysis

## RC-01 (rooms card): top-anchored tile flow

In `tunet_rooms_card.js`, base tile layout is explicitly top-anchored:

- `.room-tile { justify-content: flex-start; ... }`
- progress bar is absolutely positioned near tile bottom.

Effect:

- Name/status stack begins near top of tile.
- Progress bar remains pinned bottom.
- Vertical midpoint relationship is lost.

## RC-02 (light tile): centered stack + absolute bar optical conflict

In `tunet_light_tile.js` vertical variant:

- `.lt.vertical` uses centered main flow.
- `.progress-track` is absolutely positioned at bottom.

Effect:

- Bar is removed from flow while value remains in centered flow.
- As tile proportions and spacing changed, the value appears optically high relative to the bar anchor.

## RC-03 (cross-card language drift)

Both cards now use different vertical composition assumptions:

- Rooms tiles: top-first information hierarchy.
- Light tile vertical: center-biased information hierarchy.

This creates inconsistent visual rhythm when cards appear adjacent in overview/room contexts.

## Minimal-Risk Fix Options

## Option A (recommended): consistent centered info lane

Rooms:
- Move tile to centered flow for icon/name/status group.
- Keep progress track bottom-pinned.
- Add explicit spacing token between status and progress lane.

Light tile:
- Keep centered flow but add a dedicated bottom spacing token so value aligns against bar consistently.

Pros:
- Restores intended centered appearance.
- Preserves interaction/event behavior.
- Small CSS-only changes.

Cons:
- Requires careful mobile tuning to avoid clipping long names.

## Option B: top-anchored design standard across both cards

- Intentionally top-anchor light tile to match rooms tiles.
- Reframe design language as top-first hierarchy.

Pros:
- Consistent across cards.

Cons:
- Moves away from existing desired behavior/user expectation.

## Recommended Path

Choose Option A.

### Files/regions likely to change

- `tunet_rooms_card.js`
  - `.room-tile`
  - `.room-tile-name`
  - `.room-tile-status`
  - `.room-progress-track`
- `tunet_light_tile.js`
  - `.lt.vertical`
  - `.name`
  - `.val`
  - `.progress-track`

## Acceptance Tests

1. In tile mode, name + value read as vertically centered block.
2. Brightness/status text no longer appears top-shifted.
3. Bottom progress bar retains clear separation and no text overlap.
4. No regression in row-mode layouts.
