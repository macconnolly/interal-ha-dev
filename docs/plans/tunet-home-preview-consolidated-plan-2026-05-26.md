# Tunet Home Preview — Consolidated Dashboard Plan

**Created**: 2026-05-26 evening (America/Denver)
**Surface**: `/tunet-home-preview/home` (storage-mode dashboard)
**Source file**: `Dashboard/Tunet/tunet-home-preview-config.yaml`
**Authority**: this document is the single active plan for `tunet-home-preview`. It consolidates and supersedes the per-tranche rollup (`docs/plans/next-tranche-rollup-2026-05-26.md`) with verified live state. Per-tranche line-level plans (T8.1, N.1 etc.) remain as historical implementation references.

---

## 1. Problem Statement

By 2026-05-26 evening, three separate planning artifacts had accumulated for the `tunet-home-preview` surface:

- `docs/plans/next-tranche-rollup-2026-05-26.md` (M / N / S tranches)
- `docs/plans/N1-navbar-apple-glass-2026-05-26.md` (N.1 implementation plan)
- `docs/plans/popup-content-card-revisions-2026-05-24.md` (T8.1)

The rollup's status had drifted from reality: per the live empirical baseline below, several "OPEN" sub-tranches are already shipped. Without consolidation the next agent risks duplicating work — exactly the failure mode `feedback_empirical_baseline_before_fix.md` warns about. This plan documents the verified state, enumerates the genuinely-open work, names the deferred work, and gives the next session a clean kickoff.

**This plan is not a re-design.** The genesis interaction-model spec (`~/.claude/plans/glowing-mixing-crescent.md`) and the Q1-Q9 wireframe spec (`docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md`) remain the design authorities. This plan is the *execution* authority — what's done, what's open, in what order, with what dependencies.

---

## 2. Empirical Baseline — verified 2026-05-26 ~8:55pm MDT

Every "shipped" claim below is checked against the live system (HA MCP probes + file reads), not against memory or prior session deltas. Stale claims from the rollup are explicitly called out.

### 2.1 Surface state

- File: `Dashboard/Tunet/tunet-home-preview-config.yaml` (65,537 bytes, last touched 2026-05-26 17:03)
- Registry entry at `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs`: `production: true`, storage mode, url_path `tunet-home-preview`
- Latest preview commit on `main`: `e39ca0e` (N.1 navbar Apple Glass + popup polish + Media tab + Rooms popup fix + suite-wide nav)
- Recent preview-touching commits in order: `e39ca0e` → `cbc2faf` (T8.1 hotfix + M.1 closeout) → `e35d43e` (T8.1) → `bb7718a`/`17fb9d4` (T8/T9) → `e514933`/`59b5b2a`/`60fcfff`/`f1d6ee0` (T1.x layout)

### 2.2 Tranche ship status (verified, not memory-trusted)

> **Deploy verification** (2026-05-26 evening): cards-in-source ≠ cards-on-server is a real gap (per `feedback_empirical_baseline_before_fix.md`). Verified the server has the fixes via HA MCP `ha_config_list_dashboard_resources`: current Lovelace resource cache-buster for all v3 cards is `?v=build_20260526_221910Z` (deployed 2026-05-26 16:19 MDT). `_flushVolumeDebounce` was introduced in commit `b718980` (2026-05-23 01:05 MDT), so the May 26 deploy includes the fix → M.2 is live on the server. Package side: `Backups/tunet_stats_sensors_2026-05-26_20-50-00.yaml` confirms the sensor package was deployed at 8:50pm tonight; `binary_sensor.bedroom_sonos_healthy` live state = `on` → M.3 sensor side is live on the server.

