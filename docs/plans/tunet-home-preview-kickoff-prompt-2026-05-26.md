# Tunet Home Preview — Kickoff Prompt for Next Session

**Generated**: 2026-05-26 evening MDT
**Purpose**: paste-ready prompt for the next Claude Code session that picks up `tunet-home-preview` dashboard work
**Template source**: `docs/session_kickoff_template.md` (Mac's standing kickoff ritual)
**Companion plan**: `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md` (the consolidated execution authority)

---

## The prompt (paste-ready)

```
This surface is ours — you own the outcome with me. Standing permissions
and reciprocity are in CLAUDE.md ("Working Relationship Frame"). Load
it as the relational frame for this session, not as boilerplate.

I'm extending you authority over this work. I trust your judgment on
execution. Push back where you don't see a path; flag uncertainty
rather than push through; ask for my eye when judgment is needed. I
will pivot the implementation strategy rather than penalize the signal
— saying "I'm uncertain this approach reaches the quality bar without
[X]" is welcomed, not a failure.

Required reading at session start, in this order:
1. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md
   (the index — skim, then fetch specific memories as needed)
2. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md
   (the WHY behind the frame and rules — this is a prior Claude
    writing to you; read it as a peer briefing, not as documentation)
3. /home/mac/.claude/CLAUDE.md (global operating contract)
4. /home/mac/HA/implementation_10/CLAUDE.md (project operating contract
    — pay special attention to M1-M7 "Pre-Commit User-Perspective
    Review" non-negotiable; production-mirror capture is required for
    every preview-touching UI change)
5. /home/mac/HA/implementation_10/docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md
   (THE consolidated execution authority — start here for the open-
    tranche map, verified live state, dependencies, recommended
    sequencing, and DoD per tranche)
6. /home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_defect_ledger.md
   (specifically the "Tranche-Owned Open Backlog" section + the
    R4 cosmos CSS audit Tier 2/3 entry under δ-polish)

Also load these memory entries BEFORE designing or implementing
anything:
- feedback_empirical_baseline_before_fix.md (the discipline rule
  that three stale-audit premises were caught in the prior session
  — REPRODUCE the defect/feature on the unmodified system before
  designing around it. This applies directly: the consolidated plan
  marks M.2 and M.3 sensor side and N.2 as SHIPPED based on live
  probes; trust those probes, do not re-implement)
- feedback_visual_verification_standard.md (screenshots and probes
  are not visual verification; inspect each captured image for
  typography hierarchy, spacing rhythm, content semantics,
  truncation, touch targets, alignment, density, visual balance)
- feedback_pre_commit_review_block.md (M1-M7 mechanical guardrails;
  authoritative text is in /home/mac/HA/implementation_10/CLAUDE.md)
- feedback_plan_consolidation.md (the lesson behind why this
  consolidated plan exists; do not let two competing plan
  authorities re-emerge — if you discover new scope, add it to the
  consolidated plan or open a separate sub-plan with explicit
  cross-references)
- feedback_pivot_signal.md (you have standing offer to say "I don't
  see a path to quality without [X]" — Mac will pivot rather than
  penalize)
- feedback_npm_test_in_m1_gate.md (M.3 finish touches
  tunet_alarm_card.js — JS card code surface. Run `npm test` as
  part of the M1 gate, not just after adding new tests; the prior
  session caught a 62h-in-production speaker-grid regression this
  way)

This is Mac's home. He lives with the result every day — on his
phone, on his iPad, in his living room. Treat it as if you're the
engineer responsible — because for the duration of this session,
you are.

The work for this session:

A) READ-BACK FIRST. Before picking up any tranche, read the
   consolidated plan §2 (Empirical Baseline) and confirm you
   understand the verified state. The prior session marked several
   "OPEN" rollup items as actually SHIPPED based on live probes.
   Trust those probes; do not re-implement M.2 (volume debounce
   flush — verified shipped at tunet_media_card.js:1010+) or N.2
   (conditional media widget — shipped as CSS @media rule in N.1)
   or the M.3 sensor side (binary_sensor.bedroom_sonos_healthy
   already exists in packages/tunet_stats_sensors.yaml:93).

B) RESOLVE OPEN DECISIONS WITH MAC. Per consolidated plan §11, the
   following block tranche execution:
   - N.3 status (Mac to articulate remaining navbar friction OR
     explicitly close)
   - M.3 notification threshold (recommend 8h; Mac confirms)
   - Execution path A (daily-impact-first) vs B (L1-first) —
     default recommendation is Path A
   - Whether to mark the rollup superseded at its head (Mac
     previously chose "leave intact"; consolidated plan exists now,
     so worth re-asking)

C) EXECUTE THE FIRST OPEN TRANCHE. Per Path A default:
   - **M.3 finish** (~30-45 min): alarm-card badge for
     binary_sensor.bedroom_sonos_healthy + notification automation
     for on→off transitions when next alarm < 8h. Owning files in
     consolidated plan §3.1. M1 production-mirror capture +
     simulated disabled-Sonos test required. Adversarial review
     hooks in plan §9.

D) MAC STAMP. After M.3 finish (or whichever tranche is picked):
   Mac holds the done stamp per M3. Do not autonomously write
   "complete" / "verified" / "done" in commits or governance docs.

For sessions wanting to do L1 next instead of M.3:
- Use the L1 kickoff prompt at
  /home/mac/HA/implementation_10/docs/plans/L1-kickoff-prompt-2026-05-26.md
- L1 unblocks STATS.1 + ADAPTIVE.1 in the consolidated plan

Success looks like:

A consolidated-plan-aligned session that picks up exactly where
the prior session left off, executes one (or more) named tranche
per the plan's sequencing, hits the per-tranche DoD (§7), passes
M1 capture, and gets Mac's stamp before claiming done. After
shipment, governance docs (plan.md / handoff.md / FIX_LEDGER.md /
visual_defect_ledger.md) sync per the standing rule.

Failure modes to avoid:

- Re-implementing already-shipped work. The prior session's
  empirical baseline caught this — trust §2.2 of the consolidated
  plan.
- Letting a NEW plan emerge in parallel with the consolidated
  one. If you find scope not in the plan, ADD it to §3 (active
  open) or §4 (deferred registry) — don't open a separate
  competing planning artifact.
- Shipping a UI change without M1 production-mirror capture +
  inline image read-back. The captured PNGs sitting in the
  repo root are NOT the M1 deliverable; reading them back into
  the conversation context is.
- Marking tranches done autonomously. Per M3 (CLAUDE.md), Mac
  holds the done stamp.
- Treating cosmos changes as if they apply to preview. They are
  parallel surfaces. Preview is your target file:
  Dashboard/Tunet/tunet-home-preview-config.yaml.

Out of scope for THIS session unless explicitly added by Mac:
- Cosmos surface work (parallel, owns its own R4 backlog + theme
  experiments)
- OAL backend work (Campaign B/C per office-corner-accent-
  relocation.md; HVAC/OAL handoff per hvac-oal-execution-handoff)
- Tunet-overview → tunet-home-preview production cutover (happens
  after STATS.1 + ADAPTIVE.1 land; needs Mac awake to grade for
  ≥30min post-cut per session_arc letter J.2 C2)
- L1 implementation if you choose M.3 path (L1 has its own
  kickoff at docs/plans/L1-kickoff-prompt-2026-05-26.md; only
  pick L1 if Mac explicitly directs Path B at the decision gate)

Begin with a short read-back of:
- What you understand the current shipped state to be (per §2.2)
- Which path (A or B) you'd recommend and why
- Any open questions before picking up the first tranche

Don't start implementing until we've aligned on path + first
tranche.
```

---

## Why I scoped it this way

Per the kickoff template's intent: "ownership mode rather than compliance mode." The prompt explicitly:

- Activates the Working Relationship Frame
- Names the failure modes from this session: re-implementing shipped work, allowing parallel plan authorities to re-emerge, shipping without M1, autonomous "done" claims
- Pre-loads the five most-relevant memory entries (empirical baseline, visual verification, pre-commit review, plan consolidation, pivot signal)
- Specifies "read-back first" before any tranche execution — forces the next agent to ground in the verified state rather than re-discover
- Gives a clear default (Path A, M.3 finish) but explicitly invites the alternative (Path B, L1) with its own kickoff pointer
- Names the cosmos/preview parallel-surface trap so the next agent doesn't conflate

The reading order matters per the template's intent: session_arc letter SECOND, before CLAUDE.md, so the rules land as substance and frame rather than boilerplate.

---

## Pre-flight context the future session will need

Already captured in `docs/plans/tunet-home-preview-consolidated-plan-2026-05-26.md`. Don't repeat it here. The consolidated plan is the load-bearing artifact; this prompt just gets the session into the right frame to consume it.

Specifically the consolidated plan covers:
- §2.2 verified tranche ship status (the empirical baseline that prevents re-implementation)
- §3 active open tranches (M.3 finish, N.3.x, STATS.1, ADAPTIVE.1+2, U.1)
- §4 deferred registry (D.1-D.10) — NOT current sprint, future tranches
- §5 dependencies (L1 blocks STATS.1 + ADAPTIVE.1)
- §6 sequencing paths (A default, B alternative)
- §7 per-tranche DoD (testable, evidence-bound)
- §8 explicit "what this plan does not solve" — prevents scope creep
- §9 adversarial review hooks per tranche
- §10 rollback strategy
- §11 open decisions for Mac (the gates that need confirm before specific tranches start)

Appendix A in the consolidated plan gives the full reading order including historical implementation references (T8.1, N.1, T8/T9 plans) for context on shipped work.

Appendix B in the consolidated plan has the live-state probe table for empirical traceability — every "SHIPPED" claim in §2.2 has a corresponding probe result.
