#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const primaryRoot = '/home/mac/HA/implementation_10';

function readDotEnv(filePath) {
  const vars = {};
  const raw = fs.readFileSync(filePath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function resolveEnvPath() {
  const local = path.join(repoRoot, '.env');
  if (fs.existsSync(local)) return local;
  const primary = path.join(primaryRoot, '.env');
  if (fs.existsSync(primary)) return primary;
  throw new Error('No .env found in worktree or primary root');
}

async function callService(baseUrl, token, domain, service, data = {}) {
  const response = await fetch(`${baseUrl}/api/services/${domain}/${service}?return_response`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Service ${domain}.${service} failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  return payload.service_response;
}

const env = readDotEnv(resolveEnvPath());
const host = env.HA_LOCAL_URL || env.HA_SSH_HOST || '10.0.0.21';
const baseUrl = env.HA_URL || `http://${host}:8123`;
const token = env.HA_LONG_LIVED_ACCESS_TOKEN || env.HA_TOKEN;

if (!token) {
  throw new Error('HA_LONG_LIVED_ACCESS_TOKEN or HA_TOKEN is required');
}

const probeKey = process.argv[2] || 'tinbox_api_probe';

const post = await callService(baseUrl, token, 'tunet_inbox', 'post', {
  key: probeKey,
  title: 'Tunet Inbox API Probe',
  message: 'Exercise the governed key-addressable operator path',
  actions: [{ id: 'TEST_ACK', title: 'Acknowledge' }],
  family: 'ops',
  context: { probe: 'api', source: 'tinbox:probe:api' },
  send_mobile: false,
  mobile: { tag: `${probeKey}_tag` },
});

if (!post.accepted) {
  throw new Error(`Probe post rejected: ${JSON.stringify(post)}`);
}

const listed = await callService(baseUrl, token, 'tunet_inbox', 'list_items', {
  families: ['ops'],
});

if (!listed.items.some((item) => item.key === probeKey)) {
  throw new Error(`Probe key ${probeKey} missing from list_items response`);
}

const respond = await callService(baseUrl, token, 'tunet_inbox', 'respond', {
  key: probeKey,
  action_id: 'TEST_ACK',
  source: 'dashboard_card',
});

if (!respond.accepted) {
  throw new Error(`Probe respond rejected: ${JSON.stringify(respond)}`);
}

const failBack = await callService(baseUrl, token, 'tunet_inbox', 'fail', {
  key: probeKey,
  reason: 'api_probe_reset',
  return_to_pending: true,
});

if (!failBack.accepted || failBack.status !== 'pending') {
  throw new Error(`Probe fail(return_to_pending) rejected: ${JSON.stringify(failBack)}`);
}

const resolve = await callService(baseUrl, token, 'tunet_inbox', 'resolve', {
  key: probeKey,
  reason: 'api_probe_complete',
  clear_mobile: false,
});

if (!resolve.accepted) {
  throw new Error(`Probe resolve rejected: ${JSON.stringify(resolve)}`);
}

const finalList = await callService(baseUrl, token, 'tunet_inbox', 'list_items', {
  families: ['ops'],
});

if (finalList.items.some((item) => item.key === probeKey)) {
  throw new Error(`Probe key ${probeKey} still present after resolve`);
}

console.log(`tunet_inbox api probe ok via ${baseUrl} key=${probeKey}`);
