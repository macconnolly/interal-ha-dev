# Tunet Inbox - Implementation Plan

Working branch: `tunet/inbox-integration`  
Last updated: 2026-04-19  
Scope root: `/home/mac/HA/implementation_10/.claude/worktrees/tunet-inbox-integration/custom_components/tunet_inbox`

## Mission

Build `tunet_inbox` as the governed notification-control plane for actionable Home Assistant notifications:

- canonical queue and action arbiter
- governed service and event contract
- mobile + dashboard parity
- deterministic clear and resolve ownership
- migration path for OAL and Sonos flows

## Program Authorities

- single source of truth for tranche ordering, tranche state, and promotion:
  - `custom_components/tunet_inbox/plan.md`
- execution policy:
  - `custom_components/tunet_inbox/AGENTS.md`
- normalized cross-tranche status authority:
  - `custom_components/tunet_inbox/Docs/execution_ledger.md`
- active execution authority:
  - the current tranche doc under `custom_components/tunet_inbox/Docs/tranches/`
- session continuity:
  - `custom_components/tunet_inbox/handoff.md`
- interpretation/change log:
  - `custom_components/tunet_inbox/FIX_LEDGER.md`

## Execution Control Policy

- `plan.md` governs program order, tranche queue, dependencies, and gates.
- `plan.md` is the authority for tranche ordering, tranche state, and tranche promotion.
- every tranche doc under `Docs/tranches/` must be referenced from this file; there are no standalone tranche files.
- tranche docs may define execution details, but they must not override tranche ordering or tranche status recorded here.
- No tranche is executable until it has a fully filled tranche spec under `Docs/tranches/`.
- Default execution mode is correct for implementation inside an approved tranche.
- Explicit planning mode is required only when:
  - a new tranche starts
  - a public contract changes
  - allowed-file boundaries are exceeded
  - deploy/restart/rollback sequencing becomes ambiguous
  - ownership or acceptance criteria are unclear
- We do not stop for planning mode on every narrow fix that already fits the active tranche.

## Locked Product Direction

- `tunet_inbox` is the canonical queue and action arbiter.
- The dashboard is a renderer/requester only.
- Mobile notifications remain a delivery surface, not the source of truth.
- OAL and Sonos continue to decide what actions mean and when conditions are valid.
- `tunet_inbox` owns:
  - queue persistence
  - action validation
  - response locks
  - canonical event emission
  - queue refresh signaling
  - mobile send/clear orchestration
  - audit metadata
  - startup reconcile and stale recovery

## Active Contract Decisions

- Public services:
  - `tunet_inbox.post`
  - `tunet_inbox.respond`
  - `tunet_inbox.resolve`
  - `tunet_inbox.fail`
  - `tunet_inbox.dismiss`
  - `tunet_inbox.list_items`
- Public events:
  - `tunet_inbox_action`
  - `tunet_inbox_updated`
- Identity:
  - `key` = logical notification identity
  - `item_id` = active instance identity
- Raw mobile action format:
  - `TINBOX|<item_id>|<action_id>`
- Default notify target:
  - may be a helper entity containing a mobile-app device id
  - or a direct `notify.*` service such as a notify group
  - blank is invalid and does not imply broadcast
- Default queue policies:
  - `max_pending_items = 64`
  - `response_timeout_seconds = 30`
  - `archive_retention_days = 3`
- Queue is not a permanent history.
- Manual dismiss exists but is not exposed by default in the card.

## Program Order

The `tunet_inbox` workstream executes in this order:

1. `TI0` governance scaffold, backend skeleton, operator path
2. `TI1` service pipeline and storage enforcement
3. `TI1A` local HA integration test harness
4. `TI1B` integration productization and supportability
5. `TI1C` corruption quarantine, repairs, and release verification
6. `TI1D` API probe, key-addressable operator flow, and single-flow OAL pilot
7. `TI1E` shadow translation and compare-mode notification coverage
8. `TI2` Tunet inbox card and dashboard surfaces
9. `TI2A` mobile notification continuity and compare-mode repairs
10. `TI2B` mobile.url public service-schema parity
11. `TI2C` inbox tap contract canonicalization
12. `TI3` OAL authoritative cutover and resolver cleanup
13. `TI4` Sonos alarm-playing authoritative pilot
14. `TI4A` Sonos evening alarm authoritative extraction
15. `TI5A` Sonos Apple TV auto-off authoritative extraction
16. `TI5A1` Sonos Apple TV no-response timeout ownership
17. `TI5B` OAL TV-family compare-mode retirement
18. `TI5C` OAL unified timer authoritative cutover
19. `TI6` diagnostics, repairs, corruption handling, rollout hardening

Do not skip ahead. The backend contract must be stable before migrating package logic or widening UI scope.
The intentional exceptions are:
- supportability work may be pulled forward ahead of UI when the backend still violates a locked governance rule
- compare-mode translation may be pulled forward ahead of UI when the explicit goal is to mirror live notification contexts into `tunet_inbox` while preserving the current mobile flows for comparison

## Tranche Dependency Rules

- `TI1` cannot start until `TI0` is closed.
- `TI1A` cannot start until `TI1` is closed.
- `TI1B` cannot start until `TI1A` is closed.
- `TI1C` cannot start until `TI1B` is closed.
- `TI1D` cannot start until `TI1C` is closed.
- `TI1E` cannot start until `TI1D` is closed.
- `TI2` cannot start until `TI1E` is closed.
- `TI2A` cannot start until `TI2` is closed.
- `TI2B` cannot start until `TI2A` is closed.
- `TI2C` cannot start until `TI2B` is closed.
- `TI3` cannot start until `TI1E`, `TI2`, `TI2A`, `TI2B`, and `TI2C` are closed.
- `TI4` cannot start until `TI3` is closed.
- `TI4A` cannot start until `TI4` is closed.
- `TI5A` cannot start until `TI3`, `TI4`, and `TI4A` are closed.
- `TI5A1` cannot start until `TI5A` is closed.
- `TI5B` cannot start until `TI5A1` is closed.
- `TI5C` cannot start until `TI5B` is closed.
- `TI6` cannot start until `TI5C` is closed unless an emergency supportability blocker forces an exception.

## Tranche Entry And Exit Model

### Entry criteria

A tranche is allowed to move from `PLANNED` to `IN PROGRESS` only when:

- all hard dependencies are closed
- its tranche doc exists and is fully filled
- the normalized open issues it is meant to close are explicitly listed in `execution_ledger.md`
- the file boundary is frozen
- validation and deploy impact are already defined

### Exit criteria

A tranche is allowed to move to `DONE` only when:

- its acceptance criteria are implemented
- required docs sync is complete
- all required static validation has passed
- any required runtime validation has passed
- any required HA/live validation has passed, if that tranche requires live proof
- the ledger and handoff reflect the new normalized state

### Promotion rule

The next tranche does not become active merely because coding finished in the previous tranche.
Promotion requires the prior tranche to be explicitly closed against its exit criteria.

## Current Tranche

- active tranche:
  - `TI5A1 — Sonos Apple TV No-Response Timeout Ownership`
