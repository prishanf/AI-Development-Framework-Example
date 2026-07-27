import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id) || id <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid transaction id' })
  }
  const [deleted] = await db.delete(transactions).where(eq(transactions.id, id)).returning()
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Transaction not found' })
  }
  return { success: true }
})
