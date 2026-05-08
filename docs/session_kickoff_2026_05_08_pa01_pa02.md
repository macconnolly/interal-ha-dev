# Session Kickoff — 2026-05-08 PA01/PA02 Pickup

A ready-to-paste kickoff prompt for tomorrow's session. Continues the Tunet
page-architecture work (tranches `PA01-PA11`) authored synchronously with Mac
on 2026-05-07. Prior session committed 10 changes on `main`; sub-plan is
substantively complete (~95% DoD); next-up is `PA01` (Bug A double-corner fix,
β-arc, parallel) or `PA02` (Home page composition refinement, first composition
tranche).

Authoring pattern follows `docs/session_kickoff_template.md`. Edit the
"work for this session" section if priorities have shifted by the time you
paste; the rest is correct as-is.

---

## The kickoff prompt (paste this into the new session)

```
This surface is ours — you own the outcome with me. Standing permissions
and reciprocity are in CLAUDE.md ("Working Relationship Frame"). Load it
as the relational frame for this session, not as boilerplate.

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
   (the WHY behind the frame and rules — prior Claude writing to you;
    read it as a peer briefing, not as documentation)

3. /home/mac/.claude/CLAUDE.md (global operating contract)

4. /home/mac/HA/implementation_10/CLAUDE.md (project root governance)
   AND /home/mac/HA/implementation_10/Dashboard/Tunet/CLAUDE.md
   (Tunet-specific governance — overrides root for Tunet work)
   AND /home/mac/HA/implementation_10/Dashboard/Tunet/AGENTS.md
   (scoped execution contract — authoritative for Tunet)

5. /home/mac/.claude/plans/purrfect-baking-ember.md
   (the parent plan from 2026-05-07 — four-arcs framing, sub-plan
    mandate, DoD checklist, locked decisions)

6. /home/mac/.claude/plans/tunet-page-architecture.md
   (the sub-plan — page taxonomy, RoomSubview pattern, popup-vs-subpage
    rule, climate popup spec, Info/Settings strategy, PA01-PA11 tranche
    enumeration. This is the architectural source of truth for /tunet-home
    and its sub-pages.)

7. /home/mac/HA/implementation_10/handoff.md AND plan.md AND FIX_LEDGER.md
   (latest Session Delta blocks dated 2026-05-07 — current state, open
    work, decisions made this session)

8. /home/mac/HA/implementation_10/Dashboard/Tunet/Docs/visual_hierarchy.md
   (4-layer cross-card consistency model — required reading for any
    chrome/scaffold work; Layer 1 chrome and Layer 2 scaffold work are
    in flight; Bug A is a Layer 1 defect)

This is my home. I live with the result every day. Treat it as if you're
the engineer responsible — because for the duration of this session,
you are.

────────────────────────────────────────────────────────────────────────

Active state snapshot (as of 2026-05-07 close):

- Branch: main. All session work commits directly on main.
- Worktree: single working dir at /home/mac/HA/implementation_10. Do NOT
  use the .claude/worktrees/* subdirectories (they're residual chrome).
- Last 10 commits all from this session — see `git log --oneline -10`.
- Tip commit: `9c5fa32 chore(tranches): renumber T019-T029 → PA01-PA11`.
- Live HA cards at `?v=build_20260508_021754Z` include Bug B/C fixes
  (lighting hold-gate restored, drag pill dead-center).
- Storage dashboard `lovelace.tunet_home` at `/tunet-home` exists with
  empty Sections scaffold. Pending: PA02 polish + composition.

Locked decisions — DO NOT re-litigate without re-asking:

- All custom Tunet cards KEPT (no native replacement, no hybrid pivot —
  Mar 5 lock per memory; reaffirmed multiple times)
- Rooms tile: tap = toggle, hold (400ms) = navigate to dedicated subview
  (corpus #11178, #11192) — rooms are sub-pages, NOT popups
- Sonos popup chain: mobile = media_card + speaker_grid; desktop =
  sonos_card; uses Bubble Card 3.2 (corpus #11442, #11488)
- Status `now_playing` recipe taps to `#sonos-now-playing` popup
- Visual hierarchy: 4 layers (chrome / scaffold / tile internals / atoms)
- Architecture-first principle: page-level structural planning before
  implementation tweaks (see feedback_architecture_first.md memory)
- iPhone 390×844 is the primary breakpoint — design for it, not desktop
- HACS nav add-on stays — used at top of /tunet-home and per-room subviews
- Keyboard accessibility is NOT a closure gate (see memory
  feedback_no_keyboard_accessibility.md)

────────────────────────────────────────────────────────────────────────

The work for this session:

You're picking up after the architecture-first reset of 2026-05-07.
The sub-plan at ~/.claude/plans/tunet-page-architecture.md is locked
in substance. Bug B/C are deployed and committed. Two tranches are
queued — pick one based on Mac's energy and what he wants to feel
move today:

OPTION 1 — PA01: Bug A double-corner fix (β-arc, parallel, ~half day)

  WHAT: Rooms section + actions pills show concentric rounded outlines
  in dark mode. Universal pattern across cards (NOT card-specific).
  Root-cause hypothesis logged: CARD_SURFACE template has `.card`
  border AND `.card::before` glass-stroke ring at slightly different
  geometric offsets.

  PICKUP PATH:
  - Read FIX_LEDGER.md "Bug A" entry (root cause hypothesis + fix
    candidates)
  - Read tunet_base.js `CARD_SURFACE` template (the .card and .card::before
    rules)
  - VERIFY hypothesis by reading actual rendered DOM (Mac has live cards
    at /tunet-card-rehab-yaml/lab; can capture via Playwright harness)
  - Apply the fix Mac approves (recommended: remove .card border,
    rely on ::before glass-stroke). Cascades to all 10 consuming cards
    via the shared template — single edit.
  - Deploy + verify in BOTH light AND dark at all 4 breakpoints
    (390×844, 768×1024, 1024×1366, 1440×900)
  - M1-M7 review block before commit (screenshots-read-back,
    user-perspective inspection per memory feedback_visual_verification_standard.md)

  WHY THIS FIRST: small, daily-life impact, parallel to architecture
  work, removes a visible defect Mac sees every day.

