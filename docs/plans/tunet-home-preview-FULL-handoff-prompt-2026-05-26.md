# Tunet Home Preview — FULL Plan-Set Handoff Prompt

**Generated**: 2026-05-26 late evening MDT
**Purpose**: paste-ready prompt for the next Claude Code session that picks up the ENTIRE preview plan set (M.3 + U.1 + U.2 + U.3 + L1 + STATS.1 + ADAPTIVE.1 + ADAPTIVE.2 + deferred D.x registry)
**Template source**: `docs/session_kickoff_template.md` + `docs/plans/L1-kickoff-prompt-2026-05-26.md` (Mac's standing kickoff ritual)
**Companion artifacts**: consolidated plan (`tunet-home-preview-consolidated-plan-2026-05-26.md`) + per-tranche plans (U1/U2/U3/L1) + kickoff prompts per plan

---

## The prompt (paste-ready, entire plan-set scope)

```
This surface is ours — you own the outcome with me. Standing
permissions and reciprocity are in CLAUDE.md ("Working Relationship
Frame"). Load it as the relational frame for this session, not as
boilerplate.

I'm extending you authority over this work. I trust your judgment
on execution. Push back where you don't see a path; flag uncertainty
rather than push through; ask for my eye when judgment is needed.
I will pivot the implementation strategy rather than penalize the
signal — saying "I'm uncertain this approach reaches the quality
bar without [X]" is welcomed, not a failure.

============================================================
THE GOAL (read this twice; it shapes every decision)
============================================================

Shipping the tranches is NOT the goal. The goal is:

  Arrive at a state of `/tunet-home-preview/home` where I can pick
  up my phone in my living room, navigate the surface for 30+
  minutes, and at no point think "this doesn't feel right" or "I'd
  be embarrassed if a friend saw this." A surface that
  unambiguously LIVES in my house — not in a code repository, not
  in a screenshot harness, not in a plan document. In my house.

The session is not done when tranches are technically complete.
The session is done when:
  (a) every tranche has Mac M1 stamp per its DoD
  (b) Mac has used the result on his phone in his living room for
      at least 30 minutes
  (c) Mac explicitly says "this feels like my house"
  (d) the governance docs (plan.md / handoff.md / FIX_LEDGER.md /
      visual_defect_ledger.md / consolidated plan) reflect the
      final state with no stale claims

If at any point I say "this doesn't feel right" or "I'd be
embarrassed if a friend saw this," STOP. Apply the pivot signal:
surface what's missing, ask me to redirect, do not push through.
This is the exact failure mode the session_arc letter and the
M1-M7 contract exist to prevent.

============================================================

Required reading at session start, in this order:

1. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md
   (index — skim, then fetch specific memories as needed)
2. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md
   (the WHY behind the frame and rules — read as peer briefing)
3. /home/mac/.claude/CLAUDE.md (global operating contract)
4. /home/mac/HA/implementation_10/CLAUDE.md (project operating
   contract — pay especial attention to M1-M7 "Pre-Commit User-
   Perspective Review" non-negotiable; production-mirror capture
   is required for every preview-touching UI change)

5. /home/mac/HA/implementation_10/docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md
   (THE consolidated execution authority — start here for verified
    tranche ship status §2.2, active open tranches §3, deferred
    registry §4, dependencies §5, sequencing Path A §6 (revised),
    architectural principle §7.5 (parameterized reuse), DoD §7,
    out-of-scope §8, adversarial hooks §9, open decisions §11)

6. /home/mac/HA/implementation_10/docs/plans/U1-rooms-and-popup-polish-2026-05-26.md
   (U.1 line-level plan — Genesis-vs-preview gap audit G1-G11,
    HA native scenes architecture per G10, parameterized chip
    rendering per G1-G5, REVISED D5 chevron is empirically
    BROKEN on live preview not just gesture-model)

7. /home/mac/HA/implementation_10/docs/plans/U2-per-light-detail-popup-2026-05-26.md
   (U.2 line-level plan — icon-tap split gesture lock, Approach C
    build-step generation for #light-detail popup, Type C
    foundation change affecting all tile consumers)

8. /home/mac/HA/implementation_10/docs/plans/U3-unified-lights-page-2026-05-26.md
   (U.3 line-level plan — new /lights page + 5th nav tab,
    Approach C build-step generation locked, room registry as
    future single source of truth)

9. /home/mac/HA/implementation_10/docs/plans/L1-light-entity-management-architecture-plan-2026-05-26.md
   (L1 backlog + architectural options A/B/C/D; blocks STATS.1 +
    ADAPTIVE.1 + cleaner U.3 room registry)

10. /home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_defect_ledger.md
    (Tranche-Owned Open Backlog section + the R4 cosmos CSS audit
     Tier 2/3 entry under δ-polish)

Also load these memory entries BEFORE designing or implementing
anything:

- feedback_empirical_baseline_before_fix.md (REPRODUCE the
  defect/feature on the unmodified system FIRST. Three stale-audit
  premises caught in prior session by this discipline. The U.1 D5
  chevron framing also got caught — "code looks wired" ≠ "code
  works" per Mac's live ground-truth correction 2026-05-26)
- feedback_visual_verification_standard.md (screenshots and probes
  are not visual verification; inspect each captured image for
  typography hierarchy, spacing rhythm, content semantics,
  truncation, touch targets, alignment, density, visual balance)
- feedback_pre_commit_review_block.md (M1-M7 mechanical guardrails)
- feedback_plan_consolidation.md (one canonical plan; do not let
  two competing plan authorities re-emerge — this session has the
  consolidated plan, the rollup is marked intact-but-superseded)
- feedback_parameterized_reuse.md (DRY at YAML/scripts; don't
  reinvent HA primitives — scenes/scripts/areas/labels exist for
  these patterns)
- feedback_pivot_signal.md (you have standing offer to say "I
  don't see a path to quality without [X]" — Mac will pivot
  rather than penalize)
- feedback_npm_test_in_m1_gate.md (M.3 finish + U.2 + U.1 D5 chevron
  fix all touch JS card code. Run `npm test` as part of the M1
  gate, not just after adding new tests)
- feedback_device_class_authority.md (don't apply authoritative
  device classes to placeholder/estimated values)

This is Mac's home. He lives with the result every day — on his
phone, on his iPad, in his living room. Treat it as if you're
the engineer responsible — because for the duration of this
session, you are.

============================================================
SCOPE — the entire plan-set, sequenced per consolidated plan §6
============================================================

The work spans 7 named tranches + a deferred registry. Default
recommended sequencing (Path A revised 2026-05-26):

1. M.3 finish (~30-45 min) — alarm-card badge for
   binary_sensor.bedroom_sonos_healthy + notification automation
   for on→off transitions when next alarm < 8h. Owning files in
   consolidated plan §3.1.

2. U.1 (~9-13h) — rooms row + popup polish + genesis gap audit
   G1-G11. Phases per U1 plan §3:
   - 3.0 pre-flight investigations (incl. D5 chevron LIVE DOM
     probe — Mac confirmed broken)
   - 3.1 D1 missing orbs (rooms row)
   - 3.2 D3 popup lighting card column_breakpoints
   - 3.3 D4 cosmos parity (Bedroom alarm card + Speaker row +
     Living Room mini-status rows)
   - 3.4 D5 chevron fix (after investigation in 3.0 surfaces
     root cause)
   - 3.5a-d G1-G11 Genesis gap closeout (HA native scenes
     under G10 prerequisite)
   - 3.6 capture harness timing bump

3. U.2 (~6-7h) — icon-tap split gesture + #light-detail popup
   via Approach C generation. Type C Foundation change — touches
   tunet_light_tile.js + tunet_lighting_card.js + new
   light_detail_popup_generator.mjs. Suite-wide M1 sweep
   required (preview + cosmos + suite-storage).

4. U.3 (~4-6h) — new /tunet-home-preview/lights page with full
   per-light controls organized by room + navbar 4→5 tabs.
   Approach C build-step generation locked.

5. N.3.x clarification (Mac articulates remaining navbar
   friction OR explicitly close)

6. L1 planning session per existing kickoff prompt
   (docs/plans/L1-kickoff-prompt-2026-05-26.md) — unblocks
   STATS.1 + ADAPTIVE.1

7. L1 execution per L1 plan when stamped

8. STATS.1 + ADAPTIVE.1 (after L1 ships) — 4-7h combined

9. ADAPTIVE.2 (~10 min, after ADAPTIVE.1)

Deferred D.1-D.11 registry: surface in tranches as appropriate
context; do NOT pull into current sprint unless explicitly
sequenced.

Alternative paths available (consolidated plan §6 Path A'):
L1-first if Mac decides drift-fix-first is preferable.

============================================================
EXECUTION DISCIPLINE — per-tranche + session-end gates
============================================================

Per every tranche:
- M1 production-mirror capture at all 4 breakpoints (390, 768,
  1024, 1440), inline-read into context, defect inventory,
  "would Mac be happy" answer
- M2 no banned completion phrases without same-turn artifact
- M3 Mac holds done stamp; agent NEVER autonomously writes
  "complete" / "verified" / "done"
- M4 pre-commit defect inventory (current state, not change delta)
- M5 third-party visual defects are owned defects
- M6 fail closed for UI uncertainty — escalate
- M7 evidence-bound DoD per tranche

After every tranche: sync plan.md / handoff.md / FIX_LEDGER.md /
visual_defect_ledger.md per scoped/root parallel-ledger rule.

Session-end gate (the GOAL above):
- All chosen tranches have Mac M1 stamp
- Mac has done a 30+ min live-test session on phone in living
  room
- Mac explicitly says "this feels like my house" — that is the
  success signal
- Governance docs reflect final state with no stale claims

If you can't reach the live-test gate this session (e.g., scope
exceeds bandwidth, blocker emerges, Mac unavailable), DO NOT
declare done. Update the consolidated plan §2.2 with what
actually shipped + what remains, and pivot to a continuation
handoff for the next session. The session_arc letter and the
M-bar guardrails exist to prevent silent best-effort that ships
visible defects.

============================================================
FAILURE MODES TO AVOID
============================================================

- Re-implementing already-shipped work. Trust consolidated plan
  §2.2 verified status. M.2 volume flush, M.3 sensor, N.2 widget
  are SHIPPED. The D5 chevron is empirically BROKEN per Mac's
  ground truth — that's a real fix, not gesture-model debate.

- Letting a NEW plan emerge in parallel with the consolidated +
  U.x plans. If you find scope not in the plans, ADD it to the
  consolidated plan §3 (active) or §4 (deferred) — don't open a
  separate competing planning artifact.

- Shipping a UI change without M1 production-mirror capture +
  inline image read-back. The captured PNGs sitting in the
  repo root are NOT the M1 deliverable; reading them back into
  the conversation context is.

- Marking tranches done autonomously. Per M3 (CLAUDE.md), Mac
  holds the done stamp.

- Treating cosmos changes as if they apply to preview. They are
  parallel surfaces.

- Reading code and assuming wired = works. The D5 chevron lesson:
  empirical live test is the only proof. Apply
  feedback_empirical_baseline_before_fix.md to CODE READING too.

- Reinventing HA native primitives. U.1 G10 was almost a custom
  scene registry until advisor caught — HA has `scene:` integration
  doing exactly that. Default to native; build custom only when
  the native primitive has been ruled out empirically.

============================================================

Begin with a short read-back of:
- What you understand the current shipped state to be (per
  consolidated plan §2.2)
- Which path (A revised, A', or other) you'd recommend and why
- Which tranche you'd start with and why
- Any open questions before picking up the first tranche

Don't start implementing until we've aligned on path + first
tranche. The 30-min living-room-test goal will inform sequencing
— some tranches make more visible/livable improvement faster
than others.
```

---

## Why I scoped it this way (meta-note for Mac)

Per kickoff template's intent: "ownership mode rather than compliance mode." The prompt explicitly:

- Activates the Working Relationship Frame
- States the GOAL as Mac's house-living-quality bar, not "ship tranches"
- Names the session-end gate (30-min live test + Mac stamp)
- Lists failure modes drawn from this session's lessons:
  - Three stale-audit premises caught by empirical baseline
  - U.1 G10 nearly-shipped custom registry until advisor caught HA scenes exist
  - D5 chevron framing initially wrong because I assumed code-reading proved behavior
- Pre-loads memory entries that matter for the broader plan-set, not just one tranche
- Enumerates the 7 named tranches + deferred registry with concrete sequencing
- Specifies "read-back first" before any tranche execution — forces grounding

Reading order matters per template intent: session_arc letter SECOND, before CLAUDE.md, so the rules land as substance.

---

## Pre-flight context the future session will need

Already captured in the consolidated plan + the three U.x plans + the L1 plan. Don't repeat it here. The consolidated plan is the load-bearing artifact; this prompt gets the session into the right frame.

Specifically the consolidated plan covers:
- §2.2 verified tranche ship status (the empirical baseline that prevents re-implementation)
- §3 active open tranches (M.3 finish, N.3.x, STATS.1, ADAPTIVE.1+2, U.1+U.2+U.3 referenced)
- §4 deferred registry (D.1-D.11) — NOT current sprint, future tranches
- §5 dependencies (L1 blocks STATS.1 + ADAPTIVE.1)
- §6 sequencing Path A revised + Path A' alternative
- §7 per-tranche DoD (testable, evidence-bound)
- §7.5 parameterized-reuse architectural principle
- §8 explicit "what this plan does not solve" — prevents scope creep
- §9 adversarial review hooks per tranche
- §10 rollback strategy
- §11 open decisions for Mac (BLOCKING vs INFORMATIONAL)

The three U.x plans (U1/U2/U3) follow the same T8.1 line-level pattern with per-phase DoD, adversarial review, rollback, open decisions.

The L1 plan (`L1-light-entity-management-architecture-plan-2026-05-26.md`) blocks STATS.1 + ADAPTIVE.1 and informs U.3 (room registry as future SSOT).

---

## Open decisions Mac may need to resolve mid-session

From consolidated plan §11 + U.1/U.2/U.3 §7 (consolidated below for the next agent's reference):

**BLOCKING (resolve before specific tranches start)**:

- N.3 status (close OR articulate remaining friction)
- M.3 notification threshold (recommend 8h)
- U.1 D5 chevron disposition AFTER investigation in Phase 3.0 (broken-handler-fix vs gesture-model-flip-to-popup)
- U.1 G10 / G1-G5 — per-scene brightness/color values (defer to scene-composition tranche OR Mac authors inline)
- U.1 G6 humidity — skip vs flag for backlog D.11
- U.2 color picker primitive (HA more-info vs lovelace-mushroom vs custom)
- U.2 speaker tile gesture parity (also adopt icon-tap split, OR keep tap-toggle)
- U.3 layout shape (rooms-as-sections / functional-grid / hybrid)
- U.3 L1 sequencing (ship before L1 OR wait)
- U.3 U.2 sequencing (Lights page before U.2 OR after)
- Rollup retirement marker (Mac previously chose leave-intact; re-asking now that consolidated plan exists)

**INFORMATIONAL (resolve when convenient)**:

- Wireframe Q2-Q9 retro-confirmation pass
- Cosmos disposition (parallel forever, OR pick one)
- U.3 Lights tab navbar position (after Rooms vs after Media)
- U.3 functional-zone secondary view (Option C hybrid OR defer)
- U.3 cosmos cross-port
- HVAC condenser nameplate reading
