import { describe, expect, it } from 'vitest'
import { totalsFor, totalsByCategory, yearlyTotalsByMonth } from '../server/utils/aggregate'

const tx = (overrides: Partial<Parameters<typeof totalsFor>[0][number]> = {}) => ({
  type: 'expense' as const,
  amountCents: 1000,
  categoryId: 1,
  occurredOn: '2026-01-01',
  ...overrides
})

describe('totalsFor', () => {
  it('sums income and expenses separately and computes net', () => {
    const totals = totalsFor([
      tx({ type: 'income', amountCents: 5000 }),
      tx({ type: 'expense', amountCents: 2000 }),
      tx({ type: 'expense', amountCents: 500 })
    ])
    expect(totals).toEqual({ incomeCents: 5000, expenseCents: 2500, netCents: 2500 })
  })

  it('returns zeros for an empty list', () => {
    expect(totalsFor([])).toEqual({ incomeCents: 0, expenseCents: 0, netCents: 0 })
  })
})

describe('totalsByCategory', () => {
  it('groups totals per category id', () => {
    const result = totalsByCategory([
      tx({ categoryId: 1, type: 'income', amountCents: 100 }),
      tx({ categoryId: 1, type: 'expense', amountCents: 40 }),
      tx({ categoryId: 2, type: 'expense', amountCents: 20 })
    ])
    expect(result.get(1)).toEqual({ incomeCents: 100, expenseCents: 40, netCents: 60 })
    expect(result.get(2)).toEqual({ incomeCents: 0, expenseCents: 20, netCents: -20 })
  })
})

describe('yearlyTotalsByMonth', () => {
  it('buckets transactions into 12 months and ignores other years', () => {
    const result = yearlyTotalsByMonth([
      tx({ occurredOn: '2026-01-15', type: 'income', amountCents: 100 }),
      tx({ occurredOn: '2026-03-01', type: 'expense', amountCents: 30 }),
      tx({ occurredOn: '2025-12-31', type: 'expense', amountCents: 999 })
    ], 2026)

    expect(result).toHaveLength(12)
    expect(result[0]).toEqual({ incomeCents: 100, expenseCents: 0, netCents: 100 })
    expect(result[2]).toEqual({ incomeCents: 0, expenseCents: 30, netCents: -30 })
    expect(result[1]).toEqual({ incomeCents: 0, expenseCents: 0, netCents: 0 })
  })
})
