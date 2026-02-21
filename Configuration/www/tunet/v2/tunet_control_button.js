/**
 * Tunet Control Button (primitive)
 * Event-only compact button for header/control areas.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  ICON_BUTTON_PATTERN,
  LABEL_BUTTON_PATTERN,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';
import { normalizeAction, normalizeTunetIcon } from './tunet_runtime.js';

const TAG = 'tunet-control-button';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${ICON_BUTTON_PATTERN}
${LABEL_BUTTON_PATTERN}
${REDUCED_MOTION}

:host {
  display: inline-flex;
}

button {
  font-family: inherit;
}

.btn {
  min-width: 42px;
}

.btn.label {
  justify-content: center;
}

.btn .icon {
  font-size: 18px;
  width: 18px;
  height: 18px;
}

.btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.btn[data-accent='amber'][data-active='true'] {
  background: var(--amber-fill);
  border-color: var(--amber-border);
  color: var(--amber);
}

.btn[data-accent='blue'][data-active='true'] {
  background: var(--blue-fill);
  border-color: var(--blue-border);
  color: var(--blue);
}

.btn[data-accent='green'][data-active='true'] {
  background: var(--green-fill);
  border-color: var(--green-border);
  color: var(--green);
}

.btn[data-accent='purple'][data-active='true'] {
  background: var(--purple-fill);
  border-color: var(--purple-border);
  color: var(--purple);
}

.btn[data-active='true'] .icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
`;

const TEMPLATE = `
${FONT_LINKS}
<button id="btn" class="btn icon-btn" type="button" aria-pressed="false">
  <span id="icon" class="icon">tune</span>
  <span id="label"></span>
</button>
`;

class TunetControlButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._tapTimer = null;
    this._holdTimer = null;
    this._longPressed = false;
  }

  setConfig(config) {
    this._config = {
      icon: normalizeTunetIcon(config?.icon || 'tune', 'tune'),
      label: config?.label || '',
      active: config?.active === true,
      accent: config?.accent || 'amber',
      disabled: config?.disabled === true,
      hold_ms: Number.isFinite(Number(config?.hold_ms)) ? Number(config.hold_ms) : 500,
      tap_action: normalizeAction(config?.tap_action || { action: 'none' }),
      hold_action: config?.hold_action ? normalizeAction(config.hold_action) : null,
      double_tap_action: config?.double_tap_action ? normalizeAction(config.double_tap_action) : null,
    };

    if (this._els) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (!this._config) this.setConfig({});
    this._render();
  }

  disconnectedCallback() {
    this._clearTimers();
    this._removeListeners();
  }

  _renderShell() {
    this.shadowRoot.innerHTML = '';
    const style = document.createElement('style');
    style.textContent = CSS;
    this.shadowRoot.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._els = {
      btn: this.shadowRoot.getElementById('btn'),
      icon: this.shadowRoot.getElementById('icon'),
      label: this.shadowRoot.getElementById('label'),
    };

    this._bindListeners();
  }

  _bindListeners() {
    this._onPointerDown = this._handlePointerDown.bind(this);
    this._onPointerUp = this._handlePointerUp.bind(this);
    this._onPointerCancel = this._handlePointerCancel.bind(this);
    this._onKeyDown = this._handleKeyDown.bind(this);

    this._els.btn.addEventListener('pointerdown', this._onPointerDown);
    this._els.btn.addEventListener('pointerup', this._onPointerUp);
    this._els.btn.addEventListener('pointercancel', this._onPointerCancel);
    this._els.btn.addEventListener('keydown', this._onKeyDown);
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.btn.removeEventListener('pointerdown', this._onPointerDown);
    this._els.btn.removeEventListener('pointerup', this._onPointerUp);
    this._els.btn.removeEventListener('pointercancel', this._onPointerCancel);
    this._els.btn.removeEventListener('keydown', this._onKeyDown);
  }

  _clearTimers() {
    clearTimeout(this._tapTimer);
    clearTimeout(this._holdTimer);
    this._tapTimer = null;
    this._holdTimer = null;
    this._longPressed = false;
  }

  _render() {
    const cfg = this._config || {};
    const { btn, icon, label } = this._els;

    const hasLabel = !!cfg.label;
    btn.className = hasLabel ? 'btn label-btn label' : 'btn icon-btn';
    btn.dataset.accent = cfg.accent || 'amber';
    btn.dataset.active = cfg.active ? 'true' : 'false';
    btn.disabled = !!cfg.disabled;
    btn.setAttribute('aria-pressed', cfg.active ? 'true' : 'false');

    icon.textContent = cfg.icon || 'tune';
    label.textContent = cfg.label || '';
    label.style.display = hasLabel ? '' : 'none';
  }

  _handlePointerDown(e) {
    if (this._config?.disabled) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    this._clearTimers();

    if (this._config?.hold_action) {
      this._holdTimer = setTimeout(() => {
        this._longPressed = true;
        this._emitAction(this._config.hold_action, 'hold');
      }, this._config.hold_ms || 500);
    }
  }

  _handlePointerUp(e) {
    if (this._config?.disabled) return;
    clearTimeout(this._holdTimer);
    this._holdTimer = null;

    if (this._longPressed) {
      this._longPressed = false;
      return;
    }

    const doubleAction = this._config?.double_tap_action;
    if (doubleAction) {
      if (this._tapTimer) {
        clearTimeout(this._tapTimer);
        this._tapTimer = null;
        this._emitAction(doubleAction, 'double_tap');
        return;
      }

      this._tapTimer = setTimeout(() => {
        this._tapTimer = null;
        this._emitAction(this._config.tap_action, 'tap');
      }, 240);
      return;
    }

    this._emitAction(this._config.tap_action, 'tap');
  }

  _handlePointerCancel() {
    clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._longPressed = false;
  }

  _handleKeyDown(e) {
    if (this._config?.disabled) return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this._emitAction(this._config?.tap_action, 'keyboard');
  }

  _emitAction(action, source) {
    const normalized = normalizeAction(action || { action: 'none' });

    this.dispatchEvent(new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      detail: {
        action: normalized,
        source: 'control-button',
        trigger: source,
      },
    }));

    if ((normalized.action || '') === 'more-info') {
      this.dispatchEvent(new CustomEvent('tunet:request-more-info', {
        bubbles: true,
        composed: true,
        detail: {
          entity_id: normalized.entity_id || '',
          source: 'control-button',
          trigger: source,
        },
      }));
    }
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetControlButton);
}

console.info(`%cTUNET-CONTROL-BUTTON ${VERSION}`, 'color:#007AFF;font-weight:700;');
