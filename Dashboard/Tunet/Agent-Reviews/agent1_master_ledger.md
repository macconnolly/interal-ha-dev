# Agent 1: Master Ledger — CD2-CD12

**Branch:** main @ 30fc3be  
**Date:** 2026-04-03  
**Role:** Manager / Ledger Integrator (Agent 1 of 4)  
**Status:** FINAL — integrates Agent 2, 3, and 4 findings with corrections  
**Supersedes:** agent1_master_ledger.md from 2026-03-06

---

## 1. Ledger Overview

This ledger classifies every open issue across the 13-card Tunet suite by tranche assignment (CD2-CD12), severity, and current/target state. Sources:

- Agent 2: HA standards compliance (post-CD1)
- Agent 3: codebase map with exact debt counts
- Agent 4: feasibility critique and corrections

### Count Reconciliation

| Metric | Agent 2 | Agent 3 | Agent 4 Verdict | Adopted Count |
|--------|---------|---------|-----------------|---------------|
| transition:all instances | "10/13 cards" | 41 | A3 off by 1; actual 40 | **40 instances across 11 cards** |
| Hover guard gaps | "11/13 cards missing" | "2 unguarded selectors in lighting" | Different units — A2 counted cards, A3 spot-checked one file | **11 cards missing guard** |
| Hardcoded press scales | not counted | 56 total | Plausible but unverified | **56 (to be verified at CD2 start)** |
| Click-only handlers | not counted | 56 handlers | Real count, but CD3 not CD2 | **56 handlers (CD3 scope)** |
| Focus-visible gaps | media(14), sonos(10), climate(5), weather(5) | Same | Consistent | **34 elements across 4 critical cards** |
| grid-auto-rows violations | 2 cards, P1 | "Medium" / "Good" | A2 correct; A3 missed/downplayed | **2 cards (CD4 scope, not CD2 blocker)** |

### Agent 4 Corrections Applied

1. **Control docs**: plan.md, FIX_LEDGER.md, handoff.md referenced by CLAUDE.md are at repo root level — Agent 4 searched wrong path
2. **Lab validation**: All 13 cards render in lab; Playwright screenshots captured — CD0/CD1 complete
3. **grid-auto-rows**: Classified as CD4 scope per plan; not a CD2 blocker
4. **Hold-to-drag**: CD5-CD11 bespoke scope, not CD2 — CD2 is CSS interaction only
5. **CD2/CD3 boundary**: CD2 = CSS (transitions, hover, press, focus, reduced-motion). CD3 = JS (role, tabindex, keyboard handlers, ARIA)

---

## 2. Issue Registry — CD2 (Shared Interaction Adoption)

**Scope**: CSS-only interaction patterns. No JS keyboard retrofits. No role/tabindex changes.

### INT-001: transition:all Replacement

| Field | Value |
|-------|-------|
| **Severity** | High |
| **Current** | 40 `transition: all` declarations across 11 cards |
| **Target** | Zero `transition: all`; all replaced with explicit property transitions |
| **Tranche** | CD2 |

Per-card breakdown:

| ID | Card | Count | Lines | Priority |
|----|------|-------|-------|----------|
| INT-001a | tunet_climate_card.js | 5 | 113, 136, 192, 236, 319 | High |
| INT-001b | tunet_lighting_card.js | 5 | 200, 224, 304, 428, 580 | High |
| INT-001c | tunet_media_card.js | 8 | 56, 67, 108, 168, 241, 262, 281, 342 | High |
| INT-001d | tunet_rooms_card.js | 5 | 139, 204, 235, 403, 448 | High |
| INT-001e | tunet_sensor_card.js | 3 | 98, 124, 160 | High |
| INT-001f | tunet_sonos_card.js | 3 | 131, 156, 312 | High |
| INT-001g | tunet_speaker_grid_card.js | 3 | 108, 116, 235 | High |
| INT-001h | tunet_status_card.js | 3 | 211, 535, 609 | **EXCLUDED** (lock) |
| INT-001i | tunet_weather_card.js | 3 | 63, 114, 181 | Medium |
| INT-001j | tunet_actions_card.js | 1 | 216 | Medium |
| INT-001k | tunet_light_tile.js | 1 | 152 | Medium |

