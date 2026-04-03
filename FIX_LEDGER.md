# Tunet Suite Fix Ledger

Working branch: `main`
Last updated: 2026-04-03
Scope: `/home/mac/HA/implementation_10`
Active plan (method-level): `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md`
Active execution plan: `~/.claude/plans/flickering-herding-wolf.md` (single source of truth, CD0–CD12)

## Session Delta (2026-04-03, CD2 Closeout)

Change marker: CD2 tranche closure

- `AUTHORITY-LOCK`
  - `Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md` is the sole canonical execution plan.
  - `~/.claude/plans/flickering-herding-wolf.md` is the single source of truth (CD0–CD12).
- `CURRENT STATE`
  - CD2 — Shared Interaction Adoption: **DONE** (Apr 3, 2026)
  - CD3 — Shared Semantics Adoption: next tranche
- `CD2 CLOSURE EVIDENCE`
  - interaction_source_contract.test.js: 146/146 pass
  - interaction_dom_contract.test.js: 66/66 pass (mock hass, zero skips)
  - Full npm test: 368/368 pass (7 suites)
  - npm run tunet:build: 13 cards built
  - Deploy: 13 cards SCP'd, Lovelace resources bumped to ?v=20260403_cd2
  - Server verification: zero transition:all, hover guards present, press tokens present across all cards
  - Lab rendering: all 13 cards visible at 1440×900, zero red-card errors
  - Climate non-regression: visual match to baseline at desktop width
  - Screenshot matrix: 1440×900 light captured and verified; 390×844, 768×1024, 1024×1366 + dark mode pending user manual verification (no CD2 regressions expected — changes were interaction CSS only, zero layout impact)
- `TRANCHE CLOSURE EVIDENCE (STRICT)`
  - Require `node --check` on changed JS, YAML parse-check on changed YAML, `npm run tunet:build` when outputs are affected, `npm test`, and screenshots at locked breakpoints in both dark and light mode.

## Session Delta (2026-04-02, Consistency-Driver Reset)

Change marker: pre-CD0 (documentation alignment)

- `PROGRAM-RESET`
  - Surface-first execution order superseded
  - Card-family-bucket order (CR0-CR10) ALSO superseded
  - Active execution order is **consistency-driver pass order (CD0-CD12)**:
    - CD0: Build architecture + rehab lab — **next implementation tranche**
    - CD1: Configuration clarity + editor policy (tiered: editor-complete / editor-lite / yaml-first)
    - CD2: Shared interaction adoption (all 13 files, one pass)
    - CD3: Shared semantics adoption (6 files with gaps)
    - CD4: Shared sizing + Sections adoption (6+ files)
    - CD5-CD11: Bespoke card passes (utility strip, lighting, rooms, environment, media, nav verify, status gate)
    - CD12: Surface assembly
  - Rule: shared passes close one dimension across an explicit file list; bespoke passes solve only file-specific behavior remaining
- `GOVERNANCE-KEEP`
  - Three-surface leadership model remains active
  - Climate baseline remains locked
  - Browser Mod popup direction remains active
  - Locked breakpoints remain unchanged
  - No-destructive-cleanup discipline remains unchanged
- `CONFIGURATION SUPPORT POLICY`
  - `editor-complete`: nav, scenes, light_tile, weather, sensor
  - `editor-lite`: lighting, rooms, climate, media, sonos, speaker_grid
  - `yaml-first`: actions, status
- `SURFACE-DOC STATUS`
  - `Dashboard/Tunet/Docs/surfaces/living_room_surface_intent.md` is draft reference only until CD12 surface assembly
- `NEXT TRANCHE`
  - CD0 = Build architecture + rehab lab (COMPLETED Apr 3, 2026)
  - CD1 = Configuration clarity + editor policy (COMPLETED Apr 3, 2026)
  - Card rehab lab becomes the primary validation surface during shared and bespoke passes

## Session Delta (2026-04-02, Tranche 0 — Contract Reconciliation)

Change marker: `Tranche 0`

- `GOVERNANCE-RESET`
  - Profile resolver contract superseded as policy (see `Dashboard/Tunet/Agent-Reviews/profile_contract_supersession.md`)
  - Surface-driven execution model adopted; card work in service of surfaces
  - Build migration sequenced after Surface 1
  - All CLAUDE.md, AGENTS.md updated to reflect current decisions
- `OPEN ISSUES — CURRENT STATE`
  - KI-001 (drag brightness broken): fix candidate deployed at `?v=20260314_v3b`, awaiting user validation
  - KI-002 (no visual config editors): reframed as surface-driven; verify getConfigForm() per surface tranche
  - KI-003 (rooms row toggle oversized): power button same size as orbs is CORRECT/INTENTIONAL — not a bug
  - Status profiles broken: root cause is missing `:host { font-size: 16px }` em anchor — G3S scope, bugfix-only
  - Light tile compact spacing: drag bar too thick, % too close to bar, icons too close to top — surface tranche work
  - Rooms text truncation: "bri" abbreviation + narrow container — surface tranche work
  - Weather forecast config: forecast_days/hours work but visual display doesn't expand — surface tranche work
- `V3 REGRESSION FIXES (COMMITTED, NOT DEPLOYED)`
  - getGridOptions() rows:'auto' + min_rows restored on 7 non-profile v3 cards
  - Nav card G3.0 neutralization backported (version → 0.2.4)
- `DESIGN DOC RECONCILIATION (IN PROGRESS)`
  - 4-agent review running: HA research, CSS map, feasibility critique
  - Dark amber resolved: #fbbf24 is correct (code + memory lock); v8.3 #E8961E is stale
  - Glass opacity: code uses 0.68/0.72, v8.3 says 0.55/0.65 — v8.3 stale
  - Cross-card interaction state vocabulary: 10 divergences identified across 13 cards
  - 3 cards (media, weather, sonos) have zero :focus-visible — accessibility debt
- `SCOPE LOCKS — CURRENT STATE`
  - Status → G3S: RESPECTED (bugfix-only)
  - G6.1 soak: 24/30 days elapsed; gate opens Apr 9
  - Profile contract: SUPERSEDED AS POLICY
  - Breakpoints: LOCKED (390×844, 768×1024, 1024×1366, 1440×900)
- `EM PREFERENCE`
  - User confirmed: prefer em over px for all sizing (shadows, spacing, typography)
  - Status card em-based shadows are the correct pattern; other cards should migrate TO em
  - Climate card hardcoded px values are legacy debt for surface tranche migration
  - 16px em anchor (:host { font-size: 16px }) is CRITICAL and must be documented in spec

## Session Delta (2026-03-13, T-011A.22)

Change marker: `T-011A.22`

- `ISSUE-CAPTURED (COLUMN RGB LATE-ON GAP)`
  - Observed live behavior: sunset prepare automation can abort when columns are off at the sunset trigger crossing.
  - If columns are then turned on during the same active window, RGB session may not auto-arm.
  - Resulting state can keep AL ownership at low brightness and produce purple/pink-leaning output on column strips.
- `PLANNED-FIX (QUEUED, NOT EXECUTED)`
  - Extend prepare coverage with late-on triggers so column-on events in active sunset window execute the same prepare path.
  - Preserve existing window/guard predicates (descending sun window, sleep-mode off, manual empty, system not paused).
- `SCOPE`
  - docs + backlog capture only
  - no package automation edits in this delta

## Session Delta (2026-03-09, T-011A.21)

Change marker: `T-011A.21`

- `CODE-DONE (STATUS BUGFIX-ONLY PX->EM HYGIENE)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - converted remaining status `px` geometry/typography constants to equivalent `em` values
    - converted inline aux-icon style string (`12px` -> `0.75em`)
    - converted dropdown JS offset string (`4px` -> `0.25em`)
    - no interaction-contract changes
    - no new status architecture rollout work
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `POLICY`
  - remains within deferred-status bugfix-only allowance (`T-011A.20`)

## Session Delta (2026-03-09, T-011A.20)

Change marker: `T-011A.20`

- `DIRECTION-LOCK-UPDATE (STATUS DEFERRED)`
  - `tunet_status_card.js` is deferred from the active unification tranche gates.
  - status remains bugfix-only until deferred status-alignment tranche `G3S`.
  - non-status family rollout is no longer blocked by status architecture completion.
- `STATUS ALIGNMENT TRANCHE (G3S) LOCKED SCOPE`
  - lightweight subtype alignment (`timer`, `alarm`, `dropdown`, `value`) using existing shared tokens where low-risk
  - continue `px` -> `em` normalization and remove obvious inline size formulas where safe
  - unit + live breakpoint checks (`390x844`, `768x1024`, `1024x1366`, `1440x900`) using real HA entities
- `DOC-SYNC`
  - updated:
    - `Dashboard/Tunet/Mockups/design_language.md`
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
    - `plan.md`
    - `FIX_LEDGER.md`
    - `handoff.md`

## Session Delta (2026-03-09, T-011A.19)

Change marker: `T-011A.19`

- `CODE-DONE (PROFILE TOKEN NORMALIZATION PASS)`
  - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - added centralized profile token lanes for:
      - header title/subtitle
      - display name/value/meta/action/icon
      - row display name/status, row lead icon, row control size/icon
      - status tile gap/pad-top/pad-bottom
      - timer display font, dropdown value font
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - now consumes shared header/display aliases for profile text lanes
    - removed local profile multipliers
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - now consumes shared header/display aliases for profile text lanes
    - removed local profile multipliers
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - profile sizing now reads centralized status/display/timer/dropdown tokens
    - removed card-local profile scaling formulas
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - tile + row typography/icon/control lanes now read centralized display/row tokens
    - removed profile-size-specific multiplier overrides
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - profile icon/label/value lanes now read centralized display tokens
    - removed profile multiplier overrides
  - base import cache-key sync
    - updated v3 imports to `./tunet_base.js?v=20260309g7` in:
      - `tunet_lighting_card.js`
      - `tunet_speaker_grid_card.js`
      - `tunet_status_card.js`
      - `tunet_rooms_card.js`
      - `tunet_sensor_card.js`
      - `tunet_light_tile.js`
- `VALIDATION`
  - `node --check` passed for:
    - `Dashboard/Tunet/Cards/v3/tunet_base.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `DEPLOYMENT`
  - not run in this tranche

