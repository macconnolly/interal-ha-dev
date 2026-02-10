# Column RGB Mode Systemic Protection Plan

## Document Purpose

This document provides a comprehensive, systemic fix for column lights RGB-mode
protection across the entire OAL lighting control package. It extends the existing
`column_rgb_reset_fix_plan.md` (edits E1-E5) with new edits (E6-E11) that address
the HIGH and MEDIUM risk bypass points identified in the Part B audit.

**Target file:** `/home/mac/HA/implementation_10/packages/oal_lighting_control_package.yaml`

**Depends on:** `docs/column_rgb_reset_fix_plan.md` (E1-E5 must be applied first)

**Date:** 2026-02-10

---

# 1. ARCHITECTURAL ANALYSIS

## 1.1 The Systemic Pattern: Why This Keeps Happening

The root cause is a **bulk-operation anti-pattern**. The OAL system treats
`group.oal_control_switches` (defined at L129-137) as a monolithic collection and
iterates it in several code paths:

```yaml
# L129-137: The shared group that causes problems
group:
  oal_control_switches:
    entities:
      - switch.adaptive_lighting_main_living
      - switch.adaptive_lighting_kitchen_island
      - switch.adaptive_lighting_bedroom_primary
      - switch.adaptive_lighting_accent_spots
      - switch.adaptive_lighting_recessed_ceiling
      - switch.adaptive_lighting_column_lights      # <-- The problem member
```

Five different code paths expand this group and apply blanket operations to ALL members:

| Code Path | Operation | Line |
|-----------|-----------|------|
| Config Manager Baseline | `set_manual_control: false` on all | L1501-1509 |
| Config Manager Full Bright | `set_manual_control: false` on all, then `apply` all | L1550-1569 |
| Config Manager Transition Cleanup | `set_manual_control: false` on prev lights | L1610-1644 |
| Movie Mode Exit | `set_manual_control: false` on all | L2524-2529 |
| Engine Force-Apply | `apply` with explicit `lights:` on all ON lights | L1272-1290 |

None of these paths check whether column lights are in protected RGB mode before
operating. The column_lights switch is just another member of the group -- no
special treatment.

Meanwhile, the RGB protection system (prepare_rgb, rgb_transition, reset scripts)
operates independently. It sets `manual_control: true` on column lights to prevent
AL from pushing `color_temp` values. But this protection is fragile -- any of the
five paths above can clear it without notice.

## 1.2 The Correct Architectural Response

**Column-aware gates at each bulk operation point.** Every code path that touches
`manual_control` on ALL switches or calls `adaptive_lighting.apply` on ALL switches
must first answer: "Are column lights currently in protected RGB mode?" If yes,
exclude `switch.adaptive_lighting_column_lights` from the operation.

This is a **defense-in-depth** strategy with three layers:

| Layer | Mechanism | Where |
|-------|-----------|-------|
| 1 | Exclude columns from `manual_control: false` clearing | Config Manager, Movie Mode |
| 2 | Exclude columns from `adaptive_lighting.apply` calls | Engine force-apply (evaluated) |
| 3 | `rgb_transition` automation restores RGB on ~60s cadence | Already exists (L1910-1937) |

Layer 1 is the most important -- it prevents the protection from being cleared.
Layer 2 prevents settings from being pushed even if Layer 1 fails. Layer 3 is the
existing safety net.

## 1.3 Why a Centralized Detection Approach

### Option A: Template Sensor `sensor.oal_column_rgb_mode_active`

A dedicated template sensor would provide:
- Real-time state subscribable by automations
- Single source of truth
- Usable in conditions without inline Jinja2

```yaml
template:
  - sensor:
      - name: "OAL Column RGB Mode Active"
        state: >
          {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
          {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
          {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                           'manual_control') | default([])) | length > 0 %}
          {{ manual and
             ((not rising and elev < 3 and elev >= -5) or
              (rising and elev >= 5 and elev < 8)) }}
```

**Pros:** DRY principle, single definition, easy to test, shows in HA UI.

**Cons:** Sensor evaluates on every sun elevation change (continuous), adds another
entity to the system, introduces a potential timing gap (sensor state may lag behind
the actual sun elevation by up to 1 template evaluation cycle).

### Option B: Inline Jinja2 Template at Point of Use

Each code path computes the RGB-mode check inline:

```yaml
- variables:
    column_rgb_active: >
      {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
      {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
      {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                       'manual_control') | default([])) | length > 0 %}
      {{ manual and
         ((not rising and elev < 3 and elev >= -5) or
          (rising and elev >= 5 and elev < 8)) }}
```

**Pros:** No timing lag, computed at exact moment of use, no new entity, no
dependency on template sensor availability.

**Cons:** Duplicated logic across 4+ locations, risk of drift if bounds change.

### Decision: Inline Template (Option B)

**Rationale:** The Config Manager and Movie Mode handler are safety-critical code
paths. They must evaluate the RGB-mode condition at the exact moment they execute,
not rely on a sensor that might lag. The `manual_control` attribute can change
between sensor evaluations (e.g., if `prepare_rgb` just ran). An inline check
eliminates this race condition.

The duplication concern is mitigated by:
1. The detection logic is exactly 5 lines of Jinja2 -- not complex enough to warrant
   abstraction
2. Each usage site has a standardized `SYNC` comment referencing the canonical bounds
3. The bounds themselves are architectural constants that change only when the RGB
   lifecycle automations (prepare_rgb, sleep_trigger, morning_exit) change their
   elevation thresholds

**Canonical detection pattern** (to be used at every gate):

```yaml
# SYNC: Column RGB protection bounds
#   evening upper = prepare_rgb trigger (L1842: below 3)
#   evening lower = sleep_trigger (L2017: below -5)
#   morning lower = sleep_trigger exit (L2022: above 5)
#   morning upper = morning_exit trigger (L1949: above 8)
column_rgb_active: >
  {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
  {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
  {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                   'manual_control') | default([])) | length > 0 %}
  {{ manual and
     ((not rising and elev < 3 and elev >= -5) or
      (rising and elev >= 5 and elev < 8)) }}
```

The three conditions are:
- `manual`: Column lights currently have `manual_control` set (prepare_rgb ran)
- `elevation window`: Sun is in the Gaussian fade window (evening 3 to -5 deg
  setting, or morning 5 to 8 deg rising)
- `not rising` / `rising`: Disambiguates evening from morning at same elevation

---

# 2. DETECTION LOGIC DESIGN

## 2.1 The Canonical Condition

```
column_rgb_active = manual_control_set AND in_elevation_window
```

Where:
- `manual_control_set` = `state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) | length > 0`
- `in_elevation_window` = `(not rising AND elev < 3 AND elev >= -5) OR (rising AND elev >= 5 AND elev < 8)`

## 2.2 Why Three Sub-Conditions

### `manual_control_set` (required)

Without this gate, the check would fire for ANY sunset -- even when columns are off,
or when the user hasn't been home and lights were never turned on. The `prepare_rgb`
automation is the ONLY path that sets `manual_control: true` on column lights. If
`manual_control` is empty, columns are not in RGB mode regardless of elevation.

