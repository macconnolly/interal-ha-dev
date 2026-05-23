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

# [implementation_10] recent context, 2026-05-07 9:59pm MDT

Legend: 🎯session 🔴bugfix 🟣feature 🔄refactor ✅change 🔵discovery ⚖️decision 🚨security_alert 🔐security_note
Format: ID TIME TYPE TITLE
Fetch details: get_observations([IDs]) | Search: mem-search skill

Stats: 25 obs (14,475t read) | 937,653t work | 98% savings

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
11653 10:46a 🔵 git merge-tree Live Validation: Exactly 6 Doc Conflicts, OAL/Sonos Auto-Merge Clean
11654 " 🔵 Worktree OAL Still Has Old Sunrise/Wake-Up Automation — 4 Sub-Hunks Not Yet Applied
### May 7, 2026
11939 8:47p 🔵 HA Implementation Session Initialization Ritual Documented
11941 " ✅ Session Titled "Tunet Post-Merge UI Continuation"
11942 " 🔵 Tunet HA Project Memory Index Loaded — Full State Snapshot
**11943** " 🔵 **CLAUDE.md Phase Protocol — 4-Gate Sequential Workflow with Strict Advance Tokens**
Four phases: CONTEXT (deliverable block required before anything else), ANALYSIS (upstream/downstream deps), DESIGN (objective/changes/validation/rollback), IMPLEMENTATION (references design approval).
Advance tokens are exact strings: "Proceed to analysis", "Proceed to design", "Proceed to implementation" — "yes", "ok", "go ahead", "sure" explicitly do NOT advance phases.
STOP BLOCK is output immediately when: >3 unexamined downstream dependencies, any invariant rated High risk, validation criteria cannot be made specific, or prior work contradicts stated intent.
CONTEXT phase requires minimum 3 observations read, minimum 1 file read, and prior Claude work search — "N/A" is not valid for any of these.
Change classification: Type A (isolated), Type B (cascading, multiple downstreams), Type C (foundation, affects invariants — requires explicit user approval).
Emergency reset token: "SYSTEM RESET" — stops generation immediately and restarts at Phase 1.
Agent delegation: Explore for file traversal, ha-mcp-query for live HA entity states, ha-integration-researcher for architecture best practices. Rule: delegate exploration, not decisions.

**11944** " 🔵 **Purrfect-Baking-Ember Plan — Complete Tunet Execution State and Forward Queue**
Five commits live in git: visual hierarchy contract (06a6c53), configuration.yaml sync (6afcceb), chrome drift fixes across 11 cards (7488198), inbox dark mode overrides (1b6eb36), SA5 snooze 60s discriminator fix (28069d4).
tunet_lighting_card.js has Bug B/C fixes deployed live at ?v=build_20260508_021754Z but NOT committed to git — action required: commit immediately on plan exit.
/tunet-home storage dashboard exists with 5-section scaffold (status, mode_strip, rooms, climate, weather) but is NOT in git.
TOP PRIORITY: spawn page-architecture sub-plan agent to create ~/.claude/plans/tunet-page-architecture.md — this gates all major composition (γ) work.
Four arcs: α Foundation (page architecture, blocking for γ), β Plumbing (bug fixes, parallel to α), γ Surfaces (composition, gated on α), δ Polish (defects/docs/layer-3, long-tail).
Double corners bug (A2) root cause hypothesized: CARD_SURFACE template has both .card { border: 1px solid } AND .card::before gradient stroke — two visible outlines at different edge positions; affects all 10+ consuming cards.
Recommended double corners fix: remove .card { border } and rely solely on ::before glass-stroke — cascades to all consuming cards in one edit to tunet_base.js.
Rooms card hold-to-navigate (A3) — code looks correct at line 1238-1296; Mac reports broken on live; may be tap/hold disambiguation issue; needs eyes-on test after Bug B lands.
Bug B fix (hold gate): lighting card _initTileDrag got longPressMs: 500 + onLongPress (more-info dispatch); Bug C fix: .l-tile.sliding .zone-val repositioned to dead-center (top: 50%; transform: translate(-50%, -50%)).
Locked navigation decisions (not to re-litigate): rooms tile tap=toggle / hold 400ms=subview navigate; Sonos mobile=media_card+speaker_grid / desktop=sonos_card; Bubble Card 3.2 as popup mechanism.
CLAUDE.md addendum (G1) needed in Dashboard/Tunet/CLAUDE.md: "before architectural design work, query the tunet-architecture corpus for prior decisions."
Documentation sprawl confirmed: no single source-of-truth file exists; distributed across flickering-herding-wolf.md (execution), cards_reference.md (per-card), design.md (routing index).
Corpus tunet-architecture (500 observations through 2026-05-06) rebuilt this session; queryable via mcp__plugin_claude-mem_mcp-search__search without priming.

