# CD6-CD7 — Lighting Bespoke Pass and Rooms Bespoke Pass Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 455-500 + 533-704. Read-only. For current state see `plan.md` Tranche Queue. NOTE: BOTH CD6 AND CD7 WERE REOPENED on 2026-05-04 (P0 lighting hold-then-drag JS regression + lighting phone padding + lighting all-on/off feature gap; rooms row-variant orb sizing oversized + room subview composition shift). See `Dashboard/Tunet/Docs/visual_defect_ledger.md` 2026-05-04 entries.

**Period**: 2026-04-04 → 2026-04-06
**Status**: Closed Apr 4-6, 2026 — REOPENED 2026-05-04 for the defects above
**Scope**: CD6 lighting card family parity (light_tile + lighting_card + shared lighting-tile profile family) and CD7 rooms card row/slim/tile variant density, control isolation, and icon/typography rebalance

## Synthesis

### What we did
- CD6 (Apr 4): closed lighting bespoke pass after fixing D2 grid dead-space (fill-width tracks replace fixed cap), D3 scroll left-edge clipping (inline inset added), D4 info-tile keyboard semantics (no code change required), and D1 light-tile narrow-horizontal label preservation; added `lighting_bespoke.test.js` (17 tests) and raised baseline 536 to 553 tests; deployed `?v=20260404_cd6a` then recovery bump `?v=20260404_cd6b`
- CD6 follow-on (Apr 5): introduced dedicated shared `lighting-tile` family in `tunet_base.js` profile registry with explicit `compact`/`standard`/`large` geometry and desktop parity tokens; `tunet-lighting-card` and `tunet-light-tile` both consume the same vertical stack tokens so atomic and card tiles converge instead of drifting; auto-derived `expand_groups` member labels now compact in-card (strip room context + trailing lighting nouns) while explicit `zones[].name` still wins
- CD6 polish (Apr 5): added shared `lightingProgressInset` token; lighting card progress tracks and light_tile vertical tiles now consume `--_tunet-lighting-progress-inset`; non-profile compact fallback widened 10px to 12px; final live token `?v=build_20260405_220402Z`
- CD7 recovery (Apr 5): withdrew earlier CD7 closeout claims; rebalanced row/slim phone density with smaller same-size orb/power controls + tighter spacing; row controls isolated from body activation (pointer + keyboard); nested orb/power got deterministic local pressed class while row keeps navigation pressed visual; normalized invalid room-icon aliases (`sofa`/`couch`); lifted desktop/base row + slim desktop typography; row status emits plain percent values instead of `% bri`; row lead icon uses orb/power size family; row orb/power expose hover titles
- CD7 closeout (Apr 6): closed CD7 on YAML rehab evidence at all four locked breakpoints (390x844, 768x1024, 1024x1366, 1440x900); accepted contract — tile tap = toggle, `tap_action` override when configured, hold = navigate, row/slim body tap = navigate with nested controls owning toggles; storage verification explicitly excluded from closure gate
- Build/deploy tooling: new authenticated review harness `Dashboard/Tunet/scripts/tunet_playwright_review.mjs` + npm scripts (`tunet:review`, `tunet:review:smoke`, `tunet:lab:screenshot`); `build.mjs --deploy` + `update_tunet_v3_resources.mjs` now auto-syncs all 13 live Lovelace resource URLs to current `versionToken`

### Why we did it
- Lighting card had three card-level defects (D2 dead space, D3 scroll clipping, D4 info-tile semantics) plus phone-width truncation in light_tile; later geometry drift surfaced because `design_language.md` mapped lighting to `tile-grid` while `cards_reference.md` already treated it as its own family — runtime was compensating with card-local geometry
- Rooms row variant had broken phone density, control-vs-body activation conflicts, and broken room-icon aliases bleeding raw ligature text into captures; storage-side narrow rendering was suspected surface/configuration drift, not card debt

