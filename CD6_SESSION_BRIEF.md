# CD6 Session Brief — Lighting Bespoke Pass

**For:** Next Claude Code session (no prior context)  
**Date:** 2026-04-04  
**Repo:** `/home/mac/HA/implementation_10` (branch: `main`, HEAD: `9ddd005`)

---

## What This Project Is

A custom Home Assistant dashboard card suite called "Tunet" — 13 vanilla web component cards (no LitElement, no React) deployed to a live HA instance at `http://10.0.0.21:8123`. The cards use shadow DOM, a shared base module (`tunet_base.js`), and an esbuild bundler.

## Where We Are

A consistency-driver rehabilitation program (CD0–CD12) is bringing these cards to production quality. **CD0–CD5 are complete or closing.** We are now in the bespoke pass sequence where each tranche focuses on one card family and its live defects.

| Completed | Tranche | What it did |
|-----------|---------|------------|
| Apr 3 | CD0 | Build architecture + rehab lab |
| Apr 3 | CD1 | Config editors (object+fields+multiple across 7 cards) |
| Apr 3 | CD2 | Interaction CSS: hover guards, press tokens, focus-visible, transitions |
| Apr 3 | CD3 | Keyboard semantics: bindButtonActivation, role/tabindex |
| Apr 4 | CD4 | Sections sizing contract: rows:'auto' universal, scenes allow_wrap:true |
| Apr 4 | CD5 | Utility strip bespoke: actions/scenes sizing + semantics + YAML rehab validation |

**Current test suite:** re-run `npm test` at session start and treat that output as the authority. Post-CD5 repo state should include the new utility-strip bespoke suite and the tightened Sections sizing suite. Do not copy stale counts from older docs.

## What CD6 Does

**CD6 is the lighting bespoke pass.** It covers only two cards:
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js` — atomic single-light tile
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` — room/detail lighting control surface

This tranche exists because the lighting family still has the most meaningful card-level layout and interaction pressure in the suite, especially on phone and tablet widths.

## Authority Stack

1. **Sole execution plan:** `~/.claude/plans/flickering-herding-wolf.md` — CD6 section
2. **Execution contract:** `Dashboard/Tunet/AGENTS.md`
3. **Per-card contracts:** `Dashboard/Tunet/Docs/cards_reference.md`
4. **Visual defect backlog:** `Dashboard/Tunet/Docs/visual_defect_ledger.md`
5. **Control docs:** `plan.md`, `FIX_LEDGER.md`, `handoff.md`

If docs disagree, follow the precedence order in `Dashboard/Tunet/AGENTS.md` section 2.

## First 15 Minutes

Do these before making any edits:

1. Read:
   - `Dashboard/Tunet/AGENTS.md`
   - `plan.md`
   - `FIX_LEDGER.md`
   - `handoff.md`
   - `Dashboard/Tunet/Docs/cards_reference.md`
   - `Dashboard/Tunet/Docs/visual_defect_ledger.md`
   - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
   - the CD6 block in `~/.claude/plans/flickering-herding-wolf.md`
2. Check for an already-dirty worktree with `git status --short` and inspect any existing edits in the two CD6 target files before changing them.
3. Re-run `npm test` and treat that output as the test-count authority for the session.
4. Open the YAML rehab dashboard first, not the storage rehab dashboard.
5. Reproduce the two real CD6 failures before editing:
   - grid dead-space / width cap
   - scroll-mode left-edge clipping

## Must Verify Live State

Before trusting any statement in this brief, the next session must verify:

- current branch + HEAD commit
- current `git status --short`
- current total test count from `npm test`
- current Lovelace resource URLs and `?v=` tokens for:
  - `tunet_light_tile.js`
  - `tunet_lighting_card.js`
- current YAML rehab dashboard paths:
  - `/tunet-card-rehab-yaml/lab`
  - `/tunet-card-rehab-yaml/phone-stress`
  - `/tunet-card-rehab-yaml/surfaces`
- whether the target files already contain in-flight CD6 edits

If any of those differ from this brief, prefer live repo/HA state and update the working notes accordingly.

## How To Use This Brief

This brief is an orientation layer, not the execution authority.

The next session must:
- read the actual CD6 block in `~/.claude/plans/flickering-herding-wolf.md`
- inspect the live target files directly
- build its own line-level understanding of the tranche from the current repo state
- treat any line anchors in this brief as helpful starting points, not immutable truth
- avoid making new product, layout, or contract decisions on its own
- avoid filling gaps with assumptions when the answer can be discovered from the repo, tests, live dashboard, or existing docs
- make unknowns explicit and verify them before changing behavior

If the brief and the live code disagree, the implementer must follow the live code plus the authority order in `Dashboard/Tunet/AGENTS.md`, then record the discrepancy.

