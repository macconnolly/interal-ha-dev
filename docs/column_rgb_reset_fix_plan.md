# Column Lights RGB Mode Reset Fix Plan

## Document Purpose

This document contains two parts:

1. **Part A: Line-Level Resolution Plan** -- Five precise edits to fix column RGB mode
   detection and the `sleep_rgb_color` override bug in the reset scripts.

2. **Part B: Force-Apply & Manual-Control Bypass Audit** -- A comprehensive inventory of
   every code path that can overwrite RGB-mode columns or clear their `manual_control`
   protection.

**Target file:** `/home/mac/HA/implementation_10/packages/oal_lighting_control_package.yaml`

**Date:** 2026-02-10

---

# PART A: LINE-LEVEL RESOLUTION PLAN

## Issues Addressed

| Issue | Summary | Severity |
|-------|---------|----------|
| **1** | Soft reset `in_column_rgb_mode` (L3693-3694) covers entire night instead of Gaussian fade window | Medium |
| **2** | Room reset `in_column_rgb_mode` (L4002-4004) covers entire night instead of Gaussian fade window | Medium |
| **3** | Soft reset default branch (L3790-3802) overrides `sleep_rgb_color` to `[255, 165, 0]`, clobbering the correct `[245, 120, 0]` configured at L558 | **High** |
| **4** | Force-apply engine flash pushes color_temp to RGB-mode columns during resets | Low (cosmetic) |
| **5** | `apply_switches` behavior change at deep night needs documentation | Low (docs) |
| **6** | Room reset default branch consistency with soft reset default branch | Low (docs) |

## Total Edits: 5 (E1 through E5)

## Apply Order: Reverse line number (E5, E4, E3, E2, E1)

---

## PRE-EDIT ANCHOR VERIFICATION

Before making any edits, verify that these exact strings appear at these exact line
numbers. If any anchor does not match, STOP -- the file has changed since this plan was
written.

| Line | Expected Content |
|------|-----------------|
| 3687 | `sun_elevation: "{{ state_attr('sun.sun', 'elevation') \| float(90) }}"` |
| 3688 | `sun_rising: "{{ state_attr('sun.sun', 'rising') \| default(true) }}"` |
| 3689 | `# Column RGB mode spans the FULL night: from prepare_rgb (3` |
| 3693 | `in_column_rgb_mode: >` |
| 3694 | `{{ sun_elevation < 3 or (sun_rising and sun_elevation < 8) }}` |
| 3737 | `columns_manual: "{{ 'Columns' in overridden_zone_names }}"` |
| 3788 | `default:` |
| 3802 | `sleep_rgb_color: [255, 165, 0]` |
| 3997 | `# Column RGB mode detection` |
| 4002 | `in_column_rgb_mode: >` |
| 4011 | `# Switches to receive adaptive_lighting.apply` |
| 4062 | `# ====` |
| 4063 | `# Column Zones: Govee-Safe Reset (mirrors oal_reset_soft L3688-3739)` |
| 4090 | `default:` |
| 558  | `sleep_rgb_color: [245, 120, 0]` |

---

## EDIT E5: Room Reset Column Section Comment Update

**Lines:** 4062-4096
**Addresses:** Issue 6 (room reset default branch documentation and consistency)

### Current Code (lines 4062-4096, verbatim)

```yaml
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
                    value_template: "{{ in_column_rgb_mode }}"
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
```

### Replacement Code

```yaml
      # =========================================================================
      # Column Zones: Govee-Safe Reset (mirrors oal_reset_soft L3759-3808)
      # =========================================================================
      # in_column_rgb_mode is TRUE only during the Gaussian fade window
      # (evening: 3 to -5 deg setting; morning: 5 to 8 deg rising).
      # At deep night (below -5 deg), in_column_rgb_mode is FALSE even if
      # manual_control is still set, so the default branch clears manual_control
      # and lets AL sleep mode take over with [245, 120, 0] at 1%.
      #
      # NOTE: The engine fires with force=true BEFORE this block (L4039).
      # The engine's apply phase pushes color_temp to ALL on lights including
      # manual-controlled columns. During the Gaussian fade window, this causes
      # a sub-second color_temp flash before the RGB protection below corrects
      # the color. This is a known limitation; the flash is not visible to users
      # because the correction follows within ~100ms (same HA action sequence).
      #
      # This default branch intentionally does NOT call change_switch_settings
      # (unlike oal_reset_soft). The room reset is a targeted operation that
      # preserves the engine's current AL switch parameters. The soft reset
      # uses use_defaults: configuration to restore AL to YAML baseline.
      - if:
          - condition: template
            value_template: "{{ targets_include_columns }}"
        then:
          - choose:
              - conditions:
                  - condition: template
                    value_template: "{{ in_column_rgb_mode }}"
                sequence:
                  # During Gaussian fade window: apply correct RGB color directly
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
              # Outside Gaussian fade window: release columns to AL.
              # At deep night (below -5 deg): AL sleep mode applies [245, 120, 0] at 1%.
              # At daytime: AL normal mode applies color_temp 2700K.
              - service: adaptive_lighting.set_manual_control
                target:
                  entity_id: switch.adaptive_lighting_column_lights
                data:
                  manual_control: false
```

### Why

Three purposes: (1) Fix the stale cross-reference from `L3688-3739` to the correct
`L3759-3808`. (2) Document the narrowed-window behavior -- at deep night, the default
branch intentionally releases columns to AL sleep mode. (3) Document the force-apply
engine flash as a known limitation (Issue 4). (4) Explicitly state why the room reset
default branch does NOT call `change_switch_settings` (answering Issue 6 -- the asymmetry
with soft reset is intentional).

No functional code changes. Only comments updated and expanded.

### Verify After Edit

- YAML parsing: No syntax errors.
- The `if/then/choose/default` structure is unchanged.
- The two service calls in the choose branch and the one in the default branch are
  byte-for-byte identical to the originals.

---

## EDIT E4: Room Reset `apply_switches` Comment Update

**Lines:** 4011-4019
**Addresses:** Issue 5 (document `apply_switches` behavior at deep night)

### Current Code (lines 4011-4019, verbatim)

```yaml
          # Switches to receive adaptive_lighting.apply (turn_on_lights: true)
          # During column RGB mode: exclude columns (they get direct RGB above)
          # Outside RGB mode: include all targets (preserves turn-on behavior for columns)
          apply_switches: >
            {% if targets_include_columns and in_column_rgb_mode %}
              {{ non_column_switches }}
            {% else %}
              {{ target_switches }}
            {% endif %}
```

### Replacement Code

```yaml
          # Switches to receive adaptive_lighting.apply (turn_on_lights: true)
          # During Gaussian fade window (in_column_rgb_mode=true):
          #   Exclude columns -- they receive direct RGB color above, and AL
          #   must not overwrite that with color_temp.
          # Outside Gaussian fade window (in_column_rgb_mode=false):
          #   Include columns -- at deep night this pushes AL sleep settings
          #   [245, 120, 0] at 1% after the default branch clears manual_control.
          #   At daytime this pushes normal AL color_temp settings.
          apply_switches: >
            {% if targets_include_columns and in_column_rgb_mode %}
              {{ non_column_switches }}
            {% else %}
              {{ target_switches }}
            {% endif %}
```

