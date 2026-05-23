# Tunet Backlog Closure — 2026-05-23

**Owner**: Mac, executed via fresh-chat phases through `/claude-mem:do` or direct execution.
**Tranche tag**: β-plumbing + δ-polish + CD11 continuation
**Source backlog**: `Dashboard/Tunet/Docs/visual_defect_ledger.md` lines 78-124 + production-visible weather defects.
**Plan created**: 2026-05-23 after the deploy + visual review rationalization tranche shipped (10 commits on origin/main).

## Intent

Close ALL open interaction, UI, design, and quality-of-life gaps in the Tranche-Owned Open Backlog, including the production-visible weather defects (AAAAAA placeholder + compressed temperature strip). Each phase is self-contained for fresh-chat execution and produces an evidence-bound DoD before commit.

This is NOT a single-card bespoke pass; it's a coordinated multi-card hardening run that respects:
- the new M1 contract (production-mirror capture + HA push notify for iterative review)
- the scoped-vs-root governance principle (scoped contract owns details, root carries narrative)
- the architecture-first rule (this plan is plumbing/polish, not page-architecture work)

## Phase 0: Discovery (already complete)

Discovery was performed by four parallel Explore subagents 2026-05-23. Key findings:

- **PA01 Bug A is ALREADY resolved in working-tree state** but may not be committed. `tunet_base.js:1100-1133` documents the fix in a comment block dated 2026-05-23 with the redundant `.card { border }` already removed. All 11 CARD_SURFACE consumers verified — no border re-introduction. Phase 1 verifies + commits if uncommitted.
- **CD5 actions mode_strip is ALREADY resolved** with wrap behavior and test coverage in `utility_strip_bespoke.test.js`. Phase 1 verifies + formally closes in the ledger.
- **CD10 nav rail/sidebar conflict is intentionally DEFERRED** per project CLAUDE.md and Mac's standing direction. Out of scope.
- **`synthetic-dazzling-oasis.md` (active CD11 detailed plan) does NOT exist on filesystem** despite governance referencing it. Phase 8 includes "create or relocate."
- **Weather AAAAAA placeholder** root cause hypothesis: Material Symbols ligature renders as raw text when font hasn't loaded (no fallback in `_renderForecast` line 718).
- **Weather compressed temps** root cause hypothesis: `--forecast-cols` set to `points.length` at line 696; when 7+ points render in 5-column visible window on mobile, tiles compress horizontally; `.forecast-temps` flex-column doesn't help when tile width is too narrow.
- **`escapeHtml` exists at `tunet_inbox_card.js:399-406`** and is correctly used throughout inbox. Should be promoted to `tunet_base.js` and consumed by 6 other cards (actions, status, rooms, light_tile, lighting, sensor). `tunet_alarm_card.js:706-712` has its own escapeHtml; consolidate.
- **Existing tests are smoke-only** per `visual_defect_ledger.md:34`. New phases must include failure-first tests for: async subscription teardown, pointer slide-off/capture, debounce flush/cancel, config-derived HTML escaping, selected-target/coordinator divergence.

Phase 0 outputs (cited inline below):
- discovery report A: status + inbox + alarm clusters
- discovery report B: media + weather + sonos cluster
- discovery report C: cross-card markup safety + Bug A
- discovery report D: governance + infrastructure context

## Scope contract (required reading every phase)

Each phase below is self-contained for fresh-chat execution. Required reads before starting any phase:

1. `/home/mac/HA/implementation_10/CLAUDE.md` — Working Relationship Frame + M1-M7 contract
2. `/home/mac/HA/implementation_10/Dashboard/Tunet/AGENTS.md` §6A — Codex variant of M1-M7
3. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_defect_ledger.md` lines 78-124 — the canonical backlog text
4. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md` — per-card config contract
5. `/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/deploy_workflow_canary.md` — workflow + M1 reminder
6. `/home/mac/HA/implementation_10/Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` — production target (tunet-overview)
7. `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md` — WHY behind M-rules
8. `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_tunet_dashboard_inventory.md` — canonical production URL

## Out of scope

- **CD12 surface orchestration** (Living Room page, popup, Overview composition) — gated on architecture-first sub-plan, separate tranche.
- **CD10 nav rail/sidebar conflict** — intentionally deferred per project CLAUDE.md.
- **OAL unified timer notification** — separate OAL package work, not Tunet.
- **CD12 alarm settings page + notification response page** — CD12 surface composition, separate tranche.
- **Bubble Card 3.2 popup architecture decision for media** — PA07 architectural decision, requires its own sub-plan with Mac's review. Plan only the IMPLEMENTATION primitives needed once the decision lands.
- **Missing HACS deps** that block `tunet-suite/overview` rendering — separate HA-side cleanup (Mac fixed mini-graph; rest pending).

## Phase ordering rationale

