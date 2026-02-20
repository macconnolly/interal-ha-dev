# Tunet Design System: Implementation Companion (v8.3 Sync)

This file is now the implementation companion to `Dashboard/Tunet/Mockups/design_language.md` (v8.x canonical spec).  
All token values, principles, and component rules are inherited from the canonical file.  
If any value in this document conflicts with `design_language.md`, the canonical file wins.

Version 8.3 – February 20, 2026
Platform: Home Assistant OS via Tailscale
Rendering: Chromium WebView (HA Companion + Desktop)
Typeface: DM Sans (Google Fonts)
Icon Set: Material Symbols Rounded (Google Fonts, variable font)
Target Width: 400px cards, responsive to 320px minimum

---

## 0. Migration Directives (Authoritative)

### 0.1 Card rollout decisions (final parity lock)

1. Lighting: `tunet_lighting_card.js` is canonical and retains flex superset behavior (`grid|scroll`, `rows|columns|scroll_rows`, `tile_size` including `large`, `expand_groups`).
2. Rooms: `tunet_rooms_card.js` is canonical with icon-level room toggle and orb sub-button slider expansion when brightness is supported.
3. Scenes: `tunet_scenes_card.js` remains available but is not part of default overview composition.
4. Climate: `tunet_climate_card.js` remains baseline; section surface is a variant option, not the default.
5. Status, actions, weather, media are canonicalized to single production files under `Dashboard/Tunet/Cards/`.
6. Overview top strip is fixed quick actions: All On, All Off, Bedtime, Sleep Mode.
7. OAL mode selector remains in Home Status dropdown tile.
8. Dark-mode baseline for Tunet cards uses midnight surfaces (`#0f172a` context, `#1e293b` card base, dark amber interactions around `#fbbf24`).

### 0.2 Section-container standard

Every section-container variant must use:

- `border-radius: 32px`
- `background: rgba(255,255,255,0.45)` (light) / `rgba(30,41,59,0.60)` (dark)
- `backdrop-filter: blur(20px)` with `-webkit-backdrop-filter`
- `border: 1px solid var(--ctrl-border)` (no hardcoded rgba border)
- `box-shadow: var(--shadow-section)` where light-mode baseline is `0 8px 40px rgba(0,0,0,0.10)`

### 0.3 Registration and schema safety

1. Guard all custom element defines with `customElements.get(...)`
2. Guard `window.customCards.push(...)` to avoid duplicate entries
3. Flex lighting must support both schemas:
   - Preferred: `entities` + `zones`
   - Legacy: `light_group` + `light_overrides` (auto-normalized)
4. Numeric layout config must be finite-checked before writing CSS vars

### 0.4 Interaction parity requirements

1. All interactive controls must have deterministic tap semantics (`more-info`, `navigate`, `call-service`, `url`, `none`).
2. Scene controls must be semantic buttons.
3. Non-button interactive containers require keyboard support (`tabindex`, role, Enter/Space, `:focus-visible`).
4. Pointer/touch drag controls must implement threshold + axis lock + cancel-safe cleanup.
5. Dropdown/overlay layers (for media/speaker selectors) must stack above subsequent cards.
6. Tile lift physics baseline for tile-based cards:
   - Rest: `0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08)`
   - Sliding/lifted: `0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)`
7. Off tiles remain `opacity: 1`; convey off state via ghost/muted content and hidden progress fill, not global opacity fade.

### 0.5 Ambiguous plan step clarification

“Remove last sync date” means deleting the corresponding tile/row config object from YAML, not hiding it in CSS or leaving a dead placeholder.

```yaml
# Remove this entire object from tiles/sensors arrays
- type: value
  label: Last Sync
  entity: sensor.some_last_sync
```

---

## 0.6 Legacy Archive

The remaining sections are retained for historical context. Use them only when they do not conflict with the canonical v8.x design language and the directives above.

---

## 1. The Glass Engine (Surface Physics)

Every container is a refractive glass object. We do not use "white" or "gray" -- we use semi-transparent materials that sample the dashboard background through `backdrop-filter`.

### 1.1 The Card Shell

```
Material:     rgba(255, 255, 255, 0.55)  (Light)
              rgba(44, 44, 46, 0.60)      (Dark – neutral)
              rgba(30, 41, 59, 0.65)      (Dark – blue variant)
Backdrop:     blur(24px) Gaussian, always.
Radius:       24px (standard card), 32px (section container / parent group)
Padding:      20px standard, 16px mobile (≤440px)
Width:        400px base, 100% max-width
```

**The Inset Razor Edge:** A mandatory `inset 0 0 0 0.5px` border. Light: `rgba(0,0,0, 0.06)`. Dark: `rgba(255,255,255, 0.08)`. This is the single most important detail -- it prevents edge-blur from the backdrop filter.

**The XOR Glass Stroke (The Bevel):**

```css
.card::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: var(--r-card);
  padding: 1px;
  pointer-events: none; z-index: 0;
  background: linear-gradient(160deg,
    rgba(255,255,255,0.50),
    rgba(255,255,255,0.08) 40%,
    rgba(255,255,255,0.02) 60%,
    rgba(255,255,255,0.20));
  -webkit-mask: linear-gradient(#fff 0 0) content-box,
               linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

/* Dark mode: reduce white intensity */
html.dark .card::before {
  background: linear-gradient(160deg,
    rgba(255,255,255,0.14),
    rgba(255,255,255,0.03) 40%,
    rgba(255,255,255,0.01) 60%,
    rgba(255,255,255,0.08));
}
```

