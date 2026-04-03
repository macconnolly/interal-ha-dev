# Proportional Scale Adoption Plan (Blueprint Options)

Date: 2026-03-07  
Scope: `Dashboard/Tunet/Cards/v2/*`  
Intent: migrate `tile_size` from box-only presets to proportional scaling driven by one source-of-truth in `tunet_base.js`.

## 1) Current Reality (Observed)

- `tunet_base.js` already centralizes many density/type tokens (`--tile-pad`, `--type-*`, mobile density tokens), but cards still encode local `compact|standard|large` sizing logic.
- Strong drift exists in interaction-heavy families:
  - `tunet_lighting_card.js`: local per-profile icon/text/progress/padding overrides and `dense-compact` mode.
  - `tunet_rooms_card.js`: row/slim controls use mixed shared tokens plus local `em` sizing rules.
  - `tunet_speaker_grid_card.js`: profile handling is mostly local (`tile-size` host selectors + hardcoded text/icon/spacing values).
- Distinct families (status/sensor/weather/media/climate/actions/scenes/nav/sonos) are visually different by design and should remain so.
- Nuance to preserve:
  - Shared family lock: room tiles, light tiles, speaker tiles should align on stronger proportional rules.
  - Distinct families: may keep unique expression but must still consume a common scale source.

## 2) Shared vs Distinct Family Model

Shared interaction-heavy families (high coupling target):
- `tunet_lighting_card.js`
- `tunet_light_tile.js`
- `tunet_rooms_card.js`
- `tunet_speaker_grid_card.js`

Distinct families (common scale source, looser lane rules):
- `tunet_status_card.js`, `tunet_sensor_card.js`, `tunet_weather_card.js`, `tunet_climate_card.js`, `tunet_media_card.js`, `tunet_sonos_card.js`, `tunet_actions_card.js`, `tunet_scenes_card.js`, `tunet_nav_card.js`

## 3) Candidate Architectures (No Final Lock)

## Option A: Token-Bundle Profiles

Idea:
- Define full profile bundles in `tunet_base.js` and switch by `data-size-profile`.
- Cards read semantic lane tokens only; card-local profile math is removed where possible.

Profile mapping (`slim|standard|large`):
- `slim`: equivalent to today’s compact intent.
- `standard`: default baseline.
- `large`: accessibility/comfort profile.

Lane model:
- `icon lane`: `--lane-icon-size`, `--lane-icon-wrap`.
- `text lane`: `--lane-title-size`, `--lane-sub-size`, `--lane-value-size`.
- `progress lane`: `--lane-progress-height`, `--lane-progress-inset`, `--lane-progress-gap`.
- `controls lane`: `--lane-ctrl-size`, `--lane-ctrl-icon`, `--lane-ctrl-gap`.

Mobile/dense modifiers:
- Add orthogonal modifiers in base only:
  - `[data-device="mobile"]` remaps lane token bundle.
  - `[data-density="dense"]` applies multiplicative compression (e.g. `0.92`).

Override mechanism (allowed, guarded):
- Allowed:
  - per-card semantic override block via namespaced variables (e.g. `--card-lighting-lane-icon-mul: 0.96`).
- Guard:
  - no direct profile-specific selectors in cards (`:host([tile-size="compact"]) ...`) except temporary migration shims.
  - lint/script check for forbidden selectors after Stage 2.

Risks/tradeoffs:
- + Highest consistency and easiest long-term governance.
- - Highest initial migration effort.
- - Requires broader token taxonomy design upfront.

Migration complexity: High.

## Option B: Profile + Family Multipliers

Idea:
- Keep three global profile bundles in base.
- Add family multipliers (`interaction`, `status`, `sensor`, `media`, etc.) layered over profile tokens.
- Shared families use same family key (`interaction`).

Profile mapping (`slim|standard|large`):
- Base profile sets canonical scale.
- Family multiplier tunes profile outputs:
  - `interaction`: stronger icon/control scaling, tighter lane coupling.
  - `status/sensor/media/...`: softer, card-specific feel retained.

Lane model:
- Same lane primitives as Option A.
- Effective lane value = `profile token * family multiplier * device/dense multiplier`.

Mobile/dense modifiers:
- Device multiplier in base (`mobile`, `desktop`).
- Dense multiplier may be card opt-in (e.g. lighting dense compact mode).

Override mechanism (allowed, guarded):
- Allowed:
  - card may set family key and at most N local multipliers (e.g. max 3 custom multipliers).
- Guard:
  - disallow hardcoded px/em overrides in profile blocks.
  - migration-time compatibility layer maps old `tile_size` selectors to family multipliers.

