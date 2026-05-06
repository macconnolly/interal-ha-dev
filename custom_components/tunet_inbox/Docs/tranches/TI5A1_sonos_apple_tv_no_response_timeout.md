# TI5A1 — Sonos Apple TV No-Response Timeout Ownership

## TRANCHE_ID

- `TI5A1`

## TITLE

- `Auto-turn the Apple TV flow off after 15 minutes of no governed response without reopening backend scope`

## STATUS

- `IN PROGRESS`

## PLAN_MODE_DECISION

- `PLAN MODE REQUIRED`
- Rationale:
  - this starts a new tranche after `TI5A` closeout
  - it changes the user-visible behavior of the Apple TV inactivity prompt
  - it must preserve governed inbox ownership instead of reintroducing raw waits or backend hacks

## SOURCE_ITEMS

- `custom_components/tunet_inbox/plan.md`
  - `TI5A1 — Sonos Apple TV No-Response Timeout Ownership`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `TI5A1 planning freeze — 15-minute no-response timeout`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
  - `TINBOX-SONOS-4`
- `custom_components/tunet_inbox/handoff.md`
  - next-step map after `TI5A`
- `packages/sonos_package.yaml`
  - `apple_tv_auto_off_notification`

## GOAL

- Make the Apple TV inactivity flow turn off automatically after 15 minutes of no response while keeping the governed inbox lifecycle and mobile-clear behavior intact.

## WHY_NOW

- The user explicitly requested automatic turn-off when the Apple TV prompt is ignored for 15 minutes.
- The clean place to own that behavior is the same Apple TV governed flow that `TI5A` just closed, not the later OAL TV-family tranche.

## USER_VISIBLE_OUTCOME

- When the Apple TV inactivity prompt appears, the user sees that no response for 15 minutes will auto-turn the Apple TV and eligible display off.
- If the user ignores the prompt, the devices turn off and the governed item clears automatically after the timeout window.

## FILES_ALLOWED

- `packages/sonos_package.yaml`
- `custom_components/tunet_inbox/plan.md`
- `custom_components/tunet_inbox/FIX_LEDGER.md`
- `custom_components/tunet_inbox/handoff.md`
- `custom_components/tunet_inbox/Docs/execution_ledger.md`
- `custom_components/tunet_inbox/Docs/tranches/TI5A1_sonos_apple_tv_no_response_timeout.md`

## FILES_FORBIDDEN_UNLESS_BLOCKED

- `packages/oal_lighting_control_package.yaml`
- `custom_components/tunet_inbox/__init__.py`
- `custom_components/tunet_inbox/manager.py`
- `custom_components/tunet_inbox/services.py`
- `custom_components/tunet_inbox/mobile.py`
- `custom_components/tunet_inbox/Docs/contracts.md`
- `custom_components/tunet_inbox/Docs/deploy_and_test.md`
- `Dashboard/Tunet/**`
- `Configuration/configuration.yaml`

## CURRENT_STATE

- `TI5A` closed the Apple TV flow as governed post/respond/resolve behavior.
- The Apple TV prompt still behaves as an open-ended choice for the user:
  - confirm -> turn off
  - keep on -> clear and preserve playback
  - no response -> item eventually expires, but there is no owned domain action at 15 minutes

## INTENDED_STATE

- The Apple TV prompt remains governed by `tunet_inbox.post(send_mobile=true)`.
- A no-response timer of 15 minutes is explicitly owned inside the same flow.
- On timeout:
  - the Apple TV turns off
  - the eligible display turns off
  - the governed item resolves cleanly
  - the mobile notification clears through normal resolve mechanics

## EXACT_CHANGE_IN_ENGLISH

- Extend `script.apple_tv_auto_off_notification` so it:
  - captures the posted `item_id`
  - waits up to 15 minutes for any governed item state change that means the user or resolver already handled it
  - on timeout, turns off the Apple TV and eligible display
  - resolves the governed item with an explicit timeout reason
- Update the prompt message so the timeout behavior is visible to the user.
- Do not widen into backend Python, OAL TV-family, or generic timeout services.

## ARCHITECTURAL_INTENTION

- Keep timeout ownership in the same package-level Apple TV flow that already owns the domain action, rather than relying on generic expiry side effects.
- Use governed queue state changes as the synchronization point, not raw mobile notification actions.

## ACCEPTANCE_CRITERIA

- only the Apple TV auto-off flow changes inside `packages/sonos_package.yaml`
- the prompt explicitly states the 15-minute no-response auto-turn-off behavior
- the timeout owner does not use raw `mobile_app_notification_action`
- the timeout path turns off the Apple TV and any eligible display
- the timeout path resolves the governed item cleanly
- manual confirm and keep-on behavior from `TI5A` still works
- duplicate/stale behavior remains safe

## VALIDATION

### Static validation

- YAML parse-check for `packages/sonos_package.yaml`
- `npm run tinbox:check`

### Runtime validation

- inspect the Apple TV script to confirm:
  - it captures the governed `item_id`
  - it waits on governed queue updates rather than raw mobile events
  - timeout resolves with an explicit reason
  - existing confirm/keep-on action ids remain unchanged

### HA/live validation

- ensure HA is stable and the queue is clean before proof
- deploy the changed Sonos package
- run `script.reload`
- trigger a fresh Apple TV prompt with a short override timeout for proof
- validate:
  - user-visible prompt text mentions auto-turn-off timing
  - no response causes the Apple TV and eligible display to turn off
  - the governed item clears automatically
  - the phone notification clears automatically
  - manual confirm and keep-on still behave correctly if re-tested

## DEPLOY_IMPACT

- `HA PACKAGE RELOAD`

## ROLLBACK

- restore the prior `packages/sonos_package.yaml`
- run `script.reload`
- verify the Apple TV prompt returns to manual-response-only behavior

## DEPENDENCIES

- `TI5A` is closed
- the governed inbox tap contract from `TI2C` remains closed
- the live living-room Apple TV and display entities still exist

## STOP_CONDITIONS

- stop if a clean 15-minute timeout owner requires backend Python changes
- stop if the script cannot safely synchronize to governed queue state
- stop if the timeout path would turn off devices after the item was already handled manually

## OUT_OF_SCOPE

- all OAL TV-family flows
- unified timer flow
- notify-group fan-out routing
- backend Python changes

## REVIEW_FOCUS

- inspect the Apple TV notification script as one owned lifecycle:
  - governed post
  - governed wait
  - governed timeout resolve
- verify the timeout path is explicit, visible to the user, and safe against stale follow-up actions
