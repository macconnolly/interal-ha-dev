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

// Dashboard/Tunet/Cards/v3/tunet_status_card.js
var CARD_VERSION = "3.0.0";
var STATUS_ICON_ALIASES = {
  shelf_auto: "shelves",
  countertops: "kitchen",
  desk_lamp: "desk",
  floor_lamp: "lamp",
  table_lamp: "lamp",
  light_group: "lightbulb",
  weather_sunset_down: "wb_twilight",
  weather_sunset_up: "sunny_snowing"
};
function normalizeStatusIcon(icon) {
  if (!icon) return "info";
  const raw = String(icon).replace(/^mdi:/, "").trim();
  const resolved = STATUS_ICON_ALIASES[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return "info";
  return resolved;
}
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
function humanizeStateValue(value) {
  const text = String(value ?? "").trim();
  if (!text) return "\u2014";
  const known = {
    partlycloudy: "Partly Cloudy",
    clearnight: "Clear Night",
    sunny: "Sunny",
    cloudy: "Cloudy",
    rainy: "Rainy",
    pouring: "Heavy Rain",
    lightning: "Thunderstorm",
    lightningrainy: "Storm + Rain",
    snowy: "Snowy",
    snowy_rainy: "Snow + Rain",
    fog: "Fog",
    windy: "Windy",
    windy_variant: "Windy"
  };
  if (known[text]) return known[text];
  return text.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim().replace(/\b\w/g, (m) => m.toUpperCase());
}
var TUNET_STATUS_STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}

  /* \u2500\u2500 Status-specific token overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  :host {
    --card-pad: var(--_tunet-card-pad, 1.25em);
    --r-tile: var(--_tunet-tile-radius, 0.875em);
    --type-label: var(--_tunet-name-font, 0.8125em);
    --type-sub: var(--_tunet-sub-font, 0.6875em);
    --type-value: var(--_tunet-value-font, 1.125em);
    --tile-row-h: var(--_tunet-tile-min-h, 5.875em);
    --tile-shadow-rest: 0 0.25em 0.75em rgba(0,0,0,0.04), 0 0.0625em 0.125em rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 0.75em 2em rgba(0,0,0,0.12), 0 0.25em 0.75em rgba(0,0,0,0.08);
    --dd-bg: rgba(255,255,255,0.92);
    --dd-border: rgba(255,255,255,0.60);
    position: relative;
    z-index: 1;
  }
  :host(.dd-open) {
    z-index: 9000;
  }
  :host(:not([use-profiles])[tile-size="compact"]) {
    --tile-row-h: 5.5em;
  }
  :host(:not([use-profiles])[tile-size="large"]) {
    --tile-row-h: 7.125em;
  }

  :host(.dark) {
    --dd-bg: rgba(58,58,60,0.92);
    --dd-border: rgba(255,255,255,0.08);
  }

  /* \u2500\u2500 Card surface overrides \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .card {
    width: 100%;
    gap: var(--_tunet-section-gap, 0.75em);
    overflow: visible;
    isolation: isolate;
  }
  .wrap {
    overflow: visible;
  }
  .card.no-header {
    gap: calc(var(--_tunet-section-gap, 0.75em) * 0.8);
  }

  /* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .hdr {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.25em;
    min-height: var(--_tunet-header-height, 2.625em);
  }
  .hdr-title {
    font-size: var(--_tunet-header-title-font, var(--_tunet-header-font, 1em));
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 0.5em;
  }
  .hdr-title .icon { color: var(--blue); }

  /* \u2500\u2500 Tile Grid \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-rows: var(--tile-row-h);
    align-items: stretch;
    gap: var(--_tunet-tile-gap, 0.375em);
    overflow: visible;
    isolation: isolate;
  }

  /* \u2500\u2500 Tile Surface \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile {
    background: var(--tile-bg);
    border-radius: var(--_tunet-tile-radius, var(--r-tile));
    box-shadow: var(--tile-shadow-rest);
    padding:
      var(--_tunet-status-pad-top, var(--_tunet-tile-pad, 0.875em))
      calc(var(--_tunet-tile-pad, 0.875em) * 0.57)
      var(--_tunet-status-pad-bottom, calc(var(--_tunet-tile-pad, 0.875em) * 0.57));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--_tunet-status-tile-gap, calc(var(--_tunet-tile-gap, 0.375em) * 0.85));
    cursor: pointer;
    transition: all .15s ease;
    position: relative;
    overflow: visible;
    min-width: 0;
    min-height: var(--tile-row-h);
    height: var(--tile-row-h);
  }
  .tile[data-type="dropdown"] {
    z-index: 1;
  }
  .tile[data-type="dropdown"].dropdown-open {
    z-index: 2000;
  }
  .tile[data-type="dropdown"].dropdown-open .tile-dd-menu {
    z-index: 6100;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile {
    padding: 0.5625em 0.4375em 0.4375em;
    gap: 0.1875em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile {
    padding: 1.875em 0.75em 0.875em;
    gap: 0.4375em;
  }
  .tile:hover { box-shadow: var(--tile-shadow-lift); }
  .tile:active { transform: scale(.97); }
  .tile:focus-visible {
    outline: 0.125em solid var(--blue);
    outline-offset: 0.1875em;
  }

  /* \u2500\u2500 Tile Icon Accents \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile-icon {
    width: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.375em));
    height: var(--_tunet-display-icon-box, var(--_tunet-icon-box, 2.375em));
    display: grid;
    place-items: center;
    margin-bottom: calc(var(--_tunet-tile-gap, 0.375em) * 0.3);
  }
  .tile-icon .tile-icon-glyph {
    font-size: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    width: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    height: var(--_tunet-display-icon-glyph, var(--_tunet-icon-glyph, 1.1875em));
    transform: none;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon {
    width: 1.3125em;
    height: 1.3125em;
    margin-bottom: 0.125em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-icon .tile-icon-glyph {
    font-size: 1.1875em;
    width: 1.1875em;
    height: 1.1875em;
    transform: none;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-icon {
    width: 1.875em; height: 1.875em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-icon .tile-icon-glyph {
    font-size: 1.625em;
    width: 1.625em;
    height: 1.625em;
  }
  .tile[data-accent="amber"] .tile-icon { color: var(--amber); }
  .tile[data-accent="amber"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="blue"] .tile-icon { color: var(--blue); }
  .tile[data-accent="blue"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="green"] .tile-icon { color: var(--green); }
  .tile[data-accent="green"] .tile-icon .icon { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .tile[data-accent="muted"] .tile-icon { color: var(--text-muted); }

  /* \u2500\u2500 Tile Values & Labels \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile-val {
    font-size: var(--_tunet-display-name-font, var(--type-value, 1.125em)); font-weight: 700; letter-spacing: -.0125em; line-height: 1.06;
    color: var(--text); font-variant-numeric: tabular-nums; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  :host([use-profiles]) .tile-val {
    line-height: 1.04;
    min-height: 1.14em;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val { font-size: var(--type-value, 1.0625em); line-height: 1.08; }
  :host(:not([use-profiles])[tile-size="large"]) .tile-val { font-size: 1.25em; }
  .tile-val.is-text {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-height: 1.1;
    text-align: center;
    font-size: var(--_tunet-name-font, 0.8125em);
    max-height: 2.3em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-text {
    font-size: 0.8375em;
    max-height: 2.35em;
  }
  .tile-val.is-long {
    font-size: 0.75em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-val.is-long {
    font-size: 0.8em;
  }
  .tile-label {
    font-size: var(--_tunet-display-value-font, var(--type-label, 0.8125em)); font-weight: 600; letter-spacing: .0125em; text-transform: uppercase;
    color: var(--text-muted); line-height: 1.12; text-align: center; white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis; max-width: 100%;
  }
  :host([use-profiles]) .tile-label {
    text-transform: none;
    letter-spacing: 0.01em;
    line-height: 1.04;
    min-height: 1.14em;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.02em;
    flex: 0 0 auto;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-label {
    font-size: var(--type-label, 0.8125em);
    letter-spacing: 0.00625em;
    text-transform: none;
    white-space: nowrap;
    display: block;
    line-height: 1.2;
    text-align: center;
    min-height: 1.2em;
  }
  :host(:not([use-profiles])[tile-size="large"]) .tile-label {
    font-size: 0.625em;
    letter-spacing: 0.034375em;
  }
  .tile-deg { font-size: 0.6em; vertical-align: baseline; position: relative; top: -0.18em; margin-left: -0.0625em; }
  .tile-secondary {
    font-size: var(--_tunet-display-meta-font, var(--type-sub, 0.6875em)); font-weight: 500; color: var(--text-sub); line-height: 1.12;
    text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 100%; margin-top: -0.0625em;
  }
  :host([use-profiles]) .tile-secondary {
    line-height: 1.08;
    margin-top: 0;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-secondary {
    font-size: var(--type-sub, 0.71875em);
  }
  .tile-secondary:empty { display: none; }

  /* \u2500\u2500 Status Dots \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .status-dot {
    width: 0.375em; height: 0.375em; border-radius: 62.5em;
    position: absolute; top: 0.625em; right: 0.625em;
    display: none;
  }
  .status-dot.green { background: var(--green); display: block; }
  .status-dot.amber { background: var(--amber); display: block; }
  .status-dot.red { background: var(--red); display: block; }
  .status-dot.blue { background: var(--blue); display: block; }
  .status-dot.muted { background: var(--text-muted); opacity: 0.5; display: block; }

  /* \u2500\u2500 Conditional Visibility \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile.tile-hidden {
    visibility: hidden !important;
    pointer-events: none !important;
  }

  /* \u2500\u2500 Aux Action Button \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile-aux {
    position: absolute;
    top: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    right: calc(var(--_tunet-tile-pad, 0.875em) * 0.45);
    min-height: calc(var(--_tunet-ctrl-min-h, 2.625em) * 0.7);
    padding: 0 calc(var(--_tunet-ctrl-pad-x, 0.75em) * 0.66);
    border-radius: 62.5em;
    border: 0.0625em solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-sub);
    font-family: inherit;
    font-size: calc(var(--_tunet-sub-font, 0.6875em) * 0.95);
    font-weight: 700;
    letter-spacing: 0.0125em;
    display: inline-flex;
    align-items: center;
    gap: 0.1875em;
    cursor: pointer;
    z-index: 2;
  }
  .tile-aux[hidden] { display: none !important; }
  .tile.has-aux-visible {
    padding-top: calc(var(--_tunet-ctrl-min-h, 2.625em) + 0.5em);
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile.has-aux-visible {
    padding-top: 1.875em;
  }
  .tile-aux:hover { box-shadow: var(--tile-shadow-rest); }
  .tile-aux:active { transform: scale(0.97); }
  .tile-aux.danger {
    color: var(--red);
    border-color: rgba(239,68,68,0.32);
    background: rgba(239,68,68,0.12);
  }

  /* \u2500\u2500 Timer Tile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile[data-type="timer"] .tile-val {
    font-size: var(--_tunet-timer-display-font, var(--_tunet-timer-font, 1.125em));
    letter-spacing: var(--_tunet-timer-ls, 0.03125em);
  }

  /* \u2500\u2500 Dropdown Tile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile-dd-val {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 0.125em;
    font-size: var(--_tunet-dropdown-value-font, var(--_tunet-value-font, 1.125em));
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    width: 100%;
    min-width: 0;
    padding: 0 0.125em;
  }
  :host(:not([use-profiles])[tile-size="compact"]) .tile-dd-val {
    font-size: 0.925em;
    gap: 0.1875em;
  }
  .tile-dd-val .dd-text {
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }
  .tile-dd-val .chevron {
    font-size: var(--_tunet-ctrl-icon-size, 1.25em);
    width: var(--_tunet-ctrl-icon-size, 1.25em);
    height: var(--_tunet-ctrl-icon-size, 1.25em);
    color: var(--text-muted);
    transition: transform .2s ease;
    flex-shrink: 0;
  }
  .tile-dd-val[aria-expanded="true"] .chevron {
    transform: rotate(180deg);
  }

  /* Dropdown menu */
  .tile-dd-menu {
    position: absolute;
    top: calc(100% + 0.25em);
    left: 50%;
    transform: translateX(-50%);
    min-width: 8.75em;
    max-width: 12.5em;
    max-height: var(--_tunet-dropdown-max-h, 15em);
    min-height: var(--_tunet-dropdown-min-h, 7.5em);
    overflow-y: auto;
    padding: 0.3125em;
    border-radius: var(--_tunet-dd-radius, 0.5em);
    background: var(--dd-bg);
    backdrop-filter: blur(1.5em); -webkit-backdrop-filter: blur(1.5em);
    border: 0.0625em solid var(--dd-border);
    box-shadow: var(--shadow-up);
    z-index: 6100;
    display: none;
    flex-direction: column;
    gap: 0.0625em;
  }
  .tile-dd-menu.open {
    display: flex;
    animation: ddMenuIn .14s ease forwards;
  }
  @keyframes ddMenuIn {
    from { opacity: 0; transform: translateX(-50%) translateY(-0.25em) scale(.97); }
    to { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }
  .tile-dd-opt {
    padding: var(--_tunet-dd-option-pad-y, 0.5625em) var(--_tunet-dd-option-pad-x, 0.75em);
    border-radius: var(--_tunet-dd-radius, 0.5em);
    border: none;
    background: transparent;
    font-family: inherit;
    font-size: var(--_tunet-dd-option-font, 0.8125em);
    font-weight: 600;
    color: var(--text);
    text-align: left;
    cursor: pointer;
    transition: background .1s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .tile-dd-opt:hover { background: var(--track-bg); }
  .tile-dd-opt:active { transform: scale(.97); }
  .tile-dd-opt.active {
    font-weight: 700;
    background: var(--blue-fill);
    color: var(--blue);
  }

  /* \u2500\u2500 Alarm Tile \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .tile[data-type="alarm"] {
    overflow: hidden;
  }

  /* Time pill badge */
  .alarm-time-pill {
    display: inline-flex;
    align-items: center;
    padding: 0.15em 0.5em;
    border-radius: var(--r-pill);
    font-size: var(--_tunet-alarm-pill-font, 0.9375em);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.01875em;
    line-height: 1.3;
    background: var(--blue-fill);
    color: var(--blue);
    transition: all 0.2s ease;
  }
  .tile[data-type="alarm"].alarm-off .alarm-time-pill {
    background: var(--track-bg);
    color: var(--text-muted);
    opacity: 0.6;
  }

  .tile[data-type="alarm"].alarm-set .tile-icon {
    color: var(--blue);
  }
  .tile[data-type="alarm"].alarm-set .tile-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .tile[data-type="alarm"].alarm-off .tile-icon {
    color: var(--text-muted);
    opacity: 0.5;
  }

  /* Ringing state */
  .tile[data-type="alarm"].alarm-ringing {
    background: var(--blue-fill);
    box-shadow: 0 0 0 0.0625em var(--blue), var(--tile-shadow-rest);
  }
  .tile[data-type="alarm"].alarm-ringing .tile-icon {
    color: var(--blue);
    animation: alarmBell 0.6s ease-in-out infinite alternate;
  }
  .tile[data-type="alarm"].alarm-ringing .tile-icon .icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
  }
  .tile[data-type="alarm"].alarm-ringing .alarm-time-pill {
    background: var(--blue);
    color: #fff;
  }
  @keyframes alarmBell {
    0% { transform: rotate(-8deg) scale(1); }
    50% { transform: rotate(8deg) scale(1.08); }
    100% { transform: rotate(-8deg) scale(1); }
  }

  /* Alarm action buttons (snooze / dismiss) */
  .alarm-actions {
    display: none;
    position: absolute;
    bottom: 0; left: 0; right: 0;
    padding: 0.375em;
    gap: 0.25em;
    justify-content: center;
    background: linear-gradient(to top, var(--tile-bg) 60%, transparent);
    z-index: 3;
  }
  .tile[data-type="alarm"].alarm-ringing .alarm-actions {
    display: flex;
    animation: alarmActionsIn 0.2s ease forwards;
  }
  @keyframes alarmActionsIn {
    from { opacity: 0; transform: translateY(0.25em); }
    to { opacity: 1; transform: translateY(0); }
  }
  .alarm-btn {
    border: none;
    border-radius: var(--r-pill);
    min-height: var(--_tunet-alarm-btn-h, 1.25em);
    padding: 0.25em 0.625em;
    font-family: inherit;
    font-size: var(--_tunet-alarm-btn-font, 0.5625em);
    font-weight: 700;
    letter-spacing: 0.01875em;
    text-transform: uppercase;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    transition: all 0.12s ease;
  }
  .alarm-btn .icon {
    font-size: var(--_tunet-alarm-icon-size, 0.6875em);
    width: var(--_tunet-alarm-icon-size, 0.6875em);
    height: var(--_tunet-alarm-icon-size, 0.6875em);
  }
  .alarm-btn:active { transform: scale(0.95); }
  .alarm-btn.snooze {
    background: var(--blue);
    color: #fff;
  }
  .alarm-btn.snooze:hover { opacity: 0.85; }
  .alarm-btn.dismiss {
    background: var(--ctrl-bg);
    border: 0.0625em solid var(--ctrl-border);
    color: var(--text-sub);
  }
  .alarm-btn.dismiss:hover { box-shadow: var(--tile-shadow-rest); }

  /* When ringing, push tile content up to make room for buttons */
  .tile[data-type="alarm"].alarm-ringing {
    padding-bottom: calc(var(--_tunet-alarm-btn-h, 1.25em) + 0.875em);
  }

  /* \u2500\u2500 Responsive \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  @media (max-width: 27.5em) {
    :host(:not([use-profiles])) .card { padding: var(--card-pad, 0.875em); }
    .tile { min-height: var(--tile-row-h); }
    :host(:not([use-profiles])[tile-size="compact"]) .tile {
      padding: 0.5625em 0.4375em 0.4375em;
      gap: 0.1875em;
    }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-val { font-size: 1.0625em; }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-label { font-size: 0.7em; }
    :host(:not([use-profiles])[tile-size="compact"]) .tile-secondary { font-size: 0.6375em; }
  }

${REDUCED_MOTION}
`;
var TunetStatusCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._timerIntervals = [];
    this._openDropdown = null;
    this._activeColumns = 4;
    this._haCardEl = null;
    this._haCardPrevPosition = null;
    this._haCardPrevZIndex = null;
    this._elevatedNodes = [];
    this._onDocClick = this._onDocClick.bind(this);
    this._onWindowResize = this._onWindowResize.bind(this);
    this._onHostResize = this._onHostResize.bind(this);
    this._resizeObserver = null;
    this._usingWindowResizeFallback = false;
    this._profileSelection = null;
    injectFonts();
  }
  connectedCallback() {
    document.addEventListener("click", this._onDocClick);
    this._setupResizeObserver();
    if (typeof ResizeObserver === "undefined") {
      this._usingWindowResizeFallback = true;
      window.addEventListener("resize", this._onWindowResize);
    } else {
      this._usingWindowResizeFallback = false;
    }
  }
  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
    if (this._usingWindowResizeFallback) {
      window.removeEventListener("resize", this._onWindowResize);
      this._usingWindowResizeFallback = false;
    }
    this._teardownResizeObserver();
    this._clearAllTimers();
    this._resetHostCardElevation();
  }
  _resolveResponsiveColumns(widthHint = null) {
    const baseColumns = this._config.columns || 4;
    const width = Number.isFinite(Number(widthHint)) ? Number(widthHint) : this._cardEl?.getBoundingClientRect?.().width || this.getBoundingClientRect?.().width || 1024;
    const rules = Array.isArray(this._config.column_breakpoints) ? this._config.column_breakpoints : [];
    for (const rule of rules) {
      const minWidth = rule.minWidth == null ? Number.NEGATIVE_INFINITY : rule.minWidth;
      const maxWidth = rule.maxWidth == null ? Number.POSITIVE_INFINITY : rule.maxWidth;
      if (width >= minWidth && width <= maxWidth) return rule.columns;
    }
    return baseColumns;
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
  _onHostResize(widthHint) {
    if (!this._rendered) return;
    this._applyProfile(widthHint);
    const nextColumns = this._resolveResponsiveColumns(widthHint);
    if (nextColumns === this._activeColumns) return;
    this._activeColumns = nextColumns;
    this._applyGridColumns();
  }
  _applyGridColumns() {
    if (!this._gridEl) return;
    const cols = this._activeColumns || this._config.columns || 4;
    this._gridEl.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
  }
  _onWindowResize() {
    this._onHostResize(this._cardEl?.getBoundingClientRect?.().width);
  }
  /* ═══════════════════════════════════════════════════
     CONFIG
     ═══════════════════════════════════════════════════ */
  static get configurable() {
    return true;
  }
  static getConfigForm() {
    return {
      schema: [
        { name: "name", selector: { text: {} } },
        { name: "show_header", selector: { boolean: {} } },
        { name: "columns", selector: { number: { min: 2, max: 8, step: 1, mode: "box" } } },
        { name: "column_breakpoints", selector: { object: {} } },
        { name: "tile_size", selector: { select: { options: ["compact", "standard", "large"] } } },
        { name: "use_profiles", selector: { boolean: {} } },
        {
          type: "expandable",
          title: "Advanced",
          icon: "mdi:code-braces",
          schema: [
            { name: "custom_css", selector: { text: { multiline: true } } }
          ]
        }
      ],
      computeLabel: (s) => {
        if (!s.name) return s.title || "";
        return {
          name: "Card Title",
          show_header: "Show Header",
          columns: "Columns",
          column_breakpoints: "Responsive Column Breakpoints",
          tile_size: "Tile Size",
          use_profiles: "Use Profile Sizing",
          custom_css: "Custom CSS (injected into shadow DOM)"
        }[s.name] || s.name;
      },
      computeHelper: (s) => ({
        column_breakpoints: "Example: [{max_width: 600, columns: 4}, {max_width: 1024, columns: 6}, {columns: 8}]",
        use_profiles: "When enabled, geometry is sourced from the indicator-tile profile family.",
        custom_css: "CSS rules injected into shadow DOM. Use .grid, .tile, etc."
      })[s.name] || ""
    };
  }
  static getStubConfig() {
    return { name: "Home Status", tile_size: "standard", use_profiles: true, tiles: [] };
  }
  setConfig(config) {
    const tileSizeRaw = String(config.tile_size || "standard").toLowerCase();
    const tileSize = tileSizeRaw === "regular" ? "standard" : tileSizeRaw === "compact" || tileSizeRaw === "large" ? tileSizeRaw : "standard";
    const useProfiles = config.use_profiles !== false;
    const columns = clampInt(config.columns, 2, 8, 4);
    const columnBreakpoints = normalizeColumnBreakpoints(config.column_breakpoints);
    this._config = {
      name: config.name || "Home Status",
      show_header: config.show_header !== false,
      columns,
      column_breakpoints: columnBreakpoints,
      tile_size: tileSize,
      use_profiles: useProfiles,
      custom_css: config.custom_css || "",
      tiles: (config.tiles || []).map((t) => {
        const type = t.type || "value";
        const base = {
          type,
          entity: t.entity || "",
          icon: normalizeStatusIcon(t.icon || "info"),
          label: t.label || "",
          accent: t.accent || "muted",
          show_when: t.show_when || null,
          tap_action: t.tap_action || null,
          aux_action: t.aux_action || null,
          aux_show_when: t.aux_show_when || null
        };
        if (type === "alarm") {
          base.playing_entity = t.playing_entity || "";
          base.snooze_action = t.snooze_action || null;
          base.dismiss_action = t.dismiss_action || null;
        } else if (type === "indicator") {
          base.format = t.format || "state";
          base.unit = t.unit || "";
          base.dot_rules = t.dot_rules || [];
        } else if (type === "timer") {
        } else if (type === "dropdown") {
        } else {
          base.unit = t.unit || "";
          base.format = t.format || "state";
          base.attribute = t.attribute || "";
          base.secondary = t.secondary ? {
            entity: t.secondary.entity || t.entity,
            attribute: t.secondary.attribute || ""
          } : null;
          if (t.status_dot && !t.dot_rules) {
            base.dot_rules = [{ match: "*", dot: t.status_dot }];
          } else {
            base.dot_rules = t.dot_rules || null;
          }
        }
        return base;
      })
    };
    if (useProfiles) this.setAttribute("use-profiles", "");
    else this.removeAttribute("use-profiles");
    this._applyProfile(this._getHostWidth());
    this._activeColumns = this._resolveResponsiveColumns();
    if (this._rendered) this._buildGrid();
  }
  /* ═══════════════════════════════════════════════════
     HA STATE
     ═══════════════════════════════════════════════════ */
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      this._rendered = true;
    }
    const isDark = detectDarkMode(hass);
    applyDarkClass(this, isDark);
    const relevantEntities = /* @__PURE__ */ new Set();
    for (const t of this._config.tiles) {
      if (t.entity) relevantEntities.add(t.entity);
      if (t.show_when && t.show_when.entity) relevantEntities.add(t.show_when.entity);
      if (t.aux_show_when && t.aux_show_when.entity) relevantEntities.add(t.aux_show_when.entity);
      if (t.secondary && t.secondary.entity) relevantEntities.add(t.secondary.entity);
      if (t.playing_entity) relevantEntities.add(t.playing_entity);
    }
    const changed = [...relevantEntities].some(
      (eid) => !oldHass || oldHass.states[eid] !== hass.states[eid]
    );
    if (changed || !oldHass) {
      this._evaluateVisibility();
      this._updateValues();
      this._syncTimers();
    }
  }
  getCardSize() {
    const cols = this._activeColumns || this._config.columns || 4;
    const rows = Math.ceil(this._config.tiles.length / cols);
    return Math.max(2, rows + 1);
  }
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
    const cardWidth = Number(this._cardEl?.getBoundingClientRect?.().width);
    if (Number.isFinite(cardWidth) && cardWidth > 0) return cardWidth;
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
    const selection = selectProfileSize({
      preset: "status",
      layout: "grid",
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
     RENDER
     ═══════════════════════════════════════════════════ */
  _render() {
    const style = document.createElement("style");
    style.textContent = TUNET_STATUS_STYLES;
    this.shadowRoot.innerHTML = "";
    this.shadowRoot.appendChild(style);
    this._customStyleEl = document.createElement("style");
    this._customStyleEl.textContent = this._config.custom_css || "";
    this.shadowRoot.appendChild(this._customStyleEl);
    const tpl = document.createElement("template");
    tpl.innerHTML = FONT_LINKS + `
      <div class="wrap">
        <div class="card">
          <div class="hdr">
            <div class="hdr-title">
              <span class="icon filled">home</span>
              <span id="title"></span>
            </div>
          </div>
          <div class="grid" id="grid"></div>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this._titleEl = this.shadowRoot.getElementById("title");
    this._hdrEl = this.shadowRoot.querySelector(".hdr");
    this._cardEl = this.shadowRoot.querySelector(".card");
    this._gridEl = this.shadowRoot.getElementById("grid");
    this._applyProfile(this._getHostWidth());
    this._activeColumns = this._resolveResponsiveColumns();
    this._applyGridColumns();
    this._applyHeaderVisibility();
    this._buildGrid();
  }
  _applyHeaderVisibility() {
    const showHeader = this._config.show_header !== false;
    if (this._hdrEl) this._hdrEl.hidden = !showHeader;
    if (this._cardEl) this._cardEl.classList.toggle("no-header", !showHeader);
  }
  _buildGrid() {
    if (!this._gridEl) return;
    this._gridEl.innerHTML = "";
    this._titleEl.textContent = this._config.name;
    this._applyHeaderVisibility();
    this._applyGridColumns();
    if (this._customStyleEl) this._customStyleEl.textContent = this._config.custom_css || "";
    this._tileEls = [];
    this._clearAllTimers();
    this._config.tiles.forEach((tile, i) => {
      const el = document.createElement("div");
      el.className = "tile";
      el.dataset.accent = tile.accent;
      el.dataset.type = tile.type;
      switch (tile.type) {
        case "alarm": {
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon || "alarm"}</span></div>
            <span class="alarm-time-pill" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
            <div class="alarm-actions" id="alarm-actions-${i}">
              ${tile.snooze_action ? `<button type="button" class="alarm-btn snooze" id="alarm-snooze-${i}"><span class="icon">snooze</span>Snooze</button>` : ""}
              ${tile.dismiss_action ? `<button type="button" class="alarm-btn dismiss" id="alarm-dismiss-${i}"><span class="icon">alarm_off</span>Stop</button>` : ""}
            </div>
          `;
          if (tile.snooze_action) {
            const snoozeBtn = el.querySelector(`#alarm-snooze-${i}`);
            if (snoozeBtn) {
              snoozeBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this._handleTapAction(tile.snooze_action, tile.entity);
              });
            }
          }
          if (tile.dismiss_action) {
            const dismissBtn = el.querySelector(`#alarm-dismiss-${i}`);
            if (dismissBtn) {
              dismissBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this._handleTapAction(tile.dismiss_action, tile.entity);
              });
            }
          }
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        }
        case "indicator":
          el.innerHTML = `
            <div class="status-dot" id="dot-${i}"></div>
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        case "timer":
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--:--</span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        case "dropdown":
          el.innerHTML = `
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <div class="tile-dd-val" id="ddval-${i}" aria-expanded="false">
              <span class="dd-text" id="val-${i}">--</span>
              <span class="icon chevron">expand_more</span>
            </div>
            <span class="tile-label">${tile.label}</span>
            <div class="tile-dd-menu" id="ddmenu-${i}"></div>
          `;
          this._bindTileAction(el, (e) => {
            e.stopPropagation();
            this._toggleDropdown(i);
          }, tile);
          el.setAttribute("aria-haspopup", "listbox");
          el.setAttribute("aria-expanded", "false");
          break;
        case "value":
        default: {
          let dotHTML = "";
          if (tile.dot_rules && tile.dot_rules.length > 0) {
            dotHTML = `<div class="status-dot" id="dot-${i}"></div>`;
          }
          el.innerHTML = `
            ${dotHTML}
            <div class="tile-icon"><span class="icon tile-icon-glyph">${tile.icon}</span></div>
            <span class="tile-val" id="val-${i}">--</span>
            <span class="tile-secondary" id="sec-${i}"></span>
            <span class="tile-label">${tile.label}</span>
          `;
          this._bindTileAction(el, () => this._fireMoreInfo(tile.entity), tile);
          break;
        }
      }
      let auxEl = null;
      if (tile.aux_action) {
        el.classList.add("has-aux");
        const auxBtn = document.createElement("button");
        auxBtn.type = "button";
        auxBtn.className = "tile-aux";
        const auxIcon = tile.aux_action.icon ? normalizeStatusIcon(tile.aux_action.icon) : "";
        const auxLabel = tile.aux_action.label || "Action";
        const looksDanger = String(auxLabel).toLowerCase().includes("reset");
        if (looksDanger) auxBtn.classList.add("danger");
        auxBtn.innerHTML = auxIcon ? `<span class="icon" style="font-size:0.75em;width:0.75em;height:0.75em">${auxIcon}</span><span>${auxLabel}</span>` : `<span>${auxLabel}</span>`;
        auxBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this._handleTapAction(tile.aux_action, tile.entity);
        });
        el.appendChild(auxBtn);
        auxEl = auxBtn;
      }
      this._gridEl.appendChild(el);
      this._tileEls.push({
        el,
        config: tile,
        index: i,
        auxEl,
        valEl: el.querySelector(`#val-${i}`),
        dotEl: el.querySelector(`#dot-${i}`),
        secEl: el.querySelector(`#sec-${i}`),
        ddMenuEl: tile.type === "dropdown" ? el.querySelector(`#ddmenu-${i}`) : null,
        ddValEl: tile.type === "dropdown" ? el.querySelector(`#ddval-${i}`) : null
      });
    });
    this._evaluateVisibility();
    this._updateValues();
    this._syncTimers();
  }
  _fireMoreInfo(entityId) {
    if (!entityId || !this._hass) return;
    this.dispatchEvent(new CustomEvent("hass-more-info", {
      bubbles: true,
      composed: true,
      detail: { entityId }
    }));
  }
  _bindTileAction(el, handler, tileConfig) {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    const activate = (e) => {
      if (tileConfig && tileConfig.tap_action) {
        this._handleTapAction(tileConfig.tap_action, tileConfig.entity);
        return;
      }
      handler(e);
    };
    el.addEventListener("click", activate);
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      activate(e);
    });
  }
  // ── Conditional Visibility ──
  _evaluateVisibility() {
    if (!this._hass || !this._tileEls) return;
    for (const tile of this._tileEls) {
      const { config, el, auxEl } = tile;
      const tileVisible = !config.show_when ? true : this._matchesShowWhen(this._hass.states[config.show_when.entity], config.show_when);
      el.classList.toggle("tile-hidden", !tileVisible);
      if (auxEl) {
        const auxVisible = !config.aux_show_when ? true : this._matchesShowWhen(this._hass.states[config.aux_show_when.entity], config.aux_show_when);
        auxEl.hidden = !(tileVisible && auxVisible);
        el.classList.toggle("has-aux-visible", tileVisible && auxVisible);
      }
    }
  }
  _matchesShowWhen(entity, condition) {
    if (!condition) return true;
    if (!entity) return false;
    const operator = condition.operator || "equals";
    const expected = condition.state;
    const sourceValue = condition.attribute ? entity.attributes?.[condition.attribute] : entity.state;
    const actual = String(sourceValue ?? "");
    const target = String(expected ?? "");
    const actualNum = Number(actual);
    const targetNum = Number(target);
    const bothNumeric = Number.isFinite(actualNum) && Number.isFinite(targetNum);
    switch (operator) {
      case "contains":
        return actual.includes(target);
      case "not_contains":
        return !actual.includes(target);
      case "not_equals":
        return bothNumeric ? actualNum !== targetNum : actual !== target;
      case "gt":
        return bothNumeric ? actualNum > targetNum : Number(actual) > Number(target);
      case "lt":
        return bothNumeric ? actualNum < targetNum : Number(actual) < Number(target);
      case "equals":
      default:
        return bothNumeric ? actualNum === targetNum : actual === target;
    }
  }
  _handleTapAction(tapAction, defaultEntityId) {
    runCardAction({
      element: this,
      hass: this._hass,
      actionConfig: tapAction,
      defaultEntityId
    });
  }
  // ── Value Updates ──
  _updateValues() {
    if (!this._hass || !this._tileEls) return;
    for (const tile of this._tileEls) {
      const { config, valEl, dotEl, secEl, ddMenuEl, ddValEl, index } = tile;
      if (!config.entity) {
        if (valEl) valEl.textContent = "--";
        continue;
      }
      const entity = this._hass.states[config.entity];
      if (!entity) {
        if (valEl) valEl.textContent = "?";
        continue;
      }
      switch (config.type) {
        case "alarm":
          this._updateAlarmTile(tile);
          break;
        case "indicator":
          this._updateIndicatorTile(valEl, dotEl, entity, config);
          break;
        case "timer":
          this._updateTimerTile(valEl, entity);
          break;
        case "dropdown":
          this._updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index);
          break;
        case "value":
        default:
          this._updateValueTile(valEl, dotEl, secEl, entity, config);
          break;
      }
    }
  }
  _updateValueTile(valEl, dotEl, secEl, entity, config) {
    let val = config.attribute ? entity.attributes[config.attribute] != null ? entity.attributes[config.attribute] : "?" : entity.state;
    const unit = config.unit;
    if (config.format === "integer") {
      const numStr = String(val).replace(/%/g, "").trim();
      val = Math.round(Number(numStr));
      if (isNaN(val)) val = String(entity.state).replace(/%/g, "").trim() || "\u2014";
    } else if (config.format === "float1") {
      const numStr = String(val).replace(/%/g, "").trim();
      val = Number(numStr).toFixed(1);
      if (val === "NaN") val = "\u2014";
    } else if (config.format === "time") {
      val = this._formatLocalTime(val);
    } else if (config.format === "state") {
      val = humanizeStateValue(val);
    }
    this._renderValWithUnit(valEl, val, unit);
    if (dotEl && config.dot_rules) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules);
    }
    if (secEl && config.secondary) {
      const secEntity = this._hass.states[config.secondary.entity];
      if (secEntity && config.secondary.attribute) {
        let secVal = secEntity.attributes[config.secondary.attribute];
        if (Array.isArray(secVal)) {
          secVal = secVal.map((m) => m && m.name || String(m)).join(", ");
        }
        secEl.textContent = secVal != null ? String(secVal) : "";
      } else {
        secEl.textContent = "";
      }
    } else if (secEl) {
      secEl.textContent = "";
    }
  }
  _updateIndicatorTile(valEl, dotEl, entity, config) {
    let val = entity.state;
    if (config.format === "integer") val = Math.round(Number(val));
    else if (config.format === "float1") val = Number(val).toFixed(1);
    this._renderValWithUnit(valEl, val, config.unit);
    if (dotEl) {
      this._applyDotRules(dotEl, entity.state, config.dot_rules || []);
    }
  }
  _updateAlarmTile(tileData) {
    const { el, config, valEl } = tileData;
    if (!this._hass) return;
    const entity = this._hass.states[config.entity];
    const alarmTime = entity ? entity.state : "--:--";
    const isSet = entity && alarmTime && alarmTime !== "--:--" && alarmTime !== "unknown" && alarmTime !== "unavailable";
    const playingEntity = config.playing_entity ? this._hass.states[config.playing_entity] : null;
    const isRinging = playingEntity && (playingEntity.state === "True" || playingEntity.state === "true" || playingEntity.state === "on");
    if (valEl) {
      valEl.textContent = isSet ? alarmTime : "--:--";
    }
    el.classList.toggle("alarm-set", isSet && !isRinging);
    el.classList.toggle("alarm-off", !isSet && !isRinging);
    el.classList.toggle("alarm-ringing", isRinging);
    el.dataset.accent = isSet || isRinging ? "blue" : "muted";
  }
  _renderValWithUnit(valEl, val, unit) {
    const textValue = String(val ?? "");
    const isNumericText = /^-?\d+(\.\d+)?$/.test(textValue.trim());
    valEl.classList.toggle("is-text", !unit && !isNumericText);
    valEl.classList.toggle("is-long", textValue.length > 10);
    if (unit === "\xB0F" || unit === "\xB0C" || unit === "\xB0") {
      valEl.innerHTML = `${val}<span class="tile-deg">&deg;</span>${unit === "\xB0F" ? "F" : unit === "\xB0C" ? "C" : ""}`;
    } else if (unit) {
      valEl.innerHTML = `${val}<span class="tile-deg">${unit}</span>`;
    } else {
      valEl.textContent = val;
    }
  }
  _formatLocalTime(rawValue) {
    if (rawValue == null || rawValue === "") return "\u2014";
    let date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) {
      const numeric = Number(rawValue);
      if (Number.isFinite(numeric)) {
        date = new Date(numeric > 1e12 ? numeric : numeric * 1e3);
      }
    }
    if (Number.isNaN(date.getTime())) return String(rawValue);
    try {
      return new Intl.DateTimeFormat(void 0, {
        hour: "numeric",
        minute: "2-digit"
      }).format(date);
    } catch (_) {
      return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    }
  }
  _applyDotRules(dotEl, state, rules) {
    const stateStr = String(state);
    let dotColor = "";
    for (const rule of rules) {
      if (rule.match === "*" || stateStr === rule.match || stateStr.includes(rule.match)) {
        dotColor = rule.dot;
        break;
      }
    }
    dotEl.className = dotColor ? `status-dot ${dotColor}` : "status-dot";
  }
  _updateTimerTile(valEl, entity) {
    if (entity.state !== "active") {
      valEl.textContent = "--:--";
      return;
    }
    const remaining = entity.attributes.remaining;
    if (!remaining) {
      valEl.textContent = "--:--";
      return;
    }
    const parts = String(remaining).split(":").map(Number);
    let snapshotSeconds;
    if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
    else {
      valEl.textContent = "--:--";
      return;
    }
    const elapsed = Math.floor((Date.now() - new Date(entity.last_updated).getTime()) / 1e3);
    const currentSeconds = Math.max(0, snapshotSeconds - elapsed);
    valEl.textContent = this._formatFromSeconds(currentSeconds);
  }
  _updateDropdownTile(valEl, ddMenuEl, ddValEl, entity, config, index) {
    valEl.textContent = entity.state;
    const options = entity.attributes.options || [];
    const current = entity.state;
    ddMenuEl.innerHTML = "";
    for (const opt of options) {
      const btn = document.createElement("button");
      btn.className = "tile-dd-opt";
      if (opt === current) btn.classList.add("active");
      btn.textContent = opt;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this._selectDropdownOption(config.entity, opt, index);
      });
      ddMenuEl.appendChild(btn);
    }
  }
  // ── Timer Interval Management ──
  _syncTimers() {
    this._clearAllTimers();
    if (!this._hass || !this._tileEls) return;
    for (const tile of this._tileEls) {
      if (tile.config.type !== "timer") continue;
      const entity = this._hass.states[tile.config.entity];
      if (!entity || entity.state !== "active") continue;
      const remaining = entity.attributes.remaining;
      if (!remaining) continue;
      const parts = String(remaining).split(":").map(Number);
      let snapshotSeconds;
      if (parts.length === 3) snapshotSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) snapshotSeconds = parts[0] * 60 + parts[1];
      else continue;
      const snapshotTime = new Date(entity.last_updated).getTime();
      const elapsed = Math.floor((Date.now() - snapshotTime) / 1e3);
      let currentSeconds = Math.max(0, snapshotSeconds - elapsed);
      tile.valEl.textContent = this._formatFromSeconds(currentSeconds);
      const intervalId = setInterval(() => {
        currentSeconds = Math.max(0, currentSeconds - 1);
        tile.valEl.textContent = this._formatFromSeconds(currentSeconds);
        if (currentSeconds <= 0) clearInterval(intervalId);
      }, 1e3);
      this._timerIntervals.push(intervalId);
    }
  }
  _clearAllTimers() {
    if (this._timerIntervals) {
      for (const id of this._timerIntervals) clearInterval(id);
    }
    this._timerIntervals = [];
  }
  _formatFromSeconds(totalSeconds) {
    if (totalSeconds <= 0) return "0:00";
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor(totalSeconds % 3600 / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  // ── Dropdown ──
  _toggleDropdown(index) {
    const tile = this._tileEls[index];
    if (!tile || !tile.ddMenuEl) return;
    const isOpen = tile.ddMenuEl.classList.contains("open");
    this._closeAllDropdowns();
    if (!isOpen) {
      this._elevateHostCard();
      this.classList.add("dd-open");
      tile.ddMenuEl.classList.add("open");
      tile.ddValEl.setAttribute("aria-expanded", "true");
      tile.el.setAttribute("aria-expanded", "true");
      tile.el.classList.add("dropdown-open");
      this._openDropdown = index;
      requestAnimationFrame(() => {
        const menuEl = tile.ddMenuEl;
        const tileRect = tile.el.getBoundingClientRect();
        const menuRect = menuEl.getBoundingClientRect();
        const viewH = window.innerHeight;
        const spaceBelow = viewH - tileRect.bottom - 8;
        const spaceAbove = tileRect.top - 8;
        const menuH = menuRect.height;
        if (menuH > spaceBelow && spaceAbove > spaceBelow) {
          menuEl.style.top = "auto";
          menuEl.style.bottom = "calc(100% + 0.25em)";
          if (menuH > spaceAbove) {
            menuEl.style.maxHeight = `${Math.max(120, spaceAbove - 8)}px`;
          }
        } else if (menuH > spaceBelow) {
          menuEl.style.maxHeight = `${Math.max(120, spaceBelow - 8)}px`;
        }
      });
    }
  }
  _closeAllDropdowns() {
    if (!this._tileEls) return;
    this.classList.remove("dd-open");
    this._resetHostCardElevation();
    for (const tile of this._tileEls) {
      tile.el.classList.remove("dropdown-open");
      if (tile.ddMenuEl) {
        tile.ddMenuEl.classList.remove("open");
        tile.ddMenuEl.style.top = "";
        tile.ddMenuEl.style.bottom = "";
        tile.ddMenuEl.style.maxHeight = "";
      }
      if (tile.ddValEl) {
        tile.ddValEl.setAttribute("aria-expanded", "false");
      }
      tile.el.setAttribute("aria-expanded", "false");
    }
    this._openDropdown = null;
  }
  async _selectDropdownOption(entityId, option, tileIndex) {
    if (!this._hass) return;
    const tile = this._tileEls[tileIndex];
    if (tile?.ddValEl) {
      const labelEl = tile.ddValEl.querySelector(".dd-text");
      if (labelEl) labelEl.textContent = option;
    }
    this._closeAllDropdowns();
    const rawEntity = String(entityId || "").trim();
    const domainFromEntity = rawEntity.split(".")[0] || "";
    const domainOrder = domainFromEntity === "input_select" ? ["input_select", "select"] : domainFromEntity === "select" ? ["select", "input_select"] : ["input_select", "select"];
    for (const domain of domainOrder) {
      try {
        await Promise.resolve(this._hass.callService(domain, "select_option", {
          entity_id: rawEntity,
          option: String(option)
        }));
        return;
      } catch (_) {
      }
    }
  }
  _onDocClick(e) {
    if (this._openDropdown === null) return;
    const path = e.composedPath();
    const tile = this._tileEls[this._openDropdown];
    if (tile && !path.includes(tile.el)) {
      this._closeAllDropdowns();
    }
  }
  _elevateHostCard() {
    this._resetHostCardElevation();
    const candidates = [
      this.closest("ha-card"),
      this.closest("hui-card"),
      this.closest("hui-section")
    ].filter(Boolean);
    this._elevatedNodes = candidates.map((node) => ({
      node,
      position: node.style.position,
      zIndex: node.style.zIndex,
      overflow: node.style.overflow
    }));
    for (const entry of this._elevatedNodes) {
      const node = entry.node;
      if (!node.style.position) node.style.position = "relative";
      node.style.zIndex = "9100";
      node.style.overflow = "visible";
    }
    this._haCardEl = this._elevatedNodes[0]?.node || null;
    this._haCardPrevPosition = this._elevatedNodes[0]?.position || null;
    this._haCardPrevZIndex = this._elevatedNodes[0]?.zIndex || null;
  }
  _resetHostCardElevation() {
    for (const entry of this._elevatedNodes || []) {
      entry.node.style.position = entry.position || "";
      entry.node.style.zIndex = entry.zIndex || "";
      entry.node.style.overflow = entry.overflow || "";
    }
    this._elevatedNodes = [];
    this._haCardEl = null;
    this._haCardPrevPosition = null;
    this._haCardPrevZIndex = null;
  }
};
registerCard("tunet-status-card", TunetStatusCard, {
  name: "Tunet Status Card",
  description: "Home status grid with typed tiles and glassmorphism design"
});
logCardVersion("TUNET-STATUS", CARD_VERSION, "#007AFF");
//# sourceMappingURL=tunet_status_card.js.map
