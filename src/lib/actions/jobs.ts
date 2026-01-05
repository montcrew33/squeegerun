"use server"

import { revalidatePath } from "next/cache"
import { createJob, updateJob, updateJobStatus, deleteJob } from "@/services/jobs"
import type { JobFormData } from "@/lib/validations/job"

export async function createJobAction(data: JobFormData) {
  try {
    const job = await createJob({
      customer_id: data.customer_id,
      service_address_id: data.service_address_id,
      scheduled_date: data.scheduled_date,
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
    const job = await updateJob(id, {
      customer_id: data.customer_id,
      service_address_id: data.service_address_id,
      scheduled_date: data.scheduled_date,
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