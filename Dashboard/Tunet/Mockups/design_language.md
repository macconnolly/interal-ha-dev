A unified visual language for every card, tile, control, and surface on the Custom Home Assistant dashboard. This document is card-agnostic. It defines the system; individual card specs reference it.

Version 9.0 – February 2026
Platform: Home Assistant OS via Tailscale
Rendering: Chromium WebView (HA Companion + Desktop)
Typeface: DM Sans (Google Fonts)
Icon library: Material Symbols Rounded (Google Fonts, variable font)
Target: 400px card width, responsive to 320px minimum

---

## 0. How to Use This Document

This is the canonical design language for every surface on the dashboard. It is written for LLM consumption – every value is explicit, every rule is concrete, every exception is documented.

When building any new card or component:

1. Read §1 (Principles) – these override everything else when conflicts arise
2. Adopt §2 (Tokens) verbatim – never invent a color, shadow, or radius
3. Build the surface per §3 (Surfaces)
4. Compose the header per §5 (Header Pattern)
5. Add content using §4 (Typography), §6 (Icons), §7 (Controls)
6. Wire states per §8 (State System) and §9 (Unified Accent System)
7. Add motion per §10 (Animation)
8. Look up component patterns in §20 (Component Catalog) for card-specific content specs
9. Follow layout rules in §21 (Layout Patterns) for page-level arrangement
10. Wire editor per §13 (Editor Pattern)
11. Verify per §14 (Checklist)

**If a value exists as a token, use the token. If this document specifies a measurement, use that measurement. Never improvise.**

---

## 1. Seven Principles

Ordered by priority. When two conflict, the lower number wins.

### 1. Container handles structure, content handles data

The card surface is a neutral stage. It never encodes entity state through its own styling – no glows, no colored shadows, no tinted backgrounds driven by entity values. Content *inside* the card communicates state through text color, icon fills, and accent tints on specific inner elements.

**One narrow exception:** A card's 1px border may shift to a faint accent tint when the entity is actively doing something (heating, cooling, playing). This is the maximum allowable container-level state signal – and it's subtle enough (≤0.16 opacity) to preserve neutrality.

### 2. Grid of equals

Every card at the same nesting level receives identical elevation, shadow, border, and container treatment regardless of its contents or entity state. A card showing 93% brightness looks identical to one showing 20% at the container level. A card actively heating looks identical to one idling at the container level.

Same rule applies to tiles within a card: every tile in a grid gets the same shadow, radius, and background. Same rule applies to header controls: info tile, toggle buttons, and selector buttons all share the same control surface tokens in their idle state.

### 3. Concentricity

Inner corner radii = outer corner radii − gap between parent and child. Never use arbitrary radii.

| Parent              | Parent radius | Gap    | Child             | Child radius | Math        |
|---------------------|---------------|--------|-------------------|--------------|-------------|
| Section container   | 38px          | 20px   | Card              | 24px         | ≈38 − 14   |
| Section (responsive)| 28px          | 16px   | Card              | 24px         | ≈28 − 8    |
| Card                | 24px          | 20px   | Track / inner zone| 4px          | 24 − 20 = 4 |
| Card (responsive)   | 24px          | 16px   | Track (responsive)| 8px          | 24 − 16 = 8 |
| Dropdown menu       | 16px          | 5px    | Menu option       | 11px         | 16 − 5 = 11 |
| Card                | 24px          | ~10px  | Tile              | 16px         | ≈24 − 10    |

Floating elements (header controls, icon containers, buttons) at 42px size use 10px radius – this is their own squircle proportion, not derived from a parent.

### 4. Weight as hierarchy

Differentiate through font-weight and color opacity, not font-size proliferation. Maximum two font sizes per component zone.

- 700: Primary values, titles, active states
- 600: Labels, buttons, status text, secondary content
- 500: Tertiary detail (percentages, supporting values)

Large text (≥42px) gets negative letter-spacing (tightening). Small text (≤12px) gets positive letter-spacing (opening). Body text (13–15px) uses default spacing.

### 5. Two-layer shadow physics

Every elevated surface casts exactly two shadows: a tight **contact** shadow (small blur, higher opacity) simulating the surface touching the plane below, and a soft **ambient** shadow (large blur, lower opacity) simulating environmental light diffusion.

Never colored shadows. Never single-layer shadows. Never dynamic shadow intensity based on entity state.

**Why two layers work:** A single shadow looks either too sharp (fake drop shadow) or too soft (floating glow). Real objects cast both: a crisp edge where they meet the surface and a diffused halo from ambient light. This dual-layer approach is why the cards feel physically present rather than just painted on.

**Dark mode shadow principle:** Shadows on dark backgrounds must be significantly stronger (~3× opacity) because the dark surface absorbs light and makes weak shadows invisible. The contact/ambient structure stays identical; only opacity scales up.

### 6. Unified idle surfaces

All header controls (info tile, toggle buttons, selector buttons) share identical surface tokens when idle: `--ctrl-bg` background, `--ctrl-border` border, `--ctrl-sh` shadow. This creates a consistent visual row where every element feels like part of the same family.

When an element activates, it materializes with the appropriate accent fill and accent border, visually "waking up" from the neutral state.

**Why not transparent idle?** Controls that are always interactive (toggle triggers, dropdown buttons, tappable info tiles) need tappability affordance even when idle. Making them invisible would remove interaction cues. The unified `--ctrl-*` surface is subtle enough to not distract but visible enough to communicate interactivity.

### 7. Outlined off, filled on

Icons render in their outlined variant (FILL 0) when the associated entity or control is off or idle, and switch to the filled variant (FILL 1) when on or active. This uses the Material Symbols variable font `FILL` axis – one font file, zero icon swapping, zero separate assets.

**Exception:** Icons representing data (not controls) are always filled – humidity `water_drop`, temperature readings, sensor values. These aren't toggleable; they represent persistent information.

---

## 1.1 Explicit Prohibitions

| Never do this                                      | Violated principle | Why it fails                               |
|----------------------------------------------------|--------------------|--------------------------------------------|
| Colored `box-shadow` on card containers            | #1                 | Container is neutral                        |
| Dynamic shadow/glow scaling by entity value        | #2                 | Breaks grid of equals                       |
| Arbitrary `border-radius` not derived from parent  | #3                 | Breaks concentricity                        |
| More than two font sizes in one component          | #4                 | Creates visual chaos                        |
| Single-layer `box-shadow`                          | #5                 | Looks flat and fake                         |
| Different idle surfaces on controls in the same row| #6                 | Breaks visual unity; info tile must match toggle/selector surface |
| Filled icon for an inactive/off state              | #7                 | Defeats the off/on visual signal            |
| `em-dash` (—) in any text                          | Style              | Use en-dash (–) or other punctuation        |
| Period after bullet items                          | Style              | Bullets end without terminal punctuation    |
| `<svg>` or `<img>` for any icon                   | Icon system        | All icons are Material Symbols ligatures    |
| Slider fills referencing CSS tokens                | Technical          | Fills need raw rgba; CSS can't extract channels from hex |
| Gradient fills on slider tracks                    | Visual             | Use flat rgba tints only; gradients allowed only on glass stroke and deadband |
| Page background gradient tokens in cards           | Architecture       | Cards run on HA dashboard; never define --bg1/--bg2/--bg3/--bg4 or render page backgrounds |
| Imperative editor class registration               | Architecture       | Use `static getConfigForm()` for HA 2026.2+ compatibility |

---

## 2. Token System

Every color, shadow, radius, and spacing value is a CSS custom property. In Shadow DOM cards, define on `:host` (light) and `:host(.dark)` (dark). In standalone HTML, use `:root` and `html.dark`.

Cards do not define page backgrounds. They run on the HA dashboard and use `backdrop-filter` to sample from whatever background the theme provides.

### 2.1 Light Mode

```css
:host {
  /* -- Glass Surfaces -- */
  --glass: rgba(255,255,255, 0.68);
  --glass-border: rgba(255,255,255, 0.45);

  /* -- Shadows (always two-layer: contact + ambient) -- */
  --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
  --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
  --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

  /* -- Text -- */
  --text: #1C1C1E;
  --text-sub: rgba(28,28,30, 0.55);
  --text-muted: #8E8E93;

  /* -- Accent: Amber (heat, lighting) -- */
  --amber: #D4850A;
  --amber-fill: rgba(212,133,10, 0.10);
  --amber-border: rgba(212,133,10, 0.22);

  /* -- Accent: Blue (cool, connectivity) -- */
  --blue: #007AFF;
  --blue-fill: rgba(0,122,255, 0.09);
  --blue-border: rgba(0,122,255, 0.18);

  /* -- Accent: Green (eco, fan, media/Sonos) -- */
  --green: #34C759;
  --green-fill: rgba(52,199,89, 0.12);
  --green-border: rgba(52,199,89, 0.15);

  /* -- Accent: Purple (optional, media/Samsung) -- */
  --purple: #AF52DE;
  --purple-fill: rgba(175,82,222, 0.10);
  --purple-border: rgba(175,82,222, 0.18);

  /* -- Accent: Red (error, alert, manual override) -- */
  --red: #FF3B30;
  --red-fill: rgba(255,59,48, 0.10);
  --red-border: rgba(255,59,48, 0.22);
  --red-glow: rgba(255,59,48, 0.40);

  /* -- Track / Slider -- */
  --track-bg: rgba(28,28,30, 0.055);
  --track-h: 44px;

  /* -- Thumb -- */
  --thumb-bg: #fff;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

  /* -- Radii -- */
  --r-section: 38px;
  --r-card: 24px;
  --r-tile: 16px;
  --r-pill: 999px;
  --r-track: 4px;

  /* -- Controls (all header controls, pills, persistent buttons) -- */
  --ctrl-bg: rgba(255,255,255, 0.52);
  --ctrl-border: rgba(0,0,0, 0.05);
  --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);

  /* -- Chips -- */
  --chip-bg: rgba(255,255,255, 0.48);
  --chip-border: rgba(0,0,0, 0.05);
  --chip-sh: 0 1px 3px rgba(0,0,0,0.04);

  /* -- Dropdown Menu -- */
  --dd-bg: rgba(255,255,255, 0.84);
  --dd-border: rgba(255,255,255, 0.60);

  /* -- Dividers -- */
  --divider: rgba(28,28,30, 0.07);

  /* -- Toggle Switch -- */
  --toggle-off: rgba(28,28,30, 0.10);
  --toggle-on: rgba(52,199,89, 0.28);
  --toggle-knob: rgba(255,255,255, 0.96);

  /* -- Tile Surfaces -- */
  --tile-bg: rgba(255,255,255, 0.92);
  --tile-bg-off: rgba(28,28,30, 0.04);
  --gray-ghost: rgba(0,0,0, 0.035);

  /* -- Section Container -- */
  --parent-bg: rgba(255,255,255, 0.35);
  --shadow-section: 0 8px 40px rgba(0,0,0, 0.10);

  color-scheme: light;
}
```

### 2.2 Dark Mode

```css
:host(.dark) {
  --glass: rgba(44,44,46, 0.72);
  --glass-border: rgba(255,255,255, 0.08);

  --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
  --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
  --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);

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
  --red-glow: rgba(255,69,58, 0.45);

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
  --gray-ghost: rgba(255,255,255, 0.05);

  --parent-bg: rgba(255,255,255, 0.04);
  --shadow-section: 0 8px 40px rgba(0,0,0, 0.25);

  color-scheme: dark;
}
```

### 2.3 Accent Architecture

Every accent color has three derivatives forming a consistent surface system:

| Derivative    | Purpose                      | Light opacity range | Dark opacity range |
|---------------|------------------------------|---------------------|--------------------|
| Base          | Text color, icon color       | Full hex            | +15% brighter hex  |
| `-fill`       | Container background tint    | 0.09 – 0.12        | 0.13 – 0.14       |
| `-border`     | Container edge definition    | 0.15 – 0.22        | 0.18 – 0.25       |

These three values are always used together. When an element activates, it gets `background: var(--{accent}-fill)` and `border-color: var(--{accent}-border)` and `color: var(--{accent})` simultaneously. Never mix derivatives from different accents on the same element.