### Why

The Jinja2 template is unchanged. The comments are expanded to document the behavioral
consequence of the narrowed `in_column_rgb_mode` window: at deep night,
`in_column_rgb_mode` is now FALSE (because the window is narrowed to >= -5 degrees),
so columns ARE included in `apply_switches`.

### Verify After Edit

- The `apply_switches` Jinja2 template is byte-for-byte identical to the original.
- Only comments changed.

---

## EDIT E3: Room Reset `in_column_rgb_mode` -- Narrow the Window

**Lines:** 3997-4004
**Addresses:** Issue 2

### Current Code (lines 3997-4004, verbatim)

```yaml
          # Column RGB mode detection --- covers FULL night period
          # SYNC: bounds must match prepare_rgb trigger (L1838: below 3)
          #        and morning_exit trigger (L1945: above 8)
          sun_elevation: "{{ state_attr('sun.sun', 'elevation') | float(90) }}"
          sun_rising: "{{ state_attr('sun.sun', 'rising') | default(true) }}"
          in_column_rgb_mode: >
            {{ columns_currently_manual and
               (sun_elevation < 3 or (sun_rising and sun_elevation < 8)) }}
```

### Replacement Code

```yaml
          # Column RGB mode protection window:
          # EVENING: prepare_rgb (3 deg setting) to sleep_trigger (-5 deg setting).
          #   Below -5 deg, AL sleep mode is the correct state. Clearing
          #   manual_control lets AL apply sleep_rgb_color [245, 120, 0] at 1%.
          # MORNING: sleep_trigger exit (5 deg rising) to morning_exit (8 deg rising).
          #   Defensive only -- autoreset clears manual_control ~4h after prepare_rgb,
          #   so columns_currently_manual is typically false by morning.
          # SYNC: evening upper = prepare_rgb trigger (L1842: below 3)
          #        evening lower = sleep_trigger (L2017: below -5)
          #        morning lower = sleep_trigger exit (L2022: above 5)
          #        morning upper = morning_exit trigger (L1949: above 8)
          sun_elevation: "{{ state_attr('sun.sun', 'elevation') | float(90) }}"
          sun_rising: "{{ state_attr('sun.sun', 'rising') | default(true) }}"
          in_column_rgb_mode: >
            {{ columns_currently_manual and
               ((not sun_rising and sun_elevation < 3 and sun_elevation >= -5) or
                (sun_rising and sun_elevation >= 5 and sun_elevation < 8)) }}
```

### Why

The old elevation window `sun_elevation < 3 or (sun_rising and sun_elevation < 8)`
covered the entire night. `sun_elevation < 3` is TRUE at -5, -10, -20 degrees -- the
full deep night. The narrowed window adds two constraints:

1. **Evening branch** adds `and sun_elevation >= -5` and `not sun_rising`. Below -5
   degrees, AL sleep mode is ON (set by `sleep_trigger` at L2017). Columns should
   transition from the OAL RGB mode to AL sleep mode.

2. **Morning branch** changes from `sun_rising and sun_elevation < 8` (which matches
   at any elevation below 8 when rising) to `sun_rising and sun_elevation >= 5 and
   sun_elevation < 8`. The lower bound of 5 degrees matches the sleep_trigger's morning
   exit at L2022.

The `columns_currently_manual` gate (defined at L3994-3995, unchanged) remains the first
condition.

Pre-computed `sun_elevation` and `sun_rising` at lines 4000-4001 are already correct and
unchanged.

### Verify After Edit

Truth table for `in_column_rgb_mode` (assuming `columns_currently_manual = TRUE`):

| Elevation | Rising | Old Result | New Result | Correct? |
|-----------|--------|------------|------------|----------|
| +10 | false | TRUE | FALSE | YES -- daytime |
| +1 | false | TRUE | TRUE | YES -- active Gaussian fade |
| -2 | false | TRUE | TRUE | YES -- active Gaussian fade |
| -5 | false | TRUE | TRUE (-5 >= -5) | YES -- boundary |
| -6 | false | TRUE | FALSE | YES -- deep night, release |
| -20 | false | TRUE | FALSE | YES -- deep night |
| -20 | true | TRUE | FALSE (< 5) | YES -- early morning |
| +3 | true | TRUE | FALSE (< 5) | YES -- morning, sleep on |
| +6 | true | TRUE | TRUE | YES -- between sleep off and exit |
| +9 | true | TRUE | FALSE (>= 8) | YES -- past morning exit |

When `columns_currently_manual = FALSE`: all results are FALSE (unchanged).

---

## EDIT E2: Soft Reset Default Branch -- Remove `sleep_rgb_color` Override

**Lines:** 3788-3808
**Addresses:** Issue 3 (THE BIG ONE -- wrong sleep color)

### The Bug

The soft reset default branch passes `sleep_rgb_color: [255, 165, 0]` to
`change_switch_settings`. This **overrides** the AL switch's configured value of
`[245, 120, 0]` (L558). When `manual_control` is subsequently cleared and AL sleep mode
takes over, AL uses [255, 165, 0] (the Gaussian evening orange -- too bright/yellow for
deep night) instead of the intended [245, 120, 0] (dim deep-night amber).

### Parameter Audit

The old code overrides multiple parameters on top of `use_defaults: configuration`.
Here is the audit of each against the YAML definition at L533-561:

| Parameter | Old Override | YAML Value (L533-561) | Match? | Notes |
|-----------|-------------|----------------------|--------|-------|
| `include_config_in_attributes` | true | true (L543) | YES | Redundant |
| `initial_transition` | 1 | 1 (L539) | YES | Redundant |
| `sleep_transition` | 1 | 0 (L559) | **NO** | YAML=0 correct for Govee/Matter |
| `transition` | 1 | 0 (L538) | **NO** | YAML=0 correct for Govee/Matter |
| `separate_turn_on_commands` | true | true (L553) | YES | Redundant |
| `send_split_delay` | 1 | 50 (L561) | **NO** | YAML=50 is recommended value |
| `prefer_rgb_color` | false | false (L554) | YES | Redundant |
| `sleep_rgb_or_color_temp` | "rgb_color" | "rgb_color" (L557) | YES | Redundant |
| `sleep_rgb_color` | [255, 165, 0] | [245, 120, 0] (L558) | **NO** | **BUG** |

Four parameters differ from the YAML. The YAML values are the tested-safe values:
- `transition: 0` avoids Matter timing issues with Govee firmware
- `sleep_transition: 0` same reason
- `send_split_delay: 50` prevents command collision on Matter bridge
- `sleep_rgb_color: [245, 120, 0]` is the intended deep-night amber

### Current Code (lines 3788-3808, verbatim)

