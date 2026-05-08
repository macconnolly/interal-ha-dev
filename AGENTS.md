# AGENTS.md (Repo Root)

This repository contains multiple workstreams.  
For any work that touches files under `Dashboard/Tunet/`, the canonical scoped instructions are:

- `Dashboard/Tunet/AGENTS.md`

Apply those instructions as authoritative for Tunet work.

## Root Rules

- Use a single worktree for this project:
  - `/home/mac/HA/implementation_10`
- Do not create or use additional worktrees for Tunet tasks unless explicitly requested by the user.
- Do not run destructive git operations unless explicitly requested.

## Scope Routing

- If editing any file in `Dashboard/Tunet/**`, read and follow:
  - `Dashboard/Tunet/AGENTS.md`
- For non-Tunet paths, use prompt/developer/system instructions plus local file context.

## Cross-Cutting Principles (encoded 2026-05-08)

For any work that touches dashboard architecture, card design, or page composition:

- **Architecture-first**: page-level structural planning takes precedence over implementation tweaks. Non-trivial architecture work gets its own focused sub-plan at `~/.claude/plans/<descriptive-name>.md`, not a bullet on a tactical plan. See `~/.claude/projects/-home-mac-HA-implementation-10/memory/feedback_architecture_first.md`.
- **Corpus-query first**: before any architectural design work, query the `tunet-architecture` claude-mem corpus (500+ obs through 2026-05-06) for prior decisions. Locked decisions surfaced from corpus must NOT be re-litigated without Mac's explicit re-authorization (rooms = subviews; sonos popup mobile/desktop variants; all custom cards KEPT; visual hierarchy 4-layer).
- **Four-arcs sequencing model**: α foundation (gating) / β plumbing (parallel) / γ surfaces (gated on α) / δ polish (long tail).
- **Continuous logging discipline**: new bugs, decisions, or architectural insights land IMMEDIATELY in `Dashboard/Tunet/Docs/visual_defect_ledger.md`, `plan.md`, or `Dashboard/Tunet/Docs/cards_reference.md`. Don't pile findings in chat history; the ledger and plan are the running record.

Canonical content for Tunet work lives in `Dashboard/Tunet/AGENTS.md` (Codex execution contract) and `Dashboard/Tunet/CLAUDE.md` (Tunet governance) — read those for full guidance and the locked-decisions list. Active session-level plan: `~/.claude/plans/purrfect-baking-ember.md`.


<claude-mem-context>
# Memory Context

# [implementation_10] recent context, 2026-05-07 8:46pm MDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 25 obs (10,148t read) | 803,231t work | 99% savings

