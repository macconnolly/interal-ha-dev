# Agent 1: Decision Register — CD2-CD12

**Branch:** main @ 30fc3be  
**Date:** 2026-04-03  
**Role:** Manager / Ledger Integrator (Agent 1 of 4)  
**Status:** FINAL — captures all architectural decisions from this session  
**Supersedes:** agent1_decision_register.md from 2026-03-06

---

## D-001: Consistency-Driver Pass Order

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Plan adoption (Apr 2, 2026) |
| **Decision** | Execution order is consistency-driver passes across the suite, not surface-first and not card-family buckets. Order: CD0 build → CD1 config → CD2 interaction → CD3 semantics → CD4 sizing → CD5-CD11 bespoke → CD12 surfaces. |
| **Rationale** | Mixed execution (shared + bespoke in same tranche) caused compounding regressions. Consistency-first means every card reaches the same baseline before bespoke behavior is touched. This prevents "fix one card, regress another" loops. |
| **Alternatives Rejected** | (1) Surface-first: build Living Room page, fixing cards as encountered. Rejected because card fixes would be ad-hoc and not suite-wide. (2) Card-family buckets: fix all lighting cards, then all media cards, etc. Rejected because shared patterns (transitions, hover, press) cross family boundaries. |
| **Revisit Trigger** | If consistency passes take >3 weeks each and surface deadlines are missed. |

---

## D-002: Three-Layer Editor Architecture

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | CD1 implementation + cards_reference.md (Apr 3, 2026) |
| **Decision** | Every card uses a three-layer model: (1) Authoring model — small, opinionated editor surface asking for high-level intent. (2) Synthesizer — setConfig normalizes editor choices into full runtime shape. (3) Runtime model — can be richer than what the editor exposes. |
| **Rationale** | Users should never need to understand internal config structures. The editor asks "what layout?" and synthesis derives columns, breakpoints, and tile sizes. This decouples editor simplicity from runtime complexity. |
| **Evidence** | Climate card authoring model (3 primary + 4 advanced fields) produces clean runtime config. Lighting card authoring model (6 decisions) synthesizes zones, columns, breakpoints, adaptive entities. Scenes card authoring model ≈ runtime model (simple enough). |
| **Alternatives Rejected** | (1) Mirror runtime 1:1 in editor: rejected because lighting has 16+ runtime fields, most derived. (2) No editor: rejected because HA dashboard users expect visual editing. |
| **Revisit Trigger** | If synthesis becomes a debugging burden (user sets X but card shows Y because synthesis overrode). |

---

## D-003: object+fields+multiple for Array Editing

| Field | Value |
|-------|-------|
| **Status** | CONFIRMED WORKING |
| **Locked By** | CD1 implementation + HA 2026.4.0 verification |
| **Decision** | Use `{ object: { fields: { ... }, multiple: true } }` selector in `getConfigForm()` for array config properties (zones, speakers, scenes, sensors, rooms). |
| **Rationale** | HA's built-in form renderer natively supports `object` with `fields` and `multiple: true` to create ordered array editors. Each item gets a full field-set sub-form. Eliminates need for custom `getConfigElement()` in most cases. |
| **Evidence** | scenes_card (CD1.7), lighting_card (CD1.8 zones + column_breakpoints), rooms_card (CD1.9 rooms), sensor_card (CD1.10 sensors), media_card (CD1.11 speakers), sonos_card (CD1.12 speakers), speaker_grid_card (CD1.13 speakers) — all confirmed working in lab. |
| **Limitations** | (1) Nested arrays within items not supported (sensor thresholds stay YAML-only). (2) Bare `{ object: {} }` without fields renders YAML textbox (nav_card subview_paths). (3) Complex union types not well-represented (status card tiles with 5 subtypes). |
| **Revisit Trigger** | If HA 2026.5+ adds a `choose` selector that handles polymorphic items better than object+fields. |

---

## D-004: Interaction Model — 7 Categories

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | cards_reference.md Interaction Model Contract (Apr 3, 2026) |
| **Decision** | All Tunet cards use exactly 7 interaction categories: (1) Control Tiles — tap toggle, hold-to-drag adjust. (2) Speaker Tiles — tap select, hold-to-drag volume, icon more-info, badge group. (3) Navigation Tiles — tap navigate, hold popup. (4) Navigation Rows — body tap navigate, orb tap toggle, power tap all-toggle. (5) Dedicated Controls — instant drag, no hold gate. (6) Action Chips — tap execute, no hold/drag. (7) Information Tiles — tap more-info, no hold/drag. |
| **Rationale** | Consistent, learnable interaction vocabulary. Hold-to-drag is used ONLY on continuous-value surfaces (brightness, volume). Navigation and action surfaces never use it. Users learn one gesture set for the entire dashboard. |
| **Key Constraint** | Hold-to-drag requires 400ms delay + haptic feedback. Currently implemented at 500ms with no haptic — alignment happens in CD6/CD9. |
| **Alternatives Rejected** | (1) Tap-to-drag (no hold gate): rejected because accidental drags during scroll. (2) Swipe gestures: rejected because conflict with page scrolling. (3) Double-tap for secondary action: rejected because too slow for frequent use. |
| **Revisit Trigger** | If user testing shows 400ms hold is too long or too short for real-world use. |

