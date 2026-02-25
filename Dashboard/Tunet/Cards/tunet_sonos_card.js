/**
 * Tunet Sonos Card v1.0.0
 * Unified Sonos media player + speaker tiles in one card
 * Replaces: tunet_media_card.js + tunet_speaker_grid_card.js
 *
 * Layout:
 *   Compact player header (album art + track info + transport + source dropdown)
 *   Horizontal-scroll speaker tiles with drag-to-volume
 *
 * Interactions:
 *   Tile tap        = toggle group membership
 *   Tile drag L/R   = volume control (floating pill)
 *   Tile hold 500ms = open more-info dialog
 *   Source dropdown  = switch which Sonos entity to control
 *   Transport        = play/pause/prev/next on coordinator
 *   Volume button    = show volume overlay for active entity
 *
 * Version 1.0.0
 */

import {
  TOKENS,
  RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion, clamp,
} from './tunet_base.js';

const CARD_VERSION = '1.0.0';

/* ===============================================================
   CSS - Card-specific overrides
   =============================================================== */

const CARD_OVERRIDES = `
  :host {
    /* Blue accent for Sonos */
    --sonos-blue: #007AFF;
    --sonos-blue-fill: rgba(0,122,255, 0.09);
    --sonos-blue-border: rgba(0,122,255, 0.14);
    --sonos-blue-glow: rgba(0,122,255, 0.25);

    /* Green for playing */
    --sonos-green: var(--green);
    --sonos-green-fill: var(--green-fill);
    --sonos-green-border: var(--green-border);

    /* Tile shadows */
    --tile-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);

    --spring: cubic-bezier(0.34, 1.56, 0.64, 1);
    display: block;
  }

  :host(.dark) {
    --sonos-blue: #0A84FF;
    --sonos-blue-fill: rgba(10,132,255, 0.13);
    --sonos-blue-border: rgba(10,132,255, 0.18);
    --sonos-blue-glow: rgba(10,132,255, 0.35);

    --tile-shadow: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.30);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
  }

  .card {
    width: 100%;
    padding: 16px;
    gap: 12px;
    overflow: hidden;
  }

  /* State borders */
  .card[data-state="playing"] { border-color: var(--sonos-blue-border); }
  .card[data-state="paused"] { opacity: 0.88; }
  .card[data-state="idle"] { opacity: 0.65; }
  .card[data-state="off"],
  .card[data-state="unavailable"] { opacity: 0.55; }
`;

/* ===============================================================
   CSS - Compact Player Header
   =============================================================== */

const PLAYER_HEADER_STYLES = `
  .player-header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
  }

  /* Album art - 36px to match icon sizes */
  .album-art {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden;
    background: var(--sonos-blue-fill);
    display: grid; place-items: center;
    position: relative;
  }
  .album-art img {
    width: 100%; height: 100%; object-fit: cover;
    position: absolute; inset: 0;
  }
  .album-art .icon { color: var(--sonos-blue); font-size: 20px; }
  .card[data-state="playing"] .album-art { box-shadow: var(--ctrl-sh); }

  /* Track info */
  .track-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 1px;
  }
  .track-name {
    font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 11px; font-weight: 600; color: var(--text-sub); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Transport controls - all uniform */
  .transport {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }
  .t-btn {
    width: 36px; height: 36px; border-radius: 10px;
    display: grid; place-items: center;
    cursor: pointer; transition: all .15s ease;
    border: none; background: transparent; color: var(--text-sub);
  }
  .t-btn:hover { background: var(--track-bg); }
  .t-btn:active { transform: scale(.90); }
  .t-btn .icon { font-size: 20px; }
  .t-btn[disabled] { opacity: 0.35; pointer-events: none; }
`;

/* ===============================================================
   CSS - Source Dropdown
   =============================================================== */