**CD2 actionable**: 37 instances across 10 cards (status excluded).

---

### INT-002: Hover Guard (@media (hover: hover))

| Field | Value |
|-------|-------|
| **Severity** | High (touch device compatibility) |
| **Current** | 11/13 cards missing `@media (hover: hover)` guard on `:hover` selectors |
| **Target** | All `:hover` blocks wrapped in `@media (hover: hover) { }` |
| **Tranche** | CD2 |

| ID | Card | Status | Notes |
|----|------|--------|-------|
| INT-002a | tunet_actions_card.js | MISSING | Needs guard |
| INT-002b | tunet_climate_card.js | MISSING | Needs guard |
| INT-002c | tunet_media_card.js | MISSING | Needs guard |
| INT-002d | tunet_nav_card.js | MISSING | Verify-only in CD2 |
| INT-002e | tunet_rooms_card.js | MISSING | Needs guard |
| INT-002f | tunet_scenes_card.js | MISSING | Needs guard |
| INT-002g | tunet_sensor_card.js | MISSING | Needs guard |
| INT-002h | tunet_sonos_card.js | MISSING | Needs guard |
| INT-002i | tunet_speaker_grid_card.js | MISSING | Needs guard |
| INT-002j | tunet_status_card.js | MISSING | **EXCLUDED** (lock) |
| INT-002k | tunet_weather_card.js | MISSING | Needs guard |
| — | tunet_light_tile.js | COMPLIANT | Has guard |
| — | tunet_lighting_card.js | COMPLIANT | Has guard |

**CD2 actionable**: 9 cards need guard added (status excluded, nav verify-only).

---

### INT-003: Hardcoded Press Scale Normalization

| Field | Value |
|-------|-------|
| **Severity** | High (visual inconsistency) |
| **Current** | 56 hardcoded scale values (e.g., .90, .94, .95, .96, .97, .98, 1.03, 1.05, 1.06, 1.08) |
| **Target** | All press/active scales use `var(--press-scale)` (0.96) or `var(--press-scale-strong)` (0.94) |
| **Tranche** | CD2 |

| ID | Card | Count | Example Values | Priority |
|----|------|-------|----------------|----------|
| INT-003a | tunet_media_card.js | 10 | .90, .97, .98, 1.08 | Critical |
| INT-003b | tunet_status_card.js | 9 | .95, .97, 1.08 | **EXCLUDED** (lock) |
| INT-003c | tunet_climate_card.js | 8 | .94, .97, .98, 1.08 | Critical |
| INT-003d | tunet_sonos_card.js | 6 | .90, .97, 1.06 | High |
| INT-003e | tunet_rooms_card.js | 5 | 0.90, 0.94, 0.95, 0.96 | High |
| INT-003f | tunet_speaker_grid_card.js | 4 | .97, .98, 1.03 | High |
| INT-003g | tunet_lighting_card.js | 4 | .94, .98 | High |
| INT-003h | tunet_base.js | 4 | 0.97, 1 (keyframes) | High |
| INT-003i | tunet_sensor_card.js | 2 | 0.97, 0.99 | Medium |
| INT-003j | tunet_weather_card.js | 1 | .98 | Medium |
| INT-003k | tunet_scenes_card.js | 1 | 0.96 | Medium |
| INT-003l | tunet_light_tile.js | 1 | 1.05 | Medium |
| INT-003m | tunet_actions_card.js | 1 | .96 | Medium |

**CD2 actionable**: 47 instances across 12 files (status excluded).

**Note**: Values like 1.05 and 1.08 are "lift" scales (drag/expanded states), not press scales. These need a separate token decision (e.g., `--lift-scale: 1.05`). CD2 must define the token set, not blindly replace all scale values.

---

### INT-004: Focus-Visible Styling

