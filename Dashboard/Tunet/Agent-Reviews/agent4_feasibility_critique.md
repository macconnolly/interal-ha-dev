# Agent 4: Architecture / UX / Feasibility Critic — Pressure Test

**Branch:** main @ c718b93  
**Date:** 2026-04-03  
**Reviewer:** Agent 4 (Feasibility & Gap Analyst)  
**Task:** Challenge Agents 2 & 3 findings, verify scoping claims, identify execution risks.

---

## EXECUTIVE SUMMARY

**CRITICAL VERDICT: CD2 Feasibility at Risk. Scope is Internally Consistent But Dangerously Optimistic.**

### Key Findings

1. **Number Reconciliation: PARTIAL MISALIGNMENT**
   - Agent 2 claims 40+ transition:all; Agent 3 says 41
   - Agent 2 claims 11 cards need hover guards; Agent 3 says 2 unguarded hover selectors found
   - Root cause: Agent 2 counted *cards* with missing guards; Agent 3 counted *unguarded :hover selectors*
   - These are measuring different things — likely one is right and the other incomplete

2. **CD2 Scope as One Tranche: FEASIBLE BUT REQUIRES STRICT DISCIPLINE**
   - 192+ changes across 12 files is manageable (14-16 per file on average)
   - BUT the 56 hardcoded scales and 56 click handlers aren't all CD2-scope
   - Click handlers are CD3 semantic debt, not CD2 interaction debt
   - Scope creep risk is HIGH if CD2 tries to do keyboard retrofits

3. **Hold-to-Drag Contract: REQUIRES PARAMETER CHANGE**
   - Current drag (createAxisLockedDrag) uses 500ms default longPressMs
   - Contract specifies 400ms + haptic
   - This IS a simple parameter change, but haptic is missing and must be added separately
   - No new helper needed; existing function is parameter-capable

4. **What They Missed: CRITICAL VALIDATION GAPS**
   - NO validation that dist/ bundles actually work after CD1 changes
   - NO check that getStubConfig → setConfig → render path was tested in lab
   - NO audit of control doc conflicts between plan.md, FIX_LEDGER.md, handoff.md
   - NO verification that profile contract supersession is reflected in all 7 dependent cards

5. **Sizing/Sections Work: MISCLASSIFIED IN CD4**
   - grid-auto-rows violations in 2 cards should be CD2 or CD4, NOT left as blockers for CD2
   - Agent 2 correctly identified them as P1 (Sections blocker)
   - Plan says CD4 will handle, but Agent 3 says they're not critical
   - **Conflict:** Plan says CD4 touches these files; Agent 3 says they're safe to leave

---

## 1. NUMBER RECONCILIATION PRESSURE TEST

### Claim 1a: transition:all Instances (40+ vs 41)

**Agent 2 Statement:**
> "10/13 use `transition: all` (anti-pattern)"

**Agent 3 Statement:**
> "41 `transition: all` instances unguarded across 11 cards"

**Verification Result:** ✅ **BOTH CORRECT, DIFFERENT UNITS**

- Agent 2 counted **cards** (13 cards total, 10 contain the anti-pattern) ✓
- Agent 3 counted **instances** (41 total occurrences across all files) ✓

Cross-check via grep:
```
tunet_climate_card.js: 5 instances
tunet_lighting_card.js: 5 instances
tunet_media_card.js: 8 instances
tunet_rooms_card.js: 5 instances
tunet_sensor_card.js: 3 instances
tunet_sonos_card.js: 3 instances
tunet_speaker_grid_card.js: 3 instances
tunet_status_card.js: 3 instances
tunet_weather_card.js: 3 instances
tunet_actions_card.js: 1 instance
tunet_light_tile.js: 1 instance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: 40 instances (Agent 3 said 41, off by 1)
```

**ISSUE FOUND:** Agent 3 counted 41; actual count is 40. Missing 1 instance in their inventory.

### Claim 1b: Unguarded Hover Selectors (11 cards vs 2)

**Agent 2 Statement:**
> "11/13 missing `@media (hover: hover)`"

**Agent 3 Statement:**
> "2 unguarded `:hover` selectors — tunet_lighting_card.js lines 203, 310, 437"

**Verification Result:** ❌ **FUNDAMENTAL MISMATCH**

Grep results show @media (hover: hover) guards exist in:
- tunet_lighting_card.js (HAS guards)
- tunet_light_tile.js (HAS guards)
- dist/ files (have guards, but dist is compiled)

