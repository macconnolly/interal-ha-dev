# T-004 Tranche Review

> Historical note: this file records the review of the last completed tranche. The active next tranche is defined in [current_tranche.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche.md).

## TRANCHE_ID
- `T-004`

## BRANCH_AND_HEAD
- Branch: `claude/dashboard-nav-research-QnOBs`
- Reviewed against working tree after live status-card resource update

## VERDICT
- `PARTIAL`

## FINDINGS

### F-001
- Severity: `LOW`
- Files:
  - [tunet_status_card.js](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js)
- Line Numbers:
  - [tunet_status_card.js:81](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:81)
  - [tunet_status_card.js:631](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:631)
  - [tunet_status_card.js:640](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:640)
- What Is Wrong:
  - The intrinsic sizing fix is in place, but it still needs live visual confirmation on the actual storage overview.
- Why It Matters:
  - This tranche is user-visible. Config and code correctness alone do not prove the perceived width problem is resolved.
- Exact Fix In English:
  - Hard refresh the storage overview and verify that Adaptive / Humidity / the rest of the 4x2 grid read as equal-width columns.

### F-002
- Severity: `LOW`
- Files:
  - [tunet_status_card.js](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js)
- Line Numbers:
  - [tunet_status_card.js:458](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:458)
  - [tunet_status_card.js:461](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:461)
  - [tunet_status_card.js:735](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:735)
  - [tunet_status_card.js:949](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v2/tunet_status_card.js:949)
- What Is Wrong:
  - The UI editor is still only partially useful. This tranche restored `tile_size`, but not nested tile editing.
- Why It Matters:
  - User expectations around “UI config” are broader than what this tranche intentionally solved.
- Exact Fix In English:
  - Keep the next UI-config tranche separate. Do not falsely treat T-004 as full config-editor parity.

## ACCEPTANCE_CRITERIA_CHECK
- Status card uses `minmax(0, 1fr)` for internal columns: `PASS`
- Tile/grid children are content-constrained with `min-width: 0` / truncation: `PASS`
- V2 status card accepts and applies `tile_size`: `PASS`
- V2 status card renders `secondary`: `PASS`
- `getConfigForm()` exposes `tile_size`: `PASS`
- Live resource file updated: `PASS`
- Live resource URL cache-busted: `PASS`
- Visual result confirmed on dashboard: `NOT YET VERIFIED`

## SCOPE_DISCIPLINE
- Good.
- This stayed inside the V2 status card and did not reopen overview composition or other cards.

## REGRESSION_RISKS
- Low code-surface regression risk.
- Medium UX risk that the status card may still need a later visual polish pass after the hard equal-width fix.

## LEDGER_UPDATE_RECOMMENDATION
- Mark `T-004` as:
  - `CODE-DONE / HA-VERIFY`
- Do not mark it fully `DONE` until the refreshed dashboard confirms the Home Status card now feels materially more even.

## NEXT_TRANCHE_RECOMMENDATION
- Historical note:
  - the recommendation below this review was superseded by a later user-locked order
  - see [current_tranche.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/current_tranche.md) and [tranche_queue.md](/home/mac/HA/implementation_10/Dashboard/Tunet/Agent-Reviews/tranche_queue.md) for the active next tranche definition
