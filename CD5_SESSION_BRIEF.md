# CD5 Session Brief — Utility Strip Bespoke Pass

**For:** Next Claude Code session (no prior context)
**Date:** 2026-04-04
**Repo:** `/home/mac/HA/implementation_10` (branch: `main`, HEAD: `604746d`)

---

## What This Project Is

A custom Home Assistant dashboard card suite called "Tunet" — 13 vanilla web component cards (no LitElement, no React) deployed to a live HA instance at `http://10.0.0.21:8123`. The cards use shadow DOM, a shared base module (`tunet_base.js`), and an esbuild bundler.

## Where We Are

A consistency-driver rehabilitation program (CD0–CD12) is bringing these cards to production quality. **CD0–CD4 (all shared passes) are complete.** We are now entering **bespoke card passes** — each tranche touches 1-3 specific cards.

| Completed | Tranche | What it did |
|-----------|---------|------------|
| Apr 3 | CD0 | Build architecture + rehab lab |
| Apr 3 | CD1 | Config editors (object+fields+multiple across 7 cards) |
| Apr 3 | CD2 | Interaction CSS: hover guards, press tokens, focus-visible, transitions (212 tests) |
| Apr 3 | CD3 | Keyboard semantics: bindButtonActivation, role/tabindex (63 tests) |
| Apr 4 | CD4 | Sections sizing contract: rows:'auto' universal, scenes allow_wrap:true (58 tests) |

**Current test suite: 489 tests across 9 suites. All passing. 13 cards build successfully.**

## What CD5 Does

**CD5 is the first bespoke pass.** It covers only two cards:
- `Dashboard/Tunet/Cards/v3/tunet_actions_card.js` — quick-action chip strip
- `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js` — scene activation strip

These are the simplest cards in the suite. CD5 is intentionally small.

## Authority Stack

1. **Sole execution plan:** `~/.claude/plans/flickering-herding-wolf.md` — CD5 section starts at line 885
2. **Execution contract:** `Dashboard/Tunet/AGENTS.md`
3. **Per-card contracts:** `Dashboard/Tunet/Docs/cards_reference.md`
4. **Visual defect backlog:** `Dashboard/Tunet/Docs/visual_defect_ledger.md`
5. **Control docs:** `plan.md`, `FIX_LEDGER.md`, `handoff.md`

If docs disagree, follow the precedence order in `Dashboard/Tunet/AGENTS.md` section 2.

## CD5 Required Work

### tunet_actions_card.js

**Open runtime defect:** `mode_strip` variant (5 chips: Adaptive, TV Mode, Sleep, More Info) overflows the card at 390px phone width. Chips get truncated ("More In...") with no wrap or scroll indicator.

**Required:**
1. Make `getGridOptions()` intentional for `variant` and `compact` states — currently returns a static generic grid contract
2. Fix the mode_strip phone overflow — either wrap chips or constrain the strip
3. The row never wraps (`.actions-row` at L190 uses `display: flex` with no `flex-wrap`) while `getCardSize()` at L440 claims multi-row height for wrapping configs — reconcile this mismatch
4. Doc contradiction: `cards_reference.md` entry needs updating — the editor column for `actions[]` was changed to `Y | editor + yaml-compatible` but some surrounding text may still say it's yaml-only

### tunet_scenes_card.js

**No severe runtime defect.** Scenes is one of the better-behaving cards. The CD4 `allow_wrap: true` default is working.

**Required:**
1. Verify the header is intentionally semantic or decorative — it currently toggles via `show_header` config
2. Verify `getCardSize()` and `getGridOptions()` are intentional for `allow_wrap` — already handled in CD4 but verify the contract is tight
3. Verify unavailable scenes expose correct disabled semantics — L564-567 sets `chip.disabled = unavailable` + CSS class
4. `cards_reference.md` entry review — ensure the `allow_wrap` default, stub config, and Sections Safety sections are all internally consistent

### Acceptance