```yaml
            default:
              # Outside Gaussian window: Reset column lights to color_temp mode
              - service: adaptive_lighting.change_switch_settings
                data:
                  entity_id: switch.adaptive_lighting_column_lights
                  use_defaults: configuration
                  include_config_in_attributes: true
                  initial_transition: 1
                  sleep_transition: 1
                  transition: 1
                  separate_turn_on_commands: true
                  send_split_delay: 1
                  prefer_rgb_color: false
                  sleep_rgb_or_color_temp: "rgb_color"
                  sleep_rgb_color: [255, 165, 0]
              # Clear column lights manual control
              - service: adaptive_lighting.set_manual_control
                target:
                  entity_id: switch.adaptive_lighting_column_lights
                data:
                  manual_control: false
```

### Replacement Code

```yaml
            default:
              # Outside Gaussian fade window: release columns to AL control.
              # With the narrowed in_column_rgb_mode window, this branch now runs
              # at deep night (below -5 deg) where AL sleep mode is ON.
              # Clearing manual_control lets AL immediately apply its configured
              # sleep_rgb_color [245, 120, 0] at 1% (defined at L558).
              #
              # use_defaults: configuration restores the AL switch to its YAML
              # definition (L533-561). This is the source of truth for all
              # parameters including sleep_rgb_color, transition, send_split_delay.
              # No individual parameter overrides are needed or desired here.
              - service: adaptive_lighting.change_switch_settings
                data:
                  entity_id: switch.adaptive_lighting_column_lights
                  use_defaults: configuration
              # Clear column lights manual control -- AL takes over
              - service: adaptive_lighting.set_manual_control
                target:
                  entity_id: switch.adaptive_lighting_column_lights
                data:
                  manual_control: false
```

### Why

By removing all individual parameter overrides and relying solely on
`use_defaults: configuration`, the AL switch is restored to its YAML-defined baseline.
This includes the correct `sleep_rgb_color: [245, 120, 0]`, the correct `transition: 0`,
and the correct `send_split_delay: 50`. The YAML definition (L533-561) becomes the
single source of truth.

### Verify After Edit

1. After the default branch runs, inspect AL switch attributes:
   - `sleep_rgb_color` should be `[245, 120, 0]` (NOT `[255, 165, 0]`)
   - `transition` should be `0` (NOT `1`)
   - `sleep_transition` should be `0` (NOT `1`)
   - `send_split_delay` should be `50` (NOT `1`)
2. After manual_control clears with sleep mode ON:
   - Column lights should display [245, 120, 0] at 1% brightness
   - NOT [255, 165, 0] at any brightness

---

## EDIT E1: Soft Reset `in_column_rgb_mode` -- Narrow the Window

**Lines:** 3689-3694
**Addresses:** Issue 1 (narrow the window), Issue 6 (use pre-computed variables)

### Current Code (lines 3689-3694, verbatim)

```yaml
      # Column RGB mode spans the FULL night: from prepare_rgb (3 evening)
      # to morning_exit (8 morning). NOT just the Gaussian transition window.
      # SYNC: bounds must match prepare_rgb trigger (L1838: below 3)
      #        and morning_exit trigger (L1945: above 8)
      in_column_rgb_mode: >
        {{ sun_elevation < 3 or (sun_rising and sun_elevation < 8) }}
```

### Replacement Code

```yaml
      # Column RGB mode protection window:
      # EVENING: prepare_rgb (3 deg setting) to sleep_trigger (-5 deg setting).
      #   Below -5 deg, AL sleep mode is the correct state -- the default
      #   branch clears manual_control, letting AL apply sleep_rgb_color.
      # MORNING: sleep_trigger exit (5 deg rising) to morning_exit (8 deg rising).
      #   Defensive only -- autoreset clears manual_control ~4h after prepare_rgb,
      #   so columns_manual is typically false by morning.
      # SYNC: evening upper = prepare_rgb trigger (L1842: below 3)
      #        evening lower = sleep_trigger (L2017: below -5)
      #        morning lower = sleep_trigger exit (L2022: above 5)
      #        morning upper = morning_exit trigger (L1949: above 8)
      in_column_rgb_mode: >
        {{ (not sun_rising and sun_elevation < 3 and sun_elevation >= -5) or
           (sun_rising and sun_elevation >= 5 and sun_elevation < 8) }}
```

### Why

Same reasoning as E3. Uses `sun_elevation` and `sun_rising` pre-computed at lines
3687-3688. No `{% set %}` locals needed.

**Structural note:** In `oal_reset_soft`, this variable is gated by `columns_manual`
at line 3761 before it is evaluated in the `choose` at line 3766. The `columns_manual`
variable (line 3737) checks `'Columns' in overridden_zone_names`, which checks
`manual_control | length > 0` via the sensor at L4321-4336. So even if
`in_column_rgb_mode` evaluates to TRUE, the column handling block is only entered
when `columns_manual` is TRUE.

Unlike the room reset (E3), the soft reset does NOT include `columns_manual` inside the
`in_column_rgb_mode` variable. This is correct because `columns_manual` is already an
outer gate. The room reset includes `columns_currently_manual` in its variable because
the room reset's outer gate is `targets_include_columns` (different question).

### Verify After Edit

Same truth table as E3, except the `columns_currently_manual` gate is external
(at L3761) rather than embedded in the variable.

---

## EDIT APPLICATION ORDER

| Order | Edit | Lines Affected | Type |
|-------|------|----------------|------|
| 1st | **E5** | 4062-4096 | Comments only |
| 2nd | **E4** | 4011-4019 | Comments only |
| 3rd | **E3** | 3997-4004 | Comment + template change |
| 4th | **E2** | 3788-3808 | Comment + code change |
| 5th | **E1** | 3689-3694 | Comment + template change |

E5 is at the highest line numbers and is applied first. Each subsequent edit targets
lower line numbers and is unaffected by the edits above it.

---

## ISSUE 4: FORCE-APPLY ENGINE FLASH -- ASSESSMENT

### The Problem

In `oal_reset_room`, the execution order is:

1. **L4039-4047:** Fire `oal_watchdog_trigger` with `force: true`, wait for engine
2. **L4052-4060:** Clear non-column `manual_control`
3. **L4065-4096:** Column protection (`choose`: RGB vs default)

The engine (L1272-1290) processes the force trigger with `is_force_apply = true`. Line
1278: `on_lights = all_on_lights` (includes manual-controlled columns). The engine calls
`adaptive_lighting.apply` on the column_lights switch, pushing color_temp to RGB-mode
lights. This happens BEFORE the column protection at step 3.

In `oal_reset_soft`, column protection runs FIRST (L3759-3808), then watchdog fires
(L3868). But the engine still includes columns in force-apply.

### Options Evaluated

| Option | Description | Verdict |
|--------|-------------|---------|
| A. Reorder | Move column protection before engine | Does not fix -- flash just moves |
| B. Exclude columns from engine | Add RGB-mode check to engine | Type C change, architecturally wrong |
| C. Add delay | Delay between engine and protection | Does not fix |
| D. Accept | Document as known limitation | **Recommended** |

### Recommendation

Accept the flash (Option D). It is sub-second, cosmetic, self-correcting. Documented
in E5's expanded comments. A proper fix requires engine-level zone filtering, which is
out of scope.

---

## ISSUE 6: ROOM RESET vs SOFT RESET DEFAULT BRANCH

The room reset default branch does only `set_manual_control: false`. The soft reset
default branch does `change_switch_settings` + `set_manual_control: false`.

