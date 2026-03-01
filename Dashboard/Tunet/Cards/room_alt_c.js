/**
 * Room Alt C — Tunet Room Overview Card
 * Self-contained monolith — zero external dependencies
 * Glassmorphism capsule rows with per-light orbs
 *
 * Layout per mockup:
 *   Section container with "Rooms" header
 *   Vertical list of room capsules:
 *     [44px icon] [name + status] [light orbs...] [chevron]
 *
 * Interactions:
 *   Orb tap (off) = toggle individual light on
 *   Orb tap (on)  = open inline dimmer overlay
 *   Icon tap      = toggle ALL room lights
 *   Capsule tap   = navigate (if path set) or more-info on first light
 *   Long press    = toggle ALL room lights
 *
 * Version 1.1.0
 */

const ROOM_ALT_C_VERSION = '1.1.0';

/* ── TunetCardFoundation (idempotent global) ──────────────── */

if (!window.TunetCardFoundation) {
  window.TunetCardFoundation = {
    escapeHtml(value) {
      return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    },
    normalizeIcon(icon, options = {}) {
      const fallback = options.fallback || 'lightbulb';
      const aliases = options.aliases || {};
      const allow = options.allow || null;
      if (!icon) return fallback;
      const raw = String(icon).replace(/^mdi:/, '').trim();
      const resolved = aliases[raw] || raw;
      if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return fallback;
      if (allow && allow.size && !allow.has(resolved)) return fallback;
      return resolved;
    },
    bindActivate(el, handler, options = {}) {
      if (!el || typeof handler !== 'function') return () => {};
      const role = options.role || 'button';
      const tabindex = options.tabindex != null ? options.tabindex : 0;
      if (!el.hasAttribute('role')) el.setAttribute('role', role);
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', String(tabindex));
      const onClick = (e) => {
        if (options.stopPropagation) e.stopPropagation();
        handler(e);
      };
      const onKey = (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        if (options.stopPropagation) e.stopPropagation();
        handler(e);
      };
      el.addEventListener('click', onClick);
      el.addEventListener('keydown', onKey);
      return () => {
        el.removeEventListener('click', onClick);
        el.removeEventListener('keydown', onKey);
      };
    },
    async callServiceSafe(host, domain, service, data = {}, options = {}) {
      const hass = host && host._hass ? host._hass : host;
      if (!hass || !domain || !service) return false;
      const pendingEl = options.pendingEl || null;
      if (pendingEl) {
        pendingEl.classList.add('is-pending');
        if ('disabled' in pendingEl) pendingEl.disabled = true;
      }
      try {
        const result = hass.callService(domain, service, data || {});
        if (result && typeof result.then === 'function') await result;
        return true;
      } catch (error) {
        console.error(`[Tunet] callService failed: ${domain}.${service}`, error);
        if (typeof options.onError === 'function') options.onError(error);
        if (host && typeof host.dispatchEvent === 'function') {
          host.dispatchEvent(new CustomEvent('tunet-service-error', {
            bubbles: true, composed: true,
            detail: { domain, service, data, error: String(error?.message || error) },
          }));
        }
        return false;
      } finally {
        if (pendingEl) {
          pendingEl.classList.remove('is-pending');
          if ('disabled' in pendingEl) pendingEl.disabled = false;
        }
      }
    },
  };
}

const F = window.TunetCardFoundation;

/* ── Icon helpers ─────────────────────────────────────────── */

const ICON_ALIASES = {
  shelf_auto: 'shelves', countertops: 'kitchen', desk_lamp: 'desk',
  floor_lamp: 'table_lamp', lamp: 'table_lamp', light_group: 'lightbulb',
};

function normIcon(icon) {
  return F.normalizeIcon(icon, { fallback: 'lightbulb', aliases: ICON_ALIASES });
}

/* ═══════════════════════════════════════════════════════════════
   CSS — Full token system + component styles
   ═══════════════════════════════════════════════════════════════ */

