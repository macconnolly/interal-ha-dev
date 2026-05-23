/**
 * Tunet Alarm Card v1.0.0
 *
 * Sonos alarm list surface. Tap = toggle switch. Hold (400ms) = open edit popup
 * via script.sonos_load_alarm_for_edit, which populates edit buffers and invokes
 * browser_mod.popup with popup_card_id: tunet-alarm-edit (see AGENTS.md §3
 * alarm-edit-popup exception).
 *
 * Default target set (post-SA0, live 2026-04-23):
 *   - switch.sonos_alarm_bedroom        (Sonos alarm_id 42, 05:30 WEEKDAYS)
 *   - switch.sonos_alarm_bath           (37, 17:00 WEEKDAYS)
 * Weekend variants (bedroom_weekend, bath_weekend) are opt-in via YAML.
 */

import {
  TOKENS,
  RESET, BASE_FONT, ICON_BASE,
  SECTION_SURFACE,
  REDUCED_MOTION, FONT_LINKS,
  injectFonts, detectDarkMode, applyDarkClass,
  registerCard, logCardVersion,
  renderConfigPlaceholder,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   CSS — Card-specific
   ═══════════════════════════════════════════════════════════════ */

const CARD_OVERRIDES = `
  :host {
    display: block;
    font-size: 16px; /* em anchor (D21-RESOLVED) */
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }

  .section-container {
    gap: var(--_tunet-section-gap, 0.875em);
    width: 100%;
  }

  .section-container::before {
    content: "";
    position: absolute; inset: 0;
    border-radius: var(--r-section);
    padding: 1px; pointer-events: none; z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255,0.40),
      rgba(255,255,255,0.06) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.14));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .section-container::before {
    background: linear-gradient(160deg,
      rgba(255,255,255,0.14),
      rgba(255,255,255,0.03) 40%,
      rgba(255,255,255,0.01) 60%,
      rgba(255,255,255,0.08));
  }
`;

const CARD_STYLES = `
  /* ── Header ─────────────────────────────────────── */
  .section-hdr {
    display: flex; align-items: center; gap: 0.625em;
    position: relative; z-index: 1;
  }
  .section-title {
    font-size: var(--_tunet-section-font, 0.9375em);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--text);
    display: flex; align-items: center; gap: 0.5em;
    flex: 1; min-width: 0;
  }
  .section-title .icon {
    font-size: var(--_tunet-icon-glyph, 1.25em);
  }
  .next-badge {
    font-size: var(--type-chip, 0.8125em);
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: -0.005em;
    white-space: nowrap;
  }
  .next-badge strong {
    color: var(--text);
    font-weight: 700;
  }

  /* ── Alarm list ─────────────────────────────────── */
  .alarm-list {
    display: flex;
    flex-direction: column;
    gap: 0;
    position: relative;
    z-index: 1;
  }

  .alarm-row {
    display: flex;
    align-items: center;
    gap: 0.75em;
    padding: var(--_tunet-tile-pad, 0.875em) 0.25em;
    min-height: var(--_tunet-tile-min-h, 3.25em);
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      background var(--motion-ui) var(--ease-standard);
    border-radius: calc(var(--_tunet-tile-radius, 0.875em) * 0.72);
    position: relative;
  }
  @media (hover: hover) {
    .alarm-row:hover { background: var(--gray-ghost); }
  }
  .alarm-row:active {
    transform: scale(var(--press-scale));
  }
  .alarm-row:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  .alarm-row[data-held="true"] {
    transform: scale(0.96);
  }

  /* Divider */
  .alarm-row + .alarm-row::before {
    content: "";
    position: absolute;
    top: 0;
    left: calc(2.25em + 0.75em + 0.25em);
    right: 0.25em;
    height: 1px;
    background: var(--divider);
  }

  /* Icon */
  .alarm-icon {
    width: var(--_tunet-display-icon-box, 2.25em);
    height: var(--_tunet-display-icon-box, 2.25em);
    border-radius: calc(var(--_tunet-tile-radius, 0.875em) * 0.7);
    display: grid; place-items: center;
    flex-shrink: 0;
    transition: color var(--motion-ui) ease, background var(--motion-ui) ease;
  }
  .alarm-icon .icon {
    font-size: var(--_tunet-display-icon-glyph, 1.25em);
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  /* Accent colors */
  .alarm-row[data-accent="amber"]  .alarm-icon { background: var(--amber-fill);  color: var(--amber); }
  .alarm-row[data-accent="blue"]   .alarm-icon { background: var(--blue-fill);   color: var(--blue); }
  .alarm-row[data-accent="green"]  .alarm-icon { background: var(--green-fill);  color: var(--green); }
  .alarm-row[data-accent="purple"] .alarm-icon { background: var(--purple-fill); color: var(--purple); }
  .alarm-row[data-accent="muted"]  .alarm-icon { background: var(--track-bg);    color: var(--text-muted); }
  /* Off state: dim icon */
  .alarm-row[data-on="false"] .alarm-icon { opacity: 0.55; }

  /* Info */
  .alarm-info {
    flex: 1; min-width: 0;
    display: flex; flex-direction: column; gap: 0.125em;
  }
  .alarm-label {
    font-size: var(--_tunet-display-name-font, var(--type-label, 0.8125em));
    font-weight: 600;
    color: var(--text); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .alarm-sub {
    font-size: var(--type-sub, 0.6875em); font-weight: 500;
    color: var(--text-muted); line-height: 1.2;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Time + State */
  .alarm-time {
    font-size: var(--_tunet-display-value-font, var(--type-value, 1.125em));
    font-weight: 700;
    letter-spacing: -0.01em;
    line-height: 1;
    color: var(--text);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    transition: color var(--motion-ui) ease;
  }
  .alarm-row[data-on="false"] .alarm-time {
    color: var(--text-muted);
  }

  /* State dot */
  .alarm-dot {
    width: 0.5em; height: 0.5em;
    border-radius: 50%;
    flex-shrink: 0;
    margin-left: 0.5em;
    background: var(--track-bg);
    transition: background var(--motion-ui) ease;
  }
  .alarm-row[data-on="true"][data-accent="amber"]  .alarm-dot { background: var(--amber); }
  .alarm-row[data-on="true"][data-accent="blue"]   .alarm-dot { background: var(--blue); }
  .alarm-row[data-on="true"][data-accent="green"]  .alarm-dot { background: var(--green); }
  .alarm-row[data-on="true"][data-accent="purple"] .alarm-dot { background: var(--purple); }
  .alarm-row[data-on="true"][data-accent="muted"]  .alarm-dot { background: var(--text-muted); }

  /* Empty / unavailable */
  .alarm-empty {
    padding: calc(var(--_tunet-section-pad, 1em) * 1.2);
    text-align: center;
    color: var(--text-muted);
    font-size: var(--type-label, 0.8125em);
    font-weight: 500;
  }

  /* ── Quick-action strip ─────────────────────────── */
  .qa-strip {
    display: flex;
    flex-direction: row;
    gap: 0.5em;
    padding-top: 0.5em;
    border-top: 1px solid var(--divider);
    margin-top: 0.25em;
    flex-wrap: wrap;
  }
  .qa-btn {
    flex: 1 1 auto;
    min-width: 5em;
    min-height: var(--_tunet-ctrl-min-h, 2.375em);
    padding: 0.4em 0.75em;
    border-radius: var(--r-pill, 999px);
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    color: var(--text);
    font-size: var(--type-chip, 0.8125em);
    font-weight: 600;
    letter-spacing: -0.005em;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    transition: transform var(--motion-fast) var(--ease-emphasized), background var(--motion-ui) ease;
    display: inline-flex; align-items: center; justify-content: center; gap: 0.375em;
  }
  .qa-btn:active { transform: scale(var(--press-scale)); }
  .qa-btn:focus-visible {
    outline: var(--focus-ring-width) solid var(--focus-ring-color);
    outline-offset: var(--focus-ring-offset);
  }
  @media (hover: hover) {
    .qa-btn:hover { background: var(--gray-ghost); }
  }
  .qa-btn .icon {
    font-size: 1.1em;
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  }

  /* ── Mobile ─────────────────────────────────────── */
  @media (max-width: 440px) {
    .alarm-row {
      gap: 0.625em;
      padding: 0.625em 0.125em;
    }
    .qa-strip { gap: 0.375em; }
    .qa-btn { font-size: 0.78em; min-width: 4.5em; padding: 0.35em 0.625em; }
  }
`;

const ALARM_ALL_STYLES = `${TOKENS} ${RESET} ${BASE_FONT} ${ICON_BASE} ${SECTION_SURFACE} ${CARD_OVERRIDES} ${CARD_STYLES} ${REDUCED_MOTION}`;

const ALARM_TEMPLATE = `
  ${FONT_LINKS}
  <div class="card-wrap">
    <div class="section-container">
      <div class="section-hdr">
        <span class="section-title">
          <span class="icon filled" style="color: var(--amber)">alarm</span>
          <span id="titleText">Alarms</span>
        </span>
        <span class="next-badge" id="nextBadge"></span>
      </div>
      <div class="alarm-list" id="alarmList"></div>
      <div class="qa-strip" id="qaStrip"></div>
    </div>
  </div>
`;

/* ═══════════════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════════════ */

const ROOM_ACCENT = {
  bedroom: 'amber',
  bath: 'blue',
  bathroom: 'blue',
  kitchen: 'purple',
  living_room: 'green',
  dining_room: 'green',
  office: 'muted',
};

const RECURRENCE_LABEL = {
  DAILY: 'Every day',
  WEEKDAYS: 'Weekdays',
  WEEKENDS: 'Weekends',
  ONCE: 'Once',
};

function humanRecurrence(raw) {
  if (!raw) return '';
  const upper = String(raw).toUpperCase();
  if (RECURRENCE_LABEL[upper]) return RECURRENCE_LABEL[upper];
  if (upper.startsWith('ON_')) return 'Custom';
  return raw;
}

function inferRoom(entityId, label) {
  const fromLabel = String(label || '').toLowerCase();
  for (const room of Object.keys(ROOM_ACCENT)) {
    if (fromLabel.includes(room.replace('_', ' '))) return room;
  }
  const fromId = String(entityId || '').toLowerCase();
  for (const room of Object.keys(ROOM_ACCENT)) {
    if (fromId.includes(room)) return room;
  }
  return 'muted';
}

// Quick-action contract:
//   weekday/weekend  — fire-once enables (no toggle; pressing them turns the corresponding pair ON)
//   all              — context-aware toggle: reads sensor.sonos_enabled_alarm_count and
//                      flips between "All On" (count=0) and "All Off" (count>0)
//   snooze           — conditional: only renders when sensor.sonos_alarm_playing reports an active alarm
const QA_ACTIONS = [
  { id: 'weekday', name: 'Weekday', icon: 'calendar_month', script: 'sonos_enable_weekday_alarms' },
  { id: 'weekend', name: 'Weekend', icon: 'weekend',        script: 'sonos_enable_weekend_alarms' },
  { id: 'all',     name: 'All Off', icon: 'alarm_off',      contextual: true },
  { id: 'snooze',  name: 'Snooze',  icon: 'snooze',         script: 'sonos_snooze_next_alarm', conditional: 'playing' },
];

const HOLD_MS = 400;

function isAlarmPlaying(hass) {
  const s = hass?.states?.['sensor.sonos_alarm_playing'];
  if (!s) return false;
  // Sensor returns Python "True"/"False" strings or "on"/"off"; accept any truthy + non-empty speaker
  const state = String(s.state || '').toLowerCase();
  if (state === 'true' || state === 'on' || state === 'playing') return true;
  if (s.attributes?.speaker && String(s.attributes.speaker).trim() !== '') return true;
  if (s.attributes?.alarm_entity && String(s.attributes.alarm_entity).trim() !== '') return true;
  return false;
}

function enabledAlarmCount(hass) {
  const s = hass?.states?.['sensor.sonos_enabled_alarm_count'];
  if (!s) return null;
  const n = Number(s.state);
  return Number.isFinite(n) ? n : null;
}

/* ═══════════════════════════════════════════════════════════════
   Card Class
   ═══════════════════════════════════════════════════════════════ */

class TunetAlarmCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass = null;
    this._rendered = false;
    this._rowRefs = [];
    this._prevValues = {};
    this._holdTimer = null;
    this._holdFired = false;
    injectFonts();
  }

  static get configurable() { return true; }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'show_quick_actions', selector: { boolean: {} } },
        {
          name: 'alarms',
          selector: {
            object: {
              multiple: true,
              label_field: 'label',
              description_field: 'entity',
              fields: {
                entity: { label: 'Alarm Switch', required: true, selector: { entity: { domain: 'switch' } } },
                label:  { label: 'Label', selector: { text: {} } },
                room:   { label: 'Room', selector: { select: { options: ['bedroom', 'bath', 'kitchen', 'living_room', 'dining_room', 'office'] } } },
              },
            },
          },
        },
      ],
      computeLabel: (s) => ({
        title: 'Header Title',
        show_quick_actions: 'Show Quick Actions',
        alarms: 'Alarms',
      }[s.name] || s.name),
    };
  }

  static getStubConfig() {
    return {
      title: 'Alarms',
      show_quick_actions: true,
      alarms: [
        { entity: 'switch.sonos_alarm_bedroom', label: 'Bedroom Weekdays', room: 'bedroom' },
        { entity: 'switch.sonos_alarm_bath',    label: 'Bath Weekdays',    room: 'bath' },
      ],
    };
  }

  setConfig(config) {
    if (!config.alarms || !Array.isArray(config.alarms) || config.alarms.length === 0) {
      this._config = { _needsConfig: true };
      renderConfigPlaceholder(this.shadowRoot, 'Add alarm entities to get started', 'Alarm');
      return;
    }
    this._config = {
      title: config.title || 'Alarms',
      show_quick_actions: config.show_quick_actions !== false,
      alarms: config.alarms,
    };
    if (this._rendered && this._hass) {
      this._buildRows();
      this._buildQAStrip();
      this._updateAll(true);
    }
  }

  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    // PA04c defect: if HA called the hass setter before a valid setConfig()
    // path completed (or with the _needsConfig placeholder), _buildRows()
    // would read this._config.alarms without guards. Skip the rendered-once
    // path entirely when no valid alarms config is present.
    if (!this._rendered && this._config && !this._config._needsConfig && Array.isArray(this._config.alarms)) {
      this._render();
      this._buildRows();
      this._buildQAStrip();
      this._setupListeners();
      this._rendered = true;
    }
    applyDarkClass(this, detectDarkMode(hass));
    this._updateAll(!oldHass);
  }

  getCardSize() { return 1 + (this._config.alarms || []).length + (this._config.show_quick_actions ? 1 : 0); }

  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12 };
  }

  /* ── Render ─────────────────────────────────────── */

  _render() {
    const style = document.createElement('style');
    style.textContent = ALARM_ALL_STYLES;
    this.shadowRoot.appendChild(style);
    const tpl = document.createElement('template');
    tpl.innerHTML = ALARM_TEMPLATE;
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$ = {
      titleText: this.shadowRoot.getElementById('titleText'),
      nextBadge: this.shadowRoot.getElementById('nextBadge'),
      alarmList: this.shadowRoot.getElementById('alarmList'),
      qaStrip:   this.shadowRoot.getElementById('qaStrip'),
    };
  }

  _buildRows() {
    const list = this.$.alarmList;
    list.innerHTML = '';
    this._rowRefs = [];
    this._prevValues = {};
    this.$.titleText.textContent = this._config.title;

    if (!this._config.alarms.length) {
      list.innerHTML = '<div class="alarm-empty">No alarms configured</div>';
      return;
    }

    for (const cfg of this._config.alarms) {
      const room = cfg.room || inferRoom(cfg.entity, cfg.label);
      const accent = ROOM_ACCENT[room] || 'muted';
      const row = document.createElement('div');
      row.className = 'alarm-row';
      row.dataset.entity = cfg.entity || '';
      row.dataset.accent = accent;
      row.dataset.on = 'false';
      row.setAttribute('role', 'button');
      row.setAttribute('tabindex', '0');
      row.innerHTML = `
        <div class="alarm-icon"><span class="icon filled">alarm</span></div>
        <div class="alarm-info">
          <span class="alarm-label">${escapeHtml(cfg.label || cfg.entity || '')}</span>
          <span class="alarm-sub"></span>
        </div>
        <span class="alarm-time">--:--</span>
        <span class="alarm-dot"></span>
      `;
      list.appendChild(row);
      this._rowRefs.push({
        el: row, cfg,
        labelEl: row.querySelector('.alarm-label'),
        subEl:   row.querySelector('.alarm-sub'),
        timeEl:  row.querySelector('.alarm-time'),
      });
    }
  }

  _buildQAStrip() {
    const strip = this.$.qaStrip;
    strip.innerHTML = '';
    if (!this._config.show_quick_actions) { strip.style.display = 'none'; return; }
    strip.style.display = '';
    const playing = isAlarmPlaying(this._hass);
    const enabled = enabledAlarmCount(this._hass);
    // Resolve target state. Honor an active optimistic-flip override (set on click)
    // until either the live count matches the predicted target or the override expires.
    let someOn = enabled !== null && enabled > 0;
    if (this._optimisticAllFlip) {
      const expired = Date.now() > this._optimisticAllFlip.expiresAt;
      const predictedOn = this._optimisticAllFlip.predictedOn;
      // PA04b defect: previously hardcoded `enabled === 4` assumed exactly
      // 4 alarms; cards configured with 2, 6, or any other count would wait
      // for the 8s timeout instead of clearing optimistically when the live
      // count reached the actual configured total. Fix: derive target from
      // this._config.alarms.length so the clear condition scales with the
      // configured alarm count.
      const targetCount = Array.isArray(this._config?.alarms) ? this._config.alarms.length : 0;
      const matched = (predictedOn && enabled === targetCount) || (!predictedOn && enabled === 0);
      if (expired || matched) {
        this._optimisticAllFlip = null;
      } else {
        someOn = predictedOn;
      }
    }
    for (const action of QA_ACTIONS) {
      // Conditional: hide Snooze unless an alarm is currently playing
      if (action.conditional === 'playing' && !playing) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'qa-btn';
      btn.dataset.action = action.id;
      let label = action.name;
      let icon = action.icon;
      if (action.contextual && action.id === 'all') {
        label = someOn ? 'All Off' : 'All On';
        icon  = someOn ? 'alarm_off' : 'alarm_on';
        btn.dataset.flip = someOn ? 'off' : 'on';
      }
      btn.innerHTML = `<span class="icon">${icon}</span><span>${label}</span>`;
      strip.appendChild(btn);
    }
  }

  /* ── Listeners ──────────────────────────────────── */

  _setupListeners() {
    this.$.alarmList.addEventListener('pointerdown', (e) => this._onRowPointerDown(e));
    this.$.alarmList.addEventListener('pointerup',   (e) => this._onRowPointerUp(e));
    this.$.alarmList.addEventListener('pointermove', (e) => this._onRowPointerMove(e));
    this.$.alarmList.addEventListener('pointercancel', () => this._cancelHold());
    this.$.alarmList.addEventListener('pointerleave',  () => this._cancelHold());

    this.$.alarmList.addEventListener('keydown', (e) => {
      const row = e.target.closest('.alarm-row');
      if (!row) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._toggleAlarm(row.dataset.entity);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        this._openEdit(row.dataset.entity);
      }
    });

    this.$.qaStrip.addEventListener('click', (e) => {
      const btn = e.target.closest('.qa-btn');
      if (!btn) return;
      const action = QA_ACTIONS.find(a => a.id === btn.dataset.action);
      if (!action) return;
      // Context-aware "all" routes to enable_all (count=0 case) or disable_all
      if (action.contextual && action.id === 'all') {
        // dataset.flip='off' → current label "All Off" (count>0) → click fires disable
        // dataset.flip='on'  → current label "All On"  (count=0) → click fires enable
        const wasOff = btn.dataset.flip === 'off';
        const flip = wasOff ? 'sonos_disable_all_alarms' : 'sonos_enable_all_alarms';
        // Optimistic override: predict the post-click "someOn" state.
        //   wasOff=true  → click disables → after, all 4 are off → predictedOn=false
        //   wasOff=false → click enables  → after, all 4 are on  → predictedOn=true
        this._optimisticAllFlip = {
          predictedOn: !wasOff,
          expiresAt: Date.now() + 8000, // 8s safety cap matches verify-and-retry script worst case
        };
        // Force re-render NOW with the override in effect (instant feedback)
        this._buildQAStrip();
        this._callScript(flip);
        return;
      }
      this._callScript(action.script);
    });
  }

  _onRowPointerDown(e) {
    const row = e.target.closest('.alarm-row');
    if (!row) return;
    // PA04a defect: previously _pendingEntity stuck to the down-row even
    // if the pointer slid to a different row before pointerup; pointerup
    // would then toggle the wrong alarm AND leave dataset.held='true' on
    // the original row. Fix: clear ALL rows' held state on pointerdown,
    // set held only on the target, capture the pointer so pointerup fires
    // on the same element, and rely on _onRowPointerMove to cancel hold
    // if the pointer slides off the original row.
    this._cancelHold();
    this._holdFired = false;
    this._pendingEntity = row.dataset.entity;
    row.dataset.held = 'true';
    try { row.setPointerCapture(e.pointerId); } catch (_) {}
    this._holdTimer = setTimeout(() => {
      this._holdFired = true;
      this._openEdit(this._pendingEntity);
      if (navigator.vibrate) try { navigator.vibrate(10); } catch (_) {}
    }, HOLD_MS);
  }

  _onRowPointerMove(e) {
    // PA04a (continued): if the pointer slides off the original held row
    // (or onto a different row), cancel the gesture — neither toggle nor
    // hold should fire when the user changed intent mid-press.
    if (!this._pendingEntity) return;
    const row = e.target.closest('.alarm-row');
    if (!row || row.dataset.entity !== this._pendingEntity) {
      this._cancelHold();
    }
  }

  _onRowPointerUp(e) {
    const row = e.target.closest('.alarm-row');
    // PA04a (continued): only fire toggle when pointerup lands on the
    // SAME row pointerdown set as pending. Sliding off cancelled via
    // _onRowPointerMove already; this is the belt-and-suspenders.
    const sameRow = row && row.dataset.entity === this._pendingEntity;
    if (row) row.dataset.held = 'false';
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
    if (!this._holdFired && this._pendingEntity && sameRow) {
      this._toggleAlarm(this._pendingEntity);
    }
    this._pendingEntity = null;
    this._holdFired = false;
  }

  _cancelHold() {
    if (this._holdTimer) { clearTimeout(this._holdTimer); this._holdTimer = null; }
    this._holdFired = false;
    this._pendingEntity = null;
    for (const ref of this._rowRefs) ref.el.dataset.held = 'false';
  }

  _toggleAlarm(entity) {
    if (!entity || !this._hass) return;
    this._hass.callService('switch', 'toggle', { entity_id: entity });
  }

  _openEdit(entity) {
    if (!entity || !this._hass) return;
    this._hass.callService('script', 'sonos_load_alarm_for_edit', { alarm_entity: entity });
  }

  _callScript(scriptId) {
    if (!this._hass) return;
    this._hass.callService('script', scriptId, {});
  }

  /* ── State update ───────────────────────────────── */

  _updateAll(force = false) {
    if (!this._hass || !this._rendered) return;

    // Header
    const nextState = this._hass.states['sensor.sonos_next_alarm'];
    const countState = this._hass.states['sensor.sonos_enabled_alarm_count'];
    const parts = [];
    if (nextState && nextState.state && nextState.state !== 'unknown' && nextState.state !== 'unavailable') {
      parts.push(`Next: <strong>${escapeHtml(nextState.state)}</strong>`);
    }
    if (countState && countState.state && !isNaN(countState.state)) {
      parts.push(`${countState.state} enabled`);
    }
    this.$.nextBadge.innerHTML = parts.join(' · ');

    // Re-render quick-action strip when context changes (enabled count flips
    // the All On/Off label; alarm-playing reveals/hides Snooze).
    const qaSig = `${enabledAlarmCount(this._hass)}|${isAlarmPlaying(this._hass)}`;
    if (force || this._lastQaSig !== qaSig) {
      this._lastQaSig = qaSig;
      this._buildQAStrip();
    }

    // Rows
    for (const ref of this._rowRefs) {
      const entity = this._hass.states[ref.cfg.entity];
      const cacheKey = ref.cfg.entity;
      const prev = this._prevValues[cacheKey];
      const signature = entity
        ? `${entity.state}|${entity.attributes.time || ''}|${entity.attributes.recurrence || ''}`
        : 'missing';
      if (!force && prev === signature) continue;
      this._prevValues[cacheKey] = signature;

      if (!entity) {
        ref.timeEl.textContent = '--:--';
        ref.subEl.textContent = 'unavailable';
        ref.el.dataset.on = 'false';
        continue;
      }
      const isOn = entity.state === 'on';
      ref.el.dataset.on = isOn ? 'true' : 'false';
      const time = entity.attributes.time;
      ref.timeEl.textContent = time ? String(time).slice(0, 5) : '--:--';
      ref.subEl.textContent = humanRecurrence(entity.attributes.recurrence);
    }
  }
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

registerCard('tunet-alarm-card', TunetAlarmCard, {
  name: 'Tunet Alarm Card',
  description: 'Sonos alarm list — tap toggle, hold opens BrowserMod edit popup, quick-action strip',
  preview: true,
});

logCardVersion('TUNET-ALARM', CARD_VERSION, '#fbbf24');
