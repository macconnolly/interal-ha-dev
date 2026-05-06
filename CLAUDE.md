# Project CLAUDE.md

**This file EXTENDS Global CLAUDE.md. The phase protocol is defined there.**

This file should read similarly to the root `AGENTS.md` for local execution work.
For Tunet tasks, it is a continuity layer. The scoped execution authority remains:
- `Dashboard/Tunet/AGENTS.md`

---

## Root Rules

- Use the single project worktree:
  - `/home/mac/HA/implementation_10`
- Do not create or use additional Tunet worktrees unless explicitly requested.
- Do not run destructive git operations unless explicitly requested.

## Pre-Commit User-Perspective Review (Non-Negotiable)

Mandatory mechanical guardrails for any commit that touches user-visible UI (Tunet cards, dashboards, popups, themes, OAL-affecting visual surfaces). These rules apply project-wide. Created 2026-05-05 after a session where popup work was repeatedly declared "fixed" while shipping visible defects (black play button on white, fixed-height popup with empty space at one state and clipped content at another, generic titles that didn't reflect content).

The pattern this section prevents: technical signals (`npm test passes`, harness probes pass) substituting for user signals; "you're right, here's what's broken" capitulation cycles; third-party defects rationalized as "documented limitations"; silent best-effort that ships visible defects.

These rules are mechanical, not advisory — advisory rules drift into optimism. Codex sees the same rules in `Dashboard/Tunet/AGENTS.md` §6A.

### M1) User-perspective screenshot review block — required before commit

After any UI change, capture screenshots at minimum two breakpoints (mobile 390×844 + one of tablet/laptop/desktop) and read each one back into the conversation context (not just confirm capture succeeded). Then output this block in the conversation BEFORE the commit:

```
═══════════════════════════════════════════════════════════════
USER-PERSPECTIVE REVIEW
═══════════════════════════════════════════════════════════════
Breakpoints captured: [list]
Screenshots read back into context: [list paths]

DEFECTS VISIBLE IN CAPTURED SCREENSHOTS:
1. [defect] — at [breakpoint] — [blocker / visible / minor]
... or, if none:
N. Scanned for typography hierarchy, spacing rhythm, content
   semantics, truncation, touch targets, alignment, density,
   visual balance — no defect found because [specific reasoning].

WOULD I BE HAPPY USING THIS ON MY PHONE IN MY LIVING ROOM?
└─ Yes/No: [explicit answer with reasoning]

Blockers MUST be resolved before commit.
═══════════════════════════════════════════════════════════════
```

The user can see and challenge any claim. Reading screenshots back into context (vs. just capturing them) is the load-bearing step — captured-but-unread screenshots are how visible defects survived past harnesses.

### M2) Banned completion phrases without same-turn artifact

These phrases are banned unless paired with a user-visible artifact in the same response (screenshot read back, user-confirmed manual test, or the user's explicit go-ahead):

- "verified" / "tested" / "validated"
- "should work" / "should be fine"
- "is fixed" / "looks good"
- "deployed and ready" / "complete" / "done"

When tempted to write any of these, treat it as a stop trigger and produce the artifact first. "Should" is the single highest-leverage optimism marker — when you write it, stop and verify.

### M3) User holds the "done" stamp; agent never marks done autonomously

Agent reports: `"Implemented X. Evidence: [artifacts]. Awaiting your review."`
Agent does NOT autonomously write `"complete" / "done" / "verified"` in commits, summaries, governance docs, or status reports. Only the user marks done. This single rule eliminates the largest source of optimism drift because the agent stops mistaking "I did the work" for "the work is correct."

Tranche-closure language (e.g. `CD11 — CLOSED`) requires explicit user confirmation in the same session. Do not write `CLOSED` autonomously.

### M4) Pre-commit defect inventory — current state, not change delta

Before any UI commit, list defects that exist in the CURRENT state of the surface — not what was fixed in this commit. Triage as:

- `blocker` — must fix before commit
- `visible` — acceptable now, recorded in `Dashboard/Tunet/Docs/visual_defect_ledger.md` for follow-up
- `minor` — acceptable, recorded with lower priority

Anything labeled `blocker` MUST be resolved before the commit. Victorious accounting of what was fixed without honest accounting of what remains broken is the failure mode this rule prevents.

### M5) Third-party visual primitives are owned defects

If the user sees a defect, it is the project's defect, regardless of whose code rendered the pixels. `"Documented as third-party limitation"` is NOT an acceptable disposition for a visible defect. Acceptable resolutions:

1. Fork at source and fix
2. Replace with native implementation
3. Remove from the affected surface

Never (4) document and accept. The phrase `"third-party limitation"` is the cognitive escape hatch that lets visible defects ship with a clean conscience — refuse it.

### M6) Asymmetric uncertainty — fail closed for UI

Default disposition for UI work: `"broken until proven otherwise with user-visible evidence."` False-negative cost (claim done when broken) >> false-positive cost (claim broken when fine). When uncertain, escalate to the user; do not push through silently.

### M7) Definition-of-done in the tranche, evidence-bound

Each tranche must define DoD as concrete evidence-bound criteria. Banned phrasing: `"polished and complete"` / `"looks good"` / `"acceptable quality"`. Required phrasing: screenshot at named breakpoints + defect inventory + user confirmation. If the DoD cannot be made evidence-bound, the tranche is not ready to start.

### Companion: Pivot Signal

If you cannot reach the user-visible quality bar without something you don't have (the user's eye in the loop, a different tool, a different architectural approach, a different scope), say so explicitly. The user has a standing offer to pivot rather than push through. See memory entry `feedback_pivot_signal.md`. Silent best-effort that ships defects is the failure mode this section exists to prevent.

## Scope Routing

- If work touches `Dashboard/Tunet/**`, use:
  - `Dashboard/Tunet/AGENTS.md` as the execution contract
  - `Dashboard/Tunet/CLAUDE.md` as Tunet-specific continuity/context
- For non-Tunet paths, use prompt/developer/system instructions plus local file context.

## Current Tunet Work

- **Active execution plan**: `~/.claude/plans/flickering-herding-wolf.md` — sole authority for Tunet execution (`CD0–CD12`)
- **Active detailed CD11 plan**: `~/.claude/plans/synthetic-dazzling-oasis.md` — status-specific implementation authority under the CD0-CD12 master plan
- **Current tranche**: `CD11 — Status Multi-Mode Design and Runtime Pass` (narrow, status-only redesign/runtime pass; `CD10` nav verify intentionally deferred until room/surface composition is more settled)
- **Previous tranches**:
- `CD9` — Media Bespoke Pass (completed Apr 6, 2026; selected-target audio routing, dropdown parity, visible speaker-tile semantics, speaker-grid phone fallback, and album-art resilience accepted)
  - `CD8` — Environment Bespoke Pass (completed Apr 6, 2026; weather phone-density redesign accepted, climate/sensor narrowed healthy)
  - `CD7` — Rooms Bespoke Pass (completed Apr 6, 2026; card-level closeout only, room-page layout undecided)
  - `CD6` — Lighting Bespoke Pass (completed Apr 4, 2026)
  - `CD5` — Utility Strip Bespoke Pass (completed Apr 4, 2026)
  - `CD4` — Shared Sizing And Sections Adoption (completed Apr 4, 2026)
  - `CD3` — Shared Semantics Adoption (completed Apr 3, 2026)
  - `CD2` — Shared Interaction Adoption (completed Apr 3, 2026)
  - `CD1` — Configuration Clarity And Editor Policy (completed Apr 3, 2026)
  - `CD0` — Build Architecture And Rehab Lab (completed Apr 3, 2026)

Current priority:
- rehabilitate the Tunet v3 card suite first
- keep docs and backlog authority normalized
- execute `CD11` from `~/.claude/plans/synthetic-dazzling-oasis.md`
- keep `CD10` nav desktop coexistence/offset cleanup deferred until the rooms/surface composition direction is more settled
- resume surface assembly only after the card families are stable enough for deliberate composition

## Tunet Authority Snapshot

- `Dashboard/Tunet/Cards/v3/` = sole implementation authority
- `Dashboard/Tunet/Docs/cards_reference.md` = normative per-card contract
- `Dashboard/Tunet/Docs/visual_defect_ledger.md` = normalized runtime truth + owning-tranche backlog
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` = accepted CD4 card-level sizing authority, still provisional for CD12 surface assembly
- `plan.md`, `FIX_LEDGER.md`, `handoff.md` = session-level control docs that must stay synced after meaningful change

## Tunet Build / Validation Shortcuts

- `npm run tunet:build` — esbuild 13 cards to `Dashboard/Tunet/Cards/v3/dist/`
- `npm run tunet:deploy:lab` — build + SCP to HA server
- `npm test` — vitest suite
- Lab dashboard:
  - `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab`

If this root file and the Tunet-scoped file differ on Tunet behavior, follow the scoped file and the scoped `AGENTS.md`.

### Tunet Multi-Agent Driver

For broad planning, tranche execution, or multi-agent review, use:
- `.claude/skills/tunet-agent-driver/SKILL.md`

Control documents:
- `Dashboard/Tunet/Docs/agent_driver_pack.md`
- `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md`
- `plan.md`, `FIX_LEDGER.md`, `handoff.md`
- `Dashboard/Tunet/CLAUDE.md` (overrides this file for Tunet-specific rules)

### HA Instance Organizer

For discovery-first audit and safe cleanup of HA organizational metadata, use:
- `.claude/skills/ha-instance-organizer/SKILL.md`
- `docs/ha_instance_organizer_runbook.md` (full operational runbook)

Invoke with `/ha-instance-organizer`. Covers areas, floors, zones, labels, categories, aliases, groups, visibility, helpers, room aggregates, device-entity inheritance, and dead or orphaned entities.

### Architectural Rules

- For Tunet work, root guidance defers to `Dashboard/Tunet/AGENTS.md`
- Do not create or use additional Tunet worktrees unless explicitly requested
- Real Home Assistant Sections dashboard — no layout hacks
- Do not force vertical sizing unless required; prefer intrinsic height
- Persistent nav is dashboard chrome, not content
- Popups via Browser Mod (locked); stay minimal and high-utility
- Sections sizing: reason page → section → card (not viewport/theme shortcuts)
- Validation breakpoints: 390×844, 768×1024, 1024×1366, 1440×900
- Documentation before code — each tranche starts with doc updates

### User Preference
Dark blue glass variant `rgba(30,41,59,0.65)` in dark mode. If preference and spec diverge, preserve both and make conflict explicit.

---

# OAL (Optimized Adaptive Lighting) - v13 Production Architecture

Global gates required for any OAL work:
- First output must be the Global Context Loaded block
- No solutioning until user says `Proceed to analysis`
- All injection slots in Global templates must be filled from this file

---

## OAL PRINCIPLES

Global principles apply first. These extend them for OAL:

```
1. USER EXPERIENCE IS THE METRIC
   WHAT: Success = user never touches a light switch
   HOW: Ask "will user notice this, or never think about lights?"
   ANTI-PATTERN: Optimizing for technical elegance over invisibility
   SYMPTOM: User manually adjusts lights to compensate
   EXTENDS: Global Principle 2 (INTENT > CODE)

2. INVARIANTS ARE LAW
   WHAT: 7 system invariants must NEVER be violated
   HOW: Check invariants table before any change; High risk = stop
   ANTI-PATTERN: "It's just a small change" - skipping invariant check
   SYMPTOM: Cascade failures across zones
   EXTENDS: Global Protocol 2 (Impact Analysis)

3. CHANGES CASCADE
   WHAT: 4500-line file; "simple" changes touch 5+ places
   HOW: Search for entity names in file; trace all references
   ANTI-PATTERN: "One-line fix" in a coupled system
   SYMPTOM: Fix works but breaks downstream automation
   EXTENDS: Global Principle 5 (ASK > ASSUME)

4. GOVEE IS WEIRD
   WHAT: 2700-6500K actual range, NOT 2000-9000K reported
   HOW: Always clamp: max(2700, min(6500, color_temp))
   ANTI-PATTERN: Trusting reported color temp ranges
   SYMPTOM: Purple/pink color on Govee devices
   EXTENDS: Global Principle 1 (REASONING > CONCLUSIONS)

5. FIND THE WHY
   WHAT: OAL parameters exist for tested reasons
   HOW: Use timeline(anchor=id) on OAL decisions in memory
   ANTI-PATTERN: Changing values without understanding history
   SYMPTOM: Regressions of previously solved problems
   EXTENDS: Global Principle 1 (REASONING > CONCLUSIONS)
```

---

## SYSTEM INVARIANTS

**These are STOP conditions. Violation = redesign required.**

| # | Invariant | Violation Symptom |
|---|-----------|-------------------|
| 1 | Brightness bounds: `zone_min <= actual <= zone_max` | Lights at 0% or 100% unexpectedly |
| 2 | Govee color temp: `2700K <= actual <= 6500K` | Purple/pink color on Govee devices |
| 3 | Manual auto-reset: Returns to adaptive after timeout | Permanent manual override |
| 4 | Force modes override ALL: Sleep/movie bypass calculations | Sleep mode ignored |
| 5 | Environmental is ADDITIVE: Offset added to baseline, never absolute | Sudden brightness jumps |
| 6 | ZEN32 LED = system state: LEDs reflect actual, not target | LED shows wrong mode |
| 7 | No calculation during pause: System pause freezes all | Changes during pause |

---

## INJECTION DATA FOR GLOBAL TEMPLATES

**These are DISCOVERY requirements, not checklists. Report what you find.**

### OAL-SPECIFIC CONTEXT (inject into CONTEXT DELIVERABLE)

```
OAL-SPECIFIC CONTEXT
├─ Memory search included query: "OAL [topic]"
├─ File read: packages/OAL_lighting_control_package.yaml
│  └─ Lines read: [X-Y] containing [component being changed]
└─ Live state checked:
   • input_select.oal_current_config: [value]
   • input_boolean.oal_system_paused: [value]
   • input_select.oal_active_configuration: [value] (Sleep = sleep mode active)
```

### OAL DEPENDENCIES / UPSTREAM (inject into ANALYSIS DELIVERABLE)

**Do not use a static list. Discover by searching the file.**

```
OAL UPSTREAM (discovered)
├─ Search performed: grep -n "[component]" OAL_lighting_control_package.yaml
├─ Component found at lines: [list line numbers]
└─ Entities that feed this component:
   • [entity] (line [N]): [how it feeds this]
   • [entity] (line [N]): [how it feeds this]
   • [entity] (line [N]): [how it feeds this]
```

### OAL DEPENDENCIES / DOWNSTREAM (inject into ANALYSIS DELIVERABLE)

**Do not use a static list. Discover by searching the file.**

```
OAL DOWNSTREAM (discovered)
├─ Search performed: grep -n "[output of component]" OAL_lighting_control_package.yaml
├─ Output consumed at lines: [list line numbers]
└─ Automations/entities that use this output:
   • [automation/entity] (line [N]): [how it uses this]
   • [automation/entity] (line [N]): [how it uses this]
   • [automation/entity] (line [N]): [how it uses this]
```

### INVARIANT RISK ASSESSMENT (inject into ANALYSIS DELIVERABLE)

**Assess each invariant against the specific change being made.**

```
INVARIANT RISK ASSESSMENT
├─ #1 Brightness bounds:      [None/Low/High] - [specific reason for THIS change]
├─ #2 Govee color temp:       [None/Low/High] - [specific reason for THIS change]
├─ #3 Manual auto-reset:      [None/Low/High] - [specific reason for THIS change]
├─ #4 Force modes override:   [None/Low/High] - [specific reason for THIS change]
├─ #5 Environmental additive: [None/Low/High] - [specific reason for THIS change]
├─ #6 ZEN32 LED sync:         [None/Low/High] - [specific reason for THIS change]
└─ #7 Pause freezes system:   [None/Low/High] - [specific reason for THIS change]
```

### OAL VALIDATION (inject into DESIGN DELIVERABLE)

**Derive criteria from the actual change, not a static list.**

```
OAL VALIDATION (derived from this change)
├─ [ ] [Criterion specific to what's being modified]
├─ [ ] [Observable behavior that proves success]
├─ [ ] [Regression check for discovered downstream dependents]
└─ [ ] [Invariant verification method if any rated Low+]
```

**Common validation patterns (use when applicable):**
- Zone changes: Verify all affected zones receive correct values
- Timing changes: Verify parallel execution < 200ms
- Priority changes: Verify force modes still take priority
- Calculation changes: Verify bounds clamping order
- Govee-touching changes: Verify output within 2700-6500K
- ZEN32-touching changes: Verify LED matches system state
- Any change: Verify no effect during pause state

### PROJECT-SPECIFIC STOP TRIGGERS (inject into STOP BLOCK)

```
OAL STOP TRIGGERS
├─ Discovered downstream dependents > 3 and not all examined
├─ Any invariant rated High
├─ Govee color temp calculation could produce < 2700K
├─ ZEN32 LED state could desync from system state
├─ Offset sum could exceed brightness bounds
└─ Force mode priority could be bypassed
```

---

# OAL REFERENCE MATERIAL

*Lookup tables to aid discovery. Do not substitute for actual file search.*

---

## System Intent

**User Experience Goal**: User should NEVER need to touch a light switch

| Capability | Description |
|------------|-------------|
| Anticipation | Lights predict needs based on time, weather, activity |
| Self-Healing | Manual adjustments are temporary and auto-reset |
| Tactile Feedback | ZEN32 provides immediate physical response |
| Seamless Modes | Sleep/movie/focus activate with single gesture |
| Invisible Operation | Success = user doesn't think about lighting |

---

## Architecture

```
                     USER EXPERIENCE
        "Lights just work - I never touch switches"
┌─────────────────────────────────────────────────────┐
│  ZEN32 Physical  │  Dashboard UI  │  Voice Assistant │
└────────┬─────────┴───────┬────────┴────────┬────────┘
         └─────────────────┼─────────────────┘
                           ▼
┌─────────────────────────────────────────────────────┐
│                 OAL ORCHESTRATION                    │
│  Environment │ Sunset Logic │ Manual Override        │
│                      ↓                               │
│               CORE ENGINE                            │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│            ADAPTIVE LIGHTING (HACS)                  │
└──────────────────────┬──────────────────────────────┘
                       ▼
┌─────────────────────────────────────────────────────┐
│ main_living │ kitchen │ bedroom │ accent │ column   │
└─────────────────────────────────────────────────────┘
```

---

## Brightness Pipeline

*Use this to understand data flow, then verify against actual file.*

```
[1. CONFIG BASELINE]
input_select.oal_current_config → configuration_manager
    → baseline_brightness (40-80%)

[2. ENVIRONMENTAL OFFSET]
lux + weather + sun → environmental_manager
    → env_offset (-20 to +30)

[3. SUNSET OFFSET]
time_pattern + sun.sun (after sunset) → sunset_logic
    → sunset_offset (-40 to 0)

[4. MANUAL OFFSET]
ZEN32 button → script.oal_manual_brightness_up/down
    → input_number.oal_manual_brightness_offset

[5. CORE CALCULATION]
FINAL = clamp(baseline + env + sunset + manual, zone_min, zone_max) * sensitivity

[6. APPLICATION]
adaptive_lighting.change_switch_settings (6 zones parallel)
```

---

## Entity Reference

*Starting points for grep searches. Not exhaustive - always verify in file.*

| Entity | Likely Consumers | Search Hint |
|--------|------------------|-------------|
| `input_select.oal_current_config` | configuration_manager | grep "oal_current_config" |
| `input_number.oal_manual_brightness_offset` | core_engine | grep "manual_brightness" |
| `input_number.oal_brightness_environmental_offset` | core_engine | grep "environmental_offset" |
| `input_number.oal_sunset_brightness_offset` | core_engine | grep "sunset.*offset" |
| `input_select.oal_active_configuration` | core_engine, config_manager, zen32 | grep "oal_active_configuration" |
| `group.oal_sleep_mode_switches` | core_engine, config_manager | grep "oal_sleep_mode_switches" |
| `input_boolean.oal_movie_mode_active` | movie_handler | grep "movie_mode" |
| `input_boolean.oal_system_paused` | all automations | grep "system_paused" |

---

## ZEN32 Integration Map

| Button | Gesture | Entity Modified | Search Hint |
|--------|---------|-----------------|-------------|
| B2 (up) | 1x | `oal_manual_brightness_offset` (+10) | grep "manual_brightness_up" |
| B4 (down) | 1x | `oal_manual_brightness_offset` (-10) | grep "manual_brightness_down" |
| B5 (relay) | 1x | `oal_current_config` (cycle) | grep "config.*cycle" |
| B5 | 2x | `oal_manual_brightness_offset` (reset) | grep "brightness.*reset" |
| B5 | 3x | `oal_active_configuration` (Sleep/Adaptive toggle) | grep "zen32_toggle_sleep_mode" |

**LED Dependencies:**
- B5 LED ← `oal_active_configuration` == Sleep (blue) OR config (color)
- B1-B4 LEDs ← `zen32_current_mode`

---

## Common Failure Patterns

*Use to inform validation criteria.*

| Pattern | Symptom | Root Cause | Validation Check |
|---------|---------|------------|------------------|
| Offset overflow | Lights at 0% or 100% | Offsets sum beyond bounds | Sum offsets, verify < zone_max |
| Govee purple | Purple/pink color | Color temp < 2700K | Trace color_temp to output |
| Stuck manual | Override never resets | Timeout automation broken | Trigger override, wait, verify reset |
| LED desync | Button shows wrong mode | State sync race | Change state, verify LED within 500ms |
| Cascade delay | 10+ second response | Sequential not parallel | Check for `parallel:` in automation |
| Sleep ignored | Sleep has no effect | Force check missing | Enable sleep, verify all zones respond |

---

## Key Automations

*Search targets for dependency discovery.*

| ID | Purpose | Search Pattern |
|----|---------|----------------|
| `oal_core_adjustment_engine_v13` | Master calculation | grep "core_adjustment_engine" |
| `oal_configuration_manager_v13` | Scene transitions | grep "configuration_manager" |
| `oal_sunset_logic_unified_v13` | Gaussian sunset | grep "sunset_logic" |
| `oal_environmental_manager_v13` | Env adaptation | grep "environmental_manager" |
| `oal_movie_mode_handler_v13` | Media dimming | grep "movie_mode_handler" |
| `oal_isolated_override_manager_v13` | Manual tracking | grep "override_manager" |

---

## Zone Configurations

| Zone | Lights | Color Temp | Sensitivity | Govee? |
|------|--------|------------|-------------|--------|
| main_living | 6 | 2250-2950K | 1.0 | No |
| kitchen_island | 1 | 2000-4000K | 1.0 | No |
| bedroom_primary | 2 | 2700K fixed | 0.5 | **Yes** |
| accent_spots | 2 | 2000-6500K | 0.8 | No |
| recessed_ceiling | 2 | 2700K fixed | 0.6 | No |
| column_lights | 2 | 2700-6500K | 0.7 | **Yes** |

---

## Debug Commands

```python
# System status
ha_get_state(entity_id="sensor.oal_system_status")

# Force recalculation
ha_call_service("automation", "trigger",
    entity_id="automation.oal_core_adjustment_engine_v13")

# Recent traces
ha_get_automation_traces(
    automation_id="automation.oal_core_adjustment_engine_v13",
    limit=5)
```

---

## Cross-Package Dependencies

| Package | Integration Point | Search Hint |
|---------|-------------------|-------------|
| `zen32_modal_controller_package.yaml` | Button events, LED states | grep in both files |
| `sonos_package.yaml` | Volume mode, media state | grep "sonos\|media_player" |
| Dashboard files | Status display, controls | Check dashboard yaml |

**When modifying OAL, search for cross-package references:**
1. `grep -l "[entity]" packages/*.yaml`
2. `grep -l "[entity]" dashboards/*.yaml`
