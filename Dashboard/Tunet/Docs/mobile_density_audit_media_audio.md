# Mobile Density Audit - Media/Audio Cards

Date: 2026-03-06  
Scope:
- `Dashboard/Tunet/Cards/v2/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_sonos_card.js`
- `Dashboard/Tunet/Cards/v2/tunet_speaker_grid_card.js`

This audit follows the requested rubric and aligns with the current shared-density direction (`T-009E`: base mobile density tokens + selective card adoption).

## 1) `tunet_media_card.js`

### 1. Mobile repro context
- Surface: Overview/media sections and room companion sections.
- Typical mobile state: compact-width stacked sections where the card must remain glanceable and tap-first.
- Current observed issue pattern: transport + speaker selector region uses tiny typography and high vertical chrome overhead.

### 2. Current compact/mobile CSS values
- Header/info shell:
  - `.media-hdr` gap `8px`, margin-bottom `16px`
  - selector tile `padding: 6px 10px 6px 6px`, `min-height: 42px`
- Selector/dropdown:
  - selected label `font-size: 11px`
  - meta line `.spk-state` `font-size: 9.5px`
  - dropdown row `font-size: 11px`
- Body typography:
  - `.track-name` `15px` (`14px` mobile)
  - `.track-artist` `13px`
  - elapsed/remaining labels `10px`
- Mobile overrides:
  - `.card { padding: 16px; }`
  - transport gap reduced, but no density reduction in selector text scale.

### 3. Issue classification
- `tiny text`: selector + state labels (9.5-11px) are hard to scan on iOS.
- `whitespace`: header shell and card padding remain roomy while text is small.
- `hit-target`: acceptable for primary controls; secondary selector feels visually undersized.
- `clipping`: low risk currently; primary issue is readability hierarchy.

### 4. Root cause type
- `mixed`
  - Base token mismatch: card still hard-codes `16px` mobile padding instead of using shared density token baseline.
  - Card-local fixed sizing: many explicit small font values in selector/state UI.

### 5. Proposed fix plan
- `P1` Adopt shared density baseline:
  - Replace mobile `.card { padding: 16px; }` with tokenized `var(--card-pad, 14px)`.
- `P1` Raise selector readability floor:
  - Increase selected label to ~`12.5-13px` and state line to ~`11-11.5px`.
- `P2` Compress non-critical vertical chrome:
  - Trim header margin/gap and selector shell padding by ~10-15%.
- `P2` Normalize dropdown row density:
  - Use base dropdown token path where possible; avoid isolated tiny row font.
- `P3` Inline style cleanup:
  - Replace hardcoded inline icon font-size snippets with class-driven tokenized sizes.

### 6. Acceptance checks (phone portrait + tablet)
- Phone portrait:
  - Speaker selector state text readable at arm’s length.
  - Track/artist/elapsed stack has clear hierarchy and no excessive top chrome.
  - No clipping in dropdown when opened near bottom of viewport.
- Tablet:
  - Card remains visually balanced with adjacent companion cards.
  - Density scales without making controls feel cramped.

---

## 2) `tunet_sonos_card.js`

### 1. Mobile repro context
- Surface: room pages/subviews and popup-adjacent audio control surfaces.
- Typical mobile state: single-column stacked layout where speaker tiles consume large vertical area.
- Current observed issue pattern: speaker tile content (name/vol/state) remains small relative to tile footprint.

### 2. Current compact/mobile CSS values
- Card shell:
  - base `.card { padding: 16px; gap: 12px; }`
  - mobile `.card { padding: 14px; gap: 10px; }`
- Now-playing:
  - `.track-name` `14px` (`13px` mobile)
  - `.track-artist` `11px` (`10px` mobile)
- Speaker grid/tile:
  - tile `padding: 10px 12px 16px`
  - tile name `13px` (`12px` mobile)
  - tile vol/status `11px` (`10px` mobile)

### 3. Issue classification
- `tiny text`: speaker status/volume at `10-11px` in mobile mode.
- `whitespace`: tile vertical padding and card shell remain relatively large against small text.
- `hit-target`: transport buttons are fine; speaker tile text density is the issue.
- `clipping`: low in default state; watch long names with increased text.

### 4. Root cause type
- `mixed`
  - Base token mismatch: card uses card-local hardcoded padding values.
  - Card-local fixed sizing: speaker tile typography is explicitly low and not density-tokenized.