---

## D-005: Hold-to-Drag Contract (400ms + Haptic)

| Field | Value |
|-------|-------|
| **Status** | CONTRACTED but NOT YET IMPLEMENTED |
| **Locked By** | cards_reference.md §1-2 (Apr 3, 2026) |
| **Decision** | Hold-to-drag uses 400ms delay + haptic feedback (navigator.vibrate) to enter drag mode. |
| **Current State** | `createAxisLockedDrag()` in tunet_base.js defaults to `longPressMs: 500`. No haptic callback. Cards do not override the default. |
| **Implementation Plan** | (1) Update `longPressMs` default to 400 in tunet_base.js. (2) Add haptic callback (navigator.vibrate or onLongPress callback). (3) Update all 3 drag-using cards (light_tile, lighting_card, speaker_grid_card). Assigned to CD6 (lighting) and CD9 (media). |
| **Risk** | Agent 4 identified this as a contract/implementation mismatch. Acceptable gap — documented, scheduled. |
| **Revisit Trigger** | If real-world testing finds 400ms insufficient or haptic feedback is unreliable on target devices. |

---

## D-006: Sections Grid Model

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Source-validated Sections contract in cards_reference.md + plan (Apr 3, 2026) |
| **Decision** | Section internal grid: 12 columns per section column_span. Cell height: 56px, gap: 8px. `columns: 'full'` spans entire section; numeric columns are relative to 12 per span. `getGridOptions()` provides defaults; YAML grid_options overrides for context. |
| **Key Findings** | (1) With sidebar open, content columns reduced by 1 (`max(1, count-1)`). (2) `columns: 12` is full-width ONLY when effective section span is 1. (3) Cards have no section context at getGridOptions call time — static defaults only. |
| **getGridOptions Rules** | Use `rows: 'auto'` for variable content. Use `min_rows` as floor, not guessed height. Use numeric columns for standard-section ratios. Use `columns: 'full'` only for chrome (nav). Use multiples of 3 for column defaults. |
| **Alternatives Rejected** | (1) Dynamic getGridOptions based on section context: rejected because HA doesn't provide context. (2) Viewport-first sizing: rejected because Sections reasoning is page → section → card. |
| **Revisit Trigger** | If HA adds section-context parameters to getGridOptions(). |

---

## D-007: Configuration Tiers

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Plan §4 + CD1 implementation (Apr 3, 2026) |
| **Decision** | Three configuration tiers: editor-complete, editor-lite, yaml-first. Not all cards need full UI configurability. |
| **Tier Assignments** | |

| Tier | Cards | Rationale |
|------|-------|-----------|
| editor-complete | nav, scenes, light_tile, weather, sensor | Simple flat config or well-scoped arrays; all fields editable |
| editor-lite | lighting, rooms, climate, media, sonos, speaker_grid | High-value 80% in editor; advanced/legacy keys YAML-only |
| yaml-first | actions, status | Runtime complexity intentionally not mirrored in editor |

| **Rules** | editor-complete: all high-value fields round-trip through setConfig. editor-lite: editor covers common path; advanced documented as YAML-only. yaml-first: editor surface intentionally narrow; runtime contract clear. |
| **Alternatives Rejected** | (1) Universal editor-complete: rejected because status card has 5 polymorphic tile types — forcing full editor parity is high-complexity, low-value. (2) No editors at all: rejected because HA users expect visual editing. |
| **Revisit Trigger** | If HA adds `choose` selector powerful enough to handle status tile polymorphism. |

---

## D-008: light_entities Authoring Model for Rooms Card

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | cards_reference.md §5 + CD1.9 (Apr 3, 2026) |
| **Decision** | Rooms card editor exposes `light_entities` (multi-entity picker, light domain) per room. `setConfig()` synthesizes `light_entities` → `lights[]` (rich per-light objects). YAML `lights[]` wins when both present. |
| **Rationale** | Entity picker is the fastest editor path for "which lights are in this room." Power users who need custom per-light icons/names use YAML `lights[]` directly. Synthesis bridges the gap without forcing users to build `{entity, icon, name}` objects in the editor. |
| **Precedence** | `lights[]` (YAML) > `light_entities` (editor) > empty (no orbs) |
| **Alternatives Rejected** | (1) Full object+fields+multiple for lights[]: rejected because lights{entity,icon,name} is detailed per-light config that most users don't need. (2) Area-based room inference: interesting future path but requires HA area-entity discovery. |
| **Revisit Trigger** | If users consistently need per-light icon/name overrides and YAML editing is too friction-heavy. |

---

