# SA-Series — Sonos Alarm Backend Hygiene + Manage UI (Out-of-Spec) Archive

> ARCHIVED 2026-05-04 — extracted from plan.md@HEAD~1 lines 119-163. Read-only. For current state see `plan.md` Tranche Queue. NOTE: SA3 RETARGETING PENDING 2026-05-04 — Browser Mod popup → Bubble Card 3.2-beta.1 Adaptive popup per popup-direction reversal architecture decision. Implementation deferred to after CD9b popup composition pattern lands.

**Period**: 2026-04-23 → 2026-04-30
**Status**: SA0 closed Apr 23; SA2+SA3+SA4 repo-complete Apr 23; full SA-series + alarm UX fixes deployed live 2026-04-30 (out-of-spec, sibling to active CD9 program) — SA3 retargeting pending
**Scope**: Sonos alarm backend hygiene (canonical entities + phantom trigger/sensor cleanup) + Tunet alarm list card + Browser Mod edit popup (now retargeting to Bubble) + `/alarms` subview/chip + legacy popup retirement + live alarm UX defect fixes

## Synthesis

### What we did
- SA0 (2026-04-23): backend hygiene — trimmed phantom triggers (`kitchen`, `living_room`, `office`) from `sonos_alarm_trigger_update`; added `_bedroom_weekend` + `_bath_weekend`; rewrote `sonos_enable_weekday_alarms`/`sonos_enable_weekend_alarms`/`sonos_disable_all_alarms` to canonical entities; dropped dead `switch.sonos_alarm_42` literal; deleted dead template sensors `sensor.sonos_alarm_{kitchen,living_room}_display`; D1 regression-verified `script.sonos_adjust_edit_time` (+5min)
- SA2 (repo Apr 23): new `tunet_alarm_card.js` + 11 bespoke tests (full suite 639 green); consumes `TOKENS` CSS + `--_tunet-tile-*` fallbacks; rehab-lab §14 harness; cards_reference §14 + Whole-Home Usage Contract row; sections_layout_matrix alarm row
- SA3 (repo Apr 23): new `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` canonical template; `popup_card_id: tunet-alarm-edit` registered in both dashboards; `packages/sonos_package.yaml` script-level `navigate` calls replaced with `browser_mod.popup`/`browser_mod.close_popup`; stock `custom:popup-card` wrapper, no bespoke Tunet popup card
- SA4 (repo Apr 23): `/alarms` subview on both dashboards (hero alarm card + tile/markdown supports); next-alarm chip on overview as standalone `tile` (not bolted into G3S-locked status card); 4 legacy Bubble Card popup YAMLs deleted
- Alarm UX fixes (2026-04-28 → 2026-04-30, live): All On/All Off context-aware toggle, optimistic UI flip, Tunet-styled inlined Browser Mod edit popup, parallel + verify-and-retry scripts

### Why we did it
- Direct user request to fix live alarm UX defects on the dashboard outside the active CD program
- No CD-tranche slot was available (CD9 was current); SA-series was activated as a sibling program per `~/.claude/plans/tunet-sonos-alarm-manage.md`
- Recorded explicitly as out-of-spec and not-a-precedent for further out-of-tranche work

### Files touched
- `packages/sonos_package.yaml` — phantom-trigger cleanup, canonical-entity rewrites, `browser_mod.popup`/`close_popup` calls
- `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` — new card (SA2)
- `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` — new canonical popup template (SA3)
- Both Tunet dashboard configs — popup registration + `/alarms` subview + next-alarm chip
- `Dashboard/Tunet/AGENTS.md` — §3 alarm-edit-popup exception
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md` — LD2 + exception notes
- `Dashboard/Tunet/Docs/sonos_alarm_popup_reference.md` — target-architecture section; legacy Bubble content marked historical
- `Dashboard/Tunet/Docs/visual_defect_ledger.md` — CD12 alarm entry references SA-series status
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`, `Dashboard/Tunet/Docs/cards_reference.md` — alarm row + §14 + Whole-Home Usage Contract row
- `Dashboard/Tunet/Docs/tranches/SA2_alarm_list_card.md`, `SA3_browsermod_edit_popup.md`, `SA4_subview_chip_and_retirement.md`
- 4 legacy Bubble Card popup YAMLs — deleted (SA4)

