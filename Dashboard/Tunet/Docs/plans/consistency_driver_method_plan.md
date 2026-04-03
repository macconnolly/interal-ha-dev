# Tunet V3 Consistency-Driver Rehab Plan

Status: **ACTIVE** — adopted as method-level authority (Apr 2, 2026)  
Created: 2026-04-02  
Scope: `Dashboard/Tunet/Cards/v3/**`, Tunet build/deploy tooling, rehab lab, later surface assembly  
Authoring intent: replace mixed "shared pattern adoption + card-specific fixes" tranches with a consistency-first program that is specific to file, method, and current line anchors

Line-reference rule:
- All line references below are 1-based and anchored to the current repository snapshot on 2026-04-02.
- Before starting any tranche, refresh line references if the target file has moved materially.

---

## 1. Plan Thesis

The existing reset plan has the right overall order, but it still mixes two different kinds of work inside the same tranche:

1. shared consistency adoption
2. bespoke card behavior work

That is the wrong execution unit.

This plan separates them.

Execution order in this plan:

1. build architecture and rehab lab
2. suite-wide configuration clarity and editor policy
3. suite-wide shared interaction adoption
4. suite-wide shared semantics adoption
5. suite-wide shared sizing and Sections adoption
6. only then, bespoke card behavior passes
7. only then, final surface assembly

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

## 4. Configuration Support Policy

This plan does not require full UI configurability for every card.

It uses three configuration tiers:

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

---

## 5. Program Order

1. `CD0` — Build Architecture And Rehab Lab
2. `CD1` — Configuration Clarity And Editor Policy
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

## 6. Tranches

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

### `package.json` scripts

Add these exact scripts:

- `tunet:build`
- `tunet:build:watch`
- `tunet:deploy:lab`
- `tunet:lab:screenshot`

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
4. Lab renders all 13 cards without red card errors.
5. Playwright screenshots are captured at all 4 locked breakpoints.
6. `Docs/tunet_build_and_deploy.md` documents the exact build, deploy, and rollback path.

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
3. Every editor-complete card has a valid `getStubConfig()` -> `setConfig()` -> render path in the lab.
4. No card is forced into full UI configurability just because it has `getConfigForm()`.

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

### Current anchors and required work

| File | Current anchors | Required change |
|------|-----------------|-----------------|
| `tunet_base.js` | `TOKENS` line 19, `TILE_SURFACE` line 1063, `CTRL_SURFACE` line 1143, `DROPDOWN_MENU` line 1185, `REDUCED_MOTION` line 1252 | make base the canonical source for explicit transition property sets, hover-guard pattern, press-scale token usage, focus-ring token usage, and reduced-motion behavior |
| `tunet_actions_card.js` | chip CSS lines 216-224 | replace `transition: all`, add hover guard, map active press to shared token, keep focus-visible outline but source values from base tokens |
| `tunet_scenes_card.js` | chip CSS lines 178-199 | keep explicit multi-property transition, add hover guard, normalize active press, align focus-visible to base tokens |
| `tunet_light_tile.js` | hover guard lines 85-86, `transition: all` at line 151, focus-visible line 396 | remove broad icon-wrap transition, keep guarded hover, keep existing keyboard model |
| `tunet_lighting_card.js` | lines 199-223, 303-311, 427-489, 579 | replace broad transitions, keep existing hover guard on main tile, add guard where missing, normalize press states |
| `tunet_rooms_card.js` | lines 138-141, 203-214, 402-458 | replace broad transitions, add hover guards, normalize mixed scale values |
| `tunet_climate_card.js` | lines 112-135, 191-239, 302-318, 422-424 | replace broad transitions, normalize press behavior, preserve slider visual affordance |
| `tunet_sensor_card.js` | lines 97-103, 123-159 | replace broad transitions, normalize hover/active behavior, keep interaction-none guards intact |
| `tunet_weather_card.js` | lines 62-66, 113, 180 | replace broad transitions, normalize hover/press behavior |
| `tunet_media_card.js` | lines 55-66, 107-110, 167, 240-345 | replace broad transitions, normalize button and pseudo-button motion |
| `tunet_sonos_card.js` | lines 130-159, 258, 311, 386 | replace broad transitions, normalize hardcoded press scales |
| `tunet_speaker_grid_card.js` | lines 107-115, 218-234, 403-404 | replace broad transitions, normalize hover and press behavior |

