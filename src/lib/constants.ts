export const APP_NAME = "SqueegeeRun"

export const JOB_STATUSES = ["scheduled", "in_progress", "completed", "cancelled"] as const

export const SERVICE_TYPES = ["exterior_windows", "interior_windows", "both", "gutters", "pressure_wash"] as const

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const

export const DEFAULT_TAX_RATE = 0

export const ITEMS_PER_PAGE = 20

// Rain Mode notification templates
export const RAIN_DELAY_EMAIL_TEMPLATE = `Hi [Name],

Due to weather conditions, we're rescheduling your window cleaning appointment from [Original Date] to [New Date].

No action is needed on your part - we'll see you at the new time! We appreciate your understanding.

Best regards,
Your Window Cleaning Team

Reply STOP to opt out of notifications.`

export const RAIN_DELAY_SMS_TEMPLATE = `Hi [Name]! Due to weather, we're moving your window cleaning from [Original Date] to [New Date]. No action needed - see you then! Reply STOP to opt out.`

// Notification types
export const NOTIFICATION_TYPES = [
  'rain_delay',
  'reminder', 
  'on_my_way',
  'invoice',
  'completion'
] as const

export const NOTIFICATION_CHANNELS = ['email', 'sms', 'both'] as const

// Derived TypeScript types
export type JobStatus = typeof JOB_STATUSES[number]
export type ServiceType = typeof SERVICE_TYPES[number]
export type InvoiceStatus = typeof INVOICE_STATUSES[number]
export type NotificationType = typeof NOTIFICATION_TYPES[number]
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[number]