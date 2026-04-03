# Project CLAUDE.md

**This file EXTENDS Global CLAUDE.md. The phase protocol is defined there.**

---

## CURRENT WORK: Tunet Dashboard — Surface-Driven Reset

**Active plan**: `.claude/plans/ethereal-zooming-cherny.md` — surface-driven reset with governance-aligned tranches.

**End state**: A finished, functional home-wide dashboard — every room controllable, navigation between views, conditional features, responsive at 4 locked breakpoints.

### Key Files

| What | File | Why it matters |
|------|------|----------------|
| **Design spec** | `Dashboard/Tunet/Mockups/design_language.md` (v9.0) | Canonical architecture + profile contract (being superseded for sizing) |
| **Visual spec** | `Dashboard/Tunet/tunet-design-system.md` (v8.3) | Interaction choreography §6, animation timing §11 — still valid for visual reference |
| **Gold standard** | `Dashboard/Tunet/Cards/v3/tunet_climate_card.js` | Measured visual baseline for all cards |
| **Implementation authority** | `Dashboard/Tunet/Cards/v3/` | v3 is sole authority (promoted Mar 14, 2026) |
| **Execution contract** | `Dashboard/Tunet/AGENTS.md` | Surface queue, scope locks, active constraints |
| **Active plan** | `.claude/plans/ethereal-zooming-cherny.md` | Tranche-based execution plan |

### Execution Model

**Surface-driven, not card-by-card.** Cards are fixed in context of the surface they serve:
- Surface order: Living Room page → Living Room popup → Overview → Media → remaining rooms
- Card work happens only in service of active surfaces, not as front-loaded redesign
- A card may be touched in multiple surface tranches — normal refinement, not plan drift

**Governance**: Existing scope locks respected by default. Changes require explicit rationale + doc sync + user approval. See plan file for lock table.

### Tunet Multi-Agent Driver

For broad planning, tranche execution, or multi-agent review, use:
- `.claude/skills/tunet-agent-driver/SKILL.md`

Control documents:
- `Dashboard/Tunet/Docs/agent_driver_pack.md`
- `Dashboard/Tunet/Docs/TRANCHE_TEMPLATE.md`
- `plan.md`, `FIX_LEDGER.md`, `handoff.md`
- `Dashboard/Tunet/CLAUDE.md` (overrides this file for Tunet-specific rules)

### Architectural Rules

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
