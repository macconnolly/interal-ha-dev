# Tunet Dashboard Handoff (Source Of Truth)

Last updated: 2026-05-05 (America/Denver)
Intended reader: next Claude Code session
Primary instruction: treat this file as session continuity + execution map, then verify live state before changing behavior.

Active execution plan: `~/.claude/plans/flickering-herding-wolf.md` (sole authority, CD0–CD12)
Active detailed CD11 plan: `~/.claude/plans/synthetic-dazzling-oasis.md` (status-specific authority under the CD0-CD12 master plan)
Current tranche: **CD11 — Status Multi-Mode Design and Runtime Pass — CLOSED 2026-05-05** (narrow, status-only redesign/runtime pass; `CD10` nav verify is intentionally deferred until room/surface composition is more settled; next by root-plan order is `CD12` surface assembly, still parked pending user acceptance and explicit pointer update)
Previous tranches: CD9 (completed Apr 6, 2026; selected-target audio routing, dropdown parity, speaker-tile semantics, phone fallback, drag-guard behavior, and album-art resilience accepted), CD8 (completed Apr 6, 2026; weather redesign accepted, climate/sensor narrowed healthy), CD7 (completed Apr 6, 2026; card-level closeout only, room-page layout undecided), CD6 (completed Apr 4, 2026), CD5 (completed Apr 4, 2026), CD4 (completed Apr 4, 2026), CD3 (completed Apr 3, 2026), CD2 (completed Apr 3, 2026), CD1 (completed Apr 3, 2026), CD0 (completed Apr 3, 2026)

## Session Delta (2026-05-05, post-CD11 — Sonos popup chain + per-card tap action overrides)

- `CURRENT STATE`
  - CD11 remains closed; CD10/nav and CD12/surface assembly remain parked
  - this delta is post-CD11 lab feature work: a Sonos popup chain at `/sonos-popups` plus per-card tap-action knobs that the chain depends on
  - all six commits are on `main` (`9a9b5a6` → `57e20e4`); pushed: confirm with `git log origin/main..main`
  - rehab lab YAML is the only dashboard file touched; production `tunet-suite-config.yaml` is unchanged
- `WHAT THIS LANDED`
  - status card `now_playing` recipe (replaces `speakers_playing`) and `outside_weather` composite — tap intent contract for `now_playing` navigates to `#sonos-now-playing`
  - `tunet-sonos-card` v1.1.0: `title_tap_action` + `speaker_icon_tap_action` knobs (default more-info)
  - `tunet-speaker-grid-card` v3.3.0: `show_header` + `header_tap_action` + `icon_tap_action` knobs (default more-info)
  - rehab lab `/sonos-popups` view contains three popup hashes:
    - `#sonos-now-playing` — popup A (Compact 2-col speaker grid + tunet-media-card full + Open Full Player nav)
    - `#sonos-now-playing-v2` — popup A v2 (Large 3-col speaker grid for comparison)
    - `#sonos-rich` — popup B (HACS `custom:sonos-card` v10.6.8 wrapped in Tunet card surface; theme tokens, max-width 720px, min-height 600px, popup_mode: centered)
  - card_mod overrides on popup A force the first card cell to `grid-row: span 1` so HA core button card doesn't reserve phantom span-2 height
  - popup B `mediaBrowser.itemsPerRow: 4 → 2` for mobile favorites readability
- `OPEN CARRY-OVERS` (intentionally deferred, not blockers)
  - Bubble Card 3.2 back-arrow on popup B does not return to popup A — uninvestigated, possibly chain registration issue
  - HACS `sonos-card` play-button + slider-knob render via internal SVG fills that don't honor theme tokens; visible as black-on-white in popup B at light mode (third-party library limitation; documented in commit `7c71c80`)
  - per-card test backfill for the new tap-action knobs is deferred
  - dark-mode visual review of the popup chain is deferred (Playwright defaults to light mode)
- `NEXT AGENT GUARDRAILS`
  - if you touch the popup chain, work in `Dashboard/Tunet/tunet-card-rehab-lab.yaml` only — do NOT promote to `tunet-suite-config.yaml` without explicit user direction
  - if you investigate the back-arrow regression: start with Bubble Card 3.2 source (`pop-up/create.js` and `editor.js`); the chain registration is via `hash:` field, and the back-arrow is a Bubble Card-rendered chrome element
  - the now_playing recipe binding to `#sonos-now-playing` is hard-coded in `_recipeSpecificAction` in `tunet_status_card.js`; if the popup hash naming changes, that handler must change too
- `VALIDATION`
  - full `npm test` → `694/694` (CD11 closure baseline unchanged; popup chain has no test backfill yet)
  - `node --check` on three changed cards
  - `npm run tunet:build` + `npm run tunet:deploy:lab`
  - live verification at `390x844` (Playwright) + iOS Companion: popup A gap eliminated, variant 2 renders correctly, popup B height stable across favorites/queue/groups tabs

## Session Delta (2026-05-05, CD11 post-closure status polish)

- `CURRENT STATE`
  - CD11 remains closed; this was a status-only live-polish follow-up
  - live lab resources are on `?v=build_20260505_122827Z`
  - no HA restart was performed
  - no CD10/nav or CD12/surface files were modified
- `IMPLEMENTATION`
  - status detail/custom dropdown values are centered and compact
  - info-only typography spread is bounded
  - room-row temperature values inherit HA units and now show `°F`
  - room-row phone layout wraps instead of clipping; desktop/tablet can remain the intended horizontal row strip
  - row title scale now matches the other status headers
  - detail mobile secondaries are hidden to reduce card height at phone width
  - visual review tooling now has `--changed-cards` and generic probes for every selected/changed card; status has deeper CD11 probes
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `node --check Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - focused status suite → `69/69`
  - full `npm test` → `694/694`
  - final phone screenshots:
    - `/tmp/tunet-cd11-visual/status-mobile-polish-final-2/`
  - changed-card live probe across locked breakpoints:
    - `/tmp/tunet-cd11-visual/probed-changed-cards-all-breakpoints/2026-05-05T12-37-40-917Z/review-manifest.json`
- `NEXT`
  - use `npm run tunet:review:changed -- --view <affected-view>` for future dashboard/card edits so visual acceptance is probe-backed, not screenshot-only

## Session Delta (2026-05-05, CD11 closure — final state)

- `CURRENT STATE`
  - CD11 is closed in repo source, docs, tests, deployed bundle, live lab YAML, and visual evidence
  - `tunet-status-card` remains `v3.4.0`
  - no `Dashboard/Tunet/CLAUDE.md` active-program pointer was advanced
  - `CD10` nav verification remains intentionally deferred
  - `CD12` surface assembly is next by root-plan order but remains parked until the user accepts CD11 closure and explicitly starts it
- `IMPLEMENTATION`
  - final status source/runtime work was already complete in Gaps 1-3
  - Gap 4 added the cross-contract lock:
    - `status_bespoke.test.js` now checks §9 docs, Sections docs, all variants, all recipes, lab fixture coverage, and conditional signal stress coverage
    - `tunet-card-rehab-lab.yaml` now shows all six status variants, all 12 recipe shorthands, and a separate `Status: Conditional Signal Stress` fixture
    - `room_row` fixture remains a row-safe strip rather than a catch-all stress surface
    - `cards_reference.md` and `sections_layout_matrix.md` point back to the same final test anchors
    - `config_contract.test.js` classifies status as `editor-lite`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - YAML parse: `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - focused status suite → `66/66`
  - config contract suite → `39/39`
  - full `npm test` → `691/691`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260505_063622Z`
  - live HA lab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - final focused status visual review:
    - `/tmp/tunet-playwright-review/2026-05-05T06-36-46-901Z/review-manifest.json`
  - final full rehab visual review:
    - `/tmp/tunet-playwright-review/2026-05-05T06-40-24-560Z/review-manifest.json`
  - supplemental status-only nav-hidden screenshots for 390px room-row assessment:
    - `/tmp/tunet-cd11-visual/gap4-final-nav-hidden/`
- `VISUAL NOTES`
  - final full rehab review completed without harness-detected failures
  - final deployed lab has 9 status captures on the canonical lab route
  - the existing bottom navigation overlay can obscure lower 390px card captures; this is CD10/nav scope and was not changed
- `NEXT`
  - surface CD11 closure to the user
  - do not start CD12 until the user explicitly directs that tranche

## Session Delta (2026-05-05, CD11 gap 3 — variant + recipe editor/stub authoring)

- `CURRENT STATE`
  - Gap 3 is complete in repo source and deployed to the HA lab
  - `tunet-status-card` is now `v3.4.0`
  - `getConfigForm()` exposes `layout_variant` and `recipe_tiles[]`
  - `setConfig()` synthesizes authoring shapes in this order: `recipe_tiles[]`, then `recipes[]`, then raw `tiles[]`
  - `getStubConfig()` returns the `home_summary` starter; `getStubConfigForVariant(variant)` returns a coherent starter for all six implemented variants
  - remaining CD11 work: final cross-contract audit/test/doc closure and closure declaration
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - added variant selector metadata and recipe selector metadata
    - added recipe-authoring normalization helpers
    - added per-variant stub construction
    - kept raw `tiles[]` available as YAML/runtime power-user surface, especially for `custom`
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - status bespoke suite now asserts editor schema, stubs, recipe-vs-raw synthesis equivalence, alias behavior, and precedence warnings
  - `Dashboard/Tunet/Docs/cards_reference.md`
    - §9 now documents the CD11 authoring/synthesizer/runtime model
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `63/63`
  - full `npm test` → `688/688`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260505_061108Z`
  - local visual fixture:
    - `/tmp/tunet-cd11-visual/gap3-stub-authoring/cd11-gap3-stubs-390x844.png`
    - `/tmp/tunet-cd11-visual/gap3-stub-authoring/cd11-gap3-stubs-768x1024.png`
    - `/tmp/tunet-cd11-visual/gap3-stub-authoring/cd11-gap3-stubs-1024x1366.png`
    - `/tmp/tunet-cd11-visual/gap3-stub-authoring/cd11-gap3-stubs-1440x900.png`
  - live HA review:
    - `/tmp/tunet-playwright-review/2026-05-05T06-12-00-979Z/review-manifest.json`
- `NEXT`
  - run Gap 4: audit §9 + sections matrix + lab fixtures against `status_bespoke.test.js`, add any missing coverage anchors, update docs, build/test/deploy, capture final live visual evidence, then declare CD11 closed

## Session Delta (2026-05-05, CD11 gap 2 — variant-aware grid sizing)

- `CURRENT STATE`
  - Gap 2 is complete in repo source and deployed to the HA lab
  - `tunet-status-card` now returns variant-specific `getGridOptions()` and `getCardSize()` values
  - remaining CD11 work: variant/recipe editor + stub authoring, then final cross-contract closure
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `home_summary`: `min_rows: 2`, `max_rows: 4`
    - `home_detail`: `min_rows: 3`, `max_rows: 12`
    - `room_row`: `min_rows: 1`, `max_rows: 2`
    - `info_only`: `min_rows: 2`, `max_rows: 6`
    - `alarms`: `min_rows: 3`, `max_rows: 8`
    - `custom`: legacy `min_rows: 2`, `max_rows: 12`
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - status bespoke suite now asserts every variant's Sections sizing contract
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md` and `Dashboard/Tunet/Docs/cards_reference.md`
    - both now document the same variant sizing table
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `49/49`
  - full `npm test` → `674/674`
  - YAML parse: `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260505_060140Z`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - live HA review:
    - `/tmp/tunet-playwright-review/2026-05-05T06-01-58-703Z/review-manifest.json`
- `NEXT`
  - implement Gap 3: variant + recipe authoring in `getConfigForm()`, `recipe_tiles`/`recipes` synthesis in `setConfig()`, and coherent per-variant stub configs

## Session Delta (2026-05-04, CD11 gap 1 — recipe defaults self-containment)

- `CURRENT STATE`
  - CD11 is still active
  - Gap 1 of the four-gap closure sequence is complete in repo source: recipe shorthand now has a code/test/doc contract
  - remaining CD11 closure work: variant-aware grid sizing, editor/stub authoring, final cross-contract docs/tests, build/deploy/live visual verification
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - fixed-source vs user-bound recipe metadata now exists
    - `mode_ttl` shorthand now binds `timer.oal_mode_timeout` by default
    - missing user-bound recipe entities warn at config normalization
    - `indicator` tiles now honor `format: state` humanization
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - status bespoke suite now includes deep synthesized-runtime assertions for all 12 recipes
  - `Dashboard/Tunet/Docs/cards_reference.md`
    - §9 now includes the canonical recipe defaults table
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `42/42`
  - full `npm test` → `667/667`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260505_055425Z`
  - local Playwright visual smoke at all locked breakpoints wrote:
    - `/tmp/tunet-cd11-visual/gap1-recipe-defaults/cd11-gap1-recipes-390x844.png`
    - `/tmp/tunet-cd11-visual/gap1-recipe-defaults/cd11-gap1-recipes-768x1024.png`
    - `/tmp/tunet-cd11-visual/gap1-recipe-defaults/cd11-gap1-recipes-1024x1366.png`
    - `/tmp/tunet-cd11-visual/gap1-recipe-defaults/cd11-gap1-recipes-1440x900.png`
  - live HA review:
    - `/tmp/tunet-playwright-review/2026-05-05T05-54-37-879Z/review-manifest.json`
- `NEXT`
  - start Gap 2 with the visual finding already known: `alarms` timer text is tight/clipped at 390px and must inform variant-aware sizing
  - do not chase bottom-nav overlap in these card captures during CD11; CD10/nav verification remains intentionally deferred

## Session Delta (2026-04-07, CD11 status density pass vs sensor-card reference)

- `CURRENT STATE`
  - status sizing was adjusted a second time after the first scale pass still read too small live
  - this second pass intentionally uses the sensor-card `standard` / `use_profiles: false` feel as the density reference
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - raised shared status sizing again
    - reduced tile row height/padding/gap to remove dead internal whitespace
    - tightened value/label line-height/min-height behavior
    - retuned `home_summary`, `home_detail`, and `alarms` to the denser target
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - updated focused CSS-contract coverage accordingly
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `25/25`
  - full `npm test` → `650/650`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab`
  - note:
    - no post-deploy visual review was run in this pass
- `RESULT`
  - if status still feels off after this pass, the next adjustment should be a live visual comparison against the sensor-card sample rather than another blind numeric tweak

## Session Delta (2026-04-07, CD11 status scale pass)

- `CURRENT STATE`
  - the landed status runtime is now visually larger in the implemented modes and should read less sparse
  - this was a scale-only pass; it did not start `CD11c` or change mode semantics
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - added explicit status-scale CSS variables
    - raised icon/value/label/secondary/dropdown scale across the implemented status modes
    - tuned `home_summary`, `home_detail`, and `alarms` separately
    - tightened detail/alarm padding/gap slightly to reduce dead whitespace
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - expanded focused CSS-contract coverage for the scale pass
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `25/25`
  - full `npm test` → `650/650`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_051115Z`
  - note:
    - no post-deploy live screenshot review was run in this pass
- `RESULT`
  - if the tiles still feel too small, the next move is a live visual tune on spacing/line-clamp behavior, not another structural rewrite

## Session Delta (2026-04-07, rehab `states` route restore — consolidated gallery)

- `CURRENT STATE`
  - `States Lab` is no longer a mostly status-only comparison page
  - it now reuses the canonical `lab` family sections and then appends the extra dynamic/state stress fixtures
- `IMPLEMENTATION`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - added YAML anchors to the canonical `lab` family sections (`actions` through `nav`)
    - aliased those sections into `path: states`
    - updated the `states` intro copy to reflect the consolidated-gallery contract
    - kept the status/media/speaker-grid stress blocks below the reused gallery
- `VALIDATION`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - note:
    - no JS runtime changed, so no build/deploy was needed
    - no live screenshot review was run in this fix