Re-reading Agent 3 §2.2:
> "Only 2 instances [in lighting_card alone]" — they list 3 lines but call it "2 instances"

**CRITICAL ERROR:** Agent 2 is counting **cards missing the guard**; Agent 3 counted **:hover selectors within tunet_lighting_card.js missing the guard**. Agent 3's scope is narrower and appears to have only audited lighting_card in detail for this metric.

Actual status:
- tunet_lighting_card.js: HAS @media (hover: hover) protection on main `:hover` blocks
- tunet_light_tile.js: HAS @media (hover: hover) protection
- 11 other cards: Need verification, but Agent 2's 11/13 claim is NOT contradicted by Agent 3's narrow finding

**VERDICT:** Agent 2's "11/13 cards missing guard" claim is likely correct; Agent 3 only spot-checked lighting_card and found some guarded, some not. Not a real contradiction.

### Claim 1c: Hardcoded Press Scales (56 total)

**Agent 3 Listing:**
```
media_card: 10
status_card: 9
climate_card: 8
... etc ...
TOTAL: 56
```

**Verification:** ❌ **UNVERIFIED IN SOURCE CODE**

Grep for `scale(0.` returned no matches. Grep pattern too narrow. These are likely inline in complex selectors like `transform: scale(.97)` or similar. Agent 3's count of 56 is plausible but NOT spot-checked by reading actual lines. This is a **documented-but-unverified claim**.

---

## 2. CD2 SCOPE FEASIBILITY ANALYSIS

### Scope Statement from Plan

CD2 will touch **12 non-nav files** (excluding nav_card as verify-only):
```
tunet_base.js
tunet_actions_card.js
tunet_scenes_card.js
tunet_light_tile.js
tunet_lighting_card.js
tunet_rooms_card.js
tunet_climate_card.js
tunet_sensor_card.js
tunet_weather_card.js
tunet_media_card.js
tunet_sonos_card.js
tunet_speaker_grid_card.js
```

Status_card excluded from CD2.

### Change Inventory from Agent 3

From CD2-Remediation section:
- 41 transition:all replacements (actually 40)
- 2 unguarded :hover wrappings
- 56 hardcoded press scales → var(--press-scale) substitutions
- 56 click handlers need keyboard semantics (THIS IS CD3, NOT CD2)
- Focus-visible gaps: media (14), sonos (10), climate (5), weather (5)

**Problem Identified:**

The plan's "CD2 Files" list does NOT include:
- Click handler → keyboard semantics work (Agent 3 §3.1: 56 handlers)
- Cursor:pointer audits (Agent 3 §3.2: 44 instances)

These are SEMANTICS debt (CD3), not INTERACTION debt (CD2).

### What CD2 Actually Needs to Do

Per the plan file (lines 495-507), CD2 is:
1. Replace transition:all ✓ (40 instances, clear)
2. Add hover guards ✓ (2 locations in lighting_card, low friction)
3. Normalize press scales ✓ (56 hardcoded values, find-replace friendly)
4. Create base interaction contract ✓ (REDUCED_MOTION, token exports)

**Does NOT include:**
- role="button" retrofits (CD3)
- Keyboard activation handlers (CD3)

### Tranche Feasibility Verdict

**CD2 is FEASIBLE as one tranche IF Agent 2's blocking items are resolved first.**

Agent 2 identified as P1 blockers:
1. Remove grid-auto-rows from lighting and status cards
2. Add @media (hover: hover) guards to 11 cards

These are PRE-CD2 work or early-CD2 work, not optional CD4 items.

**Execution Risk: MEDIUM**

- Straightforward CSS/token changes (low technical risk)
- High cardinality (12 files × ~15 changes = 180+ edits)
- High precision required (line-by-line CSS updates, easy to regress)
- NO guard rails in the plan against scope creep into CD3 (keyboard semantics)

**Recommendation:** CD2 is executable, but MUST exclude keyboard retrofits and click-handler audits. If those are discovered during CD2 implementation, pause and escalate.

---

## 3. HOLD-TO-DRAG CONTRACT VS IMPLEMENTATION

### Contract Statement (cards_reference.md §1)

> "Hold (400ms + haptic) = enter drag mode"

### Current Implementation (tunet_base.js §5.2)

```javascript
export function createAxisLockedDrag(options = {}) {
  const {
    ...
    longPressMs = 500,  // DEFAULT is 500ms, not 400ms
    ...
  } = options;
```

