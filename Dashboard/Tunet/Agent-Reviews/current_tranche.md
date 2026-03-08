# Tunet Tranche Definition

### TRANCHE_ID
- `T-G1.1`

### TITLE
- Add profile registry, resolver, and supporting utilities to tunet_base.js

### STATUS
- `PLANNED`

### SOURCE_ITEMS
- `unified_tile_architecture_conclusion.md` v3.1: §7 (SIZE_PROFILES), §8 (Resolver API), §6 (Preset-to-Family Mapping), §14 (deepMerge), §9 (_setProfileVars TOKEN_MAP), §12 (Version Handshake)
- `plan.md`: T-011A.7 carry-forward → "Next implementation step: G1 base primitives in tunet_base.js"

### GOAL
- Add the complete profile consumption infrastructure to `tunet_base.js` so that G2 pilot cards can import and use it. No card behavior changes — this is foundation only.

### WHY_NOW
- Every subsequent gate (G2–G6) depends on these primitives existing in `tunet_base.js`. This is the critical path.
- Purely additive — zero risk to existing card behavior.

### USER_VISIBLE_OUTCOME
- No visual change. All existing cards continue working identically.
- `window.TunetBase.PROFILE_SCHEMA_VERSION` becomes queryable in browser console (verification only).

### FILES_ALLOWED
- `Dashboard/Tunet/Cards/v2/tunet_base.js`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- All card files (`tunet_lighting_card.js`, `tunet_status_card.js`, etc.)
- All YAML files
- All documentation files

### CURRENT_STATE
- `tunet_base.js` (1253 lines) contains CSS tokens, CSS block constants, and utility functions (drag, navigation, card registration, dark mode detection).
- No profile system, no merge utilities, no preset-to-family mapping, no resolver, no registry.
- File ends with `export function clamp(value, min, max)` at line 1250.
- `RESPONSIVE_BASE` (lines 710-780) contains mobile density CSS using `@container` and `@media` fallback. These overlap with future profile tokens but must be preserved as fallback for non-profile cards.

### INTENDED_STATE
- `tunet_base.js` contains all of the above PLUS (appended after line 1253):
  - `PROFILE_SCHEMA_VERSION` constant (`'v1-20260308'`)
  - `FAMILY_KEYS` and `SIZE_KEYS` constants
  - `PROFILE_BASE` size-indexed object (compact/standard/large) — all em strings
  - `SIZE_PROFILES` registry (5 families × 3 sizes)
  - `PRESET_FAMILY_MAP` static lookup
  - `TOKEN_MAP` constant (registry key → CSS custom property name)
  - `selectProfileSize({ preset, layout, widthHint, userSize })` function
  - `resolveSizeProfile({ family, size })` function
  - `autoSizeFromWidth(widthPx)` function
  - `bucketFromWidth(widthPx)` function
  - `deepMerge(base, override)` function with `isPlainObject()` helper
  - `window.TunetBase` global registration object

### EXACT_CHANGE_IN_ENGLISH

All changes are appended after the existing `clamp()` function (after line 1252). No existing code is modified except one deprecation comment on `RESPONSIVE_BASE`.

1. **Add deprecation comment to `RESPONSIVE_BASE`** (line 710):
   - Prepend comment: `// DEPRECATED for profile-driven families — use SIZE_PROFILES instead. Retained as fallback for non-migrated cards.`
   - Do NOT modify the CSS content itself.

2. **Append `PROFILE_SCHEMA_VERSION` export:**
   ```js
   export const PROFILE_SCHEMA_VERSION = 'v1-20260308';
   ```

3. **Append `FAMILY_KEYS` and `SIZE_KEYS` exports:**
   ```js
   export const FAMILY_KEYS = ['tile-grid', 'speaker-tile', 'rooms-row', 'indicator-tile', 'indicator-row'];
   export const SIZE_KEYS = ['compact', 'standard', 'large'];
   ```

4. **Append `PROFILE_BASE` constant** — copy exactly from `unified_tile_architecture_conclusion.md` §7. Size-indexed: `{ compact: {...}, standard: {...}, large: {...} }`. All values are em strings. Include `ddRadius` at each size (compact: `'0.4375em'`, standard: `'0.5em'`, large: `'0.5625em'`).

5. **Append `SIZE_PROFILES` export** — copy exactly from `unified_tile_architecture_conclusion.md` §7. Five family entries, each spreading `PROFILE_BASE[size]` with family-specific overrides.