- `RESULT`
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/states` is again the fastest one-route view for broad variant review
  - `lab` remains the canonical source; `states` now inherits that content instead of drifting separately

## Session Delta (2026-04-07, rehab gallery expansion — rooms size matrix + media/nav edge branches)

- `CURRENT STATE`
  - the canonical rehab gallery now carries broader size and edge-branch coverage without changing any card runtime
  - `states` inherits these additions automatically through the canonical `lab` anchors
- `IMPLEMENTATION`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - expanded `tunet-rooms-card` coverage to show:
      - row compact / standard / large
      - tiles compact / standard / large
      - slim compact
      - explicit tile `tap_action` / `hold_action` override sample
    - added `tunet-media-card` grouped-target guidance sample and idle/no-art fallback sample
    - added `tunet-sonos-card` idle/no-art fallback sample
    - added the custom-items nav variant to the canonical nav section so the broad gallery includes both default and custom nav authoring paths
- `VALIDATION`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - note:
    - no JS runtime changed, so no build/deploy was needed
    - no live screenshot review was run in this fix
- `RESULT`
  - the rehab dashboard is closer to the intended “pretty much every meaningful configuration” gallery
  - rooms size-variant review is now materially easier from the consolidated routes

## Session Delta (2026-04-07, CD11c — room_row + info_only)

- `CURRENT STATE`
  - `room_row` and `info_only` are now real runtime modes; they no longer warn/fall back to `custom`
  - `CD11c` is coded, tested, built, and deployed
  - the rehab YAML has been re-pushed so the live gallery now shows all landed status variants on the `states` route again
  - no post-deploy live review was run in this session
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - promoted `room_row` and `info_only` to implemented `layout_variant` values
    - `room_row` now:
      - renders as a horizontal strip
      - accepts only `value` and `indicator`
      - uses compact labels
      - suppresses secondary values and aux pills
      - collapses/reflows hidden tiles
      - uses row-oriented sizing/profile handling
    - `info_only` now:
      - accepts only `value` and `indicator`
      - uses calmer/lighter informational styling
      - suppresses secondary values and aux pills
      - collapses/reflows hidden tiles
      - stays passive by default unless the author explicitly provides `tap_action`, `navigate_path`, or `action_entity`
    - corrected unsupported-type warning text for the new modes
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - focused suite expanded to cover the `room_row` and `info_only` contracts
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - added `Status: Room Row`
    - added `Status: Info Only`
    - `States Lab` now shows all six landed status variants:
      - `home_summary`
      - `home_detail`
      - `room_row`
      - `info_only`
      - `alarms`
      - `custom`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `29/29`
  - full `npm test` → `654/654`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_055959Z`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
- `RESULT`
  - `CD11` mode implementation is now complete
  - the next status pass should be live tuning / final surface selection rather than new mode work
  - hidden-tile contract is now:
    - `home_summary`, `home_detail`, `room_row`, `info_only`, and `alarms` collapse/reflow
    - `custom` alone preserves hidden slots

## Session Delta (2026-04-07, CD11b — home_detail + alarms)

- `CURRENT STATE`
  - `home_detail` and `alarms` are now real runtime modes; they no longer warn/fall back to `custom`
  - `CD11b` is coded, tested, built, and deployed
  - no post-deploy live review was run in this session because the user explicitly said it was not needed
  - follow-up contract correction:
    - `home_detail` no longer preserves empty slots for hidden conditional tiles
    - it now collapses/reflows like the older responsive behavior
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - promoted `home_detail` and `alarms` to implemented `layout_variant` values
    - `home_detail` now preserves richer labels, secondary values, authored breakpoints, and full aux pills
    - `home_detail` hidden tiles now collapse/reflow instead of preserving authored gaps
    - `alarms` now filters out dropdown tiles, collapses hidden tiles, and uses alarm/timer-specific density
    - added `enabled_alarms` and `mode_ttl` recipe defaults
    - `next_alarm` now:
      - falls back to `action_entity` / entity more-info when `navigate_path` is absent
      - auto-promotes to `alarm` tile geometry in `layout_variant: alarms` when no explicit tile type is authored
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - focused suite expanded to cover `home_detail`, `alarms`, and the new recipe behaviors
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - added `Status: Home Detail`
    - added `Status: Alarms`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `22/22`
  - full `npm test` → `647/647`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_013028Z`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
- `RESULT`
  - the next status session should start from `CD11c`, not by restaging `CD11b`
  - remaining code scope is now:
    - `room_row`
    - `info_only`
    - only after those land, final multi-mode polish / live tuning
  - active hidden-tile rule:
    - `home_summary`, `home_detail`, and `alarms` collapse/reflow
    - `custom` alone preserves hidden slots

## Session Delta (2026-04-07, CD11 rehab fixture refresh — utility-first authored tiles)

- `CURRENT STATE`
  - the shared `CD11b` status runtime is unchanged
  - the rehab YAML now demonstrates a more useful authored content split across status variations
  - no live visual verification was run in this pass by user request
- `IMPLEMENTATION`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - `Status: Home Summary`
      - now favors utility/heads-up tiles over OAL mode/system tiles
    - `Status: Home Detail`
      - now serves as the headerless responsive utility example
      - uses conditional authored tiles for media/weather/dry-air/overheat/tomorrow alarms
    - `Status: Alarms`
      - now uses tomorrow-alarm summary instead of system-state filler
    - `States Lab`
      - now shows every currently landed status variant on one route:
        - `home_summary`
        - `home_detail`
        - `alarms`
        - `custom`
  - important live HA helper dependencies used by the rehab fixture:
    - `input_text.tunet_weather_heads_up`
    - `input_text.tunet_uv_peak_24h`
    - `automation.tunet_weather_forecast_refresh`
- `VALIDATION`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - note:
    - no JS build/deploy was needed because the runtime bundle did not change
- `RESULT`
  - tile content should now be treated as per-instance authoring on top of shared mode behavior
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/states` is now the fastest rehab route for status-variant comparison
  - future sessions can keep evolving the home/alarm examples without assuming every status variation must share the same tile set

## Session Delta (2026-04-07, CD11a follow-up — Summary Dropdown/Typography Polish)

- `CURRENT STATE`
  - `home_summary` got a deployed polish pass after live review feedback
  - no later-mode work was started; `CD11b` / `CD11c` are still untouched
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - summary dropdown now centers the selected text without the visible chevron
    - summary row height/padding and summary typography were increased slightly
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - status bespoke suite now covers the summary dropdown presentation and summary typography contract
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `14/14`
  - full `npm test` → `639/639`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_010727Z`
  - rehab YAML re-pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - direct live desktop verification screenshot:
    - `/home/mac/HA/implementation_10/status-home-summary-live-1440.png`
  - note:
    - `tunet_playwright_review.mjs` timed out on `rehab/surfaces` during this follow-up, so direct browser validation was used instead
- `RESULT`
  - the live summary card now matches the requested mode-dropdown presentation and is more legible
  - next status bug to address, if desired, is the incorrect green dot on the `Not Home` tile

## Session Delta (2026-04-07, CD11a closeout fix + CD11b prep)

- `CURRENT STATE`
  - the last known `CD11a` bug was the incorrect green presence dot on `not_home`
  - that fix is now coded, tested, and deployed
  - `CD11b` is prepared conceptually but not started
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `dot_rules` now use exact case-insensitive matching with wildcard fallback instead of substring matching
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - added a `not_home` regression test for `home_presence`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `15/15`
  - full `npm test` → `640/640`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_012103Z`
  - note:
    - no post-fix live verification was performed because the user explicitly said it was not needed right now
- `CD11B PREP`
  - next code scope:
    - `home_detail`
    - `alarms`
    - remaining detail/alarm-specific recipes
  - keep explicitly out of scope:
    - `room_row`
    - `info_only`
    - broad all-mode polish
  - expected files:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `RESULT`
  - `CD11a` should now be treated as closed unless a new live issue is observed
  - the next session should begin directly with `CD11b`

## Session Delta (2026-04-06, CD11a — Structural Fixes + Summary/Custom Framework)

- `CURRENT STATE`
  - `tunet-status-card` now has a landed `CD11a` runtime baseline
  - only `home_summary` and `custom` are implemented today
  - `home_detail`, `alarms`, `room_row`, and `info_only` are still pending their later `CD11` sub-phases
- `IMPLEMENTATION`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - fixed the old fixed-height row cap
    - added dropdown listbox a11y semantics and open/close `aria-hidden` state
    - added `layout_variant`, `compact_label`, `recipe`, `action_entity`, and `navigate_path`
    - added `home_summary` runtime behavior:
      - fixed 4-column summary matrix
      - summary collapse/reflow for hidden tiles
      - compact labels and compact aux affordances
      - summary slot-budget arbitration
    - preserved `custom` backward compatibility for hidden-space behavior and legacy tile flexibility
    - later `layout_variant` names currently warn and fall back to `custom`
  - `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
    - new `CD11a` status suite (12 tests)
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
    - new `Status: Home Summary` fixture
    - preserved legacy status samples are now explicit `custom` regression fixtures
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
  - YAML parse on `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js` → `12/12`
  - full `npm test` → `637/637`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → `?v=build_20260407_003644Z`
  - authenticated rehab review manifest:
    - `/tmp/tunet-playwright-review/2026-04-07T00-36-56-201Z/review-manifest.json`
- `RESULT`
  - the next session should start from `CD11b`, not from re-litigating whether `CD11a` should exist
  - keep later-mode work scoped to:
    - `home_detail` + `alarms` in `CD11b`
    - `room_row` + `info_only` in `CD11c`

## Session Delta (2026-04-06, CD11 kickoff)

- `CURRENT STATE`
  - `CD10` nav verify is deferred for now; it is not closed
  - `CD11` is now the active tranche
  - the active detailed status plan is `~/.claude/plans/synthetic-dazzling-oasis.md`
  - the old `G3S/CD11` bugfix-only framing is no longer current policy
- `CHOSEN INTERPRETATION`
  - keep `~/.claude/plans/flickering-herding-wolf.md` as the sole CD0-CD12 program authority
  - treat `~/.claude/plans/synthetic-dazzling-oasis.md` as the operative CD11 status plan under that master authority
  - execute status as a narrow, status-only multi-mode redesign/runtime pass
  - keep status yaml-first in CD11 and avoid widening into editor/surface assembly work
- `RESULT`
  - future sessions should start CD11 from the phased `CD11a / CD11b / CD11c` status plan, not from nav cleanup
  - historical notes that describe status as bugfix-only remain archival only
- `VALIDATION`
  - governance/docs sync only
  - no runtime code changed in this delta
  - accepted live runtime remains `?v=build_20260406_151051Z`

## Session Delta (2026-04-06, CD9 closeout)

- `CURRENT STATE`
  - `CD9` is closed on the current rehab/runtime evidence
  - active tranche advanced to `CD10` at the time, but current policy is now `CD11` per the later status kickoff above
  - remaining album-art `500` behavior is backend-side first-failure only; repeated Tunet retry spam is fixed
  - `/unknown/node_modules/@webcomponents/scoped-custom-element-registry/src/scoped-custom-element-registry.ts` `404` is global HA/frontend noise, not Tunet-owned
- `VALIDATION`
  - `npm test` → `625/625`
  - `npm run tunet:deploy:lab` → `?v=build_20260406_151051Z`
  - accepted runtime notes:
    - media dropdown mobile blocker fixed
    - sonos/media dropdown parity accepted
    - speaker-grid explicit-large mobile density fixed
    - visible speaker-tile semantics accepted
    - album-art proxy retry suppression landed
- `RESULT`
  - future sessions should not reopen `CD9` for:
    - HA-global `/unknown/...scoped-custom-element-registry.ts` console noise
    - backend-only single album-art proxy failures
    - authored long-name density pressure unless the user explicitly wants a new authoring/polish pass
  - next work at the time was `CD10 — tunet-nav-card`; current work should now start from the CD11 status plan

## Session Delta (2026-04-06, CD9 subpass — Album Art Proxy Resilience)

- `CURRENT STATE`
  - `CD9` remains active
  - media/sonos now avoid repeatedly retrying a broken album-art URL
  - the `/unknown/node_modules/@webcomponents/scoped-custom-element-registry/src/scoped-custom-element-registry.ts` `404` is confirmed to reproduce on the default HA dashboard and is not Tunet-owned
- `IMPLEMENTATION`
  - `tunet_base.js`
    - added shared media-art URL resolution helpers
    - preferred art-source order is now:
      - `entity_picture_local`
      - `media_image_url`
      - `entity_picture`
    - failed art URLs are cached briefly so repeated updates do not hammer a broken HA media proxy
  - `tunet_media_card.js`
    - now uses the shared art resolution/suppression path
  - `tunet_sonos_card.js`
    - now uses the shared art resolution/suppression path
  - `audio_cd9_bespoke.test.js`
    - expanded to cover preferred local art and failed-art retry suppression/recovery
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `25/25`
  - live probe results on rehab page before fix:
    - `media_player_proxy` image `500` for `media_player.living_room`
    - `/unknown/node_modules/@webcomponents/scoped-custom-element-registry/src/scoped-custom-element-registry.ts` `404`
  - control probe on default HA dashboard confirmed the `/unknown/...` `404` is global HA/frontend noise
- `RESULT`
  - the Tunet-owned console noise is reduced to first-failure behavior instead of repeated retry spam
  - future sessions should not reopen the `/unknown/...scoped-custom-element-registry.ts` request as a Tunet bug unless it stops reproducing on non-Tunet HA pages

## Session Delta (2026-04-06, CD9 subpass — Volume Auto-Exit Drag Guard)

- `CURRENT STATE`
  - `CD9` remains active
  - media volume view and sonos volume overlay now keep the control open while the user is actively dragging
  - inactivity auto-exit still applies once the drag finishes
- `IMPLEMENTATION`
  - `tunet_media_card.js`
    - drag start clears the volume auto-exit timer
    - debounced service commits do not re-arm the timer while drag is active
    - drag end re-arms the 5-second timer
  - `tunet_sonos_card.js`
    - same drag-guard semantics applied to the overlay volume slider
  - `audio_cd9_bespoke.test.js`
    - expanded to cover “no auto-exit during drag” for media + sonos
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `23/23`
  - full `npm test` → `621/621`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_150124Z`
- `RESULT`
  - volume controls no longer auto-close under the pointer during active drag
  - the 5-second inactivity behavior resumes after drag end

## Session Delta (2026-04-06, CD9 subpass — Media Dropdown Surface + Compact Badge Polish)

- `CURRENT STATE`
  - `CD9` remains active
  - live mobile testing found a real media dropdown blocker and a compact speaker-grid badge crowding issue
  - standard speaker-grid remains acceptable; this polish is compact-only
- `IMPLEMENTATION`
  - `tunet_media_card.js`
    - dropdown shell is now fully opaque
    - media dropdown open/populate failure on phone is fixed by restoring the missing grouped-count path inside `_buildSpeakerMenu()`
  - `tunet_sonos_card.js`
    - dropdown shell is now fully opaque to preserve parity with media
  - `tunet_speaker_grid_card.js`
    - compact badge moved further into the corner and shrunk slightly so it clears the volume percentage lane
  - `audio_cd9_bespoke.test.js`
    - expanded to cover media dropdown open/populate behavior and compact badge geometry
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `21/21`
  - full `npm test` → `621/621`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_144842Z`
  - authenticated phone probe confirms the media dropdown now opens with `aria-expanded="true"`, `open=true`, `options=8`, `display=flex`, and `backdropFilter=none`
  - screenshot: `/tmp/media-mobile-dropdown-open-after-fix.png`
- `RESULT`
  - media dropdown now opens correctly on the live phone rehab card and uses a solid menu surface
  - compact speaker-grid badge no longer crowds the `%` lane

## Session Delta (2026-04-06, CD9 subpass — Speaker Icon Hold Alias)

- `CURRENT STATE`
  - `CD9` remains active
  - sonos and speaker-grid visible speaker tiles keep the same semantics, but icon hold is now a supported alias for the default more-info picker
  - remaining `CD9` runtime work stays:
    - `tunet-media-card`: pointer-first group-membership semantics + slider accessibility
    - `tunet-speaker-grid-card`: dense/default layout signoff
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - speaker icon now opens more-info on tap or hold
    - completed holds no longer create a duplicate more-info open on release/click
  - `tunet_speaker_grid_card.js`
    - speaker icon now opens more-info on tap or hold
    - completed holds no longer create a duplicate more-info open on release/click
  - `audio_cd9_bespoke.test.js`
    - expanded to assert icon hold opens more-info exactly once in both cards
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `19/19`
  - full `npm test` → `619/619`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` completed; changed sonos/speaker-grid assets deployed and Lovelace resources synced to `?v=build_20260406_141346Z`
  - deploy note: unrelated transient `tunet_lighting_card.js` SCP refusal (`port 22`) occurred during the multi-file fan-out
