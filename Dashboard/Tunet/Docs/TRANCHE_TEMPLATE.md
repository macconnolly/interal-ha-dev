# Tunet Tranche Template

Use this template whenever the work is no longer "broad planning" and has moved into execution.

The purpose of a tranche is to force one small, working, testable slice of progress.
If the work item cannot be described clearly with this template, it is too large and must be split.

This template is intentionally strict. It exists to prevent:

- multi-file scope creep
- "while I'm here" refactors
- broad architecture rewrites disguised as implementation
- coding before validation is defined
- agents claiming completion without a concrete test loop

## Rules

- A tranche must produce a working, testable outcome.
- A tranche should usually touch 1 to 3 files.
- A tranche should implement one user-visible behavior change or one tightly related corrective bundle.
- A tranche must define what is explicitly out of scope.
- A tranche must define how the work will be validated before coding starts.
- A tranche must stop after the acceptance criteria are met.
- If blocked, stop and record the blocker instead of widening scope.

## Tranche Definition

### TRANCHE_ID
- Example: `T-001`

### TITLE
- One line.
- Example: `Storage dashboard Living Room popup uses one consolidated lighting surface`

### STATUS
- One of:
  - `PLANNED`
  - `IN PROGRESS`
  - `CODE-DONE / REVIEW`
  - `CODE-DONE / HA-VERIFY`
  - `BLOCKED`
  - `DONE`

### SOURCE_ITEMS
- The exact planning or ledger items this tranche comes from.
- Example:
  - `plan.md: P1.01-P1.07`
  - `FIX_LEDGER.md: FL-007`

### GOAL
- One sentence stating the behavior that should exist after this tranche.

### WHY_NOW
- Why this tranche is the next highest-leverage slice.
- Keep this concrete:
  - reduces uncertainty
  - unblocks another tranche
  - fixes a live regression
  - validates the intended architectural pattern

### USER_VISIBLE_OUTCOME
- What the user will actually be able to do, see, or verify.

### FILES_ALLOWED
- Exact files that may be changed.
- Prefer a short, explicit list.

### FILES_FORBIDDEN_UNLESS_BLOCKED
- Files that must not be touched unless a real blocker is found.
- This prevents opportunistic drift.

### CURRENT_STATE
- Brief repo-grounded description of how the system behaves before the tranche.
- Include exact files and lines where practical.

### INTENDED_STATE
- Brief repo-grounded description of how the system should behave after the tranche.

### EXACT_CHANGE_IN_ENGLISH
- Use bullet points.
- Describe the intended change, not code mechanics alone.
- Example:
  - Replace multiple popup light tiles with one `custom:tunet-lighting-card`.
  - Preserve `All Off` and `Open Room`.
  - Do not add room media or sensors to this popup.

### ARCHITECTURAL_INTENTION
- Explain why this slice exists in the broader Tunet architecture.
- Example:
  - validate the room-popup pattern before scaling it to Kitchen, Dining, and Bedroom

### ACCEPTANCE_CRITERIA
- Use explicit, binary checks.
- Example:
  - Tapping Living Room opens the popup.
  - The popup contains exactly one lighting surface.
  - `Open Room` navigates to the correct room subview.
  - No duplicated `tunet-light-tile` stack remains in the popup.

### VALIDATION
- Split into:
  - `Static validation`
  - `Runtime validation`
  - `HA/live validation`
- Example:
  - Static: inspect YAML for exactly one lighting-card instance in popup block
  - Runtime: no syntax errors in changed JS/YAML
  - HA: popup opens and controls work

### DEPLOY_IMPACT
- One of:
  - `NONE`
  - `REPO ONLY`
  - `HA RESOURCE UPDATE`
  - `HA DASHBOARD UPDATE`
  - `HA RESTART`
- Say exactly what must be deployed, if anything.

### ROLLBACK
- Small, concrete rollback path.
- Example:
  - revert `tunet-suite-storage-config.yaml`
  - restore previous dashboard YAML in HA storage editor

### DEPENDENCIES
- Exact prior conditions required before this tranche starts.
- Example:
  - dashboard exists
  - Bubble Card resource loads
  - target room entities have been verified

### UNKNOWNS
- Questions that might affect the implementation but are not yet resolved.
- Do not hide uncertainty.

### STOP_CONDITIONS
- Define when the implementation agent must stop instead of broadening scope.
- Example:
  - if popup behavior requires nav-card refactor
  - if target entities do not exist
  - if storage dashboard structure diverges from repo assumptions

### OUT_OF_SCOPE
- Explicitly list the tempting adjacent work that must not be included.
- Example:
  - nav card redesign
  - Kitchen/Dining/Bedroom popups
  - global responsive cleanup
  - config editor work

### REVIEW_FOCUS
- Tell the tranche reviewer what to look for.
- Example:
  - scope discipline
  - architectural conformance
  - regression risk
  - acceptance criteria actually met

## Tranche Quality Bar

A good tranche:

- reduces uncertainty
- leaves the repo in a better tested state
- yields a visible improvement
- does not require understanding the entire project to review
- can be accepted or rejected cleanly

A bad tranche:

- bundles unrelated fixes
- mixes implementation with new planning
- touches many files "just because"
- does not define live validation
- claims to help architecture while skipping the proof step
