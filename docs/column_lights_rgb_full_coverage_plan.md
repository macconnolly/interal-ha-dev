# Column Lights RGB Mode Full-Coverage Remediation Plan

## Scope

This plan covers:
- All user-listed issues (`BUG-01..04`, `GAP-01..02`)
- All additional issues identified in the end-to-end trace
- Implementation order, concrete code touchpoints, and validation matrix
- Direct remediation of all major cross-automation bypasses in this same workstream (no deferral)

Architectural constraints for this plan:
1. Reliability first: no hidden path may override protected column RGB state.
2. Flexibility preserved: users can still force global behavior via explicit override intent.
3. User empowerment: defaults are safe; overrides are deliberate and traceable.

Target file: `packages/oal_lighting_control_package.yaml`

---

## 1) Full Issue Register

| ID | Severity | Component | Issue Description | Primary Reference(s) |
|---|---|---|---|---|
| BUG-01 | Critical | Core Engine | `force: true` bypasses `manual_control` filtering and can overwrite protected Column RGB state. | `:680`, `:1278` |
| BUG-02 | High | Movie Mode | Exiting Movie Mode clears manual control for all zones, including columns during protected window. | `:2524` |
| BUG-03 | High | Config Manager | Switching to `Adaptive` baseline clears all manual controls and can break Column RGB protection. | `:1501`, `:1536` |
| BUG-05 | High | Config Manager | `Full Bright` path clears all manual control and applies all lights, bypassing column protection. | `:1554`, `:1564` |
| BUG-06 | Medium | Config Manager | Transition cleanup path can clear/apply previously-controlled column lights. | `:1621`, `:1638` |
| BUG-07 | Medium | Manual Adjustment Pipeline | Manual brightness pipeline emits force watchdog; deferred relock can leave temporary color-temp takeover on columns. | `:3277`, `:3323` |
| BUG-04 | Medium | Reset Script | Soft reset default hardcodes sleep color to `[255, 165, 0]` instead of canonical `[245, 120, 0]`. | `:3802`, `:558` |
| GAP-01 | Medium | Reset Scripts | Race between `set_manual_control` and engine/apply sequencing causes transient incorrect state/flicker risk. | `:4039`, `:4070`, `:4083` |
| GAP-02 | Low | Lifecycle | No self-heal mechanism if column RGB manual state is accidentally cleared during active window. | `:1838` |
| GAP-03 | Low | UX Contract | Releasing from evening RGB brightness to sleep brightness can create abrupt visual step (20% -> 1%). | `:1904`, `:555` |
| ISSUE-07 | High | Startup | Sleep safety can be undone at startup due to ordering (`sleep_trigger` vs startup switch-off). | `:2012`, `:2578` |
| ISSUE-20 | High | Startup Recovery | After HA restart, `manual_control` is cleared and `prepare_rgb` will not re-run unless an elevation crossing occurs. | `:1838`, `:2570` |
| ISSUE-08 | Medium | Timeout Sync | Reverse timeout sync excludes `switch.adaptive_lighting_column_lights`. | `:2691` |
| ISSUE-09 | Medium | Soft Reset | `columns_manual` derived via `sensor.oal_system_status` instead of direct AL switch attributes. | `:3724`, `:3737`, `:4321` |
| ISSUE-10 | High | State Semantics | `manual_control` provenance ambiguity: manual state may come from non-RGB flows. | `:3323`, `:3330`, `:4003` |
| ISSUE-11 | Low | Prepare RGB | Prepare guard checks only one column light in manual list. | `:1858` |
| ISSUE-12 | Medium | Room Reset | Force watchdog executes before column-specific protect/release logic; overwrite risk. | `:4039`, `:4070` |
| ISSUE-13 | Low | Config Drift | Soft reset default mutates column AL settings unnecessarily, increasing drift risk. | `:3790` |
| ISSUE-14 | Low | Docs/Comments | Some comments still imply legacy sleep color/window behavior. | `:4128` |
| ISSUE-15 | High | Event Contract | `force` has no intent tier; background/system force and explicit user override are conflated. | `:620`, `:680` |
| ISSUE-16 | Medium | State Validity | New guard logic must define safe behavior when `sun`/switch attributes are `unknown` or `unavailable`. | `:1771`, `:3687`, `:4000` |
| ISSUE-17 | Medium | Healing Stability | Self-heal can oscillate if it races with release logic without cooldown/guarded triggers. | `:1910` |
| ISSUE-18 | Medium | Migration Risk | `force_intent` contract can fail if any force emitter is left unmigrated. | `:1536`, `:1671`, `:2597`, `:3277`, `:3868`, `:4039` |
| ISSUE-19 | Low | Operability | No runtime observability/kill switch for guard behavior during rollout. | `:1835`, `:2008`, `:3679`, `:3904` |
| ISSUE-21 | Medium | Execution Model | Critical automations/scripts rely on implicit/default `mode`, risking dropped or reordered actions during trigger bursts. | `:1838`, `:2524`, `:2570`, `:3277`, `:3679`, `:3904` |
| ISSUE-22 | Medium | Predicate Freshness | Relying only on template sensor state for safety gating can create stale-decision windows during rapid state transitions. | `:1272`, `:1501`, `:1550`, `:1610`, `:2524`, `:3679`, `:3904` |

