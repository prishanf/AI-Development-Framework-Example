export interface AggregatableTransaction {
  type: 'income' | 'expense'
  amountCents: number
  categoryId: number
  occurredOn: string
}

export interface MonthTotals {
  incomeCents: number
  expenseCents: number
  netCents: number
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

export function totalsByCategory(transactions: AggregatableTransaction[]): Map<number, MonthTotals> {
  const byCategory = new Map<number, AggregatableTransaction[]>()
  for (const t of transactions) {
    const list = byCategory.get(t.categoryId) ?? []
    list.push(t)
    byCategory.set(t.categoryId, list)
  }
  const result = new Map<number, MonthTotals>()
  for (const [categoryId, list] of byCategory) {
    result.set(categoryId, totalsFor(list))
  }
  return result
}

export interface MonthKey {
  year: number
  month: number // 1-12
}

export function monthKeyOf(occurredOn: string): MonthKey {
  const [yearPart, monthPart] = occurredOn.split('-')
  return { year: Number(yearPart), month: Number(monthPart) }
}

export function yearlyTotalsByMonth(
  transactions: AggregatableTransaction[],
  year: number
): MonthTotals[] {
  const months: AggregatableTransaction[][] = Array.from({ length: 12 }, () => [])
  for (const t of transactions) {
    const key = monthKeyOf(t.occurredOn)
    if (key.year === year) {
      months[key.month - 1]!.push(t)
    }
  }
  return months.map(totalsFor)
}