This asymmetry is intentional:
- **Soft reset** is a full system reset. It restores AL switch to YAML baseline because
  prior operations may have modified parameters. It also zeros all offsets.
- **Room reset** is targeted. It preserves engine-calculated parameters and only releases
  `manual_control`.

No change needed. Documented in E5.

---

## EDGE CASE VERIFICATION (POST-EDIT)

### EC1: Soft reset at -6 deg (deep night, manual_control set)

- `in_column_rgb_mode = (not false and -6 < 3 and -6 >= -5)` = FALSE (-6 < -5 fails)
- `columns_manual` = TRUE
- Path: column handling enters, choose falls to **default branch**
- E2 default: `change_switch_settings` with `use_defaults: configuration` (restores
  `sleep_rgb_color` to [245, 120, 0]), then `set_manual_control: false`
- AL sleep mode ON, pushes [245, 120, 0] at 1%
- **Result:** Columns transition from [255, 165, 0] @ 20% to [245, 120, 0] @ 1%

### EC2: Room reset at -6 deg (same scenario)

- `in_column_rgb_mode = TRUE and (FALSE)` = FALSE
- Engine fires (force=true), brief color_temp flash on columns
- Default branch: `set_manual_control: false`, AL sleep takes over
- `apply_switches` includes columns, pushes sleep values
- **Result:** Same as EC1, with brief engine flash

### EC3: Soft reset at -2 deg (active Gaussian fade)

- `in_column_rgb_mode = (true and true and true)` = TRUE
- RGB protection branch: sets [255, column_rgb_green, 0], re-locks manual_control
- **Result:** Columns protected, correct RGB color preserved

### EC4: Room reset at +1 deg (just after prepare_rgb)

- `in_column_rgb_mode = TRUE and (true and true and true)` = TRUE
- RGB protection: sets correct color, re-locks manual_control
- `apply_switches` excludes columns
- **Result:** Columns protected

### EC5: Soft reset at midnight (manual_control cleared by autoreset)

- `columns_manual` = FALSE (autoreset cleared hours ago)
- Column handling block SKIPPED entirely
- **Result:** Columns untouched, remain under AL sleep mode

### EC6: Room reset at +6 deg rising (morning)

- `columns_currently_manual` = FALSE (autoreset cleared ~10h ago)
- `in_column_rgb_mode` = FALSE (short-circuits on first condition)
- Default: `set_manual_control: false` (no-op)
- **Result:** Columns under normal AL control

### EC7: HA restart at midnight then soft reset

- Restart clears manual_control. sleep_trigger fires on HA start, enables sleep.
- Soft reset: `columns_manual` = FALSE, column block SKIPPED
- **Result:** Columns at [245, 120, 0] @ 1%

---

## KNOWN LIMITATIONS NOT ADDRESSED

### 1. Config Manager defeats soft reset RGB protection

When `oal_reset_soft` sets config to "Adaptive" (L3855) and `was_non_adaptive = true`,
the Config Manager fires. Its baseline path (L1501-1509) clears manual_control on ALL
switches including columns via `group.oal_control_switches` (L129-137). This defeats
the RGB protection the soft reset just applied at L3779-3787.

**Impact:** Soft reset RGB protection fails when transitioning from any non-Adaptive
config during the Gaussian fade window.

**Fix scope:** Type B change to Config Manager. Separate plan needed.

### 2. 20% to 1% brightness jump

When reset releases columns to AL sleep mode at deep night, brightness drops from 20%
(evening RGB) to 1% (sleep mode). This is intended but visually jarring.

### 3. Morning window is unreachable

The morning branch `(sun_rising and sun_elevation >= 5 and sun_elevation < 8)` will
never evaluate to TRUE under normal operation because autoreset clears manual_control
~10 hours before morning. Harmless defensive code.

---
---

# PART B: FORCE-APPLY & MANUAL-CONTROL BYPASS AUDIT

This section catalogs every code path in the OAL package that can:
1. Call `adaptive_lighting.apply` targeting column lights
2. Clear `manual_control` on column lights (set to false)
3. Fire `oal_watchdog_trigger` with `force: true` (which triggers force-apply in engine)

For each path, the assessment indicates whether it can fire during the RGB-mode window
(elevation < 3, not rising, manual_control set) and whether it would overwrite RGB colors
or clear manual_control protection.

---

## B.1: ENGINE FORCE-APPLY ANALYSIS

### How Force-Apply Works (L574-1290)

The core engine at L574 triggers on:
- State changes to offset input_numbers (L580-588)
- Time pattern every 15 minutes (L617)
- `oal_watchdog_trigger` events (L620)

The engine computes `is_force_apply` at L680-682:
```yaml
is_force_apply: >
  {{ trigger.platform == 'event' and
     (trigger.event.data.force | default(false)) == true }}
```

In the apply phase (L1160-1290), each zone builds its `on_lights` list at L1278:
```yaml
on_lights: "{{ all_on_lights if is_force_apply else (all_on_lights | reject('in', manual_lights) | list) }}"
```

**When `is_force_apply = true`:** `on_lights` includes ALL on lights, including those
with `manual_control` set. The engine then calls `adaptive_lighting.apply` (L1283-1290)
on these lights. AL pushes its current calculated parameters, which for column_lights
means `color_temp` mode (since `prefer_rgb_color: false` at L554).

**Conclusion:** Any `oal_watchdog_trigger` event with `force: true` causes the engine
to push `color_temp` to RGB-mode column lights, regardless of `manual_control`.

### Sleep Mode Short-Circuit (L762-775)

When `oal_active_configuration == 'Sleep'`, the engine takes a different path at L763:
```yaml
- if: "{{ states('input_select.oal_active_configuration') == 'Sleep' }}"
  then:
    - service: switch.turn_on
      target:
        entity_id: "{{ expand('group.oal_sleep_mode_switches') ... }}"
    - service: adaptive_lighting.apply
      target:
        entity_id: "{{ expand('group.oal_control_switches') ... }}"
      data:
        turn_on_lights: false
        transition: 5
    - stop: "Sleep mode active"
```

This `adaptive_lighting.apply` targets ALL control switches including column_lights.
It pushes sleep mode parameters to all on lights. During RGB mode, this would push
`sleep_rgb_color: [245, 120, 0]` (since sleep mode switch is on and
`sleep_rgb_or_color_temp: "rgb_color"`).

**Risk during RGB mode:** If the engine fires with Sleep config AND columns have
manual_control, the `adaptive_lighting.apply` here does NOT filter by manual_control
(no `lights:` parameter specified, no `is_force_apply` check). The AL integration's
`apply` service behavior when `manual_control` is set but no `lights` filter is
specified: AL applies to non-manual lights only by default. **This is safe** -- AL
respects manual_control when apply is called without an explicit lights list.

Wait -- this needs verification. The engine's per-zone apply phase (L1272-1290) DOES
specify `lights: "{{ on_lights }}"` which explicitly includes manual lights on force.
But the sleep mode short-circuit at L768 does NOT specify `lights:`, so AL applies
to non-manual lights only. **The sleep short-circuit is safe for RGB-mode columns.**

