# TI0 — Governance Scaffold + Core Backend Skeleton

## TRANCHE_ID

- `TI0`

## TITLE

- `Governance scaffold, governed backend skeleton, and first-class deploy/check/smoke path`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `DEFAULT EXECUTION`
- Rationale:
  - the tranche boundary is now being frozen in this document
  - once this document is accepted, implementation should continue in normal execution mode
  - we should re-enter planning only if this tranche needs to widen into:
    - Tunet frontend files
    - OAL/Sonos package migrations
    - public contract changes beyond the currently documented service/event/item model

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - current tranche: `TI0 — Governance Scaffold + Core Backend Skeleton`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `Session Delta (2026-04-06, TI0 — Governance Scaffold)`
  - `Session Delta (2026-04-06, TI0 — Tranche Hardening)`

## GOAL

- Land a governed, static-checkable `tunet_inbox` backend skeleton with local authority docs, explicit contracts, repo-native deploy/check/smoke scripts, and YAML bootstrap wiring, without yet touching Tunet card runtime or OAL/Sonos package behavior.

## WHY_NOW

- This tranche removes the main execution risk: coding a backend without fixed boundaries, validation, or rollout rules.
- It establishes the integration control plane before any package migration can create live regressions.
- It creates the exact service/event/storage seams the card and packages will later depend on.
- It forces deploy and smoke verification to exist before the first live backend push.

## USER_VISIBLE_OUTCOME

- There is no end-user UI outcome yet.
- The operator outcome is:
  - `tunet_inbox` exists as a governed custom integration in the repo
  - the repo exposes explicit `tinbox:*` commands for validation and smoke checks
  - the active tranche has a fixed contract for future implementation and review

## FILES_ALLOWED

