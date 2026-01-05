"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createCustomer, updateCustomer, deleteCustomer } from "@/services/customers"
import type { CustomerFormData } from "@/lib/validations/customer"

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