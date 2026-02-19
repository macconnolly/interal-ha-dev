/**
 * Tunet Actions Card
 * Quick action chips with state reflection and glassmorphism design
 * Version 1.0.0
 */

const TUNET_ACTIONS_VERSION = '1.0.0';

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

const TUNET_ACTIONS_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.55);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
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
    display: block;
  }

  :host(.dark) {
    --glass: rgba(255,255,255,0.06);
    --glass-border: rgba(255,255,255,0.10);
    --shadow: 0 1px 2px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.28), 0 12px 40px rgba(0,0,0,0.30);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.08);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.55);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #F0A030;
    --amber-fill: rgba(240,160,48,0.14);
    --amber-border: rgba(240,160,48,0.28);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.14);
    --blue-border: rgba(10,132,255,0.24);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.22);
    --ctrl-border: rgba(255,255,255,0.10);
    --tile-bg: rgba(255,255,255,0.08);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
  }

  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle; flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

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
    box-shadow: var(--shadow);
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
  .action-chip:hover { box-shadow: var(--shadow-up); }
  .action-chip:active { transform: scale(.96); }
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
    return { schema: [], computeLabel: () => '' };
  }

  static getStubConfig() {
    return {};
  }

  setConfig(config) {
    this._config = {
      actions: (config.actions || DEFAULT_ACTIONS).map(a => ({
        name: a.name || '',
        icon: a.icon || 'circle',
        accent: a.accent || 'amber',
        service: a.service || '',
        service_data: a.service_data || {},
        state_entity: a.state_entity || '',
        active_when: a.active_when || 'on',
      })),
    };
    if (this._rendered) this._buildChips();
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
    `;
    const tpl = document.createElement('template');
    tpl.innerHTML = fontLinks + `
      <div class="wrap">
        <div class="card">
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
    this._chipEls = [];

    for (const action of this._config.actions) {
      const chip = document.createElement('button');
      chip.className = 'action-chip';
      chip.dataset.accent = action.accent;

      const iconName = (action.icon || 'circle').replace(/^mdi:/, '');
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

      const isActive = entity.state === action.active_when;
      el.classList.toggle('active', isActive);

      const iconEl = el.querySelector('.icon');
      if (iconEl) iconEl.classList.toggle('filled', isActive);
    }
  }

  _callService(action) {
    if (!this._hass || !action.service) return;

    const [domain, service] = action.service.split('.');
    let serviceData = { ...action.service_data };

    // Sleep toggle: if already in Sleep, switch back to Adaptive
    if (action.active_when === 'Sleep' && action.state_entity) {
      const entity = this._hass.states[action.state_entity];
      if (entity && entity.state === 'Sleep') {
        serviceData = { ...serviceData, option: 'Adaptive' };
      }
    }

    this._hass.callService(domain, service, serviceData);
  }
}

customElements.define('tunet-actions-card', TunetActionsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-actions-card',
  name: 'Tunet Actions Card',
  description: 'Quick action chips with state reflection and glassmorphism design',
  preview: true,
});

console.info(
  `%c TUNET-ACTIONS-CARD %c v${TUNET_ACTIONS_VERSION} `,
  'color: #fff; background: #007AFF; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #007AFF; background: #e0f0ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
