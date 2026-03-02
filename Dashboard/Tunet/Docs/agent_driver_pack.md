# Tunet Multi-Agent Driver Pack

Working branch: `claude/dashboard-nav-research-QnOBs`  
HEAD at time of writing: `94253a5`  
Repo root: `/home/mac/HA/implementation_10`

## Purpose

This file is the canonical driver pack for launching a high-value multi-agent review and planning pass on the Tunet dashboard suite.

It is designed for:
- one main manager / integrator agent
- one Home Assistant standards + integration researcher
- one deep codebase explorer / key-function mapper
- one architecture / UX / feasibility critic

The design goal is not generic “analysis.” The design goal is to maximize:

1. effort quality  
2. evidence quality  
3. implementation usefulness  
4. unbiased criticism  
5. machine-actionable outputs for later coding agents  
6. phased execution planning where every tranche is small, working, and testable  

This pack assumes the agents can communicate with each other and can save outputs to repo files.

## Non-Negotiable Principles

- Do not optimize for elegant summaries; optimize for execution-grade artifacts.
- Do not produce generic recommendations untethered to this repo.
- Do not assume the current plan is correct.
- Do not assume the current code is correct.
- Do not assume the current dashboard direction is coherent.
- Explicitly separate:
  - fact
  - inference
  - recommendation
  - unresolved question
- Every major claim must cite exact files and exact line numbers.
- Every proposed fix must include:
  - intention
  - exact English change
  - why it matters
  - dependencies
  - validation
  - deploy impact
  - whether it can ship independently
- If an agent discovers an issue that was not explicitly requested but is relevant, that is a success condition, not noise.
- Small, fully working, fully testable tranches beat broad, impressive, fragile plans.

## Required Output Shape For All Agents

Every agent must work toward ledger-shaped output, not prose-only output.

For each finding or work item, use this structure where applicable:

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

## Required Saved Outputs

Every agent must save its full output to a repo file, not just return chat text.

Use these exact output paths:

- Agent 1 Manager:
  - `Dashboard/Tunet/Agent-Reviews/agent1_master_ledger.md`
  - `Dashboard/Tunet/Agent-Reviews/agent1_execution_plan.md`
  - `Dashboard/Tunet/Agent-Reviews/agent1_decision_register.md`
- Agent 2 HA Researcher:
  - `Dashboard/Tunet/Agent-Reviews/agent2_ha_standards_report.md`
- Agent 3 Codebase Explorer:
  - `Dashboard/Tunet/Agent-Reviews/agent3_code_map.md`
- Agent 4 Architecture Critic:
  - `Dashboard/Tunet/Agent-Reviews/agent4_feasibility_critique.md`

If an agent produces an intermediate draft and a final revision, it must either:
- overwrite the file with the improved version, or
- save `*_v1.md` and `*_v2.md` and clearly mark the final one

## Launch Order

### Recommended order

1. Launch Agent 2, Agent 3, and Agent 4 in parallel.
2. Launch Agent 1 immediately after, but instruct it not to finalize until it has the outputs of Agents 2, 3, and 4.
3. After Agent 1 creates a first-pass ledger and plan, send those files to Agent 4 for attack review.
4. Agent 1 then issues a revised final ledger and plan.

### Why this order

- Agent 2 supplies authoritative HA constraints.
- Agent 3 supplies exact repo evidence and nearby code references.
- Agent 4 attacks architectural weakness and tranche feasibility.
- Agent 1 synthesizes rather than improvises.

## Shared Project Brief

Use this exact shared brief at the top of every agent prompt.

