# Tunet Inbox Deploy And Test

## Architecture

```
Source:    custom_components/tunet_inbox/*.py
Docs:      custom_components/tunet_inbox/{plan.md,handoff.md,FIX_LEDGER.md}
Deploy:    /config/custom_components/tunet_inbox/
Bootstrap: targeted patch of /config/configuration.yaml for tunet_inbox YAML + logger wiring
Runtime:   single config entry (created from YAML import or UI flow)
Smoke:     HA REST service discovery + optional service invocation
```

`tunet_inbox` is a backend integration, so there is no frontend build step.
Instead, the governed workflow is:

1. static check
2. deploy integration files
3. browser-reload `Tunet Inbox` if Python changed
4. smoke-check service registration
5. only then widen to package or UI changes

## npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `tinbox:check` | `bash custom_components/tunet_inbox/scripts/check_tunet_inbox.sh` | Static validation for backend files and tied YAML |
| `tinbox:deploy:integration` | `bash custom_components/tunet_inbox/scripts/deploy_tunet_inbox.sh` | Backup + deploy the `custom_components/tunet_inbox` integration, patch governed config bootstrap on HA, and verify the remote integration payload landed under `/config/custom_components/tunet_inbox/` |
| `tinbox:test:setup` | `bash custom_components/tunet_inbox/scripts/setup_tunet_inbox_test_env.sh` | Create/update the repo-local Python test venv and install pinned HA custom-integration test deps |
| `tinbox:test` | `bash custom_components/tunet_inbox/scripts/run_tunet_inbox_pytest.sh` | Run the targeted local pytest suite under `tests/components/tunet_inbox/` |
| `tinbox:verify` | `bash custom_components/tunet_inbox/scripts/verify_tunet_inbox_release.sh` | Run the governed local backend release gate: check + test + runtime probe |
| `tinbox:probe:runtime` | `python3 custom_components/tunet_inbox/scripts/tunet_inbox_runtime_probe.py lock-conflict` | Deterministic local runtime proof for the literal `lock_conflict` manager branch |
| `tinbox:probe:api` | `node custom_components/tunet_inbox/scripts/tunet_inbox_api_probe.mjs` | Token-backed live HA probe for post/list/respond/fail/resolve using key-addressable operator calls |
| `tinbox:smoke` | `node custom_components/tunet_inbox/scripts/tunet_inbox_smoke.mjs` | Verify `tunet_inbox` services exist in HA |

## Environment Resolution

The worktree may not contain a local `.env`.

Deploy and smoke scripts must therefore resolve environment in this order:

1. `<current worktree>/.env`
2. `/home/mac/HA/implementation_10/.env`

Required values:
- `HA_SSH_HOST`
- `HA_SSH_USER`
- `HA_SSH_PASSWORD`
- `HA_LONG_LIVED_ACCESS_TOKEN` or `HA_TOKEN`

Optional values:
- `HA_URL`

If `HA_URL` is absent, derive:
- `http://${HA_SSH_HOST}:8123`

## Default Notify Target Contract

The integration config key `notify_device_helper` is historical naming, not helper-only behavior.

Accepted values:
- a helper entity whose state is a mobile-app device id
  - example: `input_text.notify_target_device_id`
- a direct `notify.*` service
  - example: `notify.tunet_inbox_all_devices`

Rejected behavior:
- blank target does not mean “all devices”
- `tunet_inbox` will fail send/clear with `notify_service_missing` if no explicit route can be resolved
- direct iOS notifications should not be removed while compare mode is active; they should carry a body-tap URL into the inbox surface

Recommended multi-device pattern:
- create a notify group in Home Assistant
- point `tunet_inbox` at that notify group explicitly

Paste-ready example:

```yaml
notify:
  - platform: group
    name: tunet_inbox_all_devices
    services:
      - action: mobile_app_iphone
      - action: mobile_app_ipad
      - action: mobile_app_macs_work_phone
```

Then use:

```yaml
tunet_inbox:
  notify_device_helper: notify.tunet_inbox_all_devices
  mobile_tap_url: /tunet-inbox-yaml/inbox
  max_pending_items: 64
  response_timeout_seconds: 30
  archive_retention_days: 3
  privacy_mode_default: false
  debug_events: false
```

Import/update rule:
- for import-sourced entries, YAML import is authoritative for overlapping config keys
- stale overlapping options must be cleared on import so an older helper target cannot silently override a newer imported notify group
- non-overlapping options such as a UI-set `mobile_tap_url` must survive import-backed restarts when YAML does not specify them

## Mobile Tap-Through Contract

While compare mode is active:

- direct package-owned actionable pushes still send to iOS
- `tunet_inbox` shadow posts must not replace those direct pushes
- current live compatibility surface:
  - `tunet_inbox.post` public service schema accepts `mobile.url`
  - the effective governed tap route is:
    - `mobile_tap_url` from integration settings when configured
    - otherwise `/tunet-inbox-yaml/inbox`
  - legacy `mobile.url` remains compatible only when it equals that effective governed route
  - `tunet_inbox`-sent pushes now carry backend-owned `data.url` based on the effective governed route
- durable contract direction:
  - backend-owned mobile delivery maps inbox intent to HA-native `data.url`
  - new callers should not introduce arbitrary route strings as the normal API

Current proof state:
- local proof exists for:
  - fallback route behavior
  - configured non-default route behavior
  - non-canonical rejection at the service boundary
- import-preservation regression exists for:
  - non-overlapping option survival in the import-backed config flow