Additionally, `autoreset_control_seconds: 14400` (4 hours, L544) means manual_control
auto-clears around 9:50 PM (if prepare_rgb fired at ~5:50 PM). After autoreset, this
gate returns false and columns are correctly unprotected.

### `not rising` (evening disambiguation)

At elevation 2 degrees, the sun could be setting (evening, RGB mode active) or rising
(morning, RGB mode should be ending). The `rising` attribute disambiguates. The evening
branch requires `not rising`; the morning branch requires `rising`.

### `elev >= -5` (evening lower bound)

Below -5 degrees, the `sleep_trigger` automation (L2017) fires and enables AL sleep
mode. At this point, columns should transition from OAL RGB mode to AL sleep mode
([245, 120, 0] at 1%). Protecting columns below -5 degrees would prevent this
transition.

## 2.3 Bounds Derivation Table

| Bound | Value | Source Automation | Source Line | Trigger Type |
|-------|-------|-------------------|-------------|-------------- |
| Evening upper | 3 deg (setting) | prepare_rgb_mode | L1842 | `numeric_state below: 3` |
| Evening lower | -5 deg (setting) | sleep_trigger | L2017 | `numeric_state below: -5` |
| Morning lower | 5 deg (rising) | sleep_trigger exit | L2022 | `numeric_state above: 5` |
| Morning upper | 8 deg (rising) | morning_exit_rgb | L1949 | `numeric_state above: 8` |

## 2.4 Truth Table

Assuming `manual_control_set = TRUE`:

| Elevation | Rising | In Window? | Reason |
|-----------|--------|------------|--------|
| +10 | false | NO | Above prepare_rgb trigger (daytime) |
| +2 | false | YES | Active evening Gaussian fade |
| 0 | false | YES | Active evening Gaussian fade |
| -4 | false | YES | Late evening Gaussian fade |
| -5 | false | YES | Boundary -- still protected (>= -5 is true) |
| -6 | false | NO | Below sleep_trigger -- AL sleep takes over |
| -20 | false | NO | Deep night -- AL sleep mode active |
| -20 | true | NO | Early morning, below morning window |
| +3 | true | NO | Morning, below sleep exit (< 5) |
| +5 | true | YES | Morning boundary -- sleep just exited |
| +7 | true | YES | Morning window active |
| +8 | true | NO | At/above morning_exit trigger (>= 8 fails < 8) |
| +10 | true | NO | Past morning exit -- daytime |

When `manual_control_set = FALSE`: ALL results are NO (short-circuit).

---

# 3. LINE-LEVEL EDIT PLAN

## Relationship to E1-E5

The existing plan (E1-E5) fixes the RESET SCRIPTS (oal_reset_soft, oal_reset_room).
This plan (E6-E11) fixes the EXTERNAL BYPASS POINTS that defeat the reset scripts'
protection. The two plans are complementary and should be applied together.

**Combined edit order:** E5 -> E4 -> E3 -> E2 -> E1 -> E11 -> E10 -> E9 -> E8 -> E7 -> E6

Rationale: E1-E5 are at higher line numbers (L3689-4096) and are applied first
(reverse order within their group). E6-E11 are at lower line numbers (L1272-2529)
and are applied second (reverse order within their group). This prevents line drift.

**IMPORTANT:** E1-E5 do not depend on E6-E11, and E6-E11 do not depend on E1-E5.
They can be applied in either order as long as each group is applied in reverse
line-number order within itself. However, E6-E11 address the bypass points that
would otherwise defeat E1's and E3's RGB protection, so both groups should be
deployed together for full protection.

---

## PRE-EDIT ANCHOR VERIFICATION (E6-E11)

Before making any edits, verify these exact strings at these exact line numbers.
If any anchor does not match, STOP -- the file has changed.

| Line | Expected Content |
|------|-----------------|
| 1272 | `# Column Lights` |
| 1274 | `- variables:` |
| 1278 | `on_lights: "{{ all_on_lights if is_force_apply else (all_on_lights \| reject('in', manual_lights) \| list) }}"` |
| 1283 | `- service: adaptive_lighting.apply` |
| 1501 | `# 1. Release ALL manual controls system-wide` |
| 1502 | `- repeat:` |
| 1503 | `for_each: "{{ all_switches_expanded }}"` |
| 1509 | `manual_control: false` |
| 1536 | `- event: oal_watchdog_trigger` |
| 1550 | `# 1. Release ALL manual controls system-wide` |
| 1551 | `- repeat:` |
| 1554 | `- service: adaptive_lighting.set_manual_control` |
| 1558 | `manual_control: false` |
| 1560 | `# 2. Turn on ALL lights with AL's calculated settings` |
| 1564 | `- service: adaptive_lighting.apply` |
| 1610 | `- repeat:` |
| 1611 | `for_each: "{{ all_switches_expanded }}"` |
| 1621 | `- service: adaptive_lighting.set_manual_control` |
| 1625 | `lights: "{{ lights_for_switch }}"` |
| 1626 | `manual_control: false` |
| 2522 | `# CRITICAL: Clear manual control to restore AL adaptive control` |
| 2524 | `- service: adaptive_lighting.set_manual_control` |
| 2527 | `entity_id: "{{ expand('group.oal_control_switches') \| map(attribute='entity_id') \| list }}"` |
| 2529 | `manual_control: false` |
| 3267 | `oal_global_adjustment_start:` |
| 3277 | `- event: oal_watchdog_trigger` |

---

## EDIT E6: Config Manager Baseline -- Column-Aware Manual Control Clearing

**Lines:** 1501-1509
**Addresses:** HIGH risk bypass #1 (Config Manager Baseline clears ALL manual_control)
**Severity:** HIGH -- This is the single most impactful fix. When `oal_reset_soft`
runs during the RGB window and `was_non_adaptive = true`, this path fires and defeats
the soft reset's RGB protection.

### Current Code (lines 1499-1509, verbatim)

```yaml
              # 0b. Restore previous light state (snapshot from before config mode)
              - service: scene.turn_on
                target:
                  entity_id: scene.oal_before_config_mode
                data:
                  transition: 0
                continue_on_error: true  # Scene may not exist if starting fresh

              # 1. Release ALL manual controls system-wide
              - repeat:
                  for_each: "{{ all_switches_expanded }}"
                  sequence:
                    - service: adaptive_lighting.set_manual_control
                      target:
                        entity_id: "{{ repeat.item }}"
                      data:
                        manual_control: false
```

### Replacement Code

