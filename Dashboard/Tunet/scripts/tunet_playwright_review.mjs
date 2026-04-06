#!/usr/bin/env node

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

  for (const cd of options.cds) {
    const tags = CD_CARD_MAP[cd];
    if (!tags) throw new Error(`Unknown CD selection: ${cd}`);
    tags.forEach((tag) => selected.add(tag));
  }

  for (const card of options.cards) {
    const normalized = CARD_ALIASES[slug(card).replace(/-/g, '_')] || card;
    const tag = normalized.startsWith('tunet-') ? normalized : CARD_ALIASES[normalized] || null;
    if (!tag || !ALL_CARD_TAGS.includes(tag)) {
      throw new Error(`Unknown card selection: ${card}`);
    }
    selected.add(tag);
  }

  return selected.size ? Array.from(selected) : [...ALL_CARD_TAGS];
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

  routeResult.warnings = routeResult.warnings || [];
  for (const assertion of assertions) {
    if (!assertion.pass && assertion.severity === 'error') {
      routeResult.failures.push(`Probe failed: ${assertion.name}`);
    } else if (!assertion.pass) {
      routeResult.warnings.push(`Probe warning: ${assertion.name}`);
    }
  }

  return routeResult.probes.rooms;
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

  if (options.withProbes && selectedCards.includes('tunet-rooms-card') && route.surface === 'rehab' && route.id === 'lab') {
    await runRoomsProbes(page, routeResult, routeRoot);
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
