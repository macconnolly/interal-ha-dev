# OAL v13

## FIRST RESPONSE REQUIREMENT

Every response to a task starts with this block. No text before it.

```
## Context Loaded

**Goal:** [One sentence]

**User said:**
1. "[exact quote]"
2. "[exact quote]"
3. "[exact quote]"

**I read:**
- [filename:lines] - [what I learned]
- [memory #ID] - [what I learned]

**I don't know:**
1. [specific unknown]
2. [specific unknown]

Waiting for "proceed"
```

If any field is empty, the block is invalid. Start over.

---

## INVARIANTS

| # | Rule | Broken when |
|---|------|-------------|
| 1 | `zone_min <= brightness <= zone_max` | Lights at 0% or 100% |
| 2 | Govee: `2700K <= temp <= 6500K` | Purple color |
| 3 | Manual resets after timeout | Stuck in manual |
| 4 | Sleep/movie bypass calculations | Force mode ignored |
| 5 | Environmental is additive | Brightness jumps |
| 6 | ZEN32 LED = actual state | Wrong LED color |
| 7 | Pause freezes everything | Changes during pause |

Before any change: which invariants could break?

---

## ENTITIES

| Entity | Changes | Breaks |
|--------|---------|--------|
| `input_select.oal_current_config` | All baselines | All zones |
| `input_number.oal_manual_brightness_offset` | Global brightness | All zones |
| `input_number.oal_brightness_environmental_offset` | Env response | Per-zone |
| `input_number.oal_sunset_brightness_offset` | Sunset curve | All zones |
| `input_boolean.oal_force_sleep` | Sleep mode | All zones, LEDs |
| `input_boolean.oal_movie_mode_active` | Movie dim | Living room |
| `input_boolean.oal_system_paused` | System freeze | Everything |

---

## PIPELINE

```
baseline (40-80%)
    + env_offset (-20 to +30)
    + sunset_offset (-40 to 0)
    + manual_offset
    ─────────────────────────
    = clamp(sum, zone_min, zone_max) * sensitivity
    → adaptive_lighting (6 zones parallel)
```

---

## ZEN32

| Button | Tap | Does |
|--------|-----|------|
| B2 | 1x | brightness +10 |
| B4 | 1x | brightness -10 |
| B5 | 1x | cycle config |
| B5 | 2x | reset manual offset |
| B5 | 3x | toggle sleep |

---

## AUTOMATIONS

| ID | Does |
|----|------|
| `oal_core_adjustment_engine_v13` | Master calculation |
| `oal_configuration_manager_v13` | Config changes |
| `oal_sunset_logic_unified_v13` | Sunset curve |
| `oal_environmental_manager_v13` | Lux/weather |
| `oal_movie_mode_handler_v13` | Media dimming |
| `oal_isolated_override_manager_v13` | Manual timeout |

---

## FAILURES

| See | Cause |
|-----|-------|
| 0% or 100% brightness | Offset overflow, check clamp |
| Purple Govee | temp < 2700K |
| Stuck manual | override_manager broken |
| Wrong LED | zen32_led_sync race |
| Slow response | Missing `parallel:` |

---

## DEBUG

```python
ha_get_state("sensor.oal_system_status")
ha_get_automation_traces("automation.oal_core_adjustment_engine_v13", limit=5)
```

---

## AGENTS FOR OAL WORK

| Need | Agent | Use |
|------|-------|-----|
| Deploy package changes | `ha-package-deployer` | After ANY edit to OAL_lighting_control_package.yaml |
| Query live state | `ha-mcp-query` | Check entity states, verify changes applied |
| Research HA patterns | `ha-integration-researcher` | Adaptive Lighting docs, template syntax |
| Test physical response | `ha-device-validator` | User confirms lights actually changed |
| Debug entity | `entity-debugger` | Why isn't automation firing? |

**CRITICAL:** No OAL change is complete until deployed via `ha-package-deployer` and verified via `ha-mcp-query`.
