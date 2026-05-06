# OAL + tunet_inbox: Merge `tunet/inbox-integration` → `main` — Execution Plan

**Author**: Claude (Opus 4.7) on behalf of Mac Connolly
**Date**: 2026-05-05
**Worktree**: `/home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration`
**Source branch**: `tunet/inbox-integration`
**Target branch**: `main`
**Merge base**: `bb203eaf1cf547572eb2d493dcc0585d9f449d46`
**Merge mechanic**: Option (a) — `git merge --no-ff` then surgical revert of 4 sunrise/wake-up sub-hunks
**Scope**: Infrastructure-only merge — OAL package, Sonos package, `custom_components/tunet_inbox/`, integration docs, `.gitignore`/anomalous-path cleanup. Tunet UI changes (card JS, alarm card, popup YAML, lab/suite YAML, plan archives, screenshots) are **deferred to a separate follow-up merge plan** that will go through the M1 user-perspective review block in CLAUDE.md.

**Status**: DESIGN revised v3 — split into two merges. Awaiting `Proceed to implementation` for Merge 1 (infra-only).

> **Doc revision history**
> - v1 (2026-05-05): initial draft, predicted heavy surgical-edit playbook for OAL conflict
> - v2 (2026-05-06): updated after dry-run merge in throwaway worktree confirmed git auto-merge handles OAL/Sonos cleanly; only 6 doc files actually conflict. Surgical-edit playbook collapsed to a contingency. Main-publication question uncoupled from this merge per the popup B context in `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`.
> - v3 (2026-05-06): post-review repairs. **Split into two merges** (infra-first, UI-second) per reviewer concern about smuggling unverified UI through infrastructure promotion. Replaced raw `scp -r` deploy with the existing governed `npm run tinbox:*` pipeline (`tinbox:check` + `tinbox:test` + `tinbox:verify` + `tinbox:deploy:integration` + `tinbox:smoke`) per `custom_components/tunet_inbox/Docs/deploy_and_test.md`. Fixed verification grep counts (post=10, resolve=28, inbox automations regex). Reframed §7.11 snooze repro to align with the merge-blocking gate in §2.5a. Removed `git push origin main` from §8. Refreshed branch-geometry numbers (now 13 commits ahead of origin, 16 behind, `origin/tunet/inbox-integration` does not exist).

---

## 0. Executive Summary

The `tunet/inbox-integration` worktree carries a **coordinated architectural migration** of OAL's actionable-notification surface from blocking `wait_for_trigger` patterns to a fire-and-forget `tunet_inbox.post` + dedicated `tunet_inbox_action` event-handler model. That migration has three coupled layers:

1. **A brand-new HA Python integration** at `custom_components/tunet_inbox/` (40+ files, ~3,500 LOC) — services `tunet_inbox.post` / `tunet_inbox.resolve` and event bus `tunet_inbox_action`. **Does not exist on `main` at all.**
2. **38 `tunet_inbox.post` / `tunet_inbox.resolve` calls** added to `packages/oal_lighting_control_package.yaml` plus 6 brand-new automations (4 handler/resolver pairs + 2 shadow resolvers).
3. **27 `tunet_inbox` references** added to `packages/sonos_package.yaml` plus a parallel evening-alarm restructure and a separate (unrelated) reliability change to the `Sonos Alarm Playing` template.

Meanwhile `main` independently advanced **one narrow but important area**: the `oal_dynamic_sunrise_manager_v13` automation gained correctness refinements (date-validity guards, `mode: restart`, stale-`sunrise_time` clearing) and the `oal_wake_up_sequence_v13` automation was rewritten to use a configurable-group `light.turn_on` pattern instead of staged `adaptive_lighting.apply` calls.

The merge is **asymmetric**: ~99% of changes flow from worktree → main, with main carrying 4 specific sub-hunks that the worktree is missing. **Validated 2026-05-06 via in-memory `git merge-tree` plus an actual `git merge --no-commit` in a throwaway worktree**: git's 3-way merge handles the OAL and Sonos packages cleanly because main's f962bcf hunks (lines 3418-3546) and worktree's inbox additions (lines 573, 3609+, 4459+, 5454+, 5805+) occupy non-overlapping regions. Only 6 doc files actually conflict (Section 4.3 below). The surgical-edit playbook in v1 of this doc was prepared as primary path; it is now retained only as contingency in case auto-merge produces unexpected results.

The user's locked decisions are:

| Decision | Choice | Source |
|---|---|---|
| Wake-up sequence shape | "Selected wake lights" (`light.turn_on` + `group.oal_wakeup_lights` + fallback) | Main |
| Sunrise refinements (mode/validation/default-branch) | All three improvements | Main |
| Sonos `Sonos Alarm Playing` template | State-based (reload-resilient) | Worktree |
| Pause-state guard on inbox handlers | None added — user actions always win | Worktree (status quo) |
| Git mechanic | `git merge --no-ff` then surgical revert | Option (a) |
| Pre-merge state | All legitimate WIP committed on both sides; anomalous nested `home/` paths purged on main | New requirement |

The user also flagged a separate observed bug: **a Sonos alarm snoozed via the inbox today never re-triggered**. This is captured as a known issue and must be reproduced as a validation criterion post-merge.

---

## 1. Audit Findings — Pre-Merge State of Both Trees

### 1.1 Branch geometry (refreshed 2026-05-06)

```
                              bb203eaf (merge-base)
                                    │
              ┌─────────────────────┴─────────────────────┐
              │                                           │
   main: f962bcf "preserve cd11 status                tunet/inbox-integration:
        multi-mode baseline" (+157 OAL)                 0bcc279 "Add Tunet inbox
              │                                          integration snapshot"
              ▼                                          (+703 -196 OAL)
        ... (cd11 cycle + recent 3 commits;                    │
         see git log for current main HEAD) ...                ▼
              │                                          ... (CD9 closure,
              ▼                                          CD10 advance) ...
        main HEAD = 8929e7c (2026-05-06)                       │
        (was 682117d at v1)                                    ▼
                                                        worktree HEAD = 85172ed
                                                        (unchanged from v1)
```

**Live numbers as of 2026-05-06**:
- Local `main` is **13 commits ahead** of `origin/main` (was 10 at v1; +3 since session started)
- Worktree (`tunet/inbox-integration`) is **6 commits ahead** of `origin/main` AND **16 commits behind** `origin/main`. The "behind" count is because `origin/main` has commits the worktree doesn't have — origin/main has been pushed to since the worktree's bb203eaf merge-base.
- **`origin/tunet/inbox-integration` does not exist.** Push with `-u origin tunet/inbox-integration` to publish per §3.3.
- **Local main is intentionally not pushed.** Per §3.3a, that publication is the popup B decision and is decoupled from this merge.

⚠️ **Audit-staleness gate**: numbers above were captured at the time of v3 doc revision. Implementation §3.0 requires a fresh re-audit immediately before §3.1 begins. Branch geometry can shift if other sessions commit during the planning window.

### 1.2 OAL package divergence (the headline number)

| Metric | Worktree | Main | Delta |
|---|---|---|---|
| File size (bytes) | 458,651 | 435,911 | +22,740 (worktree larger) |
| Total lines | 9,810 | 9,303 | +507 (worktree larger) |
| `git diff` lines (main..HEAD) | — | — | 1,365 lines, 35 hunks |
| `tunet_inbox.post` / `.resolve` calls | 38 | 0 | +38 |
| Total `id:` automations | 43 | 39 | +4 (handler/resolver pairs) |
| New `input_datetime` helpers | 1 (`oal_last_tv_mode_prompt_notification`) | 0 | +1 |

### 1.3 Sonos package divergence

| Metric | Worktree | Main | Delta |
|---|---|---|---|
| `tunet_inbox` references | 27 | 0 | +27 |
| `Sonos Alarm Playing` template | State-based, polled | Trigger-based, event-driven | Architectural |
| `evening_alarm_check_notification` script | Inbox-aware, separate cleanup resolver | Blocking notify with confirmable wait | Restructured |
| New helper | `sonos_last_alarm_notification` (input_datetime) | — | +1 |
| Diff stat | — | — | +318 / -139 |

### 1.4 Worktree (`tunet/inbox-integration`) — uncommitted state

**42 modified, 83 untracked.** All representable as the following buckets:

| Bucket | Files | Recommended disposition |
|---|---|---|
| `.claude/` config drift | `.claude/CLAUDE.md`, `.claude/settings.local.json` | Commit |
| Top-level `AGENTS.md` + `Dashboard/CLAUDE.md` | 2 files | Commit |
| Tunet `CLAUDE.md` family | `Dashboard/Tunet/{AGENTS.md,CLAUDE.md}`, `Dashboard/Tunet/{Agent-Reviews,Cards/v3,Cards/v3/tests,Cards/v3/tests/helpers,Docs,Docs/plans,Mockups,scripts}/CLAUDE.md` | Commit |
| Top-level docs/packages CLAUDE | `docs/CLAUDE.md`, `packages/CLAUDE.md`, `Dashboard/cards/CLAUDE.md` | Commit |
| Tunet card JS (CD9 closure) | `tunet_actions_card.js`, `tunet_lighting_card.js`, `tunet_scenes_card.js`, `tunet_sonos_card.js` | Commit |
| Tunet test | `tests/interaction_source_contract.test.js` | Commit |
| Tunet docs (CD9-CD11) | `cards_reference.md`, `nav_popup_ux_direction.md`, `sections_layout_matrix.md`, `sonos_alarm_popup_reference.md`, `visual_defect_ledger.md` | Commit |
| Tunet config YAMLs | `tunet-card-rehab-lab.yaml`, `tunet-suite-config.yaml`, `tunet-suite-storage-config.yaml` | Commit |
| Tunet scripts | `tunet_playwright_review.mjs`, `update_tunet_v3_resources.mjs` | Commit |
| Build pipeline | `build.mjs`, `package-lock.json` | Commit |
| `custom_components/tunet_inbox/` ledgers | `Docs/execution_ledger.md`, `FIX_LEDGER.md`, `handoff.md`, `plan.md` | Commit |
| Top-level state | `FIX_LEDGER.md`, `handoff.md`, `plan.md` | Commit |
| Sonos package | `packages/sonos_package.yaml` | Commit |
| **Untracked**: new alarm card & test | `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js`, `tests/alarm_bespoke.test.js` | Commit |
| **Untracked**: tranche docs | `Dashboard/Tunet/Docs/tranches/`, `cd11_closure_plan_2026_05_04.md`, `cd11_visual_polish_plan_2026_05_05.md`, `cross_card_*.md` | Commit |
| **Untracked**: plan archive | `Dashboard/Tunet/Docs/plans/archive/` | Commit |
| **Untracked**: alarm popup config | `Dashboard/Tunet/tunet-alarm-edit-popup.yaml` | Commit |
| **Untracked**: alarm probe script | `Dashboard/Tunet/scripts/tunet_alarm_interaction_probe.mjs` | Commit |
| **Untracked**: tunet_inbox tranche doc | `custom_components/tunet_inbox/Docs/tranches/TI5A1_*.md` and parent `CLAUDE.md` files | Commit |
| **Untracked**: backup YAMLs | `Backups/sonos_package_pre_alarm_fixes_*.yaml`, `Backups/tunet-card-rehab-lab_pre_SA2_*.yaml` | **DECISION REQUIRED** — keep tracked or gitignore `Backups/`? |
| **Untracked**: `~58 PNG screenshots` in repo root | `actions-*.png`, `alarm_*.png`, `popup_*.png`, `scenes-*.png`, `sonos*.png`, `lighting-*.png`, `lab-*.png`, `cd9-*.png`, `cd11_*.png`, `livingroom_popup_for_reference.png`, `polish_review_post_push.png` | **GITIGNORE** — visual evidence, not code; pollutes repo root |
| **Untracked**: `snap-actions.yml` | 1 file | **DECISION REQUIRED** — review purpose; commit or gitignore |
| **Untracked**: `custom_components/CLAUDE.md` | 1 file | Commit |

