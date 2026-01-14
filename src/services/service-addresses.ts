import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type ServiceAddress = Database['public']['Tables']['service_addresses']['Row']
type ServiceAddressInsert = Database['public']['Tables']['service_addresses']['Insert']
type ServiceAddressUpdate = Database['public']['Tables']['service_addresses']['Update']

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

export async function getServiceAddresses(customerId: string): Promise<ServiceAddress[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_addresses')
    .select('*')
    .eq('customer_id', customerId)
    .eq('organization_id', organizationId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch service addresses: ${error.message}`)
  }

  return data || []
}

export async function getAllServiceAddresses(): Promise<ServiceAddress[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('service_addresses')
    .select('*')
    .eq('organization_id', organizationId)
    .order('customer_id')
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch all service addresses: ${error.message}`)
  }

  return data || []
}

export async function getServiceAddress(id: string): Promise<ServiceAddress> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: serviceAddress, error } = await supabase
    .from('service_addresses')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch service address: ${error.message}`)
  }

  return serviceAddress
}

export async function createServiceAddress(data: Omit<ServiceAddressInsert, 'organization_id'>): Promise<ServiceAddress> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // If this is being set as primary, unset any existing primary address for this customer
  if (data.is_primary) {
    await (supabase
      .from('service_addresses') as any)
      .update({ is_primary: false })
      .eq('customer_id', data.customer_id)
      .eq('organization_id', organizationId)
      .eq('is_primary', true)
  }

  const { data: serviceAddress, error } = await (supabase
    .from('service_addresses') as any)
    .insert({
      ...data,
      organization_id: organizationId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create service address: ${error.message}`)
  }

  return serviceAddress
}

export async function updateServiceAddress(id: string, data: Omit<ServiceAddressUpdate, 'organization_id' | 'id'>): Promise<ServiceAddress> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Get the current address to check customer_id
  const currentAddress = await getServiceAddress(id)

  // If this is being set as primary, unset any existing primary address for this customer
  if (data.is_primary) {
    await (supabase
      .from('service_addresses') as any)
      .update({ is_primary: false })
      .eq('customer_id', currentAddress.customer_id)
      .eq('organization_id', organizationId)
      .eq('is_primary', true)
      .neq('id', id) // Don't unset the current address if it's already primary
  }

  const { data: serviceAddress, error } = await (supabase
    .from('service_addresses') as any)
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update service address: ${error.message}`)
  }

  return serviceAddress
}

export async function deleteServiceAddress(id: string): Promise<void> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('service_addresses')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to delete service address: ${error.message}`)
  }
}