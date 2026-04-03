# Tunet Mockup vs Build Gap Log

Updated: 2026-03-06
Scope: v2 cards + `tunet-suite-storage` implementation track

## P0 Gaps (Must Have)

| ID | Gap | Status | Notes |
|---|---|---|---|
| P0-01 | Rooms card row/capsule variant with per-light orbs + iOS switch (mockup parity) | DONE | Added `layout_variant: row|tiles` to `custom:tunet-rooms-card` and enabled row mode in storage dashboard. |
| P0-02 | At least one complete reference popup + complete room page | DONE | Living Room is now the reference implementation in storage: popup has quick actions + Open Room + lighting; room page has actions + scenes + lighting + media + nav. |
| P0-03 | Explicit "Open Room" route inside popup | PARTIAL | Implemented for Living Room popup; Kitchen/Dining/Bedroom still need explicit route affordance. |
| P0-04 | One-popup-per-room with consistent quality | PARTIAL | All four room popup IDs exist and are hold-wired; only Living is fully built to reference quality. |
| P0-05 | Room subviews use consolidated `tunet-lighting-card` (no legacy light-tile stacks) | PARTIAL | Living is consolidated; Kitchen/Dining/Bedroom still use `custom:tunet-light-tile` in subviews. |

## P1 Gaps (Important Next)

| ID | Gap | Status | Notes |
|---|---|---|---|
| P1-01 | Shared action execution adapter consistency (`runCardAction` / `executeAction`) | OPEN | Base action runner exists in `tunet_base.js`, but not all cards use one shared adapter path yet. |
| P1-02 | Unified gesture thresholds/guards across cards (tap/hold/drag propagation) | OPEN | Interaction behavior still varies by card implementation. |
| P1-03 | Popup utility consistency (quick actions + open-room route across all room popups) | OPEN | Living complete; apply same pattern to Kitchen/Dining/Bedroom. |

## Reference Build Lock (Current)

- Reference complete popup: `living-room-popup`
- Reference complete room page: `/tunet-suite-storage/living-room`
- Reference room card mode: `layout_variant: row`

## Next Recommended Slice

1. Apply Living popup composition pattern to Kitchen/Dining/Bedroom.
2. Convert Kitchen/Dining/Bedroom subviews to consolidated `tunet-lighting-card` surfaces.
3. Normalize shared action adapter usage across `actions/scenes/status/rooms` interaction points.
