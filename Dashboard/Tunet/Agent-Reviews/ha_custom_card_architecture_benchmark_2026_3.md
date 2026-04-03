# HA Custom Card Architecture Benchmark (2026.3)

Date: 2026-03-07  
Scope: decision support only (no runtime code changes)

## Executive summary (what good looks like)

In 2026.3, best-in-class Home Assistant custom cards are:

- **Sections-native first**: they treat Sections as a 12-column per-section grid contract via `getGridOptions()` (not ad hoc pixel math), with explicit min/default bounds ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view), [sections sizing blog](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/), [frontend grid sizing](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-grid-size.ts), [grid section runtime](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/sections/hui-grid-section.ts)).
- **Editor-compatible**: they expose either `getConfigElement` or `getConfigForm` (+ `getStubConfig`) so UI editing and picker behavior are robust ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#graphical-card-configuration), [frontend types](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/types.ts), [editor fallback logic](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts), [card editor lookup](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/card-editor/hui-card-element-editor.ts)).
- **Container-aware responsive**: they prefer element/container measurement or observers for density decisions, not global viewport assumptions in embedded layouts ([sections view width computation](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-sections-view.ts), [Layout Card ResizeObserver pattern](https://github.com/thomasloven/lovelace-layout-card/blob/master/src/layouts/base-column-layout.ts)).
- **Sizing-hint consistent**: `getCardSize()` is conservative and aligned with rendered height, because HA still uses it in masonry and some fallback paths ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-masonry-view), [computeCardSize timeout/fallback](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-size.ts)).
- **Registration-safe**: custom elements and picker metadata avoid duplicate registration patterns during resource reloads (HA docs show baseline push pattern; production repos vary) ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#graphical-card-configuration), [Bubble Card registration](https://github.com/Clooos/Bubble-Card/blob/main/src/bubble-card.js), [Layout Card registration](https://github.com/thomasloven/lovelace-layout-card/blob/master/src/layout-card.ts)).

**Opinionated conclusion:** Tunet v2 is ahead on API surface coverage (`getConfigForm`/`getStubConfig` widely present) and centralized base styling direction, but still lags on container-first responsiveness and strict Sections contract purity in several high-traffic cards.

## Norms checklist

### Authoring/API norms

- Implement `setConfig`, `getCardSize`, and `getGridOptions` with realistic defaults/min bounds ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card), [sections support blog](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support/)).
- Provide editor support through `getConfigElement` and/or `getConfigForm`; HA editor now supports form-schema fallback when `getConfigElement` is absent ([types](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/types.ts), [editor fallback](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts)).
- Provide `getStubConfig` for picker defaults ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#graphical-card-configuration)).
- Register card metadata in `window.customCards`; avoid duplicate pushes in hot-reload scenarios (best practice, not universally followed in ecosystem) ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#graphical-card-configuration), [Bubble Card](https://github.com/Clooos/Bubble-Card/blob/main/src/bubble-card.js), [Mushroom helper](https://github.com/piitaya/lovelace-mushroom/blob/main/src/utils/custom-cards.ts)).

### Responsiveness norms

- Prefer **container/element width** for layout mode decisions when card may live in varying section spans ([sections width algorithm](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-sections-view.ts), [Layout Card ResizeObserver](https://github.com/thomasloven/lovelace-layout-card/blob/master/src/layouts/base-column-layout.ts)).
- Use viewport media queries only for truly viewport-global behavior.

### Sections sizing norms

- Treat section grid as `12 * section_span` columns; `columns: full` means full section width, not full page width ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view), [hui-grid-section](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/sections/hui-grid-section.ts)).
- Use multiples of 3 for default `columns` unless there is clear reason for precise mode ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view), [compute-card-grid-size](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-grid-size.ts)).
- Keep `getCardSize` coherent with actual rendered states to avoid placement drift ([compute-card-size](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-size.ts)).

## Major repo pattern comparison (Bubble-focused)

