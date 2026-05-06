Built from the current governed state of the `tunet_inbox` worktree using the active plan, tranche docs, contracts, deploy rules, and implementation files as evidence. This is the normalized cross-tranche status authority for the inbox project.

This file separates:
1. normalized project status and ownership at the top
2. detailed repo-grounded implementation evidence in the appendix

When the normalized section and the appendix differ, the normalized section wins.

## Normalized Status Model

- `Open contract gap`
  - the intended behavior is known, but a contract, authority, or governance rule is incomplete
- `Open implementation blocker`
  - the contract is acceptable, but a missing implementation capability blocks safe progress
- `In-flight tranche work`
  - active work owned by the current tranche with a frozen file boundary
- `Validation debt`
  - implementation exists, but required static, runtime, or HA/live evidence is missing
- `Deferred by policy`
  - the need is real, but the current program order intentionally keeps it out of scope
- `Closed / superseded`
  - earlier framing has been replaced by the current normalized model

## Priority Model

- `P0`
  - cannot safely advance the current tranche or promote the next tranche
- `P1`
  - can advance the current tranche, but blocks the next tranche
- `P2`
  - important follow-on work within the declared program order
- `P3`
  - low-priority refinement or deferred hardening

## Evidence Model

- `Docs evidence`
  - plan, ledger, tranche docs, contracts, deploy docs, handoff, and fix ledger agree
- `Static evidence`
  - syntax, parse, and script validation passes
- `Runtime evidence`
  - local command-path behavior is proven without requiring HA deployment
- `HA/live evidence`
  - deploy, restart/reload, and smoke validation have passed against the actual HA instance

No issue is considered fully closed if the required evidence layer for its tranche has not been met.

## Tranche State Model

- `Not ready`
  - dependencies or gates are still open
- `Ready to start`
  - entry gates are met and a tranche spec exists
- `Active`
  - tranche is the current execution authority
- `Ready to close`
  - acceptance criteria are implemented and validation remains
- `Closed`
  - exit criteria and required evidence are complete
- `Blocked`
  - a stop condition has been reached and no safe continuation exists inside the tranche boundary

## Current Program Snapshot

| Tranche | Scope | Current state | Why not promoted further |
|---------|-------|---------------|---------------------------|
| `TI0` | governance scaffold, backend skeleton, deploy/check/smoke path | `Closed` | closed by package wiring, YAML bootstrap, and static validation evidence |
| `TI1` | service pipeline and storage enforcement | `Closed` | closed by live HA proof plus deterministic runtime proof for the literal `lock_conflict` branch |
| `TI1A` | local HA integration test harness | `Closed` | closed by pinned local test environment, governed operator scripts, and passing targeted backend pytest suite |
| `TI1B` | integration productization and supportability | `Closed` | closed by config-entry runtime, YAML import path, diagnostics, translations, manifest cleanup, and live imported-entry proof |
| `TI1C` | corruption quarantine, repairs, and release verification | `Closed` | closed by quarantine persistence, Repairs surfacing, redacted diagnostics, and live post-restart smoke |
| `TI1D` | API probe, key-addressable operator flow, and single-flow OAL pilot | `Closed` | closed by live OAL pilot proof, token-backed API probe, and post-restart confirmation that the imported entry is loaded with empty options |
| `TI1E` | shadow translation and compare-mode notification coverage | `Closed` | closed by broad OAL/Sonos mirror coverage, per-flow classification, resolver mapping, and representative live proofs |
| `TI2` | Tunet inbox card and dashboard surfaces | `Closed` | closed by the governed inbox card, rehab fixtures, standalone dashboard, live queue/action proof, and standalone dashboard registration proof |
| `TI2A` | mobile notification continuity and compare-mode repairs | `Closed` | closed by mobile URL passthrough, direct-notification tap-through wiring, receipt cleanup, OAL TV prompt debounce, and Sonos alarm sensor repair |
| `TI2B` | mobile.url public service-schema parity | `Closed` | closed by the narrow parity patch: operator docs, targeted regression coverage, post-restart smoke, and live `mobile.url` service proof |
| `TI2C` | inbox tap contract canonicalization | `Closed` | closed by backend-owned tap-contract implementation, local import-preservation regression, browser-reload activation, and live configured-route canonical/compat/rejection proof |
| `TI3` | OAL authoritative cutover and resolver cleanup | `Closed` | closed by removing package-supplied route literals from the frozen cutover set and proving authoritative writer/action/resolver behavior without widening into other OAL flows |
| `TI4` | Sonos alarm-playing authoritative pilot | `Closed` | closed by authoritative writer/action/resolver proof, duplicate rejection proof, queue cleanup, and recorded live user feedback |
| `TI4A` | Sonos evening alarm authoritative extraction | `Closed` | closed by authoritative writer/action proof, queue cleanup, restored alarm state, and recorded live user feedback |
| `TI5A` | Sonos Apple TV auto-off authoritative extraction | `Closed` | closed by package-only authoritative cutover, script+automation reload, real phone and dashboard action proof, natural context-clear proof, duplicate replay rejection, and recorded live user feedback |
| `TI5A1` | Sonos Apple TV no-response timeout ownership | `Active` | package-only follow-on is in progress to turn the governed Apple TV flow off automatically after 15 minutes of no response |
| `TI5B` | OAL TV-family compare-mode retirement | `Deferred by policy` | intentionally sequenced after the Apple TV timeout follow-on because the current TI5 bucket has been split by mechanism |
| `TI5C` | OAL unified timer authoritative cutover | `Deferred by policy` | intentionally sequenced after the TV-family retirement because unified timer is a separate mechanism |
| `TI6` | diagnostics, repairs, corruption handling | `Deferred by policy` | intentionally postponed until functional migration path is proven |

