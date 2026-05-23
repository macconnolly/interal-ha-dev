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
- **Scoped owns contract, root owns narrative** (encoded 2026-05-22): when parallel ledgers exist — root `FIX_LEDGER.md` vs `custom_components/<component>/FIX_LEDGER.md`, root `plan.md` vs scoped `plan.md`, root `handoff.md` vs scoped `handoff.md` — the scoped ledger is the single source of truth for the **contract** (file:line evidence, P-level severity, owning tranche, resolution criteria). The root ledger carries the **session narrative** (what happened, what was decided, cross-cutting context) and at most a **one-line backlog reference** pointing back to the scoped contract. Never duplicate prose between root and scoped; resolve conflicts in favor of the scoped contract. See `~/.claude/projects/-home-mac-HA-implementation-10/memory/feedback_scoped_vs_root_ledger.md`.

Canonical content for Tunet work lives in `Dashboard/Tunet/AGENTS.md` (Codex execution contract) and `Dashboard/Tunet/CLAUDE.md` (Tunet governance) — read those for full guidance and the locked-decisions list. Active session-level plan: `~/.claude/plans/purrfect-baking-ember.md`.


<claude-mem-context>
# Memory Context

# [implementation_10] recent context, 2026-05-23 12:13am MDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 25 obs (10,844t read) | 143,494t work | 92% savings

