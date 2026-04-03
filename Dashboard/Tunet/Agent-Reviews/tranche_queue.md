# Tunet Tranche Queue

## DONE RECENTLY

### T-G1.2
- `Profile registry, resolver, width source fixes in tunet_base.js`
- Outcome:
  - Full profile consumption infrastructure in tunet_base.js (536 lines)
  - 5 families × 3 sizes × all-em registry
  - selectProfileSize + resolveSizeProfile two-function API
  - TOKEN_MAP (49 entries), deepMerge, PRESET_FAMILY_MAP
  - Width source fixes: window.innerWidth removed from lighting + status cards (D14)
  - Bugs fixed: slim layout routing, progressH for indicator families
  - 48/48 unit test assertions pass

### T-G2.1 — DEPLOYED (v=g2g, Mar 9 2026)
- `Profile consumption pilot: lighting + speaker-grid cards`
- User-validated visually.
- Outcome:
  - Both cards consume profile tokens via _applyProfile → _setProfileVars → CSS var cascade
  - use_profiles feature flag + editor toggle in both cards
  - `:host { font-size: 16px }` em anchor added to both cards (D21 root cause fix)
  - PROFILE_BASE nameFont recalibrated: compact=0.875em, standard=1em, large=1.125em
  - Floating pill overflow fix, userSize pass-through fix
  - Full-bleed scroll layout fix (negative margins + internal padding)
  - Import version: `tunet_base.js?v=20260308g2e`

### T-G3.0 — DEPLOYED (nav v0.2.4, Mar 9 2026)
- `Neutralize nav card global CSS injection before G3 profile migration`
- `window.TUNET_NAV_OFFSETS_DISABLED` runtime guard on ensureGlobalOffsetsStyle() + _applyOffsets()
- Disconnect cleanup: orphaned `<style>` element now removed from document.head

### T-G3.1 — DEPLOYED (v3.0.0, Mar 9 2026)
- `Profile consumption: rooms card (tile-grid + rooms-row families)`
- Outcome:
  - Dual-family switching: tile-grid (grid mode) + rooms-row (row/slim modes)
  - Slim mode forces compact profile regardless of container width
  - 15 CSS properties migrated to var(--_tunet-*, fallback)
  - ResizeObserver added (was no-op connectedCallback)
  - @media mobile overrides cleaned (removed profile-driven duplicates, kept structural layout)
  - 5 lifecycle methods + use_profiles feature flag + editor toggle
  - Import version: `tunet_base.js?v=20260308g2e`
  - Status card EXCLUDED (user decision Mar 9)

### T-G4.1 — DEPLOYED (v2.0.0, Mar 9 2026)
- `Standalone tile alignment (tunet_light_tile.js)`
- Outcome:
  - All CSS converted from px to em (font-size: 16px anchor added)
  - Profile consumption: tile-grid family (preset: 'lighting', layout: 'grid')
  - 7 CSS properties migrated to var(--_tunet-*, fallback)
  - ResizeObserver added (was not present)
  - 5 lifecycle methods + use_profiles/tile_size + editor toggle
  - Import version: `tunet_base.js?v=20260308g2e`

## DEPLOYMENT NOTE (Mar 9 2026)
- Full clean redeployment: cleared `/config/www/tunet/` and replaced with `/config/www/tunet/v2/`
- All 14 JS files (13 cards + tunet_base.js) deployed via SCP
- All 13 card Lovelace resources registered as `module` at `/local/tunet/v2/[name].js?v=20260309_g5`
- All 13 card import versions aligned to `tunet_base.js?v=20260308g2e`
- Old `tunet_page_card.js` removed (not in canonical card set)
- Dashboard Overview view: `tunet-page-card` wrapper replaced with native `vertical-stack`

## DEPLOYMENT NOTE (Mar 14 2026) — V3 RESTORATION & PROMOTION
- v3 code restored to server at `/config/www/tunet/v3/` (14 files via SCP)
- All 13 Lovelace resources switched from `/local/tunet/v2/` → `/local/tunet/v3/`
- Resource version: `?v=20260314_v3a`
- 7 stale import versions fixed: all 13 cards now import `tunet_base.js?v=20260309g7`
- _resetManualControl: confirmed already correct (per-switch loop) in v3 — no port needed
- v2 files remain on server at `/config/www/tunet/v2/` for rollback
- Erroneous "v2 is forward path" memory corrected — v3 is implementation authority

