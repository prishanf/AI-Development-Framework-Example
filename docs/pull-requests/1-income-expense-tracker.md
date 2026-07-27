---
type: pull-request
track: C
required_when: "every change, on every track"
status: draft
issue: ""
spec: docs/specs/income-expense-tracker.md
plan: docs/plans/income-expense-tracker.md
---

# Add income/expense tracker (Track C)

## Summary

Implements the approved personal income & expense tracker on Nuxt 4 + Drizzle/SQLite: type → category → item hierarchy, month-scoped transactions, spreadsheet-style bulk entry, monthly and yearly views, plus the shared Cal monochrome UI foundation.

## Classification

`track: C` · `tags: [database, ui, api]`

Forced to Track C by the `database` tag (new `categories` / `items` / `transactions` schema owned by this change).

## Scope check

- In scope: category/item management (create/archive), transaction CRUD + bulk grid with per-row validation, monthly view, yearly pivots, Drizzle migration + seed, Tailwind/brand UI primitives.
- Out of scope: auth, multi-currency, CSV import/export, budgets/recurring, hosted deployment.
- Deviation from plan: none material. Spec text said Nuxt 3; plan approved Nuxt 4.

## Evidence

- CI run: not configured yet (first feature PR on this scaffold).
- Evidence artifact: `docs/evidence/income-expense-tracker.json` (`runner: agent` — **not corroborating** until CI emits `runner: ci`).
- Preview: local `npm run dev` at http://localhost:3000 — human UI QA **approved** in `docs/ui-qa-signoff.md` (2026-07-26).

Not covered by automation:

- Human QA click-through of monthly/yearly flows, add-item-under-category, cascade save, validation, empty month, narrow layout, focus — claimed + human Decision recorded.
- Concurrent-write behavior and browsers beyond the review session — not checked.

## Risks and rollout

- Risk: No CI wired yet, so gate evidence is agent-claimed, not corroborated.
- Risk: Prior branch `feat/001-income-expense-tracker` used a flatter schema (day dates, no `items`); this PR replaces that domain model — do not merge both.
- Rollback: revert this branch; local SQLite only (`.data/` gitignored).
- Migration: first Drizzle migration `drizzle/0000_worthless_runaways.sql`, forward-only, no backfill.

## Size

~5,000 lines excluding `package-lock.json` (lockfile dominates the ~21k total). Soft 400-line cap exceeded because this is the first application vertical slice (scaffold + schema + APIs + UI + docs/prototype). Splitting would leave a non-runnable mid-state.

## Documentation

- [x] Spec / design / plan / prototype / conventions / UI QA / project-state updated
- [ ] ADR — none needed yet
- [ ] Release notes — pre-release; none needed
- [x] `docs/project-state.md` updated

## Reviewer guidance

Please focus on: (1) schema correctness for categories → items → month-scoped transactions, (2) bulk partial-success behavior in `server/api/transactions/bulk.post.ts`, (3) whether yearly pivot math in `server/utils/aggregate.ts` matches the approved design, (4) UI foundation reuse vs one-off styles.
