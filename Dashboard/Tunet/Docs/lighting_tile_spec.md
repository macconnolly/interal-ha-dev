# Lighting Tile Specification

**Source:** `Dashboard/Tunet/lighting-section-mockup-polish.html`
**Purpose:** Pixel-exact specification for Claude Code to replicate the mockup's lighting tile design and interactions across the Tunet card suite
**Status:** Reference spec – extracted verbatim from the mockup with annotations

---

## 1. Source File Token System

These are the exact tokens from the mockup. They differ from design_language.md v8.3 in several places (see §8 for reconciliation notes).

### 1.1 Light Mode Tokens

```css
:root {
  --bg: #f4f4f9;
  --card-bg: #ffffff;
  --parent-bg: rgba(255, 255, 255, 0.45);
  --text-main: #1c1c1e;
  --text-sub: #8e8e93;
  --amber: #d4850a;
  --amber-light: rgba(212, 133, 10, 0.08);
  --amber-border: rgba(212, 133, 10, 0.22);
  --gray-ghost: rgba(0, 0, 0, 0.03);
  --shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
  --shadow-active: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
  --radius-parent: 32px;
  --radius: 22px;
  --radius-inner: 16px;
  --track-bg: rgba(0,0,0,0.06);
  --border-ghost: transparent;
}
```

### 1.2 Dark Mode Tokens (Midnight Navy)

```css
html.dark {
  --bg: #0f172a;
  --card-bg: #1e293b;
  --parent-bg: rgba(30, 41, 59, 0.6);
  --text-main: #f8fafc;
  --text-sub: #94a3b8;
  --amber: #fbbf24;
  --amber-light: rgba(251, 191, 36, 0.12);
  --amber-border: rgba(251, 191, 36, 0.25);
  --gray-ghost: rgba(255, 255, 255, 0.04);
  --shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5);
  --shadow-active: 0 20px 40px rgba(0,0,0,0.6), 0 4px 15px rgba(0,0,0,0.4);
  --track-bg: rgba(255,255,255,0.08);
  --border-ghost: rgba(255, 255, 255, 0.05);
}
```

