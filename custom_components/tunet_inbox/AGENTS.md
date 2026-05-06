# AGENTS.md (`custom_components/tunet_inbox` Scope)

Applies to all files under `custom_components/tunet_inbox/**`.

This is the execution contract for the `tunet_inbox` integration workstream.
The goal is not just to ship code. The goal is to ship a governed notification-control plane with explicit contracts, narrow tranches, auditability, and deterministic rollout.

## 0) Required Artifact Stack

These documents have distinct roles and must not be collapsed into one another:

- `AGENTS.md`
  - stable execution policy
  - review order
  - precedence
  - safety, validation, and planning-control rules
- `plan.md`
  - program order
  - tranche queue
  - active tranche pointer
- `Docs/execution_ledger.md`
  - normalized cross-tranche status authority
  - canonical open issues, blockers, deferred work, and validation debt
- `Docs/tranches/*.md`
  - execution authority for the active tranche
  - exact file boundary, validation, stop conditions, deploy impact, rollback
  - there are no standalone tranche files:
    - every tranche doc under `Docs/tranches/*.md` must be referenced from `plan.md`
    - tranche ordering and tranche status are governed by `plan.md`, not by standalone tranche docs
    - if tranche state or ordering drifts between a tranche doc and `plan.md`, `plan.md` wins
- `handoff.md`
  - session continuity and next-step map
- `FIX_LEDGER.md`
  - interpretation log and change ledger

Rule:
- `AGENTS.md` should stay durable and policy-oriented.
- live project state belongs in the ledger, tranche docs, handoff, and fix ledger.
- `plan.md` is the single source of truth for tranche queue, tranche state, and promotion order.

## 1) Mandatory Review Pack

Before implementing or changing anything under this scope, read in this order:

1. `custom_components/tunet_inbox/plan.md`
2. `custom_components/tunet_inbox/FIX_LEDGER.md`
3. `custom_components/tunet_inbox/handoff.md`
4. `custom_components/tunet_inbox/Docs/execution_ledger.md`
5. `custom_components/tunet_inbox/Docs/contracts.md`
6. `custom_components/tunet_inbox/Docs/deploy_and_test.md`
7. `custom_components/tunet_inbox/Docs/TRANCHE_TEMPLATE.md`
8. `custom_components/tunet_inbox/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md` while `TI0` is active

If a Tunet frontend file is also touched, the scoped rules in `Dashboard/Tunet/AGENTS.md` remain authoritative for the Tunet side.

## 2) Precedence

When files disagree, use this order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. `Docs/execution_ledger.md`
5. `Docs/contracts.md`
6. `Docs/deploy_and_test.md`
7. `Docs/TRANCHE_TEMPLATE.md`

Do not silently resolve contradictions. Record the chosen interpretation in the session delta.
For tranche ordering, promotion, and status, `plan.md` is authoritative even when another artifact is newer.

## 3) Locked Direction Rules

- `tunet_inbox` is the canonical notification queue and action arbiter.
- The dashboard must call `tunet_inbox.respond`. It must not fire raw `mobile_app_notification_action`.
- OAL and Sonos keep business logic ownership. `tunet_inbox` owns queueing, validation, locking, audit, and mobile clear mechanics.
- Every action must be represented by metadata only. Frontend payloads must never contain executable service definitions.
- Every queue item must have both:
  - `key` for logical identity
  - `item_id` for active-instance identity
- Every accepted response must emit exactly one canonical event: `tunet_inbox_action`.
- Every queue mutation that affects rendering must emit `tunet_inbox_updated`.
- State transitions are explicit and governed by the integration. The card must not infer business state from OAL/Sonos entities.
- Governance controls are non-negotiable:
  - strict schema validation
  - explicit action allowlisting
  - immutable state-transition guards
  - actor/source attribution
  - audit fields on every lifecycle transition
  - visible failure reasons

## 4) Tranche Discipline

- Use one active tranche at a time.
- Each tranche must have a clear goal, exact file list, explicit validation, and a stop condition.
- Every active tranche must have a fully filled tranche spec under `custom_components/tunet_inbox/Docs/tranches/`.
- Do not create or rely on standalone tranche state outside `plan.md`.
- Tranches should normally touch 1 to 5 files. If wider scope is necessary, document why.
- Do not widen a backend tranche into OAL/Sonos package changes unless the tranche explicitly allows those files.
- Stop when the tranche acceptance checks pass. Do not absorb adjacent work “while here.”

## 4A) Planning Control Policy

- The top-level plan in `plan.md` is the program plan. It is not sufficient by itself for safe tranche execution.
- Before coding a tranche, write or update the tranche spec and freeze:
  - exact goal
  - exact files allowed
  - exact files forbidden unless blocked
  - validation
  - deploy impact
  - stop conditions
- Normal execution should happen in default execution mode once the tranche spec is frozen.
- Enter explicit planning mode only at control points:
  - starting a new tranche that crosses boundaries
  - changing a public service, event, item, or deployment contract
  - widening beyond the tranche's allowed files
  - introducing HA restart sequencing or rollback ambiguity
  - encountering unresolved ownership or acceptance ambiguity
- Do not re-enter planning mode for narrow implementation work that already fits the approved tranche spec.

## 5) Required Docs Sync

After any meaningful change under this scope, update in the same session:

- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- the active tranche spec under `custom_components/tunet_inbox/Docs/tranches/`

If service, event, or item contracts change, also update:

- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`

## 6) Validation Requirements

Before claiming a backend tranche complete:

- Run static validation for changed Python files:
  - `python3 -m py_compile custom_components/tunet_inbox/*.py`
- Run YAML parse checks for any changed YAML tied to the tranche.
- Run the local backend check harness:
  - `npm run tinbox:check`
- If the tranche is deployed, run the smoke harness:
  - `npm run tinbox:smoke`

If a Tunet frontend file is changed, also satisfy the Tunet validation contract.

## 7) Deployment Rules

- Use the in-repo deploy helpers documented in `Docs/deploy_and_test.md`.
- Back up remote integration files before overwriting them.
- Per current user direction for this workstream, do not use full HA restarts unless the user explicitly requests one.
- Preferred backend activation/validation path after deploying `tunet_inbox` is browser-based integration reload:
  - `Settings -> Devices & Services -> Integrations -> Tunet Inbox -> service row menu -> Reload`
- If Python integration code changes, prefer the browser reload path above before proposing a full restart.
- If only package YAML changes, prefer automation reload over full restart where safe.
- Record exact deploy impact in `handoff.md`.

## 8) Safety Rules

- Do not bypass integration validation from the card.
- Do not add “temporary” raw mobile event listeners in OAL/Sonos once a flow is migrated.
- Do not introduce arbitrary service-call payloads into queue items.
- Do not silently discard malformed items. Log and quarantine them.
- Do not delete active queue items as part of dedupe unless the replacement behavior is explicitly documented.

## 9) Review Focus

Reviewers should focus on:

- governance enforcement
- contract fidelity
- state-machine correctness
- race safety
- partial-failure handling
- rollout/rollback clarity
