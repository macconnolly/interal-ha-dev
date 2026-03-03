# T-005 - Premium Nav Product Surface POC

### TRANCHE_ID
- `T-005`

### TITLE
- `Make the custom Tunet nav the first real premium product surface, not a hidden breakpoint experiment`

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
- Re-establish the custom Tunet nav as the first visible, credible product decision in the suite: a premium chrome surface that communicates direction, state, and confidence before popup, shell, and home-layout work continue.

### WHY_NOW
- The user explicitly wants the next four decisions handled one at a time, together, in this order: nav, popup, integrated UI/UX, home layout.
- The custom nav bar already exists, but the current branch hides the intended behavior behind effectively-mobile-everywhere configuration.
- Future popup behavior, shell polish, and home-layout decisions should be made in the context of a believable navigation model, not a temporary placeholder.
- The point of this tranche is not merely to fix responsiveness. It is to prove the dashboard can carry a premium control-chrome language at all.

### USER_VISIBLE_OUTCOME
- Desktop shows a real non-mobile navigation treatment that reads as intentional product chrome, not a stretched phone dock.
- Phone still uses a bottom dock that feels deliberate and stable.
- The nav stops feeling like inert routing furniture and starts feeling like part of the intelligent environment.
- At least one tiny live-state affordance is present and useful, proving that nav can communicate system state without becoming content-heavy.
- The nav is simple enough that a daily user who did not build the dashboard can understand it immediately and trust it on repeated use.

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
- The custom nav bar exists and is deployed, but the current storage/dashboard configs effectively force mobile-style behavior almost everywhere via an extreme `desktop_breakpoint`.
- The nav is present, but it does not currently demonstrate the intended side-rail / dock split or the premium product quality that justified building a custom card.
- The user wants this elevated ahead of popups, shell polish, and home layout because nav is a foundational product decision, not a cleanup item.

### INTENDED_STATE
- The nav has a deliberate behavior split across device classes rather than a placeholder "mobile everywhere" mode.
- The nav visibly communicates the intended Tunet direction: premium chrome, stable affordances, light live state, and a real foundation for later popup and layout work.
- This tranche produces one working nav baseline the user can judge as a product surface, not a half-hidden POC.

### EXACT_CHANGE_IN_ENGLISH
- Revisit the storage and YAML dashboard nav configuration so the custom nav actually demonstrates the intended responsive model instead of being effectively pinned to mobile behavior.
- Implement the smallest viable premium nav baseline:
  - bottom dock on phone
  - intentional desktop treatment on normal desktop widths
  - at least one tiny live-state cue with real value, most likely on Media
  - no fake "temporary" breakpoint hacks left in place
- Keep the nav visually quiet but unmistakably intentional.
- Make only the nav and dashboard wiring changes needed to show a real navigation direction.
- Do not mix popup redesign, actions-strip redesign, shell recovery, or full home-layout changes into this tranche.

### ACCEPTANCE_CRITERIA
- The nav is no longer configured with a placeholder breakpoint that forces mobile behavior everywhere.
- On desktop, the nav visibly presents as a deliberate desktop treatment rather than a phone dock.
- On phone-sized widths, the nav still behaves as a bottom dock.
- At least one tiny live-state affordance is present and clearly legible without turning nav into a mini-dashboard.
- The result feels like premium chrome, not just corrected breakpoint logic.
- The first action and current location are obvious without explanation.
- The result is credible for repeated family use, not just technically correct for the builder.
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
- verify a non-builder can identify current location and primary destinations without explanation

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
- Whether the best desktop treatment is the full side rail immediately, or an intermediate wider dock that still reads as deliberate.
- Which tiny live-state affordance is the highest-value first proof:
  - now-playing indicator
  - small media glyph
  - other subtle status hint
- Whether the current global offset behavior in `tunet_nav_card.js` must be revisited immediately to support a credible desktop treatment.

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
- Did the work actually recover the intended nav direction, or just tweak a breakpoint without making the nav feel like product chrome?
- Did the work stay scoped to nav chrome and nav wiring?
- Did it avoid silently doing popup, shell, or layout work?
- Is the resulting nav baseline good enough to serve as the foundation for the next popup tranche?