**To add a new accent:** Follow the same pattern. Pick a base hex, derive `-fill` at 0.10 light / 0.14 dark, derive `-border` at 0.20 light / 0.22 dark. Increase base brightness ~15% for the dark variant.

**Red accent `-glow` token:** The red accent includes an additional `-glow` derivative (0.40 light / 0.45 dark) used exclusively for `box-shadow` glow effects on small alert indicators like the manual override dot. No other accent currently requires a `-glow` variant.

**Why rgba for fills and borders?** Opacity-based tints adapt to the underlying glass surface. A fixed hex fill looks wrong when the surface behind it shifts color. Rgba tints blend with the backdrop, maintaining the frosted-glass illusion.

### 2.4 Accent Assignment Convention

Each card type uses a primary accent. Most cards use a single accent. Cards with multiple modes (like climate) may use up to three, but each accent is strictly confined to its function – never mixed in the same visual row.

| Domain              | Primary       | Secondary     | Tertiary      |
|---------------------|---------------|---------------|---------------|
| Heat / warming      | `--amber`     |               |               |
| Cool / AC           | `--blue`      |               |               |
| Lighting            | `--amber`     |               |               |
| Fan / eco           | `--green`     |               |               |
| Media (Sonos)       | `--green`     |               |               |
| Media (Apple)       | `--blue`      |               |               |
| Media (Samsung)     | `--purple`    |               |               |
| Security            | `--blue`      |               |               |
| Climate (dual)      | `--amber`     | `--blue`      | `--green`     |
| Error / alert       | `--red`       |               |               |
| Manual override     | `--red`       |               |               |
| Weather / outdoors  | `--blue`      |               |               |
| Scenes              | per-chip      |               |               |
| Actions             | per-chip      |               |               |
| Rooms               | `--amber`     |               |               |

### 2.5 Text Color Rules

| Token         | Light                      | Dark                         | Usage                                    |
|---------------|----------------------------|------------------------------|------------------------------------------|
| `--text`      | `#1C1C1E`                  | `#F5F5F7`                    | Hero numbers, primary content, menu text |
| `--text-sub`  | `rgba(28,28,30, 0.55)`     | `rgba(245,245,247, 0.50)`   | Labels, titles, status text, pill text   |
| `--text-muted`| `#8E8E93`                  | `rgba(245,245,247, 0.35)`   | Scale numbers, idle icons, disabled text |

**Why rgba for `--text-sub`?** Opacity-based colors adapt perceived weight across varying glass surfaces. Fixed hex values look wrong when the surface tint shifts.

---

## 3. Surfaces

### 3.1 Card Surface

The universal card shell. Every card on the dashboard uses this exact treatment.

```
position: relative
width: 400px, max-width: 100%
border-radius: var(--r-card)             → 24px
background: var(--glass)                 → frosted glass
backdrop-filter: blur(24px)
-webkit-backdrop-filter: blur(24px)
border: 1px solid var(--ctrl-border)     → structural edge
box-shadow: var(--shadow), var(--inset)  → two-layer shadow + sub-pixel inset ring
padding: 20px
display: flex, flex-direction: column
transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s
```

**Why `var(--ctrl-border)` on the card, not `var(--glass-border)`?** The glass-border token is reserved for situations where you need a white stroke on glass. The card's structural border uses the same subtle neutral border as its inner controls, creating visual consistency between container and contents.

**Responsive (≤440px):**
```
padding: 16px
--r-track: 8px                           → concentric adjustment
```

### 3.2 Glass Stroke (Card `::before`)

A gradient pseudo-element simulating a beveled glass edge. Bright on the upper-left (simulated light source), subtle on the lower-right. This is the only place where gradients are used for visual effect (aside from deadband hatching).

```
content: ""
position: absolute, inset: 0
border-radius: var(--r-card)
padding: 1px
pointer-events: none
z-index: 0
```

**Light gradient:**
```
linear-gradient(160deg,
  rgba(255,255,255, 0.50),
  rgba(255,255,255, 0.08) 40%,
  rgba(255,255,255, 0.02) 60%,
  rgba(255,255,255, 0.20))
```

**Dark gradient:**
```
linear-gradient(160deg,
  rgba(255,255,255, 0.14),
  rgba(255,255,255, 0.03) 40%,
  rgba(255,255,255, 0.01) 60%,
  rgba(255,255,255, 0.08))
```

**Mask (stroke-only rendering):**
```
-webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)
-webkit-mask-composite: xor
mask-composite: exclude
```

**Three layers of edge definition:**
1. Structural border (`--ctrl-border`) – defines the card boundary
2. Light-direction highlight (`::before`) – simulates glass bevel
3. Recessed inset ring (`--inset`) – adds sub-pixel depth

These three layers together create the perception of a thick, physical glass pane rather than a flat rectangle.

### 3.3 Card State Tint (Border Only)

The card's 1px border may shift to a faint accent when the entity is actively doing something. This is the only allowed container-level state signal (Principle #1 exception – subtle enough to preserve neutrality).

```
Accent tint opacity: 0.12 – 0.16 (barely visible)
Applied via data attribute: card[data-action="heating"] { border-color: rgba(...) }
```

**Off state:** `opacity: 0.55` on the entire card.

### 3.4 Control Surface (Shared by All Header Controls)

All header controls – info tile, toggle buttons, selector buttons – share these exact idle-state tokens. This is Principle #6 (unified idle surfaces) in action.

```
background: var(--ctrl-bg)               → rgba(255,255,255,0.52) light / rgba(255,255,255,0.08) dark
border: 1px solid var(--ctrl-border)     → rgba(0,0,0,0.05) light / rgba(255,255,255,0.08) dark
box-shadow: var(--ctrl-sh)               → two-layer (0.05 contact + 0.04 ambient) light
border-radius: 10px                      → squircle proportion for 42px elements
min-height: 42px
box-sizing: border-box
```

**Why white-based background in light mode?** A white semi-transparent background on a white glass card creates a subtle brightness difference without introducing a gray tint. Using `rgba(0,0,0, 0.03)` (black tint) creates a slightly dull/gray appearance that looks inconsistent next to white-based siblings. All controls in a row must use the same surface.

**Active state:** When the entity is doing something, replace all three surface tokens with accent versions:
```
background: var(--{accent}-fill)
border-color: var(--{accent}-border)
color: var(--{accent})
```

The accent tokens include both light and dark variants, so active-state CSS never needs `:host(.dark)` overrides – the tokens resolve correctly in both modes.

### 3.5 Tile Surface

Tiles live inside cards (e.g., lighting zones, media sources). They use a slightly more opaque background than cards because they're nested inside an already-frosted surface.

```
background: var(--tile-bg)               → rgba(255,255,255,0.92) light / rgba(44,44,46,0.90) dark
border-radius: var(--r-tile)             → 16px (concentric with card)
box-shadow: var(--shadow)                → identical on every tile (Principle #2)
```

Every tile in a grid gets the same shadow and radius regardless of entity state. Container is neutral. Content communicates state.

### 3.6 Dropdown Menu Surface

```
background: var(--dd-bg)                 → high-opacity frosted glass
backdrop-filter: blur(24px)
border: 1px solid var(--dd-border)
box-shadow: var(--shadow-up)             → elevated (appears above card)
border-radius: var(--r-tile)             → 16px
padding: 5px
```

### 3.7 Chip Surface

Small informational badges or filter toggles.

```
background: var(--chip-bg)
border: 1px solid var(--chip-border)
box-shadow: var(--chip-sh)
border-radius: var(--r-pill)             → 999px (capsule)
```

### 3.8 Section Container Surface

An optional parent wrapper that groups related cards into a visual section on the dashboard page.

```
position: relative
background: var(--parent-bg)          → rgba(255,255,255,0.35) light / rgba(255,255,255,0.04) dark
backdrop-filter: blur(20px)
-webkit-backdrop-filter: blur(20px)
border-radius: var(--r-section)       → 38px (28px at ≤440px)
border: 1px solid rgba(255,255,255, 0.08)
box-shadow: var(--shadow-section)
padding: 20px (16px at ≤440px)
display: flex, flex-direction: column, gap: 16px
width: 100%, max-width: 100%
```

**Glass stroke `::before`:**
```
Light:
  linear-gradient(160deg,
    rgba(255,255,255, 0.40),
    rgba(255,255,255, 0.06) 40%,
    rgba(255,255,255, 0.01) 60%,
    rgba(255,255,255, 0.14))

Dark:
  linear-gradient(160deg,
    rgba(255,255,255, 0.10),
    rgba(255,255,255, 0.02) 40%,
    rgba(255,255,255, 0.005) 60%,
    rgba(255,255,255, 0.06))
```

Uses the same XOR mask technique as the card `::before` (§3.2), but with the section radius.

**Section header (optional):**
```
.section-header:
  display: flex, align-items: center, justify-content: space-between
  padding: 0 4px

.section-title:
  font-size: 16px, font-weight: 700, color: var(--text)
  display: flex, align-items: center, gap: 8px
  Icon color: accent (typically var(--amber))

.section-action (optional pill button):
  font-size: 13px, font-weight: 700, color: var(--amber)
  background: var(--amber-fill), border: 1px solid var(--amber-border)
  padding: 6px 14px, border-radius: 99px
  Hover: box-shadow: var(--shadow-up)
```

### 3.9 Tile Off State

When a tile's entity is off, the tile swaps from `--tile-bg` to `--tile-bg-off`. This visually recedes the tile without changing its shape, shadow, or position in the grid.

```
background: var(--tile-bg-off)       → rgba(28,28,30,0.04) light / rgba(255,255,255,0.04) dark
border: 1px solid var(--ctrl-border) → structural border remains visible
```

Content inside an off-state tile shifts to muted colors:
- Icon: `color: var(--text-muted)`, FILL 0 (outlined)
- Icon container: `background: var(--track-bg)`, no accent border
- Labels: `color: var(--text-sub)`
- Values: `color: var(--text-muted)`

### 3.10 Floating Overlay Surface

Used for drag feedback pills (e.g., brightness value during swipe-to-dim) and tooltips.

```
background: var(--glass)
backdrop-filter: blur(20px)
-webkit-backdrop-filter: blur(20px)
border: 1px solid rgba(255,255,255, 0.15) light / rgba(255,255,255, 0.10) dark
border-radius: var(--r-pill)
box-shadow: 0 10px 30px rgba(0,0,0, 0.30)
padding: 6px 20px
pointer-events: none
z-index: 101
```

### 3.11 Surface Hierarchy Summary

| Surface            | Background       | Blur  | Shadow            | Radius   |
|--------------------|------------------|-------|-------------------|----------|
| Section container  | `--parent-bg`    | 20px  | `--shadow-section`| 38px     |
| Card               | `--glass`        | 24px  | `--shadow`        | 24px     |
| Tile (on)          | `--tile-bg`      | none  | `--shadow`        | 16px     |
| Tile (off)         | `--tile-bg-off`  | none  | `--shadow`        | 16px     |
| Dropdown           | `--dd-bg`        | 24px  | `--shadow-up`     | 16px     |
| Chip               | `--chip-bg`      | none  | `--chip-sh`       | 999px    |
| Header controls    | `--ctrl-bg`      | none  | `--ctrl-sh`       | 10px     |
| Floating overlay   | `--glass`        | 20px  | custom            | 999px    |
| Icon container     | transparent      | none  | none              | 6px      |
---

## 4. Typography

### 4.1 Font Stack

```css
font-family: "DM Sans", system-ui, -apple-system, sans-serif;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```

