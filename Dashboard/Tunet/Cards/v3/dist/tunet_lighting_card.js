// Dashboard/Tunet/Cards/v3/tunet_base.js
var TOKENS = `
  :host {
    /* Glass Surfaces */
    --glass: rgba(255,255,255, 0.68);
    --glass-border: rgba(255,255,255, 0.45);

    /* Shadows (two-layer: contact + ambient) */
    --shadow: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --shadow-up: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);

    /* Text */
    --text: #1C1C1E;
    --text-sub: #8E8E93;
    --text-muted: #8E8E93;

    /* Accent: Amber */
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10, 0.10);
    --amber-border: rgba(212,133,10, 0.22);

    /* Accent: Blue */
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255, 0.09);
    --blue-border: rgba(0,122,255, 0.18);

    /* Accent: Green */
    --green: #34C759;
    --green-fill: rgba(52,199,89, 0.12);
    --green-border: rgba(52,199,89, 0.15);

    /* Accent: Purple */
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222, 0.10);
    --purple-border: rgba(175,82,222, 0.18);

    /* Accent: Red */
    --red: #FF3B30;
    --red-fill: rgba(255,59,48, 0.10);
    --red-border: rgba(255,59,48, 0.22);

    /* Track / Slider */
    --track-bg: rgba(0,0,0, 0.06);
    --track-h: 44px;

    /* Thumb */
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);

    /* Radii */
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 14px;

    /* Surface Blur */
    --blur-card: 24px;
    --blur-section: 20px;
    --blur-menu: 24px;

    /* Motion + Interaction */
    --motion-fast: 0.12s;
    --motion-ui: 0.18s;
    --motion-surface: 0.28s;
    --ease-standard: cubic-bezier(0.2, 0, 0, 1);
    --ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1);
    --press-scale: 0.97;
    --press-scale-strong: 0.95;
    --lift-scale: 1.03;
    --drag-scale: 1.05;

    /* Focus */
    --focus-ring-color: var(--blue);
    --focus-ring-width: 2px;
    --focus-ring-offset: 3px;

    /* Controls */
    --ctrl-bg: rgba(255,255,255, 0.52);
    --ctrl-border: rgba(0,0,0, 0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);

    /* Chips */
    --chip-bg: rgba(255,255,255, 0.48);
    --chip-border: rgba(0,0,0, 0.05);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.04);

    /* Dropdown Menu */
    --dd-bg: rgba(255,255,255, 0.84);
    --dd-border: rgba(255,255,255, 0.60);

    /* Dividers */
    --divider: rgba(28,28,30, 0.07);

    /* Toggle Switch */
    --toggle-off: rgba(28,28,30, 0.10);
    --toggle-on: rgba(52,199,89, 0.28);
    --toggle-knob: rgba(255,255,255, 0.96);

    /* Tile Surfaces */
    --tile-bg: rgba(255,255,255, 0.92);
    --tile-bg-off: rgba(28,28,30, 0.04);
    --gray-ghost: rgba(0, 0, 0, 0.03);
    --border-ghost: transparent;

    /* Icon Surfaces */
    --icon-wrap-size: 44px;
    --icon-wrap-size-sm: 24px;
    --icon-wrap-radius: 16px;
    --icon-wrap-radius-sm: 6px;
    --icon-wrap-bg-off: var(--gray-ghost);
    --icon-wrap-fg-off: var(--text-muted);
    --icon-wrap-bg-on: var(--amber-fill);
    --icon-wrap-fg-on: var(--amber);
    --icon-wrap-border-on: var(--amber-border);

    /* Semantic glow usage: alert/group/override only */
    --glow-manual: 0 0 12px rgba(255,82,82,0.60);
    --glow-group: 0 0 10px rgba(0,122,255,0.45);

    /* Section Container */
    --section-bg: rgba(255,255,255, 0.45);
    --section-gap: 16px;
    --shadow-section: 0 8px 40px rgba(0,0,0,0.10);
    --section-shadow: var(--shadow-section);

    /* Density controls (global defaults) */
    --card-pad: 20px;
    --section-pad: 20px;
    --tile-pad: 14px;
    --tile-gap: 6px;
    --ctrl-min-h: 42px;
    --ctrl-font-size: 12px;
    --ctrl-pad-x: 12px;
    --dd-option-font-size: 13px;
    --dd-option-pad-y: 9px;
    --dd-option-pad-x: 12px;
    --rooms-row-btn-size: 3.16em;
    --rooms-row-btn-radius: 12px;
    --rooms-row-btn-icon-size: 1.62em;
    --rooms-row-btn-size-slim: 2.76em;
    --rooms-row-btn-icon-size-slim: 1.42em;
    --rooms-all-toggle-min-h: 2.62em;
    --rooms-all-toggle-min-w: 6.5em;
    --rooms-all-toggle-font: 0.82em;
    --rooms-all-toggle-icon: 1.2em;

    /* Semantic type roles (desktop) */
    --type-label: 12.5px;
    --type-sub: 11px;
    --type-value: 18px;
    --type-chip: 12.5px;
    --type-row-title: 16.5px;
    --type-row-status: 14.5px;
    --row-line-height-title: 1.16;
    --row-line-height-status: 1.14;
    --row-status-max-lines: 2;

    /* Density controls (mobile baseline) */
    --density-mobile-card-pad: 13px;
    --density-mobile-section-pad: 13px;
    --density-mobile-tile-pad: 10px;
    --density-mobile-tile-gap: 4px;
    --density-mobile-ctrl-min-h: 40px;
    --density-mobile-ctrl-font: 12.5px;
    --density-mobile-ctrl-pad-x: 11px;
    --density-mobile-dd-font: 13px;
    --density-mobile-dd-pad-y: 8px;
    --density-mobile-dd-pad-x: 10px;
    --density-mobile-rooms-row-btn-size: 2.82em;
    --density-mobile-rooms-row-btn-icon-size: 1.44em;
    --density-mobile-rooms-row-btn-size-slim: 2.52em;
    --density-mobile-rooms-row-btn-icon-size-slim: 1.28em;
    --density-mobile-rooms-all-toggle-min-h: 2.34em;
    --density-mobile-rooms-all-toggle-min-w: 5.62em;
    --density-mobile-rooms-all-toggle-font: 0.74em;
    --density-mobile-rooms-all-toggle-icon: 1.06em;

    /* Semantic type roles (mobile baseline) */
    --type-label-mobile: 13px;
    --type-sub-mobile: 11.5px;
    --type-value-mobile: 18px;
    --type-chip-mobile: 13px;
    --type-row-title-mobile: 18px;
    --type-row-status-mobile: 15.5px;

    color-scheme: light;
    display: block;
    container-type: inline-size;
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  :host(.dark) {
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.10);

    --shadow: 0 4px 20px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.50);
    --shadow-up: 0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);

    --text: #F8FAFC;
    --text-sub: rgba(248,250,252, 0.65);
    --text-muted: rgba(248,250,252, 0.45);

    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36, 0.12);
    --amber-border: rgba(251,191,36, 0.25);

    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255, 0.13);
    --blue-border: rgba(10,132,255, 0.22);

    --green: #30D158;
    --green-fill: rgba(48,209,88, 0.14);
    --green-border: rgba(48,209,88, 0.18);

    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242, 0.14);
    --purple-border: rgba(191,90,242, 0.22);

    --red: #FF453A;
    --red-fill: rgba(255,69,58, 0.14);
    --red-border: rgba(255,69,58, 0.25);

    --track-bg: rgba(255,255,255, 0.06);
    --blur-card: 24px;
    --blur-section: 20px;
    --blur-menu: 24px;
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);

    --ctrl-bg: rgba(255,255,255, 0.08);
    --ctrl-border: rgba(255,255,255, 0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);

    --chip-bg: rgba(58,58,60, 0.50);
    --chip-border: rgba(255,255,255, 0.06);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.18);

    --dd-bg: rgba(58,58,60, 0.88);
    --dd-border: rgba(255,255,255, 0.08);

    --divider: rgba(255,255,255, 0.06);

    --toggle-off: rgba(255,255,255, 0.10);
    --toggle-on: rgba(48,209,88, 0.30);
    --toggle-knob: rgba(255,255,255, 0.92);

    --tile-bg: rgba(30,41,59, 0.92);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255,255,255, 0.04);
    --border-ghost: rgba(255,255,255, 0.05);
    --icon-wrap-bg-off: var(--gray-ghost);
    --icon-wrap-fg-off: var(--text-muted);
    --icon-wrap-bg-on: var(--amber-fill);
    --icon-wrap-fg-on: var(--amber);
    --icon-wrap-border-on: var(--amber-border);
    --glow-group: 0 0 10px rgba(10,132,255,0.50);

    --section-bg: rgba(30,41,59, 0.60);
    --shadow-section: 0 8px 40px rgba(0,0,0,0.35);
    --section-shadow: var(--shadow-section);

    color-scheme: dark;
  }

  button:focus-visible,
  [role="button"]:focus-visible,
  [tabindex]:focus-visible,
  .focus-ring:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }

  @media (prefers-contrast: more) {
    :host {
      --text-sub: rgba(28,28,30, 0.78);
      --text-muted: rgba(28,28,30, 0.64);
      --ctrl-border: rgba(0,0,0, 0.14);
      --chip-border: rgba(0,0,0, 0.14);
      --border-ghost: rgba(0,0,0, 0.12);
      --divider: rgba(28,28,30, 0.14);
      --focus-ring-width: 3px;
    }
    :host(.dark) {
      --text-sub: rgba(248,250,252, 0.86);
      --text-muted: rgba(248,250,252, 0.66);
      --ctrl-border: rgba(255,255,255, 0.20);
      --chip-border: rgba(255,255,255, 0.18);
      --border-ghost: rgba(255,255,255, 0.16);
      --divider: rgba(255,255,255, 0.16);
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    :host {
      --glass: rgba(255,255,255, 0.94);
      --section-bg: rgba(255,255,255, 0.92);
      --dd-bg: rgba(255,255,255, 0.96);
      --ctrl-bg: rgba(255,255,255, 0.88);
      --chip-bg: rgba(255,255,255, 0.86);
      --blur-card: 0px;
      --blur-section: 0px;
      --blur-menu: 0px;
    }
    :host(.dark) {
      --glass: rgba(30,41,59, 0.92);
      --section-bg: rgba(30,41,59, 0.88);
      --dd-bg: rgba(30,41,59, 0.94);
      --ctrl-bg: rgba(30,41,59, 0.78);
      --chip-bg: rgba(30,41,59, 0.76);
    }
  }

  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    :host {
      --glass: rgba(255,255,255, 0.94);
      --section-bg: rgba(255,255,255, 0.92);
      --dd-bg: rgba(255,255,255, 0.96);
    }
    :host(.dark) {
      --glass: rgba(30,41,59, 0.92);
      --section-bg: rgba(30,41,59, 0.88);
      --dd-bg: rgba(30,41,59, 0.94);
    }
  }
`;
var TOKENS_MIDNIGHT = `
  :host(.dark) {
    /* Midnight Navy - Parity Lock baseline */
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.10);

    --text: #F8FAFC;
    --text-sub: rgba(248,250,252, 0.65);
    --text-muted: rgba(248,250,252, 0.45);

    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36, 0.12);
    --amber-border: rgba(251,191,36, 0.25);

    --tile-bg: rgba(255,255,255, 0.08);
    --tile-bg-off: rgba(255,255,255, 0.04);
    --gray-ghost: rgba(255,255,255, 0.04);
    --border-ghost: rgba(255,255,255, 0.05);

    --section-bg: rgba(30,41,59, 0.60);

    --track-bg: rgba(255,255,255, 0.08);
    --shadow: 0 4px 20px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.5);
    --shadow-up: 0 20px 40px rgba(0,0,0,0.60), 0 4px 15px rgba(0,0,0,0.40);
  }
`;
var SIZE_KEYS = ["compact", "standard", "large"];
var VALID_SIZES = new Set(SIZE_KEYS);
var PRESET_FAMILY_MAP = {
  lighting: "tile-grid",
  speakers: "speaker-tile",
  rooms: "tile-grid",
  "rooms-row": "rooms-row",
  status: "indicator-tile",
  environment: "indicator-row"
};
var PROFILE_BASE = {
  compact: {
    cardPad: "0.875em",
    sectionPad: "0.875em",
    sectionGap: "0.75em",
    headerHeight: "2.375em",
    headerFont: "0.75em",
    sectionFont: "0.8125em",
    tilePad: "0.625em",
    tileGap: "0.25em",
    tileRadius: "0.75em",
    ddRadius: "0.4375em",
    iconBox: "2.125em",
    iconGlyph: "1.0625em",
    nameFont: "0.75em",
    valueFont: "1.0625em",
    subFont: "0.6875em",
    unitFont: "0.6875em",
    ctrlMinH: "2.375em",
    ctrlPadX: "0.625em",
    ctrlIconSize: "1.125em",
    ddOptionFont: "0.75em",
    ddOptionPadY: "0.5em",
    ddOptionPadX: "0.625em",
    dropdownMinH: "7.5em",
    dropdownMaxH: "13.75em",
    progressH: "0.375em"
  },
  standard: {
    cardPad: "1.25em",
    sectionPad: "1.25em",
    sectionGap: "1em",
    headerHeight: "2.625em",
    headerFont: "0.8125em",
    sectionFont: "0.875em",
    tilePad: "0.875em",
    tileGap: "0.375em",
    tileRadius: "0.875em",
    ddRadius: "0.5em",
    iconBox: "2.375em",
    iconGlyph: "1.1875em",
    nameFont: "0.8125em",
    valueFont: "1.125em",
    subFont: "0.6875em",
    unitFont: "0.6875em",
    ctrlMinH: "2.625em",
    ctrlPadX: "0.75em",
    ctrlIconSize: "1.25em",
    ddOptionFont: "0.8125em",
    ddOptionPadY: "0.5625em",
    ddOptionPadX: "0.75em",
    dropdownMinH: "7.5em",
    dropdownMaxH: "15em",
    progressH: "0.5em"
  },
  large: {
    cardPad: "1.5em",
    sectionPad: "1.5em",
    sectionGap: "1.25em",
    headerHeight: "2.75em",
    headerFont: "0.875em",
    sectionFont: "1em",
    tilePad: "1em",
    tileGap: "0.5em",
    tileRadius: "1em",
    ddRadius: "0.5625em",
    iconBox: "2.75em",
    iconGlyph: "1.375em",
    nameFont: "0.875em",
    valueFont: "1.25em",
    subFont: "0.75em",
    unitFont: "0.75em",
    ctrlMinH: "2.75em",
    ctrlPadX: "0.875em",
    ctrlIconSize: "1.375em",
    ddOptionFont: "0.875em",
    ddOptionPadY: "0.625em",
    ddOptionPadX: "0.875em",
    dropdownMinH: "8em",
    dropdownMaxH: "17.5em",
    progressH: "0.625em"
  }
};
var SIZE_PROFILES = {
  "tile-grid": {
    compact: {
      ...PROFILE_BASE.compact,
      tileMinH: "5.125em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.035em",
      displayValueFont: "0.9775em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      tileMinH: "5.75em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.12125em",
      displayValueFont: "1.035em"
    },
    large: {
      ...PROFILE_BASE.large,
      tileMinH: "6.375em",
      headerTitleFont: "0.9625em",
      headerSubFont: "0.825em",
      displayNameFont: "1.2075em",
      displayValueFont: "1.15em"
    }
  },
  "speaker-tile": {
    compact: {
      ...PROFILE_BASE.compact,
      tilePad: "0.5em",
      tileGap: "0.25em",
      tileMinH: "5.25em",
      progressH: "0.375em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1em",
      displayMetaFont: "0.82em",
      displayValueFont: "1.115625em",
      displayActionFont: "0.88em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      tilePad: "0.625em",
      tileGap: "0.3125em",
      tileMinH: "5.875em",
      subFont: "0.71875em",
      progressH: "0.4375em",
      headerTitleFont: "0.95em",
      headerSubFont: "0.82em",
      displayNameFont: "1.04em",
      displayMetaFont: "0.82em",
      displayValueFont: "1.18125em",
      displayActionFont: "0.88em"
    },
    large: {
      ...PROFILE_BASE.large,
      tilePad: "0.75em",
      tileGap: "0.4375em",
      tileMinH: "6.5em",
      progressH: "0.5625em",
      headerTitleFont: "0.9625em",
      headerSubFont: "0.825em",
      displayNameFont: "1.12em",
      displayMetaFont: "0.855em",
      displayValueFont: "1.3125em",
      displayActionFont: "0.88em"
    }
  },
  "rooms-row": {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: "0.96875em",
      rowMinH: "6.8125em",
      rowGap: "0.34em",
      rowTitleFont: "0.9375em",
      rowStatusFont: "0.8125em",
      orbSize: "2.96em",
      orbIcon: "1.56em",
      toggleSize: "2.96em",
      toggleIcon: "1.56em",
      chevronSize: "1.28em",
      rowBtnRadius: "0.5625em",
      rowDisplayNameFont: "0.99em",
      rowDisplayStatusFont: "0.8925em",
      rowLeadIconBox: "1.9536em",
      rowLeadIconGlyph: "1.1544em",
      rowControlSize: "3.3152em",
      rowControlIcon: "1.7472em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: "1.0625em",
      rowMinH: "7.3125em",
      rowGap: "0.52em",
      rowTitleFont: "1.03125em",
      rowStatusFont: "0.90625em",
      orbSize: "3.16em",
      orbIcon: "1.62em",
      toggleSize: "3.16em",
      toggleIcon: "1.62em",
      chevronSize: "1.56em",
      rowBtnRadius: "0.75em",
      rowDisplayNameFont: "1.018875em",
      rowDisplayStatusFont: "0.89775em",
      rowLeadIconBox: "2.0856em",
      rowLeadIconGlyph: "1.1988em",
      rowControlSize: "3.16em",
      rowControlIcon: "1.62em"
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: "1.125em",
      rowMinH: "7.875em",
      rowGap: "0.625em",
      rowTitleFont: "1.125em",
      rowStatusFont: "0.96875em",
      orbSize: "3.4em",
      orbIcon: "1.76em",
      toggleSize: "3.4em",
      toggleIcon: "1.76em",
      chevronSize: "1.7em",
      rowBtnRadius: "0.8125em",
      rowDisplayNameFont: "1.155em",
      rowDisplayStatusFont: "1.05em",
      rowLeadIconBox: "2.244em",
      rowLeadIconGlyph: "1.3024em",
      rowControlSize: "3.4em",
      rowControlIcon: "1.76em"
    }
  },
  "indicator-tile": {
    compact: {
      ...PROFILE_BASE.compact,
      headerFont: "0.875em",
      sectionFont: "0.875em",
      tileMinH: "5.5em",
      timerFont: "1.0625em",
      timerLetterSpacing: "0.02em",
      alarmPillFont: "0.875em",
      alarmBtnH: "1.125em",
      alarmBtnFont: "0.5em",
      alarmIconSize: "0.625em",
      dropdownMaxH: "13.75em",
      displayIconBox: "2.55em",
      displayIconGlyph: "1.29625em",
      displayNameFont: "1.035em",
      displayValueFont: "1.04125em",
      displayMetaFont: "0.87125em",
      timerDisplayFont: "1.1475em",
      dropdownValueFont: "0.87em",
      statusTileGap: "0.13em",
      statusTilePadTop: "0.425em",
      statusTilePadBottom: "0.5625em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      headerFont: "1em",
      sectionFont: "0.9375em",
      tileMinH: "5.875em",
      timerFont: "1.125em",
      timerLetterSpacing: "0.03125em",
      alarmPillFont: "0.9375em",
      alarmBtnH: "1.25em",
      alarmBtnFont: "0.5625em",
      alarmIconSize: "0.6875em",
      dropdownMaxH: "15em",
      displayIconBox: "2.85em",
      displayIconGlyph: "1.44875em",
      displayNameFont: "1.12125em",
      displayValueFont: "1.1025em",
      displayMetaFont: "0.9225em",
      timerDisplayFont: "1.215em",
      dropdownValueFont: "0.9425em",
      statusTileGap: "0.195em",
      statusTilePadTop: "0.595em",
      statusTilePadBottom: "0.7875em"
    },
    large: {
      ...PROFILE_BASE.large,
      headerFont: "1.125em",
      sectionFont: "1em",
      tileMinH: "7.125em",
      timerFont: "1.25em",
      timerLetterSpacing: "0.04em",
      alarmPillFont: "1em",
      alarmBtnH: "1.375em",
      alarmBtnFont: "0.625em",
      alarmIconSize: "0.75em",
      dropdownMaxH: "17.5em",
      displayIconBox: "3.3em",
      displayIconGlyph: "1.6775em",
      displayNameFont: "1.2075em",
      displayValueFont: "1.225em",
      displayMetaFont: "1.025em",
      timerDisplayFont: "1.35em",
      dropdownValueFont: "1.015em",
      statusTileGap: "0.26em",
      statusTilePadTop: "0.68em",
      statusTilePadBottom: "0.9em"
    }
  },
  "indicator-row": {
    compact: {
      ...PROFILE_BASE.compact,
      sectionFont: "0.875em",
      rowMinH: "3em",
      rowGap: "0.625em",
      rowPadY: "0.625em",
      rowPadX: "0.125em",
      iconBox: "2em",
      iconGlyph: "1.125em",
      nameFont: "0.75em",
      subFont: "0.6875em",
      valueFont: "1.125em",
      unitFont: "0.6875em",
      sparklineW: "2.5em",
      sparklineH: "1.25em",
      trendBox: "1.125em",
      trendGlyph: "0.875em",
      sparkStroke: "0.09375em",
      displayIconBox: "2.24em",
      displayIconGlyph: "1.26em",
      displayNameFont: "0.99em",
      displayValueFont: "1.035em"
    },
    standard: {
      ...PROFILE_BASE.standard,
      sectionFont: "0.9375em",
      rowMinH: "3.5em",
      rowGap: "0.75em",
      rowPadY: "0.75em",
      rowPadX: "0.25em",
      iconBox: "2.25em",
      iconGlyph: "1.25em",
      nameFont: "0.8125em",
      subFont: "0.6875em",
      valueFont: "1.25em",
      unitFont: "0.6875em",
      sparklineW: "3em",
      sparklineH: "1.5em",
      trendBox: "1.25em",
      trendGlyph: "1em",
      sparkStroke: "0.09375em",
      displayIconBox: "2.52em",
      displayIconGlyph: "1.4em",
      displayNameFont: "1.0725em",
      displayValueFont: "1.15em"
    },
    large: {
      ...PROFILE_BASE.large,
      sectionFont: "1em",
      rowMinH: "4em",
      rowGap: "0.875em",
      rowPadY: "0.875em",
      rowPadX: "0.3125em",
      iconBox: "2.5em",
      iconGlyph: "1.375em",
      nameFont: "0.875em",
      subFont: "0.75em",
      valueFont: "1.375em",
      unitFont: "0.75em",
      sparklineW: "3.5em",
      sparklineH: "1.75em",
      trendBox: "1.375em",
      trendGlyph: "1.125em",
      sparkStroke: "0.109375em",
      displayIconBox: "2.8em",
      displayIconGlyph: "1.54em",
      displayNameFont: "1.155em",
      displayValueFont: "1.265em"
    }
  }
};
var TOKEN_MAP = {
  cardPad: "--_tunet-card-pad",
  sectionPad: "--_tunet-section-pad",
  sectionGap: "--_tunet-section-gap",
  headerHeight: "--_tunet-header-height",
  headerFont: "--_tunet-header-font",
  headerTitleFont: "--_tunet-header-title-font",
  headerSubFont: "--_tunet-header-sub-font",
  sectionFont: "--_tunet-section-font",
  tilePad: "--_tunet-tile-pad",
  tileGap: "--_tunet-tile-gap",
  tileRadius: "--_tunet-tile-radius",
  tileMinH: "--_tunet-tile-min-h",
  iconBox: "--_tunet-icon-box",
  iconGlyph: "--_tunet-icon-glyph",
  nameFont: "--_tunet-name-font",
  valueFont: "--_tunet-value-font",
  subFont: "--_tunet-sub-font",
  unitFont: "--_tunet-unit-font",
  displayNameFont: "--_tunet-display-name-font",
  displayValueFont: "--_tunet-display-value-font",
  displayMetaFont: "--_tunet-display-meta-font",
  displayActionFont: "--_tunet-display-action-font",
  displayIconBox: "--_tunet-display-icon-box",
  displayIconGlyph: "--_tunet-display-icon-glyph",
  progressH: "--_tunet-progress-h",
  ctrlMinH: "--_tunet-ctrl-min-h",
  ctrlPadX: "--_tunet-ctrl-pad-x",
  ctrlIconSize: "--_tunet-ctrl-icon-size",
  ddRadius: "--_tunet-dd-radius",
  ddOptionFont: "--_tunet-dd-option-font",
  ddOptionPadY: "--_tunet-dd-option-pad-y",
  ddOptionPadX: "--_tunet-dd-option-pad-x",
  dropdownMinH: "--_tunet-dropdown-min-h",
  dropdownMaxH: "--_tunet-dropdown-max-h",
  rowMinH: "--_tunet-row-min-h",
  rowGap: "--_tunet-row-gap",
  rowTitleFont: "--_tunet-row-title-font",
  rowStatusFont: "--_tunet-row-status-font",
  orbSize: "--_tunet-orb-size",
  orbIcon: "--_tunet-orb-icon",
  toggleSize: "--_tunet-toggle-size",
  toggleIcon: "--_tunet-toggle-icon",
  chevronSize: "--_tunet-chevron-size",
  rowBtnRadius: "--_tunet-row-btn-radius",
  timerFont: "--_tunet-timer-font",
  timerDisplayFont: "--_tunet-timer-display-font",
  timerLetterSpacing: "--_tunet-timer-ls",
  alarmPillFont: "--_tunet-alarm-pill-font",
  alarmBtnH: "--_tunet-alarm-btn-h",
  alarmBtnFont: "--_tunet-alarm-btn-font",
  alarmIconSize: "--_tunet-alarm-icon-size",
  rowPadY: "--_tunet-row-pad-y",
  rowPadX: "--_tunet-row-pad-x",
  rowDisplayNameFont: "--_tunet-row-display-name-font",
  rowDisplayStatusFont: "--_tunet-row-display-status-font",
  rowLeadIconBox: "--_tunet-row-lead-icon-box",
  rowLeadIconGlyph: "--_tunet-row-lead-icon-glyph",
  rowControlSize: "--_tunet-row-control-size",
  rowControlIcon: "--_tunet-row-control-icon",
  dropdownValueFont: "--_tunet-dropdown-value-font",
  statusTileGap: "--_tunet-status-tile-gap",
  statusTilePadTop: "--_tunet-status-pad-top",
  statusTilePadBottom: "--_tunet-status-pad-bottom",
  sparklineW: "--_tunet-sparkline-w",
  sparklineH: "--_tunet-sparkline-h",
  trendBox: "--_tunet-trend-box",
  trendGlyph: "--_tunet-trend-glyph",
  sparkStroke: "--_tunet-spark-stroke"
};
var OVERRIDE_PAIRS = [
  ["--profile-card-pad", "--_tunet-card-pad"],
  ["--profile-tile-pad", "--_tunet-tile-pad"],
  ["--profile-tile-gap", "--_tunet-tile-gap"],
  ["--profile-icon-box", "--_tunet-icon-box"],
  ["--profile-name-font", "--_tunet-name-font"],
  ["--profile-value-font", "--_tunet-value-font"],
  ["--profile-header-font", "--_tunet-header-font"],
  ["--profile-section-font", "--_tunet-section-font"],
  ["--profile-progress-h", "--_tunet-progress-h"]
];
var _warnedLegacyResolverWidthHint = false;
function normalizeSize(size) {
  if (size == null) return "";
  return String(size).trim().toLowerCase();
}
function autoSizeFromWidth(widthPx) {
  const width = Number(widthPx);
  if (!Number.isFinite(width) || width <= 0) return "standard";
  if (width < 600) return "compact";
  return "standard";
}
function selectProfileSize({ preset, layout, widthHint, userSize } = {}) {
  const normalizedPreset = String(preset || "").trim().toLowerCase();
  const normalizedLayout = String(layout || "").trim().toLowerCase();
  const rowMode = normalizedPreset === "rooms" && (normalizedLayout === "row" || normalizedLayout === "slim");
  const mapKey = rowMode ? "rooms-row" : normalizedPreset;
  const family = PRESET_FAMILY_MAP[mapKey];
  const explicitSize = normalizeSize(userSize);
  const sizeFromUser = VALID_SIZES.has(explicitSize) ? explicitSize : "";
  if (explicitSize && !sizeFromUser) {
    console.warn(`[TunetProfile] Unknown userSize "${userSize}". Falling back to auto size.`);
  }
  if (!family) {
    console.warn(`[TunetProfile] Unknown preset "${preset}" (layout: "${layout}"). Falling back to tile-grid.`);
    return { family: "tile-grid", size: sizeFromUser || autoSizeFromWidth(widthHint) };
  }
  return { family, size: sizeFromUser || autoSizeFromWidth(widthHint) };
}
function resolveSizeProfile({ family, size, widthHint } = {}) {
  if (widthHint !== void 0 && !_warnedLegacyResolverWidthHint) {
    _warnedLegacyResolverWidthHint = true;
    console.warn("[TunetProfile] resolveSizeProfile(widthHint) is deprecated. Width-based size selection belongs in selectProfileSize().");
  }
  const normalizedFamily = String(family || "").trim();
  const normalizedSize = normalizeSize(size) || "standard";
  const familyProfiles = SIZE_PROFILES[normalizedFamily];
  if (!familyProfiles) {
    console.warn(`[TunetProfile] Unknown family "${family}". Falling back to tile-grid standard.`);
    return { ...SIZE_PROFILES["tile-grid"].standard };
  }
  if (!familyProfiles[normalizedSize]) {
    console.warn(`[TunetProfile] Unknown size "${size}" for family "${family}". Falling back to standard.`);
    return { ...familyProfiles.standard };
  }
  return { ...familyProfiles[normalizedSize] };
}
function _setProfileVars(hostElement, profile = {}, { bridgePublicOverrides = true } = {}) {
  if (!hostElement || !hostElement.style) return;
  for (const propName of [...hostElement.style]) {
    if (propName.startsWith("--_tunet-")) hostElement.style.removeProperty(propName);
  }
  for (const [key, cssVar] of Object.entries(TOKEN_MAP)) {
    if (profile[key] !== void 0) hostElement.style.setProperty(cssVar, profile[key]);
  }
  if (!bridgePublicOverrides || typeof getComputedStyle !== "function") return;
  const computed = getComputedStyle(hostElement);
  for (const [publicVar, privateVar] of OVERRIDE_PAIRS) {
    const override = computed.getPropertyValue(publicVar).trim();
    if (override) hostElement.style.setProperty(privateVar, override);
  }
}
var RESET = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;
var BASE_FONT = `
  .wrap, .card-wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;
var ICON_BASE = `
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal;
    font-style: normal;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1.1;
    text-transform: none;
    letter-spacing: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
    flex-shrink: 0;
    overflow: visible;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 400;
    --ms-grad: 0;
    --ms-opsz: 24;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght), 'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-28 { font-size: 28px; width: 28px; height: 28px; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }
`;
var CARD_SURFACE = `
  .card {
    position: relative;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(var(--blur-card));
    -webkit-backdrop-filter: blur(var(--blur-card));
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: var(--card-pad, 20px);
    display: flex;
    flex-direction: column;
    transition:
      background var(--motion-surface) var(--ease-standard),
      border-color var(--motion-surface) var(--ease-standard),
      box-shadow var(--motion-surface) var(--ease-standard),
      opacity var(--motion-surface) var(--ease-standard),
      transform var(--motion-ui) var(--ease-standard);
    overflow: hidden;
  }
`;
var CARD_SURFACE_GLASS_STROKE = `
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(
      160deg,
      rgba(255,255,255, 0.60),
      rgba(255,255,255, 0.10) 40%,
      rgba(255,255,255, 0.02) 60%,
      rgba(255,255,255, 0.25)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  :host(.dark) .card::before {
    background: linear-gradient(
      160deg,
      rgba(255,255,255, 0.12),
      rgba(255,255,255, 0.03) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.06)
    );
  }
`;
var REDUCED_MOTION = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
function injectFonts() {
  if (window.__tunetFontsInjected) return;
  window.__tunetFontsInjected = true;
  const links = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" },
    { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" }
  ];
  for (const cfg of links) {
    if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
    const link = document.createElement("link");
    link.rel = cfg.rel;
    link.href = cfg.href;
    if (cfg.crossOrigin !== void 0) link.crossOrigin = cfg.crossOrigin;
    document.head.appendChild(link);
  }
}
var FONT_LINKS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
`;
function detectDarkMode(hass) {
  if (!hass?.themes) return false;
  const theme = hass.themes?.darkMode;
  if (typeof theme === "boolean") return theme;
  const selected = hass.themes?.theme;
  if (selected && selected.toLowerCase().includes("dark")) return true;
  return false;
}
function applyDarkClass(element, isDark) {
  element.classList.toggle("dark", isDark);
}
function createAxisLockedDrag(options = {}) {
  const {
    element,
    shouldStart,
    getContext,
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    onLongPress,
    deadzone = 8,
    axisBias = 1.3,
    longPressMs = 500,
    pointerCapture = false
  } = options;
  if (!element) {
    return { destroy() {
    } };
  }
  let state = null;
  const clearLongPress = () => {
    if (!state || !state.longPressTimer) return;
    clearTimeout(state.longPressTimer);
    state.longPressTimer = null;
  };
  const releaseCapture = () => {
    if (!state || !pointerCapture) return;
    const captureEl = state.captureEl;
    if (!captureEl || typeof captureEl.releasePointerCapture !== "function") return;
    try {
      if (captureEl.hasPointerCapture && captureEl.hasPointerCapture(state.pointerId)) {
        captureEl.releasePointerCapture(state.pointerId);
      }
    } catch (_) {
    }
  };
  const removeDocumentListeners = () => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerCancel);
  };
  const cleanup = () => {
    clearLongPress();
    releaseCapture();
    removeDocumentListeners();
    state = null;
  };
  const payloadFromEvent = (event) => {
    if (!state) return null;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    return {
      context: state.context,
      pointerId: state.pointerId,
      pointerType: state.pointerType,
      startX: state.startX,
      startY: state.startY,
      dx,
      dy,
      absDx,
      absDy,
      phase: state.phase
    };
  };
  const endDrag = (event, { committed = false, cancelled = false } = {}) => {
    if (!state) return;
    const wasDrag = state.phase === "drag";
    const payload = payloadFromEvent(event);
    cleanup();
    if (wasDrag && typeof onDragEnd === "function") {
      onDragEnd(event, { ...payload, committed, cancelled });
    }
  };
  function onPointerMove(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    const payload = payloadFromEvent(event);
    if (!payload) return;
    if (state.phase === "pending") {
      const traveled = Math.hypot(payload.dx, payload.dy);
      if (traveled < deadzone) return;
      clearLongPress();
      if (payload.absDy > payload.absDx * axisBias) {
        cleanup();
        return;
      }
      if (payload.absDx >= payload.absDy * axisBias) {
        state.phase = "drag";
        if (typeof onDragStart === "function") {
          onDragStart(event, { ...payload, phase: "drag" });
        }
      } else {
        cleanup();
        return;
      }
    }
    if (!state || state.phase !== "drag") return;
    if (event.cancelable) {
      event.preventDefault();
    }
    if (typeof onDragMove === "function") {
      onDragMove(event, { ...payload, phase: "drag" });
    }
  }
  function onPointerUp(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    if (state.phase === "drag") {
      endDrag(event, { committed: true, cancelled: false });
      return;
    }
    const payload = payloadFromEvent(event);
    const longPressFired = !!state.longPressFired;
    cleanup();
    if (!longPressFired && typeof onTap === "function") {
      onTap(event, payload);
    }
  }
  function onPointerCancel(event) {
    if (!state || event.pointerId !== state.pointerId) return;
    endDrag(event, { committed: false, cancelled: true });
  }
  const onPointerDown = (event) => {
    if (state) return;
    if (!event.isPrimary) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (typeof shouldStart === "function" && !shouldStart(event)) return;
    const context = typeof getContext === "function" ? getContext(event) : {};
    if (context === false) return;
    const captureEl = context && context.captureEl instanceof HTMLElement ? context.captureEl : element;
    state = {
      pointerId: event.pointerId,
      pointerType: event.pointerType || "mouse",
      startX: event.clientX,
      startY: event.clientY,
      phase: "pending",
      context,
      captureEl,
      longPressTimer: null,
      longPressFired: false
    };
    if (pointerCapture && captureEl && typeof captureEl.setPointerCapture === "function") {
      try {
        captureEl.setPointerCapture(event.pointerId);
      } catch (_) {
      }
    }
    if (typeof onLongPress === "function" && longPressMs > 0) {
      state.longPressTimer = setTimeout(() => {
        if (!state || state.phase !== "pending") return;
        state.longPressFired = true;
        const payload = {
          context: state.context,
          pointerId: state.pointerId,
          pointerType: state.pointerType,
          startX: state.startX,
          startY: state.startY,
          dx: 0,
          dy: 0,
          absDx: 0,
          absDy: 0,
          phase: state.phase
        };
        onLongPress(event, payload);
        cleanup();
      }, longPressMs);
    }
    document.addEventListener("pointermove", onPointerMove, { passive: false });
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerCancel);
  };
  element.addEventListener("pointerdown", onPointerDown);
  return {
    destroy() {
      cleanup();
      element.removeEventListener("pointerdown", onPointerDown);
    }
  };
}
function renderConfigPlaceholder(shadowRoot, message, cardName) {
  if (!shadowRoot) return;
  shadowRoot.innerHTML = `
    <style>
      :host { display: block; }
      .config-prompt {
        padding: 1.5em;
        text-align: center;
        font-family: var(--ha-card-header-font-family, 'DM Sans', sans-serif);
        color: var(--primary-text-color, #1e293b);
        background: var(--ha-card-background, rgba(255,255,255,0.68));
        border-radius: var(--ha-card-border-radius, 1em);
        border: 1px dashed var(--divider-color, rgba(0,0,0,0.12));
      }
      .config-prompt .name {
        font-weight: 600;
        font-size: 0.875em;
        margin-bottom: 0.5em;
        opacity: 0.7;
      }
      .config-prompt .message {
        font-size: 0.8125em;
        opacity: 0.55;
      }
    </style>
    <div class="config-prompt">
      ${cardName ? `<div class="name">${cardName}</div>` : ""}
      <div class="message">${message}</div>
    </div>
  `;
}
function registerCard(tagName, cardClass, meta) {
  if (!customElements.get(tagName)) {
    customElements.define(tagName, cardClass);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === tagName)) {
    window.customCards.push({
      type: tagName,
      preview: true,
      ...meta
    });
  }
}
function logCardVersion(name, version, color = "#D4850A") {
  const lightBg = color + "20";
  console.info(
    `%c ${name} %c v${version} `,
    `color: #fff; background: ${color}; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `color: ${color}; background: ${lightBg}; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;`
  );
}

// Dashboard/Tunet/Cards/v3/tunet_lighting_card.js
var CARD_VERSION = "3.5.0";
function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}
function normalizeColumnBreakpoints(raw) {
  const parsed = [];
  const pushRule = (rule) => {
    if (!rule || typeof rule !== "object") return;
    const columns = clampInt(rule.columns, 2, 8, NaN);
    if (!Number.isFinite(columns)) return;
    const minWidth = Number.isFinite(Number(rule.min_width)) ? Math.max(0, Number(rule.min_width)) : null;
    const maxWidth = Number.isFinite(Number(rule.max_width)) ? Math.max(0, Number(rule.max_width)) : null;
    if (minWidth == null && maxWidth == null) return;
    parsed.push({ columns, minWidth, maxWidth });
  };
  if (Array.isArray(raw)) {
    raw.forEach((item) => pushRule(item));
  } else if (raw && typeof raw === "object") {
    for (const [key, value] of Object.entries(raw)) {
      if (key === "default") continue;
      const maxWidth = Number(key);
      const columns = clampInt(value, 2, 8, NaN);
      if (!Number.isFinite(maxWidth) || !Number.isFinite(columns)) continue;
      parsed.push({ columns, minWidth: null, maxWidth });
    }
    if (Object.prototype.hasOwnProperty.call(raw, "default")) {
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
var LIGHTING_STYLES = `
${TOKENS}
${TOKENS_MIDNIGHT}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* \u2500\u2500 Lighting-specific token overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 Card surface overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .card {
    width: 100%;
    max-width: 100%;
    overflow: visible;
    padding: var(--_tunet-card-pad, var(--card-pad, 20px));
  }

  /* \u2500\u2500 Card state tint (Design Language \xA73.3) \u2500\u2500\u2500 */
  .card[data-any-on="true"] {
    border-color: rgba(212,133,10, 0.14);
  }
  :host(.dark) .card[data-any-on="true"] {
    border-color: rgba(251,191,36, 0.22);
  }

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     SECTION SURFACE (alternative container mode)
     surface: 'section' config option
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
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

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     HEADER (Design Language \xA75)
     Info tile + spacer + toggles
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: var(--_tunet-section-gap, 16px);
  }
  :host([use-profiles]) .hdr {
    min-height: var(--_tunet-header-height, 0px);
  }

  /* Info Tile (\xA75.2) \u2013 tappable entity identifier */
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

  /* Entity Icon (\xA75.3) */
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

  /* Title & Subtitle (\xA75.4) */
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

  /* Spacer (\xA75.5) */
  .hdr-spacer { flex: 1; }

  /* \u2500\u2500 Pagination Dots (scroll mode) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 Toggle Button (\xA75.6) \u2013 Adaptive lighting \u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     TILE GRID (Design Language \xA73.5)
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */

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

  /* Max rows constraint \u2014 JS limits tile count in _render() instead
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

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     LIGHT TILE (Design Language \xA73.5 Tile Surface)
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
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

  /* \u2500\u2500 Off State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .l-tile.off { opacity: 1; }
  .l-tile.off .tile-icon-wrap {
    background: var(--gray-ghost);
    color: var(--text-muted);
    border: 1px solid var(--ctrl-border);
  }
  .l-tile.off .zone-name { color: var(--text-sub); }
  .l-tile.off .zone-val { color: var(--text-sub); opacity: 0.5; }
  .l-tile.off .progress-fill { opacity: 0; }

  /* \u2500\u2500 Unavailable State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 On State \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 Sliding State (drag active) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .l-tile.sliding {
    transform: scale(var(--drag-scale));
    box-shadow: var(--shadow-up);
    z-index: 100;
    border-color: var(--amber) !important;
    overflow: visible;
    transition: none;
  }

  /* Floating pill \u2013 .zone-val repositions during slide */
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

  /* \u2500\u2500 Tile Content \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 Progress Track (bottom inset) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2500\u2500 Manual Override Dot \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     ACCESSIBILITY (Design Language \xA711)
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
${REDUCED_MOTION}

  /* \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550
     RESPONSIVE (Design Language \xA74.6)
     \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
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
var LIGHTING_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card">

      <!-- Header (Design Language \xA75) -->
      <div class="hdr">

        <!-- Info Tile (\xA75.2) -->
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

        <!-- Adaptive Lighting Toggle (\xA75.6) -->
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
var TunetLightingCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._resolvedZones = [];
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
  static get configurable() {
    return true;
  }
  static getConfigElement() {
    return document.createElement("tunet-lighting-card-editor");
  }
  static getStubConfig() {
    return { entities: [], name: "Lighting", use_profiles: true };
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
          icon: override && override.icon ? override.icon : null
        });
      }
    }
    const normalizedEntities = Array.isArray(config.entities) ? config.entities.filter(Boolean) : legacyEntities;
    const normalizedZones = Array.isArray(config.zones) ? config.zones.filter(Boolean) : legacyZones;
    const hasZones = normalizedZones.length > 0;
    const hasEntities = normalizedEntities.length > 0;
    if (!hasZones && !hasEntities) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Add light entities via zones or entities config", "Lighting");
      return;
    }
    const asFinite = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };
    const columns = clampInt(config.columns, 2, 8, 3);
    const scrollRows = clampInt(config.scroll_rows, 1, 3, 2);
    const layout = config.layout === "scroll" ? "scroll" : "grid";
    const surface = config.surface === "section" || config.surface === "tile" ? config.surface : "card";
    const tileSizeRaw = String(config.tile_size || "standard").toLowerCase();
    const tileSize = tileSizeRaw === "compact" ? "compact" : tileSizeRaw === "large" ? "large" : "standard";
    const useProfiles = config.use_profiles !== false;
    const expandGroups = config.expand_groups !== false;
    const showAdaptiveToggle = config.show_adaptive_toggle !== false;
    const showManualReset = config.show_manual_reset !== false;
    const adaptiveEntities = Array.from(new Set(
      (Array.isArray(config.adaptive_entities) ? config.adaptive_entities : []).filter(Boolean)
    ));
    const columnBreakpoints = normalizeColumnBreakpoints(config.column_breakpoints);
    const rows = config.rows === "auto" || config.rows == null ? null : (() => {
      const parsed = asFinite(config.rows, 0);
      if (parsed <= 0) return null;
      return Math.max(1, Math.min(6, Math.round(parsed)));
    })();
    this._config = {
      entities: hasEntities ? normalizedEntities : [],
      zones: hasZones ? normalizedZones : [],
      name: config.name || "Lighting",
      subtitle: config.subtitle || "",
      primary_entity: config.primary_entity || "",
      adaptive_entity: config.adaptive_entity || "",
      adaptive_entities: adaptiveEntities,
      show_adaptive_toggle: showAdaptiveToggle,
      show_manual_reset: showManualReset,
      columns,
      column_breakpoints: columnBreakpoints,
      layout,
      scroll_rows: scrollRows,
      surface,
      tile_size: tileSize,
      use_profiles: useProfiles,
      expand_groups: expandGroups,
      rows,
      custom_css: config.custom_css || ""
    };
    if (layout === "scroll") {
      this.setAttribute("layout", "scroll");
    } else {
      this.removeAttribute("layout");
    }
    if (surface === "section" || surface === "tile") {
      this.setAttribute("surface", surface);
    } else {
      this.removeAttribute("surface");
    }
    if (useProfiles) this.setAttribute("use-profiles", "");
    else this.removeAttribute("use-profiles");
    if (rows) {
      this.setAttribute("data-max-rows", rows);
      this.style.setProperty("--max-rows", rows);
    } else {
      this.removeAttribute("data-max-rows");
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
    for (const ae of this._config.adaptive_entities || []) {
      if (oldH.states[ae] !== newH.states[ae]) return true;
    }
    const legacyAdaptive = this._config.adaptive_entity;
    if (legacyAdaptive && oldH.states[legacyAdaptive] !== newH.states[legacyAdaptive]) return true;
    for (const key of Object.keys(newH.states)) {
      if (key.startsWith("switch.adaptive_lighting_") && oldH.states[key] !== newH.states[key]) return true;
    }
    return false;
  }
  getCardSize() {
    if (this._config.layout === "scroll") {
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
      rows: "auto",
      min_rows: 2,
      max_rows: 12
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
    if (size === "compact" || size === "large") this.setAttribute("tile-size", size);
    else this.removeAttribute("tile-size");
  }
  _applyProfile(widthHint = null) {
    const useProfiles = this._config.use_profiles !== false;
    if (!useProfiles) {
      this._profileSelection = null;
      _setProfileVars(this, {}, { bridgePublicOverrides: false });
      this.removeAttribute("profile-family");
      this.removeAttribute("profile-size");
      this._setLegacyTileSizeAttr(this._config.tile_size || "standard");
      return;
    }
    const width = this._getHostWidth(widthHint);
    const selection = selectProfileSize({
      preset: "lighting",
      layout: this._config.layout || "grid",
      widthHint: width,
      userSize: this._config.tile_size
    });
    const profile = resolveSizeProfile(selection);
    this._profileSelection = selection;
    _setProfileVars(this, profile);
    this.setAttribute("profile-family", selection.family);
    this.setAttribute("profile-size", selection.size);
    this._setLegacyTileSizeAttr(selection.size);
  }
  /* ═══════════════════════════════════════════════════
     ZONE RESOLUTION – Three entity patterns
     ═══════════════════════════════════════════════════ */
  _resolveZones() {
    const zones = [];
    const seen = /* @__PURE__ */ new Set();
    const addZone = (entity, name, icon) => {
      if (seen.has(entity)) return;
      seen.add(entity);
      zones.push({ entity, name: name || null, icon: icon || null });
    };
    for (const z of this._config.zones) {
      if (typeof z === "string") {
        this._expandEntity(z, zones, seen);
      } else if (z && z.entity) {
        const entity = this._hass ? this._hass.states[z.entity] : null;
        if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id && Array.isArray(entity.attributes.entity_id)) {
          for (const memberId of entity.attributes.entity_id) {
            addZone(memberId, null, null);
          }
        } else {
          addZone(z.entity, z.name || null, z.icon || null);
        }
      }
    }
    for (const id of this._config.entities) {
      this._expandEntity(id, zones, seen);
    }
    this._resolvedZones = zones;
  }
  _expandEntity(id, zones, seen) {
    if (seen.has(id)) return;
    const entity = this._hass ? this._hass.states[id] : null;
    if (this._config.expand_groups && entity && entity.attributes && entity.attributes.entity_id && Array.isArray(entity.attributes.entity_id)) {
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
    if (typeof ResizeObserver === "undefined") {
      this._usingWindowResizeFallback = true;
      window.addEventListener("resize", this._onWindowResize);
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
      window.removeEventListener("resize", this._onWindowResize);
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
    if (this._resizeObserver || typeof ResizeObserver === "undefined") return;
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
    const prevProfileSize = this._profileSelection?.size || "";
    this._applyProfile(width);
    const profileChanged = (this._profileSelection?.size || "") !== prevProfileSize;
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
    const style = document.createElement("style");
    style.textContent = LIGHTING_STYLES;
    this.shadowRoot.appendChild(style);
    this._customStyleEl = document.createElement("style");
    this._customStyleEl.textContent = this._config.custom_css || "";
    this.shadowRoot.appendChild(this._customStyleEl);
    const tpl = document.createElement("template");
    tpl.innerHTML = LIGHTING_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      card: this.shadowRoot.querySelector(".card"),
      infoTile: this.shadowRoot.getElementById("infoTile"),
      entityIcon: this.shadowRoot.getElementById("entityIcon"),
      entityGlyph: this.shadowRoot.getElementById("entityGlyph"),
      hdrTitle: this.shadowRoot.getElementById("hdrTitle"),
      hdrSub: this.shadowRoot.getElementById("hdrSub"),
      headerDots: this.shadowRoot.getElementById("headerDots"),
      manualResetWrap: this.shadowRoot.getElementById("manualResetWrap"),
      manualResetBtn: this.shadowRoot.getElementById("manualResetBtn"),
      adaptiveWrap: this.shadowRoot.getElementById("adaptiveWrap"),
      adaptiveBtn: this.shadowRoot.getElementById("adaptiveBtn"),
      manualBadge: this.shadowRoot.getElementById("manualBadge"),
      lightGrid: this.shadowRoot.getElementById("lightGrid")
    };
    const width = this._getHostWidth();
    this._activeColumns = this._resolveResponsiveColumns(width);
    this._widthBucket440 = this._isWidthAtMost(440, width);
    this._widthBucket640 = this._isWidthAtMost(640, width);
  }
  _buildGrid() {
    const grid = this.$.lightGrid;
    if (!grid) return;
    grid.innerHTML = "";
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || "";
    const activeColumns = this._activeColumns || this._config.columns || 3;
    const activeTileSize = this._profileSelection?.size || this._config.tile_size || "standard";
    const useProfiles = this._config.use_profiles !== false;
    grid.style.setProperty("--cols", activeColumns);
    grid.style.setProperty("--scroll-rows", this._config.scroll_rows);
    if (!useProfiles && activeTileSize === "compact" && activeColumns >= 5) {
      this.setAttribute("dense-compact", "");
    } else {
      this.removeAttribute("dense-compact");
    }
    const isMobile = this._widthBucket440 == null ? this._isWidthAtMost(440) : this._widthBucket440;
    const rowHeight = useProfiles ? "max(var(--_tunet-tile-min-h, 110px), 6.25em)" : activeTileSize === "compact" ? isMobile ? "94px" : "100px" : activeTileSize === "large" ? isMobile ? "124px" : "132px" : isMobile ? "102px" : "110px";
    grid.style.setProperty("--grid-row", rowHeight);
    const cols = activeColumns;
    const maxRows = parseInt(this._config.rows, 10);
    const maxTiles = maxRows > 0 && this._config.layout !== "scroll" ? maxRows * cols : Infinity;
    const visibleZones = this._resolvedZones.slice(0, maxTiles);
    for (const zone of visibleZones) {
      const tile = document.createElement("div");
      tile.className = "l-tile off";
      tile.dataset.entity = zone.entity;
      tile.dataset.brightness = "0";
      tile.setAttribute("role", "slider");
      tile.setAttribute("aria-label", this._zoneName(zone));
      tile.setAttribute("aria-valuemin", "0");
      tile.setAttribute("aria-valuemax", "100");
      tile.setAttribute("aria-valuenow", "0");
      tile.setAttribute("tabindex", "0");
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
    this._tiles = {};
    grid.querySelectorAll(".l-tile").forEach((tile) => {
      this._tiles[tile.dataset.entity] = {
        el: tile,
        icon: tile.querySelector(".tile-icon-wrap .icon"),
        iconW: tile.querySelector(".tile-icon-wrap"),
        name: tile.querySelector(".zone-name"),
        val: tile.querySelector(".zone-val"),
        fill: tile.querySelector(".progress-fill")
      };
    });
    this._buildDots();
  }
  _buildDots() {
    const dots = this.$.headerDots;
    dots.innerHTML = "";
    if (this._config.layout !== "scroll") return;
    const totalTiles = this._resolvedZones.length;
    const rows = this._config.scroll_rows;
    const tilesPerPage = rows * 3;
    const pages = Math.max(1, Math.ceil(totalTiles / tilesPerPage));
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement("div");
      dot.className = "dot" + (i === 0 ? " active" : "");
      dots.appendChild(dot);
    }
  }
  /* ═══════════════════════════════════════════════════
     LISTENERS
     ═══════════════════════════════════════════════════ */
  _setupListeners() {
    this.$.infoTile.addEventListener("click", () => {
      const entityId = this._config.primary_entity || (this._config.entities.length > 0 ? this._config.entities[0] : "") || (this._resolvedZones.length > 0 ? this._resolvedZones[0].entity : "");
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId }
      }));
    });
    this.$.adaptiveBtn.addEventListener("click", () => this._toggleAdaptive());
    this.$.manualResetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._resetManualControl();
    });
    this._initTileDrag();
    this.$.lightGrid.addEventListener("keydown", (e) => {
      const tile = e.target.closest(".l-tile");
      if (!tile) return;
      const entity = tile.dataset.entity;
      const step = e.shiftKey ? 10 : 5;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        this._setBrightness(entity, Math.min(100, this._getBrightness(entity) + step));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        this._setBrightness(entity, Math.max(0, this._getBrightness(entity) - step));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._toggleLight(entity);
      }
    });
    if (this._config.layout === "scroll") {
      this.$.lightGrid.addEventListener("scroll", () => {
        const grid = this.$.lightGrid;
        const dots = this.$.headerDots.querySelectorAll(".dot");
        if (!dots.length) return;
        const scrollMax = grid.scrollWidth - grid.clientWidth;
        if (scrollMax <= 0) return;
        const pct = grid.scrollLeft / scrollMax;
        const idx = Math.round(pct * (dots.length - 1));
        dots.forEach((d, i) => d.classList.toggle("active", i === idx));
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
      shouldStart: (event) => !!event.target.closest(".l-tile"),
      getContext: (event) => {
        const tileEl = event.target.closest(".l-tile");
        if (!tileEl) return false;
        const entity = tileEl.dataset.entity;
        if (!entity) return false;
        return {
          tileEl,
          entity,
          pointerType: event.pointerType || "mouse",
          startBright: parseInt(tileEl.dataset.brightness, 10) || 0,
          currentBright: parseInt(tileEl.dataset.brightness, 10) || 0
        };
      },
      onDragStart: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx || !ctx.tileEl) return;
        ctx.tileEl.classList.add("sliding");
        document.body.style.cursor = "grabbing";
        if (this._config.layout === "scroll") {
          this.$.lightGrid.style.scrollSnapType = "none";
        }
      },
      onDragMove: (event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx || !ctx.tileEl) return;
        const refs = this._tiles[ctx.entity];
        if (!refs) return;
        const width = Math.max(ctx.tileEl.offsetWidth, 1);
        const dragRange = ctx.pointerType === "touch" ? Math.max(width * 0.82, 110) : Math.max(width * 1.2, 185);
        const dragGain = ctx.pointerType === "touch" ? 1.12 : 0.95;
        const change = payload.dx / dragRange * 100 * dragGain;
        const newBrt = Math.round(Math.max(0, Math.min(100, ctx.startBright + change)));
        if (newBrt === ctx.currentBright) return;
        if (event.cancelable) event.preventDefault();
        refs.fill.style.transition = "none";
        refs.fill.style.width = `${newBrt}%`;
        refs.val.textContent = newBrt > 0 ? `${newBrt}%` : "Off";
        if (newBrt > 0) {
          refs.el.classList.remove("off");
          refs.el.classList.add("on");
        } else {
          refs.el.classList.remove("on");
          refs.el.classList.add("off");
        }
        refs.el.dataset.brightness = String(newBrt);
        refs.el.setAttribute("aria-valuenow", String(newBrt));
        refs.el.setAttribute("aria-valuetext", newBrt > 0 ? `${newBrt} percent` : "Off");
        ctx.currentBright = newBrt;
      },
      onDragEnd: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        const refs = this._tiles[ctx.entity];
        if (refs) {
          refs.el.classList.remove("sliding");
          refs.fill.style.transition = "";
        }
        document.body.style.cursor = "";
        if (this._config.layout === "scroll") {
          this.$.lightGrid.style.scrollSnapType = "x mandatory";
        }
        if (payload.committed) {
          this._setBrightness(ctx.entity, ctx.currentBright);
        }
      },
      onTap: (_event, payload) => {
        const ctx = payload && payload.context;
        if (!ctx) return;
        this._toggleLight(ctx.entity);
      }
    });
  }
  /* ═══════════════════════════════════════════════════
     STATE HELPERS
     ═══════════════════════════════════════════════════ */
  _getEntity(id) {
    return this._hass ? this._hass.states[id] : null;
  }
  _getBrightness(id) {
    const e = this._getEntity(id);
    if (!e || e.state !== "on") return 0;
    const b = e.attributes.brightness;
    return b != null ? Math.round(b / 255 * 100) : 100;
  }
  _friendlyName(id) {
    const e = this._getEntity(id);
    if (e && e.attributes.friendly_name) return e.attributes.friendly_name;
    const raw = id.split(".").pop().replace(/_/g, " ");
    return raw.replace(/\b\w/g, (c) => c.toUpperCase());
  }
  _zoneName(zone) {
    if (zone.name) return zone.name;
    return this._friendlyName(zone.entity);
  }
  _normalizeIcon(icon) {
    if (!icon) return "lightbulb";
    const raw = String(icon).replace(/^mdi:/, "").trim();
    const map = {
      light_group: "lightbulb",
      shelf_auto: "shelves",
      countertops: "kitchen",
      desk_lamp: "desk",
      lamp: "table_lamp",
      table_lamp: "table_lamp",
      floor_lamp: "floor_lamp"
    };
    const resolved = map[raw] || raw;
    if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return "lightbulb";
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
        "mdi:ceiling-light": "light",
        "mdi:lamp": "table_lamp",
        "mdi:floor-lamp": "floor_lamp",
        "mdi:floor-lamp-outline": "floor_lamp",
        "mdi:desk-lamp": "desk",
        "mdi:lightbulb": "lightbulb",
        "mdi:lightbulb-group": "lightbulb",
        "mdi:led-strip": "highlight",
        "mdi:light-recessed": "fluorescent",
        "mdi:wall-sconce": "wall_lamp",
        "mdi:wall-sconce-round-variant": "wall_lamp",
        "mdi:chandelier": "lightbulb",
        "mdi:track-light": "highlight",
        "mdi:outdoor-lamp": "deck",
        "mdi:heat-wave": "highlight"
      };
      if (map[e.attributes.icon]) return map[e.attributes.icon];
    }
    return "lightbulb";
  }
  /* ── Manual Control Detection ───────────────────── */
  _zoneEntitySet() {
    const set = /* @__PURE__ */ new Set();
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
    const explicit = Array.isArray(this._config.adaptive_entities) ? this._config.adaptive_entities.filter(Boolean) : [];
    if (explicit.length) return Array.from(new Set(explicit));
    const legacy = this._config.adaptive_entity ? [this._config.adaptive_entity] : [];
    const zoneSet = this._zoneEntitySet();
    const candidates = [];
    for (const key of Object.keys(this._hass.states)) {
      if (!key.startsWith("switch.adaptive_lighting_")) continue;
      const sw = this._hass.states[key];
      const lights = sw?.attributes?.lights;
      if (Array.isArray(lights) && lights.some((eid) => zoneSet.has(eid))) {
        candidates.push(key);
      }
    }
    if (candidates.length) return Array.from(new Set(candidates));
    if (legacy.length) return legacy;
    const allAdaptive = Object.keys(this._hass.states).filter((k) => k.startsWith("switch.adaptive_lighting_"));
    if (allAdaptive.length === 1) return allAdaptive;
    return [];
  }
  _getManuallyControlled(adaptiveEntities = []) {
    if (!this._hass) return [];
    const deduped = /* @__PURE__ */ new Set();
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
      if (result && typeof result.then === "function") return result;
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
    const request = pct === 0 ? this._callService("light", "turn_off", { entity_id: id }) : this._callService("light", "turn_on", { entity_id: id, brightness_pct: pct });
    request.catch(() => this._updateAll());
  }
  _toggleAdaptive() {
    const adaptiveEntities = this._resolveAdaptiveEntities();
    if (!adaptiveEntities.length) return;
    const anyOn = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === "on");
    const targetService = anyOn ? "turn_off" : "turn_on";
    for (const entityId of adaptiveEntities) {
      const domain = entityId.split(".")[0];
      if (domain === "switch" || domain === "input_boolean") {
        this._callService("homeassistant", targetService, { entity_id: entityId });
      } else if (domain === "automation") {
        this._callService("automation", targetService, { entity_id: entityId });
      }
    }
  }
  _resetManualControl() {
    if (!this._hass) return;
    const adaptiveEntities = this._resolveAdaptiveEntities().filter(
      (entityId) => entityId.startsWith("switch.adaptive_lighting_")
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
      this._callService("adaptive_lighting", "set_manual_control", {
        entity_id: switchEntity,
        manual_control: false,
        lights: relevantLights
      });
    }
  }
  /* ═══════════════════════════════════════════════════
     TILE UI HELPER
     ═══════════════════════════════════════════════════ */
  _updateTileUI(refs, brt) {
    refs.el.dataset.brightness = brt;
    refs.fill.style.width = brt + "%";
    refs.val.textContent = brt > 0 ? brt + "%" : "Off";
    refs.el.classList.toggle("on", brt > 0);
    refs.el.classList.toggle("off", brt <= 0);
    refs.el.setAttribute("aria-valuenow", brt);
    refs.el.setAttribute("aria-valuetext", brt > 0 ? brt + " percent" : "Off");
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
      const refs = this._tiles[zone.entity];
      if (!refs) continue;
      const isUnavailable = !entity || entity.state === "unavailable";
      const isOn = entity && entity.state === "on";
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
        refs.el.classList.add("unavailable");
        this._updateTileUI(refs, 0);
        refs.val.textContent = "Unavailable";
        refs.el.setAttribute("aria-valuetext", "Unavailable");
        refs.name.textContent = this._zoneName(zone);
        refs.el.dataset.manual = "false";
        continue;
      }
      refs.el.classList.remove("unavailable");
      this._updateTileUI(refs, isOn ? bright : 0);
      refs.name.textContent = this._zoneName(zone);
      const isManual = this._isZoneManual(zone, manualSet);
      if (isManual) manualZoneCount++;
      refs.el.dataset.manual = isManual ? "true" : "false";
    }
    const anyOn = onCount > 0;
    this.$.card.dataset.anyOn = anyOn ? "true" : "false";
    this.$.card.dataset.allOff = onCount === 0 && totalCount > 0 ? "true" : "false";
    if (anyOn) {
      this.$.entityGlyph.classList.add("filled");
      this.$.entityIcon.style.color = "";
    } else {
      this.$.entityGlyph.classList.remove("filled");
      this.$.entityIcon.style.color = "";
    }
    this.$.hdrTitle.textContent = this._config.name;
    if (this._config.subtitle) {
      this.$.hdrSub.innerHTML = this._config.subtitle;
    } else {
      const avgBrt = onCount > 0 ? Math.round(totalBrightness / onCount) : 0;
      const adaptiveAnyOn2 = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === "on");
      const compactSubtitle = this._widthBucket640 == null ? this._isWidthAtMost(640) : this._widthBucket640;
      const manualCount = manualScoped.length;
      let parts = [];
      if (onCount === 0) {
        parts.push("All off");
      } else if (onCount === totalCount) {
        parts.push(`<span class="amber-ic">All on</span>`);
        parts.push(`${avgBrt}%`);
      } else {
        parts.push(`<span class="amber-ic">${onCount} on</span>`);
        parts.push(`${avgBrt}%`);
      }
      if (manualCount > 0) {
        parts.push(`<span class="red-ic">${manualCount} manual</span>`);
      } else if (adaptiveAnyOn2 && !compactSubtitle) {
        parts.push('<span class="adaptive-ic">Adaptive</span>');
      }
      this.$.hdrSub.innerHTML = parts.join(" \xB7 ");
    }
    const hasAdaptiveTargets = adaptiveEntities.length > 0;
    const adaptiveAnyOn = adaptiveEntities.some((entityId) => this._getEntity(entityId)?.state === "on");
    if (this._config.show_adaptive_toggle && hasAdaptiveTargets) {
      this.$.adaptiveWrap.classList.remove("hidden");
      this.$.adaptiveBtn.classList.remove("hidden");
      this.$.adaptiveBtn.classList.toggle("on", adaptiveAnyOn);
      this.$.adaptiveBtn.setAttribute("aria-pressed", adaptiveAnyOn ? "true" : "false");
    } else {
      this.$.adaptiveBtn.classList.add("hidden");
      this.$.adaptiveWrap.classList.add("hidden");
    }
    const showManualReset = this._config.show_manual_reset && hasAdaptiveTargets && manualZoneCount > 0;
    this.$.manualResetWrap.classList.toggle("hidden", !showManualReset);
    this.$.manualResetBtn.classList.toggle("hidden", !showManualReset);
    this.$.manualResetWrap.classList.toggle("has-manual", showManualReset);
    this.$.manualBadge.textContent = String(manualScoped.length);
  }
};
var LIGHTING_EDITOR_SCHEMA = [
  { name: "entities", selector: { entity: { multiple: true, filter: [{ domain: "light" }] } } },
  {
    name: "zones",
    selector: {
      object: {
        multiple: true,
        label_field: "name",
        description_field: "entity",
        fields: {
          entity: { label: "Entity", required: true, selector: { entity: { filter: [{ domain: "light" }] } } },
          name: { label: "Name", selector: { text: {} } },
          icon: { label: "Icon", selector: { text: {} } }
        }
      }
    }
  },
  { name: "name", selector: { text: {} } },
  { name: "primary_entity", selector: { entity: {} } },
  { name: "adaptive_entities", selector: { entity: { multiple: true, filter: [{ domain: "switch" }, { domain: "automation" }, { domain: "input_boolean" }] } } },
  { name: "show_adaptive_toggle", selector: { boolean: {} } },
  { name: "show_manual_reset", selector: { boolean: {} } },
  { name: "surface", selector: { select: { options: ["card", "section", "tile"] } } },
  { name: "layout", selector: { select: { options: ["grid", "scroll"] } } },
  { name: "columns", selector: { number: { min: 2, max: 8, step: 1, mode: "box" } } },
  {
    name: "column_breakpoints",
    selector: {
      object: {
        multiple: true,
        label_field: "columns",
        fields: {
          min_width: { label: "Min Width (px)", selector: { number: { min: 0, max: 4e3, step: 1, mode: "box" } } },
          max_width: { label: "Max Width (px)", selector: { number: { min: 0, max: 4e3, step: 1, mode: "box" } } },
          columns: { label: "Columns", required: true, selector: { number: { min: 2, max: 8, step: 1, mode: "box" } } }
        }
      }
    }
  },
  { name: "scroll_rows", selector: { number: { min: 1, max: 3, step: 1, mode: "box" } } },
  { name: "rows", selector: { text: {} } },
  { name: "tile_size", selector: { select: { options: ["standard", "compact", "large"] } } },
  { name: "use_profiles", selector: { boolean: {} } },
  { name: "expand_groups", selector: { boolean: {} } },
  { name: "custom_css", selector: { text: { multiline: true } } }
];
var LIGHTING_EDITOR_LABELS = {
  entities: "Light Entities (groups auto-expand)",
  zones: "Zones (per-entity name/icon)",
  name: "Card Title",
  primary_entity: "Primary Entity (info tile)",
  adaptive_entities: "Adaptive Entities",
  show_adaptive_toggle: "Show Adaptive Toggle",
  show_manual_reset: "Show Manual Reset",
  surface: "Surface Style",
  layout: "Layout Mode",
  columns: "Grid Columns",
  column_breakpoints: "Responsive Breakpoints",
  scroll_rows: "Scroll Rows",
  rows: "Max Rows",
  tile_size: "Tile Size",
  use_profiles: "Use Profile Sizing",
  expand_groups: "Expand Group Entities",
  custom_css: "Custom CSS"
};
var TunetLightingCardEditor = class extends HTMLElement {
  setConfig(config) {
    this._config = { ...config };
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    if (this._form) this._form.hass = hass;
  }
  _render() {
    if (!this._config) return;
    if (!this._form) {
      this.innerHTML = "";
      const form = document.createElement("ha-form");
      form.schema = LIGHTING_EDITOR_SCHEMA;
      form.computeLabel = (s) => LIGHTING_EDITOR_LABELS[s.name] || s.name || "";
      form.computeHelper = (s) => ({
        zones: "Optional per-entity overrides (name, icon). If empty, entities list is used.",
        adaptive_entities: "If omitted, auto-discovers adaptive_lighting switches.",
        column_breakpoints: "Responsive rules: columns + min_width or max_width.",
        custom_css: "Injected into shadow DOM. Targets: .light-grid, .l-tile, etc."
      })[s.name] || "";
      form.addEventListener("value-changed", (ev) => {
        const updated = { ...this._config, ...ev.detail.value };
        this._config = updated;
        this.dispatchEvent(new CustomEvent("config-changed", {
          bubbles: true,
          composed: true,
          detail: { config: updated }
        }));
      });
      this._form = form;
      this.appendChild(form);
    }
    this._form.data = this._config;
    if (this._hass) this._form.hass = this._hass;
  }
};
if (!customElements.get("tunet-lighting-card-editor")) {
  customElements.define("tunet-lighting-card-editor", TunetLightingCardEditor);
}
registerCard("tunet-lighting-card", TunetLightingCard, {
  name: "Tunet Lighting Card",
  description: "Glassmorphism lighting controller - drag-to-dim, floating pill, adaptive toggle, grid/scroll layout, rich zone config",
  documentationURL: "https://github.com/tunet/tunet-lighting-card"
});
logCardVersion("TUNET-LIGHTING", CARD_VERSION, "#D4850A");
//# sourceMappingURL=tunet_lighting_card.js.map