---

## 2) Target Behavioral Contract

### 2.1 Canonical protection semantics

Columns are protected only when all are true:
1. Column RGB session is active (`oal_column_rgb_session_active == on`)
2. Column lights are currently manual (`manual_control` non-empty)
3. Sun is in RGB protect window:
   - Evening descent only: `-5 <= elevation < 3` and `rising == false`
4. Column sleep switch is off

### 2.2 Canonical release semantics

Columns must be released to AL when any is true:
1. Session inactive
2. Outside protect window
3. Sleep switch on
4. Explicit reset branch requests release

### 2.3 Canonical color ownership

- Sleep color source of truth is AL config: `[245, 120, 0]` (`sleep_rgb_color`)
- Reset scripts must not hardcode conflicting sleep color values

### 2.4 Force-intent contract

All `oal_watchdog_trigger` events must declare intent:
1. `force_intent: "column_safe"` (default)  
   Meaning: do not override protected column RGB state.
2. `force_intent: "override_all"`  
   Meaning: explicit user action allowing full force behavior, including columns.

Core engine must enforce this contract at apply time for columns.

### 2.5 Full Bright behavior contract

When `Full Bright` is selected during active RGB protection:
1. Columns remain in RGB protected mode by default.
2. Non-column zones follow Full Bright behavior normally.
3. If a user explicitly wants columns in Full Bright during twilight, they must first clear column `manual_control` (or use explicit `force_intent: "override_all"`).

### 2.6 Fail-safe contract

If required state is unavailable (`sun`, manual attributes, sleep switch), behavior must fail safe:
1. Never force-protect by assumption.
2. Prefer AL ownership unless explicit session + valid protect conditions are present.
3. Emit trace/debug event with reason code for diagnosability.

### 2.7 Execution model contract

Critical lifecycle and reset flows must declare explicit HA execution modes.
1. No implicit default `mode` on critical automations/scripts.
2. Concurrency behavior must be deliberate (`single`/`restart`/`queued`/`parallel`) and documented.
3. Burst triggers must not drop protection or release transitions silently.

### 2.8 Predicate freshness contract

Critical safety decisions must be evaluated at point of use.
1. Shared sensors are allowed for observability/diagnostics.
2. Engine/config/reset/movie protection gates must compute a local `column_rgb_protect_now` variable at runtime.
3. If local runtime state and helper sensor diverge, runtime state wins.

---

## 3) Implementation Plan (Full Coverage)

## Phase 0 - Change Controls (No-Deferral Guardrails)

