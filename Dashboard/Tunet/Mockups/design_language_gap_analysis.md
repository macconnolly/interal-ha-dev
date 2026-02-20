# Design Language v8.0 – Gap Analysis

**Audit date:** 2026-02-20
**Document audited:** `design_language.md` v8.0 (1374 lines, 20 sections)
**Cross-referenced against:**
- `tunet-overview-dashboard.html` – comprehensive mockup with all card types
- `tunet-new-cards-v3.html` – scenes, actions, status, lighting cards
- `tunet-sonos-card-v2.html` – dedicated Sonos/media mockup
- `living_card_mockup.html` – drag-to-dim prototype
- `living_scrollable_alt.html` – scrollable lighting variant
- All 10 card JS implementations in `Cards/`

**Purpose:** Identify every token, component pattern, interaction behavior, and layout rule that exists in mockups and/or card implementations but is NOT documented in `design_language.md` v8.0. The goal is 100% coverage so any card can be built from the spec alone with full uniformity.

---

## Executive Summary

design_language.md v8.0 is strong on shared shell patterns (~75% coverage): card surface, header pattern, slider, dropdown, typography, shadows, accent system, and editor pattern are all well-documented. The gaps fall into four categories:

1. **Missing tokens** – 6 token families used across multiple cards but absent from §2
2. **Missing component patterns** – 12 card-content patterns with no spec (scene chips, action chips, status tiles, lighting tiles, media transport, room capsules, weather tiles, sensor displays)
3. **Missing interaction behaviors** – 10 interaction patterns that exist in mockups/implementations but have no documented spec
4. **Missing layout patterns** – 4 structural patterns (section containers, grid layouts, scroll patterns, responsive breakpoints)

Without these additions, each card developer must reverse-engineer behavior from mockups or existing cards, which is the root cause of the token drift already visible across the 10 card JS files.

---

## 1. Missing Tokens

### 1.1 Red Accent (CRITICAL – used in 4+ cards)

The red accent triplet is used in `tunet-overview-dashboard.html`, `tunet-new-cards-v3.html`, `tunet_scenes_card.js`, and `tunet_sensor_card.js`, but is completely absent from §2 Token System.

**Values found in mockups:**

| Token | Light | Dark |
|-------|-------|------|
| `--red` | `#FF3B30` | `#FF453A` |
| `--red-fill` | `rgba(255,59,48, 0.10)` | `rgba(255,69,58, 0.14)` |
| `--red-border` | `rgba(255,59,48, 0.22)` | `rgba(255,69,58, 0.25)` |
| `--red-glow` | `rgba(255,59,48, 0.40)` | `rgba(255,69,58, 0.45)` |

**Where used:** Manual override dots (lighting card), error/alert states (sensor card), scene accent option, status tile alert variant.

**Recommendation:** Add to §2.1 and §2.2 token blocks. Add to §2.4 accent assignment table with domain assignment (e.g., `Error / alert / override → --red`). The `--red-glow` token is unique – no other accent has a `-glow` variant. Either add `-glow` to all accents or document it as a red-only exception.

### 1.2 Tile Background Off State

| Token | Light | Dark |
|-------|-------|------|
| `--tile-bg-off` | `rgba(28,28,30, 0.04)` | `rgba(255,255,255, 0.04)` |

**Where used:** Lighting zone tiles in "off" state (overview-dashboard, v3 mockup, `tunet_lighting_card.js`). Distinguished from `--tile-bg` which is for active/on tiles.

**Recommendation:** Add to §2.1/§2.2 and reference in a new §3.5a "Tile Off State" or extend existing §3.5.