- `RESULT`
  - speaker icon more-info access is now available on tap or hold without changing the rest of the visible speaker-tile contract

## Session Delta (2026-04-06, CD9 subpass — Audio Target Model + Sonos Dropdown Convergence)

- `CURRENT STATE`
  - `CD9` remains active
  - media/sonos target-selection and dropdown convergence work is now landed
  - the remaining open `CD9` runtime work is visible speaker-tile semantics plus speaker-grid dense/default layout failure
- `IMPLEMENTATION`
  - shared `compactSpeakerName()` now preserves room identity aggressively for default audio labels (`Living`, `Dining`, `Kitchen`, `Bed`, etc.)
  - media volume now follows the selected target; grouped coordinator selection becomes the group-volume target
  - media volume view now auto-exits after `5s` of inactivity and resets on new adjustments
  - sonos source selector now uses the media dropdown shell `1:1`
  - sonos dropdown rows now use the same structure, compact labels, group badge affordance, and `Group All` / `Ungroup All` actions
  - sonos volume overlay now follows the selected target and auto-exits after `5s` of inactivity
  - displayed labels now compact even when the authored speaker name is long
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `9/9`
  - full `npm test` was previously green at `608/608`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_032113Z`
  - screenshot manifests:
    - `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/review-manifest.json`
    - `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/review-manifest.json`
  - key evidence:
    - media phone: `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-media-card__01.png`
    - sonos default phone: `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/390x844/light/rehab/lab/cards/tunet-sonos-card__01.png`
    - sonos explicit-name phone: `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-sonos-card__02.png`
    - sonos default desktop: `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/1440x900/light/rehab/lab/cards/tunet-sonos-card__01.png`
- `RESULT`
  - the old broad default/autodiscovered sonos width failure is no longer supported by the rehab screenshots
  - default media/sonos naming now preserves room identity while staying compact
  - selected-target volume routing now matches the adopted Sonos-like model
  - explicit long-name sonos variants now compact in the displayed label lane instead of overflowing the header
  - next highest-value `CD9` work is visible speaker-tile semantics, then speaker-grid dense/default recovery

## Session Delta (2026-04-06, CD9 subpass — Visible Speaker-Tile Semantics)

- `CURRENT STATE`
  - `CD9` remains active
  - sonos and speaker-grid visible speaker-tile semantics are now landed
  - remaining `CD9` runtime work narrows to:
    - `tunet-media-card`: pointer-first group-membership semantics + slider accessibility
    - `tunet-speaker-grid-card`: dense/default layout failure
    - `tunet-sonos-card`: explicit long-name authoring pressure only
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - visible speaker tiles now use the suite interaction model:
      - body tap selects active target
      - hold `400ms` then drag adjusts selected-target volume
      - icon tap/hold opens more-info
      - badge toggles group membership
    - tiles now surface `selected` vs `grouped` state distinctly
  - `tunet_speaker_grid_card.js`
    - removed the old tap-toggle-group / hold-more-info semantics
    - visible speaker tiles now follow the same body/icon/badge/hold-drag contract as sonos
    - old `createAxisLockedDrag()` tile semantics are no longer the active path
  - `audio_cd9_bespoke.test.js`
    - expanded to cover visible speaker-tile semantics in both sonos and speaker-grid
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `15/15`
  - full `npm test` → `615/615`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_035732Z`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/review-manifest.json`
  - key evidence:
    - sonos phone:
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-sonos-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-sonos-card__02.png`
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-sonos-card__03.png`
    - speaker-grid phone:
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-speaker-grid-card__01.png`
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-speaker-grid-card__02.png`
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-speaker-grid-card__03.png`
      - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/390x844/light/rehab/lab/cards/tunet-speaker-grid-card__04.png`
- `RESULT`
  - sonos and speaker-grid visible tiles now align with the suite speaker-tile contract
  - the stale “selected speaker specifically” wording is no longer authoritative
  - next highest-value `CD9` work is media semantics/accessibility, then speaker-grid dense/default recovery

## Session Delta (2026-04-06, CD9 subpass — Speaker-Grid Phone Column Fallback)

- `CURRENT STATE`
  - `CD9` remains active
  - the user identified the remaining visible issue as the rehab `Large 3-col Explicit` speaker-grid card looking wrong on phone
  - chosen interpretation: explicit desktop-facing `columns: 3` should not force the same density on phone widths
- `IMPLEMENTATION`
  - `tunet_speaker_grid_card.js`
    - mobile column fallback now applies even when `use_profiles: true`
    - `tile_size: large` collapses to `1` visible phone column
    - `tile_size: compact` / `standard` collapse to at most `2` visible phone columns
  - `audio_cd9_bespoke.test.js`
    - added regression coverage for profiled mobile fallback columns
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `17/17`
  - full `npm test` → `617/617`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_041426Z`
  - post-fallback screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T04-14-35-066Z/review-manifest.json`
- `RESULT`
  - the explicit `large 3-col` fixture no longer forces a 3-column phone layout at runtime
  - visual signoff on the refreshed rehab screenshots is still needed before narrowing the remaining speaker-grid backlog further

## Session Delta (2026-04-06, CD8 follow-up polish — Auto/Auto UV)

- `CURRENT STATE`
  - `CD9` remains the active tranche
  - this is a narrow post-closeout weather polish pass only
  - `CD8` stays closed
- `IMPLEMENTATION`
  - weather auto-mode resolution now prefers hourly + temperature for dry `auto/auto` when the hourly forecast exposes UV
  - forecast subscription/fetch updates now re-run the auto-mode resolver so the live card can switch after forecast hydration instead of staying stuck on its initial dry daily/temp fallback
  - weather contract docs now explicitly describe the dry `auto/auto` UV behavior
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` → `10/10`
  - full `npm test` → `599/599`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_023753Z`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/review-manifest.json`
  - key evidence:
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
- `RESULT`
  - the existing rehab `Auto / Auto` card now shows the UV cue in its dry auto path
  - no further weather runtime work is queued from this request

## Session Delta (2026-04-06, CD8 closeout — Weather Phone-Density Redesign)

- `CURRENT STATE`
  - `CD8` is now closed on YAML rehab evidence
  - active control returns to `CD9`
  - climate remains composition-bound and sensor remains visually healthy; no further `CD8` runtime work is queued
- `IMPLEMENTATION`
  - weather now uses compact header flip-chips instead of full segmented rows
  - `show_pressure` is explicit and defaults to `false`
  - hourly + temperature forecast tiles can show a compact top-right UV badge when forecast data provides UV
  - the screenshot harness now waits for web fonts before capture so phone review images stop producing raw icon ligature false negatives
  - rehab weather fixture `Short daily` was replaced with `Hourly temp + UV`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `node --check Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - YAML parse-check passed for `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` → `7/7`
  - full `npm test` → `597/597`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_022606Z`
  - rehab YAML pushed to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/review-manifest.json`
  - key weather evidence:
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__05.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__05.png`
- `RESULT`
  - weather meets the accepted CD8 phone-density contract:
    - single-line detail row
    - compact inline flip-chips
    - pressure off by default
    - optional UV cue on hourly temperature tiles
  - `CD8` is closed

## Session Delta (2026-04-06, CD7 closeout — Rooms Bespoke Pass)

- `CURRENT STATE`
  - `CD7` is now closed for the rooms card itself on YAML rehab evidence
  - do not read that as a room-page/storage layout decision; those surface/layout choices remain explicitly open
  - active control returns to `CD8`, with weather as the only live runtime blocker in that tranche
- `VALIDATION`
  - YAML rehab screenshot evidence at locked breakpoints:
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__02.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__04.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/lab/cards/tunet-rooms-card__05.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/phone-stress/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/390x844/light/rehab/surfaces/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/768x1024/light/rehab/lab/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/768x1024/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1024x1366/light/rehab/lab/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1024x1366/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__02.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__04.png`
    - `/tmp/tunet-playwright-review/2026-04-06T01-50-24-760Z/1440x900/light/rehab/lab/cards/tunet-rooms-card__05.png`
- `RESULT`
  - row-mode phone density is no longer critically broken on the YAML rehab dashboard
  - row/slim nested controls remain isolated from body navigation
  - orb/power/lead-icon sizing, plain-percent status text, slim readability, and icon alias normalization hold as regression targets
  - accepted rooms interaction contract:
    - tile tap = toggle
    - `tap_action` override when configured
    - hold = navigate / popup fallback
    - row/slim body tap = navigate; nested controls own toggles
  - room-page/storage layout remains open and undecided for later surface work

## Session Delta (2026-04-05, CD8 screenshot review — governance only)

- `CURRENT STATE`
  - user had treated `CD8` as closed, but the authenticated rehab screenshot pass does not support a broad closeout
  - chosen interpretation: keep `CD7` as the active tranche and keep `CD8` open on weather only
- `VALIDATION`
  - screenshot command:
    - `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --cd CD8 --breakpoint 390x844,768x1024,1024x1366,1440x900 --theme light`
  - manifest:
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/review-manifest.json`
  - primary evidence:
    - weather lab phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - weather phone-stress: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/phone-stress/cards/tunet-weather-card__01.png`
    - weather surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-weather-card__01.png`
    - climate surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-climate-card__01.png`
    - sensor surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-sensor-card__01.png`
- `RESULT`
  - weather does not yet satisfy the `cards_reference.md` `CD8` target contract:
    - toggles remain as separate rows under the header rather than inline flip-chips
    - details remain stacked rather than collapsing into a single summary row
    - pressure appears removed, but the full phone-density redesign is not complete
  - climate remains composition-bound; no new card-local runtime defect was proven
  - sensor remains visually healthy; the only remaining `CD8` item is naming-contract clarity around `label`
  - this was a docs/governance evidence pass only; no runtime code changed and no build/test rerun happened here

## Session Delta (2026-04-05, CD6 post-close refinement — Lighting Progress Inset)

- `CURRENT STATE`
  - after the lighting-family parity closeout, the user requested one narrow visual refinement only: move the bottom slider in from the tile edges
  - do not treat this as a broad lighting reopen; CD7 remains the active next tranche
- `IMPLEMENTATION`
  - dedicated shared lighting token added: `lightingProgressInset`
  - `tunet_lighting_card.js` now uses `--_tunet-lighting-progress-inset` for the bottom bar left/right inset
  - `tunet_light_tile.js` vertical tiles consume the same shared inset so the atomic tile stays aligned with the card family
  - non-profile compact fallback inset widened from `10px` to `12px`
- `VALIDATION`
  - `node --check` passed on:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/lighting_bespoke.test.js` → `30/30`
  - full `npm test` → `590/590`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed → live resources at `?v=build_20260405_215937Z`
  - focused screenshot proof at `390x844` rehab `lab`:
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-light-tile__01.png`
- `RESULT`
  - the bottom slider now sits further in from the tile edges across the shared lighting family without changing the rest of the accepted parity work
  - user then requested a stronger inset; current live resource token is `?v=build_20260405_220402Z`

## Session Delta (2026-04-05, CD6 follow-on — Lighting Geometry Parity)

- `CURRENT STATE`
  - user explicitly parked CD7, redirected work back to the logged lighting follow-on, and later approved closure after live screenshot review
  - do not describe the lighting problem as gap-only anymore
  - this follow-on is now closed; control returns to CD7 as the next active bespoke tranche
- `LIGHTING TARGET`
  - `Card Grid Compact` and `Section Surface + Expand Groups` should visually match `Card Scroll Standard` on:
    - tile width
    - tile height / aspect balance
    - spacing between tiles
    - internal vertical rhythm from icon through progress bar
  - scroll layout behavior is still separately broken; use it as the geometry reference, not as the behavior authority
  - drift source traced:
    - design-language docs still mapped `lighting -> tile-grid`
    - cards_reference already described lighting as a shared family
    - runtime compensated with lighting-card-local geometry
- `SCOPE NOTE`
  - tile identity and size-tier semantics now move into a dedicated shared `lighting-tile` family in `tunet_base.js`
  - `tunet_lighting_card.js` keeps container mechanics local
  - `tunet_light_tile.js` must consume the same lighting-family vertical stack tokens
  - auto-derived `expand_groups` member labels are now compacted in-card; explicit `zones[].name` values remain authoritative and preferred for intentional dense layouts
- `CURRENT RESULT`
  - lighting family now meets the formal five-point acceptance contract
  - shared lighting-family tokens plus card-local container mechanics are the accepted architecture split
  - auto-derived `expand_groups` member labels now compact in-card; explicit `zones[].name` remains authoritative
  - keep the scroll variant’s behavior/centering issue separate; this pass did not solve scroll itself
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/lighting_bespoke.test.js` → `29/29`
  - full `npm test` → `589/589`
  - `npm run tunet:deploy:lab` → live resources now at `?v=build_20260405_214802Z`
  - closure evidence:
    - `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__02.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__03.png`
  - accepted closure criteria:
    - centered stable desktop proportions
    - clear air above the brightness bar
    - meaningful `large` tier
    - same-product feel across `grid` / `section` / `scroll` / atomic tiles
    - cropped tiles do not reveal their container
  - separate non-blocking note: scroll transport/centering still has a low-priority quirk when too few tiles exist to scroll

## Session Delta (2026-04-05, CD7 — Rooms Bespoke Pass Recovery)

- `NEXT HIGH-VALUE ITEM`
  - resume CD7 on the locked rooms backlog:
    - revalidate row-mode phone density/truncation
    - revalidate row control isolation / route behavior
    - use targeted storage verification to separate true room-card debt from surface/config drift
- `CURRENT STATE`
  - prior CD7 closeout claims were withdrawn; treat the tranche as active again
  - current work now also includes a user-directed authenticated screenshot review harness for whole-dashboard/card-family review
  - card-behavior edits remain limited to `tunet_rooms_card.js`, `rooms_bespoke.test.js`, docs recovery, and minimal rehab-fixture cleanup
  - current passing baseline: `573` tests across `12` suites
- `ROOMS CARD`
  - row/slim phone density is being corrected without hiding orbs and without changing desktop spacing
  - orb and power controls must stay the same size
  - row controls must never trigger body navigation
  - row body pressed feedback and nested orb/power pressed feedback are now separate live states
  - invalid room-icon aliases like `sofa` / `couch` now normalize to a valid glyph (`weekend`) so slim/row cards do not render raw ligature text
  - desktop/base row typography and slim desktop typography were lifted for readability
  - row status now uses plain percent text instead of `% bri`
  - row lead icon now uses the same size family as the orb/power controls
  - row orb/power buttons expose hover titles from the room/light labels
  - tile tap = toggle is LOCKED per user direction; `tap_action` override when configured, hold navigates
- `REVIEW HARNESS`
  - permanent runner: `Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - repo scripts:
    - `npm run tunet:review`
    - `npm run tunet:review:smoke`
    - `npm run tunet:lab:screenshot`
  - auth inputs come from `.env` (`HA_LOCAL_URL`/`HA_URL`, `HA_USERNAME`, `HA_PASSWORD`)
  - output manifest + screenshots land under `/tmp/tunet-playwright-review/<timestamp>/`
  - default behavior is screenshot capture only; probes are opt-in via `--with-probes`
  - current smoke proof: `npm run tunet:review:smoke` passed on rehab `lab` at `390x844` light mode
- `BUILD / DEPLOY`
  - v3 deploy now restores automatic cache-busting by syncing the live Lovelace resource URLs after SCP
  - new helper: `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs`
  - helper auth comes from `.env` (`HA_LONG_LIVED_ACCESS_TOKEN` preferred, `HA_TOKEN` fallback; `HA_LOCAL_URL`/`HA_URL` for host)
  - `npm run tunet:deploy:lab` now updates all 13 `/local/tunet/v3/*.js?v=...` resource entries to the current manifest token
  - direct shell deploys via `Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh` also sync resources automatically
  - standalone repair path exists: `npm run tunet:resources:sync`
- `DOCS`
  - rooms docs and tranche docs are being brought back into active-CD7 state
  - a separate governance investigation logged a new `CD6` follow-on so the work is not rediscovered later: lighting desktop/full-width column gap is too tight at `1440x900` after the width-fill fix; root cause traced to shared `PROFILE_BASE.standard.tileGap = 0.375em` (6px) in tunet_base.js
  - CD8 weather target contract written in `cards_reference.md` §7: single-line details (icon-only, pressure dropped), flip-chip toggles in header, ~120px vertical savings on phone
  - visual_defect_ledger.md weather entries updated to reference the new target contract
