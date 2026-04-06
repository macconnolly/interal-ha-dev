# Tunet Suite Dashboard - Implementation Plan

Working branch: `main`
Last updated: 2026-04-06
Active execution plan: `~/.claude/plans/flickering-herding-wolf.md` (sole authority, CD0–CD12)
Active detailed CD11 plan: `~/.claude/plans/synthetic-dazzling-oasis.md` (status-specific authority under the CD0-CD12 master plan)
Current tranche: **CD11 — Status Multi-Mode Design and Runtime Pass** (narrow, status-only redesign/runtime pass; `CD10` nav verify is intentionally deferred until room/surface composition is more settled)
Previous tranches: CD9 (completed Apr 6, 2026; selected-target audio routing, media/sonos dropdown parity, visible speaker-tile semantics, speaker-grid phone fallback, compact naming, volume drag guard, and album-art resilience accepted), CD8 (completed Apr 6, 2026; weather phone-density redesign accepted, climate/sensor narrowed healthy), CD7 (completed Apr 6, 2026; card-level closeout only, room-page layout undecided), CD6 (completed Apr 4, 2026), CD5 (completed Apr 4, 2026), CD4 (completed Apr 4, 2026), CD3 (completed Apr 3, 2026), CD2 (completed Apr 3, 2026), CD1 (completed Apr 3, 2026), CD0 (completed Apr 3, 2026)

## Session Delta (2026-04-06, CD11 kickoff)

Tranche marker: `CD11` active; `CD10` deferred

- `AUTHORITY NOTE`
  - `~/.claude/plans/flickering-herding-wolf.md` remains the sole program authority for `CD0-CD12`
  - `~/.claude/plans/synthetic-dazzling-oasis.md` is now the active detailed status implementation plan for `CD11`
  - chosen interpretation:
    - the old `G3S/CD11` bugfix-only deferral is superseded by the adopted CD11 governance decision
    - `tunet-status-card` is reopened for a narrow, status-only multi-mode redesign/runtime pass
    - status remains yaml-first in CD11; this does not reopen full editor/synthesis work
    - `CD10` nav verify remains open but is intentionally deferred until the room/surface composition direction is more settled
- `RESULT`
  - active tranche advances from `CD10` to `CD11`
  - the active status work should start from the phased `CD11a / CD11b / CD11c` plan in `~/.claude/plans/synthetic-dazzling-oasis.md`
  - future sessions should not treat the older “status bugfix-only” wording in historical deltas as current policy
- `VALIDATION`
  - governance/docs sync only
  - no runtime code changed in this delta
  - live runtime remains the last accepted CD9 build: `?v=build_20260406_151051Z`

## Session Delta (2026-04-06, CD9 closeout)

Tranche marker: `CD9` is closed; active ownership advances to `CD10`

- `AUTHORITY NOTE`
  - the remaining CD9 complaints were reclassified and resolved as follows:
    - speaker-grid phone density/grid pressure: fixed by the card-level mobile column fallback and accepted live review
    - media/sonos dropdown/runtime issues: fixed and deployed
    - album-art proxy spam: Tunet now suppresses repeated retries of the same failing art URL; the remaining single `media_player_proxy` `500` is backend-side
    - `/unknown/node_modules/@webcomponents/scoped-custom-element-registry/src/scoped-custom-element-registry.ts` `404`: confirmed on the default HA dashboard too, so not Tunet-owned
  - chosen interpretation:
    - CD9 closes on the current runtime and rehab evidence
    - any future explicit long-name authoring pressure or slider/accessibility polish is enhancement-level work, not an open CD9 runtime blocker
- `VALIDATION`
  - `npm test` → `625/625`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_151051Z`
  - key accepted runtime evidence:
    - media dropdown phone probe opened successfully and remained solid/opaque
    - sonos/speaker-grid visible tile semantics accepted in live review
    - speaker-grid problematic mobile explicit-large case accepted after fallback
    - album-art console noise reduced to single first-failure behavior
- `RESULT`
  - `CD9` is closed
  - next active tranche is `CD10 — tunet-nav-card`
  - remaining non-Tunet/global noise should not reopen CD9

## Session Delta (2026-04-06, CD9 subpass — Album Art Proxy Resilience)

Tranche marker: `CD9` remains active; album-art rendering is now more resilient, and the observed `/unknown/...scoped-custom-element-registry.ts` 404 is confirmed as Home Assistant-global rather than Tunet-owned

- `AUTHORITY NOTE`
  - live console review showed two distinct errors:
    - `media_player_proxy` album-art requests for `media_player.living_room` returning `500`
    - `/unknown/node_modules/@webcomponents/scoped-custom-element-registry/src/scoped-custom-element-registry.ts` returning `404`
  - chosen interpretation:
    - the `/unknown/...` request is not a Tunet bug because it reproduces on the default Home Assistant dashboard too
    - the album-art `500` is a real backend proxy failure, but Tunet should still avoid repeatedly retrying the same broken art URL on every refresh/update
- `IMPLEMENTATION`
  - `tunet_base.js`
    - added shared media-art helpers:
      - prefer `entity_picture_local`, then `media_image_url`, then `entity_picture`
      - normalize relative URLs
      - track failed art URLs with a short TTL so cards stop hammering a broken proxy URL but can still recover on a new image URL
  - `tunet_media_card.js`
    - now uses the shared media-art helpers instead of reading `entity_picture` directly
  - `tunet_sonos_card.js`
    - same shared media-art resolution/suppression path as media
  - `audio_cd9_bespoke.test.js`
    - added coverage for preferred art-source ordering and failed-URL suppression/recovery
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `25/25`
- `RESULT`
  - media and sonos now prefer better Home Assistant image attributes when available
  - once a proxy/image URL has failed, the cards stop re-requesting that same URL during the short suppression window
  - the HA-global `/unknown/...scoped-custom-element-registry.ts` 404 remains outside Tunet scope

## Session Delta (2026-04-06, CD9 subpass — Volume Auto-Exit Drag Guard)

Tranche marker: `CD9` remains active; volume inactivity timers now pause during active manual drag instead of dismissing the control under the pointer

- `AUTHORITY NOTE`
  - live testing found that the 5-second auto-exit could still fire while the user was actively dragging the volume slider
  - chosen interpretation:
    - keep the 5-second inactivity model
    - active manual dragging does not count as inactivity
    - drag start clears the timer; drag end re-arms the 5-second timer
- `IMPLEMENTATION`
  - `tunet_media_card.js`
    - volume-view auto-exit timer now clears on slider pointerdown
    - debounced volume commits no longer re-arm the timer while drag is active
    - pointerup / pointercancel re-arm the 5-second inactivity timer
  - `tunet_sonos_card.js`
    - volume-overlay auto-exit timer now clears on slider pointerdown
    - debounced volume commits no longer re-arm the timer while drag is active
    - pointerup / pointercancel re-arm the 5-second inactivity timer
  - `audio_cd9_bespoke.test.js`
    - added media + sonos regressions proving the overlay/view stays open through 5 seconds of active drag and only auto-exits after drag ends
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `23/23`
  - full `npm test` → `621/621`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_150124Z`
- `RESULT`
  - media volume view and sonos volume overlay no longer auto-close while a manual drag is in progress
  - the 5-second auto-exit behavior resumes immediately after drag end

## Session Delta (2026-04-06, CD9 subpass — Media Dropdown Surface + Compact Badge Polish)

Tranche marker: `CD9` remains active; media dropdown runtime is corrected on phone and compact speaker-grid badge no longer crowds the value lane

- `AUTHORITY NOTE`
  - live mobile testing found two final visual/runtime issues:
    - media dropdown surface still looked translucent and the phone card was failing to open the menu
    - compact speaker-grid badge was partially covering the volume percentage lane
  - chosen interpretation:
    - keep media/sonos dropdown parity, but make that shell fully solid rather than blurred/translucent
    - treat the media dropdown failure as a real runtime blocker
    - move/shrink the badge only on the compact speaker-grid path; standard is already acceptable
- `IMPLEMENTATION`
  - `tunet_media_card.js`
    - removed dropdown blur so the menu surface is fully opaque
    - fixed `_buildSpeakerMenu()` runtime failure by restoring the missing `groupedCount` value used by grouped coordinator rows
  - `tunet_sonos_card.js`
    - removed dropdown blur to keep the sonos shell matched `1:1` with media
  - `tunet_speaker_grid_card.js`
    - compact badge now sits tighter in the top-right corner and is slightly smaller so it clears the volume percentage lane
  - `audio_cd9_bespoke.test.js`
    - added coverage for solid dropdown shell primitives, media dropdown open/populate behavior, and compact speaker-grid badge geometry
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `21/21`
  - full `npm test` → `621/621`
  - `npm run tunet:deploy:lab` → live resources at `?v=build_20260406_144842Z`
  - authenticated phone probe after deploy:
    - media dropdown now opens on `390x844` with `aria-expanded="true"`, `open=true`, `options=8`, `display=flex`, `backdropFilter=none`
    - screenshot: `/tmp/media-mobile-dropdown-open-after-fix.png`
- `RESULT`
  - media dropdown now opens on the live phone rehab card and uses a fully solid surface
  - sonos keeps the same solid dropdown shell treatment
  - compact speaker-grid no longer lets the group badge crowd the volume percentage lane

## Session Delta (2026-04-06, CD9 subpass — Speaker Icon Hold Alias)

Tranche marker: `CD9` remains active; visible speaker-tile semantics stay landed and now support icon hold as a no-ambiguity alias for default more-info

- `AUTHORITY NOTE`
  - user approved the current visible speaker-tile model but requested one last precision tweak:
    - icon hold should also open the default Home Assistant more-info picker so source selection remains reachable without relying on tap only
  - chosen interpretation:
    - keep icon tap behavior unchanged
    - add icon hold as an alias, not a separate action
    - suppress duplicate more-info on release/click after a successful hold
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - speaker icon now opens more-info on tap or hold
    - long-press release no longer double-fires the more-info event on the follow-up click
  - `tunet_speaker_grid_card.js`
    - speaker icon now opens more-info on tap or hold
    - long-press release no longer double-fires the more-info event on the follow-up click
  - `audio_cd9_bespoke.test.js`
    - expanded speaker-tile semantics coverage to assert icon hold opens more-info exactly once in both sonos and speaker-grid
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `19/19`
  - full `npm test` → `619/619`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` completed; changed sonos/speaker-grid assets deployed and Lovelace resources synced to `?v=build_20260406_141346Z`
  - deploy note: an unrelated transient `tunet_lighting_card.js` SCP hit `port 22: Connection refused` during the multi-file fan-out, but it did not affect the touched CD9 assets
- `RESULT`
  - sonos and speaker-grid speaker icons now expose the default more-info picker on both tap and hold
  - `CD9` remains open on media semantics/accessibility and any residual speaker-grid density signoff

## Session Delta (2026-04-06, CD9 subpass — Audio Target Model + Sonos Dropdown Convergence)

Tranche marker: `CD9` remains active; media/sonos target-selection work is landed, speaker-grid/visible-tile semantics remain open

- `AUTHORITY NOTE`
  - user directed that the sonos source selector should be replaced with the media dropdown `1:1`
  - user replaced the old selected-speaker-only group-volume rule with a Sonos-like selected-target model:
    - selecting an individual speaker controls that speaker
    - selecting the grouped coordinator/current leader controls the group proportionally
  - user accepted aggressive compact default speaker naming (`Living`, `Dining`, `Kitchen`, `Bed`, etc.) as long as room identity survives
- `IMPLEMENTATION`
  - `tunet_base.js`
    - added shared `compactSpeakerName()` for room-preserving compact audio labels
  - `tunet_media_card.js`
    - volume target now follows the selected target
    - grouped coordinator selection now surfaces `speaker_group` iconography / titles and becomes the group-volume target
    - volume view now auto-exits after `5s` of inactivity and resets on new adjustments
    - default speaker labels now compact aggressively, including long explicit names
  - `tunet_sonos_card.js`
    - source selector shell replaced with the media dropdown model
    - dropdown rows now use media-style structure, compact labels, group badge affordance, and `Group All` / `Ungroup All` actions
    - volume overlay now follows the selected target, auto-exits after `5s` of inactivity, and surfaces grouped-coordinator state explicitly
    - default/autodiscovered and explicit long names now compact for the displayed label lane
  - `audio_cd9_bespoke.test.js`
    - new bespoke coverage for compact naming, selected-target volume routing, auto-exit timing, sonos dropdown parity, and explicit-name compaction
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `9/9`
  - full `npm test` was previously green at `608/608` before the explicit-name compaction tweak
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260406_032113Z`
  - screenshot manifests:
    - `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/review-manifest.json`
    - `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/review-manifest.json`
  - key evidence:
    - media phone: `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-media-card__01.png`
    - sonos default phone: `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/390x844/light/rehab/lab/cards/tunet-sonos-card__01.png`
    - sonos explicit-name phone: `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-sonos-card__02.png`
    - sonos default desktop: `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/1440x900/light/rehab/lab/cards/tunet-sonos-card__01.png`
- `RESULT`
  - media and sonos now share the selected-target volume model
  - sonos now uses the media dropdown shell in the default runtime path instead of its bespoke narrow-width control
  - the old broad default/autodiscovered sonos phone/tablet width failure is no longer supported by the rehab screenshots
  - remaining `CD9` work narrows to visible speaker-tile semantics plus speaker-grid dense/default layout failure
  - explicit long-name sonos variants now compact in the displayed label lane instead of overflowing the header

