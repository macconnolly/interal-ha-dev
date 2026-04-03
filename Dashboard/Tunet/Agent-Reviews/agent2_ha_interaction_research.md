# Agent 2: HA Interaction State Research Report

Working branch: `claude/dashboard-nav-research-QnOBs`
Date: 2026-04-02
HA Version: 2026.4 (frontend component updates in progress)
Context: Research current HA best practices for custom card interaction states (hover/active/focus/disabled), CSS patterns, timing, and anti-patterns.

---

## 1. HA Native Frontend Interaction Patterns

### 1.1 ha-card (Core Card Container)

**Source**: `home-assistant/frontend` dev branch, `src/components/ha-card.ts`
**Confidence**: HIGH (direct source code)

The base `ha-card` component defines minimal interaction CSS:

```css
:host {
  transition: all 0.3s ease-out;
  border: 1px solid var(--ha-card-border-color, var(--divider-color, #e0e0e0));
  border-radius: var(--ha-card-border-radius, var(--ha-border-radius-lg));
  box-shadow: var(--ha-card-box-shadow, none);
}

:host([raised]) {
  border: none;
  box-shadow: 0px 2px 1px -1px rgba(0,0,0,0.2),
              0px 1px 1px 0px rgba(0,0,0,0.14),
              0px 1px 3px 0px rgba(0,0,0,0.12);
}
```

Key observation: `ha-card` itself defines NO hover, active, focus, or disabled states. The `all 0.3s ease-out` transition is a generic catch-all. Interactive behavior is delegated entirely to child components.

### 1.2 hui-button-card (Button Card)

**Source**: `hui-button-card.ts`
**Confidence**: HIGH (direct source code)

This is the most interaction-rich native card:

```css
/* Ripple */
--ha-ripple-color: var(--state-color);
--ha-ripple-hover-opacity: 0.04;
--ha-ripple-pressed-opacity: 0.12;

/* Focus */
ha-card:focus { outline: none; }
ha-card:focus-visible {
  --shadow-focus: 0 0 0 1px var(--state-color, var(--state-icon-color));
  border-color: var(--state-color, var(--state-icon-color));
}

/* Active/Focus icon scale */
ha-card:focus-visible ha-state-icon,
:host(:active) ha-state-icon {
  transform: scale(1.2);
}

/* Icon transition */
ha-state-icon {
  transition: transform 180ms ease-in-out;
}
```

Pattern summary:
- **Hover**: Handled by `<ha-ripple>` overlay at 0.04 opacity (extremely subtle)
- **Pressed**: `<ha-ripple>` at 0.12 opacity + icon scale(1.2)
- **Focus-visible**: 1px ring using state color + border-color shift + icon scale(1.2)
- **Transition**: 180ms ease-in-out for icon transform only
- **No transform: scale() on the card itself** -- only the icon scales

### 1.3 ha-ripple (Shared Ripple Component)

**Source**: `src/components/ha-ripple.ts`
**Confidence**: HIGH (direct source code)

Extends Material Web's `Ripple` component:

```
Hover opacity:   0.08 (default, overridable via --ha-ripple-hover-opacity)
Pressed opacity: 0.12 (default, overridable via --ha-ripple-pressed-opacity)
```

CSS custom properties exposed:
| Property | Default | Role |
|---|---|---|
| `--ha-ripple-color` | -- | Fallback for both hover and pressed |
| `--ha-ripple-hover-color` | `--ha-ripple-color` / `--secondary-text-color` | Hover state layer color |
| `--ha-ripple-pressed-color` | `--ha-ripple-color` / `--secondary-text-color` | Pressed state layer color |
| `--ha-ripple-hover-opacity` | `0.08` | Hover overlay opacity |
| `--ha-ripple-pressed-opacity` | `0.12` | Pressed overlay opacity |

The ripple manages three states internally: hovered, pressed, and touch. Touch handling includes explicit `touchend` cleanup to call `endPressAnimation()`.

