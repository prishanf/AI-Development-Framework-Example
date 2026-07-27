---
type: implementation-plan
track: C
required_when: "every Track B and Track C change"
status: draft
owner: "prishanf"
created: 2026-07-26
updated: 2026-07-26
spec: docs/specs/income-expense-tracker.md
issue: ""
branch: feat/001-income-expense-tracker
---

# Implementation plan: Personal income & expense tracker

## Goal and boundaries

Build the monthly + yearly personal income/expense tracker described in the approved spec: user-managed categories, individual and spreadsheet-style bulk transaction entry, a monthly view, and a yearly consolidated view. No auth, no multi-currency, no CSV import/export, local SQLite only.

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | Greenfield repo, no application code yet | repo root at time of planning |
| Integration point | New Nuxt 3 app at repo root | n/a |
| Test coverage | None yet — this plan establishes the first tests | n/a |

## Change map

| File or area | Change | Why |
|---|---|---|
| `nuxt.config.ts`, `package.json` | Add Nuxt 3 app, Drizzle ORM, better-sqlite3, drizzle-kit, Vitest | Project scaffold |
| `server/db/schema.ts` | Add `categories`, `transactions` tables | Spec data model |
| `server/db/client.ts` | Drizzle client bound to local SQLite file | Persistence |
| `drizzle/` migrations | Versioned forward-only migration for the two tables | `database` tag requirement |
| `server/db/seed.ts` | Seed starter categories + synthetic sample transactions | Spec seed requirement, dev/preview data |
| `server/api/categories.get.ts`, `.post.ts`, `[id].patch.ts` | List/create/archive categories | Spec: category management |
| `server/api/transactions/index.get.ts`, `.post.ts` | List transactions by month/year, create single transaction | Spec: monthly view + single entry |
| `server/api/transactions/[id].patch.ts`, `.delete.ts` | Edit/delete transaction | Spec: edit/delete |
| `server/api/transactions/bulk.post.ts` | Accept an array of rows, validate each independently, partial success report | Spec: bulk grid entry |
| `server/api/summary/monthly.get.ts` | Totals by type/category for a month | Spec: monthly totals |
| `server/api/summary/yearly.get.ts` | Per-month totals + year total + per-category totals | Spec: yearly consolidated view |
| `app/pages/index.vue` | Redirect/landing → current month | Navigation |
| `app/pages/month/[year]/[month].vue` | Monthly view: transaction list grouped by category, totals, bulk grid entry component | Spec: monthly view + bulk entry |
| `app/pages/year/[year].vue` | Yearly consolidated view: per-month table, category breakdown | Spec: yearly view |
| `app/components/TransactionGrid.vue` | Spreadsheet-style editable rows, add row, submit batch, per-row error display | Spec: bulk entry UX |
| `app/components/CategoryManager.vue` | Add/rename/archive categories | Spec: category management |
| `server/utils/validation.ts` | Shared zod schemas for transaction/category input | Server-side validation (api tag requirement) |
| `tests/` | Vitest unit tests for validation + summary aggregation; API route tests | Verification plan |

## Sequence

1. Scaffold Nuxt 3 app, install and configure Drizzle + better-sqlite3 + drizzle-kit + Vitest + ESLint/TypeScript.
2. Define schema, generate first migration, wire migrate/seed npm scripts, update `project.yaml` commands.
3. Implement validation schemas and category API routes; unit-test validation.
4. Implement transaction API routes (single + bulk) and summary routes; unit-test aggregation logic and bulk partial-failure behavior.
5. Build monthly view page + transaction grid component against the API.
6. Build yearly consolidated view page against the summary API.
7. Wire category management UI.
8. Run full gate suite locally (lint, typecheck, test, build) and record evidence with `runner: agent`.
9. Prepare PR body from `templates/pull-request.md`.

## Data and migration

New tables, first migration in this repository:

- `categories`: `id` (pk), `type` (`income`|`expense`), `name` (text, unique per type), `archived` (bool, default false), `created_at`.
- `transactions`: `id` (pk), `category_id` (fk → categories.id), `type` (`income`|`expense`, denormalized for query simplicity and to guard against category type changes), `amount_cents` (integer, positive), `occurred_on` (date), `note` (text, nullable), `created_at`.

Migration is versioned and forward-only per `standards/database.md` and `project.yaml`. No backfill needed (new tables). Rollback = revert the migration file and re-run against a fresh local DB; no production data exists.

## Verification plan

- Unit: `npm run test` — validation schemas, bulk-entry partial-failure logic, monthly/yearly aggregation math.
- Integration: API route tests against a temporary SQLite file (create → list → summary → delete round trip).
- Static: `npm run lint`, `npm run typecheck`.
- Manual: start dev server, add transactions via the grid for two different months, confirm monthly totals and yearly consolidated view reflect them correctly; confirm invalid rows in the grid are rejected without discarding valid rows.

## Risks and assumptions

- Assumption: Single local user, no auth — acceptable per spec's explicit non-goal.
- Assumption: Amounts stored as integer cents to avoid floating-point drift in totals.
- Risk: Bulk-entry partial validation is easy to get wrong (all-or-nothing vs per-row); mitigation: dedicated unit tests for mixed valid/invalid batches before wiring the UI.
- Risk: Denormalized `type` on `transactions` can drift from `categories.type` if a category is ever repurposed; mitigation: category type is immutable after creation (archive + recreate instead of retype), enforced in the API layer.

## Completion checklist

- [ ] Scope matches approved spec.
- [ ] Tests added or updated.
- [ ] Verification commands recorded.
- [ ] Documentation decision made.
- [ ] PR evidence prepared.
