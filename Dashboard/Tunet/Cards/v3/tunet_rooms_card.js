/**
 * Tunet Rooms Card (v2 – ES Module)
 * Compact room grid with SmartThings-inspired square tiles
 * Glassmorphism design language
 * Version 2.9.1
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  SECTION_SURFACE,
  RESPONSIVE_BASE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  selectProfileSize,
  resolveSizeProfile,
  _setProfileVars,
  navigatePath,
  runCardAction,
  registerCard,
  logCardVersion,
  renderConfigPlaceholder,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '3.0.0';

// ═══════════════════════════════════════════════════════════
// Icon helpers (card-specific)
// ═══════════════════════════════════════════════════════════

const ICON_ALIASES = {
  shelf_auto: 'shelves',
  countertops: 'kitchen',
  desk_lamp: 'desk',
  lamp: 'table_lamp',
  floor_lamp: 'table_lamp',
  light_group: 'lightbulb',
};

function normalizeIcon(icon) {
  if (!icon) return 'lightbulb';
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return 'lightbulb';
  return resolved;
}

// ═══════════════════════════════════════════════════════════
// Card-specific CSS overrides
// ═══════════════════════════════════════════════════════════

const CARD_OVERRIDES = `
  :host {
    display: block;
    font-size: 16px; /* em anchor */
    --section-pad: var(--_tunet-section-pad, 1.25em);
    --section-gap: var(--_tunet-section-gap, 1em);
    --r-tile: var(--_tunet-tile-radius, 0.875em);
    --type-sub: var(--_tunet-sub-font, 0.6875em);
    --type-row-title: var(--_tunet-row-title-font, 1.03125em);
    --type-row-status: var(--_tunet-row-status-font, 0.90625em);
    --rooms-row-btn-size: var(--_tunet-orb-size, 3.16em);
    --rooms-row-btn-icon-size: var(--_tunet-orb-icon, 1.62em);
    --rooms-row-btn-radius: var(--_tunet-row-btn-radius, 0.75em);
    --rooms-row-btn-size-slim: calc(var(--_tunet-orb-size, 3.16em) * 0.7);
    --rooms-row-btn-icon-size-slim: calc(var(--_tunet-orb-icon, 1.62em) * 0.7);
    --rooms-all-toggle-min-h: var(--_tunet-ctrl-min-h, 2.625em);
    --rooms-all-toggle-font: calc(var(--_tunet-name-font, 0.8125em) * 1.03);
    --rooms-all-toggle-icon: var(--_tunet-ctrl-icon-size, 1.25em);
  }
  .section-container {
    position: relative;
    gap: var(--_tunet-section-gap, 1em);
    width: 100%;
    box-shadow: var(--section-shadow), var(--inset);
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
`;

// ═══════════════════════════════════════════════════════════
// Card-specific styles
// ═══════════════════════════════════════════════════════════

const CARD_STYLES = `
  /* -- Section Header -- */
  .section-hdr {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0 0.25em;
  }
  .section-title {
    font-size: var(--_tunet-section-font, 1.0625em); font-weight: 700; letter-spacing: -0.01em;
    color: var(--text);
  }
  .section-hdr-spacer { flex: 1; }
  .section-controls {
    display: inline-flex;
    align-items: center;
    gap: 0.38em;
  }
  .section-btn {
    min-height: calc(var(--_tunet-ctrl-min-h, 2.625em) * 0.76);
    padding: 0 calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.75);
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: calc(var(--_tunet-sub-font, 0.6875em) * 0.95);
    font-weight: 700;
    letter-spacing: 0.02em;
    display: inline-flex;
    align-items: center;
    gap: 0.22em;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .section-btn:hover { box-shadow: var(--shadow); }
  .section-btn:active { transform: scale(0.96); }
  .section-btn .icon { font-size: 1.05em; width: 1.05em; height: 1.05em; }
  .section-btn.all-toggle {
    color: var(--text-sub);
    min-height: var(--rooms-all-toggle-min-h, 2.64em);
    min-width: var(--rooms-all-toggle-min-w, 6.8em);
    padding: 0 1.02em;
    font-size: var(--rooms-all-toggle-font, 0.84em);
    gap: 0.34em;
  }
  .section-btn.all-toggle .icon {
    font-size: var(--rooms-all-toggle-icon, 1.26em);
    width: var(--rooms-all-toggle-icon, 1.26em);
    height: var(--rooms-all-toggle-icon, 1.26em);
  }
  .section-btn.all-toggle.on {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }
  .section-btn.manual-reset {
    color: var(--red);
    border-color: rgba(239,68,68,0.32);
    background: rgba(239,68,68,0.12);
  }
  .section-btn[hidden] { display: none !important; }

  /* -- Room Grid -- */
  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(7.2em, 1fr));
    gap: var(--_tunet-tile-gap, 0.375em);
  }

  .room-grid.row-mode {
    display: flex;
    flex-direction: column;
    gap: var(--_tunet-row-gap, 0.52em);
  }

  /* Slim mobile-first row variant */
  .room-grid.row-mode.slim-mode {
    gap: calc(var(--_tunet-row-gap, 0.52em) * 0.65);
  }

  /* -- Room Tile (aligned to lighting tile language) -- */
  .room-tile {
    min-height: var(--_tunet-tile-min-h, 5.75em);
    border-radius: var(--_tunet-tile-radius, var(--r-tile));
    background: var(--tile-bg);
    border: 1px solid var(--border-ghost);
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: calc(var(--_tunet-tile-gap, 0.375em) * 0.4);
    padding:
      calc(var(--_tunet-tile-pad, 0.875em) * 0.7)
      calc(var(--_tunet-tile-pad, 0.875em) * 0.39)
      calc(var(--_tunet-tile-pad, 0.875em) * 1.03);
    cursor: pointer;
    transition: all 0.18s ease;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .room-tile:hover {
    box-shadow: var(--shadow-up);
  }
  .room-tile:active { transform: scale(0.95); }
  .room-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  /* Active (lights on) state */
  .room-tile.active {
    border-color: var(--amber-border);
    background: var(--tile-bg);
  }
  .room-tile.manual .room-tile-dot {
    background: var(--red);
    opacity: 1;
  }

  /* -- Icon wrap -- */
  .room-tile-icon {
    width: var(--_tunet-icon-box, 2.375em); height: var(--_tunet-icon-box, 2.375em);
    display: grid; place-items: center;
    border-radius: 50%;
    transition: all 0.18s;
    margin-top: 0.08em;
    margin-bottom: 0.2em;
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
    font-size: var(--_tunet-icon-glyph, 1.1875em); width: var(--_tunet-icon-glyph, 1.1875em); height: var(--_tunet-icon-glyph, 1.1875em);
  }

  /* -- Room name -- */
  .room-tile-name {
    font-size: var(--_tunet-display-name-font, var(--_tunet-name-font, 0.8125em));
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
    font-size: var(--_tunet-display-value-font, var(--type-sub, 0.6875em));
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
  .room-tile-status .manual-count {
    color: var(--red);
    font-weight: 700;
  }
  .room-tile-status .temp {
    font-variant-numeric: tabular-nums;
  }
  .room-tile-status .humidity {
    font-variant-numeric: tabular-nums;
  }
  .room-tile-status .brightness {
    font-variant-numeric: tabular-nums;
    color: var(--text-sub);
  }

  .room-progress-track {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    width: calc(100% - (var(--_tunet-tile-pad, 0.875em) * 1.8));
    margin-top: calc(var(--_tunet-tile-gap, 0.375em) * 0.64);
    height: var(--_tunet-progress-h, 0.5em);
    background: var(--track-bg);
    border-radius: var(--r-track);
    overflow: hidden;
  }
  .room-progress-fill {
    height: 100%;
    width: 0%;
    background: rgba(212,133,10,0.88);
    border-radius: var(--r-track);
    transition: width 0.15s ease;
  }
  :host(.dark) .room-progress-fill {
    background: rgba(251,191,36,0.88);
  }

  /* -- Row Variant (mockup parity mode) -- */
  .room-grid.row-mode .room-tile {
    min-height: var(--_tunet-row-min-h, 7.3125em);
    border-radius: calc(var(--r-tile) + 2px);
    padding: 0.9em 0.96em;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: var(--_tunet-row-gap, 0.52em);
  }
  .room-grid.row-mode .room-progress-track {
    display: none;
  }
  .room-row-main {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--_tunet-row-gap, 0.52em) * 1.54);
    min-width: 0;
    flex: 1;
  }
  .room-row-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: calc(var(--_tunet-row-gap, 0.52em) * 0.27);
  }
  .room-grid.row-mode .room-tile-name,
  .room-grid.row-mode .room-tile-status {
    text-align: left;
  }
  .room-grid.row-mode .room-tile-name {
    font-size: var(--_tunet-row-display-name-font, var(--type-row-title, 1.03125em));
    font-weight: 700;
    line-height: var(--row-line-height-title, 1.16);
  }
  .room-grid.row-mode .room-tile-status {
    font-size: var(--_tunet-row-display-status-font, var(--type-row-status, 0.90625em));
    font-weight: 700;
    color: var(--text-sub);
    line-height: var(--row-line-height-status, 1.14);
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: var(--row-status-max-lines, 2);
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .room-grid.row-mode .room-tile-icon {
    width: var(--_tunet-row-lead-icon-box, calc(var(--_tunet-orb-size, 3.16em) * 0.66));
    height: var(--_tunet-row-lead-icon-box, calc(var(--_tunet-orb-size, 3.16em) * 0.66));
    margin: 0;
    border-radius: calc(var(--rooms-row-btn-radius, 0.75em) * 0.83);
    flex: 0 0 auto;
  }
  .room-grid.row-mode .room-tile-icon .icon {
    font-size: var(--_tunet-row-lead-icon-glyph, calc(var(--_tunet-orb-icon, 1.62em) * 0.74));
    width: var(--_tunet-row-lead-icon-glyph, calc(var(--_tunet-orb-icon, 1.62em) * 0.74));
    height: var(--_tunet-row-lead-icon-glyph, calc(var(--_tunet-orb-icon, 1.62em) * 0.74));
  }
  .room-row-controls {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--_tunet-row-gap, 0.52em) * 1.18);
    flex-shrink: 0;
    --row-btn-size: var(--_tunet-row-control-size, var(--rooms-row-btn-size, 3.16em));
    --row-btn-radius: var(--rooms-row-btn-radius, 0.75em);
    --row-btn-icon-size: var(--_tunet-row-control-icon, var(--rooms-row-btn-icon-size, 1.62em));
  }
  .room-action-btn {
    width: var(--row-btn-size);
    height: var(--row-btn-size);
    min-width: var(--row-btn-size);
    border-radius: var(--row-btn-radius);
    border: 1px solid var(--ctrl-border);
    background: var(--tile-bg-off);
    color: var(--text-muted);
    box-shadow: var(--ctrl-sh);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 var(--row-btn-size);
    cursor: pointer;
    transition: all 0.16s ease;
    padding: 0;
    font-size: 1em;
    font-weight: 700;
    letter-spacing: 0.02em;
    box-sizing: border-box;
    line-height: 1;
  }
  .room-action-btn .icon {
    font-size: var(--row-btn-icon-size);
    width: var(--row-btn-icon-size);
    height: var(--row-btn-icon-size);
  }
  .room-action-btn.on {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }
  .room-action-btn.off {
    color: var(--text-muted);
  }
  .room-action-btn:hover {
    box-shadow: var(--shadow);
  }
  .room-action-btn:active {
    transform: scale(0.95);
  }
  .room-orbs {
    display: inline-flex;
    align-items: center;
    gap: calc(var(--_tunet-row-gap, 0.52em) * 0.9);
  }
  .room-orb {
    width: var(--row-btn-size);
    height: var(--row-btn-size);
    min-width: var(--row-btn-size);
    border-radius: var(--row-btn-radius);
    border: 1px solid var(--ctrl-border);
    background: var(--tile-bg-off);
    color: var(--text-muted);
    box-shadow: var(--ctrl-sh);
    display: grid;
    place-items: center;
    flex: 0 0 var(--row-btn-size);
    cursor: pointer;
    transition: all 0.16s ease;
    box-sizing: border-box;
  }
  .room-orb .icon {
    font-size: var(--row-btn-icon-size);
    width: var(--row-btn-icon-size);
    height: var(--row-btn-icon-size);
  }
  .room-orb:hover {
    box-shadow: var(--shadow);
  }
  .room-orb:active {
    transform: scale(0.94);
  }
  .room-orb.on {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }
  .room-orb.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20;
  }
  .room-orb.manual {
    box-shadow: 0 0 0 1px rgba(239,68,68,0.42), 0 0 0 3px rgba(239,68,68,0.14);
  }
  .room-chevron {
    width: var(--_tunet-chevron-size, 1.56em);
    height: var(--_tunet-chevron-size, 1.56em);
    border-radius: var(--r-pill);
    border: 1px solid transparent;
    color: var(--text-muted);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .room-grid.row-mode .room-tile.active .room-chevron {
    color: var(--amber);
  }

  .room-grid.row-mode.slim-mode .room-tile {
    min-height: calc(var(--_tunet-row-min-h, 7.3125em) * 0.7);
    padding: 0.64em 0.76em;
    gap: 0.58em;
    border-radius: 13px;
  }
  .room-grid.row-mode.slim-mode .room-row-main {
    gap: 0.52em;
  }
  .room-grid.row-mode.slim-mode .room-tile-icon {
    width: calc(var(--_tunet-orb-size, 3.16em) * 0.63);
    height: calc(var(--_tunet-orb-size, 3.16em) * 0.63);
    border-radius: calc(var(--rooms-row-btn-radius, 0.75em) * 0.75);
  }
  .room-grid.row-mode.slim-mode .room-tile-icon .icon {
    font-size: calc(var(--_tunet-orb-icon, 1.62em) * 0.74);
    width: calc(var(--_tunet-orb-icon, 1.62em) * 0.74);
    height: calc(var(--_tunet-orb-icon, 1.62em) * 0.74);
  }
  .room-grid.row-mode.slim-mode .room-row-info {
    gap: 0.06em;
  }
  .room-grid.row-mode.slim-mode .room-tile-name {
    font-size: 0.78em;
    letter-spacing: 0.01em;
  }
  .room-grid.row-mode.slim-mode .room-tile-status {
    font-size: 0.66em;
  }
  .room-grid.row-mode.slim-mode .room-row-controls {
    gap: 0.26em;
    --row-btn-size: calc(var(--_tunet-row-control-size, var(--rooms-row-btn-size, 3.16em)) * 0.7);
    --row-btn-radius: calc(var(--rooms-row-btn-radius, 0.75em) * 0.75);
    --row-btn-icon-size: calc(var(--_tunet-row-control-icon, var(--rooms-row-btn-icon-size, 1.62em)) * 0.7);
  }
  .room-grid.row-mode.slim-mode .room-orbs {
    gap: 0.32em;
  }
  .room-grid.row-mode.slim-mode .room-orb {
    width: var(--row-btn-size);
    height: var(--row-btn-size);
    border-radius: var(--row-btn-radius);
  }
  .room-grid.row-mode.slim-mode .room-orb .icon {
    font-size: var(--row-btn-icon-size);
    width: var(--row-btn-icon-size);
    height: var(--row-btn-icon-size);
  }
  .room-grid.row-mode.slim-mode .room-action-btn {
    width: var(--row-btn-size);
    height: var(--row-btn-size);
    min-width: var(--row-btn-size);
    border-radius: var(--row-btn-radius);
    padding: 0;
  }
  .room-grid.row-mode.slim-mode .room-action-btn .icon {
    font-size: var(--row-btn-icon-size);
    width: var(--row-btn-icon-size);
    height: var(--row-btn-icon-size);
  }
  .room-grid.row-mode.slim-mode .room-chevron {
    width: 1.28em;
    height: 1.28em;
  }

  /* -- Toggle indicator dot -- */
  .room-tile-dot {
    position: absolute;
    top: 0.46em; right: 0.46em;
    width: 0.42em; height: 0.42em;
    border-radius: var(--r-pill);
    background: var(--amber);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .room-tile.manual .room-tile-dot {
    opacity: 1;
  }

  /* -- Responsive -- */
  @media (min-width: 500px) {
    .room-grid {
      grid-template-columns: repeat(auto-fill, minmax(7.6em, 1fr));
    }
  }
  @media (max-width: 440px) {
    :host { font-size: 16px; }
    .section-controls { gap: 0.3em; }
    :host(:not([use-profiles])) .section-btn {
      min-height: 1.9em;
      padding: 0 0.5em;
      font-size: 0.62em;
    }
    :host(:not([use-profiles])) .section-btn.all-toggle { padding: 0 0.96em; gap: 0.34em; }
    .room-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.4em;
    }
    :host(:not([use-profiles])) .room-tile {
      min-height: 6.8em;
      padding: 0.54em 0.3em 0.82em;
    }
    :host(:not([use-profiles])) .room-tile-name {
      font-size: 0.82em;
    }
    :host(:not([use-profiles])) .room-tile-status {
      font-size: 0.72em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode .room-tile {
      padding: 0.9em 0.94em;
      gap: 0.82em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode .room-row-main {
      gap: 0.74em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode .room-tile-name {
      font-size: var(--type-row-title, 18px);
    }
    :host(:not([use-profiles])) .room-grid.row-mode .room-tile-status {
      font-size: var(--type-row-status, 15.5px);
    }
    :host(:not([use-profiles])) .room-grid.row-mode .room-row-controls {
      --row-btn-size: var(--rooms-row-btn-size, 2.82em);
      --row-btn-icon-size: var(--rooms-row-btn-icon-size, 1.44em);
      --row-btn-radius: 12px;
    }
    :host(:not([use-profiles])) .room-grid.row-mode.slim-mode .room-tile {
      padding: 0.58em 0.68em;
      gap: 0.54em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode.slim-mode .room-tile-name {
      font-size: 0.76em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode.slim-mode .room-tile-status {
      font-size: 0.66em;
    }
    :host(:not([use-profiles])) .room-grid.row-mode.slim-mode .room-row-controls {
      --row-btn-size: var(--rooms-row-btn-size-slim, 2.52em);
      --row-btn-icon-size: var(--rooms-row-btn-icon-size-slim, 1.28em);
      --row-btn-radius: 9px;
    }
  }
`;

// ═══════════════════════════════════════════════════════════
// Composite stylesheet
// ═══════════════════════════════════════════════════════════

const TUNET_ROOMS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${SECTION_SURFACE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${RESPONSIVE_BASE}
  ${REDUCED_MOTION}
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
        <div class="section-hdr-spacer"></div>
        <div class="section-controls">
          <button type="button" class="section-btn manual-reset" id="manualResetBtn" hidden>
            <span class="icon">restart_alt</span><span>Reset</span>
          </button>
          <button type="button" class="section-btn all-toggle" id="allToggleBtn">
            <span class="icon">power_settings_new</span><span class="all-toggle-label">All</span>
          </button>
        </div>
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
    this._profileSelection = null;
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
    injectFonts();
  }

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'name', selector: { text: {} } },
        { name: 'layout_variant', selector: { select: { options: ['tiles', 'row', 'slim'] } } },
        { name: 'tile_size', selector: { select: { options: ['compact', 'standard', 'large'] } } },
        { name: 'use_profiles', selector: { boolean: {} } },
        { name: 'rooms', selector: { object: {} } },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          layout_variant: 'Layout Variant',
          tile_size: 'Tile Size',
          use_profiles: 'Use Profile Sizing',
          rooms: 'Rooms Config',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Rooms',
      layout_variant: 'tiles',
      tile_size: 'standard',
      use_profiles: true,
      rooms: [
        {
          name: 'Living Room',
          icon: 'weekend',
          hold_action: {
            action: 'fire-dom-event',
            browser_mod: {
              service: 'browser_mod.popup',
            },
          },
          lights: [
            { entity: 'light.living_room', icon: 'lightbulb', name: 'Main' },
          ],
        },
      ],
    };
  }

  setConfig(config) {
    if (!config.rooms || !Array.isArray(config.rooms) || config.rooms.length === 0) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Add rooms to get started', 'Rooms');
      return;
    }
    const tileSizeRaw = String(config.tile_size || 'standard').toLowerCase();
    const tileSize = tileSizeRaw === 'compact'
      ? 'compact'
      : (tileSizeRaw === 'large' ? 'large' : 'standard');
    const useProfiles = config.use_profiles !== false;
    this._config = {
      name: config.name || 'Rooms',
      layout_variant: (config.layout_variant === 'row' || config.layout_variant === 'slim')
        ? config.layout_variant
        : 'tiles',
      tile_size: tileSize,
      use_profiles: useProfiles,
      rooms: config.rooms.map((room) => ({
        name: room.name || 'Room',
        icon: normalizeIcon(room.icon || 'home'),
        temperature_entity: room.temperature_entity || '',
        humidity_entity: room.humidity_entity || '',
        navigate_path: room.navigate_path || '',
        tap_action: room.tap_action || null,
        hold_action: room.hold_action || null,
        lights: (room.lights || []).map((light) => ({
          entity: light.entity || '',
          icon: normalizeIcon(light.icon || 'lightbulb'),
          name: light.name || '',
        })),
      })),
    };
    if (useProfiles) this.setAttribute('use-profiles', '');
    else this.removeAttribute('use-profiles');
    this._applyProfile(this._getHostWidth());
    if (this._rendered) {
      this._buildTiles();
      this._updateAll();
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildTiles();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    if (!oldHass || this._entitiesChanged(oldHass, hass)) this._updateAll();
  }

  _entitiesChanged(o, n) {
    for (const room of this._config.rooms) {
      for (const light of (room.lights || [])) {
        if (light.entity && o.states[light.entity] !== n.states[light.entity]) return true;
      }
      if (room.temperature_entity && o.states[room.temperature_entity] !== n.states[room.temperature_entity]) return true;
      if (room.humidity_entity && o.states[room.humidity_entity] !== n.states[room.humidity_entity]) return true;
    }
    // Watch AL switches for manual_control changes
    for (const key of Object.keys(n.states)) {
      if (key.startsWith('switch.adaptive_lighting_') && o.states[key] !== n.states[key]) return true;
    }
    return false;
  }

  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    if (this._config.layout_variant === 'row' || this._config.layout_variant === 'slim') {
      return Math.max(2, roomCount + 1);
    }
    const rows = Math.ceil(roomCount / 4);
    return Math.max(2, rows + 1);
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
    const hostWidth = Number(this.getBoundingClientRect?.().width);
    if (Number.isFinite(hostWidth) && hostWidth > 0) return hostWidth;
    return 1024;
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
    const layout = this._config.layout_variant === 'tiles' ? 'grid' : this._config.layout_variant;
    const selection = selectProfileSize({
      preset: 'rooms',
      layout,
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
    this._applyProfile(widthHint);
  }

  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }

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
    clearTimeout(this._longPressTimer);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener('resize', this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
  }

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_ROOMS_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomGrid: this.shadowRoot.getElementById('roomGrid'),
      sectionTitle: this.shadowRoot.getElementById('sectionTitle'),
      allToggleBtn: this.shadowRoot.getElementById('allToggleBtn'),
      manualResetBtn: this.shadowRoot.getElementById('manualResetBtn'),
    };
    this._applyProfile(this._getHostWidth());

    this.$.allToggleBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleAllLights();
    });
    this.$.manualResetBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._resetManualControl();
    });
  }

  _buildTiles() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || 'Rooms';
    }

    const grid = this.$.roomGrid;
    grid.innerHTML = '';
    this._tileRefs = [];
    const isRowVariant = this._config.layout_variant === 'row' || this._config.layout_variant === 'slim';
    const isSlimVariant = this._config.layout_variant === 'slim';
    grid.classList.toggle('row-mode', isRowVariant);
    grid.classList.toggle('slim-mode', isSlimVariant);
    if (this.$.allToggleBtn) {
      this.$.allToggleBtn.hidden = isRowVariant;
    }

    this._config.rooms.forEach((roomCfg, i) => {
      const tile = document.createElement('div');
      tile.className = 'room-tile';
      if (isRowVariant) tile.classList.add('room-row');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', roomCfg.name);

      if (isRowVariant) {
        const orbs = (roomCfg.lights || []).map((light, idx) => `
          <button type="button"
                  class="room-orb"
                  data-entity="${light.entity || ''}"
                  aria-label="Toggle ${light.name || `Light ${idx + 1}`}">
            <span class="icon">${normalizeIcon(light.icon || 'lightbulb')}</span>
          </button>
        `).join('');
        tile.innerHTML = `
          <div class="room-tile-dot"></div>
          <div class="room-row-main">
            <div class="room-tile-icon">
              <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
            </div>
            <div class="room-row-info">
              <span class="room-tile-name">${roomCfg.name}</span>
              <span class="room-tile-status" id="room-status-${i}">--</span>
            </div>
          </div>
          <div class="room-row-controls">
            <div class="room-orbs" id="room-orbs-${i}">${orbs}</div>
            <button type="button" class="room-action-btn off" id="room-toggle-${i}" aria-label="Toggle all ${roomCfg.name}">
              <span class="icon">power_settings_new</span>
            </button>
            <span class="icon room-chevron">chevron_right</span>
          </div>
          <div class="room-progress-track">
            <div class="room-progress-fill" id="room-fill-${i}"></div>
          </div>
        `;
      } else {
        tile.innerHTML = `
          <div class="room-tile-dot"></div>
          <div class="room-tile-icon">
            <span class="icon">${normalizeIcon(roomCfg.icon)}</span>
          </div>
          <span class="room-tile-name">${roomCfg.name}</span>
          <span class="room-tile-status" id="room-status-${i}">--</span>
          <div class="room-progress-track">
            <div class="room-progress-fill" id="room-fill-${i}"></div>
          </div>
        `;
      }

      const statusEl = tile.querySelector(`#room-status-${i}`);
      const fillEl = tile.querySelector(`#room-fill-${i}`);
      const toggleBtn = isRowVariant ? tile.querySelector(`#room-toggle-${i}`) : null;
      const orbRefs = isRowVariant
        ? [...tile.querySelectorAll('.room-orb')]
            .map((el) => ({ el, entity: String(el.dataset.entity || '') }))
            .filter((ref) => !!ref.entity)
        : [];

      if (toggleBtn) {
        const stopBubble = (e) => e.stopPropagation();
        toggleBtn.addEventListener('pointerdown', stopBubble);
        toggleBtn.addEventListener('pointerup', stopBubble);
        toggleBtn.addEventListener('pointercancel', stopBubble);
        toggleBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleRoomGroup(roomCfg);
        });
      }

      for (const orbRef of orbRefs) {
        const stopBubble = (e) => e.stopPropagation();
        orbRef.el.addEventListener('pointerdown', stopBubble);
        orbRef.el.addEventListener('pointerup', stopBubble);
        orbRef.el.addEventListener('pointercancel', stopBubble);
        orbRef.el.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleSingleLight(orbRef.entity);
        });
      }

      // Row mode lock:
      // card-body tap always navigates to room page.
      // sub-buttons own all toggle behavior.
      // Tile mode keeps legacy tap/hold behavior.
      let pressTimer = null;
      let didLongPress = false;

      const onPointerDown = () => {
        if (isRowVariant) return;
        didLongPress = false;
        pressTimer = setTimeout(() => {
          didLongPress = true;
          if (isRowVariant && (roomCfg.lights || []).length) {
            this._toggleRoomGroup(roomCfg);
          } else {
            if (roomCfg.hold_action) {
              this._handleRoomAction(roomCfg.hold_action, roomCfg);
            } else if (roomCfg.navigate_path) {
              navigatePath(roomCfg.navigate_path);
            }
          }

          // Brief haptic feedback via scale.
          tile.style.transform = 'scale(0.9)';
          setTimeout(() => { tile.style.transform = ''; }, 120);
        }, 400);
      };

      const onPointerUp = (ev) => {
        clearTimeout(pressTimer);
        if (isRowVariant) {
          const target = ev && ev.target instanceof Element ? ev.target : null;
          if (target && target.closest('.room-row-controls')) return;
          if (roomCfg.navigate_path) {
            navigatePath(roomCfg.navigate_path);
          } else if (roomCfg.tap_action) {
            this._handleRoomAction(roomCfg.tap_action, roomCfg);
          } else if (roomCfg.hold_action) {
            this._handleRoomAction(roomCfg.hold_action, roomCfg);
          }
          return;
        }
        if (didLongPress) return;

        // Tile mode short tap -> configured action, otherwise toggle room lights.
        if (roomCfg.tap_action) {
          this._handleRoomAction(roomCfg.tap_action, roomCfg);
        } else if ((roomCfg.lights || []).length) {
          this._toggleRoomGroup(roomCfg);
        } else if (roomCfg.temperature_entity) {
          this.dispatchEvent(new CustomEvent('hass-more-info', {
            bubbles: true, composed: true,
            detail: { entityId: roomCfg.temperature_entity },
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

      // Keyboard
      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPointerUp(e);
        }
      });

      // Prevent context menu on long press
      tile.addEventListener('contextmenu', (e) => e.preventDefault());

      grid.appendChild(tile);
      this._tileRefs.push({
        el: tile,
        cfg: roomCfg,
        statusEl,
        fillEl,
        toggleBtn,
        orbRefs,
      });
    });
  }

  _toggleSingleLight(entityId) {
    if (!this._hass || !entityId) return;
    const entity = this._hass.states[entityId];
    const service = entity && entity.state === 'on' ? 'turn_off' : 'turn_on';
    const result = this._hass.callService('light', service, { entity_id: entityId });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
  }

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
    const result = this._hass.callService('light', service, { entity_id: entityIds });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
  }

  _setRoomGroup(roomCfg, turnOn) {
    if (!this._hass) return;
    const entityIds = (roomCfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entityIds.length) return;
    const service = turnOn ? 'turn_on' : 'turn_off';
    const result = this._hass.callService('light', service, { entity_id: entityIds });
    if (result && typeof result.catch === 'function') {
      result.catch(() => this._updateAll());
    }
  }

  _allRoomLightIds() {
    const ids = new Set();
    for (const room of this._config.rooms || []) {
      for (const light of room.lights || []) {
        if (light.entity) ids.add(light.entity);
      }
    }
    return Array.from(ids);
  }

  _setAllLights(service) {
    if (!this._hass) return;
    const entityIds = this._allRoomLightIds();
    if (!entityIds.length) return;
    this._hass.callService('light', service, { entity_id: entityIds });
  }

  _toggleAllLights() {
    if (!this._hass) return;
    const entityIds = this._allRoomLightIds();
    if (!entityIds.length) return;
    const anyOn = entityIds.some((eid) => this._hass.states[eid]?.state === 'on');
    this._setAllLights(anyOn ? 'turn_off' : 'turn_on');
  }

  _resolveAdaptiveEntitiesForRooms() {
    if (!this._hass) return [];
    const zoneSet = new Set(this._allRoomLightIds());
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
    return Object.keys(this._hass.states).filter((k) => k.startsWith('switch.adaptive_lighting_'));
  }

  _getManualLights(adaptiveEntities) {
    const deduped = new Set();
    for (const entityId of adaptiveEntities) {
      const sw = this._hass.states[entityId];
      const manual = sw?.attributes?.manual_control;
      if (!Array.isArray(manual)) continue;
      for (const lightId of manual) deduped.add(lightId);
    }
    return deduped;
  }

  _resetManualControl() {
    if (!this._hass) return;
    const roomLights = new Set(this._allRoomLightIds());
    const adaptiveEntities = this._resolveAdaptiveEntitiesForRooms()
      .filter((entityId) => entityId.startsWith('switch.adaptive_lighting_'));
    if (!adaptiveEntities.length) return;

    const manualScoped = new Set(
      Array.from(this._getManualLights(adaptiveEntities))
        .filter((lightId) => roomLights.has(lightId))
    );
    if (!manualScoped.size) return;

    for (const switchEntity of adaptiveEntities) {
      const sw = this._hass.states[switchEntity];
      const manualControl = sw?.attributes?.manual_control;
      if (!Array.isArray(manualControl)) continue;
      const relevantLights = manualControl.filter((l) => manualScoped.has(l));
      if (!relevantLights.length) continue;
      this._hass.callService('adaptive_lighting', 'set_manual_control', {
        entity_id: switchEntity,
        manual_control: false,
        lights: relevantLights,
      });
    }
  }

  _handleRoomAction(actionConfig, roomCfg) {
    if (!actionConfig || !this._hass) return;
    const defaultEntityId = roomCfg?.lights?.[0]?.entity || roomCfg?.temperature_entity || '';
    runCardAction({
      element: this,
      hass: this._hass,
      actionConfig,
      defaultEntityId,
    });
  }

  _updateAll() {
    if (!this._hass || !this._rendered) return;

    const adaptiveEntities = this._resolveAdaptiveEntitiesForRooms();
    const manualSet = this._getManualLights(adaptiveEntities);
    const allRoomLights = new Set(this._allRoomLightIds());
    const manualScopedCount = Array.from(manualSet).filter((eid) => allRoomLights.has(eid)).length;
    if (this.$.manualResetBtn) {
      this.$.manualResetBtn.hidden = manualScopedCount === 0;
    }

    let anyRoomOn = false;

    for (const ref of this._tileRefs) {
      const lights = ref.cfg.lights || [];
      let onCount = 0;
      let brightnessTotal = 0;

      for (const light of lights) {
        if (!light.entity) continue;
        const entity = this._hass.states[light.entity];
        if (!entity || entity.state === 'unavailable') continue;
        if (entity.state === 'on') {
          onCount++;
          const raw = Number(entity.attributes?.brightness);
          const pct = Number.isFinite(raw)
            ? Math.max(0, Math.min(100, Math.round((raw / 255) * 100)))
            : 100;
          brightnessTotal += pct;
        }
      }

      const anyOn = onCount > 0;
      if (anyOn) anyRoomOn = true;
      ref.el.classList.toggle('active', anyOn);
      if (ref.fillEl) {
        const pct = onCount > 0 ? Math.round(brightnessTotal / onCount) : 0;
        ref.fillEl.style.width = `${pct}%`;
      }
      if (ref.toggleBtn) {
        ref.toggleBtn.classList.toggle('on', anyOn);
        ref.toggleBtn.classList.toggle('off', !anyOn);
        ref.toggleBtn.setAttribute('aria-label', anyOn
          ? `Turn off all ${ref.cfg.name}`
          : `Turn on all ${ref.cfg.name}`);
      }
      for (const orbRef of (ref.orbRefs || [])) {
        const entity = this._hass.states[orbRef.entity];
        const orbOn = !!(entity && entity.state === 'on');
        const orbManual = manualSet.has(orbRef.entity);
        orbRef.el.classList.toggle('on', orbOn);
        orbRef.el.classList.toggle('off', !orbOn);
        orbRef.el.classList.toggle('manual', orbManual);
      }

      // Build status text
      let parts = [];
      const avgBrt = onCount > 0 ? Math.round(brightnessTotal / onCount) : 0;
      const hasAmbientSensors = !!(ref.cfg.humidity_entity || ref.cfg.temperature_entity);
      if (anyOn) {
        if (onCount === lights.length) {
          parts.push(`<span class="on-count">On</span>`);
        } else {
          parts.push(`<span class="on-count">${onCount}/${lights.length}</span>`);
        }
        if (!hasAmbientSensors) {
          parts.push(`<span class="brightness">${avgBrt}% bri</span>`);
        }
      } else if (lights.length > 0) {
        parts.push('Off');
      }

      // Manual control detection per room
      let manualCount = 0;
      for (const light of lights) {
        if (!light.entity) continue;
        if (manualSet.has(light.entity)) manualCount++;
      }
      if (manualCount > 0) {
        parts.push(`<span class="manual-count">${manualCount} manual</span>`);
      }
      ref.el.classList.toggle('manual', manualCount > 0);

      // Humidity
      if (ref.cfg.humidity_entity) {
        const humEntity = this._hass.states[ref.cfg.humidity_entity];
        if (humEntity && humEntity.state && humEntity.state !== 'unavailable') {
          const humRaw = Number(humEntity.state);
          if (Number.isFinite(humRaw)) {
            parts.push(`<span class="humidity">${Math.round(humRaw)}%</span>`);
          }
        }
      }

      // Temperature
      if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state && tempEntity.state !== 'unavailable') {
          const unit = tempEntity.attributes.unit_of_measurement || '°F';
          parts.push(`<span class="temp">${Math.round(Number(tempEntity.state))}${unit}</span>`);
        }
      }

      ref.statusEl.innerHTML = parts.join(' · ');
    }

    if (this.$.allToggleBtn) {
      this.$.allToggleBtn.classList.toggle('on', anyRoomOn);
      this.$.allToggleBtn.classList.toggle('off', !anyRoomOn);
      this.$.allToggleBtn.setAttribute('aria-label', anyRoomOn ? 'Turn all lights off' : 'Turn all lights on');
      const iconEl = this.$.allToggleBtn.querySelector('.icon');
      const labelEl = this.$.allToggleBtn.querySelector('.all-toggle-label');
      if (iconEl) iconEl.textContent = anyRoomOn ? 'power_settings_new' : 'lightbulb';
      if (labelEl) labelEl.textContent = anyRoomOn ? 'All Off' : 'All On';
    }
  }
}

// ═══════════════════════════════════════════════════════════
// Registration
// ═══════════════════════════════════════════════════════════

registerCard('tunet-rooms-card', TunetRoomsCard, {
  name: 'Tunet Rooms Card',
  description: 'Compact room grid with glassmorphism tile design',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-rooms-card',
});

logCardVersion('TUNET-ROOMS', CARD_VERSION, '#D4850A');