- `REHAB LAB`
  - speculative overflow fixtures removed; use the existing `Overview Row`, `Overview Tiles`, `Overview Slim`, `No Lights / Info Only`, `Room Index`, and `phone-stress > Rooms` surfaces for acceptance
- `VALIDATION`
  - `node --check` passed on `tunet_rooms_card.js`
  - `node --check` passed on `tunet_playwright_review.mjs`
  - `node --check` passed on `build.mjs` and `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs`
  - `npm test`, `npm run tunet:build`, and `npm run tunet:deploy:lab` all passed in this recovery pass
  - live HA resource registry now shows all 13 Tunet v3 resources on `?v=build_20260405_175253Z`; stale static-resource drift is no longer the expected failure mode
  - user visually confirmed the row-vs-orb pressed-state split on live HA
  - targeted rehab screenshot review confirmed the slim raw-`sofa` icon bleed is fixed live after deploy
  - later rehab screenshot review at `390x844` and `1440x900` confirmed plain-percent row status text, row lead-icon parity with the orb/power controls, and improved desktop row/slim readability against climate-card captures
  - targeted storage overview screenshot review loaded, but `1440x900` still shows the rooms card in a narrow row composition that truncates labels aggressively; treat this as likely surface/configuration drift unless a card-local cause is proven
  - storage `rooms` route timed out waiting for Tunet cards in the screenshot harness
  - governance review command `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --view lab --cd CD6 --breakpoint 1440x900 --theme light` reproduced a lighting-card desktop follow-on: `Card Grid Compact`, `Card Scroll Standard`, and `Section Surface + Expand Groups` now feel over-packed horizontally because `.light-grid` uses full-width tracks but still inherits the shared `tile-grid` standard gap (`0.375em`)
  - live breakpoint validation is still the remaining gate before any CD7 closure claim

## Session Delta (2026-04-04, CD6 — Lighting Bespoke Pass)

- `CURRENT STATE`
  - CD6 implementation is landed and closed; tranche marker advanced to `CD7 — Rooms Bespoke Pass`
  - tests/build/deploy/resource bump are done
  - current passing baseline: 553 tests across 11 suites
  - current live deploy token: `?v=20260404_cd6b` (initial CD6 completion bump was `?v=20260404_cd6a`)
- `LIGHT TILE`
  - narrow horizontal mode added for phone-width readability
  - no new config keys; runtime interaction unchanged
- `LIGHTING CARD`
  - synthesized responsive defaults now come from `tile_size` when `column_breakpoints` is omitted
  - fill-width grid tracks replaced the old fixed-width/dead-space behavior
  - scroll layouts now include inline inset so the first tile is not clipped at scroll start
  - dense-name pressure is treated as config discipline: use explicit short names in dense fixtures (`Living`, `Dining`, etc.)
- `REHAB HARNESS`
  - rehab YAML remains the primary reproduction surface; long-name fixture work is no longer a CD6 closure gate
- `LIVE VALIDATION`
  - D2 visually confirmed fixed: grid tracks fill width with no dead gutters at `390x844`, `768x1024`, `1440x900`
  - D3 visually confirmed fixed: scroll cards retain left-edge clearance at `390x844`, `1440x900`
  - D4 confirmed present: info-tile keyboard semantics were already wired and remain intact
  - D1 is code-complete and test-covered; broader long-name handling was explicitly deferred rather than treated as a CD6 blocker
  - original CD6 audit did not flag desktop over-packing, but later governance review (2026-04-05) found a new follow-on at `1440x900`: the lighting grid column gap is too tight in the main desktop rehab variants even though the dead-space defect is fixed

## Session Delta (2026-04-04, CD5 — Utility Strip Bespoke Pass)

- `CURRENT STATE`
  - CD5 completed; tranche marker advanced to CD6
  - 527 tests passing (was 489), 10 suites, 13 cards build
  - deploy token: ?v=20260404_cd5d
- `ACTIONS CARD`
  - phone overflow fix: mode_strip and relaxed (compact:false) strips wrap with full-width chips; compact default strips scroll
  - layout helper consolidates getCardSize/getGridOptions — variant-aware min_columns and min_rows
  - aria-pressed on chips with state_entity; no new config keys
- `SCENES CARD`
  - header semantic: role="heading" aria-level="3", icon aria-hidden
  - getGridOptions tracks allow_wrap + show_header for intentional sizing
  - disabled chip dispatch guard in _activate
- `DOCS`
  - cards_reference.md, sections_layout_matrix.md, visual_defect_ledger.md updated
  - stale URLs normalized across CLAUDE.md, Tunet/CLAUDE.md, tunet_build_and_deploy.md
  - test count updated to 527

## Session Delta (2026-04-04, Control-Doc Normalization)

- `CURRENT STATE`
  - no tranche change: CD5 remains next
- `DOC NORMALIZATION`
  - `visual_defect_ledger.md` normalized against coherent-build evidence; stale claims downgraded; card defects vs composition constraints separated
  - `cards_reference.md` encodes whole-home usage contract (rooms=navigation, lighting=room-detail); stale closed-tranche wording removed
  - `legacy_key_precedence.md` actions-editor notes aligned with current contract
  - `sections_layout_matrix.md` wording corrected: CD4 card-level accepted, CD12 surface breakpoint validation still required

## Session Delta (2026-04-04, Post-CD4 Rehab Lab Expansion + Visual Audit)

- `REHAB YAML DASHBOARD`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml` is now a multi-view YAML review harness with:
    - `lab`
    - `states`
    - `surfaces`
    - `phone-stress`
    - `nav-lab`
  - all internal navigation paths target the YAML dashboard namespace:
    - `/tunet-card-rehab-yaml/...`
  - HA registration uses `tunet-card-rehab-yaml` to avoid collision with the storage dashboard `tunet-card-rehab-lab`
- `WHOLE-HOME REVIEW RULE`
  - treat `tunet-rooms-card` as the overview/navigation card
  - treat `tunet-lighting-card` as the detailed room light-control surface
  - rehab `surfaces` view now encodes that split with dedicated room-detail lighting stacks
- `VISUAL AUDIT LOG`
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` is now the running screenshot-first defect log
  - latest additions include:
    - card-by-card visual issues
    - doc/runtime mismatches
    - improvement backlog
    - editor/config issue: icon-bearing fields should use a dropdown or validated icon picker rather than raw free-form text
- `NEXT PRACTICAL START POINT`
  - CD5 remains the next implementation tranche
  - before changing behavior, use the YAML rehab dashboard and the visual defect ledger together:
    - YAML lab for branch/state/surface review
    - defect ledger for prioritized runtime/doc corrections

## Session Delta (2026-04-03, CD2 Closeout)

- `AUTHORITY-LOCK`
  - `~/.claude/plans/flickering-herding-wolf.md` is the sole execution authority (CD0–CD12).
- `CD2 CLOSURE`
  - All code gates green: 368/368 tests, 13-card build, deployed with ?v=20260403_cd2
  - Interaction test suites (212 tests) are the authoritative regression gate
  - Screenshot matrix: partial — 1440 light captured, remaining breakpoints pending user manual verification
- `VALIDATION POLICY (STRICT)`
  - tranche closure requires:
    - `node --check` on changed JS
    - YAML parse-check on changed YAML
    - `npm run tunet:build` when build outputs are affected
    - `npm test`
    - screenshots at all locked breakpoints in both dark and light mode

Source filter for this run:
- use `plan.md`, `FIX_LEDGER.md`, this `handoff.md`, and active plan files as control sources
- use `~/.claude/plans/flickering-herding-wolf.md` as the sole execution authority (CD0–CD12)
- use `Dashboard/Tunet/Docs/cards_reference.md` as per-card config contract + editor architecture (authoring model + synthesizer + runtime)
- use `Dashboard/Tunet/Docs/legacy_key_precedence.md` for setConfig overlap/fallback rules
- use `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` as the binding interaction contract
- use `Dashboard/Tunet/Docs/sections_layout_matrix.md` as provisional (requires validation when surface assembly resumes in CD12)
- agent review artifacts in `Dashboard/Tunet/Agent-Reviews/` are reference, not primary planning input

## Consistency-Driver Entry Checklist

Before starting any implementation tranche:
1. Read the execution plan — `~/.claude/plans/flickering-herding-wolf.md`
2. Identify the current tranche and verify you are working on ONLY the files listed for that tranche
3. Read `Dashboard/Tunet/Docs/cards_reference.md` — per-card config contract + editor architecture
4. Read `Dashboard/Tunet/Docs/legacy_key_precedence.md` — setConfig overlap/fallback rules
5. Read `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` — the interaction contract (relevant from CD2 onward)
6. Read `Dashboard/Tunet/AGENTS.md` — execution contract
7. Use the YAML card rehab dashboard (`http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`) as the primary validation surface during shared passes (CD1-CD4) and bespoke passes (CD5-CD11)
8. Use `tunet-suite-storage` only for targeted live verification where real entities are needed
9. Do NOT use `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` as an active execution driver before CD12
10. Do NOT widen a tranche beyond the exact files listed in the plan
11. Shared passes (CD1-CD4) do NOT solve bespoke behavior. Bespoke passes (CD5-CD11) do NOT reopen shared pattern design.
12. Respect the configuration support policy: `editor-complete` / `editor-lite` / `yaml-first` tier per card (see plan §4)

## Active Execution Order (CD0-CD12)

| Phase | Tranche | Scope |
|-------|---------|-------|
| Infrastructure | CD0 | Build architecture + rehab lab — **done** |
| | CD1 | Configuration clarity + editor policy — **done** |
| Shared consistency | CD2 | Shared interaction adoption (all 13 files) — **done** |
| | CD3 | Shared semantics adoption (9 files) — **done** |
| | CD3.1 | Dropdown clipping fix (1 file) — **done** |
| | CD4 | Shared sizing + Sections adoption (7 files) — **done** |
| Bespoke | CD5 | Utility strip bespoke — **done** |
| | CD6 | Lighting bespoke — **done** |
| | CD7 | Rooms bespoke — **next** |
| | CD8 | Environment bespoke |
| | CD9 | Media bespoke |
| | CD10 | Navigation verify |
| | CD11 | Status gate |
| Product | CD12 | Surface assembly |

## 0ZI) Session Delta (2026-04-02, Consistency-Driver Reset)

Program order changed twice in this session:

1. **Surface-first order superseded** by card-rehabilitation-first order
2. **Card-family-bucket order ALSO superseded** by consistency-driver pass order

Key corrections:
- **Old order** mixed shared pattern adoption with bespoke card behavior in the same tranche. That is the wrong execution unit.
- **Consistency-driver order** separates them: close each shared dimension once across an explicit file list (CD1-CD4), then solve file-specific behavior remaining (CD5-CD11), then assemble surfaces (CD12).
- **Configuration support policy** uses three tiers:
  - `editor-complete`: nav, scenes, light_tile, weather, sensor
  - `editor-lite`: lighting, rooms, climate, media, sonos, speaker_grid
  - `yaml-first`: actions, status
- **Best parts of the old plan are retained**: three-surface model, climate baseline, Browser Mod, locked breakpoints, no-destructive-cleanup, surface assembly order (Living Room → popup → overview → media → rooms)
- **Surface docs are draft reference** during card rehab: `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` is not an active gate until CD12
- **Next implementation tranche (historical at that time)**: CD1 (Configuration Clarity And Editor Policy)
- **Living Room surface assembly**: deferred to CD12

## 0ZH) Session Delta (2026-04-02, Tranche 0 — Contract Reconciliation)

Surface-driven reset initiated. Major governance changes:

- **Profile resolver contract superseded as policy**
  - Replacement: lightweight auto-size + hand-tuned CSS tile-size variants (em-based)
  - Legacy profile code stays for untouched cards; removal incremental per-surface
  - See: `Dashboard/Tunet/Agent-Reviews/profile_contract_supersession.md`
- **Surface-driven execution adopted**
  - Order: Living Room page → popup → overview → media → remaining rooms
  - Card work in service of surfaces, not front-loaded card-by-card redesign
  - Build migration (esbuild) sequenced AFTER Surface 1
- **Three-surface model ratified** (per plan.md:1041-1108)
  - `tunet-suite-storage` = primary UX evaluation
  - `tunet-suite-config.yaml` = architecture truth (repo)
  - `tunet-overview` = historical/comparison only
- **Em units preferred over px** for all sizing (user preference, Decision 6)
  - 16px em anchor (`:host { font-size: 16px }`) mandatory for all cards
  - Status card em-based shadows are the correct forward pattern
- **Playwright MCP connected** to HA at 10.0.0.21:8123 — visual feedback loop operational
- **4-agent design review completed** (Agent 2 HA research pending):
  - Agent 3: Climate card measured visual reference + 10 cross-card divergences (agent3_interaction_css_map.md)
  - Agent 4: Design doc merge critique — 7 findings, 3 critical (agent4_design_reconciliation_critique.md)
  - Dark amber: #fbbf24 confirmed correct; v8.3 #E8961E stale
  - Glass: code 0.68/0.72; v8.3 0.55/0.65 stale
  - Merge strategy: import §6/§11/§5/§10/§14 from v8.3; skip stale token tables
- **Control docs updated**: CLAUDE.md (all 4 levels), AGENTS.md, plan.md, FIX_LEDGER.md, this handoff
- **v3 regression fixes committed** (not deployed): getGridOptions rows:'auto' on 7 cards, nav G3.0 backport

Current Tranche 0 status: 0A (source-of-truth) ✓, 0B (scope locks) ✓, 0C (design docs) IN PROGRESS
Next: Write cross-card interaction state vocabulary, merge validated v8.3 sections into design_language.md, user review

## 0ZG) Session Delta (2026-03-13, T-011A.22)

Queued planning item only (no immediate package patch in this session):

- Issue captured:
  - `oal_v13_column_lights_prepare_rgb_mode` can miss when both columns are off at sunset crossing.
  - Later column-on events inside active sunset window may not arm RGB session automatically.
  - This can leave AL control active and produce purple/pink-leaning tone at low brightness on column strips.
- Planned remediation:
  - add late-on trigger coverage so `light.living_column_strip_light_matter` / `light.dining_column_strip_light_matter` turning on inside the active window runs the existing prepare path
  - keep existing guards:
    - descending sun window (`-5 <= elevation < 3`)
    - sleep mode off
    - manual list empty
    - OAL system not paused
- Scope lock:
  - docs/planning only in `T-011A.22`
  - no edits to `packages/oal_lighting_control_package.yaml` yet

## 0ZF) Session Delta (2026-03-09, T-011A.21)

Status bugfix-only hygiene pass completed:

- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - converted remaining `px` constants to `em` equivalents
  - includes CSS fallbacks, compact/large branches, subtype geometry constants, and inline style strings
  - converted dropdown placement runtime string from `4px` to `0.25em`
  - no interaction behavior changes
  - no new profile-architecture scope added
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- Classification:
  - treated as bugfix-only work under status deferral policy (`T-011A.20`)

## 0ZE) Session Delta (2026-03-09, T-011A.20)

Status deferral policy is now explicitly locked:

- `tunet_status_card.js` is deferred from the current unification gate sequence.
- Status remains bugfix-only until dedicated tranche `G3S`.
- Dedicated `G3S` scope is locked to:
  - lightweight subtype alignment (timer/alarm/dropdown/value) using existing shared tokens where low-risk
  - continued `px` -> `em` normalization and obvious inline sizing-formula cleanup where safe
  - unit + live breakpoint validation (`390x844`, `768x1024`, `1024x1366`, `1440x900`) with real HA entities
- Reclassification synced in:
  - `Dashboard/Tunet/Mockups/design_language.md`
  - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
  - `plan.md`
  - `FIX_LEDGER.md`
  - `handoff.md`

## 0ZD) Session Delta (2026-03-09, T-011A.19)

Profile token normalization pass completed (code + validation, no live deploy):

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
  - centralized additional profile lanes and token map aliases for:
    - header title/subtitle
    - display name/value/meta/action/icon
    - row display name/status + lead icon + control size/icon
    - status tile gap/top-bottom pad + timer display + dropdown value
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
  - profile header and tile name/value now consume centralized display/header aliases
  - local profile multiplier formulas removed
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - profile header/name/meta/value/action now consume centralized display/header aliases
  - local profile multiplier formulas removed
- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - profile lanes now consume centralized status/display/timer/dropdown tokens
  - local profile scaling formulas removed (kept minimal alignment-only profile rules)
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
  - grid + row typography/icon/control lanes now consume centralized display/row tokens
  - removed profile-size conditional row multiplier overrides
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
  - profile icon/label/value lanes now consume centralized display tokens
  - profile multiplier selectors removed
- base import cache-key sync:
  - updated v3 imports to `./tunet_base.js?v=20260309g7` in:
    - `tunet_lighting_card.js`
    - `tunet_speaker_grid_card.js`
    - `tunet_status_card.js`
    - `tunet_rooms_card.js`
    - `tunet_sensor_card.js`
    - `tunet_light_tile.js`
- Validation:
  - `node --check` passed for base + lighting + speaker + status + rooms + sensor + light_tile + resolver test file
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- Live status:
  - no HA upload/resource bump in this tranche yet (`CODE-DONE / HA-VERIFY`)

## 0ZC) Session Delta (2026-03-09, T-011A.18)

Rooms row follow-up deployed:

- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
  - row lead icon reduced
  - compact row sub-buttons enlarged
  - standard row text reduced slightly
  - all-on/off and orb sub-buttons now share the same size variable (`--row-btn-size`)
- Live resource update:
  - rooms: `/local/tunet/v3/tunet_rooms_card.js?v=20260309_g348`
- Validation:
  - `node --check` passed

## 0ZB) Session Delta (2026-03-09, T-011A.17)

Status/sensor profile readability follow-up (live deployed):

- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
  - profile lane balance tuned:
    - icon lane scale increased
    - bottom label lane scale increased
    - bottom tile padding increased to prevent label-edge collision
    - middle/bottom lane line-height + centering normalized for more even vertical alignment
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
  - applied light-tile parity tuning to profile mode:
    - icon scale bump
    - label lane size bump
    - value lane line-height/size adjustment
- Live deploy + resource bumps:
  - status: `/local/tunet/v3/tunet_status_card.js?v=20260309_g347`
  - sensor: `/local/tunet/v3/tunet_sensor_card.js?v=20260309_g347`
- Validation:
  - `node --check` passed for both changed files

## 0ZA) Session Delta (2026-03-09, T-011A.16)

v3 live tuning + environment profile adoption:

- Status profile readability corrections deployed:
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile lane spacing tightened (middle value no longer drops too low)
    - profile icon lane enlarged
    - profile text lanes aligned to lighting parity formulas (middle + bottom readability)
    - timer/dropdown profile text lane bumps
- Rooms profile readability + controls corrections deployed:
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - profile tile and row text lanes aligned to lighting parity formulas
    - row controls rebalanced:
      - per-room power button reduced
      - per-light orb controls increased
      - spacing widened
    - pointer-up guard added so interactions in `.room-row-controls` do not trigger tile-body row actions
- Environment card moved into profile scope:
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - added `tile_size` + `use_profiles`
    - profile selection/resolution wired to `indicator-row`
    - host/container resize profile re-selection added
    - row internals now consume profile tokens (icon/text/value/unit/sparkline/trend geometry)
    - `getGridOptions()` updated to intrinsic rows (`rows: 'auto'`, bounded)
- Lab dashboard expanded:
  - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - sensor permutations now include legacy/profile compact/standard/large comparisons
- Live deploy completed:
  - uploaded to HA:
    - `/homeassistant/www/tunet/v3/tunet_status_card.js`
    - `/homeassistant/www/tunet/v3/tunet_rooms_card.js`
    - `/homeassistant/www/tunet/v3/tunet_sensor_card.js`
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - resources now active:
    - status: `/local/tunet/v3/tunet_status_card.js?v=20260309_g346`
    - rooms: `/local/tunet/v3/tunet_rooms_card.js?v=20260309_g346`
    - sensor: `/local/tunet/v3/tunet_sensor_card.js?v=20260309_g346`
- Validation:
  - `node --check` passed for status/rooms/sensor v3 files
  - YAML parse check passed for `tunet-g2-lab-v3.yaml`
  - resolver unit tests remain green (`8/8`)

## 0Z) Session Delta (2026-03-09, T-011A.15)

v3 G3 + G4 + G5 rollout tranche completed (code + validation, no live deploy in this slice):

- Completed (G3):
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile pipeline wired (`selectProfileSize` + `resolveSizeProfile` + `_setProfileVars`)
    - added config controls: `use_profiles`, `tile_size`
    - profile applies on setConfig + first render + host resize
    - width source for responsive columns is now container/host only (`window.innerWidth` removed)
    - status subtype geometry moved to profile token lanes:
      - timer font/letter-spacing -> `--_tunet-timer-font`, `--_tunet-timer-ls`
      - alarm pill/buttons -> `--_tunet-alarm-pill-font`, `--_tunet-alarm-btn-h`, `--_tunet-alarm-btn-font`, `--_tunet-alarm-icon-size`
      - dropdown max-height/options -> `--_tunet-dropdown-max-h` + dd option/radius tokens
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - profile pipeline wired with layout-aware family routing:
      - `layout_variant: 'tiles'` -> `tile-grid`
      - `layout_variant: 'row'|'slim'` -> `rooms-row`
    - added config controls: `use_profiles`, `tile_size`
    - profile applies on setConfig + render + host resize
    - row/grid geometry now consumes `--_tunet-*` lanes (icon/text/row/orb/toggle/chevron)
    - slim variant row min-height now derives from profile row height (`~70%` target)
- Completed (G4):
  - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - standalone tile now consumes `tile-grid` profile tokens on host
    - added config controls: `tile_size`, `use_profiles`
    - `_applyProfile()` pattern added with host var writes
    - drag/tap/hold behavior preserved
    - host resize observer added for profile auto-size updates
- Completed (G5 hardening):
  - `getGridOptions()` now returns intrinsic rows (`rows: 'auto'`) with static row bounds on:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - removed viewport fallback from profile width helpers in:
    - `tunet_lighting_card.js`
    - `tunet_speaker_grid_card.js`
- Validation:
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

Carry-forward:
- Nav offset neutralization for strict G3 section-baseline verification remains operationally required in live test runs (`tunet_nav_card.js` was not changed in this tranche).
- Environment/indicator-row profile adoption note from `T-011A.15` is superseded by `T-011A.16` (now in scope and deployed).

## 0W) Session Delta (2026-03-09, T-011A.12)

v3 G2 lab dashboard deployment + lighting profile regression fixes:

- Completed:
  - created repo lab dashboard:
    - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
  - uploaded to HA:
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - registered new HA YAML dashboard:
    - key: `tunet-g2-lab-v3`
    - route: `/tunet-g2-lab-v3/g2-profiles-lab`
  - uploaded active v3 modules to HA:
    - `/homeassistant/www/tunet/v3/tunet_base.js`
    - `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
    - `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
- Temporary resource conflict isolation (for clean v3 lab):
  - removed conflicting v2_next resources:
    - lighting resource id `87583f8b00bb48f095e55cc4799fe320`
    - speaker resource id `7b2db9a10be04e80b7f662ead83194ef`
  - active v3 resources:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix1`
    - `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab`
- User-reported lighting fixes applied:
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - profile mode tile names no longer collapse (minimum profile tile height floor + non-shrinking name/value lanes)
    - drag bubble pill no longer clipped at top (sliding overflow visible + pill position adjustment)
    - profile mode brightness value lane scaled down slightly
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - HA `check_config` valid
  - HA restart completed successfully

## 0X) Session Delta (2026-03-09, T-011A.13)

v3 lighting profile mode follow-up fixes (lane sizing + overlap):

- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
  - fixed profile-mode desktop tile overlap:
    - profile grid row height now matches tile min-height floor (`max(var(--_tunet-tile-min-h, 110px), 6.25em)`)
  - fixed mode leakage:
    - lane stability constraints are now profile-scoped only (`:host([use-profiles])`) to avoid legacy-mode side effects
  - profile readability tuning retained:
    - larger profile tile name
    - slightly smaller profile lower value lane
- Live deploy:
  - uploaded `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
  - active resource bumped:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix3`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed

## 0Y) Session Delta (2026-03-09, T-011A.14)

Speaker profile readability parity pass:

- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - increased profile-only typography for:
    - top-left header title/subtitle
    - speaker tile name/meta/value lanes
    - group action strip button text
  - legacy mode remains untouched (`:not([use-profiles])` behavior preserved)
- Live deploy:
  - uploaded `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
  - active resources:
    - lighting `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix4`
    - speaker `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab_fix1`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed

## 0V) Session Delta (2026-03-09, T-011A.11)

v3 G2 pilot wiring (lighting + speaker profile consumption):

- Conflict carry-forward:
  - docs still list `Dashboard/Tunet/Cards/v2/` as canonical implementation authority
  - active tranche remains in `Dashboard/Tunet/Cards/v3/` by explicit user override (`T-011A.10`)
- Completed:
  - wired profile APIs into:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - both cards now:
    - consume `selectProfileSize(...)`, `resolveSizeProfile(...)`, `_setProfileVars(...)`
    - support `use_profiles: true|false` rollback flag (`true` default)
    - apply profile on config set + initial render + host resize
    - stamp host attributes `profile-family` and `profile-size` in profile mode
    - keep legacy tile-size geometry path when `use_profiles: false`
  - lighting card specifics:
    - profile-driven lanes wired for card/header/tile/icon/text/progress geometry
    - legacy compact/large CSS branches gated behind `:not([use-profiles])`
    - host-resize path now rebuilds when profile size bucket changes
  - speaker card specifics:
    - profile-driven lanes wired for card/header/tile/icon/text/progress geometry
    - added host `ResizeObserver` + window fallback for profile re-selection
    - retained narrow-tile container-query adaptation behavior
    - legacy compact/large CSS branches gated behind `:not([use-profiles])`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (8/8)
- Scope:
  - JS + control-doc sync only
  - no YAML/storage/deploy actions in this tranche

## 0U) Session Delta (2026-03-08, T-011A.10)

v3 sandbox bootstrap + G1 base primitives start:

- Conflict recorded:
  - docs lock `Dashboard/Tunet/Cards/v2/` as implementation authority
  - user explicitly directed active work to proceed from `Dashboard/Tunet/Cards/v3/`
- Chosen interpretation:
  - `v3` is active G1 sandbox path by user override
  - `v2` remains canonical production authority until explicit promotion/cutover
- Completed:
  - committed v3 baseline copy:
    - `32dde28` `chore(cards): bootstrap v3 from v2 baseline`
  - implemented G1 primitives in:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
      - `PROFILE_SCHEMA_VERSION`
      - `PROFILE_BASE` + `SIZE_PROFILES` (all-em, 5 families, 3 sizes)
      - `PRESET_FAMILY_MAP`, `autoSizeFromWidth`, `bucketFromWidth`
      - `selectProfileSize({ preset, layout, widthHint, userSize? })`
      - `resolveSizeProfile({ family, size })` with one-gate `widthHint` shim warning
      - `_setProfileVars()` full clear+set for `--_tunet-*`
  - added unit tests:
    - `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (8/8)

## 0T) Session Delta (2026-03-08, T-011A.9)

Design-language registry-shape consistency sync:

- Conflict fixed:
  - `Dashboard/Tunet/Mockups/design_language.md` §5.5 still showed an old numeric `PROFILE_BASE` snippet
  - active architecture lock (`unified_tile_architecture_conclusion.md` v3.1) requires size-indexed, all-em `PROFILE_BASE`
- Resolution:
  - replaced §5.5 snippet with size-indexed all-em base example
  - added explicit pointer to canonical full registry table in architecture doc §7
- Scope:
  - docs only
  - no runtime code changes

## 0S) Session Delta (2026-03-08, T-011A.8)

Control-doc alignment + tranche-order reconciliation:

- Conflict recorded:
  - this file's active queue emphasizes one-surface orchestration (`0K`)
  - latest profile architecture carry-forward states next implementation step is `G1` base primitives
- Chosen interpretation for next run:
  1. close remaining `G0` doc decisions/sign-off items
  2. execute `G1` in `Dashboard/Tunet/Cards/v2/tunet_base.js`
  3. resume one-surface `FL-038` loop (Living Room page -> popup -> overview -> media -> remaining rooms)
- Scope:
  - docs sync only
  - no runtime code changes

## 0R) Session Delta (2026-03-07, T-011A.6b)

Interaction-contract reconciliation lock:

- Active room interaction contract:
  - card-body tap = primary route action (`navigate` preferred)
  - explicit controls/orbs/buttons = toggle actions
  - hold = optional secondary popup behavior only where configured
- Any legacy `tap-toggle / hold-popup` wording is historical and non-authoritative.
- If lower sections conflict with this lock, this `0R` section wins.
- Scope:
  - docs reconciliation only
  - no runtime behavior changes in this slice

## 0Q) Session Delta (2026-03-07, T-011A.6)

Profile consumption architecture finalized (later expanded to v3.1) — implementation-ready with Codex prompt:

- Created files:
  - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` (v3.1, 1565 lines) — sole architecture authority
  - `Dashboard/Tunet/Agent-Reviews/start.md` — start guide for profile rollout execution
  - 14 additional Agent-Reviews artifacts from multi-agent review wave
  - 9 additional Docs files (mobile density audits, sections matrix, popup fix, weather refactor)
- Architecture decisions locked (D1–D22):
  - D2: 5 families (`tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row`)
  - D4: Two-function API (`selectProfileSize` decides family+size, `resolveSizeProfile` is pure lookup)
  - D5: Resolver accepts `{ family, size }` only — no widthHint, no densityMode
  - D8: Three sizes only (`compact`, `standard`, `large`); compact IS dense mode; no separate density axis
  - D9: Two-name CSS var protection (`--profile-*` public hooks, `--_tunet-*` internal aliases consumed by tile-core)
  - D12: Feature flag `use_profiles: true|false` with `_applyLegacyScaling()` rollback preserved until G6
  - D13: Version handshake failure renders visible in-card error via `_renderError()`
  - D15: Two-tier versioning (public config keys get migration shims; internal registry tokens get unit tests only)
- Gate model finalized:
  - G0: Documentation prerequisites (pending owner sign-off)
  - G1: Base primitives in `tunet_base.js` + width-source fixes (21 unit test assertions specified)
  - G2: Two-card pilot (`tunet_lighting_card.js` + `tunet_speaker_grid_card.js`)
  - G3: Interaction-heavy families (`tunet_status_card.js` + `tunet_rooms_card.js`); requires nav neutralization pre-gate
  - G4: Standalone tile alignment (`tunet_light_tile.js`)
  - G5: Sections integration validation (`getGridOptions()` with `rows: auto` strategy)
  - G6: Cleanup — remove legacy code after 30-day soak
- Key architecture clarifications resolved via gap review:
  - Profile resolver sits downstream of deepMerge pass (read-only consumer of merged config)
  - `PRESET_FAMILY_MAP` is a static lookup; rooms preset maps to `tile-grid` or `rooms-row` based on `mergedConfig.layout`
  - tile-core is exclusive consumer of core `--_tunet-*` lane tokens; family components read only extension tokens
  - `_setProfileVars()` clears all `--_tunet-*` then sets new family tokens on `this` (card host, not shadowRoot)
  - `_applyProfile()` is single convergence point for both setConfig and ResizeObserver triggers
  - Profiles are mode-agnostic (geometry only, no color/opacity/dark-light branching)
- Open issues noted in review (non-blocking for G1):
  - `orbSize` numeric conflict between registry (32px standard) and G3 exit criteria (26px) — reconciled in v3.1 (now em-based, scales with profile size)
  - Missing cards from §2 out-of-scope table (climate, scenes, actions, sensor) — added in v3.1
  - Slim scaling mechanism unspecified (CSS class vs calc vs hardcoded) — unchanged, remains CSS class approach
  - `getComputedStyle` in bridge code forces layout reflow (acceptable if infrequent) — unchanged
- Scope:
  - docs + architecture only
  - no card runtime behavior changes
  - no deploy/cache-bust actions

Carry-forward:
- Profile architecture v3.1 finalized. G0 documentation prerequisites are pending tranche owner sign-off. Next implementation step: G1 base primitives in `tunet_base.js`.
- `start.md` is the Codex-ready implementation prompt — hand off to Codex or implement directly
- v3.1 expanded the registry to all-em with size-indexed `PROFILE_BASE` (D18-D22). The orbSize conflict and missing out-of-scope cards are resolved. Remaining open items (slim mechanism, getComputedStyle) are non-blocking for G1.

