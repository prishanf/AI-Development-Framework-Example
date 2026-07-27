---
type: feature-spec
track: C
required_when: "every Track B and Track C change"
status: draft
owner: "prishanf"
created: 2026-07-26
updated: 2026-07-26
issue: ""

classification:
  track: C
  risk: high
  tags: [database, ui, api]
---

# Feature: Personal income & expense tracker

## Problem

The user has no lightweight way to record personal income and expenses month by month and see how the year is trending in total. Spreadsheets work but require manual totals and don't scale to a searchable history.

## Desired outcome

The user can log income and expense entries for any given month, see that month's totals by category, and view a consolidated summary across all twelve months of a year (totals, net, and a per-month breakdown) without any manual aggregation.

## Users and scenarios

- **Primary user:** A single individual tracking their own personal finances (no multi-user auth in this iteration).
- **Scenario:** Given the user is viewing March 2026, when they add an expense of $45 in "Groceries", then the March view updates to include it and the 2026 yearly view reflects the new total.
- **Scenario:** Given the user has entries across several months of 2026, when they open the yearly view, then they see total income, total expenses, and net savings per month and for the year as a whole.

## In scope

- Data model for **categories**: type (income/expense), name — user-managed, not a fixed enum. Seeded starter categories reflect the user's real accounts/sources:
  - Income: Salary James, Salary Amy, Rental Income, Dividend TD.
  - Expense: Amex Card 009, RBC MC (each category represents a spending source/card the user tracks against).
  - User can add, rename, or archive categories.
- Data model for transactions: type (income/expense), amount, category (FK), date, optional note.
- Monthly view: list transactions for a selected month/year grouped by category, add/edit/delete a transaction, monthly totals by type and category.
- **Spreadsheet-style bulk entry**: an editable grid (one row per transaction: date, category, amount, note) for the selected month, where the user can type across multiple rows and save them all in one submit — not a one-at-a-time modal form.
- Yearly consolidated view: per-month totals (income, expense, net) for a selected year, plus year-end totals, plus a breakdown by category across the year.
- SQLite persistence via Drizzle ORM, with versioned migrations.
- Basic seed script with the starter categories and synthetic sample transactions for local development.

## Out of scope

- Multi-user accounts, authentication, or authorization.
- Budgets, recurring transactions, or forecasting.
- Multi-currency support.
- CSV import/export.
- Deployment to a hosted environment (this iteration runs locally only).
- Category-level permissions or sharing.

## Acceptance criteria

- [ ] User can create, rename, and archive a category under either the income or expense type.
- [ ] User can create, edit, and delete a transaction (income or expense) with amount, category, date, and optional note, both individually and via the bulk grid entry.
- [ ] Bulk grid entry accepts multiple rows in one submit, validates each row independently, and reports which rows failed without discarding the valid ones.
- [ ] Monthly view shows only transactions for the selected month/year, grouped by category, with totals for income, expenses, and net.
- [ ] Yearly view shows a table of all 12 months for a selected year with income, expense, and net per month, a year total row, and totals per category across the year.
- [ ] Invalid input (negative/zero amount, missing/archived category, missing date) is rejected with a clear error and no partial write.
- [ ] Deleting a transaction removes it from both the monthly and yearly views.
- [ ] Empty states are defined: a month or year with no transactions renders zeros, not an error.

## Why this classification

This feature introduces and owns a persistent SQLite schema (`categories`, `transactions`) via Drizzle migrations, and exposes API routes — including a bulk-write endpoint for grid entry — that read/write that schema, plus UI screens built on top of it. Per `standards/quality-gates.md`, any change carrying a `database` tag is forced to Track C regardless of the app's overall low stakes (personal, local-only, synthetic data) — there is no production data or multi-user trust boundary yet, but schema changes are still versioned and reviewed as if there were, since this project is meant to exercise the framework's real gates, not a shortcut version of them.

## Constraints and risks

- Compatibility: Local Nuxt 3 + Node.js dev environment only; no browser support matrix beyond evergreen browsers.
- Data/security: SQLite file is local, synthetic/developer-owned data only; no secrets involved.
- Performance: Not a concern at this scale (single user, low transaction volume); no explicit NFR targets set.
- Rollback: Drizzle migrations are forward-only and versioned; rollback means reverting to the prior migration file and re-running `db:migrate` against a fresh local database. No production database exists yet, so there is no live rollback procedure to exercise.

## Open questions

- [ ] None blocking — starter categories seed as described above; the user can rename/add/archive from the UI, so exact seed values are not scope-changing.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-26
- Notes: Solo demo project exercising the AIDF Track C lifecycle end-to-end; owner and approver are the same person by design. Revised after initial draft to add user-managed categories (reflecting real accounts/income sources) and spreadsheet-style bulk transaction entry.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration, stop and re-classify upward before continuing.
