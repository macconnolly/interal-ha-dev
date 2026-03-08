You are Codex operating inside the Tunet Home Assistant custom cards repo

Your job is to implement the Tunet family profile consumption system exactly as specified in `tunet_profile_architecture_v3.md`

Authority and interpretation rules

- `tunet_profile_architecture_v3.md` is the sole architecture authority
- `Dashboard/Tunet/Cards/v2/` is the implementation authority
- `design_language.md` and `Cards/` are read-only design-intent references only
- Do not reopen architecture decisions
- Do not simplify the system back to 3 families
- Do not replace the two-function API with a different abstraction
- Do not remove gates, rollback controls, or version-handshake behavior
- Treat all D1 through D17 decisions as locked, even though the checklist incorrectly says 12 decisions

Primary objective

Implement the v3 profile consumption system across the pilot tranche without regressing existing interaction behavior, while preserving rollback and visible failure handling

Target files and scope

In scope
- `Dashboard/Tunet/Cards/v2/tunet_base.js`
- `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`

Explicitly excluded from migration
- `tunet_nav_card.js`
- `tunet_media_card.js`
- `tunet_sonos_card.js`
- `tunet_weather_card.js`

Special excluded-card rule
- Before G3 regression work, neutralize `tunet_nav_card.js` `ensureGlobalOffsetsStyle()` enough that it cannot corrupt section sizing measurements during testing
- Do not otherwise refactor excluded cards

Non-negotiable architecture to implement

1. Family model
- Use exactly 5 families
  - `tile-grid`
  - `speaker-tile`
  - `rooms-row`
  - `indicator-tile`
  - `indicator-row`

2. Two-function API
- `selectProfileSize({ preset, layout, widthHint, userSize })`
  - decides family + size
- `resolveSizeProfile({ family, size })`
  - pure lookup only
- Resolver accepts only `family` and `size`
- No `densityMode`
- No `widthHint` in resolver

3. Size vocabulary
- Only `compact`, `standard`, `large`
- `compact` is the dense mode
- `slim` is a layout variant, not a profile size
- `large` is explicit-only, never auto-selected

4. Width policy
- Container-first only
- `widthHint` must come from card ResizeObserver measurement
- `window.innerWidth` is forbidden for profile-driven families
- `matchMedia` sizing branches must be removed from profile-driven cards
- `window.resize` listeners in sizing paths must be removed

5. CSS variable protection model
- Public hooks use `--profile-*`
- Internal consumed aliases use `--_tunet-*`
- Internal consumers never read `--profile-*`
- `_setProfileVars(profile)` must
  - write to `this`, not `this.shadowRoot`
  - clear all existing `--_tunet-*` first
  - set all core lane tokens
  - set family-specific extension tokens only when present
  - bridge approved public hooks into internal aliases

6. Trigger and lifecycle model
- `_applyProfile()` is the single convergence point
- `setConfig(config)` triggers merge then `_applyProfile()`
- ResizeObserver callback updates width then `_applyProfile()`
- `set hass(hass)` must not generically trigger `_applyProfile()`
- Use instance-level cache only
- No module-level profile cache
- Use visibility hidden until first real ResizeObserver measurement to prevent first-render size flash

7. Feature flag and rollback
- Per-card `use_profiles: false` must fall back to preserved pre-migration logic via `_applyLegacyScaling()`
- Global `window.TUNET_USE_PROFILES = false` must also disable profiles
- Legacy scaling must remain intact through G6
- Do not delete rollback code early
- Surface `use_profiles` toggle in the card editor UI

8. Version handshake and visible failure
- Add `PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD'`
- Add `REQUIRED_PROFILE_FEATURES`
- Every migrated card must call `_checkBaseCompat()`
- Base/version failure must render visible in-card error via `_renderError()`
- Blank-card failure is unacceptable

9. Merge rules
- Implement `deepMerge()` exactly per v3 semantics
- Plain objects recurse
- primitives override
- `undefined` does not override
- arrays replace entirely
- `null` is explicit clear

10. Dark mode boundary
- Profile registry is geometry only
- No colors, opacity, shadows, or theme-conditionals in profiles
- No dark-mode branches in `SIZE_PROFILES`

