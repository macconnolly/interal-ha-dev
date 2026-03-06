/**
 * Tunet Rooms Card (v2 – ES Module)
 * Compact room grid with SmartThings-inspired square tiles
 * Glassmorphism design language
 * Version 2.6.0
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
  navigatePath,
  runCardAction,
  registerCard,
  logCardVersion,
} from './tunet_base.js';

const CARD_VERSION = '2.6.0';

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  lamp: 'table_lamp',
  floor_lamp: 'table_lamp',
  light_group: 'lightbulb',
};

function normalizeIcon(icon) {
  if (!icon) return 'lightbulb';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
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
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0 0.25em;
  }
  .section-title {
    font-size: 1.0625em; font-weight: 700; letter-spacing: -0.01em;
    color: var(--text);
  }
  .section-hdr-spacer { flex: 1; }
  .section-controls {
    display: inline-flex;
    align-items: center;
    gap: 0.38em;
  }
  .section-btn {
    min-height: 2em;
    padding: 0 0.56em;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: 0.64em;
    font-weight: 700;
    letter-spacing: 0.02em;
    display: inline-flex;
    align-items: center;
    gap: 0.22em;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .section-btn:hover { box-shadow: var(--shadow); }
  .section-btn:active { transform: scale(0.96); }
  .section-btn .icon { font-size: 1.05em; width: 1.05em; height: 1.05em; }
  .section-btn.all-on {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }
  .section-btn.all-off {
    color: var(--text-sub);
  }
  .section-btn.manual-reset {
    color: var(--red);
    border-color: rgba(239,68,68,0.32);
    background: rgba(239,68,68,0.12);
  }
  .section-btn[hidden] { display: none !important; }

  /* -- Room Grid -- */
  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7.2em, 1fr));
    gap: 0.6em;
  }

  .room-grid.row-mode {
    display: flex;
    flex-direction: column;
    gap: 0.52em;
  }

  /* -- Room Tile (aligned to lighting tile language) -- */
  .room-tile {
    min-height: 7.9em;
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 0.18em;
    padding: 0.7em 0.38em 1.1em;
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .room-tile:hover {
    box-shadow: var(--shadow-up);
  }
  .room-tile:active { transform: scale(0.95); }
  .room-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  /* Active (lights on) state */
  .room-tile.active {
    border-color: var(--amber-border);
    background: var(--tile-bg);
  }
  .room-tile.manual .room-tile-dot {
    background: var(--red);
    opacity: 1;
  }

  /* -- Icon wrap -- */
  .room-tile-icon {
    width: 2.35em; height: 2.35em;
    display: grid; place-items: center;
    border-radius: 50%;
    transition: all 0.18s;
    margin-top: 0.08em;
    margin-bottom: 0.2em;
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
    font-size: 1.3em; width: 1.3em; height: 1.3em;
  }

  /* -- Room name -- */
  .room-tile-name {
    font-size: 0.74em;
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
    font-size: 0.64em;
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
  .room-tile-status .manual-count {
    color: var(--red);
    font-weight: 700;
  }
  .room-tile-status .temp {
    font-variant-numeric: tabular-nums;
  }

  .room-progress-track {
    position: absolute;
    left: 0.78em;
    right: 0.78em;
    bottom: 0.52em;
    height: 0.26em;
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
  }
  .room-progress-fill {
    height: 100%;
    width: 0%;
    background: rgba(212,133,10,0.88);
    border-radius: var(--r-track);
    transition: width 0.15s ease;
  }
  :host(.dark) .room-progress-fill {
    background: rgba(251,191,36,0.88);
  }

  /* -- Row Variant (mockup parity mode) -- */
  .room-grid.row-mode .room-tile {
    min-height: auto;
    border-radius: calc(var(--r-tile) + 2px);
    padding: 0.62em 0.72em;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 0.6em;
  }
  .room-grid.row-mode .room-progress-track {
    display: none;
  }
  .room-row-main {
    display: inline-flex;
    align-items: center;
    gap: 0.56em;
    min-width: 0;
    flex: 1;
  }
  .room-row-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1em;
  }
  .room-grid.row-mode .room-tile-name,
  .room-grid.row-mode .room-tile-status {
    text-align: left;
  }
  .room-grid.row-mode .room-tile-icon {
    width: 2em;
    height: 2em;
    margin: 0;
    border-radius: 10px;
    flex: 0 0 auto;
  }
  .room-row-controls {
    display: inline-flex;
    align-items: center;
    gap: 0.38em;
    flex-shrink: 0;
  }
  .room-orbs {
    display: inline-flex;
    align-items: center;
    gap: 0.24em;
  }
  .room-orb {
    width: 1.82em;
    height: 1.82em;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--tile-bg-off);
    color: var(--text-muted);
    box-shadow: var(--ctrl-sh);
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all 0.16s ease;
  }
  .room-orb .icon {
    font-size: 1.02em;
    width: 1.02em;
    height: 1.02em;
  }
  .room-orb:hover {
    box-shadow: var(--shadow);
  }
  .room-orb:active {
    transform: scale(0.94);
  }
  .room-orb.on {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }
  .room-orb.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
  }
  .room-orb.manual {
    box-shadow: 0 0 0 1px rgba(239,68,68,0.42), 0 0 0 3px rgba(239,68,68,0.14);
  }
  .room-switch {
    width: 2.78em;
    height: 1.56em;
    border-radius: var(--r-pill);
    border: 1px solid transparent;
    background: var(--toggle-off);
    display: inline-flex;
    align-items: center;
    padding: 0.1em;
    cursor: pointer;
    transition: background 0.16s ease, border-color 0.16s ease;
  }
  .room-switch-knob {
    width: 1.3em;
    height: 1.3em;
    border-radius: var(--r-pill);
    background: var(--toggle-knob);
    box-shadow: 0 1px 2px rgba(0,0,0,0.18);
    transform: translateX(0);
    transition: transform 0.16s ease;
  }
  .room-switch.on {
    background: var(--toggle-on);
    border-color: rgba(52,199,89,0.28);
  }
  .room-switch.on .room-switch-knob {
    transform: translateX(1.2em);
  }

  /* -- Toggle indicator dot -- */
  .room-tile-dot {
    position: absolute;
    top: 0.46em; right: 0.46em;
    width: 0.42em; height: 0.42em;
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
      grid-template-columns: repeat(auto-fill, minmax(7.6em, 1fr));
    }
  }
  @media (max-width: 440px) {
    :host { font-size: 15px; }
    .section-controls { gap: 0.3em; }
    .section-btn {
      min-height: 1.9em;
      padding: 0 0.5em;
      font-size: 0.62em;
    }
    .room-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.4em;
    }
    .room-tile {
      min-height: 7.35em;
      padding: 0.62em 0.34em 0.98em;
    }
    .room-grid.row-mode .room-tile {
      padding: 0.56em 0.58em;
      gap: 0.5em;
    }
    .room-grid.row-mode .room-row-main {
      gap: 0.45em;
    }
    .room-grid.row-mode .room-orb {
      width: 1.64em;
      height: 1.64em;
      border-radius: 9px;
    }
    .room-grid.row-mode .room-switch {
      width: 2.55em;
      height: 1.46em;
    }
    .room-grid.row-mode .room-switch-knob {
      width: 1.2em;
      height: 1.2em;
    }
    .room-grid.row-mode .room-switch.on .room-switch-knob {
      transform: translateX(1.02em);
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
        <div class="section-hdr-spacer"></div>
        <div class="section-controls">
          <button type="button" class="section-btn manual-reset" id="manualResetBtn" hidden>
            <span class="icon">restart_alt</span><span>Reset</span>
          </button>
          <button type="button" class="section-btn all-off" id="allOffBtn">
            <span class="icon">power_settings_new</span><span>All Off</span>
          </button>
          <button type="button" class="section-btn all-on" id="allOnBtn">
            <span class="icon">lightbulb</span><span>All On</span>
          </button>
        </div>
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

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'layout_variant', selector: { select: { options: ['tiles', 'row'] } } },
        { name: 'rooms', selector: { object: {} } },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          layout_variant: 'Layout Variant',
          rooms: 'Rooms Config',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Rooms',
      layout_variant: 'tiles',
      rooms: [
        {
          name: 'Living Room',
          icon: 'weekend',
          hold_action: {
            action: 'fire-dom-event',
            browser_mod: {
              service: 'browser_mod.popup',
            },
          },
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
      layout_variant: config.layout_variant === 'row' ? 'row' : 'tiles',
      rooms: config.rooms.map((room) => ({
        name: room.name || 'Room',
        icon: normalizeIcon(room.icon || 'home'),
        temperature_entity: room.temperature_entity || '',
        navigate_path: room.navigate_path || '',
        tap_action: room.tap_action || null,
        hold_action: room.hold_action || null,
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
    // Watch AL switches for manual_control changes
    for (const key of Object.keys(n.states)) {
      if (key.startsWith('switch.adaptive_lighting_') && o.states[key] !== n.states[key]) return true;
    }
    return false;
  }

  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    if (this._config.layout_variant === 'row') {
      return Math.max(2, roomCount + 1);
    }
    const rows = Math.ceil(roomCount / 4);
    return Math.max(2, rows + 1);
  }

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 'full',
      min_columns: 6,
    };
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
      allOnBtn: this.shadowRoot.getElementById('allOnBtn'),
      allOffBtn: this.shadowRoot.getElementById('allOffBtn'),
      manualResetBtn: this.shadowRoot.getElementById('manualResetBtn'),
    };

    this.$.allOnBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._setAllLights('turn_on');
    });
    this.$.allOffBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._setAllLights('turn_off');
    });
    this.$.manualResetBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._resetManualControl();
    });
  }

  _buildTiles() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const grid = this.$.roomGrid;
    grid.innerHTML = '';
    this._tileRefs = [];
    const isRowVariant = this._config.layout_variant === 'row';
    grid.classList.toggle('row-mode', isRowVariant);

    this._config.rooms.forEach((roomCfg, i) => {
      const tile = document.createElement('div');
      tile.className = 'room-tile';
      if (isRowVariant) tile.classList.add('room-row');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', roomCfg.name);

      if (isRowVariant) {
        const orbs = (roomCfg.lights || []).map((light, idx) => `
          <button type="button"
                  class="room-orb"
                  data-entity="${light.entity || ''}"
                  aria-label="Toggle ${light.name || `Light ${idx + 1}`}">
            <span class="icon">${normalizeIcon(light.icon || 'lightbulb')}</span>
          </button>
        `).join('');
        tile.innerHTML = `
          <div class="room-tile-dot"></div>
          <div class="room-row-main">
            <div class="room-tile-icon">
              <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
            </div>
            <div class="room-row-info">
              <span class="room-tile-name">${roomCfg.name}</span>
              <span class="room-tile-status" id="room-status-${i}">--</span>
            </div>
          </div>
          <div class="room-row-controls">
            <div class="room-orbs" id="room-orbs-${i}">${orbs}</div>
            <button type="button" class="room-switch" id="room-switch-${i}" aria-label="Toggle ${roomCfg.name}" aria-pressed="false">
              <span class="room-switch-knob"></span>
            </button>
          </div>
          <div class="room-progress-track">
            <div class="room-progress-fill" id="room-fill-${i}"></div>
          </div>
        `;
      } else {
        tile.innerHTML = `
          <div class="room-tile-dot"></div>
          <div class="room-tile-icon">
            <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
          </div>
          <span class="room-tile-name">${roomCfg.name}</span>
          <span class="room-tile-status" id="room-status-${i}">--</span>
          <div class="room-progress-track">
            <div class="room-progress-fill" id="room-fill-${i}"></div>
          </div>
        `;
      }

      const statusEl = tile.querySelector(`#room-status-${i}`);
      const fillEl = tile.querySelector(`#room-fill-${i}`);
      const switchEl = isRowVariant ? tile.querySelector(`#room-switch-${i}`) : null;
      const orbRefs = isRowVariant
        ? [...tile.querySelectorAll('.room-orb')]
            .map((el) => ({ el, entity: String(el.dataset.entity || '') }))
            .filter((ref) => !!ref.entity)
        : [];

      if (switchEl) {
        const stopBubble = (e) => e.stopPropagation();
        switchEl.addEventListener('pointerdown', stopBubble);
        switchEl.addEventListener('pointerup', stopBubble);
        switchEl.addEventListener('pointercancel', stopBubble);
        switchEl.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleRoomGroup(roomCfg);
        });
      }

      for (const orbRef of orbRefs) {
        const stopBubble = (e) => e.stopPropagation();
        orbRef.el.addEventListener('pointerdown', stopBubble);
        orbRef.el.addEventListener('pointerup', stopBubble);
        orbRef.el.addEventListener('pointercancel', stopBubble);
        orbRef.el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleSingleLight(orbRef.entity);
        });
      }

      // Tap → toggle all room lights (or custom tap action)
      // Long press → configured hold action (typically popup)
      let pressTimer = null;
      let didLongPress = false;

      const onPointerDown = () => {
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          if (roomCfg.hold_action) {
            this._handleRoomAction(roomCfg.hold_action, roomCfg);
          } else if (roomCfg.navigate_path) {
            navigatePath(roomCfg.navigate_path);
          }

          // Brief haptic feedback via scale.
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);
      };

      const onPointerUp = () => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        // Short tap → configured action, otherwise toggle room lights.
        if (roomCfg.tap_action) {
          this._handleRoomAction(roomCfg.tap_action, roomCfg);
        } else if ((roomCfg.lights || []).length) {
          this._toggleRoomGroup(roomCfg);
        } else if (roomCfg.temperature_entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: roomCfg.temperature_entity },
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
        fillEl,
        switchEl,
        orbRefs,
      });
    });
  }

  _toggleSingleLight(entityId) {
    if (!this._hass || !entityId) return;
    const entity = this._hass.states[entityId];
    const service = entity && entity.state === 'on' ? 'turn_off' : 'turn_on';
    const result = this._hass.callService('light', service, { entity_id: entityId });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
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

  _allRoomLightIds() {
    const ids = new Set();
    for (const room of this._config.rooms || []) {
      for (const light of room.lights || []) {
        if (light.entity) ids.add(light.entity);
      }
    }
    return Array.from(ids);
  }

  _setAllLights(service) {
    if (!this._hass) return;
    const entityIds = this._allRoomLightIds();
    if (!entityIds.length) return;
    this._hass.callService('light', service, { entity_id: entityIds });
  }

  _resolveAdaptiveEntitiesForRooms() {
    if (!this._hass) return [];
    const zoneSet = new Set(this._allRoomLightIds());
    const candidates = [];
    for (const key of Object.keys(this._hass.states)) {
      if (!key.startsWith('switch.adaptive_lighting_')) continue;
      const sw = this._hass.states[key];
      const lights = sw?.attributes?.lights;
      if (Array.isArray(lights) && lights.some((eid) => zoneSet.has(eid))) {
        candidates.push(key);
      }
    }
    if (candidates.length) return Array.from(new Set(candidates));
    return Object.keys(this._hass.states).filter((k) => k.startsWith('switch.adaptive_lighting_'));
  }

  _getManualLights(adaptiveEntities) {
    const deduped = new Set();
    for (const entityId of adaptiveEntities) {
      const sw = this._hass.states[entityId];
      const manual = sw?.attributes?.manual_control;
      if (!Array.isArray(manual)) continue;
      for (const lightId of manual) deduped.add(lightId);
    }
    return deduped;
  }

  _resetManualControl() {
    if (!this._hass) return;
    const roomLights = new Set(this._allRoomLightIds());
    const adaptiveEntities = this._resolveAdaptiveEntitiesForRooms()
      .filter((entityId) => entityId.startsWith('switch.adaptive_lighting_'));
    if (!adaptiveEntities.length) return;

    const manualScoped = Array.from(this._getManualLights(adaptiveEntities))
      .filter((lightId) => roomLights.has(lightId));
    if (!manualScoped.length) return;

    this._hass.callService('adaptive_lighting', 'set_manual_control', {
      entity_id: adaptiveEntities,
      manual_control: false,
      lights: manualScoped,
    });
  }

  _handleRoomAction(actionConfig, roomCfg) {
    if (!actionConfig || !this._hass) return;
    const defaultEntityId = roomCfg?.lights?.[0]?.entity || roomCfg?.temperature_entity || '';
    runCardAction({
      element: this,
      hass: this._hass,
      actionConfig,
      defaultEntityId,
    });
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    const adaptiveEntities = this._resolveAdaptiveEntitiesForRooms();
    const manualSet = this._getManualLights(adaptiveEntities);
    const allRoomLights = new Set(this._allRoomLightIds());
    const manualScopedCount = Array.from(manualSet).filter((eid) => allRoomLights.has(eid)).length;
    if (this.$.manualResetBtn) {
      this.$.manualResetBtn.hidden = manualScopedCount === 0;
    }

    for (const ref of this._tileRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;
      let brightnessTotal = 0;

      for (const light of lights) {
        if (!light.entity) continue;
        const entity = this._hass.states[light.entity];
        if (!entity || entity.state === 'unavailable') continue;
        if (entity.state === 'on') {
          onCount++;
          const raw = Number(entity.attributes?.brightness);
          const pct = Number.isFinite(raw)
            ? Math.max(0, Math.min(100, Math.round((raw / 255) * 100)))
            : 100;
          brightnessTotal += pct;
        }
      }

      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);
      if (ref.switchEl) {
        ref.switchEl.classList.toggle('on', anyOn);
        ref.switchEl.setAttribute('aria-pressed', anyOn ? 'true' : 'false');
      }
      if (ref.fillEl) {
        const pct = onCount > 0 ? Math.round(brightnessTotal / onCount) : 0;
        ref.fillEl.style.width = `${pct}%`;
      }
      for (const orbRef of (ref.orbRefs || [])) {
        const entity = this._hass.states[orbRef.entity];
        const orbOn = !!(entity && entity.state === 'on');
        const orbManual = manualSet.has(orbRef.entity);
        orbRef.el.classList.toggle('on', orbOn);
        orbRef.el.classList.toggle('off', !orbOn);
        orbRef.el.classList.toggle('manual', orbManual);
      }

      // Build status text
      let parts = [];
      const avgBrt = onCount > 0 ? Math.round(brightnessTotal / onCount) : 0;
      if (anyOn) {
        if (onCount === lights.length) {
          parts.push(`<span class="on-count">On</span>`);
        } else {
          parts.push(`<span class="on-count">${onCount}/${lights.length}</span>`);
        }
        parts.push(`${avgBrt}%`);
      } else if (lights.length > 0) {
        parts.push('Off');
      }

      // Manual control detection per room
      let manualCount = 0;
      for (const light of lights) {
        if (!light.entity) continue;
        if (manualSet.has(light.entity)) manualCount++;
      }
      if (manualCount > 0) {
        parts.push(`<span class="manual-count">${manualCount} manual</span>`);
      }
      ref.el.classList.toggle('manual', manualCount > 0);

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
