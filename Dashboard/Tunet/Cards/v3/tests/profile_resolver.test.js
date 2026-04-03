/**
 * Profile Resolver Tests — migrated to vitest ESM
 *
 * Tests the profile resolution system in tunet_base.js:
 * - selectProfileSize() maps presets + layout + width to family/size
 * - resolveSizeProfile() produces complete CSS token profiles
 * - Profile shapes are family-specific (no key leakage)
 * - Idempotent, non-mutating, fallback-safe
 */

import { describe, it, expect, vi } from 'vitest';
import {
  FAMILY_KEYS,
  SIZE_KEYS,
  PROFILE_BASE,
  SIZE_PROFILES,
  PRESET_FAMILY_MAP,
  autoSizeFromWidth,
  bucketFromWidth,
  selectProfileSize,
  resolveSizeProfile,
  _setProfileVars,
  TOKEN_MAP,
} from '../tunet_base.js';

describe('profile resolver', () => {
  it('valid family/size pairs return complete profiles with no undefined values', () => {
    for (const family of FAMILY_KEYS) {
      for (const size of SIZE_KEYS) {
        const profile = resolveSizeProfile({ family, size });
        for (const [key, value] of Object.entries(profile)) {
          expect(value, `${family}/${size} -> ${key} should be defined`).not.toBeUndefined();
        }
        for (const baseKey of Object.keys(PROFILE_BASE[size])) {
          expect(profile).toHaveProperty(baseKey);
        }
      }
    }
  });

  it('unknown family falls back to tile-grid standard with warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fallback = resolveSizeProfile({ family: 'unknown-family', size: 'standard' });
    expect(fallback).toEqual(SIZE_PROFILES['tile-grid'].standard);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown family'));
    warnSpy.mockRestore();
  });

  it('unknown size falls back to family standard with warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fallback = resolveSizeProfile({ family: 'speaker-tile', size: 'slim' });
    expect(fallback).toEqual(SIZE_PROFILES['speaker-tile'].standard);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown size'));
    warnSpy.mockRestore();
  });

  it('output shape is family-specific and does not leak extension keys', () => {
    const tileGrid = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    expect(tileGrid).not.toHaveProperty('orbSize');
    expect(tileGrid).not.toHaveProperty('alarmBtnH');
    expect(tileGrid).not.toHaveProperty('sparklineH');

    const roomsRow = resolveSizeProfile({ family: 'rooms-row', size: 'standard' });
    expect(roomsRow).toHaveProperty('orbSize');
    expect(roomsRow).toHaveProperty('toggleSize');
    expect(roomsRow).toHaveProperty('chevronSize');
    expect(roomsRow).not.toHaveProperty('alarmBtnH');
    expect(roomsRow).not.toHaveProperty('sparklineH');

    const indicatorTile = resolveSizeProfile({ family: 'indicator-tile', size: 'standard' });
    expect(indicatorTile).toHaveProperty('timerFont');
    expect(indicatorTile).toHaveProperty('alarmBtnH');
    expect(indicatorTile).not.toHaveProperty('sparklineH');

    const indicatorRow = resolveSizeProfile({ family: 'indicator-row', size: 'standard' });
    expect(indicatorRow).toHaveProperty('sparklineH');
    expect(indicatorRow).toHaveProperty('trendGlyph');
    expect(indicatorRow).not.toHaveProperty('alarmBtnH');
  });

  it('PROFILE_BASE inheritance keeps shared typography/icon keys aligned', () => {
    const tile = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    const speaker = resolveSizeProfile({ family: 'speaker-tile', size: 'standard' });

    const sharedKeys = ['iconBox', 'iconGlyph', 'nameFont', 'valueFont'];
    for (const key of sharedKeys) {
      expect(tile[key], `shared key mismatch: ${key}`).toBe(speaker[key]);
    }
  });

  it('resolveSizeProfile is idempotent and returns non-mutating copies', () => {
    const first = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    const second = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    expect(first).toEqual(second);

    first.tilePad = '99em';
    const third = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    expect(third.tilePad).not.toBe('99em');
  });

  it('legacy widthHint parameter on resolver is ignored and warns once', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const withHint = resolveSizeProfile({ family: 'tile-grid', size: 'standard', widthHint: 500 });
    const withoutHint = resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
    expect(withHint).toEqual(withoutHint);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('resolveSizeProfile(widthHint) is deprecated'));
    warnSpy.mockRestore();
  });

  it('selectProfileSize maps rooms row layout and respects explicit userSize', () => {
    const rowResult = selectProfileSize({ preset: 'rooms', layout: 'row', widthHint: 400 });
    expect(rowResult.family).toBe('rooms-row');
    expect(rowResult.size).toBe('compact');

    const gridResult = selectProfileSize({ preset: 'rooms', layout: 'grid', widthHint: 400, userSize: 'large' });
    expect(gridResult.family).toBe('tile-grid');
    expect(gridResult.size).toBe('large');
  });
});