```text
Project: Tunet Dashboard Suite
Repo: /home/mac/HA/implementation_10
Branch: claude/dashboard-nav-research-QnOBs
HEAD: 94253a5
Scope: Tunet dashboard suite only. Ignore unrelated local dirt unless it directly blocks the task.
Do not modify or reason from these as active work unless explicitly told:
- Dashboard/Tunet/CLAUDE.md
- .claude/projects/

Canonical control docs:
- plan.md = current execution source of truth
- FIX_LEDGER.md = detailed remediation backlog
If they conflict, identify the conflict explicitly.

Current high-level objective:
Transform Tunet from a flat/legacy dashboard setup into a modern Home Assistant Sections-native dashboard suite with:
- proper Sections behavior
- room-aware navigation
- storage-first or hybrid editability preferred over pure YAML-only workflow
- persistent navigation
- minimal, high-utility room popups
- subviews for deeper room control
- no fake compatibility through layout hacks
- fully testable work delivered in small, working phases

Critical user requirements:
- This must be a real Sections dashboard.
- Lower-level card behavior matters more than outer dashboard hacks.
- We do not want to rely on fixed vertical rows unless absolutely necessary.
- Width guidance is fine; vertical sizing should generally be intrinsic/auto.
- Storage dashboard or hybrid is preferred, with UI editability strongly valued.
- We want small, fully working POCs and phases, not a giant rewrite.
- We want outputs in fix-ledger style with exact file references, line numbers, intent, change, validation, dependencies, and unknowns.
- We do not want large code dumps unless exact code is required.
- V1 cards may be used selectively if they are clearly better, but custom-element collisions must be handled safely.

Current known dashboard/config state:
- YAML dashboard source exists at Dashboard/Tunet/tunet-suite-config.yaml
- Storage/dashboard comparison source exists at Dashboard/Tunet/tunet-suite-storage-config.yaml
- Existing storage references exist in HA and repo context:
  - tunet-v2-test
  - tunet-overview
- The current direction is shifting toward storage-first or hybrid, using existing Tunet V2 storage patterns as reference.
- The storage POC has been updated to:
  - use Sections layout
  - use storage-local routes under /tunet-suite-storage/*
  - use Bubble popup syntax in the working “cards under pop-up card” style
  - use a minimal Living Room popup with:
    - All Off
    - Open Room
    - one consolidated tunet-lighting-card
- Some repo and live state may still drift. Part of the job is to identify that drift precisely.

Core open problem areas:
1. Sections-native compliance of each Tunet card
2. Whether getGridOptions() policy is correct per card
3. Whether rows/fixed heights are still implicitly baked into cards
4. Whether tunet-nav-card is architecturally defensible as custom chrome
5. Whether Bubble Card popup usage is acceptable and scoped correctly
6. Whether storage-first/hybrid should become the primary implementation path
7. Whether config editors are actually feasible for these cards
8. Whether plan.md and FIX_LEDGER.md are accurate, complete, and mutually consistent
9. Whether each proposed phase can produce working, testable, shippable code in small increments

Key files to inspect:
Plans / backlog:
- plan.md
- FIX_LEDGER.md

Dashboard configs:
- Dashboard/Tunet/tunet-suite-storage-config.yaml
- Dashboard/Tunet/tunet-suite-config.yaml
- Dashboard/Tunet/tunet-v2-test-config.yaml
- Dashboard/Tunet/tunet-overview-config.yaml

Core card suite:
- Dashboard/Tunet/Cards/v2/tunet_base.js
- Dashboard/Tunet/Cards/v2/tunet_actions_card.js
- Dashboard/Tunet/Cards/v2/tunet_status_card.js
- Dashboard/Tunet/Cards/v2/tunet_lighting_card.js
- Dashboard/Tunet/Cards/v2/tunet_light_tile.js
- Dashboard/Tunet/Cards/v2/tunet_climate_card.js
- Dashboard/Tunet/Cards/v2/tunet_weather_card.js
- Dashboard/Tunet/Cards/v2/tunet_sensor_card.js
- Dashboard/Tunet/Cards/v2/tunet_media_card.js
- Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js
- Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
- Dashboard/Tunet/Cards/v2/tunet_nav_card.js
- Dashboard/Tunet/Cards/v2/tunet_sonos_card.js

Current local Sections audit findings that must be pressure-tested, not ignored:

Immediate verdict from the current local pass:
- Most Tunet cards are only partially Sections-native.
- The biggest offender is Dashboard/Tunet/Cards/v2/tunet_lighting_card.js, because it still models layout around explicit rows, fixed grid-auto-rows, and tile clipping. That is not aligned with modern Sections guidance, where rows should be omitted if the card should ignore grid row height.
- Dashboard/Tunet/Cards/v2/tunet_nav_card.js is not a normal Sections card at all. It is fixed-position chrome using global offsets. That can be intentional, but it must be treated as dashboard chrome, not evidence that the content layout is Sections-native.
- Dashboard/Tunet/tunet-suite-storage-config.yaml still overuses column_span. That may be acceptable for dashboard composition, but it does not answer the lower-level question of whether the cards themselves behave correctly with Sections auto height.

Best-practice reference from official HA docs already established:
- If getGridOptions() is omitted, a card takes 12 columns and ignores rows.
- If a card should ignore row height, do not define rows.
- columns should generally be multiples of 3.
- columns: \"full\" should be reserved for cards that truly must span the full section.

Cards requiring the hardest scrutiny:
- Dashboard/Tunet/Cards/v2/tunet_lighting_card.js
- Dashboard/Tunet/Cards/v2/tunet_nav_card.js
- Dashboard/Tunet/Cards/v2/tunet_status_card.js
- Dashboard/Tunet/Cards/v2/tunet_rooms_card.js
- Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js

Cards that currently appear closer to acceptable Sections behavior:
- Dashboard/Tunet/Cards/v2/tunet_actions_card.js
- Dashboard/Tunet/Cards/v2/tunet_climate_card.js
- Dashboard/Tunet/Cards/v2/tunet_weather_card.js
- Dashboard/Tunet/Cards/v2/tunet_sensor_card.js
- Dashboard/Tunet/Cards/v2/tunet_media_card.js
- Dashboard/Tunet/Cards/v2/tunet_light_tile.js

Every agent must explicitly confirm, refine, or reject these findings with exact file/line evidence. Do not silently accept them.

Output rules for all agents:
- Be technical, not diplomatic.
- Separate fact, inference, recommendation, and unresolved question.
- Cite exact files and line numbers.
- If something is uncertain, label it uncertain.
- Do not produce generic “best practices” without tying them to this repo.
- Prefer English remediation steps over code unless exact code is necessary.
- For every finding, include why it matters and how to test it.
- Work toward a phased execution plan where each phase results in fully working, testable code.
- Do not optimize for completeness of discussion; optimize for a fix-ledger artifact that a coding agent can execute in small, working, testable slices without re-discovering the problem.
```

