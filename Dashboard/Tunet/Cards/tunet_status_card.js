/**
 * Tunet Status Card
 * Home status grid with typed tiles: indicator, timer, value, dropdown
 * Version 2.0.0
 */

const TUNET_STATUS_VERSION = '2.0.0';

const TUNET_STATUS_STYLES = `
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
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --red: #FF3B30;
    --tile-bg: rgba(255,255,255,0.92);
    --track-bg: rgba(28,28,30,0.055);
    --r-card: 24px;
    --r-tile: 16px;
    --ctrl-border: rgba(0,0,0,0.05);
    --dd-bg: rgba(255,255,255,0.92);
    --dd-border: rgba(255,255,255,0.60);
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
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.20);
    --red: #FF453A;
    --tile-bg: rgba(255,255,255,0.08);
    --track-bg: rgba(255,255,255,0.06);
    --ctrl-border: rgba(255,255,255,0.10);
    --dd-bg: rgba(58,58,60,0.92);
    --dd-border: rgba(255,255,255,0.08);
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

  .card {
    position: relative; width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex; flex-direction: column; gap: 16px;
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

  .hdr {
    display: flex; align-items: center; justify-content: space-between; padding: 0 4px;
  }
  .hdr-title {
    font-size: 16px; font-weight: 700; color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .hdr-title .icon { color: var(--blue); }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .tile {
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--shadow);
    padding: 14px 8px 10px;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: all .15s ease;
    position: relative;
    overflow: visible;
  }
  .tile:hover { box-shadow: var(--shadow-up); }
  .tile:active { transform: scale(.97); }

  .tile-icon {
    width: 28px; height: 28px;
    display: grid; place-items: center;
    margin-bottom: 2px;
  }
  .tile[data-accent="amber"] .tile-icon { color: var(--amber); }
  .tile[data-accent="amber"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="blue"] .tile-icon { color: var(--blue); }
  .tile[data-accent="blue"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="green"] .tile-icon { color: var(--green); }
  .tile[data-accent="green"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="muted"] .tile-icon { color: var(--text-muted); }

  .tile-val {
    font-size: 18px; font-weight: 700; letter-spacing: -.2px; line-height: 1;
    color: var(--text); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap;
  }
  .tile-label {
    font-size: 9px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase;
    color: var(--text-muted); line-height: 1; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  .tile-deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }

  /* Status dots */
  .status-dot {
    width: 6px; height: 6px; border-radius: 999px;
    position: absolute; top: 10px; right: 10px;
    display: none;
  }
  .status-dot.green { background: var(--green); display: block; }
  .status-dot.amber { background: var(--amber); display: block; }
  .status-dot.red { background: var(--red); display: block; }
  .status-dot.blue { background: var(--blue); display: block; }
  .status-dot.muted { background: var(--text-muted); opacity: 0.5; display: block; }

  /* Conditional visibility */
  .tile.tile-hidden { display: none !important; }

  /* Timer tile — monospace countdown */
  .tile[data-type="timer"] .tile-val {
    letter-spacing: 0.5px;
  }

  /* Dropdown tile */
  .tile-dd-val {
    display: flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  .tile-dd-val .chevron {
    font-size: 14px; width: 14px; height: 14px;
    color: var(--text-muted);
    transition: transform .2s ease;
    flex-shrink: 0;
  }
  .tile-dd-val[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }

  /* Dropdown menu */
  .tile-dd-menu {
    position: absolute;
    top: calc(100% + 4px);
    left: 50%;
    transform: translateX(-50%);
    min-width: 140px;
    max-width: 200px;
    max-height: 240px;
    overflow-y: auto;
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 20;
    display: none;
    flex-direction: column;
    gap: 1px;
  }
  .tile-dd-menu.open {
    display: flex;
    animation: ddMenuIn .14s ease forwards;
  }
  @keyframes ddMenuIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .tile-dd-opt {
    padding: 8px 10px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background .1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-dd-opt:hover { background: var(--track-bg); }
  .tile-dd-opt:active { transform: scale(.97); }
  .tile-dd-opt.active {
    font-weight: 700;
    background: var(--blue-fill);
    color: var(--blue);
  }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .grid { grid-template-columns: repeat(2, 1fr); }
    .tile-val { font-size: 16px; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

class TunetStatusCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._timerIntervals = [];
    this._openDropdown = null;
    this._onDocClick = this._onDocClick.bind(this);
    TunetStatusCard._injectFonts();
  }

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    this._clearAllTimers();
  }

  static _injectFonts() {
    if (TunetStatusCard._fontsInjected) return;
    TunetStatusCard._fontsInjected = true;
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

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'columns', selector: { number: { min: 2, max: 6, step: 1, mode: 'box' } } },
      ],
      computeLabel: (s) => {
        const labels = { name: 'Card Title', columns: 'Columns' };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return { name: 'Home Status', tiles: [] };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Home Status',
      columns: config.columns || 4,
      tiles: (config.tiles || []).map(t => {
        const type = t.type || 'value';
        const base = {
          type,
          entity: t.entity || '',
          icon: t.icon || 'info',
          label: t.label || '',
          accent: t.accent || 'muted',
          show_when: t.show_when || null,
        };

        if (type === 'indicator') {
          base.format = t.format || 'state';
          base.unit = t.unit || '';
          base.dot_rules = t.dot_rules || [];
        } else if (type === 'timer') {
          // No extra config
        } else if (type === 'dropdown') {
          // No extra config
        } else {
          // value (default)
          base.unit = t.unit || '';
          base.format = t.format || 'state';
          base.attribute = t.attribute || '';
          // Backward compat: convert old status_dot string to dot_rules
          if (t.status_dot && !t.dot_rules) {
            base.dot_rules = [{ match: '*', dot: t.status_dot }];
          } else {
            base.dot_rules = t.dot_rules || null;
          }
        }

        return base;
      }),
    };
    if (this._rendered) this._buildGrid();
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

    // Collect all entities that matter (tile entities + show_when entities)
    const relevantEntities = new Set();
    for (const t of this._config.tiles) {
      if (t.entity) relevantEntities.add(t.entity);
      if (t.show_when && t.show_when.entity) relevantEntities.add(t.show_when.entity);
    }

    const changed = [...relevantEntities].some(eid =>
      !oldHass || oldHass.states[eid] !== hass.states[eid]
    );

    if (changed || !oldHass) {
      this._evaluateVisibility();
      this._updateValues();
      this._syncTimers();
    }
  }

  getCardSize() {
    const rows = Math.ceil(this._config.tiles.length / (this._config.columns || 4));
    return Math.max(2, rows + 1);
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_STATUS_STYLES;
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
          <div class="hdr">
            <div class="hdr-title">
              <span class="icon filled">home</span>
              <span id="title"></span>
            </div>
          </div>
          <div class="grid" id="grid"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._titleEl = this.shadowRoot.getElementById('title');
    this._gridEl = this.shadowRoot.getElementById('grid');
    this._gridEl.style.gridTemplateColumns = `repeat(${this._config.columns || 4}, 1fr)`;

    this._buildGrid();
  }

  _buildGrid() {
    if (!this._gridEl) return;
    this._gridEl.innerHTML = '';
    this._titleEl.textContent = this._config.name;
    this._tileEls = [];
    this._clearAllTimers();

    this._config.tiles.forEach((tile, i) => {
      const el = document.createElement('div');
      el.className = 'tile';
      el.dataset.accent = tile.accent;
      el.dataset.type = tile.type;

      switch (tile.type) {
        case 'indicator':
          el.innerHTML = `
            <div class="status-dot" id="dot-${i}"></div>
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          el.addEventListener('click', () => this._fireMoreInfo(tile.entity));
          break;

        case 'timer':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          el.addEventListener('click', () => this._fireMoreInfo(tile.entity));
          break;

        case 'dropdown':
          el.innerHTML = `
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <div class="tile-dd-val" id="ddval-${i}" aria-expanded="false">
              <span class="dd-text" id="val-${i}">--</span>
              <span class="icon chevron">expand_more</span>
            </div>
            <span class="tile-label">${tile.label}</span>
            <div class="tile-dd-menu" id="ddmenu-${i}"></div>
          `;
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            this._toggleDropdown(i);
          });
          break;

        case 'value':
        default: {
          let dotHTML = '';
          if (tile.dot_rules && tile.dot_rules.length > 0) {
            dotHTML = `<div class="status-dot" id="dot-${i}"></div>`;
          }
          el.innerHTML = `
            ${dotHTML}
            <div class="tile-icon"><span class="icon" style="font-size:28px;width:28px;height:28px">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          el.addEventListener('click', () => this._fireMoreInfo(tile.entity));
          break;
        }
      }

      this._gridEl.appendChild(el);
      this._tileEls.push({
        el,
        config: tile,
        index: i,
        valEl: el.querySelector(`#val-${i}`),
        dotEl: el.querySelector(`#dot-${i}`),
        ddMenuEl: tile.type === 'dropdown' ? el.querySelector(`#ddmenu-${i}`) : null,
        ddValEl: tile.type === 'dropdown' ? el.querySelector(`#ddval-${i}`) : null,
      });
    });

    this._evaluateVisibility();
    this._updateValues();
    this._syncTimers();
  }

  _fireMoreInfo(entityId) {
    if (!entityId || !this._hass) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true,
      detail: { entityId },
    }));
  }

  // ── Conditional Visibility ──

  _evaluateVisibility() {
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      const { config, el } = tile;
      if (!config.show_when) {
        el.classList.remove('tile-hidden');
        continue;
      }

      const watchEntity = this._hass.states[config.show_when.entity];
      if (!watchEntity || watchEntity.state !== config.show_when.state) {
        el.classList.add('tile-hidden');
      } else {
        el.classList.remove('tile-hidden');
      }
    }
  }

  // ── Value Updates ──

  _updateValues() {
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      const { config, valEl, dotEl, ddMenuEl, ddValEl, index } = tile;
      if (!config.entity) { if (valEl) valEl.textContent = '--'; continue; }

      const entity = this._hass.states[config.entity];
      if (!entity) { if (valEl) valEl.textContent = '?'; continue; }

      switch (config.type) {
        case 'indicator':
          this._updateIndicatorTile(valEl, dotEl, entity, config);
          break;
        case 'timer':
          this._updateTimerTile(valEl, entity);
          break;
        case 'dropdown':
          this._updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index);
          break;
        case 'value':
        default:
          this._updateValueTile(valEl, dotEl, entity, config);
          break;
      }
    }
  }

  _updateValueTile(valEl, dotEl, entity, config) {
    let val = config.attribute
      ? (entity.attributes[config.attribute] != null ? entity.attributes[config.attribute] : '?')
      : entity.state;
    const unit = config.unit;

    if (config.format === 'integer') val = Math.round(Number(val));
    else if (config.format === 'float1') val = Number(val).toFixed(1);

    this._renderValWithUnit(valEl, val, unit);

    if (dotEl && config.dot_rules) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules);
    }
  }

  _updateIndicatorTile(valEl, dotEl, entity, config) {
    let val = entity.state;
    if (config.format === 'integer') val = Math.round(Number(val));
    else if (config.format === 'float1') val = Number(val).toFixed(1);

    this._renderValWithUnit(valEl, val, config.unit);

    if (dotEl) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules || []);
    }
  }

  _renderValWithUnit(valEl, val, unit) {
    if (unit === '°F' || unit === '°C' || unit === '°') {
      valEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${unit === '°F' ? 'F' : unit === '°C' ? 'C' : ''}`;
    } else if (unit) {
      valEl.innerHTML = `${val}<span class="tile-deg">${unit}</span>`;
    } else {
      valEl.textContent = val;
    }
  }

  _applyDotRules(dotEl, state, rules) {
    const stateStr = String(state);
    let dotColor = '';

    for (const rule of rules) {
      if (rule.match === '*' || stateStr === rule.match || stateStr.includes(rule.match)) {
        dotColor = rule.dot;
        break;
      }
    }

    dotEl.className = dotColor ? `status-dot ${dotColor}` : 'status-dot';
  }

  _updateTimerTile(valEl, entity) {
    if (entity.state !== 'active') {
      valEl.textContent = '--:--';
      return;
    }

    const remaining = entity.attributes.remaining;
    if (!remaining) { valEl.textContent = '--:--'; return; }

    // Compute real remaining from snapshot + elapsed
    const parts = String(remaining).split(':').map(Number);
    let snapshotSeconds;
    if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
    else { valEl.textContent = '--:--'; return; }

    const elapsed = Math.floor((Date.now() - new Date(entity.last_updated).getTime()) / 1000);
    const currentSeconds = Math.max(0, snapshotSeconds - elapsed);
    valEl.textContent = this._formatFromSeconds(currentSeconds);
  }

  _updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index) {
    valEl.textContent = entity.state;

    const options = entity.attributes.options || [];
    const current = entity.state;

    ddMenuEl.innerHTML = '';
    for (const opt of options) {
      const btn = document.createElement('button');
      btn.className = 'tile-dd-opt';
      if (opt === current) btn.classList.add('active');
      btn.textContent = opt;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._selectDropdownOption(config.entity, opt, index);
      });
      ddMenuEl.appendChild(btn);
    }
  }

  // ── Timer Interval Management ──

  _syncTimers() {
    this._clearAllTimers();
    if (!this._hass || !this._tileEls) return;

    for (const tile of this._tileEls) {
      if (tile.config.type !== 'timer') continue;
      const entity = this._hass.states[tile.config.entity];
      if (!entity || entity.state !== 'active') continue;

      const remaining = entity.attributes.remaining;
      if (!remaining) continue;

      const parts = String(remaining).split(':').map(Number);
      let snapshotSeconds;
      if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
      else continue;

      const snapshotTime = new Date(entity.last_updated).getTime();
      const elapsed = Math.floor((Date.now() - snapshotTime) / 1000);
      let currentSeconds = Math.max(0, snapshotSeconds - elapsed);

      tile.valEl.textContent = this._formatFromSeconds(currentSeconds);

      const intervalId = setInterval(() => {
        currentSeconds = Math.max(0, currentSeconds - 1);
        tile.valEl.textContent = this._formatFromSeconds(currentSeconds);
        if (currentSeconds <= 0) clearInterval(intervalId);
      }, 1000);

      this._timerIntervals.push(intervalId);
    }
  }

  _clearAllTimers() {
    if (this._timerIntervals) {
      for (const id of this._timerIntervals) clearInterval(id);
    }
    this._timerIntervals = [];
  }

  _formatFromSeconds(totalSeconds) {
    if (totalSeconds <= 0) return '0:00';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  // ── Dropdown ──

  _toggleDropdown(index) {
    const tile = this._tileEls[index];
    if (!tile || !tile.ddMenuEl) return;

    const isOpen = tile.ddMenuEl.classList.contains('open');
    this._closeAllDropdowns();

    if (!isOpen) {
      tile.ddMenuEl.classList.add('open');
      tile.ddValEl.setAttribute('aria-expanded', 'true');
      this._openDropdown = index;

      // Overflow check: flip above if menu overflows card
      requestAnimationFrame(() => {
        const menuRect = tile.ddMenuEl.getBoundingClientRect();
        const cardRect = this.shadowRoot.querySelector('.card').getBoundingClientRect();
        if (menuRect.bottom > cardRect.bottom + 20) {
          tile.ddMenuEl.style.top = 'auto';
          tile.ddMenuEl.style.bottom = 'calc(100% + 4px)';
        }
      });
    }
  }

  _closeAllDropdowns() {
    if (!this._tileEls) return;
    for (const tile of this._tileEls) {
      if (tile.ddMenuEl) {
        tile.ddMenuEl.classList.remove('open');
        tile.ddMenuEl.style.top = '';
        tile.ddMenuEl.style.bottom = '';
      }
      if (tile.ddValEl) {
        tile.ddValEl.setAttribute('aria-expanded', 'false');
      }
    }
    this._openDropdown = null;
  }

  _selectDropdownOption(entityId, option, tileIndex) {
    if (!this._hass) return;
    this._hass.callService('input_select', 'select_option', {
      entity_id: entityId,
      option: option,
    });
    this._closeAllDropdowns();
  }

  _onDocClick(e) {
    if (this._openDropdown === null) return;
    const path = e.composedPath();
    const tile = this._tileEls[this._openDropdown];
    if (tile && !path.includes(tile.el)) {
      this._closeAllDropdowns();
    }
  }
}

customElements.define('tunet-status-card', TunetStatusCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-status-card',
  name: 'Tunet Status Card',
  description: 'Home status grid with typed tiles and glassmorphism design',
  preview: true,
});

console.info(
  `%c TUNET-STATUS-CARD %c v${TUNET_STATUS_VERSION} `,
  'color: #fff; background: #007AFF; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #007AFF; background: #e0f0ff; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