## Session Delta (2026-04-06, CD9 subpass — Visible Speaker-Tile Semantics)

Tranche marker: `CD9` remains active; sonos/speaker-grid visible tile semantics are landed, but speaker-grid dense/default layout pressure and media semantics/accessibility remain open

- `AUTHORITY NOTE`
  - user approved the Sonos-like selected-target model and the unified speaker-tile contract for visible speaker tiles
  - precedence conflict resolved:
    - `cards_reference.md` still had a stale line saying speaker-tile volume controls the selected speaker specifically
    - chosen interpretation keeps the revised selected-target/group-volume model already locked in the decision register and previous CD9 docs
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - visible speaker tiles now use the suite speaker-tile contract:
      - body tap selects active target
      - hold `400ms` then drag adjusts selected-target volume
      - icon tap/hold opens more-info
      - badge toggles group membership
    - tiles now expose explicit `selected` and grouped states, and visible tile drag inherits the selected-target/group-volume routing model
  - `tunet_speaker_grid_card.js`
    - removed the old tap-toggle-group / hold-more-info behavior
    - body tap now selects active target
    - hold `400ms` then drag adjusts selected-target volume
    - icon tap/hold opens more-info
    - badge toggles group membership
    - `createAxisLockedDrag()` path is no longer the active interaction model for visible speaker tiles
  - `audio_cd9_bespoke.test.js`
    - new coverage for sonos and speaker-grid visible-tile semantics:
      - tap selects active target
      - badge toggles group membership
      - icon tap/hold opens more-info
      - hold-drag routes volume to the selected target
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `15/15`
  - full `npm test` → `615/615`
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260406_035732Z`
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
    - sonos / speaker-grid desktop captures are in the same manifest at `1440x900`
- `RESULT`
  - sonos and speaker-grid visible tiles now align to the suite speaker-tile interaction model
  - the stale “selected speaker specifically” line is no longer the accepted audio-volume contract
  - remaining `CD9` runtime work narrows to:
    - `tunet-media-card`: pointer-first group-membership semantics + slider accessibility
    - `tunet-speaker-grid-card`: dense/default layout failure
    - `tunet-sonos-card`: explicit long-name authoring pressure only

## Session Delta (2026-04-06, CD9 subpass — Speaker-Grid Phone Column Fallback)

Tranche marker: `CD9` remains active; explicit non-scroll `large 3-col` mobile pressure is addressed, but final speaker-grid density signoff still depends on live screenshot review

- `AUTHORITY NOTE`
  - user identified the remaining visible issue as the rehab `Large 3-col Explicit` speaker-grid variant looking bad on mobile
  - chosen interpretation:
    - this is a speaker-grid card-level mobile column-policy defect
    - fix it in-card rather than treating the explicit `columns: 3` authoring choice as a required phone layout
- `IMPLEMENTATION`
  - `tunet_speaker_grid_card.js`
    - mobile grid-column fallback now applies to profiled cards as well as non-profile cards
    - `tile_size: large` now collapses to `1` visible phone column
    - `tile_size: compact` / `standard` now collapse to at most `2` visible phone columns
    - explicit desktop-facing `columns: 3` / `4` still apply above the phone breakpoint
  - `audio_cd9_bespoke.test.js`
    - new coverage for speaker-grid mobile column fallback:
      - profiled `large` → `--cols-sm: 1`
      - profiled non-large → `--cols-sm: 2`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `17/17`
  - full `npm test` → `617/617`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260406_041426Z`
  - screenshot manifest for the post-fallback CD9 rehab review:
    - `/tmp/tunet-playwright-review/2026-04-06T04-14-35-066Z/review-manifest.json`
- `RESULT`
  - explicit `large 3-col` no longer forces a 3-column phone grid in the card runtime
  - `CD9` remains open until the refreshed rehab screenshots are visually signed off and the remaining media semantics/accessibility tail is addressed

## Session Delta (2026-04-06, CD8 follow-up polish — Auto/Auto UV)

Tranche marker: `CD9` remains active; user-directed post-closeout weather follow-up only

- `AUTHORITY NOTE`
  - user requested that the existing rehab `Auto / Auto` weather card also surface the UV cue
  - chosen interpretation:
    - keep precip-driven auto behavior unchanged
    - when both view and metric are `auto`, conditions are dry, and the hourly forecast exposes UV, prefer hourly + temperature so the existing auto card can surface the UV badge
    - keep this as a narrow weather-card follow-up; no tranche rollback from `CD9`
