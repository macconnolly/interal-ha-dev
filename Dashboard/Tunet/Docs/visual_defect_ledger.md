# Tunet Visual Defect Ledger

**Created:** 2026-04-04
**Source:** Post-CD4 visual audit across all 4 breakpoints (390×844, 768×1024, 1024×1366, 1440×900) in both dark and light mode.
**Screenshot evidence:** audit-390-mobile-full.png, audit-390-status-open.png, audit-390-status-sonos-open.png, audit-768-open-states.png, g5-390-full.png, g5-768-full.png, g5-1024-full.png, g5-1440-full.png, overview-390-full.png, cd3-light-390x844.png, cd3-dark-390x844.png, cd3-light-768x1024.png, cd3-dark-768x1024.png, cd3-light-1024x1366.png, cd3-dark-1024x1366.png, cd3-light-1440x900.png, cd3-dark-1440x900.png

**Verdict:** The shared passes (CD0–CD4) fixed infrastructure (transitions, hover, press, focus, keyboard, sizing contracts) but the visual output at phone and tablet is not home-dashboard-grade. Mobile is extremely bad across most cards.

---

## Global Issues

### G-1: Mobile/tablet composition structurally weak
Cards strand themselves in undersized left-biased islands with large dead space, especially in G5 and rehab tablet. Visible in g5-768-full.png and audit-768-open-states.png.
**Severity:** High

### G-2: Open overlays compete with fixed bottom nav
Status and Sonos menus stack into the footer region on phone. Visible in audit-390-status-open.png and audit-390-status-sonos-open.png.
**Severity:** High

### G-3: Page-level horizontal overflow
Measured scrollWidth > clientWidth at 390, 768, and 1024 while Sonos/source states were open.
**Severity:** High

### G-4: Nav global offset system is a layout mutation
Injects margin-left and margin-bottom into HA view containers at `tunet_nav_card.js:177`, applies at `tunet_nav_card.js:478`. Not just chrome — it mutates layout.
**Severity:** High (foundational risk)

---

## Per-Card Issues

### tunet-actions-card

**V-ACT-1: "Sleep Mode" chip truncated at 390px**
- Second actions strip (compact=false) clips last chip label to "Sleep M..."
- Severity: Medium

**V-ACT-2: Row never wraps despite getCardSize claiming multi-row**
- `.actions-row` at L190 doesn't wrap; `getCardSize()` at L440 claims multi-row height
- Mismatch between declared height and actual single-row rendering
- Severity: Medium

**V-ACT-3: Narrow strip dropped into oversized sections**
- Card behaves like a narrow strip in oversized section containers
- No catastrophic failure but not compositionally strong
- Severity: Low

### tunet-scenes-card

**V-SCN-1: allow_wrap docs/runtime contradiction**
- cards_reference.md L294 says allow_wrap:true is the resolved default
- Runtime at `tunet_scenes_card.js:400` still defaults false in setConfig normalization
- getStubConfig was changed to true (CD4) but setConfig fallback is still false
- **This is a direct docs/runtime contradiction**
- Severity: **High**

**V-SCN-2: Compact strip chips undersized at 390px**
- Touch targets appear < 44px
- Severity: Medium

### tunet-light-tile

**V-LTL-1: Standalone tiles look orphaned in rehab layouts**
- Severity: Low (lab layout, not card issue)

**V-LTL-2: Horizontal tile truncates too aggressively on phone**
- Entity name cut off, not polished at 390px
- Severity: Medium

**V-LTL-3: Progress bar thickness differs between vertical and horizontal variants**
- Visual inconsistency in progress bar weight
- Severity: Medium

### tunet-lighting-card

**V-LIT-1: Grid mode is fixed-column, not container-native**
- `grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px))` at L383
- Doesn't adapt to container width — columns stay fixed
- Severity: **High**

