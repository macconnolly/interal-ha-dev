/**
 * Tunet Scenes Card
 * Custom Home Assistant card with glassmorphism design
 * Scene activation card with configurable scene tiles
 * Version 2.0.0 – Horizontal pill chips, scroll-snap
 */

const SCENES_CARD_VERSION = '2.0.0';

/* ===============================================================
   CSS
   =============================================================== */

const SCENES_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
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
    --green-fill: rgba(52,199,89,0.10);
    --green-border: rgba(52,199,89,0.22);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.22);
    --red: #FF3B30;
    --red-fill: rgba(255,59,48,0.10);
    --red-border: rgba(255,59,48,0.22);
    --track-bg: rgba(28,28,30,0.055);
    --r-card: 24px;
    --r-section: 38px;
    --r-tile: 16px;
    --r-pill: 999px;
    --parent-bg: rgba(255,255,255,0.35);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    display: block;
  }
  :host(.dark) {
    --glass: rgba(44,44,46,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #E8961E;
    --amber-fill: rgba(232,150,30,0.14);
    --amber-border: rgba(232,150,30,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.25);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.25);
    --red: #FF453A;
    --red-fill: rgba(255,69,58,0.14);
    --red-border: rgba(255,69,58,0.25);
    --track-bg: rgba(255,255,255,0.06);
    --parent-bg: rgba(255,255,255,0.05);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.25);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text); -webkit-font-smoothing: antialiased;
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

  .card {
    position: relative; width: 100%; border-radius: var(--r-section);
    background: var(--parent-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    box-shadow: var(--shadow-section); padding: 20px 20px 16px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .card::before {
    content: ''; position: absolute; inset: 0; border-radius: var(--r-section);
    padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40), rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

  .hdr { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
  .hdr-icon {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
    background: var(--amber-fill); color: var(--amber); border: 1px solid var(--amber-border);
    flex-shrink: 0;
  }
  .hdr-title { font-weight: 700; font-size: 14px; color: var(--text-sub); letter-spacing: 0.1px; }

  /* -- Scene Grid – Horizontal Pill Scroll -- */
  .scene-grid {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 4px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;
  }
  .scene-grid::-webkit-scrollbar { display: none; }

  /* -- Scene Pill Chip -- */
  .scene-tile {
    display: flex; flex-direction: row; align-items: center; gap: 8px;
    padding: 8px 14px 8px 8px; border-radius: var(--r-pill);
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh); cursor: pointer;
    transition: all 0.15s ease; user-select: none;
    scroll-snap-align: start;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .scene-tile:hover { box-shadow: var(--shadow-up); }
  .scene-tile:active { transform: scale(0.96); }

  .scene-icon-wrap {
    width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center;
    transition: all 0.2s ease; border: 1px solid transparent;
    background: var(--track-bg); color: var(--text-muted);
    flex-shrink: 0;
  }
  .scene-tile[data-accent="amber"] .scene-icon-wrap { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .scene-tile[data-accent="blue"] .scene-icon-wrap { background: var(--blue-fill); color: var(--blue); border-color: var(--blue-border); }
  .scene-tile[data-accent="green"] .scene-icon-wrap { background: var(--green-fill); color: var(--green); border-color: var(--green-border); }
  .scene-tile[data-accent="purple"] .scene-icon-wrap { background: var(--purple-fill); color: var(--purple); border-color: var(--purple-border); }
  .scene-tile[data-accent="red"] .scene-icon-wrap { background: var(--red-fill); color: var(--red); border-color: var(--red-border); }
  .scene-tile[data-accent] .scene-icon-wrap .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .scene-name {
    font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: 0.1px;
    line-height: 1; white-space: nowrap;
  }

  /* Active state (last activated) */
  .scene-tile.active {
    background: var(--amber-fill); border-color: var(--amber-border);
  }
  .scene-tile.active .scene-name { color: var(--amber); font-weight: 700; }

  /* Activation ripple */
  .scene-tile.activating .scene-icon-wrap {
    animation: sceneActivate 0.4s ease;
  }
  @keyframes sceneActivate {
    0% { transform: scale(1); }
    50% { transform: scale(1.12); }
    100% { transform: scale(1); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  @media (max-width: 440px) {
    .card { padding: 16px 16px 12px; }
    .scene-grid { gap: 6px; }
    .scene-tile { padding: 6px 12px 6px 6px; gap: 6px; }
    .scene-icon-wrap { width: 28px; height: 28px; border-radius: 8px; }
    .scene-icon-wrap .icon { font-size: 18px !important; }
    .scene-name { font-size: 12px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const SCENES_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card">
      <div class="hdr">
        <div class="hdr-icon">
          <span class="icon filled" style="font-size:18px">auto_awesome</span>
        </div>
        <span class="hdr-title" id="cardTitle">Scenes</span>
      </div>
      <div class="scene-grid" id="sceneGrid"></div>
    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetScenesCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._activeScene = null;
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
      link.rel = cfg.rel; link.href = cfg.href;
      if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
      document.head.appendChild(link);
    }
  }

  /*
   * Config: scenes is an array of scene objects:
   * {
   *   entity: 'scene.all_on',         // or 'script.xxx' for scripts
   *   name: 'All On',
   *   icon: 'lightbulb',
   *   accent: 'amber' | 'blue' | 'green' | 'purple' | 'red'
   * }
   */

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'columns', selector: { number: { min: 2, max: 4, step: 1, mode: 'box' } } },
        /*
         * Scenes are configured via YAML as an array.
         * Future: use HA 2026.x sub-form repeater.
         */
      ],
      computeLabel: (schema) => {
        const labels = { name: 'Card Name', columns: 'Grid Columns' };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Scenes',
      columns: 3,
      scenes: [
        { entity: '', name: 'All On', icon: 'lightbulb', accent: 'amber' },
        { entity: '', name: 'All Off', icon: 'power_settings_new', accent: 'muted' },
        { entity: '', name: 'Ready for Bed', icon: 'bedtime', accent: 'purple' },
        { entity: '', name: 'Movie Night', icon: 'movie', accent: 'blue' },
        { entity: '', name: 'Away', icon: 'directions_walk', accent: 'red' },
        { entity: '', name: 'Morning', icon: 'sunny', accent: 'amber' },
      ],
    };
  }

  setConfig(config) {
    if (!config.scenes || !Array.isArray(config.scenes) || config.scenes.length === 0) {
      throw new Error('Please define at least one scene');
    }
    this._config = {
      name: config.name || 'Scenes',
      columns: config.columns != null ? Math.max(2, Math.min(4, Number(config.columns))) : 3,
      scenes: config.scenes,
    };
    if (this._rendered) {
      this._buildGrid();
      this._updateAll();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildGrid();
      this._rendered = true;
    }
    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');
    // Scenes don't have on/off state typically, but update for availability
    if (!oldHass) this._updateAll();
  }

  getCardSize() {
    const rows = Math.ceil((this._config.scenes || []).length / (this._config.columns || 3));
    return 1 + rows * 2;
  }

  connectedCallback() {}
  disconnectedCallback() {}

  _render() {
    const style = document.createElement('style');
    style.textContent = SCENES_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = SCENES_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      card: this.shadowRoot.getElementById('card'),
      cardTitle: this.shadowRoot.getElementById('cardTitle'),
      sceneGrid: this.shadowRoot.getElementById('sceneGrid'),
    };
  }

  _buildGrid() {
    const grid = this.$.sceneGrid;
    grid.innerHTML = '';
    grid.style.setProperty('--cols', this._config.columns);

    this._tileEls = [];

    for (const sceneCfg of this._config.scenes) {
      const tile = document.createElement('div');
      tile.className = 'scene-tile';
      tile.dataset.accent = sceneCfg.accent || '';
      tile.dataset.entity = sceneCfg.entity || '';

      tile.innerHTML = `
        <div class="scene-icon-wrap">
          <span class="icon" style="font-size:20px">${sceneCfg.icon || 'auto_awesome'}</span>
        </div>
        <span class="scene-name">${sceneCfg.name || 'Scene'}</span>
      `;

      tile.addEventListener('click', () => this._activateScene(sceneCfg, tile));

      grid.appendChild(tile);
      this._tileEls.push({ el: tile, cfg: sceneCfg });
    }
  }

  _activateScene(sceneCfg, tileEl) {
    if (!this._hass || !sceneCfg.entity) return;

    const domain = sceneCfg.entity.split('.')[0];

    // Call appropriate service
    if (domain === 'scene') {
      this._hass.callService('scene', 'turn_on', { entity_id: sceneCfg.entity });
    } else if (domain === 'script') {
      this._hass.callService('script', 'turn_on', { entity_id: sceneCfg.entity });
    } else if (domain === 'automation') {
      this._hass.callService('automation', 'trigger', { entity_id: sceneCfg.entity });
    } else {
      // Generic homeassistant.turn_on
      this._hass.callService('homeassistant', 'turn_on', { entity_id: sceneCfg.entity });
    }

    // Visual feedback: mark as active + animate
    this._tileEls.forEach(ref => ref.el.classList.remove('active'));
    tileEl.classList.add('active', 'activating');
    setTimeout(() => tileEl.classList.remove('activating'), 400);
    this._activeScene = sceneCfg.entity;
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;
    this.$.cardTitle.textContent = this._config.name;
  }
}

/* ===============================================================
   Registration
   =============================================================== */

customElements.define('tunet-scenes-card', TunetScenesCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-scenes-card',
  name: 'Tunet Scenes Card',
  description: 'Glassmorphism scene activation card with configurable tiles',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-scenes-card',
});

console.info(
  `%c TUNET-SCENES-CARD %c v${SCENES_CARD_VERSION} `,
  'color: #fff; background: #AF52DE; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #AF52DE; background: #f5e6ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