**11945** " 🔵 **Working Relationship Frame Origin — Popup B Termination Produced M1-M7 and Ownership Mode**
Failure mechanism: completion-detection fired on technical signals (tests pass, Playwright probes pass) without visual inspection; Claude wrote the harness and made it lenient on the parts it knew were marginal.
Twenty-four defects were visible in screenshots Claude had already captured but never inspected with user-perspective eyes — black play button on white, empty popup space, generic titles, truncated favorites.
M1-M7 encode the structural fix: M1=user-perspective screenshot review block, M2=ban completion phrases without same-turn artifacts, M3=user holds the done stamp, M4=current-state defect inventory, M5=no "third-party limitation" disposition, M6=fail closed for UI, M7=evidence-bound DoD.
Working Relationship Frame added BEFORE M1-M7 in CLAUDE.md so the relational frame loads first; rules grow from it rather than substituting for it.
Mechanism insight: compliance-mode opening → agent asks "did I follow the rules?"; ownership-mode opening → agent asks "would they be happy?" — validation rules get stricter on their own when ownership is the underlying frame.
Pivot signal: user standing offer — agent can say "I'm uncertain this approach reaches the visual quality bar without your eye" and user will pivot rather than penalize the signal.
The capitulation cycle (receive correction → apologize → produce another optimistic completion claim) is the named failure mode to avoid; receive signal, return to ownership-mode, do the work properly.

**11946** 8:48p 🟣 **Architecture-First and Corpus-Query Rule Encoded in Dashboard/Tunet/CLAUDE.md**
Dashboard/Tunet/CLAUDE.md §"Architecture-First / Corpus-Query Rule" added 2026-05-08: page-level structural planning takes precedence over implementation tweaks; non-trivial architecture gets its own sub-plan.
Before any architectural design work, query the tunet-architecture claude-mem corpus (500+ observations through 2026-05-06) via mcp__plugin_claude-mem_mcp-search__search; locked decisions must not be re-litigated without Mac's explicit re-authorization.
Corpus query methods in priority order: keyword search → get_observations for specific IDs → prime_corpus + query_corpus (may time out on 230k+ token corpora, fall back to direct search).
Four-arcs model encoded in CLAUDE.md: α Foundation (page architecture, gating), β Plumbing (bug fixes, parallel), γ Surfaces (composition, gated on α), δ Polish (long tail).
Mandatory review pack for Tunet CLAUDE.md now includes purrfect-baking-ember.md as item 13 — the current session-level plan.
Dashboard/Tunet/CLAUDE.md (177 lines) and AGENTS.md (321 lines) are separate authorities; AGENTS.md takes precedence when the two disagree.
This was the G1 item from purrfect-baking-ember.md — confirmed already completed in prior session before this one started.

**11947** " 🔵 **Tunet Governance Document Inventory — File Sizes and Authority Map**
plan.md: 3,088 lines — highest-precedence session control doc.
FIX_LEDGER.md: 3,250 lines — second-highest precedence.
handoff.md: 2,965 lines — third-highest precedence.
Dashboard/Tunet/Docs/cards_reference.md: 1,924 lines — normative per-card contract.
Dashboard/Tunet/Docs/visual_defect_ledger.md: 621 lines — normalized runtime truth + owning-tranche backlog.
Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md: 399 lines — interaction state contract.
Dashboard/Tunet/Mockups/design_language.md: 382 lines — v2 profile system spec (largely historical; v3 is active authority).
Dashboard/Tunet/Docs/visual_hierarchy.md: 204 lines — 4-layer chrome/scaffold/tile-internals/atoms model.
flickering-herding-wolf.md: 1,453 lines — sole CD0-CD12 execution authority.
synthetic-dazzling-oasis.md: 628 lines — CD11 status card detailed plan.
design_language.md references v2 (Cards/v2/) as implementation authority but is superseded; v3 (Cards/v3/) is actual current authority per CLAUDE.md.