### Files touched
- `Dashboard/Tunet/Cards/v3/tunet_base.js` (lighting-tile family, `lightingProgressInset` token)
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` (fill-width tracks, scroll inset, shared family consumption, compacted expand_groups labels)
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js` (narrow horizontal label preservation, shared progress inset)
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` (row/slim density, control isolation, icon alias normalization, plain-percent status, typography lift)
- `Dashboard/Tunet/Cards/v3/tests/lighting_bespoke.test.js` (new, 17 tests grew to 29 then 30)
- `Dashboard/Tunet/scripts/tunet_playwright_review.mjs`, `update_tunet_v3_resources.mjs`, `deploy_tunet_v3_lab.sh`, `build.mjs`, `package.json`

### Key decisions
- Tile identity moves into shared `lighting-tile` family in tunet_base.js while container placement stays card-local (anchor: 2026-04-05 CD6 follow-on)
- `expand_groups` auto-label compaction in-card; explicit `zones[].name` always wins (anchor: 2026-04-05)
- Rooms tile tap = toggle is LOCKED per user direction; no `+N` orb hiding pattern accepted (anchor: 2026-04-05 CD7 recovery)
- Storage verification intentionally NOT in CD7 closure gate; room-page/storage layout deferred to surface/layout pass (anchor: 2026-04-06 CD7 closeout AUTHORITY NOTE)
- Rehab lab is acceptance surface; speculative overflow-specific fixtures removed (anchor: 2026-04-05)

### Entry points (for regression hunting)
- Tests: `Dashboard/Tunet/Cards/v3/tests/lighting_bespoke.test.js` (30/30 final), full suite went 553 to 576 to 589 to 590
- Selectors: `.l-tile`, `.room-grid.row-mode`, `--_tunet-lighting-progress-inset`, lighting-tile profile family compact/standard/large
- Profile tokens: `lighting-tile` family in `tunet_base.js` profile registry; `lightingProgressInset` shared token
- Live resource versions touched: `?v=20260404_cd6a`, `?v=20260404_cd6b`, `?v=build_20260405_175253Z`, `?v=build_20260405_214802Z`, `?v=build_20260405_215937Z`, `?v=build_20260405_220402Z`
- Screenshot manifests under `/tmp/tunet-playwright-review/2026-04-05T*` and `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/`

### Deferred work / handoffs
- Scroll variant low-priority transport/centering quirk when tile count is below scroll threshold (recorded as separate non-blocking lighting issue)
- Room-page/storage composition decision deferred (was undecided at CD7 closeout; resolved 2026-05-04 via dedicated subview pages — see superseded section)
- Storage `rooms` route screenshot harness timeout — targeted live verification not fully completed at closeout
- D1 broader long-name policy explicitly deferred beyond CD6
- CD8 weather target contract written into `cards_reference.md` §7 during CD7 recovery (out of CD6/CD7 scope)

### Superseded by
- 2026-05-04 reopens (see `Dashboard/Tunet/Docs/visual_defect_ledger.md`). Specifically: P0 lighting hold-then-drag JS regression fix, lighting phone padding fix, lighting all-on/off feature addition, rooms row-variant orb sizing re-tune, rooms-card §3 Option A subview composition (dedicated room subview pages replacing the previous "one-popup-per-room" lock)

### Related claude-mem observations (added 2026-05-04)

- #10586 — CD6 Plan File Replaced with Closure Task List (2026-04-04) — CD6 closure task list authority that opened this archive's window
- #10583 — Visual Defect Ledger — CD6 Status Review (2026-04-04) — pre-CD6 defect inventory baseline (D1/D2/D3/D4) used to scope the pass
- #10574 — CD6 Visual Validation Screenshot Captured — Lab View at Scroll Position y=2000 (2026-04-04) — CD6 closure visual evidence capture
- #10689 — CD7 Reopened — Prior Closeout Withdrawn (2026-04-05) — formal withdrawal of premature CD7 closure, anchors the recovery work
- #10697 — cards_reference.md: Rooms Card Interaction Contract Locked (2026-04-05) — locks tile-tap=toggle / hold=navigate contract referenced in synthesis
- #10698 — Tile Tap = Toggle LOCKED — Route-First Direction Reversed (2026-04-05) — user-direction anchor for the locked rooms contract
- #10729 — CD7 Recovery Complete — 576 Tests, Tile Tap Restored, Gap Issue Logged (2026-04-05) — CD7 recovery completion gate with test count handoff
- #10773 — Dedicated `lighting-tile` Profile Family Added to tunet_base.js (2026-04-05) — concrete record of the shared profile family extraction (core CD6 follow-on artifact)
- #10798 — Lighting Card Auto-Derived Expand Label Compaction (2026-04-05) — anchor for the expand_groups label compaction decision
- #10800 — Full Test Suite Green After CD6 Follow-On Changes (2026-04-05) — regression-target validation post-parity work
- #10803 — Visual Defect Ledger — CD6 Lighting Card Defects Closed (2026-04-05) — defect-ledger update marking D2/D3/D4 closure
- #10808 — visual_defect_ledger.md Overclaims Lighting Parity Is Closed — Confirmed Governance Debt (2026-04-05) — governance-debt flag relevant to 2026-05-04 reopens
- #10840 — CLAUDE.md Tranche Status — CD7 Active, Lighting Follow-on Closed (2026-04-05) — governance file sync confirming CD6 follow-on closure state
- #10861 — Visual Defect Ledger — Current State as of 2026-04-06 (2026-04-05) — final-state ledger snapshot at end of archive window

---


## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-06, CD7 closeout — Rooms Bespoke Pass)

Tranche marker: `CD7` closed on YAML rehab evidence; control returns to `CD8` with weather as the only active runtime blocker

- `AUTHORITY NOTE`
  - user directed that storage should not remain in the CD7 closure gate
  - chosen interpretation:
    - close CD7 on the YAML rehab dashboard only
    - do not claim the room-page/storage layout is decided
    - treat any lingering storage narrow-section behavior as out of the card-level CD7 closure gate until the later room/surface layout pass decides the intended composition
    - keep the current rooms interaction contract exactly as documented in `cards_reference.md`: tile tap = toggle, hold = navigate
- `VALIDATION`
  - rehab screenshot evidence reviewed at locked breakpoints:
    - `390x844`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__02.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__03.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__04.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__05.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/phone-stress/cards/tunet-rooms-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/surfaces/cards/tunet-rooms-card__01.png`
    - `768x1024`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/768x1024/light/rehab/lab/cards/tunet-rooms-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/768x1024/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `1024x1366`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1024x1366/light/rehab/lab/cards/tunet-rooms-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1024x1366/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `1440x900`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__02.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__03.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__04.png`
      - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__05.png`
