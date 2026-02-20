/**
 * Tunet Actions Card
 * Quick action chips with state reflection and glassmorphism design
 * Version 2.0.0
 */

const TUNET_ACTIONS_VERSION = '2.1.0';

if (!window.TunetCardFoundation) {
  window.TunetCardFoundation = {
    escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    normalizeIcon(icon, options = {}) {
      const fallback = options.fallback || 'lightbulb';
      const aliases = options.aliases || {};
      const allow = options.allow || null;
      if (!icon) return fallback;
      const raw = String(icon).replace(/^mdi:/, '').trim();
      const resolved = aliases[raw] || raw;
      if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return fallback;
      if (allow && allow.size && !allow.has(resolved)) return fallback;
      return resolved;
    },
    bindActivate(el, handler, options = {}) {
      if (!el || typeof handler !== 'function') return () => {};
      const role = options.role || 'button';
      const tabindex = options.tabindex != null ? options.tabindex : 0;
      if (!el.hasAttribute('role')) el.setAttribute('role', role);
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', String(tabindex));
      const onClick = (e) => {
        if (options.stopPropagation) e.stopPropagation();
        handler(e);
      };
      const onKey = (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (options.stopPropagation) e.stopPropagation();
        handler(e);
      };
      el.addEventListener('click', onClick);
      el.addEventListener('keydown', onKey);
      return () => {
        el.removeEventListener('click', onClick);
        el.removeEventListener('keydown', onKey);
      };
    },
    async callServiceSafe(host, domain, service, data = {}, options = {}) {
      const hass = host && host._hass ? host._hass : host;
      if (!hass || !domain || !service) return false;
      const pendingEl = options.pendingEl || null;
      if (pendingEl) {
        pendingEl.classList.add('is-pending');
        if ('disabled' in pendingEl) pendingEl.disabled = true;
      }
      try {
        const result = hass.callService(domain, service, data || {});
        if (result && typeof result.then === 'function') await result;
        return true;
      } catch (error) {
        console.error(`[Tunet] callService failed: ${domain}.${service}`, error);
        if (typeof options.onError === 'function') options.onError(error);
        if (host && typeof host.dispatchEvent === 'function') {
          host.dispatchEvent(new CustomEvent('tunet-service-error', {
            bubbles: true,
            composed: true,
            detail: {
              domain,
              service,
              data,
              error: String(error && error.message ? error.message : error),
            },
          }));
        }
        return false;
      } finally {
        if (pendingEl) {
          pendingEl.classList.remove('is-pending');
          if ('disabled' in pendingEl) pendingEl.disabled = false;
        }
      }
    },
  };
}

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
    service_data: {
      entity_id: 'input_select.oal_active_configuration',
      option: 'Dim Ambient',
    },
    state_entity: 'input_select.oal_active_configuration',
    active_when: 'Dim Ambient',
  },
  {
    name: 'Sleep Mode',
    icon: 'bed',
    accent: 'amber',
    service: 'input_select.select_option',
    service_data: {
      entity_id: 'input_select.oal_active_configuration',
      option: 'Sleep',
    },
    state_entity: 'input_select.oal_active_configuration',
    active_when: 'Sleep',
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
  return window.TunetCardFoundation.normalizeIcon(icon, {
    aliases: ICON_ALIASES,
    fallback: 'lightbulb',
  });
}

const TUNET_ACTIONS_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0,0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10,0.10);
    --amber-border: rgba(212,133,10,0.22);
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.18);
    --r-card: 24px;
    --r-tile: 16px;
    --ctrl-border: rgba(0,0,0,0.05);
    --tile-bg: rgba(255,255,255,0.92);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    display: block;
  }

  /* Midnight Navy */
  :host(.dark) {
    --glass: rgba(30,41,59,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36,0.14);
    --amber-border: rgba(251,191,36,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.22);
    --ctrl-border: rgba(255,255,255,0.08);
    --tile-bg: rgba(30,41,59,0.90);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .icon {
    font-family: 'Material Symbols Outlined', 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle; flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }

  /* Glass card shell */
  .card {
    position: relative; width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex; flex-direction: column; gap: 0;
    transition: background .3s, border-color .3s;
  }
  .card.compact { padding: 12px; border-radius: 20px; }
  .card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

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

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

class TunetActionsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._chipEls = [];
    TunetActionsCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetActionsCard._fontsInjected) return;
    TunetActionsCard._fontsInjected = true;
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
    ];
    for (const cfg of links) {
      if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
      const link = document.createElement('link');
      link.rel = cfg.rel;
      link.href = cfg.href;
      if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
      document.head.appendChild(link);
    }
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'variant', selector: { select: { options: ['default', 'mode_strip'] } } },
        { name: 'mode_entity', selector: { entity: { domain: ['input_select'] } } },
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

    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');

    const changed = this._config.actions.some(a =>
      a.state_entity && (!oldHass || oldHass.states[a.state_entity] !== hass.states[a.state_entity])
    );
    if (changed || !oldHass) this._update();
  }

  getCardSize() {
    return 1;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ACTIONS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const fontLinks = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
    `;
    const tpl = document.createElement('template');
    tpl.innerHTML = fontLinks + `
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
      chip.type = 'button';
      chip.className = 'action-chip';
      chip.dataset.accent = action.accent;

      const iconName = normalizeIcon(action.icon || 'circle');
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.textContent = iconName;
      chip.appendChild(icon);
      chip.appendChild(document.createTextNode(` ${action.name || ''}`));

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

  async _callService(action) {
    if (!this._hass || !action.service) return;

    const [domain, service] = action.service.split('.');
    const serviceData = { ...action.service_data };
    await window.TunetCardFoundation.callServiceSafe(this, domain, service, serviceData);
  }
}

if (!customElements.get('tunet-actions-card')) {
  customElements.define('tunet-actions-card', TunetActionsCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-actions-card')) {
  window.customCards.push({
    type: 'tunet-actions-card',
    name: 'Tunet Actions Card',
    description: 'Quick action chips with state reflection and glassmorphism design',
    preview: true,
  });
}

console.info(
  `%c TUNET-ACTIONS-CARD %c v${TUNET_ACTIONS_VERSION} `,
  'color: #fff; background: #007AFF; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #007AFF; background: #e0f0ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
