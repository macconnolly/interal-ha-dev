/**
 * Tunet Room Alt 2 Card
 * Horizontal row layout rooms card with per-light orbs and tap-to-dim
 * Glassmorphism design language, section container surface
 *
 * Features:
 *   - Full-width horizontal room rows (icon | name + status | orbs | chevron)
 *   - Per-light orbs: tap OFF light to toggle on, tap ON light to open inline dimmer
 *   - Inline brightness slider swaps into the row (icon + slider track + pct + close)
 *   - Short tap row to navigate, long-press to toggle all room lights
 *   - Room icon tap toggles all room lights
 *   - Temperature display in status line
 *   - Optimistic UI + cooldown on orb toggle
 *   - Pointer capture for dimmer slider (no document-level listeners)
 *   - Two-column desktop layout at >=600px
 *
 * Version 1.1.0
 */

const ROOM_ALT2_VERSION = '1.1.0';

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

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ROOM_ALT2_ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  floor_lamp: 'table_lamp',
  lamp: 'table_lamp',
  light_group: 'lightbulb',
};

const ROOM_ALT2_ALLOWED_ICONS = new Set([
  'home', 'weekend', 'kitchen', 'restaurant', 'bed', 'desk', 'desktop_windows',
  'lightbulb', 'light', 'lamp', 'highlight', 'view_column', 'nightlight', 'shelves',
  'chevron_right', 'meeting_room', 'living', 'bedroom_parent', 'bathroom', 'garage',
  'sensor_door', 'door_front', 'thermostat', 'brightness_5', 'brightness_7',
]);

function normalizeRoomAlt2Icon(icon) {
  return window.TunetCardFoundation.normalizeIcon(icon, {
    aliases: ROOM_ALT2_ICON_ALIASES,
    fallback: 'lightbulb',
  });
}

// ═══════════════════════════════════════════════════════════
// CSS Tokens + Shared Blocks + Card Styles
// ═══════════════════════════════════════════════════════════

const TUNET_ROOM_ALT2_STYLES = `
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
    --section-bg: rgba(255,255,255,0.35);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.10);
    --gray-ghost: rgba(0,0,0,0.03);
    color-scheme: light;
    display: block;
  }

  /* ── Tokens: Dark (Midnight Navy) ────────────────── */
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
    --section-bg: rgba(30,41,59,0.60);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.25);
    --gray-ghost: rgba(255,255,255,0.04);
    color-scheme: dark;
  }

  /* ── Reset ───────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Base Font ───────────────────────────────────── */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Icons: Material Symbols Rounded ─────────────── */
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

  /* ═══════════════════════════════════════════════════
     SECTION CONTAINER
     ═══════════════════════════════════════════════════ */
  .section-container {
    position: relative;
    border-radius: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* ── Section glass stroke (XOR mask) ────────────── */
  .section-container::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-section);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40), rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

  /* ═══════════════════════════════════════════════════
     SECTION HEADER
     ═══════════════════════════════════════════════════ */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 28px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.3px;
    color: var(--text-sub);
  }
  .section-title .icon { color: var(--amber); --ms-fill: 1; }

  /* ═══════════════════════════════════════════════════
     ROOM LIST (grid layout)
     ═══════════════════════════════════════════════════ */
  .room-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }

  /* ═══════════════════════════════════════════════════
     ROOM ROW
     ═══════════════════════════════════════════════════ */
  .room-row {
    min-height: 72px;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    display: flex;
    align-items: center;
    padding: 0 14px;
    gap: 12px;
    cursor: pointer;
    transition: all .15s;
    position: relative;
    overflow: hidden;
  }

  /* ── Glass stroke (XOR mask) ──────────────────── */
  .room-row::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(
      160deg,
      rgba(255,255,255,0.50),
      rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%,
      rgba(255,255,255,0.20)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .room-row::before {
    background: linear-gradient(
      160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08)
    );
  }

  .room-row.active {
    border-color: var(--amber-border);
  }

  @media (hover: hover) {
    .room-row:hover {
      box-shadow: var(--shadow-up), var(--inset);
    }
  }
  .room-row:active {
    transform: scale(0.985);
  }

  /* ═══════════════════════════════════════════════════
     ROOM ICON
     ═══════════════════════════════════════════════════ */
  .room-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: all .15s;
    background: var(--gray-ghost);
    color: var(--text-muted);
    border: 1px solid transparent;
    cursor: pointer;
  }
  .room-row.active .room-icon {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .room-row.active .room-icon .icon { --ms-fill: 1; }

  /* ═══════════════════════════════════════════════════
     ROOM INFO
     ═══════════════════════════════════════════════════ */
  .room-info {
    flex: 1;
    min-width: 0;
  }
  .room-name {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .room-status {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--text-muted);
    margin-top: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .room-status .amber-txt { color: var(--amber); }

  /* ═══════════════════════════════════════════════════
     LIGHT ORBS
     ═══════════════════════════════════════════════════ */
  .room-orbs {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .room-orb {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    cursor: pointer;
    background: var(--gray-ghost);
    color: var(--text-muted);
    border: 1px solid transparent;
    transition: all .15s;
    position: relative;
    z-index: 1;
  }
  .room-orb .icon { font-size: 16px; width: 16px; height: 16px; }
  .room-orb.on {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .room-orb.on .icon { --ms-fill: 1; }

  @media (hover: hover) {
    .room-orb:hover { background: var(--track-bg); }
    .room-orb.on:hover { background: var(--amber-fill); }
  }
  .room-orb:active { transform: scale(0.92); }

  /* ═══════════════════════════════════════════════════
     CHEVRON
     ═══════════════════════════════════════════════════ */
  .room-chevron {
    color: var(--text-muted);
    flex-shrink: 0;
    cursor: pointer;
    display: grid;
    place-items: center;
    position: relative;
    z-index: 1;
  }

  /* ═══════════════════════════════════════════════════
     DIMMER OVERLAY (inline row swap)
     ═══════════════════════════════════════════════════ */
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

  /* ═══════════════════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════════════════ */
  @media (max-width: 440px) {
    .section-container { padding: 16px; border-radius: 28px; }
    .room-row { padding: 0 10px; gap: 8px; min-height: 64px; }
    .room-icon { width: 38px; height: 38px; border-radius: 10px; }
    .room-orb { width: 30px; height: 30px; border-radius: 8px; }
    .room-orb .icon { font-size: 14px; width: 14px; height: 14px; }
    .room-name { font-size: 13px; }
    .room-status { font-size: 10.5px; }
  }

  /* ── Two-column desktop ─────────────────────────── */
  @media (min-width: 600px) {
    .room-list { grid-template-columns: 1fr 1fr; }
  }

  /* ── Reduced Motion ──────────────────────────────── */
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

const ROOM_ALT2_FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">
`;

