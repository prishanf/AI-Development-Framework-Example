import { eq } from 'drizzle-orm'
import { db } from '../db/client'
import { categories, items, transactions } from '../db/schema'
import { transactionInputSchema, type TransactionInput } from './validation'

export interface BulkRowResult {
  index: number
  status: 'created' | 'failed'
  id?: number
  error?: string
}

export interface BulkProcessResult {
  createdCount: number
  failedCount: number
  results: BulkRowResult[]
}

function firstZodMessage(error: { flatten: () => { formErrors: string[], fieldErrors: Record<string, string[] | undefined> } }) {
  const flat = error.flatten()
  const field = Object.values(flat.fieldErrors).find(messages => messages && messages.length)?.[0]
  return field || flat.formErrors[0] || 'Invalid row'
}

/**
 * Validate and insert each bulk row independently so valid rows persist when
 * others fail (spec: partial success with per-row reporting).
 */
export async function processBulkTransactions(rows: unknown[]): Promise<BulkProcessResult> {
  const itemCache = new Map<number, { categoryId: number, archived: boolean } | null>()
  const categoryCache = new Map<number, { type: 'income' | 'expense', archived: boolean } | null>()
  const results: BulkRowResult[] = []

  for (const [index, row] of rows.entries()) {
    const parsed = transactionInputSchema.safeParse(row)
    if (!parsed.success) {
      results.push({ index, status: 'failed', error: firstZodMessage(parsed.error) })
      continue
    }
    const input: TransactionInput = parsed.data

    let item = itemCache.get(input.itemId)
    if (item === undefined) {
      item = db.select().from(items).where(eq(items.id, input.itemId)).get() ?? null
      itemCache.set(input.itemId, item)
    }
    if (!item) {
      results.push({ index, status: 'failed', error: 'Item not found' })
      continue
    }
    if (item.archived) {
      results.push({ index, status: 'failed', error: 'Item is archived' })
      continue
    }

    let category = categoryCache.get(item.categoryId)
    if (category === undefined) {
      category = db.select().from(categories).where(eq(categories.id, item.categoryId)).get() ?? null
      categoryCache.set(item.categoryId, category)
    }
    if (!category) {
      results.push({ index, status: 'failed', error: 'Category not found' })
      continue
    }
    if (category.archived) {
      results.push({ index, status: 'failed', error: 'Category is archived' })
      continue
    }
    if (category.type !== input.type) {
      results.push({ index, status: 'failed', error: 'Item/type mismatch' })
      continue
    }

    const [created] = await db.insert(transactions).values(input).returning()
    if (!created) {
      results.push({ index, status: 'failed', error: 'Insert failed' })
      continue
    }
    results.push({ index, status: 'created', id: created.id })
  }

  const createdCount = results.filter(r => r.status === 'created').length
  return {
    createdCount,
    failedCount: results.length - createdCount,
    results
  }
}
