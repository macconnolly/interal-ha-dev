# Tunet Dashboard Card Suite — Stabilization Plan

## Executive Summary

**Goal:** Get every Tunet card working perfectly in live HA, matching mockup fidelity.
**Strategy:** V1 self-contained monolithic cards on `main` as base, cherry-pick targeted UX features from pre-reuse, single-card perfection loop.
**Architecture freeze:** No shared modules, no primitives, no `tunet_base.js` imports until all cards pass gates.

---

## 1. Architectural Decision (Locked)

### What we're using: V1 Self-Contained Monoliths

Each card is a single `.js` file with zero external dependencies. All CSS tokens, TunetCardFoundation utilities, and font injection are inlined per-card.

**Location:** `Dashboard/Tunet/Cards/*.js` (11 files on `main` branch)
**Deployed to:** HA at `/config/www/tunet/*.js` via `sshpass` SCP to `10.0.0.21`
**Lovelace resources:** `/local/tunet/*.js?v=6000` (11 entries in `.storage/lovelace_resources`)

### Why not V2 shared base (`tunet_base.js`)

The pre-reuse snapshot (`origin/trial:Configuration/www/tunet/v2_pre_reuse_5b9158/`) uses ES module imports from `tunet_base.js` (778 lines). 10-agent evaluation found:

1. **Single point of failure** — if `tunet_base.js` fails to load, ALL 9 cards break (blank dashboard)
2. **Pre-reuse cards regressed** — every card lost `callServiceSafe` error handling, `escapeHtml` XSS protection, and `bindActivate` keyboard accessibility
3. **Token drift** — `tunet_base.js` has stale values: `--text-muted: rgba(248,250,252, 0.45)` (should be `rgba(245,245,247, 0.35)`), icon defaults `wght: 100, GRAD: 200, opsz: 20` (should be `400, 0, 24`)
4. **Missing cards** — pre-reuse has no `tunet_page_card.js` or `tunet_scenes_card.js`
5. **Deployment complexity** — requires 11 resource URL changes + deploying `tunet_base.js` alongside cards

### Why not V2 full extraction (primitives/composers)

The primitive extraction (`tunet_light_tile.js`, `tunet_speaker_tile.js`, `tunet_status_tile.js`, `tunet_runtime.js`, etc.) is documented in `Dashboard/Tunet/Docs/agent_handoff_2026-02-23.md` as the source of regressions R1-R6:

- R1: Volume dispatch broken on speaker tiles
- R2: Drag interaction reliability degraded
- R3: Visual parity lost (shadows, spacing, typography)
- R4: Manual state indicators desynced
- R5: Subtitle logic contradictions
- R6: Editor/config form regressions

**Architecture freeze applies until Pass 2.** See §10 for the Pass 2 promotion model.

---

## 2. Source of Truth

### Files

| Purpose | Path | Notes |
|---------|------|-------|
| **Card source (canonical)** | `Dashboard/Tunet/Cards/*.js` | 11 files, main branch |
| **Design spec** | `Dashboard/Tunet/Mockups/design_language.md` (v8.3+) | THE rulebook |
| **Gold standard card** | `Dashboard/Tunet/Cards/tunet_climate_card.js` | Match this quality |
| **Lighting mockup** | `Dashboard/mockups/living_card_mockup.html` | Visual target for tiles |
| **Overview mockup** | `Dashboard/Tunet/Mockups/tunet-overview-dashboard.html` | Full dashboard target |
| **Dashboard config** | `Dashboard/Tunet/tunet-overview-config.yaml` | Card composition |
| **Pre-reuse reference** | `origin/trial:Configuration/www/tunet/v2_pre_reuse_5b9158/` | Cherry-pick source only |
| **Handoff forensics** | `Dashboard/Tunet/Docs/agent_handoff_2026-02-23.md` (trial branch) | V1→V2 failure timeline |
| **Card build instructions** | `Dashboard/Tunet/Cards/CLAUDE.md` | Skeleton + token source |
| **This plan** | `plan.md` | Living document |

### Branch

Working branch: **`main`** (or a feature branch off main like `tunet/card-perfection`)
All card fixes land as atomic single-card commits.

