"use server"

import { revalidatePath } from "next/cache"
import { 
  updateProfile, 
  updatePassword, 
  updateBusinessInfo,
  getCurrentUserProfile,
  getCurrentUserOrganization 
} from "@/services/settings"
import { 
  profileSchema, 
  passwordChangeSchema, 
  businessSchema,
  type ProfileFormData,
  type PasswordChangeFormData,
  type BusinessFormData 
} from "@/lib/validations/settings"

export async function updateProfileAction(data: ProfileFormData) {
  try {
    const validatedData = profileSchema.parse(data)
    
    // Get current user
    const profile = await getCurrentUserProfile()
    
    // Update profile
    const updatedProfile = await updateProfile(profile.id, {
      full_name: validatedData.full_name,
      phone: validatedData.phone
    })

    revalidatePath("/settings/profile")
    revalidatePath("/settings")
    
    return { success: true, profile: updatedProfile }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update profile" 
    }
  }
}

export async function changePasswordAction(data: PasswordChangeFormData) {
  try {
    const validatedData = passwordChangeSchema.parse(data)
    
    await updatePassword(validatedData.current_password, validatedData.new_password)

    revalidatePath("/settings/profile")
    
    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to change password" 
    }
  }
}

export async function updateBusinessAction(data: BusinessFormData) {
  try {
    const validatedData = businessSchema.parse(data)
    
    const organization = await updateBusinessInfo(validatedData)

    revalidatePath("/settings/business")
    revalidatePath("/settings")
    
    return { success: true, organization }
  } catch (error) {
    console.error('Error updating business settings:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update business settings" 
    }
  }
}

export async function getProfileAction() {
  try {
    const profile = await getCurrentUserProfile()
    return { success: true, profile }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch profile",
      profile: null
    }
  }
}

export async function getOrganizationAction() {
  try {
    const organization = await getCurrentUserOrganization()
    return { success: true, organization }
  } catch (error) {
    console.error('Error fetching organization:', error)
    return { 
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to fetch organization",
      organization: null
    }
  }
}