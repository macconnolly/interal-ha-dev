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

// Dashboard/Tunet/Cards/v3/tunet_weather_card.js
var CARD_VERSION = "1.6.1";
var CARD_OVERRIDES = `
  :host {
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    display: block;
  }
  .card {
    width: 100%;
    gap: 0;
    overflow: visible;
    transition: background .3s, border-color .3s;
  }
`;
var CARD_STYLES = `
  /* Header */
  .hdr {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: wrap;
    min-width: 0;
  }
  .info-tile {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 10px 6px 6px; min-height: var(--ctrl-min-h, 42px);
    border-radius: 10px; border: 1px solid var(--blue-border);
    background: var(--blue-fill); box-shadow: var(--ctrl-sh);
    cursor: pointer; transition: all .15s ease;
    max-width: 100%;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .entity-icon {
    width: 24px; height: 24px; border-radius: 6px;
    display: grid; place-items: center; flex-shrink: 0;
    color: var(--blue);
  }
  .hdr-text { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
  .hdr-title { font-weight: 700; font-size: 14px; color: var(--text-sub); letter-spacing: .1px; line-height: 1.15; }
  .hdr-sub { font-size: 11.5px; font-weight: 600; color: var(--text-muted); letter-spacing: .1px; line-height: 1.15; }
  .hdr-spacer { flex: 1 1 auto; min-width: 0; }
  .hdr-controls {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: flex-end;
    min-width: 0;
    max-width: 100%;
    flex: 0 1 auto;
  }
  .seg-group {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 2px;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    max-width: 100%;
    min-width: 0;
    flex: 0 1 auto;
  }
  .seg-btn {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 28px;
    padding: 0 11px;
    border-radius: 999px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-family: inherit;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.25px;
    cursor: pointer;
    transition: all .15s ease;
    white-space: nowrap;
  }
  .seg-btn.active {
    background: var(--blue-fill);
    color: var(--blue);
  }
  .seg-group[hidden] { display: none !important; }

  /* Weather body */
  .weather-body { display: flex; flex-direction: column; gap: 10px; }
  .weather-main {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: flex-start;
    gap: 12px;
    padding: 0 2px;
  }
  .weather-current { display: flex; flex-direction: column; gap: 2px; }
  .weather-temp {
    font-size: 42px; font-weight: 700; line-height: 1; letter-spacing: -1.5px;
    font-variant-numeric: tabular-nums; color: var(--text);
  }
  .deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -1px; }
  .weather-desc {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-sub);
    margin-top: 4px;
    white-space: normal;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 12ch;
  }

  .weather-details {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 10px;
    padding-top: 6px;
    align-content: start;
    min-width: 0;
  }
  .weather-detail {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-sub);
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .weather-detail .icon { color: var(--blue); font-size: 16px; width: 16px; height: 16px; }
  .weather-detail .val { font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; }

  /* Forecast */
  .weather-forecast { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 5px; }
  .forecast-tile {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 6px 4px 5px; border-radius: 11px;
    background: var(--ctrl-bg); border: 1px solid var(--ctrl-border);
    transition: all .15s;
  }
  .forecast-tile:first-child { background: var(--blue-fill); border-color: var(--blue-border); }
  .forecast-day {
    font-size: 11.6px; font-weight: 700; letter-spacing: .2px; text-transform: uppercase; line-height: 1.08;
    color: var(--text-muted);
  }
  .forecast-tile:first-child .forecast-day { color: var(--blue); }
  .forecast-icon { color: var(--text-sub); font-size: 19px; line-height: 1; }
  .forecast-tile:first-child .forecast-icon { color: var(--blue); }
  .forecast-temps { display: flex; flex-direction: column; align-items: center; gap: 1px; }
  .forecast-hi { font-size: 13.8px; font-weight: 700; color: var(--text); font-variant-numeric: tabular-nums; line-height: 1.05; }
  .forecast-lo { font-size: 12.4px; font-weight: 600; color: var(--text-muted); font-variant-numeric: tabular-nums; line-height: 1.05; }
  .forecast-precip-wrap {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  .forecast-bar {
    width: 86%;
    height: 4px;
    border-radius: 999px;
    background: var(--track-bg);
    overflow: hidden;
  }
  .forecast-bar-fill {
    height: 100%;
    width: 0%;
    border-radius: 999px;
    background: rgba(0,122,255,0.86);
  }
  :host(.dark) .forecast-bar-fill {
    background: rgba(96,165,250,0.92);
  }
  .forecast-precip {
    font-size: 12px;
    font-weight: 700;
    color: var(--blue);
    font-variant-numeric: tabular-nums;
  }

  @media (max-width: 720px) {
    .hdr-spacer { display: none; }
    .hdr-controls {
      gap: 4px;
      width: 100%;
      flex: 1 1 100%;
      justify-content: stretch;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .seg-group { width: 100%; }
    .seg-btn { padding: 0 8px; font-size: 11px; }
    .weather-main { grid-template-columns: 1fr; gap: 8px; }
    .weather-desc { max-width: none; }
  }

  @media (max-width: 480px) {
    .card { padding: var(--card-pad, 14px); }
    .hdr-controls {
      grid-template-columns: 1fr;
    }
    .weather-details {
      grid-template-columns: 1fr;
      gap: 5px;
      padding-top: 2px;
    }
    .seg-btn {
      min-height: 26px;
      padding: 0 7px;
      font-size: 10.8px;
    }
    .forecast-tile { padding: 6px 3px 4px; }
    .forecast-day { font-size: 11.2px; }
    .forecast-hi { font-size: 13.2px; }
    .forecast-lo { font-size: 12px; }
  }
`;
var TUNET_WEATHER_STYLES = `
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
var CONDITION_ICONS = {
  "clear-night": "bedtime",
  "cloudy": "cloud",
  "exceptional": "warning",
  "fog": "foggy",
  "hail": "weather_hail",
  "lightning": "thunderstorm",
  "lightning-rainy": "thunderstorm",
  "partlycloudy": "partly_cloudy_day",
  "pouring": "rainy",
  "rainy": "rainy",
  "snowy": "weather_snowy",
  "snowy-rainy": "weather_snowy",
  "sunny": "sunny",
  "windy": "air",
  "windy-variant": "air"
};
function humanizeWeatherCondition(value) {
  return String(value || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (m) => m.toUpperCase());
}
var DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var PRECIP_PROBABILITY_KEYS = [
  "precipitation_probability",
  "precipitation_chance",
  "precip_probability",
  "rain_probability",
  "snow_probability",
  "probability_of_precipitation",
  "probability_of_rain",
  "pop",
  "precip_chance",
  "chance_of_rain",
  "rain_chance",
  "precipitationProbability",
  "precipProbability",
  "precipitation.probability",
  "precipitation.chance",
  "rain.probability"
];
var PRECIP_AMOUNT_KEYS = [
  "precipitation",
  "precipitation_amount",
  "precipitation_total",
  "precip_amount",
  "total_precipitation",
  "liquid_precipitation",
  "rain",
  "rain_amount",
  "rain_total",
  "snow",
  "snow_amount",
  "snow_total",
  "precipitation.mm",
  "precipitation.value"
];
var TunetWeatherCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._forecastDaily = [];
    this._forecastHourly = [];
    this._forecastUnsub = { daily: null, hourly: null };
    this._viewMode = "daily";
    this._metricMode = "temperature";
    this._viewPinned = false;
    this._metricPinned = false;
    injectFonts();
  }
  disconnectedCallback() {
    this._unsubForecast();
  }
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "entity", required: true, selector: { entity: { filter: [{ domain: "weather" }] } } },
        { name: "name", selector: { text: {} } },
        { name: "forecast_days", selector: { number: { min: 1, max: 7, step: 1, mode: "box" } } },
        { name: "forecast_hours", selector: { number: { min: 4, max: 24, step: 1, mode: "box" } } },
        { name: "forecast_view", selector: { select: { options: ["auto", "daily", "hourly"] } } },
        { name: "forecast_metric", selector: { select: { options: ["auto", "temperature", "precipitation"] } } },
        { name: "show_view_toggle", selector: { boolean: {} } },
        { name: "show_metric_toggle", selector: { boolean: {} } },
        { name: "auto_precip_threshold", selector: { number: { min: 0, max: 100, step: 1, mode: "box" } } },
        { name: "show_last_updated", selector: { boolean: {} } }
      ],
      computeLabel: (s) => {
        const labels = {
          entity: "Weather Entity",
          name: "Card Name",
          forecast_days: "Forecast Days",
          forecast_hours: "Forecast Hours",
          forecast_view: "Forecast View",
          forecast_metric: "Forecast Metric",
          show_view_toggle: "Show Daily/Hourly Toggle",
          show_metric_toggle: "Show Temp/Precip Toggle",
          auto_precip_threshold: "Auto Precip Threshold (%)",
          show_last_updated: "Show Last Updated"
        };
        return labels[s.name] || s.name;
      }
    };
  }
  static getStubConfig() {
    return { entity: "", name: "Weather" };
  }
  setConfig(config) {
    if (!config.entity) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, "Select a weather entity to display forecasts", "Weather");
      return;
    }
    this._config = {
      entity: config.entity,
      name: config.name || "Weather",
      forecast_days: config.forecast_days || 5,
      forecast_hours: config.forecast_hours || 8,
      forecast_view: config.forecast_view || "auto",
      forecast_metric: config.forecast_metric || "auto",
      show_view_toggle: config.show_view_toggle !== false,
      show_metric_toggle: config.show_metric_toggle !== false,
      auto_precip_threshold: Number.isFinite(Number(config.auto_precip_threshold)) ? Math.max(0, Math.min(100, Number(config.auto_precip_threshold))) : 45,
      show_last_updated: config.show_last_updated !== false
    };
    this._viewPinned = false;
    this._metricPinned = false;
    if (this._rendered) this._updateAll();
  }
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    const entity = this._config.entity;
    if (!oldHass || entity && (!this._forecastUnsub || this._subscribedEntity !== entity)) {
      this._subscribedEntity = entity;
      this._subscribeForecast();
    }
    if (!oldHass || entity && oldHass.states[entity] !== hass.states[entity]) {
      this._updateAll();
    }
  }
  getCardSize() {
    const hasForecast = this._config.forecast_days > 0;
    return hasForecast ? 5 : 3;
  }
  // Sections view (12-column grid) sizing hints
  getGridOptions() {
    return {
      columns: 6,
      min_columns: 3,
      rows: "auto",
      min_rows: 3
    };
  }
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_WEATHER_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement("template");
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card">
          <div class="hdr">
            <div class="info-tile" id="infoTile">
              <div class="entity-icon"><span class="icon filled" style="font-size:18px" id="condIcon">cloud</span></div>
              <div class="hdr-text">
                <span class="hdr-title" id="cardTitle">Weather</span>
                <span class="hdr-sub" id="hdrSub"></span>
              </div>
            </div>
            <div class="hdr-spacer"></div>
            <div class="hdr-controls">
              <div class="seg-group" id="viewToggle">
                <button type="button" class="seg-btn" id="viewDailyBtn">Daily</button>
                <button type="button" class="seg-btn" id="viewHourlyBtn">Hourly</button>
              </div>
              <div class="seg-group" id="metricToggle">
                <button type="button" class="seg-btn" id="metricTempBtn">Temp</button>
                <button type="button" class="seg-btn" id="metricPrecipBtn">Precip</button>
              </div>
            </div>
          </div>
          <div class="weather-body">
            <div class="weather-main">
              <div class="weather-current">
                <span class="weather-temp" id="curTemp">--<span class="deg">&deg;</span></span>
                <span class="weather-desc" id="condDesc">--</span>
              </div>
              <div class="weather-details" id="details"></div>
            </div>
            <div class="weather-forecast" id="forecast"></div>
          </div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      infoTile: this.shadowRoot.getElementById("infoTile"),
      condIcon: this.shadowRoot.getElementById("condIcon"),
      cardTitle: this.shadowRoot.getElementById("cardTitle"),
      hdrSub: this.shadowRoot.getElementById("hdrSub"),
      curTemp: this.shadowRoot.getElementById("curTemp"),
      condDesc: this.shadowRoot.getElementById("condDesc"),
      details: this.shadowRoot.getElementById("details"),
      forecast: this.shadowRoot.getElementById("forecast"),
      viewToggle: this.shadowRoot.getElementById("viewToggle"),
      viewDailyBtn: this.shadowRoot.getElementById("viewDailyBtn"),
      viewHourlyBtn: this.shadowRoot.getElementById("viewHourlyBtn"),
      metricToggle: this.shadowRoot.getElementById("metricToggle"),
      metricTempBtn: this.shadowRoot.getElementById("metricTempBtn"),
      metricPrecipBtn: this.shadowRoot.getElementById("metricPrecipBtn")
    };
    this.$.infoTile.addEventListener("click", () => {
      if (!this._hass || !this._config.entity) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", {
        bubbles: true,
        composed: true,
        detail: { entityId: this._config.entity }
      }));
    });
    this.$.viewDailyBtn?.addEventListener("click", () => this._setViewMode("daily", true));
    this.$.viewHourlyBtn?.addEventListener("click", () => this._setViewMode("hourly", true));
    this.$.metricTempBtn?.addEventListener("click", () => this._setMetricMode("temperature", true));
    this.$.metricPrecipBtn?.addEventListener("click", () => this._setMetricMode("precipitation", true));
  }
  _unsubForecast() {
    if (!this._forecastUnsub) return;
    if (typeof this._forecastUnsub.daily === "function") {
      this._forecastUnsub.daily();
      this._forecastUnsub.daily = null;
    }
    if (typeof this._forecastUnsub.hourly === "function") {
      this._forecastUnsub.hourly();
      this._forecastUnsub.hourly = null;
    }
  }
  async _subscribeForecast() {
    if (!this._hass || !this._config.entity) return;
    this._unsubForecast();
    await Promise.all([
      this._subscribeForecastType("daily"),
      this._subscribeForecastType("hourly")
    ]);
    this._renderForecast();
  }
  async _subscribeForecastType(type) {
    try {
      const unsub = await this._hass.connection.subscribeMessage(
        (msg) => {
          if (msg.forecast && Array.isArray(msg.forecast)) {
            if (type === "hourly") this._forecastHourly = msg.forecast;
            else this._forecastDaily = msg.forecast;
            this._renderForecast();
          }
        },
        {
          type: "weather/subscribe_forecast",
          forecast_type: type,
          entity_id: this._config.entity
        }
      );
      this._forecastUnsub[type] = unsub;
      return;
    } catch (_) {
    }
    await this._fetchForecastType(type);
  }
  async _fetchForecastType(type) {
    try {
      const result = await this._hass.callService("weather", "get_forecasts", {
        type
      }, { entity_id: this._config.entity }, false, true);
      const forecast = result?.response?.[this._config.entity]?.forecast || result?.[this._config.entity]?.forecast;
      if (Array.isArray(forecast) && forecast.length > 0) {
        if (type === "hourly") this._forecastHourly = forecast;
        else this._forecastDaily = forecast;
        return;
      }
    } catch (_) {
    }
    if (type === "daily") {
      const entity = this._hass.states[this._config.entity];
      if (entity && Array.isArray(entity.attributes?.forecast)) {
        this._forecastDaily = entity.attributes.forecast;
      }
    }
  }
  _updateAll() {
    if (!this.$ || !this._hass) return;
    const entity = this._hass.states[this._config.entity];
    if (!entity) return;
    const a = entity.attributes;
    const condition = entity.state;
    this._applyAutoModes(condition);
    this._updateToggleControls();
    this.$.cardTitle.textContent = this._config.name;
    this.$.condIcon.textContent = CONDITION_ICONS[condition] || "cloud";
    const temp = a.temperature != null ? Math.round(a.temperature) : "--";
    this.$.curTemp.innerHTML = `${temp}<span class="deg">&deg;</span>`;
    const condNames = {
      "clear-night": "Clear Night",
      "cloudy": "Cloudy",
      "fog": "Foggy",
      "hail": "Hail",
      "lightning": "Thunderstorm",
      "lightning-rainy": "Thunderstorm",
      "partlycloudy": "Partly Cloudy",
      "pouring": "Heavy Rain",
      "rainy": "Rainy",
      "snowy": "Snowy",
      "snowy-rainy": "Sleet",
      "sunny": "Sunny",
      "windy": "Windy",
      "windy-variant": "Windy",
      "exceptional": "Exceptional"
    };
    this.$.condDesc.textContent = condNames[condition] || humanizeWeatherCondition(condition);
    const lastUpdate = entity.last_updated;
    if (this._config.show_last_updated && lastUpdate) {
      const mins = Math.round((Date.now() - new Date(lastUpdate).getTime()) / 6e4);
      this.$.hdrSub.textContent = mins < 1 ? "Just updated" : `Updated ${mins} min ago`;
    } else {
      this.$.hdrSub.textContent = "";
    }
    const details = [];
    if (a.wind_speed != null) {
      const dir = a.wind_bearing != null ? this._windDir(a.wind_bearing) : "";
      details.push({ icon: "air", label: "Wind", value: `${Math.round(a.wind_speed)} mph ${dir}`.trim() });
    }
    if (a.humidity != null) {
      details.push({ icon: "water_drop", label: "Humidity", value: `${Math.round(a.humidity)}%` });
    }
    if (a.uv_index != null) {
      details.push({ icon: "wb_sunny", label: "UV", value: String(Math.round(a.uv_index)) });
    }
    if (a.pressure != null) {
      details.push({ icon: "speed", label: "Pressure", value: `${Math.round(a.pressure)} hPa` });
    }
    this.$.details.innerHTML = details.map(
      (d) => `<div class="weather-detail">
        <span class="icon">${d.icon}</span>
        ${d.label} <span class="val">${d.value}</span>
      </div>`
    ).join("");
    if (this._forecastDaily.length || this._forecastHourly.length) this._renderForecast();
  }
  _renderForecast() {
    if (!this.$) return;
    const source = this._viewMode === "hourly" ? this._forecastHourly : this._forecastDaily;
    const limit = this._resolveForecastLimit();
    const points = Array.isArray(source) ? source.slice(0, limit) : [];
    if (!points.length) {
      this.$.forecast.innerHTML = "";
      return;
    }
    this.$.forecast.innerHTML = points.map((fc, i) => {
      const dt = new Date(fc.datetime);
      const dayName = this._viewMode === "hourly" ? i === 0 ? "Now" : this._formatHourLabel(dt) : i === 0 ? "Now" : DAY_NAMES[dt.getDay()];
      const icon = CONDITION_ICONS[fc.condition] || "cloud";
      const isPrecip = this._metricMode === "precipitation";
      const hi = fc.temperature != null ? Math.round(fc.temperature) : "--";
      const lo = this._viewMode === "daily" && fc.templow != null ? Math.round(fc.templow) : null;
      const precip = this._resolvePrecipPresentation(fc);
      return `
        <div class="forecast-tile">
          <span class="forecast-day">${dayName}</span>
          <span class="icon forecast-icon">${icon}</span>
          ${isPrecip ? `<div class="forecast-precip-wrap">
                <div class="forecast-bar"><div class="forecast-bar-fill" style="width:${precip.barPercent}%"></div></div>
                <span class="forecast-precip">${precip.label}</span>
              </div>` : `<div class="forecast-temps">
                <span class="forecast-hi">${hi}&deg;</span>
                ${lo != null ? `<span class="forecast-lo">${lo}&deg;</span>` : ""}
              </div>`}
        </div>`;
    }).join("");
  }
  _resolveForecastLimit() {
    const dailyCount = Math.max(1, Number(this._config.forecast_days) || 5);
    const hourlyCount = Math.max(1, Number(this._config.forecast_hours) || 8);
    if (this._viewMode === "hourly" && this._metricMode === "precipitation") return dailyCount;
    return this._viewMode === "hourly" ? hourlyCount : dailyCount;
  }
  _readForecastValue(fc, keyPath) {
    if (!fc || !keyPath) return null;
    if (Object.prototype.hasOwnProperty.call(fc, keyPath)) return fc[keyPath];
    if (fc.attributes && Object.prototype.hasOwnProperty.call(fc.attributes, keyPath)) {
      return fc.attributes[keyPath];
    }
    if (!keyPath.includes(".")) return null;
    const parts = keyPath.split(".");
    let cur = fc;
    for (const part of parts) {
      if (cur == null || typeof cur !== "object" || !(part in cur)) return null;
      cur = cur[part];
    }
    return cur;
  }
  _toFiniteNumber(value, depth = 0) {
    if (value == null || depth > 2) return null;
    if (typeof value === "number") return Number.isFinite(value) ? value : null;
    if (typeof value === "string") {
      const match = value.trim().match(/-?\d+(\.\d+)?/);
      if (!match) return null;
      const parsed = Number(match[0]);
      return Number.isFinite(parsed) ? parsed : null;
    }
    if (typeof value === "object") {
      for (const key of ["value", "amount", "probability", "chance", "total", "mm"]) {
        if (!(key in value)) continue;
        const parsed = this._toFiniteNumber(value[key], depth + 1);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
    return null;
  }
  _pickPrecipCandidate(fc, keys, normalize) {
    let firstValid = null;
    for (const key of keys) {
      const raw = this._readForecastValue(fc, key);
      if (raw == null) continue;
      const normalized = normalize.call(this, raw, key);
      if (!Number.isFinite(normalized)) continue;
      const candidate = { value: normalized, source: key };
      if (!firstValid) firstValid = candidate;
      if (normalized > 0) return candidate;
    }
    return firstValid;
  }
  _normalizePrecipProbability(raw, key) {
    let probability = this._toFiniteNumber(raw);
    if (!Number.isFinite(probability)) return NaN;
    const isPercentString = typeof raw === "string" && raw.includes("%");
    if (probability > 0 && probability <= 1 && !isPercentString) probability *= 100;
    probability = Math.max(0, Math.min(100, probability));
    return Math.round(probability);
  }
  _normalizePrecipAmount(raw, key) {
    let amount = this._toFiniteNumber(raw);
    if (!Number.isFinite(amount)) return NaN;
    if (/(?:_in|inches?|inch)/i.test(String(key))) amount *= 25.4;
    amount = Math.max(0, amount);
    return Math.round(amount * 10) / 10;
  }
  _resolvePrecipProbability(fc) {
    return this._pickPrecipCandidate(fc, PRECIP_PROBABILITY_KEYS, this._normalizePrecipProbability);
  }
  _resolvePrecipAmount(fc) {
    return this._pickPrecipCandidate(fc, PRECIP_AMOUNT_KEYS, this._normalizePrecipAmount);
  }
  _resolvePrecipPresentation(fc) {
    const probability = this._resolvePrecipProbability(fc);
    const amount = this._resolvePrecipAmount(fc);
    const probabilityValue = probability?.value;
    const amountValue = amount?.value;
    if (Number.isFinite(probabilityValue) && probabilityValue > 0) {
      return { barPercent: probabilityValue, label: `${probabilityValue}%` };
    }
    if (Number.isFinite(amountValue) && amountValue > 0) {
      return {
        barPercent: Math.max(0, Math.min(100, Math.round(amountValue / 10 * 100))),
        label: `${amountValue.toFixed(1)} mm`
      };
    }
    if (Number.isFinite(probabilityValue)) {
      return { barPercent: probabilityValue, label: `${probabilityValue}%` };
    }
    if (Number.isFinite(amountValue)) {
      return {
        barPercent: Math.max(0, Math.min(100, Math.round(amountValue / 10 * 100))),
        label: `${amountValue.toFixed(1)} mm`
      };
    }
    return { barPercent: 0, label: "--" };
  }
  _setViewMode(mode, pinned = false) {
    this._viewMode = mode === "hourly" ? "hourly" : "daily";
    if (pinned) this._viewPinned = true;
    this._updateToggleControls();
    this._renderForecast();
  }
  _setMetricMode(mode, pinned = false) {
    this._metricMode = mode === "precipitation" ? "precipitation" : "temperature";
    if (pinned) this._metricPinned = true;
    this._updateToggleControls();
    this._renderForecast();
  }
  _updateToggleControls() {
    if (!this.$) return;
    if (this.$.viewToggle) this.$.viewToggle.hidden = !this._config.show_view_toggle;
    if (this.$.metricToggle) this.$.metricToggle.hidden = !this._config.show_metric_toggle;
    this.$.viewDailyBtn?.classList.toggle("active", this._viewMode === "daily");
    this.$.viewHourlyBtn?.classList.toggle("active", this._viewMode === "hourly");
    this.$.metricTempBtn?.classList.toggle("active", this._metricMode === "temperature");
    this.$.metricPrecipBtn?.classList.toggle("active", this._metricMode === "precipitation");
  }
  _applyAutoModes(condition) {
    const precipCondition = this._isPrecipCondition(condition);
    const hourlySlice = (this._forecastHourly || []).slice(0, Math.max(1, this._config.forecast_hours || 8));
    const maxPrecip = hourlySlice.reduce((maxVal, fc) => {
      const probability = this._resolvePrecipProbability(fc)?.value;
      if (Number.isFinite(probability)) return Math.max(maxVal, Number(probability));
      const amount = this._resolvePrecipAmount(fc)?.value;
      if (Number.isFinite(amount)) {
        const amountScore = Math.max(0, Math.min(100, Math.round(amount / 10 * 100)));
        return Math.max(maxVal, amountScore);
      }
      return maxVal;
    }, 0);
    const precipLikely = precipCondition || maxPrecip >= (this._config.auto_precip_threshold || 45);
    if (!this._viewPinned) {
      if (this._config.forecast_view === "hourly") this._viewMode = "hourly";
      else if (this._config.forecast_view === "daily") this._viewMode = "daily";
      else this._viewMode = precipLikely ? "hourly" : "daily";
    }
    if (!this._metricPinned) {
      if (this._config.forecast_metric === "precipitation") this._metricMode = "precipitation";
      else if (this._config.forecast_metric === "temperature") this._metricMode = "temperature";
      else this._metricMode = precipLikely ? "precipitation" : "temperature";
    }
  }
  _isPrecipCondition(condition) {
    return ["rainy", "pouring", "lightning-rainy", "snowy", "snowy-rainy", "hail", "lightning"].includes(String(condition || "").toLowerCase());
  }
  _formatHourLabel(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "--";
    try {
      return new Intl.DateTimeFormat(void 0, { hour: "numeric" }).format(date);
    } catch (_) {
      return date.toLocaleTimeString([], { hour: "numeric" });
    }
  }
  _windDir(bearing) {
    const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return dirs[Math.round(bearing / 22.5) % 16];
  }
};
registerCard("tunet-weather-card", TunetWeatherCard, {
  name: "Tunet Weather Card",
  description: "Weather conditions and forecast with glassmorphism design",
  preview: true
});
logCardVersion("TUNET-WEATHER", CARD_VERSION, "#007AFF");
//# sourceMappingURL=tunet_weather_card.js.map
