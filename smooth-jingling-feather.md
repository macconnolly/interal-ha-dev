# OAL v14: TV Mode Unification & Mode Timeout Architecture

## Context

The OAL system has two parallel control planes that don't coordinate:

1. **Configuration Manager** (`oal_configuration_manager_v13`): Watches `input_select.oal_active_configuration`, reads a `config_profiles` dict for offsets/lights_off/lights_dimmed, executes a structured pipeline (lock -> snapshot -> route -> handoff -> unlock). This is the RIGHT architecture.

2. **Movie Mode Handler** (`oal_movie_mode_handler_v13`): Watches `media_player.living_room_apple_tv`, directly calls `adaptive_lighting.set_manual_control` and `light.turn_off`, maintains its own snapshot (`scene.oal_before_movie`), and uses a separate boolean (`input_boolean.oal_movie_mode_active`). This BYPASSES the config manager entirely.

**The unification**: `input_select.oal_active_configuration` becomes the sole source of truth. The config manager becomes the sole light-control executor. The movie handler becomes a lightweight trigger adapter that translates Apple TV events into config mode selections. Zero light mutations in the adapter.

**Additional features**: TV Bridge (transitional dim after TV stops), Mode Timeout (auto-return for timed modes), Unified Notifications (combined arbiter for all timer expiries).

**Primary file**: `packages/oal_lighting_control_package.yaml` (~7688 lines)

---

## Decisions Locked

| # | Decision | Resolution |
|---|----------|------------|
| 1 | TV light profile | Existing TV Mode config profile (in `config_profiles` dict) |
| 2 | Snapshot on auto-return | Restore scene (on/off state) then force engine recalc (fresh brightness) |
| 3 | Bridge lighting | Dedicated "TV Bridge" config profile (NOT Dim Ambient) |
| 4 | Daytime gate | `input_select` with Off / Night+Presence (default) / Always Follow |
| 5 | Timer primitive | HA Timer entity with `restore: true` |
| 6 | Presence | `group.oal_tv_presence_sensors` (OR gate: couch + living room) |
| 7 | Manual during timed mode | Cancel mode timer immediately. Manual clears -> Adaptive. |
| 8 | Notifications | Unified single tag, context-aware actions, 90s cooldown via `last_triggered` |
| 9 | Auto-switch guards | Mode-based: to-Manual only from Adaptive, to-Adaptive only from Manual |
| 10 | Snapshot scope | Split: global policy + TV-specific policy |
| 11 | Stop debounce | Bridge enabled: 25s. Bridge disabled: 90s (25s trigger + 65s action delay) |
| 12 | Architecture | Trigger adapter. Config manager = sole executor. Movie boolean = derived only. |
| 13 | Compat strategy | Immediate cutover: derived binary_sensor in Phase 2, no compat shim |
| 14 | Timeout toggle | Mode timeout manager triggers on enable-toggle change |
| 15 | Notification return | "Return Adaptive" uses direct mode set, NOT script.oal_reset_soft |

---

## Phase 1: Entity Infrastructure

### Real-World Behavior

Nothing visible changes. The system gains new state-tracking capacity -- vocabulary to express "I am in a TV follow session," "the bridge is active," "the mode timeout is armed." Without these, the TV controller would infer state from indirect signals, a fragile anti-pattern.

Timer entities with `restore: true` mean a power outage at hour 3 of a 4-hour Full Bright timeout resumes correctly with 1 hour remaining.

### 1a. Modify config options

**Anchor**: `input_select.oal_active_configuration` options list
**Change**: Insert `"TV Bridge"` after `"TV Mode"` and before `"Sleep"`
**Intent**: TV Bridge must exist as a selectable config option so the config manager can route it through its override path with a distinct profile.

### 1b. New input_selects

**Anchor**: After the `oal_isolated_override_mode` input_select definition (find `oal_isolated_override_mode:`), before `# LAYER 2` section ends

| Entity | Options | Initial | Icon |
|--------|---------|---------|------|
| `oal_tv_autofollow_gate` | Off, Night + Presence, Always Follow | Night + Presence | mdi:television-play |
| `oal_mode_timeout_state` | idle, armed, suspended_by_tv, expired | idle | mdi:timer-sand |

### 1c. New input_numbers

**Anchor**: After the `oal_control_transition_speed` input_number definition (find `oal_control_transition_speed:`), before the per-zone manual offsets comment

| Entity | Min | Max | Step | Initial | Icon |
|--------|-----|-----|------|---------|------|
| `oal_control_mode_timeout_hours` | 0.5 | 12 | 0.5 | 4 | mdi:timer-cog |
| `oal_tv_bridge_minutes` | 1 | 60 | 1 | 10 | mdi:bridge |

### 1d. New input_booleans

**Anchor**: After the `oal_movie_mode_active` input_boolean definition (find `oal_movie_mode_active:`), keep the old boolean for now

| Entity | Initial | Icon | Purpose |
|--------|---------|------|---------|
| `oal_policy_snapshot_restore_enabled` | true | mdi:camera-retake | Global snapshot restore policy |
| `oal_policy_tv_snapshot_restore_enabled` | true | mdi:television-shimmer | TV-specific restore policy |
| `oal_policy_tv_autofollow_enabled` | true | mdi:television-play | Master enable for TV auto-follow |
| `oal_policy_tv_bridge_enabled` | true | mdi:bridge | Master enable for bridge feature |
| `oal_mode_timeout_enabled` | true | mdi:timer-check | Master enable for mode timeout |
| `oal_tv_follow_session_active` | false | mdi:television-ambient-light | Tracks auto-initiated TV session |
| `oal_tv_bridge_active` | false | mdi:bridge | Bridge session flag |

