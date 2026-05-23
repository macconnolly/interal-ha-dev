# Tranches 8 + 9 — Popup Card_Mod Sizing + Nav Card Integration

**Created:** 2026-05-23 5:50pm post-ultrathink decision
**Predecessor:** sub-agent research at `/tmp/.../ab7bd332dc0cac24b.output` evaluating both `lovelace-navbar-card` and the existing `tunet-nav-card`
**Decision context:**
- MEMORY.md #13157 (2026-05-23 5:47pm): "Nav decision was already made — Custom tunet-nav-card, NOT lovelace-navbar-card"
- Mar 5 2026 lock: "All custom Tunet cards KEPT" (no hybrid pivot)
- Mac's 5:50pm directive: try tunet-nav-card first, agree with popup card_mod style on desktop
- `lovelace-navbar-card` already installed via HACS — kept available as a fallback if tunet-nav-card feature gaps frustrate Mac during real use

## Maturity comparison summary

`tunet-nav-card` (562 lines, last touched Apr 2-3) HAS: vanilla shadow DOM, responsive auto-switch via `desktop_breakpoint`, active-tab matching, tap/hold actions, visual editor via `getConfigForm()`, global CSS view-margin injection, default + custom items.

`tunet-nav-card` MISSING vs lovelace-navbar-card: badge support, popup submenus, JSTemplate routes, top/floating position options.

Known scope-deferred (CD10): desktop sidebar coexistence + offset leakage — was deferred when surface composition was uncertain; now settled (50/50 LEFT/RIGHT). Re-test as part of Tranche 9.

## Risk-symmetric decision

Cost of trying tunet-nav-card first: ~30 min config + deploy.
Cost of skipping straight to lovelace-navbar-card: ~30 min config + deploy.
Cost of being wrong (need to swap): ~30 min config + deploy in either direction.

Since the prior lock favors tunet-nav-card AND the cost is symmetric, ship the locked direction first. Empirical evidence from Mac's daily use will surface whether the feature gaps matter.

## Tranche 8 — Popup card_mod desktop sizing (XS, ~30-45 min)

### Goal
Make Bubble Card popups feel like iOS sheets on desktop while preserving the existing phone behavior.

### Edits
- Define `&popup_style` YAML anchor at top of `Dashboard/Tunet/tunet-home-preview-config.yaml`:

```yaml
popup_card_mod: &popup_style
  style: |
    ha-card {
      border-radius: 24px 24px 0 0 !important;
      padding-bottom: env(safe-area-inset-bottom) !important;
      transition: transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      min-height: 85vh !important;
    }
    ha-card::before {
      content: ''; position: absolute; top: 8px; left: 50%;
      transform: translateX(-50%);
      width: 36px; height: 5px; border-radius: 3px;
      background: rgba(255,255,255,0.4); pointer-events: none;
    }
    @media (min-width: 768px) {
      ha-card {
        max-width: 980px !important;
        min-width: 720px !important;
        margin-left: auto !important;
        margin-right: auto !important;
        border-radius: 24px !important;
        min-height: 78vh !important;
        max-height: 86vh !important;
        box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.25) !important;
      }
      ha-card::before { display: none; }
    }
    @media (min-width: 1440px) {
      ha-card { max-width: 1100px !important; }
    }
```

- For each of the 8 existing popup definitions (rooms living/kitchen/dining/bedroom/office + media + oal-detail + alarm-edit), replace inline `card_mod.style` with `card_mod: *popup_style`
- Raise `width_desktop: 720px` → `75vw` and `margin_top_desktop: 3vh` → `7vh`

### Deploy
```bash
npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview
```
(Scoped per master plan §9.2.)

### Verify (M1)
- Capture each popup at 390×844 + 1440×900 light theme, read inline
- Specifically watch `#oal-detail` for "looks hollow at 78vh" risk
- Watch for `box-shadow` clip if `.bubble-pop-up` has `overflow: hidden`

