# Agent 1: Decision Register

**Date:** 2026-03-06
**Branch:** `claude/dashboard-nav-research-QnOBs`
**HEAD:** `98d961c`
**Role:** Manager / Ledger Integrator (Agent 1 of 4)
**Status:** FIRST PASS -- awaiting Agent 4 attack review

---

## Purpose

This register captures every locked decision with evidence, risks, and revisit triggers. Decisions are grouped by domain and ordered from most to least critical.

---

## D-001: Interaction Model -- Tap=Toggle, Hold=Popup

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User + popup-fix.md (2026-03-06) |
| **Decision** | Room tile tap toggles all room lights. Room tile hold (>=400ms) opens Browser Mod popup. |
| **Evidence** | iOS Home app uses this pattern. Primary action (toggle) is the most frequent gesture and gets the fastest path (tap). Secondary action (detail/popup) gets the slower path (hold). |
| **Risks** | (1) Discoverability failure: hold-to-popup has zero visual affordance. (2) 400ms dead zone: no progressive feedback during hold. (3) Keyboard inaccessible: Enter/Space only triggers tap. (4) Muscle memory inversion: current users learned tap=navigate, hold=toggle. |
| **Mitigations** | Ship on storage surface first for evaluation (FL-032 risk note). Add hold feedback animation later (FL-033). Add keyboard path later (FL-034). |
| **Revisit Trigger** | If real daily-use testing shows users cannot discover the popup or accidentally toggle lights when trying to reach the popup. |

---

## D-002: Popup Architecture -- `call-service browser_mod.popup` (Proven Mechanism)

