/**
 * Tunet Rooms Card
 * Custom Home Assistant card with glassmorphism design
 * Room overview capsules with per-room light group orbs
 * Version 2.1.0
 */

const ROOMS_CARD_VERSION = '2.1.0';

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
            bubbles: true,
            composed: true,
            detail: {
              domain,
              service,
              data,
              error: String(error && error.message ? error.message : error),
            },
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

const ACTION_TYPES = new Set(['more-info', 'navigate', 'url', 'call-service', 'none']);

function normalizeIcon(icon) {
  return window.TunetCardFoundation.normalizeIcon(icon, {
    aliases: ICON_ALIASES,
    allow: ROOM_ICON_FALLBACKS,
    fallback: 'lightbulb',
  });
}

function failConfig(path, message) {
  throw new Error(`[Tunet Rooms Card] ${path} ${message}`);
}

function isObjectLike(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeTapAction(action, path, options = {}) {
  const required = options.required !== false;
  if (action == null) {
    if (required) failConfig(path, 'is required');
    return null;
  }
  if (!isObjectLike(action)) failConfig(path, 'must be an object');

  const actionTypeRaw = action.action != null ? String(action.action).trim() : '';
  const actionType = actionTypeRaw || 'more-info';
  if (!ACTION_TYPES.has(actionType)) {
    failConfig(`${path}.action`, `must be one of: ${Array.from(ACTION_TYPES).join(', ')}`);
  }

  if (actionType === 'navigate' && !String(action.navigation_path || '').trim()) {
    failConfig(`${path}.navigation_path`, 'is required when action is "navigate"');
  }
  if (actionType === 'url' && !String(action.url_path || '').trim()) {
    failConfig(`${path}.url_path`, 'is required when action is "url"');
  }
  if (actionType === 'call-service') {
    const service = String(action.service || '').trim();
    const [domain, serviceName] = service.split('.');
    if (!domain || !serviceName) {
      failConfig(`${path}.service`, 'must be in "domain.service" format when action is "call-service"');
    }
  }

  return {
    action: actionType,
    entity: action.entity || '',
    navigation_path: action.navigation_path || '',
    url_path: action.url_path || '',
    new_tab: action.new_tab === true,
    service: action.service || '',
    service_data: isObjectLike(action.service_data) ? action.service_data : {},
  };
}

function normalizeSecondary(secondary, path) {
  if (secondary == null || secondary === '') return '';
  if (typeof secondary === 'string') return secondary;
  if (!isObjectLike(secondary)) {
    failConfig(path, 'must be a string or an object template (entity/attribute/prefix/suffix/fallback)');
  }
  if (!String(secondary.entity || '').trim()) {
    failConfig(`${path}.entity`, 'is required for a secondary template object');
  }
  return {
    entity: String(secondary.entity).trim(),
    attribute: secondary.attribute ? String(secondary.attribute) : '',
    unit: secondary.unit != null ? String(secondary.unit) : '',
    prefix: secondary.prefix != null ? String(secondary.prefix) : '',
    suffix: secondary.suffix != null ? String(secondary.suffix) : '',
    fallback: secondary.fallback != null ? String(secondary.fallback) : '--',
  };
}

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
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255,0.09);
    --blue-border: rgba(0,122,255,0.18);
    --green: #34C759;
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222,0.10);
    --purple-border: rgba(175,82,222,0.18);
    --track-bg: rgba(28,28,30,0.055);
    --track-h: 44px;
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    --gray-ghost: rgba(28,28,30,0.04);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-track: 4px;
    --r-pill: 999px;
    --parent-bg: rgba(255,255,255,0.45);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
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
    --tile-bg: rgba(255,255,255,0.92);
    color-scheme: light;
    display: block;
  }
  /* Midnight Navy */
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
    --track-bg: rgba(255,255,255,0.06);
    --track-h: 44px;
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
    --gray-ghost: rgba(255,255,255,0.04);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-track: 4px;
    --r-pill: 999px;
    --parent-bg: rgba(30,41,59,0.60);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.25);
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
    --tile-bg: rgba(30,41,59,0.90);
    color-scheme: dark;
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
    border: 1px solid var(--ctrl-border);
    padding: var(--tunet-rooms-card-padding, 20px);
    box-shadow: var(--shadow-section), var(--inset);
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
  .room-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--tunet-rooms-gap, 10px);
    /* Keep 2x2 cards tall enough so summary labels don't overlap controls. */
    grid-auto-rows: minmax(132px, auto);
  }

  /* -- Room Capsule -- */
  .room-card {
    min-height: 132px; border-radius: var(--r-card);
    background: var(--glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08), var(--inset);
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: minmax(44px, auto) minmax(52px, auto);
    align-items: center;
    padding: 12px 14px;
    row-gap: 10px;
    column-gap: 12px;
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
  .room-card:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), var(--inset); }
  .room-card.active { border-color: var(--amber-border); }

  .room-icon {
    width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center;
    flex-shrink: 0; transition: all 0.2s; border: 1px solid transparent;
    cursor: pointer;
    padding: 0;
    font: inherit;
  }
  .room-card:not(.active) .room-icon { background: var(--gray-ghost); color: var(--text-muted); }
  .room-card.active .room-icon { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-card.active .room-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .room-card:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }
  .room-icon:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }

  .room-info {
    min-width: 0;
    grid-column: 2;
    grid-row: 1;
    align-self: start;
  }
  .room-name { font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2; }
  .room-primary, .room-status {
    font-size: 11.5px; font-weight: 600; color: var(--text-muted); line-height: 1.2; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-secondary {
    font-size: 11px; font-weight: 600; color: var(--text-sub); line-height: 1.2; margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .room-primary .amber-txt, .room-status .amber-txt { color: var(--amber); }

  .room-controls {
    grid-column: 1 / -1;
    grid-row: 2;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    align-self: end;
    gap: var(--tunet-room-controls-gap, 8px);
    min-height: 34px;
  }
  .room-sub-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  /* -- Light Group Orbs -- */
  .room-orb {
    width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
    flex-shrink: 0; cursor: pointer; transition: all 0.15s; border: 1px solid transparent;
    background: var(--gray-ghost); color: var(--text-muted);
    padding: 0;
    font: inherit;
  }
  .room-orb:hover { background: var(--track-bg); }
  .room-orb:active { transform: scale(0.92); }
  .room-orb.on { background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border); }
  .room-orb.on .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .room-orb.expanded {
    border-color: var(--amber-border);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    transform: scale(1.03);
  }

  .room-chip {
    width: 30px; height: 30px; border-radius: 999px;
    background: var(--chip-bg); border-color: var(--chip-border); box-shadow: var(--chip-sh);
  }
  .room-chip[data-active="true"] {
    background: var(--amber-fill); color: var(--amber); border-color: var(--amber-border);
  }
  .room-chip[disabled], .room-chip.is-disabled { opacity: 0.45; cursor: not-allowed; }

  .room-slider-wrap {
    display: flex;
    align-items: center;
    gap: var(--tunet-room-controls-gap, 8px);
    flex: 1;
    min-width: 0;
    padding: 6px 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--track-bg);
    box-shadow: var(--inset);
  }
  .room-slider-wrap.hidden { display: none; }
  .room-slider-wrap .icon {
    color: var(--amber);
    font-size: 16px;
    width: 16px;
    height: 16px;
  }
  .room-slider {
    -webkit-appearance: none;
    appearance: none;
    flex: 1;
    height: 4px;
    border-radius: 999px;
    background: var(--track-bg);
    outline: none;
  }
  .room-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--amber-border);
    background: var(--amber);
    box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .room-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid var(--amber-border);
    background: var(--amber);
    box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    cursor: pointer;
  }
  .room-slider-val {
    min-width: 34px;
    text-align: right;
    font-size: 11px;
    font-weight: 700;
    color: var(--amber);
    font-variant-numeric: tabular-nums;
  }

  .room-chevron {
    color: var(--text-muted);
    flex-shrink: 0;
    cursor: pointer;
    grid-column: 3;
    grid-row: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
  @media (max-width: 760px) {
    .room-list { grid-template-columns: 1fr; }
  }
  @media (max-width: 440px) {
    .room-list { grid-auto-rows: minmax(116px, auto); }
    .room-card {
      padding: 10px;
      min-height: 116px;
      grid-template-rows: minmax(40px, auto) minmax(46px, auto);
      row-gap: 8px;
      column-gap: 8px;
    }
    .room-icon { width: 38px; height: 38px; }
    .room-orb { width: 30px; height: 30px; }
    .room-slider-wrap { padding: 5px 7px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const ROOMS_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">

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
    this._cooldownTimers = {};
    TunetRoomsCard._injectFonts();
  }

  static _injectFonts() {
    if (TunetRoomsCard._fontsInjected) return;
    TunetRoomsCard._fontsInjected = true;
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
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
   * setConfig contract (standalone entry):
   * {
   *   title?: 'Rooms',
   *   theme?: 'auto' | 'light' | 'dark',
   *   variant?: string,
   *   spacing?: { card_padding?: number, room_gap?: number, control_gap?: number },
   *   rooms: [{
   *     name: string,
   *     icon: string,
   *     primary?: string,
   *     secondary?: string | { entity, attribute?, unit?, prefix?, suffix?, fallback? },
   *     tap_action: { action: 'more-info'|'navigate'|'url'|'call-service'|'none', ... },
   *     chips?: [{ icon, tap_action, active?, disabled? }],
   *
   *     // legacy compatibility also supported
   *     lights?: [{ entity, icon?, name?, sub_button? }],
   *     temperature_entity?: string,
   *     navigate_path?: string,
   *   }]
   * }
   */

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'rooms', selector: { object: {} } },
        { name: 'enable_sub_buttons', selector: { boolean: {} } },
        { name: 'sub_slider_timeout_ms', selector: { number: { min: 1200, max: 8000, step: 100, mode: 'box' } } },
      ],
      computeLabel: (schema) => {
        const labels = {
          title: 'Card Title',
          rooms: 'Rooms Config',
          enable_sub_buttons: 'Enable Sub-Button Sliders',
          sub_slider_timeout_ms: 'Sub-Slider Auto-Close (ms)',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      title: 'Rooms',
      enable_sub_buttons: true,
      sub_slider_timeout_ms: 3200,
      theme: 'auto',
      variant: '',
      spacing: {},
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
    if (!isObjectLike(config)) {
      failConfig('config', 'must be an object');
    }
    if (!Array.isArray(config.rooms) || config.rooms.length === 0) {
      failConfig('config.rooms', 'must be a non-empty array');
    }

    const timeoutMsRaw = Number(config.sub_slider_timeout_ms);
    const timeoutMs = Number.isFinite(timeoutMsRaw)
      ? Math.max(1200, Math.min(8000, Math.round(timeoutMsRaw)))
      : 3200;

    const spacing = isObjectLike(config.spacing) ? config.spacing : {};
    const theme = String(config.theme || 'auto').trim();
    if (!['auto', 'light', 'dark'].includes(theme)) {
      failConfig('config.theme', 'must be one of: auto, light, dark');
    }

    this._config = {
      title: String(config.title || config.name || 'Rooms').trim() || 'Rooms',
      theme,
      variant: String(config.variant || '').trim(),
      spacing: {
        card_padding: Number.isFinite(Number(spacing.card_padding)) ? Math.max(0, Number(spacing.card_padding)) : null,
        room_gap: Number.isFinite(Number(spacing.room_gap)) ? Math.max(0, Number(spacing.room_gap)) : null,
        control_gap: Number.isFinite(Number(spacing.control_gap)) ? Math.max(0, Number(spacing.control_gap)) : null,
      },
      enable_sub_buttons: config.enable_sub_buttons !== false,
      sub_slider_timeout_ms: timeoutMs,
      rooms: config.rooms.map((room, roomIndex) => {
        const roomPath = `config.rooms[${roomIndex}]`;
        if (!isObjectLike(room)) failConfig(roomPath, 'must be an object');

        const name = String(room.name || '').trim();
        if (!name) failConfig(`${roomPath}.name`, 'is required and must be a non-empty string');

        const iconRaw = String(room.icon || '').trim();
        if (!iconRaw) failConfig(`${roomPath}.icon`, 'is required and must be a non-empty string');

        const chipsRaw = room.chips == null ? [] : room.chips;
        if (!Array.isArray(chipsRaw)) failConfig(`${roomPath}.chips`, 'must be an array when provided');
        const chips = chipsRaw.map((chip, chipIndex) => {
          const chipPath = `${roomPath}.chips[${chipIndex}]`;
          if (!isObjectLike(chip)) failConfig(chipPath, 'must be an object');
          const chipIcon = String(chip.icon || '').trim();
          if (!chipIcon) failConfig(`${chipPath}.icon`, 'is required and must be a non-empty string');
          return {
            icon: normalizeIcon(chipIcon),
            tap_action: normalizeTapAction(chip.tap_action, `${chipPath}.tap_action`),
            active: chip.active === true,
            disabled: chip.disabled === true,
          };
        });

        const lightsRaw = room.lights == null ? [] : room.lights;
        if (!Array.isArray(lightsRaw)) failConfig(`${roomPath}.lights`, 'must be an array when provided');

        const tapAction = room.tap_action
          ? normalizeTapAction(room.tap_action, `${roomPath}.tap_action`)
          : room.navigate_path
            ? { action: 'navigate', navigation_path: String(room.navigate_path), entity: '', url_path: '', new_tab: false, service: '', service_data: {} }
            : (lightsRaw[0] && lightsRaw[0].entity)
              ? { action: 'more-info', entity: String(lightsRaw[0].entity), navigation_path: '', url_path: '', new_tab: false, service: '', service_data: {} }
              : null;

        if (!tapAction) {
          failConfig(`${roomPath}.tap_action`, 'is required when no legacy navigate_path/lights fallback is available');
        }

        return {
          name,
          icon: normalizeIcon(iconRaw),
          primary: room.primary != null ? String(room.primary) : '',
          secondary: normalizeSecondary(room.secondary, `${roomPath}.secondary`),
          tap_action: tapAction,
          chips,
          temperature_entity: room.temperature_entity || '',
          navigate_path: room.navigate_path || '',
          lights: lightsRaw.map((light, lightIndex) => {
            const lightPath = `${roomPath}.lights[${lightIndex}]`;
            if (!isObjectLike(light)) failConfig(lightPath, 'must be an object');
            return {
              entity: light.entity || '',
              icon: normalizeIcon(light.icon || 'lightbulb'),
              name: light.name || '',
              sub_button: light.sub_button !== false,
            };
          }),
        };
      }),
    };

    if (this._rendered) {
      this._applyCardConfigTokens();
      this._buildRooms();
      this._updateAll();
    }
  }

  _applyCardConfigTokens() {
    if (!this.$ || !this.$.sectionContainer) return;
    const hostStyle = this.style;
    hostStyle.removeProperty('--tunet-rooms-card-padding');
    hostStyle.removeProperty('--tunet-rooms-gap');
    hostStyle.removeProperty('--tunet-room-controls-gap');

    const spacing = this._config.spacing || {};
    if (spacing.card_padding != null) hostStyle.setProperty('--tunet-rooms-card-padding', `${spacing.card_padding}px`);
    if (spacing.room_gap != null) hostStyle.setProperty('--tunet-rooms-gap', `${spacing.room_gap}px`);
    if (spacing.control_gap != null) hostStyle.setProperty('--tunet-room-controls-gap', `${spacing.control_gap}px`);

    this.$.sectionContainer.dataset.variant = this._config.variant || '';
  }

  _resolveThemeMode(hass) {
    if (this._config.theme === 'dark') return true;
    if (this._config.theme === 'light') return false;
    return !!(hass && hass.themes && hass.themes.darkMode);
  }

  _handleTapAction(tapAction, defaultEntityId = '') {
    if (!tapAction || tapAction.action === 'none') return;
    const action = tapAction.action || 'more-info';

    if (action === 'more-info') {
      const entityId = tapAction.entity || defaultEntityId;
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }));
      return;
    }

    if (action === 'navigate') {
      if (!tapAction.navigation_path) return;
      history.pushState(null, '', tapAction.navigation_path);
      window.dispatchEvent(new Event('location-changed'));
      return;
    }

    if (action === 'url') {
      if (!tapAction.url_path) return;
      window.open(tapAction.url_path, tapAction.new_tab ? '_blank' : '_self');
      return;
    }

    if (action === 'call-service') {
      const [domain, service] = String(tapAction.service || '').split('.');
      if (!domain || !service) return;
      window.TunetCardFoundation.callServiceSafe(this, domain, service, tapAction.service_data || {});
      return;
    }
  }


  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._applyCardConfigTokens();
      this._buildRooms();
      this._rendered = true;
    }
    const isDark = this._resolveThemeMode(hass);
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
      if (room.secondary && typeof room.secondary === 'object' && room.secondary.entity
        && o.states[room.secondary.entity] !== n.states[room.secondary.entity]) return true;
    }
    return false;
  }

  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    const rows = Math.ceil(roomCount / 2);
    return Math.max(2, rows * 3);
  }
  connectedCallback() {}
  disconnectedCallback() {
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    if (Array.isArray(this._roomRefs)) {
      for (const ref of this._roomRefs) {
        clearTimeout(ref && ref.sliderTimer);
      }
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
  }

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
      sectionContainer: this.shadowRoot.querySelector('.section-container'),
    };
  }

  _setEntityCooldown(entityId) {
    this._serviceCooldown[entityId] = true;
    clearTimeout(this._cooldownTimers[entityId]);
    this._cooldownTimers[entityId] = setTimeout(() => {
      this._serviceCooldown[entityId] = false;
    }, 1500);
  }

  _supportsBrightness(entity) {
    if (!entity || entity.state === 'unavailable') return false;
    if (entity.attributes && entity.attributes.brightness != null) return true;
    const modes = entity.attributes && entity.attributes.supported_color_modes;
    if (!Array.isArray(modes)) return false;
    return !modes.includes('onoff');
  }

  _brightnessPct(entity) {
    if (!entity || entity.state !== 'on') return 0;
    const b = entity.attributes && entity.attributes.brightness;
    if (b == null) return 100;
    return Math.max(1, Math.min(100, Math.round((Number(b) / 255) * 100)));
  }

  _closeSubSlider(ref) {
    if (!ref || !ref.sliderWrap) return;
    clearTimeout(ref.sliderTimer);
    ref.sliderTimer = null;
    ref.sliderEntity = '';
    ref.sliderWrap.classList.add('hidden');
    ref.sliderInput.dataset.entity = '';
    ref.sliderValue.textContent = '--';
    for (const orb of ref.orbEls) orb.classList.remove('expanded');
  }

  _openSubSlider(ref, entityId) {
    if (!this._config.enable_sub_buttons) return false;
    const entity = this._hass && this._hass.states[entityId];
    if (!this._supportsBrightness(entity)) return false;

    if (ref.sliderEntity === entityId && !ref.sliderWrap.classList.contains('hidden')) {
      this._closeSubSlider(ref);
      return true;
    }

    ref.sliderEntity = entityId;
    ref.sliderWrap.classList.remove('hidden');
    ref.sliderInput.dataset.entity = entityId;
    const pct = this._brightnessPct(entity);
    ref.sliderInput.value = String(pct);
    ref.sliderValue.textContent = `${pct}%`;
    for (const orb of ref.orbEls) {
      orb.classList.toggle('expanded', orb.dataset.entity === entityId);
    }

    clearTimeout(ref.sliderTimer);
    ref.sliderTimer = setTimeout(() => this._closeSubSlider(ref), this._config.sub_slider_timeout_ms || 3200);
    return true;
  }

  _setRoomLightBrightness(ref, entityId, pct) {
    if (!this._hass || !entityId) return;
    const clamped = Math.max(0, Math.min(100, Math.round(Number(pct) || 0)));
    this._setEntityCooldown(entityId);
    const domain = 'light';
    const service = clamped <= 0 ? 'turn_off' : 'turn_on';
    const data = clamped <= 0
      ? { entity_id: entityId }
      : { entity_id: entityId, brightness_pct: clamped };
    window.TunetCardFoundation.callServiceSafe(this, domain, service, data, {
      onError: () => this._updateAll(),
    });
    if (ref && ref.sliderValue) {
      ref.sliderValue.textContent = clamped <= 0 ? 'Off' : `${clamped}%`;
      clearTimeout(ref.sliderTimer);
      ref.sliderTimer = setTimeout(() => this._closeSubSlider(ref), this._config.sub_slider_timeout_ms || 3200);
    }
  }

  _toggleRoomLight(ref, entityId, orb) {
    if (!this._hass || !entityId) return;
    const before = orb.classList.contains('on');
    orb.classList.toggle('on', !before);
    window.TunetCardFoundation.callServiceSafe(this, 'light', 'toggle', { entity_id: entityId }, {
      onError: () => {
        orb.classList.toggle('on', before);
        this._updateAll();
      },
    });
    this._setEntityCooldown(entityId);
  }

  _toggleRoomGroup(ref) {
    if (!this._hass || !ref || !ref.cfg) return;
    const entityIds = (ref.cfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entityIds.length) return;

    let anyOn = false;
    for (const entityId of entityIds) {
      const state = this._hass.states[entityId];
      if (state && state.state === 'on') {
        anyOn = true;
        break;
      }
    }

    const domain = 'light';
    const service = anyOn ? 'turn_off' : 'turn_on';
    for (const entityId of entityIds) {
      this._setEntityCooldown(entityId);
    }
    window.TunetCardFoundation.callServiceSafe(this, domain, service, { entity_id: entityIds }, {
      onError: () => this._updateAll(),
    });
  }

  _buildRooms() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.title || 'Rooms';
    }

    const list = this.$.roomList;
    if (Array.isArray(this._roomRefs)) {
      for (const ref of this._roomRefs) clearTimeout(ref && ref.sliderTimer);
    }
    list.innerHTML = '';
    this._roomRefs = [];

    this._config.rooms.forEach((roomCfg, roomIndex) => {
      const h = window.TunetCardFoundation.escapeHtml;
      const card = document.createElement('div');
      card.className = 'room-card';

      let orbsHtml = '';
      for (const light of (roomCfg.lights || [])) {
        if (!light.entity) continue;
        orbsHtml += `
          <button class="room-orb" type="button" data-entity="${h(light.entity)}" title="${h(light.name || '')}">
            <span class="icon" style="font-size:16px">${normalizeIcon(light.icon || 'lightbulb')}</span>
          </button>
        `;
      }

      card.innerHTML = `
        <button class="room-icon" type="button" aria-label="Toggle ${h(roomCfg.name || 'room')} lights">
          <span class="icon" style="font-size:24px">${normalizeIcon(roomCfg.icon || 'home')}</span>
        </button>
        <div class="room-info">
          <div class="room-name">${h(roomCfg.name || 'Room')}</div>
          <div class="room-primary">--</div>
          <div class="room-secondary">--</div>
        </div>
        <span class="icon room-chevron" style="font-size:18px">chevron_right</span>
        <div class="room-controls">
          <div class="room-sub-controls">${orbsHtml}</div>
          <div class="room-slider-wrap hidden" id="room-slider-wrap-${roomIndex}">
            <span class="icon">tune</span>
            <input class="room-slider" type="range" min="0" max="100" step="1" value="50" data-entity="">
            <span class="room-slider-val">--</span>
          </div>
        </div>
      `;


      if (Array.isArray(roomCfg.chips) && roomCfg.chips.length) {
        const chipContainer = card.querySelector('.room-sub-controls');
        roomCfg.chips.forEach((chip, chipIndex) => {
          const chipBtn = document.createElement('button');
          chipBtn.type = 'button';
          chipBtn.className = 'room-orb room-chip';
          chipBtn.dataset.chipIndex = String(chipIndex);
          chipBtn.dataset.active = chip.active ? 'true' : 'false';
          chipBtn.disabled = chip.disabled === true;
          chipBtn.innerHTML = `<span class="icon" style="font-size:16px">${h(chip.icon || 'lightbulb')}</span>`;
          chipContainer.appendChild(chipBtn);
        });
      }
      const primaryEl = card.querySelector('.room-primary');
      const secondaryEl = card.querySelector('.room-secondary');
      const orbEls = Array.from(card.querySelectorAll('.room-orb[data-entity]'));
      const sliderWrap = card.querySelector(`#room-slider-wrap-${roomIndex}`);
      const sliderInput = sliderWrap.querySelector('.room-slider');
      const sliderValue = sliderWrap.querySelector('.room-slider-val');
      const roomIcon = card.querySelector('.room-icon');

      const ref = {
        el: card,
        cfg: roomCfg,
        primaryEl,
        secondaryEl,
        orbEls,
        chipEls: Array.from(card.querySelectorAll('.room-chip')),
        sliderWrap,
        sliderInput,
        sliderValue,
        sliderEntity: '',
        sliderTimer: null,
      };

      roomIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleRoomGroup(ref);
      });

      orbEls.forEach((orb) => {
        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          const entityId = orb.dataset.entity;
          if (!entityId || !this._hass) return;
          const entity = this._hass.states[entityId];
          const lightCfg = (roomCfg.lights || []).find((l) => l.entity === entityId);
          const allowSub = this._config.enable_sub_buttons && (!lightCfg || lightCfg.sub_button !== false);
          if (allowSub && this._openSubSlider(ref, entityId)) return;
          if (entity && entity.state === 'unavailable') return;
          this._toggleRoomLight(ref, entityId, orb);
        });
      });
      ref.chipEls.forEach((chipEl) => {
        chipEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const chipIndex = Number(chipEl.dataset.chipIndex);
          const chipCfg = roomCfg.chips && roomCfg.chips[chipIndex];
          if (!chipCfg || chipCfg.disabled) return;
          this._handleTapAction(chipCfg.tap_action);
        });
      });

      sliderInput.addEventListener('input', (e) => {
        const entityId = sliderInput.dataset.entity;
        if (!entityId) return;
        const pct = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        sliderValue.textContent = pct <= 0 ? 'Off' : `${pct}%`;
      });
      sliderInput.addEventListener('pointerdown', (e) => e.stopPropagation());
      sliderWrap.addEventListener('click', (e) => e.stopPropagation());

      sliderInput.addEventListener('change', (e) => {
        const entityId = sliderInput.dataset.entity;
        if (!entityId) return;
        const pct = Math.max(0, Math.min(100, Math.round(Number(e.target.value) || 0)));
        this._setRoomLightBrightness(ref, entityId, pct);
      });

      card.addEventListener('click', () => {
        const fallbackEntity = (roomCfg.lights || [])[0] && (roomCfg.lights || [])[0].entity
          ? (roomCfg.lights || [])[0].entity
          : '';
        this._handleTapAction(roomCfg.tap_action, fallbackEntity);
      });

      list.appendChild(card);
      this._roomRefs.push(ref);
    });
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

        const entity = this._hass.states[light.entity];
        if (!entity || entity.state === 'unavailable') {
          orb.classList.remove('on');
          orb.disabled = true;
          if (ref.sliderEntity === light.entity) this._closeSubSlider(ref);
          return;
        }

        orb.disabled = false;
        const isOn = entity && entity.state === 'on';
        if (!this._serviceCooldown[light.entity]) {
          orb.classList.toggle('on', isOn);
        }

        if (isOn) {
          onCount++;
          const b = entity.attributes.brightness;
          if (b != null) {
            totalBright += Math.round((b / 255) * 100);
            brightCount++;
          }
        }

        orb.dataset.dimmable = this._supportsBrightness(entity) ? 'true' : 'false';
      });

      // Room active state
      const anyOn = onCount > 0;
      ref.el.classList.toggle('active', anyOn);

      if (ref.sliderEntity) {
        const sliderEntity = this._hass.states[ref.sliderEntity];
        if (!sliderEntity || sliderEntity.state === 'unavailable') {
          this._closeSubSlider(ref);
        } else {
          const pct = this._brightnessPct(sliderEntity);
          ref.sliderInput.value = String(pct);
          ref.sliderValue.textContent = sliderEntity.state === 'on' ? `${pct}%` : 'Off';
        }
      }

      // Primary text
      let primaryText = ref.cfg.primary || '';
      if (!primaryText) {
        if (anyOn) {
          primaryText = onCount === lights.length ? 'On' : `${onCount} of ${lights.length} on`;
          if (brightCount > 0) primaryText += ` · ${Math.round(totalBright / brightCount)}%`;
        } else {
          primaryText = 'All off';
        }
      }

      // Secondary text
      let secondaryText = '';
      if (typeof ref.cfg.secondary === 'string' && ref.cfg.secondary) {
        secondaryText = ref.cfg.secondary;
      } else if (ref.cfg.secondary && typeof ref.cfg.secondary === 'object') {
        const secEntity = this._hass.states[ref.cfg.secondary.entity];
        if (!secEntity || secEntity.state === 'unavailable') {
          secondaryText = ref.cfg.secondary.fallback || '--';
        } else {
          const value = ref.cfg.secondary.attribute
            ? secEntity.attributes[ref.cfg.secondary.attribute]
            : secEntity.state;
          if (value == null || value === 'unknown' || value === 'unavailable') {
            secondaryText = ref.cfg.secondary.fallback || '--';
          } else {
            const renderedUnit = ref.cfg.secondary.unit || '';
            secondaryText = `${ref.cfg.secondary.prefix || ''}${value}${renderedUnit}${ref.cfg.secondary.suffix || ''}`;
          }
        }
      } else if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state) {
          const unit = tempEntity.attributes.unit_of_measurement || '°F';
          secondaryText = Math.round(Number(tempEntity.state)) + unit;
        }
      }

      if (ref.primaryEl) ref.primaryEl.textContent = primaryText || '--';
      if (ref.secondaryEl) ref.secondaryEl.textContent = secondaryText || '--';
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

if (!customElements.get('tunet-rooms-card')) {
  customElements.define('tunet-rooms-card', TunetRoomsCard);
}
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-rooms-card')) {
  window.customCards.push({
    type: 'tunet-rooms-card',
    name: 'Tunet Rooms Card',
    description: 'Glassmorphism room overview with per-room light group orbs',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-rooms-card',
  });
}

console.info(
  `%c TUNET-ROOMS-CARD %c v${ROOMS_CARD_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
