# CD0-CD3 — Consistency-Driver Reset, Surface-Driven Reset, and Foundational Setup Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 723-734 + 761-864. Read-only. For current state see `plan.md` Tranche Queue.

**Period**: 2026-04-02 → 2026-04-04
**Status**: Closed (CD0 build/lab + CD1 config/editor + CD2 interaction + CD3 semantics all completed by 2026-04-04)
**Scope**: Replacement of surface-driven and card-family-bucket execution orders with the consistency-driver pass order (CD0–CD12), CD2 interaction-adoption closure, and post-tranche control-doc normalization.

## Synthesis

### What we did
- Adopted surface-driven governance reset on 2026-04-02: surface order locked (Living Room → popup → overview → media → remaining rooms), profile resolver contract superseded, esbuild migration sequenced after Surface 1, CLAUDE.md/AGENTS.md/tunet-agent-driver skill updated; v3 regression fixes applied (`getGridOptions()` rows:'auto' + min_rows on 7 non-profile cards; nav G3.0 `TUNET_NAV_OFFSETS_DISABLED`, version → 0.2.4).
- Same day (2026-04-02), superseded surface-first ordering with consistency-driver pass order (CD0–CD12); introduced three-tier configuration support policy (editor-complete / editor-lite / yaml-first); marked `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md` SUPERSEDED and locked `~/.claude/plans/flickering-herding-wolf.md` as sole execution authority.
- Connected Playwright MCP to HA at 10.0.0.21:8123; first screenshots captured for `tunet-overview` (v2) and `tunet-g2-lab-v3` (profile A/B comparison).
- Closed CD2 — Shared Interaction Adoption on 2026-04-03: 368/368 tests green (212 interaction tests are the authoritative regression gate), 13-card build deployed at `?v=20260403_cd2`, 13 cards rendered at 1440×900 with zero red-card errors; locked strict evidence policy (syntax/YAML parse + `npm run tunet:build` + `npm test` + Playwright at locked breakpoints in dark+light).
- Performed pre-CD5 control-doc normalization on 2026-04-04: `visual_defect_ledger.md` normalized against coherent-build evidence; `cards_reference.md` encoded whole-home usage contract (rooms=navigation, lighting=room-detail); `legacy_key_precedence.md` actions-editor notes reconciled; `sections_layout_matrix.md` corrected (CD4 card-level accepted, CD12 surface validation still required).

### Why we did it
- Surface-first execution kept reopening the same cards repeatedly; consistency-driver order normalizes one consistency dimension across an explicit file list per pass before any bespoke per-card work, so CD5–CD11 only solve file-specific behavior remaining after shared passes close.
- User priority clarified that every Tunet card needs direct rehabilitation; whole-house surface assembly is downstream (CD12), not the active driver.

### Files touched
- `~/.claude/plans/flickering-herding-wolf.md` (locked as sole execution authority)
- `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md` (marked SUPERSEDED)
- `Dashboard/Tunet/Docs/plans/surface_driven_reset.md` (partially superseded)
- `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` (downgraded to draft until CD12)
- `Dashboard/Tunet/Docs/visual_defect_ledger.md`
- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/Docs/legacy_key_precedence.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- `Dashboard/Tunet/Agent-Reviews/profile_contract_supersession.md`
- All CLAUDE.md files (root, Tunet, Cards, Cards/v3) + AGENTS.md + tunet-agent-driver skill
- 7 non-profile v3 cards (`getGridOptions()` regression fix); `tunet_nav_card.js` (G3.0 backport, version → 0.2.4)

### Key decisions
- Consistency-driver pass order CD0–CD12 supersedes both surface-first and card-family-bucket (CR0-CR10) orders (anchor: 2026-04-02)
- Three-tier config support: editor-complete (nav/scenes/light_tile/weather/sensor), editor-lite (lighting/rooms/climate/media/sonos/speaker_grid), yaml-first (actions/status) (anchor: 2026-04-02)
- Profile resolver contract superseded as policy; legacy profile code stays for untouched cards, removed incrementally per surface tranche (anchor: 2026-04-02)
- Strict evidence policy for tranche closure: syntax/YAML parse + build + test + Playwright at locked breakpoints in both modes (anchor: 2026-04-03)
- Locked breakpoints retained: 390×844, 768×1024, 1024×1366, 1440×900 (anchor: 2026-04-02)
- Living Room page resumes only at CD12 (anchor: 2026-04-02)