| Tranche | Verified status | Evidence |
|---|---|---|
| **M.1** Sonos+Spotify transport routing | **WITHDRAWN** | Memory #12575 SUPERSEDED in commit `cbc2faf`; native skip works on Spotify Connect; routing AWAY from native was the actual defect (rollup premise empirically wrong) |
| **M.2** Volume slider debounce flush | **SHIPPED** | `tunet_media_card.js:1010-1075` has `_flushVolumeDebounce()` called from both `pointerup` and `pointercancel` handlers; inline comment confirms past-tense fix. Same pattern at `tunet_sonos_card.js:1183`. Rollup entry is stale. |
| **M.3** Bedroom Sonos silent-fire safety net | **PARTIAL** | `binary_sensor.bedroom_sonos_healthy` defined at `packages/tunet_stats_sensors.yaml:93`, currently reporting `on`. Alarm-card badge wiring + notification automation OPEN. |
| **N.1** Apple Glass + active-tab + Rooms popup + Media tab + 8-view nav | **SHIPPED** | Commit `e39ca0e`; preview yaml lines 83-150 contain `backdrop-filter: blur(33px) saturate(180%)`, top-edge highlight, drop shadow, amber underline at `.route.active::after` |
| **N.2** Conditional media widget | **SHIPPED (merged into N.1)** | Implemented as CSS `@media (max-width: 767px) { .media-player { display: none } }` in N.1 commit. No separate Jinja path needed. |
| **N.3** Nav flow improvements | **PRIMARY CLOSED in N.1** | Rooms popup submenu fix shipped (missing `tap_action: open-popup`). Active-tab indicator shipped. Secondary friction OPEN (Mac to articulate). |
| **S.1** Sensor package (originally planned 19, shipped 36+) | **SHIPPED** | Commit `c8c2ac0`; live probes confirm: `sensor.outside_temperature` = 61.0°F, `sensor.living_room_lights_yesterday` = 0.0 kWh, `sensor.hvac_cycle_count_today` = 19, all 4 sampled OAL zone status sensors = "adaptive". Naming: heating/cooling _yesterday sensors are `_yesterday_hours` suffix (not `_yesterday` as listed in stale rollup). |
| **S.2** OAL zone status hybrid + HVAC energy + lights_on polish | **SHIPPED + RESTART COMPLETE** | Commit `1a8a689`; live probe confirms `sensor.hvac_estimated_energy_today` = 23.05 kWh AND `sensor.hvac_estimated_energy_daily` = 0.47 kWh (utility_meter status: collecting, last_reset 2026-05-27T01:56Z). **Handoff's "pending HA restart" is stale — restart completed; utility_meter live.** |
| **STATS.1** (was rollup S.2 → renamed) Stats page composition | **OPEN, BLOCKED on L1** | No stats view exists at `/tunet-home-preview/stats` per surface scan |
| **ADAPTIVE.1** (was rollup S.3 → renamed) Adaptive page composition | **OPEN, BLOCKED on L1** | No adaptive view exists |
| **ADAPTIVE.2** (was rollup S.4 → renamed) Adaptive nav route exposure | **OPEN, depends on ADAPTIVE.1** | — |
| **L1** Light entity management architecture | **PLANNING** | Backlog + kickoff prompt shipped 2026-05-26 in commit `d7ce088`; awaits Mac decision on Q1-Q5 + A/B/C/D scope option |

### 2.3 Genesis spec (`~/.claude/plans/glowing-mixing-crescent.md`) — R1-R7 resolution status

| Rec | Topic | Status |
|---|---|---|
| **R1** | Apple-style tap-vs-long-press interaction contract | LOCKED (rollup, wireframe §1, cards_reference) |
| **R2** | 3-mode scene cycle (Adaptive → Evening → Dim Ambient) | SHIPPED (commit `6caad51` backend + ZEN32 restricted; Evening per-zone values refined) |
| **R3** | Page taxonomy (Home/Rooms/Media/Stats/Adaptive) | PARTIAL — Home/Stats views exist; Media/Adaptive frames open; per-room subviews exist for 5 rooms |
| **R4** | Room tile interaction (row variant) | SHIPPED per cards_reference Interaction Model Contract |
| **R5** | Media — mini-player on Home + Media page | PARTIAL — mini-player concept shipped via N.1 conditional media widget in navbar; dedicated Media page deferred |
| **R6** | Stats page composition | DESIGN AUTHORITY only; execution = STATS.1 (blocked on L1) |
| **R7** | Adaptive Lighting Stats page | DESIGN AUTHORITY only; execution = ADAPTIVE.1 (blocked on L1) |

