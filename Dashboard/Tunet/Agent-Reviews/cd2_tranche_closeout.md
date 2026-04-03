# CD2 — Shared Interaction Adoption: Tranche Closeout

## PREFLIGHT
- BRANCH_AND_HEAD: `main` @ `63e4b32`
- CONTROL_DOCS_READ: plan.md, FIX_LEDGER.md, handoff.md, CLAUDE.md, Dashboard/Tunet/CLAUDE.md, flickering-herding-wolf.md
- CONTROL_DOC_CONFLICTS: FIX_LEDGER and Dashboard/Tunet/CLAUDE.md were stale (said CD2 next); corrected in this closeout
- STALE_FINDINGS_RECONCILIATION: N/A — CD2 is the subject, not a reuse of prior findings
- ASSUMPTIONS: CD0 and CD1 are closed. Pre-CD2 gate items (plan ref consolidation, vocabulary status, stale cards_reference entries) were all resolved before CD2 started.

---

## TRANCHE_ID: CD2
## TITLE: Shared Interaction Adoption
## STATUS: DONE
## COMPLETED: 2026-04-03

---

## GOAL
Close motion, hover, press, focus, and transition inconsistency across the entire card suite before bespoke work starts. Use `cross_card_interaction_vocabulary.md` as the executable spec.

## USER_VISIBLE_OUTCOME
All 11 CD2 cards (excluding status/nav) now have:
- Guarded hover (no sticky hover on touch)
- Token-based press scales (consistent feel)
- Focus-visible on all interactive elements
- Explicit multi-property transitions (no `transition: all`)
- Tap-highlight reset (no blue flash on mobile)
- Reduced motion composition

## FILES_CHANGED

### Base layer
- `Dashboard/Tunet/Cards/v3/tunet_base.js` — INTERACTIVE_SURFACE export, disabled tokens, base tap-highlight reset, prefers-contrast:more focus ring

