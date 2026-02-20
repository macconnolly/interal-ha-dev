/**
 * Tunet Control Button Primitive
 * Reusable action button with unified Tunet control surface.
 * Event-only primitive: emits actions, never dispatches services directly.
 * Standalone direct-dispatch usage is deprecated.
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
    display: inline-flex;
    min-width: 0;
  }

  :host([hidden]) {
    display: none !important;
  }

  .ctrl-btn {
    min-width: 0;
    white-space: nowrap;
  }

  .ctrl-btn[aria-disabled="true"] {
    opacity: 0.55;
    cursor: default;
    pointer-events: none;
  }

  .ctrl-btn .label {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ctrl-btn .icon {
    color: var(--text-muted);
  }

  .ctrl-btn[data-active="true"][data-accent="amber"] {
    background: var(--amber-fill);
    border-color: var(--amber-border);
    color: var(--amber);
  }
  .ctrl-btn[data-active="true"][data-accent="amber"] .icon { color: var(--amber); }

  .ctrl-btn[data-active="true"][data-accent="blue"] {
    background: var(--blue-fill);
    border-color: var(--blue-border);
    color: var(--blue);
  }
  .ctrl-btn[data-active="true"][data-accent="blue"] .icon { color: var(--blue); }

  .ctrl-btn[data-active="true"][data-accent="green"] {
    background: var(--green-fill);
    border-color: var(--green-border);
    color: var(--green);
  }
  .ctrl-btn[data-active="true"][data-accent="green"] .icon { color: var(--green); }

  .ctrl-btn[data-active="true"][data-accent="purple"] {
    background: var(--purple-fill);
    border-color: var(--purple-border);
    color: var(--purple);
  }
  .ctrl-btn[data-active="true"][data-accent="purple"] .icon { color: var(--purple); }

  .ctrl-btn[data-active="true"][data-accent="red"] {
    background: var(--red-fill);
    border-color: var(--red-border);
    color: var(--red);
  }
  .ctrl-btn[data-active="true"][data-accent="red"] .icon { color: var(--red); }
`;

let warnedControlStandalone = false;

class TunetControlButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._hass = null;
    this._config = {
      icon: 'bolt',
      label: '',
      accent: 'amber',
      active: false,
      disabled: false,
      composer_managed: false,
      entity: '',
      tap_action: { action: 'none' },
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

    next.icon = normalizeTunetIcon(next.icon || 'bolt', 'bolt');
    next.accent = String(next.accent || 'amber');
    next.active = Boolean(next.active);
    next.disabled = Boolean(next.disabled);
    next.composer_managed = Boolean(next.composer_managed);

    next.tap_action = normalizeAction(next.tap_action || { action: 'none' }, next.entity || '');
    next.hold_action = normalizeAction(next.hold_action || { action: 'none' }, next.entity || '');
    next.double_tap_action = normalizeAction(next.double_tap_action || { action: 'none' }, next.entity || '');

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
      <button id="btn" type="button" class="ctrl-btn" aria-disabled="false">
        <span id="icon" class="icon icon-18">bolt</span>
        <span id="label" class="label"></span>
      </button>
    `;

    this.$ = {
      btn: this.shadowRoot.getElementById('btn'),
      icon: this.shadowRoot.getElementById('icon'),
      label: this.shadowRoot.getElementById('label'),
    };

    this.$.btn.addEventListener('pointerdown', () => this._onPointerDown());
    this.$.btn.addEventListener('pointerup', () => this._clearHold());
    this.$.btn.addEventListener('pointercancel', () => this._clearHold());
    this.$.btn.addEventListener('pointerleave', () => this._clearHold());

    this.$.btn.addEventListener('click', (e) => this._onClick(e));

    this.$.btn.addEventListener('keydown', (e) => {
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
    this.$.label.textContent = this._config.label || '';

    const hasLabel = Boolean(this._config.label);
    this.$.label.style.display = hasLabel ? '' : 'none';

    this.$.btn.dataset.active = this._config.active ? 'true' : 'false';
    this.$.btn.dataset.accent = this._config.accent;
    this.$.btn.setAttribute('aria-disabled', this._config.disabled ? 'true' : 'false');
    this.$.btn.disabled = this._config.disabled;

    const ariaLabel = this._config.label || this._config.icon || 'Control';
    this.$.btn.setAttribute('aria-label', ariaLabel);
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

  _triggerAction(trigger, action) {
    const normalized = normalizeAction(action, this._config.entity || '');
    if (normalized.action === 'none') return;

    if (!this._config.composer_managed && !warnedControlStandalone) {
      warnedControlStandalone = true;
      console.warn('[tunet-control-button] standalone dispatch is deprecated; listen for "tunet:action" in a composer.');
    }

    const evt = new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      cancelable: false,
      detail: {
        source: 'tunet-control-button',
        trigger,
        entity: this._config.entity || '',
        action: normalized,
      },
    });

    this.dispatchEvent(evt);
  }
}

if (!customElements.get('tunet-control-button')) {
  customElements.define('tunet-control-button', TunetControlButton);
}

export { TunetControlButton };