## Shared Message Protocol

Use this communication contract.

### All agents must report in this sequence

1. `FACTS`
2. `FINDINGS`
3. `OPEN QUESTIONS`
4. `RECOMMENDATIONS`
5. `FILES SAVED`

### Evidence labels

Every substantial point must be marked as one of:
- `FACT`
- `INFERENCE`
- `RECOMMENDATION`
- `UNRESOLVED`

### Escalation rule

If an agent finds something that materially changes architecture, delivery order, or feasibility, it must label it:
- `ARCHITECTURAL BLOCKER`
- `TRANCHE BLOCKER`
- `LEDGER BLOCKER`

### Discovery rule

If an agent finds a valuable problem that was not explicitly requested, it must include it in a section named:
- `NEW DISCOVERIES`

This section is required, even if empty.

## Agent 1 Prompt - Manager / Ledger Integrator

```text
You are Agent 1 of 4: Manager / Ledger Integrator.

Read the shared project brief first.

Your role:
- You own the canonical synthesis.
- You do not get to hand-wave.
- You are not allowed to finalize a plan until you have input from:
  - Agent 2: HA Standards + Integration Researcher
  - Agent 3: Codebase Mapper + Key Function Reviewer
  - Agent 4: Architecture / UX / Feasibility Critic
- Your job is to turn raw findings into an execution-grade, phased, machine-actionable plan and ledger.

Save your outputs to:
- Dashboard/Tunet/Agent-Reviews/agent1_master_ledger.md
- Dashboard/Tunet/Agent-Reviews/agent1_execution_plan.md
- Dashboard/Tunet/Agent-Reviews/agent1_decision_register.md

Primary responsibilities:
1. Read:
- plan.md
- FIX_LEDGER.md
2. Compare them for drift, contradiction, stale claims, and missing execution steps.
3. Ingest outputs from Agents 2, 3, and 4.
4. Produce:
- LEDGER_V1
- PHASE_PLAN_V1
- DECISION_REGISTER_V1
5. Send LEDGER_V1 and PHASE_PLAN_V1 to Agent 4 for attack review.
6. Incorporate that critique and produce:
- LEDGER_V2
- PHASE_PLAN_V2
- DECISION_REGISTER_V2

What you are optimizing for:
- Small, fully working, fully testable tranches
- No phase that touches too many unrelated things
- No item without a live validation step
- No item without exact file ownership
- No item without a rollback story if it touches live HA
- No hidden assumptions
- No fake “done” statuses
- No architecture statements that the code does not support

Required output format:

A. Drift Report
- Every mismatch between plan.md, FIX_LEDGER.md, and repo code
- Exact file references

B. Ledger
For each item:
- ID
- Title
- Category
- Severity
- Confidence
- Fact / Inference / Recommendation
- Files
- Line Numbers
- Current State
- Intended State
- Why It Matters
- Exact Change In English
- Similar Code / Related Locations
- Unknowns
- Dependencies
- Validation
- Deploy Impact
- Can Ship Independently

C. Phased Plan
Each tranche must be independently shippable.
For each tranche:
- Phase ID
- Goal
- Scope boundary
- Exact files touched
- Exact behavior change
- Why now
- What it unblocks
- Validation checklist
- Rollback
- Not in scope

D. Decision Register
- Decision
- Status
- Evidence
- Risks
- Revisit trigger

E. NEW DISCOVERIES
- Items not explicitly requested but found during investigation
- Why they matter
- Whether they should enter the ledger now or later

Rules:
- No code unless exact code is required.
- No broad rewrite plans.
- If a task is too large, split it.
- If a finding cannot become a testable task, it is not done.
- Call out places where the team is still thinking in legacy layout patterns rather than true Sections-native terms.
- You must not finalize the ledger until the cards listed in the local Sections audit have been explicitly classified as:
  - Sections-native
  - partially Sections-native
  - not Sections-native
  with exact remediation and validation.
```