### 0.1 Anchor verification and safety checks
- Before edits, verify critical anchors for all touched blocks (engine apply, Config Manager baseline/full-bright/cleanup, Movie exit, startup, resets, timeout sync).
- Keep a brief pre/post diff checklist per block to prevent accidental semantic drift.

### 0.2 No-deferral implementation rule
- All major cross-automation bypasses (`BUG-01`, `BUG-02`, `BUG-03`, `BUG-05`, `BUG-06`, `BUG-07`, `ISSUE-15`) are fixed in this workstream.
- None are deferred to “future plan” status.

### 0.3 Force-intent migration inventory (`ISSUE-18`)
- Migrate every `force: true` emitter to include `force_intent` explicitly:
  - Config Manager baseline trigger path (`:1536`)
  - Config Manager sleep shortcut (`:1671`)
  - Startup initialization (`:2597`)
  - Global adjustment start (`:3277`)
  - Soft reset (`:3868`)
  - Room reset (`:4039`)
- Reject mixed behavior: no emitter may rely on implicit/default intent during migration.

## Phase A - Shared state model and invariants

### A1. Add RGB session flag helper
- Add `input_boolean.oal_column_rgb_session_active`.
- Purpose: disambiguate RGB lifecycle from generic manual-control states (`ISSUE-10`).

### A2. Add shared template sensors
- Add:
  - `binary_sensor.oal_column_rgb_window_active` (sun-window only)
  - `binary_sensor.oal_column_rgb_protect_active` (session + manual + window + sleep-off)
- Purpose: provide observability and an operator-visible source of truth for debugging/traceability.

### A3. Define canonical runtime guard snippet (`ISSUE-22`)
- Standardize one inline guard variable pattern for safety-critical blocks:
  - `column_rgb_protect_now` = session-on + manual non-empty + evening window + sleep-off
- Apply this snippet in:
  - `oal_core_adjustment_engine_v13`
  - `oal_configuration_manager_v13` (baseline/full-bright/cleanup)
  - `oal_movie_mode_handler_v13` exit path
  - `oal_reset_soft`
  - `oal_reset_room`
- Keep bounds/comments synchronized with lifecycle triggers and verify at review time.

## Phase B - Lifecycle producers/consumers

### B1. Update prepare automation
Automation: `oal_column_lights_prepare_rgb_mode_v13`
- Set `input_boolean.oal_column_rgb_session_active = on` after successful prepare.
- Replace single-light manual guard with zone-safe guard (`ISSUE-11`).
- Add `homeassistant.start` trigger path with conditional prepare recovery (`ISSUE-20`):
  - `rising == false`
  - `-5 <= elevation < 3`
  - sleep switch is off
  - at least one column light is on
  - column manual list is empty

### B1b. Lower evening hold brightness to reduce deep-night jump (`GAP-03`)
Automation: `oal_column_lights_prepare_rgb_mode_v13`
- Change final evening hold brightness (Step 4) from `20%` to `5%`.
- Goal: reduce/remove the visual `20% -> 1%` jump when sleep ownership begins.

### B2. Update morning exit automation
Automation: `oal_column_lights_morning_exit_rgb_v13`
- Set `input_boolean.oal_column_rgb_session_active = off` when releasing manual control.

### B3. Add self-heal automation (`GAP-02`)
New automation: `oal_column_lights_rgb_self_heal_v13`
- Trigger:
  - Column manual list changed to empty
  - HA start
  - periodic `/1` minute fallback
- Conditions:
  - `oal_column_rgb_session_active == on`
  - `oal_column_rgb_window_active == on`
  - sleep switch off
  - at least one column light on
  - column manual list currently empty
- Actions:
  - Reapply RGB `[255, input_number.oal_offset_column_rgb_green, 0]`
  - Re-set manual control true for both column lights
  - Optional debug event emit

### B4. Add self-heal anti-thrash controls (`ISSUE-17`)
- Add a short cooldown (`for:` debounce or timestamp guard) so heal does not fight active release transitions.
- Block heal when:
  - `oal_column_rgb_session_active == off`
  - sleep switch is on
  - morning exit is in progress
