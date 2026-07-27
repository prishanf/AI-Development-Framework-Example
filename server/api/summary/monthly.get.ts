import { and, gte, lt } from 'drizzle-orm'
import { db } from '../../db/client'
import { transactions } from '../../db/schema'
import { totalsFor, totalsByCategory } from '../../utils/aggregate'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = Number(query.year)
  const month = Number(query.month)

  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw createError({ statusCode: 400, statusMessage: 'year and month (1-12) are required' })
  }

  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const toYear = month === 12 ? year + 1 : year
  const toMonth = month === 12 ? 1 : month + 1
  const to = `${toYear}-${String(toMonth).padStart(2, '0')}-01`

  const rows = db
    .select()
    .from(transactions)
    .where(and(gte(transactions.occurredOn, from), lt(transactions.occurredOn, to)))
    .all()

  return {
    year,
    month,
    totals: totalsFor(rows),
    byCategory: Object.fromEntries(totalsByCategory(rows))
  }
})
