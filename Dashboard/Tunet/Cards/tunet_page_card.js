/* ═══════════════════════════════════════════════════════════════
   Tunet Page Card — Dashboard Shell
   ═══════════════════════════════════════════════════════════════
   Wraps child cards in the mockup's page layout:
   - Full-bleed background (#f4f4f9 light / #0f172a dark)
   - Centered column (max-width 500px, 24px gap)
   - "Tunet Home" header with dynamic subtitle
   - Dark mode detection via hass.themes.darkMode
   ═══════════════════════════════════════════════════════════════ */

const PAGE_STYLES = `
  :host {
    display: block;
    --bg: #f4f4f9;
    --text-main: #1c1c1e;
    --text-sub: #8e8e93;
    --amber: #d4850a;
  }
  :host(.dark) {
    --bg: #0f172a;
    --text-main: #f8fafc;
    --text-sub: #94a3b8;
    --amber: #fbbf24;
  }

  *, *::before, *::after { box-sizing: border-box; }

  .page {
    background: var(--bg);
    min-height: 100vh;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
    color: var(--text-main);
    transition: background-color 0.4s ease, color 0.4s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .dashboard {
    width: 100%;
    max-width: 500px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .main-header {
    padding: 0 8px;
  }
  .main-header h1 {
    font-size: 28px;
    margin: 0;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--text-main);
  }
  .main-header .subtitle {
    color: var(--text-sub);
    margin: 4px 0 0;
    font-size: 15px;
    font-weight: 500;
  }

  .card-slot {
    width: 100%;
  }

  @media (max-width: 440px) {
    .page { padding: 16px 12px; }
    .dashboard { gap: 20px; }
  }
`;

class TunetPageCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._childCards = [];
    this._rendered = false;
    TunetPageCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetPageCard._fontsInjected) return;
    TunetPageCard._fontsInjected = true;
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
    ];
    for (const cfg of links) {
      if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
      const link = document.createElement('link');
      link.rel = cfg.rel; link.href = cfg.href;
      if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
      document.head.appendChild(link);
    }
  }

  setConfig(config) {
    if (!config.cards || !Array.isArray(config.cards)) {
      throw new Error('tunet-page-card requires a "cards" array');
    }
    this._config = {
      title: config.title || 'Tunet Home',
      subtitle: config.subtitle,
      subtitle_entity: config.subtitle_entity,
      cards: config.cards,
    };
    this._childCards = [];
    this._rendered = false;
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) this._render();

    // Dark mode toggle
    const isDark = !!(hass && hass.themes && hass.themes.darkMode);
    this.classList.toggle('dark', isDark);

    // Forward hass to all child cards
    for (const child of this._childCards) {
      if (child) child.hass = hass;
    }

    // Dynamic subtitle
    if (this._subtitleEl && this._config.subtitle_entity) {
      const entity = hass.states[this._config.subtitle_entity];
      if (entity) {
        this._subtitleEl.textContent = `Home Control \u2022 ${entity.state}`;
      }
    }
  }

  _render() {
    this._rendered = true;
    const sr = this.shadowRoot;
    sr.innerHTML = '';

    // Styles
    const style = document.createElement('style');
    style.textContent = PAGE_STYLES;
    sr.appendChild(style);

    // Font links in shadow DOM
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap';
    sr.appendChild(fontLink);

    // Page container
    const page = document.createElement('div');
    page.className = 'page';

    const dashboard = document.createElement('div');
    dashboard.className = 'dashboard';

    // Header
    const header = document.createElement('header');
    header.className = 'main-header';

    const h1 = document.createElement('h1');
    h1.textContent = this._config.title;
    header.appendChild(h1);

    const subtitle = document.createElement('p');
    subtitle.className = 'subtitle';
    subtitle.textContent = this._config.subtitle || 'Home Control';
    this._subtitleEl = subtitle;
    header.appendChild(subtitle);

    dashboard.appendChild(header);

    // Create child cards
    this._childCards = [];
    for (const cardConfig of this._config.cards) {
      const slot = document.createElement('div');
      slot.className = 'card-slot';

      const cardEl = this._createCard(cardConfig);
      if (cardEl) {
        slot.appendChild(cardEl);
        this._childCards.push(cardEl);
      }

      dashboard.appendChild(slot);
    }

    page.appendChild(dashboard);
    sr.appendChild(page);

    // Forward hass to newly created cards
    if (this._hass) {
      for (const child of this._childCards) {
        if (child) child.hass = this._hass;
      }
    }
  }

  _createCard(config) {
    // Handle HA native cards and custom cards
    const helpers = window.loadCardHelpers ? window.loadCardHelpers() : null;

    if (config.type && config.type.startsWith('custom:')) {
      const tag = config.type.replace('custom:', '');
      const el = document.createElement(tag);
      if (typeof el.setConfig === 'function') {
        try {
          el.setConfig(config);
        } catch (e) {
          console.warn(`[tunet-page] Failed to configure ${tag}:`, e);
          const err = document.createElement('div');
          err.style.cssText = 'padding:12px;color:red;font-size:12px;';
          err.textContent = `Config error: ${tag} - ${e.message}`;
          return err;
        }
      }
      return el;
    }

    // Native HA cards (like 'grid') — use helpers
    if (helpers && helpers.then) {
      const wrapper = document.createElement('div');
      helpers.then(h => {
        const card = h.createCardElement(config);
        if (this._hass) card.hass = this._hass;
        wrapper.appendChild(card);
        // Track for hass forwarding
        this._childCards.push(card);
      });
      return wrapper;
    }

    // Fallback: try createElement directly
    const tag = config.type;
    try {
      const el = document.createElement(`hui-${tag}-card`);
      if (typeof el.setConfig === 'function') el.setConfig(config);
      return el;
    } catch (e) {
      console.warn(`[tunet-page] Could not create card type: ${tag}`);
      return null;
    }
  }

  getCardSize() {
    return this._config.cards ? this._config.cards.length * 3 : 6;
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', label: 'Page title', selector: { text: {} }, default: 'Tunet Home' },
        { name: 'subtitle', label: 'Subtitle text', selector: { text: {} } },
        { name: 'subtitle_entity', label: 'Subtitle entity (optional)', selector: { entity: {} } },
      ],
    };
  }
}

TunetPageCard._fontsInjected = false;

if (!customElements.get('tunet-page-card')) {
  customElements.define('tunet-page-card', TunetPageCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some(c => c.type === 'tunet-page-card')) {
  window.customCards.push({
    type: 'tunet-page-card',
    name: 'Tunet Page Card',
    description: 'Dashboard page shell matching the Tunet mockup layout',
  });
}
