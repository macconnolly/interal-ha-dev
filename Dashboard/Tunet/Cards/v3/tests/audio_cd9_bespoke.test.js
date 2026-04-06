import { describe, it, expect, vi, afterEach } from 'vitest';
import { compactSpeakerName } from '../tunet_base.js';
import {
  readCardSource,
  extractCSSBlocks,
} from './helpers/css_contract_helpers.js';

if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

import '../tunet_media_card.js';
import '../tunet_sonos_card.js';
import '../tunet_speaker_grid_card.js';

function readCardCSS(filename) {
  return extractCSSBlocks(readCardSource(filename)).join('\n');
}

function makeAudioHass(overrides = {}) {
  return {
    themes: { darkMode: false },
    callService: vi.fn(() => Promise.resolve()),
    states: {
      'media_player.living_room': {
        entity_id: 'media_player.living_room',
        state: 'playing',
        attributes: {
          friendly_name: 'Living Room TV Sonos Soundbar',
          volume_level: 0.13,
          is_volume_muted: false,
          media_title: 'I Need You',
          media_artist: 'Lynyrd Skynyrd',
        },
      },
      'media_player.dining_room': {
        entity_id: 'media_player.dining_room',
        state: 'idle',
        attributes: {
          friendly_name: 'Dining Room Credenza Speaker',
          volume_level: 0.6,
          is_volume_muted: false,
        },
      },
      'media_player.kitchen': {
        entity_id: 'media_player.kitchen',
        state: 'idle',
        attributes: {
          friendly_name: 'Kitchen Sonos',
          volume_level: 0.46,
          is_volume_muted: false,
        },
      },
      'sensor.sonos_smart_coordinator': {
        entity_id: 'sensor.sonos_smart_coordinator',
        state: 'media_player.living_room',
        attributes: { is_tv_mode: false },
      },
      'sensor.sonos_active_group_coordinator': {
        entity_id: 'sensor.sonos_active_group_coordinator',
        state: 'media_player.living_room',
        attributes: {
          group_members: ['media_player.living_room', 'media_player.dining_room'],
        },
      },
      'sensor.sonos_playing_status': {
        entity_id: 'sensor.sonos_playing_status',
        state: 'playing',
        attributes: {},
      },
      'binary_sensor.sonos_living_room_in_active_group': {
        entity_id: 'binary_sensor.sonos_living_room_in_active_group',
        state: 'on',
        attributes: {},
      },
      'binary_sensor.sonos_dining_room_in_active_group': {
        entity_id: 'binary_sensor.sonos_dining_room_in_active_group',
        state: 'on',
        attributes: {},
      },
      'binary_sensor.sonos_kitchen_in_active_group': {
        entity_id: 'binary_sensor.sonos_kitchen_in_active_group',
        state: 'off',
        attributes: {},
      },
      ...overrides,
    },
  };
}