## Decision Discipline

The next session is not authorized to invent new direction for CD6.

That means:
- do not choose a new lighting IA direction
- do not introduce a new authoring/config model
- do not silently reinterpret card purpose
- do not “improve” unrelated visuals because they seem nearby
- do not assume a defect is solved by a prettier layout if the live repro and tests do not prove it

Allowed decisions are limited to implementation details needed to satisfy the already-owned CD6 defects.

If a real decision point appears, the next session must:
1. prove it is not already answered by the plan, repo, docs, or live runtime
2. keep scope as narrow as possible
3. document the decision and why it was unavoidable

## Non-Negotiable Scope

- CD6 owns `tunet_light_tile.js` and `tunet_lighting_card.js`.
- YAML harness and tests may be updated only to support deterministic CD6 validation.
- Do not reopen:
  - actions/scenes from CD5
  - rooms from CD7
  - status from CD11
  - home/dashboard IA from CD12
- Do not turn this tranche into a whole-dashboard redesign. Fix the lighting family as a card-level contract.

## Execution Model: Iterative, Not One-Shot

CD6 should be run as a live iterative repair loop:

1. reproduce one concrete lighting defect
2. encode the expected behavior in a targeted test
3. make the smallest possible code change
4. run targeted tests
5. validate in the YAML rehab dashboard at the relevant breakpoint
6. capture what changed before moving to the next defect

Do not batch multiple speculative lighting fixes together before validating the first one. This tranche is hard enough that “one big patch” is likely to hide regressions.

## Exact Repro Matrix

Use this matrix to avoid vague “lighting still looks bad” work.

### Defect 1 — Light Tile Horizontal Truncation

- Card: `tunet-light-tile`
- Primary surface: YAML rehab `lab`
- Primary breakpoint: `390×844`
- Repro target:
  - horizontal variant tiles with longer friendly names
- Failure to look for:
  - label truncation that makes the tile materially harder to scan
  - value text or progress region pushing the name into unusable width
- Acceptance look:
  - horizontal tile remains readable at phone width without regressing drag/toggle behavior

### Defect 2 — Lighting Grid Dead Space / Width Cap

- Card: `tunet-lighting-card`
- Primary surfaces:
  - YAML rehab `lab`
  - YAML rehab `surfaces`
- Primary breakpoints:
  - `390×844`
  - `768×1024`
  - `1440×900`
- Repro target:
  - grid layout cards using multiple zones
- Failure to look for:
  - tiles capped to a narrow width with stranded side gutters
  - centered tile rows that do not fill the available detail-surface width
- Acceptance look:
  - tiles expand to use the available row width while preserving drag headroom and tile readability

### Defect 3 — Lighting Scroll Left-Edge Clipping

- Card: `tunet-lighting-card`
- Primary surface: YAML rehab `lab`
- Primary breakpoints:
  - `390×844`
  - `768×1024`
- Repro target:
  - scroll layout cards with at least two visible rows / multiple pages
- Failure to look for:
  - leftmost tile cut off even when scrolled all the way to the start
  - clip fix that breaks drag or snap behavior
- Acceptance look:
  - first tile is fully visible at scroll start and drag still behaves correctly

### Defect 4 — Lighting Info Tile Keyboard Completeness

- Card: `tunet-lighting-card`
- Primary surface: YAML rehab `lab`
- Breakpoints:
  - any, but verify at `390×844` and desktop
- Repro target:
  - header info tile
- Failure to look for:
  - visual button semantics without full activation behavior
  - keyboard reachability regressions after layout changes
- Acceptance look:
  - focusable, clearly activatable, and still visually identical in role

## CD6 Required Work

### tunet_light_tile.js

**Open runtime defect:** horizontal-variant truncation on phone is still the one real light-tile polish issue. This card is otherwise relatively healthy and should remain narrowly scoped.

**Current anchors:**
- `getCardSize()`: line 471
- `getGridOptions()`: line 476
- `_applyProfile()`: line 537
- `_setupResizeObserver()`: line 565
- horizontal DOM branch: lines 662-675
- `_updateTileUI()`: line 721
- drag setup: lines 753-803
- `_handleKeyDown()`: line 816
- `getConfigForm()`: line 878

**Required:**
1. Preserve the existing drag-to-dim semantics and keyboard behavior.
2. Keep the tile scoped as an atomic detail tile, not an overview surface.
3. Fix horizontal-variant narrow-width truncation without widening into a redesign.
4. Re-verify profile-driven sizing behavior after any layout change.
5. Update the `cards_reference.md` light-tile entry if the runtime contract becomes more explicit.

### tunet_lighting_card.js

