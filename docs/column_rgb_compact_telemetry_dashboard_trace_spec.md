# Column RGB Compact Telemetry Dashboard and Trace Spec

## 1. Purpose

Define a compact, operator-first telemetry specification for the Column RGB protection system that is:
- reliable under real-world Home Assistant automation concurrency
- flexible for future logic changes without redesigning observability
- empowering for end users by making ownership decisions explicit and auditable

This spec is keyed to the `oal_column_rgb_debug` event contract and the new runtime state helpers.

## 2. Scope

In scope:
- Runtime state telemetry (session/window/protect/sleep/manual)
- Decision-event telemetry (`oal_column_rgb_debug`)
- Minimal Lovelace dashboard composition
- Trace workflow for diagnosis
- Alert thresholds and pass/fail observability contract

Out of scope:
- Rewriting automation logic
- Full BI/historical analytics stack
- Long-term warehouse retention architecture

## 3. Telemetry Philosophy (HA-Aligned)

1. State is authority:
   - Entity states represent current ownership truth.
2. Events explain intent:
   - Debug events explain why ownership changed or was preserved.
3. Traces prove execution:
   - Automation traces validate that intended branches actually ran.

This follows Home Assistant’s operational pattern:
- entities for current truth
- events for causality
- traces for branch-level accountability

## 4. Canonical Decision Taxonomy

Event type:
- `oal_column_rgb_debug`

Required event fields (global):
- `decision`
- `source`
- `result`

Recommended contextual fields:
- `reason`
- `sun_elevation`
- `sun_rising`
- `manual_count`
- `trigger_id`
- `columns_on`
- `sleep_mode_on`
- `force_intent`

Decision catalog:

| decision | Primary source(s) | Operational meaning |
|---|---|---|
| `prepare_on_start` | `oal_column_lights_prepare_rgb_mode_v13` | Startup prepare recovery eligibility was evaluated and executed/skipped |
| `protect_engage` | `oal_column_lights_prepare_rgb_mode_v13`, `oal_reset_soft`, `oal_reset_room` | RGB ownership was deliberately preserved/re-engaged |
| `protect_skip` | `oal_reset_soft`, `oal_reset_room` | Protect path was intentionally not applicable |
| `release_forced` | `oal_column_lights_sleep_trigger_v13`, `oal_reset_soft`, `oal_reset_room` | Session/manual ownership was deliberately released |
| `heal_executed` | `oal_column_lights_rgb_self_heal_v13` | Self-heal restored RGB manual ownership in a valid session window |
| `engine_protect_filter` | `oal_core_adjustment_engine_v13` | Core engine filtered protected columns, or explicit override bypassed filter |
| `startup_reconcile` | `oal_system_startup_v13` | Startup reconciliation resolved stale/invalid session state |

## 5. Runtime State Signals (Primary Dashboard Inputs)

Required entities:
- `input_boolean.oal_column_rgb_session_active`
- `input_boolean.oal_column_rgb_guard_kill_switch`
- `input_boolean.oal_column_rgb_debug_events`
- `binary_sensor.oal_column_rgb_window_active`
- `binary_sensor.oal_column_rgb_protect_active`
- `switch.adaptive_lighting_sleep_mode_column_lights`
- `switch.adaptive_lighting_column_lights` (attribute `manual_control`)
- `sun.sun` (attributes: `elevation`, `rising`)

Recommended harness entities (for accelerated validation):
- `input_boolean.oal_test_mode`
- `input_number.oal_test_sun_elevation`
- `input_boolean.oal_test_sun_rising`
- `sensor.oal_effective_sun_elevation`
- `binary_sensor.oal_effective_sun_rising`

Derived operator interpretation:
- `session_active=on`, `window_active=on`, `protect_active=on`:
  - Expected protected ownership state.
- `sleep_mode=on`, `session_active=off`:
  - Expected deep-night ownership state.
- `window_active=on` but `protect_active=off`:
  - Requires event/trace review (possible eligibility failure, restart state, or user action).

## 6. Compact Dashboard Layout Spec (Single View)

### Card A: Ownership Status (Entities card)

Show:
- session active
- protect active
- window active
- sleep mode switch
- guard kill switch
- debug events toggle

Purpose:
- one-glance ownership truth and operator controls

### Card B: Sun and Manual Context (Glance or Entities)

Show:
- `sun.sun` elevation/rising
- column manual list length (via attribute display or template helper)
- current config mode (`input_select.oal_active_configuration`)

Purpose:
- explain why a decision is valid/invalid

### Card C: Decision Stream (Logbook/Event view)

Filter to:
- event type `oal_column_rgb_debug`
- sources containing `oal_column_lights_*`, `oal_reset_*`, `oal_core_adjustment_engine_v13`, `oal_system_startup_v13`

Display fields:
- timestamp
- decision
- source
- result
- reason

Purpose:
- fast causal audit without opening traces

### Card D: Lifecycle Health (History graph)

