# Tunet Suite Fix Ledger

Working branch: `tunet/inbox-integration`
Last updated: 2026-04-30
Scope: `/home/mac/HA/implementation_10`

> **Out-of-spec side task — SA-series (recorded 2026-04-30):** SA0–SA4 + the alarm UX fixes (All On/All Off context-aware toggle, optimistic UI flip, Tunet-styled BrowserMod edit popup, parallel + verify-and-retry scripts) were deployed live but were completed **outside the active CD program**. Root Tunet authority remains CD9 — the SA-series did not consume any CD-tranche slot. It was a one-off concession for an immediate user need (live alarm UX defects) and is not a precedent for further out-of-tranche work.

Active execution plans:
- `~/.claude/plans/flickering-herding-wolf.md` (root CD0–CD12 authority; current CD is CD9)
- `~/.claude/plans/tunet-sonos-alarm-manage.md` (SA-series, sibling to CD12 surface assembly; out-of-spec, complete + deployed 2026-04-30)

## Session Delta (2026-04-30, CD9 subpass — Media Card Dropdown Bug Fixes + Keyboard A11y Policy)

Change marker: `CD9` remains active. Two latent bug fixes in `tunet_media_card.js` landed this session, plus a new suite-wide standing rule recorded: keyboard accessibility is not a Tunet card requirement (chosen by user, scope option (c)). The two open CD9 items that depended on accessibility (volume-slider keyboard semantics + group-toggle keyboard) are now deferred-by-policy, applying the CD9 §Required-work escape clause "if deferred, record that deferral as a tranche decision, not an omission."