1. **Phase 1** clears underbrush: Bug A + CD5 verifications + ledger closures so subsequent screenshot reviews aren't muddied by already-fixed defects.
2. **Phase 2** addresses production-visible weather defects (AAAAAA + compressed temps) — highest user impact, blocks confidence in production-mirror captures.
3. **Phases 3-7** are independent per-card hardening tranches that can be parallelized in execution if desired (different files). Each includes its card's markup-safety pass folded in.
4. **Phases 8-9** are CD11 continuation — biggest scope, most visible, depends on cleaner state from prior phases.
5. **Phase 10** is the markup-safety sweep for cards NOT touched by prior phases (actions, lighting, light_tile, rooms, sensor).
6. **Phase 11** is governance sync + canary update.

Production-mirror capture is the gating evidence for every phase that touches a production-flagged card (currently only `tunet-overview` is production). Lab-only capture is M1-banned.

---

## Phase 1: Bug A + CD5 verification + ledger closures

**Goal**: Verify pre-existing fixes are committed; formally close in the ledger so subsequent screenshot reviews start from a known-good baseline.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_base.js:1100-1166`, `Dashboard/Tunet/Cards/v3/tunet_actions_card.js:175-485`, `Dashboard/Tunet/Docs/visual_defect_ledger.md:38-43, 81, 127-130`.

**Steps**:

1. **Verify Bug A committed state**:
   - `git log -p -S "Resolved Bug A" -- Dashboard/Tunet/Cards/v3/tunet_base.js` — does the comment block exist in a committed state?
   - If uncommitted: stage `tunet_base.js` + `tunet_base.js`-related surface tests, commit `fix(tunet): close Bug A double-corner outline by removing redundant .card border`.
   - If committed: confirm hash, skip to ledger step.

2. **Verify all 11 CARD_SURFACE consumers have NO `.card { border: ... }`**:
   - `grep -nE "^\\s*\\.card\\s*\\{[^}]*border" Dashboard/Tunet/Cards/v3/*.js` — should return 0 matches in `.card` selectors (matches in `.card-inner`, `.card-pill`, etc. are OK).
   - Document any exceptions found.

3. **Capture production-mirror evidence**:
   - `npm run tunet:review:production -- --breakpoint 390x844,1440x900 --theme light,dark --card tunet-rooms-card,tunet-actions-card --share-with-user`
   - Read each captured PNG into context (M1 mandate).
   - Confirm no double-outline visible on rooms section header or actions pills, light AND dark, at both breakpoints.

4. **Update `Dashboard/Tunet/Docs/visual_defect_ledger.md`**:
   - Move PA01 Bug A from "Open runtime defect" to "Resolved this session" with commit hash.
   - Move CD5 actions `mode_strip` chip overflow from open backlog (line 81) to closed; cite `utility_strip_bespoke.test.js:99-174` as the regression guard.

5. **M1 review block** for the verification screenshots before commit.

**Verification**:
- `grep -n "Bug A" Dashboard/Tunet/Docs/visual_defect_ledger.md` — appears under Resolved section.
- 4 production-mirror PNGs captured, read inline, no outline defects.
- Git log shows Bug A commit (new or existing) and CD5 closure commit.

**Commit**: 1-2 commits depending on uncommitted state. Scope:
- (a) `fix(tunet): close Bug A double-corner outline — .card border removed, ::before is sole edge` (only if uncommitted state requires)
- (b) `docs(tunet): mark Bug A + CD5 mode_strip overflow CLOSED in visual_defect_ledger`

**Out of scope this phase**: Any other card edits. This phase only closes the books on items that are already mechanically resolved.

---

## Phase 2: Weather production defects (AAAAAA + compressed temps)

**Goal**: Eliminate two user-visible defects in the production weather card: (a) AAAAAA placeholder text on precipitation sub-tile, (b) compressed temperature strip `38°36°35°34°34°33°32°`. Both visible at `/tunet-overview/overview` at mobile breakpoints.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_weather_card.js:566-849`, `Dashboard/Tunet/Cards/v3/tunet_base.js` font injection block (search `injectFonts`, `FONT_LINKS`, `__tunetFontsInjected`).

**Hypothesis to verify** (from Discovery Report B):

- **AAAAAA**: Material Symbols icon ligature renders as raw text when font not yet loaded. `_renderForecast()` line 718 emits `<span class="icon forecast-icon">${icon}</span>` where `${icon}` is the ligature string (e.g., `cloud`, `rainy`). When the font fails to load (or hasn't loaded by render time), the browser renders the ligature literal. Some Material Symbols ligature names contain duplicated character sequences that may resemble `AAAAAA` when the icon font's placeholder glyph is itself a repeating character. Check via DevTools / capture: does the AAAAAA appear in a span where an icon ligature is expected?
- **Compressed temps**: `_renderForecast()` line 696 sets `--forecast-cols` to `points.length`. If `points.length` is 7+ and the tile is rendered at 390px width, each tile becomes ~50px wide. `.forecast-temps` is `flex-direction: column` so hi and lo SHOULD stack vertically, but multiple sibling temps appearing on one row suggests the COLUMN layout isn't applying (possibly a multi-tile horizontal flex container wrapping incorrectly).

**Steps**:

1. **Live reconnaissance**:
   - Production-mirror capture without any code changes:
     `npm run tunet:review:production -- --breakpoint 390x844,768x1024 --theme light,dark --card tunet-weather-card --share-with-user`
   - Read the PNGs inline; confirm both defects reproduce on `/tunet-overview/overview` and which view path (overview/g5-test/card-rehab-lab).
   - Inspect captured DOM via Playwright trace OR a one-off probe script that prints the inner HTML of `.forecast-tile` elements. Confirm whether AAAAAA is inside an `.icon` span or somewhere else, and whether the compressed temps are in a single `.forecast-temps` block or sibling overflow.

2. **Root-cause for AAAAAA**:
   - If it's inside `.icon` span and font hasn't loaded: enforce font-ready before render. Use `await document.fonts.ready` in `_renderForecast()` (or guard with a fallback character class). Already exists in `waitForVisualReadiness` for capture, but the card itself doesn't gate render on font-ready.
   - If it's a placeholder string from a template literal: find where it's emitted and replace with proper data binding or remove.
   - **Fix candidate**: in `_renderForecast()`, wrap the icon span with a class that applies `visibility: hidden` until font has loaded via `:has()` or a JS-side check. Simpler: ensure `injectFonts()` (tunet_base.js) is called early in `connectedCallback()` so the font load is in-flight before first render.

3. **Root-cause for compressed temps**:
   - If `_renderForecast()` is emitting 7 forecast tiles in a 5-column grid: clamp `--forecast-cols` to a sane mobile max (4 or 5) and overflow the rest. OR introduce hourly scroll behavior.
   - If `flex-direction: column` isn't being applied (CSS specificity issue): inspect computed style via probe; if a parent rule overrides, fix the cascade.

4. **Implement fix**:
   - One or both root causes per the reconnaissance findings.
   - Touch `tunet_weather_card.js` only. Card-local CSS is appropriate; no `tunet_base.js` edits unless font injection ordering changes.

5. **Failure-first test**:
   - Add to `Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js`:
     - Test that `_renderForecast()` does NOT emit literal `AAAA` strings or any obvious placeholder in its output.
     - Test that with 7+ points the rendered forecast tiles have sane column count (≤ 5 visible at 390px, rest accessible via scroll or wrapped, NOT compressed onto single row).

6. **Production-mirror evidence**:
   - Re-capture against `/tunet-overview/overview` at 390x844 + 768x1024 light+dark.
   - Confirm both defects gone via inline image read-back.

7. **M1 review block**.

**Verification**:
- New tests pass.
- Re-captured PNGs show clean precipitation tile labels (no AAAAA) and properly stacked temps.
- M1 review block produced before commit with explicit defect inventory.

**Commit**: `fix(tunet): weather card production defects — AAAAAA placeholder + compressed temperature strip`. Reference the root cause(s) found in step 2-3.

**Out of scope this phase**: Weather subscription generation guard — that's Phase 3.

---

## Phase 3: Weather subscription generation guard

**Goal**: Close the async subscription race in `tunet_weather_card.js` where `_subscribeForecastType()` reads mutable `this._config.entity` after `await subscribeMessage`, allowing stale subscriptions to install if disconnect or entity change happens during the await window.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_weather_card.js:566-600` (`_subscribeForecast`, `_subscribeForecastType`).

**Pattern to copy**: Generation counter pattern. Each subscription pass increments a counter; the resolved-but-stale callback checks the counter against current generation before applying state. If stale, discard and immediately unsubscribe.

**Steps**:

1. Add `_forecastGeneration = 0` instance counter (initialize in constructor).

2. In `_subscribeForecast()`, increment generation BEFORE awaiting; capture the gen value locally; pass it to `_subscribeForecastType(type, gen)`.

3. In `_subscribeForecastType(type, gen)`:
   - After `await subscribeMessage` resolves: if `gen !== this._forecastGeneration` (became stale during the await), immediately call the returned `unsub()` and return without storing.
   - Otherwise store `this._forecastUnsub[type] = unsub` as today.
   - Inside the message callback: also check `gen === this._forecastGeneration` before applying `_forecastDaily` / `_forecastHourly`.

4. In `disconnectedCallback()` and entity-change paths: increment generation so any in-flight subscriptions become stale.

5. **Failure-first test** in `weather_bespoke.test.js`:
   - Mock `subscribeMessage` to delay; call `_subscribeForecast()`, then immediately call `disconnectedCallback()` before the mock resolves. Assert that no subscription is stored AND any forecast data that would have arrived is discarded.

6. Capture production-mirror at 390x844 to confirm no visible regression.

**Verification**:
- Test demonstrating the race window now closed.
- No visible regression on `/tunet-overview/overview` weather card.

**Commit**: `fix(tunet): weather forecast subscription generation-guarded against disconnect/entity-change races`.

---

## Phase 4: Inbox card hardening (TI2a/b/c)

**Goal**: Close three open inbox card defects:
- TI2a: `_dataReady` set before async subscription resolves (lifecycle race; stale subscription on rapid disconnect/reconnect)
- TI2b: action response buttons can issue duplicate `tunet_inbox.respond` on rapid double-click before pending render lands
- TI2c: `iconForAction()` strips `mdi:` and uses underscore alias keys while many MDI names are hyphenated — aliases miss, fallback renders raw material-symbol names

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_inbox_card.js:399-516, 597-690, 791-877`, `custom_components/tunet_inbox/Docs/execution_ledger.md` (for backend response contract).

**Pattern to copy**:
- **TI2a**: same generation-guard pattern as Phase 3 weather, OR `await _subscribeUpdated()` BEFORE setting `_dataReady = true`.
- **TI2b**: disable at handler entry (`if (this._rowPending.has(itemId)) return;` at start of `_respond`), not just at render time.
- **TI2c**: copy the `iconForItem` map-with-full-prefix strategy from `tunet_inbox_card.js:461-486` and apply to `iconForAction`. Alternatively: add a comprehensive alias lookup that handles both hyphen and underscore variants.

**Steps**:

1. **TI2a fix**: Reorder `_ensureData()` so `_subscribeUpdated()` awaits BEFORE `_dataReady = true`. Add generation counter if reconnect timing is complex.

2. **TI2b fix**: At the top of `_respond(itemId, actionId)`, check if `_rowPending.has(itemId)`; if yes, early-return. This forecloses the rapid double-click before DOM update.

3. **TI2c fix**: Refactor `iconForAction()` to use the `iconForItem` pattern — full `mdi:*` keys in the known-map, robust fallback chain, safe default. Handle both hyphen and underscore variants in any alias lookup.

4. **Markup safety pass on `tunet_inbox_card.js`**: already escapes correctly — verify no innerHTML interpolations lack `escapeHtml`. If escapeHtml is local to inbox, leave for now; Phase 10 will promote to base.

5. **Failure-first tests** in `Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`:
   - TI2a: connectedCallback → immediate disconnectedCallback → reconnect. Assert no stale subscription leaks.
   - TI2b: render an action button, fire pointerdown twice in <50ms. Assert exactly one `tunet_inbox.respond` service call.
   - TI2c: for an action with `icon: "mdi:lightbulb-alert"`, assert `iconForAction()` returns the mapped Material Symbol name (`lightbulb`), not raw `lightbulb-alert`.

6. **Production-mirror capture** of `/tunet-overview/overview` if inbox card is present; otherwise capture rehab lab inbox view.

7. **M1 review block** before commit.

**Verification**:
- 3 new failure-first tests passing.
- No visible regression in inbox rendering across rehab + production captures.

**Commit**: `fix(tunet): inbox card hardening — subscription lifecycle, double-submit guard, icon alias parity`.

---

## Phase 5: Alarm card hardening (PA04a/b/c)

**Goal**: Close three open alarm card defects:
- PA04a: row hold/tap pointer race — `_pendingEntity` remains down-row entity while pointerup only clears release row; sliding across rows can toggle wrong alarm or leave held style stale
- PA04b: hardcoded `enabled === 4` optimistic clear ignores configurable alarm count
- PA04c: `_buildRows()` lifecycle edge — can run before `_config.alarms` is initialized

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js:437-720`.

**Steps**:

1. **PA04a fix**: In `_onRowPointerDown(e)`, BEFORE setting the held flag on the target row, clear `dataset.held = 'false'` on ALL `_rowRefs[].el`. Also add a `pointermove` handler that reconciles: if the pointer moves outside the original row, clear held state and cancel hold timer (treat as cancellation). Use `setPointerCapture()` on pointerdown to ensure pointerup fires on the same element.

2. **PA04b fix**: Replace `enabled === 4` with `enabled === this._config.alarms.length` (or pre-compute `_alarmCount` once in setConfig).

3. **PA04c fix**: At top of `_buildRows()`, guard with `if (!Array.isArray(this._config?.alarms) || this._config.alarms.length === 0) return;`. Also: in the `hass` setter, only call `_buildRows()` if `setConfig()` produced a valid `_config` (check the `_needsConfig` flag from setConfig's placeholder path).

4. **Markup safety pass on `tunet_alarm_card.js`**: consolidate the local `escapeHtml` (lines 706-712) with the inbox version. If Phase 10 hasn't promoted to base yet, keep local for now but document.

5. **Failure-first tests** in `Dashboard/Tunet/Cards/v3/tests/alarm_bespoke.test.js`:
   - PA04a: simulate pointerdown on row A, pointermove to row B, pointerup on row B. Assert: row A held cleared, no toggle fired on row A. Then a second test: pointerdown A, pointerup A (no movement) toggles A.
   - PA04b: configure 2 alarms, simulate both enabled. Assert optimistic All On clears within the expected condition (not the 8s timeout).
   - PA04c: call hass setter with `_config = { _needsConfig: true }`; assert `_buildRows()` is no-op (does not throw).

6. **Production-mirror capture** of alarm card — only if it appears in `tunet-overview` views; otherwise capture rehab `lab` view. (Probably alarm-card isn't in production overview; lab capture is the right evidence.)

7. **M1 review block** before commit.

**Verification**:
- 3 new tests passing.
- No regression in alarm card rehab capture.

**Commit**: `fix(tunet): alarm card hardening — pointer slide reconciliation, configurable count, lifecycle guard`.

---

## Phase 6: Media card hardening (PA07 follow-on + δ-polish)

**Goal**: Close three open media card defects:
- Selected-target/coordinator divergence in progress display (`_updateMedia` reads `_transportTarget`, `_updateProgress` reads `_coordinator`)
- Transport FF/RW buttons rejected by Sonos+Spotify (per M5, owned defect not "third-party limitation")
- Volume slider pending debounce not flushed/canceled on pointerup/pointercancel

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_media_card.js:780-820, 920-1010, 1335-1361`, `custom_components/tunet_inbox/Docs` for Sonos/Spotify integration context if relevant.

**Note on architecture decision**: Bubble Card 3.2 popup redesign for media is PA07 architectural decision — NOT in this phase. This phase fixes the THREE primitives that exist today regardless of popup redesign direction.

**Steps**:

1. **Progress/coordinator alignment**: In `_updateProgress()` line 1335, replace `this._coordinator` with `this._transportTarget` (or whichever entity matches `_updateMedia()`'s track-info source). Add a helper `_progressTarget()` that returns the same entity `_updateMedia` reads from. This unifies the data source so title+progress always belong to the same entity.

2. **Transport FF/RW Sonos+Spotify**: 
   - Discovery step inside this phase: probe live HA for the Sonos+Spotify case. Confirm `media_player.media_previous_track` rejects via `ha_call_service` with `return_response=True` against a Sonos-grouped Spotify-source state.
   - Resolution candidate A: source-aware fallback in `_callTransport`. Check if `_transportTarget` is a Sonos entity AND current source is Spotify; if yes, use Sonos-specific service path (e.g., `script.sonos_skip_track` if it exists, OR Sonos integration's `sonos.snapshot`/`sonos.restore` combo, OR a custom HA script Mac adds for this).
   - Resolution candidate B: wrap transport in `script.*` actions that handle source-aware routing inside HA, not the card. This requires Mac to add the HA scripts. Card calls `script.tunet_media_prev_track` etc.
   - **Decision required from Mac** — flag in the phase output: "do you prefer A (card-side fallback) or B (HA-script-side routing)?"
   - Implement whichever Mac picks. M5 mandate: do not document as third-party limitation.

3. **Volume debounce flush**: In media card pointerup AND pointercancel handlers (lines 998-1009 area):
   - Before clearing `dragging` state, immediately fire the pending debounce: `if (this._volDebounce) { clearTimeout(this._volDebounce); /* call the service immediately with the latest pct */ }`.
   - OR cancel + emit final value depending on whether the slider released at the same value as the last debounce target.

4. **Markup safety pass on `tunet_media_card.js`**: Audit any `innerHTML =` interpolations of entity-derived strings (track title, artist, etc.). Apply `escapeHtml` (local or imported from base after Phase 10).

5. **Failure-first tests** in `Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` (extend existing):
   - Progress/coordinator alignment: with a coordinator state and a different selected-speaker state, assert progress + title both come from the same entity reference.
   - Volume debounce flush: drag slider, fire pointerup, assert that the service call is fired immediately (within next tick) instead of waiting for the 200ms debounce.
   - Transport: depends on which resolution Mac picks; test the chosen primitive.

6. **Production-mirror + live verification**:
   - Production-mirror capture of media card on `/tunet-overview/overview` if present.
   - Live test the transport buttons with Mac's confirmation (HA push notify after capture, Mac confirms FF/RW work on his iPhone).

7. **M1 review block** before commit.

**Verification**:
- All three defects fixed with test coverage.
- Mac confirms transport buttons work via live device test.

**Commit**: `fix(tunet): media card — progress/target alignment, transport source-aware fallback, volume debounce flush on release`.

**Out of scope this phase**: Bubble Card 3.2 popup architecture, sonos card volume debounce (Phase 7).

---

## Phase 7: Sonos card hardening (volume debounce flush)

**Goal**: Close the same volume-debounce-flush defect in `tunet_sonos_card.js` that Phase 6 addresses for media.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js:1170-1180, 1400-1545`.

