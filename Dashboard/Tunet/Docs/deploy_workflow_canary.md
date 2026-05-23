# Deploy Workflow Canary

**Purpose**: known-good reference for the full Tunet deploy + visual review
chain. If a future change breaks the pipeline, the canary is the first
thing to compare against. Captures what worked end-to-end on a specific
date, with which scripts, against which dashboards, producing which
artifacts.

This document is **not** a tutorial. It is evidence of last-known-good
state. Update it AFTER any Phase-8-style end-to-end verification with
the user, including the date, commit hashes, and observed artifact paths.

---

## Canonical workflow

The Phase 1-7 rationalization (commits `4eae3ac` through `cd3d261`)
established this as the standard ordering. Run in this order — cards
before dashboards prevents dashboards from referencing undeployed card
tags:

```
npm run tunet:build                            # 1. bundle cards
npm run tunet:deploy:lab                       # 2. SCP card JS + sync resources
npm run tunet:deploy:dashboards                # 3. SCP yaml + WS storage
npm run tunet:review:share -- --target both \
        --card <tag>                           # 4. capture + iPhone push
```

Steps 1-3 are non-destructive on idempotent inputs. Step 4 launches a
real browser and takes time proportional to (routes × breakpoints ×
themes). Use filters (`--view`, `--card`, `--breakpoint`, `--theme`,
`--smoke`) to scope down during iteration.

---

## Canary run — 2026-05-22

**Trigger**: Phase 8 verification of the deploy + visual review
rationalization. The trivial-change-and-revert was the canary; this
document captures the chain that worked.

**Environment**:
- HA: `10.0.0.21:8123`
- HA SSH user: `root` (creds in `.env`)
- HA token: `HA_LONG_LIVED_ACCESS_TOKEN` from `.env`
- Node: v24
- Repo HEAD before run: `cd3d261` (Phase 7 commit)

**Phase outputs observed**:

| Phase | Command exercised | Outcome |
|-------|-------------------|---------|
| 1 | `node Dashboard/Tunet/scripts/tunet_dashboard_registry.mjs --json` | 5 entries, all source paths exist |
| 2 | `node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --dashboard tunet-suite` | SCP `tunet-suite-config.yaml` → `/config/dashboards/tunet-suite.yaml` |
| 2 | `node Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs --dashboard tunet-suite-storage` | WS `lovelace/config/save` → live config EXACT match with repo source |
| 3 | `buildProductionRouteSet()` import + call | 11 production routes resolved from `tunet-suite-config.yaml` |
| 3 | `node Dashboard/Tunet/scripts/tunet_playwright_review.mjs --surface rehab --view lab --card tunet-status-card --breakpoint 390x844 --theme light` | 10 captures, manifest written, exit 0 |
| 4 | Same as Phase 3 with `--with-probes` | 0 observations, capture report (not verdict), M1 reminder block printed, exit 0 |
| 5 | Same plus `--share-with-user` | 10 `SEND_TO_USER:` markers emitted in stable format |
| 7 | `npx vitest run dashboard_registry_contract.test.js` | 11/11 pass (full suite 772/772) |
| 7 | Negative-case (broken consumer import) | 1/11 fails as designed, restored cleanly |

**Pipeline gotchas surfaced** (worth knowing before next run):

1. `lovelace/dashboards` is unknown_command on HA 2026.x; correct WS command is `lovelace/dashboards/list`. Encoded in deploy dispatcher (commit `7484481`).
2. Production yaml dashboard `/tunet-suite/overview` did not render content cards in headless Chrome on first capture attempt. Root cause: missing HACS deps (mini-graph-card, hass-hue-icons, button-card, etc.) referenced by the live dashboard. Mac reinstalled `mini-graph-card` mid-session. Remaining missing HACS deps are a separate cleanup workstream.
3. `tunet-nav-card` is chrome and renders DOM-first in each yaml-mode view. `waitForCards` was changed to wait for a visible content card (`ANY_CONTENT_CARD_SELECTOR` excludes nav-card).
4. The end-to-end e2e verification used `tunet-status-card` per the original plan, but ANY production-facing card with a visible state change would have worked equivalently.

---

## How to invalidate the canary

The canary becomes stale when any of these change:

- Scripts in `Dashboard/Tunet/scripts/deploy_tunet_dashboards.mjs`, `tunet_dashboard_registry.mjs`, or `tunet_playwright_review.mjs`
- npm scripts under `tunet:deploy:*` or `tunet:review:*`
- Registry inventory in `tunet_dashboard_registry.mjs`
- HA's WebSocket API surface for `lovelace/*` commands
- The set of HACS deps the live `tunet-suite` dashboard references

After any of those changes, run a fresh end-to-end verification and
update this doc with the new date, commit hashes, and observed
artifacts. Do NOT update by editing in place without re-running — the
canary's value is that it points to *evidence*, not assertions.

---

## Related documents

- Pipeline gap status: `Dashboard/Tunet/Docs/tunet_build_and_deploy.md` § Known Pipeline Gaps
- Plan that produced this state: `~/.claude/plans/tunet-deploy-review-rationalization.md`
- Why the harness no longer grades: `~/.claude/projects/-home-mac-HA-implementation-10/memory/session_arc_popup_b_to_frame.md`
- M1-M7 contract: `/home/mac/HA/implementation_10/CLAUDE.md` "Pre-Commit User-Perspective Review" and `Dashboard/Tunet/AGENTS.md` §6A
