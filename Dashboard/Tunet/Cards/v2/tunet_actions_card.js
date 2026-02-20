/**
 * Tunet Actions Card (v2 – ES Module)
 * Quick action chips with state reflection and glassmorphism design
 * Version 2.2.0
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

const CARD_VERSION = '2.2.0';

// ═══════════════════════════════════════════════════════════
// Default action configs (card-specific)
// ═══════════════════════════════════════════════════════════

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
    service_data: {
      entity_id: 'light.all_adaptive_lights',
    },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'on',
  },
  {
    name: 'All Off',
    icon: 'power_settings_new',
    accent: 'amber',
    service: 'light.turn_off',
    service_data: {
      entity_id: 'light.all_adaptive_lights',
    },
    state_entity: 'light.all_adaptive_lights',
    active_when: 'off',
  },
  {
    name: 'Bedtime',
    icon: 'bedtime',
    accent: 'amber',
    service: 'input_select.select_option',
    service_data: {
      entity_id: '__MODE_ENTITY__',
      option: 'Dim Ambient',
    },
    state_entity: '__MODE_ENTITY__',
    active_when: 'Dim Ambient',
  },
  {
    name: 'Sleep Mode',
    icon: 'bed',
    accent: 'amber',
    service: 'input_select.select_option',
    service_data: {
      entity_id: '__MODE_ENTITY__',
      option: 'Sleep',
    },
    state_entity: '__MODE_ENTITY__',
    active_when: 'Sleep',
  },
];

const ICON_ALIASES = {
  day: 'wb_sunny',
  nightlight: 'bedtime',
  floor_lamp: 'lamp',
  table_lamp: 'lamp',
  desk_lamp: 'desk',
  shelf_auto: 'shelves',
  countertops: 'kitchen',
};

function normalizeIcon(icon) {
  if (!icon) return 'lightbulb';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  return ICON_ALIASES[raw] || raw || 'lightbulb';
}

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    display: block;
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
  .card.compact { padding: 12px; border-radius: 20px; }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Action chip row */
  .actions-row {
    display: flex;
    gap: 8px;
  }
  .actions-row.mode-strip .action-chip {
    padding: 12px 6px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    min-height: 52px;
  }

  /* Individual action chip */
  .action-chip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 4px;
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    box-shadow: var(--tile-shadow-rest);
    font-family: inherit;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: .1px;
    cursor: pointer;
    transition: all .15s ease;
    user-select: none;
    white-space: nowrap;
    border: 1px solid transparent;
    -webkit-tap-highlight-color: transparent;
  }
  .action-chip:hover { box-shadow: var(--tile-shadow-lift); }
  .action-chip:active { transform: scale(.96); }
  .action-chip:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .action-chip .icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-muted); }

  /* Active state: default (amber) */
  .action-chip.active {
    border-color: var(--amber-border);
    color: var(--amber);
    font-weight: 700;
  }
  .action-chip.active .icon {
    color: var(--amber);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Active state: blue accent */
  .action-chip[data-accent="blue"].active {
    border-color: var(--blue-border);
    color: var(--blue);
  }
  .action-chip[data-accent="blue"].active .icon { color: var(--blue); }

  /* Active state: purple accent */
  .action-chip[data-accent="purple"].active {
    border-color: var(--purple-border);
    color: var(--purple);
  }
  .action-chip[data-accent="purple"].active .icon { color: var(--purple); }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .action-chip { font-size: 10px; padding: 9px 2px; gap: 4px; }
    .action-chip .icon { font-size: 16px; width: 16px; height: 16px; }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_ACTIONS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetActionsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._chipEls = [];
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
        service: a.service || '',
        service_data: a.service_data || {},
        state_entity: a.state_entity || '',
        active_when: a.active_when || 'on',
        active_when_operator: a.active_when_operator || 'equals',
      })),
    };
    if (this._rendered) {
      const card = this.shadowRoot.querySelector('.card');
      if (card) card.classList.toggle('compact', !!this._config.compact);
      this._buildChips();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    const changed = this._config.actions.some(a =>
      a.state_entity && (!oldHass || oldHass.states[a.state_entity] !== hass.states[a.state_entity])
    );
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
    style.textContent = TUNET_ACTIONS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card${this._config.compact ? ' compact' : ''}">
          <div class="actions-row" id="row"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._row = this.shadowRoot.getElementById('row');
    this._buildChips();
  }

  _buildChips() {
    if (!this._row) return;
    this._row.innerHTML = '';
    this._row.classList.toggle('mode-strip', this._config.variant === 'mode_strip');
    this._chipEls = [];

    for (const action of this._config.actions) {
      const chip = document.createElement('button');
      chip.className = 'action-chip';
      chip.dataset.accent = action.accent;

      const iconName = normalizeIcon(action.icon || 'circle');
      chip.innerHTML = `<span class="icon">${iconName}</span> ${action.name}`;

      chip.addEventListener('click', () => this._callService(action));

      this._row.appendChild(chip);
      this._chipEls.push({ el: chip, action });
    }

    this._update();
  }

  _update() {
    if (!this._hass || !this._chipEls) return;

    for (const { el, action } of this._chipEls) {
      if (!action.state_entity) {
        el.classList.remove('active');
        continue;
      }

      const entity = this._hass.states[action.state_entity];
      if (!entity) {
        el.classList.remove('active');
        continue;
      }

      const stateValue = String(entity.state ?? '');
      const expected = String(action.active_when ?? '');
      let isActive;
      if (action.active_when_operator === 'contains') {
        isActive = stateValue.includes(expected);
      } else if (action.active_when_operator === 'not_equals') {
        isActive = stateValue !== expected;
      } else {
        isActive = stateValue === expected;
      }
      el.classList.toggle('active', isActive);

      const iconEl = el.querySelector('.icon');
      if (iconEl) iconEl.classList.toggle('filled', isActive);
    }
  }

  _callService(action) {
    if (!this._hass || !action.service) return;

    const [domain, service] = action.service.split('.');
    const serviceData = { ...action.service_data };
    this._hass.callService(domain, service, serviceData);
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-actions-card', TunetActionsCard, {
  name: 'Tunet Actions Card',
  description: 'Quick action chips with state reflection and glassmorphism design',
  preview: true,
});

logCardVersion('TUNET-ACTIONS', CARD_VERSION, '#007AFF');
