# Tunet Tranche Review Prompt

Use this prompt only after:

- `Dashboard/Tunet/Agent-Reviews/current_tranche.md`
- `Dashboard/Tunet/Agent-Reviews/current_tranche_implementation.md`

both exist.

This prompt is for reviewing one tranche only.

---

Switch to branch `claude/dashboard-nav-research-QnOBs`.

Read these files in full:

1. `Dashboard/Tunet/Agent-Reviews/current_tranche.md`
2. `Dashboard/Tunet/Agent-Reviews/current_tranche_implementation.md`
3. `plan.md`
4. `FIX_LEDGER.md`
5. `Dashboard/Tunet/CLAUDE.md`

Read the changed files referenced by the implementation report.

This is a review task for one tranche only.

Your job:

- determine whether the tranche was actually completed as defined
- review only the allowed scope
- identify regressions, architectural violations, or missing validation
- decide whether the tranche is:
  - `DONE`
  - `PARTIAL`
  - `BLOCKED`
  - `FAILED REVIEW`

Non-negotiable rules:

- If current branch is not `claude/dashboard-nav-research-QnOBs`, stop and report.
- Do not broaden the project scope.
- Do not redesign the whole architecture in this review.
- Do not suggest unrelated follow-on improvements as if they block this tranche.
- Review against the tranche contract first, not your ideal future state.

You must review:

1. scope discipline
   - were forbidden files touched?
   - did the implementation silently widen scope?

2. tranche correctness
   - does the change actually produce the intended behavior?
   - were acceptance criteria met?

3. validation quality
   - was the stated validation actually performed?
   - are there important missing checks?

4. architecture conformance
   - does the tranche violate Sections-native, Tunet UI, or storage/hybrid rules?

5. regression risk
   - what nearby behaviors could now be broken?

Required saved output:

Write the tranche review to:

- `Dashboard/Tunet/Agent-Reviews/current_tranche_review.md`

The review must start with:

- `TRANCHE_ID`
- `BRANCH_AND_HEAD`
- `VERDICT`

Then include:

- `FINDINGS`
- `ACCEPTANCE_CRITERIA_CHECK`
- `VALIDATION_ASSESSMENT`
- `SCOPE_DISCIPLINE`
- `REGRESSION_RISKS`
- `LEDGER_UPDATE_RECOMMENDATION`
- `NEXT_TRANCHE_RECOMMENDATION`

If there are findings, list them first in descending severity with:

- `ID`
- `Severity`
- `Files`
- `Line Numbers`
- `What Is Wrong`
- `Why It Matters`
- `Exact Fix In English`

If the tranche passes, say so explicitly and state what ledger items can now be updated.

Do not implement fixes in this review. Save the review artifact and stop.
