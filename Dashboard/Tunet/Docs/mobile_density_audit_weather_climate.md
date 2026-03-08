# Mobile Density Audit - Weather + Climate

Date: 2026-03-06
Scope:
- `Dashboard/Tunet/Cards/v2/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_climate_card.js`

This is analysis only (no JS changes in this pass).

## Card: `tunet_weather_card.js`

### 1) Mobile repro context
- Primary location: Overview environment row/section (companion to climate).
- Typical composition: sections view, medium-width companion card where header controls and forecast tiles compete for vertical and horizontal space.
- Mobile behavior trigger: `@media (max-width: 440px)`.

### 2) Current compact/mobile CSS values
- Header/info:
  - `.hdr` gap `8px`, margin-bottom `16px`.
  - `.info-tile` padding `6px 10px 6px 6px`, min-height `42px`.
  - `.hdr-title` `13px`, `.hdr-sub` `10.5px`.
- Toggle controls:
  - `.seg-btn` base: min-height `24px`, padding `0 9px`, font-size `10px`.
  - mobile: min-height `22px`, padding `0 7px`, font-size `9px`.
- Body/forecast:
  - `.weather-body` gap `14px`; `.weather-main` gap `20px`.
  - `.weather-temp` `42px`.
  - `.weather-forecast` base `5` columns, mobile `3` columns.
  - `.forecast-tile` padding `10px 4px 8px`, gap `4px`.
  - `.forecast-day` `10px`, `.forecast-hi` `13px`, `.forecast-lo` `11px`, `.forecast-precip` `11px`.
- Mobile card shell:
  - `.card` padding `16px`.

### 3) Issue classification
- Whitespace too high: **Yes**
  - Large gaps (`14px`, `20px`) and forecast tile padding create tall vertical rhythm in narrow widths.
- Text too small: **Yes**
  - Segmented controls drop to `9px`; forecast day/secondary text at `10-11px` is hard to read on iOS.
- Control hit-target issues: **Borderline**
  - `22px` segmented button height is below preferred touch comfort for frequent toggles.
- Clipping/overflow risks: **Yes**
  - Two segmented groups in header can force wrap pressure and visual crowding in narrow cards.

### 4) Root cause type
- **Mixed**
  - Base token mismatch: weather bypasses centralized responsive density tokens with explicit `.card { padding: 16px; }` and hardcoded micro-control sizing.
  - Card-local fixed sizing: hardcoded small segmented control typography + fixed large content spacing.

### 5) Proposed fix plan
- Central-token adoption opportunities
  - P1: Replace explicit mobile card padding with tokenized baseline (`var(--card-pad)` / `--density-mobile-card-pad`).
  - P1: Introduce/consume tokenized segmented-control scale (min-height/font/padding) instead of `9-10px` hardcoded sizes.
- Card-local selector changes
  - P1: Reduce mobile content spacing: `.weather-body` and `.weather-main` gaps.
  - P1: Compact forecast tile density (padding/gap) and increase low-end text readability (`forecast-day`, `forecast-lo`, `forecast-precip`).
  - P2: Add explicit narrow-width header control stacking rule (view/metric groups) with min-width containment to prevent overflow.
  - P2: Align forecast count behavior with existing weather plan (`hourly precip count parity with forecast_days`) to avoid oversized forecast blocks.
- Risk/side effects
  - Tightening too aggressively can clip longer condition labels and localized day strings.
  - Reduced spacing must preserve tap clarity between segmented groups.

### 6) Acceptance checks (phone portrait + tablet)
- Phone portrait
  - Segmented buttons remain fully readable and tappable without clipping.
  - Forecast row remains inside card bounds and does not dominate vertical screen real estate.
  - No text truncation regressions for common weather condition labels.
- Tablet
  - Header controls stay on one row where space allows; wrapped layout remains visually balanced.
  - Forecast tiles maintain consistent visual rhythm with climate companion card.

### Priority scores
- P1: Segmented control readability + touch size.
- P1: Forecast tile density reduction + secondary text readability.
- P1: Tokenized mobile padding adoption.
- P2: Header control containment strategy for narrow widths.
- P3: Fine typography tuning for locale edge cases.

