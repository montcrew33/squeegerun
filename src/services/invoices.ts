import { createClient } from '@/lib/supabase/server'
import { getUserOrganizationId } from './users'
import { getJob } from './jobs'
import type { Database } from '@/types/database.types'

type Invoice = Database['public']['Tables']['invoices']['Row']
type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']
type InvoiceLineItem = Database['public']['Tables']['invoice_line_items']['Row']
type InvoiceLineItemInsert = Database['public']['Tables']['invoice_line_items']['Insert']

export type InvoiceWithDetails = Invoice & {
  customer: Database['public']['Tables']['customers']['Row']
  line_items: InvoiceLineItem[]
  job?: Database['public']['Tables']['jobs']['Row'] | null
}

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'partial' | 'overdue' | 'cancelled'

export interface InvoiceFilters {
  status?: InvoiceStatus
  customer_id?: string
  dateFrom?: string
  dateTo?: string
}

export interface LineItemData {
  description: string
  quantity: number
  unit_price_cents: number
  total_cents: number
}

export interface CreateInvoiceData {
  customer_id: string
  job_id?: string
  status?: InvoiceStatus
  line_items: LineItemData[]
  subtotal_cents: number
  tax_rate: number
  tax_cents: number
  total_cents: number
  issued_date: string
  due_date: string
  notes?: string
}

export async function generateInvoiceNumber(organizationId: string): Promise<string> {
  const supabase = await createClient()
  const currentYear = new Date().getFullYear()
  
  // Get the count of invoices for this year
  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .gte('created_at', `${currentYear}-01-01T00:00:00.000Z`)
    .lt('created_at', `${currentYear + 1}-01-01T00:00:00.000Z`)

  if (error) {
    console.error('Error counting invoices:', error)
    throw new Error(`Failed to generate invoice number: ${error.message}`)
  }

  const nextNumber = (count || 0) + 1
  return `INV-${currentYear}-${nextNumber.toString().padStart(4, '0')}`
}

export async function getInvoices(organizationId?: string, filters?: InvoiceFilters): Promise<InvoiceWithDetails[]> {
  const orgId = organizationId || await getUserOrganizationId()
  const supabase = await createClient()

  let query = supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      line_items:invoice_line_items(*),
      job:jobs(*)
    `)
    .eq('organization_id', orgId)

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.customer_id) {
    query = query.eq('customer_id', filters.customer_id)
  }

  if (filters?.dateFrom) {
    query = query.gte('issued_date', filters.dateFrom)
  }

  if (filters?.dateTo) {
    query = query.lte('issued_date', filters.dateTo)
  }

  query = query.order('created_at', { ascending: false })

  const { data: invoices, error } = await query

  if (error) {
    console.error('Error fetching invoices:', error)
    throw new Error(`Failed to fetch invoices: ${error.message}`)
  }

  return (invoices as unknown as InvoiceWithDetails[]) || []
}

export async function getInvoice(id: string): Promise<InvoiceWithDetails> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(*),
      line_items:invoice_line_items(*),
      job:jobs(*)
    `)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    throw new Error(`Failed to fetch invoice: ${error.message}`)
  }

  return invoice as unknown as InvoiceWithDetails
}

export async function getInvoicesForCustomer(customerId: string): Promise<InvoiceWithDetails[]> {
  return getInvoices(undefined, { customer_id: customerId })
}

export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber(organizationId)

  // Create invoice
  const invoiceData: InvoiceInsert = {
    organization_id: organizationId,
    customer_id: data.customer_id,
    job_id: data.job_id || null,
    invoice_number: invoiceNumber,
    status: data.status || 'draft',
    subtotal_cents: data.subtotal_cents,
    tax_rate: data.tax_rate,
    tax_cents: data.tax_cents,
    total_cents: data.total_cents,
    issued_date: data.issued_date,
    due_date: data.due_date,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError)
    throw new Error(`Failed to create invoice: ${invoiceError.message}`)
  }

  // Create line items
  const lineItemsData: InvoiceLineItemInsert[] = data.line_items.map(item => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price_cents: item.unit_price_cents,
    total_cents: item.total_cents
  }))

  const { error: lineItemsError } = await supabase
    .from('invoice_line_items')
    .insert(lineItemsData)

  if (lineItemsError) {
    console.error('Error creating line items:', lineItemsError)
    // Try to cleanup the invoice
    await supabase.from('invoices').delete().eq('id', invoice.id)
    throw new Error(`Failed to create invoice line items: ${lineItemsError.message}`)
  }

  return invoice
}

