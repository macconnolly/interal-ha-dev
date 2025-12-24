# ZEN32 Scene Controller UX Design Plan

## Status: Design Phase - Awaiting User Input

## Context

### Hardware: Zooz ZEN32
- 5 physical buttons: 1 large center + 4 small corners
- Each button: 7 LED colors, 3 brightness levels
- Each button: 7 interactions (1x-5x tap, hold, release)
- **Total: 35 programmable actions**
- Buttons will be **engraved** - must be intuitive for guests

### Current Implementation (Lines 1858-1950)
- Button 1: Cycle lighting presets
- Button 2: Brighter / Cooler (hold)
- Button 3: Reset / Global Reset (hold)
- Button 4: Dimmer / Warmer (hold)
- Button 5 (Big): Toggle all lights

### Available Systems to Control
1. **OAL Lighting** - 6 zones, 7 presets, brightness/warmth
2. **Sonos Audio** - 5 rooms, volume, play/pause, grouping
3. **Scenes/Modes** - Movie mode, Sleep mode, TV mode

---

## Design Considerations

### Primary Users
1. **Residents** - Full feature access, muscle memory
2. **Guests** - Zero context, engraving + LED must be self-explanatory

### Engraving Constraints
- Icons must be universal (light bulb, music note, +, -, etc.)
- Text should be minimal (1-2 words max)
- Cannot change engravings after creation

### LED Feedback Strategy
- Color indicates **what you're controlling**
- Brightness indicates **on/off state**
- Nighttime auto-dim for bedroom friendliness

---

## RECOMMENDED DESIGN: Modal Controller with LED State Indication

### Correct Physical Layout
```
        ┌─────────────────────────┐
        │                         │
        │   ┌─────────────────┐   │
        │   │    💡           │   │
        │   │   LIGHTS        │   │  [5] Big button (centered above)
        │   │              •  │   │  LED: White=normal, Red=special mode
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡    • │ │ •    +  ││  [1] LIGHT    [2] UP
        │  │ LIGHT   │ │   UP    ││  Mode select   Increase
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵    • │ │ •    -  ││  [3] MUSIC    [4] DOWN
        │  │ MUSIC   │ │  DOWN   ││  Mode+Play    Decrease
        │  └─────────┘ └─────────┘│
        │                         │
        └─────────────────────────┘
```

### Design Philosophy
- **Left column** = Mode SELECTORS (Light vs Music)
- **Right column** = Context-sensitive +/- controls
- **Big button** = Master light toggle
- **MUSIC button doubles as PLAY/PAUSE** - Solves "why control volume if nothing plays?"
- **LED brightness indicates mode** - Bright = controlling, Dim = background state

### Engraving Specifications
| Button | Position | Icon | Text |
|--------|----------|------|------|
| [5] Big | Center-Top | 💡 Lightbulb | LIGHTS |
| [1] | Top-Left | 💡 Lightbulb | LIGHT |
| [2] | Top-Right | + (plus) | UP |
| [3] | Bottom-Left | 🎵 Music note | MUSIC |
| [4] | Bottom-Right | - (minus) | DOWN |

### LED Feedback Strategy (Final Design)

**Core Principle:** LED color shows MODE. All buttons in active mode share same color.

**LIGHT MODE (Default):**
```
        ┌─────────────────────────┐
        │   ┌─────────────────┐   │
        │   │    💡       ○   │   │  [5] BIG: White (lights on) / Off (lights off)
        │   │   LIGHTS        │   │
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡  🟡  │ │  🟡  +  ││  [1] LIGHT: YELLOW
        │  │ LIGHT   │ │   UP    ││  [2] UP: YELLOW
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵  ⚫  │ │  🟡  -  ││  [3] MUSIC: OFF
        │  │ MUSIC   │ │  DOWN   ││  [4] DOWN: YELLOW
        │  └─────────┘ └─────────┘│
        └─────────────────────────┘
```

