import { z } from 'zod'

// Profile schema for user profile updates
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100, 'Full name is too long'),
  phone: z.string().optional().nullable()
})

// Password change schema with confirmation validation
export const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirm_password: z.string().min(1, 'Please confirm your password')
})
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"]
  })

// Business/organization schema
export const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Business name is too long'),
  phone: z.string().optional().nullable(),
  email: z.string().email('Invalid email address').optional().nullable(),
  street_address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postal_code: z.string().optional().nullable(),
  tax_rate: z.number()
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%')
    .default(0),
  invoice_due_days: z.number()
    .int('Invoice due days must be a whole number')
    .min(1, 'Invoice due days must be at least 1')
    .max(365, 'Invoice due days cannot exceed 365')
    .default(14),
  invoice_notes_template: z.string().optional().nullable()
})

// Type exports
export type ProfileFormData = z.infer<typeof profileSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
export type BusinessFormData = z.infer<typeof businessSchema>

// Default values
export const DEFAULT_BUSINESS_SETTINGS = {
  tax_rate: 8.25, // Default 8.25% tax rate
  invoice_due_days: 14,
  invoice_notes_template: 'Thank you for your business! Payment is due within the specified timeframe.'
}

// Validation helpers
export function validateTaxRate(rate: number): boolean {
  return rate >= 0 && rate <= 100
}

export function validateInvoiceDueDays(days: number): boolean {
  return Number.isInteger(days) && days >= 1 && days <= 365
}

// Convert percentage to decimal for storage (e.g., 8.25% -> 0.0825)
export function percentageToDecimal(percentage: number): number {
  return percentage / 100
}

// Convert decimal to percentage for display (e.g., 0.0825 -> 8.25%)
export function decimalToPercentage(decimal: number): number {
  return decimal * 100
}

// Form field configurations
export const PROFILE_FIELDS = {
  full_name: {
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true
  },
  phone: {
    label: 'Phone Number',
    placeholder: '(555) 123-4567',
    required: false
  }
} as const

export const BUSINESS_FIELDS = {
  name: {
    label: 'Business Name',
    placeholder: 'Your Business Name',
    required: true
  },
  phone: {
    label: 'Business Phone',
    placeholder: '(555) 123-4567',
    required: false
  },
  email: {
    label: 'Business Email',
    placeholder: 'business@example.com',
    required: false
  },
  street_address: {
    label: 'Street Address',
    placeholder: '123 Main Street',
    required: false
  },
  city: {
    label: 'City',
    placeholder: 'San Francisco',
    required: false
  },
  state: {
    label: 'State',
    placeholder: 'CA',
    required: false
  },
  postal_code: {
    label: 'ZIP Code',
    placeholder: '94102',
    required: false
  },
  tax_rate: {
    label: 'Default Tax Rate (%)',
    placeholder: '8.25',
    required: false
  },
  invoice_due_days: {
    label: 'Default Invoice Due Days',
    placeholder: '14',
    required: false
  },
  invoice_notes_template: {
    label: 'Default Invoice Notes',
    placeholder: 'Thank you for your business!',
    required: false
  }
} as const