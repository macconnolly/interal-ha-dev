/**
 * Tunet Scene Chip (primitive)
 * Scene-focused chip with active reflection and event-only action payload.
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

const TAG = 'tunet-scene-chip';
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
  border-color: var(--amber-border);
  color: var(--amber);
  font-weight: 700;
}

.action-chip.active .icon {
  color: var(--amber);
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
`;

const TEMPLATE = `
${FONT_LINKS}
<button id="chip" class="action-chip" type="button">
  <span id="icon" class="icon">movie</span>
  <span id="label">Scene</span>
</button>
`;

class TunetSceneChip extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
  }

  setConfig(config) {
    const entity = config?.entity || '';
    const defaultAction = entity
      ? { action: 'call-service', service: 'scene.turn_on', target: { entity_id: entity }, entity_id: entity }
      : { action: 'none' };

    this._config = {
      entity,
      icon: normalizeTunetIcon(config?.icon || 'movie', 'movie'),
      label: config?.label || config?.name || 'Scene',
      active: config?.active === true,
      active_when: config?.active_when || null,
      show_when: config?.show_when || null,
      tap_action: normalizeAction(config?.tap_action || defaultAction, entity),
      hold_action: config?.hold_action ? normalizeAction(config.hold_action, entity) : null,
      double_tap_action: config?.double_tap_action ? normalizeAction(config.double_tap_action, entity) : null,
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

    if (typeof this._config?.active_when === 'string' && this._config.entity) {
      const state = this._hass?.states?.[this._config.entity]?.state;
      return String(state ?? '') === this._config.active_when;
    }

    return false;
  }

  _render() {
    const cfg = this._config || {};
    const { chip, icon, label } = this._els;

    const show = evaluateShowWhen(this._hass, cfg.show_when, cfg.entity || '');
    this.style.display = show ? '' : 'none';
    if (!show) return;

    icon.textContent = cfg.icon || 'movie';
    label.textContent = cfg.label || 'Scene';

    const active = this._isActive();
    chip.classList.toggle('active', active);
    icon.classList.toggle('filled', active);
  }

  _emitAction(action, trigger) {
    const normalized = normalizeAction(action || { action: 'none' }, this._config?.entity || '');
    this.dispatchEvent(new CustomEvent('tunet:action', {
      bubbles: true,
      composed: true,
      detail: {
        action: normalized,
        entity_id: normalized.entity_id || this._config?.entity || '',
        source: 'scene-chip',
        trigger,
      },
    }));
  }
}

if (!customElements.get(TAG)) {
  customElements.define(TAG, TunetSceneChip);
}

console.info(`%cTUNET-SCENE-CHIP ${VERSION}`, 'color:#007AFF;font-weight:700;');
