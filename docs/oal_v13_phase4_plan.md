# OAL v13 Phase 4: Manual→Adaptive Sync + Watcher Gaps + Double Calculation

## Problem Statement

The OAL system maintains two layers of manual control state:

1. **Per-zone `manual_control` attribute** — managed by Adaptive Lighting (HACS), per-light timers
2. **Global `input_select.oal_active_configuration`** — managed by OAL automations

Forward sync exists: when any zone's AL switch gains a `manual_control` entry, `oal_auto_switch_to_manual_config` (L2839) flips the global config to "Manual". But the reverse direction is missing entirely. When AL autoreset clears all `manual_control`, or `oal_reset_room` clears the last zone, `oal_active_configuration` stays stuck on "Manual" indefinitely.

The only paths back to "Adaptive" today are `oal_reset_soft` (explicit global reset) and the 6:00 AM sleep-mode end schedule.

Additionally:
- `oal_reset_soft` triggers the engine TWICE (Config Manager watchdog + its own unconditional watchdog at L3787)
- The per-zone autoreset watcher (`oal_manual_control_sync_offset`, L3156) resets offsets but doesn't trigger the engine — corrected settings aren't pushed to AL until the next 15-minute periodic
- `oal_reset_room` (L3818) doesn't trigger the engine at all — it calls `adaptive_lighting.apply` which pushes AL's *current* settings (with stale offset baked in), and has no Govee-safe column handling

---

## File Modified

`packages/oal_lighting_control_package.yaml`

---

## Change 1: Add Reverse Watcher Automation (NEW)

**Location**: Insert after `oal_auto_switch_to_manual_config` action block (after L2877), before the Learning Event Logger comment at L2879.

**Goal**: Automatically switch the global config back to "Adaptive" when all zones have cleared their `manual_control` (via autoreset timer expiry, room reset, isolated override exit, column RGB morning exit, or any other path).

### Code

```yaml
  # -------------------------------------------------------------------------
  # Auto-switch to "Adaptive" config when all manual control clears
  # (Reverse of oal_auto_switch_to_manual_config above)
  # -------------------------------------------------------------------------
  - id: oal_auto_switch_to_adaptive_config
    alias: "OAL - Auto Switch to Adaptive When All Zones Clear"
    description: "Returns to Adaptive mode when autoreset/reset clears all manual control"
    mode: single
    trigger:
      - platform: template
        value_template: >
          {% set zones = [
            'switch.adaptive_lighting_main_living',
            'switch.adaptive_lighting_kitchen_island',
            'switch.adaptive_lighting_bedroom_primary',
            'switch.adaptive_lighting_accent_spots',
            'switch.adaptive_lighting_recessed_ceiling',
            'switch.adaptive_lighting_column_lights'
          ] %}
          {% set ns = namespace(count=0) %}
          {% for z in zones %}
            {% set ns.count = ns.count + (state_attr(z, 'manual_control') | default([]) | length) %}
          {% endfor %}
          {{ ns.count == 0 }}
        for: "00:00:03"
    condition:
      - condition: state
        entity_id: input_select.oal_active_configuration
        state: "Manual"
      - condition: state
        entity_id: input_boolean.oal_system_paused
        state: "off"
      - condition: state
        entity_id: input_boolean.oal_config_transition_active
        state: "off"
    action:
      - service: input_number.set_value
        target:
          entity_id: input_number.oal_offset_global_manual_warmth
        data:
          value: 0
      - service: input_select.select_option
        target:
          entity_id: input_select.oal_active_configuration
        data:
          option: "Adaptive"
```

### Design Decisions

**Why hardcoded zone list instead of `expand('group.oal_control_switches')`**: Matches the forward watcher pattern at L2846-2852. Using `expand()` in template triggers is unreliable for tracking attribute changes on individual entities — HA's template engine needs explicit entity references to subscribe to `manual_control` attribute changes on each switch. The hardcoded list ensures HA explicitly tracks all six switches.

**Why `for: "00:00:03"` debounce**: Three scenarios require debounce:
1. **HA startup/reload**: AL switch attributes are briefly empty/unknown during initialization. Without debounce, the watcher would false-trigger every restart.
2. **Soft reset execution**: `oal_reset_soft` clears `manual_control` sequentially across zones (~2s total). Without debounce, the watcher could fire mid-sequence before `oal_reset_soft` reaches its own Config/Mode Reset block, creating a race between the watcher's "set Adaptive" and the soft reset's "set Adaptive".
3. **Config Manager transitions**: Config Manager sets/clears `manual_control` during transitions with `oal_config_transition_active` locked. The 3s debounce provides an additional safety margin beyond the condition guard.

**Why `oal_config_transition_active` condition guard**: Prevents the watcher from firing during Config Manager transitions (e.g., switching from "Dim Ambient" → "Adaptive"), where `manual_control` is deliberately being cleared as part of a managed transition. Config Manager controls its own unlock/watchdog flow (L1530-1539 for Baseline path, L1747-1755 for Override path). The watcher should only fire for *unmanaged* clearings (autoreset, room reset, etc.).

**Why `mode: single`**: This automation performs a simple two-step action (reset warmth, set Adaptive). If it fires again while already running, the second trigger is safely discarded — the first run already set Adaptive, so the second would be a no-op anyway. Single mode prevents queue buildup from rapid attribute changes.

**Why reset `oal_offset_global_manual_warmth` here**: When all zones return to Adaptive, the global warmth offset is no longer meaningful. Resetting it here ensures a clean slate. The per-zone brightness offsets are already handled by `oal_manual_control_sync_offset` (L3156) which fires per-zone when each zone's `manual_control` clears.

**What happens after this fires**: Setting `oal_active_configuration` to "Adaptive" triggers Config Manager (`oal_configuration_manager_v13`). Config Manager takes the Baseline path (L1478): locks `oal_config_transition_active` → releases all manual controls → resets config offsets → unlocks → fires watchdog with `force: true`. This produces exactly one engine run with correct settings.