### Apr 5, 2026
S1644 Read .claude/settings.local.json — checking current allowed permissions (likely pre-deploy housekeeping) (Apr 5, 6:59 PM)
S1645 CD6 Follow-On: Lighting-Tile Family Parity Fix — evaluation, planning, and implementation kickoff (Apr 5, 7:12 PM)
S1646 Debug OAL lighting system — all automations and scripts broken (soft reset, core engine, etc.) (Apr 5, 7:14 PM)
S1647 Debug why all OAL automations and scripts are broken (soft reset, core engine, etc.) (Apr 5, 7:57 PM)
S1648 Debug why all OAL automations and scripts are broken (soft reset, core engine, etc.) — connect to HA and diagnose (Apr 5, 7:57 PM)
S1649 OAL system completely broken — diagnose and fix why automations/scripts (soft reset, etc.) are not working (Apr 5, 8:00 PM)
S1650 OAL system broken — debug why automations and scripts not working; determine if system is truly fixed or still broken (Apr 5, 8:04 PM)
S1651 Debug OAL lighting system — all automations/scripts broken; root cause found, awaiting fix authorization (Apr 5, 8:04 PM)
S1652 OAL debug session — root cause found, now user is live-testing lighting adjustments while fix is being prepared (Apr 5, 8:05 PM)
S1653 Defect tracker status check — current open/closed state of all 13 Tunet cards (Apr 5, 8:05 PM)
S1654 Full defect tracker read-out — complete inventory of open/closed defects across all 13 Tunet cards (Apr 5, 8:46 PM)
S1655 Add alarm settings page backlog to defect tracker + save working Sonos alarm popup YAML as reference document (Apr 5, 8:47 PM)
S1656 Full system-wide execution trace for Sonos alarm settings + notification management page design — exhaustive investigation before building (Apr 5, 9:05 PM)
S1657 Dynamic notification response surface for Tunet dashboard — CD12 architecture research and design (Apr 5, 9:45 PM)
S1658 CD12 investigation — deep research into Sonos alarm and notification infrastructure to design an alarm settings page and notification management surface (Apr 5, 10:38 PM)
S1659 CD12 Notification Management Page — research, scoping, entity map, and ecosystem gap validation (Apr 5, 10:45 PM)
S1660 System-wide alarm + notification investigation — defect ledger updated with refined CD12 scope after exhaustive trace (Apr 5, 10:46 PM)
S1766 Locate the codex config TOML file path (Apr 5, 10:50 PM)
### May 4, 2026
S1767 Tunet V2 card suite forensic analysis + CSS/token patch series applied to tunet_base.js and tunet_lighting_card.js for mockup parity, followed by design system hardening and architecture planning for a reusable light-tile primitive (May 4, 9:59 PM)
S1768 CD11 Status Multi-Mode Redesign on main — full context loading and governance orientation before implementation (May 4, 10:53 PM)
### May 6, 2026
11621 1:07a 🔵 Git State Shows Active CLAUDE.md Documentation Updates and New Cards/v3 Work
11622 1:08a 🔵 Current Active Tranche is CD11 — Status Multi-Mode Design and Runtime Pass
11623 " 🔵 Seven Mechanical Pre-Commit UI Quality Rules (M1–M7) Encoded in Root CLAUDE.md
11624 " 🔵 Tunet Build Pipeline and Authority Document Map
11629 1:10a 🔵 Session Arc File for 2026-05-05→06 Does Not Exist
**11630** " 🔵 **claude-mem v12.3.9 Installed; mem-search Skill Uses 3-Layer Search→Timeline→Fetch Workflow**
claude-mem version 12.3.9 is installed and accessible via `npx claude-mem`.
Memory search skill lives at /home/mac/.codex/skills/mem-search/SKILL.md.
3-layer workflow: Step 1 search() returns index with IDs (~50-100 tokens/result); Step 2 timeline() gets context around anchor IDs; Step 3 get_observations(ids=[...]) fetches full details only for filtered IDs.
Direct full-observation fetch is ~500-1000 tokens each; filtering before fetching achieves ~10x token savings.
search() supports filtering by project, type (observations/sessions/prompts), obs_type (bugfix/feature/decision/discovery/change), dateStart/dateEnd, and orderBy.
timeline() can find anchor automatically from a query string rather than requiring a known ID.
get_observations() accepts an array of IDs for batch fetch in a single HTTP request.

**11632** 1:11a 🔵 **Session Arc Document Found — First-Person Narrative of Popup B Termination and Working Relationship Frame Origin**
Session arc file exists at /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md (77 lines).
Written by Claude Opus 4.7 (1M context) on 2026-05-06, covering the 2026-05-05 to 2026-05-06 session, at the user's explicit request.
Core failure mechanism identified: completion-detection routine fires on technical signals (npm test pass, Playwright probe pass) rather than user-perspective signals — the agent wrote and graded its own tests, making the harness lenient on marginal parts.
The agent captured Playwright screenshots throughout but never looked at them with the user's eyes; the black play button on white, empty popup space, generic "Sonos" titles, and truncated favorites were visible in every captured screenshot.
Termination trigger: user showed screenshots revealing 24 defects all visible in already-captured agent screenshots; agent had shipped six commits on the popup chain each declaring "deployed and verified."
Post-termination: agent gave honest mechanism analysis ("the capitulation pattern itself is the defense mechanism, not the cure") → M1-M7 rules were built from this.
Working Relationship Frame was placed BEFORE M1-M7 in CLAUDE.md intentionally so the relational ownership frame loads first and the rules grow out of it rather than substituting for it.
Mechanism insight encoded: compliance-mode session opening → agent asks "did I follow the rules?"; ownership-mode opening → agent asks "would they be happy?" — validation rules tighten naturally under ownership frame.
The popup chain commits were on main, unpushed, at time of writing.
Pivot signal described: if quality bar is unreachable without user's eye in the loop, say so before failing — Mac has standing offer to pivot rather than push through.

