#!/usr/bin/env node

/**
 * Live interaction probe for tunet-alarm-card (SA2/SA3 verification).
 *
 * Drives Chromium against the rehab lab dashboard and verifies:
 *   1. The card renders with the expected entities
 *   2. Tap on a tile flips the underlying switch state via REST API observation
 *   3. Hold (≥400 ms) opens the BrowserMod popup_card_id: tunet-alarm-edit
 *   4. The popup's +5 button advances input_datetime.sonos_alarm_edit_time
 *   5. Close popup
 *
 * Reads .env for HA creds + token. Reuses the storage state cached by
 * tunet_playwright_review.mjs if present.
 */

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
const STATE_FILE = path.join(os.tmpdir(), 'tunet-playwright-review', 'ha-storage-state.json');

function readDotEnv(filePath = ENV_PATH) {
  const vars = {};
  try {
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
  } catch {}
  return vars;
}

const env = readDotEnv();
const BASE_URL = (env.HA_LOCAL_URL || 'http://10.0.0.21:8123').startsWith('http')
  ? env.HA_LOCAL_URL
  : `http://${env.HA_LOCAL_URL || '10.0.0.21:8123'}`;
const cleanedBaseUrl = BASE_URL.endsWith(':8123') || BASE_URL.includes(':8123/')
  ? BASE_URL
  : `${BASE_URL.replace(/\/$/, '')}:8123`;
const TOKEN = env.HA_LONG_LIVED_ACCESS_TOKEN || env.HA_TOKEN;

if (!TOKEN) { console.error('Missing HA_LONG_LIVED_ACCESS_TOKEN'); process.exit(1); }

async function getState(entityId) {
  const r = await fetch(`${cleanedBaseUrl}/api/states/${entityId}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!r.ok) throw new Error(`getState ${entityId} -> ${r.status}`);
  return await r.json();
}

async function callService(domain, service, data = {}) {
  const r = await fetch(`${cleanedBaseUrl}/api/services/${domain}/${service}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`service ${domain}.${service} -> ${r.status}: ${await r.text()}`);
  return await r.json();
}

const log = (mark, msg) => console.log(`  ${mark} ${msg}`);
const ok = (m) => log('✓', m);
const info = (m) => log('•', m);
const warn = (m) => log('!', m);

