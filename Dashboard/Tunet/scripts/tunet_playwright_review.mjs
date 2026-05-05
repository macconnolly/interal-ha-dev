#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');
const ENV_PATH = path.join(REPO_ROOT, '.env');
const DEFAULT_BASE_URL = 'http://10.0.0.21:8123';
const DEFAULT_OUTPUT_ROOT = path.join(os.tmpdir(), 'tunet-playwright-review');
const DEFAULT_STATE_FILE = path.join(DEFAULT_OUTPUT_ROOT, 'ha-storage-state.json');

const ALL_CARD_TAGS = [
  'tunet-actions-card',
  'tunet-scenes-card',
  'tunet-light-tile',
  'tunet-lighting-card',
  'tunet-rooms-card',
  'tunet-climate-card',
  'tunet-weather-card',
  'tunet-sensor-card',
  'tunet-status-card',
  'tunet-media-card',
  'tunet-sonos-card',
  'tunet-speaker-grid-card',
  'tunet-nav-card',
];

const CARD_ALIASES = {
  actions: 'tunet-actions-card',
  scenes: 'tunet-scenes-card',
  light_tile: 'tunet-light-tile',
  lighttile: 'tunet-light-tile',
  lighting: 'tunet-lighting-card',
  rooms: 'tunet-rooms-card',
  climate: 'tunet-climate-card',
  weather: 'tunet-weather-card',
  sensor: 'tunet-sensor-card',
  status: 'tunet-status-card',
  media: 'tunet-media-card',
  sonos: 'tunet-sonos-card',
  speaker_grid: 'tunet-speaker-grid-card',
  speakergrid: 'tunet-speaker-grid-card',
  nav: 'tunet-nav-card',
};

const CARD_SOURCE_PATHS = {
  'tunet-actions-card': 'Dashboard/Tunet/Cards/v3/tunet_actions_card.js',
  'tunet-scenes-card': 'Dashboard/Tunet/Cards/v3/tunet_scenes_card.js',
  'tunet-light-tile': 'Dashboard/Tunet/Cards/v3/tunet_light_tile.js',
  'tunet-lighting-card': 'Dashboard/Tunet/Cards/v3/tunet_lighting_card.js',
  'tunet-rooms-card': 'Dashboard/Tunet/Cards/v3/tunet_rooms_card.js',
  'tunet-climate-card': 'Dashboard/Tunet/Cards/v3/tunet_climate_card.js',
  'tunet-weather-card': 'Dashboard/Tunet/Cards/v3/tunet_weather_card.js',
  'tunet-sensor-card': 'Dashboard/Tunet/Cards/v3/tunet_sensor_card.js',
  'tunet-status-card': 'Dashboard/Tunet/Cards/v3/tunet_status_card.js',
  'tunet-media-card': 'Dashboard/Tunet/Cards/v3/tunet_media_card.js',
  'tunet-sonos-card': 'Dashboard/Tunet/Cards/v3/tunet_sonos_card.js',
  'tunet-speaker-grid-card': 'Dashboard/Tunet/Cards/v3/tunet_speaker_grid_card.js',
  'tunet-nav-card': 'Dashboard/Tunet/Cards/v3/tunet_nav_card.js',
};

const CARD_FILE_BASENAMES = Object.fromEntries(
  Object.entries(CARD_SOURCE_PATHS).map(([tag, filePath]) => [path.basename(filePath), tag])
);

const CARD_TEST_HINTS = {
  audio_cd9_bespoke: ['tunet-media-card', 'tunet-sonos-card', 'tunet-speaker-grid-card'],
  config_contract: ALL_CARD_TAGS,
  editor_array_schema: ALL_CARD_TAGS,
  interaction_dom_contract: ALL_CARD_TAGS,
  interaction_keyboard_contract: ALL_CARD_TAGS,
  interaction_source_contract: ALL_CARD_TAGS,
  lighting_bespoke: ['tunet-light-tile', 'tunet-lighting-card'],
  rooms_bespoke: ['tunet-rooms-card'],
  sizing_sections_contract: ALL_CARD_TAGS,
  status_bespoke: ['tunet-status-card'],
  utility_strip_bespoke: ['tunet-actions-card', 'tunet-scenes-card'],
  weather_bespoke: ['tunet-weather-card'],
};

const SHARED_CARD_IMPACT_PATHS = new Set([
  'Dashboard/Tunet/Cards/v3/tunet_base.js',
  'Dashboard/Tunet/tunet-card-rehab-lab.yaml',
  'Dashboard/Tunet/tunet-suite-config.yaml',
  'Dashboard/Tunet/tunet-suite-storage-config.yaml',
]);

const CD_CARD_MAP = {
  CD0: ALL_CARD_TAGS,
  CD1: ALL_CARD_TAGS,
  CD2: ALL_CARD_TAGS,
  CD3: ALL_CARD_TAGS,
  CD4: ALL_CARD_TAGS,
  CD5: ['tunet-actions-card', 'tunet-scenes-card'],
  CD6: ['tunet-light-tile', 'tunet-lighting-card'],
  CD7: ['tunet-rooms-card'],
  CD8: ['tunet-climate-card', 'tunet-weather-card', 'tunet-sensor-card'],
  CD9: ['tunet-media-card', 'tunet-sonos-card', 'tunet-speaker-grid-card'],
  CD10: ['tunet-nav-card'],
  CD11: ['tunet-status-card'],
  CD12: ALL_CARD_TAGS,
};

