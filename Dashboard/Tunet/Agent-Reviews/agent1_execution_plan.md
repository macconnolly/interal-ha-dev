# Agent 1: Execution Plan — CD2-CD12

**Branch:** main @ 30fc3be  
**Date:** 2026-04-03  
**Role:** Manager / Ledger Integrator (Agent 1 of 4)  
**Status:** FINAL — integrates Agent 2, 3, and 4 findings with corrections  
**Supersedes:** agent1_execution_plan.md from 2026-03-06

---

## 1. CD2 — Shared Interaction Adoption (Detailed)

### Scope Boundary (ENFORCED)

CD2 is CSS-only interaction work:
- Replace `transition: all` with explicit property transitions
- Add `@media (hover: hover)` guards to `:hover` selectors
- Normalize hardcoded press scales to shared tokens
- Add `:focus-visible` CSS rules to interactive elements
- Add `-webkit-tap-highlight-color: transparent` to all cards
- Extend base interaction token exports

CD2 does NOT include:
- `role` or `tabindex` attribute changes (CD3)
- `keydown` handler additions (CD3)
- ARIA attribute changes (CD3)
- grid-auto-rows fixes (CD4)
- Profile contract migration (CD4)
- Hold-to-drag parameter changes (CD6/CD9)

### File List

12 files modified + 2 verify-only:

| File | Action | Change Count (est.) |
|------|--------|-------------------|
| tunet_base.js | MODIFY | 4-6 (token exports, tap-highlight, interaction patterns) |
| tunet_actions_card.js | MODIFY | 3 (1 transition, 1 hover guard, 1 press scale) |
| tunet_scenes_card.js | MODIFY | 2 (hover guard, verify existing transitions) |
| tunet_light_tile.js | MODIFY | 2 (1 transition, verify existing hover guard) |
| tunet_lighting_card.js | MODIFY | 10 (5 transitions, 4 press scales, verify hover guard) |
| tunet_rooms_card.js | MODIFY | 11 (5 transitions, 5 press scales, hover guard) |
| tunet_climate_card.js | MODIFY | 14 (5 transitions, 8 press scales, hover guard, focus-visible) |
| tunet_sensor_card.js | MODIFY | 6 (3 transitions, 2 press scales, hover guard) |
| tunet_weather_card.js | MODIFY | 5 (3 transitions, 1 press scale, hover guard, focus-visible) |
| tunet_media_card.js | MODIFY | 20 (8 transitions, 10 press scales, hover guard, focus-visible) |
| tunet_sonos_card.js | MODIFY | 10 (3 transitions, 6 press scales, hover guard, focus-visible) |
| tunet_speaker_grid_card.js | MODIFY | 9 (3 transitions, 4 press scales, hover guard, --spring/focus-ring fix) |
| tunet_nav_card.js | VERIFY-ONLY | 0 (reference implementation; verify compliance) |
| tunet_status_card.js | EXCLUDED | 0 (G3S lock) |

**Total estimated edits**: ~96 across 12 files.

### Sub-Tranche Recommendation

Agent 4 flagged 192+ changes as "manageable but risky." With corrections (status excluded, CD3 work removed), actual count is ~96. This is manageable as one tranche but benefits from ordered sub-phases for validation:

| Sub-Phase | Work | Files | Est. Changes | Validation |
|-----------|------|-------|-------------|------------|
| CD2a | Base contract + tap-highlight | tunet_base.js | 4-6 | `node --check`; verify TOKENS export |
| CD2b | transition:all replacement | All 10 non-excluded cards | 37 | `grep 'transition: all'` returns 0 in touched files |
| CD2c | Hover guard rollout | 9 cards + verify 2 compliant | 9-18 | `grep ':hover' \| grep -v '@media'` returns 0 |
| CD2d | Press scale normalization | All 12 non-excluded files | ~47 | `grep 'scale(0\.' \| grep -v 'var(--'` returns 0 |
| CD2e | Focus-visible + cleanup | media, sonos, climate, weather, rooms + speaker_grid fixes | ~10 | Tab through all interactive elements in lab |

