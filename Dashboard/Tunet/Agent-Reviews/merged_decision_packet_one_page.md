# Tunet V2 Decision Chooser (One Page)
Date: 2026-03-07  
Inputs merged:
- `sections_contract_audit.md`
- `proportional_scale_adoption_plan.md`
- `type_profile_consumption_options.md`
- `ha_custom_card_architecture_benchmark_2026_3.md`

## 1) Decision To Make
Choose the next architecture path for Tunet v2 card sizing/responsiveness that is most likely to succeed with lowest regression risk while preserving centralized styling and controlled overrides.

Constraints already locked:
- Single worktree + tranche discipline.
- Sections 3-layer model (Page `max_columns` -> Section `column_span` -> Card `grid_options/getGridOptions()`).
- Browser Mod popup direction remains locked.
- Full auto-inference path is not acceptable as the primary approach.

## 2) Current Reality (Why We Are Here)
What is strong:
- Broad HA UI config/editor support in Tunet cards (`getConfigForm`/stub coverage is good).
- Central style substrate exists in `Dashboard/Tunet/Cards/v2/tunet_base.js`.

What is broken/high risk:
- Container-vs-viewport inconsistency across cards (Sections mismatch risk).
- `getCardSize()` realism drift in multiple cards.
- Global host geometry mutation in nav card (`tunet_nav_card.js`) creates cross-surface side effects.
- Repeated card-local size logic causes proportional scaling drift across families.

## 3) Options (Chooser)
| Option | Scope of Change | Effort | Risk | Expected Payoff | Plausibility |
|---|---|---|---|---|---|
| A. Contract hardening only | Calibrate `getGridOptions`/`getCardSize`; stop obvious Sections violations | M | M | Immediate layout stability | High |
| B. Container-first responsiveness sweep | Replace viewport-first mode logic with container-first on priority families | M-H | M | Fixes most “looks wrong in this section” defects | Very High |
| C. Family profile consumption (controlled overrides) | Add profile/lane resolver in `tunet_base.js`; migrate shared families first | H | M-H | Long-term consistency + maintainability | High (if phased) |
| D. Full automated scaling inference | Runtime auto-derivation across cards | H+ | H+ | Theoretical, but unpredictable | Low (reject) |

## 4) Key Risks By Option
- A risk: leaves style drift unresolved; repeated visual tuning loops continue.
- B risk: migration churn if done all cards at once; must tranche by family.
- C risk: over-generalized schema can become another abstraction burden.
- D risk: poor debuggability, broad blast radius, conflicts with controlled-override requirement.

## 5) Best-In-Class Benchmark Implications (HA 2026.3 + major repos)
Norms supported by HA docs/frontend and Bubble/Mushroom/Layout patterns:
- Sections-native sizing contracts are explicit, not inferred.
- Container-aware responsive behavior is preferred for cards embedded in varying spans.
- Conservative, realistic sizing hints matter.
- Shared base abstractions are good; avoid global side effects and uncontrolled per-card forks.

Tunet alignment:
- Good: editor surface/API maturity; centralized base direction.
- Gaps: container-first consistency, sizing hint realism, nav host mutation, profile drift in interaction-heavy families.

## 6) Recommended Path (Most Plausible To Succeed)
Recommended sequence: **A -> B -> C (pilot), reject D**.

Why this is the most plausible:
- A+B resolves current production pain with manageable blast radius.
- C then consolidates long-term style/scale behavior with controlled overrides.
- This sequencing matches both internal analyses and external benchmark norms.

## 7) Concrete Tranche Plan
1. **Tranche 1 (A): Sections contract hardening**
   - Targets: `tunet_nav_card.js` (remove global host mutation), `tunet_lighting_card.js`, `tunet_speaker_grid_card.js`, `tunet_weather_card.js`, `tunet_media_card.js`, `tunet_sonos_card.js` sizing-hint calibration.
   - Exit: no obvious over/under-allocation at 390x844, 768x1024, 1024x1366, 1440x900.

2. **Tranche 2 (B): Container-first pilot**
   - Targets: `tunet_lighting_card.js` + `tunet_speaker_grid_card.js` first.
   - Exit: mode switching follows container width under mixed section spans (not viewport artifacts).

3. **Tranche 3 (C pilot): Family profile consumption**
   - Base: `tunet_base.js` adds profile/lane resolver.
   - Pilot family: interaction-heavy cards (`lighting`, `light_tile`, `rooms`, `speaker_grid`) with explicit override limits.
   - Exit: proportional compact/standard/large parity improves without interaction regressions.

## 8) What To Defer / Not Do
- Do not start full automatic inference architecture.
- Do not do global all-card migration in one tranche.
- Do not continue card-local one-off scaling branches when base-level lane tokens can express intent.

## 9) Decision Request (Chooser)
Pick one:
1. **Start Tranche 1 now (recommended)**: lowest-risk path to immediate stabilization.
2. **Jump to Tranche 2 pilot**: faster responsiveness gains, slightly higher near-term risk.
3. **Start Tranche 3 pilot now**: strategic move, highest immediate implementation complexity.

If undecided, default to **1**.