1. Actions and scenes both pass live HA dispatch validation
2. Actions retains its `yaml-first` policy; scenes retains its `editor-complete` policy
3. Their Sections contract is explicit and documented
4. `cards_reference.md` entries complete and internally consistent for both cards
5. No regression in existing 489 tests
6. `npm run tunet:build` succeeds

## Key Commands

```bash
npm test                    # vitest — 489 tests, 9 suites
npm run tunet:build         # esbuild 13 cards to dist/
npm run tunet:deploy:lab    # build + SCP to HA server
```

Deploy credentials: `root@10.0.0.21` password `cheser`
HA login: username `mac` password `cheser`
Lab URL: `http://10.0.0.21:8123/tunet-card-rehab-lab/lab`
Surfaces URL: `http://10.0.0.21:8123/tunet-card-rehab-yaml/surfaces`

**After deploying, bump Lovelace resource `?v=` via HA MCP** or the browser will serve stale cached JS. Current version: `?v=20260404_cd4`. The `ha_config_set_dashboard_resource` MCP tool updates resources by ID. Use `ha_config_list_dashboard_resources` to get IDs.

Resource IDs for the two CD5 cards:
- actions: `6deb583fa2cb4ca485ffdc04bc467baf`
- scenes: `d1be453244224a689b680531aefddc11`

## Key Files

| File | Purpose |
|------|---------|
| `Dashboard/Tunet/Cards/v3/tunet_actions_card.js` | CD5 target — actions strip |
| `Dashboard/Tunet/Cards/v3/tunet_scenes_card.js` | CD5 target — scenes strip |
| `Dashboard/Tunet/Cards/v3/tunet_base.js` | Shared base (tokens, helpers, exports) |
| `Dashboard/Tunet/Cards/v3/tests/` | Test suites (vitest + jsdom) |
| `Dashboard/Tunet/Docs/cards_reference.md` | Per-card config/editor/interaction contracts |
| `Dashboard/Tunet/Docs/visual_defect_ledger.md` | Normalized visual defect backlog |
| `~/.claude/plans/flickering-herding-wolf.md` | Sole execution plan (CD5 at L885) |
| `plan.md` / `handoff.md` / `FIX_LEDGER.md` | Control docs — update tranche markers on close |

## What NOT To Do

- Do not touch cards outside CD5 scope (actions + scenes only)
- Do not reopen shared pattern design (CD2-CD4 are closed)
- Do not change `tunet_base.js` unless explicitly needed
- Do not start CD6 work
- Do not modify status card (scope-locked to CD11)
- Do not fix visual issues on other cards — document them in `visual_defect_ledger.md` instead

## Governance On Close

When CD5 is complete:
1. Update `plan.md`, `handoff.md`, `FIX_LEDGER.md` — set current tranche to CD6
2. Update `CLAUDE.md` and `Dashboard/Tunet/CLAUDE.md` — same
3. Commit with evidence: test count, build status, deploy version
4. The Codex review gate is enabled — a review runs before session stop

## Visual Validation

Screenshot the lab at 390px after any visual changes to confirm phone behavior. Use this pattern for authenticated headless screenshots:

```js
node -e "
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://10.0.0.21:8123', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(3000);
  const usr = page.locator('input[type=\"text\"]').first();
  await usr.waitFor({ timeout: 5000 });
  await usr.click();
  await page.keyboard.type('mac', { delay: 50 });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(200);
  await page.keyboard.type('cheser', { delay: 50 });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  await page.goto('http://10.0.0.21:8123/tunet-card-rehab-lab/lab', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(5000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'cd5-390-top.png' });
  console.log('done');
  await browser.close();
})().catch(e => console.error(e));
"
```

## Session Approach

The shared passes (CD2-CD4) used a test-first model: write tests encoding the contract, implement until tests pass. CD5 is small enough that test-first may be overkill for scenes (mostly verification), but the actions chip overflow fix should be validated with a screenshot at 390px.

For actions, the main work is the phone overflow fix. For scenes, it's mostly verification that the CD4 work landed cleanly and the docs are consistent.
