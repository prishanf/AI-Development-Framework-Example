import { eq } from 'drizzle-orm'
import { db } from '../../db/client'
import { items, transactions } from '../../db/schema'
import { totalsFor, type AggregatableTransaction } from '../../utils/aggregate'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const year = Number(query.year)
  const month = Number(query.month)
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw createError({ statusCode: 400, statusMessage: 'year and month query params required' })
  }
  const monthKey = `${year}-${String(month).padStart(2, '0')}`
  const rows = db.select().from(transactions).where(eq(transactions.month, monthKey)).all()
  const allItems = db.select().from(items).all()
  const itemCategory = new Map(allItems.map(i => [i.id, i.categoryId]))

  const aggregatable: AggregatableTransaction[] = rows.map(t => ({
    type: t.type,
    amountCents: t.amountCents,
    itemId: t.itemId,
    categoryId: itemCategory.get(t.itemId) ?? 0,
    month: t.month
  }))

  return { totals: totalsFor(aggregatable) }
})
