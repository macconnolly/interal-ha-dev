# TI2 — Tunet Inbox Card Rehab Surface

## TRANCHE_ID

- `TI2`

## TITLE

- `Build the governed Tunet inbox card, rehab validation surface, and standalone inbox dashboard`

## STATUS

- `CLOSED`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this tranche crosses from backend scope into `Dashboard/Tunet/**`
  - it enters the Tunet scoped governance model
  - it depends on a frozen backend render/response contract

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI2 — Tunet Inbox Card Rehab Surface`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-UI-1`
  - `TINBOX-UI-2`
- `Dashboard/Tunet/AGENTS.md`
  - applies to every file under `Dashboard/Tunet/**`

## GOAL

- Deliver a Tunet v3 inbox card and validation surfaces that render live queue items from `tunet_inbox`, refresh from backend events, and submit governed actions without embedding business logic.

## WHY_NOW

- The backend must have a real user-facing recovery surface before OAL migration is considered complete.
- This tranche proves that the backend contract is usable by the dashboard without hidden package coupling.
- It creates the validation surface needed for later migration acceptance.

## USER_VISIBLE_OUTCOME

- A new Tunet inbox card exists.
- The rehab dashboard can render pending notification items.
- A standalone inbox dashboard exists for live verification.
- Dashboard actions go through `tunet_inbox.respond` and not package-local services.

## FILES_ALLOWED

- `Dashboard/Tunet/Cards/v3/tunet_inbox_card.js`
- `Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/tunet-inbox-dashboard.yaml`
- `Dashboard/Tunet/Docs/tunet_build_and_deploy.md`
- `plan.md`
- `FIX_LEDGER.md`
- `handoff.md`
- `build.mjs`
- `package.json`
- `Configuration/configuration.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI2_tunet_inbox_card_rehab_surface.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/oal_lighting_control_package.yaml`
- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- any Tunet card other than the inbox card unless the Tunet tranche docs explicitly require a shared fix

## CURRENT_STATE

- `TI1E` is assumed complete.
- The backend service and event contract are stable enough for frontend consumption.
- Compare-mode translation should have populated the queue with materially broader live coverage than the single-flow pilot.
- No inbox card or dashboard surface exists yet.

## INTENDED_STATE

- `custom:tunet-inbox-card` exists as a Tunet v3 card.
- The card:
  - loads via `tunet_inbox.list_items`
  - refreshes on `tunet_inbox_updated`
  - submits actions through `tunet_inbox.respond`
  - optionally supports governed dismiss
  - renders empty/loading/error and row-level action-pending states
- The rehab dashboard includes inbox validation fixtures.
- A standalone inbox dashboard exists and is registered in HA YAML.
- The card contract is documented in Tunet docs and backlog artifacts.

## EXACT_CHANGE_IN_ENGLISH

- Add a new Tunet v3 inbox card that is backend-driven only.
- Add dedicated bespoke tests for the card contract.
- Add inbox validation fixtures to the Tunet rehab dashboard.
- Add a standalone inbox dashboard YAML for end-to-end verification.
- Update the Tunet build/deploy docs and build entry list.
- Do not change OAL or Sonos package logic in this tranche.
- Do not change backend service/event contracts in this tranche.

## ARCHITECTURAL_INTENTION

- This tranche validates the dashboard consumption model before any domain migration relies on it.
- It proves the separation of concerns:
  - backend owns truth
  - card owns rendering and request dispatch
- It also keeps the first UI slice narrow and independently reviewable.

## ACCEPTANCE_CRITERIA

- `custom:tunet-inbox-card` is built as a Tunet v3 card.
- `build.mjs` includes the inbox card as a build entry.
- `npm run tunet:build` passes.
- `npm test` includes and passes the inbox bespoke tests.
- the card uses:
  - `list_items` for load
  - `tunet_inbox_updated` event subscription for refresh
  - `respond` for actions
- the card does not:
  - call package services directly
  - fire raw `mobile_app_notification_action`
  - infer OAL/Sonos state directly
- rehab dashboard YAML includes inbox fixtures.
- standalone inbox dashboard YAML exists and is registered.
- Tunet docs sync is complete for all touched Tunet docs.

## CLOSEOUT_EVIDENCE

- local validation passed:
  - `node --check Dashboard/Tunet/Cards/v3/tunet_inbox_card.js`
  - `node --check Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
  - `npm test -- Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
  - full `npm test`
  - `npm run tunet:build`
- live deployment passed:
  - `npm run tunet:deploy:lab`
- live rehab proof completed:
  - rendered live queue items
  - accepted governed `tunet_inbox.respond` actions
  - proved dismiss and empty-state recovery
- standalone dashboard proof completed:
  - `tunet-inbox-yaml` was registered live and retrievable
  - first activation required full HA restart in live proof

## VALIDATION

### Static validation

- `node --check Dashboard/Tunet/Cards/v3/tunet_inbox_card.js`
- YAML parse-check for:
  - `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
  - `Dashboard/Tunet/tunet-inbox-dashboard.yaml`
- `node --check build.mjs`

### Runtime validation

- `npm test -- Dashboard/Tunet/Cards/v3/tests/inbox_bespoke.test.js`
- full `npm test`
- `npm run tunet:build`

### HA/live validation

- `npm run tunet:deploy:lab`
- deploy updated dashboard YAML
- validate at:
  - `390x844`
  - `768x1024`
  - `1024x1366`
  - `1440x900`
- verify:
  - empty state
  - populated state
  - action submit state
  - backend unavailable state

## DEPLOY_IMPACT

- `HA RESOURCE UPDATE`
- `HA DASHBOARD UPDATE`
- `HA RESTART` only if backend files are changed as a blocker exception

## ROLLBACK

- revert changed Tunet files
- redeploy prior Tunet resources
- restore prior rehab/dashboard YAML
- if standalone dashboard registration was added, remove it from `Configuration/configuration.yaml`

## DEPENDENCIES

- `TI1E` is closed
- Tunet mandatory review pack has been read for the touched `Dashboard/Tunet/**` files
- backend service/event/render contract is frozen
- `TI2` activation completed on `2026-04-06` under the `tunet/inbox-integration` worktree branch

## UNKNOWNS

- whether the first live populated-card pass exposes any additional render metadata needs
- whether privacy mode needs Tunet-specific visual treatment beyond the backend redaction contract

## STOP_CONDITIONS

- stop if the card needs backend contract changes
- stop if implementation requires touching OAL or Sonos packages
- stop if another Tunet card must change for the inbox card to function
- stop if the standalone dashboard introduces a broader navigation or surface-composition decision outside this tranche

## OUT_OF_SCOPE

- OAL migration
- Sonos migration
- backend contract changes
- Browser Mod popup refinement
- multi-user routing

## REVIEW_FOCUS

- backend-driven rendering discipline
- no business logic in the card
- Tunet contract compliance
- test coverage for render and action behavior
- surface scope discipline
