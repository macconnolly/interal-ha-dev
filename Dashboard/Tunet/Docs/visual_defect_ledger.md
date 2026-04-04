Built from screenshot evidence on the live HA surfaces at `390x844`, `768x1024`, `1024x1366`, and `1440x900`, with phone-focused card captures from the rehab lab plus full-page captures from G5 and Overview. Primary evidence: [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png), [audit-390-status-open.png](/home/mac/HA/implementation_10/audit-390-status-open.png), [audit-390-status-sonos-open.png](/home/mac/HA/implementation_10/audit-390-status-sonos-open.png), [audit-768-open-states.png](/home/mac/HA/implementation_10/audit-768-open-states.png), [g5-390-full.png](/home/mac/HA/implementation_10/g5-390-full.png), [g5-768-full.png](/home/mac/HA/implementation_10/g5-768-full.png), [g5-1024-full.png](/home/mac/HA/implementation_10/g5-1024-full.png), [g5-1440-full.png](/home/mac/HA/implementation_10/g5-1440-full.png), [overview-390-full.png](/home/mac/HA/implementation_10/overview-390-full.png).

This file now separates:
1. normalized master status summaries at the top of the file
2. detailed coherent-build evidence in the appendix below

When the normalized section and the appendix differ, the normalized section wins.

## Normalized Status Model

- `Open runtime defect`: current runtime behavior materially fails the current per-card contract or whole-home usage contract.
- `Doc contradiction`: docs disagree with each other or with current runtime truth, but this is not itself a live card failure.
- `Composition constraint`: the card is healthy inside its intended role; the issue appears when the card is used outside that role or in the wrong composition.
- `Closed / stale`: earlier issue framing is superseded by newer coherent-build evidence.
- `Implementation backlog`: decision-complete owning tranche and concrete follow-up scope for still-relevant work.

### Canonical Decision Matrix

| Card | Whole-home role | Normalized runtime position | Owning tranche |
|------|-----------------|-----------------------------|----------------|
| `tunet-actions-card` | utility strip | real phone overflow issue; editor wording corrected | CD5 |
| `tunet-scenes-card` | utility strip | runtime healthy; contract cleanup only | CD5 |
| `tunet-light-tile` | atomic detail tile | healthy card; one phone-truncation polish item | CD6 |
| `tunet-lighting-card` | canonical room-detail surface | worst active card-level layout risk | CD6 |
| `tunet-rooms-card` | overview/navigation | row-mode phone density remains open | CD7 |
| `tunet-climate-card` | information companion | healthy card; composition caveats only | CD8 |
| `tunet-weather-card` | information companion | variant-specific phone-density issue | CD8 |
| `tunet-sensor-card` | information rows | raw-ID defect closed; contract clarity remains | CD8 |
| `tunet-status-card` | locked summary/info surface | real phone density + dropdown-quality defects remain | CD11 |
| `tunet-media-card` | primary media transport surface | visual failure claim closed; naming/semantics remain | CD9 |
| `tunet-sonos-card` | inline-speaker Sonos surface | active phone/tablet width failures remain | CD9 |
| `tunet-speaker-grid-card` | dedicated speaker-management grid | dense/default layouts fail; compact 2-col remains viable | CD9 |
| `tunet-nav-card` | chrome | desktop/sidebar offset conflict remains | CD10 |

### Tranche-Owned Open Backlog

- `CD5`
  - `tunet-actions-card`: phone `mode_strip` chip overflow
  - `tunet-scenes-card`: keep strip-vs-wrap contract explicit; no active runtime failure
- `CD6`
  - `tunet-light-tile`: horizontal phone truncation polish only
  - `tunet-lighting-card`: fixed-width cap, centered dead space, scroll clipping, and unsafe 3-col phone defaults
- `CD7`
  - `tunet-rooms-card`: row-mode phone density/truncation; preserve overview/navigation role
- `CD8`
  - `tunet-weather-card`: toggle-heavy phone density
  - `tunet-sensor-card`: `label` naming-contract clarity only
  - `tunet-climate-card`: no redesign backlog beyond composition discipline
- `CD9`
  - `tunet-media-card`: room-identity naming and pointer-first group-membership semantics
  - `tunet-sonos-card`: source-button/dropdown and speaker-strip width failures
  - `tunet-speaker-grid-card`: dense/default layout failure, not the whole family
- `CD10`
  - `tunet-nav-card`: desktop rail/sidebar coexistence and offset leakage
- `CD11`
  - `tunet-status-card`: 4-col phone density and dropdown/runtime quality under lock

**Global**
- Highest-confidence active card defects remain: lighting, rooms row density, status small-screen density/dropdown behavior, sonos width overflow, and nav desktop/sidebar conflict.
- Variant-specific problems remain real for actions, weather, and speaker-grid, but they are not uniform card-family failures.
- Some earlier complaints were really composition/surface issues, not card defects: light-tile orphaning and climate paired-phone crowding belong in surface composition decisions.
- Stale or narrowed items are now treated accordingly: sensor raw entity IDs, broad media visual-failure framing, broad mobile-nav instability framing, and broad “speaker-grid is not phone-safe at all” framing.
- Cross-cutting doc debt remains: icon-field editor consistency, actions editor wording, scenes `allow_wrap` default wording, sensor naming-contract clarity, status dropdown-confidence wording, and nav layout-reference overclaim.

