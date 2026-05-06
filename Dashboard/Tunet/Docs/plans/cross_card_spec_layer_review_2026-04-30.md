# Adversarial Architecture Review — cross_card_spec_layer_extraction_plan.md

**Reviewer**: subagent (general-purpose) launched 2026-04-30
**Verdict**: NOT ready to activate after CD9. Two foundational facts about `tunet_base.js` are absent from the plan.
**Scope**: read-only architecture review. No files modified. No findings appended.

---

## Verdict (verbatim from review)

The plan is **not ready to activate after CD9**. Two foundational facts that any cross-card token plan must address are absent from the document: (a) `tunet_base.js` already contains a `--r-*` radius token family in **px** at L70–L74, and (b) it already contains a `--type-*` typography family in **px** with desktop+mobile variants at L173–L209. The plan proposes to add a parallel `--radius-*` and `--type-*` system in **em** without acknowledging or reconciling either. Activating CC1/CC2 in their current shape would introduce two competing token systems for the same concerns and significantly *increase* drift, not reduce it. CC4's framing as "completion" is also wrong — actual `.interactive` adoption is 1 of 13 cards, so CC4 is net-new, not finishing work.

---

## Architectural Concerns (10, in priority order)

### 1. CC1 introduces a parallel radius system on top of an existing one
- Evidence: `tunet_base.js:70-74` already defines `--r-card: 24px`, `--r-section: 32px`, `--r-tile: 16px`, `--r-pill: 999px`, `--r-track: 14px`
- `speaker_grid:170` consumes `var(--_tunet-tile-radius, var(--r-tile))`; speaker_grid uses `var(--r-track)` and `var(--r-pill)` actively
- Plan §3.2 inventory row "Shape (corner radii) | NONE" is **factually wrong**
- Action: Decide before authorizing CC1: rename `--r-*` → `--radius-*` AND migrate units, OR deprecate `--r-*` and migrate consumers, OR keep `--r-*` and drop the proposed tokens. Pick one.

### 2. CC2b duplicates the existing `--type-*` family with em values for the same role names
- Evidence: `tunet_base.js:173-178` defines `--type-label: 12.5px`, `--type-value: 18px`, `--type-chip: 12.5px`, `--type-row-title: 16.5px`, `--type-row-status: 14.5px`
- Mobile twins at L204–209 with `@media (max-width:600px)` swap rules at L1431–1471
- Plan calls 0.78em the "existing" `--type-chip` value — it is not; existing is `12.5px`/`13px`
- Action: CC2b must list every existing `--type-*` token and its consumers, then propose unit migration or rename — not parallel additions. Mobile-swap preservation must be explicit.

### 3. CC4 misframed as "completion"
- Evidence: `grep -rn "INTERACTIVE_SURFACE\|TILE_SURFACE\|CTRL_SURFACE\|\.interactive\b" Cards/v3/*.js` returns hits only in `tunet_light_tile.js`
- Plan §3.3 claim "adopted by some cards, others still re-implement card-locally" understates by an order of magnitude
- CC4 is a 12-card refactor, not polish
- Action: Re-scope CC4. Plan it BEFORE CC1 if you want a primitive in place for CC1's shape tokens to land into.

### 4. CC2a is a hard prerequisite for CC1, not a sub-pass
- Evidence: `tunet_sonos_card.js:39` has `:host {` but no top-level `font-size: 16px`; `tunet_lighting_card.js:538` only sets it inside the dialog scope
- CC1's tokens are em-valued (1.25em, 0.875em, 0.5em); without anchor, lighting/sonos compute different sizes
- Cards that most need rounding consistency get most-divergent computed values
- Action: Promote CC2a (rename to "CC0a — Em-anchor enforcement") to a prerequisite ahead of CC1.

### 5. The "two token surfaces" framing in §2 ducks consolidation
- TOKEN_MAP is still consumed at runtime by 6 of 13 cards via `_setProfileVars` (L1027)
- During migration: 3 sources for the same value (`--r-tile` px, `--_tunet-tile-radius` profile, new `--radius-tile` em)
- Cascade order determines winner — fragile
- Action: §2 needs explicit deprecation timeline for `--_tunet-*` and per-card matrix showing which token surface owns which value during migration.

### 6. Migration order migrates easy cards first, leaving highest-risk for last
- Evidence: §4 Tier 1 lists `tunet_lighting_card.js` (1980 lines, scroll-snap, drag pill, badge composition, overflow exemption) early; speaker_grid (high pre-CD2 drift) Tier 2 last
- "Tranche-closed first" is a *recency* signal, not a *risk* signal
- Findings §1 flags status, rooms, lighting as highest-risk for shape; plan processes lighting/rooms first then leaves speaker_grid for last when fatigue is highest
- Action: Re-derive Tier order from corpus risk matrix in findings, not from tranche-close date.

