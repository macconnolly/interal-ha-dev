/**
 * Tunet Actions Card (v2 – ES Module)
 * Quick action chips with state reflection and glassmorphism design
 * Version 2.4.4
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
  runCardAction,
  registerCard,
  logCardVersion,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '2.4.4';

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

const ACCENT_OPTIONS = ['amber', 'blue', 'purple', 'green', 'red', 'muted'];
const ACTIVE_OPERATORS = ['equals', 'not_equals', 'contains'];
const SHOW_WHEN_OPERATORS = ['equals', 'not_equals', 'contains', 'gt', 'gte', 'lt', 'lte'];

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

function evaluateCondition(hass, condition) {
  if (!hass || !condition || !condition.entity) return true;
  const entity = hass.states[condition.entity];
  if (!entity) return false;

  const attr = condition.attribute;
  const actualRaw = attr ? entity.attributes?.[attr] : entity.state;
  const expectedRaw = condition.state;
  const actual = String(actualRaw ?? '');
  const expected = String(expectedRaw ?? '');
  const op = String(condition.operator || 'equals');
  const actualNum = Number(actualRaw);
  const expectedNum = Number(expectedRaw);

  if (op === 'not_equals') return actual !== expected;
  if (op === 'contains') return actual.includes(expected);
  if (op === 'gt') return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum > expectedNum;
  if (op === 'gte') return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum >= expectedNum;
  if (op === 'lt') return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum < expectedNum;
  if (op === 'lte') return Number.isFinite(actualNum) && Number.isFinite(expectedNum) && actualNum <= expectedNum;
  return actual === expected;
}

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 2px 6px rgba(0,0,0,0.04), 0 0.5px 1.5px rgba(0,0,0,0.06);
    --tile-shadow-lift: 0 6px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
    display: block;
    font-size: 16px; /* em anchor - everything below scales from this */
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
  .card.compact { padding: 0.625em; border-radius: 1.25em; }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* Action chip row */
  .actions-row {
    display: flex;
    gap: 0.42em;
  }
  .actions-row.mode-strip .action-chip {
    min-height: 2.52em;
    padding: 0.56em 0.34em;
    border-radius: 0.875em;
    font-size: var(--type-chip, 12.5px);
    font-weight: 700;
  }

  /* Individual action chip */
  .action-chip {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.36em;
    min-height: 2.52em;
    padding: 0.56em 0.34em;
    border-radius: 0.875em;
    background: var(--tile-bg);
    box-shadow: var(--tile-shadow-rest);
    font-family: inherit;
    font-size: var(--type-chip, 12.5px);
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.01em;
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
    outline-offset: 2px;
  }
  .action-chip .icon { font-size: 1.3em; width: 1.3em; height: 1.3em; color: var(--text-muted); }
  .action-chip.hidden { display: none !important; }

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
    :host { font-size: 16px; }
    .card.compact { padding: 0.56em; }
    .action-chip { gap: 0.32em; }
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

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'variant', selector: { select: { options: ['default', 'mode_strip'] } } },
        { name: 'mode_entity', selector: { entity: { filter: [{ domain: 'input_select' }] } } },
        { name: 'compact', selector: { boolean: {} } },
        {
          name: 'actions',
          selector: {
            object: {
              multiple: true,
              label_field: 'name',
              description_field: 'service',
              fields: {
                name: { label: 'Name', required: true, selector: { text: {} } },
                icon: { label: 'Icon', selector: { icon: {} } },
                accent: { label: 'Accent', selector: { select: { options: ACCENT_OPTIONS } } },
                service: { label: 'Service (domain.service)', required: true, selector: { text: {} } },
                entity_id: { label: 'Service Target Entity', selector: { entity: {} } },
                option: { label: 'Option (for select_option)', selector: { text: {} } },
                state_entity: { label: 'State Entity', selector: { entity: {} } },
                active_when: { label: 'Active When Value', selector: { text: {} } },
                active_when_operator: { label: 'Active Operator', selector: { select: { options: ACTIVE_OPERATORS } } },
                show_when_entity: { label: 'Show-When Entity', selector: { entity: {} } },
                show_when_attribute: { label: 'Show-When Attribute', selector: { text: {} } },
                show_when_operator: { label: 'Show-When Operator', selector: { select: { options: SHOW_WHEN_OPERATORS } } },
                show_when_state: { label: 'Show-When Value', selector: { text: {} } },
              },
            },
          },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          variant: 'Variant',
          mode_entity: 'Mode Entity',
          compact: 'Compact Layout',
          actions: 'Actions',
        };
        return labels[schema.name] || schema.name;
      },
      computeHelper: (schema) => {
        const helpers = {
          actions: 'Structured action editor. Existing YAML action objects still work. entity_id/option synthesize service_data when not explicitly provided in YAML.',
        };
        return helpers[schema.name] || '';
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

    const normalizeAction = (a) => {
      const serviceData = (a && typeof a.service_data === 'object' && a.service_data != null)
        ? { ...a.service_data }
        : {};
      const targetEntity = a?.entity_id || a?.service_entity || '';
      if (targetEntity && !serviceData.entity_id) serviceData.entity_id = targetEntity;
      if (a?.option != null && a.option !== '' && serviceData.option == null) serviceData.option = a.option;

      let showWhen = null;
      if (a?.show_when && typeof a.show_when === 'object') {
        showWhen = a.show_when;
      } else if (a?.show_when_entity) {
        showWhen = {
          entity: a.show_when_entity,
          attribute: a.show_when_attribute || undefined,
          operator: a.show_when_operator || 'equals',
          state: a.show_when_state ?? 'on',
        };
      }

      return {
        name: a?.name || '',
        icon: a?.icon || 'circle',
        accent: a?.accent || 'amber',
        service: a?.service || '',
        service_data: serviceData,
        state_entity: a?.state_entity || '',
        active_when: a?.active_when || 'on',
        active_when_operator: a?.active_when_operator || 'equals',
        show_when: showWhen,
        tap_action: a?.tap_action || null,
      };
    };

    this._config = {
      variant,
      compact: config.compact !== false,
      mode_entity: modeEntity,
      actions: sourceActions.map((a) => normalizeAction(a)),
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

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 1,
    };
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

      chip.addEventListener('click', () => this._runAction(action));

      this._row.appendChild(chip);
      this._chipEls.push({ el: chip, action });
    }

    this._update();
  }

  _update() {
    if (!this._hass || !this._chipEls) return;

    for (const { el, action } of this._chipEls) {
      const shouldShow = evaluateCondition(this._hass, action.show_when);
      el.classList.toggle('hidden', !shouldShow);

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

  _runAction(action) {
    if (!this._hass || !action) return;

    if (action.tap_action && typeof action.tap_action === 'object') {
      const ran = runCardAction({
        element: this,
        hass: this._hass,
        actionConfig: action.tap_action,
        defaultEntityId: action.state_entity || '',
      });
      if (ran) return;
    }

    this._callService(action);
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
