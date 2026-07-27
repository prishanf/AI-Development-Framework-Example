---
type: pull-request
track: C
required_when: "every change, on every track"
status: draft
issue: ""
spec: docs/specs/income-expense-tracker.md
plan: docs/plans/income-expense-tracker.md
---

# Bootstrap AIDF and build the income/expense tracker v1

## Summary

Bootstraps this repository with the AI Development Framework (commands, standards, templates, schemas, guide, GitHub Actions reference, Claude adapter) and implements the first feature on top of it: a personal income/expense tracker (Nuxt 3, Drizzle ORM, SQLite) with user-managed categories, spreadsheet-style bulk transaction entry, a monthly view, and a yearly consolidated view.

## Classification

`track: C` · `tags: [database, ui, api]`

Forced to Track C by the `database` tag (new `categories`/`transactions` schema owned by this change) per `standards/quality-gates.md`.

## Scope check

- In scope: category CRUD (create/rename/archive), transaction CRUD, spreadsheet-style bulk entry with per-row validation, monthly view, yearly consolidated view, Drizzle migration + seed.
- Out of scope: auth, multi-currency, CSV import/export, budgets/recurring transactions, hosted deployment.
- Deviation from plan: none. Spec was revised once before approval (added user-managed categories reflecting real accounts, and bulk grid entry) — captured in the spec's own approval notes.

## Evidence

- CI run: not yet configured — this is the repository's first PR.
- Evidence artifact: `docs/evidence/income-expense-tracker.json` (`runner: agent` — **not corroborating**; `reference/scripts/validate-evidence.sh` correctly rejects it because CI hasn't run and several gates, including `pull_request_approval` and `specialist_review`, are still `not_run`).
- Preview environment: not required by this project's `project.yaml` (`preview.required_for_tags: []`) — local-only app, no hosted preview yet.

Not covered by automation:

- Manually verified in a browser: bulk grid entry with a mix of complete and blank rows (blank rows correctly ignored, no partial writes on invalid rows), monthly totals updating live, yearly consolidated view reflecting both seeded and newly-entered transactions across months.
- Not checked: concurrent-write behavior, and browsers other than the one used for manual verification.

## Risks and rollout

- Risk: No CI wired up yet, so all evidence above is agent-claimed, not corroborated — by design this PR cannot pass the framework's own gates until CI runs (see `reference/github/workflows/aidf-gates.yml`).
- Risk: `npm audit` reports 11 high-severity advisories, all transitive build-time dependencies of `nitropack`'s `archiver` (a DoS-class glob/brace-expansion issue). Not reachable at runtime for this local app; no fix forces a breaking Nuxt downgrade, so left as a tracked risk rather than force-fixed.
- Rollback: revert this commit; no production data exists (local SQLite only, gitignored).
- Migration/feature flag: first Drizzle migration (`drizzle/0000_kind_kat_farrell.sql`), forward-only, no backfill.

## Size

~19,900 lines added, but the large majority is vendored AIDF framework content (`commands/`, `standards/`, `templates/`, `schemas/`, `guide/`, `reference/`) copied verbatim from the framework repository and `package-lock.json`. Application code (`app/`, `server/`, `tests/`, `docs/specs`, `docs/plans`) is roughly 1,500 lines. Justification for exceeding the 400-line soft cap: this is the repository's first commit — there is no smaller unit to split a from-scratch bootstrap + first feature into without leaving the repo in a non-working state partway through review.

## Documentation

- [x] Architecture updated — n/a, no `docs/architecture` content yet beyond what's covered in the plan.
- [ ] ADR added or linked — none needed yet.
- [x] Wiki updated — n/a, framework `guide/` copied as-is.
- [ ] Release notes prepared — none needed, because: pre-release, no prior version to note changes against.
- [x] `docs/project-state.md` updated with current status, risks, and next actions.

## Reviewer guidance

Please focus on: (1) whether Track C classification and the database-tag reasoning in the spec are correct, (2) the bulk-entry partial-failure logic in `server/api/transactions/bulk.post.ts` — is per-row validation correct and are failures reported clearly, (3) whether the size-budget justification above is acceptable for a first commit, or whether the framework bootstrap and the feature should have been two separate PRs.