### 7. Dual-validation gate at scale is a momentum-killer
- 11 cards × 4 passes = 44 dual-gate cycles
- §5 already concedes 390×844 captures are unreliable until nav rehab lands (obs #10112)
- Action: Differentiate by change class. Gate B for the first card in each pass and any card flagged as risk in §3.4; Gate A only thereafter. Or batch by pass.

### 8. Lighting `overflow-y: visible` "exemption" should be challenged, not codified
- Drag pill is absolutely positioned — re-parenting to a portal/popover or to host shadow root eliminates the exemption entirely
- Plan codifies workaround as architecture
- Action: CC3 should add open question: "Can the lighting drag pill be re-parented out of the grid?" Don't freeze the exemption into vocabulary v2.0 until answered.

### 9. CC3 surface composition is at least 6 rules, not 5
- Findings §F (FL-011 nav global DOM mutation), §G (FL-012 history.pushState in 3 cards), §H (rooms stopPropagation FRAGILE), §I (`visibility: hidden` vs `display: none` grid contract), §J (`--spring` undefined fallback), §K (scenes wrap default)
- Plan only lists 5 in §6 CC3
- Action: Either expand CC3 to absorb these or carve out a CC3.5 "Cross-cutting JS contracts" pass. Do not silently leave them out.

### 10. Status and nav exclusions create 2-of-13 off-contract permanence
- Both excluded for multiple tranches already (CD2/3/4 status was excluded per obs #9826)
- If CC1–CC4 close with status and nav still out, the "single source of truth" property is false: 2 of 13 cards run on different shape/type/composition rules
- Action: Define explicitly what happens to contract tests when CC1–CC4 close with status/nav still out — is the test skip permanent, conditional, or does it block CC4 closure?

---

## Hidden Assumptions

- **`:host { font-size: 16px }` is a no-op when other anchors agree**: rooms_card has em-px mixed fallbacks; corpus warns split reference frame produces drift. Plan dismisses what its own corpus flags as central CC2 risk.
- **The profile system can stay "dormant"**: §7 says "stays superseded" but profile tokens are actively consumed at runtime in 6 cards. Dormant ≠ removable. Plan doesn't say which.
- **Contract tests can be added incrementally without test-suite churn**: 4 passes × 11 cards = 44 test-suite mutations. No policy on commit boundaries.
- **CC vs CD numbering coexists cleanly**: CD10 (nav rehab) and CD11 (status) are CC1 prerequisites, and CC1 starts after CD9. If CD10 slips, what happens to CC1 Tier 1 work?
- **56 corpus observations = adequate grounding**: plan §11 cites "56 observations spanning 2026-02-19 to 2026-04-05" but corpus header says 500 obs. Plan disagrees with itself.

---

## Fit Within The System (places the plan ignores reality)

- **Existing `--r-*` and `--type-*` token families** absent from inventory
- **Mobile typography swap** at `tunet_base.js:1431-1471` reassigns `--type-*` inside `@media (max-width:600px)` — any em replacement must preserve responsive behavior
- **`speaker_grid:131,256,460`** has raw `12px / 11px / 6px` border-radius literals
- **`actions_card:287`** has `:host { font-size: 16px }` inside `@media (max-width: 768px)` only — CC2a's audit recipe (`grep -L ":host\s*{\s*font-size:\s*16px"`) produces false negatives because the anchor is *scoped*, not absent

---

## Recommended Plan Edits (specific, actionable)

| Plan target | Edit |
|---|---|
| §2 §1 (~L37) | Add: "Existing `--r-*` (px) at L70–74 and `--type-*` (px, with mobile swap) at L173–209 are partial registries; CC1/CC2 must reconcile or rename, not parallel-add." |
| §3.2 (L75-78) | Replace "Shape \| NONE \| Gap" and "Type scale \| NONE \| Gap" rows with the existing rows; call out reconciliation target |
| §4 (L121-145) | Add column "CC1 risk per findings §1"; re-sort within Tier 1 by risk; move lighting/rooms/light_tile to last-in-tier |
| §5 (L147-174) | Add Gate-A-only fast-path for Low-risk cards; reserve Gate B for High/Med-High and first card per pass |
| §6 CC1 token table (L196-203) | Replace with reconciliation table: existing token \| proposed \| unit migration \| consumer count |
| §6 CC2a (L252-258) | Promote to prerequisite in §8 ahead of CC1; fix audit recipe to detect *scoped* anchors |
| §6 CC2b (L260-283) | Either rename proposed tokens OR propose explicit unit migration with mobile-swap preservation |
| §6 CC4 (L329-343) | Re-scope as 12-card migration; add per-card adoption status from grep |
| §6 CC3 rule 4 (L318) | Add open question on re-parenting lighting drag pill |
| §7 (L350) | Replace "Profile system stays superseded" with explicit deprecation lifecycle |
| §8 (L358) | Add prerequisite "5. CC2a (em-anchor) lands as a prerequisite tranche before CC1 audit begins" |
| §11 (L387) | Update cited observation count and date range; pick one number |

---

## Source-of-truth conflicts

| Conflict | Resolution |
|---|---|
| Plan §3.2 vs `tunet_base.js:70-74,173-209` — plan says NONE, file has both registries | File authoritative; update plan inventory |
| Plan §3.3 CC4 framing vs `grep` truth (1/13 adoption) | Code authoritative; re-scope CC4 |
| Plan §6 CC2a "lighting/sonos lack anchor entirely" vs `lighting:538` having scoped anchor | Differentiate "absent" from "scoped, not top-level"; fix audit grep |
| Plan §11 (56 obs through Apr 5) vs headline (500 obs / 234k tokens) | Update §11 |
| Findings §3.4 lighting overflow exemption vs Cards/v3/CLAUDE.md guardrail | CC3 vocabulary entry must reconcile both as one composition rule with two valid treatments |
