import { z } from 'zod'

// AC-707-1: Form validation for adding carrier
export const addPreferredCarrierSchema = z.object({
  carrierId: z.string().uuid('Invalid carrier ID'),
  notes: z.string().max(500, 'Notes must be under 500 characters').optional().default(''),
})

export type AddPreferredCarrierFormValues = z.infer<typeof addPreferredCarrierSchema>
