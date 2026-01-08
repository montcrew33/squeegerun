import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type User = Database['public']['Tables']['profiles']['Row']

export async function getUserOrganizationId(): Promise<string> {
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

export async function getUsers(): Promise<User[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', organizationId)
    .order('full_name', { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return data || []
}