const STYLES = `
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
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10,0.10);
    --amber-border: rgba(212,133,10,0.22);
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.18);
    --red: #FF3B30;
    --red-fill: rgba(255,59,48,0.10);
    --red-border: rgba(255,59,48,0.22);
    --track-bg: rgba(28,28,30,0.055);
    --track-h: 44px;
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 14px;
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --chip-bg: rgba(255,255,255,0.48);
    --chip-border: rgba(0,0,0,0.05);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.04);
    --dd-bg: rgba(255,255,255,0.84);
    --dd-border: rgba(255,255,255,0.60);
    --divider: rgba(28,28,30,0.07);
    --toggle-off: rgba(28,28,30,0.10);
    --toggle-on: rgba(52,199,89,0.28);
    --toggle-knob: rgba(255,255,255,0.96);
    --gray-ghost: rgba(0,0,0,0.035);
    --border-ghost: transparent;
    --tile-bg: rgba(255,255,255,0.92);
    --section-bg: rgba(255,255,255,0.35);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.10);
    color-scheme: light;
    display: block;
  }

  /* -- Tokens: Dark (Midnight Navy) -- */
  :host(.dark) {
    --glass: rgba(30,41,59,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36,0.14);
    --amber-border: rgba(251,191,36,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.18);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242,0.14);
    --purple-border: rgba(191,90,242,0.22);
    --red: #FF453A;
    --red-fill: rgba(255,69,58,0.14);
    --red-border: rgba(255,69,58,0.25);
    --track-bg: rgba(255,255,255,0.06);
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --chip-bg: rgba(30,41,59,0.50);
    --chip-border: rgba(255,255,255,0.06);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.18);
    --dd-bg: rgba(30,41,59,0.92);
    --dd-border: rgba(255,255,255,0.08);
    --divider: rgba(255,255,255,0.06);
    --toggle-off: rgba(255,255,255,0.10);
    --toggle-on: rgba(48,209,88,0.30);
    --toggle-knob: rgba(255,255,255,0.92);
    --gray-ghost: rgba(255,255,255,0.05);
    --border-ghost: rgba(255,255,255,0.08);
    --tile-bg: rgba(30,41,59,0.90);
    --section-bg: rgba(30,41,59,0.60);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.25);
    color-scheme: dark;
  }

  /* ── Reset ─────────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Base Font ─────────────────────────────────────── */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Material Symbols Rounded ──────────────────────── */
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle; flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0; --ms-wght: 400; --ms-grad: 0; --ms-opsz: 24;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }

  /* ── Section Container ─────────────────────────────── */
  .section-container {
    position: relative;
    background: var(--section-bg);
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-radius: var(--r-section);
    border: 1px solid var(--ctrl-border);
    padding: 20px;
    box-shadow: var(--section-shadow), var(--inset);
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

  /* ── Section Header ────────────────────────────────── */
  .section-hdr {
    display: flex; align-items: center; padding: 0 4px;
  }
  .section-title {
    font-size: 17px; font-weight: 700; letter-spacing: -0.2px;
    color: var(--text);
    display: flex; align-items: center; gap: 8px;
  }
  .section-title .icon { color: var(--amber); }

  /* ═══════════════════════════════════════════════════════
     ROOM CAPSULES
     ═══════════════════════════════════════════════════════ */
  .room-list {
    display: grid; grid-template-columns: 1fr; gap: 10px;
  }
  @media (min-width: 600px) {
    .room-list { grid-template-columns: 1fr 1fr; }
  }

  .room-card {
    min-height: 72px; border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    display: flex; align-items: center; padding: 0 14px; gap: 12px;
    cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden;
  }
  .room-card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .room-card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }
  .room-card:hover { box-shadow: var(--shadow-up), var(--inset); }
  .room-card.active { border-color: var(--amber-border); }

  /* ── Room Icon ─────────────────────────────────────── */
  .room-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all 0.2s; border: 1px solid transparent;
  }
  .room-card:not(.active) .room-icon {
    background: var(--gray-ghost); color: var(--text-muted);
  }
  .room-card.active .room-icon {
    background: var(--amber-fill); color: var(--amber);
    border-color: var(--amber-border);
  }
  .room-card.active .room-icon .icon {
    --ms-fill: 1;
  }

  /* ── Room Info ─────────────────────────────────────── */
  .room-info { flex: 1; min-width: 0; }
  .room-name {
    font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-status {
    font-size: 11.5px; font-weight: 600; color: var(--text-muted);
    line-height: 1.2; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-status .amber-txt { color: var(--amber); }

  /* ── Room Controls ─────────────────────────────────── */
  .room-controls { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

  /* ── Light Orbs ────────────────────────────────────── */
  .room-orb {
    width: 34px; height: 34px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    background: var(--gray-ghost); color: var(--text-muted);
    position: relative; z-index: 1;
  }
  .room-orb:hover { background: var(--track-bg); }
  .room-orb:active { transform: scale(0.92); }
  .room-orb:focus-visible {
    outline: 2px solid var(--blue); outline-offset: 2px;
  }
  .room-orb.on {
    background: var(--amber-fill); color: var(--amber);
    border-color: var(--amber-border);
  }
  .room-orb.on .icon {
    --ms-fill: 1;
  }

  /* ── Chevron ───────────────────────────────────────── */
  .room-chevron {
    color: var(--text-muted); flex-shrink: 0; cursor: pointer;
  }

  /* ═══════════════════════════════════════════════════════
     DIMMER OVERLAY (inline row swap)
     ═══════════════════════════════════════════════════════ */
  .dimmer-layer {
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 10px;
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity .15s;
  }
  .dimmer-layer.visible {
    opacity: 1;
    pointer-events: auto;
  }

  .dimmer-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    background: var(--amber-fill);
    color: var(--amber);
  }
  .dimmer-icon .icon { --ms-fill: 1; }

  .dimmer-track {
    flex: 1;
    height: 36px;
    border-radius: var(--r-track);
    background: var(--track-bg);
    position: relative;
    cursor: pointer;
    touch-action: none;
    min-width: 0;
  }
  .dimmer-fill {
    height: 100%;
    border-radius: var(--r-track);
    background: var(--amber);
    opacity: 0.30;
    transition: width .05s linear;
    pointer-events: none;
  }
  .dimmer-thumb {
    position: absolute;
    top: 50%;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--thumb-bg);
    box-shadow: var(--thumb-sh);
    transform: translate(-50%, -50%);
    transition: box-shadow .12s;
    pointer-events: none;
  }
  .dimmer-thumb.active {
    box-shadow: var(--thumb-sh-a);
  }

  .dimmer-pct {
    font-size: 13px;
    font-weight: 700;
    color: var(--amber);
    min-width: 36px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }

  .dimmer-close {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    cursor: pointer;
    color: var(--text-muted);
    background: var(--gray-ghost);
    transition: all .12s;
    border: none;
    font-family: inherit;
    padding: 0;
  }
  @media (hover: hover) {
    .dimmer-close:hover { background: var(--track-bg); }
  }
  .dimmer-close:active { transform: scale(0.92); }

  /* ── Reduced Motion ────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ── Responsive ────────────────────────────────────── */
  @media (max-width: 440px) {
    .section-container { padding: 16px; border-radius: 28px; }
    .room-card { padding: 0 10px; min-height: 66px; gap: 10px; }
    .room-icon { width: 38px; height: 38px; }
    .room-orb { width: 30px; height: 30px; }
    .room-name { font-size: 13px; }
    .room-status { font-size: 11px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title" id="sectionTitle">
          <span class="icon filled">meeting_room</span>
          <span id="titleText">Rooms</span>
        </span>
      </div>
      <div class="room-list" id="roomList"></div>
    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class RoomAltC extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._roomRefs = [];
    this._serviceCooldown = {};
    this._cooldownTimers = {};
    this._activeDimmer = null; // { roomIdx, lightIdx, entity }
    this._dimDragging = false;
    this._dimDebounce = null;
    RoomAltC._injectFonts();
  }

  static _injectFonts() {
    if (RoomAltC._fontsInjected) return;
    RoomAltC._fontsInjected = true;
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

  /* ── Config ──────────────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
      ],
      computeLabel: (schema) => {
        return { name: 'Card Name' }[schema.name] || schema.name;
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
        icon: room.icon || 'home',
        temperature_entity: room.temperature_entity || '',
        navigate_path: room.navigate_path || '',
        lights: (room.lights || []).map((light) => ({
          entity: light.entity || '',
          icon: light.icon || 'lightbulb',
          name: light.name || '',
        })),
      })),
    };
    if (this._rendered) {
      this._closeDimmer();
      this._buildRooms();
      this._updateAll();
    }
  }

  /* ── HA State ────────────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildRooms();
      this._rendered = true;
    }
    const isDark = !!(hass.themes && hass.themes.darkMode);
    this.classList.toggle('dark', isDark);
    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateAll();
    }
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
    return (this._config.rooms || []).length + 1;
  }

  connectedCallback() {}

  disconnectedCallback() {
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
    clearTimeout(this._dimDebounce);
  }

  /* ── Render ──────────────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomList: this.shadowRoot.getElementById('roomList'),
      titleText: this.shadowRoot.getElementById('titleText'),
    };
  }

  /* ── Build Room Capsules ─────────────────────────────── */

  _buildRooms() {
    if (this.$.titleText) {
      this.$.titleText.textContent = this._config.name || 'Rooms';
    }

    const list = this.$.roomList;
    list.innerHTML = '';
    this._roomRefs = [];
    this._activeDimmer = null;

    for (let ri = 0; ri < this._config.rooms.length; ri++) {
      const roomCfg = this._config.rooms[ri];
      const card = document.createElement('div');
      card.className = 'room-card';

      // Room icon
      const iconWrap = document.createElement('div');
      iconWrap.className = 'room-icon';
      iconWrap.style.cursor = 'pointer';
      const iconEl = document.createElement('span');
      iconEl.className = 'icon icon-24';
      iconEl.textContent = normIcon(roomCfg.icon || 'home');
      iconWrap.appendChild(iconEl);
      card.appendChild(iconWrap);

      // Icon tap = toggle all room lights
      iconWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleAllRoomLights(roomCfg);
        iconWrap.style.transform = 'scale(0.92)';
        setTimeout(() => { iconWrap.style.transform = ''; }, 120);
      });

      // Room info
      const infoEl = document.createElement('div');
      infoEl.className = 'room-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'room-name';
      nameEl.textContent = F.escapeHtml(roomCfg.name);
      infoEl.appendChild(nameEl);
      const statusEl = document.createElement('div');
      statusEl.className = 'room-status';
      statusEl.textContent = '--';
      infoEl.appendChild(statusEl);
      card.appendChild(infoEl);

      // Light orbs
      const controlsEl = document.createElement('div');
      controlsEl.className = 'room-controls';
      const orbEls = [];

      for (let li = 0; li < (roomCfg.lights || []).length; li++) {
        const light = roomCfg.lights[li];
        const orb = document.createElement('div');
        orb.className = 'room-orb';
        orb.title = light.name || '';
        orb.setAttribute('role', 'button');
        orb.setAttribute('tabindex', '0');
        orb.setAttribute('aria-label', light.name || light.entity);
        const orbIcon = document.createElement('span');
        orbIcon.className = 'icon icon-16';
        orbIcon.textContent = normIcon(light.icon || 'lightbulb');
        orb.appendChild(orbIcon);

        const roomIdx = ri;
        const lightIdx = li;

        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          this._onOrbTap(roomIdx, lightIdx, orb, light.entity);
        });
        orb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this._onOrbTap(roomIdx, lightIdx, orb, light.entity);
          }
        });

        controlsEl.appendChild(orb);
        orbEls.push({ el: orb, entity: light.entity });
      }
      card.appendChild(controlsEl);

      // Chevron
      const chevron = document.createElement('span');
      chevron.className = 'icon icon-18 room-chevron';
      chevron.textContent = 'chevron_right';
      card.appendChild(chevron);

      // ── Dimmer overlay layer ──────────────────────────
      const dimmer = document.createElement('div');
      dimmer.className = 'dimmer-layer';

      const dimIcon = document.createElement('div');
      dimIcon.className = 'dimmer-icon';
      const dimIconSpan = document.createElement('span');
      dimIconSpan.className = 'icon icon-16';
      dimIconSpan.textContent = 'brightness_5';
      dimIcon.appendChild(dimIconSpan);
      dimmer.appendChild(dimIcon);

      const dimTrack = document.createElement('div');
      dimTrack.className = 'dimmer-track';
      const dimFill = document.createElement('div');
      dimFill.className = 'dimmer-fill';
      dimFill.style.width = '0%';
      dimTrack.appendChild(dimFill);
      const dimThumb = document.createElement('div');
      dimThumb.className = 'dimmer-thumb';
      dimThumb.style.left = '0%';
      dimTrack.appendChild(dimThumb);
      dimmer.appendChild(dimTrack);

      const dimPct = document.createElement('div');
      dimPct.className = 'dimmer-pct';
      dimPct.textContent = '0%';
      dimmer.appendChild(dimPct);

      const dimClose = document.createElement('button');
      dimClose.className = 'dimmer-close';
      dimClose.setAttribute('aria-label', 'Close dimmer');
      const dimCloseIcon = document.createElement('span');
      dimCloseIcon.className = 'icon icon-16';
      dimCloseIcon.textContent = 'close';
      dimClose.appendChild(dimCloseIcon);
      dimClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeDimmer();
      });
      dimmer.appendChild(dimClose);

      card.appendChild(dimmer);

      // Dimmer track pointer events (pointer capture pattern)
      dimTrack.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._dimDragging = true;
        this._dimTrackEl = dimTrack;
        dimTrack.setPointerCapture(e.pointerId);

        const refs = this._activeDimmer && this._roomRefs[this._activeDimmer.roomIdx];
        if (refs) refs.dimThumb.classList.add('active');

        this._applyDimmerFromEvent(e);
      });
      dimTrack.addEventListener('pointermove', (e) => {
        if (!this._dimDragging) return;
        e.preventDefault();
        this._applyDimmerFromEvent(e);
      });
      dimTrack.addEventListener('pointerup', () => {
        this._dimDragging = false;
        const refs = this._activeDimmer && this._roomRefs[this._activeDimmer.roomIdx];
        if (refs) refs.dimThumb.classList.remove('active');
      });
      dimTrack.addEventListener('lostpointercapture', () => {
        this._dimDragging = false;
        const refs = this._activeDimmer && this._roomRefs[this._activeDimmer.roomIdx];
        if (refs) refs.dimThumb.classList.remove('active');
      });

      // Card-level interactions
      // Long press = toggle all lights
      let pressTimer = null;
      let didLongPress = false;

      card.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.room-orb') || e.target.closest('.room-chevron') || e.target.closest('.dimmer-layer') || e.target.closest('.room-icon')) return;
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          this._toggleAllRoomLights(roomCfg);
          card.style.transform = 'scale(0.97)';
          setTimeout(() => { card.style.transform = ''; }, 120);
        }, 400);
      });

      card.addEventListener('pointerup', (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        if (e.target.closest('.room-orb') || e.target.closest('.room-chevron') || e.target.closest('.dimmer-layer') || e.target.closest('.room-icon')) return;
        // Short tap = navigate or more-info
        if (roomCfg.navigate_path) {
          history.pushState(null, '', roomCfg.navigate_path);
          this.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
        } else if (roomCfg.lights.length && roomCfg.lights[0].entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: roomCfg.lights[0].entity },
          }));
        }
      });

      card.addEventListener('pointercancel', () => {
        clearTimeout(pressTimer);
        didLongPress = false;
      });

      card.addEventListener('pointerleave', () => {
        clearTimeout(pressTimer);
      });

      card.addEventListener('contextmenu', (e) => e.preventDefault());

      // Keyboard: Enter/Space = navigate
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', roomCfg.name);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (roomCfg.navigate_path) {
            history.pushState(null, '', roomCfg.navigate_path);
            this.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
          } else if (roomCfg.lights.length && roomCfg.lights[0].entity) {
            this.dispatchEvent(new CustomEvent('hass-more-info', {
              bubbles: true, composed: true,
              detail: { entityId: roomCfg.lights[0].entity },
            }));
          }
        }
      });

      list.appendChild(card);

      this._roomRefs.push({
        el: card,
        cfg: roomCfg,
        statusEl,
        orbEls,
        dimmer,
        dimFill,
        dimThumb,
        dimPct,
        dimTrack,
        dimIconSpan,
      });
    }
  }

  /* ── Orb Tap ──────────────────────────────────────────── */

  _onOrbTap(roomIdx, lightIdx, orbEl, entityId) {
    if (!entityId || !this._hass) return;

    const state = this._hass.states[entityId];
    const isOn = state && state.state === 'on';

    if (isOn) {
      // Light is ON → open dimmer
      this._openDimmer(roomIdx, lightIdx, entityId);
    } else {
      // Light is OFF → toggle on with optimistic UI + cooldown
      orbEl.classList.toggle('on', true);

      F.callServiceSafe(this, 'light', 'toggle', { entity_id: entityId }, {
        pendingEl: orbEl,
        onError: () => orbEl.classList.toggle('on', false),
      });

      // Cooldown to prevent HA state from reverting optimistic UI
      this._serviceCooldown[entityId] = true;
      clearTimeout(this._cooldownTimers[entityId]);
      this._cooldownTimers[entityId] = setTimeout(() => {
        this._serviceCooldown[entityId] = false;
      }, 1500);
    }
  }

  /* ── Dimmer Open / Close ──────────────────────────────── */

  _openDimmer(roomIdx, lightIdx, entity) {
    // Close any existing dimmer first
    this._closeDimmer();

    const refs = this._roomRefs[roomIdx];
    if (!refs) return;

    this._activeDimmer = { roomIdx, lightIdx, entity };

    // Read current brightness
    const state = this._hass && this._hass.states[entity];
    const brt = state && state.state === 'on'
      ? Math.round((state.attributes.brightness || 0) / 2.55)
      : 0;

    refs.dimFill.style.width = brt + '%';
    refs.dimThumb.style.left = brt + '%';
    refs.dimPct.textContent = brt + '%';

    // Set icon to the light's icon
    const ltCfg = this._config.rooms[roomIdx].lights[lightIdx];
    refs.dimIconSpan.textContent = normIcon(ltCfg.icon);

    refs.dimmer.classList.add('visible');
  }

  _closeDimmer() {
    if (!this._activeDimmer) return;
    const refs = this._roomRefs[this._activeDimmer.roomIdx];
    if (refs) {
      refs.dimmer.classList.remove('visible');
    }
    this._activeDimmer = null;
    this._dimDragging = false;
  }

  /* ── Dimmer Pointer Handling ──────────────────────────── */

  _applyDimmerFromEvent(e) {
    if (!this._activeDimmer || !this._dimTrackEl) return;
    const rect = this._dimTrackEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = Math.round((x / rect.width) * 100);

    const refs = this._roomRefs[this._activeDimmer.roomIdx];
    if (refs) {
      refs.dimFill.style.width = pct + '%';
      refs.dimThumb.style.left = pct + '%';
      refs.dimPct.textContent = pct + '%';
    }

    // Debounced service call
    clearTimeout(this._dimDebounce);
    this._dimDebounce = setTimeout(() => {
      const entity = this._activeDimmer && this._activeDimmer.entity;
      if (!entity || !this._hass) return;
      if (pct === 0) {
        this._hass.callService('light', 'turn_off', { entity_id: entity });
      } else {
        this._hass.callService('light', 'turn_on', {
          entity_id: entity,
          brightness_pct: pct,
        });
      }
    }, 150);
  }

  /* ── Toggle All Room Lights ──────────────────────────── */

  _toggleAllRoomLights(roomCfg) {
    if (!this._hass) return;
    const entities = (roomCfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entities.length) return;

    const anyOn = entities.some((eid) => {
      const state = this._hass.states[eid];
      return state && state.state === 'on';
    });

    F.callServiceSafe(this, 'light', anyOn ? 'turn_off' : 'turn_on', {
      entity_id: entities,
    });
  }

  /* ── Update All ──────────────────────────────────────── */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    for (let ri = 0; ri < this._roomRefs.length; ri++) {
      const ref = this._roomRefs[ri];
      const lights = ref.cfg.lights || [];
      let onCount = 0;
      let totalBright = 0;
      let brightCount = 0;

      // Update orbs
      for (const orb of ref.orbEls) {
        if (!orb.entity) continue;
        if (this._serviceCooldown[orb.entity]) continue;

        const entity = this._hass.states[orb.entity];
        const isOn = entity && entity.state === 'on';
        orb.el.classList.toggle('on', isOn);
        if (isOn) {
          onCount++;
          const b = entity.attributes.brightness;
          if (b != null) {
            totalBright += Math.round((b / 255) * 100);
            brightCount++;
          }
        }
      }

      // Count from all lights (including cooldown ones)
      let trueOnCount = 0;
      for (const light of lights) {
        if (!light.entity) continue;
        const entity = this._hass.states[light.entity];
        if (entity && entity.state === 'on') trueOnCount++;
      }
      // Use true count for room-level state
      onCount = trueOnCount;

      // Room active state
      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);

      // Status text
      const statusParts = [];
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
        if (tempEntity && tempEntity.state && tempEntity.state !== 'unavailable') {
          const unit = tempEntity.attributes.unit_of_measurement || '\u00B0F';
          statusParts.push(Math.round(Number(tempEntity.state)) + unit);
        }
      }

      ref.statusEl.innerHTML = statusParts.join(' &middot; ');

      // Update dimmer if active for this room and not dragging
      if (this._activeDimmer && this._activeDimmer.roomIdx === ri && !this._dimDragging) {
        const dimEntity = this._activeDimmer.entity;
        const dimState = this._hass.states[dimEntity];
        if (dimState && dimState.state === 'on') {
          const brt = Math.round((dimState.attributes.brightness || 0) / 2.55);
          ref.dimFill.style.width = brt + '%';
          ref.dimThumb.style.left = brt + '%';
          ref.dimPct.textContent = brt + '%';
        } else if (dimState && dimState.state !== 'on') {
          // Light turned off, auto-close dimmer
          this._closeDimmer();
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

if (!customElements.get('room-alt-c')) {
  customElements.define('room-alt-c', RoomAltC);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === 'room-alt-c')) {
  window.customCards.push({
    type: 'room-alt-c',
    name: 'Room Alt C',
    description: 'Glassmorphism room overview with per-light orbs and capsule layout',
    preview: true,
    documentationURL: 'https://github.com/tunet/room-alt-c',
  });
}

console.info(
  `%c ROOM-ALT-C %c v${ROOM_ALT_C_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