---

## B.2: ALL `oal_watchdog_trigger` FIRING POINTS WITH `force: true`

| Line | Source | Has `force: true`? | Can Fire During RGB Window? | Risk |
|------|--------|-------------------|---------------------------|------|
| L620 | Engine trigger (receives events) | N/A (receiver) | N/A | N/A |
| L1536 | Config Manager baseline path | YES | YES (if config changes) | **HIGH** |
| L1671 | Config Manager sleep shortcut | YES | YES (if Sleep activated) | MEDIUM |
| L1753 | Config Manager override path | NO (no force field) | YES | LOW |
| L2597 | System Startup (L2566) | YES | YES (HA restart during RGB) | MEDIUM |
| L2618 | Watchdog Service (L2605) | NO (no force field) | YES | NONE |
| L3254 | Autoreset offset clear | NO (no force field) | YES (autoreset at ~9:50 PM) | NONE |
| L3277 | oal_global_adjustment_start | YES | YES (Zen32 press during RGB) | MEDIUM |
| L3868 | oal_reset_soft | YES | YES (if reset during RGB) | HIGH |
| L4039 | oal_reset_room | YES | YES (if reset during RGB) | HIGH |

### Detail for each HIGH/MEDIUM risk:

**L1536 -- Config Manager baseline path (HIGH):**
Fires when transitioning TO Adaptive config. Includes `force: true`. If this fires
during the RGB window (e.g., soft reset sets config to Adaptive), the engine runs
with force-apply and pushes color_temp to RGB-mode columns. Additionally, the Config
Manager at L1501-1509 clears manual_control on ALL switches before this point, so
columns lose their manual_control protection.

**L1671 -- Config Manager sleep shortcut (MEDIUM):**
Fires when config changes to Sleep. The engine's sleep mode short-circuit (L762-775)
turns on all sleep mode switches and calls `adaptive_lighting.apply` without explicit
lights list. AL respects manual_control here, so RGB-mode columns are not affected.
However, the sleep mode switch for columns gets turned ON, which is the correct
intended state. Risk is medium because of potential ordering issues.

**L2597 -- System Startup (MEDIUM):**
At startup, L2594 calls `script.oal_reset_global`, which calls `oal_reset_soft`. After
that completes, L2597 fires watchdog with force=true. At startup, manual_control is
already cleared (AL does not persist it). So there are no RGB-mode columns to overwrite.
Risk is medium only if startup happens during the RGB window AND something re-sets
manual_control before L2597 fires (unlikely).

**L3277 -- oal_global_adjustment_start (MEDIUM):**
Fires when user presses Zen32 for brightness adjustment. Fires with force=true. If
user adjusts brightness during RGB mode, the engine pushes color_temp to columns.
HOWEVER, the deferred manual control script (L3292-3328) then re-sets manual_control
on all ON lights. This creates a flash-then-restore pattern. The column lights briefly
receive color_temp then the deferred script re-locks them. But the deferred script
sets manual_control TRUE (not FALSE), so it does not clear protection -- it potentially
RESTORES it. The flash is the issue.

**L3868 -- oal_reset_soft (HIGH):**
Already analyzed in Part A. Column protection runs at L3759-3787 (re-locks
manual_control), then watchdog fires at L3868. Engine force-applies color_temp to
columns despite manual_control.

**L4039 -- oal_reset_room (HIGH):**
Already analyzed in Part A. Engine fires BEFORE column protection. Color_temp flash
then correction.

---

## B.3: ALL `manual_control: false` CLEARING POINTS

Every location where `adaptive_lighting.set_manual_control` is called with
`manual_control: false`, checked for whether it targets column lights.

### B.3.1: Config Manager -- Adaptive Baseline (L1505-1509)

```yaml
# Line 1501-1509
- repeat:
    for_each: "{{ all_switches_expanded }}"
    sequence:
      - service: adaptive_lighting.set_manual_control
        target:
          entity_id: "{{ repeat.item }}"
        data:
          manual_control: false
```

**Targets columns?** YES. `all_switches_expanded` expands `group.oal_control_switches`
(L129-137) which includes `switch.adaptive_lighting_column_lights`.

**Can fire during RGB window?** YES. When `oal_reset_soft` sets config to Adaptive while
`was_non_adaptive = true`, or when sleep mode ends and returns to Adaptive.

**RISK: HIGH.** This clears column manual_control during the RGB window, defeating
the soft reset's RGB protection at L3779-3787.

### B.3.2: Config Manager -- Force On (Full Bright) (L1554-1558)

```yaml
# Line 1550-1558
- repeat:
    for_each: "{{ all_switches_expanded }}"
    sequence:
      - service: adaptive_lighting.set_manual_control
        target:
          entity_id: "{{ repeat.item }}"
        data:
          manual_control: false
```

**Targets columns?** YES. Same `all_switches_expanded`.

**Can fire during RGB window?** YES. If user selects "Full Bright" config during evening.

**RISK: HIGH.** Clears column manual_control. Subsequent `adaptive_lighting.apply`
at L1564 pushes color_temp to all lights including columns.

### B.3.3: Config Manager -- Config transition cleanup (L1621-1626)

```yaml
# Line 1621-1626
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: "{{ repeat.item }}"
  data:
    lights: "{{ lights_for_switch }}"
    manual_control: false
```

**Targets columns?** CONDITIONALLY. Only targets lights that were in the PREVIOUS
config's `prev_controlled_lights`. If the previous config controlled column lights
(e.g., TV Mode turns off columns, or Dim Ambient dims them), then yes.

**Can fire during RGB window?** YES. When transitioning away from TV Mode or Dim
Ambient.

**RISK: MEDIUM.** Only clears manual_control on previously-controlled lights, not
all lights. But if columns were in prev_controlled_lights, their manual_control
gets cleared.

### B.3.4: Morning Exit RGB (L1986-1994)

```yaml
# Line 1986-1994
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: switch.adaptive_lighting_column_lights
  data:
    lights:
      - light.living_column_strip_light_matter
      - light.dining_column_strip_light_matter
    manual_control: false
```

**Targets columns?** YES. Explicitly.

**Can fire during RGB window?** NO. Only fires at elevation > 8 (rising) (L1949).
The RGB window ends at elevation 8 (or -5 on the evening side).

**RISK: NONE.** Correctly timed -- fires after RGB mode should be complete.

### B.3.5: Isolated Override Manager exit (L2291-2295)

```yaml
# Line 2291-2295
- service: adaptive_lighting.set_manual_control
  data:
    entity_id: switch.adaptive_lighting_main_living
    lights: light.office_desk_lamp
    manual_control: false
```

**Targets columns?** NO. Only targets `switch.adaptive_lighting_main_living` and
`light.office_desk_lamp`.

**RISK: NONE.**

### B.3.6: Movie Mode exit (L2524-2529)

```yaml
# Line 2524-2529
- service: adaptive_lighting.set_manual_control
  continue_on_error: true
  target:
    entity_id: "{{ expand('group.oal_control_switches') | map(attribute='entity_id') | list }}"
  data:
    manual_control: false
```

