import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])

export const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'month must be YYYY-MM')

export const categoryInputSchema = z.object({
  type: transactionTypeSchema,
  name: z.string().trim().min(1).max(80)
})

export const itemInputSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().trim().min(1).max(80)
})

export const transactionInputSchema = z.object({
  itemId: z.number().int().positive(),
  type: transactionTypeSchema,
  amountCents: z.number().int().positive(),
  month: monthSchema,
  note: z.string().trim().max(500).optional().nullable()
})

export const bulkTransactionInputSchema = z.array(transactionInputSchema).min(1).max(200)

export const archivePatchSchema = z.object({
  archived: z.boolean()
})

export type TransactionInput = z.infer<typeof transactionInputSchema>
export type CategoryInput = z.infer<typeof categoryInputSchema>
export type ItemInput = z.infer<typeof itemInputSchema>