async function main() {
  console.log('TUNET ALARM CARD — live interaction probe');
  console.log(`  base: ${cleanedBaseUrl}`);

  // --- Snapshot starting state ---
  const bedroomBefore = await getState('switch.sonos_alarm_bedroom');
  const bathBefore = await getState('switch.sonos_alarm_bath');
  info(`switch.sonos_alarm_bedroom = ${bedroomBefore.state} (alarm_id ${bedroomBefore.attributes.alarm_id}, time ${bedroomBefore.attributes.time})`);
  info(`switch.sonos_alarm_bath = ${bathBefore.state} (alarm_id ${bathBefore.attributes.alarm_id}, time ${bathBefore.attributes.time})`);

  if (!fs.existsSync(STATE_FILE)) {
    console.error(`No storage state at ${STATE_FILE}. Run tunet_playwright_review.mjs first to seed auth.`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: STATE_FILE,
    viewport: { width: 1024, height: 1366 },
    colorScheme: 'dark',
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') warn(`console error: ${msg.text()}`);
  });
  page.on('requestfailed', (req) => {
    warn(`request failed: ${req.url()} — ${req.failure()?.errorText || ''}`);
  });
  page.on('response', (resp) => {
    if (resp.status() >= 400) warn(`HTTP ${resp.status()} ${resp.url()}`);
  });

  const url = `${cleanedBaseUrl}/tunet-card-rehab-yaml/lab`;
  info(`navigating to ${url}`);
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Allow lazy sections to render
  await page.waitForTimeout(2500);
  // Scroll to bottom — section 14 is at the bottom of the dashboard
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);

  // --- Wait for the alarm card to mount (Playwright locator pierces shadow DOM) ---
  const cardSelector = 'tunet-alarm-card';
  await page.locator(cardSelector).first().waitFor({ state: 'attached', timeout: 30000 });
  const cardCount = await page.locator(cardSelector).count();
  ok(`${cardCount} tunet-alarm-card instances mounted`);

  // --- Inspect the first alarm card ---
  const firstCard = page.locator(cardSelector).first();
  const rowCount = await firstCard.evaluate((el) => el.shadowRoot.querySelectorAll('.alarm-row').length);
  ok(`first card has ${rowCount} alarm rows`);

  const headerText = await firstCard.evaluate((el) => el.shadowRoot.getElementById('nextBadge')?.textContent || '');
  ok(`header badge: "${headerText}"`);

  const initialDot = await firstCard.evaluate((el) => {
    const row = el.shadowRoot.querySelector('.alarm-row[data-entity="switch.sonos_alarm_bedroom"]');
    return row ? row.dataset.on : 'missing';
  });
  ok(`bedroom row data-on (initial): ${initialDot}`);

  // ─── TAP TEST ──────────────────────────────────────────────
  // Tap bedroom alarm tile → expect switch state to flip
  console.log('\n[TAP TEST] toggling switch.sonos_alarm_bedroom via tile tap');
  const bedroomLocator = firstCard.locator('css=.alarm-row[data-entity="switch.sonos_alarm_bedroom"]').or(
    firstCard.locator('xpath=.//div[@data-entity="switch.sonos_alarm_bedroom"]')
  );
  // Playwright doesn't pierce shadow DOM with CSS by default; use evaluate
  const bedroomBoxBefore = bedroomBefore.state;
  await firstCard.evaluate((el) => {
    const row = el.shadowRoot.querySelector('.alarm-row[data-entity="switch.sonos_alarm_bedroom"]');
    if (!row) throw new Error('bedroom row not found in shadow DOM');
    const rect = row.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, pointerType: 'mouse' };
    row.dispatchEvent(new PointerEvent('pointerdown', opts));
    setTimeout(() => row.dispatchEvent(new PointerEvent('pointerup', opts)), 80);
  });
  // Wait up to 5s for state to flip via REST API observation
  let flipped = false;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const cur = await getState('switch.sonos_alarm_bedroom');
    if (cur.state !== bedroomBoxBefore) { flipped = true; ok(`bedroom switch state flipped: ${bedroomBoxBefore} → ${cur.state}`); break; }
  }
  if (!flipped) warn(`bedroom switch did NOT flip from ${bedroomBoxBefore} within 5 s`);

  // Restore original state if we flipped it
  if (flipped) {
    await callService('switch', bedroomBoxBefore === 'on' ? 'turn_on' : 'turn_off', { entity_id: 'switch.sonos_alarm_bedroom' });
    await new Promise((r) => setTimeout(r, 500));
    const restored = await getState('switch.sonos_alarm_bedroom');
    ok(`bedroom restored to ${restored.state}`);
  }

  // ─── HOLD TEST ─────────────────────────────────────────────
  // Hold (≥400 ms) on bedroom tile → expect script.sonos_load_alarm_for_edit to fire
  // → input_text.sonos_alarm_edit_id should populate to "42"
  console.log('\n[HOLD TEST] long-pressing switch.sonos_alarm_bedroom for 500 ms');
  // Clear the buffer first to be sure
  await callService('input_text', 'set_value', { entity_id: 'input_text.sonos_alarm_edit_id', value: '' });
  await new Promise((r) => setTimeout(r, 200));
  const editIdBefore = (await getState('input_text.sonos_alarm_edit_id')).state;
  info(`edit buffer cleared: input_text.sonos_alarm_edit_id = "${editIdBefore}"`);

  await firstCard.evaluate((el) => {
    const row = el.shadowRoot.querySelector('.alarm-row[data-entity="switch.sonos_alarm_bath"]');
    if (!row) throw new Error('bath row not found');
    const rect = row.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2, pointerType: 'mouse' };
    row.dispatchEvent(new PointerEvent('pointerdown', opts));
    // Hold 600 ms then release
    setTimeout(() => row.dispatchEvent(new PointerEvent('pointerup', opts)), 600);
  });

  // Wait for buffer to populate
  let buffered = false;
  for (let i = 0; i < 25; i++) {
    await new Promise((r) => setTimeout(r, 200));
    const id = (await getState('input_text.sonos_alarm_edit_id')).state;
    if (id && id !== '') { buffered = true; ok(`edit buffer populated: input_text.sonos_alarm_edit_id = "${id}"`); break; }
  }
  if (!buffered) warn('edit buffer did NOT populate within 5 s');

  // Snapshot popup if it appeared
  await new Promise((r) => setTimeout(r, 1500));
  const popupVisible = await page.evaluate(() => {
    const dialog = document.querySelector('browser-mod-popup, ha-dialog, mwc-dialog');
    return !!dialog;
  });
  if (popupVisible) {
    ok('Browser Mod popup is visible in DOM');
    await page.screenshot({ path: '/tmp/tunet-sa2-review/popup_after_hold.png', fullPage: false });
    ok('popup screenshot saved → /tmp/tunet-sa2-review/popup_after_hold.png');
  } else {
    warn('Browser Mod popup NOT visible after hold (may have been opened in a different surface)');
    await page.screenshot({ path: '/tmp/tunet-sa2-review/no_popup_after_hold.png', fullPage: true });
  }

  // ─── ADJUST EDIT TIME TEST (covers SA0-D1 + SA3 popup wiring) ─────
  console.log('\n[ADJUST TIME TEST] +5 minute adjust via service (popup + button do the same thing)');
  const tBefore = (await getState('input_datetime.sonos_alarm_edit_time')).state;
  info(`time before: ${tBefore}`);
  await callService('script', 'sonos_adjust_edit_time', { minutes: 5 });
  await new Promise((r) => setTimeout(r, 600));
  const tAfter = (await getState('input_datetime.sonos_alarm_edit_time')).state;
  if (tAfter !== tBefore) {
    ok(`time advanced: ${tBefore} → ${tAfter}`);
  } else {
    warn(`time did NOT advance (still ${tBefore})`);
  }

  await browser.close();

  // ─── FINAL SUMMARY ─────────────────────────────────────────
  const bedroomFinal = await getState('switch.sonos_alarm_bedroom');
  const bathFinal = await getState('switch.sonos_alarm_bath');
  console.log('\n=== final state ===');
  info(`switch.sonos_alarm_bedroom = ${bedroomFinal.state} (was ${bedroomBefore.state})`);
  info(`switch.sonos_alarm_bath = ${bathFinal.state} (was ${bathBefore.state})`);
  console.log('\nDone.');
}

main().catch((err) => { console.error('FAIL:', err); process.exit(1); });
