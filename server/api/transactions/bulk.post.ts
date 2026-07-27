import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, items, transactions } from '../../db/schema'
import { bulkTransactionInputSchema } from '../../utils/validation'

interface RowResult {
  index: number
  status: 'created' | 'failed'
  id?: number
  error?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bulkTransactionInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid batch', data: parsed.error.flatten() })
  }

  const itemCache = new Map<number, { categoryId: number, archived: boolean } | null>()
  const categoryCache = new Map<number, { type: 'income' | 'expense', archived: boolean } | null>()
  const results: RowResult[] = []

  for (const [index, row] of parsed.data.entries()) {
    let item = itemCache.get(row.itemId)
    if (item === undefined) {
      item = db.select().from(items).where(eq(items.id, row.itemId)).get() ?? null
      itemCache.set(row.itemId, item)
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
    if (category.type !== row.type) {
      results.push({ index, status: 'failed', error: 'Item/type mismatch' })
      continue
    }

    const [created] = await db.insert(transactions).values(row).returning()
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
})
