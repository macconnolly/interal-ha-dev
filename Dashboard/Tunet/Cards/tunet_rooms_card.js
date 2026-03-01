/**
 * Tunet Rooms Card
 * Compact square-tile room grid with per-light sub-button dimmers
 * Glassmorphism design language, section container surface
 *
 * Features:
 *   - Auto-fill grid of compact square room tiles
 *   - Tap tile → navigate to room; long-press (400ms) → toggle all lights
 *   - Per-light sub-button icons below room name
 *   - Tap sub-button → inline brightness slider (dimming mode)
 *   - Drag-to-dim with debounced service calls
 *   - Temperature display, active indicator dot
 *
 * Version 3.0.0
 */

const ROOMS_CARD_VERSION = '3.0.0';

// ═══════════════════════════════════════════════════════════
// Shared Foundation (idempotent)
// ═══════════════════════════════════════════════════════════

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
      try {
        const result = hass.callService(domain, service, data || {});
        if (result && typeof result.then === 'function') await result;
        return true;
      } catch (error) {
        console.error(`[Tunet] callService failed: ${domain}.${service}`, error);
        if (typeof options.onError === 'function') options.onError(error);
        return false;
      }
    },
  };
}

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'table_lamp',
  lamp: 'table_lamp',
  light_group: 'lightbulb',
};

const ROOM_ICON_FALLBACKS = new Set([
  'home', 'weekend', 'kitchen', 'restaurant', 'bed', 'desk', 'desktop_windows',
  'lightbulb', 'light', 'lamp', 'highlight', 'view_column', 'nightlight', 'shelves',
  'chevron_right',
]);

function normalizeIcon(icon) {
  return window.TunetCardFoundation.normalizeIcon(icon, {
    aliases: ICON_ALIASES,
    fallback: 'lightbulb',
  });
}

// ═══════════════════════════════════════════════════════════
// CSS Tokens + Shared Blocks + Card Styles
// ═══════════════════════════════════════════════════════════

