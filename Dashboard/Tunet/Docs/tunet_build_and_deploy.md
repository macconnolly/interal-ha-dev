# Tunet V3 Build And Deploy

## Architecture

```
Source:    Dashboard/Tunet/Cards/v3/*.js    (15 cards + tunet_base.js)
Registry:  Dashboard/Tunet/scripts/tunet_card_registry.mjs
Build:     Dashboard/Tunet/Cards/v3/dist/   (15 bundled outputs + source maps + manifest)
Deploy:    ${HA_SSH_USER:-root}@${HA_SSH_HOST:-10.0.0.21}:/config/www/tunet/v3/
Lab:       http://10.0.0.21:8123/tunet-card-rehab-yaml/lab
Inbox:     http://10.0.0.21:8123/tunet-inbox-yaml/inbox
```

Operational note:
- updates to an already-registered YAML dashboard can ride the normal build/deploy/resource workflow
- first activation of a brand-new YAML dashboard registration required a full Home Assistant restart in live proof; `ha_reload_core(target="core")` was not sufficient by itself

Each card is bundled with esbuild. `tunet_base.js` is inlined into each card bundle — there is no separate shared chunk. This eliminates the two-layer cache busting problem (no more `?v=` strings on import paths).

The card inventory is centralized in `Dashboard/Tunet/scripts/tunet_card_registry.mjs`. Build entrypoints, Lovelace resource sync, source rollback deploy, and visual-review changed-card detection must consume that registry rather than maintaining local hardcoded card lists. The registry currently covers 15 v3 cards, including `tunet_inbox_card.js` and `tunet_alarm_card.js`.

Deploys now also sync the live Lovelace resource URLs automatically:
- `build.mjs` writes a manifest `versionToken`
- deploy copies the built bundles to `/config/www/tunet/v3/`
- deploy then updates every matching `/local/tunet/v3/*.js?v=...` resource entry over the Home Assistant websocket API

Result: a normal deploy automatically cache-busts the frontend. Manual resource editing is no longer part of the v3 workflow.

## npm Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `tunet:build` | `node build.mjs` | One-shot build: registry entries → `dist/`, manifest, validation |
| `tunet:build:watch` | `node build.mjs --watch` | Watch `Cards/v3/` for changes, rebuild on save |
| `tunet:deploy:lab` | `node build.mjs --deploy` | Build + SCP all outputs to HA server |
| `tunet:resources:sync` | `node Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs` | Re-sync live `/local/tunet/v3/*.js?v=...` resource URLs from the current manifest |
| `tunet:review` | `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface all` | Authenticated screenshot review across rehab + storage routes |
| `tunet:review:smoke` | `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --smoke` | Fast authenticated screenshot smoke pass (`390x844`, light, first rehab view) |
| `tunet:review:changed` | `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --changed-cards --with-probes` | Authenticated screenshot + probe pass for Tunet card implementations touched in the current git working context |
| `tunet:lab:screenshot` | `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab` | Authenticated rehab-dashboard screenshot review |
| `test` | `vitest run` | Run all tests (profile resolver, sizing, bundle safety, config contract) |

## Build

```bash
npm run tunet:build
```

Output:
- 15 `.js` files in `Dashboard/Tunet/Cards/v3/dist/`
- 15 `.js.map` source maps
- `manifest.json` with build timestamp, resource `versionToken`, and file inventory

Validation runs automatically:
- `node --check` on every output file
- Missing file detection
- Exit code 1 on any failure
- `manifest.json` version token becomes the deploy-time Lovelace resource version

## Deploy

### Built outputs (normal path)

```bash
npm run tunet:deploy:lab
```

Or use the shell script directly:

```bash
./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh
```

This:
1. builds all 15 bundled outputs
2. SCPs them to `/config/www/tunet/v3/` on the HA server
3. updates the live Lovelace resource URLs to `?v=<manifest versionToken>`

That last step is the cache-busting layer. If the deploy succeeds, the frontend should request the fresh bundle URLs automatically.

