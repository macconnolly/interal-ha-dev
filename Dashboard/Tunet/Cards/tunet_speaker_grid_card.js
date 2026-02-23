/**
 * Tunet Speaker Grid Card
 * Standalone speaker tile grid for Sonos multi-room audio
 * Tap tile = toggle group membership, drag = adjust volume
 * Version 1.0.0
 */

const SPEAKER_GRID_VERSION = '1.0.0';

/* ===============================================================
   CSS - Design system tokens + speaker grid styles
   =============================================================== */

const GRID_STYLES = `
  /* -- Tokens: Light -- */
  :host {
    --glass: rgba(255,255,255, 0.55);
    --glass-border: rgba(255,255,255, 0.45);
    --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30, 0.55);
    --text-muted: #8E8E93;
    --green: #34C759;
    --green-fill: rgba(52,199,89, 0.12);
    --green-border: rgba(52,199,89, 0.15);
    --track-bg: rgba(28,28,30, 0.055);
    --r-card: 24px;
    --r-tile: 16px;
    --r-pill: 999px;
    --ctrl-bg: rgba(255,255,255, 0.52);
    --ctrl-border: rgba(0,0,0, 0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --tile-bg: rgba(255,255,255, 0.92);
    --tile-bg-off: rgba(28,28,30, 0.04);
    --gray-ghost: rgba(0, 0, 0, 0.035);
    display: block;
  }

  /* -- Tokens: Dark -- */
  :host(.dark) {
    --glass: rgba(30, 41, 59, 0.65);
    --glass-border: rgba(255,255,255, 0.08);
    --shadow: 0 1px 2px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.12);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.30), 0 12px 40px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.08);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247, 0.50);
    --text-muted: rgba(245,245,247, 0.35);
    --green: #30D158;
    --green-fill: rgba(48,209,88, 0.14);
    --green-border: rgba(48,209,88, 0.18);
    --track-bg: rgba(255,255,255, 0.06);
    --ctrl-bg: rgba(255,255,255, 0.08);
    --ctrl-border: rgba(255,255,255, 0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --tile-bg: rgba(44,44,46, 0.90);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255, 255, 255, 0.04);
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
    font-weight: normal;
    font-style: normal;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
    flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .icon-28 { font-size: 28px; width: 28px; height: 28px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }
  .icon-12 { font-size: 12px; width: 12px; height: 12px; }

  /* -- Card Surface -- */
  .card {
    position: relative;
    width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    transition: background .3s, border-color .3s, box-shadow .3s;
  }

  /* Glass XOR stroke */
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50),
      rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%,
      rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }

  /* ═══════════════════════════════════════
     HEADER
     ═══════════════════════════════════════ */
  .grid-hdr {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hdr-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    min-width: 0;
  }

  .hdr-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: var(--text-muted);
  }

  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .hdr-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
  }
  .hdr-sub .green-ic { color: var(--green); }

  .hdr-spacer { flex: 1; }

  /* Group All / Ungroup All buttons */
  .hdr-action {
    width: 42px;
    min-height: 42px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
    cursor: pointer;
    transition: all .15s ease;
    font-family: inherit;
  }
  .hdr-action:hover { box-shadow: var(--shadow); }
  .hdr-action:active { transform: scale(.94); }
  .hdr-action .icon { color: var(--green); }

  /* ═══════════════════════════════════════
     SPEAKER GRID
     ═══════════════════════════════════════ */
  .speaker-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }

  /* ═══════════════════════════════════════
     SPEAKER TILE
     ═══════════════════════════════════════ */
  .spk-tile {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 14px 8px 10px;
    border-radius: var(--r-tile);
    border: 1px solid transparent;
    background: var(--tile-bg-off);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: all .15s ease;
    user-select: none;
    touch-action: none;
    overflow: hidden;
  }
  .spk-tile:hover { box-shadow: var(--shadow-up); }
  .spk-tile:active { transform: scale(.97); }

  /* In-group state */
  .spk-tile.in-group {
    background: var(--tile-bg);
    border-color: var(--green-border);
  }

  /* Playing state */
  .spk-tile.playing {
    background: var(--green-fill);
    border-color: var(--green-border);
  }

  /* Sliding state */
  .spk-tile.sliding {
    transform: scale(1.05);
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--green);
  }

  /* Icon orb */
  .spk-orb {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    margin-bottom: 8px;
    transition: all .2s ease;
    background: var(--gray-ghost);
    color: var(--text-sub);
  }
  .spk-tile.in-group .spk-orb,
  .spk-tile.playing .spk-orb {
    background: var(--green-fill);
    border: 1px solid var(--green-border);
    color: var(--green);
  }
  .spk-tile.in-group .spk-orb .icon,
  .spk-tile.playing .spk-orb .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Group indicator dot */
  .grp-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: var(--green);
    opacity: 0;
    transition: opacity .15s ease;
  }
  .spk-tile.in-group .grp-dot { opacity: 1; }

  /* Speaker name */
  .spk-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    text-align: center;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  /* Volume value */
  .spk-vol {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.4px;
    margin-top: 2px;
    transition: color .15s ease;
  }
  .spk-tile.in-group .spk-vol,
  .spk-tile.playing .spk-vol { color: var(--green); opacity: 0.7; }
  .spk-tile.sliding .spk-vol {
    color: var(--green);
    font-weight: 700;
    font-size: 15px;
    opacity: 1;
  }

  /* Volume bar at bottom of tile */
  .vol-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--track-bg);
  }
  .vol-bar-fill {
    height: 100%;
    background: rgba(52,199,89, 0.50);
    transition: width 60ms ease;
  }
  :host(.dark) .vol-bar-fill { background: rgba(48,209,88, 0.50); }
  .spk-tile.sliding .vol-bar { height: 6px; }
  .spk-tile.sliding .vol-bar-fill { transition: none; }

  /* ═══════════════════════════════════════
     REDUCED MOTION
     ═══════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ═══════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════ */
  @media (max-width: 440px) {
    .card { padding: 16px; gap: 12px; }
    .speaker-grid { gap: 8px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const GRID_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card">

      <!-- Header -->
      <div class="grid-hdr">
        <div class="hdr-tile">
          <div class="hdr-icon">
            <span class="icon icon-18">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">0 in group</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <button class="hdr-action" id="btnGroupAll" title="Group All" aria-label="Group all speakers">
          <span class="icon icon-18">link</span>
        </button>
        <button class="hdr-action" id="btnUngroupAll" title="Ungroup All" aria-label="Ungroup all speakers">
          <span class="icon icon-18">link_off</span>
        </button>
      </div>

      <!-- Speaker Grid -->
      <div class="speaker-grid" id="speakerGrid"></div>

    </div>
  </div>
`;

