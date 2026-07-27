import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, items, transactions } from '../../db/schema'
import { transactionInputSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = transactionInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction', data: parsed.error.flatten() })
  }

  const item = db.select().from(items).where(eq(items.id, parsed.data.itemId)).get()
  if (!item) throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  if (item.archived) throw createError({ statusCode: 400, statusMessage: 'Item is archived' })

  const category = db.select().from(categories).where(eq(categories.id, item.categoryId)).get()
  if (!category) throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  if (category.archived) throw createError({ statusCode: 400, statusMessage: 'Category is archived' })
  if (category.type !== parsed.data.type) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction type must match category type' })
  }

  const [created] = await db.insert(transactions).values(parsed.data).returning()
  return created
})