export async function createInvoiceFromJob(jobId: string): Promise<Invoice> {
  const job = await getJob(jobId)

  if (!job.customer || !job.service_address) {
    throw new Error('Job must have customer and service address information')
  }

  if (job.status !== 'completed') {
    throw new Error('Can only create invoices from completed jobs')
  }

  // Check if invoice already exists for this job
  const existingInvoices = await getInvoices(undefined, {})
  const existingInvoice = existingInvoices.find(inv => inv.job_id === jobId)
  
  if (existingInvoice) {
    throw new Error('Invoice already exists for this job')
  }

  // Create line item from job
  const lineItems: LineItemData[] = [{
    description: `Window cleaning service - ${job.service_address.street_address}`,
    quantity: 1,
    unit_price_cents: job.price_cents || 0,
    total_cents: job.price_cents || 0
  }]

  const subtotal_cents = job.price_cents || 0
  const tax_rate = 0 // Default, could be configurable
  const tax_cents = Math.round(subtotal_cents * tax_rate)
  const total_cents = subtotal_cents + tax_cents

  const issuedDate = new Date().toISOString().split('T')[0]
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days

  return createInvoice({
    customer_id: job.customer_id,
    job_id: jobId,
    status: 'draft',
    line_items: lineItems,
    subtotal_cents,
    tax_rate,
    tax_cents,
    total_cents,
    issued_date: issuedDate,
    due_date: dueDate,
    notes: job.notes ? `Service notes: ${job.notes}` : undefined
  })
}

export async function updateInvoice(id: string, data: Partial<CreateInvoiceData>): Promise<Invoice> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Update invoice
  const updateData: InvoiceUpdate = {
    updated_at: new Date().toISOString()
  }

  if (data.customer_id) updateData.customer_id = data.customer_id
  if (data.status) updateData.status = data.status
  if (data.subtotal_cents !== undefined) updateData.subtotal_cents = data.subtotal_cents
  if (data.tax_rate !== undefined) updateData.tax_rate = data.tax_rate
  if (data.tax_cents !== undefined) updateData.tax_cents = data.tax_cents
  if (data.total_cents !== undefined) updateData.total_cents = data.total_cents
  if (data.issued_date) updateData.issued_date = data.issued_date
  if (data.due_date) updateData.due_date = data.due_date
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (invoiceError) {
    console.error('Error updating invoice:', invoiceError)
    throw new Error(`Failed to update invoice: ${invoiceError.message}`)
  }

  // Update line items if provided
  if (data.line_items) {
    // Delete existing line items
    await supabase
      .from('invoice_line_items')
      .delete()
      .eq('invoice_id', id)

    // Insert new line items
    const lineItemsData: InvoiceLineItemInsert[] = data.line_items.map(item => ({
      invoice_id: id,
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      total_cents: item.total_cents
    }))

    const { error: lineItemsError } = await supabase
      .from('invoice_line_items')
      .insert(lineItemsData)

    if (lineItemsError) {
      console.error('Error updating line items:', lineItemsError)
      throw new Error(`Failed to update invoice line items: ${lineItemsError.message}`)
    }
  }

  return invoice
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  const { data: invoice, error } = await supabase
    .from('invoices')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('organization_id', organizationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating invoice status:', error)
    throw new Error(`Failed to update invoice status: ${error.message}`)
  }

  return invoice
}

export async function deleteInvoice(id: string): Promise<void> {
  const organizationId = await getUserOrganizationId()
  const supabase = await createClient()

  // Check if invoice is in draft status
  const invoice = await getInvoice(id)
  if (invoice.status !== 'draft') {
    throw new Error('Can only delete draft invoices')
  }

  // Delete line items first
  await supabase
    .from('invoice_line_items')
    .delete()
    .eq('invoice_id', id)

  // Delete invoice
  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('organization_id', organizationId)

  if (error) {
    console.error('Error deleting invoice:', error)
    throw new Error(`Failed to delete invoice: ${error.message}`)
  }
}

// Helper functions for dashboard metrics
export async function getPendingInvoicesStats(organizationId: string): Promise<{ count: number, total_cents: number }> {
  const invoices = await getInvoices(organizationId, { status: 'sent' })
  const total_cents = invoices.reduce((sum, inv) => sum + (inv.total_cents || 0), 0)
  
  return {
    count: invoices.length,
    total_cents
  }
}

export async function getOverdueInvoicesCount(organizationId: string): Promise<number> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { count, error } = await supabase
    .from('invoices')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .in('status', ['sent', 'viewed'])
    .lt('due_date', today)

  if (error) {
    console.error('Error counting overdue invoices:', error)
    return 0
  }

  return count || 0
}