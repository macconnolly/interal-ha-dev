/**
 * tunet-control-button — Reusable Control Button Primitive
 * ──────────────────────────────────────────────────────────────
 * A self-contained button element for card headers and toolbars.
 * Renders as toggle, selector, or icon-only button.
 *
 * DOES NOT call HA services directly. Emits events:
 *   tunet:action   — tap/hold/double-tap action requests
 *
 * The parent composer listens for these events and routes
 * them to HA service calls.
 *
 * Schema (v1.0):
 *   entity:         string (optional — for state tracking)
 *   icon:           string (Material Symbols ligature)
 *   label:          string (text label for selector variant)
 *   variant:        'toggle' | 'selector' | 'icon'
 *   accent:         'amber' | 'blue' | 'green' | 'purple' | 'red'
 *   active_state:   string (entity state value that means "on", default 'on')
 *   badge:          { entity, attribute?, format? } — numeric badge
 *   tap_action:     action config (default: toggle)
 *   hold_action:    action config (default: more-info)
 *   double_tap_action: action config (default: none)
 *   show_when:      { entity, operator, state, attribute }
 *   aria_label:     string
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, RESET_CSS, ICON_BASE,
  escapeHtml, injectFonts, FONT_LINKS_HTML,
  normalizeIcon,
} from './tunet_base.js';

import {
  evaluateShowWhen, normalizeAction,
} from './tunet_runtime.js';

const BTN_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   BUTTON CSS
   ═══════════════════════════════════════════════════════════════ */