- current tranche state:
  - `ACTIVE`
  - `TI3` is closed on:
    - removal of caller-supplied `mobile.url` route literals from the frozen OAL cutover set
    - live override-reminder writer proof plus dashboard action proof
    - live override-expiring writer proof plus simulated phone-action proof through `mobile_app_notification_action`
    - bounded synthetic TV prompt proof for swipe-dismiss safety, dashboard dismiss handling, and natural resolver ownership without widening into Apple TV playback control
    - later TV-family tranches still need domain-real playback proof before deleting adjacent compare-mode paths
  - `TI4` is closed on:
    - removal of the direct package-owned mobile writer from `sonos_alarm_playing`
    - authoritative `tunet_inbox.post(send_mobile=true)` writer proof on `sonos_alarm_playing:media_player.bedroom`
    - live action proof through `tunet_inbox_action` from both the phone notification action and the dashboard
    - duplicate replay rejection with `accepted: false, reason: item_not_found`
    - user-confirmed body-tap opening of the governed inbox surface
    - user-confirmed clear behavior on a second live test and final queue cleanup to `total: 0`
  - `TI4A` is closed on:
    - removal of the direct `notify.notify` writer, dynamic raw mobile action ids, and inline `wait_for_trigger` path from `sonos_evening_alarm_check`
    - authoritative `tunet_inbox.post(send_mobile=true)` writer proof for `sonos_evening_alarm_check:2026-04-20`
    - live phone proof on `Mac's iPhone personal` that body tap opened the governed inbox surface and `Keep Enabled` cleared the notification
    - live dashboard-card `Disable` proof that set `input_text.sonos_alarms_disabled_for_tomorrow = switch.sonos_alarm_182` and turned `switch.sonos_alarm_182` off
    - restoration proof that returned `switch.sonos_alarm_182` to `on`, cleared the disabled helper, restored `sensor.sonos_alarms_for_tomorrow` to `1 alarm(s) scheduled for tomorrow.`, and returned `tunet_inbox.list_items` to `meta.total: 0`
    - recorded live user feedback that the governed evening-alarm functionality is fully baked; duplicate phone delivery through the notify-group fan-out is out of scope for this tranche
  - `TI5A` is closed on:
    - package-only extraction of `sonos_apple_tv_auto_off` away from `script.confirmable_notification`
    - package deploy to `/config/packages/sonos_package.yaml` with remote backup `Backups/tunet_inbox/packages/sonos_package.20260419_222907.remote.yaml`
    - valid config check plus `script.reload` and `automation.reload`
    - user-confirmed body-tap opening of the governed inbox surface
    - user-confirmed phone `No, Keep On` proof with notification clear while Apple TV and TV stayed on
    - user-confirmed phone `Yes, Turn Off` proof with notification clear while Apple TV and TV both turned off
    - accepted dashboard-card `tunet_inbox.respond(... source='dashboard_card')` proof
    - duplicate replay rejection with `accepted: false, reason: item_not_found`
    - natural context-clear proof via `input_boolean.apple_tv_no_auto_off` template-triggered resolver and final queue cleanup to `meta.total: 0`
  - non-cutover OAL and remaining compare-mode Sonos flows stay outside authoritative scope until later tranches
- latest closed tranche:
  - `TI5A — Sonos Apple TV Auto-Off Authoritative Extraction`
  - the last live Sonos dependency on `script.confirmable_notification` is removed from production use, and the Apple TV inactivity flow now closes end to end through governed inbox post/respond/resolve behavior
- next promotion target:
  - none
  - `TI5A1` is active
  - `TI5B` remains frozen behind `TI5A1`
  - `TI5C` remains frozen behind `TI5B`
  - conclude each of the `TI5*` tranches with final live user feedback and end-of-tranche live testing recorded in governance
- no `Dashboard/Tunet/**` tranche is active now

## Tranche Queue

### TI0 — Governance Scaffold + Core Backend Skeleton

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md`
- purpose:
  - create the governed backend workstream, operator path, YAML bootstrap, and validation base
- entry gate:
  - satisfied
- exit gate:
  - `TINBOX-GOV-3`, `TINBOX-BE-1`, `TINBOX-BE-2`, and `TINBOX-BE-3` are closed
- deploy impact:
  - `HA RESTART`

### TI1 — Service Pipeline And Storage Enforcement

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1_service_pipeline_and_storage_enforcement.md`
- purpose:
  - finalize governed service semantics, state transitions, dedupe behavior, timeout recovery, and live service proof
- cannot start until:
  - satisfied
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-TI1-1`, `TINBOX-TI1-2`, and the first recorded deploy/smoke proof are closed
- deploy impact:
  - `HA RESTART`

### TI1A — Local HA Integration Test Harness

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1A_local_ha_integration_test_harness.md`
- purpose:
  - add a local Home Assistant custom-integration pytest harness, operator scripts, and the first targeted backend tests for manager state transitions, service responses, and event emission
