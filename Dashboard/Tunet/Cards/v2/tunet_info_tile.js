/**
 * tunet-info-tile — Reusable Header Info Tile Primitive
 * ──────────────────────────────────────────────────────────────
 * A self-contained info tile element for card headers. Shows
 * an icon, title, and subtitle with optional accent coloring
 * and active state detection.
 *
 * DOES NOT call HA services directly. Emits events:
 *   tunet:action   — tap/hold/double-tap action requests
 *
 * The parent composer listens for these events and routes
 * them to HA service calls.
 *
 * Schema (v1.0):
 *   entity:         string (optional — for state/icon tracking)
 *   icon:           string (Material Symbols ligature)
 *   title:          string
 *   subtitle:       string (or 'auto' for entity state)
 *   accent:         'amber' | 'blue' | 'green' | 'purple'
 *   active_when:    string (entity state that means active, default 'on')
 *   icon_filled:    boolean (fill icon when active, default true)
 *   show_icon:      boolean (default true)
 *   tap_action:     action config (default: more-info)
 *   hold_action:    action config (default: more-info)
 *   double_tap_action: action config (default: none)
 *   show_when:      { entity, operator, state, attribute }
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, RESET_CSS, ICON_BASE,
  escapeHtml, injectFonts, FONT_LINKS_HTML,
  normalizeIcon,
} from './tunet_base.js';

import {
  evaluateShowWhen, normalizeAction, friendlyName,
} from './tunet_runtime.js';

const INFO_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   INFO TILE CSS
   ═══════════════════════════════════════════════════════════════ */