| Field | Value |
|---|---|
| **Status** | LOCKED for POP-01 |
| **Locked By** | Agent 1 reconciliation of Agent 2/4 findings |
| **Decision** | POP-01 uses `call-service browser_mod.popup` with inline content. This is the mechanism already deployed and proven in the storage config (lines 174-230). The `fire-dom-event` + hidden `popup-card` approach from popup-fix.md is DEFERRED. |
| **Evidence** | (1) Storage config already uses `call-service browser_mod.popup` successfully. (2) Agent 2 identified two incompatible popup architectures in the plan. (3) Agent 4 confirmed `call-service` requires zero additional HACS dependencies and zero hidden card definitions. (4) The rooms card `_handleTapAction` already supports `call-service` (lines 556-561). |
| **Risks** | (1) Inline popup content is duplicated per room (approximately 60 lines each). (2) If project scales to many rooms, duplication becomes maintenance burden. |
| **Mitigations** | `fire-dom-event` support added to `_handleTapAction` anyway (FL-031) as optional enhancement. If inline duplication becomes untenable at scale, migrate to `popup-card` approach in a future tranche after verifying Sections compatibility. |
| **Revisit Trigger** | If POP-02 reveals that inline content duplication across 4+ rooms is unmaintainable. If `custom:popup-card` Sections compatibility is verified (PR #747 resolved). |

---

## D-003: Popup Platform -- Browser Mod Only

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User (plan.md direction locks), popup-fix.md |
| **Decision** | Browser Mod is the preferred popup system. Bubble/hash popup approach is superseded. |
| **Evidence** | User explicitly redirected popup architecture toward Browser Mod. Documented in plan.md, nav_popup_ux_direction.md, FIX_LEDGER.md SA-001. |
| **Risks** | Browser Mod is a HACS component. If it breaks on a future HA update, popups break. |
| **Mitigations** | Browser Mod v2.8.2 released same day as plan lock (2026-03-06), indicating active maintenance. The `call-service` mechanism uses HA's standard service call infrastructure, reducing coupling. |
| **Revisit Trigger** | If Browser Mod is abandoned or breaks on HA stable. If HA adds native popup/overlay support. |

---

## D-004: Popup Content Model -- One Popup Per Room

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User + popup-fix.md |
| **Decision** | Each room gets exactly one popup. Popup content is intentionally narrow: quick actions + one primary interaction surface (lighting card) + route to deeper room view. |
| **Evidence** | nav_popup_ux_direction.md: "one popup per room, not one popup system per widget." popup-fix.md: defines per-room popup content with All Off + lighting card + Open Room. |
| **Risks** | (1) POP-01 popup is just a lighting card -- not yet "iOS-grade sheet quality." (2) No temperature, media, or scene controls in popup. |
| **Mitigations** | POP-01 is explicitly a POC. Popup enrichment (temperature, scenes, media status) scheduled for post-POP-02 evaluation. Agent 4 correctly notes POP-01 is a "lighting quick-control popup" not a full "room popup." |
| **Revisit Trigger** | After POP-02, if users want more content in popups. When T-007 (Integrated UI/UX) begins. |

---

## D-005: Nav Foundation -- Custom `tunet-nav-card`

| Field | Value |
|---|---|
| **Status** | LOCKED (architecture under investigation for footer card option) |
| **Locked By** | User (plan.md), nav_popup_ux_direction.md |
| **Decision** | The custom `tunet-nav-card` remains the navigation foundation. Nav is not just a route switcher -- it should become a lightweight live-state surface. |
| **Evidence** | nav_popup_ux_direction.md: "The custom tunet-nav-card remains the navigation foundation. The nav is not just a route switcher." |
| **Risks** | (1) Global DOM pollution (FL-011). (2) Duplication across 7 views (FL-038). (3) `columns: 'full'` may be non-standard API (FL-043). |
| **Mitigations** | SPIKE-01 investigates footer card as mobile positioning replacement. Route-scoped offsets as fallback. |
| **Revisit Trigger** | If SPIKE-01 shows footer card is viable. If HA adds native footer navigation that subsumes custom nav card functionality. |

---

## D-006: Nav Item Count -- 3-4 Items Initially, 7 Deferred

| Field | Value |
|---|---|
| **Status** | LOCKED (current); DEFERRED (7-item expansion) |
| **Locked By** | Agent 1 reconciliation of Agent 4 critique |
| **Decision** | NAV-01 ships with 3-4 nav items (Home, Rooms, Media, optionally Settings). Expansion to 7 per-room destinations deferred until small-screen touch target validation is complete. |
| **Evidence** | Agent 4 A2: at 320px, 7 items yield 42px per item, below the 44px minimum touch target. Agent 4 A2: "7 destinations is a content model problem, not a layout problem." The tap=toggle change (D-001) means rooms page tiles no longer navigate to room pages, creating pressure to put rooms in the nav. But if popups provide room access, per-room nav items may be redundant. |
| **Risks** | (1) With only 3 nav items, room pages are only reachable via Rooms index page tap or popup "Open Room" button. (2) Neither is a one-tap path from the overview. |
| **Mitigations** | Keep `navigate_path` as optional fallback on room tiles (D-009). Rooms index page provides a dedicated room-routing hub. Popup "Open Room" button provides secondary path. |
| **Revisit Trigger** | If validated prototype shows 7 items work at 320px with touch targets. If overflow pattern (visible 4 + "more" drawer) proves viable. If user explicitly requests per-room nav items. |

---

## D-007: Layout Policy -- Flexible by Default, No Hard Caps

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | popup-fix.md, confirmed by Agent 3 audit |
| **Decision** | Cards use `max_columns: 12` (grid maximum, functionally uncapped). No restrictive `max_columns` caps. `columns: "full"` only for chrome (nav card). Vertical sizing is intrinsic (`rows` omitted from `getGridOptions()`). |
| **Evidence** | Agent 3 A1: all 10 content cards use `max_columns: 12`. Agent 3 conclusion: "No hard max_columns caps that need removal. The plan's LAY-02 concern about hard caps is moot." Agent 2 A2: omitting rows is correct for content-driven cards. |
| **Risks** | None identified. |
| **Mitigations** | N/A. |
| **Revisit Trigger** | If a new card requires a genuine column cap for visual correctness. If HA changes the Sections grid model. |

---

## D-008: Product Decision Order -- Nav, Popup, UI/UX, Home Layout

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User (plan.md direction locks) |
| **Decision** | The next four major decisions must be handled one at a time, in this order: (1) NAV, (2) POPUP, (3) INTEGRATED UI/UX, (4) HOME LAYOUT. |
| **Evidence** | plan.md: "The next four major decisions must be handled one at a time, in this order." User explicitly locked this sequence. |
| **Risks** | popup-fix.md reorders to put popup before nav. This is a CONTROL_DOC_CONFLICT resolved by plan.md precedence. In practice, POP-01 and NAV-01 can proceed in parallel since the popup work does not depend on nav expansion. |
| **Mitigations** | The execution plan (agent1_execution_plan.md) sequences SPIKE-01 (nav investigation) before POP-01 (popup POC) to respect the spirit of "nav first" while delivering the popup POC quickly. NAV-01 full implementation follows after POP-01/POP-02. |
| **Revisit Trigger** | Only if user explicitly reorders. |

---

## D-009: `navigate_path` Retention -- Keep as Fallback

| Field | Value |
|---|---|
| **Status** | PROVISIONAL (Agent 1 recommendation, not user-locked) |
| **Locked By** | Agent 1 reconciliation of Agent 4 critique |
| **Decision** | Do NOT remove `navigate_path` from room tile configs yet. Keep it as an optional fallback. The tap handler no longer uses it as the default (toggle is the new default), but it remains available if `tap_action: { action: navigate }` is explicitly configured. |
| **Evidence** | Agent 4 B1: removing `navigate_path` creates a single point of failure where nav bar is the only path to room pages. Agent 4 F5: "If the nav card fails to render, room pages become completely unreachable." 8 room entries across 2 views have `navigate_path` configured. |
| **Risks** | Retaining `navigate_path` in config adds visual noise. The code path still exists even if not default. |
| **Mitigations** | The `navigate_path` fallback in the tap handler is removed (POP-01 changes the tap default to toggle). The config field persists but has no effect unless explicitly configured as `tap_action: navigate`. This is a safety net, not active behavior. |
| **Revisit Trigger** | After NAV-01 proves nav is reliable and includes room destinations. After user confirms room pages are always reachable. |

---

## D-010: Browser Mod Field Name -- `size` vs `initial_style`

| Field | Value |
|---|---|
| **Status** | OPEN -- needs verification |
| **Decision** | Verify whether Browser Mod 2.8.2 prefers `initial_style` over `size`. If so, update all popup configs. |
| **Evidence** | popup-fix.md uses `initial_style: wide`. Storage config uses `size: wide` (line 179) and `size: normal` (line 406). Browser Mod 2.8.x documentation should clarify which is canonical. |
| **Risk** | If `size` is deprecated, it may stop working in a future Browser Mod update. |
| **Tracked As** | FL-036 |

---

## D-011: CP-01 -- Declared DONE

| Field | Value |
|---|---|
| **Status** | DONE (declared by Agent 1) |
| **Decision** | The control-plane reset tranche (CP-01) is complete. The governance infrastructure already exists. |
| **Evidence** | plan.md (582 lines), FIX_LEDGER.md (917 lines), TRANCHE_TEMPLATE.md, DEPLOYMENT_RESOURCES.md, branch guards, precedence rules, Change ID scheme, stale-finding classification, and the current 4-agent review run all exist and are operational. |
| **Agent 4 Support** | "The governance infrastructure already exists... Adding more governance docs before shipping code is bureaucratic drift." |
| **Revisit Trigger** | If a future tranche ships work that violates the established governance gates (no Change ID, no validation checklist, no rollback plan). |

---

## D-012: LAY-01 and LAY-02 -- Eliminated

| Field | Value |
|---|---|
| **Status** | ELIMINATED |
| **Decision** | Layout research (LAY-01) and grid policy normalization (LAY-02) are not separate tranches. |
| **Evidence** | Agent 3 A1: `max_columns: 12` is consistent across all cards. No policy to normalize. Agent 4 C1: "CP-01 and LAY-01 produce nothing user-visible." Agent 4 C3: "Agent 3 proved [LAY-02] is a non-issue." The working popup IS the layout prototype (LAY-01 merged into POP-01). |
| **Residual Items** | `columns: 'full'` anomaly (FL-043) and lighting card `grid-auto-rows: 124px` (FL-040) tracked as backlog items, not as a tranche. |
| **Revisit Trigger** | If a future tranche reveals genuine Sections layout conflicts that require a dedicated research spike. |

---

## D-013: Card Disposition -- All Custom Cards KEPT

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User (2026-03-05) |
| **Decision** | All custom cards are kept. Climate is gold standard. Rooms becomes navigation hub. No card replacement with native alternatives. |
| **Evidence** | Project memory: "Card Disposition Decisions (LOCKED Mar 5, 2026). User rejected the hybrid native/custom pivot. All custom cards are KEPT." |
| **Revisit Trigger** | Only if user explicitly requests reconsideration. |

---

## D-014: Dark Mode Palette -- Midnight Navy

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | User (2026-02-20) |
| **Decision** | Canvas: `#0f172a`, Card: `rgba(30,41,59, 0.72)`, Amber: `#fbbf24`. |
| **Evidence** | Project memory: "Dark Mode: Midnight Navy (LOCKED Feb 20)." Tunet CLAUDE.md: "Dark Mode: Midnight Navy (LOCKED)." |
| **Revisit Trigger** | None. |

---

## D-015: Staging Root -- `v2_next` Until Cutover

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | plan.md |
| **Decision** | `v2_next` is the active staging root. `v2` is the stable rollback root. No cutover until explicitly approved. |
| **Revisit Trigger** | Explicit cutover decision. |

---

## D-016: Surface Model -- Dual Surface (YAML + Storage)

| Field | Value |
|---|---|
| **Status** | LOCKED |
| **Locked By** | plan.md |
| **Decision** | `tunet-suite` (YAML) is the repo-controlled architecture surface. `tunet-suite-storage` (storage) is the primary evaluation/UI-edit surface. Changes validated on storage must be manually ported to YAML. |
| **Evidence** | plan.md Surface Model section. Agent 2 D: confirms no native hybrid mode exists. |
| **Revisit Trigger** | If HA adds a true hybrid dashboard mode. If one surface is deprecated. |

---

## D-017: `escapeHtml` in `tunet_base.js` -- NOT PRESENT (Memory Stale)

| Field | Value |
|---|---|
| **Status** | INFORMATIONAL |
| **Decision** | Project memory claims `TunetCardFoundation.escapeHtml` exists. Grep confirms it does NOT exist in `tunet_base.js`. Agent 2 G4 references it. This is a stale memory entry. |
| **Impact** | FL-039 (innerHTML sanitization) cannot use a nonexistent helper. Must either create `escapeHtml` or use `textContent` directly. |
| **Action** | Update project memory to reflect reality. |
