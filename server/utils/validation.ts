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

/** Envelope only — each element is validated independently for partial success. */
export const bulkTransactionEnvelopeSchema = z.array(z.unknown()).min(1).max(200)

export const categoryPatchSchema = z.object({
  archived: z.boolean().optional(),
  name: z.string().trim().min(1).max(80).optional()
}).refine(data => data.archived !== undefined || data.name !== undefined, {
  message: 'Provide name and/or archived'
})

export const itemPatchSchema = z.object({
  archived: z.boolean().optional(),
  name: z.string().trim().min(1).max(80).optional()
}).refine(data => data.archived !== undefined || data.name !== undefined, {
  message: 'Provide name and/or archived'
})

/** @deprecated Prefer categoryPatchSchema / itemPatchSchema */
export const archivePatchSchema = z.object({
  archived: z.boolean()
})

export type TransactionInput = z.infer<typeof transactionInputSchema>
export type CategoryInput = z.infer<typeof categoryInputSchema>
export type ItemInput = z.infer<typeof itemInputSchema>