### May 22, 2026
S2010 OAL S4 root cause analysis — why lights pop back on at night after being turned off (May 22, 9:45 PM)
S2013 Best-in-class solutions for open uncertainties in the Tunet deploy + visual review rationalization plan (tunet-deploy-review-rationalization.md, 8-phase β-plumbing tranche) (May 22, 9:48 PM)
S2014 Tunet β-plumbing rationalization — Phase 1 (dashboard registry) complete, awaiting Mac's go for Phase 2 (deploy dispatcher) (May 22, 9:57 PM)
S2022 Execute plan: relocate corner accent Govee to office AL zone, split office AL zone to separate Tuya WallSmart bed pair into its own office_bed zone with 2000/2000K warm pin (May 22, 10:00 PM)
S2023 Fix production dashboard URL: Mac flagged /tunet-home as the correct production target (not /tunet-suite), then capture and commit the correction including a live config snapshot, registry update, and route builder fix. (May 22, 10:37 PM)
S2024 Mac asked to verify iPhone delivery of SendUserFile captures; session is now investigating whether the --share-with-user / SendUserFile delivery mechanism actually reaches Mac's iPhone as assumed in Phase 5. (May 22, 11:00 PM)
S2025 Two open questions blocking progress: (1) What delivery mechanism gets captures to Mac's iPhone from WSL? (2) Is the correct production dashboard /tunet-home or /tunet-overview/overview — Mac's latest message mentioned "tunet-overview/overview was the main storage dashboard" (past tense), creating ambiguity. (May 22, 11:01 PM)
S2026 OAL v13 bed lights warm pin — architecture review, defect analysis, and deploy of oal_office_bed_warm_pin_v13 automation to fix Tuya WallSmart CCT hardware limitation (May 22, 11:03 PM)
S2027 User confirmed bed lights should NEVER show white — architecture refined to eliminate all CCT path exposure on office bed lights (May 22, 11:05 PM)
S2028 Complete and commit the --share-with-user HA push notification implementation in tunet_playwright_review.mjs, including production route fix and full documentation sync (May 22, 11:08 PM)
S2029 OAL v13 bed lights warm pin architecture — exploring split AL config (office_bed) vs single office AL with per-light color manual_control to achieve "brightness adapts, color stays deep amber [22,100]" (May 22, 11:13 PM)
S2030 Re-fire HA push notifications for Tunet Playwright review (May 22, 11:14 PM)
S2031 Office bed lights deep amber fix — Phase 1 AL split and per-attribute color lock (OAL v13 Campaign A) (May 22, 11:17 PM)
S2032 Tunet dashboard deployment, production target corrections, HA push notification setup, and shipping all phase commits to GitHub (May 22, 11:26 PM)
S2033 Office bed lights deep amber fix — Phase 1 end-to-end verification of per-attribute manual_control:"color" lock (OAL v13 Campaign A) (May 22, 11:28 PM)
S2034 Office bed lights deep amber — plan review and architecture simplification decision (OAL v13 Campaign A) (May 22, 11:30 PM)
S2036 CLAUDE.md quality audit and improvement via claude-md-management:claude-md-improver skill — reviewing all CLAUDE.md files in implementation_10 and proposing targeted edits to the root file (May 22, 11:31 PM)
### May 23, 2026
12422 12:01a 🔵 Global and Parent-Directory CLAUDE.md Hierarchy Mapped
12423 " 🔵 Docs Sync Audit: Stale References Inventory in implementation_10
12424 " 🔵 tunet_build_and_deploy.md npm Scripts Table Missing Several Deployed Scripts
12425 " 🔵 Root CLAUDE.md Contains Detailed Ownership Frame and Non-Negotiable UI Review Protocol
12426 " 🔵 Multiple Subdirectory CLAUDE.md Files Are Empty Placeholders
**12431** 12:02a 🔵 **Root CLAUDE.md M3–M7 Rules and Current Tunet Tranche State (CD11 Active)**
M3: Only the user holds the "done" stamp — agents report "Implemented X. Evidence: [artifacts]. Awaiting your review." Tranche-closure language like `CD11 — CLOSED` requires explicit user confirmation in the same session.
M4: Pre-commit defect inventory must list defects in the CURRENT surface state, not just what was fixed — triaged as blocker / visible / minor, with blockers resolved before commit and others logged to `Dashboard/Tunet/Docs/visual_defect_ledger.md`.
M5: Third-party visual defects are owned project defects — "documented third-party limitation" is not an acceptable disposition; acceptable resolutions are fork+fix, replace with native, or remove.
M6: Default UI disposition is "broken until proven otherwise with user-visible evidence" — false-negative cost exceeds false-positive cost.
M7: Each tranche DoD must be evidence-bound (screenshot at named breakpoints + defect inventory + user confirmation); phrases like "polished and complete" are banned.
Active execution plan is `~/.claude/plans/flickering-herding-wolf.md` (CD0–CD12 master plan); active CD11 detail plan is `~/.claude/plans/synthetic-dazzling-oasis.md`.
Current tranche is CD11 — Status Multi-Mode Design and Runtime Pass; CD10 nav verify is intentionally deferred pending room/surface composition direction.
Completed tranches run CD0–CD9 (Apr 3–6 2026); CD12 surface assembly is gated on card suite stability.
Build shortcuts: `npm run tunet:build` (esbuild 13 cards), `npm run tunet:deploy:lab` (build + SCP frontend), `npm run tinbox:deploy:integration` (SCP backend custom_components); both must stay in sync per TINBOX-DEPLOY-1.
OAL section defines 5 principles and 7 system invariants — invariant violations are STOP conditions requiring redesign, not workarounds.
Govee color temp must be clamped to 2700–6500K despite device-reported range of 2000–9000K; violation produces purple/pink color.

