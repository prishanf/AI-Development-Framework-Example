import { db } from '../../db/client'
import { categories } from '../../db/schema'

export default defineEventHandler(async () => {
  return db.select().from(categories).all()
})
