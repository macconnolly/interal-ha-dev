---
name: tunet-agent-driver
description: Use this skill when working on Tunet dashboard architecture, Sections-native compliance, storage vs YAML strategy, popup/nav strategy, fix-ledger generation, or phased remediation planning. It drives a 4-agent review that saves execution-grade artifacts another coding agent can implement directly.
---

# Tunet Agent Driver

Use this skill for Tunet work that is broader than a single narrow code edit, especially when the task involves:

- multi-agent review or planning
- Sections-native dashboard compliance
- storage vs YAML vs hybrid dashboard strategy
- popup, navigation, or responsive architecture
- fix-ledger generation
- phased execution planning
- validating whether the current plan is actually defensible

Do not use this skill for a tiny self-contained code fix that does not require broader architecture review.

## Canonical Inputs

Read these files first:

1. `Dashboard/Tunet/Docs/agent_driver_pack.md`
2. `plan.md`
3. `FIX_LEDGER.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Treat them this way:

- `Dashboard/Tunet/Docs/agent_driver_pack.md` is the controlling multi-agent instruction set.
- `plan.md` is the single execution source of truth for current phase order and stated direction.
- `FIX_LEDGER.md` is the detailed remediation backlog and validation map.
- `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` is the live deployment and staging reality check.
- `Dashboard/Tunet/CLAUDE.md` contains the Tunet UI and interaction quality bar.

If any of these conflict, call the conflict out explicitly. Do not silently pick one.

## Branch Guard And Determinism

This skill is authoritative only on the intended Tunet working branch:

- `claude/dashboard-nav-research-QnOBs`

Before doing substantive work, record:

1. current branch
2. current HEAD commit

If the current branch is not `claude/dashboard-nav-research-QnOBs`:

- stop
- report the actual branch
- do not produce authoritative Tunet planning artifacts

Do not trust static commit markers in docs. Always trust live repo state.

## Control Document Precedence

When the control documents disagree, use this precedence order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/Docs/agent_driver_pack.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Do not silently resolve conflicts. Record them in a `CONTROL_DOC_CONFLICTS` section.

## Stale Findings Protocol

Older findings must not be repeated as open without checking the current branch first.

Classify reused findings as one of:

- `OPEN`
- `ALREADY FIXED IN REPO`
- `FIXED IN REPO BUT NOT DEPLOYED`
- `FIXED IN YAML BUT NOT STORAGE`

At minimum, explicitly reconcile these before restating them:

- `back_path` coverage on Tunet suite subviews
- the storage Living Room popup using one consolidated `tunet-lighting-card`
- `tunet_sensor_card.js` `value_attribute` support
- nav active color token drift in `tunet_nav_card.js`

## Required Preflight Sections

Every substantial saved artifact produced under this skill must begin with:

- `BRANCH_AND_HEAD`
- `CONTROL_DOCS_READ`
- `CONTROL_DOC_CONFLICTS`
- `STALE_FINDINGS_RECONCILIATION`
- `ASSUMPTIONS`

## Non-Negotiable Tunet Principles

Every agent run using this skill must preserve these principles:

- This must be a real modern Home Assistant Sections dashboard, not a legacy layout pretending to be one.
- Width hints are acceptable; forced vertical sizing is generally not.
- `rows` should be omitted when intrinsic height is the correct Sections behavior.
- `columns: "full"` should be used sparingly, only where the card truly must span the full section.
- Persistent nav should be treated as dashboard chrome, not evidence that content cards are Sections-native.
- Storage-first or hybrid editability is preferred when it materially improves maintainability and UI editing.
- Popups should be minimal and high-utility, not mini-pages.
- POCs should be small, working, and testable.
- Favor English remediation steps over code dumps unless exact code must be reproduced word-for-word.
- The output must be directly useful to later coding agents.

UI / UX quality bar to keep in view:

- follow the Tunet design language and the climate card quality bar
- preserve responsive sanity across phone, tablet, and desktop
- avoid long-scroll regressions caused by forcing vertical stacking unnecessarily
- prefer deliberate interaction hierarchy: overview -> quick popup -> deeper room view
- do not trade correctness for visual cleverness

## Current Local Sections Audit To Pressure-Test

Do not accept or reject these blindly. Every substantial run using this skill must explicitly confirm, refine, or reject them with evidence:

- Most Tunet cards are only partially Sections-native.
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` is the biggest current offender because it still models layout around explicit `rows`, fixed `grid-auto-rows`, and tile clipping.
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` is fixed-position chrome using global offsets and must be treated as chrome, not as a normal Sections content card.
- `Dashboard/Tunet/tunet-suite-storage-config.yaml` overuses `column_span`; that may be acceptable for composition but does not prove lower-level card correctness.

The cards that require the hardest scrutiny are:

- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`