**Targets columns?** YES. Expands `group.oal_control_switches`.

**Can fire during RGB window?** YES. If movie mode is deactivated during evening.

**RISK: HIGH.** Clears manual_control on ALL switches including columns. If columns
are in RGB mode, AL immediately takes over and pushes color_temp.

### B.3.7: Nightly Maintenance (L2632-2636)

```yaml
# Line 2632-2636
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: "{{ expand('group.oal_control_switches') | map(attribute='entity_id') | list }}"
  data:
    manual_control: false
```

**Targets columns?** YES. Expands `group.oal_control_switches`.

**Can fire during RGB window?** NO. Fires at 03:00 (L2628-2629). At 3 AM in Denver
winter, elevation is well below -5 degrees. manual_control is already cleared by
autoreset (~9:50 PM). This is a no-op for columns.

**RISK: NONE** under normal operation. Theoretically, if autoreset were disabled,
manual_control could persist to 3 AM, and this would clear it. But this is a safety
net by design.

### B.3.8: oal_reset_soft -- non-column zones (L3817-3821)

```yaml
# Line 3817-3821
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: "{{ manual_non_column_switches }}"
  data:
    manual_control: false
```

**Targets columns?** NO. `manual_non_column_switches` explicitly excludes columns
(L3727-3734: `{% if name != 'Columns' %}`).

**RISK: NONE.**

### B.3.9: oal_reset_soft -- column default branch (L3804-3808)

```yaml
# Line 3804-3808
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: switch.adaptive_lighting_column_lights
  data:
    manual_control: false
```

**Targets columns?** YES.

**Can fire during RGB window?** YES, when the default branch is taken (outside the
narrowed Gaussian window after E1/E2).

**RISK: INTENDED.** This is the correct behavior of the default branch -- release
columns to AL when outside the protection window.

### B.3.10: oal_reset_room -- non-column zones (L4056-4060)

```yaml
# Line 4056-4060
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: "{{ non_column_switches }}"
  data:
    manual_control: false
```

**Targets columns?** NO. `non_column_switches` rejects column switch (L4008-4009).

**RISK: NONE.**

### B.3.11: oal_reset_room -- column default branch (L4092-4096)

```yaml
# Line 4092-4096
- service: adaptive_lighting.set_manual_control
  target:
    entity_id: switch.adaptive_lighting_column_lights
  data:
    manual_control: false
```

**Targets columns?** YES.

**Can fire during RGB window?** YES, when default branch is taken.

**RISK: INTENDED.** Same as B.3.9.

---

## B.4: ALL `adaptive_lighting.apply` CALLS TARGETING COLUMNS

Every `adaptive_lighting.apply` call, checked for whether column lights are included.

### B.4.1: Engine Sleep Short-Circuit (L768-774)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: "{{ expand('group.oal_control_switches') ... }}"
  data:
    turn_on_lights: false
    transition: 5
```

**Includes columns?** YES (group includes column switch).

**Specifies `lights:` parameter?** NO. AL applies to non-manual lights only.

**Risk during RGB mode:** NONE. AL respects manual_control when `lights:` is not
specified. Columns with manual_control set are skipped.

### B.4.2: Engine Column Apply Phase (L1283-1290)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: switch.adaptive_lighting_column_lights
  data:
    lights: "{{ on_lights }}"
    turn_on_lights: false
    transition: "{{ 0 if is_force_apply else transition_speed }}"
```

**Includes columns?** YES. Explicitly targets column switch.

**Specifies `lights:` parameter?** YES. When `is_force_apply = true`, `on_lights`
includes manual-controlled column lights.

**Risk during RGB mode:**
- `is_force_apply = true`: **HIGH**. Pushes color_temp to RGB-mode columns.
- `is_force_apply = false`: NONE. Manual-controlled lights filtered out at L1278.
- `time_pattern` trigger: NONE. `is_force_apply = false`.

### B.4.3: Config Manager -- Full Bright apply (L1564-1569)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: "{{ repeat.item }}"
  data:
    turn_on_lights: true
    transition: ...
```

**Includes columns?** YES. `repeat.item` iterates `all_switches_expanded`.

**Risk during RGB mode:** HIGH. Manual_control was already cleared at L1554-1558.
This pushes color_temp to all lights including RGB-mode columns.

### B.4.4: Config Manager -- Transition cleanup apply (L1638-1644)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: "{{ repeat.item }}"
  data:
    lights: "{{ lights_for_switch }}"
    turn_on_lights: false
    transition: ...
```

**Includes columns?** CONDITIONALLY. Only for lights in `prev_controlled_lights`.

**Risk during RGB mode:** MEDIUM. If columns were in the previous config's controlled
list and their manual_control was cleared at L1621-1626.

### B.4.5: Morning Exit RGB (L1997-2002)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: switch.adaptive_lighting_column_lights
  data:
    turn_on_lights: false
    transition: 0
```

**Includes columns?** YES.

**Specifies `lights:` parameter?** NO. AL applies to non-manual lights only.

**Risk during RGB mode:** NONE. Fires at elevation > 8 (rising), outside RGB window.
Also, manual_control is cleared at L1986-1994 just before this, so AL applies to
all lights. But this is the intended transition out of RGB mode.

### B.4.6: Isolated Override (L2296-2300, L2303-2311)

**Includes columns?** NO. Targets main_living and office_desk_lamp only.

**Risk:** NONE.

### B.4.7: Sunrise Wake (L2396-2423)

**Includes columns?** NO. Targets bedroom_primary, main_living (entryway_lamp),
kitchen_island only.

**Risk:** NONE.

### B.4.8: Movie Mode -- Accent spots apply (L2494-2503)

**Includes columns?** NO. Targets accent_spots only.

**Risk:** NONE.

### B.4.9: oal_reset_room final apply (L4111-4116)

```yaml
- service: adaptive_lighting.apply
  target:
    entity_id: "{{ apply_switches }}"
  data:
    turn_on_lights: true
    transition: 1