### Source files (rollback path)

```bash
./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source
```

This deploys the unbundled source files + `tunet_base.js`, restoring the pre-build state. Use this if a built bundle introduces a regression.

The shell script also updates the Lovelace resource URLs after copy:
- built mode uses the `dist/manifest.json` version token
- source mode uses `TUNET_RESOURCE_VERSION` when provided, otherwise a generated `source_<timestamp>` token

### Credentials

Deploy host/user/password are read from `.env`:
```
HA_SSH_PASSWORD=password
HA_SSH_HOST=10.0.0.21   # optional (default: 10.0.0.21)
HA_SSH_USER=root        # optional (default: root)
```

Requires:
- `sshpass` installed (`apt install sshpass`)
- `.env` token for automatic resource sync:
  - `HA_LONG_LIVED_ACCESS_TOKEN` preferred
  - `HA_TOKEN` accepted as fallback

## Known Pipeline Gaps (Recorded 2026-05-22)

Implementation is deferred by user direction. These are planning items, not shipped fixes — owned by β-plumbing (root) + TI6/deploy hardening (Tinbox).

- The basic root `CLAUDE.md` Tunet shortcut list does not include `tinbox:deploy:integration`, so the frontend `tunet-inbox-card` release path and backend `custom_components/tunet_inbox` release path can drift. Full contract: `custom_components/tunet_inbox/Docs/execution_ledger.md` row `TINBOX-DEPLOY-1`.
- `build.mjs` includes the current bundled cards, but older shell deploy/resource fallback paths keep separate hardcoded card lists that omit `tunet_inbox_card.js` and/or `tunet_alarm_card.js`.
- The build/deploy path needs one canonical card registry shared by build, deploy, resource sync, docs, and tests.
- Deploy credential handling needs hardening before scripted deploys are treated as routine release infrastructure: no literal password fallback and no SSH password exposure through command argv. Full contract: `custom_components/tunet_inbox/Docs/execution_ledger.md` row `TINBOX-DEPLOY-2`.
- Current tests should be treated as smoke until failure-first coverage exists for registry drift and deploy pipeline behavior. Full contract: `custom_components/tunet_inbox/Docs/execution_ledger.md` row `TINBOX-TEST-4`.

### Dashboard deploy gap (added 2026-05-22): yaml + storage mode pipeline missing

Card JS deploys automatically (`tunet:deploy:lab` → SCP to `/config/www/tunet/v3/`). Dashboard YAML files do NOT deploy — there is no script that SCPs `Dashboard/Tunet/*.yaml` to `/config/dashboards/*.yaml` or pushes to HA's storage layer. Result: repo dashboard composition can diverge silently from live HA, and Playwright visual review of the live `/tunet-card-rehab-yaml/lab` or `/tunet-suite/overview` can show stale composition that doesn't match repo edits.

User direction (2026-05-22): both yaml-mode and storage-mode dashboards should be available paths, picked per dashboard. Current native yaml-mode is reliable and stays for `tunet-suite`, `tunet-card-rehab-yaml`, `tunet-inbox-yaml`. Storage-mode is the future path for the eventual `/tunet-home` dashboard (page-architecture sub-plan) so HA's UI editor remains functional. Trade-off for storage mode: UI edits between deploys are overwritten on next push; source-of-truth contract must be documented before the storage-mode dashboard is built.

The next bounded β-plumbing tranche should:

1. Add `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` analogous to `tunet_card_registry.mjs`, declaring each dashboard's source file, mode (`yaml`/`storage`), target path (yaml-mode) or url_path (storage-mode).
2. Add `Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs` that reads the registry and dispatches: `yaml` mode → SCP to target, `storage` mode → HA WebSocket `lovelace/config/save` call using the same auth pattern as `update_tunet_v3_resources.mjs` (`HA_LONG_LIVED_ACCESS_TOKEN` from `.env`).
3. Wire `npm run tunet:deploy:dashboards` and keep it separate from `tunet:deploy:lab` (independent scopes, easier partial-failure recovery; dashboards change less often than cards).
4. Add `Dashboard/Tunet/Cards/v3/tests/dashboard_registry_contract.test.js` as failure-first regression guard (analogous to `card_registry_contract.test.js`): every source file exists, every YAML parses, every url_path matches HA's expected dashboard registration, both consumers (yaml SCP path + storage WS push path) are wired.