const BTN_STYLES = `
  ${TOKENS}
  ${RESET_CSS}
  ${ICON_BASE}

  :host {
    display: inline-flex;
    contain: layout style;
  }
  :host([hidden]) { display: none !important; }

  /* ── Toggle variant (default) ──────────────────── */
  .btn {
    width: 42px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all .15s ease;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
    padding: 0;
    font: inherit;
    position: relative;
  }
  .btn:hover { box-shadow: var(--shadow); }
  .btn:active { transform: scale(.94); }
  .btn:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  /* ── Toggle ON ─────────────────────────────────── */
  .btn.on {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* ── Accent variants ───────────────────────────── */
  :host([accent="blue"]) .btn.on {
    background: var(--blue-fill); color: var(--blue); border-color: var(--blue-border);
  }
  :host([accent="green"]) .btn.on {
    background: var(--green-fill); color: var(--green); border-color: var(--green-border);
  }
  :host([accent="purple"]) .btn.on {
    background: var(--purple-fill); color: var(--purple); border-color: var(--purple-border);
  }
  :host([accent="red"]) .btn.on {
    background: var(--red-fill); color: var(--red); border-color: var(--red-border);
  }

  /* ── Selector variant ──────────────────────────── */
  :host([variant="selector"]) .btn {
    width: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.2px;
  }
  :host([variant="selector"]) .btn .icon {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  }
  :host([variant="selector"]) .btn:active { transform: scale(.97); }
  :host([variant="selector"]) .btn.on {
    border-color: var(--amber-border);
    color: var(--amber);
    background: var(--amber-fill);
    font-weight: 700;
  }
  :host([variant="selector"]) .btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  }
  :host([variant="selector"][accent="blue"]) .btn.on {
    border-color: var(--blue-border); color: var(--blue); background: var(--blue-fill);
  }
  :host([variant="selector"][accent="green"]) .btn.on {
    border-color: var(--green-border); color: var(--green); background: var(--green-fill);
  }
  :host([variant="selector"][accent="purple"]) .btn.on {
    border-color: var(--purple-border); color: var(--purple); background: var(--purple-fill);
  }
  :host([variant="selector"][accent="red"]) .btn.on {
    border-color: var(--red-border); color: var(--red); background: var(--red-fill);
  }

  /* ── Icon-only variant ─────────────────────────── */
  :host([variant="icon"]) .btn {
    background: transparent;
    border-color: transparent;
    box-shadow: none;
    color: var(--text-muted);
  }
  :host([variant="icon"]) .btn:hover {
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
  }
  :host([variant="icon"]) .btn.on {
    color: var(--amber);
    background: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  /* ── Badge ─────────────────────────────────────── */
  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #FF3B30;
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: 999px;
    text-align: center;
    line-height: 18px;
    padding: 0 4px;
    display: none;
    letter-spacing: 0.3px;
  }
  .badge.visible { display: inline-flex; justify-content: center; }

  /* ── Label (selector variant) ──────────────────── */
  .btn-label { white-space: nowrap; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   ELEMENT CLASS
   ═══════════════════════════════════════════════════════════════ */

class TunetControlButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._isActive = false;
    this._holdTimer = null;
    this._doubleTapTimer = null;
    this._tapCount = 0;
    this._holdFired = false;

    injectFonts();
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {}

  disconnectedCallback() {
    clearTimeout(this._holdTimer);
    clearTimeout(this._doubleTapTimer);
  }

  /* ── Config ─────────────────────────────────────── */

  setConfig(config) {
    this._config = {
      entity: config.entity || '',
      icon: normalizeIcon(config.icon, { fallback: 'power_settings_new' }),
      label: config.label || '',
      variant: config.variant || 'toggle',
      accent: config.accent || 'amber',
      active_state: config.active_state || 'on',
      badge: config.badge || null,
      tap_action: normalizeAction(config.tap_action || { action: 'toggle' }, config.entity),
      hold_action: normalizeAction(config.hold_action || { action: 'more-info' }, config.entity),
      double_tap_action: normalizeAction(config.double_tap_action || { action: 'none' }, config.entity),
      show_when: config.show_when || null,
      aria_label: config.aria_label || config.label || '',
    };

    // Host attributes for CSS
    if (this._config.variant !== 'toggle') this.setAttribute('variant', this._config.variant);
    else this.removeAttribute('variant');

    if (this._config.accent !== 'amber') this.setAttribute('accent', this._config.accent);
    else this.removeAttribute('accent');

    if (this._rendered) this._rebuild();
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    this._update();
  }

  /* ── Render (once) ──────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = BTN_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS_HTML + `<button class="btn" id="btn" type="button"></button>`;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._btnEl = this.shadowRoot.getElementById('btn');
    this._rebuild();
  }

  _rebuild() {
    if (!this._btnEl) return;
    const h = escapeHtml;
    const cfg = this._config;

    let inner = `<span class="icon icon-18" id="iconEl">${h(cfg.icon)}</span>`;

    if (cfg.variant === 'selector' && cfg.label) {
      inner += `<span class="btn-label">${h(cfg.label)}</span>`;
    }

    inner += `<span class="badge" id="badge"></span>`;

    this._btnEl.innerHTML = inner;
    this._btnEl.setAttribute('aria-label', cfg.aria_label);

    this.$ = {
      btn: this._btnEl,
      iconEl: this.shadowRoot.getElementById('iconEl'),
      badge: this.shadowRoot.getElementById('badge'),
    };

    // Pointer handlers for hold + tap + double-tap
    this._btnEl.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    this._btnEl.addEventListener('pointerup', (e) => this._onPointerUp(e));
    this._btnEl.addEventListener('pointercancel', () => this._clearHold());
    this._btnEl.addEventListener('pointerleave', () => this._clearHold());
    this._btnEl.addEventListener('click', (e) => this._onClick(e));

    // Keyboard
    this._btnEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._emitAction('tunet:action', this._config.tap_action);
      }
    });
  }

  /* ── Update (every hass change) ─────────────────── */

  _update() {
    if (!this._hass || !this.$) return;
    const cfg = this._config;

    // Conditional visibility
    if (cfg.show_when) {
      const visible = evaluateShowWhen(this._hass, cfg.show_when);
      this.hidden = !visible;
      if (!visible) return;
    } else {
      this.hidden = false;
    }

    // Active state
    if (cfg.entity) {
      const entity = this._hass.states[cfg.entity];
      this._isActive = entity && String(entity.state) === cfg.active_state;
    }

    this.$.btn.classList.toggle('on', this._isActive);
    this.$.btn.setAttribute('aria-pressed', this._isActive ? 'true' : 'false');

    // Badge
    if (cfg.badge && this.$.badge) {
      const badgeVal = this._resolveBadge();
      if (badgeVal !== null && badgeVal !== 0 && badgeVal !== '0') {
        this.$.badge.textContent = badgeVal;
        this.$.badge.classList.add('visible');
      } else {
        this.$.badge.classList.remove('visible');
      }
    }
  }

  _resolveBadge() {
    const badge = this._config.badge;
    if (!badge || !badge.entity) return null;
    const entity = this._hass.states[badge.entity];
    if (!entity) return null;
    const raw = badge.attribute
      ? (entity.attributes ? entity.attributes[badge.attribute] : null)
      : entity.state;
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw.length || null;
    return String(raw);
  }

  /* ═══════════════════════════════════════════════════
     POINTER HANDLERS — Hold + Tap + Double-tap
     ═══════════════════════════════════════════════════ */

  _onPointerDown() {
    this._holdFired = false;
    clearTimeout(this._holdTimer);
    this._holdTimer = setTimeout(() => {
      this._holdFired = true;
      this._emitAction('tunet:action', this._config.hold_action);
    }, 500);
  }

  _onPointerUp() {
    this._clearHold();
  }

  _clearHold() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
  }

  _onClick(e) {
    if (this._holdFired) {
      e.preventDefault();
      e.stopPropagation();
      this._holdFired = false;
      return;
    }

    const dblAction = this._config.double_tap_action;
    if (dblAction && dblAction.action !== 'none') {
      this._tapCount++;
      if (this._tapCount === 1) {
        this._doubleTapTimer = setTimeout(() => {
          this._tapCount = 0;
          this._emitAction('tunet:action', this._config.tap_action);
        }, 250);
      } else if (this._tapCount >= 2) {
        clearTimeout(this._doubleTapTimer);
        this._tapCount = 0;
        this._emitAction('tunet:action', dblAction);
      }
    } else {
      this._emitAction('tunet:action', this._config.tap_action);
    }
  }

  /* ═══════════════════════════════════════════════════
     EVENT EMITTERS — Primitive → Composer protocol
     ═══════════════════════════════════════════════════ */

  _emitAction(eventName, action) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true, composed: true,
      detail: {
        action,
        entity: this._config.entity,
        source: 'control-button',
      },
    }));
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API — For composer to set external state
     ═══════════════════════════════════════════════════ */

  /** Composer can force active state */
  setActive(isActive) {
    this._isActive = isActive;
    if (this.$.btn) {
      this.$.btn.classList.toggle('on', isActive);
      this.$.btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    }
  }

  /** Composer can update badge value directly */
  setBadge(value) {
    if (!this.$.badge) return;
    if (value !== null && value !== 0 && value !== '0') {
      this.$.badge.textContent = value;
      this.$.badge.classList.add('visible');
    } else {
      this.$.badge.classList.remove('visible');
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

if (!customElements.get('tunet-control-button')) {
  customElements.define('tunet-control-button', TunetControlButton);
}