Implementation order

Execute in gated order
- G1 base primitives and width-source prerequisite fixes
- G2 two-card pilot
- G3 interaction-heavy families
- G4 standalone tile alignment
- G5 sections size-hint calibration
- G6 cleanup only after full success criteria and soak conditions are satisfied

Execution requirements

- Read existing repo code first before editing
- Preserve all existing interaction logic unless v3 explicitly says to change it
- Preserve existing render behavior where v3 says “what stays”
- Keep changes minimal but complete
- Do not do speculative refactors
- Do not create a second profile system
- Do not move behavior logic into profiles
- Do not collapse family-specific extension tokens into generic freeform tokens
- Do not touch excluded cards beyond nav neutralization
- Prefer small, reviewable commits or patches aligned to gates

Detailed implementation tasks

G1 — Base primitives and width-source prerequisites

Modify `tunet_base.js`
- Add
  - `PROFILE_SCHEMA_VERSION = 'v1-YYYYMMDD'`
  - `REQUIRED_PROFILE_FEATURES`
  - `FAMILY_KEYS`
  - `SIZE_KEYS`
  - `PROFILE_BASE`
  - `PRESET_FAMILY_MAP`
  - `SIZE_PROFILES`
  - `selectProfileSize()`
  - `resolveSizeProfile()`
  - `autoSizeFromWidth()`
  - `bucketFromWidth()`
  - `deepMerge()`
  - `isPlainObject()`
- Implement exact family mapping
  - `lighting` -> `tile-grid`
  - `speakers` -> `speaker-tile`
  - `rooms` -> `tile-grid`
  - `rooms-row` -> `rooms-row`
  - `status` -> `indicator-tile`
  - `environment` -> `indicator-row`
- Implement exact registry behavior from v3
- Implement warn + fallback behavior
  - unknown family -> `tile-grid` standard
  - unknown size -> family standard

Registry values to implement exactly

`PROFILE_BASE`
- `iconBox: 38`
- `iconGlyph: 19`
- `nameFont: 13`
- `valueFont: 18`

`tile-grid`
- compact: `tilePad: 10`, `tileGap: 4`, `progressH: 7`
- standard: `tilePad: 14`, `tileGap: 6`, `progressH: 8`
- large: `iconBox: 44`, `iconGlyph: 22`, `tilePad: 16`, `tileGap: 8`, `progressH: 10`

`speaker-tile`
- compact: `tilePad: 8`, `tileGap: 4`, `progressH: 6`
- standard: `tilePad: 12`, `tileGap: 6`, `progressH: 8`
- large: `iconBox: 44`, `iconGlyph: 22`, `tilePad: 16`, `tileGap: 8`, `progressH: 10`

`rooms-row`
- compact: `tilePad: 8`, `tileGap: 4`, `progressH: 6`, `rowHeight: 48`, `orbSize: 28`, `orbGap: 3`, `toggleSize: 36`, `chevronSize: 20`
- standard: `tilePad: 12`, `tileGap: 6`, `progressH: 7`, `rowHeight: 56`, `orbSize: 32`, `orbGap: 4`, `toggleSize: 42`, `chevronSize: 24`
- large: `iconBox: 44`, `iconGlyph: 22`, `tilePad: 16`, `tileGap: 8`, `progressH: 9`, `rowHeight: 72`, `orbSize: 40`, `orbGap: 5`, `toggleSize: 52`, `chevronSize: 28`

`indicator-tile`
- compact: `tilePad: 8`, `tileGap: 4`, `progressH: 0`, `dropdownPad: 6`, `auxActionSize: 32`
- standard: `tilePad: 12`, `tileGap: 6`, `progressH: 0`, `dropdownPad: 8`, `auxActionSize: 38`
- large: `iconBox: 44`, `iconGlyph: 22`, `tilePad: 16`, `tileGap: 8`, `progressH: 0`, `dropdownPad: 10`, `auxActionSize: 44`