- HA/live proof exists for:
  - fallback route behavior
  - configured non-default route behavior on the current runtime
  - browser-reload activation of the deployed import-preservation fix
  - canonical acceptance, matching legacy compatibility acceptance, and mismatched-route rejection after reload

This keeps the native iOS notification body tap as a recovery path into the inbox dashboard without requiring Browser Mod or a frontend-only action bridge.

## Static Validation

`tinbox:check` must:

- run `python3 -m py_compile` over `custom_components/tunet_inbox/*.py`
- run `python3 -m py_compile` over `tests/components/tunet_inbox/*.py`
- run `bash -n` over the inbox shell scripts
- parse `Configuration/configuration.yaml` if touched
- verify the governance docs exist
- fail fast with a non-zero exit code

## Local Test Harness

### Layout

The local inbox suite follows Home Assistant-style test structure:

```text
tests/
  conftest.py
  components/
    tunet_inbox/
      conftest.py
      test_config_flow.py
      test_diagnostics.py
      test_events.py
      test_manager.py
      test_mobile.py
      test_repairs.py
      test_services.py
```

### Dependency policy

- the local harness is pinned through `requirements_test.txt`
- the current compatible pin is:
  - `pytest-homeassistant-custom-component==0.13.205`
- this pin was selected because it resolves under the local Python 3.12 toolchain

### Venv and cache policy

- local test venv:
  - `.venv-tinbox/`
- local uv cache:
  - `.uv-cache/`
- both are repo-local and ignored by git

### Setup and execution

```bash
npm run tinbox:test:setup
npm run tinbox:test
```

`tinbox:test:setup` must:

1. use the concrete local `python3` path
2. create or replace `.venv-tinbox`
3. use the repo-local `.uv-cache`
4. install the pinned test requirements

`tinbox:test` must:

1. fail fast if `.venv-tinbox` is missing
2. export `PYTHONPATH` to the repo root
3. run only `tests/components/tunet_inbox/`

`tinbox:verify` must:

1. run `tinbox:check`
2. run `tinbox:test`
3. run `tinbox:probe:runtime`
4. fail immediately on the first failing step

## Deploy Workflow

### Integration deploy

```bash
npm run tinbox:deploy:integration
```

This must:

1. resolve `.env`
2. back up the remote `/config/custom_components/tunet_inbox/` into a local timestamped backup folder
3. back up the remote `/config/configuration.yaml`
4. patch the remote `/config/configuration.yaml` idempotently so it contains:
   - the `tunet_inbox:` bootstrap block
   - the `notify.tunet_inbox_all_devices` group definition
   - logger entries for `custom_components.tunet_inbox`
5. create the remote directory if missing
6. copy the integration files to `/config/custom_components/tunet_inbox/`
7. verify the remote integration payload exists at `/config/custom_components/tunet_inbox/` by checking sentinel files such as `manifest.json`, `__init__.py`, and `services.py`
8. print the required browser-reload instruction
9. after reload, verify that runtime ownership still converges on one config entry when YAML bootstrap is present

Scope note:
- `tinbox:deploy:integration` is the governed integration deploy helper
- it does not deploy package YAML
- package-only tranche work such as `TI3` still uses separate package deploy/reload steps
- if a helper deploy path would update multiple package files, keep tranche scope pure by backing up and copying only the touched package file for that tranche
- package-only edits that change `script:` blocks need `script.reload`
- package-only edits that change `automation:` blocks need `automation.reload`
- mixed package script/automation edits should run both reloads; TI4A proved `automation.reload` alone leaves stale script bodies loaded

### Configuration patch rule

The deploy helper must not blindly overwrite the full remote `configuration.yaml`.

Reason:
- the live HA host may legitimately contain dashboard/resource entries that are newer than the local repo snapshot
- full-file overwrite would create unrelated regression risk

Required behavior:
- patch only the governed:
  - `tunet_inbox:` bootstrap block
  - `notify.tunet_inbox_all_devices` group
  - logger entries
- make the patch idempotent
- back up the full remote file before any mutation

### Restart policy

If Python integration files changed:
- reload the `Tunet Inbox` integration from:
  - `Settings -> Devices & Services -> Integrations -> Tunet Inbox -> service row menu -> Reload`
- do not use full HA restart unless the user explicitly requests one

If only docs changed:
- no HA action required

If only package YAML changes later:
- use the package deploy/reload flow for that tranche

## Smoke Workflow

```bash
npm run tinbox:smoke
```

The smoke script must:

1. resolve `.env`
2. call `GET /api/services`
3. verify the `tunet_inbox` domain exists
4. verify these services exist:
   - `post`
   - `respond`
   - `resolve`
   - `fail`
   - `dismiss`
   - `list_items`

If any are missing, the smoke script must fail with a non-zero exit code.

## Rollback

Small rollback path:

1. copy the latest local backup of `/config/custom_components/tunet_inbox/` back to the HA host
2. if the bootstrap patch caused regressions, restore the latest local backup of `/config/configuration.yaml`
3. reload `Tunet Inbox` from the integrations UI
4. re-run `npm run tinbox:smoke`

## Acceptance Expectations

The backend is not “deployed” just because files copied successfully.
Minimum deploy acceptance:

- static check passed
- local pytest suite passed
- local `tinbox:verify` gate passed
- files copied
- `Tunet Inbox` reloaded when required
- smoke check passed
- if YAML bootstrap is in use, imported config-entry proof exists after reload