- `RESULT`
  - row-mode phone density is no longer critically broken
  - row/slim control isolation holds visually and in bespoke tests
  - orb, power, and row lead icon sizing now read as one shared control family
  - plain-percent status text, desktop/slim readability, and room-icon alias normalization all hold in the rehab captures
  - the accepted rooms contract is now:
    - tile tap = toggle
    - `tap_action` override when configured
    - hold = navigate / popup fallback
    - row/slim body tap = navigate; nested controls own toggles
  - storage verification is intentionally not part of the closure gate; no final room/surface layout decision is being claimed here
  - room-page/storage layout remains explicitly open and will be decided later in the surface/layout pass, not by this card-level closeout


## Session Delta (2026-04-05, CD6 post-close refinement — Lighting Progress Inset)

Tranche marker: user-directed narrow lighting-family polish after parity closure; CD7 remains the active next tranche

- `AUTHORITY NOTE`
  - do not reopen the closed lighting parity follow-on for a broad layout pass
  - chosen interpretation: this is a narrow shared lighting-family refinement to the bottom progress-lane inset only
- `IMPLEMENTATION`
  - introduced a dedicated shared `lightingProgressInset` token in `tunet_base.js`
  - `tunet_lighting_card.js` progress tracks now use `--_tunet-lighting-progress-inset` instead of reusing the raw content pad
  - `tunet_light_tile.js` vertical tiles now consume the same shared progress inset
  - non-profile compact fallback inset widened from `10px` to `12px`