**Recommendation**: Execute as one continuous tranche with sub-phase ordering. Do NOT split into separate tranches — the changes are mutually reinforcing and testing benefits from seeing them together.

### Per-File Change Specifications

#### tunet_base.js

```
LOCATION: TOKENS (line 19)
ACTION: Verify --press-scale, --press-scale-strong, --motion-ui, --focus-ring-* exist
ADD: --lift-scale: 1.05 (for drag/expanded states)
ADD: --lift-scale-strong: 1.08 (for thumb/active drag states)

LOCATION: CARD_SURFACE / TILE_SURFACE / SECTION_SURFACE / CTRL_SURFACE
ACTION: Add -webkit-tap-highlight-color: transparent to each

LOCATION: After REDUCED_MOTION (line 1252)
ACTION: Add TRANSITION_PROPERTIES export with canonical property sets:
  - TRANSITION_TILE: 'background var(--motion-ui) var(--ease-standard), border-color var(--motion-ui) var(--ease-standard), box-shadow var(--motion-ui) var(--ease-standard), transform var(--motion-ui) var(--ease-standard)'
  - TRANSITION_BUTTON: 'background var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard)'
  - TRANSITION_SURFACE: 'background var(--motion-surface) var(--ease-standard), opacity var(--motion-surface) var(--ease-standard)'
```

#### tunet_actions_card.js

```
LINE 216: Replace transition: all .15s ease
  → transition: background var(--motion-fast) var(--ease-standard), transform var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)
HOVER: Wrap any :hover selectors in @media (hover: hover) { }
LINE (scale): Replace hardcoded .96 with var(--press-scale)
```

#### tunet_scenes_card.js

```
VERIFY: Lines 178-199 — already uses multi-property transition (good)
HOVER: Wrap any :hover selectors in @media (hover: hover) { }
LINE (scale): Replace hardcoded 0.96 with var(--press-scale)
```

#### tunet_light_tile.js

```
LINE 152: Replace transition: all
  → transition: background var(--motion-ui) var(--ease-standard), transform var(--motion-ui) var(--ease-standard), box-shadow var(--motion-ui) var(--ease-standard)
VERIFY: Lines 85-86 — existing hover guard (should be compliant)
LINE (scale): Replace hardcoded 1.05 with var(--lift-scale)
```

#### tunet_lighting_card.js

```
LINES 200, 224, 304, 428, 580: Replace transition: all (5 instances)
  → specific properties per context (tile: bg+border+shadow+transform; button: bg+transform)
SCALES: Lines with .94 → var(--press-scale-strong); .98 → var(--press-scale) approximately
VERIFY: Existing hover guard on main :hover blocks
ADD GUARD: Where :hover blocks are unguarded within this file
```

#### tunet_rooms_card.js

```
LINES 139, 204, 235, 403, 448: Replace transition: all (5 instances)
HOVER: Wrap all :hover selectors in @media (hover: hover) { }
SCALES: Replace .90 → var(--press-scale-strong); .94 → var(--press-scale-strong); .95/.96 → var(--press-scale)
```

#### tunet_climate_card.js

```
LINES 113, 136, 192, 236, 319: Replace transition: all (5 instances)
HOVER: Wrap all :hover selectors in @media (hover: hover) { }
SCALES: Replace .94 → var(--press-scale-strong); .97/.98 → var(--press-scale); 1.08 → var(--lift-scale-strong)
FOCUS: Add :focus-visible rules for interactive elements (5 gaps)
NOTE: Preserve gold standard visual baseline — changes are additive CSS, not structural
```

#### tunet_sensor_card.js

```
LINES 98, 124, 160: Replace transition: all (3 instances)
HOVER: Wrap :hover selectors in @media (hover: hover) { }
SCALES: Replace 0.97 → var(--press-scale); 0.99 → var(--press-scale)
NOTE: Respect data-interaction="none" guards — do not add hover/focus to non-interactive rows
```

#### tunet_weather_card.js