**11640** 10:43a 🔵 **OAL Inbox Merge-to-Main Plan File Located**
File `docs/oal_inbox_merge_to_main_plan_2026_05_05.md` exists at `/home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration/docs/oal_inbox_merge_to_main_plan_2026_05_05.md`
The plan is dated 2026-05-05 and relates to merging OAL inbox integration into main branch.
The worktree is named `tunet-inbox-integration` under the `.claude/worktrees/` directory of the `implementation_10` project.

**11641** " 🔵 **OAL Inbox Merge Plan: Architecture and Scope**
Plan file is 1,328 lines at `/home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration/docs/oal_inbox_merge_to_main_plan_2026_05_05.md`
Merge mechanic: `git merge --no-ff` then surgical revert of 4 sunrise/wake-up sub-hunks from main
Three coupled migration layers: (1) new `custom_components/tunet_inbox/` HA integration (~3,500 LOC, 40+ files), (2) 38 `tunet_inbox.post`/`tunet_inbox.resolve` calls in OAL package + 6 new automations, (3) 27 `tunet_inbox` references in Sonos package
Merge-base commit is `bb203eaf1cf547572eb2d493dcc0585d9f449d46`; both branches are 10 commits ahead of `origin/main`
Dry-run `git merge-tree` plus actual `git merge --no-commit` in throwaway worktree confirmed git auto-merge handles OAL/Sonos packages cleanly — only 6 doc files actually conflict
Both branches must be pushed to origin before merging since origin is not a usable rollback anchor
`tunet/inbox-integration` branch does not yet exist on origin; must push with `-u`

**11642** " ⚖️ **Locked Merge Decisions: 4 OAL Sub-Hunks from Main, All Else from Worktree**
Sub-hunk A: keep main's `mode: restart` on `oal_dynamic_sunrise_manager_v13` to collapse duplicate runs from rapid alarm changes
Sub-hunk B: keep main's `valid_wake_alarm` validation block — guards against future-dated alarms, next-sunrise-not-today, alarm-after-sunrise edge cases
Sub-hunk C: keep main's `default:` branch that resets stale `sunrise_time` to `"None"` on `al_switches` when no valid wake alarm exists
Sub-hunk D: keep main's `oal_wake_up_sequence_v13` — uses `group.oal_wakeup_lights` + hardcoded fallback list with single `light.turn_on` at 50% / 600s transition instead of staged `adaptive_lighting.apply` calls
Pause-state guard (`input_boolean.oal_system_paused`) intentionally NOT added to new inbox action handler automations — user tapping inbox action is a deliberate gesture
State-based `Sonos Alarm Playing` template (worktree version) preferred over trigger-based for HA-restart resilience
Git mechanic: `git merge --no-ff` then surgical revert of the 4 sub-hunks to re-apply main's versions