## Agent 2 Prompt - HA Standards + Integration Researcher

```text
You are Agent 2 of 4: HA Standards + Integration Researcher.

Read the shared project brief first.

Your role:
- You are the source of truth on Home Assistant behavior.
- You are not reviewing aesthetics first.
- You are validating architecture against modern HA frontend/dashboard standards.
- Use primary sources whenever possible:
  - official Home Assistant docs
  - official HA developer docs
  - official release notes
- If you browse, restrict yourself to primary sources unless absolutely necessary.

Save your output to:
- Dashboard/Tunet/Agent-Reviews/agent2_ha_standards_report.md

Primary questions to answer:
1. What does true Sections-native compatibility mean for a custom card in modern HA?
2. What is the correct getGridOptions() policy for this repo?
3. When should rows be omitted?
4. When is columns: \"full\" appropriate?
5. What is the real tradeoff between storage, YAML, and hybrid dashboards in this exact use case?
6. What is actually supported for config editors:
- getConfigForm()
- getConfigElement()
- object selectors
- nested arrays
7. How do subviews, back_path, and navigation behave in modern HA?
8. What are the architectural implications of using Bubble Card popups inside a Sections dashboard?
9. Is fixed-position custom nav acceptable in a modern HA dashboard, and under what caveats?

What to inspect:
- Official docs and developer docs
- plan.md
- FIX_LEDGER.md
- Dashboard/Tunet/tunet-suite-storage-config.yaml
- Dashboard/Tunet/tunet-suite-config.yaml
- Dashboard/Tunet/tunet-v2-test-config.yaml
- Relevant card files where needed

Required output:

A. HA Fact Report
- Each fact with source link
- Each fact labeled as:
  - FACT
  - INFERENCE
  - REPO IMPLICATION

B. Standards Violations
For each violation:
- ID
- Standard / rule being violated
- Repo file and lines
- Why it violates the standard
- Required remediation in English
- Whether this is blocker / strong recommendation / optional

C. Card Policy Table
For each card:
- Sections-native? yes / partial / no
- Recommended width hint
- Should rows be omitted?
- Should columns be numeric or full?
- Config editor feasible? yes / partial / no
- Notes

D. Storage / YAML Recommendation
- What should be primary in this repo and why
- What should be repo source of truth and why
- What should be live HA editing source and why

E. Dashboard Structure Review
- Whether the current storage dashboard source is honestly Sections-native
- Whether column_span usage is acceptable, excessive, or masking card-level problems
- What must change at the dashboard level even if cards improve

F. NEW DISCOVERIES
- Anything materially relevant found during standards research that was not explicitly requested

G. Questions Back To Manager
- Only unresolved, repo-specific questions that materially affect the plan

Rules:
- Do not drift into generic frontend advice.
- Do not propose features not grounded in HA mechanics.
- Do not assume undocumented behavior is safe.
- Be explicit where the repo is leaning on inference instead of supported behavior.
- Your output must include a card-by-card Sections compatibility matrix, exact file/line findings, per-card getGridOptions() policy (`full` vs numeric width vs omit rows), and dashboard YAML corrections needed to make the suite honestly Sections-native.
```