const SOURCE_DROPDOWN_STYLES = `
  .source-wrap { position: relative; z-index: 20; }

  .source-btn {
    display: flex; align-items: center; gap: 4px;
    padding: 6px 10px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--text-sub); letter-spacing: .2px;
    cursor: pointer; transition: all .15s ease;
    white-space: nowrap;
  }
  .source-btn:hover { box-shadow: var(--shadow); }
  .source-btn:active { transform: scale(.97); }
  .source-btn .icon { font-size: 16px; }
  .source-btn .chevron { font-size: 14px; transition: transform .2s ease; }
  .source-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .source-dd {
    position: fixed; top: 0; left: 0;
    min-width: 200px;
    background: var(--dd-bg, var(--glass));
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border, var(--ctrl-border));
    border-radius: 14px;
    box-shadow: var(--shadow-up);
    padding: 6px;
    z-index: 2147483000;
    display: none;
  }
  .source-dd.open {
    display: block;
    animation: srcMenuIn .14s ease forwards;
  }
  @keyframes srcMenuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .source-opt {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 13px; font-weight: 500;
    color: var(--text);
    cursor: pointer; transition: background .12s ease;
    border: none; background: none; width: 100%;
    text-align: left; font-family: inherit;
  }
  .source-opt:hover { background: var(--track-bg); }
  .source-opt .icon { font-size: 18px; color: var(--text-sub); }
  .source-opt.active { font-weight: 700; }
  .source-opt.active .icon {
    color: var(--sonos-blue);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .source-opt .opt-sub {
    font-size: 11px; font-weight: 500; color: var(--text-muted);
    margin-left: auto; white-space: nowrap;
  }
`;

/* ===============================================================
   CSS - Speaker Tiles
   =============================================================== */

const SPEAKER_TILE_STYLES = `
  /* Horizontal scroll container */
  .speakers-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 0;
    padding: 4px 0 6px 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    margin: 0 -4px;
    padding-left: 4px;
    padding-right: 4px;
  }
  .speakers-scroll::-webkit-scrollbar { display: none; }

  /* Individual speaker tile - landscape */
  .speaker-tile {
    scroll-snap-align: start;
    flex-shrink: 0;
    width: 150px;
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--tile-shadow);
    border: 1.5px solid var(--border-ghost);
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    row-gap: 1px;
    padding: 10px 12px 16px;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: none;
    transition:
      transform .3s var(--spring),
      box-shadow .3s ease,
      border-color .2s ease,
      background-color .3s ease;
  }
  .speaker-tile:hover { box-shadow: var(--tile-shadow-lift); }

  /* Grouped (active) state */
  .speaker-tile.grouped { border-color: var(--sonos-blue-border); }

  /* Sliding (drag-to-volume active) */
  .speaker-tile.sliding {
    transform: scale(1.06);
    box-shadow: var(--tile-shadow-lift);
    border-color: var(--sonos-blue);
    z-index: 100;
  }

  /* Floating volume pill */
  .spk-floating-pill {
    position: absolute;
    top: -10px; left: 50%;
    transform: translate(-50%, -100%);
    background: var(--tile-bg);
    color: var(--sonos-blue);
    padding: 5px 14px;
    border-radius: var(--r-pill);
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
    white-space: nowrap;
    z-index: 101;
    border: 1px solid var(--border-ghost);
    opacity: 0; pointer-events: none;
    transition: opacity .15s ease;
    font-variant-numeric: tabular-nums;
  }
  :host(.dark) .spk-floating-pill { border-color: rgba(255,255,255,0.08); }
  .speaker-tile.sliding .spk-floating-pill { opacity: 1; }

  /* Grouped dot indicator */
  .group-dot {
    position: absolute; top: 8px; right: 8px;
    width: 7px; height: 7px;
    background: var(--sonos-blue);
    border-radius: 50%;
    opacity: 0;
    transition: opacity .2s ease;
    box-shadow: 0 0 8px var(--sonos-blue-glow);
  }
  .speaker-tile.grouped .group-dot { opacity: 1; }

  /* Speaker icon wrap - spans both rows, sits on the left */
  .spk-icon-wrap {
    grid-row: 1 / 3;
    width: 34px; height: 34px;
    border-radius: 9px;
    display: grid; place-items: center;
    transition: all .2s ease;
    background: var(--gray-ghost);
    color: var(--text-sub);
  }
  .spk-icon-wrap .icon { font-size: 20px; }
  .speaker-tile.grouped .spk-icon-wrap {
    background: var(--sonos-blue-fill);
    color: var(--sonos-blue);
  }
  .speaker-tile.grouped .spk-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Speaker name - top row, right of icon */
  .spk-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    line-height: 1.2; text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    align-self: end;
  }

  /* Volume value - bottom row, right of icon */
  .spk-vol {
    font-size: 11px; font-weight: 700;
    color: var(--sonos-blue);
    line-height: 1;
    text-align: left;
    align-self: start;
    font-variant-numeric: tabular-nums;
    transition: color .2s ease;
  }
  .speaker-tile:not(.grouped) .spk-vol {
    color: var(--text-muted);
  }

  /* Volume bar */
  .spk-vol-track {
    position: absolute; bottom: 7px; left: 12px; right: 12px;
    height: 3px; background: var(--track-bg);
    border-radius: var(--r-pill);
    overflow: hidden;
  }
  .spk-vol-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue);
    opacity: 0.6;
    transition: width .1s linear;
  }
  .speaker-tile:not(.grouped) .spk-vol-fill {
    opacity: 0.2;
  }
`;

