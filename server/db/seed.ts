import { db } from './client'
import { categories, items, transactions } from './schema'

const starter: {
  type: 'income' | 'expense'
  name: string
  items: string[]
}[] = [
  { type: 'income', name: 'Salary', items: ['Salary James', 'Salary Amy'] },
  { type: 'income', name: 'Rental', items: ['Rental Unit 1'] },
  { type: 'income', name: 'Dividend', items: ['Dividend TD'] },
  { type: 'income', name: 'Interest', items: [] },
  { type: 'expense', name: 'Credit Card', items: ['Amex Credit Card', 'RBC MC'] },
  { type: 'expense', name: 'Utilities', items: [] },
  { type: 'expense', name: 'Line Of Credit', items: [] }
]

function seed() {
  const existing = db.select().from(categories).all()
  if (existing.length > 0) {
    console.log('Seed skipped: categories already exist.')
    return
  }

  const itemByName = new Map<string, number>()

  for (const cat of starter) {
    const [createdCat] = db.insert(categories).values({
      type: cat.type,
      name: cat.name
    }).returning().all()
    if (!createdCat) throw new Error(`Failed to insert category ${cat.name}`)

    for (const itemName of cat.items) {
      const [createdItem] = db.insert(items).values({
        categoryId: createdCat.id,
        name: itemName
      }).returning().all()
      if (!createdItem) throw new Error(`Failed to insert item ${itemName}`)
      itemByName.set(itemName, createdItem.id)
    }
  }

  const samples: { item: string, type: 'income' | 'expense', amountCents: number }[] = [
    { item: 'Salary James', type: 'income', amountCents: 550000 },
    { item: 'Salary Amy', type: 'income', amountCents: 480000 },
    { item: 'Rental Unit 1', type: 'income', amountCents: 220000 },
    { item: 'Dividend TD', type: 'income', amountCents: 15000 },
    { item: 'Amex Credit Card', type: 'expense', amountCents: 42600 },
    { item: 'RBC MC', type: 'expense', amountCents: 18749 }
  ]

  for (const month of [6, 7]) {
    for (const s of samples) {
      const itemId = itemByName.get(s.item)
      if (!itemId) throw new Error(`Missing seeded item ${s.item}`)
      // July sample expenses only for credit cards to match prototype fixture vibe
      if (month === 7 && s.type === 'income') continue
      if (month === 7 && s.item === 'Amex Credit Card') {
        db.insert(transactions).values({
          itemId,
          type: s.type,
          amountCents: 4550,
          month: `2026-${String(month).padStart(2, '0')}`,
          note: null
        }).run()
        continue
      }
      if (month === 7 && s.item === 'RBC MC') {
        db.insert(transactions).values({
          itemId,
          type: s.type,
          amountCents: 1230,
          month: `2026-${String(month).padStart(2, '0')}`,
          note: null
        }).run()
        continue
      }
      if (month === 6) {
        db.insert(transactions).values({
          itemId,
          type: s.type,
          amountCents: s.amountCents,
          month: `2026-${String(month).padStart(2, '0')}`,
          note: null
        }).run()
      }
    }
  }

  console.log('Seeded starter categories, items, and June/July 2026 sample transactions.')
}

seed()