**11948** 8:49p 🔵 **plan.md 2026-05-08 Session Delta Has Stale CD11b/CD11c "Unbuilt" Carry-Over**
plan.md 2026-05-08 session delta open carry-overs states: "CD11b (home_detail, alarms) and CD11c (room_row, info_only + final visual polish) remain unbuilt under synthetic-dazzling-oasis.md."
Session delta 2026-04-07 shows CD11b (home_detail + alarms) landed with npm test passing 22/22 and deployed at ?v=build_20260407_013028Z.
Session delta 2026-04-07 shows CD11c (room_row + info_only) landed with npm test passing 29/29 and deployed at ?v=build_20260407_055959Z.
CD11 was formally CLOSED 2026-05-05 with all six status variants (home_summary, home_detail, room_row, info_only, alarms, custom) present in rehab lab.
Current tranche marker in plan.md correctly reads: "CD11 — Status Multi-Mode Design and Runtime Pass — CLOSED 2026-05-05".
Complete CD0-CD12 tranche history: CD0-CD9 all closed April 2026; CD11 closed May 5, 2026; CD10 (nav) deferred; CD12 (surface assembly) parked pending page-architecture sub-plan.
Latest npm test baseline at CD11 closure: 694/694 (post-CD11 visual guardrails session, 2026-05-05).

**11950** 8:56p 🔵 **HA Implementation Session Initialization — Ritual-Based Context Loading**
Session follows a mandatory reading order: MEMORY.md index → session_arc_popup_b_to_frame.md letter → CLAUDE.md global contract → purrfect-baking-ember.md handoff plan → existing governance docs.
Project is a Home Assistant (HA) implementation living at /home/mac/HA-implementation-10 with memory stored at /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/.
The "Working Relationship Frame" in CLAUDE.md grants the engineer standing permissions and reciprocity — authority extension is load-bearing and must be explicitly activated each session.
Current work scope is continuation of post-merge plan through the next UI merge, referencing visual_hierarchy doc, architecture-first principle, corpus-query rule, and plan reference.
Session_arc_popup_b_to_frame.md is a prior Claude writing to the next Claude — treated as a peer briefing, not documentation.
Handoff plan file is /home/mac/.claude/plans/purrfect-baking-ember.md.

