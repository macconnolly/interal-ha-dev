/**
 * Tunet Sonos Card v1.0.0
 * Unified Sonos media player + speaker tiles in one card
 * Replaces: tunet_media_card.js + tunet_speaker_grid_card.js
 *
 * Layout:
 *   Compact player header (album art + track info + transport + source dropdown)
 *   Horizontal-scroll speaker tiles with drag-to-volume
 *
 * Interactions:
 *   Tile tap        = select active speaker
 *   Tile hold/drag  = volume control (floating pill)
 *   Icon tap        = open more-info dialog
 *   Group badge tap = toggle group membership
 *   Source dropdown  = switch which Sonos entity to control
 *   Transport        = play/pause/prev/next on coordinator
 *   Volume button    = show volume overlay for active entity
 *
 * Version 1.0.0
 */

import {
  TOKENS,
  RESET, BASE_FONT, ICON_BASE,
  CARD_SURFACE, CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion, clamp,
  renderConfigPlaceholder, compactSpeakerName,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '1.0.0';

/* ===============================================================
   CSS - Card-specific overrides
   =============================================================== */

const CARD_OVERRIDES = `
  :host {
    /* Blue accent for Sonos */
    --sonos-blue: #007AFF;
    --sonos-blue-fill: rgba(0,122,255, 0.09);
    --sonos-blue-border: rgba(0,122,255, 0.14);
    --sonos-blue-glow: rgba(0,122,255, 0.25);

    /* Green for playing */
    --sonos-green: var(--green);
    --sonos-green-fill: var(--green-fill);
    --sonos-green-border: var(--green-border);

    /* Tile shadows */
    --tile-shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);

    display: block;
  }

  :host(.dark) {
    --sonos-blue: #0A84FF;
    --sonos-blue-fill: rgba(10,132,255, 0.13);
    --sonos-blue-border: rgba(10,132,255, 0.18);
    --sonos-blue-glow: rgba(10,132,255, 0.35);

    --tile-shadow: 0 4px 12px rgba(0,0,0,0.20), 0 1px 2px rgba(0,0,0,0.30);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.20);
  }

  .card {
    width: 100%;
    padding: 16px;
    gap: 12px;
    overflow: visible;
  }

  /* State borders */
  .card[data-state="playing"] { border-color: var(--sonos-blue-border); }
  .card[data-state="paused"] { opacity: 0.88; }
  .card[data-state="idle"] { opacity: 0.65; }
  .card[data-state="off"],
  .card[data-state="unavailable"] { opacity: 0.55; }
`;

/* ===============================================================
   CSS - Compact Player Header
   =============================================================== */

const PLAYER_HEADER_STYLES = `
  .player-header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
  }

  /* Album art - 36px to match icon sizes */
  .album-art {
    width: 36px; height: 36px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden;
    background: var(--sonos-blue-fill);
    display: grid; place-items: center;
    position: relative;
  }
  .album-art img {
    width: 100%; height: 100%; object-fit: cover;
    position: absolute; inset: 0;
  }
  .album-art .icon { color: var(--sonos-blue); font-size: 20px; }
  .card[data-state="playing"] .album-art { box-shadow: var(--ctrl-sh); }

  /* Track info */
  .track-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 1px;
  }
  .track-name {
    font-size: 14px; font-weight: 700; color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 11px; font-weight: 600; color: var(--text-sub); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Transport controls - all uniform */
  .transport {
    display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  }
  .t-btn {
    width: 36px; height: 36px; border-radius: 10px;
    display: grid; place-items: center;
    cursor: pointer;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      background var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard);
    border: none; background: transparent; color: var(--text-sub);
  }
  @media (hover: hover) {
    .t-btn:hover { background: var(--track-bg); }
  }
  .t-btn:active { transform: scale(var(--press-scale-strong)); }
  .t-btn .icon { font-size: 20px; }
  .t-btn[disabled] { opacity: 0.35; pointer-events: none; }
`;

/* ===============================================================
   CSS - Source Dropdown
   =============================================================== */

const SOURCE_DROPDOWN_STYLES = `
  .speaker-wrap { position: relative; z-index: 4000; }
  .speaker-btn {
    display: flex; align-items: center; gap: 4px;
    min-height: var(--ctrl-min-h, 34px); padding: 0 9px;
    border-radius: 9px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    color: var(--text-sub); letter-spacing: .2px;
    cursor: pointer;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard);
  }
  @media (hover: hover) {
    .speaker-btn:hover { box-shadow: var(--shadow); }
  }
  .speaker-btn:active { transform: scale(var(--press-scale)); }
  .speaker-btn .chevron { transition: transform .2s ease; }
  .speaker-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  .dd-menu {
    position: absolute; top: calc(100% + 6px); right: 0;
    min-width: 210px; padding: 4px; border-radius: 12px;
    background: rgba(255,255,255, 1);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border); box-shadow: var(--shadow-up);
    z-index: 2147483000; display: none; flex-direction: column; gap: 0;
  }
  :host(.dark) .dd-menu {
    background: rgba(30,41,59, 1);
  }
  .dd-menu.open { display: flex; animation: srcMenuIn .14s ease forwards; }
  @keyframes srcMenuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dd-option {
    padding: 6px 8px; border-radius: 9px;
    font-size: 12px; font-weight: 600; color: var(--text);
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: background .1s;
    user-select: none; border: none; background: transparent;
    font-family: inherit;
  }
  @media (hover: hover) {
    .dd-option:hover { background: var(--track-bg); }
  }
  .dd-option:active { transform: scale(var(--press-scale)); }
  .dd-option.selected { font-weight: 700; color: var(--green); background: var(--green-fill); }
  .dd-option.selected .spk-icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .spk-text { display: flex; align-items: center; gap: 0.22em; flex: 1; min-width: 0; }
  .spk-name { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 700; max-width: 88px; }
  .spk-now-playing {
    font-size: 11px; font-weight: 600; color: var(--text-muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 0;
    flex: 1;
  }
  .spk-now-playing::before {
    content: "·";
    margin-right: 0.25em;
    opacity: 0.7;
  }
  .dd-option.selected .spk-now-playing { color: var(--green); opacity: 0.7; }

  .grp-check {
    width: 18px; height: 18px; border-radius: 999px; flex-shrink: 0;
    border: 1.5px solid var(--text-muted); display: grid; place-items: center;
    transition:
      background var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
    cursor: pointer; -webkit-tap-highlight-color: transparent;
    position: relative; z-index: 2;
  }
  @media (hover: hover) {
    .grp-check:hover { border-color: var(--green); }
  }
  .grp-check.in-group { background: var(--green); border-color: var(--green); }
  .grp-check .icon {
    color: #fff; opacity: 0; transition: opacity .1s;
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 14;
  }
  .grp-check.in-group .icon { opacity: 1; }

  .dd-option.action { color: var(--text-sub); }
  @media (hover: hover) {
    .dd-option.action:hover { color: var(--text); }
  }
  .dd-option.action .icon { color: var(--green); }

  .dd-divider { height: 1px; background: var(--divider); margin: 2px 6px; }
`;

/* ===============================================================
   CSS - Speaker Tiles
   =============================================================== */

const SPEAKER_TILE_STYLES = `
  /* Horizontal scroll container */
  .speakers-scroll {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-padding-left: 0;
    padding: 4px 0 6px 0;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
    margin: 0 -4px;
    padding-left: 4px;
    padding-right: 4px;
  }
  .speakers-scroll::-webkit-scrollbar { display: none; }

  /* Individual speaker tile - landscape */
  .speaker-tile {
    scroll-snap-align: start;
    flex-shrink: 0;
    width: 150px;
    background: var(--tile-bg);
    border-radius: var(--r-tile);
    box-shadow: var(--tile-shadow);
    border: 1.5px solid var(--border-ghost);
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
    row-gap: 1px;
    padding: 10px 12px 16px;
    position: relative;
    cursor: pointer;
    user-select: none;
    touch-action: auto;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-surface) var(--ease-emphasized),
      box-shadow var(--motion-surface) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      background-color var(--motion-surface) var(--ease-standard);
  }
  @media (hover: hover) {
    .speaker-tile:hover { box-shadow: var(--tile-shadow-lift); }
  }
  .speaker-tile.selected {
    box-shadow:
      0 0 0 1.5px var(--green-border),
      var(--tile-shadow-lift);
  }
  .speaker-tile:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  /* Grouped (active) state */
  .speaker-tile.grouped { border-color: var(--sonos-blue-border); }

  /* Sliding (drag-to-volume active) */
  .speaker-tile.sliding {
    transform: scale(1.06);
    box-shadow: var(--tile-shadow-lift);
    border-color: var(--sonos-blue);
    z-index: 100;
  }

  /* Floating volume pill */
  .spk-floating-pill {
    position: absolute;
    top: -10px; left: 50%;
    transform: translate(-50%, -100%);
    background: var(--tile-bg);
    color: var(--sonos-blue);
    padding: 5px 14px;
    border-radius: var(--r-pill);
    font-size: 13px;
    font-weight: 800;
    box-shadow: 0 8px 24px rgba(0,0,0,0.14);
    white-space: nowrap;
    z-index: 101;
    border: 1px solid var(--border-ghost);
    opacity: 0; pointer-events: none;
    transition: opacity .15s ease;
    font-variant-numeric: tabular-nums;
  }
  :host(.dark) .spk-floating-pill { border-color: rgba(255,255,255,0.08); }
  .speaker-tile.sliding .spk-floating-pill { opacity: 1; }

  /* Group badge indicator */
  .group-badge {
    position: absolute; top: 8px; right: 8px;
    width: 22px; height: 22px;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--tile-bg);
    color: var(--text-muted);
    display: grid; place-items: center;
    cursor: pointer;
    z-index: 2;
    padding: 0;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      background var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard);
  }
  .group-badge .icon { font-size: 14px; }
  @media (hover: hover) {
    .group-badge:hover {
      border-color: var(--sonos-blue);
      color: var(--sonos-blue);
    }
  }
  .group-badge:active { transform: scale(var(--press-scale)); }
  .group-badge:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .speaker-tile.grouped .group-badge {
    background: var(--sonos-blue-fill);
    border-color: var(--sonos-blue-border);
    color: var(--sonos-blue);
    box-shadow: 0 0 8px var(--sonos-blue-glow);
  }

  /* Speaker icon wrap - spans both rows, sits on the left */
  .spk-icon-wrap {
    grid-row: 1 / 3;
    width: 34px; height: 34px;
    border-radius: 9px;
    display: grid; place-items: center;
    transition:
      color var(--motion-ui) ease,
      background var(--motion-ui) ease,
      border-color var(--motion-ui) ease;
    background: var(--gray-ghost);
    color: var(--text-sub);
  }
  .spk-icon-wrap .icon { font-size: 20px; }
  .spk-icon-btn {
    border: none;
    padding: 0;
    cursor: pointer;
  }
  .spk-icon-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .speaker-tile.grouped .spk-icon-wrap {
    background: var(--sonos-blue-fill);
    color: var(--sonos-blue);
  }
  .speaker-tile.grouped .spk-icon-wrap .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  /* Speaker name - top row, right of icon */
  .spk-name {
    font-size: 13px; font-weight: 600; color: var(--text);
    line-height: 1.2; text-align: left;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    align-self: end;
  }

  /* Volume value - bottom row, right of icon */
  .spk-vol {
    font-size: 11px; font-weight: 700;
    color: var(--sonos-blue);
    line-height: 1;
    text-align: left;
    align-self: start;
    font-variant-numeric: tabular-nums;
    transition: color .2s ease;
  }
  .speaker-tile:not(.grouped) .spk-vol {
    color: var(--text-muted);
  }

  /* Volume bar */
  .spk-vol-track {
    position: absolute; bottom: 7px; left: 12px; right: 12px;
    height: 3px; background: var(--track-bg);
    border-radius: var(--r-pill);
    overflow: hidden;
  }
  .spk-vol-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue);
    opacity: 0.6;
    transition: width .1s linear;
  }
  .speaker-tile:not(.grouped) .spk-vol-fill {
    opacity: 0.2;
  }
`;

/* ===============================================================
   CSS - Volume Overlay
   =============================================================== */

const VOLUME_OVERLAY_STYLES = `
  .vol-overlay {
    position: absolute; inset: 0;
    background: var(--glass);
    backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
    border-radius: var(--r-card);
    display: none; align-items: center; justify-content: center;
    gap: 12px; padding: 16px 20px;
    z-index: 10;
  }
  .vol-overlay.active { display: flex; }
  .vol-overlay .vol-icon {
    font-size: 20px; color: var(--text-sub); cursor: pointer;
    font-family: 'Material Symbols Rounded';
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-flex; align-items: center; justify-content: center;
    border: none; background: none; padding: 4px;
  }
  .vol-overlay .vol-icon:active { transform: scale(var(--press-scale-strong)); }

  .vol-slider-track {
    flex: 1; height: 6px; background: var(--track-bg);
    border-radius: var(--r-pill); position: relative; cursor: pointer;
    touch-action: none;
  }
  .vol-slider-fill {
    height: 100%; border-radius: var(--r-pill);
    background: var(--sonos-blue); transition: width .1s linear;
  }
  .vol-slider-thumb {
    position: absolute; top: 50%; transform: translate(-50%, -50%);
    width: 18px; height: 18px; background: var(--thumb-bg, #fff);
    border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    transition: left .1s linear;
  }
  .vol-pct {
    font-size: 14px; font-weight: 700; color: var(--sonos-blue);
    min-width: 36px; text-align: right;
    font-variant-numeric: tabular-nums;
  }
`;

/* ===============================================================
   CSS - Responsive
   =============================================================== */

const RESPONSIVE_STYLES = `
  @media (max-width: 440px) {
    .card { padding: 14px; gap: 10px; }
    .player-header { gap: 10px; }
    .album-art { width: 32px; height: 32px; border-radius: 8px; }
    .album-art .icon { font-size: 18px; }
    .track-name { font-size: 13px; }
    .track-artist { font-size: 10px; }
    .t-btn { width: 32px; height: 32px; }
    .t-btn .icon { font-size: 18px; }

    /* Tiles become near-square on mobile */
    .speaker-tile {
      width: 100px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 10px 8px 16px;
      gap: 3px;
    }
    .spk-icon-wrap {
      grid-row: unset;
      width: 32px; height: 32px; border-radius: 8px;
    }
    .spk-icon-wrap .icon { font-size: 18px; }
    .spk-name { font-size: 12px; text-align: center; align-self: unset; }
    .spk-vol { font-size: 10px; text-align: center; align-self: unset; }
    .spk-vol-track { left: 10px; right: 10px; bottom: 6px; }
  }
`;

/* ===============================================================
   Composite stylesheet
   =============================================================== */

const TUNET_SONOS_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${PLAYER_HEADER_STYLES}
  ${SOURCE_DROPDOWN_STYLES}
  ${SPEAKER_TILE_STYLES}
  ${VOLUME_OVERLAY_STYLES}
  ${RESPONSIVE_STYLES}
  ${REDUCED_MOTION}
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TUNET_SONOS_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Compact Player Header -->
      <div class="player-header">
        <div class="album-art" id="albumArt">
          <span class="icon filled" id="albumIcon">music_note</span>
        </div>
        <div class="track-info">
          <div class="track-name" id="trackName">Nothing playing</div>
          <div class="track-artist" id="trackArtist">Select a source to play</div>
        </div>
        <div class="transport">
          <button class="t-btn" id="prevBtn" title="Previous">
            <span class="icon" style="font-size:20px">skip_previous</span>
          </button>
          <button class="t-btn" id="playBtn" title="Play/Pause">
            <span class="icon" style="font-size:20px" id="playIcon">play_arrow</span>
          </button>
          <button class="t-btn" id="nextBtn" title="Next">
            <span class="icon" style="font-size:20px">skip_next</span>
          </button>
          <button class="t-btn" id="volBtn" title="Volume">
            <span class="icon" style="font-size:20px" id="volBtnIcon">volume_up</span>
          </button>
        </div>
        <div class="speaker-wrap source-wrap" id="sourceWrap">
          <button class="speaker-btn source-btn" id="sourceBtn" aria-expanded="false">
            <span class="icon" id="sourceIcon" style="font-size:16px">speaker</span>
            <span id="sourceLabel">Speaker</span>
            <span class="icon chevron" style="font-size:14px">expand_more</span>
          </button>
          <div class="dd-menu source-dd" id="sourceDd"></div>
        </div>
      </div>

      <!-- Speaker Tiles (horizontal scroll) -->
      <div class="speakers-scroll" id="speakersScroll"></div>

      <!-- Volume Overlay -->
      <div class="vol-overlay" id="volOverlay">
        <button class="vol-icon" id="muteBtn">volume_off</button>
        <div class="vol-slider-track" id="volTrack">
          <div class="vol-slider-fill" id="volFill" style="width:0%"></div>
          <div class="vol-slider-thumb" id="volThumb" style="left:0%"></div>
        </div>
        <div class="vol-pct" id="volPct">0%</div>
        <button class="vol-icon" id="volClose">close</button>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Constants
   =============================================================== */

const DRAG_THRESHOLD = 6;
const DRAG_SCALE = 1.2; // px per 1% volume
const LONG_PRESS_MS = 400;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetSonosCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._activeEntity = null;
    this._cachedSpeakers = null;
    this._tileRefs = new Map();

    // Drag state
    this._dragEntity = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._dragVol = 0;
    this._dragLastPct = 0;
    this._dragTarget = null;
    this._dragPointerId = null;
    this._ddDragRefs = null;
    this._ddDragFired = false;
    this._volDebounce = null;

    // Long-press state
    this._longPressTimer = null;
    this._longPressFired = false;

    // Volume overlay state
    this._volDragging = false;
    this._volOverlayDebounce = null;
    this._volumeAutoExitTimer = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;

    injectFonts();
    this._onDocClick = this._onDocClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }

  /* ── Config ───────────────────────────────────────── */

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'entity', required: true, selector: { entity: { filter: [{ domain: 'media_player' }] } } },
        { name: 'name', selector: { text: {} } },
        {
          name: 'speakers',
          selector: {
            object: {
              multiple: true,
              label_field: 'name',
              description_field: 'entity',
              fields: {
                entity: { label: 'Speaker', required: true, selector: { entity: { filter: [{ domain: 'media_player' }] } } },
                name: { label: 'Name', selector: { text: {} } },
                icon: { label: 'Icon', selector: { text: {} } },
              },
            },
          },
        },
        {
          type: 'expandable',
          title: 'Advanced',
          icon: 'mdi:tune',
          schema: [
            { name: 'coordinator_sensor', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
            { name: 'active_group_sensor', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
            { name: 'playing_status_sensor', selector: { entity: { filter: [{ domain: 'sensor' }] } } },
          ],
        },
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || '';
        return ({
          entity: 'Media Player',
          name: 'Card Name',
          speakers: 'Speakers',
          coordinator_sensor: 'Coordinator Sensor',
          active_group_sensor: 'Active Group Sensor',
          playing_status_sensor: 'Playing Status Sensor',
        }[s.name] || s.name);
      },
      computeHelper: (s) => ({
        speakers: 'Optional explicit speaker list. If empty, speakers are auto-discovered from Sonos binary sensors.',
        coordinator_sensor: 'Default: sensor.sonos_smart_coordinator',
      }[s.name] || ''),
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Sonos',
      speakers: [],
    };
  }

  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Select a media player entity', 'Sonos');
      return;
    }
    this._config = {
      entity: config.entity,
      name: config.name || 'Sonos',
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || 'sensor.sonos_smart_coordinator',
      active_group_sensor: config.active_group_sensor || 'sensor.sonos_active_group_coordinator',
      playing_status_sensor: config.playing_status_sensor || 'sensor.sonos_playing_status',
    };
    // _activeEntity is set lazily in hass setter once coordinator is known
    this._cachedSpeakers = null;
    if (this._rendered) {
      this._buildTiles();
      this._updateAll();
    }
  }

  /* ── HA State ─────────────────────────────────────── */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
      this._buildTiles();
    }

    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);

    // Initialize active entity from coordinator (the speaker actually playing)
    if (!this._activeEntity) {
      this._activeEntity = this._coordinator;
    }

    // Auto-detect speakers
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      this._buildTiles();
    }

    // Only update if relevant entities changed
    let changed = !oldHass;
    if (!changed) {
      const watchList = [
        this._config.entity,
        this._activeEntity,
        this._config.coordinator_sensor,
        this._config.active_group_sensor,
        this._config.playing_status_sensor,
      ];
      for (const spk of (this._cachedSpeakers || [])) {
        watchList.push(spk.entity);
        watchList.push(this._binarySensorFor(spk.entity, true));
        watchList.push(this._binarySensorFor(spk.entity, false));
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

  getCardSize() { return 3; }

  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 2,
    };
  }

  /* ── Lifecycle ────────────────────────────────────── */

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
    window.addEventListener('resize', this._onViewportChange, { passive: true });
    window.addEventListener('scroll', this._onViewportChange, { passive: true });
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange);
    clearTimeout(this._longPressTimer);
    clearTimeout(this._volDebounce);
    clearTimeout(this._volOverlayDebounce);
    clearTimeout(this._volumeAutoExitTimer);
    clearTimeout(this._cooldownTimer);
  }

  /* ── Helpers ──────────────────────────────────────── */

  _binarySensorFor(entityId, active = true) {
    const room = entityId.replace('media_player.', '');
    return active
      ? `binary_sensor.sonos_${room}_in_active_group`
      : `binary_sensor.sonos_${room}_in_playing_group`;
  }

  get _coordinator() {
    if (!this._hass) return this._activeEntity || this._config.entity;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    if (sensor && sensor.state && !['unknown', 'unavailable', 'none'].includes(sensor.state)) {
      if (this._hass.states[sensor.state]) return sensor.state;
    }
    return this._activeEntity || this._config.entity;
  }

  /**
   * Transport target = whatever the user selected in the dropdown.
   * Sonos handles group routing internally — sending play/pause to any
   * group member routes to the coordinator automatically.
   */
  get _transportTarget() {
    return this._activeEntity || this._coordinator;
  }

  get _volumeTarget() {
    if (this._isGroupedCoordinatorSelected()) return this._coordinator;
    return this._activeEntity || this._coordinator || this._config.entity;
  }

  _callTransport(service) {
    if (!this._hass) return;
    this._hass.callService('media_player', service, { entity_id: this._transportTarget });
  }

  _callService(domain, service, data) {
    if (!this._hass) return;
    this._hass.callService(domain, service, data);
  }

  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService('script', name, data);
  }

  _activeGroupMembers() {
    if (!this._hass) return [];
    const sensor = this._hass.states[this._config.active_group_sensor];
    if (!sensor) return [];
    const fromAttr = sensor.attributes && sensor.attributes.group_members;
    if (Array.isArray(fromAttr)) return fromAttr;
    if (typeof fromAttr === 'string') {
      try {
        const parsed = JSON.parse(fromAttr);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) { /* ignore */ }
    }
    return [];
  }

  _isSpeakerInActiveGroup(entityId) {
    const activeMembers = this._activeGroupMembers();
    if (activeMembers.length > 0) return activeMembers.includes(entityId);
    if (!this._hass) return false;
    const activeBinary = this._hass.states[this._binarySensorFor(entityId, true)];
    if (activeBinary) return activeBinary.state === 'on';
    const legacyBinary = this._hass.states[this._binarySensorFor(entityId, false)];
    return !!legacyBinary && legacyBinary.state === 'on';
  }

  _getGroupedCount() {
    const members = this._activeGroupMembers();
    if (members.length > 0) return members.length;
    const speakers = this._cachedSpeakers || [];
    return speakers.filter((spk) => this._isSpeakerInActiveGroup(spk.entity)).length;
  }

  _isGroupedCoordinatorSelected() {
    return !!this._coordinator &&
      this._activeEntity === this._coordinator &&
      this._getGroupedCount() > 1;
  }

  _clearVolumeAutoExit() {
    clearTimeout(this._volumeAutoExitTimer);
    this._volumeAutoExitTimer = null;
  }

  _resetVolumeAutoExit() {
    if (!this.$?.volOverlay?.classList.contains('active')) return;
    this._clearVolumeAutoExit();
    this._volumeAutoExitTimer = setTimeout(() => {
      this._setVolumeOverlayActive(false);
    }, 5000);
  }

  _setVolumeOverlayActive(active) {
    this.$.volOverlay.classList.toggle('active', active);
    if (active) this._resetVolumeAutoExit();
    else this._clearVolumeAutoExit();
  }

  _setActiveEntity(entityId) {
    if (!entityId) return;
    if (this._activeEntity === entityId) {
      this._resetVolumeAutoExit();
      return;
    }
    this._activeEntity = entityId;
    this._resetVolumeAutoExit();
    this._updateAll();
  }

  _openSpeakerMoreInfo(entityId) {
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true,
      composed: true,
      detail: { entityId },
    }));
  }

  _toggleSpeakerGroup(entityId) {
    this._callScript('sonos_toggle_group_membership', {
      target_speaker: entityId,
    });
  }

  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers.map((spk) => ({
        ...spk,
        _explicitName: Boolean(spk.name),
      }));
    }
    if (!this._hass) return [];
    const speakers = [];
    const seen = new Set();
    for (const entityId of Object.keys(this._hass.states)) {
      const match = entityId.match(/^binary_sensor\.sonos_(.+)_in_(active|playing)_group$/);
      if (match) {
        const room = match[1];
        const playerEntity = `media_player.${room}`;
        if (seen.has(playerEntity)) continue;
        const playerState = this._hass.states[playerEntity];
        if (playerState) {
          seen.add(playerEntity);
          speakers.push({
            entity: playerEntity,
            name: playerState.attributes.friendly_name || room.replace(/_/g, ' '),
            icon: 'speaker',
            _explicitName: false,
          });
        }
      }
    }
    return speakers;
  }

  _getSpeakerStateLabel(entityId) {
    if (!this._hass) return 'Idle';
    const entity = this._hass.states[entityId];
    if (!entity) return 'Idle';
    if (entity.state === 'playing') {
      const title = entity.attributes.media_title;
      return title || 'Playing';
    }
    if (entity.state === 'paused') return 'Paused';
    return 'Idle';
  }

  _getSpeakerShortName(entityId) {
    if (!this._hass) return entityId;
    const entity = this._hass.states[entityId];
    if (!entity) return entityId;
    return compactSpeakerName(entity.attributes.friendly_name || entityId.replace('media_player.', ''));
  }

  _speakerLabel(spk, fallback = '') {
    return compactSpeakerName(spk?.name || fallback);
  }

  /* ── Rendering ────────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = TUNET_SONOS_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TUNET_SONOS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'albumArt', 'albumIcon', 'trackName', 'trackArtist',
      'prevBtn', 'playBtn', 'playIcon', 'nextBtn',
      'volBtn', 'volBtnIcon',
      'sourceWrap', 'sourceBtn', 'sourceIcon', 'sourceLabel', 'sourceDd',
      'speakersScroll',
      'volOverlay', 'muteBtn', 'volTrack', 'volFill', 'volThumb', 'volPct', 'volClose',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  /* ── Event Listeners ──────────────────────────────── */

  _setupListeners() {
    const $ = this.$;

    // Album art -> more-info (opens the entity currently being controlled)
    $.albumArt.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: this._transportTarget },
      }));
    });
    $.albumArt.style.cursor = 'pointer';

    // Transport
    $.prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_previous_track');
    });
    $.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_play_pause');
    });
    $.nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callTransport('media_next_track');
    });

    // Volume button -> show overlay
    $.volBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setVolumeOverlayActive(!$.volOverlay.classList.contains('active'));
    });

    // Volume overlay close
    $.volClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this._setVolumeOverlayActive(false);
    });

    // Mute toggle
    $.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const volumeTarget = this._volumeTarget;
      const entity = this._hass && this._hass.states[volumeTarget];
      if (entity) {
        this._callService('media_player', 'volume_mute', {
          entity_id: volumeTarget,
          is_volume_muted: !entity.attributes.is_volume_muted,
        });
        this._resetVolumeAutoExit();
      }
    });

    // Volume overlay slider
    this._setupVolOverlayDrag();

    // Source dropdown toggle
    $.sourceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = $.sourceDd.classList.contains('open');
      if (isOpen) {
        this._closeSourceMenu();
      } else {
        this._buildSourceMenu();
        this._openSourceMenu();
      }
    });
  }

  _setupVolOverlayDrag() {
    const track = this.$.volTrack;
    let dragging = false;

    const setVol = (e) => {
      const rect = track.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const pct = clamp(Math.round(((cx - rect.left) / rect.width) * 100), 0, 100);
      this.$.volFill.style.width = pct + '%';
      this.$.volThumb.style.left = pct + '%';
      this.$.volPct.textContent = pct + '%';

      clearTimeout(this._volOverlayDebounce);
      this._volOverlayDebounce = setTimeout(() => {
        const volumeTarget = this._volumeTarget;
        this._callService('media_player', 'volume_set', {
          entity_id: volumeTarget,
          volume_level: pct / 100,
        });
        this._resetVolumeAutoExit();
        this._serviceCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
      }, 200);
    };

    track.addEventListener('pointerdown', (e) => {
      dragging = true;
      this._volDragging = true;
      track.setPointerCapture(e.pointerId);
      setVol(e);
    });
    track.addEventListener('pointermove', (e) => { if (dragging) setVol(e); });
    track.addEventListener('pointerup', () => {
      dragging = false;
      this._volDragging = false;
    });
    track.addEventListener('pointercancel', () => {
      dragging = false;
      this._volDragging = false;
    });
  }

  /* ── Source Dropdown ──────────────────────────────── */

  _buildSourceMenu() {
    const dd = this.$.sourceDd;
    if (!dd || !this._hass) return;
    dd.innerHTML = '';

    const speakers = this._cachedSpeakers || [];
    const groupedCount = this._getGroupedCount();
    for (const spk of speakers) {
      const entity = this._hass.states[spk.entity];
      if (!entity) continue;

      const isActive = spk.entity === this._activeEntity;
      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const stateLabel = this._getSpeakerStateLabel(spk.entity);

      const opt = document.createElement('button');
      opt.className = `dd-option${isActive ? ' selected' : ''}`;

      const iconEl = document.createElement('span');
      iconEl.className = 'icon spk-icon';
      iconEl.style.fontSize = '16px';
      iconEl.textContent = (spk.entity === this._coordinator && groupedCount > 1)
        ? 'speaker_group'
        : (spk.icon || 'speaker');
      opt.appendChild(iconEl);

      const textWrap = document.createElement('span');
      textWrap.className = 'spk-text';
      const nameEl = document.createElement('span');
      nameEl.className = 'spk-name';
      nameEl.textContent = this._speakerLabel(spk, entity.attributes.friendly_name || spk.entity);
      textWrap.appendChild(nameEl);
      const subSpan = document.createElement('span');
      subSpan.className = 'spk-now-playing';
      subSpan.textContent = (spk.entity === this._coordinator && groupedCount > 1)
        ? `${groupedCount} grouped`
        : stateLabel;
      textWrap.appendChild(subSpan);
      opt.appendChild(textWrap);

      const check = document.createElement('div');
      check.className = `grp-check${inGroup ? ' in-group' : ''}`;
      const checkIcon = document.createElement('span');
      checkIcon.className = 'icon';
      checkIcon.style.fontSize = '12px';
      checkIcon.textContent = 'check';
      check.appendChild(checkIcon);
      opt.appendChild(check);

      check.addEventListener('click', (e) => {
        e.stopPropagation();
        check.classList.toggle('in-group');
        this._callScript('sonos_toggle_group_membership', {
          target_speaker: spk.entity,
        });
      });

      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._activeEntity = spk.entity;
        this._closeSourceMenu();
        this._resetVolumeAutoExit();
        this._updateAll();
      });

      dd.appendChild(opt);
    }

    if (speakers.length > 1) {
      const divider = document.createElement('div');
      divider.className = 'dd-divider';
      dd.appendChild(divider);

      const groupAllBtn = document.createElement('button');
      groupAllBtn.className = 'dd-option action';
      const gaIcon = document.createElement('span');
      gaIcon.className = 'icon';
      gaIcon.style.fontSize = '18px';
      gaIcon.textContent = 'link';
      groupAllBtn.appendChild(gaIcon);
      groupAllBtn.appendChild(document.createTextNode(' Group All'));
      groupAllBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._callScript('sonos_group_all_to_playing');
        this._closeSourceMenu();
      });
      dd.appendChild(groupAllBtn);

      const ungroupBtn = document.createElement('button');
      ungroupBtn.className = 'dd-option action';
      const ugIcon = document.createElement('span');
      ugIcon.className = 'icon';
      ugIcon.style.fontSize = '18px';
      ugIcon.textContent = 'link_off';
      ungroupBtn.appendChild(ugIcon);
      ungroupBtn.appendChild(document.createTextNode(' Ungroup All'));
      ungroupBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._callScript('sonos_ungroup_all');
        this._closeSourceMenu();
      });
      dd.appendChild(ungroupBtn);
    }
  }

  _openSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.add('open');
    sourceBtn.setAttribute('aria-expanded', 'true');
    // Elevate host z-index so dropdown escapes sibling card stacking
    this.style.position = 'relative';
    this.style.zIndex = '10';
  }

  _closeSourceMenu() {
    const { sourceDd, sourceBtn } = this.$;
    if (!sourceDd || !sourceBtn) return;
    sourceDd.classList.remove('open');
    sourceBtn.setAttribute('aria-expanded', 'false');
    this.style.position = '';
    this.style.zIndex = '';
  }

  _onDocClick(e) {
    if (!this.$ || !this.$.sourceDd) return;
    if (!this.$.sourceDd.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector('.source-wrap'))) {
      this._closeSourceMenu();
    }
  }

  _onViewportChange() {
    // No-op: dropdown is now position:absolute, auto-tracks button
  }

  /* ── Build Speaker Tiles ─────────────────────────── */

  _buildTiles() {
    const scroll = this.$.speakersScroll;
    if (!scroll) return;
    scroll.innerHTML = '';
    this._tileRefs.clear();

    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const tile = document.createElement('div');
      tile.className = 'speaker-tile';
      tile.tabIndex = 0;
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-pressed', 'false');
      tile.setAttribute('aria-label', `Select ${this._speakerLabel(spk, this._getSpeakerShortName(spk.entity))}`);
      tile.dataset.entity = spk.entity;

      const badge = document.createElement('button');
      badge.type = 'button';
      badge.className = 'group-badge';
      badge.setAttribute('aria-label', `Toggle group membership for ${this._speakerLabel(spk, this._getSpeakerShortName(spk.entity))}`);
      const badgeIcon = document.createElement('span');
      badgeIcon.className = 'icon';
      badgeIcon.textContent = 'add';
      badge.appendChild(badgeIcon);
      badge.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleSpeakerGroup(spk.entity);
      });
      tile.appendChild(badge);

      // Floating pill
      const pill = document.createElement('div');
      pill.className = 'spk-floating-pill';
      pill.textContent = '0%';
      tile.appendChild(pill);

      // Icon wrap
      const iconWrap = document.createElement('button');
      iconWrap.type = 'button';
      iconWrap.className = 'spk-icon-wrap spk-icon-btn';
      iconWrap.setAttribute('aria-label', `Open details for ${this._speakerLabel(spk, this._getSpeakerShortName(spk.entity))}`);
      const icon = document.createElement('span');
      icon.className = 'icon';
      icon.style.fontSize = '20px';
      icon.textContent = spk.icon || 'speaker';
      iconWrap.appendChild(icon);
      iconWrap.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
      iconWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openSpeakerMoreInfo(spk.entity);
      });
      tile.appendChild(iconWrap);

      // Name
      const nameEl = document.createElement('div');
      nameEl.className = 'spk-name';
      nameEl.textContent = this._speakerLabel(spk, this._getSpeakerShortName(spk.entity));
      tile.appendChild(nameEl);

      // Volume label
      const volEl = document.createElement('div');
      volEl.className = 'spk-vol';
      volEl.textContent = '0%';
      tile.appendChild(volEl);

      // Volume track
      const volTrack = document.createElement('div');
      volTrack.className = 'spk-vol-track';
      const volFill = document.createElement('div');
      volFill.className = 'spk-vol-fill';
      volFill.style.width = '0%';
      volTrack.appendChild(volFill);
      tile.appendChild(volTrack);

      tile.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          this._setActiveEntity(spk.entity);
        }
      });

      // Pointer events for hold-to-drag volume / tap-to-select
      tile.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        this._onTilePointerDown(spk.entity, e, tile);
      });

      scroll.appendChild(tile);
      this._tileRefs.set(spk.entity, { tile, badge, badgeIcon, iconWrap, icon, nameEl, volEl, volFill, pill });
    }
  }

  /* ── Tile Pointer Handling ───────────────────────── */

  _onTilePointerDown(entity, e, tile) {
    this._dragEntity = entity;
    this._dragStartX = e.clientX;
    this._dragActive = false;
    this._longPressFired = false;
    this._dragTarget = null;
    this._dragPointerId = e.pointerId;

    const playerState = this._hass && this._hass.states[entity];
    this._dragVol = playerState ? Math.round((playerState.attributes.volume_level || 0) * 100) : 0;
    this._dragLastPct = this._dragVol;

    clearTimeout(this._longPressTimer);
    this._longPressTimer = setTimeout(() => {
      if (!this._dragActive && this._dragEntity === entity) {
        this._longPressFired = true;
        this._setActiveEntity(entity);
        this._dragTarget = this._volumeTarget;
        const targetState = this._hass && this._hass.states[this._dragTarget];
        this._dragVol = targetState ? Math.round((targetState.attributes.volume_level || 0) * 100) : this._dragVol;
        this._dragLastPct = this._dragVol;
        try {
          tile.setPointerCapture?.(this._dragPointerId);
        } catch (_) {
          // Document-level listeners still handle the drag if capture fails.
        }
      }
    }, LONG_PRESS_MS);
  }

  _onPointerMove(e) {
    if (!this._dragEntity) return;
    if (!this._longPressFired) return;
    const dx = e.clientX - this._dragStartX;
    const isDdDrag = !!this._ddDragRefs && this._ddDragRefs.entity === this._dragEntity;

    if (!this._dragActive) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      if (isDdDrag) this._ddDragFired = true;
      clearTimeout(this._longPressTimer);

      const refs = this._tileRefs.get(this._dragEntity);
      if (refs) refs.tile.classList.add('sliding');
    }

    const newVol = clamp(Math.round(this._dragVol + (dx / DRAG_SCALE)), 0, 100);
    this._dragLastPct = newVol;

    // Update tile refs if available
    const refs = this._tileRefs.get(this._dragEntity);
    if (refs) {
      refs.volEl.textContent = newVol + '%';
      refs.pill.textContent = newVol + '%';
      refs.volFill.style.width = newVol + '%';
    }

    // Update dropdown option subtitle if dragging from dropdown
    if (isDdDrag && this._ddDragRefs.subEl) {
      this._ddDragRefs.subEl.textContent = newVol + '%';
    }

    clearTimeout(this._volDebounce);
    this._volDebounce = setTimeout(() => {
      this._callService('media_player', 'volume_set', {
        entity_id: this._dragTarget || this._dragEntity,
        volume_level: newVol / 100,
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
    }, 200);
  }

  _onPointerUp() {
    if (!this._dragEntity) return;
    clearTimeout(this._longPressTimer);

    const entity = this._dragEntity;
    const refs = this._tileRefs.get(entity);
    const isDdDrag = !!this._ddDragRefs && this._ddDragRefs.entity === entity;

    if (refs) refs.tile.classList.remove('sliding');

    if (this._dragActive) {
      clearTimeout(this._volDebounce);
      this._callService('media_player', 'volume_set', {
        entity_id: this._dragTarget || entity,
        volume_level: this._dragLastPct / 100,
      });
      this._serviceCooldown = true;
      clearTimeout(this._cooldownTimer);
      this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
      this._resetVolumeAutoExit();
    } else if (!this._longPressFired && !isDdDrag) {
      this._setActiveEntity(entity);
    }

    if (refs?.tile && refs.tile.hasPointerCapture?.(this._dragPointerId)) {
      try {
        refs.tile.releasePointerCapture(this._dragPointerId);
      } catch (_) {
        // Ignore release failures on browsers that auto-release.
      }
    }

    this._dragEntity = null;
    this._dragActive = false;
    this._dragTarget = null;
    this._dragPointerId = null;
    this._ddDragRefs = null;
  }

  /* ── Full Update ─────────────────────────────────── */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._volDragging || this._serviceCooldown) return;

    const coordId = this._coordinator;
    const coordEntity = this._hass.states[coordId];
    const activeEntity = this._hass.states[this._activeEntity];
    const volumeEntity = this._hass.states[this._volumeTarget];

    if (!coordEntity && !activeEntity) {
      $.card.dataset.state = 'unavailable';
      $.trackName.textContent = 'Unavailable';
      $.trackArtist.textContent = '';
      return;
    }

    // Show track info from the transport target: coordinator for grouped
    // speakers, the speaker itself for ungrouped/independent speakers
    const transportEntity = this._hass.states[this._transportTarget];
    const source = transportEntity || coordEntity || activeEntity;
    const state = source.state;
    const a = source.attributes;
    $.card.dataset.state = state;

    // Track info
    const isActive = state === 'playing' || state === 'paused';
    $.trackName.textContent = a.media_title || (isActive ? 'Unknown' : 'Not Playing');
    $.trackName.style.color = isActive ? '' : 'var(--text-muted)';
    $.trackArtist.textContent = a.media_artist || (isActive ? '' : 'Tap a speaker to start');

    // Album art
    const artUrl = a.entity_picture;
    const existingImg = $.albumArt.querySelector('img');
    if (artUrl) {
      const normalizedUrl = artUrl.startsWith('/') ? `${location.origin}${artUrl}` : artUrl;
      if (existingImg) {
        if (existingImg.src !== normalizedUrl) existingImg.src = normalizedUrl;
      } else {
        const img = document.createElement('img');
        img.src = normalizedUrl;
        img.alt = '';
        img.onerror = () => img.remove();
        $.albumArt.appendChild(img);
      }
    } else if (existingImg) {
      existingImg.remove();
    }

    // Play/pause icon
    $.playIcon.textContent = state === 'playing' ? 'pause' : 'play_arrow';
    if (state === 'playing') {
      $.playIcon.classList.add('filled');
    } else {
      $.playIcon.classList.remove('filled');
    }

    // Disable prev/next when idle
    $.prevBtn.disabled = !isActive;
    $.nextBtn.disabled = !isActive;

    // Volume button icon from selected volume target
    if (!this._volDragging && volumeEntity) {
      const vol = Math.round((volumeEntity.attributes.volume_level || 0) * 100);
      const muted = volumeEntity.attributes.is_volume_muted;
      const volIcon = muted ? 'volume_off' : vol < 40 ? 'volume_down' : 'volume_up';
      $.volBtnIcon.textContent = volIcon;

      // Update volume overlay
      $.volFill.style.width = vol + '%';
      $.volThumb.style.left = vol + '%';
      $.volPct.textContent = vol + '%';
    }

    // Source button label
    const activeSpk = (this._cachedSpeakers || []).find(s => s.entity === this._activeEntity);
    const isGroupTarget = this._isGroupedCoordinatorSelected();
    if (activeSpk) {
      $.sourceLabel.textContent = this._speakerLabel(activeSpk, this._getSpeakerShortName(this._activeEntity));
      $.sourceIcon.textContent = isGroupTarget ? 'speaker_group' : (activeSpk.icon || 'speaker');
    } else if (activeEntity) {
      $.sourceLabel.textContent = this._getSpeakerShortName(this._activeEntity);
      $.sourceIcon.textContent = isGroupTarget ? 'speaker_group' : 'speaker';
    }
    $.sourceBtn.title = isGroupTarget
      ? `Group volume • ${this._getGroupedCount()} grouped`
      : `Control ${$.sourceLabel.textContent}`;

    // Update speaker tiles
    this._updateTiles();
  }

  _updateTiles() {
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const refs = this._tileRefs.get(spk.entity);
      if (!refs) continue;

      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const playerState = this._hass.states[spk.entity];
      const isSelected = spk.entity === this._activeEntity;

      // Toggle grouped class
      refs.tile.classList.toggle('grouped', inGroup);
      refs.tile.classList.toggle('selected', isSelected);
      refs.tile.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      // Icon fill
      if (inGroup) {
        refs.icon.classList.add('filled');
      } else {
        refs.icon.classList.remove('filled');
      }

      refs.badge.classList.toggle('in-group', inGroup);
      refs.badge.title = inGroup ? 'Remove from group' : 'Add to group';
      refs.badgeIcon.textContent = inGroup ? 'remove' : 'add';

      // Volume from entity state (only if not dragging this tile)
      if (playerState && this._dragEntity !== spk.entity) {
        const vol = Math.round((playerState.attributes.volume_level || 0) * 100);
        refs.volEl.textContent = vol + '%';
        refs.volFill.style.width = vol + '%';
        refs.pill.textContent = vol + '%';
      }
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

registerCard('tunet-sonos-card', TunetSonosCard, {
  name: 'Tunet Sonos Card',
  description: 'Unified Sonos player with speaker tiles, volume control, and group management',
  preview: true,
  documentationURL: 'https://github.com/tunet/tunet-sonos-card',
});

logCardVersion('TUNET-SONOS', CARD_VERSION, '#007AFF');