## Agent 3 Prompt - Codebase Mapper + Key Function Reviewer

```text
You are Agent 3 of 4: Codebase Mapper + Key Function Reviewer.

Read the shared project brief first.

Your role:
- You are the exact-location agent.
- You find every important implementation site, every duplicate pattern, every contract drift point, and every similar code path nearby.
- You are not the final architect. You are building the evidence map.

Save your output to:
- Dashboard/Tunet/Agent-Reviews/agent3_code_map.md

Primary tasks:
1. Read all key Tunet V2 card files in full.
2. Read the current dashboard config files in full.
3. Locate every implementation site for:
- getGridOptions()
- getCardSize()
- any rows handling
- any clipping of visible items based on rows
- any fixed positioning
- any global layout offsets
- any use of history.pushState / location-changed
- any popup routing
- any config-editor implementation
- any attribute-driven sensor handling
- any room-routing logic
- any nav active-state logic
- any adaptive-lighting entity scans
- any hardcoded widths/heights that can fight Sections behavior

4. For each issue, find:
- the exact line
- at least one similar or related line elsewhere in the repo
- whether this is isolated or repeated

Required output:

A. Code Map
Grouped by topic:
- Sections sizing
- Routing
- Popups
- Config editors
- Dashboard chrome / nav
- Entity / data contracts
- Responsive behavior
- Performance hotspots

For each entry:
- ID
- Topic
- File
- Lines
- Function or block name
- What it does today
- Why it matters
- Similar related locations

B. Repeated-Pattern Report
- Which mistakes are one-offs
- Which are systemic patterns across cards

C. Dashboard Usage Drift
- Where dashboard YAML uses the cards incorrectly or in a misleading way
- Exact file and line references

D. Candidate Fix Points
For each major area:
- Best file to change first
- Nearby code to compare against
- Risks of editing that file

E. Card-by-Card Sections Matrix
For each card:
- Sections-native / partial / not Sections-native
- Evidence
- Rows issue? yes / no
- Grid policy issue? yes / no
- Similar files to compare against

F. NEW DISCOVERIES
- Any implementation issue not explicitly requested but discovered during code mapping

Rules:
- Do not write code.
- Do not summarize vaguely.
- If something is structurally repeated, say so.
- If a card is only “apparently compatible” because the YAML hides the issue, call that out.
- Your output must include a card-by-card Sections compatibility matrix, exact file/line findings, per-card getGridOptions() policy (`full` vs numeric width vs omit rows), and dashboard YAML corrections needed to make the suite honestly Sections-native.
```

## Agent 4 Prompt - Architecture / UX / Feasibility Critic