### 1.4 hui-tile-card (Tile Card)

**Source**: `hui-tile-card.ts`
**Confidence**: HIGH (direct source code)

The tile card itself defines NO hover/focus/transition CSS. All interaction is delegated to `<ha-tile-container>` (which was inaccessible at time of research -- likely recently renamed or moved).

Only interaction-adjacent CSS:
```css
/* Pulse animation for alarm/lock states */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
animation: pulse 1s infinite;  /* applied to pending/arming/triggered/jammed */

/* Active state */
ha-card.active {
  --tile-color: var(--state-icon-color);
}
```

### 1.5 hui-heading-card (Heading Card)

**Source**: `hui-heading-card.ts`
**Confidence**: HIGH (direct source code)

```css
[role="button"] { cursor: pointer; }

ha-icon-next {
  transition: transform 180ms ease-in-out;
}

.content:hover ha-icon-next {
  transform: translateX(calc(4px * var(--scale-direction)));
}
```

Pattern: Hover triggers a subtle 4px directional shift on the chevron icon. No card-level transform. 180ms ease-in-out.

### 1.6 hui-area-card (Area Card)

**Source**: `hui-area-card.ts`
**Confidence**: HIGH (direct source code)

```css
.picture[role="button"] {
  pointer-events: auto;
  cursor: pointer;
}

.picture[role="button"]:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: -2px;
}

.picture .icon-container::before {
  opacity: 0.12;
  background-color: var(--tile-color);
}
```

Minimal: focus-visible only, no hover/active transforms.

### 1.7 hui-entity-card (Entity Card)

**Source**: `hui-entity-card.ts`
**Confidence**: HIGH (direct source code)

Defines NO interaction CSS (no hover, active, focus, transitions). Only structural layout and `cursor: pointer` on action elements. Fully delegates to child components.

---

## 2. HA Native Frontend Design Tokens (Interaction-Related)

**Source**: `src/resources/ha-style.ts` (styles.ts)
**Confidence**: HIGH

### 2.1 Timing Tokens
```
--ha-animation-duration-normal   (value not inline-specified, theme-dependent)
box-shadow transition:           200ms linear (inline on specific dialogs)
```

### 2.2 Color Tokens (2026.4 additions)
```css
--ha-color-form-background:          var(--ha-color-neutral-95)
--ha-color-form-background-hover:    var(--ha-color-neutral-90)
--ha-color-form-background-disabled: var(--ha-color-neutral-80)
```

These new tokens confirm HA is building a `--ha-color-*` semantic token system with explicit state variants (hover, disabled). This is part of the ongoing Web Awesome migration.

### 2.3 Spacing / Radius
```
--ha-border-radius-sm
--ha-border-radius-lg      (used by ha-card)
--ha-border-radius-square
--ha-space-2 through --ha-space-10
```

### 2.4 Key Observation

HA does NOT expose standardized interaction timing tokens (no `--ha-transition-fast`, `--ha-transition-standard`, etc.). Each component uses hardcoded values. The most common pattern across native cards is **180ms ease-in-out** for icon/element transforms.

---

## 3. HACS Card Interaction Patterns

### 3.1 Mushroom Cards

**Source**: `piitaya/lovelace-mushroom` main branch
**Confidence**: HIGH (direct source code)

Mushroom's architecture is extremely delegation-heavy. Interactive behavior lives in shared primitives:

**mushroom-shape-icon**:
```css
.shape {
  transition-property: background-color, box-shadow;
  transition-duration: 280ms;
  transition-timing-function: ease-out;
}
.shape ::slotted(*) {
  transition: color 280ms ease-in-out;
}
```

**mushroom-button**:
```css
button {
  cursor: pointer;
  background-color: var(--bg-color);
  transition: background-color 280ms ease-in-out;
  border: none;
}
button:disabled { cursor: not-allowed; }
```

**mushroom-badge-icon**:
```css
.badge {
  transition: background-color 280ms ease-in-out;
}
```