**MUSIC MODE (After pressing MUSIC):**
```
        ┌─────────────────────────┐
        │   ┌─────────────────┐   │
        │   │    💡       ○   │   │  [5] BIG: White (lights on) / Off (lights off)
        │   │   LIGHTS        │   │
        │   └─────────────────┘   │
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 💡  ⚫  │ │  🔵  +  ││  [1] LIGHT: OFF
        │  │ LIGHT   │ │   UP    ││  [2] UP: BLUE
        │  └─────────┘ └─────────┘│
        │                         │
        │  ┌─────────┐ ┌─────────┐│
        │  │ 🎵  🔵  │ │  🔵  -  ││  [3] MUSIC: BLUE
        │  │ MUSIC   │ │  DOWN   ││  [4] DOWN: BLUE
        │  └─────────┘ └─────────┘│
        └─────────────────────────┘
```

**LED State Table:**
| Button | LIGHT Mode | MUSIC Mode |
|--------|------------|------------|
| [1] LIGHT | Yellow BRIGHT | OFF |
| [2] UP | Yellow BRIGHT | Blue BRIGHT |
| [3] MUSIC | OFF | Blue BRIGHT |
| [4] DOWN | Yellow BRIGHT | Blue BRIGHT |
| [5] BIG | White if lights on, Red if Movie/Sleep | Same |

**Mode Switch Animation:**
- Press MUSIC: MUSIC LED blinks blue 2x (150ms) → all LEDs shift to blue
- Press LIGHT: LIGHT LED blinks yellow 2x (150ms) → all LEDs shift to yellow

**Mode Timeout: 60 seconds**
- After 60s of no button presses, mode silently resets to LIGHT
- LEDs smoothly transition from blue → yellow
- Music continues playing (only control context changes)

**UP/DOWN Behavior When System is OFF:**
- UP in LIGHT mode (lights off): Turns lights ON, then increases brightness
- UP in MUSIC mode (music stopped): Starts playback, then increases volume
- "UP = I want more" intuition works even when system is off

**Guest Interpretation:**
- "All yellow = I'm controlling lights"
- "All blue = I'm controlling music"
- "Big button always toggles lights"
- "Press UP for more, DOWN for less"

### Complete Action Mapping

#### Mode Selectors (Left Column)

**[1] LIGHT Button:**
| Action | When in LIGHT mode | When in MUSIC mode |
|--------|-------------------|-------------------|
| 1x Press | **Cycle presets** (Adaptive → Movie → Ambient) | Switch to LIGHT mode |
| Hold | Color temp warmer | Switch to LIGHT mode |
| 2x Tap | 100% brightness | Switch + 100% brightness |
| 3x Tap | Toggle color temp (warm ↔ cool) | Switch + toggle color temp |

**[3] MUSIC Button:**
| Action | When in MUSIC mode | When in LIGHT mode |
|--------|-------------------|-------------------|
| 1x Press (playing) | **PAUSE playback** | Switch to MUSIC mode |
| 1x Press (stopped) | **START playback** | Switch + START playback |
| Hold | Group ALL Sonos speakers | Switch + group all |
| 2x Tap | Ungroup all Sonos speakers | Switch + ungroup |
| 3x Tap | Cycle source (Spotify, TuneIn) | Switch + cycle source |

#### Context-Sensitive (Right Column)

**[2] UP Button:**
| Context | 1x Press | Hold | 2x Tap |
|---------|----------|------|--------|
| Light Mode (on) | Brightness +10-20% | Color temp cooler | 100% brightness |
| Light Mode (off) | **Turn ON** then +brightness | Turn ON then cooler | Turn ON → 100% |
| Music Mode (playing) | Volume +10% | Next track | Default volume |
| Music Mode (stopped) | **START** then +volume | START then next | START → default |

