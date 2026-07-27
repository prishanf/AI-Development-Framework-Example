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
- **Scenario:** Given the user is viewing March 2026, when they add an expense against category "Credit Card" / item "RBC MC", then the March view updates to include it and the 2026 yearly view reflects the new total.
- **Scenario:** Given the user has entries across several months of 2026, when they open the yearly view, then they see total income, total expenses, and net savings per month and for the year as a whole.
- **Scenario:** Given the user has several transactions to enter for a month, when they open the bulk entry grid, type across several rows (month, type, category, item, amount, note), and submit once, then all valid rows are saved and any invalid rows are reported individually without discarding the valid ones.

## In scope

- **Three-level classification**: type (income/expense) → category → item. A category is a grouping (e.g. income: Salary, Rental, Dividend, Interest; expense: Credit Card, Utilities, Line Of Credit); an item is the specific source/account a transaction is actually recorded against (e.g. "Salary James" and "Salary Amy" under category Salary; "Amex Credit Card" and "RBC MC" under category Credit Card). Transactions record against an **item**, not directly against a category.
  - Categories and items are both user-managed: add, rename, archive at either level. A category's type is fixed at creation (no retyping — archive and recreate instead, to avoid income/expense drift on existing transactions).
  - Starter seed data:
    - Income: Salary → Salary James, Salary Amy · Rental → Rental Unit 1 · Dividend → Dividend TD · Interest → (no starter item)
    - Expense: Credit Card → Amex Credit Card, RBC MC · Utilities → (no starter item) · Line Of Credit → (no starter item)
- **Month-level granularity, not day-level.** A transaction belongs to a month (year + month), not a specific calendar date — matching "track data monthly" from the original request. The bulk-entry grid's date field is a month picker, not a day-level date picker.
- Data model for transactions: type (income/expense), amount, item (FK), month, optional note.
- Monthly view: list transactions for a selected month/year grouped by category then item, add/edit/delete a transaction, monthly totals by type, category, and item.
- **Spreadsheet-style bulk entry**: an editable grid (one row per transaction: month, type, category, item, amount, note) for the selected month, where the user can type across multiple rows and save them all in one submit — not a one-at-a-time modal form. Category and item selectors cascade: item choices depend on the row's selected category, category choices depend on the row's selected type.
- Yearly consolidated view: per-month totals (income, expense, net) for a selected year, plus year-end totals, plus a breakdown by category and by item across the year.
- SQLite persistence via Drizzle ORM, with versioned migrations.
- Basic seed script with the starter categories/items and synthetic sample transactions for local development.

## Out of scope

- Multi-user accounts, authentication, or authorization.
- Budgets, recurring transactions, or forecasting.
- Multi-currency support.
- CSV import/export.
- Deployment to a hosted environment (this iteration runs locally only).
- Category-level permissions or sharing.

## Acceptance criteria

- [ ] User can create, rename, and archive a category under either the income or expense type.
- [ ] User can create, rename, and archive an item under a specific category; the item's type is inherited from its category and cannot diverge.
- [ ] User can create, edit, and delete a transaction (income or expense) with amount, item, month, and optional note, both individually and via the bulk grid entry.
- [ ] Bulk grid entry accepts multiple rows in one submit, validates each row independently, and reports which rows failed without discarding the valid ones. A row's category selector is scoped to the row's type, and its item selector is scoped to the row's selected category.
- [ ] Monthly view shows only transactions for the selected month/year, grouped by category then item, with totals for income, expenses, and net.
- [ ] Yearly view shows: (1) a top summary table of all 12 months for a selected year with income, expense, and net per month plus a year total row; (2) an Income detail pivot and an Expense detail pivot, each with one row per item grouped under its category (category subtotal row beneath its items) and one column per month plus a Total column, ending in a type-total row that reconciles with the top summary.
- [ ] Invalid input (negative/zero amount, missing/archived item, missing month) is rejected with a clear error and no partial write.
- [ ] Deleting a transaction removes it from both the monthly and yearly views.
- [ ] Empty states are defined: a month or year with no transactions renders zeros, not an error.
- [ ] Archiving a category or item removes it from selection in new entries but preserves its historical transactions and totals.

## Why this classification

This feature introduces and owns a persistent SQLite schema (`categories`, `items`, `transactions`) via Drizzle migrations, and exposes API routes — including a bulk-write endpoint for grid entry — that read/write that schema, plus UI screens built on top of it. Per `standards/quality-gates.md`, any change carrying a `database` tag is forced to Track C regardless of the app's overall low stakes (personal, local-only, synthetic data) — there is no production data or multi-user trust boundary yet, but schema changes are still versioned and reviewed as if there were, since this project is meant to exercise the framework's real gates, not a shortcut version of them. The `ui` tag additionally means a design gate (approved wireframes/states) is required before planning — see `docs/design/income-expense-tracker.md` once drafted.

## Constraints and risks

- Compatibility: Local Nuxt 3 + Node.js dev environment only; no browser support matrix beyond evergreen browsers.
- Data/security: SQLite file is local, synthetic/developer-owned data only; no secrets involved.
- Performance: Not a concern at this scale (single user, low transaction volume); no explicit NFR targets set.
- Rollback: Drizzle migrations are forward-only and versioned; rollback means reverting to the prior migration file and re-running `db:migrate` against a fresh local database. No production database exists yet, so there is no live rollback procedure to exercise.

## Open questions

- [ ] None blocking — starter categories/items seed as described above; the user can rename/add/archive from the UI, so exact seed values are not scope-changing.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-26
- Notes: Revised after design-stage feedback: added the category/item two-level hierarchy (previously a flat category list) and switched transaction granularity from a specific date to month-only. Re-approved as revised.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. Because this spec carries the `ui` tag, do not proceed to planning either — a design document must be produced and approved first (see standards/ui-and-preview.md and commands/spec.md). If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration, stop and re-classify upward before continuing.