## NOW

### T-G5.1 — CARD-LEVEL DONE (Mar 10 2026)
- `Sections integration validation (getGridOptions rows:auto strategy)`
- Dependency: T-G3.1 done ✓, T-G4.1 done ✓
- Card-level outcome:
  - `getGridOptions()` with `rows: 'auto'` deployed across all 13 cards
  - `min_rows` set per card; `fixed_rows: true` on 4 profile-consuming cards
  - Cards render without clipping or extra whitespace in Sections ✓
  - Climate + weather sit side-by-side (both `columns: 6`) ✓
  - No stacking or overlap regressions ✓
- View-level composition (which cards in which sections, spanning what width):
  - Deferred to FL-039 — requires deliberate design, not ad-hoc arrangement
  - Research captured in `sections_width_research.md` (CSS variables, column model, max_columns + multi-section strategy)
- Remaining exit criteria (4-breakpoint visual testing) tracked but not blocking

## KNOWN ISSUES (logged Mar 9–10 2026)

### KI-001 — Light tile drag-to-brightness broken — FIX CANDIDATE DEPLOYED
- Root cause: `_render()` fires during active drag (HA state updates via WebSocket), replacing `innerHTML` and resetting `dataset.brightness` — visual state fights with drag, making it appear broken
- Fix: `this._isDragging` flag guards `_render()` during active drag; render runs once on `onDragEnd`
- Deployed at `?v=20260314_v3b` — requires user validation (hard refresh + test drag gesture)
- Status: FIX CANDIDATE (needs visual confirmation)

### KI-002 — Suite-wide: no visual config editors (REFRAMED Mar 10)
- **No Tunet card has a visual config editor.** Zero of 13 cards implement `getConfigElement()`.
- All cards require manual YAML editing for configuration.
- `tunet_light_tile.js` has `static get configurable() { return true; }` but no editor element.
- **Scope is selective, not universal.** Target: commonly-changed simple options that reward UI configurability.
  - Good candidates: entity selectors, boolean toggles (`use_profiles`, `expand_groups`, `show_adaptive_toggle`), simple dropdowns (`layout_variant`, `tile_size`), light/entity pickers
  - Not candidates: deeply nested config (status `tiles` array, rooms per-room light definitions, zone lists)
  - Not every card will get an editor; not every option will be exposed
- Requires: planning + research phase (HA editor API capabilities, per-card feasibility audit, shared editor base pattern)
- Priority: separate workstream — needs architecture review before implementation

### KI-003 — Rooms card row layout: all-toggle button oversized — FIXED in v3
- In `layout_variant: 'row'`, the all-on/all-off toggle button was larger than individual light orbs
- Fixed in T-011A.18 via `--row-btn-size` CSS variable unification
- Fix deployed to production with v3 restoration (Mar 14 2026)
- Status: RESOLVED

---

### FL-039 (NEW)
- `Dashboard composition: deliberate section layout + card placement design`
- Scope: which cards go where, in what section, spanning what width, alongside/above/below what elements
- Includes: multi-section strategy, `max_columns` selection, full-width vs column sections, chip integration
- Dependency: G5.1 card-level done ✓, sections width research done ✓
- Requires: thoughtful design review — not ad-hoc implementation

### T-G6.1
- `Cleanup: remove legacy scaling + use_profiles flags after 30-day soak`
- Dependency: all prior gates done + soak period passed

### FL-038 (resume)
- `One-surface orchestration: Living Room → popup → overview → media → remaining rooms`
- Dependency: G1 done (now satisfied) — can run in parallel with G5+ if scoped carefully

## ORDER LOCK

Gate sequence is locked per unified_tile_architecture_conclusion.md v3.1 §14:

G1 → G2 → G3 → G4 → G5 → G6

FL-038 surface-by-surface work resumes after G1 and runs alongside gate work where there is no file overlap.
