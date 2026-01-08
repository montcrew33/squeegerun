import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from './users'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type Organization = Database['public']['Tables']['organizations']['Row']
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type ProfileWithDetails = Profile & {
  organizations?: Organization
}

export interface BusinessSettings {
  tax_rate?: number
  invoice_due_days?: number
  invoice_notes_template?: string
}

export interface OrganizationWithSettings extends Organization {
  settings: BusinessSettings
}

export interface BusinessFormData {
  name: string
  phone?: string | null
  email?: string | null
  street_address?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  tax_rate: number
  invoice_due_days: number
  invoice_notes_template?: string | null
}

// Profile operations
export async function getProfile(userId: string): Promise<ProfileWithDetails> {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(`
      *,
      organizations (*)
    `)
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    throw new Error(`Failed to fetch profile: ${error.message}`)
  }

  return profile as unknown as ProfileWithDetails
}

export async function getCurrentUserProfile(): Promise<ProfileWithDetails> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  return getProfile(user.id)
}

export async function updateProfile(userId: string, data: Partial<ProfileUpdate>): Promise<Profile> {
  const supabase = await createClient()

  const updateData: ProfileUpdate = {
    ...data,
    updated_at: new Date().toISOString()
  }

  const { data: profile, error } = await (supabase
    .from('profiles') as any)
    .update(updateData)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    throw new Error(`Failed to update profile: ${error.message}`)
  }

  return profile
}

// Organization operations
export async function getOrganization(orgId: string): Promise<OrganizationWithSettings> {
  const supabase = await createClient()

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()

  if (error) {
    console.error('Error fetching organization:', error)
    throw new Error(`Failed to fetch organization: ${error.message}`)
  }

  return {
    ...(organization as any),
    settings: ((organization as any).settings as BusinessSettings) || {}
  }
}

export async function getCurrentUserOrganization(): Promise<OrganizationWithSettings> {
  const organizationId = await getUserOrganizationId()
  return getOrganization(organizationId)
}

export async function updateOrganization(orgId: string, data: Partial<OrganizationUpdate>): Promise<Organization> {
  const supabase = await createClient()

  const updateData: OrganizationUpdate = {
    ...data,
    updated_at: new Date().toISOString()
  }

  const { data: organization, error } = await (supabase
    .from('organizations') as any)
    .update(updateData)
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Error updating organization:', error)
    throw new Error(`Failed to update organization: ${error.message}`)
  }

  return organization
}

export async function updateOrganizationSettings(orgId: string, settings: BusinessSettings): Promise<Organization> {
  const supabase = await createClient()

  // Get current organization to merge settings
  const currentOrg = await getOrganization(orgId)
  const mergedSettings = {
    ...currentOrg.settings,
    ...settings
  }

  const { data: organization, error } = await supabase
    .from('organizations')
    .update({
      settings: mergedSettings,
      updated_at: new Date().toISOString()
    })
    .eq('id', orgId)
    .select()
    .single()

  if (error) {
    console.error('Error updating organization settings:', error)
    throw new Error(`Failed to update organization settings: ${error.message}`)
  }

  return organization
}

export async function updateBusinessInfo(data: BusinessFormData): Promise<Organization> {
  const organizationId = await getUserOrganizationId()
  
  // Extract settings from form data
  const { tax_rate, invoice_due_days, invoice_notes_template, ...organizationData } = data
  
  // Convert tax rate percentage to decimal for storage
  const settings: BusinessSettings = {
    tax_rate: tax_rate / 100, // Convert percentage to decimal
    invoice_due_days,
    invoice_notes_template
  }

  // Update organization basic info
  const organization = await updateOrganization(organizationId, organizationData)
  
  // Update organization settings
  await updateOrganizationSettings(organizationId, settings)
  
  return organization
}

// Password change operation (uses Supabase Auth)
export async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const supabase = await createClient()
  
  // First, verify the current password by signing in
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) {
    throw new Error('User email not found')
  }

  // Verify current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    throw new Error('Current password is incorrect')
  }

  // Update to new password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) {
    console.error('Error updating password:', updateError)
    throw new Error(`Failed to update password: ${updateError.message}`)
  }
}

// Helper functions
export function getBusinessSettingsWithDefaults(settings: BusinessSettings = {}): BusinessSettings {
  return {
    tax_rate: settings.tax_rate ?? 0.0825, // Default 8.25%
    invoice_due_days: settings.invoice_due_days ?? 14,
    invoice_notes_template: settings.invoice_notes_template ?? 'Thank you for your business! Payment is due within the specified timeframe.'
  }
}

export function formatBusinessDataForForm(organization: OrganizationWithSettings): BusinessFormData {
  const settings = getBusinessSettingsWithDefaults(organization.settings)
  
  return {
    name: organization.name || '',
    phone: organization.phone || null,
    email: organization.email || null,
    street_address: organization.street_address || null,
    city: organization.city || null,
    state: organization.state || null,
    postal_code: organization.postal_code || null,
    tax_rate: (settings.tax_rate || 0) * 100, // Convert decimal to percentage for form
    invoice_due_days: settings.invoice_due_days || 14,
    invoice_notes_template: settings.invoice_notes_template || null
  }
}