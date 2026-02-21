/**
 * Tunet Base Module — Design System Foundation
 * ──────────────────────────────────────────────────────────────
 * Canonical tokens, shared CSS blocks, and registration utilities.
 * Source of truth: design_language.md v8.4 parity lock.
 *
 * This module is DESIGN SYSTEM ONLY. No domain logic.
 * Domain logic → tunet_runtime.js
 * ──────────────────────────────────────────────────────────────
 */

export const TUNET_BASE_VERSION = '1.0.0';

/* ═══════════════════════════════════════════════════════════════
   CSS TOKENS  (Design Language §2.1 / §2.2)
   Midnight Navy dark variant per v8.4 parity lock
   ═══════════════════════════════════════════════════════════════ */

export const TOKENS_LIGHT = `
  :host {
    --glass: rgba(255,255,255, 0.68);
    --glass-border: rgba(255,255,255, 0.45);
    --shadow: 0 1px 3px rgba(0,0,0,0.10), 0 8px 32px rgba(0,0,0,0.10);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.10), 0 12px 36px rgba(0,0,0,0.12);
    --inset: inset 0 0 0 0.5px rgba(0,0,0, 0.06);
    --text: #1C1C1E;
    --text-sub: rgba(28,28,30, 0.55);
    --text-muted: #8E8E93;
    --amber: #D4850A;
    --amber-fill: rgba(212,133,10, 0.10);
    --amber-border: rgba(212,133,10, 0.22);
    --blue: #007AFF;
    --blue-fill: rgba(0,122,255, 0.09);
    --blue-border: rgba(0,122,255, 0.18);
    --green: #34C759;
    --green-fill: rgba(52,199,89, 0.12);
    --green-border: rgba(52,199,89, 0.15);
    --purple: #AF52DE;
    --purple-fill: rgba(175,82,222, 0.10);
    --purple-border: rgba(175,82,222, 0.18);
    --red: #FF3B30;
    --red-fill: rgba(255,59,48, 0.10);
    --red-border: rgba(255,59,48, 0.18);
    --track-bg: rgba(28,28,30, 0.055);
    --track-h: 44px;
    --thumb-bg: #fff;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.16), 0 8px 20px rgba(0,0,0,0.10);
    --r-card: 24px;
    --r-section: 32px;
    --r-tile: 16px;
    --r-pill: 999px;
    --r-track: 4px;
    --section-bg: rgba(255,255,255, 0.45);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.10);
    --tile-bg: rgba(255,255,255, 0.92);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --ctrl-bg: rgba(255,255,255, 0.52);
    --ctrl-border: rgba(0,0,0, 0.05);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
    --chip-bg: rgba(255,255,255, 0.48);
    --chip-border: rgba(0,0,0, 0.05);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.04);
    --dd-bg: rgba(255,255,255, 0.84);
    --dd-border: rgba(255,255,255, 0.60);
    --divider: rgba(28,28,30, 0.07);
    --toggle-off: rgba(28,28,30, 0.10);
    --toggle-on: rgba(52,199,89, 0.28);
    --toggle-knob: rgba(255,255,255, 0.96);
    --glow-manual: 0 0 12px rgba(255,82,82, 0.6);
    color-scheme: light;
    display: block;
  }
`;