| Field | Value |
|-------|-------|
| **Severity** | High (accessibility) |
| **Current** | 4 cards missing `:focus-visible` rules entirely; others have partial coverage |
| **Target** | All interactive elements have `:focus-visible { outline: 2px solid var(--focus-ring-color); outline-offset: 2px; }` |
| **Tranche** | CD2 (CSS rules only; adding tabindex is CD3) |

| ID | Card | Interactive Elements | Has :focus-visible | Gap | Status |
|----|------|---------------------|-------------------|-----|--------|
| INT-004a | tunet_media_card.js | 14 | 0 | **14** | CRITICAL |
| INT-004b | tunet_sonos_card.js | 10 | 0 | **10** | CRITICAL |
| INT-004c | tunet_climate_card.js | 6 | 1 | **5** | CRITICAL |
| INT-004d | tunet_weather_card.js | 5 | 0 | **5** | CRITICAL |
| INT-004e | tunet_status_card.js | 6 | 3 | 3 | **EXCLUDED** (lock) |
| INT-004f | tunet_rooms_card.js | 4 | 3 | 1 | Low gap |
| INT-004g | tunet_lighting_card.js | 4 | 11 | 0 | OK |
| INT-004h | tunet_speaker_grid_card.js | 3 | 3 | 0 | OK |
| INT-004i | tunet_nav_card.js | 1 | 3 | 0 | OK |
| INT-004j | tunet_sensor_card.js | 1 | 3 | 0 | OK |
| INT-004k | tunet_scenes_card.js | 1 | 3 | 0 | OK |
| INT-004l | tunet_actions_card.js | 1 | 3 | 0 | OK |
| INT-004m | tunet_light_tile.js | 0 | — | — | N/A |

**CD2 actionable**: Add `:focus-visible` CSS rules to 5 cards (media, sonos, climate, weather, rooms). CD2 adds the CSS selectors; CD3 adds the JS `tabindex` attributes that make them reachable.

---

### INT-005: -webkit-tap-highlight-color

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | ALL 14 files missing `-webkit-tap-highlight-color: transparent` |
| **Target** | Added to `:host` in every card or centralized in base CARD_SURFACE/TILE_SURFACE |
| **Tranche** | CD2 |

**CD2 actionable**: Add to tunet_base.js shared surface exports; verify all 12 non-excluded cards inherit.

---

### INT-006: Base Interaction Contract Exports

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | Tokens exist (`--press-scale`, `--motion-ui`, etc.) but no shared transition property-set export |
| **Target** | tunet_base.js exports canonical transition property sets, hover guard template, press-scale usage pattern |
| **Tranche** | CD2 |

**CD2 actionable**: Extend TOKENS or create INTERACTION_PATTERNS export in tunet_base.js.

---

### INT-007: speaker_grid_card CSS Anomalies

| Field | Value |
|-------|-------|
| **Severity** | Low |
| **Current** | `--spring` CSS variable undefined in base TOKENS; focus ring uses `var(--blue)` instead of `var(--focus-ring-color)` |
| **Target** | Remove `--spring` reference or define it; use `var(--focus-ring-color)` |
| **Tranche** | CD2 |
| **Source** | cards_reference.md §12 Known Limitations |

---

## 3. Issue Registry — CD3 (Shared Semantics Adoption)

**Scope**: JS changes — role, tabindex, keyboard handlers, ARIA attributes.

### SEM-001: Click-Only Interactive Elements

| Field | Value |
|-------|-------|
| **Severity** | High (keyboard accessibility) |
| **Current** | 56 click-only handlers across 12 cards without keyboard activation |
| **Target** | All click-interactive elements have `role="button"`, `tabindex="0"`, Enter/Space keydown handler |
| **Tranche** | CD3 |

| ID | Card | Click Handlers | Priority |
|----|------|---------------|----------|
| SEM-001a | tunet_media_card.js | 14 | High |
| SEM-001b | tunet_sonos_card.js | 10 | High |
| SEM-001c | tunet_climate_card.js | 6 | High |
| SEM-001d | tunet_status_card.js | 6 | **EXCLUDED** (lock) |
| SEM-001e | tunet_weather_card.js | 5 | Medium |
| SEM-001f | tunet_rooms_card.js | 4 | Medium |
| SEM-001g | tunet_lighting_card.js | 3 | Medium |
| SEM-001h | tunet_speaker_grid_card.js | 3 | Medium |
| SEM-001i | tunet_sensor_card.js | 1 | Low |
| SEM-001j | tunet_nav_card.js | 1 | Low |
| SEM-001k | tunet_scenes_card.js | 1 | Low |
| SEM-001l | tunet_actions_card.js | 1 | Low |

