import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// Registers <tunet-alarm-card>
import '../tunet_alarm_card.js';

function makeAlarmHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    callService: vi.fn(() => Promise.resolve()),
    states: {
      'switch.sonos_alarm_bedroom': {
        entity_id: 'switch.sonos_alarm_bedroom',
        state: 'on',
        attributes: {
          friendly_name: 'Bedroom Alarm Weekdays',
          alarm_id: '42',
          time: '05:30:00',
          recurrence: 'WEEKDAYS',
          volume: 0.39,
        },
      },
      'switch.sonos_alarm_bath': {
        entity_id: 'switch.sonos_alarm_bath',
        state: 'off',
        attributes: {
          friendly_name: 'Bath Alarm Weekdays',
          alarm_id: '37',
          time: '17:00:00',
          recurrence: 'WEEKDAYS',
          volume: 0.3,
        },
      },
      'sensor.sonos_next_alarm': {
        entity_id: 'sensor.sonos_next_alarm',
        state: '05:30 · Bedroom',
        attributes: { friendly_name: 'Sonos Next Alarm', next_alarm_entity: 'switch.sonos_alarm_bedroom' },
      },
      'sensor.sonos_enabled_alarm_count': {
        entity_id: 'sensor.sonos_enabled_alarm_count',
        state: '1',
        attributes: { friendly_name: 'Sonos Enabled Alarm Count' },
      },
    },
    ...overrides,
  };
}

function stubConfig() {
  return {
    title: 'Alarms',
    show_quick_actions: true,
    alarms: [
      { entity: 'switch.sonos_alarm_bedroom', label: 'Bedroom Weekdays', room: 'bedroom' },
      { entity: 'switch.sonos_alarm_bath',    label: 'Bath Weekdays',    room: 'bath' },
    ],
  };
}

function mountCard() {
  const card = document.createElement('tunet-alarm-card');
  document.body.appendChild(card);
  return card;
}

