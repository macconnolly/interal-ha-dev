# OAL v14 Migration Runbook
## TV Mode Unification + Mode Timeout + TV Bridge + Unified Notifications

## 1. Purpose
This runbook executes the OAL v14 architecture migration in safe, testable phases:
- Single control plane via `input_select.oal_active_configuration`
- TV trigger adapter (no direct light mutations)
- TV Bridge transitional mode
- Global mode-timeout manager
- Unified timer notification arbiter
- Legacy movie-path cleanup

Primary file:
- `packages/oal_lighting_control_package.yaml`

Companion design plan (read fully before execution):
- `smooth-jingling-feather.md`

Source-of-truth usage:
- Use `RUNBOOK.md` for implementation sequencing and validation gates.
- Use `smooth-jingling-feather.md` for architecture intent and edge-case rationale.

## 2. Preconditions
1. Home Assistant is reachable.
2. You can run config checks (`ha_check_config`).
3. You have backup/rollback capability.
4. Branch created for migration.

## 3. Branch and Baseline
```bash
cd /home/mac/HA/implementation_10
git checkout -b oal-v14-unification
```

Baseline reference scan:
```bash
rg -n "oal_movie_mode_active|oal_movie_mode_handler_v13|oal_v13_override_expiring_notification|oal_active_configuration|oal_auto_switch_to_manual_config|oal_auto_switch_to_adaptive" packages/oal_lighting_control_package.yaml
```

## 4. Phase 1 — Entity Infrastructure

### 4.1 Add mode option
In `input_select.oal_active_configuration` add:
- `TV Bridge` (after `TV Mode`)

### 4.2 Add new helpers
Add:
- `input_select.oal_tv_autofollow_gate` (`Off`, `Night + Presence`, `Always Follow`)
- `input_select.oal_mode_timeout_state` (`idle`, `armed`, `suspended_by_tv`, `expired`)
- `input_number.oal_control_mode_timeout_hours`
- `input_number.oal_tv_bridge_minutes`
- `input_boolean.oal_policy_snapshot_restore_enabled`
- `input_boolean.oal_policy_tv_snapshot_restore_enabled`
- `input_boolean.oal_policy_tv_autofollow_enabled`
- `input_boolean.oal_policy_tv_bridge_enabled`
- `input_boolean.oal_mode_timeout_enabled`
- `input_boolean.oal_tv_follow_session_active`
- `input_boolean.oal_tv_bridge_active`

### 4.3 Add timers
Top-level `timer:`:
- `timer.oal_mode_timeout` (`restore: true`)
- `timer.oal_tv_bridge_timer` (`restore: true`)

### 4.4 Add presence group
Top-level `group:`:
- `group.oal_tv_presence_sensors` with:
  - `binary_sensor.couch_presence`
  - `binary_sensor.living_room_presence`

### 4.5 Add TV Bridge config profile
In `oal_configuration_manager_v13` > `config_profiles`, add `TV Bridge`.

### 4.6 Validate Phase 1
Anchor check:
```bash
rg -n "TV Bridge|oal_tv_autofollow_gate|oal_mode_timeout_state|oal_control_mode_timeout_hours|oal_tv_bridge_minutes|oal_policy_tv_autofollow_enabled|oal_tv_follow_session_active|oal_tv_bridge_active|oal_mode_timeout:|oal_tv_bridge_timer:|oal_tv_presence_sensors" packages/oal_lighting_control_package.yaml
```

HA config check:
- Run `ha_check_config`
- Pass condition: `is_valid: true`

Restart HA after Phase 1.

## 5. Phase 2 — Replace Movie Handler with TV Trigger Adapter

### 5.1 Remove old handler
Delete automation:
- `id: oal_movie_mode_handler_v13`

### 5.2 Add new automation
Add:
- `id: oal_tv_mode_controller_v14`

Requirements:
- No direct `light.turn_on/off`
- No direct `adaptive_lighting.set_manual_control` for scene enforcement
- Only mode/session/timer orchestration
- Startup reconcile path included
- Single stop trigger path with computed branch preferred

### 5.3 Add config-manager bridge cancellation
When leaving `TV Bridge`:
- cancel `timer.oal_tv_bridge_timer`
- clear `input_boolean.oal_tv_bridge_active`

### 5.4 Add derived TV/movie sensors
Template binary sensor(s):
- `binary_sensor.oal_tv_mode_active`
- `binary_sensor.oal_movie_mode_active` (derived)

### 5.5 Update consumers now
- Remove auto-switch conditions depending on `input_boolean.oal_movie_mode_active`
- Update status sensor branches to mode-based TV state
- Update reset script to clear new session flags/timers

### 5.6 Validate Phase 2
No old handler:
```bash
rg -n "id: oal_movie_mode_handler_v13" packages/oal_lighting_control_package.yaml
```

New handler present:
```bash
rg -n "id: oal_tv_mode_controller_v14" packages/oal_lighting_control_package.yaml
```

No direct light/manual mutation inside adapter:
```bash
awk '/id: oal_tv_mode_controller_v14/,/^  - id: /{print}' packages/oal_lighting_control_package.yaml | rg -n "light\\.turn_|adaptive_lighting\\.set_manual_control|adaptive_lighting\\.apply"
```

HA config check:
- `ha_check_config` must pass

Runtime:
1. Apple TV play + gate pass -> `TV Mode`
2. Apple TV stop + bridge pass -> `TV Bridge` + bridge timer active
3. Apple TV stop + no bridge path -> return `Adaptive` after long path
4. No mode flapping on short pause/resume

