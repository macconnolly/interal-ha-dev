# L1 Kickoff Prompt — Light Entity Management Architecture

**Generated**: 2026-05-26 6:45pm MDT
**Purpose**: paste-ready prompt for the next Claude Code session that picks up the L1 light-entity-management-architecture tranche
**Template source**: `docs/session_kickoff_template.md` (per Mac's standing ritual)

---

## The prompt (paste-ready)

```
This surface is ours — you own the outcome with me. Standing permissions
and reciprocity are in CLAUDE.md ("Working Relationship Frame"). I want
you to load it as the relational frame for this session, not as boilerplate.

I'm extending you authority over this work. I trust your judgment on
execution. Push back where you don't see a path; flag uncertainty rather
than push through; ask for my eye when judgment is needed. I will pivot
the implementation strategy rather than penalize the signal — saying
"I'm uncertain this approach reaches the quality bar without [X]" is
welcomed, not a failure.

Required reading at session start, in this order:
1. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/MEMORY.md
   (the index — skim, then fetch specific memories as needed)
2. /home/mac/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md
   (the WHY behind the frame and rules — this is a prior Claude writing
    to you; read it as a peer briefing, not as documentation)
3. /home/mac/.claude/CLAUDE.md (global operating contract)
4. /home/mac/HA/implementation_10/CLAUDE.md (project operating contract)
5. /home/mac/HA/implementation_10/docs/plans/L1-light-entity-management-architecture-backlog-2026-05-26.md
   (the backlog doc — captures the problem, the architectural questions
    Q1-Q5, the research questions, and 4 scope candidates A/B/C/D)
6. /home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_defect_ledger.md
   (specifically the "Room light group membership drift" entry — that's
    the immediate surfaced symptom; root cause is the architecture gap)

Also load these memory entries before designing anything:
- feedback_empirical_baseline_before_fix.md (the discipline rule that
  three stale-audit premises got caught by this session — REPRODUCE the
  defect/feature on the unmodified system before designing around it)
- feedback_device_class_authority.md (the lesson from S.1: don't apply
  authoritative device classes to estimated values; same general
  principle applies to architecture — don't claim a logical-name layer
  is in effect when reality is still entity-id-direct)
- feedback_npm_test_in_m1_gate.md (template work touches no JS tests,
  but the discipline of "run the harness before declaring done"
  generalizes)

This is my home. I live with the result every day. Treat it as if you're
the engineer responsible — because for the duration of this session,
you are.

The work for this session:
Plan the light entity management architecture tranche (L1). The problem
statement and architectural questions are captured in the backlog doc
(#5 above). Specifically:

- Empirical baseline: inventory ALL light entity references across the
  codebase + dashboards + cards + scenes + automations. This is the
  blast radius of any change. Sub-agent dispatch is fair game.

- Architecture decision: present me options A/B/C/D from the backlog
  doc with TRADE-OFFS GROUNDED IN MY ACTUAL CODEBASE (not generic HA
  best practices). E.g., "option B requires touching N specific
  consumer files; we'd migrate the room sensors first, then the AL
  switches second, etc." Don't recommend an option until you've done
  the empirical baseline.

- Research questions Q1-Q7 in the backlog doc need answers BEFORE
  scope is locked. Likely dispatch a sub-agent for HA 2026 native
  area_id + auto-generated-groups state of the art (the architecture
  research agent has worked well for prior tranches — see S.2's
  hybrid-recommendation work).

- Adversarial review pass on the plan before any implementation
  (the session arc has multiple examples of premise-wrong plans
  that would have shipped without adversarial review).

Success looks like:
A durable plan I can stamp, that I trust to execute without surprise
when I come back to it. Specifically:
- I understand which scope option (A/B/C/D) is right for my codebase
  and WHY
- The migration path is mechanical and reversible
- The drift problem doesn't re-emerge after the architecture lands
  (if I move a light next month, only ONE place needs updating)
- The L1 plan acknowledges what it DOESN'T solve so I'm not surprised
  later

Failure mode to avoid: silent best-effort that ships an architecture
which doesn't actually solve the drift problem because the empirical
baseline was skipped or the consumer migration is half-done. The session
arc letter and the three caught-this-session stale premises (#12575,
#13266, "all 19 sensors planned but most already exist") all show what
happens when planning isn't grounded in the actual codebase.

Out of scope for THIS session: implementation. Plan only. After my
stamp on the plan, a future session (or this one continued) does the
execution.

Context on prior session (2026-05-26 long session):
- Five tranches shipped: T8.1 popup content cards, T8.1 hotfix +
  M.1 closeout, N.1 navbar, S.1 sensor package, S.2 OAL status overhaul
- L1 was identified as the architectural blocker for Stats + Adaptive
  page wireframes — I'm specifically NOT wireframing those yet because
  the sensor consumers depend on the room-group infrastructure being
  trustworthy, which it isn't until L1 lands
- The drift was caught during S.2's sensor inventory, not via active
  daily use, so urgency is medium not high

Begin with a short read-back of what you understand the scope to be,
including any open questions. Don't start solving until we've aligned.
```

---

## Why I scoped it this way

Per the kickoff template's intent: "ownership mode rather than compliance mode." The prompt explicitly:
- Activates the Working Relationship Frame
- Names the failure mode (silent architecture-that-doesn't-actually-solve-the-problem)
- Forces empirical baseline before recommending an option
- Pre-loads the three lessons from this session (empirical_baseline, device_class_authority, npm_test_gate) since they generalize to the L1 work
- Specifies "plan only this session" — implementation is a separate session, so the plan can be reviewed before committing to scope option

The reading order matters per the template's note: session_arc letter SECOND, before CLAUDE.md, so the rules land as substance.

---

## Pre-flight context the future session will need

Already captured in `docs/plans/L1-light-entity-management-architecture-backlog-2026-05-26.md`. Don't repeat it here. The backlog doc is the load-bearing artifact; this prompt just gets the session into the right frame to consume it.