**Steps**:

1. **Volume debounce flush**: mirror Phase 6 step 3 in `tunet_sonos_card.js` pointerup + pointercancel handlers (lines 1174, 1404 area). Consider extracting the debounce-flush pattern into a shared helper in `tunet_base.js` if Phase 6 reveals duplication worth consolidating.

2. **Markup safety pass on `tunet_sonos_card.js`**: audit innerHTML usage.

3. **Failure-first test** in `audio_cd9_bespoke.test.js`:
   - Sonos volume drag → pointerup → service call fires immediately.

4. **Production-mirror capture** if sonos card appears in `/tunet-overview/overview`.

5. **M1 review block**.

**Verification**:
- Test passing.
- No regression in sonos card capture.

**Commit**: `fix(tunet): sonos card — volume debounce flush on pointer release`.

---

## Phase 8: CD11b — Status card home_detail + alarms variant

**Goal**: Land the `home_detail` and `alarms` variants of `tunet-status-card`, completing the second of three CD11 sub-tranches per the existing CD11 plan.

**Required reading**: scope contract above, plus:
- `Dashboard/Tunet/Cards/v3/tunet_status_card.js` (full file — large)
- `Dashboard/Tunet/Docs/cards_reference.md` (status card section)
- `~/.claude/plans/synthetic-dazzling-oasis.md` if it exists — **PRE-FLIGHT CHECK**: verify this file exists. If not, this is a governance gap: either Mac has the plan elsewhere, or it needs to be created from the visual_defect_ledger CD11 section + status_bespoke.test.js + discovery report A. Ask Mac before proceeding.