### Visual review page-vs-production gap (added 2026-05-22)

Playwright currently reviews `/tunet-card-rehab-yaml/lab` (the rehab lab dashboard). Mac uses the production view (`/tunet-suite/overview` today, eventually `/tunet-home` per the page-architecture sub-plan). Different composition, different state. An "approved" lab capture is no evidence the card behaves correctly in production composition.

Coupled to the dashboard registry above: the visual review harness must add a production-mirror capture mode that runs against the live user-facing dashboard, not just the lab. The dashboard registry's `url_path` field provides the production view targets to capture.

### Visual review harness grading authority (added 2026-05-22)

Separate from the dashboard gap, the existing `tunet_playwright_review.mjs` grades its own captures with mechanical probe rules (no overflow, no blank, no clipping). The harness can pass on visibly broken cards (black play button on white, fixed-height popup with empty space, generic titles) because the probe rules don't ask "would Mac be happy." This is the failure mode named in `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`.

Fix scope (bounded β-plumbing tranche, separate from but ordered before any UI tranche):

1. Strip pass/fail verdicts from the harness. Output is "captured N screenshots at M breakpoints, manifest at X" — no judgment.
2. Add `--share-with-user` mode that calls `SendUserFile(proactive)` for each capture so screenshots reach Mac's iPhone for actual-device review.
3. Use MCP browser tools (`browser_take_screenshot`) as the agent-iteration path so screenshots return as inline image content the agent must see.
4. Patch M1 in root `CLAUDE.md` and `Dashboard/Tunet/AGENTS.md` §6A to forbid "harness passed" evidence; only inline images + user confirmation count.

Required reading before touching this work: `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md` (the WHY).

## Watch Mode

```bash
npm run tunet:build:watch
```

Watches `Dashboard/Tunet/Cards/v3/` for file changes. On save, incrementally rebuilds affected bundles. Does NOT auto-deploy — run `tunet:deploy:lab` separately after verifying the build.

## Lab Dashboard

The card rehab lab is the YAML dashboard `tunet-card-rehab-yaml`:

```
http://10.0.0.21:8123/tunet-card-rehab-yaml/lab
```

It contains one representative config for every Tunet card (all 15) plus focused review views (`states`, `surfaces`, `phone-stress`, `nav-lab`). It is the primary validation surface during card rehabilitation (CD0-CD11) and now includes governed inbox fixtures backed by `tunet_inbox`.

