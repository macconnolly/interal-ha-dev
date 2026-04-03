# Tunet V3 Build And Deploy

## Architecture

```
Source:    Dashboard/Tunet/Cards/v3/*.js    (13 cards + tunet_base.js)
Build:     Dashboard/Tunet/Cards/v3/dist/   (13 bundled outputs + source maps + manifest)
Deploy:    ${HA_SSH_USER:-root}@${HA_SSH_HOST:-10.0.0.21}:/config/www/tunet/v3/
Lab:       http://10.0.0.21:8123/tunet-overview/card-rehab-lab
```

Each card is bundled with esbuild. `tunet_base.js` is inlined into each card bundle — there is no separate shared chunk. This eliminates the two-layer cache busting problem (no more `?v=` strings on import paths).

## npm Scripts

| Script | Command | What it does |
|--------|---------|--------------|
| `tunet:build` | `node build.mjs` | One-shot build: 13 entries → `dist/`, manifest, validation |
| `tunet:build:watch` | `node build.mjs --watch` | Watch `Cards/v3/` for changes, rebuild on save |
| `tunet:deploy:lab` | `node build.mjs --deploy` | Build + SCP all outputs to HA server |
| `tunet:lab:screenshot` | — | Use Playwright MCP to capture lab screenshots |
| `test` | `vitest run` | Run all tests (profile resolver, sizing, bundle safety, config contract) |

## Build

```bash
npm run tunet:build
```

Output:
- 13 `.js` files in `Dashboard/Tunet/Cards/v3/dist/`
- 13 `.js.map` source maps
- `manifest.json` with build timestamp, resource `versionToken`, and file inventory

Validation runs automatically:
- `node --check` on every output file
- Missing file detection
- Exit code 1 on any failure

## Deploy

### Built outputs (normal path)

```bash
npm run tunet:deploy:lab
```

Or use the shell script directly:

```bash
./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh
```

This SCPs all 13 built files to `/config/www/tunet/v3/` on the HA server.

### Source files (rollback path)

```bash
./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source
```

This deploys the unbundled source files + `tunet_base.js`, restoring the pre-build state. Use this if a built bundle introduces a regression.

### Credentials

Deploy host/user/password are read from `.env`:
```
HA_SSH_PASSWORD=password
HA_SSH_HOST=10.0.0.21   # optional (default: 10.0.0.21)
HA_SSH_USER=root        # optional (default: root)
```

Requires `sshpass` installed (`apt install sshpass`).

## Watch Mode

```bash
npm run tunet:build:watch
```

Watches `Dashboard/Tunet/Cards/v3/` for file changes. On save, incrementally rebuilds affected bundles. Does NOT auto-deploy — run `tunet:deploy:lab` separately after verifying the build.

## Lab Dashboard

The card rehab lab is a Sections view on `tunet-overview`:

```
http://10.0.0.21:8123/tunet-overview/card-rehab-lab
```

It contains one representative config for every Tunet card (all 13). It is the primary validation surface during card rehabilitation (CD0-CD11).

Architecture reference YAML: `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Lab coverage

| Card | Variants shown |
|------|---------------|
| actions | default (5 chips) + mode_strip |
| scenes | compact, allow_wrap, 4 scenes |
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

## Testing

```bash
npm test
```

Runs vitest with jsdom environment. Test files: `Dashboard/Tunet/Cards/v3/tests/*.test.js`

Current test suites (368 total):
- `profile_resolver.test.js` — profile resolution contract (8 tests)
- `sizing_contract.test.js` — boundary behavior for bucketFromWidth/autoSizeFromWidth (10 tests)
- `bundle_safety.test.js` — font injection and registerCard guards (5 tests)
- `config_contract.test.js` — getStubConfig → setConfig roundtrip for all 13 cards (39 tests)
- `editor_array_schema.test.js` — config editor schema stability checks (94 tests)
- `interaction_source_contract.test.js` — CD2 interaction vocabulary contract: hover guards, press tokens, focus-visible, transitions, tap-highlight, reduced-motion (146 tests)
- `interaction_dom_contract.test.js` — CD2 runtime DOM verification: base exports, style injection with mock hass, rendered CSS compliance (66 tests)

## Tranche Closure Validation (Strict)

For CD* tranche closure, run and record:

- `node --check <each changed JS file>`
- YAML parse-check for changed YAML
- `npm run tunet:build` if build outputs are affected
- `npm test`
- Playwright screenshots at all 4 locked breakpoints in both dark and light mode

## Rollback

If built outputs cause a regression:

1. Deploy source files: `./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source`
2. Lovelace resources remain at `/local/tunet/v3/` — no path change needed
3. Source files include `tunet_base.js` which the unbundled cards import via ES module

The built and source files share the same deploy path. Deploying source overwrites built, and vice versa.

## Side-Effect Safety

With esbuild bundling, `tunet_base.js` is inlined into each of the 13 card bundles. Module-scoped state that was safe as a shared ES module becomes 13 independent copies.

Fixed:
- `injectFonts()`: uses `window.__tunetFontsInjected` (window-scoped) instead of module-scoped `let _fontsInjected`
- `registerCard()`: already guarded with `customElements.get()` — safe as-is

Benign:
- `_warnedLegacyResolverWidthHint`: dedup flag for console warnings — 13 copies means 13 possible warnings max, not a real problem
- `VALID_SIZES`: immutable `Set` — safe to duplicate