**Mushroom pattern summary**:
- **Standard duration: 280ms** across all components
- **Easing: ease-out for shape transitions, ease-in-out for color transitions**
- **NO hover or active CSS at the component level** -- all delegated to `mushroom-chip` / shared containers
- **NO transform: scale()** used anywhere in Mushroom
- **NO ripple effects** -- Mushroom does NOT use ha-ripple or any ripple equivalent
- **Disabled**: `cursor: not-allowed` + dedicated `--bg-color-disabled` / `--icon-color-disabled` tokens
- **focus-visible**: NOT explicitly defined in examined components

### 3.2 Bubble Card

**Source**: `Clooos/Bubble-Card` main branch
**Confidence**: MEDIUM (assembled from search results and partial source examination; some source files returned 404)

Based on available code and community documentation:

```css
/* Interaction timing (from community findings) */
transition: transform 0.1s ease, opacity 0.1s ease;

/* Badge active state */
.bubble-main-icon-badge:active {
  transform: scale(calc(var(--badge-scale, 1) * 0.95));
}
```

**Bubble Card pattern summary**:
- **Fast transitions: 100ms** (0.1s ease) for interactive elements
- **Uses transform: scale()** for active/pressed feedback
- **Scale factor: 0.95** (5% press-down) on active
- **Heavy reliance on CSS custom properties** for per-instance override
- **No ripple** -- pure CSS interaction states
- **cursor: ew-resize** for slider-type elements

---

## 4. Focus-Visible Best Practices

### 4.1 What the HA Native Frontend Does

Pattern across all native cards examined:

| Card | Focus-Visible Implementation |
|---|---|
| Button card | `0 0 0 1px var(--state-color)` box-shadow + border-color shift |
| Area card | `outline: 2px solid var(--primary-color); outline-offset: -2px` |
| Tile card | Delegated to ha-tile-container |
| Heading card | Not defined |
| Entity card | Not defined |

**Inconsistency**: HA's own native cards lack a unified focus-visible strategy. Some use outline, some use box-shadow, some delegate, some simply omit it.

### 4.2 WCAG Requirements (2.4.7 Focus Visible)

**Source**: WCAG specification + accessibility research
**Confidence**: HIGH

- Focus indicator must be **visible** when element receives keyboard focus
- `:focus-visible` (not `:focus`) is the correct pseudo-class -- it only activates for keyboard navigation, not mouse/touch
- Minimum **2 CSS pixels** thick indicator
- Must have **3:1 contrast ratio** against the unfocused background
- `outline` is preferred over `box-shadow` for focus indicators because:
  - `outline` respects forced-color modes (Windows High Contrast)
  - `box-shadow` is reset/hidden in forced-color modes
  - If using `box-shadow`, add a `@media (forced-colors: active)` fallback with `outline`

### 4.3 Shadow DOM Considerations

**Source**: W3C CSSWG issue #5893
**Confidence**: MEDIUM (known spec gap)

There is a known specification gap regarding `:focus-visible` behavior with Shadow DOM. The CSS spec does not explicitly define what happens on a ShadowRoot when an element inside it receives focus. In practice:

- Chrome/Edge: `:focus-visible` generally works correctly through shadow boundaries
- Firefox: May have inconsistencies
- **Best practice**: Apply `:focus-visible` on the focusable element INSIDE the shadow DOM, not on `:host`

### 4.4 Border-Radius and Outline Interaction

`outline` does NOT follow `border-radius` in all browsers. The workaround:

```css
/* Option A: outline with offset (modern browsers DO follow border-radius now) */
.element:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
  border-radius: inherit;  /* Helps in some edge cases */
}

/* Option B: box-shadow fallback for older browsers */
.element:focus-visible {
  box-shadow: 0 0 0 2px var(--focus-color);
}
/* With forced-colors fallback */
@media (forced-colors: active) {
  .element:focus-visible {
    outline: 2px solid CanvasText;
  }
}
```

