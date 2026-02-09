# Popup & Expand Architecture — Complete Implementation Guide

## Interaction Depth Analysis

Every control surface on this card has an "interaction depth" — the number of gestures required to reach it from the default resting view. The architectural principle is: **interaction depth must be proportional to task duration.**

```
Depth 0: Read state from tile faces (zero gestures)
Depth 1: One drag or tap (light brightness, light toggle)
Depth 2: One tap to reveal + one interaction (open surface → act)
Depth 3: One tap to reveal + multiple interactions + dismiss (focused session)
```

### Control-to-Depth Mapping

| Control | Current Depth | Task Duration | Correct Depth |
|---------|---------------|---------------|---------------|
| Read light states | 0 | 0s (glance) | 0 ✓ |
| Adjust one light brightness | 1 (drag tile) | 1–2s | 1 ✓ |
| Toggle one light | 1 (tap tile) | <1s | 1 ✓ |
| All lights off | 2 (open popup → tap) | <1s | **1** — too deep |
| Reset manual overrides | 2 (open popup → tap) | <1s | **1** — too deep |
| Brighten / Dim all | 2 (open popup → tap) | <1s | **1** — too deep |
| Room brightness slider | 2 (open popup → drag) | 2–3s | 2 ✓ |
| Movie mode | 2 (open popup → tap) | <1s | 2 (acceptable — rare) |
| Sonos volume | 2 (open popup → drag) | 2–5s | 2 ✓ |
| Sonos transport | 2 (open popup → tap) | 1–2s | 2 ✓ |
| Speaker grouping | 2 (open popup → tap) | 3–10s | 2 ✓ |

**The problem:** Four single-tap atomic actions (all off, reset manual, brighten, dim) are buried behind a popup open → scroll → tap → dismiss sequence. That's 3 gestures minimum for a 1-gesture task. On a wall-mounted tablet, this friction compounds — you reach up to hit the gear, wait for the sheet to animate, find the button, tap it, then dismiss. For something you do multiple times a day, this is architecturally wrong.

**The solution:** A **three-tier progressive disclosure** model:

```
Tier 1: Main card face
  └── Individual light control (drag/tap on tiles)
  └── Media status (glanceable)
  └── Context chips (alarm, temp, presence, timer)

Tier 2: Inline quick-action row (one tap to reveal, no overlay)
  └── All Off / All On (chip)
  └── Reset Manual (chip, conditional)
  └── Brighten + / Dim − (chips)
  └── Appears between separator and light grid
  └── Collapses on second tap or after action

Tier 3: Bottom sheet popup (tap to open, dedicated surface)
  └── Settings sheet (hold gear): Room slider, movie mode, OAL config
  └── Sonos sheet (tap Sonos tile): Now playing, transport, volume, grouping
```

This means:
- **Tap gear** → inline chip row toggles open/closed (Tier 2)
- **Hold gear** → full settings bottom sheet opens (Tier 3)
- **Tap Sonos** → Sonos bottom sheet opens (Tier 3)

---

## Architecture Decision: Why Hybrid Wins

### Inline expand for quick actions

**Pros:**
- Keeps interaction local — your finger stays near where it was
- No overlay to dismiss, no backdrop interference
- On wall-mounted tablets, no need to reach for a close target
- Single-row height (~40px) causes minimal viewport displacement
- Actions fire immediately — one tap, done
- The row can auto-collapse after action (optional)

**Cons:**
- Pushes light grid down slightly when open
- HA's `conditional` card removes DOM elements (no native exit animation)
- Requires an `input_boolean` helper to track expand state

**Mitigation for cons:**
- The row is only ~40px tall. On a dashboard card that's ~500px, this is <10% displacement. Acceptable.
- The animation problem is solved by keeping the card permanently in the DOM and using card-mod CSS transitions on `max-height`, `opacity`, and `padding` rather than conditional card removal. This is the critical implementation detail — see Section 2 below.
- The `input_boolean` helper is trivial and adds no meaningful complexity.

### Bottom sheet popup for Sonos and deep settings

**Pros:**
- Gives Sonos controls a dedicated canvas — 400px wide, full-height
- Album art, transport controls, volume slider, speaker grouping all get proper space
- Bottom sheet is the native iOS pattern for media control surfaces
- Overlay creates focus — when you're adjusting volume, you don't need to see the light grid
- Deep-linkable via URL hash (`#living-room-sonos`)

**Cons:**
- Requires dismissal gesture (tap backdrop / swipe down)
- On wall-mounted tablets, backdrop tap can be hard to aim
- Default HA popup styling is functional but not polished