- `CHOSEN INTERPRETATION`
  - keyboard accessibility is not a Tunet card requirement going forward (suite-wide standing rule, 2026-04-30)
  - existing already-shipped accessibility (CD3's `bindButtonActivation` adoption, climate thumbs at `tunet_climate_card.js:648,653`, light-tile keyboard at `tunet_light_tile.js:809-838`, `bindButtonActivation` helper export from `tunet_base.js`) is left in place — removing it would be churn for no value
  - the two latent bug fixes are shipped because they sit on the same dropdown-render code path and would silently break the coordinator-row icon swap and "{N} grouped" subtitle for any 2+ speaker group
- `BUG 1 — Infinite recursion in _getGroupedCount`
  - `Dashboard/Tunet/Cards/v3/tunet_media_card.js:870` carried a dead `const groupedCount = this._getGroupedCount();` call inside `_getGroupedCount()` itself. The early return at `:868` (`if (members.length > 0) return members.length;`) wins on every Sonos-with-active-group-sensor setup in normal operation, so the recursion was latent — but it would lock up the dropdown render path the first time `sensor.sonos_active_group_coordinator.attributes.group_members` reported empty (e.g., during integration reload, entity unavailability, or test fixtures).
  - Fix: removed the dead recursive call; method now correctly falls through to `speakers.filter(...).length` when the sensor is empty.
- `BUG 2 — Undeclared groupedCount in _buildSpeakerMenu`
  - `_buildSpeakerMenu()` referenced `groupedCount` at lines `:1102` and `:1115` without ever declaring it in the method's scope, so `undefined > 1` was always false and the coordinator-row `speaker_group` icon swap and "{N} grouped" subtitle never rendered, regardless of how many speakers were actually grouped.
  - Fix: added `const groupedCount = this._getGroupedCount();` once at the top of the method, after `const speakers = this._cachedSpeakers || [];`. Both downstream conditions now evaluate against the actual group size.
- `TESTS / VALIDATION`
  - 4 new regression tests appended to `Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`:
    - `_getGroupedCount` returns active member count from sensor without recursing
    - `_getGroupedCount` falls back to speakers filter when sensor reports no members (would infinite-loop before fix)
    - `_buildSpeakerMenu` shows `speaker_group` icon on coordinator row when groupedCount > 1
    - `_buildSpeakerMenu` shows "{N} grouped" subtitle on coordinator row
  - `node --check` passed on both edited files
  - `audio_cd9_bespoke.test.js`: `23/23` passed (was 19, +4 new)
  - full suite: `659/659` passed
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260430_161421Z`
  - Authenticated bundle fetch confirms both fixes in the deployed JS: `_getGroupedCount` body at deployed line 1789 has no recursive call; `const groupedCount = this._getGroupedCount();` declaration in `_buildSpeakerMenu` confirmed at deployed line 1995
  - Playwright browser session was locked by another process this session; live UI signoff via screenshot is deferred. The speaker-grid phone column fallback (item C from earlier) signoff is bundled into that follow-up.
- `RESULT`
  - `tunet-media-card` dropdown rendering is now correct for any group-size scenario
  - the latent recursion bug is closed (no current live trigger, but the fix is correct and removes the risk surface)
  - CD9 acceptance criterion #1 ("no primary media control remains keyboard-incomplete") is recorded as deferred-by-policy in `cards_reference.md` §10 and `visual_defect_ledger.md`; the active execution plan at `~/.claude/plans/flickering-herding-wolf.md` should be updated to reflect this when next opened
  - remaining CD9 work: speaker-grid phone-column-fallback live signoff (already-deployed code) + sonos explicit long-name composition pressure (low priority)

## Session Delta (2026-04-30, SA-series live + alarm UX fixes — out-of-spec)

Change marker: SA0–SA4 deployed live to HA on 2026-04-28; iterative UX defect fixes applied across 2026-04-28 → 2026-04-30 (All On/All Off context-aware toggle, optimistic UI flip on click, Tunet-styled inlined BrowserMod edit popup with reactive `tile` cards, parallel + verify-and-retry scripts replacing buggy `target.entity_id: [list]` bulk calls). All SA-series work was completed **outside the active CD program** — root Tunet authority remained on **CD9 — Media Bespoke Pass** the entire time.

- `OUT-OF-SPEC SCOPE`
  - SA-series was originally planned as a sibling-to-CD12 workstream; in practice it was executed as an isolated side task on the user's immediate request, not as a sanctioned CD program advancement.
  - This is recorded explicitly so future sessions understand: no CD tranche advanced; the Tunet program is exactly where it was at CD9 closure on 2026-04-06.
  - Files touched outside normal CD9 scope: `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` (new card), `Dashboard/Tunet/Cards/v3/tests/alarm_bespoke.test.js` (new tests), `packages/sonos_package.yaml` (script bodies + automation triggers), `Dashboard/Tunet/tunet-card-rehab-lab.yaml` (section 14 + popup-card section), `Dashboard/Tunet/AGENTS.md` (§3 alarm-edit exception), `build.mjs` + `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs` (registry add), `Dashboard/Tunet/scripts/tunet_playwright_review.mjs` (alarm card aware), `Dashboard/Tunet/scripts/tunet_alarm_interaction_probe.mjs` (new probe), `.env` symlink in worktree.
- `KEY DEFECT FIXES (live-validated)`
  - Bulk `target.entity_id: [list]` was silently dropping per-speaker calls; replaced with parallel `sonos.update_alarm` per alarm_id + `repeat: count: 2` verify-and-retry that re-fires drops.
  - `switch.turn_off` had an optimistic-state revert race when called rapidly; switched to `sonos.update_alarm` with explicit `enabled` field.
  - "Snooze" chip moved to conditional-on-`sensor.sonos_alarm_playing`.
  - Single "All On / All Off" toggle is context-aware (reads `sensor.sonos_enabled_alarm_count`).
  - BrowserMod popup migrated from `popup_card_id` registration (Sections grid was filtering it out) to inline content via `browser_mod.popup` `content:` field; popup uses Tunet-actions chips + `tile` cards (entity-bound, reactive in popup).
  - Card has optimistic UI: `_optimisticAllFlip` override flips button label in <50ms, expires after 8s or when live count matches predicted state.
- `RESULT`
  - All four canonical alarms (`switch.sonos_alarm_{bedroom,bath,bedroom_weekend,bath_weekend}`) toggle reliably in both directions from the dashboard.
  - Final live state at end of 2026-04-30 session: `bedroom=on`, `bath=off`, `bedroom_weekend=off`, `bath_weekend=off`, `enabled_count=1`.
  - Next Tunet session resumes CD9 per `~/.claude/plans/flickering-herding-wolf.md` — SA-series is parked.

## Session Delta (2026-04-23, SA2 + SA3 + SA4 closure — full SA-series repo-complete)

Change marker: After SA0 closed (backend hygiene + governance), the same session executed SA2 (alarm list card), SA3 (BrowserMod edit popup + script migration), and SA4 (subview + chip + legacy retirement) back-to-back per explicit user direction "do not stop until done and tested."

- `SA2 — Tunet Alarm List Card`
  - New `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` (~580 lines, v1.0.0) + 11-test bespoke suite (`alarm_bespoke.test.js`). Full tree passes 639 tests.
  - Consumes `TOKENS` CSS string; uses `--_tunet-tile-*` with fallbacks; does NOT opt into the superseded profile resolver.
  - `build.mjs` + `update_tunet_v3_resources.mjs` updated to include the new card.
  - Rehab-lab §14 harness added with 3 variants.
  - `cards_reference.md` §14 + Whole-Home Usage Contract row added.
  - `sections_layout_matrix.md` alarm row added: `12 | 6 | auto | 2 | 12 | No`.
- `SA3 — BrowserMod Alarm Edit Popup`
  - New `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` as canonical template.
  - Popup `popup_card_id: tunet-alarm-edit` registered in BOTH dashboards (storage + yaml).
  - `script.sonos_load_alarm_for_edit`: `browser_mod.navigate('#edit-alarm')` → `browser_mod.popup`.
  - `script.sonos_save_alarm_changes`: `browser_mod.navigate('#sonos-alarms')` → `browser_mod.close_popup`.
  - No bespoke Tunet popup card built — stock `custom:popup-card` wrapper + vanilla HA cards inside.
- `SA4 — Subview + Chip + Legacy Retirement`
  - `/alarms` subview added to both dashboards with alarm card hero + sensor support tiles + nightly-check context note.
  - Next-alarm chip added to both dashboards' overview (standalone `tile`, NOT bolted into G3S/CD11-locked status card).
  - 4 legacy Bubble Card popup YAMLs deleted: `Dashboard/cards/sonos_alarms_popup.yaml`, `Dashboard/cards/sonos_alarm_edit_popup.yaml`, `Dashboard/sonos_alarm_edit_popup.yaml`, `Dashboard/sonos_alarm_popup.yaml`.
  - Final grep: zero live references to `#sonos-alarms` / `#edit-alarm` hashes remain.
- `DEPLOY STATUS`
  - All YAML passes `yaml.safe_load`; all 639 tests pass; card builds successfully (48 KB bundle).
  - **Live deploy remains pending** — the session sandbox blocked SSH to 10.0.0.21 with embedded credentials. The user needs to run the deploy commands interactively via `!` prefix (`!npm run tunet:deploy:lab` for the card; package deploy via the ha-package-deployer workflow in `.claude/agents/ha-package-deployer.md`).
  - D1 regression-verify via MCP passed earlier in this session: `script.sonos_adjust_edit_time(minutes=5)` advanced `input_datetime.sonos_alarm_edit_time` from `05:30:00` to `05:35:00`.
- `RESULT`
  - Repo is SA-series complete and test-green.
  - Once the user runs the deploy commands, live verification per each tranche's `Live verification` section closes the loop.

## Session Delta (2026-04-23, SA0 closure — Sonos Alarm Backend Hygiene + Governance)

Change marker: after an adversarial review of `~/.claude/plans/tunet-sonos-alarm-manage.md` + live HA MCP audit, SA0 was executed to clear alarm-backend technical debt before SA2/SA3/SA4.

- `CHOSEN INTERPRETATION`
  - LD1 revised: canonical HA-renamed entities (`switch.sonos_alarm_{bedroom,bath,bedroom_weekend,bath_weekend}`) are the first-class alarms — not numeric IDs. Verified live via MCP 2026-04-23.
  - D1 (adjust_edit_time missing from runtime) was already resolved pre-SA0 (regression-verified: 05:30 → 05:35 on trigger).
  - D3 rewrite scope: quick-action scripts move from numeric IDs (182, 1381, 42) to canonical entities. The `switch.sonos_alarm_42` literal was a dead reference (entity renamed to `_bedroom`).
  - D2 + D8: phantom triggers (`kitchen`, `living_room`, `office`) trimmed from `sonos_alarm_trigger_update`; weekend-variant triggers added.
  - D4: dead `sensor.sonos_alarm_{kitchen,living_room}_display` template sensors removed.
  - AGENTS.md §3 exception added (alarm-edit popup opens via `browser_mod.popup` service call from script, not `fire-dom-event`) — rationale: edit buffer must populate before popup renders.
- `FILES CHANGED`
  - `packages/sonos_package.yaml` (lines 746-762 sensor deletion, 2353-2387 script rewrite, 2734-2741 trigger cleanup)
  - `Dashboard/Tunet/AGENTS.md` (§3 alarm-edit-popup exception bullet)
  - `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` (SA-series migration note)
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` (CD12 alarm entry: status moved from "backlog" to "SA-series active, SA0 closed")
  - `Dashboard/Tunet/Docs/sonos_alarm_popup_reference.md` (target-architecture section added; legacy marked historical)
- `RESULT`
  - Blocker for SA2 is clear: backend is hygienic, governance is synced, AGENTS.md exception is on record.
  - Legacy Bubble Card popup YAMLs untouched (retirement at SA4 per plan).
  - `HA PACKAGE RELOAD` (automation + script + template) required to apply sonos_package.yaml edits to live HA.

## Session Delta (2026-04-06, TI2 activation — Branch-Local Inbox UI Exception)

Change marker: the user explicitly re-opened Tunet inbox UI work in this worktree after the backend-first resequencing completed

- `CHOSEN INTERPRETATION`
  - do not replace the root Tunet program with an inbox tranche
  - chosen implementation:
    - keep the root program on `CD9`
    - activate `TI2` only as a narrow branch-local exception for the governed inbox card/surface files
    - require both Tunet root docs and inbox governance docs to stay synchronized during TI2
- `RESULT`
  - `Dashboard/Tunet/**` work is now allowed again in this branch, but only inside the `TI2` file boundary
  - no broader Tunet tranche resequencing is implied by this activation

## Session Delta (2026-04-06, Inbox backend closure — root Tunet docs unchanged)

Change marker: the inbox backend work is now closed through non-Tunet tranches, but the root Tunet program remains on `CD9`

- `CHOSEN INTERPRETATION`
  - the inbox backend is now prod-ready without any `Dashboard/Tunet/**` implementation having started in this branch
  - chosen implementation:
    - keep the root Tunet docs on normal `CD9`
    - do not promote a branch-local Tunet tranche
    - treat any later inbox UI work as a new control point
- `RESULT`
  - root Tunet governance stays stable
  - no one should infer that Tunet inbox UI work is active from this branch state

## Session Delta (2026-04-06, TI2 deferral — Inbox Backend-First Resequencing)

Change marker: user re-sequenced the inbox work away from Tunet implementation and back into backend productization

- `CHOSEN INTERPRETATION`
  - no `Dashboard/Tunet/**` files had been changed yet
  - because the next requirement is “finalize the integration first,” the prior TI2 activation should not remain live
  - chosen implementation:
    - restore the root Tunet docs to their normal `CD9` state
    - insert a backend-only inbox tranche instead of continuing into frontend work
- `RESULT`
  - there is no branch-local Tunet implementation tranche active now
  - future Tunet edits must wait until the backend productization tranche closes

## Session Delta (2026-04-06, CD9 subpass — Speaker-Grid Phone Column Fallback)

Change marker: narrow speaker-grid mobile-density fix; `CD9` remains active pending screenshot signoff and the remaining media semantics/accessibility tail

- `CHOSEN INTERPRETATION`
  - the rehab `Large 3-col Explicit` speaker-grid variant is a card-level mobile column-policy defect, not a reason to preserve explicit `3` columns on phone
  - apply the phone fallback in-card even when `use_profiles: true`
- `IMPLEMENTATION`
  - `tunet_speaker_grid_card.js`
    - mobile `@media (max-width: 440px)` grid-column fallback now applies to all speaker-grid variants
    - `tile_size: large` collapses to `1` visible phone column
    - `tile_size: compact` / `standard` collapse to at most `2` visible phone columns
  - `audio_cd9_bespoke.test.js`
    - added CSS/runtime coverage for the mobile fallback column policy
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `audio_cd9_bespoke.test.js`: `17/17`
  - full suite: `617/617`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260406_041426Z`
  - post-fallback screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T04-14-35-066Z/review-manifest.json`
- `RESULT`
  - the explicit `large 3-col` fixture no longer forces a 3-column phone layout in the card runtime
  - keep `CD9` open until the refreshed screenshot set is signed off and the remaining media semantics/accessibility work is addressed

## Session Delta (2026-04-06, CD9 subpass — Visible Speaker-Tile Semantics)

Change marker: sonos/speaker-grid visible speaker-tile semantics landed; `CD9` remains active on media semantics/accessibility and speaker-grid dense/default

- `CHOSEN INTERPRETATION`
  - keep the revised selected-target/group-volume policy as authoritative
  - remove the stale “selected speaker specifically” wording from the interaction contract rather than reopening the audio-target decision
  - treat sonos and speaker-grid visible tiles as the primary scope of this subpass; media remains a separate semantics/accessibility tail
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - body tap now selects the active target
    - hold `400ms` then drag adjusts selected-target volume
    - icon tap opens more-info
    - badge toggles group membership
    - visible tiles now surface explicit selected/grouped states
  - `tunet_speaker_grid_card.js`
    - removed the old tap-toggle-group / hold-more-info path
    - visible tiles now follow the same speaker-tile contract as sonos
    - old `createAxisLockedDrag()`-driven tile semantics are no longer the active runtime model
  - `audio_cd9_bespoke.test.js`
    - added coverage for sonos/speaker-grid visible-tile tap, badge, icon, and hold-drag behavior
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `audio_cd9_bespoke.test.js`: `15/15`
  - full suite: `615/615`
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260406_035732Z`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T03-57-42-318Z/review-manifest.json`
- `RESULT`
  - sonos and speaker-grid visible speaker tiles now align with the suite contract
  - remaining `CD9` runtime backlog narrows to media semantics/accessibility and speaker-grid dense/default layout pressure

## Session Delta (2026-04-06, CD9 subpass — Speaker Icon Hold Alias)

Change marker: speaker-tile semantics refined; `CD9` remains active

- `CHOSEN INTERPRETATION`
  - keep the current speaker-tile interaction model intact
  - add icon hold as a direct alias for default more-info so source selection remains available from the icon without inventing a second action
  - suppress duplicate more-info dispatch when a completed hold is followed by the synthetic click/release path
- `IMPLEMENTATION`
  - `tunet_sonos_card.js`
    - speaker icon now opens more-info on tap or hold
    - long-press release/click no longer double-fires more-info
  - `tunet_speaker_grid_card.js`
    - speaker icon now opens more-info on tap or hold
    - long-press release/click no longer double-fires more-info
  - `audio_cd9_bespoke.test.js`
    - added explicit long-press coverage for sonos and speaker-grid icon behavior
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js`
  - `audio_cd9_bespoke.test.js`
  - full `npm test`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab`
- `RESULT`
  - speaker icon more-info is now reachable by tap or hold in both sonos and speaker-grid
  - remaining `CD9` runtime backlog is unchanged: media semantics/accessibility and speaker-grid density signoff

## Session Delta (2026-04-06, CD8 follow-up polish — Auto/Auto UV)

Change marker: weather post-closeout polish only; `CD9` remains active

- `CHOSEN INTERPRETATION`
  - user wanted the existing rehab `Auto / Auto` card to surface the UV cue without abandoning auto mode
  - accepted direction:
    - keep precip-driven auto behavior unchanged
    - when both `forecast_view` and `forecast_metric` are `auto`, precip is not likely, and the hourly forecast exposes UV, prefer hourly + temperature so the default auto card can show the UV badge
- `IMPLEMENTATION`
  - `tunet_weather_card.js`
    - bumped to `v1.6.3`
    - forecast arrival now re-runs auto-mode resolution so the hydrated forecast can change the live auto card from its initial dry daily/temp state
  - `weather_bespoke.test.js`
    - added coverage for dry `auto/auto` hourly+temperature preference and the post-hydration recompute path
  - `cards_reference.md` / `visual_defect_ledger.md`
    - accepted weather contract now explicitly includes the dry `auto/auto` hourly-temp UV behavior
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `weather_bespoke.test.js`: `10/10`
  - full suite: `599/599`
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260406_023753Z`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/review-manifest.json`
  - key evidence:
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
- `RESULT`
  - the main rehab `Auto / Auto` weather sample now surfaces the UV badge in its dry auto path
  - `CD8` remains closed; no tranche rollback

## Session Delta (2026-04-06, CD7 closeout — Rooms Bespoke Pass)

Change marker: card-level closeout only; room-page layout remains intentionally undecided

- `CHOSEN INTERPRETATION`
  - close `CD7` on the YAML rehab dashboard evidence only
  - do not treat storage/room-page composition as part of the card-level closure gate
  - accepted rooms interaction contract remains:
    - tile tap = toggle
    - `tap_action` override when configured
    - hold = navigate / popup fallback
    - row/slim body tap = navigate with nested controls owning toggles
- `VALIDATION`
  - YAML rehab screenshot evidence at locked breakpoints:
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
  - row-mode phone density, row/slim control isolation, icon/control size parity, plain-percent status text, and slim/desktop readability now hold on the YAML rehab dashboard
  - `CD7` is closed for the rooms card itself
  - room-page/storage layout is explicitly not decided by this closure and remains future surface-composition work
  - this was a governance evidence pass only; no new runtime code changed and no build/test rerun happened in the closeout step

## Session Delta (2026-04-06, CD8 closeout — Weather Phone-Density Redesign)

Change marker: weather runtime/design accepted; `CD8` closed and control returns to `CD9`

- `CHOSEN INTERPRETATION`
  - use the YAML rehab dashboard as the only closure gate for weather
  - climate and sensor remain in their narrowed healthy buckets; no new card-local runtime work was needed there
  - repair the screenshot harness font race before trusting phone weather captures
- `IMPLEMENTATION`
  - `tunet_weather_card.js`
    - `show_pressure` is editor-visible and defaults to `false`
    - hourly temperature forecast tiles now render a compact UV badge in the top-right when forecast data provides UV
  - `tunet_playwright_review.mjs`
    - waits for `document.fonts.ready` (bounded) before capture to avoid raw Material Symbols ligature text on phone screenshots
  - `tunet-card-rehab-lab.yaml`
    - weather fixture `Short daily` replaced with `Hourly temp + UV`
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
  - `node --check Dashboard/Tunet/scripts/tunet_playwright_review.mjs`
  - YAML parse-check passed for `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `weather_bespoke.test.js`: `7/7` passed
  - full suite: `597/597` passed across 13 suites
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260406_022606Z`
  - rehab YAML re-SCP'd to `/config/dashboards/tunet-card-rehab-lab.yaml`
  - screenshot manifest:
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/review-manifest.json`
  - key evidence:
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/390x844/light/rehab/lab/cards/tunet-weather-card__05.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/1440x900/light/rehab/lab/cards/tunet-weather-card__05.png`
- `RESULT`
  - inline flip-chips, single-line detail summary, and pressure-default-off now hold as the accepted weather phone-density contract
  - hourly temp tiles support the requested UV cue
  - `CD8` is closed; next active tranche is `CD9`

## Session Delta (2026-04-05, CD8 screenshot review — governance only)

Change marker: evidence pass only; no runtime edits and no tranche advance

- `CHOSEN INTERPRETATION`
  - the user had treated `CD8` as closed, but the authenticated rehab screenshot pass does not support a broad closeout
  - resolved by keeping `CD8` open on weather only while leaving climate and sensor in their previously narrowed buckets
- `VALIDATION`
  - screenshot run:
    - `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --cd CD8 --breakpoint 390x844,768x1024,1024x1366,1440x900 --theme light`
  - manifest:
    - `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/review-manifest.json`
  - key evidence:
    - weather phone lab: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/lab/cards/tunet-weather-card__01.png`
    - weather phone stress: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/phone-stress/cards/tunet-weather-card__01.png`
    - weather surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-weather-card__01.png`
    - climate surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-climate-card__01.png`
    - sensor surfaces phone: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/390x844/light/rehab/surfaces/cards/tunet-sensor-card__01.png`
- `RESULT`
  - weather still fails the written `CD8` phone-density target:
    - toggles are still separate rows below the header
    - detail content is still vertically stacked instead of single-line
    - pressure appears removed, but the redesign is not complete
  - climate still reads as a composition constraint, not a new card-local defect
  - sensor remains visually healthy; only the naming-contract/doc-clarity item remains
  - no code changes were made in this step, so no syntax/build/test commands were rerun

## Session Delta (2026-04-05, CD6 post-close refinement — Lighting Progress Inset)

Change marker: user-directed narrow lighting-family polish after parity closure; no tranche reopen

- `CHOSEN INTERPRETATION`
  - treat the slider edge-clearance request as a narrow lighting-family token refinement, not a renewed geometry-parity pass
- `IMPLEMENTATION`
  - added `lightingProgressInset` to the shared `lighting-tile` family in `tunet_base.js`
  - `tunet_lighting_card.js` now uses `--_tunet-lighting-progress-inset` for the bottom bar left/right inset
  - `tunet_light_tile.js` vertical tiles now use the same shared inset token
  - non-profile compact fallback inset widened from `10px` to `12px`
- `TESTS / VALIDATION`
  - `node --check` passed on `tunet_base.js`, `tunet_lighting_card.js`, and `tunet_light_tile.js`
  - `lighting_bespoke.test.js`: `30/30` passed
  - full suite: `590/590` passed across 12 suites
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260405_215937Z`
  - focused rehab screenshot evidence:
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-59-45-582Z/390x844/light/rehab/lab/cards/tunet-light-tile__01.png`
- `RESULT`
  - bottom slider edge clearance is improved across the shared lighting family
  - no broader lighting-family geometry contract changed
  - user then requested a stronger inset; current live resource token is `?v=build_20260405_220402Z`

## Session Delta (2026-04-05, CD6 follow-on — Lighting Geometry Parity)

Change marker: user-directed reopen of the logged CD6 lighting follow-on; closed after parity signoff, then handed back to CD7

- `AUTHORITY NOTE`
  - active plan sequence still places CD7 next
  - user explicitly redirected implementation back to the previously logged lighting follow-on
  - chosen interpretation: do not claim CD7 closed; switch the active work to the lighting follow-on
- `LIGHTING TARGET`
  - make desktop non-scroll lighting variants match the scroll reference on tile width, tile height/aspect balance, and spacing between tiles
  - make the internal lighting-tile stack (`icon -> name -> value -> brightness bar`) read the same across scroll, grid, section, and atomic tiles
  - scroll behavior remains separately broken and is not being treated as solved by this pass
  - prior “column gap too tight” wording was incomplete; the real defect is full tile geometry parity versus scroll
  - drift source traced to doc/runtime mismatch:
    - design-language family map still treated lighting as generic `tile-grid`
    - cards_reference already treated lighting as its own family
    - runtime used card-local lighting-card geometry to compensate
  - chosen direction: dedicated shared `lighting-tile` family in `tunet_base.js`; container mechanics remain card-local in `tunet-lighting-card`
- `IMPLEMENTATION`
  - `tunet_base.js` now owns the shared lighting-tile profile family and the size-tier geometry that was previously drifting between cards
  - `tunet_lighting_card.js` now consumes shared lighting-family tokens for internal tile rhythm and desktop non-scroll geometry while keeping container mechanics local
  - `tunet_light_tile.js` now consumes the same vertical stack tokens so atomic tiles and card tiles converge
  - `expand_groups` member tiles now compact auto-derived display names in-card by trimming redundant room context and trailing lighting nouns; explicit `zones[].name` overrides still win
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `lighting_bespoke.test.js`: `29/29` passed
  - full suite: `589/589` passed across 12 suites
  - deploy passed and synced live resources to `?v=build_20260405_214802Z`
  - rehab screenshots now satisfy the formal lighting-family acceptance contract at phone and desktop:
    - `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-48-10-378Z/390x844/light/rehab/lab/cards/tunet-lighting-card__03.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__02.png`
    - `/tmp/tunet-playwright-review/2026-04-05T21-46-49-213Z/1440x900/light/rehab/lab/cards/tunet-lighting-card__03.png`
- `CLOSED`
  - lighting tile-family parity is now closed as a CD6 follow-on
  - auto-derived `expand_groups` member labels compact in-card; explicit `zones[].name` overrides remain authoritative
- `SEPARATE NON-BLOCKING NOTE`
  - scroll transport/centering still has a low-priority behavior quirk when tile count is too small to scroll; that is not part of the parity closure gate

## Session Delta (2026-04-05, CD7 — Rooms Bespoke Pass Recovery)

Change marker: CD7 reopened; prior closeout claims withdrawn pending validation

- `ROOMS CARD`
  - removed the speculative orb-overflow badge approach
  - phone row density now relies on smaller same-size orb/power controls plus tighter row spacing
  - row control isolation is enforced for both pointer and keyboard interaction via `control-press-active` class
  - common invalid room-icon aliases like `sofa` / `couch` now normalize to `weekend` so row/slim cards do not show raw ligature text in live captures
  - desktop/base row typography and slim desktop typography were lifted for readability
  - row status now shows plain percent values instead of `% bri`
  - row lead icon now uses the same size family as the orb/power controls
  - row orb/power controls now expose hover titles from room/light labels
  - tile short tap toggles room lights (on/off); `tap_action` override when configured; hold navigates
  - cards_reference.md interaction contract updated: tile tap = toggle, hold = navigate
- `REHAB HARNESS`
  - removed speculative overflow-specific fixtures; retained the existing authoritative rooms repro surfaces
- `TESTS`
  - `rooms_bespoke.test.js` covers phone row density, control isolation, icon alias normalization, tile tap precedence, adaptive-lighting reset
  - full suite: `576/576` passing across 12 suites
- `DOCS`
  - cards_reference.md tile interaction contract updated: tile tap = toggle lights, hold = navigate/popup
  - cards_reference.md §7 CD8 weather target contract written: single-line details (icon-only, pressure dropped), flip-chip toggles, ~120px vertical savings
  - visual_defect_ledger.md reflects active CD7 work + CD8 weather target contract reference
  - governance docs now also record a newly investigated `CD6` follow-on: lighting desktop/full-width column gap too tight at `1440x900`; root cause is shared `PROFILE_BASE.standard.tileGap = 0.375em` (6px) in tunet_base.js
- `BUILD / DEPLOY`
  - automatic cache-busting is restored for v3 deploys
  - new helper script `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs` uses the Home Assistant websocket `lovelace/resources/update` command to sync `/local/tunet/v3/*.js?v=...` resources to the current manifest token
  - `build.mjs --deploy` now performs SCP + resource sync in one path
  - `deploy_tunet_v3_lab.sh` also syncs Lovelace resources after copy (manifest token in built mode, generated source token in rollback mode)
- `VALIDATION`
  - `npm test` passed (576/576)
  - `npm run tunet:build` passed (13 cards)
  - deployed with resource version `?v=build_20260405_175253Z`
  - HA resource registry verified live: all 13 `/local/tunet/v3/*.js` entries now match the manifest token after deploy
  - targeted rehab screenshot review confirmed the rehab slim raw-`sofa` icon bleed is fixed after deploy
  - targeted rehab screenshot review at `390x844` and `1440x900` also confirmed plain-percent row status text, row lead-icon parity with orb/power controls, and improved desktop row/slim readability
  - storage overview screenshot review loaded, but the `1440x900` overview composition still truncates room labels aggressively in a narrow row layout; treat that as likely surface/config drift until proven card-local
  - storage `rooms` route timed out waiting for Tunet cards in the screenshot harness
  - separate governance review reproduced a lighting desktop issue on rehab `lab` at `1440x900`: `Card Grid Compact`, `Card Scroll Standard`, and `Section Surface + Expand Groups` now feel over-packed horizontally because `.light-grid` still inherits the shared `tile-grid` standard gap while using full-width tracks
  - live breakpoint validation is still pending, so CD7 remains active

## Session Delta (2026-04-04, CD6 — Lighting Bespoke Pass)

Change marker: CD6 implementation landed, validated, redeployed, and closed; tranche marker advanced to CD7

- `LIGHT TILE`
  - narrow horizontal mode added for phone-width readability
  - reduced gap/padding, narrower value lane, two-line label clamp in narrow horizontal mode
  - interaction model unchanged
- `LIGHTING CARD`
  - synthesized `column_breakpoints` now derived from `tile_size` when omitted:
    - compact/standard → `<=640px: 2`, default `3`
    - large → `<=640px: 1`, default `2`
  - grid tracks now fill available width (`minmax(0, 1fr)`); centered dead-space behavior removed
  - scroll layout now applies inline inset and matching scroll padding so first tile is fully visible at scroll start
  - dense-name pressure reclassified as config discipline: use explicit short names in dense fixtures
- `REHAB HARNESS`
  - rehab YAML remains the primary reproduction harness for lighting-family validation
- `TESTS`
  - new suite: `lighting_bespoke.test.js` (17 tests)
  - targeted regression run: 246 assertions passing
  - full suite: 553 tests, 11 suites, all passing
- `VALIDATION`
  - `node --check` passed on changed JS files
  - YAML parse-check passed on `tunet-card-rehab-lab.yaml`
  - `npm run tunet:build` passed
  - `npm run tunet:deploy:lab` passed
  - D2 visually confirmed fixed: no grid dead space at `390x844`, `768x1024`, `1440x900`
  - D3 visually confirmed fixed: no left-edge scroll clipping at `390x844`, `1440x900`
  - D4 confirmed present: info-tile keyboard wiring already existed and remains intact
  - D1 code fix is deployed and test-covered; broader long-name handling was intentionally deferred beyond CD6
  - no visual regressions were observed in the original CD6 audit, but a later governance review (2026-04-05) found a new follow-on at `1440x900`: full-width lighting grids now use a column gap that feels too tight in `Card Grid Compact`, `Card Scroll Standard`, and `Section Surface + Expand Groups`
- `DEPLOY`
  - Lovelace resource versions updated:
    - initial CD6 completion bump: `tunet_light_tile.js` / `tunet_lighting_card.js` → `?v=20260404_cd6a`
    - current live recovery bump: `tunet_light_tile.js` / `tunet_lighting_card.js` → `?v=20260404_cd6b`
  - YAML dashboard re-SCP'd to `/config/dashboards/tunet-card-rehab-lab.yaml`

## Session Delta (2026-04-04, Control-Doc Normalization)

Change marker: pre-CD5 docs-and-backlog rationalization

- `CURRENT STATE`
  - no tranche change: CD5 remains next
- `DOC NORMALIZATION`
  - `visual_defect_ledger.md` normalized against coherent-build evidence; stale claims downgraded; card defects vs composition constraints separated; tranche ownership explicit
  - `cards_reference.md` encodes whole-home usage contract (rooms=navigation, lighting=room-detail); stale closed-tranche wording removed
  - `legacy_key_precedence.md` actions-editor notes aligned with current contract
  - `sections_layout_matrix.md` wording corrected: CD4 card-level accepted, CD12 surface breakpoint validation still required

## Session Delta (2026-04-04, CD5 — Utility Strip Bespoke Pass)

Change marker: CD5 complete

- `ACTIONS CARD`
  - phone overflow fix: mode_strip and relaxed (compact:false) strips wrap and fill each row on mobile; compact default strips scroll horizontally
  - layout helper consolidates getCardSize/getGridOptions — variant-aware min_columns (6 or 9) and min_rows (1 or 2)
  - aria-pressed on chips with state_entity; removed when no persistent state
  - no new config keys — wrap driven by variant + compact
- `SCENES CARD`
  - header confirmed semantic: title has role="heading" aria-level="3", icon has aria-hidden="true"
  - getGridOptions now tracks allow_wrap + show_header for intentional sizing
  - disabled chip dispatch guard: _activate early-returns when chip.disabled
- `TESTS`
  - new suite: utility_strip_bespoke.test.js (32 tests)
  - tightened sizing_sections_contract.test.js (6 new assertions)
  - total: 527 tests, 10 suites, all passing
- `DOCS`
  - cards_reference.md: actions/scenes grid options, interaction, known limitations updated
  - sections_layout_matrix.md: actions/scenes rows updated to variant-aware values
  - visual_defect_ledger.md: actions overflow and scenes doc contradictions closed
  - stale URLs normalized in CLAUDE.md and Dashboard/Tunet/CLAUDE.md
  - tunet_build_and_deploy.md: test count updated to 527
- `DEPLOY`
  - build: 13 cards to dist/
  - deploy: SCP to root@10.0.0.21
  - resource version: ?v=20260404_cd5c

## Session Delta (2026-04-04, Post-CD4 Rehab Lab Expansion + Visual Audit)

Change marker: post-CD4 harness/doc expansion before CD5

- `CURRENT STATE`
  - CD5 — Utility Strip Bespoke Pass: **next tranche**
  - YAML rehab dashboard now registered separately as `tunet-card-rehab-yaml`
  - storage dashboard and YAML dashboard now coexist for comparison
- `REHAB HARNESS`
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml` expanded to 5 views:
    - `lab`
    - `states`
    - `surfaces`
    - `phone-stress`
    - `nav-lab`
  - room-detail composition rule clarified in the harness:
    - `tunet-rooms-card` = overview/navigation
    - `tunet-lighting-card` = detailed room light control
- `VISUAL DEFECT LEDGER`
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` is now the running screenshot-first audit log for live Tunet defects and improvement opportunities
  - current ledger captures:
    - phone/tablet/desktop layout defects
    - doc/runtime contradictions
    - config/editor improvement backlog
  - new backlog item recorded:
    - icon-bearing editor/config fields should use a dropdown or validated icon picker rather than free-form text where invalid icon strings can silently fail

## Session Delta (2026-04-04, CD4 Closeout)

Change marker: CD4 tranche closure — all shared passes complete

- `AUTHORITY-LOCK`
  - `~/.claude/plans/flickering-herding-wolf.md` is the sole execution authority (CD0–CD12).
- `CURRENT STATE`
  - CD4 — Shared Sizing And Sections Adoption: **DONE** (Apr 4, 2026)
  - CD3.1 — Dropdown Clipping Fix: **DONE** (Apr 4, 2026)
  - CD3 — Shared Semantics Adoption: **DONE** (Apr 3, 2026)
  - All shared passes (CD0–CD4) complete. Bespoke passes begin with CD5.
  - CD5 — Utility Strip Bespoke Pass: next tranche
- `CD4 CLOSURE EVIDENCE`
  - sizing_sections_contract.test.js: 58/58 pass (rows:'auto' enforced, columns:'full' nav-only, scenes allow_wrap, profile override)
  - Full npm test: 489/489 pass (9 suites)
  - npm run tunet:build: 13 cards built
  - All 13 cards confirmed rows:'auto' in getGridOptions()
  - Scenes allow_wrap default changed from false to true (Sections-safe)
  - sections_layout_matrix.md completed with per-card data (provisional → accepted)
  - cards_reference.md scenes Sections safety documented as resolved
- `CD3 CLOSURE EVIDENCE`
  - interaction_keyboard_contract.test.js: 63/63 pass (role, tabindex, Enter/Space, slider preservation)
  - Full npm test: 431/431 pass (8 suites)
  - npm run tunet:build: 13 cards built
  - Deploy: 13 cards SCP'd, Lovelace resources bumped to ?v=20260403_cd3
  - Live DOM verification: all helper-wired elements confirmed role="button" + tabindex="0"
  - spk-tile slider preserved (role="slider")
  - bindButtonActivation helper exported from tunet_base.js
- `CD3.1 CLOSURE`
  - Phase 1 (climate overflow:visible): deployed, verified
  - Phase 2 (live verification): all 3 dropdown cards pass — climate, media, sonos fully visible
  - Phase 3 (viewport-anchored fix): NOT NEEDED — no Sections container clipping detected

## Session Delta (2026-04-03, CD2 Closeout)

Change marker: CD2 tranche closure
- `CD2 CLOSURE EVIDENCE`
  - interaction_source_contract.test.js: 146/146 pass
  - interaction_dom_contract.test.js: 66/66 pass (mock hass, zero skips)
  - Full npm test: 368/368 pass (7 suites)
  - npm run tunet:build: 13 cards built
  - Deploy: 13 cards SCP'd, Lovelace resources bumped to ?v=20260403_cd2
  - Server verification: zero transition:all, hover guards present, press tokens present across all cards
  - Lab rendering: all 13 cards visible at 1440×900, zero red-card errors
  - Climate non-regression: visual match to baseline at desktop width
  - Screenshot matrix: 1440×900 light captured and verified; 390×844, 768×1024, 1024×1366 + dark mode pending user manual verification (no CD2 regressions expected — changes were interaction CSS only, zero layout impact)
- `TRANCHE CLOSURE EVIDENCE (STRICT)`
  - Require `node --check` on changed JS, YAML parse-check on changed YAML, `npm run tunet:build` when outputs are affected, `npm test`, and screenshots at locked breakpoints in both dark and light mode.

## Session Delta (2026-04-02, Consistency-Driver Reset)

Change marker: pre-CD0 (documentation alignment)

- `PROGRAM-RESET`
  - Surface-first execution order superseded
  - Card-family-bucket order (CR0-CR10) ALSO superseded
  - Active execution order is **consistency-driver pass order (CD0-CD12)**:
    - CD0: Build architecture + rehab lab — **next implementation tranche**
    - CD1: Configuration clarity + editor policy (tiered: editor-complete / editor-lite / yaml-first)
    - CD2: Shared interaction adoption (all 13 files, one pass)
    - CD3: Shared semantics adoption (6 files with gaps)
    - CD4: Shared sizing + Sections adoption (6+ files)
    - CD5-CD11: Bespoke card passes (utility strip, lighting, rooms, environment, media, nav verify, status gate)
    - CD12: Surface assembly
  - Rule: shared passes close one dimension across an explicit file list; bespoke passes solve only file-specific behavior remaining
- `GOVERNANCE-KEEP`
  - Three-surface leadership model remains active
  - Climate baseline remains locked
  - Browser Mod popup direction remains active
  - Locked breakpoints remain unchanged
  - No-destructive-cleanup discipline remains unchanged
- `CONFIGURATION SUPPORT POLICY`
  - `editor-complete`: nav, scenes, light_tile, weather, sensor
  - `editor-lite`: lighting, rooms, climate, media, sonos, speaker_grid
  - `yaml-first`: actions, status
- `SURFACE-DOC STATUS`
  - `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` is draft reference only until CD12 surface assembly
- `NEXT TRANCHE`
  - CD0 = Build architecture + rehab lab (COMPLETED Apr 3, 2026)
  - CD1 = Configuration clarity + editor policy (COMPLETED Apr 3, 2026)
  - Card rehab lab becomes the primary validation surface during shared and bespoke passes

## Session Delta (2026-04-02, Tranche 0 — Contract Reconciliation)

Change marker: `Tranche 0`

- `GOVERNANCE-RESET`
  - Profile resolver contract superseded as policy (see `Dashboard/Tunet/Agent-Reviews/profile_contract_supersession.md`)
  - Surface-driven execution model adopted; card work in service of surfaces
  - Build migration sequenced after Surface 1
  - All CLAUDE.md, AGENTS.md updated to reflect current decisions
- `OPEN ISSUES — CURRENT STATE`
  - KI-001 (drag brightness broken): fix candidate deployed at `?v=20260314_v3b`, awaiting user validation
  - KI-002 (no visual config editors): reframed as surface-driven; verify getConfigForm() per surface tranche
  - KI-003 (rooms row toggle oversized): power button same size as orbs is CORRECT/INTENTIONAL — not a bug
  - Status profiles broken: root cause is missing `:host { font-size: 16px }` em anchor — G3S scope, bugfix-only
  - Light tile compact spacing: drag bar too thick, % too close to bar, icons too close to top — surface tranche work
  - Rooms text truncation: "bri" abbreviation + narrow container — surface tranche work
  - Weather forecast config: forecast_days/hours work but visual display doesn't expand — surface tranche work
- `V3 REGRESSION FIXES (COMMITTED, NOT DEPLOYED)`
  - getGridOptions() rows:'auto' + min_rows restored on 7 non-profile v3 cards
  - Nav card G3.0 neutralization backported (version → 0.2.4)
- `DESIGN DOC RECONCILIATION (IN PROGRESS)`
  - 4-agent review running: HA research, CSS map, feasibility critique
  - Dark amber resolved: #fbbf24 is correct (code + memory lock); v8.3 #E8961E is stale
  - Glass opacity: code uses 0.68/0.72, v8.3 says 0.55/0.65 — v8.3 stale
  - Cross-card interaction state vocabulary: 10 divergences identified across 13 cards
  - 3 cards (media, weather, sonos) have zero :focus-visible — accessibility debt
- `SCOPE LOCKS — CURRENT STATE`
  - Status → G3S: RESPECTED (bugfix-only)
  - G6.1 soak: 24/30 days elapsed; gate opens Apr 9
  - Profile contract: SUPERSEDED AS POLICY
  - Breakpoints: LOCKED (390×844, 768×1024, 1024×1366, 1440×900)
- `EM PREFERENCE`
  - User confirmed: prefer em over px for all sizing (shadows, spacing, typography)
  - Status card em-based shadows are the correct pattern; other cards should migrate TO em
  - Climate card hardcoded px values are legacy debt for surface tranche migration
  - 16px em anchor (:host { font-size: 16px }) is CRITICAL and must be documented in spec

## Session Delta (2026-03-13, T-011A.22)

Change marker: `T-011A.22`

- `ISSUE-CAPTURED (COLUMN RGB LATE-ON GAP)`
  - Observed live behavior: sunset prepare automation can abort when columns are off at the sunset trigger crossing.
  - If columns are then turned on during the same active window, RGB session may not auto-arm.
  - Resulting state can keep AL ownership at low brightness and produce purple/pink-leaning output on column strips.
- `PLANNED-FIX (QUEUED, NOT EXECUTED)`
  - Extend prepare coverage with late-on triggers so column-on events in active sunset window execute the same prepare path.
  - Preserve existing window/guard predicates (descending sun window, sleep-mode off, manual empty, system not paused).
- `SCOPE`
  - docs + backlog capture only
  - no package automation edits in this delta

## Session Delta (2026-03-09, T-011A.21)

Change marker: `T-011A.21`

- `CODE-DONE (STATUS BUGFIX-ONLY PX->EM HYGIENE)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - converted remaining status `px` geometry/typography constants to equivalent `em` values
    - converted inline aux-icon style string (`12px` -> `0.75em`)
    - converted dropdown JS offset string (`4px` -> `0.25em`)
    - no interaction-contract changes
    - no new status architecture rollout work
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `POLICY`
  - remains within deferred-status bugfix-only allowance (`T-011A.20`)

## Session Delta (2026-03-09, T-011A.20)

Change marker: `T-011A.20`

- `DIRECTION-LOCK-UPDATE (STATUS DEFERRED)`
  - `tunet_status_card.js` is deferred from the active unification tranche gates.
  - status remains bugfix-only until deferred status-alignment tranche `G3S`.
  - non-status family rollout is no longer blocked by status architecture completion.
- `STATUS ALIGNMENT TRANCHE (G3S) LOCKED SCOPE`
  - lightweight subtype alignment (`timer`, `alarm`, `dropdown`, `value`) using existing shared tokens where low-risk
  - continue `px` -> `em` normalization and remove obvious inline size formulas where safe
  - unit + live breakpoint checks (`390x844`, `768x1024`, `1024x1366`, `1440x900`) using real HA entities
- `DOC-SYNC`
  - updated:
    - `Dashboard/Tunet/Mockups/design_language.md`
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
    - `plan.md`
    - `FIX_LEDGER.md`
    - `handoff.md`

## Session Delta (2026-03-09, T-011A.19)

Change marker: `T-011A.19`

- `CODE-DONE (PROFILE TOKEN NORMALIZATION PASS)`
  - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - added centralized profile token lanes for:
      - header title/subtitle
      - display name/value/meta/action/icon
      - row display name/status, row lead icon, row control size/icon
      - status tile gap/pad-top/pad-bottom
      - timer display font, dropdown value font
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - now consumes shared header/display aliases for profile text lanes
    - removed local profile multipliers
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - now consumes shared header/display aliases for profile text lanes
    - removed local profile multipliers
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile sizing now reads centralized status/display/timer/dropdown tokens
    - removed card-local profile scaling formulas
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - tile + row typography/icon/control lanes now read centralized display/row tokens
    - removed profile-size-specific multiplier overrides
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - profile icon/label/value lanes now read centralized display tokens
    - removed profile multiplier overrides
  - base import cache-key sync
    - updated v3 imports to `./tunet_base.js?v=20260309g7` in:
      - `tunet_lighting_card.js`
      - `tunet_speaker_grid_card.js`
      - `tunet_status_card.js`
      - `tunet_rooms_card.js`
      - `tunet_sensor_card.js`
      - `tunet_light_tile.js`
- `VALIDATION`
  - `node --check` passed for:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `DEPLOYMENT`
  - not run in this tranche

## Session Delta (2026-03-09, T-011A.18)

Change marker: `T-011A.18`

- `CODE-DONE (ROOMS ROW CONTROL SIZE PARITY)`
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - row lead icon reduced
    - compact row sub-buttons enlarged
    - standard row text reduced slightly
    - all-on/off row action button and orb sub-buttons now use identical size variable (`--row-btn-size`)
- `DEPLOYMENT`
  - uploaded rooms v3 file to HA
  - resource bumped:
    - rooms `55d3848b00224adebed2a79bcc2d9904` -> `...g348`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed

## Session Delta (2026-03-09, T-011A.17)

Change marker: `T-011A.17`

- `CODE-DONE (STATUS PROFILE LANE BALANCE)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - corrected profile bottom-lane crowding by increasing tile bottom padding
    - increased icon scale (box + glyph) in profile mode
    - increased bottom label size and centered lane boxes for icon/value/label alignment consistency
- `CODE-DONE (SENSOR PROFILE PARITY TUNE)`
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - applied light-tile parity formulas to profile label/value sizing
    - increased profile icon scale for better lane balance
- `DEPLOYMENT`
  - uploaded status + sensor v3 files to HA
  - updated resources:
    - status `7bbb4f68cb5944bdb8586673420cf69a` -> `...g347`
    - sensor `d27faab6495e4717a8d9313117556f84` -> `...g347`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sensor_card.js` passed

## Session Delta (2026-03-09, T-011A.16)

Change marker: `T-011A.16`

- `CODE-DONE (STATUS PROFILE READABILITY CORRECTIONS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - increased profile icon lane scale
    - tightened profile tile vertical spacing to pull middle value lane upward
    - applied lighting-parity typography formulas to profile middle/bottom lanes
    - bumped timer and dropdown text sizing in profile mode
- `CODE-DONE (ROOMS PROFILE TEXT + ROW-CONTROL CORRECTIONS)`
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - applied lighting-parity profile typography to tiles and row variant title/status lanes
    - reduced per-room row toggle size while increasing per-light orb size
    - widened row control spacing to reduce accidental taps
    - added row-controls target guard in pointer-up path to prevent body-route/toggle side effects when interacting in control region
- `CODE-DONE (SENSOR PROFILE ADOPTION)`
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - wired profile selection/resolution + host token writes (`indicator-row` family)
    - added `tile_size` / `use_profiles` config surface
    - added container-width observer path and sections-safe grid hints
    - migrated row internals to profile token lanes (icon/text/value/unit/sparkline/trend geometry)
- `LAB-YAML-EXPANDED`
  - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - added legacy/profile sensor permutations for compact/standard/large comparisons
- `DEPLOYMENT`
  - uploaded `tunet_status_card.js`, `tunet_rooms_card.js`, `tunet_sensor_card.js` to `/homeassistant/www/tunet/v3/`
  - uploaded updated `tunet-g2-lab-v3.yaml` to `/homeassistant/dashboards/`
  - updated HA resources:
    - status -> `/local/tunet/v3/tunet_status_card.js?v=20260309_g346`
    - rooms -> `/local/tunet/v3/tunet_rooms_card.js?v=20260309_g346`
    - sensor -> `/local/tunet/v3/tunet_sensor_card.js?v=20260309_g346`
- `VALIDATION`
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
  - `python3` + `yaml.safe_load` parse passed (`Dashboard/Tunet/tunet-g2-lab-v3.yaml`)
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

## Session Delta (2026-03-09, T-011A.15)

Change marker: `T-011A.15`

- `CODE-DONE (G3 STATUS + ROOMS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - added profile routing and host token application:
      - `selectProfileSize({ preset: 'status', ... })`
      - `resolveSizeProfile(...)`
      - `_setProfileVars(...)`
    - added `use_profiles` + `tile_size` config surface
    - status subtype internals moved to profile tokens:
      - timer font/letter-spacing
      - alarm pill + action button sizing
      - dropdown menu max-height + option geometry
    - removed viewport fallback from responsive width source (`window.innerWidth`)
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - added profile routing + host token application with layout-aware family selection
    - added `use_profiles` + `tile_size` config surface
    - family routing lock implemented:
      - rooms tiles -> `tile-grid`
      - rooms row/slim -> `rooms-row`
    - row controls/orbs/icon/text geometry now consumes `--_tunet-*` row tokens
    - slim row min-height now scales from profile row height (`~70%` target)
    - added host resize observer for width-driven profile updates
- `CODE-DONE (G4 STANDALONE TILE)`
  - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - added `tile_size` + `use_profiles` config options
    - added profile application pipeline on tile host (`tile-grid`)
    - aligned tile CSS lanes to `--_tunet-*` internal aliases
    - kept drag/tap/hold interaction behavior unchanged
    - added host resize observer for profile auto-size refresh
- `CODE-DONE (G5 GRID HINT HARDENING)`
  - set `rows: 'auto'` with static min/max row bounds in:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - removed viewport fallback width source from:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `VALIDATION`
  - `node --check` passed for:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - no HA live deploy/resource mutation in this tranche
  - no interaction-contract changes

## Session Delta (2026-03-09, T-011A.12)

Change marker: `T-011A.12`

- `LIVE-LAB-DEPLOYED`
  - created and uploaded YAML lab dashboard for G2 profile/legacy comparison:
    - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - registered sidebar dashboard key:
    - `tunet-g2-lab-v3` (`dashboards/tunet-g2-lab-v3.yaml`)
- `RESOURCE-CONFLICT-ISOLATION`
  - removed conflicting v2_next resources for active lab cards:
    - `tunet_lighting_card.js`
    - `tunet_speaker_grid_card.js`
  - added active v3 resources:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix1`
    - `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab`
- `CODE-DONE`
  - patched `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` for user-reported regressions:
    - profile mode missing tile-name lane visibility (height + non-shrinking lane fix)
    - drag brightness pill clipping at top edge (sliding overflow + pill position fix)
    - bottom brightness value too large (profile-mode size softening)
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - HA config check valid
  - HA restart executed and returned success

## Session Delta (2026-03-09, T-011A.13)

Change marker: `T-011A.13`

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - fixed profile tile overlap on desktop by making profile `--grid-row` respect the same minimum floor as tile min-height
    - tightened selector scope so profile lane constraints do not alter legacy mode
- `DEPLOYMENT`
  - uploaded patched v3 lighting card to HA:
    - `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
  - updated active lighting resource to:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix3`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed

## Session Delta (2026-03-09, T-011A.14)

Change marker: `T-011A.14`

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - raised profile-mode typography for header + speaker tiles + group action buttons
    - scoped all new typography changes to `:host([use-profiles])` to keep legacy behavior stable
- `DEPLOYMENT`
  - uploaded:
    - `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
  - resource version updates:
    - lighting `442417dfa9854d60ad4a93324b5c0ff0` -> `...fix4`
    - speaker `3e923a37c68c456a9c4e3a772faa22a7` -> `...fix1`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed

## Session Delta (2026-03-09, T-011A.11)

Change marker: `T-011A.11`

- `CONFLICT-CARRY-FORWARD`
  - docs still lock implementation authority to `Dashboard/Tunet/Cards/v2/`
  - active implementation tranche remains in `Dashboard/Tunet/Cards/v3/` by user override
- `CODE-DONE (G2 PILOT WIRING)`
  - wired profile consumption into:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - both cards now consume:
    - `selectProfileSize({ preset, layout, widthHint, userSize? })`
    - `resolveSizeProfile({ family, size })`
    - `_setProfileVars(...)`
  - added rollback control to both cards:
    - `use_profiles` config boolean (defaults to `true`)
    - `use_profiles: false` keeps legacy tile-size geometry path active
  - lighting profile wiring:
    - apply profile on config set, first render, and host resize
    - profile geometry now drives card/header/tile/icon/text/progress lanes via `--_tunet-*` tokens
    - legacy compact/large CSS overrides are gated to non-profile mode
  - speaker profile wiring:
    - added host resize observer path for profile re-selection
    - profile geometry now drives card/header/tile/icon/text/progress lanes via `--_tunet-*` tokens
    - retained tile-level container-query fallback behavior; legacy compact/large overrides are gated to non-profile mode
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - code + docs-sync only
  - no YAML/storage dashboard mutations
  - no deploy/cache-bust actions

## Session Delta (2026-03-08, T-011A.10)

Change marker: `T-011A.10`

- `CONFLICT-RECORDED`
  - docs still lock implementation authority to `Dashboard/Tunet/Cards/v2/`
  - user directed active tranche execution in `Dashboard/Tunet/Cards/v3/`
- `INTERPRETATION-LOCK`
  - `v3` is the active G1 sandbox by user override
  - `v2` remains production authority until explicit cutover decision
- `CODE-DONE`
  - committed baseline v3 copy from v2 (`32dde28`)
  - added G1 profile primitives and resolver utilities in `Dashboard/Tunet/Cards/v3/tunet_base.js`
  - added resolver unit tests in `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
- `VALIDATION`
  - `node --check` passed for both changed JS files
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

## Session Delta (2026-03-08, T-011A.9)

Change marker: `T-011A.9`

- `DOC-ALIGNED`
  - corrected stale numeric `PROFILE_BASE` snippet in:
    - `Dashboard/Tunet/Mockups/design_language.md` §5.5
  - aligned that section to locked all-em, size-indexed registry contract and canonical v3.1 reference
- `SCOPE`
  - docs-only consistency patch
  - no runtime code changes

## Session Delta (2026-03-08, T-011A.8)

Change marker: `T-011A.8`

- `DOC-ALIGNED`
  - execution-order conflict is now explicit:
    - `T-011A` one-surface orchestration remains required
    - immediate next implementation pass is `G1` profile base primitives after `G0` closeout decisions
  - chosen sequencing:
    1. `G0` closeout decisions/docs sync
    2. `G1` base primitives in `Dashboard/Tunet/Cards/v2/tunet_base.js`
    3. resume `FL-038` surface-by-surface lock sequence
- `SCOPE`
  - docs reconciliation only
  - no runtime code changes

## Session Delta (2026-03-08, T-011A.7)

Change marker: `T-011A.7`

- `DOC-DONE`
  - profile architecture expanded to v3.1 all-em registry contract:
    - size-indexed `PROFILE_BASE`
    - end-to-end density ownership (D18-D22)
    - expanded out-of-scope table and token ownership rules
  - canonical architecture reference is:
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` (v3.1)
- `SCOPE`
  - docs only, no runtime code changes

## Session Delta (2026-03-07, T-011A.6)

Change marker: `T-011A.6`

- `DOC-RECONCILED`
  - interaction contract baseline aligned to current direction:
    - room card-body tap is route-first (`navigate` preferred)
    - explicit controls/orbs/buttons own toggles
    - hold is optional secondary popup behavior only where configured
  - legacy global `tap-toggle / hold-popup` language is historical when it conflicts with this lock
  - when lower sections conflict, this session-delta lock is authoritative
- `SCOPE`
  - docs reconciliation only
  - no runtime code changes

## Session Delta (2026-03-07, T-011A.5)

Change marker: `T-011A.5`

- `DOC-DONE`
  - V2 design-guideline rewrite + structure translation completed:
    - `Dashboard/Tunet/Mockups/design_language.md` rewritten as canonical V2 contract (`v9.0`)
    - `Dashboard/Tunet/design.md` rewritten as documentation-structure index
  - direction locks documented in canonical design spec:
    - implementation authority is `Dashboard/Tunet/Cards/v2/`
    - profile family split is 5 keys (`tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row`)
    - selector/resolver API split lock (`selectProfileSize` vs pure `resolveSizeProfile`)
    - token consumer boundary lock (`tile-core` core lanes; family extensions owned by composing family components)
    - container-first width-source requirement and mode-agnostic profile policy
- `SCOPE`
  - docs only, no runtime code changes
  - no deployment/cache-bust actions

## Session Delta (2026-03-07, T-011A.4)

Change marker: `T-011A.4`

- `CODE-DONE (G0 PARTIAL)`
  - container-width migration tranche completed for profile-target sizing paths:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - changes:
    - base responsive density now uses container query path first (`@container`) with viewport fallback only when needed
    - status card responsive columns now use `ResizeObserver` primary, `window.resize` fallback-only
    - lighting card columns/row-height/subtitle compaction now resolve from host/container width buckets instead of viewport `innerWidth`/`matchMedia`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed
- `SCOPE`
  - no YAML changes
  - no deploy/cache-bust in this slice
  - nav global layout mutation isolation prerequisite remains open

## Session Delta (2026-03-07, T-011A.3)

Change marker: `T-011A.3`

- `DECISION-LOCK (DOCS)`
  - card-unification direction: `Option C` (family profile consumption), planning score lock `8.15/10`
  - prerequisite ordering locked:
    1. container-first width-source migration
    2. nav global layout mutation isolation (`ensureGlobalOffsetsStyle` scope control)
    3. phased profile rollout
- `ROLL-OUT LOCKS`
  - `rooms-row` is a single family; `slim` is a layout variant modifier (not a family key)
  - skip Option B pilot comparison; execute direct Option C pilot
  - add post-pilot calibration gate for `getCardSize()` and `getGridOptions()`
- `SCOPE`
  - docs-only planning update in `Dashboard/Tunet/Agent-Reviews/type_profile_consumption_options.md`
  - no runtime JS/YAML changes

## Session Delta (2026-03-07, T-011A.2)

Change marker: `T-011A.2`

- `CODE-DONE`
  - rooms row control proportionality + status precedence hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.9.2`)
  - fixes included:
    - mobile rooms-row controls scale down relative to desktop
    - row all-toggle and per-light orbs share matched sizing box model
    - row main icon reduced to preserve text lane readability
    - status line suppresses unlabeled brightness `%` when ambient entities are configured
- `SCOPE`
  - no nav/popup contract changes
  - no YAML structure changes
- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_base.js`
    - `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p09`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-07, T-011A.1)

Change marker: `T-011A.1`

- `CODE-DONE`
  - Lighting tile visual polish parity update:
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - parity adjustments:
    - explicit rooms-style hover/press feedback on lighting tiles
    - explicit circular icon-wrap geometry + icon sizing parity
    - off/unavailable icon-wrap styling retains visible circular container treatment
    - compact/condensed tile lane protection:
      - icon lane scales down first
      - name/value/progress lanes keep separation under compact pressure
      - dense compact mode (`columns >= 5`) applies tighter proportional scaling
- `SCOPE`
  - no navigation/popup/interaction-contract behavior changes
  - no YAML layout changes
- `DEPLOYMENT`
  - uploaded `/config/www/tunet/v2_next/tunet_lighting_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p08`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed

## Session Delta (2026-03-07, T-011A)

Change marker: `T-011A`

- `PRIORITY-RESET`
  - active remediation focus is now surface-by-surface layout orchestration (`Page -> Section -> Card`) per `Dashboard/Tunet/AGENTS.md` sections `7B` and `7C`
  - prior bug-fix-heavy `P0` queue items that are already implemented in card sources move to verification backlog unless regressions are reproduced
- `DOC-SYNC`
  - planning control docs now prioritize:
    1. Living Room page lock
    2. Matching Living Room popup lock
    3. Overview lock
    4. Media lock
    5. Remaining room pages via locked template deltas

## Session Delta (2026-03-07, T-010C.2)

Change marker: `T-010C.2`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Popup/navigation action dispatch hardening in shared action router:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Cache-safe adoption of updated shared router:
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` (`v2.4.3`)
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.6`)

- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_base.js`
    - `/config/www/tunet/v2_next/tunet_actions_card.js`
    - `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p06`
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p06`

- `VALIDATION`
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

## Session Delta (2026-03-07, T-010C.1)

Change marker: `T-010C.1`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Status dropdown reliability hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`v2.6.5`)
  - Popup room-link action reliability normalization:
    - `Dashboard/Tunet/tunet-suite-storage-config.yaml` (living popup Room action -> `navigate`)
    - `Dashboard/Tunet/tunet-suite-config.yaml` parity updates for popup Room actions

- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_status_card.js`
    - `/config/www/tunet/v2_next/tunet_base.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_status_card.js?v=20260307_p05`
  - live storage dashboard transform applied:
    - `tunet-suite-storage` living popup `Room` action now uses `action: navigate`

- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - YAML parse checks passed for modified Tunet suite YAML files

## Session Delta (2026-03-07, T-010B)

Change marker: `T-010B`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Nav clearance hardening for sections/mobile footer overlap:
    - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (`v0.2.3`)
  - Centralized rooms row density token increase:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Rooms row control parity fix (orb vs toggle sizing consistency):
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.5`)
  - Light tile lane-spacing refinements (name/value/bar separation):
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` (`v3.4.4`)
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` (`v1.0.2`)

- `DEPLOYMENT`
  - uploaded updated files to `/config/www/tunet/v2_next/`
  - dashboard resources version-bumped:
    - `/local/tunet/v2_next/tunet_nav_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_light_tile.js?v=20260307_p04`

- `VALIDATION`
  - `node --check` pass:
    - `tunet_base.js`
    - `tunet_nav_card.js`
    - `tunet_rooms_card.js`
    - `tunet_lighting_card.js`
    - `tunet_light_tile.js`

## Session Delta (2026-03-07)

Change marker: `T-010A`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Shared icon/density baseline tuning:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Status compact/standard clipping/readability stabilization + container-width responsive columns:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Scenes chip compact readability sizing pass:
    - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - Actions strip compact readability sizing pass:
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- `DEPLOYMENT`
  - uploaded the four files to `/config/www/tunet/v2_next/`
  - dashboard resources version-bumped:
    - `/local/tunet/v2_next/tunet_status_card.js?v=20260307_p01`
    - `/local/tunet/v2_next/tunet_scenes_card.js?v=20260307_p01`
    - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p01`
- `VALIDATION`
  - `node --check` pass:
    - `tunet_base.js`
    - `tunet_status_card.js`
    - `tunet_scenes_card.js`
    - `tunet_actions_card.js`

## Session Delta (2026-03-07, follow-up)

Change marker: `T-010A.1`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Rooms header all-toggle control sizing increase:
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `DEPLOYMENT`
  - uploaded to `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - dashboard resource bumped:
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p02`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-06 Late 2)

Change marker: `T-009E`

- `CODE-DONE / HA-VERIFY`
  - Centralized mobile density baseline in shared card system:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Focused adoption pass for high-visibility mobile tiles:
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `CACHE-BUSTING`
  - all v2 cards now reference `tunet_base.js?v=20260306g3`
- `DOCS-ADDED`
  - `Dashboard/Tunet/Docs/mobile_density_audit_weather_climate.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_media_audio.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_sensor_actions_scenes.md`
  - `Dashboard/Tunet/Docs/mobile_density_crosscard_gap_review.md`
  - `Dashboard/Tunet/Docs/mobile_density_master_matrix.md`

## Session Delta (2026-03-06 Late)

Change marker: `T-009D`

- `CODE-DONE / HA-VERIFY`
  - Status card compact readability + dropdown layering hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Rooms row/slim mobile control sizing increase:
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `DOCS-ADDED`
  - Weather refactor plan matrix:
    - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
  - Status/chips resolution guide:
    - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
  - Brightness alignment RCA:
    - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`

## Purpose

This file is the machine-actionable findings ledger for the Tunet Suite work.

- `plan.md` is the execution source of truth.
- `FIX_LEDGER.md` is the detailed findings and remediation source of truth.
- When a sub-agent needs exact work items, use this file first.
- When a human needs phase order, rollout order, or deployment order, use `plan.md`.

This file is **not** meant to be a mixed bag of:

- active defects
- superseded architectural assumptions
- product-direction questions

Those three categories must remain separate, or future work will mistake historical drift for actionable remediation.

## Requirement Register And Interpretation Model

This ledger is not just a backlog. It is an architectural control surface.

Every item in this file must answer one question correctly before work begins:

`Given the real product intent, what kind of item is this, which surface does it apply to, and what is allowed to happen next?`

To make that possible, all ledger items must be interpreted through four gates:

1. `Requirement Alignment`
2. `Surface Scope`
3. `Item Type`
4. `Completion Standard`

If an item cannot be interpreted through these four gates, it does not yet belong in the active remediation flow.

### Requirement Register

These requirement IDs are the stable intent model for the Tunet work. Ledger items should reference them explicitly where relevant.

| Requirement ID | Requirement | Why It Exists |
|---|---|---|
| `REQ-NAV-001` | `NAV` is the first major product decision. | The product must establish coherent chrome and wayfinding before popup, shell, and home-layout decisions are finalized. |
| `REQ-NAV-002` | Nav must be understandable without builder knowledge. | Family and guests should know where they are and what each route does without explanation. |
| `REQ-NAV-003` | Nav must act as a live-state surface, not a dead route strip. | Premium home UI should surface small but useful context at the point of navigation. |
| `REQ-POP-001` | Browser Mod is the preferred popup system. | Popup behavior must be robust, reusable, and aligned with the intended product surface. |
| `REQ-POP-002` | There is one popup per room. | Room overlays should be intentional, minimal, and predictable. |
| `REQ-POP-003` | Popups must feel like premium iOS-grade sheets. | Overlay quality is part of the daily-use product, not an implementation afterthought. |
| `REQ-UX-001` | Primary actions must be reachable in one touch. | The dashboard is for real household use, not for exploratory builder interaction. |
| `REQ-UX-002` | Current location and next action must be obvious. | Low cognitive load is required for family-grade usability. |
| `REQ-UX-003` | Daily-use family clarity outranks technically clever composition. | Product acceptance is determined by repeated household use, not just implementation novelty. |
| `REQ-SEC-001` | Sections are organized by role, hierarchy, and one-touch value. | Sections is a product-architecture tool, not just a sizing grid. |
| `REQ-SEC-002` | Width is a ratio decision, not the whole design decision. | Span alone does not determine whether a surface deserves prominence or placement. |
| `REQ-SEC-003` | Vertical sizing should generally remain intrinsic. | Forced height should be the exception, not the default, in a modern Sections dashboard. |
| `REQ-LAY-001` | Sections layout must be validated through breakpoint-aware composition rules. | The project needs a formal responsive model at view, section, and card levels instead of ad-hoc span tuning. |
| `REQ-LAY-002` | Card-level hard width caps are exception-only. | Responsive behavior should be driven by proportional layout and intrinsic sizing, not rigid card caps. |
| `REQ-SURF-001` | Storage/hybrid is the primary evaluation and UI-edit surface. | Product feel should be judged on the surface people can actually interact with and adjust. |
| `REQ-SURF-002` | YAML suite is the repo-controlled architecture surface. | Long-term structure, reviewability, and deployment discipline still need a canonical branch-readable surface. |
| `REQ-DONE-001` | Implemented is not done. | Repo state, live HA state, visual validation, and product acceptance must remain distinct. |
| `REQ-V1-001` | Valuable V1 polish and interaction patterns should be recovered where compatible. | Migration to Sections must not discard the atmosphere and clarity that made the earlier dashboard feel premium. |
| `REQ-CTRL-001` | Every change must pass a preflight change gate with traceability. | Prevents fast local fixes from reintroducing cross-card behavior drift. |
| `REQ-INT-001` | Room interaction contract is route-first body tap with explicit control-owned toggles. | Keeps primary intent one-touch while preserving predictable toggles and optional premium popup access. |

### Four-Gate Interpretation Model

#### 1. Requirement Alignment

Every item should identify which requirement IDs it serves.

Examples:

- `REQ-NAV-001` if it affects nav sequencing or nav acceptance
- `REQ-POP-001` and `REQ-POP-003` if it affects room popup platform or sheet quality
- `REQ-UX-001` if it changes one-touch control quality
- `REQ-SEC-001` if it changes Sections placement, grouping, or interaction hierarchy

#### 2. Surface Scope

Every item should make clear which surface it applies to:

- `Repo Architecture Surface`
- `Storage/Hybrid Evaluation Surface`
- `Historical / Reference Surface`

If an item affects more than one surface, that should be stated explicitly rather than implied.

#### 3. Item Type

Every item must fit one of these types:

- `DEFECT`
- `SUPERSEDED ASSUMPTION`
- `PRODUCT-DIRECTION DECISION`
- `VALIDATION TASK`

This prevents design direction from being executed like a bug ticket and prevents historical assumptions from being mistaken for current failures.

#### 4. Completion Standard

Every item must be evaluated against one or more of these completion states:

- `CODE CHANGED`
- `DEPLOYED`
- `VISUALLY VALIDATED`
- `ACCEPTED AS PRODUCT DIRECTION`

The ledger must not collapse these into a single meaning of "done."

### How To Use The Requirement Model

- Use requirement IDs to justify why an item belongs in the active queue.
- Use surface scope to decide where the work should be implemented or judged.
- Use item type to decide whether the item belongs in remediation, historical fencing, or product direction.
- Use completion standard to prevent repo work from being mistaken for daily-use product acceptance.

This is how the ledger stays aligned with Home Assistant's operating philosophy:

- flexibility: multiple surfaces can coexist without being conflated
- reliability: stale assumptions are fenced instead of silently reused
- user empowerment: success is measured by understandable, controllable daily use

## Control Document Precedence

If the control documents disagree, use this precedence order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/Docs/agent_driver_pack.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Do not silently smooth over conflicts. Record them explicitly in planning outputs.

## Branch And Status Discipline

- This ledger is authoritative for broad Tunet work only on branch `claude/dashboard-nav-research-QnOBs`.
- Broad planning outputs must record the live current branch and HEAD before using this ledger.
- Imported findings must be classified as:
  - `OPEN`
  - `ALREADY FIXED IN REPO`
  - `FIXED IN REPO BUT NOT DEPLOYED`
  - `FIXED IN YAML BUT NOT STORAGE`

## Session Delta (2026-03-06)

### FL-033
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Type: `DEFECT`
- Summary:
  - Home status compact readability and tile density were mis-scaled (text too small, perceived whitespace too high).
  - Dropdown visibility required host-level elevation during open state.
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- Validation:
  - `node --check` passed for both card files.

### FL-034
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Type: `DEFECT`
- Summary:
  - Rooms row variant controls were too small on mobile.
  - Increased row-mode mobile sizing for room icon, orb controls, toggle control, and text scale.
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Validation:
  - `node --check` passed.

### FL-035
- Status: `ANALYZED`
- Severity: `MEDIUM`
- Type: `VALIDATION TASK`
- Summary:
  - Brightness/status vertical alignment drift investigated for lighting + rooms surfaces.
  - Root-cause and fix options documented for follow-up implementation tranche.
- Files:
  - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
  - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`

## Reconciled Findings That Must Not Be Reopened Blindly

These items have already changed materially on this branch and must be verified before being repeated as active blockers:

- `back_path` is already present on Tunet suite subviews.
- the storage Living Room popup already uses one consolidated `tunet-lighting-card`.
- the storage Bedroom subview source now uses one consolidated `tunet-lighting-card` with companion Sonos/alarm panels and a full-width context strip (`T-008B`); live breakpoint validation is still required.
- `tunet_sensor_card.js` `value_attribute` support.
- nav active color token drift in `tunet_nav_card.js`.

## Canonical Decisions Already Made

- Surface model:
  - `tunet-suite` YAML is the repo-controlled architecture surface.
  - `tunet-suite-storage` is the primary evaluation / UI-edit surface.
  - older overview and test dashboards are historical / reference surfaces only unless explicitly promoted.
- Resource strategy: keep `v2_next` as the active staging root until cutover is explicitly approved.
- Layout strategy: native HA Sections layout is the primary layout engine.
- Vertical sizing strategy: do not force vertical rows in production sections cards unless there is a compelling card-specific exception.
- Navigation strategy: custom `tunet-nav-card` is the navigation foundation.
- Room strategy: Office is not a room; Office lighting is part of Living Room.
- Popup strategy: Browser Mod is the preferred next-popup direction for Tunet. Existing Bubble/hash popup work is historical POC material only unless explicitly re-approved.
- Card editor strategy: `getConfigForm()` remains acceptable for simple/scalar configs; nested array editing is not considered solved.
- Interaction strategy: room card-body uses route-first tap; explicit controls own toggles; hold-popup is optional where configured.

## Execution Gate Register (2026-03-06)

These are mandatory workflow constraints for active implementation:

- each implementation change needs a `Change ID` and explicit surface scope
- each change needs a cross-card impact check before coding
- active work must remain inside one tranche at a time
- no more than three active implementation items inside an active tranche

## How To Use This Ledger

For each active defect item:
- Read the `Exact Fix`.
- Read the `Why This Matters`.
- Read the `Requirement Alignment` if present.
- Read the `Surface Scope` if present.
- Respect the `Dependency` ordering.
- Do not mark the item done until the `Validation` step is complete.
- If a code change is made but HA has not yet been refreshed or redeployed, keep the status as `CODE-DONE / HA-VERIFY`.

For this file as a whole, interpret it using this structure:

1. `Active Defects / Remediation`
   - things that should be fixed in code, config, docs, or live HA state
2. `Superseded Assumptions`
   - older architectural or planning assumptions that must not be reused blindly
3. `Product-Direction Decisions`
   - open or locked design decisions that shape future tranches but are not themselves implementation defects

Do not execute Product-Direction Decisions as if they were bug tickets.
Do not treat Superseded Assumptions as active failures unless they still survive in code or docs.

## Ledger Model

This ledger now follows the same architectural discipline as `plan.md`:

- `plan.md` defines execution order and system state
- `FIX_LEDGER.md` defines remediation truth

Within `FIX_LEDGER.md`, every item should fit one of these meanings:

- `DEFECT`
  - Something is wrong in repo state, live HA state, documentation, or interaction behavior and should be fixed.
- `SUPERSEDED ASSUMPTION`
  - Something used to be treated as true or current, but is no longer the right basis for execution.
- `PRODUCT-DIRECTION DECISION`
  - A product or architectural decision that shapes future work, but should not be confused with a defect.

If an item is not clearly one of those, the ledger is drifting again.

## File Scorecard

These grades are implementation-health grades, not value judgments. They reflect current production readiness relative to the stated Tunet goals.

| File | Grade | Summary | Primary Reason |
|---|---|---|---|
| `plan.md` | B | Strong execution framing, but needed linkage to the concrete findings backlog | Plan and repo state were drifting |
| `FIX_LEDGER.md` | A | Detailed backlog and validation source | Created to remove ambiguity |
| `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` | D | Operationally dangerous before reconciliation | Documented `v2` while staging actually uses `v2_next` |
| `Dashboard/Tunet/tunet-suite-config.yaml` | C | Correct macro architecture, but still had entity/config drift and incomplete POC composition | Mixed popup/subview patterns, stale entities, forced rows |
| `Dashboard/Tunet/tunet-overview-config.yaml` | C | Useful legacy reference, but not fully aligned with sections auto-height policy | Still forced `rows: 2` |
| `Dashboard/Tunet/tunet-v2-test-config.yaml` | C | Good harness, but still contained stale sizing assumptions | Still forced `rows: 2` |
| `Dashboard/Tunet/Docs/dashboard_navigation_research.md` | C | Valuable historical research, but not a safe implementation reference without qualification | Describes browser_mod-first world, not current POC reality |
| `Dashboard/Tunet/Cards/v2/tunet_base.js` | B+ | Shared tokens and registration foundation are strong | Needs more discipline from consuming cards |
| `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` | C | Correct high-level concept, but global layout side effects are too broad | Global offsets, direct `pushState`, weak config editor story |
| `Dashboard/Tunet/Cards/v2/tunet_status_card.js` | B | Bug 1 and Bug 2 work is present | Still uses manual history navigation pattern |
| `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` | B- | Flexible and reusable, but still carries legacy fixed-row semantics | `rows` still influences visible tile count |
| `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` | B | Focused and relatively isolated | Less strategically important once consolidated room surfaces are used |
| `Dashboard/Tunet/Cards/v2/tunet_climate_card.js` | B | Architecturally sound and stable | No major audit blocker surfaced |
| `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` | B | Generally sound | Depends on broader entity consistency |
| `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` | C- | Needed real functionality fix for attribute-based sensors | Missing `value_attribute` support, stale AQI stub |
| `Dashboard/Tunet/Cards/v2/tunet_media_card.js` | C | Good UI surface, but config contract and speaker invalidation need work | Group sensor contract drift and stale cache risk |
| `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js` | C | Viable card, but responsive density needs refinement | Mobile column behavior too rigid |
| `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` | C | Right role in IA, but still relies on direct history manipulation | Navigation implementation is brittle |
| `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js` | B- | Rich capability surface, but not currently in production path | Needs explicit role decision |
| `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` | B | Straightforward and low-risk | No major issue surfaced in this tranche |

## Remediation Ledger

### Control-Plane Hardening

#### FL-000
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `.claude/skills/tunet-agent-driver/SKILL.md`
  - `CLAUDE.md`
  - `Dashboard/Tunet/CLAUDE.md`
  - `Dashboard/Tunet/Docs/agent_driver_pack.md`
  - `plan.md`
  - `FIX_LEDGER.md`
- Problem:
  - The Tunet multi-agent workflow had strong structure but insufficient determinism around branch, document precedence, stale findings, and required saved-artifact preflight.
- Exact Fix:
  - Add explicit branch guard requirements.
  - Add explicit control-document precedence.
  - Add stale-finding classification and reconciliation rules.
  - Require branch/head and control-doc reconciliation sections in saved planning artifacts.
- Why This Matters:
  - The biggest remaining failure mode is no longer “lack of analysis”; it is producing high-effort, high-confidence artifacts from the wrong branch or from stale assumptions.
- Dependency:
  - None.
- Validation:
  - Read the listed files and confirm they now explicitly document branch guard, precedence, stale-finding handling, and saved-artifact discipline.

### Immediate Operational Alignment

#### FL-001
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
  - `plan.md`
- Problem:
  - Repo documentation described `/config/www/tunet/v2/` and `/local/tunet/v2/` as the active root even though the active staging deployment is `/config/www/tunet/v2_next/` and `/local/tunet/v2_next/`.
- Exact Fix:
  - Rewrite deployment documentation so it explicitly distinguishes:
    - active staging root: `v2_next`
    - optional stable rollback root: `v2`
  - Use one consistent version string example across the doc.
  - State that `tunet_base.js` is not a Lovelace resource but must exist beside the modules.
- Why This Matters:
  - A deployment guide that points at the wrong root can silently load stale JS and invalidate every UI result.
- Dependency:
  - None.
- Validation:
  - Read the doc and confirm every example path matches the actual active HA resource list.

#### FL-002
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The dashboard configs still force `rows: 2` on the lighting card even though the agreed sections policy is auto-height.
- Exact Fix:
  - Remove `rows: 2` from all shipped YAML lighting-card configs unless there is a documented exception.
- Why This Matters:
  - In the current lighting card, `rows` is not just a height hint; it limits the number of visible tiles.
  - This violates the new “let sections size vertically” policy and can hide content.
- Dependency:
  - None.
- Validation:
  - `rg -n "rows:\\s*2" Dashboard/Tunet/*.yaml` returns zero matches.

### Entity Drift And Config Contract Fixes

#### FL-003
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Bedroom config in the suite still references `light.bedroom_accent_light` while the repo’s other dashboard YAMLs and live HA validation indicate the correct accent entity is `light.master_bedroom_corner_accent_govee`.
- Exact Fix:
  - Replace all Bedroom accent references in the suite config with `light.master_bedroom_corner_accent_govee`.
- Why This Matters:
  - This is a straight entity drift bug. It produces missing controls or broken room surfaces.
- Dependency:
  - None.
- Validation:
  - `rg -n "bedroom_accent_light|master_bedroom_corner_accent_govee" Dashboard/Tunet/tunet-suite-config.yaml` shows only the Govee entity.

#### FL-004
- Status: `DONE`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- Problem:
  - The media card’s default contract expects `active_group_sensor: sensor.sonos_active_group_coordinator`, but the suite YAML used `sensor.sonos_smart_coordinator`.
- Exact Fix:
  - Align the suite YAML with the card’s own documented contract and use `sensor.sonos_active_group_coordinator` everywhere `active_group_sensor` is configured for `tunet-media-card`.
- Why This Matters:
  - Live HA currently exposes `group_members` on both sensors, so this is not necessarily a hard runtime failure today.
  - It is still a contract drift bug that makes future debugging harder and makes the production suite disagree with its own component defaults.
- Dependency:
  - None.
- Validation:
  - `rg -n "active_group_sensor:" Dashboard/Tunet/tunet-suite-config.yaml` shows only `sensor.sonos_active_group_coordinator`.

#### FL-005
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The sensor card YAML uses `value_attribute: temperature` for `weather.home`, but the V2 sensor card did not implement `value_attribute`.
- Exact Fix:
  - In `tunet_sensor_card.js`, use `entity.attributes[cfg.value_attribute]` for current-value rendering when `value_attribute` is provided.
  - In history fetches, do not strip attributes for rows that rely on `value_attribute`; parse historical points from the named attribute when present.
- Why This Matters:
  - Without this, the “Outside” row can show the weather condition string instead of a temperature value and all threshold logic becomes meaningless.
- Dependency:
  - None.
- Validation:
  - Static: code search shows `cfg.value_attribute` handling in both current-value and history parsing logic.
  - Runtime: the “Outside” sensor row shows a numeric temperature value.

#### FL-006
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
- Problem:
  - The V2 sensor card stub config still advertises `sensor.aqi`, even though Bug 3 was explicitly removed from active dashboard YAMLs.
- Exact Fix:
  - Replace the stub config row with a safe, likely-to-exist example, or remove the fourth sample row entirely.
- Why This Matters:
  - This reintroduces a known-bad entity into the UI editor path and confuses verification.
- Dependency:
  - None.
- Validation:
  - `rg -n "sensor\\.aqi" Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` returns zero matches.

### POC Structure Fixes

#### FL-007
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room popup POC still uses a vertical stack of `tunet-light-tile` instances instead of one consolidated lighting surface.
- Exact Fix:
  - Replace the five `tunet-light-tile` cards in the Living Room popup with one `custom:tunet-lighting-card`.
  - Use explicit `zones` for:
    - `light.living_room_couch_lamp`
    - `light.living_room_floor_lamp`
    - `light.living_room_spot_lights`
    - `light.living_room_credenza_light`
    - `light.office_desk_lamp`
  - Keep the popup focused:
    - `All Off`
    - one lighting surface
    - `Open Room`
- Why This Matters:
  - The whole point of the POC is to validate the final pattern, not a temporary duplicate-tile fallback.
- Dependency:
  - FL-003 if Bedroom entities are being normalized in the same change set; otherwise independent.
- Validation:
  - Open Living Room popup and confirm there is exactly one lighting card, not a tile stack.

#### FL-008
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room subview still uses stacked `tunet-light-tile` cards instead of a consolidated room lighting surface.
- Exact Fix:
  - Replace the stacked tiles in the Living Room subview with one `custom:tunet-lighting-card` using the same explicit Living Room zone list as the popup.
- Why This Matters:
  - The subview should represent the scalable room pattern the rest of the project will follow.
- Dependency:
  - FL-007 preferred, so popup and subview share the same entity model.
- Validation:
  - Open `/tunet-suite/living-room` and confirm one consolidated lighting card controls all living-room lights.

#### FL-009
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Room subviews do not declare explicit `back_path`.
- Exact Fix:
  - Add `back_path: /tunet-suite/overview` to each room subview.
- Why This Matters:
  - Direct links, refreshes, and unusual navigation history should still return users to the intended dashboard destination.
- Dependency:
  - None.
- Validation:
  - Open a room subview directly in a fresh tab and confirm the HA back button returns to `/tunet-suite/overview`.

### Navigation Foundation Hardening

#### FL-010
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Problem:
  - `tunet-nav-card` uses `var(--amber-strong)` for the active nav color, but that token is not defined in the shared token layer.
- Exact Fix:
  - Replace `var(--amber-strong)` with an existing token such as `var(--amber)`, or define `--amber-strong` centrally in `tunet_base.js`.
- Why This Matters:
  - Active-state styling should not depend on undefined-token fallback behavior.
- Dependency:
  - None.
- Validation:
  - Search confirms the token is either defined centrally or no longer referenced.

#### FL-011
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-NAV-003`
  - `REQ-SURF-001`
  - `REQ-SURF-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `tunet-nav-card` injects global `hui-view` offsets and document-root CSS variables from every card instance on every view.
  - Storage views now use native `footer.card` placement for nav, but JS-global offset injection still exists and can leak outside Tunet routes.
- Exact Fix:
  - Scope nav layout offsets so they only affect the Tunet dashboard and only once.
  - Acceptable patterns:
    - a single shared dashboard-scoped root owner
    - route-aware offset application limited to `/tunet-suite`
    - layout reserved in the card’s host tree instead of document-global margin injection
- Why This Matters:
  - The current behavior can affect non-Tunet dashboards and introduces order-dependent layout behavior.
- Dependency:
  - None, but architectural care is required.
- Validation:
  - `tunet-suite-storage-config.yaml` places nav in view `footer.card` for all sections views.
  - Open a non-Tunet dashboard after loading Tunet and confirm no extra left or bottom spacing remains.

#### FL-012
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-SURF-001`
  - `REQ-SURF-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - Navigation is implemented via direct `history.pushState` plus manual `location-changed` dispatch.
- Exact Fix:
  - Replace direct history manipulation with Home Assistant’s supported navigation mechanism everywhere a Tunet card changes the route.
- Why This Matters:
  - This is brittle against HA frontend router changes and mixes app routing with custom event simulation.
- Dependency:
  - None, but should be done consistently across all cards once started.
- Validation:
  - Browser back/forward, route highlighting, and subview transitions work without custom history shims.

#### FL-013
- Status: `OPEN`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-SURF-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `subview_paths` is exposed as an `object` selector even though the card consumes an array of strings.
- Exact Fix:
  - Either:
    - implement a real editor path for repeated strings, or
    - explicitly treat `subview_paths` as YAML-only and remove it from the simple visual schema.
- Why This Matters:
  - A broken or misleading config editor is worse than an explicit YAML-only field.
- Dependency:
  - Depends on the broader config editor decision.
- Validation:
  - UI editor either renders a valid repeatable list or no longer pretends to support the field.

#### FL-025
- Status: `DONE`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-UX-002`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - Inactive nav items were invisible — hardcoded `rgba(255,255,255,0.62)` (white at 62% opacity) on a near-white light-mode glass background. Bypassed the token system entirely. No `:host(.dark)` override existed.
- Exact Fix:
  - Replaced hardcoded color with `var(--text-muted)` for light mode.
  - Added `:host(.dark) .btn:not(.active) { color: rgba(248,250,252, 0.55); }` for dark mode legibility.
- Why This Matters:
  - Nav items were literally invisible in light mode — users could only see the active (orange) item, making navigation impossible.
- Dependency:
  - None.
- Validation:
  - All three nav items (Home, Rooms, Media) are visible in both light and dark mode. Active item remains amber. User confirmed fix on 2026-03-06.

#### FL-026
- Status: `DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-UX-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - Excessive spacing between nav icon and label. Material Symbols Rounded font metrics inflated the icon grid cell beyond 22px, and the grid `gap: 4px` measured from the inflated boundary.
- Exact Fix:
  - Added `line-height: 22px; overflow: hidden` to `.btn .icon` to contain font metrics.
  - Reduced grid `gap` from `4px` to `2px`.
- Why This Matters:
  - Nav chrome should be tight and compact — excessive spacing made it look unfinished.
- Dependency:
  - None.
- Validation:
  - Icon-to-label spacing is visually tight and consistent across all three nav items. User confirmed fix on 2026-03-06.

### Control Plane And Interaction Unification

#### FL-027
- Status: `DONE / PROCESS LOCKED`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-CTRL-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `plan.md`
  - `FIX_LEDGER.md`
- Problem:
  - The project has planning docs but no enforced preflight gate, WIP budget, or change traceability discipline.
- Exact Fix:
  - Add mandatory change-gate requirements (`Change ID`, impact map, validation checklist, rollback path) and one-tranche WIP limits to control docs.
  - Add explicit micro-interaction drift-prevention contract to `plan.md` that blocks tap/hold/popup behavior changes without synchronized contract + ledger + validation updates.
- Why This Matters:
  - Without enforcement, interaction and layout decisions regress through untracked “quick” changes.
- Dependency:
  - None.
- Validation:
  - `plan.md` includes mandatory `Micro-Interaction Drift Prevention (Locked)` requirements.
  - `plan.md` now rejects stale Bubble/hash execution instructions and keeps Browser Mod as active popup path.

#### FL-028
- Status: `PARTIAL`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-LAY-001`
  - `REQ-SEC-001`
  - `REQ-SEC-002`
  - `REQ-SEC-003`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `plan.md`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Sections layout is not yet fully managed through a breakpoint-aware composition system; view/section/card sizing decisions still drift by local edits.
  - Prior guidance mixed a 12-column mental model with incomplete runtime interpretation of Sections page-column behavior.
- Exact Fix:
  - Define and enforce a layout matrix covering:
    - page/view width policy
    - section span strategy
    - card span behavior
    across phone/tablet/desktop.
  - Ground matrix rules in current HA controls (`max_columns`, `dense_section_placement`, `column_span`, `row_span`, `grid_options` / `getGridOptions()`).
- Why This Matters:
  - Correct Sections usage is foundational; card polish is wasted if responsive composition is unstable.
- Dependency:
  - FL-027 control gate enforcement.
- Validation:
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md` now contains the explicit 3-layer control model and tuning order.
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` now applies the model:
    - explicit `max_columns: 4` + `dense_section_placement: false` for all sections views
    - normalized overview span semantics (`4/3/1`)
    - one concrete subview composition example (`living-room` split `3/1`)
  - Overview + one room subview still need live matrix checks at phone/tablet/desktop compositions before item can be marked `DONE`.

#### FL-029
- Status: `PARTIAL`
- Severity: `MEDIUM-HIGH`
- Requirement Alignment:
  - `REQ-LAY-002`
  - `REQ-SEC-002`
  - `REQ-SEC-003`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/` (cards with `getGridOptions()`)
- Problem:
  - Card-level hard `max_columns` caps are broadly applied, constraining proportional responsiveness.
- Exact Fix:
  - Remove hard `max_columns` defaults from card `getGridOptions()` and treat any future hard cap as a documented exception.
- Why This Matters:
  - Broad hard caps fight Sections-native layout and force avoidable breakpoint compromises.
- Dependency:
  - FL-028 layout matrix decisions.
- Validation:
  - `sections_layout_matrix.md` explicitly locks default card hints to `{ columns, min_columns }`.
  - `tunet_scenes_card.js` no longer emits `max_columns` in `getGridOptions()`.
  - Remaining card audit for `max_columns` exceptions stays open until full suite verification is complete.

#### FL-030
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-INT-001`
  - `REQ-POP-001`
  - `REQ-UX-001`
  - `REQ-UX-002`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Room tile interaction behavior was inconsistent across docs/config/code (legacy tap-toggle language vs route-first behavior).
- Exact Fix:
  - Lock and implement route-first body tap with explicit control-owned toggles; keep popup as optional secondary behavior using browser-scoped `fire-dom-event` where configured.
- Why This Matters:
  - Room interaction is a primary daily-use surface and must be predictable across all Tunet pages.
- Dependency:
  - FL-022 popup direction lock.
- Validation:
  - Room body tap routes consistently; explicit controls toggle consistently; popup opens on hold only where configured.

#### FL-031
- Status: `PARTIAL (CODE-DONE / HA-VERIFY)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Status mode dropdown could appear beneath nearby tiles and selection was not reliably applied across `input_select`/`select` domains.
- Exact Fix:
  - Keep dropdown surfaces above sibling tiles (`dropdown-open` z-index behavior).
  - Allow dropdown menus to escape card/grid bounds by forcing status card overflow visibility.
  - Use async service selection with `input_select.select_option` primary and `select.select_option` fallback.
- Why This Matters:
  - Mode selection is a primary global control in the overview status surface and must be visually reliable and deterministic.
- Dependency:
  - None.
- Validation:
  - Open overview status mode dropdown and confirm menu overlays adjacent tiles.
  - Select each option and confirm entity state transitions in HA.
  - Confirm no dropdown clipping at row edges on mobile and desktop.

#### FL-032
- Status: `PARTIAL (CODE-DONE / HA-VERIFY)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- Problem:
  - Drag-enabled tile surfaces were stealing touch gestures on iOS/WKWebView (`touch-action: none` + mixed pointer handling), causing vertical page scroll stalls and interaction jitter.
- Exact Fix:
  - Add shared axis-lock utility (`createAxisLockedDrag`) with:
    - deadzone + axis-bias gesture intent detection
    - vertical/ambiguous gesture passthrough (no drag lock)
    - horizontal drag lock with conditional `preventDefault()`
  - Switch high-impact tile surfaces to `touch-action: pan-y`.
  - Refactor lighting/light-tile/speaker-grid drag paths to use the shared helper.
- Why This Matters:
  - Scroll starvation on primary interaction surfaces is a core usability failure on mobile and blocks reliable one-touch control.
- Dependency:
  - None.
- Validation:
  - On iOS phone, vertical swipe beginning on any lighting/speaker tile scrolls the page.
  - Horizontal drag still updates brightness/volume controls.
  - Long-press/tap behavior remains intact on refactored tiles.
  - `node --check` passes for all touched card modules.

### Performance And Update Behavior

#### FL-014
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
- Problem:
  - Speaker discovery is cached and never deliberately invalidated when entity topology changes.
- Exact Fix:
  - Invalidate `_cachedSpeakers` when relevant media-player or Sonos group entities change.
- Why This Matters:
  - Frontend state should reflect group membership changes without requiring a full reload.
- Dependency:
  - None.
- Validation:
  - Add/remove a speaker from a Sonos group and confirm the card reflects it without a full browser refresh.

#### FL-015
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Problem:
  - Cards scan the entire HA state registry for adaptive-lighting switches more often than necessary.
- Exact Fix:
  - Precompute the adaptive-lighting switch set once per update cycle and reuse it instead of re-scanning `Object.keys(hass.states)` inside repeated paths.
- Why This Matters:
  - It is avoidable work and will scale poorly on larger HA installs.
- Dependency:
  - None.
- Validation:
  - Code path no longer performs repeated full-registry scans during ordinary updates.

### Documentation And Architecture Consistency

#### FL-016
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Docs/dashboard_navigation_research.md`
- Problem:
  - The research doc is still valuable but it does not describe the current POC implementation accurately.
- Exact Fix:
  - Add a clear header that the file is historical/comparative research.
  - Point readers to `plan.md` and `FIX_LEDGER.md` for the current implementation state.
- Why This Matters:
  - Future contributors must not mistake the research document for the current architecture contract.
- Dependency:
  - None.
- Validation:
  - The document clearly identifies itself as historical and redirects to the current plan.

#### FL-017
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The repo still has entity inventory drift across active, overview, and test dashboards.
- Exact Fix:
  - Choose one canonical entity inventory and normalize the dashboards against it.
  - If a file is intentionally legacy, label it clearly at the top of the file.
- Why This Matters:
  - Three different YAMLs with different entity truth is a guaranteed debugging trap.
- Dependency:
  - FL-003 and any live HA entity audit outcomes.
- Validation:
  - Cross-file search shows consistent room inventories or explicit legacy disclaimers.

### Config Editor Reality Check

#### FL-018
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - The suite contains `getConfigForm()` usage, but nested-array editing is not fully solved and runtime verification in HA UI is still incomplete.
- Exact Fix:
  - Split cards into two classes:
    - simple-editor cards: keep `getConfigForm()`
    - YAML-first cards: document complex fields as YAML-only until a proper `getConfigElement()` investment is approved
  - Verify the actual HA UI behavior on 2026.3.0b1 for at least one simple card and one complex card.
- Why This Matters:
  - The goal is truthful UX, not nominal editor support.
- Dependency:
  - Live HA UI verification.
- Validation:
  - A short matrix exists showing which cards are truly visual-editor friendly and which remain YAML-first.

#### FL-019
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA live dashboard configuration, not repo-only
- Problem:
  - Bug 4 is not fully closed until the real HA UI confirms editors work where expected.
- Exact Fix:
  - In HA UI, try “Add card” for:
    - `tunet-nav-card`
    - `tunet-weather-card`
    - `tunet-climate-card`
    - one complex nested-config card such as `tunet-rooms-card`
  - Record actual outcomes.
- Why This Matters:
  - The repo code can look correct while the editor path still fails in the real frontend.
- Dependency:
  - Resource cache bust and live HA test cycle.
- Validation:
  - A factual pass/fail matrix is written into `plan.md`.

### Legacy Dashboard Cleanup

#### FL-020
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA storage dashboards
- Problem:
  - Known-bad `sensor.aqi` references may still exist in storage dashboards even if repo YAMLs are clean.
- Exact Fix:
  - Search storage dashboards and remove or replace every `sensor.aqi` occurrence.
- Why This Matters:
  - The user still sees broken rows if legacy dashboards continue to reference dead entities.
- Dependency:
  - Live HA access.
- Validation:
  - Storage dashboard search returns zero hits for `sensor.aqi`.

### Superseded Assumptions Register

These are not active defects by themselves. They exist to stop future work from silently reusing displaced assumptions.

#### SA-001
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Bubble/hash popup POC behavior is still an acceptable near-term default popup path for Tunet.
- Replaced By:
  - Browser Mod is the preferred next-popup direction, with one popup per room and iOS-grade presentation.
- Why It Matters:
  - This assumption can still leak back in from historical phase text and old POC material.
- Do Not Use For:
  - choosing the next popup platform
  - defining the next popup tranche
- Still Reusable For:
  - harvesting small implementation details from historical POC work

#### SA-002
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Home layout can keep being refined before nav, popup, and integrated UI / UX are decided.
- Replaced By:
  - The product-decision order is locked: nav, popup, integrated UI / UX, home layout.
- Why It Matters:
  - This was the main source of layout-first drift on the branch.
- Do Not Use For:
  - selecting the next major tranche
  - treating overview composition as the current top priority
- Still Reusable For:
  - critiquing what is structurally wrong with the current overview

#### SA-003
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Implemented in repo or deployed to HA means a product surface is effectively done.
- Replaced By:
  - Repo state, live HA state, and product state must be tracked separately.
- Why It Matters:
  - This project is design-led and daily-use quality matters as much as code existence.
- Do Not Use For:
  - claiming nav, popup, or home layout are product-complete because code exists
- Still Reusable For:
  - rollout tracking and operational validation

### Product-Direction Decisions

These are not defects. They are architecture or design decisions that still need explicit handling.

#### FL-021
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - Architecture-level
- Problem:
  - Comparison strategy is still unresolved:
    - switch resources in-place
    - or register separate card tags such as `tunet-status-card-next`
- Exact Fix:
  - Decide whether this project needs true side-by-side comparison or staged-root comparison is enough.
- Why This Matters:
  - It affects deployment complexity, rollback simplicity, and QA repeatability.
- Dependency:
  - Human product/QA decision.
- Validation:
  - Decision recorded in `plan.md`.

#### FL-022
- Status: `DONE / DIRECTION LOCKED`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - Architecture-level
- Problem:
  - Older planning and POC material treated popup standardization as unresolved and preserved Bubble/hash popup language as if it were still an active product path.
- Exact Fix:
  - Lock the popup direction for the next tranche as:
    - one popup per room
    - Browser Mod preferred
    - iOS-grade sheet / overlay quality
    - quick actions + one primary interaction surface + route to deeper room view
  - Treat Bubble/hash popups as historical POC material unless explicitly re-approved.
- Why This Matters:
  - Popup behavior is a product-surface decision, not an implementation detail. Leaving the standard ambiguous allows future runs to drift back into brittle or lower-quality overlay behavior.
- Dependency:
  - None. The direction is already locked in the higher-precedence control docs.
- Validation:
  - `plan.md`, `FIX_LEDGER.md`, and `nav_popup_ux_direction.md` all agree that Browser Mod is the preferred next-popup direction.
  - Active phase execution text no longer contains Bubble/hash popup instructions.

#### FL-023
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - `tile_size` and richer per-card sizing knobs were useful in older cards, but the current strategy favors native sections auto-height.
- Exact Fix:
  - Decide whether V2 cards should preserve these knobs for card-internal density only, or remove them when they mislead users into expecting full layout control.
- Why This Matters:
  - This affects the boundary between card design and HA layout behavior.
- Dependency:
  - Human design decision.
- Validation:
  - Decision recorded and the cards/docs agree.

#### FL-024
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - All V2 cards with `getGridOptions()`
- Problem:
  - There is still a policy question around how broadly `columns: "full"` should be used.
- Exact Fix:
  - Decide the default rule:
    - chrome cards and full-width hero surfaces may use `columns: "full"`
    - most content cards should stay on numeric widths in multiples of 3
- Why This Matters:
  - This is the core sections-layout policy and needs to be explicit to avoid future churn.
- Dependency:
  - Human architecture decision.
- Validation:
  - `plan.md` contains the explicit rule and the code follows it.

## Recommended Remediation Order

This order applies to active remediation items only. It does **not** imply that Product-Direction Decisions should be executed like bug tickets.

1. G0 closeout decisions + control-doc sync lock (`T-011A.8`)
2. G1 base primitives (`tunet_base.js`) and unit checks
3. FL-038 (surface-by-surface orchestration lock)
4. FL-001, FL-002, FL-003, FL-004, FL-005, FL-006
5. FL-007, FL-008, FL-009, FL-010, FL-025, FL-026
6. FL-019, FL-020
7. FL-011, FL-012, FL-013, FL-014, FL-015
8. FL-016, FL-017

## Product-Direction Decision Set

These items should be handled through tranche planning and explicit user decisions, not silently consumed through remediation order:

1. FL-021
2. FL-022
3. FL-023
4. FL-024

## “Done” Standard For This Project

An item is only actually done when all of the following are true:

- Repo code or repo docs are updated.
- If HA deployment is needed, the change is deployed.
- Resources are cache-busted if frontend JS changed.
- The validation step in this ledger is completed.
- `plan.md` no longer contradicts the repo state.

### FL-033
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-UX-003`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Home status compact tiles were difficult to read and visually inconsistent.
- Exact Fix:
  - Increased compact icon/value/label typography and normalized tile min-height using `--tile-row-h` in `Dashboard/Tunet/Cards/v2/tunet_status_card.js`.
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Live verify readability on phone/tablet.

### FL-034
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-DONE-001`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Home status dropdown could render under adjacent cards.
- Exact Fix:
  - Added host-level dropdown stacking context (`:host(.dd-open)`) and open/close host class toggling in `Dashboard/Tunet/Cards/v2/tunet_status_card.js`.
- Validation:
  - Open adaptive mode dropdown in dense grid with cards above/below; ensure menu remains visible/selectable.

### FL-035
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-SEC-001`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Rooms row/slim mobile controls were undersized.
- Exact Fix:
  - Increased row/slim icon/button/orb dimensions and spacing in `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`.
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - Live verify row/slim tap targets on mobile.

### FL-036
- Status: `DOC-DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-003`, `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Weather card requires refactor plan before code changes.
- Exact Fix:
  - Added `Dashboard/Tunet/Docs/weather_card_refactor_plan.md` with mode matrix, data-source normalization, density strategy, and acceptance checklist.

### FL-037
- Status: `DOC-DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-003`, `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Brightness alignment regression required concrete RCA.
- Exact Fix:
  - Added `Dashboard/Tunet/Docs/brightness_alignment_rca.md` with repro, root causes, options A/B, and recommended option.

### FL-038
- Status: `OPEN (QUEUED AFTER G1)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-LAY-001`
  - `REQ-SEC-001`
  - `REQ-SURF-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Surface orchestration is not yet locked one page at a time; work has drifted across multiple pages without a single active surface gate.
- Exact Fix:
  - Execute the mandatory one-surface loop and record decisions in control docs:
    1. Living Room page
    2. Living Room popup
    3. Overview
    4. Media
    5. Remaining room pages
  - For each surface, capture:
    - page intent (`hero` / `companion` / `support`)
    - interaction contract
    - page-level controls (`max_columns`, `dense_section_placement`)
    - section-level composition (`column_span`, `row_span`)
    - card-level placement (`grid_options`)
    - breakpoint validation checklist (`390x844`, `768x1024`, `1024x1366`, `1440x900`)
- Why This Matters:
  - Without a locked per-surface sequence, layout and interaction decisions continue to regress through cross-surface partial edits.
- Dependency:
  - FL-028 matrix baseline remains prerequisite context.
- Validation:
  - `plan.md`, `handoff.md`, and `sections_layout_matrix.md` all show the same active one-surface queue and lock criteria.
  - At least Surface 1 (Living Room page) is marked locked with documented breakpoint outcomes before Surface 2 begins.
## Session Delta (2026-04-06, CD9 subpass — Audio Target Model + Sonos Dropdown Convergence)

Change marker: media/sonos semantics + dropdown convergence landed; `CD9` remains active on visible speaker-tile semantics and speaker-grid dense/default

- `CHOSEN INTERPRETATION`
  - sonos source selector should be replaced with the media dropdown shell `1:1`
  - suite audio controls should follow the currently selected target:
    - selected individual speaker => speaker-only volume
    - selected grouped coordinator/current leader => proportional group volume
  - compact/default speaker naming can be aggressively short as long as room identity survives
- `IMPLEMENTATION`
  - `tunet_base.js`
    - added shared `compactSpeakerName()` for room-preserving compact audio labels
  - `tunet_media_card.js`
    - selected-target volume routing now replaces the old selected-speaker-only group-volume behavior
    - grouped coordinator selection now surfaces group icon/title state
    - volume view now auto-exits after `5s` of inactivity
    - default speaker labels now compact aggressively, including long explicit names
  - `tunet_sonos_card.js`
    - source selector shell replaced with the media dropdown model
    - dropdown rows now use media-style structure, compact labels, per-row group badges, and `Group All` / `Ungroup All` actions
    - volume overlay now follows the selected target and auto-exits after `5s` of inactivity
    - displayed source/speaker labels now compact even when the authored name is long
  - `audio_cd9_bespoke.test.js`
    - new coverage for compact naming, selected-target volume routing, auto-exit behavior, sonos dropdown parity, and explicit-name compaction
- `TESTS / VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_media_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
  - `audio_cd9_bespoke.test.js`: `9/9`
  - full suite previously green: `608/608`
  - `npm run tunet:build`
  - `npm run tunet:deploy:lab` passed; live resources synced to `?v=build_20260406_032113Z`
  - screenshot manifests:
    - `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/review-manifest.json`
    - `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/review-manifest.json`
  - key evidence:
    - `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-media-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/390x844/light/rehab/lab/cards/tunet-sonos-card__01.png`
    - `/tmp/tunet-playwright-review/2026-04-06T03-21-27-742Z/390x844/light/rehab/lab/cards/tunet-sonos-card__02.png`
    - `/tmp/tunet-playwright-review/2026-04-06T03-12-03-934Z/1440x900/light/rehab/lab/cards/tunet-sonos-card__01.png`
- `RESULT`
  - media and sonos now share the selected-target volume model
  - sonos default/autodiscovered source/dropdown width handling is no longer the broad runtime failure previously recorded
  - remaining `CD9` runtime backlog narrows to visible speaker-tile semantics and speaker-grid dense/default layouts
  - explicit long-name sonos variants now compact in the displayed label lane instead of overflowing the header
## Session Delta (2026-04-06, TI2 closeout — Inbox Card Live Proof Completed)

Change marker: the governed inbox card/surface tranche is no longer merely implemented; it is live-proven and should not remain marked active

- `CHOSEN INTERPRETATION`
  - close the branch-local exception tranche explicitly
  - keep the root Tunet program on `CD9`
  - record the live operational finding that a brand-new YAML dashboard registration required a full HA restart for first activation
- `RESULT`
  - `TI2` is closed
  - the rehab and standalone inbox surfaces are live-proven
  - follow-up inbox card fixes are bugfixes inside the branch, not an active tranche by default

## Session Delta (2026-04-30, post-CD5 — Scroll-container hover-clip closed across 4 cards)

Change marker: a single CSS-spec gotcha (overflow-x:auto coercing overflow-y to auto, clipping hover-lift shadows vertically) was hit in the actions card on 2026-04-29; same shape was then found and fixed in scenes, lighting, sonos on 2026-04-30, and codified as a contract.

- `IMPLEMENTED`
  - `Dashboard/Tunet/Cards/v3/tunet_actions_card.js` — `.actions-row` now has `padding-block: 0.5em; margin-block: -0.5em`; wrap variant resets to 0 (shipped 2026-04-29)
  - `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js` — `.scene-row` and `.scene-row.wrap` apply the same recipe
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` — `:host([layout="scroll"]) .light-grid` replaces solo `padding-bottom: 8px` with `padding-block: 0.5em; margin-block: -0.5em`; `:host([use-profiles])` `padding-top` raised from `0.4em` to `0.5em` so the cascade does not shrink the lift-clear room
  - `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js` — `.speakers-scroll` restructured to `padding-block: 0.5em; padding-inline: 4px; margin-block: -0.5em; margin-inline: -4px`
  - `Dashboard/Tunet/Cards/v3/CLAUDE.md` — Guardrails section gains the rule and cross-references to ledger and contract test
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` §1 — `Closed [post-CD5]` entry recording symptom, root cause, recipe, deploy version
  - `Dashboard/Tunet/Cards/v3/tests/interaction_source_contract.test.js` — new `§Surface composition — overflow vs hover-lift` describe block, 13 new tests across CD2 cards plus actions-specific positive/exception cases
  - `Dashboard/Tunet/Docs/plans/cross_card_spec_layer_extraction_plan.md` (NEW, DEFERRED) — candidate-shape plan for CC1–CC4 cross-card consistency passes (corner system, type/icon scale, surface composition rules, hover/press migration completion)
- `TESTS / VALIDATION`
  - `npm test`: `655/655` (`+13` from prior `642`)
  - `npm run tunet:build` clean; `npm run tunet:deploy:lab` synced lab resources to `?v=build_20260430_161315Z`
  - live screenshots at 1440×900 confirm scenes/lighting/sonos hover lift now paints without vertical clipping
  - layout-neutrality verified: tile heights and adjacent siblings unchanged in actions/sonos; lighting computed padding is 7px because the card's `:host` font-size is not anchored to 16px (em-anchor follow-up is unrelated, tracked separately)
- `RESULT`
  - the hover-clip class of bug is closed across the four CD2 cards that have horizontal-scroll containers with lift-bearing descendants
  - contract test guarantees no future card can introduce the same defect silently
  - the candidate spec-layer plan is filed; it does NOT activate a new tranche; `CD9` remains the only active execution program