### Key decisions
- Out-of-spec status explicitly recorded as not-a-precedent for further out-of-tranche work
- Canonical alarm entities locked: `switch.sonos_alarm_{bedroom,bath,bedroom_weekend,bath_weekend}`
- AGENTS.md §3 alarm-edit exception: service-call (not fire-dom-event), scope limited to `popup_card_id: tunet-alarm-edit`
- LD2 migration note recorded in `nav_popup_ux_direction.md`
- LD3 recurrence editing deferred
- SA2 card consumes shared TOKENS + tile-size fallbacks, no profile resolver opt-in
- Next-alarm chip kept as standalone `tile` to avoid touching G3S-locked status card
- Live state preserved per user request: bedroom alarm ON, others OFF

### Entry points (for regression hunting)
- Tests: 11 bespoke `tunet_alarm_card` tests (in full 639-test suite)
- Entities: `switch.sonos_alarm_bedroom`, `switch.sonos_alarm_bath`, `switch.sonos_alarm_bedroom_weekend`, `switch.sonos_alarm_bath_weekend`; `input_datetime.sonos_alarm_edit_time`
- Scripts: `sonos_adjust_edit_time`, `sonos_enable_weekday_alarms`, `sonos_enable_weekend_alarms`, `sonos_disable_all_alarms`, `sonos_alarm_trigger_update`
- Selectors: `tunet-alarm-card`, `.alarm-row`, `.alarm-pill` (and Browser Mod `popup_card_id: tunet-alarm-edit` until retargeted)
- Subview: `/alarms` on both dashboards

### Deferred work / handoffs
- LD3 recurrence editing
- SA3 retargeting (Browser Mod → Bubble Card 3.2-beta.1 Adaptive popup) — pending 2026-05-04 architecture decision; deferred to after CD9b popup composition pattern lands

### Superseded by
- 2026-05-04 popup-direction reversal: SA3 retargets from Browser Mod to Bubble Card 3.2-beta.1 Adaptive popup; implementation deferred to after CD9b popup composition pattern lands

### Related claude-mem observations (added 2026-05-04)
- #11054 — Tunet Dashboard CD9 Session Kickoff — SA-Series Out-of-Spec Status Established (2026-04-30) — captures the out-of-spec lock and CD9 boundary
- #11056 — handoff.md Read — CD9 Exact Open State and SA-Series Deployment Record (2026-04-30) — live deploy record for SA-series + alarm UX fixes
- #11018 — Live HA Validation: Semantic Alarm Entities Only Exist for Bedroom and Bath (2026-04-23) — ground-truth check that drove canonical-entity lock
- #11023 — LD1 Reversed — Sonos Alarm Entity Canonicalization Switched to Semantic Slugs (2026-04-23) — the canonicalization decision (bedroom/bath/*_weekend)
- #11021 — switch.sonos_alarm_42 Does Not Exist — Renamed to switch.sonos_alarm_bedroom; Weekend Script Has Dead Reference (2026-04-23) — root-cause for SA0-D3 dead-literal removal
- #11026 — sonos_alarm_trigger_update Has 3 Phantom Triggers and Missing 2 Weekend Triggers (2026-04-23) — root-cause for SA0-D2+D8
- #11032 — SA0-D2+D8: Fixed sonos_alarm_trigger_update Automation Triggers (2026-04-23) — phantom-trigger removal + weekend triggers added
- #11031 — SA0-D3: Quick-Action Scripts Rewritten to Canonical Alarm Slugs (2026-04-23) — weekday/weekend/disable script rewrites
- #11029 — SA0-D4: Removed Dead Display Sensors for Living Room and Kitchen Alarms (2026-04-23) — dead template-sensor cleanup
- #11039 — SA2 — tunet_alarm_card.js Created — Sonos Alarm Management Card v1.0.0 (2026-04-23) — the card itself; entry point for regression
- #11040 — SA2 Complete — tunet_alarm_card Tests Pass 11/11, Build Succeeds, Rehab Lab Updated (2026-04-23) — closes SA2 with the 11-test green bar
- #11049 — SA3 Tranche Doc Created — Browser Mod Alarm Edit Popup Migration Record (2026-04-23) — captures AGENTS.md §3 alarm-edit exception scope
- #11034 — sonos_alarm_popup_reference.md Rewritten with SA-Series Target Architecture (2026-04-23) — governance doc resync; legacy Bubble content marked historical
- #11044 — ALARMS SUBVIEW Added to tunet-suite-config.yaml (SA4 Production Config Parity) (2026-04-23) — `/alarms` subview landing
- #11047 — 4 Legacy Sonos Alarm Popup YAML Files Deleted (SA4 Cleanup) (2026-04-23) — legacy Bubble Card popup retirement

---

## Original Session Deltas (verbatim — moved from plan.md 2026-05-04)

## Session Delta (2026-04-30, SA-series live + alarm UX fixes — out-of-spec)