### 11 card files
- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_light_tile.js`
- `Dashboard/Tunet/Cards/v3/tunet_lighting_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_rooms_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_climate_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sensor_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_weather_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_media_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_sonos_card.js`
- `Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js`

### Test suites (new)
- `Dashboard/Tunet/Cards/v3/tests/helpers/css_contract_helpers.js` — registry + extraction utilities
- `Dashboard/Tunet/Cards/v3/tests/interaction_source_contract.test.js` — 146 source-level tests
- `Dashboard/Tunet/Cards/v3/tests/interaction_dom_contract.test.js` — 66 runtime DOM tests

### Documentation
- `Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md` — normalized pre-impl, updated compliance tables post-impl
- `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` — test suite inventory updated

### Control docs synced
- `plan.md`, `handoff.md`, `FIX_LEDGER.md`, `CLAUDE.md`, `Dashboard/Tunet/CLAUDE.md`, `Dashboard/Tunet/AGENTS.md`, `.claude/skills/tunet-agent-driver/SKILL.md`

## FILES_NOT_CHANGED (excluded)
- `tunet_status_card.js` — scope lock
- `tunet_nav_card.js` — verify-only (already reference-quality)

---

## CHANGES_MADE

### Base contract (tunet_base.js)
- Added `INTERACTIVE_SURFACE` CSS export: opt-in `.interactive` class with cursor, tap-highlight, multi-property transition, hover guard, press scale, focus-visible
- Added disabled tokens: `--disabled-opacity: 0.55`, `--disabled-surface-opacity: 0.35`, `--disabled-control-opacity: 0.38`
- Extended base RESET: `button, [role="button"], [tabindex] { -webkit-tap-highlight-color: transparent; }`
- Verified `prefers-contrast: more` focus ring thickening (already present)

### Per-card normalization (11 cards)
- **40+ `transition: all`** → explicit multi-property with tokens (`--motion-fast`, `--motion-ui`, `--motion-surface`, `--ease-standard`, `--ease-emphasized`)
- **20+ unguarded `:hover`** → wrapped in `@media (hover: hover)`
- **15+ hardcoded press scales** (.90, .94, .96, .98, .99) → `var(--press-scale)` / `var(--press-scale-strong)`
- **Focus-visible added** to weather (zero before), media (info-tile, grp-check, vol-icon), sonos (speaker-tile), climate (hdr-tile), speaker_grid (info-tile)
- **Focus-visible token migration**: actions (.action-chip), scenes (.scene-chip), rooms (.room-tile), sensor (.sensor-row), lighting (.info-tile, .toggle-btn), climate (.thumb) — all from hardcoded 2px/blue to `var(--focus-ring-width/color/offset)`
- **speaker_grid focus ring**: `var(--accent)` → `var(--focus-ring-color)` (accent stays for non-focus uses; color unification deferred to CD9)
- **`--spring` removed**: sonos and speaker_grid local definitions deleted, usages → `var(--ease-emphasized)` (identical value)
- **`translateY(-1px)` removed**: speaker_grid hover (shadow-lift only per vocabulary §1)
- **Climate thumb**: `scale(1.08)` → `var(--drag-scale)` with local `--drag-scale: 1.08` override to prevent visual regression
- **Sensor dead CSS**: `.section-action` rules removed (class never applied to any element)
- **Tap-highlight**: added to all `tap_source: 'local'` interactive elements
- **REDUCED_MOTION**: verified composed in all 11 card stylesheets

### Test infrastructure
- Card registry with `focus_source`, `tap_source`, `element_tag` metadata per interactive selector
- Source tests encode vocabulary §1-§7 as blocking assertions
- DOM tests use mock hass fixture for full rendering — zero skips
- Timing-token gate narrowed to interactive selectors (non-interactive surface transitions not blocked)
- No CD3 semantics creep (no keyboard-reachability assertions, no role/ARIA checks)

---

## ACCEPTANCE_CRITERIA_CHECK

| Criterion | Status | Evidence |
|-----------|--------|----------|
| INTERACTIVE_SURFACE export exists | PASS | tunet_base.js exports it; 5 source tests + 5 DOM tests verify |
| Required disabled/focus/press tokens | PASS | 15 token tests pass |
| No `transition: all` in CD2 cards | PASS | 11 source tests + 11 DOM tests verify |
| No unguarded `:hover` | PASS | 11 source tests + 11 DOM tests verify |
| No forbidden hardcoded press scales | PASS | 22 source tests verify |
| No unresolved `--spring` | PASS | 1 source test verifies |
| No hover `translateY` | PASS | 11 source tests verify |
| Touched cards compose REDUCED_MOTION | PASS | 11 source tests verify |
| Tap-highlight coverage | PASS | 9 source tests verify (local elements) |
| Focus coverage matches registry | PASS | 14 source tests for local selectors |
| Focus-ring uses --focus-ring-color | PASS | 11 source tests verify |
| prefers-contrast:more thickens ring | PASS | 1 source test verifies |
| npm test | PASS | 368/368 (7 suites) |
| npm run tunet:build | PASS | 13 cards built |
| Deploy | PASS | 13 files SCP'd, resources bumped to ?v=20260403_cd2 |
| Lab rendering | PASS | 13 cards visible at 1440×900, zero red-card errors |
| Climate non-regression | PASS | Visual match to baseline at desktop |
| 4-breakpoint × 2-mode screenshots | PENDING | User manual verification — not a CD2 regression blocker |

---

## VALIDATION_RUN

### Static
- `npm test`: 368/368 pass
- `npm run tunet:build`: 13 cards, zero errors
- Source contract: 146/146 pass (hover, press, focus, transitions, tokens, drift)
- DOM contract: 66/66 pass (exports, registration, rendered CSS, mock hass)

### Runtime
- Server file verification via SSH: zero `transition: all`, hover guards present, press tokens present across 5 spot-checked cards
- Browser shadow DOM inspection: CD2 signatures confirmed (hasHoverGuard, hasPressToken, hasDisabledToken, !hasTransitionAll)

### HA/Live
- 13 cards rendering at 1440×900 in rehab lab, zero red-card errors
- Lovelace resources bumped from `?v=20260314_v3a` to `?v=20260403_cd2`

### What couldn't be validated
- Dark mode screenshots (requires user toggle)
- Mobile breakpoints 390×844, 768×1024, 1024×1366 (visual spot-check only, no formal comparison)
- Interactive hover/press behavior (requires manual user testing)

---

## BLOCKERS
None.

## KNOWN_RISKS
- Stale cache incident: initial post-deploy test showed old behavior due to browser cache. Resolved by bumping Lovelace resource `?v=`. Added to project memory as `feedback_cache_busting_deploy.md`.
- Climate thumb drag-scale override: local `--drag-scale: 1.08` added to prevent visual regression from base default of 1.05. If the override is later removed, thumb press will feel subtly smaller.

## DEPLOY_STATUS
Deployed to rehab lab. Resources bumped. New code confirmed serving.

## ROLLBACK
- Restore source files: `./Dashboard/Tunet/scripts/deploy_tunet_v3_lab.sh --source`
- Revert Lovelace resources to `?v=20260314_v3a` via `ha_config_set_dashboard_resource`
- git revert the CD2 commits

---

## REVIEW_HANDOFF

### For CD3 — Shared Semantics Adoption
CD3 scope (from flickering-herding-wolf.md lines 725-780):
- Add `bindButtonActivation` helper to tunet_base.js
- 6 cards: actions, lighting, climate, weather, media, speaker_grid
- Button role retrofits, keyboard activation (Enter/Space)
- Existing slider semantics preserved
- Forbidden: drag behavior changes, media/sonos redesign, status changes

### Interaction contract now enforced by test suite
The interaction_source_contract.test.js suite is the **authoritative static CD2 gate**. Any future card changes that introduce `transition: all`, unguarded hover, hardcoded scales, or missing focus-visible will fail the test suite. This is the regression firewall for CD2 work.

### Pre-CD3 gate items (if any)
- None identified. CD3 can proceed directly.
