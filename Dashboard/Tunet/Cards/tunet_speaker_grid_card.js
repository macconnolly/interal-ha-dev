/**
 * Tunet Speaker Grid Card
 * Sonos speaker grid with per-speaker volume control and group management
 * Auto-detects speakers from binary_sensor.sonos_*_in_playing_group entities
 * Version 1.0.0
 */

const TUNET_SPEAKER_GRID_VERSION = '1.0.0';

/* ===============================================================
   CSS — Tokens aligned to tunet-design-system.md v2.1
   =============================================================== */

const TUNET_SPEAKER_GRID_STYLES = `
  /* -- Tokens: Light -- */
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0,0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --track-bg: rgba(28,28,30,0.055);
    --r-card: 24px;
    --r-tile: 16px;
    --r-pill: 999px;
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --divider: rgba(28,28,30,0.07);
    --tile-bg: rgba(255,255,255,0.92);
    --tile-bg-off: rgba(28,28,30,0.04);
    --gray-ghost: rgba(0,0,0,0.035);
    display: block;
  }

  /* -- Tokens: Dark -- */
  :host(.dark) {
    --glass: rgba(44,44,46,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.18);
    --track-bg: rgba(255,255,255,0.06);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --divider: rgba(255,255,255,0.06);
    --tile-bg: rgba(44,44,46,0.90);
    --tile-bg-off: rgba(255,255,255,0.04);
    --gray-ghost: rgba(255,255,255,0.04);
  }

  /* -- Reset -- */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* -- Base -- */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* -- Icons -- */
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle;
    flex-shrink: 0; -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  /* -- Card Shell -- */
  .card {
    position: relative; width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex; flex-direction: column; gap: 0;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }

  /* Glass stroke (XOR bevel) */
  .card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

  /* -- Header -- */
  .grid-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease; min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }

  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all .2s ease; color: var(--text-muted);
  }

  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title {
    font-weight: 700; font-size: 13px; color: var(--text-sub);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px; font-weight: 600; color: var(--text-muted);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-spacer { flex: 1; }

  /* -- Speaker Grid -- */
  .spk-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 5), 1fr);
    gap: 10px;
  }

  /* -- Speaker Tile -- */
  .spk-tile {
    position: relative;
    display: flex; flex-direction: column; align-items: center;
    gap: 6px; padding: 12px 8px;
    border-radius: var(--r-tile);
    background: var(--tile-bg-off);
    border: 1px solid transparent;
    box-shadow: var(--ctrl-sh);
    cursor: pointer; user-select: none;
    touch-action: pan-y;
    transition: all .15s ease;
  }
  .spk-tile:hover { box-shadow: var(--shadow); }
  .spk-tile:active { transform: scale(.97); }
  .spk-tile:focus-visible { outline: 2px solid var(--green); outline-offset: 3px; }

  /* In-group state */
  .spk-tile.in-group {
    background: var(--tile-bg);
    border-color: var(--green-border);
  }

  /* Dragging state */
  .spk-tile.dragging {
    transform: scale(1.05);
    box-shadow: var(--shadow-up);
    z-index: 10;
    border-color: var(--green);
  }

  /* -- Icon Container (The Orb) -- */
  .spk-icon-wrap {
    width: 36px; height: 36px; border-radius: 10px;
    display: grid; place-items: center;
    background: var(--gray-ghost);
    transition: all .2s ease;
  }
  .spk-icon-wrap .icon {
    font-size: 18px; color: var(--text-muted);
    transition: color .15s ease;
  }
  .spk-tile.in-group .spk-icon-wrap {
    background: var(--green-fill);
  }
  .spk-tile.in-group .spk-icon-wrap .icon {
    color: var(--green);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* -- Speaker Name -- */
  .spk-name {
    font-size: 11px; font-weight: 600; color: var(--text-sub);
    text-align: center; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%;
  }
  .spk-tile.in-group .spk-name { color: var(--text); }

  /* -- Volume Bar -- */
  .vol-bar-wrap {
    width: 100%; height: 4px;
    border-radius: var(--r-pill);
    background: var(--track-bg);
    overflow: hidden;
    transition: height .15s ease;
  }
  .spk-tile.dragging .vol-bar-wrap { height: 6px; }
  .vol-bar-fill {
    height: 100%; border-radius: var(--r-pill);
    background: rgba(52,199,89,0.50);
    transition: width 60ms ease;
  }
  :host(.dark) .vol-bar-fill { background: rgba(48,209,88,0.50); }

  /* -- Volume Percentage -- */
  .spk-vol {
    font-size: 10px; font-weight: 600; color: var(--text-muted);
    font-variant-numeric: tabular-nums; letter-spacing: 0.3px;
  }
  .spk-tile.in-group .spk-vol { color: var(--text-sub); }

  /* -- Floating Volume Pill (during drag) -- */
  .vol-pill {
    position: absolute; top: 0; left: 50%;
    transform: translate(-50%, -50%);
    padding: 6px 20px; border-radius: var(--r-pill);
    background: var(--glass);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.15);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    font-size: 15px; font-weight: 700; color: var(--green);
    font-variant-numeric: tabular-nums;
    pointer-events: none; z-index: 100;
    display: none;
  }
  .spk-tile.dragging .vol-pill { display: block; }

  /* -- Action Buttons -- */
  .grid-actions {
    display: flex; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid var(--divider);
  }
  .action-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 12px; border-radius: 11px;
    border: none; background: transparent; font-family: inherit;
    font-size: 13px; font-weight: 600; color: var(--text-sub);
    cursor: pointer; transition: background .1s;
    user-select: none;
  }
  .action-btn:hover { background: var(--track-bg); color: var(--text); }
  .action-btn:active { transform: scale(.97); }
  .action-btn .icon { color: var(--green); }

  /* -- Reduced Motion -- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: 16px; }
    .spk-grid { grid-template-columns: repeat(var(--cols-sm, 3), 1fr); }
    .spk-icon-wrap { width: 32px; height: 32px; }
    .spk-icon-wrap .icon { font-size: 16px; }
    .spk-name { font-size: 10px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TUNET_SPEAKER_GRID_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card">

      <!-- Header -->
      <div class="grid-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon" style="font-size:18px">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">Loading...</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
      </div>

      <!-- Speaker Grid -->
      <div class="spk-grid" id="spkGrid"></div>

      <!-- Group Actions -->
      <div class="grid-actions" id="gridActions" style="display:none">
        <button class="action-btn" id="groupAllBtn" aria-label="Group all speakers">
          <span class="icon" style="font-size:18px">link</span> Group All
        </button>
        <button class="action-btn" id="ungroupBtn" aria-label="Ungroup all speakers">
          <span class="icon" style="font-size:18px">link_off</span> Ungroup All
        </button>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetSpeakerGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._cachedSpeakers = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._tileRefs = new Map(); // entity → {tile, volFill, volLabel, pill}

    // Drag state
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._volDebounce = null;

    // Long-press state
    this._longPressTimer = null;
    this._longPressFired = false;

    TunetSpeakerGridCard._injectFonts();
  }

  /* -- Font Injection (once globally) -- */

  static _injectFonts() {
    if (TunetSpeakerGridCard._fontsInjected) return;
    TunetSpeakerGridCard._fontsInjected = true;

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

  /* -- Config -- */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { domain: 'media_player' } },
        },
        {
          name: 'name',
          selector: { text: {} },
        },
        {
          name: 'coordinator_sensor',
          selector: { entity: { domain: 'sensor' } },
        },
        {
          name: '',
          type: 'grid',
          schema: [
            {
              name: 'columns',
              selector: { number: { min: 3, max: 6, step: 1, mode: 'box' } },
            },
            {
              name: 'show_group_actions',
              selector: { boolean: {} },
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Media Player Entity',
          name: 'Card Name',
          coordinator_sensor: 'Coordinator Sensor',
          columns: 'Grid Columns',
          show_group_actions: 'Show Group/Ungroup Buttons',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Speakers',
      coordinator_sensor: 'sensor.sonos_smart_coordinator',
      columns: 5,
      show_group_actions: true,
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a media_player entity');
    }
    this._config = {
      entity: config.entity,
      name: config.name || 'Speakers',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      columns: Math.max(3, Math.min(6, config.columns || 5)),
      show_group_actions: config.show_group_actions !== false,
    };
    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildGrid();
      this._updateAll();
    }
  }

  /* -- HA State -- */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildGrid();
    }

    // Detect dark mode
    this.classList.toggle('dark', !!(hass.themes && hass.themes.darkMode));

    // Auto-detect speakers if not cached
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildGrid();
    }

    // Only update if relevant entities changed
    let changed = !oldHass;
    if (!changed) {
      const watchList = [this._config.entity, this._config.coordinator_sensor];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity));
      }
      for (const eid of watchList) {
        if (eid && oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    return 3;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._cooldownTimer);
  }

  /* -- Helpers -- */

  _binarySensorFor(entityId) {
    const room = entityId.replace('media_player.', '');
    return `binary_sensor.sonos_${room}_in_playing_group`;
  }

  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService('script', name, data);
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_playing_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
            icon: 'speaker',
          });
        }
      }
    }
    return speakers;
  }

  /* -- Rendering -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SPEAKER_GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SPEAKER_GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = ['card', 'infoTile', 'cardTitle', 'hdrSub', 'spkGrid', 'gridActions', 'groupAllBtn', 'ungroupBtn'];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  _setupListeners() {
    const $ = this.$;

    // Info tile → more-info
    $.infoTile.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    });

    // Group All
    $.groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_group_all_to_playing');
    });

    // Ungroup All
    $.ungroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_ungroup_all');
    });
  }

  /* -- Build Speaker Grid -- */

  _buildGrid() {
    const grid = this.$.spkGrid;
    if (!grid) return;
    grid.innerHTML = '';
    this._tileRefs.clear();

    const speakers = this._cachedSpeakers || [];
    const cols = this._config.columns;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cols-sm', Math.min(3, cols));

    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'spk-tile';
      tile.tabIndex = 0;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', spk.name || spk.entity);
      tile.dataset.entity = spk.entity;

      // Icon orb
      const iconWrap = document.createElement('div');
      iconWrap.className = 'spk-icon-wrap';
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.style.fontSize = '18px';
      icon.textContent = spk.icon || 'speaker';
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);

      // Name
      const name = document.createElement('span');
      name.className = 'spk-name';
      name.textContent = spk.name || spk.entity;
      tile.appendChild(name);

      // Volume bar
      const volBarWrap = document.createElement('div');
      volBarWrap.className = 'vol-bar-wrap';
      const volFill = document.createElement('div');
      volFill.className = 'vol-bar-fill';
      volFill.style.width = '0%';
      volBarWrap.appendChild(volFill);
      tile.appendChild(volBarWrap);

      // Volume label
      const volLabel = document.createElement('span');
      volLabel.className = 'spk-vol';
      volLabel.textContent = '0%';
      tile.appendChild(volLabel);

      // Floating pill (hidden until drag)
      const pill = document.createElement('div');
      pill.className = 'vol-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);

      // Pointer events for drag + tap + long-press
      tile.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });

      grid.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, volFill, volLabel, pill });
    }

    // Show/hide group actions
    if (this.$.gridActions) {
      this.$.gridActions.style.display =
        (this._config.show_group_actions && speakers.length > 1) ? '' : 'none';
    }
  }

  /* -- Tile Pointer Handling -- */

  _onTilePointerDown(entity, e, tile) {
    this._dragEntity = entity;
    this._dragStartX = e.clientX;
    this._dragActive = false;
    this._longPressFired = false;

    // Get current volume as starting point
    const playerState = this._hass && this._hass.states[entity];
    this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;

    // Long-press timer (500ms)
    clearTimeout(this._longPressTimer);
    this._longPressTimer = setTimeout(() => {
      if (!this._dragActive && this._dragEntity === entity) {
        this._longPressFired = true;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: entity },
        }));
        this._dragEntity = null;
      }
    }, 500);
  }

  _onPointerMove(e) {
    if (!this._dragEntity) return;

    const dx = e.clientX - this._dragStartX;
    const THRESHOLD = 4;

    if (!this._dragActive) {
      if (Math.abs(dx) < THRESHOLD) return;
      this._dragActive = true;
      clearTimeout(this._longPressTimer);

      const refs = this._tileRefs.get(this._dragEntity);
      if (refs) refs.tile.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
    }

    // Map horizontal drag to volume: 200px = full range
    const pct = Math.max(0, Math.min(100, this._dragVol + Math.round(dx / 2)));

    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volFill.style.width = pct + '%';
      refs.volLabel.textContent = pct + '%';
      refs.pill.textContent = pct + '%';
    }

    // Debounced service call
    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._callService('media_player', 'volume_set', {
        entity_id: this._dragEntity,
        volume_level: pct / 100,
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
    }, 200);
  }

  _onPointerUp(e) {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);

    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);

    if (refs) {
      refs.tile.classList.remove('dragging');
    }
    document.body.style.cursor = '';

    // If not a drag and not a long-press → tap → toggle group
    if (!this._dragActive && !this._longPressFired) {
      this._callScript('sonos_toggle_group_membership', {
        target_speaker: entity,
      });
    }

    this._dragEntity = null;
    this._dragActive = false;
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._serviceCooldown) return;

    const speakers = this._cachedSpeakers || [];
    $.cardTitle.textContent = this._config.name;

    // Count grouped speakers
    let groupedCount = 0;
    for (const spk of speakers) {
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      if (bs && bs.state === 'on') groupedCount++;
    }

    // Header subtitle
    $.hdrSub.textContent = `${speakers.length} speakers \u00b7 ${groupedCount} grouped`;

    // Update each tile
    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      const inGroup = bs && bs.state === 'on';
      refs.tile.classList.toggle('in-group', inGroup);

      const playerState = this._hass.states[spk.entity];
      if (playerState && !this._dragActive) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volFill.style.width = vol + '%';
        refs.volLabel.textContent = vol + '%';
      }
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

if (!customElements.get('tunet-speaker-grid-card')) {
  customElements.define('tunet-speaker-grid-card', TunetSpeakerGridCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-speaker-grid-card')) {
  window.customCards.push({
    type: 'tunet-speaker-grid-card',
    name: 'Tunet Speaker Grid Card',
    description: 'Sonos speaker grid with volume control and group management',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-speaker-grid-card',
  });
}

console.info(
  `%c TUNET-SPEAKER-GRID %c v${TUNET_SPEAKER_GRID_VERSION} `,
  'color: #fff; background: #34C759; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #34C759; background: #e8f8ed; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