## Session Delta (2026-03-09, T-011A.18)

Change marker: `T-011A.18`

- `CODE-DONE (ROOMS ROW CONTROL SIZE PARITY)`
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - row lead icon reduced
    - compact row sub-buttons enlarged
    - standard row text reduced slightly
    - all-on/off row action button and orb sub-buttons now use identical size variable (`--row-btn-size`)
- `DEPLOYMENT`
  - uploaded rooms v3 file to HA
  - resource bumped:
    - rooms `55d3848b00224adebed2a79bcc2d9904` -> `...g348`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_rooms_card.js` passed

## Session Delta (2026-03-09, T-011A.17)

Change marker: `T-011A.17`

- `CODE-DONE (STATUS PROFILE LANE BALANCE)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - corrected profile bottom-lane crowding by increasing tile bottom padding
    - increased icon scale (box + glyph) in profile mode
    - increased bottom label size and centered lane boxes for icon/value/label alignment consistency
- `CODE-DONE (SENSOR PROFILE PARITY TUNE)`
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - applied light-tile parity formulas to profile label/value sizing
    - increased profile icon scale for better lane balance
- `DEPLOYMENT`
  - uploaded status + sensor v3 files to HA
  - updated resources:
    - status `7bbb4f68cb5944bdb8586673420cf69a` -> `...g347`
    - sensor `d27faab6495e4717a8d9313117556f84` -> `...g347`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_sensor_card.js` passed

## Session Delta (2026-03-09, T-011A.16)

Change marker: `T-011A.16`

- `CODE-DONE (STATUS PROFILE READABILITY CORRECTIONS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - increased profile icon lane scale
    - tightened profile tile vertical spacing to pull middle value lane upward
    - applied lighting-parity typography formulas to profile middle/bottom lanes
    - bumped timer and dropdown text sizing in profile mode
- `CODE-DONE (ROOMS PROFILE TEXT + ROW-CONTROL CORRECTIONS)`
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - applied lighting-parity profile typography to tiles and row variant title/status lanes
    - reduced per-room row toggle size while increasing per-light orb size
    - widened row control spacing to reduce accidental taps
    - added row-controls target guard in pointer-up path to prevent body-route/toggle side effects when interacting in control region
- `CODE-DONE (SENSOR PROFILE ADOPTION)`
  - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
    - wired profile selection/resolution + host token writes (`indicator-row` family)
    - added `tile_size` / `use_profiles` config surface
    - added container-width observer path and sections-safe grid hints
    - migrated row internals to profile token lanes (icon/text/value/unit/sparkline/trend geometry)
- `LAB-YAML-EXPANDED`
  - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - added legacy/profile sensor permutations for compact/standard/large comparisons
- `DEPLOYMENT`
  - uploaded `tunet_status_card.js`, `tunet_rooms_card.js`, `tunet_sensor_card.js` to `/homeassistant/www/tunet/v3/`
  - uploaded updated `tunet-g2-lab-v3.yaml` to `/homeassistant/dashboards/`
  - updated HA resources:
    - status -> `/local/tunet/v3/tunet_status_card.js?v=20260309_g346`
    - rooms -> `/local/tunet/v3/tunet_rooms_card.js?v=20260309_g346`
    - sensor -> `/local/tunet/v3/tunet_sensor_card.js?v=20260309_g346`
- `VALIDATION`
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
  - `python3` + `yaml.safe_load` parse passed (`Dashboard/Tunet/tunet-g2-lab-v3.yaml`)
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

## Session Delta (2026-03-09, T-011A.15)

Change marker: `T-011A.15`

- `CODE-DONE (G3 STATUS + ROOMS)`
  - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - added profile routing and host token application:
      - `selectProfileSize({ preset: 'status', ... })`
      - `resolveSizeProfile(...)`
      - `_setProfileVars(...)`
    - added `use_profiles` + `tile_size` config surface
    - status subtype internals moved to profile tokens:
      - timer font/letter-spacing
      - alarm pill + action button sizing
      - dropdown menu max-height + option geometry
    - removed viewport fallback from responsive width source (`window.innerWidth`)
  - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - added profile routing + host token application with layout-aware family selection
    - added `use_profiles` + `tile_size` config surface
    - family routing lock implemented:
      - rooms tiles -> `tile-grid`
      - rooms row/slim -> `rooms-row`
    - row controls/orbs/icon/text geometry now consumes `--_tunet-*` row tokens
    - slim row min-height now scales from profile row height (`~70%` target)
    - added host resize observer for width-driven profile updates
- `CODE-DONE (G4 STANDALONE TILE)`
  - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - added `tile_size` + `use_profiles` config options
    - added profile application pipeline on tile host (`tile-grid`)
    - aligned tile CSS lanes to `--_tunet-*` internal aliases
    - kept drag/tap/hold interaction behavior unchanged
    - added host resize observer for profile auto-size refresh
- `CODE-DONE (G5 GRID HINT HARDENING)`
  - set `rows: 'auto'` with static min/max row bounds in:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
  - removed viewport fallback width source from:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
- `VALIDATION`
  - `node --check` passed for:
    - `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - no HA live deploy/resource mutation in this tranche
  - no interaction-contract changes

## Session Delta (2026-03-09, T-011A.12)

Change marker: `T-011A.12`

- `LIVE-LAB-DEPLOYED`
  - created and uploaded YAML lab dashboard for G2 profile/legacy comparison:
    - `Dashboard/Tunet/tunet-g2-lab-v3.yaml`
    - `/homeassistant/dashboards/tunet-g2-lab-v3.yaml`
  - registered sidebar dashboard key:
    - `tunet-g2-lab-v3` (`dashboards/tunet-g2-lab-v3.yaml`)
- `RESOURCE-CONFLICT-ISOLATION`
  - removed conflicting v2_next resources for active lab cards:
    - `tunet_lighting_card.js`
    - `tunet_speaker_grid_card.js`
  - added active v3 resources:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix1`
    - `/local/tunet/v3/tunet_speaker_grid_card.js?v=20260309_g2_lab`
- `CODE-DONE`
  - patched `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` for user-reported regressions:
    - profile mode missing tile-name lane visibility (height + non-shrinking lane fix)
    - drag brightness pill clipping at top edge (sliding overflow + pill position fix)
    - bottom brightness value too large (profile-mode size softening)
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - HA config check valid
  - HA restart executed and returned success

## Session Delta (2026-03-09, T-011A.13)

Change marker: `T-011A.13`

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - fixed profile tile overlap on desktop by making profile `--grid-row` respect the same minimum floor as tile min-height
    - tightened selector scope so profile lane constraints do not alter legacy mode
- `DEPLOYMENT`
  - uploaded patched v3 lighting card to HA:
    - `/homeassistant/www/tunet/v3/tunet_lighting_card.js`
  - updated active lighting resource to:
    - `/local/tunet/v3/tunet_lighting_card.js?v=20260309_g2_lab_fix3`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed

## Session Delta (2026-03-09, T-011A.14)

Change marker: `T-011A.14`

- `CODE-DONE`
  - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
    - raised profile-mode typography for header + speaker tiles + group action buttons
    - scoped all new typography changes to `:host([use-profiles])` to keep legacy behavior stable
- `DEPLOYMENT`
  - uploaded:
    - `/homeassistant/www/tunet/v3/tunet_speaker_grid_card.js`
  - resource version updates:
    - lighting `442417dfa9854d60ad4a93324b5c0ff0` -> `...fix4`
    - speaker `3e923a37c68c456a9c4e3a772faa22a7` -> `...fix1`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed

## Session Delta (2026-03-09, T-011A.11)

Change marker: `T-011A.11`

- `CONFLICT-CARRY-FORWARD`
  - docs still lock implementation authority to `Dashboard/Tunet/Cards/v2/`
  - active implementation tranche remains in `Dashboard/Tunet/Cards/v3/` by user override
- `CODE-DONE (G2 PILOT WIRING)`
  - wired profile consumption into:
    - `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`
  - both cards now consume:
    - `selectProfileSize({ preset, layout, widthHint, userSize? })`
    - `resolveSizeProfile({ family, size })`
    - `_setProfileVars(...)`
  - added rollback control to both cards:
    - `use_profiles` config boolean (defaults to `true`)
    - `use_profiles: false` keeps legacy tile-size geometry path active
  - lighting profile wiring:
    - apply profile on config set, first render, and host resize
    - profile geometry now drives card/header/tile/icon/text/progress lanes via `--_tunet-*` tokens
    - legacy compact/large CSS overrides are gated to non-profile mode
  - speaker profile wiring:
    - added host resize observer path for profile re-selection
    - profile geometry now drives card/header/tile/icon/text/progress lanes via `--_tunet-*` tokens
    - retained tile-level container-query fallback behavior; legacy compact/large overrides are gated to non-profile mode
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v3/tunet_lighting_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` passed
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)
- `SCOPE`
  - code + docs-sync only
  - no YAML/storage dashboard mutations
  - no deploy/cache-bust actions

## Session Delta (2026-03-08, T-011A.10)

Change marker: `T-011A.10`

- `CONFLICT-RECORDED`
  - docs still lock implementation authority to `Dashboard/Tunet/Cards/v2/`
  - user directed active tranche execution in `Dashboard/Tunet/Cards/v3/`
- `INTERPRETATION-LOCK`
  - `v3` is the active G1 sandbox by user override
  - `v2` remains production authority until explicit cutover decision
- `CODE-DONE`
  - committed baseline v3 copy from v2 (`32dde28`)
  - added G1 profile primitives and resolver utilities in `Dashboard/Tunet/Cards/v3/tunet_base.js`
  - added resolver unit tests in `Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js`
- `VALIDATION`
  - `node --check` passed for both changed JS files
  - `node --test Dashboard/Tunet/Cards/v3/tests/profile_resolver.test.js` passed (`8/8`)

## Session Delta (2026-03-08, T-011A.9)

Change marker: `T-011A.9`

- `DOC-ALIGNED`
  - corrected stale numeric `PROFILE_BASE` snippet in:
    - `Dashboard/Tunet/Mockups/design_language.md` §5.5
  - aligned that section to locked all-em, size-indexed registry contract and canonical v3.1 reference
- `SCOPE`
  - docs-only consistency patch
  - no runtime code changes

## Session Delta (2026-03-08, T-011A.8)

Change marker: `T-011A.8`

- `DOC-ALIGNED`
  - execution-order conflict is now explicit:
    - `T-011A` one-surface orchestration remains required
    - immediate next implementation pass is `G1` profile base primitives after `G0` closeout decisions
  - chosen sequencing:
    1. `G0` closeout decisions/docs sync
    2. `G1` base primitives in `Dashboard/Tunet/Cards/v2/tunet_base.js`
    3. resume `FL-038` surface-by-surface lock sequence
- `SCOPE`
  - docs reconciliation only
  - no runtime code changes

## Session Delta (2026-03-08, T-011A.7)

Change marker: `T-011A.7`

- `DOC-DONE`
  - profile architecture expanded to v3.1 all-em registry contract:
    - size-indexed `PROFILE_BASE`
    - end-to-end density ownership (D18-D22)
    - expanded out-of-scope table and token ownership rules
  - canonical architecture reference is:
    - `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md` (v3.1)
- `SCOPE`
  - docs only, no runtime code changes

## Session Delta (2026-03-07, T-011A.6)

Change marker: `T-011A.6`

- `DOC-RECONCILED`
  - interaction contract baseline aligned to current direction:
    - room card-body tap is route-first (`navigate` preferred)
    - explicit controls/orbs/buttons own toggles
    - hold is optional secondary popup behavior only where configured
  - legacy global `tap-toggle / hold-popup` language is historical when it conflicts with this lock
  - when lower sections conflict, this session-delta lock is authoritative
- `SCOPE`
  - docs reconciliation only
  - no runtime code changes

## Session Delta (2026-03-07, T-011A.5)

Change marker: `T-011A.5`

- `DOC-DONE`
  - V2 design-guideline rewrite + structure translation completed:
    - `Dashboard/Tunet/Mockups/design_language.md` rewritten as canonical V2 contract (`v9.0`)
    - `Dashboard/Tunet/design.md` rewritten as documentation-structure index
  - direction locks documented in canonical design spec:
    - implementation authority is `Dashboard/Tunet/Cards/v2/`
    - profile family split is 5 keys (`tile-grid`, `speaker-tile`, `rooms-row`, `indicator-tile`, `indicator-row`)
    - selector/resolver API split lock (`selectProfileSize` vs pure `resolveSizeProfile`)
    - token consumer boundary lock (`tile-core` core lanes; family extensions owned by composing family components)
    - container-first width-source requirement and mode-agnostic profile policy
- `SCOPE`
  - docs only, no runtime code changes
  - no deployment/cache-bust actions

## Session Delta (2026-03-07, T-011A.4)

Change marker: `T-011A.4`

- `CODE-DONE (G0 PARTIAL)`
  - container-width migration tranche completed for profile-target sizing paths:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - changes:
    - base responsive density now uses container query path first (`@container`) with viewport fallback only when needed
    - status card responsive columns now use `ResizeObserver` primary, `window.resize` fallback-only
    - lighting card columns/row-height/subtitle compaction now resolve from host/container width buckets instead of viewport `innerWidth`/`matchMedia`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed
- `SCOPE`
  - no YAML changes
  - no deploy/cache-bust in this slice
  - nav global layout mutation isolation prerequisite remains open

## Session Delta (2026-03-07, T-011A.3)

Change marker: `T-011A.3`

- `DECISION-LOCK (DOCS)`
  - card-unification direction: `Option C` (family profile consumption), planning score lock `8.15/10`
  - prerequisite ordering locked:
    1. container-first width-source migration
    2. nav global layout mutation isolation (`ensureGlobalOffsetsStyle` scope control)
    3. phased profile rollout
- `ROLL-OUT LOCKS`
  - `rooms-row` is a single family; `slim` is a layout variant modifier (not a family key)
  - skip Option B pilot comparison; execute direct Option C pilot
  - add post-pilot calibration gate for `getCardSize()` and `getGridOptions()`
- `SCOPE`
  - docs-only planning update in `Dashboard/Tunet/Agent-Reviews/type_profile_consumption_options.md`
  - no runtime JS/YAML changes

## Session Delta (2026-03-07, T-011A.2)

Change marker: `T-011A.2`

- `CODE-DONE`
  - rooms row control proportionality + status precedence hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.9.2`)
  - fixes included:
    - mobile rooms-row controls scale down relative to desktop
    - row all-toggle and per-light orbs share matched sizing box model
    - row main icon reduced to preserve text lane readability
    - status line suppresses unlabeled brightness `%` when ambient entities are configured