As of 2025+, modern Chromium and Firefox render `outline` following `border-radius` natively. Safari caught up in Safari 16.4+. The outline approach is now safe for rounded elements.

---

## 5. Timing and Easing Reference

### 5.1 Material Design 3 State Layer Specification

**Source**: Material Design 3 documentation
**Confidence**: HIGH

| State | State Layer Opacity | Notes |
|---|---|---|
| Enabled | 0% | No overlay |
| Hovered | 8% (0.08) | ha-ripple default matches this |
| Focused | 12% (in M3 spec; HA uses 0.08-0.15 depending on component) | |
| Pressed | 12% (0.12) | ha-ripple default matches this |
| Dragged | 16% (0.16) | Not commonly implemented in HA |
| Disabled (content) | 38% opacity on the content itself | |
| Disabled (container) | 12% opacity overlay | |

Note: HA's `ha-ripple` uses 0.08 hover / 0.12 pressed by default, which aligns with MD3. The `hui-button-card` overrides these to 0.04 / 0.12, making hover even more subtle.

### 5.2 Timing Comparison: Native vs HACS vs Tunet

| Source | Fast | Standard | Enter/Pop | Exit |
|---|---|---|---|---|
| **HA Native** | 180ms ease-in-out | 200ms linear (box-shadow) | -- | -- |
| **Mushroom** | -- | 280ms ease-out / ease-in-out | -- | -- |
| **Bubble Card** | 100ms ease | -- | -- | -- |
| **Tunet spec (v8.3 SS11)** | 150ms ease/ease-in-out | 200ms ease | 250ms cubic-bezier(0.34,1.56,0.64,1) | 180ms ease-out |
| **Tunet base tokens** | `--motion-fast: 0.12s` | `--motion-ui: 0.18s` | `--motion-surface: 0.28s` | -- |

**Observation**: Tunet's token values (120ms / 180ms / 280ms) are slightly faster than the spec document values (150ms / 200ms / 280ms). The difference is small but worth noting for audit purposes.

### 5.3 Easing Comparison

| Source | Standard | Emphasized / Pop |
|---|---|---|
| **HA Native** | ease-in-out | -- |
| **Mushroom** | ease-out (shape), ease-in-out (color) | -- |
| **MD3 Spec** | Standard: cubic-bezier(0.2, 0, 0, 1) | Emphasized: cubic-bezier(0.2, 0, 0, 1) with overshoot |
| **Tunet tokens** | `--ease-standard: cubic-bezier(0.2, 0, 0, 1)` | `--ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1)` |

Tunet's `--ease-standard` matches MD3's standard easing. The `--ease-emphasized` adds overshoot (1.56 control point) for a springy pop feel that neither HA native nor Mushroom uses.

---

## 6. Tunet Current State Audit (Interaction Consistency)

### 6.1 Shared Primitives (tunet_base.js)

The base module defines four surface patterns with interaction states:

**TILE_SURFACE**:
```css
.tile { transition: background/border/box-shadow var(--motion-ui) var(--ease-standard),
                    transform var(--motion-ui) var(--ease-emphasized); }
@media (hover: hover) { .tile:hover { box-shadow: var(--shadow-up); } }
.tile:active { transform: scale(var(--press-scale)); }          /* 0.97 */
.tile:focus-visible { outline/offset from tokens; }
```

**CTRL_SURFACE**:
```css
.ctrl-btn { transition: bg/border/shadow var(--motion-fast) var(--ease-standard),
                        transform var(--motion-fast) var(--ease-emphasized); }
@media (hover: hover) { .ctrl-btn:hover { box-shadow: var(--shadow); } }
.ctrl-btn:active { transform: scale(var(--press-scale-strong)); }  /* 0.95 */
.ctrl-btn:focus-visible { outline/offset from tokens; }
```