- `IMPLEMENTATION`
  - `tunet_weather_card.js`
    - version bumped to `1.6.3`
    - `_applyAutoModes()` now prefers hourly + temperature for dry `auto/auto` when hourly UV is available
    - forecast subscriptions now re-run the auto-mode resolver when hourly/daily forecast data arrives so the live card can actually switch after forecast hydration
  - `weather_bespoke.test.js`
    - covers the dry `auto/auto` hourly+temperature preference and the forecast-arrival recompute path
  - docs
    - `cards_reference.md` and `visual_defect_ledger.md` now reflect the accepted dry `auto/auto` UV behavior
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` → `10/10`
  - full `npm test` → `599/599`
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260406_023753Z`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/review-manifest.json`
  - key evidence:
    - `390x844` auto/auto: `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `1440x900` auto/auto: `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
- `RESULT`
  - the existing rehab `Auto / Auto` weather card now resolves to hourly temperature in dry conditions when UV data is present, so the UV badge is visible without switching to the dedicated hourly-temp sample
  - `CD8` remains closed; this is an accepted post-closeout polish pass

## Session Delta (2026-04-06, CD8 closeout — Weather Phone-Density Redesign)

Tranche marker: `CD8` closed on YAML rehab evidence; control returns to `CD9`

- `AUTHORITY NOTE`
  - user had already manually pushed the weather redesign close to target and requested a screenshot-based truth pass before closure
  - chosen interpretation:
    - validate the rebuilt weather runtime on the YAML rehab dashboard only
    - accept climate and sensor as already-narrowed healthy cards
    - treat the screenshot harness font race as tooling debt that must be fixed before using phone captures as closure evidence
- `IMPLEMENTATION`
  - `tunet_weather_card.js`
    - inline header flip-chips remain the accepted weather toggle model
    - `show_pressure` is now explicit in the editor/runtime contract and defaults to `false`
    - hourly + temperature forecast tiles now support a compact top-right UV badge when forecast data provides UV
  - `tunet_playwright_review.mjs`
    - waits for web fonts before capture so phone screenshots do not produce raw icon ligature false negatives
  - `tunet-card-rehab-lab.yaml`
    - replaced the low-signal short-daily sample with an explicit `Hourly temp + UV` validation fixture
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `node --check Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - YAML parse-check passed for `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` → `7/7`
  - full `npm test` → `597/597`
  - `npm run tunet:deploy:lab` passed and synced live resources to `?v=build_20260406_022606Z`
  - updated rehab YAML pushed live to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/review-manifest.json`
  - key weather evidence:
    - `390x844` auto/auto: `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `390x844` hourly temp + UV: `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__05.png`
    - `1440x900` auto/auto: `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `1440x900` hourly temp + UV: `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__05.png`
- `RESULT`
  - details now collapse into the accepted single-line summary row on phone
  - weather controls are now compact inline flip-chips in the header rather than full-width segmented rows
  - pressure stays removed by default
  - hourly temperature tiles now support the requested UV cue without replacing the primary temperature hierarchy
  - climate remains composition-bound and sensor remains visually healthy, so `CD8` is closed

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

## Session Delta (2026-04-05, CD8 screenshot review — governance only)

Tranche marker: `CD7` remains active; no tranche advance and no broad `CD8` closure claim accepted

- `AUTHORITY NOTE`
  - user stated that `CD8` was closed, but the authenticated rehab screenshot pass does not support broad closure against the written weather contract
  - precedence conflict resolved by keeping `CD7` as the active tranche and recording `CD8` as still open on weather only
  - chosen interpretation:
    - `tunet-weather-card` remains the active `CD8` runtime blocker
    - `tunet-climate-card` stays composition-bound
    - `tunet-sensor-card` stays visually healthy with contract-clarity follow-up only
- `VALIDATION`
  - screenshot run:
    - `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --cd CD8 --breakpoint 390x844,768x1024,1024x1366,1440x900 --theme light`
  - manifest:
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/review-manifest.json`
  - key weather evidence:
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/phone-stress/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-weather-card__01.png`
  - comparison evidence:
    - climate surfaces phone capture: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-climate-card__01.png`
    - sensor surfaces phone capture: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-sensor-card__01.png`
- `RESULT`
  - weather still misses the current `CD8` target contract in `cards_reference.md`:
    - toggle pills remain below the header instead of compact inline flip-chips
    - details remain stacked instead of collapsing into the intended single-line summary
    - pressure appears removed, but the overall phone-density redesign is not complete
  - climate shows no new card-local runtime failure; the cramped paired-phone screenshot still reads as the already-documented composition caveat
  - sensor looks visually healthy; the remaining `CD8` item is still naming-contract clarity around `label`, not runtime rendering
  - this was a governance-only evidence pass; no code changed and no build/test rerun was needed

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

## Session Delta (2026-04-04, Control-Doc Normalization)

Tranche marker: pre-CD5 documentation/backlog rationalization

- `CURRENT STATE`
  - no tranche change: `CD5 — Utility Strip Bespoke Pass` remains next
- `DOC NORMALIZATION`
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` normalized against coherent-build evidence; stale/narrowed claims downgraded; card defects, composition constraints, and doc contradictions separated
  - `Dashboard/Tunet/Docs/cards_reference.md` encodes whole-home usage contract (rooms=navigation, lighting=room-detail, per-card phone-safe defaults explicit); stale closed-tranche wording removed
  - `Dashboard/Tunet/Docs/legacy_key_precedence.md` updated so actions-editor notes match current contract
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md` wording corrected: CD4 card-level accepted, CD12 surface breakpoint validation still required

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
    11. `CD10` — Navigation Verify Pass (deferred until room/surface composition settles)
    12. `CD11` — Status Multi-Mode Design and Runtime Pass (active; detailed plan `~/.claude/plans/synthetic-dazzling-oasis.md`)
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

## Session Delta (2026-03-14, T-011A.23)

Tranche marker: `T-011A.23` (v3 restoration, promotion & import version fix)

- `V3-AUDIT`
  - All 14 v3 JS files pass `node --check` syntax validation
  - Profile resolver tests: 8/8 pass
  - `_resetManualControl()` confirmed correct per-switch loop in both rooms + lighting cards (no port needed)
  - Import version inconsistency DISCOVERED: 7 of 13 cards had stale `?v=` strings (20260306g3, 20260307p03, 20260307p08)
  - ES module cache identity bug: different `?v=` creates separate module scopes in browser, breaking singleton sharing
  - FIXED: All 13 cards now import `tunet_base.js?v=20260309g7`
- `V3-DEPLOY`
  - 14 files deployed via SCP to `/config/www/tunet/v3/` (v2 preserved for rollback)
  - All 13 Lovelace resources switched from `/local/tunet/v2/` → `/local/tunet/v3/?v=20260314_v3a`
  - Server validation: sensor card has `selectProfileSize`, base has `_setProfileVars` export
- `MEMORY-CORRECTION`
  - Erroneous `feedback_v2_is_live_target.md` rewritten — v3 is now documented as implementation authority
  - MEMORY.md updated: deploy path, import version, resource version, source-of-truth references
  - Dashboard/Tunet/CLAUDE.md, Cards/CLAUDE.md, Cards/v3/CLAUDE.md all updated to v3 authority
  - tranche_queue.md: deployment note added, KI-003 marked RESOLVED
- `KI-003-RESOLVED`
  - Rooms card row toggle button oversized → fixed in v3 via `--row-btn-size` (T-011A.18)
  - Now deployed to production with v3 restoration
- `KI-001-FIX (CANDIDATE)`
  - Root cause identified: `_render()` runs during active drag when HA pushes state updates
  - `_render()` replaces `innerHTML`, resetting `dataset.brightness` and destroying drag visual state
  - User sees tile snapping back to HA brightness during drag, making it appear broken
  - Fix: added `this._isDragging` guard — `_render()` skips during active drag, runs once on `onDragEnd`
  - Modified: `tunet_light_tile.js` (constructor, `_render`, `onDragStart`, `onDragEnd`)
  - Deployed at `?v=20260314_v3b` — requires browser DevTools validation to confirm fix
- `SCOPE-LOCK`
  - v2 server cleanup deferred pending user validation of v3
  - Step 8 (v2 cleanup) remains open

## Session Delta (2026-03-13, T-011A.22)

Tranche marker: `T-011A.22` (OAL column sunset late-on prepare coverage planning)

- `ISSUE-DISCOVERED (LIVE TRACE)`
  - During the active sunset protect window, `oal_v13_column_lights_prepare_rgb_mode` can abort when columns are off at threshold crossing.
  - If columns are turned on later in the same window, session may remain unarmed:
    - `input_boolean.oal_column_rgb_session_active = off`
    - `manual_control` not engaged on `switch.adaptive_lighting_column_lights`
  - This leaves AL ownership active at very low brightness and can reintroduce purple/pink-leaning output on the column strips.
- `PLANNED-REMEDIATION (NOT IMPLEMENTED IN THIS DELTA)`
  - Add late-on coverage so a column-on event during the active sunset window runs the same prepare sequence automatically.
  - Candidate trigger surface:
    - `light.living_column_strip_light_matter` -> `to: 'on'`
    - `light.dining_column_strip_light_matter` -> `to: 'on'`
    - optional grouped trigger via `light.column_lights` -> `to: 'on'`
  - Gate with existing prepare conditions:
    - descending sun only, `-5 <= elevation < 3`
    - sleep mode off
    - manual list empty
    - system not paused
- `SCOPE-LOCK`
  - planning/docs update only in `T-011A.22`
  - no changes applied to `packages/oal_lighting_control_package.yaml` in this delta

## Session Delta (2026-03-09, T-011A.21)

Tranche marker: `T-011A.21` (status basic-fix hygiene: px -> em)

- `CODE-DONE (BUGFIX-ONLY SAFE PASS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - converted remaining `px` sizing constants to `em` equivalents
    - includes:
      - CSS fallback branches (compact/large + media query)
      - status subtype geometry constants
      - shadow/blur/outline offsets
      - inline aux icon style string
      - dropdown placement string (`calc(100% + 0.25em)`)
    - no interaction routing changes
    - no new profile-architecture expansion
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `POLICY-COMPLIANCE`
  - aligns with status deferral policy: bugfix-only allowed, architecture tranche deferred to `G3S`

## Session Delta (2026-03-09, T-011A.20)

Tranche marker: `T-011A.20` (status deferral re-baseline)

- `DIRECTION-LOCK-UPDATE`
  - `tunet_status_card.js` is now **deferred** from the current unification tranche sequence.
  - status is **bugfix-only** until deferred status alignment tranche (`G3S`) is started.
  - non-status family rollout remains unblocked by status-architecture completion.
- `STATUS-ALIGNMENT TRANCHE (G3S) SCOPE`
  - lightweight subtype alignment for timer/alarm/dropdown/value lanes using existing shared tokens where low-risk
  - continue `px` -> `em` normalization and remove obvious inline sizing formulas where safe
  - unit + live breakpoint checks at `390x844`, `768x1024`, `1024x1366`, `1440x900` with real HA entities
- `DOC-SYNC`
  - updated:
    - `Dashboard/Tunet/Mockups/design_language.md`
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
    - `plan.md`
    - `FIX_LEDGER.md`
    - `handoff.md`
- `ACTIVE-SEQUENCE`
  - continue stable-family hardening + live validation
  - keep status changes to bugfix-only until `G3S` kickoff

## Session Delta (2026-03-09, T-011A.19)

Tranche marker: `T-011A.19` (v3 profile-token normalization for status/rooms/sensor)

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - expanded profile registry + token map for centralized display/header/row/status lanes:
      - header title/subtitle
      - display name/value/meta/action/icon
      - row display name/status + lead icon + control size
      - status tile pad/gap + timer display + dropdown value
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - switched header + tile name/value profile sizing to shared `--_tunet-*` display/header aliases
    - removed local profile multiplier formulas
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - switched header/name/meta/value/action profile sizing to shared display/header aliases
    - removed local profile multiplier formulas
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - rewired profile mode to consume centralized status/display tokens (tile pad/gap, icon, value/label/meta, timer, dropdown)
    - removed card-local profile scaling multipliers; retained only minimal profile lane alignment rules
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - rewired grid + row typography/icon/control lanes to centralized display/row tokens
    - removed profile-size conditional multipliers (including compact row control special-case)
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - rewired icon/label/value profile sizing to centralized display tokens
    - removed profile multiplier selectors
  - base import cache-key sync:
    - updated v3 card imports to `./tunet_base.js?v=20260309g7` in:
      - `tunet_lighting_card.js`
      - `tunet_speaker_grid_card.js`
      - `tunet_status_card.js`
      - `tunet_rooms_card.js`
      - `tunet_sensor_card.js`
      - `tunet_light_tile.js`
- `VALIDATION`
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - code + docs-sync only
  - no HA deploy/resource bump in this tranche yet

## Session Delta (2026-03-09, T-011A.18)

Tranche marker: `T-011A.18` (rooms row control parity + size follow-up)

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - row lead icon reduced (box + glyph scale)
    - compact row sub-buttons increased (size + icon + spacing)
    - standard row text reduced slightly
    - row all-toggle and orb sub-buttons now share the same control size variable (`--row-btn-size`)
- `LIVE-DEPLOY`
  - uploaded `/homeassistant/www/tunet/v3/tunet_rooms_card.js`
  - updated resource:
    - rooms -> `/local/tunet/v3/tunet_rooms_card.js?v=20260309_g348`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed

## Session Delta (2026-03-09, T-011A.17)

Tranche marker: `T-011A.17` (status lane-balance + sensor parity follow-up)

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile tile vertical lane rebalance:
      - increased bottom padding to avoid bottom label touching tile edge
      - increased icon box/glyph scale
      - raised bottom label scale and added centered lane box sizing
      - aligned middle/bottom lane line-height and lane centering for more even icon/value/label distribution
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - applied light-tile-inspired profile readability parity:
      - profile icon scale bump
      - profile label scale bump (name lane)
      - profile value lane softened and line-height aligned
- `LIVE-DEPLOY`
  - uploaded:
    - `/homeassistant/www/tunet/v3/tunet_status_card.js`
    - `/homeassistant/www/tunet/v3/tunet_sensor_card.js`
  - resource version updates:
    - status -> `/local/tunet/v3/tunet_status_card.js?v=20260309_g347`
    - sensor -> `/local/tunet/v3/tunet_sensor_card.js?v=20260309_g347`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sensor_card.js` passed

## Session Delta (2026-03-09, T-011A.16)

Tranche marker: `T-011A.16` (v3 live tuning: status/rooms profile readability + sensor profile adoption)

- `CODE-DONE (SENSOR PROFILE ADOPTION)`
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - migrated environment card to profile pipeline (`selectProfileSize`/`resolveSizeProfile`/`_setProfileVars`) using `indicator-row`
    - added config controls: `tile_size`, `use_profiles`, plus form toggles for sparkline/trend
    - added host/container resize profile re-selection (`ResizeObserver` + window fallback)
    - converted row geometry lanes to `--_tunet-*` tokens (row pad/gap/min-height, icon, value/unit, sparkline, trend)
    - updated `getGridOptions()` to sections-safe intrinsic rows (`rows: 'auto'`, bounded min/max)
- `CODE-DONE (STATUS + ROOMS PROFILE READABILITY TUNING)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile-mode icon lane enlarged and tile content vertical spacing tightened
    - profile-mode middle and bottom typography aligned to proven lighting formulas
    - timer/dropdown profile text lanes bumped for parity
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - profile-mode tile/row typography aligned to lighting formulas (name/value lane parity)
    - row control geometry rebalanced: per-room toggle reduced, per-light orbs increased, spacing widened
    - added row-controls click-zone guard so taps inside controls container do not trigger tile-body row actions
- `LAB-DASHBOARD-UPDATES`
  - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - expanded sensor permutations to legacy/profile compact/standard/large comparisons
- `LIVE-DEPLOY`
  - uploaded:
    - `/homeassistant/www/tunet/v3/tunet_status_card.js`
    - `/homeassistant/www/tunet/v3/tunet_rooms_card.js`
    - `/homeassistant/www/tunet/v3/tunet_sensor_card.js`
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - resource version updates:
    - status `7bbb4f68cb5944bdb8586673420cf69a` -> `...g346`
    - rooms `55d3848b00224adebed2a79bcc2d9904` -> `...g346`
    - sensor `d27faab6495e4717a8d9313117556f84` -> switched from `v2_next` to `v3 ...g346`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sensor_card.js` passed
  - `python3` YAML parse (`Dashboard/Tunet/tunet-g2-lab-v3.yaml`) passed (`yaml-ok`)
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

## Session Delta (2026-03-09, T-011A.15)

Tranche marker: `T-011A.15` (v3 G3 + G4 + G5 implementation pass)

- `CODE-DONE (G3: STATUS + ROOMS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - added profile pipeline (`selectProfileSize`/`resolveSizeProfile`/`_setProfileVars`)
    - added config controls: `use_profiles`, `tile_size`
    - profile apply now runs on config set, first render, and host resize
    - removed viewport fallback from responsive width resolution (`window.innerWidth` no longer used)
    - status subtype geometry now profile-token driven:
      - timer: `--_tunet-timer-font`, `--_tunet-timer-ls`
      - alarm: `--_tunet-alarm-pill-font`, `--_tunet-alarm-btn-h`, `--_tunet-alarm-btn-font`, `--_tunet-alarm-icon-size`
      - dropdown: `--_tunet-dropdown-max-h` (+ option/font/padding/radius tokens)
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - added profile pipeline + config controls (`use_profiles`, `tile_size`)
    - layout-aware family routing implemented:
      - `layout_variant: tiles` -> `tile-grid`
      - `layout_variant: row|slim` -> `rooms-row`
    - row/grid geometry now consumes profile tokens (`--_tunet-*`), including orbs/toggle/chevron/row-height lanes
    - slim row minimum height now derives from profile row height (`~70%` of `rowMinH`)
    - added host resize observer path so profile auto-size updates from container width changes
- `CODE-DONE (G4: STANDALONE TILE)`
  - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - added profile pipeline + config controls (`tile_size`, `use_profiles`)
    - standalone tile now applies `tile-grid` profile tokens on host
    - tile geometry updated to consume `--_tunet-*` lanes (icon/name/value/progress/tile pad/radius/min-height)
    - preserved drag/tap/hold behavior; no interaction contract changes
    - added host resize observer for profile auto-size updates
- `CODE-DONE (G5: SECTIONS HARDENING)`
  - updated `getGridOptions()` to use intrinsic sizing (`rows: 'auto'`) with static bounds on:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - removed viewport fallback in profile width helpers for migrated pilot cards:
    - `tunet_lighting_card.js`, `tunet_speaker_grid_card.js`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_light_tile.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - code + docs-sync only
  - no HA deploy/restart/resource mutation in this tranche

## Session Delta (2026-03-09, T-011A.12)

Tranche marker: `T-011A.12` (v3 G2 lab deploy + lighting profile polish)

- `LIVE-LAB-DONE`
  - added repo YAML lab dashboard:
    - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
  - uploaded to HA:
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - registered dashboard in HA `configuration.yaml`:
    - `tunet-g2-lab-v3` -> `dashboards/tunet-g2-lab-v3.yaml`
  - uploaded v3 modules to HA:
    - `/homeassistant/www/tunet/v3/tunet_base.js`
    - `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
    - `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
- `RESOURCE-CONFLICT-ISOLATION`
  - temporarily removed conflicting v2_next resources for cards under active G2 test:
    - `tunet_lighting_card.js`
    - `tunet_speaker_grid_card.js`
  - added v3 resources for active lab:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix1`
    - `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab`
- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - profile-mode tile lane fit: enforce minimum tile height floor and larger bottom lane clearance
    - drag pill clipping fix: sliding tiles now allow overflow; pill vertical position adjusted
    - profile-mode value text softened slightly (small downscale)
    - zone name/value lanes set non-shrinking to avoid name collapse
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - HA config check: valid
  - HA restart completed to apply new dashboard registration

## Session Delta (2026-03-09, T-011A.13)

Tranche marker: `T-011A.13` (v3 lighting profile lane sizing + row overlap correction)

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - fixed profile-row overlap by aligning grid row height with profile tile min-height floor:
      - `--grid-row` now uses `max(var(--_tunet-tile-min-h, 110px), 6.25em)` in profile mode
    - corrected mode scoping:
      - moved recent lane-stability constraints (`min-height`/`flex`) to `:host([use-profiles])` so legacy mode is unaffected
    - preserved profile readability tuning:
      - profile tile names remain larger; profile bottom value slightly reduced
- `LIVE`
  - uploaded patched file to HA:
    - `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
  - cache-bust resource updated:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix3`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed

## Session Delta (2026-03-09, T-011A.14)

Tranche marker: `T-011A.14` (speaker profile readability parity + resource refresh)

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - profile-only readability bump for:
      - header title/subtitle (`.hdr-title`, `.hdr-sub`)
      - tile text lanes (`.spk-name`, `.spk-meta`, `.spk-vol`)
      - group action strip buttons (`.action-btn`)
    - legacy mode selectors remain unchanged (`:not([use-profiles])` path preserved)
- `LIVE`
  - uploaded patched speaker card:
    - `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
  - updated resource URLs:
    - lighting: `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix4`
    - speaker: `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab_fix1`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed

## Session Delta (2026-03-09, T-011A.11)

Tranche marker: `T-011A.11` (v3 G2 pilot wiring - lighting + speaker profile consumption)

- `CONFLICT-CARRY-FORWARD`
  - control docs still list `Dashboard/Tunet/Cards/v2/` as implementation authority
  - active tranche remains in `Dashboard/Tunet/Cards/v3/` by explicit user override (`T-011A.10` interpretation lock)
- `CODE-DONE`
  - profile pipeline wiring added to:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - both cards now:
    - import and use `selectProfileSize(...)`, `resolveSizeProfile(...)`, `_setProfileVars(...)`
    - support rollback flag `use_profiles: true|false` (default `true`)
    - apply profile on `setConfig`, initial render, and host resize
    - set `profile-family` / `profile-size` host attributes in profile mode
    - keep legacy tile-size behavior when `use_profiles: false`
  - lighting card:
    - scoped legacy `[tile-size]` compact/large overrides behind `:host(:not([use-profiles]))`
    - profile tokens now drive core geometry lanes (card padding, header sizing, tile pad/gap/radius, icon/name/value/progress lanes, tile min height)
    - host-resize path now re-renders on profile-size transitions
  - speaker grid card:
    - added profile apply helpers + `ResizeObserver`/window fallback host-resize handling
    - scoped legacy `[tile-size]` geometry overrides behind `:host(:not([use-profiles]))`
    - profile tokens now drive card/header/tile/icon/text/progress geometry lanes
    - existing tile-level container query behavior retained for narrow tile layout adaptation
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - code + docs-sync only
  - no YAML/dashboard-storage mutations
  - no deploy/cache-bust actions in this tranche

## Session Delta (2026-03-08, T-011A.10)

Tranche marker: `T-011A.10` (v3 sandbox bootstrap + G1 start)

- `CONFLICT-RECORDED`
  - design/control docs still state `Dashboard/Tunet/Cards/v2/` as implementation authority
  - user explicitly directed work to proceed in `Dashboard/Tunet/Cards/v3/`
- `CHOSEN-INTERPRETATION`
  - treat `Cards/v3/` as active G1 sandbox path by user override
  - keep `Cards/v2/` as canonical production authority until explicit promotion/cutover decision
- `CODE-DONE`
  - baseline copy committed:
    - `32dde28` `chore(cards): bootstrap v3 from v2 baseline`
  - G1 primitives added in:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - profile schema/version + 5-family all-em registry + selector/resolver split
    - internal alias token writer `_setProfileVars()` with full clear+set
    - one-gate resolver shim warning for legacy `widthHint` arg
  - resolver tests added:
    - `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (8/8)

## Session Delta (2026-03-08, T-011A.9)

Tranche marker: `T-011A.9` (design-language registry-shape consistency sync)

- `DOC-ALIGNED`
  - `Dashboard/Tunet/Mockups/design_language.md` section `5.5` was updated from stale numeric `PROFILE_BASE` example to the locked size-indexed all-em shape.
  - Added explicit pointer to canonical full registry table in:
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` §7
- `SCOPE`
  - docs-only consistency patch
  - no JS/YAML runtime changes

## Session Delta (2026-03-08, T-011A.8)

Tranche marker: `T-011A.8` (control-doc alignment + execution-order reconciliation)

- Conflict recorded (do not silently resolve):
  - `T-011A` surface-by-surface orchestration is marked active in this file.
  - `T-011A.7` carry-forward also states next implementation step is `G1` base primitives.
- Chosen interpretation for the next execution pass:
  - immediate active tranche is docs alignment + profile-foundation sequencing (`G0` closeout decisions -> `G1` in `tunet_base.js`)
  - `FL-038` one-surface orchestration remains locked and required, but is queued immediately after `G1` completion
- Sync targets:
  - `plan.md`, `FIX_LEDGER.md`, `handoff.md`, and Tunet scoped instructions (`Dashboard/Tunet/AGENTS.md`, `Dashboard/Tunet/Agent-Reviews/start.md`)
- Scope:
  - docs only, no JS/YAML runtime changes

## Session Delta (2026-03-08, T-011A.7)

Tranche marker: `T-011A.7` (profile registry v3.1 — all-em density expansion)

- Profile architecture expanded from v3.0 to v3.1:
  - **All-em unit system (D18):** Every token is a pre-formatted em string. No px, no raw numbers. Single `font-size` on `:host` becomes a master density lever.
  - **Size-indexed PROFILE_BASE (D19):** `{ compact: {...}, standard: {...}, large: {...} }` — each family spreads the correct size's base.
  - **End-to-end density (D20, D21):** Card chrome (cardPad, sectionPad, sectionGap, headerHeight, headerFont, sectionFont), control surfaces (ctrlMinH, ctrlPadX, ctrlIconSize), radii (tileRadius, ddRadius), dropdown options (ddOptionFont/PadY/PadX, dropdownMinH/MaxH), secondary typography (subFont, unitFont), and status subtype internals (timerFont, alarmPillFont, alarmBtnH, etc.) all scale with profile.
  - **ddRadius (D22):** Dropdown border-radius at 0.5em standard (8px equivalent).
  - Token ownership section (§10b) added — rules for adding/modifying/removing tokens.
  - Out-of-scope table updated: `tunet_climate_card.js`, `tunet_actions_card.js`, `tunet_scenes_card.js`, `tunet_sensor_card.js` now explicitly listed.
- Updated files:
  - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` (v3.1)
  - `Dashboard/Tunet/design.md` (v1.1)
- Full SIZE_PROFILES registry (5 families × 3 sizes) is the canonical reference in `unified_tile_architecture_conclusion.md` §7.
- Carry-forward:
  - Profile architecture v3.1 finalized. G0 documentation prerequisites are pending tranche owner sign-off.
  - Next implementation step: G1 base primitives in `tunet_base.js`.
  - Sections API research is completed in `unified_tile_architecture_conclusion.md` §12b; G5 should follow the `rows: auto` integration-validation path.
  - `progressH` for `indicator-tile` and `indicator-row`: old design used `0`; new registry inherits PROFILE_BASE non-zero value. Confirm intent before G3.
- Scope:
  - docs only, no JS/YAML runtime changes

## Session Delta (2026-03-07, T-011A.6)

Tranche marker: `T-011A.6` (interaction-contract docs reconciliation)

- Control-doc interaction lock reconciled to current direction:
  - room card-body tap is the primary route action (`navigate` preferred)
  - explicit room controls/orbs/buttons own toggle behavior
  - hold is optional secondary behavior only (for configured popup flows), not the global baseline
- Legacy `tap-toggle / hold-popup` wording is now historical and non-authoritative when it conflicts with the lock above.
- If any older section in this file conflicts with this lock, this `T-011A.6` section wins.
- Scope:
  - docs reconciliation only
  - no JS/YAML runtime behavior changes in this slice

## Session Delta (2026-03-07, T-011A.5)

Tranche marker: `T-011A.5` (design-guideline rewrite + doc-structure translation)

- `Dashboard/Tunet/Mockups/design_language.md`
  - fully rewritten as V2 contract spec (`v9.0`)
  - canonical-source lock updated to `Dashboard/Tunet/Cards/v2/` implementation authority
  - profile-system contracts integrated:
    - 5 family keys (`tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row`)
    - `PRESET_FAMILY_MAP` + rooms layout-aware family routing
    - API split lock: `selectProfileSize(...)` vs `resolveSizeProfile({ family, size })`
    - token ownership/consumption boundaries (`tile-core` core-lane ownership)
    - container-first width-source contract + sections compatibility expectations
    - mode-agnostic profile policy and test/gate requirements
- `Dashboard/Tunet/design.md`
  - rewritten as concise V2 documentation-structure index
  - maps canonical sources, precedence, and update workflow to prevent doc drift
- Scope:
  - docs only (no JS/YAML runtime behavior changes)
  - no deploy/cache-bust actions

## Session Delta (2026-03-07, T-011A.4)

Tranche marker: `T-011A.4` (container-width migration, prerequisite gate `G0` partial)

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - enabled container query readiness at host level (`container-type: inline-size`)
  - switched `RESPONSIVE_BASE` primary mobile density path from viewport media query to `@container (max-width: 440px)`
  - kept viewport media query only as fallback when container queries are unsupported
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - removed default `window.resize` dependency for responsive columns
  - now uses `ResizeObserver` as primary path, with `window.resize` only as fallback when `ResizeObserver` is unavailable
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - migrated responsive width resolution to container/card-first measurement
  - replaced viewport-based column/row-height/subtitle checks with host-width bucket logic (`<=440`, `<=640`)
  - added `ResizeObserver`-driven host resize path with `window.resize` fallback only when `ResizeObserver` is unavailable
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed
- Scope:
  - no YAML/dashboard structure changes
  - no deploy/cache-bust actions in this tranche
  - nav global offset isolation prerequisite remains open

## Session Delta (2026-03-07, T-011A.3)

> **Superseded:** Architecture decisions in this section were finalized in `unified_tile_architecture_conclusion.md` v3.1. Values and structure here are historical.

Tranche marker: `T-011A.3` (card-unification path lock, docs-only)

- Decision lock:
  - selected unification direction is `Option C` (family profile consumption)
  - fit score lock for planning: `8.15/10`
- Dependency ordering lock (must be completed in this order before profile rollout):
  1. container-width standardization on profile-target families
     - eliminate viewport-primary sizing paths in `tunet_lighting_card.js`
     - remove residual resize/viewport dependence in `tunet_status_card.js` responsive flow
     - align `tunet_base.js` responsive density assumptions with container-first behavior for profile-target families
  2. isolate/remove nav global layout mutation side effects
     - `tunet_nav_card.js` `ensureGlobalOffsetsStyle()` must not pollute non-target layout validation
  3. execute phased profile rollout (`G1`..`G5`)
- Additional direction locks:
  - `rooms-row` is one family profile; `slim` remains a layout variant modifier, not a separate family
  - skip Option B pilot comparison; run direct Option C pilot
  - add `getCardSize()` / `getGridOptions()` calibration gate immediately after pilot tranche (`G5`)
- Scope:
  - docs-only path lock in `Dashboard/Tunet/Agent-Reviews/type_profile_consumption_options.md`
  - no JS/YAML runtime behavior changes in this delta

## Session Delta (2026-03-07, T-011A.2)

Tranche marker: `T-011A.2` (rooms row-mode control proportionality + status metric precedence)

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - rebalanced rooms-row control tokens for proportional scaling:
    - desktop row controls reduced slightly
    - mobile row controls now scale down (no longer larger than desktop)
    - section all-toggle sizing tokens reduced for mobile readability
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.9.2`)
  - row-mode control parity:
    - ensured per-light orb buttons and row all-toggle button share identical sizing box model
    - reduced row main icon container to avoid dominating row text lane
  - row-mode mobile sizing:
    - updated row/slim control fallbacks to smaller mobile-safe values
  - status metric precedence fix:
    - when `humidity_entity` and/or `temperature_entity` are configured, row status suppresses unlabeled brightness `%`
    - brightness is shown as labeled `bri` only when no ambient entities are configured
- Scope:
  - no nav/popup interaction contract change
  - no dashboard YAML structure/layout changes
- Live HA deployment:
  - uploaded:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js` -> `/config/www/tunet/v2_next/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` -> `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - dashboard resource cache-bust:
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p09`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-07, T-011A.1)

Tranche marker: `T-011A.1` (lighting tile visual parity with rooms tiles)

- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - aligned lighting tile hover/press interaction polish with rooms tile behavior
  - tightened tile visual language parity:
    - circular icon-wrap geometry is now explicit and robust
    - icon sizing/spacing tuned to match rooms tile proportions
    - off/unavailable icon-wrap now retains visible circular container treatment
  - compact/condensed tile behavior now scales proportionally instead of overlap:
    - icon lane shrinks first
    - name/value/progress lanes are explicitly separated
    - dense compact grids (`columns >= 5`) get an additional compact scaling pass
- Scope:
  - no interaction-model changes
  - no dashboard YAML layout/config changes in this tranche
- Live HA deployment:
  - uploaded:
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` -> `/config/www/tunet/v2_next/tunet_lighting_card.js`
  - dashboard resource cache-bust:
    - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p08`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed

## Session Delta (2026-03-07, T-011A)

Tranche marker: `T-011A` (surface-by-surface layout planning reset)

- Priority reset:
  - active focus is now one-page-at-a-time layout orchestration per `Dashboard/Tunet/AGENTS.md` sections `7B` and `7C`
  - do not treat earlier P0 bug-fix list as the primary execution driver
- Repo-state verification:
  - key former P0 items are already implemented in card code and move to live-validation/documentation status:
    - centralized semantic mobile tokens in `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - row interaction lock behavior in `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - precipitation fallback/parity/toggle containment logic in `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
- Active planning order (locked):
  1. Living Room page (pilot)
  2. Living Room popup (matching pair)
  3. Overview page
  4. Media page
  5. Remaining room pages (`Bedroom`, `Kitchen`, `Dining`) using locked template + room deltas

## Session Delta (2026-03-07, T-010C.2)

Tranche marker: `T-010C.2` (popup navigation dispatch hardening)

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - hardened `navigatePath()` dispatch path:
    - emits `hass-navigate` from card element, then document, then window
    - preserves history/location fallback when no handler intercepts
  - `runCardAction()` now routes `navigate` and in-app `url` actions through `navigatePath(..., { sourceEl })`
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` (`v2.4.3`)
  - base import cache-bust updated to `tunet_base.js?v=20260307p05`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.6`)
  - base import cache-bust updated to `tunet_base.js?v=20260307p05`