### 1.3 Ghost / Structural Tokens

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--gray-ghost` | `rgba(0,0,0, 0.035)` | `rgba(255,255,255, 0.04)` | Extremely subtle separator/background |
| `--border-ghost` | `transparent` | `transparent` | Placeholder border for layout stability |
| `--parent-bg` | `rgba(255,255,255, 0.35)` | `rgba(30,30,32, 0.50)` | Section container background |
| `--shadow-section` | `0 8px 40px rgba(0,0,0, 0.10)` | `0 8px 40px rgba(0,0,0, 0.30)` | Section-level shadow |
| `--r-section` | `38px` | `38px` | Section container radius |

**Where used:** `tunet-overview-dashboard.html` section containers wrapping groups of cards. Also `--gray-ghost` in rooms card and sensor card for subtle dividers.

**Recommendation:** Add all to §2.1/§2.2. Add `--r-section` to the radii block. Document the section container as a new surface in §3 (see §3 gap below).

### 1.4 Scroll/Pagination Tokens

Found in `living_scrollable_alt.html`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--dot-active` | accent color | Active pagination dot |
| `--dot-inactive` | `rgba(0,0,0, 0.15)` / `rgba(255,255,255, 0.15)` | Inactive pagination dot |

**Recommendation:** Add if scroll-based card layouts are planned. Otherwise note as deprecated.

### 1.5 Media-Specific Tokens

Found in `tunet-overview-dashboard.html` and `tunet_media_card.js`:

| Token | Value | Purpose |
|-------|-------|---------|
| `--progress-bg` | `rgba(0,0,0, 0.08)` / `rgba(255,255,255, 0.08)` | Media progress bar track |
| `--progress-fill` | accent color at 0.6 opacity | Progress bar fill |

**Recommendation:** These could be derived from existing track tokens. Document whether media cards should reuse `--track-bg` for progress bars or define dedicated tokens.

### 1.6 Token Drift Across Card Files

Every card JS file defines its own complete token block in `:host` and `:host(.dark)`. Values have **already drifted** from design_language.md v8.0:

| Token | design_language.md v8.0 | tunet_actions_card.js | tunet_scenes_card.js | tunet_climate_card.js |
|-------|------------------------|-----------------------|----------------------|-----------------------|
| `--glass` (light) | `rgba(255,255,255, 0.68)` | `rgba(255,255,255, 0.55)` | `rgba(255,255,255, 0.55)` | matches spec |
| `--shadow` (light) | `0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10)` | `0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)` | `0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)` | matches spec |
| `--amber` (dark) | `#E8961E` | `#F0A030` | `#F0A030` | matches spec |
| `--text-sub` (dark) | `rgba(245,245,247, 0.50)` | `rgba(245,245,247, 0.55)` | `rgba(245,245,247, 0.55)` | matches spec |

**Impact:** Actions and scenes cards use notably weaker shadows and lower glass opacity than the spec defines. This means they look visually different from the climate card (which matches the spec) even when sitting side-by-side on the dashboard.

**Recommendation:** Add a prominent "token compliance" note in §0 or §14 emphasizing that cards must copy tokens exactly from this document. Consider publishing tokens as a shared JS module that cards import rather than duplicate.

---

## 2. Missing Component Patterns

### 2.1 Scene Chip

**Found in:** overview-dashboard lines 738-756, v3 mockup lines 155-182, `tunet_scenes_card.js`

A standalone pill-shaped button for activating HA scenes. NOT the same as the §3.7 "Chip Surface" – scene chips are larger, have icons, and are interactive action triggers rather than informational badges.

**Specification needed:**
```
Surface: pill-shaped (border-radius: var(--r-pill))
Background: var(--glass) with backdrop-filter: blur(20px)
Border: 1px solid var(--glass-border)
Shadow: var(--shadow)
Padding: 10px 16px
Font: 13px / 600
Icon: 16px filled, accent-colored
Gap: 6px (icon to label)
Layout: flex row, flex-wrap: wrap, gap: 8px between chips
```

**States:**
- Idle: glass surface, icon colored by `data-accent`, label `--text`
- Active (momentary, 1200ms): `background: var(--{accent}-fill)`, `border-color: var(--{accent}-border)`, `color: var(--{accent})`
- Hover: `box-shadow: var(--shadow-up)`
- Press: `transform: scale(.96)`

