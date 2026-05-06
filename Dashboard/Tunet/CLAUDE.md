# Tunet Dashboard Card Suite

This file should read similarly to `Dashboard/Tunet/AGENTS.md`.
If this file and `Dashboard/Tunet/AGENTS.md` ever disagree, follow `Dashboard/Tunet/AGENTS.md`.

## Active Program

**Consistency-driver card rehabilitation** — `~/.claude/plans/flickering-herding-wolf.md` is the sole execution authority (`CD0–CD12`).

Current detailed status plan: `~/.claude/plans/synthetic-dazzling-oasis.md` (active CD11 status authority under the master CD0-CD12 plan)
Current tranche: **CD11 — Status Multi-Mode Design and Runtime Pass** (narrow, status-only redesign/runtime pass; `CD10` nav verify intentionally deferred until room/surface composition is more settled)  
Previous tranches: `CD9` (Apr 6; selected-target audio routing, dropdown parity, visible speaker-tile semantics, speaker-grid phone fallback, and album-art resilience accepted), `CD8` (Apr 6; weather redesign accepted, climate/sensor narrowed healthy), `CD7` (Apr 6; card-level closeout only, room-page layout undecided), `CD6` (Apr 4), `CD5` (Apr 4), `CD4` (Apr 4), `CD3` (Apr 3), `CD2` (Apr 3), `CD1` (Apr 3), `CD0` (Apr 3)

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
11. `~/.claude/plans/synthetic-dazzling-oasis.md` for active `CD11` status work

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

- popup direction remains Browser Mod
- one-popup-per-room model remains active
- nav is dashboard chrome, not ordinary content composition
- status is explicitly reopened for the narrow `CD11` multi-mode redesign/runtime pass described in `~/.claude/plans/synthetic-dazzling-oasis.md`; full editor/synthesis expansion remains out of scope
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


<claude-mem-context>

</claude-mem-context>