/* ===============================================================
   CSS - Volume Overlay
   =============================================================== */

const VOLUME_OVERLAY_STYLES = `
  .vol-overlay {
    position: absolute; inset: 0;
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: var(--r-card);
    display: none; align-items: center; justify-content: center;
    gap: 12px; padding: 16px 20px;
    z-index: 10;
  }
  .vol-overlay.active { display: flex; }
  .vol-overlay .vol-icon {
    font-size: 20px; color: var(--text-sub); cursor: pointer;
    font-family: 'Material Symbols Rounded';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-flex; align-items: center; justify-content: center;
    border: none; background: none; padding: 4px;
  }
  .vol-overlay .vol-icon:active { transform: scale(.9); }

  .vol-slider-track {
    flex: 1; height: 6px; background: var(--track-bg);
    border-radius: var(--r-pill); position: relative; cursor: pointer;
    touch-action: none;
  }
  .vol-slider-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue); transition: width .1s linear;
  }
  .vol-slider-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 18px; height: 18px; background: var(--thumb-bg, #fff);
    border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    transition: left .1s linear;
  }
  .vol-pct {
    font-size: 14px; font-weight: 700; color: var(--sonos-blue);
    min-width: 36px; text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

/* ===============================================================
   CSS - Responsive
   =============================================================== */

const RESPONSIVE_STYLES = `
  @media (max-width: 440px) {
    .card { padding: 14px; gap: 10px; }
    .player-header { gap: 10px; }
    .album-art { width: 32px; height: 32px; border-radius: 8px; }
    .album-art .icon { font-size: 18px; }
    .track-name { font-size: 13px; }
    .track-artist { font-size: 10px; }
    .t-btn { width: 32px; height: 32px; }
    .t-btn .icon { font-size: 18px; }

    /* Tiles become near-square on mobile */
    .speaker-tile {
      width: 100px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 10px 8px 16px;
      gap: 3px;
    }
    .spk-icon-wrap {
      grid-row: unset;
      width: 32px; height: 32px; border-radius: 8px;
    }
    .spk-icon-wrap .icon { font-size: 18px; }
    .spk-name { font-size: 12px; text-align: center; align-self: unset; }
    .spk-vol { font-size: 10px; text-align: center; align-self: unset; }
    .spk-vol-track { left: 10px; right: 10px; bottom: 6px; }
  }