**Key dark mode design decisions:**
- `--bg: #0f172a` is Tailwind slate-900 (midnight navy, not pure black)
- `--card-bg: #1e293b` is Tailwind slate-800 (dark blue-gray surface)
- `--parent-bg` uses `rgba(30, 41, 59, 0.6)` – the blue-gray glass tint
- `--amber: #fbbf24` is Tailwind amber-400 (warm gold, brighter than spec's `#E8961E`)
- `--text-main: #f8fafc` is Tailwind slate-50 (slightly warmer white than spec's `#F5F5F7`)
- `--text-sub: #94a3b8` is Tailwind slate-400 (blue-tinted muted, not spec's rgba opacity approach)
- `--border-ghost` becomes visible in dark mode (`rgba(255,255,255,0.05)`) to define off-tile edges

---

## 2. Section Container (Parent Surface)

The tiles sit inside a frosted-glass section container.

```css
.section-container {
  background: var(--parent-bg);           /* rgba(255,255,255,0.45) light / rgba(30,41,59,0.6) dark */
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: var(--radius-parent);    /* 32px */
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;                              /* between header and grid */
}
```

### 2.1 Section Header

```css
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}
```

**Title (left side):**
```css
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .icon {
  color: var(--amber);
  font-size: 20px;
  /* Always filled (FILL 1) – this is a label icon, not a state icon */
}
```

**Action pill (right side):**
```css
.section-action {
  font-size: 13px;
  font-weight: 700;
  color: var(--amber);
  background: var(--amber-light);
  padding: 6px 14px;
  border-radius: 99px;                    /* capsule */
  cursor: pointer;
}
```

### 2.2 Grid Layout

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns – user prefers more cols, fewer rows */
  gap: 10px;
}
```

**Responsive at ≤440px:**
```css
@media (max-width: 440px) {
  .grid { gap: 8px; }
  .section-container { padding: 16px; }
}
```

---

## 3. Tile Anatomy

Each tile has exactly 5 child elements in this DOM order:

```
.l-tile                         ← Tile container
├── .manual-dot                 ← Override indicator (abs positioned top-right)
├── .icon-wrap                  ← Icon container
│   └── .icon                   ← Material Symbols ligature
├── .name                       ← Zone label
├── .val                        ← Brightness percentage / "Off"
└── .progress-track             ← Bottom progress bar (abs positioned)
    └── .progress-fill          ← Fill width = brightness %
```

**No other elements.** The mockup's power is this minimal anatomy.

---

## 4. Tile Base Surface

```css
.l-tile {
  background: var(--card-bg);             /* #ffffff light / #1e293b dark */
  border-radius: var(--radius);           /* 22px */
  box-shadow: var(--shadow);              /* two-layer: 4px+12px light / 4px+20px dark */
  aspect-ratio: 1 / 0.95;                /* nearly square, slightly wider than tall */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  user-select: none;
  touch-action: none;                     /* prevents browser scroll/zoom during drag */
  border: 1px solid var(--border-ghost);  /* transparent light / rgba(255,255,255,0.05) dark */
  overflow: visible;                      /* allows floating pill to escape tile bounds */
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.2s,
              border-color 0.2s,
              opacity 0.2s,
              background-color 0.3s;
}
```

**Critical details:**
- `aspect-ratio: 1 / 0.95` makes tiles slightly landscape (wider than tall)
- `touch-action: none` is essential – without it, browsers intercept the horizontal drag as a scroll gesture
- The transition easing `cubic-bezier(0.34, 1.56, 0.64, 1)` on transform creates a bouncy overshoot effect when tiles scale up/down
- `overflow: visible` is required so the floating pill (which positions at `top: 0; transform: translateY(-50%)`) can render above the tile boundary

**Responsive at ≤440px:**
```css
.l-tile { aspect-ratio: 1 / 1.05; }      /* flips to slightly taller than wide on mobile */
```

---

## 5. Tile States

The tile has exactly 3 mutually exclusive visual states, controlled by CSS classes on `.l-tile`.

### 5.1 Off State (`.l-tile.off`)

```css
.l-tile.off {
  opacity: 1;                             /* NEVER fade the tile – off is communicated by content */
}

.l-tile.off .icon-wrap {
  background: var(--gray-ghost);          /* rgba(0,0,0,0.03) light / rgba(255,255,255,0.04) dark */
  color: var(--text-sub);
  border: 1px solid transparent;
}

.l-tile.off .name {
  color: var(--text-sub);
}

.l-tile.off .val {
  color: var(--text-sub);
  opacity: 0.5;                           /* value text is further muted */
}
```

**Off state communicates through:**
1. Ghost icon-wrap background (barely visible tint)
2. Muted text color on name and value
3. Value text at 50% opacity (double-muted)
4. Progress fill at 0% width (hidden)
5. Icon outlined (FILL 0 – default, no `.filled` class)
6. In dark mode, `--border-ghost` adds a faint white border to define tile edges

### 5.2 On State (`.l-tile.on`)

```css
.l-tile.on {
  border-color: var(--amber-border);      /* rgba(212,133,10,0.22) light / rgba(251,191,36,0.25) dark */
}

.l-tile.on .icon-wrap {
  background: var(--amber-light);         /* rgba(212,133,10,0.08) light / rgba(251,191,36,0.12) dark */
  color: var(--amber);                    /* #d4850a light / #fbbf24 dark */
  border: 1px solid var(--amber-border);
}

.l-tile.on .val {
  color: var(--amber);                    /* percentage shows in amber */
}

.l-tile.on .icon {
  font-variation-settings: 'FILL' 1;     /* filled icon */
}

.l-tile.on .progress-fill {
  background: var(--amber);
  opacity: 0.9;
}
```

**On state communicates through:**
1. Amber-tinted tile border
2. Amber-tinted icon-wrap background with amber border
3. Icon filled (FILL 1)
4. Amber icon color
5. Amber value text
6. Amber progress fill at brightness width, 90% opacity
7. Name stays `var(--text-main)` (inherits – not overridden)

### 5.3 Sliding State (`.l-tile.sliding`)

Applied *in addition to* `.on` during an active drag gesture.

```css
.l-tile.sliding {
  transform: scale(1.05);                /* lifts tile 5% */
  box-shadow: var(--shadow-active);       /* elevated shadow */
  z-index: 100;                           /* renders above siblings */
  border-color: var(--amber);             /* full amber border (not amber-border tint) */
}
```

**Floating pill (value text transforms):**
```css
.l-tile.sliding .val {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);       /* centered above tile top edge */
  color: var(--amber);
  font-weight: 700;
  font-size: 15px;
  background: var(--card-bg);
  padding: 6px 20px;
  border-radius: 99px;                    /* capsule */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  z-index: 101;                           /* above the lifted tile */
  border: 1px solid rgba(255,255,255,0.1);
}
```

**Progress track expands during drag:**
```css
.l-tile.sliding .progress-track {
  height: 6px;                            /* grows from 4px rest to 6px active */
}
```

**Sliding state communicates through:**
1. `scale(1.05)` lift with bouncy easing (from base transition)
2. Elevated shadow (deeper blur, higher opacity)
3. Full amber border (not the tinted `--amber-border`)
4. Value text pops out as a floating capsule pill above the tile
5. Progress track swells from 4px → 6px
6. z-index 100 on tile, 101 on pill – renders above all siblings

---

## 6. Tile Content Elements

### 6.1 Icon Wrap

```css
.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-inner);     /* 16px */
  display: grid;
  place-items: center;
  margin-bottom: 6px;
  transition: all 0.2s ease;
}
```

### 6.2 Icon

```css
.icon {
  font-family: 'Material Symbols Rounded';
  font-size: 24px;
  font-variation-settings: 'FILL' 0;     /* outlined by default */
}