- `SCOPE`
  - no nav/popup contract changes
  - no YAML structure changes
- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_base.js`
    - `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p09`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_base.js` passed
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-07, T-011A.1)

Change marker: `T-011A.1`

- `CODE-DONE`
  - Lighting tile visual polish parity update:
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - parity adjustments:
    - explicit rooms-style hover/press feedback on lighting tiles
    - explicit circular icon-wrap geometry + icon sizing parity
    - off/unavailable icon-wrap styling retains visible circular container treatment
    - compact/condensed tile lane protection:
      - icon lane scales down first
      - name/value/progress lanes keep separation under compact pressure
      - dense compact mode (`columns >= 5`) applies tighter proportional scaling
- `SCOPE`
  - no navigation/popup/interaction-contract behavior changes
  - no YAML layout changes
- `DEPLOYMENT`
  - uploaded `/config/www/tunet/v2_next/tunet_lighting_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p08`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` passed

## Session Delta (2026-03-07, T-011A)

Change marker: `T-011A`

- `PRIORITY-RESET`
  - active remediation focus is now surface-by-surface layout orchestration (`Page -> Section -> Card`) per `Dashboard/Tunet/AGENTS.md` sections `7B` and `7C`
  - prior bug-fix-heavy `P0` queue items that are already implemented in card sources move to verification backlog unless regressions are reproduced
- `DOC-SYNC`
  - planning control docs now prioritize:
    1. Living Room page lock
    2. Matching Living Room popup lock
    3. Overview lock
    4. Media lock
    5. Remaining room pages via locked template deltas

## Session Delta (2026-03-07, T-010C.2)

Change marker: `T-010C.2`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Popup/navigation action dispatch hardening in shared action router:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Cache-safe adoption of updated shared router:
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` (`v2.4.3`)
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.6`)

- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_base.js`
    - `/config/www/tunet/v2_next/tunet_actions_card.js`
    - `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p06`
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p06`

- `VALIDATION`
  - `node --check` passed:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`

## Session Delta (2026-03-07, T-010C.1)

Change marker: `T-010C.1`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Status dropdown reliability hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`v2.6.5`)
  - Popup room-link action reliability normalization:
    - `Dashboard/Tunet/tunet-suite-storage-config.yaml` (living popup Room action -> `navigate`)
    - `Dashboard/Tunet/tunet-suite-config.yaml` parity updates for popup Room actions

- `DEPLOYMENT`
  - uploaded:
    - `/config/www/tunet/v2_next/tunet_status_card.js`
    - `/config/www/tunet/v2_next/tunet_base.js`
  - resource version-bumped:
    - `/local/tunet/v2_next/tunet_status_card.js?v=20260307_p05`
  - live storage dashboard transform applied:
    - `tunet-suite-storage` living popup `Room` action now uses `action: navigate`

- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js` passed
  - YAML parse checks passed for modified Tunet suite YAML files

## Session Delta (2026-03-07, T-010B)

Change marker: `T-010B`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Nav clearance hardening for sections/mobile footer overlap:
    - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (`v0.2.3`)
  - Centralized rooms row density token increase:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Rooms row control parity fix (orb vs toggle sizing consistency):
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`v2.8.5`)
  - Light tile lane-spacing refinements (name/value/bar separation):
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` (`v3.4.4`)
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` (`v1.0.2`)

- `DEPLOYMENT`
  - uploaded updated files to `/config/www/tunet/v2_next/`
  - dashboard resources version-bumped:
    - `/local/tunet/v2_next/tunet_nav_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_lighting_card.js?v=20260307_p04`
    - `/local/tunet/v2_next/tunet_light_tile.js?v=20260307_p04`

- `VALIDATION`
  - `node --check` pass:
    - `tunet_base.js`
    - `tunet_nav_card.js`
    - `tunet_rooms_card.js`
    - `tunet_lighting_card.js`
    - `tunet_light_tile.js`

## Session Delta (2026-03-07)

Change marker: `T-010A`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Shared icon/density baseline tuning:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Status compact/standard clipping/readability stabilization + container-width responsive columns:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Scenes chip compact readability sizing pass:
    - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - Actions strip compact readability sizing pass:
    - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- `DEPLOYMENT`
  - uploaded the four files to `/config/www/tunet/v2_next/`
  - dashboard resources version-bumped:
    - `/local/tunet/v2_next/tunet_status_card.js?v=20260307_p01`
    - `/local/tunet/v2_next/tunet_scenes_card.js?v=20260307_p01`
    - `/local/tunet/v2_next/tunet_actions_card.js?v=20260307_p01`
- `VALIDATION`
  - `node --check` pass:
    - `tunet_base.js`
    - `tunet_status_card.js`
    - `tunet_scenes_card.js`
    - `tunet_actions_card.js`

## Session Delta (2026-03-07, follow-up)

Change marker: `T-010A.1`

- `CODE-DONE / DEPLOYED / HA-VERIFY`
  - Rooms header all-toggle control sizing increase:
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `DEPLOYMENT`
  - uploaded to `/config/www/tunet/v2_next/tunet_rooms_card.js`
  - dashboard resource bumped:
    - `/local/tunet/v2_next/tunet_rooms_card.js?v=20260307_p02`
- `VALIDATION`
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` passed

## Session Delta (2026-03-06 Late 2)

Change marker: `T-009E`

- `CODE-DONE / HA-VERIFY`
  - Centralized mobile density baseline in shared card system:
    - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - Focused adoption pass for high-visibility mobile tiles:
    - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- `CACHE-BUSTING`
  - all v2 cards now reference `tunet_base.js?v=20260306g3`
- `DOCS-ADDED`
  - `Dashboard/Tunet/Docs/mobile_density_audit_weather_climate.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_media_audio.md`
  - `Dashboard/Tunet/Docs/mobile_density_audit_sensor_actions_scenes.md`
  - `Dashboard/Tunet/Docs/mobile_density_crosscard_gap_review.md`
  - `Dashboard/Tunet/Docs/mobile_density_master_matrix.md`

## Session Delta (2026-03-06 Late)

Change marker: `T-009D`

- `CODE-DONE / HA-VERIFY`
  - Status card compact readability + dropdown layering hardening:
    - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Rooms row/slim mobile control sizing increase:
    - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- `DOCS-ADDED`
  - Weather refactor plan matrix:
    - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`
  - Status/chips resolution guide:
    - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
  - Brightness alignment RCA:
    - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`

## Purpose

This file is the machine-actionable findings ledger for the Tunet Suite work.

- `plan.md` is the execution source of truth.
- `FIX_LEDGER.md` is the detailed findings and remediation source of truth.
- When a sub-agent needs exact work items, use this file first.
- When a human needs phase order, rollout order, or deployment order, use `plan.md`.

This file is **not** meant to be a mixed bag of:

- active defects
- superseded architectural assumptions
- product-direction questions

Those three categories must remain separate, or future work will mistake historical drift for actionable remediation.

## Requirement Register And Interpretation Model

This ledger is not just a backlog. It is an architectural control surface.

Every item in this file must answer one question correctly before work begins:

`Given the real product intent, what kind of item is this, which surface does it apply to, and what is allowed to happen next?`

To make that possible, all ledger items must be interpreted through four gates:

1. `Requirement Alignment`
2. `Surface Scope`
3. `Item Type`
4. `Completion Standard`

If an item cannot be interpreted through these four gates, it does not yet belong in the active remediation flow.

### Requirement Register

These requirement IDs are the stable intent model for the Tunet work. Ledger items should reference them explicitly where relevant.

| Requirement ID | Requirement | Why It Exists |
|---|---|---|
| `REQ-NAV-001` | `NAV` is the first major product decision. | The product must establish coherent chrome and wayfinding before popup, shell, and home-layout decisions are finalized. |
| `REQ-NAV-002` | Nav must be understandable without builder knowledge. | Family and guests should know where they are and what each route does without explanation. |
| `REQ-NAV-003` | Nav must act as a live-state surface, not a dead route strip. | Premium home UI should surface small but useful context at the point of navigation. |
| `REQ-POP-001` | Browser Mod is the preferred popup system. | Popup behavior must be robust, reusable, and aligned with the intended product surface. |
| `REQ-POP-002` | There is one popup per room. | Room overlays should be intentional, minimal, and predictable. |
| `REQ-POP-003` | Popups must feel like premium iOS-grade sheets. | Overlay quality is part of the daily-use product, not an implementation afterthought. |
| `REQ-UX-001` | Primary actions must be reachable in one touch. | The dashboard is for real household use, not for exploratory builder interaction. |
| `REQ-UX-002` | Current location and next action must be obvious. | Low cognitive load is required for family-grade usability. |
| `REQ-UX-003` | Daily-use family clarity outranks technically clever composition. | Product acceptance is determined by repeated household use, not just implementation novelty. |
| `REQ-SEC-001` | Sections are organized by role, hierarchy, and one-touch value. | Sections is a product-architecture tool, not just a sizing grid. |
| `REQ-SEC-002` | Width is a ratio decision, not the whole design decision. | Span alone does not determine whether a surface deserves prominence or placement. |
| `REQ-SEC-003` | Vertical sizing should generally remain intrinsic. | Forced height should be the exception, not the default, in a modern Sections dashboard. |
| `REQ-LAY-001` | Sections layout must be validated through breakpoint-aware composition rules. | The project needs a formal responsive model at view, section, and card levels instead of ad-hoc span tuning. |
| `REQ-LAY-002` | Card-level hard width caps are exception-only. | Responsive behavior should be driven by proportional layout and intrinsic sizing, not rigid card caps. |
| `REQ-SURF-001` | Storage/hybrid is the primary evaluation and UI-edit surface. | Product feel should be judged on the surface people can actually interact with and adjust. |
| `REQ-SURF-002` | YAML suite is the repo-controlled architecture surface. | Long-term structure, reviewability, and deployment discipline still need a canonical branch-readable surface. |
| `REQ-DONE-001` | Implemented is not done. | Repo state, live HA state, visual validation, and product acceptance must remain distinct. |
| `REQ-V1-001` | Valuable V1 polish and interaction patterns should be recovered where compatible. | Migration to Sections must not discard the atmosphere and clarity that made the earlier dashboard feel premium. |
| `REQ-CTRL-001` | Every change must pass a preflight change gate with traceability. | Prevents fast local fixes from reintroducing cross-card behavior drift. |
| `REQ-INT-001` | Room interaction contract is route-first body tap with explicit control-owned toggles. | Keeps primary intent one-touch while preserving predictable toggles and optional premium popup access. |

### Four-Gate Interpretation Model

#### 1. Requirement Alignment

Every item should identify which requirement IDs it serves.

Examples:

- `REQ-NAV-001` if it affects nav sequencing or nav acceptance
- `REQ-POP-001` and `REQ-POP-003` if it affects room popup platform or sheet quality
- `REQ-UX-001` if it changes one-touch control quality
- `REQ-SEC-001` if it changes Sections placement, grouping, or interaction hierarchy

#### 2. Surface Scope

Every item should make clear which surface it applies to:

- `Repo Architecture Surface`
- `Storage/Hybrid Evaluation Surface`
- `Historical / Reference Surface`

If an item affects more than one surface, that should be stated explicitly rather than implied.

#### 3. Item Type

Every item must fit one of these types:

- `DEFECT`
- `SUPERSEDED ASSUMPTION`
- `PRODUCT-DIRECTION DECISION`
- `VALIDATION TASK`

This prevents design direction from being executed like a bug ticket and prevents historical assumptions from being mistaken for current failures.

#### 4. Completion Standard

Every item must be evaluated against one or more of these completion states:

- `CODE CHANGED`
- `DEPLOYED`
- `VISUALLY VALIDATED`
- `ACCEPTED AS PRODUCT DIRECTION`

The ledger must not collapse these into a single meaning of "done."

### How To Use The Requirement Model

- Use requirement IDs to justify why an item belongs in the active queue.
- Use surface scope to decide where the work should be implemented or judged.
- Use item type to decide whether the item belongs in remediation, historical fencing, or product direction.
- Use completion standard to prevent repo work from being mistaken for daily-use product acceptance.

This is how the ledger stays aligned with Home Assistant's operating philosophy:

- flexibility: multiple surfaces can coexist without being conflated
- reliability: stale assumptions are fenced instead of silently reused
- user empowerment: success is measured by understandable, controllable daily use

## Control Document Precedence

If the control documents disagree, use this precedence order:

1. `plan.md`
2. `FIX_LEDGER.md`
3. `Dashboard/Tunet/Docs/agent_driver_pack.md`
4. `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
5. `Dashboard/Tunet/CLAUDE.md`

Do not silently smooth over conflicts. Record them explicitly in planning outputs.

## Branch And Status Discipline

- This ledger is authoritative for broad Tunet work only on branch `claude/dashboard-nav-research-QnOBs`.
- Broad planning outputs must record the live current branch and HEAD before using this ledger.
- Imported findings must be classified as:
  - `OPEN`
  - `ALREADY FIXED IN REPO`
  - `FIXED IN REPO BUT NOT DEPLOYED`
  - `FIXED IN YAML BUT NOT STORAGE`

## Session Delta (2026-03-06)

### FL-033
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Type: `DEFECT`
- Summary:
  - Home status compact readability and tile density were mis-scaled (text too small, perceived whitespace too high).
  - Dropdown visibility required host-level elevation during open state.
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Docs/status_chips_resolution_guide.md`
- Validation:
  - `node --check` passed for both card files.