The cards that currently appear closer to acceptable Sections behavior are:

- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`

## Required 4-Agent First Wave

Start with exactly 4 agents:

1. Manager / Ledger Integrator
2. HA Standards + Integration Researcher
3. Codebase Mapper + Key Function Reviewer
4. Architecture / UX / Feasibility Critic

Launch order:

1. Agent 2
2. Agent 3
3. Agent 4
4. Agent 1

Then:

5. send Agent 1's first-pass ledger and plan back to Agent 4 for attack review
6. rerun Agent 1 to produce the corrected final artifacts

Do not skip the Agent 4 review loop.
Agent 1 cannot finalize before Agent 4 has attacked the draft ledger and plan.

## Saved Output Contract

The run is not complete unless these files exist:

- `Dashboard/Tunet/Agent-Reviews/agent1_master_ledger.md`
- `Dashboard/Tunet/Agent-Reviews/agent1_execution_plan.md`
- `Dashboard/Tunet/Agent-Reviews/agent1_decision_register.md`
- `Dashboard/Tunet/Agent-Reviews/agent2_ha_standards_report.md`
- `Dashboard/Tunet/Agent-Reviews/agent3_code_map.md`
- `Dashboard/Tunet/Agent-Reviews/agent4_feasibility_critique.md`

Do not accept summary-only responses in place of these files.
Chat-only summaries do not count as completion.

## Output Quality Bar

Every meaningful finding or task should be shaped for later coding agents. Use this structure wherever applicable:

- `ID`
- `Title`
- `Category`
- `Severity`
- `Confidence`
- `Fact / Inference / Recommendation`
- `Files`
- `Line Numbers`
- `Current State`
- `Intended State`
- `Why It Matters`
- `Exact Change In English`
- `Similar Code / Related Locations`
- `Unknowns / Questions`
- `Dependencies`
- `Validation`
- `Deploy Impact`
- `Can Ship Independently`

Every agent should also include:

- `NEW DISCOVERIES`
- unresolved questions that were found during investigation
- nearby or repeated implementation sites, not just one primary line

If a later coding agent would have to re-discover the repo context to act, the artifact is not good enough.

## What To Optimize For

Optimize for:

- effort quality
- evidence quality
- depth
- machine-actionable remediation
- unbiased criticism
- tranche-level feasibility

Do not optimize for:

- elegant summaries
- being brief
- premature solution collapse
- writing large speculative code bodies

Prefer:

- exact English fix instructions
- clear intention and outcome
- explicit dependencies
- validation loops
- rollback awareness

## Failure Signals

Stop and correct the run if an agent:

- gives generic HA advice with no repo grounding
- does not cite exact lines
- does not separate fact from inference
- ignores the current local Sections audit
- produces a narrative summary instead of a ledger-quality artifact
- proposes phases that are too large to ship and test independently
- assumes config-editor support or Sections-native compatibility without proving it

## Practical Operator Shortcut

If you need the exact role prompts, launchers, and supervision checklist, read:

- `Dashboard/Tunet/Docs/agent_driver_pack.md`

That file already contains:

- the shared project brief
- role-specific prompts
- save-file requirements
- launcher text
- Codex-compatible launcher blocks
- supervision and retry guidance

Use this skill as the high-authority wrapper around that driver pack.
