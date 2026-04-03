# P0 Card Failures - Organized Diagnostics Matrix

Date: 2026-03-06  
Sources:
- User live feedback (mobile-heavy)
- 4-agent parallel diagnostics (status/scenes/actions, rooms, central style, weather)
- Live HA payload checks (`weather.home`, hourly+daily forecasts)

## 1) Cross-Cutting Findings (Common Root Causes)

1. Base token drift vs card-local overrides:
- `Dashboard/Tunet/Cards/v2/tunet_base.js` defines shared tokens/surfaces, but several cards bypass them with local fixed sizing.
- Result: family-level inconsistency (text too small in one card, clipped in another, excessive whitespace elsewhere).

2. Vertical budget mismatch inside fixed tile heights:
- Status tiles use fixed row/tile heights and reduced compact paddings while still rendering icon + primary value + secondary + label + aux/dropdown in limited vertical space.
- Result: icon/value clipping and unreadable compact dropdown labels.

3. Responsive logic tied to viewport instead of card/container:
- Status columns are resolved via `window.innerWidth`, not rendered card width.
- Result: inconsistent tile widths in mixed/embedded sections layouts.

4. Rooms row variant over-compressed via `em` scaling:
- Small icon/button/text dimensions in row/slim mode make controls visually tiny on iOS.
- Result: low readability and poor touchability.

5. Weather precipitation logic does not match provider semantics:
- `weather.home` (met.no) forecast provides `precipitation` in inches and no probability field.
- Current card uses mm-style display assumptions and probability-first logic.
- Result: precipitation view appears as all-zero and low-signal.

6. Fixed nav + content offset inconsistency:
- `tunet_nav_card` applies global bottom offset, but page configs and nav placement patterns are mixed.
- Result: last card content can sit under nav on mobile views.

## 2) Issue Matrix (Where/Repro/Current/Desired/Likely Root Cause)

### A) Status Card (home status, standard+compact+large)

Issue A1: Tile widths inconsistent
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`_resolveResponsiveColumns`)
- Repro:
  - Same card used in different section widths; mobile/tablet widths vary unexpectedly.
- Current wrong behavior:
  - Columns determined from `window.innerWidth` instead of actual card width.
- Desired:
  - Columns adapt to card container width, not full viewport.
- Likely root cause:
  - `window.innerWidth` breakpoint logic in `_resolveResponsiveColumns`.

Issue A2: Icon top clipped + bottom value overlap/cutoff
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (tile paddings, fixed heights, font sizes)
  - `Dashboard/Tunet/Cards/v2/tunet_base.js` (`ICON_BASE` line-height/variation defaults)
- Repro:
  - Compact/standard status tiles on iOS; value+label and icon stacks clip.
- Current wrong behavior:
  - Glyphs clip at top, bottom text gets cut by tile bounds.
- Desired:
  - Full icon/value/secondary/label stack visible with balanced spacing.
- Likely root cause:
  - Tight vertical budget + fixed heights + dense paddings + aggressive icon metrics.

Issue A3: Adaptive mode dropdown unreadable/cut
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` (`.tile-dd-val`, compact typography)
- Repro:
  - Compact status tile with dropdown mode selector on mobile.
- Current wrong behavior:
  - Dropdown value text too condensed/truncated.
- Desired:
  - Readable dropdown label in compact mode.
- Likely root cause:
  - Compact type size + centered layout + narrow width constraints.

Issue A4: Sensor tile ratio imbalance
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js` value/label scale rules.
- Repro:
  - Layout lab or overview sensor tiles.
- Current wrong behavior:
  - Value too large while label too small.
- Desired:
  - Harmonized typography hierarchy.
- Likely root cause:
  - Per-type font-size overrides not normalized against shared density tokens.

### B) Scenes + Actions Chips

Issue B1: Text too small in compact strip
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- Repro:
  - Mobile compact mode.
- Current wrong behavior:
  - Labels/icons feel undersized with unused vertical whitespace around card.
- Desired:
  - Better readable compact chips with larger label/icon and balanced density.
- Likely root cause:
  - Hardcoded compact font sizes/paddings in each card (`11.5px`, `0.6875em`, small icon wraps).

### C) Weather Card

Issue C1: Precipitation appears broken/all zeros
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` (`_resolvePrecip*`, display logic)
- Live evidence:
  - `weather.home` hourly/daily payload: no probability fields, `precipitation` values mostly `0.0`, occasional `0.01`, `precipitation_unit: in`.
- Current wrong behavior:
  - Precip mode yields low-value zeros and poor signal.
- Desired:
  - Accurate precip display aligned to provider data/unit and meaningful thresholds.
- Likely root cause:
  - Probability-first assumption + no unit-aware rendering for inches + tiny amounts rounded to near-zero.

Issue C2: Weather card too tall, too much whitespace
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` CSS blocks for details and forecast tiles.
- Repro:
  - Daily view and toggles enabled on mobile.
