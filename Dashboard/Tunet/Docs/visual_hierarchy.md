# Tunet Visual Hierarchy Contract

**Version**: 1.0
**Date**: 2026-05-07
**Status**: Active — layered model for cross-card visual consistency. Contract for which primitive owns each layer of visual concern.
**Authority**: This document defines the four-layer visual model that governs cross-card consistency in the Tunet card suite. Each layer has a single owning primitive (or family of primitives). Drift is identified as "two cards solving the same layer differently."

**Companion docs**:
- `Dashboard/Tunet/Docs/cards_reference.md` — per-card config + interaction contracts
- `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` — interaction state contract (hover/active/focus/disabled)
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` — Sections grid sizing authority (CD4)
- `Dashboard/Tunet/Cards/v3/tunet_base.js` — implementation home for the primitives this doc names

---

## Why This Document Exists

The Tunet card suite has cycled through two architectural pivots on visual consistency:

1. **Profile resolver system (Mar 2026)** — 15 profiles × 40+ tokens × mathematical scaling. Superseded Apr 2 as too extreme: introduced regressions, obscured simple sizing problems behind layers of indirection (per `project_profile_superseded.md`).
2. **Per-card hand-tuning (Apr 2 reset)** — replacement was lightweight CSS variants tuned by eye, per bespoke pass. In execution, allowed each card to invent its own typography scale, with partial template adoption letting card-chrome consistency drift.

Both extremes leave the same residual symptom: **font sizes, corner radii, and shadow treatments visibly differ across cards, even though the cross-card tokens (`--r-card`, `--shadow`, etc.) are universally defined.**

The deeper problem is that "consistency" is *not one problem*. A card has at least four levels of visual concern, and each level has a different ideal solution shape. Trying to solve all of them with one tool — whether a global token system or per-card hand-tuning — produces drift because the wrong tool is used for some layers.

This document names the four layers, identifies which primitive owns each, and states where current drift exists. It is the input to adoption-audit and primitive-extension work going forward.

---

## The Four Layers

| Layer | Question | Consistency means | Owning primitive | Implementation home |
|---|---|---|---|---|
| **1. Card chrome** | Does this look like a Tunet card from across the room? | Same outer surface (radius, shadow, glass treatment, padding) | `CARD_SURFACE` + `CARD_SURFACE_GLASS_STROKE` (CSS string templates) | `tunet_base.js` |
| **2. Scaffold** | Within the card, where do things go? | Same internal scaffold (section header, grid gap, columns) | `SECTION_SURFACE`, `HEADER_PATTERN` + `sections_layout_matrix.md` grid contract | `tunet_base.js` + doc |
| **3. Tile internals** | What does an individual tile look like? | Same spatial recipe (icon size, label position, value weight, hover physics) | `TILE_SURFACE` (current); future `TilePrimitive` component (not yet built) | `tunet_base.js` |
| **4. Atoms** | What are the brand-level primitives? | Same exact value (color, motion timing, easing curve, base radius scale) | `TOKENS` (CSS custom properties) | `tunet_base.js` |

The right tool differs per layer. Tokens are *only* the right answer for layer 4. Trying to enforce layer 1, 2, or 3 via tokens is the trap the Mar 2026 profile system fell into.

---

## Layer 1 — Card Chrome

**Primitive**: `CARD_SURFACE`, `CARD_SURFACE_GLASS_STROKE` (exported CSS string templates from `tunet_base.js`).

**Owns**:
- `border-radius: var(--r-card)` (24px)
- `background: var(--glass)` + `backdrop-filter: blur(var(--blur-card))`
- `border: 1px solid var(--ctrl-border)`
- `box-shadow: var(--shadow), var(--inset)`
- Card-level transition tokens (`--motion-surface` for surface, `--motion-ui` for transform)
- The XOR-mask glass-rim `::before` pseudo-element

**Mandate**: any card whose outer container is a "card" (the standalone Tunet glass shell at view level) MUST consume `${CARD_SURFACE}${CARD_SURFACE_GLASS_STROKE}` in its style block. Divergence is allowed only with a written reason in the card's header comment, naming the role-based justification (e.g., "nav is dashboard chrome, not a content card; intentionally has no card surface").

**Current adoption** (audit baseline as of 2026-05-07):
- Verified consumers: `tunet_climate_card`, `tunet_status_card`, `tunet_lighting_card`, `tunet_actions_card`, `tunet_inbox_card`
- Section-based (uses `SECTION_SURFACE` instead): `tunet_sensor_card`, `tunet_alarm_card`
- To be audited: `tunet_speaker_grid_card`, `tunet_rooms_card`, `tunet_nav_card`, `tunet_weather_card`, `tunet_media_card`, `tunet_sonos_card`, `tunet_scenes_card`
- Tile-only (composes inside another card's scaffold, no chrome): `tunet_light_tile`

**Why mandate at this layer**: card chrome is what gives the suite its "feel" at a glance. The user perceives the dashboard as one cohesive surface or as a patchwork of differently-styled cards based almost entirely on this layer. Drift here is the most user-visible.

---

## Layer 2 — Scaffold

**Primitives**: `SECTION_SURFACE`, `HEADER_PATTERN` (from `tunet_base.js`); the Sections Grid Contract (documented in `sections_layout_matrix.md`).

**Owns**:
- Section container (`.section-container`): `border-radius: var(--r-section)`, blur, gap
- Section header (`.section-header`): flex row, title typography, gap, min-height
- Grid sizing decisions (per-card `getGridOptions()` table in `sections_layout_matrix.md`)
- Internal padding tokens (`--card-pad`, `--section-pad`, `--tile-pad`)

**Mandate**: any card with named sub-sections (status mode-grid, lighting zone-list, sensor row-list) consumes `${SECTION_SURFACE}` for the container. Any card with a section title row consumes `${HEADER_PATTERN}` for the title row. The `getGridOptions()` returns must match the `sections_layout_matrix.md` table.

**Current adoption** (audit baseline):
- Documented per-card grid contract: yes (`sections_layout_matrix.md` table covers all 13 cards)
- `SECTION_SURFACE` consumption: partial (sensor + alarm verified; rest to audit)
- `HEADER_PATTERN` consumption: not yet audited

**Why this is its own layer**: scaffold sits between chrome and tile. Its consistency is about *spatial scaffolding* — section spacing, title rows, grid gaps — which a token system handles poorly because it's not about one value but about a coordinated set of values working together.

---

## Layer 3 — Tile Internals

**Primitive (current)**: `TILE_SURFACE` (CSS string template from `tunet_base.js`).
**Primitive (planned)**: `TilePrimitive` (a JS component that owns full tile rendering; not yet built).

**Owns**:
- Tile chrome: `border-radius: var(--r-tile)`, background, ghost border, shadow physics, hover lift
- Tile interaction physics: hover guard, press scale, focus-visible ring (consumed via `INTERACTIVE_SURFACE` for opt-in cards, currently unconsumed)
- Tile typography: icon size, value font, label font, secondary font, line heights
- Tile spatial recipe: icon-to-text gap, value-label vertical relationship, indicator placement
- Recipe-aware variants: row mode vs grid mode, value-may-wrap vs single-line, compact vs expressive

**Mandate (current)**: not yet uniform. `TILE_SURFACE` is exported but only `tunet_light_tile` consumes it; status, sensor, lighting, rooms, speaker_grid each reinvent their own `.tile` styles. Typography tokens are fragmented across three different conventions:
- `--_tunet-*` per-card private vars (status, light_tile)
- `--type-*` partially-shared vars (sensor, status with fallback)
- Hardcoded pixel values (climate — see Decision Boundaries below)

**Mandate (target)**: any card that renders a tile (a small repeated unit with icon + value + label + optional indicator) consumes the tile primitive. Whether that primitive is the existing `TILE_SURFACE` template (with expanded typography responsibilities), or a new `TilePrimitive` JS component, is an open architecture decision (see "Open Decisions" below).

**Why this layer is the hardest**:
- The cross-card "tile" abstraction is genuine — status, sensor, lighting, rooms, speaker_grid all show small repeated units of icon+value+label
- But each card has *legitimate* per-card needs — status has dropdowns, light_tile has sliders, speaker_grid has grouping affordances
- A pure tokens-only solution can't enforce spatial recipes (drift returns)
- A pure components-only solution can over-constrain (the "too extreme" trap)
- The current state — mandatory tokens for atoms + opt-in templates for tile chrome + per-card typography — is what's letting drift accumulate

---

## Layer 4 — Atoms

**Primitive**: `TOKENS` (and `TOKENS_MIDNIGHT` for dark mode), exported as CSS string templates from `tunet_base.js` and applied to every card's `:host`.

**Owns**:
- Brand colors: `--text`, `--text-sub`, `--amber`, `--blue`, `--green`, `--purple`, `--red` (each with `-fill` and `-border` variants)
- Surface depth: `--shadow`, `--shadow-up`, `--inset`, `--glass`, `--glass-border`
- Brand corner-radius scale: `--r-card: 24px`, `--r-section: 32px`, `--r-tile: 16px`, `--r-pill: 999px`, `--r-track: 14px`
- Blur scale: `--blur-card: 24px`, `--blur-section: 20px`, `--blur-menu: 24px`
- Motion: `--motion-fast`, `--motion-ui`, `--motion-surface`
- Easing functions: `--ease-standard`, `--ease-emphasized`
- Slider primitives: `--track-h`, `--track-bg`, `--thumb-bg`, `--thumb-sh`, `--thumb-sh-a`

**Mandate**: every card includes `${TOKENS}` (and `${TOKENS_MIDNIGHT}` for dark mode support) in its style block. Hardcoded color values are not allowed — use the token. Hardcoded shadow values are not allowed — use `--shadow` or `--shadow-up`.

**What is NOT a token (deliberately)**:
- Tile-recipe typography sizes — these belong to the tile primitive (layer 3)
- Card-specific layout values — belong to the card
- Values that are "the same shape but different sizes per-recipe" — belong to the layer that owns the recipe, not to atoms

**Why mandate at this layer**: atoms are by definition the layer where "exact value match" IS the consistency. Anywhere a value should be exactly the same across cards (a brand blue, a motion duration, a base shadow), it lives here.

---

## Decision Boundaries

### When to add to TOKENS (layer 4)
A value belongs in TOKENS if and only if:
- It should be exactly the same across all consuming cards
- It is not part of a coordinated spatial recipe
- It would be a brand-level decision (e.g., "Tunet's base motion duration is 180ms")

If a proposed token is "the medium font-size for tile values," it's NOT a token — it's part of a tile recipe (layer 3).

### When a card legitimately diverges from a layer's mandate
Documented divergence is allowed when the card's role is fundamentally different. Current accepted divergences:
- **Climate card** uses pixel-based typography because it's a single-card surface tuned by eye, not a tile-grid family. Climate doesn't participate in the adaptive tile-size system. *This is recorded as an intentional choice, not drift.*
- **Nav card** does not use `CARD_SURFACE` because it's dashboard chrome, not a content card.
- **Weather, media, sonos** may have card-specific layout needs that justify divergence at sub-layers; document per-card.

A divergence without a written reason is drift, not intentional. The card's header comment (or `cards_reference.md` per-card entry) must record the reason.

### When to extend a layer's primitive vs. break out of it
- **Extend** when the new need is a recipe variant (e.g., "tiles need a row mode") — the primitive grows to cover the variant; consumers opt in via config.
- **Break out** when the need is fundamentally different geometry (e.g., a slider is not a tile; it gets its own primitive). Don't force the primitive to cover everything.

The "too extreme in execution" failure mode is breaking-out-too-rarely (the primitive becomes a god object) or extending-too-rigidly (escape hatches missing).

---

## Adoption Audit Reference

Step 1 of the visual-consistency arc is auditing each card against this contract. The audit lives separately (per-tranche or per-bespoke-pass) and produces a per-card "adopts X / diverges from Y / drift in Z" record. This document is the *target*; the audit measures the *gap*.

When a card's bespoke pass touches its visual surface, the pass is responsible for closing layer-1 + layer-2 gaps in the card it touches, and recording any deferred gaps. Layer-3 gaps wait on the layer-3 primitive decision (see Open Decisions).

---

## Open Decisions

These are the architectural questions this document does NOT answer, deliberately:

1. **Layer 3 primitive shape** — does tile-internal consistency want an extended `TILE_SURFACE` template (adds typography responsibilities to the existing CSS template), or a `TilePrimitive` JS component (cards compose, don't style)? This decision is deferred until layer-1 audit data is in hand and we know how much residual drift remains in layer 3.
2. **Typography token surface** — if we go the extended-template route, what is the smallest sufficient set of typography tokens? Candidates: `--font-tile-value`, `--font-tile-label`, `--font-tile-icon`, `--font-tile-meta`, with size variants. *Do not add tokens until decision 1 is locked.*
3. **Migration mechanic for layer 3** — once the primitive is decided, does each card migrate as part of its bespoke pass (status during CD11, light_tile next, etc.), or does layer 3 become its own consistency pass (a new "CDx" tranche)?
4. **Cache-bust cost mitigation** — adding to `tunet_base.js` triggers a 13-card cache-bust dance per change (the 27-touch-points problem from observation #11144). Whether layer 3 primitive lives in `tunet_base.js` or in a new `tunet_primitives.js` (loaded as a separate Lovelace resource) is an implementation question that affects iteration speed.

---

## How To Use This Document

- **Authoring a new card**: read this first. Mandate-level primitives are non-negotiable starting points.
- **Reviewing a card change**: check whether the change keeps the card aligned with each layer's mandate. Divergences require written reasons.
- **Diagnosing a "this card looks weird" issue**: identify which layer the inconsistency is at. Layer 1 issues (chrome) usually indicate template-adoption gaps. Layer 4 issues (color) usually indicate hardcoded values. Layer 3 issues (typography, spatial recipe) usually indicate the unsolved primitive question above.
- **Proposing an extension to TOKENS**: ask "is this an atom, or is it part of a recipe?" If recipe → wrong layer.
- **Proposing a new primitive**: identify which layer it belongs to. If it doesn't fit a layer cleanly, it may be redundant with an existing primitive or may indicate a new layer is needed (rare).

---

## References

- `tunet_base.js` — implementation of all current primitives (TOKENS, CARD_SURFACE, SECTION_SURFACE, TILE_SURFACE, INTERACTIVE_SURFACE, HEADER_PATTERN, etc.)
- `Dashboard/Tunet/Docs/cards_reference.md` — per-card config + interaction contracts
- `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` — interaction state contract (closely related; covers hover/active/focus/disabled atoms and physics)
- `Dashboard/Tunet/Docs/sections_layout_matrix.md` — Sections grid sizing authority
- `Dashboard/Tunet/Docs/visual_defect_ledger.md` — runtime defect record + tranche backlog
- `~/.claude/projects/-home-mac-HA-implementation-10/memory/project_profile_superseded.md` — supersession of the Mar 2026 profile system
- `~/.claude/projects/-home-mac-HA-implementation-10/memory/project_cd4_sizing_decision.md` — CD4 stabilize-don't-replace decision
