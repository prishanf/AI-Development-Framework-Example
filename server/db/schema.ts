import { sql } from 'drizzle-orm'
import { check, sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  name: text('name').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, table => [
  uniqueIndex('categories_type_name_idx').on(table.type, table.name),
  check('categories_type_check', sql`${table.type} in ('income', 'expense')`)
])

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  name: text('name').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, table => [
  uniqueIndex('items_category_name_idx').on(table.categoryId, table.name)
])

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  itemId: integer('item_id').notNull().references(() => items.id),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  month: text('month').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, table => [
  check('transactions_type_check', sql`${table.type} in ('income', 'expense')`),
  check('transactions_amount_positive', sql`${table.amountCents} > 0`),
  check(
    'transactions_month_format',
    sql`length(${table.month}) = 7
      and substr(${table.month}, 5, 1) = '-'
      and cast(substr(${table.month}, 1, 4) as integer) between 1900 and 2100
      and cast(substr(${table.month}, 6, 2) as integer) between 1 and 12`
  )
])

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
