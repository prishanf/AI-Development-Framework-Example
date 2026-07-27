import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { transactions } from '../../db/schema'
import { monthSchema } from '../../utils/validation'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const year = Number(query.year)
  const month = Number(query.month)

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw createError({ statusCode: 400, statusMessage: 'year and month query params required' })
  }

  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const parsed = monthSchema.safeParse(monthKey)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid month' })
  }

  return db.select().from(transactions).where(eq(transactions.month, monthKey)).all()
})
