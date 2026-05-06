# Cross-Card Spec Layer — Agent Runbook

**Audience**: agents (subagents, parallel sessions, scheduled routines) collaborating on the Tunet cross-card spec layer extraction. Read this BEFORE you do any work on the plan.

**Authoritative plan**: `Dashboard/Tunet/Docs/plans/cross_card_spec_layer_extraction_plan.md` — every change you propose lands as a delta against that doc.

**Authoritative findings**: `Dashboard/Tunet/Docs/plans/cross_card_corpus_findings.md` — the captured corpus-synthesized answers to the five seed questions. Treat as your starting context, not as final truth.

**Corpus**: `tunet-architecture` (claude-mem, primed; see §3 for filter contract).

---

## 1. Mission boundary

You are working on the planning for the cross-card consistency rework (CC0–CC3 passes). Specifically you may:

- Query the `tunet-architecture` claude-mem corpus to surface architecture facts.
- Read source files in `Dashboard/Tunet/Cards/v3/`, contract docs in `Dashboard/Tunet/Docs/`, control docs (`plan.md`, `FIX_LEDGER.md`, `handoff.md`).
- Propose plan refinements as edits to `cross_card_spec_layer_extraction_plan.md`.
- Add new findings to `cross_card_corpus_findings.md` with a clear "added by `<agent-name>` on `<date>`" marker.
- Fire additional corpus queries, save the answers, integrate them.

You may NOT:

- Activate any CC pass. CC0 is gated on (a) CD9 closing AND (b) explicit user authorization. Do not start CC0 audit work until the user types "Activate CC0" or equivalent.
- Modify any card source file (`Dashboard/Tunet/Cards/v3/*.js`) for CC purposes. Card edits happen during pass execution, not during pass planning.
- Modify `cross_card_interaction_vocabulary.md` for CC purposes. The v2.0 promotion happens at CC3 close.
- Touch `~/.claude/plans/flickering-herding-wolf.md` — it is the CD-tranche execution authority, parallel program.
- Change the test contracts under `Dashboard/Tunet/Cards/v3/tests/`. The new `§Surface composition` block was added on 2026-04-30; do not extend it speculatively before the pass that owns the rule activates.
- Touch `tunet_status_card.js` (G3S bugfix-only lock) or `tunet_alarm_card.js` (separate SA-series program).
- Open new tranches by writing CC numbers into `flickering-herding-wolf.md` or starting new entries in `visual_defect_ledger.md`. Plan refinements stay inside `cross_card_spec_layer_extraction_plan.md`.

If you find a defect outside CC scope (e.g., new cross-cutting bug not in the plan), document it in `visual_defect_ledger.md` under the appropriate card's `Implementation backlog` section but do NOT fix it.

---

## 2. Workflow

For each refinement task you take on:

1. **Read the plan** (§3 architecture inventory, §6 the four passes, §11 corpus references) — know what's already established.
2. **Read the existing findings** (`cross_card_corpus_findings.md`) — know what the corpus has already answered.
3. **Identify the gap** — a specific question whose answer would change the plan body or add a new prerequisite.
4. **Query the corpus** (§3) with a focused question. Save the raw answer.
5. **Propose a plan delta** as an edit to `cross_card_spec_layer_extraction_plan.md`. Include the corpus citation.
6. **Add the new finding** to `cross_card_corpus_findings.md` so the next agent sees what you saw.
7. **Surface anything that exceeds the planning scope** — write it as a question for the user, not an implementation.

---

## 3. Corpus access — the working recipe

The MCP `query_corpus` tool times out at 3 seconds and is unreliable for substantive queries. **Use the local HTTP API directly.** It runs on `localhost:37777` (claude-mem viewer + API) on the host where the worktree lives.

### 3.1 Verify corpus state

```bash
curl -s http://localhost:37777/api/observations | head -c 200
```

Expected: 200 OK with a JSON `items` array. If 404 or connection refused, the local claude-mem service is not running — surface to the user.

### 3.2 The corpus filter (canonical)

Rebuild only when filters change. The current canonical filter is:

```bash
curl -s -m 30 -X POST http://localhost:37777/api/corpus \
  -H "Content-Type: application/json" \
  -d '{
    "name": "tunet-architecture",
    "description": "Tunet card suite architecture: shared primitives, tokens, surface composition, interaction contracts, profile system, per-card divergences, contract tests, vocabulary, and consistency-driver tranche history (CD0-CD12). Filtered by files: all v3 cards + tunet_base.js + design/contract docs + contract test files. Project: implementation_10 (umbrella).",
    "types": ["decision","feature","refactor","discovery","change","bugfix"],
    "project": "implementation_10",
    "files": "tunet_base.js,tunet_actions_card.js,tunet_scenes_card.js,tunet_lighting_card.js,tunet_light_tile.js,tunet_rooms_card.js,tunet_climate_card.js,tunet_weather_card.js,tunet_sensor_card.js,tunet_media_card.js,tunet_sonos_card.js,tunet_speaker_grid_card.js,tunet_nav_card.js,tunet_status_card.js,tunet_alarm_card.js,tunet_inbox_card.js,cross_card_interaction_vocabulary.md,cards_reference.md,tunet-design-system.md,sections_layout_matrix.md,visual_defect_ledger.md,interaction_source_contract.test.js,interaction_dom_contract.test.js,css_contract_helpers.js",
    "limit": 500
  }'
```

This currently yields **500 observations / ~234k tokens**. Type breakdown: ~252 discoveries, ~90 bugfixes, ~75 changes, ~46 features, ~27 decisions, ~10 refactors. Date range: 2026-02-19 to 2026-04-30.

### 3.3 Why this filter

- **`project: implementation_10`** captures the umbrella project. The worktree project (`implementation_10/tunet-inbox-integration`) has only ~128 observations; the umbrella has 5000+. Filtering by `files` restricts the umbrella to the 24 architecture-relevant files.
- **`files`** is doing the real scoping. It includes every v3 card, `tunet_base.js`, the binding contract docs, the layout matrix, the visual defect ledger, and the contract test files.
- **No semantic `query`** — semantic queries narrow aggressively (we tested: same filter with the architecture query string drops from 500 to ~33 obs). Save semantic queries for the question itself, not the filter.
- **`limit: 500`** is the budget. Going higher (1600 with no semantic narrowing) blows the context budget.

### 3.4 Prime the corpus (creates a session)

```bash
curl -s -m 60 -X POST http://localhost:37777/api/corpus/tunet-architecture/prime -H "Content-Type: application/json" -d '{}'
```

Expected: `{"session_id":"<uuid>","name":"tunet-architecture"}`. Priming is required after each rebuild and after long idle periods. If you get HTTP 500 with `Corpus "..." has no session — call prime first`, prime first then retry the query.

### 3.5 Query the corpus

```bash
curl -s -m 240 -X POST http://localhost:37777/api/corpus/tunet-architecture/query \
  -H "Content-Type: application/json" \
  -d '{"question":"Your specific architecture question here. Cite observation IDs."}' \
  -w "\nHTTP %{http_code}  time=%{time_total}s\n"
```

Use a `-m 240` (4-minute) timeout. Most queries return in 30–90 seconds. The response shape is `{"answer": "..."}`.

### 3.6 Reprime (after rebuild)

```bash
curl -s -m 60 -X POST http://localhost:37777/api/corpus/tunet-architecture/reprime -H "Content-Type: application/json" -d '{}'
```

`reprime` clears prior Q&A context — use it when conversation drift is suspected or after rebuild.

### 3.7 Rebuild (refresh observations)

```bash
curl -s -m 30 -X POST http://localhost:37777/api/corpus/tunet-architecture/rebuild -H "Content-Type: application/json" -d '{}'
```

`rebuild` re-runs the stored filter. Use after new observations are written to claude-mem (sessions adjacent to your work). After rebuild, you must call `prime` again — the session id is invalidated.

---

## 4. Query authoring guidelines

The corpus's date range ends ~2026-04-05 for most observations (with some 2026-04-30 additions). Be explicit about terminology:

- The corpus uses **CD0–CD12** tranche labels. The CC0–CC3 labels are forward-looking from the new plan; the corpus may say "CC1 is not in the corpus." That's fine — ask the substance, not the label.
- The plan was renumbered on 2026-04-30 from CC1–CC4 to CC0–CC3. Corpus seed queries below (§7) use the original CC1–CC4 labels for historical fidelity; the substance maps unchanged. New queries should use CC0–CC3.
- The corpus says `INTERACTIVE_SURFACE` is "planned but not implemented." That observation is from before CD2 closed (commit `7f98dec`, 2026-04-03). Cross-check with the actual `tunet_base.js` file via `Read`.
- The corpus does NOT contain a per-card `:host { font-size }` audit. If you need that, you must run it directly (`grep -L ":host\s*{[^}]*font-size:\s*16px" Dashboard/Tunet/Cards/v3/*.js`) and add the result as a new finding.