const TUNET_ROOMS_STYLES = `
  /* ── Tokens: Light (climate card authoritative) ──── */
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
    --tile-bg: rgba(255,255,255,0.92);
    --tile-bg-off: rgba(28,28,30,0.04);
    --gray-ghost: rgba(0,0,0,0.03);
    --border-ghost: transparent;
    --section-bg: rgba(255,255,255,0.45);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.10);
    color-scheme: light;
    display: block;
    font-size: 16px;
  }

  /* ── Tokens: Dark (Midnight Navy) ──────────────── */
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
    --tile-bg: rgba(30,41,59,0.90);
    --tile-bg-off: rgba(255,255,255,0.04);
    --gray-ghost: rgba(255,255,255,0.04);
    --border-ghost: rgba(255,255,255,0.05);
    --section-bg: rgba(30,41,59,0.60);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.25);
    color-scheme: dark;
  }

  /* ── Reset ─────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Base Font ─────────────────────────────────── */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Icons: Material Symbols Rounded ───────────── */
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
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-28 { font-size: 28px; width: 28px; height: 28px; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }

  /* ── Section Container Surface ─────────────────── */
  .section-container {
    border-radius: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 1em;
    width: 100%;
    position: relative;
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

  /* ══════════════════════════════════════════════════
     Card-Specific Styles
     ══════════════════════════════════════════════════ */

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
    grid-template-columns: repeat(auto-fill, minmax(6em, 1fr));
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
    gap: 0.15em;
    padding: 0.35em 0.25em 0.3em;
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
    width: 1.75em; height: 1.75em;
    display: grid; place-items: center;
    border-radius: 0.5em;
    transition: all 0.18s;
    flex-shrink: 0;
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
    font-size: 1.125em; width: 1.125em; height: 1.125em;
  }

  /* -- Room name -- */
  .room-tile-name {
    font-size: 0.5625em;
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
    font-size: 0.4375em;
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

  /* ══════════════════════════════════════════════════
     Sub-Button Row (per-light icons)
     ══════════════════════════════════════════════════ */

  .room-subs {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2em;
    flex-wrap: wrap;
    max-width: 100%;
    margin-top: 0.05em;
  }

  .room-sub-btn {
    width: 1.375em; height: 1.375em;
    border-radius: 0.375em;
    display: grid; place-items: center;
    cursor: pointer;
    border: none;
    padding: 0;
    font: inherit;
    transition: all 0.15s ease;
    flex-shrink: 0;
    background: var(--gray-ghost);
    color: var(--text-muted);
    -webkit-tap-highlight-color: transparent;
  }
  .room-sub-btn:hover {
    background: var(--track-bg);
  }
  .room-sub-btn:active {
    transform: scale(0.88);
  }
  .room-sub-btn.on {
    background: var(--amber-fill);
    color: var(--amber);
    border: 1px solid var(--amber-border);
  }
  .room-sub-btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .room-sub-btn .icon {
    font-size: 0.75em; width: 0.75em; height: 0.75em;
  }

  /* ══════════════════════════════════════════════════
     Dimming Mode (brightness slider overlay)
     ══════════════════════════════════════════════════ */

  .room-dim-row {
    display: none;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25em;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    padding: 0.4em;
    z-index: 1;
  }
  .room-tile.dimming .room-dim-row { display: flex; }
  .room-tile.dimming .room-tile-icon,
  .room-tile.dimming .room-tile-name,
  .room-tile.dimming .room-tile-status,
  .room-tile.dimming .room-tile-dot,
  .room-tile.dimming .room-subs { opacity: 0; pointer-events: none; }

  .dim-name {
    font-size: 0.5em;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    text-align: center;
    line-height: 1.2;
  }

  .dim-track {
    width: 100%;
    height: 6px;
    background: var(--track-bg);
    border-radius: var(--r-pill);
    overflow: hidden;
    cursor: pointer;
    touch-action: none;
    position: relative;
  }
  .dim-fill {
    height: 100%;
    background: var(--amber);
    border-radius: var(--r-pill);
    transition: width 0.06s ease-out;
    pointer-events: none;
  }

  .dim-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 0.2em;
  }

  .dim-pct {
    font-size: 0.5em;
    font-weight: 700;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    min-width: 2em;
  }
  .dim-pct.on {
    color: var(--amber);
  }

  .dim-close {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: var(--text-muted);
    display: grid;
    place-items: center;
    width: 1em; height: 1em;
    border-radius: 0.25em;
    transition: color 0.12s, background 0.12s;
    -webkit-tap-highlight-color: transparent;
  }
  .dim-close:hover { color: var(--text); background: var(--track-bg); }

  /* -- Responsive -- */
  @media (min-width: 500px) {
    .room-grid {
      grid-template-columns: repeat(auto-fill, minmax(7em, 1fr));
    }
  }
  @media (max-width: 440px) {
    :host { font-size: 16px; }
    .room-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5em;
    }
  }

  /* -- Reduced Motion -- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;

// ═══════════════════════════════════════════════════════════
// Font Links (shadow DOM injection)
// ═══════════════════════════════════════════════════════════

const FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
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

    // Dimming state
    this._dimTarget = null; // { roomIdx, lightIdx, entity }
    this._dimDragging = false;
    this._dimDebounce = null;
    this._dimLastCall = 0;

    TunetRoomsCard._injectFonts();
  }

  /* ── Font Injection (V1 pattern) ─────────────────── */

  static _injectFonts() {
    if (TunetRoomsCard._fontsInjected) return;
    TunetRoomsCard._fontsInjected = true;

    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200&display=swap' },
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

  /* ── Config ─────────────────────────────────────── */

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
      columns: config.columns || 0,
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
      this._closeDim();
      this._buildTiles();
      this._updateAll();
    }
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._buildTiles();
      this._rendered = true;
    }

    // Inline dark mode detection + class toggle
    const isDark = !!(hass && hass.themes && hass.themes.darkMode);
    this.classList.toggle('dark', isDark);

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
    const rows = Math.ceil(roomCount / 4);
    return Math.max(2, rows + 1);
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    this._onDimPointerMove = this._onDimPointerMove.bind(this);
    this._onDimPointerUp = this._onDimPointerUp.bind(this);
    document.addEventListener('pointermove', this._onDimPointerMove);
    document.addEventListener('pointerup', this._onDimPointerUp);
    document.addEventListener('pointercancel', this._onDimPointerUp);
  }

  disconnectedCallback() {
    clearTimeout(this._longPressTimer);
    clearTimeout(this._dimDebounce);
    document.removeEventListener('pointermove', this._onDimPointerMove);
    document.removeEventListener('pointerup', this._onDimPointerUp);
    document.removeEventListener('pointercancel', this._onDimPointerUp);
  }

  /* ── Rendering ──────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOMS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      roomGrid: this.shadowRoot.getElementById('roomGrid'),
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
    };
  }

  /* ── Build Tiles ────────────────────────────────── */

  _buildTiles() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const grid = this.$.roomGrid;
    grid.innerHTML = '';
    this._tileRefs = [];

    // Apply columns config if set
    const cols = parseInt(this._config.columns, 10);
    if (cols > 0) {
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    } else {
      grid.style.gridTemplateColumns = '';
    }
    const h = window.TunetCardFoundation.escapeHtml;

    this._config.rooms.forEach((roomCfg, roomIdx) => {
      const tile = document.createElement('div');
      tile.className = 'room-tile';
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', roomCfg.name);

      // Build sub-button HTML
      let subsHtml = '';
      for (let li = 0; li < roomCfg.lights.length; li++) {
        const light = roomCfg.lights[li];
        if (!light.entity) continue;
        subsHtml += `<button class="room-sub-btn" type="button"
          data-room="${roomIdx}" data-light="${li}" data-entity="${h(light.entity)}"
          title="${h(light.name || '')}">
          <span class="icon">${normalizeIcon(light.icon)}</span>
        </button>`;
      }

      tile.innerHTML = `
        <div class="room-tile-dot"></div>
        <div class="room-tile-icon">
          <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
        </div>
        <span class="room-tile-name">${h(roomCfg.name)}</span>
        <span class="room-tile-status">--</span>
        <div class="room-subs">${subsHtml}</div>
        <div class="room-dim-row">
          <span class="dim-name"></span>
          <div class="dim-track">
            <div class="dim-fill" style="width:0%"></div>
          </div>
          <div class="dim-footer">
            <span class="dim-pct">0%</span>
            <button class="dim-close" type="button" aria-label="Close dimmer"><span class="icon" style="font-size:0.75em">close</span></button>
          </div>
        </div>
      `;

      const statusEl = tile.querySelector('.room-tile-status');
      const subBtns = Array.from(tile.querySelectorAll('.room-sub-btn'));
      const dimRow = tile.querySelector('.room-dim-row');
      const dimName = tile.querySelector('.dim-name');
      const dimTrack = tile.querySelector('.dim-track');
      const dimFill = tile.querySelector('.dim-fill');
      const dimPct = tile.querySelector('.dim-pct');
      const dimClose = tile.querySelector('.dim-close');

      // ── Tile tap / long-press ──
      let pressTimer = null;
      let didLongPress = false;

      const onPointerDown = (e) => {
        // Ignore if the target is a sub-button or dim control
        if (e.target.closest('.room-sub-btn') || e.target.closest('.room-dim-row')) return;
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          this._toggleRoomGroup(roomCfg);
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);
      };

      const onPointerUp = (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        if (e.target.closest('.room-sub-btn') || e.target.closest('.room-dim-row')) return;
        // Short tap => navigate
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
      tile.addEventListener('contextmenu', (e) => e.preventDefault());

      // Keyboard
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPointerUp(e);
        }
      });

      // ── Sub-button tap → open dimmer ──
      for (const btn of subBtns) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const ri = parseInt(btn.dataset.room, 10);
          const li = parseInt(btn.dataset.light, 10);
          const entity = btn.dataset.entity;
          this._openDim(ri, li, entity);
        });
        btn.addEventListener('pointerdown', (e) => e.stopPropagation());
      }

      // ── Dim track pointer → drag ──
      dimTrack.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!this._dimTarget) return;
        this._dimDragging = true;
        dimTrack.setPointerCapture(e.pointerId);
        this._applyDimFromPointer(e, dimTrack, dimFill, dimPct);
      });

      // ── Dim close button ──
      dimClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this._closeDim();
      });
      dimClose.addEventListener('pointerdown', (e) => e.stopPropagation());

      grid.appendChild(tile);
      this._tileRefs.push({
        el: tile,
        cfg: roomCfg,
        roomIdx,
        statusEl,
        subBtns,
        dimRow,
        dimName,
        dimTrack,
        dimFill,
        dimPct,
        dimClose,
      });
    });
  }

  /* ── Room Group Toggle ──────────────────────────── */

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
    window.TunetCardFoundation.callServiceSafe(this, 'light', service, { entity_id: entityIds }, {
      onError: () => this._updateAll(),
    });
  }

  /* ── Dimming Mode ───────────────────────────────── */

  _openDim(roomIdx, lightIdx, entity) {
    // If already dimming this exact light, close it
    if (this._dimTarget && this._dimTarget.entity === entity) {
      this._closeDim();
      return;
    }

    // Close any existing dim first
    this._closeDim();

    const ref = this._tileRefs[roomIdx];
    if (!ref) return;
    const lightCfg = ref.cfg.lights[lightIdx];
    if (!lightCfg) return;

    this._dimTarget = { roomIdx, lightIdx, entity };

    // Set dim name
    ref.dimName.textContent = lightCfg.name || entity.split('.').pop().replace(/_/g, ' ');

    // Set current brightness
    const stateObj = this._hass && this._hass.states[entity];
    const isOn = stateObj && stateObj.state === 'on';
    const brt = isOn && stateObj.attributes.brightness != null
      ? Math.max(1, Math.min(100, Math.round((stateObj.attributes.brightness / 255) * 100)))
      : (isOn ? 100 : 0);

    ref.dimFill.style.width = brt + '%';
    ref.dimPct.textContent = brt + '%';
    ref.dimPct.classList.toggle('on', isOn);

    // Activate dimming mode on tile
    ref.el.classList.add('dimming');
  }

  _closeDim() {
    if (!this._dimTarget) return;
    const ref = this._tileRefs[this._dimTarget.roomIdx];
    if (ref) {
      ref.el.classList.remove('dimming');
    }
    this._dimTarget = null;
    this._dimDragging = false;
    clearTimeout(this._dimDebounce);
  }

  _applyDimFromPointer(e, trackEl, fillEl, pctEl) {
    const rect = trackEl.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = Math.round((x / rect.width) * 100);

    // Optimistic UI
    fillEl.style.width = pct + '%';
    pctEl.textContent = pct + '%';
    pctEl.classList.toggle('on', pct > 0);

    // Debounced service call (200ms cooldown)
    const now = Date.now();
    clearTimeout(this._dimDebounce);

    if (now - this._dimLastCall >= 200) {
      this._dimLastCall = now;
      this._sendDimBrightness(pct);
    } else {
      this._dimDebounce = setTimeout(() => {
        this._dimLastCall = Date.now();
        this._sendDimBrightness(pct);
      }, 200 - (now - this._dimLastCall));
    }
  }

  _sendDimBrightness(pct) {
    if (!this._dimTarget || !this._hass) return;
    const entity = this._dimTarget.entity;

    if (pct <= 0) {
      window.TunetCardFoundation.callServiceSafe(this, 'light', 'turn_off', { entity_id: entity });
    } else {
      window.TunetCardFoundation.callServiceSafe(this, 'light', 'turn_on', {
        entity_id: entity,
        brightness: Math.round((pct / 100) * 255),
      });
    }
  }

  _onDimPointerMove(e) {
    if (!this._dimDragging || !this._dimTarget) return;
    const ref = this._tileRefs[this._dimTarget.roomIdx];
    if (!ref) return;
    this._applyDimFromPointer(e, ref.dimTrack, ref.dimFill, ref.dimPct);
  }

  _onDimPointerUp(e) {
    if (!this._dimDragging) return;
    this._dimDragging = false;

    // Send final brightness
    if (this._dimTarget) {
      const ref = this._tileRefs[this._dimTarget.roomIdx];
      if (ref) {
        const rect = ref.dimTrack.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = Math.round((x / rect.width) * 100);
        clearTimeout(this._dimDebounce);
        this._sendDimBrightness(pct);
      }
    }
  }

  /* ── Full Update ────────────────────────────────── */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    for (const ref of this._tileRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;

      // Update sub-button states
      for (let i = 0; i < ref.subBtns.length; i++) {
        const btn = ref.subBtns[i];
        const entityId = btn.dataset.entity;
        if (!entityId) continue;
        const entity = this._hass.states[entityId];
        const isOn = entity && entity.state === 'on';
        btn.classList.toggle('on', isOn);
        if (isOn) onCount++;
      }

      // Also count lights without sub-buttons (entities without buttons)
      for (const light of lights) {
        if (!light.entity) continue;
        const entity = this._hass.states[light.entity];
        if (entity && entity.state === 'on') {
          // Only count if not already counted by sub-buttons
          const alreadyCounted = ref.subBtns.some(btn => btn.dataset.entity === light.entity);
          if (!alreadyCounted) onCount++;
        }
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
          const unit = tempEntity.attributes.unit_of_measurement || '\u00b0F';
          parts.push(`<span class="temp">${Math.round(Number(tempEntity.state))}${unit}</span>`);
        }
      }

      ref.statusEl.innerHTML = parts.join(' \u00b7 ');

      // Update dim slider if active for this room
      if (this._dimTarget && this._dimTarget.roomIdx === ref.roomIdx && !this._dimDragging) {
        const dimEntity = this._hass.states[this._dimTarget.entity];
        const isOn = dimEntity && dimEntity.state === 'on';
        const brt = isOn && dimEntity.attributes.brightness != null
          ? Math.max(1, Math.min(100, Math.round((dimEntity.attributes.brightness / 255) * 100)))
          : (isOn ? 100 : 0);
        ref.dimFill.style.width = brt + '%';
        ref.dimPct.textContent = brt + '%';
        ref.dimPct.classList.toggle('on', isOn);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration (V1 pattern)
// ═══════════════════════════════════════════════════════════

if (!customElements.get('tunet-rooms-card')) {
  customElements.define('tunet-rooms-card', TunetRoomsCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-rooms-card')) {
  window.customCards.push({
    type: 'tunet-rooms-card',
    name: 'Tunet Rooms Card',
    description: 'Compact room grid with per-light sub-button dimmers and glassmorphism design',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-rooms-card',
  });
}

console.info(
  `%c TUNET-ROOMS %c v${ROOMS_CARD_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #D4850A20; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
