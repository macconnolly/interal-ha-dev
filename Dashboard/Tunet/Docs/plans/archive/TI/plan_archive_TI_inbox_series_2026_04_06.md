# TI-Series — Tunet Inbox Branch-Local UI Exception Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 164-210 + 2410-2423. Read-only. For current state see `plan.md` Tranche Queue.

**Period**: 2026-04-06
**Status**: Closed (TI2 inbox card + rehab fixtures + standalone dashboard live-proven 2026-04-06)
**Scope**: Branch-local Tunet inbox UI exception (`TI2`) for the OAL notification response surface, scoped to the `tunet/inbox-integration` worktree and paired with the `custom_components/tunet_inbox` backend productization.

## Synthesis

### What we did
- Re-authorized then activated `TI2` as a narrow branch-local exception tranche for the inbox card after the inbox backend tranches closed.
- Built the inbox card and its rehab-lab + standalone-dashboard wiring under the four governed file paths (card JS, bespoke test, rehab-lab YAML, standalone dashboard YAML).
- Live-proved the inbox card via the rehab lab and a brand-new standalone dashboard registration on 2026-04-06.
- Closed `TI2` cleanly at end of session rather than leaving it implied-active post-implementation.

### Why we did it
- The OAL notification response surface needed a Tunet UI vehicle, and the inbox backend had reached its frontend control point.
- A branch-local exception was explicitly authorized so root Tunet program authority (`CD9`) was not widened.

### Files touched (governed by TI2)
- `Dashboard/Tunet/Cards/v3/tunet_inbox_card.js`
- `Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/tunet-inbox-dashboard.yaml`
- related build/docs/config wiring permitted by the TI2 tranche spec

### Key decisions
- Branch-local exception explicitly authorized as `TI2`; root Tunet program stayed on `CD9` throughout (no widening beyond the four governed paths).
- Tranche was sequenced through three states in one day: re-authorized (TI2 active) → deferred (backend-first resequencing, TI2 not active) → reactivated and closed after live proof.
- Brand-new YAML dashboard registration required FULL HA RESTART for first activation; core reload alone was insufficient in live proof.
- Future inbox UI follow-up treated as narrow bugfix work, not a re-opened tranche by default.

### Entry points (for regression hunting)
- Tests: `Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
- Backend: `custom_components/tunet_inbox/` (productized via non-Tunet tranches)
- Selectors: `tunet-inbox-card`
- Dashboards: `Dashboard/Tunet/tunet-inbox-dashboard.yaml`, rehab-lab fixtures in `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Deferred work / handoffs
- Per `Dashboard/Tunet/Docs/visual_defect_ledger.md` Global cross-cutting bullet 2026-05-04: notification response page concept escalates to `CD12` backlog; the existing TI inbox card may or may not be the right vehicle — TBD pending investigation.

### Superseded by
- None recorded — TI series is parked, not retired. May resume if user requests notification surface enhancement.

### Related claude-mem observations (added 2026-05-04)

- #10947 — Notification Surface Research Prompt — Created and Refined (2026-04-05) — origin doc that framed the inbox/notification problem and seeded TI-series UI work.
- #10934 — HA Notification Inbox Research — No Off-the-Shelf Solution; Recommended Approach Identified (2026-04-06) — confirmed ecosystem gap and recommended custom Tunet card + persistent_notification, justifying the TI2 vehicle.
- #10967 — Home Feed Card — Persistent Notification Subscription Method Changed in HA 2023.6 (2026-04-06) — closest existing reference implementation for the inbox card subscription pattern.
- #10975 — persistent_notification WebSocket Subscribe API — Fully Functional Despite 2023.6 Entity Removal (2026-04-06) — backend WebSocket subscribe pattern the inbox card relies on.
- #10977 — HA WebSocket fire_event Command — Direct Event Firing IS Possible from Custom Cards (2026-04-06) — architectural unlock letting the card reuse all 12 existing handler automations unchanged.
- #10979 — HA Persistent Notification WebSocket API — Complete Data Format and Subscription Pattern (2026-04-06) — exact data shape (5 fields, no native actions) the inbox card consumes.
- #10981 — tunet_notifications_card — complete frontend/sync technical specification produced (2026-04-06) — full JS+YAML spec produced same day TI2 was authorized; primary input to the card implementation.
- #10982 — persistent_notification chosen as notification queue backend over todo list (2026-04-06) — locked-in backend decision underpinning the TI2 card design.
- #10986 — TI2B Tranche: mobile.url Public Schema Parity — Governance-First Execution Plan (2026-04-18) — backend integration governance pattern (plan.md as single source of truth) that frames TI-series tranche discipline.
- #11004 — tunet-inbox-integration Worktree Structure and Uncommitted State (2026-04-23) — snapshot of the custom_components/tunet_inbox layout and worktree this archive belongs to.
- #11005 — tunet-inbox TI5A1 Is Active — Sonos Apple TV No-Response Timeout Ownership (2026-04-23) — current state of the still-active backend TI-series, downstream of the TI2 UI closeout captured here.