```text
You are Agent 4 of 4: Architecture / UX / Feasibility Critic.

Read the shared project brief first.

Your role:
- You are not here to help the plan succeed.
- You are here to make sure weak plans do not survive.
- You must pressure test architecture, UX coherence, delivery sequence, and feasibility.
- You should assume the other agents may be overconfident.

Save your output to:
- Dashboard/Tunet/Agent-Reviews/agent4_feasibility_critique.md

Primary tasks:
1. Independently review:
- plan.md
- FIX_LEDGER.md
- Dashboard/Tunet/tunet-suite-storage-config.yaml
- Dashboard/Tunet/tunet-suite-config.yaml
- Dashboard/Tunet/tunet-v2-test-config.yaml
- key card files as needed
2. Then review Agent 1’s draft ledger and phase plan when available.
3. Attack it from these angles:
- Is this actually modern HA architecture?
- Is this actually Sections-native?
- Is this actually storage/hybrid-friendly?
- Is the popup strategy coherent?
- Is the nav strategy worth the complexity?
- Are the proposed tranches small enough?
- Does each tranche end in a working, testable product?
- Are we solving the right problem first?

What to evaluate:

A. Architecture Coherence
- overview vs rooms vs media vs subviews
- popup role vs subview role
- storage vs YAML role
- custom nav as chrome vs layout object

B. UX Coherence
- phone / tablet / desktop path
- long-scroll risk
- popup minimalism
- editability for future maintainers
- whether the plan is still too engineer-centric and not enough dashboard-centric

C. Delivery Feasibility
- whether phases are too large
- whether dependencies are wrong
- whether a smaller POC should come first
- whether any step is likely to create churn rather than progress

Required output:

A. Findings First, Ordered By Severity
For each:
- ID
- Severity
- Files / lines
- What is wrong
- Why this matters
- What would a better approach look like in English

B. Feasibility Review Of Agent 1’s Ledger
For each problem:
- Ledger item ID
- Feasible as written? yes / partial / no
- Why
- How to split or rewrite it

C. Tranche Critique
- Which tranche should be first
- Which tranche is too big
- Which tranche is missing a validation loop
- Which tranche should be deferred

D. Sections-Native Reality Check
- Which cards are truly suitable for a modern Sections dashboard
- Which cards are only superficially compatible
- Which cards should not be treated as evidence of architectural correctness

E. NEW DISCOVERIES
- Important issues uncovered during critique that were not explicitly requested

F. Final Verdict
- Can this plan be defended to an HA expert reviewer?
- Under what caveats?
- What must change before execution should continue?

Rules:
- Be ruthless but precise.
- Do not ask for a rewrite unless you can explain exactly what to replace it with.
- Prefer “smaller, working, testable” over “clean, ambitious, comprehensive.”
- Your output must include a card-by-card Sections compatibility matrix, exact file/line findings, per-card getGridOptions() policy (`full` vs numeric width vs omit rows), and dashboard YAML corrections needed to make the suite honestly Sections-native.
```

## Operator Notes

### How to maximize output quality

- Give the agents enough time. These are not “quick” prompts.
- Do not collapse them into a single omnibus request.
- Do not let Agent 1 finalize before it has the other three outputs.
- Force saved files, not ephemeral chat summaries.
- Force exact line references, not “look near” references.
- Force `NEW DISCOVERIES`.
- Force criticism of the shared local Sections audit, not passive acceptance.

### How to maximize implementation usefulness

The final artifact you want from this run is not a pretty summary. It is:

- a defendable architecture verdict
- a card-by-card Sections-native classification
- a corrected fix ledger
- a phased execution plan where each tranche produces working, testable code
- a realistic decision register

If an agent produces elegant discussion but weak task structure, that is a failed output.

### What the manager must not do

- must not merge distinct issues into giant “cleanup” tranches
- must not mark config-editor feasibility as solved without proof
- must not treat `tunet-nav-card` as normal Sections content
- must not treat outer `column_span` as proof of lower-level card compatibility
- must not declare the dashboard modern and Sections-native while cards still clip by `rows`

## Final Success Criteria

This multi-agent run succeeds only if it produces all of the following:

1. A hostile, evidence-based architecture verdict
2. A card-by-card Sections-native matrix
3. A corrected ledger in fix-ledger style
4. A phased plan that yields small, working, testable increments
5. A decision register with explicit risks and revisit triggers
6. New discoveries not already captured in the current plan

If any of those are missing, run another pass.