---

### SEM-002: cursor:pointer Without Keyboard Semantics

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | 44 instances of `cursor: pointer` on elements lacking role/tabindex |
| **Target** | Every `cursor: pointer` element has matching role and keyboard activation |
| **Tranche** | CD3 |

---

### SEM-003: Base Button-Activation Helper

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | No shared helper for button semantics |
| **Target** | `bindButtonActivation(el, handler, options)` in tunet_base.js |
| **Tranche** | CD3 |
| **Source** | Plan lines 542-550 |

---

### SEM-004: light_tile role Mismatch

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | `role="button"` but arrow keys adjust brightness like a slider |
| **Target** | Change to `role="slider"` with `aria-valuenow/min/max` |
| **Tranche** | CD3 |
| **Source** | cards_reference.md §3 Accessibility |

---

## 4. Issue Registry — CD4 (Shared Sizing & Sections Adoption)

**Scope**: Profile contract migration, grid-auto-rows fixes, Sections compliance.

### SIZ-001: grid-auto-rows Violations

| Field | Value |
|-------|-------|
| **Severity** | P1 within CD4 (Sections blocker when cards are placed in Sections) |
| **Current** | 2 cards force internal row heights |
| **Target** | Remove or parameterize grid-auto-rows; validate in Sections layout |
| **Tranche** | CD4 |

| ID | Card | Current Code | Line |
|----|------|-------------|------|
| SIZ-001a | tunet_lighting_card.js | `grid-auto-rows: var(--grid-row, 110px)` | 367 |
| SIZ-001b | tunet_status_card.js | `grid-auto-rows: var(--tile-row-h)` | 189 |

**Note**: Agent 2 rated P1; Agent 3 rated Medium. Agent 4 says A2 is correct. Plan explicitly assigns to CD4 scope (plan line 629). Status card is additionally under G3S lock.

**Status card special case**: grid-auto-rows is *intentional* for uniform tile rhythm (cards_reference.md §9). Resolution depends on whether G3S lock lifts.

---

### SIZ-002: Legacy Profile Contract Migration

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | 7 cards + base use superseded profile resolver (selectProfileSize, resolveSizeProfile, _setProfileVars) |
| **Target** | Explicit `tile_size` config + `:host([tile-size="..."])` CSS variants + ResizeObserver |
| **Tranche** | CD4 |

| ID | Card | Profile Functions Used |
|----|------|----------------------|
| SIZ-002a | tunet_light_tile.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002b | tunet_lighting_card.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002c | tunet_rooms_card.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002d | tunet_sensor_card.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002e | tunet_speaker_grid_card.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002f | tunet_status_card.js | selectProfileSize, resolveSizeProfile, _setProfileVars |
| SIZ-002g | tunet_base.js | Exports all profile functions |

**Migration path**: Leave legacy code in place; incremental removal during active card tranches. Verify no cards are half-migrated.

---

### SIZ-003: Hardcoded Heights

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | Multiple cards have px-based fixed heights |
| **Target** | Intrinsic sizing or em-based relative sizing |
| **Tranche** | CD4 |

| Card | Hardcoded Heights | Severity |
|------|------------------|----------|
| tunet_media_card.js | 19 | Medium |
| tunet_climate_card.js | 16 | Medium |
| tunet_speaker_grid_card.js | 15 | Medium |
| tunet_lighting_card.js | 12 | Medium |
| tunet_sonos_card.js | 11 | Medium |
| tunet_scenes_card.js | 7 | Low |
| tunet_weather_card.js | 7 | Low |
| tunet_nav_card.js | 5 | Low |

---

### SIZ-004: scenes_card Sections Contract