**DROPDOWN_MENU**:
```css
.dd-option { transition: bg var(--motion-fast) var(--ease-standard),
                         transform var(--motion-fast) var(--ease-emphasized); }
@media (hover: hover) { .dd-option:hover { background: var(--track-bg); } }
.dd-option:active { transform: scale(var(--press-scale)); }       /* 0.97 */
.dd-option:focus-visible { outline/offset from tokens; }
```

**Global focus-visible** (in TOKENS):
```css
button:focus-visible,
[role="button"]:focus-visible,
[tabindex]:focus-visible,
.focus-ring:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### 6.2 Per-Card Inconsistencies Found

| Card | Hover | Active Scale | Focus-Visible | Transition | @media(hover:hover) | -webkit-tap-highlight |
|---|---|---|---|---|---|---|
| **Base: TILE_SURFACE** | shadow-up | 0.97 | tokens | token-driven | YES | -- |
| **Base: CTRL_SURFACE** | shadow | 0.95 | tokens | token-driven | YES | -- |
| **Climate** (.hdr-tile) | shadow | 0.98 | custom (thumb only) | `all .15s ease` | NO | -- |
| **Climate** (.fan-btn) | shadow | 0.94 | -- | `all .15s ease` | NO | -- |
| **Climate** (.mode-btn) | shadow | 0.97 | -- | `all .15s ease` | NO | -- |
| **Climate** (.mode-opt) | track-bg | 0.97 | -- | -- | NO | -- |
| **Climate** (.thumb) | -- | scale(1.08) | `2px solid var(--blue); 3px offset` | -- | NO | -- |
| **Status** (.tile) | shadow-lift | 0.97 | `0.125em solid var(--blue); 0.1875em offset` | `all .15s ease` | NO | -- |
| **Status** (.tile-aux) | shadow-rest | 0.97 | -- | -- | NO | -- |
| **Actions** (.action-chip) | shadow-lift | 0.96 | `2px solid var(--blue); 2px offset` | `all .15s ease` | NO | YES |
| **Rooms** (.room-tile) | shadow-up | 0.95 | `2px solid var(--blue); 2px offset` | `all 0.18s ease` | NO | YES |
| **Rooms** (.room-orb) | custom | custom | -- | `all 0.16s ease` | NO | -- |
| **Rooms** (.section-btn) | shadow | 0.96 | -- | `all 0.15s ease` | NO | -- |
| **Scenes** (.scene-chip) | shadow-lift | 0.96 | `2px solid var(--blue); 2px offset` | token-driven | NO | YES |
| **Sensor** (.sensor-row) | gray-ghost bg | 0.99 | `2px solid var(--blue); 3px offset` | `all 0.15s ease` | NO | -- |
| **Sensor** (.section-action) | custom shadow | 0.97 | -- | `all 0.15s ease` | NO | -- |
| **Media** (.t-btn) | track-bg | 0.90 | -- | `all .15s ease` | NO | -- |
| **Media** (.info-tile) | shadow | 0.98 | -- | `all .15s ease` | NO | -- |
| **Sonos** (.t-btn) | track-bg | 0.90 | -- | `all .15s ease` | NO | -- |
| **Nav** (.btn) | -- | var(--press-scale) | token-driven | token-driven | NO | -- |
| **Light Tile** (.lt) | shadow-up | -- (drag-based) | token-driven | token-driven | YES | -- |

### 6.3 Inconsistency Summary

1. **Active scale values vary**: 0.90, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.08 -- eight different values across the suite
2. **Hover guarding**: Only TILE_SURFACE, CTRL_SURFACE, DROPDOWN_MENU, and Light Tile use `@media (hover: hover)`. All other cards apply hover states unconditionally, causing sticky hover on mobile.
3. **Focus-visible**: 6 cards have card-local focus-visible implementations with varying outline colors (some use `var(--blue)`, others use tokens). Climate card has focus-visible only on the slider thumb. Several interactive elements (fan-btn, mode-opt, media controls, sonos controls, room-orb) have NO focus-visible at all.
4. **Transition syntax**: Mix of `all .15s ease`, `all 0.18s ease`, `all 0.16s ease`, and token-driven transitions. The `all` shorthand is used almost everywhere despite the spec having granular tokens.
5. **-webkit-tap-highlight-color**: Only 3 cards set `transparent`. Others leave the default blue flash on mobile WebKit.

---

## 7. Anti-Patterns Identified

### 7.1 Sticky Hover on Mobile (CRITICAL)

**Problem**: Using `:hover` without `@media (hover: hover)` guard causes hover styles to "stick" on touch devices. After tapping an element, the hover state remains visible until the user taps elsewhere.

**Affected**: Climate, Status, Actions, Rooms, Scenes, Sensor, Media, Sonos, Nav cards (9 of 13 cards).

**Fix pattern**:
```css
/* WRONG -- sticks on mobile */
.element:hover { box-shadow: var(--shadow-up); }

