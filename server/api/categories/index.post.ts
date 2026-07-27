import { db } from '../../db/client'
import { categories } from '../../db/schema'
import { categoryInputSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = categoryInputSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid category', data: parsed.error.flatten() })
  }
  const [created] = await db.insert(categories).values(parsed.data).returning()
  return created
})