### 1e. Timer entities

**Anchor**: After the `input_datetime:` block ends, before `# LAYER 3` section comment. This requires a new top-level `timer:` key.

```yaml
timer:
  oal_mode_timeout:
    name: "OAL Mode Timeout"
    icon: mdi:timer-cog
    restore: true

  oal_tv_bridge_timer:
    name: "OAL TV Bridge Timer"
    icon: mdi:bridge
    restore: true
```

### 1f. Presence group

**Anchor**: After the `oal_sleep_mode_switches` group definition (find `oal_sleep_mode_switches:`), before `# LAYER 2` header

```yaml
  oal_tv_presence_sensors:
    name: "OAL TV Presence Sensors"
    entities:
      - binary_sensor.couch_presence
      - binary_sensor.living_room_presence
```

### 1g. TV Bridge config profile

**Anchor**: In the `config_profiles` variable of `oal_configuration_manager_v13`, after the TV Mode profile and before the Sleep profile

```yaml
        "TV Bridge":
          b: -40
          k: -800
          lights_off:
            - light.column_lights
            - light.living_room_floor_lamp
          lights_dimmed:
            light.living_room_couch_lamp: 8
            light.kitchen_island_pendants: 10
            light.kitchen_counter_cabinet_underlights: 8
            light.accent_spots_lights: 8
            light.recessed_ceiling_lights: 5
            light.entryway_lamp: 10
          is_baseline: false
          is_force_on: false
```

### Validation (Phase 1)