**Open runtime defect:** this is still the worst active layout card in the suite. Scroll clipping, fixed-width grid caps, dead-space margins, and poor phone/tablet adaptation are real card-level defects.

**Current anchors:**
- info tile markup: lines 736-745
- `getGridOptions()`: line 994
- `_applyProfile()`: line 1035
- `_setupResizeObserver()`: line 1152
- `_buildGrid()`: line 1230
- visible-tile limiter: lines 1259-1265
- `_setupListeners()`: line 1332
- tile keyboard handler: lines 1360-1376
- `_initTileDrag()`: line 1397
- `_updateTileUI()`: line 1712

**Known pressure points from docs/backlog:**
- `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` creates fixed-width caps and dead space
- centered justification leaves stranded margins instead of filling available section width
- scroll mode clips tiles at the left edge
- `3` columns at `390px` is not an acceptable detail-surface default

**Required:**
1. Preserve KI-001 drag behavior and the existing mouse/touch slider path.
2. Keep adaptive toggle and manual reset behavior owned by explicit controls only.
3. Add keyboard activation to the info tile without changing its visual role.
4. Make the grid-vs-scroll clipping/row contract explicit and stable.
5. Remove dead-space grid behavior so tiles fill available section width across the locked breakpoints.
6. Fix scroll-mode left-edge clipping.
7. Update the `cards_reference.md` lighting-card entry to reflect the final CD6 contract.

### YAML Rehab Harness

Use `Dashboard/Tunet/tunet-card-rehab-lab.yaml` as the architecture/source reference and validate primarily against:
- `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`
- `http://10.0.0.21:8123/tunet-card-rehab-yaml/phone-stress`
- `http://10.0.0.21:8123/tunet-card-rehab-yaml/surfaces`

CD6 should extend the YAML harness only as needed to make the lighting defects deterministic at `390×844`, `768×1024`, `1024×1366`, and `1440×900`.

## Test Strategy

Prefer test-first for this tranche.

Expected test work:
- add one dedicated CD6 bespoke suite under `Dashboard/Tunet/Cards/v3/tests/`
- update shared suites only where the lighting contract becomes more explicit

Minimum targeted regression gate:
- dedicated CD6 bespoke suite
- `sizing_sections_contract.test.js`
- `config_contract.test.js`
- `interaction_dom_contract.test.js`
- `interaction_keyboard_contract.test.js`

What the bespoke suite should lock:
- light-tile horizontal variant no longer truncates unacceptably at phone width
- light-tile keyboard and drag behavior remain unchanged
- lighting-card info tile remains keyboard-complete
- lighting-card grid fills available row width instead of centering capped tiles
- lighting-card scroll mode no longer clips the leftmost tile
- lighting-card drag behavior still works in both grid and scroll layouts

Recommended working order:
1. light-tile horizontal truncation
2. lighting-card grid width-fill / dead-space removal
3. lighting-card scroll left-edge clipping
4. lighting-card info-tile keyboard completeness
5. final shared sizing/doc cleanup

For each item above, require this loop:
1. write or tighten one test
2. implement one focused fix
3. run only the relevant targeted suites
4. live-check the exact repro case
5. record whether the defect is closed, narrowed, or still open

## Acceptance

1. No regression of KI-001 drag behavior.
2. Light-tile drag still works with mouse and touch.
3. The lighting-card info tile is keyboard-complete.
4. Grid tiles fill the available card width without dead-space side margins at `390`, `768`, `1024`, and `1440`.
5. Scroll mode does not clip tiles at the left edge.
6. No row collapse or clipping appears in YAML rehab screenshots.
7. `tunet_light_tile.js` retains its `editor-complete` policy.
8. `tunet_lighting_card.js` retains its `editor-lite` policy.
9. `Dashboard/Tunet/Docs/cards_reference.md` entries are complete and internally consistent for both cards.

## High-Risk Failure Modes

- Accidentally regressing drag while fixing layout.
- Solving dead space by reducing columns globally instead of fixing the width-fill contract.
- Fixing scroll clipping with `overflow: hidden` or another band-aid that breaks drag headroom.
- Reworking info-tile visuals when only semantics/activation completeness are needed.
- Letting `tunet_light_tile.js` absorb `tunet_lighting_card.js` problems or vice versa.

## Stop Conditions

Stop and reassess before continuing if any of the following happen:

- drag behavior regresses in either card
- a scroll-clipping fix requires hiding overflow in a way that clips drag UI or tile shadows
- the only apparent way to fix layout is to touch `tunet_base.js`
- a proposed change starts affecting rooms, status, or dashboard IA
- a fix changes the authoring model or introduces new config keys
- the YAML rehab dashboard no longer reproduces the defect clearly enough to validate the change