**V-LIT-2: Scroll mode hard-codes column width behavior**
- At L396, scroll mode uses fixed column sizing
- Severity: High

**V-LIT-3: Visible tile limit based on maxRows * cols**
- At L1259 — tile count capped by static calculation, not container awareness
- Tablet/mobile lighting compositions feel clipped, stranded, and non-adaptive
- Severity: High

**V-LIT-4: Scroll tile view — tiles on left are cut off even when scrolled all the way over**
- User-reported: leftmost tiles clip at the scroll container edge
- Severity: **High**

### tunet-rooms-card

**V-ROM-1: Row mode power button significantly larger than light orb buttons**
- Power button appears ~2x the size of individual orbs
- Severity: **High** (user-reported)

**V-ROM-2: Row mode orbs compressed/overlapping at 390px**
- With 3+ lights, orbs + power button + name compete for space
- Severity: High

**V-ROM-3: Row mode visually overcompressed on phone**
- Labels/status lines collapse into abbreviations and clipped fragments
- Overflow hiding and line clamps at L365 and L381 are producing active defects
- Severity: High

**V-ROM-4: Row mode room icon column disproportionately wide**
- Severity: Medium

**V-ROM-5: Row/slim chevron disconnected from tap target**
- Severity: Low

### tunet-climate-card

**V-CLM-1: Dual-thumb temperature values crowd at 390px**
- "72 63 73" cramped, nearly touching
- Severity: Medium

**V-CLM-2: Standard 2-col dropdown off-center at tablet**
- Mode dropdown doesn't right-align cleanly in 2-col section at 768px
- Severity: Medium (user-reported)

**V-CLM-3: "Gold standard" claim overstated for phone pairing**
- Standard + thin together are crowded and visually collide on mobile
- Partly surface issue but still matters
- Severity: Medium

### tunet-weather-card

**V-WTH-1: Burns too much vertical space for toggles before weather content on phone**
- Toggle row (Daily/Hourly/Temp/Precip) takes disproportionate vertical space at 390px
- Severity: Medium

**V-WTH-2: 5-column forecast grid cramped at narrow widths**
- Docs already admit density risk; screenshots confirm it
- Severity: Medium

### tunet-sensor-card

**V-SNS-1: Raw entity IDs showing instead of friendly names**
- Render falls back to `sensorCfg.label || sensorCfg.entity` at L710
- Lab YAML uses `name` key but card expects `label`
- Produces "sensor.dining_room_temperature" in rehab mobile/tablet — not dashboard-grade
- **Either docs must call out that `label` is the key, or card must normalize `name` → `label`**
- Severity: **High**

**V-SNS-2: Sparkline graphs not rendering in lab**
- May need real entity history — lab-only issue
- Severity: Medium

**V-SNS-3: Sensor row chevron/action indicator inconsistent**
- Some rows have indicators, others don't
- Severity: Medium

### tunet-status-card

**V-STS-1: Dropdown tile accessible name polluted by full option list**
- Menu rendered inside activated tile at L1081, opened at L1519
- Full option list becomes part of the button's accessible name
- Severity: High

**V-STS-2: Menu overlaps next card/nav region on phone**
- Visible in audit-390-status-open.png
- Severity: High

**V-STS-3: Tile content visually redundant**
- "Home / Home", "Boost / 5% / Boost", "Adaptive / Mode"
- Severity: Medium

**V-STS-4: Excessive vertical gaps in tile grid at 768px**
- Known height: drift (scope-locked to CD11)
- Severity: Medium

### tunet-media-card

**V-MED-1: Speaker names aggressively shortened via _firstWordName()**
- At L733 — reduces "Living Room TV Sonos Soundbar" to "Living"
- Used in dropdown/header at L1077
- Full names appear in lower cards, creating inconsistency
- Severity: **High**

**V-MED-2: Group-membership check is pointer-only**
- At L1087 — CD3 semantics incomplete here
- Severity: High