**Why this is the right abstraction**: Rather than adding "am I the last zone?" checks to every exit path (autoreset, room reset, isolated override exit, column RGB morning exit, nightly maintenance), this watcher handles ALL exit paths centrally. Any mechanism that clears `manual_control` — current or future — automatically triggers a return to Adaptive when all zones are clear. This eliminates an entire class of sync bugs.

**Coverage**: Autoreset timer expiry, `oal_reset_room` (last-zone case), isolated override exit, column RGB morning exit, nightly maintenance, `oal_manual_control_sync_offset` watcher, movie mode end (L2525), and any future mechanism that clears `manual_control`.

---

## Change 2: Fix Soft Reset Double Calculation

**Two locations within `script.oal_reset_soft`:**
- Part A: Add `was_non_adaptive` variable to the existing `variables:` block (L3622)
- Part B: Replace the Config/Mode Reset block at the end (L3767-3790)

**Goal**: Ensure the engine runs exactly once, regardless of starting config state.

### Current behavior (BROKEN)

```
1. Clears manual_control zones (L3688-3752)
   └─ This may trigger the reverse watcher (Change 1) or oal_manual_control_sync_offset
2. Sets config → "Adaptive" (L3770-3774)
   └─ Config Manager fires: lock transition → release controls → set offsets → unlock → watchdog
   └─ ENGINE RUN #1 via Config Manager watchdog
3. wait_template for config_transition_active == off (L3785)
4. Fires own oal_watchdog_trigger with force: true (L3787-3790)
   └─ ENGINE RUN #2 ← UNNECESSARY DOUBLE FIRE
```

When already in "Adaptive":
```
1. Clears manual_control zones (L3688-3752)
   └─ config_transition_active is off, so engine runs normally
2. Sets config → "Adaptive" (L3770-3774) — no state change, Config Manager does NOT fire
3. wait_template immediately passes (config_transition_active is already off)
4. Fires own watchdog → ENGINE RUN (correct, this is the ONLY run)
```

The fix: detect the starting state so we know whether Config Manager will fire.

### Part A — Add variable (insert into `variables:` block at L3622)

Insert after `column_rgb_green` (L3631) and before `zone_name_to_switch` (L3637):

```yaml
      # Capture config state BEFORE any manual_control clearing.
      # The reverse watcher (oal_auto_switch_to_adaptive_config) could change
      # config during clearing — capturing early gives us the TRUE initial state.
      was_non_adaptive: "{{ states('input_select.oal_active_configuration') != 'Adaptive' }}"
```

**Why top-level variable**: Script-level `variables:` are evaluated once at script start, before any sequence steps execute. This ensures `was_non_adaptive` reflects the true initial state, even if the reverse watcher fires during `manual_control` clearing (which happens in the sequence) and changes config to "Adaptive" before we reach the Config/Mode Reset block.

**Why this matters with Change 1**: Without early capture, the following race is possible:
```
1. oal_reset_soft starts with config = "Manual"
2. Clears manual_control on all zones
3. Reverse watcher fires (3s debounce) → sets config to "Adaptive"
4. Script reaches Config/Mode Reset, sets "Adaptive" → no state change → Config Manager doesn't fire
5. Script sees config is "Adaptive" and skips watchdog → NO ENGINE RUN
```
With early capture, `was_non_adaptive` is `true` regardless of what happens mid-sequence.

### Part B — Replace Config/Mode Reset block (L3767-3790)

**Remove** (L3767-3790):
```yaml
      # =========================================================================
      # Config/Mode Reset (always)
      # =========================================================================
      - service: input_select.select_option
        target:
          entity_id: input_select.oal_active_configuration
        data:
          option: "Adaptive"
      - service: input_select.select_option
        target:
          entity_id: input_select.oal_isolated_override_mode
        data:
          option: "Off"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.oal_movie_mode_active

      # LAST: Trigger Core Engine to recalculate and apply
      - wait_template: "{{ is_state('input_boolean.oal_config_transition_active', 'off') }}"
        timeout: "00:00:10"
      - event: oal_watchdog_trigger
        event_data:
          force: true
          source: "soft_reset"
```

**Replace with:**
```yaml
      # =========================================================================
      # Config/Mode Reset
      # =========================================================================
      # Always reset these regardless of config state
      - service: input_number.set_value
        target:
          entity_id: input_number.oal_offset_global_manual_warmth
        data:
          value: 0
      - service: input_select.select_option
        target:
          entity_id: input_select.oal_isolated_override_mode
        data:
          option: "Off"
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.oal_movie_mode_active

      # Set Adaptive — Config Manager triggers IF state actually changes
      - service: input_select.select_option
        target:
          entity_id: input_select.oal_active_configuration
        data:
          option: "Adaptive"

      # LAST: Only fire direct watchdog if Config Manager won't run
      # was_non_adaptive captured at script start (Part A), before any clearing
      - if:
          - condition: template
            value_template: "{{ not was_non_adaptive }}"
        then:
          # Was already Adaptive → Config Manager won't fire → we trigger directly
          - event: oal_watchdog_trigger
            event_data:
              force: true
              source: "soft_reset"
        else:
          # Was non-Adaptive → Config Manager will handle transition + watchdog
          # Wait for it to complete so subsequent code (if any) sees stable state
          - wait_template: "{{ is_state('input_boolean.oal_config_transition_active', 'off') }}"
            timeout: "00:00:10"
```

### Design Decisions

**Why add explicit `oal_offset_global_manual_warmth` reset**: Previously, the global warmth reset was bundled into `offset_entities_to_reset` (L3670-3679) only when zones were overridden. With the reverse watcher (Change 1), it's possible the config is already "Adaptive" when soft reset runs (watcher fired first), but global warmth wasn't reset. The explicit reset here ensures a clean slate regardless of race timing. Note: this is intentionally redundant with the offset block (L3757-3765) when zones ARE overridden — `offset_entities_to_reset` includes warmth in that case. The double reset is idempotent and provides defense-in-depth for the reverse-watcher race.