If one of these triggers, document:
- what broke or became ambiguous
- what file/behavior caused it
- whether scope must widen or the fix should be split into a smaller step

## Key Commands

```bash
npm test
npm run tunet:build
npm run tunet:deploy:lab
```

Deploy credentials: `root@10.0.0.21` password `cheser`  
HA login: username `mac` password `cheser`

Primary validation URLs:
- Lab: `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`
- Phone stress: `http://10.0.0.21:8123/tunet-card-rehab-yaml/phone-stress`
- Surfaces: `http://10.0.0.21:8123/tunet-card-rehab-yaml/surfaces`

**After deploying, bump Lovelace resource `?v=` via HA MCP** or the browser will serve stale cached JS. Re-check current resource URLs before choosing the next token.

Resource IDs for the two CD6 cards:
- light tile: `36132420520e42c48d2ff6f42313216c`
- lighting card: `c747c4729aa64ea5b36aa111d9d08c77`

## Key Files

| File | Purpose |
|------|---------|
| `Dashboard/Tunet/Cards/v3/tunet_light_tile.js` | CD6 target — atomic light tile |
| `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` | CD6 target — detail lighting surface |
| `Dashboard/Tunet/tunet-card-rehab-lab.yaml` | YAML rehab harness |
| `Dashboard/Tunet/Cards/v3/tests/` | Vitest + jsdom suites |
| `Dashboard/Tunet/Docs/cards_reference.md` | Per-card config/editor/interaction contracts |
| `Dashboard/Tunet/Docs/visual_defect_ledger.md` | Normalized visual defect backlog |
| `~/.claude/plans/flickering-herding-wolf.md` | Sole execution plan |
| `plan.md` / `handoff.md` / `FIX_LEDGER.md` | Control docs — update tranche markers on close |

## What NOT To Do

- Do not touch cards outside CD6 scope (`tunet_light_tile.js` + `tunet_lighting_card.js`) unless the YAML harness or test files need narrow support edits
- Do not reopen actions/scenes work from CD5
- Do not modify status card (scope-locked to CD11)
- Do not widen this tranche into rooms or surface-assembly work
- Do not change `tunet_base.js` unless a shared primitive is truly missing
- Do not start CD7 work

## Governance On Close

When CD6 is complete:
1. Update `plan.md`, `handoff.md`, `FIX_LEDGER.md` — set current tranche to CD7
2. Update `CLAUDE.md` and `Dashboard/Tunet/CLAUDE.md` — same
3. Record evidence: exact test count, build status, deploy token, screenshot matrix coverage
4. Keep status/home-dashboard work deferred; do not let lighting spill into CD11 or CD12 ownership

## Required Closure Evidence

Do not mark CD6 complete without all of the following:

- `git diff --stat` or equivalent summary of exactly what changed
- exact targeted suites run
- exact final `npm test` result
- exact final `npm run tunet:build` result
- exact deploy action used
- exact new `?v=` token applied to:
  - `tunet_light_tile.js`
  - `tunet_lighting_card.js`
- screenshot set captured at:
  - `390×844`
  - `768×1024`
  - `1024×1366`
  - `1440×900`
  - light mode
  - dark mode
- one sentence each for:
  - light-tile horizontal truncation status
  - lighting grid dead-space status
  - lighting scroll clipping status
  - info-tile keyboard status
- explicit note of any residual CD6 debt left open

## Visual Validation

Screenshot the YAML rehab dashboard after any layout changes. Minimum validation set:
- `390×844`
- `768×1024`
- `1024×1366`
- `1440×900`
- light and dark mode

Prioritize:
- `phone-stress` for narrow-width clipping
- `lab` for branch coverage
- `surfaces` for room-detail composition sanity

Use the same authenticated headless screenshot pattern as CD5, but point it at `tunet-card-rehab-yaml/...`, not the old storage rehab path.

Pass criteria for screenshots:
- no clipped left-edge tile in scroll mode
- no centered dead-space gutters in grid mode
- no row collapse when `rows` limits are active
- no new truncation regression in horizontal light-tile variants
- `surfaces` still reads as a coherent room-detail lighting surface after the fix

## Session Approach

CD6 should be more test-first than CD5. The lighting family has enough interaction and layout complexity that screenshot-only validation is not sufficient.

Recommended order:
1. encode the layout and interaction contracts in tests first
2. implement the smallest possible CSS/logic change for a single defect
3. run targeted suites and live-check that single defect
4. repeat for the next defect
5. only then run full regression, build, deploy, bump resources
6. validate all 4 locked breakpoints in both themes

The key discipline for CD6 is to solve real lighting-family defects without widening into a whole-dashboard redesign.
