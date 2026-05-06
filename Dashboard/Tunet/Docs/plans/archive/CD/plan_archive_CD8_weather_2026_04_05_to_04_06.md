# CD8 — Weather Phone-Density Redesign Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 381-454 + 501-532. Read-only. For current state see `plan.md` Tranche Queue. NOTE: REOPENED 2026-05-04 for forecast tile px-based sizing bypassing the em-based design system (`tunet_weather_card.js:204,207-208`). See `Dashboard/Tunet/Docs/visual_defect_ledger.md` §7 2026-05-04 entry.

**Period**: 2026-04-05 → 2026-04-06
**Status**: Closed Apr 6, 2026 — REOPENED 2026-05-04 for px→em conversion of forecast tile font-sizing
**Scope**: Weather card phone-density redesign — inline header flip-chip toggles, single-line collapsed detail row, pressure removed by default, optional UV badge on hourly+temperature tiles

## Synthesis

### What we did
- Rebuilt `tunet_weather_card.js` toggle model: full-width segmented rows replaced by compact inline flip-chips in the header
- Collapsed details into a single-line summary row on phone (390x844) and made `show_pressure` explicit in editor/runtime contract, defaulting to `false`
- Added top-right UV badge to hourly+temperature forecast tiles when forecast data provides UV (card v1.6.3)
- Wired `_applyAutoModes()` so dry `auto/auto` prefers hourly+temperature when hourly UV is available; forecast subscriptions re-run the auto-mode resolver on hourly/daily forecast data arrival so the live card actually switches after forecast hydration
- Fixed `tunet_playwright_review.mjs` to await web fonts before capture (eliminating raw icon ligature false negatives in phone screenshots)
- Replaced low-signal short-daily sample in `tunet-card-rehab-lab.yaml` with explicit `Hourly temp + UV` validation fixture

### Why we did it
- 2026-04-05 governance pass found the weather card still missed `cards_reference.md` CD8 contract on phone (toggle pills below header, stacked details), so closure was blocked despite user belief that CD8 was closed
- Screenshot harness font race was producing false negatives, undermining phone captures as closure evidence — had to be fixed first

### Files touched
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js` (v1.6.3; flip-chips, single-line detail, UV badge, `_applyAutoModes()`)
- `Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` (10/10 — added dry auto/auto hourly+temp preference + forecast-arrival recompute coverage)
- `Dashboard/Tunet/scripts/tunet_playwright_review.mjs` (web-fonts await before capture)
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml` (Hourly temp + UV fixture)
- `Dashboard/Tunet/Docs/cards_reference.md` and `Dashboard/Tunet/Docs/visual_defect_ledger.md` (accepted dry auto/auto UV behavior)

### Key decisions
- Keep `CD7` as active tranche on 2026-04-05; weather narrowed as the sole CD8 runtime blocker — climate stays composition-bound, sensor stays visually healthy with naming-contract follow-up only (anchor: 2026-04-05)
- Closed CD8 on YAML rehab evidence only on 2026-04-06; control returned to `CD9` (anchor: 2026-04-06)
- Accepted post-closeout polish for dry auto/auto UV preference without rolling back from `CD9` (anchor: 2026-04-06)

### Entry points (for regression hunting)
- Tests: `Dashboard/Tunet/Cards/v3/tests/weather_bespoke.test.js` (10/10 at closeout; full suite 599/599)
- Entities: `weather.forecast_home` + `weather/get_forecasts` WS service (hourly + daily)
- Selectors / runtime hooks: `_applyAutoModes()`, header flip-chip controls, single-line detail summary row, hourly forecast tile UV badge, `show_pressure` editor key
- Live resource versions at closure: `?v=build_20260406_022606Z` (CD8 close) → `?v=build_20260406_023753Z` (auto/auto UV polish)
- Screenshot manifests:
  - 2026-04-05 governance: `/tmp/tunet-playwright-review/2026-04-05T22-17-07-022Z/review-manifest.json`
  - 2026-04-06 closeout: `/tmp/tunet-playwright-review/2026-04-06T02-27-25-961Z/review-manifest.json`
  - 2026-04-06 polish: `/tmp/tunet-playwright-review/2026-04-06T02-38-06-738Z/review-manifest.json`

