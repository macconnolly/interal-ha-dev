---
name: ha-safe-package-deploy
description: Safely deploy Home Assistant package YAML files from a local project to a remote Home Assistant instance with strict pre-deployment discovery, timestamped backups, mandatory git commits, and transfer verification. Use for any update to remote `/config/packages` where rollback capability and full change traceability are required.
---

# HA Safe Package Deploy

## Objective

Safely deploy local package files from `packages/*.yaml` to a remote Home Assistant instance.
Guarantee rollback safety by backing up every matching remote package before deployment and committing each backup to git.

## Required Setup

Load connection details from `.env` in project root before any remote action.
Use these variables when present and defaults when missing:

- `HA_SSH_HOST` (default: `10.0.0.21`)
- `HA_SSH_USER` (default: `root`)
- `HA_SSH_PASSWORD` (default: `password`)
- `HA_PACKAGES_PATH` (default: `/config/packages`)
- Local packages path: `packages/`
- Local backup path: `Backups/`

Require tools: `bash`, `sshpass`, `ssh`, `scp`, `git`, `find`, `wc`.

## Deployment Workflow (Exact Order)

### Phase 1: Discovery And Validation

1. List all local package YAML files in `packages/`.
2. List all remote package YAML files in `${HA_PACKAGES_PATH}`.
3. Match files by filename only.
4. Report matched packages that will be updated.
5. Stop and ask for clarification if no matches exist.

### Phase 2: Backup (Per Matching Package)

1. Create `Backups/` if missing.
2. Download the current remote file.
3. Save backup as `Backups/{package_name}_{YYYY-MM-DD}_{HH-MM-SS}.yaml`.
4. Verify backup exists and is non-empty.
5. Stop immediately on backup failure. Do not deploy that package.

### Phase 3: Version Control (Per Backup)

1. Run `git add Backups/{backup_filename}`.
2. Run `git commit -m "Backup: {package_name} before deployment {timestamp}"`.
3. Verify commit succeeded before continuing.
4. Stop immediately if git staging or commit fails.

### Phase 4: Deployment

1. Copy `packages/{package_name}.yaml` to `${HA_PACKAGES_PATH}/{package_name}.yaml`.
2. Verify remote file exists and byte size matches local file.
3. Report successful transfers.

## Execution

Run the bundled deployment script from project root:

```bash
skills/ha-safe-package-deploy/scripts/deploy_packages.sh
```

Run a safe simulation without SSH/changes:

```bash
skills/ha-safe-package-deploy/scripts/deploy_packages.sh --dry-run --assume-remote-match
```

Run against a specific checkout path:

```bash
skills/ha-safe-package-deploy/scripts/deploy_packages.sh --root /path/to/project
```

## Safety Rules

Never deploy a package without a verified non-empty backup and successful git commit.
Never bypass backup, git, or verification steps because of partial failures.
Stop immediately and report the blocking error when any required step fails.

## Resource

- `scripts/deploy_packages.sh`: Deterministic implementation of this workflow.