**Behavior:** Tap calls `scene.turn_on` or `script.turn_on`. Active state is a temporary flash (1200ms), NOT a persistent toggle. No mutual exclusion between chips.

### 2.2 Action Chip (In-Card)

**Found in:** v3 mockup lines 186-205, `tunet_actions_card.js`

Action chips inside a card shell. Different from scene chips – they use tile-level surfaces, have state reflection from entities, and support persistent active states.

**Specification needed:**
```
Surface: rounded rectangle (border-radius: var(--r-tile))
Background: var(--tile-bg)
Shadow: var(--shadow)
Padding: 10px 4px
Font: 11px / 600 (10px at ≤440px)
Icon: 18px outlined (16px at ≤440px), color: var(--text-muted)
Gap: 6px (icon to label, 4px at ≤440px)
Color: var(--text-sub)
Layout: flex: 1 (equal width), flex row, gap: 8px
Border: 1px solid transparent
```

**States:**
- Idle: tile surface, icon muted, label `--text-sub`
- Active (persistent, entity-driven): `border-color: var(--{accent}-border)`, `color: var(--{accent})`, `font-weight: 700`, icon filled + accent-colored
- Hover: `box-shadow: var(--shadow-up)`
- Press: `transform: scale(.96)`

**Behavior:** Tap calls configured service. Active state reflects `state_entity` matching `active_when` value. Per-chip accent via `data-accent` attribute. Active state persists as long as entity state matches.

### 2.3 Status Tile System

**Found in:** v3 mockup lines 208-290, overview-dashboard lines 292-321, `tunet_status_card.js`

A grid of small tiles showing system status information with typed variants.

**Specification needed:**
```
Grid: display: grid, grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)), gap: 10px
Tile base: padding: 14px, border-radius: var(--r-tile), background: var(--tile-bg), box-shadow: var(--shadow)
```

**Tile types:**

| Type | Content | Special behavior |
|------|---------|-----------------|
| `indicator` | Icon + label + value | Status dot (6px circle, positioned top-right: top:10px, right:10px) |
| `timer` | Icon + label + countdown | Real-time tick, auto-hides when timer expires |
| `value` | Icon + label + numeric value | Updates reactively from entity state |
| `dropdown` | Icon + label + selected value + chevron | Opens center-anchored dropdown menu |

**Status dot spec:**
```
width: 6px, height: 6px
border-radius: 999px
position: absolute, top: 10px, right: 10px
Color variants: .green (var(--green)), .amber (var(--amber)), .blue (var(--blue)), .red (var(--red))
```

**Tile-level dropdown:**
```
Position: absolute, left: 50%, transform: translateX(-50%)
Top: calc(100% + 4px)
Anchored to tile center, not tile right
Same surface tokens as §7.1 dropdown
Animation: same menuIn keyframe
```

**Conditional visibility:** Tiles can be hidden via `.tile-hidden { display: none }` class toggled from JS based on entity availability.

### 2.4 Lighting Zone Tile (Drag-to-Dim)

**Found in:** v3 mockup lines 329-382, living_card_mockup.html (full implementation), overview-dashboard lines 326-391, `tunet_lighting_card.js`

The most interaction-heavy component in the system. A tile representing a lighting zone with tap-to-toggle and drag-to-dim.

**Specification needed:**

**Base tile:**
```
padding: 16px
border-radius: var(--r-tile)
background: var(--tile-bg) (on) / var(--tile-bg-off) (off)
box-shadow: var(--shadow)
position: relative
overflow: hidden
cursor: pointer
transition: background .2s, border-color .2s, box-shadow .15s
user-select: none
touch-action: none
-webkit-tap-highlight-color: transparent
```

**Content layout:**
```
Row 1: zone icon (20px) + zone name (15px/600/--text) + value (15px/500/--text-sub)
Row 2 (optional): brightness bar + manual override dot
```