**V-MED-3: Speaker tile names truncated even at 1440px**
- "Living Roo...", "Dining Roo..." at desktop width
- Severity: Medium

**V-MED-4: Transport buttons small at 390px**
- May be < 44px tap targets on mobile
- Severity: Medium

### tunet-sonos-card

**V-SON-1: Track title doesn't fit at mobile width**
- User-reported: title area near zero after album-art + transport + source-btn
- Severity: **High** (user-reported)

**V-SON-2: Source button/menu width-unsafe**
- At L152 and L178 — no max-width constraint
- Severity: High

**V-SON-3: Menu options inject speaker name as bare text node**
- At L1049 — long names widen the menu beyond viewport
- Severity: High

**V-SON-4: Always-visible speaker strip over-wide**
- Spills beyond viewport in rehab mobile/tablet
- Severity: High

**V-SON-5: No scroll indicator on horizontal speaker strip**
- Users may not discover scrollable content
- Severity: Medium

### tunet-speaker-grid-card

**V-SPK-1: Mobile/tablet is a clear failure**
- Even with tile container query, rightmost tiles overflow visible area
- Severity: **High**

**V-SPK-2: Fixed by explicit column count and getCardSize assumptions**
- At L619 and L653 — not responsive to container
- Severity: High

**V-SPK-3: Speaker tile names truncated at all breakpoints**
- Severity: Medium

### tunet-nav-card

**V-NAV-1: Global offset mutation is not clean reference implementation**
- margin-left/margin-bottom injection into HA view containers
- Severity: High (foundational)

**V-NAV-2: Mobile dock competes with content flow**
- Visible in multiple screenshots
- Severity: Medium

**V-NAV-3: Rehab lab nav reuses same icon for Card Rehab Lab and Rooms**
- Weakens wayfinding
- Severity: Low (lab config)

---

## Cross-Card Issues

**V-XC-1: Slider/track thickness inconsistent across cards**
- Climate: 44px, Lighting: 6px, Sonos: 6px, Speaker grid: varies
- Severity: Medium (user-reported)

**V-XC-2: Info-tile/header-tile height inconsistent across cards**
- Should be uniform `min-height: var(--ctrl-min-h, 42px)` but varies
- Severity: Medium

**V-XC-3: Section header typography inconsistent between cards**
- Different font size/weight across card section headers
- Severity: Low

**V-XC-4: Cards visually over-explain themselves**
- Redundant labels and repeated state information
- Severity: Low

**V-XC-5: No "phone companion" policy**
- Half-width contracts acceptable at tablet/desktop are treated as universal
- Several cards fail compositionally at phone width
- Severity: High (systemic)

**V-XC-6: Test surfaces have placeholder/dead space**
- "New section" artifacts and dead space make good cards look worse
- Severity: Low (lab config)

---

## Docs That Are Wrong Or Overclaiming

**V-DOC-1:** cards_reference.md L294 — scenes says allow_wrap:true is resolved default; setConfig still defaults false at L400
**V-DOC-2:** cards_reference.md L752 — climate "gold standard" is too broad given phone pairing behavior
**V-DOC-3:** cards_reference.md L931 — sensor docs don't warn that `label` is the display key, not `name`
**V-DOC-4:** cards_reference.md L1060 — status dropdown overstates smart positioning; doesn't mention label pollution or footer collision
**V-DOC-5:** cards_reference.md L1209 — media understates semantics gap and aggressive speaker name shortening
**V-DOC-6:** cards_reference.md L1357 — speaker-grid "must be validated" should say current mobile/tablet is not acceptable

---

## Summary

| Severity | Count |
|----------|:-----:|
| **High** | 22 |
| **Medium** | 18 |
| **Low** | 8 |
| **Total** | **48** |

Plus 6 docs issues.

---

## Mobile-Specific Issues (390px exhaustive analysis)