/* RIGHT -- only applies on hover-capable devices */
@media (hover: hover) {
  .element:hover { box-shadow: var(--shadow-up); }
}
```

**Source**: [CSS-Tricks: Solving Sticky Hover States](https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/)
**Note**: The Tunet base primitives (TILE_SURFACE, CTRL_SURFACE, DROPDOWN_MENU) already use this pattern correctly. The issue is that card-local CSS overrides bypass it.

### 7.2 `transition: all` Performance (MODERATE)

**Problem**: `transition: all .15s ease` transitions every CSS property that changes, including properties that should not animate (e.g., `z-index`, `display`, `overflow`, `pointer-events`). This can cause:
- Unintended visual artifacts (z-index changes animate opacity as a side effect in some browsers)
- Performance overhead from unnecessary property tracking
- Jank when multiple properties change simultaneously

**Affected**: Climate, Status, Actions, Rooms, Sensor, Media, Sonos cards.

**Fix pattern**: List only the properties that should animate:
```css
/* WRONG */
transition: all .15s ease;

/* RIGHT */
transition: transform var(--motion-ui) var(--ease-emphasized),
            box-shadow var(--motion-ui) var(--ease-standard),
            background var(--motion-ui) var(--ease-standard);
```

**Note**: The base primitives already use explicit property lists. Card-local CSS regresses to `all`.

### 7.3 Missing `-webkit-tap-highlight-color: transparent` (MODERATE)

**Problem**: On mobile WebKit browsers (Safari, Chrome iOS), tapping an element flashes a blue/gray highlight rectangle. This conflicts with Tunet's custom active feedback (scale transform + shadow change).

**Affected**: 10 of 13 cards do not set this property.

**Fix**: Add to all interactive containers:
```css
.interactive-element {
  -webkit-tap-highlight-color: transparent;
}
```

Or add it to the shared TILE_SURFACE / CTRL_SURFACE patterns in tunet_base.js.

### 7.4 Inconsistent Scale Values (LOW-MODERATE)

**Problem**: Eight different scale factors create an inconsistent tactile language. The user cannot develop muscle memory for what "pressed" feels like.

**Recommendation**: Consolidate to three scale tokens (already defined in tunet_base.js):
| Token | Value | Use |
|---|---|---|
| `--press-scale` | 0.97 | Standard buttons, tiles, chips |
| `--press-scale-strong` | 0.95 | Small controls, icon buttons |
| `--lift-scale` | 1.03 | Drag lift / pop feedback |
| `--drag-scale` | 1.05 | Active drag state |

The transport buttons using `0.90` are far too aggressive. The sensor row using `0.99` is imperceptible.

### 7.5 Missing `will-change` for Frequently Animated Elements (LOW)

**Problem**: Elements that frequently animate `transform` and `box-shadow` (like light tiles during drag) may benefit from compositor promotion.

**Recommendation**: Use sparingly and only on elements that animate frequently:
```css
.lt.sliding, .tile.dragging {
  will-change: transform;
}
```

Do NOT apply `will-change` globally or on resting elements -- it increases memory consumption by promoting elements to their own compositor layer.

### 7.6 No `contain` Optimization (LOW)

**Problem**: Cards with many tiles (rooms grid, lighting grid) can benefit from CSS containment to limit layout recalculation scope.

**Current**: Light tile uses `contain: layout style` on `:host`. Other cards do not.

**Recommendation**: Add `contain: layout style` to tile elements in grid contexts:
```css
.room-tile { contain: layout style; }
.zone-tile { contain: layout style; }
```

This tells the browser that layout changes inside a tile do not affect sibling tiles, enabling faster reflow.

---

## 8. Recommended Unified Interaction Contract

Based on the research above, here is a proposed standardization that aligns with HA conventions while preserving Tunet's design identity.

### 8.1 State Layer Model

| State | Visual Feedback | Implementation |
|---|---|---|
| **Rest** | Base shadow + surface | Default styles |
| **Hover** | Elevated shadow (`--shadow-up` or `--shadow`) | `@media (hover: hover) { ... }` guard REQUIRED |
| **Active/Pressed** | Scale down (`--press-scale` or `--press-scale-strong`) | `:active` pseudo-class |
| **Focus-Visible** | Outline ring | `:focus-visible` only (NOT `:focus`) |
| **Disabled** | Reduced opacity + no pointer | `opacity: 0.38; pointer-events: none; cursor: default;` |
| **Dragging** | Scale up (`--drag-scale`) + elevated shadow | `.dragging` class |

### 8.2 Recommended Token Usage

```css
/* Already defined in tunet_base.js -- USE THESE, do not hardcode */
--motion-fast: 0.12s;       /* Toggles, hovers */
--motion-ui: 0.18s;         /* Card transitions */
--motion-surface: 0.28s;    /* Surface/background changes */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1);
--press-scale: 0.97;
--press-scale-strong: 0.95;
--focus-ring-width: 2px;
--focus-ring-color: var(--blue);
--focus-ring-offset: 3px;
```

### 8.3 Recommended Shared Interactive Surface (New Primitive)

Consider adding this to tunet_base.js as a new export:

```css
/* Interactive surface mixin -- apply to any tappable element */
.interactive {
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform var(--motion-fast) var(--ease-emphasized),
    box-shadow var(--motion-ui) var(--ease-standard),
    background var(--motion-ui) var(--ease-standard),
    border-color var(--motion-ui) var(--ease-standard);
}

