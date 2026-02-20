A unified visual language for every card, tile, control, and surface on the Custom Home Assistant dashboard. This document is card-agnostic. It defines the system; individual card specs reference it.

Version 8.0 – February 2026
Platform: Home Assistant OS via Tailscale
Rendering: Chromium WebView (HA Companion + Desktop)
Typeface: DM Sans (Google Fonts)
Icon library: Material Symbols Rounded (Google Fonts, variable font)
Target: 400px card width, responsive to 320px minimum

### 2026-02-20 Implementation Addendum (v8.1)

This addendum is normative and captures the approved migration decisions for the Tunet card suite.

#### Card implementation decisions

1. `tunet-lighting-card`: use `tunet_flex_lighting.js` behavior as the production implementation
2. `tunet-rooms-card`: use alt visual shell with original room-level controls restored
3. `tunet-scenes-card`: use alt horizontal interaction model with semantic button controls
4. `tunet-climate-card`: keep original as baseline and add optional `surface: section`

#### Section-container standard (final)

All section-container variants must use the same shell values:

- Radius: `38px` (`--r-section`)
- Background: `--parent-bg` (or `--section-bg` for cards that define it)
- Backdrop blur: `blur(20px)`
- Border: `1px solid var(--ctrl-border)` (never hardcoded rgba border)
- Elevation: `box-shadow: var(--shadow-section), var(--inset)` (inset ring is mandatory)
- Glass stroke gradient angle: `160deg`

#### Migration-critical compatibility rules

1. Custom element registration must be idempotent:
   - `if (!customElements.get('tag-name')) { customElements.define(...) }`
2. Card picker registration must be deduplicated:
   - Only push when `window.customCards.some(card => card.type === '...')` is false
3. Flex lighting must accept both schemas:
   - New: `entities` + `zones`
   - Legacy: `light_group` + `light_overrides` (internally normalized)
4. Scroll layouts must report fixed/visible-row card sizes, not total item count

#### Ambiguous step clarification: “Remove last sync date”

When a status/sensor layout includes a “Last Sync” tile/row, remove the entire config object from the YAML array instead of hiding it via CSS.

```yaml
tiles:
  # remove this object entirely
  # - type: value
  #   label: Last Sync
  #   entity: sensor.some_last_sync
```

Do not leave dead placeholders or hidden rows. This keeps masonry size, keyboard tab order, and semantics correct.

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
8. Wire editor per §13 (Editor Pattern)
9. Verify per §14 (Checklist)

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

| Parent            | Parent radius | Gap    | Child             | Child radius | Math        |
|-------------------|---------------|--------|-------------------|--------------|-------------|
| Card              | 24px          | 20px   | Track / inner zone| 4px          | 24 − 20 = 4 |
| Card (responsive) | 24px          | 16px   | Track (responsive)| 8px          | 24 − 16 = 8 |
| Dropdown menu     | 16px          | 5px    | Menu option       | 11px         | 16 − 5 = 11 |
| Card              | 24px          | ~10px  | Tile              | 16px         | ≈24 − 10    |

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

  /* -- Track / Slider -- */
  --track-bg: rgba(28,28,30, 0.055);
  --track-h: 44px;

  /* -- Thumb -- */
  --thumb-bg: #fff;
  --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
  --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

  /* -- Radii -- */
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

**Why rgba for fills and borders?** Opacity-based tints adapt to the underlying glass surface. A fixed hex fill looks wrong when the surface behind it shifts color. Rgba tints blend with the backdrop, maintaining the frosted-glass illusion.

### 2.4 Accent Assignment Convention

Each card type uses a primary accent. Most cards use a single accent. Cards with multiple modes (like climate) may use up to three, but each accent is strictly confined to its function – never mixed in the same visual row.

| Domain         | Primary       | Secondary     | Tertiary      |
|----------------|---------------|---------------|---------------|
| Heat / warming | `--amber`     |               |               |
| Cool / AC      | `--blue`      |               |               |
| Lighting       | `--amber`     |               |               |
| Fan / eco      | `--green`     |               |               |
| Media (Sonos)  | `--green`     |               |               |
| Media (Apple)  | `--blue`      |               |               |
| Media (Samsung)| `--purple`    |               |               |
| Security       | `--blue`      |               |               |
| Climate (dual) | `--amber`     | `--blue`      | `--green`     |

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

### 3.8 Surface Hierarchy Summary

| Surface          | Background     | Blur  | Shadow        | Radius   |
|------------------|----------------|-------|---------------|----------|
| Card             | `--glass`      | 24px  | `--shadow`    | 24px     |
| Tile (in card)   | `--tile-bg`    | none  | `--shadow`    | 16px     |
| Dropdown         | `--dd-bg`      | 24px  | `--shadow-up` | 16px     |
| Chip             | `--chip-bg`    | none  | `--chip-sh`   | 999px    |
| Header controls  | `--ctrl-bg`    | none  | `--ctrl-sh`   | 10px     |
| Icon container   | transparent    | none  | none          | 6px      |
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

### 8.4 Off-Mode Card State

When the entity is off:
- Card: `opacity: 0.55`
- Controls that don't apply: hidden via `display: none`
- Track: `opacity: 0.35`

### 8.5 Accent-Based Menu Highlighting

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

### Responsive
- [ ] `max-width: 100%` on card
- [ ] Padding reduces at ≤440px
- [ ] Track radius adjusts concentrically
- [ ] Large numerals reduce size at ≤440px

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

| Layer          | Z-index | Usage                                     |
|----------------|---------|-------------------------------------------|
| Glass stroke   | 0       | Card `::before` pseudo-element            |
| Content        | auto    | Normal flow card content                  |
| Slider stroke  | 1       | Thumb accent line (behind disc)           |
| Slider disc    | 2       | Thumb white circle, markers               |
| Slider dot     | 3       | Thumb center dot, touch target            |
| Dropdown       | 10      | Menu overlays                             |
| Toast/modal    | 20      | Reserved for future overlays              |

---

## 16. Spacing Constants

| Between                      | Gap    |
|------------------------------|--------|
| Header → content zone        | 16px   |
| Content zone → slider/control| 20px   |
| Scale padding-top            | 4px    |
| Scale tick-to-number gap     | 1px    |
| Header flex items            | 8px    |
| Setpoint groups (side by side)| 16px  |
| Card stack (in page layout)  | 20px   |
| Tile grid gap                | 10px   |
| Dropdown menu gap from trigger| 6px   |
| Menu option internal gap (icon→text) | 8px |

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
