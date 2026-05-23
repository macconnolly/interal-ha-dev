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

### Dashboard deploy gap (added 2026-05-22, RESOLVED 2026-05-22)

**Status: RESOLVED** by Phase 1, 2, and 7 of the deploy + visual review
rationalization (commits `4eae3ac`, `7484481`, `cd3d261`).

Closed by:

1. `Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs` (commit `4eae3ac`) — single source of truth for 5 dashboards (4 yaml + 1 storage). Per-entry declares mode, source, target (yaml) or url_path (storage), production flag, description.
2. `Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs` (commit `7484481`) — yaml-mode SCP + storage-mode WS `lovelace/config/save` dispatch with create-if-missing via `lovelace/dashboards/create`. Pre-flight validates ALL sources before any push; partial-failure surfacing with `--from <n>` resumability. Credentials: `sshpass -e` (no argv exposure) for SSH; `HA_LONG_LIVED_ACCESS_TOKEN` for WS.
3. npm scripts: `tunet:deploy:dashboards`, `tunet:deploy:dashboards:yaml`, `tunet:deploy:dashboards:storage`. Kept independent of `tunet:deploy:lab` per user direction.
4. `Dashboard/Tunet/Cards/v3/tests/dashboard_registry_contract.test.js` (commit `cd3d261`) — 11 failure-first assertions. Verified negative-case manually (removing the registry import from a consumer correctly fails the drift-guard).
5. Live verification (2026-05-22): yaml-mode SCP of `tunet-suite` confirmed; storage-mode WS push of `tunet-suite-storage` round-trip EXACT match between repo source and live config.

Original direction kept: yaml-mode reliable for current dashboards; storage-mode reserved for the eventual `/tunet-home` dashboard (sub-agent #3 page-architecture sub-plan). Storage UI-edits-overwritten-on-push trade-off documented and accepted.

### Visual review page-vs-production gap (added 2026-05-22, RESOLVED 2026-05-22)

**Status: RESOLVED** by Phase 3 of the deploy + visual review rationalization (commit `bccc43c`).

Closed by:

- `tunet_playwright_review.mjs` gains `--target lab|production|both`. Production target routes are derived at runtime from `TUNET_DASHBOARD_PRODUCTION_URL_PATHS` by parsing each production-flagged dashboard's YAML and enumerating views (path field; falls back to view index for storage-mode dashboards that omit path). Adding a new view to a production dashboard (or flipping a new entry to `production: true`) gets captured automatically.
- Manifest groups captures as `<runRoot>/<target>/<surface>/<route>/` for direct same-card-different-context comparison. Each route entry carries `target` and `dashboard` fields.
- npm scripts: `tunet:review:production`, `tunet:review:both`.
- Production target was initially set to `tunet-suite` (yaml-mode) in Phase 1 — corrected by Mac mid-session 2026-05-22. The actual canonical production view is `tunet-overview` (storage-mode, `/tunet-overview/overview`), backed up to `Dashboard/Tunet/tunet-overview-storage-config.yaml` from live HA on the same day. Live verification: production route resolves to 3 views (overview, g5-test, card-rehab-lab); status card captures successfully at 390x844. The `tunet-suite-config.yaml` yaml-mode dashboard is retained in the registry as a non-production reference / fallback.
- Latent defect surfaced (separate tracking): the live `/tunet-suite/overview` yaml-mode view did not render content cards in headless Chrome after the Phase 2 SCP, because the live dashboard references HACS deps that were missing from `/config/hacsfiles/`. Mac reinstalled `mini-graph-card` mid-session 2026-05-22; remaining missing-HACS investigation deferred to a follow-up cleanup. The `tunet-overview` storage-mode dashboard renders fine, so this does not block production-mirror capture against the canonical target. THIS IS THE KIND OF DEFECT THIS PHASE WAS BUILT TO SURFACE.

M1 contract update (commit `0318db2`): lab-only captures explicitly do NOT satisfy M1 for production-facing cards. `--target production` or `--target both` is required when the touched card appears in any `production: true` dashboard registry entry.

### Visual review harness grading authority (added 2026-05-22, RESOLVED 2026-05-22)

**Status: RESOLVED** by Phases 4, 5, 6 of the deploy + visual review rationalization (commits `4acfe9f`, `8cee3b0`, `0318db2`).

Closed by:

1. Phase 4 (commit `4acfe9f`) — four surgical changes that strip the harness's grading authority:
   - `routeResult.failures` / `routeResult.warnings` renamed to `routeResult.observations` (`[{ severity, name, note }]`). Data preserved, semantics downgraded from verdict to diagnostic.
   - Exit-code-1 policy removed for probe observations. Exit 1 reserved for capture-layer errors only (login broken, browser crashed, dashboard 404, unhandled exception).
   - Final-message language replaced: `"Captured N screenshot(s) across M (breakpoint, theme, route) combinations. Recorded K probe observation(s) — diagnostic notes only, not pass/fail. See manifest."` No more "Review completed with/without failures."
   - End-of-run M1 reminder block (Item 4 beyond original plan) prints procedural contract every run: agents must Read each PNG into conversation context before commit; Mac grades; harness captures.
2. Phase 5 (commit `8cee3b0`, refactored 2026-05-22) — `--share-with-user` fires an HA push notification via `notify.tunet_inbox_all_devices` (override with `--notify-service <name>`) so Mac gets a phone alert with capture count + production URL deep-link (`data.url` honored by the HA Companion app). npm script: `tunet:review:share`. The notification is the cue; Mac opens the live dashboard on his phone to grade. (Original implementation used `SEND_TO_USER:` markers + `SendUserFile(proactive)` — corrected because `SendUserFile` does not actually push to iPhone in WSL-on-laptop Claude Code sessions.)
3. Phase 6 (commit `0318db2`) — M1 in `CLAUDE.md` and `AGENTS.md` §6A tightened. New M1 banned-evidence list: harness "Captured N" lines, manifest paths without inline read-back, probe observations being "clean," lab-only captures for production-facing cards. M1 capitulation guard (Item E beyond plan) forecloses the "you're right, here's what's broken" cycle named in session_arc_popup_b_to_frame.md: when Mac flags a defect, agent asks WHAT SPECIFICALLY (typography/spacing/color/semantics/density/touch-target/truncation/alignment).
4. The MCP `browser_take_screenshot` path from the original plan-step list is intentionally NOT used here; the inline image content requirement now flows through the Read tool on captured PNGs (which returns inline image content), which is more reliable across agent sessions than the MCP tool.

Required reading before touching the review harness or M1: `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md` (the WHY).

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