.on .icon {
  font-variation-settings: 'FILL' 1;     /* filled when on */
}
```

Icon is a `<span>` with ligature text content. Examples from mockup:
`table_lamp`, `countertops`, `bed`, `highlight`, `light`, `view_column`, `door_sliding`, `restaurant`, `laptop_mac`

### 6.3 Zone Name

```css
.name {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 1px;
  letter-spacing: 0.1px;
}
```

Color: inherits `var(--text-main)` when on, overridden to `var(--text-sub)` when off.

### 6.4 Brightness Value

```css
.val {
  font-size: 13px;
  font-weight: 700;
  transition: color 0.2s;
}
```

Content: `"{brightness}%"` when on, `"Off"` when brightness is 0.
Color: `var(--amber)` when on, `var(--text-sub)` at `opacity: 0.5` when off.

### 6.5 Progress Track (Bottom Bar)

```css
.progress-track {
  position: absolute;
  bottom: 10px;
  left: 14px;
  right: 14px;
  height: 4px;                            /* rest height */
  background: var(--track-bg);            /* rgba(0,0,0,0.06) light / rgba(255,255,255,0.08) dark */
  border-radius: 99px;
  overflow: hidden;
  transition: height 0.2s ease;           /* animates 4px → 6px on drag */
}

.progress-fill {
  height: 100%;
  width: 0%;                              /* set via inline style to brightness % */
  background: var(--text-sub);            /* muted fill when off */
  transition: width 0.1s ease-out;        /* fast tracking during drag */
  border-radius: 99px;
}

.on .progress-fill {
  background: var(--amber);
  opacity: 0.9;
}
```

**Positioning details:**
- 10px from bottom edge of tile
- 14px inset from left and right tile edges
- Fill width is set via `style="width: {brightness}%"` inline

### 6.6 Manual Override Dot

```css
.manual-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #ff5252;                    /* red – hardcoded, not tokenized */
  border-radius: 50%;
  display: none;                          /* hidden by default */
  box-shadow: 0 0 12px rgba(255, 82, 82, 0.6);  /* red glow */
}

