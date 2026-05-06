/**
 * Tunet Inbox Card
 * Governed live inbox surface for tunet_inbox queue items.
 * Version 0.1.0
 */

import {
  TOKENS,
  RESET,
  BASE_FONT,
  ICON_BASE,
  CARD_SURFACE,
  CARD_SURFACE_GLASS_STROKE,
  REDUCED_MOTION,
  FONT_LINKS,
  injectFonts,
  detectDarkMode,
  applyDarkClass,
  registerCard,
  logCardVersion,
} from './tunet_base.js?v=20260309g7';

const CARD_VERSION = '0.1.0';
const DEFAULT_TITLE = 'Attention needed';
const SERVICE_DOMAIN = 'tunet_inbox';
const UPDATE_EVENT = 'tunet_inbox_updated';
const DEFAULT_FAMILIES = ['oal', 'sonos'];

const STYLES = `
${TOKENS}
${RESET}
${BASE_FONT}
${ICON_BASE}
${CARD_SURFACE}
${CARD_SURFACE_GLASS_STROKE}
${REDUCED_MOTION}

  :host {
    display: block;
    font-size: 16px;
  }

  .card {
    width: 100%;
    gap: 0.9em;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75em;
  }

  .title-wrap {
    min-width: 0;
    display: grid;
    gap: 0.2em;
  }

  .eyebrow {
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .title {
    font-size: 1.08em;
    font-weight: 700;
    color: var(--text);
    line-height: 1.15;
  }

  .summary {
    font-size: 0.84em;
    color: var(--text-sub);
    line-height: 1.25;
  }

  .refresh-btn {
    flex: 0 0 auto;
    min-width: 2.6em;
    min-height: 2.6em;
    border-radius: 999px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .refresh-btn .icon {
    font-size: 1.15em;
  }

  .refresh-btn:disabled {
    cursor: wait;
    opacity: 0.68;
  }

  .state-banner {
    display: flex;
    align-items: center;
    gap: 0.55em;
    padding: 0.8em 0.9em;
    border-radius: 1em;
    background: var(--blue-fill);
    border: 1px solid var(--blue-border);
    color: var(--blue);
    font-size: 0.84em;
    line-height: 1.35;
  }

  .state-banner.error {
    background: var(--red-fill);
    border-color: var(--red-border);
    color: var(--red);
  }

  .state-banner .icon {
    font-size: 1.05em;
    flex: 0 0 auto;
  }

  .stack {
    display: grid;
    gap: 0.72em;
  }

  .empty {
    display: grid;
    place-items: center;
    gap: 0.5em;
    min-height: 11.5em;
    text-align: center;
    padding: 1.3em 1.1em;
    background: rgba(255,255,255,0.5);
    border: 1px dashed rgba(28,28,30,0.08);
    border-radius: 1.15em;
    color: var(--text-sub);
  }

  .empty .icon {
    font-size: 1.8em;
    color: var(--text-muted);
  }

  .item {
    display: grid;
    gap: 0.72em;
    padding: 0.92em;
    border-radius: 1.15em;
    background: rgba(255,255,255,0.74);
    border: 1px solid rgba(255,255,255,0.45);
    box-shadow: 0 0.35em 1.2em rgba(0,0,0,0.05);
  }

  .item.responding {
    opacity: 0.92;
  }

  .item-head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.82em;
    align-items: start;
  }

  .icon-pill {
    width: 2.7em;
    height: 2.7em;
    border-radius: 0.95em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--amber-fill);
    border: 1px solid var(--amber-border);
    color: var(--amber);
    box-shadow: var(--chip-sh);
  }

  .icon-pill .icon {
    font-size: 1.25em;
  }

  .item.tone-red .icon-pill {
    background: var(--red-fill);
    border-color: var(--red-border);
    color: var(--red);
  }

  .item.tone-blue .icon-pill {
    background: var(--blue-fill);
    border-color: var(--blue-border);
    color: var(--blue);
  }

  .item.tone-green .icon-pill {
    background: var(--green-fill);
    border-color: var(--green-border);
    color: var(--green);
  }

  .item-copy {
    min-width: 0;
    display: grid;
    gap: 0.38em;
  }

  .item-title-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.38em;
  }

  .item-title {
    font-size: 0.98em;
    font-weight: 700;
    color: var(--text);
    line-height: 1.2;
    min-width: 0;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 0.3em;
    min-height: 1.85em;
    padding: 0.18em 0.62em;
    border-radius: 999px;
    background: var(--chip-bg);
    border: 1px solid var(--chip-border);
    box-shadow: var(--chip-sh);
    color: var(--text-sub);
    font-size: 0.72em;
    font-weight: 700;
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  .pill.status {
    color: var(--blue);
    border-color: var(--blue-border);
    background: var(--blue-fill);
  }

  .pill.family {
    color: var(--amber);
    border-color: var(--amber-border);
    background: var(--amber-fill);
  }

  .pill.severity-critical {
    color: var(--red);
    border-color: var(--red-border);
    background: var(--red-fill);
  }

  .item-message {
    font-size: 0.9em;
    color: var(--text);
    line-height: 1.35;
  }

  .item-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.38em;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45em;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35em;
    min-height: 2.46em;
    padding: 0.58em 0.84em;
    border-radius: 0.92em;
    border: 1px solid transparent;
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text);
    font-size: 0.82em;
    font-weight: 700;
    cursor: pointer;
    transition:
      transform var(--motion-fast) var(--ease-emphasized),
      box-shadow var(--motion-ui) var(--ease-standard),
      background var(--motion-ui) var(--ease-standard),
      color var(--motion-ui) var(--ease-standard),
      border-color var(--motion-ui) var(--ease-standard);
  }

  .action-btn:hover {
    box-shadow: var(--shadow-up);
  }

  .action-btn:active {
    transform: scale(var(--press-scale));
  }

  .action-btn:disabled {
    cursor: wait;
    opacity: 0.56;
    transform: none;
  }

  .action-btn.primary {
    background: var(--blue-fill);
    border-color: var(--blue-border);
    color: var(--blue);
  }

  .action-btn.secondary {
    background: rgba(255,255,255,0.6);
    border-color: rgba(28,28,30,0.08);
  }

  .action-btn.destructive {
    background: var(--red-fill);
    border-color: var(--red-border);
    color: var(--red);
  }

  .action-btn.dismiss {
    background: rgba(255,255,255,0.56);
    border-color: rgba(28,28,30,0.08);
    color: var(--text-sub);
  }

  .row-note {
    display: flex;
    align-items: flex-start;
    gap: 0.38em;
    color: var(--red);
    font-size: 0.79em;
    line-height: 1.32;
  }

  .row-note .icon {
    font-size: 1em;
    margin-top: 0.02em;
  }

  @media (max-width: 440px) {
    .card {
      padding: 1em;
      border-radius: 1.15em;
    }

    .item {
      padding: 0.82em;
    }

    .icon-pill {
      width: 2.45em;
      height: 2.45em;
    }

    .action-btn {
      flex: 1 1 calc(50% - 0.3em);
      min-width: 0;
      justify-content: flex-start;
    }
  }
`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unwrapServiceResponse(result) {
  if (result && typeof result === 'object' && result.response && typeof result.response === 'object') {
    return result.response;
  }
  return result || {};
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

function formatRelativeTime(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return null;
  const diffMs = date.getTime() - now;
  const absMs = Math.abs(diffMs);
  const absMins = Math.round(absMs / 60000);
  if (absMs < 45000) return diffMs >= 0 ? 'in moments' : 'just now';
  if (absMins < 60) return diffMs >= 0 ? `in ${absMins}m` : `${absMins}m ago`;
  const absHours = Math.round(absMs / 3600000);
  if (absHours < 24) return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`;
  const absDays = Math.round(absMs / 86400000);
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`;
}

function severityClass(severity) {
  if (severity === 'critical' || severity === 'error') return 'tone-red';
  if (severity === 'info') return 'tone-blue';
  if (severity === 'success') return 'tone-green';
  return '';
}

function familyLabel(family) {
  if (!family) return '';
  return family.toUpperCase();
}

function prettyLabel(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function friendlyStatus(status) {
  if (!status) return '';
  if (status === 'responding') return 'Working';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function iconForItem(item) {
  const raw = String(item?.icon || '').trim();
  const known = {
    'mdi:alarm': 'alarm',
    'mdi:alarm-light': 'alarm',
    'mdi:television': 'tv',
    'mdi:television-play': 'tv',
    'mdi:television-off': 'tv',
    'mdi:television-ambient-light': 'tv',
    'mdi:lightbulb-alert': 'lightbulb',
    'mdi:lightbulb-auto': 'lightbulb',
    'mdi:lightbulb': 'lightbulb',
    'mdi:lightbulb-on-outline': 'lightbulb',
    'mdi:timer-outline': 'timer',
    'mdi:timer-plus': 'timer',
    'mdi:timer-plus-outline': 'timer',
    'mdi:timer-alert-outline': 'timer',
    'mdi:inbox-multiple-outline': 'inbox',
    'mdi:speaker': 'speaker',
  };
  if (known[raw]) return known[raw];
  if (item?.family === 'sonos') return 'speaker';
  if (item?.family === 'oal') return 'lightbulb';
  if (item?.severity === 'critical' || item?.severity === 'error') return 'warning';
  return 'notifications_active';
}

function iconForAction(action) {
  if (!action?.icon) return '';
  const raw = String(action.icon).replace(/^mdi:/, '').trim();
  const aliases = {
    alarm: 'alarm',
    lightbulb_auto: 'lightbulb',
    lightbulb: 'lightbulb',
    lightbulb_on_outline: 'lightbulb',
    lightbulb_alert: 'lightbulb',
    timer: 'timer',
    timer_outline: 'timer',
    timer_plus: 'timer',
    timer_plus_outline: 'timer',
    timer_alert_outline: 'timer',
    television: 'tv',
    television_play: 'tv',
    television_off: 'tv',
    television_ambient_light: 'tv',
    clock_outline: 'schedule',
    power: 'power_settings_new',
    power_settings_new: 'power_settings_new',
    close: 'close',
    delete: 'delete',
    refresh: 'refresh',
    replay: 'replay',
    check: 'check',
  };
  return aliases[raw] || raw.replace(/-/g, '_');
}

export class TunetInboxCard extends HTMLElement {
  static get configurable() { return true; }

  static getStubConfig() {
    return {
      type: 'custom:tunet-inbox-card',
      title: DEFAULT_TITLE,
      families: [...DEFAULT_FAMILIES],
      max_items: 10,
      privacy_mode: false,
      show_room: true,
      show_family_badge: true,
      show_manual_dismiss: false,
    };
  }

  static getConfigForm() {
    return {
      schema: [
        { name: 'title', selector: { text: {} } },
        { name: 'max_items', selector: { number: { min: 1, max: 20, mode: 'box' } } },
        { name: 'privacy_mode', selector: { boolean: {} } },
        { name: 'show_room', selector: { boolean: {} } },
        { name: 'show_family_badge', selector: { boolean: {} } },
        { name: 'show_manual_dismiss', selector: { boolean: {} } },
      ],
    };
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = TunetInboxCard.getStubConfig();
    this._hass = null;
    this._rendered = false;
    this._items = [];
    this._meta = {};
    this._loading = false;
    this._error = '';
    this._clientId = globalThis.crypto?.randomUUID?.() || `tinbox-${Math.random().toString(16).slice(2)}`;
    this._unsubscribeUpdated = null;
    this._dataReady = false;
    this._loadRequestId = 0;
    this._rowPending = new Map();
    this._rowFeedback = new Map();

    injectFonts();
  }

  setConfig(config) {
    this._config = {
      ...TunetInboxCard.getStubConfig(),
      ...(config || {}),
      families: Array.isArray(config?.families)
        ? config.families.filter((value) => typeof value === 'string' && value.trim())
        : [...DEFAULT_FAMILIES],
      max_items: Math.max(1, Number(config?.max_items) || 10),
    };
    if (this._rendered) {
      this._render();
      if (this._hass) this._loadItems();
    }
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._rendered = true;
      this._render();
      logCardVersion('TUNET-INBOX', CARD_VERSION, '#007AFF');
    }
    applyDarkClass(this, detectDarkMode(hass));
    if (this.isConnected) this._ensureData();
  }

  connectedCallback() {
    if (this._hass) this._ensureData();
  }

  disconnectedCallback() {
    if (typeof this._unsubscribeUpdated === 'function') {
      this._unsubscribeUpdated();
    }
    this._unsubscribeUpdated = null;
    this._dataReady = false;
  }

  getCardSize() {
    return Math.max(2, Math.min(8, 2 + this._items.length));
  }

  getGridOptions() {
    return {
      columns: 12,
      min_columns: 6,
      rows: 'auto',
      min_rows: 2,
    };
  }

  async _ensureData() {
    if (!this._hass || this._dataReady) return;
    this._dataReady = true;
    await this._subscribeUpdated();
    await this._loadItems();
  }

  async _subscribeUpdated() {
    if (this._unsubscribeUpdated || !this._hass?.connection?.subscribeMessage) return;
    this._unsubscribeUpdated = await this._hass.connection.subscribeMessage(
      () => {
        this._loadItems();
      },
      {
        type: 'subscribe_events',
        event_type: UPDATE_EVENT,
      }
    );
  }

  _buildListPayload() {
    const payload = {
      limit: this._config.max_items,
      privacy_mode: this._config.privacy_mode,
    };
    if (this._config.families?.length) payload.families = this._config.families;
    return payload;
  }

  async _loadItems() {
    if (!this._hass?.callService) return;
    const requestId = ++this._loadRequestId;
    this._loading = true;
    if (!this._items.length) this._error = '';
    this._render();

    try {
      const result = await this._hass.callService(
        SERVICE_DOMAIN,
        'list_items',
        this._buildListPayload(),
        undefined,
        false,
        true
      );
      if (requestId !== this._loadRequestId) return;
      const data = unwrapServiceResponse(result);
      this._items = Array.isArray(data.items) ? data.items : [];
      this._meta = data.meta && typeof data.meta === 'object' ? data.meta : {};
      this._error = '';
      const currentIds = new Set(this._items.map((item) => item.item_id));
      for (const key of [...this._rowPending.keys()]) {
        if (!currentIds.has(key)) this._rowPending.delete(key);
      }
      for (const key of [...this._rowFeedback.keys()]) {
        if (!currentIds.has(key)) this._rowFeedback.delete(key);
      }
    } catch (error) {
      if (requestId !== this._loadRequestId) return;
      this._error = error?.message || 'Backend unavailable';
    } finally {
      if (requestId === this._loadRequestId) {
        this._loading = false;
        this._render();
      }
    }
  }

  async _respond(itemId, actionId) {
    if (!this._hass?.callService || !itemId || !actionId) return;
    this._rowPending.set(itemId, actionId);
    this._rowFeedback.delete(itemId);
    this._render();

    try {
      const result = await this._hass.callService(
        SERVICE_DOMAIN,
        'respond',
        {
          item_id: itemId,
          action_id: actionId,
          source: 'dashboard_card',
          client_id: this._clientId,
        },
        undefined,
        false,
        true
      );
      const data = unwrapServiceResponse(result);
      if (!data?.accepted) {
        this._rowFeedback.set(itemId, data?.reason || 'Action rejected');
      }
    } catch (error) {
      this._rowFeedback.set(itemId, error?.message || 'Action failed');
    } finally {
      this._rowPending.delete(itemId);
      await this._loadItems();
      this._render();
    }
  }

  async _dismiss(itemId) {
    if (!this._hass?.callService || !itemId) return;
    this._rowPending.set(itemId, '__dismiss__');
    this._rowFeedback.delete(itemId);
    this._render();

    try {
      const result = await this._hass.callService(
        SERVICE_DOMAIN,
        'dismiss',
        {
          item_id: itemId,
          reason: 'manual_dashboard_dismiss',
        },
        undefined,
        false,
        true
      );
      const data = unwrapServiceResponse(result);
      if (!data?.accepted) {
        this._rowFeedback.set(itemId, data?.reason || 'Dismiss rejected');
      }
    } catch (error) {
      this._rowFeedback.set(itemId, error?.message || 'Dismiss failed');
    } finally {
      this._rowPending.delete(itemId);
      await this._loadItems();
      this._render();
    }
  }

  _renderSummary() {
    if (this._loading && !this._items.length) return 'Loading queue state…';
    if (this._error && !this._items.length) return 'Backend unavailable';
    const total = Number(this._meta?.total) || this._items.length;
    if (!total) return 'No pending notifications';
    return `${total} pending notification${total === 1 ? '' : 's'}`;
  }

  _renderNotice() {
    if (this._loading && !this._items.length) {
      return `
        <div class="state-banner">
          <span class="icon">sync</span>
          <span>Loading live inbox state from <code>tunet_inbox.list_items</code>.</span>
        </div>
      `;
    }

    if (this._error) {
      return `
        <div class="state-banner error">
          <span class="icon">warning</span>
          <span>${escapeHtml(this._error)}</span>
        </div>
      `;
    }

    return '';
  }

  _renderEmptyState() {
    return `
      <div class="empty">
        <span class="icon">inbox</span>
        <div>No pending notification contexts.</div>
        <div>When OAL or Sonos post a governed item, it will appear here.</div>
      </div>
    `;
  }

  _renderItem(item) {
    const pendingAction = this._rowPending.get(item.item_id);
    const feedback = this._rowFeedback.get(item.item_id);
    const age = formatRelativeTime(item.created_at);
    const expiry = formatRelativeTime(item.expires_at);
    const message = item.subtitle || item.message || '';
    const isBusy = item.status === 'responding' || Boolean(pendingAction);
    const toneClass = severityClass(item.severity);

    const metaBits = [];
    if (this._config.show_room && item.room) {
      metaBits.push(`<span class="pill">${escapeHtml(prettyLabel(item.room))}</span>`);
    }
    if (age) {
      metaBits.push(`<span class="pill">${escapeHtml(age)}</span>`);
    }
    if (expiry) {
      metaBits.push(`<span class="pill">${escapeHtml(`Expires ${expiry}`)}</span>`);
    }
    if (item.badge) {
      metaBits.push(`<span class="pill">${escapeHtml(item.badge)}</span>`);
    }

    const actionButtons = item.actions.map((action) => {
      const actionIcon = iconForAction(action);
      const variantClass = action.destructive
        ? 'destructive'
        : action.style === 'primary'
          ? 'primary'
          : action.style === 'secondary'
            ? 'secondary'
            : '';
      const disabled = isBusy || Boolean(action.disabled_reason);
      const label = action.disabled_reason
        ? `${action.title}. ${action.disabled_reason}`
        : action.title;
      return `
        <button
          class="action-btn ${variantClass}"
          type="button"
          data-item-id="${escapeHtml(item.item_id)}"
          data-action-id="${escapeHtml(action.id)}"
          aria-label="${escapeHtml(label)}"
          ${action.destructive ? 'data-destructive="true"' : ''}
          ${disabled ? 'disabled' : ''}
          title="${escapeHtml(label)}"
        >
          ${actionIcon ? `<span class="icon">${escapeHtml(actionIcon)}</span>` : ''}
          <span>${escapeHtml(action.title)}</span>
        </button>
      `;
    }).join('');

    const dismissButton = this._config.show_manual_dismiss
      ? `
        <button
          class="action-btn dismiss"
          type="button"
          data-dismiss-id="${escapeHtml(item.item_id)}"
          aria-label="Dismiss ${escapeHtml(item.title)}"
          ${isBusy ? 'disabled' : ''}
          title="Dismiss"
        >
          <span class="icon">close</span>
          <span>Dismiss</span>
        </button>
      `
      : '';

    return `
      <article class="item ${toneClass} ${escapeHtml(item.status || '')}">
        <div class="item-head">
          <div class="icon-pill">
            <span class="icon">${escapeHtml(iconForItem(item))}</span>
          </div>
          <div class="item-copy">
            <div class="item-title-row">
              <span class="item-title">${escapeHtml(item.title)}</span>
              ${this._config.show_family_badge && item.family
                ? `<span class="pill family severity-${escapeHtml(item.severity || 'warning')}">${escapeHtml(familyLabel(item.family))}</span>`
                : ''
              }
              ${item.status === 'responding' || pendingAction
                ? `<span class="pill status">${escapeHtml(friendlyStatus(item.status === 'responding' ? item.status : 'responding'))}</span>`
                : ''
              }
            </div>
            ${message ? `<div class="item-message">${escapeHtml(message)}</div>` : ''}
            ${metaBits.length ? `<div class="item-meta">${metaBits.join('')}</div>` : ''}
          </div>
        </div>
        ${(item.actions.length || dismissButton)
          ? `<div class="actions">${actionButtons}${dismissButton}</div>`
          : ''
        }
        ${feedback
          ? `<div class="row-note"><span class="icon">warning</span><span>${escapeHtml(feedback)}</span></div>`
          : ''
        }
      </article>
    `;
  }

  _attachHandlers() {
    for (const button of this.shadowRoot.querySelectorAll('[data-action-id]')) {
      button.addEventListener('click', () => {
        this._respond(button.dataset.itemId, button.dataset.actionId);
      });
    }

    for (const button of this.shadowRoot.querySelectorAll('[data-dismiss-id]')) {
      button.addEventListener('click', () => {
        this._dismiss(button.dataset.dismissId);
      });
    }

    const refreshButton = this.shadowRoot.getElementById('refreshBtn');
    refreshButton?.addEventListener('click', () => this._loadItems());
  }

  _render() {
    const listContent = this._items.length
      ? this._items.map((item) => this._renderItem(item)).join('')
      : this._renderEmptyState();

    this.shadowRoot.innerHTML = `
      <style>${STYLES}</style>
      ${FONT_LINKS}
      <div class="wrap">
        <div class="card">
          <div class="header">
            <div class="title-wrap">
              <div class="eyebrow">Tunet inbox</div>
              <div class="title">${escapeHtml(this._config.title || DEFAULT_TITLE)}</div>
              <div class="summary">${escapeHtml(this._renderSummary())}</div>
            </div>
            <button
              id="refreshBtn"
              class="refresh-btn"
              type="button"
              aria-label="Refresh inbox"
              title="Refresh inbox"
              ${this._loading ? 'disabled' : ''}
            >
              <span class="icon">refresh</span>
            </button>
          </div>
          ${this._renderNotice()}
          <div class="stack">${listContent}</div>
        </div>
      </div>
    `;

    this._attachHandlers();
  }
}

registerCard('tunet-inbox-card', TunetInboxCard, {
  name: 'Tunet Inbox',
  description: 'Governed actionable inbox for tunet_inbox queue items.',
});
