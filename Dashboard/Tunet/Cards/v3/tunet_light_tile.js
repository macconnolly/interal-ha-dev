/**
 * Tunet Light Tile
 * Atomic lighting tile component for the Tunet card suite
 * Version 1.0.0
 *
 * A standalone custom element representing a single light entity.
 * Supports vertical (grid) and horizontal (row) variants.
 * Cards compose these tiles into layouts — this file owns the tile, nothing else.
 *
 * Config:
 *   entity:   light.entity_id (required)
 *   name:     display name override
 *   icon:     Material Symbols ligature override
 *   variant:  "vertical" (default) | "horizontal"
 *   tile_size: "compact" | "standard" | "large" (default: standard)
 *   use_profiles: boolean (default: true)
 */

import {
  TOKENS,
  TOKENS_MIDNIGHT,
  RESET,
  BASE_FONT,
  ICON_BASE,
  TILE_SURFACE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  createAxisLockedDrag,
  fireEvent,
  selectProfileSize,
  resolveSizeProfile,
  _setProfileVars,
  registerCard,
  logCardVersion,
  clamp,
} from './tunet_base.js?v=20260309g7';


// ═══════════════════════════════════════════════════════════
// TILE-SPECIFIC CSS
// ═══════════════════════════════════════════════════════════

