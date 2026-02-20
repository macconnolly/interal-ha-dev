/**
 * Tunet Scenes Card
 * Quick scene activation chips with glassmorphism design
 * Version 1.0.0
 */

const TUNET_SCENES_VERSION = '1.0.0';

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
    async callServiceSafe(host, domain, service, data = {}, options = {}) {
      const hass = host && host._hass ? host._hass : host;
      if (!hass || !domain || !service) return false;
      try {
        const result = hass.callService(domain, service, data || {});
        if (result && typeof result.then === 'function') await result;
        return true;
      } catch (error) {
        console.error(`[Tunet] callService failed: ${domain}.${service}`, error);
        if (typeof options.onError === 'function') options.onError(error);
        return false;
      }
    },
  };
}

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

  /* Midnight Navy */
  :host(.dark) {
    --glass: rgba(30,41,59,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36,0.14);
    --amber-border: rgba(251,191,36,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.18);
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
  .scene-chip:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
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
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
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
      chip.type = 'button';
      chip.className = 'scene-chip';
      chip.dataset.accent = scene.accent;

      const iconName = window.TunetCardFoundation.normalizeIcon(scene.icon || 'lightbulb', {
        fallback: 'lightbulb',
      });
      const icon = document.createElement('span');
      icon.className = 'icon filled';
      icon.textContent = iconName;
      chip.appendChild(icon);
      chip.appendChild(document.createTextNode(` ${scene.name || scene.entity || 'Scene'}`));

      chip.addEventListener('click', () => {
        if (!this._hass || !scene.entity) return;
        const domain = scene.entity.split('.')[0];
        window.TunetCardFoundation.callServiceSafe(this, domain, 'turn_on', { entity_id: scene.entity });

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