- Gate healing to evening window only (`-5 <= elevation < 3`, descending). Remove defensive morning-window healing logic.
- Emit reason-coded debug event when heal is skipped.

## Phase C - Engine and config safety

### C1. Fix core engine force path (`BUG-01`)
Automation: `oal_core_adjustment_engine_v13`
- In column apply branch, compute `column_rgb_protect_now` inline and when true:
  - Always filter out column manual lights even if force event is true.
- Keep existing force behavior for non-column zones.

### C1b. Add source-aware force intent handling (`ISSUE-15`)
Automation: `oal_core_adjustment_engine_v13`
- Read `trigger.event.data.force_intent | default('column_safe')` for event triggers.
- Column zone rule:
  - `column_safe`: never apply forced writes to protected columns.
  - `override_all`: allow explicit override behavior.
- Non-column zones keep current force behavior.
- Add fallback: unknown/invalid `force_intent` is treated as `column_safe`.

### C2. Fix Config Manager manual clear/apply bypasses (`BUG-03`, `BUG-05`, `BUG-06`)
Automation: `oal_configuration_manager_v13`
- Adaptive baseline path:
  - Compute `column_rgb_protect_now` inline and skip column clear while true.
- Full Bright path:
  - Compute `column_rgb_protect_now` inline and skip column clear/apply while true.
- Transition cleanup path:
  - Exclude protected column lights from `lights_for_switch` release/apply lists (light-level filtering, not switch-level skip).
- Keep force watchdog steps with `force_intent: "column_safe"` unless explicit override action was requested.

### C3. Prevent auto-config thrash on protected columns
Automations:
- `oal_auto_switch_to_manual_config`
- `oal_auto_switch_to_adaptive_config`
- Exclude protected-column manual state from aggregate manual count.

### C4. Unknown-state safety guards (`ISSUE-16`)
- In all protection predicates, normalize unknown values safely:
  - `elevation` defaults to out-of-window
  - `rising` defaults to conservative non-protect branch
  - manual list defaults to empty
- Ensure unknown state cannot activate protection path unintentionally.

## Phase D - Reset script hardening

### D1. Replace sensor-derived manual state (`ISSUE-09`)
Script: `oal_reset_soft`
- Stop deriving column manual from `sensor.oal_system_status.overridden_zones`.
- Read direct manual list from `switch.adaptive_lighting_column_lights`.

### D2. Unify protect predicate in both reset scripts
Scripts:
- `oal_reset_soft`
- `oal_reset_room`
- Use the same canonical predicate logic.
- Evaluate it inline as `column_rgb_protect_now` at script runtime; expose helper sensor only for diagnostics.
- Remove unreachable defensive morning branch from reset-protect predicates (autoreset clears manual state long before morning).

### D3. Remove hardcoded stale sleep config (`BUG-04`, `ISSUE-13`)
Script: `oal_reset_soft` default branch
- Remove manual sleep color overrides in `adaptive_lighting.change_switch_settings`.
- Do not set `sleep_rgb_color` in script.
- Preserve AL defaults as canonical source.

### D4. Fix reset sequencing race (`GAP-01`, `ISSUE-12`)
Scripts:
- `oal_reset_room`
- `oal_reset_soft`
- Changes:
  - Apply column protect/release logic before any force apply that can touch columns.
  - Add `wait_template` checkpoints after `manual_control` toggles:
    - Wait until manual list non-empty after lock
    - Wait until manual list empty after release
  - Keep `continue_on_timeout: true` to avoid deadlocks.

### D5. Session flag behavior on reset branches
- When a reset intentionally releases columns to AL/sleep, also set `oal_column_rgb_session_active = off`.
- When reset protects active session, leave session flag on.

