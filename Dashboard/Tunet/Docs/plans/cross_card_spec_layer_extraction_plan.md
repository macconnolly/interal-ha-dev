# Cross-Card Spec Layer Extraction Plan

**Status**: AUTHORIZED for post-CD9 activation (2026-04-30 by user); architecture deepened via `tunet-architecture` claude-mem corpus query
**Authored**: 2026-04-30
**Activation rule**: CC1 starts immediately after `CD9` (Media Bespoke Pass) closes. Each subsequent pass requires explicit user authorization. The plan is filed as a parallel program to `~/.claude/plans/flickering-herding-wolf.md`; CD-tranche numbering and CC-tranche numbering coexist.
**Migration order**: tranche-closed cards first, then tranche-active, then untranched.
**Validation gate per card**: BOTH (1) Claude-driven Playwright visual review at the four locked breakpoints (390×844, 768×1024, 1024×1366, 1440×900) AND (2) user-validated live review and testing on the lab dashboard. No card lands on token enforcement without both signals.
**Vocabulary doc**: `cross_card_interaction_vocabulary.md` (v1.0, Active) is the foundation. CC4 promotes it to v2.0 once §Shape, §Type, §Icons, §Composition are added and §1–§5 are fully enforced.
**Corpus**: `tunet-architecture` (claude-mem). Now locked at **500 observations / 234k tokens** via files-filter on the umbrella project. See `cross_card_spec_layer_agent_runbook.md` for the canonical filter recipe, query path, and timeout-safe API recipe.

**Companion docs (read these too)**:
- `cross_card_spec_layer_agent_runbook.md` — operational instructions for any agent extending this plan: corpus query recipe (curl path, NOT the MCP tool — 3s cap is unreliable), workflow, source-of-truth precedence, STOP triggers.
- `cross_card_corpus_findings.md` — append-only research log of corpus-synthesized answers to seed questions on CC1–CC4 risks and v2.0 vocabulary gaps. Read before firing redundant queries.

---

## 1. Why this plan exists

The Tunet card suite has a known and growing class of cross-card visual drift that no current tranche owns. Each of the consistency-driver passes (`CD1`–`CD11`) was scoped to one card family at a time, so anything that lives between card boundaries — corner radii, icon-bg shape, hover semantics, type scale, surface composition rules — has been resolved card-by-card and is now divergent across the suite.

The proof that these are real cross-cutting concerns, not card-local concerns, is empirical: today's hover-clip bug surfaced in four different cards with the same shape (actions, scenes, lighting, sonos). The fix for one was the fix for all. The next instance of cross-cutting drift will follow the same pattern.

Concrete drift symptoms catalogued during corpus query (see §3 for evidence):