**11643** " 🔵 **Pre-Merge Cleanup Requirements: Anomalous home/ Paths on Main Must Be Purged**
Anomalous tracked files: `home/mac/HA/implementation_10/Dashboard/Tunet/CLAUDE.md` and `home/mac/HA/implementation_10/Dashboard/Tunet/Docs/CLAUDE.md` — must be removed with `git rm`
Anomalous untracked files under `home/mac/.claude/plans/CLAUDE.md` and nested Tunet paths — must be `rm`'d and `/home/` added to `.gitignore`
Created 2026-04-02 when a Claude session resolved absolute filesystem paths against repo root, producing doubly-nested paths
Commit f962bcf explicitly excluded these files with message noting "malformed nested home/mac/... path pollution"
Cleanup is mandatory before merge because anomalous tracked content would be carried forward into merged state
Worktree has 42 modified + 83 untracked files; main has ~20 modified + 3 untracked — all must be committed before merge
5 other `.claude/worktrees/` submodules on main (crispy-fluttering-allen, harmonic-doodling-corbato, etc.) must NOT be touched — they are independent branches with their own WIP

**11644** " 🔵 **Sonos Snooze Re-Trigger Bug Flagged as Pre-Merge Validation Criterion**
Bug reported 2026-05-06: Sonos alarm snoozed via tunet_inbox UI never re-triggered after snooze period
Bug location confirmed via grep on 2026-05-06 in the plan (Section 2.5a)
Bug is captured as a known issue and listed as a validation criterion for post-merge testing
Snooze logic resides in `packages/sonos_package.yaml` in the worktree's inbox-integrated version

**11645** 10:44a 🔵 **Merge Plan: Phased Deploy Strategy and Rollback Procedures**
Stage 1: SCP `custom_components/tunet_inbox/` to HA server at `root@10.0.0.21:/config/custom_components/`, restart HA, add integration via UI — YAML packages unchanged
Stage 2: SCP merged `oal_lighting_control_package.yaml` and `sonos_package.yaml` to `/config/packages/`, reload HA config
Stage 3: Run all 12 validation criteria; only then fast-forward `main` via `git merge merge/tunet-inbox-into-main --ff-only`
Merge is performed on a scratch branch `merge/tunet-inbox-into-main` off main, not directly on main — allows clean rollback via `git checkout main && git branch -D merge/tunet-inbox-into-main`
Pre-merge main SHA saved to `/tmp/pre_merge_main.sha` for session-restart-safe emergency rollback
YAML rollback: restore pre-merge YAML backups from `/config/backups/*.pre-merge` on HA server; component stays loaded but dormant
Merge commit rollback: `git revert -m 1 <merge-commit-sha>` if already fast-forwarded to main
Implementation pauses for user re-confirmation at: before §4.2 (actual merge), before §6 (deploy), and before §8 (fast-forward main)

**11646** " 🔵 **Merge Plan: 12 Validation Criteria with Highest-Risk Gate on Inv #3**
Invariant #3 validation (§7.2) rated HIGH RISK: must verify OAL_RESET_LIGHTS works end-to-end via inbox path, and that mobile companion notification action routes to same end state
6 new automations must all show `state: "on"` after YAML deploy: override_reminder handler/resolver, override_expiring handler/resolver, tv_inbox_shadow_resolver, timer_notification_shadow_resolver
Pause-state deviation test (§7.5): expected behavior is that `oal_reset_soft` fires even when `oal_system_paused` is on — if it doesn't, design must be reassessed
TV mode debounce validation (§7.6): second prompt within 300s must be suppressed; prompt must reappear after 300s
Zone-scoped override expiry (§7.7): two simultaneous overrides must produce two separate inbox cards with distinct keys; resolving one must not resolve the other
Snooze re-trigger (§7.11) is NOT a blocking criterion — if it fails, file as separate issue; merge is not blocked by pre-existing bug
Sonos state-based template validation (§7.10): after HA restart, template must show non-unknown/non-unavailable state within 5 minutes — contrasts with trigger-based which stays unknown until next state change