// ═══════════════════════════════════════════════════════════
// Card Class
// ═══════════════════════════════════════════════════════════

class TunetRoomAlt2Card extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._roomRefs = [];
    this._activeDimmer = null; // { roomIdx, lightIdx, entity }
    this._dimDragging = false;
    this._dimDebounce = null;
    this._serviceCooldown = {};
    this._cooldownTimers = {};

    TunetRoomAlt2Card._injectFonts();
  }

  /* ── Font Injection (V1 pattern) ──────────────────── */

  static _injectFonts() {
    if (TunetRoomAlt2Card._fontsInjected) return;
    TunetRoomAlt2Card._fontsInjected = true;
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

  /* ── Config ──────────────────────────────────────── */

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
      ],
      computeLabel: (s) => ({
        name: 'Card Name',
      }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return {
      name: 'Rooms',
      rooms: [],
    };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Rooms',
      rooms: Array.isArray(config.rooms) ? config.rooms : [],
    };

    if (this._rendered) {
      this._buildRows();
      this._updateAll();
    }
  }

  /* ── HA State ────────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._rendered = true;
      this._buildRows();
    }

    // Dark mode toggle
    const isDark = !!(hass && hass.themes && hass.themes.darkMode);
    this.classList.toggle('dark', isDark);

    // Change detection: check all relevant entities
    let changed = !oldHass;
    if (!changed) {
      for (const room of this._config.rooms) {
        if (room.temperature_entity && oldHass.states[room.temperature_entity] !== hass.states[room.temperature_entity]) {
          changed = true; break;
        }
        for (const lt of (room.lights || [])) {
          if (oldHass.states[lt.entity] !== hass.states[lt.entity]) {
            changed = true; break;
          }
        }
        if (changed) break;
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    return 1 + (this._config.rooms || []).length;
  }

  /* ── Lifecycle ───────────────────────────────────── */

  connectedCallback() {}

  disconnectedCallback() {
    clearTimeout(this._dimDebounce);
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
  }

  /* ── Rendering ───────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOM_ALT2_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = `
      ${ROOM_ALT2_FONT_LINKS}
      <div class="card-wrap">
        <div class="section-container" id="section">
          <div class="section-header">
            <div class="section-title">
              <span class="icon icon-18 filled">meeting_room</span>
              <span id="sectionTitle">Rooms</span>
            </div>
          </div>
          <div class="room-list" id="roomList"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._$section = this.shadowRoot.getElementById('section');
    this._$roomList = this.shadowRoot.getElementById('roomList');
    this._$sectionTitle = this.shadowRoot.getElementById('sectionTitle');
  }

  /* ── Build Room Rows ─────────────────────────────── */

  _buildRows() {
    const list = this._$roomList;
    if (!list) return;
    list.innerHTML = '';
    this._roomRefs = [];
    this._activeDimmer = null;

    this._$sectionTitle.textContent = this._config.name;

    const rooms = this._config.rooms || [];

    for (let ri = 0; ri < rooms.length; ri++) {
      const roomCfg = rooms[ri];
      const lights = roomCfg.lights || [];

      // Room row container
      const row = document.createElement('div');
      row.className = 'room-row';

      // Room icon
      const iconWrap = document.createElement('div');
      iconWrap.className = 'room-icon';
      iconWrap.style.cursor = 'pointer';
      const iconEl = document.createElement('span');
      iconEl.className = 'icon icon-20';
      iconEl.textContent = normalizeRoomAlt2Icon(roomCfg.icon);
      iconWrap.appendChild(iconEl);
      row.appendChild(iconWrap);

      // [4] Room icon tap toggles all room lights
      iconWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleAllRoomLights(roomCfg);
        iconWrap.style.transform = 'scale(0.92)';
        setTimeout(() => { iconWrap.style.transform = ''; }, 120);
      });

      // Room info
      const info = document.createElement('div');
      info.className = 'room-info';
      const nameEl = document.createElement('div');
      nameEl.className = 'room-name';
      nameEl.textContent = roomCfg.name || 'Room';
      info.appendChild(nameEl);
      const statusEl = document.createElement('div');
      statusEl.className = 'room-status';
      statusEl.textContent = 'Loading...';
      info.appendChild(statusEl);
      row.appendChild(info);

      // Light orbs
      const orbsWrap = document.createElement('div');
      orbsWrap.className = 'room-orbs';
      const orbRefs = [];

      for (let li = 0; li < lights.length; li++) {
        const ltCfg = lights[li];
        const orb = document.createElement('div');
        orb.className = 'room-orb';
        orb.title = ltCfg.name || ltCfg.entity;
        orb.setAttribute('role', 'button');
        orb.setAttribute('tabindex', '0');
        orb.setAttribute('aria-label', ltCfg.name || ltCfg.entity);
        const orbIcon = document.createElement('span');
        orbIcon.className = 'icon icon-16';
        orbIcon.textContent = normalizeRoomAlt2Icon(ltCfg.icon);
        orb.appendChild(orbIcon);

        // Capture indices for closure
        const roomIdx = ri;
        const lightIdx = li;
        orb.addEventListener('click', (e) => {
          e.stopPropagation();
          this._onOrbTap(roomIdx, lightIdx);
        });
        orb.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            this._onOrbTap(roomIdx, lightIdx);
          }
        });

        orbsWrap.appendChild(orb);
        orbRefs.push({ el: orb, iconEl: orbIcon });
      }
      row.appendChild(orbsWrap);

      // Chevron
      const chevron = document.createElement('div');
      chevron.className = 'room-chevron';
      chevron.setAttribute('role', 'button');
      chevron.setAttribute('tabindex', '0');
      chevron.setAttribute('aria-label', `Navigate to ${roomCfg.name || 'room'}`);
      const chevronIcon = document.createElement('span');
      chevronIcon.className = 'icon icon-18';
      chevronIcon.textContent = 'chevron_right';
      chevron.appendChild(chevronIcon);
      chevron.addEventListener('click', (e) => {
        e.stopPropagation();
        this._onRowNavigate(ri);
      });
      row.appendChild(chevron);

      // Dimmer overlay layer
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

      row.appendChild(dimmer);

      // [3] Long-press to toggle all, short tap to navigate
      let pressTimer = null;
      let didLongPress = false;

      row.addEventListener('pointerdown', (e) => {
        if (e.target.closest('.room-orb') || e.target.closest('.room-chevron') || e.target.closest('.dimmer-layer') || e.target.closest('.room-icon')) return;
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          this._toggleAllRoomLights(roomCfg);
          row.style.transform = 'scale(0.97)';
          setTimeout(() => { row.style.transform = ''; }, 120);
        }, 400);
      });

      row.addEventListener('pointerup', (e) => {
        clearTimeout(pressTimer);
        if (didLongPress) return;
        if (e.target.closest('.room-orb') || e.target.closest('.room-chevron') || e.target.closest('.dimmer-layer') || e.target.closest('.room-icon')) return;
        this._onRowNavigate(ri);
      });

      row.addEventListener('pointercancel', () => {
        clearTimeout(pressTimer);
        didLongPress = false;
      });

      row.addEventListener('pointerleave', () => {
        clearTimeout(pressTimer);
      });

      row.addEventListener('contextmenu', (e) => e.preventDefault());

      // [7] Dimmer track pointer events — pointer capture pattern
      dimTrack.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._dimDragging = true;
        this._dimTrackEl = dimTrack;
        dimTrack.setPointerCapture(e.pointerId);
        const refs = this._roomRefs[ri];
        if (refs) refs.dimThumb.classList.add('active');
        this._applyDimmerFromEvent(e);
      });

      dimTrack.addEventListener('pointermove', (e) => {
        if (!this._dimDragging || !this._activeDimmer) return;
        e.preventDefault();
        this._applyDimmerFromEvent(e);
      });

      dimTrack.addEventListener('pointerup', () => {
        if (!this._dimDragging) return;
        this._dimDragging = false;
        const refs = this._activeDimmer && this._roomRefs[this._activeDimmer.roomIdx];
        if (refs) refs.dimThumb.classList.remove('active');
      });

      dimTrack.addEventListener('lostpointercapture', () => {
        this._dimDragging = false;
        const refs = this._activeDimmer && this._roomRefs[this._activeDimmer.roomIdx];
        if (refs) refs.dimThumb.classList.remove('active');
      });

      list.appendChild(row);

      this._roomRefs.push({
        row,
        iconWrap,
        nameEl,
        statusEl,
        orbRefs,
        dimmer,
        dimFill,
        dimThumb,
        dimPct,
        dimTrack,
        dimIconSpan,
      });
    }
  }

  /* ── Orb Tap ─────────────────────────────────────── */

  _onOrbTap(roomIdx, lightIdx) {
    const roomCfg = this._config.rooms[roomIdx];
    if (!roomCfg) return;
    const ltCfg = roomCfg.lights[lightIdx];
    if (!ltCfg) return;
    const entity = ltCfg.entity;
    const state = this._hass && this._hass.states[entity];
    const isOn = state && state.state === 'on';

    if (isOn) {
      // Open dimmer for this light
      this._openDimmer(roomIdx, lightIdx, entity);
    } else {
      // [5] Optimistic UI + cooldown for toggle-on
      const orbRef = this._roomRefs[roomIdx]?.orbRefs[lightIdx];
      if (orbRef) orbRef.el.classList.add('on');

      window.TunetCardFoundation.callServiceSafe(this._hass, 'light', 'toggle',
        { entity_id: entity }, {
          pendingEl: orbRef?.el,
          onError: () => { if (orbRef) orbRef.el.classList.remove('on'); },
        }
      );

      // Cooldown — prevent HA state from reverting optimistic UI
      this._serviceCooldown[entity] = true;
      clearTimeout(this._cooldownTimers[entity]);
      this._cooldownTimers[entity] = setTimeout(() => {
        this._serviceCooldown[entity] = false;
      }, 1500);
    }
  }

  /* ── Toggle All Room Lights ──────────────────────── */

  _toggleAllRoomLights(roomCfg) {
    if (!this._hass) return;
    const entities = (roomCfg.lights || []).map(l => l.entity).filter(Boolean);
    if (!entities.length) return;
    const anyOn = entities.some(eid => {
      const state = this._hass.states[eid];
      return state && state.state === 'on';
    });
    window.TunetCardFoundation.callServiceSafe(this._hass, 'light', anyOn ? 'turn_off' : 'turn_on', {
      entity_id: entities,
    });
  }

  /* ── Dimmer Open / Close ─────────────────────────── */

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
    refs.dimIconSpan.textContent = normalizeRoomAlt2Icon(ltCfg.icon);

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

  /* ── Dimmer Pointer Handling ─────────────────────── */

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

  /* ── Row Navigate ────────────────────────────────── */

  _onRowNavigate(roomIdx) {
    const roomCfg = this._config.rooms[roomIdx];
    if (!roomCfg) return;

    if (roomCfg.navigate_path) {
      history.pushState(null, '', roomCfg.navigate_path);
      this.dispatchEvent(new CustomEvent('location-changed', {
        bubbles: true, composed: true,
      }));
    } else {
      // Fall back to more-info for first light
      const firstLight = (roomCfg.lights || [])[0];
      if (firstLight) {
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: firstLight.entity },
        }));
      }
    }
  }

  /* ── Full Update ─────────────────────────────────── */

  _updateAll() {
    if (!this._hass || !this._roomRefs.length) return;
    const rooms = this._config.rooms || [];

    for (let ri = 0; ri < rooms.length; ri++) {
      const roomCfg = rooms[ri];
      const refs = this._roomRefs[ri];
      if (!refs) continue;

      const lights = roomCfg.lights || [];
      let onCount = 0;
      let totalBrt = 0;
      let brtCount = 0;

      for (let li = 0; li < lights.length; li++) {
        const ltCfg = lights[li];
        const state = this._hass.states[ltCfg.entity];
        const isOn = state && state.state === 'on';

        if (isOn) {
          onCount++;
          const brt = state.attributes.brightness;
          if (brt != null) {
            totalBrt += Math.round(brt / 2.55);
            brtCount++;
          }
        }

        // [5] Skip orb state update during cooldown
        if (this._serviceCooldown[ltCfg.entity]) continue;

        // Update orb state
        const orbRef = refs.orbRefs[li];
        if (orbRef) {
          orbRef.el.classList.toggle('on', isOn);
        }
      }

      const totalLights = lights.length;
      const anyOn = onCount > 0;
      refs.row.classList.toggle('active', anyOn);

      // Build status line
      let statusHtml = '';
      const avgBrt = brtCount > 0 ? Math.round(totalBrt / brtCount) : 0;

      // Temperature
      let tempStr = '';
      if (roomCfg.temperature_entity) {
        const tempState = this._hass.states[roomCfg.temperature_entity];
        if (tempState && tempState.state !== 'unknown' && tempState.state !== 'unavailable') {
          tempStr = Math.round(Number(tempState.state)) + '\u00B0F';
        }
      }

      if (onCount === 0) {
        statusHtml = 'Off';
        if (tempStr) statusHtml += ' \u00B7 ' + tempStr;
      } else if (onCount === totalLights) {
        statusHtml = '<span class="amber-txt">On</span>';
        if (brtCount > 0) statusHtml += ' \u00B7 ' + avgBrt + '%';
        if (tempStr) statusHtml += ' \u00B7 ' + tempStr;
      } else {
        statusHtml = '<span class="amber-txt">' + onCount + ' of ' + totalLights + ' on</span>';
        if (brtCount > 0) statusHtml += ' \u00B7 ' + avgBrt + '%';
        if (tempStr) statusHtml += ' \u00B7 ' + tempStr;
      }

      refs.statusEl.innerHTML = statusHtml;

      // Update dimmer if active for this room
      if (this._activeDimmer && this._activeDimmer.roomIdx === ri && !this._dimDragging) {
        const dimEntity = this._activeDimmer.entity;
        const dimState = this._hass.states[dimEntity];
        if (dimState && dimState.state === 'on') {
          const brt = Math.round((dimState.attributes.brightness || 0) / 2.55);
          refs.dimFill.style.width = brt + '%';
          refs.dimThumb.style.left = brt + '%';
          refs.dimPct.textContent = brt + '%';
        } else if (dimState && dimState.state !== 'on') {
          // Light turned off, close dimmer
          this._closeDimmer();
        }
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration (V1 pattern)
// ═══════════════════════════════════════════════════════════

if (!customElements.get('tunet-room-alt-2-card')) {
  customElements.define('tunet-room-alt-2-card', TunetRoomAlt2Card);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-room-alt-2-card')) {
  window.customCards.push({
    type: 'tunet-room-alt-2-card',
    name: 'Tunet Room Alt 2 Card',
    description: 'Horizontal row rooms card with per-light orbs and tap-to-dim brightness slider',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-room-alt-2-card',
  });
}

console.info(
  `%c TUNET-ROOM-ALT-2 %c v${ROOM_ALT2_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #D4850A20; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
