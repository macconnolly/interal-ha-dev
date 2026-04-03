/**
 * Tunet Nav Card (v2 – ES Module)
 * Persistent navigation chrome: bottom dock (mobile) + left rail (desktop).
 * Version 0.2.3
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
  normalizePath,
  navigatePath,
  registerCard,
  logCardVersion,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '0.2.4';

const DEFAULT_ICONS = {
  home: 'home',
  rooms: 'meeting_room',
  media: 'speaker',
  'living-room': 'weekend',
  kitchen: 'kitchen',
  'dining-room': 'restaurant',
  bedroom: 'bed',
};

const NAV_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${REDUCED_MOTION}

  :host {
    display: block;
    font-size: 16px;
  }

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
    user-select: none;
    -webkit-user-select: none;
  }

  .btn {
    all: unset;
    box-sizing: border-box;
    display: grid;
    place-items: center;
    gap: 2px;
    cursor: pointer;
    color: var(--text-muted);
    transition:
      color var(--motion-ui) var(--ease-standard),
      transform var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard);
  }

  :host(.dark) .btn:not(.active) {
    color: rgba(248,250,252, 0.55);
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
    line-height: 22px;
    overflow: hidden;
  }

  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.2px;
    line-height: 1;
    white-space: nowrap;
  }

  .btn.active {
    color: var(--amber);
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
    border-radius: 22px;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(56px, 1fr);
    align-items: center;
    column-gap: 2px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    -ms-overflow-style: none;
    scroll-snap-type: x proximity;
    padding: 0 4px;
  }
  :host([data-mode="mobile"]) .nav::-webkit-scrollbar { display: none; }

  :host([data-mode="mobile"]) .btn {
    width: 100%;
    height: 100%;
    min-width: 56px;
    scroll-snap-align: center;
  }

  :host([data-mode="mobile"]) .label {
    display: none;
  }

  /* ── Desktop rail ──────────────────────────────────────────── */
  :host([data-mode="desktop"]) .wrap {
    left: 12px;
    top: 12px;
    bottom: 12px;
    padding: 0;
  }

  :host([data-mode="desktop"]) .nav {
    width: 84px;
    height: calc(100vh - 24px);
    border-radius: 28px;
    padding: 6px 0;
    gap: 6px;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(var(--nav-item-count, 3), 72px);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
  }

  :host([data-mode="desktop"]) .btn {
    width: 100%;
    height: 72px;
  }
