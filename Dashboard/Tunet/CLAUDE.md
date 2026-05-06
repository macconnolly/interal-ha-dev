# Tunet Dashboard Card Suite

This file should read similarly to `Dashboard/Tunet/AGENTS.md`.
If this file and `Dashboard/Tunet/AGENTS.md` ever disagree, follow `Dashboard/Tunet/AGENTS.md`.

## Minimum Reading Path (start here, 5 questions → 5 files)

If you have zero context and need to start working immediately:

| Question | File to read |
|----------|--------------|
| What's the current state of the system? | `handoff.md` |
| What's next in the queue? | `plan.md` (Tranche Queue section) |
| What's the history of tranche X? | `Dashboard/Tunet/Docs/plans/archive/INDEX.md` → linked archive file |
| What's the contract for card X? | `Dashboard/Tunet/Docs/cards_reference.md` |
| What defects are open? | `Dashboard/Tunet/Docs/visual_defect_ledger.md` |

This file (`Dashboard/Tunet/CLAUDE.md`) is the **single authoritative governance home** — it owns the File Authority Map, Documentation Sync Protocol, Tranche Queue Rule, Plan Creation Protocol, Tranche Closure Protocol, Archive Read-Only Convention, and the Locked Direction Rules below. `Dashboard/Tunet/Docs/CLAUDE.md` only owns doc-folder-internal conventions. Do not put new governance into `Docs/CLAUDE.md`.

**Scope**: Tunet card suite only. The `tunet_inbox` integration backend uses its own triad at `custom_components/tunet_inbox/{plan,FIX_LEDGER,handoff}.md` and is governed separately. When the user says "sync the latest documentation," that means the Tunet card-suite triad at the project root (`plan.md`, `FIX_LEDGER.md`, `handoff.md`) plus the canonical docs under `Dashboard/Tunet/Docs/`.

## Active Program

**Consistency-driver card rehabilitation** — `~/.claude/plans/flickering-herding-wolf.md` is the sole execution authority (`CD0–CD12`).

Current tranche: **CD10 — Navigation Verify Pass** (verify `tunet_nav_card.js` after the rest of the cards are stable; verify-only by design — no new code unless a real failure is reproduced)  
Previous tranches: `CD9` (closed 2026-04-30; selected-target audio routing, media/sonos dropdown convergence, visible speaker-tile semantics, speaker-grid phone column fallback, dropdown-render bug fixes; keyboard a11y recorded as suite-wide deferred-by-policy), `CD8` (Apr 6; weather redesign accepted, climate/sensor narrowed healthy), `CD7` (Apr 6; card-level closeout only, room-page layout undecided), `CD6` (Apr 4), `CD5` (Apr 4), `CD4` (Apr 4), `CD3` (Apr 3), `CD2` (Apr 3), `CD1` (Apr 3), `CD0` (Apr 3)

Execution order remains:
- `CD0` build/lab
- `CD1` config/editor policy
- `CD2` interaction
- `CD3` semantics
- `CD4` sizing/Sections
- `CD5–CD11` bespoke passes
- `CD12` surface assembly

Surface assembly resumes only after the card suite is stable enough to compose deliberately.

## Mandatory Review Pack

Use the same review order as `Dashboard/Tunet/AGENTS.md`:

1. `Dashboard/Tunet/Mockups/design_language.md`
2. `Dashboard/Tunet/CLAUDE.md`
3. `plan.md`
4. `FIX_LEDGER.md`
5. `handoff.md`
6. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
7. `Dashboard/Tunet/design.md`
8. `Dashboard/Tunet/Docs/cards_reference.md`
9. `Dashboard/Tunet/Docs/legacy_key_precedence.md`
10. `~/.claude/plans/flickering-herding-wolf.md`

## Design / Execution Precedence

Use this precedence when Tunet docs disagree:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. `Dashboard/Tunet/Docs/cards_reference.md`
5. `Dashboard/Tunet/Docs/legacy_key_precedence.md`
6. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
7. `Dashboard/Tunet/Mockups/design_language.md`
8. `Dashboard/Tunet/design.md`
9. `Dashboard/Tunet/CLAUDE.md`
10. other docs under `Dashboard/Tunet/Docs/`