- cannot start until:
  - `TI1` closes
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-TEST-1` and `TINBOX-TEST-2` are closed
- deploy impact:
  - `REPO ONLY`

### TI1B — Integration Productization And Supportability

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1B_integration_productization_and_supportability.md`
- purpose:
  - finish the backend integration shape before any dashboard work by adding config-entry setup, diagnostics, translation-backed UI strings, manifest hardening, and supportability tests
- cannot start until:
  - `TI1A` closes
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-PROD-1` and `TINBOX-PROD-2` are closed
- deploy impact:
  - `HA RESTART`

### TI1C — Corruption Quarantine, Repairs, And Release Verification

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1C_corruption_quarantine_repairs_and_release_verification.md`
- purpose:
  - finish the backend production hardening gap by quarantining malformed persisted payloads, surfacing repair issues, and adding one governed release-verification path before any UI work starts
- cannot start until:
  - `TI1B` closes
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-PROD-3` and `TINBOX-PROD-4` are closed
- deploy impact:
  - `HA RESTART`

### TI1D — API Probe, Key-Addressable Operator Flow, And Single-Flow OAL Pilot

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1D_api_probe_key_operator_flow_and_single_flow_oal_pilot.md`
- purpose:
  - add a token-backed HA API probe, align the service layer with key-addressable item references, and migrate the OAL override reminder as one bounded pre-UI pilot
- cannot start until:
  - `TI1C` closes
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-OPS-1`, `TINBOX-OPS-2`, and `TINBOX-OAL-0` are closed
- deploy impact:
  - `HA PACKAGE RELOAD`
  - `HA RESTART` if backend integration code changes concurrently

### TI1E — Shadow Translation And Compare-Mode Notification Coverage

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI1E_shadow_translation_compare_mode.md`
- purpose:
  - mirror as many documented OAL and Sonos actionable notification contexts as practical into `tunet_inbox` while leaving the current mobile notification writers and raw mobile handlers intact for side-by-side comparison
- cannot start until:
  - `TI1D` closes
- must close before:
  - `TI2`
  - `TI3`
- exit gate:
  - `TINBOX-SHADOW-1`, `TINBOX-SHADOW-2`, and `TINBOX-SHADOW-3` are closed
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI2 — Tunet Inbox Card Rehab Surface

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI2_tunet_inbox_card_rehab_surface.md`
- purpose:
  - build the governed Tunet inbox card and the dedicated validation/dashboard surfaces after compare-mode queue coverage exists
- cannot start until:
  - `TI1E` closes
- must close before:
  - `TI3`
- exit gate:
  - `TINBOX-UI-1` and `TINBOX-UI-2` are closed
- deploy impact:
  - `HA RESOURCE UPDATE`
  - `HA DASHBOARD UPDATE`

### TI2A — Mobile Notification Continuity And Compare-Mode Repairs

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI2A_mobile_notification_continuity_and_compare_mode_repairs.md`
- purpose:
  - preserve the current phone-notification experience while adding dashboard tap-through, removing confirmation receipts, and hardening the Sonos/OAL compare-mode writers before authoritative cutover
- cannot start until:
  - `TI2` closes
- must close before:
  - `TI3`
- exit gate:
  - the touched current-state phone writers still send
  - the touched notifications include dashboard tap-through URLs
  - confirmation receipt notifications are removed from the touched handlers
  - the Sonos alarm path no longer restores or behaves as startup-broken
- deploy impact:
  - `HA RESTART`
  - `HA PACKAGE RELOAD`

### TI2B — mobile.url Public Service-Schema Parity

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI2B_mobile_url_public_service_schema_parity.md`
- purpose:
  - close the narrow public-schema mismatch so the already-supported `mobile.url` model/runtime path is live-proven as a compatibility surface
- cannot start until:
  - `TI2A` closes
- must close before:
  - `TI2C`
  - `TI3`
- exit gate:
  - `TINBOX-CONTRACT-2` is closed
- deploy impact:
  - `HA RESTART`

### TI2C — Inbox Tap Contract Canonicalization

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI2C_inbox_tap_contract_canonicalization.md`
- purpose:
  - convert inbox tap-through from a caller-owned raw `mobile.url` field into a backend-owned governed default so all `tunet_inbox` mobile deliveries open the inbox surface by intent rather than by route string, with an integration setting for the default tap URL