**Brightness bar (sliding state):**
```
height: 4px (idle) → 6px (dragging)
border-radius: var(--r-pill)
background: var(--track-bg)
margin-top: 10px
transition: height .15s ease

Fill: var(--amber) at opacity 0.6-0.8, width = brightness %
Fill border-radius: var(--r-pill)
```

**Manual override dot:**
```
width: 8px, height: 8px
border-radius: 50%
background: var(--red)
box-shadow: 0 0 8px var(--red-glow)
position: absolute (or inline, varies by implementation)
Visible only when zone has manual override active
```

**Floating value pill (during drag):**
```
position: absolute
background: var(--glass)
backdrop-filter: blur(16px)
border: 1px solid var(--glass-border)
border-radius: var(--r-pill)
padding: 4px 10px
font-size: 13px, font-weight: 700
color: var(--amber)
opacity: 0 (hidden) → 1 (visible during drag)
transform: translateY(-8px) during drag
pointer-events: none
transition: opacity .15s, transform .15s
```

**Adaptive pill button:**
```
padding: 4px 10px
border-radius: var(--r-pill)
background: var(--amber-fill)
border: 1px solid var(--amber-border)
font-size: 11px, font-weight: 600
color: var(--amber)
cursor: pointer
transition: all .15s
Tap: resets zone to adaptive
Long-press: fires hass-more-info
```

### 2.5 Drag-to-Dim Interaction (Full Spec)

**Found in:** living_card_mockup.html (complete JS), `tunet_lighting_card.js`

This is the most complex interaction pattern and needs its own subsection in §7.

**Pointer interaction sequence:**
1. `pointerdown` on tile → record start position, capture pointer (`setPointerCapture`)
2. `pointermove` → calculate delta from start position
3. If delta < 6px threshold → still in "tap" zone, no visual change
4. If delta >= 6px → enter "dragging" state:
   - Add `.sliding` class to tile
   - Tile scales to `scale(1.05)` + shadow elevates to `--shadow-up`
   - Brightness bar expands from 4px to 6px height
   - Floating value pill appears (opacity: 0→1, translateY: 0→-8px)
   - Map horizontal pointer movement to brightness value
   - Update pill text in real-time
   - Debounce service calls: 300ms during drag, 1500ms final on release
5. `pointerup`:
   - If never exceeded threshold → treat as tap → toggle light on/off
   - If was dragging → commit final brightness value, release pointer capture
   - Remove `.sliding` class, pill fades, tile returns to rest

**Service call pattern:**
```javascript
// During drag: debounced at 300ms
clearTimeout(this._dragDebounce);
this._dragDebounce = setTimeout(() => {
  this._hass.callService('light', 'turn_on', {
    entity_id: zone.entity,
    brightness_pct: value
  });
}, 300);

// On release: debounced at 1500ms for final commit
clearTimeout(this._releaseDebounce);
this._releaseDebounce = setTimeout(() => {
  this._hass.callService('light', 'turn_on', {
    entity_id: zone.entity,
    brightness_pct: value
  });
}, 1500);
```

### 2.6 Media Card Patterns

**Found in:** overview-dashboard lines 517-648, tunet-sonos-card-v2.html, `tunet_media_card.js`

The media card has multiple unique sub-components not covered anywhere in design_language.md.

**Album art container:**
```
width: 100%, aspect-ratio: 1 / 1 (or fixed height ~200px)
border-radius: var(--r-tile)
overflow: hidden
box-shadow: var(--shadow)
Position: relative (for overlay gradient)
```

**Transport controls:**
```
Layout: flex row, justify-content: center, align-items: center, gap: 16px
Play/pause: 48px circle, accent-filled background, white icon
Skip buttons: 36px, transparent, icon: var(--text-sub)
Press: scale(.94) on all
```

**Progress bar:**
```
height: 3px
border-radius: var(--r-pill)
background: var(--track-bg)
Fill: accent color at 0.6 opacity
Position labels: flex row, justify-content: space-between
Time text: 11px / 600 / var(--text-muted), tabular-nums
```