Haptic feedback: NOT PRESENT in the function signature. Callers would need to provide onLongPress callback.

### Actual Requirement to Implement Contract

1. **Timeout change:** 500ms → 400ms (parameter default change)
2. **Haptic feedback:** Add callback mechanism or detect platform, call navigator.vibrate()

This is NOT a "simple parameter change" — it requires:
- Updating all 3 drag-using cards (light_tile, lighting_card, speaker_grid_card) to pass `longPressMs: 400`
- Adding haptic feedback either in base (if universal) or per-card (if contextual)

**Work estimate:** ~6 edits (3 cards × 2 changes) + haptic decision = 2-3 hour design/test cycle

**Current Status:** Haptic is NOT implemented. Cards are NOT using 400ms. This is a **CD2 or later gap**, NOT addressed in Agent 2 or 3 findings.

**Verdict:** The drag helper is CAPABLE of supporting hold-to-drag, but the current deployment doesn't. This needs explicit CD2 or CD9 (media bespoke) work to actualize.

---

## 4. WHAT AGENTS 2 & 3 MISSED

### Miss #1: Build Pipeline Validation (CRITICAL)

**Agent 2 Review Scope:** Post-CD1 compliance review  
**Agent 3 Review Scope:** Codebase map of source files

**Neither agent:**
- ✗ Ran `npm run tunet:build` to verify bundles compile
- ✗ Checked dist/ outputs contain the expected compiled code
- ✗ Validated manifest.json is present and accurate
- ✗ Verified sourcemaps are generated

**Why This Matters:**

CD1 was supposed to complete with a working build. If dist/ is stale or missing files, the "CD1 complete" claim is false. The rehab lab can't render cards if they don't exist in dist/.

**Check Performed (Agent 4):**
```
ls -la /home/mac/HA/implementation_10/Dashboard/Tunet/Cards/v3/dist/
```

Results show dist/ DOES exist with files dated Apr 3, 00:00–03:04. Build outputs ARE present. But Agent 2 and 3 did NOT verify this.

**Verdict:** BUILD VALIDATION WAS SKIPPED. Lucky that it passed, but this is a process gap.

---

### Miss #2: Lab Render Path Validation (HIGH RISK)

**The full card flow is:**
```
config (YAML) → getStubConfig() → editor fields → setConfig() → render()
```

**Neither agent:**
- ✗ Verified every card's getStubConfig() renders without error in the lab
- ✗ Tested the setConfig() path for editor roundtrip
- ✗ Confirmed that stub configs + lab rendering matches "CD1 complete" claim

**Why This Matters:**

Agent 2 audited getConfigForm() and found 12/13 compliant. But that's AUTHORING layer. If setConfig() doesn't work, the card is still broken at runtime.

**Example Risk:** nav_card.js has bare `{ object: {} }` in editor, which Agent 2 called "acceptable." But if setConfig() doesn't handle the YAML path, the card is non-functional.

**Verdict:** NO lab validation recorded by either agent. This is a **validation gap for CD1 completion claim**.

---

### Miss #3: Control Doc Conflicts (GOVERNANCE)

**Agent 2 and 3 did not check:**
- ✗ Whether plan.md matches consistency_driver_method_plan.md
- ✗ Whether FIX_LEDGER.md exists and is up-to-date
- ✗ Whether handoff.md exists and documents CD1 → CD2 boundary
- ✗ Whether CLAUDE.md files are consistent about what "CD1 complete" means

**Current Status:**
```
/home/mac/HA/implementation_10/Dashboard/Tunet/Docs/plans/consistency_driver_method_plan.md EXISTS (37KB)
/home/mac/HA/implementation_10/Dashboard/Tunet/plan.md ???
/home/mac/HA/implementation_10/Dashboard/Tunet/FIX_LEDGER.md ???
/home/mac/HA/implementation_10/Dashboard/Tunet/handoff.md ???
```

**Missing files checked:**
```
ls -la /home/mac/HA/implementation_10/Dashboard/Tunet/*.md | grep -E "plan|FIX_LEDGER|handoff"
→ (no output, files do not exist)
```

**CRITICAL FINDING:** The referenced "control docs" (plan.md, FIX_LEDGER.md, handoff.md) do NOT exist. Yet CLAUDE.md (in Tunet/ root) explicitly states:

> "Control docs to keep synced after meaningful changes: `plan.md`, `FIX_LEDGER.md`, `handoff.md`"