- cannot start until:
  - `TI2B` closes
- must close before:
  - `TI3`
- readiness note:
  - `TI2B` closed the public-schema parity blocker without settling the durable tap contract
  - `TI2C` settled the durable tap contract before package cutover resumed
  - the tranche boundary widened into config-entry settings because the default tap URL had to be configurable
- exit gate:
  - `TINBOX-CONTRACT-3` and `TINBOX-TEST-3` are closed
- deploy impact:
  - `HA INTEGRATION RELOAD`

### TI3 — OAL Authoritative Cutover And Resolver Cleanup

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI3_oal_pilot_migration.md`
- purpose:
  - cut the frozen OAL compare-mode set over from dual-running notification logic to inbox-authoritative notification logic with resolver cleanup
- cannot start until:
  - `TI1E` closes
  - `TI2` closes
  - `TI2A` closes
  - `TI2B` closes
  - `TI2C` closes
- must close before:
  - `TI4`
  - `TI5A`
- readiness note:
  - `TI2B` remains the live compatibility baseline for `mobile.url`
  - `TI2C` closed first, so TI3 executed wholly inside the package boundary
- exit gate:
  - `TINBOX-OAL-1` and `TINBOX-OAL-2` are closed
- deploy impact:
  - `HA PACKAGE RELOAD`
  - `HA RESTART` only if integration code changes at the same time

### TI4 — Sonos Alarm-Playing Authoritative Pilot

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI4_sonos_pilot_migration.md`
- purpose:
  - cut `sonos_alarm_playing` over from dual-running compare mode to inbox-authoritative notification logic
- cannot start until:
  - `TI3` closes
- readiness note:
  - the TI4 tranche spec is now frozen around the alarm-playing writer/handler/resolver path
  - `sonos_evening_alarm_check` is split into `TI4A` because it still depends on inline `wait_for_trigger` and dynamic raw mobile action ids
  - `sonos_apple_tv_auto_off` was split into `TI5A` because it then depended on `script.confirmable_notification`; `TI5A` is now closed
- exit gate:
  - `TINBOX-SONOS-1` is closed
  - final live user feedback on the delivered phone flow is recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI4A — Sonos Evening Alarm Authoritative Extraction

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI4A_sonos_evening_alarm_authoritative_extraction.md`
- purpose:
  - extract `sonos_evening_alarm_check` from its legacy inline mobile wait path into an inbox-authoritative writer/action/resolver flow
- cannot start until:
  - `TI4` closes
- readiness note:
  - closed by package-only extraction of the direct writer, dynamic raw mobile action ids, and inline wait path
  - closed by live phone proof, live dashboard-card proof, alarm restoration proof, queue cleanup, and recorded live user feedback
  - keep `sonos_apple_tv_auto_off` out of scope because its confirmable-notification coupling is a separate control point
- exit gate:
  - `TINBOX-SONOS-2` is closed
  - final live user feedback on the delivered phone flow is recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI5A — Sonos Apple TV Auto-Off Authoritative Extraction

- status:
  - `DONE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI5A_sonos_apple_tv_auto_off_authoritative_extraction.md`
- purpose:
  - remove the legacy `script.confirmable_notification` bridge from `sonos_apple_tv_auto_off` and make the Apple TV inactivity flow inbox-authoritative
- cannot start until:
  - `TI3` closes
  - `TI4` closes
  - `TI4A` closes
- readiness note:
  - this tranche is closed
  - package-only implementation landed:
    - `script.apple_tv_auto_off_notification` posts via `tunet_inbox.post(send_mobile=true)`
    - the legacy `script.confirmable_notification` bridge is removed from the Apple TV auto-off path
    - a dedicated `tunet_inbox_action` handler owns `SONOS_ATV_CONFIRM_OFF` and `SONOS_ATV_KEEP_ON`
    - the existing resolver remains the natural context-clear owner
  - live proof closed the previously broken turn-off path on real Apple TV and TV entities
- exit gate:
  - `TINBOX-SONOS-3` is closed
  - final live user feedback and end-of-tranche live testing are recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI5A1 — Sonos Apple TV No-Response Timeout Ownership

- status:
  - `ACTIVE`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI5A1_sonos_apple_tv_no_response_timeout.md`
