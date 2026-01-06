"use server"

import { revalidatePath } from "next/cache"
import { getJobsForDateByUser, bulkRescheduleJobs, type RescheduleResult } from "@/services/rain-mode"
import { format, addDays } from "date-fns"

export interface RainModeOptions {
  notify: boolean
  customMessage?: string
  channel?: 'email' | 'sms' | 'both'
}

export interface RainModeResult extends RescheduleResult {
  originalDate: string
  newDate: string
  totalJobs: number
}

export async function rainModeRescheduleAction(
  originalDate: string,
  newDate: string,
  selectedJobIds: string[],
  options: RainModeOptions
): Promise<RainModeResult> {
  try {
    // Validate dates
    const origDate = new Date(originalDate)
    const rescheduleDate = new Date(newDate)
    
    if (isNaN(origDate.getTime()) || isNaN(rescheduleDate.getTime())) {
      throw new Error('Invalid date provided')
    }

    // Don't allow rescheduling to the past (except today)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (rescheduleDate < today) {
      throw new Error('Cannot reschedule jobs to a past date')
    }

    // Get the default message if notification is enabled but no custom message provided
    let notificationMessage = options.customMessage
    
    if (options.notify && !notificationMessage) {
      // Import default template
      const { RAIN_DELAY_EMAIL_TEMPLATE } = await import('@/lib/constants')
      notificationMessage = RAIN_DELAY_EMAIL_TEMPLATE
    }

    // Perform the bulk reschedule
    const result = await bulkRescheduleJobs(
      selectedJobIds,
      newDate,
      options.notify,
      notificationMessage
    )

    // Revalidate relevant pages
    revalidatePath('/jobs')
    revalidatePath('/dashboard')
    revalidatePath('/jobs/tools/rain-mode')

    return {
      ...result,
      originalDate: format(origDate, 'yyyy-MM-dd'),
      newDate: format(rescheduleDate, 'yyyy-MM-dd'),
      totalJobs: selectedJobIds.length
    }

  } catch (error) {
    console.error('Rain Mode reschedule error:', error)
    
    return {
      success: 0,
      failed: selectedJobIds.length,
      notificationsSent: 0,
      errors: [error instanceof Error ? error.message : 'An unexpected error occurred'],
      originalDate: originalDate,
      newDate: newDate,
      totalJobs: selectedJobIds.length
    }
  }
}

export async function getJobsForRainModeAction(date: string) {
  try {
    const jobs = await getJobsForDateByUser(date)
    return {
      success: true,
      jobs,
      count: jobs.length
    }
  } catch (error) {
    console.error('Error fetching jobs for rain mode:', error)
    return {
      success: false,
      jobs: [],
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch jobs'
    }
  }
}

// Helper function to get suggested reschedule dates
export async function getSuggestedDates(originalDate: string) {
  const original = new Date(originalDate)
  
  return {
    tomorrow: format(addDays(original, 1), 'yyyy-MM-dd'),
    nextWeek: format(addDays(original, 7), 'yyyy-MM-dd'),
    nextSameDay: format(addDays(original, 7), 'yyyy-MM-dd') // Same as next week for now
  }
}