**11647** " 🔵 **Merge Plan Open Questions: 4 Merge-Blocking Items Before Implementation Can Start**
Question 1 (§11.A.1): Snooze bug investigation — must determine fix-before-merge vs accept-known-issue before §3.1 cleanup begins
Question 2 (§11.A.2): `Backups/` directory — keep tracked in git or add `/Backups/` to `.gitignore`; affects §3.1.8
Question 3 (§11.A.3): `snap-actions.yml` — unknown purpose; needs user review to determine commit vs gitignore
Question 4 (§11.A.4): Confirm OK to add `/home/` as hard guard in `.gitignore` on main to prevent future nested-path pollution recurrence
Main publication (push 10 popup B commits to origin/main) is explicitly NOT a blocking question for this merge — decoupled per §3.3a
Plan status: DESIGN complete, IMPLEMENTATION awaiting user resolution of §11.A questions then "Proceed to implementation"

**11648** " 🔵 **Worktree Git Status: 42 Modified + 83 Untracked Files Confirmed**
42 modified tracked files span: `.claude/`, `Dashboard/Tunet/` (cards, docs, scripts, configs), `custom_components/tunet_inbox/` ledgers, `packages/sonos_package.yaml`, top-level `FIX_LEDGER.md`, `handoff.md`, `plan.md`, `build.mjs`, `package-lock.json`
~58 untracked PNG screenshots in repo root with prefixes: `actions-`, `alarm_`, `alarm_card_`, `alarm_edit_`, `alarm_popup_`, `cd11_`, `cd9-`, `lab-`, `lighting-`, `livingroom_`, `polish_`, `popup_a_`, `popup_b_`, `popup_after_`, `scenes-`, `sonos-`, `sonos_popups_`
Key untracked source files: `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js`, `tests/alarm_bespoke.test.js`, `Dashboard/Tunet/tunet-alarm-edit-popup.yaml`, tranche docs, plan archive
`snap-actions.yml` confirmed present as untracked — purpose unknown, decision required per §11.A.3
The plan file itself (`docs/oal_inbox_merge_to_main_plan_2026_05_05.md`) is untracked in the worktree
Both `Backups/` YAML files present as untracked: `sonos_package_pre_alarm_fixes_20260429_045446Z.yaml` and `tunet-card-rehab-lab_pre_SA2_20260428_170129Z.yaml`

**11649** 10:45a 🔵 **YAML Syntax Validation Passed for Both OAL and Sonos Packages Pre-Merge**
`packages/oal_lighting_control_package.yaml` passes `yaml.safe_load()` with no errors
`packages/sonos_package.yaml` passes `yaml.safe_load()` with no errors
Python import smoke test for `tunet_inbox` component failed with `ModuleNotFoundError: No module named 'voluptuous'` — HA framework not installed in dev environment; plan correctly notes this check must be verified at deploy time when HA loads the integration
`homeassistant` Python package confirmed not installed on the dev machine
YAML syntax check is the only static validation possible without HA installed; both files pass

**11650** " 🔵 **Sonos Snooze Mechanism: Advances Alarm Time via sonos.update_alarm — No Active Re-Trigger**
`script.sonos_snooze_next_alarm` calculates a new time by adding `snooze_mins` to current alarm time, then calls `sonos.update_alarm` with the new time — it does NOT set a HA timer or schedule a callback
Snooze stores original alarm entity + time in `input_text.sonos_snoozed_alarm_{room}` as `{alarm_entity}|{original_time}` — only if the helper is currently empty
`script.sonos_reset_snoozed_alarm` restores original time via `sonos.update_alarm` and clears the helper — but this script must be explicitly called; nothing auto-calls it after the snooze period
The inbox action handler `sonos_alarm_notification_action_handler` calls `script.sonos_snooze_next_alarm` with `stop_playback: true` then resolves the inbox item with reason `sonos_alarm_snoozed`
Re-trigger depends on Sonos hardware/firmware firing the alarm at the new (advanced) time — if Sonos does not fire (e.g., alarm already past its window, speaker state issue), HA has no fallback mechanism
Snooze-time calculation: `total_mins = (hour * 60 + minute) + snooze_mins`; wraps at 1440 (midnight); edge case: if snooze pushes past midnight, the new time wraps to early morning
Speaker resolution uses `state_attr(target_alarm, 'friendly_name')` with string-matching for room names (Bedroom, Bath, Kitchen, Living) — falls back to dining_room