### 1.5 Main — uncommitted state

**~20 modified, 3 untracked.** Buckets:

| Bucket | Files | Recommended disposition |
|---|---|---|
| Tunet `CLAUDE.md` family (parallel drift) | `AGENTS.md`, `Dashboard/Tunet/{AGENTS.md,CLAUDE.md,Agent-Reviews/CLAUDE.md,Mockups/CLAUDE.md,Docs/CLAUDE.md,scripts/CLAUDE.md}`, `Dashboard/Tunet/Cards/v3/{CLAUDE.md,tests/CLAUDE.md,tests/helpers/CLAUDE.md}`, `docs/CLAUDE.md` | Commit |
| Cards reference doc | `Dashboard/Tunet/Docs/cards_reference.md` | Commit |
| **Anomalous tracked nested-path files** | `home/mac/HA/implementation_10/Dashboard/Tunet/CLAUDE.md`, `home/mac/HA/implementation_10/Dashboard/Tunet/Docs/CLAUDE.md` | **`git rm`** — written by a prior session that resolved absolute paths against repo root rather than filesystem root; per memory ID #11201 these are pollution; f962bcf's commit message explicitly excludes them |
| **Anomalous untracked nested-path files** | `home/mac/.claude/plans/CLAUDE.md`, `home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/CLAUDE.md`, `home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tests/CLAUDE.md` | **`rm`** + add `/home/` to `.gitignore` — same root cause |
| **Submodules with modified content** | `.claude/worktrees/{crispy-fluttering-allen,harmonic-doodling-corbato,hazy-seeking-adleman,starry-moseying-dawn,valiant-meandering-lecun}` | **DO NOT TOUCH** — these are independent worktree branches with their own WIP, owned elsewhere |

### 1.6 The anomalous `home/` directory on main

```
/home/mac/HA/implementation_10/home/                 ← created 2026-04-02
  └─ mac/
      └─ .claude/plans/CLAUDE.md                     (untracked, 1 file)
      └─ HA/implementation_10/
          └─ Dashboard/Tunet/CLAUDE.md               (TRACKED, modified)
          └─ Dashboard/Tunet/Docs/CLAUDE.md          (TRACKED, modified)
          └─ Dashboard/Tunet/Cards/v3/CLAUDE.md      (untracked)
          └─ Dashboard/Tunet/Cards/v3/tests/CLAUDE.md (untracked)
```

This was created when a prior Claude session resolved absolute paths like `/home/mac/HA/implementation_10/Dashboard/Tunet/CLAUDE.md` **against the repo root** rather than filesystem root, producing the doubly-nested path. f962bcf's commit message explicitly noted: *"Intentionally excludes malformed nested home/mac/... path pollution and `.claude/worktrees/*` pointer drift."* Two of the resulting files were nevertheless tracked into earlier commits and remain in the index.

**Cleanup is mandatory before this merge** because the merge will move both trees and any anomalous tracked content will get carried forward. The disposition is: `git rm` the tracked ones, `rm -rf` the directory, and add `/home/` to `.gitignore`.

---

## 2. The Merge Decisions, Locked

### 2.1 OAL — keep main's sunrise + wake-up cluster (4 sub-hunks)

**Sub-hunk A: `mode: restart` on `oal_dynamic_sunrise_manager_v13`** (line 3425 in worktree file)

This automation is triggered by Sonos alarm changes, by the boolean toggle, and at 03:05 daily. Without `mode: restart`, a rapid sequence of alarm changes would queue duplicate runs; `restart` collapses them. Main's improvement.

**Sub-hunk B: `valid_wake_alarm` validation block + `choose:` action structure**

The merge-base / worktree version simply gates on `alarm_timestamp > 0`. Main's f962bcf version computes `earliest_alarm_date`, `today_date`, `next_rising_timestamp`, `next_rising_date`, and the composite `valid_wake_alarm` boolean which only fires the synthetic-sunrise arming when **all** of the following are true:
- `oal_disable_next_sonos_wakeup` is off
- An alarm exists (`alarm_timestamp > 0`)
- The alarm is for *today's date* (not a future-dated alarm that the sensor sometimes surfaces)
- The next sunrise is *still today* (not tomorrow)
- The alarm is before today's sunrise

Without this gate, a Sonos alarm scheduled for tomorrow morning could prematurely arm tonight's adaptive lighting with a synthetic sunrise time. Main's correctness fix.

**Sub-hunk C: `default:` branch in `choose:` clearing stale `sunrise_time`**

When `valid_wake_alarm` is false, instead of doing nothing, main iterates `al_switches` and resets `sunrise_time` to `"None"` on any switch that still carries a non-empty value. This is a self-healing cleanup: if yesterday's wake arming left a `sunrise_time` set on the switches and today there's no valid wake alarm, the switches return to their natural sunrise. Without this, a stale `sunrise_time` from yesterday could persist and skew today's adaptive lighting. Main's correctness fix.

**Sub-hunk D: `oal_wake_up_sequence_v13` body** (line 3471 in worktree file)

The merge-base / worktree version is a 6-step staged brightening that calls `adaptive_lighting.apply` on `bedroom_primary` at 50%, `main_living` (with `lights: light.entryway_lamp`) at 50%, then after a 10-minute delay raises `kitchen_island` and `kitchen_undercabinet` to 80%, and finally bedroom to 80%. All calls use `set_manual_control: true` to prevent AL from fighting the rise.

Main's version uses a **configurable group** (`group.oal_wakeup_lights`) with a **hardcoded fallback list** (`light.bedroom_primary_lights`, `light.column_lights`, `light.entryway_lamp`), filtered to entities whose ID starts with `light.`, and issues a **single `light.turn_on`** at 50% with a 600s transition.

User decision: **keep main's "selected wake lights" pattern.** It's group-driven, easier to retarget without YAML edits, and has a stable fallback if the group is empty.

### 2.2 OAL — keep worktree for everything else

The full inbox migration:
- 38 `tunet_inbox.post` / `tunet_inbox.resolve` service calls scattered across the TV-mode, override-reminder, override-expiring, bridge-state, presence-prompt, and timer-arbiter sections
- 1 new `input_datetime.oal_last_tv_mode_prompt_notification` helper (line 576)
- `tv_prompt_debounce_passed` (>300s) gate on TV mode prompts
- 6 new automations:
  - `oal_v13_override_reminder_inbox_action_handler` (line 4494, mode: queued, max: 4)
  - `oal_v13_override_reminder_inbox_resolver` (line 4538, mode: single)
  - `oal_v13_override_expiring_inbox_action_handler` (line 4597, mode: queued, max: 4)
  - `oal_v13_override_expiring_inbox_resolver` (line 4653, mode: single)
  - `oal_v14_tv_inbox_shadow_resolver` (line 5473, mode: queued, max: 10)
  - `oal_v14_timer_notification_shadow_resolver` (line 5869, mode: queued, max: 10)
- Dual event triggers everywhere (parallel `mobile_app_notification_action` + `tunet_inbox_action`)
- `clear_notification` magic strings replacing descriptive `notify.notify` messages at action-completion sites (Companion App dismissal pattern)
- Mobile deep-link URLs (`data.url: "/tunet-inbox-yaml/inbox"`)
- Zone-scoped inbox keys (`oal_override_expiring:{zone_id}`)

### 2.3 Sonos — keep worktree fully

- All 27 `tunet_inbox` references
- The state-based `Sonos Alarm Playing` template (chosen explicitly for HA-restart resilience)
- The restructured `evening_alarm_check_notification` script with separate cleanup resolver
- The `sonos_last_alarm_notification` helper

### 2.4 Pause-state guard on new inbox handlers

The new `oal_v13_override_reminder_inbox_action_handler`, `oal_v13_override_expiring_inbox_action_handler`, and the two `_inbox_resolver` automations do **not** check `input_boolean.oal_system_paused`. Verified: the worktree's full OAL file has 25 `oal_system_paused` references, **none** inside these new handler automations.

User decision: **leave as-is.** A user tapping an inbox action is a deliberate gesture that should not be silently no-op'd by a paused state. If the user intends to keep lights frozen, they should not tap "Reset to Adaptive."

This represents a documented behavior change vs main's `wait_for_trigger` automation (which inherited the parent automation's pause condition). It is filed as an accepted Invariant #7 deviation, not a violation, because the deviation is by design.

### 2.5a Snooze re-trigger bug — pre-merge investigation gate

**User-flagged on 2026-05-06**: a Sonos alarm snoozed via the inbox earlier in the day never re-triggered.

**Location confirmed via grep on 2026-05-06**:
- `packages/sonos_package.yaml` lines 140-180: 5 `input_text` helpers tracking snoozed alarm state per speaker (`sonos_snoozed_alarm_bedroom`, `_bath`, `_kitchen`, `_living_room`, `_dining_room`)
- `packages/sonos_package.yaml` line 2597: `script.sonos_snooze_next_alarm` ("Snooze the currently playing alarm, or next upcoming alarm if none playing")
- `custom_components/tunet_inbox/`: **zero implementation** of snooze. Only one mention in `Docs/tranches/TI4_sonos_pilot_migration.md` speculating about future inbox dismiss vs snooze handling.

**What this means for the merge**:
- The bug lives in the worktree's `sonos_package.yaml`, which IS what we're merging into main.
- main does not have any conflicting snooze-related changes (f962bcf only touched OAL).
- **If we merge as-is, the bug propagates to main.**

**v3 update (2026-05-06) — TRACE COMPLETE**: pre-merge trace executed and documented in **§10.2a** below. Summary:
- **Root cause hypothesis**: Sonos device "already-fired-today" semantics — time-shifting an alarm via `sonos.update_alarm` does NOT cause Sonos to re-arm today's already-consumed instance
- **Coupling**: NONE — independent of the worktree's state-based template choice or any recent script simplification
- **Pre-existence**: YES — bug is in worktree's current deployed state, not introduced by the merge
- **Fix scope**: MEDIUM — architectural rework (HA-side timer + `media_player.play_media`), not a one-line patch
- **Planned tranche**: `SA5_sonos_snooze_re_trigger_fix` (post-merge, separate)

**Disposition**: merge ships with the bug as a documented known issue. User-facing impact during soak: snooze silences but does not re-fire. Captured in `handoff.md` after merge per §14 next actions.

The merge is **NOT gated** on this bug. See §10.2a for full trace.

### 2.5 Custom component dependency

`custom_components/tunet_inbox/` — the entire Python integration — moves from worktree to main. Specifically:

```
custom_components/tunet_inbox/
├── __init__.py                   (234 LOC)
├── config_flow.py                (169 LOC)
├── const.py                      (115 LOC)
├── diagnostics.py                ( 43 LOC)
├── events.py                     ( 56 LOC)
├── manager.py                    (663 LOC)
├── manifest.json                 ( 11 LOC)
├── mobile.py                     (153 LOC)
├── models.py                     (371 LOC)
├── services.py                   (261 LOC)
├── services.yaml                 (122 LOC)
├── storage.py                    ( 52 LOC)
├── translations/en.json          ( 46 LOC)
├── Docs/                         (multiple plan/tranche docs)
├── scripts/                      (deploy_tunet_inbox.sh, check_tunet_inbox.sh, etc.)
├── handoff.md, plan.md, FIX_LEDGER.md
└── ...
```

Total: ~3,500 LOC of Python plus deploy scripts and docs.

---

## 3. Pre-Merge Cleanup Playbook (Infra-Only)