const LOCKED_BREAKPOINTS = {
  '390x844': { width: 390, height: 844, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
  '768x1024': { width: 768, height: 1024, hasTouch: true, isMobile: false, deviceScaleFactor: 2 },
  '1024x1366': { width: 1024, height: 1366, hasTouch: false, isMobile: false, deviceScaleFactor: 1 },
  '1440x900': { width: 1440, height: 900, hasTouch: false, isMobile: false, deviceScaleFactor: 1 },
};

const ROUTE_SETS = {
  rehab: [
    { id: 'lab', path: '/tunet-card-rehab-yaml/lab' },
    { id: 'states', path: '/tunet-card-rehab-yaml/states' },
    { id: 'surfaces', path: '/tunet-card-rehab-yaml/surfaces' },
    { id: 'phone-stress', path: '/tunet-card-rehab-yaml/phone-stress' },
    { id: 'nav-lab', path: '/tunet-card-rehab-yaml/nav-lab' },
  ],
  storage: [
    { id: 'overview', path: '/tunet-suite-storage/overview' },
    { id: 'rooms', path: '/tunet-suite-storage/rooms' },
    { id: 'media', path: '/tunet-suite-storage/media' },
    { id: 'living-room', path: '/tunet-suite-storage/living-room' },
    { id: 'kitchen', path: '/tunet-suite-storage/kitchen' },
    { id: 'dining-room', path: '/tunet-suite-storage/dining-room' },
    { id: 'bedroom', path: '/tunet-suite-storage/bedroom' },
  ],
};

const THEMES = ['dark', 'light'];
const ANY_CARD_SELECTOR = ALL_CARD_TAGS.join(', ');
const STATUS_REQUIRED_VARIANTS = ['home_summary', 'home_detail', 'alarms', 'room_row', 'info_only', 'custom'];

function readDotEnv(filePath = ENV_PATH) {
  const vars = {};
  if (!fs.existsSync(filePath)) return vars;

  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx <= 0) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let value = trimmed.slice(eqIdx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) return DEFAULT_BASE_URL;
  let normalized = baseUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `http://${normalized}`;
  }
  const parsed = new URL(normalized);
  if (!parsed.port) {
    parsed.port = new URL(DEFAULT_BASE_URL).port;
  }
  const finalUrl = parsed.toString();
  return finalUrl.endsWith('/') ? finalUrl.slice(0, -1) : finalUrl;
}

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function parseListValue(raw) {
  return String(raw)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function printHelp() {
  console.log(`
Tunet authenticated Playwright review harness

Usage:
  node Dashboard/Tunet/scripts/tunet_playwright_review.mjs [options]

Options:
  --surface <rehab|storage|all>   Route family to review (default: rehab)
  --view <id[,id...]>             Specific route ids to review
  --cd <CD7[,CD9...]>             Filter cards by owning consistency-driver tranche
  --card <tag|alias[,more]>       Filter cards directly (e.g. rooms, tunet-rooms-card)
  --changed-cards                 Filter to Tunet cards touched by the current git working context
  --breakpoint <390x844[,..]>     Locked breakpoint ids to capture
  --theme <dark|light[,..]>       Emulated color schemes to capture
  --base-url <url>                HA base URL (default: .env HA_LOCAL_URL or ${DEFAULT_BASE_URL})
  --output-dir <path>             Output directory root
  --storage-state <path>          Playwright storage state cache path
  --headful                       Show the browser while running
  --fresh-auth                    Ignore cached auth state and log in again
  --smoke                         Fast pass: first route only, 390x844, light theme
  --with-probes                   Run optional card-specific visual probes in addition to screenshots
  --help                          Show this message
`);
}

function parseArgs(argv) {
  const options = {
    surface: 'rehab',
    views: [],
    cds: [],
    cards: [],
    changedCards: false,
    breakpoints: Object.keys(LOCKED_BREAKPOINTS),
    themes: [...THEMES],
    baseUrl: null,
    outputDir: DEFAULT_OUTPUT_ROOT,
    storageState: DEFAULT_STATE_FILE,
    headless: true,
    freshAuth: false,
    smoke: false,
    withProbes: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--surface' && next) {
      options.surface = next;
      i += 1;
    } else if (arg === '--view' && next) {
      options.views.push(...parseListValue(next));
      i += 1;
    } else if (arg === '--cd' && next) {
      options.cds.push(...parseListValue(next).map((value) => value.toUpperCase()));
      i += 1;
    } else if (arg === '--card' && next) {
      options.cards.push(...parseListValue(next));
      i += 1;
    } else if (arg === '--changed-cards') {
      options.changedCards = true;
    } else if (arg === '--breakpoint' && next) {
      options.breakpoints = parseListValue(next);
      i += 1;
    } else if (arg === '--theme' && next) {
      options.themes = parseListValue(next).map((value) => value.toLowerCase());
      i += 1;
    } else if (arg === '--base-url' && next) {
      options.baseUrl = next;
      i += 1;
    } else if (arg === '--output-dir' && next) {
      options.outputDir = next;
      i += 1;
    } else if (arg === '--storage-state' && next) {
      options.storageState = next;
      i += 1;
    } else if (arg === '--headful') {
      options.headless = false;
    } else if (arg === '--fresh-auth') {
      options.freshAuth = true;
    } else if (arg === '--smoke') {
      options.smoke = true;
    } else if (arg === '--with-probes') {
      options.withProbes = true;
    } else if (arg === '--help') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown or incomplete argument: ${arg}`);
    }
  }

  if (options.smoke) {
    options.breakpoints = ['390x844'];
    options.themes = ['light'];
  }

  return options;
}

function resolveCards(options) {
  const selected = new Set();
  let explicitSelection = false;

  for (const cd of options.cds) {
    const tags = CD_CARD_MAP[cd];
    if (!tags) throw new Error(`Unknown CD selection: ${cd}`);
    tags.forEach((tag) => selected.add(tag));
    explicitSelection = true;
  }

  for (const card of options.cards) {
    const normalized = CARD_ALIASES[slug(card).replace(/-/g, '_')] || card;
    const tag = normalized.startsWith('tunet-') ? normalized : CARD_ALIASES[normalized] || null;
    if (!tag || !ALL_CARD_TAGS.includes(tag)) {
      throw new Error(`Unknown card selection: ${card}`);
    }
    selected.add(tag);
    explicitSelection = true;
  }

  if (options.changedCards) {
    const changedContext = resolveChangedCardContext();
    options.changedCardContext = changedContext;
    changedContext.cards.forEach((tag) => selected.add(tag));
    if (!changedContext.cards.length && !explicitSelection) {
      throw new Error('No changed Tunet card implementations were detected for --changed-cards.');
    }
  }

  return selected.size ? Array.from(selected) : [...ALL_CARD_TAGS];
}

function parseGitStatusPath(line) {
  const raw = String(line || '').slice(3).trim();
  if (!raw) return '';
  const renamed = raw.split(' -> ').pop();
  return renamed.replace(/^"|"$/g, '');
}

function resolveChangedCardContext() {
  let output = '';
  try {
    output = execFileSync(
      'git',
      [
        '-C',
        REPO_ROOT,
        'status',
        '--short',
        '--',
        'Dashboard/Tunet/Cards/v3',
        'Dashboard/Tunet/tunet-card-rehab-lab.yaml',
        'Dashboard/Tunet/tunet-suite-config.yaml',
        'Dashboard/Tunet/tunet-suite-storage-config.yaml',
      ],
      { encoding: 'utf8' }
    );
  } catch (error) {
    throw new Error(`Unable to inspect changed Tunet cards with git status: ${error.message}`);
  }

  const paths = output
    .split(/\r?\n/)
    .map(parseGitStatusPath)
    .filter(Boolean);
  const cards = new Set();
  const reasons = [];

  for (const filePath of paths) {
    if (filePath.includes('/dist/') || filePath.endsWith('.map') || filePath.endsWith('/manifest.json')) {
      continue;
    }

    if (SHARED_CARD_IMPACT_PATHS.has(filePath)) {
      ALL_CARD_TAGS.forEach((tag) => cards.add(tag));
      reasons.push({ path: filePath, cards: [...ALL_CARD_TAGS], reason: 'shared dashboard/card context changed' });
      continue;
    }

    const basename = path.basename(filePath);
    const directTag = CARD_FILE_BASENAMES[basename];
    if (directTag) {
      cards.add(directTag);
      reasons.push({ path: filePath, cards: [directTag], reason: 'card implementation changed' });
      continue;
    }

    const testHint = Object.entries(CARD_TEST_HINTS).find(([hint]) => basename.includes(hint));
    if (testHint) {
      const [, hintedCards] = testHint;
      hintedCards.forEach((tag) => cards.add(tag));
      reasons.push({ path: filePath, cards: hintedCards, reason: 'card regression test changed' });
    }
  }

  return {
    paths,
    cards: [...cards],
    reasons,
  };
}

function resolveRoutes(options) {
  const selectedSets = options.surface === 'all' ? ['rehab', 'storage'] : [options.surface];
  const routes = [];
  for (const setName of selectedSets) {
    const setRoutes = ROUTE_SETS[setName];
    if (!setRoutes) throw new Error(`Unknown surface selection: ${setName}`);
    for (const route of setRoutes) {
      if (!options.views.length || options.views.includes(route.id)) {
        routes.push({ ...route, surface: setName });
      }
    }
  }

  if (options.smoke && !options.views.length) {
    const firstBySurface = [];
    const seen = new Set();
    for (const route of routes) {
      if (!seen.has(route.surface)) {
        firstBySurface.push(route);
        seen.add(route.surface);
      }
    }
    return firstBySurface;
  }

  if (!routes.length) {
    throw new Error('No routes matched the current --surface/--view selection.');
  }

  return routes;
}

function resolveBreakpoints(options) {
  const breakpoints = [];
  for (const key of options.breakpoints) {
    const spec = LOCKED_BREAKPOINTS[key];
    if (!spec) throw new Error(`Unknown breakpoint: ${key}`);
    breakpoints.push({ id: key, ...spec });
  }
  return breakpoints;
}

function resolveThemes(options) {
  for (const theme of options.themes) {
    if (!THEMES.includes(theme)) {
      throw new Error(`Unknown theme: ${theme}`);
    }
  }
  return options.themes;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function toRouteUrl(baseUrl, routePath) {
  return `${baseUrl}${routePath}`;
}

function capturePath(root, ...parts) {
  const joined = path.join(root, ...parts);
  ensureDir(path.dirname(joined));
  return joined;
}

function isIdentityTransform(transform) {
  if (!transform || transform === 'none') return true;
  return transform === 'matrix(1, 0, 0, 1, 0, 0)';
}

function addProbeAssertions(routeResult, assertions) {
  routeResult.warnings = routeResult.warnings || [];
  for (const assertion of assertions) {
    if (!assertion.pass && assertion.severity === 'error') {
      routeResult.failures.push(`Probe failed: ${assertion.name}${assertion.note ? ` (${assertion.note})` : ''}`);
    } else if (!assertion.pass) {
      routeResult.warnings.push(`Probe warning: ${assertion.name}${assertion.note ? ` (${assertion.note})` : ''}`);
    }
  }
}

function isRelevantTunetError(message) {
  const lower = String(message || '').toLowerCase();
  return (
    lower.includes('tunet') ||
    lower.includes('/local/tunet/') ||
    lower.includes('tunet-') ||
    lower.includes('custom:tunet')
  );
}

async function loginIfNeeded(page, targetUrl, credentials) {
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const passwordLocator = page.locator('input[name="password"], input[type="password"], input[autocomplete="current-password"]').first();
  const loginVisible = await passwordLocator.isVisible().catch(() => false);
  if (!page.url().includes('/auth/') && !loginVisible) return false;

  if (!credentials.username || !credentials.password) {
    throw new Error('HA_USERNAME and HA_PASSWORD are required for authenticated review.');
  }

  const usernameInput = page.locator('input[name="username"], input[autocomplete="username"], ha-textfield input').first();
  const passwordInput = passwordLocator;

  await usernameInput.waitFor({ state: 'visible', timeout: 30000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 30000 });
  await usernameInput.fill(credentials.username);
  await passwordInput.fill(credentials.password);

  await Promise.all([
    page.waitForLoadState('domcontentloaded').catch(() => {}),
    passwordInput.press('Enter'),
  ]);
  await page.waitForTimeout(1500);

  const stillOnLogin = page.url().includes('/auth/') || (await passwordInput.isVisible().catch(() => false));
  if (stillOnLogin) {
    const visibleSubmit = page
      .locator('button:visible, input[type="submit"]:visible, ha-progress-button:visible')
      .filter({ hasText: /sign in|log in|submit|next|continue/i })
      .first();
    await Promise.all([
      page.waitForLoadState('domcontentloaded').catch(() => {}),
      visibleSubmit.click({ force: true }),
    ]);
  }

  await page.waitForFunction(() => !window.location.pathname.startsWith('/auth/'), null, { timeout: 30000 });
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  return true;
}

async function waitForCards(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  try {
    await page.locator(ANY_CARD_SELECTOR).first().waitFor({ state: 'visible', timeout: 30000 });
  } catch (error) {
    const currentUrl = page.url();
    const loginVisible = await page
      .locator('input[name="password"], input[type="password"], input[autocomplete="current-password"]')
      .first()
      .isVisible()
      .catch(() => false);
    const bodyPreview = await page
      .locator('body')
      .evaluate((body) => body.textContent.replace(/\s+/g, ' ').trim().slice(0, 240))
      .catch(() => '');
    throw new Error(
      `Timed out waiting for Tunet cards at ${currentUrl}${loginVisible ? ' (login form still visible)' : ''}. Body preview: ${bodyPreview}`
    );
  }
  await page.waitForTimeout(1200);
}

async function waitForVisualReadiness(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, 2500)),
        ]);
      } catch (_) {
        // Ignore font readiness failures and fall through to the timed settle below.
      }
    }
  }).catch(() => {});
  await page.waitForTimeout(500);
}

async function installRoomsInteractionBlockers(page) {
  await page.evaluate(() => {
    if (window.__tunetRoomsReviewBlockersInstalled) return;
    const selector = '.room-tile, .room-row-main, .room-orb, .room-action-btn';
    const shouldBlock = (event) =>
      (event.composedPath?.() || []).some(
        (node) => node instanceof Element && (node.matches?.(selector) || node.closest?.(selector))
      );
    const blocker = (event) => {
      if (!shouldBlock(event)) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };
    window.addEventListener('click', blocker, true);
    window.__tunetRoomsReviewBlockersInstalled = true;
  });
}

async function evaluateRoomProbe(cardLocator) {
  return cardLocator.evaluate((card) => {
    const root = card.shadowRoot;
    if (!root) return null;
    const tile = root.querySelector('.room-grid.row-mode .room-tile');
    const orb = root.querySelector('.room-grid.row-mode .room-orb');
    const power = root.querySelector('.room-grid.row-mode .room-action-btn');
    if (!tile || !orb || !power) return null;
    const tileStyle = getComputedStyle(tile);
    const orbStyle = getComputedStyle(orb);
    const powerStyle = getComputedStyle(power);
    const orbRect = orb.getBoundingClientRect();
    const powerRect = power.getBoundingClientRect();
    return {
      tileTransform: tileStyle.transform,
      tileBoxShadow: tileStyle.boxShadow,
      orbTransform: orbStyle.transform,
      orbBoxShadow: orbStyle.boxShadow,
      powerTransform: powerStyle.transform,
      powerBoxShadow: powerStyle.boxShadow,
      orbSize: { width: orbRect.width, height: orbRect.height },
      powerSize: { width: powerRect.width, height: powerRect.height },
    };
  });
}

async function runRoomsProbes(page, routeResult, outputRoot) {
  const card = page.locator('tunet-rooms-card').first();
  if ((await card.count()) === 0) return null;

  const rowTile = card.locator('.room-grid.row-mode .room-tile').first();
  if ((await rowTile.count()) === 0) return null;

  const rowMain = card.locator('.room-grid.row-mode .room-row-main').first();
  const orb = card.locator('.room-grid.row-mode .room-orb').first();
  const power = card.locator('.room-grid.row-mode .room-action-btn').first();
  if ((await rowMain.count()) === 0 || (await orb.count()) === 0 || (await power.count()) === 0) return null;

  await installRoomsInteractionBlockers(page);
  await rowTile.scrollIntoViewIfNeeded();

  const rowMainBox = await rowMain.boundingBox();
  const before = await evaluateRoomProbe(card);
  if (!rowMainBox || !before) return null;

  const bodyScreenshotPath = capturePath(outputRoot, 'probes', 'rooms-row-body-press.png');
  const orbScreenshotPath = capturePath(outputRoot, 'probes', 'rooms-row-orb-press.png');

  await page.mouse.move(rowMainBox.x + rowMainBox.width / 2, rowMainBox.y + rowMainBox.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(80);
  const bodyPress = await evaluateRoomProbe(card);
  await rowTile.screenshot({ path: bodyScreenshotPath, animations: 'disabled' });
  await page.mouse.up();

  await card.evaluate((cardElement) => {
    const root = cardElement.shadowRoot;
    const tile = root?.querySelector('.room-grid.row-mode .room-tile');
    const orbElement = root?.querySelector('.room-grid.row-mode .room-orb');
    tile?.classList.add('control-press-active');
    orbElement?.classList.add('control-press-active');
  });
  await page.waitForTimeout(80);
  const orbPress = await evaluateRoomProbe(card);
  await rowTile.screenshot({ path: orbScreenshotPath, animations: 'disabled' });
  await card.evaluate((cardElement) => {
    const root = cardElement.shadowRoot;
    const tile = root?.querySelector('.room-grid.row-mode .room-tile');
    const orbElement = root?.querySelector('.room-grid.row-mode .room-orb');
    tile?.classList.remove('control-press-active');
    orbElement?.classList.remove('control-press-active');
  });

  const orbPowerSameSize =
    Math.abs(before.orbSize.width - before.powerSize.width) <= 1 &&
    Math.abs(before.orbSize.height - before.powerSize.height) <= 1;

  const rowBodyShowsPressed = !isIdentityTransform(bodyPress?.tileTransform);
  const orbKeepsRowNeutral = isIdentityTransform(orbPress?.tileTransform);
  const orbShowsPressed = !isIdentityTransform(orbPress?.orbTransform);

  const assertions = [
    { name: 'rooms_orb_power_same_size', pass: orbPowerSameSize, severity: 'error' },
    { name: 'rooms_row_body_shows_pressed_visual', pass: rowBodyShowsPressed, severity: 'error' },
    { name: 'rooms_orb_press_does_not_press_row', pass: orbKeepsRowNeutral, severity: 'error' },
    {
      name: 'rooms_orb_press_shows_local_pressed_visual',
      pass: orbShowsPressed,
      severity: 'warning',
      note: 'Computed-style probe remains weaker than direct human visual confirmation for nested control press states.',
    },
  ];

  routeResult.probes = {
    rooms: {
      screenshots: {
        rowBody: bodyScreenshotPath,
        orb: orbScreenshotPath,
      },
      before,
      bodyPress,
      orbPress,
      assertions,
    },
  };

  addProbeAssertions(routeResult, assertions);

  return routeResult.probes.rooms;
}

async function runGenericCardProbes(page, routeResult, selectedCards) {
  const cards = [];

  for (const tag of selectedCards) {
    const tagCards = await page.locator(tag).evaluateAll((instances, cardTag) => {
      const hasScrollableClipAncestor = (node, root) => {
        let current = node.parentElement;
        while (current && current !== root) {
          const style = getComputedStyle(current);
          const overflowX = style.overflowX;
          if (
            ['auto', 'scroll', 'hidden', 'clip'].includes(overflowX) &&
            current.scrollWidth > current.clientWidth + 1
          ) {
            return true;
          }
          current = current.parentElement;
        }
        return false;
      };

      const isVisibleElement = (node) => {
        if (!(node instanceof Element)) return false;
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) !== 0 &&
          rect.width > 1 &&
          rect.height > 1
        );
      };

      const hasIntentionalTextClamp = (node, style) => {
        const lineClamp = Number.parseInt(style.webkitLineClamp || style.lineClamp || '0', 10);
        return (
          style.textOverflow === 'ellipsis' ||
          lineClamp > 0 ||
          node.classList.contains('icon') ||
          String(style.fontFamily || '').includes('Material Symbols')
        );
      };

      return instances.map((card, index) => {
        const root = card.shadowRoot;
        const cardRect = card.getBoundingClientRect();
        const visible = cardRect.width > 1 && cardRect.height > 1;
        const elements = root ? [...root.querySelectorAll('*')].filter(isVisibleElement) : [];
        const uncontained = [];
        const textClipViolations = [];

        for (const node of elements) {
          const rect = node.getBoundingClientRect();
          const className = String(node.className || '');
          const tagName = node.tagName.toLowerCase();
          if (
            rect.left < cardRect.left - 2 ||
            rect.right > cardRect.right + 2
          ) {
            if (!hasScrollableClipAncestor(node, root)) {
              uncontained.push({
                tag: tagName,
                className,
                text: node.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80) || '',
                left: Math.round(rect.left - cardRect.left),
                right: Math.round(rect.right - cardRect.right),
              });
            }
          }

          const directText = [...node.childNodes]
            .filter((child) => child.nodeType === Node.TEXT_NODE)
            .map((child) => child.textContent || '')
            .join('')
            .replace(/\s+/g, ' ')
            .trim();
          if (!directText || directText.length < 3 || node.clientWidth <= 0) continue;
          const style = getComputedStyle(node);
          if (node.scrollWidth > node.clientWidth + 2 && !hasIntentionalTextClamp(node, style)) {
            textClipViolations.push({
              tag: tagName,
              className,
              text: directText.slice(0, 80),
              scrollWidth: node.scrollWidth,
              clientWidth: node.clientWidth,
              textOverflow: style.textOverflow,
              overflowX: style.overflowX,
            });
          }
        }

        return {
          tag: cardTag,
          index: index + 1,
          visible,
          hasShadowRoot: Boolean(root),
          card: {
            width: Math.round(cardRect.width),
            height: Math.round(cardRect.height),
          },
          visibleDescendants: elements.length,
          shadowTextLength: (root?.textContent || '').replace(/\s+/g, ' ').trim().length,
          uncontained,
          textClipViolations,
        };
      });
    }, tag);
    cards.push(...tagCards);
  }

  const probe = { selectedCards, cards };

  const assertions = [];
  const assert = (name, pass, severity = 'error', note = '') => {
    assertions.push({ name, pass: Boolean(pass), severity, note });
  };

  for (const card of probe.cards) {
    const id = `${card.tag}_${card.index}`;
    assert(`visual_${id}_has_visible_area`, card.visible && card.card.width > 40 && card.card.height > 20, 'error');
    assert(`visual_${id}_has_shadow_root`, card.hasShadowRoot, 'error');
    assert(
      `visual_${id}_has_rendered_descendants`,
      card.visibleDescendants > 0 && card.shadowTextLength > 0,
      'error',
      `descendants=${card.visibleDescendants}, textLength=${card.shadowTextLength}`
    );
    assert(
      `visual_${id}_no_uncontained_horizontal_overflow`,
      card.uncontained.length === 0,
      'error',
      `${card.uncontained.length} visible descendant(s) escape host bounds`
    );
    assert(
      `visual_${id}_text_clipping_is_intentional`,
      card.textClipViolations.length === 0,
      'error',
      `${card.textClipViolations.length} unclamped text clip candidate(s)`
    );
  }

  routeResult.probes = {
    ...(routeResult.probes || {}),
    genericCards: {
      selectedCards,
      cards: probe.cards,
      assertions,
    },
  };
  addProbeAssertions(routeResult, assertions);
  return routeResult.probes.genericCards;
}

async function runStatusProbes(page, routeResult) {
  const hasStatusCards = (await page.locator('tunet-status-card').count()) > 0;
  if (!hasStatusCards) return null;

  const cards = await page.locator('tunet-status-card').evaluateAll((instances, requiredVariants) => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const isPhone = viewportWidth <= 440;
    const cards = instances
      .filter((card) => {
        const rect = card.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      })
      .map((card, index) => {
        const root = card.shadowRoot;
        const cardRect = card.getBoundingClientRect();
        const title = root?.querySelector('.hdr-title');
        const grid = root?.querySelector('.grid');
        const tiles = [...(root?.querySelectorAll('.tile') || [])];
        const values = [...(root?.querySelectorAll('.tile-val') || [])];
        const dropdowns = [...(root?.querySelectorAll('.tile[data-type="dropdown"] .tile-dd-val') || [])];
        const secondary = [...(root?.querySelectorAll('.tile-secondary') || [])];
        const gridStyle = grid ? getComputedStyle(grid) : null;
        const titleStyle = title ? getComputedStyle(title) : null;
        const firstTileStyle = tiles[0] ? getComputedStyle(tiles[0]) : null;
        const firstTileRect = tiles[0]?.getBoundingClientRect?.();
        const gridRect = grid?.getBoundingClientRect?.() || cardRect;
        const tileOverflowCount = tiles.filter((tile) => {
          const rect = tile.getBoundingClientRect();
          const style = getComputedStyle(tile);
          const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 1 && rect.height > 1;
          return visible && (rect.left < gridRect.left - 1 || rect.right > gridRect.right + 1);
        }).length;
        const valueFontSizes = values.map((node) => Number.parseFloat(getComputedStyle(node).fontSize) || 0).filter(Boolean);
        const valueTexts = values.map((node) => node.textContent.trim());
        const variant = card.getAttribute('layout-variant') || '';

        return {
          index,
          variant,
          title: title?.textContent?.replace(/\s+/g, ' ').trim() || '',
          card: {
            width: cardRect.width,
            height: cardRect.height,
          },
          grid: grid ? {
            clientWidth: grid.clientWidth,
            scrollWidth: grid.scrollWidth,
            flexWrap: gridStyle.flexWrap,
            overflowX: gridStyle.overflowX,
            display: gridStyle.display,
          } : null,
          titleFontSize: titleStyle ? Number.parseFloat(titleStyle.fontSize) || 0 : 0,
          firstTileHeight: firstTileRect?.height || 0,
          firstTilePadding: firstTileStyle?.padding || '',
          valueTexts,
          valueFontSizes,
          dropdowns: dropdowns.map((node) => {
            const style = getComputedStyle(node);
            return {
              text: node.textContent.trim(),
              justifyContent: style.justifyContent,
              textAlign: style.textAlign,
              fontSize: Number.parseFloat(style.fontSize) || 0,
            };
          }),
          secondaryVisibleCount: secondary.filter((node) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          }).length,
          tileOverflowCount,
        };
      });

    const byVariant = Object.fromEntries(cards.map((card) => [card.variant, card]));
    return {
      viewportWidth,
      isPhone,
      requiredVariants,
      presentVariants: cards.map((card) => card.variant),
      cards,
      byVariant,
    };
  }, STATUS_REQUIRED_VARIANTS);
  const probe = cards;

  const assertions = [];
  const byVariant = probe.byVariant || {};
  const summary = byVariant.home_summary;
  const roomRow = byVariant.room_row;
  const detail = byVariant.home_detail;
  const infoOnly = byVariant.info_only;
  const custom = byVariant.custom;

  const assert = (name, pass, severity = 'error', note = '') => {
    assertions.push({ name, pass: Boolean(pass), severity, note });
  };

  if (routeResult.surface === 'rehab' && routeResult.routeId === 'states') {
    for (const variant of STATUS_REQUIRED_VARIANTS) {
      assert(`status_states_variant_present_${variant}`, probe.presentVariants.includes(variant), 'error');
    }
  }

  for (const card of probe.cards) {
    if (card.variant === 'room_row' && !probe.isPhone) continue;
    assert(
      `status_${card.variant || card.index}_tiles_stay_inside_card`,
      card.tileOverflowCount === 0,
      'error',
      `${card.tileOverflowCount} tile(s) overflow horizontally`
    );
  }

  for (const card of [detail, custom].filter(Boolean)) {
    for (const dropdown of card.dropdowns) {
      assert(
        `status_${card.variant}_dropdown_centered`,
        dropdown.justifyContent === 'center' && dropdown.textAlign === 'center',
        'error',
        `justify=${dropdown.justifyContent}, textAlign=${dropdown.textAlign}`
      );
      assert(
        `status_${card.variant}_dropdown_font_compact`,
        dropdown.fontSize <= (probe.isPhone ? 16 : 18),
        'error',
        `fontSize=${dropdown.fontSize}px`
      );
    }
  }

  if (roomRow) {
    const roomGrid = roomRow.grid || {};
    assert(
      'status_room_row_temperature_value_has_unit',
      roomRow.valueTexts.some((value) => /-?\d+(?:\.\d+)?°[FC]\b/.test(value)),
      'error',
      `values=${roomRow.valueTexts.join(', ')}`
    );
    if (probe.isPhone) {
      assert(
        'status_room_row_wraps_on_phone',
        roomGrid.flexWrap === 'wrap' && roomGrid.overflowX === 'visible',
        'error',
        `flexWrap=${roomGrid.flexWrap}, overflowX=${roomGrid.overflowX}`
      );
      assert(
        'status_room_row_has_no_phone_horizontal_scroll',
        Number(roomGrid.scrollWidth || 0) <= Number(roomGrid.clientWidth || 0) + 2,
        'error',
        `scrollWidth=${roomGrid.scrollWidth}, clientWidth=${roomGrid.clientWidth}`
      );
    }
  }

  if (probe.isPhone && summary) {
    for (const card of [detail, roomRow, infoOnly, custom].filter(Boolean)) {
      assert(
        `status_${card.variant}_title_matches_phone_baseline`,
        Math.abs(card.titleFontSize - summary.titleFontSize) <= 0.75,
        'error',
        `${card.titleFontSize}px vs summary ${summary.titleFontSize}px`
      );
    }
    if (detail) {
      assert(
        'status_detail_phone_tile_height_not_larger_than_summary',
        detail.firstTileHeight <= summary.firstTileHeight + 4,
        'error',
        `${detail.firstTileHeight}px vs summary ${summary.firstTileHeight}px`
      );
      assert(
        'status_detail_secondary_hidden_on_phone',
        detail.secondaryVisibleCount === 0,
        'error',
        `${detail.secondaryVisibleCount} visible secondary label(s)`
      );
    }
  }

  if (infoOnly?.valueFontSizes?.length > 1) {
    const maxFont = Math.max(...infoOnly.valueFontSizes);
    const minFont = Math.min(...infoOnly.valueFontSizes);
    assert(
      'status_info_only_value_font_spread_bounded',
      minFont > 0 && maxFont / minFont <= 1.55,
      'error',
      `min=${minFont}px, max=${maxFont}px`
    );
  }

  routeResult.probes = {
    ...(routeResult.probes || {}),
    status: {
      viewportWidth: probe.viewportWidth,
      cards: probe.cards,
      assertions,
    },
  };
  addProbeAssertions(routeResult, assertions);
  return routeResult.probes.status;
}

async function captureCards(page, selectedCards, outputRoot) {
  const captures = [];

  for (const tag of selectedCards) {
    const locator = page.locator(tag);
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      const instance = locator.nth(index);
      if (!(await instance.isVisible())) continue;
      await instance.scrollIntoViewIfNeeded();
      const screenshotPath = capturePath(outputRoot, 'cards', `${tag}__${String(index + 1).padStart(2, '0')}.png`);
      await instance.screenshot({ path: screenshotPath, animations: 'disabled' });
      const summary = await instance.evaluate((node) => {
        const text = (node.shadowRoot?.textContent || node.textContent || '').replace(/\s+/g, ' ').trim();
        return text.slice(0, 160);
      });
      captures.push({ tag, index: index + 1, path: screenshotPath, summary });
    }
  }

  return captures;
}

async function captureRoute(page, route, selectedCards, reviewRoot, options = {}) {
  const routeRoot = path.join(reviewRoot, route.surface, route.id);
  ensureDir(routeRoot);

  const currentUrl = page.url();
  if (currentUrl !== route.url) {
    await page.goto(route.url, { waitUntil: 'domcontentloaded' });
  }
  await waitForCards(page);
  await waitForVisualReadiness(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);

  const routeResult = {
    surface: route.surface,
    routeId: route.id,
    path: route.path,
    url: route.url,
    fullPageScreenshot: capturePath(routeRoot, 'full-page.png'),
    cardCaptures: [],
    pageErrors: [],
    ignoredPageErrors: [],
    errorCards: 0,
    failures: [],
    warnings: [],
  };

  routeResult.errorCards = await page.locator('hui-error-card').count();
  if (routeResult.errorCards > 0) {
    routeResult.warnings.push(`Found ${routeResult.errorCards} hui-error-card element(s).`);
  }

  await page.screenshot({ path: routeResult.fullPageScreenshot, fullPage: true, animations: 'disabled' });
  routeResult.cardCaptures = await captureCards(page, selectedCards, routeRoot);

  if (options.withProbes) {
    await runGenericCardProbes(page, routeResult, selectedCards);
  }
  if (options.withProbes && selectedCards.includes('tunet-rooms-card') && route.surface === 'rehab' && route.id === 'lab') {
    await runRoomsProbes(page, routeResult, routeRoot);
  }
  if (options.withProbes && selectedCards.includes('tunet-status-card') && route.surface === 'rehab' && route.id === 'states') {
    await runStatusProbes(page, routeResult);
  }

  return routeResult;
}

async function main() {
  const env = readDotEnv();
  const options = parseArgs(process.argv.slice(2));
  const selectedCards = resolveCards(options);
  const routes = resolveRoutes(options).map((route) => ({
    ...route,
    url: toRouteUrl(normalizeBaseUrl(options.baseUrl || env.HA_LOCAL_URL || env.HA_URL || DEFAULT_BASE_URL), route.path),
  }));
  const breakpoints = resolveBreakpoints(options);
  const themes = resolveThemes(options);
  const credentials = {
    username: env.HA_USERNAME || '',
    password: env.HA_PASSWORD || '',
  };

  const runRoot = path.join(options.outputDir, timestamp());
  ensureDir(runRoot);
  ensureDir(path.dirname(options.storageState));

  const reviewManifest = {
    createdAt: new Date().toISOString(),
    baseUrl: normalizeBaseUrl(options.baseUrl || env.HA_LOCAL_URL || env.HA_URL || DEFAULT_BASE_URL),
    selectedCards,
    changedCardContext: options.changedCardContext || null,
    routes,
    breakpoints: breakpoints.map(({ id }) => id),
    themes,
    outputRoot: runRoot,
    storageState: options.storageState,
    results: [],
    failures: [],
  };

  console.log(`Tunet review output: ${runRoot}`);
  console.log(`Routes: ${routes.map((route) => `${route.surface}/${route.id}`).join(', ')}`);
  console.log(`Cards: ${selectedCards.join(', ')}`);
  if (options.changedCardContext) {
    console.log(`Changed-card paths: ${options.changedCardContext.paths.length}`);
    console.log(`Changed-card selection: ${options.changedCardContext.cards.join(', ') || '(none)'}`);
  }
  console.log(`Breakpoints: ${breakpoints.map(({ id }) => id).join(', ')}`);
  console.log(`Themes: ${themes.join(', ')}`);
  console.log(`Probes: ${options.withProbes ? 'enabled' : 'disabled (screenshot review only)'}`);

  const browser = await chromium.launch({ headless: options.headless });

  try {
    for (const breakpoint of breakpoints) {
      for (const theme of themes) {
        const comboRoot = path.join(runRoot, breakpoint.id, theme);
        ensureDir(comboRoot);
        const contextOptions = {
          viewport: { width: breakpoint.width, height: breakpoint.height },
          screen: { width: breakpoint.width, height: breakpoint.height },
          hasTouch: breakpoint.hasTouch,
          isMobile: breakpoint.isMobile,
          deviceScaleFactor: breakpoint.deviceScaleFactor,
          colorScheme: theme,
          ignoreHTTPSErrors: true,
        };

        if (fs.existsSync(options.storageState) && !options.freshAuth) {
          contextOptions.storageState = options.storageState;
        }

        const context = await browser.newContext(contextOptions);
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', (error) => {
          pageErrors.push(String(error));
        });

        const loggedIn = await loginIfNeeded(page, routes[0].url, credentials);
        if (loggedIn || !fs.existsSync(options.storageState)) {
          await context.storageState({ path: options.storageState });
        }

        for (const route of routes) {
          const routeResult = await captureRoute(page, route, selectedCards, comboRoot, options);
          routeResult.pageErrors = pageErrors.filter(isRelevantTunetError);
          routeResult.ignoredPageErrors = pageErrors.filter((message) => !isRelevantTunetError(message));
          if (routeResult.pageErrors.length) {
            routeResult.warnings.push(`Tunet-relevant page errors observed: ${routeResult.pageErrors.length}`);
          }
          reviewManifest.results.push({
            breakpoint: breakpoint.id,
            theme,
            ...routeResult,
          });
          if (routeResult.failures.length || routeResult.warnings.length) {
            reviewManifest.failures.push({
              breakpoint: breakpoint.id,
              theme,
              route: `${route.surface}/${route.id}`,
              failures: [...routeResult.failures, ...routeResult.warnings],
            });
          }
          pageErrors.length = 0;
        }

        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const manifestPath = path.join(runRoot, 'review-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(reviewManifest, null, 2));
  console.log(`Manifest written: ${manifestPath}`);

  const hardFailures = reviewManifest.results.filter((result) => result.failures?.length);
  if (hardFailures.length) {
    console.log('Review completed with probe failures:');
    for (const result of hardFailures) {
      console.log(`- ${result.breakpoint} ${result.theme} ${result.surface}/${result.routeId}: ${result.failures.join('; ')}`);
    }
    process.exitCode = 1;
    return;
  }

  if (reviewManifest.failures.length) {
    console.log('Review completed with warnings:');
    for (const failure of reviewManifest.failures) {
      console.log(`- ${failure.breakpoint} ${failure.theme} ${failure.route}: ${failure.failures.join('; ')}`);
    }
    return;
  }

  console.log('Review completed without harness-detected failures.');
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
