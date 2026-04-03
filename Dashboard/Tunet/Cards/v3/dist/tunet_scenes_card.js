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

// Dashboard/Tunet/Cards/v3/tunet_scenes_card.js
var CARD_VERSION = "0.1.2";
var ACCENTS = ["amber", "blue", "green", "purple", "red"];
var OPERATORS = ["equals", "contains", "not_equals"];
var ICON_ALIASES = {
  auto_awesome: "auto_awesome",
  bedtime: "bedtime",
  floor_lamp: "lamp",
  lightbulb_on: "lightbulb",
  moon_stars: "bedtime",
  power: "power_settings_new",
  table_lamp: "lamp"
};
var DEFAULT_SCENES = [
  { entity: "", name: "All On", icon: "lightbulb", accent: "amber" },
  { entity: "", name: "All Off", icon: "power_settings_new", accent: "amber" },
  { entity: "", name: "Bedtime", icon: "bedtime", accent: "purple" }
];
function normalizeAccent(value) {
  return ACCENTS.includes(value) ? value : "amber";
}
function normalizeOperator(value) {
  return OPERATORS.includes(value) ? value : "equals";
}
function normalizeIcon(icon, fallback = "auto_awesome") {
  if (!icon) return fallback;
  const raw = String(icon).replace(/^mdi:/, "").trim();
  if (!raw) return fallback;
  const underscored = raw.replace(/-/g, "_");
  return ICON_ALIASES[underscored] || ICON_ALIASES[raw] || underscored;
}
function fallbackIconForEntity(entityId) {
  const domain = String(entityId || "").split(".")[0];
  switch (domain) {
    case "scene":
      return "auto_awesome";
    case "script":
      return "play_arrow";
    case "automation":
      return "auto_mode";
    default:
      return "auto_awesome";
  }
}
function coerceScenes(input) {
  if (!Array.isArray(input)) return [];
  return input.map((scene) => {
    const entity = String(scene?.entity || "").trim();
    const iconFallback = fallbackIconForEntity(entity);
    return {
      entity,
      name: String(scene?.name || "").trim(),
      icon: normalizeIcon(scene?.icon, iconFallback),
      accent: normalizeAccent(scene?.accent),
      state_entity: String(scene?.state_entity || "").trim(),
      active_when: String(scene?.active_when ?? "on"),
      active_when_operator: normalizeOperator(scene?.active_when_operator)
    };
  }).filter((scene) => scene.entity);
}
var CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.07);
    --tile-shadow-lift: 0 8px 20px rgba(0,0,0,0.10), 0 3px 8px rgba(0,0,0,0.06);
    display: block;
  }

  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
  }

  .card.compact {
    padding: 10px;
    border-radius: 20px;
  }
`;
var CARD_STYLES = `
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .hdr.hidden {
    display: none;
  }

  .hdr-icon {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: grid;
    place-items: center;
    background: var(--ctrl-bg);
    border: 1px solid var(--ctrl-border);
    color: var(--text-muted);
    box-shadow: var(--ctrl-sh);
    flex: 0 0 auto;
  }

  .hdr-title {
    font-size: var(--type-label, 12.5px);
    font-weight: 700;
    letter-spacing: 0.2px;
    color: var(--text-sub);
  }

  .scene-row {
    display: flex;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }

  .scene-row.wrap {
    overflow-x: visible;
    flex-wrap: wrap;
  }

  .scene-row::-webkit-scrollbar {
    display: none;
  }

  .scene-chip {
    flex: 0 0 auto;
    border: 1px solid transparent;
    border-radius: 999px;
    background: var(--tile-bg);
    box-shadow: var(--tile-shadow-rest);
    color: var(--text-sub);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 36px;
    padding: 6px 12px 6px 9px;
    font-family: inherit;
    font-size: var(--type-chip, 12.5px);
    font-weight: 600;
    line-height: 1;
    letter-spacing: 0.1px;
    white-space: nowrap;
    cursor: pointer;
    transition: transform var(--motion-fast) var(--ease-standard), box-shadow var(--motion-ui) var(--ease-standard), border-color var(--motion-ui) var(--ease-standard), color var(--motion-ui) var(--ease-standard), background var(--motion-ui) var(--ease-standard);
    -webkit-tap-highlight-color: transparent;
  }

  .card.compact .scene-chip {
    min-height: 34px;
    padding: 6px 11px 6px 8px;
    font-size: var(--type-chip, 13px);
    gap: 5px;
  }

  .scene-chip:hover {
    box-shadow: var(--tile-shadow-lift);
  }

  .scene-chip:active {
    transform: scale(0.96);
  }

  .scene-chip:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }

  .scene-chip .icon-wrap {
    width: 21px;
    height: 21px;
    border-radius: 7px;
    display: grid;
    place-items: center;
    background: var(--gray-ghost);
    color: var(--text-muted);
    flex: 0 0 auto;
  }

  .card.compact .scene-chip .icon-wrap {
    width: 20px;
    height: 20px;
    border-radius: 6px;
  }

  .scene-chip .icon {
    font-size: 15px;
    width: 15px;
    height: 15px;
  }

  .card.compact .scene-chip .icon {
    font-size: 15px;
    width: 15px;
    height: 15px;
  }

  .scene-chip.active {
    font-weight: 700;
  }

  .scene-chip[data-accent="amber"].active {
    border-color: var(--amber-border);
    color: var(--amber);
    background: var(--amber-fill);
  }
  .scene-chip[data-accent="amber"].active .icon-wrap {
    border: 1px solid var(--amber-border);
    background: var(--amber-fill);
    color: var(--amber);
  }

  .scene-chip[data-accent="blue"].active {
    border-color: var(--blue-border);
    color: var(--blue);
    background: var(--blue-fill);
  }
  .scene-chip[data-accent="blue"].active .icon-wrap {
    border: 1px solid var(--blue-border);
    background: var(--blue-fill);
    color: var(--blue);
  }

  .scene-chip[data-accent="green"].active {
    border-color: var(--green-border);
    color: var(--green);
    background: var(--green-fill);
  }
  .scene-chip[data-accent="green"].active .icon-wrap {
    border: 1px solid var(--green-border);
    background: var(--green-fill);
    color: var(--green);
  }

  .scene-chip[data-accent="purple"].active {
    border-color: var(--purple-border);
    color: var(--purple);
    background: var(--purple-fill);
  }
  .scene-chip[data-accent="purple"].active .icon-wrap {
    border: 1px solid var(--purple-border);
    background: var(--purple-fill);
    color: var(--purple);
  }

  .scene-chip[data-accent="red"].active {
    border-color: var(--red-border);
    color: var(--red);
    background: var(--red-fill);
  }
  .scene-chip[data-accent="red"].active .icon-wrap {
    border: 1px solid var(--red-border);
    background: var(--red-fill);
    color: var(--red);
  }

  .scene-chip.is-unavailable {
    opacity: 0.5;
  }

  .scene-chip:disabled {
    cursor: default;
  }

  .empty {
    font-size: 12px;
    font-weight: 600;
    color: var(--text-muted);
    padding: 4px 2px 0;
  }

  .empty.hidden {
    display: none;
  }