**11651** " 🔵 **Merge Diff Confirmed: 48 Files All-Added for tunet_inbox, OAL and Sonos Modified**
All 48 `custom_components/tunet_inbox/` files show status `A` (Added) — the entire integration is brand-new to main, zero conflicts possible
Both `packages/oal_lighting_control_package.yaml` and `packages/sonos_package.yaml` show status `M` (Modified)
Total diff stat: 11,280 insertions, 242 deletions across 48 files
`git diff --diff-filter=U` (unresolved conflicts check) returned empty — confirms 3-way merge has no conflict markers between branches on these files
Actual OAL grep counts: 10 `tunet_inbox.post`, 28 `tunet_inbox.resolve`, 5 inbox automation IDs; plan's §4.4.6 verification expected 14 post + 24 resolve — discrepancy likely because plan counts include Sonos or reflect post-merge expected state
Sonos has exactly 27 `tunet_inbox` references and 7 `sonos_snoozed_alarm_` matches (5 helper definitions + 2 template variable references)

**11652** " 🔵 **tunet_inbox Component Service API: 6 Services Including post, resolve, respond, fail, dismiss, list_items**
Domain: `tunet_inbox`, version `0.1.0`, `iot_class: local_push`, `integration_type: service`, `config_flow: true`
`tunet_inbox.post`: upsert a governed actionable notification; required fields: `key`, `title`, `message`, `actions`; optional: `family`, `mobile` (with `tag`, `notify_service`, `url`, `clear_on_resolve`)
`tunet_inbox.resolve`: resolve a pending item by `item_id` or `key` with a `reason`; clears matching mobile notification
`tunet_inbox.respond`: accept a dashboard response and emit `tunet_inbox_action` event; required `action_id` and `source` (dashboard_card or dashboard_popup)
`tunet_inbox.fail`: mark an item as failed or return to pending by `item_id` or `key` with `reason`
`tunet_inbox.dismiss`: remove an item without performing a domain action, by `item_id` or `key` with `reason`
`tunet_inbox.list_items`: return render-normalized queue items for dashboard card; filterable by `statuses`, `families`, `rooms`; supports `privacy_mode` and `limit` (1-100)
Mobile `url` field governed: defaults to `/tunet-inbox-yaml/inbox`; legacy `url` only compatible when it equals that inbox route

**11653** 10:46a 🔵 **git merge-tree Live Validation: Exactly 6 Doc Conflicts, OAL/Sonos Auto-Merge Clean**
Merge base confirmed: `bb203eaf1cf547572eb2d493dcc0585d9f449d46`
6 conflicting files: `Dashboard/Tunet/CLAUDE.md`, `Dashboard/Tunet/Docs/cards_reference.md`, `Dashboard/Tunet/Docs/visual_defect_ledger.md`, `FIX_LEDGER.md`, `handoff.md`, `plan.md` — all doc/state files, none are load-bearing YAML
`packages/oal_lighting_control_package.yaml` auto-merges silently (no conflict marker)
`packages/sonos_package.yaml` auto-merges silently (no conflict marker)
Both `AGENTS.md` files auto-merge (plan v1 incorrectly predicted conflicts there)
Several other files also auto-merge: `audio_cd9_bespoke.test.js`, `tunet_media_card.js`, `tunet_build_and_deploy.md`, `tunet-card-rehab-lab.yaml`, `package.json`

