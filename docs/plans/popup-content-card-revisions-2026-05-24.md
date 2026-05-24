# Popup Content-Card Revisions — Items 1-3 from T8 M1 Review

**Created**: 2026-05-24 12:20am MDT
**Source**: T8 popup M1 review surfaced 3 visible defects in content cards inside Bubble adaptive-dialog popups at 390×844. T8 shell behavior verified correct; these are card-internal layout defects, not popup-mode regressions.
**Active branch**: main; T8 already deployed to `/tunet-home-preview/home` storage-mode dashboard.
**Authority**: this plan supplements `~/.claude/plans/synthetic-dazzling-oasis.md` and `~/.claude/plans/flickering-herding-wolf.md` — it is a δ-polish micro-tranche, not a new CD pass.

---

## Phase 1: Context (already loaded)

### Memory search
Query: `MEMORY.md` index + recent observations 12828, 12855, 12460, 12575, 13238, 13239, 13241, 13251.

Key findings:
- #13239: Climate card template structure mapped — hdr (info-tile + fan + mode-wrap), temps (indoor + t-right), slider-zone
- #12855: Climate card mode dropdown z-index fix at host level — relevant to NOT regressing
- #13241: Shared info-tile pattern across climate + media — design language consistency expected
- #12460: Volume debounce gap in media — NOT in scope of this plan, but adjacent
- #13251: Media popup uses `tunet-sonos-card` + `tunet-speaker-grid-card`, NOT `tunet-media-card` — clarifies item 2a target file

### Files read
- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js` (1547 lines) — read 115-413 (header + temps + responsive block at 601)
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js` (1414 lines) — read 1-300 + 440-528 (informational; not the target file)
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js` (1747 lines) — read 100-230 + 500-580 (track-info, transport, responsive block at 510)
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js` (1370 lines) — line-numbered grep: layout 151-153, .spk-name 286-309, phone @media at 486-505
- `Dashboard/Tunet/Cards/v3/tunet_alarm_card.js` (763 lines) — confirms this is the alarm-LIST card, NOT the alarm-edit content (which is native HA cards in YAML)
- `Dashboard/Tunet/tunet-home-preview-config.yaml` — read 580-680 (dining popup), 800-830 (media popup), 880-950 (alarm-edit popup)

### Prior Claude work
Most recent: T8 popup shell verification commit at d3f6db1 (8 popups × 2 breakpoints, M1 evidence read inline). Adjacent: #12855 climate dropdown z-index fix 2026-05-23 5:18pm (don't regress).

