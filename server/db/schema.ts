import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  name: text('name').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, table => [
  uniqueIndex('categories_type_name_idx').on(table.type, table.name)
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
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
