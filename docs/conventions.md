---
type: conventions
track: project-setup
required_when: "recommended for any repository an agent will work in"
status: current
owner: "prishanf"
updated: 2026-07-26
---

# Codebase conventions

## Orientation

- **What this system does:** Local personal income & expense tracker (Nuxt 4 + SQLite/Drizzle). Transactions record against an **item** under a **category** under type income/expense, at month granularity (`YYYY-MM`).
- **Entry points:** `nuxt.config.ts` / `npm run dev` — Nuxt app; `server/api/**` — Nitro routes; `server/db/**` — Drizzle schema/client/seed.
- **Where the domain logic lives:** `server/utils/validation.ts`, `server/utils/aggregate.ts`, `server/api/**`
- **Where the tests live:** `tests/**/*.test.ts` — Vitest, node environment
- **Generated code — never edit by hand:** `.nuxt/`, `drizzle/meta/` snapshots after generate (prefer regenerating via `npm run db:generate`)

## Reference implementations

| To add a... | Copy the shape of | Notes |
|---|---|---|
| API endpoint | `server/api/items/index.post.ts` | Zod parse → domain checks → Drizzle |
| Database query / repository | `server/db/client.ts` + route handlers | Direct Drizzle on `db`; no separate repo layer yet |
| UI component | `app/components/ui/UiButton.vue` | Variants: secondary / primary / quiet / icon |
| Feature screen | `app/pages/month/[year]/[month].vue` | Compose `UiSurface`, `UiMetric`, shared header |
| Test | `tests/validation.test.ts` | Pure unit tests against server utils |

## Established patterns

- **Error handling:** `createError({ statusCode, statusMessage, data })` in API routes
- **Validation:** Zod schemas in `server/utils/validation.ts`; always `safeParse` at the boundary
- **Amounts:** integer cents only (`amountCents`)
- **Months:** `YYYY-MM` strings; never store day-of-month
- **UI:** Tailwind + CSS variables in `app/assets/css/main.css`. Brand: Cal Sans display + Inter body; charcoal/paper monochrome. Use `UiButton` — do not invent one-off button styles.
- **Naming:** Vue SFCs PascalCase; API files Nitro conventions (`index.get.ts`, `[id].patch.ts`)

## Deliberate deviations

| Where | What looks wrong | Why it is that way |
|---|---|---|
| Spec text says Nuxt 3 | Plan/build use Nuxt 4 | Current Nuxt line; tracked as plan assumption |
| `transactions.type` denormalized | Could join via item→category | Guards type mismatches and speeds summaries |

## Do not

- Reuse the flat category model from `feat/001` (no `items`, day-level dates)
- Add purple gradients / glass glow / ad-hoc button sizes
- Skip Zod at API boundaries
- Store floating-point currency
