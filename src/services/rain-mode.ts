import { createClient } from '@/lib/supabase/server'
import { updateJobStatus } from './jobs'
import { getUserOrganizationId } from './users'
import { format } from 'date-fns'

export interface JobForReschedule {
  id: string
  customer_id: string
  scheduled_date: string
  scheduled_time_start?: string
  scheduled_time_end?: string
  price_cents?: number
  customer: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  service_address: {
    id: string
    label?: string
    street_address: string
    city: string
    state: string
    postal_code: string
  }
}

export interface RescheduleResult {
  success: number
  failed: number
  notificationsSent: number
  errors: string[]
}

export async function getJobsForDate(
  organizationId: string,
  date: string
): Promise<JobForReschedule[]> {
  const supabase = await createClient()

  // Format the date to ensure we're querying the correct day
  // Use the date string directly if it's already in YYYY-MM-DD format
  const dateStr = date.includes('-') ? date : format(new Date(date), 'yyyy-MM-dd')

  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      id,
      customer_id,
      scheduled_date,
      scheduled_time_start,
      scheduled_time_end,
      price_cents,
      customer:customers!inner (
        id,
        name,
        email,
        phone
      ),
      service_address:service_addresses!inner (
        id,
        label,
        street_address,
        city,
        state,
        postal_code
      )
    `)
    .eq('organization_id', organizationId)
    .eq('scheduled_date', dateStr)
    .not('status', 'in', '("cancelled", "completed")')
    .order('scheduled_time_start', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching jobs for date:', error)
    throw new Error(`Failed to fetch jobs: ${error.message}`)
  }

  return (jobs as unknown as JobForReschedule[]) || []
}

export async function getJobsForDateByUser(date: string): Promise<JobForReschedule[]> {
  const organizationId = await getUserOrganizationId()
  return getJobsForDate(organizationId, date)
}

export async function bulkRescheduleJobs(
  jobIds: string[],
  newDate: string,
  notifyCustomers: boolean = false,
  message?: string
): Promise<RescheduleResult> {
  const supabase = await createClient()
  const organizationId = await getUserOrganizationId()

  const result: RescheduleResult = {
    success: 0,
    failed: 0,
    notificationsSent: 0,
    errors: []
  }

  if (jobIds.length === 0) {
    return result
  }

  try {
    // Start a transaction by doing all updates in sequence
    // First, update all job dates
    const { data: updatedJobs, error: updateError } = await supabase
      .from('jobs')
      .update({ 
        scheduled_date: newDate.includes('-') ? newDate : format(new Date(newDate), 'yyyy-MM-dd'),
        updated_at: new Date().toISOString()
      })
      .eq('organization_id', organizationId)
      .in('id', jobIds)
      .select(`
        id,
        customer_id,
        scheduled_date,
        customer:customers (
          id,
          name,
          email,
          phone
        )
      `)

    if (updateError) {
      result.errors.push(`Failed to update jobs: ${updateError.message}`)
      result.failed = jobIds.length
      return result
    }

    result.success = updatedJobs?.length || 0

    // Add status history entries for each job
    for (const job of updatedJobs || []) {
      try {
        await updateJobStatus(
          job.id,
          'scheduled', // Keep status as scheduled, but add history entry
          'Rescheduled due to weather delay'
        )
      } catch (error) {
        console.warn(`Failed to add status history for job ${job.id}:`, error)
        // Don't fail the whole operation for status history issues
      }
    }

    // If notifications are requested, create them
    if (notifyCustomers && message && updatedJobs) {
      const notifications = updatedJobs.map(job => ({
        customer_id: job.customer_id,
        job_id: job.id,
        type: 'rain_delay' as const,
        channel: 'email' as const, // Default to email for MVP
        message: message
          .replace(/\[Name\]/g, job.customer?.name || 'Customer')
          .replace(/\[Original Date\]/g, format(new Date(), 'EEEE, MMMM d'))
          .replace(/\[New Date\]/g, format(new Date(newDate), 'EEEE, MMMM d')),
        scheduled_for: new Date().toISOString() // Send immediately
      }))

      // Import here to avoid circular dependency
      const { bulkCreateNotifications } = await import('./notifications')
      
      try {
        const notificationResult = await bulkCreateNotifications(notifications)
        result.notificationsSent = notificationResult.success
        
        if (notificationResult.failed > 0) {
          result.errors.push(...notificationResult.errors)
        }
      } catch (error) {
        result.errors.push(`Failed to create notifications: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

  } catch (error) {
    result.errors.push(`Bulk reschedule failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    result.failed = jobIds.length
    result.success = 0
  }

  return result
}

export async function getTodaysJobs(): Promise<JobForReschedule[]> {
  const today = format(new Date(), 'yyyy-MM-dd')
  return getJobsForDateByUser(today)
}

export async function getJobsCountForDate(date: string): Promise<number> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const dateStr = format(new Date(date), 'yyyy-MM-dd')

  const { count, error } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('scheduled_date', dateStr)
    .not('status', 'in', '("cancelled", "completed")')

  if (error) {
    console.error('Error counting jobs for date:', error)
    return 0
  }

  return count || 0
}