`;

/* ===============================================================
   Composite stylesheet
   =============================================================== */

const TUNET_SONOS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${PLAYER_HEADER_STYLES}
  ${SOURCE_DROPDOWN_STYLES}
  ${SPEAKER_TILE_STYLES}
  ${VOLUME_OVERLAY_STYLES}
  ${RESPONSIVE_STYLES}
  ${REDUCED_MOTION}
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TUNET_SONOS_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Compact Player Header -->
      <div class="player-header">
        <div class="album-art" id="albumArt">
          <span class="icon filled" id="albumIcon">music_note</span>
        </div>
        <div class="track-info">
          <div class="track-name" id="trackName">Nothing playing</div>
          <div class="track-artist" id="trackArtist">Select a source to play</div>
        </div>
        <div class="transport">
          <button class="t-btn" id="prevBtn" title="Previous">
            <span class="icon" style="font-size:20px">skip_previous</span>
          </button>
          <button class="t-btn" id="playBtn" title="Play/Pause">
            <span class="icon" style="font-size:20px" id="playIcon">play_arrow</span>
          </button>
          <button class="t-btn" id="nextBtn" title="Next">
            <span class="icon" style="font-size:20px">skip_next</span>
          </button>
          <button class="t-btn" id="volBtn" title="Volume">
            <span class="icon" style="font-size:20px" id="volBtnIcon">volume_up</span>
          </button>
        </div>
        <div class="source-wrap" id="sourceWrap">
          <button class="source-btn" id="sourceBtn" aria-expanded="false">
            <span class="icon" id="sourceIcon">speaker</span>
            <span id="sourceLabel">Speaker</span>
            <span class="icon chevron">expand_more</span>
          </button>
          <div class="source-dd" id="sourceDd"></div>
        </div>
      </div>

      <!-- Speaker Tiles (horizontal scroll) -->
      <div class="speakers-scroll" id="speakersScroll"></div>

      <!-- Volume Overlay -->
      <div class="vol-overlay" id="volOverlay">
        <button class="vol-icon" id="muteBtn">volume_off</button>
        <div class="vol-slider-track" id="volTrack">
          <div class="vol-slider-fill" id="volFill" style="width:0%"></div>
          <div class="vol-slider-thumb" id="volThumb" style="left:0%"></div>
        </div>
        <div class="vol-pct" id="volPct">0%</div>
        <button class="vol-icon" id="volClose">close</button>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Constants
   =============================================================== */

const DRAG_THRESHOLD = 4;
const DRAG_SCALE = 1.2; // px per 1% volume
const LONG_PRESS_MS = 500;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetSonosCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._activeEntity = null;
    this._cachedSpeakers = null;
    this._tileRefs = new Map();

    // Drag state
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._dragCurrentVol = 0;
    this._volDebounce = null;
    this._holdFromIcon = false;

    // Long-press state
    this._longPressTimer = null;
    this._longPressFired = false;

    // Volume overlay state
    this._volDragging = false;
    this._volOverlayDebounce = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;

    injectFonts();
    this._onDocClick = this._onDocClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }

  /* ── Config ───────────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { filter: [{ domain: 'media_player' }] } },
        },
        { name: 'name', selector: { text: {} } },
        {
          name: '', type: 'grid',
          schema: [
            {
              name: 'coordinator_sensor',
              selector: { entity: { filter: [{ domain: 'sensor' }] } },
            },
            {
              name: 'active_group_sensor',
              selector: { entity: { filter: [{ domain: 'sensor' }] } },
            },
            {
              name: 'playing_status_sensor',
              selector: { entity: { filter: [{ domain: 'sensor' }] } },
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Media Player Entity',
          name: 'Card Name',
          coordinator_sensor: 'Coordinator Sensor',
          active_group_sensor: 'Active Group Sensor',
          playing_status_sensor: 'Playing Status Sensor',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Sonos',
      coordinator_sensor: 'sensor.sonos_smart_coordinator',
      active_group_sensor: 'sensor.sonos_active_group_coordinator',
      playing_status_sensor: 'sensor.sonos_playing_status',
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a media_player entity');
    }
    this._config = {
      entity: config.entity,
      name: config.name || 'Sonos',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      active_group_sensor: config.active_group_sensor || 'sensor.sonos_active_group_coordinator',
      playing_status_sensor: config.playing_status_sensor || 'sensor.sonos_playing_status',
    };
    if (!this._activeEntity) {
      this._activeEntity = config.entity;
    }
    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildTiles();
      this._updateAll();
    }
  }

  /* ── HA State ─────────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildTiles();
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Auto-detect speakers
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildTiles();
    }

    // Only update if relevant entities changed
    let changed = !oldHass;
    if (!changed) {
      const watchList = [
        this._config.entity,
        this._activeEntity,
        this._config.coordinator_sensor,
        this._config.active_group_sensor,
        this._config.playing_status_sensor,
      ];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity, true));
        watchList.push(this._binarySensorFor(spk.entity, false));
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

  getCardSize() { return 3; }

  /* ── Lifecycle ────────────────────────────────────── */

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
    window.addEventListener('resize', this._onViewportChange, { passive: true });
    window.addEventListener('scroll', this._onViewportChange, { passive: true });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._volOverlayDebounce);
    clearTimeout(this._cooldownTimer);
  }

  /* ── Helpers ──────────────────────────────────────── */

  _binarySensorFor(entityId, active = true) {
    const room = entityId.replace('media_player.', '');
    return active
      ? `binary_sensor.sonos_${room}_in_active_group`
      : `binary_sensor.sonos_${room}_in_playing_group`;
  }

  get _coordinator() {
    if (!this._hass) return this._activeEntity || this._config.entity;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    if (sensor && sensor.state && !['unknown', 'unavailable', 'none'].includes(sensor.state)) {
      if (this._hass.states[sensor.state]) return sensor.state;
    }
    return this._activeEntity || this._config.entity;
  }

  _callTransport(service) {
    if (!this._hass) return;
    this._hass.callService('media_player', service, { entity_id: this._coordinator });
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _sendVolumeSet(entityId, percent) {
    const pct = clamp(Math.round(Number(percent) || 0), 0, 100);
    if (!entityId) return;
    this._callService('media_player', 'volume_set', {
      entity_id: entityId,
      volume_level: pct / 100,
    });
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
  }

  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService('script', name, data);
  }

  _activeGroupMembers() {
    if (!this._hass) return [];
    const sensor = this._hass.states[this._config.active_group_sensor];
    if (!sensor) return [];
    const fromAttr = sensor.attributes && sensor.attributes.group_members;
    if (Array.isArray(fromAttr)) return fromAttr;
    if (typeof fromAttr === 'string') {
      try {
        const parsed = JSON.parse(fromAttr);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) { /* ignore */ }
    }
    return [];
  }

  _isSpeakerInActiveGroup(entityId) {
    const activeMembers = this._activeGroupMembers();
    if (activeMembers.length > 0) return activeMembers.includes(entityId);
    if (!this._hass) return false;
    const activeBinary = this._hass.states[this._binarySensorFor(entityId, true)];
    if (activeBinary) return activeBinary.state === 'on';
    const legacyBinary = this._hass.states[this._binarySensorFor(entityId, false)];
    return !!legacyBinary && legacyBinary.state === 'on';
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    const seen = new Set();
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_(active|playing)_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        if (seen.has(playerEntity)) continue;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          seen.add(playerEntity);
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

  _getSpeakerStateLabel(entityId) {
    if (!this._hass) return 'Idle';
    const entity = this._hass.states[entityId];
    if (!entity) return 'Idle';
    if (entity.state === 'playing') {
      const title = entity.attributes.media_title;
      return title || 'Playing';
    }
    if (entity.state === 'paused') return 'Paused';
    return 'Idle';
  }

  _getSpeakerShortName(entityId) {
    if (!this._hass) return entityId;
    const entity = this._hass.states[entityId];
    if (!entity) return entityId;
    const friendly = entity.attributes.friendly_name || '';
    // Strip common prefixes like "Sonos " for shorter display
    return friendly.replace(/^Sonos\s+/i, '') || entityId.replace('media_player.', '');
  }

  /* ── Rendering ────────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SONOS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SONOS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'albumArt', 'albumIcon', 'trackName', 'trackArtist',
      'prevBtn', 'playBtn', 'playIcon', 'nextBtn',
      'volBtn', 'volBtnIcon',
      'sourceWrap', 'sourceBtn', 'sourceIcon', 'sourceLabel', 'sourceDd',
      'speakersScroll',
      'volOverlay', 'muteBtn', 'volTrack', 'volFill', 'volThumb', 'volPct', 'volClose',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  /* ── Event Listeners ──────────────────────────────── */

  _setupListeners() {
    const $ = this.$;

    // Album art -> more-info
    $.albumArt.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._coordinator },
      }));
    });
    $.albumArt.style.cursor = 'pointer';

    // Transport
    $.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_previous_track');
    });
    $.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_play_pause');
    });
    $.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_next_track');
    });

    // Volume button -> show overlay
    $.volBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      $.volOverlay.classList.toggle('active');
    });

    // Volume overlay close
    $.volClose.addEventListener('click', (e) => {
      e.stopPropagation();
      $.volOverlay.classList.remove('active');
    });

    // Mute toggle
    $.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entity = this._hass && this._hass.states[this._activeEntity];
      if (entity) {
        this._callService('media_player', 'volume_mute', {
          entity_id: this._activeEntity,
          is_volume_muted: !entity.attributes.is_volume_muted,
        });
      }
    });

    // Volume overlay slider
    this._setupVolOverlayDrag();

    // Source dropdown toggle
    $.sourceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = $.sourceDd.classList.contains('open');
      if (isOpen) {
        this._closeSourceMenu();
      } else {
        this._buildSourceMenu();
        this._openSourceMenu();
      }
    });
  }

  _setupVolOverlayDrag() {
    const track = this.$.volTrack;
    let dragging = false;

    const setVol = (e) => {
      const rect = track.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const pct = clamp(Math.round(((cx - rect.left) / rect.width) * 100), 0, 100);
      this.$.volFill.style.width = pct + '%';
      this.$.volThumb.style.left = pct + '%';
      this.$.volPct.textContent = pct + '%';

      clearTimeout(this._volOverlayDebounce);
      this._volOverlayDebounce = setTimeout(() => {
        this._callService('media_player', 'volume_set', {
          entity_id: this._activeEntity,
          volume_level: pct / 100,
        });
        this._serviceCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
      }, 200);
    };

    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      this._volDragging = true;
      track.setPointerCapture(e.pointerId);
      setVol(e);
    });
    track.addEventListener('pointermove', (e) => { if (dragging) setVol(e); });
    track.addEventListener('pointerup', () => {
      dragging = false;
      this._volDragging = false;
    });
    track.addEventListener('pointercancel', () => {
      dragging = false;
      this._volDragging = false;
    });
  }

  /* ── Source Dropdown ──────────────────────────────── */

  _buildSourceMenu() {
    const dd = this.$.sourceDd;
    if (!dd || !this._hass) return;
    dd.innerHTML = '';

    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const entity = this._hass.states[spk.entity];
      if (!entity) continue;

      const isActive = spk.entity === this._activeEntity;
      const stateLabel = this._getSpeakerStateLabel(spk.entity);

      const opt = document.createElement('button');
      opt.className = `source-opt${isActive ? ' active' : ''}`;

      const iconEl = document.createElement('span');
      iconEl.className = 'icon';
      iconEl.style.fontSize = '18px';
      iconEl.textContent = spk.icon || 'speaker';
      opt.appendChild(iconEl);

      const nameSpan = document.createTextNode(
        ' ' + (spk.name || entity.attributes.friendly_name || spk.entity) + ' '
      );
      opt.appendChild(nameSpan);

      const subSpan = document.createElement('span');
      subSpan.className = 'opt-sub';
      subSpan.textContent = stateLabel;
      opt.appendChild(subSpan);

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._activeEntity = spk.entity;
        this._closeSourceMenu();
        this._updateAll();
      });

      dd.appendChild(opt);
    }
  }

  _openSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.add('open');
    sourceBtn.setAttribute('aria-expanded', 'true');
    this._positionSourceMenu();
  }

  _closeSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.remove('open');
    sourceBtn.setAttribute('aria-expanded', 'false');
    sourceDd.style.left = '';
    sourceDd.style.top = '';
  }

  _positionSourceMenu() {
    const { sourceBtn, sourceDd } = this.$;
    if (!sourceBtn || !sourceDd) return;

    const btnRect = sourceBtn.getBoundingClientRect();
    const menuWidth = Math.max(sourceDd.offsetWidth || 200, 200);
    const menuHeight = Math.max(sourceDd.offsetHeight || 200, 150);
    const pad = 8;

    let left = btnRect.right - menuWidth;
    if (left < pad) left = pad;
    const maxLeft = Math.max(pad, window.innerWidth - menuWidth - pad);
    if (left > maxLeft) left = maxLeft;

    let top = btnRect.bottom + 6;
    if (top + menuHeight > window.innerHeight - pad) {
      top = Math.max(pad, btnRect.top - menuHeight - 6);
    }

    sourceDd.style.left = `${Math.round(left)}px`;
    sourceDd.style.top = `${Math.round(top)}px`;
  }

  _onDocClick(e) {
    if (!this.$ || !this.$.sourceDd) return;
    if (!this.$.sourceDd.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector('.source-wrap'))) {
      this._closeSourceMenu();
    }
  }

  _onViewportChange() {
    if (!this.$ || !this.$.sourceDd || !this.$.sourceDd.classList.contains('open')) return;
    this._positionSourceMenu();
  }

  /* ── Build Speaker Tiles ─────────────────────────── */

  _buildTiles() {
    const scroll = this.$.speakersScroll;
    if (!scroll) return;
    scroll.innerHTML = '';
    this._tileRefs.clear();

    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'speaker-tile';
      tile.dataset.entity = spk.entity;

      // Group dot
      const dot = document.createElement('div');
      dot.className = 'group-dot';
      tile.appendChild(dot);

      // Floating pill
      const pill = document.createElement('div');
      pill.className = 'spk-floating-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);

      // Icon wrap
      const iconWrap = document.createElement('div');
      iconWrap.className = 'spk-icon-wrap';
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.style.fontSize = '20px';
      icon.textContent = spk.icon || 'speaker';
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'spk-name';
      nameEl.textContent = spk.name || spk.entity;
      tile.appendChild(nameEl);

      // Volume label
      const volEl = document.createElement('div');
      volEl.className = 'spk-vol';
      volEl.textContent = '0%';
      tile.appendChild(volEl);

      // Volume track
      const volTrack = document.createElement('div');
      volTrack.className = 'spk-vol-track';
      const volFill = document.createElement('div');
      volFill.className = 'spk-vol-fill';
      volFill.style.width = '0%';
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);

      // Pointer events for drag-to-volume / tap-to-group
      tile.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });

      scroll.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, iconWrap, icon, nameEl, volEl, volFill, pill });
    }
  }

  /* ── Tile Pointer Handling ───────────────────────── */

  _onTilePointerDown(entity, e, tile) {
    if (e.cancelable) e.preventDefault();
    this._dragEntity = entity;
    this._dragStartX = e.clientX;
    this._dragActive = false;
    this._longPressFired = false;
    this._holdFromIcon = !!(e.target && e.target.closest && e.target.closest('.spk-icon-wrap'));

    const playerState = this._hass && this._hass.states[entity];
    this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;
    this._dragCurrentVol = this._dragVol;

    try {
      if (tile && typeof tile.setPointerCapture === 'function') tile.setPointerCapture(e.pointerId);
    } catch (_) {
      // no-op
    }

    clearTimeout(this._longPressTimer);
    if (this._holdFromIcon) {
      this._longPressTimer = setTimeout(() => {
        if (!this._dragActive && this._dragEntity === entity) {
          this._longPressFired = true;
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: entity },
          }));
          this._dragEntity = null;
        }
      }, LONG_PRESS_MS);
    }
  }

  _onPointerMove(e) {
    if (!this._dragEntity) return;
    if (e.cancelable) e.preventDefault();
    const dx = e.clientX - this._dragStartX;

    if (!this._dragActive) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      clearTimeout(this._longPressTimer);

      const refs = this._tileRefs.get(this._dragEntity);
      if (refs) refs.tile.classList.add('sliding');
    }

    const newVol = clamp(Math.round(this._dragVol + (dx / DRAG_SCALE)), 0, 100);
    this._dragCurrentVol = newVol;
    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volEl.textContent = newVol + '%';
      refs.pill.textContent = newVol + '%';
      refs.volFill.style.width = newVol + '%';
    }

    const targetEntity = this._dragEntity;
    const targetVolume = newVol;
    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._sendVolumeSet(targetEntity, targetVolume);
    }, 200);
  }

  _onPointerUp(e) {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);

    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);

    if (refs) refs.tile.classList.remove('sliding');

    if (this._dragActive) {
      clearTimeout(this._volDebounce);
      this._sendVolumeSet(entity, this._dragCurrentVol);
    }

    if (!this._dragActive && !this._longPressFired) {
      // Tap: toggle group membership
      this._callScript('sonos_toggle_group_membership', {
        target_speaker: entity,
      });
    }

    this._dragEntity = null;
    this._dragActive = false;
    this._holdFromIcon = false;

    try {
      if (refs?.tile && typeof refs.tile.releasePointerCapture === 'function') {
        refs.tile.releasePointerCapture(e.pointerId);
      }
    } catch (_) {
      // no-op
    }
  }

  /* ── Full Update ─────────────────────────────────── */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._volDragging || this._serviceCooldown) return;

    const coordId = this._coordinator;
    const coordEntity = this._hass.states[coordId];
    const activeEntity = this._hass.states[this._activeEntity];

    if (!coordEntity && !activeEntity) {
      $.card.dataset.state = 'unavailable';
      $.trackName.textContent = 'Unavailable';
      $.trackArtist.textContent = '';
      return;
    }

    const source = coordEntity || activeEntity;
    const state = source.state;
    const a = source.attributes;
    $.card.dataset.state = state;

    // Track info
    const isActive = state === 'playing' || state === 'paused';
    $.trackName.textContent = a.media_title || (isActive ? 'Unknown' : 'Not Playing');
    $.trackName.style.color = isActive ? '' : 'var(--text-muted)';
    $.trackArtist.textContent = a.media_artist || (isActive ? '' : 'Tap a speaker to start');

    // Album art
    const artUrl = a.entity_picture;
    const existingImg = $.albumArt.querySelector('img');
    if (artUrl) {
      const normalizedUrl = artUrl.startsWith('/') ? `${location.origin}${artUrl}` : artUrl;
      if (existingImg) {
        if (existingImg.src !== normalizedUrl) existingImg.src = normalizedUrl;
      } else {
        const img = document.createElement('img');
        img.src = normalizedUrl;
        img.alt = '';
        img.onerror = () => img.remove();
        $.albumArt.appendChild(img);
      }
    } else if (existingImg) {
      existingImg.remove();
    }

    // Play/pause icon
    $.playIcon.textContent = state === 'playing' ? 'pause' : 'play_arrow';
    if (state === 'playing') {
      $.playIcon.classList.add('filled');
    } else {
      $.playIcon.classList.remove('filled');
    }

    // Disable prev/next when idle
    $.prevBtn.disabled = !isActive;
    $.nextBtn.disabled = !isActive;

    // Volume button icon from active entity
    if (!this._volDragging && activeEntity) {
      const vol = Math.round((activeEntity.attributes.volume_level || 0) * 100);
      const muted = activeEntity.attributes.is_volume_muted;
      const volIcon = muted ? 'volume_off' : vol < 40 ? 'volume_down' : 'volume_up';
      $.volBtnIcon.textContent = volIcon;

      // Update volume overlay
      $.volFill.style.width = vol + '%';
      $.volThumb.style.left = vol + '%';
      $.volPct.textContent = vol + '%';
    }

    // Source button label
    const activeSpk = (this._cachedSpeakers || []).find(s => s.entity === this._activeEntity);
    if (activeSpk) {
      $.sourceLabel.textContent = activeSpk.name || this._getSpeakerShortName(this._activeEntity);
      $.sourceIcon.textContent = activeSpk.icon || 'speaker';
    } else if (activeEntity) {
      $.sourceLabel.textContent = this._getSpeakerShortName(this._activeEntity);
    }

    // Update speaker tiles
    this._updateTiles();
  }

  _updateTiles() {
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const playerState = this._hass.states[spk.entity];

      // Toggle grouped class
      refs.tile.classList.toggle('grouped', inGroup);

      // Icon fill
      if (inGroup) {
        refs.icon.classList.add('filled');
      } else {
        refs.icon.classList.remove('filled');
      }

      // Volume from entity state (only if not dragging this tile)
      if (playerState && this._dragEntity !== spk.entity) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + '%';
        refs.volFill.style.width = vol + '%';
        refs.pill.textContent = vol + '%';
      }
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

registerCard('tunet-sonos-card', TunetSonosCard, {
  name: 'Tunet Sonos Card',
  description: 'Unified Sonos player with speaker tiles, volume control, and group management',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-sonos-card',
});

logCardVersion('TUNET-SONOS', CARD_VERSION, '#007AFF');