### FL-034
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Type: `DEFECT`
- Summary:
  - Rooms row variant controls were too small on mobile.
  - Increased row-mode mobile sizing for room icon, orb controls, toggle control, and text scale.
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Validation:
  - `node --check` passed.

### FL-035
- Status: `ANALYZED`
- Severity: `MEDIUM`
- Type: `VALIDATION TASK`
- Summary:
  - Brightness/status vertical alignment drift investigated for lighting + rooms surfaces.
  - Root-cause and fix options documented for follow-up implementation tranche.
- Files:
  - `Dashboard/Tunet/Docs/brightness_alignment_rca.md`
  - `Dashboard/Tunet/Docs/weather_card_refactor_plan.md`

## Reconciled Findings That Must Not Be Reopened Blindly

These items have already changed materially on this branch and must be verified before being repeated as active blockers:

- `back_path` is already present on Tunet suite subviews.
- the storage Living Room popup already uses one consolidated `tunet-lighting-card`.
- the storage Bedroom subview source now uses one consolidated `tunet-lighting-card` with companion Sonos/alarm panels and a full-width context strip (`T-008B`); live breakpoint validation is still required.
- `tunet_sensor_card.js` `value_attribute` support.
- nav active color token drift in `tunet_nav_card.js`.

## Canonical Decisions Already Made

- Surface model:
  - `tunet-suite` YAML is the repo-controlled architecture surface.
  - `tunet-suite-storage` is the primary evaluation / UI-edit surface.
  - older overview and test dashboards are historical / reference surfaces only unless explicitly promoted.
- Resource strategy: keep `v2_next` as the active staging root until cutover is explicitly approved.
- Layout strategy: native HA Sections layout is the primary layout engine.
- Vertical sizing strategy: do not force vertical rows in production sections cards unless there is a compelling card-specific exception.
- Navigation strategy: custom `tunet-nav-card` is the navigation foundation.
- Room strategy: Office is not a room; Office lighting is part of Living Room.
- Popup strategy: Browser Mod is the preferred next-popup direction for Tunet. Existing Bubble/hash popup work is historical POC material only unless explicitly re-approved.
- Card editor strategy: `getConfigForm()` remains acceptable for simple/scalar configs; nested array editing is not considered solved.
- Interaction strategy: room card-body uses route-first tap; explicit controls own toggles; hold-popup is optional where configured.

## Execution Gate Register (2026-03-06)

These are mandatory workflow constraints for active implementation:

- each implementation change needs a `Change ID` and explicit surface scope
- each change needs a cross-card impact check before coding
- active work must remain inside one tranche at a time
- no more than three active implementation items inside an active tranche

## How To Use This Ledger

For each active defect item:
- Read the `Exact Fix`.
- Read the `Why This Matters`.
- Read the `Requirement Alignment` if present.
- Read the `Surface Scope` if present.
- Respect the `Dependency` ordering.
- Do not mark the item done until the `Validation` step is complete.
- If a code change is made but HA has not yet been refreshed or redeployed, keep the status as `CODE-DONE / HA-VERIFY`.

For this file as a whole, interpret it using this structure:

1. `Active Defects / Remediation`
   - things that should be fixed in code, config, docs, or live HA state
2. `Superseded Assumptions`
   - older architectural or planning assumptions that must not be reused blindly
3. `Product-Direction Decisions`
   - open or locked design decisions that shape future tranches but are not themselves implementation defects

Do not execute Product-Direction Decisions as if they were bug tickets.
Do not treat Superseded Assumptions as active failures unless they still survive in code or docs.

## Ledger Model

This ledger now follows the same architectural discipline as `plan.md`:

- `plan.md` defines execution order and system state
- `FIX_LEDGER.md` defines remediation truth

Within `FIX_LEDGER.md`, every item should fit one of these meanings:

- `DEFECT`
  - Something is wrong in repo state, live HA state, documentation, or interaction behavior and should be fixed.
- `SUPERSEDED ASSUMPTION`
  - Something used to be treated as true or current, but is no longer the right basis for execution.
- `PRODUCT-DIRECTION DECISION`
  - A product or architectural decision that shapes future work, but should not be confused with a defect.

If an item is not clearly one of those, the ledger is drifting again.

## File Scorecard

These grades are implementation-health grades, not value judgments. They reflect current production readiness relative to the stated Tunet goals.

| File | Grade | Summary | Primary Reason |
|---|---|---|---|
| `plan.md` | B | Strong execution framing, but needed linkage to the concrete findings backlog | Plan and repo state were drifting |
| `FIX_LEDGER.md` | A | Detailed backlog and validation source | Created to remove ambiguity |
| `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md` | D | Operationally dangerous before reconciliation | Documented `v2` while staging actually uses `v2_next` |
| `Dashboard/Tunet/tunet-suite-config.yaml` | C | Correct macro architecture, but still had entity/config drift and incomplete POC composition | Mixed popup/subview patterns, stale entities, forced rows |
| `Dashboard/Tunet/tunet-overview-config.yaml` | C | Useful legacy reference, but not fully aligned with sections auto-height policy | Still forced `rows: 2` |
| `Dashboard/Tunet/tunet-v2-test-config.yaml` | C | Good harness, but still contained stale sizing assumptions | Still forced `rows: 2` |
| `Dashboard/Tunet/Docs/dashboard_navigation_research.md` | C | Valuable historical research, but not a safe implementation reference without qualification | Describes browser_mod-first world, not current POC reality |
| `Dashboard/Tunet/Cards/v2/tunet_base.js` | B+ | Shared tokens and registration foundation are strong | Needs more discipline from consuming cards |
| `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` | C | Correct high-level concept, but global layout side effects are too broad | Global offsets, direct `pushState`, weak config editor story |
| `Dashboard/Tunet/Cards/v2/tunet_status_card.js` | B | Bug 1 and Bug 2 work is present | Still uses manual history navigation pattern |
| `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js` | B- | Flexible and reusable, but still carries legacy fixed-row semantics | `rows` still influences visible tile count |
| `Dashboard/Tunet/Cards/v2/tunet_light_tile.js` | B | Focused and relatively isolated | Less strategically important once consolidated room surfaces are used |
| `Dashboard/Tunet/Cards/v2/tunet_climate_card.js` | B | Architecturally sound and stable | No major audit blocker surfaced |
| `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` | B | Generally sound | Depends on broader entity consistency |
| `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` | C- | Needed real functionality fix for attribute-based sensors | Missing `value_attribute` support, stale AQI stub |
| `Dashboard/Tunet/Cards/v2/tunet_media_card.js` | C | Good UI surface, but config contract and speaker invalidation need work | Group sensor contract drift and stale cache risk |
| `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js` | C | Viable card, but responsive density needs refinement | Mobile column behavior too rigid |
| `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` | C | Right role in IA, but still relies on direct history manipulation | Navigation implementation is brittle |
| `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js` | B- | Rich capability surface, but not currently in production path | Needs explicit role decision |
| `Dashboard/Tunet/Cards/v2/tunet_actions_card.js` | B | Straightforward and low-risk | No major issue surfaced in this tranche |

## Remediation Ledger

### Control-Plane Hardening

#### FL-000
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `.claude/skills/tunet-agent-driver/SKILL.md`
  - `CLAUDE.md`
  - `Dashboard/Tunet/CLAUDE.md`
  - `Dashboard/Tunet/Docs/agent_driver_pack.md`
  - `plan.md`
  - `FIX_LEDGER.md`
- Problem:
  - The Tunet multi-agent workflow had strong structure but insufficient determinism around branch, document precedence, stale findings, and required saved-artifact preflight.
- Exact Fix:
  - Add explicit branch guard requirements.
  - Add explicit control-document precedence.
  - Add stale-finding classification and reconciliation rules.
  - Require branch/head and control-doc reconciliation sections in saved planning artifacts.
- Why This Matters:
  - The biggest remaining failure mode is no longer “lack of analysis”; it is producing high-effort, high-confidence artifacts from the wrong branch or from stale assumptions.
- Dependency:
  - None.
- Validation:
  - Read the listed files and confirm they now explicitly document branch guard, precedence, stale-finding handling, and saved-artifact discipline.

### Immediate Operational Alignment

