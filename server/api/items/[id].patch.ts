import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { items } from '../../db/schema'
import { archivePatchSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item id' })
  }
  const body = await readBody(event)
  const parsed = archivePatchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid patch', data: parsed.error.flatten() })
  }
  const [updated] = await db.update(items)
    .set({ archived: parsed.data.archived })
    .where(eq(items.id, id))
    .returning()
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }
  return updated
})