### Acceptance

1. No touched file contains `transition: all`.
2. No touched hover selector remains unguarded unless hover is intentionally desktop-only and documented.
3. All touched press states use shared base tokens.
4. Reduced-motion behavior exists in the base contract and is honored by touched files.
5. `cross_card_interaction_vocabulary.md` reflects the implemented contract, not aspirational language.

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

### Base helper work

Add exactly one reusable button-activation helper in `tunet_base.js`, adjacent to `fireEvent()` at line 1408:

- `bindButtonActivation(el, handler, options = {})`

Optional second helper only if needed by more than two files:

- `applyButtonSemantics(el, { label, tabindex = 0 } = {})`

Do not create a large helper family in this pass.

### Current anchors and required work

| File | Current anchors | Required change |
|------|-----------------|-----------------|
| `tunet_actions_card.js` | button creation line 418 | add `type = 'button'`; decide whether active state warrants `aria-pressed`; do not regress native button behavior |
| `tunet_lighting_card.js` | info-tile markup lines 711-712, click listener line 1366 | keep existing `role="button"` and `tabindex="0"`; add keyboard activation with Enter/Space through the shared helper or equivalent |
| `tunet_climate_card.js` | header tile markup line 542, `_setupListeners()` line 849, click handler line 853 | convert header tile to a real button or add `role`, `tabindex`, and keyboard activation; preserve climate baseline visuals |
| `tunet_weather_card.js` | info-tile markup line 480, click handler line 531 | convert the header info tile to a real button or accessibility-complete equivalent |
| `tunet_media_card.js` | info-tile markup line 378, album-art markup line 405, volume track markup line 441, click handler line 808 | convert header info tile to real button semantics; explicitly decide whether album art remains interactive; document whether `volTrack` becomes a slider in this pass or is deferred to media bespoke |
| `tunet_speaker_grid_card.js` | info-tile markup line 459, click handler line 832, speaker tile slider role line 874 | add real button semantics to the header info tile; preserve existing slider semantics on speaker tiles |

### Acceptance

1. No touched file contains a click-only primary container without keyboard activation.
2. Native buttons remain native buttons where already present.
3. Existing slider semantics stay intact in:
   - `tunet_climate_card.js` lines 611 and 616
   - `tunet_lighting_card.js` lines 1304-1309
   - `tunet_speaker_grid_card.js` line 874 onward
4. The lab verifies Enter and Space behavior for every newly-fixed header/info tile.

### Forbidden scope

- do not change drag behavior in this pass
- do not redesign media or Sonos tiles in this pass
- do not touch status

---

## CD4 — Shared Sizing And Sections Adoption

Purpose:
- close shared sizing drift and known Sections hotspots before unique card behavior is touched

### Files