const TILE_CSS = `
  /* ── Host ── */
  :host {
    display: block;
    contain: layout style;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
    --card-pad: var(--_tunet-card-pad, 1.25em);
    --r-tile: var(--_tunet-tile-radius, 0.875em);
  }

  /* ── Shared tile tokens ── */
  .lt {
    --icon-size: var(--_tunet-icon-box, 2.375em);
    --icon-radius: calc(var(--_tunet-tile-radius, 0.875em) * 0.9);
    --bar-h: var(--_tunet-progress-h, 0.5em);
    --bar-h-active: calc(var(--_tunet-progress-h, 0.5em) * 1.25);
    --bar-inset: var(--_tunet-tile-pad, 0.875em);
    --bar-bottom: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    --pill-shadow: 0 10px 30px rgba(0,0,0,0.3);
    --pill-border: 1px solid rgba(255,255,255,0.1);

    position: relative;
    border-radius: var(--_tunet-tile-radius, var(--r-tile, 0.875em));
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost, transparent);
    box-shadow: var(--shadow);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y;
    overflow: visible;
    transition:
      transform var(--motion-ui, 0.18s) var(--ease-emphasized, cubic-bezier(0.34, 1.56, 0.64, 1)),
      box-shadow var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color var(--motion-ui, 0.18s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color var(--motion-surface, 0.28s) var(--ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  @media (hover: hover) {
    .lt:hover { box-shadow: var(--shadow-up); }
  }

  /* ── Vertical variant (default) ── */
  .lt.vertical {
    aspect-ratio: 1 / 0.9;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: var(--_tunet-tile-min-h, 5.75em);
    padding:
      calc(var(--_tunet-tile-pad, 0.875em) * 0.7)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.39)
      calc(var(--_tunet-tile-pad, 0.875em) * 1.03);
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.4);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.vertical { aspect-ratio: 1 / 0.98; }
  }

  /* ── Horizontal variant ── */
  .lt.horizontal {
    display: flex;
    align-items: center;
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 1.4);
    padding:
      calc(var(--_tunet-tile-pad, 0.875em) * 0.64)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.78)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.92)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.64);
    min-height: max(calc(var(--_tunet-tile-min-h, 5.75em) * 0.9), 3.5em);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal {
      min-height: 52px;
      padding: 7px 9px 10px 7px;
      gap: 7px;
    }
  }

  .lt.horizontal .text-stack {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.25);
  }

  .lt.horizontal .val {
    flex-shrink: 0;
    min-width: calc(var(--_tunet-icon-box, 2.375em) * 0.9);
    text-align: right;
  }

  /* ── Icon wrap ── */
  .icon-wrap {
    width: var(--icon-size);
    height: var(--icon-size);
    border-radius: var(--icon-radius);
    display: grid;
    place-items: center;
    border: 1px solid transparent;
    transition: all var(--motion-ui, 0.18s) ease;
  }

  .lt.vertical .icon-wrap {
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.5);
  }

  .lt.horizontal .icon-wrap {
    flex-shrink: 0;
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
    }
  }

  .tile-icon {
    font-size: var(--_tunet-icon-glyph, 1.1875em);
    width: var(--_tunet-icon-glyph, 1.1875em);
    height: var(--_tunet-icon-glyph, 1.1875em);
  }

  /* ── Name ── */
  .name {
    font-size: var(--_tunet-name-font, 0.8125em);
    font-weight: 600;
    letter-spacing: 0.00625em;
    line-height: 1.15;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .lt.vertical .name {
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.2);
    text-align: center;
    min-height: 1.12em;
    line-height: 1.12;
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .name { font-size: 14px; }
  }

  /* ── Value ── */
  .val {
    font-size: var(--_tunet-value-font, 1.125em);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: color var(--motion-ui, 0.18s);
  }

  .lt.horizontal .val {
    font-size: calc(var(--_tunet-value-font, 1.125em) * 1.05);
    letter-spacing: 0.00625em;
  }
  .lt.vertical .val {
    line-height: 1.12;
    margin-top: calc(var(--_tunet-tile-gap, 0.375em) * 0.2);
  }

  @media (max-width: 440px) {
    :host(:not([use-profiles])) .lt.horizontal .val { font-size: 14px; }
  }

  /* ── Progress bar ── */
  .progress-track {
    position: absolute;
    bottom: var(--bar-bottom);
    left: var(--bar-inset);
    right: var(--bar-inset);
    height: var(--bar-h);
    background: var(--track-bg, rgba(0,0,0,0.06));
    border-radius: 99px;
    overflow: hidden;
    transition: height var(--motion-ui, 0.18s) ease;
  }

  /* Keep vertical variant content lane naturally centered with progress in flow */
  .lt.vertical .progress-track {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: calc(100% - (var(--bar-inset) * 2));
    margin-top: calc(var(--_tunet-tile-gap, 0.375em) * 1.2);
  }

  .lt.horizontal .progress-track {
    bottom: calc(var(--_tunet-tile-pad, 0.875em) * 0.5);
    left: calc(var(--_tunet-tile-pad, 0.875em) * 0.78);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.78);
    height: calc(var(--_tunet-progress-h, 0.5em) * 0.75);
  }

  .progress-fill {
    height: 100%;
    width: 0%;
    border-radius: 99px;
    transition: width 0.1s ease-out;
  }

  /* ── Manual override dot ── */
  .manual-dot {
    position: absolute;
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.72);
    width: 0.5em;
    height: 0.5em;
    background: var(--red, #FF3B30);
    border-radius: 50%;
    display: none;
    box-shadow: 0 0 12px var(--glow-manual, rgba(255,82,82,0.6));
    z-index: 2;
  }

  .lt.horizontal .manual-dot {
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.6);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.6);
  }

  .lt[data-manual="true"] .manual-dot {
    display: block;
  }

  /* ════════════════════════════════════════════════════
     STATE: OFF
     ════════════════════════════════════════════════════ */
  .lt.off {
    opacity: 1;
  }

  .lt.off .icon-wrap {
    background: var(--gray-ghost, rgba(0,0,0,0.03));
    color: var(--text-sub);
    border-color: transparent;
  }

  .lt.off .name {
    color: var(--text-sub);
  }

  .lt.off .val {
    color: var(--text-sub);
    opacity: 0.5;
  }

  .lt.off .progress-fill {
    background: var(--text-sub);
    opacity: 0.15;
  }

  /* ════════════════════════════════════════════════════
     STATE: ON
     ════════════════════════════════════════════════════ */
  .lt.on {
    border-color: var(--amber-border);
  }

  .lt.on .icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }

  .lt.on .tile-icon {
    font-variation-settings: 'FILL' 1, 'wght' var(--ms-wght, 400), 'GRAD' var(--ms-grad, 0), 'opsz' var(--ms-opsz, 24);
  }

  .lt.on .val {
    color: var(--amber);
  }

  .lt.on .progress-fill {
    background: var(--amber);
    opacity: 0.9;
  }

  /* ════════════════════════════════════════════════════
     STATE: SLIDING (drag active)
     ════════════════════════════════════════════════════ */
  .lt.sliding {
    transform: scale(1.05);
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--amber);
  }

  .lt.sliding .progress-track {
    height: var(--bar-h-active);
  }

  .lt.horizontal.sliding .progress-track {
    height: calc(var(--bar-h-active) * 0.8);
  }

  .lt.sliding .progress-fill {
    transition: none;
  }

  /* Floating pill — vertical */
  .lt.vertical.sliding .val {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    color: var(--amber);
    font-weight: 700;
    font-size: calc(var(--_tunet-value-font, 1.125em) * 0.95);
    background: var(--tile-bg, #fff);
    padding: 0.375em 1.25em;
    border-radius: 99px;
    box-shadow: var(--pill-shadow);
    z-index: 101;
    border: var(--pill-border);
    white-space: nowrap;
    opacity: 1;
  }

  /* Floating pill — horizontal */
  .lt.horizontal.sliding .val {
    position: absolute;
    top: -0.25em;
    left: 50%;
    transform: translate(-50%, -100%);
    color: var(--amber);
    font-weight: 700;
    font-size: calc(var(--_tunet-value-font, 1.125em) * 0.88);
    background: var(--tile-bg, #fff);
    padding: 0.3125em 0.875em;
    border-radius: 99px;
    box-shadow: var(--pill-shadow);
    z-index: 101;
    border: var(--pill-border);
    white-space: nowrap;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* ── Focus visible ── */
  .lt:focus-visible {
    outline: var(--focus-ring-width, 2px) solid var(--focus-ring-color, rgba(0,122,255,0.5));
    outline-offset: var(--focus-ring-offset, 2px);
  }
`;


// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════

const TAG = 'tunet-light-tile';
const VERSION = '1.1.0';

class TunetLightTile extends HTMLElement {

  // ── HA lifecycle ──────────────────────────────────
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error(`${TAG}: 'entity' is required`);
    }
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact'
      ? 'compact'
      : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const useProfiles = config.use_profiles !== false;
    this._config = {
      variant: 'vertical',
      ...config,
      tile_size: tileSize,
      use_profiles: useProfiles,
    };
    this._applyProfile(this._getHostWidth());
    if (this._hass) this._render();
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    // Dark mode
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Only re-render if entity state changed
    const entityId = this._config?.entity;
    if (!entityId) return;

    const newState = hass.states[entityId];
    const oldState = oldHass?.states?.[entityId];

    if (
      !oldState ||
      newState?.state !== oldState?.state ||
      newState?.attributes?.brightness !== oldState?.attributes?.brightness ||
      newState?.attributes?.friendly_name !== oldState?.attributes?.friendly_name
    ) {
      this._render();
    }
  }

  getCardSize() {
    return this._config?.variant === 'horizontal' ? 1 : 2;
  }

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 3,
      min_columns: 3,
      rows: 'auto',
      min_rows: 1,
      max_rows: 4,
    };
  }

  // ── Constructor ──────────────────────────────────
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = null;
    this._dragController = null;
    this._rendered = false;
    this._cooldownUntil = 0;
    this._profileSelection = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
  }

  connectedCallback() {
    injectFonts(this.shadowRoot);
    this._buildShell();
    this._setupResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      this._usingWindowResizeFallback = true;
      window.addEventListener('resize', this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }

  disconnectedCallback() {
    this._removePointerListeners();
    if (this._usingWindowResizeFallback) {
      window.removeEventListener('resize', this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
  }

  _getHostWidth(widthHint = null) {
    const parsed = Number(widthHint);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const hostWidth = Number(this.getBoundingClientRect?.().width);
    if (Number.isFinite(hostWidth) && hostWidth > 0) return hostWidth;
    return 1024;
  }

  _setLegacyTileSizeAttr(size) {
    if (size === 'compact' || size === 'large') this.setAttribute('tile-size', size);
    else this.removeAttribute('tile-size');
  }

  _applyProfile(widthHint = null) {
    const useProfiles = this._config?.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute('use-profiles');
      this.removeAttribute('profile-family');
      this.removeAttribute('profile-size');
      this._setLegacyTileSizeAttr(this._config?.tile_size || 'standard');
      return;
    }

    const width = this._getHostWidth(widthHint);
    const selection = selectProfileSize({
      preset: 'lighting',
      layout: 'grid',
      widthHint: width,
      userSize: this._config?.tile_size,
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute('use-profiles', '');
    this.setAttribute('profile-family', selection.family);
    this.setAttribute('profile-size', selection.size);
    this._setLegacyTileSizeAttr(selection.size);
  }

  _setupResizeObserver() {
    if (this._resizeObserver || typeof ResizeObserver === 'undefined') return;
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries?.[0]?.contentRect?.width;
      this._onHostResize(width);
    });
    this._resizeObserver.observe(this);
  }

  _teardownResizeObserver() {
    if (!this._resizeObserver) return;
    this._resizeObserver.disconnect();
    this._resizeObserver = null;
  }

  _onHostResize(widthHint = null) {
    this._applyProfile(widthHint);
  }

  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }

  // ── Build static shell ───────────────────────────
  _buildShell() {
    const style = document.createElement('style');
    style.textContent = [
      TOKENS,
      TOKENS_MIDNIGHT,
      RESET,
      BASE_FONT,
      ICON_BASE,
      REDUCED_MOTION,
      TILE_CSS,
    ].join('\n');

    const fontLink = document.createElement('template');
    fontLink.innerHTML = FONT_LINKS;

    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(fontLink.content.cloneNode(true));

    // Tile root
    this._tile = document.createElement('div');
    this._tile.className = 'lt';
    this._tile.setAttribute('tabindex', '0');
    this._tile.setAttribute('role', 'button');
    this.shadowRoot.appendChild(this._tile);
    this._applyProfile(this._getHostWidth());

    this._setupPointerListeners();

    if (this._config && this._hass) {
      this._render();
    }
  }

  // ── Render ───────────────────────────────────────
  _render() {
    if (!this._tile || !this._config || !this._hass) return;

    const config = this._config;
    const entity = this._hass.states[config.entity];
    if (!entity) {
      this._tile.innerHTML = `<div class="name" style="color:var(--red)">Entity not found</div>`;
      return;
    }

    const isOn = entity.state === 'on';
    const brightness = isOn
      ? Math.round((entity.attributes.brightness / 255) * 100)
      : 0;
    const name = config.name || entity.attributes.friendly_name || config.entity;
    const icon = config.icon || this._defaultIcon(entity);
    const isManual = config.show_manual !== false && entity.attributes.manual_override === true;
    const variant = config.variant || 'vertical';

    // Store brightness for drag calculations
    this._currentBrightness = brightness;

    // Variant class
    this._tile.className = `lt ${variant} ${isOn ? 'on' : 'off'}`;

    // Data attributes
    this._tile.dataset.brightness = brightness;
    if (isManual) {
      this._tile.dataset.manual = 'true';
    } else {
      delete this._tile.dataset.manual;
    }

    // ARIA
    this._tile.setAttribute('aria-label', `${name}, ${isOn ? brightness + '%' : 'Off'}`);

    // Build DOM
    if (variant === 'horizontal') {
      this._tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="icon-wrap">
          <span class="tile-icon icon">${icon}</span>
        </div>
        <div class="text-stack">
          <div class="name">${name}</div>
        </div>
        <div class="val">${isOn ? brightness + '%' : 'Off'}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${brightness}%"></div>
        </div>
      `;
    } else {
      this._tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="icon-wrap">
          <span class="tile-icon icon">${icon}</span>
        </div>
        <div class="name">${name}</div>
        <div class="val">${isOn ? brightness + '%' : 'Off'}</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${brightness}%"></div>
        </div>
      `;
    }

    this._rendered = true;
  }

  // ── Default icon lookup ──────────────────────────
  _defaultIcon(entity) {
    const icon = entity.attributes.icon;
    if (icon) {
      // Convert mdi:xxx to Material Symbols if possible,
      // otherwise fall back to lightbulb
      const mdiMap = {
        'mdi:lightbulb': 'lightbulb',
        'mdi:ceiling-light': 'light',
        'mdi:floor-lamp': 'floor_lamp',
        'mdi:desk-lamp': 'table_lamp',
        'mdi:lamp': 'table_lamp',
        'mdi:led-strip': 'highlight',
        'mdi:spotlight-beam': 'highlight',
        'mdi:vanity-light': 'highlight',
        'mdi:wall-sconce': 'wall_lamp',
        'mdi:outdoor-lamp': 'outdoor_lamp',
        'mdi:track-light': 'track_changes',
        'mdi:light-recessed': 'light',
        'mdi:light-switch': 'toggle_on',
        'mdi:lamps': 'floor_lamp',
      };
      return mdiMap[icon] || 'lightbulb';
    }
    return 'lightbulb';
  }

  // ── Optimistic UI update (during drag) ───────────
  _updateTileUI(brightness) {
    if (!this._tile) return;
    const brt = clamp(brightness, 0, 100);
    const isOn = brt > 0;

    // Update classes
    this._tile.classList.toggle('on', isOn);
    this._tile.classList.toggle('off', !isOn);

    // Update data
    this._tile.dataset.brightness = brt;

    // Update fill
    const fill = this._tile.querySelector('.progress-fill');
    if (fill) fill.style.width = brt + '%';

    // Update value text
    const val = this._tile.querySelector('.val');
    if (val) val.textContent = isOn ? brt + '%' : 'Off';

    // Update icon fill
    const icon = this._tile.querySelector('.tile-icon');
    if (icon) {
      if (isOn) {
        icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
      } else {
        icon.style.fontVariationSettings = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";
      }
    }
  }

  // ── Pointer interaction ──────────────────────────
  _setupPointerListeners() {
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onContextMenu = (e) => e.preventDefault();

    this._tile.addEventListener('keydown', this._onKeyDown);
    this._tile.addEventListener('contextmenu', this._onContextMenu);

    this._dragController = createAxisLockedDrag({
      element: this._tile,
      deadzone: 8,
      axisBias: 1.3,
      longPressMs: 500,
      pointerCapture: false,
      getContext: () => ({
        startBright: parseInt(this._tile.dataset.brightness, 10) || 0,
        currentBright: parseInt(this._tile.dataset.brightness, 10) || 0,
        width: Math.max(this._tile.offsetWidth, 1),
      }),
      onDragStart: () => {
        this._tile.classList.add('sliding');
      },
      onDragMove: (event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        const change = (payload.dx / ctx.width) * 100;
        const newBrt = Math.round(clamp(ctx.startBright + change, 0, 100));
        if (newBrt === ctx.currentBright) return;
        if (event.cancelable) event.preventDefault();
        this._updateTileUI(newBrt);
        ctx.currentBright = newBrt;
      },
      onDragEnd: (_event, payload) => {
        const ctx = payload && payload.context;
        this._tile.classList.remove('sliding');
        if (payload && payload.committed && ctx) {
          this._callService(ctx.currentBright);
        }
      },
      onTap: () => {
        const current = parseInt(this._tile.dataset.brightness, 10) || 0;
        const target = current > 0 ? 0 : 100;
        this._updateTileUI(target);
        this._callService(target);
      },
      onLongPress: () => {
        this._openMoreInfo();
      },
    });
  }

  _removePointerListeners() {
    if (!this._tile) return;
    this._tile.removeEventListener('keydown', this._onKeyDown);
    this._tile.removeEventListener('contextmenu', this._onContextMenu);
    if (this._dragController) {
      this._dragController.destroy();
      this._dragController = null;
    }
  }

  _handleKeyDown(e) {
    const entity = this._config?.entity;
    if (!entity) return;

    const brt = parseInt(this._tile.dataset.brightness) || 0;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        const target = brt > 0 ? 0 : 100;
        this._updateTileUI(target);
        this._callService(target);
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        const up = clamp(brt + 5, 0, 100);
        this._updateTileUI(up);
        this._callService(up);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        const down = clamp(brt - 5, 0, 100);
        this._updateTileUI(down);
        this._callService(down);
        break;
    }
  }

  // ── HA service calls ─────────────────────────────
  _callService(brightness) {
    if (!this._hass || !this._config?.entity) return;

    // Cooldown: debounce rapid calls
    const now = Date.now();
    if (now < this._cooldownUntil) return;
    this._cooldownUntil = now + 150;

    const entity = this._config.entity;

    if (brightness === 0) {
      this._hass.callService('light', 'turn_off', {
        entity_id: entity,
      });
    } else {
      this._hass.callService('light', 'turn_on', {
        entity_id: entity,
        brightness: Math.round((brightness / 100) * 255),
      });
    }
  }

  _openMoreInfo() {
    if (!this._config?.entity) return;
    fireEvent(this, 'hass-more-info', { entityId: this._config.entity });
  }

  // ── Config editor (static) ─────────────────────
  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'light' }] } } },
        { name: 'name', selector: { text: {} } },
        { name: 'icon', selector: { text: {} } },
        { name: 'variant', selector: { select: { options: ['vertical', 'horizontal'] } } },
        { name: 'tile_size', selector: { select: { options: ['compact', 'standard', 'large'] } } },
        { name: 'use_profiles', selector: { boolean: {} } },
      ],
      computeLabel: (s) => ({
        entity: 'Light Entity',
        name: 'Display Name',
        icon: 'Icon (Material Symbols)',
        variant: 'Layout Variant',
        tile_size: 'Tile Size',
        use_profiles: 'Use Profile Sizing',
      }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return {
      entity: 'light.living_room',
      variant: 'vertical',
      tile_size: 'standard',
      use_profiles: true,
    };
  }
}


// ═══════════════════════════════════════════════════════════
// REGISTRATION
// ═══════════════════════════════════════════════════════════

registerCard(TAG, TunetLightTile, {
  type: TAG,
  name: 'Tunet Light Tile',
  description: 'Atomic light tile — vertical grid or horizontal row variant',
});

logCardVersion('Tunet Light Tile', VERSION);