**Volume slider:** Reuses §7.3 slider pattern but at reduced track height (36px vs 44px).

**View switching (transport ↔ volume):**
```
Two rows that toggle visibility
Animation: crossfade (opacity 0→1, 150ms)
Trigger: tap on volume icon in transport row
```

**Speaker grouping chips:**
```
Pill-shaped, var(--chip-bg), var(--chip-border), var(--chip-sh)
Active speaker: accent-fill + accent-border
Tap: toggles speaker in/out of group
Layout: flex row, flex-wrap: wrap, gap: 6px
```

**Graduated opacity (entity state):**

| State | Card opacity |
|-------|-------------|
| Playing | 1.0 |
| Paused | 0.85 |
| Idle | 0.65 |
| Off | 0.55 |

Note: §8.4 only defines "off" at 0.55. The intermediate states (paused, idle) are undocumented.

### 2.7 Room Capsule Pattern

**Found in:** overview-dashboard lines 652-705, `tunet_rooms_card.js`

A pill-shaped room selector with icon + room name + device count badge.

**Specification needed:**
```
Shape: pill (border-radius: var(--r-pill))
Background: var(--glass) + backdrop-filter: blur(16px)
Border: 1px solid var(--glass-border)
Shadow: var(--shadow)
Padding: 8px 14px
Layout: flex row, align-items: center, gap: 8px
Icon: 18px, var(--text-muted)
Name: 13px / 600 / var(--text)
Badge (device count):
  background: var(--{accent}-fill)
  color: var(--{accent})
  border-radius: var(--r-pill)
  padding: 2px 6px
  font-size: 10px, font-weight: 700
```

**States:**
- Idle: glass surface
- Selected: accent-fill background, accent-border, accent text+icon
- Hover: shadow-up

**Layout:** Horizontal scroll row or flex-wrap grid.

### 2.8 Weather Card Patterns

**Found in:** overview-dashboard lines 707-733, `tunet_weather_card.js`

**Forecast tile:**
```
Layout: flex column, align-items: center, gap: 4px
Background: var(--tile-bg)
Border-radius: var(--r-tile)
Padding: 12px 8px
Day label: 11px / 600 / var(--text-muted)
Icon: weather icon (20px)
Temp high: 15px / 700 / var(--text)
Temp low: 13px / 500 / var(--text-muted)
```

**Detail rows:**
```
Layout: flex row, justify-content: space-between, padding: 8px 0
Left: icon (16px) + label (13px / 600 / var(--text-sub))
Right: value (13px / 600 / var(--text))
Divider between rows: 1px solid var(--divider)
```

### 2.9 Sensor/Data Display Patterns

**Found in:** `tunet_sensor_card.js`

**Sensor value display:**
```
Hero value: 42px / 700 / var(--text), tabular-nums
Unit: 0.6em superscript (per §4.5)
Trend indicator: icon (14px) + small text, accent-colored
  - Rising: var(--red) + arrow_upward
  - Falling: var(--blue) + arrow_downward
  - Stable: var(--text-muted) + remove (dash)
```

**Spark line / mini chart:**
```
height: 40px
SVG path with accent-colored stroke (2px)
No fill, no axes, no labels
Purely decorative trend indicator
```

### 2.10 Section Container

**Found in:** overview-dashboard lines 220-249

A parent wrapper that groups related cards into a visual section on the dashboard.

**Specification needed:**
```
background: var(--parent-bg)
border-radius: var(--r-section)         → 38px
box-shadow: var(--shadow-section)
padding: 20px
display: flex, flex-direction: column, gap: 20px
```

Note: This violates concentricity (§1.3) – cards inside use 24px radius, section uses 38px with 20px gap → child should be 18px, not 24px. Either the section radius should be 44px (24+20) or the card radius inside sections should be 18px. **This inconsistency needs a design decision.**

