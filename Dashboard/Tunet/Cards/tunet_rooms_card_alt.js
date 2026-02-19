/**
 * Tunet Rooms Card
 * Custom Home Assistant card with glassmorphism design
 * Room overview capsules with per-room light group orbs and toggles
 * Version 1.0.0
 */

const ROOMS_CARD_VERSION = '2.0.0';

/* ===============================================================
   CSS
   =============================================================== */

const ROOMS_STYLES = `
  :host {
    --glass: rgba(255,255,255,0.68);
    --glass-border: rgba(255,255,255,0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0,0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30,0.55);
    --text-muted: #8E8E93;
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10,0.10);
    --amber-border: rgba(212,133,10,0.22);
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.10);
    --track-bg: rgba(28,28,30,0.055);
    --gray-ghost: rgba(28,28,30,0.04);
    --r-card: 24px;
    --r-section: 38px;
    --r-tile: 16px;
    --parent-bg: rgba(255,255,255,0.35);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --ctrl-border: rgba(0,0,0,0.05);
    display: block;
  }
  :host(.dark) {
    --glass: rgba(44,44,46,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #E8961E;
    --amber-fill: rgba(232,150,30,0.14);
    --amber-border: rgba(232,150,30,0.25);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --parent-bg: rgba(255,255,255,0.05);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.25);
    --track-bg: rgba(255,255,255,0.06);
    --gray-ghost: rgba(255,255,255,0.04);
    --ctrl-border: rgba(255,255,255,0.08);
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

  /* -- Section Container (outer frosted shell) -- */
  .section-container {
    position: relative;
    background: var(--parent-bg);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: var(--r-section);
    border: 1px solid rgba(255,255,255,0.08);
    padding: 20px;
    box-shadow: var(--shadow-section);
    display: flex; flex-direction: column; gap: 16px;
    width: 100%;
  }
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

  /* -- Section Header -- */
  .section-hdr {
    display: flex; align-items: center; padding: 0 4px;
  }
  .section-title {
    font-size: 17px; font-weight: 700; letter-spacing: -0.2px;
    color: var(--text);
  }
  .section-spacer { flex: 1; }
  .section-action {
    font-size: 13px; font-weight: 600; color: var(--text-muted);
    cursor: pointer; transition: color 0.15s;
    background: none; border: none; font-family: inherit;
    display: flex; align-items: center; gap: 2px;
  }
  .section-action:hover { color: var(--text-sub); }

  /* -- Room List -- */
  .room-list { display: flex; flex-direction: column; gap: 10px; }

  /* -- Room Capsule -- */
  .room-card {
    min-height: 72px; border-radius: var(--r-card);
    background: var(--glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    display: flex; align-items: center; padding: 0 14px; gap: 12px;
    cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden;
  }
  .room-card::before {
    content: ""; position: absolute; inset: 0; border-radius: var(--r-card); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg, rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%, rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .room-card::before {
    background: linear-gradient(160deg, rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%, rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }
  .room-card:hover { box-shadow: var(--shadow-up), var(--inset); }
  .room-card.active { border-color: var(--amber-border); }

  .room-icon {
    width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
    flex-shrink: 0; transition: all 0.2s; border: 1px solid transparent;
  }
  .room-card:not(.active) .room-icon { background: var(--gray-ghost); color: var(--text-muted); }
  .room-card.active .room-icon { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-card.active .room-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .room-info { flex: 1; min-width: 0; }
  .room-name { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .room-status {
    font-size: 11.5px; font-weight: 600; color: var(--text-muted); line-height: 1.2; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-status .amber-txt { color: var(--amber); }

  .room-controls { display: flex; align-items: center; gap: 6px; }

  /* -- Light Group Orbs -- */
  .room-orb {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
    flex-shrink: 0; cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    background: var(--gray-ghost); color: var(--text-muted);
  }
  .room-orb:hover { background: var(--track-bg); }
  .room-orb:active { transform: scale(0.92); }
  .room-orb.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-orb.on .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .room-chevron { color: var(--text-muted); flex-shrink: 0; cursor: pointer; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  @media (max-width: 440px) {
    .room-card { padding: 0 10px; min-height: 66px; gap: 10px; }
    .room-icon { width: 38px; height: 38px; }
    .room-orb { width: 30px; height: 30px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const ROOMS_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">Rooms</span>
        <div class="section-spacer"></div>
      </div>
      <div class="room-list" id="roomList"></div>
    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetRoomsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._serviceCooldown = {};
    TunetRoomsCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetRoomsCard._fontsInjected) return;
    TunetRoomsCard._fontsInjected = true;
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
   * Config: rooms is an array of room objects:
   * {
   *   name: 'Living Room',
   *   icon: 'weekend',
   *   lights: [
   *     { entity: 'light.spots', icon: 'highlight', name: 'Spots' },
   *     { entity: 'light.ceiling', icon: 'light', name: 'Ceiling' },
   *     { entity: 'light.lamp', icon: 'table_lamp', name: 'Lamp' },
   *   ],
   *   temperature_entity: 'sensor.living_room_temp',
   *   navigate_path: '/lovelace/living-room',
   * }
   */

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        /*
         * Rooms are configured via YAML as an array.
         * Each room has: name, icon, lights (array of {entity, icon, name}),
         * temperature_entity, navigate_path.
         */
      ],
      computeLabel: (schema) => {
        const labels = { name: 'Card Name' };
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
      rooms: config.rooms,
    };
    if (this._rendered) {
      this._buildRooms();
      this._updateAll();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildRooms();
      this._rendered = true;
    }
    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');
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

  getCardSize() { return (this._config.rooms || []).length * 2; }
  connectedCallback() {}
  disconnectedCallback() {}

  _render() {
    const style = document.createElement('style');
    style.textContent = ROOMS_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomList: this.shadowRoot.getElementById('roomList'),
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
    };
  }

  _buildRooms() {
    // Section title
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const list = this.$.roomList;
    list.innerHTML = '';
    this._roomRefs = [];

    for (const roomCfg of this._config.rooms) {
      const card = document.createElement('div');
      card.className = 'room-card';

      // Build light orbs HTML
      let orbsHtml = '';
      for (const light of (roomCfg.lights || [])) {
        orbsHtml += `
          <div class="room-orb" data-entity="${light.entity}" title="${light.name || ''}">
            <span class="icon" style="font-size:16px">${light.icon || 'lightbulb'}</span>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="room-icon"><span class="icon" style="font-size:24px">${roomCfg.icon || 'home'}</span></div>
        <div class="room-info">
          <div class="room-name">${roomCfg.name || 'Room'}</div>
          <div class="room-status">--</div>
        </div>
        <div class="room-controls">
          ${orbsHtml}
        </div>
        <span class="icon room-chevron" style="font-size:18px">chevron_right</span>
      `;

      // Orb click handlers
      card.querySelectorAll('.room-orb').forEach(orb => {
        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          const entityId = orb.dataset.entity;
          if (!entityId || !this._hass) return;
          this._hass.callService('light', 'toggle', { entity_id: entityId });
          this._serviceCooldown[entityId] = true;
          setTimeout(() => { this._serviceCooldown[entityId] = false; }, 1500);
          // Optimistic
          orb.classList.toggle('on');
        });
      });

      // Card click -> navigate or more-info
      card.addEventListener('click', () => {
        if (roomCfg.navigate_path) {
          history.pushState(null, '', roomCfg.navigate_path);
          const event = new Event('location-changed');
          window.dispatchEvent(event);
        }
      });

      list.appendChild(card);

      this._roomRefs.push({
        el: card,
        cfg: roomCfg,
        statusEl: card.querySelector('.room-status'),
        orbEls: Array.from(card.querySelectorAll('.room-orb')),
      });
    }
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    for (const ref of this._roomRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;
      let totalBright = 0;
      let brightCount = 0;

      // Update orbs
      ref.orbEls.forEach((orb, i) => {
        const light = lights[i];
        if (!light || !light.entity) return;
        if (this._serviceCooldown[light.entity]) return;

        const entity = this._hass.states[light.entity];
        const isOn = entity && entity.state === 'on';
        orb.classList.toggle('on', isOn);
        if (isOn) {
          onCount++;
          const b = entity.attributes.brightness;
          if (b != null) {
            totalBright += Math.round((b / 255) * 100);
            brightCount++;
          }
        }
      });

      // Room active state
      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);

      // Status text
      let statusParts = [];
      if (anyOn) {
        if (onCount === lights.length) {
          statusParts.push('<span class="amber-txt">On</span>');
        } else {
          statusParts.push(`<span class="amber-txt">${onCount} of ${lights.length} on</span>`);
        }
        if (brightCount > 0) {
          statusParts.push(Math.round(totalBright / brightCount) + '%');
        }
      } else {
        statusParts.push('All off');
      }

      // Temperature
      if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state) {
          const unit = tempEntity.attributes.unit_of_measurement || '°F';
          statusParts.push(Math.round(Number(tempEntity.state)) + unit);
        }
      }

      ref.statusEl.innerHTML = statusParts.join(' \u00b7 ');
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

customElements.define('tunet-rooms-card', TunetRoomsCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-rooms-card',
  name: 'Tunet Rooms Card',
  description: 'Glassmorphism room overview with per-room light group orbs',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-rooms-card',
});

console.info(
  `%c TUNET-ROOMS-CARD %c v${ROOMS_CARD_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
