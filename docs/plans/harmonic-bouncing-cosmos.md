# Tunet Interaction Architecture — Master Design Synthesis

**Plan slug**: `harmonic-bouncing-cosmos`
**Created**: 2026-05-23 (overnight session with Mac via /plan)
**Author**: Claude Opus 4.7 (1M context) synthesizing 3 Explore agents + 2 Plan agents + live Playwright captures + Mac's iterative direction
**Scope**: Design-level plan for the comprehensive interaction-model rewireframing Mac requested
**Position in the plan-portfolio**: This is the SYNTHESIS layer. It does not replace existing plans. It:
- **Resolves** the open options in `/home/mac/HA/implementation_10/docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md` (Q1-Q9 A/B/C/D picks)
- **Feeds** the existing portfolio orchestration at `/home/mac/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md` (Plans A-F)
- **Recommends absorbing** PA02-PA11 from `/home/mac/.claude/plans/tunet-page-architecture.md` into Plan F surface assembly
- **Surfaces 3 critical disagreements** with Mac's verbal direction this session — for his explicit confirm/override

---

## CONTEXT — Why this plan exists

Mac invoked `/plan` with ultrathink+ultrathink emphasis on the following prompt:

> Plan the interaction model from the home page all the way through wire frame what is on the home page which includes the room tiles what's in the room tile pop up what's in the room page itself what other pages do we need like media how are we going to control media on the main page, how are we going to fix all of the broken media players that we have right now if you actually take a look at those and screenshot those as well what other controls do we want like adaptive lighting stats a page with all of our statistics heating cooling electricity shit like that Is the pop up contract that you clarified actually the best possible use? Have you pressure tested it have you done an adversarial review? Like think about this like your wire framing through as a user every single page every single interaction like what is the best in class what would Apple do?

The prompt's load-bearing words: **wire frame · every single page · every single interaction · pressure tested · adversarial review · best in class · what would Apple do**.

This document delivers all six.

---

## CRITICAL DISCOVERIES — captured first, before they're lost

### CD-1 — Rooms-card per-light orbs are structurally identical at the DOM level (CONFIRMED LIVE)

Live Playwright accessibility snapshot of `/tunet-home-v2/home` at 390×844 returned:

```
Living Room button:
  ├─ Toggle Light 1 → icon: lightbulb
  ├─ Toggle Light 2 → icon: lightbulb
  ├─ Toggle Light 3 → icon: lightbulb
  ├─ Toggle Light 4 → icon: lightbulb
  └─ Turn on all Living Room → icon: power_settings_new

Kitchen / Dining / Bedroom / Office: same pattern, all lightbulb, all "Toggle Light N"
```

**Root cause split into TWO independent failures**:

1. **YAML data layer**: Per-room `lights:` arrays in `tunet-home-v2-config.yaml` (lines 287, 297, 307, 316, 325) declare lights as **bare entity strings** (`light.living_room_couch_lamp`) WITHOUT per-light `icon:` or `name:` overrides. The card supports `lights: [{ entity, name, icon }]` per `tunet_rooms_card.js:829` ("Per-light icon/name overrides and hold_action/tap_action are available via YAML") — the YAML just doesn't supply them.

2. **Card fallback policy**: When YAML doesn't supply icons, `tunet_rooms_card.js:878,885,1100` all default to `normalizeIcon(light.icon || 'lightbulb')`. Aria labels fall back to `"Toggle Light N"` (indexed, not named).

**Proof the card CAN render correct icons**: Live Playwright capture of `/tunet-suite-storage/living-room` subview shows per-light tiles with SEMANTICALLY DIFFERENT icons: Couch=lamp, Floor=lamp, Spots=light, Credenza=light, Desk=book, Columns=column. This is because `tunet-suite-storage-config.yaml` lines 343+ declare lights with full `{ entity, name, icon }` shape.

**Fix path**:
- **Primary**: YAML refresh — all per-room `lights:` arrays move from bare-string shape to `{ entity, name, icon }` shape across all dashboards that use the rooms-card. Tunet-home-v2 is highest priority because it's the candidate cutover.
- **Secondary (defense in depth)**: card behavior change — better aria-label fallback (use `hass.states[entity_id].attributes.friendly_name` before falling back to "Toggle Light N"); entity-id heuristic icon mapping (regex `lamp|table_lamp` → `mdi:lamp`, `spot|spots` → `mdi:flashlight_on`, `pendant|island` → `mdi:ceiling_light`, `strip` → `mdi:linear_scale`, etc.).