@media (hover: hover) {
  .interactive:hover {
    box-shadow: var(--shadow-up);
  }
}

.interactive:active {
  transform: scale(var(--press-scale));
}

.interactive:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

Cards would then apply `.interactive` alongside their semantic class and only override the specific properties that differ (e.g., smaller controls would override `--press-scale` locally).

### 8.4 Disabled State Token (Currently Missing)

Tunet base has no disabled tokens. Recommend adding:
```css
--disabled-opacity: 0.38;
--disabled-surface-opacity: 0.12;
```

These match MD3's disabled state specification.

---

## 9. Comparison with HA Native Approach

| Aspect | HA Native | Tunet Current | Recommendation |
|---|---|---|---|
| Hover feedback | Ripple overlay (0.04-0.08 opacity) | Shadow elevation change | Keep Tunet's shadow approach -- more aligned with glass design |
| Active feedback | Icon scale(1.2) upward | Whole element scale down (0.95-0.97) | Keep Tunet's press-down -- more iOS-native feel |
| Focus-visible | Inconsistent (outline/box-shadow/none) | Inconsistent (outline with varying values) | Standardize on outline with token-driven values |
| Transitions | 180ms ease-in-out (hardcoded per component) | Mix of token-driven and hardcoded | Migrate all to token-driven |
| Ripple | Yes (ha-ripple, MD3-based) | None | Do NOT add ripple -- conflicts with glass aesthetic |
| Disabled | cursor: not-allowed + opacity tokens | Not implemented | Add disabled tokens to base |
| Hover guard | Not needed (ripple handles it) | Inconsistent | Standardize @media (hover: hover) |
| Reduced motion | Not consistently implemented | Comprehensive REDUCED_MOTION export | Tunet is ahead of HA native here |

