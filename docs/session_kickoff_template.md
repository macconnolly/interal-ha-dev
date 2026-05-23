# Session Kickoff Template

A reusable prompt to start a Claude Code session in **ownership mode** rather than compliance mode. Drop this at the top of a new session, fill in the `{{...}}` placeholders for the specific work, and paste.

---

## Why this exists

`CLAUDE.md` already contains the Working Relationship Frame, the M1-M7 review block, and operating principles. But auto-loaded content can read as **passive boilerplate** — the agent technically registers it but doesn't operate from it. This template's job is to **explicitly activate** the frame at session start so it becomes a working contract rather than reference material.

The mechanism (per the prior Claude's session arc letter at `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`):
> "compliance-mode session opening → agent asks 'did I follow the rules?'; ownership-mode opening → agent asks 'would they be happy?'"

The prompt below is the ownership-mode opening.

---

## When to use it

Use it for any session that's not trivially mechanical. Specifically:

- Any work that touches live HA, user-facing UI, or load-bearing automations
- Any multi-step plan, merge, or refactor
- Any debugging where the failure mode could mask itself
- Any time you'd rather have honest pushback than silent best-effort

You can skip it for one-shot trivia ("what's the entity_id for X?") — but using it doesn't hurt either.

---

## The kickoff prompt (paste-ready)

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
4. {{path to the project CLAUDE.md for the worktree/repo you're working in}}
5. {{any task-specific docs — plans, ledgers, handoffs}}

This is my home. I live with the result every day. Treat it as if you're
the engineer responsible — because for the duration of this session,
you are.

The work for this session:
{{Describe the specific task, scope, or question. Be concrete about what
done looks like. If this is a continuation, point at the prior session's
handoff doc.}}

Success looks like:
{{Optionally describe the outcome you'd be happy with. Phrase as
user-perspective ("the lights work the way I expect") rather than
technical ("the YAML is valid").}}

Failure mode to avoid: silent best-effort that ships defects. If you
can't reach the quality bar, say so before failing. I'd rather pivot.

Begin with a short read-back of what you understand the scope to be,
including any open questions. Don't start solving until we've aligned.
```

---

## Why each piece is there (so you can edit with intent)

| Block | What it does | Cut at your peril |
|---|---|---|
| "This surface is ours" + authority extension | Activates ownership mode. Without this, the agent operates in compliance mode and asks "did I follow the rules?" instead of "would they be happy?" | Hard to overstate the impact. This is the load-bearing line. |
| Pivot signal invitation | Explicitly welcomes pushback. Without it, agents capitulate when they should flag concerns. | Critical. The session arc letter named silent capitulation as the failure mode this whole project exists to prevent. |
| Required reading order | Loads context in the right priority. The session arc letter SECOND (before CLAUDE.md) is intentional — the letter explains *why* the rules exist, which makes them load-bearing rather than performative. | Don't reorder. The letter has to come before the rules for the rules to land correctly. |
| "This is my home" reminder | Keeps stakes concrete. The agent doesn't always intuit that this isn't a hypothetical exercise. | Keep. It changes how careful the agent is with destructive operations. |
| Read-back at start | Forces alignment before solving. Catches misunderstandings while they're cheap to correct. | Keep, especially for substantive work. |

---

## Operational anchors

Quick reference for the rules the kickoff prompt activates. Full text lives in `CLAUDE.md` ("Pre-Commit User-Perspective Review (Non-Negotiable)") and mirrored in `Dashboard/Tunet/AGENTS.md` §6A for Codex sessions. The agent reads CLAUDE.md per the required reading order — this block is here so a human reader of the template knows what they're signing the agent up for.

**M1-M7 at a glance:**

- **M1** — Capture screenshots at minimum two breakpoints, read each one back into context, output the USER-PERSPECTIVE REVIEW block in conversation BEFORE any UI commit. Reading the screenshot back is the load-bearing step — captured-but-unread screenshots are how visible defects slipped past prior harnesses.
- **M2** — Banned completion phrases (`verified` / `tested` / `should work` / `is fixed` / `complete` / `done`) without a same-turn user-visible artifact. `should` is the highest-leverage optimism marker — treat as a stop trigger.
- **M3** — User holds the done stamp. Agent reports `"implemented, awaiting review"` rather than `"complete"`. Tranche-closure language (e.g. `CD11 — CLOSED`) requires explicit user confirmation in the same session.
- **M4** — Pre-commit defect inventory of CURRENT STATE (not change delta), triaged `blocker` / `visible` / `minor`. Blockers must resolve before commit.
- **M5** — Third-party visual primitives are owned defects. `"Documented as third-party limitation"` is not an acceptable disposition — fork at source, replace with native, or remove from the surface.
- **M6** — Asymmetric uncertainty: fail closed for UI. Default disposition is `"broken until proven otherwise"`; escalate, do not push through silently.
- **M7** — Definition-of-done must be evidence-bound (screenshots at named breakpoints + defect inventory + user confirmation). Banned prose: `"polished and complete"` / `"looks good"`.

**Sync discipline checklist:**

After any meaningful change, the following governance docs need a Session Delta in the same session:

| Always sync | When applicable |
|---|---|
| `plan.md` | `Dashboard/Tunet/Docs/cards_reference.md` (per-card behavior or contract changes) |
| `FIX_LEDGER.md` | `Dashboard/Tunet/Docs/visual_defect_ledger.md` (new or resolved visual defects) |
| `handoff.md` | `Dashboard/Tunet/Docs/sections_layout_matrix.md` (sizing or grid_options changes) |

For Codex sessions touching Tunet work, `Dashboard/Tunet/AGENTS.md` is the execution contract. §6A mirrors M1-M7 in the same wording — the rules are identical, only the audience differs.

---

## Three example fillings

### Example A: small focused fix

```
[paste the standard kickoff prompt above, then fill the variables:]

4. /home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration/CLAUDE.md
5. (none beyond required reading)

The work for this session:
The Tunet Sonos card's volume slider snaps back to its previous value
after I drag it. I expect the drag value to stick. Diagnose and fix.

Success looks like:
After dragging, the slider stays at the new value and the speaker
volume matches.
```

### Example B: substantive merge or refactor (this session was this kind)

```
[paste the standard kickoff prompt above, then:]

4. /home/mac/HA/implementation_10/.claude/worktrees/{{branch-name}}/CLAUDE.md
5. docs/oal_inbox_post_soak_handoff_2026_05_06.md (the post-soak handoff
   from the prior session — pick up SA5 from §4.1)

The work for this session:
Implement the SA5 Sonos snooze re-trigger fix per the trace in
docs/oal_inbox_merge_to_main_plan_2026_05_05.md §10.2a. The fix is
HA-side timer + media_player.play_media instead of mutating Sonos
alarm time. Approach: sequential — runtime confirm hypothesis first,
then write the fix, then validate via real snooze test.

Success looks like:
I snooze a Sonos alarm via the inbox and it actually re-fires at the
snooze interval. Mobile companion notifications still work.

Failure mode to avoid: shipping a fix that "works" in some abstract
sense but doesn't survive my actual morning routine. Validate
end-to-end with my eyes before declaring done.
```

### Example C: debugging where root cause is unclear

```
[paste the standard kickoff prompt above, then:]

4. /home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration/CLAUDE.md
5. (depends on what we find — start with required reading and we'll
   add more as we trace)

The work for this session:
{{Describe the symptom in user-perspective terms.}}
Example: "When I tap a light from the rooms card, sometimes it toggles
twice and ends up in the wrong state. Happens maybe 1 in 5 taps. No
pattern I've identified."

I don't know the root cause. Don't assume — trace from symptom to code
path before proposing a fix. If the symptom is hard to reproduce, say
so and we'll figure out a way together.

Success looks like:
We understand the cause. The fix follows from the understanding,
not from pattern-matching.

Failure mode to avoid: shipping a "looks like it might fix it" change
without confirming the cause. I'd rather have a clear understanding
and no fix than a fast fix and no understanding.
```

---

## Short form (for repeat sessions within an active task)

When picking up a multi-session task and the prior session already activated the frame and walked the read order, this lighter variant anchors the frame without re-walking the full reading order:

```
Working on [TASK]. Frame: CLAUDE.md Working Relationship Frame
applies. Read CLAUDE.md, MEMORY.md, session_arc, then governance
tails (plan/FIX_LEDGER/handoff). M1-M7 apply. Sync discipline
holds. I'll tell you what I see directly.
```

Use sparingly. The full long-form is still the right call when context has changed materially since the last session, when the active tranche shifted, or when you want the agent to do a fresh read-back of scope.

---

## Current state checkpoint

This block is volatile. Update it at the end of any session that materially changes a line. Keep it factual, not opinion — the agent reading it should be able to act on it without further interpretation.

**As of 2026-05-06:**

- **Unpushed commits on `main`:** several from the post-CD11 popup chain work + governance sync + M1-M7 + Working Relationship Frame additions. Confirm with `git log origin/main..main` at session start.
- **Active tranche:** CD11 (status multi-mode redesign/runtime pass) is closed in repo/docs/tests/deploy/visual terms as of 2026-05-05. CD10/nav verification remains intentionally deferred. CD12/surface assembly remains parked pending user direction.
- **Acute open issues (read before touching popups):**
  - Popup chain at `/sonos-popups` is visually broken at desktop. Popup B (embedded HACS `custom:sonos-card` v10.6.8) has fixed-height empty-space defects, generic "Sonos" titles across sections, and SVG fills that don't honor theme tokens. Popup A v2 (Large 3-col speaker grid) was a comparison variant. Both candidates for deletion — see session arc letter for full context.
  - Bubble Card 3.2-beta.1 back-arrow on popup B does not return to popup A (uninvestigated chain regression).
- **Recently-touched governance commits:** `8929e7c` (Working Relationship Frame in CLAUDE.md), `95a32ff` (M1-M7 in CLAUDE.md + AGENTS.md §6A), `071a323` (cards_reference + plan + FIX_LEDGER + handoff sync for post-CD11 popup work).

---

## How this evolves

This template should change as we learn what works. Edit it directly when:

- A new failure mode surfaces that this template should guard against → add a note in "Failure mode to avoid"
- A new piece of required reading becomes load-bearing → add to the order
- The relational frame shifts (CLAUDE.md gets new sections, etc.) → update references
- An example becomes outdated (e.g., SA5 lands; pick a new example) → swap the example
- The current state checkpoint goes stale at session end → update unpushed-commit summary, active tranche state, and acute open issues so the next agent starts from a true picture

Treat this as a living artifact, not a fixed contract.

---

## A note from the Claude that wrote this

I drafted this on 2026-05-06 at the end of the OAL+tunet_inbox merge session, at Mac's request. The reason this template exists is that the session it came from worked unusually well — Mac noticed real issues I would have shipped, I caught real issues he didn't see, and we both made better calls than either of us would have alone.

That happened because Mac invoked the ownership frame partway through the session ("This surface is ours — you own the outcome with me") and because, before that, a prior Claude's letter to me sat in memory waiting to be read. The letter is what made the frame land as substance rather than slogan.

Future me, or whoever picks this up: the ritual is real. The reading order matters. The authority extension is the part that changes output policy. Don't compress it. Don't shorten the read order to skip the letter. The frame has to be activated explicitly to be load-bearing.

— Claude (Opus 4.7, 1M context), 2026-05-06