`;
var TUNET_SCENES_STYLES = `
  ${TOKENS}
  ${RESET}
  ${BASE_FONT}
  ${ICON_BASE}
  ${CARD_SURFACE}
  ${CARD_SURFACE_GLASS_STROKE}
  ${CARD_OVERRIDES}
  ${CARD_STYLES}
  ${REDUCED_MOTION}
`;
var TunetScenesCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._chipRefs = [];
    this._recentEntity = "";
    this._recentUntil = 0;
    injectFonts();
  }
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "show_header", selector: { boolean: {} } },
        { name: "name", selector: { text: {} } },
        { name: "compact", selector: { boolean: {} } },
        { name: "allow_wrap", selector: { boolean: {} } },
        {
          name: "scenes",
          selector: {
            object: {
              multiple: true,
              label_field: "name",
              description_field: "entity",
              fields: {
                entity: { label: "Entity", required: true, selector: { entity: { domain: ["scene", "script", "automation"] } } },
                name: { label: "Name", selector: { text: {} } },
                icon: { label: "Icon", selector: { icon: {} } },
                accent: { label: "Accent", selector: { select: { options: ACCENTS } } },
                state_entity: { label: "Active State Entity", selector: { entity: {} } },
                active_when: { label: "Active When Value", selector: { text: {} } },
                active_when_operator: { label: "Active Operator", selector: { select: { options: OPERATORS } } }
              }
            }
          }
        }
      ],
      computeLabel: (schema) => {
        const labels = {
          show_header: "Show Header",
          name: "Card Name",
          compact: "Compact Layout",
          allow_wrap: "Allow Wrap (multi-row)",
          scenes: "Scenes",
          entity: "Entity",
          icon: "Icon",
          accent: "Accent",
          state_entity: "Active State Entity (optional)",
          active_when: "Active When Value",
          active_when_operator: "Active Operator"
        };
        return labels[schema.name] || schema.name;
      }
    };
  }
  static getStubConfig() {
    return {
      show_header: false,
      name: "Scenes",
      compact: true,
      allow_wrap: false,
      scenes: DEFAULT_SCENES
    };
  }
  setConfig(config) {
    this._config = {
      show_header: config.show_header === true,
      name: String(config.name || "Scenes").trim() || "Scenes",
      compact: config.compact !== false,
      allow_wrap: config.allow_wrap === true,
      scenes: coerceScenes(config.scenes)
    };
    if (this._rendered) {
      this._applyConfigToDom();
      this._buildChips();
      this._updateStates();
    }
  }
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._buildChips();
      this._rendered = true;
    }
    applyDarkClass(this, detectDarkMode(hass));
    if (!oldHass || this._hasRelevantStateChange(oldHass, hass)) {
      this._updateStates();
    }
  }
  getCardSize() {
    if (!this._config.allow_wrap) return this._config.show_header ? 2 : 1;
    const rows = Math.max(1, Math.ceil((this._config.scenes?.length || 1) / 4));
    return (this._config.show_header ? 1 : 0) + rows;
  }
  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: "auto",
      min_rows: 1
    };
  }
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_SCENES_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card" id="card">
          <div class="hdr" id="hdr">
            <div class="hdr-icon"><span class="icon filled">auto_awesome</span></div>
            <div class="hdr-title" id="title">Scenes</div>
          </div>
          <div class="scene-row" id="row"></div>
          <div class="empty hidden" id="empty">No scenes configured.</div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this._els = {
      card: this.shadowRoot.getElementById("card"),
      hdr: this.shadowRoot.getElementById("hdr"),
      title: this.shadowRoot.getElementById("title"),
      row: this.shadowRoot.getElementById("row"),
      empty: this.shadowRoot.getElementById("empty")
    };
    this._applyConfigToDom();
  }
  _applyConfigToDom() {
    if (!this._els) return;
    this._els.card.classList.toggle("compact", !!this._config.compact);
    this._els.hdr.classList.toggle("hidden", !this._config.show_header);
    this._els.row.classList.toggle("wrap", !!this._config.allow_wrap);
    this._els.title.textContent = this._config.name || "Scenes";
  }
  _hasRelevantStateChange(oldHass, newHass) {
    for (const scene of this._config.scenes || []) {
      if (scene.entity && oldHass.states[scene.entity] !== newHass.states[scene.entity]) return true;
      if (scene.state_entity && oldHass.states[scene.state_entity] !== newHass.states[scene.state_entity]) return true;
    }
    return false;
  }
  _buildChips() {
    if (!this._els?.row) return;
    this._els.row.innerHTML = "";
    this._chipRefs = [];
    const scenes = this._config.scenes || [];
    this._els.empty.classList.toggle("hidden", scenes.length > 0);
    if (!scenes.length) return;
    for (const scene of scenes) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "scene-chip";
      chip.dataset.accent = scene.accent;
      chip.innerHTML = `
        <span class="icon-wrap"><span class="icon">${normalizeIcon(scene.icon, "auto_awesome")}</span></span>
        <span class="label">${this._getSceneLabel(scene)}</span>
      `;
      chip.addEventListener("click", () => this._activate(scene, chip));
      this._els.row.appendChild(chip);
      this._chipRefs.push({ chip, scene });
    }
  }
  _getSceneLabel(scene) {
    if (scene.name) return scene.name;
    if (!this._hass || !scene.entity) {
      return scene.entity ? scene.entity.split(".").slice(1).join(".") : "Scene";
    }
    const stateObj = this._hass.states[scene.entity];
    if (stateObj?.attributes?.friendly_name) return String(stateObj.attributes.friendly_name);
    return scene.entity.split(".").slice(1).join(".") || "Scene";
  }
  async _activate(scene, chip) {
    if (!this._hass || !scene?.entity) return;
    const domain = String(scene.entity).split(".")[0];
    let serviceDomain = "homeassistant";
    let serviceName = "turn_on";
    if (domain === "scene") {
      serviceDomain = "scene";
      serviceName = "turn_on";
    } else if (domain === "script") {
      serviceDomain = "script";
      serviceName = "turn_on";
    } else if (domain === "automation") {
      serviceDomain = "automation";
      serviceName = "trigger";
    }
    try {
      await this._hass.callService(serviceDomain, serviceName, { entity_id: scene.entity });
    } catch (error) {
      console.error("[tunet-scenes-card] action failed", serviceDomain, serviceName, scene.entity, error);
    }
    this._recentEntity = scene.entity;
    this._recentUntil = Date.now() + 1300;
    chip.classList.add("active");
    setTimeout(() => this._updateStates(), 160);
  }
  _updateStates() {
    if (!this._hass || !this._chipRefs.length) return;
    const now = Date.now();
    for (const ref of this._chipRefs) {
      const { chip, scene } = ref;
      const baseEntity = scene.entity ? this._hass.states[scene.entity] : null;
      const unavailable = !baseEntity || baseEntity.state === "unavailable";
      chip.disabled = unavailable;
      chip.classList.toggle("is-unavailable", unavailable);
      let active = false;
      if (!unavailable && scene.state_entity) {
        const stateObj = this._hass.states[scene.state_entity];
        if (stateObj) {
          const actual = String(stateObj.state ?? "");
          const expected = String(scene.active_when ?? "");
          if (scene.active_when_operator === "contains") {
            active = actual.includes(expected);
          } else if (scene.active_when_operator === "not_equals") {
            active = actual !== expected;
          } else {
            active = actual === expected;
          }
        }
      } else if (!unavailable) {
        active = scene.entity === this._recentEntity && now < this._recentUntil;
      }
      chip.classList.toggle("active", active);
    }
  }
};
registerCard("tunet-scenes-card", TunetScenesCard, {
  name: "Tunet Scenes Card",
  description: "Quick scene chips for scene/script/automation entities",
  preview: true
});
logCardVersion("TUNET-SCENES", CARD_VERSION, "#AF52DE");
//# sourceMappingURL=tunet_scenes_card.js.map