- Current wrong behavior:
  - Vertical space consumed by one-column details and roomy forecast tiles.
- Desired:
  - Two-column details (wind/humidity + UV/pressure), denser forecast tile internals.
- Likely root cause:
  - Detail stack as single column + conservative tile paddings/gaps/font sizes.

Issue C3: Toggle controls overflow/narrow-container breakage
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js` (`.hdr-controls`, `.seg-group`, `.seg-btn`)
- Repro:
  - Narrow sections; both view+metric toggles visible.
- Current wrong behavior:
  - Toggles push awkwardly and can crowd bounds.
- Desired:
  - Responsive toggle behavior that never escapes visual container.
- Likely root cause:
  - Combined controls footprint too wide for narrow-card contexts.

### D) Rooms Card (row/slim + tiles)

Issue D1: Row sub-buttons/orbs too small
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` row/slim CSS (`.room-orb`, `.room-action-btn`, icon sizes)
- Repro:
  - Mobile row/slim variant.
- Current wrong behavior:
  - Controls undersized, hard to read/tap.
- Desired:
  - Larger touch targets and icon sizes.
- Likely root cause:
  - Over-compressed `em` dimensions in row/slim mode.

Issue D2: Room tile text too small
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` (`.room-tile-name`, `.room-tile-status` row/slim overrides)
- Repro:
  - Mobile row/slim variant.
- Current wrong behavior:
  - Name/status scale too small relative to card area.
- Desired:
  - Readable text hierarchy.
- Likely root cause:
  - Low font multipliers (`0.78em`, `0.66em`, etc.) in slim mode.

Issue D3: Tap behavior ambiguity
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` pointer handlers around row-mode tap/hold.
- Repro:
  - Tap different areas (body/icon/chevron) in row mode.
- Current wrong behavior:
  - Interaction can feel inconsistent by config fallback chain.
- Desired:
  - One explicit primary tap action for body/icon/chevron; long-press only for toggle-room.
- Likely root cause:
  - Fallback chain (`tap_action -> hold_action -> navigate_path`) in row mode.

Issue D4: All toggle button visually too small
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js` `.section-btn`/`.room-action-btn` scale.
- Repro:
  - Mobile rooms row sections.
- Current wrong behavior:
  - Global/all toggle control appears undersized.
- Desired:
  - Control size parity with orb/tap targets.
- Likely root cause:
  - Small control dimensions inherited from dense compact pass.

### E) Mobile Bottom Nav Overlap

Issue E1: Last cards obscured by fixed bottom nav
- Where:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js` (global `hui-view` offsets)
  - Dashboard YAML sections where nav placement and vertical content composition vary.
- Repro:
  - Rooms page on mobile; scroll to bottom.
- Current wrong behavior:
  - Final card content partially hidden under nav.
- Desired:
  - Reliable bottom breathing room in all views/subviews.
- Likely root cause:
  - Offset application pattern not consistently enforced across all view compositions.

## 3) Proposed Update Tracks (P0, smallest-safe scopes)

Track P0-1: Central density and icon baseline pass
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_base.js`
  - `Dashboard/Tunet/Cards/v2/tunet_status_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_scenes_card.js`
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- Objective:
  - Normalize readable compact typography and icon metrics, remove clipping, harmonize chip/tile density.
- Acceptance:
  - No clipped icons/values in status tiles on iOS.
  - Compact dropdown labels readable.
  - Scenes/actions chip text clearly readable and proportionate.

Track P0-2: Rooms row readability + interaction contract
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_rooms_card.js`
- Objective:
  - Increase row/slim control/text sizes; lock tap target behavior; keep long-press room toggle.
- Acceptance:
  - Sub-buttons/orbs are comfortably tappable.
  - Tap anywhere on room body/icon/chevron performs one consistent action.
  - Long-press toggles room lights only.

Track P0-3: Weather data semantics + density
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
- Objective:
  - Make precip mode unit-aware and provider-safe; reduce vertical whitespace; improve toggle fit.
- Acceptance:
  - Precip mode reflects real provider data (no misleading forced percentages).
  - Details render in compact 2-column arrangement.
  - Forecast day/value text is readable.
  - Toggle controls remain inside card bounds on narrow widths.

Track P0-4: Nav overlap hardening
- Files:
  - `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
  - `Dashboard/Tunet/tunet-suite-config.yaml` (view-level consistency pass)
- Objective:
  - Ensure all views/subviews honor bottom offset and keep last card fully visible.
- Acceptance:
  - On mobile, final card can be scrolled fully above nav in overview/rooms/room subviews.

## 4) Notes for Implementation

- Keep one-worktree rule (`/home/mac/HA/implementation_10`).
- Preserve locked interaction direction:
  - Rooms row: sub-buttons toggle individual lights, long-press toggles room.
  - Primary tap action must be explicit and consistent.
- Treat sections sizing in 3-layer HA model:
  - page (`max_columns`) -> section (`column_span`) -> card (`grid_options`).