### 2.11 Layout Grid

**Found in:** overview-dashboard lines 254-264

```
display: grid
grid-template-columns: repeat(2, 1fr)
gap: 20px

Responsive (≤440px):
  grid-template-columns: 1fr
```

### 2.12 Scroll-Based Card Layout

**Found in:** living_scrollable_alt.html

Horizontal scroll grid with snap points and pagination dots:
```
grid-auto-flow: column
scroll-snap-type: x mandatory
overflow-x: auto
-webkit-overflow-scrolling: touch

Pagination dots:
  width: 6px, height: 6px (active: 8px)
  border-radius: 50%
  background: var(--dot-inactive) / var(--dot-active)
  Layout: flex row, justify-content: center, gap: 6px
```

---

## 3. Missing Interaction Behaviors

### 3.1 Tap-to-Toggle on Tiles

**Where:** Lighting tiles, media tiles, room capsules

design_language.md documents tap behavior for header controls (§5) and slider drag (§7.3) but never explicitly defines tap-to-toggle on tiles. The pattern is:
- Tap (pointerdown + pointerup within 6px and <300ms) toggles entity on/off
- Distinguished from drag by threshold (6px) and duration

**Recommendation:** Add to §7 as "§7.5 Tile Tap-to-Toggle."

### 3.2 Long-Press

**Where:** Adaptive pill button (lighting card), tiles (for more-info)

No mention of long-press anywhere in design_language.md. The pattern is:
- Hold >500ms → fires `hass-more-info` event
- Distinguished from tap by duration
- Visual feedback: subtle scale(.98) after 200ms of holding

**Recommendation:** Add to §7 as a universal interaction pattern.

### 3.3 Radio Group Behavior

**Where:** Scene chips (overview-dashboard), room capsules

When one chip activates, the previously active one deactivates. This mutual-exclusion behavior is not documented.

**Recommendation:** Document in the scene chip component spec, noting which components use radio behavior vs. independent toggles.

### 3.4 Timer Countdown

**Where:** Status tiles (timer type)

Real-time countdown display that ticks every second and auto-hides the tile when expired. No spec for:
- Update interval (1s)
- Display format (mm:ss vs. descriptive)
- Expiry behavior (hide tile vs. show "expired")

### 3.5 Graduated Entity Opacity

**Where:** Media card (playing/paused/idle/off)

§8.4 defines off-state opacity (0.55) but not intermediate states. The media card uses four opacity levels. This may apply to other cards too.

**Recommendation:** Extend §8.4 into a general entity-state opacity table applicable across card types.

### 3.6 Service Call Debouncing

**Where:** Lighting card (drag-to-dim), climate card (slider), volume slider

Never mentioned in design_language.md. Critical for preventing API flooding during continuous drag operations.

**Pattern:**
- During drag: 300ms debounce
- On release: 1500ms final commit debounce
- Slider value changes: 200ms debounce

**Recommendation:** Add to §7.3 or a new "§7.6 Service Call Patterns."

### 3.7 Pointer Capture

**Where:** All drag interactions (sliders, drag-to-dim tiles)

`setPointerCapture()` and `releasePointerCapture()` are used to ensure drag continues even when pointer leaves the element boundary. Not mentioned in design_language.md.

**Recommendation:** Add to §18 Shadow DOM Notes or §7.3 slider spec.

### 3.8 Outside-Click Dismiss

**Where:** Dropdown menus, tile dropdowns

§7.1 mentions "click outside the menu wrapper closes it" but doesn't specify the implementation pattern. Cards use varying approaches:
- `document.addEventListener('click', handler)` with remove on close
- `this.shadowRoot.addEventListener('click', handler)` scoped to shadow root
- Event delegation on card wrapper

**Recommendation:** Standardize the pattern in §7.1 with a code example.

### 3.9 Active Flash (Momentary Feedback)

**Where:** Scene chips (1200ms flash), action chips on tap