### HA Deployment

- Server: `10.0.0.21` via SSH (credentials in `.env` as `HA_SSH_PASSWORD`)
- Card path on HA: `/config/www/tunet/*.js`
- Deploy command: `sshpass -p "$HA_SSH_PASS" scp <file> root@10.0.0.21:/config/www/tunet/`
- Cache bust: bump `?v=` in Lovelace resources OR `ha core restart`
- Dashboard URL: `/tunet-overview`

---

## 3. What 10 Evaluation Agents Found

### Per-Card Verdict (main branch as base)

| Card | Version | Lines | Spec Fidelity | Production Ready? | Work Needed |
|------|---------|-------|:---:|:---:|---|
| **tunet_climate_card.js** | 1.0.0 | 1634 | 9.3/10 | **Yes** | None — gold standard |
| **tunet_actions_card.js** | 2.1.0 | 675 | 9/10 | **Yes** | None |
| **tunet_sensor_card.js** | 1.0.0 | 1093 | 9/10 | **Yes** | None |
| **tunet_scenes_card.js** | 1.0.0 | 379 | 9/10 | **Yes** | None |
| **tunet_weather_card.js** | 1.1.0 | 623 | 9/10 | **Yes** | Optional: forecast subscription from pre-reuse v1.4.0 |
| **tunet_page_card.js** | — | 281 | 8/10 | **Yes** | Gradient background verify |
| **tunet_lighting_card.js** | 3.2.0 | 1918 | 8/10 | Needs polish | Colored subtitle, header promotion, dark pill contrast |
| **tunet_media_card.js** | 3.0.0 | 1575 | 8/10 | Needs verify | Dropdown fix deployed, may need fixed-position revert |
| **tunet_status_card.js** | 2.2.0 | 1268 | 7/10 | Needs fixes | Viewport dropdown, visibility:hidden show_when |
| **tunet_rooms_card.js** | 2.1.0 | 1000 | 7/10 | Needs fixes | Amber status text, sizing, reported "very broken" |
| **tunet_speaker_grid_card.js** | 1.0.0 | 961 | 5/10 | Needs rewrite | v1→v3 gap: horizontal layout, media metadata, volume commit bug, pointer capture, group dot |

### Key Cross-Cutting Findings

1. **Main matches design spec at 9.3/10** — mockup-eval confirmed main's tokens are closer to spec than pre-reuse (7.1/10) or either mockup HTML (5.4-7.3/10)
2. **Pre-reuse icon defaults are wrong** — `wght: 100, GRAD: 200, opsz: 20` vs spec's `400, 0, 24`
3. **Pre-reuse text tokens are wrong** — based on Tailwind `#F8FAFC` not spec's Apple `#F5F5F7`
4. **Every pre-reuse card lost error handling** — `callServiceSafe` → raw `callService`
5. **Speaker grid has a real volume-loss bug on main** — no final commit on pointerup
6. **Speaker grid is NOT in the dashboard config** — needs to be added to `tunet-overview-config.yaml`

---

## 4. Past Failed Approaches (Do Not Repeat)

### Failure 1: V2 Primitive Extraction (Feb 20-21, 2026)

**What happened:** 4 commits (`ca3828d`, `f11d9eb`, `5fda035`, `253800e`) extracted shared UI primitives from monolithic cards into reusable web components. Created 10 new files (3,770 lines): `tunet_light_tile.js`, `tunet_speaker_tile.js`, `tunet_status_tile.js`, `tunet_runtime.js`, `tunet_action_chip.js`, `tunet_info_tile.js`, `tunet_control_button.js`, `tunet_scene_chip.js`, `tunet_scene_row.js`, `tunet_sonos_card.js`.

**Why it failed:** Cross-component event dispatch (`tunet_runtime.js` `dispatchAction`) created coupling that was hard to debug. Volume dispatch, drag interaction, and visual parity all regressed. The `tunet_base.js` shared module ballooned from 778 to 1,818 lines.

**Lesson:** Abstraction before stability is backwards. Get each card working perfectly as a monolith first.

### Failure 2: Multi-Card Parallel Fixes (Feb 23, 2026)

