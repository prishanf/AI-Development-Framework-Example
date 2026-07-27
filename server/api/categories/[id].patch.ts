import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories } from '../../db/schema'
import { archivePatchSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category id' })
  }
  const body = await readBody(event)
  const parsed = archivePatchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid patch', data: parsed.error.flatten() })
  }
  const [updated] = await db.update(categories)
    .set({ archived: parsed.data.archived })
    .where(eq(categories.id, id))
    .returning()
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }
  return updated
})