The temporary active state that shows visual feedback then auto-resets. Different from persistent active state (entity-driven). Not documented.

**Recommendation:** Add as a general interaction pattern. Specify duration (1200ms), easing, and when to use momentary vs. persistent.

### 3.10 Conditional Element Visibility

**Where:** Status tiles (`.tile-hidden`), toggle buttons (§5.6 mentions `display: none`)

The pattern for hiding elements based on entity availability or configuration. Partially covered in §5.6 but not generalized.

**Recommendation:** Add a general "conditional visibility" pattern specifying:
- Class name convention (`.hidden` or `[hidden]`)
- When to hide vs. when to show placeholder
- Transition behavior (instant hide or fade-out)

---

## 4. Specification Gaps in Existing Sections

### 4.1 §2 Token System – Missing from Accent Assignment Table

The §2.4 table does not include:
- **Error / alert / override → `--red`** (used by sensor, lighting override dot, status)
- **Scenes → configurable per-chip** (any accent)
- **Actions → configurable per-chip** (any accent)
- **Rooms → configurable per-room** (any accent)
- **Weather → none / `--blue`** (temperature uses amber for warm, blue for cold)

### 4.2 §3 Surfaces – Missing Surface Types

§3.8 surface hierarchy lists 6 types. Missing:
- **Section container** (parent of cards)
- **Scene chip** (distinct from informational chip)
- **Action chip** (tile-like chip inside card)
- **Brightness bar** (mini track inside tile)
- **Progress bar** (media playback)
- **Album art container**
- **Floating pill** (drag feedback overlay)

### 4.3 §7 Controls – Missing Control Patterns

§7 covers dropdown, checkbox, slider, and toggle switch. Missing:
- **Drag-to-dim** (tile-level drag interaction)
- **Transport controls** (play/pause/skip)
- **Volume control** (reduced-height slider variant)
- **Progress bar** (read-only or scrubbable)
- **Pagination dots** (scroll indicator)
- **Tile dropdown** (center-anchored variant of §7.1)
- **Speaker group selector** (multi-select chip group)

### 4.4 §8 State System – Missing States

§8 covers card container state and header control state. Missing:
- **Tile-level states** (on/off/sliding/manual-override/unavailable)
- **Media entity states** (playing/paused/buffering/idle/off with graduated opacity)
- **Timer states** (running/expired/hidden)
- **Scene chip states** (idle/momentary-active)
- **Connection states** (available/unavailable/unknown)

### 4.5 §10 Animation – Missing Animations

§10 covers menu entrance, fan spin, and reduced motion. Missing:
- **Tile slide activation** (scale 1→1.05, 150ms ease)
- **Floating pill appear** (opacity 0→1 + translateY 0→-8px, 150ms)
- **Bar height expansion** (4px→6px during drag, 150ms)
- **Active flash fade** (1200ms: instant activate → gradual fade to idle)
- **Progress bar fill animation** (continuous update, no transition)
- **View switch crossfade** (media transport ↔ volume, opacity 150ms)
- **Spinner** (for loading states, not currently in any mockup but likely needed)

### 4.6 §11 Accessibility – Missing ARIA for New Components

- Scene chips: `role="button"`, `aria-label`
- Action chips: `role="button"`, `aria-pressed` for toggle-able chips
- Lighting tiles: `role="slider"` for drag-to-dim (or `role="button"` for tap-only?)
- Status dot: `aria-label` for screen reader (color alone is insufficient)
- Timer: `aria-live="polite"` for countdown updates
- Room capsules: `role="radio"` + `aria-checked` for radio group behavior

### 4.7 §16 Spacing – Missing Spacing Constants

