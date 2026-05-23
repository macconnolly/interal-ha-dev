# HVAC Stats + OAL Mode-Reset Fixes — Detailed Plan

**Created:** 2026-05-23
**Source investigations:** two parallel subagent audits (HVAC stats sensors at 0; OAL mode-reset mechanisms audit)
**Status:** awaiting Mac's stamp on sequencing + tranche acceptance before any edits

## 0. Executive summary

Two independent workstreams, both touching `packages/*.yaml`, both with HA reload/restart implications. Total: 11 broken climate sensors (#1) + 6 robustness/flicker bugs in the OAL mode-reset engine (#2). They share NO files except both deploying via `bash skills/ha-safe-package-deploy/scripts/deploy_packages.sh`, so they're independently revertable.

**Sequencing recommendation: SEQUENTIAL, not batched.** Reasoning:

- #1 is cleanly self-contained and low blast-radius (recorder/template integration only). Ship first.
- #2 has correctness bugs (permanent engine jam on rapid taps) that ARE high-impact but each fix has slightly different risk profiles. Split into 3 tranches and test each independently.
- Each commit-and-deploy is a checkpoint; rollback is `git revert` + redeploy of the previous packages snapshot (deploy script auto-backs-up timestamped tarballs).

**Total estimated time** (focused work + Mac's verification gates): 60-90 minutes for #1; 90-120 minutes for #2 across all three tranches.

---

## 1. HVAC stats fix — detailed plan

### 1.1 Scope

Fix the 11 stuck-at-0 climate sensors. Add 2 new binary_sensor primitives. Rewire 5 `history_stats` sensors. Optionally fix `sensor.hvac_last_cycle_started` logic bug and the orphan `"Dim Ambient"` → `"Evening"` mismatch in `tunet_oal_enhancements.yaml`.

### 1.2 Root cause (confirmed by subagent + live state check)

`history_stats` matches `entity.state` only. `climate.dining_room.state` is `"heat_cool"` (the HVAC *mode*), 100% of recent samples. The actual heating/cooling/idle values live on the `hvac_action` *attribute*, which `history_stats` cannot read. So every `state: "heating"` / `state: "cooling"` / `state: "idle"` filter is permanently 0.

### 1.3 Affected sensors (11 total)

**Root-cause (5)** — these have the actual config bug:
- `sensor.hvac_heating_today_minutes` (tunet_hvac_sensors.yaml:24-32)
- `sensor.hvac_cooling_today_minutes` (tunet_hvac_sensors.yaml:34-41)
- `sensor.hvac_idle_today_minutes` (tunet_hvac_sensors.yaml:43-50)
- `sensor.hvac_heating_yesterday_hours` (tunet_stats_sensors.yaml:96-104)
- `sensor.hvac_cooling_yesterday_hours` (tunet_stats_sensors.yaml:106-114)

**Downstream (6)** — broken because their source is broken:
- `sensor.hvac_heating_minutes_today` template (tunet_hvac_sensors.yaml ~line 56)
- `sensor.hvac_cooling_minutes_today` template (~line 67)
- `sensor.hvac_heating_minutes_weekly` utility_meter (tunet_stats_sensors.yaml ~line 138)
- `sensor.hvac_cooling_minutes_weekly` utility_meter (~line 146)
- `sensor.hvac_heating_minutes_monthly` utility_meter (if defined)
- `sensor.hvac_cooling_minutes_monthly` utility_meter (if defined)

### 1.4 Additional bugs flagged by subagent (DECISION POINT)

- **B1**: `sensor.hvac_last_cycle_started` (tunet_hvac_sensors.yaml:101-110) only emits a timestamp during an ACTIVE cycle. After idle, goes back to `unknown` instead of holding the last cycle's start. Name promises "last started"; logic delivers "currently started." Likely needs `trigger_template` watching the off→on edge of `binary_sensor.hvac_running` and capturing `last_changed`.
- **B2**: `packages/tunet_oal_enhancements.yaml:36-43` still references `state: "Dim Ambient"` for a history_stats sensor after commit `6caad51` renamed the mode to `"Evening"`. Same shape of bug as the climate ones — stuck-at-0 because the state name never matches anymore.

**Decision needed from Mac**: include B1 + B2 in this deploy OR defer to a separate cleanup pass?

Recommendation: **include both** in this deploy. B2 is a one-line edit (same change Mac just shipped renaming to Evening); B1 is a template rewrite. Both are stuck-at-zero today. Same blast radius, same restart, same risk profile.

### 1.5 Edits

**File A: `packages/tunet_hvac_sensors.yaml`**

In the `template:` block (currently extends `binary_sensor:` at line ~140), ADD two new entries:

```yaml
  - binary_sensor:
      - name: "HVAC Running"
        # ...existing block, unchanged...

      # T1.6: new — surfaces climate.dining_room.attributes.hvac_action as
      # its own state so history_stats can match against state: "on".
      - name: "HVAC Heating Active"
        unique_id: "tunet_hvac_heating_active"
        device_class: heat
        state: >
          {{ state_attr('climate.dining_room', 'hvac_action') == 'heating' }}
        attributes:
          hvac_action: >
            {{ state_attr('climate.dining_room', 'hvac_action') }}

      - name: "HVAC Cooling Active"
        unique_id: "tunet_hvac_cooling_active"
        device_class: cold
        state: >
          {{ state_attr('climate.dining_room', 'hvac_action') == 'cooling' }}
        attributes:
          hvac_action: >
            {{ state_attr('climate.dining_room', 'hvac_action') }}
```

In the existing `sensor:` block (lines 23-50), rewire the 3 today-counter `history_stats`:

```yaml
sensor:
  - platform: history_stats
    name: "HVAC Heating Today Minutes"
    unique_id: "tunet_hvac_today_minutes_heating"
    entity_id: binary_sensor.hvac_heating_active    # was: climate.dining_room
    state: "on"                                      # was: "heating"
    type: time
    start: "{{ today_at('00:00') }}"
    end: "{{ now() }}"

  - platform: history_stats
    name: "HVAC Cooling Today Minutes"
    unique_id: "tunet_hvac_today_minutes_cooling"
    entity_id: binary_sensor.hvac_cooling_active    # was: climate.dining_room
    state: "on"                                      # was: "cooling"
    type: time
    start: "{{ today_at('00:00') }}"
    end: "{{ now() }}"

  - platform: history_stats
    name: "HVAC Idle Today Minutes"
    unique_id: "tunet_hvac_today_minutes_idle"
    entity_id: binary_sensor.hvac_running           # was: climate.dining_room
    state: "off"                                     # was: "idle" — off=idle/off (the truth)
    type: time
    start: "{{ today_at('00:00') }}"
    end: "{{ now() }}"
```

**B1 fix** — `sensor.hvac_last_cycle_started` (lines 101-110), convert to `trigger_template:`

```yaml
template:
  - trigger:
      - platform: state
        entity_id: binary_sensor.hvac_running
        to: "on"
    sensor:
      - name: "HVAC Last Cycle Started"
        unique_id: "tunet_hvac_last_cycle_started"
        device_class: timestamp
        state: "{{ trigger.to_state.last_changed.isoformat() }}"
```

This persists across restarts (via recorder), updates only on cycle start, holds the value when HVAC returns to idle.

**File B: `packages/tunet_stats_sensors.yaml`**

Rewire the 2 yesterday-window `history_stats` (lines 96-114):

```yaml
sensor:
  - platform: history_stats
    name: "HVAC Heating Yesterday Hours"
    unique_id: "tunet_hvac_heating_yesterday_hours"
    entity_id: binary_sensor.hvac_heating_active    # was: climate.dining_room
    state: "on"                                      # was: "heating"
    type: time
    end: "{{ today_at('00:00') }}"
    duration:
      hours: 24

  - platform: history_stats
    name: "HVAC Cooling Yesterday Hours"
    unique_id: "tunet_hvac_cooling_yesterday_hours"
    entity_id: binary_sensor.hvac_cooling_active    # was: climate.dining_room
    state: "on"                                      # was: "cooling"
    type: time
    end: "{{ today_at('00:00') }}"
    duration:
      hours: 24
```

**File C: `packages/tunet_oal_enhancements.yaml`**

B2 fix — line 36-43 area:

```yaml
# whichever history_stats matches "Dim Ambient" — update to:
state: "Evening"
# AND/OR if there's a downstream rename mismatch, audit the file
```

(Detailed edit pending one fresh read of `tunet_oal_enhancements.yaml` to confirm exact line numbers.)

### 1.6 Phase plan

| Phase | Action | Tool | Time |
|-------|--------|------|------|
| 1.0 | Read all three target files for current state + line numbers | Read | 2 min |
| 1.1 | Verify no `hvac_heating_active` / `hvac_cooling_active` name conflict in HA | ha_search_entities | 1 min |
| 1.2 | Snapshot pre-deploy state of all 11 broken sensors | ha_get_states | 1 min |
| 1.3 | Edit `tunet_hvac_sensors.yaml` per §1.5 (new binary_sensors + 3 rewired today counters + B1 fix) | Edit | 5 min |
| 1.4 | Edit `tunet_stats_sensors.yaml` per §1.5 (2 yesterday rewires) | Edit | 2 min |
| 1.5 | Edit `tunet_oal_enhancements.yaml` for B2 | Edit | 2 min |
| 1.6 | `ha_check_config` to validate yaml syntax | mcp tool | <1 min |
| 1.7 | `deploy_packages.sh` (auto-backup + scp + git commit) | Bash | 2 min |
| 1.8 | `ha_restart()` — required for new binary_sensors (template.reload won't reliably expose them) | mcp tool | 30-60s |
| 1.9 | Wait ~30s for HA to fully come back, then verify | ha_get_state | 1 min |
| 1.10 | Verify new binary_sensors exist + reflect hvac_action correctly | ha_get_states | 1 min |
| 1.11 | Trigger or wait for an HVAC cycle (if possible — Mac may need to bump thermostat) | manual | 2-5 min |
| 1.12 | Confirm `_today_minutes` sensors tick up during the cycle | ha_get_state | 1 min |
| 1.13 | Commit git changes (deploy script auto-commits backups; this commits the package edits) | git | 1 min |

**Total: ~25-30 min** focused work + 5-10 min HVAC cycle verification.

### 1.7 Verification matrix

| Check | Expected post-deploy | Tool |
|-------|---------------------|------|
| `binary_sensor.hvac_heating_active` exists | state = "on" or "off" matching hvac_action == 'heating' | ha_get_state |
| `binary_sensor.hvac_cooling_active` exists | state = "on" or "off" matching hvac_action == 'cooling' | ha_get_state |
| `sensor.hvac_heating_today_minutes` | starts at 0, ticks up on next heating cycle | ha_get_state |
| `sensor.hvac_cooling_today_minutes` | starts at 0, ticks up on next cooling cycle | ha_get_state |
| `sensor.hvac_idle_today_minutes` | starts at >0 if any idle time recorded since deploy | ha_get_state |
| `sensor.hvac_heating_yesterday_hours` | 0.0 today (no recorded data yet); accurate tomorrow | ha_get_state |
| `sensor.hvac_cooling_yesterday_hours` | same | ha_get_state |
| `sensor.hvac_heating_minutes_today` template | matches `_today_minutes * 60` | ha_get_state |
| `sensor.hvac_cooling_minutes_today` template | same | ha_get_state |
| `sensor.hvac_heating_minutes_weekly` utility_meter | matches sum of daily heating | ha_get_state |
| `sensor.hvac_cooling_minutes_weekly` utility_meter | same | ha_get_state |
| `binary_sensor.hvac_running` regression | still works as before | ha_get_state |
| `climate.dining_room` regression | unchanged | ha_get_state |
| `sensor.hvac_last_cycle_started` (B1 fix) | holds last cycle start timestamp across idle periods | ha_get_state |

### 1.8 Backfill caveat (must communicate to Mac)

History_stats only sees recorded entity state. The new binary_sensors don't exist in recorder until deploy. So:

- **Same-day**: `_today_minutes` starts at 0 and ticks up only for cycles AFTER deploy.
- **Tomorrow's "yesterday"**: shows partial coverage — only the hours after today's deploy.
- **Day-after-tomorrow's "yesterday"**: first FULL 24-hour clean window.
- **Weekly utility_meter**: undercounts this week until next Monday's reset; clean from-then-on.

This is an irreducible artifact of how recorder + history_stats work together. Cannot be retroactively backfilled.

### 1.9 Rollback plan

If verification fails or HA won't restart cleanly:

1. `deploy_packages.sh` auto-creates `Backups/<package>_remote_pre_<timestamp>.yaml` before push. Each is also auto-committed by the deploy script for the git audit trail.
2. To revert: `git revert <commit>` of the package change OR manually copy the backup file back over the live yaml and rerun deploy.
3. `ha_restart` again after revert.
4. Verify the 11 sensors return to their previous (stuck-at-0) state — confirms the revert was clean.

### 1.10 Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| New binary_sensor name conflict | Low | Pre-flight check via `ha_search_entities` |
| YAML syntax error breaks HA startup | Medium | `ha_check_config` before deploy; deploy script also rejects unparseable yaml |
| HA restart fails | Medium | Standard 30-60s restart; if longer, check logs via `ha_get_logbook` |
| Template trigger for B1 has subtle bug | Low | Test by manually triggering an HVAC cycle and verifying timestamp updates |
| B2 edit hits a different mode name expectation | Low | Read `tunet_oal_enhancements.yaml` carefully first; cross-check against `oal_lighting_control_package.yaml` mode names |
| HA loses 30-60s of availability | Low | Deploy at a time of low household activity |

---

## 2. OAL mode-reset fixes — detailed plan

### 2.1 Scope

Eliminate flicker on rapid chip taps + fix the correctness bug where the configuration_manager can leave `oal_config_transition_active=on` permanently (jamming the entire OAL engine until manual reset or 4h autoreset).

### 2.2 Tranche structure (3 stages, ship sequentially)

#### Tranche A — Core correctness + biggest visual win (F1 + F2 + F3)

- **F1**: Remove the 1-second `delay:` at `packages/oal_lighting_control_package.yaml:2648`
- **F2**: Add unconditional unlock of `input_boolean.oal_config_transition_active` at the TOP of `oal_configuration_manager_v13`'s action sequence (~line 2253). Belt-and-suspenders: also add a 30s watchdog automation that force-clears the lock if stuck.
- **F3**: In the default mode branch (lines 2678-2697), reorder so `light.turn_off` for the `lights_off` list fires BEFORE `light.turn_on` for the `lights_dimmed` map. Currently it's the reverse.

Risk: low. Visible win: high. Correctness bug fixed.

#### Tranche B — Companion automation guards (F4)

- Add `condition: state input_boolean.oal_config_transition_active state: off` to these automations:
  - `oal_v13_office_bed_lights_warm_pin` (bed pair warm augmentation)
  - `oal_office_bed_color_window_v13` (line ~3579, sun-elevation-driven color writes)
  - Column RGB lifecycle automations (find via grep)
  - Optionally: `oal_isolated_override_manager_v13` (line ~3935) — but this one MAY be intentional to track manual_control regardless of config state

Risk: medium (might skip legitimate fires — but companions have multiple triggers so missing one is non-fatal).
Test: cycle through Sleep → Evening → Adaptive while watching bed pair color and column lights — no mid-transition flash.

#### Tranche C — Sleep transition param (F5)

- New helper: `input_number.oal_sleep_transition_seconds`, default 2.0, min 0.3, max 10.0
- Update `packages/oal_lighting_control_package.yaml:1183` from `transition: 5` to `transition: "{{ states('input_number.oal_sleep_transition_seconds') | float(2.0) }}"`

Risk: low. Subjective: 5s might be Mac's preferred Sleep fade. Default 2.0 is a compromise. Mac tunes the helper to his preference.
Restart required (new input_helper).

### 2.3 Detailed edits — Tranche A

**File: `packages/oal_lighting_control_package.yaml`**

#### F1 — remove 1s delay at line 2648

Find:
```yaml
        # ...somewhere in the default: branch around line 2645-2650...
        - delay: "00:00:01"
        # ...
```

Replace with:
```yaml
        # T1.6 F1: 1s delay removed — engine is locked via
        # oal_config_transition_active so no recalc happens during this
        # window anyway. Delay was pure dead-weight that produced a visible
        # flicker window where offsets applied but light targets hadn't.
        # Mac's "flicker on rapid switching" complaint root cause.
```

#### F2 — unconditional unlock at top + watchdog

At the very top of `oal_configuration_manager_v13`'s `action:` sequence (line 2253 area), BEFORE any other action:

```yaml
    action:
      # T1.6 F2: stale-lock recovery. If a prior run of this manager was
      # cancelled mid-stream by mode: restart, oal_config_transition_active
      # may still be ON. Unconditionally clear it here; the new run will
      # re-enable it for its own protection.
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.oal_config_transition_active
        data: {}

      # ... existing sequence continues unchanged ...
```

ADD a watchdog automation (new entry at end of `automation:` block in same file or a new package):

```yaml
  - alias: "OAL Config Lock Watchdog"
    id: oal_config_lock_watchdog_v13
    description: >
      Defensive safety: if oal_config_transition_active stays ON for >30s,
      force-clear it. The configuration_manager_v13 has mode: restart with
      no try/finally semantics; if it gets killed mid-run, the lock can
      stay ON permanently. This watchdog catches that case so the OAL
      engine isn't permanently jammed.
    mode: single
    trigger:
      - platform: state
        entity_id: input_boolean.oal_config_transition_active
        to: "on"
        for: "00:00:30"
    action:
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.oal_config_transition_active
      - service: logbook.log
        data:
          name: "OAL Config Lock"
          message: "Force-released after 30s timeout — configuration_manager_v13 may have been killed mid-run"
          domain: input_boolean
```

#### F3 — reorder light.turn_off before light.turn_on in default branch

Current ORDER in the default branch (`packages/oal_lighting_control_package.yaml:2678-2697` area):
1. `light.turn_on` for each entity in `lights_dimmed` (with brightness_pct from profile)
2. `light.turn_off` for each entity in `lights_off`

NEW ORDER:
1. `light.turn_off` for each entity in `lights_off` (with `transition: {{ transition_speed }}` and `parallel: true` if possible)
2. `light.turn_on` for each entity in `lights_dimmed`

Rationale: when transitioning Adaptive → Evening, the kitchen_main_lights are in Evening's lights_off. Currently those dim/fade alongside everything else turning on; the visual is "everything dims then kitchen mains snap off." Reverse order: "kitchen mains turn off first, then everything else dims to target." Cleaner perceived transition.

Detailed reordering (pseudocode — actual yaml in §2.5):

```yaml
        # T1.6 F3: turn off lights_off BEFORE turning on lights_dimmed.
        # Was reverse order which caused kitchen_main_lights (etc) to
        # dim with everything else, then snap off — visually inconsistent.
        - choose: []
          default:
            - parallel:
              - repeat:
                  for_each: "{{ target_profile.lights_off | default([]) }}"
                  sequence:
                    - service: light.turn_off
                      target:
                        entity_id: "{{ repeat.item }}"
                      data:
                        transition: "{{ 0 if is_force_apply else (states('input_number.oal_transition_speed') | float(0.3)) }}"
              - repeat:
                  for_each: "{{ (target_profile.lights_dimmed | default({})) | dict2items }}"
                  sequence:
                    - service: light.turn_on
                      target:
                        entity_id: "{{ repeat.item.key }}"
                      data:
                        brightness_pct: "{{ repeat.item.value }}"
                        transition: "{{ 0 if is_force_apply else (states('input_number.oal_transition_speed') | float(0.3)) }}"
```

(`parallel:` block ensures both happen simultaneously rather than serially. If parallel isn't safe in this context due to HA worker contention, fall back to: turn_off loop first, then turn_on loop.)

### 2.4 Detailed edits — Tranche B (F4)

For each companion automation, add the condition:

```yaml
    condition:
      # T1.6 F4: defer this automation while a mode transition is in flight
      # to prevent race conditions where this automation writes hs_color /
      # rgb_color to a light while configuration_manager is applying its
      # own targets. Will re-fire on next periodic trigger.
      - condition: state
        entity_id: input_boolean.oal_config_transition_active
        state: "off"
      # ... existing conditions ...
```

Files affected (need to grep first to confirm exact locations):
- `oal_v13_office_bed_lights_warm_pin` — automation alias, find via `grep -n "oal_v13_office_bed_lights_warm_pin\|warm_pin_v13" packages/oal_lighting_control_package.yaml`
- `oal_office_bed_color_window_v13` — line ~3579
- Column RGB lifecycle — find via `grep -n "column.*rgb\|oal_column" packages/oal_lighting_control_package.yaml`

`oal_isolated_override_manager_v13` is OUT OF SCOPE for Tranche B — that one tracks manual_control and may need to fire DURING transitions to detect stuck overrides. Hands off.

### 2.5 Detailed edits — Tranche C (F5)

**File: `packages/oal_lighting_control_package.yaml`**

Add to `input_number:` block (search for existing `input_number:` definitions, likely near top of file):

```yaml
input_number:
  # ... existing ...
  oal_sleep_transition_seconds:
    name: "OAL Sleep Transition Seconds"
    min: 0.3
    max: 10.0
    step: 0.1
    initial: 2.0
    unit_of_measurement: "s"
    icon: mdi:timer-sand
    mode: slider
```

Edit line 1183 (Sleep config in Core Engine):

```yaml
        # T1.6 F5: was hardcoded transition: 5, which fought with the
        # default 0.3s transition_speed when Mac switched OUT of Sleep
        # within 5s of switching in. Now user-tunable via the
        # oal_sleep_transition_seconds input_number.
        transition: "{{ states('input_number.oal_sleep_transition_seconds') | float(2.0) }}"
```

### 2.6 Phase plan — combined OAL Tranches A, B, C

| Tranche | Phase | Action | Tool | Time |
|---------|-------|--------|------|------|
| A | A.0 | Read full `oal_configuration_manager_v13` action sequence (lines 2049-2712) | Read | 5 min |
| A | A.1 | Verify no other automation depends on `oal_config_transition_active` being ON | grep | 2 min |
| A | A.2 | Edit F1 (remove 1s delay) | Edit | 2 min |
| A | A.3 | Edit F2 (unlock at top + watchdog automation) | Edit | 5 min |
| A | A.4 | Edit F3 (reorder turn_off before turn_on in default branch) | Edit | 5 min |
| A | A.5 | `ha_check_config` | mcp tool | <1 min |
| A | A.6 | `deploy_packages.sh` | Bash | 2 min |
| A | A.7 | `automation.reload` (no full restart needed for automation edits) | mcp tool | <1 min |
| A | A.8 | Mac manually tests: tap Adaptive → Sleep → Evening → Dim → Warm sequence rapidly; observe settling | manual | 3-5 min |
| A | A.9 | `ha_get_automation_traces` on `oal_configuration_manager_v13` — verify clean exec | mcp tool | 1 min |
| A | A.10 | Verify `input_boolean.oal_config_transition_active` returns to OFF between modes | ha_get_state | 1 min |
| A | A.11 | If watchdog fires in logbook, that's a sign the manager is still leaking the lock — escalate | ha_get_logbook | 1 min |
| A | A.12 | Commit | git | 1 min |
| B | B.0 | Grep companion automation aliases | grep | 2 min |
| B | B.1 | Read each companion to confirm condition placement | Read | 5 min |
| B | B.2 | Edit each to add the transition_active guard condition | Edit | 5 min |
| B | B.3 | `ha_check_config` | mcp tool | <1 min |
| B | B.4 | `deploy_packages.sh` | Bash | 2 min |
| B | B.5 | `automation.reload` | mcp tool | <1 min |
| B | B.6 | Mac tests: rapid mode change with bed pair / column visible — should see NO mid-transition color flash | manual | 5 min |
| B | B.7 | Commit | git | 1 min |
| C | C.0 | Add `input_number.oal_sleep_transition_seconds` | Edit | 2 min |
| C | C.1 | Update Sleep transition (line 1183) | Edit | 2 min |
| C | C.2 | `ha_check_config` | mcp tool | <1 min |
| C | C.3 | `deploy_packages.sh` | Bash | 2 min |
| C | C.4 | `ha_restart` (new input_number requires restart) | mcp tool | 30-60s |
| C | C.5 | Verify helper exists + has default 2.0 | ha_get_state | 1 min |
| C | C.6 | Mac tests: Sleep → other mode within 3s — should be 2s fade not 5s | manual | 3 min |
| C | C.7 | Commit | git | 1 min |

**Total**: Tranche A ~25 min + verification, Tranche B ~20 min + verification, Tranche C ~10 min + verification. Plus Mac's hands-on testing between tranches.

### 2.7 Verification matrix

#### Tranche A
| Check | Expected | Tool |
|-------|----------|------|
| Tap chip → mode change completes within ~1s | YES (faster, no 1s delay) | observe phone |
| Rapid 10x chip taps → final state matches last tap | YES (correctness) | observe phone |
| `input_boolean.oal_config_transition_active` returns to OFF after each chip change | YES | ha_get_state, ha_get_history |
| `oal_config_lock_watchdog_v13` does NOT fire in normal use | doesn't trigger | ha_get_logbook |
| `oal_config_lock_watchdog_v13` DOES fire if manager is killed mid-run | triggers within 30s of stale lock | ha_get_logbook (induced test) |
| Mode transitions visually: kitchen_main turns OFF before other lights dim (Evening) | YES | observe lights |
| Sleep → other mode: lights settle correctly | YES | observe lights |
| Adaptive → Sleep → Adaptive: all lights return to AL adaptive baseline | YES | observe lights |

#### Tranche B
| Check | Expected | Tool |
|-------|----------|------|
| Rapid mode switch while bed pair is in warm-pin window: no mid-transition color flash | YES | observe bed pair |
| Rapid mode switch while column is in RGB lifecycle: no mid-transition color flash | YES | observe column |
| Companion automations still fire normally between mode changes | YES | ha_get_automation_traces |
| No automation is permanently blocked by the new condition | YES | inspect traces over 30 min |

#### Tranche C
| Check | Expected | Tool |
|-------|----------|------|
| `input_number.oal_sleep_transition_seconds` exists with initial 2.0 | YES | ha_get_state |
| Sleep transition takes ~2s (not 5s) | YES | observe lights w/ stopwatch |
| Tap out of Sleep within 2s: clean handoff to next mode | YES | observe lights |
| Mac can tune the helper to his preferred sleep fade | YES (Mac picks) | ha_set_entity |

### 2.8 Rollback per-tranche

Each tranche is independently revertable:

- **Tranche A revert**: `git revert <commit-A>`, redeploy packages. Visual + correctness regress to pre-T1.6 state (1s delay returns, watchdog removed, light order swapped back).
- **Tranche B revert**: `git revert <commit-B>`, redeploy. Companion automations lose the transition_active guard; race conditions return.
- **Tranche C revert**: `git revert <commit-C>`, redeploy + restart (since input_number was added then needs removing). Sleep transition reverts to 5s.

### 2.9 Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| F1 (remove delay) causes engine to recalc too fast and step on configuration_manager's writes | Low | Engine recalc is GATED by oal_config_transition_active; no race possible while flag is ON. F2's unlock-at-top makes flag-management robust. |
| F2 unconditional unlock leaks ON between intended-locked sections | Low | The full sequence sets the lock back ON immediately after the unlock-at-top. New runs see lock ON for the duration of the run. |
| F2 watchdog fires falsely | Low | 30s threshold is much longer than any normal config_manager run (<2s typical). False fire only on legitimate stale lock. |
| F3 reorder breaks edge case where a light is in BOTH lights_off and lights_dimmed | Negligible | Config_profiles don't overlap; light in lights_off shouldn't also be in lights_dimmed. Verify before edit. |
| F4 guard prevents legitimate companion fire | Low-Medium | Companions have multiple triggers; one skip is non-fatal. Mac tests during transitions to confirm. |
| F5 default 2.0s is too fast for sleep | Subjective | Mac tunes the helper post-deploy. Range 0.3-10.0 covers everything. |
| Watchdog automation conflicts with restart on rapid reload | Low | `mode: single` prevents stacking; trigger requires 30s of state ON which won't happen during reload |
| HA logbook spam from watchdog logging | Negligible | Watchdog only logs when force-releasing — rare event. |

### 2.10 Out-of-scope (deferred to future passes)

- Coalescing per-light service calls into grouped calls (subagent's fix #3 — performance optimization, not correctness)
- Adding telemetry events for each transition (subagent's fix #8 — nice for debugging but not load-bearing)
- `prev_controlled_lights` fallback when handoff flag is off (subagent's G4 — subtle, may have unintended interactions with override_manager)
- Refactoring the configuration_manager to be more atomic (large effort, separate plan)

---

## 3. Cross-cutting concerns

### 3.1 Deploy ordering

**Recommended order**:
1. #1 HVAC stats fix (one deploy, one restart)
2. #2 Tranche A (one deploy, automation.reload only)
3. #2 Tranche B (one deploy, automation.reload only)
4. #2 Tranche C (one deploy, restart for new helper)

Total: 4 deploys, 2 restarts.

**Alternative — batched**: combine #1 + #2 Tranche A into one deploy + one restart. Faster but mixes blast radius. Not recommended for the first pass.

### 3.2 Mac's verification gates

After each tranche, Mac confirms before next tranche starts:
- HVAC: sees the binary_sensors and today_minutes ticking
- OAL Tranche A: taps modes rapidly, sees no flicker/no jam
- OAL Tranche B: visually checks bed pair + column during transitions
- OAL Tranche C: tunes sleep_transition_seconds to taste

### 3.3 Documentation sync

After all tranches land:
- Update `MEMORY.md` with the OAL transition_active lock learning (force-release pattern + 30s watchdog)
- Update `Dashboard/Tunet/Docs/cards_reference.md` if any card consumers reference these sensors
- Update `docs/audits/tunet-home-v2-audit-2026-05-23.md` §11.1: mark P0-F + the climate fix as complete
- The OAL `oal_enhancements.yaml` Dim Ambient → Evening rename is a related cleanup — note in commit message

### 3.4 What NOT to ship in this plan

- Sub-agent's bonus findings G4 (prev_controlled_lights fallback) — needs more testing before shipping
- Sub-agent's bonus G6 if it overlaps with F5 (verify) — F5 handles the Sleep transition timing
- Full configuration_manager refactor to atomic operations — separate larger plan
- Coalescing per-light service calls into grouped — perf optimization, not correctness

---

## 4. Open decisions for Mac before execution

1. **Include B1 (last_cycle_started logic fix) in #1?** Recommended yes.
2. **Include B2 ("Dim Ambient" → "Evening" rename in tunet_oal_enhancements.yaml) in #1?** Recommended yes.
3. **OAL Tranche A: ship the watchdog automation alongside the unlock-at-top, or just the inline fix?** Recommended both (belt-and-suspenders).
4. **OAL Tranche C: default Sleep transition seconds = 2.0?** Or Mac picks a different default (1.5? 3.0?).
5. **Sequential vs. batched (#1 + #2A combined)?** Recommended sequential.

---

## 5. Pre-flight reads needed before execution

Before starting any edits, read these to confirm exact line numbers + current content:

- `packages/tunet_hvac_sensors.yaml` (full read)
- `packages/tunet_stats_sensors.yaml` (lines 90-160 area)
- `packages/tunet_oal_enhancements.yaml` (full or focused on lines 30-50)
- `packages/oal_lighting_control_package.yaml` (lines 2049-2712 for configuration_manager; lines 1170-1200 for Sleep handler; lines 3570-3720 for bed color window; find warm_pin alias via grep)

These reads happen during Phase 1 of each tranche; not done now (Mac may revise the plan).

---

**End of plan. Awaiting Mac's stamp on:**
- B1 + B2 inclusion in #1
- Sequencing (sequential recommended)
- OAL watchdog included in F2
- Sleep transition default value
- Any other adjustments
