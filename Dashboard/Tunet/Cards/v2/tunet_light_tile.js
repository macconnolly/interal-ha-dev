/**
 * Tunet Light Tile
 * Atomic lighting tile component for the Tunet card suite
 * Version 2.0.0
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
 *   tile_size: 'compact' | 'standard' | 'large' (default: standard)
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
  registerCard,
  logCardVersion,
  clamp,
  // G4: Profile consumption system
  selectProfileSize, resolveSizeProfile,
  TOKEN_MAP, PROFILE_SCHEMA_VERSION,
  bucketFromWidth,
} from './tunet_base.js?v=20260308g2e';


// ═══════════════════════════════════════════════════════════
// TILE-SPECIFIC CSS
// ═══════════════════════════════════════════════════════════

const TILE_CSS = `
  /* ── Host ── */
  :host {
    display: block;
    font-size: 16px; /* em anchor — profile tokens assume 16px base */
    contain: layout style;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  /* ── Shared tile tokens ── */
  .lt {
    --icon-size: var(--_tunet-icon-box, 2.75em);
    --icon-radius: 1em;
    --bar-h: var(--_tunet-progress-h, 0.25em);
    --bar-h-active: 0.375em;
    --bar-inset: 0.875em;
    --bar-bottom: 0.625em;
    --pill-shadow: 0 10px 30px rgba(0,0,0,0.3);
    --pill-border: 1px solid rgba(255,255,255,0.1);

    position: relative;
    border-radius: var(--_tunet-tile-radius, var(--r-tile, 1em));
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
    padding: var(--_tunet-tile-pad, 0.5625em) 0 0.5em;
    gap: 0.125em;
  }

  @media (max-width: 440px) {
    .lt.vertical { aspect-ratio: 1 / 0.98; }
  }

  /* ── Horizontal variant ── */
  .lt.horizontal {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.625em 0.75em 0.5em;
    min-height: 3.5em;
  }

  @media (max-width: 440px) {
    .lt.horizontal {
      min-height: 3.25em;
      padding: 0.4375em 0.5625em 0.625em 0.4375em;
      gap: 0.4375em;
    }
  }

  .lt.horizontal .text-stack {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.0625em;
  }

  .lt.horizontal .val {
    flex-shrink: 0;
    min-width: 2.25em;
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
    margin-bottom: 0.375em;
  }

  .lt.horizontal .icon-wrap {
    flex-shrink: 0;
  }

  @media (max-width: 440px) {
    .lt.horizontal .icon-wrap {
      width: 2.25em;
      height: 2.25em;
      border-radius: 0.625em;
    }
  }

  .tile-icon {
    font-size: var(--_tunet-icon-glyph, 1.5em);
  }

  /* ── Name ── */
  .name {
    font-size: var(--_tunet-name-font, 0.9375em);
    font-weight: 600;
    letter-spacing: 0.006em;
    line-height: 1.15;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .lt.vertical .name {
    margin-bottom: 1px;
    text-align: center;
    min-height: 1.12em;
    line-height: 1.12;
  }

  @media (max-width: 440px) {
    .lt.horizontal .name { font-size: 0.875em; }
  }

  /* ── Value ── */
  .val {
    font-size: var(--_tunet-value-font, 0.875em);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    transition: color var(--motion-ui, 0.18s);
  }

  .lt.horizontal .val {
    font-size: 0.9375em;
    letter-spacing: 0.006em;
  }
  .lt.vertical .val {
    line-height: 1.12;
    margin-top: 1px;
  }

  @media (max-width: 440px) {
    .lt.horizontal .val { font-size: 0.875em; }
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
    margin-top: 0.4375em;
  }

  .lt.horizontal .progress-track {
    bottom: 0.375em;
    left: 0.625em;
    right: 0.625em;
    height: 0.1875em;
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
    top: 0.625em;
    right: 0.625em;
    width: 0.5em;
    height: 0.5em;
    background: var(--red, #FF3B30);
    border-radius: 50%;
    display: none;
    box-shadow: 0 0 12px var(--glow-manual, rgba(255,82,82,0.6));
    z-index: 2;
  }

  .lt.horizontal .manual-dot {
    top: 0.5em;
    right: 0.5em;
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
    height: 0.3125em;
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
    font-size: 0.9375em;
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
    font-size: 0.875em;
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
const VERSION = '2.0.0'; // G4: profile consumption

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

    // G4: use_profiles defaults true; global override via window.TUNET_USE_PROFILES
    const useProfiles = (config.use_profiles !== false) &&
      (typeof window === 'undefined' || window.TUNET_USE_PROFILES !== false);

    const tileSize = ['compact', 'standard', 'large'].includes(config.tile_size)
      ? config.tile_size : 'standard';

    this._config = {
      variant: 'vertical',
      ...config,
      use_profiles: useProfiles,
      tile_size: tileSize,
    };

    // G4: Version handshake + profile application
    this._checkBaseCompat();
    this._applyProfile();

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
      fixed_rows: true,
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
    // G4: Profile consumption state
    this._profileCache = new Map();
    this._currentFamily = null;
    this._lastWidth = 0;
  }

  connectedCallback() {
    injectFonts(this.shadowRoot);
    this._buildShell();
    // G4: ResizeObserver for profile width tracking
    if (!this._resizeObserver && typeof ResizeObserver !== 'undefined') {
      this._resizeObserver = new ResizeObserver((entries) => {
        const width = entries?.[0]?.contentRect?.width;
        if (width && width > 0) {
          this._lastWidth = width;
          this._applyProfile();
        }
      });
      this._resizeObserver.observe(this);
    }
  }

  disconnectedCallback() {
    this._removePointerListeners();
    // G4: cleanup
    if (this._resizeObserver) {
      this._resizeObserver.disconnect();
      this._resizeObserver = null;
    }
    this._profileCache.clear();
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

  /* ═══════════════════════════════════════════════════
     G4: PROFILE CONSUMPTION SYSTEM
     Architecture: unified_tile_architecture_conclusion.md v3.1 §9-§11
     Standalone tile — is its own host, sets vars on itself.
     Uses tile-grid family (preset: 'lighting', layout: 'grid').
     ═══════════════════════════════════════════════════ */

  _checkBaseCompat() {
    const baseVersion = typeof window !== 'undefined' && window.TunetBase?.PROFILE_SCHEMA_VERSION;
    if (!baseVersion) {
      this._renderError('Profile system unavailable — tunet_base.js not loaded or outdated');
      return;
    }
    const expectedMajor = PROFILE_SCHEMA_VERSION.split('-')[0];
    const actualMajor = baseVersion.split('-')[0];
    if (expectedMajor !== actualMajor) {
      this._renderError(`Profile version mismatch: card expects ${expectedMajor}, base has ${actualMajor}`);
    }
  }

  _renderError(message) {
    try {
      if (!this.shadowRoot) return;
      let errEl = this.shadowRoot.getElementById('tunet-profile-error');
      if (!errEl) {
        errEl = document.createElement('div');
        errEl.id = 'tunet-profile-error';
        errEl.style.cssText = 'padding:12px;margin:8px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:8px;color:#ef4444;font-size:12px;font-weight:600;';
        this.shadowRoot.prepend(errEl);
      }
      errEl.textContent = message;
    } catch (_) { /* never throw from error renderer */ }
  }

  _applyProfile() {
    if (!this._config?.use_profiles) {
      this._applyLegacyScaling();
      return;
    }

    const { family, size } = selectProfileSize({
      preset: 'lighting',
      layout: 'grid',
      widthHint: this._lastWidth,
      userSize: this._config.tile_size,
    });

    if (family !== this._currentFamily) {
      this._profileCache.clear();
      this._currentFamily = family;
    }

    const bucket = bucketFromWidth(this._lastWidth);
    const cacheKey = `${family}:${size}:${bucket}`;
    if (this._profileCache.has(cacheKey)) return;

    const profile = resolveSizeProfile({ family, size });
    this._profileCache.set(cacheKey, true);
    this._setProfileVars(profile);
  }

  _applyLegacyScaling() {
    if (this.style.length > 0) {
      const toRemove = [];
      for (let i = 0; i < this.style.length; i++) {
        const prop = this.style[i];
        if (prop.startsWith('--_tunet-')) toRemove.push(prop);
      }
      for (const prop of toRemove) this.style.removeProperty(prop);
    }
  }

  _setProfileVars(profile) {
    // Step 1: Clear all --_tunet-*
    const toRemove = [];
    for (let i = 0; i < this.style.length; i++) {
      const prop = this.style[i];
      if (prop.startsWith('--_tunet-')) toRemove.push(prop);
    }
    for (const prop of toRemove) this.style.removeProperty(prop);

    // Step 2: Set all tokens present in this profile
    for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
      if (profile[key] !== undefined) {
        this.style.setProperty(cssVar, profile[key]);
      }
    }

    // Step 3: Bridge --profile-* public hooks
    const OVERRIDE_PAIRS = [
      ['--profile-tile-pad',    '--_tunet-tile-pad'],
      ['--profile-icon-box',    '--_tunet-icon-box'],
      ['--profile-icon-glyph',  '--_tunet-icon-glyph'],
      ['--profile-name-font',   '--_tunet-name-font'],
      ['--profile-value-font',  '--_tunet-value-font'],
      ['--profile-progress-h',  '--_tunet-progress-h'],
    ];
    const computed = getComputedStyle(this);
    for (const [pub, priv] of OVERRIDE_PAIRS) {
      const override = computed.getPropertyValue(pub).trim();
      if (override) this.style.setProperty(priv, override);
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
        use_profiles: 'Use Profile System (density-responsive sizing)',
      }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return {
      entity: 'light.living_room',
      variant: 'vertical',
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