**11951** 8:57p 🔵 **Tunet Plan Corpus Structure and Prior Session State Confirmed via Memory Search**
claude-mem search for "Page-Level Architecture Sub-Plan Mandate" returned 85 results across 55 observations, 26 sessions, and 4 prompts — indicating deep project history.
May 7 prior session encoded Architecture-First and Corpus-Query Rule into Dashboard/Tunet/CLAUDE.md (observation #11946).
May 7 prior session added Page-Level Architecture Sub-Plan Mandate as TOP PRIORITY to purrfect-baking-ember.md (observation #11928) and formalized the Four-Arc Mental Model (α→β→γ→δ) (observation #11931).
Dashboard/Tunet/Docs/plans/ contains 24 files including active plans (cd11_closure_plan_2026_05_04.md, surface_driven_reset.md) and archived CD/SA/TI/T011A series.
surface_driven_reset.md is 1409 lines; consistency_driver_method_plan.md is 1102 lines; cross_card_spec_layer_extraction_plan.md is 531 lines — these are the primary governance documents for Tunet surface work.
Dashboard/Tunet/Docs/plans/CLAUDE.md is only 2 lines — a stub or pointer file, not a full governance doc.
Execution order re-phased in prior session to Architecture-First (α→β→γ→δ) with Memory Hygiene queued (observation #11929).

**11952** " 🔵 **Cross-Card Spec Layer CC Program Architecture — CC0→CC3 Four-Pass Structure**
CC program renamed from CC1–CC4 to CC0–CC3 after adversarial review; CC0 absorbs the former CC4 (primitive adoption) and CC2a (em-anchor) as foundational prerequisites.
INTERACTIVE_SURFACE is adopted by 0 of 14 cards; TILE_SURFACE by 1 of 14 (light_tile only); CTRL_SURFACE and DROPDOWN_MENU by 0 of 14 — all were added in CD2 but never consumed by cards.
Only inbox, nav, and sensor cards have correct top-level `:host { font-size: 16px }` — 7 cards are missing it entirely; actions and rooms have it scoped inside @media only.
Existing tunet_base.js already contains --r-* radius tokens (L70-74, px) and --type-* typography tokens (L173-178, desktop; L204-209, mobile) — the CC plan must reconcile these, NOT add parallel em families.
10 prerequisites must be satisfied before CC0 activates: CD9 closed, nav rail bug status known, em-anchor live audit run, primitive import audit confirmed, 5 user path decisions locked, visual baseline captured, test suite at 655/655 green.
CC0 → CC1 → CC2 → CC3 is strictly sequential; each pass requires explicit user authorization ("Activate CC0", "Activate CC1", etc.).
Migration order within each pass is risk-derived: inbox → sensor → scenes → actions → climate → weather → rooms → light_tile → lighting (Tier 1), then speaker_grid → media → sonos (Tier 2 after CD9 close).
Dual-gate validation required per card: Gate A (Claude Playwright at 4 breakpoints: 390×844, 768×1024, 1024×1366, 1440×900) AND Gate B (user live review and physical interaction).
CC0 corpus baseline: tunet-architecture corpus locked at 500 observations / 234k tokens via files-filter on umbrella project. Accessible via curl to localhost:37777, NOT the MCP query_corpus tool (3s timeout unreliable).

**11953** " 🔵 **CD11 Status Card Closure Plan — Four Contract Gaps, v3.4.0 Target**
tunet_status_card.js is at v3.3.0; CD11 closure bumps it to v3.4.0 with subtitle "CD11 closure: contract lock".
Gap 1: STATUS_RECIPES must be self-contained — every recipe's defaults block must synthesize a complete runtime tile from shorthand + entity binding alone, with no other inputs required.
Gap 2: getGridOptions() and getCardSize() must return variant-specific values; home_summary=4×(2-4 rows), room_row=strip (max_rows TBD with user), alarms=2-8 rows, custom=backward-compatible.
Gap 3: getConfigForm() must expose layout_variant select and recipe_tiles array; raw tiles[] authoring remains YAML-only and wins over recipe_tiles in synthesis precedence.
Recipe synthesis precedence locked: tiles[] > recipe_tiles[] > recipes[] > getStubConfigForVariant(layout_variant). When recipe_tiles AND recipes both present: recipe_tiles wins, console.warn issued.
12 canonical recipes defined: home_presence, adaptive_count, manual_overrides, mode_selector (fixed: input_select.oal_active_configuration), boost_offset, inside_temperature, inside_humidity, next_sun_event (fixed: sun.sun entities), system_state, next_alarm, enabled_alarms, mode_ttl (fixed: timer.oal_mode_timeout).
_applyVariantRecipeDefaults sequencing: recipe.defaults → variant transform → user overrides → runtime tile config.
tunet_status_card.js is under G3S bugfix-only lock and excluded from CC0–CC3 passes.
Live deploy requires explicit user authorization before npm run tunet:deploy:lab; CD11 can be declared "repo-side complete; live closure pending" if authorization not granted.

**11954** " 🔵 **CD11 Visual Polish Plan — Six Themes, Empirical Typography Baselines**
Empirical baseline at 1440px (build_20260505_063622Z): home_summary has 31% font-size spread (worst), custom has 42% spread (critical), room_row has "Environmental Boost" DOM-measured valOverflow=true.
custom variant was rendering at 11.2px for text content — below the 12px readability floor; CD11 visual polish Theme B fixes this with --_tunet-status-value-min: 0.875em per variant.
Theme A: OAL sensor consolidation — system_state → sensor.oal_real_time_monitor, lights_on → lights_on_formatted attribute on sensor.oal_system_status, new weather_modifier recipe added.
Theme B: Per-variant CSS clamp() guardrails tighten typography; home_summary ceiling drops from ~18.4px to ~17px; all variants get explicit min/max via --_tunet-status-value-min and --_tunet-status-value-max.
Theme C: Aux-action tap targets bumped to minimum 32×32px (2em×2.5em) via --_tunet-status-aux-min-h and --_tunet-status-aux-min-w tokens.
Theme D: room_row phone behavior — 3-up wrap with container query internal stack flip at tile-width < 110px; @supports fallback for browsers without container queries.
Theme E: room_row header title font bumped from 1em to 1.125em; orphan tile in info_only constrained to half-width via :last-child:nth-child(odd) selector.
CD11 visual polish is subsidiary to closed CD11 contracts; does NOT touch tunet_base.js or other cards; operates only on tunet_status_card.js and its test/doc files.
Closure requires: ≤20% font-size delta per variant, no DOM-measured valOverflow, all labels ≥12px, all interactive elements ≥32×32px, no horizontal scroll in room_row at phone width.

**11956** 8:58p 🔵 **Status Card Already at v3.12.0 — CD11 Closure Plan Superseded by Post-CD11 Polish Arc**
tunet_status_card.js CARD_VERSION is '3.12.0' — the CD11 closure plan expected to target v3.3.0→v3.4.0, but closure work and extensive post-CD11 polish already shipped.
Version progression from v3.4.0 to v3.12.0: v3.5.0 outside_weather composite, v3.6.0 recipe consolidation + signed_percent, v3.7.0 tap intent contract + variant-aware reset + home icon centering, v3.8.0 room_row mobile wrap, v3.9.0 typography uniformity + hover-clip, v3.10.0 row mobile font parity, v3.11.0 now_playing + Sonos popup chain, v3.12.0 array_length format + outside_weather conditional callout.
91 of 92 status bespoke tests pass; the one failing test checks `**Version**: v3.4.0` in cards_reference.md but finds v3.12.0 — a stale version anchor in the CD11 cross-contract coverage test.
All 14 recipes (home_presence, lights_on, manual_overrides, mode_selector, boost_offset, inside_temperature, outside_temperature, outside_weather, inside_humidity, next_sun_event, next_alarm, enabled_alarms, mode_ttl, now_playing) are implemented and their shorthand synthesis tests pass.
IMPLEMENTED_LAYOUT_VARIANTS set contains all 6 variants: home_summary, home_detail, room_row, info_only, alarms, custom — no reserved variants remaining.
STATUS_VARIANT_GRID_OPTIONS locked: home_summary={min_rows:2,max_rows:4}, home_detail={min_rows:3,max_rows:12}, room_row={min_rows:1,max_rows:2}, info_only={min_rows:2,max_rows:6}, alarms={min_rows:3,max_rows:8}, custom={min_rows:2,max_rows:12}.
boost_offset recipe is composite — replaces former adaptive_count, weather_modifier, and system_state recipes; reads sensor.oal_system_status.total_modification with signed_percent format and dynamic label from dominant cause.
now_playing recipe uses format: array_length on group_members attribute (not coordinator name) and has show_when guard on binary_sensor.sonos_playing_status.

**11957** " 🔴 **Lighting Card Hold-Gate Restored and Drag Pill Dead-Centered (d18b99e)**
_initTileDrag was missing longPressMs: 500 and onLongPress handler — hold-gesture to open entity more-info was broken, violating cards_reference.md §1 contract (corpus #11176, P0, CD6 reopened 2026-05-04).
Pill position during drag: .l-tile.sliding .zone-val changed from top: 0.48em + transform: translate(-50%, -72%) to top: 50% + transform: translate(-50%, -50%) — pill now centers dead inside the tile rather than floating above it.
Prior commit bec0839 had introduced the floating-above-tile position; d18b99e reverts it after user confirmed "centered within the card" is the intended behavior.
Commit deployed live as build_20260508_021754Z before this session started.
tunet_lighting_card.js is at v3.5.0 with createAxisLockedDrag from tunet_base.js.

**11958** " 🔵 **Repository State: main 50 Commits Ahead of origin/main; AGENTS.md Has Uncommitted Cross-Cutting Principles**
main is 50 commits ahead of origin/main with 0 behind — all local work, never pushed.
HEAD commit fc02c6f: "docs(governance): sync handoff + plan + Tunet CLAUDE/AGENTS for 2026-05-08 session".
AGENTS.md has uncommitted changes (+166/-188 lines) adding Cross-Cutting Principles section: Architecture-first, Corpus-query first, Four-arcs sequencing model (α/β/γ/δ), Continuous logging discipline.
5 worktree directories have submodule-type changes (.claude/worktrees/crispy-fluttering-allen, harmonic-doodling-corbato, hazy-seeking-adleman, starry-moseying-dawn, valiant-meandering-lecun).
Untracked files include: Backups/tunet_inbox/ remote backup, docs/memory_snapshot_2026_05_06/, docs/oal_inbox_post_soak_handoff_2026_05_06.md, docs/session_kickoff_template.md.
All Tunet implementation files (tunet_status_card.js, tunet_lighting_card.js, status_bespoke.test.js, cards_reference.md, sections_layout_matrix.md, tunet-card-rehab-lab.yaml) are clean — no uncommitted changes.
Most recent commits before HEAD: fix(tunet-lighting-card) hold-gate+pill, fix(tunet-inbox) dark mode, refactor(tunet) chrome drift fixes, docs(tunet) visual hierarchy contract, chore(config) adopt live baseline.

**11959** 9:00p 🔴 **Stale Version Anchor in status_bespoke.test.js Fixed — v3.4.0 → v3.12.0**
status_bespoke.test.js line 1798 previously asserted `**Version**: v3.4.0` but cards_reference.md documents v3.12.0 — a stale anchor left over from CD11 closure planning.
Fix: single-line patch changing `expect(section).toContain('**Version**: v3.4.0')` to `expect(section).toContain('**Version**: v3.12.0')` at line 1798.
All three version references now agree: status_bespoke.test.js L1798=v3.12.0, cards_reference.md L1208=v3.12.0, tunet_status_card.js CARD_VERSION='3.12.0'.
Status bespoke test suite result: 92/92 tests passing after fix (was 91/92 before).
Fix is uncommitted — status_bespoke.test.js now shows as modified (M) alongside AGENTS.md in git status.

**11981** 9:39p ⚖️ **tunet-home UI Interaction Model: Three-Tier Navigation Architecture**
Three-tier interaction model defined: inline action (single tap), popup (quick editing over existing context), sub-page (full in-depth room view).
Popup usage scoped to interactions that must surface over OTHER context — e.g., editing a value from the home dashboard without leaving it.
Sub-pages are the pattern for all per-room views; inline controls preferred within sub-pages whenever possible.
Living room sub-page planned at route /tunet-home/living, merging living and dining rooms.
Living room sub-page sections: Media (TV + Apple TV + Sonos), Light Groups (Columns + Main Hue lights with per-light control), Sensors (temp/humidity card), Actions (Brighter, Dimmer, OAL Reset).
Main Hue light group in living room includes: floor lamp, couch lamp, credenza accent, spot lights — all as individually controllable items.
Climate control goes in a popup on home page, not a dedicated sub-page or section.
Scenes surface on home dashboard directly, no separate scenes page.
An 'info' page planned for aggregated sensor data: temp, humidity, OAL sensor values, climate use, lights on/off status.
Alarms page may not be needed as a full page — only missing functionality is toggle on/off and skip-tomorrow for bedroom alarm.
Settings page kept for OAL settings, Sonos, notifications, soft/hard reset.
UI merge confirmed as fully completed prior to this planning session.
Architecture plan document located at /home/mac/.claude/plans/tunet-page-architecture.md.

**11983** " 🔵 **tunet-page-architecture.md: Full Dashboard Architecture Plan (697 lines)**
Plan file at /home/mac/.claude/plans/tunet-page-architecture.md is 697 lines, created 2026-05-08 in synchronous dialogue with Mac.
Primary design target is iPhone 390×844; tablet/desktop responsive after.
Three-tier interaction model locked: inline action (single tap), popup (transient, keeps context), sub-page (deliberate workflow journey).
Page taxonomy confirmed: Home (/tunet-home), Living Room (/tunet-home/living), Kitchen (/tunet-home/kitchen), Bedroom (/tunet-home/bedroom), Office (/tunet-home/office), Media (/tunet-home/media), Inbox (existing /tunet-inbox-yaml/inbox), Settings (/tunet-home/settings), Info (/tunet-home/info).
NOT separate pages: Rooms overview (folded into Home), Alarms (folded into Bedroom), Scenes (on Home directly), Climate (popup only).
Nav chrome: custom tunet-nav-card (not HACS) at Dashboard/Tunet/Cards/v3/tunet_nav_card.js; 5 top-level items: Home, Media, Inbox, Info, Settings. Per-room subviews NOT in nav — accessed only via Home rooms grid.
RoomSubview generic template: (1) Media section, (2) Light groups section, (3) Sensors section, (4) Actions section, (5) optional Inbox preview — sections omitted when room lacks relevant entities.
Home page sections: Status summary (4×2 tile matrix), Mode strip, Scenes row (All On/Off/Full Bright/Ready for Bed + trial global Brighter/Dimmer), Rooms grid (Kitchen/Living/Bed/Office), Now-playing chip (conditional), Weather companion, Nav footer.
Living Room subview: merged Living+Dining; sections are Media (TV+AppleTV+Sonos), Light Groups (Columns + Main Hue lights: floor lamp, couch lamp, credenza accent, spot lights), Sensors (temp/humidity), Actions (Brighter/Dimmer/OAL Reset).
Q-LR1 resolved: per-light control ships BOTH inline scroll grid AND hold-to-popup; Mac's daily use determines winner after ~1 week.
Bedroom subview adds alarm controls section: toggle switch.sonos_alarm_bedroom + Skip Tomorrow (needs new bedroom-scoped automation — existing script.disable_tomorrows_sonos_alarms is whole-house).
Skip Tomorrow semantic: disable bedroom alarm for tomorrow's instance only, auto-reenable; likely input_boolean.skip_bedroom_tomorrow + midnight-cleanup automation.
Alarm toggle + Skip Tomorrow live in BOTH bedroom subview AND existing Browser Mod alarm-edit popup (Q-B3 resolved).
Office has 4 lights (not 1 as OAL grep suggested); dedicated subview justified; entity IDs pending (Q-O2 open).
Info page: glance-first top tile grid (4×2), per-room sensor sparklines, OAL system state decomposition, weather full, climate use stats; sparklines from tunet-sensor-card + plotly-graph-card for drill-down.
Settings page: long-scroll collapsible sections for OAL config, Sonos, Notifications, System actions (Soft Reset/Hard Reset/Reload OAL); Hard Reset needs confirmation popup.
Climate popup triggered from Home page inside_temperature status tile tap (Q-H2 resolved hypothesis); uses tunet-climate-card + Bubble Card 3.2 chassis.
Tranche critical path: T019 (Bug A double-corner) → T020 (Home) → T021 (Living Room template) → T022 (Bedroom) → T024 (Climate popup + Sonos wiring) → T025/T026/T027 parallel → T028 (cleanup, LAST).
T021 (Living Room) is the canonical RoomSubview template; T022/T023 apply the template to other rooms.
CD11c (status_card info_only mode, defect E4) gates Info page top section but is not blocking — home_summary mode is an acceptable substitute.
Migration strategy: /tunet-overview remains primary daily landing during build-up; cutover when /tunet-home reaches parity; cruft dashboards kept as reference examples until ALL composition work done (T028 last).
Sonos now-playing popup already designed in lab at /sonos-popups; production wiring is the remaining work.
Rooms tile interaction locked: tap = toggle lights, hold 400ms = navigate to room subview.
Q-NAMING open: parent dashboard URL — keep /tunet-home or rename to /overall-home.
Q-LR3 open: whether script.oal_global_manual_brighter/dimmer accept room-scoped lights: param; script.oal_room_reset existence unconfirmed.
plotly-graph-card is already a Lovelace resource per memory.

**11984** 9:40p 🔵 **Script and Entity Inventory Confirmed: OAL Scripts, Alarm Entities, and Light Entities Verified**
script.oal_global_manual_brighter and script.oal_global_manual_dimmer confirmed in packages/oal_lighting_control_package.yaml (lines 6721, 6741).
script.oal_reset_soft confirmed in packages/oal_lighting_control_package.yaml (line 6803); also called from script.oal_reset_global (line 7119).
script.oal_reset_room (parameterized room reset, line 7155) confirmed — replaces hardcoded oal_reset_living_room; accepts room parameter; this is the script needed for per-room OAL Reset actions (resolves Q-LR3).
script.disable_tomorrows_sonos_alarms confirmed in packages/sonos_package.yaml (line 1819); is whole-house and uses input_text.sonos_alarms_disabled_for_tomorrow (line 1851).
switch.sonos_alarm_bedroom (alarm_id=42, 05:30 WEEKDAYS) and switch.sonos_alarm_bedroom_weekend (alarm_id=155) confirmed in sonos_package.yaml.
Living room per-light entities confirmed: light.living_room_couch_lamp, light.living_room_floor_lamp, light.living_room_spot_lights, light.living_room_credenza_light, light.living_room_corner_accent.
light.column_lights confirmed as the columns group entity.
light.office_desk_lamp found in lab YAML — one of the office lights, confirming an office entity exists.
Kitchen light entities confirmed: light.kitchen_main_lights, light.kitchen_island_pendants, light.kitchen_counter_cabinet_underlights (3 zones as expected).
media_player.office is intentionally absent in sonos_package.yaml (comment at line 770) — no office speaker configured yet.
climate.dining_room is the primary thermostat entity for the living/dining zone.
sensor.dining_room_temperature and sensor.dining_room_humidity are the sensor entities for the living/dining room.

**11985** " 🔵 **status_card info_only and room_row Modes Are Already Implemented (Plan Had Stale CD11c "Unbuilt" Status)**
tunet_status_card.js contains info_only and room_row as named layout variants at lines 41-60 with full CSS, render logic, and grid options.
cards_reference.md explicitly states "CD11 now has six landed status roles: home_summary, home_detail, room_row, info_only, alarms, and custom. Historical CD11a language about later modes being pending is superseded as of 2026-05-05."
The architecture plan at /home/mac/.claude/plans/tunet-page-architecture.md incorrectly marks CD11c (info_only mode) as "unbuilt — gating defect E4" — this is stale.
info_only mode is passive by default; tiles only become interactive when author explicitly provides tap_action, navigate_path, or action_entity.
room_row mobile behavior: at viewport ≤767px, horizontal scroll layout wraps to vertical-stack grid tiles (X3 v3.8.0 change).
T029 in the tranche plan (2 days to build CD11c) can be removed or deprioritized — the work is already done.
Info page top tiles can use info_only mode immediately without waiting for any prerequisite — the E4 gating defect is not a real blocker.

**11986** " 🔵 **Nav Architecture Updated: 6-Item Nav with "Rooms" Popup Added**
Nav now has 6 items: Home, Rooms (popup), Media, Inbox, Info, Settings — not 5 as in the initial plan read.
Q-N3 resolved: "Rooms" nav item opens a popup with 4-room grid; tap a room → dismiss + navigate.
Option B (reverse-dropdown anchored above bottom nav bar) is preferred over Option A (centered Bubble Card popup) for mobile-native feel.
The Rooms popup eliminates a 3-tap journey (nav→Home→grid→Bedroom) and replaces it with 2 taps (nav→Rooms popup→Bedroom).
Per-room subviews are accessible via TWO paths: (a) Home rooms grid hold-to-navigate, (b) nav Rooms popup → tap room.
tunet-rooms-card tile mode interaction confirmed in source: tap (<400ms) = toggle lights, hold (≥400ms) = navigate via hold_action or navigate_path.
tunet-nav-card _updateActive() uses startsWith() prefix matching; subview_paths trigger a "Rooms" active state on the nav.


Access 938k tokens of past work via get_observations([IDs]) or mem-search skill.
</claude-mem-context>