## Canonical Dependency Matrix

| From | To | Dependency type | Description |
|------|----|-----------------|-------------|
| `TI0` | `TI1` | hard | `TI1` cannot start until operator commands, YAML bootstrap, and base validation exist |
| `TI1` | `TI1A` | hard | the test harness must target a stable backend contract and live-proven runtime path |
| `TI1A` | `TI1B` | hard | productization work depends on the existing local regression harness |
| `TI1B` | `TI1C` | hard | the remaining production blocker is backend supportability, not UI work |
| `TI1C` | `TI1D` | hard | the operator/API exception tranche depends on the hardened backend |
| `TI1D` | `TI1E` | hard | broad compare-mode translation starts only after the narrow pre-UI pilot exception closes |
| `TI1E` | `TI2` | hard | UI work should consume a materially populated queue rather than a near-empty pilot queue |
| `TI2` | `TI2A` | hard | compare-mode mobile continuity repair starts only after the inbox recovery surface exists |
| `TI2A` | `TI2B` | hard | public mobile URL parity is sequenced only after the compare-mode phone UX and tap-through direction are proven |
| `TI2B` | `TI2C` | hard | durable tap-contract work starts only after the narrow `mobile.url` parity patch is closed |
| `TI2C` | `TI3` | hard | OAL authoritative cutover resumes only after backend-owned inbox tap behavior is implemented and proven |
| `TI1E` | `TI3` | hard | authoritative OAL cutover starts only after compare-mode coverage exists |
| `TI2` | `TI3` | hard | OAL pilot is not considered complete without the dashboard recovery surface |
| `TI2A` | `TI3` | hard | authoritative cutover should not start until the current-state phone UX defects are repaired |
| `TI3` | `TI4` | policy | Sonos migration follows the first successful domain pilot |
| `TI4` | `TI4A` | hard | the evening-alarm extraction follows the alarm-playing pilot because the flows are structurally different |
| `TI3` | `TI5A` | hard | Apple TV auto-off extraction waits on the OAL pilot proof and closed Sonos pilots |
| `TI4A` | `TI5A` | hard | Apple TV auto-off extraction waits until the separate evening-alarm extraction closes |
| `TI5A` | `TI5A1` | policy | the timeout ownership follow-on starts only after the governed Apple TV cutover closes |
| `TI5A1` | `TI5B` | policy | the next OAL tranche is sequenced after the Apple TV timeout follow-on closes |
| `TI5B` | `TI5C` | policy | unified timer cutover follows the TV-family compare-mode retirement |
| `TI5C` | `TI6` | policy | hardening follows the main functional rollout |

## Canonical Decision Matrix