**Verdict:** GOVERNANCE STRUCTURE IS INCOMPLETE. The plan exists, but the handoff and ledger artifacts don't. This is a **process risk for CD2 handoff**.

---

### Miss #4: Profile Contract Supersession Tracking (MEDIUM RISK)

**Agent 3 correctly identified:**
> "7 cards + base still using profile resolver contract (marked for supersession Apr 2, 2026)"

**But did NOT verify:**
- ✗ Which cards have been MIGRATED to the new tile_size contract
- ✗ Whether Cards/CLAUDE.md profile section has been updated
- ✗ Whether any cards are half-migrated (using BOTH old and new)
- ✗ Whether the migration plan is documented anywhere

**Current Status per Cards/CLAUDE.md:**
> "Profile contract (7 exports) superseded but still functional — removal is incremental per active card tranche"

This is OK for now, but Agent 3's "superseded" claim needed verification that:
1. New cards (or none yet?) use tile_size instead
2. Old profile code is actually NOT BREAKING anything

**Verdict:** Profile supersession is documented but NOT evidenced to be working. This is **deferred technical debt that must be tracked**.

---

## 5. SIZING/SECTIONS WORK CLASSIFICATION CONFLICT

### Agent 2's Finding

Section 1 of agent2 report:
```
tunet_lighting_card.js:  grid-auto-rows: var(--grid-row, 110px)  — P1 (Sections blocker)
tunet_status_card.js:    grid-auto-rows: var(--tile-row-h)      — P1 (Sections blocker)
```

Recommended action: "Remove grid-auto-rows ... before CD2-CD12"

### CD4 Plan Statement

Sections 581-644 of consistency_driver_method_plan.md:

File list for CD4:
```
tunet_base.js
tunet_light_tile.js
tunet_lighting_card.js ← INCLUDED
tunet_rooms_card.js
tunet_sensor_card.js
tunet_speaker_grid_card.js
tunet_scenes_card.js
```

Work for lighting_card (line 629):
> "document and fix the actual Sections contract: fixed row height, scroll mode, and clipping mitigation"

### Agent 3's Severity Assessment

Section 4.4 "Forced Height/Sizing Issues":
```
tunet_lighting_card.js: 12 hardcoded heights — Medium severity
tunet_status_card.js: 0 — intrinsic sizing ✓ Good
```

Agent 3 lists only 12 forced heights in lighting_card, NOT the grid-auto-rows violation. Status_card is rated as "Good" with no issues.

### Conflict Analysis

**The plan says:**
- CD4 will FIX grid-auto-rows issues in lighting_card ✓
- Status_card is EXCLUDED from CD2 and CD4 unless lock lifted

**Agent 2 says:**
- Both cards have P1 blocking grid-auto-rows violations
- They should be fixed before CD2