- **Corner radii** are hardcoded in each card's CSS template literal. No `--radius-tile` / `--radius-chip` / `--radius-icon-bg` / `--radius-surface` token registry exists.
- **Icon rounding and sizing** vary per card. Some cards use circles (50%), some use rounded squares.
- **Hover targets diverge.** Some cards lift via `--shadow-up`, others via `--tile-shadow-lift`, others via `--shadow`. Speaker_grid was using `translateY(-1px)` until CD2 forced the shadow-lift-only contract (obs #9813).
- **Em-anchor is not enforced top-level.** Rooms card (#10653) sets `:host { font-size: 16px }` only inside `@media (max-width: 440px)` — at other breakpoints the anchor is missing. Lighting and sonos compute padding-block 7px instead of 8px for the same reason (live-verified 2026-04-30 in the actions hover-clip closeout).
- **Typography mixes em and px fallbacks.** Rooms card row-mode uses `font-size: var(--type-row-title, 18px)` in `:host(:not([use-profiles]))` blocks while the profile-mode rules use `font-size: 0.96em` (#10653).
- **Surface composition rules are implicit.** The actions/scenes/lighting/sonos hover-clip bug (codified 2026-04-30) is one of at least five known implicit composition rules; the rest are still unwritten.

## 2. What this plan extends, not replaces

This plan extends three already-built foundations:

1. **`Dashboard/Tunet/Cards/v3/tunet_base.js` — TWO distinct token surfaces** (corpus obs #11020, #11088):
   - **CSS surface** at `L19`: `export const TOKENS` is a template literal spliced into each card's shadow DOM stylesheet. Defines tokens like `--tile-pad: 14px`, `--motion-fast`, `--ease-standard`, `--press-scale`, `--focus-ring-width: 2px` (px, not em — obs #9747), `--focus-ring-offset: 3px`, `--lift-scale: 1.03`, `--drag-scale: 1.05`, plus the typography sub-registry (rowTitleFont, rowStatusFont, timerFont, timerDisplayFont, alarmPillFont, alarmBtnFont, rowDisplayNameFont, rowDisplayStatusFont, dropdownValueFont — obs #10646).
   - **JS surface** at `L864`: `export const TOKEN_MAP` is a JS object mapping camelCase keys to profile-system CSS vars (`--_tunet-tile-pad`, `--_tunet-tile-min-h`, etc.). The profile system is **superseded as policy** (Apr 2, 2026 per `Cards/v3/CLAUDE.md`) but still active in 6 of 13 cards: light_tile, lighting, rooms, sensor, speaker_grid, status (obs #10066).
   - **Composable CSS exports**: `INTERACTIVE_SURFACE`, `TILE_SURFACE`, `CTRL_SURFACE`, `DROPDOWN_MENU`, `REDUCED_MOTION` — opt-in CSS class strings cards splice into their stylesheets (obs #11020).
   - **JS helpers**: `fireEvent`, `runCardAction`, `createAxisLockedDrag`, `navigatePath`, `bindButtonActivation` (added in CD3 per obs #9906), `selectProfileSize`, `resolveSizeProfile`, `_setProfileVars`, `clamp`, `registerCard`, `logCardVersion`, `renderConfigPlaceholder` — 17 functions total.
2. **`Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` (v1.0, Active)** — the binding interaction state contract for hover, active, focus-visible, disabled, and transitions. Already references `INTERACTIVE_SURFACE` as the proposed/landed shared primitive (obs #9895).
3. **`Dashboard/Tunet/Cards/v3/tests/helpers/css_contract_helpers.js` and `interaction_source_contract.test.js`** — the CARD_REGISTRY-driven source-level contract enforcement. CD2 closed with 146/146 source contract tests passing (obs #9826) and 66 DOM contract tests in `interaction_dom_contract.test.js`. Today's session brought the suite to 655/655.

This plan does NOT introduce a new spec doc. It expands the vocabulary doc, adds tokens to the CSS-surface `TOKENS` string in `tunet_base.js`, and grows the contract test file. The existing layered architecture is correct and load-bearing; the gap is depth and breadth, not architecture.

**Critical rule for all CC passes**: token migrations consume the CSS-string splice pattern with explicit fallbacks (e.g., `var(--tile-pad, 0.875em)`), NOT JS property access on `TOKEN_MAP`. The profile resolver path is supersedinged — do not extend it.

## 3. Architecture inventory (source-verified 2026-04-30)

This inventory was rewritten on 2026-04-30 after the adversarial architecture review (`cross_card_spec_layer_review_2026-04-30.md`) caught the previous version asserting that radius and type-scale registries did not exist when both are already in `tunet_base.js`. Every claim below is verified against current source.

### 3.1 Card structural pattern (canonical)

Every Tunet v3 card follows the same architectural shape (obs #11037 sensor as canonical example, confirmed by lighting #10456):

- `class TunetXCard extends HTMLElement` with attached shadow DOM
- `setConfig(config)` normalizes editor input → runtime model (CD1 contract)
- `set hass(hass)` triggers reactive re-render via reference-equality on relevant entity states
- `_render()` builds a stylesheet + template; appended once
- Shadow DOM stylesheet imports: card-specific styles + spliced base CSS (`TOKENS`, plus a subset of `TILE_SURFACE` / `INTERACTIVE_SURFACE` / `CTRL_SURFACE` / `DROPDOWN_MENU` / `REDUCED_MOTION` — adoption is uneven, see §3.3)
- ResizeObserver via shared `_setupResizeObserver()` / `_teardownResizeObserver()` (7 of 13 cards adopt — obs #10066) with `window.resize` fallback
- `static getConfigForm()` for editor; `static getStubConfig()` for "Add card" defaults
- `getGridOptions()` reports columns/min_columns/rows/min_rows/max_rows; ALL cards use `rows: 'auto'`; only nav uses `columns: 'full'` (obs #10454, #10066)

### 3.2 Token registry — what's actually in `tunet_base.js` today

The previous plan version asserted "Shape | NONE", "Type scale | NONE", and "Icon size | NONE". All three were factually wrong. The actual state:

| Category | Tokens already in `tunet_base.js` | Unit | Adoption today |
|---|---|---|---|
| Motion timing | `--motion-fast: 0.12s` (L82), `--motion-ui: 0.18s` (L83), `--motion-surface: 0.28s` (L84) | s | Suite-wide via CD2 |
| Easing | `--ease-standard` (L85), `--ease-emphasized` (L86) | curve | Suite-wide; `--spring` was duplicate, removed (obs #9813) |
| Press / lift / drag scale | `--press-scale: 0.97` (L87), `--press-scale-strong: 0.95` (L88), `--lift-scale: 1.03` (L89), `--drag-scale: 1.05` (L90) | unitless | Suite-wide via CD2 |
| Focus ring | `--focus-ring-color: var(--blue)` (L93), `--focus-ring-width: 2px` (L94), `--focus-ring-offset: 3px` (L95) | **px** | Suite-wide; em migration deferred per vocabulary §4 (obs #9747) |
| Disabled state | `--disabled-opacity: 0.55` (L98), `--disabled-surface-opacity: 0.35` (L99), `--disabled-control-opacity: 0.38` (L100) | unitless | Defined CD2; consumer adoption thin |
| Density (desktop) | `--card-pad: 20px` (L152), `--section-pad: 20px` (L153), `--tile-pad: 14px` (L154), `--tile-gap: 6px` (L155), `--ctrl-min-h: 42px` (L156), `--ctrl-pad-x: 12px` (L158), `--dd-option-*` (L159-161) | px | Spliced via TOKENS, partial card consumption |
| Density (mobile) | `--density-mobile-*` family (L184-201) | px | Mobile twins; swap rule at L1431-1471 (`@media (max-width: 600px)`) |
| **Shape — radii** | `--r-card: 24px` (L70), `--r-section: 32px` (L71), `--r-tile: 16px` (L72), `--r-pill: 999px` (L73), `--r-track: 14px` (L74) | **px** | Partial — see §3.4. Cards override per-card via `:host { --r-track: …; --r-tile: …; }` (lighting L115-118, media L28-30) |
| **Shape — surface blur** | `--blur-card: 24px` (L77), `--blur-section: 20px` (L78), `--blur-menu: 24px` (L79) | px | Suite-wide |
| **Type scale (desktop)** | `--type-label: 12.5px` (L173), `--type-sub: 11px` (L174), `--type-value: 18px` (L175), `--type-chip: 12.5px` (L176), `--type-row-title: 16.5px` (L177), `--type-row-status: 14.5px` (L178), `--row-line-height-title: 1.16` (L179), `--row-line-height-status: 1.14` (L180) | **px** | Partial — `--type-chip` and `--type-label` widest adoption; `--type-row-*` mostly rooms-card-specific |
| **Type scale (mobile)** | `--type-label-mobile: 13px` (L204), `--type-sub-mobile: 11.5px` (L205), `--type-value-mobile: 18px` (L206), `--type-chip-mobile: 13px` (L207), `--type-row-title-mobile: 18px` (L208), `--type-row-status-mobile: 15.5px` (L209) | **px** | Mobile twins; swap rule at L1431-1471 |
| **Icon-host registry** | `--icon-wrap-size: 44px` (L131), `--icon-wrap-size-sm: 24px` (L132), `--icon-wrap-radius: 16px` (L133), `--icon-wrap-radius-sm: 6px` (L134) | **px** | Used by tile-family icon hosts |
| Rooms-specific (em-anchored) | `--rooms-row-btn-size: 3.16em` (L162), `--rooms-row-btn-radius: 12px` (L163), `--rooms-row-btn-icon-size: 1.62em` (L164), `--rooms-row-btn-size-slim: 2.76em` (L165), `--rooms-all-toggle-min-h: 2.62em` (L167), etc. | **em + px mix** | Rooms-card only; reference for em-anchored sizing |
| Surface composition (lift-clear, etc.) | NONE | — | **Real gap — CC3 target** |

Conclusion: there is already a partial cross-card token registry covering shape, type, density, and icon-host. It is in **px** and **partially adopted** with **per-card `:host` overrides** for cards that need different values (lighting, media, status). Any new tokens that carry the same semantic role MUST reconcile with these — the previous plan's "parallel-add a `--radius-*` em family on top of `--r-*` px" approach would create competing token systems.

### 3.3 Composable CSS exports — actual import-by-card adoption

`tunet_base.js` exports five composable CSS strings. The previous plan claimed these were "adopted by some cards." `grep -rn "INTERACTIVE_SURFACE\|TILE_SURFACE\|CTRL_SURFACE\|DROPDOWN_MENU\|REDUCED_MOTION\|\.interactive\b" Cards/v3/tunet_*.js` shows the actual numbers:

| Export | Defined at | Cards that import it | Adoption |
|---|---|---|---|
| `REDUCED_MOTION` | L1397 | actions, alarm, climate, inbox, lighting, media, nav, rooms, scenes, sensor, sonos, speaker_grid, status, weather | **14 / 14 (universal)** |
| `TILE_SURFACE` | L1174 | light_tile only | **1 / 14** |
| `INTERACTIVE_SURFACE` | L1230 | none | **0 / 14** |
| `CTRL_SURFACE` | L1288 | none | **0 / 14** |
| `DROPDOWN_MENU` | L1330 | none | **0 / 14** |

CD2 (commit `7f98dec`, obs #9875, #9826) made the contract tests green by making each card's *card-local* CSS satisfy the same shape that `INTERACTIVE_SURFACE` provides — hover guards, press scale tokens, named transitions, focus-visible — but did not actually replace card-local CSS with import + composition of the primitive. **The primitive was added but never consumed.** This is the largest single hidden gap in the previous plan: what was framed as "completion" (CC4 = "migration completion") is in fact the foundational adoption pass and must run first.

### 3.4 Per-card divergence map (verified)

Risk classifications below are derived from verified source state, not just CD2's pre-fix risk table.

| Card | Lines | `:host` font-size 16px? | Uses `--r-*`? | Hardcoded `border-radius` literals | Imports primitives? |
|---|---|---|---|---|---|
| `tunet_actions_card` | 597 | scoped (L287, inside `@media (max-width: 768px)`) | no | `1.25em`, `0.875em` × 2 (em — different system) | REDUCED_MOTION |
| `tunet_alarm_card` | — | (separate SA program) | uses `--r-section` | minimal | REDUCED_MOTION |
| `tunet_climate_card` | — | none detected | uses `--r-tile`, `--r-track` | 6px, 10px × 3, 11px, 999px × 4, 2px, 1px | REDUCED_MOTION |
| `tunet_inbox_card` | — | top-level (L38-40) | no | `1em`, `1.15em` × 3, `0.95em`, `0.92em`, `999px` × 2 (em — different system) | REDUCED_MOTION |
| `tunet_light_tile` | 921 | none at top-level (no font-size in `:host`) | no | (uses `--_tunet-display-icon-glyph` layered tokens) | TILE_SURFACE, REDUCED_MOTION |
| `tunet_lighting_card` | 1980 | none top-level; sets inside dialog scope (L538) | **overrides** `--r-track: 999px`, `--r-tile: 22px` (L115-118) | minimal | REDUCED_MOTION |
| `tunet_media_card` | — | none detected | uses `--r-track`; **overrides** `--r-track: 4px` (L28-30) | 6px × 2, 8px, 9px × 2, 10px × 5, 12px, 18px (no var) | REDUCED_MOTION |
| `tunet_nav_card` | — | top-level (L42-44) | no | 16px, 22px, 28px (px hardcoded) | REDUCED_MOTION |
| `tunet_rooms_card` | — | scoped (L615) — needs verification whether top-level too | no | (mostly em + scoped px fallbacks per obs #10653) | REDUCED_MOTION |
| `tunet_scenes_card` | — | none in main `:host`; tile-shadow tokens only | no | (em values — different system) | REDUCED_MOTION |
| `tunet_sensor_card` | — | top-level (L25-27) | uses `--r-section`, `calc(var(--r-icon) * 0.72)` (note: `--r-icon` not in base — gap) | minimal | REDUCED_MOTION |
| `tunet_sonos_card` | — | none detected | no | (variable mix; `--accent` system) | REDUCED_MOTION |
| `tunet_speaker_grid_card` | — | none detected | uses `--r-tile`, `--r-track`, `--r-pill` actively | mostly tokenized, minor literals | REDUCED_MOTION |
| `tunet_status_card` | — | none detected | uses `var(--_tunet-tile-radius, 0.875em)` profile fallback | (G3S locked) | REDUCED_MOTION |
| `tunet_weather_card` | — | none detected | no | 6px, 10px, 11px, 999px × 3 | REDUCED_MOTION |

Cards with the **most reconciliation work** for shape: `actions`, `inbox`, `weather`, `nav`, `media` (none use `--r-*`).
Cards with the **least** for shape: `speaker_grid`, `sensor`, `alarm` (already on tokens).
Cards lacking the **em-anchor** entirely: `light_tile`, `lighting`, `media`, `sonos`, `speaker_grid`, `weather`, `climate` (more than half the suite).
Cards with **scoped** anchor (passes by accident at the right breakpoint): `actions` (L287, inside `@media`), `rooms` (L615, needs further verification).
Cards with **proper top-level** anchor: `inbox`, `nav`, `sensor`.

This per-card data drives the §4 migration order and §6 CC0 audit.

### 3.5 Build / deploy / cache infrastructure (obs #11037)

- `build.mjs` uses esbuild with `stripQueryPlugin` to resolve versioned `tunet_base.js?v=...` imports
- Output: `Dashboard/Tunet/Cards/v3/dist/` with `manifest.json`
- Deploy: `npm run tunet:deploy:lab` SCPs to `root@10.0.0.21:/config/www/tunet/v3/`
- Cache bust: `update_tunet_v3_resources.mjs` reads manifest, syncs Lovelace resources to a single `?v=build_<timestamp>Z` token
- Lab dashboard: `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab` — sole validation surface during card rehab
- Per-card Playwright captures at 390×844 are CONTAMINATED by nav rail mobile rendering bug (obs #10112) until nav is rehabbed; whole-page captures and ≥768px captures are reliable

## 4. Migration order

The previous version of this section ordered cards alphabetically within tranche-closed tiers. The adversarial review (`cross_card_spec_layer_review_2026-04-30.md` §6) flagged that this is a recency signal, not a risk signal — putting `lighting` (1980 lines, drag pill, scroll variant, overflow exemption) and `rooms` (em/px fallback drift) early while leaving `speaker_grid` (highest pre-CD2 drift) for last when fatigue is highest is backwards.

The new order is risk-derived per §3.4. Each tier still respects tranche closure (a CD9 card doesn't migrate before CD9 closes), but **within a tier**, the order is **lowest-risk first** so each pass builds confidence before tackling the hard cases.

### Tier 1 — Tranche-closed, low risk (start here per pass)

These are tranche-closed AND simple structurally. Their migration validates the recipe before applying it to higher-risk cards.

1. `tunet_inbox_card` — has top-level em-anchor; em-based literals; CC0 needs only TILE_SURFACE / INTERACTIVE_SURFACE adoption
2. `tunet_sensor_card` — has top-level em-anchor; uses `--r-section`; threshold logic isolated; reference card for tokens-already-adopted
3. `tunet_scenes_card` — CD5-closed; em-based literals; hover-clip closed 2026-04-30
4. `tunet_actions_card` — CD5-closed; scoped anchor needs lift to top-level; em-based literals; hover-clip closed 2026-04-30
5. `tunet_climate_card` — CD8-closed; mixed `--r-tile`/`--r-track` + literals (6/10/11/999/2/1px) — moderate reconciliation surface

### Tier 1 — Tranche-closed, medium risk (after Tier 1 low risk lands)

6. `tunet_weather_card` — CD8-closed; no em-anchor; literal-only border-radius (6/10/11/999); needs full reconciliation
7. `tunet_rooms_card` — CD7-closed; mixed em/px fallbacks; partial em-anchor; rooms-specific token family (`--rooms-row-btn-*`) already em-based — reconciliation pattern reference

### Tier 1 — Tranche-closed, high risk (last in Tier 1 per pass)

8. `tunet_light_tile` — CD6-closed; reference card for the layered token pattern (`--_tunet-display-* > --_tunet-* > hardcoded`); already imports TILE_SURFACE; **CC0 should treat as the migration template, not the migration target**
9. `tunet_lighting_card` — CD6-closed; 1980 lines; drag pill, scroll variant, `--r-track`/`--r-tile` host-level overrides, overflow exemption (CC3 rule 4); migrate last in Tier 1

### Tier 2 — CD9 cards, all currently active (wait for CD9 close, then by risk)

CD9 must close before any Tier 2 card migrates. Within Tier 2:

10. `tunet_speaker_grid_card` — already uses `--r-tile`, `--r-track`, `--r-pill` and was the highest-drift card pre-CD2 (now most-tokenized); well-positioned for CC0 adoption
11. `tunet_media_card` — host overrides `--r-track: 4px`; many literals (6/8/9/10/12/18px); high reconciliation surface
12. `tunet_sonos_card` — no em-anchor, blue accent system, dropdown drift — last in Tier 2

### Tier 3 — Untranched / locked (deferred)

13. `tunet_nav_card` — CD10 unscheduled; mobile rail bug must close first (obs #10112 contaminates 390×844 captures); also relies on `ensureGlobalOffsetsStyle()` global DOM mutation (FL-011) flagged in CC3
14. `tunet_status_card` — G3S bugfix-only lock; do NOT touch in any CC pass until G3S unlocks
15. `tunet_alarm_card` — SA-series exception tranche, separate program

### Migration order applies AT EACH PASS

For every CC pass (CC0, CC1, CC2, CC3), the order above applies fresh. Cards that landed CC0 do not skip to enforce-mode for CC1; each pass has its own audit, primitive, migration, and dual-gate per card.

## 5. Validation gate per card (mandatory dual review)

Before any card lands on contract-test enforcement in any pass, BOTH gates must pass:

### Gate A — Claude-driven Playwright visual review (automated)

For each card at each of the 4 locked breakpoints (390×844, 768×1024, 1024×1366, 1440×900):

1. Build + deploy via `npm run tunet:build && npm run tunet:deploy:lab`
2. Open `http://10.0.0.21:8123/tunet-card-rehab-yaml/lab` at the breakpoint
3. Capture rest screenshot of the card section
4. Force interactive states (hover, active, focus-visible) via shadow-DOM-injected CSS classes on the actual card elements
5. Capture each interactive state screenshot
6. Diff against pre-migration screenshots; the rule is "no visual regression except the explicit token-driven change"
7. Save evidence under `/tmp/tunet-playwright-review/<timestamp>/<breakpoint>/...`

**Caveat per obs #10112**: 390×844 per-card captures are unreliable until the nav mobile rail rehab lands. Until then, 390×844 evidence uses whole-page captures or partial-card captures with the nav region cropped. For CC1, this means nav rehab is a soft prerequisite — see §7.

### Gate B — User-validated live review (human)

1. User opens lab dashboard in their browser at chosen breakpoints
2. User physically interacts with the card (tap/hover/scroll/keyboard nav)
3. User confirms: no functional regression, no visible drift, no unexpected layout change
4. User explicitly authorizes the card landing on contract enforcement

A card can fail either gate independently. If Gate A passes but Gate B fails, the card is rolled back and re-migrated. If Gate B passes but Gate A finds a regression, the regression is investigated before the card is declared done.

This dual-gate is the binding rule for CC1–CC4. It is more conservative than CD2/CD3/CD4 were (those gated on Gate A + test pass only); the user's explicit direction was to add Gate B for every card.

## 6. The four passes (renumbered CC0–CC3)

The previous version named the passes CC1–CC4 with "CC4 = migration completion." The adversarial review caught two structural errors:

1. CC4 was the foundation, not the polish — `INTERACTIVE_SURFACE`/`CTRL_SURFACE`/`DROPDOWN_MENU` adoption is **0/14 cards**; `TILE_SURFACE` is **1/14**. The "completion" framing was wrong by an order of magnitude. CC0 (foundation) must run first.
2. CC2a (em-anchor) was a sub-pass, but every other pass relies on em-anchored tokens. It must be a prerequisite, not a sub-pass.

The new ordering: **CC0 → CC1 → CC2 → CC3**, where CC0 is the foundation pass that absorbs both the previous CC4 (primitive adoption) and the previous CC2a (em-anchor), and CC1/CC2 are scoped to **reconciling the existing partial registries** rather than parallel-adding new token systems.

Each pass mirrors the CD2/CD3 driver pattern: **audit → vocabulary entry → primitive → migration → contract test**. Each pass is a separate authorization request.

### CC0 — Foundation: em-anchor + primitive adoption

This is the largest pass and the most important. It establishes the em-anchored type system (so CC1/CC2 token values resolve consistently) and makes the existing `tunet_base.js` primitives actually consumed by every card.

#### CC0a — Em-anchor enforcement (universal)

**Audit**: per §3.4, only `inbox`, `nav`, `sensor` have correct top-level `:host { font-size: 16px }`. The rest are missing it (`light_tile`, `lighting`, `media`, `sonos`, `speaker_grid`, `weather`, `climate`) or have it scoped to a media query (`actions` at L287 inside `@media (max-width: 768px)`; `rooms` at L615 needs verification).

**Migration**: add `:host { font-size: 16px; }` as the FIRST top-level rule in each card's stylesheet. Existing scoped anchors stay (they're additive). For `light_tile` and `lighting` which override `--r-track`/`--r-tile` at host level, the em-anchor declaration goes alongside those overrides, not as a separate `:host` block.

**Contract test** (replace the previous CC2a recipe — that grep was wrong because it accepts scoped anchors):

```js
describe('§Em-anchor — every card has top-level :host { font-size: 16px }', () => {
  for (const card of CC0_LANDED_CARDS) {
    it(`${card.file} declares font-size: 16px on :host outside any @media`, () => {
      const source = cardSources.get(card.file);
      // Strip @media blocks from source, then look for :host { ... font-size: 16px ... }
      const stripped = source.replace(/@media[^{]*\{(?:[^{}]*|\{[^{}]*\})*\}/g, '');
      const hasAnchor = /:host[^{]*\{[^}]*font-size\s*:\s*16px/.test(stripped);
      expect(hasAnchor, `${card.file} missing top-level :host font-size: 16px`).toBe(true);
    });
  }
});
```

#### CC0b — Primitive adoption (INTERACTIVE_SURFACE / TILE_SURFACE / CTRL_SURFACE / DROPDOWN_MENU)

**Audit**: per §3.3, `INTERACTIVE_SURFACE` adoption is 0/14, `CTRL_SURFACE` is 0/14, `DROPDOWN_MENU` is 0/14, `TILE_SURFACE` is 1/14. Every card has card-local CSS that re-implements the shape these primitives provide.

**Vocabulary entry**: extend §1 (Hover) and §3 (Focus-visible) of `cross_card_interaction_vocabulary.md` to specify primitive composition as the **mandatory pattern**, not the recommended pattern. Card-local rules that satisfy the contract shape are still allowed for documented divergences (e.g., `--shadow-up` lift on `.l-tile` — must be explicit, not accidental).

**Primitive**: nothing new. Use what's already exported in `tunet_base.js` at L1174 (`TILE_SURFACE`), L1230 (`INTERACTIVE_SURFACE`), L1288 (`CTRL_SURFACE`), L1330 (`DROPDOWN_MENU`).

**Migration** (per card, in §4 order):

1. Identify every interactive selector in the card (`.action-chip`, `.scene-chip`, `.l-tile`, `.spk-tile`, etc.) — `CARD_REGISTRY` in `css_contract_helpers.js` already has this for CD2.
2. Map each interactive selector to one of: `INTERACTIVE_SURFACE` (chips, action buttons), `TILE_SURFACE` (light/speaker tiles), `CTRL_SURFACE` (transport buttons, toggle buttons), `DROPDOWN_MENU` (dropdown panels).
3. Replace the card's local CSS for that shape with `${INTERACTIVE_SURFACE}` (etc.) splice + the `.interactive` class on the element.
4. Keep card-local CSS only for: (a) accent color overrides (e.g., speaker_grid `--accent: #4682B4`), (b) shape overrides documented in vocabulary (e.g., `.l-tile` uses `--shadow-up` not `--tile-shadow-lift`), (c) selector-scoped extensions (e.g., `.action-chip[data-accent="amber"].active`).

**Contract test**: tighten `interaction_source_contract.test.js` to require every interactive selector in `CARD_REGISTRY` either:
- composes one of the four primitives via template-literal splice (`${INTERACTIVE_SURFACE}` etc. visible in the source), AND applies the corresponding class (`.interactive`, `.tile`, etc.) to the element, OR
- has an explicit `/* card-local-by-design: <reason> */` comment immediately above the selector with a documented divergence reason.

CC0b is the largest single migration in the program. Plan for ~3-5 cards per migration cycle, not 11 in one shot.

#### CC0 close criteria

CC0 closes when:
- All 14 in-scope cards (excluding status, alarm) have top-level `:host { font-size: 16px }` (Tier 3 cards skip-mode).
- All 14 in-scope cards have at least one of their interactive selectors composed via a base primitive splice (i.e., the import + splice pattern is established in every card; per-selector adoption can complete in CC0b's later migration cycles).
- The two contract tests above are green for all CC0_LANDED_CARDS.

### CC1 — Corner & shape RECONCILIATION (not parallel-add)

The previous version proposed a new `--radius-*` em token family. This created two competing token systems because `tunet_base.js:70-74` already has `--r-card`, `--r-section`, `--r-tile`, `--r-pill`, `--r-track` in **px**, with `lighting`, `media`, and `status` already overriding these per-card via `:host`.

CC1 reconciles the existing `--r-*` family rather than adding a parallel one. The user must choose between three reconciliation paths before CC1 audit begins (see §10 open questions):

**Path A — Keep `--r-*` names; migrate units to em** (recommended)
- Rename happens at consumption sites (none) — no rename at all
- Migrate values: `--r-card: 24px` → `--r-card: 1.5em`, `--r-section: 32px` → `--r-section: 2em`, `--r-tile: 16px` → `--r-tile: 1em`, `--r-track: 14px` → `--r-track: 0.875em`, `--r-pill: 999px` → `--r-pill: 999px` (unchanged — pill stays px)
- Per-card overrides (lighting `--r-tile: 22px`, media `--r-track: 4px`) update to em values
- Pro: smallest disruption (no rename), preserves cascade semantics
- Con: migration must be atomic across cards using the token (since em values resolve differently than px under non-16px anchors — CC0a must close first)

**Path B — Rename `--r-*` to `--radius-*` AND migrate units**
- All consumers (`tunet_climate_card.js`, `tunet_media_card.js`, `tunet_speaker_grid_card.js`, `tunet_sensor_card.js`, `tunet_lighting_card.js` host overrides, `tunet_status_card.js` profile fallback, `tunet_alarm_card.js`) update simultaneously
- Pro: token name reflects role more clearly
- Con: 6 files touched in one commit; rollback risk; alarm card is in SA-series (separate program) so coordination needed

**Path C — Keep `--r-*` px; add `--radius-*` em as a separate "modern" family for new code**
- Pro: zero disruption to existing consumers
- Con: introduces the parallel system the review specifically warned against; "modern" vs "legacy" distinction will rot

**Migration recipe (path-agnostic)**:
1. Audit `border-radius` per card (already done for §3.4): tokenize literal values to `--r-*` (or `--radius-*` per chosen path)
2. Allow card-local `:host { --r-tile: …; }` overrides as the established escape hatch (lighting, media)
3. Pill (`999px`) stays a literal — it's a structural pill marker, not a sized radius

**Vocabulary entry** §6 Shape: rename role-to-token table per chosen path; document the per-card override pattern as canonical.

**Contract test**:

```js
describe('§Shape — no hardcoded border-radius literals on landed cards', () => {
  // Allowed: 0, inherit, 50%, 999px (pill), 100%, var(--r-*) or var(--radius-*)
  const ALLOWED = /^(?:0|inherit|50%|100%|999px|var\(--(?:r|radius)-[a-z-]+(?:[-,\s][^)]+)?\))$/;
  for (const card of CC1_LANDED_CARDS) {
    it(`${card.file} uses tokens for all border-radius values`, () => {
      const css = cardCSS.get(card.file);
      const decls = css.match(/border-radius\s*:\s*([^;]+)/g) || [];
      for (const decl of decls) {
        const val = decl.split(':')[1].trim();
        // Strip multi-value shorthand (e.g., "var(--r-track) 0 0 var(--r-track)") — check first part
        const firstPart = val.split(/\s+/)[0];
        expect(firstPart).toMatch(ALLOWED);
      }
    });
  }
});
```

### CC2 — Type scale & icon-host RECONCILIATION (not parallel-add)

The previous version proposed `--type-heading`, `--type-label`, `--type-value`, `--type-micro`, `--type-chip` (em). This collides with the existing `--type-label: 12.5px`, `--type-value: 18px`, `--type-chip: 12.5px` (px) at L173-178 and the desktop/mobile swap at L1431-1471.

CC2 reconciles. Like CC1, the user must choose a path:

**Path A — Keep `--type-*` names; migrate units to em** (recommended)
- `--type-label: 12.5px` → `--type-label: 0.78em`
- `--type-sub: 11px` → `--type-sub: 0.6875em`
- `--type-value: 18px` → `--type-value: 1.125em`
- `--type-chip: 12.5px` → `--type-chip: 0.78em`
- `--type-row-title: 16.5px` → `--type-row-title: 1.03em`
- `--type-row-status: 14.5px` → `--type-row-status: 0.9em`
- Mobile twins (`--type-*-mobile`) follow same conversion at the mobile baseline
- **Mobile-swap rule at L1431-1471 stays intact** — preserved as-is, just operates on em values
- Pro: smallest disruption
- Con: tested at every breakpoint; mobile swap behavior must be verified visually

**Path B — Drop the mobile-swap entirely; rely on em-anchor + container queries**
- The mobile swap exists because px values don't auto-scale. Once em-anchored, type can scale via container query or media query at the host without separate `-mobile` tokens.
- Pro: simpler model long-term
- Con: more invasive; affects every card's responsive behavior

**Path C — Keep px values for legacy `--type-*`; add new `--type-em-*` family**
- Same parallel-system anti-pattern as CC1 Path C
- Not recommended

**Icon-host reconciliation** — `tunet_base.js` already has `--icon-wrap-size: 44px`, `--icon-wrap-size-sm: 24px`, `--icon-wrap-radius: 16px`, `--icon-wrap-radius-sm: 6px` at L131-134 (px). Plus `--rooms-row-btn-icon-size: 1.62em` (em). The previous plan's `--icon-tile`/`--icon-chip`/`--icon-header`/`--icon-row` proposal duplicates this.

**Recommendation**: rename `--icon-wrap-size` → `--icon-tile`, `--icon-wrap-size-sm` → `--icon-chip`, add `--icon-header` and `--icon-row` to fill the missing roles. Migrate units alongside CC2 type pass.

**Reference pattern** (from `light_tile`, obs #10740, #10774): the **two-layer fallback** is canonical:

```css
font-size: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
```

CC2 should adopt this layered pattern for all icon-host tokens during migration: `var(--type-display-X, var(--type-X, <em fallback>))` so cards can override at the display layer without changing the base.

**Vocabulary entry** §7 Type and §8 Icons: document the unified scale and the layered fallback pattern.

**Contract test**: forbid hardcoded `font-size:` values outside `var(...)` references on landed cards. Allow px fallbacks INSIDE `var()` (e.g., `var(--type-label, 12.5px)`).

### CC3 — Surface composition + cross-cutting JS contracts (expanded)

The previous version listed five composition rules. The corpus findings (`cross_card_corpus_findings.md` §"CC3 — Surface composition rules (additional)") and the adversarial review surfaced more. CC3 expands to cover all of them.

**Composition rules to codify**:

1. **Scroll container ↔ hover-lift breathing room** (CODIFIED 2026-04-30 in `interaction_source_contract.test.js` §Surface composition). Recipe: `padding-block ≥ 0.5em` + matching negative `margin-block`. Opt-out: `/* lift-clear:none */`.
2. **Sticky/fixed ↔ ancestor stacking-context establishment**. Recipe: enumerate ancestors that establish stacking context (transform, opacity < 1, will-change, contain) and forbid them upstream of `position: sticky` elements.
3. **Dropdown z-index ↔ host-level toggling** (`:host(.dd-open)`). Recipe (used by status, sonos, media): toggle a class on the host shadow root host so card-level CSS can raise z-index of the dropdown only while open.
4. **Drag pill / floating element ↔ ancestor `overflow: hidden` clipping**. **OPEN QUESTION** (see §10): should the lighting drag pill be re-parented out of `.light-grid` to a portal layer, eliminating the `overflow-y: visible` exemption entirely? Until decided, treat the exemption as a temporary workaround, not as architecture.
5. **Focus-ring offset ↔ ancestor padding/overflow clipping**. Recipe: parents of focusable elements must have `padding ≥ outline-offset + outline-width` OR `overflow: visible`.
6. **Nav card global DOM mutation (FL-011)** (corpus findings §F). `tunet_nav_card.ensureGlobalOffsetsStyle()` injects `<style>` into `document.head` to shift HA's own view elements. This is not scoped to the nav card's shadow DOM. CC3 must either (a) document the mutation as a contract with explicit cleanup-on-disconnect requirements, or (b) propose a non-mutating alternative (CSS variables on `:root` set by the nav card's own host, consumed by HA via theme? not possible — needs research).
7. **history.pushState navigation (FL-012)** (corpus findings §G). Multiple cards (rooms, nav, possibly more) call `history.pushState` for in-app navigation. This affects browser back-button behavior across cards. Document the contract, identify which cards use it, and ensure mutual compatibility.
8. **stopPropagation in nested interactive trees** (corpus findings §H). Rooms-card has `event.stopPropagation()` on inner controls to prevent the row-tile tap from also firing. Document the contract: when an interactive tree has nested interactives, the inner control owns the event; do not bubble.
9. **`visibility: hidden` vs `display: none` in grid contracts** (corpus findings §I). Some cards use `visibility: hidden` to preserve grid track sizing; others use `display: none` to remove from layout. Document which is used where and why.
10. **`--spring` undefined fallback** (corpus findings §J). Was used by sonos and speaker_grid before CD2 fixed; codify the rule that undefined CSS variables in `transition` properties silently fall back to `initial` and break easing.

**Vocabulary entry** §9 Composition: enumerate each rule with symptom, root cause, recipe, and known exemptions.

**Primitive**: parameterize where applicable. Add `--lift-clear-block: 0.5em` so cards reference `var(--lift-clear-block)` instead of duplicating `0.5em`. Add `--focus-clear-padding: calc(var(--focus-ring-width) + var(--focus-ring-offset))` for rule 5. No new primitives for rules 6-10 (those are JS contracts, not CSS tokens).

**Contract test**: extend `interaction_source_contract.test.js` with one describe block per rule. For JS contracts (rules 6-10), tests assert source-level patterns (e.g., "`history.pushState` only appears in cards on the FL-012 allowlist"; "`stopPropagation` calls have a comment marker explaining the nested-interactive contract").

**CC3 close criteria**:
- All ten rules are documented in vocabulary §9.
- The lighting drag pill open question (§10) is resolved.
- All in-scope cards pass the contract tests for each rule.
- `cross_card_interaction_vocabulary.md` is promoted from v1.0 to **v2.0** as part of CC3 close.

### Pass close → next pass

Each pass closes only when all in-scope cards (Tier 1 + Tier 2; Tier 3 in skip-mode) have landed contract enforcement. The next pass cannot begin until the previous pass closes. CC0 → CC1 → CC2 → CC3 is strictly sequential.

## 7. Cross-cutting rules for all four passes

- **One pass at a time.** No interleaving CC0 and CC1 mid-stream. Activate, complete, validate, close, then authorize the next.
- **Migration is incremental within a pass.** Cards land one at a time, in the §4 order. Contract tests start in skip-mode for unmigrated cards and flip to enforce-mode as each card passes both gates.
- **No card-runtime regressions allowed.** Each migration is gated by full test suite pass + dual-review gate (§5).
- **Reconciliation, not parallel-add.** CC1 and CC2 reconcile existing partial registries (`--r-*`, `--type-*`, `--icon-wrap-*`). Adding a parallel token system under different names is forbidden — the user explicitly chooses a path (A/B/C — see §10) before the pass begins.
- **Wrap-variant pattern preserved.** Where a rule has a default-vs-relaxed/wrap variant (like `.actions-row` / `.actions-row.wrap` does today), the pattern of resetting the override to 0 in the wrap variant must be carried into new tokens/primitives.
- **Profile system in deprecation mode.** No CC pass extends the profile resolver. Cards still consuming profile vars (`--_tunet-*`) get their consumption simplified to the new tokens during migration. A separate **CC4 — profile system removal** pass will be authorized after CC3 closes; until then, the profile resolver code stays in place.
- **Plan stays passive between passes.** This document does not authorize execution. Each pass requires the user to say "Activate CC0" / "Activate CC1" / etc.
- **Status card excluded** from CC0–CC3 until G3S unlocks. Nav card excluded from CC0b (primitive adoption) and conditionally CC2 until mobile rail bug closes.
- **Alarm card** is a separate program (SA-series); not in CC scope.

## 8. Prerequisites before CC0 starts

These are the checks/preparations that must be done before CC0 audit begins:

1. **CD9 closed.** All three CD9 cards (media, sonos, speaker_grid) have their CD9 closeout entries in `visual_defect_ledger.md` and `flickering-herding-wolf.md`. CC0 begins after this.
2. **Nav rail mobile bug status known.** Either:
   - Nav rehabbed (rail no longer overlaps card content at 390px), unblocking all 390×844 per-card Playwright captures, OR
   - Plan accepts whole-page-only captures for 390×844 evidence with explicit annotation
3. **Em-anchor live audit.** Run the corrected detection that strips `@media` blocks before checking for `:host { font-size: 16px }`:
   ```bash
   for f in Dashboard/Tunet/Cards/v3/tunet_*.js; do
     stripped=$(awk '/@media[^{]*\{/{depth=1; next} depth>0{n=gsub(/\{/,"{"); m=gsub(/\}/,"}"); depth+=n-m; next} {print}' "$f")
     if ! echo "$stripped" | grep -qE ':host\s*\{[^}]*font-size\s*:\s*16px'; then
       echo "MISSING TOP-LEVEL ANCHOR: $f"
     fi
   done
   ```
   Confirm the missing list matches §3.4 (light_tile, lighting, media, sonos, speaker_grid, weather, climate; plus actions and rooms in scoped-only mode). New cards drifting expand CC0a scope.
4. **Primitive import audit.** Run `grep -L "import.*INTERACTIVE_SURFACE\|import.*TILE_SURFACE\|import.*CTRL_SURFACE\|import.*DROPDOWN_MENU" Dashboard/Tunet/Cards/v3/tunet_*.js` to list cards NOT importing any composable primitive. Per §3.3, this should be 13 of 14 cards (only `light_tile` imports `TILE_SURFACE`). Confirm the count.
5. **Reconciliation path decisions locked.** User has chosen path A/B/C for both CC1 (`--r-*` family) and CC2 (`--type-*` family) per §10 open questions. Without a path locked, CC1/CC2 cannot begin (they would otherwise default to parallel-add, which is forbidden by §7).
6. **Lighting drag pill question resolved.** Per §10, the user has decided whether the drag pill stays at `.light-grid` overflow exemption or gets re-parented to a portal. CC3 rule 4 cannot be authored without this decision.
7. **Profile system deprecation lifecycle defined.** Per §10, the user has confirmed when the profile resolver gets fully removed (CC4 pass). Without this, CC1/CC2 reconciliation paths can't choose between "leave profile fallback in place" vs "drop profile fallback during migration."
8. **Visual baseline captured.** Before CC0 starts, capture a full Playwright run at all four breakpoints across all in-scope cards. This baseline is the regression check for every subsequent CC pass.
9. **Test suite green at the baseline.** Confirm `npm test` passes the full suite at the moment CC0 starts. Today's baseline is **655/655**.
10. **Runbook + findings doc up to date.** `cross_card_spec_layer_agent_runbook.md` and `cross_card_corpus_findings.md` reflect CC0–CC3 numbering. The corpus is rebuilt with current observation count.

## 9. What success looks like

After CC0–CC3 complete:

- Every card's CSS uses tokens for all visual concerns (corner, type, icon, hover, press, focus, motion, surface composition).
- Every card has top-level `:host { font-size: 16px }` so em-based tokens resolve consistently.
- Every card composes at least one base primitive (`INTERACTIVE_SURFACE` / `TILE_SURFACE` / `CTRL_SURFACE` / `DROPDOWN_MENU`) for its interactive selectors. Card-local re-implementations only exist where a documented divergence reason is in source as a `/* card-local-by-design: ... */` comment.
- `tunet_base.js` `TOKENS` (CSS string) is the single source of truth for visual values, with the existing `--r-*`/`--type-*`/`--icon-wrap-*` registries reconciled (renamed and/or unit-migrated per the user's CC1/CC2 path choice). `TOKEN_MAP` (JS object, profile system) is in deprecation mode pending a separate CC4 removal pass.
- `cross_card_interaction_vocabulary.md` is at **v2.0** with §6 Shape, §7 Type, §8 Icons, §9 Composition all written and 10 cross-cutting composition rules codified (5 from the original plan + 5 from the corpus + adversarial review).
- `interaction_source_contract.test.js` has describe blocks for every rule, keyed off `CD2_CARDS` and the per-pass landed-card lists.
- Adding a new card means: import the primitives, follow the vocabulary, pass the contract tests. No card-local re-implementation of cross-cutting concerns.
- The next "I rediscovered the same bug in three cards" moment is caught by a contract test before it ships.

## 10. Open questions for the user (must be answered before CC0/CC1/CC2/CC3 begin)

The plan was substantially rewritten on 2026-04-30 after the adversarial architecture review (`cross_card_spec_layer_review_2026-04-30.md`) found two factual errors and several scope undercounts in the previous version. The rewrite surfaces seven decisions that the user must make. Each unblocks a specific gate in §8.

**For CC1 (corner & shape reconciliation):**

1. **Choose a path for `--r-*` reconciliation** (blocks CC1 audit):
   - **Path A (recommended)** — keep `--r-card`/`--r-section`/`--r-tile`/`--r-pill`/`--r-track` names, migrate values from px to em where appropriate
   - **Path B** — rename `--r-*` → `--radius-*` and migrate units; touches 7+ files in coordinated commit
   - **Path C** — keep `--r-*` px legacy, add `--radius-*` em as a "modern" family for new code (creates the parallel-system anti-pattern; **strongly not recommended**)

**For CC2 (type scale reconciliation):**

2. **Choose a path for `--type-*` reconciliation** (blocks CC2 audit):
   - **Path A (recommended)** — keep `--type-label`/`--type-value`/`--type-chip`/`--type-row-title`/`--type-row-status` names, migrate values px → em, preserve the mobile-swap rule at L1431-1471 unchanged
   - **Path B** — drop the mobile-swap entirely; rely on em-anchor + container/media queries for responsive type scaling
   - **Path C** — keep px legacy, add `--type-em-*` parallel family (parallel-system anti-pattern; **not recommended**)

3. **Choose a fate for `--icon-wrap-*`** (blocks CC2 icon-host pass):
   - **Path A (recommended)** — rename `--icon-wrap-size` → `--icon-tile`, `--icon-wrap-size-sm` → `--icon-chip`; add `--icon-header` and `--icon-row` for missing roles
   - **Path B** — keep `--icon-wrap-*` and add `--icon-tile`/`--icon-chip` separately as new vocabulary

**For CC3 (composition):**

4. **Lighting drag pill re-parenting** (blocks CC3 rule 4):
   - **Option A** — re-parent the drag pill to a portal layer above `.light-grid`, eliminating the `overflow-y: visible` exemption; engineering cost: one card edit, possible browser-mod or shadow-DOM portal pattern
   - **Option B** — keep the exemption as architecture; codify in vocabulary §9 with explicit rationale that the exemption is permanent
   - The corpus and the adversarial review both flag this as a sign of deeper architectural debt; the plan recommends investigating Option A but does not pre-commit

**For CC4 / profile system removal (post-CC3):**

5. **Profile system deprecation lifecycle** (blocks CC1/CC2 path choices):
   - **Plan A** — CC4 is "profile system removal" and runs after CC3 closes. CC1/CC2 leave `var(--_tunet-X, fallback)` consumption intact; CC4 removes the profile resolver and updates fallbacks to be terminal.
   - **Plan B** — CC1/CC2 each remove profile fallbacks for their token category as cards migrate. CC4 doesn't exist; profile resolver is dead code by end of CC3.
   - **Plan C** — keep profile resolver indefinitely as an escape hatch for non-rehab cards (alarm, future cards). Never remove.

**For status and nav exclusions:**

6. **Status card test policy after CC0–CC3 close**:
   - **Option A** — contract tests permanently skip status until G3S unlocks (current default); CC4 closure does not require status compliance
   - **Option B** — CC0–CC3 close requires status to land at least the em-anchor (CC0a) before closing, even under G3S
   - **Option C** — status migration happens only after G3S unlocks; CC0–CC3 carry the skip indefinitely

7. **Nav card primitive adoption**:
   - **Option A** — nav skips CC0b until mobile rail bug is fixed (current default)
   - **Option B** — nav lands CC0b alongside the mobile rail rehab as a combined pass

These seven questions should be answered before CC0 audit begins. The plan defaults are chosen for safety, but the user has the final call on each.

## 11. Corpus references

Plan is grounded in the `tunet-architecture` claude-mem corpus (rebuilt 2026-04-30 with files-filter on the umbrella project: 500 observations / 234k tokens, type breakdown 252 discoveries / 90 bugfixes / 75 changes / 46 features / 27 decisions / 10 refactors). The original 56-observation corpus was the previous narrower-filter build; the current 500-obs corpus is the canonical one. See `cross_card_spec_layer_agent_runbook.md` §3 for the locked filter recipe and curl access path.

The adversarial review cited in the §3, §4, §6 rewrites is at `cross_card_spec_layer_review_2026-04-30.md`. Key observations cited in this plan:

- **#11020** — tunet_base.js dual token surfaces (TOKENS CSS string at L19 vs TOKEN_MAP JS object at L864); profile system superseded
- **#11088** — corpus query result captured for this plan rewrite
- **#10646** — typography token sub-registry in TOKENS
- **#10653** — rooms_card mixed em/px font fallbacks; `:host { font-size: 16px }` anchor scoping bug
- **#10454** — sections_layout_matrix: rows='auto' suite-wide, lighting overflow-y:visible exemption
- **#10456** — full source audit of light_tile (921 lines) and lighting_card (1980 lines)
- **#10112** — nav mobile rail bug contaminating per-card 390px screenshots
- **#10066** — CD4 sizing system map: 6 cards on legacy profiles
- **#9906** — bindButtonActivation absent before CD3, added in CD3
- **#9895** — cross-card interaction vocabulary post-CD2 state + CD3 keyboard accessibility debt
- **#9891** — CD3 cursor:pointer audit; media_card has 9 instances (highest)
- **#9875** — CD2 commit 7f98dec — 29 files, 11 cards normalized, 368 tests
- **#9826** — CD2 source contract suite 146/146 green
- **#9813** — speaker_grid critical CD2 fixes (translateY removed, hover guarded, press tokenized, focus-visible migrated)
- **#9751** — INTERACTIVE_SURFACE export added in CD2
- **#9747** — focus-ring tokens are px not em
- **#9692** — css_contract_helpers.js + CARD_REGISTRY infrastructure
- **#10774**, **#10740** — light_tile two-layer token fallback pattern (canonical reference)
- **#11037** — sensor_card architecture (HTMLElement + shadow DOM + CSS vars + history caching)

To re-query the corpus: `query_corpus name=tunet-architecture question="..."`. To rebuild after new observations are written: `rebuild_corpus name=tunet-architecture`.
