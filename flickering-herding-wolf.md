# Tunet V3 Consistency-Driver Rehab Plan

Status: active execution plan  
Created: 2026-04-02  
Scope: `Dashboard/Tunet/Cards/v3/**`, Tunet build/deploy tooling, rehab lab, later surface assembly  
Authoring intent: replace mixed "shared pattern adoption + card-specific fixes" tranches with a consistency-first program that is specific to file, method, and current line anchors

Line-reference rule:
- All line references below are 1-based and anchored to the current repository snapshot on 2026-04-02.
- Before starting any tranche, refresh line references if the target file has moved materially.

Adopted from: `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md`
Additions merged: vitest test runner, dark+light mode screenshot requirement, cards_reference.md obligation per bespoke tranche, CD11 per-surface workflow detail

---

## 1. Plan Thesis

The existing reset plan has the right overall order, but it still mixes two different kinds of work inside the same tranche:

1. shared consistency adoption
2. bespoke card behavior work

That is the wrong execution unit.

This plan separates them.

Execution order in this plan:

1. build architecture and rehab lab
2. suite-wide shared interaction adoption
3. suite-wide shared semantics adoption
4. suite-wide shared sizing and Sections adoption
5. only then, bespoke card behavior passes
6. only then, final surface assembly

Rule:
- A shared pass may only do the same-shape work across an explicit file list.
- A bespoke pass may only solve the file-specific behavior left over after the shared passes are closed.

---

## 2. Locks Retained

These remain active in this plan:

1. `tunet-suite-storage` leads UX judgment when live validation is needed.
2. `tunet-suite-config.yaml` leads architecture truth when surface assembly resumes.
3. Climate remains the visual baseline and is not a redesign sandbox.
4. Browser Mod remains the popup direction.
5. Surface assembly order stays:
   - Living Room reference surface
   - Living Room popup
   - Overview
   - Media
   - Remaining room pages
6. Locked breakpoints stay:
   - `390x844`
   - `768x1024`
   - `1024x1366`
   - `1440x900`
7. Status remains deferred unless explicitly reopened.
8. Sections reasoning stays page -> section -> card, not viewport-first math.

---

## 3. Repository Facts This Plan Uses

### Shared base layer

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
  - `TOKENS`: line 19
  - `--motion-ui`, `--press-scale`, `--press-scale-strong`, `--focus-ring-*`: lines 83-95
  - `TILE_SURFACE`: line 1063
  - `CTRL_SURFACE`: line 1143
  - `DROPDOWN_MENU`: line 1185
  - `REDUCED_MOTION`: line 1252
  - `autoSizeFromWidth()`: line 856
  - `bucketFromWidth()`: line 863
  - `selectProfileSize()`: line 872
  - `resolveSizeProfile()`: line 893
  - `_setProfileVars()`: line 916
  - `navigatePath()`: line 1434
  - `createAxisLockedDrag()`: line 1550

### Already-good reference implementations

- `Dashboard/Tunet/Cards/v3/tunet_nav_card.js`
  - `getConfigForm()`: line 294
  - `getGridOptions()`: line 403
  - `_updateActive()`: line 501
  - `_navigate()`: line 513
  - native nav button markup: line 525
  - nav landmark: line 534

### Files with profile resolver + ResizeObserver already in place

- `tunet_light_tile.js`
  - `_applyProfile()`: line 530
  - `_setupResizeObserver()`: line 558
- `tunet_lighting_card.js`
  - `_applyProfile()`: line 1067
  - `_setupResizeObserver()`: line 1184
- `tunet_rooms_card.js`
  - `_applyProfile()`: line 843
  - `_setupResizeObserver()`: line 870
- `tunet_sensor_card.js`
  - `_applyProfile()`: line 636
  - `_setupResizeObserver()`: line 599
- `tunet_status_card.js`
  - `_applyProfile()`: line 931
  - `_setupResizeObserver()`: line 715
- `tunet_speaker_grid_card.js`
  - `_applyProfile()`: line 685
  - `_setupResizeObserver()`: line 711

### Files with known click-only or incomplete semantics

- `tunet_lighting_card.js`
  - info tile markup has `role` + `tabindex`: lines 711-712
  - click listener only: line 1366
- `tunet_climate_card.js`
  - header tile markup is plain div: line 542
  - click listener only: line 853
- `tunet_weather_card.js`
  - info tile markup is plain div: line 480
  - click listener only: line 531
- `tunet_media_card.js`
  - info tile markup is plain div: line 378
  - album art clickable: line 405
  - volume track markup: line 441
  - info tile click listener: line 808
- `tunet_speaker_grid_card.js`
  - info tile markup is plain div: line 459
  - info tile click listener: line 832
- `tunet_sonos_card.js`
  - speaker tiles created as plain divs: line 1103

### Files with real Sections-risk hotspots

- `tunet_scenes_card.js`
  - horizontal strip container / scroll behavior: line 142
- `tunet_lighting_card.js`
  - `grid-auto-rows`: line 367
  - interior clipping container: line 418
  - clipping mitigation comment: line 1291
- `tunet_rooms_card.js`
  - room tile min-height contract: line 188
  - row-mode min-height contract: line 323
  - `getGridOptions()`: line 820
- `tunet_status_card.js`
  - `grid-auto-rows`: line 189

---

## 4. Program Order

1. `CD0` — Build Architecture And Rehab Lab
2. `CD1` — Editor / Runtime Parity
3. `CD2` — Shared Interaction Adoption
4. `CD3` — Shared Semantics Adoption
5. `CD4` — Shared Sizing And Sections Adoption
6. `CD5` — Utility Strip Bespoke Pass
7. `CD6` — Lighting Bespoke Pass
8. `CD7` — Rooms Bespoke Pass
9. `CD8` — Environment Bespoke Pass
10. `CD9` — Media Bespoke Pass
11. `CD10` — Navigation Verify Pass
12. `CD11` — Status Decision Gate
13. `CD12` — Surface Assembly

The program does not skip ahead.
If a shared pass is open, bespoke work on the same concern does not start.

---

## 5. Tranches

## CD0 — Build Architecture And Rehab Lab

Purpose:
- make the esbuild move real
- stop manual deploy churn
- create the single validation surface for card rehab work

### Files

Existing files to modify:
- `package.json`
- `package-lock.json`

