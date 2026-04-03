/**
 * Tunet Lighting Card  v3.4.0 (v2 migration)
 * ──────────────────────────────────────────────────────────────
 * Complete rewrite aligned to Tunet Design Language v8.0 by Mac
 * Migrated to tunet_base.js shared module.
 *
 * Architecture:
 *   Shadow DOM custom element · Full token system (light + dark)
 *   Design-language header (info tile + toggles)
 *   Flexible layout: grid | scroll with full config
 *   Three entity patterns: rich YAML, group expansion, named zones
 *   Drag-to-dim · Floating pill · Manual-control dots
 *   Adaptive-lighting toggle · Per-entity cooldown
 *
 * Config options:
 *   entities:         [string[]]   Light entity IDs (groups auto-expand)
 *   zones:            [object[]]   Rich per-entity: {entity, name, icon}
 *   name:             string       Card title (default: "Lighting")
 *   subtitle:         string       Optional static subtitle override
 *   primary_entity:   string       Entity for info-tile tap (hass-more-info)
 *   adaptive_entity:  string       Legacy single adaptive entity (backward-compat)
 *   adaptive_entities:[string[]]   Adaptive entities/switches for this card
 *   show_adaptive_toggle: boolean  Show adaptive toggle control (default: true)
 *   show_manual_reset: boolean     Show reset-manual control when needed (default: true)
 *   layout:           'grid'|'scroll'   Layout mode (default: grid)
 *   columns:          2-8          Grid columns (default: 3)
 *   column_breakpoints: object|array  Responsive column rules by card/container width
 *   rows:             'auto'|2-6   Max visible rows in grid (default: auto)
 *   scroll_rows:      1-3          Rows in scroll mode (default: 2)
 *   tile_size:        'compact'|'standard'|'large'  Tile density preset (default: standard)
 *   use_profiles:     boolean      Enable family profile sizing (default: true)
 *   surface:          'card'|'section'|'tile'  Surface architecture (default: card)
 *   expand_groups:    boolean      Expand group entities into member lights (default: true)
 * ──────────────────────────────────────────────────────────────
 */

import {
  TOKENS, TOKENS_MIDNIGHT,
  RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  selectProfileSize, resolveSizeProfile, _setProfileVars,
  createAxisLockedDrag,
  registerCard, logCardVersion,
  renderConfigPlaceholder,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '3.5.0';

function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeColumnBreakpoints(raw) {
  const parsed = [];
  const pushRule = (rule) => {
    if (!rule || typeof rule !== 'object') return;
    const columns = clampInt(rule.columns, 2, 8, NaN);
    if (!Number.isFinite(columns)) return;
    const minWidth = Number.isFinite(Number(rule.min_width)) ? Math.max(0, Number(rule.min_width)) : null;
    const maxWidth = Number.isFinite(Number(rule.max_width)) ? Math.max(0, Number(rule.max_width)) : null;
    if (minWidth == null && maxWidth == null) return;
    parsed.push({ columns, minWidth, maxWidth });
  };

  if (Array.isArray(raw)) {
    raw.forEach((item) => pushRule(item));
  } else if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw)) {
      if (key === 'default') continue;
      const maxWidth = Number(key);
      const columns = clampInt(value, 2, 8, NaN);
      if (!Number.isFinite(maxWidth) || !Number.isFinite(columns)) continue;
      parsed.push({ columns, minWidth: null, maxWidth });
    }
    if (Object.prototype.hasOwnProperty.call(raw, 'default')) {
      const fallbackColumns = clampInt(raw.default, 2, 8, NaN);
      if (Number.isFinite(fallbackColumns)) {
        parsed.push({ columns: fallbackColumns, minWidth: null, maxWidth: null });
      }
    }
  }

  parsed.sort((a, b) => {
    const aMax = a.maxWidth == null ? Number.POSITIVE_INFINITY : a.maxWidth;
    const bMax = b.maxWidth == null ? Number.POSITIVE_INFINITY : b.maxWidth;
    return aMax - bMax;
  });
  return parsed;
}

/* ═══════════════════════════════════════════════════════════════
   CSS – Shared base + card-specific overrides
   ═══════════════════════════════════════════════════════════════ */