This is the bridge between current state (substantial WIP on both sides) and merge-ready state. The **scope is infrastructure only** per the v3 split: the worktree's UI WIP (Tunet card JS, alarm card, popup YAML, lab/suite YAML, plan archives, screenshots) **stays uncommitted** on `tunet/inbox-integration` and will be addressed in a separate UI merge plan after this one lands.

### 3.0 Re-audit immediately before cleanup begins

Branch geometry and uncommitted state can shift between plan authoring and plan execution. Before any cleanup commit, run:

```bash
cd /home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration
echo "=== Worktree status ===" && git status
echo "=== Worktree branch geometry ===" && git rev-list --left-right --count origin/main...HEAD
echo "=== Worktree origin remote? ===" && git ls-remote --heads origin tunet/inbox-integration

cd /home/mac/HA/implementation_10
echo "=== Main status ===" && git status
echo "=== Main branch geometry ===" && git rev-list --left-right --count origin/main...main
echo "=== Main HEAD ===" && git log --oneline -1
```

If any of these results differ materially from §1.1 numbers, **stop** and update the plan before continuing.

### 3.1 Worktree cleanup (INFRA ONLY)

```bash
cd /home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration

# ---- 3.1.1: Update .gitignore for repo-root debris ----
# VERIFIED 2026-05-06: doc references in Dashboard/Tunet/Docs/ use absolute
# /home/mac/HA/implementation_10/ paths or /tmp/tunet-playwright-review/
# paths or reference audit-*.png files that don't exist in the repo. The
# specific debris patterns below are SAFE to gitignore — no doc references
# break.
#
# v3 user decisions (2026-05-06): all items in §11.A.2-4 confirmed
# gitignore. Specifically:
# - PNG screenshots in repo root: gitignored (allowlist patterns below)
# - Backups/ directory: gitignored (§6.2 still writes timestamped backups
#   there for rollback; they exist on disk during the rollback window
#   but are not tracked)
# - snap-actions.yml: gitignored
# - /home/ on main: gitignored as hard guard against nested-path pollution
#
# Append to .gitignore:
cat >> .gitignore <<'EOF'

# Repo-root screenshot debris (M1 evidence, kept on disk, not tracked)
/actions-*.png
/alarm_*.png
/popup_*.png
/scenes-*.png
/sonos_*.png
/sonos-*.png
/lighting-*.png
/lab-*.png
/cd9-*.png
/cd11_*.png
/livingroom_popup_for_reference.png
/polish_review_post_push.png
/alarm_card_post_redesign.png
/alarm_edit_popup_redesign.png

# Backup snapshots (timestamped folders written by §6.2 deploy step;
# kept on disk during rollback window, not tracked)
/Backups/

# Stray scratch files
/snap-actions.yml
EOF

git add .gitignore
git commit -m "chore(gitignore): exclude screenshot debris, backups, scratch from repo root"

# ---- 3.1.2: Doc/CLAUDE.md drift across all subdirectories ----
git add .claude/CLAUDE.md .claude/settings.local.json
git add AGENTS.md Dashboard/CLAUDE.md docs/CLAUDE.md packages/CLAUDE.md \
        Dashboard/cards/CLAUDE.md
git add Dashboard/Tunet/AGENTS.md Dashboard/Tunet/CLAUDE.md
git add Dashboard/Tunet/Agent-Reviews/CLAUDE.md \
        Dashboard/Tunet/Mockups/CLAUDE.md \
        Dashboard/Tunet/scripts/CLAUDE.md \
        Dashboard/Tunet/Docs/CLAUDE.md \
        Dashboard/Tunet/Docs/plans/CLAUDE.md
git add Dashboard/Tunet/Cards/v3/CLAUDE.md \
        Dashboard/Tunet/Cards/v3/tests/CLAUDE.md \
        Dashboard/Tunet/Cards/v3/tests/helpers/CLAUDE.md
git commit -m "chore(docs): sync CLAUDE.md drift across Tunet + integration trees"

# ---- 3.1.3, 3.1.4 — DEFERRED to UI merge (Merge 2) ----
#
# The following file groups are explicitly NOT committed in this merge.
# They stay modified-but-unstaged on `tunet/inbox-integration` and will be
# committed + merged in the follow-up UI merge plan, after they pass M1
# user-perspective screenshot review per CLAUDE.md.
#
# Card JS (modified):
#   Dashboard/Tunet/Cards/v3/tunet_actions_card.js
#   Dashboard/Tunet/Cards/v3/tunet_lighting_card.js
#   Dashboard/Tunet/Cards/v3/tunet_scenes_card.js
#   Dashboard/Tunet/Cards/v3/tunet_sonos_card.js
# Card JS (untracked):
#   Dashboard/Tunet/Cards/v3/tunet_alarm_card.js
# Tests (modified):
#   Dashboard/Tunet/Cards/v3/tests/interaction_source_contract.test.js
# Tests (untracked):
#   Dashboard/Tunet/Cards/v3/tests/alarm_bespoke.test.js
# Tunet docs (modified):
#   Dashboard/Tunet/Docs/cards_reference.md
#   Dashboard/Tunet/Docs/nav_popup_ux_direction.md
#   Dashboard/Tunet/Docs/sections_layout_matrix.md
#   Dashboard/Tunet/Docs/sonos_alarm_popup_reference.md
#   Dashboard/Tunet/Docs/visual_defect_ledger.md
# Plans/tranches/scripts (untracked or modified):
#   Dashboard/Tunet/Docs/plans/archive/
#   Dashboard/Tunet/Docs/plans/cd11_closure_plan_2026_05_04.md
#   Dashboard/Tunet/Docs/plans/cd11_visual_polish_plan_2026_05_05.md
#   Dashboard/Tunet/Docs/plans/cross_card_*.md
#   Dashboard/Tunet/Docs/tranches/
#   Dashboard/Tunet/scripts/tunet_playwright_review.mjs
#   Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs
#   Dashboard/Tunet/scripts/tunet_alarm_interaction_probe.mjs
# Lab/suite/popup YAML (modified or untracked):
#   Dashboard/Tunet/tunet-card-rehab-lab.yaml
#   Dashboard/Tunet/tunet-suite-config.yaml
#   Dashboard/Tunet/tunet-suite-storage-config.yaml
#   Dashboard/Tunet/tunet-alarm-edit-popup.yaml
# Screenshot evidence (untracked):
#   ~58 PNG files in repo root (gitignored in §3.1.1, NOT staged here)
#
# DO NOT `git add` any of the above in this merge.
# Verify with `git status` after §3.1.7 commit — these should still be
# modified/untracked.

# ---- 3.1.5: tunet_inbox component handoff/plan/ledger and tranche doc ----
git add custom_components/CLAUDE.md
git add custom_components/tunet_inbox/CLAUDE.md \
        custom_components/tunet_inbox/Docs/CLAUDE.md \
        custom_components/tunet_inbox/Docs/execution_ledger.md \
        custom_components/tunet_inbox/Docs/tranches/CLAUDE.md \
        custom_components/tunet_inbox/Docs/tranches/TI5A1_sonos_apple_tv_no_response_timeout.md \
        custom_components/tunet_inbox/FIX_LEDGER.md \
        custom_components/tunet_inbox/handoff.md \
        custom_components/tunet_inbox/plan.md
git commit -m "docs(tunet_inbox): execution ledgers, plan updates, TI5A1 tranche"

# ---- 3.1.6: Build pipeline + top-level state ----
git add build.mjs package-lock.json FIX_LEDGER.md handoff.md plan.md
git commit -m "chore: build pipeline + top-level state docs"

# ---- 3.1.7: Sonos package WIP (this is what gets merged into main) ----
git add packages/sonos_package.yaml
git commit -m "wip(sonos): integration snapshot before merge to main"

# ---- 3.1.8: Backups — RESOLVED v3 (gitignored, see §3.1.1) ----
# User decision 2026-05-06: Backups/ is gitignored per §3.1.1.
# Existing untracked backup files (sonos_package_pre_alarm_fixes_*.yaml,
# tunet-card-rehab-lab_pre_SA2_*.yaml) remain on disk as recovery
# artifacts but are not committed.
# No git action needed in this step.

# ---- 3.1.9: Verify INFRA cleanup is complete; UI WIP STILL UNCOMMITTED ----
git status
# Expected outcome: only Tunet UI files (cards, tests, popup yaml, lab yaml,
# plans, tranches, screenshots) appear as modified or untracked. All infra
# files are committed. The repo is "infra-clean", not "fully clean".
#
# This is the desired state. Do NOT chase a fully clean working tree —
# that would either drag UI work into this merge or discard it.
```

### 3.2 Main cleanup