## 6. Phase 3 — Snapshot Policy Split

### 6.1 Keep existing capture model
Adaptive -> non-baseline snapshot logic remains.

### 6.2 Add policy-based restore wrapper
On baseline return (`Adaptive`), restore scene only when:
- from TV mode and TV policy enabled, or
- from non-TV mode and global policy enabled

### 6.3 Keep one force-recalc trigger
Ensure exactly one `oal_watchdog_trigger` in that return path.

### 6.4 Validate Phase 3
```bash
rg -n "oal_policy_snapshot_restore_enabled|oal_policy_tv_snapshot_restore_enabled|scene\\.oal_before_config_mode|config_manager_adaptive_restore" packages/oal_lighting_control_package.yaml
```

HA config check: pass

Runtime:
- TV restore on/off behaves as configured
- Non-TV restore obeys global policy

## 7. Phase 4 — Mode Timeout Manager

### 7.1 Add automation
- `id: oal_v14_mode_timeout_manager`

### 7.2 Required logic
- No global automation condition that blocks cleanup
- If timeout disabled -> cancel timer + state idle
- Timed mode entered -> arm timer
- TV/Bridge entered -> pause timer (`suspended_by_tv`)
- Manual/Adaptive/Sleep entered -> cancel timer
- Timer finished in timed mode -> switch `Adaptive`
- Startup reconciliation included

### 7.3 Validate Phase 4
```bash
rg -n "id: oal_v14_mode_timeout_manager|timer\\.oal_mode_timeout|oal_mode_timeout_enabled|suspended_by_tv" packages/oal_lighting_control_package.yaml
```

HA config check: pass

Runtime:
1. `Full Bright` arms timer
2. Enter TV/Bridge pauses timer
3. Exit TV/Bridge to timed mode resumes timer
4. Enter Manual cancels timer
5. Disable timeout while active cancels immediately

## 8. Phase 5 — TV Bridge Manager

### 8.1 Add automation
- `id: oal_v14_tv_bridge_manager`
- Trigger: `timer.finished` for bridge timer

### 8.2 Required actions
- Notify bridge ending
- Action handlers:
  - extend bridge
  - return adaptive
  - keep bridge
- Deterministic default timeout behavior

### 8.3 Validate Phase 5
```bash
rg -n "id: oal_v14_tv_bridge_manager|OAL_EXTEND_BRIDGE|OAL_KEEP_BRIDGE|OAL_RETURN_ADAPTIVE|timer\\.oal_tv_bridge_timer" packages/oal_lighting_control_package.yaml
```

HA config check: pass

Runtime:
- Extend restarts bridge timer
- Return Adaptive exits bridge
- Keep behavior matches spec

## 9. Phase 6 — Unified Notification Arbiter

### 9.1 Disable legacy notifier
Disable/remove:
- `id: oal_v13_override_expiring_notification`

### 9.2 Add unified arbiter
- `id: oal_v14_unified_timer_notification`
- One tag: `oal_timer_expiring`
- Handles mode-only, zone-only, and merged contexts
- 90s cooldown (concrete implementation required)

### 9.3 Add action handler
- `id: oal_v14_timer_notification_handler`
- `Extend Mode`, `Extend Zone`, `Extend Both`, `Return Adaptive`, `Let Expire`

### 9.4 Validate Phase 6
```bash
rg -n "id: oal_v13_override_expiring_notification|id: oal_v14_unified_timer_notification|id: oal_v14_timer_notification_handler|tag: \"oal_timer_expiring\"|last_triggered|oal_last_timeout_notification" packages/oal_lighting_control_package.yaml
```

HA config check: pass

Runtime:
- One notification for overlap
- No duplicate stacks
- Actions execute correctly

## 10. Phase 7 — Cleanup (after 2–3 stable cycles)

1. Remove remaining compatibility-only movie paths.
2. Keep derived sensor only.
3. Final scan:
```bash
rg -n "oal_movie_mode_active" packages/oal_lighting_control_package.yaml
```
Pass condition:
- no control-branch usage of old boolean remains

4. HA config check: pass

## 11. Global Runtime Validation Sweep
After all phases:
1. TV flow:
- start (gated)
- bridge path
- adaptive return
2. Timed modes:
- arm
- pause in TV
- cancel in Manual
- expire to Adaptive
3. Notification:
- merged path
- cooldown
4. Reset behavior:
- `oal_reset_soft` clears bridge/session/timers and returns Adaptive

## 12. Failure / Rollback

### 12.1 Immediate rollback command set
```bash
git status
git restore --source=HEAD~1 -- packages/oal_lighting_control_package.yaml
```
(Use only if last commit is the migration commit.)

### 12.2 Operational rollback (without git)
1. Disable new v14 automations.
2. Re-enable old movie handler if retained.
3. Set mode `Adaptive`.
4. Cancel `timer.oal_mode_timeout` and `timer.oal_tv_bridge_timer`.
5. Clear `oal_tv_follow_session_active` and `oal_tv_bridge_active`.

## 13. Commit Checklist
Before commit:
1. `ha_check_config` pass
2. grep scans pass
3. runtime checks pass
4. no TODO placeholders left in YAML logic
5. no duplicate watchdog force triggers in baseline restore path

Suggested commit message:
`feat(oal): unify tv mode control plane, add tv bridge + mode timeout + unified timer notifications`
