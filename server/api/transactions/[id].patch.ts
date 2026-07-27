import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, transactions } from '../../db/schema'
import { z } from 'zod'

const patchSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  amountCents: z.number().int().positive().optional(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  note: z.string().trim().max(500).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }
  const body = await readBody(event)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid update', data: parsed.error.flatten() })
  }
  if (Object.keys(parsed.data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }

  const categoryId = parsed.data.categoryId
  const type = parsed.data.type
  if (categoryId !== undefined || type !== undefined) {
    const existing = db.select().from(transactions).where(eq(transactions.id, id)).get()
    if (!existing) {
      throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
    }
    const effectiveCategoryId = categoryId ?? existing.categoryId
    const effectiveType = type ?? existing.type
    const category = db.select().from(categories).where(eq(categories.id, effectiveCategoryId)).get()
    if (!category || category.archived) {
      throw createError({ statusCode: 400, statusMessage: 'Category not found or archived' })
    }
    if (category.type !== effectiveType) {
      throw createError({ statusCode: 400, statusMessage: 'Transaction type must match category type' })
    }
  }

  const [updated] = await db.update(transactions).set(parsed.data).where(eq(transactions.id, id)).returning()
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }
  return updated
})