**What happened:** Agent team applied icon font sweep + token fixes to all 10 cards simultaneously in one session.

**Why it partially failed:** Icon fixes deployed but couldn't verify all cards. Rooms card remained "very broken." Speaker grid card missing from dashboard. Gradient background not rendering. Too many changes at once made it impossible to isolate which card caused which regression.

**Lesson:** Single-card-at-a-time with validation gates between each.

### Failure 3: Using Pre-Reuse as Runtime Base

**What the Codex plan proposed:** Deploy `v2_pre_reuse_5b9158/` cards as the active runtime.

**Why it's stale:** Previous session cleaned up pre-reuse directory from HA. Main's self-contained cards are already deployed. Pre-reuse cards need `tunet_base.js` alongside them. Pre-reuse has wrong icon defaults, wrong text tokens, lost error handling.

**Lesson:** Don't switch runtime base when the current one is functional. Fix forward on what's deployed.

---

## 5. Priority Order and Per-Card Fix Plans

### Iteration 1: Lighting Card (P0 Hero)

**File:** `Dashboard/Tunet/Cards/tunet_lighting_card.js` (v3.2.0, 1918 lines)
**Cherry-pick source:** `origin/trial:Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_lighting_card.js` (v3.3.0)

**Patches (4 small):**

| # | What | Where | Cherry-Pick? | Size |
|---|------|-------|:---:|:---:|
| 1 | Add `--red` token (light: `#FF3B30`, dark: `#FF453A`) | `:host` and `:host(.dark)` blocks (~line 130, 185) | From `tunet_base.js` line 56/178 | S |
| 2 | Add `.adaptive-ic`, `.red-ic` CSS + header title promotion | After `.amber-ic` rule (line 476) + after `.hdr-title` rule (line 465) | From pre-reuse lines 217-220, 186 | S |
| 3 | Switch subtitle from `textContent` to `innerHTML` with colored spans | `_updateAll()` lines 1862-1876 | From pre-reuse lines 1552-1567 | S |
| 4 | Dark-mode floating pill: amber border + stronger shadow | After `.l-tile.sliding .zone-val` rule (~line 750) | New (both versions need this) | S |

**What we're NOT changing (and why):**
- Manual parser — main's `_isZoneManual()` with Set + group traversal is already superior to pre-reuse's `array.includes()`
- Drag physics — identical in both, main adds `callServiceSafe` which is better
- Grid row system — main's `aspect-ratio: 1/0.95` matches mockup; pre-reuse's `--grid-row: 124px` is a different approach, not better
- Amber tuning — main matches spec (9.3/10); pre-reuse values deviate from spec
- Pill clipping — main's `padding-top: 20px; margin-top: -20px` with `overflow-y: visible` works; no clipping

**Validation gate:**
- [ ] Subtitle shows amber "3 on · 62%", contextual "Adaptive", red "1 manual"
- [ ] "All off" renders plain (no colored span)
- [ ] Header title brightens on any-light-on
- [ ] Dark mode pill has amber border ring during drag
- [ ] Static subtitle override (`config.subtitle`) still uses safe `textContent`
- [ ] No visual regression in light mode
- [ ] Drag still commits brightness correctly

---

### Iteration 2: Speaker Grid Card (P0)

**File:** `Dashboard/Tunet/Cards/tunet_speaker_grid_card.js` (v1.0.0, 961 lines)
**Cherry-pick source:** `origin/trial:Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_speaker_grid_card.js` (v3.1.0, 965 lines)

**This is the biggest gap.** Main is v1.0.0, pre-reuse is v3.1.0 — a 3-major-version delta. The speaker-deep-eval agent found 23 features in v3.1.0 missing from v1.0.0.

**Recommended approach:** Port pre-reuse v3.1.0's tile layout, state machine, and interaction model into main's self-contained architecture. Keep main's TunetCardFoundation, midnight navy tokens, and icon validation. This is effectively a rewrite of the card interior while preserving the card shell.

**Critical items (must-have):**