- `VALIDATION`
  - `node --check` passed on:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - targeted bespoke suite passed: `lighting_bespoke.test.js` `30/30`
  - full `npm test` passed: `590/590`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260405_215937Z`
  - focused screenshot review passed at `390x844` light rehab `lab`:
    - grid compact: `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - section surface: `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - atomic vertical compact: `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-light-tile__01.png`
- `RESULT`
  - the bottom slider now sits visibly further in from the tile edges across the shared lighting family
  - no other lighting geometry or interaction contracts changed
  - later user direction increased the inset further; current live resource token is `?v=build_20260405_220402Z`

## Session Delta (2026-04-05, CD6 follow-on — Lighting Geometry Parity)

Tranche marker: user-directed reopen of the logged CD6 follow-on; closed after screenshot parity signoff, then returned control to CD7

- `AUTHORITY NOTE`
  - active plan still lists CD7 as the next scheduled tranche
  - user explicitly redirected work back to the logged lighting follow-on
  - chosen interpretation: park CD7 without claiming closure and treat lighting geometry parity as the active follow-on task
- `LIGHTING TARGET`
  - desktop non-scroll lighting variants should match the scroll reference on:
    - tile width
    - tile height / aspect balance
    - spacing between tiles
    - internal vertical rhythm (`icon -> name -> value -> brightness bar`)
  - this is broader than the earlier “column gap too tight” wording
  - scroll itself still has a separate bug and is not the authority for behavior, only for the current tile geometry reference
  - traced drift source:
    - `design_language.md` still mapped `lighting -> tile-grid`
    - `cards_reference.md` already described lighting as its own shared family
    - runtime compensated with `tunet_lighting_card.js` card-local geometry
  - chosen interpretation: tile identity now moves into a dedicated shared `lighting-tile` family in `tunet_base.js`, while container placement stays in `tunet-lighting-card`
- `IMPLEMENTATION`
  - base profile registry now owns a dedicated `lighting-tile` family with explicit `compact` / `standard` / `large` geometry and desktop parity tokens
  - `tunet-lighting-card` keeps container mechanics card-local, but now consumes shared lighting-family tokens for tile internals and desktop non-scroll geometry
  - `tunet-light-tile` now consumes the same lighting-family vertical stack tokens so atomic tiles and card tiles converge instead of drifting
  - auto-derived `expand_groups` member labels are now compacted in-card by stripping redundant room context / trailing lighting nouns; explicit `zones[].name` overrides still win unchanged
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/lighting_bespoke.test.js` passed (`29/29`)
  - full `npm test` passed (`589/589`)
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260405_214802Z`
  - targeted rehab screenshot review now satisfies the formal five-point contract:
    - phone grid: `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - phone section: `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - desktop scroll sample: `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__02.png`
    - desktop section: `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__03.png`
  - acceptance result:
    - desktop grid tiles centered with stable proportions
    - value lane has obvious air above the brightness bar
    - `large` is visibly more legible than `standard`
    - `grid`, `section`, `scroll`, and atomic tiles read as the same product
    - cropped tiles do not reveal container context
- `CLOSED`
  - the CD6 lighting parity follow-on is closed
  - auto-derived `expand_groups` member labels now compact in-card to remove redundant room context while preserving explicit `zones[].name`
- `SEPARATE NON-BLOCKING NOTE`
  - the scroll variant still has its own transport/centering quirk when there are not enough tiles to require scrolling; keep that as a separate low-priority lighting issue, not a blocker on tile-family parity
- `OUT OF SCOPE`
  - do not reopen rooms runtime in this pass
  - do not treat the broken scroll behavior as part of the geometry-parity change
  - do not widen beyond the lighting family and its direct consumers

## Session Delta (2026-04-05, CD7 — Rooms Bespoke Pass Recovery)

Tranche marker: CD7 reopened; prior closeout claims withdrawn pending validation

- `NEXT HIGH-VALUE ITEM`
  - resume CD7 on the locked rooms backlog:
    - row-mode phone density/truncation revalidation
    - row control isolation / route behavior revalidation
    - storage-side targeted verification to separate real room-card debt from surface/configuration drift
- `CURRENT STATE`
  - Claude's earlier CD7 closeout is not accepted as authoritative
  - current work now also includes a user-directed authenticated screenshot review harness under the build/lab tooling lane
  - card-behavior edits still stay local to `tunet_rooms_card.js` plus bespoke test/doc recovery
  - tranche does **not** advance until locked breakpoint validation is complete
- `ROOMS CARD`
  - row/slim phone density is being rebalanced with smaller same-size orb/power controls and tighter spacing at phone width
  - row controls are isolated from body activation for pointer and keyboard paths
  - nested orb/power controls now own a deterministic local pressed class while the row keeps its navigation pressed visual
  - user visually confirmed the row-body-vs-orb pressed-state split on live HA
  - rooms now normalizes common invalid room-icon aliases like `sofa` / `couch` to valid glyphs so slim/row captures do not bleed raw ligature text
  - desktop/base row typography was lifted slightly, slim desktop typography was lifted for readability, and row status now emits plain percent values instead of `% bri`
  - row lead icon now uses the same size family as the orb/power controls; row orb/power controls expose hover titles from room/light labels
  - tile tap = toggle is LOCKED per user direction; `tap_action` override when configured, hold navigates
  - no `+N` orb hiding pattern is accepted
- `REVIEW HARNESS`
  - new authenticated review runner: `Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - repo scripts added: `tunet:review`, `tunet:review:smoke`, `tunet:lab:screenshot`
  - default behavior is screenshot capture + manifest; probes are opt-in via `--with-probes`
  - smoke evidence: `npm run tunet:review:smoke` passed and wrote a manifest under `/tmp/tunet-playwright-review/`
