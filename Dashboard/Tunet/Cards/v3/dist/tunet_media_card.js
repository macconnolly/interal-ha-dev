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

// Dashboard/Tunet/Cards/v3/tunet_media_card.js
var CARD_VERSION = "3.2.2";
var CARD_OVERRIDES = `
  /* -- Card-specific token overrides -- */
  :host {
    --r-track: 4px;
    display: block;
  }

  /* -- Card shell overrides -- */
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
  }
  .card[data-state="playing"] { border-color: rgba(52,199,89,0.14); }
  :host(.dark) .card[data-state="playing"] { border-color: rgba(48,209,88,0.16); }
  .card[data-state="paused"] { opacity: 0.85; }
  .card[data-state="idle"] { opacity: 0.65; }
  .card[data-state="off"],
  .card[data-state="unavailable"] { opacity: 0.55; }
`;
var CARD_STYLES = `
  /* -- Header -- */
  .media-hdr { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }

  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: 42px;
    border-radius: 10px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease; min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .card[data-state="playing"] .info-tile {
    background: var(--green-fill); border-color: var(--green-border);
  }

  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    transition: all .2s ease; color: var(--text-muted);
  }
  .card[data-state="playing"] .entity-icon { color: var(--green); }
  .card[data-state="playing"] .entity-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title {
    font-weight: 700; font-size: 13px; color: var(--text-sub);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 11.5px; font-weight: 600; color: var(--text-muted);
    letter-spacing: 0.1px; line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .hdr-sub .green-ic { color: var(--green); }
  .hdr-spacer { flex: 1; }

  /* TV Badge */
  .tv-badge {
    display: none; align-items: center; gap: 3px;
    padding: 3px 8px; border-radius: 8px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh);
    font-size: 11px; font-weight: 700; color: var(--text-muted);
    letter-spacing: .3px; flex-shrink: 0;
  }
  .tv-badge.visible { display: inline-flex; }

  /* -- Speaker Selector -- */
  .speaker-wrap { position: relative; z-index: 4000; }
  .speaker-btn {
    display: flex; align-items: center; gap: 4px;
    min-height: var(--ctrl-min-h, 34px); padding: 0 9px;
    border-radius: 9px; border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg); box-shadow: var(--ctrl-sh);
    font-family: inherit; font-size: 12.5px; font-weight: 600;
    color: var(--text-sub); letter-spacing: .2px;
    cursor: pointer; transition: all .15s ease;
  }
  .speaker-btn:hover { box-shadow: var(--shadow); }
  .speaker-btn:active { transform: scale(.97); }
  .speaker-btn .chevron { transition: transform .2s ease; }
  .speaker-btn[aria-expanded="true"] .chevron { transform: rotate(180deg); }

  /* -- Dropdown Menu (absolute to .speaker-wrap) -- */
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
  .dd-menu.open { display: flex; animation: menuIn .14s ease forwards; }
  @keyframes menuIn {
    from { opacity: 0; transform: translateY(-4px) scale(.97); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* Speaker option row */
  .dd-option {
    padding: 6px 8px; border-radius: 9px;
    font-size: 12px; font-weight: 600; color: var(--text);
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; transition: background .1s;
    user-select: none; border: none; background: transparent;
    font-family: inherit;
  }
  .dd-option:hover { background: var(--track-bg); }
  .dd-option:active { transform: scale(.97); }
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
    content: "\xB7";
    margin-right: 0.25em;
    opacity: 0.7;
  }
  .dd-option.selected .spk-now-playing { color: var(--green); opacity: 0.7; }

  /* Group checkbox */
  .grp-check {
    width: 18px; height: 18px; border-radius: 999px; flex-shrink: 0;
    border: 1.5px solid var(--text-muted); display: grid; place-items: center;
    transition: all .15s ease; cursor: pointer; position: relative; z-index: 2;
  }
  .grp-check:hover { border-color: var(--green); }
  .grp-check.in-group { background: var(--green); border-color: var(--green); }
  .grp-check .icon {
    color: #fff; opacity: 0; transition: opacity .1s;
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 14;
  }
  .grp-check.in-group .icon { opacity: 1; }

  /* Action options */
  .dd-option.action { color: var(--text-sub); }
  .dd-option.action:hover { color: var(--text); }
  .dd-option.action .icon { color: var(--green); }

  .dd-divider { height: 1px; background: var(--divider); margin: 2px 6px; }

  /* -- Media Body (view switching) -- */
  .media-body { position: relative; overflow: hidden; }
  .media-row {
    display: flex; align-items: center; gap: 14px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .media-row.hidden {
    opacity: 0; transform: translateY(4px);
    pointer-events: none; position: absolute; inset: 0;
  }

  /* Album art */
  .album-art {
    width: 56px; height: 56px; flex-shrink: 0;
    border-radius: 10px; overflow: hidden;
    background: var(--track-bg); box-shadow: var(--ctrl-sh);
    display: grid; place-items: center; position: relative;
  }
  .album-art img { width: 100%; height: 100%; object-fit: cover; position: absolute; inset: 0; }
  .album-art .icon { color: var(--text-muted); }
  .card[data-state="playing"] .album-art { box-shadow: var(--shadow); }

  /* Track info */
  .track-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .track-name {
    font-size: 15px; font-weight: 700; color: var(--text); line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .track-artist {
    font-size: 13px; font-weight: 600; color: var(--text-sub); line-height: 1.15;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Progress bar */
  .progress-wrap { display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  .progress-time {
    font-size: 11px; font-weight: 600; color: var(--text-muted);
    font-variant-numeric: tabular-nums; letter-spacing: .3px;
    flex-shrink: 0; min-width: 28px;
  }
  .progress-time.right { text-align: right; }
  .progress-track {
    flex: 1; height: 3px; border-radius: 999px;
    background: var(--track-bg); position: relative; overflow: hidden;
  }
  .progress-fill {
    position: absolute; top: 0; left: 0; bottom: 0; border-radius: 999px;
    background: rgba(52,199,89,0.50); transition: width .5s linear;
  }
  :host(.dark) .progress-fill { background: rgba(48,209,88,0.50); }

  /* -- Transport -- */
  .transport { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
  .t-btn {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; cursor: pointer;
    transition: all .15s ease; border: none; background: transparent;
    color: var(--text-sub);
  }
  .t-btn:hover { background: var(--track-bg); }
  .t-btn:active { transform: scale(.90); }
  .t-btn.play {
    width: 42px; height: 42px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    box-shadow: var(--ctrl-sh); color: var(--text);
  }
  .t-btn.play:hover { box-shadow: var(--shadow); }
  .card[data-state="playing"] .t-btn.play {
    background: var(--green-fill); border-color: var(--green-border); color: var(--green);
  }
  .card[data-state="playing"] .t-btn.play .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .vol-btn {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; cursor: pointer;
    transition: all .15s ease; border: none; background: transparent;
    color: var(--text-muted);
  }
  .vol-btn:hover { background: var(--track-bg); }
  .vol-btn:active { transform: scale(.90); }

  /* -- Volume Row -- */
  .vol-row {
    display: flex; align-items: center; gap: 12px;
    transition: opacity .2s ease, transform .2s ease;
  }
  .vol-row.hidden {
    opacity: 0; transform: translateY(-4px);
    pointer-events: none; position: absolute; inset: 0;
  }

  .vol-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; color: var(--green); transition: all .15s ease;
  }
  .vol-icon:hover { background: var(--track-bg); }
  .vol-icon:active { transform: scale(.90); }
  .vol-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }

  .vol-slider-wrap { flex: 1; display: flex; align-items: center; position: relative; }
  .vol-track {
    width: 100%; height: 44px; border-radius: var(--r-track);
    background: var(--track-bg); position: relative;
    cursor: pointer; touch-action: none; overflow: hidden;
  }
  .vol-fill {
    position: absolute; top: 0; left: 0; bottom: 0;
    border-radius: var(--r-track) 0 0 var(--r-track);
    background: rgba(52,199,89,0.26); pointer-events: none;
    transition: width 60ms ease;
  }
  :host(.dark) .vol-fill { background: rgba(48,209,88,0.28); }

  .vol-thumb {
    position: absolute; top: 50%; transform: translate(-50%,-50%);
    width: 26px; height: 26px; pointer-events: none; z-index: 2;
    transition: left 60ms ease;
  }
  .vol-thumb-disc {
    width: 26px; height: 26px; border-radius: 999px;
    background: var(--thumb-bg); box-shadow: var(--thumb-sh);
    position: absolute; inset: 0;
    transition: box-shadow .15s ease, transform .15s ease;
  }
  .vol-thumb-dot {
    width: 8px; height: 8px; border-radius: 999px;
    background: var(--green); position: absolute; top: 50%; left: 50%;
    transform: translate(-50%,-50%);
    box-shadow: inset 0 0 0 0.5px rgba(0,0,0,0.08);
  }
  .vol-stroke {
    position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
    transform: translateX(-1px); background: var(--green);
    border-radius: 999px; pointer-events: none; z-index: 1;
    opacity: 1;
  }
  .vol-track[data-vol="0"] .vol-stroke { opacity: 0; }

  /* Dragging state */
  .vol-track.dragging .vol-thumb-disc {
    box-shadow: var(--thumb-sh-a); transform: scale(1.08);
  }
  .vol-track.dragging .vol-fill,
  .vol-track.dragging .vol-thumb,
  .vol-track.dragging .vol-stroke { transition: none; }

  .vol-pct {
    font-size: 14px; font-weight: 700; color: var(--text);
    font-variant-numeric: tabular-nums; letter-spacing: -0.2px;
    min-width: 42px; text-align: right; flex-shrink: 0;
  }
  .vol-close {
    width: 38px; height: 38px; border-radius: 10px;
    display: grid; place-items: center; flex-shrink: 0;
    cursor: pointer; color: var(--text-muted); transition: all .15s ease;
    border: none; background: transparent;
  }
  .vol-close:hover { background: var(--track-bg); }
  .vol-close:active { transform: scale(.90); }

  /* -- Responsive -- */
  @media (max-width: 440px) {
    .card { padding: var(--card-pad, 14px); }
    .album-art { width: 48px; height: 48px; }
    .track-name { font-size: 14px; }
    .speaker-btn { min-height: 32px; font-size: 12px; }
    .dd-option { font-size: 12px; }
    .transport { gap: 2px; }
    .t-btn { width: 34px; height: 34px; }
    .t-btn.play { width: 38px; height: 38px; }
  }
`;
var TUNET_MEDIA_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${CARD_SURFACE} ${CARD_SURFACE_GLASS_STROKE} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;
var TUNET_MEDIA_TEMPLATE = `
  ${FONT_LINKS}

  <div class="card-wrap">
    <div class="card" id="card" data-state="idle">

      <!-- Header -->
      <div class="media-hdr">
        <div class="info-tile" id="infoTile" title="Open entity details">
          <div class="entity-icon">
            <span class="icon" style="font-size:18px">speaker_group</span>
          </div>
          <div class="hdr-text">
            <span class="hdr-title" id="cardTitle">Sonos</span>
            <span class="hdr-sub" id="hdrSub">Idle</span>
          </div>
        </div>
        <div class="hdr-spacer"></div>
        <span class="tv-badge" id="tvBadge">
          <span class="icon" style="font-size:11px">tv</span> TV
        </span>
        <div class="speaker-wrap" id="spkWrap" style="display:none">
          <button class="speaker-btn" id="spkBtn" aria-expanded="false">
            <span class="icon" style="font-size:16px">speaker</span>
            <span id="spkLabel">Speaker</span>
            <span class="icon chevron" style="font-size:14px">expand_more</span>
          </button>
          <div class="dd-menu" id="spkMenu"></div>
        </div>
      </div>

      <!-- Media body \u2014 swappable between track view and volume -->
      <div class="media-body">
        <!-- Track view -->
        <div class="media-row" id="trackRow">
          <div class="album-art" id="albumArt">
            <span class="icon" style="font-size:24px">music_note</span>
          </div>
          <div class="track-info">
            <span class="track-name" id="trackName">Nothing playing</span>
            <span class="track-artist" id="trackArtist">Select a source to play</span>
            <div class="progress-wrap" id="progressWrap">
              <span class="progress-time" id="progCur">--</span>
              <div class="progress-track">
                <div class="progress-fill" id="progFill" style="width:0%"></div>
              </div>
              <span class="progress-time right" id="progDur">--</span>
            </div>
          </div>
          <div class="transport">
            <button class="t-btn" id="prevBtn" title="Previous">
              <span class="icon" style="font-size:20px">skip_previous</span>
            </button>
            <button class="t-btn play" id="playBtn" title="Play/Pause">
              <span class="icon" style="font-size:20px" id="playIcon">play_arrow</span>
            </button>
            <button class="t-btn" id="nextBtn" title="Next">
              <span class="icon" style="font-size:20px">skip_next</span>
            </button>
            <button class="vol-btn" id="volShowBtn" title="Volume">
              <span class="icon" style="font-size:18px" id="volShowIcon">volume_up</span>
            </button>
          </div>
        </div>

        <!-- Volume view (hidden by default) -->
        <div class="vol-row hidden" id="volRow">
          <div class="vol-icon" id="muteBtn" title="Mute">
            <span class="icon" style="font-size:20px" id="volMuteIcon">volume_up</span>
          </div>
          <div class="vol-slider-wrap">
            <div class="vol-track" id="volTrack">
              <div class="vol-fill" id="volFill" style="width:0%"></div>
              <div class="vol-stroke" id="volStroke" style="left:0%"></div>
              <div class="vol-thumb" id="volThumb" style="left:0%">
                <div class="vol-thumb-disc"></div>
                <div class="vol-thumb-dot"></div>
              </div>
            </div>
          </div>
          <span class="vol-pct" id="volPct">0%</span>
          <button class="vol-close" id="volCloseBtn" title="Back to track">
            <span class="icon" style="font-size:18px">close</span>
          </button>
        </div>
      </div>

    </div>
  </div>
`;
var TunetMediaCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._progressInterval = null;
    this._volDragging = false;
    this._volDebounce = null;
    this._serviceCooldown = false;
    this._cooldownTimer = null;
    this._view = "track";
    this._activeEntity = null;
    this._cachedSpeakers = null;
    injectFonts();
    this._onDocClick = this._onDocClick.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
  }
  /* -- Config -- */
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { filter: [{ domain: "media_player" }] } } },
        { name: "name", selector: { text: {} } },
        { name: "show_progress", selector: { boolean: {} } },
        {
          name: "speakers",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              description_field: "entity",
              fields: {
                entity: { label: "Speaker", required: true, selector: { entity: { filter: [{ domain: "media_player" }] } } },
                name: { label: "Name", selector: { text: {} } },
                icon: { label: "Icon", selector: { text: {} } }
              }
            }
          }
        },
        {
          type: "expandable",
          title: "Advanced",
          icon: "mdi:tune",
          schema: [
            { name: "coordinator_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } },
            { name: "active_group_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } },
            { name: "playing_status_sensor", selector: { entity: { filter: [{ domain: "sensor" }] } } }
          ]
        }
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || "";
        return {
          entity: "Media Player",
          name: "Card Name",
          show_progress: "Show Progress Bar",
          speakers: "Speakers",
          coordinator_sensor: "Coordinator Sensor",
          active_group_sensor: "Active Group Sensor",
          playing_status_sensor: "Playing Status Sensor"
        }[s.name] || s.name;
      },
      computeHelper: (s) => ({
        speakers: "Optional explicit speaker list. If empty, speakers are auto-discovered from Sonos binary sensors.",
        coordinator_sensor: "Default: sensor.sonos_smart_coordinator",
        active_group_sensor: "Default: sensor.sonos_active_group_coordinator"
      })[s.name] || ""
    };
  }
  static getStubConfig() {
    return {
      entity: "",
      name: "Sonos",
      show_progress: true,
      speakers: []
    };
  }
  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Select a media player entity", "Media");
      return;
    }
    this._config = {
      entity: config.entity,
      name: config.name || "Sonos",
      speakers: config.speakers || [],
      coordinator_sensor: config.coordinator_sensor || "sensor.sonos_smart_coordinator",
      active_group_sensor: config.active_group_sensor || "sensor.sonos_active_group_coordinator",
      playing_status_sensor: config.playing_status_sensor || "sensor.sonos_playing_status",
      show_progress: config.show_progress !== false
    };
    this._cachedSpeakers = null;
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
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    if (!this._activeEntity) {
      this._activeEntity = this._coordinator;
    }
    if (!this._cachedSpeakers || this._cachedSpeakers.length === 0) {
      this._cachedSpeakers = this._getEffectiveSpeakers();
      if (this.$.spkWrap) {
        this.$.spkWrap.style.display = this._cachedSpeakers.length > 0 ? "" : "none";
      }
    }
    let changed = !oldHass;
    if (!changed) {
      const watchList = [
        this._config.entity,
        this._config.coordinator_sensor,
        this._config.active_group_sensor,
        this._config.playing_status_sensor
      ];
      for (const spk of this._cachedSpeakers) {
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
  getCardSize() {
    return 3;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 2
    };
  }
  /* -- Lifecycle -- */
  connectedCallback() {
    document.addEventListener("click", this._onDocClick);
    window.addEventListener("resize", this._onViewportChange, { passive: true });
    window.addEventListener("scroll", this._onViewportChange, { passive: true });
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    window.removeEventListener("resize", this._onViewportChange);
    window.removeEventListener("scroll", this._onViewportChange);
    this._stopProgress();
  }
  /* -- Helpers -- */
  _binarySensorFor(entityId, active = true) {
    const room = entityId.replace("media_player.", "");
    return active ? `binary_sensor.sonos_${room}_in_active_group` : `binary_sensor.sonos_${room}_in_playing_group`;
  }
  _firstWordName(label) {
    const raw = String(label || "").trim();
    if (!raw) return "";
    const cleaned = raw.replace(/\s+Sonos$/i, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    return parts.length ? parts[0] : cleaned;
  }
  get _coordinator() {
    if (!this._hass) return this._activeEntity || this._config.entity;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    if (sensor && sensor.state && !["unknown", "unavailable", "none"].includes(sensor.state)) {
      if (this._hass.states[sensor.state]) return sensor.state;
    }
    return this._activeEntity || this._config.entity;
  }
  get _isTvMode() {
    if (!this._hass) return false;
    const sensor = this._hass.states[this._config.coordinator_sensor];
    return sensor && sensor.attributes.is_tv_mode === true;
  }
  /**
   * Transport target = whatever the user selected in the dropdown.
   * Sonos handles group routing internally — sending play/pause to any
   * group member routes to the coordinator automatically. No need to
   * resolve the coordinator ourselves for commands.
   */
  get _transportTarget() {
    return this._activeEntity || this._coordinator;
  }
  get _volumeTarget() {
    return this._coordinator || this._activeEntity || this._config.entity;
  }
  _callTransport(service) {
    if (!this._hass) return;
    this._hass.callService("media_player", service, { entity_id: this._transportTarget });
  }
  _callService(service, data) {
    if (!this._hass) return;
    this._hass.callService("media_player", service, data);
  }
  _callScript(name, data = {}) {
    if (!this._hass) return;
    this._hass.callService("script", name, data);
  }
  _activeGroupMembers() {
    if (!this._hass) return [];
    const sensor = this._hass.states[this._config.active_group_sensor];
    if (!sensor) return [];
    const fromAttr = sensor.attributes && sensor.attributes.group_members;
    if (Array.isArray(fromAttr)) return fromAttr;
    if (typeof fromAttr === "string") {
      try {
        const parsed = JSON.parse(fromAttr);
        if (Array.isArray(parsed)) return parsed;
      } catch (_) {
      }
    }
    return [];
  }
  _isSpeakerInActiveGroup(entityId) {
    const activeMembers = this._activeGroupMembers();
    if (activeMembers.length > 0) return activeMembers.includes(entityId);
    if (!this._hass) return false;
    const activeBinary = this._hass.states[this._binarySensorFor(entityId, true)];
    if (activeBinary) return activeBinary.state === "on";
    const legacyBinary = this._hass.states[this._binarySensorFor(entityId, false)];
    return !!legacyBinary && legacyBinary.state === "on";
  }
  _getEffectiveSpeakers() {
    if (this._config.speakers && this._config.speakers.length > 0) {
      return this._config.speakers;
    }
    if (!this._hass) return [];
    const speakers = [];
    const seen = /* @__PURE__ */ new Set();
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
            name: playerState.attributes.friendly_name || room.replace(/_/g, " "),
            icon: "speaker"
          });
        }
      }
    }
    return speakers;
  }
  _getGroupedCount() {
    const members = this._activeGroupMembers();
    if (members.length > 0) return members.length;
    const speakers = this._cachedSpeakers || [];
    return speakers.filter((spk) => this._isSpeakerInActiveGroup(spk.entity)).length;
  }
  /* -- Rendering -- */
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_MEDIA_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = TUNET_MEDIA_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {};
    const ids = [
      "card",
      "infoTile",
      "cardTitle",
      "hdrSub",
      "tvBadge",
      "spkWrap",
      "spkBtn",
      "spkLabel",
      "spkMenu",
      "trackRow",
      "albumArt",
      "trackName",
      "trackArtist",
      "progressWrap",
      "progCur",
      "progFill",
      "progDur",
      "prevBtn",
      "playBtn",
      "playIcon",
      "nextBtn",
      "volShowBtn",
      "volShowIcon",
      "volRow",
      "muteBtn",
      "volMuteIcon",
      "volTrack",
      "volFill",
      "volStroke",
      "volThumb",
      "volPct",
      "volCloseBtn"
    ];
    ids.forEach((id) => {
      this.$[id] = this.shadowRoot.getElementById(id);
    });
  }
  /* -- Event Listeners -- */
  _setupListeners() {
    const $ = this.$;
    $.infoTile.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: this._transportTarget }
      }));
    });
    $.albumArt.addEventListener("click", (e) => {
      e.stopPropagation();
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: this._transportTarget }
      }));
    });
    $.albumArt.style.cursor = "pointer";
    $.prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_previous_track");
    });
    $.playBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_play_pause");
    });
    $.nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._callTransport("media_next_track");
    });
    $.volShowBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._setView("volume");
    });
    $.volCloseBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._setView("track");
    });
    $.muteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const volumeTarget = this._volumeTarget;
      const entity = this._hass && this._hass.states[volumeTarget];
      if (entity) {
        this._callService("volume_mute", {
          entity_id: volumeTarget,
          is_volume_muted: !entity.attributes.is_volume_muted
        });
      }
    });
    this._setupVolDrag();
    $.spkBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = $.spkMenu.classList.contains("open");
      if (isOpen) {
        this._closeSpeakerMenu();
      } else {
        this._buildSpeakerMenu();
        this._openSpeakerMenu();
      }
    });
  }
  _setupVolDrag() {
    const track = this.$.volTrack;
    let dragging = false;
    const setVol = (e) => {
      const rect = track.getBoundingClientRect();
      const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const x = cx - rect.left;
      const pct = Math.max(0, Math.min(100, Math.round(x / rect.width * 100)));
      this._renderVolume(pct);
      const volIcon = pct === 0 ? "volume_off" : pct < 40 ? "volume_down" : "volume_up";
      this.$.volMuteIcon.textContent = volIcon;
      clearTimeout(this._volDebounce);
      this._volDebounce = setTimeout(() => {
        const volumeTarget = this._volumeTarget;
        this._callService("volume_set", {
          entity_id: volumeTarget,
          volume_level: pct / 100
        });
        this._serviceCooldown = true;
        clearTimeout(this._cooldownTimer);
        this._cooldownTimer = setTimeout(() => {
          this._serviceCooldown = false;
        }, 1500);
      }, 200);
    };
    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      this._volDragging = true;
      track.classList.add("dragging");
      track.setPointerCapture(e.pointerId);
      setVol(e);
    });
    track.addEventListener("pointermove", (e) => {
      if (dragging) setVol(e);
    });
    track.addEventListener("pointerup", () => {
      dragging = false;
      this._volDragging = false;
      track.classList.remove("dragging");
    });
    track.addEventListener("pointercancel", () => {
      dragging = false;
      this._volDragging = false;
      track.classList.remove("dragging");
    });
  }
  _setView(v) {
    this._view = v;
    this.$.trackRow.classList.toggle("hidden", v !== "track");
    this.$.volRow.classList.toggle("hidden", v !== "volume");
  }
  _onDocClick(e) {
    if (!this.$ || !this.$.spkMenu) return;
    if (!this.$.spkMenu.classList.contains("open")) return;
    const path = e.composedPath();
    if (!path.includes(this.shadowRoot.querySelector(".speaker-wrap"))) {
      this._closeSpeakerMenu();
    }
  }
  _onViewportChange() {
  }
  _openSpeakerMenu() {
    if (!this.$ || !this.$.spkMenu || !this.$.spkBtn) return;
    this.$.spkMenu.classList.add("open");
    this.$.spkBtn.setAttribute("aria-expanded", "true");
    this.style.position = "relative";
    this.style.zIndex = "10";
  }
  _closeSpeakerMenu() {
    if (!this.$ || !this.$.spkMenu || !this.$.spkBtn) return;
    this.$.spkMenu.classList.remove("open");
    this.$.spkBtn.setAttribute("aria-expanded", "false");
    this.style.position = "";
    this.style.zIndex = "";
  }
  /* -- Speaker Dropdown Menu (dual-purpose: select + group) -- */
  _buildSpeakerMenu() {
    const $ = this.$;
    if (!$.spkMenu || !this._hass) return;
    $.spkMenu.innerHTML = "";
    const speakers = this._cachedSpeakers || [];
    for (const spk of speakers) {
      const entity = this._hass.states[spk.entity];
      if (!entity) continue;
      const isActive = spk.entity === this._activeEntity;
      const inGroup = this._isSpeakerInActiveGroup(spk.entity);
      const nowPlaying = entity.state === "playing" ? "Playing" : entity.state === "paused" ? "Paused" : "Idle";
      const opt = document.createElement("button");
      opt.className = `dd-option${isActive ? " selected" : ""}`;
      const iconEl = document.createElement("span");
      iconEl.className = "icon spk-icon";
      iconEl.style.fontSize = "16px";
      iconEl.textContent = spk.icon || "speaker";
      opt.appendChild(iconEl);
      const textWrap = document.createElement("span");
      textWrap.className = "spk-text";
      const nameEl = document.createElement("span");
      nameEl.className = "spk-name";
      nameEl.textContent = this._firstWordName(spk.name || entity.attributes.friendly_name || spk.entity);
      textWrap.appendChild(nameEl);
      const nowEl = document.createElement("span");
      nowEl.className = "spk-now-playing";
      nowEl.textContent = nowPlaying;
      textWrap.appendChild(nowEl);
      opt.appendChild(textWrap);
      const check = document.createElement("div");
      check.className = `grp-check${inGroup ? " in-group" : ""}`;
      const checkIcon = document.createElement("span");
      checkIcon.className = "icon";
      checkIcon.style.fontSize = "12px";
      checkIcon.textContent = "check";
      check.appendChild(checkIcon);
      opt.appendChild(check);
      check.addEventListener("click", (e) => {
        e.stopPropagation();
        check.classList.toggle("in-group");
        this._callScript("sonos_toggle_group_membership", {
          target_speaker: spk.entity
        });
      });
      opt.addEventListener("click", (e) => {
        e.stopPropagation();
        this._activeEntity = spk.entity;
        this._closeSpeakerMenu();
        this._updateAll();
      });
      $.spkMenu.appendChild(opt);
    }
    if (speakers.length > 1) {
      const divider = document.createElement("div");
      divider.className = "dd-divider";
      $.spkMenu.appendChild(divider);
      const groupAllBtn = document.createElement("button");
      groupAllBtn.className = "dd-option action";
      const gaIcon = document.createElement("span");
      gaIcon.className = "icon";
      gaIcon.style.fontSize = "18px";
      gaIcon.textContent = "link";
      groupAllBtn.appendChild(gaIcon);
      groupAllBtn.appendChild(document.createTextNode(" Group All"));
      groupAllBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._callScript("sonos_group_all_to_playing");
        this._closeSpeakerMenu();
      });
      $.spkMenu.appendChild(groupAllBtn);
      const ungroupBtn = document.createElement("button");
      ungroupBtn.className = "dd-option action";
      const ugIcon = document.createElement("span");
      ugIcon.className = "icon";
      ugIcon.style.fontSize = "18px";
      ugIcon.textContent = "link_off";
      ungroupBtn.appendChild(ugIcon);
      ungroupBtn.appendChild(document.createTextNode(" Ungroup All"));
      ungroupBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._callScript("sonos_ungroup_all");
        this._closeSpeakerMenu();
      });
      $.spkMenu.appendChild(ungroupBtn);
    }
  }
  /* -- Full Update -- */
  _updateAll() {
    const $ = this.$;
    if (!$ || !$.card || !this._hass) return;
    if (this._volDragging || this._serviceCooldown) return;
    const coordId = this._coordinator;
    const coordEntity = this._hass.states[coordId];
    const activeEntity = this._hass.states[this._activeEntity];
    const volumeEntity = this._hass.states[this._volumeTarget];
    if (!coordEntity && !activeEntity) {
      $.card.dataset.state = "unavailable";
      $.hdrSub.textContent = "Unavailable";
      return;
    }
    const transportEntity = this._hass.states[this._transportTarget];
    const source = transportEntity || coordEntity || activeEntity;
    const state = source.state;
    const a = source.attributes;
    $.card.dataset.state = state;
    $.cardTitle.textContent = this._config.name;
    const groupedCount = this._getGroupedCount();
    $.hdrSub.textContent = "";
    if (state === "playing") {
      const playSpan = document.createElement("span");
      playSpan.className = "green-ic";
      playSpan.textContent = "Playing";
      $.hdrSub.appendChild(playSpan);
      if (groupedCount > 1) {
        $.hdrSub.appendChild(document.createTextNode(` \xB7 ${groupedCount} grouped`));
      } else {
        const activeSpk = (this._cachedSpeakers || []).find((s) => s.entity === this._activeEntity);
        const spkName = activeSpk ? this._firstWordName(activeSpk.name) : activeEntity && activeEntity.attributes.friendly_name || "";
        if (spkName) $.hdrSub.appendChild(document.createTextNode(` \xB7 ${spkName}`));
      }
    } else if (state === "paused") {
      if (groupedCount > 1) {
        $.hdrSub.textContent = `Paused \xB7 ${groupedCount} grouped`;
      } else {
        const activeSpk = (this._cachedSpeakers || []).find((s) => s.entity === this._activeEntity);
        const spkName = activeSpk ? this._firstWordName(activeSpk.name) : activeEntity && activeEntity.attributes.friendly_name || "";
        $.hdrSub.textContent = spkName ? `Paused \xB7 ${spkName}` : "Paused";
      }
    } else {
      const stateNames = { idle: "Idle", off: "Off", unavailable: "Unavailable" };
      const stateLabel = stateNames[state] || state;
      $.hdrSub.textContent = groupedCount > 1 ? `${stateLabel} \xB7 ${groupedCount} grouped` : stateLabel;
    }
    if ($.tvBadge) {
      $.tvBadge.classList.toggle("visible", this._isTvMode);
    }
    const isActive = state === "playing" || state === "paused";
    const title = a.media_title || (isActive ? "Unknown" : "Nothing playing");
    const artist = a.media_artist || (isActive ? "" : "Select a source to play");
    $.trackName.textContent = title;
    $.trackName.style.color = isActive ? "" : "var(--text-muted)";
    $.trackArtist.textContent = artist;
    const artUrl = a.entity_picture;
    const existingImg = $.albumArt.querySelector("img");
    if (artUrl) {
      const normalizedUrl = artUrl.startsWith("/") ? `${location.origin}${artUrl}` : artUrl;
      if (existingImg) {
        if (existingImg.src !== normalizedUrl) existingImg.src = normalizedUrl;
      } else {
        const img = document.createElement("img");
        img.src = normalizedUrl;
        img.alt = "";
        img.onerror = () => img.remove();
        $.albumArt.appendChild(img);
      }
    } else if (existingImg) {
      existingImg.remove();
    }
    $.playIcon.textContent = state === "playing" ? "pause" : "play_arrow";
    if ($.progressWrap) {
      $.progressWrap.style.display = this._config.show_progress ? "" : "none";
    }
    const duration = a.media_duration || 0;
    $.progDur.textContent = duration ? this._formatTime(duration) : "--";
    this._updateProgress();
    if (!this._volDragging && volumeEntity) {
      const vol = Math.round((volumeEntity.attributes.volume_level || 0) * 100);
      this._renderVolume(vol);
      const muted = volumeEntity.attributes.is_volume_muted;
      const volIcon = muted ? "volume_off" : vol < 40 ? "volume_down" : "volume_up";
      $.volMuteIcon.textContent = volIcon;
      $.volShowIcon.textContent = volIcon;
    }
    if ($.spkLabel) {
      const activeSpk = (this._cachedSpeakers || []).find((s) => s.entity === this._activeEntity);
      $.spkLabel.textContent = activeSpk ? this._firstWordName(activeSpk.name) : this._firstWordName(activeEntity && activeEntity.attributes.friendly_name || this._config.name);
    }
    if (state === "playing") this._startProgress();
    else this._stopProgress();
  }
  _renderVolume(pct) {
    const $ = this.$;
    $.volTrack.dataset.vol = pct;
    $.volFill.style.width = pct + "%";
    $.volStroke.style.left = pct + "%";
    $.volThumb.style.left = pct + "%";
    $.volPct.textContent = pct + "%";
  }
  _updateProgress() {
    const $ = this.$;
    const coordId = this._coordinator;
    const entity = this._hass && this._hass.states[coordId];
    if (!entity) return;
    const a = entity.attributes;
    const duration = a.media_duration || 0;
    const position = a.media_position || 0;
    const updatedAt = a.media_position_updated_at;
    const state = entity.state;
    if (!duration) {
      $.progCur.textContent = "--";
      $.progFill.style.width = "0%";
      return;
    }
    let currentPos = position;
    if (state === "playing" && updatedAt) {
      const elapsed = (Date.now() - new Date(updatedAt).getTime()) / 1e3;
      currentPos = Math.min(position + elapsed, duration);
    }
    $.progCur.textContent = this._formatTime(currentPos);
    $.progFill.style.width = currentPos / duration * 100 + "%";
  }
  _startProgress() {
    if (this._progressInterval) return;
    this._progressInterval = setInterval(() => this._updateProgress(), 1e3);
  }
  _stopProgress() {
    if (this._progressInterval) {
      clearInterval(this._progressInterval);
      this._progressInterval = null;
    }
  }
  _formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  }
};
registerCard("tunet-media-card", TunetMediaCard, {
  name: "Tunet Media Card",
  description: "Glassmorphism Sonos player with transport, volume, and speaker grouping",
  preview: true,
  documentationURL: "https://github.com/tunet/tunet-media-card"
});
logCardVersion("TUNET-MEDIA", CARD_VERSION, "#34C759");
//# sourceMappingURL=tunet_media_card.js.map
