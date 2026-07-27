import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])

export const categoryInputSchema = z.object({
  type: transactionTypeSchema,
  name: z.string().trim().min(1).max(80)
})

export const transactionInputSchema = z.object({
  categoryId: z.number().int().positive(),
  type: transactionTypeSchema,
  amountCents: z.number().int().positive(),
  occurredOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'occurredOn must be YYYY-MM-DD'),
  note: z.string().trim().max(500).optional().nullable()
})

export const bulkTransactionInputSchema = z.array(transactionInputSchema).min(1).max(200)

export type TransactionInput = z.infer<typeof transactionInputSchema>
export type CategoryInput = z.infer<typeof categoryInputSchema>