### Gaps (closed via DOM inspection 2026-05-24 12:30am — `/tmp/popup-dom-inspect/`)
**Media popup phone, hard evidence**:
- `.player-header` total width: **314px** at 390×844 popup
- Four flex children (not three as the original plan assumed):
  - `.album-art`: 32px @ flex `0 0 auto`
  - `.track-info`: **6.59px** @ flex `1 1 0%` (this is the visible defect — crushed to a single character because there's no room)
  - `.transport`: 140px @ flex `0 0 auto`
  - `.speaker-wrap.source-wrap`: **105px** @ flex `0 1 auto` (the missing 4th child — Kitchen ▼ dropdown)
- Math: 32 + 140 + 105 + ~30 (gaps) = 307px used → 7px left for track-info. Matches measured 6.59px.
- Track-info already has `min-width: 0` set on the element. The constraint is not ancestor-side — it's the 4-sibling competition starving the flex-grow child.

**Alarm-edit popup desktop, hard evidence**:
- The clipping element is `div.bubble-pop-up.popup-mode-adaptive-dialog.large.is-popup-opened`
- This element has `max-height: 662px` applied as INLINE STYLE by Bubble Card 3.2.1 (= 73.5vh on 900px viewport; Bubble's own "large" mode calculation)
- Inner scroll container: `.bubble-pop-up-container.is-scrollable` with `overflow: auto`, height 600px
- The inner `ha-card` has `max-height: none` (computed) — the original Change Set D target was wrong
- Conclusion: card_mod must target `.bubble-pop-up`, not `ha-card`, to raise the ceiling. Bubble Card's card_mod hook applies styles within its own internal DOM scope, so `.bubble-pop-up { max-height: X !important }` selectors should resolve.

---

## Phase 2: Analysis

### Component 1: Climate card header + temps (item 1)

**Upstream (what feeds into this)**:
- `climate.dining_room` state → hvac_action / current_temperature / target_temp_low / target_temp_high (lines 1006-1045)
- Container width (the dining-room popup body) → drives the `@media (max-width: 440px)` block at line 601

**Downstream (what consumes this)**:
- Header serves as identity + mode dropdown — used in 3 popups (#room-dining-room is the canonical one; #room-bedroom/etc. could carry climate later)
- Mode dropdown click handler at line 1463 (`set_hvac_mode`) — must remain wired through any DOM/CSS reshuffle
- Mode dropdown z-index hoist at line 1514+ (#12855 fix) — must NOT regress

**Invariants at risk**:
- #1 Brightness bounds: NA (climate card)
- #2 Govee color temp: NA
- #3 Manual auto-reset: NA
- #4 Force modes override: NA (climate, not OAL)
- #5 Environmental additive: NA
- #6 ZEN32 LED sync: NA
- #7 Pause freezes system: NA
- **Tunet visual hierarchy 4-layer contract**: Low risk — change is scoped to the `@media (max-width: 440px)` block; chrome/scaffold layers unchanged
- **Climate as visual baseline** (per Cards/v3/CLAUDE.md): Low risk — desktop layout untouched; only the existing phone media query is extended

**Change classification**: Type A (Isolated). Single card, single media query block, no downstream consumers beyond the 1 popup currently using climate.

### Component 2a: Sonos card player-header track-info (item 2 first half)

**Upstream**:
- `media_player.living_room` state → media_title / media_artist (lines 574-576 render targets)
- Popup container width → drives the `@media (max-width: 440px)` block at line 510

**Downstream**:
- The track-name + track-artist labels are display-only (no click handler beyond the title_tap_action at line 1074 which is config-gated)
- Transport buttons (lines 578+) are siblings, not children, of track-info — their layout is independent

**Invariants at risk**:
- Selected-target volume model (#11507): NA for this change (volume overlay layout untouched)
- Transport routing for Sonos+Spotify (#12575): NA for this change (transport DOM structure preserved)
- **Volume debounce defect** (#12460): adjacent but NOT addressed here; explicitly out of scope per CLAUDE.md M1 narrow-tranche rule

**Change classification**: Type A (Isolated). Single media query at line 510, single CSS block.

### Component 2b: Speaker-grid tile names (item 2 second half)

**Upstream**:
- Each speaker's `name` from the popup config at lines 820-830 (e.g., "Living Room", "Dining Room")
- Phone breakpoint @media at line 486 in `tunet_speaker_grid_card.js`
- Tile grid: `grid-template-columns: repeat(var(--cols-sm, 2), minmax(0, 1fr))` at line 488

**Downstream**:
- The speaker tiles drive selection state (lines 1055-1142 render) — text content change does NOT affect selection contract
- Group toggle badge (line 1062) is independent of the name area

**Invariants at risk**:
- Speaker-tile contract (#11507): Low risk — only the name overflow handling changes; click targets unchanged
- The tile name is the primary identity for the click target — truncating to "Living..." is functionally fine (users recognize positions) but visually weak

**Change classification**: Type A (Isolated).

### Component 3: Alarm-edit popup overflow on desktop (item 3)

**Upstream**:
- Native HA cards in YAML at lines 902-950+ — no Tunet card source file involved
- Popup `card_mod: *popup_style` anchor at line 900, which carries `max-height: 86vh !important` on desktop

**Downstream**:
- All 8 popups consume the `*popup_style` anchor — changes to the anchor cascade
- Items 1, 2a, 2b are popup-CONTENT fixes that work WITH the existing shell; this item touches the SHELL CSS

**Invariants at risk**:
- T8 popup shell verified correct (commit d3f6db1, 16 captures read inline): Medium risk — any change to `*popup_style` re-opens the T8 verification gate. Mitigation: scope the change to NOT affect the 7 other popups visibly, OR override per-popup.

**Change classification**: Type B (Cascading) — touches the shared anchor. Requires fresh capture of all 8 popups × 2 breakpoints if the anchor is modified, OR scope the change to per-popup card_mod override (no anchor changes), reducing classification back to Type A.

**Decision (recorded here, awaiting Mac stamp)**: Per-popup override. Add a local `card_mod` block on the `#alarm-edit` bubble-card that adds `max-height: none` or `max-height: 92vh` on desktop. Do NOT modify `&popup_style`. This keeps T8 evidence load-bearing.

---

## Phase 3: Design — line-level changes

### Change Set A (REPLACED 2026-05-24 1:42am — Mac's direction): Use existing climate `variant: thin` in popup

**File**: `/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-home-preview-config.yaml`

**Mac's direction (1:41am 2026-05-24)**: "We have a slim climate tile version set up in the Cosmos dashboard. If you wanna look at that for Climate, I think that that is pretty good."

**Discovery via grep on cosmos config**: `tunet-climate-card` supports `variant: thin` (config option declared at climate card source line 768, defaulted at line 821). Cosmos dashboard uses `variant: thin` at lines 321, 331 (climate + weather thin variants for dense surface layout). Climate card source contains a full `:host([variant="thin"])` CSS family at lines 56-104 that:
- Reduces .card padding
- Compacts .hdr layout
- Compacts .temps spacing
- Smaller slider, scale, thumbs
- **Removes the indoor temp from the header per existing Mac feedback at line 1199**

That last point is significant: the cramped "Indoor 71° Heat 54° Cool 67°" row I observed at phone width DOES NOT EXIST in the thin variant — the indoor temp lives below the slider as `.cur-marker`, not in the temps header. Thin variant inherently sidesteps the temps-cramping defect.

**Edit location**: line 604-606 of `tunet-home-preview-config.yaml` (inside `#room-dining-room` popup).

**Current state (lines 604-606)**:
```yaml
      - type: custom:tunet-climate-card
        entity: climate.dining_room
        name: Climate
```

**Proposed replacement**:
```yaml
      - type: custom:tunet-climate-card
        entity: climate.dining_room
        name: Climate
        variant: thin
```

**That's the entire Change Set A**. One YAML key added.

**Climate card source (`tunet_climate_card.js`)**: **UNCHANGED**. No `@media (max-width: 440px)` block extension. No CARD_VERSION bump for climate (since source is untouched).

**Adversarial review v1 findings disposition (carry-forward)**:
- M1 (vertical stacking eats 50px) — NEUTRALIZED; thin variant is denser, not taller
- M4 (line-1446 climate in dining-room subview) — NEEDS NEW CONSIDERATION: the dining-room subview at line 1851 uses `variant: standard` deliberately. Should it stay standard (full hero card on subview where space is plentiful) OR follow popup pattern with thin? **Default: leave subview standard; popup uses thin.** Mac can stamp differently.
- L1 (visual identity change requires Mac stamp) — RESOLVED; Mac chose the thin variant explicitly

**v3-review-A1 KNOWN RISK (surface for empirical validation at M1, NOT pre-emptively fixed)**:
Direct source read confirms `:host([variant="thin"])` CSS at lines 56-106 of `tunet_climate_card.js` modifies `.card` / `.temps` (hides) / `.slider*` / `.scale*` / `.cur-marker*` — but does NOT touch `.hdr`'s flex layout. The `.hdr` row at 390px popup width still has 3 children (hdr-tile + fan-btn + mode-btn with nowrap "Heat / Cool") competing for ~310-330px effective interior width.

Rough budget at 390px popup: hdr-tile ~140px + fan-btn 42px + mode-btn ~80px + 3×8 gap = ~286px. Should fit in 310-330px BARELY. Cosmos thin context: `column_span: 2` of `max_columns: 6` view on 1440px desktop ≈ 392px section width — known-good. Popup-on-phone is ~80px narrower, so risk is real but on the boundary.

**Mitigation if M1 capture shows header overflow**:
1. Add Change Set A2 to the same tranche: phone @media override scoped to `:host([variant="thin"])` that abbreviates mode-btn text on phone (e.g., "Heat / Cool" → icon-only) OR stacks the .hdr to 2 rows under thin variant only. Estimated ~12 lines of CSS to climate card source, would require CARD_VERSION bump.
2. Decision: empirical validation FIRST (capture, read inline, decide). Do NOT pre-emptively add Change Set A2.

**Validation criteria for item 1 (revised)**:
- [ ] On phone 390×844 `#room-dining-room`, climate card renders in thin variant — no overlap of identity tile with mode dropdown, no temps row cramping (because indoor temp is below slider as cur-marker)
- [ ] On desktop 1440×900 `#room-dining-room`, thin variant renders without visual issue (cosmos dashboard already uses thin on desktop, so this is known-good)
- [ ] Mode dropdown still opens on tap; service calls still wired (no source change, so no risk)
- [ ] Dining-room subview at `/tunet-home-preview/dining-room` UNCHANGED (still standard variant) — confirm no regression

**Rollback for Change Set A**: Remove the `variant: thin` line. Single-line revert.

<!-- v1+v2 CSS-extension proposal removed 2026-05-24 1:45am — superseded by Mac's direction to use the existing variant:thin path. Original proposal preserved in git history at the v2 plan revision. -->

---

### Change Set B (REVISED post-DOM-inspection 2026-05-24): Sonos-card player-header phone layout (item 2a)

**File**: `/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`

**Edit location**: line 510-536, the existing `@media (max-width: 440px)` block.

**Root cause CONFIRMED** (evidence: `/tmp/popup-dom-inspect/media_phone_dom.json`):
`.player-header` is 314px wide at 390×844 popup. Four flex children compete:

| Child | Measured width | Flex | Role |
|-------|----------------|------|------|
| `.album-art` | 32px | `0 0 auto` | Thumbnail |
| `.track-info` | **6.59px** | `1 1 0%` | Title + artist — STARVED |
| `.transport` | 140px | `0 0 auto` | 4 buttons (prev/play/next/vol) |
| `.speaker-wrap.source-wrap` | **105px** | `0 1 auto` | Speaker dropdown — the missed 4th sibling |

Math: 32 + 140 + 105 + (3 × 10 gap) = 307px used → 7px remaining for track-info. Matches measured 6.59px.

The speaker-wrap has `flex-shrink: 1` but its inner label "Kitchen" + icon + chevron set `min-content` to ~105px so it can't shrink further. Track-info (`flex: 1 1 0%`, `min-width: 0` already set) gets whatever's left, which is nothing.

**Proposed addition (lines 519-545, extending existing @media block; preserve lines 511-518 + lines 521-535 verbatim)**:
```js
  @media (max-width: 440px) {
    .card { padding: var(--card-pad, 14px); gap: 10px; }
    .player-header { gap: 10px; }
    .album-art { width: 32px; height: 32px; border-radius: 8px; }
    .album-art .icon { font-size: 18px; }
    .track-name { font-size: 13px; }
    .track-artist { font-size: 10px; }
    .t-btn { width: 32px; height: 32px; }
    .t-btn .icon { font-size: 18px; }

    /* T8.1 — player-header reflows to 2 rows on phone-popup widths.
     * Root cause (DOM-verified): 4 flex siblings (album + track-info +
     * transport + speaker-wrap) compete for 314px. speaker-wrap holds
     * 105px (Kitchen ▼) and transport 140px, starving track-info to
     * 6.59px (single character). Fix: wrap layout; use `order` to place
     * album+track-info on row 1, transport+speaker-wrap on row 2.
     * Evidence: /tmp/popup-dom-inspect/media_phone_dom.json */
    .player-header {
      flex-wrap: wrap;
      row-gap: 10px;
    }
    .album-art       { order: 0; }
    .track-info {
      order: 1;
      flex: 1 1 calc(100% - 42px);  /* 32px album + 10px gap reserved */
      min-width: 0;
    }
    .transport {
      order: 2;
      flex: 0 0 auto;
    }
    .speaker-wrap.source-wrap {
      order: 3;
      flex: 0 1 auto;
      margin-left: auto;  /* right-align on row 2 beside transport */
    }

    /* Tiles become near-square on mobile (PRESERVED VERBATIM) */
    .speaker-tile {
      width: 100px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 10px 8px 16px;
      gap: 3px;
    }
    /* ... rest of existing tile rules (.spk-icon-wrap, .spk-name, .spk-vol, .spk-vol-track) preserved ... */
  }
```

**Predicted row layout at 390×844**:
- Row 1: `[album 32] [gap 10] [track-info ~272]` = 314px ✓ (title fits at ~13 chars with ellipsis tail)
- Row 2: `[transport 140] [auto-fill ~70] [speaker-wrap 105]` = 314px ✓

**Validation criteria for item 2a (revised)**:
- [ ] On phone 390×844 with media playing, track title + artist both readable (no single-character truncation)
- [ ] On phone 390×844, transport + speaker-wrap both visible on row 2, neither truncated; speaker-wrap right-aligned
- [ ] On desktop 1440×900, `.player-header` remains single 4-child row identical to T8 capture
- [ ] Transport service calls still wired (no JS handler changes)
- [ ] Speaker dropdown still opens on tap and is not clipped (z-index unchanged)
- [ ] Card body content below `.player-header` (volume slider, etc.) not pushed off-screen by the added row

**Rollback for Change Set B**: Revert the added `flex-wrap`, `row-gap`, `order/flex` rules inside the @media block. ~22 lines.

---

### Change Set C (REPLACED 2026-05-24 1:45am — Mac's direction): Speaker-grid name JS strip via compactSpeakerName

**File**: `/home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`

**Mac's direction (1:41am 2026-05-24)**: "I would use JS to strip the room name from the speaker titles."

**Discovery via grep**: `compactSpeakerName()` is already imported (line 17) but never invoked in the speaker-grid render. The function (defined at `tunet_base.js:1631`) maps long labels to short single-word forms:
- "Living Room" → "Living"
- "Dining Room" → "Dining"
- "Kitchen" → "Kitchen"
- "Bathroom" → "Bath"
- "Bedroom" → "Bed"
- Fallback: first word of cleaned label

All 5 speakers in the media popup config end up unambiguous single words ≤7 chars, which fits comfortably in 155px phone tiles with no wrap needed AND looks cleaner on desktop too.

**Edit location**: line 1142 of `tunet_speaker_grid_card.js`.

**Current state (line 1142)**:
```js
      nameEl.textContent = spk.name || spk.entity;
```

**Proposed replacement**:
```js
      nameEl.textContent = compactSpeakerName(spk.name || spk.entity);
```

**That's the entire Change Set C**. One-character-net JS change (wrap existing expression in the function call).

**Implications**:
- Apply UNCONDITIONALLY (not phone-only). Mac chose JS strip, which is suite-wide. The compact forms ("Living", "Dining") remain unambiguous in his single-home context.
- Desktop visual: tile names also become shorter — this is a deliberate aesthetic choice per Mac's instruction.
- The phone @media block at lines 486-505 stays UNCHANGED. No CSS modification, no 2-line wrap, no padding tweak.

**Adversarial review v1+v2 findings disposition (carry-forward)**:
- M3 (vol-track misalignment with 2-line names) — NEUTRALIZED; names are now 1 line always, no mixed-height tiles
- H2 / H3 (CSS-only narrative drift, `align-items: stretch` no-op) — NEUTRALIZED; no CSS changes

**Scope decision**: applies to speaker-grid tile names ONLY (line 1142). The sonos-card source dropdown (`tunet_sonos_card.js`) and media-card source dropdown (`tunet_media_card.js`) ALSO render speaker labels but have their own truncation handling (`.spk-name { max-width: 88px }` etc.). They are LEFT UNCHANGED in this tranche. If Mac wants suite-wide compactSpeakerName application, that becomes a separate follow-up to verify each call site has the right behavior.

**Validation criteria for item 2b (revised)**:
- [ ] On phone 390×844, all 5 speaker tiles render names as: Living, Dining, Kitchen, Bath, Bed — no truncation, no ellipsis
- [ ] On desktop 1440×900, tile names also rendered as compact forms (Mac-approved aesthetic change)
- [ ] Selection state (active speaker highlight), group toggle badge, volume slider — all UNCHANGED
- [ ] CARD_VERSION bumped `'3.3.0'` → `'3.3.1'` for cache invalidation

**Rollback for Change Set C**: Revert line 1142 to `nameEl.textContent = spk.name || spk.entity;`. Single-line revert.

---

### Change Set D (REVISED post-DOM-inspection 2026-05-24): Alarm-edit popup desktop max-height override (item 3)

**File**: `/home/mac/HA/implementation_10/Dashboard/Tunet/tunet-home-preview-config.yaml`

**Edit location**: line 888-900, the `#alarm-edit` bubble-card definition. Replace `card_mod: *popup_style` with an INLINE card_mod that targets `.bubble-pop-up` (NOT `ha-card`).

**Root cause CONFIRMED** (evidence: `/tmp/popup-dom-inspect/alarm_desktop_dom.json`):
- The clipping element is `div.bubble-pop-up.popup-mode-adaptive-dialog.large` with **inline-style** `max-height: 662px` (~73.5vh at 900px viewport). Bubble Card 3.2.1 computes this dynamically based on "large" mode for ≥900px viewports.
- The inner `ha-card` has `max-height: none` (computed). The original Change Set D targeted `ha-card`, which would not raise the actual ceiling.
- The shared `&popup_style` anchor's `max-height: 86vh !important` rule on `ha-card` does NOT win — Bubble Card's outer container clips first.
- Inner scroll container: `.bubble-pop-up-container.is-scrollable` (`overflow: auto`, h=600px) is the actual scroll viewport; raising `.bubble-pop-up` max-height naturally raises this child too.

**Problem**: Alarm-edit content (markdown title + entities Time block + 4 ±15/5 buttons + Volume slider + Include linked + Close + Save) exceeds 662px at 1440×900, causing the Close/Save row to be clipped because the scrollable region ends before the buttons.

**Proposed replacement (line 900)** — target both `.bubble-pop-up` (the actual clipper, via inline-style override using `!important` against Bubble's dynamic inline assignment) AND retain T8 `ha-card` styling so the inner sheet visuals are preserved:
```yaml
      # T8.1 — alarm-edit override: reach past the inner ha-card and raise
      # Bubble Card's adaptive-dialog .bubble-pop-up max-height ceiling.
      # DOM-confirmed: .bubble-pop-up.large gets inline max-height: 662px
      # at viewport 900px, which clips Close/Save row of alarm-edit.
      card_mod:
        style: |
          /* Outer popup container — raise the actual ceiling.
           * Bubble Card's popup is LIGHT DOM (appended to body), so
           * card_mod selectors must be bare — NOT :host-prefixed.
           * !important beats Bubble's dynamic inline non-!important
           * assignment of max-height: 662px. */
          .bubble-pop-up.popup-mode-adaptive-dialog.large {
            max-height: 92vh !important;
          }
          /* Inner scroll container — DOM JSON showed height: 600px
           * (not max-height). Cover both property sources. */
          .bubble-pop-up-container.is-scrollable {
            height: auto !important;
            max-height: none !important;
          }
          /* Inner sheet visuals — preserve T8 shell exactly */
          ha-card {
            border-radius: 24px 24px 0 0 !important;
            padding-bottom: env(safe-area-inset-bottom) !important;
            transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            min-height: 85vh !important;
          }
          ha-card::before {
            content: ''; position: absolute; top: 8px; left: 50%;
            transform: translateX(-50%);
            width: 36px; height: 5px; border-radius: 3px;
            background: rgba(255,255,255,0.4); pointer-events: none;
          }
          @media (min-width: 768px) {
            ha-card {
              max-width: 980px !important;
              min-width: 720px !important;
              margin-left: auto !important;
              margin-right: auto !important;
              border-radius: 24px !important;
              min-height: 78vh !important;
              box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.25) !important;
            }
            ha-card::before { display: none; }
          }
          @media (min-width: 1440px) {
            ha-card { max-width: 1100px !important; }
          }
```

**Trade-off considered**: This duplicates the anchor body inline (~25 lines of CSS) instead of referencing `*popup_style`. The duplication is intentional — it lets us override `max-height` cleanly without modifying the shared anchor (which would force re-verifying all 8 popups). A future refactor could introduce a `&popup_style_tall` parallel anchor if more popups need the taller variant.

**v3-review-D1 KNOWN RISK (surface for empirical validation at M1)**:
The inline card_mod carries `min-height: 85vh !important` on `ha-card` UNCONDITIONALLY (not gated on `@media (min-width: 768px)`). On phone 390×844, this forces the alarm-edit sheet ha-card to 85% of 844px = 717px regardless of content. Alarm-edit has 6+ blocks (per observation #13264) so 717px may be appropriate — but if content collapses shorter than 717px, the sheet visibly has empty space below the last block. The desktop override at the `@media (min-width: 768px)` block adds `min-height: 78vh` (overriding the unconditional 85vh) — so desktop is fine. Phone is the concern.

**Mitigation if M1 phone capture shows hollow space below content**: gate the `min-height: 85vh` rule behind `@media (max-width: 767px)` so it only applies on phone, AND verify if alarm-edit's phone organic content height naturally fills the sheet. If not, lower the phone min-height ceiling or remove it.

Decision: empirical validation at M1 phone capture; do NOT pre-emptively change the min-height.

**Validation criteria for item 3**:
- [ ] On desktop 1440×900, `#alarm-edit` popup shows the Save and Close buttons fully visible at the bottom (not clipped)
- [ ] On phone 390×844, `#alarm-edit` popup still bottom-anchored with rounded top corners (no regression vs T8 verification capture)
- [ ] Other 7 popups still render at their max-height ceiling unchanged (T8 evidence still valid)
- [ ] Alarm-edit close/save buttons still wired to their respective scripts/services

**Rollback for Change Set D**: Replace the inline card_mod block back to `card_mod: *popup_style`. Single-line revert.

---

## Phase 4: Sequencing + Deploy

### Recommended execution order

1. **Change Set A (Climate)** first — Type A, single file, fastest validation cycle
2. **Change Set B (Sonos-card)** — Type A, single file, but content claim ("track-info crushed") needs DOM-inspection confirmation as defensive step before commit
3. **Change Set C (Speaker-grid)** — Type A, single file, low-risk
4. **Change Set D (Alarm-edit popup)** — Type A after per-popup override decision, but ABSOLUTELY LAST because it's the only YAML change and requires dashboard storage-mode redeploy

### Deploy chain (after all changes land in source)

```bash
# Build + deploy cards
npm run tunet:build
npm run tunet:deploy:lab

# Deploy dashboard (scoped per CLAUDE.md §9.2)
npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview

# Production-mirror capture for M1 evidence
node /tmp/popup-capture.mjs  # or the same harness that produced T8 evidence
```

### M1 Evidence requirement (per CLAUDE.md non-negotiable)

For each of the 4 changes, capture at minimum:
- `#room-dining-room` at 390×844 + 1440×900 (Change A validates here)
- `#media-living-room` at 390×844 + 1440×900 (Changes B + C validate here)
- `#alarm-edit` at 390×844 + 1440×900 (Change D validates here)
- Read all 6 captures inline (not file-path-only).
- Produce the standard M1 USER-PERSPECTIVE REVIEW block before commit.

The remaining 5 popups (living/kitchen/bedroom/office/oal-detail) are evidence-bounded by the T8 verification (commit d3f6db1) since Changes A-C do not touch the shared `&popup_style` anchor, and Change D uses per-popup override. NO re-capture needed for those 5 unless adversarial review identifies a cascade risk.

---

## Phase 5: Stop triggers (per Global CLAUDE.md)

- If DOM inspection reveals Change Set B's hypothesis is wrong (track-info crushing has a different root cause), STOP and re-investigate before editing CSS
- If Change Set D's per-popup card_mod override doesn't actually win over the YAML anchor reference at Lovelace-config-save time (anchor resolution timing), STOP and consult Bubble Card 3.2.1 docs / consider modifying the shared anchor with full re-verification
- If alarm-edit on phone regresses after Change D (e.g., max-height: 92vh applied where 86vh was correct on phone), STOP and gate the override behind `@media (min-width: 768px)` only

---

## Out of scope (explicit)

- Volume debounce defect (#12460) — separate tranche
- Sonos+Spotify transport routing (#12575) — separate tranche
- T8 popup shell changes — closed by d3f6db1 evidence
- Media-card (NOT sonos-card) phone layout — different popup target
- Native HA card styling inside alarm-edit popup — Mac may want a future Tunet alarm-edit card; this plan does NOT introduce one

---

## Awaiting

After adversarial review v2 of THIS plan, await Mac's `Proceed to implementation` stamp.

---

## Appendix A — Adversarial Review v1 Findings + Disposition

Reviewer (feature-dev:code-reviewer) returned 10 findings on the v1 plan. Disposition:

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| H1 | High | Change Set B missed 4th flex child `.speaker-wrap` | **FIXED** in revised Change Set B above (DOM-verified; speaker-wrap now placed via `order: 3` on row 2) |
| H2 | High | Change Set D targeted `ha-card`, real ceiling is on `.bubble-pop-up` inline style | **FIXED** in revised Change Set D above (now targets `:host .bubble-pop-up.popup-mode-adaptive-dialog.large`; DOM-verified) |
| M1 | Med | Climate header stack costs ~50px vertical; popup body fit not validated | **ADDRESSED** — see Appendix B re-verification block; new validation criterion added: "full card content (header + temps + slider) visible without clipping" |
| M2 | Med | `.track-info` already has `min-width: 0`; root cause was ancestor-side | **CLOSED** — DOM inspection confirmed root cause IS sibling competition, not ancestor min-width. M2 was the right diagnostic instinct but wrong direction; the corrected Change Set B addresses the verified root cause |
| M3 | Med | Speaker tile vol-track misalignment with 2-line names | **ADDRESSED** in Change Set C revision below — add `align-self: flex-end; position: static` to vol-track on phone, OR keep tiles stretched to tallest height in row (CSS Grid does this by default; verify) |
| M4 | Med | `tunet-climate-card` appears at 3 yaml locations | **ADDRESSED** in re-verification block (Appendix B) — capture all phone-visible climate-card instances |
| L1 | Low | Change Set A is a visual identity change | **EXPLICIT** — see "User decision required" below |
| L2 | Low | Anchor duplication in Change Set D is silent-drift debt | **ADDRESSED** — record entry in `visual_defect_ledger.md` post-implementation |
| L3 | Low | Phase protocol — Phase 3 design not Mac-stamped | **ACKNOWLEDGED** — implementer must wait for "Proceed to implementation" before any code changes |
| L4 | Low | CARD_VERSION bump treated as optional | **FIXED** — Change Set A,B,C MUST bump CARD_VERSION constant + Lovelace resource `?v=` cache-bust |

### Change Set C amendment (M3) — SUPERSEDED in v4

The CSS amendment below was authored for the v2/v3 CSS-wrap approach. In v4, Change Set C is JS-only (`compactSpeakerName()` at line 1142) — names are always 1 line, no mixed-height tiles, no vol-track misalignment vector. The CSS amendment is **no longer applicable** and should not be implemented.

<details>
<summary>v2/v3 amendment text (preserved for plan history; do NOT implement)</summary>

```js
    /* (Documentary CSS rule from v2/v3 — no-op default; NOT in v4 scope) */
    :host(:not([use-profiles])) .speakers {
      align-items: stretch;
    }
```
</details>

### User decision required (L1)

The Change Set A treatment for climate-card phone — stacking the `.hdr` so identity-tile takes row 1 and fan-btn + mode-btn take row 2 — is a **visual identity change**, not just an overflow fix. The single-row layout makes identity and controls visual peers; the two-row stack subordinates controls. This is the user-decision branch raised in the initial offer (DOM-inspect first vs. alternative single-row approach via abbreviating "Heat / Cool" to icon-only on phone).

**Default if no decision recorded**: 2-row stack (as designed). Implementer awaits Mac's stamp on this branch as part of the broader "Proceed to implementation" token.

---

## Appendix B — Revised M1 Re-verification Scope

Post-implementation production-mirror capture must include:

| Surface | Why captured |
|---------|-------------|
| `#room-dining-room` at 390×844 + 1440×900 | Change Set A primary target; thin variant renders without cramping at phone width, desktop matches cosmos-style density |
| `#media-living-room` at 390×844 + 1440×900 | Change Set B + C primary target; track title + compact speaker tile names readable |
| `#alarm-edit` at 390×844 + 1440×900 | Change Set D primary target; Close/Save buttons fully visible on desktop; phone still bottom-anchored sheet |
| `#room-living-room` + `#room-kitchen` + `#room-bedroom` + `#room-office` + `#oal-detail` at 390×844 | Confirm T8 popup-shell evidence still holds (Change Sets A-D don't touch `&popup_style`; Change Set D is per-popup); 5 popups, single-breakpoint sanity sweep |

**ADDED for Change Set C suite-wide impact (v3 adversarial review C2 finding)**:
Speaker-grid card is consumed by THREE locations in production `tunet-overview-storage-config.yaml` (lines 240, 650, 974). The `compactSpeakerName()` wrap at line 1142 applies suite-wide, so the production dashboard MUST be captured per M1 contract (`production: true` in dashboard registry).

| Surface | Why captured |
|---------|-------------|
| `/tunet-overview/overview` at 1440×900 + 390×844 | Production dashboard contains 3 speaker-grid instances; Change Set C affects all of them. Compact names ("Living", "Dining", "Kitchen", "Bath", "Bed") must render correctly across all 3 placements |

**Surfaces NOT requiring re-capture** (scope reduction from v2 plan):
- `/tunet-home-preview/home` — climate change is YAML-only on the popup; the line-366 home-view climate instance has no `variant: thin` so it's unchanged
- `/tunet-home-preview/dining-room` subview — line-1851 climate uses `variant: standard` deliberately, unchanged

Total captures: **12** PNGs (10 from above + 2 for production overview at both breakpoints). Read EACH inline (not file-path-only) before commit per M1 contract.

---

## Appendix C — Implementation Order Override

Sequencing simplified after Mac's direction (climate now YAML-only, no source change). CARD_VERSION bumps for cards with source edits only:

| Card | Current CARD_VERSION | Bump to | Line | Reason |
|------|---------------------|---------|------|--------|
| `tunet_climate_card.js` | `'1.2.0'` | **NO BUMP** | line 21 | Source UNCHANGED in v3 plan |
| `tunet_sonos_card.js` | `'1.1.0'` | `'1.1.1'` | line 34 | Change Set B modifies @media block |
| `tunet_speaker_grid_card.js` | `'3.3.0'` | `'3.3.1'` | line 39 | Change Set C modifies render line 1142 |

All three constants verified present via `grep CARD_VERSION` 2026-05-24 12:35am.

Execution sequence:

1. Change Set A (climate, YAML-only per Mac's direction) — edit `tunet-home-preview-config.yaml` line 606 area: add `variant: thin` under the `#room-dining-room` popup's `tunet-climate-card`. No card source modification. No CARD_VERSION bump.
2. Change Set B (sonos source, CSS) — edit @media block lines 510-536 of `tunet_sonos_card.js`, bump `CARD_VERSION` `'1.1.0'` → `'1.1.1'` at line 34
3. Change Set C (speaker-grid source, JS-only per Mac's direction) — change line 1142 of `tunet_speaker_grid_card.js` to wrap the name expression in `compactSpeakerName()`; bump `CARD_VERSION` `'3.3.0'` → `'3.3.1'` at line 39
4. Change Set D (yaml) — edit lines 888-900 of `tunet-home-preview-config.yaml`; no version bump; redeploy via `npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview`
5. Bundle build + card deploy: `npm run tunet:build && npm run tunet:deploy:lab`
6. Bump Lovelace resource cache-bust `?v=` via `npm run tunet:resources:sync` (confirmed real: maps to `Dashboard/Tunet/scripts/update_tunet_v3_resources.mjs` per package.json)
7. Production-mirror capture per Appendix B (10 PNGs)
8. M1 review block in commit message
9. Append `visual_defect_ledger.md` entry for Change Set D anchor duplication debt

---

## Appendix D — Adversarial Review v2 Findings + Disposition

Reviewer (feature-dev:code-reviewer) re-reviewed the v2 plan. Disposition:

| ID | Severity | Finding | Disposition |
|----|----------|---------|-------------|
| C | High | `:host .bubble-pop-up...` selector would silently drop because Bubble Card popup is light DOM | **FIXED** — Change Set D selector now `.bubble-pop-up.popup-mode-adaptive-dialog.large` (no `:host` prefix) |
| E | High | Capture target `/stats` is wrong — line-1446 climate-card is in `/dining-room` subview | **FIXED** — Appendix B capture row corrected to `/tunet-home-preview/dining-room` |
| F | Med | CARD_VERSION table incomplete | **FIXED** — verified via grep; all 3 cards have constants (climate 1.2.0, sonos 1.1.0, speaker-grid 3.3.0); plan table updated with line numbers + bump targets |
| H1 | Med | Inner scroll container override targets wrong property (`max-height` vs `height`) | **FIXED** — Change Set D now sets both `height: auto !important` AND `max-height: none !important` |
| G | Low | Hedge on `tunet:resources:sync` unnecessary | **FIXED** — Appendix C step 6 confirms script is real (package.json mapping verified) |
| A/B | Low | CSS gap + margin-left:auto behavior — confirmed spec-correct | **CLOSED** — no change needed |
| D | Low | `!important` vs inline style — correct after C fix | **CLOSED** — follows from C fix |
| H2 | Low | `align-items: stretch` is grid default (no-op) | **DOCUMENTED** — comment in Change Set C amendment marks it as intent-documenting; future implementer warned |
| H3 | Low | `compactSpeakerName()` narrative/code drift | **FIXED** — Change Set C narrative now explicitly states CSS-only chosen, JS utility NOT used |

---

## Awaiting Mac's stamp on:
- (a) DOM-revised Change Sets B and D — selectors and properties verified by `/tmp/popup-dom-inspect/*.json` + v2 review
- (b) Visual identity decision on Change Set A: 2-row stack vs. icon-only abbreviation on phone (L1)
- (c) Overall plan v3: `Proceed to implementation`

---

## Plan version history

- v1 (12:20am 2026-05-24): initial plan with H1+H2 incorrect targets, defensive-fix language
- v2 (12:35am 2026-05-24): DOM-verified post-inspection; Change Sets B + D corrected; Appendix A added
- v3 (12:40am 2026-05-24): v2-review-resolved; `:host` removed, capture target corrected, CARD_VERSION values grep-verified, scroll-container override covers both properties; Appendix D added
- **v4 (1:45am 2026-05-24)**: Mac's direction integrated — Change Set A is now YAML-only (`variant: thin`), no climate source change; Change Set C is now JS-only (`compactSpeakerName()` wired at line 1142), no CSS change. M1 capture scope reduced 12 → 10 PNGs
- **v5 (1:50am 2026-05-24)**: v3 adversarial review resolved — A1 acknowledged as known risk (thin variant CSS does NOT modify .hdr flex, header overflow may persist; M1 capture validates); C2 fixed (production overview captures added back to scope, total 12 PNGs); D1 acknowledged (phone min-height 85vh unconditional — M1 validates); M3 dead CSS in Appendix A wrapped in `<details>` and marked superseded