| Area | Role | Normalized position | Owning tranche | Next promotion gate |
|------|------|---------------------|----------------|---------------------|
| Governance pack | execution authority | structurally present and synchronized enough for current program control | `TI0` | keep synced as implementation advances |
| Program ledger | normalized backlog authority | present and materially normalized for current program control | `TI0` | keep synced as tranche state changes |
| Contracts | service/event/item authority | materially proven in HA and by deterministic runtime probe for the core service path | `TI1` | keep stable while test harness is added |
| Backend runtime skeleton | integration control plane | deployed and loading in HA with literal `lock_conflict` proof recorded | `TI1` | keep stable while test harness is added |
| Deploy / check / smoke path | operator safety path | first HA/live proof is recorded and remote bootstrap patching is now governed | `TI1` | keep the path stable for future tranches |
| Local HA integration test harness | regression safety path | present with pinned requirements, repo-local venv workflow, and governed operator commands | `TI1A` | keep stable while later backend hardening lands |
| Targeted backend tests | manager/service/event protection | present for manager state transitions, service responses, config flow behavior, diagnostics redaction, repair issue lifecycle, and canonical event emission | `TI1A` | hold stable while UI/package work begins later |
| Integration productization | config entry, diagnostics, translation-backed supportability | complete and live-proven | `TI1B` | hold stable while TI1C lands |
| Corruption handling and release verification | quarantine, repairs, and governed local release gate | complete and live-proven | `TI1C` | hold stable while UI work begins later |
| API-first manual/operator pilot | key-addressable service calls, token-backed API probe, and one real flow before UI | closed and proven | `TI1D` | none |
| Compare-mode translation | mirror documented notification contexts while preserving current mobile production behavior | complete and live-proven for the documented OAL/Sonos compare set | `TI1E` | none |
| Tunet inbox card | renderer/requester | complete and live-proven | `TI2` | none |
| Compare-mode mobile continuity | preserve current phone delivery while attaching the inbox recovery surface and removing noisy receipts | complete and live-proven | `TI2A` | none |
| Public mobile URL parity | make the public `tunet_inbox.post` service accept the already-documented and runtime-supported `mobile.url` field | complete and live-proven as the narrow compatibility patch; not the durable tap-contract decision | `TI2B` | none |
| Inbox tap contract canonicalization | move inbox tap ownership into the backend so mobile deliveries open the governed inbox surface by default | complete and proven under the governed browser-reload activation path; raw `mobile.url` is compatibility-only for the effective route | `TI2C` | none |
| OAL authoritative cutover | first domain cutover after compare-mode | complete for the frozen OAL cutover set; cutover items now rely on backend-owned tap defaults | `TI3` | none |
| Sonos alarm-playing authoritative pilot | first Sonos domain cutover | complete and live-proven | `TI4` | none |
| Sonos evening alarm authoritative extraction | nightly Sonos prompt extraction from inline legacy mobile waits | complete and live-proven; the governed nightly prompt now owns phone and dashboard actions | `TI4A` | none |
| Sonos Apple TV auto-off authoritative extraction | remove the legacy confirmable-notification bridge from the Apple TV inactivity flow | complete; the Apple TV inactivity flow now closes through governed post/respond/resolve behavior and final live user feedback is recorded | `TI5A` | none |
| Sonos Apple TV no-response timeout ownership | add explicit 15-minute automatic turn-off ownership to the governed Apple TV inactivity flow | active follow-on after TI5A closeout | `TI5A1` | close `TINBOX-SONOS-4` |
| OAL TV-family compare-mode retirement | retire compare-mode writers and raw mobile handlers for remaining TV-family flows | next ready tranche after TI5A closure | `TI5B` | close `TINBOX-OAL-3` |
| OAL unified timer authoritative cutover | convert the unified timer arbiter from compare mode to authoritative ownership | intentionally sequenced after `TI5B` | `TI5C` | close `TINBOX-OAL-4` |
| Diagnostics / repairs | supportability hardening | known future need, intentionally deferred | `TI6` | `TI5C` closes |
| Enhancement tracker | external/internal planning matrix | inbox-specific matrix now exists and replaces the old dashboard-centric tracker | `TI0` | keep synced if the question set changes again |

## Canonical Open Issue Matrix

