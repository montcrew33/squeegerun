"use server"

import { revalidatePath } from "next/cache"
import { createJob, updateJob, updateJobStatus, deleteJob } from "@/services/jobs"
import type { JobFormData } from "@/lib/validations/job"

// Helper function to ensure date is stored correctly regardless of timezone
function normalizeDate(dateString: string): string {
  // If the date is already in YYYY-MM-DD format, just return it
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  
  // For other formats, parse carefully to avoid timezone issues
  // Create date in local timezone and format manually
  const date = new Date(dateString + 'T12:00:00') // Add noon to avoid DST issues
  
  // Get the year, month, day in local timezone
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

export async function createJobAction(data: JobFormData) {
  try {
    const normalizedDate = normalizeDate(data.scheduled_date)
    
    const job = await createJob({
      customer_id: data.customer_id,
      service_address_id: data.service_address_id,
      scheduled_date: normalizedDate,
      scheduled_time_start: data.scheduled_time_start || null,
      scheduled_time_end: data.scheduled_time_end || null,
      price_cents: typeof data.price === 'number' ? Math.round(data.price * 100) : null,
      notes: data.notes || null,
      assigned_to: data.assigned_to || null,
    })

    revalidatePath("/jobs")
    revalidatePath("/dashboard")
    return { success: true, job }
  } catch (error) {
    console.error('Error creating job:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create job" 
    }
  }
}

export async function updateJobAction(id: string, data: JobFormData) {
  try {
    const normalizedDate = normalizeDate(data.scheduled_date)
    
    const job = await updateJob(id, {
      customer_id: data.customer_id,
      service_address_id: data.service_address_id,
      scheduled_date: normalizedDate,
      scheduled_time_start: data.scheduled_time_start || null,
      scheduled_time_end: data.scheduled_time_end || null,
      price_cents: typeof data.price === 'number' ? Math.round(data.price * 100) : null,
      notes: data.notes || null,
      assigned_to: data.assigned_to || null,
    })

    revalidatePath("/jobs")
    revalidatePath(`/jobs/${id}`)
    revalidatePath("/dashboard")
    return { success: true, job }
  } catch (error) {
    console.error('Error updating job:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update job" 
    }
  }
}

export async function updateJobStatusAction(id: string, status: string, notes?: string) {
  try {
    const job = await updateJobStatus(id, status, notes)
    
    revalidatePath("/jobs")
    revalidatePath(`/jobs/${id}`)
    revalidatePath("/dashboard")
    return { success: true, job }
  } catch (error) {
    console.error('Error updating job status:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update job status" 
    }
  }
}

export async function deleteJobAction(id: string) {
  try {
    await deleteJob(id)
    
    revalidatePath("/jobs")
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error('Error deleting job:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete job" 
    }
  }
}