```
LINES 63, 114, 181: Replace transition: all (3 instances)
HOVER: Wrap :hover selectors in @media (hover: hover) { }
SCALES: Replace .98 → var(--press-scale)
FOCUS: Add :focus-visible rules for interactive elements (5 gaps)
```

#### tunet_media_card.js

```
LINES 56, 67, 108, 168, 241, 262, 281, 342: Replace transition: all (8 instances)
HOVER: Wrap all :hover selectors in @media (hover: hover) { }
SCALES: Replace .90 → var(--press-scale-strong); .97/.98 → var(--press-scale); 1.08 → var(--lift-scale-strong)
FOCUS: Add :focus-visible rules for ALL interactive elements (14 gaps)
```

#### tunet_sonos_card.js

```
LINES 131, 156, 312: Replace transition: all (3 instances)
HOVER: Wrap all :hover selectors in @media (hover: hover) { }
SCALES: Replace .90 → var(--press-scale-strong); .97 → var(--press-scale); 1.06 → var(--lift-scale)
FOCUS: Add :focus-visible rules for ALL interactive elements (10 gaps)
```

#### tunet_speaker_grid_card.js

```
LINES 108, 116, 235: Replace transition: all (3 instances)
HOVER: Wrap :hover selectors in @media (hover: hover) { }
SCALES: Replace .97/.98 → var(--press-scale); 1.03 → var(--lift-scale)
FIX: Replace var(--blue) → var(--focus-ring-color) in focus ring
FIX: Remove or define --spring CSS variable reference
```

### CD2 Validation Steps

1. **Static checks**:
   - `node --check` on every modified JS file
   - `grep 'transition: all' Cards/v3/*.js` returns 0 hits (excluding status)
   - `grep -P ':hover' Cards/v3/*.js | grep -v '@media' | grep -v 'status'` returns 0 unguarded hits

2. **Lab validation**:
   - All 13 cards render without red card errors
   - Tab through every card — focus ring visible on all interactive elements
   - Touch simulation (Chrome DevTools) — no persistent hover states

3. **Breakpoint screenshots**:
   - 390x844, 768x1024, 1024x1366, 1440x900
   - Compare before/after for visual regression (especially climate gold standard)

4. **Build validation**:
   - `npm run tunet:build` succeeds
   - dist/ outputs updated

### CD2 Acceptance Criteria (from plan)

1. No touched file contains `transition: all`
2. No touched hover selector remains unguarded unless documented
3. All touched press states use shared base tokens
4. Reduced-motion behavior exists in base contract and is honored
5. `cross_card_interaction_vocabulary.md` reflects implemented contract

---

## 2. CD3 — Shared Semantics Adoption (High-Level)

**Detailed planning occurs when CD2 closes.**

### Scope

- Add `role="button"` + `tabindex="0"` to click-only interactive elements
- Add `keydown` handlers for Enter/Space via shared `bindButtonActivation()` helper
- Fix light_tile role (button → slider with ARIA)
- Audit cursor:pointer elements for role assignments

### Priority Order

1. tunet_media_card.js (14 handlers, 0 focus-visible → highest debt)
2. tunet_sonos_card.js (10 handlers)
3. tunet_climate_card.js (6 handlers, gold standard — careful)
4. tunet_weather_card.js (5 handlers)
5. tunet_rooms_card.js (4 handlers)
6. tunet_lighting_card.js (3 handlers — existing role/tabindex on some)
7. tunet_speaker_grid_card.js (3 handlers — existing slider semantics)
8. Remaining low-debt cards

### Base Work

- Add `bindButtonActivation(el, handler, options)` to tunet_base.js
- Optionally add `applyButtonSemantics(el, { label, tabindex })` if needed by 2+ files

### Acceptance (from plan)

1. No touched file has click-only primary container without keyboard activation
2. Native buttons remain native
3. Existing slider semantics preserved (climate, lighting, speaker_grid)
4. Lab verifies Enter/Space on every fixed element

---

## 3. CD4 — Shared Sizing & Sections Adoption (High-Level)

**Detailed planning occurs when CD3 closes.**

### Scope