---

## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-06, TI2 activation — Branch-Local Inbox UI Exception)

Tranche marker: `CD9` remains the root Tunet authority; branch-local exception tranche `TI2` is now active only inside the `tunet/inbox-integration` worktree for the governed inbox card/surface files

- `AUTHORITY NOTE`
  - user explicitly re-authorized the inbox card work in this worktree after the backend and compare-mode tranches closed
  - chosen interpretation:
    - keep `CD9` as the mainline Tunet program authority
    - activate `TI2` as a narrow branch-local exception tranche for:
      - `Dashboard/Tunet/Cards/v3/tunet_inbox_card.js`
      - `Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
      - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
      - `Dashboard/Tunet/tunet-inbox-dashboard.yaml`
      - related build/docs/config wiring allowed by the TI2 tranche spec
    - do not widen beyond the TI2 file boundary without a new control-point decision
- `RESULT`
  - root Tunet work stays on `CD9`
  - inbox UI work is now permitted in this branch only under the TI2 tranche contract

## Session Delta (2026-04-06, Inbox backend closure — no branch-local Tunet tranche)

Tranche marker: `CD9` remains the root Tunet authority; inbox backend tranches are now closed and no `Dashboard/Tunet/**` implementation is active in this branch

- `AUTHORITY NOTE`
  - the inbox backend program is now productized and hardening-complete through its non-Tunet tranches
  - chosen interpretation:
    - keep the root Tunet docs on normal `CD9`
    - do not activate any branch-local Tunet tranche yet
    - treat any future inbox UI work as a new control-point decision
- `RESULT`
  - root Tunet governance stays unchanged
  - the next inbox step is UI-only if it is explicitly reactivated later

## Session Delta (2026-04-06, TI2 deferral — Inbox Backend-First Resequencing)

Tranche marker: no branch-local Tunet tranche is active; inbox work returned to backend-only scope before any `Dashboard/Tunet/**` files changed

- `AUTHORITY NOTE`
  - the inbox program reached its frontend control point, but the user re-sequenced the work to finish productizing the integration first
  - chosen interpretation:
    - return the root Tunet docs to their normal `CD9` state
    - treat `TI2` as not active until the new backend tranche closes
    - do not authorize any `Dashboard/Tunet/**` implementation in this branch right now
- `RESULT`
  - `CD9` remains the root-program tranche
  - inbox work continues only in backend integration files until the productization tranche closes


## Session Delta (2026-04-06, TI2 closeout — Inbox Card Live Proof Completed)

Tranche marker: `CD9` remains the root Tunet authority; branch-local exception tranche `TI2` is now closed after live rehab and standalone dashboard proof

- `AUTHORITY NOTE`
  - the governed inbox UI work is complete in this branch
  - chosen interpretation:
    - close `TI2` instead of leaving it implied-active after implementation
    - keep the root Tunet program on `CD9`
    - treat any later inbox UI follow-up as narrow bugfix work, not a re-opened tranche by default
- `RESULT`
  - the inbox card, rehab fixtures, and standalone dashboard are live-proven
  - a brand-new YAML dashboard registration required full HA restart for first activation; core reload alone was not sufficient in live proof

