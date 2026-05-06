# CD9 — Media Bespoke Pass (Selected-Target Routing + Speaker-Tile Semantics + Dropdown Bug Fixes) Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 64-118 + 211-380. Read-only. For current state see `plan.md` Tranche Queue. NOTE: REOPENED 2026-05-04 — split into CD9a (transport bug, JS-only) and CD9b (popup composition redesign with Bubble Card 3.2-beta.1, requires research spike). See `Dashboard/Tunet/Docs/visual_defect_ledger.md` §10 2026-05-04 entry and `plan.md` Tranche Queue.

**Period**: 2026-04-06 → 2026-04-30
**Status**: Closed 2026-04-30 — REOPENED 2026-05-04 for transport-button no-op + popup composition redesign
**Scope**: Unify three media-control cards (`tunet_media_card.js`, `tunet_sonos_card.js`, `tunet_speaker_grid_card.js`) on a single Sonos-like selected-target routing model; align visible speaker-tile semantics; fix latent dropdown-render bugs; address phone-density fallback for speaker-grid `large 3-col` authoring.

## Synthesis

### What we did
- Replaced the prior "selected-speaker-only" group-volume rule with a Sonos-like selected-target model: individual speaker selection controls that speaker; coordinator/leader selection controls the group proportionally (2026-04-06 audio-target subpass).
- Replaced the bespoke sonos source-selector shell with the media dropdown 1:1, including compact label lane, group badge affordance, and `Group All` / `Ungroup All` actions.
- Landed unified visible speaker-tile semantics across `tunet_sonos_card.js` and `tunet_speaker_grid_card.js`: body tap selects active target, `400ms` hold-then-drag adjusts selected-target volume, icon tap opens more-info, badge toggles group membership; added icon hold as more-info alias 2026-04-06 with double-fire suppression on click after hold.
- Added speaker-grid mobile column fallback so explicit `tile_size: large` collapses to `1` phone column and `compact`/`standard` collapse to at most `2`, while desktop `columns: 3`/`4` still apply above the phone breakpoint.
- Fixed two latent dropdown-render bugs in `tunet_media_card.js` 2026-04-30: removed dead recursive call in `_getGroupedCount()` (line 866-871) that would infinite-loop on empty `_activeGroupMembers()`, and added missing `const groupedCount = this._getGroupedCount();` declaration at top of `_buildSpeakerMenu()` (line 1080-1081) so coordinator-row `speaker_group` icon swap and "{N} grouped" subtitle (lines 1102, 1115) actually evaluate for any 2+ speaker group.
- Recorded keyboard accessibility as suite-wide deferred-by-policy 2026-04-30 (chosen scope option (c)); CD9 acceptance items #1 and #3 became superseded rather than gating closure.

### Why we did it
- Three media-control cards had divergent target-selection, volume-routing, and group-membership semantics; user directed Sonos-like convergence and 1:1 dropdown reuse.
- Coordinator-row icon/subtitle rendering in the media dropdown was silently broken for any 2+ speaker group due to the undeclared `groupedCount` in `_buildSpeakerMenu()`; discovered during line-anchor refresh and shipped because it sits on the visible group-rendering code path.

