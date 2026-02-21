/**
 * Tunet Speaker Grid Card (v2 – ES Module)
 * Sonos speaker grid with per-speaker volume control and group management.
 *
 * v3.2.0 – Composer migration to tunet-speaker-tile primitive.
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CARD_SURFACE,
  CARD_SURFACE_GLASS_STROKE,
  INFO_TILE_PATTERN,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js';
import { dispatchAction } from './tunet_runtime.js';
import './tunet_speaker_tile.js';

const CARD_VERSION = '3.2.0';

const CARD_OVERRIDES = `
  :host {
    --accent: #4682B4;
    --accent-fill: rgba(70,130,180,0.10);
    --accent-border: rgba(70,130,180,0.22);
    --accent-glow: rgba(70,130,180,0.45);
    --divider: rgba(28,28,30,0.07);
    display: block;
  }

  :host(.dark) {
    --accent: #6BA3C7;
    --accent-fill: rgba(107,163,199,0.14);
    --accent-border: rgba(107,163,199,0.28);
    --accent-glow: rgba(107,163,199,0.50);
    --divider: rgba(255,255,255,0.06);
  }

  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition:
      background var(--motion-surface) var(--ease-standard),
      border-color var(--motion-surface) var(--ease-standard),
      box-shadow var(--motion-surface) var(--ease-standard),
      opacity var(--motion-surface) var(--ease-standard);
  }
`;

const CARD_STYLES = `
  .entity-icon .icon {
    font-size: 18px;
    --ms-opsz: 20;
  }

  .spk-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
    gap: 10px;
    width: 100%;
    min-width: 0;
  }

  .spk-grid tunet-speaker-tile {
    display: block;
    min-width: 0;

    /* Map speaker-tile grouping language onto card accent */
    --green: var(--accent);
    --green-fill: var(--accent-fill);
    --green-border: var(--accent-border);
  }

  :host([tile-size="compact"]) .spk-grid tunet-speaker-tile {
    --spk-min-height: 56px;
    --spk-padding: 8px 10px 12px 8px;
    --spk-gap: 8px;
    --spk-icon-size: 36px;
    --spk-icon-radius: 10px;
    --spk-name-size: 12px;
    --spk-meta-size: 10px;
    --spk-volume-size: 13px;
  }

  :host([tile-size="large"]) .spk-grid tunet-speaker-tile {
    --spk-min-height: 68px;
    --spk-padding: 12px 14px 16px 12px;
    --spk-gap: 10px;
    --spk-icon-size: 44px;
    --spk-icon-radius: 14px;
    --spk-name-size: 14px;
    --spk-meta-size: 12px;
    --spk-volume-size: 15px;
  }

  .grid-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--divider);
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-sub);
    cursor: pointer;
    transition:
      background var(--motion-fast) var(--ease-standard),
      color var(--motion-fast) var(--ease-standard),
      transform var(--motion-fast) var(--ease-emphasized);
    user-select: none;
  }

  .action-btn:hover {
    background: var(--track-bg);
    color: var(--text);
  }

  .action-btn:active {
    transform: scale(.97);
  }

  .action-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  .action-btn .icon {
    color: var(--accent);
    font-size: 18px;
    --ms-opsz: 20;
  }

  @media (max-width: 440px) {
    .card {
      padding: 16px;
      --r-card: 20px;
    }

    .spk-grid {
      grid-template-columns: repeat(var(--cols-sm, 2), minmax(0, 1fr));
      gap: 8px;
    }
  }