Evidence: cd3-light-390x844.png, cd3-dark-390x844.png, cd3-review-390x844.png, cd2-lab-390x844-dark.png, cd2-lab-390x844-dark-scroll1.png, cd2-lab-390x844-dark-scroll2.png, cd2-lab-390x844-scroll3.png

### Actions at 390px

**V-MOB-ACT-1: Second strip (5 chips, compact=false) horizontal overflow**
- "Sleep M..." clipped — confirmed across both light and dark
- First strip (3 chips, compact=true) fits fine

**V-MOB-ACT-2: Both strips take full width but have different visual densities**
- 3-chip compact strip has generous spacing; 5-chip strip is cramped
- No visual indication that the 5-chip strip has more content off-screen

### Lighting at 390px

**V-MOB-LIT-1: Grid Compact (3-col) tile names aggressively truncated**
- "Dining R...", "Living Ro...", "Column ..." — barely readable at 390px
- 3 columns is too many for 390px; should drop to 2 columns
- Severity: **High**

**V-MOB-LIT-2: Grid Compact tile progress bars are hairline-thin**
- The amber progress bars beneath each tile are very thin (~2-3px) relative to tile size
- Hard to see the brightness level at glance
- Severity: Medium

**V-MOB-LIT-3: Section surface + expand groups card shows 3-col at 390px**
- Same 3-col issue as compact grid — all names truncated
- "Floor Lamp Living R...", "Credenza Light", "Living Room Corner ..." all clipped
- Severity: High

**V-MOB-LIT-4: Scroll layout visible-tile limit shows only 2 tiles at 390px**
- Only Couch and Floor visible in scroll viewport
- No scroll indicator or pagination dots visible
- Users won't discover the remaining 4 tiles
- Severity: High

**V-MOB-LIT-5: "Couch (Vertical)" standalone section — left-biased, right side empty**
- Standalone light tile occupies ~50% of width, right side is dead space
- Severity: Medium (lab layout)

### Light Tile at 390px

**V-MOB-LTL-1: Vertical compact tile is too tall relative to width**
- The single standalone vertical tile has excessive height-to-width ratio
- "Vert Compact / Off" with large empty area above the progress bar
- Severity: Medium

**V-MOB-LTL-2: Horizontal standard tile "Horiz Standard / Off" — icon too small**
- The horizontal variant shows a small icon with "Off" text; icon appears undersized relative to the row height
- Severity: Low

### Rooms at 390px

**V-MOB-ROM-1: Tile mode — 2-col tiles crammed, names truncated**
- "Living Room" fits, "Kitchen" fits, "Bedroom" fits — but status text ("1/2 · 100% bri") is very small
- Temperature/humidity sub-text is barely readable
- Severity: Medium

**V-MOB-ROM-2: Row mode — ALL room names compete with controls**
- The row shows: icon | name+status | orbs | power button | chevron
- At 390px everything is jammed together
- "Living Room" row with 3 orbs: orbs appear as tiny dots
- Severity: High (confirmed user report)

**V-MOB-ROM-3: Slim mode — "All Off" button competes with section header**
- The "Slim" header with "All Off" button — button is right-aligned but close to header text
- Severity: Low

**V-MOB-ROM-4: Slim tiles — "SOFA" custom icon takes full tile width**
- The "Living Room" slim tile shows "SOFA" text as a large custom icon, disproportionate
- Severity: Low (lab data)

### Climate at 390px

**V-MOB-CLM-1: Standard climate — slider + temps readable but cramped**
- The 72/63/73 temperature display works but is tight
- Slider thumb handles overlap visually when heat/cool setpoints are close
- Severity: Medium

**V-MOB-CLM-2: Two climate instances stacked — excessive vertical consumption**
- Standard + Thin climate cards together take ~25% of the mobile viewport
- For a rehab lab this is expected, but in production one climate card should suffice
- Severity: Low (lab composition)

### Weather at 390px