```bash
cd /home/mac/HA/implementation_10
git checkout main   # confirm we're on main

# ---- 3.2.1: Purge anomalous nested home/ pollution ----
# Untrack the two committed-by-mistake files
git rm home/mac/HA/implementation_10/Dashboard/Tunet/CLAUDE.md
git rm home/mac/HA/implementation_10/Dashboard/Tunet/Docs/CLAUDE.md

# Physically remove the entire nested tree.
# CRITICAL: use the FULL ABSOLUTE path. Per global memory rule
# (feedback_no_rm_rf_relative_paths.md), never write `rm -rf home/`
# even though we're inside the repo — the relative form is one
# typo away from `rm -rf /home/`.
rm -rf /home/mac/HA/implementation_10/home

# Add /home/ to .gitignore so it cannot be re-tracked
echo "" >> .gitignore
echo "# Anomalous nested-path guard (see docs/oal_inbox_merge_to_main_plan_2026_05_05.md)" >> .gitignore
echo "/home/" >> .gitignore
git add .gitignore

git commit -m "chore: purge anomalous nested home/ pollution and add gitignore guard"

# ---- 3.2.2: Stage Tunet doc drift on main ----
git add AGENTS.md \
        Dashboard/Tunet/AGENTS.md \
        Dashboard/Tunet/CLAUDE.md \
        Dashboard/Tunet/Agent-Reviews/CLAUDE.md \
        Dashboard/Tunet/Mockups/CLAUDE.md \
        Dashboard/Tunet/Docs/CLAUDE.md \
        Dashboard/Tunet/scripts/CLAUDE.md \
        Dashboard/Tunet/Cards/v3/CLAUDE.md \
        Dashboard/Tunet/Cards/v3/tests/CLAUDE.md \
        Dashboard/Tunet/Cards/v3/tests/helpers/CLAUDE.md \
        Dashboard/Tunet/Docs/cards_reference.md \
        docs/CLAUDE.md
git commit -m "chore(docs): sync CLAUDE.md drift on main"

# ---- 3.2.3: Submodules — DO NOT TOUCH ----
# `.claude/worktrees/{crispy-fluttering-allen, harmonic-doodling-corbato,
#  hazy-seeking-adleman, starry-moseying-dawn, valiant-meandering-lecun}`
# These show as "modified content" in submodules. They are independent
# worktree branches with their own owners/WIP. Leave alone.

# ---- 3.2.4: Verify ----
git status
# Expected: only the 5 submodule "modified content" lines remain
# Working tree is otherwise clean.
```

### 3.3 Push the worktree branch to origin (safety net for THIS merge)

```bash
# From worktree — push only this branch, not main
cd /home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration
git push -u origin tunet/inbox-integration
```

After this, `origin/tunet/inbox-integration` exists as the rollback anchor for the worktree side of the merge. If anything in the merge goes sideways, `git reset --hard origin/tunet/inbox-integration` recovers cleanly.

### 3.3a Main publication — uncoupled from this merge (USER DECISION, NOT THIS PLAN)

Per the session arc captured in `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`:

> *"The popup chain commits are still on `main`, unpushed. Whatever you decide to do with them — push, reset, fix, abandon — you have the authority and the eye for it. I trust your judgment on the work."*

The 10 unpushed commits on main are the **popup B chain** that the prior session left for the user to decide on. Publishing them is a load-bearing decision in its own right, with its own quality criteria (does popup B meet the visual-quality bar that originally caused its termination?). **It must NOT be coupled with this merge's safety-net pushing.**

This plan therefore does not include `git push origin main` in §3.3 or anywhere else. Main publication is the user's standalone call, made on its own merits, on its own timeline. If at end-of-merge the user decides to publish main, that is a separate operation outside this runbook.

**Implication for rollback safety**: until main is pushed, `git reset --hard origin/main` would discard those 10 commits. If we need to roll back the merge (Section 9), use `git revert -m 1 <merge-sha>` instead, OR `git reset --hard <pre-merge-main-sha>` captured BEFORE Step 4.1. The plan now records the pre-merge main SHA at Step 4.1 explicitly for this purpose.

---

## 4. The Merge Itself

### 4.1 Create the merge branch (off main, not directly merge into main)

```bash
cd /home/mac/HA/implementation_10
git checkout main
# DO NOT run `git pull --ff-only` here — main is intentionally not pushed
# per §3.3a. Verify local main is what we expect:
git log --oneline -1
# Capture the pre-merge main SHA for rollback safety:
PRE_MERGE_MAIN=$(git rev-parse HEAD)
echo "Pre-merge main SHA (for emergency rollback): $PRE_MERGE_MAIN"
# Save this to a file so it survives a session restart:
echo "$PRE_MERGE_MAIN" > /tmp/pre_merge_main.sha

git checkout -b merge/tunet-inbox-into-main
```

Working on a merge branch (instead of merging directly into main) gives us:
- A clean rollback path (`git checkout main && git branch -D merge/tunet-inbox-into-main`) if anything goes wrong
- Room to validate, fix, and re-validate without main moving
- A separate merge commit graph that we can review before fast-forwarding main to it
- A captured pre-merge SHA in case a session restart loses our git context

### 4.2 Perform the merge

```bash
git merge tunet/inbox-integration --no-ff -m "$(cat <<'EOF'
Merge tunet/inbox-integration: tunet_inbox integration + parallel notification rails

- Adds custom_components/tunet_inbox/ (~3,500 LOC Python integration)
- Adds 38 tunet_inbox.post/.resolve calls across OAL package
- Adds 27 tunet_inbox refs across Sonos package
- Adds 6 new OAL automations (4 handler/resolver pairs + 2 shadow resolvers)
- Migrates Sonos Alarm Playing template to state-based for reload resilience
- Restructures evening_alarm_check_notification with separate cleanup resolver
- Preserves main's f962bcf sunrise + wake-up improvements via post-merge surgical revert

Per docs/oal_inbox_merge_to_main_plan_2026_05_05.md.
EOF
)"
```

### 4.3 Actual conflicts (validated by dry-run on 2026-05-06)

A `git merge-tree --merge-base` dry-run plus a real `git merge --no-ff --no-commit` in a throwaway worktree confirmed the **actual** conflict surface. It is smaller than v1 of this plan predicted:

| File | Conflict cause | Resolution strategy |
|---|---|---|
| `Dashboard/Tunet/CLAUDE.md` | Both branches edited the same `CLAUDE.md` lines | Hand-merge by section |
| `Dashboard/Tunet/Docs/cards_reference.md` | Parallel doc evolution | Hand-merge by section |
| `Dashboard/Tunet/Docs/visual_defect_ledger.md` | Parallel append + section edits | Hand-merge; concatenate non-overlapping entries |
| `FIX_LEDGER.md` | Parallel append-only ledger writes | Concatenate by date |
| `handoff.md` | Parallel handoff state | Hand-merge; usually accept worktree (more recent) |
| `plan.md` | Parallel plan evolution | Hand-merge by section |

**Files that auto-merge cleanly (no manual work needed)**:
- `packages/oal_lighting_control_package.yaml` — confirmed: `mode: restart`, `valid_wake_alarm`, default-branch clearing, "Selected Lights" alias, all 38 inbox call sites, 5 of 6 inbox-named automations all present in the auto-merged result. (The 6th, `oal_v14_timer_notification_shadow_resolver`, doesn't have "inbox" in its ID; verified separately.)
- `packages/sonos_package.yaml` — confirmed: state-based template, 27 `tunet_inbox` references, snooze helpers all present
- `Dashboard/Tunet/Cards/v3/tests/audio_cd9_bespoke.test.js` — auto-merged
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js` — auto-merged
- `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` — auto-merged
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml` — auto-merged
- `package.json` — auto-merged

**Files NOT in the conflict list that v1 predicted would conflict**:
- `AGENTS.md` (root) — auto-merges; v1 was wrong
- `Dashboard/Tunet/AGENTS.md` — auto-merges; v1 was wrong

### 4.4 Conflict resolution — OAL package

> **v2 update (2026-05-06)**: Dry-run confirmed OAL auto-merges cleanly. The surgical playbook below is now **CONTINGENCY ONLY** — execute it only if `git merge` reports a conflict on `packages/oal_lighting_control_package.yaml`, or if post-merge verification (Step 4.4.6) shows that any of sub-hunks A/B/C/D failed to land.
>
> **Primary path** (expected to succeed):
> 1. The merge command in §4.2 will auto-merge OAL silently. No conflict markers will appear.
> 2. Run the verification greps in Step 4.4.6 below.
> 3. If all greps return expected counts, OAL is done — proceed to §4.5.
> 4. If any verification fails, fall back to the surgical steps below.

**Surgical contingency, step by step:**

**Step 4.4.1**: Accept worktree's OAL as the base.

```bash
git checkout --theirs packages/oal_lighting_control_package.yaml
git add packages/oal_lighting_control_package.yaml
```

After this, the OAL file matches the worktree's version exactly (with all the inbox migration intact, but missing main's sunrise/wake-up improvements).

**Step 4.4.2**: Restore Sub-hunk A — `mode: restart` on `oal_dynamic_sunrise_manager_v13`.

Locate the automation header (around line 3425 in the worktree file). It currently looks like:

```yaml
  - id: oal_dynamic_sunrise_manager_v13
    alias: "OAL v13 - Dynamic Sunrise Manager"
    trigger:
```

Insert `mode: restart` between the `alias:` and `trigger:` lines:

```yaml
  - id: oal_dynamic_sunrise_manager_v13
    alias: "OAL v13 - Dynamic Sunrise Manager"
    mode: restart
    trigger:
```

Also in the same automation, the worktree has only one trigger (Sonos alarm timestamp + 03:05 time). Main has an additional trigger on the boolean toggle:

```yaml
    trigger:
      - platform: state
        entity_id: sensor.sonos_upcoming_alarms
        attribute: earliest_alarm_timestamp
      - platform: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup    # ADD
      - platform: time
        at: "03:05:00"
```

The worktree has a `condition:` block that gates on the boolean being off:

```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
```

**Remove this `condition:` block entirely** when restoring main's pattern, because main's `valid_wake_alarm` template handles the boolean check inline (`skip_wakeup`).

**Step 4.4.3**: Restore Sub-hunk B — full `valid_wake_alarm` variables block.

Replace the worktree's `variables:` block:

```yaml
    variables:
      al_switches: "{{ expand('group.oal_control_switches') | map(attribute='entity_id') | reject('eq', 'switch.adaptive_lighting_column_lights') | list }}"
      alarm_timestamp: "{{ state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') | int(0) }}"
