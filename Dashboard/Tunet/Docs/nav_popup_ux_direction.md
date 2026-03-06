# Tunet Nav / Popup / Interaction Direction

Working branch: `codex/unified-microinteractions`
Purpose: capture the currently locked product direction for nav, popups, and interaction language so future implementation tranches stop drifting back toward generic dashboard behavior.

## Product Standard

Tunet should follow an Apple-grade interaction standard:

- one-touch access to primary actions
- minimal cognitive load
- live state shown in chrome where useful
- dense but intentional information hierarchy
- polished overlays that feel like system surfaces, not ad-hoc cards

This does **not** mean copying Apple visuals literally.
It means matching the interaction quality bar:

- immediate legibility
- obvious touch targets
- high-value first actions
- progressive disclosure for deeper control
- no awkward or decorative-only UI affordances

## Nav Direction (Locked)

The custom `tunet-nav-card` remains the navigation foundation.

The nav is not just a route switcher. It should become a lightweight live-state surface.

### Required nav qualities

- phone: bottom dock
- desktop: intentional non-mobile treatment, ideally side rail
- stable route highlighting
- premium chrome, not generic HA footer behavior
- compact live-state affordances that add value without turning the nav into a mini dashboard

### Desirable nav affordances

- subtle "now playing" indicator when any primary media entity is active
- small per-destination state hints when they are meaningful
- tiny iconography or dots for active playback / alerts / notable state
- no clutter that harms scannability

### Nav anti-goals

- do not turn nav into a full media card
- do not bury primary routing inside decorative UI
- do not keep the current effectively-mobile-everywhere configuration as the baseline

## Popup Direction (Locked)

Popup direction is now:

- one popup per room
- Browser Mod preferred
- styled like an iOS-grade sheet / overlay
- minimal and high utility

### Required popup qualities

- one popup per room, not one popup system per widget
- quick action value in under one interaction
- clear route to the fuller room surface
- visually polished overlay presentation
- feels intentional and premium

### Room tile gesture lock (2026-03-06)

- `tap` on room tile: toggle that room's lights (primary one-touch action)
- `hold` on room tile: open Browser Mod popup for that room
- room page navigation: provided by the persistent nav bar (not required as a room-tile gesture)

### Styling direction

- iOS-style sheet / overlay feeling
- no lazy default styling
- no generic pill grabber
- no visibly placeholder card stacks
- polished spacing, radius, depth, and typography

### Popup content direction

Each room popup should be intentionally narrow in scope:

- quick actions
- one primary interaction surface
- route to deeper room view

Do not treat popups as a place to duplicate the full room page.

## Utility Band Direction (Locked)

The overview utility band is now a dual-strip surface:

- strip 1: `actions` (system/mode controls)
- strip 2: `scenes/chips` (preset triggers)

Design intent:

- both strips stay compact and full-width
- both strips remain one-touch first
- scenes do not replace actions; they complement them
- utility strips should feel dense and intentional, not like decorative filler

## Room-Surface Direction

After nav and popup direction are settled:

- per-room cards can become richer
- Sonos / media popups can follow the same premium overlay language
- room-level interactions should follow the same one-touch-first standard

## Sections Interpretation

Sections decisions are not only about size.

They are about:

- what each surface does
- how much attention it deserves
- how quickly it exposes the primary action
- how much width it needs for clarity and control
- whether it belongs in overview, popup, subview, or chrome

### Sections principles for Tunet

- width is functional, not decorative
- hero surfaces should earn their width through interaction value
- supporting surfaces should not pretend to be heroes
- do not create one-card-per-section vertical stacks unless the hierarchy truly calls for it
- choose placement based on interaction role, not just card dimensions
- avoid hard card-level width caps by default; use documented exceptions only

## One-Touch Standard

Primary actions should usually require one touch from the current surface:

- toggle / activate
- open the most relevant next layer
- reveal quick controls

Secondary and deeper actions may take two touches, but only after the primary action is obvious.

## Immediate Implication For Tranche Order

The next four major product decisions remain:

1. nav
2. popup
3. integrated UI / UX shell
4. home layout

This file exists to make those four decisions directionally consistent.