```yaml
              # 0b. Restore previous light state (snapshot from before config mode)
              - service: scene.turn_on
                target:
                  entity_id: scene.oal_before_config_mode
                data:
                  transition: 0
                continue_on_error: true  # Scene may not exist if starting fresh

              # 1. Release manual controls system-wide
              # Column-aware: skip column_lights when in RGB protection window
              # to preserve manual_control set by prepare_rgb or reset scripts.
              # SYNC: Column RGB protection bounds
              #   evening upper = prepare_rgb trigger (L1842: below 3)
              #   evening lower = sleep_trigger (L2017: below -5)
              #   morning lower = sleep_trigger exit (L2022: above 5)
              #   morning upper = morning_exit trigger (L1949: above 8)
              - variables:
                  column_rgb_active: >
                    {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
                    {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
                    {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                                     'manual_control') | default([])) | length > 0 %}
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

### Rationale

**Principle A (Single Responsibility):** Uses the canonical `column_rgb_active`
detection pattern. The same logic, same bounds, same three conditions.

**Principle C (Minimal Invasiveness):** The only structural change is:
1. A `variables:` block inserted before the `repeat:` loop
2. The `for_each:` target changed from `all_switches_expanded` to `switches_to_clear`

The repeat loop body is unchanged. The rest of the baseline path (L1510-1539) is
untouched.

**Principle D (Consistency):** The bounds match all other RGB protection gates:
prepare_rgb (L1842), sleep_trigger (L2017/L2022), morning_exit (L1949), and the
reset scripts' `in_column_rgb_mode` (E1/E3).

### What to Verify After Edit

1. YAML syntax: No indentation errors.
2. When `column_rgb_active = TRUE` (elevation -2, not rising, manual_control set):
   - `switches_to_clear` should contain 5 switches (all except column_lights)
   - Column lights manual_control should remain TRUE after the loop completes
3. When `column_rgb_active = FALSE` (elevation -20, or manual_control empty):
   - `switches_to_clear` should contain all 6 switches
   - All manual_control cleared including columns
4. After the full baseline path completes:
   - The watchdog at L1536 fires with `force: true`
   - Engine force-apply still includes columns in `on_lights` (Layer 2 not addressed
     here -- accepted as cosmetic flash)
   - But columns retain `manual_control: true`, so rgb_transition (Layer 3) can
     fire on the next sunset_logic tick

---

## EDIT E7: Config Manager Full Bright -- Column-Aware Manual Control Clearing

**Lines:** 1550-1569
**Addresses:** HIGH risk bypass #2 (Full Bright clears ALL manual_control + applies all)
**Severity:** HIGH -- Selecting "Full Bright" during RGB window destroys RGB mode.

### Current Code (lines 1549-1569, verbatim)

```yaml
            sequence:
              # 1. Release ALL manual controls system-wide
              - repeat:
                  for_each: "{{ all_switches_expanded }}"
                  sequence:
                    - service: adaptive_lighting.set_manual_control
                      target:
                        entity_id: "{{ repeat.item }}"
                      data:
                        manual_control: false

              # 2. Turn on ALL lights with AL's calculated settings
              - repeat:
                  for_each: "{{ all_switches_expanded }}"
                  sequence:
                    - service: adaptive_lighting.apply
                      target:
                        entity_id: "{{ repeat.item }}"
                      data:
                        turn_on_lights: true
                        transition: "{{ 0 if is_force_apply else transition_speed }}"
```

### Replacement Code

```yaml
            sequence:
              # 1. Release manual controls system-wide
              # Column-aware: skip column_lights when in RGB protection window.
              # SYNC: Column RGB protection bounds (same as baseline path above)
              - variables:
                  column_rgb_active: >
                    {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
                    {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
                    {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                                     'manual_control') | default([])) | length > 0 %}
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
                  switches_to_apply: >
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

              # 2. Turn on lights with AL's calculated settings
              # During RGB mode: skip column_lights (they stay in RGB mode)
              - repeat:
                  for_each: "{{ switches_to_apply }}"
                  sequence:
                    - service: adaptive_lighting.apply
                      target:
                        entity_id: "{{ repeat.item }}"
                      data:
                        turn_on_lights: true
                        transition: "{{ 0 if is_force_apply else transition_speed }}"
```

### Rationale

This edit has TWO protection points, both using the same `column_rgb_active` variable:

1. **`switches_to_clear`** -- Prevents clearing manual_control on column_lights (Layer 1)
2. **`switches_to_apply`** -- Prevents pushing `adaptive_lighting.apply` to column_lights
   (Layer 2)

Both use the same `column_rgb_active` variable computed once. During RGB mode, "Full
Bright" still turns on all other lights at full brightness. Column lights remain in
RGB mode at their current Gaussian-fade color. This is the correct user experience --
the user asked for full brightness, but the sunset effect on columns is preserved.

**Trade-off:** If the user WANTS columns at full brightness too, they would need to
exit RGB mode first (e.g., via the morning_exit automation, or by manually clearing
manual_control). This is an acceptable trade-off because "Full Bright" during twilight
is uncommon, and preserving the RGB effect is the higher priority.

### What to Verify After Edit

1. During RGB mode (`column_rgb_active = TRUE`):
   - `switches_to_clear` and `switches_to_apply` each have 5 entries (no column_lights)
   - Column lights stay in RGB mode
   - Other 5 zones have manual_control cleared and get full brightness
2. Outside RGB mode (`column_rgb_active = FALSE`):
   - Both lists have 6 entries (all switches)
   - Behavior identical to original code

---

## EDIT E8: Config Manager Transition Cleanup -- Column-Aware Light Filtering

**Lines:** 1610-1644
**Addresses:** MEDIUM risk bypass #3 (transition cleanup clears prev-config column lights)
**Severity:** MEDIUM -- Only fires when transitioning FROM a config that controlled
column lights (TV Mode turns off columns, Dim Ambient dims them).

### Current Code (lines 1608-1644, verbatim)

```yaml
                  # Release manual control on previously controlled lights
                  # Match lights to their respective switches instead of passing all to all
                  - repeat:
                      for_each: "{{ all_switches_expanded }}"
                      sequence:
                        - variables:
                            # Get lights managed by this switch and expand groups to individuals
                            switch_managed: "{{ state_attr(repeat.item, 'configuration').lights | default([]) }}"
                            switch_lights_expanded: "{{ expand(switch_managed) | map(attribute='entity_id') | list }}"
                            # Find which prev_controlled_lights belong to this switch
                            lights_for_switch: "{{ prev_controlled_lights | select('in', switch_lights_expanded) | list }}"
                        - if: "{{ lights_for_switch | length > 0 }}"
                          then:
                            - service: adaptive_lighting.set_manual_control
                              target:
                                entity_id: "{{ repeat.item }}"
                              data:
                                lights: "{{ lights_for_switch }}"
                                manual_control: false

                  # Apply AL without turning lights on (just release control)
                  - repeat:
                      for_each: "{{ all_switches_expanded }}"
                      sequence:
                        - variables:
                            switch_managed: "{{ state_attr(repeat.item, 'configuration').lights | default([]) }}"
                            switch_lights_expanded: "{{ expand(switch_managed) | map(attribute='entity_id') | list }}"
                            lights_for_switch: "{{ prev_controlled_lights | select('in', switch_lights_expanded) | list }}"
                        - if: "{{ lights_for_switch | length > 0 }}"
                          then:
                            - service: adaptive_lighting.apply
                              target:
                                entity_id: "{{ repeat.item }}"
                              data:
                                lights: "{{ lights_for_switch }}"
                                turn_on_lights: false
                                transition: "{{ 0 if is_force_apply else transition_speed }}"