- `BUILD / DEPLOY TOOLING`
  - v3 deploy now updates the live Lovelace resource URLs automatically after SCP instead of relying on stale static `/local/tunet/v3/*.js` paths
  - new helper: `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs`
  - `build.mjs --deploy` now syncs every matching `/local/tunet/v3/*.js?v=...` resource to the current manifest `versionToken`
  - direct shell deploys via `Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh` also sync resource URLs automatically
  - `package.json` now exposes `npm run tunet:resources:sync` for standalone resource re-versioning
- `DOCS`
  - tranche docs are being corrected back to active CD7 state
  - rooms card reference/defect docs should not claim closure until live validation is complete
  - governance investigation found a new `CD6` follow-on: lighting desktop non-scroll variants are too wide, too flat, and too tightly packed at `1440x900` relative to the scroll reference; do not reduce this to a gap-only issue
  - CD8 weather target contract written in `cards_reference.md` §7: single-line details (icon-only, pressure dropped), flip-chip toggles, ~120px vertical savings on phone
  - visual_defect_ledger.md weather entries updated to reference the CD8 target contract
- `REHAB LAB`
  - speculative overflow-specific fixtures were removed; the authoritative row/tile repro fixtures remain the acceptance surface
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed
  - `node --check Dashboard/Tunet/scripts/tunet_playwright_review.mjs` passed
  - `npm test`: `576/576` passing across 12 suites
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` refreshed the live v3 bundles and updated all 13 live Lovelace resource URLs to `?v=build_20260405_175253Z`
  - `npm run tunet:review:smoke` passed against authenticated HA at `390x844`
  - targeted rehab screenshot review at `390x844` and `1440x900` confirmed row/slim icon parity, plain-percent status text, and improved desktop row/slim readability against climate-card captures
  - storage overview screenshot review passed at the harness level, but the live `1440x900` storage overview still shows the rooms card rendered in a narrow row composition that truncates labels aggressively; treat that as a likely surface/configuration issue until proven card-local
  - storage `rooms` route timed out waiting for Tunet cards in the screenshot harness, so targeted live verification is not yet fully complete
  - targeted governance review for prior-tranche defects reproduced a lighting-card desktop issue at `1440x900`: the old dead-space defect is fixed, but `Card Grid Compact` and `Section Surface + Expand Groups` still diverge from the scroll reference because the non-scroll tiles are too wide, too flat, and too tightly spaced
  - locked live breakpoint validation is still required before any CD7 closeout

## Session Delta (2026-04-04, CD6 — Lighting Bespoke Pass)

Tranche marker: CD6 complete, advancing to CD7

- `CURRENT STATE`
  - CD6 code, tests, build, deploy, recovery redeploy, and governance sync landed
  - tranche marker advanced to `CD7 — Rooms Bespoke Pass`
  - 553 tests, 11 suites, current live deploy token `?v=20260404_cd6b` (initial CD6 bump was `?v=20260404_cd6a`)
  - CD6 added the bespoke regression suite and raised the baseline from 536 to 553 tests
- `LIGHT TILE`
  - narrow horizontal mode now preserves readable labels at phone width without dropping icon, value, or progress bar
  - no new config keys; interaction model unchanged
- `LIGHTING CARD`
  - synthesized fallback `column_breakpoints` from `tile_size` when omitted
  - fill-width grid tracks replace fixed-width cap + centered dead space
  - scroll layouts now include inline inset so first tile is fully visible at scroll start
  - residual dense-name pressure is handled as config discipline: use explicit short names in dense fixtures
- `TESTS`
  - new suite: `lighting_bespoke.test.js` (17 tests)
  - targeted regression run: 246 assertions passing across bespoke + shared contract suites
  - full `npm test`: 553/553 passing
- `LIVE VALIDATION`
  - D2 grid dead-space fix visually confirmed at `390x844`, `768x1024`, and `1440x900`
  - D3 scroll left-edge clipping visually confirmed fixed at `390x844` and `1440x900`
  - D4 info-tile keyboard semantics confirmed present; no code change required
  - D1 light-tile truncation fix is deployed and test-covered; broader long-name policy was explicitly deferred beyond CD6 rather than treated as a tranche blocker
  - later governance review (2026-04-05) found a new desktop follow-on not tracked during the CD6 closeout: at `1440x900`, lighting tiles fill width correctly but the inherited column gap is now too tight in `Card Grid Compact`, `Card Scroll Standard`, and `Section Surface + Expand Groups`
- `DEPLOY`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed
  - HA resources updated:
    - initial CD6 completion bump: `tunet_light_tile.js` / `tunet_lighting_card.js` → `?v=20260404_cd6a`
    - current live recovery bump: `tunet_light_tile.js` / `tunet_lighting_card.js` → `?v=20260404_cd6b`

