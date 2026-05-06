# Tunet Inbox Enhancement Matrix

This file replaces the old dashboard-centric enhancement tracker for the inbox project.

Use it as the planning matrix for the current question set:
- what decision is being made
- why it matters
- what we currently believe
- what evidence is still required
- which tranche owns the answer

This is not the normalized backlog authority. That remains:
- `custom_components/tunet_inbox/Docs/execution_ledger.md`

This matrix is the question-and-decision tracker that sits beside the ledger.

## Status Model

- `Answered`
  - the current direction is accepted for the active program state
- `Partially answered`
  - the direction is good enough to proceed, but proof is still required
- `Open question`
  - the decision is not stable enough yet
- `Deferred`
  - a real question, but intentionally postponed to a later tranche

## Decision Matrix

| ID | Domain | Decision question | Why it matters | Current answer / direction | Remaining unknowns | Evidence required | Owning tranche | Status |
|----|--------|-------------------|----------------|----------------------------|--------------------|------------------|----------------|--------|
| `Q-01` | Backend authority | What is the canonical backend for pending actionable notifications? | Everything else depends on the canonical queue | `tunet_inbox` custom integration is the canonical queue and action arbiter | none at the architectural level | docs + successful backend deployment | `TI0 / TI1` | `Answered` |
| `Q-02` | Action ingress | Should the dashboard fire raw `mobile_app_notification_action`? | Governs race safety and auditability | No. Dashboard must call `tunet_inbox.respond` and backend emits `tunet_inbox_action` | none | docs + card behavior proof | `TI1 / TI2` | `Answered` |
| `Q-03` | Business ownership | Where should OAL/Sonos logic live after migration? | Prevents the hub from becoming a rules engine | OAL and Sonos keep business logic; inbox owns queueing/validation/clear mechanics | none | docs + pilot migration proof | `TI3 / TI4` | `Answered` |
| `Q-04` | Identity | How do we prevent duplicates and stale actions? | Core correctness for recurring prompts | Use `key` for logical identity and `item_id` for active instance identity | exact edge-case behavior still needs live proof | service/state-machine validation | `TI1` | `Partially answered` |
| `Q-05` | Mobile mapping | How do phone actions map back to queue items exactly? | Required for safe parity across phone and dashboard | Raw mobile action string is `TINBOX|<item_id>|<action_id>` with `action_data` cross-checking | device-specific HA runtime nuances | mobile ingress proof in HA | `TI1` | `Partially answered` |
| `Q-06` | Render contract | How should the dashboard discover and refresh items? | Defines the card/backend seam | Card loads through `list_items` and refreshes on `tunet_inbox_updated` | none at the API level | card runtime proof | `TI2` | `Answered` |
| `Q-07` | Auto-clear ownership | Who clears items when conditions resolve naturally? | Prevents stale inbox items and contradictory state | Backend-owned via explicit resolver automations calling `tunet_inbox.resolve` | resolver coverage must be mapped per flow | OAL and Sonos migration proof | `TI3 / TI4 / TI5` | `Partially answered` |
| `Q-08` | iOS dismiss semantics | Does swiping away the phone notification resolve the queue item? | Central to the original problem statement | No. iOS dismiss is non-authoritative and must not clear the inbox item | none | pilot validation | `TI3 / TI4` | `Answered` |
| `Q-09` | Dedupe policy | What policies are supported for repeated prompts? | Impacts every notification family | `replace`, `refresh`, `ignore`, and `append` are supported | exact per-flow mappings still need pilot confirmation | TI1 state proof + TI3/TI4 mapping proof | `TI1 / TI3 / TI4` | `Partially answered` |
| `Q-10` | Queue scope | Is the inbox global, per-user, or per-device? | Affects routing and future multi-user behavior | v1 is single-user and global, with metadata stored for future routing | future multi-user model intentionally undefined | none for v1 | `TI0` | `Answered` |
| `Q-11` | Dashboard UX | What should the first dashboard surface include? | Avoids bloated scope in the first UI slice | A thin Tunet v3 inbox card, rehab fixtures, and one standalone inbox dashboard | final metadata density may need tuning after first populated render | TI2 live validation | `TI2` | `Partially answered` |
| `Q-12` | Migration order | What should happen after the single-flow pilot? | Sets program order and compare strategy | after `TI1D`, run a compare-mode shadow translation tranche before UI and cutover work | none for the current program order; next gate is UI | plan + ledger sync | `TI1D / TI1E` | `Answered` |
| `Q-13` | OAL compare scope | Which OAL flows should be mirrored first? | Prevents widening into the whole package without structure | all documented OAL user-facing actionable flows except the learning log were mirrored in compare mode; they are classified as action-ready with explicit resolver ownership | authoritative cutover timing remains later | TI1E implementation + live proof | `TI1E` | `Answered` |
| `Q-14` | Sonos compare scope | Which Sonos flows should be mirrored first? | Keeps Sonos work deliberate while maximizing coverage | alarm playing, evening alarm check, and Apple TV auto-off were mirrored in compare mode; alarm playing is action-ready, the other two remain mirror-only | authoritative Sonos cutover remains later | TI1E implementation + live proof | `TI1E` | `Answered` |
| `Q-15` | External operator path | How do we validate and deploy backend changes safely? | Required for production discipline | repo-native `tinbox:check`, `tinbox:test`, `tinbox:verify`, `tinbox:deploy:integration`, and `tinbox:smoke` commands now define the governed backend path | none for the backend tranche set | local verification + live deploy/restart/smoke evidence | `TI0 / TI1 / TI1A / TI1C` | `Answered` |
| `Q-16` | Supportability | When do diagnostics, repairs, and corruption handling enter scope? | Keeps hardening from being forgotten | restore-corruption quarantine, Repairs surfacing, and redacted diagnostics were pulled forward into `TI1C`; broader later-stage hardening still belongs to `TI6` | full post-migration hardening remains later | TI1C evidence + later TI6 planning | `TI1C / TI6` | `Partially answered` |
| `Q-17` | Compare mode | Should translated notifications replace the current mobile flows immediately? | Determines rollback safety and comparison ability | No. The next tranche should mirror notifications into `tunet_inbox` while keeping the current mobile writers and raw handlers alive | per-flow action duplication safety still needs explicit classification | tranche spec + live compare proof | `TI1E` | `Answered` |

## Tranche-to-Question Map

### `TI0`

- `Q-01`
- `Q-10`
- `Q-15`

### `TI1`

- `Q-02`
- `Q-04`
- `Q-05`
- `Q-09`
- `Q-15`

### `TI1E`

- `Q-12`
- `Q-13`
- `Q-14`
- `Q-17`

### `TI2`

- `Q-06`
- `Q-11`

### `TI1C`

- `Q-15`
- `Q-16`

### `TI3`

- `Q-07`
- `Q-08`
- `Q-09`

### `TI4`

- `Q-07`
- `Q-08`
- `Q-09`

### `TI6`

- `Q-16`

## Questions That Changed Relative To The Old Tracker

The old tracker centered on:
- hero quick actions
- popup concepts
- dashboard polish
- generic Sonos/OAL feature harvesting

The current inbox project instead centers on:
- canonical queue ownership
- governed response path
- mobile-to-dashboard parity
- stale-action safety
- resolver ownership
- migration sequencing
- operator deployment and smoke validation

That is why the old tracker is no longer adequate.
