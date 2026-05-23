# Tunet ZEN32 Redesign — Plan C

**Portfolio**: see `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
**Owner**: Mac, executed via `/claude-mem:do`
**Tranche tag**: β-plumbing / ZEN32 controller
**Depends on**: Plan B Phase B3 complete (new OAL mode landed)
**Estimated effort**: 2-3 hours

## Intent

Redesign the ZEN32 button interaction model to match Mac's actually-used scenes:

Mac's exact words: "Design a better interaction model to toggle through scenes with the zen 32 (we really use the main brightness one, the one where everything is slightly dimmer and the kitchen main lights, and entry main lights are off, everything is slightly dimmer, and that's all we want to toggle through)."

The 3 scenes (interpreted):
1. **"Main brightness"** = Adaptive (default daytime baseline)
2. **"Everything slightly dimmer, kitchen + entry main off"** = the NEW "Dim Ambient Plus" mode from Plan B3
3. **"Everything slightly dimmer"** = Dim Ambient (existing)

Goal: ZEN32's primary use is cycling between just these 3. Other modes (Full Bright, Warm Ambient, TV Mode, TV Bridge, Sleep, Manual) remain available but NOT in the default cycle.

## Required reading

1. `~/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
2. `/home/mac/HA/implementation_10/CLAUDE.md` — ZEN32 Integration Map section
3. `/home/mac/HA/implementation_10/packages/zen32_modal_controller_package.yaml`
4. `/home/mac/HA/implementation_10/docs/zen32_led_state_machine_reference.md`
5. Plan B Phase B3 outcome (the new mode name + entity targets)

## Current state (per discovery)

ZEN32 has 3 control modes (brightness / volume / warmth) × 5 buttons:
- B1 LIGHT: 1x cycles between brightness/warmth (within mode); B2: brightness up; B3 VOLUME: volume+ (when in volume mode); B4: brightness down; B5 BIG: 1x toggle lights, hold reset, 2x **cycle OAL config**, 3x sleep toggle

The 2x B5 → `script.zen32_cycle_oal_config` currently cycles through ALL 8 OAL configs:
- Adaptive → Full Bright → Dim Ambient → Warm Ambient → TV Mode → TV Bridge → Sleep → Manual → Adaptive

Mac wants this reduced to the 3-scene cycle.

## Phase C1: 3-scene cycle implementation

**Steps**:

1. **CONTEXT phase output**:
   - File: `packages/zen32_modal_controller_package.yaml:710` (the `zen32_cycle_oal_config` script).
   - Memory: `feedback_pivot_signal.md`, ZEN32-related observations.
   - Live state: current control mode, OAL active config, ZEN32 LED state.

2. **ANALYSIS phase**:
   - **Upstream**: B5 2x → script.zen32_cycle_oal_config → input_select.oal_active_configuration
   - **Downstream**: configuration_manager automation → per-zone brightness; status card mode chip; ZEN32 big-button LED state machine
   - **Invariant risk**: #4 (force modes) Low — only changes which configs are in the cycle list; #6 (LED) Medium — LED state machine may have hardcoded references to all 8 configs

3. **DESIGN phase**:
   - Edit `zen32_cycle_oal_config` script (line 710):
     - Restrict `allowed_configs` to: `["Adaptive", "Dim Ambient Plus", "Dim Ambient"]`
     - On cycle, advance to next in this restricted list
   - Other OAL configs (Full Bright, Warm Ambient, TV Mode, TV Bridge, Sleep, Manual) remain available via:
     - Dashboard mode chip
     - Voice commands
     - HomeKit scenes (Plan D)
     - Direct service call
   - But NOT via the ZEN32 B5 2x cycle

4. **IMPLEMENTATION**:
   - Edit `packages/zen32_modal_controller_package.yaml` cycle script
   - Deploy via `deploy_packages.sh`

5. **Verification**:
   - From Adaptive: B5 2x → Dim Ambient Plus
   - From Dim Ambient Plus: B5 2x → Dim Ambient
   - From Dim Ambient: B5 2x → Adaptive
   - From any other config (e.g., Full Bright set via dashboard): B5 2x → Adaptive (re-entry to the 3-cycle from outside)

**Commit**: Auto via `deploy_packages.sh` + follow-up `feat(zen32): restrict B5 2x cycle to 3 actually-used scenes (Adaptive, Dim Ambient Plus, Dim Ambient)`.

---

## Phase C2: ZEN32 LED state machine update

**Goal**: Big-button LED should reflect the current scene in the new cycle, not just generic "non-adaptive" green for everything-not-Adaptive.

**Current LED priority** (per `docs/zen32_led_state_machine_reference.md`):
1. Sleep Mode → blue / low
2. Manual override → red / bright
3. Non-Adaptive config (any of Full Bright, Dim Ambient, Warm Ambient, TV Mode) → green / medium
4. Adaptive clean → white / medium
5. Lights OFF → off

**Steps**:

1. Design new LED differentiation for the 3-scene cycle:
   - **Adaptive** → white (existing)
   - **Dim Ambient Plus** → amber / medium (NEW — visually distinct from green)
   - **Dim Ambient** → green / medium (existing for "non-adaptive")
   - Other configs (TV Mode, Sleep, etc.) → existing priority order (TV mode might use purple, sleep blue, etc.)

2. Edit `automation.zen32_led_state_machine` and `automation.zen32_big_button_led_state_sync`:
   - Add explicit branch for `input_select.oal_active_configuration == "Dim Ambient Plus"` → amber
   - Update test cases in the test automation `automation.zen32_led_sequencer_manual_test`

3. Update `docs/zen32_led_state_machine_reference.md` to reflect new colors.

4. Deploy + verify physically — Mac confirms LED matches state.

**Verification**:
- Each of the 3 cycle scenes has a visually distinct LED.
- Mac confirms by cycling and watching the button.

**Commit**: `feat(zen32): LED state machine differentiates the 3 scene-cycle modes`.

---

## Phase C3: B5 hold for "wake up" (optional polish)

**Goal**: B5 hold currently calls `oal_reset_soft`. Mac may want to repurpose. ASK MAC.

If Mac wants:
- B5 hold = full brightness (force daytime-like)
- B5 triple-tap = sleep toggle (current behavior)
- Or some other variation

Skip if Mac doesn't want changes here.

---

## Verification (Plan C overall)

- B5 2x cycles only through Adaptive, Dim Ambient Plus, Dim Ambient.
- LED states clearly differentiate the 3 modes.
- Other OAL modes remain accessible via dashboard / HomeKit / voice.
- Mac confirms the daily-use UX feels right.

## Out of scope

- Adding the modes to HomeKit (Plan D).
- Any new OAL mode beyond Plan B3.
- Changes to volume / warmth modes — keep as-is.
