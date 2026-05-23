# Tunet Portfolio Roadmap — 2026-05-23

**Goal** (Mac, 2026-05-23): fix all visual + UX defects; plan a net-new storage-mode dashboard; design down to the interaction layer; fix global per-room sensors; add graphable sensors for HVAC; enhance OAL sensors; add a new OAL "slightly dimmer" mode; auto-off entry main spots; lower kitchen counter night bound; redesign ZEN32 to toggle through the 3 scenes Mac actually uses; expose scenes via HomeKit; fix HomeKit visibility sensors; fix room organization; overall cleanup.

This is a **portfolio of 6 plans**. Each plan is self-contained and can be executed independently or in sequence. This roadmap orchestrates the dependencies and sequencing.

## Discovery findings that shape the portfolio

(Full discovery reports compiled 2026-05-23 by 5 parallel Explore subagents — preserved inline at the bottom of each individual plan file.)

**Surprises:**
1. **Production target is `panel`-mode not sections-mode**. Current `/tunet-overview/overview` uses a single `vertical-stack` with 8 cards. The new dashboard plan must decide: stay panel (proven), move to sections (architectural correctness per AGENTS.md §7B), or hybrid.
2. **Bubble Card on server is 3.1.1, not 3.2.1**. The 3.2.x line ships standalone popup cards + new modes (`fit-content` aka Adaptive, dialog, adaptive-dialog) + bottom-offset (3.2.1-new, relevant for Tunet's persistent nav). **Upgrade is a prerequisite for any popup work the new dashboard plan depends on.**
3. **HomeKit is NOT currently configured** in HA. No `homekit:` block in `configuration.yaml`. Mac's "fix visibility sensors passed to HomeKit" presupposes the integration exists — it doesn't yet. The plan creates it from scratch.
4. **"Entry main spot lights" cannot be uniquely identified** by entity_id. Closest candidates: `light.entryway_lamp` (entryway area has 0 assigned entities), `light.living_room_spot_lights` / `light.dining_room_spot_lights` (under `light.accent_spots_lights` group). Pending Mac clarification.
5. **Entryway is a ghost area** — exists in registry, has 0 entities assigned. Likely related to (4).
6. **Living Room temp/humidity sensors return state=unknown** (dead device). Bedroom TV sensors also unknown. Affects what a graph dashboard can render.
7. **No HVAC equipment sensors** — only `climate.dining_room` thermostat + one template helper. No compressor run-time, no energy. A graphable HVAC dashboard needs new sensors (template or equipment-side).
8. **`synthetic-dazzling-oasis.md` (active CD11 detailed plan per governance) does NOT exist on filesystem.** Either Mac has it elsewhere or it needs reconstruction.
9. **Bug A (double-corner outline) IS resolved in working-tree** but the resolution comment in `tunet_base.js:1100-1133` may not yet be committed. Verify in Plan A.
10. **`/tunet-home` exists** as a single-view storage dashboard (scaffolded earlier). Naming TBD: keep `tunet-overview` as production, OR cut over to `tunet-home` per the architecture sub-plan. **User-owned decision.**

**Locked decisions that constrain the portfolio:**
- Rooms tile: tap = toggle, hold (400ms) = navigate to dedicated subview (corpus #11178, #11192) — Mac's prompt says "tap → open rooms popup" which seems to REVERSE this. **Pending clarification: revert to popups OR keep subviews and add a popup-from-hold instead?** Plan F addresses.
- All custom Tunet cards KEPT (Mar 5 2026 lock, no hybrid pivot).
- Bubble Card 3.2-beta.1 supersedes Browser Mod for in-card composition popups (2026-05-04). 3.2.1 is the current release.
- Visual hierarchy 4-layer model: chrome / scaffold / tile internals / atoms.
- iPhone 390×844 is the design target; tablet/desktop responsive after.
- Validation breakpoints locked: 390×844, 768×1024, 1024×1366, 1440×900.

## Portfolio inventory

| # | Plan | File | Goal | Depends on | Effort |
|---|------|------|------|-----------|--------|
| A | Foundation cleanup | `tunet-foundation-cleanup-2026-05-23.md` | Bubble Card 3.2.1 server upgrade; area registry cleanup; dead sensor triage; entity ID clarifications | none | ~2-3 hrs |
| B | Backend additions (sensors + automations) | `tunet-backend-additions-2026-05-23.md` | Per-room sensor parity; HVAC equipment + template sensors; OAL "slightly dimmer" mode; kitchen counter night bound; entry main spot auto-off; OAL sensor enhancement | A (entity IDs confirmed) | ~4-6 hrs |
| C | ZEN32 redesign | `tunet-zen32-redesign-2026-05-23.md` | Simplify ZEN32 to cycle through the 3 actually-used scenes; LED state machine update | B (new OAL mode lands first) | ~2-3 hrs |
| D | HomeKit integration | `tunet-homekit-integration-2026-05-23.md` | Create `homekit:` block from scratch; expose curated entity list including new scenes from C; fix visibility sensor types | C (scenes exist) | ~2-3 hrs |
| E | Tunet card hardening | `tunet-backlog-closure-2026-05-23.md` (ALREADY EXISTS, 11 phases) | Close all visual_defect_ledger lines 78-124 + weather production defects | none — parallel-safe | ~9-13 hrs |
| F | New production dashboard | `tunet-new-dashboard-2026-05-23.md` | Net-new storage-mode dashboard with Bubble Card 3.2.1 popups; per-card tap/hold/long-press contract; rooms popup composition; media popup composition; sensor surfaces with graphing | A (Bubble 3.2.1); B (sensors); C (scenes); D (HomeKit if exposing scenes); E (cards hardened) | ~12-20 hrs |

**Total estimated effort**: 31-48 hours of focused execution plus Mac's review gates between phases. Spread over multiple sittings (weeks, not days).

## Recommended sequencing

**Sequential dependencies** (must be in order):
1. **A → B**: backend additions need confirmed entity IDs (entry main spots) + the area cleanup landing surface.
2. **B → C**: ZEN32 must know about the new OAL mode before redesigning the cycle.
3. **B → D**: HomeKit exposure curates entities created in B.
4. **A + B + C + D + E → F**: the new dashboard depends on Bubble Card upgrade (A), sensor population (B), scene cycle (C), HomeKit (D if exposing scenes), and stable cards (E).

**Parallel-safe** (can run anytime):
- **E (card hardening)** runs in parallel to A-D. Production-mirror captures during E require A's Bubble Card 3.2.1 upgrade ONLY IF E touches popup-using cards (media/sonos for the future Bubble popups).

**Critical-path optimization**:
1. **Week 1**: A in parallel with starting E.
2. **Week 2**: B + continuation of E.
3. **Week 3**: C + D + finishing E.
4. **Week 4-5**: F (the largest plan).

## Cross-portfolio governance contract

Every plan in this portfolio respects:
- **M1-M7 contract** (`/home/mac/HA/implementation_10/CLAUDE.md`). Production-mirror capture required for `production: true` dashboards. HA push notify via `notify.tunet_inbox_all_devices` for iterative review. Capitulation guard: when Mac flags a defect, next response asks WHAT SPECIFICALLY.
- **Scoped-vs-root principle**: scoped contract owns mechanical details, root carries one-line session-delta narrative.
- **Architecture-first rule**: page-level structural planning takes precedence; this portfolio's Plan F is the architecture work, gated on A-E completion.
- **Production target**: `/tunet-overview/overview` (storage-mode, backed up at `Dashboard/Tunet/tunet-overview-storage-config.yaml`). Plan F decides whether to cut over to `/tunet-home` or stay on `tunet-overview`.

## User-owned decisions pending before plans start

1. **"Entry main spot" entity identification**: which exact entity does Mac mean? Options: `light.entryway_lamp`, `light.living_room_spot_lights`, `light.dining_room_spot_lights`, or `light.accent_spots_lights` group. Required for Plan B's auto-off automation.
2. **"Slightly dimmer" mode definition**: is this (a) a new preset between Adaptive and Dim Ambient with kitchen+entry off, OR (b) reuse Dim Ambient + script to force kitchen+entry off, OR (c) something else? Required for Plan B's OAL mode addition.
3. **Rooms card interaction**: Mac said "tap → open rooms popup" which reverses the 2026-05-04 lock (tap = toggle, hold = subview). Confirm:
   - (a) Revert to tap = popup, hold = subview
   - (b) Keep tap = toggle, hold = popup (new), and remove subview
   - (c) Keep tap = toggle, hold = subview, ADD a 3rd affordance (e.g. tap on a chevron icon) for popup
4. **`tunet-overview` vs `tunet-home` URL**: Plan F builds a new dashboard. Cut over to `/tunet-home`? Keep `/tunet-overview`? Parallel-run both? Required for Plan F's deploy target.
5. **HomeKit bridge identity**: in Plan D, create a single HomeKit bridge that exposes Mac's curated list OR multiple bridges (e.g. lights bridge, climate bridge, scenes bridge)? Affects HomeKit pairing UX.
6. **HVAC sensor strategy** (Plan B): create template sensors derived from `climate.dining_room` state changes (cycle time, time-in-heat, time-in-cool), OR add a power/energy clamp to the equipment? Software-only is cheaper but limited; hardware unlocks real metering.

## Invocation pattern

Each plan can be executed via:

```bash
/claude-mem:do ~/.claude/plans/tunet-<plan-name>-2026-05-23.md
```

Each plan is phased internally; phases gate on Mac's review (M3) before the next phase starts.

This roadmap file itself is NOT executable — it's the orchestration overview.

## Out of scope for this entire portfolio

- **CD12 surface composition** (Living Room page, popup, Overview composition per `~/.claude/plans/flickering-herding-wolf.md`) — separate tranche, gated on the architecture-first sub-plan.
- **OAL unified timer notification debugging** (`automation.oal_v14_unified_timer_notification`) — separate OAL package work.
- **Away Mode feature** (Issue #3, archive at `Backups/away_mode_implementation_plan.md`) — separate planned feature.
- **PA01 Bug A** (double-corner outlines) — already resolved per Plan E Phase 1 verification.
- **Existing TINBOX-* backend hardening rows** — covered by `custom_components/tunet_inbox/Docs/execution_ledger.md`.
- **Bedroom Sonos Play:3 silent-fire pattern** (memory entry `project_bedroom_sonos_alarm_silent_fire_pattern.md`) — known device issue, separate.
- **Notification response page** (CD12 implementation backlog) — separate tranche.

## Memory entries to read for full context

(From `/home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/`)
- `reference_tunet_dashboard_inventory.md` — production URL + registry pattern
- `feedback_pre_commit_review_block.md` — M1-M7 (updated 2026-05-22)
- `session_arc_popup_b_to_frame.md` — WHY behind M-rules
- `feedback_architecture_first.md` — page-level precedence rule
- `feedback_consistency_driver.md` — shared passes before bespoke work
- `reference_ha_deploy_scripts.md` — 4 governed deploy paths
- `tunet_dashboard_architecture.md` — broader research findings
- `feedback_pivot_signal.md` — Mac welcomes "I'm uncertain" signals; will pivot rather than penalize

## Notes for future agents picking up this portfolio cold

1. **Read this roadmap first**, then the specific plan file you're executing.
2. **Mac holds the done stamp** (M3). Report "Phase N implemented, awaiting your review." Never autonomously mark complete.
3. **Production-mirror capture is mandatory** for any change affecting cards in production-flagged dashboards. The current production-flagged entry is `tunet-overview` (storage-mode at `/tunet-overview/overview`). Use `npm run tunet:review:share` to trigger HA push notify; Mac taps the deep-link to grade.
4. **The capitulation guard from M1 applies**: when Mac flags a defect, ASK WHAT SPECIFICALLY (typography/spacing/color/semantics/density/touch-target/truncation/alignment). Never apologize or re-capture blindly.
5. **One open tranche at a time** per `Dashboard/Tunet/AGENTS.md` §4. Even when plans are parallel-safe in this roadmap, in execution keep ONE active until its phase gate clears.