### 2.4 Wireframe spec (`docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md`) — Q1-Q9 status

Per wireframe §11 (Q1-Q9 lock state), most decisions remain open for explicit Mac confirmation. Resolution-by-implementation has occurred for some:

- **Q1.1** (scene cycle count): resolved by `6caad51` — 3 scenes locked
- **Q1.2** (Evening per-zone behavior): resolved by `6caad51` refinement
- **Q2-Q9**: design authority intact; concrete dashboard implementation has drifted from the wireframe via T0.x → T1.x → T8/T9 → N.1 evolution. **A retro-confirmation pass would be productive** (does the shipped preview match the wireframe intent, or has it forked?).

---

## 3. Active Open Tranches (verified-open, not memory-trusted)

### 3.1 **M.3 finish** — Bedroom Sonos health badge + notification automation (~30-45 min)

Sensor side done. Remaining:
- `tunet_alarm_card.js` — render a small unhealthy-state badge when `binary_sensor.bedroom_sonos_healthy` is `off`. Style consistent with existing `.next-badge` at line ~84 (offset placement so it doesn't collide with the alarm-row chrome).
- `packages/sonos_package.yaml` or `packages/automations.yaml` — automation: when `binary_sensor.bedroom_sonos_healthy` transitions `on → off` AND next alarm is within 8h (template against `sensor.tunet_inbox_pending_count` or the alarm-card's source-of-truth), fire `notify.tunet_inbox_all_devices` with subject "Bedroom Sonos offline — alarm at risk".

**Open decision** (Mac): notification threshold of 8h is a conservative default; tighter (4h) or always-notify are alternatives. Recommend 8h.

**Definition of Done**: physically simulate by disabling the Sonos integration entry briefly → confirm sensor flips off, badge appears in alarm-card, notification arrives on phone if next alarm < 8h.

### 3.2 **N.3.x** — Secondary nav friction (TBD effort, scope-blocked on Mac)

Primary friction (Rooms popup submenu + active-tab crispness) closed in N.1. Mac mentioned a "later separate scope" item: **unified per-room lights page** — EVERY light organized by room for granular control in one place. This is a substantial new dashboard surface that would either replace the lighting card on home view OR add a 5th nav tab "Lights." Belongs as its own future tranche, scoped after Tranche S lands.

Other potential N.3 items (need Mac to articulate or close):
- Active-tab indicator polish iteration (if N.1's amber underline isn't crisp enough in daily use)
- Nav animation speed / easing tuning
- Desktop rail vs mobile dock breakpoint friction (if any surfaces in use)

**Open decision** (Mac): is there any remaining navbar friction, or is N.3 effectively closed by N.1?

### 3.3 **STATS.1** — Stats page composition (2-4h) — **BLOCKED on L1**

Build `/tunet-home-preview/stats` view per wireframe §3 / glowing-mixing-crescent §9. Sections:
- HVAC today (heating/cooling minutes, cycles, current state) + bar chart
- Inside vs outside (line chart over 24h + delta)
- Electricity (per-circuit kWh + total, gated on hardware presence)
- Weekly comparison (heating/cooling deltas + 7-day mini chart)

**Open decision** (recommended after L1 lands): bespoke `tunet-stats-card` vs composition from mushroom-template-card + mini-graph-card + native sensor cards. Recommend composition path first.

**Why blocked on L1**: Stats consumers reference room-light groups (`light.all_living_room_lights` etc.) which have drift per L1 backlog. Wireframing the Stats page against drifted infrastructure means a re-render after L1 ships.

### 3.4 **ADAPTIVE.1** — Adaptive page composition (2-3h) — **BLOCKED on L1**

Build `/tunet-home-preview/adaptive` view per glowing-mixing-crescent §10. Sections:
- Mode timeline today (stacked bar of minutes per OAL mode)
- Active overrides list with reset button per override
- Zone baselines live (8 zones, brightness % bar)
- Environment summary (sun elevation, color temp avg, env boost)
- Learning log link

**Open decision** (after L1): mode timeline visualization — HA's native `history-graph` for input_select state is ugly; building a `tunet-oal-timeline-card` is more work but cleaner. Recommend native first.

**Why blocked on L1**: zone baselines reference per-zone light groups which are drifted.

### 3.5 **ADAPTIVE.2** — Adaptive navbar route exposure (~10 min) — depends on ADAPTIVE.1

Add Adaptive to navbar routes (currently Home / Rooms / Media / Stats / Settings; Adaptive missing). Trivial YAML once page exists.

### 3.6 **U.1** — Unified per-room lights page (TBD, future tranche)

Mac's stated friction (per next-tranche-rollup line 156): "a unified per-room lights page with EVERY light organized by room for granular control in one place." Substantial new dashboard surface. Owns its own line-level plan when scoped. Likely scoped AFTER L1 + ADAPTIVE.x land, since it shares the per-room-lights infrastructure.

---

## 4. Deferred Items Registry

Items not in any active tranche but tracked for future scope decisions. Each will be promoted to a tranche when a session takes it.

| ID | Item | Source | Notes |
|---|---|---|---|
| **D.1** | `light.office_bed_light_right` persistent manual-control flag | handoff.md / FIX_LEDGER S.1 deferred | Asymmetric (only right, not left); warm-pin automation interaction suspected. Currently `hs[22,100]` deep amber per live probe (sun-aware color window active). |
| **D.2** | 15 new room aggregates | handoff.md S.1e deferred | `<room>_brightness_avg_pct`, `<room>_color_temp_avg_k`, `<room>_any_manual_override`. Needs "graphable vs status" architecture decision first (same axis L1 will inform). |
| **D.3** | R4 CSS audit Tier 2 (tokenization in `tunet_base.js`, ~12h) | visual_defect_ledger δ-polish | Border-radius scale, font-size scale, gap/padding rhythm, shadow elevation tiers, color palette consolidation. Tier 1 shipped `0401c09`. |
| **D.4** | R4 CSS audit Tier 3 (~3-4h cosmetic) | visual_defect_ledger δ-polish | Per-card micro-spacing, hover/focus harmonization, dark-mode contrast sweep. Depends on D.3 token foundation. |
| **D.5** | Stale dashboard file inspection (3 Feb-2026 files) | handoff.md | `Dashboard/living_room_card_v3.yaml`, `Dashboard/living_room_popup_v4.yaml`, `Dashboard/split_hero.yaml`. Mac wants to inspect before deletion. |
| **D.6** | HVAC condenser nameplate reading | handoff.md | Refines `cooling_kw=3.5` placeholder used in `hvac_estimated_energy_today`. Requires roof access. |
| **D.7** | T8.1 alarm-card row hold/tap state hardening | visual_defect_ledger PA04 / SA-series | `_pendingEntity` race when sliding across rows; optimistic "All On" hardcoded to 4 alarms; lifecycle defense for early `hass` calls before `setConfig` |
| **D.8** | tunet-inbox-card async teardown race | visual_defect_ledger TI2/TI6 | `_dataReady` set before subscription resolves; rapid double-click duplicate `respond` calls; `iconForAction` alias-vs-MDI key mismatch |
| **D.9** | Cosmos parallel surface sync (where applicable) | cross-surface | Cosmos and preview are parallel `production:true` per Mac 2026-05-26. Some preview polish (N.1 navbar styling) may merit porting to cosmos and vice versa. Out of scope here unless explicitly added. |
| **D.10** | pico_link physical-button verification | FIX_LEDGER (this session) | Operator-only — Lutron Office Pico → `light.office_lights` wiring shipped `2448c51`; needs physical button press to confirm event flow. |

---

## 5. Dependencies + Blockers

```
L1 (planning) ──blocks──▶ STATS.1 + ADAPTIVE.1
                              │
                              └──▶ ADAPTIVE.2 + U.1 (eventually)

D.2 (15 aggregates) ───┐
D.3 (R4 Tier 2 tokens) ┴─ inform but don't block ─▶ STATS.1 + ADAPTIVE.1 polish layer

M.3 finish ──independent── (no upstream blockers)
N.3.x (if any) ──independent── (no upstream blockers)
D.1 (office_bed_right) ──independent── investigation surface

All UI tranches depend on: production-mirror capture pipeline working
(`npm run tunet:review:production`), HA available at 10.0.0.21:8123,
Bubble Card 3.2.1 installed.
```

**Hard blockers**:
- L1 architecture decision (Mac picks A/B/C/D scope option) blocks STATS.1 + ADAPTIVE.1
- ADAPTIVE.1 must land before ADAPTIVE.2

**Soft inputs** (improve quality but don't block):
- D.2 (room aggregates) would simplify STATS.1 + ADAPTIVE.1 composition
- D.3 (R4 token scale) would harmonize STATS.1 + ADAPTIVE.1 visual rhythm with the rest of the suite

---

## 6. Recommended Execution Sequencing

Two viable paths depending on Mac's preference for daily-impact-per-hour vs structural-foundation-first:

### Path A — Daily-impact-first (recommended if Mac wants visible wins this week)

1. **M.3 finish** (~30-45 min) — alarm safety net for bedroom Sonos; shippable in one sitting, no dependencies
2. **N.3.x clarification** (Mac articulation needed) — close out remaining nav friction OR explicitly mark N.3 closed
3. **L1 planning session** (per existing kickoff prompt) — unblocks STATS.1 + ADAPTIVE.1 + U.1
4. **L1 execution** (per L1 plan when stamped)
5. **STATS.1** (2-4h, after L1 ships)
6. **ADAPTIVE.1** (2-3h, parallel-safe with STATS.1)
7. **ADAPTIVE.2** (~10 min, after ADAPTIVE.1)
8. **U.1 scoping** — Mac stamp on intent (replace lighting-card vs add 5th nav tab); then line-level plan

### Path B — L1-first (recommended if Mac wants structural foundation before more UI work)

1. **L1 planning session** (per existing kickoff prompt)
2. **L1 execution**
3. **M.3 finish** (parallel-safe anytime — pull forward into L1 if convenient)
4. **STATS.1** + **ADAPTIVE.1** + **ADAPTIVE.2** (in sequence post-L1)
5. **N.3.x** + **U.1** + deferred D.x items as opportunity allows

**Path A is the default recommendation** because (a) M.3 is a 30-45min single-sitting win with zero blockers, (b) L1 needs Mac's architectural decision regardless of sequencing, and (c) N.3 clarification is a Mac-articulation gate that's faster to resolve at this end of the session.

---

## 7. Definition of Done — per tranche

| Tranche | DoD evidence (concrete, testable) |
|---|---|
| **M.3 finish** | (a) Live capture of alarm-card showing unhealthy badge when `binary_sensor.bedroom_sonos_healthy` is `off`. (b) Notification fires to `notify.tunet_inbox_all_devices` when sensor transitions on→off and next alarm < 8h, verified by Mac receiving on phone. (c) M1 production-mirror capture confirms badge rendering does not break alarm-card layout at 390×844 or 1440×900. |
| **N.3.x close** | Either Mac articulates a specific friction → a line-level plan is written and gates resolved by capture, OR Mac confirms "N.3 effectively closed by N.1" → the tranche is marked closed in this plan + visual_defect_ledger. |
| **STATS.1** | (a) View accessible at `/tunet-home-preview/stats`. (b) All four sections render with live sensor data at 390×844 + 1024×1366 + 1440×900. (c) Mac M1 stamp. |
| **ADAPTIVE.1** | (a) View accessible at `/tunet-home-preview/adaptive`. (b) All five sections render with live OAL data at 3 breakpoints. (c) Mac M1 stamp. |
| **ADAPTIVE.2** | Tap Adaptive in navbar from Home → navigates to `/tunet-home-preview/adaptive`. Active-tab indicator highlights correctly. |
| **U.1** | TBD when scoped — will follow standard breakpoint capture + Mac stamp |

All tranches: M1-M7 contract per CLAUDE.md "Pre-Commit User-Perspective Review (Non-Negotiable)" applies — production-mirror capture, screenshots-read-back-into-context, defect inventory, "would Mac be happy" answer, no banned completion phrases, no autonomous "done" marking.

---

## 7.5. Architectural Principle — Parameterized Reuse Over Duplication (Mac directive 2026-05-26)

Established 2026-05-26 evening after I proposed 12-16 raw scripts for U.1 G10 (per-room/per-scene scripts). Mac flagged: *"if we have a repeatable use case we would want one script that takes parameters that will accomplish what we're trying to do."*

**Rule**: when N instances of a similar pattern are about to ship, design for ONE parameterized primitive + N thin invocations. See `~/.claude/projects/-home-mac-HA-implementation-10/memory/feedback_parameterized_reuse.md` for the durable rule.

**Applied to U.1/U.2/U.3**:
- **U.1 §G10**: 1 parameterized `script.tunet_apply_room_scene` + scene registry (NOT 12-16 per-room scripts)
- **U.1 §G1-G5**: popup chips call shared script with scene_id param (NOT chip-specific scripts)
- **U.2 §2.2**: 1 templated `#light-detail` Bubble popup with entity_id variable (NOT N per-light popups)
- **U.3 §3.1**: decluttering-card OR YAML anchor OR code-generation for per-room sections (NOT 5 hand-duplicated room blocks)
- **U.3 room registry**: SINGLE source of truth for rooms list consumed by rooms-card + popups + subviews + Lights page

**L1 alignment**: L1 Option B+ (areas + labels as registry-driven groups) is the same principle applied to room-group membership. Reinforces L1 over manual cleanup options.

**When to break the rule**: instances diverge in important ways that aren't expressible as parameters; templating layer doesn't support the needed variable; debug cost of templating > duplication cost. Surface the divergence explicitly rather than silently shipping copies.

---

## 8. What This Plan Does NOT Solve

Listed explicitly to prevent scope creep AND to surface known-unaddressed-edges to future agents:

- **Cosmos parallel surface** — cosmos has its own R4 Tier 2/3 CSS backlog, pico_link, theme experiments. This plan does not address cosmos.
- **OAL backend work** — Campaign B (column_accent into column_lights AL) and Campaign C (dashboards + docs + e2e) per `~/.claude/plans/office-corner-accent-relocation.md` remain separate workstreams.
- **HVAC backend** — `docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md` and `docs/plans/hvac-oal-execution-handoff-prompt-2026-05-23.md` are separate.
- **Tunet-overview cutover** — the production cutover from `/tunet-overview` to `/tunet-home-preview` is NOT in this plan. That happens (if/when Mac chooses) after STATS.1 + ADAPTIVE.1 land and parallel-run validates.
- **Per-card runtime defects in cards used outside preview** — visual_defect_ledger CD5/CD6/CD10/CD11 entries remain in their owning tranches.
- **L1 implementation** — L1 has its own plan + kickoff. This plan respects L1 as a dependency; it does not duplicate L1 scope.
- **Wireframe Q2-Q9 retro-confirmation** — if Mac wants to lock the wireframe decisions explicitly (vs accepting current shipped preview as the implicit resolution), that's a separate planning pass.

---

## 9. Adversarial Review Hooks

Each tranche must pass an adversarial review pass before implementation (per T8.1 pattern). Suggested adversarial questions:

**For M.3 finish**:
- Does the notification fire on EVERY on→off transition, or with a debounce? If debounce isn't applied, alarm-card transient unavailability (e.g., HA restart) could spam Mac's phone.
- Is the "next alarm within 8h" template robust against an empty alarm list? Or a corrupt alarm state?
- Does the badge render on landscape (PA04 lifecycle quirk territory)?

**For STATS.1 / ADAPTIVE.1**:
- Do the chosen mini-graph-card / native sensor cards render gracefully when a sensor is `unavailable` (e.g., during HA restart, integration drop)?
- Is `recorder` retention long enough for the 7-day / 24h windows? Check the retention setting.
- Does the page composition assume L1's new room-group naming is in effect? If so, gate the tranche on L1 actually shipping (not just stamped).

**For U.1 (when scoped)**:
- Does it scale to N+5 lights per room without overflowing 390×844?
- Does it preserve existing per-light Bubble popup affordances?
- Is the gesture model consistent with the rest of the suite (per cards_reference Interaction Model Contract)?

---

## 10. Rollback Strategy

This plan ships no code by itself — it is a doc-only deliverable. Rollback of the doc = revert the commit creating it.

For each tranche when executed:
- **M.3 finish**: Revert the alarm-card commit + remove the automation block. Sensor side stays (already shipped + valuable independent of badge).
- **STATS.1 / ADAPTIVE.1**: Revert the view block from the dashboard yaml. Sensors stay.
- **ADAPTIVE.2**: Revert the navbar route addition.
- **U.1**: TBD when scoped.

Each tranche should ship in its own commit so rollback is per-tranche.

---

## 11. Open Decisions for Mac

Tagged **BLOCKING** (must resolve before the named tranche can start) or **INFORMATIONAL** (resolve when convenient; doesn't block execution).

**BLOCKING — resolve before next tranche starts**:

1. **N.3 status** — explicitly close, OR articulate remaining friction. Without this, the tranche sits in limbo. *Blocks: N.3.x.*
2. **M.3 notification threshold** — recommend 8h, alternatives 4h / always. *Blocks: M.3 finish.*
3. **Execution path** — Path A (daily-impact-first, M.3 then L1) vs Path B (L1-first). Default recommendation: Path A. *Blocks: which tranche the next session starts.*

**BLOCKING — resolve before specific later tranches**:

4. **STATS.1 / ADAPTIVE.1 implementation style** — bespoke card vs composition. Recommend composition first. *Blocks: STATS.1 + ADAPTIVE.1 implementation phase (not their planning).*
5. **ADAPTIVE.1 timeline viz** — native history-graph vs custom `tunet-oal-timeline-card`. Recommend native first. *Blocks: ADAPTIVE.1 implementation phase.*
6. **U.1 scope** — replaces lighting-card on Home, OR adds 5th nav tab "Lights". Mac vision needed. *Blocks: U.1 line-level planning.*

**INFORMATIONAL — long-term governance, resolve when convenient**:

7. **Wireframe retro-confirmation** — yes/no on a separate pass to lock Q2-Q9 vs accepting shipped preview as implicit resolution. *Doesn't block execution; affects design-authority hygiene.*
8. **Rollup retirement** — should `docs/plans/next-tranche-rollup-2026-05-26.md` be marked "superseded by this consolidated plan" at its head? Per Mac's earlier choice to leave both plans intact, default = no, but worth re-asking now that this plan exists. *Doesn't block; affects future-agent confusion risk.*
9. **Cosmos vs preview disposition** (forward-looking) — both parallel `production: true` per Mac 2026-05-26. Continue parallel indefinitely, OR pick one as production-target and retire the other? *Not urgent; major decision when the time comes.*

---

## Appendix A — Provenance + Reading Order for Future Agents

Read in this order to load context efficiently:

1. **Memory frame** — `~/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md` + `session_arc_popup_b_to_frame.md`
2. **Project contract** — `/home/mac/HA/implementation_10/CLAUDE.md` (M1-M7 review block, Working Relationship Frame)
3. **Genesis interaction-model spec** — `~/.claude/plans/glowing-mixing-crescent.md` §1-§7 (R1-R7 recommendations); skim Apple HIG sources for grounding
4. **Q1-Q9 wireframe spec** — `docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md` §§1-7
5. **THIS PLAN** — `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md` (you are here)
6. **L1 dependency** — `docs/plans/L1-light-entity-management-architecture-plan-2026-05-26.md` (read if picking up any L1-blocked tranche)
7. **Implementation references** (historical, read only if continuing the named tranche):
   - `docs/plans/N1-navbar-apple-glass-2026-05-26.md` (N.1 implementation closeout)
   - `docs/plans/popup-content-card-revisions-2026-05-24.md` (T8.1 implementation)
   - `docs/plans/navbar-card-popup-sizing-2026-05-23.md` (T8/T9 implementation)
   - `docs/plans/next-tranche-rollup-2026-05-26.md` (rollup — superseded by this plan but retained for traceability)
8. **Surface state** — `Dashboard/Tunet/tunet-home-preview-config.yaml`; live at `http://10.0.0.21:8123/tunet-home-preview/home`
9. **Defect ledger** — `Dashboard/Tunet/Docs/visual_defect_ledger.md` for tranche-owned backlog including the R4 CSS Tier 2/3 entries

---

## Appendix B — Live-state probe results (2026-05-26 ~8:55pm MDT)

For traceability of the empirical baseline claims in §2.2. All values via HA MCP `ha_get_states` against `http://10.0.0.21:8123`.

| Entity | State | Notes |
|---|---|---|
| `sensor.outside_temperature` | 61.0 °F | S.1 shipped |
| `sensor.hvac_estimated_energy_today` | 23.05 kWh | S.1 shipped (state_class measurement, device_class energy) |
| `sensor.hvac_estimated_energy_daily` | 0.47 kWh | S.2 utility_meter LIVE (last_reset 2026-05-27T01:56Z; status collecting) — **handoff "pending HA restart" is stale** |
| `sensor.living_room_lights_yesterday` | 0.0 kWh | S.1 shipped |
| `sensor.master_lights_yesterday` | 0.2 kWh | S.1 shipped |
| `sensor.hvac_cycle_count_today` | 19 | S.1 shipped |
| `sensor.oal_main_living_status` | adaptive | S.2 enum status shipped |
| `sensor.oal_kitchen_island_status` | adaptive | S.2 |
| `sensor.oal_bedroom_primary_status` | adaptive | S.2 |
| `sensor.oal_office_status` | adaptive | S.2 |
| `binary_sensor.bedroom_sonos_healthy` | on | M.3 sensor side SHIPPED (`packages/tunet_stats_sensors.yaml:93`) |
| `media_player.bedroom` | paused (Spotify) | M.3 target — currently available |
| `media_player.living_room` | playing TV source | normal state |
| `light.office_bed_light_right` | on, hs[22,100], rgb[255,94,0] | D.1 target — sun-aware deep-amber window active |
| `sensor.hvac_heating_yesterday` | NOT FOUND | shipped name is `hvac_heating_yesterday_hours` per `packages/tunet_stats_sensors.yaml:141` — stale rollup naming |
| `sensor.hvac_cooling_yesterday` | NOT FOUND | shipped name is `hvac_cooling_yesterday_hours` per line 151 |
| `sensor.oal_office_bed_status_v13` | NOT FOUND | intentionally not created per "office_bed fused with office" direction in S.2 |
| `binary_sensor.tunet_any_media_playing` | NOT FOUND | N.2 used a CSS `@media` approach instead; this sensor was never needed |
