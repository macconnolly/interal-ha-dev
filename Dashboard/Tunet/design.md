# Tunet V2 Design Documentation Structure

Version 1.0 - 2026-03-07  
Status: Active index for Tunet V2 design/architecture docs

This file is the documentation map for Tunet V2. It is intentionally concise and points to the canonical contracts.

## 0. Canonical Sources

1. `Dashboard/Tunet/Mockups/design_language.md`
- design + profile contract baseline
- family taxonomy, resolver/selector API lock, token ownership, migration gates

2. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
- sections page/section/card sizing model
- breakpoint validation workflow

3. `Dashboard/Tunet/Agent-Reviews/unified_tile_architecture_conclusion.md`
- detailed profile architecture rationale and implementation contract
- gate-by-gate migration details and enforcement decisions

4. `plan.md`, `FIX_LEDGER.md`, `handoff.md`
- active tranche state, issue ledger, and session-level operational truth

## 1. Design Precedence for Implementation Work

Use this order when docs conflict:
1. `plan.md`
2. `FIX_LEDGER.md`
3. `handoff.md`
4. `Dashboard/Tunet/Docs/sections_layout_matrix.md`
5. `Dashboard/Tunet/Mockups/design_language.md`

## 2. V2 Lock Summary

1. Implementation authority is `Dashboard/Tunet/Cards/v2/`
2. Profile direction is Option C (family profile consumption)
3. Container-first width source is a hard prerequisite
4. Family split is locked to:
- `tile-grid`
- `speaker-tile`
- `rooms-row`
- `indicator-tile`
- `indicator-row`
5. Resolver contract is locked:
- `selectProfileSize({ preset, layout, widthHint, userSize? })`
- `resolveSizeProfile({ family, size })`
6. `tile-core` is the exclusive consumer of core profile lane tokens
7. Profiles are mode-agnostic; dark/light handling stays in theme tokens

## 3. Expected Documentation Pattern

When adding or changing design rules:
1. Update `Mockups/design_language.md` first
2. If sections behavior changed, update `Docs/sections_layout_matrix.md`
3. Sync session state in `plan.md`, `FIX_LEDGER.md`, and `handoff.md`
4. Keep this index current if canonical sources or precedence changed

## 4. What This File Is Not

1. Not a duplicate token table
2. Not a card-parameter reference
3. Not a replacement for tranche-level execution logs

Use it as the entry point and routing map only.