### Entry points (for regression hunting)
- Tests: 212-test interaction suite (CD2 regression gate); 368/368 total at CD2 close
- Lovelace resource version at CD2 close: `?v=20260403_cd2`
- Cards: 13 v3 cards; nav card flag `TUNET_NAV_OFFSETS_DISABLED`; nav version 0.2.4
- Build: `npm run tunet:build`, `npm test`; Playwright MCP against `10.0.0.21:8123`
- Authority doc: `~/.claude/plans/flickering-herding-wolf.md` (CD0–CD12)

### Deferred work / handoffs
- CD4 (Shared Sizing And Sections Adoption) and CD5+ bespoke passes deferred to subsequent tranches
- 1440 light Playwright captured at CD2 close; remaining breakpoints (390/768/1024 × dark/light) deferred to user manual verification
- Design-doc reconciliation (design_language.md v9.0 vs tunet-design-system.md v8.3) launched as 4-agent review — interaction choreography §6, animation timing §11, dark-amber conflict (#fbbf24 vs #E8961E) all deferred
- v3 regression fixes committed but not deployed at reset time
- G6.1 soak (24/30 days, gate opens 2026-04-09) deferred
- Surface assembly order (Living Room → popup → overview → media → remaining rooms) deferred to CD12

### Superseded by
- None recorded — foundation locks remain authoritative

### Related claude-mem observations (added 2026-05-04)

- #8976 — Profile Resolver Contract Formally Superseded — Ratified Policy Document Created (2026-04-02) — ratified governance decision retiring profile resolver contract during Tranche 0
- #8997 — handoff.md Updated with Session 0ZH Delta — Surface-Driven Reset and Major Governance Changes (2026-04-02) — original surface-driven reset governance entry
- #9022 — Tranche 0 Complete — Contract Reconciliation Committed (2026-04-02) — Tranche 0 closure (precursor to CD0)
- #9584 — Consistency Driver Method Plan — CD0-CD12 Program Order and Tier Rules (2026-04-03) — original CD0-CD12 program-order definition
- #9586 — CD2 rationale crystallized: interaction consistency is the foundation for surface assembly (2026-04-03) — locked decision establishing CD2 as cornerstone of consistency-driver order
- #9594 — cards_reference.md: unified interaction model contract and editor architecture contract added (2026-04-03) — CD1 editor architecture contract codified
- #9648 — plan.md Updated — CD1 Marked Complete, CD2 Now Active (2026-04-03) — CD1 closure gate
- #9720 — CD2 Implementation Strategy Decisions — Timing Tokens, Tap-Highlight, Test Scoping (2026-04-03) — locked CD2 implementation strategy decisions
- #9875 — CD2 Committed to Main — 29 Files, 368 Tests, 11 Cards Normalized (2026-04-03) — CD2 closure with full evidence
- #9935 — Plan Authority Consolidated — flickering-herding-wolf.md Is Sole Execution Authority (2026-04-03) — plan-authority consolidation locking sole execution doc
- #9940 — consistency_driver_method_plan.md Marked Superseded (2026-04-03) — formal supersession of prior method plan
- #9946 — plan.md Authority Lock Updated — consistency_driver_method_plan.md Superseded (2026-04-03) — authority-lock sync in plan.md
- #9968 — CD3 Closed — plan.md Advanced to CD4 (2026-04-03) — CD3 closure gate
- #10067 — CD4 Complete — Committed as 7abb4d7; CD3.1 Also Closed (2026-04-04) — CD4 + CD3.1 closure (immediate downstream of this archive)
- #10238 — plan.md Session Delta: Control-Doc Normalization Pass (Pre-CD5) (2026-04-04) — control-doc normalization session covered by this archive

---

## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-04, Control-Doc Normalization)

Tranche marker: pre-CD5 documentation/backlog rationalization

- `CURRENT STATE`
  - no tranche change: `CD5 — Utility Strip Bespoke Pass` remains next
- `DOC NORMALIZATION`
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` normalized against coherent-build evidence; stale/narrowed claims downgraded; card defects, composition constraints, and doc contradictions separated
  - `Dashboard/Tunet/Docs/cards_reference.md` encodes whole-home usage contract (rooms=navigation, lighting=room-detail, per-card phone-safe defaults explicit); stale closed-tranche wording removed
  - `Dashboard/Tunet/Docs/legacy_key_precedence.md` updated so actions-editor notes match current contract
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md` wording corrected: CD4 card-level accepted, CD12 surface breakpoint validation still required


## Session Delta (2026-04-03, CD2 Closeout)

Tranche marker: CD2 — Shared Interaction Adoption closed

- `AUTHORITY-LOCK`
  - `~/.claude/plans/flickering-herding-wolf.md` is the sole execution authority (CD0–CD12).
- `CD2 CLOSURE`
  - All code gates green: 368/368 tests, 13-card build, deployed with ?v=20260403_cd2
  - Interaction test suites (212 tests) are the authoritative regression gate
  - 13 cards rendered at 1440×900, zero red-card errors
  - Screenshot matrix (4 breakpoints × 2 modes): partial — 1440 light captured, remaining breakpoints pending user manual verification
- `EVIDENCE-POLICY (STRICT)`
  - Tranche closure requires:
    - syntax + YAML parse checks for changed files
    - `npm run tunet:build` when build outputs are affected
    - `npm test`
    - Playwright screenshots at locked breakpoints in both dark and light mode

## Session Delta (2026-04-02, Consistency-Driver Reset)

Tranche marker: pre-CD0 (documentation alignment)

- `PROGRAM-RESET`
  - Current user priority clarified: every Tunet card needs direct rehabilitation; whole-house surface assembly is downstream, not the active driver
  - Surface-first execution order is superseded
  - Card-family-bucket execution order (CR0-CR10) is ALSO superseded
  - Active execution order is **consistency-driver pass order (CD0-CD12)**:
    1. `CD0` — Build Architecture And Rehab Lab
    2. `CD1` — Configuration Clarity And Editor Policy (tiered: editor-complete / editor-lite / yaml-first)
    3. `CD2` — Shared Interaction Adoption (all 13 files, one pass)
    4. `CD3` — Shared Semantics Adoption (6 files with gaps)
    5. `CD4` — Shared Sizing And Sections Adoption (6+ files)
    6. `CD5` — Utility Strip Bespoke Pass
    7. `CD6` — Lighting Bespoke Pass
    8. `CD7` — Rooms Bespoke Pass
    9. `CD8` — Environment Bespoke Pass
    10. `CD9` — Media Bespoke Pass
    11. `CD10` — Navigation Verify Pass
    12. `CD11` — Status Decision Gate
    13. `CD12` — Surface Assembly
  - Rule: shared passes (CD1-CD4) close one consistency dimension across an explicit file list. Bespoke passes (CD5-CD11) solve only the file-specific behavior remaining after shared passes close.
- `CONFIGURATION SUPPORT POLICY`
  - Three tiers replace the old "verify getConfigForm" approach:
    - `editor-complete`: nav, scenes, light_tile, weather, sensor — editor round-trips; stub renders cleanly
    - `editor-lite`: lighting, rooms, climate, media, sonos, speaker_grid — editor covers 80%; advanced keys YAML-only
    - `yaml-first`: actions, status — runtime is richer than any visual editor should chase
- `BEST-OF-OLD-PLAN RETAINED`
  - Three-surface leadership model remains active (`tunet-suite-storage` UX, `tunet-suite-config.yaml` architecture)
  - Climate remains the measured visual baseline
  - Sections reasoning remains page → section → card when surface work resumes
  - Browser Mod popup direction, locked breakpoints, and no-destructive-cleanup discipline are preserved
  - Surface assembly order when it resumes: Living Room → popup → overview → media → remaining rooms
- `ACTIVE NEXT TRANCHE (historical snapshot at reset time)`
  - Current work = documentation alignment to consistency-driver order (pre-CD0)
  - CD0 = Build Architecture And Rehab Lab (next implementation tranche)
  - Living Room page is not the next implementation tranche; it resumes in CD12
- `SURFACE-DOC STATUS`
  - `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` is draft reference only until surface assembly resumes in CD12
- `PLAN-DOC HIERARCHY`
  - `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md` = SUPERSEDED (historical reference only)
  - `~/.claude/plans/flickering-herding-wolf.md` = single source of truth (consistency-driver rehab, CD0–CD12)
  - `Dashboard/Tunet/Docs/plans/surface_driven_reset.md` = references card-rehab-first framing (partially superseded by consistency-driver)

## Session Delta (2026-04-02, Surface-Driven Reset)

Tranche marker: `Tranche 0` (Contract Reconciliation — documentation only, zero code changes)

- `GOVERNANCE-RESET`
  - Surface-driven execution model adopted: card work in service of surfaces, not front-loaded card-by-card
  - Surface order locked: Living Room page → Living Room popup → Overview → Media → remaining rooms
  - Profile resolver contract superseded as policy (see `Dashboard/Tunet/Agent-Reviews/profile_contract_supersession.md`)
  - Code removal incremental per-surface tranche; legacy profile code stays for untouched cards
  - Build migration (esbuild) sequenced AFTER Surface 1
  - All CLAUDE.md files updated (root, Tunet, Cards, Cards/v3)
  - AGENTS.md updated: v3 authority, breakpoints, status/actions/build locks
  - tunet-agent-driver skill updated: branch guard → main, card paths → v3, surface model added
- `SURFACE-MODEL`
  - Three surfaces with distinct roles (per plan.md:1041-1108):
    - `tunet-suite-config.yaml` = architecture source, repo truth
    - `tunet-suite-storage` = primary UX evaluation surface
    - `tunet-overview` + legacy = historical reference only
  - Surface leadership rules: each tranche declares which surface leads; drift must be explicit
- `SCOPE-LOCKS-EVALUATED`
  - Status → G3S: RESPECTED (bugfix-only)
  - G6.1 soak: NEAR EXPIRY (24/30 days, gate opens Apr 9)
  - Profile contract: SUPERSEDED AS POLICY
  - Surface order: RESPECTED
  - Popup → Browser Mod: RESPECTED
  - Breakpoints: LOCKED (390×844, 768×1024, 1024×1366, 1440×900)
- `V3-REGRESSION-FIXES`
  - getGridOptions() rows:'auto' + min_rows restored on 7 non-profile v3 cards
  - Nav card G3.0 neutralization backported (TUNET_NAV_OFFSETS_DISABLED, version → 0.2.4)
  - Fixes committed but NOT deployed to server yet
- `PLAYWRIGHT-CONNECTED`
  - Playwright MCP connected to HA at 10.0.0.21:8123
  - Visual feedback loop operational: can screenshot dashboards for validation
  - First screenshots taken: tunet-overview (v2 rendering) and tunet-g2-lab-v3 (profile A/B comparison)
- `DESIGN-DOC-RECONCILIATION (IN PROGRESS)`
  - design_language.md v9.0 = architecture; tunet-design-system.md v8.3 = visual specs
  - v8.3 has interaction choreography (§6), animation timing (§11) that v9.0 lacks — must be merged
  - Cross-card interaction state vocabulary (hover, active, focus, disabled) identified as critical gap
  - Dark amber conflict: v9.0 #fbbf24 vs v8.3 #E8961E — needs resolution against actual code
  - 4-agent review launched for design doc reconciliation + interaction vocabulary