6. **Append `PRESET_FAMILY_MAP` export:**
   ```js
   export const PRESET_FAMILY_MAP = {
     lighting:    'tile-grid',
     rooms:       'tile-grid',
     'rooms-row': 'rooms-row',
     speakers:    'speaker-tile',
     status:      'indicator-tile',
     sensor:      'indicator-row',
     environment: 'indicator-row',
   };
   ```

7. **Append `TOKEN_MAP` export** — maps every registry key to its `--_tunet-*` CSS custom property name. Copy from `unified_tile_architecture_conclusion.md` §9 `_setProfileVars` TOKEN_MAP constant. Must cover all keys that appear in any SIZE_PROFILES entry.

8. **Append `autoSizeFromWidth(widthPx)` export:**
   ```js
   export function autoSizeFromWidth(widthPx) {
     if (!widthPx || widthPx <= 0) return 'standard';
     if (widthPx < 600) return 'compact';
     return 'standard';
     // 'large' is only reachable via explicit tile_size config
   }
   ```

9. **Append `bucketFromWidth(widthPx)` export:**
   ```js
   export function bucketFromWidth(widthPx) {
     if (!widthPx || widthPx <= 0) return 'md';
     if (widthPx < 400) return 'xs';
     if (widthPx < 600) return 'sm';
     if (widthPx < 800) return 'md';
     return 'lg';
   }
   ```

10. **Append `selectProfileSize` export** — copy exactly from `unified_tile_architecture_conclusion.md` §6. Rooms routing: `layout === 'row' ? 'rooms-row' : preset`. Unknown preset: warn + fallback to `tile-grid`.

11. **Append `resolveSizeProfile` export** — copy exactly from `unified_tile_architecture_conclusion.md` §8. Unknown family: warn + fallback to `tile-grid` standard. Unknown size: warn + fallback to `standard`.

12. **Append `deepMerge` and `isPlainObject` exports** — copy exactly from `unified_tile_architecture_conclusion.md` §14. Four invariants: undefined = skip, null = explicit clear, arrays replace entirely, plain objects recurse.

13. **Append `window.TunetBase` global registration** at end of file:
    ```js
    window.TunetBase = {
      PROFILE_SCHEMA_VERSION,
      selectProfileSize,
      resolveSizeProfile,
      SIZE_PROFILES,
      PRESET_FAMILY_MAP,
      deepMerge,
      TOKEN_MAP,
    };
    ```

### ARCHITECTURAL_INTENTION
- Establish the shared profile infrastructure that all pilot tranche cards will import at G2.
- `window.TunetBase` enables the version handshake guard (`_checkBaseCompat()`) that cards will add at G2.
- `TOKEN_MAP` export eliminates the need for each card to duplicate the key→CSS-var mapping.
- All-em values (D18) mean a single `font-size` on `:host` becomes the master density lever.
- No behavior change guarantees zero regression risk.

