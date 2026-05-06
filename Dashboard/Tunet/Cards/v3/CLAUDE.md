# Tunet V3 Cards — Local Guidance

## Authority

- Code authority: this directory — sole implementation authority since Mar 14, 2026
- Design: `design_language.md` (v9.0) for architecture; `tunet-design-system.md` (v8.3 §6, §11) for visual specs
- Visual baseline: `tunet_climate_card.js` — measured CSS values as reference

## Profile Contract (Superseded Apr 2, 2026)

Legacy profile code stays for untouched cards. Migrated cards use:
- `tile_size` config override wins when set
- Auto-resolve from container width otherwise
- Expose via `tile-size` attribute; use `:host([tile-size="..."])` CSS blocks
- Migration is incremental per active card tranche; surface assembly consumes rehabilitated cards later

## Editor Architecture Contract (CD1)

The editor does NOT mirror the full runtime config 1:1. Each card uses a three-layer model:

1. **Authoring model** (editor surface): small, opinionated, asks for high-level intent
2. **Synthesizer** (setConfig normalization): converts editor choices into full runtime config, infers defaults, handles legacy keys
3. **Runtime model** (what the card consumes): can be richer than the editor exposes; `_config` after `setConfig()` is the runtime model

Per-card documentation of all three layers: `Dashboard/Tunet/Docs/cards_reference.md`
Legacy key precedence rules: `Dashboard/Tunet/Docs/legacy_key_precedence.md`

## Build & Deploy Gotchas

- `npm run tunet:deploy:lab` deploys built bundles; browser cache can serve stale JS
- After ANY getConfigForm change, hard-refresh (Ctrl+Shift+R) before testing
- Icon fields in array items: use `{ text: {} }` not `{ icon: {} }` — Material Symbols ligatures, not MDI
- `object` + `fields` + `multiple: true` WORKS in getConfigForm (verified HA 2026.4.0)
- Font injection uses `window.__tunetFontsInjected` (not module-scoped) for bundle safety
- `renderConfigPlaceholder()` in tunet_base.js for graceful missing-config states

## Required Practices

- Shared base primitives in `tunet_base.js` first
- Container-first width (not viewport)
- Interaction routing outside sizing logic
- `static getConfigForm()` for user-configurable cards
- Document goal state BEFORE modifying any card

## Guardrails

- Do not treat `Cards/` or `Cards/v2/` as authority
- Do not reintroduce viewport-first sizing or legacy tap-toggle
- Do not modify cards outside the active foundation or card tranche
- Do not rename tag names or remove config properties
- Validate at: 390×844, 768×1024, 1024×1366, 1440×900
- Do not put hover-lift tiles/chips inside a container with `overflow-x: auto`/`scroll` without giving vertical clip room (`padding-block: 0.5em; margin-block: -0.5em` on the scroll container). Per CSS spec, `overflow-x: auto` forces `overflow-y` to compute as `auto`, which clips `var(--tile-shadow-lift)` vertically. See `Dashboard/Tunet/Docs/visual_defect_ledger.md` §1 actions-card and the §Surface composition contract test in `tests/interaction_source_contract.test.js`.


<claude-mem-context>

</claude-mem-context>