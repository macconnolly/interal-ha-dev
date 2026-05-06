# CD4-CD5 — Sizing/Sections Adoption, Utility Strip Bespoke Pass, Post-CD5 Hover-Clip Closeout Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 705-722 + 735-760 + 2424-end. Read-only. For current state see `plan.md` Tranche Queue.

**Period**: 2026-04-04 → 2026-04-30
**Status**: Closed (CD5 utility strip pass complete; pre-CD5 rehab-lab expansion + visual audit complete; post-CD5 cross-card hover-clip closeout complete with surface-composition contract test in place)
**Scope**: CD5 actions/scenes utility-strip bespoke pass (variant-aware sizing, phone overflow, semantic header), pre-CD5 multi-view YAML rehab-lab expansion + screenshot-first visual audit, and post-CD5 cross-card overflow-vs-hover-lift defect closure across actions/scenes/lighting/sonos.

## Synthesis

### What we did
- CD5 utility strip pass: unified `getCardSize/getGridOptions` with variant-aware `min_columns/min_rows`; phone overflow handled per-variant (wrap for `mode_strip`/relaxed, scroll for compact default); `aria-pressed` on stateful chips; scenes got semantic header, `aria-hidden` icons, `allow_wrap`/`show_header` grid tracking, and disabled-chip dispatch guard.
- Test additions for CD5: `utility_strip_bespoke.test.js` (32 tests) and tightened `sizing_sections_contract.test.js` (+6); suite went 489 → 527 tests.
- Pre-CD5 rehab-lab expansion: `Dashboard/Tunet/tunet-card-rehab-lab.yaml` widened to a 5-view YAML harness (`lab`, `states`, `surfaces`, `phone-stress`, `nav-lab`); registered as `tunet-card-rehab-yaml` to avoid storage-dashboard collision; deployed to `/homeassistant/dashboards/tunet-card-rehab-lab.yaml`.
- Surface architecture clarification: room-detail review judged through `tunet-lighting-card`, not `tunet-rooms-card`; rehab `surfaces` view encodes that with dedicated room-detail `tunet-lighting-card` stacks.
- Post-CD5 hover-clip closeout (2026-04-30): applied `padding-block: 0.5em; margin-block: -0.5em` recipe to scroll containers in scenes (`.scene-row`), lighting (`:host([layout="scroll"]) .light-grid`), sonos (`.speakers-scroll`); actions card had already shipped 2026-04-29 at `?v=build_20260429_220654Z`; speaker_grid inspected and exempt.
- Codified the recipe with a contract test (`§Surface composition — overflow vs hover-lift` in `Cards/v3/tests/interaction_source_contract.test.js`) supporting a `/* lift-clear:none */` opt-out, plus a guardrail line in `Dashboard/Tunet/Cards/v3/CLAUDE.md`. Final suite: 655/655 (+13).

### Why we did it
- CD5 utility strips (actions, scenes) needed bespoke sizing/overflow handling that the shared CD4 contract could not express on its own.
- The hover-clip class of bug (vertical clipping of hover-lift inside `overflow-x: auto` scroll containers) emerged from the actions card on 2026-04-29; the contract test added 2026-04-30 immediately surfaced three pre-existing offenders, and user explicitly authorized expanding scope to fix all.

