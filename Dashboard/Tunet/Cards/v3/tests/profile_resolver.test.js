const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadProfileExports() {
  const basePath = path.join(__dirname, '..', 'tunet_base.js');
  const source = fs.readFileSync(basePath, 'utf8');
  const transformed = source.replace(/\bexport\s+/g, '');

  const warnings = [];
  const sandbox = {
    module: { exports: {} },
    console: {
      warn: (msg) => warnings.push(String(msg)),
      info: () => {},
      log: () => {},
      error: () => {},
    },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    window: {},
    document: {},
    customElements: {
      get: () => undefined,
      define: () => {},
    },
  };

  const exportNames = [
    'FAMILY_KEYS',
    'SIZE_KEYS',
    'PROFILE_BASE',
    'SIZE_PROFILES',
    'PRESET_FAMILY_MAP',
    'autoSizeFromWidth',
    'bucketFromWidth',
    'selectProfileSize',
    'resolveSizeProfile',
    '_setProfileVars',
    'TOKEN_MAP',
  ];

  const wrapped = `${transformed}
module.exports = { ${exportNames.join(', ')} };
`;

  vm.runInNewContext(wrapped, sandbox, { filename: basePath });
  return { api: sandbox.module.exports, warnings };
}

test('valid family/size pairs return complete profiles with no undefined values', () => {
  const { api } = loadProfileExports();
  for (const family of api.FAMILY_KEYS) {
    for (const size of api.SIZE_KEYS) {
      const profile = api.resolveSizeProfile({ family, size });
      for (const [key, value] of Object.entries(profile)) {
        assert.notEqual(value, undefined, `${family}/${size} -> ${key} should be defined`);
      }
      for (const baseKey of Object.keys(api.PROFILE_BASE[size])) {
        assert.ok(baseKey in profile, `${family}/${size} should include base key ${baseKey}`);
      }
    }
  }
});

test('unknown family falls back to tile-grid standard with warning', () => {
  const { api, warnings } = loadProfileExports();
  const fallback = api.resolveSizeProfile({ family: 'unknown-family', size: 'standard' });
  assert.deepEqual(fallback, api.SIZE_PROFILES['tile-grid'].standard);
  assert.ok(warnings.some((w) => w.includes('Unknown family')));
});

test('unknown size falls back to family standard with warning', () => {
  const { api, warnings } = loadProfileExports();
  const fallback = api.resolveSizeProfile({ family: 'speaker-tile', size: 'slim' });
  assert.deepEqual(fallback, api.SIZE_PROFILES['speaker-tile'].standard);
  assert.ok(warnings.some((w) => w.includes('Unknown size')));
});

test('output shape is family-specific and does not leak extension keys', () => {
  const { api } = loadProfileExports();

  const tileGrid = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  assert.ok(!('orbSize' in tileGrid));
  assert.ok(!('alarmBtnH' in tileGrid));
  assert.ok(!('sparklineH' in tileGrid));

  const roomsRow = api.resolveSizeProfile({ family: 'rooms-row', size: 'standard' });
  assert.ok('orbSize' in roomsRow);
  assert.ok('toggleSize' in roomsRow);
  assert.ok('chevronSize' in roomsRow);
  assert.ok(!('alarmBtnH' in roomsRow));
  assert.ok(!('sparklineH' in roomsRow));

  const indicatorTile = api.resolveSizeProfile({ family: 'indicator-tile', size: 'standard' });
  assert.ok('timerFont' in indicatorTile);
  assert.ok('alarmBtnH' in indicatorTile);
  assert.ok(!('sparklineH' in indicatorTile));

  const indicatorRow = api.resolveSizeProfile({ family: 'indicator-row', size: 'standard' });
  assert.ok('sparklineH' in indicatorRow);
  assert.ok('trendGlyph' in indicatorRow);
  assert.ok(!('alarmBtnH' in indicatorRow));
});

test('PROFILE_BASE inheritance keeps shared typography/icon keys aligned', () => {
  const { api } = loadProfileExports();
  const tile = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  const speaker = api.resolveSizeProfile({ family: 'speaker-tile', size: 'standard' });

  const sharedKeys = ['iconBox', 'iconGlyph', 'nameFont', 'valueFont'];
  for (const key of sharedKeys) {
    assert.equal(tile[key], speaker[key], `shared key mismatch: ${key}`);
  }
});

test('resolveSizeProfile is idempotent and returns non-mutating copies', () => {
  const { api } = loadProfileExports();
  const first = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  const second = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  assert.deepEqual(first, second);

  first.tilePad = '99em';
  const third = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  assert.notEqual(third.tilePad, '99em');
});

test('legacy widthHint parameter on resolver is ignored and warns once', () => {
  const { api, warnings } = loadProfileExports();
  const withHint = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard', widthHint: 500 });
  const withoutHint = api.resolveSizeProfile({ family: 'tile-grid', size: 'standard' });
  assert.deepEqual(withHint, withoutHint);
  assert.ok(warnings.some((w) => w.includes('resolveSizeProfile(widthHint) is deprecated')));
});

test('selectProfileSize maps rooms row layout and respects explicit userSize', () => {
  const { api } = loadProfileExports();
  const rowResult = api.selectProfileSize({ preset: 'rooms', layout: 'row', widthHint: 400 });
  assert.equal(rowResult.family, 'rooms-row');
  assert.equal(rowResult.size, 'compact');

  const gridResult = api.selectProfileSize({ preset: 'rooms', layout: 'grid', widthHint: 400, userSize: 'large' });
  assert.equal(gridResult.family, 'tile-grid');
  assert.equal(gridResult.size, 'large');
});