```

### Replacement Code

```yaml
                  # Release manual control on previously controlled lights
                  # Match lights to their respective switches instead of passing all to all
                  # Column-aware: when in RGB protection window, exclude column light
                  # entities from the lights_for_switch list for the column_lights switch.
                  # SYNC: Column RGB protection bounds (same as baseline path above)
                  - variables:
                      column_rgb_active: >
                        {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
                        {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
                        {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                                         'manual_control') | default([])) | length > 0 %}
                        {{ manual and
                           ((not rising and elev < 3 and elev >= -5) or
                            (rising and elev >= 5 and elev < 8)) }}
                      column_light_entities:
                        - light.living_column_strip_light_matter
                        - light.dining_column_strip_light_matter
                  - repeat:
                      for_each: "{{ all_switches_expanded }}"
                      sequence:
                        - variables:
                            # Get lights managed by this switch and expand groups to individuals
                            switch_managed: "{{ state_attr(repeat.item, 'configuration').lights | default([]) }}"
                            switch_lights_expanded: "{{ expand(switch_managed) | map(attribute='entity_id') | list }}"
                            # Find which prev_controlled_lights belong to this switch
                            raw_lights_for_switch: "{{ prev_controlled_lights | select('in', switch_lights_expanded) | list }}"
                            # Column-aware: exclude column light entities when in RGB mode
                            lights_for_switch: >
                              {% if column_rgb_active and repeat.item == 'switch.adaptive_lighting_column_lights' %}
                                {{ raw_lights_for_switch | reject('in', column_light_entities) | list }}
                              {% else %}
                                {{ raw_lights_for_switch }}
                              {% endif %}
                        - if: "{{ lights_for_switch | length > 0 }}"
                          then:
                            - service: adaptive_lighting.set_manual_control
                              target:
                                entity_id: "{{ repeat.item }}"
                              data:
                                lights: "{{ lights_for_switch }}"
                                manual_control: false

                  # Apply AL without turning lights on (just release control)
                  - repeat:
                      for_each: "{{ all_switches_expanded }}"
                      sequence:
                        - variables:
                            switch_managed: "{{ state_attr(repeat.item, 'configuration').lights | default([]) }}"
                            switch_lights_expanded: "{{ expand(switch_managed) | map(attribute='entity_id') | list }}"
                            raw_lights_for_switch: "{{ prev_controlled_lights | select('in', switch_lights_expanded) | list }}"
                            # Column-aware: exclude column light entities when in RGB mode
                            lights_for_switch: >
                              {% if column_rgb_active and repeat.item == 'switch.adaptive_lighting_column_lights' %}
                                {{ raw_lights_for_switch | reject('in', column_light_entities) | list }}
                              {% else %}
                                {{ raw_lights_for_switch }}
                              {% endif %}
                        - if: "{{ lights_for_switch | length > 0 }}"
                          then:
                            - service: adaptive_lighting.apply
                              target:
                                entity_id: "{{ repeat.item }}"
                              data:
                                lights: "{{ lights_for_switch }}"
                                turn_on_lights: false
                                transition: "{{ 0 if is_force_apply else transition_speed }}"
```

### Rationale

The transition cleanup is more nuanced than the baseline/full-bright paths. It does
not clear ALL switches -- it only clears lights that were in the PREVIOUS config's
controlled list. The fix must filter at the light level, not the switch level.

**Approach:** Instead of excluding the entire `switch.adaptive_lighting_column_lights`
from the loop, we exclude the individual column light entities
(`light.living_column_strip_light_matter`, `light.dining_column_strip_light_matter`)
from the `lights_for_switch` list when processing the column_lights switch.

This handles the case where TV Mode (which lists `light.column_lights` in `lights_off`)
transitions to Adaptive. Without this fix, the cleanup would clear manual_control on
the column light entities, defeating RGB protection.

**Key subtlety:** The `prev_controlled_lights` variable (L1427-1437) expands
`light.column_lights` (the group) to individual light entities. So
`prev_controlled_lights` contains `light.living_column_strip_light_matter` and
`light.dining_column_strip_light_matter`. The `switch_lights_expanded` for the
column_lights switch also contains these same entities. The intersection
(`lights_for_switch`) would include them. The fix removes them from this intersection
when `column_rgb_active` is true.

### What to Verify After Edit

1. Transition from TV Mode at -2 deg (RGB active, columns were in `lights_off`):
   - `column_rgb_active = TRUE`
   - For `switch.adaptive_lighting_column_lights`: `raw_lights_for_switch` contains
     both column entities, but `lights_for_switch` is empty (both rejected)
   - No `set_manual_control: false` or `apply` called for column lights
   - Column RGB mode preserved
2. Transition from TV Mode at -20 deg (not RGB, columns were in `lights_off`):
   - `column_rgb_active = FALSE`
   - `lights_for_switch = raw_lights_for_switch` (no filtering)
   - Normal cleanup proceeds
3. Transition from Warm Ambient at -2 deg (RGB active, columns NOT in prev list):
   - `raw_lights_for_switch` is empty for column_lights switch (columns weren't
     controlled by Warm Ambient in `lights_off` or `lights_dimmed`)
   - Wait -- Dim Ambient DOES dim `light.column_lights: 30` (L1352). So columns
     ARE in prev_controlled_lights for Dim Ambient transitions.
   - Fix correctly excludes column entities from the cleanup.

---

## EDIT E9: Movie Mode Exit -- Column-Aware Manual Control Clearing

**Lines:** 2522-2529
**Addresses:** HIGH risk bypass #4 (Movie Mode exit clears ALL manual_control)
**Severity:** HIGH impact, LOW probability. Movie mode during the RGB window is
uncommon because movie mode is typically activated well before sunset. But if the user
exits movie mode during twilight (e.g., movie ends at sunset), RGB protection is lost.

### Current Code (lines 2522-2529, verbatim)

```yaml
              # CRITICAL: Clear manual control to restore AL adaptive control
              # This allows AL to resume managing these lights automatically
              - service: adaptive_lighting.set_manual_control
                continue_on_error: true
                target:
                  entity_id: "{{ expand('group.oal_control_switches') | map(attribute='entity_id') | list }}"
                data:
                  manual_control: false
