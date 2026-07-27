import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories } from '../../db/schema'
import { z } from 'zod'

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  archived: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category id' })
  }
  const body = await readBody(event)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid update', data: parsed.error.flatten() })
  }
  if (Object.keys(parsed.data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No fields to update' })
  }
  const [updated] = await db.update(categories).set(parsed.data).where(eq(categories.id, id)).returning()
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }
  return updated
})