Plot:
- session active
- protect active
- window active
- sleep mode switch

Window:
- last 12h (sunset-to-morning)

Purpose:
- validate expected lifecycle transitions and detect oscillation

### Card E: Trace Jump Table (Markdown instructions)

Provide quick navigation checklist:
1. If `engine_protect_filter` unexpected -> open core engine trace.
2. If startup issue -> open prepare + startup traces.
3. If release issue -> open sleep trigger + reset traces.
4. If manual lost -> open self-heal trace.

Purpose:
- reduce diagnosis latency for non-developer operators

## 7. Minimum Lovelace YAML Skeleton (Reference)

```yaml
title: Column RGB Ops
path: column-rgb-ops
type: sections
sections:
  - type: grid
    cards:
      - type: entities
        title: Ownership Status
        entities:
          - input_boolean.oal_column_rgb_session_active
          - binary_sensor.oal_column_rgb_protect_active
          - binary_sensor.oal_column_rgb_window_active
          - switch.adaptive_lighting_sleep_mode_column_lights
          - input_boolean.oal_column_rgb_guard_kill_switch
          - input_boolean.oal_column_rgb_debug_events
      - type: entities
        title: Sun and Context
        entities:
          - sun.sun
          - input_select.oal_active_configuration
          - switch.adaptive_lighting_column_lights
      - type: history-graph
        title: Lifecycle Health (12h)
        hours_to_show: 12
        entities:
          - input_boolean.oal_column_rgb_session_active
          - binary_sensor.oal_column_rgb_protect_active
          - binary_sensor.oal_column_rgb_window_active
          - switch.adaptive_lighting_sleep_mode_column_lights
      - type: logbook
        title: Column RGB Decisions
        entities:
          - input_boolean.oal_column_rgb_session_active
          - switch.adaptive_lighting_sleep_mode_column_lights
```

Note:
- Native Logbook card does not fully expose raw custom event fields in all frontend variants.
- If event field visibility is insufficient, use a custom event card or forward selected event data to helper sensors.

## 8. Decision-to-Trace Routing Map

| decision observed | First trace to open | Secondary trace |
|---|---|---|
| `prepare_on_start` | `oal_column_lights_prepare_rgb_mode_v13` | `oal_system_startup_v13` |
| `protect_engage` from reset | `script.oal_reset_soft` or `script.oal_reset_room` | `oal_core_adjustment_engine_v13` |
| `release_forced` | `oal_column_lights_sleep_trigger_v13` or reset script trace | `oal_core_adjustment_engine_v13` |
| `heal_executed` | `oal_column_lights_rgb_self_heal_v13` | `oal_column_lights_sleep_trigger_v13` |
| `engine_protect_filter` | `oal_core_adjustment_engine_v13` | watchdog emitter trace/source |
| `startup_reconcile` | `oal_system_startup_v13` | `oal_column_lights_prepare_rgb_mode_v13` |

## 9. Alert and Anomaly Rules (Compact)

Recommended operational alerts:

1. Protect mismatch:
   - Condition: `window_active=on` and `session_active=on` and `protect_active=off` persists > 90s.
   - Action: notify + trace checklist.

2. Unexpected deep-night protection:
   - Condition: `sun_elevation < -5` and `protect_active=on` persists > 60s.
   - Action: emit warning; expected state is released ownership.

3. Self-heal churn:
   - Condition: `heal_executed` occurs more than 3 times in 10 minutes.
   - Action: investigate release/heal race.

4. Force override visibility:
   - Condition: `engine_protect_filter` with `result=override_all_bypass`.
   - Action: informational audit notification (explicit operator override path used).

## 10. Data Retention and Performance Guidance

1. Keep `oal_column_rgb_debug_events` off by default outside commissioning/troubleshooting.
2. During validation windows, enable debug events for full causal visibility.
3. Recorder policy:
   - retain entity history for at least 48h for lifecycle comparison
   - retain logbook/events long enough to cover at least one complete sunset-morning test
4. If event volume becomes noisy, preserve only decision types needed for active incident triage.

## 11. Acceptance Criteria for This Spec

1. Operator can determine current ownership state in under 10 seconds from one dashboard view.
2. Any incorrect column behavior can be routed to the right trace path from decision code alone.
3. Sunset-to-morning lifecycle can be validated without editing YAML.
4. Explicit overrides are distinguishable from safe-force behavior.
5. Debug telemetry can be disabled without affecting runtime control logic.

## 12. Implementation Checklist (Dashboard/Telemetry)

1. Create the `Column RGB Ops` Lovelace view with cards A-E.
2. Verify required entities are visible and updating.
3. Enable debug events and confirm all decision codes appear during test scenarios.
4. Run `docs/column_rgb_end_to_end_testing_runbook.md` and attach screenshots of:
   - ownership status card at twilight and deep night
   - decision stream entries for protect/release
   - lifecycle history graph
5. Disable debug events after validation unless active troubleshooting is needed.
