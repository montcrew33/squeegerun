"use server"

import { revalidatePath } from "next/cache"
import { createServiceAddress, updateServiceAddress, deleteServiceAddress } from "@/services/service-addresses"
import type { ServiceAddressFormData } from "@/lib/validations/service-address"

export async function createServiceAddressAction(customerId: string, data: ServiceAddressFormData) {
  try {
    const serviceAddress = await createServiceAddress({
      customer_id: customerId,
      street_address: data.street_address,
      unit: data.unit || null,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country || 'US',
      label: data.label || null,
      access_notes: data.access_notes || null,
      property_type: data.property_type || null,
      window_count: typeof data.window_count === 'number' ? data.window_count : null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_primary: data.is_primary || false,
    })

    revalidatePath(`/customers/${customerId}`)
    return { success: true, serviceAddress }
  } catch (error) {
    console.error('Error creating service address:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create service address" 
    }
  }
}

export async function updateServiceAddressAction(id: string, customerId: string, data: ServiceAddressFormData) {
  try {
    const serviceAddress = await updateServiceAddress(id, {
      street_address: data.street_address,
      unit: data.unit || null,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country || 'US',
      label: data.label || null,
      access_notes: data.access_notes || null,
      property_type: data.property_type || null,
      window_count: typeof data.window_count === 'number' ? data.window_count : null,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_primary: data.is_primary || false,
    })

    revalidatePath(`/customers/${customerId}`)
    return { success: true, serviceAddress }
  } catch (error) {
    console.error('Error updating service address:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update service address" 
    }
  }
}

export async function deleteServiceAddressAction(id: string, customerId: string) {
  try {
    await deleteServiceAddress(id)
    revalidatePath(`/customers/${customerId}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting service address:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete service address" 
    }
  }
}