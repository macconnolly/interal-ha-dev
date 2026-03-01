/**
 * Tunet Climate Card
 * Custom Home Assistant card with glassmorphism design  by Mac
 * Version 2.0.1
 */

const CARD_VERSION = '2.0.1';

/* ===============================================================
   CSS - Complete token system + component styles
   =============================================================== */

const STYLES = `
  /* -- Tokens: Light -- */
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
    --track-bg: rgba(28,28,30,0.055);
    --track-h: 44px;
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    --r-card: 24px;
    --r-section: 38px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 14px;
    --parent-bg: rgba(255,255,255,0.35);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --ctrl-bg: rgba(255,255,255,0.52);
    --ctrl-border: rgba(0,0,0,0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --dd-bg: rgba(255,255,255,0.84);
    --dd-border: rgba(255,255,255,0.60);
    --divider: rgba(28,28,30,0.07);
    color-scheme: light;
    display: block;
  }

  /* -- Tokens: Dark -- */
  :host(.dark) {
    --glass: rgba(44,44,46,0.72);
    --glass-border: rgba(255,255,255,0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255,0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247,0.50);
    --text-muted: rgba(245,245,247,0.35);
    --amber: #E8961E;
    --amber-fill: rgba(232,150,30,0.14);
    --amber-border: rgba(232,150,30,0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255,0.13);
    --blue-border: rgba(10,132,255,0.22);
    --green: #30D158;
    --track-bg: rgba(255,255,255,0.06);
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
    --ctrl-bg: rgba(255,255,255,0.08);
    --ctrl-border: rgba(255,255,255,0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --parent-bg: rgba(255,255,255,0.05);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.25);
    --dd-bg: rgba(58,58,60,0.88);
    --dd-border: rgba(255,255,255,0.08);
    --divider: rgba(255,255,255,0.06);
    color-scheme: dark;
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
  .icon-20 { font-size: 20px; }
  .icon-18 { font-size: 18px; }
  .icon-16 { font-size: 16px; }
  .icon-14 { font-size: 14px; }

  /* -- Card Surface (section-container pattern) -- */
  .card {
    position: relative;
    width: 100%;
    border-radius: var(--r-section);
    background: var(--parent-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow-section), var(--inset);
    padding: 20px 20px 14px;
    display: flex;
    flex-direction: column;
    gap: 0;
    transition: background .3s, border-color .3s, box-shadow .3s, opacity .3s;
  }
  .card[data-mode="off"] { opacity: .55; }
  .card[data-action="heating"] { border-color: rgba(212,133,10,0.16); }
  .card[data-action="cooling"] { border-color: rgba(0,122,255,0.14); }
  :host(.dark) .card[data-action="heating"] { border-color: rgba(232,150,30,0.14); }
  :host(.dark) .card[data-action="cooling"] { border-color: rgba(10,132,255,0.12); }

  /* Glass stroke (section-container gradient) */
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-section);
    padding: 1px;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40),
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 0;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }

  /* -- Header -- */
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .hdr-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    cursor: pointer;
    transition: all .15s ease;
    min-width: 0;
  }
  .hdr-tile:hover { box-shadow: var(--shadow); }
  .hdr-tile:active { transform: scale(.98); }
  /* Info tile accent states - driven by hvac_action */
  .hdr-tile[data-action="heating"] {
    background: var(--amber-fill);
    border-color: var(--amber-border);
  }
  .hdr-tile[data-action="cooling"] {
    background: var(--blue-fill);
    border-color: var(--blue-border);
  }
  .hdr-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    border: 1px solid transparent;
    background: transparent;
    transition: all .2s ease;
    color: var(--text-muted);
  }
  .hdr-icon[data-a="heating"] {
    color: var(--amber);
  }
  .hdr-icon[data-a="cooling"] {
    color: var(--blue);
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
    letter-spacing: .1px;
    line-height: 1.15;
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: .1px;
    line-height: 1.15;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub .heat-ic { color: var(--amber); }
  .hdr-sub .cool-ic { color: var(--blue); }
  .hdr-sub .fan-ic { color: var(--green); }
  .hdr-spacer { flex: 1; }

  /* -- Fan Button -- */
  .fan-btn {
    width: 42px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
    cursor: pointer;
    transition: all .15s ease;
  }
  .fan-btn:hover { box-shadow: var(--shadow); }
  .fan-btn:active { transform: scale(.94); }
  .fan-btn.on {
    background: rgba(52,199,89,0.12);
    color: var(--green);
    border-color: rgba(52,199,89,0.15);
  }
  .fan-btn.on .icon { animation: fan-spin 1.8s linear infinite; }
  :host(.dark) .fan-btn.on {
    background: rgba(48,209,88,0.14);
    border-color: rgba(48,209,88,0.18);
  }
  /* Fan inherits action color when system is actively heating/cooling */
  .fan-btn.on[data-action="heating"] {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .fan-btn.on[data-action="cooling"] {
    background: var(--blue-fill);
    color: var(--blue);
    border-color: var(--blue-border);
  }
  @keyframes fan-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* -- Mode Button (matches icon button language) -- */
  .mode-wrap { position: relative; }
  .mode-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 42px;
    box-sizing: border-box;
    padding: 0 8px 0 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    cursor: pointer;
    transition: all .15s ease;
    letter-spacing: .2px;
  }
  .mode-btn:hover { box-shadow: var(--shadow); }
  .mode-btn:active { transform: scale(.97); }
  .mode-btn .mode-icon { font-size: 16px; width: 16px; height: 16px; }
  .mode-btn .chevron { transition: transform .2s ease; font-size: 14px; width: 14px; height: 14px; }
  .mode-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* Mode accent states - driven by hvac_action, not mode */
  .mode-btn[data-action="heating"] {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .mode-btn[data-action="cooling"] {
    background: var(--blue-fill);
    color: var(--blue);
    border-color: var(--blue-border);
  }
  .mode-btn[data-action="idle"],
  .mode-btn[data-action="off"] {
    color: var(--text-muted);
  }

  /* -- Dropdown Menu -- */
  .mode-menu {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 160px;
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
  .mode-menu.open {
    display: flex;
    animation: menuIn .14s ease forwards;
  }
  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  .mode-opt {
    padding: 9px 12px;
    border-radius: 11px;
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background .1s;
  }
  .mode-opt:hover { background: var(--track-bg); }
  .mode-opt:active { transform: scale(.97); }
  .mode-opt.active { font-weight: 700; }
  .mode-opt.active[data-m="heat_cool"],
  .mode-opt.active[data-m="heat"] { background: var(--amber-fill); color: var(--amber); }
  .mode-opt.active[data-m="cool"] { background: var(--blue-fill); color: var(--blue); }
  .mode-opt.active[data-m="off"] { background: var(--track-bg); color: var(--text-muted); }
  .mode-divider { height: 1px; background: var(--divider); margin: 3px 8px; }
  .mode-opt.eco-opt .eco-check {
    margin-left: auto;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    border: 1.5px solid var(--text-muted);
    display: grid;
    place-items: center;
    transition: all .15s;
  }
  .mode-opt.eco-opt.active .eco-check {
    background: var(--green);
    border-color: var(--green);
  }

  /* -- Temperature Zone -- */
  .temps {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .t-group { display: flex; flex-direction: column; gap: 1px; }
  .t-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: .3px;
  }
  .t-label.indoor { color: var(--text-sub); }
  .t-label.heat { color: var(--amber); }
  .t-label.cool { color: var(--blue); }
  .t-val {
    font-size: 48px;
    font-weight: 700;
    letter-spacing: -1.5px;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  .deg {
    font-size: 0.6em;
    vertical-align: baseline;
    position: relative;
    top: -0.18em;
    margin-left: -1px;
  }
  .t-val.heat { color: var(--amber); }
  .t-val.cool { color: var(--blue); }
  .t-right { display: flex; gap: 16px; }
  .t-right .t-group { align-items: flex-end; }

  /* -- Slider -- */
  .slider-zone { display: flex; flex-direction: column; margin-bottom: 0; }
  .slider {
    position: relative;
    height: var(--track-h);
    user-select: none;
    touch-action: none;
  }
  .track {
    position: absolute;
    inset: 0;
    border-radius: var(--r-track);
    background: var(--track-bg);
    overflow: hidden;
  }

  /* Fills */
  .fill-h {
    position: absolute; top: 0; bottom: 0; left: 0;
    border-radius: var(--r-track) 0 0 var(--r-track);
    background: rgba(212,133,10,0.28);
    transition: width 60ms ease;
  }
  :host(.dark) .fill-h {
    background: rgba(232,150,30,0.26);
  }
  .fill-c {
    position: absolute; top: 0; bottom: 0; right: 0;
    border-radius: 0 var(--r-track) var(--r-track) 0;
    background: rgba(0,122,255,0.26);
    transition: width 60ms ease;
  }
  :host(.dark) .fill-c {
    background: rgba(10,132,255,0.26);
  }

  /* Deadband */
  .deadband {
    position: absolute; top: 0; bottom: 0;
    background: repeating-linear-gradient(90deg,
      transparent, transparent 3px,
      rgba(28,28,30,0.025) 3px, rgba(28,28,30,0.025) 4px);
    transition: left 60ms, width 60ms;
  }
  :host(.dark) .deadband {
    background: repeating-linear-gradient(90deg,
      transparent, transparent 3px,
      rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px);
  }

  /* Thumbs */
  .thumb {
    position: absolute; top: 50%;
    width: 44px; height: 44px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: transparent;
    cursor: grab;
    z-index: 3;
    transition: transform .15s;
    display: flex; align-items: center; justify-content: center;
  }
  .thumb:active { cursor: grabbing; transform: translate(-50%,-50%) scale(1.08); }
  .thumb.dragging { cursor: grabbing; transform: translate(-50%,-50%) scale(1.08); }
  .thumb:focus-visible { outline: 2px solid var(--blue); outline-offset: 3px; }

  .thumb-stroke {
    position: absolute; width: 2px;
    top: 2px; bottom: 2px; left: 50%;
    transform: translateX(-50%);
    border-radius: 2px; z-index: 1;
  }
  .thumb.heat .thumb-stroke { background: var(--amber); }
  .thumb.cool .thumb-stroke { background: var(--blue); }

  .thumb-disc {
    width: 26px; height: 26px;
    border-radius: 999px;
    background: var(--thumb-bg);
    box-shadow: var(--thumb-sh);
    z-index: 2; position: relative;
    transition: box-shadow .15s;
  }
  .thumb:hover .thumb-disc { box-shadow: var(--thumb-sh-a); }
  .thumb:active .thumb-disc,
  .thumb.dragging .thumb-disc { box-shadow: var(--thumb-sh-a); }

  .thumb-dot {
    width: 8px; height: 8px;
    border-radius: 999px;
    position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    z-index: 3;
  }
  .thumb.heat .thumb-dot { background: var(--amber); box-shadow: 0 0 0 .5px rgba(212,133,10,0.3); }
  .thumb.cool .thumb-dot { background: var(--blue); box-shadow: 0 0 0 .5px rgba(0,122,255,0.3); }

  /* Current temp marker */
  .cur-marker {
    position: absolute; bottom: -14px;
    transform: translateX(-50%);
    display: flex; flex-direction: column; align-items: center;
    z-index: 2; transition: left .25s ease;
  }
  .cur-arrow {
    width: 0; height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-bottom: 5px solid var(--text-muted);
  }
  .cur-label {
    font-size: 11px; font-weight: 700;
    color: var(--text-sub);
    margin-top: 1px;
    font-variant-numeric: tabular-nums;
    letter-spacing: -.2px;
    white-space: nowrap;
  }

  /* Scale */
  .scale { display: flex; justify-content: space-between; padding: 4px 2px 0; }
  .scale-mark {
    display: flex; flex-direction: column; align-items: center;
    gap: 1px; transition: opacity .2s ease;
  }
  .scale-tick {
    width: 1px; height: 5px;
    background: var(--text-muted);
    opacity: .35; border-radius: 1px;
  }
  .scale-num {
    font-size: 11px; font-weight: 600;
    color: var(--text-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: .3px;
  }

  /* -- Mode Visibility Overrides -- */
  .card[data-mode="heat"] .fill-c,
  .card[data-mode="heat"] .thumb.cool,
  .card[data-mode="heat"] .t-group.cool { display: none; }

  .card[data-mode="cool"] .fill-h,
  .card[data-mode="cool"] .thumb.heat,
  .card[data-mode="cool"] .t-group.heat { display: none; }

  .card[data-mode="off"] .fill-h,
  .card[data-mode="off"] .fill-c,
  .card[data-mode="off"] .thumb,
  .card[data-mode="off"] .t-right,
  .card[data-mode="off"] .cur-marker { display: none; }
  .card[data-mode="off"] .track { opacity: .35; }

  /* Single-mode fill radius override */
  .card[data-mode="heat"] .fill-h {
    border-radius: var(--r-track);
  }
  .card[data-mode="cool"] .fill-c {
    border-radius: var(--r-track);
  }

  /* -- Accessibility -- */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: 16px 16px 12px; --r-track: 12px; }
    .t-val { font-size: 42px; letter-spacing: -1.3px; }
  }
`;