Do not silently resolve contradictions. Make the conflict and chosen interpretation explicit.

## Documentation Authority

Follow the precedence order in `Dashboard/Tunet/AGENTS.md` section 2.

## Locked Direction Rules

Keep these direction locks explicit:

- **popup direction is Bubble Card 3.2-beta.1** (canonical for in-card composition popups). Three Bubble display modes: Adaptive (fit content) — preferred default; Dialog (centered) — modal-style; Adaptive dialog — hybrid centered with mobile bottom-offset support. Browser Mod retained only for full-page modals if explicitly required. **Superseded 2026-05-04**: previous "popup direction remains Browser Mod" lock no longer drives new work — see `Dashboard/Tunet/Docs/visual_defect_ledger.md` Global cross-cutting architecture decision 2026-05-04.
- **room composition uses dedicated subview pages, not popups** (per cards_reference.md §3 Option A: tile tap = toggle room lights, hold = navigate to dedicated room subview). **Superseded 2026-05-04**: previous "one-popup-per-room model remains active" lock no longer drives new work.
- nav is dashboard chrome, not ordinary content composition
- status remains `G3S/CD11` bugfix-only unless explicitly reopened *(scope expanded 2026-05-04 to broad visual rehab — see ledger §9)*
- actions remains `yaml-first`
- real HA Sections dashboard only; no layout hacks
- Sections reasoning remains page → section → card, not viewport-first shortcuts

Whole-home architecture locks:
- `tunet-rooms-card` = overview/navigation
- `tunet-lighting-card` = canonical room-detail light-control surface
- `tunet-light-tile` = atomic detail tile, not overview
- `tunet-nav-card` = chrome, not normal content composition

## Sections Grid Model

- view-level columns are determined by available content width, `max_columns`, and HA sidebar state
- effective section grid = `12 × effective section column_span`
- `columns: 'full'` spans full section width; numeric `columns` are relative to the effective internal grid
- `getGridOptions()` supplies defaults only
- YAML/UI `grid_options` owns context-specific sizing

Do not treat pixel height math as the primary model.

## Interaction Contract

See `Dashboard/Tunet/Docs/cards_reference.md` §Interaction Model Contract.

Suite target contract:
- control tiles: tap toggle/select, hold-to-drag adjust value
- navigation tiles: tap navigate, hold popup
- dedicated controls: immediate drag
- action chips: tap only

Current card-level divergences from that target must be documented in `cards_reference.md` and classified in `visual_defect_ledger.md`, not hidden in ad hoc prose.

## Validation / Workflow

- validation breakpoints remain locked:
  - `390×844`
  - `768×1024`
  - `1024×1366`
  - `1440×900`
- use the rehab lab as the primary validation surface during card rehab
- keep one active tranche at a time
- do not widen scope opportunistically
- after meaningful behavior/priority/doc changes, sync:
  - `plan.md`
  - `FIX_LEDGER.md`
  - `handoff.md`

## Build / Deploy

- `npm run tunet:build`
- `npm run tunet:deploy:lab`
- `npm test`
- Lab dashboard:
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`

## Profile Contract Status

The old profile resolver contract is superseded as policy.
Existing profile-era code may still remain in current runtime on some cards; treat that as implementation reality, not as the forward normative contract by itself.

## Quality Bar

- centralized tokens and shared primitives belong in `Dashboard/Tunet/Cards/v3/tunet_base.js`
- card-local overrides must be minimal and justified
- climate remains the measured visual baseline
- docs must tell the truth before new code is added

## Architecture / Planning Work

For tranche planning and multi-agent execution:
- `.claude/skills/tunet-agent-driver/SKILL.md`
- `Dashboard/Tunet/Docs/agent_driver_pack.md`

Control docs to keep synced after meaningful changes:
- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`

## File Authority Map (locked 2026-05-04)

The single ground-truth table for each governance file: its role, its edit policy, and how content moves through it.

