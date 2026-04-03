# Cross-Card Interaction State Vocabulary

**Version**: 1.0  
**Date**: 2026-04-02  
**Status**: Draft — awaiting user review before binding  
**Authority**: This document defines the target interaction states for all Tunet cards. It is the binding contract for hover, active, focus, disabled, and transition behavior. Compliance is enforced **tranche-by-tranche on touched cards** — untouched cards are not expected to comply until their surface tranche.

**Sources**: Synthesized from:
- Agent 3: Climate card measured CSS values + 13-card divergence matrix (`agent3_interaction_css_map.md`)
- Agent 4: Design doc reconciliation critique (`agent4_design_reconciliation_critique.md`)
- Agent 2: HA native + HACS card research (`agent2_ha_interaction_research.md`)
- tunet-design-system.md v8.3 §6 (choreography), §11 (timing)
- Climate card as measured baseline (`tunet_climate_card.js`)

---

## Design Principles

1. **Shadow lift, not ripple** — Tunet uses elevation-based hover feedback (shadow lift), not HA's ripple overlay. This aligns with the glass surface aesthetic.
2. **Press-down scale for controls, scale-up for drag** — Non-drag controls scale DOWN on press (0.95-0.97) for an iOS-native feel. Drag thumbs scale UP (1.05). **Note**: This supersedes the older tunet-design-system.md v8.3 §6 "pop feedback" definition which specified 1.08x scale-up on all interactive elements. The 1.08x pop is now reserved for drag/thumb interactions only; standard controls use press-down.
3. **Token-driven, not hardcoded** — All timing, easing, scale, and focus values reference CSS custom properties. No hardcoded values in card-local CSS.
4. **Prefer em for new geometry** — New and migrated dimensional values should use em units anchored at `:host { font-size: 16px }`. Existing base tokens (e.g., `--focus-ring-width: 2px` in tunet_base.js) remain px until explicitly migrated. This is a directional preference, not an immediate rewrite mandate.
5. **Touch-safe** — All hover states guarded by `@media (hover: hover)` to prevent sticky hover on touch devices.
6. **Accessible** — Every interactive element has `:focus-visible` styling. `prefers-contrast: more` and `prefers-reduced-motion: reduce` are handled.

---

## Token Reference

These tokens are defined in `tunet_base.js` TOKENS and available to all cards:

```css
/* Timing */
--motion-fast: 0.12s;        /* Control state changes (hover, active) */
--motion-ui: 0.18s;          /* UI element transitions (shadow, color) */
--motion-surface: 0.28s;     /* Surface-level transitions (background, opacity) */

/* Easing */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);      /* Matches MD3 standard */
--ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring/pop curve */

/* Scale */
--press-scale: 0.97;         /* Standard press-down for controls */
--press-scale-strong: 0.95;  /* Strong press-down for toggles, orbs */
--lift-scale: 1.03;          /* Subtle lift on hover (optional) */
--drag-scale: 1.05;          /* Scale-up during active drag */

/* Focus */
--focus-ring-width: 0.125em;   /* 2px at 16px anchor */
--focus-ring-color: var(--blue);
--focus-ring-offset: 0.1875em; /* 3px at 16px anchor */

/* Disabled (NEW — add to tunet_base.js) */
--disabled-opacity: 0.55;         /* Entity-off state (card still interactive) */
--disabled-surface-opacity: 0.35; /* Track/progress within disabled context */
--disabled-control-opacity: 0.38; /* Truly disabled control (not interactable, per MD3) */
```

---

## 1. Hover State

### Pattern: Shadow elevation lift

| Element Type | Rest Shadow | Hover Shadow |
|---|---|---|
| Controls (buttons, chips, menu triggers) | `var(--ctrl-sh)` | `var(--shadow)` |
| Tiles (room tiles, speaker tiles, light tiles) | `var(--shadow)` | `var(--shadow-up)` |
| List rows (sensor rows) | transparent | `background: var(--track-bg)` |
| Dropdown options | transparent | `background: var(--track-bg)` |

### Rules

```css
/* REQUIRED: Guard all hover with media query */
@media (hover: hover) {
  .control:hover {
    box-shadow: var(--shadow);
  }
  .tile:hover {
    box-shadow: var(--shadow-up);
  }
}
```