```

**Includes columns?** CONDITIONALLY. `apply_switches` includes columns when
`in_column_rgb_mode` is FALSE (L4014-4019).

**Risk during RGB mode:** NONE (columns excluded from `apply_switches`). Outside
RGB mode: INTENDED (columns included, AL pushes current settings).

---

## B.5: COMPLETE RISK SUMMARY

### HIGH RISK Bypass Points (can overwrite RGB-mode columns)

| # | Location | Mechanism | When It Fires |
|---|----------|-----------|---------------|
| 1 | Config Manager Baseline (L1501-1509 + L1536) | Clears ALL manual_control, then force-apply engine | Transition to Adaptive config |
| 2 | Config Manager Full Bright (L1554-1558 + L1564) | Clears ALL manual_control, then apply to all | "Full Bright" config selected |
| 3 | Movie Mode Exit (L2524-2529) | Clears ALL manual_control on all switches | Movie mode deactivated |
| 4 | Engine force-apply (L1278-1290) | Pushes color_temp to manual columns | Any watchdog with force=true |

### MEDIUM RISK Bypass Points

| # | Location | Mechanism | When It Fires |
|---|----------|-----------|---------------|
| 5 | Config Manager transition cleanup (L1621-1626 + L1638-1644) | Clears prev-config lights | Config transition involving columns |
| 6 | System Startup (L2594 + L2597) | reset_global + force watchdog | HA restart |
| 7 | Zen32 adjustment (L3277) | Force watchdog + deferred manual set | Button press during RGB |

### NO RISK Points (verified safe)

| Location | Why Safe |
|----------|----------|
| Engine Sleep short-circuit (L768) | No `lights:` param, AL respects manual_control |
| Engine non-force apply (L1278) | manual_control lights filtered out |
| Watchdog Service (L2618) | No `force: true`, engine respects manual_control |
| Autoreset offset clear (L3254) | No `force: true` |
| Morning Exit RGB (L1986-2002) | Fires at +8 deg, outside RGB window |
| Isolated Override (L2291-2311) | Targets main_living only |
| Sunrise Wake (L2396-2423) | Targets bedroom/kitchen only |
| Movie Mode accent apply (L2494) | Targets accent_spots only |
| Nightly Maintenance (L2632) | Fires at 3 AM, manual_control already cleared |
| Soft reset non-column clearing (L3817) | Excludes columns explicitly |
| Room reset non-column clearing (L4056) | Excludes columns explicitly |
| Room reset final apply (L4111) | `apply_switches` excludes columns during RGB |

---

## B.6: RECOMMENDATIONS FOR HIGH-RISK PATHS

### Bypass #1 & #2: Config Manager clears ALL manual_control

**The Problem:** The Config Manager's Adaptive baseline path (L1501-1509) and Full
Bright path (L1554-1558) iterate `all_switches_expanded` and clear manual_control
on EVERY switch. This includes column_lights, defeating any RGB protection that was
set by prepare_rgb or by the reset scripts.

**When this causes trouble:** When `oal_reset_soft` runs during the RGB window and
`was_non_adaptive = true`. The soft reset's column protection re-locks manual_control
(L3779-3787), then sets config to Adaptive (L3855-3859), which triggers the Config
Manager, which clears manual_control on ALL switches. The RGB protection is defeated.

**Recommended fix (future plan):** Modify the Config Manager's manual_control clearing
loops to exclude `switch.adaptive_lighting_column_lights` when the column lights are
in the RGB-mode elevation window. This could use the same `in_column_rgb_mode` logic
from the reset scripts. Pseudocode:

```yaml
# In Config Manager baseline path, replace L1501-1509 with:
- variables:
    column_rgb_active: >
      {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
      {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
      {% set manual = state_attr('switch.adaptive_lighting_column_lights',
                       'manual_control') | default([]) | length > 0 %}
      {{ manual and
         ((not rising and elev < 3 and elev >= -5) or
          (rising and elev >= 5 and elev < 8)) }}
    switches_to_clear: >
      {% if column_rgb_active %}
        {{ all_switches_expanded
           | reject('eq', 'switch.adaptive_lighting_column_lights') | list }}
      {% else %}
        {{ all_switches_expanded }}
      {% endif %}
- repeat:
    for_each: "{{ switches_to_clear }}"
    sequence:
      - service: adaptive_lighting.set_manual_control
        target:
          entity_id: "{{ repeat.item }}"
        data:
          manual_control: false
```

**Scope:** This is a Type B (Cascading) change to the Config Manager automation.
It should be implemented as a separate plan after the current E1-E5 edits are
validated.

### Bypass #3: Movie Mode Exit clears ALL manual_control

**The Problem:** Movie mode exit (L2524-2529) clears manual_control on all switches
including columns.

**When this causes trouble:** If movie mode is deactivated during the RGB window
(elevation < 3, not rising). This is unlikely in practice (movie mode during twilight
is rare, and columns are already OFF in TV Mode config) but possible.

**Recommended fix (future plan):** Same pattern as the Config Manager fix -- exclude
column_lights from the bulk clear when in RGB mode. Or accept the risk as very low
probability.

### Bypass #4: Engine force-apply

Already analyzed in Part A, Issue 4. Accepted as cosmetic (sub-second flash).

---

## B.7: STARTUP PATH TRACE

When HA restarts, the following sequence occurs:

1. **AL integration loads.** `manual_control` is cleared (not persisted). All switches
   reset to YAML-defined defaults.

2. **`oal_system_startup_v13` fires** (L2566-2600):
   a. Wait for `adaptive_lighting` component to load (L2572-2576)
   b. Delay 10 seconds (L2577)
   c. Turn OFF all sleep mode switches (L2579-2587) -- includes column_lights
   d. Turn OFF recessed ceiling adapt_color (L2588-2590)
   e. Turn OFF system_paused (L2591-2593)
   f. Call `script.oal_reset_global` (L2594):
      - Calls `oal_reset_soft` -- but `columns_manual` is FALSE (manual_control
        cleared by restart), so column handling is SKIPPED
      - Resets environmental/sunset/night offsets to 0
      - Calls `change_switch_settings` with `use_defaults: configuration` on ALL
        switches -- restores column_lights to YAML baseline
   g. Delay 2 seconds (L2595)
   h. Fire `oal_watchdog_trigger` with `force: true` (L2597-2600)

3. **Engine runs with force=true:**
   - `is_force_apply = true`
   - Column lights `manual_control = []` (empty from restart)
   - `on_lights = all_on_lights` (whatever columns are on)
   - Engine pushes color_temp to columns -- **safe** because manual_control is empty
     and columns are not in RGB mode

4. **`oal_sunset_logic_unified_v13` fires on HA start** (L1762-1763):
   - Computes `column_rgb_green` based on current elevation
   - Sets `oal_offset_column_rgb_green` to appropriate value

5. **`oal_column_lights_sleep_trigger_v13` fires on HA start** (L2012-2013):
   - Default branch checks elevation
   - If below -5: turns ON column sleep mode
   - If above 5: turns OFF column sleep mode

6. **`oal_column_lights_prepare_rgb_mode_v13` does NOT fire:**
   - Its trigger is `numeric_state below: 3` (L1842)
   - This requires a state CROSSING (from above 3 to below 3)
   - At restart, elevation is already below 3, so no crossing occurs
   - RGB mode is NOT re-established after restart

**Conclusion for startup:** After restart during the RGB window, columns do NOT return
to RGB mode. They go to AL control (either sleep mode if below -5, or normal color_temp
if above -5). The Gaussian RGB evening effect is lost. This is a known acceptable
degradation -- documented in the CLAUDE.md as edge case 7.

---

## B.8: WATCHDOG SERVICE PATH TRACE

The watchdog service at L2605-2620:

```yaml
- id: oal_watchdog_service_v13
  trigger:
    - platform: time_pattern
      minutes: "/10"
  condition:
    - condition: state
      entity_id: input_boolean.oal_system_paused
      state: "off"
    - condition: template
      value_template: >
        {{ (now().timestamp() - (...oal_last_engine_run...)) > 1800 }}
  action:
    - event: oal_watchdog_trigger
      event_data:
        message: "Engine run time stale, proactively triggering."
```

**Key observation:** The watchdog event does NOT include `force: true`. The engine
receives this as a non-force trigger. `is_force_apply = false`. The engine's apply
phase at L1278 filters out manual-controlled lights:
```yaml
on_lights: "{{ all_on_lights | reject('in', manual_lights) | list }}"
```

**Conclusion:** The watchdog service is SAFE for RGB-mode columns. It respects
manual_control. The engine will update other zones but skip manual-controlled column
lights.

---

## B.9: NIGHTLY MAINTENANCE PATH TRACE

The nightly maintenance at L2625-2641:

```yaml
- id: oal_v13_nightly_maintenance_clear_stuck_manual
  trigger:
    - platform: time
      at: "03:00:00"
  action:
    - service: adaptive_lighting.set_manual_control
      target:
        entity_id: "{{ expand('group.oal_control_switches') ... }}"
      data:
        manual_control: false
    - condition: template
      value_template: >
        {{ (now().timestamp() - (...zen32_last_button_press...)) > 86400 }}
    - service: script.oal_reset_soft
```

This fires at 3:00 AM. In Denver winter, elevation at 3 AM is approximately -25 to
-30 degrees -- well below -5. The autoreset at ~9:50 PM would have already cleared
manual_control hours ago.

**Is there any scenario where manual_control persists to 3 AM?**
- Normal: NO. Autoreset clears at ~9:50 PM.
- If autoreset_control_seconds were changed to 0: YES. But the YAML config has it
  at 14400. Unless someone changed it via change_switch_settings.
- If something re-set manual_control after autoreset: possible in theory (e.g., a
  stale deferred_manual_control_set firing late). Very unlikely.

**If manual_control WERE still set at 3 AM:** The clear at L2632-2636 would release
columns. At -25 degrees, sleep mode is ON. AL would push sleep values. This is the
correct outcome -- the maintenance script is specifically designed to clear stuck
manual flags.

**Conclusion:** Nightly maintenance is safe. Even in the theoretical stuck case, the
correct outcome (AL sleep mode) results.

---

## B.10: ZEN32 ADJUSTMENT PATH TRACE

When a user presses Zen32 for brightness adjustment during RGB mode:

1. Zen32 button event fires
2. `oal_global_manual_brighter` or `oal_global_manual_dimmer` script runs
3. `oal_manual_brightness_step` sets per-zone offsets
4. `oal_global_adjustment_start` fires (L3267-3286):
   - Fires `oal_watchdog_trigger` with `force: true` (L3277)
   - Calls `script.oal_deferred_manual_control_set` asynchronously (L3284-3286)

5. Engine fires with force=true:
   - `is_force_apply = true`
   - Column lights have `manual_control = true` (from prepare_rgb)
   - `on_lights = all_on_lights` (includes columns)
   - Engine pushes color_temp to RGB-mode columns
   - **Brief color_temp flash**

6. Deferred manual control set runs (L3292-3328):
   - Waits for engine completion (L3300-3305)
   - Iterates ALL control switches (L3310)
   - Sets manual_control TRUE on all ON lights (L3323-3328)
   - This RE-LOCKS manual_control on columns

**Net effect:** Color_temp flash at step 5, then columns have manual_control re-locked
at step 6. But the RGB color is NOT restored -- the engine's color_temp push changed
the lights from RGB to color_temp mode. The deferred script only sets manual_control,
it does NOT re-apply the RGB color.

**Conclusion:** Zen32 brightness adjustment during RGB mode causes a PERMANENT exit
from RGB mode. The column lights switch to color_temp mode and stay there. The
`rgb_transition` automation (L1910) would fire on the next `oal_offset_column_rgb_green`
change (every minute from sunset_logic), but its condition at L1926 checks
`manual_control | length > 0` which would be TRUE after the deferred script runs.
So rgb_transition would push the RGB color back. There is a window of up to 60 seconds
where columns are in color_temp mode before the next sunset_logic tick restores RGB.

**Risk:** MEDIUM. The 60-second window of wrong color could be noticeable. However,
this scenario (user adjusting brightness during the Gaussian twilight window) is
relatively common. The rgb_transition automation's 1-minute cadence eventually
corrects the state.

---

## B.11: AUTORESET OFFSET CLEAR PATH TRACE

When AL's internal autoreset clears manual_control on column_lights (at ~9:50 PM):

1. `manual_control` attribute changes from `[light.living_column..., light.dining_column...]`
   to `[]`

2. `oal_manual_control_sync_offset` (L3207-3256) triggers:
   - Condition: `manual_lights | length == 0` (L3238-3239) -- TRUE
   - Resets offset to 0 (L3242-3246)
   - Fires `oal_watchdog_trigger` WITHOUT `force: true` (L3254-3256)

3. Engine fires (non-force):
   - `is_force_apply = false`
   - `manual_lights = []` (just cleared by autoreset)
   - `on_lights = all_on_lights` (columns included because no manual filter)
   - Engine pushes color_temp to columns

4. Separately, AL sleep mode (ON since -5 degrees) immediately applies sleep parameters
   to the now-unprotected columns.

**Conclusion:** The autoreset path is correctly designed. It clears manual_control,
resets the offset, and lets AL take over. The engine fires without force, and since
manual_control is empty, all on lights are included -- which is correct because we
WANT the engine to manage columns normally after autoreset.

---

## B.12: CONSOLIDATED FINDINGS

### Code paths that are SAFE during RGB mode:
- Engine non-force apply (periodic, state-triggered)
- Watchdog Service (no force flag)
- Autoreset offset clear (no force flag)
- Engine sleep short-circuit (respects manual_control)
- Morning exit RGB (fires outside RGB window)
- Isolated Override / Sunrise Wake / Movie Mode accent (don't target columns)
- Soft reset non-column clearing (excludes columns)
- Room reset non-column clearing (excludes columns)
- Room reset final apply (excludes columns during RGB via apply_switches)
- Nightly maintenance (fires at 3 AM, manual_control already cleared)

### Code paths that CAN overwrite RGB-mode columns:
1. **Config Manager Baseline** -- clears ALL manual_control + force engine (L1501-1539)
2. **Config Manager Full Bright** -- clears ALL manual_control + apply all (L1548-1569)
3. **Config Manager transition cleanup** -- clears prev-config lights (L1612-1644)
4. **Movie Mode exit** -- clears ALL manual_control on all switches (L2524-2529)
5. **Engine force-apply** -- pushes color_temp to manual columns (L1278-1290)
6. **Zen32 adjustment during RGB** -- engine force + 60s color gap (L3277)
7. **System startup** -- but safe because manual_control already cleared by restart

### Priority for future fixes:
1. **Config Manager manual_control clearing** (bypasses #1, #2, #3) -- most impactful,
   affects soft reset reliability during RGB window
2. **Movie Mode exit** (bypass #4) -- low probability but high impact
3. **Zen32 adjustment during RGB** (bypass #6) -- moderate probability, self-correcting
   within 60 seconds
4. **Engine force-apply** (bypass #5) -- cosmetic, sub-second, self-correcting

Items 1-4 are all out of scope for the current E1-E5 edit plan. They require separate
Type B or C changes to the Config Manager, Movie Mode handler, manual adjustment
pipeline, or core engine respectively.
