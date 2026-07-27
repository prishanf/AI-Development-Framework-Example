# Income & Expense Tracker

A small personal income/expense tracker built with Nuxt 3, Drizzle ORM, and SQLite. This repository exists to exercise the [AI Development Framework](https://github.com/ai-development-framework) end to end — see [AGENTS.md](AGENTS.md) for the process this project follows, and [docs/specs/income-expense-tracker.md](docs/specs/income-expense-tracker.md) / [docs/plans/income-expense-tracker.md](docs/plans/income-expense-tracker.md) for how this feature was specified and planned before it was built.

## Features

- User-managed categories (e.g. "Salary James", "Amex Card 009") under `income` or `expense`.
- Spreadsheet-style bulk entry: add several transactions in one grid, save them all in one submit, with per-row validation.
- Monthly view: transactions for a given month, grouped totals, add/edit/delete.
- Yearly consolidated view: per-month totals, year totals, per-category totals across the year.

## Setup

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

The app runs at `http://localhost:3000`. The SQLite database lives at `.data/tracker.db` (gitignored, synthetic/local data only).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` / `npm run format` | ESLint check / autofix |
| `npm run typecheck` | `nuxt typecheck` (vue-tsc) |
| `npm run test` | Vitest unit tests |
| `npm run db:generate` | Generate a new Drizzle migration from `server/db/schema.ts` |
| `npm run db:migrate` | Apply migrations to the local SQLite file |
| `npm run db:seed` | Seed starter categories and sample transactions |

## Project layout

- `server/db/schema.ts` — Drizzle schema (`categories`, `transactions`)
- `server/api/` — Nuxt server routes (categories, transactions, bulk entry, monthly/yearly summaries)
- `server/utils/` — shared validation (`zod`) and aggregation logic, unit-tested in `tests/`
- `app/pages/month/[year]/[month].vue` — monthly view + bulk grid entry
- `app/pages/year/[year].vue` — yearly consolidated view
- `docs/` — AIDF specs, plans, and project state for this repository