**Good question shapes**:

- "Which cards X — cite observation IDs and L-numbers."
- "What load-bearing dependency exists between X and Y — list with symptom/cause/recipe."
- "What's NOT in the corpus that would block decision X — list specific gaps."

**Bad question shapes**:

- "Should we do X?" — corpus answers facts, not decisions.
- "What is best practice?" — corpus is project-specific history, not industry doctrine.
- "Compile the plan for me." — that's your job; corpus is one input.

---

## 5. Capturing answers

Save every substantive answer to `cross_card_corpus_findings.md` under a new section:

```markdown
## <Topic> (added by <agent-name> on <YYYY-MM-DD>)

**Question**: <verbatim>

**Answer** (corpus-synthesized, may be incomplete):

<answer text>

**Plan delta proposed**: <link to specific section in cross_card_spec_layer_extraction_plan.md>

---
```

Do NOT overwrite or edit prior entries. The findings doc is append-only history.

If the answer contradicts the plan, write the contradiction explicitly:

```markdown
**Conflict with plan**: §X.Y says A, but corpus says B. <Recommend a resolution path; do not silently change the plan.>
```

The user resolves contradictions, not you.

---

## 6. Plan deltas

Plan deltas are edits to `cross_card_spec_layer_extraction_plan.md`. Apply them only when:

- The corpus answer (or direct file read) is solid.
- The change improves a specific section without expanding the four-pass scope.
- You can cite the source observation IDs or file paths.

Place deltas inline where they belong. Do NOT add a "delta history" log section — let `git log` carry that information.

If the change is large enough to need its own discussion (a new pass, a re-ordering, a doctrine change), STOP and write the proposal as a new section at the END of the plan titled `## Proposed: <topic>`. The user reviews and either incorporates or rejects.

---

## 7. Sample seed queries

These are the five seed queries that produced `cross_card_corpus_findings.md`. Re-fire them when the corpus is rebuilt with new observations to capture deltas:

1. **CC1 dependencies**: "For CC1 corner/shape system migration: which cards have load-bearing border-radius values where naive token migration could break visual or functional behavior? Specifically check border-radius interactions with overflow:hidden masking, scroll-snap alignment, drag pill clipping, focus-ring visibility, and grouping badge composition. Cite specific cards and their L-numbers if known."
2. **CC2 em-anchor**: "For CC2 type scale + em-anchor enforcement: enumerate every card whose host font-size is NOT 16px or whose font-size is set inside @media rather than top-level :host. List by card. Also: for cards using mixed em+px fallbacks like font-size: var(--type-row-title, 18px), explain what could break when we add a top-level :host { font-size: 16px } anchor."
3. **CC3 additional rules**: "For CC3 surface composition rules: beyond (a) scroll container vs hover-lift, (b) sticky/stacking-context, (c) dropdown z-index, (d) drag pill overflow, and (e) focus-ring offset clipping, are there OTHER implicit cross-cutting composition rules in the Tunet codebase that have caused bugs or required exemptions? Look for patterns where one card had to work around an ancestor or sibling behavior."
4. **CC4 divergences**: "For CC4 INTERACTIVE_SURFACE migration: identify cards that have card-LOCAL re-implementations of hover/press/focus that diverge from the INTERACTIVE_SURFACE shape post-CD2. For each, would adoption of .interactive class composition introduce a behavior change vs a pure refactor? Where would tokens not match exactly?"
5. **Vocab v2.0 gaps**: "What does cross_card_interaction_vocabulary.md NOT yet cover that would block its v1.0 to v2.0 promotion at CC4 close? List specific gaps in §1-§5 hover/active/focus/disabled/transitions and any explicit TODOs left in the doc."

---

## 8. Useful follow-up queries (run as needed)

- "Per-card audit: does each v3 card set `:host { font-size: 16px }` at top level (not inside @media)? Cite the line."
- "Inventory every hardcoded `border-radius` value across v3 cards by selector role. Group by role."
- "What is the canonical pattern for tile-vs-chip-vs-icon-bg radius based on existing card precedents?"
- "Which cards still consume the legacy profile system (selectProfileSize / resolveSizeProfile)? What CSS vars do they reference?"
- "What is the dependency graph between `INTERACTIVE_SURFACE`, `TILE_SURFACE`, `CTRL_SURFACE`, `DROPDOWN_MENU`, `REDUCED_MOTION`? Which export composes which?"
- "What does `nav_card.ensureGlobalOffsetsStyle()` do, why does it bypass shadow DOM, and how does CC migration interact with it?"
- "Which cards use `--shadow-up`, which use `--tile-shadow-lift`, and which use `--shadow` for the hover-lift visual? Are they semantically equivalent or do values differ?"
- "Map every `transition:` declaration in tunet_base.js to its consumers. Are any cards still using `transition: all`?"
- "What specific contract test in `interaction_source_contract.test.js` is loosest? Which pass would tighten it?"
- "Enumerate all `data-*` attribute conventions used across cards (data-accent, data-style, data-trend, data-interaction, data-state). Are any contradictory between cards?"