**Constraint (NON-NEGOTIABLE)**: phone summary 4×2 matrix per the visual_defect_ledger backlog row. Do not "solve" later work by defaulting to 2 columns or making tiles taller.

**Steps**:

1. **Pre-flight**: confirm `synthetic-dazzling-oasis.md` either exists OR is replaced by an inline CD11b spec Mac approves. If neither, STOP and ask.

2. **Implement `home_detail` variant**:
   - Build mode dispatch from the existing `home_summary` + `custom` framework (already landed in CD11a, see status_card.js lines around 174-396, 513-520, 2238-2258).
   - Use `recipe_tiles` authoring; `home_detail` is the verbose/expanded counterpart of `home_summary`.
   - Tile selection should NOT use the 8-slot limit; allow more tiles or pagination.
   - Visual design must respect locked design language (review `Dashboard/Tunet/Mockups/design_language.md`).

3. **Implement `alarms` variant**:
   - Status-card variant that surfaces upcoming alarms with quick-action affordances.
   - Reuse the same recipe/tile primitives.
   - Cross-reference `tunet_alarm_card.js` for the alarm data source contract.

4. **Markup safety pass on `tunet_status_card.js`**: apply `escapeHtml` to all entity/config-derived innerHTML interpolations (line 2701, 2734, 2743, 2751, 2771 per discovery report A).