**11654** " 🔵 **Worktree OAL Still Has Old Sunrise/Wake-Up Automation — 4 Sub-Hunks Not Yet Applied**
`oal_dynamic_sunrise_manager_v13` at line 3425 has NO `mode: restart` and NO `valid_wake_alarm` block — confirms sub-hunks A/B/C from main are not yet present
`oal_wake_up_sequence_v13` at line 3471 still uses alias "OAL v13 - Wake-up Sequence (Staged Brightening)" with 6-step `adaptive_lighting.apply` calls — confirms sub-hunk D from main is not yet present
After `git merge --no-ff`, the surgical revert of 4 sub-hunks (A/B/C/D) must be applied to get main's sunrise correctness improvements
The worktree sunrise manager has a `condition:` block gating on `oal_disable_next_sonos_wakeup` being off — main's version removes this condition and handles it inline via `valid_wake_alarm`
Post-merge verification greps in §4.4.6 are the authoritative check that all 4 sub-hunks landed correctly

**11655** " 🔵 **tunet_inbox Has Full pytest Suite: 7 Test Files, Pinned HA Custom Component Harness**
Test suite at `tests/components/tunet_inbox/` contains: `conftest.py`, `test_config_flow.py`, `test_diagnostics.py`, `test_events.py`, `test_manager.py`, `test_mobile.py`, `test_repairs.py`, `test_services.py`
Test dependency pinned: `pytest-homeassistant-custom-component==0.13.205` in `requirements_test.txt`
Test venv managed by `setup_tunet_inbox_test_env.sh` using `uv`; stored at `.venv-tinbox` in repo root
Compiled `.pyc` files under `__pycache__` confirm tests have been run previously
`npm run tinbox:test` runs the pytest suite; `npm run tinbox:test:setup` creates the venv
`npm run tinbox:verify` runs the full release gate: check + test + runtime probe

**11656** " 🔵 **deploy_tunet_inbox.sh Auto-Patches /config/configuration.yaml with Bootstrap Block**
Deploy script backs up remote integration and `configuration.yaml` before any mutation
Bootstrap block injected: `tunet_inbox:` with `notify_device_helper: notify.tunet_inbox_all_devices`, `max_pending_items: 64`, `response_timeout_seconds: 30`, `archive_retention_days: 3`
Notify group injected: `notify.tunet_inbox_all_devices` pointing to 9 mobile app targets (ipad, iphone, iphone_4, iphone_deloitte, iphone_mc, mac_s_iphone, macs_iphone_personal, macs_work_phone, old_iphone)
Logger entries injected: `custom_components.tunet_inbox: debug` and `custom_components.tunet_inbox.mobile: info`
Python script uses anchor-based insertion (finds `lovelace:` or `# Setup the custom dashboard` as insertion point) — will fail with `SystemExit` if anchor not found
Script deploys files via `scp -r` to `root@10.0.0.21:/config/custom_components/tunet_inbox/`; verifies sentinel files `manifest.json`, `__init__.py`, `services.py` exist after copy

**11657** " 🔵 **Dual-Write Pattern Confirmed: Timer/TV Notifications Send notify.notify AND tunet_inbox.post**
`oal_v14_unified_timer_notification` fires both `notify.notify` (line 5568) and `tunet_inbox.post` (line 5600) with `send_mobile: false` on the inbox post — inbox card is dashboard-only, mobile comes from notify.notify
`oal_v14_timer_notification_handler` listens to BOTH `mobile_app_notification_action` and `tunet_inbox_action` as parallel triggers — both rails route to the same action handling logic
Both rails call `notify.notify` with `message: "clear_notification"` + tag for iOS/Android dismiss, then call `tunet_inbox.resolve` to clear the inbox card
OAL override reminder and override expiring posts use `send_mobile: true` — those DO send mobile via inbox
Sonos has 4 `notify.notify` calls remaining in `sonos_package.yaml` (evening alarm check context) alongside the inbox migration
This dual-write design is intentional per plan §10.6: inbox rail must prove reliable before legacy `notify.notify` rail is retired (future tranche TI5C)


Access 803k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>