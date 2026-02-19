/**
 * Tunet Rooms Card
 * Room overview capsules with light orb toggles
 * Version 1.0.0
 */

const TUNET_ROOMS_VERSION = '1.0.0';

const TUNET_ROOMS_STYLES = `
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
    --green: #34C759;
    --r-card: 24px;
    --r-tile: 16px;
    --ctrl-border: rgba(0,0,0,0.05);
    --gray-ghost: rgba(0,0,0,0.035);
    --toggle-off: rgba(28,28,30,0.10);
    --toggle-on: rgba(52,199,89,0.28);
    --toggle-knob: rgba(255,255,255,0.96);
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
    --green: #30D158;
    --ctrl-border: rgba(255,255,255,0.10);
    --gray-ghost: rgba(255,255,255,0.05);
    --toggle-off: rgba(255,255,255,0.12);
    --toggle-on: rgba(48,209,88,0.35);
    --toggle-knob: rgba(255,255,255,0.92);
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

  /* Card */
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
  .hdr-title .icon { color: var(--amber); }

  /* Room list */
  .room-list { display: flex; flex-direction: column; gap: 10px; }

  .room-card {
    min-height: 72px; border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    display: flex; align-items: center; padding: 0 14px; gap: 12px;
    cursor: pointer; transition: all .15s; position: relative; overflow: hidden;
  }
  .room-card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px; pointer-events: none; z-index: 0;
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
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all .2s; border: 1px solid transparent;
  }
  .room-card:not(.active) .room-icon { background: var(--gray-ghost); color: var(--text-muted); }
  .room-card.active .room-icon { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-card.active .room-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .room-info { flex: 1; min-width: 0; }
  .room-name { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .room-status { font-size: 11.5px; font-weight: 600; color: var(--text-muted); line-height: 1.2; margin-top: 2px; }
  .room-status .amber-txt { color: var(--amber); }

  .room-controls { display: flex; align-items: center; gap: 6px; }

  .room-orb {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; transition: all .15s; border: 1px solid transparent;
    background: var(--gray-ghost); color: var(--text-muted);
  }
  .room-orb:hover { background: rgba(28,28,30,0.055); }
  :host(.dark) .room-orb:hover { background: rgba(255,255,255,0.08); }
  .room-orb:active { transform: scale(.92); }
  .room-orb.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-orb.on .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .room-toggle {
    width: 44px; height: 24px; border-radius: 12px;
    background: var(--toggle-off); position: relative;
    cursor: pointer; transition: background .15s; flex-shrink: 0;
  }
  .room-toggle.on { background: var(--toggle-on); }
  .room-toggle-knob {
    width: 20px; height: 20px; border-radius: 999px;
    background: var(--toggle-knob);
    box-shadow: 0 1px 2px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06);
    position: absolute; top: 2px; left: 2px; transition: transform .15s ease;
  }
  .room-toggle.on .room-toggle-knob { transform: translateX(20px); }

  .room-chevron { color: var(--text-muted); flex-shrink: 0; cursor: pointer; }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

class TunetRoomsCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._roomEls = [];
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

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
      ],
      computeLabel: (s) => ({ name: 'Card Title' }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return { name: 'Rooms', rooms: [] };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Rooms',
      rooms: (config.rooms || []).map(r => ({
        name: r.name || 'Room',
        icon: r.icon || 'meeting_room',
        temperature_entity: r.temperature_entity || '',
        navigate_path: r.navigate_path || '',
        lights: (r.lights || []).map(l => ({
          entity: l.entity || '',
          icon: l.icon || 'lightbulb',
          name: l.name || '',
        })),
      })),
    };
    if (this._rendered) this._buildRooms();
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

    // Check if any relevant entity changed
    let changed = !oldHass;
    if (!changed) {
      for (const room of this._config.rooms) {
        if (room.temperature_entity && oldHass.states[room.temperature_entity] !== hass.states[room.temperature_entity]) {
          changed = true; break;
        }
        for (const light of room.lights) {
          if (light.entity && oldHass.states[light.entity] !== hass.states[light.entity]) {
            changed = true; break;
          }
        }
        if (changed) break;
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    return Math.max(2, (this._config.rooms || []).length * 2 + 1);
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOMS_STYLES;
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
              <span class="icon filled">meeting_room</span>
              <span id="title"></span>
            </div>
          </div>
          <div class="room-list" id="roomList"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._titleEl = this.shadowRoot.getElementById('title');
    this._roomListEl = this.shadowRoot.getElementById('roomList');
    this._buildRooms();
  }

  _buildRooms() {
    if (!this._roomListEl) return;
    this._roomListEl.innerHTML = '';
    this._titleEl.textContent = this._config.name;
    this._roomEls = [];

    for (const room of this._config.rooms) {
      const card = document.createElement('div');
      card.className = 'room-card';

      // Build orbs HTML
      const orbsHTML = room.lights.map((l, i) =>
        `<div class="room-orb" data-idx="${i}" title="${l.name || l.entity}">
          <span class="icon" style="font-size:16px">${l.icon}</span>
        </div>`
      ).join('');

      card.innerHTML = `
        <div class="room-icon"><span class="icon" style="font-size:24px">${room.icon}</span></div>
        <div class="room-info">
          <div class="room-name">${room.name}</div>
          <div class="room-status">--</div>
        </div>
        <div class="room-controls">
          ${orbsHTML}
          <div class="room-toggle">
            <div class="room-toggle-knob"></div>
          </div>
        </div>
        <span class="icon room-chevron" style="font-size:18px">chevron_right</span>
      `;

      const statusEl = card.querySelector('.room-status');
      const toggleEl = card.querySelector('.room-toggle');
      const orbEls = card.querySelectorAll('.room-orb');
      const chevronEl = card.querySelector('.room-chevron');

      // Orb click: toggle individual light
      orbEls.forEach((orb, i) => {
        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          if (!this._hass || !room.lights[i].entity) return;
          this._hass.callService('light', 'toggle', { entity_id: room.lights[i].entity });
        });
      });

      // Room toggle: turn all lights on/off
      toggleEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!this._hass) return;
        const anyOn = room.lights.some(l => {
          const s = this._hass.states[l.entity];
          return s && s.state === 'on';
        });
        const service = anyOn ? 'turn_off' : 'turn_on';
        const entities = room.lights.map(l => l.entity).filter(Boolean);
        if (entities.length) {
          this._hass.callService('light', service, { entity_id: entities });
        }
      });

      // Chevron: navigate
      chevronEl.addEventListener('click', (e) => {
        e.stopPropagation();
        if (room.navigate_path) {
          window.history.pushState(null, '', room.navigate_path);
          window.dispatchEvent(new Event('location-changed'));
        }
      });

      // Card click: navigate or more-info on first light
      card.addEventListener('click', () => {
        if (room.navigate_path) {
          window.history.pushState(null, '', room.navigate_path);
          window.dispatchEvent(new Event('location-changed'));
        } else if (room.lights.length && room.lights[0].entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: room.lights[0].entity },
          }));
        }
      });

      this._roomListEl.appendChild(card);
      this._roomEls.push({ card, room, statusEl, toggleEl, orbEls });
    }

    this._updateAll();
  }

  _updateAll() {
    if (!this._hass || !this._roomEls) return;

    for (const { card, room, statusEl, toggleEl, orbEls } of this._roomEls) {
      let onCount = 0;
      const total = room.lights.length;
      let avgBrt = 0;
      let brtCount = 0;

      // Update orbs
      room.lights.forEach((l, i) => {
        const entity = this._hass.states[l.entity];
        const isOn = entity && entity.state === 'on';
        if (orbEls[i]) {
          orbEls[i].classList.toggle('on', isOn);
        }
        if (isOn) {
          onCount++;
          const brt = entity.attributes.brightness;
          if (brt != null) { avgBrt += Math.round(brt / 2.55); brtCount++; }
        }
      });

      const anyOn = onCount > 0;
      card.classList.toggle('active', anyOn);
      toggleEl.classList.toggle('on', anyOn);

      // Status text
      if (!anyOn) {
        statusEl.innerHTML = 'All off';
      } else {
        const parts = [];

        // On count
        if (onCount === total) {
          parts.push('<span class="amber-txt">On</span>');
        } else {
          parts.push(`<span class="amber-txt">${onCount} of ${total} on</span>`);
        }

        // Average brightness
        if (brtCount > 0) {
          parts.push(Math.round(avgBrt / brtCount) + '%');
        }

        // Temperature
        if (room.temperature_entity) {
          const tempEntity = this._hass.states[room.temperature_entity];
          if (tempEntity) {
            const temp = Math.round(Number(tempEntity.state));
            parts.push(temp + '&deg;F');
          }
        }

        statusEl.innerHTML = parts.join(' &middot; ');
      }
    }
  }
}

customElements.define('tunet-rooms-card', TunetRoomsCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-rooms-card',
  name: 'Tunet Rooms Card',
  description: 'Room overview capsules with light orb toggles',
  preview: true,
});

console.info(
  `%c TUNET-ROOMS-CARD %c v${TUNET_ROOMS_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