export const TOKENS_DARK = `
  :host(.dark) {
    --glass: rgba(30,41,59, 0.72);
    --glass-border: rgba(255,255,255, 0.08);
    --shadow: 0 1px 3px rgba(0,0,0,0.30), 0 8px 28px rgba(0,0,0,0.28);
    --shadow-up: 0 1px 4px rgba(0,0,0,0.35), 0 12px 36px rgba(0,0,0,0.35);
    --inset: inset 0 0 0 0.5px rgba(255,255,255, 0.06);
    --text: #F5F5F7;
    --text-sub: rgba(245,245,247, 0.50);
    --text-muted: rgba(245,245,247, 0.35);
    --amber: #fbbf24;
    --amber-fill: rgba(251,191,36, 0.14);
    --amber-border: rgba(251,191,36, 0.25);
    --blue: #0A84FF;
    --blue-fill: rgba(10,132,255, 0.13);
    --blue-border: rgba(10,132,255, 0.22);
    --green: #30D158;
    --green-fill: rgba(48,209,88, 0.14);
    --green-border: rgba(48,209,88, 0.18);
    --purple: #BF5AF2;
    --purple-fill: rgba(191,90,242, 0.14);
    --purple-border: rgba(191,90,242, 0.22);
    --red: #FF453A;
    --red-fill: rgba(255,69,58, 0.14);
    --red-border: rgba(255,69,58, 0.25);
    --track-bg: rgba(255,255,255, 0.06);
    --thumb-bg: #F5F5F7;
    --thumb-sh: 0 1px 2px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.18);
    --thumb-sh-a: 0 2px 4px rgba(0,0,0,0.40), 0 8px 20px rgba(0,0,0,0.25);
    --ctrl-bg: rgba(255,255,255, 0.08);
    --ctrl-border: rgba(255,255,255, 0.08);
    --ctrl-sh: 0 1px 2px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15);
    --chip-bg: rgba(30,41,59, 0.50);
    --chip-border: rgba(255,255,255, 0.06);
    --chip-sh: 0 1px 3px rgba(0,0,0,0.18);
    --dd-bg: rgba(30,41,59, 0.92);
    --dd-border: rgba(255,255,255, 0.08);
    --divider: rgba(255,255,255, 0.06);
    --toggle-off: rgba(255,255,255, 0.10);
    --toggle-on: rgba(48,209,88, 0.30);
    --toggle-knob: rgba(255,255,255, 0.92);
    --tile-bg: rgba(30,41,59, 0.90);
    --section-bg: rgba(30,41,59, 0.60);
    --section-shadow: 0 8px 40px rgba(0,0,0,0.25);
    --tile-shadow-rest: 0 4px 12px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.08);
    --tile-shadow-lift: 0 12px 32px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08);
    --glow-manual: 0 0 12px rgba(255,82,82, 0.5);
    color-scheme: dark;
  }
`;

export const TOKENS = TOKENS_LIGHT + '\n' + TOKENS_DARK;

/* ═══════════════════════════════════════════════════════════════
   CSS BLOCKS — Reusable structural styles
   ═══════════════════════════════════════════════════════════════ */

export const RESET_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

export const TYPOGRAPHY_BASE = `
  .card-wrap, .wrap {
    font-family: "DM Sans", system-ui, -apple-system, sans-serif;
    color: var(--text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

/** Icon base — Material Symbols Rounded only (§6 governance) */
export const ICON_BASE = `
  .icon {
    font-family: 'Material Symbols Rounded';
    font-weight: normal;
    font-style: normal;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
    flex-shrink: 0;
    -webkit-font-smoothing: antialiased;
    --ms-fill: 0;
    --ms-wght: 100;
    --ms-grad: 200;
    --ms-opsz: 20;
    font-variation-settings: 'FILL' var(--ms-fill), 'wght' var(--ms-wght),
                             'GRAD' var(--ms-grad), 'opsz' var(--ms-opsz);
  }
  .icon.filled { --ms-fill: 1; }
  .icon-24 { font-size: 24px; width: 24px; height: 24px; }
  .icon-20 { font-size: 20px; width: 20px; height: 20px; }
  .icon-18 { font-size: 18px; width: 18px; height: 18px; }
  .icon-16 { font-size: 16px; width: 16px; height: 16px; }
  .icon-14 { font-size: 14px; width: 14px; height: 14px; }
  .icon-12 { font-size: 12px; width: 12px; height: 12px; }
`;

/** Glass card surface + XOR stroke (§3.1, §3.2) */
export const CARD_SURFACE = `
  .card {
    position: relative;
    width: 100%;
    max-width: 100%;
    border-radius: var(--r-card);
    background: var(--glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--shadow), var(--inset);
    padding: 20px;
    display: flex;
    flex-direction: column;
    overflow: visible;
    transition: background .3s, border-color .3s, box-shadow .3s;
  }
  .card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: var(--r-card);
    padding: 1px;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.50),
      rgba(255,255,255, 0.08) 40%,
      rgba(255,255,255, 0.02) 60%,
      rgba(255,255,255, 0.20));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  :host(.dark) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.14),
      rgba(255,255,255, 0.03) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.08));
  }
