import type { MonthTotals, PivotBlock, PivotCategoryGroup, PivotItemRow } from '../../shared/types'

export type { MonthTotals, PivotBlock, PivotCategoryGroup, PivotItemRow }

export interface AggregatableTransaction {
  type: 'income' | 'expense'
  amountCents: number
  itemId: number
  categoryId: number
  month: string
}

export function totalsFor(transactions: AggregatableTransaction[]): MonthTotals {
  const incomeCents = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amountCents, 0)
  const expenseCents = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountCents, 0)
  return { incomeCents, expenseCents, netCents: incomeCents - expenseCents }
}

export function parseMonthKey(month: string): { year: number, month: number } {
  const [yearPart, monthPart] = month.split('-')
  return { year: Number(yearPart), month: Number(monthPart) }
}

export function yearlyTotalsByMonth(
  transactions: AggregatableTransaction[],
  year: number
): MonthTotals[] {
  const months: AggregatableTransaction[][] = Array.from({ length: 12 }, () => [])
  for (const t of transactions) {
    const key = parseMonthKey(t.month)
    if (key.year === year) {
      months[key.month - 1]!.push(t)
    }
  }
  return months.map(totalsFor)
}

export interface CategoryMeta {
  id: number
  name: string
  type: 'income' | 'expense'
  archived: boolean
}

export interface ItemMeta {
  id: number
  categoryId: number
  name: string
  archived: boolean
}

export function buildYearPivot(
  type: 'income' | 'expense',
  year: number,
  categories: CategoryMeta[],
  items: ItemMeta[],
  transactions: AggregatableTransaction[]
): PivotBlock {
  const typedCategories = categories.filter(c => c.type === type)
  const byItem = new Map<number, number[]>()

  for (const t of transactions) {
    if (t.type !== type) continue
    const key = parseMonthKey(t.month)
    if (key.year !== year) continue
    if (!byItem.has(t.itemId)) byItem.set(t.itemId, Array(12).fill(0))
    byItem.get(t.itemId)![key.month - 1]! += t.amountCents
  }

  const groups: PivotCategoryGroup[] = []
  let typeMonthTotals = Array(12).fill(0) as number[]

  for (const cat of typedCategories) {
    const catItems = items.filter(i => i.categoryId === cat.id)
    const itemRows: PivotItemRow[] = []
    let catMonthTotals = Array(12).fill(0) as number[]

    for (const item of catItems) {
      const monthsVals = byItem.get(item.id) || Array(12).fill(0)
      const total = monthsVals.reduce((a, b) => a + b, 0)
      if (item.archived && total === 0) continue
      itemRows.push({
        itemId: item.id,
        itemName: item.name,
        archived: item.archived,
        months: monthsVals,
        total
      })
      catMonthTotals = catMonthTotals.map((v, i) => v + monthsVals[i]!)
    }

    const catTotal = catMonthTotals.reduce((a, b) => a + b, 0)
    if (cat.archived && catTotal === 0 && itemRows.length === 0) continue

    groups.push({
      categoryId: cat.id,
      categoryName: cat.name,
      archived: cat.archived,
      items: itemRows,
      subtotalMonths: catMonthTotals,
      subtotal: catTotal
    })
    typeMonthTotals = typeMonthTotals.map((v, i) => v + catMonthTotals[i]!)
  }

  return {
    groups,
    totals: typeMonthTotals,
    total: typeMonthTotals.reduce((a, b) => a + b, 0)
  }
}