`;

const TUNET_SPEAKER_GRID_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${INFO_TILE_PATTERN}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

const TUNET_SPEAKER_GRID_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card">

      <div class="grid-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">Loading...</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
      </div>

      <div class="spk-grid" id="spkGrid"></div>

      <div class="grid-actions" id="gridActions" style="display:none">
        <button class="action-btn" id="groupAllBtn" aria-label="Group all speakers">
          <span class="icon">link</span> Group All
        </button>
        <button class="action-btn" id="ungroupBtn" aria-label="Ungroup all speakers">
          <span class="icon">link_off</span> Ungroup All
        </button>
      </div>

    </div>
  </div>
`;

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
    this._tileRefs = new Map();

    injectFonts();
  }

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
          name: 'coordinator_sensor',
          selector: { entity: { filter: [{ domain: 'sensor' }] } },
        },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns', selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
            { name: 'tile_size', selector: { select: { options: ['standard', 'compact', 'large'] } } },
          ],
        },
        { name: 'show_group_actions', selector: { boolean: {} } },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => ({
        entity: 'Media Player Entity',
        name: 'Card Name',
        coordinator_sensor: 'Coordinator Sensor',
        columns: 'Grid Columns',
        tile_size: 'Tile Size',
        show_group_actions: 'Show Group/Ungroup Buttons',
        custom_css: 'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .spk-grid and tunet-speaker-tile selectors.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Speakers',
      coordinator_sensor: 'sensor.sonos_smart_coordinator',
      columns: 4,
      tile_size: 'standard',
      show_group_actions: true,
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a media_player entity');
    }

    const asFinite = (v, fb) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : fb;
    };
    const columns = Math.max(2, Math.min(8, Math.round(asFinite(config.columns, 4))));
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact'
      ? 'compact'
      : (tileSizeRaw === 'large' ? 'large' : 'standard');

    this._config = {
      entity: config.entity,
      name: config.name || 'Speakers',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      columns,
      tile_size: tileSize,
      show_group_actions: config.show_group_actions !== false,
      custom_css: config.custom_css || '',
    };

    this.setAttribute('tile-size', tileSize);

    this._cachedSpeakers = null;
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
      this._setupListeners();
      this._rendered = true;
      this._buildGrid();
    }

    applyDarkClass(this, detectDarkMode(hass));

    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildGrid();
    }

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
    const speakers = this._cachedSpeakers || this._config.speakers || [];
    const cols = this._config.columns || 4;
    const rows = Math.max(1, Math.ceil(speakers.length / cols));
    return 1 + rows;
  }

  connectedCallback() {}

  disconnectedCallback() {
    clearTimeout(this._cooldownTimer);
  }

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

  _setServiceCooldown(ms = 1500) {
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._serviceCooldown = false;
    }, ms);
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];

    const speakers = [];
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_playing_group$/);
      if (!match) continue;

      const room = match[1];
      const playerEntity = `media_player.${room}`;
      const playerState = this._hass.states[playerEntity];
      if (!playerState) continue;

      speakers.push({
        entity: playerEntity,
        name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
        icon: 'speaker',
      });
    }

    return speakers;
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SPEAKER_GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SPEAKER_GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {};
    const ids = ['card', 'infoTile', 'cardTitle', 'hdrSub', 'spkGrid', 'gridActions', 'groupAllBtn', 'ungroupBtn'];
    for (const id of ids) {
      this.$[id] = this.shadowRoot.getElementById(id);
    }
  }

  _setupListeners() {
    const $ = this.$;

    $.infoTile.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId: this._config.entity },
      }));
    });

    $.groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_group_all_to_playing');
    });

    $.ungroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_ungroup_all');
    });
  }

  _bindTileEvents(tile, speakerEntity) {
    tile.addEventListener('tunet:action', (e) => {
      e.stopPropagation();
      const action = e.detail?.action || null;
      if (!action) return;
      dispatchAction(this._hass, this, action, speakerEntity).catch(() => this._updateAll());
    });

    tile.addEventListener('tunet:group-toggle', (e) => {
      e.stopPropagation();
      this._callScript('sonos_toggle_group_membership', {
        target_speaker: speakerEntity,
      });
    });

    tile.addEventListener('tunet:value-commit', (e) => {
      e.stopPropagation();
      const next = Number(e.detail?.value);
      if (!Number.isFinite(next)) return;

      this._callService('media_player', 'volume_set', {
        entity_id: speakerEntity,
        volume_level: Math.max(0, Math.min(100, Math.round(next))) / 100,
      });
      this._setServiceCooldown();
    });
  }

  _baseTileConfig(spk) {
    return {
      entity: spk.entity,
      name: spk.name || spk.entity,
      icon: spk.icon || 'speaker',
      show_volume: true,
      show_group_dot: true,
      allow_group_toggle: true,
      hold_ms: 500,
      tap_action: {
        action: 'call-service',
        service: 'script.sonos_toggle_group_membership',
        data: { target_speaker: spk.entity },
      },
      hold_action: {
        action: 'more-info',
        entity_id: spk.entity,
      },
    };
  }

  _buildGrid() {
    const grid = this.$.spkGrid;
    if (!grid) return;

    grid.innerHTML = '';
    this._tileRefs.clear();

    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    const speakers = this._cachedSpeakers || [];
    const cols = this._config.columns;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cols-sm', Math.min(2, cols));

    for (const spk of speakers) {
      const tile = document.createElement('tunet-speaker-tile');
      tile.dataset.entity = spk.entity;
      tile.setConfig({
        ...this._baseTileConfig(spk),
        state: 'idle',
        in_group: false,
        selected: false,
        volume: 0,
        meta: 'Not grouped',
      });
      tile.hass = this._hass;

      this._bindTileEvents(tile, spk.entity);

      grid.appendChild(tile);
      this._tileRefs.set(spk.entity, tile);
    }

    if (this.$.gridActions) {
      this.$.gridActions.style.display =
        (this._config.show_group_actions && speakers.length > 1) ? '' : 'none';
    }
  }

  _metaForSpeaker(inGroup, playerState, isPaused) {
    if (!inGroup) return 'Not grouped';
    if (!playerState) return 'Grouped';
    if (isPaused) return 'Paused';

    const title = playerState.attributes.media_title || '';
    const artist = playerState.attributes.media_artist || '';
    if (title) return artist ? `${title} - ${artist}` : title;

    return playerState.state === 'playing' ? 'Playing' : 'Idle';
  }

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._serviceCooldown) return;

    const speakers = this._cachedSpeakers || [];
    $.cardTitle.textContent = this._config.name;

    let groupedCount = 0;
    for (const spk of speakers) {
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      if (bs && bs.state === 'on') groupedCount++;
    }
    $.hdrSub.textContent = `${speakers.length} speakers - ${groupedCount} grouped`;

    for (const spk of speakers) {
      const tile = this._tileRefs.get(spk.entity);
      if (!tile) continue;

      const playerState = this._hass.states[spk.entity];
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      const inGroup = bs && bs.state === 'on';
      const speakerState = playerState ? playerState.state : 'idle';
      const isPaused = speakerState === 'paused';
      const volume = playerState
        ? Math.round((playerState.attributes.volume_level || 0) * 100)
        : 0;

      tile.setConfig({
        ...this._baseTileConfig(spk),
        state: isPaused ? 'paused' : (inGroup ? 'playing' : 'idle'),
        in_group: inGroup,
        selected: false,
        volume,
        meta: this._metaForSpeaker(inGroup, playerState, isPaused),
      });
      tile.hass = this._hass;
    }
  }
}

registerCard('tunet-speaker-grid-card', TunetSpeakerGridCard, {
  name: 'Tunet Speaker Grid Card',
  description: 'Sonos speaker grid composer built from tunet-speaker-tile primitives',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-speaker-grid-card',
});

logCardVersion('TUNET-SPEAKER-GRID', CARD_VERSION, '#4682B4');
