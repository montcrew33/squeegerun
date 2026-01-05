import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

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

  if (!profile?.organization_id) {
    throw new Error('User profile not found or missing organization')
  }

  return profile.organization_id
}

export async function getCustomers(): Promise<Customer[]> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return data || []
}

export async function getCustomer(id: string): Promise<Customer & { service_addresses: Database['public']['Tables']['service_addresses']['Row'][] }> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (customerError) {
    throw new Error(`Failed to fetch customer: ${customerError.message}`)
  }

  const { data: serviceAddresses, error: addressError } = await supabase
    .from('service_addresses')
    .select('*')
    .eq('customer_id', id)
    .eq('organization_id', organizationId)
    .order('is_primary', { ascending: false })

  if (addressError) {
    throw new Error(`Failed to fetch service addresses: ${addressError.message}`)
  }

  return {
    ...customer,
    service_addresses: serviceAddresses || []
  }
}

export async function createCustomer(data: Omit<CustomerInsert, 'organization_id'>): Promise<Customer> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      ...data,
      organization_id: organizationId
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`)
  }

  return customer
}

export async function updateCustomer(id: string, data: Omit<CustomerUpdate, 'organization_id' | 'id'>): Promise<Customer> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`)
  }

  return customer
}

export async function deleteCustomer(id: string): Promise<void> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    throw new Error(`Failed to delete customer: ${error.message}`)
  }
}