function createMediaCard(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-media-card');
  el.setConfig({
    entity: 'media_player.living_room',
    name: 'Sonos',
    show_progress: true,
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeAudioHass(hassOverrides);
  return el;
}

function createSonosCard(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-sonos-card');
  el.setConfig({
    entity: 'media_player.living_room',
    name: 'Sonos',
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeAudioHass(hassOverrides);
  return el;
}

function createSpeakerGridCard(config = {}, hassOverrides = {}) {
  const el = document.createElement('tunet-speaker-grid-card');
  el.setConfig({
    entity: 'media_player.living_room',
    name: 'Speakers',
    columns: 2,
    ...config,
  });
  document.body.appendChild(el);
  el.hass = makeAudioHass(hassOverrides);
  return el;
}

function cleanup(el) {
  if (el?.parentNode) el.parentNode.removeChild(el);
}

afterEach(() => {
  vi.useRealTimers();
  window.__tunetFailedMediaArtUrls = new Map();
  document.body.innerHTML = '';
});

describe('CD9 audio target contract', () => {
  it('compacts common room labels aggressively while preserving identity', () => {
    expect(compactSpeakerName('Living Room TV Sonos Soundbar')).toBe('Living');
    expect(compactSpeakerName('Dining Room Credenza Speaker')).toBe('Dining');
    expect(compactSpeakerName('Kitchen Sonos')).toBe('Kitchen');
    expect(compactSpeakerName('Primary Bedroom Sonos')).toBe('Bed');
    expect(compactSpeakerName('Bathroom Speaker')).toBe('Bath');
    expect(compactSpeakerName('Office Sonos')).toBe('Office');
  });

  it('media card volume follows selected speaker, but grouped coordinator selection targets the group', () => {
    const el = createMediaCard();
    el._activeEntity = 'media_player.dining_room';
    expect(el._volumeTarget).toBe('media_player.dining_room');

    el._activeEntity = 'media_player.living_room';
    expect(el._isGroupedCoordinatorSelected()).toBe(true);
    expect(el._volumeTarget).toBe('media_player.living_room');
    cleanup(el);
  });

  it('compacts explicit speaker names in displayed media/sonos labels too', () => {
    const media = createMediaCard({
      speakers: [
        { entity: 'media_player.living_room', name: 'Living Room TV Sonos Soundbar' },
      ],
    });
    const sonos = createSonosCard({
      speakers: [
        { entity: 'media_player.living_room', name: 'Living Room TV Sonos Soundbar' },
      ],
    });
    media._activeEntity = 'media_player.living_room';
    sonos._activeEntity = 'media_player.living_room';
    media._updateAll();
    sonos._updateAll();
    expect(media.shadowRoot.getElementById('spkLabel').textContent).toBe('Living');
    expect(sonos.shadowRoot.getElementById('sourceLabel').textContent).toBe('Living');
    cleanup(media);
    cleanup(sonos);
  });

  it('sonos card volume follows selected speaker, but grouped coordinator selection targets the group', () => {
    const el = createSonosCard();
    el._activeEntity = 'media_player.dining_room';
    expect(el._volumeTarget).toBe('media_player.dining_room');

    el._activeEntity = 'media_player.living_room';
    expect(el._isGroupedCoordinatorSelected()).toBe(true);
    expect(el._volumeTarget).toBe('media_player.living_room');
    cleanup(el);
  });

  it('media volume view auto-reverts after 5 seconds of inactivity', () => {
    vi.useFakeTimers();
    const el = createMediaCard();
    el._setView('volume');
    expect(el._view).toBe('volume');
    vi.advanceTimersByTime(5000);
    expect(el._view).toBe('track');
    cleanup(el);
  });

  it('sonos volume overlay auto-reverts after 5 seconds of inactivity', () => {
    vi.useFakeTimers();
    const el = createSonosCard();
    el._setVolumeOverlayActive(true);
    expect(el.shadowRoot.getElementById('volOverlay').classList.contains('active')).toBe(true);
    vi.advanceTimersByTime(5000);
    expect(el.shadowRoot.getElementById('volOverlay').classList.contains('active')).toBe(false);
    cleanup(el);
  });

  it('media volume view does not auto-revert while the slider is actively dragged', () => {
    vi.useFakeTimers();
    const el = createMediaCard();
    const track = el.shadowRoot.getElementById('volTrack');
    track.setPointerCapture = () => {};

    el._setView('volume');
    track.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), {
      pointerId: 1,
      clientX: 10,
    }));
    vi.advanceTimersByTime(5000);
    expect(el._view).toBe('volume');

    track.dispatchEvent(new Event('pointerup', { bubbles: true }));
    vi.advanceTimersByTime(5000);
    expect(el._view).toBe('track');
    cleanup(el);
  });

  it('sonos volume overlay does not auto-revert while the slider is actively dragged', () => {
    vi.useFakeTimers();
    const el = createSonosCard();
    const track = el.shadowRoot.getElementById('volTrack');
    track.setPointerCapture = () => {};

    el._setVolumeOverlayActive(true);
    track.dispatchEvent(Object.assign(new Event('pointerdown', { bubbles: true }), {
      pointerId: 2,
      clientX: 10,
    }));
    vi.advanceTimersByTime(5000);
    expect(el.shadowRoot.getElementById('volOverlay').classList.contains('active')).toBe(true);

    track.dispatchEvent(new Event('pointerup', { bubbles: true }));
    vi.advanceTimersByTime(5000);
    expect(el.shadowRoot.getElementById('volOverlay').classList.contains('active')).toBe(false);
    cleanup(el);
  });
});

describe('CD9 audio dropdown contract', () => {
  it('sonos adopts the same dropdown shell primitives as media', () => {
    const mediaCss = readCardCSS('tunet_media_card.js');
    const css = readCardCSS('tunet_sonos_card.js');
    expect(mediaCss).toMatch(/\.dd-menu\s*\{/);
    expect(mediaCss).toMatch(/background:\s*rgba\(255,255,255,\s*1\)/);
    expect(mediaCss).toMatch(/backdrop-filter:\s*none/);
    expect(css).toMatch(/\.speaker-wrap\s*\{/);
    expect(css).toMatch(/\.speaker-btn\s*\{/);
    expect(css).toMatch(/\.dd-menu\s*\{/);
    expect(css).toMatch(/background:\s*rgba\(255,255,255,\s*1\)/);
    expect(css).toMatch(/backdrop-filter:\s*none/);
    expect(css).toMatch(/\.dd-option\s*\{/);
    expect(css).toMatch(/\.grp-check\s*\{/);
    expect(css).toMatch(/\.dd-divider\s*\{/);
  });

  it('media dropdown opens and populates speaker rows', () => {
    const el = createMediaCard();
    const button = el.shadowRoot.getElementById('spkBtn');
    const menu = el.shadowRoot.getElementById('spkMenu');

    button.click();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(menu.classList.contains('open')).toBe(true);
    expect(menu.children.length).toBeGreaterThan(0);
    cleanup(el);
  });

  it('sonos dropdown renders compact labels plus group controls and group actions', () => {
    const el = createSonosCard();
    el._buildSourceMenu();
    const menu = el.shadowRoot.getElementById('sourceDd');
    const text = menu.textContent.replace(/\s+/g, ' ');
    expect(text).toContain('Living');
    expect(text).toContain('Dining');
    expect(text).toContain('Group All');
    expect(text).toContain('Ungroup All');
    expect(menu.querySelectorAll('.grp-check').length).toBeGreaterThan(0);
    cleanup(el);
  });

  it('sonos source button indicates grouped coordinator selection with the group icon', () => {
    const el = createSonosCard();
    el._activeEntity = 'media_player.living_room';
    el._updateAll();
    expect(el.shadowRoot.getElementById('sourceIcon').textContent).toBe('speaker_group');
    expect(el.shadowRoot.getElementById('sourceBtn').getAttribute('title')).toContain('Group volume');
    cleanup(el);
  });
});

describe('CD9 album art resilience', () => {
  it('prefers entity_picture_local over proxy art when available', () => {
    const media = createMediaCard({}, {
      'media_player.living_room': {
        entity_id: 'media_player.living_room',
        state: 'playing',
        attributes: {
          friendly_name: 'Living Room TV Sonos Soundbar',
          volume_level: 0.13,
          is_volume_muted: false,
          media_title: 'I Need You',
          media_artist: 'Lynyrd Skynyrd',
          entity_picture_local: '/api/image/serve/media-local',
          media_image_url: '/api/image/serve/media-remote',
          entity_picture: '/api/media_player_proxy/media_player.living_room?token=bad',
        },
      },
    });
    const sonos = createSonosCard({}, {
      'media_player.living_room': {
        entity_id: 'media_player.living_room',
        state: 'playing',
        attributes: {
          friendly_name: 'Living Room TV Sonos Soundbar',
          volume_level: 0.13,
          is_volume_muted: false,
          media_title: 'I Need You',
          media_artist: 'Lynyrd Skynyrd',
          entity_picture_local: '/api/image/serve/media-local',
          media_image_url: '/api/image/serve/media-remote',
          entity_picture: '/api/media_player_proxy/media_player.living_room?token=bad',
        },
      },
    });

    const mediaImg = media.shadowRoot.getElementById('albumArt').querySelector('img');
    const sonosImg = sonos.shadowRoot.getElementById('albumArt').querySelector('img');
    expect(mediaImg.src).toContain('/api/image/serve/media-local');
    expect(sonosImg.src).toContain('/api/image/serve/media-local');

    cleanup(media);
    cleanup(sonos);
  });

  it('suppresses repeated retries for a failed album art URL until the URL changes', () => {
    const el = createMediaCard({}, {
      'media_player.living_room': {
        entity_id: 'media_player.living_room',
        state: 'playing',
        attributes: {
          friendly_name: 'Living Room TV Sonos Soundbar',
          volume_level: 0.13,
          is_volume_muted: false,
          media_title: 'I Need You',
          media_artist: 'Lynyrd Skynyrd',
          entity_picture: '/api/media_player_proxy/media_player.living_room?token=bad-1',
        },
      },
    });

    const albumArt = el.shadowRoot.getElementById('albumArt');
    const firstImg = albumArt.querySelector('img');
    expect(firstImg).toBeTruthy();
    firstImg.dispatchEvent(new Event('error'));
    expect(albumArt.querySelector('img')).toBeNull();

    el._updateAll();
    expect(albumArt.querySelector('img')).toBeNull();

    el.hass = makeAudioHass({
      'media_player.living_room': {
        entity_id: 'media_player.living_room',
        state: 'playing',
        attributes: {
          friendly_name: 'Living Room TV Sonos Soundbar',
          volume_level: 0.13,
          is_volume_muted: false,
          media_title: 'I Need You',
          media_artist: 'Lynyrd Skynyrd',
          entity_picture: '/api/media_player_proxy/media_player.living_room?token=bad-2',
        },
      },
    });

    const nextImg = albumArt.querySelector('img');
    expect(nextImg).toBeTruthy();
    expect(nextImg.src).toContain('token=bad-2');
    cleanup(el);
  });
});

describe('CD9 visible speaker tile semantics', () => {
  it('sonos tile tap selects the active speaker without toggling group membership', () => {
    const el = createSonosCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    el._onTilePointerDown('media_player.dining_room', {
      clientX: 20,
      pointerId: 1,
      button: 0,
      stopPropagation() {},
    }, refs.tile);
    el._onPointerUp();
    expect(el._activeEntity).toBe('media_player.dining_room');
    expect(el._hass.callService).not.toHaveBeenCalledWith(
      'script',
      'sonos_toggle_group_membership',
      expect.anything(),
    );
    cleanup(el);
  });

  it('sonos group badge toggles membership and icon click opens more-info', () => {
    const el = createSonosCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    const infoSpy = vi.fn();
    el.addEventListener('hass-more-info', infoSpy);

    refs.badge.click();
    refs.iconWrap.click();

    expect(el._hass.callService).toHaveBeenCalledWith('script', 'sonos_toggle_group_membership', {
      target_speaker: 'media_player.dining_room',
    });
    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls.at(-1)[0].detail.entityId).toBe('media_player.dining_room');
    cleanup(el);
  });

  it('sonos icon hold opens more-info once without a duplicate click open', () => {
    vi.useFakeTimers();
    const el = createSonosCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    const infoSpy = vi.fn();
    el.addEventListener('hass-more-info', infoSpy);

    refs.iconWrap.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(400);
    refs.iconWrap.dispatchEvent(new Event('pointerup', { bubbles: true }));
    refs.iconWrap.click();

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0].detail.entityId).toBe('media_player.dining_room');
    cleanup(el);
  });

  it('sonos hold-drag routes volume to the selected tile target', () => {
    vi.useFakeTimers();
    const el = createSonosCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    el._onTilePointerDown('media_player.dining_room', {
      clientX: 20,
      pointerId: 1,
      button: 0,
      stopPropagation() {},
    }, refs.tile);
    vi.advanceTimersByTime(400);
    el._onPointerMove({ clientX: 40, cancelable: true, preventDefault() {} });
    vi.advanceTimersByTime(200);
    expect(el._hass.callService).toHaveBeenCalledWith('media_player', 'volume_set', expect.objectContaining({
      entity_id: 'media_player.dining_room',
    }));
    cleanup(el);
  });

  it('speaker-grid tile tap selects the active speaker without toggling group membership', () => {
    const el = createSpeakerGridCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    el._onTilePointerDown('media_player.dining_room', {
      clientX: 20,
      pointerId: 2,
      button: 0,
      stopPropagation() {},
    }, refs.tile);
    el._onPointerUp();
    expect(el._activeEntity).toBe('media_player.dining_room');
    expect(el._hass.callService).not.toHaveBeenCalledWith(
      'script',
      'sonos_toggle_group_membership',
      expect.anything(),
    );
    cleanup(el);
  });

  it('speaker-grid badge toggles membership and icon click opens more-info', () => {
    const el = createSpeakerGridCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    const infoSpy = vi.fn();
    el.addEventListener('hass-more-info', infoSpy);

    refs.badgeEl.click();
    refs.iconWrap.click();

    expect(el._hass.callService).toHaveBeenCalledWith('script', 'sonos_toggle_group_membership', {
      target_speaker: 'media_player.dining_room',
    });
    expect(infoSpy).toHaveBeenCalled();
    expect(infoSpy.mock.calls.at(-1)[0].detail.entityId).toBe('media_player.dining_room');
    cleanup(el);
  });

  it('speaker-grid icon hold opens more-info once without a duplicate click open', () => {
    vi.useFakeTimers();
    const el = createSpeakerGridCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    const infoSpy = vi.fn();
    el.addEventListener('hass-more-info', infoSpy);

    refs.iconWrap.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    vi.advanceTimersByTime(400);
    refs.iconWrap.dispatchEvent(new Event('pointerup', { bubbles: true }));
    refs.iconWrap.click();

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy.mock.calls[0][0].detail.entityId).toBe('media_player.dining_room');
    cleanup(el);
  });

  it('speaker-grid hold-drag routes volume to the selected tile target', () => {
    vi.useFakeTimers();
    const el = createSpeakerGridCard();
    const refs = el._tileRefs.get('media_player.dining_room');
    el._onTilePointerDown('media_player.dining_room', {
      clientX: 20,
      pointerId: 3,
      button: 0,
      stopPropagation() {},
    }, refs.tile);
    vi.advanceTimersByTime(400);
    el._onPointerMove({ clientX: 40, cancelable: true, preventDefault() {} });
    vi.advanceTimersByTime(200);
    expect(el._hass.callService).toHaveBeenCalledWith('media_player', 'volume_set', expect.objectContaining({
      entity_id: 'media_player.dining_room',
    }));
    cleanup(el);
  });

  it('speaker-grid collapses profiled large mobile layouts to one column', () => {
    const css = readCardCSS('tunet_speaker_grid_card.js');
    expect(css).toMatch(/@media\s*\(max-width:\s*440px\)\s*\{[\s\S]*?\.spk-grid\s*\{\s*grid-template-columns:\s*repeat\(var\(--cols-sm,\s*2\),\s*minmax\(0,\s*1fr\)\);/);

    const el = createSpeakerGridCard({
      columns: 3,
      tile_size: 'large',
      use_profiles: true,
    });
    expect(el.$.spkGrid.style.getPropertyValue('--cols')).toBe('3');
    expect(el.$.spkGrid.style.getPropertyValue('--cols-sm')).toBe('1');
    cleanup(el);
  });

  it('speaker-grid keeps profiled non-large mobile layouts at a maximum of two columns', () => {
    const el = createSpeakerGridCard({
      columns: 4,
      tile_size: 'standard',
      use_profiles: true,
    });
    expect(el.$.spkGrid.style.getPropertyValue('--cols')).toBe('4');
    expect(el.$.spkGrid.style.getPropertyValue('--cols-sm')).toBe('2');
    cleanup(el);
  });

  it('speaker-grid compact badge shifts into the corner and shrinks slightly', () => {
    const css = readCardCSS('tunet_speaker_grid_card.js');
    expect(css).toMatch(/:host\(\[tile-size="compact"\]\)\s+\.group-badge\s*\{[\s\S]*top:\s*4px;[\s\S]*right:\s*4px;[\s\S]*width:\s*20px;[\s\S]*height:\s*20px;/);
    expect(css).toMatch(/:host\(\[tile-size="compact"\]\)\s+\.group-badge\s+\.icon\s*\{\s*font-size:\s*12px;/);
  });
});
