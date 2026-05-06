# Tunet Suite Dashboard — Implementation Plan

Working branch: `tunet/inbox-integration`
Last updated: 2026-05-04 (restructured — sprawl moved to `Dashboard/Tunet/Docs/plans/archive/`)
Scope: **Tunet card suite only.** This file does NOT govern the `tunet_inbox` integration backend; that work uses `custom_components/tunet_inbox/{plan,FIX_LEDGER,handoff}.md` and is out of scope here.

> **Pre-restructure rollback marker**: git tag `tunet-docs-pre-restructure-2026-05-04` captures plan.md, FIX_LEDGER.md, and handoff.md state before the 2026-05-04 archive split. Use to restore if anything was lost in the restructure.

## Active Execution Plans (canonical authority)

- `~/.claude/plans/flickering-herding-wolf.md` — root **CD0–CD12** authority (the original adopted plan; immutable post-adoption per Plan Creation Protocol in `Dashboard/Tunet/CLAUDE.md`)
- `~/.claude/plans/tunet-sonos-alarm-manage.md` — SA-series sibling to CD12 surface assembly; out-of-spec, complete + deployed (SA3 retargeting pending — see Tranche Queue)

When `~/.claude/plans/*.md` and this `plan.md` disagree on **execution order or status**, this `plan.md` wins (it tracks current sequencing). When they disagree on **original scope intent**, the `~/.claude/plans/*.md` file wins.

## Current Tranche

**CD10 — Navigation Verify Pass** *(held while 2026-05-04 reopens are processed)*

Verify-only by design — no new code unless a real failure is reproduced. Will resume after the reopen tranches and CC1 token foundation land.

## Tranche Queue (single source of truth — read top-to-bottom for "what's next")

This is the **only** authoritative ordered list of upcoming work in the Tunet card suite. Any other file that lists upcoming work must reference this section, not duplicate it.