---

## 10. Key Sources

### Primary Sources (Direct Code Examination)
- [HA Frontend: ha-card.ts](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-card.ts)
- [HA Frontend: hui-button-card.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-button-card.ts)
- [HA Frontend: hui-tile-card.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-tile-card.ts)
- [HA Frontend: hui-heading-card.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-heading-card.ts)
- [HA Frontend: hui-area-card.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/cards/hui-area-card.ts)
- [HA Frontend: ha-ripple.ts](https://github.com/home-assistant/frontend/blob/dev/src/components/ha-ripple.ts)
- [Mushroom Cards: shape-icon.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/shared/shape-icon.ts)
- [Mushroom Cards: button.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/shared/button.ts)
- [Mushroom Cards: badge-icon.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/shared/badge-icon.ts)
- [Bubble Card](https://github.com/Clooos/Bubble-Card)
- Tunet Cards v3: tunet_base.js, tunet_climate_card.js, tunet_status_card.js, tunet_actions_card.js, tunet_rooms_card.js, tunet_scenes_card.js, tunet_sensor_card.js, tunet_media_card.js, tunet_sonos_card.js, tunet_nav_card.js, tunet_light_tile.js

### HA Developer Documentation
- [Frontend Component Updates 2026.4](https://developers.home-assistant.io/blog/2026/03/25/frontend-component-updates-2026.4/)
- [Custom Card Developer Docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card/)

### Standards & Specifications
- [Material Design 3: State Layers](https://m3.material.io/foundations/interaction/states/state-layers)
- [WCAG 2.4.7: Focus Visible](https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html)
- [W3C CSSWG Issue #5893: focus-visible and Shadow DOM](https://github.com/w3c/csswg-drafts/issues/5893)
- [CSS-Tricks: Solving Sticky Hover States](https://css-tricks.com/solving-sticky-hover-states-with-media-hover-hover/)

### Performance
- [Chrome DevRel: Re-rastering Composited Layers](https://developer.chrome.com/blog/re-rastering-composite)
- [web.dev: High-Performance CSS Animations](https://web.dev/articles/animations-guide)
- [MDN: will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change)

---

## 11. NEW DISCOVERIES

1. **HA is migrating to Web Awesome** (from Material Web / Polymer). The 2026.4 release introduces `--ha-color-*` semantic tokens with state variants. This confirms HA is building toward a more systematic design token approach, but it is NOT yet stable or documented for custom card consumption.

2. **HA explicitly states**: "We do not officially support or encourage custom card developers to use our built in components." APIs may change without notice. This means Tunet should NOT depend on `ha-ripple`, `ha-tile-container`, or any internal HA components -- the current approach of standalone vanilla HTMLElement + shadow DOM is correct.

3. **Mushroom uses 280ms as its universal transition duration**, which is slower than both HA native (180ms) and Tunet (120-180ms). Tunet's faster timing is more aligned with iOS native feel, which is the stated design goal.

4. **No major HACS card uses transform: scale() on the card container itself for active feedback.** Mushroom does not scale anything. HA native scales only icons (1.2x UP, not down). Bubble Card scales badges at 0.95. Tunet's whole-element press-down scale is unique and distinctive but has no precedent in the HA ecosystem -- this is a deliberate design choice, not a convention.

5. **The `prefers-contrast: more` handling in tunet_base.js** (thickening focus rings to 3px, increasing border opacity) is ahead of both HA native and all examined HACS cards. This is a genuine accessibility advantage to preserve.

---

*Report compiled from primary source examination of HA frontend dev branch, Mushroom Cards main branch, Bubble Card main branch, and Tunet v3 codebase.*
