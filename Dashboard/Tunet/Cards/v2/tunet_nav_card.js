/**
 * Tunet Nav Card (v2 – ES Module)
 * Persistent navigation chrome: bottom dock (mobile) + left rail (desktop)
 * POC: 3 destinations (Home / Rooms / Media) with active-route highlighting.
 * Version 0.1.0
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js';

const CARD_VERSION = '0.1.0';

const NAV_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${REDUCED_MOTION}

  :host {
    display: block;
    font-size: 16px; /* em anchor */
  }

  /* Card itself is a "portal"; the visible UI is fixed-position. */
  .wrap {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    inset: auto;
  }

  .nav {
    pointer-events: auto;
    background: var(--glass);
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: var(--shadow), var(--inset);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: grid;
    align-items: center;
    justify-items: center;
    user-select: none;
    -webkit-user-select: none;
  }

  .btn {
    all: unset;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    gap: 4px;
    cursor: pointer;
    color: rgba(255,255,255,0.62);
    transition:
      color var(--motion-ui) var(--ease-standard),
      transform var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard);
  }

  .btn:active { transform: scale(var(--press-scale)); }
  .btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
    border-radius: 16px;
  }

  .btn .icon {
    font-size: 22px;
    width: 22px;
    height: 22px;
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
    line-height: 1;
  }

  .btn.active {
    color: var(--amber-strong);
  }

  .btn.active .icon {
    --ms-fill: 1;
  }

  /* ── Mobile dock ───────────────────────────────────────────── */
  :host([data-mode="mobile"]) .wrap {
    left: 0;
    right: 0;
    bottom: 0;
    padding:
      10px 12px
      calc(10px + env(safe-area-inset-bottom));
  }

  :host([data-mode="mobile"]) .nav {
    height: 64px;
    grid-template-columns: repeat(3, 1fr);
    border-radius: 22px;
  }

  /* ── Desktop rail ──────────────────────────────────────────── */
  :host([data-mode="desktop"]) .wrap {
    left: 12px;
    top: 12px;
    bottom: 12px;
    padding: 0;
  }

  :host([data-mode="desktop"]) .nav {
    width: 72px;
    height: calc(100vh - 24px);
    grid-template-rows: repeat(3, 72px);
    grid-template-columns: 1fr;
    border-radius: 28px;
    padding: 6px 0;
    gap: 6px;
  }
