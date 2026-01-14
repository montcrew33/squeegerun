import { z } from 'zod'

export const customerSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  source: z.enum(['referral', 'online', 'walk-in', 'phone', 'other']).optional(),
  notes: z.string().optional().or(z.literal('')),
})

export const customerFormSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.union([
    z.string().email('Invalid email address'),
    z.string().length(0)
  ]).optional(),
  phone: z.union([
    z.string().min(10, 'Phone number must be at least 10 digits'),
    z.string().length(0)
  ]).optional(),
  status: z.enum(['active', 'inactive', 'prospect']),
  source: z.enum(['referral', 'online', 'walk-in', 'phone', 'other']).optional(),
  notes: z.string().optional().or(z.literal('')),
})

export type CustomerFormData = z.infer<typeof customerFormSchema>
export type Customer = z.infer<typeof customerSchema>

export const CUSTOMER_STATUSES = ['active', 'inactive', 'prospect'] as const
export const CUSTOMER_SOURCES = ['referral', 'online', 'walk-in', 'phone', 'other'] as const