- `ha_check_config` passes
- HA restart succeeds
- All new entities appear with correct initial values in Developer Tools
- `timer.oal_mode_timeout` and `timer.oal_tv_bridge_timer` show idle
- `group.oal_tv_presence_sensors` resolves (may show unavailable if sensors don't exist yet -- acceptable)
- "TV Bridge" appears in `input_select.oal_active_configuration` options dropdown

---

## Phase 2: TV Mode Controller

### Real-World Behavior

When the Apple TV starts playing at night with someone on the couch, the living room automatically dims to TV-watching mode -- column lights off, ceiling off, floor lamp off, remaining lights at minimal glow. The user presses nothing.

When playback stops, lights don't snap back. If Smart Dim Bridge is enabled, a gentle transitional dim holds for 10 minutes. If disabled, a 90-second debounce prevents false triggers from brief pauses. The user never sees lights flicker during commercial breaks.

During daytime (or with no presence detected), the system does NOT auto-follow. If the gate is "Night + Presence" (default), both conditions must be true. "Always Follow" bypasses both. "Off" disables entirely.

If the user manually selects TV Mode from ZEN32/dashboard, the follow session flag is NOT set. When playback stops, the system does NOT auto-return -- the user chose deliberately.

After HA restart, the system reconciles within 30 seconds: enters TV Mode if Apple TV is playing and gate passes, or clears stale session state if not.

### 2a. Delete movie mode handler

**Primary anchor**: `id: oal_movie_mode_handler_v13`
**Structural anchor**: Section comment `# 4.10 Movie mode (snapshot + restore)` through end of automation (blank line before `# 4.11 Sleep-mode schedule`)
**Action**: Delete entire automation. Update section comment to `# 4.10 TV Mode Controller (replaces movie mode handler)`

### 2b. New automation: `oal_tv_mode_controller_v14`

**Insert at**: Same location as deleted movie handler

This automation is novel and complex -- full YAML required because:
- Startup reconcile recomputes all variables after 15s delay (stale-value safety)
- Stop path has computed branch (bridge vs non-bridge) with different debounce
- Non-bridge path adds secondary 65s delay then re-verifies player state
- `stop:` directives prevent path bleeding between branches

```yaml
  # ---------------------------------------------------------------------------
  # 4.10 TV Mode Controller (replaces movie mode handler)
  # ---------------------------------------------------------------------------
  - id: oal_tv_mode_controller_v14
    alias: "OAL v14 - TV Mode Controller"
    description: >
      Trigger adapter: translates Apple TV media events into config mode
      selections. Contains ZERO light mutations -- all execution flows
      through the config manager via input_select changes.
    mode: restart
    trigger:
      - platform: state
        entity_id: media_player.living_room_apple_tv
        to: "playing"
        id: "tv_start"
      - platform: state
        entity_id: media_player.living_room_apple_tv
        to:
          - "paused"
          - "off"
          - "idle"
          - "standby"
        for: "00:00:25"
        id: "tv_stop"
      - platform: homeassistant
        event: start
        id: "startup_reconcile"
      - platform: event
        event_type: automation_reloaded
        id: "startup_reconcile"
    condition:
      - condition: state
        entity_id: input_boolean.oal_system_paused
        state: "off"
    action:
      - variables:
          trigger_id: "{{ trigger.id if trigger is defined and trigger.id is defined else 'manual' }}"
          player_state: "{{ states('media_player.living_room_apple_tv') | lower }}"
          config: "{{ states('input_select.oal_active_configuration') }}"
          gate_setting: "{{ states('input_select.oal_tv_autofollow_gate') }}"
          bridge_enabled: "{{ is_state('input_boolean.oal_policy_tv_bridge_enabled', 'on') }}"
          autofollow_enabled: "{{ is_state('input_boolean.oal_policy_tv_autofollow_enabled', 'on') }}"
          session_active: "{{ is_state('input_boolean.oal_tv_follow_session_active', 'on') }}"
          sun_below: "{{ state_attr('sun.sun', 'elevation') | float(0) < 0 }}"
          presence_detected: >
            {{ expand('group.oal_tv_presence_sensors')
               | selectattr('state', 'defined')
               | selectattr('state', 'eq', 'on') | list | length > 0 }}
          gate_passes: >
            {{ gate_setting == 'Always Follow'
               or (gate_setting == 'Night + Presence' and sun_below and presence_detected) }}

      # --- STARTUP RECONCILE ---
      - if:
          - condition: template
            value_template: "{{ trigger_id == 'startup_reconcile' }}"
        then:
          - delay: "00:00:15"
          - variables:
              player_state: "{{ states('media_player.living_room_apple_tv') | lower }}"
              config: "{{ states('input_select.oal_active_configuration') }}"
              autofollow_enabled: "{{ is_state('input_boolean.oal_policy_tv_autofollow_enabled', 'on') }}"
              sun_below: "{{ state_attr('sun.sun', 'elevation') | float(0) < 0 }}"
              presence_detected: >
                {{ expand('group.oal_tv_presence_sensors')
                   | selectattr('state', 'defined')
                   | selectattr('state', 'eq', 'on') | list | length > 0 }}
              gate_setting: "{{ states('input_select.oal_tv_autofollow_gate') }}"
              gate_passes: >
                {{ gate_setting == 'Always Follow'
                   or (gate_setting == 'Night + Presence' and sun_below and presence_detected) }}
              session_active: "{{ is_state('input_boolean.oal_tv_follow_session_active', 'on') }}"
          - choose:
              - conditions: "{{ player_state == 'playing' and autofollow_enabled and gate_passes and config != 'TV Mode' }}"
                sequence:
                  - service: input_boolean.turn_on
                    target:
                      entity_id: input_boolean.oal_tv_follow_session_active
                  - service: input_select.select_option
                    target:
                      entity_id: input_select.oal_active_configuration
                    data:
                      option: "TV Mode"
              - conditions: "{{ player_state != 'playing' and session_active }}"
                sequence:
                  - service: input_boolean.turn_off
                    target:
                      entity_id: input_boolean.oal_tv_follow_session_active
                  - if: "{{ config in ['TV Mode', 'TV Bridge'] }}"
                    then:
                      - service: input_select.select_option
                        target:
                          entity_id: input_select.oal_active_configuration
                        data:
                          option: "Adaptive"
          - stop: "Startup reconcile complete"

      # --- TV START ---
      - if:
          - condition: template
            value_template: >
              {{ (trigger_id == 'tv_start' or (trigger_id == 'manual' and player_state == 'playing'))
                 and autofollow_enabled and gate_passes and config != 'TV Mode' }}
        then:
          - service: input_boolean.turn_on
            target:
              entity_id: input_boolean.oal_tv_follow_session_active
          - service: input_select.select_option
            target:
              entity_id: input_select.oal_active_configuration
            data:
              option: "TV Mode"
          - stop: "TV Mode activated via auto-follow"

      # --- TV STOP (single trigger, computed path) ---
      - if:
          - condition: template
            value_template: "{{ trigger_id == 'tv_stop' and session_active }}"
        then:
          - if: "{{ bridge_enabled and gate_passes }}"
            then:
              - service: input_boolean.turn_off
                target:
                  entity_id: input_boolean.oal_tv_follow_session_active
              - service: input_boolean.turn_on
                target:
                  entity_id: input_boolean.oal_tv_bridge_active
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_active_configuration
                data:
                  option: "TV Bridge"
              - service: timer.start
                target:
                  entity_id: timer.oal_tv_bridge_timer
                data:
                  duration: "{{ states('input_number.oal_tv_bridge_minutes') | int(10) * 60 }}"
              - stop: "TV Bridge started"
            else:
              - delay: "00:01:05"
              - variables:
                  player_still_stopped: "{{ states('media_player.living_room_apple_tv') | lower != 'playing' }}"
              - if: "{{ player_still_stopped }}"
                then:
                  - service: input_boolean.turn_off
                    target:
                      entity_id: input_boolean.oal_tv_follow_session_active
                  - service: input_select.select_option
                    target:
                      entity_id: input_select.oal_active_configuration
                    data:
                      option: "Adaptive"
                  - stop: "TV auto-follow ended, returned to Adaptive"
```

### 2c. Config manager modifications

**Modification: Add `was_bridge` variable**
- **Anchor**: `was_adaptive:` variable in config manager variables block
- **Change**: Add after `was_adaptive`: `was_bridge: "{{ trigger_has_from_state and from_state_value == 'TV Bridge' }}"`
- **Intent**: Config manager needs to cancel bridge timer when leaving TV Bridge for any other mode

**Modification: Bridge cancellation in action block**
- **Anchor**: `input_boolean.turn_on` for `oal_config_transition_active` (the transition lock)
- **Position**: Immediately after the transition lock, before the SLEEP MODE section
- **Change**: Insert conditional: if `was_bridge`, cancel `timer.oal_tv_bridge_timer` and turn off `input_boolean.oal_tv_bridge_active`
- **Intent**: When user/automation changes mode away from TV Bridge, stale timer must be cancelled

### 2d. Derived sensors (immediate cutover)

**Anchor**: In the `template:` section, near other template sensors. Find `sensor:` blocks under `template:`.
**Change**: Add a `binary_sensor:` block with two derived sensors:

```yaml
  - binary_sensor:
      - name: "OAL TV Mode Active"
        unique_id: oal_tv_mode_active_derived
        state: >
          {{ states('input_select.oal_active_configuration') in ['TV Mode', 'TV Bridge'] }}
        icon: mdi:television
      - name: "OAL Movie Mode Active"
        unique_id: oal_movie_mode_active_derived
        state: >
          {{ states('input_select.oal_active_configuration') == 'TV Mode'
             and states('media_player.living_room_apple_tv') == 'playing' }}
        icon: mdi:movie-open
```

### 2e. Consumer reference updates (all in Phase 2)

**Auto-switch guards** (delete redundant movie boolean conditions):
- **Anchor**: `oal_auto_switch_to_manual_config` automation, condition block
- **Find**: The `input_boolean.oal_movie_mode_active` condition (state: "off")
- **Action**: DELETE these 3 lines. The existing `config == 'Adaptive'` guard is sufficient.

- **Anchor**: `oal_auto_switch_to_adaptive_when_all_zones_clear` automation, condition block
- **Find**: The `input_boolean.oal_movie_mode_active` condition (state: "off")
- **Action**: DELETE these 3 lines. The existing `config == 'Manual'` guard is sufficient.

**Status sensor state template**:
- **Anchor**: `sensor.oal_system_status` state template, find `oal_movie_mode_active`
- **Change**: Replace the movie mode elif with two config-based checks:
  - `{% elif states('input_select.oal_active_configuration') == 'TV Mode' %}` -> `TV Mode`
  - `{% elif states('input_select.oal_active_configuration') == 'TV Bridge' %}` -> `TV Bridge`

**Status sensor attributes**:
- **Anchor**: `movie_mode_active:` attribute in `sensor.oal_system_status`
- **Change**: Replace single attribute with expanded observability block:
  - `tv_mode_active`: config in ['TV Mode', 'TV Bridge']
  - `tv_follow_session`: oal_tv_follow_session_active state
  - `tv_bridge_active`: oal_tv_bridge_active state
  - `mode_timeout_state`: oal_mode_timeout_state state
  - `mode_timeout_remaining`: timer.oal_mode_timeout remaining attribute (or "none")

**Reset soft script**:
- **Anchor**: `input_boolean.oal_movie_mode_active` in `oal_reset_soft` sequence (in Config/Mode Reset section)
- **Change**: Replace the single movie boolean turn_off with:
  - Turn off: `oal_tv_follow_session_active`, `oal_tv_bridge_active`
  - Cancel timers: `timer.oal_mode_timeout`, `timer.oal_tv_bridge_timer`
  - Set `oal_mode_timeout_state` to "idle"

**Delete movie mode input_boolean definition**:
- **Anchor**: `oal_movie_mode_active:` in the `input_boolean:` section
- **Action**: DELETE the 4-line definition. The derived `binary_sensor.oal_movie_mode_active` is the permanent replacement.
- **Timing**: Do this AFTER HA restart confirms the derived sensor is working.

### Validation (Phase 2)

1. Apple TV plays at night with presence -> config changes to "TV Mode" within seconds. Column lights, floor lamp, ceiling off. Remaining lights at TV profile values.
2. Apple TV plays during day -> no mode change
3. Apple TV plays at night, no presence -> no mode change (gate fails)
4. Apple TV stops after auto-follow (bridge enabled + gate) -> "TV Bridge" mode, timer starts
5. Apple TV stops after auto-follow (no bridge) -> after 90s total, "Adaptive"
6. User manually selects TV Mode -> Apple TV stops -> NO mode change (session_active false)
7. Apple TV pauses 20s then resumes -> no mode change (25s debounce not reached, mode: restart cancels)
8. TV Mode and TV Bridge profiles execute through config manager override path correctly
9. **Zero** `light.turn_on/off` or `adaptive_lighting.set_manual_control` calls in TV controller
10. HA restart with Apple TV playing -> TV Mode recovered within 30s

---

## Phase 3: Snapshot Policy

### Real-World Behavior

When leaving TV mode, the user gets their previous light state back -- lights that were manually off stay off. If they prefer fresh calculation instead, they can disable TV restore independently of the global policy. The global policy controls the same for non-TV modes (Full Bright, etc.).

The engine ALWAYS recalculates after restore (or non-restore), so brightness values are never stale -- only on/off state is preserved from the snapshot.

### 3a. Snapshot capture guard -- NO CHANGE NEEDED

**Verified**: The existing guard `{{ was_adaptive and not is_baseline }}` correctly captures only on Adaptive -> non-Adaptive transitions. Non-Adaptive -> non-Adaptive (e.g., TV Mode -> TV Bridge) skips capture because `was_adaptive` is false. This is correct: we want the snapshot from the FIRST departure from Adaptive.

### 3b. Wrap restore path with policy check

**Anchor**: `# 0b. Restore previous light state` comment in the BASELINE PATH of config manager
**Structural anchor**: The `scene.turn_on` call for `scene.oal_before_config_mode` in the baseline choose branch
**Change**: Wrap the scene.turn_on in a conditional that evaluates snapshot policy:
- Compute `from_tv_mode`: was prior state "TV Mode" or "TV Bridge"?
- If from TV: use `oal_policy_tv_snapshot_restore_enabled`
- Otherwise: use `oal_policy_snapshot_restore_enabled`
- If policy says restore: execute scene.turn_on as before
- ALWAYS (regardless of restore): fire `oal_watchdog_trigger` with `force: true`, `force_intent: "column_safe"`, `source: "config_manager_adaptive_restore"`
**Intent**: Snapshot restores on/off state; engine recalc provides fresh brightness. Policy split lets user control TV restore independently.

**Watchdog dedup (mandatory)**: The existing baseline path ends with a watchdog trigger (find `# 6. Trigger immediate engine update` comment and the `oal_watchdog_trigger` event below it). After inserting the new force-trigger inside the policy conditional block, DELETE the existing standalone watchdog trigger at the end of the baseline path. There must be exactly ONE force-recalc event in the baseline return path, and it must be the one AFTER the policy conditional (so the engine sees the correct on/off state from the restore decision).

### Validation (Phase 3)

1. Adaptive -> Full Bright: snapshot captured (scene.oal_before_config_mode exists)
2. Full Bright -> TV Mode: NO re-snapshot (was_adaptive is false)
3. TV Mode -> Adaptive (TV restore ON): scene restored + engine recalc
4. TV Mode -> Adaptive (TV restore OFF): no scene restore, engine recalc still fires
5. Full Bright -> Adaptive (global restore ON): scene restored
6. Both policies independent (changing one doesn't affect the other)

---

## Phase 4: Mode Timeout Engine

### Real-World Behavior

The user activates Full Bright for a dinner party. Four hours later, they've forgotten. Lights automatically return to Adaptive, following the natural sunset curve. A notification 5 minutes before warns them. They never wake up at 3 AM with blazing lights because they forgot to switch back.

If they switch to TV Mode during the dinner party, the Full Bright timer pauses. When TV ends, the remaining dinner party time resumes. If they manually adjust brightness (entering Manual mode), the timer cancels -- they've taken deliberate control.

Timeout-exempt modes: Adaptive, Manual, TV Mode, TV Bridge, Sleep.
Timed modes: Full Bright, Dim Ambient, Warm Ambient.

### 4a. New automation: `oal_v14_mode_timeout_manager`

**Insert after**: The auto-switch-to-adaptive automation (find `oal_auto_switch_to_adaptive_when_all_zones_clear`)

```yaml
  # ---------------------------------------------------------------------------
  # 4.14 Global Mode Timeout Manager
  # ---------------------------------------------------------------------------
  - id: oal_v14_mode_timeout_manager
    alias: "OAL v14 - Mode Timeout Manager"
    mode: restart
    trigger:
      - platform: state
        entity_id: input_select.oal_active_configuration
        id: "config_change"
      - platform: event
        event_type: timer.finished
        event_data:
          entity_id: timer.oal_mode_timeout
        id: "timer_expired"
      - platform: state
        entity_id: input_boolean.oal_mode_timeout_enabled
        id: "enable_toggle"
      - platform: homeassistant
        event: start
        id: "startup"
    # NO automation-level condition -- must always run to clean up state
    action:
      - variables:
          config: "{{ states('input_select.oal_active_configuration') }}"
          timeout_enabled: "{{ is_state('input_boolean.oal_mode_timeout_enabled', 'on') }}"
          eligible: "{{ config in ['Full Bright', 'Dim Ambient', 'Warm Ambient'] }}"
          is_tv: "{{ config in ['TV Mode', 'TV Bridge'] }}"
          is_manual: "{{ config == 'Manual' }}"
          is_rest: "{{ config in ['Adaptive', 'Sleep'] }}"
          timer_state: "{{ states('timer.oal_mode_timeout') }}"
          timeout_secs: "{{ (states('input_number.oal_control_mode_timeout_hours') | float(4) * 3600) | int }}"

      - choose:
          # Timer expired -> return to Adaptive (always honored even if disabled mid-run)
          - conditions: "{{ trigger.id == 'timer_expired' }}"
            sequence:
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "expired"
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_active_configuration
                data:
                  option: "Adaptive"

          # Enable toggle turned OFF -> cancel running timer immediately
          - conditions: "{{ trigger.id == 'enable_toggle' and not timeout_enabled and timer_state == 'active' }}"
            sequence:
              - service: timer.cancel
                target:
                  entity_id: timer.oal_mode_timeout
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "idle"

          # Eligible mode entered + timeout enabled -> arm timer
          - conditions: "{{ eligible and timeout_enabled }}"
            sequence:
              - service: timer.start
                target:
                  entity_id: timer.oal_mode_timeout
                data:
                  duration: "{{ timeout_secs }}"
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "armed"

          # Eligible mode entered but timeout disabled -> ensure idle
          - conditions: "{{ eligible and not timeout_enabled }}"
            sequence:
              - service: timer.cancel
                target:
                  entity_id: timer.oal_mode_timeout
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "idle"

          # TV Mode entered -> pause timer if active (preserve remaining time)
          - conditions: "{{ is_tv }}"
            sequence:
              - if: "{{ timer_state == 'active' }}"
                then:
                  - service: timer.pause
                    target:
                      entity_id: timer.oal_mode_timeout
                  - service: input_select.select_option
                    target:
                      entity_id: input_select.oal_mode_timeout_state
                    data:
                      option: "suspended_by_tv"
                else:
                  - service: input_select.select_option
                    target:
                      entity_id: input_select.oal_mode_timeout_state
                    data:
                      option: "idle"

          # Manual entered -> cancel timer (user took deliberate control)
          - conditions: "{{ is_manual }}"
            sequence:
              - service: timer.cancel
                target:
                  entity_id: timer.oal_mode_timeout
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "idle"

          # Adaptive/Sleep entered -> cancel timer
          - conditions: "{{ is_rest }}"
            sequence:
              - service: timer.cancel
                target:
                  entity_id: timer.oal_mode_timeout
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "idle"

      # Startup reconciliation
      - if: "{{ trigger.id == 'startup' }}"
        then:
          - delay: "00:00:20"
          - variables:
              config: "{{ states('input_select.oal_active_configuration') }}"
              timer_state: "{{ states('timer.oal_mode_timeout') }}"
              timeout_enabled: "{{ is_state('input_boolean.oal_mode_timeout_enabled', 'on') }}"
              timeout_secs: "{{ (states('input_number.oal_control_mode_timeout_hours') | float(4) * 3600) | int }}"
          - if: "{{ config in ['Full Bright', 'Dim Ambient', 'Warm Ambient'] and timer_state == 'idle' and timeout_enabled }}"
            then:
              - service: timer.start
                target:
                  entity_id: timer.oal_mode_timeout
                data:
                  duration: "{{ timeout_secs }}"
              - service: input_select.select_option
                target:
                  entity_id: input_select.oal_mode_timeout_state
                data:
                  option: "armed"
```

### Validation (Phase 4)

1. Full Bright -> timer starts (visible in Developer Tools > timer.oal_mode_timeout)
2. Timer reaches 0 -> config returns to Adaptive
3. Enter TV Mode during timed mode -> timer pauses (state: suspended_by_tv)
4. Exit TV Mode to timed mode -> timer resumes with remaining time
5. Manual adjust during timed mode -> timer cancelled (state: idle)
6. Disable timeout while timer active -> timer cancelled immediately
7. Sleep -> timer cancelled
8. HA restart during timed mode -> timer resumes (`restore: true`)

---

## Phase 5: Smart Dim Bridge

### Real-World Behavior

Movie ends. Instead of lights snapping to full calculated brightness (jarring if late at night), a gentle bridge holds for 10 minutes. Column lights stay off, most lights at very low levels. This gives the user time to settle. After 10 minutes, a notification offers: Extend, Return Adaptive, or Keep Current. If ignored, lights return to Adaptive.

### 5a. New automation: `oal_v14_tv_bridge_manager`

**Insert after**: Mode Timeout Manager automation

```yaml
  # ---------------------------------------------------------------------------
  # 4.15 TV Bridge Manager
  # ---------------------------------------------------------------------------
  - id: oal_v14_tv_bridge_manager
    alias: "OAL v14 - TV Bridge Manager"
    mode: restart
    trigger:
      - platform: event
        event_type: timer.finished
        event_data:
          entity_id: timer.oal_tv_bridge_timer
    condition:
      - condition: state
        entity_id: input_boolean.oal_tv_bridge_active
        state: "on"
      - condition: state
        entity_id: input_select.oal_active_configuration
        state: "TV Bridge"
    action:
      - service: notify.notify
        data:
          title: "TV Bridge Ending"
          message: "Returning to Adaptive in 5 minutes unless extended."
          data:
            tag: "oal_timer_expiring"
            actions:
              - action: "OAL_EXTEND_BRIDGE"
                title: "Extend Bridge"
              - action: "OAL_RETURN_ADAPTIVE"
                title: "Return Adaptive"
              - action: "OAL_KEEP_BRIDGE"
                title: "Keep Current"
      - wait_for_trigger:
          - platform: event
            event_type: mobile_app_notification_action
            event_data:
              action: "OAL_EXTEND_BRIDGE"
          - platform: event
            event_type: mobile_app_notification_action
            event_data:
              action: "OAL_RETURN_ADAPTIVE"
          - platform: event
            event_type: mobile_app_notification_action
            event_data:
              action: "OAL_KEEP_BRIDGE"
        timeout: "00:05:00"
        continue_on_timeout: true
      - choose:
          - conditions: "{{ wait.trigger and wait.trigger.event.data.action == 'OAL_EXTEND_BRIDGE' }}"
            sequence:
              - service: timer.start
                target:
                  entity_id: timer.oal_tv_bridge_timer
                data:
                  duration: "{{ states('input_number.oal_tv_bridge_minutes') | int(10) * 60 }}"
              - service: notify.notify
                data:
                  message: "Bridge extended."
                  data:
                    tag: "oal_timer_expiring"
          - conditions: "{{ wait.trigger and wait.trigger.event.data.action == 'OAL_KEEP_BRIDGE' }}"
            sequence:
              - service: input_boolean.turn_off
                target:
                  entity_id: input_boolean.oal_tv_bridge_active
              - service: timer.cancel
                target:
                  entity_id: timer.oal_tv_bridge_timer
              - service: notify.notify
                data:
                  message: "Staying in bridge mode. Select a mode manually when ready."
                  data:
                    tag: "oal_timer_expiring"
        default:
          - service: input_boolean.turn_off
            target:
              entity_id: input_boolean.oal_tv_bridge_active
          - service: input_select.select_option
            target:
              entity_id: input_select.oal_active_configuration
            data:
              option: "Adaptive"
```

### Validation (Phase 5)

1. TV stop + bridge enabled + gate -> TV Bridge mode, timer starts
2. Bridge timer expires -> notification with 3 actions
3. Extend -> timer restarts for configured minutes
4. Return Adaptive -> mode changes to Adaptive
5. Keep -> stays in TV Bridge indefinitely (user must manually change)
6. Ignore (timeout) -> returns to Adaptive after 5 minutes
7. Manual config change during bridge -> bridge cancelled (via Phase 2c config manager mod)

---

## Phase 6: Unified Notification System

### Real-World Behavior

One notification, one tag, one place to respond. Whether a mode timer is expiring, a zone override is expiring, or both, the user sees a single notification. No stacking, no duplicates. 90-second cooldown prevents spam.

### 6a. Disable legacy override notification

**Anchor**: `id: oal_v13_override_expiring_notification`
**Change**: Add `initial_state: false` to the automation definition
**Intent**: Prevent duplicate notifications during rollout. Delete fully in Phase 7.

**Also**: In `oal_system_startup_v13`, after the re-enable automations block:
- Add `automation.turn_off` targeting `automation.oal_v13_override_expiring_notification`

### 6b. Startup automation: add new automations to enable list

**Anchor**: The `automation.turn_on` service call in `oal_system_startup_v13` targeting the enable list
**Change**: Add to the entity list:
- `automation.oal_tv_mode_controller_v14`
- `automation.oal_v14_mode_timeout_manager`
- `automation.oal_v14_tv_bridge_manager`
- `automation.oal_v14_unified_timer_notification`
- `automation.oal_v14_timer_notification_handler`

**Also**: After `script.oal_reset_global` call, add cleanup:
- Turn off `oal_tv_follow_session_active` and `oal_tv_bridge_active`

### 6c. New automation: Unified timer notification arbiter

**Insert after**: Bridge Manager automation

```yaml
  # ---------------------------------------------------------------------------
  # 4.16 Unified Timer Notification Arbiter
  # ---------------------------------------------------------------------------
  - id: oal_v14_unified_timer_notification
    alias: "OAL v14 - Unified Timer Expiring Notification"
    mode: single
    trigger:
      - platform: time_pattern
        minutes: "/1"
    condition:
      - condition: state
        entity_id: input_boolean.oal_system_paused
        state: "off"
      - condition: state
        entity_id: sun.sun
        state: "below_horizon"
    action:
      - variables:
          mode_timer_state: "{{ states('timer.oal_mode_timeout') }}"
          mode_remaining: >
            {% if mode_timer_state == 'active' %}
              {% set parts = state_attr('timer.oal_mode_timeout', 'remaining') | default('0:0:0') %}
              {% set h, m, s = parts.split(':') | map('int') %}
              {{ h * 3600 + m * 60 + s }}
            {% else %}0{% endif %}
          mode_expiring: "{{ mode_remaining > 0 and mode_remaining < 300 }}"
          mode_name: "{{ states('input_select.oal_active_configuration') }}"
          zone_remaining: "{{ state_attr('sensor.oal_soonest_override', 'seconds_remaining') | int(0) }}"
          zone_expiring: "{{ zone_remaining > 0 and zone_remaining < 300 }}"
          zone_name: "{{ state_attr('sensor.oal_soonest_override', 'zone_friendly') | default('Unknown') }}"
          either_expiring: "{{ mode_expiring or zone_expiring }}"
          both_expiring: "{{ mode_expiring and zone_expiring }}"

      - condition: template
        value_template: "{{ either_expiring }}"

      # 90s cooldown via automation's own last_triggered attribute
      - condition: template
        value_template: >
          {% set last = state_attr('automation.oal_v14_unified_timer_notification', 'last_triggered') %}
          {{ last is none or (now() - last).total_seconds() > 90 }}

      - service: notify.notify
        data:
          title: >
            {% if both_expiring %}OAL Timers Expiring
            {% elif mode_expiring %}OAL Mode Expiring
            {% else %}OAL Zone Expiring{% endif %}
          message: >
            {% if both_expiring %}
              Mode: {{ (mode_remaining / 60) | round(0) }}min ({{ mode_name }})
              Zone: {{ (zone_remaining / 60) | round(0) }}min ({{ zone_name }})
            {% elif mode_expiring %}
              {{ mode_name }}: {{ (mode_remaining / 60) | round(0) }}min remaining
            {% else %}
              {{ zone_name }}: {{ (zone_remaining / 60) | round(0) }}min remaining
            {% endif %}
          data:
            tag: "oal_timer_expiring"
            actions:
              - action: "OAL_EXTEND_MODE"
                title: "Extend Mode"
              - action: "OAL_EXTEND_ZONE"
                title: "Extend Zone"
              - action: "OAL_EXTEND_BOTH"
                title: "Extend Both"
              - action: "OAL_RETURN_ADAPTIVE"
                title: "Return Adaptive"
              - action: "OAL_LET_EXPIRE"
                title: "Let Expire"
```

### 6d. New automation: Notification action handler

```yaml
  - id: oal_v14_timer_notification_handler
    alias: "OAL v14 - Timer Notification Action Handler"
    mode: single
    trigger:
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "OAL_EXTEND_MODE"
        id: "extend_mode"
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "OAL_EXTEND_ZONE"
        id: "extend_zone"
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "OAL_EXTEND_BOTH"
        id: "extend_both"
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "OAL_RETURN_ADAPTIVE"
        id: "return_adaptive"
      - platform: event
        event_type: mobile_app_notification_action
        event_data:
          action: "OAL_LET_EXPIRE"
        id: "let_expire"
    action:
      - choose:
          - conditions: "{{ trigger.id in ['extend_mode', 'extend_both'] }}"
            sequence:
              - service: timer.start
                target:
                  entity_id: timer.oal_mode_timeout
                data:
                  duration: "{{ (states('input_number.oal_control_mode_timeout_hours') | float(4) * 3600) | int }}"
      - choose:
          - conditions: "{{ trigger.id in ['extend_zone', 'extend_both'] }}"
            sequence:
              - service: adaptive_lighting.set_manual_control
                target:
                  entity_id: >
                    switch.adaptive_lighting_{{ state_attr('sensor.oal_soonest_override', 'zone_id') }}
                data:
                  manual_control: true
      - if: "{{ trigger.id == 'return_adaptive' }}"
        then:
          # Direct mode set, NOT oal_reset_soft (preserves environmental offsets)
          - service: input_select.select_option
            target:
              entity_id: input_select.oal_active_configuration
            data:
              option: "Adaptive"
      - service: notify.notify
        data:
          message: >
            {% if trigger.id == 'extend_mode' %}Mode extended.
            {% elif trigger.id == 'extend_zone' %}Zone override extended.
            {% elif trigger.id == 'extend_both' %}Both timers extended.
            {% elif trigger.id == 'return_adaptive' %}Returned to Adaptive.
            {% else %}Timers will expire naturally.{% endif %}
          data:
            tag: "oal_timer_expiring"
```

### Validation (Phase 6)

1. Mode timer < 5min -> notification with mode actions
2. Zone timer < 5min -> notification with zone actions
3. Both < 5min -> combined notification with all actions
4. Extend Mode -> timer restarts with configured duration
5. Return Adaptive -> mode changes to Adaptive (NOT full reset)
6. 90s cooldown prevents multiple notifications
7. Shared `oal_timer_expiring` tag replaces (no stacking)

---

## Phase 7: Legacy Cleanup & Polish

**Execute after 2-3 stable daily cycles.**

### 7a. Delete legacy override notification

**Anchor**: `id: oal_v13_override_expiring_notification`
**Action**: Delete entire automation (was disabled in Phase 6a)

### 7b. Nightly maintenance update

**Anchor**: `id: oal_v13_nightly_maintenance_clear_stuck_manual` action block
**Position**: BEFORE the conditional `oal_reset_soft` call (which is gated by ZEN32 activity)
**Change**: Add explicit cleanup of TV session flags that should never persist overnight:
- Turn off `input_boolean.oal_tv_follow_session_active`
- Turn off `input_boolean.oal_tv_bridge_active`
**Intent**: The conditional gate on `oal_reset_soft` checks ZEN32 last-press time. If user pressed ZEN32 recently, soft reset is skipped. But TV flags should ALWAYS be cleared at 3 AM.

### 7c. Dashboard colorMap updates

**Files to update** (search for `colorMap` in Dashboard directory):
- All JavaScript colorMaps mapping config mode names to CSS colors

**Change**: Add `'TV Bridge': '#5856d6'` (indigo) to every colorMap object. Position between 'TV Mode' and 'Sleep'.

**Intent**: Without this, TV Bridge shows the fallback green color, which is visually identical to Adaptive. Indigo suggests a transitional state between TV Mode purple and Sleep blue.

### 7d. `oal_movie_mode_active` reference audit

All references should already be handled by Phase 2. This table is for final verification:

| Former Location | Action | Phase |
|----------------|--------|-------|
| input_boolean definition | Deleted | 2d (after restart) |
| Movie handler internals (5 refs) | Deleted with handler | 2a |
| Auto-switch-to-manual guard | Deleted | 2e |
| Auto-switch-to-adaptive guard | Deleted | 2e |
| reset_soft turn_off | Replaced | 2e |
| Status sensor state | Replaced | 2e |
| Status sensor attribute | Replaced | 2e |

### Validation (Phase 7)

- Zero references to `input_boolean.oal_movie_mode_active` in control logic
- `binary_sensor.oal_movie_mode_active` computes correctly from config + player state
- Status sensor shows "TV Mode" / "TV Bridge" correctly
- Reset scripts clear all new entities
- Dashboard shows indigo for TV Bridge mode
- 3 AM maintenance clears TV flags regardless of ZEN32 activity

---

## Implementation Sequence

```
Phase 1 (Entities) --- requires HA restart to register timers/groups
    |
    |---> Phase 2 (TV Controller + all consumer updates) --- test: Apple TV play/stop
    |         |
    |         '--> Phase 5 (Bridge Manager) --- test: TV stop with bridge
    |
    |---> Phase 3 (Snapshot Policy) --- test: mode transitions + restore
    |
    '---> Phase 4 (Mode Timeout) --- test: Full Bright timer + TV suspend
              |
              '--> Phase 6 (Notifications) --- test: timer expiry alerts

Phase 7 (Legacy Cleanup) --- LAST, after 2-3 stable daily cycles
```

## Risk Summary

| Phase | Risk | Mitigation |
|-------|------|------------|
| 1 | Low | Entity additions only; backup before HA restart |
| 2 | **High** | Replaces movie handler + immediate boolean cutover. Keep old handler commented (not deleted) until Phase 7. |
| 3 | Low | Conditional wrapper with `continue_on_error: true` |
| 4 | Medium | Verify `timer.pause` support in HA version. Enable-toggle trigger prevents runaway timers. |
| 5 | Medium | Bridge uses `oal_tv_bridge_active` guard + dual condition to prevent re-entry |
| 6 | Low | Old notification disabled but not deleted; can re-enable |
| 7 | Medium | Only after 2-3 stable daily cycles |

## Known Interactions

**Column RGB protect at dusk**: During sunset RGB protect window (sun descending, -5 to +3 degrees elevation), column lights in RGB mode will NOT turn off even in TV Mode/TV Bridge. This is architecturally correct -- RGB protection is safety-critical and takes priority. User may notice column lights staying on during TV watching at sunset. No code change needed.

**ZEN32 config cycling**: TV Bridge is NOT in the cycle list (intentional -- it's a system-managed transitional state). If user presses cycle button during TV Bridge, it jumps to Adaptive. This is correct behavior.

## Rollback

Each phase independently revertible from pre-implementation git backup. Phase 2 is highest risk -- keep old movie handler in a commented block (not deleted from file) until Phase 7 validates stability.