| ID | Title | Class | Priority | Status | Owner | Depends on | Required evidence to close | Next action |
|----|-------|-------|----------|--------|-------|------------|----------------------------|-------------|
| `TINBOX-GOV-1` | Artifact stack roles were implicit | `Open contract gap` | `P0` | `Closed / superseded` | `TI0` | none | docs evidence | closed by local governance pack + artifact stack rule |
| `TINBOX-GOV-2` | Program ledger did not exist | `Open contract gap` | `P0` | `Closed / superseded` | `TI0` | none | docs evidence | closed by `Docs/execution_ledger.md` |
| `TINBOX-GOV-3` | TI1-TI3 lacked tranche specs | `Open contract gap` | `P0` | `Closed / superseded` | `TI0` | none | docs evidence | closed by authoring `TI1`, `TI2`, and `TI3` tranche docs |
| `TINBOX-GOV-4` | Planning-mode policy was not explicit | `Open contract gap` | `P1` | `Closed / superseded` | `TI0` | none | docs evidence | closed in `AGENTS.md` + tranche template |
| `TINBOX-BE-1` | Repo does not expose operator commands for inbox workflows | `Open implementation blocker` | `P0` | `Closed / superseded` | `TI0` | none | static + runtime evidence | closed by `package.json` wiring for `tinbox:check`, `tinbox:deploy:integration`, and `tinbox:smoke` |
| `TINBOX-BE-2` | HA YAML bootstrap for tunet_inbox is missing | `Open implementation blocker` | `P0` | `Closed / superseded` | `TI0` | none | docs + static evidence | closed by local bootstrap wiring and governed remote config patching in the deploy helper |
| `TINBOX-BE-3` | Backend scaffold has not been statically validated end-to-end | `Validation debt` | `P0` | `Closed / superseded` | `TI0` | `TINBOX-BE-1`, `TINBOX-BE-2` | static evidence | closed by `py_compile`, `node --check`, and `npm run tinbox:check` |
| `TINBOX-BE-4` | Deploy/smoke path exists but has no recorded proof | `Validation debt` | `P1` | `Closed / superseded` | `TI1` | `TINBOX-BE-1`, `TINBOX-BE-2` | runtime + HA/live evidence | closed by deploy, config check, HA restart, and passing smoke check on 2026-04-06 |
| `TINBOX-TI1-1` | Service registration and response contract are unproven in HA | `Open implementation blocker` | `P0` | `Closed / superseded` | `TI1` | `TI0` closed | HA/live evidence | closed by live `post`, `list_items`, `respond`, `fail`, `resolve`, and `dismiss` probes |
| `TINBOX-TI1-2` | Final concurrency closure still needs an explicit acceptance decision | `Validation debt` | `P1` | `Closed / superseded` | `TI1` | `TINBOX-TI1-1` | runtime + HA/live evidence | closed by `tinbox:probe:runtime`, which proved the literal `lock_conflict` branch locally after live single-accept proof |
| `TINBOX-TEST-1` | Local Home Assistant integration test harness does not exist | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1A` | `TI1` closed | docs + static + runtime evidence | closed by `requirements_test.txt`, `pytest.ini`, repo-local venv scripts, and passing `tinbox:test:setup` |
| `TINBOX-TEST-2` | Manager/service/event behavior has no local pytest coverage | `Validation debt` | `P1` | `Closed / superseded` | `TI1A` | `TINBOX-TEST-1` | runtime evidence | closed by the targeted `tests/components/tunet_inbox/` suite and passing `tinbox:test` |
| `TINBOX-PROD-1` | Integration has no config-entry setup path or diagnostics surface | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1B` | `TI1A` closed | docs + static + runtime + HA/live evidence | closed by config-entry runtime ownership, YAML import path, diagnostics export, and live imported-entry proof |
| `TINBOX-PROD-2` | Integration supportability debt remains visible in metadata and runtime warnings | `Validation debt` | `P2` | `Closed / superseded` | `TI1B` | `TINBOX-PROD-1` | static + runtime evidence | closed by manifest cleanup, translation-backed config UI, extra backend tests, and the UTC warning fix |
| `TINBOX-PROD-3` | Malformed persisted queue items are logged and skipped instead of quarantined | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1C` | `TINBOX-PROD-1` | docs + static + runtime + HA/live evidence | closed by persisted quarantine storage, diagnostics quarantine summary, Repairs surfacing, and live post-restart smoke |
| `TINBOX-PROD-4` | Backend lacks a single governed release-verification path after productization | `Validation debt` | `P2` | `Closed / superseded` | `TI1C` | `TINBOX-PROD-3` | static + runtime evidence | closed by `tinbox:verify` and passing local release verification |
| `TINBOX-OPS-1` | Operator service path cannot target items by logical `key` | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1D` | `TI1C` | docs + static + runtime evidence | closed by key-addressable `respond`, `resolve`, `fail`, and `dismiss` plus live response proof through `tunet_inbox.respond` |
| `TINBOX-OPS-2` | No token-backed HA API probe exists for live inbox interaction | `Validation debt` | `P1` | `Closed / superseded` | `TI1D` | `TINBOX-OPS-1` | runtime + HA/live evidence | closed by `tinbox:probe:api` and passing live proof against `http://10.0.0.21:8123` |
| `TINBOX-OAL-0` | No real pre-UI migrated notification flow exists yet | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1D` | `TINBOX-OPS-1`, `TINBOX-OPS-2` | static + HA/live evidence | closed by migrating `oal_v13_post_sunset_override_reminder`, pushing it live, fixing UTC expiry, and proving post/respond/clear against the live queue |
| `TINBOX-CFG-1` | Import-sourced YAML defaults can remain shadowed by stale config-entry options until the next code reload | `Validation debt` | `P2` | `Closed / superseded` | `TI1D` | `TI1C` | runtime + HA/live evidence | closed by post-restart proof that the import-sourced `tunet_inbox` entry is `loaded` with `options: {}` |
| `TINBOX-SHADOW-1` | Broad documented notification inventory is not mirrored into `tunet_inbox` yet | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI1E` | `TI1D` | docs + static + HA/live evidence | closed by compare-mode translation of the documented OAL and Sonos notification flows |
| `TINBOX-SHADOW-2` | Compare-mode action safety is not classified per translated flow | `Open contract gap` | `P1` | `Closed / superseded` | `TI1E` | `TINBOX-SHADOW-1` | docs + runtime + HA/live evidence | closed by explicit `shadow + action-ready` vs `shadow + mirror-only` classification and live action proofs |
| `TINBOX-SHADOW-3` | Resolver ownership for broad shadow coverage is not mapped | `Open contract gap` | `P1` | `Closed / superseded` | `TI1E` | `TINBOX-SHADOW-1` | docs + HA/live evidence | closed by implemented mobile, timeout, supersession, and natural-condition resolvers across the mirrored flows |
| `TINBOX-UI-1` | Tunet inbox card does not exist | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI2` | `TI1E` closed | static + runtime + Tunet validation | closed by `tunet_inbox_card.js`, bespoke tests, full Tunet build/test, and live rehab card proof |
| `TINBOX-UI-2` | Dedicated inbox dashboard surfaces do not exist | `Open implementation blocker` | `P2` | `Closed / superseded` | `TI2` | `TINBOX-UI-1` | static + HA/live evidence | closed by rehab dashboard fixtures, standalone `tunet-inbox-yaml`, and live registration/activation proof |
| `TINBOX-MOBILE-1` | Current iOS notifications do not consistently open the inbox/dashboard location when tapped | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI2A` | `TI2` | docs + static + HA/live evidence | closed by `mobile.url` backend support, direct OAL/Sonos `data.url` wiring, and live confirmable-notification timeout proof to `/tunet-inbox-yaml/inbox` |
| `TINBOX-MOBILE-2` | Compare-mode handlers still replace actionable pushes with confirmation receipts | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI2A` | `TINBOX-MOBILE-1` | docs + static + HA/live evidence | closed by replacing the touched receipt paths with `clear_notification` and live timeout proof on the generic confirmable path |
| `TINBOX-MOBILE-3` | OAL TV prompt can retrigger too aggressively during playback-state churn | `Open implementation blocker` | `P2` | `Closed / superseded` | `TI2A` | `TINBOX-MOBILE-1` | docs + static + HA/live evidence | closed by `input_datetime.oal_last_tv_mode_prompt_notification` gating both TV prompt writers with a 5-minute debounce window |
| `TINBOX-SONOS-0` | `sensor.sonos_alarm_playing` and its current-state notification path are not stable enough after restart | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI2A` | `TI2` | docs + static + HA/live evidence | closed by replacing the fragile trigger-based sensor with a state-tracked template sensor and proving live state `False` after template reload |
| `TINBOX-OAL-1` | OAL authoritative cutover is not complete; selected flows still dual-run compare-mode and direct mobile paths | `Open implementation blocker` | `P1` | `Closed / superseded` | `TI3` | `TI1E`, `TI2`, `TI2A`, `TI2B`, `TI2C` closed | HA/live evidence | closed by removing `mobile.url` from the frozen writer set, proving override-reminder and override-expiring writers normalize to the configured route, and confirming the queue returns to `total: 0` after proof cleanup |
| `TINBOX-OAL-2` | OAL resolver ownership is not yet authoritative for the TI3 cutover set | `Open contract gap` | `P1` | `Closed / superseded` | `TI3` | `TINBOX-OAL-1` | docs + HA/live evidence | closed by dashboard and simulated-phone action proof, duplicate/stale rejection proof, override-reminder natural resolver proof, and bounded TV prompt handler/resolver proof |
| `TINBOX-CONTRACT-2` | `mobile.url` is documented and implemented in the model/mobile layer but rejected by the public `tunet_inbox.post` service schema | `Open implementation blocker` | `P0` | `Closed / superseded` | `TI2B` | `TI2A` closed | docs + static + runtime + HA/live evidence | closed by adding `url` to the public `MOBILE_SCHEMA`, documenting `mobile.url` in `services.yaml`, passing the new service-boundary regression, and live `post/list/cleanup` proof after restart |
| `TINBOX-CONTRACT-3` | Inbox tap ownership was caller-owned and the durable configured-route contract was not yet settled in backend code | `Open contract gap` | `P0` | `Closed / superseded` | `TI2C` | `TINBOX-CONTRACT-2` | docs + static + runtime + HA/live evidence | closed by backend-owned `mobile_tap_url`, legacy-route narrowing, local import-preservation regression, and live configured-route proof after browser reload |
| `TINBOX-TEST-3` | Durable tap-contract proof lacked service-boundary, adapter, and configured-route evidence | `Validation debt` | `P1` | `Closed / superseded` | `TI2C` | `TINBOX-CONTRACT-3` | runtime + HA/live evidence | closed by `npm run tinbox:test`, targeted config-flow/service/mobile tests, browser-reload activation, and live canonical/compat/rejection proof with queue cleanup |
| `TINBOX-SONOS-1` | `sonos_alarm_playing` still uses the current direct mobile path and has not been migrated to inbox-authoritative ownership | `Open implementation blocker` | `P2` | `Closed / superseded` | `TI4` | `TI3` | HA/live evidence | closed by removing the direct package-owned writer, proving real `tunet_inbox.post(send_mobile=true)` ownership, confirming phone and dashboard actions, confirming body tap opens the inbox, and returning the queue to `total: 0` after the second live test |
| `TINBOX-SONOS-2` | `sonos_evening_alarm_check` still needed live proof after the package extraction away from direct `notify.notify`, dynamic raw mobile action ids, and inline `wait_for_trigger` into a governed inbox action path | `In-flight tranche work` | `P2` | `Closed / superseded` | `TI4A` | `TI4` | HA/live evidence | closed by governed phone/dash action proof, restored alarm state, queue cleanup to `meta.total: 0`, and recorded live user feedback |
| `TINBOX-SONOS-3` | `sonos_apple_tv_auto_off` still needed HA/live proof after the package extraction away from `script.confirmable_notification` into an authoritative inbox lifecycle | `In-flight tranche work` | `P2` | `Closed / superseded` | `TI5A` | `TI4A` | HA/live evidence | closed by package deploy/reload, real phone keep/confirm proofs, dashboard-card `respond` proof, natural context-clear proof, duplicate replay rejection, and recorded live user feedback |
| `TINBOX-SONOS-4` | `sonos_apple_tv_auto_off` still lacks an owned no-response timeout action, so ignored prompts do not auto-turn the Apple TV and eligible display off after 15 minutes | `Open implementation blocker` | `P2` | `In-flight tranche work` | `TI5A1` | `TI5A` | HA/live evidence | keep the timeout owner package-only, visible in the prompt copy, and governed by the existing Apple TV lifecycle |
| `TINBOX-OAL-3` | Remaining OAL TV-family flows still dual-run compare-mode phone writers and shared raw mobile handlers after TI3's bounded synthetic TV proof | `Open implementation blocker` | `P2` | `Ready to start` | `TI5B` | `TI5A` | HA/live evidence | retire compare mode across the shared TV-family state machine with domain-real playback proof |
| `TINBOX-OAL-4` | Unified timer expiry still dual-runs compare-mode phone writers and raw mobile handlers | `Open implementation blocker` | `P2` | `Deferred by policy` | `TI5C` | `TI5B` | HA/live evidence | convert unified timer expiry to authoritative ownership after TV-family retirement |
| `TINBOX-HARDEN-1` | Diagnostics, repairs, and corruption handling are absent | `Deferred by policy` | `P3` | `Deferred by policy` | `TI6` | `TI5C` | docs + static + HA/live evidence | implement hardening tranche |
| `TINBOX-HARDEN-2` | `utcnow_iso()` emits a Python 3.12 deprecation warning in the local test suite | `Deferred by policy` | `P3` | `Closed / superseded` | `TI1B` | `TINBOX-PROD-2` | runtime evidence | closed by replacing naive `datetime.utcnow()` usage with timezone-aware UTC |
| `TINBOX-TRACK-1` | Enhancement tracker did not match the new inbox question set | `Open contract gap` | `P1` | `Closed / superseded` | `TI0` | none | docs evidence | closed by `HA-References/tunet_inbox_enhancement_matrix.md` and deprecating the old dashboard tracker |

