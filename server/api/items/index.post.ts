import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, items } from '../../db/schema'
import { itemInputSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = itemInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid item', data: parsed.error.flatten() })
  }

  const category = db.select().from(categories).where(eq(categories.id, parsed.data.categoryId)).get()
  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }
  if (category.archived) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot add items to an archived category' })
  }

  try {
    const [created] = await db.insert(items).values(parsed.data).returning()
    return created
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Item already exists under this category' })
  }
})
