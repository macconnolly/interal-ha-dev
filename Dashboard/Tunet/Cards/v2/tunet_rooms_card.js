/**
 * Tunet Rooms Card (v2 – ES Module)
 * Compact room grid with SmartThings-inspired square tiles
 * Glassmorphism design language
 * Version 2.3.0
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  SECTION_SURFACE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js';

const CARD_VERSION = '2.3.0';

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'lamp',
  table_lamp: 'lamp',
  light_group: 'lightbulb',
};

const ROOM_ICON_FALLBACKS = new Set([
  'home', 'weekend', 'kitchen', 'restaurant', 'bed', 'desk', 'desktop_windows',
  'lightbulb', 'light', 'lamp', 'highlight', 'view_column', 'nightlight', 'shelves',
  'chevron_right',
]);

function normalizeIcon(icon) {
  if (!icon) return 'lightbulb';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
  if (ROOM_ICON_FALLBACKS.has(resolved)) return resolved;
  return resolved;
}

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    display: block;
    font-size: 16px; /* em anchor */
  }
  .section-container {
    position: relative;
    gap: 1em;
    width: 100%;
    box-shadow: var(--section-shadow), var(--inset);
  }

  /* Section glass stroke */
  .section-container::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-section); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40), rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* -- Section Header -- */
  .section-hdr {
    display: flex; align-items: center; padding: 0 0.25em;
  }
  .section-title {
    font-size: 1.0625em; font-weight: 700; letter-spacing: -0.01em;
    color: var(--text);
  }

  /* -- Room Grid -- */
  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4.5em, 1fr));
    gap: 0.5em;
  }

  /* -- Room Tile (compact square) -- */
  .room-tile {
    aspect-ratio: 1;
    border-radius: 0.875em;
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0.5px 1.5px rgba(0,0,0,0.06), var(--inset);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.2em;
    padding: 0.5em 0.25em;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Glass stroke */
  .room-tile::before {
    content: ""; position: absolute; inset: 0;
    border-radius: 0.875em; padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .room-tile::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

  .room-tile:hover {
    box-shadow: 0 6px 20px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06), var(--inset);
  }
  .room-tile:active { transform: scale(0.95); }
  .room-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  /* Active (lights on) state */
  .room-tile.active {
    border-color: var(--amber-border);
    background: linear-gradient(135deg, var(--amber-fill), var(--glass));
  }

  /* -- Icon wrap -- */
  .room-tile-icon {
    width: 2em; height: 2em;
    display: grid; place-items: center;
    border-radius: 0.625em;
    transition: all 0.18s;
  }
  .room-tile:not(.active) .room-tile-icon {
    background: var(--gray-ghost);
    color: var(--text-muted);
  }
  .room-tile.active .room-tile-icon {
    background: var(--amber-fill);
    color: var(--amber);
    border: 1px solid var(--amber-border);
  }
  .room-tile.active .room-tile-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .room-tile-icon .icon {
    font-size: 1.25em; width: 1.25em; height: 1.25em;
  }

  /* -- Room name -- */
  .room-tile-name {
    font-size: 0.625em;
    font-weight: 600;
    color: var(--text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.2;
  }

  /* -- Status line (lights count + temp) -- */
  .room-tile-status {
    font-size: 0.5em;
    font-weight: 600;
    color: var(--text-muted);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    line-height: 1.1;
  }
  .room-tile-status .on-count {
    color: var(--amber);
    font-weight: 700;
  }
  .room-tile-status .temp {
    font-variant-numeric: tabular-nums;
  }

  /* -- Toggle indicator dot -- */
  .room-tile-dot {
    position: absolute;
    top: 0.375em; right: 0.375em;
    width: 0.375em; height: 0.375em;
    border-radius: var(--r-pill);
    background: var(--amber);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .room-tile.active .room-tile-dot {
    opacity: 1;
  }

  /* -- Responsive -- */
  @media (min-width: 500px) {
    .room-grid {
      grid-template-columns: repeat(auto-fill, minmax(5em, 1fr));
    }
  }
  @media (max-width: 440px) {
    :host { font-size: 15px; }
    .room-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.4em;
    }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_ROOMS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${SECTION_SURFACE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;

// ═══════════════════════════════════════════════════════════
// HTML Template
// ═══════════════════════════════════════════════════════════

const ROOMS_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">Rooms</span>
      </div>
      <div class="room-grid" id="roomGrid"></div>
    </div>
  </div>
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetRoomsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._tileRefs = [];
    this._longPressTimer = null;
    injectFonts();
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'rooms', selector: { object: {} } },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          rooms: 'Rooms Config',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Rooms',
      rooms: [
        {
          name: 'Living Room',
          icon: 'weekend',
          lights: [
            { entity: 'light.living_room', icon: 'lightbulb', name: 'Main' },
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config.rooms || !Array.isArray(config.rooms) || config.rooms.length === 0) {
      throw new Error('Please define at least one room');
    }
    this._config = {
      name: config.name || 'Rooms',
      rooms: config.rooms.map((room) => ({
        name: room.name || 'Room',
        icon: normalizeIcon(room.icon || 'home'),
        temperature_entity: room.temperature_entity || '',
        navigate_path: room.navigate_path || '',
        lights: (room.lights || []).map((light) => ({
          entity: light.entity || '',
          icon: normalizeIcon(light.icon || 'lightbulb'),
          name: light.name || '',
        })),
      })),
    };
    if (this._rendered) {
      this._buildTiles();
      this._updateAll();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildTiles();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    if (!oldHass || this._entitiesChanged(oldHass, hass)) this._updateAll();
  }

  _entitiesChanged(o, n) {
    for (const room of this._config.rooms) {
      for (const light of (room.lights || [])) {
        if (light.entity && o.states[light.entity] !== n.states[light.entity]) return true;
      }
      if (room.temperature_entity && o.states[room.temperature_entity] !== n.states[room.temperature_entity]) return true;
    }
    return false;
  }

  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    // Assume ~4 cols; each row of tiles is ~1 card unit
    const rows = Math.ceil(roomCount / 4);
    return Math.max(2, rows + 1);
  }

  connectedCallback() {}
  disconnectedCallback() {
    clearTimeout(this._longPressTimer);
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOMS_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomGrid: this.shadowRoot.getElementById('roomGrid'),
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
    };
  }

  _buildTiles() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const grid = this.$.roomGrid;
    grid.innerHTML = '';
    this._tileRefs = [];

    this._config.rooms.forEach((roomCfg, i) => {
      const tile = document.createElement('div');
      tile.className = 'room-tile';
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', roomCfg.name);

      tile.innerHTML = `
        <div class="room-tile-dot"></div>
        <div class="room-tile-icon">
          <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
        </div>
        <span class="room-tile-name">${roomCfg.name}</span>
        <span class="room-tile-status" id="room-status-${i}">--</span>
      `;

      const statusEl = tile.querySelector(`#room-status-${i}`);

      // Tap → navigate; long press → toggle all lights
      let pressStart = 0;
      let pressTimer = null;
      let didLongPress = false;

      const onPointerDown = (e) => {
        pressStart = Date.now();
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          this._toggleRoomGroup(roomCfg);
          // Brief haptic feedback via scale
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);
      };

      const onPointerUp = (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        // Short tap → navigate
        if (roomCfg.navigate_path) {
          history.pushState(null, '', roomCfg.navigate_path);
          window.dispatchEvent(new Event('location-changed'));
        } else if (roomCfg.lights.length && roomCfg.lights[0].entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: roomCfg.lights[0].entity },
          }));
        }
      };

      const onPointerCancel = () => {
        clearTimeout(pressTimer);
        didLongPress = false;
      };

      tile.addEventListener('pointerdown', onPointerDown);
      tile.addEventListener('pointerup', onPointerUp);
      tile.addEventListener('pointercancel', onPointerCancel);
      tile.addEventListener('pointerleave', onPointerCancel);

      // Keyboard
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPointerUp(e);
        }
      });

      // Prevent context menu on long press
      tile.addEventListener('contextmenu', (e) => e.preventDefault());

      grid.appendChild(tile);
      this._tileRefs.push({
        el: tile,
        cfg: roomCfg,
        statusEl,
      });
    });
  }

  _toggleRoomGroup(roomCfg) {
    if (!this._hass) return;
    const entityIds = (roomCfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entityIds.length) return;

    let anyOn = false;
    for (const eid of entityIds) {
      const state = this._hass.states[eid];
      if (state && state.state === 'on') { anyOn = true; break; }
    }

    const service = anyOn ? 'turn_off' : 'turn_on';
    const result = this._hass.callService('light', service, { entity_id: entityIds });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    for (const ref of this._tileRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;

      for (const light of lights) {
        if (!light.entity) continue;
        const entity = this._hass.states[light.entity];
        if (entity && entity.state === 'on') onCount++;
      }

      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);

      // Build status text
      let parts = [];
      if (anyOn) {
        if (onCount === lights.length) {
          parts.push(`<span class="on-count">On</span>`);
        } else {
          parts.push(`<span class="on-count">${onCount}/${lights.length}</span>`);
        }
      } else if (lights.length > 0) {
        parts.push('Off');
      }

      // Temperature
      if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state && tempEntity.state !== 'unavailable') {
          const unit = tempEntity.attributes.unit_of_measurement || '°F';
          parts.push(`<span class="temp">${Math.round(Number(tempEntity.state))}${unit}</span>`);
        }
      }

      ref.statusEl.innerHTML = parts.join(' · ');
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-rooms-card', TunetRoomsCard, {
  name: 'Tunet Rooms Card',
  description: 'Compact room grid with glassmorphism tile design',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-rooms-card',
});

logCardVersion('TUNET-ROOMS', CARD_VERSION, '#D4850A');