| File | Role | Edit policy | When to read |
|------|------|-------------|--------------|
| `Dashboard/Tunet/Docs/visual_defect_ledger.md` | Primary defect record + cross-cutting architecture-decision log | Append per-card; prepend Global cross-cutting bullets (newest at top) | When defects, decisions, or open work need code-grounded record |
| `Dashboard/Tunet/Docs/cards_reference.md` | Per-card config + interaction contract | Edit per-card section in place when contract changes | When you need a card's authoring/runtime/synthesizer model or interaction contract |
| `Dashboard/Tunet/Docs/sections_layout_matrix.md` | Sections sizing model + per-card grid options | Edit in place | When grid options or sections behavior changes |
| `Dashboard/Tunet/Mockups/design_language.md` | Design + profile contract baseline (v9.0) | Edit in place; mark superseded language explicitly | When design tokens or visual contracts change |
| `Dashboard/Tunet/design.md` | Doc index | Edit in place | When canonical sources or precedence changes |
| `Dashboard/Tunet/CLAUDE.md` *(this file)* | **Single authoritative governance home** | Edit in place; mark superseded language explicitly | When governance rules change |
| `Dashboard/Tunet/Docs/CLAUDE.md` | Doc-folder-internal conventions only | Edit in place; do NOT add governance here | When doc-folder routing or naming conventions change |
| `plan.md` *(project root)* | Tranche Queue + latest session delta | Latest delta at TOP; older deltas archive when tranche closes | When you need "what's next" or the most recent session's decisions |
| `FIX_LEDGER.md` *(project root)* | Running list of completed code fixes | Newest fix entries at TOP (reverse-chronological — locked 2026-05-04) | When you need "what was fixed and when" |
| `handoff.md` *(project root)* | Current-state snapshot for next session | Edited in place — NOT appended; overwrite per session with diff summary at top | When you start a new session and need the system snapshot |
| `Dashboard/Tunet/Docs/plans/archive/<family>/plan_archive_<tranche>_*.md` | Per-tranche historical record | **Read-only after creation** | When you need historical context for a specific tranche |
| `Dashboard/Tunet/Docs/plans/archive/INDEX.md` | Chronological + by-family index of archives | Append new entry when a tranche archive is created | When you need to find a tranche's archive file |
| `~/.claude/plans/[adjective-verb-ing-noun].md` | Claude planning mode artifacts (original plan-of-record) | **Immutable post-adoption** — created during Claude planning mode; copied into `plan.md` when adopted | When you need the original plan-of-record (rare; `plan.md` Tranche Queue is canonical for execution) |

**Authority resolution rule** (when files conflict):
- For **execution order or status**: `plan.md` Tranche Queue wins.
- For **original scope intent**: `~/.claude/plans/[adopted plan].md` wins.
- For **per-card contract**: `cards_reference.md` wins.
- For **defects + architecture decisions**: `visual_defect_ledger.md` wins.
- For **governance rules**: this file (`Dashboard/Tunet/CLAUDE.md`) wins.

## Documentation Sync Protocol (locked 2026-05-04)

When the user says **"sync the latest documentation according to governance docs"** — or any equivalent — execute these steps in this exact order. Each step has documented input (what triggers it) and output (what the file looks like after).

| # | Step | Input (trigger) | Output (post-state) |
|---|------|-----------------|---------------------|
| 1 | Update `Dashboard/Tunet/Docs/visual_defect_ledger.md` | New defects discovered or architecture decisions locked this session | Per-card sections updated with code-grounded entries; Global cross-cutting bullets prepended for new architecture decisions |
| 2 | Update `Dashboard/Tunet/Docs/cards_reference.md` | A card's interaction or authoring contract changed this session | Per-card section edited in place; old wording explicitly marked superseded with date |
| 3 | Update `Dashboard/Tunet/CLAUDE.md` *(this file)* | A locked direction rule changed this session | Locked Direction Rules section updated; superseded language marked with date |
| 4 | Prepend new session delta to `plan.md` | Any session producing decisions, defects, or work | New `## Latest Session Delta — YYYY-MM-DD` section inserted immediately above the previous one; "Last updated" line updated |
| 5 | Prepend new fix entries to `FIX_LEDGER.md` | Any code fix shipped this session | New `## Session Delta — YYYY-MM-DD` block inserted at TOP, immediately below the header + append rule. Reverse-chronological order is the contract |
| 6 | Overwrite `handoff.md` Current State section | Always (handoff is current-state, not historical) | "Current State" section reflects the post-session reality; "Last Updated" diff block at top lists 3 bullets summarizing what changed this session |