.l-tile[data-manual="true"] .manual-dot {
  display: block;
}
```

Controlled by `data-manual="true"` attribute on the tile. This is the only element that uses a colored glow shadow – it's intentional as a warning indicator.

---

## 7. Interaction Model

### 7.1 Pointer Events (Unified Touch + Mouse)

The mockup uses the Pointer Events API, which handles both mouse and touch through a single interface.

**Events used:** `pointerdown`, `pointermove`, `pointerup`
**Capture:** `tile.setPointerCapture(e.pointerId)` on pointerdown

### 7.2 Drag-to-Dim

```javascript
const threshold = 6;  // pixels of horizontal movement before drag activates
```

**Sequence:**

1. **pointerdown** – Record `startX = e.clientX` and `startBrt = current brightness`. Call `setPointerCapture`.

2. **pointermove** – Check `e.buttons` (nonzero = pointer still held). Calculate `dx = e.clientX - startX`.
   - If `!isDragging && Math.abs(dx) > threshold`: set `isDragging = true`, add `.sliding` class to tile
   - If `isDragging`: calculate new brightness:
     ```javascript
     const change = (dx / tile.offsetWidth) * 100;
     let newBrt = Math.round(Math.max(0, Math.min(100, startBrt + change)));
     ```
     The full tile width maps to 100% brightness range. Dragging right = brighter, left = dimmer.

3. **pointerup** – Two outcomes:
   - If drag **did not activate** (`!isDragging`): treat as a **tap** – toggle between 0% and 100%
     ```javascript
     updateTileUI(tile, current > 0 ? 0 : 100);
     ```
   - If drag **did activate** (`isDragging`): mark tile as manual override (`data-manual = "true"`)
   - In both cases: remove `.sliding` class, reset `isDragging = false`

### 7.3 Tap-to-Toggle

If the pointer goes down and up without exceeding the 6px horizontal threshold, it fires as a simple toggle:
- If currently on (brightness > 0): turn off (set to 0%)
- If currently off (brightness = 0): turn on (set to 100%)

### 7.4 UI Update Function

```javascript
function updateTileUI(tile, brt) {
  tile.dataset.brightness = brt;
  fill.style.width = brt + '%';
  val.textContent = brt > 0 ? brt + '%' : 'Off';

  if (brt > 0) {
    tile.classList.add('on');
    tile.classList.remove('off');
  } else {
    tile.classList.remove('on');
    tile.classList.add('off');
  }
}
```

### 7.5 All Off Action

The section header's "All Off" pill calls:
```javascript
function allOff() {
  document.querySelectorAll('.l-tile').forEach(t => updateTileUI(t, 0));
}
```

---

## 8. Reconciliation with design_language.md v8.3

This section maps every mockup value to its design_language.md v8.3 equivalent and flags intentional differences vs accidental drift.

### 8.1 Token Name Mapping

| Mockup token | Spec equivalent | Notes |
|-------------|----------------|-------|
| `--bg` | **Not in spec** | Spec §19 rule 19: cards never define page backgrounds |
| `--card-bg` | `--tile-bg` | Mockup uses opaque white; spec uses `rgba(255,255,255,0.92)` |
| `--parent-bg` | Section-container surface (§3, parity lock) | Light: mockup 0.45 vs spec 0.45 ✓. Dark: mockup `rgba(30,41,59,0.60)` vs spec `rgba(30,41,59,0.60)` ✓ (parity lock matches) |
| `--text-main` | `--text` | Light: both `#1C1C1E` ✓. Dark: mockup `#f8fafc` vs spec `#F5F5F7` |
| `--text-sub` | `--text-muted` | Light: both `#8E8E93` ✓. Dark: mockup `#94a3b8` (Tailwind) vs spec `rgba(245,245,247,0.35)` |
| `--amber` | `--amber` | Light: both `#D4850A` ✓. Dark: mockup `#fbbf24` (Tailwind amber-400) vs spec `#E8961E` |
| `--amber-light` | `--amber-fill` | Light: mockup 0.08 vs spec 0.10. Dark: mockup 0.12 vs spec 0.14 |
| `--amber-border` | `--amber-border` | Light: both 0.22 ✓. Dark: mockup 0.25 vs spec 0.25 ✓ |
| `--gray-ghost` | **Not in spec** | Custom token for off-state icon-wrap background |
| `--shadow` | `--shadow` | Structure differs – mockup leads with ambient, spec leads with contact |
| `--shadow-active` | Closest to `--shadow-up` | Mockup uses much deeper values, especially in dark mode |
| `--radius-parent` | `--r-section` | Both 32px ✓ |
| `--radius` | `--r-tile` | Mockup 22px vs spec 16px – **significant divergence** |
| `--radius-inner` | No direct equivalent | 16px for icon wrap; spec uses 6px for entity icon containers |
| `--track-bg` | `--track-bg` | Light: mockup 0.06 vs spec 0.055. Dark: mockup 0.08 vs spec 0.06 |
| `--border-ghost` | `--ctrl-border` (approximate) | Mockup uses transparent light / faint white dark; spec's ctrl-border is always visible |

### 8.2 Structural Differences