### Risks
- Sparse popup (#oal-detail) may look hollow on desktop
- Refactoring touches all 8 popups — capture before/after to verify phone behavior didn't regress
- Box-shadow clip if container hides overflow

### `/goal` prompt

```
/goal Make Bubble Card popups feel like iOS sheets on desktop while preserving the existing phone behavior. Define a YAML anchor &popup_style at the top of Dashboard/Tunet/tunet-home-preview-config.yaml carrying the card_mod CSS from this plan's Tranche 8 snippet (border-radius all-corners on desktop, max-width 980px capped, min-width 720px, min-height 78vh, max-height 86vh, drop shadow, grabber hidden on desktop, ultrawide bump to 1100px at 1440px+). Replace the inline card_mod.style block on each of the 8 existing popup definitions (rooms living/kitchen/dining/bedroom/office + media + oal-detail + alarm-edit) with card_mod: *popup_style. Raise width_desktop from 720px to 75vw and margin_top_desktop to 7vh on each popup. Deploy with npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview (scoped per master plan §9.2). Verify per M1: capture each popup at 390x844 + 1440x900 light theme, read inline; specifically watch the #oal-detail popup for the "looks hollow at 78vh" risk the sub-agent flagged. Awaiting-stamp.
```

---

## Tranche 9 — tunet-nav-card integration (S, ~1-1.5h)

### Goal
Drop `tunet-nav-card` into `/tunet-home-preview/home` and `/tunet-home-preview/stats` so Mac has a persistent bottom dock on phone and a left rail on desktop.

### Edits
- Define `&nav_card` YAML anchor at top of `Dashboard/Tunet/tunet-home-preview-config.yaml`:

```yaml
nav_card: &nav_card
  type: custom:tunet-nav-card
  home_path: /tunet-home-preview/home
  media_path: /tunet-home-preview/home#media-living-room  # hash to Bubble popup
  desktop_breakpoint: 900
  desktop_left_offset: 96
  mobile_bottom_offset: 80
  items:                                                  # custom items override defaults
    - { key: home, label: Home, icon: mdi:home, path: /tunet-home-preview/home }
    - { key: media, label: Media, icon: mdi:speaker, path: /tunet-home-preview/home, tap_action: { action: navigate, navigation_path: '#media-living-room' } }
    - { key: stats, label: Stats, icon: mdi:chart-line, path: /tunet-home-preview/stats }
    - { key: settings, label: Settings, icon: mdi:cog, path: /tunet-home-preview/home, tap_action: { action: navigate, navigation_path: '#oal-detail' } }
```

- Reference `*nav_card` once in each view inside its own grid section:

```yaml
- title: Home
  path: home
  type: sections
  max_columns: 2
  sections:
    # ... existing actions/status/lighting/rooms/climate/etc. sections ...
    - type: grid
      column_span: 2
      cards:
        - *nav_card

- title: Stats
  path: stats
  type: sections
  max_columns: 2
  sections:
    # ... existing stats sections ...
    - type: grid
      column_span: 2
      cards:
        - *nav_card
```

### HA sidebar handling
- **Preferred**: Kiosk Mode (HACS) scoped to `tunet-home-preview` — hides the sidebar entirely so the dock is the only nav chrome. Check via `ha_hacs_list_installed` whether Kiosk is installed; if yes, configure via `lovelace_kiosk` settings; if no, leave sidebar visible v1 and add Kiosk in a follow-up tranche.
- **DO NOT** use `panel: true` per-view — that disables Sections layout, breaks the 50/50 split.

### Deploy
```bash
npm run tunet:deploy:dashboards:storage -- --dashboard tunet-home-preview
```

### Verify (M1)
- Phone (390×844): dock appears at bottom, Home tab highlights
- Desktop (1440×900): rail appears on left, content offsets correctly via the card's global CSS injection
- Specifically test the CD10 deferred items: desktop sidebar coexistence + offset leakage. If the offset injection misbehaves (content scrolling under the rail, or sidebar overlap), document in `visual_defect_ledger.md` and decide whether to fix in this tranche or defer

### Risks
- CD10 desktop sidebar coexistence may resurface (deferred since surface composition was uncertain — now testable)
- No badge support means Media tab doesn't pulse when something is playing — Mac may want this added later
- No popup submenu means Rooms isn't a single nav target — left out of nav v1; Mac uses room chips on home page instead
- Global CSS injection (`document.head.appendChild(style)`) is a side effect on the entire dashboard, not just this card — verify it doesn't conflict with other cards' margin/padding

### Fallback path
If Mac uses for a few days and finds feature gaps (badges, popup submenus), evaluate either:
- (a) extending `tunet-nav-card` to add the missing features (S-M effort, custom code)
- (b) swapping to `lovelace-navbar-card` (already HACS-installed; ~30 min swap effort; lose custom visual editor but gain badges + submenus)

### `/goal` prompt

```
/goal Drop tunet-nav-card into /tunet-home-preview/home and /tunet-home-preview/stats so Mac has a persistent bottom dock on phone and a left rail on desktop. Define a YAML anchor &nav_card at the top of Dashboard/Tunet/tunet-home-preview-config.yaml with type: custom:tunet-nav-card, home_path: /tunet-home-preview/home, media_path: /tunet-home-preview/home#media-living-room (hash routing into existing Bubble popup), desktop_breakpoint: 900, and custom items[] for Home/Media/Stats/Settings (defaults assume per-room subviews which we don't have yet). Reference *nav_card once in each view inside its own column_span: 2 cards: grid section at the BOTTOM of the view. Hide HA's default sidebar via Kiosk Mode (HACS) scoped to /tunet-home-preview if Kiosk is installed (check via ha_hacs_list_installed); if not installed, leave the sidebar visible v1 and add Kiosk in a follow-up. Verify: refresh /tunet-home-preview/home on phone — dock appears at bottom, Home tab highlights; refresh on desktop — rail appears on left, content offsets correctly via the card's global CSS injection. Specifically retest the CD10-deferred desktop sidebar coexistence + offset leakage items (deferred since surface composition was uncertain — now testable). M1 capture at 390x844 + 1440x900 light theme. Awaiting-stamp; if Mac uses for a few days and finds feature gaps (badge support for Media, popup submenu for Rooms), revisit by either extending tunet-nav-card OR swapping to the HACS-installed lovelace-navbar-card.
```

---

## Sequencing recommendation

Tranche 8 first (XS, single-yaml change, immediate desktop win on existing popups), then Tranche 9 (S, requires Kiosk decision + offset-leakage retest). Both can fit into one sitting (~1.5-2h total).

If batched, the deploys overlap on the same yaml so only one `npm run tunet:deploy:dashboards:storage` call is needed.

## Cross-references

- Master plan T1.6: `docs/plans/hvac-stats-and-oal-mode-reset-fixes-2026-05-23.md`
- Sub-agent's full research: archived in session transcript at `/tmp/.../ab7bd332dc0cac24b.output`
- Audit: `docs/audits/tunet-home-v2-audit-2026-05-23.md` §1 prior variant analysis
- Memory: tunet-nav-card decision at MEMORY observation #13157