**[4] DOWN Button:**
| Context | 1x Press | Hold | 2x Tap |
|---------|----------|------|--------|
| Light Mode (on) | Brightness -10-20% | Color temp warmer | Minimum (dim ambient) |
| Light Mode (off) | **Turn ON** then -brightness | Turn ON then warmer | Turn ON → minimum |
| Music Mode (playing) | Volume -10% | Previous track | Mute |
| Music Mode (stopped) | *No action* | *No action* | *No action* |

#### Master Button (Big)

**[5] LIGHTS Button:**
| Action | Behavior |
|--------|----------|
| 1x Press | Toggle all adaptive lights |
| Hold | EMERGENCY ALL-OFF (lights + music) |
| 2x Tap | Toggle Movie Mode |
| 3x Tap | Reset all manual overrides |
| 5x Tap | System restart (nuclear) |

### Guest Experience Walkthrough

**Scenario 1: Guest enters dark room**
1. Controller shows all YELLOW LEDs (LIGHT, UP, DOWN lit; MUSIC off)
2. Sees big "LIGHTS" button → presses → lights on
3. Too bright? Presses DOWN (yellow) → lights dim
4. Intuitive: all same color = all control same thing

**Scenario 2: Guest wants to lower music**
1. Music is playing (audible), controller is yellow (light mode)
2. Guest presses MUSIC → all LEDs shift to BLUE, blink confirms
3. Guest presses DOWN (blue) → volume lowers
4. Clear visual shift showed "now controlling music"

**Scenario 3: Guest wants music to start**
1. No music playing, controller is yellow
2. Guest presses MUSIC → music STARTS + all LEDs turn BLUE
3. Guest presses UP (blue) → volume increases
4. Single button started music AND changed controls

**Scenario 4: After 60 seconds of no touches**
1. Controller was in MUSIC mode (blue)
2. 60 seconds pass...
3. LEDs silently transition back to YELLOW (light mode)
4. Music continues playing - only control context changed

---

## Implementation Tasks

### Phase 1: Mode State Infrastructure
- [ ] Create `input_select.zen32_control_mode` with options: `light`, `music`
- [ ] Create `input_datetime.zen32_last_interaction` for timeout tracking
- [ ] Create automation for 60-second mode timeout reset

### Phase 2: LED Control Scripts
- [ ] `script.zen32_set_mode_light` - Sets all 4 small button LEDs to yellow, MUSIC off
- [ ] `script.zen32_set_mode_music` - Sets all 4 small button LEDs to blue, LIGHT off
- [ ] `script.zen32_blink_confirm` - 2x blink animation on mode switch (150ms)
- [ ] Ensure BIG button LED tracks lights state (white on, off when lights off)

### Phase 3: Button Handler Automation
- [ ] Refactor `oal_zen32_controller_handler_v13` (Lines 1858-1950) to be mode-aware
- [ ] Add mode check before executing UP/DOWN actions
- [ ] Implement "turn on first" logic for UP when system is off
- [ ] Add preset cycling on LIGHT button when in light mode

### Phase 4: Sonos Integration
- [ ] Create `script.zen32_sonos_play_pause` - Toggle playback
- [ ] Create `script.zen32_sonos_volume_up/down` - Volume control
- [ ] Create `script.zen32_sonos_next/prev` - Track control (hold actions)
- [ ] Create `script.zen32_sonos_group_all/ungroup` - Grouping (2x tap)

### Phase 5: Testing & Latency
- [ ] Address GitHub Issue #5 - response time investigation
- [ ] Reduce debounce from 500ms if possible
- [ ] Test mode switching latency
- [ ] Test LED transition smoothness

### Phase 6: Finalization
- [ ] Order button engravings (💡 LIGHT, + UP, 🎵 MUSIC, - DOWN, 💡 LIGHTS)
- [ ] Create household documentation / quick reference card
- [ ] Update GitHub issue #5 with implementation details

---

## Files to Modify