5. **Failure-first tests** in `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`:
   - `home_detail` mode renders without errors and respects mode contract.
   - `alarms` mode surfaces alarm entities correctly.
   - Markup safety: render with config containing `<script>` tags; assert no actual `<script>` in output.

6. **Production-mirror capture**:
   - `/tunet-overview/overview` and any other production view containing status card.
   - 390x844 + 1440x900 light + dark.
   - HA push notify; Mac grades.

7. **M1 review block** before commit.

**Verification**:
- Tests passing.
- Mac confirms variants render correctly on iPhone after HA push notify deep-links to `/tunet-overview/overview`.

**Commit**: `feat(tunet): CD11b — status card home_detail + alarms variants + markup safety pass`.

---

## Phase 9: CD11c — Status card room_row + info_only + polish

**Goal**: Land the final CD11 sub-tranche: `room_row` + `info_only` variants plus polish on the landed `home_summary` + `custom`.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Cards/v3/tunet_status_card.js`, the CD11c gating notes in `visual_defect_ledger.md:53-56`.

**Note**: PA09 (Info page) is partially gated on PA11's `info_only` mode per visual_defect_ledger.md:56. Closing CD11c unblocks PA09.

**Steps**:

1. **Implement `room_row` variant**: status tile row that summarizes a room's status (lights on, climate, occupancy). Visual_defect_ledger.md:55 references existing E1 defects: "Stat", "Humidi" label clipping at 5-tile width. Solve via responsive label truncation or icon-only at narrow widths.

2. **Implement `info_only` variant**: read-only status display without interactive controls. Used for the Info page (PA09).

3. **Polish landed variants** (`home_summary` + `custom`):
   - Address E1 (room_row label clipping in home_summary if present)
   - Address E2 (home_summary weather "Partly Cloudy" wraps badly per visual_defect_ledger.md:55)
   - Any other polish surfaced by the production captures from Phase 8.

4. **Failure-first tests** in `status_bespoke.test.js`:
   - `room_row` and `info_only` mode contracts.
   - Label truncation at narrow widths (deterministic via viewport-style measurement).

5. **Production-mirror captures**:
   - All four locked breakpoints (390x844, 768x1024, 1024x1366, 1440x900) light + dark.
   - HA push notify to Mac for grade.

6. **M1 review block** before commit.

**Verification**:
- Tests passing.
- All status card variants render correctly across breakpoints.
- Mac signs off on visual quality.
- E1 + E2 defects from visual_defect_ledger.md:55 are visibly resolved.

**Commit**: `feat(tunet): CD11c — status card room_row + info_only variants + landed-variant polish`.

**Closure note**: After this commit, `tunet-status-card` is M3-ready for CD11 closure. The actual "CD11 — CLOSED" stamp belongs to Mac.

---

## Phase 10: Cross-card markup safety sweep + base.js consolidation

**Goal**: Promote `escapeHtml` to `tunet_base.js`, retire local copies in inbox + alarm, apply to remaining cards that still inject config or entity strings into innerHTML without escaping.

**Required reading**: scope contract above, plus `tunet_inbox_card.js:399-406` (canonical escapeHtml), `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js:706-712` (local copy to retire), and the affected-cards list from Discovery Report C.

**Affected cards** (audited in Discovery Report C):
- `tunet_actions_card.js:522` — action.name unescaped
- `tunet_rooms_card.js:1109` — roomCfg.name unescaped
- `tunet_sensor_card.js:705-707` — sensorCfg.icon + label unescaped
- `tunet_lighting_card.js:1336` — tile-name in card-generated HTML (likely unescaped)
- `tunet_light_tile.js:667, 699, 713` — entity-derived value unescaped

Phases 4, 5, 8 should have already addressed inbox, alarm, status. This phase covers the rest.

**Steps**:

1. **Add `escapeHtml` to `tunet_base.js`**: export function. Use the canonical 5-replacement pattern from `tunet_inbox_card.js:399-406`.

2. **Migrate consumers**:
   - In each affected card: `import { escapeHtml } from './tunet_base.js?v=…'` (or the appropriate import path).
   - Wrap every config/entity-derived interpolation with `escapeHtml(…)`.
   - Remove the local copies in `tunet_inbox_card.js` and `tunet_alarm_card.js` (replace usages with the base import).

3. **Add cross-card test** in `Dashboard/Tunet/Cards/v3/tests/`:
   - Create `markup_safety_contract.test.js` (new file).
   - For each affected card: render with adversarial config containing `<script>alert(1)</script>`. Assert no `<script>` tag in rendered shadow DOM (string match on `.shadowRoot.innerHTML`).

4. **Production-mirror capture**:
   - `/tunet-overview/overview` to confirm no visible regression after the sweep.
   - 390x844 + 1440x900 light + dark.

5. **M1 review block** before commit.

**Verification**:
- All target cards use `escapeHtml` from base.
- `markup_safety_contract.test.js` passes for every audited card.
- No regression in rendering.

**Commit**: `feat(tunet): markup safety sweep — promote escapeHtml to base, escape entity/config strings in 6 cards, add adversarial markup test`.

---

## Phase 11: Governance sync + canary update + ledger closure

**Goal**: Reflect everything shipped in Phases 1-10 in the governance docs. Update the canary doc. Close the relevant backlog rows in `visual_defect_ledger.md`. Push.

**Required reading**: scope contract above, plus `Dashboard/Tunet/Docs/visual_defect_ledger.md`, `Dashboard/Tunet/Docs/deploy_workflow_canary.md`, `Dashboard/Tunet/Docs/tunet_build_and_deploy.md`, `plan.md` / `FIX_LEDGER.md` / `handoff.md`.

**Steps**:

1. **Update `Dashboard/Tunet/Docs/visual_defect_ledger.md`**:
   - For each row in lines 78-124 closed by Phases 1-10: move to "Resolved this session" or its CD/tranche's closed list, with commit hash.
   - Update the "Tranche-Owned Open Backlog" section to reflect remaining items.
   - Update the Canonical Decision Matrix rows (lines 60-76) for cards whose state changed.

2. **Update `Dashboard/Tunet/Docs/cards_reference.md`**:
   - For each card touched: refresh the per-card config contract section if any contract changed (e.g., new variant on status card; new escape semantics).

3. **Update `Dashboard/Tunet/Docs/deploy_workflow_canary.md`**:
   - Add a new "Canary run — 2026-05-23 backlog closure" section showing what shipped, with commit hashes.

4. **Update `plan.md` / `FIX_LEDGER.md` / `handoff.md`**:
   - Append one-line session deltas referencing the scoped ledger for details (per scoped-vs-root principle).

5. **Memory entry update**:
   - Update `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_tunet_dashboard_inventory.md` if anything about the production target changed.
   - Update `~/.claude/projects/-home-mac-HA-implementation-10/memory/feedback_pre_commit_review_block.md` only if M-rules themselves changed (they shouldn't in this plan).

6. **Full test suite**: `npm test` — confirm 772+ pass (count grows with new tests added in Phases 2-10).

7. **End-to-end verification with Mac** (per Phase 8 of the prior tranche):
   - Run `npm run tunet:review:share` against `/tunet-overview/overview` at 390x844 + 1440x900 light + dark.
   - HA push notify lands on Mac's phone with deep-link.
   - Mac grades.

8. **Push only after Mac's explicit ship-it** per M3.

**Verification**:
- All ledger rows from Phases 1-10 marked resolved with commit hashes.
- Canary doc updated.
- Tests pass.
- Mac confirms via HA push notification + iPhone review that the production view is in shipshape.

**Commit**: `docs(tunet): sync governance after backlog closure tranche (Phases 1-10 RESOLVED)`. Then `git push origin main`.

---

## Estimated effort

| Phase | Estimated time | Risk |
|-------|---------------|------|
| 1 — Bug A + CD5 verifications + ledger closures | 30 min | Low (mostly verification) |
| 2 — Weather production defects | 60-90 min | Medium (root cause unknown until reconnaissance) |
| 3 — Weather subscription guard | 30-45 min | Low (pattern is clear) |
| 4 — Inbox hardening | 45-60 min | Medium (lifecycle race tests are tricky) |
| 5 — Alarm hardening | 45-60 min | Medium (pointer capture tests are tricky) |
| 6 — Media hardening | 60-90 min | High (transport FF/RW decision requires Mac + integration work) |
| 7 — Sonos volume debounce | 20 min | Low (mirrors Phase 6) |
| 8 — CD11b status home_detail + alarms | 90-150 min | High (largest scope, depends on synthetic-dazzling-oasis presence) |
| 9 — CD11c status room_row + info_only + polish | 90-150 min | High (largest scope) |
| 10 — Cross-card markup safety sweep | 60-90 min | Medium (touches 6 files + new test file) |
| 11 — Governance sync + ledger + canary | 30-45 min | Low |

**Total**: ~9-13 hours focused execution plus Mac's review gates between phases. Spread across multiple sittings — this is not a single-session tranche.

## Invocation

```bash
# Full plan, phase by phase:
/claude-mem:do ~/.claude/plans/tunet-backlog-closure-2026-05-23.md