**Owning tranche**: This becomes part of the Rooms tranche of Plan F (Mac's portfolio roadmap), with the YAML fix being primary and the card defense being secondary. See §I for sequencing.

### CD-2 — Mac's verbal popup contract IS implemented and rendering live (Mac's screenshot proves it)

Mac shared a desktop Chrome screenshot at 2:03am of `/tunet-suite/card-gallery` with the Living Room popup open. The popup overlay shows:

- Header: ✕ close + "Living Room" title
- 6 quick action buttons: **Room** (open-in-new icon — the "expand-to-page" button), **+ Brighter**, **− Dimmer**, **Off**, **On**, **Reset**
- Section header: "Living Room — 1 on · 33%" with adaptive-lighting indicator
- 2-column grid of per-light tiles with semantic icons (Couch lamp, Floor lamp, Spots light, Credenza light, Desk book, Columns column)

Invocation gesture: **press-and-hold within the rooms tab/section** (Mac confirmed verbally this session). 400ms threshold per `cards_reference.md` Interaction Model Contract.

This is the load-bearing reference for the target popup contract — it already exists, just on the wrong popup primitive (Browser Mod, which Mac has locked for retirement in favor of Bubble Card 3.2.1).

### CD-3 — Bubble Card 3.2.1 is NOT yet installed on Mac's HA server

Per the existing `tunet-portfolio-roadmap-2026-05-23.md` lines 13: server is on **3.1.1**; 3.2.x ships the standalone popup cards + new `popup_mode` values + `bottom_offset`. **Plan A (Foundation cleanup) is the upgrade tranche, and it is a prerequisite for any of Plan F's popup composition work.**

This explains why my Playwright hash-routing tests failed: the popup definitions in `tunet-home-v2-config.yaml` reference Bubble 3.2.1 features that don't exist on the server yet. Mac's own iPhone testing has been against the suite POC (which uses Browser Mod) — the v2 candidate hasn't been exercised end-to-end yet.

### CD-4 — Production /tunet-overview/overview has rooms BURIED at the bottom

Visual confirmation at 390×844: actions strip → home status (4×2 + 4 weather) → lighting → climate → environment → media → speakers → **ROOMS LAST**.

This is an inverted IA: rooms are the primary navigation, but they're buried below information cards. Apple Home, Sonos S2, Nest Hub, Google Home, SmartThings all put rooms/scenes at the top.

**Recommendation** (full wireframe in §F): rooms-card moves above-the-fold; mid-scroll media moves to a persistent mini-player above the nav (Apple Music pattern); status + scenes prominent at top.

### CD-5 — Four distinct dashboards coexist with four distinct interaction models (high entropy)

| Dashboard | Popup primitive | Tap | Hold | Page model |
|---|---|---|---|---|
| `tunet-overview` (current production) | none | navigate to subview | NOTHING | full subviews exist but no popup intermediary |
| `tunet-suite/card-gallery` (Mac's "fairly decent" reference) | Browser Mod popup-card | navigate to subview | **POPUP with quick actions + "Room" button to subview** | full subviews |
| `tunet-suite-storage` | Browser Mod popup-card | navigate to subview | POPUP (lighting only mostly) | full subviews + footer nav |
| `tunet-home-v2` (today's candidate; built 1:44am) | Bubble Card 3.2.1 | navigate to popup hash | NOTHING | NO subviews — popup IS the page (gap vs Mac's verbal) |

This plan's job is to converge to ONE model.

### CD-6 — HA light groups don't include every physical light per room

Mac flagged verbally. Surfaces as: rooms-card aggregate state ("X on · Y%") under-reports; "All On" / power-button toggles incomplete subsets; rooms-card lights[] enumeration may diverge from `light.<room>_lights` group definition. Needs an `ha-instance-organizer`-style audit per room.

### CD-7 — 68 orphaned browser_mod media_player entities exist in HA registry

Per Plan agent #2's media audit. Cleanup is registry-level (not dashboard). Belongs in Plan A.

### CD-8 — Pre-existing plan portfolio I almost missed and would have duplicated

Discovered late in synthesis: Mac built today (2026-05-23, after the rationalization shipped yesterday):

- `/home/mac/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md` — orchestrates Plans A through F
- `/home/mac/HA/implementation_10/docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md` — A/B/C/D-style decision doc with Q1-Q9 covering scene model, page taxonomy, home composition, per-card variants, interactions, popup composition, entity mapping
- `/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-home-v2-config.yaml` — Plan F's first YAML iteration (variant-aware composition per Mac's 1:44am feedback)

**Implication for this plan**: this document is NOT a competing plan. It's the synthesis layer that — combined with the adversarial reviews — gives Mac the concrete recommendations he needs to ANSWER the wireframe doc's Q1-Q9 from a position of pressure-tested design instead of A/B/C option-choosing.

---

## §A — Adversarial Pressure-Test of Mac's Verbal Popup Contract

> Mac's verbal (2026-05-23): "hold room tile → popup with quick actions + button to full room page"

### A.1 — The contract has unreconciled collisions

**Collision 1 — Contradicts `cards_reference.md` §4 (Navigation Rows for the row variant)**:
- Row variant body tap = navigate to room page
- Orb tap = toggle individual light (stopPropagation)
- Power button = toggle all room lights
- **No hold was deliberately specified** — row has 5 visible targets already (icon + body + 3 orbs + power)

Mac's verbal re-introduces a 6th gesture target (body-hold = popup) on a thin 60-72px row at 390px. Adding body-hold creates gesture-density saturation: holds drag onto the orb hitbox and fire the orb's tap; horizontal pressure becomes hard to distinguish from scroll-start.

**Collision 2 — Contradicts the previously-locked tile variant contract (corpus #11178/11192, 2026-05-04)**:
- Tile variant: tap = toggle all room lights, hold (400ms+haptic) = navigate to dedicated subview

Mac's verbal ALSO contradicts this — because his verbal puts the popup BETWEEN the user and the subview. Under the new contract: tap = ? (unspecified), hold = popup, then a button in the popup navigates to the subview. The direct-to-subview path disappears.

**Collision 3 — Contradicts the iOS Home model Mac invoked ("what would Apple do")**:
- iOS Home: tap accessory = primary action (toggle); long-press accessory = expanded sheet; gear in sheet = full settings page
- iOS Home: tap room = ENTER the room page (navigation); no hold on room
- Apple's "open the sheet" gesture is hold; Apple's "open the page" gesture is **tap-inside-the-sheet**, not "hold from outside"

The question Mac actually has to answer: **is the popup the primary interaction (tap-reach) or the power-user shortcut (hold-reach)?**

**Collision 4 — Content overlap between popup and page makes one redundant**:
If the popup contains lighting + sensors + (climate where applicable) + (alarms where applicable), then the popup IS the room page. What does the page exist for? In v2 today, popups exist and there are no subview pages — Mac silently killed the pages. The verbal contract reintroduces both. Both must justify their existence.

### A.2 — Four interaction alternatives evaluated

| Alt | Body tap | Body hold | Orb tap | Power | Chevron | Open Room |
|---|---|---|---|---|---|---|
| **I — Tap-to-popup, button-to-page (Apple-aligned)** | Open popup | (unused) | Toggle light | Toggle all | (decorative or removed) | Button inside popup, dismisses + navigates |
| **II — Mac's verbal: tap-toggle, hold-popup, chevron-page** | Toggle all | Open popup | Toggle light | Toggle all (redundant) | Direct to page | Button inside popup, dismisses + navigates |
| **III — Tap-to-page, hold-to-popup (subview-first)** | Navigate to page | Open popup | Toggle light | Toggle all | (decorative) | n/a |
| **IV — Three-affordance row (tap/hold/chevron)** | Toggle all | Open popup | Toggle light | Toggle all | Direct to page | Button inside popup |

| Eval axis | Alt I | Alt II | Alt III | Alt IV |
|---|---|---|---|---|
| Discoverability | ★★★★ | ★★ | ★★ | ★ |
| Gesture conflict at 390px row | ★★★★ | ★ | ★★★ | ★ |
| Matches iOS Home pattern | ★★★★ | ★★ | ★★★ | ★★ |
| Daily-frequency cost (tap = most-used action) | ★★★ | ★★★★ (if toggle is most-used) | ★ (if toggle is most-used) | ★★★★ |
| Cognitive load on row | ★★★★ | ★★ | ★★★ | ★ |
| Back-stack cleanliness | ★★★★ | ★★ | ★★★ | ★★ |
| Deep-link integrity | ★★★ (popup over Home) | ★★★ | ★★★★ (direct to page) | ★★★ |
| Page existence justification | ★★★ (page is the "more" surface) | ★★★ (page is the "more" surface) | ★★★★ (page is the primary) | ★★ (page redundant with popup) |

### A.3 — RECOMMENDATION: Alternative I, with one caveat

**Lock: tap-body = popup, "Open Room" button in popup = navigate to subview, no body-hold action.**

Rationale (load-bearing):
1. **iOS Home alignment**: Apple's accessory pattern (tap = sheet, gear-in-sheet = page) is what Mac invoked. Alt I is the direct mapping.
2. **Discoverability**: tap is the ONLY visible gesture affordance on the row body. Hold is invisible until taught.
3. **Gesture density**: orbs and power button keep stopPropagation; body has ONE meaning. The row stops failing the 6-target collision Mac is currently experiencing.
4. **The "toggle all" alternative gesture survives**: the visible **power button** does exactly that, with clear iconography. Replacing body-tap-toggle with explicit power-button-toggle is a UX upgrade, not a downgrade.
5. **Page existence**: justified because the popup is intentionally light (control + sensors + Open Room button); the page is heavy (control + sensors + history + media + per-light fine control + alarms where applicable). Clean content split (see §G.3).

**The one caveat**: if Mac's daily-use frequency analysis is "I most-often just want to toggle all-room lights and never enter a popup," Alt II's tap=toggle wins on raw action cost. But this can be measured after first deploy — if Mac finds himself reflexively reaching for body-tap-to-toggle, we revisit with Alt II as the fall-back, OR add a custom gesture (e.g., double-tap body = toggle all).

**Where this disagrees with Mac**: Mac's verbal said hold = popup. Alt I says tap = popup, hold = nothing. This is a structural disagreement that needs explicit Mac confirm/override before Plan F starts.

---

## §B — "What Would Apple Do" — Best-in-Class Adoption + Rejection

### B.1 — Patterns to ADOPT (high signal-to-noise)

| Source | Pattern | Tunet adoption |
|---|---|---|
| **iOS Home** | Rooms tab is rooms-first (rooms or favorites at top, not buried) | Rooms-card moves to above-the-fold in Home composition (vs current bottom-burial) |
| **iOS Home** | Tap accessory = sheet; gear in sheet = full page | Alt I gesture lock |
| **iOS Home** | Big numeric values prominent (thermostat 65°, light 87%) | Status home_summary 4×2 with integer-prominent values; climate `thin` variant keeps numbers prominent |
| **iOS Control Center** | Hold-to-expand on continuous controls (brightness, volume) | Preserve in light_tile and speaker_tile (already in cards_reference §1, §2) |
| **iOS Music** | Persistent mini-player at bottom + tap-to-expand fullscreen | **Sonos becomes a persistent strip at the bottom of Home (above nav); tap opens #media-living-room popup** — single highest-impact change in this plan |
| **Sonos S2** | Now-playing pinned + Rooms/Browse/Search tabs | Mini-player on Home + dedicated Media page reachable from nav |
| **Tesla mobile** | Subsystem pages deep, quick-action hero on home | Stats page is the deep subsystem; Home surfaces top-line via `info_only` |
| **Tesla mobile** | Popup-sheet vs separate-page distinction | Popup = transient control; subview = persistent context |
| **Nest Hub** | Ambient at-a-glance numbers | `info_only` HVAC row on Home; 4×2 home_summary as the glanceable layer |

### B.2 — Patterns to REJECT (and why)

| Source | Pattern | Reject because |
|---|---|---|
| iOS Home Favorites layer | Categories above rooms | Mac's primary axis is rooms; second hierarchy adds nothing |
| iOS Home subsystem tabs (Climate/Lights/Speakers) | Subsystem-first nav | Mac's primary axis is rooms; subsystem surface deferred to Stats page only |
| iOS Home per-room wallpaper | Per-room art direction | Adds visual noise; design system uses CARD_SURFACE + glass-stroke; rejecting prevents debt |
| iOS Home edit-via-hold | Edit/reorder gesture | Hold is reserved (not used in Tunet); editing belongs in HA's native editor |
| Sonos S2 multi-room queue | Cross-room queue mgmt | Mac's flow is "play room-by-room"; complex queue is gold-plating |
| Nest Hub voice-first | Always-listening | Out of platform scope; HA Assist exists separately |
| Tesla hero animation | Animated home hero | CSS-cost + battery + distracting on a phone glance |
| Bottom nav with 5+ items | Many-item dock | Cap nav at 4 items (Home / Rooms / Media / Stats) to avoid choice fatigue; Settings → header gear |
| iOS Home auto-grouped accessories | Auto-grouping | Tunet does this manually; variant catalog wins |

### B.3 — The single most-impactful Apple-aligned shift

**Sonos becomes a persistent mini-player at the bottom of Home (above nav), not a mid-scroll card.**

Cost: ~10 minutes of YAML composition change.
Benefit: every Home visit, transport is at thumb-reach. Walking in with music playing = no scroll required.

This pattern is in Apple Music + Sonos S2 + Spotify and is the single biggest UX win available. NOT in any existing wireframe iteration today.

---

## §C — Information Architecture (Page + Popup Graph)

### C.1 — Surface inventory (RECOMMENDED)

5 pages + 8 popups, accessed as follows:

| ID | Surface | Type | Primary use | Reached from |
|---|---|---|---|---|
| `home` | Home overview | Page (sections) | Daily glance + dispatch | Default route + nav |
| `rooms` | Rooms list | Page (sections) | Full per-room navigation (tile variant) | Nav |
| `room-<name>` × 5 | Living/Kitchen/Dining/Bedroom/Office | Pages (sections subviews) | Deep control + history + media | Popup "Open Room" button, Rooms list, URL |
| `media` | Media | Page (sections) | Sonos deep + grouping + sources | Nav, popup "Open Media" button |
| `stats` | Stats | Page (sections) | HVAC graphs + per-room sensors + OAL adaptive stats + weather history + electricity (gated on hardware) | Nav |
| `settings` | Settings | Page (sections) | OAL config + alarms (system-wide) + notifications + system actions | Header gear icon |
| `#room-<name>` × 5 | Room popups | Bubble 3.2.1 | Quick control sheets | Tap rooms-card body |
| `#media-living-room` | Media popup | Bubble 3.2.1 | Mini deep-player (sonos + speaker grid + sources) | Tap media mini-player |
| `#oal-detail` | OAL popup | Bubble 3.2.1 | Mode + scenes + override reset | Tap mode tile in home_summary |
| `#climate-detail` | Climate popup | Bubble 3.2.1 | Setpoint + mode + history | Tap HVAC tile OR Climate thin |
| `#alarm-edit-<id>` × N | Alarm edit popups | Bubble 3.2.1 (migrated from Browser Mod) | Edit single Sonos alarm | Hold alarm row |
| `#light-detail-<entity>` | Per-light fine control popup (DEFERRED) | Bubble 3.2.1 | Per-light color/temp/effect | Hold light tile (in room popup or subview) |

### C.2 — Info collapses into Stats

The wireframe doc's §2 lists `Info` as a candidate page (passive read-only). My recommendation: collapse it into Stats top-section. Two separate Stats and Info pages over-fragments the passive layer.

ONE Stats page with two anchored sections:
- **Glance** (top) = `info_only` + `home_detail` status variants + per-room sparklines + OAL state
- **Graphs** (below) = HVAC heating/cooling history + electricity (gated) + weather history + OAL drift

This holds visible pages to 5 (Home, Rooms, Media, Stats, Settings).

### C.3 — Navigation model: 4-item bottom dock + header gear

Phone (390×844): bottom dock at 60px height, 4 items at ~97px each (clean tap targets).
Desktop (1440×900): left rail with same 4 items + Settings spillover.

Nav items: **Home · Rooms · Media · Stats** + header gear for Settings.

Why 4 not 5: 5 items at 390px = 78px each (cramped). Settings is low-frequency; header is the right home for it.

### C.4 — Back-stack semantics (LOCKED)

| From | Back behavior |
|---|---|
| Popup | Tap-outside / swipe-down / ✕ close → dismiss popup, return to underlying view |
| Room subview reached via "Open Room" button in popup | Back → Home (NOT to popup; popup already dismissed when button tapped) |
| Room subview reached via Rooms list tile | Back → Rooms list |
| Room subview reached via URL deep-link | Back → Home (default upstream) |
| Media page | Back → Home |
| Stats page | Back → Home |
| Settings page | Back → Home |
| Nested popup (e.g., #light-detail from a room subview) | Back → Room subview |

### C.5 — Deep-link entry behavior (LOCKED)

| URL | Behavior |
|---|---|
| `/tunet-home-v2/home` | Home page |
| `/tunet-home-v2/home#room-bedroom` | Home renders + Bedroom popup opens |
| `/tunet-home-v2/home#oal-detail` | Home renders + OAL popup opens |
| `/tunet-home-v2/room-bedroom` | Bedroom subview renders directly (no popup) |
| `/tunet-home-v2/rooms` | Rooms list |
| `/tunet-home-v2/media` | Media page |
| `/tunet-home-v2/stats` | Stats page |
| `/tunet-home-v2/settings` | Settings page |

**Lock**: declare popups ONCE per dashboard in a hidden `popups` view (already what v2 does); ensure HA routing surfaces the popup even when URL is `/home#hash` not `/popups#hash`.

---

## §D — Wireframes (ASCII, per surface)

### D.1 — Home page (390×844 phone)

```
┌──────────────────────────────────────────────────┐
│ ☰  Home  Stats                          ⚙ gear   │  header (44px)
├──────────────────────────────────────────────────┤
│  [● All On] [All Off] [Bedtime] [Sleep]          │  actions mode_strip compact (48px)
├──────────────────────────────────────────────────┤
│  [☀ Adaptive] [☾ Evening] [○ Dim] [✦ Sleep] [★Br]│  scenes strip (48px) — 3-mode highlighted
├──────────────────────────────────────────────────┤
│  ┌─────┬─────┬─────┬─────┐                       │  status home_summary 4x2 (190px)
│  │  7  │  1  │ 23m │ Off │                       │
│  │ Adp │ Man │Mode │HVAC │  ← Mode tap → #oal-detail
│  ├─────┼─────┼─────┼─────┤                       │  ← HVAC tap → #climate-detail
│  │ 65° │ 36° │ 39% │  ?  │                       │
│  │ In  │ Out │ Hum │ AQI │                       │
│  └─────┴─────┴─────┴─────┘                       │
├──────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐   │  ROOMS row variant (380px for 5 rooms)
│  │ 🛋 Living Room                             │   │  tap body = #room-living-room popup
│  │    On · 47% · 65°F   [💡][🪔][✦][🔦] [⏻]   │   │  orbs = per-light toggle (semantic icons!)
│  ├───────────────────────────────────────────┤   │  power = toggle all
│  │ 🍳 Kitchen                                 │   │  no hold action
│  │    On · 23% · 39%RH  [🪔][💡][▒]      [⏻]   │   │
│  ├───────────────────────────────────────────┤   │
│  │ 🍽 Dining Room                             │   │
│  │    Off · 65°F        [✦][❘❘❘]         [⏻]   │   │
│  ├───────────────────────────────────────────┤   │
│  │ 🛏 Bedroom                                 │   │
│  │    On · 32% · 62°F   [🛏][🎨][🪔]      [⏻]   │   │
│  ├───────────────────────────────────────────┤   │
│  │ 🖥 Office                                  │   │
│  │    Off                [🪔][🛏]          [⏻]   │   │
│  └───────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│  ┌────────┬────────┬────────┐                    │  lighting grid 3×2 compact (210px)
│  │ Living │Kitchen │Bedroom │                    │  OAL zones, not per-light
│  │ 47%    │ 23%    │ 32%    │                    │
│  ├────────┼────────┼────────┤                    │
│  │ Spots  │Ceiling │Columns │                    │
│  │ Off    │ Off    │ 30%    │                    │
│  └────────┴────────┴────────┘                    │
├──────────────────────────────────────────────────┤
│  ┌─ Climate thin ──┬─ Weather compact ────┐      │  desktop side-by-side; phone stacked
│  │ 65 → 60 Heat    │ 36° Clear · 7mph     │      │  (140px each on phone)
│  └─────────────────┴──────────────────────┘      │  tap Climate → #climate-detail
├──────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────┐                   │  status info_only HVAC (100px)
│  │ 0min │ 0min │+0.0F │+5.0F │                   │  passive read-only
│  │ Heat │ Cool │ ΔHi  │ ΔLo  │                   │
│  └──────┴──────┴──────┴──────┘                   │
├──────────────────────────────────────────────────┤
│  (Inbox — conditional render when items)         │  hidden by default
├──────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────┐   │  Sonos MINI-PLAYER (96px) — Apple Music pattern
│  │ ▓▓ This Side Of —  Max McNown  [⏮][▶][⏭]  │   │  tap body → #media-living-room popup
│  │     LR · 5 grouped              vol ────  │   │  transport = direct
│  └───────────────────────────────────────────┘   │
├──────────────────────────────────────────────────┤
│ [🏠 Home] [▦ Rooms] [♪ Media] [📈 Stats]        │  bottom nav dock (60px)
└──────────────────────────────────────────────────┘
```

**Total scroll height @ 390px ≈ 1456px** (≈ 1.7 viewports). Rooms-card finishes around y=770 — barely below the fold; one swipe and you're there. Major shift from production where rooms-card is at y=~1800.

### D.2 — Rooms list page (390×844)

```
┌──────────────────────────────────────────────────┐
│ ☰  Rooms                                ⚙        │
├──────────────────────────────────────────────────┤
│  ┌────────────┬────────────┐                     │  rooms-card tiles variant 2x3
│  │  🛋 Living │  🍳 Kitchen │                     │  tap tile = navigate to subview
│  │  On  47%   │  On  23%   │                     │  (NOT popup; rooms-list intent = nav)
│  │  4 lights  │  3 lights  │                     │
│  ├────────────┼────────────┤                     │
│  │  🍽 Dining │  🛏 Bedroom │                     │
│  │  Off       │  On  32%   │                     │
│  │  2 lights  │  3 lights  │                     │
│  ├────────────┼────────────┤                     │
│  │  🖥 Office │            │                     │
│  │  Off       │  (empty)   │                     │
│  │  2 lights  │            │                     │
│  └────────────┴────────────┘                     │
├──────────────────────────────────────────────────┤
│ [🏠][▦ ●][♪][📈]                                │
└──────────────────────────────────────────────────┘
```

### D.3 — Living Room subview (representative; 390×844)

```
┌──────────────────────────────────────────────────┐
│ ← Back     🛋 Living Room              ⚙          │
├──────────────────────────────────────────────────┤
│  ┌────────────┬────────────┐                     │  lighting-card large 2x2
│  │ Couch Lamp │ Floor Lamp │                     │  per-light tile w/ slider
│  │ 47%  ████  │ 52%  █████ │                     │  semantic icons
│  ├────────────┼────────────┤                     │
│  │ Spots      │ Credenza   │                     │
│  │ Off        │ 18%  █▒    │                     │
│  └────────────┴────────────┘                     │
├──────────────────────────────────────────────────┤
│  [Brighter] [Dimmer] [OAL Reset] [Movie]         │  room scenes (quick actions)
├──────────────────────────────────────────────────┤
│  65 → 60   Heat   ████░░                         │  climate thin (shared dining/living)
├──────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────┐                   │  sensors row
│  │  65° │  39% │ ✓ Pres│ 320lx│                   │
│  │ Temp │ Hum  │  Occ  │ Lux  │                   │
│  └──────┴──────┴──────┴──────┘                   │
├──────────────────────────────────────────────────┤
│  ▓▓ This Side Of —  Max McNown  [⏮][▶][⏭]        │  media in-room (LR-pinned)
│      vol ─────────                               │
├──────────────────────────────────────────────────┤
│  Temp ▁▂▃▃▄▄▃▂▁    Lux ░▁▂▅█▅▂▁                 │  history sparklines 24h
│  HVAC ▁▁▃▃▁▁▁▁▁    Occ ░░█░░█░██░               │
├──────────────────────────────────────────────────┤
│  Light-group config ›  Adaptive mode toggle ›    │  room settings
├──────────────────────────────────────────────────┤
│ [🏠][▦][♪][📈]                                  │
└──────────────────────────────────────────────────┘
```

**Per-room variations**:

| Room | Climate section | Alarm section | Media section | Special quick actions |
|---|---|---|---|---|
| Living Room | Yes (thin, shared) | No | Yes (LR speaker) | Movie scene |
| Kitchen | No | No | Yes (Kitchen speaker) | "Cook" scene |
| Dining Room | YES (hero, primary thermostat) | No | Yes (Dining speaker) | — |
| Bedroom | Yes (target + bedroom temp) | YES (alarm-card) | Yes (Bedroom speaker) | Sleep + Skip Tomorrow |
| Office | No | No | NO | — (sparse: lighting + occupancy + lux only) |

### D.4 — Living Room popup (representative; ~360×600 sheet)

```
┌──────────────────────────────────────────────┐
│ 🛋 Living Room                            ✕  │
├──────────────────────────────────────────────┤
│  ┌────────────┬────────────┐                 │  lighting-card large 2x2 — popup primary
│  │ Couch Lamp │ Floor Lamp │                 │
│  │ 47%  ████  │ 52%  █████ │                 │
│  ├────────────┼────────────┤                 │
│  │ Spots      │ Credenza   │                 │
│  │ Off        │ 18%  █▒    │                 │
│  └────────────┴────────────┘                 │
├──────────────────────────────────────────────┤
│  [All On] [All Off] [Brighter] [Dimmer]      │  quick actions 4-chip
├──────────────────────────────────────────────┤
│  65° Temp · 39% Hum · ✓ Occ                  │  sensors compact row
├──────────────────────────────────────────────┤
│            [    Open Room    ]               │  ← navigates to /room-living-room
└──────────────────────────────────────────────┘
```

### D.5 — Media page (390×844)

```
┌──────────────────────────────────────────────────┐
│ ← Back     ♪ Media                       ⚙       │
├──────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────┐    │  sonos-card hero now-playing
│  │  [art 120x120]                            │    │
│  │  This Side Of —                           │    │
│  │  Max McNown                               │    │
│  │  Living Room · 5 grouped                  │    │
│  │  ━━━━━━━━━━━━━ 1:47 / 3:59                │    │
│  │  [⏮]   [▶/⏸]   [⏭]                        │    │
│  │  vol ─────●────   🔊                       │    │
│  └──────────────────────────────────────────┘    │
├──────────────────────────────────────────────────┤
│  ┌────┬────┬────┬────┬────┐                      │  speaker-grid 5-cols
│  │ LR │ DR │ Kit│Bath│ BR │                      │
│  │ ●  │ ●  │ ●  │    │    │                      │
│  │47% │16% │40% │ ─  │ ─  │                      │
│  └────┴────┴────┴────┴────┘                      │
│  [Group All]  [Ungroup All]                      │
├──────────────────────────────────────────────────┤
│  [Sonos] [Spotify] [TV] [Line-In]                │  source switcher
├──────────────────────────────────────────────────┤
│  Queue (deferred phase)                          │
├──────────────────────────────────────────────────┤
│ [🏠][▦][♪ ●][📈]                                │
└──────────────────────────────────────────────────┘
```

### D.6 — Stats page (390×844)

```
┌──────────────────────────────────────────────────┐
│ ← Back     📈 Stats                      ⚙       │
├──────────────────────────────────────────────────┤
│  ┌──────┬──────┬──────┬──────┐                   │  glance: info_only home_detail
│  │Adapt │ Man  │Mode  │ HVAC │                   │
│  │  7   │  1   │ 23m  │ Off  │                   │
│  ├──────┼──────┼──────┼──────┤                   │
│  │ Heat │ Cool │ +ΔHi │ +ΔLo │                   │
│  │ 0min │ 0min │ 0.0F │ 5.0F │                   │
│  └──────┴──────┴──────┴──────┘                   │
├──────────────────────────────────────────────────┤
│  Heating ▁▁▁▁▁▁▁▁▁  Cooling ▁▁▁▁▁▁▁▁▁           │  HVAC today sparklines
│  ΔHigh   ─0─────     ΔLow    ─5─────             │
├──────────────────────────────────────────────────┤
│  Living    65°F ▂▂▃▃▄▄▃▂▁                       │  per-room sparklines
│  Kitchen   ─                                     │
│  Dining    65°F ▂▂▃▃▄▄▃▂▁                       │
│  Bedroom   62°F ▂▂▂▃▃▃▃▂▂                       │
│  Office    ─                                     │
├──────────────────────────────────────────────────┤
│  [mode dropdown]  Active for: 23m                │  OAL detail + history
│  Overrides: 1   Boost: +0                        │
│  Drift today (graph 24h)                         │
├──────────────────────────────────────────────────┤
│  (Weather 24h temp + precip sparkline)           │
├──────────────────────────────────────────────────┤
│  Electricity (placeholder — gated on hardware)   │
├──────────────────────────────────────────────────┤
│ [🏠][▦][♪][📈 ●]                                │
└──────────────────────────────────────────────────┘
```

### D.7 — Settings page (390×844)

```
┌──────────────────────────────────────────────────┐
│ ← Back     ⚙ Settings                            │
├──────────────────────────────────────────────────┤
│  OAL Configuration                               │
│  Active mode      [Adaptive ▼]                   │
│  Boost offset     ─0─────  +0                    │
│  Sensitivity      ───●─── std                    │
│  Reset overrides  [Reset Soft] [Reset Hard]      │
├──────────────────────────────────────────────────┤
│  Sonos Alarms                                    │
│  Weekday 6:30 AM   Bedroom    [●ON]    edit ›    │
│  Weekend 8:00 AM   Bedroom    [○OFF]   edit ›    │
│  [+ Add alarm]                                   │
├──────────────────────────────────────────────────┤
│  Away Mode                          [○OFF]       │
├──────────────────────────────────────────────────┤
│  Notifications                                   │
│  TV mode notifs     [○OFF]  (debounced — fix)    │
│  Inbox push         [●ON]                        │
├──────────────────────────────────────────────────┤
│  System                                          │
│  Reload Dashboard ›                              │
│  HA Configuration › (external)                  │
│  Diagnostic dump › (download)                    │
└──────────────────────────────────────────────────┘
```

### D.8 — OAL popup

```
┌──────────────────────────────────────────────┐
│ ⚙ OAL System                              ✕  │
├──────────────────────────────────────────────┤
│  Mode  [Adaptive ▼]    Active for 23m         │
├──────────────────────────────────────────────┤
│  Overrides 1   Boost +0                       │
│  [Reset Soft]                                 │
├──────────────────────────────────────────────┤
│  [☀ Adaptive] [☾ Evening] [○ Dim] [✦ Sleep][★Br]│
├──────────────────────────────────────────────┤
│      [    Open Stats Page    ]                │
└──────────────────────────────────────────────┘
```

### D.9 — Media popup

```
┌──────────────────────────────────────────────┐
│ ♪ Media                                  ✕   │
├──────────────────────────────────────────────┤
│  [art] This Side Of —                        │
│        Max McNown                            │
│  ━━━━━━━━━━━━━ 1:47 / 3:59                  │
│  [⏮]   [▶/⏸]   [⏭]                          │
│  vol ─────●────   🔊                          │
├──────────────────────────────────────────────┤
│  ┌────┬────┬────┬────┬────┐                  │
│  │ LR │ DR │ Kit│Bath│ BR │                  │
│  │ ●  │ ●  │ ●  │    │    │                  │
│  │47% │16% │40% │ ─  │ ─  │                  │
│  └────┴────┴────┴────┴────┘                  │
│  [Group All]  [Ungroup All]                  │
├──────────────────────────────────────────────┤
│       [    Open Media Page    ]              │
└──────────────────────────────────────────────┘
```

---

## §E — Defects Found Live (Catalog)

| ID | Defect | Source | Severity | Owning tranche |
|---|---|---|---|---|
| LIVE-1 | Rooms-card per-light orbs structurally identical (all `lightbulb`, all "Toggle Light N") | DOM snapshot `/tunet-home-v2/home` | High (Mac flagged) | Plan F Rooms tranche (YAML) + Plan E (card defense) |
| LIVE-2 | Rooms-card row label truncation at 390px ("Kit...", "Be...", "Dining R...") | `03-home-v2-390-full.png` | High (Mac flagged) | Plan F Rooms tranche |
| LIVE-3 | HA light groups don't include every physical light per room | Mac verbal + data audit needed | Medium | Plan B (light-groups audit) |
| LIVE-4 | Bubble Card 3.2.1 NOT on server (3.1.1 installed) | tunet-portfolio-roadmap line 13 | Critical (blocks Plan F) | **Plan A (Bubble upgrade)** |
| LIVE-5 | V2 popup doesn't render via hash navigation in Playwright + Mac's iPhone has 2 console errors at 390px on living room popup (per 2:00am memory) | My Playwright tests + memory entry | High | Plan A smoke test |
| LIVE-6 | Production /tunet-overview/overview rooms-card buried at bottom of vertical-stack | `02-overview-prod-390-full.png` | Medium (IA defect) | Plan F composition |
| LIVE-7 | Climate gradient visually busy in production | `02-overview-prod-390-full.png` | Low | Plan F (use `thin` variant) |
| LIVE-8 | 68 orphaned browser_mod media_player entities (unavailable) | Agent #2 audit | Low (cosmetic) | Plan A cleanup |
| LIVE-9 | Bedroom Sonos Play:3 silent-fire pattern (alarm fires, no audio) | Memory entry | Medium-High | Out of dashboard scope; device-layer issue |
| LIVE-10 | MEDIA-1 (mixed coordinator metadata) | Agent #2 audit | Medium | Plan F Media tranche or split media-defect sub-plan |
| LIVE-11 | MEDIA-2 (Spotify-source transport buttons reject) | Agent #2 audit | Medium | Plan F Media tranche or split |
| LIVE-12 | MEDIA-3 (volume debounce doesn't flush on pointerup) | Agent #2 audit | Low | Plan E δ-polish |
| LIVE-13 | Production overview lacks media on homepage at all (mid-scroll only) | `02-overview-prod-390-full.png` | High (IA) | Plan F composition (mini-player) |
| LIVE-14 | Tunet/CLAUDE.md still says "popup direction remains Browser Mod" — stale after 2026-05-22 Bubble 3.2 lock | doc audit | Low (governance) | Doc sync after Plan F1 |

---

## §F — Popup Contract — FINAL LOCK RECOMMENDATION

### F.1 — Gesture contract per surface (LOCKED)

| Surface | Element | Tap | Hold (400ms) | Drag |
|---|---|---|---|---|
| Rooms row (Home) | Body | **Open `#room-<name>` popup** | (unused) | — |
| Rooms row (Home) | Orb | Toggle that light (stopProp) | — | — |
| Rooms row (Home) | Power | Toggle all room lights (stopProp) | — | — |
| Rooms row (Home) | Chevron | Decorative or removed | — | — |
| Rooms tile (Rooms list) | Body | Navigate to `/room-<name>` subview | (unused) | — |
| Light tile (popup/page) | Body | Toggle | Enter drag (brightness) | Brightness |
| Light tile (popup/page) | Icon | Open `#light-detail-<entity>` (DEFERRED) | — | — |
| Speaker tile (Media surfaces) | Body | Select active speaker | Enter drag (volume) | Volume |
| Speaker tile | Group badge | Toggle membership | — | — |
| Climate thin (Home) | Body | Open `#climate-detail` popup | — | — |
| Climate standard (Dining subview) | Thumbs | — | — | Drag setpoints |
| Status home_summary mode tile | — | Open `#oal-detail` popup | — | — |
| Status home_summary HVAC tile | — | Open `#climate-detail` popup | — | — |
| Status home_summary sensor tile | — | `more-info` on entity | — | — |
| Scene chip | — | Activate scene | — | — |
| Action chip | — | Run service | — | — |
| Media mini-player (Home) | Body | Open `#media-living-room` popup | — | — |
| Media mini-player | Transport icons | Direct play/pause/skip | — | — |
| Alarm row (Bedroom popup/Settings) | Body | Toggle alarm | Open `#alarm-edit-<id>` popup | — |
| Inbox item | — | Execute action OR more-info | — | — |
| Popup "Open <Surface>" button | — | Dismiss popup + navigate | — | — |
| Tap outside popup | — | Dismiss popup | — | — |
| Swipe down on popup handle | — | Dismiss popup | — | — |
| ✕ close in popup chrome | — | Dismiss popup | — | — |

### F.2 — Popup primitive: Bubble Card 3.2.1 (suite-wide, after Plan A upgrade)

- `card_type: pop-up`, `popup_mode: fit-content`, `bottom_offset: true`
- Declared ONCE per dashboard in a hidden `Popups` view (already v2 pattern)
- Migrations (Browser Mod → Bubble 3.2.1):
  - `tunet-alarm-edit-popup.yaml`
  - `tunet_alarm_card.js` Browser Mod invocations
  - `tunet_status_card.js` Browser Mod invocations
- Browser Mod RETAINED only as fallback for cross-instance push (currently unused by Tunet)

### F.3 — Content split: popup vs page (LOCKED)

| Surface | Lighting | Sensors | Quick actions | Climate | Media-in-room | History/graphs | Per-light fine ctrl | Alarms | Settings |
|---|---|---|---|---|---|---|---|---|---|
| **Popup** | YES (large 2×2 or 3-zone grid) | YES (compact row) | YES (4-chip strip) | Only if room owns thermostat | NO | NO | NO | YES (Bedroom only) | NO |
| **Subview page** | YES (large grid) | YES (rich 4-tile w/ trend) | YES (4-chip strip) | Only if room owns thermostat | YES | YES (sparklines 24h) | YES (via icon-tap) | YES (Bedroom only, full editor) | YES (per-room) |

Why split this way: popup = "adjust the room from where I am" (60-90% of room interactions). Page = "see history, fine-tune, play media."

### F.4 — Per-room popup contents matrix

| Room popup | Lighting zones | Quick actions | Sensors | Climate | Alarm |
|---|---|---|---|---|---|
| Living | 4 (Couch/Floor/Spots/Credenza) | All On / All Off / Brighter / Dimmer | Temp + Hum + Occ | No | No |
| Kitchen | 3 (Island/Main/Under-cab) | All On / All Off / Cook / Dimmer | Hum + Occ | No | No |
| Dining | 2 (Spots/Column) | All On / All Off / Brighter / Dimmer | (climate is the hero) | YES (thin) | No |
| Bedroom | 3 (Main/Accent/Lamps) | All On / All Off / Sleep / Skip Tomorrow | Temp + Hum + Occ | No | YES (alarm-card) |
| Office | 2 (Desk/Bed) | All On / All Off / Brighter / Dimmer | Occ only | No | No |

All popups share: top chrome (icon + room name + ✕), bottom chrome ("Open Room" button), dismissal (tap-outside / swipe-down / ✕).

### F.5 — Dismissal pattern (LOCKED)

Primary: tap-outside (gesture cost 0; iOS sheet pattern).
Secondary: swipe-down on handle bar (Bubble Card 3.2.1 built-in).
Tertiary: ✕ close button in top-right (always present for explicit affordance).
"Open <Surface>" button: dismiss + navigate (sequential).

### F.6 — "Expand to page" mechanism (LOCKED)

Explicit labeled button at the bottom of every popup that has a corresponding page. Label: "Open <Surface>" (Open Room / Open Media / Open Stats). Centered, full-width minus side padding, primary accent.

Rationale (vs drag-up-to-expand): drag-up adds a third gesture mode (already have tap inside + swipe-down dismissal). Labeled button is discoverable, single-tap, learnable.

### F.7 — Anti-patterns explicitly forbidden

- Popup-from-popup chains (except light-detail-from-room-subview which is page→popup)
- Hold-on-room-body opens anything (hold is reserved; not used; documented to prevent re-litigation)
- Popups containing graphs/history (those belong on subview pages)
- Per-room popup chrome variation (icons, colors per room) — only middle content varies
- Browser Mod popups in Tunet (migration complete after Plan A)
- Speaker grid on Home page (lives only in Media popup + Media page)

---

## §G — Variant Catalog Resolution (per wireframe doc Q4.*)

Recommended variants for each card-position. This RESOLVES wireframe doc §4.

| Card | Position | Variant | Why |
|---|---|---|---|
| actions-card | Home top | `mode_strip` + compact | mode-aware highlights; one-row cap |
| scenes-card | Home top | `strip` | single row; matches actions visual rhythm |
| status-card | Home top | `home_summary` 4×2 | 8 fixed glance slots |
| status-card | Home info row | `info_only` 4×1 | passive HVAC tiles |
| status-card | Stats glance | `home_detail` 4×2 | richer with trend |
| status-card | Stats sub-row | `info_only` 4×1 | HVAC summary |
| rooms-card | Home | `row` variant | orbs + per-light feedback + chevron |
| rooms-card | Rooms list | `tiles` variant | 2×3 grid; nav-intent |
| lighting-card | Home | grid 3×2 compact (6 OAL zones) | dense overview |
| lighting-card | Room popups | grid 2×2 OR 3-col large | per-light tiles |
| lighting-card | Room subviews | grid 2×2 large | per-light + sliders |
| light-tile | Excluded from Home | — | (lives in popups/subviews) |
| climate-card | Home | `thin` | reduces visual noise |
| climate-card | Dining subview | `standard` | gold-standard surface |
| climate-card | Climate popup | `thin` | popup density |
| weather-card | Home | compact, daily 5-day | header info |
| weather-card | Stats | full hourly + 5-day | richer view |
| sensor-card | Excluded from Home | — | (lives in popups + Stats) |
| sensor-card | Room popups | compact row 3-4 tiles | dense |
| sensor-card | Room subviews | rich 4-tile w/ trend + sparkline | detail |
| sensor-card | Stats | sparklines + trend | full graph |
| media-card | Home (mini-player) | default + show_progress | Apple Music pattern |
| sonos-card | Excluded from Home; Media popup + Media page | — | desktop variant per 2026-05-04 lock |
| speaker-grid-card | Excluded from Home; Media popup + Media page | columns:5 + group_actions | per-speaker control |
| nav-card | Bottom dock (phone) / left rail (desktop) | 4 items: Home / Rooms / Media / Stats | choice fatigue cap |
| inbox-card | Home conditional + dedicated /inbox-yaml | default | conditional render |
| alarm-card | Bedroom popup + Settings | default | Sonos alarms |

---

## §H — Tranche Mapping (How This Plan Feeds Plans A-F)

### H.1 — This plan does NOT replace any existing plan

| Existing artifact | This plan's relationship |
|---|---|
| `tunet-portfolio-roadmap-2026-05-23.md` (Plans A-F) | Provides design-level resolution that Plan F (and downstream tranches) implements |
| `tunet-home-v2-wireframe-2026-05-23.md` (Q1-Q9) | Provides recommendations for each Q to lock; converts the doc from "decision request" to "build spec" |
| `tunet-page-architecture.md` (PA01-PA11) | RECOMMENDS absorption into Plan F surface assembly (both Plan agents converged on this) |
| `tunet-home-v2-config.yaml` (existing v2 candidate) | Provides target architecture (rooms-first IA + mini-player + per-light icons + popup-with-expand-button) that v2 reshapes toward in Plan F |

### H.2 — Per-tranche additions surfaced by this plan

| Plan | Original scope | This plan adds |
|---|---|---|
| **Plan A** (Foundation) | Bubble 3.2.1 upgrade + area cleanup | **+ Popup smoke test** (hash-routing, deep-link, dismissal, bottom-offset all working at 390x844 iOS Safari). **+ 68 orphaned browser_mod entity cleanup.** **+ Light-groups audit** (LIVE-3). |
| **Plan B** (Backend) | Sensors + OAL slightly-dimmer + kitchen counter + entry auto-off | Status quo — already comprehensive |
| **Plan C** (ZEN32) | Cycle through 3 actually-used scenes | Status quo — but gates on scene-set lock from wireframe Q1.1 |
| **Plan D** (HomeKit) | Create homekit: block + curate exposed entities | Status quo |
| **Plan E** (Card hardening) | Close visual_defect_ledger lines | **+ LIVE-1** (rooms-card per-light icon fallback hardening, card-layer defense). **+ MEDIA-3** (volume debounce flush). |
| **Plan F** (New production dashboard) | Bubble 3.2.1 popups + per-card contract + rooms popup + media popup + sensor surfaces | **THIS PLAN IS PLAN F's DESIGN INPUT.** All §C/§D/§F/§G feed Plan F's YAML rewrite + iterate cycle. |
| **NEW sub-plan: media-defect-triage-2026-05-23.md** | — | Splits "fix all broken media players" into MEDIA-1/2/3 + bedroom-silent-fire + orphan cleanup with per-defect ownership |
| **NEW sub-plan: scenes-architecture-2026-05-23.md** (CONDITIONAL) | — | Only spawned IF wireframe Q1.1 picks Option B or C with new OAL mode definitions; otherwise scenes refactor stays inside Plan B |

### H.3 — PA framework absorption

Both Plan agents independently recommended: **close PA02-PA11 as "absorbed into Plan F surface assembly."** The PA framework predated the portfolio; maintaining two parallel surface-assembly tracks (PA framework + Plan F) is governance overhead with no benefit.

Recommendation: at Plan F1 (architecture decision gate), explicitly retire the PA framework. Update `tunet-page-architecture.md` to point at Plan F. PA01 (Bug A) is already closed; PA02-PA11 fold into Plan F's tranches.

### H.4 — Critical path

```
T0 Plan A: Bubble 3.2.1 upgrade + popup smoke test + orphan cleanup + light-groups audit  [~4-6h]
   │
   ├─→ T1 Plan B: sensors + OAL Evening mode + kitchen counter night + entry auto-off  [~4-6h, gated on T0 entity-IDs]
   │   │
   │   └─→ T2 Plan C: ZEN32 redesign  [~2-3h, gated on T1 scene set]
   │       │
   │       └─→ T3 Plan D: HomeKit  [~2-3h, gated on T2 scenes]
   │
   ├─→ ⟂ Plan E: card hardening (rooms-card LIVE-1 priority)  [~9-13h, parallel-safe from T0]
   │
   ├─→ ⟂ NEW media-defect-triage sub-plan  [~4-6h, parallel-safe from T1]
   │
   └─→ ⟂ T4 Plan F1: Architecture decisions (Mac picks Q1-Q9 from wireframe doc + this plan's recommendations)  [~1-2h Mac + 2h docs]
        │
        └─→ T5 Plan F2-F3: Build new dashboard YAML per §D wireframes + §F popup contract + §G variant catalog  [~8-12h]
            │
            └─→ T6 Plan F4: Production-mirror review iterations with Mac (M1 contract; expect 3-4 rounds)  [~4-8h]
                │
                └─→ T7 Plan F5: Cut-over from /tunet-overview to /tunet-home (only with Mac awake to grade)  [~2h]
```

**Total**: ~36-58h focused execution, spread over 4-5 calendar weeks at realistic bandwidth.

**Choke points**:
1. **T0** (Bubble 3.2.1 upgrade + smoke test) — blocks everything popup-dependent
2. **T4** (Plan F1 architecture decisions) — Mac's picks gate T5
3. **Plan E rooms-card defect (LIVE-1+2)** — blocks T7 cutover until closed

---

## §I — Open Decisions Mac Must Resolve

### I.1 — BLOCKING (decide before T4 Plan F1 starts)

| # | Question | Recommendation | Why this matters |
|---|---|---|---|
| **D1** | **Gesture lock**: Alt I (tap=popup, button=page) vs Alt II (Mac's verbal: tap=toggle, hold=popup, chevron=page) vs Alt III (tap=page, hold=popup) | **Alt I** per §A.3 | Gates rooms-card YAML structure + interaction contract docs |
| **D2** | **Rooms-first vs Scenes-first vs Status-first home composition** (wireframe Q3.1) | **Rooms-first AND Scenes-first BOTH above-the-fold** (my synthesis differs from wireframe doc's Scenes-first Option A) | Apple-aligned IA; rejects current production bottom-burial |
| **D3** | **Sonos mini-player pattern** (Apple Music) vs mid-scroll media-card | **Mini-player** (single highest-impact change) | Not in any wireframe iteration today; reshapes Home composition |
| **D4** | **Info collapsed into Stats** vs separate Info page | **Collapse** | Holds page count to 5; over-fragmentation kills nav clarity |
| **D5** | **Settings page existence** (`/settings`) vs HA-native Settings only | **Yes, dedicated `/settings`** | Sonos alarm system-wide management + OAL config concentration |
| **D6** | **Scene set** (wireframe Q1.1): 2 modes vs 3 modes vs 3-with-TV | (Mac's call; this plan doesn't recommend) | Gates Plan B's OAL Evening mode + Plan C ZEN32 cycle |
| **D7** | **Evening mode behavior** (wireframe Q1.2): Option A verbose vs Option B terse vs Option C bedroom-off | (Mac's call) | Gates Plan B OAL mode definition |
| **D8** | **Bubble 3.2.1 upgrade timing**: Plan A first, then everything else? OR parallel? | **Plan A first** (3-5h block) | Plan F's popup work depends on it |
| **D9** | **`tunet-overview` vs `tunet-home` URL after cutover** (wireframe shared question) | (Mac's call; this plan recommends parallel-run during F4, cut over at F7 only when Mac awake to grade) | Production identity |

### I.2 — PER-TRANCHE (decide at tranche kickoff)

| # | Question | When |
|---|---|---|
| P1 | Browser Mod migration scope: alarm-edit + status-card + alarm-card + orphans in one tranche or staged? | Plan A |
| P2 | "Entry main spot" entity identification (wireframe portfolio Q1) | Plan B |
| P3 | Scenes refactor: spawn new sub-plan or stay inside Plan B? | After D6/D7 |
| P4 | Light-group repair vs dashboard YAML lights[] enumeration: which is canonical source? | Plan B Phase 1 |
| P5 | Per-room subview ordering: which subview ships first? | T5 Plan F2 |
| P6 | HomeKit bridge identity: single vs multiple? | Plan D |
| P7 | HVAC sensor strategy: software template vs hardware clamp? | Plan B Phase 1 |
| P8 | Recorder retention: 10 days vs InfluxDB? | Plan B Phase 1 |
| P9 | Cutover gate: M3 stamp protocol details | Plan F5 |
| P10 | Light-tile direct access on Home (Counter, Entry Lamp)? | T5 Plan F2 |

### I.3 — DEFERRABLE (figure out during execution)

| # | Question |
|---|---|
| F1 | Chevron presence on rooms row body (keep for affordance vs remove for cleaner row) |
| F2 | Mode chip placement (home_summary tile vs nav-card chip) |
| F3 | Inbox positioning (above vs below media mini-player) |
| F4 | Desktop side-by-side splits (Climate+Weather, Media+Speakers, etc.) |
| F5 | Per-light semantic icon override list (curate per room iteratively with screenshots) |
| F6 | Row label truncation strategy (2-line vs shortened name vs icon-only) |
| F7 | TV Mode as 4th scene cycle position (in or out) |
| F8 | Per-light fine-control popup `#light-detail-<entity>` (defer vs include in Plan F2) |
| F9 | Queue management in Media page (defer vs include) |
| F10 | Source switcher (Sonos/Spotify/TV/Line-In) chip set in Media |

---

## §J — Risk Register

### J.1 — Subtle defects (users notice, agents don't)

| # | Risk | Detection | Mitigation |
|---|---|---|---|
| R1 | Rooms row label truncation (LIVE-2) | 390×844 capture | Plan F Rooms tranche resolves with name shortening + 2-line layout option |
| R2 | Identical orbs across rooms (LIVE-1) | DOM snapshot + visual capture | Plan F YAML refresh + Plan E card defense |
| R3 | Popup deep-link from notification doesn't restore popup state | Manual: tap notification on locked phone | Plan A smoke test |
| R4 | iOS Safari swipe-down doesn't dismiss Bubble Card popup | Manual gesture test | Plan A smoke test |
| R5 | Bottom-offset misaligns with nav-card at landscape | 768×1024 + landscape capture | Plan A smoke at all 4 breakpoints |
| R6 | Mode_strip highlight lags state change | Watch chip during ZEN32 cycle | Plan F2 visual debounce + race test |
| R7 | Climate dual-thumb drag accidentally fires tap_action | Manual drag test | Plan F2 drag-vs-tap disambiguation |
| R8 | Scrolling Home accidentally fires hold gesture on rooms-card | Manual scroll test | Alt I makes this moot (no body-hold) |
| R9 | Per-room popup loads slowly first-open (lazy init) | Time-to-first-paint check | Plan F2 pre-warm OR skeleton state |
| R10 | "All On"/"All Off" Actions chip vs Rooms power button cover different entities | Cross-check via light_entities audit | Plan B light-groups audit (LIVE-3) |

### J.2 — Catastrophic risks (daily-use blocker)

| # | Risk | Probability | Mitigation |
|---|---|---|---|
| C1 | Bubble 3.2.1 upgrade breaks existing /tunet-overview popups (alarm-edit Browser Mod) | Medium | Cut over candidate URL first (`tunet-home`), parallel-run, never break overview until graded |
| C2 | Cut-over happens while Mac sleeps; he wakes to broken Home | Medium | **Cut-over governance**: only after Mac's explicit M3 stamp + only when Mac is awake to grade for ≥30 min post-cut |
| C3 | OAL Evening mode breaks because scene-name + entity_id drift in automations | Medium | Grep `automation/*.yaml` for hardcoded mode names before rename; use entity_id only |
| C4 | HomeKit exposure adds duplicate scenes to iPhone Home, confusing Siri | Low-med | Curate HomeKit list explicitly; smoke-test Siri commands post-deploy |
| C5 | New HVAC sparklines explode Lovelace render on iPhone Safari | Low | Lighthouse-style perf check at 390px |
| C6 | tunet-home-v2 with the row defect ships as production | Medium | Cutover gated on LIVE-1+2 closure (Plan E + Plan F Rooms tranche) |

### J.3 — User-eye validation territory (M1 mandatory)

- Every popup composition change → production-mirror at 390×844 + share to phone
- Every variant swap → production-mirror at all 4 breakpoints (390, 768, 1024, 1440)
- ZEN32 redesign → physical button test by Mac (no remote test possible)
- HomeKit exposure → Siri command test by Mac
- New scenes → activate each from each surface (chip, dropdown, ZEN32, Siri) and confirm

### J.4 — External dependencies

| Dependency | Risk | Mitigation |
|---|---|---|
| Bubble 3.2.1 stability on iOS Safari | Untested at scale | Plan A smoke test; fall-back to 3.1.1 if breakage |
| HACS upgrade path for Bubble Card | May require manual reload after HA restart | Plan A documents rollback |
| HA breaking changes in upcoming release | `homekit:` syntax may change | Lock HA version for T0-T7 duration |
| Sonos firmware updates | May fix or break silent-fire | Out of dashboard scope; track separately |
| iOS push-notification deep-link behavior | iOS may strip hash fragments | Plan A smoke test must include deep-link from phone |

---

## §K — Verification (How to Test the Plan End-to-End)

When Mac signs off on this plan and Plan F1 architecture lock, the implementation is verified as follows:

1. **Plan A smoke test (T0 gate)**:
   - Open candidate URL (`/tunet-home-v2/home`) at 390×844 on iPhone Safari
   - Tap each room tile → corresponding Bubble 3.2.1 popup renders
   - Swipe-down on popup → dismisses to Home
   - Tap "Open Room" button → dismisses popup + navigates to subview
   - Direct URL `/tunet-home-v2/home#room-bedroom` → opens Home + Bedroom popup
   - Push notification with `data.url: /tunet-home-v2/home#room-bedroom` → tap notification → lands on Home + popup open
   - All 4 breakpoints (390, 768, 1024, 1440) tested
   - Light/dark theme tested

2. **Plan B verification (T1 gate)**:
   - All sensors in §D wireframes resolve to non-`unknown` states (or are flagged with stub UI)
   - "OAL Evening" mode appears in mode dropdown
   - Kitchen counter night bound respected (manual check)
   - Entry main spot auto-off fires at expected time

3. **Plan E rooms-card verification (LIVE-1, LIVE-2)**:
   - Production-mirror capture at 390×844: per-room orbs show DIFFERENT icons (lamp ≠ light ≠ pendant)
   - Row labels readable (no "Kit..." truncation)
   - Mac signs off via M1 review block

4. **Plan F2-F3 dashboard verification**:
   - Home page composition matches §D.1 wireframe
   - Tap room body → Bubble 3.2.1 popup opens (per Alt I gesture lock)
   - "Open Room" button navigates to subview
   - Subview matches §D.3 template
   - Media mini-player at bottom of Home
   - All 5 pages reachable via nav
   - All 8 popups reachable per §C.1

5. **Plan F7 cutover verification**:
   - Mac confirms M3 stamp on the new dashboard
   - Mac is awake and able to grade for 30+ min post-cutover
   - Old `/tunet-overview` remains as fallback for 7 days
   - After 7 days of no defects, `/tunet-overview` deleted

**M1 contract applies at every step**: production-mirror capture, inline image read-back, defect inventory, "would Mac be happy" answer, share-with-user when iterating.

---

## §L — What This Plan Explicitly Disagrees With Mac On

In the spirit of ownership-mode (Working Relationship Frame), three direct disagreements need Mac's explicit confirm/override:

1. **Disagreement 1: gesture lock.** Mac's verbal "hold = popup with quick actions + expand button" creates collisions (§A.1). Recommendation is **Alt I** (tap = popup, button-in-popup = page). Mac confirm or override.

2. **Disagreement 2: composition order.** Wireframe doc §3.1 Option A defaults to Scenes-first. Recommendation is **Rooms-first AND Scenes-first both above-the-fold**. Mac confirm or override.

3. **Disagreement 3: media placement.** Mac's verbal didn't mention an Apple-Music-style persistent mini-player. Recommendation is **mini-player at Home bottom + dedicated Media page** (not mid-scroll media-card). Mac confirm or override.

Each disagreement is grounded in:
- Pressure-test of failure modes (§A.2)
- Best-in-class comparison (§B)
- Live defect observation (§E)

The Working Relationship Frame explicitly authorizes this kind of surfaced disagreement. The session_arc_popup_b_to_frame letter from prior-me names "silent best-effort that ships defects" as the failure mode — surfacing disagreement is the opposite of that pattern.

---

## §M — Done Definition

This plan is done when:
1. Mac reads it
2. Mac decides D1-D9 (blocking decisions)
3. Mac signs off (or overrides) the three disagreements in §L
4. Plan A kicks off with the popup smoke test
5. Plan F1 starts with the wireframe doc Q1-Q9 picks locked per this plan's recommendations

This plan does NOT execute itself. It is the design synthesis layer. Execution happens via the portfolio plans (A through F) per the sequencing in §H.

**M3 applies**: Mac holds the done stamp on this plan AND on every tranche it feeds.

---

## Appendix — Research that informed this plan

- 3 Explore agents (returned, summarized in early draft of this file):
  - Agent #1: 3-dashboard YAML comparison (`tunet-suite-config.yaml`, `tunet-overview-storage-config.yaml`, `tunet-suite-storage-config.yaml`)
  - Agent #2: Media architecture audit (5 Sonos + 4 TVs + 2 Spotify + 68 orphan browser_mod entities; MEDIA-1/2/3 defects)
  - Agent #3: PA framework + complete defect ledger + interaction model contract + 4-layer visual hierarchy + Sections grid model
- 2 Plan agents (returned, fed §A and §F directly):
  - Wireframe/IA agent: pressure-test of popup contract with 4 alternatives; ASCII wireframes per surface
  - Adversarial/sequencing agent: 8-direction pressure-test; PA absorption recommendation; risk register; critical path
- Live Playwright captures at 390×844:
  - `01-card-gallery-390-full.png` (Mac's "fairly decent" reference)
  - `02-overview-prod-390-full.png` (current production)
  - `03-home-v2-390-full.png` (today's candidate v2)
  - `04-suite-storage-rooms-390-full.png` (room popup demo source)
  - `05-suite-storage-overview-390-full.png` (richer suite-storage home)
  - `09-v2-popup-after-click.png` (failed popup render — tap fired navigate)
  - `10-living-room-subview-390.png` (live room subview reachable)
  - `11-suite-storage-media-390.png` (media page reference)
  - `12-suite-storage-bedroom-390.png` (rich bedroom subview reference)
  - `13-suite-storage-alarms-390.png` (alarms subview reference)
- DOM accessibility snapshots confirming CD-1 (orb defect at code level)
- Mac's desktop Chrome screenshot of /tunet-suite/card-gallery Living Room popup (CD-2)
- Pre-existing artifacts I synthesized rather than duplicated:
  - `/home/mac/.claude/plans/tunet-portfolio-roadmap-2026-05-23.md`
  - `/home/mac/HA/implementation_10/docs/wireframes/tunet-home-v2-wireframe-2026-05-23.md`
  - `/home/mac/.claude/plans/tunet-page-architecture.md`
  - `/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-home-v2-config.yaml`