/* ===============================================================
   HTML Template
   =============================================================== */

const TEMPLATE = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200" rel="stylesheet">

  <div class="card-wrap">
    <div class="card" id="card" data-mode="heat_cool" data-action="idle">

      <!-- Header -->
      <div class="hdr">
        <div class="hdr-tile" id="hdrTile" data-action="idle">
          <div class="hdr-icon" id="hdrIcon" data-a="idle">
            <span class="icon icon-18" id="hdrIconEl">thermostat</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Climate</span>
            <span class="hdr-sub" id="hdrSub"></span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <button class="fan-btn" id="fanBtn" title="Fan" aria-label="Toggle fan" data-action="idle">
          <span class="icon icon-18" id="fanIconEl">mode_fan</span>
        </button>
        <div class="mode-wrap">
          <button class="mode-btn" id="modeBtn" aria-expanded="false" data-action="idle">
            <span class="icon mode-icon" id="modeIcon">device_thermostat</span>
            <span id="modeLbl">Heat / Cool</span>
            <span class="icon chevron">expand_more</span>
          </button>
          <div class="mode-menu" id="modeMenu">
            <button class="mode-opt active" data-m="heat_cool">
              <span class="icon icon-18" style="color:var(--amber)">device_thermostat</span> Heat / Cool
            </button>
            <button class="mode-opt" data-m="heat">
              <span class="icon icon-18" style="color:var(--amber)">local_fire_department</span> Heat
            </button>
            <button class="mode-opt" data-m="cool">
              <span class="icon icon-18" style="color:var(--blue)">ac_unit</span> Cool
            </button>
            <button class="mode-opt" data-m="off">
              <span class="icon icon-18">power_settings_new</span> Off
            </button>
            <div class="mode-divider"></div>
            <button class="mode-opt eco-opt" id="ecoOpt" data-m="eco">
              <span class="icon icon-18" style="color:var(--green)">eco</span> Eco
              <span class="eco-check" id="ecoCheck">
                <span class="icon icon-14" style="color:#fff">check</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Temperatures -->
      <div class="temps">
        <div class="t-group indoor">
          <span class="t-label indoor">Indoor</span>
          <span class="t-val" id="curTemp">--<span class="deg">&deg;</span></span>
        </div>
        <div class="t-right" id="tRight">
          <div class="t-group heat">
            <span class="t-label heat">Heat</span>
            <span class="t-val heat" id="heatR">--<span class="deg">&deg;</span></span>
          </div>
          <div class="t-group cool">
            <span class="t-label cool">Cool</span>
            <span class="t-val cool" id="coolR">--<span class="deg">&deg;</span></span>
          </div>
        </div>
      </div>

      <!-- Slider -->
      <div class="slider-zone">
        <div class="slider" id="slider">
          <div class="track">
            <div class="fill-h" id="fillH"></div>
            <div class="fill-c" id="fillC"></div>
            <div class="deadband" id="db"></div>
          </div>
          <div class="thumb heat" id="tH" role="slider" aria-label="Heat setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="68" aria-valuetext="Heat setpoint: 68 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="thumb cool" id="tC" role="slider" aria-label="Cool setpoint" aria-valuemin="50" aria-valuemax="90" aria-valuenow="76" aria-valuetext="Cool setpoint: 76 degrees" tabindex="0">
            <div class="thumb-stroke"></div>
            <div class="thumb-disc"></div>
            <div class="thumb-dot"></div>
          </div>
          <div class="cur-marker" id="curMark">
            <div class="cur-arrow"></div>
            <div class="cur-label" id="curLbl">--&deg;</div>
          </div>
        </div>
        <div class="scale">
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMin">60&deg;</span></div>
          <div class="scale-mark" id="sMidMark"><div class="scale-tick"></div><span class="scale-num" id="sMid">70&deg;</span></div>
          <div class="scale-mark"><div class="scale-tick"></div><span class="scale-num" id="sMax">80&deg;</span></div>
        </div>
      </div>

    </div>
  </div>