### Files touched
- `Dashboard/Tunet/Cards/v3/tunet_base.js` — added `compactSpeakerName()` shared helper.
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js` — selected-target volume routing, coordinator-row group iconography, `5s` auto-exit volume view, compact default labels, `_getGroupedCount` recursion fix, `_buildSpeakerMenu` declaration fix.
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js` — dropdown shell parity with media, selected-target volume overlay, compact labels for explicit long names, visible speaker-tile contract, icon hold more-info alias.
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` — visible speaker-tile contract, icon hold more-info alias, mobile grid-column fallback for profiled cards, shadow-lift only (no `transform: translateY`) at lines 238-240.
- `Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` — coverage for compact naming, selected-target routing, auto-exit timing, sonos dropdown parity, explicit-name compaction, visible-tile semantics, icon hold alias, mobile column fallback, dropdown bug-fix regressions (final: 23/23).
- `Dashboard/Tunet/Docs/cards_reference.md` §10 (media), §11 (sonos), §12 (speaker-grid).
- `Dashboard/Tunet/Docs/legacy_key_precedence.md` — YAML-only key documentation.

### Key decisions
- Selected-target volume routing: volume adjusts the currently selected target; grouped coordinator selection becomes proportional group-volume target (2026-04-06 audio-target subpass).
- Aggressive compact default speaker naming accepted (`Living`, `Dining`, `Kitchen`, `Bed`) so long as room identity survives; explicit long names also compact in the displayed label lane.
- Icon hold added as more-info alias rather than separate action; release/click after successful hold suppressed to avoid double-fire (2026-04-06 hold alias subpass).
- Speaker-grid `Large 3-col Explicit` authoring is treated as desktop-facing only — phone density is a card-level column-policy concern, not an authoring constraint.
- Keyboard accessibility recorded as suite-wide deferred-by-policy 2026-04-30 (existing CD3 `bindButtonActivation`, climate thumbs, light-tile keyboard stay; no new a11y work).

### Entry points (for regression hunting)
- Tests: `Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` (23/23 at closure).
- Entities: `media_player.living_room`, `media_player.kitchen`, `media_player.dining_room`, `media_player.bath`, `media_player.bedroom`, `sensor.sonos_active_group_coordinator` (`attributes.grouped_count`).
- Selectors: `.speaker-tile` (visible tiles), `.transport` (transport buttons), `.dd-row` (dropdown row), `--cols-sm` CSS var (mobile column fallback).
- Live-bundle anchor: `_getGroupedCount` body at deployed line 1789, `groupedCount` declaration in `_buildSpeakerMenu` at deployed line 1995 of `?v=build_20260430_161421Z`.

### Deferred work / handoffs
- Sonos explicit long-name authoring pressure on phone widths — recorded in `cards_reference.md` §11 as composition-level/authored-density tradeoff, not runtime defect.
- Speaker-grid phone column fallback live signoff was pending Playwright-MCP availability at 2026-04-30 close (deployed-code only; covered later by live grouped-state verification).

### Superseded by
- 2026-05-04 CD9 reopen split:
  - **CD9a**: media transport buttons (FF/RW track) silent no-op — `_callTransport` wired correctly; investigate `_transportTarget` resolution + Sonos source-specific limits.
  - **CD9b**: media-card popup composition redesign — adopt Bubble Card 3.2-beta.1 Adaptive popup with media-source/group selector; requires Bubble 3.2 research spike before implementation.

### Related claude-mem observations (added 2026-05-04)

- #11067 — groupedCount Latent Bug Confirmed for Prioritized Fix (2026-04-30) — confirmation that the dropdown-render path was silently broken for any 2+ speaker group.
- #11068 — _getGroupedCount Infinite Recursion Bug Fixed in tunet_media_card.js (2026-04-30) — captures the recursion removal at lines 866-871.
- #11069 — _buildSpeakerMenu groupedCount Undeclared Variable Bug Fixed (2026-04-30) — captures the missing declaration fix at lines 1080-1081.
- #11074 — groupedCount Variable Moved to Correct Scope in tunet_media_card.js (2026-04-30) — scope-level placement detail for the declaration fix.
- #11071 — CD9 Media Card Subpass Deployed — 659/659 Tests, Resource ?v=build_20260430_161421Z (2026-04-30) — deploy event for the closure-bundle token referenced in the synthesis.
- #11070 — Keyboard Accessibility Explicitly Dropped as Tunet Card Requirement — Suite-Wide Standing Rule (2026-04-30) — origin of the deferred-by-policy decision affecting CD9 #1/#3.
- #11077 — flickering-herding-wolf.md Updated With Suite-Wide Keyboard Accessibility Out-of-Scope Policy (2026-04-30) — execution-plan governance file synced with the policy.
- #11082 — Commit c646e39: tunet_media_card.js Dropdown Bugs Fixed + Keyboard A11y Policy Recorded (2026-04-30) — single commit anchor combining the bug fixes and the policy lock.
- #11091 — tunet_speaker_grid_card.js: spk-tile:hover Has No translateY — Shadow-Lift Only (2026-04-30) — proves CD9 acceptance #4 (no hover-lift as primary affordance) at lines 238-240.
- #11095 — CD9 Live-Entity Playwright Pass Completed — All 4 Breakpoints, Both Themes, No Failures (2026-04-30) — the live HA verification that closed acceptance #5.
- #11098 — tunet-media-card Speaker Dropdown Internal API and Live Group State Verified (2026-04-30) — coordinator-row icon swap and "{N} grouped" subtitle verified live with real entities.
- #11099 — Sonos unjoin Behavior: Sensor Stale State Gotcha After Dining Room Unjoin (2026-04-30) — operational gotcha discovered during the dining_room/living_room join/unjoin verification path.
- #11100 — Git Push Executed and CD10 Preparation Initiated (2026-04-30) — closure handoff event advancing the active tranche to CD10.

---



## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-30, CD9 closeout — Media Bespoke Pass complete; CD10 next)

Tranche marker: `CD9` is now closed. Active tranche advances to **CD10 — Navigation Verify Pass**. All seven CD9 acceptance criteria are satisfied (items 1 and 3 superseded by §2 standing rule item 9 in `~/.claude/plans/flickering-herding-wolf.md`; item 5 satisfied by today's live grouped-state Playwright verification + ungroup restoration). The sonos explicit long-name composition pressure is preserved as authored-density tradeoff, not a runtime defect — does not block closure.

- `CD9 ACCEPTANCE — VERIFIED CLOSED`
  - #1 ~~no primary media control remains keyboard-incomplete~~ → superseded (suite-wide a11y policy 2026-04-30)
  - #2 media album-art + volume-track semantics explicit and documented in `cards_reference.md` §10
  - #3 ~~sonos source/grouping keyboard-reachable~~ → superseded
  - #4 speaker-grid no longer relies on hover-lift as primary affordance — `tunet_speaker_grid_card.js:238-240` uses shadow-lift only, no `transform: translateY`
  - #5 live HA validation with real entities — confirmed today: joined `media_player.dining_room` to `media_player.living_room` group, opened the media-card dropdown via Playwright MCP, observed coordinator row rendered `icon=speaker_group` + `sub="2 grouped"` (the bug-fix payoff path), then unjoined and verified `sensor.sonos_active_group_coordinator.attributes.grouped_count` returned to `1` (session-start baseline). Apr 6 rehab-lab screenshot evidence covers the broader card surface at all 4 locked breakpoints in light + dark mode (`/tmp/tunet-playwright-review/2026-04-30T17-58-23-563Z/review-manifest.json` re-captures CD9 cards on the post-fix bundle).
  - #6 all three cards retain `editor-lite` policy; YAML-only keys documented in `legacy_key_precedence.md` and `cards_reference.md`
  - #7 `cards_reference.md` entries §10 (media), §11 (sonos), §12 (speaker-grid) complete
- `LIVE BUNDLE TOKEN`
  - `?v=build_20260430_161421Z` — confirmed deployed; both bug fixes present at deployed lines 1789 and 1995 of the minified output
- `OPEN BACKLOG (does not block CD9 closure)`
  - sonos explicit long-name authoring pressure on phone widths — recorded in `cards_reference.md` §11 as composition-level not runtime defect; treat as authored-density tradeoff
- `NEXT TRANCHE — CD10 NAVIGATION VERIFY PASS`
  - scope per `flickering-herding-wolf.md:1227`: verify `tunet_nav_card.js` active-route highlighting across overview/rooms/media/room-subviews; verify state survives navigation + browser back/forward; verify safe-area + footer placement on supported surfaces; confirm no global style/offset leakage outside Tunet; verify `getConfigForm()` in HA editor flow; complete `cards_reference.md` entry
  - rule: no new code is added unless a real failure is reproduced (CD10 is verify-only by design)
  - file scope: `Dashboard/Tunet/Cards/v3/tunet_nav_card.js` and `Dashboard/Tunet/tunet-card-rehab-lab.yaml` only

## Session Delta (2026-04-30, CD9 subpass — Media Card Dropdown Bug Fixes + Keyboard A11y Policy)

Tranche marker: `CD9` remains active. This subpass landed two latent bug fixes in `tunet_media_card.js` and recorded a new suite-wide standing rule: **keyboard accessibility is not a Tunet card requirement** (chosen by the user explicitly, scope option (c) suite-wide). The CD9 §Required-work escape clause for the volume-slider/group-toggle accessibility items now applies as deferred-by-policy, not omitted.

- `AUTHORITY NOTE`
  - chosen interpretation:
    - drop volume-slider keyboard semantics (CD3-deferred item) and group-toggle keyboard accessibility from CD9 acceptance scope
    - record this as a standing suite-wide rule going forward; existing CD3 `bindButtonActivation` adoption and already-shipped accessibility (climate thumbs, light-tile keyboard) stay in place — no churn
    - ship the two latent bug fixes discovered during line-anchor refresh, since they sit on the dropdown-render code path and would have silently affected any 2+ speaker group
- `IMPLEMENTATION`
  - `tunet_media_card.js`
    - `_getGroupedCount()` (line 866-871): removed the dead recursive call `const groupedCount = this._getGroupedCount();` that would infinite-loop when `_activeGroupMembers()` returned empty
    - `_buildSpeakerMenu()` (line 1080-1081): added `const groupedCount = this._getGroupedCount();` declaration at the top of the method so the coordinator-row `speaker_group` icon swap and "{N} grouped" subtitle (lines 1102 and 1115) actually evaluate correctly. Previously `groupedCount` was undeclared in scope, so `undefined > 1` was always false and the rendering silently failed for any 2+ speaker group.
  - `audio_cd9_bespoke.test.js`
    - 4 new regression tests:
      1. `_getGroupedCount` returns active member count from sensor without recursing
      2. `_getGroupedCount` falls back to speakers filter when sensor reports no members (would infinite-loop before fix)
      3. `_buildSpeakerMenu` shows `speaker_group` icon on coordinator row when groupedCount > 1
      4. `_buildSpeakerMenu` shows "{N} grouped" subtitle on coordinator row when grouped
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` passed
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` → `23/23` (was 19, +4 new)
  - full `npm test` → `659/659`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260430_161421Z`
  - Live bundle verification via authenticated `curl /local/tunet/v3/tunet_media_card.js`: `_getGroupedCount` body confirmed at deployed line 1789, `const groupedCount = this._getGroupedCount();` declaration in `_buildSpeakerMenu` confirmed at deployed line 1995
  - Browser screenshot smoke skipped — Playwright MCP session was locked by another process; live verification done via direct HTTP fetch instead. Speaker-grid phone column fallback (item C from earlier review) live signoff still pending whenever browser frees up.
