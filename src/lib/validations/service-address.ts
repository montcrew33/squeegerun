import { z } from 'zod'

export const serviceAddressSchema = z.object({
  street_address: z.string().min(1, 'Street address is required'),
  unit: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().optional().or(z.literal('')),
  label: z.string().optional().or(z.literal('')),
  access_notes: z.string().optional().or(z.literal('')),
  property_type: z.enum(['residential', 'commercial']).optional(),
  window_count: z.number().int().min(0).optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_primary: z.boolean().default(false),
})

export const serviceAddressFormSchema = z.object({
  street_address: z.string().min(1, 'Street address is required'),
  unit: z.string().optional().or(z.literal('')),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().optional().or(z.literal('')),
  label: z.string().optional().or(z.literal('')),
  access_notes: z.string().optional().or(z.literal('')),
  property_type: z.enum(['residential', 'commercial']).optional(),
  window_count: z.union([
    z.number().int().min(0, 'Window count must be 0 or greater'),
    z.string().transform((val) => val === '' ? undefined : parseInt(val, 10))
  ]).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_primary: z.boolean().default(false),
})

export type ServiceAddressFormData = z.infer<typeof serviceAddressFormSchema>
export type ServiceAddress = z.infer<typeof serviceAddressSchema>

export const PROPERTY_TYPES = ['residential', 'commercial'] as const
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const