Load via `<link>` inside Shadow DOM:
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
```

### 4.2 Type Scale

The system uses a deliberately constrained scale. Within any single component zone, use a maximum of two font sizes.

| Role                | Size   | Weight | Letter-spacing | Color           | Extras                      |
|---------------------|--------|--------|----------------|-----------------|-----------------------------|
| Hero numeral        | 48px   | 700    | −1.5px         | `--text` or accent | `tabular-nums`, `line-height:1` |
| Degree / unit symbol| 0.6em  | inherit| inherit        | inherit         | `top:-0.18em`, `margin-left:-1px` |
| Header title        | 13px   | 700    | 0.1px          | `--text-sub`    | `line-height: 1.15`        |
| Header subtitle     | 10.5px | 600    | 0.1px          | `--text-muted`  | `line-height: 1.15`, ellipsis |
| Labels              | 12px   | 600    | 0.3px          | accent or `--text-sub` |                      |
| Pill / button text  | 12px   | 600    | 0.2px          | `--text-sub`    |                             |
| Menu options        | 13px   | 600    | default        | `--text`        | 700 when active             |
| Scale / fine print  | 11px   | 600    | 0.4px          | `--text-muted`  | `tabular-nums`              |
| Small marker        | 11px   | 700    | −0.2px         | `--text-sub`    | `tabular-nums`              |
| Tile zone label     | 15px   | 600    | default        | `--text`        |                             |
| Tile value          | 15px   | 500    | default        | `--text-sub`    |                             |

### 4.3 Letter-Spacing Rules

These follow SF Pro's optical size conventions:

| Size range | Spacing        | Rationale                          |
|------------|----------------|------------------------------------|
| ≥ 42px     | −1.3 to −1.5px | Tighten large numerals             |
| 13–15px    | 0 (default)    | Body text breathes naturally       |
| ≤ 12px     | +0.2 to +0.4px | Widen small labels for legibility  |

### 4.4 Numeric Rendering

All temperature values, percentages, and any number that updates dynamically must use:
```css
font-variant-numeric: tabular-nums;
```
This prevents layout shifts when digits change width (e.g., "1" vs "0" in proportional fonts).

### 4.5 Unit Symbol Pattern

The degree symbol (and any future unit symbol) uses this optical tuning:

```css
.unit-symbol {
  font-size: 0.6em;
  vertical-align: baseline;
  position: relative;
  top: -0.18em;
  margin-left: -1px;
}
```

60% of parent size, shifted up 18% of the em-box, kerned 1px left. These values prevent the symbol from looking oversized or floating.

### 4.6 Responsive Type

At ≤440px card width:
```
Hero numerals: 42px (down from 48px)
Letter-spacing: -1.3px (adjusted from -1.5px)
```

---

## 5. Header Pattern

Every card shares this header structure. The specific icons and controls vary by card type, but the layout, sizing, and behavior rules are universal.

### 5.1 Layout

```
[Info tile: icon + title + subtitle] [flex spacer] [Toggle(s)...] [Selector btn ▾]
```

```
display: flex
align-items: center
gap: 8px
margin-bottom: 16px
```

All header controls share `min-height: 42px`, `box-sizing: border-box`, and `border-radius: 10px`. They also share the `--ctrl-bg` / `--ctrl-border` / `--ctrl-sh` idle surface (Principle #6).

### 5.2 Info Tile (Tappable Entity Identifier)

A tappable container wrapping the entity icon, title, and an optional subtitle (status line). Fires `hass-more-info` on tap. Uses the same control surface tokens as toggle and selector buttons.

```
display: flex, align-items: center, gap: 8px
padding: 6px 10px 6px 6px
min-height: 42px, box-sizing: border-box
border-radius: 10px
border: 1px solid var(--ctrl-border)
background: var(--ctrl-bg)
box-shadow: var(--ctrl-sh)
cursor: pointer
transition: all .15s ease
min-width: 0
```

**Active** (entity is doing something):
```
background: var(--{accent}-fill)
border-color: var(--{accent}-border)
```

Hover: `box-shadow: var(--shadow)`
Active (press): `transform: scale(.98)`

### 5.3 Entity Icon (Inside Info Tile)

A 24×24px icon container. No background or border of its own – the tile carries the fill. Color-only accent.

```
width: 24px, height: 24px
border-radius: 6px
display: grid, place-items: center
flex-shrink: 0
transition: all .2s ease
color: var(--text-muted)
```

Icon glyph: `.icon-18` class (18px). May change dynamically by action (e.g., thermostat → flame when heating, snowflake when cooling).

**Active:** `color: var(--{accent})`, icon filled (FILL 1).

### 5.4 Title & Subtitle

```
.hdr-text:
  display: flex
  flex-direction: column
  gap: 1px
  min-width: 0

.hdr-title:
  font-weight: 700, font-size: 13px
  color: var(--text-sub)
  letter-spacing: 0.1px, line-height: 1.15
  Text: config.name || card-type default (e.g., "Climate", "Light")

.hdr-sub:
  font-size: 10.5px, font-weight: 600
  color: var(--text-muted)
  letter-spacing: 0.1px, line-height: 1.15
  white-space: nowrap, overflow: hidden, text-overflow: ellipsis
```

**Subtitle content pattern:**
Subtitle embeds status information with inline accent-colored `<span>` elements. Separator: ` · ` (space-middot-space). Accent classes: `.heat-ic { color: var(--amber) }`, `.cool-ic { color: var(--blue) }`, `.fan-ic { color: var(--green) }`.

**Combined state logic (for cards with multiple simultaneous states):**

| System state         | Subtitle text                                   | Accent span          |
|----------------------|-------------------------------------------------|----------------------|
| Primary active only  | `{sensor} · <accent>Action</accent>`            | primary accent       |
| Primary + secondary  | `{sensor} · <accent>Action · Secondary</accent>`| primary accent       |
| Secondary only       | `{sensor} · <secondary>Secondary</secondary>`   | secondary accent     |
| Idle                 | `{sensor} · Idle`                               | plain text           |
| Off                  | `{sensor} · Off`                                | plain text           |

When the system is actively doing something (heating/cooling/playing), the active state takes priority over secondary controls (fan/eco). The entire combined label wraps in the active state's accent color.

### 5.5 Spacer

```
flex: 1
```

### 5.6 Toggle Button

A 42×42px squircle for binary controls (fan on/off, adaptive lighting toggle, etc).

```
width: 42px, min-height: 42px, box-sizing: border-box
border-radius: 10px
display: grid, place-items: center
cursor: pointer
transition: all .15s ease

Off state:
  border: 1px solid var(--ctrl-border)
  background: var(--ctrl-bg)
  box-shadow: var(--ctrl-sh)
  color: var(--text-muted)
  Icon: outlined (FILL 0)

On state (idle system):
  background: var(--{accent}-fill)
  color: var(--{accent})
  border-color: var(--{accent}-border)
  Icon: filled (FILL 1)

On state (active system - see §9):
  background: var(--{system-accent}-fill)
  color: var(--{system-accent})
  border-color: var(--{system-accent}-border)
  Icon: filled (FILL 1)

Hover: box-shadow: var(--shadow)
Active (press): transform: scale(.94)
```

**Hidden** when entity doesn't support the toggle: `display: none`

### 5.7 Selector Button (Dropdown Trigger)

A squircle button that always keeps its surface visible (dropdown triggers need persistent tappability). Accent driven by entity action, not mode.

```
display: flex, align-items: center, gap: 4px
min-height: 42px, box-sizing: border-box
padding: 0 8px
border-radius: 10px
border: 1px solid var(--ctrl-border)
background: var(--ctrl-bg)
box-shadow: var(--ctrl-sh)
font-size: 12px, font-weight: 600
color: var(--text-sub)
letter-spacing: 0.2px
cursor: pointer
transition: all .15s ease