**1. `tunet-actions-card`**
- `Closed [CD5]`: mode_strip and relaxed chip overflow resolved — wraps and fills each row under phone-width pressure; compact default strips scroll horizontally.
- `Closed [CD5]`: doc contradiction resolved — cards_reference.md updated to reflect editor + yaml-compatible actions[].
- `Closed [CD5]`: row/height contract normalized via layout helper driving getCardSize/getGridOptions with variant-aware min_columns/min_rows.
- `Composition constraint`: “narrow utility row dropped into oversized sections” is a surface-composition note, not a card defect.

**2. `tunet-scenes-card`**
- `Closed [CD5]`: header confirmed semantic (role=”heading” aria-level=”3”); icon marked decorative (aria-hidden).
- `Closed [CD5]`: getGridOptions now tracks allow_wrap + show_header for intentional sizing; docs updated.
- `Closed [CD5]`: unavailable chip dispatch guard added (early return in _activate when disabled).
- `Closed [CD5]`: doc contradiction resolved — wrap-first contract explicit in reference.

**3. `tunet-light-tile`**
- `Composition constraint`: the “orphaned” phone look is usually a composition issue, not a card-contract failure.
- `Open runtime defect [CD6]`: horizontal-variant truncation on phone remains the one real card-level polish issue.
- `Closed / stale`: broad “light tile is a major failure” framing is no longer accurate.
- `Implementation backlog [CD6]`: keep this card scoped as an atomic detail tile, not an overview surface.

