# Tunet Tranche Manager Prompt

Use this prompt after the broad research / ledger pass is complete.

This prompt is for selecting the next smallest useful tranche, not for implementing it.

---

Switch to branch `claude/dashboard-nav-research-QnOBs`.

Read these files in full:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/CLAUDE.md`
4. `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md`

If broad planning artifacts from the multi-agent workflow exist, also read:

5. `Dashboard/Tunet/Agent-Reviews/agent1_master_ledger.md`
6. `Dashboard/Tunet/Agent-Reviews/agent1_execution_plan.md`
7. `Dashboard/Tunet/Agent-Reviews/agent1_decision_register.md`
8. `Dashboard/Tunet/Agent-Reviews/agent2_ha_standards_report.md`
9. `Dashboard/Tunet/Agent-Reviews/agent3_code_map.md`
10. `Dashboard/Tunet/Agent-Reviews/agent4_feasibility_critique.md`

This is a tranche-selection task only.

Your job:

- choose the next smallest independently valuable tranche
- define it using `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md`
- optimize for one working, testable slice
- avoid broad or multi-system changes
- avoid speculative architecture work unless the tranche itself is an explicit proof-of-concept

Non-negotiable rules:

- If current branch is not `claude/dashboard-nav-research-QnOBs`, stop and report.
- Do not implement code.
- Do not rewrite the master plan.
- Do not select a tranche that touches more files than necessary.
- Do not select a tranche that cannot be validated concretely.
- Do not bundle unrelated fixes.
- Prefer the tranche that most reduces uncertainty while still producing working, testable behavior.

Selection priorities:

1. fixes a live blocker
2. validates a core architectural pattern
3. unblocks later work
4. has minimal file surface area
5. has a clear rollback path

Disallowed tranche shapes:

- "make the dashboard responsive"
- "finish Sections migration"
- "fix all popups"
- "implement the plan"
- "complete Phase 0"
- anything that mixes nav, popup, storage, and card-core fixes in one pass

Required output:

Write a full tranche definition to:

- `Dashboard/Tunet/Agent-Reviews/current_tranche.md`

Also write a short tranche queue to:

- `Dashboard/Tunet/Agent-Reviews/tranche_queue.md`

The queue should list:

- `NOW`
- `NEXT`
- `LATER`

For the chosen `NOW` tranche, fully populate the tranche template with:

- exact goal
- why now
- files allowed
- files forbidden unless blocked
- exact change in English
- acceptance criteria
- validation
- deploy impact
- rollback
- dependencies
- unknowns
- stop conditions
- out of scope
- review focus

The output must be specific enough that an implementation agent can execute without re-discovering the task.

Do not end with general advice. End with the concrete saved tranche artifact.