New files to create:
- `build.mjs`
- `vitest.config.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
- `Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh`
- `Dashboard/Tunet/Docs/tunet_build_and_deploy.md`
- `Dashboard/Tunet/Cards/v3/dist/manifest.json` (generated)

### Build contract

`build.mjs` must define, at minimum:

1. `ENTRY_POINTS`
   - `tunet_actions_card.js`
   - `tunet_scenes_card.js`
   - `tunet_light_tile.js`
   - `tunet_lighting_card.js`
   - `tunet_rooms_card.js`
   - `tunet_climate_card.js`
   - `tunet_sensor_card.js`
   - `tunet_weather_card.js`
   - `tunet_media_card.js`
   - `tunet_sonos_card.js`
   - `tunet_speaker_grid_card.js`
   - `tunet_nav_card.js`
   - `tunet_status_card.js`
2. `buildAllCards({ watch = false })`
3. `writeManifest(result)`
4. `validateBundleOutputs()`

### Output contract

- source root stays `Dashboard/Tunet/Cards/v3/`
- build output root becomes `Dashboard/Tunet/Cards/v3/dist/`
- deployed HA target stays `/config/www/tunet/v3/`
- output filenames match entry basenames
- manifest records:
  - source file
  - output file
  - build timestamp
  - version token used for Lovelace resources

### Side-effect fixes

- `tunet_base.js`: `_fontsInjected` (module-scoped flag) → `window.__tunetFontsInjected`
- `tunet_base.js`: `registerCard()` already uses `customElements.get()` guard — verify, don't change
- Audit all module-scoped `let`/`const` in tunet_base.js for bundle safety
- Dark mode detection: verify module-scoped state doesn't break when inlined

### Test runner

- Add `vitest` as devDependency
- Create `vitest.config.js`
- Migrate existing `profile_resolver.test.js` to vitest
- Test pattern: `Dashboard/Tunet/Cards/v3/tests/*.test.js`

### `package.json` scripts

Add these exact scripts:

- `tunet:build`
- `tunet:build:watch`
- `tunet:deploy:lab`
- `tunet:lab:screenshot`
- `test`

### Lab contract

`Dashboard/Tunet/tunet-card-rehab-lab.yaml` must include one representative config for:

- actions
- scenes
- light_tile
- lighting
- rooms
- climate
- sensor
- weather
- media
- sonos
- speaker_grid
- nav
- status

### Acceptance

1. `npm run tunet:build` succeeds.
2. `Dashboard/Tunet/Cards/v3/dist/` contains 13 built card outputs.
3. `node --check` passes on all built outputs.
4. `npm test` passes (migrated profile_resolver tests).
5. Lab renders all 13 cards without red card errors.
6. Playwright screenshots are captured at all 4 locked breakpoints in **both dark and light mode**.
7. Fonts injected exactly once (not 13 times).
8. `Docs/tunet_build_and_deploy.md` documents the exact build, deploy, and rollback path.

### Out of scope

- no card behavior changes
- no surface assembly
- no repo/storage reconciliation outside lab needs

---

## CD1 — Configuration Clarity And Editor Policy

Purpose:
- maximize configuration value without forcing universal UI configurability
- classify every card by config tier
- align `getConfigForm()`, `getStubConfig()`, and `setConfig()` where it matters most

This plan does not require full UI configurability for every card. It uses three configuration tiers:

1. `editor-complete`
   - common configuration path is expected to work well in the HA editor
   - `getConfigForm()`, `getStubConfig()`, and `setConfig()` must align for the common runtime path
2. `editor-lite`
   - editor covers the high-value 80%
   - advanced or legacy keys may remain YAML-only
   - YAML-only keys must be explicitly documented as such
3. `yaml-first`
   - card may expose a narrow editor surface or none at all
   - runtime complexity is intentionally not mirrored in the visual editor
   - the priority is contract clarity, not UI parity

### Tier assignments

#### Editor-complete

- `tunet_nav_card.js`
  - `getConfigForm()`: line 294
  - `getStubConfig()`: line 333
  - `setConfig()`: line 351
- `tunet_scenes_card.js`
  - `getConfigForm()`: line 337
  - `getStubConfig()`: line 378
  - `setConfig()`: line 388
- `tunet_light_tile.js`
  - `getConfigForm()`: line 871
  - `getStubConfig()`: line 892
  - `setConfig()`: line 420
- `tunet_weather_card.js`
  - `getConfigForm()`: line 373
  - `getStubConfig()`: line 405
  - `setConfig()`: line 409
- `tunet_sensor_card.js`
  - `getConfigForm()`: line 421
  - `getStubConfig()`: line 445
  - `setConfig()`: line 503

#### Editor-lite

- `tunet_lighting_card.js`
  - `getConfigForm()`: line 788
  - `getStubConfig()`: line 853
  - `setConfig()`: line 857
- `tunet_rooms_card.js`
  - `getConfigForm()`: line 696
  - `getStubConfig()`: line 718
  - `setConfig()`: line 742
- `tunet_climate_card.js`
  - `getConfigForm()`: line 668
  - `getStubConfig()`: line 722
  - `setConfig()`: line 729
- `tunet_media_card.js`
  - `getConfigForm()`: line 490
  - `getStubConfig()`: line 539
  - `setConfig()`: line 550
- `tunet_sonos_card.js`
  - `getConfigForm()`: line 578
  - `getStubConfig()`: line 618
  - `setConfig()`: line 629
- `tunet_speaker_grid_card.js`
  - `getConfigForm()`: line 518
  - `getStubConfig()`: line 565
  - `setConfig()`: line 578

#### YAML-first

- `tunet_actions_card.js`
  - `getConfigForm()`: line 296
  - `getStubConfig()`: line 314
  - `setConfig()`: line 318
  - reason: runtime `actions` model is richer than the high-value editor path
- `tunet_status_card.js`
  - `getConfigForm()`: line 755
  - `getStubConfig()`: line 790
  - `setConfig()`: line 794
  - reason: polymorphic tile types make full editor parity low-value and high-complexity

### Tier rules

For `editor-complete` cards:

1. every high-value editor field must round-trip through `setConfig()`
2. `getStubConfig()` must render cleanly in the rehab lab
3. common runtime behavior must be reachable without manual YAML editing

For `editor-lite` cards:

1. editor covers the common setup path
2. advanced and legacy runtime keys may remain YAML-only
3. YAML-only keys must be called out explicitly in docs
4. `getStubConfig()` must represent the editor path, not the full runtime superset

For `yaml-first` cards:

1. do not chase full visual editor parity
2. keep runtime config contract clear
3. keep any existing editor surface intentionally narrow
4. document what remains YAML-only and why

### Files

- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_nav_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Required work

#### Editor-complete cards

Targets:
- `tunet_nav_card.js` lines 294, 333, 351
- `tunet_scenes_card.js` lines 337, 378, 388
- `tunet_light_tile.js` lines 420, 871, 892
- `tunet_weather_card.js` lines 373, 405, 409
- `tunet_sensor_card.js` lines 421, 445, 503

Required:
1. verify editor fields round-trip through `setConfig()`
2. verify `getStubConfig()` renders cleanly in the rehab lab
3. document any deliberately unsupported runtime keys

#### Editor-lite cards

Targets:
- `tunet_lighting_card.js` lines 788, 853, 857
- `tunet_rooms_card.js` lines 696, 718, 742
- `tunet_climate_card.js` lines 668, 722, 729
- `tunet_media_card.js` lines 490, 539, 550
- `tunet_sonos_card.js` lines 578, 618, 629
- `tunet_speaker_grid_card.js` lines 518, 565, 578

Required:
1. identify the high-value editor path for each card
2. keep advanced or legacy runtime keys YAML-only where that saves complexity
3. document exact YAML-only keys and precedence rules
4. ensure `getStubConfig()` represents the editor path, not the full runtime superset

#### YAML-first cards

Targets:
- `tunet_actions_card.js` lines 296, 314, 318
- `tunet_status_card.js` lines 755, 790, 794

Required:
1. keep editor surface intentionally narrow
2. do not chase full UI parity
3. document runtime-only keys and intended authoring path

### Acceptance

1. Every card is explicitly classified as `editor-complete`, `editor-lite`, or `yaml-first`.
2. `cards_reference.md` documents editor-exposed keys, YAML-only keys, and precedence rules.
3. Every editor-complete card has a valid `getStubConfig()` → `setConfig()` → render path in the lab.
4. No card is forced into full UI configurability just because it has `getConfigForm()`.
5. `npm test` passes, `npm run tunet:build` succeeds.

### Forbidden scope

- no interaction styling cleanup yet
- no semantics retrofit yet
- no sizing or Sections work yet

---

## CD2 — Shared Interaction Adoption

Purpose:
- close motion, hover, press, and focus inconsistency across the suite before any bespoke work starts

### Files

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

Status exclusion:
- `tunet_status_card.js` is excluded from modification in this pass unless the status lock is explicitly lifted.
- `tunet_nav_card.js` is verify-only in this pass.

### Base work in `tunet_base.js`

Before touching any card, add to `tunet_base.js`:

1. Export `INTERACTIVE_SURFACE` CSS block adjacent to `TILE_SURFACE` (line 1063):
   ```css
   .interactive {
     cursor: pointer;
     user-select: none;
     -webkit-user-select: none;
     -webkit-tap-highlight-color: transparent;
     transition:
       transform var(--motion-fast, 0.12s) var(--ease-emphasized),
       box-shadow var(--motion-ui, 0.18s) var(--ease-standard),
       background var(--motion-ui, 0.18s) var(--ease-standard),
       border-color var(--motion-ui, 0.18s) var(--ease-standard),
       color var(--motion-ui, 0.18s) var(--ease-standard);
   }
   @media (hover: hover) {
     .interactive:hover { box-shadow: var(--shadow); }
   }
   .interactive:active { transform: scale(var(--press-scale, 0.97)); }
   .interactive:focus-visible {
     outline: var(--focus-ring-width, 0.125em) solid var(--focus-ring-color, var(--blue));
     outline-offset: var(--focus-ring-offset, 0.1875em);
   }
   @media (prefers-reduced-motion: reduce) {
     .interactive { transition-duration: 0.01ms !important; }
   }
   ```

2. Verify/add tokens in `TOKENS` (line 19):
   - `--disabled-opacity: 0.55` ← ADD if missing
   - `--disabled-surface-opacity: 0.35` ← ADD if missing
   - `--disabled-control-opacity: 0.38` ← ADD if missing
   - `--press-scale`, `--press-scale-strong`, `--drag-scale`, `--focus-ring-*` ← verify exist

3. Resolve `--spring` (used by sonos L252, speaker_grid L162 — NOT in TOKENS):
   - Either add `--spring` to TOKENS or replace usages with `--ease-emphasized`

### Per-card anchors and exact changes

#### `tunet_actions_card.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 216 | `transition: all .15s ease` on `.action-chip` | `transition: transform var(--motion-fast) var(--ease-emphasized), box-shadow var(--motion-ui) var(--ease-standard), background var(--motion-ui) var(--ease-standard), border-color var(--motion-ui) var(--ease-standard), color var(--motion-ui) var(--ease-standard)` |
| 222 | `.action-chip:hover { box-shadow: var(--tile-shadow-lift) }` UNGUARDED | Wrap in `@media (hover: hover) { .action-chip:hover { ... } }` |
| 223 | `.action-chip:active { transform: scale(.96) }` | `transform: scale(var(--press-scale))` |
| 224-226 | `:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px }` | `outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset)` |
| — | No `-webkit-tap-highlight-color` | Add `-webkit-tap-highlight-color: transparent` on `.action-chip` |
| — | No `prefers-reduced-motion` guard | Add `@media (prefers-reduced-motion: reduce)` guard on `:active` transform |

Card-level transition at L175 (`transition: background .3s, border-color .3s` on `.card`) is already specific — keep as-is.

#### `tunet_scenes_card.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 178 | Multi-property transition using `var(--motion-fast)`, `var(--motion-ui)`, `var(--ease-standard)` on `.scene-chip` | **KEEP** — already correct pattern with tokens |
| 189-190 | `.scene-chip:hover { box-shadow: var(--tile-shadow-lift) }` UNGUARDED | Wrap in `@media (hover: hover) { }` |
| 193-194 | `.scene-chip:active { transform: scale(0.96) }` | `transform: scale(var(--press-scale))` |
| 197-199 | `:focus-visible { outline: 2px solid var(--blue); outline-offset: 2px }` | `outline: var(--focus-ring-width) solid var(--focus-ring-color); outline-offset: var(--focus-ring-offset)` |
| — | No `-webkit-tap-highlight-color` | Add on `.scene-chip` |
| — | No `prefers-reduced-motion` guard | Add guard on `:active` transform |

#### `tunet_light_tile.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 151 | `.icon-wrap { transition: all var(--motion-ui, 0.18s) ease }` | Replace `all` with specific properties: `color var(--motion-ui) ease, transform var(--motion-ui) ease` |
| 338 | `.lt.sliding { transform: scale(1.05) }` | `transform: scale(var(--drag-scale))` |
| 85-87 | `@media (hover: hover) { .lt:hover { box-shadow: var(--shadow-up) } }` | **KEEP** — already guarded |
| 396-399 | `:focus-visible` with outline + offset | Verify uses token references; update if hardcoded |
| 78-82 | Multi-property transition on `.lt` using tokens | **KEEP** — already correct |
| — | No `prefers-reduced-motion` guard on scale | Add guard on `.lt.sliding` and any `:active` transforms |

#### `tunet_lighting_card.js` (5 transition:all instances)

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 112 | `.hdr-tile { transition: all .15s ease }` | `transition: transform var(--motion-fast) var(--ease-emphasized), box-shadow var(--motion-ui) var(--ease-standard), background var(--motion-ui) var(--ease-standard)` |
| 115 | `.hdr-tile:hover { box-shadow: var(--shadow) }` UNGUARDED | Wrap in `@media (hover: hover) { }` |
| 116 | `.hdr-tile:active { transform: scale(.98) }` | `transform: scale(var(--press-scale))` |
| 117-119 | `:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px }` | Token references |
| 135 | `.icon-wrap { transition: all .2s ease }` | Specific properties: `color var(--motion-ui) ease, transform var(--motion-ui) ease` |
| 151 | `.tile-icon-wrap { transition: all .2s ease }` | Same as icon-wrap |
| 231 | `.toggle-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) }` | `transition: transform var(--motion-ui) var(--ease-standard), background var(--motion-ui) var(--ease-standard), box-shadow var(--motion-ui) var(--ease-standard)` |
| 235 | `.mode-btn { transition: all .15s ease }` | Specific multi-property |
| 412 | `.tile-aux:active { transform: scale(0.97) }` | `transform: scale(var(--press-scale))` |
| 435-439 | `@media (hover: hover) { .l-tile:hover { ... } }` | **KEEP** — already guarded |
| 440 | `.l-tile:active { transform: scale(var(--press-scale-strong)) }` | **KEEP** — already uses token |

Climate-subsystem CSS in this file (fan-btn L191, mode-btn, mode-opt, thumb) — same treatment: replace `transition: all`, normalize scales. Thumb `scale(1.08)` at L422-423 → `var(--drag-scale)` (evaluate visual regression; if 1.05 is too subtle for climate thumb, add card-local `--drag-scale: 1.08`).

#### `tunet_rooms_card.js` (4 transition:all, 3 unguarded hovers, 4 distinct scales)

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 137 | `.section-btn { transition: all 0.15s ease }` | Multi-property |
| 139 | `.section-btn:hover { box-shadow: var(--shadow) }` UNGUARDED | `@media (hover: hover)` guard |
| 140 | `.section-btn:active { transform: scale(0.96) }` | `var(--press-scale)` |
| 202 | `.room-tile { transition: all 0.18s ease }` | Multi-property |
| 210 | `.room-tile:hover { box-shadow: var(--shadow-up) }` | Verify guard; add if missing |
| 212 | `.room-tile:active { transform: scale(0.95) }` | `var(--press-scale-strong)` |
| 213-216 | `:focus-visible { outline: 2px solid var(--blue) }` | Token references |
| 233 | `.room-tile-icon { transition: all 0.18s }` | Specific properties |
| 401 | `.room-action-btn { transition: all 0.16s ease }` | Multi-property |
| 423 | `.room-action-btn:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 426 | `.room-action-btn:active { transform: scale(0.95) }` | `var(--press-scale-strong)` |
| 446 | `.room-orb { transition: all 0.16s ease }` | Multi-property |
| 455 | `.room-orb:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 458 | `.room-orb:active { transform: scale(0.94) }` | `var(--press-scale-strong)` |

#### `tunet_climate_card.js` (GOLD STANDARD — 4 transition:all, screenshot-compare every change)

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 111 | `.hdr-tile { transition: all .15s ease }` | Multi-property (CAREFULLY) |
| 114 | `.hdr-tile:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 115 | `.hdr-tile:active { transform: scale(.98) }` | `var(--press-scale)` |
| 134 | `.hdr-icon { transition: all .2s ease }` | Specific properties |
| 190 | `.fan-btn { transition: all .15s ease }` | Multi-property |
| 192 | `.fan-btn:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 193 | `.fan-btn:active { transform: scale(.94) }` | `var(--press-scale-strong)` |
| 234 | `.mode-btn { transition: all .15s ease }` | Multi-property |
| 237 | `.mode-btn:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 238 | `.mode-btn:active { transform: scale(.97) }` | `var(--press-scale)` |
| 301 | `.mode-opt:hover { background: var(--track-bg) }` UNGUARDED | Guard (list-row pattern — hover background is correct per vocabulary §1) |
| 302 | `.mode-opt:active { transform: scale(.97) }` | `var(--press-scale)` |
| 421 | `.thumb:active { transform: translate(-50%,-50%) scale(1.08) }` | `scale(var(--drag-scale))` — if 1.05 is visually regressive, add card-local `--drag-scale: 1.08` |

**CRITICAL**: Capture Playwright baseline screenshots BEFORE any change. Compare after EACH line change.

#### `tunet_sensor_card.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 97 | `.section-action { transition: all 0.15s ease }` | Multi-property |
| 100 | `.section-action:hover { background: var(--track-bg) }` UNGUARDED | Guard (list-row hover pattern — background is correct) |
| 103 | `.section-action:active { transform: scale(0.97) }` | `var(--press-scale)` |
| 123 | `.sensor-row { transition: all 0.15s ease }` | Multi-property |
| 127 | `.sensor-row:hover { background: var(--track-bg) }` UNGUARDED | Guard |
| 130 | `.sensor-row:active { transform: scale(0.97) }` | `var(--press-scale)` |
| 133-137 | `:focus-visible { outline: 2px solid var(--blue) }` | Token references |
| 138-139 | `.sensor-row[data-interaction="none"]:hover { background: transparent }` | **PRESERVE** this guard — it disables hover on non-interactive rows |
| 159 | `.icon { transition: all 0.2s ease }` | Specific: `color var(--motion-ui) ease` |

#### `tunet_weather_card.js` (WORST a11y — ZERO focus-visible)

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 62 | `.info-tile { transition: all .15s ease }` | Multi-property |
| 65 | `.info-tile:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 66 | `.info-tile:active { transform: scale(.98) }` | `var(--press-scale)` |
| 113 | `transition: all .15s ease` (segment controls) | Multi-property |
| 180 | `transition: all .15s` (forecast elements) | Multi-property |
| — | **ZERO `:focus-visible`** anywhere | ADD `:focus-visible` with token references to `.info-tile`, segment buttons, and any interactive forecast element |

#### `tunet_media_card.js` (6+ transition:all, .90 press scales)

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 54 | `.info-tile { transition: all .15s ease }` | Multi-property |
| 56 | `.info-tile:hover { box-shadow: var(--shadow) }` UNGUARDED | Guard |
| 57 | `.info-tile:active { transform: scale(.98) }` | `var(--press-scale)` |
| 106 | `.speaker-btn { transition: all .15s ease }` | Multi-property |
| 108-109 | Unguarded hover + `.active { scale(.97) }` | Guard hover; `var(--press-scale)` |
| 166-172 | `.grp-check { transition: all .15s }` + hover/active | Multi-property; guard; token |
| 239 | `.t-btn { transition: all .15s ease }` | Multi-property |
| 243 | `.t-btn:active { transform: scale(.90) }` | `var(--press-scale-strong)` |
| 279 | `.vol-icon { transition: all .15s ease }` | Multi-property |
| 282 | `.vol-icon:active { transform: scale(.90) }` | `var(--press-scale-strong)` |
| 340 | `.vol-close { transition: all .15s ease }` | Multi-property |

#### `tunet_sonos_card.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 130 | `.t-btn { transition: all .15s ease }` | Multi-property |
| 134 | `.t-btn:active { transform: scale(.90) }` | `var(--press-scale-strong)` |
| 155 | `.source-btn { transition: all .15s ease }` | Multi-property |
| 159 | `.source-btn:active { transform: scale(.97) }` | `var(--press-scale)` |
| 252-257 | `.speaker-tile` multi-line transition using `var(--spring, ...)` | Replace `--spring` with resolved token (see base work above) |
| 386 | `.vol-icon:active { transform: scale(.9) }` | `var(--press-scale-strong)` |

#### `tunet_speaker_grid_card.js`

| Line | Current CSS | Replacement |
|------|-------------|-------------|
| 107-110 | `.info-tile { transition: all .15s ease }` + unguarded hover + `scale(.98)` | Multi-property; guard; `var(--press-scale)` |
| 162-165 | `.spk-tile` multi-line transition with `var(--spring, ...)` | Replace `--spring` with resolved token |
| 218 | `.spk-tile:hover { background: ...; box-shadow: var(--shadow) }` | Guard |
| 222 | `.spk-tile:active { transform: scale(.98) }` | `var(--press-scale)` |
| 223-226 | `:focus-visible { outline: 2px solid var(--blue) }` | Token references |
| 234 | `transition: all .2s ease` (icon element) | Specific properties |
| 400-404 | `.action-btn` transition + hover + active | Multi-property; guard; token |

**REMOVE hover translateY**: If any `.spk-tile:hover` uses `transform: translateY(-1px)` as the primary hover signal, remove it. Shadow-lift only per vocabulary §1.

### Acceptance

1. No touched file contains `transition: all`.
2. No touched hover selector remains unguarded unless hover is intentionally desktop-only and documented.
3. All touched press states use shared base tokens.
4. Reduced-motion behavior exists in the base contract and is honored by touched files.
5. `cross_card_interaction_vocabulary.md` reflects the implemented contract, not aspirational language.
6. Climate screenshots non-regressive in **both dark and light mode**.
7. Lab screenshots at all 4 breakpoints in **both dark and light mode** for all 13 cards.
8. `npm test` passes, `npm run tunet:build` succeeds.

### Forbidden scope

- no button-role retrofits yet
- no slider semantics changes yet
- no profile or Sections work yet

---

## CD3 — Shared Semantics Adoption

Purpose:
- fix repeated keyboard and click-only container debt with one semantics pass

### Files

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Decisions (all resolved — no implementer choices remain)

1. **Helper shape**: One helper: `bindButtonActivation(el, options = {})`. Sets `role="button"`, `tabindex="0"`, wires Enter/Space → `el.click()`. Does NOT add a click handler (cards already have their own). No second helper — one is sufficient.
2. **aria-pressed on action chips**: NO. Action chips use `active` class for visual state, not ARIA pressed state. Adding `aria-pressed` would require state management for each chip. Out of scope — action chips are native `<button>` and already keyboard-complete.
3. **Album art semantics**: Album art opens more-info for the transport target entity (verified at L885-889). It is NOT play/pause. Wire as `role="button"` with `bindButtonActivation`.
4. **volTrack**: DEFERRED to CD9 (media bespoke). Volume track needs `role="slider"` + arrow key handlers, which is slider retrofit work, not button semantics. CD3 forbidden scope: "do not change drag behavior."
5. **Forbidden scope clarification**: "do not redesign media or Sonos tiles" means no visual/layout/interaction-model changes. Basic semantic hardening (role, tabindex, keyboard bridge) on elements that already have click handlers IS in scope for media. Sonos is excluded entirely.

### Base helper work

Add one helper in `tunet_base.js`, adjacent to `fireEvent()` (line 1455):

```js
export function bindButtonActivation(el, options = {}) {
  if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
  if (options.label) el.setAttribute('aria-label', options.label);
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
}
```

### Current anchors and required work (refreshed post-CD2)

| File | Current anchors | Required change |
|------|-----------------|-----------------|
| `tunet_actions_card.js` | button creation line 484 | add `type="button"` to `createElement('button')` call |
| `tunet_lighting_card.js` | info-tile markup lines 736-737 (has `role="button"` + `tabindex="0"`), l-tile creation ~line 1277 | wire `bindButtonActivation` on info-tile for keydown; add `role="button"` to l-tile elements |
| `tunet_climate_card.js` | hdr-tile markup line 579, `_setupListeners()` line 888 | wire `bindButtonActivation` on hdr-tile (existing click opens more-info) |
| `tunet_weather_card.js` | info-tile markup line 502, click handler ~line 531 | wire `bindButtonActivation` on info-tile |
| `tunet_media_card.js` | info-tile line 444, album-art line 471 (click=more-info L885), vol-icon line 503 (click=toggle mute), vol-track line 507 (DEFERRED) | wire `bindButtonActivation` on info-tile, album-art, vol-icon |
| `tunet_speaker_grid_card.js` | info-tile line 480, spk-tile line 908 (`role="slider"` — PRESERVE) | wire `bindButtonActivation` on info-tile only; spk-tile is already a complete slider |
| `tunet_light_tile.js` | .lt element (dynamic), has tabindex+keydown | add `role="button"` |
| `tunet_rooms_card.js` | .room-tile (dynamic), has tabindex+keydown | add `role="button"` |
| `tunet_sensor_card.js` | .sensor-row (dynamic), has tabindex+keydown delegation | add `role="button"` (NOT on `data-interaction="none"` rows) |

### Acceptance

1. No touched file contains a click-only interactive element (primary OR secondary) without keyboard activation — this includes info tiles, album art, mute icons, and any other `cursor: pointer` element with a click handler.
2. Native buttons remain native buttons where already present.
3. Existing slider semantics stay intact:
   - `tunet_climate_card.js` thumbs (lines 648, 653) — `role="slider"`
   - `tunet_speaker_grid_card.js` spk-tiles (line 908) — `role="slider"`
4. Lab verifies Enter and Space behavior for every element wired with `bindButtonActivation` and every element with newly-added `role="button"`.
5. Sensor `data-interaction="none"` rows do NOT receive `role="button"` or keyboard activation.
6. `npm test` passes, `npm run tunet:build` succeeds.
7. Keyboard contract test suite passes (interaction_keyboard_contract.test.js).

### Forbidden scope

- do not change drag behavior in this pass
- do not add `role="slider"` or arrow-key handlers to volume tracks (CD9)
- do not visually redesign media or Sonos tiles in this pass (basic semantic hardening on media IS in scope; Sonos is excluded entirely)
- do not touch status

---

## CD4 — Shared Sizing And Sections Adoption

Purpose:
- close shared sizing drift and known Sections hotspots before unique card behavior is touched

### Sections Grid Findings (Source-Validated Contract)

These findings are binding for CD4+ sizing decisions (merged from consistency_driver_method_plan.md):

1. View layer:
   - rendered section columns are width-derived and clamped to `1..max_columns`
   - with sidebar open on non-narrow desktop, content columns are reduced by one (`max(1, columnCount - 1)`)
2. Section layer:
   - `column_span` is clamped to available content columns
3. Card layer:
   - section internal card grid is `12 * effective section column_span`
   - numeric `columns` spans that internal grid (`12` is full width only when effective section span is `1`)
   - `columns: 'full'` spans full section width regardless of section span
4. Implication for `getGridOptions()`:
   - cards have no section context at `getGridOptions()` call time, so this method supplies defaults only
   - context-specific sizing belongs in dashboard YAML/UI `grid_options` overrides
   - use `columns: 'full'` only for cards that must always span full section width

### Files

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
- `Dashboard/Tunet/Cards/v3/tests/sizing_helper.test.js` (new)
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

Verify-only:
- `tunet_climate_card.js`
- `tunet_nav_card.js`

Excluded:
- `tunet_status_card.js` unless the status lock is lifted

### Current anchors and required work

| File | Current anchors | Required change |
|------|-----------------|-----------------|
| `tunet_base.js` | `autoSizeFromWidth()` line 856, `selectProfileSize()` line 872, `resolveSizeProfile()` line 893, `_setProfileVars()` line 916 | keep the sizing contract centralized; if a replacement helper is introduced, it must replace these methods deliberately, not sit beside them |
| `tunet_light_tile.js` | `getGridOptions()` line 469, `_applyProfile()` line 530, `_setupResizeObserver()` line 558 | preserve profile selection and ResizeObserver path; make `getGridOptions()` intentional for Sections |
| `tunet_lighting_card.js` | `getGridOptions()` line 1026, `_applyProfile()` line 1067, `_setupResizeObserver()` line 1184, `_buildGrid()` line 1262, CSS hotspots at 367, 418, 1291 | document and fix the actual Sections contract: fixed row height, scroll mode, and clipping mitigation; preserve drag-safe tile geometry |
| `tunet_rooms_card.js` | `getGridOptions()` line 820, `_applyProfile()` line 843, `_setupResizeObserver()` line 870, min-height contracts at 188 and 323 | keep profile path, make layout variants intentional for Sections, and validate row vs tile variants under the same sizing contract |
| `tunet_sensor_card.js` | `getGridOptions()` line 566, `_applyProfile()` line 636, `_setupResizeObserver()` line 599 | keep current profile path and make grid hints intentional |
| `tunet_speaker_grid_card.js` | `getGridOptions()` line 660, `_applyProfile()` line 685, `_setupResizeObserver()` line 711, `_buildGrid()` line 853 | keep current profile path, verify density and drag behavior under Sections widths |
| `tunet_scenes_card.js` | strip container line 142, `getGridOptions()` line 427 | explicitly decide the Sections contract for wrap mode vs horizontal strip mode |

### Sizing helper tests

Create `Dashboard/Tunet/Cards/v3/tests/sizing_helper.test.js` covering:
- Width bucket resolution (container width → compact/standard/large)
- `tile_size` override precedence (explicit override wins)
- Resize-triggered re-resolution
- Host attribute application (`tile-size` attribute set)
- Idempotent repeat resolution

### Acceptance

1. `sections_layout_matrix.md` is updated with actual findings from the rehab lab for the touched cards.
2. No touched file relies on viewport-first sizing decisions.
3. Every touched file retains or improves `getGridOptions()` intentionally.
4. Lighting no longer depends on fragile clipping mitigation alone to stay valid in Sections.
5. Scenes explicitly documents whether horizontal strip mode is allowed in Sections or only wrap mode is allowed there.
6. Sizing helper tests pass.
7. Lab screenshots non-regressive at all 4 breakpoints in **both dark and light mode**.
8. `npm test` passes, `npm run tunet:build` succeeds.

### Forbidden scope

- no bespoke drag tuning
- no route/control contract work
- no media-specific behavior changes

---

## CD5 — Utility Strip Bespoke Pass

Purpose:
- finish the utility-strip pair only after shared motion, semantics, and Sections rules are already stable

### Files

- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### `tunet_actions_card.js`

Current anchors:
- `getConfigForm()`: line 296
- `getCardSize()`: line 374
- `getGridOptions()`: line 382
- button creation: line 418

Required work:

1. make `getGridOptions()` intentional for `variant` and `compact` states, not generic-for-all
2. keep YAML-driven action contract intact
3. if action chips have a persistent active state, expose it machine-readably; if not, leave them as plain buttons
4. `cards_reference.md` entry

### `tunet_scenes_card.js`

Current anchors:
- horizontal strip container: line 142
- `getConfigForm()`: line 337
- `getCardSize()`: line 421
- `getGridOptions()`: line 427
- header render block: line 446
- chip creation: line 494
- unavailable state: line 559

Required work:

1. decide whether the header is semantic or decorative
2. make `getCardSize()` and `getGridOptions()` intentional for `allow_wrap`
3. ensure unavailable scenes expose the correct disabled semantics without breaking current dispatch
4. `cards_reference.md` entry

### Acceptance

1. Actions and scenes both pass live HA dispatch validation.
2. Actions retains its `yaml-first` policy; scenes retains its `editor-complete` policy.
3. Their Sections contract is explicit and documented.
4. `Dashboard/Tunet/Docs/cards_reference.md` entries complete for both cards.

---

## CD6 — Lighting Bespoke Pass

Purpose:
- solve the tile-family behavior that remains after shared consistency work closes

### Files

- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### `tunet_light_tile.js`

Current anchors:
- `getGridOptions()`: line 469
- `_applyProfile()`: line 530
- `_setupResizeObserver()`: line 558
- `_updateTileUI()`: line 714
- drag block: lines 753-792
- `_handleKeyDown()`: line 809
- `getConfigForm()`: line 871

Required work:

1. preserve the current keyboard contract
2. preserve the drag/tap/long-press contract
3. keep KI-001 guard behavior intact while aligning with the shared sizing and interaction contracts
4. `cards_reference.md` entry

### `tunet_lighting_card.js`

Current anchors:
- `getConfigForm()`: line 788
- `getGridOptions()`: line 1026
- `_applyProfile()`: line 1067
- `_setupResizeObserver()`: line 1184
- `_buildGrid()`: line 1262
- info-tile click handler: line 1366
- `_setupListeners()`: line 1364
- light-grid keyboard handler: line 1391
- `_initTileDrag()`: line 1428
- `_updateTileUI()`: line 1743
- Sections hotspots: lines 367, 418, 1291

Required work:

1. preserve the existing tile slider semantics and keyboard path
2. add keyboard activation to the info tile without changing its visual role
3. make the fixed-row / clipping / scroll contract explicit and stable
4. keep adaptive toggle and manual reset behavior scoped to explicit controls
5. fix grid tile spacing: `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` at L383 caps tiles at 180px and `justify-content: center` at L389 creates dead space on both sides. Tiles should fill available section width. Evaluate `minmax(0, 1fr)` or a higher max, and verify the result doesn't break drag headroom or narrow-width density.
6. fix scroll mode left-edge clipping: tiles on the left are cut off even when scrolled all the way over. The scroll container clips at its left boundary.
7. `cards_reference.md` entry

### Acceptance

1. No regression of KI-001 drag behavior.
2. Lighting tile drag still works with mouse and touch.
3. Info tile is keyboard-complete.
4. No clipping or row-collapse appears in lab screenshots.
5. Grid tiles fill the available card width without dead-space margins at 390, 768, 1024, and 1440px.
6. Scroll mode does not clip tiles at the left edge.
7. `tunet_light_tile.js` retains its `editor-complete` policy; `tunet_lighting_card.js` retains its `editor-lite` policy.
8. `Dashboard/Tunet/Docs/cards_reference.md` entries complete for both cards.

---

## CD7 — Rooms Bespoke Pass

Purpose:
- finish the route-first room entry behavior after shared consistency work is done

### Files

- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Current anchors

- `getConfigForm()`: line 696
- `getGridOptions()`: line 820
- `_applyProfile()`: line 843
- `_setupResizeObserver()`: line 870
- room tile creation with semantics: lines 955-961
- row orb buttons: lines 965-972
- row action button: line 985
- control stop-bubbling block: lines 1018-1036
- tile keyboard activation: line 1109

### Required work

1. preserve existing room tile semantics and do not rewrite them unnecessarily
2. preserve route-first body tap and explicit sub-control ownership
3. keep pointer-stop propagation on row controls intact while shared interaction work is applied
4. validate both tile mode and row mode under the shared sizing contract
5. `cards_reference.md` entry

### Acceptance

1. Row controls never navigate the room body accidentally.
2. Room body activation stays keyboard-complete.
3. Row and tile variants both pass all locked breakpoints.
4. `tunet_rooms_card.js` retains its `editor-lite` policy.
5. `Dashboard/Tunet/Docs/cards_reference.md` entry complete.

---

## CD8 — Environment Bespoke Pass

Purpose:
- finish the remaining environment-specific behavior after the shared passes close
- do not regress the climate baseline or widen this tranche into visual redesign

### Files

- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### `tunet_climate_card.js`

Current anchors:
- `getConfigForm()`: line 668
- `getGridOptions()`: line 788
- `_setupListeners()`: line 849
- header click handler: line 853
- slider markup with role/aria: lines 611 and 616
- slider keyboard binding: lines 894-895
- `ResizeObserver`: line 898
- `_thumbKey()`: line 1296

Required work:

1. keep the measured visual baseline intact in both modes; no density, token, or layout redesign is allowed here
2. convert or harden the header tile semantics without changing baseline visuals, tap target geometry, or information hierarchy
3. preserve slider ARIA, keyboard step behavior, and thumb interaction ordering exactly
4. re-verify `getGridOptions()` and narrow-width behavior after any semantics changes
5. `cards_reference.md` entry documenting the unchanged slider contract and retained `editor-lite` policy

### `tunet_sensor_card.js`

Current anchors:
- `getConfigForm()`: line 421
- `getGridOptions()`: line 566
- `_setupResizeObserver()`: line 599
- `_applyProfile()`: line 636
- `_setupListeners()`: line 761
- row semantics: lines 709-712

Required work:

1. preserve the existing conditional button semantics
2. close only the remaining row-level and section-action polish where interaction already exists
3. ensure every interactive row-level action is keyboard-reachable and has visible focus treatment
4. do not widen this card into a redesign tranche or invent new row actions
5. `cards_reference.md` entry documenting the conditional interaction rules

### `tunet_weather_card.js`

Current anchors:
- `getConfigForm()`: line 373
- `getGridOptions()`: line 460
- info-tile markup: line 480
- click listener: line 531
- `_updateToggleControls()`: line 836

Required work:

1. decide which elements remain truly interactive; no ambiguous pointer/hover affordance may remain
2. if the header info tile stays interactive, convert it to a real button or equivalent complete semantics
3. remove misleading interactive affordance from any non-interactive container
4. preserve existing segmented-button toggles as native controls with their current behavior intact
5. ensure visible focus styling exists wherever interaction remains
6. `cards_reference.md` entry

### Acceptance

1. Climate screenshots are non-regressive against the current baseline in both dark and light mode at all 4 locked breakpoints.
2. `tunet_climate_card.js` retains its exact slider ARIA and keyboard behavior, including acceptable narrow-width layout behavior.
3. Sensor row and section actions remain keyboard-reachable where interactive and visibly focused.
4. Weather has no fake interactive containers or misleading pointer affordance left.
5. `tunet_climate_card.js` retains its `editor-lite` policy; `tunet_sensor_card.js` retains its `editor-complete` policy; `tunet_weather_card.js` retains its `editor-complete` policy.
6. `Dashboard/Tunet/Docs/cards_reference.md` entries complete for all three cards.

---

## CD9 — Media Bespoke Pass

Purpose:
- close the highest-risk interaction family only after the shared consistency work is already stable
- use this tranche for media-specific semantics and live-behavior validation, not shared-pattern redesign

### Files

- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### `tunet_media_card.js`

Current anchors:
- `getConfigForm()`: line 490
- `getGridOptions()`: line 627
- `_render()`: line 776
- `_setupListeners()`: line 804
- header info-tile markup: line 378
- album-art markup: line 405
- volume track markup: line 441
- info-tile click handler: line 808
- speaker menu button: line 392
- group/ungroup buttons created as buttons: lines 1043-1066

Required work:

1. make the header info tile keyboard-complete
2. make the album-art interaction explicit and document the chosen semantics instead of leaving them implicit
3. explicitly decide whether the volume track remains a pointer-only control or becomes a slider; if deferred, record that deferral as a tranche decision, not an omission
4. preserve existing native button controls in the speaker menu and keep group/ungroup actions keyboard-complete
5. verify coordinator and active-group behavior against live entities, not rehab-lab-only state
6. unify speaker naming with sonos card: replace `_firstWordName()` (too aggressive — "Living" loses identity) with the shared naming strategy decided in the sonos section above
7. `cards_reference.md` entry documenting YAML-only keys and chosen interaction semantics

### `tunet_sonos_card.js`

Current anchors:
- `getConfigForm()`: line 578
- `getGridOptions()`: line 705
- `_render()`: line 864
- `_setupListeners()`: line 891
- hardcoded press scales: lines 134 and 386
- source button markup: line 498
- source dropdown container: line 503
- speakers scroll container: line 508
- speaker tile creation: line 1103

Required work:

1. validate source and grouping controls for keyboard reachability using live Sonos entities
2. decide the semantic model for speaker tiles:
   - true slider
   - button with embedded volume affordance
3. explicitly validate whether horizontal speaker scrolling is acceptable inside the rehab lab and later Sections usage
4. close any still-open Sonos-specific interaction debt that remains explicitly named in the control docs
5. unify speaker naming contract across media and sonos cards:
   - sonos source button label uses full `activeSpk.name` verbatim (L1360) — overflows card at phone width when YAML sets long names like "Living Room TV Sonos Soundbar"
   - sonos `_getSpeakerShortName()` (L878) strips "Sonos", "Soundbar", "Room", "TV" etc. but is only used as fallback when `name` is not in config
   - media `_firstWordName()` (L733) is the opposite extreme — reduces to just first word ("Living")
   - decision: choose one shared naming strategy that preserves identity without overflow. Candidate: always apply `_getSpeakerShortName()` even on explicit config names, producing "Living" from "Living Room TV Sonos Soundbar" — then let the button CSS ellipsis handle remaining overflow
   - also unify the collapsed source button to constrain within card width (currently no max-width or overflow on `.source-btn` text at L152)
6. unify speaker accent color: sonos uses `--sonos-blue: #007AFF`, speaker-grid uses `--accent: #4682B4` — user prefers sonos blue
7. `cards_reference.md` entry

### `tunet_speaker_grid_card.js`

Current anchors:
- `getConfigForm()`: line 518
- `getGridOptions()`: line 660
- `_applyProfile()`: line 685
- `_setupResizeObserver()`: line 711
- `_setupListeners()`: line 829
- `_buildGrid()`: line 853
- info-tile markup: line 459
- info-tile click listener: line 832
- speaker tile slider semantics: lines 874-875
- drag helper use: line 927

Required work:

1. keep existing speaker tile slider semantics
2. make the header info tile keyboard-complete
3. remove the hover-lift pattern as the primary hover signal if it still reads as the main affordance
4. verify sizing and density behavior at mobile and desktop widths after the semantics and hover cleanup
5. preserve drag behavior and grouping actions
6. `cards_reference.md` entry

### Acceptance

1. No primary media control remains keyboard-incomplete.
2. Media album-art and volume-track semantics are explicit and documented, not accidental.
3. Sonos source and grouping interactions are keyboard-reachable with real Sonos entities.
4. Speaker-grid no longer relies on hover-lift as its primary hover affordance.
5. Live HA validation passes with real media entities and real Sonos entities, not rehab-lab-only state.
6. All three cards retain their `editor-lite` policy; YAML-only keys are documented.
7. `Dashboard/Tunet/Docs/cards_reference.md` entries complete for all three cards.

---

## CD10 — Navigation Verify Pass

Purpose:
- verify the suite reference card after the rest of the cards are stable

### Files

- `Dashboard/Tunet/Cards/v3/tunet_nav_card.js`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml`

### Current anchors

- `getConfigForm()`: line 294
- `getGridOptions()`: line 403
- `_updateActive()`: line 501
- `_navigate()`: line 513
- native button markup: line 525
- nav landmark: line 534

### Required work

1. verify active-route highlighting across overview, rooms, media, and room subviews
2. verify active state survives direct navigation, in-app route changes, and browser back/forward
3. verify safe-area behavior and footer placement on supported dashboard surfaces
4. confirm any global style or offset behavior is scoped and non-leaky outside Tunet
5. verify `getConfigForm()` in the HA editor flow
6. `cards_reference.md` entry

### Acceptance

1. Active state remains correct across route changes and browser back/forward.
2. Safe-area behavior and footer placement are correct on supported dashboard surfaces.
3. No style leakage occurs outside Tunet.
4. `tunet_nav_card.js` remains the accessibility reference implementation.
5. `tunet_nav_card.js` retains its `editor-complete` policy.
6. No new code is added unless a real failure is reproduced.
7. `Dashboard/Tunet/Docs/cards_reference.md` entry complete.

---

## CD11 — Status Decision Gate

Purpose:
- keep status from leaking into unrelated tranches

### Files

- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
- control docs only if the lock state changes

### Current anchors

- `grid-auto-rows`: line 189
- `getConfigForm()`: line 755
- `getGridOptions()`: line 906
- `_applyProfile()`: line 931
- `_buildGrid()`: line 1006
- `_bindTileAction()`: line 1162

### Rule

This pass is a gate, not an implementation tranche.

It does not start until the lock state is written explicitly into the control docs. Until that happens, no status implementation work begins here.

Possible outcomes:

1. lock preserved
   - status remains bugfix-only
   - no shared-pass backfill is applied here
   - no feature, editor, or interaction-scope expansion is allowed
2. lock lifted
   - create a separate status-only implementation plan before code starts
   - that plan must name the allowed status subtypes and behaviors in scope
   - the plan must address the 4-col Summary Matrix phone density failure: `grid-template-columns: repeat(4, minmax(0, 1fr))` at L188 renders tile names as single letters at 390px. The grid column count needs to be responsive — either via `@container` query, `auto-fill` with a minimum tile width, or a profile-driven column count that adapts to container width.
   - the plan must also address the known `height: var(--tile-row-h)` fixed-height drift at L216 (should be min-height only)
   - the plan must address dropdown tile accessible name pollution (menu rendered inside activated tile at L1081)
   - `cards_reference.md` entry

### Acceptance

1. Status scope is explicit.
2. `tunet_status_card.js` retains its `yaml-first` policy unless the lock is lifted with an explicit scope expansion.
3. No hidden status work leaks into other tranches.
4. If the lock is lifted, the separate status plan names allowed subtypes and behaviors before any code or docs mutations begin.
5. If the lock is lifted, the 4-col phone density failure must be resolved before status work is considered complete.

---

## CD12 — Surface Assembly

Purpose:
- resume final dashboard composition only after the card suite is largely stable

### Sequence

1. Living Room reference surface
2. Living Room popup
3. Overview
4. Media
5. Remaining room pages

### Per-surface workflow

1. Validate `sections_layout_matrix.md` rules at breakpoints (AGENTS.md §7)
2. Rewrite surface intent doc from scratch using:
   - live baseline
   - architecture baseline
   - target design
3. Page → section → card reasoning (AGENTS.md §7B)
4. Build on `tunet-suite-storage` (UX evaluation)
5. Mirror to `tunet-suite-config.yaml` (architecture truth)
6. Validate at 4 breakpoints in **both dark and light mode**
7. Reconcile storage ↔ YAML drift
8. Update continuity docs (`plan.md`, `FIX_LEDGER.md`, `handoff.md`)
9. User sign-off before next surface opens

### Required inputs per surface

Every surface doc must separate:

1. live baseline
2. architecture baseline
3. target design
4. target card set
5. delta from live baseline

### Surface rules

1. No surface doc may present the bad current live surface as intended design.
2. No speculative card may be treated as live baseline.
3. Surface YAML work starts only after the dependent card tranches are closed.

### Acceptance per surface

1. scan order works
2. first-touch behavior works
3. no clipping at the 4 locked breakpoints
4. repo/storage drift is reconciled deliberately
5. user signs off before the next surface opens

---

## 6. Evidence Required To Close Any Tranche

Every tranche close requires:

1. exact changed file list
2. exact validation commands run
3. exact breakpoint screenshots captured in **both dark and light mode**
4. exact live HA checks performed
5. exact remaining open risks

Minimum validation command set:

- `node --check <each changed JS file>`
- YAML parse-check for changed YAML
- `npm run tunet:build` if build outputs are affected
- `npm test`
- Playwright screenshots at all 4 locked breakpoints in **both dark and light mode**

### Cards reference documentation

Each bespoke tranche (CD4-CD10) produces or updates an entry in `Dashboard/Tunet/Docs/cards_reference.md` covering:
- every config property with type, default, accepted values
- `getConfigForm()` field inventory and UI editor limitations
- `getGridOptions()` return values
- card-specific interaction behaviors
- known limitations or caveats

---

## 7. Stop Rules

1. Shared passes do not solve bespoke behavior.
2. Bespoke passes do not reopen shared pattern design.
3. `tunet_base.js` may change only in:
   - `CD2`
   - `CD3`
   - `CD4`
   - later tranches only when explicitly listed
4. No card file enters a tranche unless it is named in that tranche.
5. No surface YAML outside the rehab lab is active before `CD12`.

---

## 8. Pre-CD2 Gate (Codex Adversarial Review Findings)

These issues must be resolved before CD2 implementation starts:

### Critical: Consolidate plan references
- Replace ALL references to `~/.claude/plans/ethereal-zooming-cherny.md` with `~/.claude/plans/flickering-herding-wolf.md`
- Files: CLAUDE.md (lines 10, 40), plan.md (line 6, 54), handoff.md, FIX_LEDGER.md, AGENTS.md, .claude/skills/tunet-agent-driver/SKILL.md
- `ethereal-zooming-cherny.md` contains stale card-family-bucket framing; `flickering-herding-wolf.md` is the approved consistency-driver plan

### High: Interaction vocabulary status contradiction
- `handoff.md:18` says "use cross_card_interaction_vocabulary.md as the binding interaction contract"
- `cross_card_interaction_vocabulary.md:5` says "Status: Draft — awaiting user review before binding"
- Fix: Update vocabulary status to "Binding — reviewed and decisions ratified Apr 3, 2026" (decisions are captured in cards_reference.md §Interaction Model Contract)

### Medium: cards_reference.md stale Known Limitations
- Media, sonos, speaker-grid entries say "speakers not in editor" in Known Limitations
- But Config Properties tables correctly show speakers as editor (object+fields+multiple)
- Fix: Remove stale "not in editor" entries from Known Limitations sections

### Medium: Deploy credential inconsistency
- build.mjs hardcodes `HA_HOST = '10.0.0.21'`; deploy script hardcodes `root@`
- Docs imply reading from .env
- Fix: Document that host/user are hardcoded; only password reads from .env

### Low: Stale test count in build docs
- `tunet_build_and_deploy.md` says 17 sizing tests; actual is 10 (suite has 156 total now)
- Fix: Update test count

## 9. Current Recommendation

CD0 and CD1 are COMPLETE. The next tranche is:

`CD2 — Shared Interaction Adoption`

Resolve the Pre-CD2 Gate items (§8) first, then execute CD2 per the plan in §5.
