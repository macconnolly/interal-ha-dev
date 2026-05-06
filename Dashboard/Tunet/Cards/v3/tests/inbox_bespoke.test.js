import { afterEach, describe, expect, it, vi } from 'vitest';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

import '../tunet_inbox_card.js';

function wrapResponse(payload) {
  return { response: payload };
}

function makeListResponse(items = []) {
  return wrapResponse({
    items,
    meta: {
      total: items.length,
      highest_priority: items.reduce((max, item) => Math.max(max, item.priority || 0), 0),
      generated_at: '2026-04-06T23:00:00+00:00',
    },
  });
}

function makeItem(overrides = {}) {
  return {
    schema_version: 1,
    item_id: 'item-1',
    key: 'oal_override_reminder',
    status: 'pending',
    title: 'Lights Still Manual',
    message: 'Kitchen, den and patio are still manually controlled.',
    subtitle: null,
    actions: [
      {
        id: 'OAL_RESET_LIGHTS',
        title: 'Reset to Adaptive',
        icon: 'mdi:lightbulb',
        destructive: false,
        requires_confirm: false,
        style: 'primary',
        disabled_reason: null,
      },
      {
        id: 'OAL_KEEP_MANUAL',
        title: 'Keep Manual',
        icon: 'mdi:refresh',
        destructive: true,
        requires_confirm: false,
        style: 'secondary',
        disabled_reason: null,
      },
    ],
    context: { zone_count: 3 },
    mobile: {
      tag: 'oal_override_reminder',
      notify_service: 'notify.tunet_inbox_all_devices',
      clear_on_resolve: true,
    },
    priority: 55,
    severity: 'warning',
    family: 'oal',
    room: 'whole_home',
    icon: 'mdi:lightbulb-alert',
    badge: '3 zones',
    privacy: 'normal',
    created_at: '2026-04-06T22:55:00+00:00',
    updated_at: '2026-04-06T22:55:00+00:00',
    expires_at: '2026-04-06T23:10:00+00:00',
    source: { integration: 'oal' },
    last_actor: null,
    last_error: null,
    response_started_at: null,
    resolution_reason: null,
    ...overrides,
  };
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function makeInboxHass({
  listResponses = [makeListResponse([])],
  respondResponse = wrapResponse({ accepted: true, item_id: 'item-1', action_id: 'OAL_RESET_LIGHTS' }),
  dismissResponse = wrapResponse({ accepted: true, item_id: 'item-1', status: 'dismissed' }),
  listError = null,
} = {}) {
  const queue = [...listResponses];
  const subscriptions = [];
  const hass = {
    themes: { darkMode: false },
    states: {},
    connection: {
      subscribeMessage: vi.fn(async (callback, message) => {
        subscriptions.push({ callback, message });
        return vi.fn();
      }),
    },
    callService: vi.fn(async (domain, service, data, target, enqueue, returnResponse) => {
      if (domain !== 'tunet_inbox') return undefined;
      if (service === 'list_items') {
        if (listError) throw listError;
        return queue.length > 1 ? queue.shift() : queue[0];
      }
      if (service === 'respond') return respondResponse;
      if (service === 'dismiss') return dismissResponse;
      throw new Error(`Unexpected service ${domain}.${service}`);
    }),
  };

  return {
    hass,
    subscriptions,
    emitUpdated() {
      const sub = subscriptions.find((entry) => entry.message?.event_type === 'tunet_inbox_updated');
      sub?.callback({ event: { data: { reason: 'post' } } });
    },
  };
}

function createCard(config = {}, hassOptions = {}) {
  const el = document.createElement('tunet-inbox-card');
  el.setConfig(config);
  document.body.appendChild(el);
  const ctx = makeInboxHass(hassOptions);
  el.hass = ctx.hass;
  return { el, ...ctx };
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('Tunet inbox card', () => {
  it('registers and exposes a valid stub config plus sections grid sizing', () => {
    const CardClass = customElements.get('tunet-inbox-card');
    expect(CardClass).toBeTruthy();
    const stub = CardClass.getStubConfig();
    expect(stub.type).toBe('custom:tunet-inbox-card');
    expect(stub.families).toEqual(['oal', 'sonos']);
    const el = document.createElement('tunet-inbox-card');
    el.setConfig(stub);
    expect(el.getGridOptions().rows).toBe('auto');
  });

  it('loads via tunet_inbox.list_items and subscribes to tunet_inbox_updated', async () => {
    const { el, hass, subscriptions } = createCard();
    await flushPromises();

    expect(hass.callService).toHaveBeenCalledWith(
      'tunet_inbox',
      'list_items',
      expect.objectContaining({
        families: ['oal', 'sonos'],
        limit: 10,
        privacy_mode: false,
      }),
      undefined,
      false,
      true
    );
    expect(subscriptions[0]?.message).toEqual({
      type: 'subscribe_events',
      event_type: 'tunet_inbox_updated',
    });
    expect(el.shadowRoot.textContent).toContain('No pending notification contexts.');
  });

  it('renders live items, metadata, and destructive actions from backend payload', async () => {
    const item = makeItem();
    const { el } = createCard({ title: 'Inbox' }, { listResponses: [makeListResponse([item])] });
    await flushPromises();

    const text = el.shadowRoot.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Lights Still Manual');
    expect(text).toContain('Kitchen, den and patio are still manually controlled.');
    expect(text).toContain('Whole Home');
    expect(text).toContain('3 zones');
    expect(text).toContain('Reset to Adaptive');
    expect(text).toContain('Keep Manual');

    const destructive = el.shadowRoot.querySelector('[data-action-id="OAL_KEEP_MANUAL"]');
    expect(destructive?.className).toContain('destructive');
    expect(destructive?.getAttribute('data-destructive')).toBe('true');
  });

  it('submits actions through tunet_inbox.respond with dashboard_card source', async () => {
    const item = makeItem();
    const { el, hass } = createCard({}, { listResponses: [makeListResponse([item]), makeListResponse([])] });
    await flushPromises();

    el.shadowRoot.querySelector('[data-action-id="OAL_RESET_LIGHTS"]').click();
    await flushPromises();
    await flushPromises();

    expect(hass.callService).toHaveBeenCalledWith(
      'tunet_inbox',
      'respond',
      expect.objectContaining({
        item_id: 'item-1',
        action_id: 'OAL_RESET_LIGHTS',
        source: 'dashboard_card',
      }),
      undefined,
      false,
      true
    );
  });

  it('shows manual dismiss only when enabled and routes through tunet_inbox.dismiss', async () => {
    const item = makeItem();
    const { el, hass } = createCard(
      { show_manual_dismiss: true },
      { listResponses: [makeListResponse([item]), makeListResponse([])] }
    );
    await flushPromises();

    const dismiss = el.shadowRoot.querySelector('[data-dismiss-id="item-1"]');
    expect(dismiss).toBeTruthy();
    dismiss.click();
    await flushPromises();
    await flushPromises();

    expect(hass.callService).toHaveBeenCalledWith(
      'tunet_inbox',
      'dismiss',
      {
        item_id: 'item-1',
        reason: 'manual_dashboard_dismiss',
      },
      undefined,
      false,
      true
    );
  });

  it('keeps manual dismiss hidden by default', async () => {
    const item = makeItem();
    const { el } = createCard({}, { listResponses: [makeListResponse([item])] });
    await flushPromises();
    expect(el.shadowRoot.querySelector('[data-dismiss-id="item-1"]')).toBeNull();
  });

  it('reloads when tunet_inbox_updated fires', async () => {
    const item = makeItem();
    const ctx = createCard({}, {
      listResponses: [makeListResponse([]), makeListResponse([item])],
    });
    await flushPromises();
    expect(ctx.hass.callService).toHaveBeenCalledTimes(1);

    ctx.emitUpdated();
    await flushPromises();

    expect(ctx.hass.callService).toHaveBeenCalledTimes(2);
    expect(ctx.el.shadowRoot.textContent).toContain('Lights Still Manual');
  });

  it('renders a backend unavailable state when list_items fails', async () => {
    const { el } = createCard({}, { listError: new Error('Backend unavailable') });
    await flushPromises();

    const text = el.shadowRoot.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Backend unavailable');
  });

  it('shows rejected action feedback when respond is not accepted', async () => {
    const item = makeItem();
    const { el } = createCard(
      {},
      {
        listResponses: [makeListResponse([item]), makeListResponse([item])],
        respondResponse: wrapResponse({
          accepted: false,
          item_id: 'item-1',
          action_id: 'OAL_RESET_LIGHTS',
          reason: 'stale_action',
        }),
      }
    );
    await flushPromises();

    el.shadowRoot.querySelector('[data-action-id="OAL_RESET_LIGHTS"]').click();
    await flushPromises();
    await flushPromises();

    expect(el.shadowRoot.textContent).toContain('stale_action');
  });
});