- purpose:
  - add an explicit 15-minute no-response timeout owner to the governed Apple TV inactivity flow
- cannot start until:
  - `TI5A` closes
- readiness note:
  - the user explicitly requested automatic turn-off after 15 minutes of no response
  - the clean implementation stays inside the package-owned Apple TV flow rather than reopening backend scope
  - the timeout path must remain governed and must not reintroduce raw mobile waits
- exit gate:
  - `TINBOX-SONOS-4` is closed
  - final live user feedback and end-of-tranche live testing are recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI5B — OAL TV-Family Compare-Mode Retirement

- status:
  - `PLANNED`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI5B_oal_tv_family_compare_mode_retirement.md`
- purpose:
  - retire compare-mode writers and raw mobile handlers for the remaining OAL TV-family flows with domain-real playback proof
- cannot start until:
  - `TI5A1` closes
- readiness note:
  - TI3 closed the TV prompt on bounded synthetic proof only
  - `oal_tv_mode_activated`, `oal_bridge_expiring`, and `oal_tv_presence_prompt` still dual-run compare mode inside one shared TV-family handler/resolver state machine
  - conclude the tranche with final live user feedback and end-of-tranche live testing recorded in governance
- exit gate:
  - `TINBOX-OAL-3` is closed
  - final live user feedback and end-of-tranche live testing are recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI5C — OAL Unified Timer Authoritative Cutover

- status:
  - `PLANNED`
- tranche doc:
  - `custom_components/tunet_inbox/Docs/tranches/TI5C_oal_unified_timer_authoritative_cutover.md`
- purpose:
  - convert the unified timer-expiry arbiter from compare mode to inbox-authoritative ownership
- cannot start until:
  - `TI5B` closes
- readiness note:
  - unified timer is a separate OAL mechanism and should not be folded into TV-family retirement
  - conclude the tranche with final live user feedback and end-of-tranche live testing recorded in governance
- exit gate:
  - `TINBOX-OAL-4` is closed
  - final live user feedback and end-of-tranche live testing are recorded in governance
- deploy impact:
  - `HA PACKAGE RELOAD`

### TI6 — Hardening

- status:
  - `PLANNED`
- purpose:
  - diagnostics, repairs, corruption handling, pruning policy, and supportability hardening
- cannot start until:
  - `TI5C` closes
- exit gate:
  - `TINBOX-HARDEN-1` is closed
- deploy impact:
  - `HA RESTART`

## Governance Backlog

- keep `TI2B` recorded as a parity patch, not the final inbox-tap contract decision
- move inbox tap ownership into the backend so callers stop providing raw route strings as the normal API
- preserve compare-mode behavior for all non-cutover OAL flows until their own tranches promote them
- keep the `mobile.url` unblock tranche narrow: schema parity, service docs, regression tests, and live service proof only
- keep the initial Sonos authoritative cutover frozen to `sonos_alarm_playing` until other Sonos flows are explicitly reclassified

## Program-Level Acceptance Gates

### TI0 gate

- governance docs exist and are internally consistent
- program ledger exists and is normalized enough to own cross-tranche issue state
- `TI1`, `TI2`, and `TI3` tranche docs exist
- `npm run tinbox:check`, `npm run tinbox:deploy:integration`, and `npm run tinbox:smoke` exist in `package.json`
- backend scaffold files load statically
- YAML bootstrap config is wired

### TI1 gate

- `post`, `respond`, `resolve`, `fail`, `dismiss`, and `list_items` are registered in HA
- storage persists and restores queue items
- stale or duplicate responses are rejected deterministically
- canonical events fire once per accepted response
- timeout recovery behavior is proven

### TI1B gate

- single config-entry runtime exists and is importable from YAML bootstrap
- diagnostics redact queue-sensitive fields
- config/options flow strings exist and load
- manifest metadata is valid for the supported runtime shape
- local pytest suite passes without the tracked UTC warning

### TI1C gate

- malformed persisted queue payloads are quarantined instead of skipped silently
- a repair issue is raised when quarantine is non-empty and clears when the condition is gone
- diagnostics expose quarantine state without leaking sensitive payload content
- one governed local release-verification command passes
- post-deploy smoke still passes after the quarantine/repairs changes

### TI2 gate

- card loads items through `list_items`
- card refreshes on `tunet_inbox_updated`
- card never calls package services directly
- rehab dashboard and standalone inbox dashboard both render the card successfully

### TI1D gate

- `respond`, `resolve`, `fail`, and `dismiss` accept either `item_id` or `key`
- a token-backed HA API probe exists and can exercise the migrated flow using `.env`
- OAL override reminder uses `tunet_inbox.post`
- OAL override reminder action handling listens to `tunet_inbox_action`
- OAL override reminder natural resolution clears by key

### TI1E gate

- the documented notification inventory is classified into:
  - `shadow + action-ready`
  - `shadow + mirror-only`
- existing mobile notification writers remain intact for every translated flow
- existing raw mobile action handlers remain intact for every translated flow
- translated flows post parallel queue items to `tunet_inbox` without creating duplicate mobile pushes
- representative live proofs exist for:
  - one OAL TV-family flow
  - unified timer or override-expiring
  - Sonos alarm playing
- notification tags, keys, and resolver ownership are documented per translated flow

### TI3 gate

- selected OAL flows no longer dual-run legacy mobile-only handlers
- inbox-authoritative paths own post/respond/resolve for the cutover set
- legacy compare-mode branches for the cutover set are removed or explicitly retired
- natural resolution clears the queue item and runs through the governed mobile-clear path
- stale or double responses are rejected safely

### TI2B gate

- `tunet_inbox.post` public service schema accepts `mobile.url`
- `services.yaml` documents `mobile.url` in the operator-facing `post` service contract
- local HA-style service tests prove `mobile.url` is accepted and persisted through the public service boundary
- live `tunet_inbox.post` with `mobile.url` succeeds against HA
- `TI2C` starts from a clean parity baseline without reopening package scope

### TI2C gate

- all `tunet_inbox` mobile deliveries open the governed inbox surface by default
- backend-owned mapping is responsible for emitting HA-native `data.url`
- raw `mobile.url` is no longer the normal public operator contract for new callers
- the default tap URL is configurable in integration settings and falls back to `/tunet-inbox-yaml/inbox` when unset
- legacy `mobile.url` is accepted only as a temporary compatibility field for the currently configured governed inbox route and is normalized by the backend
- a local config-flow test proves the configured default tap URL persists into runtime settings
- a local HA-style service-boundary test proves `send_mobile=true` uses the canonical inbox tap contract
- a local adapter test proves the emitted mobile payload contains the canonical inbox `data.url`
- a local rejection test proves non-canonical `mobile.url` values fail validation
- live `tunet_inbox.post` proof succeeds and cleanup returns the queue to the expected post-proof state
- a local config-flow regression proves import-backed YAML import preserves non-overlapping options such as `mobile_tap_url`
- browser reload activates the deployed integration payload and the live configured-route proof passes on the active runtime
- `TI3` is restored from `NOT READY` to `READY TO START`

## External Planning Tracker

The old dashboard-centric enhancement artifact is no longer the right planning shape for this work.
The replacement tracker authority is:

- `HA-References/tunet_inbox_enhancement_matrix.md`

The legacy file should be treated as superseded once the replacement is in place.

## Out Of Scope For The Current Active Tranche

- Tunet card runtime
- dashboard YAML
- authoritative cutover or retirement of current mobile flows
- any package or dashboard widening while `TI2C` owns the configurable tap-url contract work
- non-documented notification families