**Why the if/else branch is correct**: Two mutually exclusive cases:
1. `was_non_adaptive == false` (was already "Adaptive"): Setting "Adaptive" is a no-op for Config Manager (no state change). We fire the watchdog ourselves. One engine run.
2. `was_non_adaptive == true` (was "Manual"/"Sleep"/etc.): Setting "Adaptive" triggers Config Manager. Config Manager runs Baseline path (L1478): lock → release → reset offsets → unlock → watchdog (L1536). We wait for it to finish. One engine run.

**Why `force: true` in the then branch**: When already Adaptive, `oal_config_transition_active` is off, so a non-force trigger would also work. But `force: true` is semantically correct — this is an explicit user-initiated reset that should always execute, matching the existing pattern at L3787.

**Interaction with the reverse watcher (Change 1)**: Three scenarios:

| Starting State | Reverse Watcher | Soft Reset | Engine Runs |
|---|---|---|---|
| Manual, zones overridden | May fire during clearing (3s debounce) | `was_non_adaptive=true` → takes else branch | If watcher fires first: config becomes Adaptive before soft reset reaches it → `select_option "Adaptive"` is no-op → Config Manager doesn't fire → else branch waits but `config_transition_active` is already off → wait passes immediately → **0 runs from soft reset, 1 from watcher's Config Manager = 1 total**. If soft reset reaches config first: sets Adaptive → Config Manager fires → watcher's condition `state: "Manual"` fails → watcher doesn't fire → **1 run from Config Manager = 1 total**. |
| Manual, no zones overridden | Nothing to trigger it | `was_non_adaptive=true` → takes else branch → Config Manager fires | **1 total** |
| Adaptive | Nothing to trigger it | `was_non_adaptive=false` → takes then branch → direct watchdog | **1 total** |

In every case: exactly one engine run.

**Why the engine's `mode: queued` doesn't undermine this**: The engine (`oal_core_adjustment_engine_v13`, L574) uses `mode: queued` with `max: 20`, NOT `mode: restart`. Queued triggers don't deduplicate — they all execute sequentially. This means multiple triggers would produce multiple engine runs. The branching logic in this change is specifically designed to ensure exactly one trigger reaches the engine, rather than relying on deduplication.

---

## Change 3: Enhance Per-Zone Autoreset Watcher

**Location**: `oal_manual_control_sync_offset` action block (L3190-3195)

**Goal**: Trigger the engine when a zone autoresets so corrected min/max values (with offset=0) are pushed to Adaptive Lighting immediately, instead of waiting up to 15 minutes for the next periodic engine run.

### Current code (L3190-3195)

```yaml
    action:
      - service: input_number.set_value
        target:
          entity_id: "{{ helper_entity }}"
        data:
          value: 0
```

### Replace with

```yaml
    action:
      - service: input_number.set_value
        target:
          entity_id: "{{ helper_entity }}"
        data:
          value: 0
      # Trigger engine to push corrected settings (offset=0) to AL immediately
      # Guard: skip during soft reset to prevent 6 redundant queued engine runs
      # (soft reset bulk-clears all zones simultaneously, then fires its own watchdog)
      - if:
          - condition: template
            value_template: "{{ is_state('script.oal_reset_soft', 'off') }}"
        then:
          - event: oal_watchdog_trigger
            event_data:
              source: "autoreset_offset_clear"
```

### Design Decisions

**Why non-force (no `force: true`)**: Non-force triggers respect the `oal_config_transition_active` lock (engine condition at L628-638). If a Config Manager transition is in progress, this trigger is safely dropped by the engine's condition block — the transition will push correct settings anyway when it completes.

**Why this doesn't cause double engine runs**: The `input_number.set_value` to 0 does NOT trigger the engine via state change, because manual offsets are intentionally excluded from the engine's state triggers (see comment block L590-615). The only engine trigger from this automation is the explicit `oal_watchdog_trigger` event. One event = one queued engine run.

**Why guard against `script.oal_reset_soft` running**: When `oal_reset_soft` bulk-clears `manual_control` on all 6 zones simultaneously, this automation fires 6 times (once per zone, `mode: queued`, `max: 10`). Without the guard, 6 non-force watchdog events queue up in the engine (which uses `mode: queued`, `max: 20`), producing 6 redundant runs before soft reset's own Config Manager watchdog fires a 7th. All 7 runs are idempotent but waste ~1.4s of Zigbee/Z-Wave bus time. The guard suppresses the 6 per-zone triggers when soft reset is handling the recalculation itself.

**Why NOT reset global warmth here**: This automation fires per-zone when that zone's `manual_control` clears. If other zones are still manually controlled, global warmth should persist. Only when ALL zones clear should warmth reset — that's handled by the reverse watcher (Change 1).

**Interaction with the reverse watcher (Change 1)**: When the last zone autoresets:
1. This automation fires: resets that zone's offset, triggers engine (non-force, queued)
2. Reverse watcher fires (after 3s debounce): resets warmth, sets "Adaptive"
3. Config Manager fires (from Adaptive set): lock → release → reset offsets → unlock → watchdog (force)

The non-force trigger from step 1 will either:
- Execute before Config Manager locks `oal_config_transition_active` → engine runs → **one run from step 1 + one run from step 3 = 2 total**
- Execute after Config Manager locks → dropped by engine condition (L636-638) → **1 total from step 3**

In the 2-run case: the first run pushes offset=0 for that zone immediately (good UX). The second run from Config Manager pushes full Adaptive baseline. Both runs are idempotent and produce correct settings. The extra run adds ~200ms of Zigbee/Z-Wave traffic. This is acceptable because autoreset is infrequent (happens at most once per manual override timeout, typically minutes apart).

**For non-last-zone autosets**: Only this automation fires. Reverse watcher condition `state: "Manual"` + `ns.count == 0` doesn't match (other zones still manual). Result: exactly one engine run, offset=0 pushed immediately.

---

## Change 4: Add Engine Trigger + Govee-Safe Column Handling to Room Reset

**Location**: `script.oal_reset_room`, two modifications:
- Part A: Add column detection variables to the `variables:` block (L3831)
- Part B: Replace the final apply block (L3911-3917) with Govee-safe logic + engine trigger

