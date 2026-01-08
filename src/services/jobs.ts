import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Job = Database['public']['Tables']['jobs']['Row']
type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type JobWithDetails = Job & {
  customer: Database['public']['Tables']['customers']['Row']
  service_address: Database['public']['Tables']['service_addresses']['Row']
  assigned_user?: Database['public']['Tables']['profiles']['Row'] | null
}

type JobFilters = {
  dateFrom?: string
  dateTo?: string
  status?: string
  customerId?: string
  assignedTo?: string
}

async function getUserOrganizationId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!(profile as any)?.organization_id) {
    throw new Error('User profile not found or missing organization')
  }

  return (profile as any).organization_id
}

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  return user.id
}

export async function getJobs(filters?: JobFilters): Promise<JobWithDetails[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(*),
      service_address:service_addresses(*),
      assigned_user:profiles(*)
    `)
    .eq('organization_id', organizationId)

  if (filters?.dateFrom) {
    query = query.gte('scheduled_date', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('scheduled_date', filters.dateTo)
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId)
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  query = query.order('scheduled_date', { ascending: true })
    .order('scheduled_time_start', { ascending: true, nullsFirst: false })

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch jobs: ${error.message}`)
  }

  return data || []
}

export async function getJob(id: string): Promise<JobWithDetails> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(*),
      service_address:service_addresses(*),
      assigned_user:profiles(*)
    `)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch job: ${error.message}`)
  }


  return job
}

export async function getJobsByDate(date: string): Promise<JobWithDetails[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(*),
      service_address:service_addresses(*),
      assigned_user:profiles(*)
    `)
    .eq('organization_id', organizationId)
    .eq('scheduled_date', date)
    .order('scheduled_time_start', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch jobs for date: ${error.message}`)
  }

  return data || []
}

export async function getJobsForWeek(startDate: string): Promise<JobWithDetails[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Calculate end date (6 days later)
  const start = new Date(startDate)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const endDate = end.toISOString().split('T')[0]!

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(*),
      service_address:service_addresses(*),
      assigned_user:profiles(*)
    `)
    .eq('organization_id', organizationId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_start', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch jobs for week: ${error.message}`)
  }

  return data || []
}

export async function getJobsForDateRange(startDate: string, endDate: string): Promise<JobWithDetails[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      customer:customers(*),
      service_address:service_addresses(*),
      assigned_user:profiles(*)
    `)
    .eq('organization_id', organizationId)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_start', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch jobs for date range: ${error.message}`)
  }

  return data || []
}

export async function createJob(data: Omit<JobInsert, 'organization_id'>): Promise<Job> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Ensure the date is exactly what the user selected  
  // Add explicit timezone to prevent PostgreSQL from converting it
  const explicitDate = data.scheduled_date.includes('T') 
    ? data.scheduled_date 
    : data.scheduled_date + 'T00:00:00-00:00'  // Add UTC timezone
  
  const jobData = {
    ...data,
    organization_id: organizationId,
    status: data.status || 'scheduled',
    // Use explicit timezone to prevent conversion
    scheduled_date: data.scheduled_date  // Keep original for now
  }

  const { data: job, error } = await (supabase
    .from('jobs') as any)
    .insert(jobData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create job: ${error.message}`)
  }

  // Log initial status to history
  if (job) {
    const userId = await getCurrentUserId()
    await (supabase
      .from('job_status_history') as any)
      .insert({
        job_id: job.id,
        new_status: job.status || 'scheduled',
        previous_status: null,
        changed_by: userId,
        notes: 'Job created'
      })
  }

  return job
}

export async function updateJob(id: string, data: Omit<JobUpdate, 'organization_id' | 'id'>): Promise<Job> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: job, error } = await (supabase
    .from('jobs') as any)
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update job: ${error.message}`)
  }

  return job
}

export async function updateJobStatus(id: string, status: string, notes?: string): Promise<Job> {
  const organizationId = await getUserOrganizationId()
  const userId = await getCurrentUserId()
  const supabase = await createClient()

  // Get current job to capture previous status
  const { data: currentJob, error: fetchError } = await supabase
    .from('jobs')
    .select('status')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (fetchError) {
    throw new Error(`Failed to fetch current job status: ${fetchError.message}`)
  }

  // Update job status
  const { data: job, error } = await (supabase
    .from('jobs') as any)
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update job status: ${error.message}`)
  }

  // Log status change to history
  if (job) {
    await (supabase
      .from('job_status_history') as any)
      .insert({
        job_id: job.id,
        new_status: status,
        previous_status: (currentJob as any).status,
        changed_by: userId,
        notes: notes || null
      })
  }

  return job
}

export async function deleteJob(id: string): Promise<void> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to delete job: ${error.message}`)
  }
}

// Helper function to get today's jobs count
export async function getTodaysJobsCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0]!
  const jobs = await getJobsByDate(today)
  return jobs.length
}

// Helper function to get this week's jobs count
export async function getWeekJobsCount(): Promise<number> {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  const startDate = startOfWeek.toISOString().split('T')[0]!
  
  const jobs = await getJobsForWeek(startDate)
  return jobs.length
}