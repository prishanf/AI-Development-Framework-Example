import { db } from '../../db/client'
import { items } from '../../db/schema'

export default defineEventHandler(() => {
  return db.select().from(items).all()
})
