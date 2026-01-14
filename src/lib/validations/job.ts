import { z } from 'zod'

export const jobSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  service_address_id: z.string().uuid('Invalid service address ID'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_time_start: z.string().optional().or(z.literal('')),
  scheduled_time_end: z.string().optional().or(z.literal('')),
  status: z.enum(['scheduled', 'en_route', 'in_progress', 'completed', 'cancelled', 'no_show']).default('scheduled'),
  price_cents: z.number().int().min(0).optional(),
  notes: z.string().optional().or(z.literal('')),
  assigned_to: z.string().uuid().optional().or(z.literal('')),
})

export const jobFormSchema = z.object({
  customer_id: z.string().min(1, 'Please select a customer'),
  service_address_id: z.string().min(1, 'Please select a service address'),
  scheduled_date: z.string().min(1, 'Scheduled date is required'),
  scheduled_time_start: z.string().optional().or(z.literal('')),
  scheduled_time_end: z.string().optional().or(z.literal('')),
  price: z.union([
    z.number().min(0, 'Price must be 0 or greater'),
    z.string().transform((val) => val === '' ? 0 : parseFloat(val))
  ]).optional(),
  notes: z.string().optional().or(z.literal('')),
  assigned_to: z.string().optional().or(z.literal('')),
}).refine((data) => {
  // If both start and end times are provided, end should be after start
  if (data.scheduled_time_start && data.scheduled_time_end) {
    return data.scheduled_time_end > data.scheduled_time_start
  }
  return true
}, {
  message: "End time must be after start time",
  path: ["scheduled_time_end"],
})

export type JobFormData = z.infer<typeof jobFormSchema>
export type Job = z.infer<typeof jobSchema>

export const JOB_STATUSES = [
  'scheduled', 
  'en_route', 
  'in_progress', 
  'completed', 
  'cancelled', 
  'no_show'
] as const

export const JOB_STATUS_LABELS = {
  scheduled: 'Scheduled',
  en_route: 'En Route',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show'
} as const

export const JOB_STATUS_COLORS = {
  scheduled: 'blue',
  en_route: 'yellow',
  in_progress: 'orange',
  completed: 'green',
  cancelled: 'gray',
  no_show: 'red'
} as const