- Fix grid-auto-rows in tunet_lighting_card.js (remove or Sections-aware)
- Decide status_card grid-auto-rows (depends on G3S lock state)
- Migrate legacy profile contract in 6 cards + base
- Validate getGridOptions() intentionality per card
- Document scenes_card Sections contract (scroll vs wrap)
- Update sections_layout_matrix.md

### Files

tunet_base.js, tunet_light_tile.js, tunet_lighting_card.js, tunet_rooms_card.js, tunet_sensor_card.js, tunet_speaker_grid_card.js, tunet_scenes_card.js

Verify-only: tunet_climate_card.js, tunet_nav_card.js  
Excluded: tunet_status_card.js (unless G3S lifts)

### Key Decisions Required at CD4 Start

1. Profile replacement architecture: auto-size helper vs per-card ResizeObserver
2. scenes_card: wrap-only in Sections or document scroll as intentional
3. lighting_card: fixed row height removal vs Sections-aware conditional
4. getGridOptions rows/columns mapping for multi-item cards

---

## 4. CD5-CD11 — Bespoke Passes (High-Level)

Each bespoke pass activates only after all shared passes (CD2-CD4) are closed. Detailed planning happens at tranche activation.

### CD5 — Utility Strip (actions + scenes)

- getGridOptions variant/compact awareness
- Scene/action chip semantic decisions
- Scenes wrap mode decision for Sections
- Actions YAML-first policy preservation

### CD6 — Lighting (light_tile + lighting_card)

- Hold-to-drag migration: 500ms → 400ms + haptic feedback
- Info tile keyboard completion
- Fixed-row / clipping / scroll contract stabilization
- KI-001 drag guard preservation
- surface: tile CSS contract definition

### CD7 — Rooms (rooms_card)

- Tile variant → navigation-tile contract alignment (tap=navigate)
- stopPropagation row control hardening
- Row/tile breakpoint validation
- light_entities → lights[] synthesis improvement

### CD8 — Environment (climate + sensor + weather)

- Climate header keyboard (preserve gold standard)
- Sensor row-level polish
- Weather header interactive decision
- Weather forecast tile fake-interactive cleanup

### CD9 — Media (media + sonos + speaker_grid)

- Hold-to-drag 400ms + haptic across all speaker tiles
- Speaker tile unification contract (tap=select, hold-drag=volume, icon=more-info, badge=group)
- Album art interaction decision
- Volume track slider semantics decision
- Volume view/overlay 5s auto-exit lifecycle
- --spring CSS variable resolution

### CD10 — Navigation Verify (nav_card)

- Active-route accuracy
- Browser back/forward
- Safe-area/footer placement
- Global style leakage
- Bare object editor items

### CD11 — Status Decision Gate

- G3S lock preserve or lift
- If lifted: separate implementation plan before code
- All deferred interaction/semantics/sizing work applies if unlocked

---

## 5. CD12 — Surface Assembly (High-Level)

Sequential surface composition, each gated on prior surface sign-off:

1. Living Room reference surface
2. Living Room popup
3. Overview
4. Media
5. Remaining room pages

Per-surface deliverables: live baseline, architecture baseline, target design, target card set, delta documentation.

---

## 6. Evidence Required Per Tranche Close

Every tranche close requires:

1. Exact changed file list
2. Exact validation commands run
3. Breakpoint screenshots at 390x844, 768x1024, 1024x1366, 1440x900
4. Live HA checks performed
5. Remaining open risks documented

Minimum validation set:
- `node --check <each changed JS file>`
- YAML parse-check for changed YAML
- `npm run tunet:build` if build outputs affected
- Playwright screenshots at all 4 locked breakpoints

---

## 7. Stop Rules

1. Shared passes do not solve bespoke behavior
2. Bespoke passes do not reopen shared pattern design
3. tunet_base.js may change only in CD1, CD2, CD3, and later when explicitly listed
4. No card file enters a tranche unless named in that tranche
5. No surface YAML outside rehab lab is active before CD11
6. CD2/CD3 boundary is hard: CD2 = CSS, CD3 = JS keyboard/semantics
7. Status card excluded from all shared passes unless G3S lock explicitly lifted
