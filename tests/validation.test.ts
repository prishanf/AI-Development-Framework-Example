import { describe, expect, it } from 'vitest'
import {
  bulkTransactionInputSchema,
  categoryInputSchema,
  itemInputSchema,
  transactionInputSchema
} from '../server/utils/validation'

describe('transactionInputSchema', () => {
  it('accepts a valid month-scoped transaction', () => {
    const result = transactionInputSchema.safeParse({
      itemId: 1,
      type: 'expense',
      amountCents: 500,
      month: '2026-07',
      note: 'coffee'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a zero or negative amount', () => {
    expect(transactionInputSchema.safeParse({
      itemId: 1, type: 'expense', amountCents: 0, month: '2026-07'
    }).success).toBe(false)
    expect(transactionInputSchema.safeParse({
      itemId: 1, type: 'expense', amountCents: -10, month: '2026-07'
    }).success).toBe(false)
  })

  it('rejects a day-level date', () => {
    const result = transactionInputSchema.safeParse({
      itemId: 1, type: 'expense', amountCents: 500, month: '2026-07-15'
    })
    expect(result.success).toBe(false)
  })
})

describe('categoryInputSchema', () => {
  it('rejects an empty name', () => {
    expect(categoryInputSchema.safeParse({ type: 'income', name: '  ' }).success).toBe(false)
  })
})

describe('itemInputSchema', () => {
  it('requires a category id and name', () => {
    expect(itemInputSchema.safeParse({ categoryId: 1, name: 'RBC MC' }).success).toBe(true)
    expect(itemInputSchema.safeParse({ categoryId: 1, name: '' }).success).toBe(false)
  })
})

describe('bulkTransactionInputSchema', () => {
  it('accepts a batch of valid rows', () => {
    const rows = [
      { itemId: 1, type: 'expense', amountCents: 100, month: '2026-07' },
      { itemId: 2, type: 'income', amountCents: 200, month: '2026-07' }
    ]
    expect(bulkTransactionInputSchema.safeParse(rows).success).toBe(true)
  })

  it('rejects an empty batch', () => {
    expect(bulkTransactionInputSchema.safeParse([]).success).toBe(false)
  })
})
