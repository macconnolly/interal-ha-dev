# Dashboard Navigation & Architecture Research

**Date**: 2026-03-01
**Purpose**: Structured research findings for the Tunet Dashboard navigation bar selection and overall dashboard architecture. Intended as input for ongoing development sessions.

---

## TABLE OF CONTENTS

1. [Key Research Questions](#1-key-research-questions)
2. [Current Architecture Constraints](#2-current-architecture-constraints)
3. [Navigation Bar Options — Comparison Matrix](#3-navigation-bar-options)
4. [Deep Dive: Navbar Card](#4-navbar-card)
5. [Deep Dive: Bubble Card Sub-Buttons](#5-bubble-card-sub-buttons)
6. [Deep Dive: Custom-Built Navigation](#6-custom-built-navigation)
7. [Other Community Navigation Approaches](#7-other-community-approaches)
8. [Dashboard Structure — Architectural Options](#8-dashboard-structure)
9. [Popup Strategy](#9-popup-strategy)
10. [UX Design Principles — Applied Standards](#10-ux-design-principles)
11. [Sections Layout Integration](#11-sections-layout-integration)
12. [Open Decisions Requiring User Input](#12-open-decisions)
13. [Recommended Next Steps](#13-recommended-next-steps)

---

## 1. KEY RESEARCH QUESTIONS

These are the structured questions extracted from the initial brief, with status:

### Navigation Bar
| # | Question | Status |
|---|----------|--------|
| N1 | What are the best modern HACS cards for dashboard navigation? | RESEARCHED — see §3-7 |
| N2 | Should we use Navbar Card, Bubble Card sub-buttons, or build our own? | DECISION NEEDED — see §12 |
| N3 | How do we handle mobile (bottom bar) vs desktop (side rail) responsiveness? | RESEARCHED — see §10.5 |
| N4 | How many nav items? What goes in the nav bar vs elsewhere? | DECISION NEEDED — see §12 |
| N5 | Should the nav bar include a media player widget? | DECISION NEEDED — see §12 |

### Dashboard Structure
| # | Question | Status |
|---|----------|--------|
| S1 | Single YAML page vs multi-view vs hybrid? | RESEARCHED — see §8 |
| S2 | Storage mode vs YAML mode vs hybrid? | RESEARCHED — see §8.2 |
| S3 | How do popups interact with the navigation structure? | RESEARCHED — see §9 |
| S4 | How do the V2 JS cards work with Sections layout? | RESEARCHED — see §11 |
| S5 | Can we use `!include` with storage dashboards? | ANSWERED: No. See §8.2 |
| S6 | What's the optimal tap-count hierarchy for actions? | RESEARCHED — see §10.3 |

### Design Principles
| # | Question | Status |
|---|----------|--------|
| D1 | What interaction models do Apple/Google use? | RESEARCHED — see §10.1-10.2 |
| D2 | Room-first vs function-first vs favorites-first organization? | RESEARCHED — see §10.4 |
| D3 | How should popups look and behave (iOS-style swipe-to-dismiss)? | RESEARCHED — see §9, §10.3 |
| D4 | Progressive disclosure patterns for quick vs buried actions? | RESEARCHED — see §10.3 |

### Rules & Constraints
| # | Rule | Source |
|---|------|--------|
| R1 | Browser mod popup is the popup system (already styled, iOS-like) | User brief |
| R2 | V2 cards are vanilla JS, no frameworks, no build tools | Codebase analysis |
| R3 | Dark mode locked to midnight navy `rgba(30,41,59,0.72)` | design_language.md v8.4 |
| R4 | UI editor access is desired (storage mode preference) | User brief |
| R5 | Apple/Google level polish is the standard | User brief |
| R6 | Every interaction must be deliberate — tap count matters | User brief |
| R7 | Bubble Card is already installed (latest version) | User brief |
| R8 | Kiosk mode will be needed regardless of nav choice | Community consensus |

---

## 2. CURRENT ARCHITECTURE CONSTRAINTS

### V2 Card Architecture (from codebase analysis)

```
Dashboard/Tunet/Cards/
├── 13 self-contained vanilla JS custom elements
├── No frameworks, no build tools, no module imports
├── Each card: Shadow DOM, inline CSS, idempotent registration
├── Loaded via /local/tunet/*.js with version cache-busting
├── Dark mode via .dark class on :host
├── Navigation via native HA navigate action + more-info events
├── No browser_mod dependency currently
├── No Bubble Card dependency currently
└── Custom dropdown popups in status card (not browser_mod)
```

### Key Files
| File | Purpose |
|------|---------|
| `tunet-overview-config.yaml` | Dashboard composition — card ordering, config |
| `design_language.md` v8.4 | Canonical design spec — tokens, rules, patterns |
| `tunet_climate_card.js` | Gold standard reference (1634 lines) |
| `tunet_rooms_card.js` | Room navigation — already uses `navigate_path` |

### Card Registration Pattern
```javascript
// All 13 cards use this exact pattern
if (!customElements.get('tunet-xxx-card')) {
  customElements.define('tunet-xxx-card', TunetXxxCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-xxx-card')) {
  window.customCards.push({ type: 'tunet-xxx-card', name: '...', description: '...' });
}
```

### Current Navigation Flow
```
tunet_rooms_card tiles → tap_action: navigate → /tunet-overview/{room-name}
tunet_status_card tiles → tap_action: navigate or more-info
tunet_actions_card chips → tap_action: call-service
```

---

## 3. NAVIGATION BAR OPTIONS — COMPARISON MATRIX

### Top 3 Contenders

| Feature | Navbar Card | Bubble Card Sub-Buttons | Custom-Built (Tunet Nav) |
|---------|-------------|------------------------|--------------------------|
| **GitHub Stars** | 777 | 4,000 (whole ecosystem) | N/A |
| **Mobile bottom bar** | Native | Native (`footer_mode`) | Must build |
| **Desktop side rail** | Native | No — same footer on both | Must build |
| **Responsive transition** | Automatic at breakpoint | Manual CSS only | Full control |
| **CSS customization** | Exposed classes + variables | Built-in styles + JS templates | Total control |
| **Media player widget** | Yes (BETA, single entity) | No built-in | Must build |
| **Entity-aware buttons** | No | Yes (light state colors) | Can build |
| **Active route highlight** | Yes (breaks with browser_mod) | Legacy only (h-b-stack) | Can build |
| **Popup integration** | Routes to views (not popups) | Tightly coupled to BC popups | Can work with browser_mod |
| **Sections layout** | Primary supported layout | N/A (single-view paradigm) | Compatible |
| **Visual editor** | Yes (some quirks) | Yes | Via `getConfigForm()` |
| **Auto-order by occupancy** | No | Yes (h-b-stack only) | Can build |
| **Badge support** | Yes (dynamic, JSTemplate) | Per sub-button | Can build |
| **Maintenance risk** | Medium (1 developer) | Low (large community) | None (we own it) |
| **Browser_mod compat** | Active route breaks | Pop-ups conflict | Full compatibility |
| **Learning curve** | Low | Medium (full ecosystem) | High (build cost) |
| **Matches design system** | Requires CSS overrides | Requires CSS overrides | Native match |

### Other Notable Options (Tier 2-3)
| Solution | Stars | Best For | Why Not Primary |
|----------|-------|----------|-----------------|
| **Kiosk Mode** | 667 | Hiding native chrome | Companion tool, not navigation itself |
| **Swipe Navigation** | 528 | Gesture nav between views | No visual affordance, gesture-only |
| **Mushroom Chips** | Very popular | Lightweight chip row | Requires card-mod for sticky, no responsive |
| **DBuit Sidebar** | 490 | Tablet/desktop sidebar | Poor on mobile, WIP status |
| **Sections to Tabs** | Brand new | Converting sections to mobile tabs | Too new, limited testing |
| **Adaptive Mushroom** | Template | Full responsive template | Complex deps, older |

---

## 4. DEEP DIVE: NAVBAR CARD

**Repo**: github.com/joseluis9595/lovelace-navbar-card | **v1.4.0** (Feb 2026)

### Strengths for Tunet
- Only card that truly transitions bottom bar → side rail responsively
- Clean Material Design 3 aesthetic that could complement Tunet design system
- Popup sub-menus on routes (via `open-popup` action)
- Badge indicators with JSTemplate for dynamic state
- Haptic feedback support
- Auto-padding system (prevents content overlap)

### Concerns for Tunet
1. **Sections layout only** — masonry and other layouts have broken behavior
2. **Active route highlighting breaks with browser_mod** — if navigation is triggered externally (e.g., browser_mod popup opening), the navbar doesn't know about it
3. **Auto-padding bugs** — recurring issues across versions (#255, #262, #281)
4. **iOS button flash** — route buttons flash before navigating (#278)
5. **Media player BETA** — single entity only, no multi-speaker support, auto-padding broken when media player appears
6. **Cannot style to match Tunet tokens** deeply — CSS variables exist but may not cover everything

### Configuration Example
```yaml
type: custom:navbar-card
routes:
  - url: /tunet-overview/home
    icon: mdi:home
    label: Home
  - url: /tunet-overview/rooms
    icon: mdi:floor-plan
    label: Rooms
    popup:
      - url: /tunet-overview/living-room
        icon: mdi:sofa
        label: Living Room
      - url: /tunet-overview/bedroom
        icon: mdi:bed
        label: Bedroom
  - url: /tunet-overview/media
    icon: mdi:speaker
    label: Media
  - url: /tunet-overview/settings
    icon: mdi:cog
    label: Settings
desktop:
  mode: floating
  position: left
  min_width: 768
mobile:
  mode: docked
media_player:
  entity: media_player.living_room
  album_cover_background: true
styles: |
  .navbar {
    --navbar-background-color: rgba(30, 41, 59, 0.72);
    --navbar-primary-color: #fbbf24;
    backdrop-filter: blur(20px);
  }
```

---

## 5. DEEP DIVE: BUBBLE CARD SUB-BUTTONS

**Repo**: github.com/Clooos/Bubble-Card | **v3.1.1** (Feb 2026)

### Strengths for Tunet
- Native `footer_mode: true` — no card-mod needed for bottom positioning
- Entity-aware buttons can reflect light states
- PIR-based auto-ordering (rooms reorder by occupancy) — unique feature
- Extensive built-in styling (CSS variables, JS templates, modules)
- Already installed in the user's setup
- Full visual editor support
- Massive community (4,000 stars)

### Concerns for Tunet
1. **All-in architecture** — Bubble Card nav is designed to work with Bubble Card popups (hash-based, single-view). Using it with browser_mod popups means fighting the design intent.
2. **No mobile/desktop adaptive layout** — shows the same footer on both. No side rail on desktop.
3. **Single-column layout bug** on desktop (#336)
4. **No `highlight_current_view`** on the new sub-buttons card (only on legacy h-b-stack)
5. **Hash-based navigation** conflicts with browser_mod and multi-view approaches
6. **Pop-up content flash** on page load (requires fix module)
7. **Bubble Card Tools** is an additional HACS dependency for modules

### Configuration Example (Sub-Buttons Footer)
```yaml
type: custom:bubble-card
card_type: sub-buttons
footer_mode: true
footer_full_width: true
styles: |
  .bubble-sub-button-container {
    background: rgba(30, 41, 59, 0.72);
    backdrop-filter: blur(20px);
    border-radius: 0;
  }
sub_button:
  bottom:
    - name: Home
      icon: mdi:home
      tap_action:
        action: navigate
        navigation_path: /tunet-overview
    - name: Rooms
      icon: mdi:floor-plan
      tap_action:
        action: navigate
        navigation_path: /tunet-overview/rooms
    - name: Media
      icon: mdi:speaker
      tap_action:
        action: navigate
        navigation_path: /tunet-overview/media
    - name: Settings
      icon: mdi:cog
      tap_action:
        action: navigate
        navigation_path: /tunet-overview/settings
```

---

## 6. DEEP DIVE: CUSTOM-BUILT NAVIGATION

### Why Consider Building Our Own

The Tunet card suite already includes 13 self-contained vanilla JS cards. A `tunet-nav-card` would:
- Match the design system perfectly (same tokens, same glass effects, same typography)
- Integrate natively with browser_mod popups (no compatibility issues)
- Support responsive bottom-bar → side-rail transition (designed for it)
- Include built-in media player mini-widget (multi-speaker aware)
- Support entity-aware buttons, badges, occupancy reordering
- Have zero external dependencies
- Be fully version-controlled with the rest of the suite

### What We'd Need to Build
```
tunet_nav_card.js
├── Bottom bar mode (mobile < 768px)
│   ├── Fixed bottom positioning
│   ├── 3-5 nav items with icons + labels
│   ├── Active state highlighting
│   ├── Badge indicators (dynamic)
│   └── Swipe-up gesture for media mini-player
├── Side rail mode (desktop >= 768px)
│   ├── Vertical left-side strip
│   ├── Same nav items, vertical layout
│   ├── Expandable on hover (labels appear)
│   └── Optional FAB (floating action button)
├── Media mini-player
│   ├── Multi-speaker aware (Sonos group support)
│   ├── Pagination buttons (< >) to cycle between speakers (not swipe)
│   ├── Album art, title/artist, play/pause, speaker name
│   ├── Dismissible (swipe down or close) and reopenable (tap Media nav item)
│   ├── Compact height (~48-56px) in nav bar area
│   └── Tap to expand → browser_mod popup with full Sonos control
├── Responsive transition
│   ├── CSS media query at configurable breakpoint
│   └── Cross-fade animation between modes
└── Integration
    ├── navigate action for view changes
    ├── browser_mod.popup for overlay content
    ├── Entity-aware (reflect light states, etc.)
    └── getGridOptions() for Sections layout
```

### Estimated Complexity
- **Lines of code**: ~800-1200 (comparable to tunet_rooms_card at 1188)
- **Effort**: Significant but well within the established card-building pattern
- **Risk**: Low — the pattern is proven across 13 cards
- **Maintenance**: Owned entirely by us — no dependency on external developers

### Trade-offs
| Pro | Con |
|-----|-----|
| Perfect design system match | Build cost (800-1200 lines) |
| Zero external dependencies | Must handle edge cases ourselves |
| Full browser_mod compatibility | No community improvements/fixes |
| Multi-speaker media player | Must maintain ourselves |
| Responsive side rail + bottom bar | Responsive CSS is non-trivial |
| Full control over every pixel | We are responsible for every pixel |

---

## 7. OTHER COMMUNITY APPROACHES

### Commonly Used Patterns (from Reddit/community research)

**Pattern 1: Kiosk Mode + Bubble Card** (most popular)
- Hide native chrome with Kiosk Mode
- Bubble Card h-b-stack as bottom nav
- Bubble Card pop-ups for room content
- Single-view architecture
- *Conflict*: Uses Bubble Card popups, not browser_mod

**Pattern 2: Kiosk Mode + Navbar Card + Mushroom** (growing fast)
- Hide native chrome with Kiosk Mode
- Navbar Card for responsive bottom/side nav
- Mushroom cards for content
- Multi-view architecture with subviews
- *Compatible*: Works with browser_mod popups

**Pattern 3: Kiosk Mode + Mushroom Chips (sticky)** (common DIY)
- Hide native chrome
- Mushroom Chips card with card-mod CSS for fixed positioning
- Fragile — breaks with HA updates
- *Not recommended*: Too fragile for a polish-focused dashboard

**Pattern 4: Swipe Navigation + minimal header** (gesture-focused)
- Swipe between views
- No visible nav bar (gesture-only)
- Good for tablets, poor for phone discoverability
- *Not recommended*: Violates UX principle that gestures must have visible alternatives

**Pattern 5: Native HA tabs (bottom-positioned via ha-navbar-position)** (minimal)
- Move native tabs to bottom with ha-navbar-position plugin
- No pop-ups, no custom styling
- *Not recommended*: Too limited for the design ambition

### Essential Companion Tools (needed regardless of nav choice)
| Tool | Purpose | Stars |
|------|---------|-------|
| **Kiosk Mode** | Hide native HA chrome | 667 |
| **card-mod** | CSS injection for any card | Essential |
| **browser_mod** | Popup system, per-browser control | Essential |

---

## 8. DASHBOARD STRUCTURE — ARCHITECTURAL OPTIONS

### 8.1 Three Structural Patterns

#### OPTION A: Multi-View + Subviews (Traditional)
```
Dashboard (YAML mode)
├── View: Overview (type: sections)
│   ├── Section: Quick Actions (tunet-actions-card)
│   ├── Section: Status Grid (tunet-status-card)
│   ├── Section: Lighting (tunet-lighting-card)
│   ├── Section: Environment (climate + weather)
│   ├── Section: Media (tunet-media-card)
│   └── Section: Rooms (tunet-rooms-card → navigate to subviews)
├── Subview: Living Room (back_path: /tunet-overview)
│   ├── Room lights, scenes, speakers
│   └── Entity taps → browser_mod popup for detail
├── Subview: Kitchen (back_path: /tunet-overview)
├── Subview: Bedroom (back_path: /tunet-overview)
└── Nav Bar: persistent across all views
```

| Pro | Con |
|-----|-----|
| Clean separation of concerns | Full page navigation flash between views |
| Native back button on subviews | All views load together anyway (no perf benefit) |
| Works with Sections layout | Need to ensure nav bar appears on every view |
| Compatible with browser_mod popups | More YAML to maintain |
| Natural for the existing rooms card flow | |

#### OPTION B: Single View + Browser Mod Popups (App-Like)
```
Dashboard (YAML or storage)
├── View: Everything (type: sections)
│   ├── All overview cards visible
│   ├── Room tiles → browser_mod.popup with detailed cards
│   ├── Entity taps → browser_mod.popup for control
│   └── Quick actions → inline or popup
└── Nav Bar: persistent (but fewer destinations since everything is here)
```

| Pro | Con |
|-----|-----|
| No page navigation — instant popups | All card DOM exists on one page |
| Feels most "app-like" | Can become complex with many popups |
| browser_mod popups already styled | Nav bar has fewer destinations (mostly popup triggers) |
| Simplest mental model | Performance risk with many entities |

#### OPTION C: Hybrid — Overview + Subviews + Popups (Recommended Investigation)
```
Dashboard (YAML mode)
├── View: Overview (type: sections)
│   ├── Quick Actions → call-service (inline)
│   ├── Status tiles → browser_mod popup (expanded detail)
│   ├── Lighting hero → browser_mod popup (per-zone control)
│   ├── Environment → more-info (native)
│   ├── Media → browser_mod popup (full Sonos control)
│   └── Rooms → navigate to subviews
├── Subview: Living Room
│   ├── Full room control (lights, speakers, scenes)
│   ├── Per-entity → browser_mod popup
│   └── Back button → overview
├── Subview: Kitchen, Bedroom, etc.
└── Nav Bar: Home | Rooms | Media | Settings
     ├── Home → overview
     ├── Rooms → popup with room grid, tapping room → subview
     ├── Media → popup with speaker grid
     └── Settings → subview or popup
```

| Pro | Con |
|-----|-----|
| Most flexible — right tool for each content type | Most complex to plan |
| Quick actions stay instant (overview) | Mixed navigation model (navigate + popup) |
| Detailed rooms get full subview space | Need clear UX rules for when to use each |
| Popups for intermediate detail | |
| Browser_mod for all overlays | |

### 8.2 Storage vs YAML vs Hybrid

| Capability | Storage Mode | YAML Mode | Hybrid |
|------------|-------------|-----------|--------|
| Visual drag-and-drop editor | Yes | No | Per-dashboard |
| `!include` / templates | **No** | Yes | YAML dashboard only |
| Version control (git) | Poor (.storage JSON) | Excellent | Partial |
| Sections view | Full support | Supported (raw editor) | Both |
| Custom card sizing via UI | Yes (drag slider) | Manual YAML | Both |
| Auto-generated device cards | Yes (until "take control") | No | Storage dashboard only |
| `decluttering_templates` | **No** | Yes | YAML dashboard only |
| Jinja2 in card configs | **No** | **No** (neither supports this) | No |
| Resources management | UI (Settings > Dashboards) | `configuration.yaml` | Can conflict |

**Key finding**: `!include` does NOT work in storage dashboards. If the V2 cards need template reuse or include-based composition, YAML mode is required for the primary dashboard.

**Hybrid approach**:
```yaml
# configuration.yaml
lovelace:
  mode: storage        # Default dashboard stays UI-managed
  dashboards:
    tunet-overview:
      mode: yaml
      filename: Dashboard/Tunet/tunet-overview-config.yaml
      title: Tunet
      show_in_sidebar: true
```

### 8.3 Critical Performance Fact

> **All views within a single dashboard are loaded together** when any view is opened. A broken card in View B produces errors when viewing View A.

Splitting across **separate dashboards** (not just views) provides true isolation. For the Tunet suite, this means:
- Putting all Tunet views in one dashboard is fine (they share resources)
- Separating a "family-simple" dashboard as a different dashboard provides isolation
- There is no performance benefit to splitting content across views within the same dashboard

---

## 9. POPUP STRATEGY

### Browser Mod Popups (Selected Approach)

The user has already built a styled browser_mod popup with iOS-style swipe-to-dismiss UX. Key characteristics:

| Aspect | Detail |
|--------|--------|
| Trigger | `fire-dom-event` action or `browser_mod.popup` service call |
| Content | Any HA card or card stack |
| Sections compat | Works as overlay — does not conflict with Sections layout |
| Stacking | Multiple popups via different `tag` values |
| Sizing | Standard dialog sizing (customizable) |
| Closing | Click outside, close button, swipe-to-dismiss (custom) |
| Installation | Requires HACS integration + frontend module |

### Popup Hierarchy (UX Design)

Based on Apple/Google patterns and UX research, a three-tier popup hierarchy:

```
TIER 1: INLINE (0 taps from current view)
├── Toggle on/off — single tap on tile/chip
├── Quick actions — action strip chips
└── Status indicators — visible without interaction

TIER 2: BOTTOM SHEET / POPUP (1 tap)
├── Expanded entity control — brightness slider, color picker
├── Zone detail — all lights in a zone with individual control
├── Media player — full transport, speaker selection
└── Quick settings — scene picker, mode selector

TIER 3: FULL SUBVIEW (1-2 taps)
├── Full room view — all devices, scenes, speakers, automation status
├── Settings/admin — system configuration
├── Automation management — rule editing
└── History/analytics — trend data, usage patterns
```

### When to Use Popup vs Subview

| Use Popup When | Use Subview When |
|----------------|------------------|
| Content is a quick interaction (< 30 seconds) | Content requires extended engagement |
| User needs to return to previous context quickly | Content is a "destination" (room, settings) |
| Content is a single card or small stack | Content is a full page layout with multiple sections |
| Content is contextual to what was tapped | Content is independently navigable |
| Dismissal should be easy (swipe, tap outside) | Back button navigation is appropriate |

---

## 10. UX DESIGN PRINCIPLES — APPLIED STANDARDS

### 10.1 Apple HomeKit Patterns

**Navigation**: 3-tab bottom bar (Home, Automations, +removed Rooms)
**Organization**: Categories → Cameras → Scenes → Favorites → Rooms (scrollable)
**Interaction model**:
- Tap left side of tile = toggle on/off
- Tap right side = open control view
- Long press = device settings
- Most common action = 1 tap from home screen

**What Apple gets right**: Category filters at the top give instant cross-room views. Favorites bring most-used controls to the top. Device tiles are horizontal rectangles (better information density than squares).

**What Apple gets wrong**: Struggles with scale (many devices). No search within the app. Limited automation builder.

### 10.2 Google Home Patterns

**Navigation**: 3 tabs (Home, Activity, Automations) — reduced from 5 in Oct 2025
**Organization**: Favorites (swipeable) → All Devices → Device-type dashboards
**Key innovations**:
- "Ask Home" persistent search — type "lights" or "living room" for instant filtering
- Swipe between Favorites / All Devices / Type dashboards within the Home tab
- Tailored favorites per device (phone vs tablet vs watch)
- Gemini-powered natural language automation creation
- 70% faster app launch, 80% fewer crashes after 2025 rebuild

### 10.3 Tap Count Standards (The Gold Standard)

| Action | Apple | Google | **Tunet Target** |
|--------|-------|--------|-------------------|
| Toggle favorite device | 1 tap | 1 tap | **1 tap** |
| Toggle any visible device | 1 tap (scroll) | 1 tap (swipe) | **1 tap** (if on screen) |
| Adjust brightness/temp | 2 taps | 2 taps | **2 taps** (popup) |
| Activate a scene | 1 tap | 1 tap | **1 tap** |
| Full room controls | 2 taps | 2 taps | **2 taps** (subview) |
| Device settings | Long press + tap | Long press | **Long press** or 2 taps |
| Find any device | Scroll/filter | "Ask Home" search | **2-3 taps** max |

### 10.4 Organization Model

**Research consensus: Lead with favorites/status, provide category filters AND room grouping.**

Both Apple and Google converged on this approach:

```
1. Favorites/Status (top) — most-used controls, system state
2. Category filters — Lights, Climate, Media, Security (horizontal chips)
3. Room sections — spatial grouping below
```

**For Tunet, the current overview layout already follows this pattern**:
1. Quick Actions strip (favorites/shortcuts)
2. Status Grid (system state at a glance)
3. Lighting Hero (most-used category expanded)
4. Environment (category: climate)
5. Media (category: speakers)
6. Rooms (spatial navigation to subviews)

### 10.5 Responsive Design Standards

**Material Design 3 breakpoints**:

| Window Class | Width | Navigation | Layout |
|--------------|-------|------------|--------|
| Compact (phone) | < 600dp | Bottom bar | Single column |
| Medium (tablet) | 600-840dp | Navigation rail (left) | Two columns |
| Expanded (desktop) | > 840dp | Rail or persistent drawer | Multi-column |

**The canonical responsive navigation pattern**:
- Phone: Bottom navigation bar (3-5 items, icons + labels)
- Tablet: Navigation rail (vertical left strip, icons + optional labels)
- Desktop: Full navigation drawer (expanded rail with full labels)

**Destinations must be identical across breakpoints** — only visual treatment changes.

### 10.6 Bottom Tab Bar Rules

| Principle | Detail | Source |
|-----------|--------|--------|
| **3-5 items maximum** | Cognitive load limit + thumb zone | Apple HIG, M3 |
| **Always visible** | 1.5x more engagement vs hidden nav | Google research |
| **Labels required** | Icon-only hurts discoverability | M3 Guidelines |
| **Navigation only** | Never use tabs for actions (use toolbars) | Apple HIG |
| **Touch targets ≥ 44x44px** | Minimum for one-thumb use | Apple HIG |
| **Consistent destinations** | Same items on every view | M3 Guidelines |

### 10.7 Popup/Sheet UX Rules

| Rule | Detail |
|------|--------|
| Always support swipe-to-dismiss | iOS convention users expect |
| Always provide visible close button | Accessibility, discoverability |
| Disable swipe-dismiss if unsaved data | Show confirmation sheet instead |
| Support system Back gesture | Dismisses the popup |
| Use grab handle visual affordance | Signals draggability |
| Beware swipe ambiguity | Scrollable content inside popup can conflict with dismiss gesture |

### 10.8 Status-at-a-Glance Principles (Nielsen Norman Group)

1. Use **preattentive visual cues** — color dots, bar lengths, position
2. Eliminate **non-distinctive illustrations** — don't add graphics that don't communicate state
3. **Single overview of complex state** — one view shows system health
4. **Progressive disclosure for precision** — summary on overview, detail on tap
5. **Limit to 5-6 cards initially** — critical status must not require scrolling

### 10.9 Context-Aware Adaptation

| Context | Adaptation | Example |
|---------|------------|---------|
| Time of day | Surface relevant controls | Bedroom at night, kitchen in morning |
| Device location | Show local room | When home: room controls. Away: security |
| System state | Highlight active states | Sleep mode → surface sleep controls |
| Recent usage | Promote frequently used | "Recently used" section |

**Caution**: Adaptive UIs can hurt learnability. Use **additive** adaptation (highlighting, promoting) rather than **subtractive** (hiding, rearranging). Users memorize where things are.

---

## 11. SECTIONS LAYOUT INTEGRATION

### How Sections Works

- Views use `type: sections` — sections flow left-to-right, wrapping
- Each section uses a **12-column internal grid**
- Cards sized in multiples of 3 columns (3, 6, 9, 12)
- Row height is fixed within the grid
- Max sections wide configurable per view
- Dense placement option fills horizontal gaps

### Tunet Card Integration Requirements

Custom cards need `getGridOptions()` to size correctly in Sections:

```javascript
// Replace getCardSize() (masonry-only) with getGridOptions() (sections)
getGridOptions() {
  return {
    columns: 12,    // out of 12 (full width)
    rows: 4,        // grid row count
    min_columns: 6, // minimum (half section)
    min_rows: 3,    // minimum
    max_columns: 12,
    max_rows: 8
  };
}
```

**Suggested grid options per card**:

| Card | Columns | Rows | Notes |
|------|---------|------|-------|
| `tunet-actions-card` | 12 | 1 | Full width, single strip |
| `tunet-status-card` | 12 | 4 | Full width, 4×2 grid |
| `tunet-lighting-card` | 12 | 6 | Full width, 3×2 grid |
| `tunet-climate-card` | 6 | 6 | Half width (paired with weather) |
| `tunet-weather-card` | 6 | 6 | Half width (paired with climate) |
| `tunet-sensor-card` | 12 | 3 | Full width, sensor row |
| `tunet-media-card` | 12 | 4 | Full width, media player |
| `tunet-rooms-card` | 12 | 4 | Full width, room capsules |

### Visibility Conditions

Built-in visibility (since HA 2024.6) supports:
- `state`, `numeric_state`, `time`, `screen` (CSS media queries), `user`, `location`
- AND/OR/NOT logic
- **Limitation**: Only works on top-level cards, not nested in stacks

### Spacing Customization

- Section gap: `ha-view-sections-column-gap` CSS variable (set via theme)
- Card-level gap: limited, set via row height grid
- Row height cannot be overridden via card-mod (baked into parent element)

---

## 12. CONFIRMED DECISIONS

All 5 decisions resolved (2026-03-01):

### DECISION 1: Custom Tunet Nav Card — CONFIRMED

**Choice: Option C — Build custom `tunet-nav-card`**

Rationale:
- Browser_mod popup compatibility is a **must** — only custom guarantees this
- Design system match — same tokens, glass, typography as all other Tunet cards
- Media mini-player with speaker pagination — no off-the-shelf card offers this
- Responsive side rail (desktop) + bottom bar (mobile) — full control
- Follows the proven 13-card vanilla JS pattern (~800-1200 lines)

### DECISION 2: Hybrid Dashboard Mode — CONFIRMED

**Choice: Option C — Hybrid (storage default + YAML Tunet dashboard), start with small test**

```yaml
# configuration.yaml
lovelace:
  mode: storage        # Default dashboard stays UI-managed
  dashboards:
    tunet-overview:
      mode: yaml
      filename: Dashboard/Tunet/tunet-overview-config.yaml
      title: Tunet
      show_in_sidebar: true
```

Note on `!include`: Research confirmed V2 cards **do not currently use** `!include`, Jinja2, YAML anchors, or decluttering templates. All config is explicit inline YAML, all logic is in the JS cards themselves. However, YAML mode is still preferred for git-trackability and future flexibility.

### DECISION 3: Hybrid Architecture — CONFIRMED

**Choice: Option C — Overview + Subviews + Browser Mod Popups**

Interaction flow:
```
Room tile (tunet-rooms-card) showing room brightness
  → TAP → browser_mod popup with room's lights + per-light controls
           + small icon/link to navigate to full room subview
  → Full room subview: all devices, scenes, speakers, automation status
     (native back button returns to overview)

Status tile / entity
  → TAP → browser_mod popup for expanded detail/control
  → Quick inline toggles remain on overview (no popup needed)
```

### DECISION 4: 4 Navigation Items — CONFIRMED

**Choice: Home, Rooms, Media, Settings**

| Item | Icon | Destination | Notes |
|------|------|-------------|-------|
| Home | `mdi:home` | Overview view | Climate, status, lighting, actions all live here |
| Rooms | `mdi:floor-plan` | Rooms view or popup grid | Tapping room → room subview |
| Media | `mdi:speaker` | Media view or popup | Full Sonos control |
| Settings | `mdi:cog` | Settings subview | System config, OAL tuning |

Climate does NOT get its own nav item — it lives on the Home view.

### DECISION 5: Media Mini-Player in Nav Bar — CONFIRMED

**Choice: Built-in mini-player in the custom nav card**

Spec:
- Streamlined version of the `tunet-sonos-card` slider unified card
- **Pagination buttons (< >)** to cycle between speakers (not swipe — explicit buttons)
- Shows: album art, title/artist, play/pause, speaker name
- **Dismissible** (swipe down or close button) and **reopenable** (tap Media nav item)
- Compact height (~48-56px) when embedded in the nav bar area
- Tap to expand → browser_mod popup with full Sonos control

---

## 13. RECOMMENDED NEXT STEPS

### Phase 1: Foundation
1. Add `getGridOptions()` to all 13 Tunet cards for Sections compatibility
2. Set up Kiosk Mode configuration
3. Set up hybrid dashboard mode (YAML Tunet dashboard + storage default)
4. Create view structure: Overview + room subviews + settings subview

### Phase 2: Navigation Card
5. Build `tunet-nav-card` — bottom bar mode (mobile) with 4 items
6. Add responsive side rail mode (desktop >= 768px)
7. Add media mini-player with speaker pagination (< >) and dismiss/reopen
8. Active route highlighting + badge indicators

### Phase 3: Popup System
9. Configure browser_mod popup templates for room lights (from rooms card tap)
10. Add "navigate to full room" icon inside each room popup
11. Entity detail popups for status tiles, lighting zones
12. Full Sonos control popup (expanded from mini-player tap)

### Phase 4: Polish
13. Refine responsive behavior across phone/tablet/desktop
14. Animations, transitions, micro-interactions
15. Dark mode verification across all new components
16. Performance testing with all cards + nav + popups loaded

### Design Tokens to Define for Navigation
```css
/* Nav bar specific tokens (extend design_language.md) */
--nav-bg: var(--glass);                    /* rgba(30,41,59,0.72) dark */
--nav-item-active: var(--amber);           /* #fbbf24 dark, #D4850A light */
--nav-item-inactive: rgba(255,255,255,0.5);
--nav-badge-bg: #ef4444;
--nav-badge-text: #ffffff;
--nav-height-mobile: 64px;
--nav-width-desktop: 72px;                 /* collapsed rail */
--nav-width-desktop-expanded: 240px;       /* expanded drawer */
--nav-blur: blur(20px);
--nav-border: 1px solid rgba(255,255,255,0.06);
--nav-transition: 200ms cubic-bezier(0.2, 0, 0, 1);
```

---

## APPENDIX A: Source Links

### Navigation Cards
- [Navbar Card — GitHub](https://github.com/joseluis9595/lovelace-navbar-card) (777 stars)
- [Bubble Card — GitHub](https://github.com/Clooos/Bubble-Card) (4,000 stars)
- [Kiosk Mode — GitHub](https://github.com/NemesisRE/kiosk-mode) (667 stars)
- [Swipe Navigation — GitHub](https://github.com/zanna-37/hass-swipe-navigation) (528 stars)
- [DBuit Sidebar — GitHub](https://github.com/DBuit/sidebar-card) (490 stars)
- [Fast Navigation Card — GitHub](https://github.com/fastender/Fast-Navigation-Card)
- [ha-navbar-position — GitHub](https://github.com/javawizard/ha-navbar-position)
- [Bobsilvio Sidebar+Header — Community](https://community.home-assistant.io/t/new-custom-card-fully-customisable-sidebar-header/969753)
- [Sections to Tabs — Community](https://community.home-assistant.io/t/sections-to-tabs/987568)

### Official HA Documentation
- [Sections Layout](https://www.home-assistant.io/dashboards/sections/)
- [Views & Subviews](https://www.home-assistant.io/dashboards/views/)
- [Multiple Dashboards](https://www.home-assistant.io/dashboards/dashboards/)
- [Custom Card Developer Docs — Grid Options](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/)
- [HA 2026.2 Release](https://www.home-assistant.io/blog/2026/02/04/release-20262)

### Design Guidelines
- [Apple Human Interface Guidelines — Tab Bars](https://developer.apple.com/design/human-interface-guidelines/tab-bars)
- [Apple HIG — Navigation](https://developer.apple.com/design/human-interface-guidelines/navigation-and-search)
- [Material Design 3 — Navigation Bar](https://m3.material.io/components/navigation-bar/guidelines)
- [Material Design 3 — Navigation Rail](https://m3.material.io/components/navigation-rail/guidelines)
- [Nielsen Norman Group — Smart Device Best Practices](https://www.nngroup.com/articles/smart-device-best-practices/)
- [NN/g — Dashboard Preattentive Processing](https://www.nngroup.com/articles/dashboards-preattentive/)
- [NN/g — Bottom Sheets](https://www.nngroup.com/articles/bottom-sheet/)

### Community Research
- [Navbar Card — Community Thread](https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917)
- [Bubble Card — Community Thread](https://community.home-assistant.io/t/bubble-card-a-minimalist-card-collection-for-home-assistant-with-a-nice-pop-up-touch/609678)
- [Sticky Floating Nav Menu — Community](https://community.home-assistant.io/t/sticky-floating-navigation-menu-all-devices-mushroom-chips-card/717557)
- [Adaptive Mushroom — GitHub](https://github.com/sga-noud/adaptive-mushroom)
- [Hemma Dashboard (uses Navbar Card)](https://github.com/willsanderson/Hemma)

### Browser Mod & Popups
- [Browser Mod — GitHub](https://github.com/thomasloven/hass-browser_mod)
- [Browser Mod Popup Docs](https://github.com/thomasloven/hass-browser_mod/blob/master/documentation/popups.md)
- [Popup View Integration — Community](https://community.home-assistant.io/t/popup-view-any-view-from-any-dashboard-as-a-popup/923247)
