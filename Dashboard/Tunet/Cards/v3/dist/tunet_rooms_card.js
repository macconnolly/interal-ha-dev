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
var SECTION_SURFACE = `
  .section-container {
    border-radius: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(var(--blur-section));
    -webkit-backdrop-filter: blur(var(--blur-section));
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
    padding: var(--section-pad, 20px);
    display: flex;
    flex-direction: column;
    gap: var(--section-gap);
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
var RESPONSIVE_BASE = `
  @container (max-width: 440px) {
    :host {
      -webkit-text-size-adjust: 100%;
      text-size-adjust: 100%;
      --card-pad: var(--density-mobile-card-pad, 14px);
      --section-pad: var(--density-mobile-section-pad, 14px);
      --tile-pad: var(--density-mobile-tile-pad, 10px);
      --tile-gap: var(--density-mobile-tile-gap, 4px);
      --ctrl-min-h: var(--density-mobile-ctrl-min-h, 38px);
      --ctrl-font-size: var(--density-mobile-ctrl-font, 12px);
      --ctrl-pad-x: var(--density-mobile-ctrl-pad-x, 10px);
      --dd-option-font-size: var(--density-mobile-dd-font, 12px);
      --dd-option-pad-y: var(--density-mobile-dd-pad-y, 8px);
      --dd-option-pad-x: var(--density-mobile-dd-pad-x, 10px);
      --rooms-row-btn-size: var(--density-mobile-rooms-row-btn-size, 3.4em);
      --rooms-row-btn-icon-size: var(--density-mobile-rooms-row-btn-icon-size, 1.76em);
      --rooms-row-btn-size-slim: var(--density-mobile-rooms-row-btn-size-slim, 2.96em);
      --rooms-row-btn-icon-size-slim: var(--density-mobile-rooms-row-btn-icon-size-slim, 1.56em);
      --rooms-all-toggle-min-h: var(--density-mobile-rooms-all-toggle-min-h, 2.62em);
      --rooms-all-toggle-min-w: var(--density-mobile-rooms-all-toggle-min-w, 6.96em);
      --rooms-all-toggle-font: var(--density-mobile-rooms-all-toggle-font, 0.84em);
      --rooms-all-toggle-icon: var(--density-mobile-rooms-all-toggle-icon, 1.26em);
      --type-label: var(--type-label-mobile, 13px);
      --type-sub: var(--type-sub-mobile, 11.5px);
      --type-value: var(--type-value-mobile, 18px);
      --type-chip: var(--type-chip-mobile, 13px);
      --type-row-title: var(--type-row-title-mobile, 18px);
      --type-row-status: var(--type-row-status-mobile, 15.5px);
    }
    .card { padding: var(--card-pad); }
    .section-container { padding: var(--section-pad); border-radius: 24px; }
    .tile { padding: var(--tile-pad); gap: var(--tile-gap); }
  }

  @supports not (container-type: inline-size) {
    @media (max-width: 440px) {
      :host {
        -webkit-text-size-adjust: 100%;
        text-size-adjust: 100%;
        --card-pad: var(--density-mobile-card-pad, 14px);
        --section-pad: var(--density-mobile-section-pad, 14px);
        --tile-pad: var(--density-mobile-tile-pad, 10px);
        --tile-gap: var(--density-mobile-tile-gap, 4px);
        --ctrl-min-h: var(--density-mobile-ctrl-min-h, 38px);
        --ctrl-font-size: var(--density-mobile-ctrl-font, 12px);
        --ctrl-pad-x: var(--density-mobile-ctrl-pad-x, 10px);
        --dd-option-font-size: var(--density-mobile-dd-font, 12px);
        --dd-option-pad-y: var(--density-mobile-dd-pad-y, 8px);
        --dd-option-pad-x: var(--density-mobile-dd-pad-x, 10px);
        --rooms-row-btn-size: var(--density-mobile-rooms-row-btn-size, 3.4em);
        --rooms-row-btn-icon-size: var(--density-mobile-rooms-row-btn-icon-size, 1.76em);
        --rooms-row-btn-size-slim: var(--density-mobile-rooms-row-btn-size-slim, 2.96em);
        --rooms-row-btn-icon-size-slim: var(--density-mobile-rooms-row-btn-icon-size-slim, 1.56em);
        --rooms-all-toggle-min-h: var(--density-mobile-rooms-all-toggle-min-h, 2.62em);
        --rooms-all-toggle-min-w: var(--density-mobile-rooms-all-toggle-min-w, 6.96em);
        --rooms-all-toggle-font: var(--density-mobile-rooms-all-toggle-font, 0.84em);
        --rooms-all-toggle-icon: var(--density-mobile-rooms-all-toggle-icon, 1.26em);
        --type-label: var(--type-label-mobile, 13px);
        --type-sub: var(--type-sub-mobile, 11.5px);
        --type-value: var(--type-value-mobile, 18px);
        --type-chip: var(--type-chip-mobile, 13px);
        --type-row-title: var(--type-row-title-mobile, 18px);
        --type-row-status: var(--type-row-status-mobile, 15.5px);
      }
      .card { padding: var(--card-pad); }
      .section-container { padding: var(--section-pad); border-radius: 24px; }
      .tile { padding: var(--tile-pad); gap: var(--tile-gap); }
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
function fireEvent(element, type, detail = {}) {
  element.dispatchEvent(new CustomEvent(type, {
    bubbles: true,
    composed: true,
    detail
  }));
}
function normalizePath(value) {
  const raw = (value == null ? "" : String(value)).trim();
  if (!raw) return "";
  return raw.startsWith("/") || raw.startsWith("#") ? raw : `/${raw}`;
}
function navigatePath(path, { replace = false, sourceEl = null } = {}) {
  const normalized = normalizePath(path);
  if (!normalized) return;
  const targets = [];
  if (sourceEl && typeof sourceEl.dispatchEvent === "function") targets.push(sourceEl);
  if (document && typeof document.dispatchEvent === "function") targets.push(document);
  if (window && typeof window.dispatchEvent === "function") targets.push(window);
  for (const target of targets) {
    const navEvent = new CustomEvent("hass-navigate", {
      bubbles: true,
      composed: true,
      cancelable: true,
      detail: { path: normalized, replace }
    });
    const notCanceled = target.dispatchEvent(navEvent);
    if (!notCanceled || navEvent.defaultPrevented) return;
  }
  if (replace) {
    window.history.replaceState(null, "", normalized);
  } else {
    window.history.pushState(null, "", normalized);
  }
  window.dispatchEvent(new Event("location-changed"));
}
function runCardAction({
  element,
  hass,
  actionConfig,
  defaultEntityId = ""
} = {}) {
  if (!element || !hass || !actionConfig) return false;
  const action = actionConfig.action || "more-info";
  if (action === "none") return true;
  if (action === "more-info") {
    const entityId = actionConfig.entity || defaultEntityId;
    if (!entityId) return false;
    fireEvent(element, "hass-more-info", { entityId });
    return true;
  }
  if (action === "navigate") {
    navigatePath(actionConfig.navigation_path || actionConfig.path || "", { sourceEl: element });
    return true;
  }
  if (action === "url") {
    if (!actionConfig.url_path) return false;
    const target = String(actionConfig.url_path).trim();
    if (!target) return false;
    if (actionConfig.new_tab) {
      window.open(target, "_blank");
      return true;
    }
    if (target.startsWith("/") || target.startsWith("#")) {
      navigatePath(target, { sourceEl: element });
      return true;
    }
    window.location.assign(target);
    return true;
  }
  if (action === "call-service") {
    const service = String(actionConfig.service || "").trim();
    const [domain, serviceName] = service.split(".");
    if (!domain || !serviceName) return false;
    hass.callService(domain, serviceName, actionConfig.service_data || {});
    return true;
  }
  if (action === "fire-dom-event") {
    fireEvent(element, "ll-custom", actionConfig);
    return true;
  }
  const fallbackEntityId = actionConfig.entity || defaultEntityId;
  if (!fallbackEntityId) return false;
  fireEvent(element, "hass-more-info", { entityId: fallbackEntityId });
  return true;
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

// Dashboard/Tunet/Cards/v3/tunet_rooms_card.js
var CARD_VERSION = "3.0.0";
var ICON_ALIASES = {
  shelf_auto: "shelves",
  countertops: "kitchen",
  desk_lamp: "desk",
  lamp: "table_lamp",
  floor_lamp: "table_lamp",
  light_group: "lightbulb"
};
function normalizeIcon(icon) {
  if (!icon) return "lightbulb";
  const raw = String(icon).replace(/^mdi:/, "").trim();
  const resolved = ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return "lightbulb";
  return resolved;
}
var CARD_OVERRIDES = `
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
var CARD_STYLES = `
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
var TUNET_ROOMS_STYLES = `
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
var ROOMS_TEMPLATE = `
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
var TunetRoomsCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
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
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "layout_variant", selector: { select: { options: ["tiles", "row", "slim"] } } },
        { name: "tile_size", selector: { select: { options: ["compact", "standard", "large"] } } },
        { name: "use_profiles", selector: { boolean: {} } },
        {
          name: "rooms",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              description_field: "icon",
              fields: {
                name: {
                  label: "Room Name",
                  required: true,
                  selector: { text: {} }
                },
                icon: {
                  label: "Icon",
                  selector: { icon: {} }
                },
                navigate_path: {
                  label: "Navigate Path",
                  selector: { text: {} }
                },
                temperature_entity: {
                  label: "Temperature Sensor",
                  selector: { entity: { filter: [{ domain: "sensor" }] } }
                },
                humidity_entity: {
                  label: "Humidity Sensor",
                  selector: { entity: { filter: [{ domain: "sensor" }] } }
                },
                light_entities: {
                  label: "Lights",
                  selector: { entity: { multiple: true, filter: [{ domain: "light" }] } }
                }
              }
            }
          }
        }
      ],
      computeLabel: (s) => ({
        name: "Card Name",
        layout_variant: "Layout Variant",
        tile_size: "Tile Size",
        use_profiles: "Use Profile Sizing",
        rooms: "Rooms"
      })[s.name] || s.name,
      computeHelper: (s) => ({
        rooms: "Add rooms with lights. Per-light icon/name overrides and hold_action/tap_action are available via YAML.",
        navigate_path: "Dashboard URL path (e.g., /tunet-suite-storage/kitchen)"
      })[s.name] || ""
    };
  }
  static getStubConfig() {
    return {
      name: "Rooms",
      layout_variant: "tiles",
      tile_size: "standard",
      use_profiles: true,
      rooms: [
        {
          name: "Living Room",
          icon: "weekend",
          light_entities: ["light.living_room"]
        }
      ]
    };
  }
  setConfig(config) {
    if (!config.rooms || !Array.isArray(config.rooms) || config.rooms.length === 0) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Add rooms to get started", "Rooms");
      return;
    }
    const tileSizeRaw = String(config.tile_size || "standard").toLowerCase();
    const tileSize = tileSizeRaw === "compact" ? "compact" : tileSizeRaw === "large" ? "large" : "standard";
    const useProfiles = config.use_profiles !== false;
    this._config = {
      name: config.name || "Rooms",
      layout_variant: config.layout_variant === "row" || config.layout_variant === "slim" ? config.layout_variant : "tiles",
      tile_size: tileSize,
      use_profiles: useProfiles,
      rooms: config.rooms.map((room) => {
        const hasExplicitLights = Array.isArray(room.lights) && room.lights.length > 0;
        const hasLightEntities = Array.isArray(room.light_entities) && room.light_entities.length > 0;
        let lights;
        if (hasExplicitLights) {
          lights = room.lights.map((light) => ({
            entity: light.entity || "",
            icon: normalizeIcon(light.icon || "lightbulb"),
            name: light.name || ""
          }));
        } else if (hasLightEntities) {
          lights = room.light_entities.filter(Boolean).map((entityId) => ({
            entity: entityId,
            icon: normalizeIcon("lightbulb"),
            name: ""
          }));
        } else {
          lights = [];
        }
        return {
          name: room.name || "Room",
          icon: normalizeIcon(room.icon || "home"),
          temperature_entity: room.temperature_entity || "",
          humidity_entity: room.humidity_entity || "",
          navigate_path: room.navigate_path || "",
          tap_action: room.tap_action || null,
          hold_action: room.hold_action || null,
          lights
        };
      })
    };
    if (useProfiles) this.setAttribute("use-profiles", "");
    else this.removeAttribute("use-profiles");
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
      for (const light of room.lights || []) {
        if (light.entity && o.states[light.entity] !== n.states[light.entity]) return true;
      }
      if (room.temperature_entity && o.states[room.temperature_entity] !== n.states[room.temperature_entity]) return true;
      if (room.humidity_entity && o.states[room.humidity_entity] !== n.states[room.humidity_entity]) return true;
    }
    for (const key of Object.keys(n.states)) {
      if (key.startsWith("switch.adaptive_lighting_") && o.states[key] !== n.states[key]) return true;
    }
    return false;
  }
  getCardSize() {
    const roomCount = (this._config.rooms || []).length;
    if (this._config.layout_variant === "row" || this._config.layout_variant === "slim") {
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
      rows: "auto",
      min_rows: 2,
      max_rows: 12
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
    const layout = this._config.layout_variant === "tiles" ? "grid" : this._config.layout_variant;
    const selection = selectProfileSize({
      preset: "rooms",
      layout,
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
    this._applyProfile(widthHint);
  }
  _onWindowResize() {
    this._onHostResize(this._getHostWidth());
  }
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
    clearTimeout(this._longPressTimer);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener("resize", this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
  }
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_ROOMS_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = ROOMS_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      roomGrid: this.shadowRoot.getElementById("roomGrid"),
      sectionTitle: this.shadowRoot.getElementById("sectionTitle"),
      allToggleBtn: this.shadowRoot.getElementById("allToggleBtn"),
      manualResetBtn: this.shadowRoot.getElementById("manualResetBtn")
    };
    this._applyProfile(this._getHostWidth());
    this.$.allToggleBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._toggleAllLights();
    });
    this.$.manualResetBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._resetManualControl();
    });
  }
  _buildTiles() {
    if (this.$.sectionTitle) {
      this.$.sectionTitle.textContent = this._config.name || "Rooms";
    }
    const grid = this.$.roomGrid;
    grid.innerHTML = "";
    this._tileRefs = [];
    const isRowVariant = this._config.layout_variant === "row" || this._config.layout_variant === "slim";
    const isSlimVariant = this._config.layout_variant === "slim";
    grid.classList.toggle("row-mode", isRowVariant);
    grid.classList.toggle("slim-mode", isSlimVariant);
    if (this.$.allToggleBtn) {
      this.$.allToggleBtn.hidden = isRowVariant;
    }
    this._config.rooms.forEach((roomCfg, i) => {
      const tile = document.createElement("div");
      tile.className = "room-tile";
      if (isRowVariant) tile.classList.add("room-row");
      tile.setAttribute("tabindex", "0");
      tile.setAttribute("role", "button");
      tile.setAttribute("aria-label", roomCfg.name);
      if (isRowVariant) {
        const orbs = (roomCfg.lights || []).map((light, idx) => `
          <button type="button"
                  class="room-orb"
                  data-entity="${light.entity || ""}"
                  aria-label="Toggle ${light.name || `Light ${idx + 1}`}">
            <span class="icon">${normalizeIcon(light.icon || "lightbulb")}</span>
          </button>
        `).join("");
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
      const orbRefs = isRowVariant ? [...tile.querySelectorAll(".room-orb")].map((el) => ({ el, entity: String(el.dataset.entity || "") })).filter((ref) => !!ref.entity) : [];
      if (toggleBtn) {
        const stopBubble = (e) => e.stopPropagation();
        toggleBtn.addEventListener("pointerdown", stopBubble);
        toggleBtn.addEventListener("pointerup", stopBubble);
        toggleBtn.addEventListener("pointercancel", stopBubble);
        toggleBtn.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleRoomGroup(roomCfg);
        });
      }
      for (const orbRef of orbRefs) {
        const stopBubble = (e) => e.stopPropagation();
        orbRef.el.addEventListener("pointerdown", stopBubble);
        orbRef.el.addEventListener("pointerup", stopBubble);
        orbRef.el.addEventListener("pointercancel", stopBubble);
        orbRef.el.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          this._toggleSingleLight(orbRef.entity);
        });
      }
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
          tile.style.transform = "scale(0.9)";
          setTimeout(() => {
            tile.style.transform = "";
          }, 120);
        }, 400);
      };
      const onPointerUp = (ev) => {
        clearTimeout(pressTimer);
        if (isRowVariant) {
          const target = ev && ev.target instanceof Element ? ev.target : null;
          if (target && target.closest(".room-row-controls")) return;
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
        if (roomCfg.tap_action) {
          this._handleRoomAction(roomCfg.tap_action, roomCfg);
        } else if ((roomCfg.lights || []).length) {
          this._toggleRoomGroup(roomCfg);
        } else if (roomCfg.temperature_entity) {
          this.dispatchEvent(new CustomEvent("hass-more-info", {
            bubbles: true,
            composed: true,
            detail: { entityId: roomCfg.temperature_entity }
          }));
        }
      };
      const onPointerCancel = () => {
        clearTimeout(pressTimer);
        didLongPress = false;
      };
      tile.addEventListener("pointerdown", onPointerDown);
      tile.addEventListener("pointerup", onPointerUp);
      tile.addEventListener("pointercancel", onPointerCancel);
      tile.addEventListener("pointerleave", onPointerCancel);
      tile.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPointerUp(e);
        }
      });
      tile.addEventListener("contextmenu", (e) => e.preventDefault());
      grid.appendChild(tile);
      this._tileRefs.push({
        el: tile,
        cfg: roomCfg,
        statusEl,
        fillEl,
        toggleBtn,
        orbRefs
      });
    });
  }
  _toggleSingleLight(entityId) {
    if (!this._hass || !entityId) return;
    const entity = this._hass.states[entityId];
    const service = entity && entity.state === "on" ? "turn_off" : "turn_on";
    const result = this._hass.callService("light", service, { entity_id: entityId });
    if (result && typeof result.catch === "function") {
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
      if (state && state.state === "on") {
        anyOn = true;
        break;
      }
    }
    const service = anyOn ? "turn_off" : "turn_on";
    const result = this._hass.callService("light", service, { entity_id: entityIds });
    if (result && typeof result.catch === "function") {
      result.catch(() => this._updateAll());
    }
  }
  _setRoomGroup(roomCfg, turnOn) {
    if (!this._hass) return;
    const entityIds = (roomCfg.lights || []).map((l) => l.entity).filter(Boolean);
    if (!entityIds.length) return;
    const service = turnOn ? "turn_on" : "turn_off";
    const result = this._hass.callService("light", service, { entity_id: entityIds });
    if (result && typeof result.catch === "function") {
      result.catch(() => this._updateAll());
    }
  }
  _allRoomLightIds() {
    const ids = /* @__PURE__ */ new Set();
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
    this._hass.callService("light", service, { entity_id: entityIds });
  }
  _toggleAllLights() {
    if (!this._hass) return;
    const entityIds = this._allRoomLightIds();
    if (!entityIds.length) return;
    const anyOn = entityIds.some((eid) => this._hass.states[eid]?.state === "on");
    this._setAllLights(anyOn ? "turn_off" : "turn_on");
  }
  _resolveAdaptiveEntitiesForRooms() {
    if (!this._hass) return [];
    const zoneSet = new Set(this._allRoomLightIds());
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
    return Object.keys(this._hass.states).filter((k) => k.startsWith("switch.adaptive_lighting_"));
  }
  _getManualLights(adaptiveEntities) {
    const deduped = /* @__PURE__ */ new Set();
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
    const adaptiveEntities = this._resolveAdaptiveEntitiesForRooms().filter((entityId) => entityId.startsWith("switch.adaptive_lighting_"));
    if (!adaptiveEntities.length) return;
    const manualScoped = new Set(
      Array.from(this._getManualLights(adaptiveEntities)).filter((lightId) => roomLights.has(lightId))
    );
    if (!manualScoped.size) return;
    for (const switchEntity of adaptiveEntities) {
      const sw = this._hass.states[switchEntity];
      const manualControl = sw?.attributes?.manual_control;
      if (!Array.isArray(manualControl)) continue;
      const relevantLights = manualControl.filter((l) => manualScoped.has(l));
      if (!relevantLights.length) continue;
      this._hass.callService("adaptive_lighting", "set_manual_control", {
        entity_id: switchEntity,
        manual_control: false,
        lights: relevantLights
      });
    }
  }
  _handleRoomAction(actionConfig, roomCfg) {
    if (!actionConfig || !this._hass) return;
    const defaultEntityId = roomCfg?.lights?.[0]?.entity || roomCfg?.temperature_entity || "";
    runCardAction({
      element: this,
      hass: this._hass,
      actionConfig,
      defaultEntityId
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
        if (!entity || entity.state === "unavailable") continue;
        if (entity.state === "on") {
          onCount++;
          const raw = Number(entity.attributes?.brightness);
          const pct = Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw / 255 * 100))) : 100;
          brightnessTotal += pct;
        }
      }
      const anyOn = onCount > 0;
      if (anyOn) anyRoomOn = true;
      ref.el.classList.toggle("active", anyOn);
      if (ref.fillEl) {
        const pct = onCount > 0 ? Math.round(brightnessTotal / onCount) : 0;
        ref.fillEl.style.width = `${pct}%`;
      }
      if (ref.toggleBtn) {
        ref.toggleBtn.classList.toggle("on", anyOn);
        ref.toggleBtn.classList.toggle("off", !anyOn);
        ref.toggleBtn.setAttribute("aria-label", anyOn ? `Turn off all ${ref.cfg.name}` : `Turn on all ${ref.cfg.name}`);
      }
      for (const orbRef of ref.orbRefs || []) {
        const entity = this._hass.states[orbRef.entity];
        const orbOn = !!(entity && entity.state === "on");
        const orbManual = manualSet.has(orbRef.entity);
        orbRef.el.classList.toggle("on", orbOn);
        orbRef.el.classList.toggle("off", !orbOn);
        orbRef.el.classList.toggle("manual", orbManual);
      }
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
        parts.push("Off");
      }
      let manualCount = 0;
      for (const light of lights) {
        if (!light.entity) continue;
        if (manualSet.has(light.entity)) manualCount++;
      }
      if (manualCount > 0) {
        parts.push(`<span class="manual-count">${manualCount} manual</span>`);
      }
      ref.el.classList.toggle("manual", manualCount > 0);
      if (ref.cfg.humidity_entity) {
        const humEntity = this._hass.states[ref.cfg.humidity_entity];
        if (humEntity && humEntity.state && humEntity.state !== "unavailable") {
          const humRaw = Number(humEntity.state);
          if (Number.isFinite(humRaw)) {
            parts.push(`<span class="humidity">${Math.round(humRaw)}%</span>`);
          }
        }
      }
      if (ref.cfg.temperature_entity) {
        const tempEntity = this._hass.states[ref.cfg.temperature_entity];
        if (tempEntity && tempEntity.state && tempEntity.state !== "unavailable") {
          const unit = tempEntity.attributes.unit_of_measurement || "\xB0F";
          parts.push(`<span class="temp">${Math.round(Number(tempEntity.state))}${unit}</span>`);
        }
      }
      ref.statusEl.innerHTML = parts.join(" \xB7 ");
    }
    if (this.$.allToggleBtn) {
      this.$.allToggleBtn.classList.toggle("on", anyRoomOn);
      this.$.allToggleBtn.classList.toggle("off", !anyRoomOn);
      this.$.allToggleBtn.setAttribute("aria-label", anyRoomOn ? "Turn all lights off" : "Turn all lights on");
      const iconEl = this.$.allToggleBtn.querySelector(".icon");
      const labelEl = this.$.allToggleBtn.querySelector(".all-toggle-label");
      if (iconEl) iconEl.textContent = anyRoomOn ? "power_settings_new" : "lightbulb";
      if (labelEl) labelEl.textContent = anyRoomOn ? "All Off" : "All On";
    }
  }
};
registerCard("tunet-rooms-card", TunetRoomsCard, {
  name: "Tunet Rooms Card",
  description: "Compact room grid with glassmorphism tile design",
  preview: true,
  documentationURL: "https://github.com/tunet/tunet-rooms-card"
});
logCardVersion("TUNET-ROOMS", CARD_VERSION, "#D4850A");
//# sourceMappingURL=tunet_rooms_card.js.map
