/**
 * Tunet Scenes Card
 * Quick scene activation chips with glassmorphism design
 * Version 1.0.0
 */

const TUNET_SCENES_VERSION = '1.0.0';

const TUNET_SCENES_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.55);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10,0.10);
    --amber-border: rgba(212,133,10,0.22);
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.18);
    --red: #FF3B30;
    --red-fill: rgba(255,59,48,0.10);
    --red-border: rgba(255,59,48,0.22);
    --r-pill: 999px;
    display: block;
  }

  :host(.dark) {
    --glass: rgba(255,255,255,0.06);
    --glass-border: rgba(255,255,255,0.10);
    --shadow: 0 1px 2px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.28), 0 12px 40px rgba(0,0,0,0.30);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.55);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #F0A030;
    --amber-fill: rgba(240,160,48,0.14);
    --amber-border: rgba(240,160,48,0.28);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.14);
    --blue-border: rgba(10,132,255,0.24);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.20);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.22);
    --red: #FF453A;
    --red-fill: rgba(255,69,58,0.14);
    --red-border: rgba(255,69,58,0.25);
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

  .scene-row {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .scene-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 10px 16px;
    border-radius: var(--r-pill);
    background: var(--glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--glass-border);
    box-shadow: var(--shadow);
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    cursor: pointer;
    transition: all .15s ease;
    white-space: nowrap;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }
  .scene-chip:hover { box-shadow: var(--shadow-up); }
  .scene-chip:active { transform: scale(.96); }
  .scene-chip .icon { font-size: 16px; width: 16px; height: 16px; }

  .scene-chip[data-accent="amber"] .icon { color: var(--amber); }
  .scene-chip[data-accent="blue"] .icon { color: var(--blue); }
  .scene-chip[data-accent="purple"] .icon { color: var(--purple); }
  .scene-chip[data-accent="red"] .icon { color: var(--red); }
  .scene-chip[data-accent="green"] .icon { color: var(--green); }

  .scene-chip.active {
    background: var(--amber-fill);
    border-color: var(--amber-border);
    color: var(--amber);
  }
  .scene-chip.active .icon { color: var(--amber); }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

class TunetScenesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    TunetScenesCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetScenesCard._fontsInjected) return;
    TunetScenesCard._fontsInjected = true;
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
    return {
      schema: [
        {
          name: 'scenes',
          type: 'expandable',
          title: 'Scenes',
          schema: [
            { name: 'entity', required: true, selector: { entity: { domain: ['scene', 'script'] } } },
            { name: 'name', selector: { text: {} } },
            { name: 'icon', selector: { icon: {} } },
            { name: 'accent', selector: { select: { options: ['amber', 'blue', 'green', 'purple', 'red'] } } },
          ],
        },
      ],
      computeLabel: (s) => {
        const labels = { scenes: 'Scenes', entity: 'Entity', name: 'Name', icon: 'Icon', accent: 'Accent Color' };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return { scenes: [] };
  }

  setConfig(config) {
    this._config = {
      scenes: (config.scenes || []).map(s => ({
        entity: s.entity || '',
        name: s.name || '',
        icon: s.icon || 'lightbulb',
        accent: s.accent || 'amber',
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
  }

  getCardSize() {
    return 1;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SCENES_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    // Font links inside shadow DOM for fallback
    const fontLinks = `
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
    `;
    const tpl = document.createElement('template');
    tpl.innerHTML = fontLinks + '<div class="wrap"><div class="scene-row" id="row"></div></div>';
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._row = this.shadowRoot.getElementById('row');
    this._buildChips();
  }

  _buildChips() {
    if (!this._row) return;
    this._row.innerHTML = '';

    for (const scene of this._config.scenes) {
      const chip = document.createElement('button');
      chip.className = 'scene-chip';
      chip.dataset.accent = scene.accent;

      // Map MDI icon names to Material Symbols names if needed
      const iconName = (scene.icon || 'lightbulb').replace(/^mdi:/, '');
      chip.innerHTML = `<span class="icon filled">${iconName}</span> ${scene.name || scene.entity}`;

      chip.addEventListener('click', () => {
        if (!this._hass || !scene.entity) return;
        const domain = scene.entity.split('.')[0];
        this._hass.callService(domain, 'turn_on', { entity_id: scene.entity });

        chip.classList.add('active');
        setTimeout(() => chip.classList.remove('active'), 1200);
      });

      this._row.appendChild(chip);
    }
  }
}

if (!customElements.get('tunet-scenes-card')) {
  customElements.define('tunet-scenes-card', TunetScenesCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-scenes-card')) {
  window.customCards.push({
    type: 'tunet-scenes-card',
    name: 'Tunet Scenes Card',
    description: 'Quick scene activation chips with glassmorphism design',
    preview: true,
  });
}

console.info(
  `%c TUNET-SCENES-CARD %c v${TUNET_SCENES_VERSION} `,
  'color: #fff; background: #AF52DE; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #AF52DE; background: #f3e8ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
