import { describe, expect, it } from 'vitest'
import {
  bulkTransactionEnvelopeSchema,
  categoryPatchSchema,
  categoryInputSchema,
  itemInputSchema,
  itemPatchSchema,
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

describe('bulkTransactionEnvelopeSchema', () => {
  it('accepts a mixed batch of unknown rows (per-row validation happens later)', () => {
    const rows = [
      { itemId: 1, type: 'expense', amountCents: 100, month: '2026-07' },
      { itemId: 2, type: 'income', amountCents: 0, month: '2026-07' }
    ]
    expect(bulkTransactionEnvelopeSchema.safeParse(rows).success).toBe(true)
  })

  it('rejects an empty batch', () => {
    expect(bulkTransactionEnvelopeSchema.safeParse([]).success).toBe(false)
  })
})

describe('rename patches', () => {
  it('allows name-only and archived-only patches', () => {
    expect(categoryPatchSchema.safeParse({ name: 'Salary' }).success).toBe(true)
    expect(itemPatchSchema.safeParse({ archived: true }).success).toBe(true)
  })

  it('rejects an empty patch', () => {
    expect(categoryPatchSchema.safeParse({}).success).toBe(false)
    expect(itemPatchSchema.safeParse({}).success).toBe(false)
  })
})