| Field | Value |
|-------|-------|
| **Severity** | Medium |
| **Current** | `allow_wrap: false` (default) creates `overflow-x: auto` — risky in Sections |
| **Target** | Explicit decision: wrap-only in Sections or document scroll as intentional |
| **Tranche** | CD4 |
| **Source** | cards_reference.md §2 Sections Safety |

---

## 5. Issue Registry — CD5-CD11 (Bespoke Passes)

### CD5 — Utility Strip Bespoke

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-005a | tunet_actions_card.js | getGridOptions not variant/compact-aware | Plan CD5 |
| BSP-005b | tunet_actions_card.js | Custom actions require YAML — no Level 2 editor path | cards_reference §1 |
| BSP-005c | tunet_actions_card.js | 7-operator condition system undocumented to users | cards_reference §1 |
| BSP-005d | tunet_scenes_card.js | Header semantic vs decorative decision | Plan CD5 |
| BSP-005e | tunet_scenes_card.js | getCardSize/getGridOptions not allow_wrap-aware | Plan CD5 |
| BSP-005f | tunet_scenes_card.js | Unavailable scene disabled semantics | Plan CD5 |
| BSP-005g | tunet_scenes_card.js | active_when_operator only 3 operators vs actions' 7 | cards_reference §2 |

### CD6 — Lighting Bespoke

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-006a | tunet_light_tile.js | Hold-to-drag migration (400ms + haptic) | cards_reference §3 |
| BSP-006b | tunet_light_tile.js | KI-001 guard behavior preservation | Plan CD6 |
| BSP-006c | tunet_lighting_card.js | Info tile keyboard completion | Plan CD6 |
| BSP-006d | tunet_lighting_card.js | Fixed-row / clipping / scroll contract stabilization | Plan CD6 |
| BSP-006e | tunet_lighting_card.js | Adaptive toggle/manual reset scoping | Plan CD6 |
| BSP-006f | tunet_lighting_card.js | surface: tile CSS contract undefined | cards_reference §4 |

### CD7 — Rooms Bespoke

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-007a | tunet_rooms_card.js | Tile variant: align to navigation-tile contract (tap=navigate) | cards_reference §5 |
| BSP-007b | tunet_rooms_card.js | stopPropagation fragility on row controls | cards_reference §5 |
| BSP-007c | tunet_rooms_card.js | Nested lights[] YAML-only — no editor path | cards_reference §5 |
| BSP-007d | tunet_rooms_card.js | Row/tile breakpoint validation at all locked sizes | Plan CD7 |

### CD8 — Environment Bespoke

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-008a | tunet_climate_card.js | Header tile keyboard completion | Plan CD8 |
| BSP-008b | tunet_climate_card.js | Preserve gold standard visual baseline | Plan CD8 |
| BSP-008c | tunet_sensor_card.js | Remaining row-level polish | Plan CD8 |
| BSP-008d | tunet_sensor_card.js | icon_color and history_hours should be editor fields | cards_reference §8 |
| BSP-008e | tunet_weather_card.js | Header info tile interactive decision | Plan CD8 |
| BSP-008f | tunet_weather_card.js | Forecast tiles fake-interactive (cursor:pointer, no semantics) | cards_reference §7 |

### CD9 — Media Bespoke

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-009a | tunet_media_card.js | Header info tile keyboard completion | Plan CD9 |
| BSP-009b | tunet_media_card.js | Album art interaction decision (more-info? navigate?) | Plan CD9 / cards_reference §10 |
| BSP-009c | tunet_media_card.js | Volume track slider semantics decision | Plan CD9 |
| BSP-009d | tunet_media_card.js | Volume view 5s auto-exit lifecycle | cards_reference §10 |
| BSP-009e | tunet_sonos_card.js | Speaker tile semantic model decision (slider vs button) | Plan CD9 |
| BSP-009f | tunet_sonos_card.js | --spring CSS variable undefined | cards_reference §11 |
| BSP-009g | tunet_sonos_card.js | Volume overlay 5s auto-exit lifecycle | cards_reference §11 |
| BSP-009h | tunet_speaker_grid_card.js | Header info tile keyboard completion | Plan CD9 |
| BSP-009i | tunet_speaker_grid_card.js | Hover translateY(-1px) removal | cards_reference §12 |
| BSP-009j | ALL media cards | Hold-to-drag 400ms + haptic (currently 500ms, no haptic) | Agent 4 §3, cards_reference §1-2 |
| BSP-009k | ALL media cards | Speaker tile unification (tap=select, hold-drag=volume, icon=more-info, badge=group) | cards_reference §Speaker Tile Unification Target |