## Tranche-Owned Open Backlog

### `TI5A1`

- close `TINBOX-SONOS-4`
- keep scope at `sonos_apple_tv_auto_off`
- do not close the follow-on without recorded live user feedback and end-of-tranche live testing

### `TI5B`

- close `TINBOX-OAL-3`
- conclude with final live user feedback and end-of-tranche testing recorded in governance

### `TI5C`

- close `TINBOX-OAL-4`
- conclude with final live user feedback and end-of-tranche testing recorded in governance

### `TI6`

- close `TINBOX-HARDEN-1`
- close `TINBOX-HARDEN-2`

## Current Highest-Confidence Risks

- `P1`: current direct phone writers now coexist with an inbox dashboard surface, so tap-through and receipt behavior must stay coherent until authoritative cutover removes the duplicate paths
- `P1`: dashboard-level family filters can make live queue items appear “missing” even when `tunet_inbox.list_items` returns them, so queue truth must be checked at the service boundary during validation
- `P2`: TI3 used a bounded synthetic TV prompt item because Apple TV playback control was intentionally left out of scope, so later TV-family tranches should still seek domain-real playback proof before deleting adjacent compare-mode paths
- `P2`: duplicate delivery was observed on `Mac's iPhone personal` while only one governed evening-alarm queue item existed; treat that as notify-group fan-out unless a later tranche explicitly narrows routing
- `P2`: stale probe items in the live queue can invalidate “queue returned to clean state” proof unless they are cleared before the next validation run

