/**
 * Tunet Action Chip (primitive)
 * Generic chip that emits tunet:action and reflects active state.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  ACTION_CHIP_SURFACE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
} from './tunet_base.js';
import {
  evaluateShowWhen,
  normalizeAction,
  normalizeTunetIcon,
} from './tunet_runtime.js';

const TAG = 'tunet-action-chip';
const VERSION = '1.0.0';

const CSS = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${ACTION_CHIP_SURFACE}
${REDUCED_MOTION}

:host {
  display: block;
  min-width: 0;
}

.action-chip {
  width: 100%;
}

.action-chip .icon {
  font-size: 1.25em;
  width: 1.25em;
  height: 1.25em;
  color: var(--text-muted);
}

.action-chip.active {
  font-weight: 700;
}

.action-chip[data-accent='amber'].active {
  border-color: var(--amber-border);
  color: var(--amber);
}

.action-chip[data-accent='amber'].active .icon {
  color: var(--amber);
}

.action-chip[data-accent='blue'].active {
  border-color: var(--blue-border);
  color: var(--blue);
}

.action-chip[data-accent='blue'].active .icon {
  color: var(--blue);
}

.action-chip[data-accent='green'].active {
  border-color: var(--green-border);
  color: var(--green);
}

.action-chip[data-accent='green'].active .icon {
  color: var(--green);
}

.action-chip[data-accent='purple'].active {
  border-color: var(--purple-border);
  color: var(--purple);
}

.action-chip[data-accent='purple'].active .icon {
  color: var(--purple);
}

.action-chip.active .icon {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
`;

const TEMPLATE = `
${FONT_LINKS}
<button id="chip" class="action-chip" type="button">
  <span id="icon" class="icon">bolt</span>
  <span id="label">Action</span>
</button>
`;

class TunetActionChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
  }

  setConfig(config) {
    this._config = {
      icon: normalizeTunetIcon(config?.icon || 'bolt', 'bolt'),
      label: config?.label || config?.name || 'Action',
      accent: config?.accent || 'amber',
      active: config?.active === true,
      disabled: config?.disabled === true,
      show_when: config?.show_when || null,
      state_entity: config?.state_entity || '',
      active_when: config?.active_when ?? 'on',
      active_when_operator: config?.active_when_operator || 'equals',
      tap_action: normalizeAction(config?.tap_action || this._fromService(config), config?.state_entity || ''),
      hold_action: config?.hold_action ? normalizeAction(config.hold_action, config?.state_entity || '') : null,
      double_tap_action: config?.double_tap_action
        ? normalizeAction(config.double_tap_action, config?.state_entity || '')
        : null,
    };

    if (this._els) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    applyDarkClass(this, detectDarkMode(hass));
    if (this._els) this._render();
  }

  connectedCallback() {
    injectFonts();
    this._renderShell();
    if (!this._config) this.setConfig({});
    this._render();
  }

  disconnectedCallback() {
    this._removeListeners();
  }

  _fromService(config) {
    if (!config?.service) return { action: 'none' };
    return {
      action: 'call-service',
      service: config.service,
      service_data: { ...(config.service_data || {}) },
      entity_id: config.state_entity || config.service_data?.entity_id || '',
    };
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
      chip: this.shadowRoot.getElementById('chip'),
      icon: this.shadowRoot.getElementById('icon'),
      label: this.shadowRoot.getElementById('label'),
    };

    this._bindListeners();
  }

  _bindListeners() {
    this._onClick = () => this._emitAction(this._config?.tap_action, 'tap');
    this._onKeyDown = (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      this._emitAction(this._config?.tap_action, 'keyboard');
    };

    this._els.chip.addEventListener('click', this._onClick);
    this._els.chip.addEventListener('keydown', this._onKeyDown);
  }

  _removeListeners() {
    if (!this._els) return;
    this._els.chip.removeEventListener('click', this._onClick);
    this._els.chip.removeEventListener('keydown', this._onKeyDown);
  }

  _isActive() {
    if (this._config?.active) return true;
    const entityId = this._config?.state_entity;
    if (!entityId || !this._hass?.states?.[entityId]) return false;

    const actual = String(this._hass.states[entityId].state ?? '');
    const expected = String(this._config.active_when ?? 'on');
    const operator = this._config.active_when_operator;

    if (operator === 'contains') return actual.includes(expected);
    if (operator === 'not_equals') return actual !== expected;
    return actual === expected;
  }

  _render() {
    const cfg = this._config || {};
    const { chip, icon, label } = this._els;

    const show = evaluateShowWhen(this._hass, cfg.show_when, cfg.state_entity || '');
    this.style.display = show ? '' : 'none';
    if (!show) return;

    chip.dataset.accent = cfg.accent || 'amber';
    chip.disabled = !!cfg.disabled;
    icon.textContent = cfg.icon || 'bolt';
    label.textContent = cfg.label || 'Action';

    const active = this._isActive();
    chip.classList.toggle('active', active);
    icon.classList.toggle('filled', active);
  }

  _emitAction(action, trigger) {
    const normalized = normalizeAction(action || { action: 'none' }, this._config?.state_entity || '');
    this.dispatchEvent(new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      detail: {
        action: normalized,
        entity_id: normalized.entity_id || this._config?.state_entity || '',
        source: 'action-chip',
        trigger,
      },
    }));
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetActionChip);
}

console.info(`%cTUNET-ACTION-CHIP ${VERSION}`, 'color:#007AFF;font-weight:700;');