`;

const GLOBAL_STYLE_ID = 'tunet-nav-card-offsets';

function ensureGlobalOffsetsStyle() {
  if (window.TUNET_NAV_OFFSETS_DISABLED) return;
  if (document.getElementById(GLOBAL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = GLOBAL_STYLE_ID;
  style.textContent = `
    hui-view,
    hui-sections-view,
    hui-grid-view,
    hui-masonry-view,
    hui-panel-view {
      margin-left: var(--tunet-nav-offset-left, 0px);
      margin-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      padding-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      scroll-padding-bottom: var(--tunet-nav-offset-bottom, 0px) !important;
      box-sizing: border-box;
    }

    hui-view {
      display: block;
      min-height: calc(100% + var(--tunet-nav-offset-bottom, 0px));
    }
  `;
  document.head.appendChild(style);
}

function slugFromPath(path) {
  const normalized = normalizePath(path);
  if (!normalized.startsWith('/')) return '';
  const parts = normalized.split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

function labelFromSlug(slug) {
  if (!slug) return 'Item';
  return slug
    .split('-')
    .filter(Boolean)
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

function scopePrefix(path) {
  const normalized = normalizePath(path);
  if (!normalized.startsWith('/')) return '';
  const parts = normalized.split('/').filter(Boolean);
  if (!parts.length) return '';
  return `/${parts[0]}/`;
}

function defaultNavItems(config) {
  const items = [
    { key: 'home', label: 'Home', icon: DEFAULT_ICONS.home, path: config.home_path, match_paths: [] },
    { key: 'media', label: 'Media', icon: DEFAULT_ICONS.media, path: config.media_path, match_paths: [] },
  ];

  for (const roomPath of config.subview_paths) {
    const slug = slugFromPath(roomPath);
    if (!slug) continue;
    items.push({
      key: slug,
      label: labelFromSlug(slug),
      icon: DEFAULT_ICONS[slug] || 'meeting_room',
      path: roomPath,
      match_paths: [],
    });
  }

  if (config.include_rooms_index) {
    items.push({
      key: 'rooms',
      label: 'Rooms',
      icon: DEFAULT_ICONS.rooms,
      path: config.rooms_path,
      match_paths: [],
    });
  }
  return items;
}

function normalizeNavItem(item, idx) {
  const key = String(item?.key || item?.id || `item-${idx}`).trim();
  const path = normalizePath(item?.path || item?.navigation_path || '');
  if (!key || !path) return null;
  const label = String(item?.label || labelFromSlug(slugFromPath(path)) || key).trim();
  const icon = String(item?.icon || DEFAULT_ICONS[key] || 'radio_button_unchecked').trim();
  const match_paths = Array.isArray(item?.match_paths)
    ? item.match_paths.map((p) => normalizePath(p)).filter(Boolean)
    : [];

  return { key, label, icon, path, match_paths };
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
    this._navItems = [];
    this._scopePrefixes = [];
    this._onLocationChange = this._onLocationChange.bind(this);
    this._onMqlChange = this._onMqlChange.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
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
          selector: { object: {} },
        },
        {
          name: 'include_rooms_index',
          selector: { boolean: {} },
        },
        {
          name: 'items',
          selector: { object: {} },
        },
        { name: 'desktop_breakpoint', selector: { number: { min: 600, max: 1400, step: 10, mode: 'box' } } },
        { name: 'desktop_left_offset', selector: { number: { min: 72, max: 220, step: 2, mode: 'box' } } },
        { name: 'mobile_bottom_offset', selector: { number: { min: 84, max: 220, step: 2, mode: 'box' } } },
      ],
      computeLabel: (s) => {
        const labels = {
          home_path: 'Home Path',
          rooms_path: 'Rooms Path',
          media_path: 'Media Path',
          subview_paths: 'Room Paths (advanced)',
          include_rooms_index: 'Show Rooms Index Item',
          items: 'Custom Nav Items (advanced)',
          desktop_breakpoint: 'Desktop Breakpoint (px)',
          desktop_left_offset: 'Desktop Left Offset (px)',
          mobile_bottom_offset: 'Mobile Bottom Offset (px)',
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
      subview_paths: [
        '/tunet-suite/living-room',
        '/tunet-suite/kitchen',
        '/tunet-suite/dining-room',
        '/tunet-suite/bedroom',
      ],
      include_rooms_index: true,
      desktop_breakpoint: 900,
      desktop_left_offset: 108,
      mobile_bottom_offset: 108,
    };
  }

  setConfig(config) {
    const desktopBreakpoint = Number.isFinite(Number(config.desktop_breakpoint))
      ? Math.max(600, Math.min(1400, Number(config.desktop_breakpoint)))
      : 900;
    const desktopLeftOffset = Number.isFinite(Number(config.desktop_left_offset))
      ? Math.max(72, Math.min(220, Number(config.desktop_left_offset)))
      : 108;
    const mobileBottomOffset = Number.isFinite(Number(config.mobile_bottom_offset))
      ? Math.max(84, Math.min(220, Number(config.mobile_bottom_offset)))
      : 108;

    this._config = {
      home_path: normalizePath(config.home_path || '/tunet-suite/overview'),
      rooms_path: normalizePath(config.rooms_path || '/tunet-suite/rooms'),
      media_path: normalizePath(config.media_path || '/tunet-suite/media'),
      subview_paths: Array.isArray(config.subview_paths)
        ? config.subview_paths.map((p) => normalizePath(p)).filter(Boolean)
        : [],
      include_rooms_index: config.include_rooms_index !== false,
      items: Array.isArray(config.items) ? config.items : [],
      desktop_breakpoint: desktopBreakpoint,
      desktop_left_offset: desktopLeftOffset,
      mobile_bottom_offset: mobileBottomOffset,
    };

    const explicitItems = this._config.items
      .map((item, idx) => normalizeNavItem(item, idx))
      .filter(Boolean);
    this._navItems = explicitItems.length ? explicitItems : defaultNavItems(this._config);
    this._scopePrefixes = [...new Set(this._navItems.map((item) => scopePrefix(item.path)).filter(Boolean))];

    this._setupMql();
    if (this._rendered) {
      this._render();
      this._updateActive();
      this._applyOffsets();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
    applyDarkClass(this, detectDarkMode(hass));
  }

  getCardSize() {
    return 1;
  }

  getGridOptions() {
    return {
      columns: 'full',
      min_columns: 6,
      rows: 'auto',
      min_rows: 1,
    };
  }

  connectedCallback() {
    ensureGlobalOffsetsStyle();
    window.addEventListener('location-changed', this._onLocationChange);
    window.addEventListener('popstate', this._onLocationChange);
    window.addEventListener('resize', this._onWindowResize, { passive: true });
    this._setupMql();
    window.__tunetNavCardCount = (window.__tunetNavCardCount || 0) + 1;
    this._applyOffsets();
    this._updateActive();
  }

  disconnectedCallback() {
    window.removeEventListener('location-changed', this._onLocationChange);
    window.removeEventListener('popstate', this._onLocationChange);
    window.removeEventListener('resize', this._onWindowResize);
    if (this._mql) this._mql.removeEventListener('change', this._onMqlChange);

    const next = Math.max(0, (window.__tunetNavCardCount || 1) - 1);
    window.__tunetNavCardCount = next;
    if (next === 0) {
      document.documentElement.style.removeProperty('--tunet-nav-offset-bottom');
      document.documentElement.style.removeProperty('--tunet-nav-offset-left');
      document.getElementById(GLOBAL_STYLE_ID)?.remove();
    }
  }

  _setupMql() {
    const query = `(min-width: ${this._config.desktop_breakpoint || 900}px)`;
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

  _onLocationChange() {
    this._updateActive();
    this._applyOffsets();
  }

  _onWindowResize() {
    this._applyMode();
    this._applyOffsets();
  }

  _applyMode() {
    const isDesktop = !!(this._mql && this._mql.matches);
    this.setAttribute('data-mode', isDesktop ? 'desktop' : 'mobile');
  }

  _isScopedRoute(pathname) {
    if (!this._scopePrefixes.length) return true;
    return this._scopePrefixes.some((prefix) => pathname.startsWith(prefix));
  }

  _applyOffsets() {
    if (window.TUNET_NAV_OFFSETS_DISABLED) {
      document.documentElement.style.removeProperty('--tunet-nav-offset-left');
      document.documentElement.style.removeProperty('--tunet-nav-offset-bottom');
      return;
    }
    const isDesktop = this.getAttribute('data-mode') === 'desktop';
    const left = Number(this._config.desktop_left_offset) || 108;
    const configuredBottom = Number(this._config.mobile_bottom_offset) || 108;
    const measuredBottom = isDesktop ? 0 : this._measureMobileDockClearance();
    const bottom = Math.max(configuredBottom, measuredBottom);
    document.documentElement.style.setProperty('--tunet-nav-offset-left', isDesktop ? `${left}px` : '0px');
    document.documentElement.style.setProperty(
      '--tunet-nav-offset-bottom',
      isDesktop ? '0px' : `calc(${bottom}px + env(safe-area-inset-bottom))`
    );
  }

  _measureMobileDockClearance() {
    const wrap = this.shadowRoot?.querySelector('.wrap');
    const nav = this.shadowRoot?.querySelector('.nav');
    if (!wrap || !nav) return 0;
    const wrapStyle = window.getComputedStyle(wrap);
    const navRect = nav.getBoundingClientRect();
    const padTop = Number.parseFloat(wrapStyle.paddingTop || '0') || 0;
    const padBottom = Number.parseFloat(wrapStyle.paddingBottom || '0') || 0;
    return Math.ceil(navRect.height + padTop + padBottom + 12);
  }

  _updateActive() {
    if (!this._btnEls.length) return;
    const path = window.location.pathname || '';
    const activeItem = this._navItems.find((item) =>
      path.startsWith(item.path) || (item.match_paths || []).some((mp) => path.startsWith(mp))
    );
    const activeKey = activeItem?.key || '';
    for (const btn of this._btnEls) {
      btn.classList.toggle('active', btn.dataset.key === activeKey);
    }
  }

  _navigate(targetPath) {
    navigatePath(targetPath);
    this._updateActive();
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = NAV_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const itemsHtml = this._navItems.map((item) => `
      <button class="btn" data-key="${item.key}" type="button" aria-label="${item.label}" title="${item.label}">
        <span class="icon">${item.icon}</span>
        <span class="label">${item.label}</span>
      </button>
    `).join('');

    const tpl = document.createElement('template');
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <nav class="nav" aria-label="Tunet Navigation" style="--nav-item-count:${this._navItems.length || 1};">
          ${itemsHtml}
        </nav>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this._btnEls = [...this.shadowRoot.querySelectorAll('.btn')];
    for (const btn of this._btnEls) {
      const key = btn.dataset.key;
      const item = this._navItems.find((it) => it.key === key);
      if (!item) continue;
      btn.addEventListener('click', () => this._navigate(item.path));
    }

    this._applyMode();
    this._applyOffsets();
    this._updateActive();
    requestAnimationFrame(() => this._applyOffsets());
  }
}

registerCard('tunet-nav-card', TunetNavCard, {
  name: 'Tunet Nav Card',
  description: 'Persistent navigation: bottom dock (mobile) + side rail (desktop).',
  preview: true,
});

logCardVersion('TUNET-NAV', CARD_VERSION, '#D4850A');