### CD10 — Navigation Verify

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-010a | tunet_nav_card.js | Active-route accuracy verification | Plan CD10 |
| BSP-010b | tunet_nav_card.js | Browser back/forward behavior | Plan CD10 |
| BSP-010c | tunet_nav_card.js | Safe-area and footer placement | Plan CD10 |
| BSP-010d | tunet_nav_card.js | Global style leakage verification | Plan CD10 |
| BSP-010e | tunet_nav_card.js | bare `{ object: {} }` editor for subview_paths/items | Agent 2 §2 |

### CD11 — Status Decision Gate

| ID | Card | Issue | Source |
|----|------|-------|--------|
| BSP-011a | tunet_status_card.js | G3S lock decision: preserve or lift | Plan CD11 |
| BSP-011b | tunet_status_card.js | grid-auto-rows (intentional for uniform tile rhythm) | SIZ-001b |
| BSP-011c | tunet_status_card.js | transition:all (3 instances, line 211, 535, 609) | INT-001h |
| BSP-011d | tunet_status_card.js | Hover guard missing | INT-002j |
| BSP-011e | tunet_status_card.js | Press scale normalization (9 hardcoded) | INT-003b |
| BSP-011f | tunet_status_card.js | Focus-visible gaps (3 elements) | INT-004e |
| BSP-011g | tunet_status_card.js | tiles[] yaml-only (5 polymorphic types) | cards_reference §9 |
| BSP-011h | tunet_status_card.js | Mode-driven synthesis authoring model (when G3S lifts) | cards_reference §9 |

---

## 6. Issue Registry — CD12 (Surface Assembly)

| ID | Surface | Gate | Source |
|----|---------|------|--------|
| SRF-012a | Living Room reference surface | All CD2-CD8 closed | Plan CD12 |
| SRF-012b | Living Room popup | Living Room surface signed off | Plan CD12 |
| SRF-012c | Overview | Living Room popup signed off | Plan CD12 |
| SRF-012d | Media | Overview signed off | Plan CD12 |
| SRF-012e | Remaining room pages | Media signed off | Plan CD12 |

---

## 7. Compliance Scorecard (Post-CD1)

| Standard | Pass Rate | Owner |
|----------|-----------|-------|
| Custom Element Registration | 13/13 (100%) | Done |
| Editor Compliance | 12/13 (92.3%) | Done (nav bare object acceptable) |
| Sections Grid Options | 11/13 (84.6%) | CD4 (2 grid-auto-rows) |
| Keyboard Accessibility | 8/13 (61.5%) | CD3 |
| Touch Device Safety | 2/13 (15.4%) | CD2 |
| CSS Anti-patterns | 3/13 (23.1%) | CD2 |

---

## 8. Known Gaps Not Yet Assigned

| Gap | Description | Discovered By | Blocker? |
|-----|-------------|---------------|----------|
| Hold-to-drag 500ms vs 400ms | Code defaults to 500ms; contract says 400ms + haptic | Agent 4 | No — CD9 scope |
| Profile supersession tracking | 7 cards on legacy contract; no migration evidence yet | Agent 4 | No — CD4 scope |
| Nav editor bare object | subview_paths and items use `{ object: {} }` (YAML textbox) | Agent 2 | No — CD10 scope |
| Build output validation | Neither A2 nor A3 ran build validation; dist/ exists and is dated correctly | Agent 4 | No — dist verified |
| getGridOptions static | All 13 cards return static values; dynamic sizing is YAML-only | Agent 3/4 | No — by design |