- `custom_components/tunet_inbox/AGENTS.md`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `custom_components/tunet_inbox/Docs/TRANCHE_TEMPLATE.md`
- `custom_components/tunet_inbox/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/const.py`
- `custom_components/tunet_inbox/models.py`
- `custom_components/tunet_inbox/storage.py`
- `custom_components/tunet_inbox/events.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/manifest.json`
- `custom_components/tunet_inbox/services.yaml`
- `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh`
- `custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- `package.json`
- `Configuration/configuration.yaml`
- `HA-References/dashboard_enhancement_plan.md`
- `HA-References/tunet_inbox_enhancement_matrix.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `Dashboard/Tunet/**`
- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `build.mjs`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/tunet-inbox-dashboard.yaml`
- any file under `custom_components/tunet_inbox/tests/`
- any config-flow, diagnostics, translations, or brand files under `custom_components/tunet_inbox/`

## CURRENT_STATE

- The repo now contains a governed `custom_components/tunet_inbox/` workstream with its own policy, plan, ledger, tranche docs, contracts, and deploy/test docs.
- Backend scaffold files and operator scripts are present.
- `package.json` exposes the `tinbox:*` commands.
- `Configuration/configuration.yaml` contains the local `tunet_inbox:` bootstrap block and logger entries.
- Static validation passed and the stale dashboard-centric enhancement tracker has been replaced.
- Deploy/smoke flows support fallback to `/home/mac/HA/implementation_10/.env`.

## INTENDED_STATE

- `TI0` is fully defined and reviewable as a narrow tranche.
- `tunet_inbox` backend skeleton exists with governed service, event, item, and storage seams.
- The repo exposes first-class operator commands:
  - `npm run tinbox:check`
  - `npm run tinbox:deploy:integration`
  - `npm run tinbox:smoke`
- `Configuration/configuration.yaml` contains the YAML bootstrap block and logger entries required for the integration.
- No frontend or package behavior changes have landed yet.

## CLOSEOUT_EVIDENCE

- `package.json` now exposes:
  - `tinbox:check`
  - `tinbox:deploy:integration`
  - `tinbox:smoke`
- `Configuration/configuration.yaml` now contains:
  - the `tunet_inbox:` bootstrap block
  - logger wiring for `custom_components.tunet_inbox`
- static validation passed on 2026-04-06:
  - `python3 -m py_compile custom_components/tunet_inbox/*.py`
  - `node --check custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
  - `npm run tinbox:check`
- no Tunet frontend files or OAL/Sonos package files were changed in this tranche

## EXACT_CHANGE_IN_ENGLISH

- Add a mandatory tranche document for `TI0` and make it the active execution authority for this slice.
- Add planning-control rules so the team knows when to stop and re-plan versus continue implementing inside the tranche.
- Keep the existing backend scaffold inside a governed file boundary.
- Add repo-native validation, deploy, and smoke scripts for the backend.
- Wire the backend operator commands into `package.json`.
- Add the `tunet_inbox:` YAML bootstrap block and logger entries to `Configuration/configuration.yaml`.
- Replace the stale enhancement tracker with an inbox-specific planning matrix aligned to the current question set.
- Explicitly defer package migrations, frontend work, config flow, diagnostics, and tests beyond static validation.

## ARCHITECTURAL_INTENTION

- This slice exists to prove that the backend can be treated as an operational subsystem, not just a pile of integration files.
- It creates the same kind of disciplined execution lane that Tunet already uses for frontend work.
- It also decouples backend governance from frontend governance while keeping both compatible.

## ACCEPTANCE_CRITERIA

- `custom_components/tunet_inbox/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md` exists and is referenced from `plan.md`.
- `custom_components/tunet_inbox/AGENTS.md` documents tranche-spec requirements and planning-mode control rules.
- `custom_components/tunet_inbox/Docs/TRANCHE_TEMPLATE.md` includes a `PLAN_MODE_DECISION` section.
- `custom_components/tunet_inbox/Docs/execution_ledger.md` exists and is detailed enough to own normalized cross-tranche issue state.
- `package.json` contains:
  - `tinbox:check`
  - `tinbox:deploy:integration`
  - `tinbox:smoke`
- `Configuration/configuration.yaml` contains a `tunet_inbox:` block with:
  - `notify_device_helper`
  - `max_pending_items`
  - `response_timeout_seconds`
  - `archive_retention_days`
  - `privacy_mode_default`
  - `debug_events`
- `Configuration/configuration.yaml` contains logger wiring for `custom_components.tunet_inbox`.
- `custom_components/tunet_inbox/*.py` all pass `python3 -m py_compile`.
- `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh` passes locally.
- `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh` supports `.env` fallback to the primary repo root.
- `custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs` verifies the `tunet_inbox` domain and all six public services through `/api/services`.
- `HA-References/tunet_inbox_enhancement_matrix.md` exists and replaces the old dashboard-centric tracker as the current enhancement matrix.
- No Tunet frontend files or OAL/Sonos package files are changed by this tranche.

## VALIDATION

### Static validation

- `python3 -m py_compile custom_components/tunet_inbox/*.py`
- `node --check custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- `bash custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
- verify `package.json` is valid JSON after script additions

### Runtime validation

- `npm run tinbox:check`
- inspect that the check script validates:
  - governance files
  - manifest JSON
  - YAML parse of `Configuration/configuration.yaml`
  - YAML parse of `custom_components/tunet_inbox/services.yaml`

### HA/live validation

- not required to finish the tranche in `REPO ONLY` mode
- if the tranche is deployed before closeout:
  - `npm run tinbox:deploy:integration`
  - restart HA
  - `npm run tinbox:smoke`

## DEPLOY_IMPACT

- `HA RESTART`
- Reason:
  - this tranche changes Python integration files and `Configuration/configuration.yaml`
- Note:
  - the tranche can still be code-complete without live deployment, but any actual HA rollout requires restart

## ROLLBACK

- revert the changed repo files in this tranche
- if deployed:
  - restore the latest backup created by `deploy_tunet_inbox.sh`
  - restart HA
  - re-run `npm run tinbox:smoke`

## DEPENDENCIES

- repo root remains `/home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration`
- `python3` is available
- `node` is available
- `sshpass`, `ssh`, `scp`, and `tar` are available for deploy
- a valid `.env` exists either in the worktree or at `/home/mac/HA/implementation_10/.env`

## UNKNOWNS

- exact HA runtime compatibility of the current service-registration code until first live smoke check
- whether `notify_device_helper` should remain a helper entity id or evolve into direct notify-service configuration later
- whether additional bootstrap config will be needed once package migrations begin

## STOP_CONDITIONS

- stop if implementation needs to touch `Dashboard/Tunet/**`
- stop if implementation needs to touch `packages/oal_lighting_control_package.yaml`
- stop if implementation needs to touch `packages/sonos_package.yaml`
- stop if the public service/event/item contract must change beyond what `Docs/contracts.md` currently allows
- stop if backend deploy requires a broader remote-mutation tool than the scoped integration deploy helper
- stop if static validation reveals a structural issue that requires introducing config flow, diagnostics, or tests into `TI0`

## OUT_OF_SCOPE

- any Tunet card code
- any dashboard YAML
- any OAL or Sonos package migration
- config flow
- diagnostics
- repairs
- branded assets
- Python unit-test harness introduction
- startup reconcile hardening beyond the currently scaffolded manager methods

## REVIEW_FOCUS

- scope discipline
- governance completeness
- contract fidelity between docs and code
- operator safety for deploy/restart/smoke flows
- whether the tranche can be accepted or rejected without needing package or frontend context