afterEach(() => {
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('tunet-alarm-card', () => {
  it('registers with customElements', () => {
    const ctor = customElements.get('tunet-alarm-card');
    expect(ctor).toBeDefined();
    expect(ctor.getStubConfig().alarms).toHaveLength(2);
  });

  it('renders two alarm rows with canonical entities', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    card.hass = makeAlarmHass();
    const rows = card.shadowRoot.querySelectorAll('.alarm-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].dataset.entity).toBe('switch.sonos_alarm_bedroom');
    expect(rows[0].dataset.accent).toBe('amber');
    expect(rows[0].dataset.on).toBe('true');
    expect(rows[1].dataset.entity).toBe('switch.sonos_alarm_bath');
    expect(rows[1].dataset.accent).toBe('blue');
    expect(rows[1].dataset.on).toBe('false');
  });

  it('shows HH:MM and recurrence text', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    card.hass = makeAlarmHass();
    const rows = card.shadowRoot.querySelectorAll('.alarm-row');
    expect(rows[0].querySelector('.alarm-time').textContent).toBe('05:30');
    expect(rows[0].querySelector('.alarm-sub').textContent).toBe('Weekdays');
    expect(rows[1].querySelector('.alarm-time').textContent).toBe('17:00');
  });

  it('header renders next-alarm + enabled count from sensors', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    card.hass = makeAlarmHass();
    const badge = card.shadowRoot.getElementById('nextBadge');
    expect(badge.innerHTML).toContain('05:30 · Bedroom');
    expect(badge.textContent).toContain('1 enabled');
  });

  it('quick-action strip renders Weekday/Weekend/All (no Snooze when not playing)', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    card.hass = makeAlarmHass();
    const btns = card.shadowRoot.querySelectorAll('.qa-btn');
    expect(btns).toHaveLength(3); // snooze hidden because sonos_alarm_playing is False
    const ids = Array.from(btns).map(b => b.dataset.action);
    expect(ids).toEqual(['weekday', 'weekend', 'all']);
  });

  it('All toggle shows "All Off" + flips to disable when count > 0', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    hass.states['sensor.sonos_enabled_alarm_count'] = { entity_id: 'sensor.sonos_enabled_alarm_count', state: '2', attributes: {} };
    card.hass = hass;
    const allBtn = card.shadowRoot.querySelector('.qa-btn[data-action="all"]');
    expect(allBtn).toBeTruthy();
    expect(allBtn.dataset.flip).toBe('off');
    expect(allBtn.textContent).toContain('All Off');
    hass.callService.mockClear();
    allBtn.click();
    expect(hass.callService).toHaveBeenCalledWith('script', 'sonos_disable_all_alarms', {});
  });

  it('All toggle shows "All On" + flips to enable when count = 0', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    hass.states['sensor.sonos_enabled_alarm_count'] = { entity_id: 'sensor.sonos_enabled_alarm_count', state: '0', attributes: {} };
    card.hass = hass;
    const allBtn = card.shadowRoot.querySelector('.qa-btn[data-action="all"]');
    expect(allBtn).toBeTruthy();
    expect(allBtn.dataset.flip).toBe('on');
    expect(allBtn.textContent).toContain('All On');
    hass.callService.mockClear();
    allBtn.click();
    expect(hass.callService).toHaveBeenCalledWith('script', 'sonos_enable_all_alarms', {});
  });

  it('Snooze appears when sensor.sonos_alarm_playing is True', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    hass.states['sensor.sonos_alarm_playing'] = {
      entity_id: 'sensor.sonos_alarm_playing',
      state: 'True',
      attributes: { speaker: 'media_player.bedroom', alarm_entity: 'switch.sonos_alarm_bedroom' },
    };
    card.hass = hass;
    const ids = Array.from(card.shadowRoot.querySelectorAll('.qa-btn')).map(b => b.dataset.action);
    expect(ids).toContain('snooze');
  });

  it('quick-action strip hidden when show_quick_actions=false', () => {
    const card = mountCard();
    card.setConfig({ ...stubConfig(), show_quick_actions: false });
    card.hass = makeAlarmHass();
    const strip = card.shadowRoot.getElementById('qaStrip');
    expect(strip.style.display).toBe('none');
  });

  it('tap calls switch.toggle with the row entity', () => {
    vi.useFakeTimers();
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    card.hass = hass;
    const row = card.shadowRoot.querySelector('.alarm-row');
    row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(100); // less than HOLD_MS
    row.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(hass.callService).toHaveBeenCalledWith('switch', 'toggle', { entity_id: 'switch.sonos_alarm_bedroom' });
  });

  it('hold (400ms) calls script.sonos_load_alarm_for_edit with alarm_entity', () => {
    vi.useFakeTimers();
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    card.hass = hass;
    const row = card.shadowRoot.querySelectorAll('.alarm-row')[1]; // bath
    row.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(450);
    row.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    expect(hass.callService).toHaveBeenCalledWith('script', 'sonos_load_alarm_for_edit', { alarm_entity: 'switch.sonos_alarm_bath' });
    // toggle must NOT fire when hold fired
    const toggleCalls = hass.callService.mock.calls.filter(c => c[0] === 'switch');
    expect(toggleCalls).toHaveLength(0);
  });

  it('Weekday + Weekend buttons call the mapped scripts', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    const hass = makeAlarmHass();
    card.hass = hass;
    const btns = card.shadowRoot.querySelectorAll('.qa-btn');
    const scriptCalls = {};
    for (const btn of btns) {
      hass.callService.mockClear();
      btn.click();
      scriptCalls[btn.dataset.action] = hass.callService.mock.calls[0];
    }
    expect(scriptCalls.weekday[1]).toBe('sonos_enable_weekday_alarms');
    expect(scriptCalls.weekend[1]).toBe('sonos_enable_weekend_alarms');
    // 'all' is context-aware (count=1 in stub → flips off → calls disable_all)
    expect(scriptCalls.all[1]).toBe('sonos_disable_all_alarms');
  });

  it('getGridOptions returns list-like shape', () => {
    const card = mountCard();
    card.setConfig(stubConfig());
    card.hass = makeAlarmHass();
    expect(card.getGridOptions()).toEqual({
      columns: 12, min_columns: 6, rows: 'auto', min_rows: 2, max_rows: 12,
    });
  });

  it('setConfig with empty alarms renders placeholder without crashing', () => {
    const card = mountCard();
    card.setConfig({ alarms: [] });
    // Placeholder takes over shadowRoot rendering — no crash is the success signal
    expect(card.shadowRoot.innerHTML.length).toBeGreaterThan(0);
  });
});
