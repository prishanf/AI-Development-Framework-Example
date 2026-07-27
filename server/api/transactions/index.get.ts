import { and, gte, lt } from 'drizzle-orm'
import { db } from '../../db/client'
import { transactions } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = Number(query.year)
  const month = query.month !== undefined ? Number(query.month) : undefined

  if (!Number.isInteger(year)) {
    throw createError({ statusCode: 400, statusMessage: 'year is required' })
  }
  if (month !== undefined && (!Number.isInteger(month) || month < 1 || month > 12)) {
    throw createError({ statusCode: 400, statusMessage: 'month must be 1-12' })
  }

  const from = month ? `${year}-${String(month).padStart(2, '0')}-01` : `${year}-01-01`
  const toYear = month ? (month === 12 ? year + 1 : year) : year + 1
  const toMonth = month ? (month === 12 ? 1 : month + 1) : 1
  const to = `${toYear}-${String(toMonth).padStart(2, '0')}-01`

  return db
    .select()
    .from(transactions)
    .where(and(gte(transactions.occurredOn, from), lt(transactions.occurredOn, to)))
    .orderBy(transactions.occurredOn)
    .all()
})
