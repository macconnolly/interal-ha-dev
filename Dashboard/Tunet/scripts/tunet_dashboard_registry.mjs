#!/usr/bin/env node

/**
 * Single Tunet dashboard registry.
 *
 * Deploy dispatcher, visual review production-mirror, and registry contract
 * tests all consume this list so a dashboard cannot silently ship through
 * only part of the release path.
 *
 * Pattern mirrors `tunet_card_registry.mjs`.
 *
 * Entry shape:
 *   - source:      repo-relative path to the source YAML
 *   - mode:        'yaml' | 'storage'
 *                  'yaml'    -> SCP source to a YAML file under /config/dashboards/
 *                               and HA reads it on dashboard fetch.
 *                  'storage' -> push parsed JSON via lovelace/config/save over WS
 *                               into HA's storage backend; HA's UI editor can then
 *                               modify it, with the trade-off that next push
 *                               overwrites those UI edits.
 *   - target:      live HA path (yaml mode only). Excluded for storage mode.
 *   - url_path:    HA dashboard URL slug (the `/<slug>/<view>` segment).
 *   - production:  true if Mac uses this dashboard on his actual device.
 *                  Visual review production-mirror capture uses this flag.
 *   - description: human-readable summary.
 */

export const TUNET_DASHBOARD_SOURCE_ROOT = 'Dashboard/Tunet';

export const TUNET_DASHBOARD_REGISTRY = Object.freeze([
  {
    source: 'Dashboard/Tunet/tunet-suite-config.yaml',
    mode: 'yaml',
    target: '/config/dashboards/tunet-suite.yaml',
    url_path: 'tunet-suite',
    production: true,
    description: 'Tunet Suite (POC). Production overview — Mac uses this on iPhone today.',
  },
  {
    source: 'Dashboard/Tunet/tunet-card-rehab-lab.yaml',
    mode: 'yaml',
    target: '/config/dashboards/tunet-card-rehab-lab.yaml',
    url_path: 'tunet-card-rehab-yaml',
    production: false,
    description: 'Card rehab lab. Primary validation surface during CD0-CD11 card work.',
  },
  {
    source: 'Dashboard/Tunet/tunet-inbox-dashboard.yaml',
    mode: 'yaml',
    target: '/config/dashboards/tunet-inbox-dashboard.yaml',
    url_path: 'tunet-inbox-yaml',
    production: false,
    description: 'Inbox dashboard backed by custom_components/tunet_inbox.',
  },
  {
    source: 'Dashboard/Tunet/tunet-g2-lab-v3.yaml',
    mode: 'yaml',
    target: '/config/dashboards/tunet-g2-lab-v3.yaml',
    url_path: 'tunet-g2-lab-v3',
    production: false,
    description: 'G2 lab (v3). Profile + sizing validation surface.',
  },
  {
    source: 'Dashboard/Tunet/tunet-suite-storage-config.yaml',
    mode: 'storage',
    url_path: 'tunet-suite-storage',
    production: false,
    description:
      'Storage-mode mirror of tunet-suite. Phase 2 live verification target for the WebSocket lovelace/config/save dispatch path. Once /tunet-home is built (sub-agent #3 page-architecture sub-plan), it joins the registry as the second storage-mode entry.',
  },
  // FUTURE (sub-agent #3 page-architecture sub-plan):
  //   {
  //     source: 'Dashboard/Tunet/tunet-home-config.yaml',
  //     mode: 'storage',
  //     url_path: 'tunet-home',
  //     production: true,
  //     description: 'Mac\'s primary home view. Storage mode so HA UI editor remains usable.',
  //   },
]);

// ─── Derived exports ────────────────────────────────────────────────────

export const TUNET_DASHBOARD_SOURCES = Object.freeze(
  TUNET_DASHBOARD_REGISTRY.map((entry) => entry.source)
);

export const TUNET_DASHBOARD_YAML_TARGETS = Object.freeze(
  TUNET_DASHBOARD_REGISTRY.filter((entry) => entry.mode === 'yaml').map((entry) => entry.target)
);

export const TUNET_DASHBOARD_STORAGE_URL_PATHS = Object.freeze(
  TUNET_DASHBOARD_REGISTRY.filter((entry) => entry.mode === 'storage').map(
    (entry) => entry.url_path
  )
);

export const TUNET_DASHBOARD_ALL_URL_PATHS = Object.freeze(
  TUNET_DASHBOARD_REGISTRY.map((entry) => entry.url_path)
);

export const TUNET_DASHBOARD_PRODUCTION_URL_PATHS = Object.freeze(
  TUNET_DASHBOARD_REGISTRY.filter((entry) => entry.production === true).map(
    (entry) => entry.url_path
  )
);

export const TUNET_DASHBOARD_BY_URL_PATH = Object.freeze(
  Object.fromEntries(TUNET_DASHBOARD_REGISTRY.map((entry) => [entry.url_path, entry]))
);

// ─── CLI ────────────────────────────────────────────────────────────────

function printList(values) {
  process.stdout.write(`${values.join('\n')}\n`);
}

function printHelp() {
  process.stdout.write(`Tunet dashboard registry — single source of truth.

Usage:
  node Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs [mode]

Modes:
  --json                  Full registry as JSON (default).
  --sources               List source YAML paths (repo-relative).
  --yaml-targets          List live HA target paths for yaml-mode entries.
  --storage-url-paths     List url_path slugs for storage-mode entries.
  --all-url-paths         List every dashboard url_path.
  --production-url-paths  List url_paths flagged production: true.
  --help                  Print this help.
`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const mode = process.argv[2] || '--json';
  if (mode === '--json') {
    process.stdout.write(`${JSON.stringify(TUNET_DASHBOARD_REGISTRY, null, 2)}\n`);
  } else if (mode === '--sources') {
    printList([...TUNET_DASHBOARD_SOURCES]);
  } else if (mode === '--yaml-targets') {
    printList([...TUNET_DASHBOARD_YAML_TARGETS]);
  } else if (mode === '--storage-url-paths') {
    printList([...TUNET_DASHBOARD_STORAGE_URL_PATHS]);
  } else if (mode === '--all-url-paths') {
    printList([...TUNET_DASHBOARD_ALL_URL_PATHS]);
  } else if (mode === '--production-url-paths') {
    printList([...TUNET_DASHBOARD_PRODUCTION_URL_PATHS]);
  } else if (mode === '--help' || mode === '-h') {
    printHelp();
  } else {
    console.error(`Unknown argument: ${mode}`);
    printHelp();
    process.exit(1);
  }
}