## D-009: CD2/CD3 Boundary Enforcement

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Plan §CD2 Forbidden Scope + Agent 4 critique (Apr 3, 2026) |
| **Decision** | CD2 = CSS-only interaction changes (transitions, hover guards, press scales, focus-visible CSS, reduced-motion, -webkit-tap-highlight-color). CD3 = JS keyboard/semantics changes (role, tabindex, keydown handlers, ARIA attributes). |
| **Rationale** | Agent 3 bundled click handlers and focus-visible as "CD2 remediation targets" — this mixes two concern levels. Agent 4 correctly identified that adding keyboard retrofits to CD2 would inflate scope from ~96 to 200+ changes. Keeping them separate means CD2 changes are pure CSS find-replace (low regression risk) while CD3 changes are behavioral (need functional testing). |
| **Enforcement Rule** | If during CD2 implementation a keyboard/role change is discovered as needed, document it in the ledger and defer to CD3. Do not add it to CD2. |
| **Revisit Trigger** | Never — this is a scope control decision, not an architectural one. |

---

## D-010: Status Card G3S Lock

| Field | Value |
|-------|-------|
| **Status** | ACTIVE LOCK |
| **Locked By** | Plan §CD11 + scope lock table (Apr 2, 2026) |
| **Decision** | Status card is excluded from all shared passes (CD2, CD3, CD4). It remains bugfix-only. CD11 is a gate: either (1) preserve lock, or (2) lift lock and create separate implementation plan. |
| **Rationale** | Status card is the most complex configuration surface (5 polymorphic tile types, polymorphic editor path, intentional grid-auto-rows for uniform tile rhythm). Touching it during shared passes risks regression in a card that is working correctly today. |
| **Accumulated Debt** | When lock lifts, status card needs: 3 transition:all fixes, hover guard, 9 press scale normalizations, 3 focus-visible gaps, grid-auto-rows decision, profile migration, tiles[] editor, mode-driven synthesis. |
| **Revisit Trigger** | Explicit user decision at CD11 gate. |

---

## D-011: Group Volume Policy

| Field | Value |
|-------|-------|
| **Status** | LOCKED (revised Apr 6, 2026) |
| **Locked By** | Explicit user decision during CD9 + cards_reference.md §Interaction Model |
| **Decision** | Volume controls the currently selected target. Selecting an individual speaker adjusts that speaker only. Selecting the grouped coordinator/current group leader adjusts the active group proportionally. Group membership changes remain explicit badge/action controls. |
| **Rationale** | This matches the Sonos mental model more closely, keeps one active audio target at a time, and makes the dropdown selection the single source of truth for transport/volume focus. |
| **Revisit Trigger** | If users want a separate explicit group-volume action instead of the grouped coordinator acting as the group target. |

---

## D-012: Speaker Tile Unification Target (CD9)

| Field | Value |
|-------|-------|
| **Status** | CONTRACTED for CD9 |
| **Locked By** | cards_reference.md §Speaker Tile Unification Target (Apr 3, 2026) |
| **Decision** | Across media_card, sonos_card, and speaker_grid_card: (1) tile body tap selects active speaker, (2) hold (400ms) then drag adjusts volume, (3) icon tap/hold opens more-info, (4) group badge tap toggles group membership. |
| **Current State** | media_card aligns on selected-target routing but still uses dropdown-first selection and pointer-first group badge semantics. sonos_card and speaker_grid_card now align on the visible speaker-tile contract: body tap selects active target, hold (400ms) then drag adjusts selected-target volume, icon tap/hold opens more-info, and badge toggles group membership. |
| **Revisit Trigger** | If the unified model creates confusion between "select active" and "toggle group" — these are different actions on the same tile and must be visually distinct. |

---

## D-013: Dark Mode Lock (Midnight Navy)

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | User decision (Feb 20, 2026) |
| **Decision** | Canvas: `#0f172a`. Card: `rgba(30,41,59, 0.72)`. Section: `rgba(30,41,59, 0.60)`. Tile: `rgba(30,41,59, 0.90)`. Dark amber: `#fbbf24`. |
| **Revisit Trigger** | User request only. |

---

## D-014: Validation Breakpoints (Locked)

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Plan §2 Locks Retained |
| **Decision** | Four breakpoints for all validation: 390x844, 768x1024, 1024x1366, 1440x900 |
| **Revisit Trigger** | New device target or HA viewport behavior change. |

---

## D-015: Surface Assembly Order

| Field | Value |
|-------|-------|
| **Status** | LOCKED |
| **Locked By** | Plan §2 Locks Retained |
| **Decision** | Living Room reference → Living Room popup → Overview → Media → Remaining rooms |
| **Gate** | No surface YAML outside rehab lab before CD11. CD12 activates only after card suite is stable. |
| **Revisit Trigger** | If a specific surface is needed urgently before the suite is stable. |

---

## D-016: Build Pipeline Architecture

| Field | Value |
|-------|-------|
| **Status** | IMPLEMENTED (CD0) |
| **Locked By** | CD0 completion (Apr 3, 2026) |
| **Decision** | esbuild-based pipeline. Source: Cards/v3/. Output: Cards/v3/dist/. Deploy: SCP to HA server. Lab: tunet-card-rehab-lab.yaml with 13 representative configs. |
| **Scripts** | `tunet:build`, `tunet:build:watch`, `tunet:deploy:lab`, `tunet:lab:screenshot` |
| **Revisit Trigger** | If esbuild becomes insufficient for new card requirements. |