### 5. Proposed fix plan
- `P1` Adopt base card padding token:
  - Replace hardcoded card padding with tokenized mobile baseline.
- `P1` Raise speaker tile text floor:
  - Name target `~13-14px` mobile; vol/status target `~11.5-12.5px`.
- `P2` Tighten speaker tile vertical shell:
  - Reduce bottom-heavy tile padding while preserving slider/progress clearance.
- `P2` Align source button and dropdown sizing with base control token values.
- `P3` Normalize icon/text ratio:
  - Slightly reduce icon dominance where text readability is primary.

### 6. Acceptance checks (phone portrait + tablet)
- Phone portrait:
  - Speaker tile label + volume/status readable without zoom.
  - No overlap between text and volume track/progress bar.
  - Transport controls remain easy to tap.
- Tablet:
  - Multi-tile grid keeps consistent rhythm and balanced typography.

---

## 3) `tunet_speaker_grid_card.js`

### 1. Mobile repro context
- Surface: overview/media pages with speaker tile grids.
- Typical mobile state: 2-column grid where each tile must be compact but legible.
- Current observed issue pattern: tile heights stay large (`84-94px`) while compact text remains `10-12px`.

### 2. Current compact/mobile CSS values
- Grid/tile shell:
  - base `.spk-tile` `min-height: 62px`
  - compact `.spk-tile` `min-height: 56px`
  - mobile grid mode `.spk-tile` `min-height: 84px`, `padding: 8px 6px 12px`
  - alternate block includes `min-height: 94px` / compact `84px`
- Typography:
  - `.spk-name` `13px` (compact/mobile `12px`)
  - `.spk-meta` `11px` (compact/mobile `10px`)
  - `.spk-vol` `14px` (compact `13px`, mobile `12px`)
- Card shell:
  - mobile `.card { padding: 16px; --r-card: 20px; }`

### 3. Issue classification
- `whitespace`: high min-heights with modest text size create sparse tiles.
- `tiny text`: meta and name drift into 10-12px range in compact/mobile.
- `hit-target`: generally fine due large tiles, but efficiency is poor.
- `clipping`: low in current state; potential risk if text raised without reducing padding.

### 4. Root cause type
- `mixed`
  - Base token mismatch: hardcoded mobile card padding and tile dimensions bypass density tokens.
  - Card-local fixed sizing: explicit min-heights and compact font-size caps.

### 5. Proposed fix plan
- `P1` Reduce mobile min-height envelope:
  - Lower mobile tile min-height to a tighter band while preserving drag affordance.
- `P1` Raise compact text floor:
  - Name/meta/vol to readability-first sizes (especially meta from `10px` upward).
- `P2` Tokenize card shell padding:
  - Switch mobile card padding to `var(--card-pad, 14px)`.
- `P2` Harmonize compact and mobile blocks:
  - Remove conflicting dual compact/mobile min-height logic (94/84 split) where unnecessary.
- `P3` Align tile spacing tokens with light-tile conventions for visual parity.

### 6. Acceptance checks (phone portrait + tablet)
- Phone portrait:
  - 2-column tiles show readable name/meta/vol without visual dead space.
  - Horizontal drag remains smooth and does not regress iOS scroll pass-through.
- Tablet:
  - Grid remains stable and proportional as columns increase.

---

## Cross-Card Consistency Opportunities

1. `P1` Shared mobile density token adoption
- All three cards should consume the same base density controls for:
  - card padding
  - control/button min-height
  - dropdown row text/padding

2. `P1` Readability floor policy
- Set a practical floor for metadata text in compact/mobile audio surfaces (avoid `9-10px` unless purely decorative).

3. `P2` Consistent selector/dropdown language
- Media and Sonos selector rows should share a single typographic and spacing profile.

4. `P2` Tile density parity across audio cards
- Speaker-grid and Sonos speaker-tile shells should follow one compact spacing scale to avoid “different products” feel.

## Recommended implementation order (from this audit)
1. `P1` `tunet_speaker_grid_card.js` (largest whitespace-to-readability mismatch)
2. `P1` `tunet_sonos_card.js` (mobile speaker tile readability)
3. `P1` `tunet_media_card.js` (selector/state readability and shell efficiency)
4. `P2` cross-card selector/dropdown token unification