# Single phase:
/claude-mem:do ~/.claude/plans/tunet-backlog-closure-2026-05-23.md --phase 1
```

Each phase is self-contained. The orchestrating agent starts a fresh Claude Code session per phase, loads the required reading, executes the steps, runs verification, gates on Mac's review (M3), and commits before moving to the next phase.

## Anti-pattern guards

- **Do not invent API methods.** All service calls must reference existing HA services confirmed via `ha_list_services` or live probe. Sonos+Spotify transport fix in Phase 6 requires confirming the actual fallback service via live probe before coding.
- **Do not skip production-mirror capture for production-facing cards.** Lab-only captures are M1-banned.
- **Do not declare phase done autonomously.** M3: agent reports "Phase N implemented, awaiting your review." Mac stamps done.
- **Do not bundle phases into one commit.** Each phase is one (or two if test-bundle separation makes sense) commits, gated on M1 evidence per phase.
- **Do not use SendUserFile for iPhone delivery.** HA notify is the verified primitive (see canary doc Pipeline Gotcha #6 from the prior tranche).
- **Do not reopen closed tranches without explicit justification.** CD5, CD6, CD7, CD8, CD9 are closed; CD10 is intentionally deferred.
- **For weather AAAAAA defect**: do not assume root cause without live DOM inspection. The hypothesis in Phase 2 (font ligature) is plausible but unverified.
- **Do not roll your own escapeHtml.** Use the canonical pattern from `tunet_inbox_card.js:399-406`.

## Cross-phase invariants

- Every production-facing change requires production-mirror capture + inline image read-back + HA push notify to Mac.
- Every phase produces an evidence-bound DoD before commit (M7).
- Every commit includes a defect inventory of the current state (M4), not just the fix delta.
- The capitulation guard from M1 applies: when Mac flags a defect, the next response asks WHAT SPECIFICALLY, never apologizes or re-captures blindly.