#### FL-001
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/DEPLOYMENT_RESOURCES.md`
  - `plan.md`
- Problem:
  - Repo documentation described `/config/www/tunet/v2/` and `/local/tunet/v2/` as the active root even though the active staging deployment is `/config/www/tunet/v2_next/` and `/local/tunet/v2_next/`.
- Exact Fix:
  - Rewrite deployment documentation so it explicitly distinguishes:
    - active staging root: `v2_next`
    - optional stable rollback root: `v2`
  - Use one consistent version string example across the doc.
  - State that `tunet_base.js` is not a Lovelace resource but must exist beside the modules.
- Why This Matters:
  - A deployment guide that points at the wrong root can silently load stale JS and invalidate every UI result.
- Dependency:
  - None.
- Validation:
  - Read the doc and confirm every example path matches the actual active HA resource list.

#### FL-002
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The dashboard configs still force `rows: 2` on the lighting card even though the agreed sections policy is auto-height.
- Exact Fix:
  - Remove `rows: 2` from all shipped YAML lighting-card configs unless there is a documented exception.
- Why This Matters:
  - In the current lighting card, `rows` is not just a height hint; it limits the number of visible tiles.
  - This violates the new “let sections size vertically” policy and can hide content.
- Dependency:
  - None.
- Validation:
  - `rg -n "rows:\\s*2" Dashboard/Tunet/*.yaml` returns zero matches.

### Entity Drift And Config Contract Fixes

#### FL-003
- Status: `DONE`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Bedroom config in the suite still references `light.bedroom_accent_light` while the repo’s other dashboard YAMLs and live HA validation indicate the correct accent entity is `light.master_bedroom_corner_accent_govee`.
- Exact Fix:
  - Replace all Bedroom accent references in the suite config with `light.master_bedroom_corner_accent_govee`.
- Why This Matters:
  - This is a straight entity drift bug. It produces missing controls or broken room surfaces.
- Dependency:
  - None.
- Validation:
  - `rg -n "bedroom_accent_light|master_bedroom_corner_accent_govee" Dashboard/Tunet/tunet-suite-config.yaml` shows only the Govee entity.

#### FL-004
- Status: `DONE`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- Problem:
  - The media card’s default contract expects `active_group_sensor: sensor.sonos_active_group_coordinator`, but the suite YAML used `sensor.sonos_smart_coordinator`.
- Exact Fix:
  - Align the suite YAML with the card’s own documented contract and use `sensor.sonos_active_group_coordinator` everywhere `active_group_sensor` is configured for `tunet-media-card`.
- Why This Matters:
  - Live HA currently exposes `group_members` on both sensors, so this is not necessarily a hard runtime failure today.
  - It is still a contract drift bug that makes future debugging harder and makes the production suite disagree with its own component defaults.
- Dependency:
  - None.
- Validation:
  - `rg -n "active_group_sensor:" Dashboard/Tunet/tunet-suite-config.yaml` shows only `sensor.sonos_active_group_coordinator`.

#### FL-005
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The sensor card YAML uses `value_attribute: temperature` for `weather.home`, but the V2 sensor card did not implement `value_attribute`.
- Exact Fix:
  - In `tunet_sensor_card.js`, use `entity.attributes[cfg.value_attribute]` for current-value rendering when `value_attribute` is provided.
  - In history fetches, do not strip attributes for rows that rely on `value_attribute`; parse historical points from the named attribute when present.
- Why This Matters:
  - Without this, the “Outside” row can show the weather condition string instead of a temperature value and all threshold logic becomes meaningless.
- Dependency:
  - None.
- Validation:
  - Static: code search shows `cfg.value_attribute` handling in both current-value and history parsing logic.
  - Runtime: the “Outside” sensor row shows a numeric temperature value.

#### FL-006
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
- Problem:
  - The V2 sensor card stub config still advertises `sensor.aqi`, even though Bug 3 was explicitly removed from active dashboard YAMLs.
- Exact Fix:
  - Replace the stub config row with a safe, likely-to-exist example, or remove the fourth sample row entirely.
- Why This Matters:
  - This reintroduces a known-bad entity into the UI editor path and confuses verification.
- Dependency:
  - None.
- Validation:
  - `rg -n "sensor\\.aqi" Dashboard/Tunet/Cards/v2/tunet_sensor_card.js` returns zero matches.

### POC Structure Fixes

#### FL-007
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room popup POC still uses a vertical stack of `tunet-light-tile` instances instead of one consolidated lighting surface.
- Exact Fix:
  - Replace the five `tunet-light-tile` cards in the Living Room popup with one `custom:tunet-lighting-card`.
  - Use explicit `zones` for:
    - `light.living_room_couch_lamp`
    - `light.living_room_floor_lamp`
    - `light.living_room_spot_lights`
    - `light.living_room_credenza_light`
    - `light.office_desk_lamp`
  - Keep the popup focused:
    - `All Off`
    - one lighting surface
    - `Open Room`
- Why This Matters:
  - The whole point of the POC is to validate the final pattern, not a temporary duplicate-tile fallback.
- Dependency:
  - FL-003 if Bedroom entities are being normalized in the same change set; otherwise independent.
- Validation:
  - Open Living Room popup and confirm there is exactly one lighting card, not a tile stack.

#### FL-008
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM-HIGH`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - The Living Room subview still uses stacked `tunet-light-tile` cards instead of a consolidated room lighting surface.
- Exact Fix:
  - Replace the stacked tiles in the Living Room subview with one `custom:tunet-lighting-card` using the same explicit Living Room zone list as the popup.
- Why This Matters:
  - The subview should represent the scalable room pattern the rest of the project will follow.
- Dependency:
  - FL-007 preferred, so popup and subview share the same entity model.
- Validation:
  - Open `/tunet-suite/living-room` and confirm one consolidated lighting card controls all living-room lights.

#### FL-009
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
- Problem:
  - Room subviews do not declare explicit `back_path`.
- Exact Fix:
  - Add `back_path: /tunet-suite/overview` to each room subview.
- Why This Matters:
  - Direct links, refreshes, and unusual navigation history should still return users to the intended dashboard destination.
- Dependency:
  - None.
- Validation:
  - Open a room subview directly in a fresh tab and confirm the HA back button returns to `/tunet-suite/overview`.

### Navigation Foundation Hardening

#### FL-010
- Status: `DONE`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
- Problem:
  - `tunet-nav-card` uses `var(--amber-strong)` for the active nav color, but that token is not defined in the shared token layer.
- Exact Fix:
  - Replace `var(--amber-strong)` with an existing token such as `var(--amber)`, or define `--amber-strong` centrally in `tunet_base.js`.
- Why This Matters:
  - Active-state styling should not depend on undefined-token fallback behavior.
- Dependency:
  - None.
- Validation:
  - Search confirms the token is either defined centrally or no longer referenced.

#### FL-011
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-NAV-003`
  - `REQ-SURF-001`
  - `REQ-SURF-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `tunet-nav-card` injects global `hui-view` offsets and document-root CSS variables from every card instance on every view.
  - Storage views now use native `footer.card` placement for nav, but JS-global offset injection still exists and can leak outside Tunet routes.
- Exact Fix:
  - Scope nav layout offsets so they only affect the Tunet dashboard and only once.
  - Acceptable patterns:
    - a single shared dashboard-scoped root owner
    - route-aware offset application limited to `/tunet-suite`
    - layout reserved in the card’s host tree instead of document-global margin injection
- Why This Matters:
  - The current behavior can affect non-Tunet dashboards and introduces order-dependent layout behavior.
- Dependency:
  - None, but architectural care is required.
- Validation:
  - `tunet-suite-storage-config.yaml` places nav in view `footer.card` for all sections views.
  - Open a non-Tunet dashboard after loading Tunet and confirm no extra left or bottom spacing remains.

#### FL-012
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-SURF-001`
  - `REQ-SURF-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - Navigation is implemented via direct `history.pushState` plus manual `location-changed` dispatch.
- Exact Fix:
  - Replace direct history manipulation with Home Assistant’s supported navigation mechanism everywhere a Tunet card changes the route.
- Why This Matters:
  - This is brittle against HA frontend router changes and mixes app routing with custom event simulation.
- Dependency:
  - None, but should be done consistently across all cards once started.
- Validation:
  - Browser back/forward, route highlighting, and subview transitions work without custom history shims.

#### FL-013
- Status: `OPEN`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-SURF-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - `subview_paths` is exposed as an `object` selector even though the card consumes an array of strings.
- Exact Fix:
  - Either:
    - implement a real editor path for repeated strings, or
    - explicitly treat `subview_paths` as YAML-only and remove it from the simple visual schema.
- Why This Matters:
  - A broken or misleading config editor is worse than an explicit YAML-only field.
- Dependency:
  - Depends on the broader config editor decision.
- Validation:
  - UI editor either renders a valid repeatable list or no longer pretends to support the field.

#### FL-025
- Status: `DONE`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-NAV-002`
  - `REQ-UX-002`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - Inactive nav items were invisible — hardcoded `rgba(255,255,255,0.62)` (white at 62% opacity) on a near-white light-mode glass background. Bypassed the token system entirely. No `:host(.dark)` override existed.
- Exact Fix:
  - Replaced hardcoded color with `var(--text-muted)` for light mode.
  - Added `:host(.dark) .btn:not(.active) { color: rgba(248,250,252, 0.55); }` for dark mode legibility.
- Why This Matters:
  - Nav items were literally invisible in light mode — users could only see the active (orange) item, making navigation impossible.
- Dependency:
  - None.
- Validation:
  - All three nav items (Home, Rooms, Media) are visible in both light and dark mode. Active item remains amber. User confirmed fix on 2026-03-06.

#### FL-026
- Status: `DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-NAV-001`
  - `REQ-UX-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- Problem:
  - Excessive spacing between nav icon and label. Material Symbols Rounded font metrics inflated the icon grid cell beyond 22px, and the grid `gap: 4px` measured from the inflated boundary.
- Exact Fix:
  - Added `line-height: 22px; overflow: hidden` to `.btn .icon` to contain font metrics.
  - Reduced grid `gap` from `4px` to `2px`.
- Why This Matters:
  - Nav chrome should be tight and compact — excessive spacing made it look unfinished.
- Dependency:
  - None.
- Validation:
  - Icon-to-label spacing is visually tight and consistent across all three nav items. User confirmed fix on 2026-03-06.

### Control Plane And Interaction Unification

#### FL-027
- Status: `DONE / PROCESS LOCKED`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-CTRL-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `plan.md`
  - `FIX_LEDGER.md`
- Problem:
  - The project has planning docs but no enforced preflight gate, WIP budget, or change traceability discipline.
- Exact Fix:
  - Add mandatory change-gate requirements (`Change ID`, impact map, validation checklist, rollback path) and one-tranche WIP limits to control docs.
  - Add explicit micro-interaction drift-prevention contract to `plan.md` that blocks tap/hold/popup behavior changes without synchronized contract + ledger + validation updates.
- Why This Matters:
  - Without enforcement, interaction and layout decisions regress through untracked “quick” changes.
- Dependency:
  - None.
- Validation:
  - `plan.md` includes mandatory `Micro-Interaction Drift Prevention (Locked)` requirements.
  - `plan.md` now rejects stale Bubble/hash execution instructions and keeps Browser Mod as active popup path.

#### FL-028
- Status: `PARTIAL`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-LAY-001`
  - `REQ-SEC-001`
  - `REQ-SEC-002`
  - `REQ-SEC-003`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `plan.md`
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Sections layout is not yet fully managed through a breakpoint-aware composition system; view/section/card sizing decisions still drift by local edits.
  - Prior guidance mixed a 12-column mental model with incomplete runtime interpretation of Sections page-column behavior.
- Exact Fix:
  - Define and enforce a layout matrix covering:
    - page/view width policy
    - section span strategy
    - card span behavior
    across phone/tablet/desktop.
  - Ground matrix rules in current HA controls (`max_columns`, `dense_section_placement`, `column_span`, `row_span`, `grid_options` / `getGridOptions()`).
- Why This Matters:
  - Correct Sections usage is foundational; card polish is wasted if responsive composition is unstable.
- Dependency:
  - FL-027 control gate enforcement.
- Validation:
  - `Dashboard/Tunet/Docs/sections_layout_matrix.md` now contains the explicit 3-layer control model and tuning order.
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml` now applies the model:
    - explicit `max_columns: 4` + `dense_section_placement: false` for all sections views
    - normalized overview span semantics (`4/3/1`)
    - one concrete subview composition example (`living-room` split `3/1`)
  - Overview + one room subview still need live matrix checks at phone/tablet/desktop compositions before item can be marked `DONE`.

#### FL-029
- Status: `PARTIAL`
- Severity: `MEDIUM-HIGH`
- Requirement Alignment:
  - `REQ-LAY-002`
  - `REQ-SEC-002`
  - `REQ-SEC-003`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/` (cards with `getGridOptions()`)
- Problem:
  - Card-level hard `max_columns` caps are broadly applied, constraining proportional responsiveness.
- Exact Fix:
  - Remove hard `max_columns` defaults from card `getGridOptions()` and treat any future hard cap as a documented exception.
- Why This Matters:
  - Broad hard caps fight Sections-native layout and force avoidable breakpoint compromises.
- Dependency:
  - FL-028 layout matrix decisions.
- Validation:
  - `sections_layout_matrix.md` explicitly locks default card hints to `{ columns, min_columns }`.
  - `tunet_scenes_card.js` no longer emits `max_columns` in `getGridOptions()`.
  - Remaining card audit for `max_columns` exceptions stays open until full suite verification is complete.

#### FL-030
- Status: `OPEN`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-INT-001`
  - `REQ-POP-001`
  - `REQ-UX-001`
  - `REQ-UX-002`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
  - `ACCEPTED AS PRODUCT DIRECTION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Room tile interaction behavior was inconsistent across docs/config/code (legacy tap-toggle language vs route-first behavior).
- Exact Fix:
  - Lock and implement route-first body tap with explicit control-owned toggles; keep popup as optional secondary behavior using browser-scoped `fire-dom-event` where configured.
- Why This Matters:
  - Room interaction is a primary daily-use surface and must be predictable across all Tunet pages.
- Dependency:
  - FL-022 popup direction lock.
- Validation:
  - Room body tap routes consistently; explicit controls toggle consistently; popup opens on hold only where configured.

#### FL-031
- Status: `PARTIAL (CODE-DONE / HA-VERIFY)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- Problem:
  - Status mode dropdown could appear beneath nearby tiles and selection was not reliably applied across `input_select`/`select` domains.
- Exact Fix:
  - Keep dropdown surfaces above sibling tiles (`dropdown-open` z-index behavior).
  - Allow dropdown menus to escape card/grid bounds by forcing status card overflow visibility.
  - Use async service selection with `input_select.select_option` primary and `select.select_option` fallback.
- Why This Matters:
  - Mode selection is a primary global control in the overview status surface and must be visually reliable and deterministic.
- Dependency:
  - None.
- Validation:
  - Open overview status mode dropdown and confirm menu overlays adjacent tiles.
  - Select each option and confirm entity state transitions in HA.
  - Confirm no dropdown clipping at row edges on mobile and desktop.

#### FL-032
- Status: `PARTIAL (CODE-DONE / HA-VERIFY)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`
  - `REQ-UX-002`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Item Type:
  - `DEFECT`
- Completion Standard:
  - `CODE CHANGED`
  - `DEPLOYED`
  - `VISUALLY VALIDATED`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_light_tile.js`
  - `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`
- Problem:
  - Drag-enabled tile surfaces were stealing touch gestures on iOS/WKWebView (`touch-action: none` + mixed pointer handling), causing vertical page scroll stalls and interaction jitter.
- Exact Fix:
  - Add shared axis-lock utility (`createAxisLockedDrag`) with:
    - deadzone + axis-bias gesture intent detection
    - vertical/ambiguous gesture passthrough (no drag lock)
    - horizontal drag lock with conditional `preventDefault()`
  - Switch high-impact tile surfaces to `touch-action: pan-y`.
  - Refactor lighting/light-tile/speaker-grid drag paths to use the shared helper.
- Why This Matters:
  - Scroll starvation on primary interaction surfaces is a core usability failure on mobile and blocks reliable one-touch control.
- Dependency:
  - None.
- Validation:
  - On iOS phone, vertical swipe beginning on any lighting/speaker tile scrolls the page.
  - Horizontal drag still updates brightness/volume controls.
  - Long-press/tap behavior remains intact on refactored tiles.
  - `node --check` passes for all touched card modules.

### Performance And Update Behavior

#### FL-014
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
- Problem:
  - Speaker discovery is cached and never deliberately invalidated when entity topology changes.
- Exact Fix:
  - Invalidate `_cachedSpeakers` when relevant media-player or Sonos group entities change.
- Why This Matters:
  - Frontend state should reflect group membership changes without requiring a full reload.
- Dependency:
  - None.
- Validation:
  - Add/remove a speaker from a Sonos group and confirm the card reflects it without a full browser refresh.

#### FL-015
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Problem:
  - Cards scan the entire HA state registry for adaptive-lighting switches more often than necessary.
- Exact Fix:
  - Precompute the adaptive-lighting switch set once per update cycle and reuse it instead of re-scanning `Object.keys(hass.states)` inside repeated paths.
- Why This Matters:
  - It is avoidable work and will scale poorly on larger HA installs.
- Dependency:
  - None.
- Validation:
  - Code path no longer performs repeated full-registry scans during ordinary updates.

### Documentation And Architecture Consistency

#### FL-016
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Docs/dashboard_navigation_research.md`
- Problem:
  - The research doc is still valuable but it does not describe the current POC implementation accurately.
- Exact Fix:
  - Add a clear header that the file is historical/comparative research.
  - Point readers to `plan.md` and `FIX_LEDGER.md` for the current implementation state.
- Why This Matters:
  - Future contributors must not mistake the research document for the current architecture contract.
- Dependency:
  - None.
- Validation:
  - The document clearly identifies itself as historical and redirects to the current plan.

#### FL-017
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/tunet-suite-config.yaml`
  - `Dashboard/Tunet/tunet-overview-config.yaml`
  - `Dashboard/Tunet/tunet-v2-test-config.yaml`
- Problem:
  - The repo still has entity inventory drift across active, overview, and test dashboards.
- Exact Fix:
  - Choose one canonical entity inventory and normalize the dashboards against it.
  - If a file is intentionally legacy, label it clearly at the top of the file.
- Why This Matters:
  - Three different YAMLs with different entity truth is a guaranteed debugging trap.
- Dependency:
  - FL-003 and any live HA entity audit outcomes.
- Validation:
  - Cross-file search shows consistent room inventories or explicit legacy disclaimers.

### Config Editor Reality Check

#### FL-018
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_sensor_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - The suite contains `getConfigForm()` usage, but nested-array editing is not fully solved and runtime verification in HA UI is still incomplete.
- Exact Fix:
  - Split cards into two classes:
    - simple-editor cards: keep `getConfigForm()`
    - YAML-first cards: document complex fields as YAML-only until a proper `getConfigElement()` investment is approved
  - Verify the actual HA UI behavior on 2026.3.0b1 for at least one simple card and one complex card.
- Why This Matters:
  - The goal is truthful UX, not nominal editor support.
- Dependency:
  - Live HA UI verification.
- Validation:
  - A short matrix exists showing which cards are truly visual-editor friendly and which remain YAML-first.

#### FL-019
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA live dashboard configuration, not repo-only
- Problem:
  - Bug 4 is not fully closed until the real HA UI confirms editors work where expected.
- Exact Fix:
  - In HA UI, try “Add card” for:
    - `tunet-nav-card`
    - `tunet-weather-card`
    - `tunet-climate-card`
    - one complex nested-config card such as `tunet-rooms-card`
  - Record actual outcomes.
- Why This Matters:
  - The repo code can look correct while the editor path still fails in the real frontend.
- Dependency:
  - Resource cache bust and live HA test cycle.
- Validation:
  - A factual pass/fail matrix is written into `plan.md`.

### Legacy Dashboard Cleanup

#### FL-020
- Status: `OPEN`
- Severity: `MEDIUM`
- Files:
  - HA storage dashboards
- Problem:
  - Known-bad `sensor.aqi` references may still exist in storage dashboards even if repo YAMLs are clean.
- Exact Fix:
  - Search storage dashboards and remove or replace every `sensor.aqi` occurrence.
- Why This Matters:
  - The user still sees broken rows if legacy dashboards continue to reference dead entities.
- Dependency:
  - Live HA access.
- Validation:
  - Storage dashboard search returns zero hits for `sensor.aqi`.

### Superseded Assumptions Register

These are not active defects by themselves. They exist to stop future work from silently reusing displaced assumptions.

#### SA-001
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Bubble/hash popup POC behavior is still an acceptable near-term default popup path for Tunet.
- Replaced By:
  - Browser Mod is the preferred next-popup direction, with one popup per room and iOS-grade presentation.
- Why It Matters:
  - This assumption can still leak back in from historical phase text and old POC material.
- Do Not Use For:
  - choosing the next popup platform
  - defining the next popup tranche
- Still Reusable For:
  - harvesting small implementation details from historical POC work

#### SA-002
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Home layout can keep being refined before nav, popup, and integrated UI / UX are decided.
- Replaced By:
  - The product-decision order is locked: nav, popup, integrated UI / UX, home layout.
- Why It Matters:
  - This was the main source of layout-first drift on the branch.
- Do Not Use For:
  - selecting the next major tranche
  - treating overview composition as the current top priority
- Still Reusable For:
  - critiquing what is structurally wrong with the current overview

#### SA-003
- Status: `SUPERSEDED`
- Type: `SUPERSEDED ASSUMPTION`
- Old Assumption:
  - Implemented in repo or deployed to HA means a product surface is effectively done.
- Replaced By:
  - Repo state, live HA state, and product state must be tracked separately.
- Why It Matters:
  - This project is design-led and daily-use quality matters as much as code existence.
- Do Not Use For:
  - claiming nav, popup, or home layout are product-complete because code exists
- Still Reusable For:
  - rollout tracking and operational validation

### Product-Direction Decisions

These are not defects. They are architecture or design decisions that still need explicit handling.

#### FL-021
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - Architecture-level
- Problem:
  - Comparison strategy is still unresolved:
    - switch resources in-place
    - or register separate card tags such as `tunet-status-card-next`
- Exact Fix:
  - Decide whether this project needs true side-by-side comparison or staged-root comparison is enough.
- Why This Matters:
  - It affects deployment complexity, rollback simplicity, and QA repeatability.
- Dependency:
  - Human product/QA decision.
- Validation:
  - Decision recorded in `plan.md`.

#### FL-022
- Status: `DONE / DIRECTION LOCKED`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - Architecture-level
- Problem:
  - Older planning and POC material treated popup standardization as unresolved and preserved Bubble/hash popup language as if it were still an active product path.
- Exact Fix:
  - Lock the popup direction for the next tranche as:
    - one popup per room
    - Browser Mod preferred
    - iOS-grade sheet / overlay quality
    - quick actions + one primary interaction surface + route to deeper room view
  - Treat Bubble/hash popups as historical POC material unless explicitly re-approved.
- Why This Matters:
  - Popup behavior is a product-surface decision, not an implementation detail. Leaving the standard ambiguous allows future runs to drift back into brittle or lower-quality overlay behavior.
- Dependency:
  - None. The direction is already locked in the higher-precedence control docs.
- Validation:
  - `plan.md`, `FIX_LEDGER.md`, and `nav_popup_ux_direction.md` all agree that Browser Mod is the preferred next-popup direction.
  - Active phase execution text no longer contains Bubble/hash popup instructions.

#### FL-023
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_lighting_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
- Problem:
  - `tile_size` and richer per-card sizing knobs were useful in older cards, but the current strategy favors native sections auto-height.
- Exact Fix:
  - Decide whether V2 cards should preserve these knobs for card-internal density only, or remove them when they mislead users into expecting full layout control.
- Why This Matters:
  - This affects the boundary between card design and HA layout behavior.
- Dependency:
  - Human design decision.
- Validation:
  - Decision recorded and the cards/docs agree.

#### FL-024
- Status: `OPEN`
- Severity: `DECISION`
- Type: `PRODUCT-DIRECTION DECISION`
- Files:
  - All V2 cards with `getGridOptions()`
- Problem:
  - There is still a policy question around how broadly `columns: "full"` should be used.
- Exact Fix:
  - Decide the default rule:
    - chrome cards and full-width hero surfaces may use `columns: "full"`
    - most content cards should stay on numeric widths in multiples of 3
- Why This Matters:
  - This is the core sections-layout policy and needs to be explicit to avoid future churn.
- Dependency:
  - Human architecture decision.
- Validation:
  - `plan.md` contains the explicit rule and the code follows it.

## Recommended Remediation Order

This order applies to active remediation items only. It does **not** imply that Product-Direction Decisions should be executed like bug tickets.

1. G0 closeout decisions + control-doc sync lock (`T-011A.8`)
2. G1 base primitives (`tunet_base.js`) and unit checks
3. FL-038 (surface-by-surface orchestration lock)
4. FL-001, FL-002, FL-003, FL-004, FL-005, FL-006
5. FL-007, FL-008, FL-009, FL-010, FL-025, FL-026
6. FL-019, FL-020
7. FL-011, FL-012, FL-013, FL-014, FL-015
8. FL-016, FL-017

## Product-Direction Decision Set

These items should be handled through tranche planning and explicit user decisions, not silently consumed through remediation order:

1. FL-021
2. FL-022
3. FL-023
4. FL-024

## “Done” Standard For This Project

An item is only actually done when all of the following are true:

- Repo code or repo docs are updated.
- If HA deployment is needed, the change is deployed.
- Resources are cache-busted if frontend JS changed.
- The validation step in this ledger is completed.
- `plan.md` no longer contradicts the repo state.

### FL-033
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-UX-003`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Home status compact tiles were difficult to read and visually inconsistent.
- Exact Fix:
  - Increased compact icon/value/label typography and normalized tile min-height using `--tile-row-h` in `Dashboard/Tunet/Cards/v2/tunet_status_card.js`.
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - Live verify readability on phone/tablet.

### FL-034
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-DONE-001`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Home status dropdown could render under adjacent cards.
- Exact Fix:
  - Added host-level dropdown stacking context (`:host(.dd-open)`) and open/close host class toggling in `Dashboard/Tunet/Cards/v2/tunet_status_card.js`.
- Validation:
  - Open adaptive mode dropdown in dense grid with cards above/below; ensure menu remains visible/selectable.

### FL-035
- Status: `CODE-DONE / HA-VERIFY`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-001`, `REQ-SEC-001`
- Surface Scope:
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `DEFECT`
- Summary:
  - Rooms row/slim mobile controls were undersized.
- Exact Fix:
  - Increased row/slim icon/button/orb dimensions and spacing in `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`.
- Validation:
  - `node --check Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
  - Live verify row/slim tap targets on mobile.

### FL-036
- Status: `DOC-DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-003`, `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Weather card requires refactor plan before code changes.
- Exact Fix:
  - Added `Dashboard/Tunet/Docs/weather_card_refactor_plan.md` with mode matrix, data-source normalization, density strategy, and acceptance checklist.

### FL-037
- Status: `DOC-DONE`
- Severity: `MEDIUM`
- Requirement Alignment:
  - `REQ-UX-003`, `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Brightness alignment regression required concrete RCA.
- Exact Fix:
  - Added `Dashboard/Tunet/Docs/brightness_alignment_rca.md` with repro, root causes, options A/B, and recommended option.

### FL-038
- Status: `OPEN (QUEUED AFTER G1)`
- Severity: `HIGH`
- Requirement Alignment:
  - `REQ-LAY-001`
  - `REQ-SEC-001`
  - `REQ-SURF-001`
  - `REQ-DONE-001`
- Surface Scope:
  - `Repo Architecture Surface`
  - `Storage/Hybrid Evaluation Surface`
- Type:
  - `VALIDATION TASK`
- Summary:
  - Surface orchestration is not yet locked one page at a time; work has drifted across multiple pages without a single active surface gate.
- Exact Fix:
  - Execute the mandatory one-surface loop and record decisions in control docs:
    1. Living Room page
    2. Living Room popup
    3. Overview
    4. Media
    5. Remaining room pages
  - For each surface, capture:
    - page intent (`hero` / `companion` / `support`)
    - interaction contract
    - page-level controls (`max_columns`, `dense_section_placement`)
    - section-level composition (`column_span`, `row_span`)
    - card-level placement (`grid_options`)
    - breakpoint validation checklist (`390x844`, `768x1024`, `1024x1366`, `1440x900`)
- Why This Matters:
  - Without a locked per-surface sequence, layout and interaction decisions continue to regress through cross-surface partial edits.
- Dependency:
  - FL-028 matrix baseline remains prerequisite context.
- Validation:
  - `plan.md`, `handoff.md`, and `sections_layout_matrix.md` all show the same active one-surface queue and lock criteria.
  - At least Surface 1 (Living Room page) is marked locked with documented breakpoint outcomes before Surface 2 begins.