## Control Notes

- The plan is now specific enough at the program level, but execution still must be governed by a fully filled tranche doc each time.
- Plan mode is not required for every narrow edit. It is required at control points:
  - new tranche start
  - public contract change
  - allowed-file widening
  - deploy/restart/rollback ambiguity
  - ownership ambiguity
- `TI2` is closed
- `TI2A` is closed
- `TI2B` is closed
- `TI2C` is closed
- `TI3` is closed
- `TI4` is closed
- `TI4A` is closed
- `TI5A` is closed
- `TI5A1` is now active
- `TI5B` is frozen behind `TI5A1`
- `TI5C` remains frozen behind `TI5B`
- every `TI5*` closeout requires recorded final live user feedback and end-of-tranche testing

---

## Detailed Implementation Appendix (2026-04-18)

### Current repo-grounded evidence

- governance stack exists:
  - `custom_components/tunet_inbox/AGENTS.md`
  - `custom_components/tunet_inbox/plan.md`
  - `custom_components/tunet_inbox/handoff.md`
  - `custom_components/tunet_inbox/FIX_LEDGER.md`
  - `custom_components/tunet_inbox/Docs/contracts.md`
  - `custom_components/tunet_inbox/Docs/deploy_and_test.md`
  - `custom_components/tunet_inbox/Docs/TRANCHE_TEMPLATE.md`
  - `custom_components/tunet_inbox/Docs/tranches/TI0_governance_scaffold_core_backend_skeleton.md`
  - `custom_components/tunet_inbox/Docs/tranches/TI1D_api_probe_key_operator_flow_and_single_flow_oal_pilot.md`
  - `custom_components/tunet_inbox/Docs/tranches/TI2C_inbox_tap_contract_canonicalization.md`
  - `custom_components/tunet_inbox/Docs/tranches/TI3_oal_pilot_migration.md`