Tranche marker: SA0–SA4 deployed live; iterative alarm UX fixes (All On/All Off context-aware toggle, optimistic UI flip, Tunet-styled inlined BrowserMod edit popup, parallel + verify-and-retry scripts) completed across 2026-04-28 → 2026-04-30. All work was **outside the active CD program** — CD9 remains current and unchanged.

- `OUT-OF-SPEC SCOPE`
  - The entire SA-series + alarm UX defect-fix work was executed on direct user request, not as a CD-program advancement.
  - Future Tunet sessions resume CD9 / CD10–CD12 per `~/.claude/plans/flickering-herding-wolf.md`. The SA-series is closed; do not treat it as a precedent for further out-of-tranche work.
- `RESULT`
  - All four canonical alarms toggle reliably in both directions from the dashboard.
  - Live state preserved per user request: bedroom alarm ON, others OFF.
  - See `FIX_LEDGER.md` 2026-04-30 entry for the complete file inventory and key defect-fix list.

## Session Delta (2026-04-23, SA2+SA3+SA4 repo-complete — full SA-series)

Tranche marker: SA0 closed earlier in the session; SA2 + SA3 + SA4 all repo-complete in the same session. Live deploy pending (sandbox blocked SSH with embedded credentials; user runs deploy interactively).

- `SA2`: new `tunet_alarm_card.js` + 11 bespoke tests (all green; full suite 639 tests pass). Card consumes `TOKENS` CSS + `--_tunet-tile-*` fallbacks; no profile resolver opt-in. Rehab-lab §14 harness. cards_reference §14 + Whole-Home Usage Contract row. sections_layout_matrix alarm row.
- `SA3`: new `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` canonical template. Popup `popup_card_id: tunet-alarm-edit` registered in BOTH dashboards. `packages/sonos_package.yaml` script-level navigate calls replaced with `browser_mod.popup` / `browser_mod.close_popup`. No bespoke Tunet popup card built — stock `custom:popup-card` wrapper.
- `SA4`: `/alarms` subview on both dashboards (hero = alarm card, support = tiles + context markdown). Next-alarm chip on overview of both dashboards (standalone `tile`, not bolted into G3S-locked status card). 4 legacy Bubble Card popup YAMLs deleted.
- `NEXT STEPS`
  - User runs `!npm run tunet:deploy:lab` (SCP card + bump Lovelace resource).
  - User deploys `packages/sonos_package.yaml` via ha-package-deployer workflow, then `script.reload` + `automation.reload`.
  - User reloads both dashboard configs.
  - Per-tranche live verification sections are enumerated in `Dashboard/Tunet/Docs/tranches/SA2_alarm_list_card.md`, `SA3_browsermod_edit_popup.md`, `SA4_subview_chip_and_retirement.md`.

## Session Delta (2026-04-23, SA0 closure — Sonos Alarm Backend Hygiene + Governance)

Tranche marker: sibling SA-series activated; SA0 (backend hygiene + governance sync) closed on this session. CD9 remains the root Tunet authority. SA0–SA4 run sequentially; SA2 is next.

- `AUTHORITY NOTE`
  - SA-series governs the Sonos alarm edit/manage surface per `~/.claude/plans/tunet-sonos-alarm-manage.md`.
  - SA0 scope was narrow: `packages/sonos_package.yaml` hygiene, `Dashboard/Tunet/AGENTS.md` §3 exception, governance docs sync. No Tunet v3 card files touched.
- `IMPLEMENTATION`
  - D1 regression-verified live (`script.sonos_adjust_edit_time` advances `input_datetime.sonos_alarm_edit_time` by exactly +5 min).
  - D2 + D8: trimmed phantom triggers (`kitchen`, `living_room`, `office`) from `sonos_alarm_trigger_update`; added `_bedroom_weekend` + `_bath_weekend`.
  - D3: rewrote `sonos_enable_weekday_alarms`, `sonos_enable_weekend_alarms`, `sonos_disable_all_alarms` to target canonical renamed entities (bedroom, bath, weekend variants). Dropped dead `switch.sonos_alarm_42` literal.
  - D4: removed dead template sensors `sensor.sonos_alarm_{kitchen,living_room}_display`.
  - Recorded AGENTS.md §3 alarm-edit-popup exception (service-call, not fire-dom-event; scope limited to `popup_card_id: tunet-alarm-edit`).
  - LD2 + exception notes appended to `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`.
  - `sonos_alarm_popup_reference.md` gained a target-architecture section; legacy Bubble Card content marked historical.
  - `visual_defect_ledger.md` CD12 alarm entry now references SA-series status.
- `RESULT`
  - SA2 unblocked.
  - `HA PACKAGE RELOAD` (automation + script + template) required to land SA0 changes on live HA.