### D6. Normalize reset watchdog intents
Scripts:
- `oal_reset_soft`
- `oal_reset_room`
- Emit `oal_watchdog_trigger` with `force_intent: "column_safe"` by default.
- If a future explicit “override columns now” reset mode is introduced, it must send `force_intent: "override_all"` intentionally.

### D7. Explicit release ramp decision (`GAP-03`)
- Decision (closed, not deferred): keep direct release to AL sleep target (no intermediate ramp) for deterministic state convergence.
- Brightness jump mitigation is handled by lowering prepare hold brightness from `20%` to `5%` (Phase B1b).
- Rationale: reliability and repeatability are prioritized over cosmetic smoothing in reset/recovery paths.
- Document this behavior in user-facing notes and test expectations.

## Phase E - Movie mode and startup correctness

### E1. Fix Movie mode manual clear scope (`BUG-02`)
Automation: `oal_movie_mode_handler_v13` end path
- Replace clear-all-zones call with explicit movie-touched switch list only.
- Never clear column manual here.

### E1b. Fix manual adjustment force path (`BUG-07`)
Script: `oal_global_adjustment_start`
- Emit `force_intent: "column_safe"` on watchdog event by default.
- Keep deferred manual-control restore, but ensure it does not reclassify column RGB ownership when session is off.

### E2. Fix startup sleep-state ordering (`ISSUE-07`)
Automation: `oal_system_startup_v13`
- After startup reset sequence, explicitly trigger column sleep safety automation once.
- Goal: converge sleep switch to elevation-correct state after all startup toggles.

### E3. Startup session reconciliation
- On startup, reconcile `oal_column_rgb_session_active` against current window/manual/sleep state.
- If session is impossible under current state, clear it.
- If restart occurs in valid protected window with lights on and session previously active, allow recovery path to restore manual+RGB.
- Sequence startup reconciliation and prepare-on-start so only one recovery action executes.

## Phase F - Timeout and metadata consistency

### F1. Include columns in reverse timeout sync (`ISSUE-08`)
Automation: `oal_autoreset_from_switch_v13`
- Add `switch.adaptive_lighting_column_lights` to triggers.

### F2. Comment/doc cleanup (`ISSUE-14`)
- Update comments mentioning old color or old window semantics.
- Ensure notes around reset scripts reference canonical policy.
- Add `SYNC` comments at each guard site tying protect bounds to prepare/sleep/morning triggers.

### F3. Runtime observability and rollback controls (`ISSUE-19`)
- Add optional debug events for key decisions:
  - protect engage
  - protect skipped
  - release forced
  - heal executed
  - prepare-on-start executed/skipped with reason code
- Add a guard kill switch (input_boolean) to disable advanced protection logic quickly during rollout if needed.
- Add a short rollback runbook section (which automations/flags to disable first).

### F4. Explicit automation/script mode hardening (`ISSUE-21`)
- Define explicit `mode` + `max` for critical flows:
  - `oal_column_lights_prepare_rgb_mode_v13`
  - `oal_column_lights_rgb_self_heal_v13`
  - `oal_reset_soft`
  - `oal_reset_room`
  - `oal_configuration_manager_v13`
  - `oal_movie_mode_handler_v13`
  - `oal_system_startup_v13`
  - `oal_global_adjustment_start`
- Recommended defaults:
  - lifecycle/startup: `mode: restart` (latest state wins)
  - reset/config: `mode: queued`, bounded `max` (preserve ordering)
  - self-heal: `mode: single` with cooldown guard
- Document rationale per automation so future edits do not regress execution guarantees.

---

## 4) Validation Matrix

## 4.1 Core lifecycle tests

1. Evening pre-sunset (elev `+2`, descending): prepare runs, session on, manual on, RGB set.
2. Twilight fade (`0` to `-5`): RGB transition updates green smoothly.
3. Deep night (`<-5`): sleep switch on; no re-protect unless explicitly in active session policy.
4. Morning pre-fade (`+2`, rising): no unintended re-protect.
5. Morning exit (`>8`): session off, manual off, AL ownership restored.