const INFO_STYLES = `
  ${TOKENS}
  ${RESET_CSS}
  ${ICON_BASE}

  :host {
    display: inline-flex;
    contain: layout style;
  }
  :host([hidden]) { display: none !important; }

  .info-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    cursor: pointer;
    transition: all .15s ease;
    min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .info-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  /* ── Active state ──────────────────────────────── */
  .info-tile.active {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }
  .info-tile.active .entity-icon { color: var(--amber); }
  .info-tile.active .hdr-sub { color: var(--amber); }

  /* ── Accent variants ───────────────────────────── */
  :host([accent="blue"]) .info-tile.active {
    background: var(--blue-fill); border-color: var(--blue-border);
  }
  :host([accent="blue"]) .info-tile.active .entity-icon { color: var(--blue); }
  :host([accent="blue"]) .info-tile.active .hdr-sub { color: var(--blue); }

  :host([accent="green"]) .info-tile.active {
    background: var(--green-fill); border-color: var(--green-border);
  }
  :host([accent="green"]) .info-tile.active .entity-icon { color: var(--green); }
  :host([accent="green"]) .info-tile.active .hdr-sub { color: var(--green); }

  :host([accent="purple"]) .info-tile.active {
    background: var(--purple-fill); border-color: var(--purple-border);
  }
  :host([accent="purple"]) .info-tile.active .entity-icon { color: var(--purple); }
  :host([accent="purple"]) .info-tile.active .hdr-sub { color: var(--purple); }

  /* ── Entity icon ───────────────────────────────── */
  .entity-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: all .2s ease;
    color: var(--text-muted);
  }
  .entity-icon .icon.filled {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* ── Text ──────────────────────────────────────── */
  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .hdr-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Hidden icon mode ──────────────────────────── */
  :host([hide-icon]) .entity-icon { display: none; }
  :host([hide-icon]) .info-tile { padding-left: 10px; }

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

class TunetInfoTile extends HTMLElement {
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
      icon: normalizeIcon(config.icon, { fallback: 'info' }),
      title: config.title || '',
      subtitle: config.subtitle || 'auto',
      accent: config.accent || 'amber',
      active_when: config.active_when || 'on',
      icon_filled: config.icon_filled !== false,
      show_icon: config.show_icon !== false,
      tap_action: normalizeAction(config.tap_action || { action: 'more-info' }, config.entity),
      hold_action: normalizeAction(config.hold_action || { action: 'more-info' }, config.entity),
      double_tap_action: normalizeAction(config.double_tap_action || { action: 'none' }, config.entity),
      show_when: config.show_when || null,
    };

    // Host attributes for CSS
    if (this._config.accent !== 'amber') this.setAttribute('accent', this._config.accent);
    else this.removeAttribute('accent');

    if (!this._config.show_icon) this.setAttribute('hide-icon', '');
    else this.removeAttribute('hide-icon');

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
    style.textContent = INFO_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS_HTML + `
      <div class="info-tile" id="tile" tabindex="0" role="button"></div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._tileEl = this.shadowRoot.getElementById('tile');
    this._rebuild();
  }

  _rebuild() {
    if (!this._tileEl) return;
    const h = escapeHtml;
    const cfg = this._config;

    this._tileEl.innerHTML = `
      <div class="entity-icon" id="entityIcon">
        <span class="icon icon-18" id="iconEl">${h(cfg.icon)}</span>
      </div>
      <div class="hdr-text">
        <div class="hdr-title" id="title">${h(cfg.title)}</div>
        <div class="hdr-sub" id="subtitle"></div>
      </div>
    `;

    if (cfg.entity) {
      this._tileEl.setAttribute('aria-label', cfg.title || cfg.entity);
    }

    this.$ = {
      tile: this._tileEl,
      entityIcon: this.shadowRoot.getElementById('entityIcon'),
      iconEl: this.shadowRoot.getElementById('iconEl'),
      title: this.shadowRoot.getElementById('title'),
      subtitle: this.shadowRoot.getElementById('subtitle'),
    };

    // Pointer handlers for hold + tap + double-tap
    this._tileEl.addEventListener('pointerdown', (e) => this._onPointerDown(e));
    this._tileEl.addEventListener('pointerup', (e) => this._onPointerUp(e));
    this._tileEl.addEventListener('pointercancel', () => this._clearHold());
    this._tileEl.addEventListener('pointerleave', () => this._clearHold());
    this._tileEl.addEventListener('click', (e) => this._onClick(e));

    // Keyboard
    this._tileEl.addEventListener('keydown', (e) => {
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

    // Active state detection
    if (cfg.entity) {
      const entity = this._hass.states[cfg.entity];
      this._isActive = entity && String(entity.state) === cfg.active_when;
    }

    this.$.tile.classList.toggle('active', this._isActive);

    // Icon filled state
    if (this.$.iconEl && cfg.icon_filled) {
      this.$.iconEl.classList.toggle('filled', this._isActive);
    }

    // Title
    if (this.$.title) {
      this.$.title.textContent = cfg.title || friendlyName(this._hass, cfg.entity);
    }

    // Subtitle
    if (this.$.subtitle) {
      this.$.subtitle.textContent = this._resolveSubtitle();
    }
  }

  _resolveSubtitle() {
    const cfg = this._config;

    // Explicit subtitle (not 'auto')
    if (cfg.subtitle && cfg.subtitle !== 'auto') return cfg.subtitle;

    // Auto: derive from entity state
    if (cfg.entity) {
      const entity = this._hass.states[cfg.entity];
      if (!entity) return 'Unavailable';
      const state = entity.state;
      if (state === 'on') return 'On';
      if (state === 'off') return 'Off';
      if (state === 'unavailable') return 'Unavailable';
      return state;
    }

    return '';
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
        source: 'info-tile',
      },
    }));
  }

  /* ═══════════════════════════════════════════════════
     PUBLIC API — For composer to set external state
     ═══════════════════════════════════════════════════ */

  /** Composer can force active state */
  setActive(isActive) {
    this._isActive = isActive;
    if (this.$.tile) {
      this.$.tile.classList.toggle('active', isActive);
    }
    if (this.$.iconEl && this._config.icon_filled) {
      this.$.iconEl.classList.toggle('filled', isActive);
    }
  }

  /** Composer can set title directly */
  setTitle(text) {
    if (this.$.title) this.$.title.textContent = text;
  }

  /** Composer can set subtitle directly */
  setSubtitle(text) {
    if (this.$.subtitle) this.$.subtitle.textContent = text;
  }

  /** Composer can set icon directly */
  setIcon(glyph) {
    if (this.$.iconEl) this.$.iconEl.textContent = glyph;
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

if (!customElements.get('tunet-info-tile')) {
  customElements.define('tunet-info-tile', TunetInfoTile);
}