| # | Tranche | Priority | Depends on | Scope summary |
|---|---------|----------|------------|---------------|
| 1 | **P0 — CD6 reopened (lighting hold-then-drag)** | P0 | nothing (JS-only) | `tunet_lighting_card.js:1451-1534` `_initTileDrag()` missing `longPressMs`/`onLongPress` in `createAxisLockedDrag()` call. Fix shape proven in `tunet_light_tile.js:783-823`. SHIPS hold-drag fix only — does NOT close CD6 (other CD6 work in queue position 4) |
| 2 | **CC1 — Cross-Card Consistency** | High | CC1 scope doc (deferred precondition) | Token normalization — corners (radii), icon sizes, font sizes (status drift from `--type-*`), spacing tokens. Ghost-horizontal-scroll root cause likely lives here. Foundation for queue items 3-6. Pre-tranche scope doc strongly recommended (`Dashboard/Tunet/Docs/plans/cc1_token_extraction_plan.md`) before launch |
| 3 | **CD11 escalated — status broad rehab** | High | CC1 tokens | Status summary matrix broadly visually broken — phone density (4-col → 2-col default), dropdown quality, font fragmentation (`tunet_status_card.js:262-643`), tile alignment. Plus tap-routing on temperature tile → Bubble 3.2 Adaptive popup composing `tunet-climate-card` |
| 4 | **CD6 reopened remainder** | Medium | CC1 tokens | Phone-stress horizontal padding regression at `390x844` + missing all-on/all-off control (`tunet_lighting_card.js:1886` only computes `data-allOff` styling attribute). The all-on/off gap is a feature addition; the padding is a regression |
| 5 | **CD7 reopened** | Medium | CC1 tokens | Rooms-card row variant orb sizing tokens (`tunet_rooms_card.js:69-70`: `--rooms-row-btn-size: 3.16em`, `--rooms-row-btn-icon-size: 1.62em`) too large at overview surface; re-tune defaults or introduce overview-surface variant. Composition shift to dedicated subview pages already locked in cards_reference.md §3 Option A |
| 6 | **CD8 reopened** | Medium | CC1 tokens | Weather forecast tile sizing — `tunet_weather_card.js:204,207-208` use hardcoded `13.8px` / `12.4px` / `19px` bypassing the em design system. Convert to em-based, consume `--type-*` tokens consistent with climate baseline |
| 7 | **CD9a — media transport bug** | Medium | nothing (JS-only) | `tunet_media_card.js:792-795` calls `media_previous_track`/`media_next_track` on `_transportTarget`; wiring correct. Investigate `_transportTarget` resolution for grouped Sonos + source-specific limits (Sonos+Spotify often blocks standard `media_player.media_previous_track` service) |
| 8 | **Bubble 3.2 research spike** | Required pre-CD9b | nothing | Bubble Card 3.2-beta.1 standalone popup architecture is not yet established in the codebase. Establish patterns: `card_type: pop-up` with `hash` activation, the three display modes (Adaptive / Dialog / Adaptive dialog), header config, migration strategy for existing Browser Mod popups. Output: `Dashboard/Tunet/Docs/bubble_3_2_popup_pattern.md` |
| 9 | **CD9b — media-card popup composition redesign** | Medium | Bubble 3.2 spike | Adopt Bubble 3.2 Adaptive popup with media-source/group selector. Composition options: custom `tunet-sonos-card` form, `spotifyplus` integration card embed, or new bespoke composition. Authoring decision deferred to surface-assembly stage |
| 10 | **SA3 retargeting** | Medium | CD9b popup composition pattern | Alarm-edit popup migrates Browser Mod → Bubble 3.2 Adaptive popup. Implementation deferred to after CD9b establishes the canonical popup composition pattern |
| 11 | **CD10 resume — Navigation Verify Pass** | Low | CC1 (verify nav doesn't regress on token normalization) | Verify-only by design. Will surface CC1-induced regressions if any |
| 12 | **CD12 — Surface Assembly + house overview header card** | Low | CC1 + reopens 1-9 closed | Surface assembly per `~/.claude/plans/flickering-herding-wolf.md` + new "house overview header" card design. Card spec TBD — roles: time/weather/presence summary, active OAL mode, pending notifications, system pause state, ambient context |

### Backlog (unscheduled — promote to tranche when prioritized)

- Notification response page concept (per visual_defect_ledger.md Global cross-cutting bullet — may absorb the existing TI inbox card or supersede it)
- Editor authoring coverage gap (cross-card; can be absorbed into per-card bespoke passes when each card is touched)
- OAL unified timer notification investigation (`automation.oal_v14_unified_timer_notification` appears broken — see visual_defect_ledger.md Global)

## Architecture Decisions Log (terse — full text in `Dashboard/Tunet/Docs/visual_defect_ledger.md` Global cross-cutting bullets)

| Date | Decision | Anchor |
|------|----------|--------|
| 2026-05-04 | Popup direction reverses Browser Mod → Bubble Card 3.2-beta.1 (Adaptive preferred default) | visual_defect_ledger.md Global 2026-05-04 |
| 2026-05-04 | Room composition uses dedicated subview pages, not popups | visual_defect_ledger.md Global 2026-05-04 + cards_reference.md §3 Option A |
| 2026-05-04 | Custom-card direction reaffirmed — 9 interaction-bearing cards stay custom; remaining stay custom on visual identity grounds; Tunet HA theme deferred | this session delta below |
| 2026-04-30 | Keyboard accessibility out of scope (suite-wide standing rule) | flickering-herding-wolf.md §2 standing rule item 9 |
| 2026-04-30 | Out-of-spec SA-series recorded as not-a-precedent | SA archive |
| 2026-04-02 | Card Rehabilitation Reset (consistency-driver execution order; surface-driven superseded) | CD0-CD3 archive |
| 2026-04-02 | Profile resolver superseded by `tile-size` attribute + hand-tuned CSS variants | CD0-CD3 archive (and `Dashboard/Tunet/Cards/v3/CLAUDE.md`) |
| 2026-04-02 | Browser Mod for popups — *(reversed 2026-05-04 — see top of log)* | superseded |

## Latest Session Delta — 2026-05-04 (custom-direction reaffirmation + comprehensive defect capture + popup-direction reversal + plan.md restructure)

Tranche marker: `CD10` remains the active root tranche but is held while 2026-05-04 reopens land. SA-series alarm-edit popup retargets to Bubble Card 3.2-beta.1 per architecture decision. plan.md restructured — pre-restructure state preserved at git tag `tunet-docs-pre-restructure-2026-05-04` and verbatim deltas archived under `Dashboard/Tunet/Docs/plans/archive/`.

- `STRATEGIC DECISION — custom-card direction reaffirmed`
  - May 3 hybrid-vs-custom evaluation closed: 9 cards stay custom on interaction-layer grounds (climate, light_tile, lighting, rooms, media, sonos, speaker_grid, alarm, inbox); actions `mode_strip` variant stays custom (OAL templating); remaining cards stay custom on visual identity grounds
  - card_mod is recognized as styling-only (does not substitute for a card's interaction layer); a Tunet HA theme idea was discussed but **deferred** — not pursued at this time
- `ARCHITECTURE DECISION — popup direction reversal`
  - Browser Mod popup direction is **superseded** by Bubble Card 3.2-beta.1 standalone popup architecture (`card_type: pop-up` cards with `hash` activation)
  - three Bubble display modes available: **Adaptive (fit content)** = preferred default for in-card composition; **Dialog (centered)** = modal-style for full-width composition; **Adaptive dialog** = hybrid centered with mobile bottom-offset
  - adoption sequence: (a) status temperature tile tap → Adaptive popup with `tunet-climate-card` composed inside (CD11 follow-on); (b) media source/group picker → Adaptive popup with media composition (CD9b after Bubble 3.2 spike); (c) alarm edit → Adaptive popup with controls (SA3 retargeted from Browser Mod, after CD9b)
  - Browser Mod retained only for full-page modals if explicitly required; old `nav_popup_ux_direction.md` LD2/LD3 references retain historical accuracy but no longer drive new work
- `ARCHITECTURE DECISION — room composition uses dedicated subview pages, not popups`
  - rooms-card §3 Room Tiles updated to **Option A**: tile tap = toggle room lights (existing); hold (400ms + haptic) = navigate to dedicated room subview page (was: popup fallback)
  - "one-popup-per-room" lock superseded
  - room-page subview composition becomes part of CD12 surface assembly
- `DEFECTS CAPTURED IN VISUAL_DEFECT_LEDGER.MD (code-grounded, file:line evidence)`
  - **P0** lighting hold-then-drag contract violation: `tunet_lighting_card.js:1451-1534` calls `createAxisLockedDrag()` without `longPressMs`/`onLongPress` (correct shape proven in `tunet_light_tile.js:783-823`)
  - lighting phone-stress horizontal padding regression at `390x844` (cumulative card-pad + scroll padding-inline + lighting-pad-x stack)
  - lighting all-on/off control missing — only `data-allOff` styling attribute exists
  - rooms row variant orb/icon sizing tokens read oversized at overview surface
  - weather forecast tiles use hardcoded px values bypassing em system
  - status summary matrix broadly visually broken (8+ bespoke font sizes drift from `--type-*` tokens; alarm-btn 0.5625em ≈9px is genuinely tiny)
  - media transport FF/RW track buttons do not actuate (service routing wired correctly to `_transportTarget`; investigate Sonos coordinator/source-specific limits)
  - cross-card visual consistency drift (corners, icon sizes, font sizes, spacing)
  - editor authoring coverage gap across most cards' `getConfigForm()`
  - tap-routing pattern incomplete (will be defined as canonical "tap → Adaptive Bubble popup" pattern)
  - **ghost horizontal scroll** at phone width — page allows horizontal scroll despite no intentional content beyond viewport; visual evidence captured 2026-05-04 08:54 user screenshot
  - house overview header card: dedicated "overview of the house" card does not exist — backlogged for CD12
- `GOVERNANCE FILES UPDATED 2026-05-04`
  - `Dashboard/Tunet/Docs/visual_defect_ledger.md` — Canonical Decision Matrix updated; new tranche-owned entries for CD6/CD7/CD8/CD9 reopens, CD11 escalation, CC1 proposed; ghost-horizontal-scroll defect added; popup-direction architecture decision recorded; per-card additions §4/§5/§7/§9/§10
  - `Dashboard/Tunet/CLAUDE.md` — Locked Direction Rules updated (popup direction → Bubble 3.2-beta.1; room composition → dedicated subviews; old language explicitly marked superseded). Plus full governance restructure: File Authority Map, Documentation Sync Protocol, Tranche Queue Rule, Plan Creation Protocol, Tranche Closure Protocol, Archive Read-Only Convention, Discoverability Quick-Reference
  - `Dashboard/Tunet/Docs/cards_reference.md` §Interaction Model Contract §3 Room Tiles — updated to Option A
  - `plan.md` (this file) — full restructure: 2,446 lines → ~200 lines; verbatim deltas moved to archive
  - `FIX_LEDGER.md` — top-of-file append rule documented; defect queue captured; no code shipped this session
  - `handoff.md` — current-state snapshot updated with reopens + reading order + Last Updated diff block
  - `Dashboard/Tunet/Docs/plans/archive/` — 8 archive files created with synthesis + verbatim deltas; INDEX.md added; pre-restructure git tag `tunet-docs-pre-restructure-2026-05-04` set as rollback marker

## Historical Session Deltas

All session deltas prior to 2026-05-04 have been moved to `Dashboard/Tunet/Docs/plans/archive/`. To find historical context for any specific tranche or date, start at `Dashboard/Tunet/Docs/plans/archive/INDEX.md`.