## 4.2 Reset behavior tests

1. `oal_reset_soft` during protected window keeps columns protected.
2. `oal_reset_soft` outside protected window releases to AL and canonical sleep.
3. `oal_reset_room` targeting only columns during protected window avoids color_temp overwrite.
4. `oal_reset_room` targeting mixed zones does not flicker columns.
5. Rapid repeated reset calls do not create inconsistent manual state.

## 4.3 Force/config/movie tests

1. Force watchdog during protected window does not break columns.
2. Switch to `Adaptive` during protected window does not clear columns.
3. End Movie Mode during protected window does not clear columns.
4. Auto config switches do not thrash due to protected column manual.
5. Full Bright selected during protected window does not clear/apply columns.
6. Transition cleanup does not release protected column lights.
7. Manual brightness adjustment during protected window does not cause column color-temp takeover.
8. `force_intent: "override_all"` path intentionally overrides columns and is trace-visible.
9. All force emitters include explicit `force_intent` and produce expected behavior.
10. Full Bright during protected window keeps columns in RGB; clearing column manual first then applying Full Bright affects columns as expected.
11. Transition from `TV Mode` to `Dim Ambient` during protected window does not clear/apply column entities in cleanup; columns keep RGB color mode (brightness-only changes are acceptable per config intent).

## 4.4 Startup and recovery tests

1. HA restart at midnight converges to correct sleep switch state.
2. HA restart during evening window (`-5 <= elevation < 3`, descending) conditionally re-runs prepare and re-establishes expected RGB/manual state.
3. Accidental manual clear in active window self-heals within 60 seconds.
4. Timeout sync remains consistent when column timeout changes.
5. Unknown/unavailable sun or switch attributes fail safe (no unintended protect).
6. Self-heal cooldown prevents oscillation with release paths.

## 4.5 Concurrency and soak tests

1. Rapid alternating `oal_reset_room` and `oal_reset_soft` calls (20+ cycles) produce deterministic final state.
2. Repeated config toggles (`Adaptive <-> Full Bright <-> Manual`) during protected window do not drop protected columns.
3. Parallel manual adjustments plus startup/watchdog events preserve `column_safe` behavior.
4. No automation loop warnings or trace storms from self-heal.
5. Burst trigger tests validate declared `mode` behavior (no silent drop/reorder of critical protect/release actions).
6. Rapid state-change scenarios confirm inline `column_rgb_protect_now` decisions remain correct even if helper sensor update lags.

---

## 5) Rollout Strategy

### Commit 1 (Major bypass closure, no deferrals)
- C1, C1b, C2, E1, E1b, D3, D6
- Goal: close all cross-automation overwrite/clear bypasses in one coherent policy set.

### Commit 2 (State model + reset determinism)
- A1, A2, A3, B1, B1b, B2, D1, D2, D4, D5, C3, E2, F1
- Goal: unify logic and eliminate race/provenance ambiguity.

### Commit 3 (Resilience + cleanup)
- B3, B4, C4, D7, E3, F2, F3, F4
- Goal: self-healing stability, unknown-state safety, operability, and explicit behavior contract.

---

## 6) Done Criteria

All conditions below must be true:
1. No force/config/movie/reset path can clear or overwrite protected column RGB.
2. No script hardcodes a sleep color conflicting with AL canonical config.
3. Reset scripts share one predicate and use direct switch state, not derived sensor state.
4. Startup and self-heal converge columns to expected state without manual intervention.
5. Test matrix passes across one full sunset-to-next-morning live cycle.
6. Every force emitter is migrated to explicit `force_intent` and validated.
7. Unknown/unavailable-state behavior is fail-safe and observable.
8. Full Bright behavior during protected RGB is deterministic and documented (preserve by default, explicit override only).
9. All critical automations/scripts declare explicit `mode` semantics and pass burst/concurrency tests.
10. Critical safety gates are evaluated inline at execution time; helper sensors are observability-only and never the sole protection mechanism.