If a step has no input (e.g., no card contract changed), skip it — don't create empty entries.

## Tranche Queue Rule

`plan.md` is the **single source of truth** for upcoming Tunet card-suite tranches. The "Tranche Queue" section at the top of `plan.md` lists all upcoming work in priority order. **No other file may queue tranches.**

When the user asks "what's next?" — read `plan.md` Tranche Queue, top to bottom.

## Plan Creation Protocol

Plans created in Claude planning mode go to `~/.claude/plans/[adjective-verb-ing-noun].md` (Claude Code's automatic naming). When the plan is adopted:
1. The relevant content is **copied** into `plan.md` (which becomes the local execution authority).
2. The original `~/.claude/plans/[name].md` file remains as historical reference only — it is **NOT** the source of truth for active work.
3. The `~/.claude/plans/[name].md` file is **immutable post-adoption**: do not edit it; instead, evolve `plan.md` Tranche Queue and Architecture Decisions Log.

## Tranche Closure Protocol

When a tranche closes:
1. Confirm fixes are recorded at the **top** of `FIX_LEDGER.md` (reverse-chronological).
2. **Move** all session deltas for that tranche from `plan.md` to a new file:  
   `Dashboard/Tunet/Docs/plans/archive/<family>/plan_archive_<tranche_id>_<short_name>_<date_range>.md`  
   Family folders: `CD/`, `CC/`, `SA/`, `TI/`, `T011A/`, plus additional family folders as new families emerge.
3. Run a synthesis subagent on the new file. Schema: period / status / scope / what we did / why we did it / files touched / key decisions / entry points / deferred work / superseded by / related claude-mem observations. Synthesis must be code-grounded (no fluff, cite file paths and dates from the deltas).
4. Add the new archive entry to `Dashboard/Tunet/Docs/plans/archive/INDEX.md` (chronological + by-family).
5. Update `plan.md` Tranche Queue to remove the closed tranche.
6. Update `Dashboard/Tunet/CLAUDE.md` Active Program section if active tranche advanced.

If a tranche **reopens**:
- Do NOT edit the existing archive file (read-only convention).
- Add a new "Reopened" entry inline in `plan.md` Tranche Queue and `visual_defect_ledger.md`.
- When the reopen closes, write a NEW archive file: `archive/<family>/plan_archive_<tranche_id>_reopen<N>_<date_range>.md`.
- Cross-link the original and reopen archives in their `Superseded by` / `Reopened by` sections.

**Verification step (mandatory)**: before marking a tranche closure complete, sum the line counts of the new archive file(s) plus the retained `plan.md` content and confirm it equals the pre-closure `plan.md` line count (within ±5 lines for synthesis additions). Tag the pre-closure state with a git tag (`tunet-docs-pre-<tranche_id>-closure`) so the move is reversible.

## Archive Read-Only Convention

Files under `Dashboard/Tunet/Docs/plans/archive/` are **read-only after creation**. They preserve the historical record verbatim. Do not edit archive files; if a historical record needs correction, add a footnote with the correction date — do not rewrite history.

The `INDEX.md` at the archive root is the only mutable archive file — append new entries as tranche archives are created, but do not edit existing entries.

## Discoverability Quick-Reference (mirror of Minimum Reading Path)

| You need... | Read this |
|-------------|-----------|
| Current state | `handoff.md` |
| Next work | `plan.md` Tranche Queue |
| History of tranche X | `Dashboard/Tunet/Docs/plans/archive/INDEX.md` → linked archive file |
| Card config + interaction contract | `Dashboard/Tunet/Docs/cards_reference.md` |
| Open defects + architecture decisions | `Dashboard/Tunet/Docs/visual_defect_ledger.md` |
| Completed fixes (reverse-chronological) | `FIX_LEDGER.md` |
| Original plan-of-record (immutable) | `~/.claude/plans/[adopted name].md` |
| Sections sizing model | `Dashboard/Tunet/Docs/sections_layout_matrix.md` |
| Design tokens + profile contracts | `Dashboard/Tunet/Mockups/design_language.md` (v9.0) |
| File-by-file edit policy | this file's "File Authority Map" section above |


<claude-mem-context>

</claude-mem-context>
