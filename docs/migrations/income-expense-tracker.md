---
type: migration-plan
track: C
required_when: "the change carries the `database` tag"
status: approved
owner: "prishanf"
created: 2026-07-26
updated: 2026-07-26
issue: ""
spec: docs/specs/income-expense-tracker.md
---

# Migration plan: Income & expense tracker schema

## Change summary

Introduce the v1 personal-tracker schema (`categories` → `items` → `transactions`) and a follow-up CHECK-constraint hardening migration. Local SQLite only; no production data.

## Data model

```text
categories (type: income|expense, name, archived)
    └── items (category_id FK, name, archived)
            └── transactions (item_id FK, type, amount_cents > 0, month YYYY-MM, note?)
```

- Transactions are **month-scoped** (`YYYY-MM`), not day-scoped.
- Category `type` is immutable after create; item type is inherited via category.
- Unique `(type, name)` on categories; unique `(category_id, name)` on items.
- CHECK constraints (migration `0001`): category/transaction type enum; positive `amount_cents`; canonical month format.

## Migration artifacts

| Order | Path | Type | Forward-compatible? |
|---|---|---|---|
| 1 | `drizzle/0000_worthless_runaways.sql` | Drizzle | yes — create tables |
| 2 | `drizzle/0001_calm_molecule_man.sql` | Drizzle | yes — recreate with CHECKs |

## Compatibility sequence

1. Expand: apply `0000` (tables + FKs + unique indexes).
2. Deploy: application reads/writes through Drizzle Zod-validated APIs.
3. Backfill: none (greenfield).
4. Contract: apply `0001` CHECK hardening; invalid rows cannot be inserted.

## Seed profile

- Profile name: `tracker-starter-v1`
- Baseline: synthetic
- Data owner: prishanf · Retention: local only · Access: developer machine
- Seed command: `npm run db:seed` · Idempotency: wipe `.data/tracker.db` then migrate+seed
- Teardown/reset: `rm -f .data/tracker.db && npm run db:migrate && npm run db:seed`

| Persona / entity | Scenario | Identifiers / credentials | Reset behavior |
|---|---|---|---|
| Local developer | Monthly/yearly QA | Starter categories/items + June/July 2026 samples | recreate DB file |

Guardrails:

- [x] No production credentials are seeded.
- [x] Synthetic identities are visibly distinguishable from real ones.
- [x] Production execution is blocked (local-only app).

## Preview validation

- Baseline/state source: empty SQLite file under `.data/`
- Apply command: `npm run db:migrate && npm run db:seed`
- Verification: unit tests + Preview UI QA (`docs/qa/income-expense-tracker.md`)

## Production execution

- Not applicable — no hosted/production database in this iteration.

## Approval

- [x] Database reviewer approved (owner: prishanf, 2026-07-26 — accompanies review fixes)
- [x] Security/privacy review completed if data policy changed — N/A (synthetic local)
- [ ] Production release approver approved — N/A until first release