```

With main's expanded version:

```yaml
    variables:
      al_switches: "{{ expand('group.oal_control_switches') | map(attribute='entity_id') | reject('eq', 'switch.adaptive_lighting_column_lights') | list }}"
      alarm_timestamp: "{{ state_attr('sensor.sonos_upcoming_alarms', 'earliest_alarm_timestamp') | int(0) }}"
      earliest_alarm_date: >
        {% set all_data = state_attr('sensor.sonos_upcoming_alarms', 'all_alarms_data') | default({}, true) %}
        {% set alarms = all_data.get('raw_alarm_list_sorted', []) if all_data is mapping else [] %}
        {% if alarms | length > 0 %}
          {{ alarms[0]['date'] | default('none') }}
        {% else %}
          none
        {% endif %}
      today_date: "{{ now().date().isoformat() }}"
      next_rising_timestamp: >
        {% set next_rising = state_attr('sun.sun', 'next_rising') %}
        {{ as_timestamp(next_rising) | int(0) if next_rising else 0 }}
      next_rising_date: >
        {% set next_rising = state_attr('sun.sun', 'next_rising') %}
        {% if next_rising %}
          {{ as_timestamp(next_rising) | timestamp_custom('%Y-%m-%d', true) }}
        {% else %}
          none
        {% endif %}
      valid_wake_alarm: >
        {# Only arm a synthetic sunrise for same-day alarms that are still before today's sunrise. #}
        {% set skip_wakeup = is_state('input_boolean.oal_disable_next_sonos_wakeup', 'on') %}
        {% set alarm_is_today = earliest_alarm_date == today_date %}
        {% set sunrise_is_still_today = next_rising_date == today_date %}
        {{ not skip_wakeup
           and alarm_timestamp > 0
           and alarm_is_today
           and sunrise_is_still_today
           and alarm_timestamp < next_rising_timestamp }}
```

**Step 4.4.4**: Restore Sub-hunks B+C — `action:` body becomes a `choose:` with arming sequence + `default:` cleanup branch.

Replace the worktree's simple action body:

```yaml
    action:
      # Only proceed if there's a valid alarm
      - condition: template
        value_template: "{{ alarm_timestamp > 0 }}"
      
      - repeat:
          count: "{{ al_switches | length }}"
          sequence:
            - variables:
                current_switch: "{{ al_switches[repeat.index - 1] }}"
                alarm_offset: >
                  {% if 'bedroom_primary' in current_switch %}
                    -1800
                  {% elif 'main_living' in current_switch %}
                    -1200
                  {% elif 'kitchen_island' in current_switch or 'kitchen_undercabinet' in current_switch %}
                    -2700
                  {% else %}
                    -1500
                  {% endif %}
                final_sunrise_time: >
                  {% set final_time = alarm_timestamp + alarm_offset %}
                  {{ final_time | timestamp_custom('%H:%M:%S', true) }}
            - service: adaptive_lighting.change_switch_settings
              data:
                entity_id: "{{ current_switch }}"
                sunrise_time: "{{ final_sunrise_time }}"
```

With main's `choose:` + `default:` structure:

```yaml
    action:
      - choose:
          - conditions:
              - condition: template
                value_template: "{{ valid_wake_alarm }}"
            sequence:
              - repeat:
                  count: "{{ al_switches | length }}"
                  sequence:
                    - variables:
                        current_switch: "{{ al_switches[repeat.index - 1] }}"
                        alarm_offset: >
                          {% if 'bedroom_primary' in current_switch %}
                            -1800
                          {% elif 'main_living' in current_switch %}
                            -1200
                          {% elif 'kitchen_island' in current_switch or 'kitchen_undercabinet' in current_switch %}
                            -2700
                          {% else %}
                            -1500
                          {% endif %}
                        final_sunrise_time: >
                          {% set final_time = alarm_timestamp + alarm_offset %}
                          {{ final_time | timestamp_custom('%H:%M:%S', true) }}
                    - service: adaptive_lighting.change_switch_settings
                      data:
                        entity_id: "{{ current_switch }}"
                        sunrise_time: "{{ final_sunrise_time }}"
        default:
          - repeat:
              count: "{{ al_switches | length }}"
              sequence:
                - variables:
                    current_switch: "{{ al_switches[repeat.index - 1] }}"
                    current_sunrise_time: "{{ state_attr(current_switch, 'sunrise_time') }}"
                - choose:
                    - conditions:
                        - condition: template
                          value_template: "{{ current_sunrise_time not in [none, 'None', '', 'unknown', 'unavailable'] }}"
                      sequence:
                        - service: adaptive_lighting.change_switch_settings
                          data:
                            entity_id: "{{ current_switch }}"
                            sunrise_time: "None"
```

**Step 4.4.5**: Restore Sub-hunk D — `oal_wake_up_sequence_v13` body.

Locate the automation header (around line 3471 in the worktree file). The worktree currently has the alias `"OAL v13 - Wake-up Sequence (Staged Brightening)"`. Change to `"OAL v13 - Wake-up Sequence (Selected Lights)"`.

Add a `variables:` block for `wakeup_light_targets` (worktree has none):

```yaml
    variables:
      wakeup_light_targets: >
        {% set configured_targets = state_attr('group.oal_wakeup_lights', 'entity_id') | default([], true) %}
        {% set fallback_targets = [
          'light.bedroom_primary_lights',
          'light.column_lights',
          'light.entryway_lamp'
        ] %}
        {{ (configured_targets if configured_targets | length > 0 else fallback_targets)
           | select('match', '^light\\.')
           | list }}
```

Add an extra `condition:` to the existing list:

```yaml
    condition:
      - condition: state
        entity_id: input_boolean.oal_disable_next_sonos_wakeup
        state: "off"
      - condition: template                                  # ADD
        value_template: "{{ wakeup_light_targets | length > 0 }}"   # ADD
      - condition: template
        value_template: >
          {% set bedroom_sunrise_str = state_attr('switch.adaptive_lighting_bedroom_primary', 'sunrise_time') %}
          ...
```

Replace the entire `action:` body (currently 6 staged `adaptive_lighting.apply` calls + a `delay`) with main's single `light.turn_on`:

```yaml
    action:
      - service: light.turn_on
        target:
          entity_id: "{{ wakeup_light_targets }}"
        data:
          brightness_pct: 50
          transition: 600
```

**Step 4.4.6**: Verify the merged tree (after auto-merge OR after surgical contingency).

```bash
# Confirm sub-hunk A
sed -n '/^  - id: oal_dynamic_sunrise_manager_v13/,/^    trigger:/p' \
    packages/oal_lighting_control_package.yaml
# MUST show: alias, then mode: restart, then trigger:

# Confirm sub-hunk B
grep -A 2 "valid_wake_alarm:" packages/oal_lighting_control_package.yaml | head -5
# MUST show the template definition

# Confirm sub-hunk C
grep -B 1 -A 5 "current_sunrise_time not in" packages/oal_lighting_control_package.yaml
# MUST show the default-branch clearing logic

# Confirm sub-hunk D
sed -n '/^  - id: oal_wake_up_sequence_v13/,/^      - service:/p' \
    packages/oal_lighting_control_package.yaml | head -30
# MUST show: alias "(Selected Lights)", wakeup_light_targets variable,
# condition with length > 0 check, and `light.turn_on` action

# Confirm worktree's inbox migration is intact
# CORRECTED COUNTS (v3, verified against worktree HEAD on 2026-05-06)
grep -c "tunet_inbox.post" packages/oal_lighting_control_package.yaml
# Expected: 10  (NOT 14 — v1 was wrong)
grep -c "tunet_inbox.resolve" packages/oal_lighting_control_package.yaml
# Expected: 28  (NOT 24 — v1 was wrong)
grep -cE "^  - id: oal_v1[34]_(override|tv|timer).*(inbox|shadow)" packages/oal_lighting_control_package.yaml
# Expected: 6  (4 handler/resolver pairs + 2 shadow resolvers)
# NOTE: the previous v2 grep `id: oal_v1[34].*inbox` returned 5 because
# oal_v14_timer_notification_shadow_resolver does not contain "inbox"
# in its ID. The corrected regex above handles all 6.
grep -c "tv_prompt_debounce_passed" packages/oal_lighting_control_package.yaml
# Expected: 2 (one in TV start, one in startup reconcile)
grep -c "oal_last_tv_mode_prompt_notification" packages/oal_lighting_control_package.yaml
# Expected: 5+ (1 helper definition + 2 var reads + 2 set_datetime calls)
```

Then stage:

```bash
git add packages/oal_lighting_control_package.yaml
```

### 4.5 Conflict resolution — Sonos package

> **v2 update (2026-05-06)**: Dry-run confirmed Sonos auto-merges cleanly. The `git checkout --theirs` step below is **CONTINGENCY ONLY**. Primary path: run the verification greps; if pass, proceed.

**Verify (always run, regardless of conflict status)**:

```bash
grep -c "tunet_inbox" packages/sonos_package.yaml      # Expected: 27
grep -A 6 "Sonos Alarm Playing" packages/sonos_package.yaml | head -8
# Should show "State-based template:" comment, NOT "Trigger-based:"
grep -c "sonos_last_alarm_notification:" packages/sonos_package.yaml
# Expected: at least 1
# CORRECTED v3: anchor to line-start to count helper DEFINITIONS, not refs
grep -cE "^  sonos_snoozed_alarm_" packages/sonos_package.yaml
# Expected: 5 (per-speaker snooze helper definitions)
# Without the ^  anchor the grep returns ~7 because helper names are
# referenced in scripts that consume them. The anchored regex counts
# only definition-site lines.
grep -c "id: sonos_snooze_next_alarm" packages/sonos_package.yaml
# Expected: 1
```

**Surgical contingency** (only if a conflict appears):

```bash
git checkout --theirs packages/sonos_package.yaml
git add packages/sonos_package.yaml
# Then re-run the verification greps above
```

### 4.6 Conflict resolution — doc files

For each of `FIX_LEDGER.md`, `handoff.md`, `plan.md`, `cards_reference.md`, and the various `CLAUDE.md` files:

```bash
git status   # see remaining conflicts
```

For each conflicted file, open it and hand-merge. The pattern for ledger/log files is to **concatenate both sides** in chronological order, removing duplicate entries. The pattern for `CLAUDE.md` files is usually to **accept the more recent / more complete side**, often the worktree.

### 4.7 Commit the merge resolution

```bash
git commit --no-edit
# Uses the merge commit message from Step 4.2
```

Verify the merge commit:

```bash
git show --stat HEAD | head -40
# Expect: hundreds of files changed, 13,000+ insertions, ~7,000+ deletions
git log --oneline -5
# Expect: merge commit at HEAD with two parents
```

---

## 5. Pre-Deploy Validation (the governed `tinbox:verify` gate)

**v3 update**: replaced v1's ad-hoc python imports with the existing governed validation pipeline at `custom_components/tunet_inbox/Docs/deploy_and_test.md`.

### 5.1 YAML syntax (still valid as a fast pre-flight)

```bash
python3 -c "import yaml; yaml.safe_load(open('packages/oal_lighting_control_package.yaml')); print('OAL: OK')"
python3 -c "import yaml; yaml.safe_load(open('packages/sonos_package.yaml')); print('Sonos: OK')"
python3 -c "import yaml; yaml.safe_load(open('packages/zen32_modal_controller_package.yaml')); print('Zen32: OK')"
python3 -c "import yaml; yaml.safe_load(open('packages/mmwave_tracking.yaml')); print('mmwave: OK')"
```

### 5.2 Local backend release gate — `npm run tinbox:verify`

This is the **load-bearing pre-deploy gate**. Per `deploy_and_test.md` §"Acceptance Expectations", the integration is not deployed just because files copied — it must pass `tinbox:verify` first.

```bash
# One-time setup if .venv-tinbox does not exist:
npm run tinbox:test:setup

# The actual gate:
npm run tinbox:verify
```

`tinbox:verify` runs in sequence:
1. `tinbox:check` — `python3 -m py_compile` over `custom_components/tunet_inbox/*.py` and `tests/components/tunet_inbox/*.py`; `bash -n` over inbox shell scripts; YAML parse if `Configuration/configuration.yaml` was touched; verify governance docs exist
2. `tinbox:test` — pinned pytest under `tests/components/tunet_inbox/`
3. `tinbox:probe:runtime` — deterministic local runtime proof for the literal `lock_conflict` manager branch

Fails fast on the first failing step. **Do not advance to §6 if `tinbox:verify` fails.**

### 5.3 HA config check via MCP

```bash
mcp__home-assistant__ha_check_config
```

Expected output: `result: valid` with no errors. Warnings about deprecated platforms or missing entities are acceptable but should be reviewed. This validates the merged YAML is loadable by a real HA instance (without yet deploying).

---

## 6. Phased Deploy (using governed scripts, not raw scp)

**v3 update**: replaced raw `scp -r` and `ha_restart` with the existing governed `npm run tinbox:deploy:integration` pipeline that backs up remote state to **local timestamped folders** before any mutation, idempotently patches `configuration.yaml` for the `tunet_inbox:` bootstrap + `notify.tunet_inbox_all_devices` group + logger entries, and uses **browser-reload** instead of full HA restart per `deploy_and_test.md` §"Restart policy".

The merge commit is in `merge/tunet-inbox-into-main`. Main is still untouched. Deploy in 3 stages.

### 6.1 Stage 1 — Component deploy via governed pipeline

```bash
# Push merge branch to origin as a deployment-time safety net
git push -u origin merge/tunet-inbox-into-main

# Run the governed integration deploy
npm run tinbox:deploy:integration
```

`tinbox:deploy:integration` (per `custom_components/tunet_inbox/Docs/deploy_and_test.md`) does:
1. Resolves `.env` (current worktree first, then `/home/mac/HA/implementation_10/.env`)
2. Backs up remote `/config/custom_components/tunet_inbox/` to a **local timestamped backup folder** (this is the rollback artifact §9 will reference, not `/config/backups/*.pre-merge` which v1 incorrectly assumed)
3. Backs up remote `/config/configuration.yaml`
4. Idempotently patches remote `/config/configuration.yaml` to contain the `tunet_inbox:` bootstrap block + `notify.tunet_inbox_all_devices` group + logger entries
5. Creates `/config/custom_components/tunet_inbox/` if missing
6. Copies integration files
7. Verifies sentinel files (`manifest.json`, `__init__.py`, `services.py`) on remote
8. Prints required browser-reload instruction
9. Confirms config-entry convergence after reload

**Then in HA UI**:
- Settings → Devices & Services → Integrations → Tunet Inbox → service-row menu → Reload (per `deploy_and_test.md` §"Restart policy" — do NOT use full HA restart unless explicitly required)

**Then run smoke**:

```bash
npm run tinbox:smoke
```

`tinbox:smoke` calls `GET /api/services` and verifies the `tunet_inbox` domain registers all of: `post`, `respond`, `resolve`, `fail`, `dismiss`, `list_items`. **If any service is missing, the script fails non-zero** — do not advance to Stage 2.

**Stage 1 acceptance** (per `deploy_and_test.md` §"Acceptance Expectations"):
- Static check passed (§5.2)
- Local pytest passed (§5.2)
- `tinbox:verify` gate passed (§5.2)
- Files copied (verified by sentinels in `tinbox:deploy:integration`)
- Tunet Inbox reloaded via UI
- Smoke check passed
- If YAML bootstrap is in use, imported config-entry proof exists after reload

**At this point, OAL and Sonos packages still reference an unloaded service surface.** The integration is loaded but the YAML on `/config/packages/` is the pre-merge version. Stage 2 lands the YAML.

### 6.2 Stage 2 — YAML packages with explicit per-tranche backup

Per `deploy_and_test.md` §"Configuration patch rule" and the package-deploy scope note: package-only deploys are separate from `tinbox:deploy:integration`, and **must back up the touched files explicitly per tranche** before mutation.

```bash
# 1. Capture local timestamped backups of the EXISTING remote packages
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
mkdir -p Backups/pre_inbox_merge_${TIMESTAMP}
ssh root@10.0.0.21 "cat /config/packages/oal_lighting_control_package.yaml" \
    > Backups/pre_inbox_merge_${TIMESTAMP}/oal_lighting_control_package.yaml.remote
ssh root@10.0.0.21 "cat /config/packages/sonos_package.yaml" \
    > Backups/pre_inbox_merge_${TIMESTAMP}/sonos_package.yaml.remote
echo "Backups captured at Backups/pre_inbox_merge_${TIMESTAMP}/"
echo "$TIMESTAMP" > /tmp/inbox_merge_backup_timestamp

# 2. Verify backups are non-empty
[ -s Backups/pre_inbox_merge_${TIMESTAMP}/oal_lighting_control_package.yaml.remote ] || \
    { echo "OAL backup empty - aborting"; exit 1; }
[ -s Backups/pre_inbox_merge_${TIMESTAMP}/sonos_package.yaml.remote ] || \
    { echo "Sonos backup empty - aborting"; exit 1; }

# 3. SCP merged YAML packages
scp packages/oal_lighting_control_package.yaml \
    root@10.0.0.21:/config/packages/
scp packages/sonos_package.yaml \
    root@10.0.0.21:/config/packages/

# 4. Reload — both automation and script reloads needed
#    (per deploy_and_test.md: "mixed package script/automation edits should
#     run both reloads; TI4A proved automation.reload alone leaves stale
#     script bodies loaded")
mcp__home-assistant__ha_call_service domain="automation" service="reload"
mcp__home-assistant__ha_call_service domain="script" service="reload"

# 5. Verify automations loaded
mcp__home-assistant__ha_get_state entity_id="automation.oal_v13_override_reminder_inbox_action_handler"
# Expect: state "on"
mcp__home-assistant__ha_get_state entity_id="automation.oal_v14_tv_inbox_shadow_resolver"
# Expect: state "on"
mcp__home-assistant__ha_get_state entity_id="automation.oal_v14_timer_notification_shadow_resolver"
# Expect: state "on"
mcp__home-assistant__ha_get_state entity_id="input_datetime.oal_last_tv_mode_prompt_notification"
# Expect: a valid datetime
```

### 6.3 Stage 3 — Validation

Run the validation criteria from §7 below. If all pass, advance to §8 (fast-forward main).

---

## 7. Validation Criteria

Each criterion is testable. Mark each [✓] when verified.

### 7.1 Foundation checks (must pass before declaring success)

- [ ] `mcp__home-assistant__ha_check_config` returns valid after Stage 2
- [ ] `tunet_inbox.post` and `tunet_inbox.resolve` appear in Developer Tools → Services
- [ ] All 6 new automations show `state: "on"`:
  - [ ] `automation.oal_v13_override_reminder_inbox_action_handler`
  - [ ] `automation.oal_v13_override_reminder_inbox_resolver`
  - [ ] `automation.oal_v13_override_expiring_inbox_action_handler`
  - [ ] `automation.oal_v13_override_expiring_inbox_resolver`
  - [ ] `automation.oal_v14_tv_inbox_shadow_resolver`
  - [ ] `automation.oal_v14_timer_notification_shadow_resolver`
- [ ] `input_datetime.oal_last_tv_mode_prompt_notification` exists with a valid datetime
- [ ] `input_datetime.sonos_last_alarm_notification` exists

### 7.2 Inv #3 (Manual auto-reset) — HIGH RISK

This is the most important validation because Inv #3 was rated High in the analysis.

- [ ] Manually override a zone (e.g., flip a light switch outside OAL's expected schedule)
- [ ] Wait for the override-reminder automation to fire (~configured timeout)
- [ ] Confirm an inbox card appears with title "Lights Still Manual"
- [ ] Confirm a parallel mobile companion notification arrives with the same actions
- [ ] Tap **OAL_RESET_LIGHTS** on the inbox card
- [ ] Verify `script.oal_reset_soft` fires (check automation traces)
- [ ] Verify the inbox card resolves (disappears)
- [ ] Verify the mobile notification dismisses (Companion App via the `clear_notification` magic string + matching tag)
- [ ] Repeat the test, this time tapping the mobile notification action instead of the inbox action — verify the SAME end state

### 7.3 Inv #2 (Govee color temp) — Smoke test only

- [ ] After a TV-mode-enter / TV-mode-exit cycle, query `light.bedroom_primary_lights` and `light.column_lights` (the two Govee zones)
- [ ] Confirm color temp is in the range 2700K–6500K

### 7.4 Inv #4 (Force modes override)

- [ ] With Apple TV playing and config set to anything other than "TV Mode", verify the TV mode prompt arrives via inbox
- [ ] Tap **OAL_TV_ENTER** → verify `input_select.oal_active_configuration` becomes "TV Mode"
- [ ] Verify Sleep mode still overrides everything (toggle ZEN32 B5 triple-tap, confirm zones go to sleep config regardless of TV state)

### 7.5 Inv #7 (Pause behavior — accepted deviation)

- [ ] Set `input_boolean.oal_system_paused` to on
- [ ] Trigger an inbox notification (e.g., manually create an override → wait for reminder)
- [ ] Tap **OAL_RESET_LIGHTS** on the inbox card
- [ ] **EXPECTED**: `script.oal_reset_soft` fires regardless of pause state. This is the documented accepted deviation.
- [ ] If this expectation does NOT hold (i.e., pause does block the reset), reassess the design.

### 7.6 New: TV mode prompt debounce (>300s)

- [ ] Trigger a TV mode prompt
- [ ] Dismiss it (OAL_TV_DISMISS)
- [ ] Within 5 minutes, trigger another playback start
- [ ] Verify NO new TV mode prompt arrives (debounce kicked in)
- [ ] After 5+ minutes, trigger another playback start
- [ ] Verify the prompt arrives again

### 7.7 New: Zone-scoped override expiry keys

- [ ] Manually override two different zones (e.g., main_living AND kitchen_island)
- [ ] Wait for both to enter override-expiring window (5 minutes before expiry, after sunset)
- [ ] Verify TWO separate inbox cards appear with keys `oal_override_expiring:main_living` and `oal_override_expiring:kitchen_island`
- [ ] Tap action on one — verify only that card resolves; the other remains

### 7.8 Sunrise refinement (sub-hunks A/B/C from main, restored via merge)

- [ ] Set a Sonos alarm for tomorrow morning (date in the future, before tomorrow's sunrise)
- [ ] Verify the synthetic-sunrise arming does NOT fire today (because `alarm_is_today` is false)
- [ ] Verify any stale `sunrise_time` from a previous arming gets cleared by the `default:` branch
- [ ] Set a Sonos alarm for today (still before today's sunrise)
- [ ] Verify the synthetic-sunrise arming DOES fire (each AL switch gets its zone-specific offset)

### 7.9 Wake-up sequence (sub-hunk D from main, restored via merge)

- [ ] At wake-up time (when bedroom_primary's sunrise_time is reached), verify the configured `group.oal_wakeup_lights` (or fallback list) all turn on at 50% with a 600s transition
- [ ] If `group.oal_wakeup_lights` is empty or undefined, verify the fallback list (`bedroom_primary_lights`, `column_lights`, `entryway_lamp`) is used

### 7.10 Sonos state-based template (worktree's reload-resilience choice)

- [ ] Restart HA
- [ ] Within 5 minutes of restart, verify `binary_sensor.sonos_alarm_playing` (or whatever the template is named) is in a non-`unknown`, non-`unavailable` state
- [ ] Compare to the trigger-based behavior on main (which would stay `unknown` until the next state change). The state-based version should be self-healing.

### 7.11 Snooze re-trigger bug — post-merge live confirmation

The user flagged on 2026-05-06: *"when I used the [inbox] system to snooze a Sonos alarm today it never re-triggered."*

This is a **post-deploy validation criterion**, NOT a merge-blocking gate. The merge-blocking gate is §2.5a (pre-merge investigation of the script in `packages/sonos_package.yaml` line 2597 and the snooze re-trigger code path). By the time §7 runs, that investigation is already complete and the disposition is one of: (a) fix landed, (b) known-issue accepted, (c) environmental/no-op.

- [ ] Snooze a Sonos alarm via the inbox card
- [ ] Wait for the snooze interval to elapse
- [ ] Confirm the §2.5a disposition matches the live behavior:
  - If §2.5a (a) "fix landed": alarm re-triggers ✓
  - If §2.5a (b) "known-issue accepted": alarm does not re-trigger; this is documented and follow-up tranche is filed
  - If §2.5a (c) "environmental": investigate environmental fix
- [ ] If observed behavior does not match the §2.5a disposition: **stop**, escalate, do not advance to §8

Do NOT use this validation step as a substitute for the §2.5a investigation. The investigation must run first.

### 7.12 Mobile companion parallel rail (no regression)

- [ ] Trigger any inbox-aware notification
- [ ] Verify the mobile companion notification still arrives on iOS/Android
- [ ] Tap the mobile action (not the inbox action) — verify it still routes correctly through the existing `mobile_app_notification_action` triggers
- [ ] Verify the inbox card also resolves (because some shadow resolvers also listen to state changes that result from the mobile action)

---

## 8. Fast-Forward Main (LOCAL ONLY — no push)

Only after all Section 7 criteria pass:

```bash
cd /home/mac/HA/implementation_10
git checkout main
git merge merge/tunet-inbox-into-main --ff-only
# Verify
git log --oneline -3
# Expected: the merge commit is now at main HEAD
```

**v3 update**: `git push origin main` is deliberately omitted from this step. Per §3.3a, main publication is the standalone popup-B-disposition decision, decoupled from this merge. After the fast-forward, local main contains:
- The 13 pre-merge commits (popup B chain, etc.) that were unpushed at start
- The new merge commit that brings in the inbox integration

Whether to publish ALL of those (the full main HEAD) to `origin/main` is your call, made on its own merits. The merge plan ends at the local fast-forward.

Optional: keep the merge branch around for a few days as a recovery anchor:

```bash
# Don't delete merge/tunet-inbox-into-main yet
git branch -d merge/tunet-inbox-into-main   # only after 7-14 day soak
```

---

## 9. Rollback Procedures

Each phase has an independent rollback. Listed in reverse order of execution.

### 9.1 Rollback Stage 2 — YAML packages (validation failure)

**v3 update**: rollback now uses the timestamped backups created in §6.2 step 1, not nonexistent `/config/backups/*.pre-merge` files.

```bash
# Read the timestamp captured in §6.2
TIMESTAMP=$(cat /tmp/inbox_merge_backup_timestamp)

# Restore the captured remote YAML
scp Backups/pre_inbox_merge_${TIMESTAMP}/oal_lighting_control_package.yaml.remote \
    root@10.0.0.21:/config/packages/oal_lighting_control_package.yaml
scp Backups/pre_inbox_merge_${TIMESTAMP}/sonos_package.yaml.remote \
    root@10.0.0.21:/config/packages/sonos_package.yaml

# Reload — same dual-reload pattern as deploy
mcp__home-assistant__ha_call_service domain="automation" service="reload"
mcp__home-assistant__ha_call_service domain="script" service="reload"
```

The custom component remains loaded but unused (it has no effect when the YAML doesn't reference it). If you also need to roll back the component, continue with §9.2.

### 9.2 Rollback Stage 1 — component (deeper failure)

`tinbox:deploy:integration` saves a local timestamped backup of the prior `/config/custom_components/tunet_inbox/` directory. Locate the latest backup folder under the `custom_components/tunet_inbox/scripts/` deploy area (the script prints the path on success — capture it).

Per `deploy_and_test.md` §"Rollback":

```bash
# Find the latest local timestamped backup folder created by tinbox:deploy:integration
# (the deploy script prints this path on success; capture it before deploy
#  if you anticipate possible rollback)
LATEST_BACKUP=$(ls -td custom_components/tunet_inbox/scripts/.deploy_backups/* 2>/dev/null | head -1)
# Adjust path if the deploy script uses a different backup location

# Restore via scp
scp -r ${LATEST_BACKUP}/tunet_inbox \
    root@10.0.0.21:/config/custom_components/

# Restore the configuration.yaml backup from the same folder if it was patched
scp ${LATEST_BACKUP}/configuration.yaml \
    root@10.0.0.21:/config/configuration.yaml

# Reload Tunet Inbox via UI:
# Settings → Devices & Services → Integrations → Tunet Inbox → service-row menu → Reload

# Re-verify with smoke
npm run tinbox:smoke
```

If the goal is to **fully remove the integration** (vs restore to a prior version):

```bash
ssh root@10.0.0.21 'rm -rf /config/custom_components/tunet_inbox'
# Remove the config entry via UI: Settings → Devices & Services → Tunet Inbox → delete
# Do NOT use ha_restart unless explicitly required — prefer the integration reload
```

### 9.3 Rollback the merge commit

```bash
# If merge branch hasn't been fast-forwarded to main yet
git checkout main   # main is unchanged
git branch -D merge/tunet-inbox-into-main

# If merge has been fast-forwarded to main:
git checkout main
git revert -m 1 <merge-commit-sha>
git push origin main
```

The `-m 1` tells `git revert` to use the first parent (main pre-merge) as the baseline for the revert.

### 9.4 Rollback to origin

If everything goes sideways and we want to pretend this never happened:

```bash
git checkout main
git reset --hard origin/main
# Confirm with: git log --oneline | head -3
# Should show origin/main's HEAD
```

⚠️ This destroys local-only commits. Confirm with `git reflog` first if there's any doubt.

---

## 10. Risk Callouts

### 10.1 Doc-file conflict noise

`FIX_LEDGER.md`, `handoff.md`, `plan.md`, `cards_reference.md`, and various `CLAUDE.md` files will have conflicts because both branches have appended history. Resolution is hand-merge by section. Budget 15-30 minutes. The conflicts are not load-bearing for HA behavior.

### 10.2 Submodules on main

The 5 `.claude/worktrees/{...}` submodules with "modified content" will not be touched by the merge as long as you do not `git add` them. If you accidentally `git submodule update --remote`, those will move to upstream HEAD and the modified content will be lost. **Do not run submodule commands during the merge.**

### 10.2a Snooze re-trigger bug — traced 2026-05-06, ships as known issue

**User-observed behavior**: snoozing a Sonos alarm via the inbox does not re-trigger the alarm at the snoozed time.

**Trace findings (informational, code-level only — runtime not exercised)**:

1. **Snooze flow architecture**:
   - User taps `SONOS_SNOOZE_5/10/15` on inbox card
   - `automation.sonos_alarm_notification_action_handler` (sonos_package.yaml:3389) catches `tunet_inbox_action` event
   - Calls `script.sonos_snooze_next_alarm` (line 2597) with `minutes` and `stop_playback: true`
   - Script reads `sensor.sonos_alarm_playing.alarm_entity` to identify the playing alarm
   - Computes `new_time = current_alarm_time + snooze_mins` (with 24-hour wraparound)
   - Stores `"{alarm_entity}|{original_time}"` in `input_text.sonos_snoozed_alarm_<room>`
   - Calls `media_player.media_stop` to silence current playback
   - Calls `sonos.update_alarm` with the alarm_id and shifted time
   - Logs success
   - Re-trigger is **expected to come from the Sonos device itself** firing at the new time

2. **Most likely root cause — Sonos device "already-fired-today" semantics**:
   The Sonos device treats today's instance of a recurring alarm as **consumed once it fires**, regardless of whether the alarm's `time` attribute is later modified. So:
   - 7:00 AM alarm fires → today's 7:00 instance is consumed
   - User snoozes for 15 min → script calls `sonos.update_alarm` to set time = 7:15
   - Sonos updates the alarm's stored time to 7:15
   - But Sonos does NOT re-arm today's already-consumed instance
   - Tomorrow at 7:15 (the new time), the alarm will fire correctly
   - Today, no re-fire happens

   This is a documented pattern with hardware-scheduled alarms across multiple ecosystems (Sonos, smart speakers, traditional alarm clocks): once today's instance fires, time-shifting the schedule does not retroactively re-arm today.

3. **Coupling to merge architecture**: NONE
   - The state-based vs trigger-based `Sonos Alarm Playing` template change (worktree's §2.3 choice) does NOT contribute to this bug. The snooze script reads `alarm_entity` synchronously at the moment of user action, before any subsequent state changes. Both template variants produce the same `alarm_entity` attribute via the same speaker iteration logic (verified at lines 866-915 of `sonos_package.yaml`).
   - Recent worktree simplification of the snooze script (replacing fragile `playing_room` + `friendly_name` substring match with direct `alarm_entity` attribute read) is an improvement that does NOT cause the bug. Confirmed via `git log -p` on `script.sonos_snooze_next_alarm`.
   - The bug exists in worktree's current state, deployed live today.

4. **Pre-existence**: YES
   - The bug is in code that ships through this merge (worktree → main).
   - The merge does NOT introduce or change exposure of the bug.
   - Main does not currently have the snooze surface at all (no `tunet_inbox`-driven snooze), so main is unaffected by the bug today; after the merge, main inherits the same pre-existing issue from worktree.

5. **Fix scope**: MEDIUM — architectural rework, not a one-line patch.
   The time-shift snooze pattern is fundamentally incompatible with Sonos device alarm semantics. A correct fix requires one of:
   - **(a) HA-side timer + manual re-fire**: replace `sonos.update_alarm` with `timer.start` for the snooze duration, and on `timer.finished` call `media_player.play_media` directly to re-fire the alarm sound. The hardware alarm stays untouched. **Cleanest semantics, requires a new automation.**
   - **(b) Disable + recreate**: disable the original alarm, create a new one-shot alarm at the snoozed time, then re-enable original after re-fire completes. **Complex, fragile, may consume Sonos alarm slots.**
   - **(c) Mute + unmute**: leave the alarm time alone but mute the speaker for the snooze interval, then unmute. **Doesn't actually re-play the alarm tone, just silences then resumes existing playback if Sonos hasn't already self-completed.**

   Recommendation when the post-merge fix tranche is authored: option (a) — HA-side timer with `media_player.play_media`. Cleanest and most predictable.

6. **Validation gap (acknowledged)**:
   This trace is code-level analysis only. Runtime confirmation of the "already-fired-today" hypothesis would require:
   - Snoozing a live alarm and observing the device's alarm state after `sonos.update_alarm` returns
   - Checking HA logs for the script run + Sonos integration response
   - Waiting through the snooze interval to confirm no re-fire

   This was not performed during the trace per the user's "trace pre-merge, fix post-merge" decision. The post-merge fix tranche should begin with this runtime confirmation before implementing the timer-based approach.

7. **Post-merge plan**:
   - **Tranche identifier (suggested)**: `SA5_sonos_snooze_re_trigger_fix` (continuing the SA series)
   - **Owner**: TBD when authored
   - **Entry conditions**: this infra merge is stable; runtime confirmation of root-cause hypothesis
   - **Out-of-scope for THIS merge**: the bug ships as a known regression in the snooze user-facing behavior. The merge promotes the bug from worktree to main, but does not change exposure on the deployed instance.

**User-facing impact during merge soak**: snoozing alarms will continue to silence the current alarm (because `media_player.media_stop` works) but will NOT re-trigger at the snoozed time. Users should treat snooze as "dismiss with intent to address later" until the SA5 fix lands. Document this in `handoff.md` as a known issue.

### 10.3 Origin push of main is uncoupled (resolved in v2)

**v2 update (2026-05-06)**: Per §3.3a, `git push origin main` is **NOT part of this plan**. The 10 unpushed main commits are the popup B chain that the prior session left for the user to decide on (per `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`). Publishing them is a load-bearing decision in its own right and is decoupled from this merge's safety net.

The trade-off this introduces: until the user separately publishes main, `origin/main` is stale and cannot serve as a `git reset --hard` rollback target for main. We mitigate by capturing `PRE_MERGE_MAIN` SHA at Step 4.1 and persisting it to `/tmp/pre_merge_main.sha` for emergency recovery.

### 10.4 Pre-merge cleanup commits create new conflict surface

Each of the cleanup commits in Section 3 creates a conflict surface for the merge. Keep each cleanup commit small and topical. If a cleanup commit on main touches the same file as a cleanup commit on worktree (e.g., both touch `Dashboard/Tunet/CLAUDE.md`), the merge will conflict on that file. Resolution is the same as Section 4.6 (hand-merge).

### 10.5 Inv #3 risk is HIGH

Section 7.2 validation is the gate that determines whether this merge can land in production. If `OAL_RESET_LIGHTS` does not work end-to-end via the inbox path, the manual-override reset workflow is broken and lights can stay manually controlled indefinitely. This is the single most important validation to pass.

### 10.6 The `notify.notify` parallel rail is load-bearing during validation

The worktree's design keeps the existing `notify.notify` calls in parallel with the new `tunet_inbox.post` calls. If we ever decide to remove the legacy `notify.notify` rail (a future tranche), we must first prove the inbox rail is fully reliable. Until then, both rails fire for every notification, which is intentional dual-write redundancy.

### 10.7 Sub-hunk D wake-up regression risk

Restoring main's "selected wake lights" pattern means the worktree's staged 50%→80% brightening is lost. If users prefer the slower-rise behavior, a future tranche should re-introduce it as an option (perhaps gated on a new `input_boolean.oal_wake_staged_brightening`). Today's decision is to pick main's pattern; future flexibility is a separate question.

### 10.8 Snooze re-trigger bug pre-exists this merge

The user-flagged Sonos alarm snooze bug (Section 7.11) is a pre-existing behavioral issue in the worktree, not introduced by the merge. Filing it now lets us avoid attributing it to the merge later. Investigation should happen as a separate tranche after the merge stabilizes.

---

## 11. Open Questions Requiring User Confirmation

> **v2 reorganization (2026-05-06)**: questions are now grouped by what they actually decide. The popup B publication question is fully separated from the merge questions per §3.3a.

### 11.A Merge-blocking questions

**RESOLVED 2026-05-06:**
- Items 2-4: ALL gitignored per user decision (Backups/, snap-actions.yml, /home/). Implemented in §3.1.1 for the worktree side and §3.2.1 for main.
- Item 1: snooze bug fix DEFERRED to post-merge per user decision. Trace pre-merge is still recommended (informational, not gating) — see §2.5a for current state.

**ALL merge-blocking questions resolved as of 2026-05-06.**

1. ✅ Snooze bug trace: COMPLETE. Root cause documented in §10.2a (Sonos device "already-fired-today" semantics, independent of merge architecture). Fix deferred to post-merge tranche `SA5_sonos_snooze_re_trigger_fix`. Merge ships with bug as documented known issue.
2. ✅ `Backups/` directory: gitignored
3. ✅ `snap-actions.yml`: gitignored
4. ✅ `/home/` on main: gitignored

**The plan is ready for `Proceed to implementation`.**

### 11.B Decoupled questions (do NOT block this merge)

5. **Push 10 unpushed main commits to origin/main**: this is the **popup B publication question** per `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`. Per §3.3a, this is the user's standalone call, made on its own merits, on its own timeline. **It is explicitly NOT part of this merge plan.** No answer is required to advance this plan.

### 11.C Pre-resolved (no action needed)

6. **PNG gitignore safety**: VERIFIED 2026-05-06 via grep — no doc references break. Allowlist patterns documented in §3.1.1 are safe.

7. **OAL/Sonos auto-merge**: VERIFIED 2026-05-06 via dry-run — git handles both packages cleanly. Surgical edit playbook is now contingency, not primary path.

8. **Real conflict surface**: VERIFIED 2026-05-06 — only 6 doc files conflict (§4.3). All hand-mergeable.

After resolving 11.A items 1-4, advance to `Proceed to implementation`. Item 5 is yours to address whenever you choose, separate from this work.

After executing Sections 3-8, log results in `FIX_LEDGER.md` and update `handoff.md`.

---

## 12. Appendix — Inventory and References

### 12.1 OAL automation IDs added by worktree (not on main)

| ID | Mode | Purpose | Approx. line |
|---|---|---|---|
| `oal_v13_override_reminder_inbox_action_handler` | queued, max: 4 | Routes OAL_RESET_LIGHTS / OAL_KEEP_MANUAL inbox actions | 4494 |
| `oal_v13_override_reminder_inbox_resolver` | single | Auto-resolves the override-reminder card when no overrides remain | 4538 |
| `oal_v13_override_expiring_inbox_action_handler` | queued, max: 4 | Routes OAL_EXTEND_OVERRIDE / OAL_LET_EXPIRE | 4597 |
| `oal_v13_override_expiring_inbox_resolver` | single | Auto-resolves the override-expiring card when override clears or rotates | 4653 |
| `oal_v14_tv_inbox_shadow_resolver` | queued, max: 10 | Auto-resolves stale TV-family inbox cards on state changes | 5473 |
| `oal_v14_timer_notification_shadow_resolver` | queued, max: 10 | Auto-resolves stale timer-arbiter inbox cards | 5869 |

### 12.2 OAL action IDs wired through inbox

`OAL_TV_ENTER`, `OAL_TV_DISMISS`, `OAL_TV_CANCEL_AUTOFOLLOW`, `OAL_BRIDGE_EXTEND`, `OAL_BRIDGE_RETURN`, `OAL_BRIDGE_KEEP`, `OAL_TV_PRESENCE_KEEP`, `OAL_TV_PRESENCE_EXIT`, `OAL_RESET_LIGHTS`, `OAL_KEEP_MANUAL`, `OAL_EXTEND_OVERRIDE`, `OAL_LET_EXPIRE`, `OAL_EXTEND_MODE`, `OAL_EXTEND_ZONE`, `OAL_EXTEND_BOTH`, `OAL_RETURN_ADAPTIVE`

### 12.3 Inbox keys used by OAL

- `oal_override_reminder` (singleton)
- `oal_override_expiring:{zone_id}` (zone-scoped)
- `oal_tv_mode_activated:{zone}` (typically `:living_room`)
- `oal_tv_mode_prompt:{zone}`
- `oal_tv_presence_prompt:{zone}`
- `oal_bridge_expiring:{zone}`
- `oal_timer_expiring` (singleton, dedupe_policy: refresh)

### 12.4 Files in `custom_components/tunet_inbox/`

Source files: `__init__.py`, `config_flow.py`, `const.py`, `diagnostics.py`, `events.py`, `manager.py`, `manifest.json`, `mobile.py`, `models.py`, `services.py`, `services.yaml`, `storage.py`, `translations/en.json`

Docs: `Docs/` (multiple plan/tranche docs), `CLAUDE.md`, `FIX_LEDGER.md`, `handoff.md`, `plan.md`

Scripts: `scripts/check_tunet_inbox.sh`, `scripts/deploy_tunet_inbox.sh`, `scripts/run_tunet_inbox_pytest.sh`, `scripts/setup_tunet_inbox_test_env.sh`, `scripts/tunet_inbox_api_probe.mjs`, `scripts/tunet_inbox_runtime_probe.py`, `scripts/tunet_inbox_smoke.mjs`, `scripts/verify_tunet_inbox_release.sh`

### 12.5 Memory observations referenced

| ID | Title |
|---|---|
| #6834 | OAL Card Worktrees Merged Back Together (Feb 2026 prior pattern) |
| #11196 | Worktree vs Main Repo Divergence: Full State Snapshot |
| #11197 | File-Level Diff: Worktree vs Main — Cards and Packages |
| #11201 | Main Branch Uncommitted Work: Anomalous Nested home/ Directory Confirmed |
| #11403 | Tunet Dashboard main branch 15 commits ahead of origin/main |
| #11539 | OAL Lighting Control Package Size Discrepancy Between Worktree and Main |
| #11546 | tunet_inbox Custom Component Exists Only in Worktree — Not Present on Main |
| #11547 | OAL Diff Contains 4 Brand-New Inbox Action Handler Automation Pairs |
| #11549 | OAL Notification Architecture Migrated from Blocking wait_for_trigger to Event-Driven tunet_inbox Pattern |

### 12.6 Related plans

| Path | Purpose |
|---|---|
| `~/.claude/plans/flickering-herding-wolf.md` | Active Tunet execution plan (CD0-CD12) |
| `Dashboard/Tunet/Docs/plans/cd11_closure_plan_2026_05_04.md` | CD11 closure (recently completed) |
| `Dashboard/Tunet/Docs/plans/cd11_visual_polish_plan_2026_05_05.md` | CD11 visual polish |
| `custom_components/tunet_inbox/plan.md` | Integration-internal execution plan |
| `custom_components/tunet_inbox/handoff.md` | Integration handoff state |
| `custom_components/tunet_inbox/FIX_LEDGER.md` | Integration bug ledger |

### 12.7 Backup snapshots in worktree

| Path | What it backs up |
|---|---|
| `Backups/sonos_package_pre_alarm_fixes_20260429_045446Z.yaml` | Sonos package pre-SA0/SA3 alarm work |
| `Backups/tunet-card-rehab-lab_pre_SA2_20260428_170129Z.yaml` | Rehab lab pre-SA2 |

### 12.8 OAL System Invariants (from project CLAUDE.md)

1. Brightness bounds: `zone_min <= actual <= zone_max`
2. Govee color temp: `2700K <= actual <= 6500K`
3. Manual auto-reset: returns to adaptive after timeout
4. Force modes override ALL: Sleep/movie bypass calculations
5. Environmental is ADDITIVE: offset added to baseline, never absolute
6. ZEN32 LED = system state: LEDs reflect actual, not target
7. No calculation during pause: system pause freezes all

### 12.9 Risk classification — this merge

**Type C: Foundation change.** Three reasons:
1. Crosses the package/integration boundary (YAML → Python custom component)
2. Touches manual auto-reset (Invariant #3, rated High risk)
3. Worktree adds 71 files / +13,260 lines net across the full divergence; OAL is only one slice of a coordinated multi-package, multi-component move

Type C requires explicit user acknowledgment of risk. **Acknowledged**: user has chosen the merge mechanic, locked in the 4 sub-hunk decisions, accepted the Invariant #7 deviation, and required pre-merge git hygiene as a guard against losing legitimate WIP.

---

## 13. Tunet UI Merge — Deferred Follow-Up Plan

Per the v3 split, this merge ships only the OAL/Sonos/integration infrastructure. The Tunet UI work that exists as WIP on `tunet/inbox-integration` is deferred to a separate merge plan that will be authored after **this** plan completes successfully.

### 13.1 Files in scope of the deferred UI merge

The exact list to be M1-reviewed in the follow-up plan:

| Category | Files |
|---|---|
| Card JS (modified) | `tunet_actions_card.js`, `tunet_lighting_card.js`, `tunet_scenes_card.js`, `tunet_sonos_card.js` |
| Card JS (untracked) | `tunet_alarm_card.js` |
| Tests | `interaction_source_contract.test.js`, `alarm_bespoke.test.js` |
| Tunet docs (modified) | `cards_reference.md`, `nav_popup_ux_direction.md`, `sections_layout_matrix.md`, `sonos_alarm_popup_reference.md`, `visual_defect_ledger.md` |
| Plans/tranches | `Dashboard/Tunet/Docs/plans/archive/`, `cd11_closure_plan_*.md`, `cd11_visual_polish_plan_*.md`, `cross_card_*.md`, `Dashboard/Tunet/Docs/tranches/` |
| Scripts | `tunet_playwright_review.mjs`, `update_tunet_v3_resources.mjs`, `tunet_alarm_interaction_probe.mjs` |
| Lab/suite/popup YAML | `tunet-card-rehab-lab.yaml`, `tunet-suite-config.yaml`, `tunet-suite-storage-config.yaml`, `tunet-alarm-edit-popup.yaml` |
| Screenshot evidence | ~58 PNG files in repo root (gitignored by §3.1.1; remain on disk as visual evidence but excluded from git) |

### 13.2 Required entry conditions for the UI merge

The UI merge plan can begin authoring only after:
1. ✅ This infra merge has completed and soaked for at least 24 hours
2. ✅ The `tunet_inbox` integration is stable on the live HA instance
3. ✅ No regression has been observed in OAL or Sonos behavior
4. ✅ User has time/intent for an M1 screenshot review pass on the UI WIP

### 13.3 M1 review block (the load-bearing UI quality gate)

Per CLAUDE.md, the UI merge MUST go through M1 review before any UI commit lands on `tunet/inbox-integration`. The M1 block requires (paraphrased from the global CLAUDE.md frame and the Tunet AGENTS.md):
- User-perspective screenshot review at the canonical breakpoints (390×844, 768×1024, 1024×1366, 1440×900)
- Manual inspection for typography hierarchy, spacing rhythm, content semantics, truncation quality, touch target scale, alignment, density, visual balance, and any visible defect
- The user holds the done stamp; the agent does not self-grade UI as "verified"
- Banned phrases like "verified", "done", "deployed and working" without same-turn artifacts

### 13.4 Provisional scope of the UI merge

The deferred plan will likely include:
- Per-card defect inventory at each breakpoint (M4 from the session-arc letter)
- A documented current-state vs intent comparison
- An explicit "the user has reviewed and accepted" gate before each UI commit lands
- The same pre-merge / merge / deploy / rollback structure as this infra plan, but with M1 review woven through

This is a sketch, not an authored plan. The actual UI merge plan will be written when the entry conditions above are met.

---

## 14. Status / Next Actions

| Phase | Status |
|---|---|
| CONTEXT | ✓ complete |
| ANALYSIS | ✓ complete |
| DESIGN | ✓ complete (this document) |
| IMPLEMENTATION | ⏳ awaiting user resolution of Section 11 open questions, then "Proceed to implementation" |

**Immediate next actions for the user**:
1. Read this document end-to-end (especially §0, §2.5a, §3.3a, §4.3, §11)
2. Resolve the 4 merge-blocking questions in §11.A
3. Issue `Proceed to implementation` to begin §3 (pre-merge cleanup)

**Implementation will pause for user re-confirmation at**:
- Before §4.2 (the actual `git merge`) — to confirm the cleanup commits look right
- Before §6 (deploy) — for the user-eyes review of merge result + validation criteria order, per the M1 screenshot review block in CLAUDE.md
- Before §8 (fast-forward main) — to confirm validation results

**Implementation will NOT auto-mark validation criteria complete**. Per the working relationship frame and M3 ("user holds the done stamp"), §7 criteria with user-visible inbox UI behavior require Mac's eyes, not just my probe output. I will capture the artifacts and defer the pass/fail call to you.

---

*End of plan. Generated 2026-05-05 by Claude Opus 4.7 (1M context). See `docs/CLAUDE.md` for the broader OAL planning context.*
