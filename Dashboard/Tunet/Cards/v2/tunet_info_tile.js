/**
 * Tunet Info Tile Primitive
 * Header info surface (icon + title + subtitle) with unified action semantics.
 * Version 1.0.0
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CTRL_SURFACE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';

import {
  normalizeAction,
  evaluateShowWhen,
  dispatchAction,
  normalizeTunetIcon,
} from './tunet_runtime.js';

const STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CTRL_SURFACE}
${REDUCED_MOTION}

  :host {
    display: block;
    min-width: 0;
  }

  :host([hidden]) {
    display: none !important;
  }

  .info-tile {
    width: 100%;
    justify-content: flex-start;
    min-width: 0;
    gap: 8px;
    padding: 6px 10px 6px 6px;
  }

  .info-tile[aria-disabled="true"] {
    opacity: 0.55;
    cursor: default;
    pointer-events: none;
  }

  .icon-wrap {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    background: transparent;
    color: var(--text-muted);
  }

  .text-wrap {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
    flex: 1;
  }

  .title {
    font-size: 13px;
    font-weight: 700;
    color: var(--text);
    letter-spacing: 0.1px;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subtitle {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .info-tile[data-active="true"][data-accent="amber"] {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }
  .info-tile[data-active="true"][data-accent="amber"] .icon-wrap,
  .info-tile[data-active="true"][data-accent="amber"] .title {
    color: var(--amber);
  }

  .info-tile[data-active="true"][data-accent="blue"] {
    background: var(--blue-fill);
    border-color: var(--blue-border);
  }
  .info-tile[data-active="true"][data-accent="blue"] .icon-wrap,
  .info-tile[data-active="true"][data-accent="blue"] .title {
    color: var(--blue);
  }

  .info-tile[data-active="true"][data-accent="green"] {
    background: var(--green-fill);
    border-color: var(--green-border);
  }
  .info-tile[data-active="true"][data-accent="green"] .icon-wrap,
  .info-tile[data-active="true"][data-accent="green"] .title {
    color: var(--green);
  }

  .info-tile[data-active="true"][data-accent="purple"] {
    background: var(--purple-fill);
    border-color: var(--purple-border);
  }
  .info-tile[data-active="true"][data-accent="purple"] .icon-wrap,
  .info-tile[data-active="true"][data-accent="purple"] .title {
    color: var(--purple);
  }

  .info-tile[data-active="true"][data-accent="red"] {
    background: var(--red-fill);
    border-color: var(--red-border);
  }
  .info-tile[data-active="true"][data-accent="red"] .icon-wrap,
  .info-tile[data-active="true"][data-accent="red"] .title {
    color: var(--red);
  }
`;

class TunetInfoTile extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._hass = null;
    this._config = {
      entity: '',
      title: '',
      subtitle: '',
      icon: 'info',
      accent: 'amber',
      active: false,
      disabled: false,
      tap_action: null,
      hold_action: { action: 'none' },
      double_tap_action: { action: 'none' },
      show_when: null,
    };

    this._rendered = false;
    this._holdTimer = null;
    this._holdTriggered = false;
    this._clickTimer = null;
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));
    if (!this._rendered) this._render();
    this._sync();
  }

  set config(config) {
    this.setConfig(config);
  }

  setConfig(config = {}) {
    const next = {
      ...this._config,
      ...config,
    };

    next.icon = normalizeTunetIcon(next.icon || 'info', 'info');
    next.accent = String(next.accent || 'amber');
    next.active = Boolean(next.active);
    next.disabled = Boolean(next.disabled);

    const fallbackEntity = next.entity || '';
    const defaultTap = next.tap_action || (fallbackEntity ? { action: 'more-info', entity: fallbackEntity } : { action: 'none' });

    next.tap_action = normalizeAction(defaultTap, fallbackEntity);
    next.hold_action = normalizeAction(next.hold_action || { action: 'none' }, fallbackEntity);
    next.double_tap_action = normalizeAction(next.double_tap_action || { action: 'none' }, fallbackEntity);

    this._config = next;

    if (!this._rendered) this._render();
    this._sync();
  }

  connectedCallback() {
    if (!this._rendered) this._render();
    this._sync();
  }

  disconnectedCallback() {
    clearTimeout(this._holdTimer);
    clearTimeout(this._clickTimer);
    this._holdTimer = null;
    this._clickTimer = null;
  }

  _render() {
    injectFonts();

    this.shadowRoot.innerHTML = `
      ${FONT_LINKS}
      <style>${STYLES}</style>
      <button id="tile" type="button" class="ctrl-btn info-tile" aria-disabled="false">
        <span id="iconWrap" class="icon-wrap"><span id="icon" class="icon icon-18">info</span></span>
        <span class="text-wrap">
          <span id="title" class="title"></span>
          <span id="subtitle" class="subtitle"></span>
        </span>
      </button>
    `;

    this.$ = {
      tile: this.shadowRoot.getElementById('tile'),
      icon: this.shadowRoot.getElementById('icon'),
      title: this.shadowRoot.getElementById('title'),
      subtitle: this.shadowRoot.getElementById('subtitle'),
    };

    this.$.tile.addEventListener('pointerdown', () => this._onPointerDown());
    this.$.tile.addEventListener('pointerup', () => this._clearHold());
    this.$.tile.addEventListener('pointercancel', () => this._clearHold());
    this.$.tile.addEventListener('pointerleave', () => this._clearHold());

    this.$.tile.addEventListener('click', (e) => this._onClick(e));

    this.$.tile.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this._onImmediateTap();
    });

    this._rendered = true;
  }

  _sync() {
    if (!this.$) return;

    const visible = evaluateShowWhen(this._hass, this._config.show_when, this._config.entity);
    this.toggleAttribute('hidden', !visible);
    if (!visible) return;

    this.$.icon.textContent = this._config.icon;
    this.$.title.textContent = this._config.title || '';
    this.$.subtitle.textContent = this._config.subtitle || '';

    this.$.subtitle.style.display = this._config.subtitle ? '' : 'none';

    this.$.tile.dataset.active = this._config.active ? 'true' : 'false';
    this.$.tile.dataset.accent = this._config.accent;

    this.$.tile.disabled = this._config.disabled;
    this.$.tile.setAttribute('aria-disabled', this._config.disabled ? 'true' : 'false');

    const ariaLabel = [this._config.title, this._config.subtitle].filter(Boolean).join(' · ') || this._config.entity || 'Info';
    this.$.tile.setAttribute('aria-label', ariaLabel);
  }

  _onPointerDown() {
    if (this._config.disabled) return;
    this._holdTriggered = false;
    this._clearHold();

    const holdAction = this._config.hold_action;
    if (!holdAction || holdAction.action === 'none') return;

    this._holdTimer = setTimeout(() => {
      this._holdTimer = null;
      this._holdTriggered = true;
      this._triggerAction('hold', holdAction);
    }, 500);
  }

  _clearHold() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
  }

  _onImmediateTap() {
    if (this._config.disabled) return;
    this._clearHold();
    if (this._holdTriggered) {
      this._holdTriggered = false;
      return;
    }
    this._triggerAction('tap', this._config.tap_action);
  }

  _onClick(event) {
    if (this._config.disabled) return;

    this._clearHold();
    if (this._holdTriggered) {
      event.preventDefault();
      event.stopPropagation();
      this._holdTriggered = false;
      return;
    }

    const doubleAction = this._config.double_tap_action;
    if (!doubleAction || doubleAction.action === 'none') {
      this._triggerAction('tap', this._config.tap_action);
      return;
    }

    if (this._clickTimer) {
      clearTimeout(this._clickTimer);
      this._clickTimer = null;
      this._triggerAction('double_tap', doubleAction);
      return;
    }

    this._clickTimer = setTimeout(() => {
      this._clickTimer = null;
      this._triggerAction('tap', this._config.tap_action);
    }, 220);
  }

  async _triggerAction(trigger, action) {
    const normalized = normalizeAction(action, this._config.entity || '');
    if (normalized.action === 'none') return;

    const evt = new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: {
        source: 'tunet-info-tile',
        trigger,
        entity: this._config.entity || '',
        action: normalized,
      },
    });

    this.dispatchEvent(evt);
    if (evt.defaultPrevented) return;

    if (normalized.action === 'more-info') {
      this.dispatchEvent(new CustomEvent('tunet:request-more-info', {
        bubbles: true,
        composed: true,
        detail: {
          source: 'tunet-info-tile',
          entity: normalized.entity || this._config.entity || '',
        },
      }));
    }

    await dispatchAction(this._hass, this, normalized, this._config.entity || '');
  }
}

if (!customElements.get('tunet-info-tile')) {
  customElements.define('tunet-info-tile', TunetInfoTile);
}

export { TunetInfoTile };