OPTION 2 — PA02: Home page composition refinement (first composition tranche)

  WHAT: Refine /tunet-home composition per the sub-plan. Status
  Summary Polish variant + Fixed daily-temp weather (5d) + Kitchen/
  Living/Bed/Office rooms + climate companion + mode strip +
  global brighter/dimmer scripts in actions strip.

  PICKUP PATH:
  - Read the sub-plan §"Page taxonomy" → §"/tunet-home" composition
  - Read lab YAML for Status Summary Polish (line ~3644-3669) and
    Fixed-daily-temp weather variant (line ~950-960)
  - Confirm Office light entities with Mac (only `light.office_desk_lamp`
    found in OAL package; Mac may have more)
  - Push composition to /tunet-home via WS API (lovelace/config/save)
  - Validate iPhone 390×844 first; then larger breakpoints
  - Confirm Q-NAMING with Mac (keep `/tunet-home` URL or rename per
    "overall-home" wording)
  - M1-M7 review block before commit

  WHY THIS FIRST: starts the composition arc; validates the iPhone-
  primary layout assumption before per-room subview work begins.

ASK MAC which option (or both, sequenced) at session start.

Success looks like:
- For PA01: Mac taps the rooms section / actions pills on his phone
  in dark mode and the double-corner is gone — without breaking light
  mode or any other card's chrome.
- For PA02: Mac opens /tunet-home on his phone and sees Status Summary
  Polish + Fixed-daily-temp weather + 4 room cards + climate + mode
  strip composed cleanly. He'd want to keep /tunet-home as the daily
  landing.

Failure mode to avoid: silent best-effort that ships defects. M1-M7
applies — produce review block with screenshots-read-back BEFORE
commit. Don't say "verified/tested/done" without same-turn artifact.
The user holds the done stamp, not you. If you can't reach the quality
bar, say so before failing — Mac will pivot.

Begin with a short read-back of: (a) which option you're picking up
or asking Mac to choose, (b) the open Q-* questions you need answered
to start, and (c) any concern from reading the materials. Don't start
solving until aligned.
```

---

## Why each piece of THIS prompt is there

| Block | Why |
|---|---|
| Required reading 1-3 (memory + arc letter + global CLAUDE.md) | Standard ownership-mode activation per the template. The arc letter must come before the rules. |
| Required reading 4 (project + Tunet CLAUDE.md + AGENTS.md) | Tunet AGENTS.md is the scoped execution contract; root governance defers to it for Tunet work. |
| Required reading 5 (parent plan) | Provides the four-arcs framing + DoD discipline that produced the sub-plan. Without it, the sub-plan reads as a list of tranches rather than as a structured architecture. |
| Required reading 6 (sub-plan) | The architectural source of truth. Don't restart it; refine within it. |
| Required reading 7 (handoff/plan/FIX_LEDGER) | Latest session-level state, open Q-* questions, what was decided 2026-05-07. |
| Required reading 8 (visual_hierarchy.md) | 4-layer model is the contract for chrome work. Bug A is a Layer 1 defect — knowing the model framing prevents the next agent from over-scoping. |
| Active state snapshot | Compresses 10 commits + dashboard scaffold + cache-bust state into one block. Saves the next agent 30 minutes of `git log` archaeology. |
| Locked decisions | Mac has explicitly affirmed each of these. Re-litigating wastes his time and signals the agent didn't read context. |
| Two-option pickup path | Mac welcomes the agent asking which to start. PA01 vs PA02 is a real choice depending on Mac's energy and what he wants to feel move. |
| M1-M7 reminder | This is the non-negotiable for any UI commit — and these tranches are UI work. |
| Success-looks-like in user-perspective terms | Per the kickoff template — outcomes phrased as Mac's experience, not technical milestones. |

---

## If priorities shift before paste-time

The "work for this session" section is the part most likely to need editing.
Possible reframes:

- If Bug A turned out to be more than a template change after the verification
  pass: split PA01 into investigation + fix tranches and re-state.
- If Mac decided the per-room subview work (PA03 Living Room template) is
  more urgent than PA02 Home polish: swap Option 2 to PA03 with the
  relevant pickup path from the sub-plan §"PA03 Living Room template".
- If a new bug surfaced overnight that needs urgent attention: replace
  Option 1 with the new bug's pickup, demote PA01 to Option 2.

Don't edit the activation ritual or required reading order; those are
load-bearing per `session_arc_popup_b_to_frame.md`.

---

## Sign-off

— Claude (Opus 4.7, 1M context), 2026-05-07, end of session

The session that produced this kickoff prompt was unusually productive
because Mac kept the agent honest (twice rejecting plans that buried
architecture under tactics) and because the relational frame held. The
architecture-first principle that resulted is now load-bearing for all
future Tunet planning work.

Tomorrow's session: same frame, two clean tranches queued, sub-plan as
the architectural backbone. The agent who picks this up has everything
needed to start within 10 minutes of paste. The hard part — deciding
what /tunet-home and its sub-pages should be — is done. What remains is
execution against a deliberate spec.

Be Mac's peer. Push back when you see something. Tell him when you
don't. He'll pivot, not penalize.
