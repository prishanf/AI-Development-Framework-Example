import { processBulkTransactions } from '../../utils/bulk-transactions'
import { bulkTransactionEnvelopeSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = bulkTransactionEnvelopeSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid batch', data: parsed.error.flatten() })
  }
  return processBulkTransactions(parsed.data)
})