The 160deg angle simulates a directional light source catching the top-left beveled edge. Every glass surface that receives the XOR stroke must use this exact gradient angle for consistency.

### 1.2 Section Containers (Parent Groups)

When multiple cards or tiles belong to a logical section (e.g., "Lighting," "Climate"), they are wrapped in a section container.

```
Background:   rgba(255, 255, 255, 0.45)  (Light)
              rgba(30, 41, 59, 0.60)      (Dark – midnight variant)
Backdrop:     blur(20px)
Radius:       32px (parent – NOT 24px)
Border:       1px solid var(--ctrl-border)
Shadow:       0 8px 40px rgba(0,0,0,0.10) (Light)
              0 8px 40px rgba(0,0,0,0.30) (Dark)
Padding:      20px, gap: 16px between children
```

All section containers on the dashboard MUST be identical in background, border, radius, and shadow regardless of what they contain. This is the "Grid of Equals" principle applied at the section level.

### 1.3 The Infill & Glow Engine

Active states are communicated through "Light Emission" (The Infill), not color swaps.

Every accent hex must generate three functional tints:

| Derivative   | Purpose                    | Formula                        |
|-------------|----------------------------|--------------------------------|
| **Base**    | Text, icons, raw color     | The hex itself (e.g., `#D4850A`) |
| **Fill**    | Inner background tint      | `rgba(base, 0.10)` (Light) / `rgba(base, 0.14)` (Dark) |
| **Glow**    | Illuminating edge border   | `rgba(base, 0.22)` (Light) / `rgba(base, 0.25)` (Dark) |

**On-State Materialization:** When an element activates, it receives ALL three: `background: Fill` + `border: 1px solid Glow` + `color: Base`. This creates the "illuminated capsule" look. Never apply just one or two.

### 1.4 Elevation & Shadow Physics (Three-Layer Materialization)

Tunet uses a deterministic two-state tile physics model for all tile interactions.

**Light Mode:**

| State       | Layers | Values |
|-------------|--------|--------|
| Rest        | 2      | `0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08)` |
| Sliding/Lifted | 2   | `0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)` |

Dark mode keeps the same tile shadow geometry for consistency with the approved mockup physics.

Tile off-state does not reduce global tile opacity. Keep `opacity: 1` and express off-state with ghost icon wraps, muted text, and hidden progress fill.

### 1.5 Page Background (The Canvas)

The page background uses a multi-stop gradient with radial white overlays for depth. It is NOT flat.

**Light Mode:**
```css
:root {
  --bg1: #d9ccbc; --bg2: #c8c0b4; --bg3: #a8a199; --bg4: #838990;
}
.page {
  background:
    radial-gradient(ellipse 1200px 800px at 15% 10%, rgba(255,255,255,0.55), transparent 55%),
    radial-gradient(ellipse 900px 700px at 80% 15%, rgba(255,255,255,0.35), transparent 60%),
    linear-gradient(140deg, var(--bg1), var(--bg2) 35%, var(--bg3) 65%, var(--bg4));
}
.page::before {
  content: ""; position: fixed; inset: -60px;
  background: linear-gradient(160deg, var(--bg1), var(--bg3), var(--bg4));
  filter: blur(28px) saturate(1.05); z-index: -2;
}
```

**Dark Mode (Blue – primary):**
```css
html.dark {
  --bg1: #1c3038; --bg2: #1e2640; --bg3: #242244; --bg4: #1a1a30;
}
html.dark .page {
  background:
    radial-gradient(ellipse 1200px 800px at 15% 10%, rgba(255,255,255,0.02), transparent 55%),
    linear-gradient(140deg, var(--bg1), var(--bg2) 35%, var(--bg3) 65%, var(--bg4));
}
```