## 0P) Session Delta (2026-03-07, T-011A.5)

Design-guideline documentation was fully rewritten and re-structured (docs-only tranche):

- Updated files:
  - `Dashboard/Tunet/Mockups/design_language.md`
  - `Dashboard/Tunet/design.md`
- What changed:
  - canonical design spec was rewritten as V2 implementation contract (`v9.0`)
  - canonical source lock now explicitly names `Dashboard/Tunet/Cards/v2/` as implementation authority
  - profile-system direction locks are embedded directly in design guidance:
    - five family keys (`tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row`)
    - rooms family routing depends on merged layout (`row` vs grid)
    - API split lock: `selectProfileSize(...)` decides family+size; `resolveSizeProfile({ family, size })` is pure lookup
    - token ownership lock: card host writes, `tile-core` consumes core lanes, family extensions consumed only by owning components
    - container-first width source, sections compatibility contract, and mode-agnostic profile policy
  - `Dashboard/Tunet/design.md` now acts as a concise documentation map to prevent guidance drift
- Scope:
  - docs only
  - no card runtime behavior changes
  - no deploy/cache-bust actions

## 0O) Session Delta (2026-03-07, T-011A.4)

Container-width prerequisite work started (`G0` partial, code + docs sync):

- Updated files:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- What changed:
  - base responsive density now uses `@container (max-width: 440px)` as primary path
  - base keeps viewport media query only as fallback when container queries are not supported
  - status card responsive columns now use `ResizeObserver` primary and only fall back to `window.resize` when `ResizeObserver` is unavailable
  - lighting card now resolves responsive columns and compact thresholds (`<=440`, `<=640`) from host/container width, not viewport `innerWidth`/`matchMedia`
  - lighting host resize now uses `ResizeObserver` primary with `window.resize` fallback only when needed
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed
- Scope:
  - no YAML/deploy/cache-bust actions in this slice

Carry-forward:
- `G0` is still open until nav global offset isolation is completed in `tunet_nav_card.js` (`ensureGlobalOffsetsStyle` scope control)
- after nav isolation, next step is `G1` profile primitives in `tunet_base.js`

## 0N) Session Delta (2026-03-07, T-011A.3 prep)

> **Superseded:** Architecture decisions in this section were finalized in `unified_tile_architecture_conclusion.md` v3.1. Values and structure here are historical.

Decision-path planning for card-size unification was advanced (docs only, no runtime behavior change):

- Updated:
  - `Dashboard/Tunet/Agent-Reviews/type_profile_consumption_options.md`
- Added decision-ready framing:
  - weighted option scoring applied (`A/B/C/D`), with `Option C` locked at `8.15/10`
  - recommended path: `Option C` (family profile consumption), with gated rollout
  - explicit dependency order before profile work:
    1. container-first width-source migration
    2. nav global layout mutation isolation (`ensureGlobalOffsetsStyle`)
    3. phased profile rollout gates
  - explicit gate sequence (`G0`..`G5`) and acceptance checks
  - profile contract draft (`schema v1`) + width-source standardization requirement (container-first)
  - explicit conflict interpretation for parity-lock pathing (`Cards/` vs active `Cards/v2/`)
  - explicit direction lock: rooms `row/slim` modeled as one family profile with modifiers
  - explicit direction lock: skip Option B pilot; run Option C pilot directly
  - added post-pilot `getCardSize()`/`getGridOptions()` calibration gate

Scope:
- no JS/YAML changes
- no deploy/cache-bust actions
- no interaction contract changes

Carry-forward:
- Profile architecture v3.1 finalized. G0 documentation prerequisites are pending tranche owner sign-off. Next implementation step: G1 base primitives in `tunet_base.js`.

## 0M) Session Delta (2026-03-07, T-011A.2)

Focused rooms row-mode cleanup landed:

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - rooms-row mobile density tokens now scale down (instead of larger-than-desktop)
  - section all-toggle mobile token sizing reduced for readability
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.9.2`)
  - row all-toggle button + per-light orbs share matched box-model sizing
  - row main icon reduced so text lane has more readable space
  - row status precedence fix:
    - if `humidity_entity` or `temperature_entity` is configured, unlabeled brightness `%` is suppressed
    - brightness appears as labeled `bri` only when ambient entities are not configured

Scope:
- no nav/popup contract changes
- no dashboard YAML structure changes

Live deploy:
- `/config/www/tunet/v2_next/tunet_base.js` uploaded
- `/config/www/tunet/v2_next/tunet_rooms_card.js` uploaded
- resource cache-bust set:
  - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p09`

Validation:
- `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
- `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## 0L) Session Delta (2026-03-07, T-011A.1)

Focused visual parity update landed for lighting tiles:

- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - aligned lighting tile hover/press polish with rooms tile behavior
  - enforced circular icon-wrap geometry and icon sizing parity
  - strengthened off/unavailable icon-wrap circle visibility
  - compact/condensed tiles now scale proportionally:
    - icon lane shrinks first
    - name/value/progress lanes are protected from overlap
    - dense compact grids (`columns >= 5`) apply tighter compact scaling

Scope:
- no interaction-model changes
- no nav/popup behavior changes
- no dashboard YAML layout changes

Live deploy:
- `/config/www/tunet/v2_next/tunet_lighting_card.js` uploaded
- resource cache-bust set:
  - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p08`

Validation:
- `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed

## 0K) Next Execution Queue (Top Priority, Active)

Use this queue first. Do not start multi-surface polish until Surface 1 is locked.

### `P0` (Do Next)

1. **Surface 1: Living Room page orchestration lock**
   - Produce a concrete page spec using the Sections 3-layer model:
     - page level: `max_columns`, `dense_section_placement`
     - section level: `column_span` / `row_span`
     - card level: `grid_options`
   - Define explicit `hero` / `companion` / `support` roles and first-touch interaction order.
   - Validate at: `390x844`, `768x1024`, `1024x1366`, `1440x900`.
   - Record lock outcome in:
     - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
     - `handoff.md`

2. **Surface 2: Living Room popup (matching pair)**
   - Lock popup composition to complement the room page (quick controls, not page replacement).
   - Keep Browser Mod + browser-scoped popup triggers direction lock.
   - Validate paired behavior with room page across phone/tablet/desktop.

3. **Surface 3: Overview page orchestration**
   - Build a deliberate overview composition from roles first, not local span tweaks.
   - Lock scan order and first-touch priorities, then set section/card sizing.
   - Validate against same breakpoint matrix and record decisions.

### `P1` (After P0)

1. **Surface 4: Media page orchestration lock**
2. **Surface 5: Remaining room pages (`Bedroom`, `Kitchen`, `Dining`)**
   - apply locked template from Surface 1
   - document only room-specific deltas

### Active interpretation note

- Earlier `P0` items around token/readability/rooms-row/weather were heavily implemented in card code.
- Treat those items as verification/backlog unless a concrete regression is reproduced.

## 0J) Prior Queue (Verification Backlog)

Use this queue for validation and residual cleanup after `0K/P0` surface locks.

### `P0` (Do Next)

1. **Mobile conventions live verification + tuning (token-first)**
   - Validate new readability standards on real mobile views (overview + rooms + one room subview).
   - Apply fixes in `Dashboard/Tunet/Cards/v2/tunet_base.js` first; use per-card overrides only if unavoidable.
   - Focus checks:
     - edge whitespace reduction
     - readable labels/values/status text
     - no clipping/overlap
     - row status readable with max 2 lines

2. **Rooms row interaction lock verification**
   - Confirm behavior matches lock everywhere row variant is used:
     - sub-buttons toggle individual lights only
     - right-side control toggles all room lights
     - card-body tap navigates to room page
   - If drift appears, fix contract in `tunet_rooms_card.js` (not dashboard-local hacks).

3. **Weather live validation under real provider data**
   - Verify precipitation mode with current weather provider output:
     - non-zero precip fallback behavior
     - hourly precip count parity with `forecast_days`
     - compact toggle/layout containment on narrow mobile widths
   - If provider schema differs, patch fallback mapping in `tunet_weather_card.js`.

### `P1` (After P0)

1. **Complete semantic typography token adoption across remaining card families**
   - Migrate remaining v2 cards still using hardcoded mobile type scales.
   - Keep central token ownership in `tunet_base.js`; track intentional exceptions only.

2. **Cross-surface mobile density unification pass**
   - Normalize compact/standard readability and whitespace across:
     - lighting/light-tile/media/sonos/speaker-grid/climate/nav.
   - Ensure consistent perceived size hierarchy across cards.

3. **Sections orchestration lock (view-by-view)**
   - Continue deliberate Page -> Section -> Card design loop using `sections_layout_matrix.md`.
   - Lock one surface at a time with live breakpoint validation.

### Scope Filter (Important)

- There are many historical in-flight edits/artifacts in this worktree.
- Do **not** pull old unrelated WIP into current execution by default.
- Before each tranche, take a backup snapshot (commit or branch point), then run a quick WIP triage:
  - classify each candidate item as:
    - `continue` (active and required for current tranche),
    - `finish-now` (nearly done and should be closed immediately),
    - `archive` (historical/no longer aligned).
- For each non-trivial historical item, explicitly ask:
  - **“Do you want to continue this, finish it now, or archive it?”**
- Only carry forward items explicitly marked `continue` or `finish-now`.

## 0I) Mobile Conventions Lock (New Standard)

This is now a **locked implementation convention** for all Tunet v2 cards:

- Mobile density and type should be driven from **central styling tokens** in:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Prefer token/system fixes over one-off per-card font/spacing patches whenever possible.
- Mobile goal:
  - **minimize edge whitespace** around/inside cards
  - **maximize readability** (labels/values/status text) without oversized/shouty UI
  - maintain hierarchy (title/value/subtext) and avoid clipping/overlap

### Current standard targets (from latest pass)

- Mobile label baseline target: `13px` equivalent.
- Row card status text is allowed to use up to **2 lines** (readability over truncation).
- Row-card interaction lock:
  - sub-buttons toggle individual lights
  - room all-toggle is a single right-side control
  - tapping card body navigates to room page

### Central token direction (implemented)

`tunet_base.js` now includes semantic type roles intended for cross-card use:

- `--type-label`, `--type-sub`, `--type-value`, `--type-chip`
- `--type-row-title`, `--type-row-status`
- mobile counterparts:
  - `--type-label-mobile`, `--type-sub-mobile`, `--type-value-mobile`, `--type-chip-mobile`
  - `--type-row-title-mobile`, `--type-row-status-mobile`
- row readability helpers:
  - `--row-line-height-title`, `--row-line-height-status`, `--row-status-max-lines`

### Changes landed in this pass

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - added semantic typography roles + mobile mappings in responsive token layer
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - row-mode text now references semantic row tokens
  - row status allows wrapped readability (2-line clamp)
  - retained locked interaction model (card-body navigate, sub-buttons own toggles)
  - room config supports optional `humidity_entity` in row status display
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - value/label/secondary typography moved to semantic type token usage
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - chip text now references semantic chip token
- `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - chip/header text now references semantic type/chip tokens
- `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - label/sub/value/unit tied to semantic type roles (sensor remains readability reference)
- `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
  - significant refactor landed (precip fallback robustness, tighter layout, readability, toggle containment)

### Carry-forward rule for next agent

- If readability/whitespace issues recur across more than one card family:
  1. adjust `tunet_base.js` tokens first,
  2. then apply minimal card-level overrides only where required.
- Avoid introducing another isolated “card-local typography system.”

## 0H) Session Delta (2026-03-07, T-010C.2)

Focused reliability tranche implemented and deployed:

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `navigatePath()` hardened for popup/navigation reliability:
    - dispatches `hass-navigate` from card element, then document, then window
    - retains history/location fallback for environments where event listeners do not intercept
  - `runCardAction()` now passes source element into `navigatePath()` for both:
    - `action: navigate`
    - in-app `action: url` paths (`/path` and `#hash`)
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` (`v2.4.3`)
  - base import bumped to `tunet_base.js?v=20260307p05`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.6`)
  - base import bumped to `tunet_base.js?v=20260307p05`

Live deploy completed:
- uploaded changed files to `/config/www/tunet/v2_next/`
- HA resources cache-busted:
  - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p06`
  - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p06`

Validation:
- `node --check` passed for all touched JS files in this tranche.

## 0G) Session Delta (2026-03-07, T-010B)

Focused P0 tranche implemented and deployed:

- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (`v0.2.3`)
  - expanded global bottom-offset styling to include Sections and non-`hui-view` hosts
  - added resize-mode/offset reflow and measured mobile dock clearance
  - replaced hardcoded `+48px` offset math with measured/configured max + safe area
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - increased centralized room-row control tokens (orb/toggle/header all-toggle) for mobile readability
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.5`)
  - fixed row control sizing mismatch:
    - `.room-action-btn` no longer downscales icon lane relative to orb controls
    - `.room-orb` now has fixed flex/min-width sizing parity with row toggle button
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` (`v3.4.4`)
  - increased compact/mobile lane spacing and progress clearance to reduce value/name overlap
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` (`v1.0.2`)
  - reinforced vertical lane spacing (name/value/progress relationship)

Live deploy completed:
- uploaded changed files to `/config/www/tunet/v2_next/`
- HA resources cache-busted:
  - `/local/tunet/v2_next/tunet_nav_card.js?v=20260307_p04`
  - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p04`
  - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p04`
  - `/local/tunet/v2_next/tunet_light_tile.js?v=20260307_p04`

Validation:
- `node --check` passed for all touched files in this tranche.

## 0E) Session Delta (2026-03-07, T-010A)

Focused `P0-1` tranche implemented and deployed (`shared density/icon/readability`):

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - icon baseline normalized (`wght/GRAD/opsz`, line-height, overflow visible)
  - mobile density tokens adjusted for control/dropdown readability
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`v2.6.4`)
  - increased compact/standard/large tile vertical budgets to reduce clipping
  - improved compact dropdown value text readability
  - fixed responsive column source to use rendered card/container width via `ResizeObserver` (instead of viewport width)
  - base import bumped to `tunet_base.js?v=20260307p01`
- `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js` (`v0.1.1`)
  - increased compact chip typography/icon sizing
  - reduced over-tight compact density
  - base import bumped to `tunet_base.js?v=20260307p01`
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` (`v2.4.1`)
  - increased action-strip chip text/icon size and touchable height
  - base import bumped to `tunet_base.js?v=20260307p01`

Live deploy completed:
- uploaded updated files to `/config/www/tunet/v2_next/`
- HA dashboard resources cache-busted:
  - `/local/tunet/v2_next/tunet_status_card.js?v=20260307_p01`
  - `/local/tunet/v2_next/tunet_scenes_card.js?v=20260307_p01`
  - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p01`

Validation:
- `node --check` passed for all touched files:
  - `tunet_base.js`, `tunet_status_card.js`, `tunet_scenes_card.js`, `tunet_actions_card.js`

## 0F) Session Delta (2026-03-07, T-010A.1)

Focused follow-up micro-fix:

- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.2`)
  - increased Rooms header `All On/All Off` button size (desktop + mobile)
  - no behavior/interaction contract changes in this slice

Live deploy:
- uploaded `tunet_rooms_card.js` to `/config/www/tunet/v2_next/`
- resource cache-bust:
  - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p02`

Validation:
- `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## 0B) Session Delta (2026-03-06 Late 3)

Completed focused `R1` tranche (`T-009F`) plus sections-model correction:

- Card-gallery layout model correction (`Dashboard/Tunet/tunet-suite-config.yaml`):
  - reverted incorrect section/view span compression
  - restored section structure (`max_columns: 12`, original `column_span` flow)
  - moved width control to card-level `grid_options` in YAML
  - added explicit climate+weather side-by-side section pattern (`column_span: 4`, each card `grid_options.columns: 18`)
- Weather refactor implemented (`Dashboard/Tunet/Cards/v2/tunet_weather_card.js`, `v1.6.0`):
  - precipitation fallback keys (probability + amount)
  - hourly-precip parity rule (`hourly precip count = forecast_days`)
  - tighter forecast tile density
  - stronger segmented-toggle containment in narrow cards