`;

const GLOBAL_STYLE_ID = 'tunet-nav-card-offsets';

function ensureGlobalOffsetsStyle() {
  if (document.getElementById(GLOBAL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = GLOBAL_STYLE_ID;
  style.textContent = `
    hui-view {
      margin-left: var(--tunet-nav-offset-left, 0px);
      margin-bottom: var(--tunet-nav-offset-bottom, 0px);
    }
  `;
  document.head.appendChild(style);
}

function safePath(value, fallback) {
  const raw = (value == null ? '' : String(value)).trim();
  if (!raw) return fallback;
  return raw.startsWith('/') || raw.startsWith('#') ? raw : `/${raw}`;
}

class TunetNavCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._rendered = false;
    this._mql = null;
    this._btnEls = [];
    this._onLocationChange = this._onLocationChange.bind(this);
    this._onMqlChange = this._onMqlChange.bind(this);
    injectFonts();
  }

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'home_path', selector: { text: {} } },
        { name: 'rooms_path', selector: { text: {} } },
        { name: 'media_path', selector: { text: {} } },
        {
          name: 'subview_paths',
          selector: { object: {} }, // YAML-only in practice; UI editor won't handle arrays well.
        },
        { name: 'desktop_breakpoint', selector: { number: { min: 600, max: 1400, step: 10, mode: 'box' } } },
        { name: 'show_settings', selector: { boolean: {} } },
      ],
      computeLabel: (s) => {
        const labels = {
          home_path: 'Home Path',
          rooms_path: 'Rooms Path',
          media_path: 'Media Path',
          subview_paths: 'Subview Paths (advanced)',
          desktop_breakpoint: 'Desktop Breakpoint (px)',
          show_settings: 'Show Settings (unused in POC)',
        };
        return labels[s.name] || s.name;
      },
    };
  }

  static getStubConfig() {
    return {
      home_path: '/tunet-suite/overview',
      rooms_path: '/tunet-suite/rooms',
      media_path: '/tunet-suite/media',
      desktop_breakpoint: 900,
      show_settings: false,
    };
  }

  setConfig(config) {
    const desktopBreakpoint = Number.isFinite(Number(config.desktop_breakpoint))
      ? Math.max(600, Math.min(1400, Number(config.desktop_breakpoint)))
      : 900;

    this._config = {
      home_path: safePath(config.home_path, '/tunet-suite/overview'),
      rooms_path: safePath(config.rooms_path, '/tunet-suite/rooms'),
      media_path: safePath(config.media_path, '/tunet-suite/media'),
      subview_paths: Array.isArray(config.subview_paths) ? config.subview_paths.map(String) : [],
      desktop_breakpoint: desktopBreakpoint,
      show_settings: config.show_settings === true,
    };

    this._setupMql();
    if (this._rendered) this._updateActive();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return {
      columns: 'full',
      min_columns: 12,
      max_columns: 12,
    };
  }

  connectedCallback() {
    ensureGlobalOffsetsStyle();
    window.addEventListener('location-changed', this._onLocationChange);
    window.addEventListener('popstate', this._onLocationChange);
    this._setupMql();

    // Simple shared instance count so offsets don't get cleared prematurely.
    window.__tunetNavCardCount = (window.__tunetNavCardCount || 0) + 1;
    this._applyOffsets();
    this._updateActive();
  }

  disconnectedCallback() {
    window.removeEventListener('location-changed', this._onLocationChange);
    window.removeEventListener('popstate', this._onLocationChange);
    if (this._mql) this._mql.removeEventListener('change', this._onMqlChange);

    const next = Math.max(0, (window.__tunetNavCardCount || 1) - 1);
    window.__tunetNavCardCount = next;
    if (next === 0) {
      document.documentElement.style.removeProperty('--tunet-nav-offset-bottom');
      document.documentElement.style.removeProperty('--tunet-nav-offset-left');
    }
  }

  _setupMql() {
    const bp = this._config.desktop_breakpoint || 900;
    const query = `(min-width: ${bp}px)`;
    if (this._mql && this._mql.media === query) return;
    if (this._mql) this._mql.removeEventListener('change', this._onMqlChange);
    this._mql = window.matchMedia(query);
    this._mql.addEventListener('change', this._onMqlChange);
    this._applyMode();
  }

  _onMqlChange() {
    this._applyMode();
    this._applyOffsets();
  }

  _applyMode() {
    const isDesktop = !!(this._mql && this._mql.matches);
    this.setAttribute('data-mode', isDesktop ? 'desktop' : 'mobile');
  }

  _applyOffsets() {
    const isDesktop = this.getAttribute('data-mode') === 'desktop';
    // Conservative offsets; the goal is to prevent content from being obscured.
    document.documentElement.style.setProperty('--tunet-nav-offset-left', isDesktop ? '96px' : '0px');
    document.documentElement.style.setProperty('--tunet-nav-offset-bottom', isDesktop ? '0px' : '92px');
  }

  _onLocationChange() {
    this._updateActive();
  }

  _updateActive() {
    if (!this._btnEls.length) return;
    const path = window.location.pathname || '';

    const isSubview = this._config.subview_paths.some((p) => p && path.startsWith(p));
    const activeKey = isSubview
      ? 'rooms'
      : (path.startsWith(this._config.media_path)
        ? 'media'
        : (path.startsWith(this._config.rooms_path) ? 'rooms' : 'home'));

    for (const btn of this._btnEls) {
      btn.classList.toggle('active', btn.dataset.key === activeKey);
    }
  }

  _navigate(targetPath) {
    if (!targetPath) return;
    history.pushState(null, '', targetPath);
    window.dispatchEvent(new Event('location-changed'));
    this._updateActive();
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = NAV_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <nav class="nav" aria-label="Tunet Navigation">
          <button class="btn" data-key="home" type="button" aria-label="Home">
            <span class="icon filled">home</span>
            <span class="label">Home</span>
          </button>
          <button class="btn" data-key="rooms" type="button" aria-label="Rooms">
            <span class="icon">meeting_room</span>
            <span class="label">Rooms</span>
          </button>
          <button class="btn" data-key="media" type="button" aria-label="Media">
            <span class="icon">speaker</span>
            <span class="label">Media</span>
          </button>
        </nav>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    const btnHome = this.shadowRoot.querySelector('.btn[data-key="home"]');
    const btnRooms = this.shadowRoot.querySelector('.btn[data-key="rooms"]');
    const btnMedia = this.shadowRoot.querySelector('.btn[data-key="media"]');
    this._btnEls = [btnHome, btnRooms, btnMedia].filter(Boolean);

    if (btnHome) btnHome.addEventListener('click', () => this._navigate(this._config.home_path));
    if (btnRooms) btnRooms.addEventListener('click', () => this._navigate(this._config.rooms_path));
    if (btnMedia) btnMedia.addEventListener('click', () => this._navigate(this._config.media_path));

    this._applyMode();
    this._applyOffsets();
    this._updateActive();
  }
}

registerCard('tunet-nav-card', TunetNavCard, {
  name: 'Tunet Nav Card',
  description: 'Persistent navigation: bottom dock (mobile) + side rail (desktop).',
  preview: true,
});

logCardVersion('TUNET-NAV', CARD_VERSION, '#D4850A');