**4. `tunet-lighting-card`**
- `Open runtime defect [CD6]`: this remains the worst active layout card. Scroll clipping, fixed-width column behavior, and poor phone/tablet adaptation are true card-level defects.
- `Doc contradiction`: the reference already calls this the worst Sections-risk card, but it previously under-described how severe the live detail-surface failures are.
- `Implementation backlog [CD6]`: explicit pressure points are [tunet_lighting_card.js#L383](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L383), [tunet_lighting_card.js#L389](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L389), [tunet_lighting_card.js#L396](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L396), and [tunet_lighting_card.js#L1259](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L1259).
- `Implementation backlog [CD6]`: this is the canonical room-detail light-control surface. `3` columns at `390px` is not an acceptable default.

**5. `tunet-rooms-card`**
- `Open runtime defect [CD7]`: row-mode phone density/truncation is real and remains open.
- `Composition constraint`: this card must be judged as room overview/navigation, not as the detailed room-light surface.
- `Doc contradiction`: older wording left too much room to evaluate it like a detail-lighting surface; that is now explicitly wrong.
- `Implementation backlog [CD7]`: tile/slim should be the phone-default overview variants until row density is brought under control.

**6. `tunet-climate-card`**
- `Composition constraint`: crowded standard+thin phone pairings are surface-placement issues, not evidence that the climate card itself is failing.
- `Doc contradiction`: “gold standard” must mean single-card visual/interaction baseline, not “every arbitrary paired composition is optimal.”
- `Closed / stale`: broad climate-card runtime-failure framing is no longer accurate.
- `Implementation backlog [CD8]`: keep climate largely stable; use it as the baseline, not a redesign sandbox.

**7. `tunet-weather-card`**
- `Open runtime defect [CD8]`: toggle-heavy variants still waste vertical space and feel dense on phone, but this is variant-specific rather than a universal failure.
- `Composition constraint`: fixed daily/hourly variants are the safer phone defaults; toggle-heavy auto-control variants should not be the default phone presentation.
- `Doc contradiction`: prior wording blurred the difference between healthier fixed variants and the heavier toggle-driven variants.
- `Implementation backlog [CD8]`: treat this as a P2 usability/density issue, not a primary suite-wide runtime failure.

**8. `tunet-sensor-card`**
- `Closed / stale`: the raw-entity-ID runtime defect is superseded by the coherent-build correction later in this file.
- `Doc contradiction`: the contract needs to stay explicit that `label` is the supported display-name key unless runtime support for `name` is formally added.
- `Implementation backlog [CD8]`: the remaining issue is config-contract clarity around [tunet_sensor_card.js#L710](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sensor_card.js#L710), not a current visual/runtime failure.

**9. `tunet-status-card`**
- `Open runtime defect [CD11]`: the 4-column summary matrix is not phone-safe at `390px`, and the dropdown/content model still behaves poorly on small screens.
- `Doc contradiction`: the reference overstated dropdown overlay quality; current behavior needs narrower wording.
- `Implementation backlog [CD11]`: keep these issues explicitly owned by the status lock/G3S path rather than leaking into other tranches.
- `Implementation backlog [CD11]`: phone-safe default is `2` columns unless labels are significantly shortened.

**10. `tunet-media-card`**
- `Closed / stale`: the earlier broad visual-failure framing is superseded by the coherent-build correction; the card itself renders acceptably at `390px` in the current build.
- `Open runtime defect [CD9]`: compact naming must not erase room identity; `_firstWordName()`-driven identity loss remains open.
- `Open runtime defect [CD9]`: the group-membership control remains pointer-first and is not a completed semantics contract.
- `Implementation backlog [CD9]`: key lines remain [tunet_media_card.js#L733](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L733), [tunet_media_card.js#L1077](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L1077), and [tunet_media_card.js#L1086](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L1086).

**11. `tunet-sonos-card`**
- `Open runtime defect [CD9]`: this remains one of the clearest true phone/tablet runtime failures. Source button/dropdown width handling and speaker-strip overflow are actively broken, not merely under pressure.
- `Doc contradiction`: the reference previously softened this as width pressure when current runtime shows active failure.
- `Implementation backlog [CD9]`: explicit pressure points are [tunet_sonos_card.js#L152](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L152), [tunet_sonos_card.js#L178](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L178), and [tunet_sonos_card.js#L1048](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L1048).

**12. `tunet-speaker-grid-card`**
- `Open runtime defect [CD9]`: dense/default configurations remain open defects; `4` columns at `390px` is not phone-safe.
- `Composition constraint`: compact `2`-column speaker-grid can be phone-safe; do not describe the whole family as uniformly broken on phone.
- `Doc contradiction`: earlier broad “not phone-safe” language is too absolute against the coherent-build correction later in this file.
- `Implementation backlog [CD9]`: keep the defect scoped to dense/default layouts rather than the entire card family.

**13. `tunet-nav-card`**
- `Open runtime defect [CD10]`: the real open issue is desktop rail/sidebar conflict plus global-offset layout mutation.
- `Closed / stale`: broad “mobile instability” framing is too broad; the coherent-build correction narrows the issue to the desktop/sidebar/offset path.
- `Doc contradiction`: the reference can still treat nav as the interaction/accessibility reference, but not as a layout-reference card until the offset strategy is stabilized.
- `Implementation backlog [CD10]`: key lines remain [tunet_nav_card.js#L180](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_nav_card.js#L180) and [tunet_nav_card.js#L478](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_nav_card.js#L478).

---

## Detailed Coherent-Build Evidence Appendix (2026-04-04, coherent build ?v=20260404_cd4)

This appendix preserves screenshot observations and lower-level notes. It is supporting evidence, not the normative backlog layer.

Evidence: audit-my-390-top.png through audit-my-390-s12.png, audit-my-768-top.png through audit-my-768-s10.png, audit-my-1440-top.png through audit-my-1440-s10.png, audit-nav-390-top.png, audit-nav-768-top.png, audit-nav-1440-top.png.

### 390px Card-by-Card (fresh coherent build)

**1. Actions Card (audit-my-390-top.png)**
- First strip (3 chips: All On, All Off, Bedtime): fits well, clean
- Second strip (mode_strip: Adaptive, TV Mode, Sleep, More Info): "More Info" clips to "More In..." — chip overflow confirmed
- Third strip (5 chips: All On, All Off, Bedtime, Sleep Mode): "Sleep Mode" truncated to "Sleep Mo..." at edge
- `P1`: mode_strip variant has too many chips for 390px; no wrap, no scroll indicator

**2. Scenes Card (audit-my-390-top.png)**
- First (with header, wrapped): "All On", "All Off", "Dim", "Entertain" — wraps to 2 rows. Clean, readable.
- Second (no header, strip): "All On", "All Off", "Dim", "Entertain" — single row, fits. Clean.
- Third (Relaxed Wrap): wraps to 2 rows. Clean.
- Scenes is actually one of the better-behaving cards at 390px. allow_wrap:true (CD4 fix) is working.

**3. Lighting Card (audit-my-390-s1.png, s2.png)**
- Grid Compact (2-col at 390px): tiles readable — "Couch 100%", "Floor 100%", "Spots 54%", "Credenza 100%", "Desk 100%", "Columns 84%". **2-col is appropriate for 390px.** Progress bars visible.
- Scroll Standard: "Living 80%", "Bedroom 67%", "Ceiling..." visible, but **"itchen" visible on second row left edge — left tile partially clipped by scroll container**. Scroll tiles cut off on left side when scrolled.
- `P0`: Scroll mode left-edge clipping confirmed — tiles on left are cut off even when scrolled all the way
- Section Surface + Expand Groups (3-col): "Couch La...", "Floor Lam...", "Credenza ..." — **names severely truncated at 3-col on 390px**
- `P0`: 3-col is too many columns for 390px; should be 2-col
- Tile Surface Grid Large (2-col): fits well

**4. Light Tile (audit-my-390-s3.png, s4.png)**
- Vert Compact: clean, readable "100%"
- Horiz Standard: clean, "100%" right-aligned
- Vert Large: clean, "54%" with wide progress bar
- Horiz Compact (no profiles): clean, "100%"
- Light tile in isolation is fine at 390px

**5. Rooms Card (audit-my-390-s4.png, s5.png)**
- Row mode: **"L" visible for Living Room — name truncated to single letter**. Status "C" and "·" visible but unreadable. Orbs (3) are tiny circles. Power button is **massive** relative to orbs (~3x size).
- `P0`: Room row mode is critically broken at 390px — single-letter names, invisible status, disproportionate power button
- Kitchen row: "Kitch..." with 3 orbs + power. Better than Living Room but still cramped.
- Bedroom row: "Bedr..." with "On · 47% · ..." truncated
- Tiles mode: "Living Room On · 100% bri", "Kitchen On · 100% bri", "Bedroom On · 67% bri" — **Tiles mode actually works well at 390px** in 2-col.
- Slim mode: "Living Room · 34% · 70°F" with orbs + power + chevron. Better than Row but still tight.
- `P1`: Row mode should not be the default at 390px or needs a phone-specific density reduction

**6. Climate Card (audit-my-390-s6.png)**
- Standard + humidity: "Indoor 70°" with "64° / 69°" heat/cool — slider visible, dual thumbs visible. Reasonable at 390px.
- Thin: "70° in · H 64° · C 69° · C..." — compressed single line. Works but cramped.
- Display range: "Indoor 70°" with "64° / 69°" — same as standard. Clean.
- Climate is genuinely OK at 390px in isolation. The "gold standard" holds for single-card usage.

**7. Weather Card (audit-my-390-s7.png, s8.png)**
- Auto modes + toggles: info-tile header, Daily/Hourly toggle row, Temp/Precip toggle row. 4 buttons eat vertical space before content.
- Temperature "43°", conditions, Wind/Humidity/UV/Pressure detail rows: readable
- Forecast tiles: NOW 49°/35°, SUN 56°/24°, MON 61°/26°, TUE 59°/29°, WED 61°/33° — readable in 5-col
- Fixed daily/temp, no toggles variant: cleaner — skips the toggle rows
- Hourly precipitation variant: hourly tiles "NOW, 2PM, 3PM, 4PM, 5PM" with "0.0mm" — readable
- `P2`: Toggle-heavy variants waste vertical space on phone; the "fixed daily" variant is better for phone

**8. Sensor Card (audit-my-390-s9.png)**
- Sparklines + thresholds: "Indoor Temp 70°F" with sparkline graph + trend arrow. **Sparklines ARE rendering now** (they weren't in earlier screenshots — the coherent build fixed this).
- "Humidity 34%", "Outdoor 43°F", "Bedroom Humidity 47%" — all with sparklines
- Standard, no profiles: "Outdoor Temp 43°F", "Indoor Temp 70°F", "Humidity 34%" with sparklines
- Large, minimal: "Dining 70°F", "Kitchen 34%" — clean
- `P2`: Sensor labels now show friendly names (not entity IDs!) — the coherent build resolved V-SNS-1. The stale base.js was likely the cause.
- **RESOLVED**: V-SNS-1 (raw entity IDs) was caused by stale tunet_base.js on server

**9. Status Card (audit-my-390-s10.png, s11.png)**
- Summary Matrix (4-col): "Home HOME", "Envir... ADAPTIVE", "Envir... MANUAL" (with Reset badge), "A... MODE" (dropdown) — **names severely truncated, 4-col is too dense**
- Second row: "Envir... SYSTEM", "E... BOOST", "7:27 SUNSET", "70°F INSIDE" — values readable but names cut
- `P0`: 4-col at 390px is unreadable for tiles with multi-word names
- Standard 2-col: "Environmental Boost / System", "Adaptive ˅ / Mode" — **much better**, readable
- "70°F / Temp", "34% / Humidity" — clean
- Timer + Alarm: "Environmental Boost / System", "Adaptive / Mode", "05:20 · Bath / Next Alarm", "2 / Enabled" — readable
- `P1`: The 4-col Summary Matrix variant should reduce to 2-col at phone width

**10. Media Card (audit-my-390-s11.png)**
- Full (progress + autodiscovery): album art + "I Need You / Lynyrd Skynyrd" + "2:12 / 6:55" progress + transport. "Living ˅" speaker dropdown. **Track title and artist visible!**
- Explicit speakers, no progress: same layout, clean
- Media card actually renders well at 390px in the current build. The earlier "thin strip" appearance was stale build.
- `P2`: "Living ˅" speaker name shortened by _firstWordName() — should show more of the name

**11. Sonos Card (audit-my-390-s11.png, s12.png)**
- Header shows album art + transport + "Living Room TV Sonos ..." — **source button text clips off right edge**
- Speaker tiles in horizontal scroll: "oom TV Son... 21%", "iving Room Credenza Sp... 32%", "Kitchen Sonos 46%", "Bat..." — **tiles clip on left edge, names truncated**
- `P0`: Source button overflows card width — text goes past right edge
- `P0`: Speaker tile names heavily truncated; horizontal scroll clips left tiles
- Second sonos instance: same issues

**12. Speaker Grid (audit-my-390-s12.png)**
- Compact 2-col: "Living Room 21%", "Dining Room 32%", "Kitchen 46%", "Bedroom Paused 64%" — **actually readable in 2-col!**
- Group All / Ungroup All buttons visible
- Standard 4-col: "Living Room" — only start of first tile visible; 4-col is way too many for 390px
- `P0`: 4-col speaker grid at 390px is unusable
- `P2`: 2-col compact speaker grid is genuinely fine at 390px

**13. Nav Card (audit-nav-390-top.png)**
- Bottom dock with 5 icons: home, compare (orange active), living, bedroom, and a 5th icon
- Clean bottom bar at 390px — **no left rail issue in this screenshot**
- The nav-lab page has "Nav Variant - Custom Items" text and empty content area
- `P2`: The earlier "left rail" issue may have been HA's own sidebar, not tunet-nav-card

### 768px Key Observations (audit-my-768-top.png)

- Actions strips: full width, no truncation — clean at 768
- Scenes: wraps correctly at 768
- Lighting grid compact: still only shows header row at 768
- Cards render in single-column at 768 (HA Sections default behavior with sidebar open)

### 1440px Key Observations (audit-my-1440-top.png)

- HA sidebar visible on left
- Cards in wider layout with more breathing room
- Actions, scenes, lighting all render cleanly
- This is the least problematic breakpoint

### Nav-Lab at 1440px (audit-nav-1440-top.png)

- **Tunet nav card renders as LEFT SIDEBAR RAIL** overlapping HA's own sidebar
- Icons: Lab, Compare (active), Living, Bedroom — labels visible below icons
- HA sidebar and tunet nav rail are **competing for the same left-side space**
- `P0`: At 1440px with HA sidebar open, the tunet nav card creates a double-sidebar problem
- The nav card's global offset at L177/L478 pushes content right, but the tunet sidebar itself overlaps HA's sidebar labels

### Key Corrections to Previous Audit

1. **V-SNS-1 RESOLVED**: Sensor cards now show friendly names with sparklines. The raw entity ID display was caused by the stale tunet_base.js on the server, not a card bug.
2. **V-NAV left-rail**: The "left rail" behavior appears to be specifically on the nav-lab page where the nav card renders as a sidebar. On the main lab page at 390px, the nav renders correctly as a bottom dock. The issue is **nav card sidebar mode conflicts with HA's own sidebar**, not a universal mobile failure.
3. **V-MED-1**: Media card actually renders well at 390px in the coherent build. The earlier "thin strip" was stale code.
4. **V-SPK-2**: Speaker grid 2-col compact is genuinely usable at 390px. The 4-col standard variant is the one that fails.
5. **Scenes allow_wrap**: The "Relaxed Wrap" variant shows wrapping working correctly. The CD4 default change is effective.

### Remaining True P0 Issues (confirmed on coherent build, mapped to owning tranche)

1. **Lighting scroll left-edge clipping** — tiles cut off on left when scrolled `[CD6]`
2. **Lighting 3-col at 390px** — should drop to 2-col on phone `[CD6]`
3. **Rooms row mode at 390px** — single-letter names, disproportionate power button `[CD7]`
4. **Status 4-col Summary Matrix at 390px** — unreadable truncation `[CD11]`
5. **Sonos source button overflow** — text exceeds card width `[CD9]`
6. **Sonos speaker tile horizontal scroll clipping** — names truncated, left tiles clip `[CD9]`
7. **Speaker grid 4-col standard at 390px** — unusable as a dense/default configuration `[CD9]`
8. **Nav sidebar mode conflicts with HA sidebar at desktop** — double-sidebar `[CD10]`

---

## Desktop Sizing / Spacing Issues (1440px)

Evidence: audit-my-1440-s1.png through audit-my-1440-s8.png

**V-DESK-1: Lighting grid tiles capped at 180px with centered justify — dead space on wide sections**
- `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` at L383 with `justify-content: center` at L389
- At 1440px in a wide section, 3 tiles × 180px = 540px in a ~600px+ section, leaving 60px+ of dead margin
- Tiles don't fill the available width — they float centered with visible gaps
- `P0`: Tiles should use `minmax(0, 1fr)` to fill available space, or remove the 180px cap
- Files: tunet_lighting_card.js L383, L389

**V-DESK-2: Section Surface + Expand Groups (3-col) — tiles are dense but proportional at 1440**
- 3-col at desktop is appropriate; tiles fill width. This is fine here — the issue is only at 390px.

**V-DESK-3: Light Tile standalone — Vert Compact takes ~40% of section width with dead space right**
- At 1440px the standalone vertical tile occupies less than half the section width with empty right side
- `P2`: getGridOptions returns `columns: 3` which means it takes 3/12 of the section — appropriate for a standalone tile

**V-DESK-4: Rooms Row mode — rows have excessive vertical spacing at 1440px**
- Each row has significant vertical padding/margin creating tall gaps between rows
- At desktop the rows feel vertically sparse
- `P2`: Row min-height (7.3125em) is generous for desktop; could tighten

**V-DESK-5: Climate cards — two variants side by side work well at 1440px**
- Standard + Thin side by side is readable. No issue here.

**V-DESK-6: Status Summary Matrix — 4-col works at 1440px**
- At desktop, 4-col tiles are readable with full names. This is fine.
- The issue is phone-only (see P0 #4)

**V-DESK-7: Media card — speaker tiles truncate names even at 1440px**
- "Living Roo...", "Dining Roo...", "Kitchen So..." in the bottom speaker strip
- At 1440px there's room to show full names
- `P1`: _firstWordName() at L733 shortens the dropdown, but tile labels also truncate via CSS overflow:hidden + ellipsis on fixed-width tiles

**V-DESK-8: Speaker Grid — tiles have uneven spacing in 2-col vs 4-col**
- 2-col compact: tiles fill width proportionally (uses `minmax(0, 1fr)`) — correct
- 4-col standard: tiles also fill width — correct
- But the tile internal padding creates different visual density between variants
- `P2`: Consistent visual density across variants

**V-DESK-9: Sonos card — speaker tiles in horizontal scroll don't fill section width**
- Always shows a horizontal strip with scroll, even when there's room for all tiles
- At 1440px with 4-5 speakers, they could display in a grid instead of scroll strip
- `P2`: Consider grid mode at desktop widths

---

## Unverified User-Reported Interactive Bugs (2026-04-04)

These reports are preserved for follow-up, but they are not part of the normalized authoritative backlog until revalidated against the current coherent build.

**V-INTERACT-1: Click-and-hold to drag brightness appears universally broken**
- User reports drag-to-dim not working on light tiles / lighting card
- Uses `createAxisLockedDrag` from tunet_base.js L1619
- `bindButtonActivation` (CD3) added `el.click()` on Enter/Space — could the click synthesis interfere with pointer events?
- Need to verify: does the `click` event from `bindButtonActivation`'s keydown handler fire during pointerdown/pointermove sequences?
- `P0`: CRITICAL if drag brightness is broken — core interaction

**V-INTERACT-2: Weather cards not displaying day/hour forecast details**
- User reports weather forecast tiles not showing temperature/condition details
- May be a data fetch issue (weather/get_forecasts WS call) or a rendering regression
- Need to verify: is the forecast data arriving? Is the render path intact?
- `P0`: Weather forecast is a core feature

**V-INTERACT-3: Font sizing wildly inconsistent across cards**
- User reports overall font size inconsistency across the card suite
- Cards use different font-size approaches: some use em/rem relative to `:host { font-size: 16px }`, some use px, some use profile-driven `--_tunet-*` CSS vars
- Profile cards (lighting, rooms, sensor, speaker-grid) scale fonts via profile tokens
- Non-profile cards (climate, weather, media, sonos, actions, scenes) use hardcoded px
- The em-anchor at `:host { font-size: 16px }` is set inconsistently — not all cards set it
- `P1`: Font sizing needs a consistent strategy — either all em-based with anchor, or all hardcoded px at same sizes

---

## Status Card Deep Dive (focused screenshots audit-status-390/768/1440.png)

**Summary Matrix at 390px (audit-status-390.png):**
- 4-col grid: "Home HOME", "Envir... ADAPTIVE", "Envir... MANUAL" (with Reset badge), "A... ˅ MODE"
- Second row: "Envir... SYSTEM", "[lightning icon] ... BOOST", "7:27 SUNSET", "69°F INSIDE"
- `P0`: First row — "Envir..." repeated 2x, "A..." is unreadable (Adaptive dropdown truncated to single letter + "...")
- `P0`: Tile labels are ALL CAPS beneath icons ("HOME", "ADAPTIVE", "MANUAL", "MODE") — this is redundant with the icon-above value pattern and wastes vertical space
- `P0`: The "Reset" badge on Environmental Manual tile overlaps/crowds the icon
- `P1`: The tile title/subtitle model shows "Environmental" truncated to "Envir..." three times — these should be shortened to "Env Boost", "Env Manual", "Env System" or similar
- `P1`: 4-col forces 3 characters per tile name at 390px — this is fundamentally too dense

**Standard 2-col at 390px:**
- "Environmental Boost / System", "Adaptive ˅ / Mode" — readable, clean
- "69°F / Temp", "34% / Humidity" — clean
- `OK`: 2-col is the right density for phone status

**Timer + Alarm Branches at 390px:**
- "Environmental Boost / System", "Mode TTL / --:--", "Adaptive ˅ / Mode" — 3-col, readable
- "05:20 · Bath / Next Alarm", "2 / Enabled" — readable
- `OK`: 3-col works here because tile names are shorter

**Summary Matrix at 768px (audit-status-768.png):**
- 4-col: "Home", "Environmental", "Environmental" (Reset badge), "Adaptive ˅" — **full names visible!**
- Second row: "Environmental", "[lightning] [value]", "7:27PM SUNSET", "69F" — readable
- `OK`: 4-col works at 768px — labels fit

**Summary Matrix at 1440px (audit-status-1440.png):**
- 4-col: all labels fully visible. Clean.
- `OK`: Desktop is fine

**Key Status Card Issues:**
1. The Summary Matrix 4-col variant is only broken at 390px — it works at 768+ 
2. The tile labeling model itself is redundant: icon + ALL CAPS label + sub-value is 3 layers of information that could be 2
3. The "Environmental" prefix repeats across 3 of 8 tiles — needs shorter labels for phone
4. The dropdown tile ("Adaptive ˅ / MODE") is the most broken — the dropdown arrow eats horizontal space and the label truncates first

---

---

## Additional User-Reported Issues (2026-04-04 continued)

**V-WEATHER-FIX: Hourly forecast grid column count fixed**
- Was: `grid-template-columns: repeat(5, ...)` hardcoded — 8 hourly tiles crammed into 5 cols
- Fix: Now uses `var(--forecast-cols)` set dynamically by `_renderForecast()` to `points.length`
- Status: **FIXED**, deployed

**V-INTERACT-4: Manual control red dot not showing on lights**
- User reports red glow indicator for manually-controlled lights not appearing
- Rooms card: uses `switch.adaptive_lighting_*` entity's `manual_control` attribute (L1297)
- Light tile: uses `entity.attributes.manual_override === true` (L641)
- These are live HA entity state dependencies — requires OAL adaptive lighting to be running and the light to be manually overridden
- May be a lab data issue (no manual override state) or an OAL configuration issue
- `P1`: Needs live entity verification — not a CSS/code regression from CD2-CD4

**V-INTERACT-5: Manual reset button not working**
- User reports manual reset button (resets adaptive lighting manual override) is not functioning
- Rooms card: manual reset calls `adaptive_lighting.set_manual_control` with `manual_control: false` at L1323-1325
- The button itself is at L1014 (`$.manualResetBtn`)
- Likely related to V-INTERACT-4 — if manual_control state isn't detected, the reset button may be hidden (`$.manualResetBtn.hidden = manualScopedCount === 0` at L1350)
- `P1`: Needs live OAL entity verification — button may be hidden because manual state isn't being read

**V-SPEAKER-1: Speaker grid accent color doesn't match sonos card accent color**
- Speaker grid uses Steel Blue (`--accent: #4682B4` light / `#6BA3C7` dark) at tunet_speaker_grid_card.js L46/L63
- Sonos card uses System Blue (`--sonos-blue: #007AFF` light / `#0A84FF` dark) at tunet_sonos_card.js L40/L59
- Media card uses green (`--green`) for group state
- User prefers the sonos card's lighter blue
- `P1`: Speaker accent color unification deferred to CD9 per user decision. User now confirms preference for sonos blue.

**V-SPEAKER-2: Click-and-hold to drag volume not implemented on speaker grid tiles**
- Sonos card speaker tiles have hold-to-drag volume via `createAxisLockedDrag` at tunet_sonos_card.js L961
- Speaker grid tiles also have `createAxisLockedDrag` at tunet_speaker_grid_card.js L961 — but the interaction model may differ
- Need to verify: does speaker grid's drag work the same as sonos? Or is the gesture model different?
- `P1`: Speaker tile interaction parity between sonos and speaker-grid is a CD9 target

---

---

## Sonos Collapsed Dropdown + Surfaces Page Audit (2026-04-04)

Evidence: audit-sonos-collapsed-390.png, audit-sonos-collapsed-390-2.png, audit-surfaces-390-*.png, audit-surfaces-1440-*.png

### Sonos — Collapsed Speaker Name Overflow

**V-SON-COLLAPSED-1: Speaker dropdown button text extends beyond card when COLLAPSED**
- At 390px, "Living Room TV Sonos ..." extends past right card edge
- Creates horizontal page scroll even without opening the dropdown
- Source button at `tunet_sonos_card.js:152` has no max-width or overflow constraint
- `P0`: Collapsed state itself causes horizontal overflow — not just open-state

**V-SON-COLLAPSED-2: Speaker tiles in horizontal strip overflow at 390px when collapsed**
- Tiles spill past viewport — no containment on the strip
- `P0`: Strip needs overflow containment

### Lighting Grid — Tiles Don't Fill Card Width

**V-GRID-SPACING-1: Lighting grid tiles capped at 180px — dead space at all widths**
- Root cause: `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` at L383
- Combined with `justify-content: center` at L389 — tiles cluster in middle with margins
- At 1440px (surfaces page): 3×2 grid of room lights centered in section with ~60px+ dead margin
- At 390px (surfaces page): 2-col tiles narrower than card width with side gaps
- Affects every lighting card instance across rehab lab AND surfaces page
- `P0`: Fix is `minmax(0, 1fr)` to fill available space, or remove the 180px cap

**V-GRID-SPACING-2: Same issue on surfaces Room Detail at all breakpoints**
- Living Room: 6 tiles in centered 3×2 island
- Kitchen: 3 tiles in centered row with margins
- Bedroom: 3 tiles in 2+1 with dead space
- Confirmed on production-like surface, not just rehab lab
- `P0`: Consistent with V-DESK-1

### Surfaces Page — Room Detail at 390px

**V-SURFACES-1: Room Index row mode "Livi..." truncated — same as V-ROM-1/2/3**
- Confirmed on production surface — room row compression is a real production issue

**V-SURFACES-2: Surfaces page is a better composition validation target than rehab lab**
- Overview composition works reasonably
- Room Detail reveals all the tile spacing and row compression issues in realistic context
- `P2`: Future visual validation should use surfaces page, not just rehab lab

---

---

## Surfaces Page — Media Composition at 390px (audit-surfaces-390-s4/s5/s6.png)

**V-SURF-MEDIA-1: Media card "Main Media" header text truncated in surfaces composition**
- "Main Media" info-tile shows "Full (progress + autodisc..." truncated
- Speaker dropdown "Living ˅" visible — same _firstWordName() truncation
- `P1`: Same as V-MED-1, confirmed on production surface

**V-SURF-MEDIA-2: Sonos speaker tiles overflow horizontally in surfaces at 390px**
- "oom TV Son...", "iving Room Credenza Sp...", "Kitchen Son...", "Bedroom So..." — same overflow
- Confirmed identical to rehab lab behavior
- `P0`: Same as V-SON-COLLAPSED-2

**V-SURF-SPEAKER-1: Speaker Management grid at 390px — tiles readable in surfaces**
- "Room TV Sddros...", "Room Credenza Sp...", "Kitchen Sonos", "Bathroom Sonos"
- The speaker grid in the surfaces composition uses 2-col with tile names — partially readable
- "Group All" / "Ungroup All" buttons visible
- Better than 4-col but still truncated
- `P1`: Names still too long for phone; needs shorter display names or line clamp

## Surfaces Page — Overview Composition at 768px (audit-surfaces-768-top/s1.png)

**V-SURF-768-1: Overview at 768px shows good 2-col layout**
- Left: actions + scenes + status 2-col
- Right: weather card
- Below: Room Detail with lighting grids
- This is actually a reasonably good tablet composition

**V-SURF-768-2: Room Detail at 768px — lighting tiles visible but small**
- "Kitchen" section: Island, Pendants, Main, Accent, Underlights, Table Lamps — 3×2 grid
- Tiles fit but are small — the 180px cap is less visible at 768 because the section is narrower
- `P2`: Tile spacing issue is less severe at tablet than desktop

**V-SURF-768-3: Climate companion at 768px — climate + sensor side by side**
- Climate shows "68°63° 6" (heat/cool) with slider
- Sensor shows "Temp 68.5°" and "Humidity 32.0°" with sparklines
- Good companion pairing at tablet
- `OK`: This works well

## YAML Configuration Audit

**V-YAML-1: Rehab lab uses correct `label:` key for sensor cards — V-SNS-1 confirmed RESOLVED**
- All sensor card instances use `label:` not `name:`
- The raw entity ID display was stale base.js, now fixed

**V-YAML-2: Scenes lab configs correctly mix allow_wrap true/false**
- First: allow_wrap: true (wrap + header) — correct
- Second: allow_wrap: false (scroll, no header) — correct opt-in exception
- Third: allow_wrap: true (relaxed wrap) — correct
- Fourth: allow_wrap: true (mixed domains) — correct
- Lab YAML is correct per CD4 decision

**V-YAML-3: Sonos lab configs include intentional stress tests**
- "Living Room TV Sonos Soundbar with Long Source Name" — tests overflow handling
- These expose the V-SON-COLLAPSED overflow bugs correctly
- Lab config is intentionally aggressive — good for catching real issues

**V-YAML-4: Speaker grid configs test all density variants**
- 2-col compact (works at 390px)
- 4-col standard (breaks at 390px — V-SPK-1)
- 3-col large explicit
- Autodiscovery
- Good branch coverage

**V-YAML-5: All card grid_options in lab use `columns: 24, rows: auto`**
- This means each card takes full section width (24 = 2× the 12-col base)
- `rows: auto` is correct per CD4
- `P2`: Some compositions would benefit from testing at columns: 12 (half-section) to validate density

---

---

## Plan Integration

The following P0/P1 issues have been added to the canonical execution plan (`~/.claude/plans/flickering-herding-wolf.md`):

| Issue | Added To | Plan Item |
|-------|----------|-----------|
| Lighting grid 180px cap + dead space | CD6 L982 item 5 | Evaluate `minmax(0, 1fr)`, verify drag headroom |
| Lighting scroll left-edge clipping | CD6 L982 item 6 | Fix scroll container left clip |
| Sonos source button overflow + naming | CD9 sonos item 5 | Unify naming contract across media/sonos |
| Media `_firstWordName()` too aggressive | CD9 media item 6 | Replace with shared naming strategy |
| Speaker accent color mismatch | CD9 sonos item 6 | Unify to sonos blue |
| Status 4-col phone density | CD11 item 2 (lock-lifted) | Responsive column count, height drift, a11y name |

### Current Severity Count

| Severity | Count | Notes |
|----------|:-----:|-------|
| P0 (visual break + interactive) | 13 | 8 visual + weather FIXED + 2 sonos collapsed + 2 grid spacing |
| P1 (doc/runtime + consistency) | 13 | +1 media surfaces, +1 speaker name truncation |
| P2 (improvement opportunity) | 15+ | +2 from surfaces/YAML observations |