### Files touched
- `Dashboard/Tunet/Cards/v3/tests/utility_strip_bespoke.test.js` (new, 32 tests)
- `Dashboard/Tunet/Cards/v3/tests/sizing_sections_contract.test.js` (tightened, +6)
- `Dashboard/Tunet/Cards/v3/tests/interaction_source_contract.test.js` (added §Surface composition contract test)
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml` (5-view expansion)
- `/homeassistant/dashboards/tunet-card-rehab-lab.yaml` (live deploy, registered as `tunet-card-rehab-yaml`)
- `Dashboard/Tunet/Cards/v3/CLAUDE.md` (hover-clip guardrail line)
- `Dashboard/Tunet/Docs/visual_defect_ledger.md` (running defect inventory + §1 actions-card closure)
- `Dashboard/Tunet/Docs/plans/cross_card_spec_layer_extraction_plan.md` (DEFERRED, candidate-only)
- Card sources: actions, scenes, lighting, sonos (hover-clip recipe applied)

### Key decisions
- Variant-aware `getGridOptions` defaults are CD5's responsibility; YAML/UI `grid_options` still owns context-specific sizing (anchor: 2026-04-04).
- Room-detail surface review uses `tunet-lighting-card`, not `tunet-rooms-card` (anchor: 2026-04-04).
- Editor/config debt logged: icon-bearing config fields should use a dropdown or validated icon picker, not raw free-form text (anchor: 2026-04-04).
- Hover-clip recipe (`padding-block: 0.5em; margin-block: -0.5em`) applied to all CD2 scroll containers; `/* lift-clear:none */` opt-out is the documented escape hatch (anchor: 2026-04-30).
- Cross-card spec-layer extraction filed but explicitly deferred — not active, awaits user authorization (anchor: 2026-04-30).

### Entry points (for regression hunting)
- Tests: `Cards/v3/tests/interaction_source_contract.test.js` (§Surface composition contract test); `Cards/v3/tests/utility_strip_bespoke.test.js`; `Cards/v3/tests/sizing_sections_contract.test.js`
- Selectors: actions hover-lift containers; scenes `.scene-row`; lighting `:host([layout="scroll"]) .light-grid`; sonos `.speakers-scroll`; speaker_grid (verified exempt)
- Resource versions: `?v=20260404_cd5d` (CD5 deploy); `?v=build_20260429_220654Z` (actions hover-clip ship); `?v=build_20260430_161315Z` (cross-card hover-clip closeout)
- Rehab views: `/tunet-card-rehab-yaml/lab|states|surfaces|phone-stress|nav-lab`

### Deferred work / handoffs
- Lighting/sonos em-anchor not at 16px (computed padding-block resolves to 7px) — acceptable, tracked separately, not a regression.
- `cross_card_spec_layer_extraction_plan.md` — candidate-only, awaits authorization.
- Icon-picker editor debt — captured in visual defect ledger, not yet scheduled.
- CD6 (Lighting Bespoke Pass) opened immediately after CD5.

### Superseded by
- None recorded — sizing contract + hover-clip recipe remain authoritative

### Related claude-mem observations (added 2026-05-04)

- #10075 — CD4 Sizing Decision Recorded — Stabilize Profile System, Defer Per-Card Migration to CD5-CD11 (2026-04-04) — locked decision; sets the policy this archive's CD5 work executes against.
- #10070 — CD4 Marked Complete — CD5 Now Active Tranche (2026-04-04) — gate completion that opens CD5.
- #10257 — CLAUDE.md Updated — CD4 Marked Complete, CD5 Set as Current Tranche (2026-04-04) — governance file sync at the CD4→CD5 handoff.
- #10454 — Sections Layout Matrix — CD4-Verified Card Contract + 3-Layer Model (2026-04-04) — codifies the sizing/Sections grid contract used by getGridOptions across all 13 cards.
- #10293 — CD5 Execution Plan Finalized — Research Complete, Implementation Starting (2026-04-04) — entry point for the CD5 utility-strip bespoke pass.
- #10106 — Scenes allow_wrap default fixed — was false, now true (Sections-safe) (2026-04-04) — concrete CD5 scenes-card grid-options fix.
- #10429 — CD5 — Tests Confirmed 527/527, Build Deployed to Lab (2026-04-04) — contract test count + deploy stamp `?v=20260404_cd5d`.
- #10453 — CD5 Complete — CD6 Lighting Bespoke Pass Is Next (2026-04-04) — gate completion closing CD5.
- #10437 — CD5 Governance File Sync — Full Close (2026-04-04) — governance-file closure for CD5.
- #11052 — Tunet Actions Card — Hover Shadow Clipped by overflow-x:auto (2026-04-29) — root-cause capture of the hover-clip class of bug.
- #11061 — Full Violation Scan — Three Scroll Containers Across Suite Lack Overflow+Lift Breathing Room (2026-04-30) — scope-expansion evidence (scenes/lighting/sonos offenders found).
- #11103 — CSS Hover-Clip Bug Fixed Across 4 Tunet Scroll Containers (2026-04-30) — implementation of the `padding-block: 0.5em; margin-block: -0.5em` recipe across all 4 cards.
- #11104 — §Surface Contract Tests Added — Scroll Container Lift-Clear Enforcement (2026-04-30) — contract test addition that codifies the rule.
- #11058 — Overflow+Lift Guardrail Added to Dashboard/Tunet/Cards/v3/CLAUDE.md (2026-04-30) — governance-file sync for the hover-clip recipe.
- #11059 — Visual Defect Ledger — Hover Clip Bug Closed Entry Added to §1 actions-card (2026-04-30) — ledger closure entry.
- #11105 — Em-Anchor Gap: lighting and sonos Cards Compute padding-block as 7px Not 8px (2026-04-30) — known caveat tracked separately as deferred work, not a regression.

---


## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-04, CD5 — Utility Strip Bespoke Pass)

Tranche marker: CD5 complete, advancing to CD6

- `CURRENT STATE`
  - CD5 completed; tranche marker → CD6 — Lighting Bespoke Pass
  - 527 tests (was 489), 13 cards build, deploy ?v=20260404_cd5d
- `ACTIONS`
  - phone overflow: wrap for mode_strip + relaxed; scroll for compact default
  - layout helper: unified getCardSize/getGridOptions with variant-aware min_columns/min_rows
  - aria-pressed on stateful chips
- `SCENES`
  - semantic header + icon aria-hidden
  - getGridOptions tracks allow_wrap + show_header
  - disabled chip dispatch guard
- `TESTS`
  - utility_strip_bespoke.test.js (32 tests), sizing_sections_contract.test.js tightened (+6)


## Session Delta (2026-04-04, Post-CD4 Rehab Lab Expansion + Visual Audit)

Tranche marker: pre-CD5 documentation + validation harness expansion

- `REHAB-LAB EXPANSION`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml` expanded into a multi-view YAML dashboard harness:
    - `lab`
    - `states`
    - `surfaces`
    - `phone-stress`
    - `nav-lab`
  - all 13 Tunet card families remain represented
  - coverage widened from representative smoke variants to meaningful authoring/runtime branches intended for whole-home review
  - internal navigation paths now target the YAML dashboard namespace (`/tunet-card-rehab-yaml/...`)
