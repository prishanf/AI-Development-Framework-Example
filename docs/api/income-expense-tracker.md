---
type: api-contract
track: C
required_when: "the change carries the `api` tag"
status: approved
owner: "prishanf"
updated: 2026-07-26
service: income-expense-tracker
---

# API contract: Income & expense tracker

## Purpose and consumers

Local Nuxt/Nitro UI for a single personal finance tracker. No external consumers; no auth.

## Interface

- Contract source: Nitro routes under `server/api/**` + Zod schemas in `server/utils/validation.ts`
- Authentication: none (local single-user)
- Authorization: none (no multi-user boundary)
- Errors: HTTP status + `statusMessage`; Zod flatten payload on `data` when validation fails

### Resources

| Method | Path | Body / query | Success |
|---|---|---|---|
| GET | `/api/categories` | — | Category[] |
| POST | `/api/categories` | `{ type, name }` | Category |
| PATCH | `/api/categories/:id` | `{ name? }` and/or `{ archived? }` | Category |
| GET | `/api/items` | — | Item[] |
| POST | `/api/items` | `{ categoryId, name }` | Item |
| PATCH | `/api/items/:id` | `{ name? }` and/or `{ archived? }` | Item |
| GET | `/api/transactions` | `year`, `month` | Transaction[] for that month |
| POST | `/api/transactions` | transaction input | Transaction |
| PATCH | `/api/transactions/:id` | transaction input | Transaction |
| DELETE | `/api/transactions/:id` | — | deleted id |
| POST | `/api/transactions/bulk` | `TransactionInput[]` (1–200) | `{ createdCount, failedCount, results[] }` — **per-row partial success** |
| GET | `/api/summary/monthly` | `year`, `month` | monthly totals |
| GET | `/api/summary/yearly` | `year` | month buckets + income/expense pivots |

### Transaction input

```json
{
  "itemId": 1,
  "type": "expense",
  "amountCents": 1250,
  "month": "2026-07",
  "note": "optional"
}
```

Rules: `amountCents` positive int; `month` `YYYY-MM`; `type` must match the item’s category type; archived item/category rejected.

### Bulk semantics

- Envelope must be a non-empty array (max 200).
- Each element is validated independently.
- Valid rows are inserted; invalid rows return `{ index, status: "failed", error }` without rolling back successes.

## Behavior

- Pagination/limits: bulk max 200 rows; list endpoints return the filtered month set (expected small).
- Idempotency/retries: POST create is not idempotent; clients should not retry blindly after partial bulk success.
- Rate limit: none (local).
- Versioning/deprecation: unversioned `/api` for v1.
- Audit/correlation: none required for local demo.

## NFR profile

| Concern | Target or explicit pending decision | Owner / review date |
|---|---|---|
| Latency | pending — single-user local SQLite | prishanf / revisit at first hosted deploy |
| Availability | N/A local | — |
| Capacity | pending — personal volume only | prishanf |
| Recovery | recreate DB + migrate + seed | prishanf |
| Cost | N/A | — |

## Verification

- [x] Input validation tests (`tests/validation.test.ts`)
- [x] Bulk partial-success test (`tests/bulk-transactions.test.ts`)
- [ ] Allowed and denied authorization tests — N/A (no auth)
- [x] Smoke / Preview UI QA (`docs/qa/income-expense-tracker.md`)
