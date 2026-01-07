"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createCustomer, updateCustomer, deleteCustomer, getCustomers } from "@/services/customers"
import { createServiceAddress } from "@/services/service-addresses"
import { customerFormSchema, type CustomerFormData } from "@/lib/validations/customer"
import { serviceAddressSchema } from "@/lib/validations/service-address"
import { z } from "zod"

export async function getCustomersAction() {
  try {
    const customers = await getCustomers()
    return { success: true, customers }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch customers",
      customers: []
    }
  }
}

export async function createCustomerAction(data: CustomerFormData) {
  try {
    const customer = await createCustomer({
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      source: data.source || null,
      notes: data.notes || null,
    })

    revalidatePath("/customers")
    return { success: true, customer }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create customer" 
    }
  }
}

export async function updateCustomerAction(id: string, data: CustomerFormData) {
  try {
    const customer = await updateCustomer(id, {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status,
      source: data.source || null,
      notes: data.notes || null,
    })

    revalidatePath("/customers")
    revalidatePath(`/customers/${id}`)
    return { success: true, customer }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update customer" 
    }
  }
}

export async function deleteCustomerAction(id: string) {
  try {
    await deleteCustomer(id)
    revalidatePath("/customers")
    return { success: true }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete customer" 
    }
  }
}

// Import validation schema
const importRowSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.union([
    z.string().email('Invalid email address'),
    z.string().length(0)
  ]).optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'prospect']).default('active'),
  source: z.enum(['referral', 'online', 'walk-in', 'phone', 'other']).optional(),
  notes: z.string().optional(),
  street_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
})

interface ImportError {
  row: number
  message: string
  data?: any
}

interface ImportResult {
  success: number
  failed: number
  errors: ImportError[]
  total: number
}

export async function importCustomersAction(
  mappedData: Record<string, string>[]
): Promise<ImportResult> {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    total: mappedData.length
  }

  for (let i = 0; i < mappedData.length; i++) {
    const rowData = mappedData[i]
    const rowNumber = i + 2 // +2 because row 1 is headers, array is 0-indexed

    if (!rowData) {
      continue
    }

    try {
      // Clean and normalize the data
      const cleanData = {
        name: rowData.name?.trim(),
        email: rowData.email?.trim() || undefined,
        phone: rowData.phone?.trim() || undefined,
        status: (rowData.status?.trim().toLowerCase() as any) || 'active',
        source: (rowData.source?.trim().toLowerCase() as any) || undefined,
        notes: rowData.notes?.trim() || undefined,
        street_address: rowData.street_address?.trim() || undefined,
        city: rowData.city?.trim() || undefined,
        state: rowData.state?.trim() || undefined,
        postal_code: rowData.postal_code?.trim() || undefined,
      }

      // Skip empty rows
      if (!cleanData.name) {
        continue
      }

      // Validate the row data
      const validatedData = importRowSchema.parse(cleanData)

      // Create customer
      const customer = await createCustomer({
        name: validatedData.name,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        status: validatedData.status,
        source: validatedData.source || null,
        notes: validatedData.notes || null,
      })

      // Create service address if address fields are present
      const hasAddressFields = validatedData.street_address || 
                              validatedData.city || 
                              validatedData.state || 
                              validatedData.postal_code

      if (hasAddressFields && customer.id) {
        try {
          // Create a label from available address components
          const addressParts = [
            validatedData.street_address,
            validatedData.city,
            validatedData.state
          ].filter(Boolean)
          
          const label = addressParts.length > 0 
            ? addressParts.join(', ') 
            : 'Primary Address'

          await createServiceAddress({
            customer_id: customer.id,
            label,
            street_address: validatedData.street_address || '',
            city: validatedData.city || '',
            state: validatedData.state || '',
            postal_code: validatedData.postal_code || '',
            access_notes: null,
            is_primary: true,
          })
        } catch (addressError) {
          // Log address creation error but don't fail the customer creation
          console.warn(`Failed to create address for customer ${customer.id}:`, addressError)
        }
      }

      result.success++
    } catch (error) {
      result.failed++
      
      let errorMessage = 'Unknown error occurred'
      
      if (error instanceof z.ZodError) {
        errorMessage = error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        ).join(', ')
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      result.errors.push({
        row: rowNumber,
        message: errorMessage,
        data: rowData
      })
    }
  }

  // Revalidate customers page
  revalidatePath("/customers")

  return result
}