`;

/** Section surface variant (§3.4) */
export const SECTION_SURFACE = `
  :host([surface="section"]) .card {
    --r-card: var(--r-section);
    background: var(--section-bg);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host(.dark[surface="section"]) .card {
    background: var(--section-bg);
    border-color: var(--ctrl-border);
    box-shadow: var(--section-shadow);
  }
  :host([surface="section"]) .card::before {
    border-radius: var(--r-section);
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.40),
      rgba(255,255,255, 0.06) 40%,
      rgba(255,255,255, 0.01) 60%,
      rgba(255,255,255, 0.14));
  }
  :host(.dark[surface="section"]) .card::before {
    background: linear-gradient(160deg,
      rgba(255,255,255, 0.10),
      rgba(255,255,255, 0.02) 40%,
      rgba(255,255,255, 0.005) 60%,
      rgba(255,255,255, 0.06));
  }
`;

/** Header row (§5) */
export const HEADER_CSS = `
  .hdr {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .hdr-spacer { flex: 1; }
`;

/** Info tile (§5.2–§5.4) */
export const INFO_TILE_CSS = `
  .info-tile {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px 6px 6px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    cursor: pointer;
    transition: all .15s ease;
    min-width: 0;
  }
  .info-tile:hover { box-shadow: var(--shadow); }
  .info-tile:active { transform: scale(.98); }
  .info-tile:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .entity-icon {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    transition: all .2s ease;
    color: var(--text-muted);
  }
  .hdr-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
    min-width: 0;
  }
  .hdr-title {
    font-weight: 700;
    font-size: 13px;
    color: var(--text-sub);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub {
    font-size: 10.5px;
    font-weight: 600;
    color: var(--text-muted);
    letter-spacing: 0.1px;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .hdr-sub .amber-ic { color: var(--amber); }
  .hdr-sub .green-ic { color: var(--green); }
`;

/** Toggle button (§5.6) */
export const TOGGLE_BTN_CSS = `
  .toggle-btn {
    width: 42px;
    min-height: 42px;
    box-sizing: border-box;
    border-radius: 10px;
    display: grid;
    place-items: center;
    cursor: pointer;
    transition: all .15s ease;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    color: var(--text-muted);
    padding: 0;
    font: inherit;
  }
  .toggle-btn:hover { box-shadow: var(--shadow); }
  .toggle-btn:active { transform: scale(.94); }
  .toggle-btn:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .toggle-btn.on {
    background: var(--amber-fill);
    color: var(--amber);
    border-color: var(--amber-border);
  }
  .toggle-btn.on .icon {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }
  .toggle-btn.hidden { display: none; }
`;

/** Selector button (§5.7) */
export const SELECTOR_BTN_CSS = `
  .selector-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 42px;
    box-sizing: border-box;
    padding: 0 8px;
    border-radius: 10px;
    border: 1px solid var(--ctrl-border);
    background: var(--ctrl-bg);
    box-shadow: var(--ctrl-sh);
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-sub);
    letter-spacing: 0.2px;
    cursor: pointer;
    transition: all .15s ease;
  }
  .selector-btn .icon {
    font-variation-settings: 'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  }
  .selector-btn:hover { box-shadow: var(--shadow); }
  .selector-btn:active { transform: scale(.97); }
  .selector-btn:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }
  .selector-btn.active {
    border-color: var(--amber-border);
    color: var(--amber);
    background: var(--amber-fill);
    font-weight: 700;
  }
  .selector-btn.active .icon {
    font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20;
  }
