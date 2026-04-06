# CD7 Session Brief — Rooms Bespoke Pass

**For:** Next Claude Code session (no prior context)  
**Date:** 2026-04-04  
**Repo:** `/home/mac/HA/implementation_10` (branch: `main`, HEAD: `9fee4ed`)

---

## What This Project Is

A custom Home Assistant dashboard card suite called "Tunet" — 13 vanilla web component cards deployed to a live Home Assistant instance at `http://10.0.0.21:8123`. The suite uses shadow DOM, a shared base module (`tunet_base.js`), an esbuild bundler, and a YAML rehab dashboard for focused validation.

## Where We Are

A consistency-driver rehabilitation program (`CD0`-`CD12`) is moving the suite toward production-grade behavior. Shared passes are complete. `CD6` just closed the lighting bespoke pass. The next tranche is `CD7`.

| Completed | Tranche | What it did |
|-----------|---------|------------|
| Apr 3 | CD0 | Build architecture + rehab lab |
| Apr 3 | CD1 | Config/editor policy |
| Apr 3 | CD2 | Shared interaction adoption |
| Apr 3 | CD3 | Shared semantics adoption |
| Apr 4 | CD4 | Shared sizing + Sections adoption |
| Apr 4 | CD5 | Utility strip bespoke |
| Apr 4 | CD6 | Lighting bespoke |

**Current tranche:** `CD7 — Rooms Bespoke Pass`  
**Current test baseline:** do not trust this brief; rerun `npm test` at session start and treat that result as the authority.

## What CD7 Does

`CD7` is the bespoke pass for the rooms family. The primary target is:

- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`

This tranche exists because the rooms card still has unresolved room-overview-specific issues that are not shared-pass problems:

- row-mode phone density/truncation
- row-mode control proportionality, especially the power button versus orb buttons
- row/slim interaction ownership and stop-propagation correctness
- tile-mode versus row-mode contract clarity
- adaptive/manual-status and manual-reset behavior where applicable

This tranche is about fixing the rooms card as a room overview/navigation surface. It is **not** a proxy for room-detail lighting work; that belongs to `tunet-lighting-card` and was handled in `CD6`.

## Authority Stack

1. **Sole execution plan:** `~/.claude/plans/flickering-herding-wolf.md` — CD7 section
2. **Execution contract:** `Dashboard/Tunet/AGENTS.md`
3. **Per-card contract:** `Dashboard/Tunet/Docs/cards_reference.md`
4. **Visual defect backlog:** `Dashboard/Tunet/Docs/visual_defect_ledger.md`
5. **Control docs:** `plan.md`, `FIX_LEDGER.md`, `handoff.md`

If docs disagree, follow the precedence order in `Dashboard/Tunet/AGENTS.md` section 2 and record the conflict.

## This Brief's Purpose

This brief is not the implementation plan.

Its job is to force the next session to do a much deeper context build before proposing any code changes. The next session should use this brief to:

- orient quickly
- identify every file likely to be touched
- inspect every adjacent file needed to understand the rooms card holistically
- produce its own exhaustive CD7 plan only after that exploration is complete

Do **not** skip directly from this brief to code.

## First 20 Minutes

Before drafting a CD7 plan or making any edits:

1. Read:
   - `Dashboard/Tunet/AGENTS.md`
   - `Dashboard/Tunet/CLAUDE.md`
   - `plan.md`
   - `FIX_LEDGER.md`
   - `handoff.md`
   - `Dashboard/Tunet/Docs/cards_reference.md`
   - `Dashboard/Tunet/Docs/visual_defect_ledger.md`
   - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
   - `Dashboard/Tunet/Docs/legacy_key_precedence.md`
   - the `CD7` block in `~/.claude/plans/flickering-herding-wolf.md`
2. Run and inspect:
   - `git status --short`
   - `git rev-parse --short HEAD`
   - `npm test`
3. Verify the current live rehab paths:
   - `/tunet-card-rehab-yaml/lab`
   - `/tunet-card-rehab-yaml/phone-stress`
   - `/tunet-card-rehab-yaml/surfaces`
4. Only after that, start the rooms-specific exploration below.

## Exploration Mandate

The next session should perform an exhaustive file-by-file exploration before it writes the CD7 plan.

That exploration must include every file that is likely to be:

- edited
- consulted for behavior/contracts
- used for live validation
- updated for governance closeout

The point is not to skim. The point is to understand the rooms card in context: runtime behavior, authoring model, layout contracts, adaptive-lighting behavior, live validation surface, tests, and closing governance.

## Defect-Ledger Reconciliation Requirement

The next session must not treat `CD7` as a single-card bubble.

Before finalizing its CD7 plan, it must reconcile the normalized visual-defect ledger and produce an explicit accounting for every currently relevant gap:

- confirm which items are genuinely closed
- confirm which items remain open
- confirm which open items belong to `CD7`
- confirm which open items belong to another tranche and must stay there
- flag any stale or contradictory wording that would misroute future work

This is a verification task, not a mandate to reopen other tranches.

The goal is simple: after the next session’s context build, there should be no ambiguous “maybe this is still broken somewhere” residue in the normalized backlog. Every known gap should be either:

- closed with evidence
- active and owned by `CD7`
- active and explicitly owned by `CD8`
- active and explicitly owned by `CD9`
- active and explicitly owned by `CD10`
- active and explicitly owned by `CD11`
- or reclassified as composition-only/doc-only/stale

## Normalized Visual-Gap Ownership To Verify

The next session should use the normalized top section of `Dashboard/Tunet/Docs/visual_defect_ledger.md` as the starting authority and verify this ownership map during exploration:

### Already closed or narrowed

- `CD5`
  - `tunet-actions-card`: runtime overflow fix closed; remaining surface-composition notes should stay closed/narrowed
  - `tunet-scenes-card`: runtime healthy; wrap/header/doc contradictions already addressed
- `CD6`
  - `tunet-light-tile`: no active card-level runtime defect; keep atomic-detail role explicit
  - `tunet-lighting-card`: core layout defects closed; dense-name pressure stays in authoring/composition discipline

### Active by owning tranche

- `CD7`
  - `tunet-rooms-card`: row-mode phone density/truncation, control proportionality, and contract cleanup if still reproven
- `CD8`
  - `tunet-weather-card`: toggle-heavy phone density
  - `tunet-sensor-card`: naming-contract clarity
  - `tunet-climate-card`: composition caveats only unless live evidence contradicts that
- `CD9`
  - `tunet-media-card`: room-identity naming and group-membership semantics
  - `tunet-sonos-card`: source/dropdown width handling and speaker-strip overflow
  - `tunet-speaker-grid-card`: dense/default layout failure, not the compact 2-column case
- `CD10`
  - `tunet-nav-card`: desktop rail/sidebar coexistence and offset leakage
- `CD11`
  - `tunet-status-card`: 4-column phone density and dropdown/runtime quality

### Cross-cutting doc/backlog items to verify remain correctly routed

- icon-field editor consistency
- actions editor wording
- scenes `allow_wrap` wording
- sensor naming-contract wording
- status dropdown-confidence wording
- nav layout-reference overclaim

If the next session finds evidence that any of the above is wrongly classified, it should say so explicitly in the plan before coding.

## Files That Must Be Explored Before Planning

### A. Primary implementation file

Read the full file and build a behavioral map:

- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`

The next session should identify:

- render branches for `tiles`, `row`, and `slim`
- tap/hold/navigation ownership
- orb/power button event paths
- adaptive-lighting/manual-state detection
- manual-reset action path
- sizing methods (`getCardSize()`, `getGridOptions()`)
- ResizeObserver/profile hooks if present
- CSS tokens and mode-specific geometry

### B. Adjacent runtime files to inspect before deciding scope

These may or may not be edited, but they must be explored so CD7 decisions are grounded:

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`

Purpose of that exploration:

- confirm what should remain in shared base versus card-local
- compare control ownership patterns already accepted in lighting
- compare how atomic light controls differ from room overview controls
- avoid reopening CD6 or inventing a second interaction model

### C. Validation surfaces and config fixtures

Read every current rooms-card instance used for validation:

- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/tunet-suite-config.yaml`

The next session should locate:

- all `tunet-rooms-card` instances
- all `layout_variant` uses
- all room datasets that stress row/slim/tiles
- any explicit short-name authoring already in use
- any real popup/navigation config the card must preserve

### D. Tests to inventory before proposing CD7 work

Explore the entire test directory, then identify every test that already touches rooms behavior and every suite likely to need updates:

- `Dashboard/Tunet/Cards/v3/tests/`

At minimum, inspect:

- existing contract suites that reference `tunet-rooms-card`
- interaction suites
- sizing/Sections suites
- config/editor suites
- any bespoke suite patterns created in `CD5` and `CD6`

The next session should not assume a new bespoke suite is enough until it knows what shared suites already encode.

### E. Contract and backlog docs

Read the rooms-specific portions, not just the headlines:

- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/Docs/visual_defect_ledger.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- `Dashboard/Tunet/Docs/legacy_key_precedence.md`

The next session should explicitly extract:

- the intended whole-home role of `tunet-rooms-card`
- current runtime-vs-target interaction differences
- current open visual defect framing
- any doc contradictions that CD7 is expected to resolve
- any sizing assumptions that can constrain the implementation
- every normalized visual-gap entry that references `CD7`, and every non-`CD7` entry that might be mistaken for a rooms problem during implementation

### F. Governance files that will likely need closeout edits

Even before coding, read the current state of:

- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`
- `CLAUDE.md`
- `Dashboard/Tunet/CLAUDE.md`

Do this early so the next session knows what closure evidence CD7 will have to produce and which stale statements must be cleaned up when CD7 closes.

## Repo Search Guidance

Before proposing the CD7 plan, the next session should run targeted repo searches and inspect the results. At minimum search for:

- `tunet-rooms-card`
- `layout_variant`
- `manual_control`
- `adaptive_lighting.set_manual_control`
- `navigate_path`
- `hold_action`
- `stopPropagation`
- `row`
- `slim`
- `power button`
- `rooms row`

The purpose is to build a full adjacency map:

- where the rooms card is rendered
- where its current behavior is documented
- where similar interaction patterns already exist
- where governance/docs will need sync after the tranche
- where visual issues have already been assigned to non-`CD7` owners so they are not accidentally reopened

## What The Next Session Must Figure Out During Exploration

The next session should not arrive with answers. It should use the exploration to answer these:

1. What are the exact row-mode failure points at `390x844` in current live fixtures?
2. Is the disproportionate power button a current runtime regression, a stale doc claim, or a data/config artifact?
3. Is row-mode salvageable as a phone-viable variant, or should the plan treat `tiles/slim` as the phone default while row is narrowed to larger contexts?
4. How much of CD7 is runtime fix versus contract clarification?
5. What adaptive/manual indicator and reset behavior already exists in code, and what is merely assumed in docs?
6. Does tile-mode interaction actually need runtime change in CD7, or only clearer documentation and validation?
7. Which assertions belong in a new CD7 bespoke suite, and which belong in shared contract suites?
8. Which validation surfaces are authoritative for each defect: YAML rehab, storage suite, or both?
9. Which governance docs will require updates on close, and what exact evidence will they need?
10. Which entries in the normalized visual defect ledger need wording changes so that every remaining suite gap is clearly closed or owned by the correct tranche?

## Known CD7 Pressure Areas

These are starting hypotheses from the current docs and defect ledger. They are not substitutes for live exploration.

### Pressure Area 1 — Row mode at phone width

Current docs describe:

- single-letter or near-useless truncation
- unreadable status text
- tiny orbs
- disproportionate power button

The next session must prove which of these still reproduce live and under which room datasets.

It must also check whether the old “massive power button” framing is still a current runtime truth or merely a stale screenshot-era description.

### Pressure Area 2 — Interaction ownership

Current docs say:

- row/slim should be explicit-controls-first
- body tap navigates
- orb tap toggles the individual light
- power tap toggles the room
- tile mode still diverges from the target contract

The next session must map the exact current event behavior before proposing any contract change.

### Pressure Area 3 — Adaptive/manual state and reset behavior

Current docs and user feedback imply uncertainty around:

- manual-state indication
- adaptive dot / adaptive ownership visibility
- manual reset behavior

The next session must inspect code paths, validation fixtures, and live behavior before assuming this is a real runtime bug or a stale claim.

### Pressure Area 5 — Ledger integrity after CD6 close

The normalized ledger still contains some language from the just-completed CD6 window. The next session should verify that:

- closed CD5/CD6 items are described as closed, not “pending”
- active `CD7` issues are not diluted by stale `CD6` or pre-coherent-build wording
- the “remaining true P0 issues” list still maps cleanly to `CD7`, `CD9`, `CD10`, and `CD11`
- any room-adjacent issue that is really media/nav/status stays in its own tranche

### Pressure Area 4 — Sizing and mode-specific HA grid hints

Current docs already say `getCardSize()` is mode-aware but `getGridOptions()` is still too static. The next session should inspect whether CD7 should:

- tune HA sizing hints per mode
- leave hints stable and solve density entirely in-card
- or split the decision by `tiles` vs `row/slim`

## Planning Discipline For The Next Session

Only after the exploration above is complete should the next session write its own plan.

That plan should:

- name every file it intends to edit
- state every file it explored but does not plan to edit
- identify each real defect with its exact repro surface and breakpoint
- separate runtime fixes from doc cleanup
- separate implementation work from validation and deploy work
- identify stop conditions before coding begins

The plan should be exhaustive and tactical. It should not say "fix rooms card density" in the abstract. It should say exactly which branch, controls, breakpoints, fixtures, tests, and documents are in scope.

It should also include a one-line status for every normalized visual-gap family in the ledger:

- closed and verified
- not a `CD7` issue
- `CD7` in-scope
- or blocked on a different tranche/validation surface

## Non-Negotiable Scope Rules

- `CD7` owns the rooms family, not lighting, status, media, or navigation
- do not reopen `CD6` lighting work unless the rooms fix is truly blocked by a shared issue
- do not silently widen scope into `tunet_base.js`; only touch it if the exploration proves the rooms defect cannot be fixed card-locally
- do not turn CD7 into surface assembly or dashboard IA work
- do not invent a new rooms authoring model unless the existing one is proven inadequate and the authority docs leave no alternative

## Expected Write Set

The next session should assume the most likely write set is:

- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- one or more files under `Dashboard/Tunet/Cards/v3/tests/`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/Docs/visual_defect_ledger.md`
- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`
- `CLAUDE.md`
- `Dashboard/Tunet/CLAUDE.md`

But it must earn that write set through exploration. If the file map changes after inspection, the next session should say so explicitly.

## Validation Surfaces

The next session should assume the primary validation surfaces are:

- YAML rehab lab:
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/phone-stress`
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/surfaces`
- targeted storage/live verification where real entities are needed:
  - `tunet-suite-storage`

It should determine during exploration which defects require YAML-only validation versus live-entity validation.

## Verification Matrix The Next Session Should Produce

Before coding, the next session should assemble a compact verification matrix with one row per visual-gap family:

| Card / issue family | Current normalized owner | Still reproduces? | Validation surface | CD7 scope? | Notes |
|---------------------|--------------------------|-------------------|-------------------|-----------|-------|

Minimum families to account for:

- actions
- scenes
- light tile
- lighting
- rooms
- climate
- weather
- sensor
- status
- media
- sonos
- speaker-grid
- nav

This matrix is how the next session proves that every gap from the visual defects is either:

- already closed
- being handled in `CD7`
- or explicitly deferred to the correct later tranche

## Key Commands

```bash
git status --short
npm test
npm run tunet:build
npm run tunet:deploy:lab
```

Primary validation URLs:

- Lab: `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`
- Phone stress: `http://10.0.0.21:8123/tunet-card-rehab-yaml/phone-stress`
- Surfaces: `http://10.0.0.21:8123/tunet-card-rehab-yaml/surfaces`

## What Not To Do

- do not start coding before the exploration and plan are complete
- do not assume the defect ledger is perfectly current without verifying the live runtime
- do not use this brief as a replacement for reading the real target files
- do not treat rooms as a substitute for lighting-detail evaluation
- do not let one screenshot dictate the whole tranche without checking the actual fixture definitions
- do not collapse runtime defects, composition constraints, and doc contradictions into one vague task

## Required Output From The Next Session Before Coding

Before making any implementation edits, the next session should produce:

1. an exploration summary listing every file inspected
2. a defect map with exact repro surfaces and breakpoints
3. a proposed write set
4. a test strategy
5. a live-validation strategy
6. explicit stop conditions
7. a suite-wide visual-gap ownership matrix proving every normalized defect is either closed or routed to the proper CD section

In other words: the next session should do the deep context-building and planning work first, then implement `CD7`.