---

## Card: `tunet_climate_card.js`

### 1) Mobile repro context
- Primary locations: Overview environment row and room pages (including thin variant usage).
- Typical composition: high-information companion/hero card in sections layout; interacts with mode/fan controls and slider.
- Mobile behavior trigger: `@media (max-width: 440px)`.

### 2) Current compact/mobile CSS values
- Card shell:
  - Base `.card` padding `20px 20px 14px`.
  - Thin variant `.card` padding `14px 14px 10px`.
  - Mobile `.card` padding `16px 16px 12px`.
- Header/controls:
  - `.hdr` margin-bottom `16px`.
  - `.hdr-tile` min-height `42px`, padding `6px 10px 6px 6px`.
  - `.hdr-title` `13px`, `.hdr-sub` `10.5px`.
  - `.fan-btn` min-height `42px`.
  - `.mode-btn` min-height `42px`, font-size `12px`, padding `0 8px`.
- Temperature/slider region:
  - `.temps` margin-bottom `16px`.
  - `.t-val` `48px` (mobile `42px`).
  - `.t-label` `12px`.
  - Slider track height uses `--track-h` (`44px` token), thumbs `44px`.
  - Scale labels and marker labels `11px`.
- Thin variant specifics:
  - hides `.temps`; slider height `36px`; thumb `36px`; scale numbers `10px`.

### 3) Issue classification
- Whitespace too high: **Yes**
  - Large top-level paddings and repeated `16px` vertical separations make card feel tall on mobile.
- Text too small: **Yes**
  - Supporting labels/subtext at `10.5-11px` in dense control area read small on iOS.
- Control hit-target issues: **No (primary controls)**
  - Major controls maintain ~`42px` targets; slider thumbs are touch-safe.
- Clipping/overflow risks: **Medium**
  - Header control cluster (tile + fan + mode) can become cramped with long localized mode labels.

### 4) Root cause type
- **Mixed**
  - Base token mismatch: climate overrides base surface density with fixed paddings and does not consume centralized responsive card token.
  - Card-local fixed sizing: explicit vertical spacing and fixed typography choices for sub-labels.

### 5) Proposed fix plan
- Central-token adoption opportunities
  - P1: Replace explicit mobile/base card padding with `var(--card-pad)` token path.
  - P2: Map control dimensions to shared control density tokens (`--ctrl-min-h`, `--ctrl-font-size`, `--ctrl-pad-x`) where compatible.
- Card-local selector changes
  - P1: Reduce vertical rhythm: tighten `.hdr` and `.temps` bottom margins on mobile.
  - P1: Raise key small text bands (`.hdr-sub`, `.cur-label`, `.scale-num`) by ~1px equivalent.
  - P2: Add narrow-width mode-label truncation strategy to prevent header crowding.
  - P2: Keep thin variant as default for compact contexts where card must share a row with weather.
- Risk/side effects
  - Over-compression can make climate state hierarchy less legible if `t-val` and controls become visually crowded.
  - Mode label truncation must preserve accessibility (`title`/`aria` text).

### 6) Acceptance checks (phone portrait + tablet)
- Phone portrait
  - Card appears materially shorter without losing key controls.
  - Mode/fan/header controls remain comfortably tappable.
  - Supporting text is readable without zoom.
- Tablet
  - Visual balance preserved in side-by-side environment composition.
  - Thin/standard variants maintain expected hierarchy and no clipping.

### Priority scores
- P1: Card padding + vertical rhythm tightening.
- P1: Small supporting text readability pass.
- P1: Base mobile token adoption for card shell.
- P2: Mode button truncation/overflow hardening.
- P3: Optional thin-variant default tuning by section role.

---

## Cross-card note (weather + climate)
- Both cards currently mix hardcoded mobile values with shared token surfaces.
- High-confidence next tranche:
  1. Token adoption for card shell + controls.
  2. Weather segmented controls + forecast density compaction.
  3. Climate vertical rhythm + small-label readability.
- This keeps changes narrow while aligning with the new `T-009E` density baseline.