| # | What | Why | Size |
|---|------|-----|:---:|
| 1 | Horizontal tile layout | v1 uses vertical stacks, v3 uses horizontal — fundamentally different UX | L |
| 2 | Final volume commit on pointerup | **v1 has a real volume-loss bug** — debounced value may never reach HA | S |
| 3 | `setPointerCapture` / `releasePointerCapture` | Drag can be lost if pointer exits tile bounds | S |
| 4 | `e.preventDefault()` on pointerdown/move | Prevents scroll interference during drag | S |
| 5 | Media metadata display (`.spk-meta`) | v1 tiles show only icon+name+vol — no track info | M |
| 6 | Paused/idle state styling | v1 has only default and in-group states | M |
| 7 | Group dot indicator | Visual feedback for group membership | S |
| 8 | ARIA `role="slider"` + `aria-valuenow` | Accessibility for dual tap/drag interaction | S |
| 9 | Add to dashboard config | Speaker grid is NOT in `tunet-overview-config.yaml` | S |

**Nice-to-have:**

| # | What | Size |
|---|------|:---:|
| 10 | Steel Blue accent system (`#4682B4`/`#6BA3C7`) | S |
| 11 | Tile size presets (compact/standard/large) | S |
| 12 | Custom CSS injection | S |
| 13 | Spring easing + hover lift | S |
| 14 | Dynamic `getCardSize()` | S |
| 15 | Updated entity selector format (`filter: [{}]`) | S |

**Validation gate:**
- [ ] Volume drag always commits final value on pointer-up
- [ ] Drag works when pointer leaves tile bounds
- [ ] Tiles show speaker name + current track info
- [ ] Paused speakers visually distinct from playing
- [ ] Group dot visible on grouped speakers
- [ ] Tap toggles group membership
- [ ] Long-press opens more-info dialog
- [ ] Card appears in dashboard between media and rooms sections

---

### Iteration 3: Media/Sonos Card (P0)

**File:** `Dashboard/Tunet/Cards/tunet_media_card.js` (v3.0.0, ~1575 lines)
**Cherry-pick source:** Pre-reuse v3.1.0 (1232 lines)

**Current state:** Dropdown `position:fixed` → `position:absolute` fix was deployed this session. Main is functionally superior in almost every area (Foundation, volume drag entity capture, 5-tier group member detection, commitFinal on pointerup).

**Remaining work:**

| # | What | Size |
|---|------|:---:|
| 1 | Verify dropdown positioning works in live HA after restart | S |
| 2 | Consider reverting to `position:fixed` with viewport tracking if absolute has issues in HA panels | M |

**Pre-reuse's one advantage:** `position:fixed` dropdown with `resize`/`scroll` listeners for viewport-aware repositioning. If `position:absolute` clips in HA's scrollable panel views, port the fixed-position approach back but keep main's Foundation utilities.

**Validation gate:**
- [ ] Speaker dropdown opens directly below button
- [ ] Dropdown doesn't clip in scrollable HA panels
- [ ] Volume drag commits final value
- [ ] Speaker selection switches active entity
- [ ] Group toggle works from dropdown

---

### Iteration 4: Status Card (P1)

**File:** `Dashboard/Tunet/Cards/tunet_status_card.js` (v2.2.0, 1268 lines)
**Cherry-pick source:** Pre-reuse v2.3.0 (927 lines)

| # | What | Cherry-Pick? | Size |
|---|------|:---:|:---:|
| 1 | Viewport-aware dropdown positioning (spaceBelow/spaceAbove + maxHeight flip) | Pre-reuse lines 856-878 | S |
| 2 | `visibility: hidden` for `show_when` hidden tiles (preserves grid layout vs `display: none`) | Pre-reuse line 148-151 | S |
| 3 | Column count refresh on `_buildGrid()` | Pre-reuse line 456 | S |
| 4 | Dropdown `maxHeight` reset on close | Pre-reuse line 889 | S |
| 5 | Fix dropdown service domain detection (`select.*` vs `input_select.*`) | New — neither version handles this | M |

**Keep main's advantages:** `tile_size` presets, `secondary` value field, icon state-aware fill (`_updateIconFill()`), dropdown keyboard navigation (arrow-key/Escape), red/purple accent tokens, `escapeHtml`, `callServiceSafe`.