---

## 9. Source-of-truth precedence (when in doubt)

In order, highest authority first:

1. Live source files (`Dashboard/Tunet/Cards/v3/*.js`, `Dashboard/Tunet/Cards/v3/tests/*.js`)
2. `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` (binding interaction contract, v1.0)
3. `Dashboard/Tunet/Docs/cards_reference.md` (per-card config + editor architecture)
4. `Dashboard/Tunet/Docs/sections_layout_matrix.md` (CD4 grid contract)
5. `Dashboard/Tunet/Docs/visual_defect_ledger.md` (canonical defect status)
6. `cross_card_spec_layer_extraction_plan.md` (CC plan — the doc you're refining)
7. `cross_card_corpus_findings.md` (your findings + prior agent findings)
8. `tunet-architecture` claude-mem corpus (synthesized history; can be stale)

The corpus can claim something that's been changed since the date range — always verify against current source before locking a recommendation. Today's example: corpus says `INTERACTIVE_SURFACE` "planned but not implemented", but it WAS added in CD2 commit `7f98dec` on 2026-04-03 (verifiable in `tunet_base.js`). Trust source over corpus when they disagree.

---

## 10. When to STOP and ask the user

STOP and surface to the user (don't silently fix or expand):

- You find a defect outside CC scope (e.g., a card-runtime bug, a new cross-cutting rule that emerged today).
- A corpus answer contradicts a doc you don't own (vocabulary v1.0, sections matrix, cards reference). The contradiction needs the user's call.
- You find a prerequisite that's not in the plan §8 list and would block CC0 from starting cleanly.
- The corpus query you want to fire would benefit from a rebuild (new observations have likely landed since the last rebuild).
- Your refinement would change the migration order in §4, the validation gate in §5, or the pass scope in §6 — those are user-locked.
- The plan and findings doc disagree.

Use the STOP block format from the global protocol (CLAUDE.md):

```
═══════════════════════════════════════════════════════════════
STOP - <reason>
═══════════════════════════════════════════════════════════════
TRIGGER: <what triggered the stop>
RISK: <what could go wrong if we proceed>
REQUIRED USER DECISION: <specific question>
═══════════════════════════════════════════════════════════════
```

---

## 11. Operational notes

- The local `localhost:37777` service hosts both the viewer (HTML at `/`) and the API. If `/` returns HTML and `/api/observations` returns JSON, both layers are healthy.
- Rebuilding the corpus takes ~5 seconds. Priming takes ~10 seconds. Querying takes 30–120 seconds depending on question complexity.
- The corpus uses observations recorded over time — always check the date range in `list_corpora` (or `GET /api/observations` filtered by date). Rebuild if you suspect new observations are missing.
- Saved query answers in `cross_card_corpus_findings.md` are append-only. If a new answer supersedes an old one, ADD a new section dated today and reference the prior section as superseded — don't delete.
- The MCP `query_corpus` tool is functionally broken for substantive queries due to the 3s client timeout. Use the curl path. Don't burn time on the MCP tool.

---

## 12. References

- Plan being refined: `Dashboard/Tunet/Docs/plans/cross_card_spec_layer_extraction_plan.md`
- Findings (append-only): `Dashboard/Tunet/Docs/plans/cross_card_corpus_findings.md`
- Binding contract: `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` (v1.0 Active)
- Card-build guardrails: `Dashboard/Tunet/Cards/v3/CLAUDE.md`
- Visual defect ledger: `Dashboard/Tunet/Docs/visual_defect_ledger.md`
- Contract tests: `Dashboard/Tunet/Cards/v3/tests/interaction_source_contract.test.js`
- Test helpers: `Dashboard/Tunet/Cards/v3/tests/helpers/css_contract_helpers.js`
- claude-mem docs: <https://docs.claude-mem.ai/usage/knowledge-agents>

If you finish your task without writing to either the plan or the findings doc, you have not added value. Either propose a delta or capture a new finding. Otherwise, hand off the next agent and end your turn.