- Live HA deployment:
  - uploaded:
    - `tunet_base.js`
    - `tunet_actions_card.js`
    - `tunet_rooms_card.js`
  - dashboard resources updated:
    - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p06`
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p06`

- Validation:
  - `node --check` passed for:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

## Session Delta (2026-03-07, T-010C.1)

Tranche marker: `T-010C.1` (status dropdown reliability + popup room-link navigation)

- `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`v2.6.5`)
  - hardened dropdown selection service path (ordered `input_select`/`select` fallback)
  - close-dropdown-first behavior on option select for more reliable UX
  - expanded dropdown elevation to include multiple host ancestors (`ha-card`/`hui-card`/`hui-section`) with overflow restoration
  - base import cache-bust updated to `tunet_base.js?v=20260307p04`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - popup room action normalized from `url` to `navigate` (`navigation_path`) for living-room popup
- `Dashboard/Tunet/tunet-suite-config.yaml`
  - parity update: popup room actions use `navigate` (`navigation_path`) for living/kitchen

- Live HA deployment:
  - uploaded `tunet_status_card.js` + `tunet_base.js` to `/config/www/tunet/v2_next/`
  - storage dashboard transform applied on `tunet-suite-storage`:
    - Living popup `Room` action changed to `action: navigate` with `/tunet-suite-storage/living-room`
  - dashboard resource updated:
    - `tunet_status_card.js?v=20260307_p05`

- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - YAML parse check passed for:
    - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
    - `Dashboard/Tunet/tunet-suite-config.yaml`

## Session Delta (2026-03-07, T-010B)

Tranche marker: `T-010B` (mobile bottom-clearance + rooms-row sizing parity + tile lane spacing)

- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (`v0.2.3`)
  - expanded global offset styling beyond `hui-view` to include Sections/other view hosts
  - added resize reflow and measured mobile dock clearance fallback
  - switched bottom offset formula to measured/configured max + safe area
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - increased centralized rooms-row/mobile sizing tokens (orbs/buttons/header all-toggle)
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.5`)
  - adopted updated base tokens
  - fixed row action/orb size mismatch (`.room-action-btn` icon scaling + `.room-orb` flex/min-width lock)
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` (`v3.4.4`)
  - increased compact/mobile lane spacing and bottom clearance for name/value/progress separation
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` (`v1.0.2`)
  - tightened vertical lane rules (name/value/progress spacing) to reduce lane drift

