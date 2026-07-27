import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { items } from '../../db/schema'
import { itemPatchSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item id' })
  }
  const body = await readBody(event)
  const parsed = itemPatchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid patch', data: parsed.error.flatten() })
  }

  const patch: { archived?: boolean, name?: string } = {}
  if (parsed.data.archived !== undefined) patch.archived = parsed.data.archived
  if (parsed.data.name !== undefined) patch.name = parsed.data.name

  try {
    const [updated] = await db.update(items)
      .set(patch)
      .where(eq(items.id, id))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Item not found' })
    }
    return updated
  } catch (error: unknown) {
    if ((error as { statusCode?: number }).statusCode) throw error
    throw createError({ statusCode: 409, statusMessage: 'Item name already exists under this category' })
  }
})
