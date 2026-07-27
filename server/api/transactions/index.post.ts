import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, transactions } from '../../db/schema'
import { transactionInputSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = transactionInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction', data: parsed.error.flatten() })
  }

  const category = db.select().from(categories).where(eq(categories.id, parsed.data.categoryId)).get()
  if (!category || category.archived) {
    throw createError({ statusCode: 400, statusMessage: 'Category not found or archived' })
  }
  if (category.type !== parsed.data.type) {
    throw createError({ statusCode: 400, statusMessage: 'Transaction type must match category type' })
  }

  const [created] = await db.insert(transactions).values(parsed.data).returning()
  return created
})
