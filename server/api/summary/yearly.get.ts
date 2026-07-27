import { and, gte, lt } from 'drizzle-orm'
import { db } from '../../db/client'
import { transactions } from '../../db/schema'
import { totalsFor, totalsByCategory, yearlyTotalsByMonth } from '../../utils/aggregate'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = Number(query.year)

  if (!Number.isInteger(year)) {
    throw createError({ statusCode: 400, statusMessage: 'year is required' })
  }

  const from = `${year}-01-01`
  const to = `${year + 1}-01-01`

  const rows = db
    .select()
    .from(transactions)
    .where(and(gte(transactions.occurredOn, from), lt(transactions.occurredOn, to)))
    .all()

  return {
    year,
    months: yearlyTotalsByMonth(rows, year),
    yearTotals: totalsFor(rows),
    byCategory: Object.fromEntries(totalsByCategory(rows))
  }
})
