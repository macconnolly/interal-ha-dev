# CD11 Full Closure Plan — Status Multi-Mode Contract Lock

**Authored**: 2026-05-04 (collaborative — user diagnosis + enhancement pass)
**Owning tranche**: CD11 (root authority `~/.claude/plans/synthetic-dazzling-oasis.md` immutable post-adoption)
**Scope**: closeout / contract completion. CD11c is coded, tested, and deployed at v3.3.0. Remaining work is contract completion across four concrete gaps.

> **Plan Creation Protocol note**: This file is the closure execution plan derived from `~/.claude/plans/synthetic-dazzling-oasis.md`. The plan-of-record remains immutable. This file is the active execution document under the doc-folder convention for `Dashboard/Tunet/Docs/plans/`.

## Summary

Close CD11 in four focused gaps, in dependency order, with one commit (or small commit cluster) per gap. The current status runtime already implements the six variants in `tunet_status_card.js` v3.3.0, but closure still requires the contracts to become explicit, testable, documented, and validated.

### Resolved planning decisions

- `home_summary` stays 4-up on phone per `~/.claude/plans/synthetic-dazzling-oasis.md`.
- The CD11 editor addendum is **variant + recipe authoring only**. Raw polymorphic `tiles[]` remains YAML-only.
- Live deploy verification is part of final CD11 closure, but execution must pause for explicit deploy authorization before running `npm run tunet:deploy:lab`.
- Recipe-shorthand entity binding rules: see [Recipe Entity-Binding Rules](#recipe-entity-binding-rules) section below.

### Architectural intent (the system-philosophy claim)

CD11's architectural claim is that the status card has six distinct architectural roles, and that twelve canonical home-status semantics can be invoked by name (recipes) rather than re-authored each time. The four gaps are points where that claim was made in the runtime but not yet honored in the contract surface — incomplete recipes mean the canonical-semantics claim is conditional on external completion; variant-agnostic sizing means the six-roles claim is undercut at composition time; pre-CD11 editor/stub means the user-empowerment claim is undercut at authoring time; missing tests/docs mean none of the claims are enforced. Closing the four gaps makes the system's architectural commitments verifiable, repeatable, and durable.

---

## Operating Constraints

### Allowed implementation files

- `Dashboard/Tunet/Cards/v3/tunet_status_card.js`
- `Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js`
- `Dashboard/Tunet/Docs/cards_reference.md`
- `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- `Dashboard/Tunet/tunet-card-rehab-lab.yaml` only if fixture audit finds a real coverage gap
- `plan.md`, `FIX_LEDGER.md`, `handoff.md`

### Do not touch

- `~/.claude/plans/synthetic-dazzling-oasis.md` (immutable post-adoption)
- `tunet_base.js` (cross-card primitive layer; CD11 stays card-local)
- `tunet_nav_card.js` (CD10 territory, deferred)
- CD10/CD12 files
- room/surface composition
- unrelated dirty worktree paths

### Pre-execution verification

```bash
cd /home/mac/HA/implementation_10
pwd  # /home/mac/HA/implementation_10
git branch --show-current  # main
git rev-parse HEAD  # capture for reference
git status --short  # capture; status-card work should be visible

# Confirm both plans reachable
test -f ~/.claude/plans/synthetic-dazzling-oasis.md && echo "plan reachable"
test -f ~/.claude/plans/flickering-herding-wolf.md && echo "root plan reachable"

# Confirm v3.3.0 baseline
grep "CARD_VERSION = '3.3" Dashboard/Tunet/Cards/v3/tunet_status_card.js

# Baseline tests
npm test 2>&1 | tail -10  # capture pass/fail counts pre-changes

# Pre-edit diff inspection — for each file in Allowed list, capture current diff vs HEAD
git diff HEAD -- Dashboard/Tunet/Cards/v3/tunet_status_card.js | wc -l
git diff HEAD -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js | wc -l
git diff HEAD -- Dashboard/Tunet/Docs/cards_reference.md | wc -l
# etc.
```

### Pre-execution: handle pre-existing uncommitted CD11 work

The working tree on `main` already contains uncommitted CD11 work-in-progress (status_card.js v3.3.0 + status_bespoke.test.js + various docs). Before beginning any of the four gap closure cycles, confirm one of two conditions:

1. **Preferred**: a snapshot commit landed in the prior session capturing all uncommitted CD11 work-in-progress. Verify with `git log --oneline -3` — there should be a commit like `chore(tunet): snapshot main work-in-progress before selective merge` or similar. If present, proceed.
2. **Fallback**: if the snapshot has not yet been committed, surface to user, **do not begin gap closures**. Without the snapshot, the four gap closures would mix into the uncommitted in-progress state and produce non-atomic commits.

Do NOT amend the snapshot commit. The four gap closure commits layer on top of it.

---

## Gap 1 — Recipe Defaults Self-Containment

### Audit pass first

Before editing `STATUS_RECIPES`, produce a per-recipe audit table from the current `tunet_status_card.js` code and surface it to the user. If any single recipe is missing more than three runtime-impacting defaults, that's a signal the recipe's architectural intent needs user adjudication — pause and ask before unilaterally expanding.

Table columns:
- recipe name
- declared `type`
- target variants (which `STATUS_LAYOUT_VARIANTS` the recipe is intended for)
- runtime properties consumed (what the runtime tile actually reads)
- defaults currently provided (what the recipe's `defaults` block encodes today)
- defaults missing (the gap)
- entity binding (fixed-source vs user-bound — see Recipe Entity-Binding Rules)

Runtime property set to compare each recipe against:
- **Common to all tile types**: `type`, `icon`, `label`, `compact_label`, `accent`, `format`, `unit`, `attribute`, `dot_rules`, `show_when`, `tap_action`, `action_entity`, `navigate_path`
- **Value/indicator**: `secondary`, `dot_rules`
- **Dropdown**: `entity`, `summaryOptionAliases`
- **Timer**: `entity`, `format`, timer label/icon/accent
- **Alarm**: `playing_entity`, `snooze_action`, `dismiss_action`
- **Special**: `alt_entity`, `sun_entity` for `next_sun_event`

### Recipe Entity-Binding Rules

Locked 2026-05-04 closure plan:

| Recipe | Entity binding | Rationale |
|---|---|---|
| `home_presence` | user-bound | `person.*` or composite home-state entity |
| `adaptive_count` | user-bound | OAL system status sensor varies per user |
| `manual_overrides` | user-bound | OAL system status sensor varies per user |
| `mode_selector` | **fixed**: `input_select.oal_active_configuration` | Canonical OAL mode entity; recipe encodes the entity directly |
| `boost_offset` | user-bound | Generally `sensor.oal_system_status` but lab fixtures may use mocks |
| `inside_temperature` | user-bound | Per-room sensor |
| `inside_humidity` | user-bound | Per-room sensor |
| `next_sun_event` | **fixed**: `entity = sensor.sun_next_setting`, `alt_entity = sensor.sun_next_rising`, `sun_entity = sun.sun` | Canonical sun integration entities |
| `system_state` | user-bound | OAL system status sensor varies per user |
| `next_alarm` | user-bound | Sonos alarm summary sensor varies per user |
| `enabled_alarms` | user-bound | Sonos alarm summary sensor varies per user |
| `mode_ttl` | **fixed**: `timer.oal_active_configuration_ttl` (or canonical OAL TTL timer) | Tightly coupled to OAL mode lifecycle |

Fixed-source recipes encode `entity`/`alt_entity`/`sun_entity` directly in `defaults`. User-bound recipes require the user to pass `entity` in the recipe shorthand (`{ recipe: 'X', entity: '...' }`) and the recipe synthesis fails or warns clearly if entity is missing.

### Implementation

Make every `STATUS_RECIPES` entry sufficient for `{ recipe: 'X', entity: '...' }` to synthesize a complete canonical runtime tile. Required recipe contracts (filled in per the audit):

- `home_presence`: `value`, home icon, compact label, state format, green/red dot rules.
- `adaptive_count`: `value`, OAL adaptive count attribute, integer format, green accent.
- `manual_overrides`: `value`, manual override attribute, integer format, numeric `show_when`, reset aux action.
- `mode_selector`: `dropdown`, fixed `input_select.oal_active_configuration` entity, compact aliases via `MODE_SELECTOR_SUMMARY_ALIASES`.
- `boost_offset`: `value`, total offset attribute, integer percent format, amber accent.
- `inside_temperature`: `value`, thermostat icon, integer display, thermostat shortcut through authored `action_entity`.
- `inside_humidity`: `value`, integer percent display, blue accent.
- `next_sun_event`: `value`, fixed sunset/sunrise entities, sun state switch, passive action (no tap).
- `system_state`: `indicator`, state format, system icon/accent.
- `next_alarm`: `value` by default, becomes `alarm` in `alarms` variant via `_applyVariantRecipeDefaults`, navigation/action fallback.
- `enabled_alarms`: `value`, integer count, alarm editor navigation if authored.
- `mode_ttl`: `timer`, timer icon/accent, fixed OAL TTL timer entity, more-info fallback.

### `_applyVariantRecipeDefaults` sequencing

Locked sequence (test this end-to-end):

1. Recipe shorthand resolved (e.g., `{ recipe: 'next_alarm' }` → `STATUS_RECIPES.next_alarm.defaults`)
2. **Recipe `defaults` applied** — base tile config
3. **`_applyVariantRecipeDefaults(tile, variant)` applied** — variant-specific transformations (e.g., `next_alarm` becomes `alarm` type when variant === `alarms`)
4. **User overrides applied** — anything the user passed in the recipe shorthand object beyond `recipe` (e.g., `entity`, `label`, `compact_label`, `action_entity`, `navigate_path`)
5. Final runtime tile config

Keep `_applyVariantRecipeDefaults()` limited to variant-specific transformations. Document each known transformation:
- `next_alarm` recipe + `alarms` variant → tile type becomes `alarm`
- (other transformations enumerated as discovered during audit)

### Tests

Add a "recipe defaults self-containment" block in `status_bespoke.test.js`:

For each recipe:
- Create a shorthand card using `{ recipe: 'X', entity: '...' }` (omit `entity` for fixed-source recipes).
- Create the hand-expanded equivalent object.
- Assert deep equality against **normalized runtime config**, excluding author-index/private bookkeeping fields. See `normalize()` helper convention below.
- Assert explicit YAML still overrides recipe defaults (precedence test).
- For each fixed-source recipe, assert the canonical entity is in the runtime tile without user input.
- For each user-bound recipe, assert that omitting `entity` produces a clear failure mode (warning or error, define which).

#### `normalize()` helper convention

The test suite establishes a `normalize(runtimeTile)` helper that strips private bookkeeping fields before deep equality. Stripped fields:
- `_index` (internal tile array index)
- `_synthesized_from` (recipe provenance marker if present)
- `_authored` (raw authoring shape preservation marker if present)
- any other underscore-prefixed metadata fields

Document the helper at the top of `status_bespoke.test.js` so future test authors use it consistently.

### Docs

Update `cards_reference.md` §9 with a canonical per-recipe defaults table:
- recipe name
- target variants
- default `type`
- default properties encoded
- entity binding (fixed-source vs user-bound)
- external fields still required, if any

Mark this table as the canonical recipe surface. Cross-reference from §3 (Editor Architecture Contract) noting that recipes are the user-facing authoring layer for status-card.

### Commit (Commit 1)

```
feat(tunet): cd11 recipe defaults self-containment

Closes contract gap 1 of CD11 closure: recipe shorthand
`{ recipe: 'X' }` (with entity for user-bound recipes) now produces a
tile config functionally identical to the fully-expanded equivalent.

Architectural intent: recipes are the canonical home-status semantics
encoded once and applied uniformly. Until recipes were self-contained,
the user-empowerment promise of recipe shorthand was unfulfilled —
authors needed to know which fields the recipe didn't encode, defeating
the abstraction.

Per-recipe details: {table from audit pass, what defaults were added
per recipe, what is still external (entity binding for user-bound
recipes), which transformations live in _applyVariantRecipeDefaults
vs the recipe defaults block}.

Test coverage: recipe defaults self-containment block in
status_bespoke.test.js. For each recipe, asserts shorthand + entity
synthesizes to a runtime config deep-equal to the hand-authored
equivalent (via the normalize() helper that strips private bookkeeping).

Doc: cards_reference.md §9 gains the canonical per-recipe defaults table
including entity-binding rules.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Gap 2 — Variant-Aware Grid Sizing

### Audit pass first

Derive each variant's intrinsic shape from:
- current lab fixture authoring shape (`tunet-card-rehab-lab.yaml`)
- rendered DOM/class structure where available (read the variant's render path in `tunet_status_card.js`)
- `sections_layout_matrix.md` Sections contract
- current `getCardSize()` behavior

Do not use viewport pixel math as the primary sizing model. The sizing contract is HA Sections card-grid hints, not internal tile CSS.

### Implementation contract

`getGridOptions()` returns by resolved variant:

| Variant | columns | min_columns | rows | min_rows | max_rows | Rationale |
|---|---:|---:|---|---:|---:|---|
| `home_summary` | 12 | 6 | auto | 2 | 4 | fixed 4-up summary matrix, bounded 4×2 intent |
| `home_detail` | 12 | 6 | auto | 2 | 12 | richer detail surface with authored columns |
| `room_row` | 12 | 6 | auto | 1 | **TBD — surface to user** | horizontal strip with low intrinsic height; question is whether max_rows=1 (strict strip) or max_rows=2-3 (flexible row) |
| `info_only` | 12 | 6 | auto | 2 | 6 | passive info grid, calmer and smaller than detail |
| `alarms` | 12 | 6 | auto | 2 | 8 | alarm/timer tiles need more growth budget than summary |
| `custom` | 12 | 6 | auto | 2 | 12 | backward-compatible fallback |

> **Surface to user before implementing**: `room_row` max_rows. Plan-as-drafted said 3, but room_row's architectural intent is "horizontal strip" — should max_rows be 1 (strict strip), 2 (room for header), or 3 (flexible)? Default to 2 unless user directs otherwise.

`getCardSize()` must match the same variant logic:
- `room_row`: 1 without header, 2 with header.
- `home_summary`: estimate rows from `min(visible/configured tiles, 8) / 4`, plus header when shown.
- `info_only`: estimate from configured columns, capped to the lower info-only budget.
- `alarms`: estimate from configured columns with alarm/timer extra growth allowance.
- `home_detail` and `custom`: preserve flexible legacy estimate.

### Tests

Add per-variant tests:
- construct card for each variant
- assert exact `getGridOptions()` object
- assert representative `getCardSize()` values with header on/off and known tile counts
- assert variant resolution logic (which variant is picked under various config inputs)

### Docs

Update `Dashboard/Tunet/Docs/sections_layout_matrix.md`:
- Replace the current single stale `status` row with a status-specific per-variant sizing subsection (the table above).
- Explicitly mark the prior "Scope-locked; known height: drift at L216 deferred to CD11" language as **superseded** by CD11 reopening — keep the historical wording for context but mark the supersession with date 2026-05-04.

Update `cards_reference.md` §9:
- Enumerate the exact `getGridOptions()` return values per variant
- Enumerate the `getCardSize()` rules per variant
- Cross-reference to `sections_layout_matrix.md` per-variant subsection

### Commit (Commit 2)

```
feat(tunet): cd11 variant-aware grid sizing for status card

Closes contract gap 2 of CD11 closure: getGridOptions() and getCardSize()
now return variant-specific values per each layout variant's intrinsic
shape.

Architectural intent: grid options must derive from the same card config
that determines visible rows/columns (per sections_layout_matrix.md
Rows/Columns Translation Requirement). A variant-agnostic return
contradicts that contract — the six layout variants have fundamentally
different intrinsic shapes, and surface composition (CD12) cannot reason
about status-card placement if status doesn't tell the truth about its
own dimensions per variant.

Per-variant grid options: {table from implementation contract above}.
Per-variant getCardSize() rules: {as documented}.

Test coverage: per-variant getGridOptions() and getCardSize() tests in
status_bespoke.test.js.

Doc: sections_layout_matrix.md status row replaced with per-variant
subsection. cards_reference.md §9 updated with the contract values.
The prior "Scope-locked" status row language is explicitly superseded
2026-05-04 per CD11 reopening.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Gap 3 — Variant + Recipe Editor And Stub Authoring

### Scope

This is the **only** CD11 editor expansion. It is explicitly narrow:
- expose `layout_variant`
- expose recipe-level authoring (canonical key + alias)
- keep raw polymorphic `tiles[]` YAML-only
- do not generalize recipes to other cards
- do not touch `tunet_base.js`
- do not introduce new editor primitives

Record this as an approved CD11 addendum in control docs. Do not edit `~/.claude/plans/synthetic-dazzling-oasis.md` (immutable post-adoption).

### CARD_VERSION bump

Bump `CARD_VERSION` from `'3.3.0'` to `'3.4.0'` in this commit. Subtitle in the file header: `'3.4.0 (CD11 closure: contract lock)'` or equivalent — update the file's top comment block.

### Public authoring keys

Add top-level recipe authoring:

```yaml
type: custom:tunet-status-card
layout_variant: home_summary
recipe_tiles:
  - recipe: mode_selector
  - recipe: manual_overrides
    entity: sensor.oal_system_status
  - recipe: inside_temperature
    entity: sensor.dining_room_temperature
    action_entity: climate.dining_room
```

Also accept `recipes` as shorthand alias:

```yaml
recipes:
  - mode_selector
  - manual_overrides
  - inside_temperature
```

**Canonical key is `recipe_tiles`**; `recipes` is a convenience alias.

### Co-presence behavior (when both `recipe_tiles` and `recipes` are set)

Locked behavior: `recipe_tiles` wins, `recipes` is silently ignored, console.warn issued. Test coverage required. Rationale: canonical key always wins over alias; warn (not error) because user may be migrating between forms.

### Synthesis precedence

1. If `tiles[]` is non-empty, use it exactly. Raw YAML wins.
2. Else if `recipe_tiles[]` is present and non-empty, synthesize runtime tiles from it (and warn if `recipes` is also present).
3. Else if `recipes[]` is present and non-empty, synthesize runtime tiles from it.
4. Else use the variant stub defaults from `getStubConfigForVariant(layout_variant)`.

### `getConfigForm()`

Expose:
- `layout_variant` select: `home_summary`, `home_detail`, `room_row`, `info_only`, `alarms`, `custom`
- `recipe_tiles` object array with fields:
    - `recipe` (select; options = keys of `STATUS_RECIPES`)
    - `entity` (entity selector; required for user-bound recipes, hidden/optional for fixed-source)
    - `label` (text override)
    - `compact_label` (text override)
    - `action_entity` (entity selector for tap-routing override)
    - `navigate_path` (text for navigation override)
- existing shallow fields remain: `name`, `show_header`, `columns`, `column_breakpoints`, `tile_size`, `use_profiles`, `custom_css`
- **do not expose raw `tiles`**

Recipe selector options are the keys of `STATUS_RECIPES`.

### Stub configs

Add `getStubConfigForVariant(layout_variant)`:

| Variant | Stub recipe set |
|---|---|
| `home_summary` | `home_presence`, `mode_selector`, `manual_overrides`, `inside_temperature` |
| `home_detail` | `home_presence`, `adaptive_count`, `manual_overrides`, `boost_offset`, `inside_temperature`, `next_alarm` |
| `room_row` | `manual_overrides`, `inside_temperature`, `inside_humidity` |
| `info_only` | `inside_temperature`, `inside_humidity`, `next_sun_event` |
| `alarms` | `next_alarm`, `enabled_alarms`, `mode_ttl` |
| `custom` | legacy raw tile sample preserving all current tile types where practical (preserves backward compatibility) |

Default `getStubConfig()` returns the `home_summary` stub.

### Tests

Add tests:
- editor schema exposes `layout_variant` and `recipe_tiles`
- editor schema does **not** expose raw `tiles`
- `recipe_tiles` synthesizes expected runtime tiles
- `recipes` alias synthesizes expected runtime tiles
- both `recipe_tiles` + `recipes` present → `recipe_tiles` wins, warning issued (use a console.warn spy)
- explicit `tiles[]` takes precedence over `recipe_tiles` and `recipes`
- every `getStubConfigForVariant()` result passes through `setConfig()` into a complete runtime config
- `getStubConfig()` returns the home-summary starter
- `_applyVariantRecipeDefaults` sequencing test: recipe.defaults → variant transform → user overrides → runtime tile (assert the layered application order)

### Docs

Update `cards_reference.md` §9 Editor Architecture:
- **Authoring layer**: variant + recipe surface
- **Synthesizer layer**: recipe array → runtime tile array (per the synthesis precedence above)
- **Runtime layer**: rich tile config
- Raw `tiles[]` remains YAML-only and wins
- Co-presence behavior (`recipe_tiles` + `recipes`) explicitly documented
- Mark superseded pre-CD11 "layout_variant YAML-only" language as superseded by the approved CD11 editor addendum, dated 2026-05-04

### Commit (Commit 3)

```
feat(tunet): cd11 variant and recipe authoring for status card (v3.4.0)

Closes contract gap 3 of CD11 closure: getConfigForm() and getStubConfig()
now expose the CD11 variant + recipe authoring layer. Authoring at the
highest semantic layer the runtime supports — variants and recipes —
instead of the pre-CD11 raw-tile shape.

Three-tier model preserved per cards_reference.md §3 Editor Architecture
Contract:
- Authoring: variant selector + recipe_tiles array (recipes as alias)
- Synthesizer: recipe.defaults → _applyVariantRecipeDefaults → user
  overrides → runtime tile array
- Runtime: rich tile config (raw tiles[] YAML-only path preserved)

Synthesis precedence:
1. tiles[] non-empty → use exactly (raw YAML wins)
2. recipe_tiles[] non-empty → synthesize (warn if recipes also present)
3. recipes[] non-empty → synthesize via alias
4. fallback to getStubConfigForVariant(layout_variant)

Per-variant stubs: {table from above}.

CARD_VERSION 3.3.0 → 3.4.0 (CD11 closure: contract lock).

Test coverage: editor schema tests, synthesis precedence tests, variant
stub tests, _applyVariantRecipeDefaults sequencing test, recipe_tiles +
recipes co-presence test.

Doc: cards_reference.md §9 Editor section reflects the three-tier model.
Pre-CD11 "layout_variant YAML-only" wording marked superseded 2026-05-04.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

---

## Gap 4 — Tests, Docs, Build, And Live Closure

### Coverage audit

After gaps 1-3, audit the full surface:
- `cards_reference.md` §9 (post-update from gaps 1-3)
- `sections_layout_matrix.md` (post-update from gap 2)
- `status_bespoke.test.js` (post-update from gaps 1-3)

Create a coverage matrix:
- contract statement
- doc anchor (file + section)
- test anchor (file + describe block)
- status: covered / missing

Fix any mismatch:
- documented but untested → add test
- tested but undocumented → add doc line
- stale doc → update or mark superseded

### Final tests

Run:

```bash
node --check Dashboard/Tunet/Cards/v3/tunet_status_card.js
node --check Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js
# YAML parse for any changed YAML files (lab + suite + storage as applicable)
node -e "require('js-yaml').load(require('fs').readFileSync('Dashboard/Tunet/tunet-card-rehab-lab.yaml', 'utf8')); console.log('ok')"
npm test -- Dashboard/Tunet/Cards/v3/tests/status_bespoke.test.js
npm test  # full suite
npm run tunet:build
```

Confirm:
- built `Dashboard/Tunet/Cards/v3/dist/tunet_status_card.js` reflects source v3.4.0
- no test suite regression
- no unplanned tracked file changes (`git status --short` should show only intended files staged)

### Live verification

Live verification is required for closure:

1. **Pause and request explicit deploy authorization.** Surface to user with the proposed command (`npm run tunet:deploy:lab`) and the bundle that will deploy. Do NOT proceed without explicit authorization.
2. If authorized, run `npm run tunet:deploy:lab`.
3. **If deploy fails**, halt, surface the failure to the user, do not proceed to validation, do not declare closure.
4. If deploy succeeds, record the bundle token from deploy output (e.g., `?v=build_YYYYMMDD_HHMMSSZ`).
5. Validate the rehab lab at:
    - `390×844`
    - `768×1024`
    - `1024×1366`
    - `1440×900`
    - light and dark mode
6. Verify every variant renders:
    - `home_summary`
    - `home_detail`
    - `room_row`
    - `info_only`
    - `alarms`
    - `custom`
7. Verify every recipe shorthand appears in at least one lab path or a controlled test fixture (test fixture coverage is sufficient for recipes that don't have lab fixtures, since recipes are tile-types within variants).

### Screenshot evidence pattern

Existing files at the project root (`/home/mac/HA/implementation_10/`):
- `status-home-summary-live-1440.png` — covers `home_summary` at 1440
- `status-section-live-1440.png` — generic section evidence
- `status-states-live.png` — multi-state evidence

New captures required (file naming pattern: `status-<variant>-live-<width>.png`):
- `status-home-detail-live-1440.png`
- `status-room-row-live-1440.png` (and ideally 390 too)
- `status-info-only-live-1440.png`
- `status-alarms-live-1440.png`
- `status-custom-live-1440.png` (only if `custom` variant has a meaningful lab fixture)

If deploy authorization is not granted, do not declare CD11 closed. Record "**repo-side closure complete; live closure pending authorization**" in `plan.md` and `handoff.md`. The four gap commits land as committed contract work; the closure delta documents the pending live verification.

### Final docs

Update:
- `plan.md`: append CD11 closure delta with acceptance evidence and bundle token after deploy. Use the Documentation Sync Protocol step ordering if the worktree's 2026-05-04 governance has merged in by then; otherwise use the existing 3-step Documentation Policy.
- `FIX_LEDGER.md`: add closure entry summarizing gaps 1-4, with deployment evidence (bundle token if deployed).
- `handoff.md`: update current-state snapshot to CD11 closed **only after** live validation completes.
- Do **not** advance `Dashboard/Tunet/CLAUDE.md` Active Program tranche pointer unless separately directed by user.

### Commit (Commit 4)

Use HEREDOC for multi-paragraph commit messages:

```bash
git commit -m "$(cat <<'EOF'
docs(tunet): close cd11 status contract

Closes contract gap 4 of CD11 closure: tests and docs lock the contracts
established in gaps 1-3.

Validation evidence:
- node --check passed for tunet_status_card.js + status_bespoke.test.js
- YAML parse passed for tunet-card-rehab-lab.yaml
- npm test full suite green
- npm run tunet:build clean
- built dist/tunet_status_card.js reflects v3.4.0

Live deploy: {bundle token if deployed; otherwise "PENDING — awaiting
deploy authorization"}.

Screenshot evidence: {paths to captured screenshots; otherwise "PENDING
— awaiting deploy authorization"}.

Coverage matrix audit complete: every contract statement in
cards_reference.md §9 and sections_layout_matrix.md status subsection
has a regression target in status_bespoke.test.js. Doc/test/code
agreement verified.

Tranche pointer: CD11 closure declared but Active Program tranche
pointer in Dashboard/Tunet/CLAUDE.md NOT advanced. Surface to user for
adjudication on next-tranche advancement per CD11 protocol.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Commit Order (full sequence)

1. `feat(tunet): cd11 recipe defaults self-containment` (Gap 1)
2. `feat(tunet): cd11 variant-aware grid sizing for status card` (Gap 2)
3. `feat(tunet): cd11 variant and recipe authoring for status card (v3.4.0)` (Gap 3)
4. `docs(tunet): close cd11 status contract` (Gap 4)

Each commit:
- must pass focused status tests before commit
- must not use `--no-verify`
- must include the requested co-author trailer:

```
Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
```

Do not amend any commit. Do not push to `origin/main`.

For multi-paragraph commit messages with code blocks or formatting, use HEREDOC pattern: `git commit -m "$(cat <<'EOF' ... EOF)"`.

---

## Closure Conditions

CD11 closes when **all** of these hold. Verify explicitly before declaring closure to user.

1. **Recipe self-containment** — every recipe's `defaults` block produces a complete runtime tile config from shorthand + entity binding (or fixed-source for fixed-binding recipes), with no other inputs required. Tested per recipe via `normalize()` deep-equality. Documented as recipe-defaults table in `cards_reference.md` §9 with entity-binding rules.

2. **Variant-aware grid sizing** — `getGridOptions()` and `getCardSize()` return variant-specific values per the implementation contract table. Tested per variant. Documented in `sections_layout_matrix.md` per-variant subsection (replacing the prior "Scope-locked" status row, marked superseded) and in `cards_reference.md` §9 Grid Options.

3. **Editor/stub variant + recipe authoring** — `getConfigForm()` exposes `layout_variant` selection + `recipe_tiles` authoring; `getStubConfig()` emits coherent per-variant defaults via `getStubConfigForVariant()`. Synthesis precedence locked (tiles > recipe_tiles > recipes > variant stub). Co-presence behavior locked (recipe_tiles wins, warn). Tested per variant + per precedence path. Documented in `cards_reference.md` §9 Editor section reflecting the three-tier authoring/synthesizer/runtime model. Pre-CD11 "layout_variant YAML-only" wording superseded.

4. **Test/doc lock** — every contract statement above has both a regression target and a doc anchor. No drift between code, test, and doc. Coverage matrix audit complete.

5. **No scope creep** — no `tunet_base.js` editor refactor, no cross-card recipe generalization, no CD10/CD12 work, no editor expansion beyond what variant + recipe authoring requires.

6. **Suite-wide rules respected** — keyboard-a11y untouched (out of scope per the suite-wide standing rule), no layout hacks, no cross-card consistency work (CC1 territory if needed).

7. **Build + tests green** — `npm run tunet:build` clean, `npm test` all pass, no skipped or pending tests, `dist/tunet_status_card.js` reflects v3.4.0.

8. **Live verification (if authorized)** — each variant renders correctly at the four locked breakpoints with deployment evidence captured (screenshots per variant per the file-naming pattern). If not authorized, closure is declared as "repo-side complete; live pending."

9. **Plan / FIX_LEDGER / handoff synced** — closure session delta in `plan.md` enumerates each acceptance criterion with evidence; `FIX_LEDGER.md` has the four gap-closure entries with deployment markers; `handoff.md` reflects post-closure state.

10. **Tranche-pointer advancement queued, not executed** — CD11 closure is declared to the user with the next tranche identified per `~/.claude/plans/flickering-herding-wolf.md`. The active tranche pointer in `Dashboard/Tunet/CLAUDE.md` Active Program section is not advanced unilaterally; surface and ask.

---

## Safety Rules — Non-Negotiable

1. **Never write or execute `rm -rf <path>/` where `<path>` matches a top-level system directory name** (`home`, `etc`, `var`, `usr`, `bin`, `tmp`, `boot`, `dev`, `proc`, `sys`, `root`, `mnt`, `opt`, `lib`, `sbin`, `srv`). The phrase `rm -rf home/` differs from `rm -rf /home/` by one character. Use `git rm -r <path>/` or `git clean -fd <path>/` for repo-bounded cleanup.
2. **Never use `git --no-verify`** or skip pre-commit hooks. If a hook fails, surface and ask.
3. **Never amend or reset published commits.** Each cycle is a new commit.
4. **Never push to `origin/main`.** Push timing is a separate user decision.
5. **Never deviate from `~/.claude/plans/synthetic-dazzling-oasis.md`** without surfacing the deviation. The plan is immutable post-adoption.
6. **Never widen scope beyond the four gaps.** CD11 is narrow status-only. The editor expansion that gap 3 authorizes is *the* CD11 editor expansion — no more.
7. **Never touch CD10 or CD12.** Nav verify is deferred; surface assembly is parked.
8. **Never modify other branches or worktrees.** Operate on `main` only.
9. **Never deploy to live HA without explicit user authorization.** `npm run tunet:deploy:lab` modifies a live production resource.
10. **Never advance the active tranche pointer unilaterally.** Surface CD11 closure to user; let them adjudicate the advance.
11. **Stop and ask** if a gap closure cycle requires more than ~50 lines of card-local code or any change outside the Allowed implementation files list.
12. **Stop and ask** if the audit pass for any gap reveals more than ~3 missing properties per recipe (gap 1) or surfaces a variant whose intrinsic shape isn't documented in the plan (gap 2) or requires a new editor primitive in `tunet_base.js` (gap 3).

---

## Assumptions (locked)

- The approved plan addendum is limited to variant + recipe editor authoring.
- Raw tile editing remains YAML-only.
- `home_summary` remains a 4-column phone summary matrix.
- `tunet_base.js` is not changed.
- CD11 cannot be declared fully closed until deploy authorization is granted and live validation passes (or "repo-side closure complete; live closure pending" is recorded as the explicit closure state).
- Pre-existing uncommitted CD11 work-in-progress is preserved via a snapshot commit before the four gap closure cycles begin.
- `room_row` `max_rows` value is surfaced to user for adjudication (default 2 if no direction).
- `recipe_tiles` + `recipes` co-presence: `recipe_tiles` wins, warn (no error).
- `_applyVariantRecipeDefaults` sequencing: recipe.defaults → variant transform → user overrides → runtime.

## Reasoning Lens Summary

A tranche closes when its architectural claim is verifiable in three places at once: the deployed code, the contract document, and the test suite. CD11's claim is that the status card's six layout variants and twelve recipes encode the canonical home-status semantics — what is foreground, what is background, what is one-touch, what is more-info, what page-types each tile belongs to. Closeout is the act of confirming that claim holds across all three surfaces. Each of the four gaps is a place where the claim was made in the runtime but not yet honored in the contracts. Each surgical fix is a small architectural realignment; each test is a regression target locking the alignment; each doc sync is the contract catching up to reality. When the four gaps close and the three surfaces agree, the system speaks with one voice on what status semantics mean — and CD11 closes.