| Between | Gap | Source |
|---------|-----|--------|
| Scene chips | 8px | v3 mockup, overview-dashboard |
| Action chips | 8px | v3 mockup, actions_card.js |
| Status tile grid | 10px | v3 mockup |
| Lighting zone tiles | 10px | overview-dashboard |
| Room capsules | 8px | overview-dashboard |
| Forecast tiles | 8px | overview-dashboard |
| Section container internal padding | 20px | overview-dashboard |
| Section container → section container | 20px | overview-dashboard |
| Transport control buttons | 16px | overview-dashboard |
| Speaker group chips | 6px | overview-dashboard |
| Brightness bar margin-top (from zone label row) | 10px | v3 mockup |
| Floating pill offset above tile | -8px (translateY) | living_card_mockup |

---

## 5. Recommended Document Structure Updates

To achieve 100% coverage, design_language.md needs these structural additions:

### New Sections to Add

| Section | Title | Content |
|---------|-------|---------|
| §3.9 | Section Container Surface | Background, radius, shadow, padding, dark variant |
| §3.10 | Brightness Bar Surface | Mini-track for tile-level brightness display |
| §3.11 | Progress Bar Surface | Media playback indicator |
| §3.12 | Floating Overlay Surface | Drag feedback pills, tooltips |
| §7.5 | Drag-to-Dim | Full pointer interaction spec, thresholds, debouncing |
| §7.6 | Transport Controls | Play/pause/skip sizing, layout, states |
| §7.7 | Progress Bar | Height, fill behavior, scrub interaction |
| §7.8 | Tile Tap-to-Toggle | Threshold, duration, service call pattern |
| §7.9 | Long-Press | Duration, visual feedback, more-info dispatch |
| §7.10 | Service Call Debouncing | Debounce intervals per interaction type |
| §20 | Component Catalog | Per-component specs referencing tokens and patterns above |
| §20.1 | Scene Chip | Full spec (currently §2.1 in this document) |
| §20.2 | Action Chip | Full spec |
| §20.3 | Status Tile | Full spec with typed variants |
| §20.4 | Lighting Zone Tile | Full spec with drag-to-dim |
| §20.5 | Media Transport | Full spec |
| §20.6 | Room Capsule | Full spec |
| §20.7 | Weather Forecast Tile | Full spec |
| §20.8 | Sensor Display | Full spec |

### Existing Sections to Extend

| Section | Addition |
|---------|----------|
| §2.1/§2.2 | Add red accent triplet + glow token |
| §2.1/§2.2 | Add `--tile-bg-off`, `--gray-ghost`, `--border-ghost`, `--parent-bg`, `--shadow-section`, `--r-section` |
| §2.4 | Add red, scene, action, room, weather domain assignments |
| §3.5 | Add tile off-state variant (`--tile-bg-off`) |
| §8.4 | Expand to graduated opacity table (playing/paused/idle/off) |
| §10.1 | Add animation entries for tile slide, pill appear, bar expand, active flash |
| §10.2 | Add scale values for tile drag (1.05), room capsule press |
| §11.2 | Add ARIA for scene chips, action chips, tiles, status dots, timers |
| §16 | Add spacing for all new components |

---

## 6. Priority Ranking

### P0 – Must Fix Before Next Card Build
1. **Red accent tokens** – multiple cards already use them, creating undefined behavior
2. **Tile-bg-off token** – lighting card needs this for on/off visual distinction
3. **Drag-to-dim interaction spec** – most complex interaction, highest variance between implementations
4. **Token drift audit** – existing cards already diverge from spec values

### P1 – Required for Dashboard Uniformity
5. Scene chip component spec
6. Action chip component spec
7. Status tile system spec
8. Lighting zone tile spec
9. Service call debouncing pattern
10. Graduated entity opacity table

### P2 – Required for Complete Coverage
11. Media card sub-components
12. Room capsule pattern
13. Weather card patterns
14. Section container surface
15. Layout grid pattern
16. Long-press interaction pattern
17. Conditional visibility pattern
18. All missing ARIA requirements
19. All missing spacing constants

### P3 – Nice to Have
20. Scroll-based layout with pagination dots
21. Sensor/data display patterns
22. Shared token module recommendation (eliminate drift at the source)
