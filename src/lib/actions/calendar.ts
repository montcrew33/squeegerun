"use server"

import { getJobsForDateRange } from "@/services/jobs"

export async function getJobsForDateRangeAction(startDate: string, endDate: string) {
  try {
    const jobs = await getJobsForDateRange(startDate, endDate)
    return { success: true, jobs }
  } catch (error) {
    console.error('Error fetching jobs for date range:', error)
    return { 
      success: false as const, 
      error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      jobs: []
    }
  }
}