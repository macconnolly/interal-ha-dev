/**
 * Tunet Lighting Card
 * Light zone tiles with swipe-to-dim and adaptive control
 * Version 2.0.0
 *
 * v2 features:
 *   - Light group auto-expansion (light_group config)
 *   - Manual override red dot (AL switch scanning)
 *   - All Off button (amber pill in header)
 *   - Adaptive pill toggle (tap=toggle, long-press=more-info)
 */

const TUNET_LIGHTING_VERSION = '2.0.0';

const TUNET_LIGHTING_STYLES = `
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
    --red: #FF3B30;
    --track-bg: rgba(28,28,30,0.055);
    --r-card: 24px;
    --r-tile: 16px;
    --r-pill: 999px;
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --tile-bg: rgba(255,255,255,0.92);
    --tile-bg-off: rgba(28,28,30,0.04);
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
    --red: #FF453A;
    --track-bg: rgba(255,255,255,0.08);
    --ctrl-bg: rgba(255,255,255,0.07);
    --ctrl-border: rgba(255,255,255,0.10);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.20), 0 2px 8px rgba(0,0,0,0.12);
    --tile-bg: rgba(255,255,255,0.08);
    --tile-bg-off: rgba(255,255,255,0.04);
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

  /* Card surface */
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

  /* Header */
  .hdr {
    display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
  }
  .hdr-icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center;
    border: 1px solid transparent; background: transparent;
    transition: all .2s ease; color: var(--text-muted);
  }
  .hdr-icon.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .hdr-title { font-weight: 700; font-size: 14px; color: var(--text-sub); letter-spacing: .1px; }
  .hdr-spacer { flex: 1; }

  .all-off-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 7px 12px; border-radius: var(--r-pill);
    border: 1px solid var(--amber-border); background: var(--amber-fill);
    color: var(--amber); font-family: inherit; font-size: 12px; font-weight: 700;
    cursor: pointer; transition: all .15s ease; white-space: nowrap;
    box-shadow: var(--ctrl-sh);
  }
  .all-off-btn:hover { box-shadow: var(--shadow); }
  .all-off-btn:active { transform: scale(.96); opacity: 0.8; }
  .all-off-btn .icon { font-size: 14px; width: 14px; height: 14px; }

  .adaptive-pill {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 10px; border-radius: var(--r-pill);
    border: 1px solid var(--ctrl-border); background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--text-sub); cursor: pointer;
    transition: all .15s ease; letter-spacing: .2px;
    -webkit-tap-highlight-color: transparent;
    user-select: none; touch-action: manipulation;
  }
  .adaptive-pill:hover { box-shadow: var(--shadow); }
  .adaptive-pill.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .adaptive-pill .icon { font-size: 14px; width: 14px; height: 14px; }

  /* Light grid */
  .light-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

  .l-tile {
    border-radius: var(--r-tile); box-shadow: var(--shadow);
    display: flex; flex-direction: column; align-items: center;
    cursor: pointer; transition: background .2s, border-color .2s, box-shadow .15s;
    position: relative; overflow: hidden; user-select: none;
    touch-action: pan-y; border: 1px solid transparent;
  }
  .l-tile.off { background: var(--tile-bg-off); border-color: var(--ctrl-border); }
  .l-tile.on { background: var(--tile-bg); border-color: var(--amber-border); }
  .l-tile:hover { box-shadow: var(--shadow-up); }

  .tile-content {
    position: relative; z-index: 1;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    width: 100%; padding: 14px 8px 10px; gap: 6px;
  }
  .zone-icon-wrap {
    width: 44px; height: 44px; border-radius: 10px;
    display: grid; place-items: center;
    transition: all .2s ease; border: 1px solid transparent;
  }
  .l-tile.off .zone-icon-wrap { background: var(--track-bg); color: var(--text-muted); }
  .l-tile.on .zone-icon-wrap { background: var(--amber-fill); border-color: var(--amber-border); color: var(--amber); }
  .l-tile.on .zone-icon-wrap .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .zone-name { font-size: 13px; font-weight: 600; color: var(--text); letter-spacing: .1px; line-height: 1; }
  .l-tile.off .zone-name { color: var(--text-sub); }
  .zone-val { font-size: 12px; font-weight: 600; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: .2px; }
  .l-tile.off .zone-val { color: var(--text-muted); }
  .l-tile.on .zone-val { color: var(--amber); }

  .zone-bar { width: 100%; height: 4px; background: var(--track-bg); position: relative; margin-top: auto; flex-shrink: 0; }
  .zone-bar-fill { position: absolute; top: 0; left: 0; bottom: 0; transition: width .15s ease; }
  .l-tile.off .zone-bar-fill { background: var(--text-muted); opacity: 0.15; }
  .l-tile.on .zone-bar-fill { background: var(--amber); opacity: 0.65; }

  /* Manual override dot */
  .manual-dot {
    position: absolute; top: 8px; right: 8px;
    width: 8px; height: 8px;
    background: var(--red); border-radius: 50%;
    display: none;
    box-shadow: 0 0 8px rgba(255, 69, 58, 0.5);
    z-index: 2;
  }
  .l-tile[data-manual="true"] .manual-dot { display: block; }

  /* Sliding state */
  .l-tile.sliding { transform: scale(1.05); box-shadow: var(--shadow-up); z-index: 100; border-color: var(--amber) !important; }
  .l-tile.sliding .zone-bar-fill { transition: none; }
  .l-tile.sliding .zone-val {
    position: absolute; top: 0; left: 50%; transform: translate(-50%, -50%);
    color: var(--amber); font-weight: 700; font-size: 15px;
    background: var(--glass); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    padding: 6px 20px; border-radius: 999px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 101;
    border: 1px solid rgba(255,255,255,0.15); white-space: nowrap;
  }
  :host(.dark) .l-tile.sliding .zone-val { background: var(--glass); border-color: rgba(255,255,255,0.10); }
  .l-tile.sliding .zone-bar { height: 6px; }

  @media (max-width: 440px) {
    .card { padding: 16px; }
    .light-grid { grid-template-columns: repeat(2, 1fr); }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

class TunetLightingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._tileData = [];
    this._debounceTimers = {};
    this._resolvedLights = null;
    this._alSwitchCache = null;
    this._alSwitchCacheTime = 0;
    this._pillPressTimer = null;
    this._pillLongPressed = false;
    TunetLightingCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetLightingCard._fontsInjected) return;
    TunetLightingCard._fontsInjected = true;
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
        { name: 'adaptive_entity', selector: { entity: { domain: 'switch' } } },
        { name: 'light_group', selector: { entity: { domain: 'light' } } },
      ],
      computeLabel: (s) => {
        const labels = {
          name: 'Card Name',
          adaptive_entity: 'Adaptive Lighting Switch',
          light_group: 'Light Group Entity',
        };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return { name: 'Lighting', lights: [] };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Lighting',
      adaptive_entity: config.adaptive_entity || '',
      light_group: config.light_group || '',
      light_overrides: config.light_overrides || {},
      lights: (config.lights || []).map(l => ({
        entity: l.entity || '',
        name: l.name || '',
        icon: l.icon || 'lightbulb',
      })),
    };
    this._resolvedLights = null;
    this._alSwitchCache = null;
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

    // Resolve light group members (may trigger grid rebuild)
    const membershipChanged = this._resolveLights();
    if (membershipChanged) {
      this._buildGrid();
      return;
    }

    // Check entity changes on resolved lights
    const lights = this._resolvedLights || [];
    const changed = lights.some(l =>
      l.entity && (!oldHass || oldHass.states[l.entity] !== hass.states[l.entity])
    );
    const adaptiveChanged = this._config.adaptive_entity &&
      (!oldHass || oldHass.states[this._config.adaptive_entity] !== hass.states[this._config.adaptive_entity]);
    const manualChanged = this._hasManualControlChanged(oldHass, hass);

    if (changed || adaptiveChanged || manualChanged || !oldHass) this._updateAll();
  }

  getCardSize() {
    const rows = Math.ceil((this._resolvedLights || this._config.lights || []).length / 3);
    return Math.max(3, rows * 2 + 1);
  }

  // ── Light Group Auto-Expansion ──────────────────────────────

  _resolveLights() {
    if (!this._hass) return false;

    const groupId = this._config.light_group;
    if (!groupId) {
      // Backward compat: use lights array directly
      if (this._resolvedLights) return false;
      this._resolvedLights = this._config.lights;
      return true;
    }

    const groupEntity = this._hass.states[groupId];
    if (!groupEntity || !groupEntity.attributes.entity_id) {
      if (!this._resolvedLights) {
        this._resolvedLights = [];
        return true;
      }
      return false;
    }

    const members = groupEntity.attributes.entity_id;
    const overrides = this._config.light_overrides || {};

    // Check if membership changed (set-based to handle reordering)
    const oldIds = (this._resolvedLights || []).map(l => l.entity);
    if (oldIds.length === members.length) {
      const oldSet = new Set(oldIds);
      if (members.every(id => oldSet.has(id))) return false;
    }

    // Build resolved lights array
    this._resolvedLights = members.map(entityId => {
      const override = overrides[entityId];
      const entity = this._hass.states[entityId];
      const friendlyName = entity ? entity.attributes.friendly_name : entityId;

      return {
        entity: entityId,
        name: (override && override.name) || this._shortenName(friendlyName),
        icon: (override && override.icon) || 'lightbulb',
      };
    });

    return true;
  }

  _shortenName(name) {
    if (!name) return '';
    const suffixes = [' Strip Light', ' Underlights', ' Pendants', ' Lights', ' Light', ' Lamp'];
    for (const suffix of suffixes) {
      if (name.endsWith(suffix)) {
        return name.slice(0, -suffix.length);
      }
    }
    return name;
  }

  // ── Manual Override Detection ───────────────────────────────

  _getALSwitches() {
    const now = Date.now();
    if (this._alSwitchCache && now - this._alSwitchCacheTime < 10000) {
      return this._alSwitchCache;
    }
    const pattern = /^switch\.adaptive_lighting_(?!sleep_mode_|adapt_)(.+)$/;
    this._alSwitchCache = Object.keys(this._hass.states).filter(k => pattern.test(k));
    this._alSwitchCacheTime = now;
    return this._alSwitchCache;
  }

  _isManualOverride(entityId) {
    if (!this._hass) return false;
    const switches = this._getALSwitches();
    for (const switchId of switches) {
      const sw = this._hass.states[switchId];
      if (sw && sw.attributes.manual_control) {
        if (sw.attributes.manual_control.includes(entityId)) return true;
      }
    }
    return false;
  }

  _hasManualControlChanged(oldHass, hass) {
    if (!oldHass) return true;
    const switches = this._getALSwitches();
    for (const switchId of switches) {
      if (oldHass.states[switchId] !== hass.states[switchId]) return true;
    }
    return false;
  }

  // ── Rendering ───────────────────────────────────────────────

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_LIGHTING_STYLES;
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
            <div class="hdr-icon" id="hdrIcon"><span class="icon filled" style="font-size:18px">auto_awesome</span></div>
            <span class="hdr-title" id="hdrTitle"></span>
            <div class="hdr-spacer"></div>
            <button class="all-off-btn" id="allOffBtn"><span class="icon">power_settings_new</span> All Off</button>
            <button class="adaptive-pill" id="adaptivePill">
              <span class="icon filled">auto_awesome</span> Adaptive
            </button>
          </div>
          <div class="light-grid" id="grid"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._hdrIcon = this.shadowRoot.getElementById('hdrIcon');
    this._hdrTitle = this.shadowRoot.getElementById('hdrTitle');
    this._adaptivePill = this.shadowRoot.getElementById('adaptivePill');
    this._allOffBtn = this.shadowRoot.getElementById('allOffBtn');
    this._gridEl = this.shadowRoot.getElementById('grid');

    // Adaptive pill: tap = toggle, long-press (500ms) = more-info
    this._adaptivePill.addEventListener('pointerdown', (e) => {
      if (!this._hass || !this._config.adaptive_entity) return;
      this._pillLongPressed = false;
      this._pillPressTimer = setTimeout(() => {
        this._pillLongPressed = true;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: this._config.adaptive_entity },
        }));
      }, 500);
    });

    this._adaptivePill.addEventListener('pointerup', () => {
      if (!this._hass || !this._config.adaptive_entity) return;
      clearTimeout(this._pillPressTimer);
      if (!this._pillLongPressed) {
        this._hass.callService('switch', 'toggle', {
          entity_id: this._config.adaptive_entity,
        });
      }
      this._pillLongPressed = false;
    });

    this._adaptivePill.addEventListener('pointercancel', () => {
      clearTimeout(this._pillPressTimer);
      this._pillLongPressed = false;
    });

    this._adaptivePill.addEventListener('pointerleave', () => {
      clearTimeout(this._pillPressTimer);
      this._pillLongPressed = false;
    });

    // Prevent context menu on long-press (mobile)
    this._adaptivePill.addEventListener('contextmenu', (e) => e.preventDefault());

    // All Off button
    this._allOffBtn.addEventListener('click', () => {
      if (!this._hass) return;
      const lights = this._resolvedLights || [];
      const entityIds = lights.map(l => l.entity).filter(Boolean);
      if (entityIds.length) {
        this._hass.callService('light', 'turn_off', { entity_id: entityIds });
      }
    });

    this._buildGrid();
  }

  _buildGrid() {
    if (!this._gridEl) return;
    this._gridEl.innerHTML = '';
    this._hdrTitle.textContent = this._config.name;
    this._tileData = [];

    if (!this._config.adaptive_entity) {
      this._adaptivePill.style.display = 'none';
    } else {
      this._adaptivePill.style.display = '';
    }

    const lights = this._resolvedLights || [];

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      const tile = document.createElement('div');
      tile.className = 'l-tile off';

      const esc = s => String(s).replace(/[&<>"']/g, c =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="tile-content">
          <div class="zone-icon-wrap"><span class="icon" style="font-size:24px">${esc(light.icon)}</span></div>
          <span class="zone-name">${esc(light.name || light.entity)}</span>
          <span class="zone-val">Off</span>
        </div>
        <div class="zone-bar"><div class="zone-bar-fill" style="width:0%"></div></div>
      `;

      const data = {
        el: tile,
        config: light,
        valEl: tile.querySelector('.zone-val'),
        fillEl: tile.querySelector('.zone-bar-fill'),
        brightness: 0,
        idx: i,
      };
      this._tileData.push(data);

      this._setupDrag(tile, data);
      this._gridEl.appendChild(tile);
    }

    this._updateAll();
  }

  // ── Interaction ─────────────────────────────────────────────

  _setupDrag(tile, data) {
    let startX = 0, startBrt = 0, isDragging = false;

    const onDown = (e) => {
      startX = e.clientX;
      startBrt = data.brightness;
      tile.setPointerCapture(e.pointerId);
    };

    const onMove = (e) => {
      if (!e.buttons) return;
      const dx = e.clientX - startX;
      if (!isDragging && Math.abs(dx) > 4) {
        isDragging = true;
        tile.classList.add('sliding');
      }
      if (isDragging) {
        const change = (dx / tile.offsetWidth) * 100;
        const newBrt = Math.round(Math.max(0, Math.min(100, startBrt + change)));
        this._updateTileVisual(data, newBrt);
      }
    };

    const onUp = () => {
      if (!isDragging) {
        // Tap: toggle
        const newBrt = data.brightness > 0 ? 0 : 100;
        this._updateTileVisual(data, newBrt);
        this._callLightService(data);
      } else {
        // End drag: commit
        this._callLightService(data);
      }
      tile.classList.remove('sliding');
      isDragging = false;
    };

    tile.addEventListener('pointerdown', onDown);
    tile.addEventListener('pointermove', onMove);
    tile.addEventListener('pointerup', onUp);
    tile.addEventListener('pointercancel', () => { tile.classList.remove('sliding'); isDragging = false; });
  }

  _updateTileVisual(data, brt) {
    data.brightness = brt;
    data.fillEl.style.width = brt + '%';
    data.valEl.textContent = brt > 0 ? brt + '%' : 'Off';
    data.el.classList.toggle('on', brt > 0);
    data.el.classList.toggle('off', brt === 0);
  }

  _callLightService(data) {
    if (!this._hass || !data.config.entity) return;
    const entity_id = data.config.entity;

    clearTimeout(this._debounceTimers[entity_id]);
    this._debounceTimers[entity_id] = setTimeout(() => {
      if (data.brightness > 0) {
        this._hass.callService('light', 'turn_on', {
          entity_id,
          brightness_pct: data.brightness,
        });
      } else {
        this._hass.callService('light', 'turn_off', { entity_id });
      }
    }, 300);
  }

  // ── State Updates ───────────────────────────────────────────

  _updateAll() {
    if (!this._hass || !this._tileData) return;

    // Adaptive pill state
    if (this._config.adaptive_entity) {
      const adaptiveEntity = this._hass.states[this._config.adaptive_entity];
      const isOn = adaptiveEntity && adaptiveEntity.state === 'on';
      this._adaptivePill.classList.toggle('on', isOn);
      this._hdrIcon.classList.toggle('on', isOn);
    }

    // Any light on?
    let anyOn = false;

    for (const data of this._tileData) {
      if (!data.config.entity) continue;
      const entity = this._hass.states[data.config.entity];
      if (!entity) continue;

      const isOn = entity.state === 'on';
      const brt = isOn ? Math.round((entity.attributes.brightness || 255) / 2.55) : 0;

      this._updateTileVisual(data, brt);
      if (isOn) anyOn = true;

      // Manual override red dot
      data.el.dataset.manual = this._isManualOverride(data.config.entity) ? 'true' : 'false';
    }

    if (!this._config.adaptive_entity) {
      this._hdrIcon.classList.toggle('on', anyOn);
    }
  }
}

if (!customElements.get('tunet-lighting-card')) {
  customElements.define('tunet-lighting-card', TunetLightingCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-lighting-card')) {
  window.customCards.push({
    type: 'tunet-lighting-card',
    name: 'Tunet Lighting Card',
    description: 'Light zone tiles with swipe-to-dim, group expansion, and manual override detection',
    preview: true,
  });
}

console.info(
  `%c TUNET-LIGHTING-CARD %c v${TUNET_LIGHTING_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