**V-MOB-WTH-1: Info tile header shows entity name truncated**
- "Auto modes + toggles" is readable but long
- Severity: Low

**V-MOB-WTH-2: Toggle row (Daily/Hourly/Temp/Precip) takes significant vertical space**
- 4 segment buttons before any weather data
- On mobile this pushes actual content below the fold
- Severity: Medium

**V-MOB-WTH-3: Forecast tiles cramped — day labels ("SAT", "SUN") readable but temps crowd**
- 5 forecast columns at 390px — each column is ~60px wide
- Temperature high/low text is very small
- Severity: Medium

### Sensor at 390px

**V-MOB-SNS-1: Entity IDs showing as labels — confirmed at mobile**
- "sensor.di..." visible as truncated entity ID
- Not dashboard-grade at any breakpoint
- Severity: **High** (confirmed)

**V-MOB-SNS-2: Sparkline area is blank/missing**
- Just entity name + current value, no graph
- Severity: Medium

**V-MOB-SNS-3: Row right-side chevron/value alignment inconsistent**
- Some rows show value right-aligned, others show chevron
- Severity: Low

### Status at 390px

**V-MOB-STS-1: Status Lab tiles — 4-col grid at 390px**
- "Home", "Adaptive", "Manual", "Mode" in first row — each tile is tiny
- Second row: "System", "Boost", "Sunset", "Inside" — even more cramped with data values
- 4 columns is too many for 390px
- Severity: **High**

**V-MOB-STS-2: "Boost" tile shows "2%" in a tiny font**
- Value is barely readable at mobile width
- Severity: Medium

**V-MOB-STS-3: "Sunset" tile shows "7:26 PM" — reasonable but cramped**
- Severity: Low

### Media/Sonos/Speaker Grid at 390px

**V-MOB-MED-1: Media card barely visible in full-page screenshot**
- The media card at the bottom of the mobile page is a thin strip
- Album art, track name, transport all compressed into minimal height
- Severity: High

**V-MOB-SON-1: Sonos card below fold — not captured in current screenshots**
- Need dedicated scroll to sonos section
- User reports: track title doesn't fit, source button overflow
- Severity: **High** (user-reported, unverified in screenshots)

**V-MOB-SPK-1: Speaker grid below fold — not captured in current screenshots**
- User reports: rightmost tiles overflow, mobile is "clear failure"
- Severity: **High** (user-reported, unverified in screenshots)

### Nav at 390px

**V-MOB-NAV-1: Fixed bottom nav bar covers last card content**
- Bottom nav icons (home, squares, music, books) overlay the last visible card
- No bottom padding/margin on the page content to account for nav height
- Severity: **High**

**V-MOB-NAV-2: Nav icons are generic — "Card Rehab Lab" and "Rooms" share same icon**
- Two identical icons in the nav bar — no visual differentiation
- Severity: Medium (lab config, not card bug)

---

## Updated Summary

| Severity | Count |
|----------|:-----:|
| **High** | 32 |
| **Medium** | 26 |
| **Low** | 12 |
| **Total** | **70** |

Plus 6 docs issues.

**Critical mobile finding:** 390px is structurally broken for most cards. The shared passes fixed interaction infrastructure but did not address density, truncation, column count adaptation, or compositional weakness at phone width. This is the primary remaining work for the bespoke passes.

**Cards that need mobile work most urgently (High severity at 390px):**
1. tunet-lighting-card — 3-col doesn't adapt, scroll mode clips, tile limit is static
2. tunet-rooms-card — row mode overcompressed, orbs tiny, power button oversized
3. tunet-sensor-card — entity IDs as labels
4. tunet-status-card — 4-col at 390px is unreadable
5. tunet-sonos-card — width overflow, title doesn't fit
6. tunet-speaker-grid-card — tiles overflow visible area
7. tunet-media-card — compressed to thin strip, naming too aggressive
8. tunet-nav-card — covers content, global offset mutation