/* ===============================================================
   DEFAULT SPEAKERS (same as media card)
   =============================================================== */

const GRID_DEFAULT_SPEAKERS = [
  { entity_id: 'media_player.living_room', name: 'Living Room', group_sensor: 'binary_sensor.sonos_living_room_in_playing_group' },
  { entity_id: 'media_player.kitchen', name: 'Kitchen', group_sensor: 'binary_sensor.sonos_kitchen_in_playing_group' },
  { entity_id: 'media_player.bedroom', name: 'Bedroom', group_sensor: 'binary_sensor.sonos_bedroom_in_playing_group' },
  { entity_id: 'media_player.dining_room', name: 'Dining Room', group_sensor: 'binary_sensor.sonos_dining_room_in_playing_group' },
  { entity_id: 'media_player.bath', name: 'Bathroom', group_sensor: 'binary_sensor.sonos_bath_in_playing_group' },
];

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
    this._dragState = null; // { tileEl, entityId, startX, startVol, active }
    this._serviceCooldown = false;
    this._cooldownTimer = null;

    TunetSpeakerGridCard._injectFonts();

    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

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
          name: 'name',
          selector: { text: {} },
        },
        {
          name: 'toggle_group_script',
          selector: { entity: { domain: 'script' } },
        },
        {
          name: 'group_all_script',
          selector: { entity: { domain: 'script' } },
        },
        {
          name: 'ungroup_all_script',
          selector: { entity: { domain: 'script' } },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          toggle_group_script: 'Toggle Group Script',
          group_all_script: 'Group All Script',
          ungroup_all_script: 'Ungroup All Script',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Speakers',
      speakers: GRID_DEFAULT_SPEAKERS.map(s => ({
        entity_id: s.entity_id,
        name: s.name,
        group_sensor: s.group_sensor,
      })),
    };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Speakers',
      toggle_group_script: config.toggle_group_script || 'script.sonos_toggle_group_membership',
      group_all_script: config.group_all_script || 'script.sonos_group_all_to_playing',
      ungroup_all_script: config.ungroup_all_script || 'script.sonos_ungroup_all',
      speakers: config.speakers || GRID_DEFAULT_SPEAKERS.map(s => ({ ...s })),
    };
    if (this._rendered) this._updateAll();
  }

  /* -- HA State -- */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
    }

    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');

    if (!oldHass || this._hasRelevantChange(oldHass, hass)) {
      if (!this._dragState && !this._serviceCooldown) {
        this._updateAll();
      }
    }
  }

  _hasRelevantChange(oldHass, newHass) {
    for (const spk of this._config.speakers) {
      if (oldHass.states[spk.entity_id] !== newHass.states[spk.entity_id]) return true;
      if (spk.group_sensor && oldHass.states[spk.group_sensor] !== newHass.states[spk.group_sensor]) return true;
    }
    return false;
  }

  getCardSize() {
    return 3;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
  }

  /* -- Render -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {};
    ['card', 'cardTitle', 'hdrSub', 'btnGroupAll', 'btnUngroupAll', 'speakerGrid'].forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  _setupListeners() {
    this.$.btnGroupAll.addEventListener('click', (e) => {
      e.stopPropagation();
      this._groupAll();
    });
    this.$.btnUngroupAll.addEventListener('click', (e) => {
      e.stopPropagation();
      this._ungroupAll();
    });
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card) return;

    $.cardTitle.textContent = this._config.name || 'Speakers';

    // Count grouped
    let groupCount = 0;
    let playingCount = 0;
    for (const spk of this._config.speakers) {
      if (this._isInGroup(spk.group_sensor)) groupCount++;
      const entity = this._hass ? this._hass.states[spk.entity_id] : null;
      if (entity && entity.state === 'playing') playingCount++;
    }

    let sub = '';
    if (playingCount > 0) {
      sub = '<span class="green-ic">' + playingCount + ' playing</span>';
      if (groupCount > 1) sub += ' \u00b7 ' + groupCount + ' grouped';
    } else if (groupCount > 1) {
      sub = groupCount + ' grouped';
    } else {
      sub = 'All independent';
    }
    $.hdrSub.innerHTML = sub;

    // Build or update tiles
    this._buildGrid();
  }

  _buildGrid() {
    const grid = this.$.speakerGrid;
    const existingTiles = grid.querySelectorAll('.spk-tile');

    // Rebuild if count changed
    if (existingTiles.length !== this._config.speakers.length) {
      grid.innerHTML = '';
      for (const spk of this._config.speakers) {
        const tile = this._createTile(spk);
        grid.appendChild(tile);
      }
    } else {
      // Update existing tiles
      existingTiles.forEach((tile, i) => {
        this._updateTile(tile, this._config.speakers[i]);
      });
    }
  }

  _createTile(spk) {
    const tile = document.createElement('div');
    tile.className = 'spk-tile';
    tile.dataset.entity = spk.entity_id;
    tile.innerHTML = `
      <div class="grp-dot"></div>
      <div class="spk-orb">
        <span class="icon icon-28">speaker</span>
      </div>
      <span class="spk-name">${this._escHtml(spk.name)}</span>
      <span class="spk-vol">--</span>
      <div class="vol-bar"><div class="vol-bar-fill"></div></div>
    `;

    // Tap = toggle group, drag = volume
    tile.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this._startInteraction(tile, spk, e);
    });

    this._updateTile(tile, spk);
    return tile;
  }

  _updateTile(tile, spk) {
    if (!this._hass) return;
    const entity = this._hass.states[spk.entity_id];
    const inGroup = this._isInGroup(spk.group_sensor);
    const isPlaying = entity && entity.state === 'playing';
    const vol = entity ? Math.round((entity.attributes.volume_level || 0) * 100) : 0;

    // State classes (don't touch if sliding)
    if (!tile.classList.contains('sliding')) {
      tile.classList.toggle('in-group', inGroup && !isPlaying);
      tile.classList.toggle('playing', isPlaying);
    }

    // Volume display
    const volEl = tile.querySelector('.spk-vol');
    if (!tile.classList.contains('sliding')) {
      volEl.textContent = vol + '%';
    }

    // Volume bar
    const fill = tile.querySelector('.vol-bar-fill');
    if (!tile.classList.contains('sliding')) {
      fill.style.width = vol + '%';
    }
  }

  /* -- Interaction: Tap vs Drag -- */

  _startInteraction(tile, spk, e) {
    const entity = this._hass ? this._hass.states[spk.entity_id] : null;
    const startVol = entity ? Math.round((entity.attributes.volume_level || 0) * 100) : 50;

    this._dragState = {
      tileEl: tile,
      entityId: spk.entity_id,
      startX: e.clientX,
      startVol: startVol,
      active: false,
      pointerId: e.pointerId,
    };

    tile.setPointerCapture(e.pointerId);
  }

  _onPointerMove(e) {
    if (!this._dragState) return;
    const ds = this._dragState;
    const dx = e.clientX - ds.startX;
    const THRESHOLD = 4;

    if (!ds.active) {
      if (Math.abs(dx) < THRESHOLD) return;
      ds.active = true;
      ds.tileEl.classList.add('sliding');
    }

    // Map horizontal drag to volume
    const tileWidth = ds.tileEl.offsetWidth;
    const volDelta = Math.round((dx / tileWidth) * 100);
    const newVol = Math.max(0, Math.min(100, ds.startVol + volDelta));

    // Update UI
    const volEl = ds.tileEl.querySelector('.spk-vol');
    volEl.textContent = newVol + '%';
    const fill = ds.tileEl.querySelector('.vol-bar-fill');
    fill.style.width = newVol + '%';

    ds.currentVol = newVol;
  }

  _onPointerUp(e) {
    if (!this._dragState) return;
    const ds = this._dragState;

    ds.tileEl.classList.remove('sliding');

    if (ds.active) {
      // Was a drag — set volume
      const vol = ds.currentVol != null ? ds.currentVol : ds.startVol;
      this._setVolume(ds.entityId, vol / 100);
    } else {
      // Was a tap — toggle group membership
      this._toggleGroup(ds.entityId);
    }

    this._dragState = null;
  }

  /* -- Helpers -- */

  _isInGroup(groupSensor) {
    if (!this._hass || !groupSensor) return false;
    const entity = this._hass.states[groupSensor];
    return entity && entity.state === 'on';
  }

  /* -- Service Calls -- */

  _toggleGroup(speakerEntityId) {
    if (!this._hass) return;
    const scriptEntity = this._config.toggle_group_script;
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {
      target_speaker: speakerEntityId,
    });
    this._startServiceCooldown();
  }

  _setVolume(entityId, level) {
    if (!this._hass) return;
    this._hass.callService('media_player', 'volume_set', {
      entity_id: entityId,
      volume_level: Math.max(0, Math.min(1, level)),
    });
    this._startServiceCooldown();
  }

  _groupAll() {
    if (!this._hass) return;
    const scriptEntity = this._config.group_all_script;
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {});
    this._startServiceCooldown();
  }

  _ungroupAll() {
    if (!this._hass) return;
    const scriptEntity = this._config.ungroup_all_script;
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {});
    this._startServiceCooldown();
  }

  _startServiceCooldown() {
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._serviceCooldown = false;
      this._updateAll();
    }, 1500);
  }

  _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/* ===============================================================
   Registration
   =============================================================== */

customElements.define('tunet-speaker-grid-card', TunetSpeakerGridCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-speaker-grid-card',
  name: 'Tunet Speaker Grid Card',
  description: 'Glassmorphism speaker grid with tap-to-group and drag-to-volume',
  preview: true,
});

console.info(
  `%c TUNET-SPEAKER-GRID %c v${SPEAKER_GRID_VERSION} `,
  'color: #fff; background: #34C759; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #34C759; background: #e8f5e9; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
