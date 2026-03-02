# Tunet Tranche Queue

## NOW

### T-005
- `Custom nav chrome recovery POC`
- Why now:
  - the user wants the major product decisions handled one at a time, together
  - the custom nav bar already exists but is sidelined in POC mode
  - the intended bottom-bar / side-rail experience is one of the highest-leverage UX decisions in the whole suite
  - future popup, shell, and layout work should happen in the context of the actual navigation model rather than a temporary forced-mobile dock
- Decision focus:
  - bottom dock on phone/tablet vs side rail on desktop
  - whether the nav remains pure chrome or gains compact integrated media affordances
  - how much of the Apple-grade interaction language belongs in nav versus page surfaces
- Deliverable:
  - one working nav POC that is visibly intentional and can become the real directional baseline

## NEXT

### T-006
- `Browser Mod popup POC`
- Likely scope:
  - one minimal room popup or one minimal media popup
  - Browser Mod integration/service usage
  - dashboard config only, unless a tiny helper change is truly required
- Why next:
  - the user explicitly wants Browser Mod, not broken hash popups
  - popup behavior is a core product decision and should be proven with one working, premium-feeling example before further broad UI work
  - the popup model influences nav behavior and overview affordances

### T-007
- `Integrated UI / UX shell recovery`
- Likely scope:
  - `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
  - `Dashboard/Tunet/Cards/tunet_page_card.js`
  - any Sections-compatible shell/background/styling path needed to recover Tunet atmosphere
- Why next:
  - the Apple-grade polish and V1 atmosphere are still missing
  - the top utility strip still does not feel intentional enough
  - page-shell recovery should happen after nav and popup direction are established, not before

## LATER

### T-008
- `Home overview layout and hero decision`
- Likely scope:
  - `Dashboard/Tunet/tunet-suite-storage-config.yaml`
  - `Dashboard/Tunet/Docs/overview_ia_locked.md`
- Why later:
  - the user wants the home layout to be the fourth major decision, after nav, popup, and shell/UI language
  - the right hero concept depends on the chosen nav model, popup model, and restored shell language
  - layout should not be finalized while those three upstream decisions are still moving

### T-009
- `Convert Kitchen storage subview from stacked light tiles to one consolidated lighting surface`

### T-010
- `Convert Dining storage subview from stacked light tiles to one consolidated lighting surface`

### T-011
- `Convert Bedroom storage subview from stacked light tiles to one consolidated lighting surface`

### T-012
- `Validate simple Tunet config-editor behavior in live HA UI with one card that should fully support getConfigForm()`

### T-013
- `Evaluate tunet-nav-card as chrome vs layout participant and harden its storage-dashboard presentation`

## ORDER LOCK

The user explicitly locked the next four major product decisions in this order:

1. `NAV`
2. `POPUP`
3. `INTEGRATED UI / UX`
4. `HOME LAYOUT`

Do not silently reorder these back into the older "layout first, polish later" sequence without explicit user approval.
