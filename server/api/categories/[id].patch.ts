import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories } from '../../db/schema'
import { categoryPatchSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category id' })
  }
  const body = await readBody(event)
  const parsed = categoryPatchSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid patch', data: parsed.error.flatten() })
  }

  const patch: { archived?: boolean, name?: string } = {}
  if (parsed.data.archived !== undefined) patch.archived = parsed.data.archived
  if (parsed.data.name !== undefined) patch.name = parsed.data.name

  try {
    const [updated] = await db.update(categories)
      .set(patch)
      .where(eq(categories.id, id))
      .returning()
    if (!updated) {
      throw createError({ statusCode: 404, statusMessage: 'Category not found' })
    }
    return updated
  } catch (error: unknown) {
    if ((error as { statusCode?: number }).statusCode) throw error
    throw createError({ statusCode: 409, statusMessage: 'Category name already exists for this type' })
  }
})