`;

/** Reduced motion + responsive base (§11, §4.6) */
export const RESPONSIVE_BASE = `
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  @media (max-width: 440px) {
    .card { padding: 16px; --r-track: 8px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   FONT INJECTION
   §6 icon governance: single Material Symbols Rounded URL,
   no icon_names filtering, no Outlined family.
   ═══════════════════════════════════════════════════════════════ */

const FONT_CONFIGS = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: '' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
  { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap' },
];

export const FONT_LINKS_HTML = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet">
`;

let _fontsInjected = false;

export function injectFonts() {
  if (_fontsInjected) return;
  _fontsInjected = true;
  for (const cfg of FONT_CONFIGS) {
    if (document.querySelector(`link[href="${cfg.href}"]`)) continue;
    const link = document.createElement('link');
    link.rel = cfg.rel;
    link.href = cfg.href;
    if (cfg.crossOrigin !== undefined) link.crossOrigin = cfg.crossOrigin;
    document.head.appendChild(link);
  }
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES — Pure helpers, no domain logic
   ═══════════════════════════════════════════════════════════════ */

export function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function normalizeIcon(icon, options = {}) {
  const fallback = options.fallback || 'lightbulb';
  const aliases = options.aliases || {};
  const allow = options.allow || null;
  if (!icon) return fallback;
  const raw = String(icon).replace(/^mdi:/, '').trim();
  const resolved = aliases[raw] || raw;
  if (!resolved || !/^[a-z0-9_]+$/.test(resolved)) return fallback;
  if (allow && allow.size && !allow.has(resolved)) return fallback;
  return resolved;
}

export function bindActivate(el, handler, options = {}) {
  if (!el || typeof handler !== 'function') return () => {};
  const role = options.role || 'button';
  const tabindex = options.tabindex != null ? options.tabindex : 0;
  if (!el.hasAttribute('role')) el.setAttribute('role', role);
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', String(tabindex));
  const onClick = (e) => {
    if (options.stopPropagation) e.stopPropagation();
    handler(e);
  };
  const onKey = (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    if (options.stopPropagation) e.stopPropagation();
    handler(e);
  };
  el.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  return () => {
    el.removeEventListener('click', onClick);
    el.removeEventListener('keydown', onKey);
  };
}

export async function callServiceSafe(host, domain, service, data = {}, options = {}) {
  const hass = host && host._hass ? host._hass : host;
  if (!hass || !domain || !service) return false;
  const pendingEl = options.pendingEl || null;
  if (pendingEl) {
    pendingEl.classList.add('is-pending');
    if ('disabled' in pendingEl) pendingEl.disabled = true;
  }
  try {
    const result = hass.callService(domain, service, data || {});
    if (result && typeof result.then === 'function') await result;
    return true;
  } catch (error) {
    console.error(`[Tunet] callService failed: ${domain}.${service}`, error);
    if (typeof options.onError === 'function') options.onError(error);
    if (host && typeof host.dispatchEvent === 'function') {
      host.dispatchEvent(new CustomEvent('tunet-service-error', {
        bubbles: true, composed: true,
        detail: { domain, service, data, error: String(error && error.message ? error.message : error) },
      }));
    }
    return false;
  } finally {
    if (pendingEl) {
      pendingEl.classList.remove('is-pending');
      if ('disabled' in pendingEl) pendingEl.disabled = false;
    }
  }
}

export function detectDarkMode(hass) {
  if (!hass || !hass.themes) return false;
  const theme = hass.themes.darkMode;
  if (typeof theme === 'boolean') return theme;
  const selected = hass.themes.theme;
  if (selected && typeof selected === 'string' && selected.toLowerCase().includes('dark')) return true;
  return false;
}

export function applyDarkClass(host, isDark) {
  host.classList.toggle('dark', isDark);
}

export function asFinite(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/* ═══════════════════════════════════════════════════════════════
   REGISTRATION — Idempotent custom element + card picker
   ═══════════════════════════════════════════════════════════════ */

export function registerCard(tag, klass, meta = {}) {
  if (!customElements.get(tag)) {
    customElements.define(tag, klass);
  }
  window.customCards = window.customCards || [];
  if (!window.customCards.some(c => c.type === tag)) {
    window.customCards.push({
      type: tag,
      name: meta.name || tag,
      description: meta.description || '',
      preview: meta.preview !== false,
    });
  }
}

export function logCardVersion(name, version, color = '#D4850A') {
  console.info(
    `%c ${name} %c v${version} `,
    `color: #fff; background: ${color}; font-weight: 700; padding: 2px 6px; border-radius: 4px 0 0 4px;`,
    `color: ${color}; background: ${color}18; font-weight: 700; padding: 2px 6px; border-radius: 0 4px 4px 0;`
  );
}
