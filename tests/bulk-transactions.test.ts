import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import Database from 'better-sqlite3'

const testDbPath = resolve('.data/test-bulk.db')

describe('processBulkTransactions', () => {
  beforeEach(() => {
    rmSync(testDbPath, { force: true })
    mkdirSync(resolve('.data'), { recursive: true })
    process.env.DATABASE_PATH = testDbPath
    vi.resetModules()

    const sqlite = new Database(testDbPath)
    sqlite.exec(`
      CREATE TABLE categories (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        type text NOT NULL,
        name text NOT NULL,
        archived integer DEFAULT false NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        CONSTRAINT categories_type_check CHECK(type in ('income', 'expense'))
      );
      CREATE UNIQUE INDEX categories_type_name_idx ON categories (type, name);
      CREATE TABLE items (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        category_id integer NOT NULL,
        name text NOT NULL,
        archived integer DEFAULT false NOT NULL,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        FOREIGN KEY (category_id) REFERENCES categories(id)
      );
      CREATE UNIQUE INDEX items_category_name_idx ON items (category_id, name);
      CREATE TABLE transactions (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        item_id integer NOT NULL,
        type text NOT NULL,
        amount_cents integer NOT NULL,
        month text NOT NULL,
        note text,
        created_at text DEFAULT (current_timestamp) NOT NULL,
        FOREIGN KEY (item_id) REFERENCES items(id),
        CONSTRAINT transactions_type_check CHECK(type in ('income', 'expense')),
        CONSTRAINT transactions_amount_positive CHECK(amount_cents > 0),
        CONSTRAINT transactions_month_format CHECK(
          length(month) = 7
          and substr(month, 5, 1) = '-'
          and cast(substr(month, 1, 4) as integer) between 1900 and 2100
          and cast(substr(month, 6, 2) as integer) between 1 and 12
        )
      );
    `)
    sqlite.close()
  })

  afterEach(() => {
    rmSync(testDbPath, { force: true })
    delete process.env.DATABASE_PATH
    vi.resetModules()
  })

  it('saves valid rows and reports invalid rows without discarding successes', async () => {
    const { db } = await import('../server/db/client')
    const { categories, items, transactions } = await import('../server/db/schema')
    const { processBulkTransactions } = await import('../server/utils/bulk-transactions')

    const [cat] = await db.insert(categories).values({ type: 'expense', name: 'Credit Card' }).returning()
    const [activeItem] = await db.insert(items).values({ categoryId: cat!.id, name: 'Amex' }).returning()
    const [archivedItem] = await db.insert(items).values({
      categoryId: cat!.id,
      name: 'Old Card',
      archived: true
    }).returning()

    const result = await processBulkTransactions([
      { itemId: activeItem!.id, type: 'expense', amountCents: 1250, month: '2026-07', note: 'ok' },
      { itemId: activeItem!.id, type: 'expense', amountCents: 0, month: '2026-07' },
      { itemId: archivedItem!.id, type: 'expense', amountCents: 500, month: '2026-07' },
      { itemId: activeItem!.id, type: 'expense', amountCents: 999, month: '2026-13' }
    ])

    expect(result.createdCount).toBe(1)
    expect(result.failedCount).toBe(3)
    expect(result.results[0]).toMatchObject({ index: 0, status: 'created' })
    expect(result.results[1]).toMatchObject({ index: 1, status: 'failed' })
    expect(result.results[2]).toMatchObject({ index: 2, status: 'failed', error: 'Item is archived' })
    expect(result.results[3]?.status).toBe('failed')

    const saved = db.select().from(transactions).all()
    expect(saved).toHaveLength(1)
    expect(saved[0]?.amountCents).toBe(1250)
  })
})
