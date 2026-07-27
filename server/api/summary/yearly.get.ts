import { like } from 'drizzle-orm'
import { db } from '../../db/client'
import { categories, items, transactions } from '../../db/schema'
import {
  buildYearPivot,
  yearlyTotalsByMonth,
  type AggregatableTransaction
} from '../../utils/aggregate'

export default defineEventHandler((event) => {
  const year = Number(getQuery(event).year)
  if (!Number.isInteger(year) || year < 1970) {
    throw createError({ statusCode: 400, statusMessage: 'year query param required' })
  }

  const rows = db.select().from(transactions).where(like(transactions.month, `${year}-%`)).all()
  const allCategories = db.select().from(categories).all()
  const allItems = db.select().from(items).all()
  const itemCategory = new Map(allItems.map(i => [i.id, i.categoryId]))

  const aggregatable: AggregatableTransaction[] = rows.map(t => ({
    type: t.type,
    amountCents: t.amountCents,
    itemId: t.itemId,
    categoryId: itemCategory.get(t.itemId) ?? 0,
    month: t.month
  }))

  const byMonth = yearlyTotalsByMonth(aggregatable, year)
  const income = buildYearPivot('income', year, allCategories, allItems, aggregatable)
  const expense = buildYearPivot('expense', year, allCategories, allItems, aggregatable)

  return {
    year,
    byMonth,
    yearTotals: {
      incomeCents: income.total,
      expenseCents: expense.total,
      netCents: income.total - expense.total
    },
    income,
    expense
  }
})