- R1 density/readability follow-up:
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js` (`v3.1.3`)
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js` (`v3.2.2`)
- Validation:
  - `node --check` passed for weather/speaker-grid/media
  - YAML parse check passed for `Dashboard/Tunet/tunet-suite-config.yaml`

## 0C) Session Delta (2026-03-06 Late 4)

User clarified a critical interpretation correction for tile visuals:

- The issue is **not** “content should be centered.”
- The issue is **vertical lane alignment regression** across tile families:
  - room name line
  - brightness/status value line
  - progress/brightness bar lane
- This appears across multiple tile surfaces (rooms, lights, related tiles), so next agent must treat this as a cross-surface alignment bug, not a one-card tweak.
- Root-cause path to inspect first:
  - shared/base style behavior in `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - then tile-specific offsets in:
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`

Implementation constraint from user:
- Do **not** “fix” by globally re-centering card content.
- Fix lane alignment relationship so value text aligns correctly between name and bar.

## 0D) Reality Correction (2026-03-06 Late 5)

Critical correction for next agent:

- Prior notes that sounded like "`R1` completed" should be interpreted as **partial code pass only**, not end-state acceptance.
- Cross-family sizing/readability consistency is still not solved across the full v2 suite.
- Multiple cards were adjusted, but not all card families were validated live at phone/tablet/desktop breakpoints after these changes.
- The project still needs a full deliberate Sections architecture pass for the final dashboard, not incremental local span edits.

Practical truth:
- Some focused improvements landed (weather/media/speaker-grid refinements, card-gallery `grid_options` model correction).
- However, large portions remain unverified or still drifted in real usage.

## 0A) Session Delta (2026-03-06 Late 2)

Completed focused mobile-density tranche `T-009E`:

- Shared baseline:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - added centralized density tokens for mobile card/section/tile/control/dropdown sizing
    - wired shared surfaces to use those tokens
    - added `text-size-adjust` guard for iOS consistency
- Adoption in high-impact tiles:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Cache path safety:
  - all v2 cards now import `tunet_base.js?v=20260306g3`
- Parallel audit docs added for remaining cards:
  - `Dashboard/Tunet/Docs/mobile_density_audit_weather_climate.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_media_audio.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_sensor_actions_scenes.md`
  - `Dashboard/Tunet/Docs/mobile_density_crosscard_gap_review.md`
  - `Dashboard/Tunet/Docs/mobile_density_master_matrix.md`

## 0) Session Delta (2026-03-06 Late)

Completed in current pass:

- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - increased compact readability (value/label/secondary sizing)
  - enforced stable tile row heights for visual consistency
  - raised dropdown layering (`dd-open`/menu z-index) to reduce overlap clipping
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - increased row/slim mobile orb/action/icon sizes for touch usability

New docs created for next implementation slices:

- `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
  - full issue matrix + tranche plan for weather precip/view-density/toggle containment refactor
- `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
  - root cause and resolution guidance for status/chips readability + dropdown layering
- `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
  - root cause analysis and recommended fix path for brightness/status vertical drift

## 1) Session Objective
Build and deploy a production-quality Tunet dashboard system with:
- native HA sections view
- 5+ pages plus room popups
- unified micro-interaction model
- reusable v2 custom cards
- storage dashboard deployment for live testing

User preference is explicit: prioritize complete, working UI surfaces first, then polish.

## 2) Environment / Working Context
- Single worktree to use for all follow-up work:
  - `/home/mac/HA/implementation_10`
- Current branch:
  - `claude/dashboard-nav-research-QnOBs`
- Active modified files are intentionally dirty (do not reset).
- Home Assistant target is reachable and was actively deployed to during this session.

### Merge/Oversight Correction
- There was a branch/worktree continuity oversight during chat.
- Final state correction:
  - previous parallel worktree changes were merged into `claude/dashboard-nav-research-QnOBs`.
  - going forward: do not create or use additional worktrees for this project.
- During merge, one untracked file in root worktree would have been overwritten and was preserved as:
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js.premerge_untracked_backup`
  - Do not delete blindly; inspect/diff before cleanup.

## 3) Locked Product Direction (Docs Alignment)
From `plan.md`, `FIX_LEDGER.md`, and `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`:
- Decision order is locked:
  1. NAV
  2. POPUP
  3. UI/UX shell
  4. HOME LAYOUT
- Popup direction is locked to Browser Mod (FL-022 done/direction-locked).
- Bubble/hash popup path is historical only unless explicitly re-approved.
- Popup invocation standard: browser-scoped `fire-dom-event` (not server-scoped popup service calls).
- Popup card style field should be `initial_style` (not deprecated `size`).

### Popup UX Direction Linkage (Do Not Drift)
Use this doc as mandatory execution reference:
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`

Required implications for implementation:
- Browser Mod remains the popup platform (`FL-022` direction lock).
- Popup trigger actions on cards are browser-scoped (`fire-dom-event`) unless a specific exception is approved.
- One popup per room remains the interaction model.
- Popup surface complements room subviews; it does not replace nav hierarchy.
- `layout-card` is an approved pattern for breakpoint-specific composition differences (for example: rooms tiles on desktop, rooms row on mobile).
- Prefer Home Assistant `2026.3` native UI configuration capabilities wherever they can replace brittle YAML-only patterns.

Important: there is behavior drift between plan lock and latest user intent.  
Plan previously stated legacy room tile `tap -> toggle`, `hold -> popup`.  
Latest user intent now leans toward row cards where:
- row sub-buttons toggle individual lights
- tapping main room card should navigate/open popup
- desktop and mobile variants differ (desktop tiles, mobile row)

This mismatch must be reconciled in docs before broad refactor.

## 4) What Was Implemented

### 4.0 Session Delta (2026-03-06, latest)
- Added weather design plan doc:
  - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
- Added status/chips resolution guide:
  - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- Added brightness alignment RCA doc:
  - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
- Updated cards:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (compact readability + dropdown layering polish)
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js` (chips density/readability)
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (mobile row variant scaling)
- Syntax validation completed:
  - `node --check` passed for all three updated card files.

### 4.1 Core v2 card code changes
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Updated Material Symbols font load URL to full range (`GRAD -50..200`) with `display=swap`.
- All v2 cards now import `tunet_base.js` with cache-busting suffix:
  - `from './tunet_base.js?v=20260306g1'`
  - Files affected: actions, climate, lighting, light_tile, media, nav, rooms, scenes, sensor, sonos, speaker_grid, status, weather.
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Version `2.6.2`
  - Added `weather_sunset_down` icon alias fallback to `wb_twilight`.
  - Added `format: time` rendering support (local time formatting).
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - Version `2.4.0`
  - Added `show_when` visibility evaluation.
  - Added `tap_action` support using shared `runCardAction(...)`.
  - Chips now support navigate/fire-dom-event/call-service without fallback hacks.
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Added shared `createAxisLockedDrag(...)` utility for iOS-safe gesture intent locking (vertical passthrough, horizontal drag lock).
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - Version `3.4.1`
  - Refactored tile drag handling to shared axis-lock helper.
  - Updated tile touch policy to `touch-action: pan-y` and added scroll-container overscroll behavior guard.
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - Version `1.0.1`
  - Refactored tap/drag/long-press handling to shared axis-lock helper.
  - Removed pointer-capture style drag flow that blocked vertical scrolling.
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - Version `3.1.2`
  - Refactored speaker tile drag handling to shared axis-lock helper.
  - Updated tile touch policy to `touch-action: pan-y`.
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - Version `3.2.1`
  - Speaker dropdown compacted heavily.
  - Dropdown rows changed to single-line state label (`Playing` / `Paused` / `Idle`) rather than long title+artist text.
  - Volume/mute path already moved to coordinator/group target model.
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - Version `2.8.0`
  - Added `layout_variant: slim`.
  - Row/slim CSS and control wiring expanded.

### 4.2 Dashboard YAML changes
- `Dashboard/Tunet/tunet-suite-config.yaml`
  - Added large example gallery view:
    - `title: Card Gallery`, `path: card-gallery`
  - Added broad variant demonstrations across status/actions/scenes/rooms/lighting/climate/weather/media/speaker-grid/light-tile.
  - Added/retained layout exploration surfaces (`Layout Lab`, `Vacuum Lab`).
  - Added/updated popup action strips in YAML popup blocks (for `tunet-suite` YAML flow).
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - Updated popup blocks (local source) to compact action-strip style and adaptive/manual-reset wiring.
  - Added Bedroom orchestration POC on storage source (`T-008B`):
    - full-width `tunet-status-card` context chips (presence/temp/humidity/light/alarm/sonos)
    - side-by-side companion sections on tablet+:
      - left: `tunet-lighting-card` + bedroom light action strip
      - right: `tunet-media-card` + alarm status/actions panel
  - Note: this is repo source state and still requires live HA validation at phone/tablet/desktop widths.

### 4.3 Sensor card outside condition update
- `Dashboard/Tunet/Cards/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - Replaced AQI/outside placeholder behavior with `weather.home` “Outdoor Conditions” styling.

## 5) Live Deployment Status

### 5.1 JS resources
- Uploaded v2 JS files to HA path:
  - `/config/www/tunet/v2_next/tunet_*.js`
- HA dashboard resources were version-bumped to:
  - `?v=20260306_gallery01`
- Confirmed via MCP resource list.

### 5.2 YAML dashboards
- Uploaded `Dashboard/Tunet/tunet-suite-config.yaml` to:
  - `/config/dashboards/tunet-suite.yaml`
- Storage dashboard was modified live through MCP transform:
  - Dashboard: `tunet-suite-storage`
  - Latest known `config_hash`: `522449b5be74c2b6`

### 5.3 Live popup updates
- Live storage dashboard popup updated via MCP transform:
  - Removed legacy `Open Room` big button.
  - Injected compact `tunet-actions-card` actions in popup.
  - Enabled popup `show_adaptive_toggle: true` and `show_manual_reset: true`.
  - Added `adaptive_entities` per room popup.

## 6) Known User-Reported Issues Still Open (Do Next)
This is the authoritative unresolved matrix from the user’s latest requirements.

### Issue Matrix (No-Context Execution)

#### `ISSUE-001` Status mode dropdown layering + selection reliability
- Status update (2026-03-06, `T-006A`):
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` now forces dropdown-capable overflow visibility at card/grid level.
  - Dropdown selection now uses async `input_select` call with `select` fallback.
  - Remaining work: live HA validation for overlay behavior at phone/tablet/desktop widths.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` (mode dropdown tile config)
- Repro:
  - Open Overview.
  - Tap the mode dropdown tile (`input_select.oal_active_configuration`).
- Current wrong behavior:
  - Menu can render beneath adjacent tile(s).
  - Option selection appears to not apply in some runs.
- Desired behavior:
  - Dropdown menu always overlays nearby tiles.
  - Selecting an option changes the input select immediately and visibly.
- Likely root cause:
  - Tile stacking context/z-index not elevated when dropdown opens.
  - Selection service path/domain mismatch or click event path conflict under overlap.

#### `ISSUE-002` Overview route appears blank for user
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - HA dashboard registration/resources state
- Repro:
  - Navigate to `/tunet-suite/overview`.
- Current wrong behavior:
  - User reports blank page.
- Desired behavior:
  - Overview renders all configured sections/cards.
- Likely root cause:
  - Resource version/cache mismatch, registration mismatch, or runtime card error causing render abort.

#### `ISSUE-003` Popup “Room/Open Room” route inconsistency
- Status update (2026-03-07, `T-010C.2`):
  - shared navigation dispatch in `Dashboard/Tunet/Cards/v2/tunet_base.js` hardened to emit `hass-navigate` from element/document/window before history fallback.
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` and `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` moved to base import `?v=20260307p05`.
  - Remaining work: live HA verification from popup context for all room routes.
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` popup action strips
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` action routing
- Repro:
  - Open room popup, use “Room/Open Room” action.
- Current wrong behavior:
  - Route action intermittently does not navigate.
- Desired behavior:
  - Route always opens correct room subview path.
- Likely root cause:
  - Action payload mismatch (`navigation_path` path correctness) or action adapter route handling inconsistency.
- Popup UX direction linkage:
  - Must stay aligned with `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` one-popup-per-room flow.

#### `ISSUE-004` Media density test failure + dynamic volume not working
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` media card config
- Repro:
  - Run media density test surface.
  - Use media volume controls on `custom:tunet-media-card`.
- Current wrong behavior:
  - Density test fails.
  - Volume updates do not reliably control intended group/coordinator target.
- Desired behavior:
  - Density test passes.
  - Volume controls reliably affect configured target.
- Likely root cause:
  - Coordinator resolution mismatch, slider-to-service mapping issue, or stale entity-target wiring.

#### `ISSUE-005` Rooms row variant interaction contract drift
- Status update (2026-03-07, `T-010B`):
  - control-size parity and row button/orb sizing consistency improved in `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` + shared tokens in `tunet_base.js`.
  - Remaining work: confirm card-body primary route-action contract remains aligned across docs/code.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` rooms card configs
- Repro:
  - On mobile/row variant, tap room body and sub-buttons.
- Current wrong behavior:
  - Interaction contract has drifted across iterations (sub-button vs card-body behavior not always consistent).
  - Manual-dot behavior has historically been inaccurate/persistent.
  - All-on/all-off controls have been oversized/cluttered in prior iterations.
- Desired behavior:
  - Sub-buttons toggle only their own lights.
  - Card body consistently performs the chosen primary action (popup or navigation).
  - Manual indicator appears only when manual control exists for room lights.
  - One compact toggle-all affordance, not duplicate oversized controls.
  - Icon sizing consistency between room icon and sub-icons.
- Likely root cause:
  - Event propagation conflicts and repeated contract flips without synchronized docs.
- Popup UX direction linkage:
  - If primary card-body action is popup, action must follow Browser Mod + `fire-dom-event` direction lock.

#### `ISSUE-006` Desktop vs mobile rooms variant split
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Repro:
  - Compare overview/rooms on desktop and mobile widths.
- Current wrong behavior:
  - Same room variant shown across widths in prior runs.
- Desired behavior:
  - Desktop/tablet: tiles variant.
  - Mobile: row variant.
  - Implemented via `layout-card` + breakpoint/visibility logic.
- Likely root cause:
  - Missing breakpoint orchestration at dashboard composition level.

#### `ISSUE-016` Mobile bottom-nav overlap clips last card
- Status update (2026-03-07, `T-010B`):
  - nav offset injection and clearance logic hardened in `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`.
  - Remaining work: live verify that final cards can scroll fully above nav dock on all subviews.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` (`mobile_bottom_offset` on footer nav card)
- Repro:
  - On mobile, open room/overview pages and scroll to the last card.
- Current wrong behavior:
  - Bottom nav covers lower portion of final card.
- Desired behavior:
  - Last card is fully visible and scrollable above nav dock.
- Likely root cause:
  - Offset styles not consistently applied to all HA view host types and/or insufficient mobile dock clearance.

#### `ISSUE-007` Bedroom next Sonos alarm tile missing
- Status update (2026-03-06, `T-008B`):
  - Bedroom subview now includes both `sensor.sonos_alarm_bedroom_display` (context strip) and `sensor.sonos_next_alarm` (alarm panel) in `Dashboard/Tunet/tunet-suite-storage-config.yaml`.
  - Remaining work: live HA verification that both tiles render and stay legible at phone/tablet widths.
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `packages/sonos_package.yaml` (source entities)
- Repro:
  - Open Bedroom subview.
- Current wrong behavior:
  - No “next Sonos alarm” tile visible.
- Desired behavior:
  - Bedroom surface includes a concise tile for next Sonos alarm.
- Likely root cause:
  - Tile not wired to live Sonos alarm sensor in storage dashboard.

#### `ISSUE-008` Sunrise/sunset dynamic chip logic missing
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (if show_when behavior is insufficient)
- Repro:
  - Check Quick Chips daytime vs nighttime.
- Current wrong behavior:
  - Static chip behavior in prior revisions.
- Desired behavior:
  - Daytime shows sunset; nighttime shows sunrise.
- Likely root cause:
  - Missing `show_when` state gating for sun condition.

#### `ISSUE-009` Lighting compact+scroll brightness overlap
- Status update (2026-03-07, `T-010B`):
  - compact/mobile spacing and track clearance adjusted in `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`.
  - Remaining work: live HA verification on narrow mobile widths with real entities.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- Repro:
  - Use compact mode + scroll layout on narrow viewport.
- Current wrong behavior:
  - Brightness value overlaps slider/progress area.
- Desired behavior:
  - Clear vertical separation between value text and slider/track.
- Likely root cause:
  - Tight compact spacing and progress-track offset in scroll mode.

#### `ISSUE-015` Cross-tile vertical lane alignment regression (name/value/bar)
- Status update (2026-03-07, `T-010B`):
  - lane-spacing adjustments applied in:
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_base.js` (shared density tokens)
  - Remaining work: full cross-surface phone/tablet validation and any final fine-tuning pass.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- Repro:
  - Open any surface with room/light tiles.
  - Inspect relationship between tile name, brightness/status value, and progress bar.