- **Bubble Card**: broad feature coverage and explicit `getGridOptions`, but also keeps legacy `getLayoutOptions`, uses static element registration without idempotent guards, and pushes directly to `window.customCards` without dedup checks ([bubble-card.js](https://github.com/Clooos/Bubble-Card/blob/main/src/bubble-card.js)).  
  - Benchmark interpretation: strong UX ambition, but weaker lifecycle/registration hygiene than a hardened multi-card suite should target.
- **Mushroom**: strong base abstraction with shared card primitives, calculated grid sizing in a base class, and structured registration helper usage ([base-card.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/utils/base-card.ts), [template-card.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/cards/template-card/template-card.ts), [custom-cards.ts](https://github.com/piitaya/lovelace-mushroom/blob/main/src/utils/custom-cards.ts)).
- **Layout Card**: clear container-driven responsive pattern (`ResizeObserver` + width-derived columns), useful as a reference for Tunet viewport-to-container migration ([base-column-layout.ts](https://github.com/thomasloven/lovelace-layout-card/blob/master/src/layouts/base-column-layout.ts)).

## Comparative matrix

| Norm | External best practice | Tunet current | Gap | Risk |
|---|---|---|---|---|
| Sections 12-col contract fidelity | `getGridOptions` with explicit rows/cols/min/max, section grid semantics honored ([docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view), [hui-grid-section](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/sections/hui-grid-section.ts)) | Broad `getGridOptions` coverage exists, but several cards still rely on coarse/weak row hints ([sections_contract_audit.md](./sections_contract_audit.md)) | Hint realism inconsistent card-to-card | Medium-High |
| `getCardSize` realism | Conservative and state-aware ([compute-card-size](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-size.ts)) | Multiple static or simplified formulas (`media`, `sonos`, `weather`, `actions`, `scenes`) | Over/under allocation in mixed views | Medium |
| Config editor API | Support `getConfigElement` and/or `getConfigForm`; HA fallback supports form schema ([hui-element-editor.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts), [types.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/types.ts)) | Strong: most Tunet cards implement `getConfigForm` + `getStubConfig` | No major gap | Low |
| Registration hygiene | Prevent duplicate definitions and picker entries under reloads | Good in `tunet_base.js` (`customElements.get` + dedup `window.customCards`) | None material | Low |
| Container-first responsiveness | Use element width/observers for local layout changes ([sections view algo](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-sections-view.ts), [layout-card](https://github.com/thomasloven/lovelace-layout-card/blob/master/src/layouts/base-column-layout.ts)) | Mixed: Status is container-aware; Lighting/Rooms/Media/Weather/Speaker/Nav still include viewport-driven branching ([sections_contract_audit.md](./sections_contract_audit.md)) | Inconsistent responsive behavior in narrow sections on wide screens | High |
| Global layout side effects | Card internals should not mutate host/global layout in sections | Nav card applies global view offsets and host-level geometry influence ([sections_contract_audit.md](./sections_contract_audit.md)) | Cross-surface coupling | High |
| Central style governance | Shared token/lane system with constrained overrides (seen in large suites like Mushroom base abstractions) ([Mushroom base-card](https://github.com/piitaya/lovelace-mushroom/blob/main/src/utils/base-card.ts)) | Direction is correct (`tunet_base.js` central), but drift remains in interaction-heavy cards ([proportional_scale_adoption_plan.md](./proportional_scale_adoption_plan.md), [type_profile_consumption_options.md](./type_profile_consumption_options.md)) | Card-local divergence | Medium-High |

## Red-flag anti-patterns (stop doing)

- Using `window.innerWidth` / global `matchMedia` as the primary card density driver for cards inside Sections.
- Relying on static `getCardSize()` while render height changes materially by state/mode.
- Injecting card-local CSS that mutates global `hui-view` / `hui-sections-view` geometry.
- Adding new card-local typography/spacing systems when base tokens can express the same intent.
- Treating `columns: full` or wide spans as a substitute for accurate card intrinsic sizing.

## Practical architecture options for Tunet

### Option 1: Sections contract hardening only (smallest safe)

- Scope: normalize `getGridOptions`/`getCardSize` realism across top-risk cards first (`lighting`, `speaker_grid`, `weather`, `media`, `sonos`, `actions`, `scenes`).
- Effort: **Medium**.
- Migration blast radius: **Low-Medium** (no full style refactor).
- Risk profile: reduces layout misfit risk fast, but does not solve style drift.

### Option 2: Container-first responsiveness sweep (recommended next)

- Scope: replace viewport-first branching with container-driven mode resolution in interaction-heavy cards.
- Effort: **Medium-High**.
- Migration blast radius: **Medium**.
- Risk profile: highest payoff for Sections correctness and cross-device consistency.

### Option 3: Base-led profile/lane consolidation (strategic)

- Scope: move to shared profile consumption model in `tunet_base.js` with constrained family overrides (as outlined in internal plans).
- Effort: **High**.
- Migration blast radius: **High** (cross-card visual behavior).
- Risk profile: best long-term maintainability, but requires tranche discipline and live validation gates.

## Recommendation confidence

Recommended sequence: **Option 1 -> Option 2 -> targeted Option 3 pilots**.

- Confidence in sequence: **0.81**.
- Why not jump to full automation (Option 4):
  - HA sections/grid still rely on explicit card contracts (`getGridOptions`, `getCardSize`) and editor semantics; implicit auto-derivation is harder to predict and debug ([custom-card docs](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card#sizing-in-sections-view), [compute-card-grid-size](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-grid-size.ts)).
  - Tunet already has card-specific interaction complexity (rooms/lighting/status/media); hidden automation layers increase regression surface and reduce explainability.
  - Blast radius is system-wide and rollback granularity is poor.

## If we had to start tomorrow (phased plan)

1. **Tranche A (smallest safe): contract calibration only**
   - Update high-risk card sizing hints and document expected row/column envelopes.
   - Acceptance: no obvious over/under allocation at `390x844`, `768x1024`, `1024x1366`, `1440x900`.

2. **Tranche B: container-first responsiveness on two pilot cards**
   - Pilot on `tunet_lighting_card` + `tunet_speaker_grid_card`.
   - Acceptance: mode switches follow container width under mixed section spans.

3. **Tranche C: remove global host mutation from nav path**
   - Isolate nav spacing behavior to explicit container contract.
   - Acceptance: no unrelated section spacing/scroll side effects.

4. **Tranche D: base profile consumption pilot (not global)**
   - Pilot family-lane model on one shared family pair only.
   - Acceptance: visual parity improves without new local drift or interaction regressions.

5. **Tranche E: expand only after lock evidence**
   - Roll out to remaining cards only with per-surface validation records.

## Primary sources

- HA user docs: [Views](https://www.home-assistant.io/dashboards/views/), [Sections](https://www.home-assistant.io/dashboards/sections/), [Cards](https://www.home-assistant.io/dashboards/cards/)
- HA developer docs: [Custom card](https://developers.home-assistant.io/docs/frontend/custom-ui/custom-card), [Sections sizing update](https://developers.home-assistant.io/blog/2024/11/06/custom-card-sections-support)
- HA frontend source: [hui-sections-view.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/views/hui-sections-view.ts), [hui-grid-section.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/sections/hui-grid-section.ts), [compute-card-grid-size.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-grid-size.ts), [compute-card-size.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/common/compute-card-size.ts), [types.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/types.ts), [hui-element-editor.ts](https://github.com/home-assistant/frontend/blob/dev/src/panels/lovelace/editor/hui-element-editor.ts)
- Major custom-card repos: [Bubble Card](https://github.com/Clooos/Bubble-Card), [Mushroom](https://github.com/piitaya/lovelace-mushroom), [Layout Card](https://github.com/thomasloven/lovelace-layout-card)
- Tunet internal analyses: [sections_contract_audit.md](./sections_contract_audit.md), [proportional_scale_adoption_plan.md](./proportional_scale_adoption_plan.md), [type_profile_consumption_options.md](./type_profile_consumption_options.md)