### Deferred work / handoffs
- Sensor naming-contract clarity around `label` (runtime healthy; doc-only follow-up)
- Climate composition caveat on cramped paired-phone surface (already-documented; not a new card-local failure)

### Superseded by
- 2026-05-04 CD8 reopened — forecast tile font-sizes (`13.8px`, `12.4px`, `19px` hardcoded at `tunet_weather_card.js:204,207-208`) bypass the em design system; conversion required

### Related claude-mem observations (added 2026-05-04)

- #10718 — Weather Card CD8 Design Decisions — Details Strip + Toggle Chips (2026-04-05) — user-approved interaction model: pressure dropped, icon+value details strip, single-state flip chips
- #10720 — CD8 weather card phone density redesign target contract documented (2026-04-05) — `cards_reference.md` formal CD8 contract: flip-chips, icon-only details, ~120px vertical savings
- #10726 — CD8 Weather Card Target Contract Written and Ledger Updated (2026-04-05) — `visual_defect_ledger.md` backlog entry updated to reference the written contract
- #10804 — CD8 Weather Card — Flip-Chip Toggle Plan Initiated (2026-04-05) — planning kickoff after CD6 lighting follow-on closure; pressure drop confirmed
- #10805 — CD8 Target Contract — Weather Card Phone Density Redesign (2026-04-05) — `cards_reference.md` line 1050 spec located; single-line conditions row pattern locked
- #10806 — Visual Defect Ledger State — CD8 Weather Contract and Active Defect Inventory (2026-04-05) — pre-implementation defect snapshot; identifies V-INTERACT-3 px/em inconsistency (the 2026-05-04 reopen vector)
- #10809 — CD6 Follow-on Lighting Parity Abandoned — Pivoting to CD8 Weather Card (2026-04-05) — pivot decision that opened CD8; lighting parity work parked unresolved
- #10810 — Plan File Repurposed: fancy-waddling-clarke.md Now Contains CD8 Weather Card Spec (2026-04-05) — active plan file replaced with CD8 spec; defines the 10-step ordered implementation
- #10811 — CD8 Weather Card — Flip-Chip Toggles + Phone Density Redesign (Plan Approved) (2026-04-05) — ultraplan approval; locks `_applyAutoModes()` unchanged at this stage and `show_pressure: false` opt-in default
- #10817 — Weather Card CD8 — Flip-Chip Toggle Redesign: HTML Template Updated (2026-04-05) — first implementation step: `seg-group` toggles replaced with `flip-chip#viewChip` + `flip-chip#metricChip` in `hdr-controls`
- #10822 — Weather Card — Pressure Detail Gated + Label Span Wrapper Added (2026-04-05) — `show_pressure` runtime gate landed; `.lbl` span enables phone-width label hiding
- #10828 — CD8 Weather Card Changes Built and Deployed to Lab (2026-04-05) — first build+deploy of CD8 changes ready for Playwright validation
- #10836 — Weather Card Flip-Chip Toggle Labels: Show Destination State, Not Current State (2026-04-05) — UX inversion decision in `_updateToggleControls()`: labels show what tap will switch TO
- #10839 — Plan State: CD7 Active, CD8 Weather Blocker Open, CD6 Lighting Follow-On Parked (2026-04-05) — governance precedence resolution: rejected user's broad CD8-closed claim; narrowed CD8 to weather only
- #10861 — Visual Defect Ledger — Current State as of 2026-04-06 (2026-04-06) — post-closeout normalized ledger: CD8 weather closed, sensor/climate card-level healthy, CD9 cluster opens

---

## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

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