- `Dashboard/Tunet/Cards/v3/tunet_base.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
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

### Acceptance

1. `sections_layout_matrix.md` is updated with actual findings from the rehab lab for the touched cards.
2. No touched file relies on viewport-first sizing decisions.
3. Every touched file retains or improves `getGridOptions()` intentionally.
4. Lighting no longer depends on fragile clipping mitigation alone to stay valid in Sections.
5. Scenes explicitly documents whether horizontal strip mode is allowed in Sections or only wrap mode is allowed there.

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
3. keep the `yaml-first` config policy intact
4. if action chips have a persistent active state, expose it machine-readably; if not, leave them as plain buttons

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

### Acceptance

1. Actions and scenes both pass live HA dispatch validation.
2. Actions retains its `yaml-first` policy; scenes retains its `editor-complete` policy.
3. Their Sections contract is explicit and documented.

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

### Acceptance

1. No regression of KI-001 drag behavior.
2. Lighting tile drag still works with mouse and touch.
3. Info tile is keyboard-complete.
4. No clipping or row-collapse appears in lab screenshots.

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

### Acceptance

1. Row controls never navigate the room body accidentally.
2. Room body activation stays keyboard-complete.
3. Row and tile variants both pass all locked breakpoints.

---

## CD8 — Environment Bespoke Pass

Purpose:
- finish the remaining environment-specific behavior after the shared passes close

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

1. keep the visual baseline intact
2. convert or harden the header tile semantics without changing baseline visuals
3. preserve slider ARIA and keyboard behavior exactly

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
2. close only the remaining row-level polish left after the shared passes
3. do not widen this card into a redesign tranche

### `tunet_weather_card.js`

Current anchors:
- `getConfigForm()`: line 373
- `getGridOptions()`: line 460
- info-tile markup: line 480
- click listener: line 531
- `_updateToggleControls()`: line 836

Required work:

1. decide whether the header info tile stays interactive
2. if interactive, convert it to a real button or equivalent complete semantics
3. preserve existing segmented-button toggles as native controls

### Acceptance

1. Climate screenshots are non-regressive against the current baseline.
2. Sensor remains keyboard-reachable where interactive.
3. Weather has no fake interactive containers left.

---

## CD9 — Media Bespoke Pass

Purpose:
- close the unique media interaction debt only after shared consistency work is already done

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
2. explicitly decide the semantics of album-art interaction
3. explicitly decide whether the volume track remains a pointer-only control or becomes a slider
4. preserve existing native button controls in the speaker menu

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

1. normalize hardcoded press scales
2. decide the semantic model for speaker tiles:
   - true slider
   - button with embedded volume affordance
3. explicitly validate whether horizontal speaker scrolling is acceptable inside the rehab lab and later Sections usage

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
3. remove the hover-lift pattern as the primary hover signal if it still feels like the main affordance
4. preserve drag behavior and grouping actions

### Acceptance

1. No primary media control remains keyboard-incomplete.
2. Sonos and speaker-grid tiles have an explicit semantic model, not an accidental one.
3. Live HA validation passes with real media entities.

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

1. verify active-route accuracy
2. verify browser back/forward behavior
3. verify safe-area and footer placement
4. verify no global style leakage

### Acceptance

1. `tunet_nav_card.js` remains the accessibility reference implementation.
2. No new code is added unless a real failure is reproduced.

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

This pass is a gate, not an implementation tranche, unless explicit approval lifts the lock.

Possible outcomes:

1. lock preserved
   - status remains bugfix-only
   - no shared-pass backfill is applied here
2. lock lifted
   - create a separate status-only implementation plan before code starts

### Acceptance

1. Status scope is explicit.
2. No hidden status work leaks into other tranches.

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

### Required inputs

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

## 7. Evidence Required To Close Any Tranche

Every tranche close requires:

1. exact changed file list
2. exact validation commands run
3. exact breakpoint screenshots captured
4. exact live HA checks performed
5. exact remaining open risks

Minimum validation command set:

- `node --check <each changed JS file>`
- YAML parse-check for changed YAML
- build command if build outputs are affected
- Playwright screenshots at all 4 locked breakpoints

---

## 8. Stop Rules

1. Shared passes do not solve bespoke behavior.
2. Bespoke passes do not reopen shared pattern design.
3. `tunet_base.js` may change only in:
   - `CD1`
   - `CD2`
   - `CD3`
   - later tranches only when explicitly listed
4. No card file enters a tranche unless it is named in that tranche.
5. No surface YAML outside the rehab lab is active before `CD11`.

---

## 9. Immediate Recommendation

If this plan is adopted, the next tranche is:

`CD0 — Build Architecture And Rehab Lab`

Do not start utility-strip or tile rehab before the build contract and rehab lab exist.
