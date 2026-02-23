/**
 * Tunet Media Card
 * Custom Home Assistant card for Sonos multi-room audio
 * Transport controls + dropdown-based group management
 * Version 3.0.0
 */

const MEDIA_CARD_VERSION = '3.0.0';

/* ===============================================================
   CSS - Design system tokens + media card styles
   =============================================================== */

const MEDIA_STYLES = `
  /* -- Tokens: Light -- */
  :host {
    --glass: rgba(255,255,255, 0.55);
    --glass-border: rgba(255,255,255, 0.45);
    --shadow: 0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.10), 0 12px 40px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30, 0.55);
    --text-muted: #8E8E93;
    --green: #34C759;
    --green-fill: rgba(52,199,89, 0.12);
    --green-border: rgba(52,199,89, 0.15);
    --track-bg: rgba(28,28,30, 0.055);
    --r-card: 24px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 4px;
    --ctrl-bg: rgba(255,255,255, 0.52);
    --ctrl-border: rgba(0,0,0, 0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --dd-bg: rgba(255,255,255, 0.84);
    --dd-border: rgba(255,255,255, 0.60);
    --divider: rgba(28,28,30, 0.07);
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    display: block;
  }

  /* -- Tokens: Dark -- */
  :host(.dark) {
    --glass: rgba(30, 41, 59, 0.65);
    --glass-border: rgba(255,255,255, 0.08);
    --shadow: 0 1px 2px rgba(0,0,0,0.24), 0 4px 12px rgba(0,0,0,0.12);
    --shadow-up: 0 1px 3px rgba(0,0,0,0.30), 0 12px 40px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.08);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247, 0.50);
    --text-muted: rgba(245,245,247, 0.35);
    --green: #30D158;
    --green-fill: rgba(48,209,88, 0.14);
    --green-border: rgba(48,209,88, 0.18);
    --track-bg: rgba(255,255,255, 0.06);
    --ctrl-bg: rgba(255,255,255, 0.08);
    --ctrl-border: rgba(255,255,255, 0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --dd-bg: rgba(58,58,60, 0.88);
    --dd-border: rgba(255,255,255, 0.08);
    --divider: rgba(255,255,255, 0.06);
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
  }

  /* -- Reset -- */
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* -- Base -- */
  .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* -- Icons: Material Symbols Rounded -- */
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
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .icon.filled { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }

  /* -- Card Surface -- */
  .card {
    position: relative;
    width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 0;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }
  .card[data-state="playing"] { border-color: rgba(52,199,89, 0.14); }
  :host(.dark) .card[data-state="playing"] { border-color: rgba(48,209,88, 0.16); }
  .card[data-state="paused"] { opacity: 0.85; }
  .card[data-state="idle"] { opacity: 0.65; }

  /* Glass XOR stroke */
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.50),
      rgba(255,255,255,0.08) 40%,
      rgba(255,255,255,0.02) 60%,
      rgba(255,255,255,0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }

  /* ═══════════════════════════════════════
     HEADER
     ═══════════════════════════════════════ */
  .media-hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .info-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
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
  .card[data-state="playing"] .info-tile {
    background: var(--green-fill);
    border-color: var(--green-border);
  }

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
  .card[data-state="playing"] .entity-icon { color: var(--green); }
  .card[data-state="playing"] .entity-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .hdr-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub .green-ic { color: var(--green); }
  .hdr-spacer { flex: 1; }

  /* ═══════════════════════════════════════
     SPEAKER SELECTOR
     ═══════════════════════════════════════ */
  .speaker-wrap { position: relative; }
  .speaker-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 42px;
    padding: 0 10px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: .2px;
    cursor: pointer;
    transition: all .15s ease;
  }
  .speaker-btn:hover { box-shadow: var(--shadow); }
  .speaker-btn:active { transform: scale(.97); }
  .speaker-btn .chevron { transition: transform .2s ease; }
  .speaker-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* ═══════════════════════════════════════
     MEDIA ROW — art + info + transport
     ═══════════════════════════════════════ */
  .media-body { position: relative; overflow: hidden; }

  .media-row {
    display: flex;
    align-items: center;
    gap: 14px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .media-row.hidden {
    opacity: 0;
    transform: translateY(4px);
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  /* Album art */
  .album-art {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    border-radius: 10px;
    overflow: hidden;
    background: var(--track-bg);
    box-shadow: var(--ctrl-sh);
    display: grid;
    place-items: center;
    position: relative;
  }
  .album-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    position: absolute;
    inset: 0;
  }
  .album-art .icon { color: var(--text-muted); }
  .card[data-state="playing"] .album-art { box-shadow: var(--shadow); }

  /* Track info */
  .track-info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .track-name {
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-sub);
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Progress bar */
  .progress-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
  }
  .progress-time {
    font-size: 10px;
    font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: .3px;
    flex-shrink: 0;
    min-width: 28px;
  }
  .progress-time.right { text-align: right; }
  .progress-track {
    flex: 1;
    height: 3px;
    border-radius: 999px;
    background: var(--track-bg);
    position: relative;
    overflow: hidden;
  }
  .progress-fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: 999px;
    background: rgba(52,199,89, 0.50);
    transition: width .5s linear;
  }
  :host(.dark) .progress-fill { background: rgba(48,209,88, 0.50); }

  /* Transport buttons */
  .transport {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
  }
  .t-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all .15s ease;
    border: none;
    background: transparent;
    color: var(--text-sub);
  }
  .t-btn:hover { background: var(--track-bg); }
  .t-btn:active { transform: scale(.90); }

  .t-btn.play {
    width: 42px;
    height: 42px;
    background: var(--ctrl-bg);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh);
    color: var(--text);
  }
  .t-btn.play:hover { box-shadow: var(--shadow); }
  .card[data-state="playing"] .t-btn.play {
    background: var(--green-fill);
    border-color: var(--green-border);
    color: var(--green);
  }
  .card[data-state="playing"] .t-btn.play .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .vol-btn {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all .15s ease;
    border: none;
    background: transparent;
    color: var(--text-muted);
  }
  .vol-btn:hover { background: var(--track-bg); }
  .vol-btn:active { transform: scale(.90); }

  /* ═══════════════════════════════════════
     VOLUME SLIDER ROW
     ═══════════════════════════════════════ */
  .vol-row {
    display: flex;
    align-items: center;
    gap: 12px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .vol-row.hidden {
    opacity: 0;
    transform: translateY(-4px);
    pointer-events: none;
    position: absolute;
    inset: 0;
  }

  .vol-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    cursor: pointer;
    color: var(--green);
    transition: all .15s ease;
    border: none;
    background: transparent;
  }
  .vol-icon:hover { background: var(--track-bg); }
  .vol-icon:active { transform: scale(.90); }
  .vol-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .vol-slider-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    position: relative;
  }

  .vol-track {
    width: 100%;
    height: 44px;
    border-radius: var(--r-track);
    background: var(--track-bg);
    position: relative;
    cursor: pointer;
    touch-action: none;
    overflow: hidden;
  }
  .vol-fill {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    border-radius: var(--r-track) 0 0 var(--r-track);
    background: rgba(52,199,89, 0.26);
    pointer-events: none;
    transition: width 60ms ease;
  }
  :host(.dark) .vol-fill { background: rgba(48,209,88, 0.28); }

  .vol-thumb {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 26px;
    height: 26px;
    pointer-events: none;
    z-index: 2;
    transition: left 60ms ease;
  }
  .vol-thumb-disc {
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background: var(--thumb-bg);
    box-shadow: var(--thumb-sh);
    position: absolute;
    inset: 0;
    transition: box-shadow .15s ease, transform .15s ease;
  }
  .vol-thumb-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--green);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.08);
  }
  .vol-stroke {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 2px;
    transform: translateX(-1px);
    background: var(--green);
    border-radius: 999px;
    pointer-events: none;
    z-index: 1;
    opacity: 1;
  }
  .vol-stroke[data-zero="true"] { opacity: 0; }

  /* Dragging state */
  .vol-track.dragging .vol-thumb-disc {
    box-shadow: var(--thumb-sh-a);
    transform: scale(1.08);
  }
  .vol-track.dragging .vol-fill,
  .vol-track.dragging ~ .vol-thumb,
  .vol-track.dragging ~ .vol-stroke { transition: none; }

  .vol-pct {
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.2px;
    min-width: 42px;
    text-align: right;
    flex-shrink: 0;
  }

  .vol-close {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    cursor: pointer;
    color: var(--text-muted);
    transition: all .15s ease;
    border: none;
    background: transparent;
  }
  .vol-close:hover { background: var(--track-bg); }
  .vol-close:active { transform: scale(.90); }

  /* ═══════════════════════════════════════
     DROPDOWN MENU
     ═══════════════════════════════════════ */
  .dd-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 220px;
    padding: 5px;
    border-radius: var(--r-tile);
    background: var(--dd-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 10;
    display: none;
    flex-direction: column;
    gap: 1px;
  }
  .dd-menu.open {
    display: flex;
    animation: menuIn .14s ease forwards;
  }
  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .dd-option {
    padding: 9px 12px;
    border-radius: 11px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background .1s;
    user-select: none;
    border: none;
    background: transparent;
    font-family: inherit;
    text-align: left;
    width: 100%;
  }
  .dd-option:hover { background: var(--track-bg); }
  .dd-option:active { transform: scale(.97); }

  .dd-option.selected {
    font-weight: 700;
    color: var(--green);
    background: var(--green-fill);
  }
  .dd-option.selected .spk-icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .spk-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .spk-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .spk-now-playing {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 1px;
  }
  .dd-option.selected .spk-now-playing {
    color: var(--green);
    opacity: 0.7;
  }

  /* Group checkbox */
  .grp-check {
    width: 20px;
    height: 20px;
    border-radius: 999px;
    flex-shrink: 0;
    border: 1.5px solid var(--text-muted);
    display: grid;
    place-items: center;
    transition: all .15s ease;
    cursor: pointer;
    position: relative;
    z-index: 2;
  }
  .grp-check:hover { border-color: var(--green); }
  .grp-check.in-group {
    background: var(--green);
    border-color: var(--green);
  }
  .grp-check .icon {
    color: #fff;
    opacity: 0;
    transition: opacity .1s;
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 14;
  }
  .grp-check.in-group .icon { opacity: 1; }

  /* Action options */
  .dd-option.action { color: var(--text-sub); }
  .dd-option.action:hover { color: var(--text); }
  .dd-option.action .icon { color: var(--green); }

  .dd-divider {
    height: 1px;
    background: var(--divider);
    margin: 3px 8px;
  }

  /* ═══════════════════════════════════════
     REDUCED MOTION
     ═══════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* ═══════════════════════════════════════
     RESPONSIVE
     ═══════════════════════════════════════ */
  @media (max-width: 440px) {
    .card { padding: 16px; }
    .album-art { width: 48px; height: 48px; }
    .track-name { font-size: 14px; }
    .transport { gap: 2px; }
    .t-btn { width: 34px; height: 34px; }
    .t-btn.play { width: 38px; height: 38px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const MEDIA_TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Header -->
      <div class="media-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon icon-18" id="entityIcon">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Sonos</span>
            <span class="hdr-sub" id="hdrSub">Idle</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <div class="speaker-wrap" id="speakerWrap">
          <button class="speaker-btn" id="speakerBtn" aria-expanded="false" aria-label="Select speaker">
            <span class="icon icon-16">speaker</span>
            <span id="spkLabel">Speaker</span>
            <span class="icon icon-14 chevron">expand_more</span>
          </button>
          <div class="dd-menu" id="ddMenu"></div>
        </div>
      </div>

      <!-- Media body — swappable between track view and volume -->
      <div class="media-body" id="mediaBody">
        <!-- TRACK VIEW -->
        <div class="media-row" id="trackRow" data-view="track">
          <div class="album-art" id="albumArt">
            <span class="icon icon-24">music_note</span>
          </div>
          <div class="track-info">
            <span class="track-name" id="trackName">Nothing playing</span>
            <span class="track-artist" id="trackArtist">Select a source to play</span>
            <div class="progress-wrap" id="progressWrap">
              <span class="progress-time" id="progElapsed">0:00</span>
              <div class="progress-track"><div class="progress-fill" id="progFill"></div></div>
              <span class="progress-time right" id="progDuration">0:00</span>
            </div>
          </div>
          <div class="transport">
            <button class="t-btn" id="btnPrev" title="Previous" aria-label="Previous track"><span class="icon icon-20">skip_previous</span></button>
            <button class="t-btn play" id="btnPlay" title="Play" aria-label="Play"><span class="icon icon-20" id="playIcon">play_arrow</span></button>
            <button class="t-btn" id="btnNext" title="Next" aria-label="Next track"><span class="icon icon-20">skip_next</span></button>
            <button class="vol-btn" id="btnVol" title="Volume" aria-label="Volume"><span class="icon icon-18">volume_up</span></button>
          </div>
        </div>

        <!-- VOLUME VIEW -->
        <div class="vol-row hidden" id="volRow" data-view="volume">
          <button class="vol-icon" id="btnMute" title="Mute" aria-label="Toggle mute">
            <span class="icon icon-20" id="muteIcon">volume_up</span>
          </button>
          <div class="vol-slider-wrap">
            <div class="vol-track" id="volTrack">
              <div class="vol-fill" id="volFill"></div>
            </div>
            <div class="vol-stroke" id="volStroke"></div>
            <div class="vol-thumb" id="volThumb">
              <div class="vol-thumb-disc"></div>
              <div class="vol-thumb-dot"></div>
            </div>
          </div>
          <span class="vol-pct" id="volPct">0%</span>
          <button class="vol-close" id="btnVolClose" title="Back to track" aria-label="Close volume">
            <span class="icon icon-18">close</span>
          </button>
        </div>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   DEFAULT SPEAKERS
   =============================================================== */

const DEFAULT_SPEAKERS = [
  { entity_id: 'media_player.living_room', name: 'Living Room', group_sensor: 'binary_sensor.sonos_living_room_in_playing_group' },
  { entity_id: 'media_player.kitchen', name: 'Kitchen', group_sensor: 'binary_sensor.sonos_kitchen_in_playing_group' },
  { entity_id: 'media_player.bedroom', name: 'Bedroom', group_sensor: 'binary_sensor.sonos_bedroom_in_playing_group' },
  { entity_id: 'media_player.dining_room', name: 'Dining Room', group_sensor: 'binary_sensor.sonos_dining_room_in_playing_group' },
  { entity_id: 'media_player.bath', name: 'Bathroom', group_sensor: 'binary_sensor.sonos_bath_in_playing_group' },
];

/* ===============================================================
   Card Class
   =============================================================== */

class TunetMediaCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._volumeDragging = false;
    this._volumeView = false;
    this._prevVolume = 50;
    this._progressTimer = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;

    // Inject fonts globally
    TunetMediaCard._injectFonts();

    // Bound handlers
    this._onDocClick = this._onDocClick.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  static _injectFonts() {
    if (TunetMediaCard._fontsInjected) return;
    TunetMediaCard._fontsInjected = true;
    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200' },
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

  /* -- Config -- */

  static getConfigForm() {
    return {
      schema: [
        {
          name: 'name',
          selector: { text: {} },
        },
        {
          name: 'coordinator_entity',
          selector: { entity: { domain: 'sensor' } },
        },
        {
          name: 'playing_status_entity',
          selector: { entity: { domain: 'binary_sensor' } },
        },
        {
          name: 'toggle_group_script',
          selector: { entity: { domain: 'script' } },
        },
        {
          name: 'group_all_script',
          selector: { entity: { domain: 'script' } },
        },
        {
          name: 'ungroup_all_script',
          selector: { entity: { domain: 'script' } },
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          name: 'Card Name',
          coordinator_entity: 'Coordinator Sensor',
          playing_status_entity: 'Playing Status Sensor',
          toggle_group_script: 'Toggle Group Script',
          group_all_script: 'Group All Script',
          ungroup_all_script: 'Ungroup All Script',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      name: 'Sonos',
      coordinator_entity: 'sensor.sonos_current_playing_group_coordinator',
      playing_status_entity: 'binary_sensor.sonos_playing_status',
      speakers: DEFAULT_SPEAKERS.map(s => ({
        entity_id: s.entity_id,
        name: s.name,
        group_sensor: s.group_sensor,
      })),
    };
  }

  setConfig(config) {
    this._config = {
      name: config.name || 'Sonos',
      coordinator_entity: config.coordinator_entity || 'sensor.sonos_current_playing_group_coordinator',
      playing_status_entity: config.playing_status_entity || 'binary_sensor.sonos_playing_status',
      toggle_group_script: config.toggle_group_script || 'script.sonos_toggle_group_membership',
      group_all_script: config.group_all_script || 'script.sonos_group_all_to_playing',
      ungroup_all_script: config.ungroup_all_script || 'script.sonos_ungroup_all',
      speakers: config.speakers || DEFAULT_SPEAKERS.map(s => ({ ...s })),
    };

    // Set initial selected speaker to first in list
    if (!this._selectedSpeaker && this._config.speakers.length > 0) {
      this._selectedSpeaker = this._config.speakers[0].entity_id;
    }

    if (this._rendered) this._updateAll();
  }

  /* -- HA State -- */

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;

    if (!this._rendered) {
      this._render();
      this._setupListeners();
      this._rendered = true;
    }

    // Dark mode detection
    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');

    // Auto-select the coordinator as the selected speaker when playing
    if (!this._userSelectedSpeaker) {
      const coord = this._getCoordinator();
      if (coord && coord !== 'none') {
        this._selectedSpeaker = coord;
      }
    }

    // Check if any relevant entity changed
    if (!oldHass || this._hasRelevantChange(oldHass, hass)) {
      if (!this._volumeDragging && !this._serviceCooldown) {
        this._updateAll();
      }
    }
  }

  _hasRelevantChange(oldHass, newHass) {
    // Check coordinator
    const coord = this._config.coordinator_entity;
    if (coord && oldHass.states[coord] !== newHass.states[coord]) return true;

    // Check all speaker entities
    for (const spk of this._config.speakers) {
      if (oldHass.states[spk.entity_id] !== newHass.states[spk.entity_id]) return true;
      if (spk.group_sensor && oldHass.states[spk.group_sensor] !== newHass.states[spk.group_sensor]) return true;
    }

    return false;
  }

  getCardSize() {
    return 3;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    document.addEventListener('click', this._onDocClick);
    document.addEventListener('pointermove', this._onPointerMove);
    document.addEventListener('pointerup', this._onPointerUp);
    document.addEventListener('pointercancel', this._onPointerUp);
    this._startProgressTimer();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this._onDocClick);
    document.removeEventListener('pointermove', this._onPointerMove);
    document.removeEventListener('pointerup', this._onPointerUp);
    document.removeEventListener('pointercancel', this._onPointerUp);
    this._stopProgressTimer();
  }

  /* -- Render -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = MEDIA_STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = MEDIA_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'infoTile', 'entityIcon', 'cardTitle', 'hdrSub',
      'speakerWrap', 'speakerBtn', 'spkLabel', 'ddMenu',
      'mediaBody', 'trackRow', 'albumArt', 'trackName', 'trackArtist',
      'progressWrap', 'progElapsed', 'progFill', 'progDuration',
      'btnPrev', 'btnPlay', 'playIcon', 'btnNext', 'btnVol',
      'volRow', 'btnMute', 'muteIcon', 'volTrack', 'volFill',
      'volStroke', 'volThumb', 'volPct', 'btnVolClose',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  /* -- Setup Listeners -- */

  _setupListeners() {
    const $ = this.$;

    // Info tile — open more_info for the coordinator
    $.infoTile.addEventListener('click', (e) => {
      e.stopPropagation();
      const coord = this._getCoordinator();
      const entityId = (coord && coord !== 'none') ? coord : this._selectedSpeaker;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId },
      }));
    });

    // Speaker dropdown toggle
    $.speakerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleMenu();
    });

    // Transport controls
    $.btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callMediaService('media_previous_track');
    });
    $.btnPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      this._togglePlayPause();
    });
    $.btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      this._callMediaService('media_next_track');
    });

    // Volume button — show volume row
    $.btnVol.addEventListener('click', (e) => {
      e.stopPropagation();
      this._showVolumeView();
    });

    // Volume close
    $.btnVolClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this._hideVolumeView();
    });

    // Mute toggle
    $.btnMute.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleMute();
    });

    // Volume slider drag
    $.volTrack.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._startVolumeDrag(e);
    });
  }

  /* -- Entity Helpers -- */

  _getCoordinator() {
    if (!this._hass || !this._config.coordinator_entity) return null;
    const entity = this._hass.states[this._config.coordinator_entity];
    return entity ? entity.state : null;
  }

  _getSpeakerState(entityId) {
    if (!this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _getSelectedSpeakerState() {
    return this._getSpeakerState(this._selectedSpeaker);
  }

  _isInGroup(groupSensor) {
    if (!this._hass || !groupSensor) return false;
    const entity = this._hass.states[groupSensor];
    return entity && entity.state === 'on';
  }

  _getPlaybackState() {
    // Determine overall playback state from the selected speaker
    const spk = this._getSelectedSpeakerState();
    if (!spk) return 'idle';
    if (spk.state === 'playing') return 'playing';
    if (spk.state === 'paused') return 'paused';
    return 'idle';
  }

  _getGroupCount() {
    let count = 0;
    for (const spk of this._config.speakers) {
      if (this._isInGroup(spk.group_sensor)) count++;
    }
    return count;
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card) return;

    const state = this._getPlaybackState();
    const spk = this._getSelectedSpeakerState();
    const attrs = spk ? spk.attributes : {};

    // Card state
    $.card.dataset.state = state;

    // Card title
    $.cardTitle.textContent = this._config.name || 'Sonos';

    // Header subtitle
    this._updateSubtitle(state);

    // Speaker label
    const selectedConfig = this._config.speakers.find(s => s.entity_id === this._selectedSpeaker);
    $.spkLabel.textContent = selectedConfig ? selectedConfig.name : 'Speaker';

    // Album art
    this._updateAlbumArt(attrs);

    // Track info
    if (state === 'idle') {
      $.trackName.textContent = 'Nothing playing';
      $.trackName.style.color = 'var(--text-muted)';
      $.trackArtist.textContent = 'Select a source to play';
      $.progressWrap.style.display = 'none';
    } else {
      $.trackName.textContent = attrs.media_title || 'Unknown';
      $.trackName.style.color = '';
      $.trackArtist.textContent = attrs.media_artist || '';
      $.progressWrap.style.display = '';
      this._updateProgress(spk);
    }

    // Play button icon
    $.playIcon.textContent = state === 'playing' ? 'pause' : 'play_arrow';
    $.btnPlay.title = state === 'playing' ? 'Pause' : 'Play';

    // Volume view update (if visible)
    if (this._volumeView && !this._volumeDragging) {
      this._updateVolumeUI(attrs.volume_level || 0);
    }

    // Rebuild dropdown
    this._buildDropdown();
  }

  _updateSubtitle(state) {
    const $ = this.$;
    const groupCount = this._getGroupCount();
    const selectedConfig = this._config.speakers.find(s => s.entity_id === this._selectedSpeaker);
    const speakerName = selectedConfig ? selectedConfig.name : '';

    let sub = '';
    if (state === 'playing') {
      sub = '<span class="green-ic">Playing</span>';
      if (groupCount > 1) sub += ' \u00b7 ' + groupCount + ' grouped';
      else sub += ' \u00b7 ' + speakerName;
    } else if (state === 'paused') {
      sub = 'Paused';
      if (groupCount > 1) sub += ' \u00b7 ' + groupCount + ' grouped';
      else sub += ' \u00b7 ' + speakerName;
    } else {
      sub = 'Idle';
    }

    $.hdrSub.innerHTML = sub;
  }

  _updateAlbumArt(attrs) {
    const $ = this.$;
    const img = $.albumArt.querySelector('img');
    const url = attrs.entity_picture || '';

    if (url) {
      if (img) {
        img.src = url;
      } else {
        const newImg = document.createElement('img');
        newImg.src = url;
        newImg.alt = '';
        newImg.onerror = function() { this.remove(); };
        $.albumArt.appendChild(newImg);
      }
    } else {
      if (img) img.remove();
    }
  }

  _updateProgress(spk) {
    const $ = this.$;
    if (!spk) return;
    const attrs = spk.attributes;

    const duration = attrs.media_duration || 0;
    const position = attrs.media_position || 0;
    const updatedAt = attrs.media_position_updated_at;

    if (duration <= 0) {
      $.progressWrap.style.display = 'none';
      return;
    }

    // Calculate elapsed considering time since last update
    let elapsed = position;
    if (updatedAt && spk.state === 'playing') {
      const diff = (Date.now() - new Date(updatedAt).getTime()) / 1000;
      elapsed = Math.min(position + diff, duration);
    }

    $.progElapsed.textContent = this._formatTime(elapsed);
    $.progDuration.textContent = this._formatTime(duration);
    $.progFill.style.width = (elapsed / duration * 100) + '%';
  }

  _formatTime(seconds) {
    const s = Math.floor(seconds);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ':' + (sec < 10 ? '0' : '') + sec;
  }

  /* -- Progress Timer -- */

  _startProgressTimer() {
    this._stopProgressTimer();
    this._progressTimer = setInterval(() => {
      if (this._getPlaybackState() === 'playing') {
        const spk = this._getSelectedSpeakerState();
        if (spk) this._updateProgress(spk);
      }
    }, 1000);
  }

  _stopProgressTimer() {
    if (this._progressTimer) {
      clearInterval(this._progressTimer);
      this._progressTimer = null;
    }
  }

  /* -- Volume UI -- */

  _showVolumeView() {
    const $ = this.$;
    $.trackRow.classList.add('hidden');
    $.volRow.classList.remove('hidden');
    this._volumeView = true;

    const spk = this._getSelectedSpeakerState();
    const vol = spk ? (spk.attributes.volume_level || 0) : 0;
    this._updateVolumeUI(vol);
  }

  _hideVolumeView() {
    const $ = this.$;
    $.volRow.classList.add('hidden');
    $.trackRow.classList.remove('hidden');
    this._volumeView = false;
  }

  _updateVolumeUI(volumeLevel) {
    const $ = this.$;
    const pct = Math.round(volumeLevel * 100);
    $.volFill.style.width = pct + '%';
    $.volThumb.style.left = pct + '%';
    $.volStroke.style.left = pct + '%';
    $.volStroke.dataset.zero = pct === 0 ? 'true' : 'false';
    $.volPct.textContent = pct + '%';

    if (pct === 0) $.muteIcon.textContent = 'volume_off';
    else if (pct < 40) $.muteIcon.textContent = 'volume_down';
    else $.muteIcon.textContent = 'volume_up';
  }

  _startVolumeDrag(e) {
    this._volumeDragging = true;
    this.$.volTrack.classList.add('dragging');
    this.$.volTrack.setPointerCapture(e.pointerId);
    this._setVolumeFromPointer(e);
  }

  _onPointerMove(e) {
    if (!this._volumeDragging) return;
    this._setVolumeFromPointer(e);
  }

  _onPointerUp(e) {
    if (!this._volumeDragging) return;
    this._volumeDragging = false;
    this.$.volTrack.classList.remove('dragging');

    // Send final volume to HA
    const pct = parseInt(this.$.volPct.textContent);
    this._setVolume(pct / 100);
  }

  _setVolumeFromPointer(e) {
    const rect = this.$.volTrack.getBoundingClientRect();
    const x = (e.clientX || 0) - rect.left;
    const pct = Math.max(0, Math.min(100, Math.round(x / rect.width * 100)));
    this._updateVolumeUI(pct / 100);
  }

  /* -- Dropdown -- */

  _toggleMenu() {
    const menu = this.$.ddMenu;
    const btn = this.$.speakerBtn;
    const isOpen = menu.classList.contains('open');

    if (isOpen) {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      this._buildDropdown();
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  }

  _closeMenu() {
    this.$.ddMenu.classList.remove('open');
    this.$.speakerBtn.setAttribute('aria-expanded', 'false');
  }

  _buildDropdown() {
    const menu = this.$.ddMenu;
    menu.innerHTML = '';

    // Speaker options
    for (const spk of this._config.speakers) {
      const entity = this._getSpeakerState(spk.entity_id);
      const isSelected = spk.entity_id === this._selectedSpeaker;
      const inGroup = this._isInGroup(spk.group_sensor);

      // Build now-playing text
      let nowPlaying = 'Not playing';
      if (entity) {
        if (entity.state === 'playing') {
          const title = entity.attributes.media_title || '';
          const artist = entity.attributes.media_artist || '';
          nowPlaying = title && artist ? title + ' \u2013 ' + artist : title || 'Playing';
        } else if (entity.state === 'paused') {
          nowPlaying = 'Paused';
        }
      }

      const opt = document.createElement('button');
      opt.className = 'dd-option' + (isSelected ? ' selected' : '');
      opt.innerHTML = `
        <span class="icon icon-18 spk-icon">speaker</span>
        <span class="spk-text">
          <span class="spk-name">${this._escHtml(spk.name)}</span>
          <span class="spk-now-playing">${this._escHtml(nowPlaying)}</span>
        </span>
        <div class="grp-check ${inGroup ? 'in-group' : ''}">
          <span class="icon icon-14">check</span>
        </div>
      `;

      // Click on option row = select speaker
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._selectSpeaker(spk.entity_id);
      });

      // Click on group checkbox = toggle group
      const checkbox = opt.querySelector('.grp-check');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        this._toggleGroup(spk.entity_id);
      });

      menu.appendChild(opt);
    }

    // Divider
    const divider = document.createElement('div');
    divider.className = 'dd-divider';
    menu.appendChild(divider);

    // Group All
    const groupAllBtn = document.createElement('button');
    groupAllBtn.className = 'dd-option action';
    groupAllBtn.innerHTML = '<span class="icon icon-18">link</span> Group All';
    groupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._groupAll();
    });
    menu.appendChild(groupAllBtn);

    // Ungroup All
    const ungroupAllBtn = document.createElement('button');
    ungroupAllBtn.className = 'dd-option action';
    ungroupAllBtn.innerHTML = '<span class="icon icon-18">link_off</span> Ungroup All';
    ungroupAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._ungroupAll();
    });
    menu.appendChild(ungroupAllBtn);
  }

  _selectSpeaker(entityId) {
    this._selectedSpeaker = entityId;
    this._userSelectedSpeaker = true;
    this._closeMenu();
    this._updateAll();
  }

  /* -- Service Calls -- */

  _callMediaService(service) {
    if (!this._hass || !this._selectedSpeaker) return;
    this._hass.callService('media_player', service, {
      entity_id: this._selectedSpeaker,
    });
  }

  _togglePlayPause() {
    const state = this._getPlaybackState();
    if (state === 'playing') {
      this._callMediaService('media_pause');
      // Optimistic UI
      this.$.playIcon.textContent = 'play_arrow';
    } else {
      this._callMediaService('media_play');
      // Optimistic UI
      this.$.playIcon.textContent = 'pause';
    }
    this._startServiceCooldown();
  }

  _setVolume(level) {
    if (!this._hass || !this._selectedSpeaker) return;
    this._hass.callService('media_player', 'volume_set', {
      entity_id: this._selectedSpeaker,
      volume_level: Math.max(0, Math.min(1, level)),
    });
    this._startServiceCooldown();
  }

  _toggleMute() {
    const spk = this._getSelectedSpeakerState();
    if (!spk) return;

    const currentVol = Math.round((spk.attributes.volume_level || 0) * 100);
    if (currentVol > 0) {
      this._prevVolume = currentVol;
      this._setVolume(0);
      this._updateVolumeUI(0);
    } else {
      const restoreVol = this._prevVolume || 50;
      this._setVolume(restoreVol / 100);
      this._updateVolumeUI(restoreVol / 100);
    }
  }

  _toggleGroup(speakerEntityId) {
    if (!this._hass) return;
    const scriptEntity = this._config.toggle_group_script;
    // Extract script name from entity_id (e.g., script.sonos_toggle_group_membership -> sonos_toggle_group_membership)
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {
      target_speaker: speakerEntityId,
    });
    this._startServiceCooldown();
  }

  _groupAll() {
    if (!this._hass) return;
    const scriptEntity = this._config.group_all_script;
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {});
    this._closeMenu();
    this._startServiceCooldown();
  }

  _ungroupAll() {
    if (!this._hass) return;
    const scriptEntity = this._config.ungroup_all_script;
    const scriptName = scriptEntity.replace('script.', '');
    this._hass.callService('script', scriptName, {});
    this._closeMenu();
    this._startServiceCooldown();
  }

  _startServiceCooldown() {
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => {
      this._serviceCooldown = false;
      this._updateAll();
    }, 1500);
  }

  /* -- Menu close on outside click -- */

  _onDocClick(e) {
    if (!this.$.ddMenu || !this.$.ddMenu.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.$.speakerWrap)) {
      this._closeMenu();
    }
  }

  /* -- Utilities -- */

  _escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

/* ===============================================================
   Registration
   =============================================================== */

customElements.define('tunet-media-card', TunetMediaCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tunet-media-card',
  name: 'Tunet Media Card',
  description: 'Glassmorphism Sonos media controller with group management',
  preview: true,
});

console.info(
  `%c TUNET-MEDIA-CARD %c v${MEDIA_CARD_VERSION} `,
  'color: #fff; background: #34C759; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #34C759; background: #e8f5e9; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
