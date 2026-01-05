export const APP_NAME = "SqueegeeRun"

export const JOB_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"] as const

export const SERVICE_TYPES = ["exterior_windows", "interior_windows", "both", "gutters", "pressure_wash"] as const

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const

export const DEFAULT_TAX_RATE = 0

export const ITEMS_PER_PAGE = 20

// Derived TypeScript types
export type JobStatus = typeof JOB_STATUSES[number]
export type ServiceType = typeof SERVICE_TYPES[number]
export type InvoiceStatus = typeof INVOICE_STATUSES[number]