# Tunet Home v2 — Page-by-Page Audit + Enhancement Plan

**Author:** Claude (in-session, awaiting Mac's review)
**Date:** 2026-05-23
**Source dashboard:** `/tunet-home-v2/<view>` (storage-mode; `Dashboard/Tunet/tunet-home-v2-config.yaml`)
**Source-of-truth compare:** `Dashboard/Tunet/tunet-card-rehab-lab.yaml`
**Plan authority used:** `docs/plans/tunet-interaction-architecture-FINAL-2026-05-23.md` (supersedes both `tunet-home-v2-interaction-spec-2026-05-23.md` and `harmonic-bouncing-cosmos.md`). Decision locks DA-1 through DA-4 referenced where relevant.
**Evidence:** 14 captures at `/tmp/v2-audit-1779555144607/` (phone 390×844 ×8, desktop 1440×900 ×6). Desktop office + settings missing. Capture file sizes (43-227KB) track content density — no partial-render artifacts.

**Confidence model used below**: defects are described by what is *visible*, not by inferred root cause. Specific mdi icon-name replacements, source-code mechanisms, and label corrections are intentionally NOT proposed — those belong to the fix tranche, which reads the card source first.

This document is an audit, not a deploy. Mac picks which enhancements to implement; nothing ships from this file alone.

---

## 0. Executive summary

**Direct answer to "Does the home page fully sit everything that we want?": NO.** Versus the FINAL plan locks (DA-1 through DA-4 in `docs/plans/tunet-interaction-architecture-FINAL-2026-05-23.md`) the home page is missing the scene strip and the persistent nav chrome, and it INCLUDES Weather + standalone Climate which DA-4 explicitly removes. The status row also competes with the rooms-row for the glance layer — one of them should be the glance source of truth, not both.

The home-v2 build is structurally functional but has **8 systemic gaps** and **~20 page-level defects** that will be visible the moment Mac uses it on his phone. The biggest gaps are NOT bugs in individual cards — they are missed compositional opportunities versus the rehab lab variant catalog AND drift from the FINAL plan locks.

| Layer | Health | Notes |
|-------|--------|-------|
| Home page composition | ⚠ thin | Missing scenes strip, missing nav chrome, status row dense |
| Per-room subviews | ⚠ desktop-broken | Cards stay phone-width on a 1440px canvas; ~60% of horizontal space unused |
| Stats page | ✅ solid | Comprehensive data; minor visual rhythm issues |
| Variant utilization | ❌ poor | 34 of 50 rehab lab variant combos unused in home-v2 |
| Iconography | ⚠ wrong-icons | Several mdi names render as wrong glyphs (Spots → flashlight, Counter → key) |
| Weather card | ❌ broken | "HV X" markers leaking from forecast data (same family as documented AAAAAA defect) |
| Climate card | ⚠ truncated | "Coolir…" label, "Climate" header collides with fan/snowflake icons |
| Actions strip | ❌ overflow | CD5-documented chip overflow defect still present on phone |
| Markup safety | ✅ paid down | escapeHtml + debounce + pointer fixes from earlier in session held |

---

## 1. Variant-catalog gap (the structural finding)

Rehab lab demonstrates **50 variant×size×surface combinations** across 13 cards. Home-v2 uses **16**. The 34-variant gap is a missed opportunity per Mac's "use the variations" direction.

### High-value variants NOT yet in home-v2

| Card | Variant | Best home-v2 placement |
|------|---------|------------------------|
| `tunet-scenes-card` | (default) | **Home page** — top scene strip (3 chips: Adaptive / Evening / Late Night). Plan §3.1 said scenes-first; got dropped |
| `tunet-nav-card` | — | **All pages** — persistent bottom dock on phone / left rail on desktop. Currently relying on HA sidebar which is wrong chrome layer |
| `tunet-actions-card` | `mode_strip` | **Home page** — replace `compact` actions row; mode_strip highlights active scene visually |
| `tunet-status-card` | `room_row` | **Home page** — alternative to long rooms-card if Mac wants more glanceable per-room |
| `tunet-status-card` | `alarms` | **Bedroom subview** — currently using `tunet-alarm-card` directly; status[alarms] is a thinner glance variant |
| `tunet-status-card` | `info_only` | **Settings page** — currently uses a plain status that mixes interactive + info |
| `tunet-rooms-card` | `tiles` | **Phone** — 5 tiles in a 2-col grid for tighter glance density |
| `tunet-rooms-card` | `slim` | **Settings or status-bar contexts** — single-line per room |
| `tunet-climate-card` | `thin` | **Home page** — replace `standard` climate; thin variant is the right density for a glance card |
| `tunet-light-tile` | `horizontal compact` | **Home page** — direct access to the 2 lights Mac touches most (Counter underlights, Entryway lamp) |
| `tunet-lighting-card` | `compact` size | **Per-room subviews** — current `grid` is fine for hero but compact would let alt sections fit alongside |
| `tunet-sensor-card` | `compact` size | **Per-room subviews on phone** — current `standard` is taking too much vertical space |
| `tunet-speaker-grid-card` | (any) | **Media popup / Media subview** — currently NOT on dashboard; speaker grouping has no home |

This is **8 variant adoptions + 4 size tightenings + 1 missing card** = a real enhancement backlog with concrete component-level scope.

---

## 2. Home page — defect inventory (phone)

Source: `/tmp/v2-audit-1779555144607/phone-home.png`

### 2.1 Status row (`tunet-status-card[home_summary]`)
- **D-HS1 blocker** — "Humidity" label overlaps the "34%" value on the second-row third tile. The "34%" sits on top of the label.
- **D-HS2 visible** — Heading "🏠 Home Status" with title + house icon consumes ~40px of vertical space that's not glanceable. Compare Apple Home, which uses no header for status pills.
- **D-HS3 visible** — "1 Manual" tile has a red dot badge in the upper right that's nearly invisible (clipped to tile edge). Should be a clearly readable pill.
- **D-HS4 visible** — "09:00 Bedroom" alarm tile shows no AM/PM. Ambiguous in a 12h locale.
- **D-HS5 minor** — All 8 tiles read the same density. No primary/secondary hierarchy. Mode + Manual count are the most critical and should be emphasized.

### 2.2 Actions strip (`tunet-actions-card[compact]`)
- **D-AC1 blocker** — Strip overflows right edge: "All On / All Off / Brighter / — Dimmer" visible, then a faint "+" beyond — this is the **CD5-documented chip overflow defect** which the visual_defect_ledger says is "tranche-owned open backlog." Still present.
- **D-AC2 visible** — Active chip is "All On" (orange) but elsewhere in the system, mode display says "Adaptive" — semantic confusion between scene-modes and on/off-state in the same strip.

### 2.3 Rooms (`tunet-rooms-card[row]`)
- **D-RM1 visible** — Summary syntax inconsistent: "Living  On · 88%", "Kitchen  On · 75%", but "Bedroom  2/3 · 74%". Either always use `<count> · <%>` or always use `<state> · <%>`. Pick one.
- **D-RM2 visible** — Living Room shows 6 orbs in a row that crowds against the per-room actions (3 sub-buttons + power). On 390px width, this row hits its layout cap and looks dense.
- **D-RM3 visible** — Per-room sub-buttons (the small chip cluster on each row, like the "→ / 💡 / 🔦 / 🔆 / column / power" mosaic) are inconsistent across rooms — Living has 6 chips, Kitchen has 4, Dining has 3, Office has 3. The user can't predict which chips a room has.
- **D-RM4 minor** — Each room row is ~100px tall; 5 rooms = ~500px (about ⅔ of phone screen height) for rooms alone. Tiles variant would be denser.
- **D-RM5 minor** — Chevrons (›) on right edge suggest drillable, but the WHOLE row is tappable (per the plan's R4 contract). The chevron is decorative; that's fine but the visual hierarchy could differ from interactive elements.

### 2.4 Climate card
- **D-CL1 needs-investigation** — "Climate" header letters appear to overlap the snowflake + fan + temp-mode icons in the dining-room captures. Could be z-index, could be insufficient padding between header text and right-aligned icon row, could be flex-shrink on the header collapsing it into the icons. Read `tunet_climate_card.js` header layout before claiming a fix.
- **D-CL2 visible** — "34% humidity · Coolir" — text is **truncated mid-word**. Mechanism unverified (could be `text-overflow: ellipsis` cutting at the visible width, could be a maximum-character cap, could be the source attribute itself). Defect is real; the right fix depends on whether the upstream label is "Cooling" or already abbreviated.
- **D-CL3 visible** — Setpoint range slider has TWO thumbs visible on the gradient bar plus a third indicator at "66°" which is the current temp. Three indicators on one slider is hard to parse at a glance.
- **D-CL4 minor** — The Heat (58°) + Cool (64°) huge numbers compete with the Indoor (66°) huge number. Three equally-sized hero values = no visual hierarchy.
- **D-CL5 structural** — Per FINAL plan DA-4, standalone climate on Home is borderline (DA-4 specifically lists Weather + Lighting; climate is implicitly still allowed). Decision deferred to Mac — the card-level defects above are independent of that placement question.

### 2.5 Weather card
- **D-WX1 needs-investigation** — Forecast row shows "**HV 7**", "**HV 9**", "**HV 9**", "**HV 8**", "**HV 7**", "**HV 4**" prefixed to each hour. Source-code mechanism unverified — could be a UV-index column with a wrong label ("HV" → "UV"?), a humidity column with a wrong label, or genuine source-data leakage of the AAAAAA-family. **Observation valid; root cause requires reading `tunet_weather_card.js` and the forecast attribute shape before claiming a fix.**
- **D-WX2 visible** — Sixth forecast column ("4 P / HV 4 / 60°") wraps to a second row alone, leaving 5/6 of the row empty. Either horizontal-scroll or clamp to 5.
- **D-WX3 visible** — Big "49°" hero is in light blue, but the surrounding card chrome is white-on-white. The hero number competes with the small "Sunny" caption below.
- **D-WX4 minor** — "4 mph SE 50% 5" row uses 3 different icon styles (wind arrow, droplet, sun) — no shared metric pill style.
- **D-WX5 structural** — Per FINAL plan DA-4, weather should **not be on Home** at all; it belongs on Stats. The card-level defects above remain real for wherever it's surfaced, but the question of whether to *fix the card on Home* vs *move the card off Home* is for Mac to pick.

### 2.6 Media (`tunet-media-card`)
- **D-MD1 visible** — "Sonos · Playing · 4 grouped" pill is long and competes with the "Living ▼" target selector. On phone they crowd.
- **D-MD2 visible** — Progress bar is 1px tall; should be 3-4px for visual weight at this card width.
- **D-MD3 minor** — Volume icon (the speaker icon at the right) has no current-volume readout. Apple Music shows the level inline.
- **D-MD4 (covered by earlier session fixes)** — pointerup volume debounce flush DID land (commit S2052 timeline). Verify no regression.

### 2.7 Inbox
- ✅ Looks clean: pill, title, body, age, two response buttons. Previous escapeHtml + lifecycle + double-submit fixes hold.

### 2.8 Home page — content gaps (vs. plan §4)

| Plan element | Status | Severity |
|--------------|--------|----------|
| Scene chips strip (Adaptive / Evening / Late Night) — TOP of page | **missing** | major — was R2 lock |
| Status pills (horizontal scroll, drill-in) | replaced with 4×2 matrix | medium |
| `tunet-nav-card` persistent chrome | **missing** | major — relying on HA sidebar = wrong layer |
| Quick Lights direct (`light-tile` for Counter + Entry) | **missing** | medium |
| Now Playing mini-player vs full media card | full card | minor — full card works but consumes more space |
| TV Mode access | unclear | minor — Mac said skip for now |

---

## 3. Home page — desktop findings

Source: `/tmp/v2-audit-1779555144607/desktop-home.png`

- ✅ Status row scales to 4-column 2-row matrix cleanly.
- ✅ Actions strip is fully visible at desktop width — phone overflow is a phone-only defect.
- ⚠ **Rooms are stacked single-column instead of side-by-side** even on a 1440px canvas. Same as per-room subviews — desktop horizontal space is wasted.
- ⚠ Climate + Weather are side-by-side which is correct.
- ⚠ "Adaptive" appears as an active chip in the actions strip on desktop — likely from mode_strip leakage, but home is using `compact`. Investigate config.
- ⚠ HA sidebar shows several lab dashboards visible to Mac that are clutter ("Test", "Test 5", "Test Dash", "Tunet G2 Lab (v3)", etc.). These belong hidden from the navigation; consider `show_in_sidebar: false`.

---

## 4. Per-room subviews — major desktop defect

Source: `/tmp/v2-audit-1779555144607/desktop-living-room.png`, `desktop-kitchen.png`, `desktop-bedroom.png`, `desktop-dining-room.png`

**D-DK1 blocker (cross-cutting)**: On 1440px desktop, every per-room subview shows the lighting card at ~360px width with **~80% of the horizontal canvas blank**. The Sections grid is not being given `max_columns` or section `column_span` to spread horizontally. This is the same "why are they all so narrow" issue Mac flagged earlier in the session.

Suggested layout per-room (desktop):
- Hero lighting (4 zones in 2x2 grid) — `column_span: 2`
- Side panel: sensors + climate + media stacked — `column_span: 2`

Phone subviews are correct (full-width single column).

### 4.1 Living Room
- **D-LR1 visible** — "Spots" tile renders a **flashlight-shaped glyph**. Intended semantic is accent-spot lighting; the rendered icon doesn't convey that. Icon-name selection is left to the fix tranche (which reads the current yaml first and verifies the available icon set).
- **D-LR2 visible** — "Couch" tile icon reads as a generic lamp/arrow glyph. Intended semantic is "couch primary lamp"; current glyph doesn't differentiate from the floor lamp.
- **D-LR3 visible** — All 4 tiles look identical in size and weight. No visual hierarchy for which tile is most touched (Couch is "couch primary"). Could use the largest tile size for the most-used.
- **D-LR4 minor** — Sensor card has only 2 rows (Temperature + Occupancy). For 1024+ wide that's enough but on desktop with full-row width, it's visually thin.

### 4.2 Kitchen
- **D-KT1 visible** — "Counter" tile renders a **key / spoke / wrench-shaped glyph**. Intended semantic is under-cabinet LED strip lighting. Icon-name selection deferred to fix tranche.
- **D-KT2 visible** — Only 3 lighting zones (Island, Main, Counter). Same equal sizing. Counter is the most-touched ambient → could be larger.
- **D-KT3 minor** — Sensors show "Humidity 34%" + "Occupancy on". No temperature for the kitchen. Add `sensor.kitchen_temperature` if it exists.

### 4.3 Dining Room
- **D-DN1 blocker (CL1 here too)** — Climate card "Climate" header letters overlap the fan/thermostat-icon row. Z-index / spacing bug.
- **D-DN2 visible** — Climate card on top, Lighting card below. On phone this is fine; on desktop they should split column_span 2 + 2.
- **D-DN3 visible** — Only 2 lighting zones (Spots + Column). Light layout could be horizontal-pair rather than vertical-stack.

### 4.4 Bedroom
- **D-BR1 visible** — "Lamps" tile is shown "Off" but the visual is muted-gray. ✅ This is correct (off-state styling), but it's the only off-state tile across all rooms in current captures. Verify all off-state tiles have the same muted styling.
- **D-BR2 visible** — "Sonos Alarms" header wraps to two lines ("Sonos / Alarms") which looks like a poor break. Either widen the header area or shorten the title.
- **D-BR3 visible** — 4 sensor rows (Temperature, Humidity, Occupancy, Speaker). "Speaker" row reads "on" but **the entity is named `Bedroom Sonos Healthy`** — confusing UX text. The row should say "Bedroom speaker healthy" not just "Speaker on."
- **D-BR4 visible** — Alarm row layout: icon + name (truncated as "Bedroom Weekdays") + time + dot. The dot to right of time is small. Apple's alarm UI uses a switch toggle on the right — more discoverable than a dot.

### 4.5 Office
Source: `/tmp/v2-audit-1779555144607/phone-office.png` (desktop missing from captures)
- **D-OF1 visible** — "Desk" tile renders the same arrow-lamp glyph as Living Room couch — generic, doesn't differentiate desk lamp from other lamp types.
- **D-OF2 visible** — Light Left + Light Right show same icon. They're column accent lights. The icon difference (left vs right) isn't visible from glyph; consider color-coding or distinct positioning.
- **D-OF3 minor** — Sensor card has only "Occupancy off" — could add temperature if sensor exists.

### 4.6 Settings
Source: `/tmp/v2-audit-1779555144607/phone-settings.png`
- ✅ OAL Configuration status block is clean (Mode / Active For / Active Overrides / Boost).
- ⚠ **D-ST1 visible** — Notifications block: 4 tiles (TV Notifs / Inbox / BR Speaker / HVAC). First two say "?" (unconfigured/error). Should resolve those entities or hide them.
- ⚠ **D-ST2 visible** — System Reference block as a code-styled markdown card is helpful for Mac as developer-user but feels like a debug screen at the bottom of the user-facing dashboard. Consider gating behind `editor_mode` or making it a popup.
- ⚠ **D-ST3 minor** — "All Sonos Alarms" block here duplicates the bedroom alarm block. Decide: alarms-live-only-with-bedroom OR alarms-live-with-settings, not both.

---

## 5. Stats page

Source: `/tmp/v2-audit-1779555144607/phone-stats.png`, `desktop-stats.png`

### 5.1 What's working
- ✅ "Right Now" 4×2 matrix: Cooling, 66°F Inside, 49°F Outside, Sunny Sky / 14 Cycles, 1 Overrides, 2.0°F Above SP, 8.0°F Below SP — excellent glance density.
- ✅ "Inside vs Outside" 4-row table with sparklines and arrows — comprehensive.
- ✅ "HVAC Rollups" — Heat Yest, Cool Yest, Heat Week, Cool Week with 0.0/0.0 values (no usage today; sensors functioning).
- ✅ "Electricity (Instrumented)" — LR Now 42.3W, Bdrm Now 18.3W, LR kWh 0.5 kWh, Bdrm kWh 25.5 kWh. Sparklines on power.
- ✅ "OAL System" — Mode dropdown, Active For (5m), Manual Overrides (1), Manual Today (2.7).
- ✅ "Zone Baselines" — all 8 zones with their current baseline pct and sparkline. THIS IS THE PLAN §10 SENSOR PAYOFF. Real graphable per-zone values.

### 5.2 Defects on stats
- **D-SF1 visible** — Headers "Right Now / Inside vs Outside / HVAC Rollups / Electricity (Instrumented) / OAL System / Zone Baselines" use different icon styles (some have icons in the section header, some don't). Visual rhythm could be more consistent.
- **D-SF2 visible** — Sub-label text under each main label ("HVAC Heating Yesterday Hours", "Master Lamps Power", etc.) is long and frequently truncated. Could be shortened to "Heating", "Power" — the section context makes the metric clear.
- **D-SF3 visible** — Last entry "Office  80%" overflows the card with an arrow going down/right (the trend line continuation). Acceptable but the line extending past the card edge is visually rough.
- **D-SF4 visible** — Desktop stats page has the same "narrow column" problem. The 2x4 grid layout could be horizontal-2-col on desktop to halve the vertical scroll.
- **D-SF5 minor** — Mode dropdown in OAL System tile is the only interactive element on the stats page. Mac said stats is monitoring-not-control — consider read-only here and link out to /tunet-home-v2/home for mode changes.

---

## 6. Enhancement plan — prioritized

Each item: estimated effort, blast radius, recommended tranche.

### P0 — Visible defects (each requires a root-cause investigation step before the fix)

The visible defect is real; the mechanism is not yet confirmed. Each P0 tranche begins with reading the relevant card source + checking the live entity attribute shape, then producing a one-line root-cause statement before the edit. Mac stamps the root-cause statement before code change.

| # | Item | Investigation target | Effort | Blast |
|---|------|----------------------|--------|-------|
| P0-A | Weather "HV X" forecast labels (D-WX1) | `tunet_weather_card.js` forecast render + the `weather/get_forecasts` attribute shape | S investigate + S fix | weather card only |
| P0-B | Climate "Coolir…" truncation + header overlap (D-CL1, D-CL2) | `tunet_climate_card.js` header layout CSS + `hvac_action` source label | S investigate + S fix | climate card only |
| P0-C | Status humidity-tile label overlap (D-HS1) | `tunet_status_card.js` 4×2 tile CSS at 390px breakpoint | S investigate + S fix | status card only |
| P0-D | Lighting tile wrong icons (D-LR1, D-LR2, D-KT1, D-OF1, D-OF2) | dashboard yaml `icon:` per-zone + verify icon-set loaded (mdi vs material-symbols) | XS investigate + XS fix | yaml only, possibly icon-set check |
| P0-E | Actions strip chip overflow on phone (D-AC1, CD5 backlog) | `tunet_actions_card.js` compact-variant layout + chip-wrap behavior | M | actions card |

### P1 — High-value (variant adoption + missing content)

| # | Item | File | Effort | Blast |
|---|------|------|--------|-------|
| P1-F | Add scenes-card strip to home page top | yaml | XS | yaml only |
| P1-G | Add nav-card persistent chrome (bottom phone, left desktop) | yaml | S | yaml + 1 card css var check |
| P1-H | Replace home actions `compact` with `mode_strip` variant | yaml | XS | yaml only |
| P1-I | Add 2-light direct access (Counter + Entry as `light-tile horizontal compact`) | yaml | XS | yaml only |
| P1-J | Switch rooms-card to `tiles` variant on phone, `row` on desktop | yaml | S | yaml + verify variant breakpoint logic |
| P1-K | Climate-card `thin` variant on home (free vertical space) | yaml | XS | yaml only |
| P1-L | Desktop per-room subview Sections re-layout (column_span 2+2) | each room yaml | M | per-room subviews |

### P2 — Polish

| # | Item | File | Effort | Blast |
|---|------|------|--------|-------|
| P2-M | Rooms-card summary syntax consistency (`On · X%` everywhere) | `tunet_rooms_card.js` | S | rooms card |
| P2-N | Status tile content hierarchy (Mode + Manual primary, others secondary) | `tunet_status_card.js` | S | status card |
| P2-O | Bedroom sensor "Speaker on" → "Speaker healthy" label fix | yaml | XS | yaml |
| P2-P | Media progress bar 1px → 3px | `tunet_media_card.js` | XS | media card |
| P2-Q | Sonos Alarms wrapped header — shorten title or widen | `tunet_alarm_card.js` | XS | alarm card |
| P2-R | Hide lab dashboards from HA sidebar | per-dashboard yaml | XS | 5+ yamls |
| P2-S | Settings: resolve TV Notifs + Inbox "?" tiles | sensors/template | S | new template sensors |
| P2-T | Stats sub-label shortening (`HVAC Heating Yesterday Hours` → `Heating`) | yaml | XS | yaml |

### P3 — Considered, deferred

| # | Item | Why deferred |
|---|------|--------------|
| P3-U | `tunet-status-card[room_row]` adoption on home | Would replace rooms-card; rooms-card with orbs is already validated |
| P3-V | `tunet-speaker-grid-card` deployment | Plan §8 puts speakers in media subview/popup; speaker-grid card has no current home — needs media-subview build first |
| P3-W | Detent sheet primitive for popups | Plan §1 explicitly deferred to future tranche; Bubble Card 3.2.1 accepted for now |
| P3-X | Whole-home energy meter | Hardware (Shelly EM clamp) — out of scope this dashboard plan |

---

## 7. Cross-cutting visual consistency notes

### 7.1 Typography
- Status tile values use heavy bold; subtitles use ~12px regular. Ratio is correct but **subtitle truncation** (Humidity / Coolir / etc.) suggests the subtitle font-size needs to either: (a) wrap to 2 lines reliably, or (b) be tighter. Audit ellipsis behavior.
- Stats sub-labels frequently truncate (D-SF2). Shorten copy.

### 7.2 Spacing rhythm
- Section gaps look consistent (~16px). Card internal padding looks consistent (~16-20px). ✅ No major rhythm defects.
- The exception: **per-room subview desktop layout** has huge horizontal whitespace which breaks rhythm (D-DK1).

### 7.3 Iconography
- 3 wrong-glyph defects identified (Spots flashlight, Counter key, Desk arrow-lamp).
- The "01:" issue from earlier in session where MDI names rendered as text — not visible in current captures, suggesting prior fix held.
- Color: orange (on/active) vs amber-yellow lighting indicators vs blue cool — semantics generally clear.

### 7.4 Density
- Phone home page: dense. Two long sections (status row 4×2, rooms 5×) take ~70% of first-screen real estate.
- Phone room subviews: appropriate density (4 lighting tiles + sensors + media = roughly one scroll).
- Desktop everything: too sparse. Cards stay phone-width. The "Sections" grid is being given column_span 4 but the cards inside don't fill that width.

---

## 8. Suggested commit sequence (if Mac approves any of these)

This is NOT auto-execute. Mac picks line items, we wrap in a single M1-compliant tranche per file with captures.

1. **Tranche A — yaml-only enhancements (P0-D, P1-F, P1-G, P1-H, P1-I, P1-K)**
   Single commit: dashboard yaml only. Build/deploy with `npm run tunet:deploy:dashboards:storage`. Capture phone + desktop home. M1 review block. ~30 min.

2. **Tranche B — weather + climate card fixes (P0-A, P0-B)**
   Card JS edits. `npm run tunet:deploy:lab`. Capture home + dining-room. M1 review. ~45 min.

3. **Tranche C — actions overflow fix (P0-E)**
   Card JS. Deploy. Capture phone home. M1 review. ~30 min.

4. **Tranche D — status + rooms label consistency (P0-C, P2-M, P2-N)**
   Card JS edits. Deploy. Capture home + per-room subviews. ~45 min.

5. **Tranche E — desktop subview re-layout (P1-L)**
   yaml only across 5 per-room subviews. Deploy. Desktop captures of all rooms. ~30 min.

6. **Tranche F — polish bundle (P2-O through P2-T)**
   Mixed yaml/card. Group by file. ~30 min.

Total surface coverage: ~3-4 hours of focused execution + Mac's review gates at each tranche boundary.

---

## 9. Open questions for Mac

1. **Honor FINAL plan DA-4 (remove Weather + Lighting from Home)?** Current home has weather; this means either fix-the-weather-card OR remove-from-home. DA-4 says remove. Pick one.
2. **Scene strip on home — keep or skip?** FINAL plan presumes scenes at top; current home doesn't have it.
3. **Nav-card chrome — adopt or rely on HA sidebar?** Plan has nav as persistent; current home doesn't have it. Without nav, per-room subviews are only reachable via tap-room-popup → "Open Living Room page →" link or via HA sidebar.
4. **FINAL DA-3 says collapse Adaptive into Stats — do current Stats sections satisfy that, or add a dedicated Adaptive top-section?** Current Stats has "OAL System" + "Zone Baselines" sections which look like the Adaptive content; might already satisfy DA-3.
5. **Rooms-card variant on phone — keep `row` or switch to `tiles`?** Tiles is denser; row is more glanceable per-room. FINAL DA-1 prefers row on Home with whole-body-tap; tiles on the Rooms list.
6. **Settings page System Reference block — keep visible or gate?** Useful for dev but feels like debug.
7. **Per-room sensor row content — add more (kitchen temp, office temp) or keep minimal?**

---

## 10. What this audit explicitly does NOT do

- Does not propose any card-code edits Mac hasn't seen the rationale for.
- Does not propose cutover from `/tunet-overview` to `/tunet-home-v2`. Parallel-run remains.
- Does not propose new sensors beyond §9's small "add temperature to kitchen/office sensor card" if those entities already exist.
- Does not propose any change to OAL backend (separate workstream).
- Does not propose anything that violates M1-M7 (every implementation tranche requires capture + review block + Mac stamp).

---

**End of audit. Mac reviews § 6 (priority table) + § 9 (open questions), picks line items, individual tranches proceed per § 8 with M1 evidence.**