**12432** " 🔵 **Tunet CLAUDE.md Contains Locked Architecture Decisions and Four-Arcs Sequencing Model**
`Dashboard/Tunet/CLAUDE.md` defers to `Dashboard/Tunet/AGENTS.md` on any conflict — AGENTS.md is the execution authority.
Mandatory review pack has 13 files in a defined order, ending with the active plan files `flickering-herding-wolf.md`, `synthetic-dazzling-oasis.md`, and `purrfect-baking-ember.md`.
Design/execution precedence order: plan.md → FIX_LEDGER.md → handoff.md → cards_reference.md → legacy_key_precedence.md → sections_layout_matrix.md → design_language.md → design.md → CLAUDE.md → other docs.
Locked decision: Rooms tile tap = toggle, hold (400ms) = navigate to dedicated subview (corpus #11178, #11192, May 4 2026) — cannot be re-litigated without Mac's explicit re-authorization.
Locked decision: Sonos popup chain — mobile uses `tunet-media-card` + `tunet-speaker-grid-card`; desktop uses `tunet-sonos-card` via Bubble Card 3.2 popup mechanism (corpus #11442, #11488, May 5/6 2026).
Locked decision (Mar 5 2026): All custom cards are KEPT — no hybrid/native pivot allowed.
Visual hierarchy 4-layer model is locked: chrome / scaffold / tile internals / atoms (defined in `visual_hierarchy.md`).
Architecture-first rule (added 2026-05-08): non-trivial architecture work gets its own focused sub-plan at `~/.claude/plans/<descriptive-name>.md`; do not bolt architectural design onto bug-fix plans.
Before any architectural design, query the `tunet-architecture` claude-mem corpus (500+ observations through 2026-05-06) using `mcp__plugin_claude-mem_mcp-search__search`.
Four-arcs sequencing: α Foundation (page architecture, gating) → β Plumbing (bug fixes, parallel) → γ Surfaces (composition, gated on α) → δ Polish (defects, doc cleanup).

**12433** " 🔵 **.claude/CLAUDE.md Documents ZEN32 LED State Machine and Away Mode Plan References**
`/home/mac/HA/implementation_10/.claude/CLAUDE.md` is 28 lines and functions as a reference index, not a behavioral rules file.
ZEN32 LED state machine reference is at `docs/zen32_led_state_machine_reference.md` — defines two independent layers: control mode (buttons 1–4, yellow/blue/cyan) vs OAL state (button 5, priority: sleep→blue, manual→red, config→green, adaptive→white).
Away Mode feature is planned but NOT yet implemented — spec lives in `Backups/away_mode_implementation_plan.md` and GitHub issue #3.
Away Mode spec includes 8 new entities, 3 automations, modifications to sunrise manager and wake-up sequence, estimated 25-minute implementation, and rollback procedures.
The parent `/home/mac/HA/CLAUDE.md` is empty (3 lines) despite sitting in the Claude Code CLAUDE.md hierarchy above all HA projects.

**12427** " ✅ **CLAUDE.md "Tunet Build / Validation Shortcuts" Section Expanded and Corrected**
Card count corrected from "13 cards" to "15 cards" in tunet:build description.
Three dashboard-deploy scripts added: `tunet:deploy:dashboards`, `tunet:deploy:dashboards:yaml`, `tunet:deploy:dashboards:storage` — dated 2026-05-22 β-plumbing tranche.
Six visual review scripts now listed: tunet:review, tunet:review:smoke, tunet:review:changed, tunet:review:production, tunet:review:both, tunet:review:share.
`tunet:review:share` description explicitly states it replaced SendUserFile-marker emission (2026-05-22) because SendUserFile does not reach iPhone in WSL-on-laptop Claude Code sessions.
Production dashboard URL added: `http://10.0.0.21:8123/tunet-overview/overview` (storage-mode, backed up to `Dashboard/Tunet/tunet-overview-storage-config.yaml`).
Test suite count updated to "19 files, 772+ tests" in npm test description.
`tunet:resources:sync` added as a standalone script for re-syncing resource URLs without rebuilding.

**12428** " ✅ **Dashboard/Tunet/CLAUDE.md "Build / Deploy" Section Expanded**
Dashboard/Tunet/CLAUDE.md "Build / Deploy" section expanded from 5 bare script lines to a full grouped reference mirroring the root CLAUDE.md update.
Explicit deploy ordering rule added: run `tunet:deploy:lab` BEFORE `tunet:deploy:dashboards` so dashboards never reference an undeployed card tag.
Production dashboard URL documented: `http://10.0.0.21:8123/tunet-overview/overview` (storage-mode, backed up to `Dashboard/Tunet/tunet-overview-storage-config.yaml`).
Section now points to `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` as the authoritative scoped contract for npm scripts, deploy chain, known pipeline gaps, and canary doc reference.

**12429** " ✅ **AGENTS.md Section 6 Validation Requirements: Production Capture and Share-Review Rules Added**
New rule: changes touching any card flagged `production: true` in `tunet_dashboard_registry.mjs` require production-mirror capture (`npm run tunet:review:production` or `tunet:review:both`); lab-only captures are M1-banned for these cards.
New rule: iterative real-time review with Mac requires `npm run tunet:review:share`, which fires HA push notification via `notify.tunet_inbox_all_devices` with `data.url` deep-link; Mac taps notification to land on live dashboard.
Rules inserted into §6 Validation Requirements, directly before the §6A Pre-Commit User-Perspective Review block — making the production-capture requirement visible at the validation checklist level, not just buried in §6A.

**12430** " ✅ **Docs/CLAUDE.md Routing Table: deploy_workflow_canary.md Added**
`Dashboard/Tunet/Docs/deploy_workflow_canary.md` added to the Documentation Routing section of Dashboard/Tunet/Docs/CLAUDE.md, described as "Deploy workflow canary (last-known-good evidence)".
Entry inserted between the build/deploy runbook and the visual defect ledger in the routing list.

**12434** " ✅ **Cards/v3/CLAUDE.md Build & Deploy Gotchas: Dashboard Deploy Separation and Production Capture Rules Added**
New gotcha: cards deploy via `tunet:deploy:lab`; dashboard composition deploys separately via `tunet:deploy:dashboards` (added 2026-05-22); always deploy cards first to avoid dashboards referencing undeployed card tags.
Dashboard registry source-of-truth identified as `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs`.
New gotcha: production-facing card changes require M1 production-mirror capture via `npm run tunet:review:production` or `tunet:review:both`; production target is `tunet-overview/overview` (storage-mode).

**12435** 12:03a ✅ **tunet_build_and_deploy.md npm Scripts Table Expanded with 7 Missing Scripts**
Three dashboard-deploy scripts added to the table: `tunet:deploy:dashboards` (full), `tunet:deploy:dashboards:yaml` (yaml-only via SCP), `tunet:deploy:dashboards:storage` (storage-only via WS `lovelace/config/save`).
`tunet:deploy:dashboards` supports `--mode`, `--dashboard`, `--from <n>`, `--dry-run` flags; declared independent of `tunet:deploy:lab`.
Three production-review scripts added: `tunet:review:production` (routes from `production: true` registry entries), `tunet:review:both` (lab + production, manifest groups by target), `tunet:review:share` (capture + HA push notification).
`tunet:review:share` table entry explicitly states it replaced SendUserFile-marker emission 2026-05-22 because SendUserFile does not reach iPhone in WSL-on-laptop Claude Code sessions.
`test` script description updated to include "dashboard registry contract" in the test suite coverage list.

**12436** " 🔵 **Tunet Cards v3 CLAUDE.md: Three-Layer Editor Architecture and Profile Contract**
`Dashboard/Tunet/Cards/v3/` is the sole implementation authority since March 14, 2026.
Visual baseline reference is `tunet_climate_card.js` — measured CSS values serve as the cross-card reference standard.
Editor architecture uses a three-layer model: authoring model (editor surface, high-level intent) → synthesizer (setConfig normalization, infers defaults, handles legacy keys) → runtime model (`_config` after `setConfig()`, richer than editor exposes).
Per-card documentation of all three layers is in `Dashboard/Tunet/Docs/cards_reference.md`; legacy key precedence rules are in `Dashboard/Tunet/Docs/legacy_key_precedence.md`.
Profile contract was superseded April 2, 2026: migrated cards use `tile_size` config override when set, auto-resolve from container width otherwise, expose via `tile-size` attribute with `:host([tile-size="..."])` CSS blocks.
Legacy profile code stays for untouched cards; migration is incremental per active card tranche.
Known build gotcha: `npm run tunet:deploy:lab` deploys built bundles but browser cache can serve stale JS.

**12437** " 🔵 **Root CLAUDE.md OAL Reference Material: Full Architecture, Pipeline, Entity Map, and Zone Config**
OAL v13 brightness pipeline has 6 stages: CONFIG BASELINE → ENVIRONMENTAL OFFSET → SUNSET OFFSET → MANUAL OFFSET → CORE CALCULATION → APPLICATION across 6 zones in parallel.
Core calculation formula: `FINAL = clamp(baseline + env + sunset + manual, zone_min, zone_max) * sensitivity`.
6 active zones: main_living, kitchen_island, bedroom_primary, accent_spots, recessed_ceiling, column_lights — bedroom_primary and column_lights use Govee devices.
6 key automations: `oal_core_adjustment_engine_v13`, `oal_configuration_manager_v13`, `oal_sunset_logic_unified_v13`, `oal_environmental_manager_v13`, `oal_movie_mode_handler_v13`, `oal_isolated_override_manager_v13`.
ZEN32 B5 button: 1x = cycle `oal_current_config`, 2x = reset manual brightness offset, 3x = toggle Sleep/Adaptive mode; B2/B4 adjust brightness offset ±10.
6 documented failure patterns: offset overflow (lights at 0%/100%), Govee purple (color temp &lt;2700K), stuck manual override, LED desync, cascade delay from sequential vs parallel execution, sleep mode ignored.
OAL injection templates require discovered (not static) upstream/downstream dependency lists sourced from live grep of `packages/OAL_lighting_control_package.yaml`.
Live state check requires querying: `input_select.oal_current_config`, `input_boolean.oal_system_paused`, `input_select.oal_active_configuration`.
Cross-package dependencies connect OAL to `zen32_modal_controller_package.yaml` (button events, LED states) and `sonos_package.yaml` (volume mode, media state).
Root CLAUDE.md total length confirmed at 593 lines.

**12438** " ✅ **tunet_build_and_deploy.md: New "Dashboard Deploy" Section Added**
New `## Dashboard Deploy` section inserted between the Credentials section and Known Pipeline Gaps, providing a full operational reference for `tunet:deploy:dashboards`.
Dashboard registry inventory table documents 7 entries: `tunet-overview` (storage, production:true), `tunet-home` (storage, secondary), `tunet-suite` (yaml, fallback), `tunet-card-rehab-yaml` (yaml, rehab lab), `tunet-inbox-yaml` (yaml), `tunet-g2-lab-v3` (yaml), `tunet-suite-storage` (storage, POC).
yaml-mode deploys via sshpass SCP to `/config/dashboards/`; storage-mode deploys via WebSocket `lovelace/config/save` with `lovelace/dashboards/create` if registration doesn't exist.
SSH password passed via `-e` env-var SSHPASS (never in argv); WS auth uses `HA_LONG_LIVED_ACCESS_TOKEN` or `HA_TOKEN` fallback.
Rationale for two independent chains stated: dashboards change less often than cards, so partial-failure recovery is easier with separated scopes.
Contract test `dashboard_registry_contract.test.js` guards: source existence, YAML parse, yaml-mode target presence, storage-mode url_path, configuration.yaml registration, no storage-shadows-yaml conflicts, and consumer import drift detection.

**12439** 12:04a ✅ **tunet_build_and_deploy.md Testing Section: dashboard_registry_contract.test.js Added**
`dashboard_registry_contract.test.js` added to the Testing section's test suite list (11 tests, added 2026-05-22).
Test guards: source path existence, YAML parse, yaml-mode→target, storage-mode→url_path, `Configuration/configuration.yaml` registration, no storage-shadows-yaml conflicts, consumers import the registry (drift guard).

**12440** " ✅ **Memory File reference_ha_deploy_scripts.md Updated: Fourth Deploy Path Added**
Memory file name and description updated: "three governed deploy paths" → "four governed deploy paths (packages, integration, cards, dashboards)".
Fourth row added to the deploy table: `tunet:deploy:dashboards` covers `Dashboard/Tunet/*.yaml` dashboard composition, independent of `tunet:deploy:lab`, with recommended cards-first ordering.
Memory file path: `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_ha_deploy_scripts.md`.

S2038 CLAUDE.md quality audit and targeted edits — Edit 1 applied; session paused mid-edit-sequence to answer a clarifying question about which light entity "the new adaptive light" refers to (May 23, 12:04 AM)
**12441** 12:05a 🟣 **New Memory Entry: reference_tunet_dashboard_inventory.md Created**
New memory file created: `~/.claude/projects/-home-mac-HA-implementation-10/memory/reference_tunet_dashboard_inventory.md`.
Canonical production view declared as `/tunet-overview/overview` (storage-mode); repo source `Dashboard/Tunet/tunet-overview-storage-config.yaml`.
Registry at `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` is the single source of truth — consumed by deploy, visual review, and contract tests.
Three unregistered dashboards noted in HA storage: `tunet-v2-test`, `tunet-card-rehab-lab` (storage variant) — flagged as likely UI-created artifacts pending cleanup.
Entry documents why it exists: production target was declared wrong twice during initial registry seed (tunet-suite → tunet-home → tunet-overview); the gotcha is that production is user-owned, never to be inferred from filename heuristics.
Agent instruction: default to registry for all dashboard questions; for production-facing card changes require M1 production-mirror capture; for iterative real-time review use tunet:review:share (NOT SendUserFile).

**12442** " ✅ **MEMORY.md Index Updated: Deploy Paths and Dashboard Inventory Entries Added**
MEMORY.md deploy entry updated: "three governed paths" → "four governed paths", adding `tunet:deploy:dashboards` summary line.
New MEMORY.md entry added: "Tunet dashboard inventory + production URL" pointing to `reference_tunet_dashboard_inventory.md` with inline summary of canonical production URL, registry as source of truth, and SendUserFile ban.
MEMORY.md also reveals stale content: the "13 cards" and old profile system entries lower in the file still reference the old count and state — not yet updated by this docs sync pass.

**12443** " 🔵 **Docs Sync Validation: Stale "13 cards" Cleared, Tests Pass, Production URL Propagated**
"13 cards" / "esbuild 13" references: zero remaining in CLAUDE.md, Dashboard/Tunet/CLAUDE.md, AGENTS.md, tunet_build_and_deploy.md, Cards/v3/CLAUDE.md — stale count fully cleared from core docs.
`tunet-overview` production URL now appears in 14 locations across the core docs — confirms propagation across CLAUDE.md, AGENTS.md, tunet_build_and_deploy.md, deploy_workflow_canary.md, Cards/v3/CLAUDE.md.
Full test suite: 19 test files, 772 tests, all passed. Duration 14.58s. No regressions from docs sync changes.

**12444** 12:06a 🔵 **Tunet Build/Validation Shortcuts: Full Command Set Including Dashboard Deploy and Review Pipeline**
Build covers 15 cards (not 13 as noted in OAL reference material) via `npm run tunet:build` → `Dashboard/Tunet/Cards/v3/dist/`.
`npm run tunet:deploy:lab` builds + SCPs card JS to HA and bumps Lovelace resource `?v=` query string.
Dashboard deploy commands added 2026-05-22 (β-plumbing tranche): `tunet:deploy:dashboards` (yaml+storage), `tunet:deploy:dashboards:yaml`, `tunet:deploy:dashboards:storage` — driven by `tunet_dashboard_registry.mjs`.
`tunet:deploy:dashboards` has a pre-flight that validates ALL sources before any push, with `--from <n>` resumability on partial failure.
Review pipeline has 5 commands: `tunet:review` (full sweep), `tunet:review:smoke` (390×844 fast pass), `tunet:review:changed` (git-working-context cards only), `tunet:review:production` (production: true registry entries), `tunet:review:both` (lab+production).
`tunet:review:share` fires HA push notification via `notify.tunet_inbox_all_devices` with `data.url` deep-link; replaced SendUserFile-marker emission 2026-05-22 because SendUserFile doesn't reach iPhone in WSL-on-laptop Claude Code sessions.
Vitest suite covers 19 files with 772+ tests (`npm test`).
Lab dashboard URL: `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`; Production URL: `http://10.0.0.21:8123/tunet-overview/overview` (storage-mode, backed up to `Dashboard/Tunet/tunet-overview-storage-config.yaml`).
Section title remains "Tunet Build / Validation Shortcuts" — confirming the Edit 1 rename to include OAL deploy has not yet been applied.

**12445** " ✅ **Full Docs Sync Committed and Pushed: commit aa47f5c**
Commit `aa47f5c` pushed to `origin/main` (interal-ha-dev.git), advancing from `5f47137`.
6 files changed, 113 insertions, 12 deletions: CLAUDE.md, Dashboard/Tunet/AGENTS.md, Dashboard/Tunet/CLAUDE.md, Dashboard/Tunet/Cards/v3/CLAUDE.md, Dashboard/Tunet/Docs/CLAUDE.md, Dashboard/Tunet/Docs/tunet_build_and_deploy.md.
No code files touched — only documentation and memory files. 772/772 tests continue to pass.
Commit message documents all changes: card count correction (13→15), 6 missing npm scripts added to shortcut blocks, production URL added, AGENTS.md §6 production capture rules, Cards/v3/CLAUDE.md deploy chain separation, tunet_build_and_deploy.md Dashboard Deploy section + test suite entry.
Memory files updated in the same session (not in this commit): reference_ha_deploy_scripts.md (3→4 paths), reference_tunet_dashboard_inventory.md (new), MEMORY.md index.

**12446** " ✅ **Edit 1 Applied: OAL Deploy Commands and Two Critical Gotchas Added to Root CLAUDE.md**
New "OAL packages" block inserted after the inbox integration section in `CLAUDE.md` at approximately line 205.
Documents the canonical OAL deploy command: `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh` — backs up live packages to `Backups/<pkg>_<timestamp>.yaml`, git-commits backups, SCPs, byte-size-verifies. Has `--dry-run` (pair with `--assume-remote-match` for full preview).
Gotcha 1 documented: `homeassistant.reload_all` does NOT cross-reload all input-helper domains. Newly-added input_booleans produce `unknown != off` condition failures (silent fail-closed). Required explicit sequence: `input_boolean.reload` → `input_number.reload` → `input_select.reload` → `automation.reload` / `script.reload` / `template.reload`.
Gotcha 1 burn case recorded: `oal_office_bed_warm_pin_kill_switch` was missing after deploy on 2026-05-22, causing the augmentation automation to silently skip.
Gotcha 2 documented: Adaptive Lighting custom integration does NOT re-import `lights:` list for existing config entries on reload — existing entries are immutable from YAML. Options: `ha_delete_config_entry(entry_id=..., confirm=true)` OR `ha_restart()`.
Gotcha 2 burn case recorded: office AL kept old 4-light membership across reloads on 2026-05-22.
New CLAUDE.md length increases from 593 to approximately 598 lines after this edit.

S2037 Full docs sync for implementation_10 Tunet project — correcting stale references and propagating 2026-05-22 β-plumbing tranche changes into all load-bearing docs (May 23, 12:06 AM)
S2039 User clarified that hs_color format was used instead of CCT for bed light augmentation — confirming CCT is accepted but visually unsatisfying on this hardware (May 23, 12:09 AM)
**Investigated**: The bed lights' supported_color_modes were examined, confirming they support both "color_temp" and "hs" modes. A prior test verified that color_temp_kelvin: 2700 successfully set color_mode=color_temp and color_temp_kelvin=2699 on the hardware.

**Learned**: Tuya WallSmart bed lights accept CCT commands without error, but their WW+CW LED channel mapping renders even the warmest declared CCT (2000K) as neutral-white rather than warm-amber. The hs/RGB mode bypasses the CCT-to-LED-channel translation entirely, allowing direct addressing of the warm-LED channel — hs [22, 100] produces deep amber while color_temp 2000K produces neutral-white.

**Completed**: Explained why hs was chosen over CCT for the warm-light augmentation. Confirmed the current CLAUDE.md "Hardware quirks reference" draft correctly states: "Tuya WallSmart bed lights: render 2700K CCT as neutral-white; need hs/RGB augmentation for visible warmth" — using "render as neutral-white" rather than "don't accept CCT."

**Next Steps**: User is deciding whether to expand the CLAUDE.md hardware quirks entry to make the CCT-accepted-but-visually-unsatisfying distinction more explicit, then continue with Edits 2-5 of the pending CLAUDE.md documentation update.


Access 143k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>