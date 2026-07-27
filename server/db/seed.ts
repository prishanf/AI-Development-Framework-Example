import { db } from './client'
import { categories, transactions } from './schema'

const starterCategories: { type: 'income' | 'expense'; name: string }[] = [
  { type: 'income', name: 'Salary James' },
  { type: 'income', name: 'Salary Amy' },
  { type: 'income', name: 'Rental Income' },
  { type: 'income', name: 'Dividend TD' },
  { type: 'expense', name: 'Amex Card 009' },
  { type: 'expense', name: 'RBC MC' }
]

function seed() {
  const existing = db.select().from(categories).all()
  if (existing.length > 0) {
    console.log('Seed skipped: categories already exist.')
    return
  }

  const inserted = starterCategories.map((c) => {
    const [row] = db.insert(categories).values(c).returning().all()
    if (!row) throw new Error(`Failed to insert category ${c.name}`)
    return row
  })

  const byName = (name: string) => inserted.find(c => c.name === name)!

  const year = new Date().getFullYear()
  const sample = [
    { category: 'Salary James', type: 'income' as const, amountCents: 550000, day: '05' },
    { category: 'Salary Amy', type: 'income' as const, amountCents: 480000, day: '05' },
    { category: 'Rental Income', type: 'income' as const, amountCents: 220000, day: '01' },
    { category: 'Dividend TD', type: 'income' as const, amountCents: 15000, day: '15' },
    { category: 'Amex Card 009', type: 'expense' as const, amountCents: 42599, day: '10' },
    { category: 'RBC MC', type: 'expense' as const, amountCents: 18750, day: '20' }
  ]

  for (const month of [1, 2, 3]) {
    for (const s of sample) {
      const category = byName(s.category)
      db.insert(transactions).values({
        categoryId: category.id,
        type: s.type,
        amountCents: s.amountCents,
        occurredOn: `${year}-${String(month).padStart(2, '0')}-${s.day}`,
        note: null
      }).run()
    }
  }

  console.log(`Seeded ${inserted.length} categories and sample transactions for ${year} Jan-Mar.`)
}

seed()
