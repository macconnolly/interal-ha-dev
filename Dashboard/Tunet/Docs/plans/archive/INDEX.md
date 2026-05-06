# Tunet Plan Archive — Index

> **What this is**: chronological + by-tranche-family index of all archived `plan.md` session deltas. When you need historical context for any tranche, find its archive file here. **Read-only after creation** per the Archive Read-Only Convention in `Dashboard/Tunet/CLAUDE.md`.
>
> **What this is NOT**: a place to track upcoming work (that's `plan.md` Tranche Queue), current state (that's `handoff.md`), open defects (that's `Dashboard/Tunet/Docs/visual_defect_ledger.md`), or completed fixes (that's `FIX_LEDGER.md`).

## How to find historical context

| Question | Where to read |
|----------|---------------|
| What did we do for tranche X? | `archive/<family>/plan_archive_X_*.md` synthesis section |
| When was tranche X opened/closed? | This index — Status column |
| What files were touched in tranche X? | `archive/<family>/plan_archive_X_*.md` "Files touched" section |
| What decisions were locked in tranche X? | `archive/<family>/plan_archive_X_*.md` "Key decisions" section |
| What's been superseded by later work? | `archive/<family>/plan_archive_X_*.md` "Superseded by" section |
| Original verbatim plan.md content? | `archive/<family>/plan_archive_X_*.md` "Original Session Deltas" section |
| Related claude-mem observations? | `archive/<family>/plan_archive_X_*.md` "Related claude-mem observations" section |

## Chronological index (newest → oldest)

| Period | Tranche family | Status | Archive file |
|--------|----------------|--------|--------------|
| 2026-04-23 → 2026-04-30 | SA-series (out-of-spec) | Closed; SA3 retargeting pending (Browser Mod → Bubble 3.2) | [`SA/plan_archive_SA_alarm_series_2026_04_23_to_04_30.md`](SA/plan_archive_SA_alarm_series_2026_04_23_to_04_30.md) |
| 2026-04-04 → 2026-04-30 | CD4 + CD5 + post-CD5 hover-clip | Closed | [`CD/plan_archive_CD4_CD5_2026_04_04_plus_post_cd5_hover_clip.md`](CD/plan_archive_CD4_CD5_2026_04_04_plus_post_cd5_hover_clip.md) |
| 2026-04-06 → 2026-04-30 | CD9 — Media | **Reopened 2026-05-04** (CD9a transport bug + CD9b popup composition) | [`CD/plan_archive_CD9_media_2026_04_06_to_04_30.md`](CD/plan_archive_CD9_media_2026_04_06_to_04_30.md) |
| 2026-04-06 | TI-series (Inbox) | Closed | [`TI/plan_archive_TI_inbox_series_2026_04_06.md`](TI/plan_archive_TI_inbox_series_2026_04_06.md) |
| 2026-04-05 → 2026-04-06 | CD8 — Weather | **Reopened 2026-05-04** (forecast tile px → em conversion) | [`CD/plan_archive_CD8_weather_2026_04_05_to_04_06.md`](CD/plan_archive_CD8_weather_2026_04_05_to_04_06.md) |
| 2026-04-04 → 2026-04-06 | CD6 + CD7 — Lighting + Rooms | **Reopened 2026-05-04** (P0 hold-drag + padding + all-on/off + orb sizing + room subviews) | [`CD/plan_archive_CD6_CD7_2026_04_04_to_04_06.md`](CD/plan_archive_CD6_CD7_2026_04_04_to_04_06.md) |
| 2026-04-02 → 2026-04-04 | CD0 + CD1 + CD2 + CD3 | Closed | [`CD/plan_archive_CD0_CD3_consistency_driver_2026_04_02_to_04_03.md`](CD/plan_archive_CD0_CD3_consistency_driver_2026_04_02_to_04_03.md) |
| 2026-03-06 → 2026-03-14 | T-011A — Pre-CD-program | **Superseded** by 2026-04-02 Card Rehabilitation Reset | [`T011A/plan_archive_T011A_pre_cd_program_2026_03.md`](T011A/plan_archive_T011A_pre_cd_program_2026_03.md) |

## By-tranche-family index

### CD-series (consistency-driver root program — `~/.claude/plans/flickering-herding-wolf.md`)

- `CD/plan_archive_CD0_CD3_consistency_driver_2026_04_02_to_04_03.md`
- `CD/plan_archive_CD4_CD5_2026_04_04_plus_post_cd5_hover_clip.md`
- `CD/plan_archive_CD6_CD7_2026_04_04_to_04_06.md`
- `CD/plan_archive_CD8_weather_2026_04_05_to_04_06.md`
- `CD/plan_archive_CD9_media_2026_04_06_to_04_30.md`

### CC-series (cross-card consistency — proposed 2026-05-04)

- (none yet — first archive will land when CC1 closes)

### SA-series (Sonos alarm — out-of-spec sibling — `~/.claude/plans/tunet-sonos-alarm-manage.md`)

- `SA/plan_archive_SA_alarm_series_2026_04_23_to_04_30.md`

### TI-series (Tunet Inbox — branch-local exception)

- `TI/plan_archive_TI_inbox_series_2026_04_06.md`

### T011A (pre-CD-program profile + sizing research)

- `T011A/plan_archive_T011A_pre_cd_program_2026_03.md`

## Verification

Pre-restructure plan.md line count: 2,446 lines. Post-restructure split:
- 8 archive files: ~2,420 verbatim lines (lines 64-2446 from plan.md, excluding today's 2026-05-04 delta which stays in plan.md)
- new plan.md: ~200 lines (header + Tranche Queue + Architecture Decisions Log + 2026-05-04 delta + pointers)
- pre-restructure git tag: `tunet-docs-pre-restructure-2026-05-04` (rollback marker)

## Maintenance protocol

When a tranche closes:
1. Confirm fixes are recorded at top of `FIX_LEDGER.md`
2. Move all session deltas for that tranche from `plan.md` to a new file: `archive/<family>/plan_archive_<tranche_id>_<short_name>_<date_range>.md`
3. Run synthesis subagent on the new file using the schema in `Dashboard/Tunet/CLAUDE.md` Tranche Closure Protocol
4. Add the new file to this INDEX.md (chronological + by-family)
5. Update `plan.md` Tranche Queue to remove the closed tranche
6. Update `Dashboard/Tunet/CLAUDE.md` Active Program if active tranche advanced

If a tranche reopens:
- Do NOT edit the existing archive file (read-only convention)
- Add a new "Reopened" entry inline in `plan.md` Tranche Queue and `visual_defect_ledger.md`
- When the reopen closes, write a NEW archive file: `archive/<family>/plan_archive_<tranche_id>_reopen<N>_<date_range>.md`
- Cross-link the original and reopen archives in their "Superseded by" / "Reopened by" sections

## Naming convention

- File pattern: `plan_archive_<TRANCHE_ID>[_reopen<N>]_<DATE_RANGE>.md`
- Family subfolders: `CD/` (consistency-driver), `CC/` (cross-card consistency), `SA/` (Sonos alarm), `TI/` (Tunet inbox), `T011A/` (pre-CD), and additional family folders as new families emerge
- Date format in filename: `YYYY_MM[_DD]_to_YYYY_MM[_DD]` (use day precision when range is < 1 month, otherwise month precision is fine)