Risks/tradeoffs:
- + Best fit for current architecture drift; incremental.
- + Preserves visual distinction while unifying math source.
- - Slightly more complexity than Option A in runtime token resolution.
- - Risk of multiplier stacking misuse if limits are not enforced.

Migration complexity: Medium.

## Option C: Hybrid Semantic Lanes (Core + Card Lane Packs)

Idea:
- Base owns core scale primitives and profile map.
- Each card family defines a lane pack (icon/text/progress/controls) that references core primitives.
- More explicit than multipliers; less rigid than full bundle replacement.

Profile mapping (`slim|standard|large`):
- Core profile sets `--scale-step`, `--space-step`, `--type-step`, `--ctrl-step`.
- Lane pack resolves final lane tokens from core steps.

Lane model:
- `icon lane`: derived from `--scale-step` + card lane coefficients.
- `text lane`: derived from `--type-step`.
- `progress lane`: derived from `--space-step`.
- `controls lane`: derived from `--ctrl-step`.

Mobile/dense modifiers:
- Core modifiers adjust steps.
- Lane packs may opt into additional compaction rules per card.

Override mechanism (allowed, guarded):
- Allowed:
  - lane-pack-level adjustments only.
- Guard:
  - card CSS cannot directly hardcode lane dimensions without a waiver entry in `handoff.md`.

Risks/tradeoffs:
- + Strong clarity by lane semantics; good for design governance.
- + Distinct families can stay distinct without forking core profile logic.
- - More documentation burden and initial cognitive load.
- - Slightly slower onboarding for future contributors.

Migration complexity: Medium-High.

## 4) Recommendation (Confidence Separated)

Recommended starting path: Option B (Profile + Family Multipliers).

Confidence:
- Option A suitability confidence: 0.63
- Option B suitability confidence: 0.81
- Option C suitability confidence: 0.72
- Recommendation confidence (B as migration entry point): 0.78

Reasoning:
- It best matches current code reality (existing local profile selectors + partial base tokens) with less disruption.
- It creates a clean bridge to Option A later if the team wants stricter centralization.
- It cleanly supports the required nuance: shared interaction-heavy cards can be tightly coupled while distinct cards remain visually different.

## 5) Concrete Token Examples + Pseudo-Schema

Example token outputs (illustrative, not locked values):

```css
:host {
  --scale-profile: standard; /* slim|standard|large */
  --scale-family: interaction; /* interaction|status|sensor|media|... */

  --profile-standard-icon: 1.00;
  --profile-slim-icon: 0.88;
  --profile-large-icon: 1.10;

  --family-interaction-icon-mul: 1.04;
  --family-status-icon-mul: 0.96;

  --device-mobile-mul: 0.94;
  --density-dense-mul: 0.92;

  --lane-icon-size-base: 40px;
  --lane-icon-size: calc(
    var(--lane-icon-size-base)
    * var(--profile-icon-mul)
    * var(--family-icon-mul)
    * var(--device-mobile-mul)
    * var(--density-dense-mul)
  );
}
```

Pseudo-schema:

```yaml
scale:
  profile: slim|standard|large
  family: interaction|status|sensor|media|climate|utility
  density: normal|dense
  device: auto|mobile|desktop
  allow_local_overrides: false

lanes:
  icon:
    size: token
    wrap_radius: token
  text:
    title_size: token
    value_size: token
    sub_size: token
    line_clamp: int
  progress:
    track_height: token
    inset_x: token
    offset_bottom: token
  controls:
    button_size: token
    icon_size: token
    gap: token

overrides:
  card_local:
    allowed_multiplier_keys:
      - icon
      - controls
      - progress
    max_override_count: 3
    requires_handoff_entry: true
```

## 6) Card Adoption Matrix

