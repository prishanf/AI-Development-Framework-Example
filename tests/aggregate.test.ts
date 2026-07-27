import { describe, expect, it } from 'vitest'
import {
  buildYearPivot,
  totalsFor,
  yearlyTotalsByMonth,
  type AggregatableTransaction
} from '../server/utils/aggregate'

const sample: AggregatableTransaction[] = [
  { type: 'income', amountCents: 550000, itemId: 1, categoryId: 1, month: '2026-06' },
  { type: 'income', amountCents: 480000, itemId: 2, categoryId: 1, month: '2026-06' },
  { type: 'expense', amountCents: 4550, itemId: 3, categoryId: 2, month: '2026-07' },
  { type: 'expense', amountCents: 1230, itemId: 4, categoryId: 2, month: '2026-07' }
]

describe('totalsFor', () => {
  it('sums income, expense, and net', () => {
    expect(totalsFor(sample)).toEqual({
      incomeCents: 1030000,
      expenseCents: 5780,
      netCents: 1024220
    })
  })
})

describe('yearlyTotalsByMonth', () => {
  it('places totals into the correct month buckets', () => {
    const months = yearlyTotalsByMonth(sample, 2026)
    expect(months[5]).toEqual({ incomeCents: 1030000, expenseCents: 0, netCents: 1030000 })
    expect(months[6]).toEqual({ incomeCents: 0, expenseCents: 5780, netCents: -5780 })
    expect(months[0]).toEqual({ incomeCents: 0, expenseCents: 0, netCents: 0 })
  })
})

describe('buildYearPivot', () => {
  it('renders zero subtotal for categories with no items', () => {
    const pivot = buildYearPivot(
      'income',
      2026,
      [
        { id: 1, name: 'Salary', type: 'income', archived: false },
        { id: 5, name: 'Interest', type: 'income', archived: false }
      ],
      [
        { id: 1, categoryId: 1, name: 'Salary James', archived: false },
        { id: 2, categoryId: 1, name: 'Salary Amy', archived: false }
      ],
      sample
    )
    const interest = pivot.groups.find(g => g.categoryName === 'Interest')
    expect(interest).toBeTruthy()
    expect(interest!.items).toHaveLength(0)
    expect(interest!.subtotal).toBe(0)
    expect(pivot.total).toBe(1030000)
  })

  it('reconciles category subtotals to type total', () => {
    const pivot = buildYearPivot(
      'expense',
      2026,
      [{ id: 2, name: 'Credit Card', type: 'expense', archived: false }],
      [
        { id: 3, categoryId: 2, name: 'Amex Credit Card', archived: false },
        { id: 4, categoryId: 2, name: 'RBC MC', archived: false }
      ],
      sample
    )
    const subtotalSum = pivot.groups.reduce((s, g) => s + g.subtotal, 0)
    expect(subtotalSum).toBe(pivot.total)
    expect(pivot.total).toBe(5780)
  })
})
