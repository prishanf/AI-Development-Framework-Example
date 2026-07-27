import { describe, expect, it } from 'vitest'
import { bulkTransactionInputSchema, categoryInputSchema, transactionInputSchema } from '../server/utils/validation'

describe('transactionInputSchema', () => {
  it('accepts a valid transaction', () => {
    const result = transactionInputSchema.safeParse({
      categoryId: 1,
      type: 'expense',
      amountCents: 500,
      occurredOn: '2026-01-15',
      note: 'coffee'
    })
    expect(result.success).toBe(true)
  })

  it('rejects a zero or negative amount', () => {
    expect(transactionInputSchema.safeParse({
      categoryId: 1, type: 'expense', amountCents: 0, occurredOn: '2026-01-15'
    }).success).toBe(false)
    expect(transactionInputSchema.safeParse({
      categoryId: 1, type: 'expense', amountCents: -10, occurredOn: '2026-01-15'
    }).success).toBe(false)
  })

  it('rejects a malformed date', () => {
    const result = transactionInputSchema.safeParse({
      categoryId: 1, type: 'expense', amountCents: 500, occurredOn: '01/15/2026'
    })
    expect(result.success).toBe(false)
  })
})

describe('categoryInputSchema', () => {
  it('rejects an empty name', () => {
    expect(categoryInputSchema.safeParse({ type: 'income', name: '  ' }).success).toBe(false)
  })
})

describe('bulkTransactionInputSchema', () => {
  it('accepts a batch of valid rows', () => {
    const rows = [
      { categoryId: 1, type: 'expense', amountCents: 100, occurredOn: '2026-01-01' },
      { categoryId: 2, type: 'income', amountCents: 200, occurredOn: '2026-01-02' }
    ]
    expect(bulkTransactionInputSchema.safeParse(rows).success).toBe(true)
  })

  it('rejects an empty batch', () => {
    expect(bulkTransactionInputSchema.safeParse([]).success).toBe(false)
  })
})