- Live HA deployment:
  - uploaded updated files to `/config/www/tunet/v2_next/`
  - updated dashboard resources:
    - `tunet_nav_card.js?v=20260307_p04`
    - `tunet_rooms_card.js?v=20260307_p04`
    - `tunet_lighting_card.js?v=20260307_p04`
    - `tunet_light_tile.js?v=20260307_p04`

- Validation:
  - `node --check` passed for:
    - `tunet_base.js`
    - `tunet_nav_card.js`
    - `tunet_rooms_card.js`
    - `tunet_lighting_card.js`
    - `tunet_light_tile.js`

## Session Delta (2026-03-07)

Tranche marker: `T-010A` (P0-1 shared density/icon/readability stabilization)

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - icon baseline tuned (`wght/GRAD/opsz`, line-height, overflow) to reduce clipping artifacts on mobile
  - mobile density tokens adjusted for control/dropdown readability
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - compact/standard/large tile vertical budgets increased to reduce value/label clipping
  - compact dropdown value typography increased for readability
  - responsive columns now resolve from rendered card/container width (ResizeObserver) rather than viewport width
  - base import cache-bust updated to `tunet_base.js?v=20260307p01`
- `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - compact chip typography and icon sizing increased for mobile readability
  - base import cache-bust updated to `tunet_base.js?v=20260307p01`
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - action strip chip text/icon size and vertical control height increased
  - base import cache-bust updated to `tunet_base.js?v=20260307p01`
- Live HA deployment:
  - uploaded changed files to `/config/www/tunet/v2_next/`
  - updated dashboard resource versions:
    - `tunet_status_card.js?v=20260307_p01`
    - `tunet_scenes_card.js?v=20260307_p01`
    - `tunet_actions_card.js?v=20260307_p01`
- Validation:
  - `node --check` passed for all four touched JS files

## Session Delta (2026-03-07, follow-up)

Tranche marker: `T-010A.1` (Rooms header all-toggle size adjustment)

- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - increased `.section-btn.all-toggle` size (desktop + mobile) for better readability/tap comfort
  - no interaction-model logic change
- Live HA deployment:
  - uploaded `tunet_rooms_card.js` to `/config/www/tunet/v2_next/`
  - resource version bumped to `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p02`
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-06 Late 2)

Tranche marker: `T-009E` (Global mobile density baseline + focused adoption pass)

- `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - added centralized mobile density tokens (`--density-mobile-*`) for card/section/tile/control/dropdown sizing
  - wired core shared surfaces (`CARD_SURFACE`, `SECTION_SURFACE`, `TILE_SURFACE`, `CTRL_SURFACE`, `DROPDOWN_MENU`) to tokenized density values
  - added `text-size-adjust` guard for iOS rendering consistency
- Adopted in key cards:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
    - reduced mobile/compact tile row heights and whitespace
    - increased compact tile text readability
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - increased text legibility and tightened mobile/horizontal spacing
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - reduced tile-mode vertical whitespace and increased name/status readability
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
    - reduced compact row height/padding while preserving readability
- Cache safety:
  - all v2 cards now import `tunet_base.js?v=20260306g3`
- Follow-up audit outputs added:
  - `Dashboard/Tunet/Docs/mobile_density_audit_weather_climate.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_media_audio.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_sensor_actions_scenes.md`
  - `Dashboard/Tunet/Docs/mobile_density_crosscard_gap_review.md`
  - `Dashboard/Tunet/Docs/mobile_density_master_matrix.md`

## Session Delta (2026-03-06 Late)

Tranche marker: `T-009D` (Status/Rooms readability + sizing stabilization, docs-first weather/brightness planning)

- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - compact readability increased (value/label/secondary text scale)
  - fixed row-height grid sizing for consistent tile sizing
  - stronger dropdown z-index layering to reduce overlap under adjacent cards
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - row/slim mobile controls (orbs/action buttons/icon sizing) increased for touch usability
- Planning docs added:
  - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
  - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
  - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`

## Canonical Control Documents

- `plan.md` is the single execution source of truth for phase order, deployment order, and current status.
- `FIX_LEDGER.md` is the detailed findings, remediation, and validation backlog.
- `Dashboard/Tunet/Docs/agent_driver_pack.md` is the orchestration source of truth for multi-agent Tunet review runs.
- `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md` and the tranche prompt docs are the execution source of truth once broad planning has selected a single slice.
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` is historical reference only for prior popup direction exploration; active direction gating lives in `plan.md`, `FIX_LEDGER.md`, and `handoff.md`.
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` is the responsive Sections layout source of truth (view/section/card width model).
- `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` is the deployment-path and staging-root reality source of truth.
- `Dashboard/Tunet/CLAUDE.md` is the Tunet UI / UX quality bar.
- If a contributor needs to know what to do next, start here.
- If a contributor needs exact defects, exact files, exact validation, or a sub-agent-ready backlog, use `FIX_LEDGER.md`.
- If a contributor is executing one small slice, use the tranche docs rather than the broad agent driver.

### Control Document Precedence

If the control documents disagree, use this precedence order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/Docs/agent_driver_pack.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Contributors must not silently resolve these conflicts. Record them explicitly.

## Sync Snapshot (2026-03-06)

This sync captures what is now learned and locked before further UI changes:

- lock the utility band as dual strips (`actions` + `scenes/chips`)
- remove stale Bubble/hash popup instructions from active execution paths
- keep popup platform lock as Browser Mod with one popup per room
- lock room gesture contract to route-first body tap with explicit control-owned toggles
- enforce anti-drift governance so micro-interaction changes cannot bypass docs and validation

### Session Delta (2026-03-06, post-deploy follow-up)

Mini-tranche completed in repo (pending live HA validation):

- `Dashboard/Tunet/Docs/weather_card_refactor_plan.md` added as implementation-ready weather refactor plan (precip parity, data-source fallback, density and toggle containment).
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js` updated for compact readability + consistent row sizing + dropdown host elevation behavior.
- `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js` updated for tighter chip density and improved text legibility.
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` mobile row variant sizing increased (icon/orb/toggle/text scale-up).
- `Dashboard/Tunet/Docs/status_chips_resolution_guide.md` added.
- `Dashboard/Tunet/Docs/brightness_alignment_rca.md` added (root cause + optioned fix path, no code change in this slice).

Validation completed:

- `node --check` pass:
  - `tunet_status_card.js`
  - `tunet_scenes_card.js`
  - `tunet_rooms_card.js`

## Execution Reset (2026-03-06)

This section is a mandatory execution override for all near-term Tunet work.

### Change Gate (Mandatory Before Any Implementation)

Every change must include:

- a `Change ID` (for example: `CP-01`, `LAY-02`, `INT-01`, `POP-01`)
- a cross-card impact statement (`nav`, `rooms`, `status`, `sensor`, and affected YAML surfaces)
- a surface declaration (`Repo Architecture Surface` vs `Storage/Hybrid Evaluation Surface`)
- a validation checklist (visual + interaction + regression)
- a rollback/cache-bust path when frontend modules or dashboard config change

If one of those is missing, implementation is not allowed to start.

### WIP Budget (Mandatory)

- One active tranche at a time.
- Maximum three active implementation items inside that tranche.
- No side-scope edits outside the active tranche objective.

### Definition Of Ready / Done

- `Ready`: decision-locked spec + impact map + concrete validation cases.
- `Done`: code/config changed, deployed where required, visually validated, and synced in `plan.md` + `FIX_LEDGER.md` + `handoff.md`.

## Current Execution Tranche

The current work is a control-doc alignment and profile-foundation tranche, then one-surface layout execution.

### User-Locked Next Decision Order

The next four major decisions must be handled one at a time, in this order:

1. `NAV`
2. `POPUP`
3. `INTEGRATED UI / UX`
4. `HOME LAYOUT`

Contributors must not silently reorder these back into an older implementation-driven sequence without explicit user approval.

### What That Means Operationally

- Do not keep polishing the home layout while nav and popup direction are still unsettled.
- Do not treat the current storage overview composition as "the" final overview architecture.
- Do not use the current forced-mobile nav configuration as the baseline product direction.
- Do not continue investing in Bubble hash popups as the canonical path when the user preference is now Browser Mod.
- Do not treat popup work as generic card stacks; the product direction is one polished popup per room, styled like an iOS-grade sheet rather than a lazy default overlay.
- Do not treat component width as the only Sections concern; placement, role, one-touch controllability, and interaction hierarchy matter as much as span ratios.

### Current Active Tranche

`T-011A.8 - Control-Doc Alignment + Profile Foundation (G0 Closeout -> G1)`

This tranche is docs-first and execution-order focused:

- resolve control-doc contradictions explicitly
- lock immediate next implementation step as `G1` base primitives in `Dashboard/Tunet/Cards/v2/tunet_base.js`
- keep `FL-038` one-surface sequence locked, but queued until `G1` passes
- preserve one-active-tranche discipline and avoid cross-scope edits

### T-011A Status (Queued After G1)

`T-011A - Surface-By-Surface Layout Planning (Living Room -> Popup -> Overview)`

This tranche remains locked and required for final dashboard orchestration:

- lock one active surface at a time using the Sections 3-layer model (Page -> Section -> Card)
- produce implementation-ready per-surface layout specs before further cross-surface polish
- keep previously landed card fixes in verification/backlog mode unless a concrete regression is reproduced
- enforce AGENTS sequence: room page -> matching popup -> overview -> media -> remaining rooms

### T-011A Scope (Locked)

- Change ID: `T-011A`
- Files:
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `plan.md`
  - `FIX_LEDGER.md`
  - `handoff.md`
- Acceptance:
  - one active-surface queue is documented with explicit lock status per surface
  - each surface spec includes:
    - page intent (`hero`, `companion`, `support`)
    - interaction contract (first-touch behavior and popup/nav relationship)
    - page-level settings (`max_columns`, `dense_section_placement`)
    - section-level spans (`column_span`/`row_span`)
    - card-level placement rules (`grid_options`, when to force `columns: full`)
    - breakpoint checklist for `390x844`, `768x1024`, `1024x1366`, `1440x900`
  - old P0 bug-fix tasks that are already code-complete are explicitly marked as verification/backlog, not active implementation

### T-009A Scope (Locked)

- Change ID: `T-009A`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `plan.md`
  - `FIX_LEDGER.md`
  - `handoff.md`
- Acceptance:
  - Drag-enabled tile surfaces use `touch-action: pan-y` (not `none`)
  - Axis-lock helper defaults to scroll passthrough for vertical/ambiguous gestures
  - Horizontal drag still updates brightness/volume controls
  - No pointer syntax/runtime regressions (`node --check` for touched modules)
  - Syntax/YAML checks pass

### T-008B (Completed In Prior Slice)

This tranche applied deliberate per-component orchestration to the Bedroom subview using the Sections 3-layer model (page -> section -> card), without changing locked room tap/hold contracts.

### T-008A (Completed In Prior Slice)

This tranche applied the 3-layer sections model directly to `tunet-suite-storage` using explicit view/section controls and 2026.3 footer-card support.

### T-008A Scope (Locked)

- Change ID: `T-008A`
- Files:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- Acceptance:
  - every sections view uses explicit `max_columns` + `dense_section_placement`
  - overview spans use normalized 4-column semantics (`4/3/1`)
  - nav placement uses view `footer.card` rather than in-section placement
  - Syntax/YAML checks pass

### Completed In Prior Slice

- `T-009B` status density + rooms row mobile sizing + weather/RCA docs are code/doc-complete in repo source and pending live HA verification.
- `T-009A` iOS touch/scroll hardening is code-complete in repo source and pending live device validation.
- `T-008B` Bedroom orchestration POC is code-complete in repo source and pending live breakpoint validation.
- `T-008A` sections runtime application is code-complete in repo source.
- `T-006A` status-dropdown hardening is code-complete and pending live HA verification.

### Open Lock Conflict (Must Reconcile Before FL-030 Closure)

- `plan.md` + `FIX_LEDGER.md` previously locked room interactions to legacy tap-toggle language.
- `handoff.md` and latest user direction include row-variant behavior where card-body primary action may be popup/navigation while sub-controls handle toggles.
- This conflict is intentionally not resolved inside `T-006A`; it must be reconciled in the next room-interaction tranche.

### Tranche Deliverables

- a mandatory change gate and WIP budget applied to every new Tunet change
- a locked micro-interaction contract for room and light surfaces
- a locked dual utility band contract (`actions + scenes/chips`)
- a Sections-native layout matrix reset that explicitly separates:
  - page/view width controls
  - section span controls
  - card grid controls
- validated reference compositions after live breakpoint tuning
- no ad-hoc popup/nav behavior changes outside the locked contract

## System State Model

This section replaces the old mixed "reality snapshot."

For Tunet, three different truths must be kept separate:

1. `REPO STATE`
2. `LIVE HA STATE`
3. `PRODUCT STATE`

If these are blended together, future work will incorrectly treat:

- code existence as product acceptance
- live deployment as design completion
- historical experiments as current architecture

### Surface Model

Tunet now has more than one meaningful dashboard surface in play.

That is not inherently a problem. It becomes a problem only when contributors fail to say which surface they are optimizing.

For this project, the surfaces must be interpreted like this:

#### 1. Repo-Controlled Architecture Surface

- `Dashboard/Tunet/tunet-suite-config.yaml`
- role:
  - architecture source
  - repo-controlled reference implementation
  - deployment-safe staging baseline
- use this surface for:
  - canonical entity modeling
  - structural dashboard architecture
  - resource-root and deployment-path discipline
  - branch-reviewable changes
- do not use this surface alone to claim the daily-use product is correct

#### 2. Primary Evaluation / UI-Edit Surface

- `tunet-suite-storage`
- role:
  - user-facing evaluation surface
  - storage/hybrid editing surface
  - fastest place to judge whether the product actually feels right
- use this surface for:
  - tranche-by-tranche UX evaluation
  - testing whether a direction works for real daily use
  - checking whether UI-editability is acceptable
  - judging nav, popup, shell, and home-layout quality
- do not treat this surface as the only architecture source when it drifts from repo state

#### 3. Historical / Reference Surfaces

- `Dashboard/Tunet/tunet-overview-config.yaml`
- `Dashboard/Tunet/tunet-v2-test-config.yaml`
- older live storage dashboards
- role:
  - historical reference
  - component harness
  - migration/comparison aid
- use these surfaces for:
  - finding older behavior worth restoring
  - comparing V1/V2 behavior
  - validating isolated card behavior
- do not use these surfaces to define the next major product decision unless explicitly promoted

### Surface Leadership Rules

These rules exist to stop future work from optimizing the wrong thing:

- If the task is about:
  - product feel
  - one-touch usability
  - family-grade clarity
  - visual hierarchy
  - nav / popup / shell / home-layout judgment
  then the `Primary Evaluation / UI-Edit Surface` leads.

- If the task is about:
  - canonical architecture
  - branch truth
  - deployable reference config
  - entity normalization
  - resource pathing
  - long-term maintainability
  then the `Repo-Controlled Architecture Surface` leads.

- If the two surfaces drift:
  - contributors must say so explicitly
  - contributors must state which surface is being corrected first
  - contributors must not silently claim both are current and equivalent

- For this project’s current stage:
  - architectural direction should remain repo-legible
  - experiential judgment should be made on the storage/hybrid evaluation surface

### Direction Locks

These are active product-direction locks, not implementation facts:

- The next four major decisions must happen in this order:
  1. `NAV`
  2. `POPUP`
  3. `INTEGRATED UI / UX`
  4. `HOME LAYOUT`
- Browser Mod is the preferred direction for the next popup tranche.
- One popup per room is the intended popup model.
- Overview utility band is a dual-strip contract:
  - strip 1: `custom:tunet-actions-card`
  - strip 2: `custom:tunet-scenes-card`
- The interaction quality bar is Apple-grade in the sense of:
  - one-touch primaries
  - low cognitive load
  - premium but quiet chrome
  - progressive disclosure
- Sections decisions are about role, placement, hierarchy, and one-touch value, not just width ratios.

### Top-Down Product Considerations

These considerations flow from the intended daily-use experience:

- The suite must be understandable to people who did not build it.
- The first action and current location should be obvious without explanation.
- Nav is not just routing; it is the first premium product surface.
- Popups are not generic overlays; they are intentional, high-value room surfaces.
- Home layout should not be finalized before nav, popup, and shell language are settled.
- A surface earns width and prominence through interaction value, not because a card happens to exist.

### Bottom-Up System Considerations

These considerations flow from Home Assistant mechanics and maintainability:

- YAML and storage dashboards are both in play; contributors must state which surface they are touching.
- `v2_next` is still the staging root and remains the safe deployment target until cutover is approved.
- Custom cards can be implemented, deployed, and even visually improved before they are accepted as product direction.
- Historical Bubble/hash work exists in the branch and can still mislead future work unless explicitly fenced.
- V1 cards may be selectively reused, but custom element collisions must be avoided.

### Repo State

These are facts about the branch contents:

- DONE REPO.01: New dashboard YAML exists at `Dashboard/Tunet/tunet-suite-config.yaml`; Verify: the file exists on this branch.
- DONE REPO.02: V2 cards are deployed from repo under the `v2_next` staging path convention; Verify: `Dashboard/Tunet/Cards/v2/` is the active working suite.
- DONE REPO.03: `tunet-nav-card` exists in repo as the custom navigation foundation; Verify: `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` exists.
- DONE REPO.04: Bug 1 and Bug 2 code work exists in repo `tunet_status_card`; Verify: see Phase 0 verification tasks.
- DONE REPO.05: Bug 3 is removed from repo YAMLs (`sensor.aqi` removed); Verify: `rg "sensor\\.aqi" Dashboard/Tunet/*.yaml` returns no matches.
- DONE REPO.06: Office is merged into Living Room in repo configs; Verify: there is no `path: office` in `tunet-suite-config.yaml`.
- DONE REPO.07: Detailed remediation backlog exists in `FIX_LEDGER.md`; Verify: the file exists.
- DONE REPO.08: Multi-agent orchestration and tranche workflow docs exist on this branch; Verify: `agent_driver_pack.md` and tranche docs exist.

### Live HA State

These are facts about the deployed Home Assistant environment and should be re-validated before relying on them:

- DONE HA.01: Dashboard YAML is deployed to HA at `/config/dashboards/tunet-suite.yaml`; Verify: HA host filesystem shows the file at that path.
- DONE HA.02: `tunet-suite` YAML dashboard is registered in HA and reachable; Verify: Settings -> Dashboards lists `tunet-suite` and `/tunet-suite/overview` opens.
- DONE HA.03: V2 card resources are deployed under `/config/www/tunet/v2_next/`; Verify: direct browser fetch of a resource returns JS (200).
- DONE HA.04: Lovelace resources were repointed to `/local/tunet/v2_next/...`; Verify: Settings -> Dashboards -> Resources shows `/local/tunet/v2_next/` URLs.
- DONE HA.05: HA Core version is `2026.3.0b1`; Verify: Settings -> About shows `2026.3.0b1`.
- TODO HA.06: At least one HA Storage dashboard still contains stale `sensor.aqi` references; Verify: searching storage dashboard YAML in HA still finds `sensor.aqi`.
- TODO HA.07: V2 config-editor behavior is not validated end-to-end in the live UI; Verify: Phase 0 diagnostics.

### Product State

These are facts about what the product has and has not actually achieved yet. They are not satisfied merely because code or deployment exists.

- DONE PRODUCT.01: The project now has a credible control-plane model: branch discipline, doc precedence, tranche workflow, and explicit direction locks.
- DONE PRODUCT.02: The order of the next major decisions is now aligned to actual user intent: nav, popup, integrated UI / UX, home layout.
- PARTIAL PRODUCT.03: The custom nav exists, but it is not yet accepted as the real premium chrome experience.
- PARTIAL PRODUCT.04: The overview is structurally better than the original vertical-stack state, but the home-screen product direction is not yet settled.
- PARTIAL PRODUCT.05: Status-card parity work reduced one visible regression, but it did not solve the upper-overview product hierarchy.
- PARTIAL PRODUCT.06: Browser Mod room popup standard is implemented for Living + Kitchen; Dining + Bedroom still need completion.
- DONE PRODUCT.07: Room micro-interaction contract is locked to route-first body tap with explicit control-owned toggles and enforced in control docs.
- DONE PRODUCT.08: Utility-band direction is locked as dual strips (`actions + scenes/chips`).
- TODO PRODUCT.09: The V1 atmosphere / shell language has not yet been recovered in a Sections-compatible way.
- TODO PRODUCT.10: The home hero and overview hierarchy are not yet accepted as the final daily-use product direction.

## Supersession Register

This register exists so future work does not silently reuse displaced assumptions.

| Old Assumption | Replaced By | Why | Do Not Use For | Still Reusable For |
|---|---|---|---|---|
| Bubble/hash popup POC is the active popup path | Browser Mod preferred, one popup per room | The user explicitly redirected popup architecture toward a more robust and premium overlay model | choosing the next popup platform | harvesting narrow implementation ideas from historical POC work |
| Layout should keep being refined before nav/popup/UI direction is settled | Nav first, popup second, integrated UI / UX third, home layout fourth | Product-decision order is now locked | choosing the next major tranche | critiquing what is structurally wrong with the current overview |
| Lighting + Environment is a locked final overview answer | Lighting + companion is only the current leading home-layout candidate | Home layout is still downstream of nav, popup, and shell decisions | claiming the home-screen design is settled | starting later home-layout exploration |
| Implemented in repo means effectively done | Repo state, live HA state, and product state must be tracked separately | This project is design-led and daily-use quality matters as much as code existence | claiming a product surface is complete | operational rollout tracking |

## Branch And Findings Discipline

- Broad Tunet planning work is authoritative only on branch `claude/dashboard-nav-research-QnOBs`.
- Contributors must record the live current branch and HEAD before producing planning artifacts.
- Prior findings must be classified as:
  - `OPEN`
  - `ALREADY FIXED IN REPO`
  - `FIXED IN REPO BUT NOT DEPLOYED`
  - `FIXED IN YAML BUT NOT STORAGE`
- Contributors must not repeat older findings as open without checking current branch state first.

### Known Findings That Must Be Reconciled Before Reuse

- `back_path` is already present on Tunet suite subviews on this branch.
- the storage Living Room popup already uses one consolidated `tunet-lighting-card` on this branch.
- `tunet_sensor_card.js` `value_attribute` support must be checked against current branch state before restating it as open.
- nav active color token drift in `tunet_nav_card.js` must be checked against current branch state before restating it as open.

## Goals
- Make `tunet-suite` a real HA dashboard: registered, visible, loads without red error cards or custom-element collisions.
- Use Sections layout correctly: no forced vertical sizing; cards self-size by content; default grid hints use columns + min_columns (no hard max unless explicitly justified).
- Establish navigation architecture with the custom `tunet-nav-card` as a real product surface, not a hidden POC.
- Prefer Browser Mod for the next popup tranche rather than continuing to treat hash popups as canonical.
- Lock and implement a dual utility band (`tunet-actions-card` + `tunet-scenes-card`) as the top control surface.
- Prevent micro-interaction drift through mandatory contract + validation updates before behavior changes.
- Start from ONE working popup proof, then converge on a repeatable pattern: minimal quick actions + one intentional interaction surface + clear route to deeper control.
- Rollback stays easy: keep `v2_next` as staging; keep a stable resource root available for quick revert.

## Non-Goals
- Full visual UI editors for complex nested arrays (tiles/zones/sensors) unless required; YAML remains acceptable for power-user configs.
- Creating an Office room/surface (Office is part of Living Room).
- Retheming/redesigning cards beyond what is required for correctness, navigation, and readability.
- Migrating every legacy HA Storage dashboard (only fix those blocking progress and known-bad entities like `sensor.aqi`).

## Constraints / Rules Of Engagement
- Grid sizing strategy: do NOT force vertical rows; let Sections auto-size height; default to `columns` + `min_columns` in `getGridOptions()` and avoid `rows:` in YAML configs.
- Popup strategy: Browser Mod is the preferred direction for the next popup tranche. Existing Bubble/hash work is historical POC material unless explicitly re-approved.
- Popup content strategy: prefer ONE intentional interaction surface inside the popup (do not duplicate many `tunet-light-tile` cards).
- Popup product strategy: one popup per room, polished like an iOS-grade overlay, no lazy default styling, no generic pill grabber.
- Interaction standard: optimize for one-touch controllability on primary actions in the Apple sense of clarity, immediacy, and progressive disclosure.
- V1 cards may be used selectively if they are better, but avoid custom element tag collisions:
- Do NOT load V1 and V2 resources that define the same `customElements.define('tunet-*')` tags at the same time.
- If a V1 card is required, either rename its custom element tag(s) or isolate it into a dashboard/resource set that does not load the V2 suite.

## Near-Term Tranche Sequence (Supersedes Older Near-Term Order)

The near-term product sequence is now:

1. `CP-02 - Governance + Direction Sync (Docs/Plan Lock)`
2. `T-006 - Browser Mod popup completion + interaction contract finish`
3. `T-007 - Integrated UI / UX utility-band implementation`
4. `T-008 - Sections layout matrix runtime enforcement`
5. `T-009 - Home layout and hero finalization`

These tranches must be handled one at a time and verified before the next tranche starts.

### Locked Micro-Interaction Contract (Superseded 2026-03-07)

- Room tile (active lock):
  - card-body tap -> primary route action (`navigate` preferred)
  - explicit controls/orbs/buttons -> toggles
  - hold (>= 400ms) -> optional popup behavior only where configured
- Light controls:
  - keep tap-to-toggle behavior as default
  - hold semantics are per-control and must be documented where used
- Popup platform:
  - Browser Mod only for active popup work unless an explicit exception is recorded

### Micro-Interaction Drift Prevention (Locked)

Any change that touches tap/hold/double-tap/navigation/popup behavior must include all of the following before merge or deploy:

1. `Change ID` + touched interaction surfaces (`rooms`, `status`, `lighting`, `nav`, popup YAML)
2. explicit before/after contract statement in this plan
3. matching ledger entry update in `FIX_LEDGER.md` (`OPEN`, `PARTIAL`, or `DONE` with validation)
4. live validation evidence across at least:
   - one phone width
   - one tablet width
   - one desktop width

If any one of those artifacts is missing, the interaction change is considered drift and must be rolled back or re-scoped.

### Sections Layout Research Contract (2026-03-06)

- Native Sections responsiveness is mandatory.
- Layout tuning must use three explicit layers in order:
  - page/view (`max_columns`, `dense_section_placement`, effective runtime columns)
  - section (`column_span`, `row_span`)
  - card (`grid_options` / `getGridOptions()`)
- Card-level hard width caps are disallowed by default.
- `getGridOptions()` should prefer flexible sizing (no hard `max_columns`) unless a documented exception exists.
- `max_columns` must be treated as a cap, not a guaranteed rendered column count.
- If default Sections theme width variables are unchanged, tune expecting practical runtime behavior in the 1-4 column range on common devices.
- Layout decisions must be validated at phone, tablet, and desktop widths using role-based compositions (for example 60/40, 50/50, 1/3-2/3), not just one-card-per-section stacking.

### Directional Notes For The Next Four Decisions

- `NAV`:
  - nav should act as premium chrome and may carry tiny live-state hints where they materially improve scannability
  - avoid turning nav into a full content surface too early
- `POPUP`:
  - one popup per room
  - Browser Mod preferred
  - visually polished like an iOS-grade sheet, not a generic card stack
- `INTEGRATED UI / UX`:
  - recover V1 atmosphere, rhythm, and polish in a Sections-compatible way
  - prioritize one-touch clarity over decorative complexity
- `HOME LAYOUT`:
  - decide placement by interaction role and one-touch value, not just by span ratios or card dimensions

## Phase 0 - Make The POC Reachable And Safe (Registration, Resources, Cache, Baselines)

### 0.1 - Safety Baseline (HA-Side)
- TODO P0.01: Create a full HA backup named `pre_tunet_suite_2026_03_01`; Outcome: rollback point exists; Verify: Settings -> System -> Backups lists the new backup with the expected name/timestamp.
- TODO P0.02: Capture current Lovelace Resources list (URLs + types) for rollback; Outcome: exact rollback path for resources; Verify: screenshot or copied text is saved somewhere outside HA cache (notes).
- TODO P0.03: Capture current Dashboards list (URL paths + modes) for rollback; Outcome: exact rollback path for dashboards; Verify: screenshot/notes of Settings -> Dashboards.

### 0.2 - Register `tunet-suite` YAML Dashboard (Do Not Assume It Is Registered)
- DONE P0.04: Confirm `/config/dashboards/tunet-suite.yaml` exists on HA; Outcome: registration points to a real file; Verify: `/tunet-suite/overview` opens.
- DONE P0.05: Register `tunet-suite` in `/config/configuration.yaml` under `lovelace: dashboards:` (mode: yaml, filename: `dashboards/tunet-suite.yaml`); Outcome: HA knows about the dashboard; Verify: Settings -> Dashboards shows it.
- DONE P0.06: Restart HA after `configuration.yaml` edit; Outcome: dashboard registration loads; Verify: HA returns to RUNNING state and dashboards list is accessible.
- DONE P0.07: Confirm `tunet-suite` appears in Settings -> Dashboards; Outcome: dashboard is registered; Verify: it shows with correct title/icon and opens.
- TODO P0.08: Open `/tunet-suite/overview` in the UI and sanity-check rendering; Outcome: Overview view loads; Verify: no "dashboard not found" and no red error banners.

### 0.3 - Resource Hygiene (V2 Next + Collision Avoidance)
- DONE P0.09: V2 JS is deployed to `/config/www/tunet/v2_next/`; Outcome: HA can serve the files; Verify: open `/local/tunet/v2_next/tunet_status_card.js` in a browser and see source.
- TODO P0.10: Confirm `tunet_base.js` exists at `/config/www/tunet/v2_next/tunet_base.js`; Outcome: runtime imports succeed; Verify: open `/local/tunet/v2_next/tunet_base.js` and it loads (200).
- DONE P0.11: Lovelace resources point to `/local/tunet/v2_next/...` and are `type: module`; Outcome: correct import semantics; Verify: Settings -> Dashboards -> Resources list.
- DONE P0.12: Confirm Browser Mod resource is installed and loaded; Outcome: popup-card and Browser Mod actions can render; Verify: Lovelace Resources includes `/browser_mod.js`.
- TODO P0.13: Confirm there are no duplicate Tunet resources (V1 + V2) defining the same tag names; Outcome: no registry collisions; Verify: browser console has no `Failed to execute 'define'` errors mentioning `tunet-`.

### 0.4 - Cache Bust Strategy (So Testing Is Real)
- DONE P0.14: Bump a single coherent `?v=` on all `/local/tunet/v2_next/*.js` resources (same version string across all cards); Outcome: HA frontend reloads modules; Verify: Lovelace Resources show consistent `?v=` values.
- TODO P0.15: Hard refresh with DevTools "Disable cache" enabled; Outcome: no stale resources; Verify: Network tab shows resources fetched with the bumped `?v=`.

### 0.5 - Grid Sizing Alignment (Sections Auto-Height)
- DONE P0.31: Remove stale `rows:` constraints from Tunet YAML dashboards (`tunet-suite-config.yaml`, `tunet-overview-config.yaml`, `tunet-v2-test-config.yaml`); Outcome: lighting cards now use intrinsic height in Sections at the repo level; Verify: `rg -n "rows:\\s*2" Dashboard/Tunet/*.yaml` returns no matches.
- DONE P0.32: V2 cards implement columns-only `getGridOptions()` (no `rows`, `min_rows`, `max_rows`); Outcome: Sections sizing hints follow policy; Verify: code search shows no `min_rows`/`max_rows` and default hints use `{ columns, min_columns }` unless an explicit exception is documented.
- TODO P0.33: Verify Sections auto-height visually on `/tunet-suite/overview`; Outcome: cards expand to fit content; Verify: no cut-off content in lighting/status/sensor cards at multiple viewport widths.

### 0.6 - Entity Inventory Audit (Prevent Red Error Cards)
- TODO P0.16: In HA Developer Tools -> States, confirm core system entities exist: `sensor.oal_system_status`, `sensor.oal_global_brightness_offset`, `input_select.oal_active_configuration`; Outcome: status/actions cards can render; Verify: each entity is present and has state.
- TODO P0.17: Confirm core services/scripts exist: `script.oal_reset_soft`; Outcome: aux actions work; Verify: calling script works (or update config to match real script).
- TODO P0.18: Confirm room light group entities exist: `light.living_room_lights`, `light.kitchen_island_lights`, `light.bedroom_primary_lights`; Outcome: consolidated room lighting surfaces can use group expansion; Verify: each entity exists and toggles.
- TODO P0.19: Confirm per-light entities referenced in `tunet-suite-config.yaml` exist (Living: couch/floor/spots/credenza/desk; Kitchen: pendants/main/under-cab; Dining: spots/columns; Bedroom: main/accent/table lamps); Outcome: no missing lights; Verify: no entity rows are missing in States.
- TODO P0.20: Confirm media entities exist: `media_player.living_room`, `media_player.kitchen`, `media_player.dining_room`, `media_player.bedroom`; Outcome: media cards can render; Verify: each entity exists (or remove speakers from config).
- TODO P0.21: Confirm climate entity exists: `climate.dining_room`; Outcome: climate card works; Verify: entity exists and responds.
- TODO P0.22: Confirm sensor entities exist: `sensor.dining_room_temperature`, `sensor.kitchen_humidity`; Outcome: sensor/status cards populate; Verify: values are numeric and update.

### 0.7 - Validate Phase 0 Bugs In Real UI (Even If Code Is Done)
- DONE P0.23: Bug 1 implemented in V2 `tunet_status_card` (uniform padding; no conditional `has-aux` padding); Outcome: row height is uniform across tiles.
- TODO P0.24: Verify Bug 1 on `/tunet-suite/overview`; Outcome: tiles with/without aux pill appear equal height; Verify: visually inspect mixed tiles in same row.
- DONE P0.25: Bug 2 implemented (`aux_show_when` respected + state tracking); Outcome: aux pill shows only when condition passes.
- TODO P0.26: Verify Bug 2 by forcing global offset to 0 and non-0; Outcome: "Reset" pill toggles visibility without reload; Verify: observe pill appear/disappear as the entity changes.
- DONE P0.27: Bug 3 removed from repo YAMLs (`sensor.aqi` removed); Outcome: repo YAMLs are clean.
- TODO P0.28: Locate and remove any `sensor.aqi` references in HA Storage dashboards; Outcome: no missing entity rows remain; Verify: in HA dashboard YAML editor search `sensor.aqi` returns zero matches.
- TODO P0.29: Verify legacy Storage dashboards no longer show `?` for AQI; Outcome: clean sensor rows; Verify: open affected dashboards and confirm no AQI row.
- TODO P0.30: Validate Bug 4 by adding a simple Tunet card via the UI card picker; Outcome: confirm whether config editors appear; Verify: Add card -> pick a Tunet card (nav/weather/climate) shows a form instead of YAML-only.

### 0.8 - Findings Backlog Reconciliation
- DONE P0.34: `FIX_LEDGER.md` exists and is linked from this plan; Outcome: there is now one detailed backlog for findings and fixes; Verify: `FIX_LEDGER.md` exists at repo root.
- TODO P0.35: Work immediate operational items from `FIX_LEDGER.md` first (FL-001 through FL-010); Outcome: plan, repo, and live staging state stop drifting; Verify: each item is either closed in code/docs or explicitly deferred with rationale.

### Phase 0 Verification Checklist (Click/Observe)
- TODO P0.V01: Settings -> Dashboards shows "Tunet Suite (POC)" and it opens; Verify: `/tunet-suite/overview` loads.
- TODO P0.V02: `/tunet-suite/overview` renders all custom cards without red error cards; Verify: scroll through Overview and confirm no "Custom element doesn't exist" errors.
- TODO P0.V03: Browser console is clean of registry collisions and 404 module loads; Verify: no `customElements.define` collisions and no failed module imports.
- TODO P0.V04: DevTools Network shows Tunet card modules loaded from `/local/tunet/v2_next/` with the latest `?v=`; Verify: every `tunet_*.js` resource request includes the bumped version.

## Phase 1 - Browser Mod Room Popup Standard (Active)

### Definition Of Done (Working Contract)
- all room popups use Browser Mod (`custom:popup-card` + `browser_mod.popup`)
- one popup per room (`living-room`, `kitchen`, `dining-room`, `bedroom`)
- room tile interaction is consistent:
  - card-body tap -> route action
  - explicit controls -> toggle actions
  - hold -> popup only where configured (`fire-dom-event`, browser-scoped)
- each popup stays intentionally narrow:
  - quick actions
  - one primary interaction surface
  - route to full room view

### 1.1 - Current Progress Snapshot
- DONE P1.01: Living Room popup-card exists and routes from room hold action.
- DONE P1.02: Kitchen popup-card exists and routes from room hold action.
- DONE P1.03: Popup cards use `initial_style` (no deprecated `size` field).
- DONE P1.04: Living/Kitchen popups use one consolidated `tunet-lighting-card` each (no tile stacks).
- DONE P1.05: Room tile interaction contract implemented in `tunet-rooms-card` (route-first body tap + explicit control-owned toggles).

### 1.2 - Remaining Room Popup Work
- TODO P1.06: Add Dining room popup-card and wire hold action to `popup_card_id: dining-room-popup`.
- TODO P1.07: Add Bedroom popup-card and wire hold action to `popup_card_id: bedroom-popup`.
- TODO P1.08: Add explicit "Open Room" route action inside each popup surface.
- TODO P1.09: Ensure each popup has quick actions without oversized controls.
- TODO P1.10: Validate popup behavior at 390px and 520px widths (no horizontal overflow).

### Phase 1 Verification Checklist (Click/Observe)
- TODO P1.V01: Long-press each room tile; verify matching room popup opens.
- TODO P1.V02: In each popup, verify exactly one primary lighting surface.
- TODO P1.V03: Tap popup "Open Room"; verify correct subview opens.
- TODO P1.V04: Verify browser back/forward keeps nav and popup behavior coherent.

## Phase 2 - Room Subviews (Consolidation + Companion Surfaces)

### 2.1 - Living Room Subview
- DONE P2.01: Living Room subview uses one consolidated `tunet-lighting-card`.
- TODO P2.02: Add room-scoped actions row for Living Room.
- TODO P2.03: Keep/add media companion for `media_player.living_room`.
- TODO P2.04: Keep room companion sensors minimal and non-empty (no placeholder shells).

### 2.2 - Kitchen / Dining / Bedroom Subviews
- TODO P2.05: Kitchen subview uses one consolidated `tunet-lighting-card`.
- TODO P2.06: Dining subview uses one consolidated `tunet-lighting-card`.
- DONE P2.07: Bedroom subview uses one consolidated `tunet-lighting-card`.
- PARTIAL P2.08: Dining climate remains; Bedroom capability-fit on storage source now includes context chips + lighting/actions + sonos/alarm companion panels (live validation pending).
- TODO P2.09: Add media companions only where entities exist.

### 2.3 - Regression Guard
- DONE P2.10: Office remains merged into Living Room.
- TODO P2.11: Ensure no room lists or nav items reintroduce Office.

### Phase 2 Verification Checklist (Click/Observe)
- TODO P2.V01: Open each room subview and verify no red error cards.
- TODO P2.V02: Verify one consolidated lighting surface per room subview.
- TODO P2.V03: Verify room-level actions/media companions behave as configured.
- TODO P2.V04: Validate Bedroom subview composition at phone/tablet/desktop widths (hero chips + side-by-side companion sections on tablet+).

## Phase 3 - Utility Band And Integrated UI / UX Prep

### 3.1 - Utility Band Contract (Locked)
- DONE P3.01: Utility band direction is dual-strip (`actions` + `scenes/chips`) in control docs.
- TODO P3.02: Ensure repo storage config and live storage config both carry the dual strip consistently.
- TODO P3.03: Define minimal sizing and spacing contract so strips remain compact on phone/tablet/desktop.

### 3.2 - Integrated UI / UX Lessons To Carry Forward
- Keep primary actions one-touch and obvious.
- Keep overlays intentionally minimal and non-duplicative.
- Keep section span decisions role-based, not card-size-driven.
- Keep card-level `max_columns` as explicit exception only.

### 3.3 - Touch/Scroll Gesture Contract
- DONE P3.04: Add shared axis-lock drag utility in `tunet_base.js`; Outcome: one reusable drag contract for tile-style cards.
- DONE P3.05: Apply `touch-action: pan-y` + axis-lock to highest-impact tile drag surfaces (`tunet_lighting_card`, `tunet_light_tile`, `tunet_speaker_grid_card`); Outcome: vertical page scroll should pass through while horizontal drag remains available.
- TODO P3.06: Validate iOS/WKWebView behavior on real device for:
  - lighting hero tiles
  - standalone light tiles
  - speaker grid tiles
  Outcome: vertical scroll no longer stalls when gesture starts on a drag-enabled tile.
- TODO P3.07: Apply same contract to remaining mixed-gesture cards where needed (`tunet_sonos_card` tile drag path); Outcome: no diagonal scroll+drag jitter.

### Phase 3 Verification Checklist (Click/Observe)
- TODO P3.V01: On iOS phone, start a vertical scroll gesture on a lighting tile; Verify: page scrolls immediately.
- TODO P3.V02: On iOS phone, horizontal drag on a lighting tile still dims/brightens without opening more-info.
- TODO P3.V03: On iOS phone, speaker tile vertical swipe scrolls page; horizontal drag still adjusts volume.
- TODO P3.V04: Confirm long-press behavior still opens more-info where expected (light tile, speaker tile).

## Phase 4 - Navigation Card Hardening (Beyond POC)

### 4.1 - Active Route Highlighting
- DONE P4.01: `tunet-nav-card` exists with 3 items and desktop breakpoint 900; Outcome: nav renders; Verify: nav card appears in `tunet-suite-config.yaml`.
- TODO P4.02: Verify active highlighting updates on view navigation and browser back/forward; Outcome: no stale active state; Verify: active icon changes correctly when navigating Overview/Rooms/Media.
- TODO P4.03: Verify room subviews count as Rooms active; Outcome: Rooms stays highlighted in subviews; Verify: open `/tunet-suite/living-room` and Rooms is active.

### 4.2 - Safe Area, Offsets, And Kiosk
- TODO P4.04: Validate safe-area padding on mobile (iOS/Android); Outcome: nav not clipped; Verify: device with notch shows full nav.
- TODO P4.05: Validate global offsets applied by nav card do not affect non-Tunet dashboards; Outcome: offsets are scoped or safe; Verify: open a non-Tunet dashboard and confirm layout unchanged.
- TODO P4.06: Decide kiosk-mode approach for `tunet-suite` (kiosk-mode HACS vs native) and implement; Outcome: tablet view has clean chrome; Verify: header/sidebar hidden as desired.

### 4.3 - Optional Media Mini-Player (Only If Worth It)
- TODO P4.07: Decide whether to add a mini-player to nav card or rely on Media view; Outcome: avoid feature creep; Verify: decision captured as DONE/TODO in this plan.
- TODO P4.08: If mini-player is kept, implement minimal now-playing + play/pause + tap to `/tunet-suite/media`; Outcome: lightweight media access; Verify: controls work and do not degrade performance.

### Phase 4 Verification Checklist (Click/Observe)
- TODO P4.V01: Resize viewport below/above 900px; Verify: bottom bar becomes side rail without layout breakage.
- TODO P4.V02: Navigate Overview -> Rooms -> Media -> Rooms; Verify: active state always correct.
- TODO P4.V03: Confirm nav does not cover the last content on any view/subview; Verify: bottom-most cards remain accessible.

## Phase 5 - Bugs, Config Editors, V1 Selective Use, And Cutover

### 5.1 - Bug 4: Config Editors (Do Not Assume)
- TODO P5.01: Record HA Core + Frontend versions from Settings -> About; Outcome: known compatibility baseline; Verify: versions are written into this plan under a new DONE snapshot line.
- TODO P5.02: Test `getConfigForm()` support by adding `custom:tunet-nav-card` via UI card picker; Outcome: confirm schema editor works (or not); Verify: either a form appears or it stays YAML-only.
- TODO P5.03: If `getConfigForm()` is unsupported, decide between implementing `getConfigElement()` (at least for nav/weather/climate) vs accepting YAML-only; Outcome: clear direction; Verify: decision is recorded as DONE with rationale.
- TODO P5.04: If implementing `getConfigElement()`, spike on `tunet-nav-card` first (small surface); Outcome: one working visual editor element; Verify: visual editor appears for nav card.

### 5.2 - HA Storage Dashboard Cleanup (Targeted)
- TODO P5.05: Remove `sensor.aqi` from any HA Storage dashboards still containing it; Outcome: no missing entity rows; Verify: storage dashboards YAML search returns zero hits.
- TODO P5.06: Remove any stale `rows:` constraints in Storage dashboards that clip Sections height; Outcome: auto-height works; Verify: no clipping in UI.

### 5.3 - V1 Cards Selective Use (If Needed)
- TODO P5.07: Identify any specific V1 card that is materially better than its V2 counterpart (document which and why); Outcome: justified exception list; Verify: list exists with at least one measurable reason (bug-free, better UX, missing V2 feature).
- TODO P5.08: For each V1 exception, choose collision-safe strategy (rename tag or isolate resources); Outcome: no `customElements.define` collisions; Verify: console clean after loading.
- TODO P5.09: If renaming tags, ensure YAML uses the renamed `custom:` type and that resources load only once; Outcome: stable mixed suite; Verify: no collisions and cards render.

### 5.4 - Cutover Strategy (When POC Is Good)
- TODO P5.10: Decide stable deployment convention: keep `/local/tunet/v2_next/` as stable or promote to `/local/tunet/v2/`; Outcome: a single stable root; Verify: decision recorded.
- TODO P5.11: If promoting, copy v2_next to v2 and repoint resources; Outcome: stable `/local/tunet/v2/` usage; Verify: resources list uses v2 and UI works after cache bust.
- TODO P5.12: Optionally hide legacy dashboards after cutover; Outcome: users land on the right dashboard; Verify: sidebar is decluttered and no broken links.

### Phase 5 Verification Checklist (Click/Observe)
- TODO P5.V01: Add a Tunet card via UI card picker; Verify: config editor behavior matches expectation and is documented.
- TODO P5.V02: Open any legacy dashboard previously affected by AQI; Verify: no missing entity rows remain.
- TODO P5.V03: Confirm cutover resources load and no collisions occur; Verify: console is clean after hard refresh.

## Deployment Runbook (HA-Side Actions, Rollback, Cache Bust)

### Deploy Cards To HA (`v2_next`)
- DONE DEP.01: V2 card JS is deployed to `/config/www/tunet/v2_next/`; Outcome: staging root exists; Verify: direct fetch works.
- TODO DEP.02: Ensure deployed directory includes all `tunet_*.js` and `tunet_base.js`; Outcome: imports succeed; Verify: each file fetch returns 200.
- TODO DEP.03: Ensure Lovelace resources are `type: module` and point at `/local/tunet/v2_next/` (plus Browser Mod resource); Outcome: correct loader; Verify: resource list matches.

### Deploy Dashboard YAML
- DONE DEP.04: `Dashboard/Tunet/tunet-suite-config.yaml` is copied to `/config/dashboards/tunet-suite.yaml`; Outcome: YAML exists on HA; Verify: file present and readable.
- TODO DEP.05: After YAML changes, refresh `/tunet-suite/overview`; Outcome: YAML changes take effect; Verify: UI reflects edits.

### Register Dashboard (One-Time)
- DONE DEP.06: Add `lovelace: dashboards: tunet-suite:` entry in `/config/configuration.yaml`; Outcome: dashboard registered; Verify: Settings -> Dashboards lists it.
- DONE DEP.07: Restart HA after registration; Outcome: registration loaded; Verify: dashboard opens successfully.

### Cache Bust (Repeatable)
- TODO DEP.08: Bump a single `?v=` across all Tunet resources every deploy; Outcome: predictable cache behavior; Verify: DevTools Network shows new query values.
- TODO DEP.09: Use hard refresh + disable cache during development; Outcome: eliminates stale frontend; Verify: resources re-fetch (200).

### Rollback (Fast Path)
- TODO DEP.10: Keep a known-good stable resource root (e.g., `/local/tunet/v2/`) available; Outcome: rollback path exists; Verify: stable resources are still present on HA.
- TODO DEP.11: If v2_next breaks, repoint resources back to stable root and hard refresh; Outcome: broken JS no longer loads; Verify: console errors disappear.
- TODO DEP.12: If `tunet-suite` YAML breaks badly, hide/remove dashboard registration temporarily; Outcome: users are not blocked; Verify: sidebar no longer shows tunet-suite.

## Known Gaps / Honesty List
- TODO GAP.01: Exact HA Core/Frontend versions are not recorded here yet; Outcome: cannot conclude config editor support; Verify: Phase 5 captures versions as DONE.
- TODO GAP.02: Some entity IDs may differ between HA and YAML; Outcome: risk of red error cards; Verify: Phase 0 entity audit completed and YAML updated as needed.
- TODO GAP.03: `v2_next` is active in HA but repo docs may mention `v2`; Outcome: confusion risk; Verify: plan/runbook clearly states active root and rollback.
- TODO GAP.04: Popup styling is optimized for dark glass; Outcome: light mode may need tweaks; Verify: Phase 3 tests both modes.
- TODO GAP.05: Mixing V1 and V2 is risky due to tag collisions; Outcome: may require renames/isolation; Verify: Phase 5 collision-safe strategy executed.

## If Config Editors Still Don't Show (Diagnostics)
- TODO DIAG.01: Confirm there are no `customElements.define` collisions in browser console; Outcome: cards register properly; Verify: console is clean on refresh.
- TODO DIAG.02: Confirm all Tunet resources are loaded as `type: module`; Outcome: module semantics valid; Verify: resource list.
- TODO DIAG.03: Confirm HA Frontend supports `getConfigForm`; Outcome: avoid chasing impossible UI; Verify: version check + HA release notes.
- TODO DIAG.04: In browser console, run `window.customCards?.map(c => c.type)` and confirm `tunet-*` entries exist; Outcome: frontend sees card metadata; Verify: list includes Tunet cards.
- TODO DIAG.05: Try adding `custom:tunet-nav-card` via "Add card"; Outcome: simplest config surface; Verify: form appears (or not) consistently after cache bust.
- TODO DIAG.06: If schema UI never appears, implement a `getConfigElement()` spike for ONE card; Outcome: prove editor pipeline; Verify: visual editor appears for that card.
- TODO DIAG.07: If even `getConfigElement()` does not work, investigate broader frontend issues (failed module loads, CSP, JS errors); Outcome: root cause identified; Verify: underlying errors resolved before continuing.