**Validation gate:**
- [ ] Dropdown flips above when near viewport bottom
- [ ] Hidden tiles preserve grid slot (no layout reflow)
- [ ] Timer countdown correct
- [ ] Dot rules render correctly
- [ ] Dropdown service calls work for both `input_select` and `select` entities

---

### Iteration 5: Rooms Card (P1)

**File:** `Dashboard/Tunet/Cards/tunet_rooms_card.js` (v2.1.0, 1000 lines)
**Cherry-pick source:** Pre-reuse v2.2.0 (774 lines)

| # | What | Size |
|---|------|:---:|
| 1 | Amber-colored status text (`<span class="amber-txt">N on</span>`) | S |
| 2 | Review grid-auto-rows (main forces `minmax(132px, auto)` which may cause excess whitespace) | S |
| 3 | Investigate "very broken" report — likely needs live testing to identify root cause | M |

**Validation gate:**
- [ ] Room cards render with correct orbs per light
- [ ] Tap on room icon toggles all room lights
- [ ] Status text shows amber "on" count
- [ ] No excess whitespace in grid layout
- [ ] Dark mode contrast acceptable

---

### Iteration 6: Remaining Cards (P2 — verify only)

These cards are production-ready. Quick visual verification in live HA, no code changes expected.

| Card | Version | Check |
|------|---------|-------|
| `tunet_climate_card.js` | 1.0.0 | Gold standard — confirm no regressions |
| `tunet_weather_card.js` | 1.1.0 | Forecast loads, dark mode correct |
| `tunet_actions_card.js` | 2.1.0 | 4 action chips render, service calls work |
| `tunet_sensor_card.js` | 1.0.0 | Sparklines render, thresholds color correctly |
| `tunet_scenes_card.js` | 1.0.0 | Scene chips activate correctly |
| `tunet_page_card.js` | — | Gradient background renders in both modes |

---

## 6. Visual Standards (From Mockup Eval)

### Token Source of Truth

Main branch cards match the design spec at **9.3/10 fidelity**. These values are locked:

**Light mode:**
```
--glass: rgba(255,255,255, 0.68)
--glass-border: rgba(255,255,255, 0.45)
--shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10)
--text: #1C1C1E
--text-sub: rgba(28,28,30, 0.55)
--text-muted: #8E8E93
--amber: #D4850A
```

**Dark mode (Midnight Navy — LOCKED):**
```
--glass: rgba(30,41,59, 0.72)
--glass-border: rgba(255,255,255, 0.08)
--shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28)
--text: #F5F5F7
--text-sub: rgba(245,245,247, 0.50)
--text-muted: rgba(245,245,247, 0.35)
--amber: #fbbf24
--tile-bg: rgba(30,41,59, 0.90)
--dd-bg: rgba(30,41,59, 0.92)
```

**DO NOT USE (pre-reuse deviations):**
- `#F8FAFC` for text (wrong — use `#F5F5F7`)
- `rgba(248,250,252, 0.45)` for text-muted (wrong — use `rgba(245,245,247, 0.35)`)
- `rgba(44,44,46, 0.72)` for glass (old gray — use `rgba(30,41,59, 0.72)`)
- `rgba(58,58,60, *)` for anything (old gray family — purged)
- `#E8961E` for amber (old — use `#fbbf24`)
- `wght: 100, GRAD: 200, opsz: 20` for icons (wrong — use `wght: 400, GRAD: 0, opsz: 24`)

### Tile Shadow Physics (Parity Lock)

```
Rest:   0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08)
Lifted: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08)
```

### Icon System