- `RESULT`
  - `tunet-media-card` dropdown rendering is now correct for any group-size scenario
  - the latent recursion bug is closed (was dormant in normal operation but would lock up the dropdown if the active-group sensor ever briefly reported empty members)
  - CD9 acceptance criterion #1 ("no primary media control remains keyboard-incomplete") becomes a deferred-by-policy item rather than a closure gate; the active execution plan should reflect this when next opened
  - remaining CD9 work: speaker-grid phone-column-fallback live signoff (already-deployed code) + sonos explicit long-name composition pressure (low priority)


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
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - full `npm test`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab`
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
      - icon tap opens more-info
      - badge toggles group membership
    - tiles now expose explicit `selected` and grouped states, and visible tile drag inherits the selected-target/group-volume routing model
  - `tunet_speaker_grid_card.js`
    - removed the old tap-toggle-group / hold-more-info behavior
    - body tap now selects active target
    - hold `400ms` then drag adjusts selected-target volume
    - icon tap opens more-info
    - badge toggles group membership
    - `createAxisLockedDrag()` path is no longer the active interaction model for visible speaker tiles
  - `audio_cd9_bespoke.test.js`
    - new coverage for sonos and speaker-grid visible-tile semantics:
      - tap selects active target
      - badge toggles group membership
      - icon opens more-info
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