The blue dark mode uses deep navy/indigo tones (#1c3038 → #1e2640 → #242244 → #1a1a30). The radial overlays are nearly invisible in dark mode (0.02 opacity) to maintain depth without washing out.

---

## 2. Geometry & Spacing (Concentricity)

### 2.1 The 24px Spine

Every title, header icon, and the first item in any grid must align to a strict 24px left margin from the card edge. This creates a "Native" vertical axis for the eye -- the same alignment Apple uses in iOS settings.

### 2.2 Hierarchical Rounding

Inner corner radii = outer corner radii − gap between parent and child. Never arbitrary radii.

| Parent               | Parent radius | Gap   | Child              | Child radius |
|----------------------|---------------|-------|--------------------|--------------|
| Section container    | 32px          | 20px  | Card               | 24px         |
| Card (24px)          | 24px          | 20px  | Track / slider     | 14px         |
| Card (24px)          | 24px          | ~12px | Internal tile/orb  | 12px         |
| Dropdown (16px)      | 16px          | 5px   | Menu option        | 11px         |
| Floating element     | n/a           | n/a   | Header controls    | 10px (squircle) |

At ≤440px, `--r-track` drops to 12px. All other radii remain constant.

### 2.3 Spacing Constants

```
Card padding:          20px (desktop) / 16px (mobile ≤440px)
Card gap:              20px between cards in layout grid
Section padding:       20px
Section child gap:     16px
Header-to-body:        16px margin-bottom on header rows
Tile grid gap:         10px
Control gap:           8px between header controls
Icon-to-text:          8px (header), 6px (compact)
```

---

## 3. Typography & Numeric Physics

### 3.1 Hierarchy

Only three weights. Never use 400 for interactive elements.

| Weight | Usage                                            |
|--------|--------------------------------------------------|
| **700**| Hero numbers, primary titles, active states      |
| **600**| Labels, subtitles, buttons, status text          |
| **500**| Tertiary detail, percentages, supporting values  |

### 3.2 Spacing Physics

| Size Range  | Letter-spacing | Reason                           |
|-------------|----------------|----------------------------------|
| ≥42px       | -1.5px         | Tighten large hero numerals      |
| 13-15px     | 0px            | Natural at body size             |
| ≤12px       | +0.4px         | Open up small text for legibility|

### 3.3 Numeric Rendering

**Tabular Nums:** Mandatory `font-variant-numeric: tabular-nums` for ALL dynamic data (temperatures, percentages, time, counts). This prevents text "dancing" during live updates.

**The Degree Pattern:**
```css
.deg { font-size: 0.6em; position: relative; top: -0.18em; margin-left: -1px; }
```

### 3.4 Antialiasing

Always applied on body:
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

---

## 4. Token System

Every color, shadow, radius, and spacing value is a CSS custom property.

### 4.1 Light Mode Tokens

```css
:root {
  /* Page Background */
  --bg1: #d9ccbc; --bg2: #c8c0b4; --bg3: #a8a199; --bg4: #838990;

  /* Glass Surfaces */
  --glass: rgba(255,255,255, 0.55);
  --glass-border: rgba(255,255,255, 0.45);
  --parent-bg: rgba(255,255,255, 0.35);

  /* Shadows (three-layer materialization) */
  --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
  --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
  --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
  --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

  /* Text */
  --text: #1C1C1E;
  --text-sub: rgba(28,28,30, 0.55);
  --text-muted: #8E8E93;

  /* Accent: Amber (heat, lighting, warmth) */
  --amber: #D4850A;
  --amber-fill: rgba(212,133,10, 0.10);
  --amber-border: rgba(212,133,10, 0.22);

  /* Accent: Blue (cool, connectivity, security armed) */
  --blue: #007AFF;
  --blue-fill: rgba(0,122,255, 0.09);
  --blue-border: rgba(0,122,255, 0.18);

  /* Accent: Green (playing, online, success) */
  --green: #34C759;
  --green-fill: rgba(52,199,89, 0.12);
  --green-border: rgba(52,199,89, 0.15);

  /* Accent: Purple (automation, scenes, AI) */
  --purple: #AF52DE;
  --purple-fill: rgba(175,82,222, 0.10);
  --purple-border: rgba(175,82,222, 0.18);

  /* Accent: Red (alert, breach, security alarm) */
  --red: #FF3B30;
  --red-fill: rgba(255,59,48, 0.10);
  --red-border: rgba(255,59,48, 0.22);

  /* Tracks & Sliders */
  --track-bg: rgba(28,28,30, 0.055);
  --track-h: 44px;
  --thumb-bg: #fff;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

  /* Radii */
  --r-section: 32px;
  --r-card: 24px;
  --r-tile: 16px;
  --r-pill: 999px;
  --r-track: 14px;

  /* Controls */
  --ctrl-bg: rgba(255,255,255, 0.52);
  --ctrl-border: rgba(0,0,0, 0.05);
  --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);

  /* Chips */
  --chip-bg: rgba(255,255,255, 0.48);
  --chip-border: rgba(0,0,0, 0.05);
  --chip-sh: 0 1px 3px rgba(0,0,0,0.04);

  /* Dropdown Menu */
  --dd-bg: rgba(255,255,255, 0.84);
  --dd-border: rgba(255,255,255, 0.60);
  --divider: rgba(28,28,30, 0.07);

  /* Toggles */
  --toggle-off: rgba(28,28,30, 0.10);
  --toggle-on: rgba(52,199,89, 0.28);
  --toggle-knob: rgba(255,255,255, 0.96);

  /* Tile Surfaces */
  --tile-bg: rgba(255,255,255, 0.92);
  --tile-bg-off: rgba(28,28,30, 0.04);

  /* Ghost (OFF icon containers) */
  --gray-ghost: rgba(0, 0, 0, 0.035);
}
```

### 4.2 Dark Mode Tokens (Blue Variant – Primary)

```css
html.dark {
  --bg1: #1c3038; --bg2: #1e2640; --bg3: #242244; --bg4: #1a1a30;

  --glass: rgba(30, 41, 59, 0.65);
  --glass-border: rgba(255,255,255, 0.08);
  --parent-bg: rgba(30, 41, 59, 0.45);

  --shadow: 0 1px 2px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.12);
  --shadow-up: 0 1px 3px rgba(0,0,0,0.30), 0 12px 40px rgba(0,0,0,0.35);
  --shadow-section: 0 8px 40px rgba(0,0,0,0.30);
  --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.08);

  --text: #F5F5F7;
  --text-sub: rgba(245,245,247, 0.50);
  --text-muted: rgba(245,245,247, 0.35);

  --amber: #E8961E;
  --amber-fill: rgba(232,150,30, 0.14);
  --amber-border: rgba(232,150,30, 0.25);

  --blue: #0A84FF;
  --blue-fill: rgba(10,132,255, 0.13);
  --blue-border: rgba(10,132,255, 0.22);

  --green: #30D158;
  --green-fill: rgba(48,209,88, 0.14);
  --green-border: rgba(48,209,88, 0.18);

  --purple: #BF5AF2;
  --purple-fill: rgba(191,90,242, 0.14);
  --purple-border: rgba(191,90,242, 0.22);

  --red: #FF453A;
  --red-fill: rgba(255,69,58, 0.14);
  --red-border: rgba(255,69,58, 0.25);

  --track-bg: rgba(255,255,255, 0.06);
  --thumb-bg: #F5F5F7;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);

  --ctrl-bg: rgba(255,255,255, 0.08);
  --ctrl-border: rgba(255,255,255, 0.08);
  --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);

  --chip-bg: rgba(58,58,60, 0.50);
  --chip-border: rgba(255,255,255, 0.06);
  --chip-sh: 0 1px 3px rgba(0,0,0,0.18);

  --dd-bg: rgba(58,58,60, 0.88);
  --dd-border: rgba(255,255,255, 0.08);
  --divider: rgba(255,255,255, 0.06);

  --toggle-off: rgba(255,255,255, 0.10);
  --toggle-on: rgba(48,209,88, 0.30);
  --toggle-knob: rgba(255,255,255, 0.92);

  --tile-bg: rgba(44,44,46, 0.90);
  --tile-bg-off: rgba(255,255,255, 0.04);

  --gray-ghost: rgba(255, 255, 255, 0.04);

  /* Border ghost for off-state card definition */
  --border-ghost: rgba(255, 255, 255, 0.05);
}
```

---

## 5. Foundational Principles

### 5.1 The Container Is Neutral

The card surface never encodes entity state. No colored shadows, no tinted backgrounds driven by entity data, no glowing edges. Content inside the card communicates state through text color, icon fill, and accent tints on inner elements.

One exception: the card's 1px structural border may shift to a barely visible accent tint (≤0.16 opacity) when the entity is actively doing something. This is the maximum container-level state signal.

### 5.2 Grid of Equals

Every card at the same nesting level gets identical elevation, shadow, border, and container treatment regardless of entity state. Every section container on the dashboard is visually identical. Every tile in a grid, every control in a header row -- same treatment.

### 5.3 Outlined Off, Filled On

Icons render outlined (FILL 0) when off/idle, filled (FILL 1) when on/active. Uses the Material Symbols variable font FILL axis. Exception: data-display icons (humidity, temperature, sensor values) are always filled.

### 5.4 Action-Driven Accents

Mode ≠ action. A thermostat set to `heat_cool` mode may be actively heating, cooling, or idle. The accent color reflects what the system is doing RIGHT NOW, not what it is configured to do. One accent per card at any given moment.

### 5.5 Unified Idle Surfaces

All header controls share identical surface tokens when idle: `--ctrl-bg`, `--ctrl-border`, `--ctrl-sh`. When an element activates, it materializes with the accent fill and border.

---

## 6. Interaction Choreography (iOS Native Feel)

### 6.1 The 0.25s Hold Rule

Value adjustments (dimming, volume) are locked behind a 250ms hold. This allows the user to swipe/scroll through a grid of lights without accidentally changing values. After 250ms, the control "unlocks" with feedback.

### 6.2 The Pop Feedback

Upon the 250ms unlock:
1. Fire `12ms` haptic vibration
2. Scale element to `1.08x`
3. Shift to `--shadow-up` (high elevation)

### 6.3 Optimistic UI

Icon `FILL` axis transitions from `0` to `1` instantly upon tap, regardless of server response time. The visual state change must feel immediate -- network confirmation happens in the background.

### 6.4 Global Pill Stacking

Percentage/value pills (floating brightness labels during drag) MUST render in a `position: fixed` overlay layer. Never clip value pills within the card boundary.

### 6.5 Drag Behavior

```
Drag threshold:    4px (distinguish tap from drag)
Active scaling:    1.08x with --thumb-sh-a shadow
Body cursor:       grabbing (during drag)
Transitions:       Disabled during drag for direct manipulation feel
Arrow keys:        ±1 unit, Shift+Arrow: ±5 units
Service debounce:  1.5s cooldown guard
```

### 6.6 Touch Targets

```
Buttons/controls:  ≥42px (min touch target)
Sliders:           ≥44px (full-width tracks)
Toggle switches:   44×22px
All interactive:   aria-label required
Focus outline:     2px offset, accent color
```

---

## 7. Component Catalog

### 7.1 Home Status Grid

A 4-column grid of at-a-glance data tiles.

```
Grid:         repeat(4, 1fr), 10px gap
Tile bg:      var(--tile-bg)
Tile radius:  var(--r-tile) – 16px
Tile shadow:  var(--shadow)
Tile padding: 14px 8px 10px
```

**Tile anatomy (top to bottom):** Accent icon (28px, filled, centered) → Value (18px/700, tabular-nums) → Label (9px/600, uppercase, +0.5px spacing, muted)

Active dots: 6px circle, `position: absolute; top: 10px; right: 10px`. Green = active, Amber = manual override.

### 7.2 Lighting Card

Header row + 3-column zone tile grid.

**Header anatomy:** Adaptive lighting pill (toggle) + spacer + 34px icon container

**Zone tile anatomy:**
```
Radius:       var(--r-tile)
Shadow:       var(--shadow)
Border:       1px solid transparent (OFF) / var(--amber-border) (ON)
Background:   var(--tile-bg-off) (OFF) / var(--tile-bg) (ON)
```

Content stack: 44px icon orb (10px radius) → Name (13px/600) → Value (12px/600, tabular-nums) → Bottom brightness bar (4px height, full-width, no radius)

OFF icon orb: `background: var(--track-bg)`, muted color
ON icon orb: `background: var(--amber-fill)`, `border: 1px solid var(--amber-border)`, amber color, FILL 1

Drag-to-dim: horizontal drag on tile changes brightness. Tile gets `.sliding` class during drag.

**Sliding State (The Floating Pill):**
```
Transform:    scale(1.05)
Shadow:       var(--shadow-up)
Z-index:      100
Border:       var(--amber) solid
```

The `.zone-val` element transforms into a **floating pill** above the tile:
```
Position:     absolute, top: 0, left: 50%, translate(-50%, -50%)
Color:        var(--amber), 700 weight, 15px
Background:   var(--glass) with blur(20px)
Padding:      6px 20px
Radius:       999px
Shadow:       0 10px 30px rgba(0,0,0,0.3)
Border:       1px solid rgba(255,255,255,0.15)
```
This floating pill is one of the signature interactions -- it MUST be preserved. The brightness bar also thickens to 6px during sliding.

### 7.3 Climate Card

The gold standard implementation. References the production `tunet_climate_card.js`.

**Header:** Info tile (42px/10px/tappable) with entity icon (24px/6px) + title (13px/700) + subtitle (10.5px/600) showing humidity + HVAC action. Mode selector dropdown on right.

**Hero readout:** 48px/700 temperature, degree symbol shifted `top: -0.18em`.

**Dual-range slider:**
```
Track:        height 44px, border-radius var(--r-track) = 14px
              background: var(--track-bg)
              At ≤440px: --r-track drops to 12px
Heat fill:    rgba(212,133,10, 0.28) – amber
Cool fill:    rgba(0,122,255, 0.26) – blue
```

**Three-part thumb:**
```
Stroke:       2px accent-colored line, full track height
Disc:         26px white circle, var(--thumb-sh)
Dot:          8px accent center dot
Active:       disc scales 1.08x, shadow upgrades to --thumb-sh-a
```

**Current marker:** Triangular indicator on track showing current indoor temperature position.

**HVAC action colors (action-driven, not mode-driven):**
```
Heating:  --amber (border tint on card ≤0.16 opacity)
Cooling:  --blue
Idle:     No accent, neutral state
```

### 7.4 Media Card (Sonos / System View)

Media cards are "System Management" hubs, not just players.

**The Split Header:**
- Left: `Info Tile` (accent-filled when playing, identifies system)
- Right: `Speaker Dropdown` (glass-styled button, identifies zone/location)

**Content Layout:** Album art (56px/10px radius, with fallback music_note icon) + metadata stack (track name 15px/700, artist 13px/600, progress bar) + transport controls (skip/pause/skip + volume)

**Transport:**
```
Skip buttons:   38px × 38px, 10px radius, transparent bg
Play/Pause:     42px × 42px, 10px radius, ctrl surface
                Playing: green-fill + green-border + green color
Volume button:  38px × 38px, triggers volume row swap
```

**Volume Row:** Swaps in place of media row. Contains: mute icon (38px) + 44px slider track (green fill, three-part thumb) + percentage label + close button.

**Speaker Dropdown (CRITICAL – Group/Ungroup):**

```
Menu surface:     var(--dd-bg), blur(24px), 16px radius, 5px padding
Animation:        translateY(-4px) + scale(0.97) → origin, 140ms
Option row:       9px 12px padding, 11px radius
                  [speaker icon 18px] [name + now-playing stack] [group checkbox]
Selected:         font-weight 700, green color, green-fill bg
```

**Group Checkbox (The Checkmark):**
```
Size:            20px circle, 999px radius
Unchecked:       1.5px border var(--text-muted), empty
Checked:         background var(--green), border var(--green), white check icon
Icon:            14px "check" glyph, FILL 1, wght 500
Hover:           border-color shifts to var(--green)
```

**Dropdown Actions (below divider):**
- "Group All" with `link` icon (green accent)
- "Ungroup All" with `link_off` icon (green accent)

**State opacity:** Playing = 1.0, Paused = 0.85, Idle = 0.65

### 7.5 Room Overview Capsules

Full-width vertical list of room cards showing per-room lighting group info.

```
Layout:         flex column list, 10px gap (NOT a 2-column grid)
Min-height:     72px
Radius:         var(--r-card) - 24px
Background:     var(--glass) with blur(24px)
Shadow:         var(--shadow), var(--inset)
XOR Stroke:     Yes (same as card shell)
```

**Card anatomy (flex row):** `[room icon 44px] [info stack] [adaptive bulb 36px] [toggle 44x24px] [chevron]`

**Room icon:** 44px orb, 12px radius. Active: amber-fill bg + amber border + FILL 1. Inactive: gray-ghost bg + muted color.

**Info stack:**
- Room name: 14px/700
- Status line: 11.5px/600, muted, with format:
  - All on: `<amber>On</amber> · brightness% · temp°F`
  - Partial: `<amber>X of Y on</amber> · brightness% · temp°F`
  - All off: `All off`

**Adaptive lighting icon:** 36px/10px radius button. ON: amber-fill bg + amber border + FILL 1. OFF: transparent + muted. Toggles adaptive lighting mode independently of room power.

**Toggle:** 44×24px track, 20px knob. OFF: `var(--toggle-off)`. ON: `var(--toggle-on)`. Controls room power (all lights on/off).

**Chevron:** Navigation arrow, `chevron_right` icon, muted, tappable.

**Data attributes:** Each room card carries `data-lights`, `data-total`, `data-brt`, `data-temp` for dynamic status updates.

### 7.6 Weather Card

Structured identically to the Climate card to maintain visual consistency.

**Header:** Info tile (blue-fill when active) with cloud icon + "Weather" title + "Updated X min ago" subtitle. Location dropdown on right.

**Main readout:** 42px/700 current temperature + description (13px/600) alongside weather details column (wind, humidity, UV index at 12px/600).

**5-day forecast row:**
```
Grid:         repeat(5, 1fr), 8px gap
Tile bg:      var(--ctrl-bg)
Tile border:  var(--ctrl-border)
Tile radius:  12px
Today tile:   var(--blue-fill) bg + var(--blue-border) with blue accent text
```
Each tile: Day label (10px/700 uppercase) + weather icon (20px) + hi temp (13px/700) + lo temp (11px/600 muted).

At mobile (≤440px): forecast collapses to `repeat(3, 1fr)`.

### 7.6 Security & Perimeter Card

```
Armed (Blue):     Uses --blue tokens. Represents "Secured."
Alert (Red):      Uses --red (#FF3B30). Represents "Breach."
Shadow override:  Alert triggers Red Glow layer with -8px spread (tighter than standard -12px) to grab attention.
```

---

## 8. Controls

### 8.1 Dropdown Menu

```
Position:       absolute, top: calc(100% + 6px)
Min-width:      220px
Padding:        5px
Radius:         var(--r-tile) – 16px
Background:     var(--dd-bg) + blur(24px)
Border:         1px solid var(--dd-border)
Shadow:         var(--shadow-up) (elevated)
Z-index:        10
Animation:      translateY(-4px) scale(0.97) → origin, 140ms ease
```

Menu option: `padding: 9px 12px; border-radius: 11px; font: 13px/600`
Active option: `font-weight: 700` + accent fill/color
Hover: `background: var(--track-bg)`
Divider: `1px solid var(--divider); margin: 3px 8px`
Close: click outside

### 8.2 Slider (Horizontal Track)

```
Track:          height 44px, border-radius var(--r-track) = 14px
Background:     var(--track-bg)
Fill:           flat rgba tint at ~0.26-0.28 opacity, never gradients
Responsive:     at ≤440px, --r-track drops to 12px
```

**Three-part thumb:**
```
Stroke:         2px accent line, full track height, positioned at thumb center
Disc:           26px white circle, --thumb-sh shadow
Dot:            8px accent center dot, inset shadow 0.5px
Active:         disc scales 1.08x, shadow → --thumb-sh-a, disable transition
```

Drag: 4px threshold, body cursor grabbing. Arrow keys: ±1 unit, Shift+Arrow: ±5.

### 8.3 Toggle Switch

```
Track: 44×22px, border-radius: 11px
  Off: var(--toggle-off)
  On: var(--toggle-on)
Knob: 18px circle, var(--toggle-knob), two-layer shadow
  Transform: translateX(0) off, translateX(22px) on
Transition: 150ms ease
```

### 8.4 Progress Bars (The "Infill" Track)

```
Height:         4px (lighting brightness) / 3px (media progress) / 44px (full slider)
Background:     var(--track-bg)
Fill:           solid accent at 0.95 opacity (4px bars), rgba tint 0.26-0.50 (44px sliders)
Radius:         999px (thin bars), var(--r-track) (sliders)
No gradients on progress fills.
```

---

## 9. Icon System

### 9.1 Material Symbols Configuration

```css
font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
```

FILL toggles: `0` = off/idle, `1` = on/active/data.

### 9.2 Size Classes

| Class     | Size  | Usage                              |
|-----------|-------|------------------------------------|
| icon-28   | 28px  | Hero / status tile icons           |
| icon-24   | 24px  | Card entity icons, album art fallback |
| icon-20   | 20px  | Transport controls, volume         |
| icon-18   | 18px  | Header icons, dropdown options, chips |
| icon-16   | 16px  | Theme toggle, speaker selector     |
| icon-14   | 14px  | Chevrons, checkmarks, small UI     |

### 9.3 Icon Containers (The "Orb")

```
Standard:     44px × 44px, 12px radius
Room Summary: 38px × 38px, 12px radius
Centering:    display: grid; place-items: center;
OFF state:    background: var(--gray-ghost), color: var(--text-sub)
ON state:     background: var(--accent-fill), border: 1px solid var(--accent-border), color: var(--accent)
```

Never apply shadows to icon containers. The container background handles the visual weight.

### 9.4 Verified Material Symbols Glossary

| Domain    | Master Glyph       | Action Orbs                              |
|-----------|--------------------|-----------------------------------------|
| Living    | `weekend`          | `floor_lamp`, `lightbulb`               |
| Kitchen   | `refrigerator`     | `countertops`, `kitchen`                |
| Bedroom   | `bedroom_parent`   | `nightlight`, `table_lamp`              |
| Media     | `speaker_group`    | `skip_previous`, `pause`, `skip_next`   |
| Security  | `shield_with_house`| `lock`, `videocam`, `door_front`        |
| Climate   | `thermostat`       | `ac_unit`, `local_fire_department`      |
| Bathroom  | `bathroom`         | `water_drop`, `humidity_percentage`     |

---

## 10. State System

### 10.1 Progressive Opacity Dimming

| State   | Opacity | Shadow        | Border accent |
|---------|---------|---------------|---------------|
| OFF     | 0.55    | --shadow      | none          |
| Idle    | 0.65    | --shadow      | none          |
| Paused  | 0.85    | --shadow      | faint accent  |
| Active  | 1.0     | --shadow + glow| accent ≤0.16 |

### 10.2 HVAC Action Mapping

```
idle       → no accent, neutral state
heating    → --amber, border tint rgba(amber, 0.14)
cooling    → --blue, border tint rgba(blue, 0.14)
drying     → --amber (same as heating visual)
fan        → --blue (same as cooling visual)
```

The subtitle text shows the HVAC action with the accent color applied inline.

---

## 11. Animation & Timing

| Tier      | Duration | Easing              | Usage                      |
|-----------|----------|---------------------|----------------------------|
| Instant   | 0ms      | --                  | Icon FILL change           |
| Micro     | 60-100ms | ease                | Slider fill during drag    |
| Fast      | 150ms    | ease / ease-in-out  | Toggle, hover states       |
| Standard  | 200ms    | ease                | Card transitions, opacity  |
| Enter     | 250ms    | cubic-bezier(0.34,1.56,0.64,1) | Pop scale, dropdown open |
| Exit      | 180ms    | ease-out            | Dropdown close, menu hide  |

Reduced motion: `@media(prefers-reduced-motion:reduce)` kills all animation/transition to 0.01ms.

---

## 12. Dark Mode Implementation

### 12.1 Blue Dark Mode (Primary)

The primary dark mode uses deep navy/indigo gradient backgrounds. All glass surfaces shift to semi-transparent dark blue-gray. Accent colors shift to slightly brighter variants for contrast.

### 12.2 Theme Switching

Theme toggle UI: pill-shaped glass container with Light / Dark buttons. Active button gets `background: rgba(255,255,255,0.45)` (light) / `rgba(255,255,255,0.10)` (dark) + `box-shadow: 0 1px 6px rgba(0,0,0,0.06)`.

Toggle sets `html.dark` class + `color-scheme: dark` on the root element.

---

## 13. HA Integration Notes

### 13.1 Shadow DOM Custom Elements

Production cards extend `HTMLElement` with `attachShadow({mode: 'open'})`. All CSS is scoped inside shadow root. Theme detection via HA `hass.themes.darkMode` propagated as a class on `:host`.

### 13.2 Editor Support

`static getConfigForm()` provides schema for HA 2026.2+ GUI editor. Config includes `entity`, `name`, and feature-specific options.

### 13.3 Layout Card Integration

Dashboard-level responsiveness should prefer native Lovelace composition (`grid`, `horizontal-stack`, `vertical-stack`) before custom layout plugins.

```css
.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 520px) {
  .layout-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .layout-grid { grid-template-columns: repeat(3, 1fr); }
}
```

Full-width elements (room overview stack) use `grid-column: 1 / -1`.

---

## 14. Prohibitions

1. No colored shadows (ever)
2. No single-layer shadows on cards
3. No `border-radius` values not derivable from concentricity table
4. No font sizes outside the established type scale
5. No `font-weight: 400` on interactive elements
6. No gradients on slider fills or progress bars
7. No entity-state-driven card backgrounds (only inner elements show state)
8. No opacity < 0.55 on any interactive element
9. No `z-index` values > 100 except debug overlays
10. No hardcoded colors -- all values via CSS custom properties
11. No `!important` except in reduced-motion media query
12. No shadows on icon containers
13. No flat page backgrounds -- always use multi-stop gradient with radial overlays

---

## 15. Preflight Checklist

Before shipping any card or dashboard view, verify every item:

**Glass:** Card uses `--glass` bg + `blur(24px)` + XOR stroke `::before` + inset razor edge. Section containers use `--parent-bg` with `--r-section`.

**Shadows:** Three-layer materialization on active states (contact + ambient + glow with -12px spread). Resting uses two-layer. Dark mode 3× opacity. No colored shadows.

**Header:** Info tile 42px/10px/tappable, entity icon 24px/6px, title 13px/700, subtitle 10.5px/600 ellipsis, all controls share idle tokens.

**Icons:** Outlined off / filled on, data icons always filled, Material Symbols Rounded ligatures only, correct size class per §9.2 table.

**Typography:** Max two sizes per zone, weight hierarchy 700/600/500, negative spacing on large text, positive spacing on small text, tabular-nums on dynamic numbers, DM Sans with antialiasing.

**Concentricity:** Section 32px → card 24px → track 14px → tile 12px → button 10px. Menu option 11px within 16px dropdown.

**Tokens:** All colors from system, slider fills raw rgba, both light/dark defined, single accent per card when possible.

**Interaction:** Touch targets ≥42px (buttons) / ≥44px (sliders), aria-label everywhere, reduced motion kills animation, 0.25s hold on value controls, pop feedback on activation.

**Containers:** All section containers identical. All card shells identical. Background gradient with radial overlays. Blue dark mode uses navy/indigo tones.

**Sonos:** Speaker dropdown includes per-speaker group checkmarks (20px circles), Group All / Ungroup All actions below divider, now-playing subtitle per speaker.

**Room Cards:** 44px icon container, 14px/700 room name, 11px status line, orb-first quick controls, chevron/nav semantics, accent when lights on, 88px height, 2-column grid desktop / 1-column mobile.

---

## 16. Dashboard Finalization Contract (2026-02)

This section defines the implementation contract used to complete the Tunet Overview dashboard.

### 16.1 Architecture Rules

- One production file per custom card type.
- Archived alts are reference-only and must not be loaded in Lovelace.
- Every card registration must be idempotent via `customElements.get(...)` guard.

### 16.2 Canonical Overview Layout

The Overview is composed in this order:

1. Top quick-actions strip (`custom:tunet-actions-card`: All On, All Off, Bedtime, Sleep Mode)
2. Home Status (4x2)
3. Lighting Hero (top 5 zones)
4. Environment row (`custom:tunet-climate-card` + `custom:tunet-weather-card`)
5. Media (`custom:tunet-media-card`)
6. Rooms (`custom:tunet-rooms-card`)

### 16.3 Card Ownership

- Lighting: `tunet_lighting_card.js` is canonical.
- Rooms: `tunet_rooms_card.js` is canonical (no room-level toggle switch).
- Status: `tunet_status_card.js` owns typed tiles and tap actions.
- Actions: `tunet_actions_card.js` owns mode-strip interactions.
- Weather: `tunet_weather_card.js` owns current + forecast behavior.
- Media: `tunet_media_card.js` owns playback and speaker/group flows.
- Scenes: `tunet_scenes_card.js` is retained for non-overview scene-focused views.

### 16.4 Conditional and Action Semantics

- Dashboard-level conditional wrappers and explicit tile `show_when` rules are the primary visibility mechanism.
- Tiles may define `tap_action` for deterministic behavior (`more-info`, `navigate`, `call-service`, `url`, `none`).
- Media tile behavior should open popup via `call-service` when browser_mod is present.

### 16.5 Token and Icon Governance

- Dark amber token standard is `#E8961E`.
- Invalid icon ligatures must normalize to safe values before render.
- Any unrecognized icon must fall back to `lightbulb`.

### 16.6 Deployment Hygiene

- Remove duplicate legacy resource URLs before rollout.
- Version-bump all `/local/tunet/*.js` resources in one atomic update.
- Validate with hard refresh and console-clean requirement.

### 16.7 Lighting Schema and Sizing Guarantees

- Lighting card must accept both schemas:
  - preferred `entities` + `zones`
  - legacy `light_group` + `light_overrides` (normalized internally)
- Numeric config (`columns`, `rows`, `scroll_rows`) must be finite-checked before CSS variable writes.
- Grid mode must prevent runaway tile growth and container overflow.
- Scroll mode card size must be based on visible rows, not total zone count.
- Hero width is container-driven (`width: 100%`), never hard-capped.

### 16.8 Interaction Consistency Rules

- Info headers use tappable 42px control surfaces with `hass-more-info` behavior.
- Tap actions are explicitly configured and never inferred implicitly.
- Keyboard interaction parity is mandatory for non-native control containers.
- Focus visibility is mandatory across scene/status/sensor interactive elements.
- Drag controls must be stable on both iOS touch and desktop pointer devices.

### 16.9 Icon System Hardening

- Normalize deprecated icon aliases before render.
- Reject unknown ligatures and fall back to safe domain defaults.
- Keep card-local icon maps synchronized to prevent per-card drift.

### 16.10 Overview Composition Constraints

- Overview uses curated hero scope (primary zones), not full inventory auto-expansion.
- Scenes card is not included in overview baseline unless explicitly requested for that view.
- Environment row is mandatory and includes both climate and forecast-capable weather.