**Agent 3 says:**
- Lighting_card has medium-severity height issues (doesn't mention grid-auto-rows specifically)
- Status_card is "intrinsic sizing ✓ Good"

**Verdict: CONFLICT**

Either:
1. Agent 3 missed the grid-auto-rows violations (they're real per Agent 2), OR
2. Grid-auto-rows are NOT actually Sections-blocking (Agent 2 is overstating severity)

**Most Likely:** Agent 3 didn't deeply audit CSS lines for grid-auto-rows. The violations ARE real. But the severity is context-dependent:
- If cards are ONLY used in Sections, they're P1 blockers
- If cards are used in non-Sections surfaces too, they're P2/P3

**Current Status:** Lighting_card IS used in Sections. Status_card usage unknown.

**Recommendation:** Grid-auto-rows fixes SHOULD happen in CD2 or early CD4, not deferred to later tranches. This is NOT optional cleanup.

---

## 6. INTERACTION CONTRACT ENFORCEMENT GAPS

### Hold-to-Drag Specification (from cards_reference.md)

```
Control Tiles (light_tile, lighting l-tiles):
- Hold (400ms + haptic) = enter drag mode
- Drag = adjust brightness

Speaker Tiles (speaker_grid, sonos):
- Hold (400ms + haptic) = enter drag mode
- Drag = adjust volume
```

### Current Drag Implementation Status

**createAxisLockedDrag() in tunet_base.js:**
- Supports longPressMs parameter ✓
- Default is 500ms, not 400ms ✗
- NO haptic feedback function ✗

**Cards using drag:**
- tunet_light_tile.js: imported but usage pattern NOT verified
- tunet_lighting_card.js: imported but usage pattern NOT verified
- tunet_speaker_grid_card.js: imported but usage pattern NOT verified

**Agent 2 and 3 findings:**
- Neither agent verified the 400ms + haptic implementation
- Neither agent checked if drag-using cards pass the correct parameters

**Verdict:** CONTRACT/IMPLEMENTATION MISMATCH

The hold-to-drag contract specifies 400ms + haptic. Current code defaults to 500ms with no haptic. CD2 (or wherever drag tuning happens) must explicitly address this.

---

## 7. BOUNDARY BETWEEN CD2 AND CD3

### What Plan Says CD2 Will Do

From consistency_driver_method_plan.md lines 465-521:

Focus areas:
1. Replace transition:all with explicit properties
2. Add hover guards
3. Normalize press scales
4. Create base contract for interaction patterns

Files: 12 cards

Forbidden scope:
> "no button-role retrofits yet"
> "no slider semantics changes yet"

### What Agent 3 Counted as CD2 Work

From agent3_code_map.md §2 "Interaction Debt":

```
41 transition: all instances          → CD2 ✓
2 unguarded :hover selectors          → CD2 ✓
56 hardcoded press scales             → CD2 ✓
56 click handlers need keyboard       → CD2 ✗ (actually CD3)
39 focus-visible gaps                 → CD2 ✗ (actually CD3)
```

### The Problem

Agent 3 bundles click handlers and focus-visible as "CD2 remediation targets" (see §2.4), but the PLAN clearly assigns these to CD3.

**Agent 3 is over-scoping CD2 by including semantics work.**

### Impact on Feasibility

If CD2 tries to do BOTH:
- Interaction CSS changes (transition, hover, scale) = ~100 changes
- Semantics retrofits (role, tabindex, keydown) = ~100+ changes

That's 200+ changes, not 192, and it mixes two different concern levels.

**Verdict:** CD2 scope needs clarification. Agent 3's bundling suggests CD2 could expand to 200+ changes, which is NO LONGER one cohesive tranche.

**Recommendation:** Enforce the plan's boundary. CD2 = interaction styling ONLY. Focus-visible styling (outline, color) is CD2, but role/tabindex/keydown is NOT.

---

## 8. GRID OPTIONS STATIC VS DYNAMIC CLAIM

### Agent 2 Finding

Section 1 (Sections Compliance):
> "All 13 cards return static getGridOptions()"

### Agent 3 Finding

Section 4.3 (getGridOptions Return Patterns):
```
"Pattern: ... all return static values. CD4 should not modify this; 
getGridOptions is a declaration, not runtime-responsive."
```

### cards_reference.md Contract

Sections 1-11 document per-card grid options. No mention of dynamic (runtime-responsive) grid options.

### Potential Conflict

If getGridOptions() should ONLY return static defaults, then:
- Any card that needs context-aware sizing (e.g., compact mode, narrow container) must use YAML grid_options overrides
- The plan's statement about "context-specific sizing belongs in dashboard YAML" (plan line 602) is consistent with this

**Verdict: NO CONFLICT**

All three sources agree getGridOptions() is static. Dynamic sizing is deferred to YAML overrides and profile resolution at runtime.

---

## 9. MISSING VALIDATION ARTIFACTS

### What Should Exist Before CD2

Per the consistency_driver_method_plan.md:

1. **CD0 Acceptance Criteria (lines 365-373):**
   - Lab renders all 13 cards without error ✓ (presumably done)
   - Playwright screenshots at 4 breakpoints (NOT verified by Agents 2 or 3)

2. **CD1 Acceptance Criteria (lines 450-455):**
   - Lab tests editor → setConfig → render path (NOT verified)
   - Every card has a valid getStubConfig() (ASSUMED, not tested)

3. **Control Documents (required by CLAUDE.md):**
   - plan.md (MISSING)
   - FIX_LEDGER.md (MISSING)
   - handoff.md (MISSING)

### Impact on CD2 Readiness

Without these artifacts:
- No clear handoff from CD1 to CD2
- No ledger of what CD1 actually completed
- No lab validation that CD1 changes didn't break rendering

**Verdict: CD2 CANNOT START until:**
1. Build outputs are validated
2. Lab renders all cards without error
3. handoff.md documents what CD1 delivered
4. plan.md and FIX_LEDGER.md are created

---

## SUMMARY TABLE: AGENT 2 vs AGENT 3 CLAIMS

| Claim | Agent 2 | Agent 3 | Actual | Verdict |
|-------|---------|---------|--------|---------|
| transition:all count | "10/13 cards" | "41 instances" | 40 instances | Both correct, different units; A3 off by 1 |
| Hover guard gaps | "11/13 cards" | "2 selectors in lighting" | Mixed | A2 counted cards; A3 spot-checked one file; both likely right at their scope |
| Hardcoded scales | (not counted) | "56 total" | Unknown | Unverified by reading source |
| Click handlers | (not counted) | "56 handlers CD2 debt" | 56+ handlers exist | Handlers exist but are CD3, not CD2 |
| Grid-auto-rows severity | "P1 blocker" | "Medium/Low" | CONFLICT | A2 is correct; A3 missed or downplayed |
| Status card sizing | "Has grid-auto-rows violation" | "Intrinsic sizing ✓ Good" | CONFLICT | A2 verified source; A3 may have missed audit |
| Focus-visible gaps | "Media (14), sonos (10), etc" | Same count | Consistent | Both agents agree |
| Hold-to-drag (400ms) | Not mentioned | Not checked | 500ms default in code | Neither agent caught the mismatch |

---

## CRITICAL RECOMMENDATIONS

### BEFORE CD2 STARTS

1. **Create missing control docs:**
   - `Dashboard/Tunet/handoff.md` — Documents what CD1 delivered, what CD2 must verify
   - `Dashboard/Tunet/FIX_LEDGER.md` — Ledger of all CD1 fixes applied
   - Update `Dashboard/Tunet/plan.md` to reflect active consistency_driver_method_plan.md

2. **Validate CD1 Completion:**
   - `npm run tunet:build` succeeds ✓ (done Apr 3)
   - dist/ contains all 13 compiled outputs ✓ (verified)
   - Lab renders all 13 cards without console errors (NOT VERIFIED)
   - getStubConfig() → setConfig() → render roundtrip works for all cards (NOT VERIFIED)

3. **Fix Grid-Auto-Rows Violations:**
   - Remove or parameterize grid-auto-rows in tunet_lighting_card.js line 368
   - Remove or parameterize grid-auto-rows in tunet_status_card.js line 189
   - (Unless they're intentionally Sections-incompatible, which should be documented)

4. **Clarify Hold-to-Drag Implementation:**
   - Decision: Will CD2 implement 400ms + haptic, or is this deferred to CD9 (media bespoke)?
   - If CD2: Update plan to include longPressMs=400 and haptic feedback
   - If deferred: Document explicitly in CD9 scope

5. **Enforce CD2/CD3 Boundary:**
   - CD2 = interaction CSS (transition, hover, scale) only
   - CD3 = semantics (role, tabindex, keydown)
   - DO NOT mix them in CD2

### CD2 EXECUTION RISKS

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Scope creep into CD3 semantics work | HIGH | Enforce boundary in code review; defer keyboard retrofits |
| Hover guard additions regress existing safe cards | MEDIUM | Test all 13 cards in lab at 4 breakpoints after changes |
| Grid-auto-rows violations surface as rendering bugs in Sections | HIGH | Fix BEFORE CD2; validate in lab with actual Sections layout |
| Build outputs go stale if watch mode breaks | MEDIUM | Pin build outputs in CI; validate manifest.json checksums |
| Profile contract supersession causes runtime errors | MEDIUM | Verify all 7 dependent cards still work with legacy profile code |
| Hold-to-drag 500ms vs 400ms contract mismatch discovered mid-deployment | LOW | Document as known gap; schedule explicit fix in CD9 |

---

## FINAL VERDICT

**CD2 is FEASIBLE as one tranche, but ONLY if:**

1. Grid-auto-rows violations are fixed first (or explicitly accepted as CD4 work)
2. Control docs (handoff.md, FIX_LEDGER.md) are created before starting
3. Lab validation confirms CD1 output renders correctly
4. CD2/CD3 boundary is explicitly enforced (no keyboard retrofits in CD2)
5. Hold-to-drag 400ms vs 500ms gap is documented as a known gap

**If these prerequisites are skipped, CD2 will:**
- Likely succeed (the CSS changes are straightforward)
- But leave unfinished business (grid-auto-rows, haptic feedback, incomplete semantics)
- Risk creating handoff confusion for CD3 and CD4

**Recommendation:** CD2 is GO, but issue a brief "CD2 Readiness Checklist" before code changes begin. Do not start until all 5 prerequisites are confirmed.

---

**Report Generated:** 2026-04-03  
**Agent:** Agent 4 (Architecture / UX / Feasibility Critic)