`indicator-row`
- compact: `tilePad: 6`, `tileGap: 4`, `progressH: 0`, `sparklineH: 24`, `trendSize: 16`
- standard: `tilePad: 10`, `tileGap: 6`, `progressH: 0`, `sparklineH: 32`, `trendSize: 20`
- large: `iconBox: 44`, `iconGlyph: 22`, `tilePad: 14`, `tileGap: 8`, `progressH: 0`, `sparklineH: 40`, `trendSize: 24`

Modify `tunet_lighting_card.js`
- Remove `window.innerWidth` sizing path
- Remove `matchMedia` sizing branches related to row height or responsive sizing
- Use ResizeObserver-based container measurement only

Modify `tunet_status_card.js`
- Remove `window.resize` listener from sizing path
- Keep container measurement via ResizeObserver and ensure any `getBoundingClientRect()` sizing read occurs inside that callback only

Modify `tunet_base.js`
- Mark viewport thresholds in `RESPONSIVE_BASE` as deprecated for profile-driven families
- Retain them only as documentation/reference, not active profile logic

G2 — Two-card pilot

Modify `tunet_lighting_card.js`
- Add `_checkBaseCompat()`
- Add `_renderError(message)`
- Preserve old sizing logic as `_applyLegacyScaling()`
- Add `_applyProfile()`
- Add ResizeObserver lifecycle
- Add instance cache
- Add `_setProfileVars(profile)` writing internal aliases on `this`
- Add `use_profiles` flag support
- Add editor UI toggle for `use_profiles`
- Remove hardcoded compact/large lane geometry from render/CSS path where profile vars should now drive geometry

Modify `tunet_speaker_grid_card.js`
- Apply same profile-consumption pattern as lighting card
- Preserve container-query column logic
- Add explicit code comment that
  - container queries govern column count
  - profile vars govern tile geometry
  - these are separate and should not be consolidated

G3 — Interaction-heavy families

Modify `tunet_status_card.js`
- Apply profile pattern using `indicator-tile`
- Profile should drive only structural base-lane geometry
- Keep dropdown overflow height, alarm sizing, timer display logic card-local
- Maintain `progressH: 0` behavior

Modify `tunet_rooms_card.js`
- Grid layout -> `tile-grid`
- Row layout -> `rooms-row`
- `layout_variant: 'slim'` must remain local CSS/class logic, not resolver logic
- Keep row semantics card-local
  - tap navigate
  - hold popup
  - orb toggle
  - all-toggle

Before G3 regression work
- Neutralize `tunet_nav_card.js` `ensureGlobalOffsetsStyle()` enough that it does not contaminate section sizing measurements

G4 — Standalone tile alignment

Modify `tunet_light_tile.js`
- Align standalone tile to `tile-grid`
- Ensure tile-core consumes `--_tunet-*` aliases with fallbacks
- Apply same `_applyProfile()` host-driven pattern

G5 — Section sizing calibration

Modify all pilot tranche cards as needed
- Measure actual rendered card heights in real Sections layouts
- Update `getCardSize()`
- Update `getGridOptions()`
- No estimates
- Use measured values

G6 — Cleanup
Only do this if and only if all earlier gates pass and rollback usage is zero after soak
- Remove `_applyLegacyScaling()`
- Remove `use_profiles` checks
- Remove editor toggle
- Remove global disable hook
- Keep `_renderError()` and `_checkBaseCompat()`

Required function contracts

`selectProfileSize({ preset, layout, widthHint, userSize })`
- Determine family from merged config and layout
- Use `userSize` when present
- Otherwise auto-select from `widthHint`
- Unknown preset/layout must warn and fall back to `tile-grid`
- `autoSizeFromWidth(0)` returns `standard`
- width under 600 -> `compact`
- width 600 or above -> `standard`
- `large` only by explicit user size

`resolveSizeProfile({ family, size })`
- Pure lookup
- Never read config
- Never mutate state
- Warn and fall back on unknown family/size
- Return raw numeric values only

`_setProfileVars(profile)`
- Clear all existing `--_tunet-*`
- Set core lane tokens
  - `--_tunet-tile-pad`
  - `--_tunet-tile-gap`
  - `--_tunet-icon-box`
  - `--_tunet-icon-glyph`
  - `--_tunet-name-font`
  - `--_tunet-value-font`
  - `--_tunet-progress-h`