**Mitigation for cons:**
- Swipe-to-dismiss is native in Bubble Card pop-ups (the handle bar isn't just decorative)
- `close_on_click: true` means tapping anywhere outside the sheet dismisses it
- All styling gaps are closable with card-mod CSS — see Section 3 below

---

## Required Helpers

```yaml
# configuration.yaml or UI helpers
input_boolean:
  living_room_quick_actions:
    name: Living Room Quick Actions Expanded
    icon: mdi:chevron-down
```

This boolean tracks whether the inline chip row is expanded. It resets automatically when HA restarts (default `off`). No automation needed — the gear button toggles it directly.

---

## Section 1: Gear Button Dual-Action Configuration

The gear sub-button on the separator now has two behaviors: tap for inline expand, hold for full settings sheet.

```yaml
# Inside the separator card definition
sub_button:
  - icon: mdi:cog
    show_background: true
    tap_action:
      action: call-service
      service: input_boolean.toggle
      target:
        entity_id: input_boolean.living_room_quick_actions
    hold_action:
      action: navigate
      navigation_path: '#living-room-settings'
    card_mod:
      style: |
        /* ── Gear button base styling ── */
        :host {
          position: absolute !important;
          right: 12px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
        }
        .bubble-sub-button-container {
          width: 42px !important;
          height: 42px !important;
          border-radius: 13px !important;
          background: var(--ha-card-background, rgba(255,255,255,0.05)) !important;
          border: 1.5px solid rgba(255,255,255,0.06) !important;
          transition: all 0.2s ease !important;
          opacity: 0.85;
        }
        /* Active state — rotates gear slightly when expanded */
        {% if is_state('input_boolean.living_room_quick_actions', 'on') %}
        .bubble-sub-button-container {
          background: rgba(255,149,0,0.10) !important;
          border-color: rgba(255,149,0,0.15) !important;
          opacity: 1 !important;
        }
        .bubble-sub-button-icon {
          transform: rotate(60deg);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1) !important;
          color: #ff9500 !important;
        }
        {% else %}
        .bubble-sub-button-icon {
          transform: rotate(0deg);
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1) !important;
          --mdc-icon-size: 18px;
          color: rgba(255,255,255,0.45) !important;
        }
        {% endif %}
```

**Design detail:** When the quick-action row is expanded, the gear icon rotates 60° and the button background shifts to amber tint. This provides clear visual feedback that a panel is open, and creates an implicit "tap again to close" affordance. The rotation uses the same spring-like cubic-bezier as the popup animations for consistency.

---

## Section 2: Inline Quick-Action Row (Complete Implementation)

This is the most technically nuanced part of the entire card. The goal: a single row of action chips that smoothly expands between the separator and the light grid, without using HA's `conditional` card (which removes elements from the DOM and prevents CSS animation).

### 2.1 The Animation Problem and Solution

**The problem:** Home Assistant's `conditional` card destroys the DOM element when the condition is false. You cannot CSS-transition an element that doesn't exist. The card appears/disappears instantly — no slide, no fade, just a hard cut. This feels broken.

**The solution:** Keep the card permanently in the DOM. Use a `mushroom-chips-card` that is always rendered, but use card-mod's Jinja2 template to apply collapsed styles when the `input_boolean` is off. The CSS `transition` property handles the animation between collapsed and expanded states.

**Why this works:** card-mod re-evaluates Jinja2 templates when entity states change. When `input_boolean.living_room_quick_actions` flips from `off` to `on`, card-mod updates the injected CSS, and the browser's transition engine smoothly interpolates between the old and new values.

**Critical constraint:** CSS `transition` on `height: auto` doesn't work. You must use `max-height` with a fixed value larger than the content's natural height. For a single chip row (~36px content + ~12px padding), `max-height: 60px` is sufficient. The slight overshoot is invisible because `overflow: hidden` clips it.

### 2.2 Complete YAML

```yaml
# Placed directly below the context chips, above the light grid
# inside the stack-in-card. Always in DOM. Never uses conditional card.
- type: custom:mushroom-chips-card
  alignment: start
  card_mod:
    style: |
      /* ═══════════════════════════════════════════════
         INLINE EXPAND — ANIMATION ENGINE
         Always in DOM. Collapsed by default.
         Expands when input_boolean is 'on'.
         ═══════════════════════════════════════════════ */
      ha-card {
        --chip-spacing: 5px;
        margin: 0 !important;
        background: none !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden !important;

        /* ── Transition properties ── */
        transition:
          max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.25s ease,
          padding 0.35s cubic-bezier(0.16, 1, 0.3, 1),
          margin 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;

        {% if is_state('input_boolean.living_room_quick_actions', 'on') %}
        /* ── EXPANDED ── */
        max-height: 60px;
        opacity: 1;
        padding: 2px 12px 6px 58px !important;
        pointer-events: auto;
        {% else %}
        /* ── COLLAPSED ── */
        max-height: 0px;
        opacity: 0;
        padding: 0px 12px 0px 58px !important;
        pointer-events: none;
        {% endif %}
      }

      /* Stagger-fade the individual chips for choreographed entrance */
      {% if is_state('input_boolean.living_room_quick_actions', 'on') %}
      mushroom-template-chip:nth-child(1) {
        animation: chipIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.05s both;
      }
      mushroom-template-chip:nth-child(2) {
        animation: chipIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.10s both;
      }
      mushroom-template-chip:nth-child(3) {
        animation: chipIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.15s both;
      }
      mushroom-template-chip:nth-child(4) {
        animation: chipIn 0.3s cubic-bezier(0.16,1,0.3,1) 0.20s both;
      }
      {% endif %}

      @keyframes chipIn {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
  chips:
    # ════════════════════════════
    # CHIP 1: All Off / All On
    # ════════════════════════════
    - type: template
      icon: >-
        {{ 'mdi:lightbulb-group' if is_state('light.main_living_lights', 'on')
           else 'mdi:lightbulb-group-outline' }}
      icon_color: >-
        {{ 'amber' if is_state('light.main_living_lights', 'on') else 'grey' }}
      content: >-
        {{ 'All Off' if is_state('light.main_living_lights', 'on') else 'All On' }}
      tap_action:
        action: call-service
        service: light.toggle
        target:
          entity_id: light.main_living_lights
      card_mod:
        style: |
          ha-card {
            {% if is_state('light.main_living_lights', 'on') %}
            background: rgba(255,149,0,0.10) !important;
            border: 1px solid rgba(255,149,0,0.14) !important;
            {% else %}
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            {% endif %}
            --chip-font-size: 11px;
            --chip-font-weight: 600;
            --chip-padding: 0 10px;
            --chip-height: 32px;
            --chip-border-radius: 10px;
            transition: background 0.2s ease, border-color 0.2s ease !important;
          }
          /* Pressed feedback */
          ha-card:active {
            transform: scale(0.95);
            transition: transform 0.1s ease !important;
          }

    # ════════════════════════════
    # CHIP 2: Reset Manual (Conditional)
    # ════════════════════════════
    - type: conditional
      conditions:
        - condition: template
          value: >-
            {{ state_attr('sensor.adaptive_lighting_main_living_manual_control',
               'manual_control') | default([]) | count > 0 }}
      chip:
        type: template
        icon: mdi:restore
        icon_color: red
        content: >-
          {% set n = state_attr('sensor.adaptive_lighting_main_living_manual_control',
             'manual_control') | default([]) | count %}
          Reset {{ n }}
        tap_action:
          action: call-service
          service: automation.trigger
          target:
            entity_id: automation.reset_living_room_adaptive_lighting
        card_mod:
          style: |
            ha-card {
              background: rgba(255,59,48,0.10) !important;
              border: 1px solid rgba(255,59,48,0.14) !important;
              --chip-font-size: 11px;
              --chip-font-weight: 600;
              --chip-padding: 0 10px;
              --chip-height: 32px;
              --chip-border-radius: 10px;
            }
            ha-card:active {
              transform: scale(0.95);
              transition: transform 0.1s ease !important;
            }

    # ════════════════════════════
    # CHIP 3: Brighten (+)
    # ════════════════════════════
    - type: template
      icon: mdi:brightness-5
      icon_color: amber
      content: '+'
      tap_action:
        action: call-service
        service: light.turn_on
        target:
          entity_id: light.main_living_lights
        data:
          brightness_step_pct: 15
      card_mod:
        style: |
          ha-card {
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            --chip-font-size: 13px;
            --chip-font-weight: 700;
            --chip-padding: 0 8px;
            --chip-height: 32px;
            --chip-border-radius: 10px;
            min-width: 42px;
          }
          ha-card:active {
            transform: scale(0.95);
            background: rgba(255,149,0,0.12) !important;
            transition: all 0.1s ease !important;
          }

    # ════════════════════════════
    # CHIP 4: Dim (−)
    # ════════════════════════════
    - type: template
      icon: mdi:brightness-3
      icon_color: grey
      content: '−'
      tap_action:
        action: call-service
        service: light.turn_on
        target:
          entity_id: light.main_living_lights
        data:
          brightness_step_pct: -15
      card_mod:
        style: |
          ha-card {
            background: rgba(255,255,255,0.06) !important;
            border: 1px solid rgba(255,255,255,0.06) !important;
            --chip-font-size: 13px;
            --chip-font-weight: 700;
            --chip-padding: 0 8px;
            --chip-height: 32px;
            --chip-border-radius: 10px;
            min-width: 42px;
          }
          ha-card:active {
            transform: scale(0.95);
            background: rgba(128,128,128,0.12) !important;
            transition: all 0.1s ease !important;
          }
```

### 2.3 Design Details

**Left indent (58px):** The chips row aligns with the separator title text, not the card edge. This indent clears the 46px room icon + 12px gap, creating visual continuity between the title and its child controls.

**Staggered entrance:** Each chip animates in with a 50ms stagger (0.05s, 0.10s, 0.15s, 0.20s). The `chipIn` keyframe combines a subtle upward translation (-4px → 0) with a slight scale (0.95 → 1.0) and opacity fade. This creates a cascading "cards being dealt" effect that feels intentional rather than simultaneous.

**Pressed feedback:** Every chip has an `:active` pseudo-class that scales to 0.95 with a 0.1s ease transition. This provides immediate tactile feedback that the touch registered — critical on wall-mounted dashboards where you can't always feel the screen.

**Chip sizing:** 32px height, 10px border-radius, 11px font. These are deliberately smaller than the context chips row above them to maintain visual hierarchy — context chips are informational (read-only), action chips are interactive (tappable). The size difference signals that these are controls, not labels.

**Auto-collapse option:** If you want the row to automatically collapse after an action fires, create a script that executes the action then turns off the input_boolean after a 300ms delay:

```yaml
script:
  living_room_all_off_and_collapse:
    sequence:
      - service: light.turn_off
        target:
          entity_id: light.main_living_lights
      - delay: 0.3
      - service: input_boolean.turn_off
        target:
          entity_id: input_boolean.living_room_quick_actions
```

This is optional. Some users prefer the row to stay open for rapid multi-action sequences (brighten, then brighten again). Test both patterns on the wall mount.

---

## Section 3: Bottom Sheet Popup — The Native Feel

This section details exactly how to make a Bubble Card pop-up look and behave like the React prototype's bottom sheets. The gap between "default Bubble Card popup" and "feels like a native iOS sheet" comes down to seven specific CSS interventions.

### 3.1 What Makes the React Prototype Feel Native

| Technique | Default Bubble Card | Prototype | Implementation |
|-----------|-------------------|-----------|----------------|
| Entry animation | Basic slide-up | Spring overshoot curve | `cubic-bezier(0.16, 1, 0.3, 1)` — decelerates then settles |
| Backdrop | Solid dark overlay, ~40% opacity | Frosted glass — blurred and saturated | `backdrop-filter: blur(16px) saturate(1.5)` |
| Corner radius | 16px or theme default | 24px top corners only | `border-radius: 24px 24px 0 0` |
| Handle bar | Thin, default color | 36×4px, centered, subtle opacity | Styled pseudo-element or first child card |
| Content spacing | Default card padding | Section-based layout with 24px horizontal rhythm | Card-mod on every internal card |
| Bottom safe area | No accommodation | 40px bottom padding | `padding-bottom: env(safe-area-inset-bottom, 40px)` |
| Shadow depth | Default or none | Upward-cast shadow creating sheet-lifts-off-surface effect | `box-shadow: 0 -8px 40px rgba(0,0,0,0.35)` |
| Content entrance | All appears simultaneously | Staggered fade-up of internal sections | `animation-delay` on child cards |
| Typography | HA defaults | Custom section labels, consistent font weights | card-mod on every text element |

### 3.2 Bubble Card Pop-up: Complete Container Styling

A Bubble Card pop-up is created with `card_type: pop-up`. It renders in the dashboard DOM as a `.bubble-pop-up` element with a `.bubble-pop-up-backdrop` sibling. Both are fully styleable.

**Why Bubble Card pop-ups over browser-mod:** Bubble Card pop-ups are hash-routed (`#living-room-sonos`), meaning they survive page refreshes, can be deep-linked, and are triggered with a simple `navigation_path` action. Browser-mod popups require a service call with a `content` payload, don't persist in the URL, and have historically had breaking changes across HA updates. Bubble Card pop-ups also have native swipe-to-dismiss via the handle bar and `close_on_click` for backdrop dismissal. We get the interaction model for free — we just need to restyle the visual layer.

```yaml
# ════════════════════════════════════════════════
# SETTINGS BOTTOM SHEET
# ════════════════════════════════════════════════
- type: custom:bubble-card
  card_type: pop-up
  hash: '#living-room-settings'
  auto_close: ''
  close_on_click: true
  back_open: false
  icon: ''
  name: ''
  entity: ''
  width_desktop: '540'
  bg_opacity: '0'
  shadow_opacity: '0'
  hide_backdrop: false
  styles: |
    /* ───────────────────────────────────────────
       PRIMARY CONTAINER
       Overrides Bubble Card's default pop-up shell
       to create the iOS bottom-sheet appearance.
       ─────────────────────────────────────────── */

    .bubble-pop-up {
      /* ── Geometry ── */
      background: rgba(28, 28, 30, 0.98) !important;
      border-radius: 24px 24px 0 0 !important;
      max-width: 540px !important;
      width: 100% !important;
      margin: 0 auto !important;

      /* ── Bottom safe area for notched/gesture-bar devices ── */
      padding-bottom: env(safe-area-inset-bottom, 40px) !important;

      /* ── Shadow — upward cast creates "lifted sheet" depth ──
           Two-layer shadow: tight inner shadow for definition,
           wide outer shadow for depth perception.
      */
      box-shadow:
        0 -4px 16px rgba(0, 0, 0, 0.15),
        0 -8px 40px rgba(0, 0, 0, 0.35) !important;

      /* ── Subtle top border for definition against backdrop ── */
      border-top: 1px solid rgba(255, 255, 255, 0.06) !important;

      /* ── Smooth scrolling for tall content ── */
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      overscroll-behavior: contain !important;

      /* ── Entry animation ──
           cubic-bezier(0.16, 1, 0.3, 1) is a spring-like curve:
           - Starts fast (0.16 → steep initial slope)
           - Overshoots slightly (the 1.0 control point)
           - Settles naturally (0.3 → gentle deceleration)
           This mimics the UIKit spring animation used in iOS sheets.
           Duration 0.38s — slightly longer than Apple's 0.35s default
           to account for the larger visual mass of a full-width sheet.
      */
      animation: sheetSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
    }

    /* ───────────────────────────────────────────
       BACKDROP
       Frosted glass overlay behind the sheet.
       The blur+saturate creates depth perception —
       the dashboard behind is visible but defocused,
       making the sheet feel like a system-level surface
       rather than a bolted-on dialog.
       ─────────────────────────────────────────── */

    .bubble-pop-up-backdrop {
      background: rgba(0, 0, 0, 0.45) !important;
      backdrop-filter: blur(20px) saturate(1.6) !important;
      -webkit-backdrop-filter: blur(20px) saturate(1.6) !important;
      animation: backdropFadeIn 0.25s ease forwards !important;
    }

    /* ───────────────────────────────────────────
       HIDE DEFAULT BUBBLE CARD HEADER
       We build our own header with better typography
       and layout control. The native header has limited
       customization surface — we need precise control
       over font sizes, weights, and spacing.
       ─────────────────────────────────────────── */

    .bubble-pop-up .bubble-header-container,
    .bubble-pop-up .bubble-pop-up-header {
      display: none !important;
    }

    /* ───────────────────────────────────────────
       CONTENT ENTRANCE CHOREOGRAPHY
       Each direct child card fades up with a stagger.
       This creates a "content assembling itself" feel
       rather than everything appearing simultaneously.
       The 40ms stagger between children is fast enough
       to feel connected (same animation) but slow enough
       to perceive as sequential (not simultaneous).
       ─────────────────────────────────────────── */

    .bubble-pop-up > :nth-child(1) { animation: contentSlideUp 0.35s ease 0.06s both; }
    .bubble-pop-up > :nth-child(2) { animation: contentSlideUp 0.35s ease 0.10s both; }
    .bubble-pop-up > :nth-child(3) { animation: contentSlideUp 0.35s ease 0.14s both; }
    .bubble-pop-up > :nth-child(4) { animation: contentSlideUp 0.35s ease 0.18s both; }
    .bubble-pop-up > :nth-child(5) { animation: contentSlideUp 0.35s ease 0.22s both; }
    .bubble-pop-up > :nth-child(6) { animation: contentSlideUp 0.35s ease 0.26s both; }
    .bubble-pop-up > :nth-child(7) { animation: contentSlideUp 0.35s ease 0.30s both; }
    .bubble-pop-up > :nth-child(8) { animation: contentSlideUp 0.35s ease 0.34s both; }

    /* ───────────────────────────────────────────
       KEYFRAMES
       ─────────────────────────────────────────── */

    @keyframes sheetSlideUp {
      from {
        transform: translateY(100%);
        opacity: 0.7;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes backdropFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes contentSlideUp {
      from {
        opacity: 0;
        transform: translateY(12px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
```

### 3.3 Backdrop Blur Performance Caveat

`backdrop-filter: blur(20px)` composites every frame the GPU renders while the popup is visible. On target hardware:

| Device | Performance | Recommendation |
|--------|-------------|----------------|
| iPad (2020+) | Smooth | Full blur(20px) + saturate(1.6) |
| iPad (2018 and older) | Occasional stutter on open/close | Reduce to blur(12px) saturate(1.3) |
| Fire HD 10 (2021+) | Visible jank during animation | Fall back to solid overlay |
| Fire HD 8 (any gen) | Unusable | Solid overlay: `rgba(0,0,0,0.60)`, no blur |
| iPhone (2020+) | Smooth | Full blur |
| Android tablet (mid-range) | Test per device | Start with blur(12px) |

**Fallback implementation:** Create a theme-level CSS variable:

```yaml
# In HA theme
modes:
  dark:
    popup-backdrop-filter: blur(20px) saturate(1.6)
    # Low-power fallback:
    # popup-backdrop-filter: none
```

Then in popup CSS: `backdrop-filter: var(--popup-backdrop-filter) !important;`

---

## Section 4: Popup Internal Components — Reusable Building Blocks

Every element inside both popups (Settings and Sonos) is built from four reusable patterns: Handle Bar, Section Header, Section Label, and Action Button. Here they are in exact detail.

### 4.1 Handle Bar

The drag handle at the top of every popup. Signals "this sheet is draggable / dismissable." Implemented as a mushroom-template-card with all content hidden — only a CSS pseudo-element renders.

```yaml
  - type: custom:mushroom-template-card
    primary: ''
    secondary: ''
    icon: ''
    card_mod:
      style: |
        /* Strip all mushroom card chrome */
        ha-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
          min-height: 0 !important;
          height: 22px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        /* Hide all mushroom internals */
        mushroom-state-info,
        mushroom-shape-icon,
        mushroom-card {
          display: none !important;
        }
        /* The handle bar itself */
        ha-card::after {
          content: '';
          display: block;
          width: 36px;
          height: 4px;
          border-radius: 2px;
          background: rgba(255, 255, 255, 0.15);
          /* Light mode: rgba(0,0,0,0.12) */
        }
```

**Why 22px total height:** 4px bar + 9px top + 9px bottom implicit centering. Matches iOS 17 sheet handle proportions. Taller feels disconnected; shorter feels cramped.

**Why `::after` not `::before`:** `::after` renders on top of any residual mushroom-card DOM that `display: none` might not fully suppress across all WebView implementations. Defensive CSS.

### 4.2 Popup Header

Title + contextual subtitle. No icon — the room is already identified by the card that triggered the popup.

```yaml
  - type: custom:mushroom-template-card
    primary: Living Room
    secondary: >-
      {% set on = expand('light.main_living_lights')
         | selectattr('state', 'eq', 'on') | list | count %}
      {% set total = expand('light.main_living_lights') | list | count %}
      {% set bri = state_attr('light.main_living_lights', 'brightness')
         | default(0) | int * 100 / 255 | round(0) %}
      {{ on }} of {{ total }} lights on · {{ bri }}% avg
    icon: ''
    card_mod:
      style: |
        ha-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 6px 24px 0 24px !important;
          margin: 0 !important;
          min-height: 0 !important;
        }
        mushroom-state-info {
          --card-primary-font-size: 18px;
          --card-primary-font-weight: 700;
          --card-primary-color: var(--primary-text-color);
          --card-secondary-font-size: 13px;
          --card-secondary-font-weight: 400;
          --card-secondary-color: rgba(255,255,255,0.40);
          padding: 0 !important;
        }
        mushroom-shape-icon {
          display: none !important;
        }
```

### 4.3 Section Label

Every functional group (Room Brightness, Controls, Speakers) gets an uppercase small-text label. This is the "iOS Settings group header" convention — creates visual sections without heavy divider lines.

```yaml
  # Reusable — change primary text for each section
  - type: custom:mushroom-template-card
    primary: ROOM BRIGHTNESS
    icon: ''
    card_mod:
      style: |
        ha-card {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 20px 24px 4px 24px !important;
          margin: 0 !important;
          min-height: 0 !important;
        }
        mushroom-state-info {
          --card-primary-font-size: 11px;
          --card-primary-font-weight: 600;
          --card-primary-color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0 !important;
        }
        mushroom-shape-icon {
          display: none !important;
        }
```

### 4.4 Action Button (Reusable Pattern)

Every action inside a popup follows this pattern. The key properties that make it feel like a native list item:

**Geometry:** Full-width row, 14px border-radius, 2px top/bottom margin, 24px horizontal margin from sheet edges. This creates a consistent 24px gutter on both sides.

**Touch feedback:** `:active` pseudo-class applies `scale(0.98)` + a slightly brighter background. Two simultaneous feedback channels — spatial (shrink) and chromatic (lighten). On a wall-mounted display, this is essential because you can't feel the glass.

**State-aware background:** The background color shifts based on the entity's state. Active/enabled states use the contextual accent color at 10% opacity. Inactive states use the neutral chip background.

**Template:**

```yaml
  - type: custom:mushroom-template-card
    entity: [TARGET_ENTITY]
    primary: [LABEL]
    secondary: [OPTIONAL_STATUS]
    icon: [MDI_ICON]
    icon_color: [COLOR_NAME]
    tap_action:
      action: call-service
      service: [SERVICE]
      target:
        entity_id: [TARGET]
    card_mod:
      style: |
        ha-card {
          border: none !important;
          border-radius: 14px !important;
          margin: 2px 24px !important;
          min-height: 0 !important;
          box-shadow: none !important;
          background: [STATE_AWARE_BG] !important;
          transition: background 0.2s ease, transform 0.1s ease !important;
        }
        ha-card:active {
          transform: scale(0.98) !important;
          background: [PRESSED_BG] !important;
        }
        mushroom-state-info {
          --card-primary-font-size: 14px;
          --card-primary-font-weight: 500;
          --card-secondary-font-size: 12px;
          --card-secondary-font-weight: 600;
          padding: 12px 4px !important;
        }
        mushroom-shape-icon {
          --icon-size: 20px;
          --shape-size: 36px;
          --shape-border-radius: 10px;
          --shape-color: [ICON_BG] !important;
        }
```

**Color map for action buttons:**

| Action | Background | Pressed BG | Icon BG | Accent |
|--------|-----------|-----------|---------|--------|
| All On/Off | `rgba(255,149,0,0.10)` / `rgba(255,255,255,0.06)` | `rgba(255,149,0,0.18)` | `rgba(255,149,0,0.14)` | `#ff9500` |
| Reset Manual | `rgba(255,59,48,0.08)` | `rgba(255,59,48,0.16)` | `rgba(255,59,48,0.12)` | `#ff3b30` |
| Movie Mode (on) | `rgba(175,82,222,0.10)` | `rgba(175,82,222,0.18)` | `rgba(175,82,222,0.14)` | `#af52de` |
| Movie Mode (off) | `rgba(255,255,255,0.06)` | `rgba(255,255,255,0.10)` | `rgba(255,255,255,0.06)` | grey |
| Brighten | `rgba(255,255,255,0.06)` | `rgba(255,149,0,0.12)` | `rgba(255,255,255,0.06)` | `#ff9500` |
| Dim | `rgba(255,255,255,0.06)` | `rgba(128,128,128,0.12)` | `rgba(255,255,255,0.06)` | grey |

### 4.5 Slider (Reusable Pattern)

Both the room brightness slider and the Sonos volume slider use a Bubble Card separator with `button_type: slider`. The styling transforms the default full-height slider into a capsule with fill and overlaid labels.

```yaml
  - type: custom:bubble-card
    card_type: separator
    entity: [ENTITY]
    name: [LEFT_LABEL]
    button_type: slider
    show_icon: false
    styles: |
      .bubble-separator {
        background: transparent !important;
        padding: 0 24px !important;
        margin: 0 !important;
      }

      /* ── Track ── */
      .bubble-range-slider {
        height: [HEIGHT]px !important;       /* 44 for room, 36 for volume */
        border-radius: [RADIUS]px !important; /* 14 for room, 12 for volume */
        background: rgba(255,255,255,0.06) !important;
        overflow: hidden !important;
        position: relative !important;
      }

      /* ── Fill ── */
      .bubble-range-fill {
        height: 100% !important;
        border-radius: [RADIUS]px !important;
        background: [FILL_COLOR] !important;
        /* Room: rgba(255,149,0,0.28) — amber */
        /* Sonos: rgba(52,199,89,0.32) — green */
        transition: width 0.15s ease !important;
      }

      /* ── Left label ── */
      .bubble-name {
        position: absolute !important;
        left: 16px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        z-index: 2 !important;
        pointer-events: none !important;
      }

      /* ── Right value ── */
      .bubble-range-value,
      .bubble-state {
        position: absolute !important;
        right: 16px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        font-size: [SIZE]px !important;    /* 16 for room, 13 for volume */
        font-weight: [WEIGHT] !important;   /* 700 for room, 600 for volume */
        font-variant-numeric: tabular-nums !important;
        z-index: 2 !important;
        pointer-events: none !important;
      }

      .bubble-icon { display: none !important; }
```

---

## Section 5: Settings Popup — Complete Card List

Assembling the building blocks from Section 4 into the full settings sheet:

```yaml
# Inside the pop-up's cards: array
cards:
  # 1. Handle bar
  - [Section 4.1 handle bar card]

  # 2. Header
  - [Section 4.2 header card — "Living Room" + light count subtitle]

  # 3. Section label
  - [Section 4.3 — primary: "ROOM BRIGHTNESS"]

  # 4. Room brightness slider
  - [Section 4.5 — entity: light.main_living_lights, height: 44, radius: 14,
     fill: rgba(255,149,0,0.28), left label: "All Lights", right: 700/16px]

  # 5. Section label
  - [Section 4.3 — primary: "CONTROLS"]

  # 6. All On/Off button
  - [Section 4.4 — entity: light.main_living_lights, service: light.toggle,
     amber accent]

  # 7. Reset Manual (conditional)
  - type: conditional
    conditions:
      - condition: template
        value: >-
          {{ state_attr('sensor.adaptive_lighting_main_living_manual_control',
             'manual_control') | default([]) | count > 0 }}
    card:
      [Section 4.4 — icon: mdi:restore, red accent, service: automation.trigger]

  # 8. Brighten / Dim side by side
  - type: horizontal-stack
    cards:
      - [Section 4.4 — "Brighten", mdi:weather-sunny, brightness_step_pct: 15,
         margin-left: 24px, margin-right: 2px]
      - [Section 4.4 — "Dim", mdi:weather-night, brightness_step_pct: -15,
         margin-left: 2px, margin-right: 24px]

  # 9. Movie Mode
  - [Section 4.4 — entity: input_boolean.living_room_movie_mode,
     purple accent, action: toggle]
```

---

## Section 6: Sonos Popup — Tabbed Architecture

The richest surface in the system. Uses a two-tab design: **Controls** (transport, volume, per-speaker volume sliders with grouping) and **Media** (Sonos media browser for song/playlist selection). The tab system keeps popup height manageable while giving full media control without leaving the dashboard.

### 6.1 Pop-up Shell

Same container CSS as Section 3.2, with hash `#living-room-sonos`. Triggered by:

```yaml
# On the Sonos tile in the media row:
tap_action:
  action: navigate
  navigation_path: '#living-room-sonos'
```

### 6.2 Tab Bar

Directly below the handle bar. Two tabs, mutually exclusive. Driven by an `input_select` helper.

```yaml
# Helper entity (create in HA)
input_select:
  living_room_sonos_tab:
    options:
      - controls
      - media
    initial: controls
```

```yaml
  # Tab bar as mushroom-chips-card
  - type: custom:mushroom-chips-card
    alignment: center
    card_mod:
      style: |
        ha-card {
          --chip-spacing: 0 !important;
          padding: 0 24px !important;
          margin: 0 !important;
          background: none !important;
          box-shadow: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
    chips:
      - type: template
        content: Controls
        icon: mdi:tune-variant
        tap_action:
          action: call-service
          service: input_select.select_option
          target:
            entity_id: input_select.living_room_sonos_tab
          data:
            option: controls
        card_mod:
          style: |
            ha-card {
              border-radius: 0 !important;
              flex: 1 !important;
              justify-content: center !important;
              background: none !important;
              --chip-font-size: 13px;
              transition: all 0.2s ease;
              {% if is_state('input_select.living_room_sonos_tab', 'controls') %}
              border-bottom: 2px solid #34c759 !important;
              --chip-font-weight: 600;
              {% else %}
              border-bottom: 2px solid transparent !important;
              opacity: 0.4;
              {% endif %}
            }
      - type: template
        content: Media
        icon: mdi:playlist-music
        tap_action:
          action: call-service
          service: input_select.select_option
          target:
            entity_id: input_select.living_room_sonos_tab
          data:
            option: media
        card_mod:
          style: |
            ha-card {
              border-radius: 0 !important;
              flex: 1 !important;
              justify-content: center !important;
              background: none !important;
              --chip-font-size: 13px;
              transition: all 0.2s ease;
              {% if is_state('input_select.living_room_sonos_tab', 'media') %}
              border-bottom: 2px solid #34c759 !important;
              --chip-font-weight: 600;
              {% else %}
              border-bottom: 2px solid transparent !important;
              opacity: 0.4;
              {% endif %}
            }
```

**Tab styling:**

| State | Text Color | Font | Bottom Border |
|-------|------------|------|---------------|
| Active | `var(--primary-text-color)` | 13px, weight 600 | 2px solid `#34c759` |
| Inactive | `rgba(255,255,255,0.3)` | 13px, weight 500 | 2px solid transparent |

### 6.3 Tab 1: Controls — Complete Cards

Visible when `input_select.living_room_sonos_tab` = `controls`. Wrapped in a `conditional` card.

```yaml
  # Tab 1 body
  - type: conditional
    conditions:
      - condition: state
        entity: input_select.living_room_sonos_tab
        state: controls
    card:
      type: vertical-stack
      cards:

        # ── Now Playing ──
        - type: custom:mushroom-media-player-card
          entity: media_player.living_room_credenza
          use_media_info: true
          show_volume_level: false
          media_controls: []
          collapsible_controls: false
          fill_container: false
          card_mod:
            style: |
              ha-card {
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
                padding: 12px 24px 4px !important;
                margin: 0 !important;
              }
              mushroom-shape-icon,
              mushroom-media-player-media-control img {
                border-radius: 18px !important;
                width: 80px !important;
                height: 80px !important;
                min-width: 80px !important;
                box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
              }
              mushroom-shape-icon {
                background: linear-gradient(135deg,
                  rgba(52,199,89,0.20), rgba(0,122,255,0.14)) !important;
                --icon-color: rgba(255,255,255,0.5) !important;
                --icon-size: 32px !important;
              }
              .primary {
                font-size: 19px !important;
                font-weight: 600 !important;
                line-height: 1.3 !important;
              }
              .secondary {
                font-size: 14px !important;
                color: rgba(255,255,255,0.45) !important;
                line-height: 1.3 !important;
              }

        # ── Source badge ──
        - type: custom:mushroom-chips-card
          alignment: start
          card_mod:
            style: |
              ha-card {
                --chip-spacing: 4px;
                padding: 4px 24px 16px !important;
                background: none !important;
                box-shadow: none !important;
                border: none !important;
              }
          chips:
            - type: template
              icon: mdi:circle-small
              icon_color: green
              content: >-
                {{ state_attr('media_player.living_room_credenza', 'source')
                   | default('Unknown') }}
              card_mod:
                style: |
                  ha-card {
                    background: rgba(52,199,89,0.08) !important;
                    border: 1px solid rgba(52,199,89,0.10) !important;
                    --chip-font-size: 11px;
                    --chip-font-weight: 600;
                    --chip-height: 26px;
                    --chip-border-radius: 8px;
                  }

        # ── Transport controls ──
        - type: horizontal-stack
          cards:
            - type: custom:mushroom-template-card
              primary: ''
              card_mod:
                style: 'ha-card { background:none!important; box-shadow:none!important; border:none!important; min-height:0!important; }'
            - type: custom:mushroom-template-card
              icon: mdi:skip-previous
              primary: ''
              icon_color: white
              tap_action:
                action: call-service
                service: media_player.media_previous_track
                target:
                  entity_id: media_player.living_room_credenza
              card_mod:
                style: |
                  ha-card { background:transparent!important; box-shadow:none!important; border:none!important; min-height:0!important; display:flex; justify-content:center; }
                  ha-card:active { opacity: 0.5; }
                  mushroom-state-info { display: none !important; }
                  mushroom-shape-icon {
                    --icon-size: 22px; --shape-size: 40px;
                    --shape-border-radius: 12px;
                    --shape-color: transparent !important;
                    opacity: 0.45;
                  }
            - type: custom:mushroom-template-card
              entity: media_player.living_room_credenza
              icon: >-
                {{ 'mdi:pause' if is_state('media_player.living_room_credenza', 'playing')
                   else 'mdi:play' }}
              primary: ''
              icon_color: white
              tap_action:
                action: call-service
                service: media_player.media_play_pause
                target:
                  entity_id: media_player.living_room_credenza
              card_mod:
                style: |
                  ha-card { background:transparent!important; box-shadow:none!important; border:none!important; min-height:0!important; display:flex; justify-content:center; }
                  ha-card:active { transform: scale(0.92); transition: transform 0.1s ease !important; }
                  mushroom-state-info { display: none !important; }
                  mushroom-shape-icon {
                    --icon-size: 28px; --shape-size: 58px;
                    --shape-border-radius: 18px;
                    --shape-color: rgba(255,255,255,0.08) !important;
                  }
            - type: custom:mushroom-template-card
              icon: mdi:skip-next
              primary: ''
              icon_color: white
              tap_action:
                action: call-service
                service: media_player.media_next_track
                target:
                  entity_id: media_player.living_room_credenza
              card_mod:
                style: |
                  ha-card { background:transparent!important; box-shadow:none!important; border:none!important; min-height:0!important; display:flex; justify-content:center; }
                  ha-card:active { opacity: 0.5; }
                  mushroom-state-info { display: none !important; }
                  mushroom-shape-icon {
                    --icon-size: 22px; --shape-size: 40px;
                    --shape-border-radius: 12px;
                    --shape-color: transparent !important;
                    opacity: 0.45;
                  }
            - type: custom:mushroom-template-card
              primary: ''
              card_mod:
                style: 'ha-card { background:none!important; box-shadow:none!important; border:none!important; min-height:0!important; }'

        # ── Section label: VOLUME ──
        - [Section 4.3 — primary: "VOLUME"]

        # ── Primary volume slider (Credenza) ──
        - type: custom:bubble-card
          card_type: separator
          entity: media_player.living_room_credenza
          name: Credenza
          button_type: slider
          show_icon: false
          styles: |
            .bubble-separator {
              background: transparent !important;
              padding: 4px 24px 8px !important;
              margin: 0 !important;
            }
            .bubble-range-slider {
              height: 38px !important;
              border-radius: 12px !important;
              background: rgba(255,255,255,0.06) !important;
              overflow: hidden !important;
              position: relative !important;
            }
            .bubble-range-fill {
              height: 100% !important;
              border-radius: 12px !important;
              background: rgba(52,199,89,0.32) !important;
              transition: width 0.12s ease !important;
            }
            .bubble-name {
              position: absolute !important;
              left: 14px !important; top: 50% !important;
              transform: translateY(-50%) !important; z-index: 2 !important;
              font-size: 13px !important; font-weight: 500 !important;
            }
            .bubble-state, .bubble-range-value {
              position: absolute !important;
              right: 14px !important; top: 50% !important;
              transform: translateY(-50%) !important; z-index: 2 !important;
              font-size: 14px !important; font-weight: 600 !important;
              font-variant-numeric: tabular-nums !important;
              color: rgba(255,255,255,0.50) !important;
            }
            .bubble-icon { display: none !important; }

        # ── Section label: SPEAKERS ──
        # Conditional — only for multi-speaker rooms
        - type: conditional
          conditions:
            - condition: template
              value: "{{ true }}"  # Set false for single-speaker rooms
          card:
            type: vertical-stack
            cards:
              - [Section 4.3 — primary: "SPEAKERS"]

              # ── Primary speaker status row (Credenza — not draggable here) ──
              - type: custom:mushroom-template-card
                primary: Credenza
                secondary: Playing
                icon: mdi:speaker
                icon_color: green
                card_mod:
                  style: |
                    ha-card {
                      border: 1px solid rgba(52,199,89,0.10) !important;
                      border-radius: 14px !important;
                      margin: 2px 24px !important; min-height: 0 !important;
                      box-shadow: none !important; pointer-events: none;
                      background: rgba(52,199,89,0.08) !important;
                    }
                    mushroom-state-info {
                      --card-primary-font-size: 14px; --card-primary-font-weight: 500;
                      --card-secondary-font-size: 11px; --card-secondary-font-weight: 600;
                      --card-secondary-color: #34c759;
                      padding: 10px 4px !important;
                    }
                    mushroom-shape-icon {
                      --icon-size: 18px; --shape-size: 32px;
                      --shape-border-radius: 9px;
                      --shape-color: rgba(52,199,89,0.14) !important;
                    }

              # ─────────────────────────────────────────────
              # GROUPABLE SPEAKERS — Per-Speaker Volume Sliders
              # ─────────────────────────────────────────────
              #
              # Each speaker has TWO conditional cards:
              #   1. GROUPED → Full drag-to-adjust volume slider (blue accent)
              #   2. NOT GROUPED → Static "Join" button (neutral, tap to join)
              # Only one renders at a time per speaker.
              #
              # The slider approach means grouped speakers are DIRECTLY
              # controllable for volume without any additional taps.
              # Join/unjoin is handled by a sub-button icon on the left.

              # ── Kitchen: GROUPED state (draggable volume slider) ──
              - type: conditional
                conditions:
                  - condition: template
                    value: >-
                      {{ 'media_player.kitchen' in
                         state_attr('media_player.living_room_credenza',
                         'group_members') | default([]) }}
                card:
                  type: custom:bubble-card
                  card_type: separator
                  entity: media_player.kitchen
                  name: Kitchen
                  button_type: slider
                  sub_button:
                    - icon: mdi:speaker
                      show_background: false
                      tap_action:
                        action: call-service
                        service: sonos.unjoin
                        target:
                          entity_id: media_player.kitchen
                  styles: |
                    .bubble-separator {
                      background: transparent !important;
                      padding: 2px 24px !important;
                      margin: 0 !important;
                    }
                    .bubble-range-slider {
                      height: 40px !important;
                      border-radius: 12px !important;
                      background: rgba(0,122,255,0.06) !important;
                      border: 1px solid rgba(0,122,255,0.12) !important;
                      overflow: hidden !important;
                      position: relative !important;
                    }
                    .bubble-range-fill {
                      height: 100% !important;
                      border-radius: 12px !important;
                      background: rgba(0,122,255,0.25) !important;
                      transition: width 0.12s ease !important;
                    }
                    .bubble-name {
                      position: absolute !important;
                      left: 42px !important; top: 50% !important;
                      transform: translateY(-50%) !important; z-index: 2 !important;
                      font-size: 13px !important; font-weight: 500 !important;
                    }
                    .bubble-state, .bubble-range-value {
                      position: absolute !important;
                      right: 14px !important; top: 50% !important;
                      transform: translateY(-50%) !important; z-index: 2 !important;
                      font-size: 13px !important; font-weight: 600 !important;
                      font-variant-numeric: tabular-nums !important;
                      color: #007aff !important;
                    }
                    .bubble-sub-button-0 {
                      position: absolute !important;
                      left: 8px !important; top: 50% !important;
                      transform: translateY(-50%) !important; z-index: 5 !important;
                      --mdc-icon-size: 18px;
                      color: #007aff !important;
                    }
                    .bubble-icon { display: none !important; }

              # ── Kitchen: NOT GROUPED state (tap to join) ──
              - type: conditional
                conditions:
                  - condition: template
                    value: >-
                      {{ 'media_player.kitchen' not in
                         state_attr('media_player.living_room_credenza',
                         'group_members') | default([]) }}
                card:
                  type: custom:mushroom-template-card
                  entity: media_player.kitchen
                  primary: Kitchen
                  secondary: Join
                  icon: mdi:speaker-off
                  icon_color: disabled
                  tap_action:
                    action: call-service
                    service: media_player.join
                    target:
                      entity_id: media_player.kitchen
                    data:
                      group_members:
                        - media_player.living_room_credenza
                  card_mod:
                    style: |
                      ha-card {
                        border: 1px solid rgba(255,255,255,0.04) !important;
                        border-radius: 12px !important;
                        margin: 2px 24px !important; min-height: 40px !important;
                        max-height: 40px !important;
                        box-shadow: none !important;
                        background: rgba(255,255,255,0.06) !important;
                        transition: background 0.2s ease !important;
                      }
                      ha-card:active { transform: scale(0.98) !important; }
                      mushroom-state-info {
                        --card-primary-font-size: 13px;
                        --card-primary-font-weight: 500;
                        --card-secondary-font-size: 11px;
                        --card-secondary-color: rgba(255,255,255,0.35);
                        padding: 8px 4px !important;
                      }
                      mushroom-shape-icon {
                        --icon-size: 18px; --shape-size: 32px;
                        --shape-border-radius: 9px;
                        --shape-color: rgba(255,255,255,0.06) !important;
                        opacity: 0.4;
                      }

              # ── Soundbar: clone Kitchen pattern, swap entity ──
              # (Same dual-conditional: grouped slider + ungrouped join)
              # entity: media_player.living_room_soundbar

              # ── Bathroom: clone Kitchen pattern, swap entity ──
              # entity: media_player.bathroom
```

**Per-speaker slider design rationale:** When a speaker is grouped, its entire row becomes a drag-to-adjust volume surface — the same interaction model as the light tiles. This eliminates the "tap to open, then find the slider" flow that plagues most Sonos UIs. Volume for any grouped speaker is always one drag away. The left-side speaker icon doubles as the unjoin button (tap to remove from group), keeping the join/unjoin action accessible without consuming a separate row.

### 6.4 Tab 2: Media Browser

Visible when `input_select.living_room_sonos_tab` = `media`. This tab embeds a Sonos media browser for song/playlist/radio selection without leaving the popup.

```yaml
  # Tab 2 body
  - type: conditional
    conditions:
      - condition: state
        entity: input_select.living_room_sonos_tab
        state: media
    card:
      type: vertical-stack
      cards:

        # ── Option A (recommended): sonos-card from HACS ──
        - type: custom:sonos-card
          entityId: media_player.living_room_credenza
          sections:
            - media browser
            - favorites
            - queue
          card_mod:
            style: |
              ha-card {
                background: none !important;
                box-shadow: none !important;
                border: none !important;
                border-radius: 0 !important;
                padding: 8px 12px !important;
              }
              .bento-grid, .bento-container {
                background: none !important;
              }
              .bento-item {
                background: rgba(255,255,255,0.06) !important;
                border-radius: 14px !important;
                border: 1px solid rgba(255,255,255,0.04) !important;
              }

        # ── Option B (fallback): mini-media-player ──
        # - type: custom:mini-media-player
        #   entity: media_player.living_room_credenza
        #   artwork: full-cover
        #   hide:
        #     volume: true
        #     controls: true
        #     power: true
        #     name: true
        #   source: full
        #   card_mod:
        #     style: |
        #       ha-card {
        #         background: none !important;
        #         box-shadow: none !important;
        #         border: none !important;
        #         padding: 8px 12px !important;
        #       }

        # ── Favorites quick-access row ──
        - type: custom:mushroom-chips-card
          alignment: start
          card_mod:
            style: |
              ha-card {
                padding: 10px 24px 4px !important;
                background: none !important;
                box-shadow: none !important;
                overflow-x: auto !important;
                flex-wrap: nowrap !important;
              }
          chips:
            - type: template
              content: Jazz
              icon: mdi:music-note
              tap_action:
                action: call-service
                service: media_player.play_media
                target:
                  entity_id: media_player.living_room_credenza
                data:
                  media_content_type: playlist
                  media_content_id: "spotify:playlist:37i9dQZF1DXbITWG1ZJKYt"
              card_mod:
                style: |
                  ha-card {
                    background: rgba(52,199,89,0.08) !important;
                    border: 1px solid rgba(52,199,89,0.10) !important;
                    --chip-font-size: 12px; font-weight: 600;
                  }
            # Additional favorite chips as needed...
```

**Media tab styling principles:** All embedded media cards get `background: none`, `box-shadow: none`, `border: none` to merge seamlessly with the popup shell. List items use `rgba(255,255,255,0.06)` backgrounds with 14px border radius. Scrollable content gets `-webkit-overflow-scrolling: touch`. Max content height is constrained to ~70vh via the popup container.

---

## Section 7: Updated Card Nesting Hierarchy

With the hybrid architecture, the full card structure becomes:

```
stack-in-card (outer container)
│
├── bubble-card type: separator (header)
│   └── sub_button[0]: gear
│       ├── tap → toggle input_boolean.living_room_quick_actions
│       └── hold → navigate #living-room-settings
│
├── mushroom-chips-card (context chips — alarm, temp, presence, timer)
│   └── Per-chip conditional
│
├── mushroom-chips-card (quick-action chips — inline expand)
│   └── Always in DOM, animated via max-height CSS
│   └── Driven by input_boolean.living_room_quick_actions
│   ├── All Off chip
│   ├── Reset Manual chip (conditional within row)
│   ├── Brighten (+) chip
│   └── Dim (−) chip
│
├── layout-card type: grid (3×2 light tiles)
│   └── 6× bubble-card type: button, button_type: slider
│
├── layout-card type: grid (media row — 1.4fr 0.8fr 0.8fr)
│   ├── Sonos tile → tap navigates #living-room-sonos
│   ├── Apple TV tile → tap toggles
│   └── Samsung TV tile → tap toggles
│
├── bubble-card type: pop-up hash: #living-room-settings
│   ├── Handle bar (Section 4.1)
│   ├── Header — "Living Room" + subtitle (Section 4.2)
│   ├── Section label — "ROOM BRIGHTNESS" (Section 4.3)
│   ├── Slider — light group (Section 4.5, amber)
│   ├── Section label — "CONTROLS" (Section 4.3)
│   ├── Button — All On/Off (Section 4.4, amber)
│   ├── Button — Reset Manual, conditional (Section 4.4, red)
│   ├── Buttons — Brighten + Dim, horizontal-stack (Section 4.4)
│   └── Button — Movie Mode (Section 4.4, purple)
│
└── bubble-card type: pop-up hash: #living-room-sonos
    ├── Handle bar (Section 4.1)
    ├── Tab bar — Controls | Media (input_select driven)
    ├── [Tab 1: Controls]
    │   ├── Now playing — mushroom-media-player-card (Section 6.3)
    │   ├── Source badge chip (Section 6.3)
    │   ├── Transport — Prev / Play-Pause / Next (Section 6.3)
    │   ├── Section label — "VOLUME"
    │   ├── Primary volume slider — Credenza (green, Section 6.3)
    │   ├── Section label — "SPEAKERS" (conditional)
    │   ├── Primary speaker status — Credenza, non-interactive
    │   ├── Grouped speaker slider — Kitchen (blue, drag=volume, icon tap=unjoin)
    │   ├── Grouped speaker slider — Soundbar (clone pattern)
    │   └── Grouped speaker slider — Bathroom (clone pattern)
    │       (each speaker has dual conditionals: slider when grouped, join button when not)
    └── [Tab 2: Media]
        ├── sonos-card media browser (HACS, recommended)
        └── Favorites quick-access chips row
```

---

## Section 8: Chip Token Comparison

Quick-action chips vs context chips are visually distinct because they serve different architectural roles:

| Property | Context Chips (Tier 1) | Action Chips (Tier 2) |
|----------|----------------------|----------------------|
| Purpose | Display state (read-only) | Trigger actions (interactive) |
| Height | 26px | 32px |
| Border radius | 8px | 10px |
| Font weight | 600 | 600 (labels), 700 (+/−) |
| `:active` feedback | None | scale(0.95) + background shift |
| Background opacity | 0.06–0.08 | 0.06–0.10 |
| Row position | Below separator, above actions | Below context chips, above grid |
| Visibility | Per-chip conditional (entity state) | Entire row toggles (input_boolean) |
| Animation | None (always present) | Staggered chipIn on expand |

This distinction is subtle but deliberate. Context chips are ambient information — you don't tap them. Action chips invite interaction — the larger size and pressed feedback communicate "I'm a button."

---

## Section 9: Light Mode Color Map

Every color in this guide targets dark mode. Light mode equivalents:

| Dark Mode | Light Mode | Usage |
|-----------|------------|-------|
| `rgba(28,28,30,0.98)` | `rgba(255,255,255,0.98)` | Popup background |
| `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.04)` | Neutral chip/button background |
| `rgba(255,255,255,0.15)` | `rgba(0,0,0,0.12)` | Handle bar |
| `rgba(255,255,255,0.35)` | `rgba(0,0,0,0.35)` | Section labels |
| `rgba(255,255,255,0.40)` | `rgba(0,0,0,0.40)` | Subtitle text |
| `rgba(255,255,255,0.45)` | `rgba(0,0,0,0.30)` | Gear icon, muted text |
| `rgba(255,149,0,0.10)` | `rgba(255,149,0,0.06)` | Amber action bg |
| `rgba(255,149,0,0.28)` | `rgba(255,149,0,0.18)` | Room slider fill |
| `rgba(52,199,89,0.32)` | `rgba(52,199,89,0.20)` | Volume slider fill |
| `rgba(255,59,48,0.08)` | `rgba(255,59,48,0.05)` | Reset manual bg |
| `rgba(175,82,222,0.10)` | `rgba(175,82,222,0.06)` | Movie mode bg |
| `rgba(0,122,255,0.10)` | `rgba(0,122,255,0.06)` | Grouped speaker bg |
| `rgba(0,0,0,0.45)` | `rgba(0,0,0,0.30)` | Backdrop overlay |

Implement via HA theme CSS variables for single-point control:

```yaml
# In theme definition
modes:
  dark:
    popup-bg: rgba(28,28,30,0.98)
    popup-neutral: rgba(255,255,255,0.06)
    popup-handle: rgba(255,255,255,0.15)
    popup-label: rgba(255,255,255,0.35)
    popup-subtitle: rgba(255,255,255,0.40)
  light:
    popup-bg: rgba(255,255,255,0.98)
    popup-neutral: rgba(0,0,0,0.04)
    popup-handle: rgba(0,0,0,0.12)
    popup-label: rgba(0,0,0,0.35)
    popup-subtitle: rgba(0,0,0,0.40)
```