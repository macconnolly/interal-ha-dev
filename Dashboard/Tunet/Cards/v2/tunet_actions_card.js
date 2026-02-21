/**
 * Tunet Actions Card (v2 – composer)
 * Renders tunet-action-chip primitives and routes actions through runtime dispatch.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CARD_SURFACE,
  CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_action_chip.js';

const CARD_VERSION = '2.4.0';

const DEFAULT_ACTIONS = [
  {
    name: 'All On',
    icon: 'lightbulb',
    accent: 'amber',
    service: 'light.turn_on',
    service_data: { entity_id: 'light.all_adaptive_lights' },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'on',
  },
  {
    name: 'Pause',
    icon: 'auto_awesome',
    accent: 'blue',
    service: 'input_boolean.toggle',
    service_data: { entity_id: 'input_boolean.oal_system_paused' },
    state_entity: 'input_boolean.oal_system_paused',
    active_when: 'on',
  },
  {
    name: 'Sleep',
    icon: 'bed',
    accent: 'purple',
    service: 'input_select.select_option',
    service_data: {
      entity_id: 'input_select.oal_active_configuration',
      option: 'Sleep',
    },
    state_entity: 'input_select.oal_active_configuration',
    active_when: 'Sleep',
  },
  {
    name: 'All Off',
    icon: 'power_settings_new',
    accent: 'amber',
    service: 'light.turn_off',
    service_data: { entity_id: 'light.all_adaptive_lights' },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'off',
  },
];

const DEFAULT_MODE_ACTIONS = [
  {
    name: 'All On',
    icon: 'lightbulb',
    accent: 'amber',
    service: 'light.turn_on',
    service_data: { entity_id: 'light.all_adaptive_lights' },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'on',
  },
  {
    name: 'All Off',
    icon: 'power_settings_new',
    accent: 'amber',
    service: 'light.turn_off',
    service_data: { entity_id: 'light.all_adaptive_lights' },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'off',
  },
  {
    name: 'Bedtime',
    icon: 'bedtime',
    accent: 'amber',
    service: 'input_select.select_option',
    service_data: { entity_id: '__MODE_ENTITY__', option: 'Dim Ambient' },
    state_entity: '__MODE_ENTITY__',
    active_when: 'Dim Ambient',
  },
  {
    name: 'Sleep Mode',
    icon: 'bed',
    accent: 'amber',
    service: 'input_select.select_option',
    service_data: { entity_id: '__MODE_ENTITY__', option: 'Sleep' },
    state_entity: '__MODE_ENTITY__',
    active_when: 'Sleep',
  },
];

const STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}
${REDUCED_MOTION}

:host {
  display: block;
  font-size: 16px;
}

.card {
  width: 100%;
  gap: 0;
  overflow: visible;
  transition: background var(--motion-surface) var(--ease-standard), border-color var(--motion-surface) var(--ease-standard);
}

.card.compact {
  padding: 0.625em;
  border-radius: 1.25em;
}

.actions-row {
  display: flex;
  align-items: center;
  gap: 0.375em;
}

.actions-row.mode-strip tunet-action-chip {
  min-width: 0;
}

.actions-row tunet-action-chip {
  flex: 1;
  min-width: 0;
}

@media (max-width: 440px) {
  :host {
    font-size: 15px;
  }

  .card.compact {
    padding: 0.5em;
  }
}
`;

class TunetActionsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._chips = [];
    this._rendered = false;
    injectFonts();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'variant', selector: { select: { options: ['default', 'mode_strip'] } } },
        { name: 'mode_entity', selector: { entity: { filter: [{ domain: 'input_select' }] } } },
        { name: 'compact', selector: { boolean: {} } },
      ],
      computeLabel: (schema) => {
        const labels = {
          variant: 'Variant',
          mode_entity: 'Mode Entity',
          compact: 'Compact Layout',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return { variant: 'mode_strip', compact: true };
  }

  setConfig(config) {
    const variant = config.variant === 'mode_strip' ? 'mode_strip' : 'default';
    const modeEntity = config.mode_entity || 'input_select.oal_active_configuration';

    const sourceActions = Array.isArray(config.actions) && config.actions.length > 0
      ? config.actions
      : (variant === 'mode_strip'
        ? DEFAULT_MODE_ACTIONS.map((a) => {
            const next = { ...a, service_data: { ...(a.service_data || {}) } };
            if (next.state_entity === '__MODE_ENTITY__') next.state_entity = modeEntity;
            if (next.service_data.entity_id === '__MODE_ENTITY__') next.service_data.entity_id = modeEntity;
            return next;
          })
        : DEFAULT_ACTIONS);

    this._config = {
      variant,
      compact: config.compact !== false,
      mode_entity: modeEntity,
      actions: sourceActions.map((a) => ({
        name: a.name || '',
        icon: a.icon || 'circle',
        accent: a.accent || 'amber',
        state_entity: a.state_entity || '',
        active_when: a.active_when || 'on',
        active_when_operator: a.active_when_operator || 'equals',
        show_when: a.show_when || null,
        tap_action: a.tap_action || {
          action: 'call-service',
          service: a.service || '',
          service_data: { ...(a.service_data || {}) },
          entity_id: a.state_entity || a.service_data?.entity_id || '',
        },
        hold_action: a.hold_action || null,
        double_tap_action: a.double_tap_action || null,
      })),
    };

    if (this._rendered) {
      const card = this.shadowRoot.querySelector('.card');
      if (card) card.classList.toggle('compact', !!this._config.compact);
      this._buildChips();
      this._update();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    applyDarkClass(this, detectDarkMode(hass));

    const changed = this._config.actions?.some((action) => {
      if (!action.state_entity) return false;
      return !oldHass || oldHass.states[action.state_entity] !== hass.states[action.state_entity];
    });

    if (changed || !oldHass) this._update();
  }

  getCardSize() {
    if (this._config.compact) return 2;
    const actionCount = (this._config.actions || []).length;
    const rows = Math.max(1, Math.ceil(actionCount / 4));
    return 1 + rows;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const template = document.createElement('template');
    template.innerHTML = `${FONT_LINKS}
      <div class="wrap">
        <div class="card${this._config.compact ? ' compact' : ''}">
          <div class="actions-row" id="row"></div>
        </div>
      </div>`;
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this._row = this.shadowRoot.getElementById('row');
    this._row.addEventListener('tunet:action', (e) => {
      const action = e.detail?.action;
      const entityId = e.detail?.entity_id || action?.entity_id || '';
      if (!action) return;
      dispatchAction(this._hass, this, action, entityId).catch(() => this._update());
    });

    this._buildChips();
  }

  _buildChips() {
    if (!this._row) return;

    this._row.innerHTML = '';
    this._row.classList.toggle('mode-strip', this._config.variant === 'mode_strip');
    this._chips = [];

    for (const action of this._config.actions || []) {
      const chip = document.createElement('tunet-action-chip');
      chip.setConfig({
        icon: action.icon,
        label: action.name,
        accent: action.accent,
        state_entity: action.state_entity,
        active_when: action.active_when,
        active_when_operator: action.active_when_operator,
        show_when: action.show_when,
        tap_action: action.tap_action,
        hold_action: action.hold_action,
        double_tap_action: action.double_tap_action,
      });
      if (this._hass) chip.hass = this._hass;
      this._row.appendChild(chip);
      this._chips.push(chip);
    }
  }

  _update() {
    if (!this._hass) return;
    for (const chip of this._chips) {
      chip.hass = this._hass;
    }
  }
}

registerCard('tunet-actions-card', TunetActionsCard, {
  name: 'Tunet Actions Card',
  description: 'Quick action chips composed from tunet-action-chip primitives',
  preview: true,
});

logCardVersion('TUNET-ACTIONS', CARD_VERSION, '#007AFF');