| Card | Shared profile likely | Local exceptions | Effort | Risk |
|---|---|---|---|---|
| `tunet_lighting_card.js` | `interaction` | `dense-compact` behavior; scroll mode row-height nuances | High | Medium-High |
| `tunet_light_tile.js` | `interaction` | Horizontal vs vertical variant spacing | Medium | Medium |
| `tunet_rooms_card.js` | `interaction` | `tiles|row|slim` variants; room all-toggle semantics | High | High |
| `tunet_speaker_grid_card.js` | `interaction` | container-query stacked layout; accent family | High | Medium-High |
| `tunet_status_card.js` | `status` | dropdown/alarm tile special states | Medium | Medium |
| `tunet_sensor_card.js` | `sensor` | row-list format, trend/sparkline sizing | Low-Medium | Low |
| `tunet_weather_card.js` | `status` or `media`-adjacent utility | hero temp typography lane can remain unique | Medium | Low-Medium |
| `tunet_climate_card.js` | `climate` | `thin|standard` variant and slider geometry | Medium | Medium |
| `tunet_media_card.js` | `media` | mixed control clusters and dropdown panel | Medium | Medium |
| `tunet_sonos_card.js` | `media` | legacy local sizing; speaker mini-rows | Medium-High | Medium-High |
| `tunet_actions_card.js` | `utility` | compact strip-specific chip density | Low-Medium | Low |
| `tunet_scenes_card.js` | `utility` | compact chip variant styling | Low-Medium | Low |
| `tunet_nav_card.js` | `utility` | dock geometry independent of tile lanes | Low | Low |

## 7) Staged Execution Plan With Acceptance Criteria

## Stage 0: Contract Definition (No behavior changes)

Deliverables:
- Decide option baseline (A/B/C) and lock naming.
- Define lane tokens and profile/family mapping spec in docs.

Acceptance criteria:
- One written token contract accepted by product/engineering.
- Explicit shared-vs-distinct family map approved.
- Override policy approved (what is allowed, what requires waiver).

## Stage 1: Base Infrastructure in `tunet_base.js`

Deliverables:
- Add profile/family/lane token plumbing and fallback compatibility tokens.
- Preserve existing visuals via compatibility defaults.

Acceptance criteria:
- No visual regression in current cards with default config.
- Existing `tile_size` values still parse and function.
- Mobile and dense modifiers resolve from single base source.

## Stage 2: Shared Family Migration (Interaction-heavy first)

Deliverables:
- Migrate: lighting, light_tile, rooms, speaker_grid.
- Remove direct compact/large hardcoded sizing blocks where lane tokens can replace them.

Acceptance criteria:
- All 4 shared-family cards compute icon/text/progress/controls from same lane source.
- Profile changes (`slim|standard|large`) produce proportional shifts, not box-only shifts.
- Dense/mobile behavior remains readable at target breakpoints (`390x844`, `768x1024`, `1024x1366`, `1440x900`).

## Stage 3: Distinct Family Adoption

Deliverables:
- Migrate status/sensor/climate/weather/media/sonos/actions/scenes/nav to new source-of-truth.
- Keep visual identity differences intentionally.

Acceptance criteria:
- Distinct cards use shared scale source, with documented exceptions only.
- No card contains new ad-hoc profile CSS blocks without override waiver.
- Regression checklist passes for card-specific interactions (dropdowns, sliders, media controls, nav dock).

## Stage 4: Guardrails + Decommission Drift

Deliverables:
- Add static checks (script/lint rule) for forbidden profile selector drift.
- Remove compatibility shims that are no longer used.

Acceptance criteria:
- Drift check reports zero violations in v2 cards.
- All known legacy `tile-size` hardcoded branches either removed or explicitly waived.
- Handoff docs updated with intentional exceptions and rationale.

## 8) What Will Break If We Do Nothing

- Shared family divergence will continue:
  - same `tile_size` label yields different perceived size/spacing/interaction affordances by card.
- Mobile tuning will stay expensive and brittle:
  - fixes in one card will not transfer predictably to sibling cards.
- New card work will likely reintroduce local sizing systems, increasing maintenance cost.
- Accessibility/readability regressions become harder to catch because profile behavior is non-deterministic across card families.
- v2 centralization goal around `tunet_base.js` erodes further.

## 9) Ambiguous Areas Needing Product Decision

1. Is `tile_size` user-facing naming retained (`compact|standard|large`) or renamed (`slim|standard|large`) with alias support?
2. Should dense mode be explicit user config or automatic by container width only?
3. Should shared interaction-heavy cards be forced into one family profile (`interaction`) with no card-level multiplier escape hatch?
4. For distinct cards, what is the max allowed visual deviation before it counts as a broken scale contract?
5. Should legacy cards (`tunet_sonos_card.js`) be brought to parity now or left as deferred technical debt?
6. Are there hard accessibility minimums (tap target, min text) that override profile choices in all cases?

## 10) Decision Snapshot Template (for next tranche)

Use this to avoid unilateral implementation decisions:

- Chosen architecture option: `A|B|C` (or phased `B -> A`)
- Confidence in choice: `0.xx`
- Shared-family strictness level: `strict|moderate|loose`
- Override policy: `none|guarded|open`
- Legacy compatibility window: `<date or release marker>`