- backend scaffold exists:
  - `__init__.py`
  - `const.py`
  - `config_flow.py`
  - `diagnostics.py`
  - `models.py`
  - `storage.py`
  - `events.py`
  - `mobile.py`
  - `manager.py`
  - `services.py`
  - `manifest.json`
  - `services.yaml`
  - `translations/en.json`
- operator scripts exist:
  - `custom_components/tunet_inbox/scripts/check_tunet_inbox.sh`
  - `custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh`
  - `custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
- current notify-target contract is explicit:
  - config/options allow a helper entity or a direct `notify.*` service
  - blank routing is invalid
  - multi-device delivery should use a notify group

### Current unresolved evidence gaps

- the durable inbox tap contract is not yet canonicalized into backend-owned behavior; the current raw `mobile.url` field remains a temporary compatibility surface
- no authoritative OAL cutover proof exists yet; current OAL package evidence is still compare-mode plus direct iOS continuity
- no authoritative Sonos cutover proof exists yet; Sonos remains intentionally deferred behind TI3 and the first TI4 pilot is frozen to `sonos_alarm_playing`
- no compare-mode retirement proof exists yet for bridge, presence-loss, or unified-timer flows; those remain explicitly out of TI3 scope

### Recorded repo and live evidence

- static validation passed on 2026-04-06:
  - `python3 -m py_compile custom_components/tunet_inbox/*.py`
  - `node --check custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs`
  - `npm run tinbox:check`
- local pytest validation passed on 2026-04-06:
  - `npm run tinbox:test:setup`
  - `npm run tinbox:test`
  - 10 tests passed under `tests/components/tunet_inbox/`
  - later expanded to 13 passing tests after quarantine/repairs coverage
  - `npm run tinbox:verify` passed
- TI2B validation passed on 2026-04-18:
  - `python3 -m py_compile custom_components/tunet_inbox/*.py`
  - `python3 -m py_compile tests/components/tunet_inbox/*.py`
  - `npm run tinbox:check`
  - `npm run tinbox:test`
  - `21 passed` under `tests/components/tunet_inbox/`
- deploy helper now:
  - backs up remote `/config/custom_components/tunet_inbox/`
  - backs up remote `/config/configuration.yaml`
  - patches only the governed `tunet_inbox` bootstrap/logger fragments on the live host
- HA/live proof recorded on 2026-04-06:
  - remote deploy completed
  - `ha_check_config()` returned `valid`
  - HA restart succeeded
  - `npm run tinbox:smoke` passed
  - remote imported config-entry proof from `/config/.storage/core.config_entries` showed:
    - `count = 1`
    - `source = import`
    - `title = Tunet Inbox`
  - post-hardening deploy/restart proof recorded:
    - remote deploy completed again after quarantine/repairs changes
    - `ha_check_config()` returned `valid`
    - HA restart succeeded
    - first post-restart smoke attempt hit `ECONNREFUSED` during startup
    - later retry passed once HA finished starting
  - HA logs showed:
    - `Setting up tunet_inbox`
    - `tunet_inbox initialized`
  - post-restart config-entry proof recorded:
    - `ha_get_integration(query='tunet_inbox', include_options=true)` returned:
      - `state = loaded`
      - `source = import`
      - `options = {}`
- TI2B live proof recorded on 2026-04-18:
  - integration-only deploy completed
  - `ha_check_config()` returned `valid`
  - HA restart was initiated successfully
  - first post-restart smoke retry hit `ECONNREFUSED` during startup
  - later retry passed once HA finished starting
  - live `tunet_inbox.post` with `mobile.url` returned:
    - `accepted = true`
    - `result = created`
  - live `tunet_inbox.list_items` returned the stored payload with:
    - `mobile.url = "/tunet-inbox-yaml/inbox"`
  - live cleanup via `tunet_inbox.dismiss` returned:
    - `accepted = true`
    - `status = dismissed`
  - queue cleanup proof recorded:
    - `tunet_inbox.list_items` returned `meta.total = 0`
- governed live service probes recorded:
  - `post` created a no-mobile probe item
  - `list_items` returned the render-normalized item
  - `respond` rejected `item_not_found`
  - `respond` rejected `invalid_action`
  - `respond` rejected `expired`
  - `respond` accepted a valid action
  - second `respond` on the same item rejected with `not_pending`
  - `fail(return_to_pending=true)` returned the item to `pending`
  - second valid `respond` was accepted
  - `resolve(clear_mobile=false)` removed the item from the active queue
  - `dismiss` removed a second probe item from the active queue
  - timeout recovery returned a probe item from `responding` to `pending` with `last_error=handler_timeout`
  - concurrent live probes produced:
    - one accepted `respond`
    - four rejected `respond` calls with `not_pending`
  - deterministic local runtime probe produced:
    - exact `lock_conflict` response while the per-item lock was pre-held
- compare-mode package proof recorded on 2026-04-06:
  - OAL:
    - `oal_override_reminder` was previously live-proven in `TI1D`
    - post-restart `automation.oal_v14_tv_bridge_manager` produced:
      - key `oal_bridge_expiring:living_room`
      - successful `tunet_inbox.respond(action_id='OAL_BRIDGE_KEEP')`
      - empty queue afterward
    - manual `automation.oal_v13_override_expiring_soon_warning` with `skip_condition: true` produced:
      - key `oal_override_expiring:unknown`
      - successful `tunet_inbox.respond(action_id='OAL_LET_EXPIRE')`
      - empty queue afterward
    - unified timer compare-mode wiring is deployed; live time-pattern traces show the writer aborts cleanly when no expiring context exists
  - Sonos:
    - `script.evening_alarm_check_notification` produced:
      - key `sonos_evening_alarm_check:2026-04-07`
    - `script.apple_tv_auto_off_notification` produced:
      - key `sonos_apple_tv_auto_off:media_player.living_room_apple_tv`
    - `automation.sonos_alarm_playing_notification` initially exposed a real legacy notify-target defect
    - the Sonos package was patched to fall back to `notify.tunet_inbox_all_devices` when the helper contains a raw 32-character device id
    - after reload, `automation.sonos_alarm_playing_notification` produced:
      - key `sonos_alarm_playing:unknown_speaker`
      - successful `tunet_inbox.respond(action_id='SONOS_DISMISS_ALARM')`
      - empty queue afterward

### Program guidance

- do not start card work under `Dashboard/Tunet/**` until the Tunet-side control-point review for `TI2` is complete
- do not start OAL or Sonos migration until the backend service/event path is proven in HA
- do not start OAL or Sonos migration until the backend test harness exists and the targeted backend suite passes
- use the ledger as the normalized issue authority, the plan as the program order authority, and tranche docs as execution authority