### ACCEPTANCE_CRITERIA
- [ ] `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passes (no syntax errors)
- [ ] All 15 family+size combinations (5 families × 3 sizes) return objects with no `undefined` values
- [ ] `resolveSizeProfile({ family: 'tile-grid', size: 'standard' })` returns expected values
- [ ] `resolveSizeProfile({ family: 'unknown', size: 'standard' })` warns + returns `tile-grid` standard
- [ ] `resolveSizeProfile({ family: 'tile-grid', size: 'slim' })` warns + returns `tile-grid` standard
- [ ] `selectProfileSize({ preset: 'rooms', layout: 'row', widthHint: 400 })` returns family `rooms-row`
- [ ] `selectProfileSize({ preset: 'rooms', layout: 'grid', widthHint: 400 })` returns family `tile-grid`
- [ ] `selectProfileSize({ preset: 'speakers', layout: 'grid', widthHint: 700 })` returns family `speaker-tile`
- [ ] `selectProfileSize` with explicit `userSize: 'large'` returns `large` regardless of `widthHint`
- [ ] `selectProfileSize` with unknown preset warns + returns `tile-grid`
- [ ] `autoSizeFromWidth(0)` returns `'standard'`
- [ ] `autoSizeFromWidth(350)` returns `'compact'`
- [ ] `autoSizeFromWidth(700)` returns `'standard'`
- [ ] `deepMerge({a:1},{a:2})` returns `{a:2}` (primitive override)
- [ ] `deepMerge({a:1},{a:undefined})` returns `{a:1}` (undefined skip)
- [ ] `deepMerge({a:1},{a:null})` returns `{a:null}` (null clear)
- [ ] `deepMerge({a:[1,2]},{a:[3]})` returns `{a:[3]}` (array replace)
- [ ] `deepMerge({actions:{tap:'toggle',hold:'more-info'}},{actions:{tap:'navigate'}})` returns `{actions:{tap:'navigate',hold:'more-info'}}` (object recurse)
- [ ] `window.TunetBase.PROFILE_SCHEMA_VERSION` equals `'v1-20260308'`
- [ ] `TOKEN_MAP` has entries for all PROFILE_BASE keys + all family extension keys (verify count ≥ 48)
- [ ] All existing card behavior is unchanged (no imports of new code yet)
- [ ] All values in SIZE_PROFILES are strings ending in 'em' (no raw numbers, no px)
- [ ] `PROFILE_BASE` has exactly 3 keys: `compact`, `standard`, `large`
- [ ] Each PROFILE_BASE size has exactly 25 keys (including `ddRadius`)

### VALIDATION

**Static validation:**
- `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` — syntax check
- Inspect that all `export` keywords are present on public API functions/constants
- Verify TOKEN_MAP key count matches the sum of unique keys across all SIZE_PROFILES entries
- Verify no existing exports were modified (diff should show only additions + one comment)

**Runtime validation:**
- Create a temporary test script that imports tunet_base.js and runs acceptance assertions:
  ```js
  // temp_profile_test.mjs (not committed)
  import { resolveSizeProfile, selectProfileSize, deepMerge, SIZE_PROFILES, FAMILY_KEYS, SIZE_KEYS } from './tunet_base.js';
  // ... run assertions, log pass/fail
  ```
- Log output from `selectProfileSize` and `resolveSizeProfile` for manual inspection

**HA/live validation:**
- Not required for this tranche — no card behavior changes
- Optionally: load updated `tunet_base.js` resource and verify `window.TunetBase.PROFILE_SCHEMA_VERSION` in browser console

### DEPLOY_IMPACT
- `REPO ONLY` — no HA deploy in this tranche
- Cards don't import the new exports yet; deploy happens at G2 when cards consume the profile system

### ROLLBACK
- Revert the appended code block in `tunet_base.js` (everything after the current line 1253)
- Remove the deprecation comment from `RESPONSIVE_BASE`
- The file returns to its pre-tranche state with zero side effects

### DEPENDENCIES
- `unified_tile_architecture_conclusion.md` v3.1 must be finalized (DONE)
- Branch must be `claude/dashboard-nav-research-QnOBs`

### UNKNOWNS
- `RESPONSIVE_BASE` (lines 710-780) mobile density CSS overlaps with profile tokens. At G1, both coexist. At G2+, profile-driven cards transition away from `RESPONSIVE_BASE` vars. Full removal is a G6 concern.
- Whether `progressH` should be `'0em'` for `indicator-tile` and `indicator-row` families (old design had `0`; new registry inherits non-zero from PROFILE_BASE). Currently following the user's v3.1 registry as-is. Flag for confirmation during G3.

### STOP_CONDITIONS
- If adding the code block causes `node --check` failure that cannot be resolved within `tunet_base.js`
- If the file exceeds 2000 lines (indicates scope creep — split the tranche)
- If any existing export is modified beyond the one deprecation comment on `RESPONSIVE_BASE`
- If implementation requires touching any card file

### OUT_OF_SCOPE
- Card file changes (G2)
- Width source fixes in `tunet_lighting_card.js` or `tunet_status_card.js` (T-G1.2)
- Unit test file creation (T-G1.3)
- `RESPONSIVE_BASE` removal or functional modification
- `_setProfileVars()` implementation (lives in card files, added at G2)
- `_checkBaseCompat()` / `_renderError()` (lives in card files, added at G2)
- Card editor UI changes
- Live HA deployment

### REVIEW_FOCUS
- Scope discipline: only `tunet_base.js` touched, only appended code (+ one comment)
- Registry completeness: all 5 families × 3 sizes present with no `undefined` values
- All em values match `unified_tile_architecture_conclusion.md` §7 exactly — no transcription errors
- TOKEN_MAP completeness: every key that appears in any SIZE_PROFILES entry has a TOKEN_MAP mapping
- `deepMerge` implementation matches §14 exactly
- `selectProfileSize` rooms routing matches §6 exactly
- `window.TunetBase` exposes the correct exports for version handshake
- No existing code was modified (except the one RESPONSIVE_BASE comment)