Architecture reference YAML: `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Lab coverage

| Card | Variants shown |
|------|---------------|
| actions | compact services strip, relaxed long-label strip, built-in mode_strip, tap_action strip |
| scenes | wrap + header, strip, relaxed wrap, mixed domains |
| lighting | tile surface, grid layout, 6 zones, adaptive toggle |
| light_tile | vertical + horizontal |
| rooms | row layout, 3 rooms |
| climate | standard + thin |
| weather | auto view/metric, toggles |
| sensor | 3 rows with sparklines |
| status | 4 compact tiles |
| media | now playing with coordinator |
| sonos | deep player |
| speaker_grid | 4 speakers, group actions |
| nav | self-referencing lab paths |
| inbox | live inbox, privacy mode, family filters |
| alarm | Sonos alarm list, quick actions |

## Testing

```bash
npm test
```

Runs vitest with jsdom environment. Test files: `Dashboard/Tunet/Cards/v3/tests/*.test.js`

Current test suites include:
- `card_registry_contract.test.js` — shared card registry covers all 15 cards and is consumed by build/deploy/resource/review tooling
- `profile_resolver.test.js` — profile resolution contract (8 tests)
- `sizing_contract.test.js` — boundary behavior for bucketFromWidth/autoSizeFromWidth (10 tests)
- `bundle_safety.test.js` — font injection and registerCard guards (5 tests)
- `config_contract.test.js` — getStubConfig → setConfig roundtrip for card editor contracts
- `editor_array_schema.test.js` — config editor schema stability checks (94 tests)
- `interaction_source_contract.test.js` — CD2 interaction vocabulary contract: hover guards, press tokens, focus-visible, transitions, tap-highlight, reduced-motion (146 tests)
- `interaction_dom_contract.test.js` — CD2 runtime DOM verification: base exports, style injection with mock hass, rendered CSS compliance (66 tests)
- `interaction_keyboard_contract.test.js` — CD3 keyboard semantics: bindButtonActivation, role/tabindex verification, Enter/Space activation, slider preservation (63 tests)
- `sizing_sections_contract.test.js` — CD4 Sections contract + later bespoke sizing guardrails (61 tests)
- `utility_strip_bespoke.test.js` — CD5 bespoke: wrap/scroll CSS, layout helper, aria-pressed, semantic header, unavailable guard (44 tests)
- `lighting_bespoke.test.js` — CD6 bespoke lighting-family regressions (17 tests)
- `rooms_bespoke.test.js` — CD7 bespoke rooms-family regressions (19 tests)

## Tranche Closure Validation (Strict)

For CD* tranche closure, run and record:

- `node --check <each changed JS file>`
- YAML parse-check for changed YAML
- `npm run tunet:build` if build outputs are affected
- `npm test`
- authenticated screenshot capture/review output at the locked breakpoints in both dark and light mode
- for any dashboard/card implementation touched in the current working context, run `npm run tunet:review:changed -- --view <affected-view>` or an equivalent `tunet_playwright_review.mjs --changed-cards --with-probes` command before declaring visual acceptance

## Visual Probes

Screenshot review is necessary but not sufficient for changed-card acceptance. Use `--with-probes` when the visual pass is meant to validate a modified card, not merely capture evidence.

Probe layers:
- generic card probes run for every selected card and fail on blank shadow DOM, uncontained horizontal overflow, or text clipping that lacks an explicit truncation/clamp mechanism
- card-family probes add deeper contracts where needed; status currently checks variant coverage on the rehab `states` view, detail/custom dropdown centering, room-row phone wrapping, temperature unit rendering, phone title parity, and bounded info-only type spread
- `--changed-cards` derives the selected cards from `git status` under `Dashboard/Tunet/Cards/v3/**` plus shared dashboard fixtures/configs; shared card context such as `tunet_base.js` or rehab dashboard YAML selects all cards because the visual blast radius is suite-wide

## Rollback

If built outputs cause a regression:

1. Deploy source files: `./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source`
2. Lovelace resources remain at `/local/tunet/v3/` — no path change needed
3. Run `npm run tunet:resources:sync -- --version <rollback_token>` if you need to force a fresh cache-busting token without rebuilding
3. Source files include `tunet_base.js` which the unbundled cards import via ES module

The built and source files share the same deploy path. Deploying source overwrites built, and vice versa. The resource URLs are re-versioned during each deploy, so rollback also refreshes the frontend cache.

## Side-Effect Safety

With esbuild bundling, `tunet_base.js` is inlined into each card bundle. Module-scoped state that was safe as a shared ES module becomes one independent copy per bundle.

Fixed:
- `injectFonts()`: uses `window.__tunetFontsInjected` (window-scoped) instead of module-scoped `let _fontsInjected`
- `registerCard()`: already guarded with `customElements.get()` — safe as-is

Benign:
- `_warnedLegacyResolverWidthHint`: dedup flag for console warnings — one copy per card bundle means bounded duplicate warnings, not a real problem
- `VALID_SIZES`: immutable `Set` — safe to duplicate