- Font: Material Symbols Rounded (NOT Outlined)
- Default: `font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- Active/on: `font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24`
- Never use `icon_names=` filtered Google Fonts URLs

---

## 7. Interaction Standards

### Drag Gestures
- Must update optimistic UI during drag
- Must commit final value on `pointerup` (clear any pending debounce, send immediately)
- Must survive `pointercancel` (clean abort, no orphaned timers)
- Must use `setPointerCapture` for reliability
- Must call `e.preventDefault()` on `pointerdown`/`pointermove` to prevent scroll interference

### Service Calls
- Always use `TunetCardFoundation.callServiceSafe()` — never raw `hass.callService()`
- Provides: error handling, pending element state, `tunet-service-error` custom events

### Accessibility
- Interactive elements use `TunetCardFoundation.bindActivate()` — provides `role`, `tabindex`, keyboard (Enter/Space) support
- Config-sourced text in `innerHTML` must be wrapped in `escapeHtml()`
- `:focus-visible` outlines on all interactive controls

### Dark Mode
- Toggle via `hass.themes.darkMode` → `this.classList.toggle('dark', isDark)`
- CSS via `:host(.dark)` selectors
- No JavaScript style overrides for dark mode — all in CSS

---

## 8. Deployment Procedure (Per Card)

```
1. Edit card file in Dashboard/Tunet/Cards/<card>.js
2. SCP to HA:
   source .env && sshpass -p "$HA_SSH_PASSWORD" scp \
     Dashboard/Tunet/Cards/<card>.js \
     root@10.0.0.21:/config/www/tunet/<card>.js
3. Bump resource version:
   Current: ?v=6000 → next: ?v=6001 (or ha core restart)
4. Hard refresh dashboard in browser
5. Validate on /tunet-overview (both light and dark mode)
6. Commit with card-scoped message:
   "fix(tunet): <card> — <what changed>"
7. Do NOT start next card until validation gate is green
```

---

## 9. Testing Protocol

### Per-Card Gate Checklist

**Functional:**
- [ ] Tap action sends expected service/event
- [ ] Hold/long-press fires only in intended hit area
- [ ] Drag (slow, fast, interrupted) commits correctly
- [ ] Entity unavailable → fallback rendering → recovery on available
- [ ] Service errors handled gracefully (no silent failures)

**Visual:**
- [ ] Matches mockup shadows, spacing, typography, colors
- [ ] Light mode and dark mode both correct
- [ ] Floating elements (pills, dropdowns) not clipped
- [ ] State transitions animate correctly

**Regression:**
- [ ] Previously locked cards still work after this card's deploy
- [ ] No duplicate custom element registration errors in console
- [ ] No `tunet_base.js` import errors (should be none — V1 architecture)

### Mandatory Scenarios
1. Pointer drag + pointercancel
2. Rapid repeated drags
3. Unavailable → available entity recovery
4. Dark/light mode toggle
5. Browser cache stale → version bump reload

---

## 10. Pass 2: Architecture Promotion (Future — After All Gates Green)

**Not started until:** Every card on `/tunet-overview` passes all behavior + visual gates with zero open regressions.

**Decision to make:** Keep stabilized V1 monoliths or reintroduce shared base + primitives.

**If reintroducing shared code:**
1. Extract `tunet_base.js` with CORRECTED tokens (main's midnight navy, not pre-reuse's drifted values)
2. Migrate one card at a time to imports
3. Each migration is a separate commit with its own gate check
4. If any card regresses, revert to V1 monolith and investigate
5. Primitives (light_tile, speaker_tile, etc.) are a separate decision after base extraction is stable

**Gate-based promotion model:**
```
V1 Monolith (locked, working)
  → Extract shared CSS to tunet_base.js
  → Migrate card to imports
  → Validate: same behavior, same visual, same performance
  → Lock migrated card
  → Next card
