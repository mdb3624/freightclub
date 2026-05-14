import { z } from 'zod';

export const shipperProfileFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(120),
  billingEmail: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^\(\d{3}\)\s?\d{3}-\d{4}$/, 'Phone format: (XXX) XXX-XXXX'),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().regex(/^[A-Z]{2}$/, 'State must be a valid 2-letter code'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  mcNumber: z.string().max(8).optional().or(z.literal('')),
  usdotNumber: z.string().max(8).optional().or(z.literal('')),
  logoUrl: z.string().url('Invalid URL').max(500).optional().or(z.literal('')),
});

export type ShipperProfileFormData = z.infer<typeof shipperProfileFormSchema>;

export const shipperProfileDTOSchema = shipperProfileFormSchema.extend({
  id: z.string(),
  completenessPercent: z.number().int().min(0).max(100),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export type ShipperProfileDTO = z.infer<typeof shipperProfileDTOSchema>;

export const completenessResponseSchema = z.object({
  completenessPercent: z.number().int().min(0).max(100),
  isPublishReady: z.boolean(),
  remainingFields: z.array(z.string()),
});

export type CompletenessResponse = z.infer<typeof completenessResponseSchema>;