| Property | Mockup | Spec (design_language.md v8.3) | Verdict |
|----------|--------|-------------------------------|---------|
| **Tile radius** | 22px | 16px (`--r-tile`) | Mockup is rounder. 22px with 32px parent at 10px gap gives concentricity: 32 − 10 = 22 ✓ |
| **Tile aspect ratio** | `1 / 0.95` | Not specified | Mockup invention – slightly landscape |
| **Tile background** | Opaque `var(--card-bg)` | `var(--tile-bg)` = `rgba(255,255,255,0.92)` | Mockup uses solid white; spec uses semi-transparent |
| **Icon wrap size** | 44×44px | 24×24px (entity icon) | Mockup uses larger icon wraps – this is a tile icon, not a header entity icon |
| **Icon wrap radius** | 16px (`--radius-inner`) | 6px (entity icon) | Larger wrap = larger radius |
| **Icon size** | 24px | 18–20px typical | Larger to fill the 44px wrap |
| **Tile shadow** | `--shadow` (ambient-first) | `--shadow` (contact-first) | Layer order differs |
| **Progress bar** | 4px rest / 6px active | Not in spec for tiles | Mockup invention – bottom brightness indicator |
| **Floating pill** | Pops above tile during drag | Spec §7.3 describes slider thumb, not floating pill | Mockup invention – unique interaction feedback |
| **Manual dot** | 8px red circle with glow | Not in spec | OAL-specific indicator |
| **Transition easing** | `cubic-bezier(0.34, 1.56, 0.64, 1)` on transform | `ease` on most animations | Mockup uses springy overshoot; spec uses linear ease |
| **Section container blur** | 20px | 20px (parity lock §surface parity contract) ✓ | Match |
| **Section border** | `rgba(255,255,255,0.08)` hardcoded | `var(--ctrl-border)` token reference | Mockup hardcodes; spec tokens |

### 8.3 Dark Mode Palette Philosophy

The mockup uses what it calls **"Midnight Navy"** – a Tailwind slate-based palette:

| Role | Mockup (Midnight) | Spec (Neutral) | Visual effect |
|------|-------------------|-----------------|---------------|
| Page | `#0f172a` (slate-900) | N/A (cards don't own page) | Deep navy vs unspecified |
| Card/tile surface | `#1e293b` (slate-800) | `rgba(44,44,46,0.90)` | Blue-gray vs neutral gray |
| Glass tint | `rgba(30,41,59,0.6)` | `rgba(30,41,59,0.60)` (parity lock) | Match ✓ |
| Primary text | `#f8fafc` (slate-50) | `#F5F5F7` | Warmer vs cooler white |
| Muted text | `#94a3b8` (slate-400) | `rgba(245,245,247,0.35)` | Blue-tinted vs neutral opacity |
| Amber accent | `#fbbf24` (amber-400) | `#E8961E` | Bright warm gold vs muted amber |

The midnight palette creates a warmer, more premium feeling. The amber-on-navy contrast is higher and more visually striking than amber-on-gray.

---

## 9. Concentricity Analysis

The mockup follows the concentricity principle (spec §1.3) with its own radius set:

```
Section container (parent): 32px radius, 20px padding (= 10px effective gap to tile edge)
Tile (child):               22px radius  →  32 − 10 = 22 ✓
Icon wrap (in tile):        16px radius  →  ~22 − 6 gap ≈ 16 ✓
Progress bar:               99px radius  →  capsule, intentionally oversized
```

The 22px tile radius is mathematically correct for concentricity with a 32px parent at 10px gap. The current spec's 16px tile radius assumes a different gap.

---

## 10. Typography Summary

| Element | Size | Weight | Letter-spacing | Color (on) | Color (off) |
|---------|------|--------|---------------|------------|-------------|
| Section title | 16px | 700 | default | `--text-main` | – |
| Action pill | 13px | 700 | default | `--amber` | – |
| Zone name | 14px | 600 | 0.1px | `--text-main` (inherit) | `--text-sub` |
| Brightness value | 13px | 700 | default | `--amber` | `--text-sub` at 50% opacity |
| Floating pill | 15px | 700 | default | `--amber` | – |

Font stack: `'DM Sans', sans-serif`
Icon font: `'Material Symbols Rounded'`

---

## 11. Shadow Catalog

Every shadow value used, with both modes:

| Name | Light | Dark |
|------|-------|------|
| `--shadow` (tile rest) | `0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08)` | `0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5)` |
| `--shadow-active` (tile lifted) | `0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)` | `0 20px 40px rgba(0,0,0,0.6), 0 4px 15px rgba(0,0,0,0.4)` |
| Section container | `0 8px 40px rgba(0,0,0,0.1)` (same both modes) | |
| Floating pill | `0 10px 30px rgba(0,0,0,0.3)` (same both modes) | |
| Manual dot glow | `0 0 12px rgba(255, 82, 82, 0.6)` (same both modes) | |

**Note:** The mockup leads with the *ambient* (larger) shadow, then the *contact* (smaller) shadow. The spec convention is contact-first. This is cosmetic – CSS renders both layers regardless of declaration order.

---

## 12. Animation & Transition Catalog

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Tile transform (scale) | 0.2s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `.sliding` class add/remove |
| Tile box-shadow | 0.2s | (inherits from shorthand) | `.sliding` class |
| Tile border-color | 0.2s | (inherits from shorthand) | `.on`/`.off`/`.sliding` class |
| Tile opacity | 0.2s | (inherits from shorthand) | State change |
| Tile background-color | 0.3s | (inherits from shorthand) | Theme switch |
| Icon-wrap (all props) | 0.2s | ease | State change |
| Value text color | 0.2s | (inherits) | State change |
| Progress track height | 0.2s | ease | `.sliding` class (4px → 6px) |
| Progress fill width | 0.1s | ease-out | Drag movement (fast tracking) |
| Theme bg/color switch | 0.4s | ease | Theme toggle |

**The springy easing** `cubic-bezier(0.34, 1.56, 0.64, 1)` on tile transform is what gives the scale-up its satisfying "pop." The overshoot parameter (1.56 > 1.0) means the tile briefly exceeds `scale(1.05)` before settling back, creating organic-feeling motion.

---

## 13. Z-Index Stack

| Element | z-index | Context |
|---------|---------|---------|
| Normal tiles | auto (0) | Default stacking |
| Sliding tile | 100 | Above siblings during drag |
| Floating pill | 101 | Above the lifted tile |

---

## 14. Responsive Breakpoints

| Breakpoint | Changes |
|------------|---------|
| Default | `grid-template-columns: repeat(3, 1fr)`, `gap: 10px`, `padding: 20px`, `aspect-ratio: 1/0.95` |
| ≤440px | `gap: 8px`, `padding: 16px`, `aspect-ratio: 1/1.05` (tiles become slightly portrait) |

---

## 15. Data Attributes

| Attribute | On | Values | Purpose |
|-----------|----|--------|---------|
| `data-brightness` | `.l-tile` | `0`–`100` (integer) | Current brightness level, updated during drag |
| `data-manual` | `.l-tile` | `"true"` or absent | Shows manual override dot; set when user drags (not taps) |

---

## 16. Implementation Notes for Claude Code

### What to replicate exactly
1. The 5-element tile anatomy (manual-dot, icon-wrap > icon, name, val, progress-track > progress-fill)
2. The 3-state CSS system (`.off`, `.on`, `.on.sliding`)
3. The floating pill behavior where `.val` repositions absolutely during drag
4. The 6px drag threshold before sliding activates
5. Tap-to-toggle / drag-to-dim duality on the same touch target
6. The springy `cubic-bezier(0.34, 1.56, 0.64, 1)` on tile scale
7. Progress track height animation (4px → 6px during drag)
8. `touch-action: none` + `setPointerCapture` for reliable drag on mobile
9. `overflow: visible` on tiles so the pill can escape bounds
10. The concentricity math: 32px parent − 10px gap = 22px tile

### What needs design decision before implementation
1. **Dark amber:** mockup `#fbbf24` vs spec `#E8961E` – which is canonical?
2. **Dark text:** mockup `#f8fafc` vs spec `#F5F5F7` – which is canonical?
3. **Tile radius:** mockup 22px vs spec 16px – if parent is 32px at 10px gap, concentricity says 22px
4. **Tile background:** mockup opaque `#ffffff`/`#1e293b` vs spec semi-transparent `rgba(255,255,255,0.92)`
5. **Column count:** user prefers more columns, fewer rows – what's the target? (3 cols? 4 cols? Configurable?)

### What the mockup does NOT cover (must come from spec or other cards)
- `getConfigForm()` editor schema
- `hass-more-info` event dispatch
- ARIA labels, `role`, `tabindex`, keyboard navigation
- `prefers-reduced-motion` media query
- Glass stroke `::before` pseudo-element
- Dark mode detection via `this.hass.themes.darkMode`
- Custom element registration guards
- Font injection into Shadow DOM
- Responsive behavior below 320px

---

*Extracted from `Dashboard/Tunet/lighting-section-mockup-polish.html` on 2026-02-20*
