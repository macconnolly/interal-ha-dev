# Tunet Dashboard Suite: Surface-Driven Reset

## End State

A finished, functional home-wide dashboard — every room controllable, navigation between views, conditional features, responsive on phone and desktop. The 13 cards are components serving that product, not the product itself.

## Context

The Tunet suite has accumulated structural debt across months of feature-by-feature development. Cards individually have strong design direction (glass surfaces, midnight navy, rich interactions) but collectively lack consistency and the dashboard UX is incomplete. Key problems:

- **Visual inconsistency** — hover, spacing, typography, shadows differ card-to-card
- **Profile system regressions** — mathematical token scaling broke visual relationships
- **UI editor regression** — `getConfigForm()` exists but may not be rendering; complex cards stay YAML-only
- **Deployment friction** — two-layer cache busting, manual SCP, no build step
- **Incomplete dashboard** — cards exist but the full room-by-room, navigable, conditional dashboard doesn't
- **Documentation contradictions** — control docs have conflicting authority claims and stale scope locks

---

## Governance Model

### Scope Lock Policy
Existing locks are **respected by default**. A lock is only lifted during Tranche 0 reconciliation with:
1. Documented rationale for why the lock is no longer valid
2. Replacement acceptance criteria (what replaces the lock's protection)
3. Updated continuity docs (plan.md, FIX_LEDGER.md, handoff.md)
4. User approval

No later tranche may assume a governance change that was not explicitly ratified in Tranche 0.

### Current Locks

| Lock | Source | Default Disposition |
|------|--------|---------------------|
| Status card → G3S bugfix-only | plan.md:88, FIX_LEDGER.md:41 | **Respect** unless reconciliation lifts with rationale |
| G6.1 cleanup → 30-day soak (~Apr 9) | tranche_queue.md | **Near expiry** — evaluate during reconciliation |
| Profile resolver contract locked | AGENTS.md:27, design_language.md | **Supersede as policy** in Tranche 0; code removal deferred and incremental per-surface |
| Surface execution order | AGENTS.md:42 | **Respect**: Living Room page → popup → overview → media → remaining rooms |
| Popup direction → Browser Mod | AGENTS.md:49 | **Respect** — not open for reconsideration unless Tranche 0 explicitly changes it |
| v3 = implementation authority | plan.md:22, CLAUDE.md | **Confirmed** — reconciliation resolves remaining v2 authority claims |
| Sections sizing → page/section/card reasoning | AGENTS.md:95 | **Respect** — no viewport/theme-level shortcuts; reason from page intent down |
| Validation breakpoints | AGENTS.md:161, sections_layout_matrix.md:60 | **Locked**: 390×844, 768×1024, 1024×1366, 1440×900 |

### Surface Model (per plan.md:1041-1082)

Three surfaces with distinct roles:

| Surface | Role | Leads When |
|---------|------|------------|
| `tunet-suite-config.yaml` (repo YAML) | Architecture source, branch truth, deployment-safe baseline | Architecture, entity normalization, resource pathing, long-term maintainability |
| `tunet-suite-storage` (HA storage dashboard) | **Primary UX evaluation surface**, user-facing judgment | Product feel, usability, visual hierarchy, nav/popup/shell/layout judgment |
| `tunet-overview` + other legacy dashboards | Historical reference, comparison aid | Finding older behavior worth restoring, isolated card testing |

**Surface leadership rules** (per plan.md:1084):
- Each tranche must declare which surface leads
- If surfaces drift, contributors must say so explicitly and state which is corrected first
- Do not silently claim both are current and equivalent
- Validate UX on `tunet-suite-storage`; validate architecture on repo YAML

### Guardrails

**Must NOT change during this program:**
1. Card tag names (`tunet-*-card`) — renaming breaks all dashboard configs
2. Config property names — existing YAML must continue to work; new properties are additive only
3. Dark mode palette — midnight navy locked: canvas `#0f172a`, card family `#1e293b`, dark amber `#fbbf24`
4. Interaction contract — card-body tap = route, explicit controls = toggles, hold = optional secondary
5. Climate card quality — gold standard must not regress
6. HA Sections compatibility — `getGridOptions()` must return valid values

**Must verify before each deploy:**
1. `node --check` passes on all changed files
2. Playwright screenshot comparison — no unintended regressions
3. Console has zero Tunet-related errors
4. All 13 cards load and register (check `logCardVersion` console output)
5. YAML parse-check for any changed dashboard/config files

**Process guardrails:**
1. Documentation before code — each tranche starts with doc updates, not implementation
2. Surface-driven — cards are fixed in context of the surface they serve, not in isolation
3. User sign-off — Playwright screenshots shown to user before tranche completion
4. One surface at a time — complete, validate, sign off, then next
5. No destructive cleanup — old resources, stale dashboards, legacy source stay until existing soak/cleanup locks expire and are explicitly reopened

---

## Foundational Decisions

### Decision 1: Build System — esbuild with per-card bundling
Bundles shared base into each card at build time. Eliminates two-layer cache busting.
**Sequenced after Surface 1** — prove the first surface with current tooling, then migrate. See Tranche 2.

### Decision 2: Profile Contract — Supersede as policy, migrate per-surface
The profile resolver contract is superseded as a governance decision in Tranche 0, but code removal is incremental and surface-driven. Legacy profile behavior remains available for untouched cards until each affected surface tranche migrates them.

**Replacement sizing contract** (for migrated cards):
- Explicit `tile_size` config override wins when set
- Otherwise size auto-resolves from host/container width
- Resolved size is exposed via `tile-size` attribute on the host element
- Cards use hand-tuned `:host([tile-size="compact|standard|large"])` CSS variants with em values (not px) instead of shared mathematical token scaling
- Host/container resize re-evaluates size via ResizeObserver
- All sizing values anchored at `:host { font-size: 16px }` — mandatory em anchor

### Decision 3: UI Editors — Tiered, surface-driven
- Verify and improve `getConfigForm()` only for cards touched by an active surface and intended to be user-configurable
- Status: bugfix-only until G3S
- Actions: YAML-driven until backend status/entity mapping work is explicitly planned
- Sensor: YAML-driven unless a later governance update broadens scope

### Decision 4: Visual Baseline — Climate card as measured reference (COMPLETED)
Extracted by Agent 3 (saved to `agent3_interaction_css_map.md`). Key baseline values:
- Hover: shadow lift via `var(--shadow)` on controls; dropdown uses `background: var(--track-bg)`
- Press: `scale(.94-.98)` on controls, `scale(1.08)` on thumb (scale UP)
- Focus: `2px solid var(--blue), offset 3px` via tokens
- Disabled: `opacity: .55` on card, `.35` on track
- Transitions: `all .15s ease` on controls (ANTI-PATTERN — should migrate to multi-property named tokens)
- Shadows: two-layer (`--shadow` rest, `--shadow-up` lifted) — dark mode uses heavy opacity (0.30-0.60)
- Glass: light `rgba(255,255,255,0.68)`, dark `rgba(30,41,59,0.72)` — NOT v8.3's stale 0.55/0.65
- Amber: `#fbbf24` dark (locked) — NOT v8.3's stale `#E8961E`

### Decision 6: Em units preferred over px
User preference: em-based sizing throughout (shadows, spacing, typography, dimensions).
- Status card em-based shadows are the CORRECT forward pattern
- Climate card hardcoded px values are legacy debt to migrate during surface tranches
- 16px em anchor (`:host { font-size: 16px }`) is mandatory for all cards consuming em tokens
- Conversion reference: `em = px / 16`

### Decision 5: Visual Feedback — Playwright in every tranche
Screenshot before/after every deploy. Evaluate on `tunet-suite-storage` (primary UX surface). Use `tunet-g2-lab-v3` for A/B profile comparison. Use `tunet-overview` only as historical comparison aid.

---

## Tranche 0: Contract Reconciliation

**Documentation-only tranche. No code, deploy, cleanup, or resource changes.**

### 0A: Source-of-truth resolution
- Ratify v3 as sole implementation authority in ALL Tunet control docs
- Remove/archive conflicting v2 authority claims
- Update AGENTS.md execution contract to reflect current decisions
- Update plan.md session deltas to reflect this reset
- Update FIX_LEDGER.md with current issue states
- Update handoff.md with current session state

### 0B: Scope lock evaluation
For each lock in the table above, document: still valid? If changing, provide rationale, replacement acceptance criteria, and doc updates.

**Profile contract supersession**: Explicitly ratify that the profile resolver contract (selectProfileSize, resolveSizeProfile, _setProfileVars, SIZE_PROFILES, TOKEN_MAP, FAMILY_KEYS) is superseded as policy. This means:
- New surface work uses the replacement sizing contract (Decision 2)
- Existing profile code stays in the codebase and continues to function for untouched cards
- Code removal happens incrementally as each surface tranche migrates its cards
- No blanket profile removal tranche

This is a governance decision made NOW, not deferred to later. Code follows the governance.

### 0C: Design documentation

**Completed:**
- ✓ Climate card measured visual reference extracted (Agent 3 → `agent3_interaction_css_map.md`)
- ✓ Cross-card interaction audit: 10 divergences documented across all 13 cards
- ✓ Agent 4 pressure-tested merge strategy → 7 findings, 3 critical (`agent4_design_reconciliation_critique.md`)
- ✓ Dark amber conflict resolved: `#fbbf24` is correct (code + memory lock); v8.3 `#E8961E` is stale
- ✓ Glass opacity resolved: code uses 0.68/0.72; v8.3's 0.55/0.65 is stale
- ✓ Shadow model confirmed: two-layer (code + v9.0 agree); v8.3 "three-layer" is wrong

**Merge strategy (from Agent 4 pre-merge gate):**
- IMPORT into v9.0: v8.3 §6 (choreography), §11 (timing), §5 (principles), §10 (state), §14 (prohibitions)
- SKIP from v8.3: §1.1 glass values, §4.1-4.2 token tables, §9.2 icon sizes (all stale)
- ADD to v9.0: "Token Source of Truth" section → tunet_base.js TOKENS is authoritative
- ADD to v9.0: 16px em anchor requirement
- LABEL: v8.3 §7 component catalog as "legacy reference / px baseline for em conversion"

**Also completed:**
- ✓ Cross-Card Interaction State Vocabulary written (`Dashboard/Tunet/Docs/cross_card_interaction_vocabulary.md`)
- ✓ Agent 2 HA interaction research complete (`agent2_ha_interaction_research.md`)
- ✓ User reviewed and approved interaction vocabulary with 4 corrections applied
- ✓ Agent 4 pre-merge gate findings documented — binding checklist for design_language.md merge
- ✓ Suite-wide drift patterns identified (7.1-7.6 in vocabulary doc)
- ✓ Coarse per-card risk inventory created (reference, not binding remediation)

**Deferred to surface tranches (not Tranche 0 scope):**
- Merge v8.3 §6/§11/§5/§10/§14 into design_language.md v9.0 (merge strategy defined, execution deferred)
- Accessibility debt: media, weather, sonos non-button containers need keyboard semantics
- Undefined vars: --spring (sonos/speaker_grid), --accent (speaker_grid)
- Transition anti-pattern migration (all .15s ease → named multi-property tokens)

### 0D: Deliverable
Updated control docs committed to repo. All contradictions resolved. Clear authority for every decision. Stable written contract that later tranches implement directly. User sign-off.

---

## Tranche 1: Surface 1 — Living Room Page

**Purpose**: Build the first complete room experience. Card work happens only in service of this surface.

### 1A: Document surface intent
Start from a surface spec, not card edits:
- Page intent: one-touch room lighting first, climate and media/context as companions
- Scan order: what user sees first → secondary → on-demand
- Phone stacks full-width; tablet/desktop keeps hero section dominant
- Card-body vs sub-control interaction contract for this surface
- Page-level section settings
- Section roles and column spans
- Per-card `getGridOptions()` for this surface context

**Sections research** (per AGENTS.md §7 — mandatory): Before designing the layout, perform deep current-HA Sections research and live tuning loop. Capture validated rules in `sections_layout_matrix.md`. This matrix is currently provisional and must be validated through this process before it can be treated as authoritative.

**Surface leadership**: `tunet-suite-storage` leads UX evaluation for this tranche. `tunet-suite-config.yaml` leads architecture truth. Drift between them must be reconciled before tranche closes.

**Derive the card set from the current live Living Room page config on tunet-suite-storage.** Do not add speculative cards in this tranche.

### 1B: Fix cards for this surface
Modify ONLY the cards required by this surface, only to the extent needed:
- Apply cross-card interaction vocabulary (hover, active, focus from Tranche 0C)
- **Sizing: touched cards stay on legacy profile code.** Bugfixes to profile behavior are allowed, but no ad-hoc replacement sizing logic. The shared sizing helper is introduced in Tranche 2 (Build Migration) and first consumed by surface tranches after that.
- When hand-tuning CSS for this surface, use em values (not px) per Decision 6. Conversion: `em = px / 16`.
- Verify editor behavior only for touched cards that are in-scope for UI config
- Hand-tune CSS within the existing profile framework for this surface's column width at the locked breakpoints
- No status redesign beyond already-allowed bugfixes

### 1C: Build the surface
- Create or update Living Room subview on `tunet-suite-storage` (UX evaluation surface)
- Mirror accepted structural decisions into `tunet-suite-config.yaml` (architecture truth)
- Wire navigation: rooms card tap → Living Room subview
- Wire back navigation: nav card or back → overview

### 1D: Validate
- Playwright screenshots of `tunet-suite-storage` at locked breakpoints: 390×844, 768×1024, 1024×1366, 1440×900
- All interactions work (tap, drag, navigate)
- Console clean
- Update `sections_layout_matrix.md` with validated Sections rules from this surface
- Update continuity docs (plan.md, FIX_LEDGER.md, handoff.md)
- Reconcile any drift between `tunet-suite-storage` and `tunet-suite-config.yaml`
- User sign-off on the full surface before opening next tranche

---

## Tranche 2: Build Migration (acceptance-gated, after Surface 1)

**Purpose**: Set up esbuild pipeline WITHOUT changing card behavior. Infrastructure only. Run after Surface 1 is locked to prove the first surface with current tooling before migrating.

### 2A: Pipeline setup
- Install esbuild as devDependency
- Create `build.mjs` with 13 entry points
- Build from current source locations — **do not move or split the source tree in this tranche**
- Handle `?v=` query string stripping on imports
- Output to a local `dist/` directory

### 2B: Side-effect audit and fixes
- **Font injection**: `injectFonts()` uses module-scoped `_fontsInjected` flag. Must become `window.__tunetFontsInjected` so 13 bundles don't inject fonts 13 times.
- **Card registration**: `registerCard()` already uses `customElements.get()` guard — safe for bundling. Verify.
- **Dark mode detection**: audit for module-scoped state that breaks when inlined. Fix if found.
- Audit ALL module-scoped variables in tunet_base.js for bundle-safety.

### 2C: Introduce replacement sizing helper and tests
If touched cards from Tranche 1 now depend on the new sizing contract, introduce the shared helper and its tests here.

**Replacement test contract must cover:**
- Width bucket resolution (container width → compact/standard/large)
- `tile_size` config override precedence (explicit override wins over auto-detection)
- Resize-triggered re-resolution (ResizeObserver fires → size re-evaluated)
- Host attribute application (`tile-size` attribute set on element)
- Non-mutating/idempotent sizing behavior (calling resolve twice with same width = same result)

### 2D: Validation
- Build output must be **functionally identical** to current source
- Deploy built files to a parallel TEST path on server (e.g., `/config/www/tunet/v3-built/`)
- Register test resources temporarily, validate via Playwright
- Playwright parity acceptable on the locked Living Room surface AND the lab dashboard
- Run existing `profile_resolver.test.js` against built output (tests must still pass)
- Console free of new Tunet errors

### 2E: Promotion
- Switch Lovelace resources from source to built files
- Keep previous active path as rollback — **no destructive cleanup or source relocation in this tranche**
- Set up watch + auto-deploy script (`npm run dev`)
- Document rollback procedure

### Acceptance criteria
- [ ] `npm run build` produces 13 files in `dist/`
- [ ] `node --check dist/*.js` passes for all 13
- [ ] Playwright screenshots match locked Surface 1 state
- [ ] Console has zero new Tunet errors
- [ ] Font links injected exactly once (not 13 times)
- [ ] `profile_resolver.test.js` passes against built output
- [ ] Replacement sizing tests pass (if helper introduced)
- [ ] Watch mode triggers auto-build + SCP on file save
- [ ] Rollback path tested and documented

---

## Tranche 3: Surface 2 — Living Room Popup

**Purpose**: Quick-access popup overlay for Living Room without full page navigation.

### 3A: Document popup intent
- Triggered from: rooms card Living Room tile on overview
- Content: compact lighting controls for Living Room
- Dismiss: tap outside or close button
- Technology: **Browser Mod** (per active lock in AGENTS.md:49; not open for reconsideration unless Tranche 0 changed it)
- Trigger mechanism: browser-scoped `fire-dom-event` (default per AGENTS.md:50; exceptions require explicit request)

### 3B: Implement
- Configure Browser Mod popup with Living Room lighting card (compact/filtered)
- Ensure card renders correctly in popup context (different width than full page)
- Test at locked breakpoints

### 3C: Validate + sign-off

---

## Tranche 4: Surface 3 — Overview

**Purpose**: The daily-driver home screen. All cards composed together.

### 4A: Document overview intent
- Information hierarchy: what user sees first → secondary → on-demand
- Section layout reasoning: page intent → section orchestration → card placement (per AGENTS.md:95 — reason from page intent down, not viewport/theme level)
- Section roles, column spans, max_columns derived from page intent
- Mobile stacking behavior via Sections native model

### 4B: Fix cards for overview context
Cards may need different sizing than in room subviews. Only modify what this surface requires:
- Status card: bugfix-only (G3S lock, unless lifted in Tranche 0B)
- Actions card: visual fixes only (backend dependency)
- Sensor card: visual fixes only (complex config)
- Weather card: fix forecast display, tune layout for overview context
- Rooms card: entry point to room subviews, navigation wiring
- Apply cross-card interaction vocabulary to newly-touched cards
- Migrate touched cards from profile logic to sizing contract where needed

### 4C: Compose and validate
- Build the section layout on `tunet-suite-storage` derived from page intent reasoning
- Mirror accepted structural decisions into `tunet-suite-config.yaml`
- Playwright screenshots at all 4 locked breakpoints
- Reconcile drift between storage and YAML surfaces
- User sign-off on the daily-driver screen

---

## Tranche 5: Surface 4 — Media Page

**Purpose**: Dedicated media experience.

- Document media page intent
- Media card + speaker grid composed for this surface context
- Sonos card: evaluate whether to keep, consolidate with media card, or remove
- Navigation wiring from overview
- Validate at locked breakpoints

---

## Tranche 6: Remaining Room Subviews

**Purpose**: Kitchen, Dining Room, Bedroom, Office pages.

- **Prerequisite**: HA entity room/area tag cleanup (assign entities to proper areas)
- Each room follows the Surface 1 template: document intent → derive card set from config → fix cards for context → build → validate → sign-off
- Reuse patterns established in Living Room
- A card may be touched in multiple surface tranches — treat as normal context-specific refinement, not plan drift

---

## Tranche 7: Integration & Polish

- End-to-end navigation testing: can a user control every room from the dashboard?
- Cross-card animation consistency verification
- Testing at all 4 locked breakpoints (390×844, 768×1024, 1024×1366, 1440×900)
- Performance audit (render time, scroll jank, repeated side effects)
- Edge cases (empty states, error states, loading, offline entities)
- Update control docs so implemented reality matches written contract
- Defer cleanup items (old resources, stale dashboards, legacy source removal) until existing soak/cleanup locks expire and are explicitly reopened
- Final design_language.md update to v10.0 reflecting actual implemented state

---

## Key Files

| File | Role |
|------|------|
| `Dashboard/Tunet/Cards/v3/tunet_base.js` | Shared base (1805 lines, 43 exports) — stays in place until source relocation is explicitly planned |
| `Dashboard/Tunet/Cards/v3/tunet_climate_card.js` | Gold standard measured reference |
| `Dashboard/Tunet/Mockups/design_language.md` | Design spec v9.0 (architecture + will receive visual interaction specs in Tranche 0) |
| `Dashboard/Tunet/tunet-design-system.md` | Visual spec v8.3 (interaction choreography §6, animation timing §11) |
| `Dashboard/Tunet/AGENTS.md` | Execution contract, surface queue, active locks |
| `Dashboard/Tunet/Agent-Reviews/tranche_queue.md` | Gate status + scope locks |
| `Dashboard/Tunet/Agent-Reviews/sections_layout_matrix.md` | Sections reasoning model + breakpoints |
| `Dashboard/Tunet/tunet-suite-config.yaml` | Repo-controlled architecture surface (branch truth) |
| `tunet-suite-storage` (HA storage dashboard) | Primary UX evaluation surface (not a repo file — lives in HA) |
| `plan.md` | Session deltas + scope tracking + surface leadership rules (line 1041+) |
| `FIX_LEDGER.md` | Open issues + scope constraints |
| `handoff.md` | Session continuity |
| `.env` | HA credentials (SSH + browser) |

## Test and Acceptance

### Per-tranche gate:
- [ ] Documentation updated BEFORE code changes
- [ ] Surface leadership declared (which surface leads UX vs architecture for this tranche)
- [ ] Pre/post Playwright screenshots on `tunet-suite-storage` at locked breakpoints
- [ ] Console has zero Tunet errors
- [ ] `node --check` for changed JS files
- [ ] YAML parse-check for changed dashboard/config files
- [ ] Drift between `tunet-suite-storage` and `tunet-suite-config.yaml` reconciled
- [ ] Continuity docs synced in the same tranche
- [ ] User sign-off on screenshots

### Surface acceptance (surface-level, not card-level):
- [ ] Intended scan order works
- [ ] First-touch interactions work (tap, drag, navigate)
- [ ] Layout valid at all 4 locked breakpoints
- [ ] No clipping or Sections regressions
- [ ] Navigation in/out of surface works

### Build migration acceptance:
- [ ] Functional parity with current source
- [ ] Proven rollback path
- [ ] No duplicate side effects (fonts, registration)

### Program completion:
- [ ] Every room controllable from the dashboard
- [ ] Navigation works: overview ↔ room ↔ popup ↔ back
- [ ] Dashboard works at all 4 locked breakpoints
- [ ] All control docs current and consistent
- [ ] design_language.md v10.0 reflects implemented reality

## Assumptions and Defaults

- Existing locks are honored by default; status remains deferred to G3S
- The profile resolver contract is superseded as policy in Tranche 0, but code removal is incremental and surface-driven
- The climate card is the measured visual baseline, not a standalone redesign project
- Build migration is mandatory but sequenced after Surface 1, with a hard promotion gate
- No destructive cleanup is part of this program
- A card may be touched in multiple surface tranches; this is normal refinement, not plan drift
