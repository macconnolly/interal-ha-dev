/**
 * Tunet Speaker Grid Card
 * Sonos speaker grid with per-speaker volume control and group management
 * Auto-detects speakers from binary_sensor.sonos_*_in_playing_group entities
 *
 * Horizontal tile layout: icon | name + song | vol% | vol-bar (bottom)
 *
 * Interactions:
 *   Tap        = toggle group membership
 *   Drag L/R   = volume control (200px = full range)
 *   Hold 500ms = open more-info dialog
 *
 * Version 3.0.0
 */

const TUNET_SPEAKER_GRID_VERSION = '1.0.0';
const SPEAKER_ICON_ALLOW = new Set([
  'speaker',
  'speaker_group',
  'speaker_notes',
  'volume_up',
  'volume_down',
  'music_note',
  'podcasts',
  'smart_display',
  'tv',
  'radio',
]);

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

/* ===============================================================
   CSS — Tokens aligned to design_language.md v8.x
   Steel blue accent per user preference
   =============================================================== */

const TUNET_SPEAKER_GRID_STYLES = `
  /* ── Tokens: Light ─────────────────────────────── */
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
    --green-fill: rgba(52,199,89,0.12);
    --green-border: rgba(52,199,89,0.15);
    --track-bg: rgba(28,28,30,0.055);
    --track-h: 44px;
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-track: 4px;
    --r-pill: 999px;
    --r-track: 4px;
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
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --gray-ghost: rgba(0,0,0,0.035);
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
    --green: #30D158;
    --green-fill: rgba(48,209,88,0.14);
    --green-border: rgba(48,209,88,0.18);
    --track-bg: rgba(255,255,255,0.06);
    --track-h: 44px;
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-track: 4px;
    --r-pill: 999px;
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
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.16);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
    --gray-ghost: rgba(255,255,255,0.04);
    color-scheme: dark;
  }

  /* ── Reset ──────────────────────────────────────── */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Base ───────────────────────────────────────── */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Icons ──────────────────────────────────────── */
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal; font-style: normal;
    display: inline-flex; align-items: center; justify-content: center;
    line-height: 1; text-transform: none; letter-spacing: normal;
    white-space: nowrap; direction: ltr; vertical-align: middle;
    flex-shrink: 0; -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  /* ── Card Shell ─────────────────────────────────── */
  .card {
    position: relative; width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex; flex-direction: column; gap: 0;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }

  /* Glass stroke (XOR bevel) */
  .card::before {
    content: ""; position: absolute; inset: 0;
    border-radius: var(--r-card); padding: 1px;
    pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50), rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%, rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor; mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14), rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%, rgba(255,255,255,0.08));
  }

  /* ── Header ─────────────────────────────────────── */
  .grid-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }

  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease; min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }

  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all .2s ease; color: var(--text-muted);
  }

  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title {
    font-weight: 700; font-size: 13px; color: var(--text-sub);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px; font-weight: 600; color: var(--text-muted);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-spacer { flex: 1; }

  /* ── Speaker Grid ───────────────────────────────── */
  .spk-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 4), minmax(0, 1fr));
    gap: 10px;
    width: 100%; min-width: 0;
  }

  /* ═══════════════════════════════════════════════════
     HORIZONTAL SPEAKER TILE
     ═══════════════════════════════════════════════════ */
  .spk-tile {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px 14px 10px;
    border-radius: var(--r-tile);
    background: var(--tile-bg);
    border: 1px solid transparent;
    box-shadow: var(--tile-shadow-rest);
    cursor: pointer; user-select: none;
    touch-action: pan-y;
    min-height: 62px;
    min-width: 0;
    overflow: visible;
    transition:
      transform .2s var(--spring),
      box-shadow .2s ease,
      border-color .2s ease,
      background-color .3s ease;
  }

  /* Size presets via host attribute */
  :host([tile-size="compact"]) .spk-tile { padding: 8px 10px 12px 8px; min-height: 56px; gap: 8px; }
  :host([tile-size="large"]) .spk-tile { padding: 12px 14px 16px 12px; min-height: 68px; }

  /* Hover */
  .spk-tile:hover {
    box-shadow: var(--tile-shadow-lift);
    transform: translateY(-1px);
  }

  /* Active press */
  .spk-tile:active { transform: scale(.98); }

  /* Focus visible */
  .spk-tile:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }

  /* ── Icon circle (left) ──────────────────────── */
  .tile-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 12px;
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: all .2s ease;
  }
  :host([tile-size="compact"]) .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
  :host([tile-size="large"]) .tile-icon-wrap { width: 44px; height: 44px; }

  .tile-icon-wrap .icon {
    color: inherit;
    transition: color .15s ease;
  }

  /* ── Text stack (center) ─────────────────────── */
  .spk-text {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .spk-name {
    font-size: 13px; font-weight: 600; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-name { font-size: 12px; }

  /* Song name / state line - wraps up to 2 lines */
  .spk-meta {
    font-size: 11px; font-weight: 500; line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-meta { font-size: 10px; }

  /* ── Volume % (right) ────────────────────────── */
  .spk-vol {
    font-size: 14px; font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.1px;
    flex-shrink: 0;
    min-width: 36px; text-align: right;
    transition: color .15s ease;
  }
  :host([tile-size="compact"]) .spk-vol { font-size: 13px; }

  /* ── Volume bar (bottom inset) ───────────────── */
  .vol-track {
    position: absolute;
    bottom: 6px; left: 10px; right: 10px;
    height: 3px;
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
  }
  .vol-fill {
    height: 100%;
    border-radius: var(--r-track);
    transition: width .15s ease-out;
  }

  /* ── Group dot (top-right corner) ────────────── */
  .group-dot {
    position: absolute;
    top: 8px; right: 8px;
    width: 8px; height: 8px;
    border-radius: 50%;
    display: none;
  }

  /* ── Floating Volume Pill (during drag) ──────── */
  .vol-pill {
    position: absolute; top: -4px; left: 50%;
    transform: translate(-50%, -100%);
    padding: 5px 14px; border-radius: var(--r-pill);
    background: var(--tile-bg);
    border: 1px solid var(--accent-border);
    box-shadow: var(--tile-shadow-lift);
    font-size: 14px; font-weight: 700; color: var(--accent);
    font-variant-numeric: tabular-nums;
    pointer-events: none; z-index: 101;
    opacity: 0; transition: opacity .12s ease;
    backdrop-filter: blur(12px);
  }

  /* ════════════════════════════════════════
     STATE: IDLE (not in group)
     ════════════════════════════════════════ */
  .spk-tile.idle .tile-icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
  }
  .spk-tile.idle .spk-name { color: var(--text-sub); }
  .spk-tile.idle .spk-meta { color: var(--text-muted); }
  .spk-tile.idle .spk-vol  { color: var(--text-muted); }
  .spk-tile.idle .vol-fill { background: var(--text-muted); opacity: 0.25; }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PLAYING
     ════════════════════════════════════════ */
  .spk-tile.in-group {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
  }
  .spk-tile.in-group .tile-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .spk-tile.in-group .spk-name { color: var(--text); }
  .spk-tile.in-group .spk-meta { color: var(--text-sub); }
  .spk-tile.in-group .spk-vol  { color: var(--accent); }
  .spk-tile.in-group .vol-fill { background: var(--accent-vol-bar); }
  .spk-tile.in-group .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
  }

  /* ════════════════════════════════════════
     STATE: IN GROUP + PAUSED
     ════════════════════════════════════════ */
  .spk-tile.in-group.paused {
    border-color: var(--accent-border);
  }
  .spk-tile.in-group.paused .tile-icon-wrap {
    background: var(--accent-fill);
    color: var(--accent);
    border: 1px solid var(--accent-border);
    opacity: 0.55;
  }
  .spk-tile.in-group.paused .spk-meta { color: var(--text-muted); font-style: italic; }
  .spk-tile.in-group.paused .spk-vol  { color: var(--text-muted); }
  .spk-tile.in-group.paused .vol-fill { background: var(--accent-vol-bar); opacity: 0.30; }
  .spk-tile.in-group.paused .group-dot {
    display: block;
    background: var(--accent);
    box-shadow: 0 0 10px var(--accent-glow);
    opacity: 0.5;
  }

  /* ════════════════════════════════════════
     STATE: DRAGGING (volume adjust)
     ════════════════════════════════════════ */
  .spk-tile.dragging {
    transform: scale(1.03);
    box-shadow: var(--tile-shadow-lift);
    z-index: 100;
    border-color: var(--accent);
  }
  .spk-tile.dragging .vol-pill { opacity: 1; }

  /* ── Action Buttons ────────────────────────────── */
  .grid-actions {
    display: flex; gap: 8px; margin-top: 12px;
    padding-top: 12px; border-top: 1px solid var(--divider);
  }
  .action-btn {
    display: flex; align-items: center; gap: 6px;
    padding: 9px 12px; border-radius: 11px;
    border: none; background: transparent; font-family: inherit;
    font-size: 13px; font-weight: 600; color: var(--text-sub);
    cursor: pointer; transition: background .1s;
    user-select: none;
  }
  .action-btn:hover { background: var(--track-bg); color: var(--text); }
  .action-btn:active { transform: scale(.97); }
  .action-btn .icon { color: var(--accent); }

  /* ── Reduced Motion ────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ── Responsive ────────────────────────────────── */
  @media (max-width: 440px) {
    .card { padding: 16px; --r-card: 20px; }
    .spk-grid {
      grid-template-columns: repeat(var(--cols-sm, 2), minmax(0, 1fr));
      gap: 8px;
    }
    .spk-tile { min-height: 56px; padding: 8px 10px 12px 8px; gap: 8px; }
    .tile-icon-wrap { width: 36px; height: 36px; border-radius: 10px; }
    .spk-name { font-size: 12px; }
    .spk-meta { font-size: 10px; }
    .spk-vol { font-size: 13px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TUNET_SPEAKER_GRID_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card">

      <!-- Header -->
      <div class="grid-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon icon-18">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Speakers</span>
            <span class="hdr-sub" id="hdrSub">Loading...</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
      </div>

      <!-- Speaker Grid -->
      <div class="spk-grid" id="spkGrid"></div>

      <!-- Group Actions -->
      <div class="grid-actions" id="gridActions" style="display:none">
        <button class="action-btn" id="groupAllBtn" aria-label="Group all speakers">
          <span class="icon icon-18">link</span> Group All
        </button>
        <button class="action-btn" id="ungroupBtn" aria-label="Ungroup all speakers">
          <span class="icon icon-18">link_off</span> Ungroup All
        </button>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetSpeakerGridCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._cachedSpeakers = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._tileRefs = new Map(); // entity -> { tile, iconWrap, nameEl, metaEl, volEl, volFill, dotEl, pill }

    // Drag state
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._volDebounce = null;

    // Long-press state
    this._longPressTimer = null;
    this._longPressFired = false;

    TunetSpeakerGridCard._injectFonts();
  }

  /* ── Font Injection (once globally) ─────────────── */

  static _injectFonts() {
    if (TunetSpeakerGridCard._fontsInjected) return;
    TunetSpeakerGridCard._fontsInjected = true;

    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
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
        {
          name: 'entity',
          required: true,
          selector: { entity: { filter: [{ domain: 'media_player' }] } },
        },
        { name: 'name', selector: { text: {} } },
        {
          name: 'coordinator_sensor',
          selector: { entity: { filter: [{ domain: 'sensor' }] } },
        },
        {
          name: '', type: 'grid', schema: [
            { name: 'columns',     selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
            { name: 'tile_size',   selector: { select: { options: ['standard', 'compact', 'large'] } } },
          ],
        },
        { name: 'show_group_actions', selector: { boolean: {} } },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => ({
        entity:             'Media Player Entity',
        name:               'Card Name',
        coordinator_sensor: 'Coordinator Sensor',
        columns:            'Grid Columns',
        tile_size:          'Tile Size',
        show_group_actions: 'Show Group/Ungroup Buttons',
        custom_css:         'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        custom_css: 'CSS rules injected into shadow DOM. Use .spk-grid, .spk-tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Speakers',
      coordinator_sensor: 'sensor.sonos_smart_coordinator',
      columns: 4,
      tile_size: 'standard',
      show_group_actions: true,
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define a media_player entity');
    }

    const asFinite = (v, fb) => { const n = Number(v); return Number.isFinite(n) ? n : fb; };
    const columns = Math.max(2, Math.min(8, Math.round(asFinite(config.columns, 4))));
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');

    this._config = {
      entity: config.entity,
      name: config.name || 'Speakers',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      columns,
      tile_size: tileSize,
      show_group_actions: config.show_group_actions !== false,
      custom_css: config.custom_css || '',
    };

    // Host attributes for CSS
    this.setAttribute('tile-size', tileSize);

    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ── HA State ───────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildGrid();
    }

    // Detect dark mode
    this.classList.toggle('dark', !!(hass.themes && hass.themes.darkMode));

    // Auto-detect speakers if not cached
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildGrid();
    }

    // Only update if relevant entities changed
    let changed = !oldHass;
    if (!changed) {
      const watchList = [this._config.entity, this._config.coordinator_sensor];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity));
      }
      for (const eid of watchList) {
        if (eid && oldHass.states[eid] !== hass.states[eid]) {
          changed = true;
          break;
        }
      }
    }

    if (changed) this._updateAll();
  }

  getCardSize() {
    const speakers = this._cachedSpeakers || this._config.speakers || [];
    const cols = this._config.columns || 4;
    const rows = Math.max(1, Math.ceil(speakers.length / cols));
    return 1 + rows; // 1 for header + rows of tiles
  }

  /* ── Lifecycle ──────────────────────────────────── */

  connectedCallback() {
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
  }

  disconnectedCallback() {
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._cooldownTimer);
  }

  /* ── Helpers ────────────────────────────────────── */

  _binarySensorFor(entityId) {
    const room = entityId.replace('media_player.', '');
    return `binary_sensor.sonos_${room}_in_playing_group`;
  }

  _callScript(name, data = {}) {
    if (!this._hass) return Promise.resolve(false);
    return window.TunetCardFoundation.callServiceSafe(this, 'script', name, data);
  }

  _callService(domain, service, data) {
    if (!this._hass) return Promise.resolve(false);
    return window.TunetCardFoundation.callServiceSafe(this, domain, service, data);
  }

  _normalizeSpeakerIcon(icon) {
    return window.TunetCardFoundation.normalizeIcon(icon, {
      fallback: 'speaker',
      allow: SPEAKER_ICON_ALLOW,
      aliases: {
        music: 'music_note',
        speakers: 'speaker_group',
      },
    });
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_playing_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
            icon: 'speaker',
          });
        }
      }
    }
    return speakers;
  }

  /* ── Rendering ──────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SPEAKER_GRID_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SPEAKER_GRID_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = ['card', 'infoTile', 'cardTitle', 'hdrSub', 'spkGrid', 'gridActions', 'groupAllBtn', 'ungroupBtn'];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  _setupListeners() {
    const $ = this.$;

    // Info tile → more-info
    window.TunetCardFoundation.bindActivate($.infoTile, (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._config.entity },
      }));
    }, { stopPropagation: true });

    // Group All
    $.groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_group_all_to_playing');
    });

    // Ungroup All
    $.ungroupBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callScript('sonos_ungroup_all');
    });
  }

  /* ── Build Speaker Grid (horizontal tiles) ──────── */

  _buildGrid() {
    const grid = this.$.spkGrid;
    if (!grid) return;
    grid.innerHTML = '';
    this._tileRefs.clear();

    // Refresh custom CSS on rebuild
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    const speakers = this._cachedSpeakers || [];
    const cols = this._config.columns;
    grid.style.setProperty('--cols', cols);
    grid.style.setProperty('--cols-sm', Math.min(2, cols));

    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'spk-tile idle';
      tile.tabIndex = 0;
      tile.setAttribute('role', 'slider');
      tile.setAttribute('aria-label', spk.name || spk.entity);
      tile.setAttribute('aria-valuemin', '0');
      tile.setAttribute('aria-valuemax', '100');
      tile.setAttribute('aria-valuenow', '0');
      tile.dataset.entity = spk.entity;

      // Group dot (top-right, hidden by default)
      const dotEl = document.createElement('div');
      dotEl.className = 'group-dot';
      tile.appendChild(dotEl);

      // Icon wrap (left)
      const iconWrap = document.createElement('div');
      iconWrap.className = 'tile-icon-wrap';
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.style.fontSize = '18px';
      icon.textContent = this._normalizeSpeakerIcon(spk.icon || 'speaker');
      iconWrap.appendChild(icon);
      tile.appendChild(iconWrap);

      // Text stack (center): name + meta (song / state)
      const textWrap = document.createElement('div');
      textWrap.className = 'spk-text';

      const nameEl = document.createElement('div');
      nameEl.className = 'spk-name';
      nameEl.textContent = spk.name || spk.entity;
      textWrap.appendChild(nameEl);

      const metaEl = document.createElement('div');
      metaEl.className = 'spk-meta';
      metaEl.textContent = 'Not grouped';
      textWrap.appendChild(metaEl);

      tile.appendChild(textWrap);

      // Volume % (right)
      const volEl = document.createElement('div');
      volEl.className = 'spk-vol';
      volEl.textContent = '--';
      tile.appendChild(volEl);

      // Volume bar (bottom inset)
      const volTrack = document.createElement('div');
      volTrack.className = 'vol-track';
      const volFill = document.createElement('div');
      volFill.className = 'vol-fill';
      volFill.style.width = '0%';
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);

      // Floating pill (hidden until drag)
      const pill = document.createElement('div');
      pill.className = 'vol-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);

      // Pointer events for drag + tap + long-press
      tile.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });

      grid.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, iconWrap, nameEl, metaEl, volEl, volFill, dotEl, pill });
    }

    // Show/hide group actions
    if (this.$.gridActions) {
      this.$.gridActions.style.display =
        (this._config.show_group_actions && speakers.length > 1) ? '' : 'none';
    }
  }

  /* ── Tile Pointer Handling ──────────────────────── */

  _onTilePointerDown(entity, e, tile) {
    this._dragEntity = entity;
    this._dragStartX = e.clientX;
    this._dragActive = false;
    this._longPressFired = false;

    // Get current volume as starting point
    const playerState = this._hass && this._hass.states[entity];
    this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;

    // Long-press timer (500ms)
    clearTimeout(this._longPressTimer);
    this._longPressTimer = setTimeout(() => {
      if (!this._dragActive && this._dragEntity === entity) {
        this._longPressFired = true;
        this.dispatchEvent(new CustomEvent('hass-more-info', {
          bubbles: true, composed: true,
          detail: { entityId: entity },
        }));
        this._dragEntity = null;
      }
    }, 500);
  }

  _onPointerMove(e) {
    if (!this._dragEntity) return;

    const dx = e.clientX - this._dragStartX;
    const THRESHOLD = 4;

    if (!this._dragActive) {
      if (Math.abs(dx) < THRESHOLD) return;
      this._dragActive = true;
      clearTimeout(this._longPressTimer);

      const refs = this._tileRefs.get(this._dragEntity);
      if (refs) refs.tile.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
    }

    // Map horizontal drag to volume: 200px = full range
    const pct = Math.max(0, Math.min(100, this._dragVol + Math.round(dx / 2)));

    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volEl.textContent = pct + '%';
      refs.pill.textContent = pct + '%';
      refs.volFill.style.width = pct + '%';
      refs.tile.setAttribute('aria-valuenow', String(pct));
    }

    // Debounced service call
    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._callService('media_player', 'volume_set', {
        entity_id: this._dragEntity,
        volume_level: pct / 100,
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
    }, 200);
  }

  _onPointerUp(e) {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);

    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);

    if (refs) {
      refs.tile.classList.remove('dragging');
    }
    document.body.style.cursor = '';

    // If not a drag and not a long-press -> tap -> toggle group
    if (!this._dragActive && !this._longPressFired) {
      this._callScript('sonos_toggle_group_membership', {
        target_speaker: entity,
      });
    }

    this._dragEntity = null;
    this._dragActive = false;
  }

  /* ── Full Update ────────────────────────────────── */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._serviceCooldown) return;

    const speakers = this._cachedSpeakers || [];
    $.cardTitle.textContent = this._config.name;

    // Count grouped speakers
    let groupedCount = 0;
    for (const spk of speakers) {
      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      if (bs && bs.state === 'on') groupedCount++;
    }

    // Header subtitle
    $.hdrSub.textContent = `${speakers.length} speakers \u00b7 ${groupedCount} grouped`;

    // Determine playing status from coordinator or main entity
    const coordSensor = this._hass.states[this._config.coordinator_sensor];
    const mainEntity = this._hass.states[this._config.entity];
    const isPlaying = (mainEntity && mainEntity.state === 'playing') ||
                      (coordSensor && coordSensor.state && coordSensor.state !== 'idle' && coordSensor.state !== 'unknown');

    // Update each tile
    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const bs = this._hass.states[this._binarySensorFor(spk.entity)];
      const inGroup = bs && bs.state === 'on';
      const playerState = this._hass.states[spk.entity];
      const speakerState = playerState ? playerState.state : 'idle';
      const isPaused = speakerState === 'paused';

      // Toggle state classes
      refs.tile.className = 'spk-tile';
      if (inGroup) {
        refs.tile.classList.add('in-group');
        if (isPaused) refs.tile.classList.add('paused');
      } else {
        refs.tile.classList.add('idle');
      }

      // Meta line: song name if playing, "Paused" if paused, "Not grouped" if idle
      if (inGroup && playerState) {
        if (isPaused) {
          refs.metaEl.textContent = 'Paused';
        } else {
          const title = playerState.attributes.media_title || '';
          const artist = playerState.attributes.media_artist || '';
          if (title) {
            refs.metaEl.textContent = artist ? `${title} \u2013 ${artist}` : title;
          } else {
            refs.metaEl.textContent = speakerState === 'playing' ? 'Playing' : 'Idle';
          }
        }
      } else {
        refs.metaEl.textContent = 'Not grouped';
      }

      // Volume
      if (playerState && !this._dragActive) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + '%';
        refs.volFill.style.width = vol + '%';
        refs.tile.setAttribute('aria-valuenow', String(vol));
      }
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

if (!customElements.get('tunet-speaker-grid-card')) {
  customElements.define('tunet-speaker-grid-card', TunetSpeakerGridCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-speaker-grid-card')) {
  window.customCards.push({
    type: 'tunet-speaker-grid-card',
    name: 'Tunet Speaker Grid Card',
    description: 'Sonos speaker grid with horizontal tiles, volume control, and group management',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-speaker-grid-card',
  });
}

console.info(
  `%c TUNET-SPEAKER-GRID %c v${TUNET_SPEAKER_GRID_VERSION} `,
  'color: #fff; background: #4682B4; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #4682B4; background: #e8f0f7; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