**Goal**: (a) Trigger a recalculation so corrected settings (offset=0) are pushed to AL immediately. (b) Prevent Govee pink/purple flash when room reset targets column lights during the Gaussian RGB window.

### Current behavior (BROKEN)

```
1. Clears manual_control for all target zones (L3898-3902) — including columns
2. Resets offsets to 0 (L3905-3909)
3. adaptive_lighting.apply pushes AL's current settings (L3912-3917)
   └─ Problem 1: "Current settings" still have old offset baked in (stale)
   └─ Problem 2: For columns in Gaussian window, apply pushes color_temp mode
      to Govee devices → purple/pink flash (Invariant #2 violation)
```

### Part A — Add column detection variables

Insert after `target_offsets` (after L3895), before the first action step:

```yaml
          # Column light entities for Govee-safe detection
          column_light_entities:
            - light.living_column_strip_light_matter
            - light.dining_column_strip_light_matter

          # Check if any target zones include columns
          targets_include_columns: "{{ 'column_lights' in target_zones }}"

          # Gaussian window detection
          # SYNC: bounds must match oal_reset_soft L3628-3630 and prepare_rgb L1838
          sun_elevation: "{{ state_attr('sun.sun', 'elevation') | float(90) }}"
          sun_rising: "{{ state_attr('sun.sun', 'rising') | default(true) }}"
          in_gaussian_rgb_window: >
            {{ (not sun_rising and sun_elevation <= 8 and sun_elevation >= -5) or
               (sun_rising and sun_elevation >= -5 and sun_elevation < 8) }}
          column_rgb_green: "{{ states('input_number.oal_offset_column_rgb_green') | int(200) }}"

          # Non-column switches for standard AL handling
          non_column_switches: >
            {{ target_switches | reject('eq', 'switch.adaptive_lighting_column_lights') | list }}

          # Switches to receive adaptive_lighting.apply (turn_on_lights: true)
          # During Gaussian window: exclude columns (they get direct RGB above)
          # Outside window: include all targets (preserves turn-on behavior for columns)
          apply_switches: >
            {% if targets_include_columns and in_gaussian_rgb_window %}
              {{ non_column_switches }}
            {% else %}
              {{ target_switches }}
            {% endif %}
```

### Part B — Replace final block (L3897-3917)

**Remove** (L3897-3917):
```yaml
      # Clear manual control for affected zones
      - service: adaptive_lighting.set_manual_control
        target:
          entity_id: "{{ target_switches }}"
        data:
          manual_control: false

      # Reset brightness offsets for affected zones
      - service: input_number.set_value
        target:
          entity_id: "{{ target_offsets }}"
        data:
          value: 0

      # Re-apply adaptive lighting
      - service: adaptive_lighting.apply
        target:
          entity_id: "{{ target_switches }}"
        data:
          turn_on_lights: true
          transition: 1
```

**Replace with:**
```yaml
      # =========================================================================
      # Non-Column Zones: Standard AL Reset
      # =========================================================================
      - if:
          - condition: template
            value_template: "{{ non_column_switches | length > 0 }}"
        then:
          - service: adaptive_lighting.set_manual_control
            target:
              entity_id: "{{ non_column_switches }}"
            data:
              manual_control: false

      # =========================================================================
      # Column Zones: Govee-Safe Reset (mirrors oal_reset_soft L3688-3739)
      # =========================================================================
      - if:
          - condition: template
            value_template: "{{ targets_include_columns }}"
        then:
          - choose:
              - conditions:
                  - condition: template
                    value_template: "{{ in_gaussian_rgb_window }}"
                sequence:
                  # During Gaussian window: apply correct RGB color directly
                  - service: light.turn_on
                    continue_on_error: true
                    target:
                      entity_id: "{{ column_light_entities }}"
                    data:
                      rgb_color: [255, "{{ column_rgb_green }}", 0]
                      transition: 1
                  # LOCK manual control so AL doesn't overwrite RGB with color_temp
                  - service: adaptive_lighting.set_manual_control
                    continue_on_error: true
                    target:
                      entity_id: switch.adaptive_lighting_column_lights
                    data:
                      lights: "{{ column_light_entities }}"
                      manual_control: true
            default:
              # Outside Gaussian window: standard AL release
              - service: adaptive_lighting.set_manual_control
                target:
                  entity_id: switch.adaptive_lighting_column_lights
                data:
                  manual_control: false

      # =========================================================================
      # Reset Brightness Offsets (all target zones)
      # =========================================================================
      - service: input_number.set_value
        target:
          entity_id: "{{ target_offsets }}"
        data:
          value: 0

      # =========================================================================
      # Apply + Engine Trigger
      # =========================================================================
      # Apply for immediate visual feedback + turn_on_lights: true behavior
      # (engine uses turn_on_lights: false — without this, off lights stay off)
      # Uses apply_switches: includes columns outside Gaussian window (safe for
      # color_temp), excludes them inside window (they got direct RGB above)
      - if:
          - condition: template
            value_template: "{{ apply_switches | length > 0 }}"
        then:
          - service: adaptive_lighting.apply
            target:
              entity_id: "{{ apply_switches }}"
            data:
              turn_on_lights: true
              transition: 1

      # Trigger engine to push corrected settings (offset=0) to AL
      - event: oal_watchdog_trigger
        event_data:
          force: true
          source: "room_reset"
```

### Design Decisions

**Why separate column and non-column paths**: During the Gaussian RGB window (sun elevation -5° to +8°), column lights (Govee devices) should display RGB color, not color_temp. Blindly clearing `manual_control` and calling `adaptive_lighting.apply` on columns during this window pushes AL's color_temp mode to the Govee hardware, causing the purple/pink flash (Invariant #2). The separated paths ensure columns get RGB treatment when needed.

