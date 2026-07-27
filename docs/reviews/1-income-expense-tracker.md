---
type: code-review
track: C
required_when: "every Track B and Track C pull request"
reviewer: "agent"
pr: "https://github.com/prishanf/AI-Development-Framework-Example/pull/1"
date: 2026-07-26
---

# Review: Add income/expense tracker (Track C)

## Summary

Automated gates are now CI-corroborated (`runner: ci`). Feature shape is mostly aligned with the approved design, but two P1 acceptance gaps remain: bulk entry does not implement true per-row partial success for schema-invalid rows, and rename / transaction edit / grouped monthly list from the spec are missing. Request changes before merge.

## Findings

### [P1] Bulk validation aborts the whole batch

- Location: `server/api/transactions/bulk.post.ts:15-18`, `server/utils/validation.ts:25`, `app/components/TransactionGrid.vue:197-216`
- Evidence: Spec scenario requires “all valid rows are saved and any invalid rows are reported individually.” The API `safeParse`s the entire array with `z.array(transactionInputSchema)` and returns 400 before inserting anything; the UI also returns early if any row has client-side errors, so valid rows never ship alone.
- Impact: Mixed valid + invalid bulk entry discards valid work; contradicts acceptance criteria.
- Suggested direction: Validate/insert per row (or soft-parse rows independently); keep batch-envelope errors as 400 only for non-array / empty payloads. Add a route-level test for mixed valid/invalid rows.

### [P1] Rename, transaction edit, and grouped monthly list missing

- Location: `server/api/categories/[id].patch.ts`, `server/api/items/[id].patch.ts`, `app/pages/month/[year]/[month].vue`, `app/components/CategoryItemManager.vue`
- Evidence: Spec acceptance requires create/rename/archive for categories and items; create/edit/delete for transactions; monthly list grouped by category then item. PATCH routes only accept `{ archived }`; monthly UI exposes Delete only; list is flat sorted by id.
- Impact: Required user flows from the approved spec are incomplete.
- Suggested direction: Add rename APIs/UI; wire transaction edit to existing PATCH; group monthly rendering by category → item.

### [P2] Weak DB-level invariants + brittle yearly month indexing

- Location: `drizzle/0000_worthless_runaways.sql`, `server/utils/aggregate.ts`
- Evidence: type/month/amount constraints are application-only; invalid persisted months can index past the 12-slot array.
- Impact: Bad rows (scripts/manual DB) can 500 the yearly summary.
- Suggested direction: Defensive skip/reject in aggregation; tighten checks where SQLite allows.

### [P2] Tests miss the critical bulk/API path

- Location: `tests/validation.test.ts`, `tests/aggregate.test.ts`
- Evidence: Schemas and pure math are covered; no API/DB test for mixed bulk rows or archived-item partial success. Current suite would not catch P1.
- Suggested direction: Add isolated SQLite route tests for bulk indexing and partial writes.

## Verification performed

- Commands: local lint/typecheck/test/build (previously); CI `AIDF gates` run https://github.com/prishanf/AI-Development-Framework-Example/actions/runs/30240200675 — format/lint/typecheck/test/build/migrate all exit 0, `runner: ci`
- Evidence artifact: `docs/evidence/income-expense-tracker.ci.json` (copied from CI `aidf-evidence` artifact)
- Spec/plan/design cross-check for acceptance criteria
- Diff focus: `app/`, `server/`, `tests/`, `drizzle/` vs `develop`
- Not tested in this review pass: full browser re-smoke; concurrent writes; browsers beyond prior QA session

## Decision

- Result: `request-changes`
- Conditions: Fix both P1s (bulk partial success; rename/edit/grouped monthly list) or explicitly amend the approved spec before merge. P2s may follow as issues if justified.