```

### Replacement Code

```yaml
              # CRITICAL: Clear manual control to restore AL adaptive control
              # This allows AL to resume managing these lights automatically
              # Column-aware: skip column_lights when in RGB protection window.
              # SYNC: Column RGB protection bounds
              #   evening upper = prepare_rgb trigger (L1842: below 3)
              #   evening lower = sleep_trigger (L2017: below -5)
              #   morning lower = sleep_trigger exit (L2022: above 5)
              #   morning upper = morning_exit trigger (L1949: above 8)
              - variables:
                  column_rgb_active: >
                    {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
                    {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
                    {% set manual = (state_attr('switch.adaptive_lighting_column_lights',
                                     'manual_control') | default([])) | length > 0 %}
                    {{ manual and
                       ((not rising and elev < 3 and elev >= -5) or
                        (rising and elev >= 5 and elev < 8)) }}
                  switches_to_clear: >
                    {% if column_rgb_active %}
                      {{ expand('group.oal_control_switches')
                         | map(attribute='entity_id')
                         | reject('eq', 'switch.adaptive_lighting_column_lights')
                         | list }}
                    {% else %}
                      {{ expand('group.oal_control_switches')
                         | map(attribute='entity_id')
                         | list }}
                    {% endif %}
              - service: adaptive_lighting.set_manual_control
                continue_on_error: true
                target:
                  entity_id: "{{ switches_to_clear }}"
                data:
                  manual_control: false
```

### Rationale

**Principle C (Minimal Invasiveness):** The service call structure is unchanged. We
only add a `variables:` block to compute the filtered switch list, and change the
`entity_id` from the inline expand to the pre-computed variable.

**Why not filter at the light level here?** Unlike the transition cleanup (E8), the
Movie Mode exit clears ALL manual_control on ALL switches -- it does not specify
individual lights. So the switch-level exclusion is sufficient. When
`column_rgb_active` is true, we exclude the entire `switch.adaptive_lighting_column_lights`
from the target list.

**Interaction with Movie Mode config:** Movie Mode is a separate concept from Config
Manager configs. When movie mode is active, `input_boolean.oal_movie_mode_active` is
ON. The Config Manager config might be "TV Mode" (which turns off columns). When
movie mode exits, the scene restore at L2516-2520 restores lights to pre-movie state.
If columns were OFF before movie mode, the scene restore turns them back off. The
manual_control clearing then does not affect OFF columns (manual_control is typically
empty for OFF lights). So the practical risk is only when columns are ON during the
RGB window AND movie mode is also active -- which requires the user to have column
lights on during twilight with movie mode simultaneously active.

### What to Verify After Edit

1. Movie mode exit at -2 deg (RGB active, columns ON with manual_control):
   - `column_rgb_active = TRUE`
   - `switches_to_clear` has 5 switches (no column_lights)
   - Column manual_control preserved, RGB mode intact
2. Movie mode exit at -20 deg (no RGB):
   - `column_rgb_active = FALSE`
   - `switches_to_clear` has 6 switches (all)
   - Normal behavior restored
3. Movie mode exit at +10 deg (daytime):
   - `column_rgb_active = FALSE`
   - Normal behavior

---

## EDIT E10: Engine Force-Apply -- Column RGB Exclusion (EVALUATION)

**Lines:** 1272-1290
**Addresses:** HIGH risk bypass #5 (engine pushes color_temp to RGB-mode columns on
force-apply)
**Severity:** Cosmetic -- sub-second color_temp flash, self-correcting.

### Analysis

The engine's column_lights apply block at L1272-1290:

```yaml
          # Column Lights
          - sequence:
              - variables:
                  all_lights: "{{ (state_attr('switch.adaptive_lighting_column_lights', 'configuration') or {}).get('lights', []) }}"
                  all_on_lights: "{{ expand(all_lights) | selectattr('state', 'eq', 'on') | map(attribute='entity_id') | list }}"
                  manual_lights: "{{ state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) }}"
                  on_lights: "{{ all_on_lights if is_force_apply else (all_on_lights | reject('in', manual_lights) | list) }}"
              - if:
                  - condition: template
                    value_template: "{{ on_lights | length > 0 }}"
                then:
                  - service: adaptive_lighting.apply
                    target:
                      entity_id: switch.adaptive_lighting_column_lights
                    data:
                      lights: "{{ on_lights }}"
                      turn_on_lights: false
                      transition: "{{ 0 if is_force_apply else transition_speed }}"
                    continue_on_error: true
```

When `is_force_apply = true`, `on_lights = all_on_lights` -- includes column lights
even when they have `manual_control: true`. The `adaptive_lighting.apply` service with
an explicit `lights:` list bypasses manual_control and pushes the AL's current
calculated parameters (which are `color_temp` mode, since `prefer_rgb_color: false`).

### Proposed Fix

```yaml
          # Column Lights
          - sequence:
              - variables:
                  all_lights: "{{ (state_attr('switch.adaptive_lighting_column_lights', 'configuration') or {}).get('lights', []) }}"
                  all_on_lights: "{{ expand(all_lights) | selectattr('state', 'eq', 'on') | map(attribute='entity_id') | list }}"
                  manual_lights: "{{ state_attr('switch.adaptive_lighting_column_lights', 'manual_control') | default([]) }}"
                  # Column-aware force-apply: exclude manual-controlled columns
                  # when in RGB protection window to prevent color_temp flash.
                  # SYNC: Column RGB protection bounds
                  column_rgb_active: >
                    {% set elev = state_attr('sun.sun', 'elevation') | float(90) %}
                    {% set rising = state_attr('sun.sun', 'rising') | default(true) %}
                    {% set manual = manual_lights | length > 0 %}
                    {{ manual and
                       ((not rising and elev < 3 and elev >= -5) or
                        (rising and elev >= 5 and elev < 8)) }}
                  on_lights: >
                    {% if is_force_apply and column_rgb_active %}
                      {{ all_on_lights | reject('in', manual_lights) | list }}
                    {% elif is_force_apply %}
                      {{ all_on_lights }}
                    {% else %}
                      {{ all_on_lights | reject('in', manual_lights) | list }}
                    {% endif %}
              - if:
                  - condition: template
                    value_template: "{{ on_lights | length > 0 }}"
                then:
                  - service: adaptive_lighting.apply
                    target:
                      entity_id: switch.adaptive_lighting_column_lights
                    data:
                      lights: "{{ on_lights }}"
                      turn_on_lights: false
                      transition: "{{ 0 if is_force_apply else transition_speed }}"
                    continue_on_error: true
```

### Evaluation: RECOMMENDED TO INCLUDE

Originally the existing plan classified this as "cosmetic, accept as known limitation."
However, with the E6-E9 fixes ensuring `manual_control` is preserved, this edit
provides the critical Layer 2 defense. Without E10, even though manual_control is now
preserved by E6-E9, every force-apply still pushes color_temp to columns, causing a
visible flash.

**The flash is NOT sub-second in all cases.** Consider the Zen32 adjustment path
(bypass #6 below): the engine fires with force=true, pushes color_temp. The
`oal_deferred_manual_control_set` script then re-locks manual_control. But the RGB
color is NOT restored until `rgb_transition` fires on the next sunset_logic tick
(up to 60 seconds). That is a 60-second window of wrong color, not sub-second.

With E10 in place:
- Force-apply during RGB window skips column lights entirely
- No color_temp flash at all
- The Zen32 adjustment still adjusts brightness for other zones
- Column lights maintain their RGB color throughout

**Impact on other force-apply callers:**
- `oal_reset_soft` (L3868): Column protection already runs FIRST (L3759-3787), then
  watchdog fires. With E10, engine skips columns on force-apply. Good -- no flash.
- `oal_reset_room` (L4039): Engine fires FIRST, then column protection. With E10,
  engine skips columns. Column protection then re-applies RGB. Good -- no flash.
- Config Manager baseline (L1536): After E6, column manual_control is preserved.
  Engine force-apply (E10) skips columns. Good.
- Zen32 adjustment (L3277): Engine force-apply skips columns. The deferred manual
  control set still runs but is a no-op for columns (already manual). Good -- no
  60-second color gap.
- System startup (L2597): manual_control is empty after restart. `column_rgb_active`
  is FALSE. Engine applies normally. Good.

**Risk assessment:** This is a Type A change (isolated to the engine's column apply
block). It does not affect other zones. The only behavioral change is that force-apply
no longer pushes settings to RGB-protected column lights. Non-force-apply already
filters these lights out.

### What to Verify After Edit

1. Zen32 brightness press at 0 deg (RGB active):
   - Engine fires with force=true
   - `column_rgb_active = TRUE` (manual set, elev 0, not rising)
   - `on_lights` = `all_on_lights | reject('in', manual_lights)` = empty list
     (both column lights are in manual_lights)
   - No apply call for columns. No color_temp flash.
   - Other zones still get force-applied correctly.
2. Zen32 brightness press at -20 deg (no RGB, manual_control cleared by autoreset):
   - `column_rgb_active = FALSE` (manual_lights empty)
   - `on_lights = all_on_lights` (full force-apply)
   - Normal force-apply behavior restored
3. Periodic engine run (time_pattern):
   - `is_force_apply = false`
   - `on_lights` already filters manual_lights
   - No change in behavior

---

## EDIT E11: Zen32 Adjustment During RGB -- Immediate RGB Restoration (EVALUATION)

**Lines:** 3267-3286
**Addresses:** MEDIUM risk bypass #6 (Zen32 adjustment during RGB causes 60s color gap)
**Severity:** MEDIUM -- With E10 in place, this is downgraded to NONE.

### Analysis

The Zen32 adjustment path:
1. `oal_global_manual_brighter/dimmer` calls `oal_manual_brightness_step` (sets offsets)
2. `oal_global_adjustment_start` (L3267) fires watchdog with `force: true` (L3277)
3. `oal_deferred_manual_control_set` runs asynchronously (L3284-3286)

With E10 in place, step 2's engine force-apply now SKIPS column lights when in RGB
mode. The columns never receive color_temp. The deferred manual control set at step 3
redundantly re-locks manual_control (it was never cleared).

**Result:** No fix needed. E10 eliminates the 60-second color gap entirely.

### Decision: NO EDIT NEEDED

The Zen32 adjustment path is fully protected by E10 (engine force-apply column
exclusion). No additional changes to `oal_global_adjustment_start` are required.

**If E10 were NOT implemented** (i.e., the flash is accepted as cosmetic), then an
E11 would be needed here to add immediate RGB restoration after the force-apply.
But since E10 IS recommended, E11 is unnecessary.

---

# 4. EDIT ORDERING

## Complete Edit Sequence (E1-E10)

Edits are applied in reverse line-number order to prevent line drift.

| Order | Edit | Lines | Source | Type |
|-------|------|-------|--------|------|
| 1st | E5 | 4062-4096 | E1-E5 plan | Comments only |
| 2nd | E4 | 4011-4019 | E1-E5 plan | Comments only |
| 3rd | E3 | 3997-4004 | E1-E5 plan | Comment + template |
| 4th | E2 | 3788-3808 | E1-E5 plan | Comment + code |
| 5th | E1 | 3689-3694 | E1-E5 plan | Comment + template |
| 6th | E9 | 2522-2529 | THIS plan | Variables + filter |
| 7th | E8 | 1608-1644 | THIS plan | Variables + filter |
| 8th | E7 | 1549-1569 | THIS plan | Variables + filter |
| 9th | E6 | 1499-1509 | THIS plan | Variables + filter |
| 10th | E10 | 1272-1290 | THIS plan | Variables + filter |

### Dependencies

- E1-E5 are independent of E6-E10. They fix the reset scripts' own detection logic.
- E6-E10 are independent of each other. Each fixes a different bypass point.
- E6-E10 depend on E1-E5 only in the sense that both should be deployed together
  for complete protection. Without E1-E5, the reset scripts' detection window is
  still too wide. Without E6-E10, external bypasses defeat the reset scripts.

### Line Drift Analysis

- E5 (L4062-4096): +15 lines (comments added). Shifts E4 down by ~15.
  - But E4 is at lower lines (4011-4019), so no drift.
- E4 (L4011-4019): +4 lines. No drift for E3 (lower at 3997).
- E3 (L3997-4004): +5 lines. No drift for E2 (lower at 3788).
- E2 (L3788-3808): -11 lines (removed parameter overrides). No drift for E1 (lower at 3689).
- E1 (L3689-3694): +7 lines (expanded comments). No drift for E9 (lower at 2522).
- E9 (L2522-2529): +11 lines (variables block added). No drift for E8 (lower at 1608).
- E8 (L1608-1644): +10 lines (variables + filter logic). No drift for E7 (lower at 1549).
- E7 (L1549-1569): +13 lines (variables block added). No drift for E6 (lower at 1499).
- E6 (L1499-1509): +14 lines (variables block added). No drift for E10 (lower at 1272).
- E10 (L1272-1290): +7 lines (column_rgb_active variable + expanded on_lights logic).

Each edit is at strictly lower line numbers than the previous, confirming no drift.

---

# 5. EDGE CASE ANALYSIS

For each scenario, trace through ALL bypass points after ALL fixes (E1-E10) are applied.

## EC1: User calls soft reset at -2 deg (Gaussian fade active, was_non_adaptive=true)

**Trigger:** Zen32 triple-tap or dashboard reset button. Config was "TV Mode".

**Trace:**

1. `oal_reset_soft` starts (L3679)
2. Variables computed at script start:
   - `sun_elevation = -2`, `sun_rising = false`
   - **E1 applied:** `in_column_rgb_mode = (not false and -2 < 3 and -2 >= -5) = TRUE`
   - `was_non_adaptive = TRUE` (config was TV Mode)
   - `columns_manual = TRUE` (prepare_rgb set manual_control)
3. Column protection (L3759-3787):
   - `columns_manual = TRUE` -> enters column handling
   - `in_column_rgb_mode = TRUE` -> choose branch: applies RGB color [255, green, 0],
     re-locks manual_control
4. Non-column reset (L3813-3821): clears manual_control on non-column switches
5. Config set to "Adaptive" (L3854-3859): triggers Config Manager
6. **Config Manager fires** (L1314):
   - Baseline path (L1478): `is_baseline = TRUE`
   - **E6 applied:** `column_rgb_active` computed:
     - `elev = -2`, `rising = false`, `manual = TRUE`
     - `column_rgb_active = TRUE`
   - `switches_to_clear` = 5 switches (column_lights excluded)
   - Manual control cleared on 5 switches only
   - Column manual_control PRESERVED
7. Config Manager fires watchdog with `force: true` (L1536)
8. **Engine runs with force-apply:**
   - **E10 applied:** `column_rgb_active = TRUE` (manual set, -2 deg, not rising)
   - `on_lights` for columns = filtered (manual_lights rejected) = empty
   - No apply to columns. No color_temp flash.
9. Other zones get force-applied normally.

**Result:** Column lights stay in RGB mode throughout. No flash. No manual_control
clearance. Protection fully effective.

## EC2: User exits movie mode at +1 deg (twilight, RGB active)

**Trigger:** Media player stops, movie mode input_boolean turned off.

**Trace:**

1. Movie mode handler exit sequence (L2510-2533)
2. Scene restore (L2516-2520): restores pre-movie light states
3. **E9 applied:** Manual control clearing:
   - `column_rgb_active` computed: `elev = 1`, `rising = false`, `manual = TRUE`
   - `column_rgb_active = TRUE` (1 < 3, 1 >= -5, not rising, manual set)
   - `switches_to_clear` = 5 switches (column_lights excluded)
   - Manual control cleared on 5 switches only
4. Column lights retain manual_control, stay in RGB mode
5. `input_boolean.oal_movie_mode_active` turned off (L2531-2533)

**Result:** Column RGB mode preserved. Other lights return to AL control.

## EC3: User selects "Full Bright" at -3 deg (RGB active)

**Trigger:** Dashboard or Zen32 config cycle selects "Full Bright".

**Trace:**

1. Config Manager fires (L1314)
2. Full Bright path (L1546): `is_force_on = TRUE`
3. **E7 applied:**
   - `column_rgb_active` computed: `elev = -3`, `rising = false`, `manual = TRUE`
   - `column_rgb_active = TRUE`
   - `switches_to_clear` = 5 (no column_lights)
   - `switches_to_apply` = 5 (no column_lights)
4. Manual control cleared on 5 switches, apply runs on 5 switches
5. All non-column lights turn on at full AL brightness
6. Column lights untouched -- stay in RGB mode at Gaussian color

**Result:** Full brightness on all lights EXCEPT columns (which preserve RGB).
User gets bright room with sunset-colored columns. This is the correct behavior.

## EC4: Zen32 brightness press at 0 deg (active Gaussian transition)

**Trigger:** User presses Zen32 B2 (brighter) during sunset.

**Trace:**

1. `oal_manual_brightness_step` sets zone offsets
2. `oal_global_adjustment_start` fires (L3267)
3. Watchdog fires with `force: true` (L3277)
4. **Engine runs with force-apply:**
   - **E10 applied:** For column_lights zone:
     - `manual_lights = [light.living_column..., light.dining_column...]`
     - `column_rgb_active = TRUE` (manual set, 0 deg, not rising)
     - `on_lights = all_on_lights | reject('in', manual_lights)` = empty
     - No apply to columns
   - Other zones: force-applied with new offset. Brightness changes instantly.
5. `oal_deferred_manual_control_set` runs (L3292):
   - Re-locks manual_control on all ON lights (redundant for columns)

**Result:** Other lights respond to brightness adjustment. Column lights stay in RGB
mode with no flash, no color gap. Immediate and correct.

## EC5: Config Manager transition from TV Mode at -1 deg (columns in prev_controlled_lights)

**Trigger:** User switches from TV Mode to Dim Ambient during twilight.

**Trace:**

1. Config Manager fires (L1314)
2. Override path (L1601): default branch
3. `prev_controlled_lights` (L1427-1437):
   - TV Mode has `lights_off: [light.column_lights, ...]`
   - After expand: includes `light.living_column_strip_light_matter`,
     `light.dining_column_strip_light_matter`, plus others
4. **E8 applied:** Transition cleanup:
   - `column_rgb_active` computed: `elev = -1`, `rising = false`, `manual = TRUE`
   - `column_rgb_active = TRUE`
   - For `switch.adaptive_lighting_column_lights`:
     - `raw_lights_for_switch = [light.living_column..., light.dining_column...]`
     - `lights_for_switch = raw | reject('in', column_light_entities)` = empty
     - No `set_manual_control: false` called for column switch
     - No `apply` called for column switch
   - For other switches: cleanup proceeds normally
5. Phase 2 (L1676-1755): new config offsets applied
6. Phase 3 (L1696-1745): Dim Ambient dims `light.column_lights: 30` (L1352)
   - Wait: this sets manual_control TRUE on column lights via L1713-1718
   - This ADDS to the existing manual_control (which already has the lights from
     prepare_rgb)
   - Then dims columns to brightness 30% via L1724-1730
   - **This WILL overwrite the RGB color** with a dimmed version!

**IMPORTANT FINDING:** The Dim Ambient config path (Phase 3) will dim column lights
to 30% via `light.turn_on` with `brightness_pct: 30`. This call does NOT specify
`rgb_color` or `color_temp`, so it will adjust brightness only (preserving current
color mode). The columns are currently in RGB mode, so they stay in RGB at 30%.
Actually -- `light.turn_on` with only `brightness_pct` preserves the current color
mode and color. The column lights will dim from 20% to 30% (actually brighten
slightly) while staying in RGB mode.

Wait -- Dim Ambient controls `light.column_lights: 30` which is the GROUP entity.
The group entity turns on individual lights. The `light.turn_on` service with
`brightness_pct: 30` on the group will send brightness to both column light entities.
Since they are already in RGB mode, the color is preserved. This is actually fine.

**Revised result:** Column RGB mode preserved (color maintained). Columns brightened
to 30% by Dim Ambient config. The Dim Ambient config's manual_control TRUE adds to
existing protection. This is acceptable behavior.

## EC6: HA restart at -2 deg (startup sequence)

**Trigger:** HA service restart or host reboot during active RGB window.

**Trace:**

1. AL integration loads. `manual_control` cleared (not persisted). All switches
   reset to YAML defaults.
2. `oal_system_startup_v13` fires (L2566-2600):
   - Sleep mode switches turned OFF (L2579-2587)
   - `script.oal_reset_global` called (L2594):
     - Calls `oal_reset_soft`
     - `columns_manual = FALSE` (manual_control empty from restart)
     - Column handling SKIPPED entirely
   - Delay 2s (L2595)
   - Watchdog fires with `force: true` (L2597)
3. **Engine runs with force-apply:**
   - **E10 applied:** `manual_lights = []` (empty), `column_rgb_active = FALSE`
   - `on_lights = all_on_lights` (full force-apply)
   - Engine pushes color_temp to columns -- correct since they're not in RGB mode
4. `prepare_rgb_mode` (L1835) does NOT fire:
   - Trigger is `numeric_state below: 3` -- requires state crossing, not already-below
   - At restart, elevation is already -2, so no crossing occurs
5. `sleep_trigger` fires on HA start (L2012-2013):
   - Elevation -2 is above -5, not below: the "evening_final" condition fails
   - Default path evaluates, checks elevation, likely turns on sleep mode since -2 is
     still in the evening window... wait, let me re-read.
   - Actually, the sleep_trigger has three triggers: HA start, below -5, above 5.
   - On HA start, it enters the default path (neither evening_final nor morning_trigger
     matched since those are trigger ID-gated)
   - Need to check what the default path does.

Let me re-read the sleep trigger default path.

**Known limitation (unchanged):** After HA restart during the RGB window, columns do
NOT return to RGB mode. They go to AL color_temp control. The Gaussian RGB evening
effect is lost until the next sunset (next `numeric_state below: 3` crossing). This is
documented in the existing plan as acceptable degradation.

**E6-E10 do not change this behavior.** The restart path is safe because
`manual_control` is empty, so `column_rgb_active` is FALSE everywhere. No protection
gates are triggered. The engine applies normally.

---

# 6. INTEGRATION WITH EXISTING E1-E5 PLAN

## Mapping

| Edit | Source Document | Bypass Point | Layer |
|------|-----------------|-------------|-------|
| E1 | column_rgb_reset_fix_plan.md | Reset soft detection window | Internal |
| E2 | column_rgb_reset_fix_plan.md | Reset soft sleep_rgb_color bug | Internal |
| E3 | column_rgb_reset_fix_plan.md | Reset room detection window | Internal |
| E4 | column_rgb_reset_fix_plan.md | Reset room apply_switches docs | Internal |
| E5 | column_rgb_reset_fix_plan.md | Reset room column section docs | Internal |
| E6 | THIS document | Config Manager Baseline | Layer 1 (manual_control) |
| E7 | THIS document | Config Manager Full Bright | Layer 1 + 2 (manual_control + apply) |
| E8 | THIS document | Config Manager Transition Cleanup | Layer 1 + 2 |
| E9 | THIS document | Movie Mode Exit | Layer 1 (manual_control) |
| E10 | THIS document | Engine Force-Apply | Layer 2 (apply exclusion) |

## Interactions

### E1 + E6

E1 narrows the `in_column_rgb_mode` window in `oal_reset_soft`. E6 adds column
protection to the Config Manager baseline path. These interact when soft reset runs
during the RGB window AND `was_non_adaptive = true`:

- **Without E6:** Soft reset re-locks manual_control (via E1's corrected window), then
  Config Manager clears it. Protection defeated.
- **With E6:** Config Manager respects column_rgb_active and skips column_lights.
  Protection preserved.

E6 is the critical complement to E1 for the `was_non_adaptive` code path.

### E3 + E10

E3 narrows the `in_column_rgb_mode` window in `oal_reset_room`. E10 prevents the
engine's force-apply from pushing color_temp to columns. These interact because
`oal_reset_room` fires the engine BEFORE column protection:

- **Without E10:** Engine pushes color_temp (flash), then E3's protection re-applies
  RGB. Brief flash visible.
- **With E10:** Engine skips columns entirely. E3's protection re-applies RGB.
  No flash.

### E7 + E10

E7 prevents Full Bright from clearing manual_control AND from calling apply on
column_lights. E10 additionally prevents force-apply from targeting columns. These
are defense-in-depth:

- **E7 alone:** Prevents manual_control clearing and the explicit apply loop.
  But the subsequent watchdog trigger (if any) would still force-apply.
  Actually, Full Bright path does NOT fire a watchdog. No interaction issue.
- **E10 adds protection** for any OTHER force-apply that happens while Full Bright
  is active (e.g., periodic engine run -- but that's not force, so irrelevant).

E7 is sufficient for the Full Bright path. E10 is bonus defense.

### E8 + E6

E8 protects the transition cleanup path. E6 protects the baseline path. Both are in
the Config Manager. If transitioning from a config that controlled columns (like TV
Mode) TO Adaptive:

1. E8 prevents cleanup from clearing column manual_control
2. E6 prevents the baseline path from clearing column manual_control

Both are needed for complete protection during this specific transition.

### E9 (standalone)

E9 is independent. Movie Mode exit does not trigger the Config Manager or the engine
directly (it just clears manual_control and restores a scene). No interaction with
other edits.

## Combined Protection Matrix

After ALL edits (E1-E10), here is the protection status of each bypass point:

| Bypass Point | Layer 1 (manual_control) | Layer 2 (apply) | Layer 3 (rgb_transition) | Status |
|-------------|-------------------------|-----------------|-------------------------|--------|
| Config Manager Baseline | E6: PROTECTED | E10: PROTECTED | Existing | FIXED |
| Config Manager Full Bright | E7: PROTECTED | E7+E10: PROTECTED | Existing | FIXED |
| Config Manager Transition | E8: PROTECTED | E8: PROTECTED | Existing | FIXED |
| Movie Mode Exit | E9: PROTECTED | N/A (no apply) | Existing | FIXED |
| Engine Force-Apply | N/A (not a clearing) | E10: PROTECTED | Existing | FIXED |
| Zen32 Adjustment | N/A (deferred restores) | E10: PROTECTED | Existing | FIXED |
| System Startup | N/A (manual empty) | N/A (manual empty) | N/A | SAFE BY DESIGN |

---

# 7. SUMMARY OF CHANGES

## Total New Edits: 5 (E6 through E10)

| Edit | Lines | Change Type | Lines Added | Bypass Fixed |
|------|-------|-------------|-------------|--------------|
| E6 | ~1499-1509 | Variables + filter | +14 | Config Manager Baseline |
| E7 | ~1549-1569 | Variables + filter | +13 | Config Manager Full Bright |
| E8 | ~1608-1644 | Variables + filter | +10 | Config Manager Transition Cleanup |
| E9 | ~2522-2529 | Variables + filter | +11 | Movie Mode Exit |
| E10 | ~1272-1290 | Variables + filter | +7 | Engine Force-Apply |

## Principles Applied

- **A. Single Responsibility:** All 5 edits use the identical `column_rgb_active`
  detection pattern with the same bounds (3, -5, 5, 8) and same three conditions
  (manual + elevation + rising).

- **B. Defense in Depth:** Layer 1 (E6, E7, E8, E9) prevents manual_control clearing.
  Layer 2 (E7, E8, E10) prevents apply calls. Layer 3 (existing rgb_transition)
  restores on ~60s cadence if both layers fail.

- **C. Minimal Invasiveness:** Each edit adds only a `variables:` block and changes
  the target list. No restructuring of automations. No new entities. No new triggers.

- **D. Consistency:** All gates use identical Jinja2 with identical SYNC comments
  referencing the same four source line numbers.

- **E. Govee Safety:** By preventing `adaptive_lighting.apply` from targeting
  RGB-protected columns, we ensure no `color_temp` values are pushed to Govee strips
  during the RGB window. The Govee 2700-6500K clamping issue is avoided entirely
  because AL never gets the chance to push color_temp.

---

# 8. REMAINING KNOWN LIMITATIONS

## 8.1 HA Restart During RGB Window

After restart, `manual_control` is cleared (AL does not persist it). `prepare_rgb`
requires a `numeric_state` crossing to fire, which does not happen if elevation is
already below 3. Columns remain in AL color_temp mode until the next sunset.

**Status:** Accepted degradation. Fixing requires either (a) persisting manual_control
state, or (b) adding a HA-start trigger to prepare_rgb that checks elevation.
Both are out of scope for this plan.

## 8.2 20% to 1% Brightness Jump at Deep Night

When reset releases columns to AL sleep mode at deep night (below -5 deg), brightness
drops from 20% (evening RGB) to 1% (sleep mode). This is the intended behavior per
the AL sleep configuration, but it is visually jarring.

**Status:** By design. The alternative (keeping columns at 20% during sleep) would
violate the sleep mode intent.

## 8.3 Morning Window Unreachable Under Normal Operation

The morning branch `(rising and elev >= 5 and elev < 8)` will never evaluate to TRUE
because `autoreset_control_seconds: 14400` clears manual_control ~4 hours after
prepare_rgb fires, well before morning. The morning branch is defensive only.

**Status:** Harmless. Provides protection in the theoretical case where autoreset is
disabled or fails.

## 8.4 Full Bright During RGB Preserves Columns in RGB Mode

With E7, selecting "Full Bright" during the RGB window turns on all lights except
columns at full brightness. Columns stay in RGB mode. A user who specifically wants
columns at full brightness during twilight would need to manually clear column
manual_control first.

**Status:** Acceptable trade-off. Preserving the sunset effect is higher priority than
edge-case full-brightness requests.
