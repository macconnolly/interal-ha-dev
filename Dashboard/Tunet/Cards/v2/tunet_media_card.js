/**
 * Tunet Media Card v3.2.0
 * Sonos media player with transport, volume, and dual-purpose speaker dropdown
 * Dual-entity model: coordinator for media/transport, active entity for volume
 * Auto-detects speakers from active-group or playing-group Sonos binaries
 *
 * v3.2.0 – Composer migration to tunet-info-tile and tunet-speaker-tile primitives
 */

import {
  TOKENS,
  RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  INFO_TILE_PATTERN, LABEL_BUTTON_PATTERN, GLASS_MENU_PATTERN,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_info_tile.js';
import './tunet_speaker_tile.js';

const CARD_VERSION = '3.2.0';

/* ===============================================================
   CSS — Card-specific overrides + unique styles
   =============================================================== */

const CARD_OVERRIDES = `
  /* -- Card-specific token overrides -- */
  :host {
    --r-track: 4px;
    display: block;
  }

  /* -- Card shell overrides -- */
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
  }
  .card[data-state="playing"] { border-color: rgba(52,199,89,0.14); }
  :host(.dark) .card[data-state="playing"] { border-color: rgba(48,209,88,0.16); }
  .card[data-state="paused"] { opacity: 0.85; }
  .card[data-state="idle"] { opacity: 0.65; }
  .card[data-state="off"],
  .card[data-state="unavailable"] { opacity: 0.55; }
`;

const CARD_STYLES = `
  /* -- Header -- */
  .media-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .media-hdr tunet-info-tile { min-width: 0; flex: 1 1 auto; }

  .hdr-spacer { flex: 0; }

  /* TV Badge */
  .tv-badge {
    display: none; align-items: center; gap: 3px;
    padding: 3px 8px; border-radius: 8px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh);
    font-size: 10px; font-weight: 700; color: var(--text-muted);
    letter-spacing: .3px; flex-shrink: 0;
  }
  .tv-badge.visible { display: inline-flex; }

  /* -- Speaker Selector -- */
  .speaker-wrap { position: relative; z-index: 4000; }
  .speaker-btn {
    display: flex; align-items: center; gap: 4px;
    min-height: 42px; padding: 0 10px;
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12px; font-weight: 600;
    color: var(--text-sub); letter-spacing: .2px;
    cursor: pointer; transition: all .15s ease;
  }
  .speaker-btn:hover { box-shadow: var(--shadow); }
  .speaker-btn:active { transform: scale(.97); }
  .speaker-btn .chevron { transition: transform .2s ease; }
  .speaker-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* -- Dropdown Menu (fixed positioning for viewport-aware placement) -- */
  .dd-menu {
    position: fixed; top: 0; left: 0;
    min-width: 260px; max-width: 360px; max-height: min(70vh, 420px);
    overflow-y: auto;
    padding: 6px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 2147483000;
    display: none;
    flex-direction: column;
    gap: 6px;
  }
  .dd-menu.open { display: flex; animation: menuIn .14s ease forwards; }
  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dd-menu tunet-speaker-tile {
    display: block;
  }

  /* Action options */
  .dd-option.action { color: var(--text-sub); }
  .dd-option.action:hover { color: var(--text); }
  .dd-option.action .icon { color: var(--green); }

  .dd-divider { height: 1px; background: var(--divider); margin: 3px 8px; }

  /* -- Media Body (view switching) -- */
  .media-body { position: relative; overflow: hidden; }
  .media-row {
    display: flex; align-items: center; gap: 14px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .media-row.hidden {
    opacity: 0; transform: translateY(4px);
    pointer-events: none; position: absolute; inset: 0;
  }

  /* Album art */
  .album-art {
    width: 56px; height: 56px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden;
    background: var(--track-bg); box-shadow: var(--ctrl-sh);
    display: grid; place-items: center; position: relative;
  }
  .album-art img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
  .album-art .icon { color: var(--text-muted); }
  .card[data-state="playing"] .album-art { box-shadow: var(--shadow); }

  /* Track info */
  .track-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .track-name {
    font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 13px; font-weight: 600; color: var(--text-sub); line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Progress bar */
  .progress-wrap { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  .progress-time {
    font-size: 10px; font-weight: 600; color: var(--text-muted);
    font-variant-numeric: tabular-nums; letter-spacing: .3px;
    flex-shrink: 0; min-width: 28px;
  }
  .progress-time.right { text-align: right; }
  .progress-track {
    flex: 1; height: 3px; border-radius: 999px;
    background: var(--track-bg); position: relative; overflow: hidden;
  }
  .progress-fill {
    position: absolute; top: 0; left: 0; bottom: 0; border-radius: 999px;
    background: rgba(52,199,89,0.50); transition: width .5s linear;
  }
  :host(.dark) .progress-fill { background: rgba(48,209,88,0.50); }

  /* -- Transport -- */
  .transport { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .t-btn {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; cursor: pointer;
    transition: all .15s ease; border: none; background: transparent;
    color: var(--text-sub);
  }
  .t-btn:hover { background: var(--track-bg); }
  .t-btn:active { transform: scale(.90); }
  .t-btn.play {
    width: 42px; height: 42px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh); color: var(--text);
  }
  .t-btn.play:hover { box-shadow: var(--shadow); }
  .card[data-state="playing"] .t-btn.play {
    background: var(--green-fill); border-color: var(--green-border); color: var(--green);
  }
  .card[data-state="playing"] .t-btn.play .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .vol-btn {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; cursor: pointer;
    transition: all .15s ease; border: none; background: transparent;
    color: var(--text-muted);
  }
  .vol-btn:hover { background: var(--track-bg); }
  .vol-btn:active { transform: scale(.90); }

  /* -- Volume Row -- */
  .vol-row {
    display: flex; align-items: center; gap: 12px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .vol-row.hidden {
    opacity: 0; transform: translateY(-4px);
    pointer-events: none; position: absolute; inset: 0;
  }

  .vol-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; color: var(--green); transition: all .15s ease;
  }
  .vol-icon:hover { background: var(--track-bg); }
  .vol-icon:active { transform: scale(.90); }
  .vol-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .vol-slider-wrap { flex: 1; display: flex; align-items: center; position: relative; }
  .vol-track {
    width: 100%; height: 44px; border-radius: var(--r-track);
    background: var(--track-bg); position: relative;
    cursor: pointer; touch-action: none; overflow: hidden;
  }
  .vol-fill {
    position: absolute; top: 0; left: 0; bottom: 0;
    border-radius: var(--r-track) 0 0 var(--r-track);
    background: rgba(52,199,89,0.26); pointer-events: none;
    transition: width 60ms ease;
  }
  :host(.dark) .vol-fill { background: rgba(48,209,88,0.28); }

  .vol-thumb {
    position: absolute; top: 50%; transform: translate(-50%,-50%);
    width: 26px; height: 26px; pointer-events: none; z-index: 2;
    transition: left 60ms ease;
  }
  .vol-thumb-disc {
    width: 26px; height: 26px; border-radius: 999px;
    background: var(--thumb-bg); box-shadow: var(--thumb-sh);
    position: absolute; inset: 0;
    transition: box-shadow .15s ease, transform .15s ease;
  }
  .vol-thumb-dot {
    width: 8px; height: 8px; border-radius: 999px;
    background: var(--green); position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.08);
  }
  .vol-stroke {
    position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
    transform: translateX(-1px); background: var(--green);
    border-radius: 999px; pointer-events: none; z-index: 1;
    opacity: 1;
  }
  .vol-track[data-vol="0"] .vol-stroke { opacity: 0; }

  /* Dragging state */
  .vol-track.dragging .vol-thumb-disc {
    box-shadow: var(--thumb-sh-a); transform: scale(1.08);
  }
  .vol-track.dragging .vol-fill,
  .vol-track.dragging .vol-thumb,
  .vol-track.dragging .vol-stroke { transition: none; }

  .vol-pct {
    font-size: 14px; font-weight: 700; color: var(--text);
    font-variant-numeric: tabular-nums; letter-spacing: -0.2px;
    min-width: 42px; text-align: right; flex-shrink: 0;
  }
  .vol-close {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; color: var(--text-muted); transition: all .15s ease;
    border: none; background: transparent;
  }
  .vol-close:hover { background: var(--track-bg); }
  .vol-close:active { transform: scale(.90); }

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: 16px; }
    .album-art { width: 48px; height: 48px; }
    .track-name { font-size: 14px; }
    .transport { gap: 2px; }
    .t-btn { width: 34px; height: 34px; }
    .t-btn.play { width: 38px; height: 38px; }
  }
`;

/* ===============================================================
   Composite style sheet
   =============================================================== */

const TUNET_MEDIA_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${CARD_SURFACE} ${CARD_SURFACE_GLASS_STROKE} ${INFO_TILE_PATTERN} ${LABEL_BUTTON_PATTERN} ${GLASS_MENU_PATTERN} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TUNET_MEDIA_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Header -->
      <div class="media-hdr">
        <tunet-info-tile id="infoTile"></tunet-info-tile>
        <div class="hdr-spacer"></div>
        <span class="tv-badge" id="tvBadge">
          <span class="icon" style="font-size:11px">tv</span> TV
        </span>
        <div class="speaker-wrap" id="spkWrap" style="display:none">
          <button class="speaker-btn" id="spkBtn" aria-expanded="false">
            <span class="icon" style="font-size:16px">speaker</span>
            <span id="spkLabel">Speaker</span>
            <span class="icon chevron" style="font-size:14px">expand_more</span>
          </button>
          <div class="dd-menu" id="spkMenu"></div>
        </div>
      </div>

      <!-- Media body — swappable between track view and volume -->
      <div class="media-body">
        <!-- Track view -->
        <div class="media-row" id="trackRow">
          <div class="album-art" id="albumArt">
            <span class="icon" style="font-size:24px">music_note</span>
          </div>
          <div class="track-info">
            <span class="track-name" id="trackName">Nothing playing</span>
            <span class="track-artist" id="trackArtist">Select a source to play</span>
            <div class="progress-wrap" id="progressWrap">
              <span class="progress-time" id="progCur">--</span>
              <div class="progress-track">
                <div class="progress-fill" id="progFill" style="width:0%"></div>
              </div>
              <span class="progress-time right" id="progDur">--</span>
            </div>
          </div>
          <div class="transport">
            <button class="t-btn" id="prevBtn" title="Previous">
              <span class="icon" style="font-size:20px">skip_previous</span>
            </button>
            <button class="t-btn play" id="playBtn" title="Play/Pause">
              <span class="icon" style="font-size:20px" id="playIcon">play_arrow</span>
            </button>
            <button class="t-btn" id="nextBtn" title="Next">
              <span class="icon" style="font-size:20px">skip_next</span>
            </button>
            <button class="vol-btn" id="volShowBtn" title="Volume">
              <span class="icon" style="font-size:18px" id="volShowIcon">volume_up</span>
            </button>
          </div>
        </div>

        <!-- Volume view (hidden by default) -->
        <div class="vol-row hidden" id="volRow">
          <div class="vol-icon" id="muteBtn" title="Mute">
            <span class="icon" style="font-size:20px" id="volMuteIcon">volume_up</span>
          </div>
          <div class="vol-slider-wrap">
            <div class="vol-track" id="volTrack">
              <div class="vol-fill" id="volFill" style="width:0%"></div>
              <div class="vol-stroke" id="volStroke" style="left:0%"></div>
              <div class="vol-thumb" id="volThumb" style="left:0%">
                <div class="vol-thumb-disc"></div>
                <div class="vol-thumb-dot"></div>
              </div>
            </div>
          </div>
          <span class="vol-pct" id="volPct">0%</span>
          <button class="vol-close" id="volCloseBtn" title="Back to track">
            <span class="icon" style="font-size:18px">close</span>
          </button>
        </div>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetMediaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._progressInterval = null;
    this._volDragging = false;
    this._volDebounce = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._view = 'track'; // 'track' | 'volume'
    this._activeEntity = null;
    this._cachedSpeakers = null;

    injectFonts();
    this._onDocClick = this._onDocClick.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }

  /* -- Config -- */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entity',
          required: true,
          selector: { entity: { filter: [{ domain: 'media_player' }] } },
        },
        {
          name: 'name',
          selector: { text: {} },
        },
        {
          name: '',
          type: 'grid',
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
        {
          name: 'show_progress',
          selector: { boolean: {} },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Media Player Entity',
          name: 'Card Name',
          coordinator_sensor: 'Coordinator Sensor',
          active_group_sensor: 'Active Group Sensor',
          playing_status_sensor: 'Playing Status Sensor',
          show_progress: 'Show Progress Bar',
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
      show_progress: config.show_progress !== false,
    };
    if (!this._activeEntity) {
      this._activeEntity = config.entity;
    }
    this._cachedSpeakers = null;
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

    // Detect dark mode via shared utility
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Auto-detect speakers if not cached or empty
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      if (this.$.spkWrap) {
        this.$.spkWrap.style.display = this._cachedSpeakers.length > 0 ? '' : 'none';
      }
    }

    // Only update if relevant entities changed
    let changed = !oldHass;
    if (!changed) {
      const watchList = [
        this._config.entity,
        this._config.coordinator_sensor,
        this._config.active_group_sensor,
        this._config.playing_status_sensor,
      ];
      for (const spk of this._cachedSpeakers) {
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

  getCardSize() {
    return 3;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
    window.addEventListener('resize', this._onViewportChange, { passive: true });
    window.addEventListener('scroll', this._onViewportChange, { passive: true });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange);
    this._stopProgress();
  }

  /* -- Helpers -- */

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

  get _isTvMode() {
    if (!this._hass) return false;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    return sensor && sensor.attributes.is_tv_mode === true;
  }

  _callTransport(service) {
    if (!this._hass) return;
    this._hass.callService('media_player', service, { entity_id: this._coordinator });
  }

  _callService(service, data) {
    if (!this._hass) return;
    this._hass.callService('media_player', service, data);
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
      } catch (_) {
        // Best-effort parse only; ignore invalid content.
      }
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

  _getGroupedCount() {
    const members = this._activeGroupMembers();
    if (members.length > 0) return members.length;
    const speakers = this._cachedSpeakers || [];
    return speakers.filter((spk) => this._isSpeakerInActiveGroup(spk.entity)).length;
  }

  _headerSubtitle(state, groupedCount, activeEntity) {
    const activeSpk = (this._cachedSpeakers || []).find((s) => s.entity === this._activeEntity);
    const spkName = activeSpk ? activeSpk.name : (activeEntity?.attributes?.friendly_name || '');

    if (state === 'playing') {
      if (groupedCount > 1) return `Playing · ${groupedCount} grouped`;
      return spkName ? `Playing · ${spkName}` : 'Playing';
    }

    if (state === 'paused') {
      if (groupedCount > 1) return `Paused · ${groupedCount} grouped`;
      return spkName ? `Paused · ${spkName}` : 'Paused';
    }

    const stateNames = { idle: 'Idle', off: 'Off', unavailable: 'Unavailable' };
    const stateLabel = stateNames[state] || state;
    return groupedCount > 1 ? `${stateLabel} · ${groupedCount} grouped` : stateLabel;
  }

  _syncInfoTile(entityId, state, subtitle) {
    if (!this.$?.infoTile) return;
    const accent = state === 'playing' ? 'green' : state === 'paused' ? 'blue' : 'none';
    this.$.infoTile.setConfig({
      entity: entityId || this._config.entity,
      title: this._config.name,
      subtitle: subtitle || 'Unavailable',
      icon: this._isTvMode ? 'tv' : 'speaker_group',
      accent,
      tap_action: { action: 'more-info', entity_id: entityId || this._config.entity },
      hold_action: { action: 'more-info', entity_id: entityId || this._config.entity },
    });
    this.$.infoTile.hass = this._hass;
  }

  /* -- Rendering -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_MEDIA_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_MEDIA_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'infoTile', 'tvBadge',
      'spkWrap', 'spkBtn', 'spkLabel', 'spkMenu',
      'trackRow', 'albumArt', 'trackName', 'trackArtist', 'progressWrap',
      'progCur', 'progFill', 'progDur',
      'prevBtn', 'playBtn', 'playIcon', 'nextBtn', 'volShowBtn', 'volShowIcon',
      'volRow', 'muteBtn', 'volMuteIcon', 'volTrack', 'volFill',
      'volStroke', 'volThumb', 'volPct', 'volCloseBtn',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });

    this._syncInfoTile(this._config.entity, 'idle', 'Idle');
  }

  /* -- Event Listeners -- */

  _setupListeners() {
    const $ = this.$;

    // Info tile primitive actions route through runtime dispatcher.
    $.infoTile.addEventListener('tunet:action', (e) => {
      e.stopPropagation();
      const action = e.detail?.action;
      const entityId = e.detail?.entity_id || action?.entity_id || this._coordinator;
      if (!action) return;
      dispatchAction(this._hass, this, action, entityId).catch(() => this._updateAll());
    });

    // Album art -> more-info for coordinator
    $.albumArt.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._coordinator },
      }));
    });
    $.albumArt.style.cursor = 'pointer';

    // Transport -> coordinator
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

    // Show volume view
    $.volShowBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setView('volume');
    });

    // Hide volume view
    $.volCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setView('track');
    });

    // Mute toggle -> active entity
    $.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const entity = this._hass && this._hass.states[this._activeEntity];
      if (entity) {
        this._callService('volume_mute', {
          entity_id: this._activeEntity,
          is_volume_muted: !entity.attributes.is_volume_muted,
        });
      }
    });

    // Volume slider drag
    this._setupVolDrag();

    // Speaker dropdown toggle
    $.spkBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = $.spkMenu.classList.contains('open');
      if (isOpen) {
        this._closeSpeakerMenu();
      } else {
        this._buildSpeakerMenu();
        this._openSpeakerMenu();
      }
    });
  }

  _setupVolDrag() {
    const track = this.$.volTrack;
    let dragging = false;

    const setVol = (e) => {
      const rect = track.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const x = cx - rect.left;
      const pct = Math.max(0, Math.min(100, Math.round(x / rect.width * 100)));
      this._renderVolume(pct);

      const volIcon = pct === 0 ? 'volume_off' : pct < 40 ? 'volume_down' : 'volume_up';
      this.$.volMuteIcon.textContent = volIcon;

      clearTimeout(this._volDebounce);
      this._volDebounce = setTimeout(() => {
        this._callService('volume_set', {
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
      track.classList.add('dragging');
      track.setPointerCapture(e.pointerId);
      setVol(e);
    });
    track.addEventListener('pointermove', (e) => {
      if (dragging) setVol(e);
    });
    track.addEventListener('pointerup', () => {
      dragging = false;
      this._volDragging = false;
      track.classList.remove('dragging');
    });
    track.addEventListener('pointercancel', () => {
      dragging = false;
      this._volDragging = false;
      track.classList.remove('dragging');
    });
  }

  _setView(v) {
    this._view = v;
    this.$.trackRow.classList.toggle('hidden', v !== 'track');
    this.$.volRow.classList.toggle('hidden', v !== 'volume');
  }

  _onDocClick(e) {
    if (!this.$ || !this.$.spkMenu) return;
    if (!this.$.spkMenu.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector('.speaker-wrap'))) {
      this._closeSpeakerMenu();
    }
  }

  _onViewportChange() {
    if (!this.$ || !this.$.spkMenu || !this.$.spkMenu.classList.contains('open')) return;
    this._positionSpeakerMenu();
  }

  _openSpeakerMenu() {
    if (!this.$ || !this.$.spkMenu || !this.$.spkBtn) return;
    this.$.spkMenu.classList.add('open');
    this.$.spkBtn.setAttribute('aria-expanded', 'true');
    this._positionSpeakerMenu();
  }

  _closeSpeakerMenu() {
    if (!this.$ || !this.$.spkMenu || !this.$.spkBtn) return;
    this.$.spkMenu.classList.remove('open');
    this.$.spkBtn.setAttribute('aria-expanded', 'false');
    this.$.spkMenu.style.left = '';
    this.$.spkMenu.style.top = '';
  }

  _positionSpeakerMenu() {
    const { spkBtn, spkMenu } = this.$ || {};
    if (!spkBtn || !spkMenu) return;

    const btnRect = spkBtn.getBoundingClientRect();
    const menuRect = spkMenu.getBoundingClientRect();
    const menuWidth = Math.max(menuRect.width || 220, 220);
    const menuHeight = Math.max(menuRect.height || 260, 200);
    const pad = 8;

    let left = btnRect.right - menuWidth;
    if (left < pad) left = pad;
    const maxLeft = Math.max(pad, window.innerWidth - menuWidth - pad);
    if (left > maxLeft) left = maxLeft;

    let top = btnRect.bottom + 6;
    if (top + menuHeight > window.innerHeight - pad) {
      top = Math.max(pad, btnRect.top - menuHeight - 6);
    }

    spkMenu.style.left = `${Math.round(left)}px`;
    spkMenu.style.top = `${Math.round(top)}px`;
  }

  /* -- Speaker Dropdown Menu (dual-purpose: select + group) -- */

  _buildSpeakerMenu() {
    const $ = this.$;
    if (!$.spkMenu || !this._hass) return;
    $.spkMenu.innerHTML = '';

    const speakers = this._cachedSpeakers || [];

    for (const spk of speakers) {
      const entity = this._hass.states[spk.entity];
      if (!entity) continue;

      const isActive = spk.entity === this._activeEntity;
      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const volume = Math.round((entity.attributes.volume_level || 0) * 100);

      const nowPlaying = entity.attributes.media_title
        ? `${entity.attributes.media_title}${entity.attributes.media_artist ? ' \u2013 ' + entity.attributes.media_artist : ''}`
        : entity.state === 'playing' ? 'Playing' : 'Not playing';

      const tile = document.createElement('tunet-speaker-tile');
      tile.setConfig({
        entity: spk.entity,
        name: spk.name || entity.attributes.friendly_name || spk.entity,
        icon: spk.icon || 'speaker',
        meta: nowPlaying,
        state: entity.state || 'idle',
        in_group: inGroup,
        selected: isActive,
        volume,
        show_volume: true,
        show_group_dot: true,
        allow_group_toggle: true,
        tap_action: { action: 'select-speaker', entity_id: spk.entity },
        hold_action: { action: 'more-info', entity_id: spk.entity },
      });
      tile.hass = this._hass;

      tile.addEventListener('tunet:action', (e) => {
        e.stopPropagation();
        const action = e.detail?.action || {};
        if (action.action === 'select-speaker') {
          this._activeEntity = spk.entity;
          this._closeSpeakerMenu();
          this._updateAll();
          return;
        }
        dispatchAction(this._hass, this, action, spk.entity).catch(() => this._updateAll());
      });

      tile.addEventListener('tunet:group-toggle', (e) => {
        e.stopPropagation();
        this._callScript('sonos_toggle_group_membership', {
          target_speaker: spk.entity,
        });
      });

      tile.addEventListener('tunet:value-commit', (e) => {
        e.stopPropagation();
        const next = Number(e.detail?.value);
        if (!Number.isFinite(next)) return;
        this._callService('volume_set', {
          entity_id: spk.entity,
          volume_level: Math.max(0, Math.min(100, next)) / 100,
        });
      });

      $.spkMenu.appendChild(tile);
    }

    if (speakers.length > 1) {
      const divider = document.createElement('div');
      divider.className = 'dd-divider';
      $.spkMenu.appendChild(divider);

      const groupAllBtn = document.createElement('button');
      groupAllBtn.className = 'dd-option action';
      const gaIcon = document.createElement('span');
      gaIcon.className = 'icon';
      gaIcon.style.fontSize = '18px';
      gaIcon.textContent = 'link';
      groupAllBtn.appendChild(gaIcon);
      groupAllBtn.appendChild(document.createTextNode(' Group All'));
      groupAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._callScript('sonos_group_all_to_playing');
        this._closeSpeakerMenu();
      });
      $.spkMenu.appendChild(groupAllBtn);

      const ungroupBtn = document.createElement('button');
      ungroupBtn.className = 'dd-option action';
      const ugIcon = document.createElement('span');
      ugIcon.className = 'icon';
      ugIcon.style.fontSize = '18px';
      ugIcon.textContent = 'link_off';
      ungroupBtn.appendChild(ugIcon);
      ungroupBtn.appendChild(document.createTextNode(' Ungroup All'));
      ungroupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._callScript('sonos_ungroup_all');
        this._closeSpeakerMenu();
      });
      $.spkMenu.appendChild(ungroupBtn);
    }
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._volDragging || this._serviceCooldown) return;

    const coordId = this._coordinator;
    const coordEntity = this._hass.states[coordId];
    const activeEntity = this._hass.states[this._activeEntity];

    if (!coordEntity && !activeEntity) {
      $.card.dataset.state = 'unavailable';
      this._syncInfoTile(this._config.entity, 'unavailable', 'Unavailable');
      this._stopProgress();
      return;
    }

    const source = coordEntity || activeEntity;
    const state = source.state;
    const a = source.attributes;
    $.card.dataset.state = state;

    // Header subtitle
    const groupedCount = this._getGroupedCount();
    const subtitle = this._headerSubtitle(state, groupedCount, activeEntity);
    this._syncInfoTile(coordId || this._activeEntity || this._config.entity, state, subtitle);

    // TV badge
    if ($.tvBadge) {
      $.tvBadge.classList.toggle('visible', this._isTvMode);
    }

    // Track info from coordinator
    const isActive = state === 'playing' || state === 'paused';
    const title = a.media_title || (isActive ? 'Unknown' : 'Nothing playing');
    const artist = a.media_artist || (isActive ? '' : 'Select a source to play');
    $.trackName.textContent = title;
    $.trackName.style.color = isActive ? '' : 'var(--text-muted)';
    $.trackArtist.textContent = artist;

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

    // Progress bar visibility
    if ($.progressWrap) {
      $.progressWrap.style.display = this._config.show_progress ? '' : 'none';
    }

    // Duration from coordinator
    const duration = a.media_duration || 0;
    $.progDur.textContent = duration ? this._formatTime(duration) : '--';
    this._updateProgress();

    // Volume from active entity
    if (!this._volDragging && activeEntity) {
      const vol = Math.round((activeEntity.attributes.volume_level || 0) * 100);
      this._renderVolume(vol);

      const muted = activeEntity.attributes.is_volume_muted;
      const volIcon = muted ? 'volume_off' : vol < 40 ? 'volume_down' : 'volume_up';
      $.volMuteIcon.textContent = volIcon;
      $.volShowIcon.textContent = volIcon;
    }

    // Speaker label
    if ($.spkLabel) {
      const activeSpk = (this._cachedSpeakers || []).find(s => s.entity === this._activeEntity);
      $.spkLabel.textContent = activeSpk
        ? activeSpk.name
        : (activeEntity && activeEntity.attributes.friendly_name) || this._config.name;
    }

    // Progress timer management
    if (state === 'playing') this._startProgress();
    else this._stopProgress();
  }

  _renderVolume(pct) {
    const $ = this.$;
    $.volTrack.dataset.vol = pct;
    $.volFill.style.width = pct + '%';
    $.volStroke.style.left = pct + '%';
    $.volThumb.style.left = pct + '%';
    $.volPct.textContent = pct + '%';
  }

  _updateProgress() {
    const $ = this.$;
    const coordId = this._coordinator;
    const entity = this._hass && this._hass.states[coordId];
    if (!entity) return;

    const a = entity.attributes;
    const duration = a.media_duration || 0;
    const position = a.media_position || 0;
    const updatedAt = a.media_position_updated_at;
    const state = entity.state;

    if (!duration) {
      $.progCur.textContent = '--';
      $.progFill.style.width = '0%';
      return;
    }

    let currentPos = position;
    if (state === 'playing' && updatedAt) {
      const elapsed = (Date.now() - new Date(updatedAt).getTime()) / 1000;
      currentPos = Math.min(position + elapsed, duration);
    }

    $.progCur.textContent = this._formatTime(currentPos);
    $.progFill.style.width = (currentPos / duration * 100) + '%';
  }

  _startProgress() {
    if (this._progressInterval) return;
    this._progressInterval = setInterval(() => this._updateProgress(), 1000);
  }

  _stopProgress() {
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = null;
    }
  }

  _formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }
}

/* ===============================================================
   Registration
   =============================================================== */

registerCard('tunet-media-card', TunetMediaCard, {
  name: 'Tunet Media Card',
  description: 'Glassmorphism Sonos player with transport, volume, and speaker grouping',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-media-card',
});

logCardVersion('TUNET-MEDIA', CARD_VERSION, '#34C759');
