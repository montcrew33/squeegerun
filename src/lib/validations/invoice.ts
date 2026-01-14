import { z } from "zod"

// Line item schema
export const lineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit_price_cents: z.number().min(0, "Unit price must be positive"),
  total_cents: z.number().min(0, "Total must be positive")
})

// Invoice schema
export const invoiceSchema = z.object({
  customer_id: z.string().uuid("Customer is required"),
  job_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled']).default('draft'),
  line_items: z.array(lineItemSchema).min(1, "At least one line item is required"),
  subtotal_cents: z.number().min(0, "Subtotal must be positive"),
  tax_rate: z.number().min(0).max(1, "Tax rate must be between 0 and 1"),
  tax_cents: z.number().min(0, "Tax amount must be positive"),
  total_cents: z.number().min(0, "Total must be positive"),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  notes: z.string().optional()
})
  .refine((data) => {
    // Validate that due date is after issued date
    return new Date(data.due_date) >= new Date(data.issued_date)
  }, {
    message: "Due date must be on or after issued date",
    path: ["due_date"]
  })
  .refine((data) => {
    // Validate subtotal calculation
    const calculatedSubtotal = data.line_items.reduce((sum, item) => sum + item.total_cents, 0)
    return Math.abs(calculatedSubtotal - data.subtotal_cents) < 1 // Allow 1 cent rounding difference
  }, {
    message: "Subtotal must equal sum of line item totals",
    path: ["subtotal_cents"]
  })
  .refine((data) => {
    // Validate tax calculation
    const calculatedTax = Math.round(data.subtotal_cents * data.tax_rate)
    return Math.abs(calculatedTax - data.tax_cents) < 1 // Allow 1 cent rounding difference
  }, {
    message: "Tax amount must equal subtotal × tax rate",
    path: ["tax_cents"]
  })
  .refine((data) => {
    // Validate total calculation
    const calculatedTotal = data.subtotal_cents + data.tax_cents
    return calculatedTotal === data.total_cents
  }, {
    message: "Total must equal subtotal + tax",
    path: ["total_cents"]
  })

// Update invoice schema (all fields optional, no refinements to allow partial updates)
export const updateInvoiceSchema = z.object({
  customer_id: z.string().uuid("Customer is required").optional(),
  job_id: z.string().uuid().optional(),
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled']).optional(),
  line_items: z.array(lineItemSchema).min(1).optional(),
  subtotal_cents: z.number().min(0, "Subtotal must be positive").optional(),
  tax_rate: z.number().min(0).max(1, "Tax rate must be between 0 and 1").optional(),
  tax_cents: z.number().min(0, "Tax amount must be positive").optional(),
  total_cents: z.number().min(0, "Total must be positive").optional(),
  issued_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  notes: z.string().optional()
})

// Invoice filters schema
export const invoiceFiltersSchema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'partial', 'overdue', 'cancelled']).optional(),
  customer_id: z.string().uuid().optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})

// Payment record schema (for future use)
export const paymentSchema = z.object({
  invoice_id: z.string().uuid(),
  amount_cents: z.number().min(1, "Payment amount must be greater than 0"),
  payment_method: z.enum(['cash', 'check', 'credit_card', 'bank_transfer', 'other']),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reference_number: z.string().optional(),
  notes: z.string().optional()
})

// Type exports
export type InvoiceFormData = z.infer<typeof invoiceSchema>
export type UpdateInvoiceFormData = z.infer<typeof updateInvoiceSchema>
export type LineItemFormData = z.infer<typeof lineItemSchema>
export type InvoiceFiltersData = z.infer<typeof invoiceFiltersSchema>
export type PaymentFormData = z.infer<typeof paymentSchema>

// Status configurations
export const INVOICE_STATUS_CONFIG = {
  draft: {
    label: 'Draft',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Invoice is being prepared'
  },
  sent: {
    label: 'Sent',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Invoice has been sent to customer'
  },
  viewed: {
    label: 'Viewed',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Customer has viewed the invoice'
  },
  paid: {
    label: 'Paid',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Invoice has been paid in full'
  },
  partial: {
    label: 'Partial',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Invoice has been partially paid'
  },
  overdue: {
    label: 'Overdue',
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Invoice is past due date'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Invoice has been cancelled'
  }
} as const

// Payment methods
export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'check', label: 'Check' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' }
] as const

// Helper functions
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

export function dollarsToMoney(cents: number): string {
  return cents === 0 ? '0.00' : (cents / 100).toFixed(2)
}

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2)
}

export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === 'string' ? parseFloat(dollars) : dollars
  return Math.round((amount || 0) * 100)
}

export function calculateLineTotal(quantity: number, unitPriceCents: number): number {
  return Math.round(quantity * unitPriceCents)
}

export function calculateSubtotal(lineItems: LineItemFormData[]): number {
  return lineItems.reduce((sum, item) => sum + item.total_cents, 0)
}

export function calculateTax(subtotalCents: number, taxRate: number): number {
  return Math.round(subtotalCents * taxRate)
}

export function calculateTotal(subtotalCents: number, taxCents: number): number {
  return subtotalCents + taxCents
}

// Validation helpers
export function isInvoiceEditable(status: string): boolean {
  return status === 'draft'
}

export function isInvoiceDeletable(status: string): boolean {
  return status === 'draft'
}

export function canMarkAsSent(status: string): boolean {
  return status === 'draft'
}

export function canMarkAsPaid(status: string): boolean {
  return ['sent', 'viewed', 'partial', 'overdue'].includes(status)
}

// Date helpers
export function getDefaultDueDate(issuedDate?: string): string {
  const issued = issuedDate ? new Date(issuedDate) : new Date()
  const due = new Date(issued)
  due.setDate(due.getDate() + 14) // 14 days default
  return due.toISOString().split('T')[0] || ''
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (['paid', 'cancelled'].includes(status)) return false
  return new Date(dueDate) < new Date()
}

// Invoice number validation
export function isValidInvoiceNumber(invoiceNumber: string): boolean {
  // Format: INV-YYYY-NNNN
  return /^INV-\d{4}-\d{4}$/.test(invoiceNumber)
}