- `SURFACE ARCHITECTURE CLARIFICATION`
  - room-detail review should be judged primarily through `tunet-lighting-card`, not `tunet-rooms-card`
  - `tunet-rooms-card` remains the overview/navigation card
  - rehab `surfaces` view now encodes that rule with dedicated room-detail `tunet-lighting-card` stacks
- `LIVE YAML DASHBOARD`
  - YAML dashboard file deployed to `/homeassistant/dashboards/tunet-card-rehab-lab.yaml`
  - HA dashboard registration moved to `tunet-card-rehab-yaml` to avoid collision with the existing storage dashboard
- `VISUAL AUDIT`
  - screenshot-first defect review expanded substantially across mobile, tablet, and desktop
  - running defect inventory recorded in `Dashboard/Tunet/Docs/visual_defect_ledger.md`
  - new editor/config debt captured: icon-bearing UI config fields should use a dropdown or validated icon picker instead of raw free-form text where invalid icon strings can silently render as broken glyphs


## Session Delta (2026-04-30, post-CD5 — Surface composition contract: scroll-container hover-clip closed across 4 cards)

Tranche marker: `CD9` remains the active root Tunet tranche. This work is a closeout for an out-of-tranche defect class (overflow vs hover-lift) that surfaced in the actions card on 2026-04-29 and was found to apply to three additional cards once the contract test was added.

- `AUTHORITY NOTE`
  - the actions hover-clip fix shipped 2026-04-29 (resource version `?v=build_20260429_220654Z`)
  - the contract test added 2026-04-30 caught three pre-existing offenders with the same shape (scenes `.scene-row`, lighting `:host([layout="scroll"]) .light-grid`, sonos `.speakers-scroll`); user explicitly authorized expanding scope to fix all
  - speaker_grid card was inspected and has no scroll containers needing the rule
- `IMPLEMENTATION`
  - applied the same `padding-block: 0.5em; margin-block: -0.5em` recipe to scenes/lighting/sonos scroll containers; lighting `[use-profiles]` padding-top aligned to 0.5em to keep cascade consistent
  - new contract test (`§Surface composition — overflow vs hover-lift` in `Cards/v3/tests/interaction_source_contract.test.js`) enforces the rule across all CD2 cards with a `/* lift-clear:none */` opt-out
  - guardrail line added to `Dashboard/Tunet/Cards/v3/CLAUDE.md`
  - closure entry added to `Dashboard/Tunet/Docs/visual_defect_ledger.md` §1 actions-card
  - candidate-shape spec-layer plan filed at `Dashboard/Tunet/Docs/plans/cross_card_spec_layer_extraction_plan.md` (DEFERRED — not active)
- `TESTS / VALIDATION`
  - full suite: `655/655` (was `642`; +13 new tests)
  - `npm run tunet:build` clean
  - `npm run tunet:deploy:lab` synced resources to `?v=build_20260430_161315Z`
  - live verification at 1440×900: scenes/lighting/sonos hover lifts now paint without vertical clipping; layout neutrality confirmed on actions; lighting/sonos run with em-anchor not at 16px so computed padding-block is 7px (acceptable; tracked separately, not regression)
- `RESULT`
  - hover-clip class of bug closed on actions, scenes, lighting, sonos
  - contract test will fail any future regression of the same class
  - `CD9` remains the only active tranche; the spec-layer plan is candidate-only and waits on user authorization to slot in