- **MUST** wrap all `:hover` rules in `@media (hover: hover)` — prevents sticky hover on touch
- **MUST** include `-webkit-tap-highlight-color: transparent` on all interactive elements
- Do NOT use `translateY` on hover (speaker_grid's -1px is non-standard — remove)
- Do NOT change background color on hover for controls/tiles (shadow only). Exception: list rows and dropdown options use `background: var(--track-bg)`

### Current compliance

| Status | Cards |
|--------|-------|
| Correct (has @media guard) | lighting (l-tile), light_tile |
| Needs guard added | climate, actions, status, rooms, media, scenes, weather, sensor, sonos, speaker_grid |
| No hover (intentional) | nav |

---

## 2. Active / Pressed State

### Pattern: Scale-down using tokens

| Element Type | Scale Token | Resolved Value |
|---|---|---|
| Standard controls (buttons, chips, options) | `var(--press-scale)` | `0.97` |
| Strong press (toggles, orbs, fan buttons) | `var(--press-scale-strong)` | `0.95` |
| Drag thumb / slider thumb | `var(--drag-scale)` | `1.05` (scale UP) |

### Rules

```css
.control:active {
  transform: scale(var(--press-scale));
}

.toggle:active,
.orb:active {
  transform: scale(var(--press-scale-strong));
}
```

- **MUST** use token references, not hardcoded values
- Do NOT use `.90`, `.94`, `.96`, `.98`, `.99` — migrate to the two standard tokens
- Transport controls (media/sonos `.90`) migrate to `var(--press-scale-strong)` (`.95`)
- Header tiles (`.98`) migrate to `var(--press-scale)` (`.97`)
- Drag thumbs scale UP (`1.05`), not down — this is the only scale-up interaction

### Current compliance

| Status | Cards |
|--------|-------|
| Uses tokens | nav, lighting (l-tile) |
| Uses correct VALUES but hardcoded | climate (.97/.98), rooms (.95/.96), scenes (.96), sensor (.97/.99) |
| Uses wrong values | media (.90), sonos (.90) |
| No :active defined | light_tile (uses JS .sliding class), sonos (speaker-tile) |

---

## 3. Focus-Visible State

### Pattern: Outline ring using tokens

```css
.interactive:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}

/* High contrast mode */
@media (prefers-contrast: more) {
  .interactive:focus-visible {
    --focus-ring-width: 0.1875em; /* 3px — thicker for visibility */
  }
}
```

### Rules

- **EVERY** interactive element must have `:focus-visible` styling — no exceptions
- Elements with `cursor: pointer` but no `tabindex` or `role` need remediation first
- Use token references, not hardcoded values
- Offset is `var(--focus-ring-offset)` = `0.1875em` (not 2px — some cards diverge here)
- Do NOT use `--accent` for focus color — use `var(--focus-ring-color)` = `var(--blue)`
- Nav card's `border-radius: 16px` on focus ring is acceptable (shaped focus for pill buttons)

### Current compliance

| Status | Cards |
|--------|-------|
| Correct (tokens) | nav, light_tile |
| Has focus-visible (hardcoded values) | climate (thumb only), actions (offset 2px), status (em units), lighting, rooms (tile only), scenes (offset 2px), sensor (row only) |
| **ZERO focus-visible** | **media, weather, sonos** — critical accessibility gap |
| Uses wrong token (--accent) | speaker_grid — --accent is undefined in base |

### Accessibility debt (fix in respective surface tranches)

- `tunet_media_card.js`: `muteBtn` is `<div>` with click handler, no `tabindex`/`role`
- `tunet_sonos_card.js`: no `tabindex` or `role="button"` on any interactive element
- `tunet_weather_card.js`: `cursor: pointer` on elements with no keyboard reachability

---

## 4. Disabled State

### Two distinct states

| State | Meaning | Visual Treatment |
|---|---|---|
| **Entity off** | Entity is off but card is still interactive | `opacity: var(--disabled-opacity)` = `0.55` |
| **Truly disabled** | Control cannot be interacted with | `opacity: var(--disabled-control-opacity)` = `0.38`; `cursor: default`; `pointer-events: none` |

**Note on .38 opacity**: tunet-design-system.md v8.3 §14 prohibits opacity below .55 on interactive elements. The .38 value is an **allowed exception** specifically for controls that are explicitly non-interactive (`pointer-events: none`). The prohibition still applies to interactive elements — entity-off (.55) is the floor for anything the user can still tap.

### Rules

```css
/* Entity off — card still interactive */
:host([data-state="off"]) .card-content {
  opacity: var(--disabled-opacity);
}
:host([data-state="off"]) .track {
  opacity: var(--disabled-surface-opacity);
}

/* Truly disabled control */
.control[disabled],
.control[aria-disabled="true"] {
  opacity: var(--disabled-control-opacity);
  cursor: default;
  pointer-events: none;
}
```

- Text in inactive/off states uses `color: var(--text-muted)`
- Climate card pattern (`data-mode="off"` → `.55`) is the entity-off reference
- MD3-aligned `.38` is for truly disabled controls (new pattern, not yet in any card)

---

## 5. Transitions

### Pattern: Explicit multi-property with named tokens

**ANTI-PATTERN** (do not use):
```css
/* BAD — animates ALL properties including layout-triggering ones */
transition: all .15s ease;
```

**CORRECT PATTERN** (scenes/nav/light_tile reference):
```css
transition:
  transform var(--motion-fast) var(--ease-emphasized),
  box-shadow var(--motion-ui) var(--ease-standard),
  background var(--motion-ui) var(--ease-standard),
  border-color var(--motion-ui) var(--ease-standard),
  color var(--motion-ui) var(--ease-standard),
  opacity var(--motion-surface) var(--ease-standard);
```

### Timing tiers (from tunet-design-system.md v8.3 §11)

| Tier | Duration | Easing | Use For |
|------|----------|--------|---------|
| Instant | `0ms` | — | Icon FILL change (optimistic UI) |
| Micro | `60-100ms` | `ease` | Slider fill during drag |
| Fast | `var(--motion-fast)` = `0.12s` | `var(--ease-standard)` or `ease-in-out` | Control state changes (hover, active, focus) |
| Standard | `var(--motion-ui)` = `0.18s` | `var(--ease-standard)` | UI element transitions (shadow, color, background) |
| Enter | `0.25s` | `var(--ease-emphasized)` | Pop scale, dropdown open |
| Exit | `0.18s` | `ease-out` | Dropdown close, menu hide |
| Surface | `var(--motion-surface)` = `0.28s` | `var(--ease-standard)` | Surface transitions (card background, opacity) |

### Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Already implemented in `tunet_base.js` REDUCED_MOTION export. Tunet is ahead of HA native and all examined HACS cards here.

### Current compliance

| Status | Cards |
|--------|-------|
| Correct (named multi-property tokens) | scenes, nav, light_tile |
| Uses `all .Xs ease` (needs migration) | climate, actions, status, lighting, rooms, media, weather, sensor |
| Uses --spring (undefined) | sonos, speaker_grid — falls back to initial |
| Missing transition entirely | actions (.action-chip shadow change is instant) |

---

## 6. Proposed Shared Primitive: INTERACTIVE_SURFACE

An **opt-in** CSS export for `tunet_base.js` that standardizes interaction states. Cards apply the `.interactive` class explicitly to elements that should share this behavior. This is NOT a blanket selector — elements that are keyboard-focusable for structural reasons (e.g., scrollable containers) should NOT receive interactive hover/shadow behavior.

```css
/* Add to tunet_base.js exports — opt-in via .interactive class */
export const INTERACTIVE_SURFACE = `
  .interactive {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-fast, 0.12s) var(--ease-emphasized, cubic-bezier(0.34, 1.56, 0.64, 1)),
      box-shadow var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      background var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      color var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  @media (hover: hover) {
    .interactive:hover {
      box-shadow: var(--shadow);
    }
  }

  .interactive:active {
    transform: scale(var(--press-scale, 0.97));
  }

  .interactive:focus-visible {
    outline: var(--focus-ring-width, 0.125em) solid var(--focus-ring-color, var(--blue));
    outline-offset: var(--focus-ring-offset, 0.1875em);
  }
`;
```

Cards apply `.interactive` explicitly to tappable elements and override only what differs:
```html
<div class="control interactive">       <!-- standard hover/active/focus -->
<div class="orb interactive">           <!-- override --press-scale locally for stronger press -->
<div class="scrollable" tabindex="0">   <!-- NOT .interactive — focusable for scroll, no hover -->
```

```css
/* Stronger press for orbs/toggles */
.orb.interactive:active { transform: scale(var(--press-scale-strong)); }

/* Shadow-up hover for tiles (larger lift) */
@media (hover: hover) {
  .tile.interactive:hover { box-shadow: var(--shadow-up); }
}
```

**Implementation**: This primitive is introduced in `tunet_base.js` during the first surface tranche that needs it (Tranche 1 — Living Room page). It does NOT require code changes in Tranche 0.

---

## 7. Suite-Wide Drift Patterns

These patterns recur across multiple cards. Surface tranches should address them on touched cards.

### 7.1 Unguarded hover (11 of 13 cards)
All cards except lighting (l-tile) and light_tile apply `:hover` without `@media (hover: hover)`. This causes sticky hover artifacts on touch devices. Every surface tranche should guard hover on the cards it touches.

### 7.2 Hardcoded press scale values (10 of 13 cards)
Eight distinct scale values exist (.90 through .99) where the vocabulary defines only two tokens. Only nav and lighting (l-tile) use the token. Surface tranches should migrate touched cards to `--press-scale` / `--press-scale-strong`.

### 7.3 Transition anti-pattern (10 of 13 cards)
Most cards use `transition: all .Xs ease` instead of explicit multi-property transitions with named tokens. Scenes, nav, and light_tile have the correct pattern and serve as references. Surface tranches should migrate touched cards.

### 7.4 Missing `-webkit-tap-highlight-color` (10 of 13 cards)
Leaves the default blue flash on mobile WebKit. The INTERACTIVE_SURFACE primitive handles this; surface tranches apply it to touched cards.

### 7.5 Undefined CSS variables
- `--spring`: used by sonos and speaker_grid for tile transitions. Not in base TOKENS. Falls back to `initial`.
- `--accent`: used by speaker_grid for focus ring color. Not in base TOKENS. Focus ring likely invisible.

### 7.6 Focus-visible inconsistency
Three variants exist: offset 3px (climate baseline), offset 2px (actions/rooms/scenes), and token-driven (nav/light_tile). Three cards have partial gaps in non-button interactive containers: media, weather, sonos. Many cards already use native `<button>` elements which inherit the global RESET focus rule — these are NOT accessibility gaps.

---

## 8. Coarse Per-Card Risk and Likely Work

This is a **reference inventory**, not a binding remediation plan. Exact changes are decided inside each surface tranche based on what that surface actually needs. Cards may be touched in multiple tranches.

| Card | Interaction Model | Risk Level | Main Drift | Reference Notes |
|------|------------------|------------|------------|-----------------|
| **climate** | buttons + slider thumbs, keyboard-wired | Low | Unguarded hover, hardcoded press values (.94/.98), `all` transitions | Gold standard for visual states; interaction wiring needs token migration |
| **actions** | native `<button>` chips | Low | Unguarded hover, hardcoded .96 press, hardcoded focus offset | Keyboard-correct; needs token alignment only |
| **status** | JS-managed tabindex/role on tiles, local interaction patterns | Medium | Unguarded hover, local interaction debt across tiles/aux/dropdown/alarm, `all` transitions | Scope-locked to G3S bugfix-only |
| **lighting** | l-tile guarded+tokenized; header/toggle are hardcoded | Low-Medium | l-tile is a reference; info-tile and toggle-btn need token migration | l-tile = reference implementation for tiles |
| **rooms** | native buttons in rows; tiles have JS keyboard semantics | Medium | Unguarded hover, .94/.95/.96 press mix, focus missing on row sub-controls, .15/.16/.18s timing mix | |
| **media** | mixed — many native buttons, but info-tile and mute are clickable divs | Medium-High | Unguarded hover, .90 press on transport/volume, non-button containers need keyboard semantics | Partial keyboard support exists |
| **scenes** | native `<button>` chips | Low | Unguarded hover, hardcoded .96 press, hardcoded focus offset | Transition pattern is the best-practice reference |
| **weather** | mixed — segment buttons are native, info-tile and forecast tiles are divs | Medium | Unguarded hover, `all` transitions, non-button containers need clarification on interactivity | Segment buttons are keyboard-correct |
| **sensor** | JS-managed tabindex on rows, interaction-gated | Low-Medium | Unguarded hover, section-action missing focus-visible, .99 press on rows | Row hover uses background fill (correct for list pattern) |
| **sonos** | mixed — many native buttons, source options are custom | Medium-High | Unguarded hover, .90 press, `--spring` undefined, source options need keyboard model | Similar debt profile to media |
| **speaker_grid** | spk-tile is major drift case | High | `--spring` undefined, hover translateY(-1px), `--accent` undefined in focus, .98 press | Clearest cleanup target in the suite |
| **nav** | native buttons, tokenized throughout | **Reference** | No hover (intentional). Token usage, focus-visible, and transitions are all correct. | Reference for token and focus patterns |
| **light_tile** | JS-driven press via .sliding, guarded hover, keyboard-wired | **Reference** | Mostly compliant. Minor: fallback focus values use semi-transparent blue. | Reference for hover guard and transition pattern |

### How to use this table

- **During surface tranche design**: look up which cards the surface touches, check their risk level and main drift
- **During implementation**: address the listed drift items for touched cards only
- **Do NOT** pre-fix cards outside the active surface tranche
- **Do NOT** treat this table as the exact change list — the surface tranche's context may justify exceptions or different priorities

For the detailed per-card CSS audit with exact line numbers and selectors, see `Dashboard/Tunet/Agent-Reviews/agent3_interaction_css_map.md`.

---

*This vocabulary defines the target interaction language. Surface tranches operationalize it on touched cards. Exact changes are decided in context, not pre-committed.*