| File | Lines | Changes |
|------|-------|---------|
| `packages/OAL_lighting_control_package.yaml` | 1858-1950 | Refactor ZEN32 handler for mode-aware control |
| `packages/OAL_lighting_control_package.yaml` | New | Add input_select for mode, LED control scripts |
| `packages/sonos_package.yaml` | New | Add ZEN32 Sonos control scripts |
| `packages/ZEN32-control-track-blueprint.yaml` | Config | Configure entity tracking for LED states |

---

## Engraving Order Specifications

| Button | Icon | Text | Symbol |
|--------|------|------|--------|
| [1] Top-Left | 💡 Lightbulb | LIGHT | - |
| [2] Top-Right | - | UP | + |
| [3] Bottom-Left | 🎵 Music note | MUSIC | - |
| [4] Bottom-Right | - | DOWN | - |
| [5] Big Center | 💡 Lightbulb | LIGHTS | - |

---

## Implementation Review (2024-12-24)

### Status: DRAFT - Remediation Required

Implementation completed with known gaps. Critical code review identified blocking issues that must be resolved before deployment.

### Implementation Files

| File | Status | Lines | Description |
|------|--------|-------|-------------|
| `packages/zen32_modal_controller_package.yaml` | **CREATED** | 754 | Mode state, LED control, timeouts |
| `packages/sonos_package.yaml` | **MODIFIED** | 1205-1394 | ZEN32 Sonos control scripts |
| `packages/OAL_lighting_control_package.yaml` | **MODIFIED** | 1857-2186 | Modal button handler (30+ branches) |

### Blocking Issues (P0)

| Issue | Description | Status |
|-------|-------------|--------|
| BUG-1 | Device ID placeholder in 3 locations | 🔴 OPEN |
| BUG-2 | DRY violation - duplicate device_id definition | 🔴 OPEN |
| BUG-3 | KeyReleased events processed without action | 🔴 OPEN |

### Design Specification Gaps

| Issue | Description | Status |
|-------|-------------|--------|
| SPEC-1 | LED blink confirmation not implemented | 🟡 OPEN |
| SPEC-2 | Big button LED state tracking missing | 🟡 OPEN |
| SPEC-4 | Source cycling not implemented | 🟡 OPEN |
| SPEC-5 | LED state table mismatch - all same color | 🔴 MUST FIX |

### Required Remediation (in priority order)

1. **Device ID Centralization** - Use YAML anchor pattern
2. **Differentiated LED States** - Mode button ON, opposite OFF
3. **Active Mode Button Pulse** - Continuous blink while active
4. **Big Button State Tracking** - White=on, Red=movie, OFF=off
5. **Button 5 Hold → Soft Reset** - Replace emergency all-off
6. **Music Mode Default Volume** - Set 50% if not playing
7. **Offline Device Notification** - Mobile alert on unavailable

### Git Reference

**Commit:** `5573499`
**Branch:** `feature/hero-card-refactor`

Full gap analysis available in: `~/.claude/plans/groovy-gathering-tulip.md`

---

## Outstanding: GitHub Issue #5 - Response Time

**Status:** ⚪ DEFERRED - Not addressed in current sprint

The underlying button response latency issue (GitHub Issue #5) has **not yet been investigated**. This includes:

- 500ms debounce (may feel sluggish to users)
- Z-Wave network latency profiling
- LED transition timing optimization
- Mode switch responsiveness

**Rationale:** Focus is on P0 blocking bugs and P1 design gaps first. Speed optimization is Phase 5 work requiring the physical device to be online for measurement.

---

## Sub-Agent Research Findings

| Topic | Agent | Key Finding |
|-------|-------|-------------|
| YAML Anchors | ha-integration-researcher | Use `package.node_anchors` pattern for DRY config |
| LED UX | sequential-thinking | Three-tier brightness: HIGH/MEDIUM/LOW for mode clarity |
| Blueprint Patterns | explore | Offset-based param math; keep `continue_on_error: true` |
| Sonos Favorites | ha-integration-researcher | Counter-based cycling with `media_content_type: favorite_item_id` |