- Current wrong behavior:
  - Brightness/status value appears vertically misaligned (shifted), and prior attempts over-corrected by re-centering composition.
- Desired behavior:
  - Maintain intended tile hierarchy while restoring correct vertical lane alignment:
    - name lane
    - value lane
    - bar lane
  - Do not enforce generic center-justified layout as the fix.
- Likely root cause:
  - Cross-card style drift from shared density/surface changes + per-card progress offset/positioning differences.

#### `ISSUE-013` iOS tile drag blocks vertical page scroll (touch-action/pointer contract)
- Status update (2026-03-06, `T-009A`):
  - Shared axis-lock helper added in `Dashboard/Tunet/Cards/v2/tunet_base.js`.
  - Refactor applied to `tunet_lighting_card`, `tunet_light_tile`, and `tunet_speaker_grid_card`.
  - Tile surfaces switched to `touch-action: pan-y` in those cards.
  - Remaining work: live iOS/WKWebView validation and potential follow-on parity refactor for `tunet_sonos_card`.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- Repro:
  - On iOS, start a vertical swipe from inside a lighting or speaker tile.
- Current wrong behavior:
  - Prior builds stalled page scrolling when gestures started on drag-enabled tile surfaces.
- Desired behavior:
  - Vertical swipes scroll page immediately.
  - Horizontal swipes still control brightness/volume as expected.
- Likely root cause:
  - `touch-action: none` and non-axis-locked pointer logic were claiming gestures before browser scroll intent could win.

#### `ISSUE-010` Weather variants (daily/hourly + temp/precip) not complete/verified
- Status update (2026-03-06, `T-009F`):
  - implemented in `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`:
    - forecast mode/metric variants are active
    - precip data fallback keys added
    - hourly precip count parity with `forecast_days`
    - compact density + control containment adjustments
  - remaining work: live HA visual/interaction verification against real forecast providers.
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Repro:
  - Open weather card and switch modes/metrics.
- Current wrong behavior:
  - Prior behavior lacked required variant model.
- Desired behavior:
  - Daily/hourly view support.
  - Temperature/precipitation metric support.
  - Optional auto switch toward hourly precipitation when precip is active/likely.
- Likely root cause:
  - Card previously only subscribed/rendered daily temperature-style forecasts.

#### `ISSUE-011` Missing full parameter documentation for all custom cards
- Where to look:
  - `Dashboard/Tunet/Cards/v2/*.js` (`getConfigForm`, default config, runtime options)
  - docs target (new): `Dashboard/Tunet/Docs/cards_reference.md` (to create)
- Repro:
  - Attempt to configure advanced options from UI without source code.
- Current wrong behavior:
  - No single canonical card-parameter reference.
- Desired behavior:
  - One complete doc per card with every parameter, type, default, allowed values, examples, and caveats.
- Likely root cause:
  - Feature velocity exceeded documentation maintenance cadence.

#### `ISSUE-012` Sections layout strategy is not yet mastered (research + iterative tuning required)
- Status update (2026-03-06, `T-008A`):
  - Applied explicit view-level controls across storage sections views: `max_columns: 4` and `dense_section_placement: false`.
  - Normalized overview spans to runtime intent (`4/3/1`) and added a concrete `living-room` subview split (`3/1`).
  - Migrated nav placement to native `footer.card` across storage views (HA 2026.3 capability) while keeping nav-card JS behavior unchanged.
  - Remaining work: live breakpoint validation loop at `390x844`, `768x1024`, `1024x1366`, `1440x900`.
- Where to look:
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/*` (`getGridOptions()` behavior)
- Repro:
  - Compare same dashboard at phone/tablet/desktop sizes and inspect section/card width behavior.
- Current wrong behavior:
  - Layout decisions are still partly heuristic and not backed by a stable best-practice model.
  - Span/column/section-width settings are not yet systematically tuned for all breakpoints.
  - Baseline docs now define the explicit 3-layer model (page/view -> section -> card), but live tuning evidence is still missing.
- Desired behavior:
  - Deep internet-backed sections/layout best-practice baseline.
  - Controlled live iteration loop: user adjusts values, reports visual result, agent folds those findings into matrix/rules.
- Likely root cause:
  - Insufficient formalized research + insufficient closed-loop breakpoint testing against real hardware.

#### `ISSUE-018` 2026.3 UI-configuration-first utilization gap
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Cards/v2/*` (`getConfigForm`, selectors, defaults)
  - `plan.md` tranche tasks for UI-editability and card configuration ergonomics
- Repro:
  - Attempt to add/adjust tiles/sensors/options through HA UI config flows and compare with current YAML-heavy path.
- Current wrong behavior:
  - Team is underusing modern `2026.3` UI config capabilities for composing sensors/tiles/options.
- Desired behavior:
  - Use UI configuration paths in the smartest practical way first, falling back to YAML only when necessary.
  - Improve card config schema/fields so common composition can happen without code edits.
- Likely root cause:
  - Legacy YAML-first habits and incomplete exploitation of newer UI editor capabilities.

#### `ISSUE-014` Outer card height reporting mismatch blocks stacking/layout
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (tile/outer wrapper behavior)
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` section/card span usage
- Repro:
  - Place affected card near cards above/below in Sections view, then try to stack additional content where visual height appears available.
- Current wrong behavior:
  - Outer container reports/occupies height similar to neighboring cards even when visible content is shorter.
  - Prevents expected stacking/placement above or below due to inflated occupied height.
- Desired behavior:
  - Card occupied height should closely match rendered content height (or intentionally center within equalized height with explicit design choice).
  - Sections layout should permit expected stacking and flow decisions based on actual height behavior.
- Likely root cause:
  - Combination of `getGridOptions()` hints, internal wrappers/min-height/padding, and Sections equalization behavior not yet tuned as a system.

#### `ISSUE-019` Cross-family card sizing/readability consistency remains unresolved
- Where to look:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_climate_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Repro:
  - Compare tile density/text/icon sizing on mobile across overview + rooms + media surfaces.
  - Check for inconsistent whitespace, control heights, and legibility between card families.
- Current wrong behavior:
  - Family-to-family density/readability is inconsistent; some cards still feel roomy with small text while others are compact.
  - Not all affected cards were fully live-tested after latest token adoption passes.
- Desired behavior:
  - Unified mobile and tablet density system across all card families.
  - Predictable text scale, control scale, and spacing from shared tokens with explicit card exceptions only when justified.
- Likely root cause:
  - Partial adoption of shared density tokens plus card-local fixed values and inconsistent override paths.

#### `ISSUE-017` Full dashboard Sections architecture must be redesigned view-by-view
- Where to look:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/Agent-Reviews/overview_orchestration_spec.md` (reference, not final)
- Repro:
  - Review each final destination view (overview, rooms, media, each room subview) at phone/tablet/desktop.
  - Validate information hierarchy (hero vs companion vs support) and interaction-first placement per surface intent.
- Current wrong behavior:
  - Sections composition has been iterated piecemeal; some placements/spans are exploratory rather than fully deliberate final IA.
  - Earlier design path relied on incorrect assumptions in places; full-system composition has not been rebuilt end-to-end.
- Desired behavior:
  - Re-design every final view start-to-finish using the HA Sections 3-layer model:
    - page-level `max_columns`
    - section-level `column_span` / `row_span`
    - card-level `grid_options`
  - Execute a deliberate Page -> Section -> Card orchestration pass for every final surface:
    - decide hero vs companion vs support first
    - then decide where cards should be full-width vs side-by-side
    - then set per-card `grid_options` and validate at phone/tablet/desktop
  - Produce locked per-view orchestration specs (hero/companion/support + interaction contracts) before broad UI polish.
  - Then execute implementation + live iterative breakpoint validation loop with user.
- Likely root cause:
  - Incremental local fixes outpaced a single locked global layout orchestration pass.

## 6A) What Worked (Keep)

The following patterns have repeatedly worked and should remain baseline:

- Browser Mod popup direction with browser-scoped `fire-dom-event` triggers.
- Card-level `grid_options` as the width control mechanism inside Sections (instead of span hacks).
- Shared axis-locked drag pattern (`pan-y` + horizontal lock) for iOS-safe scroll/drag coexistence.
- Shared base density token approach in `tunet_base.js` (requires full-family adoption, but direction is correct).
- Storage dashboard as primary live evaluation surface with YAML architecture surface in repo.

Centralized styling reminder:
- v2 objective is a centralized style system.
- Cross-family style/density fixes should land in `Dashboard/Tunet/Cards/v2/tunet_base.js` first, with minimal card-local exceptions.

## 6B) Standardization Execution Order (One Surface At A Time)

Use this exact order for layout standardization:

1. One room page (pilot: Living Room)
2. Matching room popup (Living Room popup)
3. Overview page
4. Media page
5. Remaining room pages (Bedroom/Kitchen/Dining), applying locked template

Each surface follows: `Design -> Implement -> Live Test -> Iterate -> Lock`.

Do not run cross-surface polish while one of the above is still unresolved.

## 6C) First Target Template (Room + Popup Pair)

This is the first deliberate layout template to execute and validate.

### Room Page Template (Living Room Pilot)

Page intent:
- one-touch light control first
- media/alarm/context as companions

Section orchestration:
- Hero section (full width on phone, dominant on tablet/desktop):
  - room context chips/status line
- Primary control section:
  - lighting control card as dominant interaction surface
- Companion section:
  - media control + room-specific utility (alarms/scene shortcuts)

Sizing method:
- set view-level behavior first (`max_columns`, `dense_section_placement`)
- assign section spans by role (hero > primary > companion)
- then tune card `grid_options` for readable side-by-side vs full-width behavior

Validation checkpoints:
- phone: clear scan order, no clipped controls
- tablet: intentional side-by-side where useful
- desktop: no accidental narrow cards due to span mismatch

### Popup Template (Living Room Pair)

Popup intent:
- quick control overlay, not full page replacement

Popup composition:
- compact action strip + room lighting controls
- optional room navigation affordance

Interaction contract:
- popup trigger uses Browser Mod direction lock
- browser-scoped popup action path
- align popup controls with room-page control language

## 7) Current Behavior Drift / Decision Conflicts
- Docs/plan previously contained legacy room `tap -> toggle`, `hold -> popup` wording.
- User now requests row-card body tap navigation/open popup and dedicated sub-control toggles.
- Before implementing more interaction changes:
  - update `plan.md` interaction contract section
  - update `FIX_LEDGER.md` affected items
  - keep one explicit contract and enforce it

If this is not reconciled, implementation drift will continue.

## 8) Files Most Relevant For Next Run

### Mandatory Review Pack (Start Here)
- `Dashboard/Tunet/Mockups/design_language.md`
- `Dashboard/Tunet/CLAUDE.md`
- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` (treat as provisional until `ISSUE-012` research + live tuning update is completed)

### Card logic
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`

### Dashboard configs
- `Dashboard/Tunet/tunet-suite-config.yaml`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`

### Direction / planning control docs
- `plan.md`
- `FIX_LEDGER.md`
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` (must be revised after sections research loop)
- `Dashboard/Tunet/Docs/mockup_vs_build_gap_log.md`

## 9) Fast Verification Checklist (Next Agent)
Run immediately before coding:
1. `git status --short`
2. Confirm current branch/worktree context:
   - branch expected: `claude/dashboard-nav-research-QnOBs`
   - worktree expected: `/home/mac/HA/implementation_10` only
3. Open live `tunet-suite-storage` config via MCP and confirm hash.
4. Confirm JS resources still point to `v=20260306_gallery01`.
5. Verify whether `/tunet-suite/overview` blank is reproducible and collect browser console errors.
6. Reproduce dropdown issue on status tile and identify whether card logic or z-index/overflow.
7. Reproduce row-card tap/sub-button mismatch in `tunet-rooms-card`.

## 10) Build / Validate / Deploy Commands

### JS syntax validation
```bash
cd /home/mac/HA/implementation_10
for f in Dashboard/Tunet/Cards/v2/tunet_*.js; do node --check "$f"; done
```

### YAML parse validation
```bash
cd /home/mac/HA/implementation_10
python3 - <<'PY'
import yaml
for p in ['Dashboard/Tunet/tunet-suite-config.yaml','Dashboard/Tunet/tunet-suite-storage-config.yaml']:
    with open(p,'r',encoding='utf-8') as f:
        yaml.safe_load(f)
print('yaml-ok')
PY
```

### Deploy JS to HA
```bash
cd /home/mac/HA/implementation_10
set -a && source /home/mac/HA/implementation_10/.env && set +a
sshpass -p "$HA_SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Dashboard/Tunet/Cards/v2/tunet_*.js "$HA_SSH_USER@$HA_SSH_HOST:/config/www/tunet/v2_next/"
```

### Deploy YAML to HA
```bash
cd /home/mac/HA/implementation_10
set -a && source /home/mac/HA/implementation_10/.env && set +a
sshpass -p "$HA_SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null Dashboard/Tunet/tunet-suite-config.yaml "$HA_SSH_USER@$HA_SSH_HOST:/config/dashboards/tunet-suite.yaml"
```

### Cache bust resources (MCP)
Use `ha_config_set_dashboard_resource` on each Tunet v2 resource id and bump query value.

### Storage dashboard surgical edits (MCP)
Use:
- `ha_config_get_dashboard(url_path="tunet-suite-storage")`
- `ha_config_set_dashboard(... python_transform=..., config_hash=...)`

## 11) Guardrails For Next Agent
- Do not use destructive git commands.
- Do not revert unrelated modified files.
- Treat current dirty tree as in-progress intentional work.
- Keep Browser Mod popup direction.
- Use `fire-dom-event` for browser-scoped popup actions.
- Keep `initial_style` for popup-card.
- Update docs when interaction contract changes.
- Prioritize working UX over perfect abstraction.

## 12) Suggested Immediate Execution Order
1. Close remaining `G0` documentation decisions/sign-off items.
2. Execute `G1` base primitives in `Dashboard/Tunet/Cards/v2/tunet_base.js` with the architecture-defined unit checks.
3. Resolve `progressH` intent for `indicator-*` families before `G3`.
4. Resume `FL-038` one-surface sequence: Living Room page lock first.
5. After Surface 1 lock, execute matching Living Room popup lock.
6. Then lock Overview surface composition.
7. Then lock Media surface composition.
8. Then apply locked template to remaining room pages (`Bedroom`, `Kitchen`, `Dining`) with room-specific deltas.
9. Run live breakpoint loop with user (`390x844`, `768x1024`, `1024x1366`, `1440x900`) and record outcomes.
10. Keep card-parameter reference deliverable (`ISSUE-011`) queued behind behavior/layout stabilization.
11. Keep `2026.3` UI-configuration-first pass (`ISSUE-018`) in the post-lock optimization queue.
12. Keep outer-card height mismatch (`ISSUE-014`) and cross-family sizing consistency (`ISSUE-019`) as downstream hardening tasks.

## 13) Latest Update (2026-03-06): T-009B

### Implemented code changes
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - compact-mode typography increased (icon/value/label/secondary)
  - deterministic tile min-height via `--tile-row-h`
  - host-level dropdown stacking (`:host(.dd-open)`) and open/close host class toggling
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - row/slim mobile controls enlarged (orbs/toggle/icon sizing + spacing)

### New docs
- `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
- `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- `Dashboard/Tunet/Docs/brightness_alignment_rca.md`

### Validation run
- `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

### Remaining live verification
- Confirm adaptive mode dropdown overlays correctly in dense status grids with cards above/below.
- Confirm compact status readability on phone/tablet.
- Confirm row/slim room controls are now comfortable tap targets on mobile.
- Execute weather refactor tranche based on `weather_card_refactor_plan.md`.
- Execute brightness alignment fix tranche based on `brightness_alignment_rca.md` (recommended Option A).
