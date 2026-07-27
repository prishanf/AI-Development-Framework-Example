export interface MonthTotals {
  incomeCents: number
  expenseCents: number
  netCents: number
}

export interface PivotItemRow {
  itemId: number
  itemName: string
  archived: boolean
  months: number[]
  total: number
}

export interface PivotCategoryGroup {
  categoryId: number
  categoryName: string
  archived: boolean
  items: PivotItemRow[]
  subtotalMonths: number[]
  subtotal: number
}

export interface PivotBlock {
  groups: PivotCategoryGroup[]
  totals: number[]
  total: number
}
