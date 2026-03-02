# Tunet Tranche Implementation Prompt

Use this prompt only after `Dashboard/Tunet/Agent-Reviews/current_tranche.md` exists.

This prompt is for implementing exactly one tranche.

---

Switch to branch `claude/dashboard-nav-research-QnOBs`.

Read these files in full:

1. `Dashboard/Tunet/Agent-Reviews/current_tranche.md`
2. `plan.md`
3. `FIX_LEDGER.md`
4. `Dashboard/Tunet/CLAUDE.md`

Read only the additional repo files required by the tranche.

This is an execution task for one tranche only.

Your job:

- implement exactly the tranche defined in `current_tranche.md`
- stay within `FILES_ALLOWED`
- stop if a real blocker requires widening scope
- perform the specified validation
- produce a precise implementation note for the reviewer

Non-negotiable rules:

- If current branch is not `claude/dashboard-nav-research-QnOBs`, stop and report.
- Do not start the next tranche.
- Do not rewrite the master plan.
- Do not opportunistically refactor adjacent systems.
- Do not touch files outside `FILES_ALLOWED` unless blocked.
- If blocked, stop and record the blocker instead of silently expanding scope.
- Prefer the smallest change that satisfies the tranche.
- Preserve Tunet design rules and Sections-native constraints.

Implementation discipline:

- before editing, restate the tranche goal in one sentence to yourself
- compare the tranche against current repo state
- if the tranche is already satisfied, stop and report that it is already done
- when editing, preserve the architectural intention in the tranche
- if the tranche touches live HA deployment, do not assume deployment is complete unless you actually perform it

Required saved output:

Write a full implementation report to:

- `Dashboard/Tunet/Agent-Reviews/current_tranche_implementation.md`

The report must contain:

- `TRANCHE_ID`
- `BRANCH_AND_HEAD`
- `FILES_CHANGED`
- `FILES_NOT_CHANGED`
- `CHANGES_MADE`
- `VALIDATION_RUN`
- `BLOCKERS`
- `KNOWN_RISKS`
- `DEPLOY_STATUS`
- `REVIEW_HANDOFF`

For `CHANGES_MADE`, describe:

- exact behavior change
- exact files changed
- exact lines or blocks changed
- why those changes satisfy the tranche

For `VALIDATION_RUN`, include:

- what static validation was done
- what runtime validation was done
- what HA/live validation was done
- what could not be validated

If deployment happened, state exactly:

- what was deployed
- where it was deployed
- whether cache busting was required

Do not mark the tranche done. That is the reviewer’s job.

Stop after the tranche implementation report is saved.
