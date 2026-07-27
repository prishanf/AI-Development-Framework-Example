import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  name: text('name').notNull(),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
}, (table) => [
  uniqueIndex('categories_type_name_idx').on(table.type, table.name)
])

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').notNull().references(() => categories.id),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  occurredOn: text('occurred_on').notNull(),
  note: text('note'),
  createdAt: text('created_at').notNull().default(sql`(current_timestamp)`)
})

export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Transaction = typeof transactions.$inferSelect
export type NewTransaction = typeof transactions.$inferInsert