**Why mirror `oal_reset_soft` logic rather than extract a shared script**: The column reset logic in `oal_reset_soft` (L3688-3739) includes additional concerns specific to soft reset (e.g., `change_switch_settings` with full config restoration for the outside-window case). Room reset is simpler — it just needs to release or maintain `manual_control` appropriately. Extracting a shared script would either (a) require parameterizing all the differences, adding complexity for two callsites, or (b) force both paths into the simpler model, losing soft reset's config restoration. The inline approach is clearer and avoids coupling the two reset scripts.

**Why `apply_switches` instead of `non_column_switches` for the apply target**: Room reset intentionally turns on lights that are off — that's the user's expectation when they "reset a room." The engine uses `turn_on_lights: false` (it doesn't turn lights on/off, only adjusts settings for already-on lights). Without the apply, off lights wouldn't turn on. Using `non_column_switches` would permanently exclude columns from `turn_on_lights: true`, even outside the Gaussian window when color_temp mode is safe. The `apply_switches` variable includes columns when safe (outside Gaussian) and excludes them when dangerous (inside Gaussian, where they've already received direct RGB). This preserves the current behavior where room reset turns on all targeted lights.

**Why `force: true`**: Room reset is an explicit user action. It should bypass the `oal_config_transition_active` lock for immediate response. If a config transition happens to be running, the user's room reset should still take effect.

**Stale-window analysis**: The apply pushes AL's current settings (which may include the old offset). The engine fires ~200ms later with `force: true` and corrects the settings. For typical offsets (+/-5-10%), the brief stale window is imperceptible. For large offsets (+/-20%), there's a sub-second flash that is acceptable because: (a) the apply is needed for `turn_on_lights`, (b) the engine correction is near-instantaneous, (c) room reset is an infrequent manual action.

**Interaction with the reverse watcher (Change 1)**: When room reset clears the last manual zone:
1. Room reset fires engine (force, queued)
2. Reverse watcher fires after 3s debounce → sets Adaptive → Config Manager fires engine

Result: 2 engine runs. The force trigger from room reset executes first (immediate), providing instant visual feedback. The Config Manager run ~3s later is idempotent — it recalculates and applies the same Adaptive settings. This is acceptable because room reset is infrequent and the UX priority is immediate response.

**Note on column `manual_control` during Gaussian window**: When columns are reset during the Gaussian window, `manual_control` is explicitly set to `true` (locking AL out of those lights). This means the reverse watcher's `ns.count` will be > 0 due to column lights. The reverse watcher will NOT fire until the Gaussian window exits and the column RGB morning exit automation clears `manual_control`. This is correct behavior — during the Gaussian window, columns are intentionally under manual RGB control.

---

## Change 5: Fix Sunset Logic Column Green Snap at 5°

**Location**: `oal_sunset_logic_unified_v13` `column_rgb_green` variable (L1787-1807)

**Goal**: Eliminate the 35-unit green channel snap that occurs during evening descent when elevation crosses from 5.0° to 4.9°. The NIGHT branch (`elevation < 5`) incorrectly catches the evening 0°–5° range, snapping the green value from 200 (Day) to 165 (Night) instead of holding at 200 until the EVENING fade begins at 0°.

### Current code (L1787-1807)

```yaml
      column_rgb_green: >
        {% set rising = state_attr('sun.sun', 'rising') | default(true) %}

        {# EVENING: Fade green from 200 to 165 as sun drops from 0 to -5 #}
        {% if not rising and elevation <= 0 and elevation >= -5 %}
          {% set progress = (0 - elevation) / 5 %}
          {{ (200 - (35 * progress)) | round(0) }}

        {# MORNING: Fade green from 165 to 200 as sun rises from 5 to 12 #}
        {% elif rising and elevation >= 5 and elevation <= 12 %}
          {% set progress = (elevation - 5) / 7 %}
          {{ (165 + (35 * progress)) | round(0) }}

        {# NIGHT (between -5 and +5): Hold at 165 (warm orange) #}
        {% elif elevation < 5 %}
          165

        {# DAY: Default to 200 (yellow-orange) #}
        {% else %}
          200
        {% endif %}
```

### Bug trace

The branches are evaluated top-to-bottom. During **evening descent** (not rising):

| Elevation | Branch 1 (EVENING) | Branch 2 (MORNING) | Branch 3 (NIGHT) | Branch 4 (DAY) | Result |
|---|---|---|---|---|---|
| 8.0° | `not rising AND 8 <= 0` → SKIP | `rising` → SKIP | `8 < 5` → SKIP | **HIT** | 200 |
| 5.0° | SKIP | SKIP | `5 < 5` → SKIP | **HIT** | 200 |
| **4.9°** | SKIP (4.9 > 0) | SKIP (not rising) | **`4.9 < 5` → HIT** | — | **165 ← SNAP** |
| 0.0° | **`0 <= 0 AND 0 >= -5` → HIT** | — | — | — | 200 |
| -2.5° | **HIT** | — | — | — | 183 |
| -5.0° | **HIT** (boundary) | — | — | — | 165 |
| -5.1° | `not rising AND -5.1 >= -5` → SKIP | SKIP | **`-5.1 < 5` → HIT** | — | 165 |

Between 4.9° and 0.1° in the evening, the green snaps from 200 to 165 — a 35-unit discontinuity visible as a sudden color shift on the Govee column lights.

During **morning** (rising), no snap occurs — the MORNING branch catches 5°–12°, the NIGHT branch catches everything below 5° (holding at 165 until the fade starts), and the transition is smooth.

### Root cause

The NIGHT branch `{% elif elevation < 5 %}` is a catch-all for "everything below 5° that wasn't already caught." During morning, everything below 5° correctly belongs to NIGHT (holding at 165 before the fade-up starts at 5°). During evening, the 0°–5° range should stay at 200 (Day) until the EVENING fade begins at 0°. The branch doesn't distinguish direction.

### Replace with

```yaml
      column_rgb_green: >
        {% set rising = state_attr('sun.sun', 'rising') | default(true) %}

        {# EVENING: Fade green from 200 to 165 as sun drops from 0 to -5 #}
        {% if not rising and elevation <= 0 and elevation >= -5 %}
          {% set progress = (0 - elevation) / 5 %}
          {{ (200 - (35 * progress)) | round(0) }}

        {# MORNING: Fade green from 165 to 200 as sun rises from 5 to 12 #}
        {% elif rising and elevation >= 5 and elevation <= 12 %}
          {% set progress = (elevation - 5) / 7 %}
          {{ (165 + (35 * progress)) | round(0) }}

        {# NIGHT: Hold at 165 (warm orange)                                    #}
        {# Matches: morning below 5° (before fade-up), deep night below -5°,   #}
        {# and evening below -5° (after fade-down). Excludes evening 0-5° which #}
        {# should hold at 200 (DAY) until the EVENING fade begins at 0°.       #}
        {% elif elevation < 5 and (rising or elevation < -5) %}
          165

        {# DAY: Default to 200 (yellow-orange) #}
        {# Also catches evening 0-5° to prevent green snap #}
        {% else %}
          200
        {% endif %}
```

### Verification of every evaluation path after the fix

**Evening descent** (not rising):

| Elevation | Branch 1 (EVENING) | Branch 3 (NIGHT) | Branch 4 (DAY) | Result | Correct? |
|---|---|---|---|---|---|
| 8.0° | SKIP | `8 < 5` → SKIP | **HIT** | 200 | ✓ Day |
| 5.0° | SKIP | `5 < 5` → SKIP | **HIT** | 200 | ✓ Day |
| 4.9° | SKIP (4.9 > 0) | `4.9 < 5 AND (rising=F OR 4.9 < -5=F)` → **SKIP** | **HIT** | **200** | ✓ **Fixed** |
| 2.0° | SKIP | SKIP (same) | **HIT** | 200 | ✓ Holds Day |
| 0.1° | SKIP (0.1 > 0) | SKIP | **HIT** | 200 | ✓ Holds Day |
| 0.0° | **HIT** (fade start) | — | — | 200 | ✓ Fade entry |
| -2.5° | **HIT** | — | — | 183 | ✓ Mid-fade |
| -5.0° | **HIT** (fade end) | — | — | 165 | ✓ Fade complete |
| -5.1° | SKIP (-5.1 < -5) | `< 5 AND (F OR -5.1 < -5=T)` → **HIT** | — | 165 | ✓ Night hold |
| -10.0° | SKIP | **HIT** | — | 165 | ✓ Deep night |

**Morning ascent** (rising):

| Elevation | Branch 1 | Branch 2 (MORNING) | Branch 3 (NIGHT) | Branch 4 (DAY) | Result | Correct? |
|---|---|---|---|---|---|---|
| -10.0° | not rising → SKIP | rising → check: SKIP | `< 5 AND (rising=T OR ...)` → **HIT** | — | 165 | ✓ Night |
| -5.0° | SKIP | SKIP | **HIT** (rising=T) | — | 165 | ✓ Night |
| 0.0° | SKIP | SKIP | **HIT** (rising=T) | — | 165 | ✓ Pre-fade |
| 4.9° | SKIP | SKIP (< 5) | **HIT** (rising=T) | — | 165 | ✓ Pre-fade |
| 5.0° | SKIP | **HIT** (fade start) | — | — | 165 | ✓ Fade entry |
| 8.5° | SKIP | **HIT** | — | — | 183 | ✓ Mid-fade |
| 12.0° | SKIP | **HIT** (fade end) | — | — | 200 | ✓ Fade complete |
| 12.1° | SKIP | SKIP (> 12) | `< 5` → SKIP | **HIT** | 200 | ✓ Day |

All paths produce correct values. Morning behavior is unchanged. Evening snap is eliminated.

### Design Decisions

**Why `(rising or elevation < -5)` instead of just `rising`**: The condition must still catch deep night on the evening side (below -5°, not rising). Without `elevation < -5`, the evening path at -5.1° would fall through to DAY (200) instead of NIGHT (165). The compound condition ensures:
- Morning any elevation below 5° → NIGHT (165) ← `rising` is true
- Evening below -5° → NIGHT (165) ← `elevation < -5` is true
- Evening 0° to 5° → falls through to DAY (200) ← neither condition met

**Why not extend the EVENING fade to cover 5°→0° instead**: The EVENING fade applies a linear gradient from 200→165 over 5 degrees of elevation (0° to -5°). Extending it to start at 5° would stretch the same 35-unit change over 10 degrees, making the transition twice as slow. This would be barely perceptible per-minute and waste the dynamic range during the most visible sunset period (0° to -5°). Holding at 200 until 0° and then fading is the correct design — the user sees yellow-orange during the early evening and watches it warm smoothly as darkness falls.

**Interaction with `oal_column_lights_prepare_rgb_mode_v13` (L1831)**: The prepare automation triggers at elevation < 3° (evening). After the fix, at 2.9° the green value is 200 (Day, via the DAY branch). The prepare automation transitions columns to RGB mode at safe brightness, then sets `manual_control: true`. The RGB transition automation (L1906) then applies `[255, 200, 0]`. At 0°, the EVENING fade begins, transitioning green from 200→165 as the sun descends to -5°. This is a smooth, seamless sequence.

**Previously**: At 2.9° the green snapped to 165 before the prepare automation even ran. The user would see columns snap to warm orange, then the prepare automation would apply 165 green. The prepare→transition handoff was correct but the *input* was wrong.

**Downstream consumers**: `oal_offset_column_rgb_green` is consumed by:
- `oal_column_lights_rgb_transition_v13` (L1906) — reads value, applies to lights
- `oal_reset_soft` (L3631) — reads value for Gaussian-window column reset
- `oal_reset_room` (Change 4) — reads value for Gaussian-window column reset

All three read the stored value. Correcting the calculation at the source automatically fixes all consumers. No changes needed downstream.

---

## Execution Order

1. Change 1 (reverse watcher) — new automation, no dependencies on existing code changes
2. Change 2 (soft reset fix) — modifies existing script, depends on Change 1 being present to reason about race conditions correctly
3. Change 3 (autoreset watcher) — modifies existing automation, independent
4. Change 4 (room reset) — modifies existing script, independent
5. Change 5 (sunset logic) — modifies existing automation, independent of Changes 1-4

Changes are safe in any order — each is independently correct. The listed order matches dependency of reasoning (Change 2's race analysis references Change 1's behavior).

---

## Invariant Risk Assessment

| # | Invariant | Risk | Rationale |
|---|-----------|------|-----------|
| 1 | Brightness bounds: `zone_min <= actual <= zone_max` | **None** | No changes to brightness calculation. Offsets are reset to 0 (tighter bounds). |
| 2 | Govee color temp: `2700K <= actual <= 6500K` | **Low** | Change 4 adds Govee-safe column handling to room reset (previously unprotected). Change 5 fixes the green channel calculation that fed incorrect values during evening 0°–5°. Risk is "low" not "none" because: (a) the Gaussian window detection is duplicated across reset scripts — if bounds change in one place but not others, they could diverge; (b) Change 5 modifies the sunset logic branch structure, which could theoretically produce out-of-range green values if the conditions interact unexpectedly (verified exhaustively in the branch table above). |
| 3 | Manual auto-reset: Returns to adaptive after timeout | **None** | Changes enhance this — reverse watcher ensures config returns to Adaptive. |
| 4 | Force modes override ALL: Sleep/movie bypass calculations | **None** | Reverse watcher condition `state: "Manual"` doesn't match Sleep. Soft reset always sets "Adaptive" (overrides Sleep correctly). |
| 5 | Environmental is ADDITIVE: Offset added to baseline | **None** | No changes to environmental calculation pipeline. |
| 6 | ZEN32 LED = system state | **Low** | Reverse watcher changes `oal_active_configuration` which feeds ZEN32 LED state. LED update is driven by a separate automation watching this input_select — timing depends on that automation's trigger speed vs. the 3s debounce. Verify LED updates within 500ms of config change. |
| 7 | No calculation during pause | **None** | All new code checks `oal_system_paused` (reverse watcher condition at L2869 equivalent; engine condition at L624). |

---

## Verification Plan

### Test 1: Autoreset Recovery (validates Change 1 + Change 3)

**Setup**: System in Adaptive mode, all zones auto-controlled.

1. Query `oal_active_configuration` — confirm "Adaptive"
2. Press ZEN32 brighter → verify config switches to "Manual"
3. Wait for autoreset timeout (or manually clear via HA dev tools: `adaptive_lighting.set_manual_control` with `manual_control: false` on all zones)
4. **Verify within 5s**: `oal_active_configuration` returns to "Adaptive"
5. **Verify**: `oal_offset_global_manual_warmth` is 0
6. **Verify**: all per-zone `oal_manual_offset_*_brightness` helpers are 0
7. **Verify**: engine trace shows a run sourced from Config Manager (Baseline path)

**What this proves**: The full autoreset→reverse watcher→Config Manager→engine pipeline works end-to-end. The offset watcher (Change 3) pushed corrected settings immediately on autoreset. The reverse watcher (Change 1) detected all-clear and transitioned to Adaptive.

### Test 2: Room Reset Recovery — Last Zone (validates Change 1 + Change 4)

**Setup**: Single zone under manual control.

1. Press ZEN32 brighter → config becomes "Manual"
2. Call `script.oal_reset_room` targeting that zone's lights
3. **Verify within 1s**: lights transition to correct adaptive brightness (engine trigger with `force: true`)
4. **Verify within 5s**: `oal_active_configuration` returns to "Adaptive" (reverse watcher fires)
5. **Verify**: per-zone offset is 0

### Test 3: Room Reset — Non-Last Zone (validates Change 4 isolation)

**Setup**: Multiple zones under manual control.

1. Adjust brightness in living room AND kitchen
2. Call `script.oal_reset_room` targeting only living room
3. **Verify**: living room returns to adaptive brightness
4. **Verify**: `oal_active_configuration` stays "Manual" (kitchen still manual)
5. **Verify**: `oal_offset_global_manual_warmth` is NOT reset (other zones still manual)

### Test 4: Room Reset — Columns During Gaussian Window (validates Change 4 Govee safety)

**Setup**: Evening, sun elevation between -5° and 8° (Gaussian RGB window active).
*Simulation alternative*: Use Developer Tools → States to set `sun.sun` attributes `elevation: 2.0`, `rising: false`. Set `input_number.oal_offset_column_rgb_green` to `185`. Restore after testing.

1. Adjust column lights manually
2. Call `script.oal_reset_room` targeting column lights
3. **Verify**: columns display correct RGB color `[255, <green>, 0]`, NOT color_temp
4. **Verify**: no purple/pink flash at any point
5. **Verify**: `manual_control` on column switch includes both column light entities (locked for RGB)

### Test 5: Soft Reset from Manual — Single Engine Run (validates Change 2)

**Setup**: One or more zones under manual control, config is "Manual".

1. Call `script.oal_reset_soft`
2. Check automation traces for `oal_core_adjustment_engine_v13`
3. **Verify**: exactly ONE engine run triggered by the soft reset flow
4. **Verify**: that run was sourced from Config Manager watchdog (Baseline path L1536), NOT from soft reset's direct watchdog

**What this proves**: The `was_non_adaptive` branch correctly detected that Config Manager would fire, and deferred to it instead of firing a second watchdog.

### Test 6: Soft Reset from Adaptive — Single Engine Run (validates Change 2 else branch)

**Setup**: Config is already "Adaptive" (e.g., user ran soft reset as a "clean up" action).

1. Call `script.oal_reset_soft`
2. Check automation traces for `oal_core_adjustment_engine_v13`
3. **Verify**: exactly ONE engine run, sourced from "soft_reset"

**What this proves**: When Config Manager won't fire (no state change), the direct watchdog in the then branch provides the single engine run.

### Test 7: No False Triggers During Config Transitions (validates guard conditions)

**Setup**: System in Adaptive mode.

1. Switch config to "Dim Ambient" (Config Manager sets `manual_control` on dimmed lights, locks `config_transition_active`)
2. Switch config back to "Adaptive" (Config Manager clears `manual_control`, fires own watchdog)
3. **Verify**: reverse watcher does NOT fire during either transition
4. **Verify**: no intermediate "Manual" state during the transitions

**What this proves**: The `oal_config_transition_active` condition guard prevents the reverse watcher from interfering with managed transitions.

### Test 8: No Spurious Trigger on HA Restart (validates `for: "00:00:03"` debounce)

**Setup**: System running normally.

1. Restart Home Assistant
2. Monitor reverse watcher (`oal_auto_switch_to_adaptive_config`) traces for 30s after startup
3. **Verify**: reverse watcher does NOT fire during startup/reload

**What this proves**: The 3s debounce prevents false triggers from temporarily empty/unknown `manual_control` attributes during HA initialization.

### Test 9: Soft Reset During Active Reverse Watcher (validates Change 2 race handling)

**Setup**: Multiple zones under manual control.

1. Clear `manual_control` on all zones via dev tools (triggers reverse watcher's 3s debounce countdown)
2. Immediately (within 3s) call `script.oal_reset_soft`
3. **Verify**: system settles in Adaptive mode
4. **Verify**: no stuck states, no errors in logs
5. **Verify**: total engine runs <= 2 (acceptable: one from whichever path fires Config Manager first)

**What this proves**: The early variable capture (`was_non_adaptive`) and debounce timing prevent deadlocks or missed triggers when both paths race.

### Test 10: Movie Mode End Recovery (validates Change 1 coverage of movie path)

**Setup**: System in Adaptive mode, no manual overrides.

1. Start movie playback on `media_player.living_room_apple_tv`
2. **Verify**: `oal_movie_mode_active` is on, `oal_active_configuration` is "Manual"
3. Stop/pause playback, wait for 90s `end_movie` trigger
4. **Verify within 5s**: `oal_active_configuration` returns to "Adaptive"
5. **Verify**: `oal_movie_mode_active` is off
6. **Verify**: `oal_offset_global_manual_warmth` is 0
7. **Verify**: engine trace shows a run from Config Manager (Baseline path)

**What this proves**: The reverse watcher catches the movie mode end clearing of `manual_control` on all switches, returns the system to Adaptive, and triggers an engine recalculation with current time-of-day settings. This fixes the pre-existing bug where config stayed stuck on "Manual" after a movie ended.

### Test 12: Sunset Logic — No Green Snap During Evening Descent (validates Change 5)

**Setup**: Use Developer Tools → States to control sun elevation. Set `sun.sun` attribute `rising: false`.

1. Set elevation to `6.0` → verify `oal_offset_column_rgb_green` is 200
2. Set elevation to `4.9` → **verify `oal_offset_column_rgb_green` is still 200** (was 165 before fix)
3. Set elevation to `2.0` → verify still 200
4. Set elevation to `0.0` → verify 200 (EVENING fade entry point)
5. Set elevation to `-2.5` → verify ~183 (mid-fade)
6. Set elevation to `-5.0` → verify 165 (fade complete)
7. Set elevation to `-5.1` → verify 165 (NIGHT hold)

**What this proves**: The evening 0°–5° range correctly holds at 200 (Day) instead of snapping to 165 (Night). The EVENING fade from 200→165 occurs smoothly between 0° and -5°.

### Test 13: Sunset Logic — Morning Path Unchanged (validates Change 5 no regression)

**Setup**: Use Developer Tools → States. Set `sun.sun` attribute `rising: true`.

1. Set elevation to `-5.0` → verify `oal_offset_column_rgb_green` is 165
2. Set elevation to `0.0` → verify 165 (pre-fade hold)
3. Set elevation to `4.9` → verify 165 (still pre-fade)
4. Set elevation to `5.0` → verify 165 (MORNING fade entry)
5. Set elevation to `8.5` → verify ~183 (mid-fade)
6. Set elevation to `12.0` → verify 200 (fade complete)

**What this proves**: The morning path is completely unchanged by the fix. The NIGHT branch still correctly catches `rising AND elevation < 5`, holding at 165 until the MORNING fade begins at 5°.

### Test 11: Soft Reset Does NOT Produce 6+ Engine Runs (validates Change 3 guard)

**Setup**: Multiple zones under manual control, config is "Manual".

1. Call `script.oal_reset_soft`
2. Immediately monitor `oal_core_adjustment_engine_v13` traces
3. **Verify**: total engine runs <= 2 (1 from Config Manager, potentially 1 from a non-force watchdog that squeezed through before the guard evaluated)
4. **Verify**: NOT 6-7 engine runs (which would indicate the `script.oal_reset_soft` running guard in Change 3 failed)

**What this proves**: The `is_state('script.oal_reset_soft', 'off')` guard in Change 3 prevents the per-zone `oal_manual_control_sync_offset` automations from each firing their own watchdog during soft reset's bulk-clear.

---

## Acceptance Criteria

| Criterion | Measurement |
|---|---|
| Reverse watcher does not fire within 30s of HA restart | Check traces after restart |
| `oal_reset_soft` produces exactly ONE engine run from "Manual" start state | Trace count |
| `oal_reset_soft` produces exactly ONE engine run from "Adaptive" start state | Trace count |
| `oal_reset_room` targeting columns during Gaussian window produces NO purple/pink flash | Visual observation |
| `oal_reset_room` provides immediate visual response (< 1s) | Visual observation |
| All autoreset paths eventually return config to "Adaptive" | State monitoring |
| Global warmth offset resets to 0 when all zones return to Adaptive | Entity state check |
| No "Manual" intermediate state during managed config transitions | State history |
| Column `manual_control` is maintained during Gaussian RGB window after room reset | Entity attribute check |
| Movie mode end returns config to "Adaptive" within 5s | State monitoring |
| Soft reset does NOT produce 6+ engine runs from per-zone sync_offset watchers | Trace count |
| Evening descent: `oal_offset_column_rgb_green` stays 200 between 5° and 0° | Dev Tools state check |
| Morning ascent: `oal_offset_column_rgb_green` stays 165 between -5° and 5° (unchanged) | Dev Tools state check |