const LIGHTING_STYLES = `
${TOKENS}
${TOKENS_MIDNIGHT}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* ── Lighting-specific token overrides ──────── */
  :host {
    /* Mockup parity geometry */
    --r-track: 999px;
    --r-tile: 22px;
  }

  :host(.dark) {
    /* Warmer amber accent (overrides TOKENS_MIDNIGHT 0.12/0.25) */
    --amber-fill: rgba(251,191,36, 0.18);
    --amber-border: rgba(251,191,36, 0.32);

    /* Slightly brighter muted text (overrides TOKENS_MIDNIGHT 0.40) */
    --text-muted: rgba(248,250,252, 0.45);
  }

  /* ── Card surface overrides ─────────────────── */
  .card {
    width: 100%;
    max-width: 100%;
    overflow: visible;
    padding: var(--_tunet-card-pad, var(--card-pad, 20px));
  }

  /* ── Card state tint (Design Language §3.3) ─── */
  .card[data-any-on="true"] {
    border-color: rgba(212,133,10, 0.14);
  }
  :host(.dark) .card[data-any-on="true"] {
    border-color: rgba(251,191,36, 0.22);
  }

  /* ═══════════════════════════════════════════════════
     SECTION SURFACE (alternative container mode)
     surface: 'section' config option
     ═══════════════════════════════════════════════════ */
  :host([surface="section"]) .card {
    --r-card: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host(.dark[surface="section"]) .card {
    background: var(--section-bg);
    border-color: var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host([surface="section"]) .card::before {
    border-radius: var(--r-section);
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.40),
      rgba(255,255,255, 0.06) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.14));
  }
  :host(.dark[surface="section"]) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.10),
      rgba(255,255,255, 0.02) 40%,
      rgba(255,255,255, 0.005) 60%,
      rgba(255,255,255, 0.06));
  }

  /* ═══════════════════════════════════════════════════
     HEADER (Design Language §5)
     Info tile + spacer + toggles
     ═══════════════════════════════════════════════════ */
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--_tunet-section-gap, 16px);
  }
  :host([use-profiles]) .hdr {
    min-height: var(--_tunet-header-height, 0px);
  }

  /* Info Tile (§5.2) – tappable entity identifier */
  .info-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: var(--_tunet-ctrl-min-h, 42px);
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    cursor: pointer;
    transition: all .15s ease;
    min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .info-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  /* Info tile active state (any light on) */
  .card[data-any-on="true"] .info-tile {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }

  /* Entity Icon (§5.3) */
  .entity-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: all .2s ease;
    color: var(--text-muted);
  }
  .card[data-any-on="true"] .entity-icon {
    color: var(--amber);
  }
  .card[data-any-on="true"] .hdr-title {
    color: var(--text);
  }

  /* Title & Subtitle (§5.4) */
  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .hdr-title {
    font-weight: 700;
    font-size: var(--_tunet-header-title-font, var(--_tunet-header-font, 13px));
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: var(--_tunet-header-sub-font, var(--_tunet-sub-font, 10.5px));
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub .amber-ic    { color: var(--amber); }
  .hdr-sub .adaptive-ic { color: var(--text-muted); }
  .card[data-any-on="true"] .hdr-sub .adaptive-ic { color: var(--text); }
  .hdr-sub .red-ic      { color: var(--red); }

  /* Spacer (§5.5) */
  .hdr-spacer { flex: 1; }

  /* ── Pagination Dots (scroll mode) ───────────────── */
  .header-dots {
    display: none;
    gap: 5px;
    padding: 6px 10px;
    background: var(--track-bg);
    border-radius: var(--r-pill);
    align-items: center;
  }
  :host([layout="scroll"]) .header-dots { display: flex; }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-muted);
    opacity: 0.3;
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .dot.active {
    width: 14px;
    border-radius: var(--r-pill);
    opacity: 1;
    background: var(--amber);
  }

  /* ── Toggle Button (§5.6) – Adaptive lighting ────── */
  .toggle-btn {
    width: var(--_tunet-ctrl-min-h, 42px);
    min-height: var(--_tunet-ctrl-min-h, 42px);
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all .15s ease;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
  }
  .toggle-btn:hover { box-shadow: var(--shadow); }
  .toggle-btn:active { transform: scale(.94); }
  .toggle-btn:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .toggle-btn.on {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .toggle-btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .toggle-btn.hidden { display: none; }

  .toggle-btn.manual-reset {
    color: var(--red);
    border-color: rgba(239,68,68,0.30);
    background: rgba(239,68,68,0.10);
  }
  .toggle-btn.manual-reset .icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }
  .toggle-btn.manual-reset.hidden {
    display: none;
  }

  /* Manual count badge on adaptive toggle */
  .manual-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: var(--red);
    color: #fff;
    font-size: 10.5px;
    font-weight: 700;
    min-width: 18px;
    height: 18px;
    border-radius: var(--r-pill);
    text-align: center;
    line-height: 18px;
    padding: 0 4px;
    display: none;
    letter-spacing: 0.3px;
  }
  .toggle-wrap.has-manual .manual-badge { display: inline-flex; }
  .toggle-wrap { position: relative; }
  .toggle-wrap.hidden { display: none; }

  /* ═══════════════════════════════════════════════════
     TILE GRID (Design Language §3.5)
     ═══════════════════════════════════════════════════ */

  /* Standard grid layout */
  .light-grid {
    display: grid;
    grid-template-columns: repeat(var(--cols, 3), minmax(0, 180px));
    grid-auto-rows: var(--grid-row, 110px);
    gap: var(--_tunet-tile-gap, 10px);
    width: 100%;
    min-width: 0;
    overflow-y: visible;
    justify-content: center;
  }

  /* Max rows constraint — JS limits tile count in _render() instead
     of CSS overflow:hidden, so floating pill is never clipped */

  /* Scroll layout overrides */
  :host([layout="scroll"]) .light-grid {
    grid-template-columns: unset;
    grid-template-rows: repeat(var(--scroll-rows, 2), 1fr);
    grid-auto-flow: column;
    grid-auto-columns: calc(32% - 10px);
    overflow-x: auto;
    overflow-y: visible;
    overscroll-behavior-x: contain;
    overscroll-behavior-y: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 4px;
    row-gap: 14px;
    padding-bottom: 8px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  :host([use-profiles]) .light-grid {
    /* Reserve a little vertical headroom so drag pill can float above first row cleanly. */
    padding-top: 0.4em;
  }
  :host([layout="scroll"]) .light-grid::-webkit-scrollbar { display: none; }

  /* ═══════════════════════════════════════════════════
     LIGHT TILE (Design Language §3.5 Tile Surface)
     ═══════════════════════════════════════════════════ */
  .l-tile {
    --tile-icon-size: var(--_tunet-icon-box, 2.35em);
    background: var(--tile-bg);
    border-radius: var(--_tunet-tile-radius, var(--r-tile));
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: pan-y;
    border: 1px solid var(--border-ghost);
    overflow: hidden;
    min-height: 0;
    height: 100%;
    gap: var(--_tunet-tile-gap, 0.14em);
    padding:
      var(--_tunet-tile-pad, 0.62em)
      calc(var(--_tunet-tile-pad, 0.62em) * 0.55)
      calc(var(--_tunet-tile-pad, 0.62em) * 1.68);
    -webkit-tap-highlight-color: transparent;
    transition: all 0.18s ease;
  }
  :host([use-profiles]) .l-tile {
    min-height: max(var(--_tunet-tile-min-h, 0px), 6.25em);
    /* Keep text/progress lanes visible in compact profile mode. */
    padding-bottom: calc(var(--_tunet-tile-pad, 0.62em) * 1.95);
  }

  @media (hover: hover) and (pointer: fine) {
    .l-tile:hover {
      box-shadow: var(--shadow-up);
    }
  }
  .l-tile:active {
    transform: scale(var(--press-scale-strong));
  }

  /* Compact tile variant */
  :host(:not([use-profiles])[tile-size="compact"]) .l-tile {
    --tile-icon-size: 1.92em;
    gap: 0.06em;
    padding: 0.46em 0.26em 1.22em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon-wrap {
    margin-top: 0;
    margin-bottom: 0.14em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .zone-name {
    font-size: 12.2px;
    max-width: 96%;
    min-height: 1.12em;
    line-height: 1.06;
    margin-bottom: 0;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .zone-val {
    font-size: 11.6px;
    line-height: 1.04;
    margin-top: 0;
    margin-bottom: 5px;
  }
  :host(:not([use-profiles])[tile-size="compact"][dense-compact]) .l-tile {
    --tile-icon-size: 1.72em;
    padding: 0.42em 0.22em 1.24em;
  }
  :host(:not([use-profiles])[tile-size="compact"][dense-compact]) .zone-name {
    font-size: 11.6px;
  }
  :host(:not([use-profiles])[tile-size="compact"][dense-compact]) .zone-val {
    font-size: 11px;
    margin-bottom: 6px;
  }
  :host(:not([use-profiles])[tile-size="large"]) .l-tile {
    padding: 12px 10px 18px;
  }

  /* Scroll layout tile additions */
  :host([layout="scroll"]) .l-tile { scroll-snap-align: start; }
  :host(:not([use-profiles])[layout="scroll"][tile-size="compact"]) .l-tile {
    padding-bottom: 30px;
  }

  /* Focus visible on tiles */
  .l-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* ── Off State ───────────────────────────────────── */
  .l-tile.off { opacity: 1; }
  .l-tile.off .tile-icon-wrap {
    background: var(--gray-ghost);
    color: var(--text-muted);
    border: 1px solid var(--ctrl-border);
  }
  .l-tile.off .zone-name { color: var(--text-sub); }
  .l-tile.off .zone-val { color: var(--text-sub); opacity: 0.5; }
  .l-tile.off .progress-fill { opacity: 0; }

  /* ── Unavailable State ───────────────────────────── */
  .l-tile.unavailable {
    opacity: 0.38;
    filter: saturate(0.45);
  }
  .l-tile.unavailable .tile-icon-wrap {
    background: var(--track-bg);
    color: var(--text-muted);
    border: 1px solid var(--ctrl-border);
  }
  .l-tile.unavailable .zone-val {
    color: var(--text-muted);
    opacity: 0.9;
  }

  /* ── On State ────────────────────────────────────── */
  .l-tile.on { border-color: var(--amber-border); }
  .l-tile.on .tile-icon-wrap {
    background: var(--amber-fill);
    color: var(--amber);
    border: 1px solid var(--amber-border);
  }
  .l-tile.on .zone-val { color: var(--amber); }
  .l-tile.on .progress-fill { background: rgba(212,133,10, 0.90); }
  :host(.dark) .l-tile.on .progress-fill { background: rgba(251,191,36, 0.90); }
  .l-tile.on .tile-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* ── Sliding State (drag active) ─────────────────── */
  .l-tile.sliding {
    transform: scale(var(--drag-scale));
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--amber) !important;
    overflow: visible;
    transition: none;
  }

  /* Floating pill – .zone-val repositions during slide */
  .l-tile.sliding .zone-val {
    position: absolute;
    top: 0.48em;
    left: 50%;
    transform: translate(-50%, -72%);
    color: var(--amber);
    font-weight: 700;
    font-size: 15px;
    letter-spacing: 0.2px;
    background: var(--tile-bg);
    padding: 6px 20px;
    border-radius: var(--r-pill);
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 101;
    border: 1px solid rgba(255,255,255,0.1);
    opacity: 1;
    white-space: nowrap;
    pointer-events: none;
  }

  .l-tile.sliding .progress-track { height: 6px; }

  /* ── Tile Content ────────────────────────────────── */
  .tile-icon-wrap {
    width: var(--tile-icon-size, 2.35em);
    height: var(--tile-icon-size, 2.35em);
    min-width: var(--tile-icon-size, 2.35em);
    min-height: var(--tile-icon-size, 2.35em);
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    display: grid;
    place-items: center;
    margin-top: 0.08em;
    margin-bottom: 0.2em;
    transition: all .2s ease;
  }
  .tile-icon-wrap .icon {
    width: var(--_tunet-icon-glyph, 1.3em);
    height: var(--_tunet-icon-glyph, 1.3em);
    font-size: var(--_tunet-icon-glyph, 1.3em);
    line-height: 1;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon-wrap .icon {
    width: 1.02em;
    height: 1.02em;
    font-size: 1.02em;
  }

  .zone-name {
    font-size: var(--_tunet-display-name-font, var(--_tunet-name-font, 14px));
    font-weight: 600;
    letter-spacing: 0.1px;
    color: var(--text);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 90%;
    line-height: 1.15;
    margin-bottom: 1px;
    min-height: 1.1em;
    flex: 0 0 auto;
  }

  .zone-val {
    font-size: var(--_tunet-display-value-font, var(--_tunet-value-font, 13px));
    font-weight: 700;
    letter-spacing: 0.1px;
    line-height: 1.15;
    transition: color .2s;
    font-variant-numeric: tabular-nums;
    flex: 0 0 auto;
  }

  /* ── Progress Track (bottom inset) ───────────────── */
  .progress-track {
    position: absolute;
    bottom: calc(var(--_tunet-tile-pad, 14px) * 0.72);
    left: var(--_tunet-tile-pad, 14px);
    right: var(--_tunet-tile-pad, 14px);
    height: var(--_tunet-progress-h, 4px);
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
    transition: height .2s ease;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .progress-track {
    bottom: 6px;
    left: 10px;
    right: 10px;
    height: 3px;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    background: var(--text-sub);
    transition: width .1s ease-out;
    border-radius: var(--r-track);
  }

  /* ── Manual Override Dot ──────────────────────────── */
  .manual-dot {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 8px;
    height: 8px;
    background: var(--red);
    border-radius: 50%;
    display: none;
    box-shadow: var(--glow-manual);
  }
  .l-tile[data-manual="true"] .manual-dot { display: block; }

  /* ═══════════════════════════════════════════════════
     ACCESSIBILITY (Design Language §11)
     ═══════════════════════════════════════════════════ */
${REDUCED_MOTION}

  /* ═══════════════════════════════════════════════════
     RESPONSIVE (Design Language §4.6)
     ═══════════════════════════════════════════════════ */
  @media (max-width: 440px) {
    .card {
      padding: var(--card-pad, 14px);
      --r-track: 999px;
    }
    .light-grid { gap: 6px; }
    .l-tile { min-height: 82px; }
    :host(:not([use-profiles])[tile-size="compact"]) .zone-name {
      font-size: 12.2px;
      line-height: 1.08;
      min-height: 1.15em;
      margin-bottom: 1px;
    }
    :host(:not([use-profiles])[tile-size="compact"]) .zone-val {
      font-size: 11.8px;
      line-height: 1.08;
      margin-top: 2px;
    }

    :host([layout="scroll"]) .light-grid {
      grid-auto-columns: calc(44% - 6px);
      scroll-padding-left: 0;
    }

    :host([surface="section"]) .card {
      --r-card: 28px;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   HTML Template
   ═══════════════════════════════════════════════════════════════ */

const LIGHTING_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card">

      <!-- Header (Design Language §5) -->
      <div class="hdr">

        <!-- Info Tile (§5.2) -->
        <div class="info-tile" id="infoTile" tabindex="0"
             role="button" aria-label="Show lighting details">
          <div class="entity-icon" id="entityIcon">
            <span class="icon icon-18" id="entityGlyph">lightbulb</span>
          </div>
          <div class="hdr-text">
            <div class="hdr-title" id="hdrTitle">Lighting</div>
            <div class="hdr-sub" id="hdrSub">All off</div>
          </div>
        </div>

        <!-- Spacer -->
        <div class="hdr-spacer"></div>

        <!-- Pagination dots (scroll mode only) -->
        <div class="header-dots" id="headerDots"></div>

        <!-- Manual reset (shows only when manual overrides exist) -->
        <div class="toggle-wrap" id="manualResetWrap">
          <button class="toggle-btn manual-reset hidden" id="manualResetBtn"
                  aria-label="Clear manual adaptive overrides">
            <span class="icon icon-18">restart_alt</span>
          </button>
          <span class="manual-badge" id="manualBadge">0</span>
        </div>

        <!-- Adaptive Lighting Toggle (§5.6) -->
        <div class="toggle-wrap" id="adaptiveWrap">
          <button class="toggle-btn hidden" id="adaptiveBtn"
                  aria-label="Toggle adaptive lighting">
            <span class="icon icon-18">auto_awesome</span>
          </button>
        </div>

      </div>

      <!-- Tile Grid -->
      <div class="light-grid" id="lightGrid"></div>

    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetLightingCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._resolvedZones = [];  // [{entity, name, icon}, ...]
    this._tiles = {};
    this._serviceCooldown = {};
    this._cooldownTimers = {};
    this._activeColumns = 3;
    this._tileDragController = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._widthBucket440 = null;
    this._widthBucket640 = null;
    this._profileSelection = null;

    injectFonts();
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
  }

  /* ═══════════════════════════════════════════════════
     CONFIG – Declarative schema (Design Language §13)
     ═══════════════════════════════════════════════════ */

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'entities',
          selector: { entity: { multiple: true, filter: [{ domain: 'light' }] } },
        },
        {
          name: 'zones',
          selector: {
            object: {
              multiple: true,
              label_field: 'name',
              description_field: 'entity',
              fields: {
                entity: {
                  label: 'Entity',
                  required: true,
                  selector: { entity: { filter: [{ domain: 'light' }] } },
                },
                name: {
                  label: 'Name',
                  selector: { text: {} },
                },
                icon: {
                  label: 'Icon',
                  selector: { icon: {} },
                },
              },
            },
          },
        },
        { name: 'name',            selector: { text: {} } },
        { name: 'primary_entity',  selector: { entity: {} } },
        {
          name: 'adaptive_entities',
          selector: { entity: { multiple: true, filter: [{ domain: 'switch' }, { domain: 'automation' }, { domain: 'input_boolean' }] } },
        },
        { name: 'show_adaptive_toggle', selector: { boolean: {} } },
        { name: 'show_manual_reset', selector: { boolean: {} } },
        { name: 'surface',         selector: { select: { options: ['card', 'section', 'tile'] } } },
        { name: 'layout',          selector: { select: { options: ['grid', 'scroll'] } } },
        { name: 'columns',     selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } } },
        {
          name: 'column_breakpoints',
          selector: {
            object: {
              multiple: true,
              label_field: 'columns',
              fields: {
                min_width: {
                  label: 'Min Width (px)',
                  selector: { number: { min: 0, max: 4000, step: 1, mode: 'box' } },
                },
                max_width: {
                  label: 'Max Width (px)',
                  selector: { number: { min: 0, max: 4000, step: 1, mode: 'box' } },
                },
                columns: {
                  label: 'Columns',
                  required: true,
                  selector: { number: { min: 2, max: 8, step: 1, mode: 'box' } },
                },
              },
            },
          },
        },
        { name: 'scroll_rows', selector: { number: { min: 1, max: 3, step: 1, mode: 'box' } } },
        { name: 'rows',        selector: { text: {} } },
        { name: 'tile_size',   selector: { select: { options: ['standard', 'compact', 'large'] } } },
        { name: 'use_profiles', selector: { boolean: {} } },
        { name: 'expand_groups', selector: { boolean: {} } },
        {
          type: 'expandable',
          flatten: true,
          title: 'Advanced',
          icon: 'mdi:code-braces',
          schema: [
            { name: 'custom_css', selector: { text: { multiline: true } } },
          ],
        },
      ],
      computeLabel: (s) => ({
        entities:        'Light Entities (groups auto-expand)',
        zones:           'Zones (objects with entity/name/icon)',
        name:            'Card Title',
        primary_entity:  'Primary Entity (info tile tap)',
        adaptive_entities:'Adaptive Entities (multi-zone)',
        show_adaptive_toggle: 'Show Adaptive Toggle',
        show_manual_reset: 'Show Manual Reset Icon',
        surface:         'Surface Style',
        layout:          'Layout Mode',
        columns:         'Grid Columns',
        column_breakpoints: 'Responsive Column Breakpoints',
        rows:            'Max Rows (auto or number)',
        scroll_rows:     'Scroll Rows',
        tile_size:       'Tile Size',
        use_profiles:    'Use Profile Sizing',
        expand_groups:   'Expand Group Entities',
        custom_css:      'Custom CSS (injected into shadow DOM)',
      }[s.name] || s.name),
      computeHelper: (s) => ({
        zones: 'Optional rich zones list. Each item: entity (required), optional name, optional icon.',
        adaptive_entities: 'If omitted, card auto-matches adaptive_lighting switches to current zones.',
        column_breakpoints: 'Responsive rules list. Each item needs columns plus min_width or max_width.',
        use_profiles: 'When enabled, size geometry comes from profile families instead of legacy tile-size CSS variants.',
        custom_css: 'CSS rules injected into shadow DOM. Use .light-grid, .l-tile, etc.',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return { entities: [], name: 'Lighting', use_profiles: true };
  }

  setConfig(config) {
    const legacyEntities = [];
    if ((!Array.isArray(config.entities) || config.entities.length === 0) && config.light_group) {
      legacyEntities.push(config.light_group);
    }
    const legacyZones = [];
    if ((!Array.isArray(config.zones) || config.zones.length === 0) && config.light_overrides) {
      for (const [entity, override] of Object.entries(config.light_overrides)) {
        legacyZones.push({
          entity,
          name: override && override.name ? override.name : null,
          icon: override && override.icon ? override.icon : null,
        });
      }
    }

    const normalizedEntities = Array.isArray(config.entities)
      ? config.entities.filter(Boolean)
      : legacyEntities;
    const normalizedZones = Array.isArray(config.zones)
      ? config.zones.filter(Boolean)
      : legacyZones;

    // Support three entity patterns:
    // 1. zones: [{entity, name, icon}, ...]  (rich per-entity)
    // 2. entities: [string, ...]  (simple list + group expansion)
    // 3. Both can be mixed
    const hasZones = normalizedZones.length > 0;
    const hasEntities = normalizedEntities.length > 0;

    if (!hasZones && !hasEntities) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Add light entities via zones or entities config', 'Lighting');
      return;
    }

    const asFinite = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };
    const columns = clampInt(config.columns, 2, 8, 3);
    const scrollRows = clampInt(config.scroll_rows, 1, 3, 2);
    const layout = config.layout === 'scroll' ? 'scroll' : 'grid';
    const surface = (config.surface === 'section' || config.surface === 'tile')
      ? config.surface
      : 'card';
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact' ? 'compact' : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const useProfiles = config.use_profiles !== false;
    const expandGroups = config.expand_groups !== false;
    const showAdaptiveToggle = config.show_adaptive_toggle !== false;
    const showManualReset = config.show_manual_reset !== false;
    const adaptiveEntities = Array.from(new Set(
      (Array.isArray(config.adaptive_entities) ? config.adaptive_entities : []).filter(Boolean)
    ));
    const columnBreakpoints = normalizeColumnBreakpoints(config.column_breakpoints);
    const rows = config.rows === 'auto' || config.rows == null
      ? null
      : (() => {
          const parsed = asFinite(config.rows, 0);
          if (parsed <= 0) return null;
          return Math.max(1, Math.min(6, Math.round(parsed)));
        })();

    this._config = {
      entities:        hasEntities ? normalizedEntities : [],
      zones:           hasZones ? normalizedZones : [],
      name:            config.name || 'Lighting',
      subtitle:        config.subtitle || '',
      primary_entity:  config.primary_entity || '',
      adaptive_entity: config.adaptive_entity || '',
      adaptive_entities: adaptiveEntities,
      show_adaptive_toggle: showAdaptiveToggle,
      show_manual_reset: showManualReset,
      columns,
      column_breakpoints: columnBreakpoints,
      layout,
      scroll_rows:     scrollRows,
      surface,
      tile_size:       tileSize,
      use_profiles:    useProfiles,
      expand_groups:   expandGroups,
      rows,
      custom_css:      config.custom_css || '',
    };

    // Host attributes for CSS layout switching
    if (layout === 'scroll') {
      this.setAttribute('layout', 'scroll');
    } else {
      this.removeAttribute('layout');
    }

    if (surface === 'section' || surface === 'tile') {
      this.setAttribute('surface', surface);
    } else {
      this.removeAttribute('surface');
    }

    if (useProfiles) this.setAttribute('use-profiles', '');
    else this.removeAttribute('use-profiles');

    if (rows) {
      this.setAttribute('data-max-rows', rows);
      this.style.setProperty('--max-rows', rows);
    } else {
      this.removeAttribute('data-max-rows');
    }

    this._applyProfile(this._getHostWidth());

    if (this._rendered && this._hass) {
      this._resolveZones();
      this._activeColumns = this._resolveResponsiveColumns();
      this._buildGrid();
      this._updateAll();
    }
  }

  /* ═══════════════════════════════════════════════════
     HA STATE
     ═══════════════════════════════════════════════════ */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._resolveZones();
      this._applyProfile(this._getHostWidth());
      this._activeColumns = this._resolveResponsiveColumns();
      this._buildGrid();
      this._setupListeners();
      this._rendered = true;
    }

    // Dark mode detection (Design Language §12.1)
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    if (!oldHass || this._entitiesChanged(oldHass, hass)) {
      this._updateAll();
    }
  }

  _entitiesChanged(oldH, newH) {
    for (const zone of this._resolvedZones) {
      if (oldH.states[zone.entity] !== newH.states[zone.entity]) return true;
    }
    for (const ae of (this._config.adaptive_entities || [])) {
      if (oldH.states[ae] !== newH.states[ae]) return true;
    }
    const legacyAdaptive = this._config.adaptive_entity;
    if (legacyAdaptive && oldH.states[legacyAdaptive] !== newH.states[legacyAdaptive]) return true;
    // Watch all AL switches for manual_control changes
    for (const key of Object.keys(newH.states)) {
      if (key.startsWith('switch.adaptive_lighting_') && oldH.states[key] !== newH.states[key]) return true;
    }
    return false;
  }

  getCardSize() {
    if (this._config.layout === 'scroll') {
      return Math.max(2, 1 + (this._config.scroll_rows || 2) * 2);
    }
    const cols = this._activeColumns || this._config.columns || 3;
    const computedRows = Math.ceil(this._resolvedZones.length / cols);
    const visibleRows = this._config.rows || computedRows;
    return Math.max(2, 2 + visibleRows * 2);
  }

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 2,
      max_rows: 12,
    };
  }

  _getHostWidth(widthHint = null) {
    const parsed = Number(widthHint);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
    const cardWidth = Number(this.$?.card?.getBoundingClientRect?.().width);
    if (Number.isFinite(cardWidth) && cardWidth > 0) return cardWidth;
    const hostWidth = Number(this.getBoundingClientRect?.().width);
    if (Number.isFinite(hostWidth) && hostWidth > 0) return hostWidth;
    return 1024;
  }

  _isWidthAtMost(maxWidth, widthHint = null) {
    return this._getHostWidth(widthHint) <= maxWidth;
  }

  _resolveResponsiveColumns(widthHint = null) {
    const baseColumns = this._config.columns || 3;
    const width = this._getHostWidth(widthHint);
    const rules = Array.isArray(this._config.column_breakpoints) ? this._config.column_breakpoints : [];
    for (const rule of rules) {
      const minWidth = rule.minWidth == null ? Number.NEGATIVE_INFINITY : rule.minWidth;
      const maxWidth = rule.maxWidth == null ? Number.POSITIVE_INFINITY : rule.maxWidth;
      if (width >= minWidth && width <= maxWidth) return rule.columns;
    }
    return baseColumns;
  }

  _setLegacyTileSizeAttr(size) {
    if (size === 'compact' || size === 'large') this.setAttribute('tile-size', size);
    else this.removeAttribute('tile-size');
  }

  _applyProfile(widthHint = null) {
    const useProfiles = this._config.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute('profile-family');
      this.removeAttribute('profile-size');
      this._setLegacyTileSizeAttr(this._config.tile_size || 'standard');
      return;
    }

    const width = this._getHostWidth(widthHint);
    const selection = selectProfileSize({
      preset: 'lighting',
      layout: this._config.layout || 'grid',
      widthHint: width,
      userSize: this._config.tile_size,
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute('profile-family', selection.family);
    this.setAttribute('profile-size', selection.size);
    this._setLegacyTileSizeAttr(selection.size);
  }

  /* ═══════════════════════════════════════════════════
     ZONE RESOLUTION – Three entity patterns
     ═══════════════════════════════════════════════════ */

  _resolveZones() {
    const zones = [];
    const seen = new Set();

    const addZone = (entity, name, icon) => {
      if (seen.has(entity)) return;
      seen.add(entity);
      zones.push({ entity, name: name || null, icon: icon || null });
    };

    // Pattern 1: Rich per-entity YAML zones
    for (const z of this._config.zones) {
      if (typeof z === 'string') {
        // Simple string in zones array
        this._expandEntity(z, zones, seen);
      } else if (z && z.entity) {
        // Rich zone object – check if it's a group
        const entity = this._hass ? this._hass.states[z.entity] : null;
        if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id &&
            Array.isArray(entity.attributes.entity_id)) {
          // Group – expand with optional name/icon overrides
          for (const memberId of entity.attributes.entity_id) {
            addZone(memberId, null, null);
          }
        } else {
          addZone(z.entity, z.name || null, z.icon || null);
        }
      }
    }

    // Pattern 2: Entity list with group expansion
    for (const id of this._config.entities) {
      this._expandEntity(id, zones, seen);
    }

    this._resolvedZones = zones;
  }

  _expandEntity(id, zones, seen) {
    if (seen.has(id)) return;
    const entity = this._hass ? this._hass.states[id] : null;
    if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id &&
        Array.isArray(entity.attributes.entity_id)) {
      // It's a group – expand to individual members
      for (const memberId of entity.attributes.entity_id) {
        if (!seen.has(memberId)) {
          seen.add(memberId);
          zones.push({ entity: memberId, name: null, icon: null });
        }
      }
    } else {
      seen.add(id);
      zones.push({ entity: id, name: null, icon: null });
    }
  }

  /* ═══════════════════════════════════════════════════
     LIFECYCLE
     ═══════════════════════════════════════════════════ */

  connectedCallback() {
    this._setupResizeObserver();
    if (typeof ResizeObserver === 'undefined') {
      this._usingWindowResizeFallback = true;
      window.addEventListener('resize', this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }

  disconnectedCallback() {
    if (this._tileDragController) {
      this._tileDragController.destroy();
      this._tileDragController = null;
    }
    if (this._usingWindowResizeFallback) {
      window.removeEventListener('resize', this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
    for (const timer of Object.values(this._cooldownTimers)) {
      clearTimeout(timer);
    }
    this._cooldownTimers = {};
    this._serviceCooldown = {};
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
    if (!this._rendered) return;
    const width = this._getHostWidth(widthHint);
    const prevProfileSize = this._profileSelection?.size || '';
    this._applyProfile(width);
    const profileChanged = (this._profileSelection?.size || '') !== prevProfileSize;
    const nextColumns = this._resolveResponsiveColumns(width);
    const nextBucket440 = this._isWidthAtMost(440, width);
    const nextBucket640 = this._isWidthAtMost(640, width);
    const columnsChanged = nextColumns !== this._activeColumns;
    const bucketChanged = nextBucket440 !== this._widthBucket440 || nextBucket640 !== this._widthBucket640;
    if (!columnsChanged && !bucketChanged && !profileChanged) return;
    this._activeColumns = nextColumns;
    this._widthBucket440 = nextBucket440;
    this._widthBucket640 = nextBucket640;
    this._buildGrid();
    this._updateAll();
  }

  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }

  /* ═══════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════ */

  _render() {
    const style = document.createElement('style');
    style.textContent = LIGHTING_STYLES;
    this.shadowRoot.appendChild(style);

    // Custom CSS override layer
    this._customStyleEl = document.createElement('style');
    this._customStyleEl.textContent = this._config.custom_css || '';
    this.shadowRoot.appendChild(this._customStyleEl);

    const tpl = document.createElement('template');
    tpl.innerHTML = LIGHTING_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    this.$ = {
      card:        this.shadowRoot.querySelector('.card'),
      infoTile:    this.shadowRoot.getElementById('infoTile'),
      entityIcon:  this.shadowRoot.getElementById('entityIcon'),
      entityGlyph: this.shadowRoot.getElementById('entityGlyph'),
      hdrTitle:    this.shadowRoot.getElementById('hdrTitle'),
      hdrSub:      this.shadowRoot.getElementById('hdrSub'),
      headerDots:  this.shadowRoot.getElementById('headerDots'),
      manualResetWrap:this.shadowRoot.getElementById('manualResetWrap'),
      manualResetBtn:this.shadowRoot.getElementById('manualResetBtn'),
      adaptiveWrap:this.shadowRoot.getElementById('adaptiveWrap'),
      adaptiveBtn: this.shadowRoot.getElementById('adaptiveBtn'),
      manualBadge: this.shadowRoot.getElementById('manualBadge'),
      lightGrid:   this.shadowRoot.getElementById('lightGrid'),
    };

    const width = this._getHostWidth();
    this._activeColumns = this._resolveResponsiveColumns(width);
    this._widthBucket440 = this._isWidthAtMost(440, width);
    this._widthBucket640 = this._isWidthAtMost(640, width);
  }

  _buildGrid() {
    const grid = this.$.lightGrid;
    if (!grid) return;
    grid.innerHTML = '';

    // Refresh custom CSS on rebuild (covers config editor changes)
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || '';

    // Set CSS custom properties
    const activeColumns = this._activeColumns || this._config.columns || 3;
    const activeTileSize = this._profileSelection?.size || this._config.tile_size || 'standard';
    const useProfiles = this._config.use_profiles !== false;
    grid.style.setProperty('--cols', activeColumns);
    grid.style.setProperty('--scroll-rows', this._config.scroll_rows);
    if (!useProfiles && activeTileSize === 'compact' && activeColumns >= 5) {
      this.setAttribute('dense-compact', '');
    } else {
      this.removeAttribute('dense-compact');
    }
    const isMobile = this._widthBucket440 == null ? this._isWidthAtMost(440) : this._widthBucket440;
    const rowHeight = useProfiles
      ? 'max(var(--_tunet-tile-min-h, 110px), 6.25em)'
      : (activeTileSize === 'compact'
        ? (isMobile ? '94px' : '100px')
        : (activeTileSize === 'large'
          ? (isMobile ? '124px' : '132px')
          : (isMobile ? '102px' : '110px')));
    grid.style.setProperty('--grid-row', rowHeight);

    // Limit visible tiles when rows is set (avoids overflow:hidden clipping pill)
    const cols = activeColumns;
    const maxRows = parseInt(this._config.rows, 10);
    const maxTiles = (maxRows > 0 && this._config.layout !== 'scroll')
      ? maxRows * cols
      : Infinity;
    const visibleZones = this._resolvedZones.slice(0, maxTiles);

    for (const zone of visibleZones) {
      const tile = document.createElement('div');
      tile.className = 'l-tile off';
      tile.dataset.entity = zone.entity;
      tile.dataset.brightness = '0';
      tile.setAttribute('role', 'slider');
      tile.setAttribute('aria-label', this._zoneName(zone));
      tile.setAttribute('aria-valuemin', '0');
      tile.setAttribute('aria-valuemax', '100');
      tile.setAttribute('aria-valuenow', '0');
      tile.setAttribute('tabindex', '0');

      tile.innerHTML = `
        <div class="manual-dot"></div>
        <div class="tile-icon-wrap">
          <span class="icon icon-20">${this._zoneIcon(zone)}</span>
        </div>
        <div class="zone-name">${this._zoneName(zone)}</div>
        <div class="zone-val">Off</div>
        <div class="progress-track">
          <div class="progress-fill" style="width:0%"></div>
        </div>
      `;

      grid.appendChild(tile);
    }

    // Cache tile refs for fast updates
    this._tiles = {};
    grid.querySelectorAll('.l-tile').forEach(tile => {
      this._tiles[tile.dataset.entity] = {
        el:     tile,
        icon:   tile.querySelector('.tile-icon-wrap .icon'),
        iconW:  tile.querySelector('.tile-icon-wrap'),
        name:   tile.querySelector('.zone-name'),
        val:    tile.querySelector('.zone-val'),
        fill:   tile.querySelector('.progress-fill'),
      };
    });

    // Build pagination dots for scroll mode
    this._buildDots();
  }

  _buildDots() {
    const dots = this.$.headerDots;
    dots.innerHTML = '';
    if (this._config.layout !== 'scroll') return;

    const totalTiles = this._resolvedZones.length;
    const rows = this._config.scroll_rows;
    const tilesPerPage = rows * 3;
    const pages = Math.max(1, Math.ceil(totalTiles / tilesPerPage));

    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dots.appendChild(dot);
    }
  }

  /* ═══════════════════════════════════════════════════
     LISTENERS
     ═══════════════════════════════════════════════════ */

  _setupListeners() {
    // Info tile – fires hass-more-info (Design Language §11.2)
    this.$.infoTile.addEventListener('click', () => {
      const entityId = this._config.primary_entity ||
                       (this._config.entities.length > 0 ? this._config.entities[0] : '') ||
                       (this._resolvedZones.length > 0 ? this._resolvedZones[0].entity : '');
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true,
        composed: true,
        detail: { entityId },
      }));
    });

    // Adaptive toggle (global for resolved adaptive entities).
    this.$.adaptiveBtn.addEventListener('click', () => this._toggleAdaptive());

    // Explicit manual reset control (shows only when overrides exist).
    this.$.manualResetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._resetManualControl();
    });

    this._initTileDrag();

    // Keyboard on tiles (Design Language §11.3)
    this.$.lightGrid.addEventListener('keydown', (e) => {
      const tile = e.target.closest('.l-tile');
      if (!tile) return;
      const entity = tile.dataset.entity;
      const step = e.shiftKey ? 10 : 5;

      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
        e.preventDefault();
        this._setBrightness(entity, Math.min(100, this._getBrightness(entity) + step));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
        e.preventDefault();
        this._setBrightness(entity, Math.max(0, this._getBrightness(entity) - step));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._toggleLight(entity);
      }
    });

    // Scroll sync for pagination dots
    if (this._config.layout === 'scroll') {
      this.$.lightGrid.addEventListener('scroll', () => {
        const grid = this.$.lightGrid;
        const dots = this.$.headerDots.querySelectorAll('.dot');
        if (!dots.length) return;
        const scrollMax = grid.scrollWidth - grid.clientWidth;
        if (scrollMax <= 0) return;
        const pct = grid.scrollLeft / scrollMax;
        const idx = Math.round(pct * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     POINTER HANDLERS – axis-locked drag helper
     ═══════════════════════════════════════════════════ */

  _initTileDrag() {
    if (!this.$?.lightGrid) return;
    if (this._tileDragController) {
      this._tileDragController.destroy();
      this._tileDragController = null;
    }

    this._tileDragController = createAxisLockedDrag({
      element: this.$.lightGrid,
      deadzone: 8,
      axisBias: 1.3,
      pointerCapture: false,
      shouldStart: (event) => !!event.target.closest('.l-tile'),
      getContext: (event) => {
        const tileEl = event.target.closest('.l-tile');
        if (!tileEl) return false;
        const entity = tileEl.dataset.entity;
        if (!entity) return false;
        return {
          tileEl,
          entity,
          pointerType: event.pointerType || 'mouse',
          startBright: parseInt(tileEl.dataset.brightness, 10) || 0,
          currentBright: parseInt(tileEl.dataset.brightness, 10) || 0,
        };
      },
      onDragStart: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx || !ctx.tileEl) return;
        ctx.tileEl.classList.add('sliding');
        document.body.style.cursor = 'grabbing';
        if (this._config.layout === 'scroll') {
          this.$.lightGrid.style.scrollSnapType = 'none';
        }
      },
      onDragMove: (event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx || !ctx.tileEl) return;
        const refs = this._tiles[ctx.entity];
        if (!refs) return;

        const width = Math.max(ctx.tileEl.offsetWidth, 1);
        const dragRange = ctx.pointerType === 'touch'
          ? Math.max(width * 0.82, 110)
          : Math.max(width * 1.20, 185);
        const dragGain = ctx.pointerType === 'touch' ? 1.12 : 0.95;
        const change = (payload.dx / dragRange) * 100 * dragGain;
        const newBrt = Math.round(Math.max(0, Math.min(100, ctx.startBright + change)));
        if (newBrt === ctx.currentBright) return;

        if (event.cancelable) event.preventDefault();

        refs.fill.style.transition = 'none';
        refs.fill.style.width = `${newBrt}%`;
        refs.val.textContent = newBrt > 0 ? `${newBrt}%` : 'Off';

        if (newBrt > 0) {
          refs.el.classList.remove('off');
          refs.el.classList.add('on');
        } else {
          refs.el.classList.remove('on');
          refs.el.classList.add('off');
        }

        refs.el.dataset.brightness = String(newBrt);
        refs.el.setAttribute('aria-valuenow', String(newBrt));
        refs.el.setAttribute('aria-valuetext', newBrt > 0 ? `${newBrt} percent` : 'Off');
        ctx.currentBright = newBrt;
      },
      onDragEnd: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        const refs = this._tiles[ctx.entity];
        if (refs) {
          refs.el.classList.remove('sliding');
          refs.fill.style.transition = '';
        }
        document.body.style.cursor = '';
        if (this._config.layout === 'scroll') {
          this.$.lightGrid.style.scrollSnapType = 'x mandatory';
        }
        if (payload.committed) {
          this._setBrightness(ctx.entity, ctx.currentBright);
        }
      },
      onTap: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        this._toggleLight(ctx.entity);
      },
    });
  }

  /* ═══════════════════════════════════════════════════
     STATE HELPERS
     ═══════════════════════════════════════════════════ */

  _getEntity(id) { return this._hass ? this._hass.states[id] : null; }

  _getBrightness(id) {
    const e = this._getEntity(id);
    if (!e || e.state !== 'on') return 0;
    const b = e.attributes.brightness;
    return b != null ? Math.round((b / 255) * 100) : 100;
  }

  _friendlyName(id) {
    const e = this._getEntity(id);
    if (e && e.attributes.friendly_name) return e.attributes.friendly_name;
    const raw = id.split('.').pop().replace(/_/g, ' ');
    return raw.replace(/\b\w/g, c => c.toUpperCase());
  }

  _zoneName(zone) {
    if (zone.name) return zone.name;
    return this._friendlyName(zone.entity);
  }

  _normalizeIcon(icon) {
    if (!icon) return 'lightbulb';
    const raw = String(icon).replace(/^mdi:/, '').trim();
    const map = {
      light_group: 'lightbulb',
      shelf_auto: 'shelves',
      countertops: 'kitchen',
      desk_lamp: 'desk',
      lamp: 'table_lamp',
      table_lamp: 'table_lamp',
      floor_lamp: 'floor_lamp',
    };
    const resolved = map[raw] || raw;
    if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
    return resolved;
  }

  _zoneIcon(zone) {
    if (zone.icon) return this._normalizeIcon(zone.icon);
    return this._normalizeIcon(this._entityIcon(zone.entity));
  }

  _entityIcon(id) {
    const e = this._getEntity(id);
    if (e && e.attributes.icon) {
      const map = {
        'mdi:ceiling-light':       'light',
        'mdi:lamp':                'table_lamp',
        'mdi:floor-lamp':          'floor_lamp',
        'mdi:floor-lamp-outline':  'floor_lamp',
        'mdi:desk-lamp':           'desk',
        'mdi:lightbulb':           'lightbulb',
        'mdi:lightbulb-group':     'lightbulb',
        'mdi:led-strip':           'highlight',
        'mdi:light-recessed':      'fluorescent',
        'mdi:wall-sconce':         'wall_lamp',
        'mdi:wall-sconce-round-variant': 'wall_lamp',
        'mdi:chandelier':          'lightbulb',
        'mdi:track-light':         'highlight',
        'mdi:outdoor-lamp':        'deck',
        'mdi:heat-wave':           'highlight',
      };
      if (map[e.attributes.icon]) return map[e.attributes.icon];
    }
    return 'lightbulb';
  }

  /* ── Manual Control Detection ───────────────────── */

  _zoneEntitySet() {
    const set = new Set();
    for (const zone of this._resolvedZones) {
      set.add(zone.entity);
      const entity = this._getEntity(zone.entity);
      const members = entity?.attributes?.entity_id;
      if (Array.isArray(members)) {
        for (const member of members) set.add(member);
      }
    }
    return set;
  }

  _resolveAdaptiveEntities() {
    if (!this._hass) return [];
    const explicit = Array.isArray(this._config.adaptive_entities)
      ? this._config.adaptive_entities.filter(Boolean)
      : [];
    if (explicit.length) return Array.from(new Set(explicit));

    const legacy = this._config.adaptive_entity ? [this._config.adaptive_entity] : [];

    const zoneSet = this._zoneEntitySet();
    const candidates = [];
    for (const key of Object.keys(this._hass.states)) {
      if (!key.startsWith('switch.adaptive_lighting_')) continue;
      const sw = this._hass.states[key];
      const lights = sw?.attributes?.lights;
      if (Array.isArray(lights) && lights.some((eid) => zoneSet.has(eid))) {
        candidates.push(key);
      }
    }

    if (candidates.length) return Array.from(new Set(candidates));
    if (legacy.length) return legacy;
    const allAdaptive = Object.keys(this._hass.states).filter((k) => k.startsWith('switch.adaptive_lighting_'));
    if (allAdaptive.length === 1) return allAdaptive;
    return [];
  }

  _getManuallyControlled(adaptiveEntities = []) {
    if (!this._hass) return [];
    const deduped = new Set();
    for (const entityId of adaptiveEntities) {
      const entity = this._getEntity(entityId);
      const manualControl = entity?.attributes?.manual_control;
      if (!Array.isArray(manualControl)) continue;
      for (const lightId of manualControl) deduped.add(lightId);
    }
    return [...deduped];
  }

  _isZoneManual(zone, manualSet) {
    if (!zone?.entity || !manualSet || manualSet.size === 0) return false;
    if (manualSet.has(zone.entity)) return true;
    const entity = this._getEntity(zone.entity);
    const members = entity?.attributes?.entity_id;
    if (!Array.isArray(members)) return false;
    return members.some((member) => manualSet.has(member));
  }

  /* ═══════════════════════════════════════════════════
     SERVICE CALLS
     ═══════════════════════════════════════════════════ */

  _callService(domain, service, data) {
    if (!this._hass) return Promise.resolve();
    try {
      const result = this._hass.callService(domain, service, data);
      if (result && typeof result.then === 'function') return result;
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  _setCooldown(id) {
    this._serviceCooldown[id] = true;
    clearTimeout(this._cooldownTimers[id]);
    this._cooldownTimers[id] = setTimeout(() => {
      this._serviceCooldown[id] = false;
    }, 1500);
  }

  _toggleLight(id) {
    const next = this._getBrightness(id) > 0 ? 0 : 100;
    this._setBrightness(id, next);
  }

  _setBrightness(id, pct) {
    this._setCooldown(id);
    const refs = this._tiles[id];
    if (refs) this._updateTileUI(refs, pct);

    const request = pct === 0
      ? this._callService('light', 'turn_off', { entity_id: id })
      : this._callService('light', 'turn_on', { entity_id: id, brightness_pct: pct });

    request.catch(() => this._updateAll());
  }

  _toggleAdaptive() {
    const adaptiveEntities = this._resolveAdaptiveEntities();
    if (!adaptiveEntities.length) return;
    const anyOn = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === 'on');
    const targetService = anyOn ? 'turn_off' : 'turn_on';

    for (const entityId of adaptiveEntities) {
      const domain = entityId.split('.')[0];
      if (domain === 'switch' || domain === 'input_boolean') {
        this._callService('homeassistant', targetService, { entity_id: entityId });
      } else if (domain === 'automation') {
        this._callService('automation', targetService, { entity_id: entityId });
      }
    }
  }

  _resetManualControl() {
    if (!this._hass) return;
    const adaptiveEntities = this._resolveAdaptiveEntities().filter((entityId) =>
      entityId.startsWith('switch.adaptive_lighting_')
    );
    if (!adaptiveEntities.length) return;

    const zoneSet = this._zoneEntitySet();
    const manualScoped = new Set(
      this._getManuallyControlled(adaptiveEntities).filter((entityId) => zoneSet.has(entityId))
    );
    if (!manualScoped.size) return;

    for (const switchEntity of adaptiveEntities) {
      const sw = this._getEntity(switchEntity);
      const manualControl = sw?.attributes?.manual_control;
      if (!Array.isArray(manualControl)) continue;
      const relevantLights = manualControl.filter((l) => manualScoped.has(l));
      if (!relevantLights.length) continue;
      this._callService('adaptive_lighting', 'set_manual_control', {
        entity_id: switchEntity,
        manual_control: false,
        lights: relevantLights,
      });
    }
  }

  /* ═══════════════════════════════════════════════════
     TILE UI HELPER
     ═══════════════════════════════════════════════════ */

  _updateTileUI(refs, brt) {
    refs.el.dataset.brightness = brt;
    refs.fill.style.width = brt + '%';
    refs.val.textContent = brt > 0 ? brt + '%' : 'Off';
    refs.el.classList.toggle('on',  brt > 0);
    refs.el.classList.toggle('off', brt <= 0);
    refs.el.setAttribute('aria-valuenow', brt);
    refs.el.setAttribute('aria-valuetext', brt > 0 ? brt + ' percent' : 'Off');
  }

  /* ═══════════════════════════════════════════════════
     FULL STATE UPDATE
     ═══════════════════════════════════════════════════ */

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    const adaptiveEntities = this._resolveAdaptiveEntities();
    const manualList = this._getManuallyControlled(adaptiveEntities);
    const zoneSet = this._zoneEntitySet();
    const manualScoped = manualList.filter((entityId) => zoneSet.has(entityId));
    const manualSet = new Set(manualScoped);
    let onCount = 0;
    let totalCount = 0;
    let totalBrightness = 0;
    let manualZoneCount = 0;

    for (const zone of this._resolvedZones) {
      const entity = this._getEntity(zone.entity);
      const refs   = this._tiles[zone.entity];
      if (!refs) continue;

      const isUnavailable = !entity || entity.state === 'unavailable';
      const isOn  = entity && entity.state === 'on';
      const bright = this._getBrightness(zone.entity);

      if (!isUnavailable) {
        totalCount++;
        if (isOn) {
          onCount++;
          totalBrightness += bright;
        }
      }

      if (this._serviceCooldown[zone.entity]) continue;

      if (isUnavailable) {
        refs.el.classList.add('unavailable');
        this._updateTileUI(refs, 0);
        refs.val.textContent = 'Unavailable';
        refs.el.setAttribute('aria-valuetext', 'Unavailable');
        refs.name.textContent = this._zoneName(zone);
        refs.el.dataset.manual = 'false';
        continue;
      }

      refs.el.classList.remove('unavailable');
      this._updateTileUI(refs, isOn ? bright : 0);

      // Update name from zone config or entity
      refs.name.textContent = this._zoneName(zone);

      // Manual dot
      const isManual = this._isZoneManual(zone, manualSet);
      if (isManual) manualZoneCount++;
      refs.el.dataset.manual = isManual ? 'true' : 'false';

    }

    // ── Card-level state attributes ──
    const anyOn = onCount > 0;
    this.$.card.dataset.anyOn = anyOn ? 'true' : 'false';
    this.$.card.dataset.allOff = (onCount === 0 && totalCount > 0) ? 'true' : 'false';

    // ── Header icon state (Principle #7: outlined off, filled on) ──
    if (anyOn) {
      this.$.entityGlyph.classList.add('filled');
      this.$.entityIcon.style.color = '';
    } else {
      this.$.entityGlyph.classList.remove('filled');
      this.$.entityIcon.style.color = '';
    }

    // ── Title ──
    this.$.hdrTitle.textContent = this._config.name;

    // ── Subtitle (Design Language §5.4) ──
    if (this._config.subtitle) {
      this.$.hdrSub.innerHTML = this._config.subtitle;
    } else {
      const avgBrt = onCount > 0 ? Math.round(totalBrightness / onCount) : 0;
      const adaptiveAnyOn = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === 'on');
      const compactSubtitle = this._widthBucket640 == null
        ? this._isWidthAtMost(640)
        : this._widthBucket640;
      const manualCount = manualScoped.length;

      let parts = [];

      if (onCount === 0) {
        parts.push('All off');
      } else if (onCount === totalCount) {
        parts.push(`<span class="amber-ic">All on</span>`);
        parts.push(`${avgBrt}%`);
      } else {
        parts.push(`<span class="amber-ic">${onCount} on</span>`);
        parts.push(`${avgBrt}%`);
      }

      if (manualCount > 0) {
        parts.push(`<span class="red-ic">${manualCount} manual</span>`);
      } else if (adaptiveAnyOn && !compactSubtitle) {
        parts.push('<span class="adaptive-ic">Adaptive</span>');
      }

      this.$.hdrSub.innerHTML = parts.join(' \u00b7 ');
    }

    // ── Adaptive controls ──
    const hasAdaptiveTargets = adaptiveEntities.length > 0;
    const adaptiveAnyOn = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === 'on');
    if (this._config.show_adaptive_toggle && hasAdaptiveTargets) {
      this.$.adaptiveWrap.classList.remove('hidden');
      this.$.adaptiveBtn.classList.remove('hidden');
      this.$.adaptiveBtn.classList.toggle('on', adaptiveAnyOn);
      this.$.adaptiveBtn.setAttribute('aria-pressed', adaptiveAnyOn ? 'true' : 'false');
    } else {
      this.$.adaptiveBtn.classList.add('hidden');
      this.$.adaptiveWrap.classList.add('hidden');
    }

    const showManualReset = this._config.show_manual_reset && hasAdaptiveTargets && manualZoneCount > 0;
    this.$.manualResetWrap.classList.toggle('hidden', !showManualReset);
    this.$.manualResetBtn.classList.toggle('hidden', !showManualReset);
    this.$.manualResetWrap.classList.toggle('has-manual', showManualReset);
    this.$.manualBadge.textContent = String(manualScoped.length);
  }
}

/* ═══════════════════════════════════════════════════════════════
   Registration
   ═══════════════════════════════════════════════════════════════ */

registerCard('tunet-lighting-card', TunetLightingCard, {
  name:             'Tunet Lighting Card',
  description:      'Glassmorphism lighting controller - drag-to-dim, floating pill, adaptive toggle, grid/scroll layout, rich zone config',
  documentationURL: 'https://github.com/tunet/tunet-lighting-card',
});

logCardVersion('TUNET-LIGHTING', CARD_VERSION, '#D4850A');