```

---

## 11. File Inventory

### Active Cards (main branch, deployed)

| File | Version | Lines | Status |
|------|---------|------:|--------|
| `Dashboard/Tunet/Cards/tunet_page_card.js` | — | 281 | Deployed, page wrapper |
| `Dashboard/Tunet/Cards/tunet_actions_card.js` | 2.1.0 | 675 | Deployed, production-ready |
| `Dashboard/Tunet/Cards/tunet_status_card.js` | 2.2.0 | 1268 | Deployed, needs P1 fixes |
| `Dashboard/Tunet/Cards/tunet_lighting_card.js` | 3.2.0 | 1918 | Deployed, needs P0 polish |
| `Dashboard/Tunet/Cards/tunet_climate_card.js` | 1.0.0 | 1634 | Deployed, gold standard |
| `Dashboard/Tunet/Cards/tunet_weather_card.js` | 1.1.0 | 623 | Deployed, production-ready |
| `Dashboard/Tunet/Cards/tunet_sensor_card.js` | 1.0.0 | 1093 | Deployed, production-ready |
| `Dashboard/Tunet/Cards/tunet_media_card.js` | 3.0.0 | 1575 | Deployed, dropdown fix applied |
| `Dashboard/Tunet/Cards/tunet_rooms_card.js` | 2.1.0 | 1000 | Deployed, needs P1 fixes |
| `Dashboard/Tunet/Cards/tunet_scenes_card.js` | 1.0.0 | 379 | Deployed, production-ready |
| `Dashboard/Tunet/Cards/tunet_speaker_grid_card.js` | 1.0.0 | 961 | Deployed, needs P0 rewrite |

### Reference Files (git only, not deployed)

| File | Branch | Purpose |
|------|--------|---------|
| `Configuration/www/tunet/v2_pre_reuse_5b9158/*.js` | `origin/trial` | Cherry-pick source for features |
| `Configuration/www/tunet/v2_pre_reuse_5b9158/tunet_base.js` | `origin/trial` | Token/utility reference (do NOT deploy) |
| `Dashboard/Tunet/Cards/v2/*.js` | `origin/trial` | V2 extraction archive (do NOT use) |
| `Dashboard/Tunet/Docs/agent_handoff_2026-02-23.md` | `origin/trial` | Failure forensics |

### Dashboard Config

| File | Purpose |
|------|---------|
| `Dashboard/Tunet/tunet-overview-config.yaml` | Card composition for /tunet-overview |
| `/tmp/lovelace_resources_clean.json` | Current Lovelace resource snapshot |

### Design References

| File | Purpose |
|------|---------|
| `Dashboard/Tunet/Mockups/design_language.md` | v8.3+ canonical spec |
| `Dashboard/mockups/living_card_mockup.html` | Lighting tile visual target |
| `Dashboard/Tunet/Mockups/tunet-overview-dashboard.html` | Full dashboard visual target |
| `Dashboard/Tunet/Mockups/tunet-sonos-card-v2.html` | Media card visual target |

---

## 12. Branch Map

| Branch | Purpose | Status | Safe to Archive? |
|--------|---------|--------|:---:|
| `main` | **Active development** | 2 ahead of origin/main | No — active |
| `origin/trial` | V2 experiment + pre-reuse snapshot | 16 ahead, 11 behind main | No — reference source |
| `tunet/dashboard-finalize` | Old pre-stabilization fork | 0 ahead, 13 behind main | **Yes** — fully absorbed into main |
| `origin/trial-lighting-finalize` | V2 header primitives | 6 ahead of fork point | Yes — superseded |
| `origin/tunet/v2-cards-and-refinements` | Staging snapshot | 1 ahead of fork point | Yes — superseded |
| `origin/claude/abstract-lighting-tiles-RP2rU` | V2 test harness | 2 ahead of origin/main | Yes — experiment only |
| `origin/claude/review-design-language-5wk1F` | Alt card variants + DL v9.0 | 17 behind main | Yes — experiment only |
| `origin/claude/sonos-media-card-v3-vtF1c` | Sonos-focused branch | 20 behind main | Yes — absorbed into main |
| `review/tunet-*` | Review branches | Various | Yes — review artifacts |
| OAL branches | Unrelated to Tunet | Various | No — separate workstream |

---

## 13. Success Definition

**Pass 1 is complete when:**
1. Every card on `/tunet-overview` passes its validation gate
2. No open regressions in drag/dropdown/hold/manual-state behaviors
3. Light mode and dark mode both visually correct
4. Speaker grid card is in the dashboard and functional
5. No mixed-path ambiguity in Lovelace resources
6. Each card locked with a single-card-scoped commit

**"Works perfectly" means:**
- User never sees a blank card or console error
- Drag gestures feel responsive and always commit
- Dropdowns open in the right place and close on outside click
- State indicators (manual dots, status text, group badges) match actual HA state
- Dark mode midnight navy palette is consistent across all cards
- Typography, shadows, and spacing match the mockup intent
