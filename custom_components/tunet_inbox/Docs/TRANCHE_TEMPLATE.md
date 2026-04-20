# Tunet Inbox Tranche Template

Use this template whenever `tunet_inbox` work moves from planning into implementation.

The intent is the same as the Tunet card tranches: one narrow, governed, testable slice at a time.

## Rules

- A tranche must produce one concrete, testable outcome.
- A tranche must define exact files allowed.
- A tranche must define exact files forbidden unless blocked.
- A tranche must define validation before coding starts.
- A tranche must define deploy impact explicitly.
- If blocked, stop and record the blocker instead of widening scope.

## Tranche Definition

### TRANCHE_ID
- Example: `TI1`

### TITLE
- One line.

### STATUS
- One of:
  - `PLANNED`
  - `IN PROGRESS`
  - `CODE-DONE / REVIEW`
  - `CODE-DONE / HA-VERIFY`
  - `BLOCKED`
  - `DONE`

### PLAN_MODE_DECISION
- State one of:
  - `DEFAULT EXECUTION`
  - `PLAN MODE REQUIRED`
- Explain why.
- Use `PLAN MODE REQUIRED` only when:
  - a new tranche is being frozen
  - a public contract is changing
  - allowed-file boundaries need to widen
  - deploy/restart/rollback sequencing is not yet settled
  - ownership or acceptance is ambiguous

### SOURCE_ITEMS
- Exact references to:
  - `custom_components/tunet_inbox/plan.md`
  - `custom_components/tunet_inbox/FIX_LEDGER.md`

### GOAL
- One sentence describing the behavior after this tranche lands.

### WHY_NOW
- Explain why this is the next highest-leverage slice.

### USER_VISIBLE_OUTCOME
- What can be verified after this tranche, even if only through backend tools.

### FILES_ALLOWED
- Exact files that may change.

### FILES_FORBIDDEN_UNLESS_BLOCKED
- Exact files that must not be touched unless blocked.

### CURRENT_STATE
- Repo-grounded description of current behavior and file locations.

### INTENDED_STATE
- Repo-grounded description of desired behavior after the tranche.

### EXACT_CHANGE_IN_ENGLISH
- Use flat bullets.

### ARCHITECTURAL_INTENTION
- Explain why this slice exists in the larger backend architecture.

### ACCEPTANCE_CRITERIA
- Binary checks only.

### VALIDATION
- `Static validation`
- `Runtime validation`
- `HA/live validation`

### DEPLOY_IMPACT
- One of:
  - `NONE`
  - `REPO ONLY`
  - `HA PACKAGE RELOAD`
  - `HA DASHBOARD UPDATE`
  - `HA RESOURCE UPDATE`
  - `HA RESTART`

### ROLLBACK
- Small and concrete.

### DEPENDENCIES
- Exact conditions required before starting.

### UNKNOWNS
- Explicit uncertainties.

### STOP_CONDITIONS
- Conditions that require stopping instead of widening scope.

### OUT_OF_SCOPE
- Adjacent work that is explicitly excluded.

### REVIEW_FOCUS
- What the reviewer should inspect first.
