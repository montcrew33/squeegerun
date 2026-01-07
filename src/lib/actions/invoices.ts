"use server"

import { revalidatePath } from "next/cache"
import {
  createInvoice,
  createInvoiceFromJob,
  updateInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoices,
  getInvoice,
  getInvoicesForCustomer
} from "@/services/invoices"
import { getUserOrganizationId } from "@/services/users"
import {
  invoiceSchema,
  updateInvoiceSchema,
  invoiceFiltersSchema
} from "@/lib/validations/invoice"
import type {
  InvoiceFormData,
  UpdateInvoiceFormData,
  InvoiceFiltersData
} from "@/lib/validations/invoice"

export async function createInvoiceAction(data: InvoiceFormData) {
  try {
    const validatedData = invoiceSchema.parse(data)
    
    const invoice = await createInvoice({
      customer_id: validatedData.customer_id,
      job_id: validatedData.job_id,
      status: validatedData.status,
      line_items: validatedData.line_items,
      subtotal_cents: validatedData.subtotal_cents,
      tax_rate: validatedData.tax_rate,
      tax_cents: validatedData.tax_cents,
      total_cents: validatedData.total_cents,
      issued_date: validatedData.issued_date,
      due_date: validatedData.due_date,
      notes: validatedData.notes
    })

    revalidatePath("/invoices")
    revalidatePath("/dashboard")
    revalidatePath(`/customers/${validatedData.customer_id}`)
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create invoice" 
    }
  }
}

export async function createInvoiceFromJobAction(jobId: string) {
  try {
    if (!jobId) {
      throw new Error("Job ID is required")
    }

    const invoice = await createInvoiceFromJob(jobId)

    revalidatePath("/invoices")
    revalidatePath("/jobs")
    revalidatePath(`/jobs/${jobId}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error creating invoice from job:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create invoice from job" 
    }
  }
}

export async function updateInvoiceAction(id: string, data: UpdateInvoiceFormData) {
  try {
    const validatedData = updateInvoiceSchema.parse(data)
    
    const invoice = await updateInvoice(id, validatedData)

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update invoice" 
    }
  }
}

export async function markAsSentAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'sent')

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error marking invoice as sent:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to mark invoice as sent" 
    }
  }
}

export async function markAsPaidAction(id: string, paymentMethod?: string, paymentDate?: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'paid')

    // TODO: In the future, create a payment record here with paymentMethod and paymentDate

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error marking invoice as paid:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to mark invoice as paid" 
    }
  }
}

export async function markAsOverdueAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'overdue')

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error marking invoice as overdue:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to mark invoice as overdue" 
    }
  }
}

export async function cancelInvoiceAction(id: string) {
  try {
    const invoice = await updateInvoiceStatus(id, 'cancelled')

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error cancelling invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to cancel invoice" 
    }
  }
}

export async function deleteInvoiceAction(id: string) {
  try {
    await deleteInvoice(id)

    revalidatePath("/invoices")
    revalidatePath("/dashboard")
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete invoice" 
    }
  }
}

export async function getInvoicesAction(filters?: InvoiceFiltersData) {
  try {
    const validatedFilters = filters ? invoiceFiltersSchema.parse(filters) : undefined
    const organizationId = await getUserOrganizationId()
    
    const invoices = await getInvoices(organizationId, validatedFilters)

    return { success: true, invoices }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch invoices",
      invoices: []
    }
  }
}

export async function getInvoiceAction(id: string) {
  try {
    const invoice = await getInvoice(id)
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch invoice",
      invoice: null
    }
  }
}

export async function getInvoicesForCustomerAction(customerId: string) {
  try {
    const invoices = await getInvoicesForCustomer(customerId)
    
    return { success: true, invoices }
  } catch (error) {
    console.error('Error fetching invoices for customer:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch customer invoices",
      invoices: []
    }
  }
}

export async function sendInvoiceAction(id: string) {
  try {
    // For now, just mark as sent
    // In the future, this would actually send an email
    const invoice = await updateInvoiceStatus(id, 'sent')

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    revalidatePath("/dashboard")
    
    return { success: true, invoice }
  } catch (error) {
    console.error('Error sending invoice:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to send invoice" 
    }
  }
}

// Helper action to check if an invoice exists for a job
export async function checkInvoiceForJobAction(jobId: string) {
  try {
    const organizationId = await getUserOrganizationId()
    const invoices = await getInvoices(organizationId)
    const existingInvoice = invoices.find(inv => inv.job_id === jobId)
    
    return { 
      success: true, 
      hasInvoice: !!existingInvoice,
      invoice: existingInvoice || null
    }
  } catch (error) {
    console.error('Error checking invoice for job:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to check invoice for job",
      hasInvoice: false,
      invoice: null
    }
  }
}