Hover: box-shadow: var(--shadow)
Active (press): transform: scale(.97)
```

Contains: mode icon (16×16px) + text label + chevron icon (`expand_more`, 14px). Chevron rotates 180° over 0.2s ease when `aria-expanded="true"`.

### 5.8 Hover State Rules (Universal)

| Element                  | Hover behavior                        |
|--------------------------|---------------------------------------|
| Info tile                | `box-shadow: var(--shadow)` - elevation bump |
| Toggle button            | `box-shadow: var(--shadow)` - elevation bump |
| Selector button          | `box-shadow: var(--shadow)` - elevation bump |
| Dropdown option          | `background: var(--track-bg)` - subtle highlight |
| Tile                     | No change (touch-primary interface)   |

---

## 6. Icon System

### 6.1 Implementation

All icons use Material Symbols Rounded as a variable font loaded via Google Fonts CDN. Icons are `<span>` elements with ligature text content. Never `<svg>`, never `<img>`, never icon fonts that require Unicode code points.

```html
<span class="icon icon-20">thermostat</span>
<span class="icon icon-18 filled">water_drop</span>
```

### 6.2 Base CSS

```css
.icon {
  font-family: 'Material Symbols Rounded';
  font-weight: normal;
  font-style: normal;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  white-space: nowrap;
  direction: ltr;
  vertical-align: middle;
  flex-shrink: 0;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.icon.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

### 6.3 Font Link

```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
```

### 6.4 Size Scale

| Class      | Size | Usage                                        |
|------------|------|----------------------------------------------|
| `.icon-20` | 20px | Tile icons, large indicators                 |
| `.icon-18` | 18px | Header entity icon, toggle buttons, status icons, menu icons |
| `.icon-16` | 16px | Mode button icon, context chips              |
| `.icon-14` | 14px | Chevrons, checkmarks, inline indicators      |

### 6.5 State Convention

| Entity state                 | FILL | Class     | When                                       |
|------------------------------|------|-----------|--------------------------------------------|
| Off / idle / inactive        | 0    | (none)    | Default for all toggleable icons           |
| On / active / engaged        | 1    | `.filled` | Entity is actively doing something         |
| Data display (non-toggle)    | 1    | `.filled` | Informational icons (humidity, sensor)     |

Toggle `.filled` class in JS when state changes.

**Dynamic glyph swapping:** In some cards, the entity icon glyph itself changes based on the current action (not just the fill state). For example, a climate card might show `thermostat` when idle, `local_fire_department` when heating, and `ac_unit` when cooling. This is the exception to "never swap icon ligature names for state changes" - it applies when the icon represents what the system is *doing*, not just whether it's on or off.

---

## 7. Control Patterns

Reusable interaction patterns used across multiple card types.

### 7.1 Dropdown Menu

Absolutely positioned below its trigger button.

```
position: absolute
top: calc(100% + 6px)
right: 0
min-width: 160px
padding: 5px
border-radius: var(--r-tile)              → 16px
background: var(--dd-bg)
backdrop-filter: blur(24px)
border: 1px solid var(--dd-border)
box-shadow: var(--shadow-up)
z-index: 10
display: none (hidden), flex when open
flex-direction: column
gap: 1px
```

**Open animation:**
```css
@keyframes menuIn {
  from { opacity: 0; transform: translateY(-4px) scale(.97) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}
/* Duration: 0.14s ease forwards */
```

**Menu option:**
```
padding: 9px 12px
border-radius: 11px                       → concentric: 16 − 5 = 11
font-size: 13px, font-weight: 600
color: var(--text)
display: flex, align-items: center, gap: 8px
transition: background .1s

Hover: background: var(--track-bg)
Active (press): transform: scale(.97)
Active option: font-weight: 700 + accent fill/color
```

**Divider:** `height: 1px, background: var(--divider), margin: 3px 8px`

**Close:** Click outside the menu wrapper closes it. Set `aria-expanded="false"` on the trigger.

### 7.2 Circular Checkbox

Used for preset toggles (like eco mode) - a small circle with a checkmark.

```
width: 18px, height: 18px
border-radius: 999px
border: 1.5px solid var(--text-muted)
display: grid, place-items: center
transition: all .15s

Active:
  background: var(--{accent})
  border-color: var(--{accent})
  Contains: check icon (14px, color: #fff)
```

### 7.3 Slider (Horizontal Track)

A universal pattern for any value-on-a-range control.

**Track:**
```
height: var(--track-h)                    → 44px
border-radius: var(--r-track)             → 4px (concentric with card)
background: var(--track-bg)
overflow: hidden
```

**Thumb (three-layer structure):**

| Layer    | Z-index | Size  | Description                             |
|----------|---------|-------|-----------------------------------------|
| Stroke   | 1       | 2px wide, full height | Colored accent line behind disc |
| Disc     | 2       | 26px  | White circle with two-layer shadow      |
| Dot      | 3       | 8px   | Accent-colored center with 0.5px ring   |

Touch target: 44×44px invisible hitbox around the 26px visible disc.

**Drag behavior:**
1. 4px movement threshold before drag activates (prevents accidental taps)
2. Add `.dragging` class after threshold exceeded
3. Dragging state: `scale(1.08)` + elevated shadow (`--thumb-sh-a`)
4. Disable CSS transition during drag (`style.transition = 'none'`)
5. Set `document.body.style.cursor = 'grabbing'`
6. On release: remove class, re-enable transition, reset cursor

**Flat fills:**
Fills extend from the track edge to the thumb position. Use a single flat `rgba()` tint at ~0.26-0.28 opacity. No gradients on slider fills. Always use raw `rgba()` with theme-specific RGB values, never token references - CSS cannot extract channels from hex.

### 7.4 Toggle Switch

For binary on/off controls that aren't icon buttons.

```
Off:
  background: var(--toggle-off)
  
On:
  background: var(--toggle-on)

Knob:
  background: var(--toggle-knob)
  Two-layer shadow (contact + ambient)
```

### 7.5 Swipe-to-Dim (Tile Drag Interaction)

The most complex interaction pattern. Used on lighting zone tiles for brightness control.

**Pointer interaction sequence:**

1. `pointerdown` on tile: Record `startX` and `startBrightness`, call `el.setPointerCapture(e.pointerId)`
2. `pointermove`: Calculate `dx = e.clientX - startX`
3. **If `|dx| < 4px`:** Still in "tap" zone; no visual change
4. **If `|dx| >= 4px`:** Enter "sliding" state:
   - Add `.sliding` class to tile
   - Tile: `transform: scale(1.05)`, `box-shadow: var(--shadow-up)`, `z-index: 100`
   - Border: `border-color: var(--amber)` (hard override)
   - Brightness bar expands: `height: 4px → 6px`
   - Floating value pill appears (see §3.10 for surface spec)
   - Pill text: accent-colored brightness percentage, `font-size: 15px`, `font-weight: 700`
   - Pill position: `position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%)`
   - Map horizontal movement to brightness: `clamp(0, startBrt + (dx / tileWidth) * 100, 100)`
   - Bar fill `transition: none` during drag (instant tracking)
   - Debounce service call at **300ms** during drag
5. `pointerup`:
   - **If never exceeded threshold:** Treat as tap → toggle light on/off
   - **If was dragging:** Commit final brightness, debounce at **1500ms** for final service call
   - Remove `.sliding` class, release pointer capture
   - Restore bar fill transition

**Service call pattern:**
```javascript
// During drag (300ms debounce)
clearTimeout(this._dragDebounce);
this._dragDebounce = setTimeout(() => {
  this._hass.callService('light', 'turn_on', {
    entity_id: entity, brightness_pct: value
  });
}, 300);

// On release (1500ms debounce for final commit)
clearTimeout(this._releaseDebounce);
this._releaseDebounce = setTimeout(() => {
  this._hass.callService('light', 'turn_on', {
    entity_id: entity, brightness_pct: value
  });
}, 1500);
```

### 7.6 Tap-to-Toggle (Tile Interaction)

When a tile represents a toggleable entity and the user taps without dragging:
- `pointerdown` → `pointerup` with `|dx| < 4px` movement = tap
- Tap calls the appropriate toggle service (e.g., `light.toggle`)
- Distinguished from drag by the 4px movement threshold

### 7.7 Long-Press (More-Info Dispatch)

Used on adaptive pill buttons and other elements that need dual-action tap/hold.

```
pointerdown: Start 500ms timer
pointermove: Cancel if pointer leaves element
pointerup before 500ms: Treat as tap (primary action)
pointerup after 500ms: Fire hass-more-info event
pointercancel / pointerleave: Cancel timer, prevent context menu
```

**Visual feedback:** After 200ms of holding, apply `transform: scale(.98)` as a subtle cue.

### 7.8 Transport Controls (Media)

Play/pause/skip buttons for media cards.

**Layout:**
```
display: flex, align-items: center, gap: 4px
```

**Skip button (previous/next):**
```
width: 38px, height: 38px
border-radius: 10px
background: transparent, border: none
color: var(--text-sub)
Hover: background: var(--track-bg)
Press: transform: scale(.90)
```

**Play/pause button (hero):**
```
width: 42px, height: 42px
border-radius: 10px
background: var(--ctrl-bg)
border: 1px solid var(--ctrl-border)
box-shadow: var(--ctrl-sh)
color: var(--text)
Hover: box-shadow: var(--shadow)

Playing state:
  background: var(--green-fill)
  border-color: var(--green-border)
  color: var(--green)
  Icon: FILL 1
```

**Volume toggle button:**
```
width: 38px, height: 38px
border-radius: 10px
background: transparent, border: none
color: var(--text-muted)
Hover: background: var(--track-bg)
Press: transform: scale(.90)
```

**Responsive (≤440px):**
```
gap: 2px
Skip buttons: 34×34px
Play button: 38×38px
```

### 7.9 Progress Bar (Media Playback)

A read-only (or scrubbable) indicator for media playback position.

```
Track:
  height: 3px
  border-radius: var(--r-pill)
  background: var(--track-bg)
  position: relative, overflow: hidden

Fill:
  position: absolute, top: 0, left: 0, bottom: 0
  border-radius: var(--r-pill)
  background: rgba(52,199,89, 0.50) light / rgba(48,209,88, 0.50) dark
  transition: width 0.5s linear  (smooth tracking during playback)
```

**Time labels:**
```
Container: display: flex, align-items: center, gap: 6px, margin-top: 4px
Time text: font-size: 10px, font-weight: 600, color: var(--text-muted)
  font-variant-numeric: tabular-nums, letter-spacing: .3px
  min-width: 28px, flex-shrink: 0
Right label: text-align: right
```

### 7.10 Service Call Debouncing

All service calls during continuous interactions must be debounced to prevent API flooding.

| Interaction type          | Debounce interval | When             |
|---------------------------|-------------------|------------------|
| Drag-to-dim (during drag) | 300ms            | Each move event  |
| Drag-to-dim (on release)  | 1500ms           | Final commit     |
| Volume slider (drag)      | 200ms            | Each move event  |
| Volume slider (release)   | 1500ms           | Final commit     |
| Button tap                | None             | Immediate        |

After a service call, some cards apply a **cooldown period** (e.g., 1500ms for volume) during which incoming entity state updates are ignored to prevent slider "bounce-back" from stale HA state.

### 7.11 Tile-Level Dropdown (Center-Anchored)

A dropdown menu anchored to the center of a tile rather than right-aligned to a trigger button. Used in status tile dropdown variant.

```
position: absolute
top: calc(100% + 4px)
left: 50%, transform: translateX(-50%)
min-width: 120px, max-width: 160px
padding: 5px
background: var(--dd-bg)
backdrop-filter: blur(40px)
border: 1px solid var(--dd-border)
border-radius: var(--r-tile)
box-shadow: var(--shadow-up)
z-index: 200
max-height: 200px, overflow-y: auto
```

**Open animation:**
```css
@keyframes ddMenuIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(.97) }
  to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
}
/* Duration: 140ms ease */
```

**Option:**
```
padding: 8px 10px, border-radius: 11px
font-size: 12px, font-weight: 600, color: var(--text-sub)
text-align: center, white-space: nowrap
Hover: background: var(--track-bg)
Selected: color: var(--amber), font-weight: 700
```

**Overflow flip:** If the dropdown would extend beyond the card's bottom edge, flip to `bottom: calc(100% + 4px)` instead of `top`.

---

## 8. State System

### 8.1 State Encoding

Cards use `data-*` attributes on the card container to encode high-level state. CSS rules then show/hide/tint elements based on these attributes.

```html
<div class="card" data-mode="heat_cool" data-action="heating">
```

This approach keeps state logic in JS (toggling attributes) and visual logic in CSS (selectors on those attributes), with clean separation.

### 8.2 Entity Icon State

The header entity icon reflects the current action:

| Action   | Icon FILL   | Icon color       | Container treatment              |
|----------|-------------|------------------|----------------------------------|
| Idle     | 0 (outline) | `--text-muted`   | Transparent                      |
| Active   | 1 (filled)  | `var(--{accent})`| Transparent (tile carries fill)  |
| Off      | 0 (outline) | `--text-muted`   | Transparent                      |

The icon itself may change glyph by action (see §6.5).

### 8.3 Header Control State Summary

| Control        | Idle surface           | Active surface         | Active color          |
|----------------|------------------------|------------------------|-----------------------|
| Info tile      | `--ctrl-bg/border/sh`  | `--{accent}-fill/border` | `--{accent}` (icon) |
| Toggle button  | `--ctrl-bg/border/sh`  | `--{accent}-fill/border` | `--{accent}` (icon) |
| Selector button| `--ctrl-bg/border/sh`  | `--{accent}-fill/border` | `--{accent}` (text) |

All three share identical idle treatment. All three accept the same accent triplet when active. This uniformity is what makes the header row feel cohesive.

### 8.4 Entity State Opacity

Cards and tiles use graduated opacity to communicate entity state. More active states are more visually present.

| Entity state | Card opacity | Use case                    |
|--------------|-------------|-----------------------------|
| Active       | 1.0         | Heating, playing, lights on |
| Paused       | 0.85        | Media paused                |
| Idle         | 0.65        | System idle, standby        |
| Off          | 0.55        | Entity off or unavailable   |

Additional off-state rules:
- Controls that don't apply: hidden via `display: none`
- Track: `opacity: 0.35`

### 8.5 Tile-Level State Encoding

Tiles use classes and data attributes to encode state. CSS rules then drive visual changes.

| State class / attr         | Visual effect                                              |
|----------------------------|------------------------------------------------------------|
| `.on`                      | `--tile-bg` background, accent border, accent icon + value |
| `.off`                     | `--tile-bg-off` background, muted icon + value             |
| `.sliding`                 | `scale(1.05)`, elevated shadow, floating pill visible      |
| `[data-manual="true"]`     | Red override dot visible (8px, positioned top-right)       |
| `.tile-hidden`             | `display: none !important` – removed from layout           |

### 8.6 Accent-Based Menu Highlighting

Active dropdown options receive their accent treatment:
- Heat-related: `var(--amber-fill)` bg + `var(--amber)` text
- Cool-related: `var(--blue-fill)` bg + `var(--blue)` text
- Off: `var(--track-bg)` bg + `var(--text-muted)` text

---

## 9. Unified Action-Driven Accent System

### 9.1 Design Principle

Mode ≠ action. A thermostat set to `heat_cool` mode may be actively heating, cooling, or idle. A media player in "playing" mode may be buffering. The accent color reflects what the system is *doing right now*, not what it's *configured to do*.

One accent color per card at any given moment, propagated uniformly across all state-showing controls.

### 9.2 Single Source of Truth

For climate cards, the `hvac_action` attribute drives all accents. For other card types, identify the equivalent "what is the entity doing right now" attribute and use it consistently.

| Action    | Accent  | Info tile fill         | Toggle fill (if on) | Selector fill     |
|-----------|---------|------------------------|---------------------|-------------------|
| heating   | amber   | `--amber-fill/border`  | `--amber-fill/border` | `--amber-fill/border` |
| cooling   | blue    | `--blue-fill/border`   | `--blue-fill/border`  | `--blue-fill/border`  |
| idle/off  | neutral | `--ctrl-bg/border`     | own accent (e.g. green)| `--ctrl-bg/border`   |

### 9.3 Toggle Override Rule

When the system is actively heating/cooling, all state-showing controls adopt the system accent. A fan toggle that would normally show green (its own accent) instead shows blue when the system is actively cooling. The fan's own green accent only appears when the system is idle or off.

**Implementation:** Set `data-action` on the toggle button element. CSS uses compound selectors:
```css
.toggle-btn.on[data-action="cooling"] {
  background: var(--blue-fill);
  color: var(--blue);
  border-color: var(--blue-border);
}
```

This override creates visual unity across the header row - when everything is blue, you instantly know the system is cooling, regardless of which secondary controls are active.

### 9.4 Edge Cases

**Fan on first, then cooling starts:** The fan button transitions from green to blue. The subtitle updates from "Fan" to "Cooling · Fan". The info tile transitions to blue fill.

**Cooling on, then fan toggled on:** Everything stays blue. Subtitle updates from "Cooling" to "Cooling · Fan".

**Cooling stops (returns to idle) while fan still on:** Everything transitions from blue back to fan's own green accent. Subtitle returns to "Fan".

---

## 10. Animation & Transitions

### 10.1 Timing Reference

| Speed tier  | Duration | Easing | Use case                                      |
|-------------|----------|--------|-----------------------------------------------|
| Instant     | 60ms     | ease   | Fill/position tracking during drag            |
| Quick       | 100ms    | ease   | Background highlights on hover                |
| Standard    | 150ms    | ease   | Button transforms, thumb transitions          |
| Deliberate  | 180ms    | ease   | Hover shadow elevation                        |
| State       | 200ms    | ease   | Icon FILL axis changes, chevron rotation      |
| Smooth      | 250ms    | ease   | Position tracking (markers, indicators)       |
| Theme       | 300ms    | ease   | Card background/border color-scheme switch    |

### 10.2 Scale Transform Values

| Element          | Trigger         | Scale | Purpose                         |
|------------------|-----------------|-------|---------------------------------|
| Info tile        | `:active` press | 0.98  | Gentle press feedback           |
| Icon button      | `:active` press | 0.94  | Strong press feedback           |
| Pill / option    | `:active` press | 0.97  | Subtle press feedback           |
| Menu entrance    | `from` state    | 0.97  | Subtle scale-up on appear       |
| Slider thumb     | `.dragging`     | 1.08  | Clear "grabbed" state           |
| Tile (grabbed)   | `.dragging`     | 1.05  | Lifted feel                     |
| Status tile      | `:active` press | 0.97  | Subtle press feedback           |
| Scene chip       | `:active` press | 0.96  | Press feedback on pill          |
| Action chip      | `:active` press | 0.96  | Press feedback on action        |
| Room orb         | `:active` press | 0.92  | Strong press on small target    |
| Transport skip   | `:active` press | 0.90  | Strong press feedback           |
| Long-press hold  | after 200ms     | 0.98  | Subtle "holding" cue            |

### 10.3 Animation Keyframes

**Menu entrance:**
```css
@keyframes menuIn {
  from { opacity: 0; transform: translateY(-4px) scale(.97) }
  to   { opacity: 1; transform: translateY(0) scale(1) }
}
/* Duration: 0.14s ease forwards */
```

**Fan spin (when fan entity is on):**
```css
@keyframes fan-spin {
  from { transform: rotate(0deg) }
  to   { transform: rotate(360deg) }
}
/* Duration: 1.8s linear infinite */
```

**Tile-level dropdown entrance (center-anchored):**
```css
@keyframes ddMenuIn {
  from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(.97) }
  to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1) }
}
/* Duration: 140ms ease */
```

**Active flash (momentary feedback for scene activation):**
```css
/* Applied via JS: add .active class, then remove after timeout */
.scene-chip.active {
  background: var(--{accent}-fill);
  border-color: var(--{accent}-border);
  color: var(--{accent});
  transition: all .15s ease;  /* instant activate */
}
/* After 1200ms, JS removes .active → chip transitions back to idle */
```

**View switch crossfade (media transport ↔ volume):**
```css
.media-row {
  transition: opacity .2s, transform .2s;
}
.media-row.hidden {
  opacity: 0;
  transform: translateY(4px);
  pointer-events: none;
  position: absolute; inset: 0;
}
```

### 10.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All motion stops. State changes remain functional (instant).

---

## 11. Accessibility

### 11.1 Touch Targets

| Element             | Minimum size | Implementation                        |
|---------------------|-------------|---------------------------------------|
| Header controls     | 42 × 42px  | `min-height: 42px` + `box-sizing: border-box` |
| Slider thumbs       | 44 × 44px  | Invisible hitbox around 26px disc     |
| Dropdown options    | Full width  | 9px vertical padding for height      |
| Toggle switches     | 44 × 44px  | Standard toggle sizing                |

### 11.2 ARIA Requirements

- All interactive elements: `aria-label`
- Sliders: `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`
- Dropdowns: `aria-expanded` on trigger, toggled by JS
- Toggle buttons: `aria-pressed` or toggle state communicated via `aria-label`
- Info tile: fires `hass-more-info` CustomEvent with `{ bubbles: true, composed: true, detail: { entityId } }`
- Scene chips: `role="button"`, `aria-label` with scene name
- Action chips: `role="button"`, `aria-pressed` for persistent active state
- Lighting tiles: `aria-label` with zone name + brightness; drag-to-dim needs `aria-valuemin="0"`, `aria-valuemax="100"`
- Status dots: `aria-label` describing the status (color alone is insufficient)
- Timer tiles: `aria-live="polite"` for countdown updates
- Room capsules: `role="button"`, `aria-label` with room name + status
- Speaker group checkboxes: `aria-checked` for in-group state

### 11.3 Keyboard Navigation

- Slider thumbs: Arrow keys ±1 unit, Shift+Arrow ±5 units
- Dropdowns: Enter/Space to open, Escape to close
- Focus visible: `outline: 2px solid var(--blue), outline-offset: 3px`

### 11.4 Color Contrast

| Combination                   | Ratio  | WCAG level    |
|-------------------------------|--------|---------------|
| `--text` on `--glass` (light) | >7:1   | AAA           |
| `--amber` on white            | ~3.5:1 | AA large text |
| `--blue` on white             | ~4.5:1 | AA            |

---

## 12. Dark Mode

### 12.1 Detection

In HA custom cards: `this.hass.themes.darkMode` → toggle `.dark` class on shadow host.
In standalone HTML: `prefers-color-scheme: dark` media query OR manual `html.dark` class.

### 12.2 Key Deltas

| Property               | Light                    | Dark                              |
|------------------------|--------------------------|-----------------------------------|
| Glass opacity          | 0.68                     | 0.72                              |
| Glass border           | White at 45%             | White at 8%                       |
| Accent brightness      | Base values              | +15% brighter                     |
| Fill opacity           | 0.09 - 0.12             | 0.13 - 0.14                      |
| Border opacity         | 0.15 - 0.22             | 0.18 - 0.25                      |
| Shadow opacity         | ~0.10 / 0.10            | ~0.30 / 0.28                     |
| Inset ring             | Dark hairline (rgba black)| Light hairline (rgba white)      |
| Control surface        | White at 52%             | White at 8%                       |
| Glass stroke ::before  | 50% → 20%               | 14% → 8%                         |

Cards do not define page backgrounds. The glass system works on any background because cards use `backdrop-filter` to sample from whatever the HA dashboard or theme provides.

### 12.3 Token Resolution in Active States

Active-state CSS never needs `:host(.dark)` overrides when using token references. The accent tokens (`--amber-fill`, `--blue-fill`, etc.) already resolve to different values in dark mode. Write the selector once:
```css
.element[data-action="heating"] {
  background: var(--amber-fill);
  border-color: var(--amber-border);
}
```
This works in both light and dark mode because the tokens handle the difference.

---

## 13. Editor Pattern (HA 2026.2+)

### 13.1 Declarative Schema

Cards use `static getConfigForm()` returning a declarative schema object. No imperative editor class - HA's built-in `ha-form` renders selectors natively with proper entity pickers, search, autocomplete, and domain filtering.

```javascript
static getConfigForm() {
  return {
    schema: [
      { name: 'entity', selector: { entity: { domain: '{domain}' } }, required: true },
      // Optional entities
      { name: 'secondary_entity', selector: { entity: { domain: 'sensor', device_class: '{class}' } } },
      // Text fields
      { name: 'name', selector: { text: {} } },
      // Number fields (use grid layout for side-by-side)
      { name: '', type: 'grid', schema: [
        { name: 'display_min', selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } } },
        { name: 'display_max', selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } } },
      ]},
    ],
  };
}
```

### 13.2 Critical Rule

**NEVER create a custom editor class or register `{card-type}-editor` as a custom element.** HA auto-discovers editors by naming convention and will use a broken imperative class instead of `getConfigForm()`. The declarative approach is the only compatible path for HA 2026.2+.

---

## 14. Preflight Checklist

Before shipping any card, verify every item.

### Card Shell
- [ ] `background: var(--glass)` + `backdrop-filter: blur(24px)`
- [ ] `border: 1px solid var(--ctrl-border)`
- [ ] `box-shadow: var(--shadow), var(--inset)`
- [ ] `border-radius: var(--r-card)` (24px)
- [ ] `::before` gradient glass stroke with mask-composite
- [ ] Both light and dark `::before` variants defined
- [ ] Card width: 400px, max-width: 100%
- [ ] Padding: 20px (16px at ≤440px)

### Header
- [ ] Info tile: 42px min-height, 10px radius, tappable → `hass-more-info`, `--ctrl-bg/border/sh` idle
- [ ] Entity icon: 24×24 inside info tile, 6px radius, color-only accent
- [ ] Title: 13px/700/`--text-sub`, subtitle: 10.5px/600/`--text-muted` with ellipsis
- [ ] Toggle buttons: `--ctrl-bg/border/sh` when off, accent when on, 42×42px
- [ ] Selector button: always visible `--ctrl-bg/border/sh` surface, 42px min-height, 10px radius
- [ ] All controls share same idle surface tokens (no gray vs white inconsistency)
- [ ] All icons from Material Symbols Rounded with correct size class
- [ ] Flex layout: info tile + spacer + toggles + selector

### Icons
- [ ] Outlined (FILL 0) when off/idle
- [ ] Filled (FILL 1) when on/active
- [ ] `.filled` class toggled via JS
- [ ] Data-display icons always `.filled`
- [ ] All icons use `<span class="icon">` with ligature text

### Shadows
- [ ] Two-layer on every elevated surface
- [ ] No colored shadows anywhere
- [ ] No shadow on entity icon containers (icon is inside tile which has shadow)
- [ ] `--inset` ring on card
- [ ] `--shadow-up` on dropdowns and elevated overlays
- [ ] Dark mode shadows ~3× opacity of light mode

### Typography
- [ ] Max two font sizes per component zone
- [ ] Weight hierarchy: 700 → 600 → 500
- [ ] Negative letter-spacing on ≥42px text
- [ ] Positive letter-spacing on ≤12px text
- [ ] `tabular-nums` on all dynamic numbers
- [ ] DM Sans font stack with antialiasing

### Concentricity
- [ ] Child radius = parent radius − gap
- [ ] Track radius: 4px (or 8px responsive)
- [ ] Menu option radius: 11px (16 − 5)
- [ ] Tile radius: 16px
- [ ] Header controls: 10px (squircle at 42px size)

### Tokens
- [ ] All colors from token system, no hard-coded hex
- [ ] Slider fills use raw rgba flat tints (documented exception, no gradients)
- [ ] Both light and dark values defined for every token used
- [ ] Single accent per card when possible; max three with strict confinement
- [ ] Active states use accent tokens (no `:host(.dark)` overrides needed)

### Unified Accent System
- [ ] Accent driven by entity action, not configured mode
- [ ] Info tile, toggle buttons, and selector all adopt the same accent simultaneously
- [ ] Toggle button accent overridden by system accent when system is actively heating/cooling
- [ ] Toggle button shows its own accent only when system is idle/off
- [ ] `data-action` attribute set on card, info tile, toggle buttons, and selector

### Interaction
- [ ] Touch targets ≥ 42px (buttons) or ≥ 44px (sliders)
- [ ] `aria-label` on all interactive elements
- [ ] `prefers-reduced-motion` kills all animation
- [ ] Hover states per §5.8 rules
- [ ] Press feedback (scale) on all tappable elements
- [ ] Keyboard support on all focusable controls
- [ ] `focus-visible` outline: 2px solid var(--blue), 3px offset
- [ ] Drag interactions use `setPointerCapture` (§7.5)
- [ ] Service calls debounced per §7.10
- [ ] Long-press wired where applicable (§7.7)

### Component-Specific (if applicable)
- [ ] Scene chips: momentary 1200ms active flash, not persistent toggle (§20.1)
- [ ] Action chips: persistent state from entity, per-chip accent (§20.2)
- [ ] Status tiles: 4-column grid (2 at ≤440px), typed variants correct (§20.3)
- [ ] Status dots: paired with text label for accessibility (§20.3.1)
- [ ] Timer tiles: 1s interval, auto-hide on expire (§20.3.2)
- [ ] Lighting tiles: swipe-to-dim + tap-to-toggle dual behavior (§20.4)
- [ ] Manual override dot: visible only when `[data-manual="true"]` (§20.4)
- [ ] Floating pill: appears only during drag, `pointer-events: none` (§3.10)
- [ ] Media: graduated opacity by entity state (§8.4)
- [ ] Media: view switching crossfade between track/volume (§20.5.4)
- [ ] Media: volume cooldown prevents bounce-back (§20.5.5)
- [ ] Room cards: orb toggles + room toggle + chevron navigation (§20.6)
- [ ] Weather: forecast "Today" tile highlighted with blue accent (§20.7.3)
- [ ] Sensor: threshold styling matches configured rules (§20.8.4)

### Responsive
- [ ] `max-width: 100%` on card
- [ ] Padding reduces at ≤440px
- [ ] Track radius adjusts concentrically
- [ ] Large numerals reduce size at ≤440px
- [ ] Grids collapse columns per §21.3 breakpoint table

### Dark Mode
- [ ] All token overrides defined in `:host(.dark)`
- [ ] Glass stroke `::before` has dark variant
- [ ] Shadow opacity increases ~3× for dark backgrounds
- [ ] Accent colors use brightened dark variants
- [ ] Dark mode detection wired (hass.themes.darkMode)

### Editor
- [ ] `static getConfigForm()` returns declarative schema
- [ ] No imperative editor class registered
- [ ] Entity selectors with proper domain filtering
- [ ] Number fields use grid layout for side-by-side display

---

## 15. Z-Index Convention

| Layer              | Z-index | Usage                                     |
|--------------------|---------|-------------------------------------------|
| Glass stroke       | 0       | Card `::before` pseudo-element            |
| Content            | auto    | Normal flow card content                  |
| Tile content       | 1       | `.tile-content` (above bar fill)          |
| Slider stroke      | 1       | Thumb accent line (behind disc)           |
| Manual override dot| 2       | Red dot on lighting tiles                 |
| Slider disc        | 2       | Thumb white circle, markers               |
| Slider dot         | 3       | Thumb center dot, touch target            |
| Dropdown (card)    | 10      | Menu overlays inside card                 |
| Sliding tile       | 100     | Tile during drag (above siblings)         |
| Floating pill      | 101     | Brightness pill during drag               |
| Tile dropdown      | 200     | Center-anchored tile menu                 |

---

## 16. Spacing Constants

| Between                              | Gap    |
|--------------------------------------|--------|
| Header → content zone               | 16px   |
| Content zone → slider/control        | 20px   |
| Scale padding-top                    | 4px    |
| Scale tick-to-number gap             | 1px    |
| Header flex items                    | 8px    |
| Setpoint groups (side by side)       | 16px   |
| Card stack (in page layout)          | 20px   |
| Tile grid gap                        | 10px   |
| Dropdown menu gap from trigger       | 6px    |
| Tile dropdown gap from tile          | 4px    |
| Menu option internal gap (icon→text) | 8px    |
| Scene chip row gap                   | 8px    |
| Action chip row gap                  | 8px    |
| Status tile grid gap                 | 10px   |
| Light zone grid gap                  | 10px   |
| Room card list gap                   | 10px   |
| Forecast tile grid gap               | 8px    |
| Transport button gap                 | 4px    |
| Speaker group chip gap               | 6px    |
| Media row internal gap               | 14px   |
| Room controls gap                    | 6px    |
| Section container internal gap       | 16px   |
| Section container padding            | 20px   |
| Brightness bar margin-top            | auto (flex) |
| Progress bar margin-top              | 4px    |
| Floating pill offset                 | translate(-50%, -50%) from tile top |

---

## 17. Shadow Reference (Complete)

Every shadow in the system, with both light (L) and dark (D) values.

### 17.1 Light Mode

| Token          | Contact layer                        | Ambient layer                        |
|----------------|--------------------------------------|--------------------------------------|
| `--shadow`     | `0 1px 3px rgba(0,0,0, 0.10)`       | `0 8px 32px rgba(0,0,0, 0.10)`      |
| `--shadow-up`  | `0 1px 4px rgba(0,0,0, 0.10)`       | `0 12px 36px rgba(0,0,0, 0.12)`     |
| `--ctrl-sh`    | `0 1px 2px rgba(0,0,0, 0.05)`       | `0 2px 8px rgba(0,0,0, 0.04)`       |
| `--thumb-sh`   | `0 1px 2px rgba(0,0,0, 0.12)`       | `0 4px 12px rgba(0,0,0, 0.06)`      |
| `--thumb-sh-a` | `0 2px 4px rgba(0,0,0, 0.16)`       | `0 8px 20px rgba(0,0,0, 0.10)`      |
| `--chip-sh`    | `0 1px 3px rgba(0,0,0, 0.04)`       | (single layer - exception: too subtle to need two) |

### 17.2 Dark Mode

| Token          | Contact layer                        | Ambient layer                        |
|----------------|--------------------------------------|--------------------------------------|
| `--shadow`     | `0 1px 3px rgba(0,0,0, 0.30)`       | `0 8px 28px rgba(0,0,0, 0.28)`      |
| `--shadow-up`  | `0 1px 4px rgba(0,0,0, 0.35)`       | `0 12px 36px rgba(0,0,0, 0.35)`     |
| `--ctrl-sh`    | `0 1px 2px rgba(0,0,0, 0.25)`       | `0 2px 8px rgba(0,0,0, 0.15)`       |
| `--thumb-sh`   | `0 1px 2px rgba(0,0,0, 0.35)`       | `0 4px 12px rgba(0,0,0, 0.18)`      |
| `--thumb-sh-a` | `0 2px 4px rgba(0,0,0, 0.40)`       | `0 8px 20px rgba(0,0,0, 0.25)`      |
| `--chip-sh`    | `0 1px 3px rgba(0,0,0, 0.18)`       | (single layer)                       |

### 17.3 Shadow Design Rationale

**Contact shadow (first layer):** Always starts at `0 1px` vertical offset with 2-4px blur. This simulates the paper-thin gap between a physical card and the surface it rests on. The tight blur creates a crisp edge right at the bottom of the element. Opacity range: 0.05 (subtle controls) to 0.12 (prominent thumbs) in light mode.

**Ambient shadow (second layer):** Much larger blur radius (8-36px) with moderate opacity (0.04-0.12). This creates the soft halo that makes elements feel like they're floating in a lit environment. The large blur radius means this shadow extends far beyond the element boundary, giving it presence.

**Shadow hierarchy:** More prominent elements get bigger ambient radii and higher opacity. Cards (`--shadow`, 32px ambient) > controls (`--ctrl-sh`, 8px ambient) maps directly to visual importance. Elevated elements like dropdowns use `--shadow-up` with even larger ambient radii (36px) because they float above the card surface.

**Hover elevation:** Controls transition from `--ctrl-sh` to `--shadow` on hover. This creates a "lifting" effect - the ambient shadow expands from 8px to 32px blur, making the element feel like it rose off the card surface toward the user's finger.

**Drag elevation:** Thumb transitions from `--thumb-sh` to `--thumb-sh-a`. Contact blur increases from 2px to 4px (slightly lifted), ambient from 12px to 20px (wider spread). Combined with `scale(1.08)`, the thumb visually detaches from the track.

### 17.4 Shadow Usage Map

| Surface              | Resting                | Hover          | Elevated (drag) |
|----------------------|------------------------|----------------|-----------------|
| Card                 | `--shadow` + `--inset` | (no change)    | -               |
| Header control (idle)| `--ctrl-sh`            | `--shadow`     | -               |
| Header control (on)  | `--ctrl-sh`            | `--shadow`     | -               |
| Slider thumb         | `--thumb-sh`           | `--thumb-sh-a` | `--thumb-sh-a`  |
| Dropdown menu        | `--shadow-up`          | -              | -               |
| Tile                 | `--shadow`             | -              | `--shadow-up`   |
| Chip                 | `--chip-sh`            | -              | -               |

---

## 18. Shadow DOM Notes

- All styles are scoped inside Shadow DOM via `<style>` in `render()`
- Google Fonts `<link>` tags go inside the shadow root template
- `:host` replaces `:root` for token definitions
- `:host(.dark)` replaces `html.dark`
- The card detects dark mode from `this.hass.themes.darkMode` and toggles `.dark` class on the host
- Use `this.shadowRoot.querySelector()` for DOM queries
- Event listeners for drag must use `document` level for mousemove/mouseup (attach in `connectedCallback`, remove in `disconnectedCallback`)
- `hass-more-info` events require `bubbles: true, composed: true` to escape Shadow DOM

---

## 19. Absolute Rules

1. Never use `<svg>` or `<img>` for icons - always Material Symbols Rounded ligatures
2. Never single-layer box-shadow - always two comma-separated layers (contact + ambient)
3. Never colored box-shadow on the card container
4. Never hard-code colors - always use tokens (exception: slider fills use raw rgba for opacity tints)
5. Never more than two font sizes per component zone
6. Outlined icons when off, filled when on - toggle via `.filled` class
7. All header controls (info tile, toggle buttons, selector buttons) share `min-height: 42px`, `border-radius: 10px`, and `--ctrl-bg/border/sh` idle surface
8. Selector buttons always keep their surface visible (dropdown trigger needs tappable affordance)
9. Eco uses `--green`, never `--amber`
10. Degree symbol: 0.6em, top:-0.18em, margin-left:-1px - no other values
11. 4px drag threshold before visual drag state activates
12. All numbers use `font-variant-numeric: tabular-nums`
13. `prefers-reduced-motion` kills all animation and transition
14. Accent color follows entity action, never configured mode - one accent per card, unified across all controls
15. No gradient fills on slider tracks - flat rgba tints only (gradients only on glass stroke and deadband)
16. Never register a custom editor element class - use `static getConfigForm()` for HA 2026.2+
17. Toggle button color yields to system accent when system is actively doing something; own accent only when idle/off
18. Info tile fires `hass-more-info` on tap - it is the primary entity interaction point
19. Cards never define page backgrounds - they rely on `backdrop-filter` to sample from the HA dashboard
20. Active-state CSS never needs `:host(.dark)` overrides - accent tokens resolve correctly in both modes
21. Every card must copy token values exactly from §2 – never invent modified values. Token drift across cards breaks visual uniformity
22. Service calls during drag interactions must be debounced per §7.10
23. `setPointerCapture` on all drag interactions to maintain tracking when pointer leaves element

---

## 20. Component Catalog

Card-content patterns that build on the shared shell (§3–§9). Each component references tokens and controls from earlier sections.

### 20.1 Scene Chip

A standalone pill-shaped button for activating HA scenes or scripts. NOT the same as the informational chip in §3.7 – scene chips are interactive action triggers with icons.

**Container:**
```
display: flex, align-items: center, justify-content: center, gap: 6px
padding: 10px 16px (overview) / 10px 6px (v3 equal-width variant)
border-radius: var(--r-pill)
background: var(--glass)
backdrop-filter: blur(24px), -webkit-backdrop-filter: blur(24px)
border: 1px solid var(--ctrl-border)
box-shadow: var(--shadow), var(--inset)
font-family: inherit, font-size: 12px, font-weight: 600
color: var(--text-sub), letter-spacing: .2px
cursor: pointer, transition: all .15s ease
user-select: none, white-space: nowrap
position: relative, overflow: hidden
```

**Glass stroke `::before`:** Same XOR mask technique as card (§3.2), using `--r-pill`.

**Icon:** `.icon-18`, accent-colored via `[data-accent]` attribute. Each chip can have its own accent (`amber`, `blue`, `purple`, `red`, `green`).

**Layout variants:**
- **Flex-wrap row (overview):** `display: flex; gap: 8px; flex-wrap: wrap`. Each chip auto-sizes.
- **Equal-width row (v3):** `display: flex; gap: 8px`. Each chip `flex: 1`.

**States:**

| State               | Background                  | Border                  | Text / Icon             | Behavior          |
|----------------------|-----------------------------|-------------------------|-------------------------|--------------------|
| Idle                 | `var(--glass)`              | `var(--ctrl-border)`    | `--text-sub` / accent icon | –                |
| Hover                | (no change)                 | (no change)             | (no change)             | `box-shadow: var(--shadow-up), var(--inset)` |
| Press                | (no change)                 | (no change)             | (no change)             | `transform: scale(.97)` |
| Active (momentary)   | `var(--{accent}-fill)`      | `var(--{accent}-border)`| `var(--{accent})` / FILL 1 | 1200ms flash, then fades back |

**Behavior:**
- Tap calls `scene.turn_on` or `script.turn_on` (domain auto-detected from entity)
- Active state is a **momentary flash** (1200ms), NOT a persistent toggle
- JS: add `.active` class + `.filled` on icon → setTimeout 1200ms → remove both
- Radio group behavior (optional): When one chip activates in a mutually exclusive group, remove `.active` from siblings first

### 20.2 Action Chip (In-Card)

Action chips inside a card shell. Distinguished from scene chips by: tile-level surface (not glass), persistent state reflection from entities, and per-chip accent support.

**Container:**
```
flex: 1
display: flex, align-items: center, justify-content: center, gap: 6px
padding: 10px 4px
border-radius: var(--r-tile)
background: var(--tile-bg)
box-shadow: var(--shadow)
font-family: inherit, font-size: 11px, font-weight: 600
color: var(--text-sub), letter-spacing: .1px
cursor: pointer, transition: all .15s ease
user-select: none, white-space: nowrap
border: 1px solid transparent
```

**Icon:** `.icon-18`, `color: var(--text-muted)` when idle.

**Layout:** Flex row inside card, `gap: 8px`. Each chip `flex: 1` (equal width).

**States:**

| State   | Border                      | Text / Icon              | Icon FILL |
|---------|-----------------------------|--------------------------|-----------|
| Idle    | `transparent`               | `--text-sub` / `--text-muted` | 0         |
| Active  | `var(--{accent}-border)`    | `var(--{accent})`        | 1         |
| Hover   | (no change)                 | (no change)              | –         |
| Press   | (no change)                 | (no change)              | –         |

Hover: `box-shadow: var(--shadow-up)`
Press: `transform: scale(.96)`

**Per-chip accent:** `data-accent` attribute on each chip (`amber` default, `blue`, `purple`). CSS selectors: `.action-chip[data-accent="blue"].active { ... }`.

**Active state is persistent:** Driven by `state_entity` matching `active_when` value in config. JS polls entity state, not tap feedback.

**Tap behavior:** Calls configured `service` with `service_data`. Special case: Sleep action toggles (if already active, switches back to previous state).

**Responsive (≤440px):**
```
font-size: 10px
.icon: 16px
gap: 4px
```

### 20.3 Status Tile System

A grid of small tiles showing system status information, with four typed variants.

**Grid layout:**
```
display: grid
grid-template-columns: repeat(4, 1fr)
gap: 10px
```

**Responsive (≤440px):** `grid-template-columns: repeat(2, 1fr)`

**Base tile:**
```
background: var(--tile-bg)
border-radius: var(--r-tile)
box-shadow: var(--shadow)
padding: 14px 8px 10px
display: flex, flex-direction: column, align-items: center, justify-content: center
gap: 4px
cursor: pointer
transition: all .15s ease
position: relative, overflow: visible
```

Hover: `box-shadow: var(--shadow-up)`
Press: `transform: scale(.97)`

**Tile icon:**
```
width: 28px, height: 28px
display: grid, place-items: center
margin-bottom: 2px
```

Icon color driven by `[data-accent]` on the tile:
- `[data-accent="amber"]` → `color: var(--amber)`, FILL 1
- `[data-accent="blue"]` → `color: var(--blue)`, FILL 1
- `[data-accent="green"]` → `color: var(--green)`, FILL 1
- `[data-accent="muted"]` → `color: var(--text-muted)`, FILL 0

**Value text:**
```
font-size: 18px (16px at ≤440px), font-weight: 700
letter-spacing: -.2px, line-height: 1
color: var(--text)
font-variant-numeric: tabular-nums
text-align: center, white-space: nowrap
```

**Label text:**
```
font-size: 9px, font-weight: 600
letter-spacing: .5px, text-transform: uppercase
color: var(--text-muted), line-height: 1
text-align: center, white-space: nowrap
overflow: hidden, text-overflow: ellipsis, max-width: 100%
```

**Degree symbol:** Uses §4.5 pattern: `font-size: 0.6em; position: relative; top: -0.18em; margin-left: -1px`.

#### 20.3.1 Status Dot

A 6px indicator dot positioned at the top-right corner of a tile.

```
width: 6px, height: 6px
border-radius: 999px
position: absolute, top: 10px, right: 10px
```

| Class    | Color           | Meaning         |
|----------|-----------------|-----------------|
| `.green` | `var(--green)`  | Active / healthy|
| `.amber` | `var(--amber)`  | Warning / manual|
| `.blue`  | `var(--blue)`   | Info / standby  |
| `.red`   | `var(--red)`    | Error / alert   |
| `.muted` | `var(--text-muted)` | Disabled    |

Color alone is insufficient for accessibility – always pair with a text label or `aria-label`.

#### 20.3.2 Tile Types

**Indicator tile** (`data-type="indicator"`): Icon + value + label + optional status dot. Tap fires `hass-more-info`. Value and dot driven by entity state.

**Value tile** (default): Icon + value + label. Same as indicator but without status dot. Value formatted from entity state or attribute, with optional unit.

**Timer tile** (`data-type="timer"`): Icon + countdown + label + status dot.
- Value format: `M:SS` (under 60 min) or `H:MM:SS`
- `letter-spacing: .5px` on timer value (wider for monospaced feel)
- Update interval: 1 second (JS `setInterval`)
- Computes real remaining time: `snapshot_seconds - Math.floor((Date.now() - last_updated) / 1000)`
- When `remaining <= 0`: tile gets `.tile-hidden` class (removed from layout)

**Dropdown tile** (`data-type="dropdown"`): Icon + inline selector + label.
- Value replaced by `.tile-dd-val` container with text + chevron
- Chevron: `.icon` 12px, `color: var(--text-muted)`, rotates 180° when `.open`
- Opens center-anchored dropdown (§7.11)
- Option selection calls `input_select.select_option` service

#### 20.3.3 Conditional Visibility

Any tile can be conditionally hidden via `show_when` config:
```
.tile-hidden { display: none !important }
```
JS evaluates `show_when.entity` state against `show_when.state` value. No `show_when` = always visible.

### 20.4 Lighting Zone Tile

A tile representing a single lighting zone with tap-to-toggle and swipe-to-dim.

**Grid layout:**
```
display: grid
grid-template-columns: repeat(3, 1fr)
gap: 10px
```

**Responsive (≤440px):** `grid-template-columns: repeat(2, 1fr)`

**Tile container:**
```
border-radius: var(--r-tile)
box-shadow: var(--shadow)
display: flex, flex-direction: column, align-items: center
cursor: pointer
transition: background .2s ease, border-color .2s ease, box-shadow .15s ease
position: relative, overflow: hidden
user-select: none
touch-action: pan-y
border: 1px solid transparent
```

**On state:** `background: var(--tile-bg); border-color: var(--amber-border)`
**Off state:** `background: var(--tile-bg-off); border-color: var(--ctrl-border)`
Hover: `box-shadow: var(--shadow-up)`

**Tile content area:**
```
position: relative, z-index: 1
display: flex, flex-direction: column, align-items: center, justify-content: center
width: 100%, padding: 14px 8px 10px, gap: 6px
```

**Zone icon wrap:**
```
width: 44px, height: 44px, border-radius: 10px
display: grid, place-items: center
transition: all .2s ease
border: 1px solid transparent
```

Off: `background: var(--track-bg); color: var(--text-muted)`
On: `background: var(--amber-fill); border-color: var(--amber-border); color: var(--amber); icon FILL 1`

**Zone name:** `font-size: 13px, font-weight: 600, color: var(--text)` (off: `--text-sub`), `letter-spacing: .1px, line-height: 1`

**Zone value:** `font-size: 12px, font-weight: 600, line-height: 1, font-variant-numeric: tabular-nums, letter-spacing: .2px`. Off: `color: var(--text-muted)`, text "Off". On: `color: var(--amber)`, text "{pct}%".

**Brightness bar:**
```
width: 100%, height: 4px (6px during drag)
background: var(--track-bg)
position: relative
margin-top: auto, flex-shrink: 0
```

Bar fill:
- Off: `background: var(--text-muted); opacity: 0.15`
- On: `background: var(--amber); opacity: 0.65`
- Width = brightness percentage
- `transition: width .15s ease` (disabled during drag: `transition: none`)

**Manual override dot:**
```
position: absolute, top: 8px, right: 8px
width: 8px, height: 8px
background: var(--red)
border-radius: 50%
display: none
box-shadow: 0 0 8px var(--red-glow)
z-index: 2
```

Visible when `[data-manual="true"]`: `display: block`. Detected by scanning Adaptive Lighting switch `manual_control` attributes.

**Sliding state (drag active):**
```
.l-tile.sliding:
  transform: scale(1.05)
  box-shadow: var(--shadow-up)
  z-index: 100
  border-color: var(--amber) !important

.l-tile.sliding .zone-val:
  (becomes floating pill – see §3.10)
  position: absolute, top: 0, left: 50%
  transform: translate(-50%, -50%)
  color: var(--amber), font-weight: 700, font-size: 15px
  background: var(--glass)
  backdrop-filter: blur(20px)
  padding: 6px 20px, border-radius: 999px
  box-shadow: 0 10px 30px rgba(0,0,0, 0.30)
  border: 1px solid rgba(255,255,255, 0.15) light / rgba(255,255,255, 0.10) dark
  z-index: 101, white-space: nowrap

.l-tile.sliding .zone-bar:
  height: 6px

.l-tile.sliding .zone-bar-fill:
  transition: none
```

**Interaction:** See §7.5 (Swipe-to-Dim) and §7.6 (Tap-to-Toggle).

**Lighting header pattern:**
```
Layout: display: flex, align-items: center, gap: 10px, margin-bottom: 16px

Header icon:
  width: 34px, height: 34px, border-radius: 10px
  display: grid, place-items: center
  border: 1px solid transparent, background: transparent
  color: var(--text-muted), transition: all .2s ease
  .on: background: var(--amber-fill), color: var(--amber), border-color: var(--amber-border)

Title: font-weight: 700, font-size: 14px, color: var(--text-sub), letter-spacing: .1px

Spacer: flex: 1

All Off button:
  display: flex, align-items: center, gap: 4px
  padding: 7px 12px, border-radius: var(--r-pill)
  border: 1px solid var(--amber-border), background: var(--amber-fill)
  color: var(--amber), font-size: 12px, font-weight: 700
  box-shadow: var(--ctrl-sh)
  Hover: box-shadow: var(--shadow)
  Press: transform: scale(.96), opacity: 0.8

Adaptive pill:
  display: flex, align-items: center, gap: 5px
  padding: 7px 10px, border-radius: var(--r-pill)
  border: 1px solid var(--ctrl-border), background: var(--ctrl-bg)
  box-shadow: var(--ctrl-sh)
  font-size: 12px, font-weight: 600, color: var(--text-sub)
  letter-spacing: .2px
  Hover: box-shadow: var(--shadow)
  Press: transform: scale(.97)
  .on: background: var(--amber-fill), color: var(--amber), border-color: var(--amber-border)
  Tap: toggle adaptive switch
  Long-press (500ms): fire hass-more-info (see §7.7)
```

### 20.5 Media Card Sub-Components

Components specific to the media player card (Sonos). These all live inside the standard card shell (§3.1) with the standard header (§5).

#### 20.5.1 Card State Tint

```css
.card[data-state="playing"] { border-color: rgba(52,199,89, 0.14) }
:host(.dark) .card[data-state="playing"] { border-color: rgba(48,209,88, 0.16) }
```

Playing state activates green accent on info tile, entity icon, and play button.

#### 20.5.2 Album Art

```
width: 56px, height: 56px (48×48 at ≤440px)
flex-shrink: 0
border-radius: 10px
overflow: hidden
background: var(--track-bg)
box-shadow: var(--ctrl-sh) (playing: var(--shadow))
display: grid, place-items: center
position: relative

img: width: 100%, height: 100%, object-fit: cover, position: absolute, inset: 0
Placeholder icon: var(--text-muted)
```

#### 20.5.3 Track Info

```
flex: 1, min-width: 0
display: flex, flex-direction: column, gap: 3px

Track name: 15px / 700 / var(--text) (14px at ≤440px)
  line-height: 1.15, white-space: nowrap, overflow: hidden, text-overflow: ellipsis

Artist: 13px / 600 / var(--text-sub)
  line-height: 1.15, white-space: nowrap, overflow: hidden, text-overflow: ellipsis
```

#### 20.5.4 Media Row / View Switching

Two interchangeable rows: track view (default) and volume view. Toggle via volume button.

```
.media-row:
  display: flex, align-items: center, gap: 14px
  transition: opacity .2s, transform .2s

.media-row.hidden:
  opacity: 0
  transform: translateY(4px)
  pointer-events: none
  position: absolute, inset: 0
```

Volume row uses `translateY(-4px)` when hidden (slides from opposite direction).

#### 20.5.5 Volume Slider

Reuses §7.3 slider pattern with green accent.

```
Track height: 44px
Track radius: var(--r-track)
Fill: rgba(52,199,89, 0.26) light / rgba(48,209,88, 0.28) dark
Stroke: 2px, var(--green), full height
Thumb dot: var(--green)
```

**Volume percentage label:**
```
font-size: 14px, font-weight: 700, color: var(--text)
font-variant-numeric: tabular-nums, letter-spacing: -0.2px
min-width: 42px, text-align: right, flex-shrink: 0
```

**Mute icon:** Changes glyph by volume level:
- 0%: `volume_off`
- 1–50%: `volume_down`
- 51–100%: `volume_up`
- Always FILL 1, `color: var(--green)`

**Cooldown:** After volume service call, ignore incoming state updates for 1500ms to prevent bounce-back.

#### 20.5.6 Speaker Dropdown

Uses §7.1 dropdown pattern (right-aligned). Min-width: 220px.

**Speaker option:**
```
Same as §7.1 .dd-option
Contains: icon (speaker/tv) + text column (name + now-playing) + group checkbox

Speaker text:
  .spk-name: flex: 1, ellipsis
  .spk-now-playing: 10.5px / 500 / var(--text-muted), ellipsis
  Selected: .spk-now-playing color: var(--green), opacity: 0.7
```

**Group checkbox:**
```
width: 20px, height: 20px
border-radius: 999px
border: 1.5px solid var(--text-muted)
display: grid, place-items: center
transition: all .15s ease
cursor: pointer

Hover: border-color: var(--green)
.in-group: background: var(--green), border-color: var(--green)
Check icon: 14px, FILL 1, color: #fff, opacity: 0 → 1 when .in-group
```

**Action options (Group All / Ungroup All):**
```
Color: var(--text-sub), hover: var(--text)
Icon: var(--green)
Separated by .dd-divider (1px, var(--divider), margin: 3px 8px)
Only shown when >1 speaker available
```

**Left-click option:** Switch active entity (volume target).
**Right-click checkbox:** Toggle speaker group membership via `sonos_toggle_group_membership` script.

### 20.6 Room Card

A card-shaped row for room overview with light orb toggles and navigation.

**Card container:**
```
min-height: 72px
border-radius: var(--r-card)
background: var(--glass)
backdrop-filter: blur(24px), -webkit-backdrop-filter: blur(24px)
border: 1px solid var(--ctrl-border)
box-shadow: var(--shadow), var(--inset)
display: flex, align-items: center
padding: 0 14px, gap: 12px
cursor: pointer
transition: all .15s
position: relative, overflow: hidden
```

**Glass stroke `::before`:** Same as card (§3.2).

Hover: `box-shadow: var(--shadow-up), var(--inset)`
Active room: `border-color: var(--amber-border)`

**Room icon:**
```
width: 44px, height: 44px
border-radius: 12px
display: grid, place-items: center
flex-shrink: 0
transition: all .2s
border: 1px solid transparent

Inactive: background: var(--gray-ghost), color: var(--text-muted)
Active (any light on): background: var(--amber-fill), color: var(--amber), border-color: var(--amber-border), icon FILL 1
```

**Room info:**
```
flex: 1, min-width: 0

.room-name: 14px / 700 / var(--text), line-height: 1.2
.room-status: 11.5px / 600 / var(--text-muted), line-height: 1.2, margin-top: 2px
  Active text (e.g., brightness): color: var(--amber)
```

Status text pattern: "All off" OR "{count} of {total} on · {brightness}% · {temp}°F"

**Room controls:**
```
display: flex, align-items: center, gap: 6px
```

**Light orb (per-light toggle):**
```
width: 34px, height: 34px
border-radius: 10px
display: grid, place-items: center
flex-shrink: 0
cursor: pointer
transition: all .15s
border: 1px solid transparent

Off: background: var(--gray-ghost), color: var(--text-muted)
On: background: var(--amber-fill), color: var(--amber), border-color: var(--amber-border), icon FILL 1
Hover: background: var(--track-bg)
Press: transform: scale(.92)
```

Tap: `light.toggle` on individual entity.

**Room toggle (all lights):**
```
width: 44px, height: 24px
border-radius: 12px
position: relative
cursor: pointer
transition: background .15s

Off: background: var(--toggle-off)
On: background: var(--toggle-on)

Knob:
  width: 20px, height: 20px
  border-radius: 999px
  background: var(--toggle-knob)
  box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)
  position: absolute, top: 2px, left: 2px
  transition: transform .15s ease
  .on: transform: translateX(20px)
```

**Chevron (navigation):**
```
color: var(--text-muted), flex-shrink: 0, cursor: pointer
```

Tap: navigates to room detail view via `history.pushState` + `location-changed` event.

**Layout:** Vertical stack of room cards: `display: flex; flex-direction: column; gap: 10px`.

### 20.7 Weather Card Sub-Components

Components inside the weather card, building on the standard card shell and header.

#### 20.7.1 Current Conditions

```
.weather-main: display: flex, align-items: flex-start, gap: 20px, padding: 0 4px

.weather-current:
  display: flex, flex-direction: column, gap: 2px

.weather-temp:
  font-size: 42px, font-weight: 700, line-height: 1
  letter-spacing: -1.5px
  font-variant-numeric: tabular-nums
  color: var(--text)

.weather-desc:
  font-size: 13px, font-weight: 600, color: var(--text-sub)
  margin-top: 4px
```

#### 20.7.2 Detail Rows

```
.weather-details: display: flex, flex-direction: column, gap: 6px, padding-top: 6px

.weather-detail:
  display: flex, align-items: center, gap: 6px
  font-size: 12px, font-weight: 600, color: var(--text-sub)
  Icon: color: var(--blue)
  Value: font-weight: 700, color: var(--text), tabular-nums
```

Details shown: wind (with compass bearing), humidity, pressure.

#### 20.7.3 Forecast Tile

```
Grid: display: grid, grid-template-columns: repeat(5, 1fr), gap: 8px
Responsive (≤440px): grid-template-columns: repeat(3, 1fr)

.forecast-tile:
  display: flex, flex-direction: column, align-items: center, gap: 4px
  padding: 10px 4px 8px
  border-radius: 12px
  background: var(--ctrl-bg)
  border: 1px solid var(--ctrl-border)
  transition: all .15s

First tile ("Now" / "Today"):
  background: var(--blue-fill)
  border-color: var(--blue-border)
  Day label + icon: color: var(--blue)

.forecast-day:
  font-size: 10px, font-weight: 700
  letter-spacing: .3px, text-transform: uppercase
  color: var(--text-muted)

.forecast-icon: color: var(--text-sub)

.forecast-hi: 13px / 700 / var(--text), tabular-nums
.forecast-lo: 11px / 600 / var(--text-muted), tabular-nums
```

**Weather condition icon mapping:**
| HA state         | Material Symbol     |
|------------------|---------------------|
| sunny            | sunny               |
| cloudy           | cloud               |
| clear-night      | bedtime             |
| partlycloudy     | partly_cloudy_day   |
| rainy / pouring  | rainy               |
| snowy            | weather_snowy       |
| lightning        | thunderstorm        |
| lightning-rainy  | thunderstorm        |
| windy            | air                 |
| fog              | foggy               |

### 20.8 Sensor Card Sub-Components

Components for displaying environment sensor data with optional history visualization.

#### 20.8.1 Sensor Row

```
display: flex, align-items: center, gap: 12px
padding: 12px
border-radius: var(--r-tile)
transition: all .15s
cursor: pointer
```

Hover: subtle background shift. Tap: fires `hass-more-info` or navigates.

**Icon container:**
```
width: 36px, height: 36px
border-radius: 10px
display: grid, place-items: center
background: var(--{accent}-fill)
color: var(--{accent})
Icon: FILL 1
```

**Value display:**
```
font-size: 24px, font-weight: 700
color: var(--text)
font-variant-numeric: tabular-nums
```

**Unit:** Per §4.5 pattern for degree symbols. Other units inline: `font-size: 14px, font-weight: 600, color: var(--text-sub)`.

**Divider between rows:** `height: 1px; background: var(--divider); margin: 0 12px`.

#### 20.8.2 Trend Indicator

```
Inline flex, gap: 4px
Icon: 14px
  Rising: arrow_upward, color: var(--red)
  Falling: arrow_downward, color: var(--blue)
  Stable: remove (dash), color: var(--text-muted)
Text: 11px / 600
```

Trend computed from history: compares current value to average of recent data points.

#### 20.8.3 Sparkline (Mini Chart)

```
height: 40px, width: 80px
SVG element, no axes, no labels

Path: stroke: var(--{accent}), stroke-width: 2px, fill: none
  Computed from entity history (default 6 hours)
```

Purely decorative trend indicator. Rate-limited history fetch (2 min cache).

#### 20.8.4 Threshold Styling

Sensor rows change appearance based on configurable thresholds:

| Style class | Icon container bg    | Text color      |
|-------------|----------------------|-----------------|
| `warning`   | `var(--amber-fill)`  | `var(--amber)`  |
| `error`     | `var(--red-fill)`    | `var(--red)`    |
| `success`   | `var(--green-fill)`  | `var(--green)`  |
| `info`      | `var(--blue-fill)`   | `var(--blue)`   |

Threshold operators: `gte`, `gt`, `lte`, `lt`, `eq`, `neq`.

---

## 21. Layout Patterns

Page-level layout rules for arranging cards on the dashboard.

### 21.1 Layout Grid

```css
.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  width: 100%;
  max-width: 860px;
}

@media (min-width: 520px) {
  .layout-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

Full-width elements (e.g., room card stack, scene row): `grid-column: 1 / -1`.

### 21.2 Card Stack

Vertical stack of same-type cards:
```
display: flex
flex-direction: column
gap: 20px
```

### 21.3 Responsive Breakpoints

All responsive rules trigger at `max-width: 440px` (card-level) or `min-width: 520px` (grid-level).

| Element                | Desktop          | Mobile (≤440px)     |
|------------------------|------------------|---------------------|
| Card padding           | 20px             | 16px                |
| Section container      | 38px radius, 20px pad | 28px radius, 16px pad |
| Status grid            | 4 columns        | 2 columns           |
| Light zone grid        | 3 columns        | 2 columns           |
| Forecast grid          | 5 columns        | 3 columns           |
| Hero numerals          | 48px             | 42px                |
| Hero letter-spacing    | -1.5px           | -1.3px              |
| Status tile value      | 18px             | 16px                |
| Scene chip             | 12px, 10px 16px  | 11px, 9px 4px       |
| Transport buttons      | 38px, gap 4px    | 34px, gap 2px       |
| Play button            | 42px             | 38px                |
| Album art              | 56×56px          | 48×48px             |
| Track name             | 15px             | 14px                |

### 21.4 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

All motion stops. State changes remain functional (instant).