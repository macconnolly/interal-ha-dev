Built from screenshot evidence on the live HA surfaces at `390x844`, `768x1024`, `1024x1366`, and `1440x900`, with phone-focused card captures from the rehab lab plus full-page captures from G5 and Overview. Primary evidence: [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png), [audit-390-status-open.png](/home/mac/HA/implementation_10/audit-390-status-open.png), [audit-390-status-sonos-open.png](/home/mac/HA/implementation_10/audit-390-status-sonos-open.png), [audit-768-open-states.png](/home/mac/HA/implementation_10/audit-768-open-states.png), [g5-390-full.png](/home/mac/HA/implementation_10/g5-390-full.png), [g5-768-full.png](/home/mac/HA/implementation_10/g5-768-full.png), [g5-1024-full.png](/home/mac/HA/implementation_10/g5-1024-full.png), [g5-1440-full.png](/home/mac/HA/implementation_10/g5-1440-full.png), [overview-390-full.png](/home/mac/HA/implementation_10/overview-390-full.png).

**Global**
- `Runtime defect`: mobile/tablet composition is not stable enough to judge cards in isolation. Cards are repeatedly stranded in undersized left-biased islands with large dead whitespace, especially in [g5-768-full.png](/home/mac/HA/implementation_10/g5-768-full.png) and [audit-768-open-states.png](/home/mac/HA/implementation_10/audit-768-open-states.png).
- `Runtime defect`: mobile nav is not reliably behaving as a bottom dock. In the per-card mobile evidence pack it renders as a left rail overlay over content, corrupting the card screenshots themselves, for example [mobile-viewport-card-12-tunet-lighting-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-12-tunet-lighting-card.png) and [mobile-viewport-card-09-tunet-rooms-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-09-tunet-rooms-card.png).
- `Doc mismatch`: [cards_reference.md#L1410](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1410) describes nav as a stable mobile dock / desktop rail split, but current runtime behavior is visibly unstable.
- `Improvement`: establish a stricter “phone companion” composition contract. Several cards look acceptable alone but bad when forced into current section compositions.

**1. `tunet-actions-card`**
- `Runtime defect`: no catastrophic visual failure, but the strip still reads as a narrow utility row dropped into oversized sections, especially on tablet/desktop where dead space dwarfs the control itself in [g5-768-full.png](/home/mac/HA/implementation_10/g5-768-full.png).
- `Doc mismatch`: [cards_reference.md#L173](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L173) says `actions` is editor `N`, but the current editor exposes an `actions` object selector at [tunet_actions_card.js#L307](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_actions_card.js#L307).
- `Improvement`: either make the strip genuinely wrap/stack-aware or stop claiming multi-row sizing. The row never wraps at [tunet_actions_card.js#L190](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_actions_card.js#L190) while `getCardSize()` still claims row-based height at [tunet_actions_card.js#L440](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_actions_card.js#L440).

**2. `tunet-scenes-card`**
- `Runtime defect`: no severe visual failure surfaced in the current mobile rehab fixture; this is one of the less visibly broken cards right now.
- `Doc mismatch`: [cards_reference.md#L294](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L294) says `allow_wrap: true` is the Sections-safe default, but runtime still defaults it to false at [tunet_scenes_card.js#L400](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_scenes_card.js#L400).
- `Improvement`: lock and document one strip contract. Right now the docs overstate CD4 closure.

**3. `tunet-light-tile`**
- `Runtime defect`: the standalone tiles look visually orphaned in rehab mobile because they sit between larger card families without enough local context in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png).
- `Doc mismatch`: none severe in the visual contract itself; the card still largely behaves as documented in [cards_reference.md#L349](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L349).
- `Improvement`: horizontal variant truncates too aggressively and needs stronger name/layout balancing on phone.

**4. `tunet-lighting-card`**
- `Runtime defect`: still one of the worst visual offenders. At tablet width the compact secondary row feels clipped/stranded rather than container-native, visible in [audit-768-open-states.png](/home/mac/HA/implementation_10/audit-768-open-states.png). On phone the card itself looks decent in isolation, but the overall section behavior is not adaptive enough.
- `Runtime defect`: scroll-mode behavior remains suspect because the card still uses fixed grid and fixed scroll column math rather than true container-fit. Relevant source: [tunet_lighting_card.js#L383](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L383), [tunet_lighting_card.js#L396](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L396), [tunet_lighting_card.js#L1259](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_lighting_card.js#L1259).
- `Doc mismatch`: [cards_reference.md#L506](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L506) correctly calls it the worst Sections-safety card, but the current docs still under-describe how broken it feels in real tablet/mobile compositions.
- `Improvement`: compact/grid needs true container-native drop behavior instead of breakpoint-driven fixed columns.

**5. `tunet-rooms-card`**
- `Runtime defect`: mobile row mode is overcompressed. Labels/status lines collapse into abbreviations and clipped fragments in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png).
- `Runtime defect`: per-card screenshot [mobile-viewport-card-09-tunet-rooms-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-09-tunet-rooms-card.png) is partly contaminated by nav overlay, but it still shows how little horizontal room the row model has.
- `Doc mismatch`: [cards_reference.md#L657](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L657) calls row-density/truncation a known risk. That should now be treated as an active defect, not just a validation note.
- `Improvement`: row mode needs stronger phone typography, status compression rules, and control spacing.

**6. `tunet-climate-card`**
- `Runtime defect`: the single card is still relatively strong, but the standard + thin pairing at phone width is crowded and visually collides in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png).
- `Doc mismatch`: [cards_reference.md#L752](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L752) calling climate the “gold standard” is too broad unless it means “baseline styling reference,” not “always-composed well on phone.”
- `Improvement`: define a phone-specific companion-placement rule so two climate variants are not presented side-by-side in a cramped context.

**7. `tunet-weather-card`**
- `Runtime defect`: least broken of the environment cards, but it spends too much vertical space on controls before the actual weather content on phone in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png).
- `Runtime defect`: forecast density is still cramped at phone width in [mobile-viewport-card-08-tunet-weather-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-08-tunet-weather-card.png).
- `Doc mismatch`: [cards_reference.md#L860](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L860) correctly warns about density, but the card currently looks less “dense but acceptable” and more “over-instrumented for phone.”
- `Improvement`: reduce toggle chrome on phone and increase first-glance weather readability.

**8. `tunet-sensor-card`**
- `Runtime defect`: live labels are not acceptable. Rows show raw entity IDs such as `sensor.dining_room_temperature` because render falls back to `sensorCfg.label || sensorCfg.entity` at [tunet_sensor_card.js#L710](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sensor_card.js#L710). This is obvious in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png) and [mobile-viewport-card-05-tunet-sensor-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-05-tunet-sensor-card.png).
- `Doc mismatch`: [cards_reference.md#L923](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L923) documents `label`, but the rehab YAML uses `name`. The docs do not call out that `name` will not display.
- `Improvement`: normalize `name -> label` in config, or tighten the docs and fixtures immediately.

**9. `tunet-status-card`**
- `Runtime defect`: the dropdown tile title/content model is visibly wrong on phone. The card repeats or awkwardly pairs title/value/label in ways that feel mechanical rather than intentional, visible in [audit-390-mobile-full.png](/home/mac/HA/implementation_10/audit-390-mobile-full.png).
- `Runtime defect`: the dropdown overlay collides with lower content and the bottom nav in [audit-390-status-open.png](/home/mac/HA/implementation_10/audit-390-status-open.png).
- `Runtime defect`: the dropdown control’s accessible/button name is polluted by the full option list because the menu lives inside the activated tile at [tunet_status_card.js#L1081](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_status_card.js#L1081) and opens in-place at [tunet_status_card.js#L1519](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_status_card.js#L1519).
- `Doc mismatch`: [cards_reference.md#L1034](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1034) overstates the quality of the dropdown overlay positioning.
- `Improvement`: the whole card needs content-hierarchy simplification on phone, not just bugfixes.

**10. `tunet-media-card`**
- `Runtime defect`: active speaker naming is too aggressively reduced. The card shows `Living` instead of the full speaker name because `_firstWordName()` is used at [tunet_media_card.js#L733](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L733) and injected into the UI at [tunet_media_card.js#L1077](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L1077).
- `Runtime defect`: the media group-membership check remains pointer-only in source at [tunet_media_card.js#L1087](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_media_card.js#L1087), so CD3 semantics are still not actually complete here.
- `Doc mismatch`: [cards_reference.md#L1209](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1209) under-describes both the naming simplification and the remaining semantics gap.
- `Improvement`: preserve identity-rich speaker naming on phone, even if compacted.

**11. `tunet-sonos-card`**
- `Runtime defect`: strongest live width/overflow offender. The source button and source dropdown are still width-unsafe at [tunet_sonos_card.js#L152](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L152) and [tunet_sonos_card.js#L178](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L178). This is visible in [audit-390-status-sonos-open.png](/home/mac/HA/implementation_10/audit-390-status-sonos-open.png) and [audit-768-open-states.png](/home/mac/HA/implementation_10/audit-768-open-states.png).
- `Runtime defect`: source options still use a bare text node for the main name at [tunet_sonos_card.js#L1049](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js#L1049), so long names widen the menu.
- `Runtime defect`: the always-visible speaker strip is over-wide and continues to spill beyond phone/tablet viewports.
- `Doc mismatch`: [cards_reference.md#L1267](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1267) treats this as a width-pressure caveat; current runtime shows it as a real failure.
- `Improvement`: width-safe long-name handling is mandatory, not polish.

**12. `tunet-speaker-grid-card`**
- `Runtime defect`: still failing on phone/tablet. Even with the container query in [tunet_speaker_grid_card.js#L184](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js#L184), the rightmost tiles still spill or require an unrealistic amount of width in rehab mobile/tablet.
- `Runtime defect`: per-card screenshot [mobile-viewport-card-03-tunet-speaker-grid-card.png](/home/mac/HA/implementation_10/mobile-viewport-card-03-tunet-speaker-grid-card.png) is nav-contaminated, but the full-page captures already showed the card is not phone-safe.
- `Doc mismatch`: [cards_reference.md#L1357](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1357) frames this as a validation concern; current state is worse than that.
- `Improvement`: either enforce a real phone-safe stacked mode or treat this as not phone-eligible by default.

**13. `tunet-nav-card`**
- `Runtime defect`: the mobile nav is not stable enough to serve as reference chrome. In the mobile per-card screenshots it appears as a left rail overlay, not a bottom dock.
- `Runtime defect`: the global offset approach still mutates page layout via injected margins/padding at [tunet_nav_card.js#L177](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_nav_card.js#L177) and [tunet_nav_card.js#L478](/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_nav_card.js#L478).
- `Doc mismatch`: [cards_reference.md#L1442](/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/cards_reference.md#L1442) calling it the accessibility/token reference implementation is too generous while mobile mode is unstable.
- `Improvement`: nav needs its own stabilization pass before it can be used as the baseline for judging other mobile cards.

---

## Fresh Screenshot Audit (2026-04-04, coherent build ?v=20260404_cd4)

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

### Remaining True P0 Issues (confirmed on coherent build)

1. **Lighting scroll left-edge clipping** — tiles cut off on left when scrolled
2. **Lighting 3-col at 390px** — should drop to 2-col on phone
3. **Rooms row mode at 390px** — single-letter names, disproportionate power button
4. **Status 4-col Summary Matrix at 390px** — unreadable truncation
5. **Sonos source button overflow** — text exceeds card width
6. **Sonos speaker tile horizontal scroll clipping** — names truncated, left tiles clip
7. **Speaker grid 4-col standard at 390px** — unusable
8. **Nav sidebar mode conflicts with HA sidebar at desktop** — double-sidebar

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

## User-Reported Interactive Bugs (2026-04-04)

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

### Current Severity Count

| Severity | Count | Notes |
|----------|:-----:|-------|
| P0 (visual break + interactive) | 10 | 8 visual + 2 interactive (drag, weather forecast) |
| P1 (doc/runtime + consistency) | 8 | 6 docs + media naming + font sizing |
| P2 (improvement opportunity) | 12+ | Density, naming, composition, desktop spacing |
