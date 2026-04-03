# AGENTS.md (Dashboard/Tunet Scope)

Applies to all files under `Dashboard/Tunet/**`.

This file is the Codex execution contract for Tunet work.  
When in doubt: prioritize correctness, consistency, and docs-sync over speed.

Current active program order:
- foundation
- build/lab
- card families
- surfaces

The old surface-first order is not the active implementation sequence right now.
It becomes active again only when the plan reaches the final surface-assembly phase.

## 1) Mandatory Review Pack (Read First, In Order)

Before implementing any Tunet change, read:

1. `Dashboard/Tunet/Mockups/design_language.md`
2. `Dashboard/Tunet/CLAUDE.md`
3. `plan.md`
4. `FIX_LEDGER.md`
5. `handoff.md`
6. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
7. `Dashboard/Tunet/design.md`
8. `Dashboard/Tunet/Docs/cards_reference.md` (per-card config contract + editor architecture)
9. `Dashboard/Tunet/Docs/legacy_key_precedence.md` (setConfig overlap/fallback rules)

Important:
- Treat `sections_layout_matrix.md` as provisional until sections research + live tuning loop is completed and documented.
- Treat `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` as historical reference only unless explicitly re-activated.
- For profile/unification work, also read:
  - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` (historical profile architecture — profile resolver contract is superseded as policy; see CLAUDE.md for current auto-size + CSS tile-size variant contract)
  - `Dashboard/Tunet/Agent-Reviews/start.md` (execution start guide)
- For the active execution plan, read:
  - `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md` (method-level authority, line-anchored, per-card, per-pass)
  - `.claude/plans/ethereal-zooming-cherny.md` (program-level framing)
- For build and deploy:
  - `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` (build pipeline, deploy scripts, lab URL)

## 2) Design/Execution Precedence

Use this precedence when files disagree:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. `Dashboard/Tunet/Docs/cards_reference.md` (per-card config contract + editor architecture)
5. `Dashboard/Tunet/Docs/legacy_key_precedence.md` (setConfig overlap/fallback rules)
6. `Dashboard/Tunet/Docs/sections_layout_matrix.md` (provisional)
7. `Dashboard/Tunet/Mockups/design_language.md`
8. `Dashboard/Tunet/design.md`
9. `Dashboard/Tunet/CLAUDE.md`
10. Other docs in `Dashboard/Tunet/Docs/` (reference/historical unless explicitly active)

Do not silently resolve contradictions. Record the conflict and chosen interpretation in your update.

## 3) Locked Direction Rules

- Keep decision order intact:
  1. NAV
  2. POPUP
  3. Integrated UI/UX
  4. HOME LAYOUT
- Popup direction remains locked to Browser Mod.
- Popup triggers on card interactions should be browser-scoped (`fire-dom-event`) unless an explicit exception is requested.
- One-popup-per-room model remains active.
- Interaction supersession lock: room-card global `tap-toggle / hold-popup` language is historical. Active contract is card-body primary route action with explicit controls owning toggles.
- `layout-card` is allowed and encouraged for breakpoint-specific compositions (example: desktop rooms tiles vs mobile rooms row).
- Prefer Home Assistant `2026.3` UI configuration capabilities wherever practical before YAML-only solutions.
- Status card scope is locked to G3S bugfix-only (no new features or editor work).
- Actions card remains YAML-driven until backend status/entity mapping work is completed.
- Build system migration (esbuild bundling) is part of the early foundation sequence in the active plan; do not defer it behind Living Room surface assembly.

## 4) Workflow / Scope Discipline

- Use one active tranche at a time.
- Keep each tranche tight and testable (usually 1-3 files when possible).
- No opportunistic refactors outside tranche scope.
- If a blocker requires widening scope, stop and document blocker + options.

### 4A) Card Rehab Rule (Active Before Surface Assembly)

During card rehabilitation tranches:

- use the dedicated card rehab lab (`http://10.0.0.21:8123/tunet-overview/card-rehab-lab`) as the primary validation surface
- architecture reference YAML: `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- use `tunet-suite-storage` only for targeted live verification of the touched card(s)
- do not treat `Dashboard/Tunet/Docs/surfaces/*.md` as active implementation drivers
- do not widen a tranche beyond the exact card files named in the active plan
- do not resume room-page or whole-dashboard composition until the active plan explicitly enters surface assembly

## 5) Required Docs Sync After Any Meaningful Change

If behavior, architecture, or priorities changed, update these in the same session:

- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`

At minimum, update status, file paths, acceptance checks, and remaining work.

## 6) Validation Requirements

Before claiming completion:

- Run syntax checks for changed JS files:
  - `node --check <file>`
- Parse-check changed YAML:
  - `python3` + `yaml.safe_load`
- Validate behavior against explicit acceptance checks from `plan.md`/`handoff.md`.
- For UI issues, include exact repro path and observed result.
- Validate at locked breakpoints: 390×844 (mobile), 768×1024 (tablet), 1024×1366 (laptop), 1440×900 (desktop).

## 7) Sections Layout Research Requirement

There is a known gap in Sections layout mastery.

Required approach:
- Perform deep internet research (current HA behavior/best practices, primary sources).
- Execute live iterative tuning with the user:
  - user sets/observes values
  - agent captures outcomes
  - update `Dashboard/Tunet/Docs/sections_layout_matrix.md` with validated rules.

### Sections Sizing Model (Non-Negotiable)

The Sections dashboard sizing model is **not pixel-based**.

Do not reason about layout using pixel heights or viewport math as the primary model.
Home Assistant Sections use a 3-tier abstraction:

1. Page level: `max_columns` (cap on section columns across the view)
2. Section level: `column_span` / `row_span` (how many page columns a section occupies)
3. Card level: `getGridOptions()` returning columns out of `12 * section_span` internal grid columns

Correct layout reasoning must use these abstract units.
Example: a `column_span: 3` section in a `max_columns: 4` view gets `36` internal grid columns (`12 × 3`).
Cards inside that section declare how many of those `36` columns they consume.

## 7A) Centralized Styling System (Non-Negotiable)

Tunet v2 styling must remain centralized.

Primary style system:
- `Dashboard/Tunet/Cards/v3/tunet_base.js` (v3 is sole implementation authority since Mar 14, 2026)

Rules:
- Shared visual language (tokens, surfaces, density, shadows, radii, typography baselines, control sizing) must be defined in `tunet_base.js` (v3 only).
- Card files should consume shared tokens/surfaces first, then add minimal card-specific overrides.
- Do not use `Cards/v2/` as a style source — v2 is historical reference only.
- Do not introduce isolated per-card style systems that duplicate or fork base semantics unless explicitly approved and documented as an exception.
- If a visual issue appears across multiple card families, investigate/fix base-layer primitives first before patching individual cards.
- Any intentional card-local exception must be documented in `handoff.md` with rationale and impacted breakpoints.

## 7B) Sections Design Workflow (Mandatory for Final Dashboard)

The final dashboard must be designed deliberately view-by-view, not by incremental span tweaks.

Workflow:
1. Page-level intent:
   - Define what appears first, and what is hero vs companion vs support.
   - Set `max_columns`/`dense_section_placement` for that page.
2. Section-level composition:
   - Assign `column_span`/`row_span` per section according to page intent.
   - Decide where full-width sections are required vs side-by-side sections.
3. Card-level placement/sizing:
   - Set per-card `grid_options` (and only then tune card internals).
   - Explicitly decide where two cards share a row vs one card takes full section width.
4. Interaction-first validation:
   - Verify first-touch actions and scan order at phone/tablet/desktop.
5. Record outcomes:
   - Update `Dashboard/Tunet/Docs/sections_layout_matrix.md` and `handoff.md` with concrete per-view decisions.

## 7C) Surface-By-Surface Standardization Program (Required)

This sequence governs the later surface-assembly phase.
It is not the active implementation order during card rehabilitation tranches.

When the active plan re-enters surface work, do not attempt global dashboard polish in one pass.
Use this sequence and complete each surface fully before moving to the next:

1. Room page (single room)
2. Matching room popup
3. Overview page
4. Media page
5. Remaining room pages (apply locked template + room-specific deltas)

For each surface, run this loop:
1. Design:
   - define hero/companion/support sections
   - define interaction contract (tap/hold/sub-controls)
   - define page/section/card sizing (`max_columns`, `column_span`, `grid_options`)
2. Implement:
   - apply config/code for that surface only
3. Live test:
   - phone/tablet/desktop checks with user feedback
4. Iterate:
   - tune spans/placement/tokens based on observed behavior
5. Lock:
   - mark the surface “locked template” in `handoff.md`
   - record reusable rules in `sections_layout_matrix.md`

Constraint:
- At most one active surface in-flight at a time.
- Do not start the next surface until the current one is validated and documented.

## 8) Card Parameter Documentation Requirement

There is a required backlog item for complete custom-card parameter documentation.

Target deliverable:
- `Dashboard/Tunet/Docs/cards_reference.md`

Coverage expectation:
- every Tunet custom card
- every parameter
- type, default, accepted values, examples, caveats
- UI editor notes (`getConfigForm`/UI config limitations) where relevant

## 9) Safety / Environment Rules

- Use the single project worktree:
  - `/home/mac/HA/implementation_10`
- Do not create additional worktrees unless user explicitly requests it.
- Do not use destructive git commands unless user explicitly requests it.
- Do not revert unrelated local changes.

## 10) Practical Working Notes

- Keep implementation and docs aligned with `handoff.md` Issue Matrix.
- If issue scope is unclear, add a precise issue entry first (where/repro/current/desired/root cause), then implement.
- Prefer solutions that are robust in both desktop and mobile sections layouts.