- Set family-specific extension tokens only when present
- Bridge approved public hooks if defined
  - `--profile-tile-pad`
  - `--profile-icon-box`
  - `--profile-name-font`
  - `--profile-value-font`
  - `--profile-progress-h`

Token consumer boundary rules

- Card host is write-only for `--_tunet-*`
- `tile-core` reads only the 7 core lane tokens
- `tunet-row` reads core lane tokens plus row extension tokens
- `indicator-tile` reads core lane tokens plus indicator-tile extension tokens
- `indicator-row` reads core lane tokens plus indicator-row extension tokens
- `tunet-tile` passes tokens through and must not reinterpret them
- Never define `--_tunet-*` inside a shadow-root stylesheet

Do not do any of the following

- Do not reintroduce `densityMode`
- Do not pass `window.innerWidth` as `widthHint`
- Do not define `slim` in `SIZE_PROFILES`
- Do not call `_applyProfile()` from generic `set hass()`
- Do not use module-level cache
- Do not put profile vars on `this.shadowRoot`
- Do not read `--profile-*` directly in tile-core
- Do not encode tap/hold behavior in profiles
- Do not migrate all cards in one ungated tranche
- Do not delete legacy scaling before G6
- Do not add dark/light branches to profile registry
- Do not change visual semantics in excluded cards
- Do not use config-key parity as success criteria

Testing and acceptance requirements

Create or update unit tests for base primitives
- all 15 family-size combinations complete with no `undefined`
- unknown family warns + returns `tile-grid` standard
- unknown size warns + returns family standard
- `PROFILE_BASE` shared values confirmed between `tile-grid` and `speaker-tile`
- `indicator-tile` and `indicator-row` always have `progressH: 0`
- `rooms-row` always returns row-specific keys
- `selectProfileSize` returns correct family for rooms row vs grid
- explicit `userSize: 'large'` overrides width
- `autoSizeFromWidth(0)` => `standard`
- `autoSizeFromWidth(350)` => `compact`
- `autoSizeFromWidth(700)` => `standard`
- deepMerge tests for primitive override, undefined skip, null clear, array replace, object recurse

Run regression checks or implement a documented checklist for
- 390×844
- 768×1024
- 1024×1366
- 1440×900

Gate-specific pass criteria to satisfy

G1
- No visual change vs baseline for lighting and status at all breakpoints
- No `window.innerWidth` in lighting sizing path
- No `matchMedia` in lighting sizing path
- No `window.resize` listener in status sizing path

G2
- Lighting and speaker cards consume profile vars correctly
- Shared core PROFILE_BASE values match where intended
- Differing tilePad/progressH values differ exactly where intended
- Lighting drag-to-brightness still works
- Speaker drag-to-volume still works
- Speaker group toggle still works
- Lighting tap-to-toggle still works
- `use_profiles: false` reverts to legacy visual
- Global disable works
- Missing `PROFILE_SCHEMA_VERSION` shows visible error card

G3
- Status dropdown/alarm/timer behaviors unchanged
- Rooms row semantics unchanged
- Slim remains local layout logic
- Nav injection is neutralized during measurement/testing

G4
- Standalone `tunet-light-tile` aligns visually and by computed vars with lighting-card tile

G5
- No clipping, overlap, or section allocation regressions
- `getCardSize()` values within 10 percent of measured rendered height

G6
- Only after full prior success and soak
- Remove rollback code and flags together
- Keep visible error/version guard

Expected deliverables

1. Code changes implementing G1 through G5 unless blocked by missing repo context
2. Minimal nav neutralization needed for clean G3 measurement
3. Unit tests for base primitives and merge behavior
4. Inline code comments where future maintainers are likely to regress the architecture
5. A concise implementation summary at the end including
- files changed
- gate reached
- tests added or updated
- remaining blockers if any
- exact follow-up required for the next gate

Output style requirements

- Do the implementation, not a broad architecture rewrite
- Be explicit about any blocker
- If repo reality differs from the document, prefer the document and note the mismatch
- Preserve working behavior wherever the file authority map says “what stays”
- Keep patches reviewable and scoped to the gate sequence