`;

/* ===============================================================
   Card Class
   =============================================================== */

class TunetClimateCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._drag = null;
    this._dragStartX = 0;
    this._dragActive = false;
    this._debounceTimer = null;
    this._rendered = false;

    // Inject fonts into document.head (once globally)
    // Shadow DOM <link> tags don't reliably load fonts in all browsers
    TunetClimateCard._injectFonts();

    // Bound handlers for document-level listeners
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onEndDrag.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onEndDrag.bind(this);
    this._onDocClick = this._onDocClick.bind(this);
  }

  static _injectFonts() {
    if (TunetClimateCard._fontsInjected) return;
    TunetClimateCard._fontsInjected = true;

    const links = [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..200' },
    ];

    for (const cfg of links) {
      // Skip if already present
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
          name: 'entity',
          required: true,
          selector: { entity: { domain: 'climate' } },
        },
        {
          name: 'humidity_entity',
          selector: { entity: { domain: 'sensor', device_class: 'humidity' } },
        },
        {
          name: 'name',
          selector: { text: {} },
        },
        {
          name: '',
          type: 'grid',
          schema: [
            {
              name: 'display_min',
              selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } },
            },
            {
              name: 'display_max',
              selector: { number: { min: 0, max: 120, step: 1, mode: 'box' } },
            },
          ],
        },
      ],
      computeLabel: (schema) => {
        const labels = {
          entity: 'Climate Entity',
          humidity_entity: 'Humidity Sensor',
          name: 'Card Name',
          display_min: 'Scale Min',
          display_max: 'Scale Max',
        };
        return labels[schema.name] || schema.name;
      },
    };
  }

  static getStubConfig() {
    return {
      entity: '',
      name: 'Climate',
    };
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity (climate.*)');
    }
    this._config = {
      entity: config.entity,
      humidity_entity: config.humidity_entity || '',
      name: config.name || 'Climate',
      display_min: config.display_min != null ? Number(config.display_min) : null,
      display_max: config.display_max != null ? Number(config.display_max) : null,
    };
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

    // Detect dark mode
    const isDark = !!(hass.themes && hass.themes.darkMode);
    if (isDark) this.classList.add('dark');
    else this.classList.remove('dark');

    // Only update if relevant entity changed
    const entity = this._config.entity;
    const humEntity = this._config.humidity_entity;
    if (!oldHass ||
        (entity && oldHass.states[entity] !== hass.states[entity]) ||
        (humEntity && oldHass.states[humEntity] !== hass.states[humEntity])) {
      this._updateAll();
    }
  }

  getCardSize() {
    return 4;
  }

  /* -- Lifecycle -- */

  connectedCallback() {
    document.addEventListener('mousemove', this._onMouseMove);
    document.addEventListener('mouseup', this._onMouseUp);
    document.addEventListener('touchmove', this._onTouchMove, { passive: false });
    document.addEventListener('touchend', this._onTouchEnd);
    document.addEventListener('click', this._onDocClick);
  }

  disconnectedCallback() {
    document.removeEventListener('mousemove', this._onMouseMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    document.removeEventListener('touchmove', this._onTouchMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    document.removeEventListener('click', this._onDocClick);
  }

  /* -- Render -- */

  _render() {
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(style);

    const tpl = document.createElement('template');
    tpl.innerHTML = TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));

    // Cache DOM refs
    this.$ = {};
    const ids = [
      'card', 'hdrTile', 'hdrIcon', 'hdrIconEl', 'cardTitle', 'hdrSub', 'fanBtn', 'fanIconEl',
      'modeBtn', 'modeLbl', 'modeIcon', 'modeMenu', 'ecoOpt', 'ecoCheck',
      'curTemp', 'heatR', 'coolR', 'tRight',
      'slider', 'fillH', 'fillC', 'db', 'tH', 'tC', 'curMark', 'curLbl',
      'sMin', 'sMid', 'sMidMark', 'sMax',
    ];
    ids.forEach(id => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }

  /* -- Setup Listeners -- */

  _setupListeners() {
    const $ = this.$;

    // Header tile - open more_info
    $.hdrTile.addEventListener('click', (e) => {
      e.stopPropagation();
      const ev = new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this._config.entity } });
      this.dispatchEvent(ev);
    });

    // Fan toggle
    $.fanBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleFan();
    });

    // Mode menu toggle
    $.modeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleMenu();
    });

    // Mode options
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._setMode(opt.dataset.m);
      });
    });

    // Eco toggle
    $.ecoOpt.addEventListener('click', (e) => {
      e.stopPropagation();
      this._toggleEco();
    });

    // Thumb drag - mouse
    $.tH.addEventListener('mousedown', (e) => this._startDrag('heat', e));
    $.tC.addEventListener('mousedown', (e) => this._startDrag('cool', e));

    // Thumb drag - touch
    $.tH.addEventListener('touchstart', (e) => this._startDrag('heat', e), { passive: false });
    $.tC.addEventListener('touchstart', (e) => this._startDrag('cool', e), { passive: false });

    // Keyboard on thumbs
    $.tH.addEventListener('keydown', (e) => this._thumbKey('heat', e));
    $.tC.addEventListener('keydown', (e) => this._thumbKey('cool', e));

    // Resize observer for slider recalculation
    this._resizeObserver = new ResizeObserver(() => this._renderSlider());
    this._resizeObserver.observe($.slider);
  }

  /* -- Entity Helpers -- */

  _getEntity() {
    if (!this._hass || !this._config.entity) return null;
    return this._hass.states[this._config.entity] || null;
  }

  _getHumidity() {
    if (!this._hass || !this._config.humidity_entity) return null;
    return this._hass.states[this._config.humidity_entity] || null;
  }

  _getState() {
    const entity = this._getEntity();
    if (!entity) return null;
    const a = entity.attributes;
    const mode = entity.state; // heat, cool, heat_cool, off, auto, dry, fan_only
    const action = a.hvac_action || 'idle'; // heating, cooling, idle, off, drying, fan

    // Determine setpoints
    let heat, cool;
    if (mode === 'heat_cool' || mode === 'auto') {
      heat = a.target_temp_low;
      cool = a.target_temp_high;
    } else if (mode === 'heat') {
      heat = a.temperature;
      cool = null;
    } else if (mode === 'cool') {
      heat = null;
      cool = a.temperature;
    } else {
      heat = a.target_temp_low || a.temperature;
      cool = a.target_temp_high || a.temperature;
    }

    const minTemp = a.min_temp || 45;
    const maxTemp = a.max_temp || 95;
    const displayMin = this._config.display_min != null ? this._config.display_min : Math.max(minTemp, (heat || minTemp) - 10);
    const displayMax = this._config.display_max != null ? this._config.display_max : Math.min(maxTemp, (cool || maxTemp) + 10);

    // Fan
    const fanMode = a.fan_mode || 'auto';
    const fanOn = fanMode === 'on' || fanMode === 'high' || fanMode === 'medium' || fanMode === 'low';

    // Preset
    const presetMode = a.preset_mode || 'none';

    // Humidity
    const humEntity = this._getHumidity();
    const humidity = humEntity ? Math.round(Number(humEntity.state)) : null;

    // Normalize mode for our card (map auto -> heat_cool, etc.)
    let cardMode = mode;
    if (mode === 'auto') cardMode = 'heat_cool';
    if (mode === 'fan_only' || mode === 'dry') cardMode = 'off'; // not natively supported, show as off

    return {
      mode: cardMode,
      action,
      heat: heat != null ? Math.round(heat) : null,
      cool: cool != null ? Math.round(cool) : null,
      cur: a.current_temperature != null ? Math.round(a.current_temperature) : null,
      humidity,
      fanOn,
      preset: presetMode,
      minTemp: Math.round(minTemp),
      maxTemp: Math.round(maxTemp),
      displayMin: Math.round(displayMin),
      displayMax: Math.round(displayMax),
      hvacModes: a.hvac_modes || [],
      fanModes: a.fan_modes || [],
      presetModes: a.preset_modes || [],
    };
  }

  /* -- Full Update -- */

  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card) return;
    // Don't overwrite slider while user is dragging or during service cooldown
    if (this._drag || this._serviceCooldown) return;
    const s = this._getState();
    if (!s) return;

    // Store for slider math
    this._state = s;

    // Card title
    $.cardTitle.textContent = this._config.name || 'Climate';

    // Card data attributes
    $.card.dataset.mode = s.mode;
    $.card.dataset.action = s.action;

    // Header icon state - icon changes based on action
    $.hdrIcon.dataset.a = s.action;
    $.hdrTile.dataset.action = s.action;
    const actionIcons = { heating: 'local_fire_department', cooling: 'ac_unit' };
    $.hdrIconEl.textContent = actionIcons[s.action] || 'thermostat';
    if (s.action === 'heating' || s.action === 'cooling') {
      $.hdrIconEl.classList.add('filled');
    } else {
      $.hdrIconEl.classList.remove('filled');
    }

    // Fan button - action color overrides green when system is active
    $.fanBtn.classList.toggle('on', s.fanOn);
    $.fanBtn.dataset.action = s.action;
    if (s.fanOn) $.fanIconEl.classList.add('filled');
    else $.fanIconEl.classList.remove('filled');

    // Hide fan button if entity doesn't support fan modes
    $.fanBtn.style.display = (s.fanModes && s.fanModes.length > 0) ? '' : 'none';

    // Mode button - label, icon, and accent (accent follows action, not mode)
    const modeLabels = { heat_cool: 'Heat / Cool', heat: 'Heat', cool: 'Cool', off: 'Off' };
    const modeIcons = { heat_cool: 'device_thermostat', heat: 'local_fire_department', cool: 'ac_unit', off: 'power_settings_new' };
    $.modeLbl.textContent = modeLabels[s.mode] || s.mode;
    $.modeIcon.textContent = modeIcons[s.mode] || 'device_thermostat';
    $.modeBtn.dataset.action = s.action;

    // Mode menu active states
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.m === s.mode);
    });

    // Eco
    $.ecoOpt.classList.toggle('active', s.preset === 'eco');
    // Hide eco option if entity doesn't support it
    const hasEco = s.presetModes && s.presetModes.includes('eco');
    $.ecoOpt.style.display = hasEco ? '' : 'none';
    // Hide divider too if no eco
    const divider = this.shadowRoot.querySelector('.mode-divider');
    if (divider) divider.style.display = hasEco ? '' : 'none';

    // Hide mode options not supported by entity
    this.shadowRoot.querySelectorAll('.mode-opt:not(.eco-opt)').forEach(opt => {
      const m = opt.dataset.m;
      const haMode = m === 'heat_cool' ? 'heat_cool' : m;
      // Also check for 'auto' mapping to heat_cool
      const supported = s.hvacModes.includes(haMode) || (m === 'heat_cool' && s.hvacModes.includes('auto'));
      opt.style.display = supported ? '' : 'none';
    });

    // Temperature values
    const D = '<span class="deg">&deg;</span>';
    $.curTemp.innerHTML = (s.cur != null ? s.cur : '--') + D;

    if (s.heat != null) $.heatR.innerHTML = s.heat + D;
    else $.heatR.innerHTML = '--' + D;

    if (s.cool != null) $.coolR.innerHTML = s.cool + D;
    else $.coolR.innerHTML = '--' + D;

    // Header subtitle - humidity + action state
    this._updateSubtitle(s);

    // Scale labels
    $.sMin.textContent = s.displayMin + '°';
    $.sMid.textContent = Math.round(s.displayMin + (s.displayMax - s.displayMin) / 2) + '°';
    $.sMax.textContent = s.displayMax + '°';

    // Mid-scale suppression
    if (s.cur != null) {
      const midTemp = s.displayMin + (s.displayMax - s.displayMin) / 2;
      $.sMidMark.style.opacity = Math.abs(s.cur - midTemp) < 3 ? '0' : '1';
    }

    // Render slider positions
    this._renderSlider();
  }

  /* -- Slider Math -- */

  _t2p(temp) {
    const s = this._state;
    if (!s) return 0;
    return (temp - s.displayMin) / (s.displayMax - s.displayMin);
  }

  _p2t(p) {
    const s = this._state;
    if (!s) return 0;
    return Math.round(s.displayMin + p * (s.displayMax - s.displayMin));
  }

  _p2px(p) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return PAD + Math.max(0, Math.min(1, p)) * (w - 2 * PAD);
  }

  _px2p(px) {
    const sl = this.$.slider;
    if (!sl) return 0;
    const w = sl.offsetWidth;
    const PAD = 20;
    return Math.max(0, Math.min(1, (px - PAD) / (w - 2 * PAD)));
  }

  _updateSubtitle(s) {
    const $ = this.$;
    if (!$ || !$.hdrSub) return;

    const actionNames = { heating: 'Heating', cooling: 'Cooling', idle: 'Idle', off: 'Off', drying: 'Drying' };
    const actionClass = { heating: 'heat-ic', cooling: 'cool-ic' };

    let parts = [];

    // Humidity
    if (s.humidity != null) {
      parts.push(s.humidity + '% humidity');
    }

    // Build action + fan label
    const isActive = s.action === 'heating' || s.action === 'cooling';

    if (isActive && s.fanOn) {
      // Active HVAC + Fan: "Cooling · Fan" both in action color
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="' + cls + '">' + label + ' \u00b7 Fan</span>');
    } else if (isActive) {
      // Active HVAC only
      const cls = actionClass[s.action];
      let label = actionNames[s.action];
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="' + cls + '">' + label + '</span>');
    } else if (s.fanOn) {
      // Fan only (idle/off + fan)
      let label = 'Fan';
      if (s.preset === 'eco') label += ' \u00b7 Eco';
      parts.push('<span class="fan-ic">' + label + '</span>');
    } else {
      // Idle/Off
      let label = actionNames[s.action] || 'Idle';
      if (s.preset === 'eco' && s.action !== 'off') label += ' \u00b7 Eco';
      parts.push(label);
    }

    $.hdrSub.innerHTML = parts.join(' \u00b7 ');
  }

  _renderSlider() {
    const $ = this.$;
    const s = this._state;
    if (!s || !$.slider || !$.slider.offsetWidth) return;

    const w = $.slider.offsetWidth;

    if (s.heat != null) {
      const hp = this._t2p(s.heat);
      const hpx = this._p2px(hp);
      $.tH.style.left = hpx + 'px';
      $.fillH.style.width = hpx + 'px';

      // ARIA
      $.tH.setAttribute('aria-valuenow', s.heat);
      $.tH.setAttribute('aria-valuemin', s.minTemp);
      $.tH.setAttribute('aria-valuemax', s.cool != null ? s.cool - 2 : s.maxTemp);
      $.tH.setAttribute('aria-valuetext', 'Heat setpoint: ' + s.heat + ' degrees');
    }

    if (s.cool != null) {
      const cp = this._t2p(s.cool);
      const cpx = this._p2px(cp);
      $.tC.style.left = cpx + 'px';
      $.fillC.style.width = (w - cpx) + 'px';

      // ARIA
      $.tC.setAttribute('aria-valuenow', s.cool);
      $.tC.setAttribute('aria-valuemin', s.heat != null ? s.heat + 2 : s.minTemp);
      $.tC.setAttribute('aria-valuemax', s.maxTemp);
      $.tC.setAttribute('aria-valuetext', 'Cool setpoint: ' + s.cool + ' degrees');
    }

    // Deadband (only in heat_cool mode)
    if (s.mode === 'heat_cool' && s.heat != null && s.cool != null) {
      const hpx = this._p2px(this._t2p(s.heat));
      const cpx = this._p2px(this._t2p(s.cool));
      $.db.style.left = hpx + 'px';
      $.db.style.width = Math.max(0, cpx - hpx) + 'px';
      $.db.style.display = '';
    } else {
      $.db.style.display = 'none';
    }

    // Current temp marker
    if (s.cur != null) {
      $.curMark.style.left = this._p2px(this._t2p(s.cur)) + 'px';
      $.curLbl.textContent = s.cur + '°';
      $.curMark.style.display = '';
    } else {
      $.curMark.style.display = 'none';
    }
  }

  /* -- Drag Handlers -- */

  _startDrag(which, e) {
    e.preventDefault();
    e.stopPropagation();
    this._drag = which;
    this._dragActive = false;
    this._dragStartX = e.touches ? e.touches[0].clientX : e.clientX;

    const thumbEl = which === 'heat' ? this.$.tH : this.$.tC;
    thumbEl.style.transition = 'none';
    document.body.style.cursor = 'grabbing';
  }

  _onMouseMove(e) {
    if (!this._drag) return;
    this._handleDragMove(e.clientX);
  }

  _onTouchMove(e) {
    if (!this._drag) return;
    e.preventDefault();
    this._handleDragMove(e.touches[0].clientX);
  }

  _handleDragMove(cx) {
    const DRAG_THRESHOLD = 4;

    if (!this._dragActive) {
      if (Math.abs(cx - this._dragStartX) < DRAG_THRESHOLD) return;
      this._dragActive = true;
      const thumbEl = this._drag === 'heat' ? this.$.tH : this.$.tC;
      thumbEl.classList.add('dragging');
    }

    const sl = this.$.slider;
    const r = sl.getBoundingClientRect();
    const px = cx - r.left;
    const p = this._px2p(px);
    const t = this._p2t(p);
    const s = this._state;

    if (this._drag === 'heat') {
      const maxHeat = s.cool != null ? s.cool - 2 : s.maxTemp;
      s.heat = Math.max(s.minTemp, Math.min(t, maxHeat));
    } else {
      const minCool = s.heat != null ? s.heat + 2 : s.minTemp;
      s.cool = Math.min(s.maxTemp, Math.max(t, minCool));
    }

    // Update visuals (no service call yet)
    this._renderSlider();

    // Update displayed setpoint values
    const D = '<span class="deg">&deg;</span>';
    if (this._drag === 'heat' && s.heat != null) {
      this.$.heatR.innerHTML = s.heat + D;
    }
    if (this._drag === 'cool' && s.cool != null) {
      this.$.coolR.innerHTML = s.cool + D;
    }
  }

  _onEndDrag() {
    if (!this._drag) return;

    const which = this._drag;
    const thumbEl = which === 'heat' ? this.$.tH : this.$.tC;
    thumbEl.style.transition = '';
    thumbEl.classList.remove('dragging');

    document.body.style.cursor = '';

    if (this._dragActive) {
      // Debounce service call to prevent rate limiting on rapid adjustments
      clearTimeout(this._debounceTimer);
      this._debounceTimer = setTimeout(() => this._callSetTemperature(), 300);
    }

    this._drag = null;
    this._dragActive = false;
  }

  /* -- Keyboard -- */

  _thumbKey(which, e) {
    const step = e.shiftKey ? 5 : 1;
    const s = this._state;
    if (!s) return;
    let changed = false;

    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (which === 'heat' && s.heat != null) {
        const max = s.cool != null ? s.cool - 2 : s.maxTemp;
        s.heat = Math.min(s.heat + step, max);
        changed = true;
      } else if (which === 'cool' && s.cool != null) {
        s.cool = Math.min(s.cool + step, s.maxTemp);
        changed = true;
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (which === 'heat' && s.heat != null) {
        s.heat = Math.max(s.heat - step, s.minTemp);
        changed = true;
      } else if (which === 'cool' && s.cool != null) {
        const min = s.heat != null ? s.heat + 2 : s.minTemp;
        s.cool = Math.max(s.cool - step, min);
        changed = true;
      }
    }

    if (changed) {
      this._renderSlider();
      const D = '<span class="deg">&deg;</span>';
      if (s.heat != null) this.$.heatR.innerHTML = s.heat + D;
      if (s.cool != null) this.$.coolR.innerHTML = s.cool + D;
      this._debouncedSetTemperature();
    }
  }

  /* -- Service Calls -- */

  _callSetTemperature() {
    const s = this._state;
    if (!s || !this._hass) return;

    const data = { entity_id: this._config.entity };

    if (s.mode === 'heat_cool') {
      if (s.heat != null) data.target_temp_low = s.heat;
      if (s.cool != null) data.target_temp_high = s.cool;
    } else if (s.mode === 'heat' && s.heat != null) {
      data.temperature = s.heat;
    } else if (s.mode === 'cool' && s.cool != null) {
      data.temperature = s.cool;
    }

    this._hass.callService('climate', 'set_temperature', data);

    // Block state bounce-back from resetting slider for 1.5s after service call
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);
  }

  _debouncedSetTemperature() {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this._callSetTemperature(), 400);
  }

  _setMode(mode) {
    if (!this._hass) return;

    // Close menu
    this.$.modeMenu.classList.remove('open');
    this.$.modeBtn.setAttribute('aria-expanded', 'false');

    // Map heat_cool back to auto if entity uses auto
    const s = this._state;
    let haMode = mode;
    if (mode === 'heat_cool' && s && s.hvacModes.includes('auto') && !s.hvacModes.includes('heat_cool')) {
      haMode = 'auto';
    }

    this._hass.callService('climate', 'set_hvac_mode', {
      entity_id: this._config.entity,
      hvac_mode: haMode,
    });
  }

  _toggleFan() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;

    const newMode = s.fanOn ? 'off' : 'on';

    // Optimistic UI update - show change immediately
    s.fanOn = !s.fanOn;
    this.$.fanBtn.classList.toggle('on', s.fanOn);
    if (s.fanOn) this.$.fanIconEl.classList.add('filled');
    else this.$.fanIconEl.classList.remove('filled');
    this._updateSubtitle(s);

    // Block state bounce-back briefly
    this._serviceCooldown = true;
    clearTimeout(this._cooldownTimer);
    this._cooldownTimer = setTimeout(() => { this._serviceCooldown = false; }, 1500);

    this._hass.callService('climate', 'set_fan_mode', {
      entity_id: this._config.entity,
      fan_mode: newMode,
    });
  }

  _toggleEco() {
    if (!this._hass) return;
    const s = this._state;
    if (!s) return;

    const newPreset = s.preset === 'eco' ? 'none' : 'eco';
    this._hass.callService('climate', 'set_preset_mode', {
      entity_id: this._config.entity,
      preset_mode: newPreset,
    });
  }

  /* -- Menu -- */

  _toggleMenu() {
    const menu = this.$.modeMenu;
    const btn = this.$.modeBtn;
    menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', menu.classList.contains('open'));
  }

  _onDocClick(e) {
    // Close menu when clicking outside
    if (!this.$.modeMenu || !this.$.modeMenu.classList.contains('open')) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector('.mode-wrap'))) {
      this.$.modeMenu.classList.remove('open');
      this.$.modeBtn.setAttribute('aria-expanded', 'false');
    }
  }
}

/* ===============================================================
   Registration
   =============================================================== */

if (!customElements.get('tunet-climate-card')) {
  customElements.define('tunet-climate-card', TunetClimateCard);
}

// Register with HA card picker
window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === 'tunet-climate-card')) {
  window.customCards.push({
    type: 'tunet-climate-card',
    name: 'Tunet Climate Card',
    description: 'Glassmorphism climate controller with dual-range slider',
    preview: true,
    documentationURL: 'https://github.com/tunet/tunet-climate-card',
  });
}

console.info(
  `%c TUNET-CLIMATE-CARD %c v${CARD_VERSION} `,
  'color: #fff; background: #D4850A; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;',
  'color: #D4850A; background: #fff3e0; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;'
);
