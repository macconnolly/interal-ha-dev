# T-005 - Custom Nav Chrome Recovery POC

### TRANCHE_ID
- `T-005`

### TITLE
- `Bring the custom Tunet nav bar back as an intentional product surface instead of a sidelined POC forced into mobile-dock behavior`

### STATUS
- `PLANNED / USER-LOCKED NEXT`

### SOURCE_ITEMS
- `tranche_queue.md: T-005`
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/CLAUDE.md`
- `plan.md: user-locked next decision order`
- `Dashboard/Tunet/Docs/nav_popup_ux_direction.md`

### GOAL
- Re-establish the custom Tunet nav as a first-class design decision with one working, visible, premium-feeling POC that can become the real directional baseline for the suite.

### WHY_NOW
- The user explicitly wants the next four decisions handled one at a time, together, in this order: nav, popup, integrated UI/UX, home layout.
- The custom nav bar already exists, but the current branch effectively hides the real intended behavior by forcing mobile-dock mode everywhere.
- Future popup behavior, shell polish, and home-layout decisions should be made in the context of the actual navigation model, not a temporary placeholder.

### USER_VISIBLE_OUTCOME
- Desktop finally shows a real side-rail or otherwise intentional non-mobile nav treatment instead of a forced phone dock.
- Mobile/tablet nav remains deliberate and polished rather than feeling like a fallback.
- The nav becomes a product surface the user can react to visually before popup, shell, and home-layout decisions are layered on top.
- The nav begins carrying tiny, high-value live-state affordances where appropriate, rather than acting like a dead route strip.

### FILES_ALLOWED
- `Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- `Dashboard/Tunet/tunet-suite-storage-config.yaml`
- `Dashboard/Tunet/tunet-suite-config.yaml`

### FILES_FORBIDDEN_UNLESS_BLOCKED
- `Dashboard/Tunet/Cards/v2/tunet_actions_card.js`
- lighting card files
- popup / Browser Mod wiring
- page-shell / background extraction work
- broad overview layout recomposition

### CURRENT_STATE
- The custom nav bar exists and is deployed, but the current storage/dashboard configs effectively force mobile-style behavior everywhere via an extreme `desktop_breakpoint`.
- The nav is present in the dashboard, but it is not currently demonstrating the intended phone/tablet/desktop experience that motivated the card in the first place.
- The user wants this elevated ahead of popups, shell polish, and home layout because it is a major product decision, not a minor follow-up.

### INTENDED_STATE
- The nav has a deliberate behavior split across device classes rather than a placeholder "mobile everywhere" mode.
- The nav visibly communicates the intended Tunet direction: premium chrome, stable affordances, and a real foundation for later popup and layout work.
- This tranche produces one working nav baseline, not a half-hidden POC.

### EXACT_CHANGE_IN_ENGLISH
- Revisit the storage and YAML dashboard nav configuration so the custom nav actually demonstrates the intended responsive model instead of being effectively pinned to mobile behavior.
- Decide and implement the smallest viable premium nav baseline:
  - bottom dock on phone
  - intentional desktop treatment on wide screens
  - tiny live-state details where they add clear value, such as a subtle playback indicator when media is active
  - no fake "temporary" breakpoint hacks left in place
- Make only the nav and dashboard wiring changes needed to show a real navigation direction.
- Do not mix popup redesign, actions-strip redesign, or full home-layout changes into this tranche.

### ACCEPTANCE_CRITERIA
- The nav is no longer configured with a placeholder breakpoint that forces mobile behavior everywhere.
- On desktop, the nav visibly presents as a deliberate desktop treatment rather than a phone dock.
- On phone-sized widths, the nav still behaves as a bottom dock.
- At least one tiny live-state affordance is proven if it can be added cleanly without turning nav into a mini-dashboard.
- The work stays scoped to nav chrome and dashboard wiring.
- Popup behavior, shell polish, and home layout remain unchanged in this tranche.

### VALIDATION

#### Static validation
- `node --check Dashboard/Tunet/Cards/v2/tunet_nav_card.js`
- diff confined to nav card and dashboard config only

#### Runtime validation
- confirm the nav still registers and renders without custom-element or console errors
- confirm dashboard config remains valid in HA

#### HA/live validation
- hard refresh the storage overview and at least one room subview
- verify desktop shows the intended non-mobile nav treatment
- verify phone-sized width still shows the bottom dock treatment
- verify nav active state still works across Overview / subviews / Media / Rooms surfaces

### DEPLOY_IMPACT
- `HA RESOURCE UPDATE`
- `HA DASHBOARD UPDATE`
- one JS file may need redeploy plus dashboard config updates

### ROLLBACK
- restore nav card config and JS from git
- redeploy prior resource version if needed
- reset any temporary breakpoint experimentation to the last known-good state if the new nav treatment is not stable

### DEPENDENCIES
- branch must be `claude/dashboard-nav-research-QnOBs`
- live HA must already load the nav card from `/local/tunet/v2_next/tunet_nav_card.js`
- storage dashboard must still include `custom:tunet-nav-card`

### UNKNOWNS
- Whether the best desktop treatment is a side rail immediately, or an intermediate wider dock that still reads as deliberate.
- Which tiny live-state affordance is the highest-value first proof:
  - now-playing indicator
  - small media glyph
  - other subtle status hint
- Whether any current global offset behavior in `tunet_nav_card.js` must be revisited immediately to support the recovered desktop treatment cleanly.

### STOP_CONDITIONS
- Stop if this turns into popup work.
- Stop if this turns into broad shell / atmosphere work.
- Stop if this turns into redoing the whole overview layout.
- Stop if a proper nav recovery would require touching more than the nav card and dashboard-level nav wiring in this tranche.

### OUT_OF_SCOPE
- Browser Mod popup migration
- actions strip redesign
- V1 page-shell / blue atmosphere recovery
- home overview hero redesign
- lighting-card internal density changes
- broad layout recomposition
- full nav mini-player productization unless it is required to make the nav baseline feel coherent

### REVIEW_FOCUS
- Did the work actually recover the intended nav direction, or just tweak a breakpoint without making the nav feel intentional?
- Did the work stay scoped to nav chrome and nav wiring?
- Did it avoid silently doing popup, shell, or layout work?
- Is the resulting nav baseline good enough to serve as the foundation for the next popup tranche?
