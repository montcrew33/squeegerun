import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from './users'

export interface Notification {
  id: string
  organization_id: string
  customer_id: string
  job_id?: string
  type: 'rain_delay' | 'reminder' | 'on_my_way' | 'invoice' | 'completion'
  channel: 'email' | 'sms' | 'both'
  message: string
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  scheduled_for: string
  sent_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface CreateNotificationData {
  customer_id: string
  job_id?: string
  type: Notification['type']
  channel?: Notification['channel']
  message: string
  scheduled_for?: string
}

export async function createNotification(data: CreateNotificationData): Promise<Notification> {
  const supabase = await createClient()
  const organizationId = await getUserOrganizationId()

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      organization_id: organizationId,
      customer_id: data.customer_id,
      job_id: data.job_id || null,
      type: data.type,
      channel: data.channel || 'email',
      message: data.message,
      scheduled_for: data.scheduled_for || new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating notification:', error)
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return notification
}

export async function bulkCreateNotifications(
  notifications: CreateNotificationData[]
): Promise<{ success: number; failed: number; errors: string[] }> {
  const supabase = await createClient()
  const organizationId = await getUserOrganizationId()

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Process notifications in batches to avoid overwhelming the database
  const batchSize = 10
  
  for (let i = 0; i < notifications.length; i += batchSize) {
    const batch = notifications.slice(i, i + batchSize)
    
    const insertData = batch.map(notification => ({
      organization_id: organizationId,
      customer_id: notification.customer_id,
      job_id: notification.job_id || null,
      type: notification.type,
      channel: notification.channel || 'email',
      message: notification.message,
      scheduled_for: notification.scheduled_for || new Date().toISOString(),
    }))

    try {
      const { error } = await supabase
        .from('notifications')
        .insert(insertData)

      if (error) {
        results.failed += batch.length
        results.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`)
      } else {
        results.success += batch.length
      }
    } catch (error) {
      results.failed += batch.length
      results.errors.push(`Batch ${i / batchSize + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return results
}

export async function getNotificationQueue(
  status: Notification['status'] = 'pending'
): Promise<Notification[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganizationId()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', status)
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })

  if (error) {
    console.error('Error fetching notification queue:', error)
    throw new Error(`Failed to fetch notification queue: ${error.message}`)
  }

  return notifications || []
}

export async function markNotificationSent(
  id: string,
  sentAt?: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({
      status: 'sent',
      sent_at: sentAt || new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as sent:', error)
    throw new Error(`Failed to mark notification as sent: ${error.message}`)
  }
}

export async function markNotificationFailed(
  id: string,
  errorMessage: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({
      status: 'failed',
      error_message: errorMessage,
    })
    .eq('id', id)

  if (error) {
    console.error('Error marking notification as failed:', error)
    throw new Error(`Failed to mark notification as failed: ${error.message}`)
  }
}

export async function getCustomerNotifications(
  customerId: string,
  limit = 50
): Promise<Notification[]> {
  const supabase = await createClient()
  const organizationId = await getUserOrganizationId()

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching customer notifications:', error)
    throw new Error(`Failed to fetch customer notifications: ${error.message}`)
  }

  return notifications || []
}

export async function cancelNotification(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'pending') // Only cancel pending notifications

  if (error) {
    console.error('Error cancelling notification:', error)
    throw new Error(`Failed to cancel notification: ${error.message}`)
  }
}