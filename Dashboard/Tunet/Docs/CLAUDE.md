# Tunet Docs Guidance (Doc-Folder-Internal Conventions Only)

> **Governance scope note (locked 2026-05-04)**: This file owns ONLY doc-folder-internal conventions (file naming, archive structure, where each canonical doc lives). The full File Authority Map, Documentation Sync Protocol, Tranche Queue Rule, Plan Creation Protocol, and Tranche Closure Protocol live in **`Dashboard/Tunet/CLAUDE.md`**. Read that file first if you need governance rules — this file is a routing helper, not the authority.

## Documentation Routing

- Canonical design/profile contract: `Dashboard/Tunet/Mockups/design_language.md`
- Documentation structure index: `Dashboard/Tunet/design.md`
- Sections model contract: `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- Per-card config + editor architecture: `Dashboard/Tunet/Docs/cards_reference.md`
- Legacy key precedence rules: `Dashboard/Tunet/Docs/legacy_key_precedence.md`
- Build and deploy runbook: `Dashboard/Tunet/Docs/tunet_build_and_deploy.md`
- Defect record + cross-cutting architecture decisions: `Dashboard/Tunet/Docs/visual_defect_ledger.md`
- Operational control docs (project root, NOT this folder): `plan.md`, `FIX_LEDGER.md`, `handoff.md`
- Per-tranche historical archive: `Dashboard/Tunet/Docs/plans/archive/INDEX.md` → linked archive files (read-only after creation)
- Active (non-archive) plan documents: `Dashboard/Tunet/Docs/plans/` (e.g., `consistency_driver_method_plan.md`, `surface_driven_reset.md`, `cross_card_*.md`)

## Doc-Folder Conventions

- Files in `Dashboard/Tunet/Docs/` are canonical references. They are not append-only logs — edit in place when the underlying contract changes.
- Files in `Dashboard/Tunet/Docs/plans/` are active plan documents (currently in use).
- Files in `Dashboard/Tunet/Docs/plans/archive/` are read-only historical records. Do not edit.
- Family subfolders under `archive/`: `CD/`, `CC/`, `SA/`, `TI/`, `T011A/`. Add new family subfolders as new tranche families emerge.
- Archive file naming: `plan_archive_<TRANCHE_ID>[_reopen<N>]_<DATE_RANGE>.md` where DATE_RANGE is `YYYY_MM[_DD]_to_YYYY_MM[_DD]`.

## When This File Loses Authority

If anything in this file conflicts with `Dashboard/Tunet/CLAUDE.md`, **`Dashboard/Tunet/CLAUDE.md` wins**. This file is a routing helper, not the governance authority. Per-routing decisions belong here; per-edit-policy or per-protocol decisions belong in `Dashboard/Tunet/CLAUDE.md`.

<claude-mem-context>

</claude-mem-context>
