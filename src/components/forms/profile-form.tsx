'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Eye, EyeOff, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { updateProfileAction, changePasswordAction } from '@/lib/actions/settings'
import {
  profileSchema,
  passwordChangeSchema,
  type ProfileFormData,
  type PasswordChangeFormData,
  PROFILE_FIELDS
} from '@/lib/validations/settings'
import type { ProfileWithDetails } from '@/services/settings'

interface ProfileFormProps {
  profile: ProfileWithDetails
  userEmail: string
}

export function ProfileForm({ profile, userEmail }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      phone: profile.phone || ''
    }
  })

  // Password form
  const passwordForm = useForm<PasswordChangeFormData>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  })

  const onProfileSubmit = (data: ProfileFormData) => {
    startTransition(async () => {
      const result = await updateProfileAction(data)
      
      if (result.success) {
        setProfileMessage({ type: 'success', message: 'Profile updated successfully!' })
      } else {
        setProfileMessage({ type: 'error', message: result.error })
      }

      // Clear message after 5 seconds
      setTimeout(() => setProfileMessage(null), 5000)
    })
  }

  const onPasswordSubmit = (data: PasswordChangeFormData) => {
    startTransition(async () => {
      const result = await changePasswordAction(data)
      
      if (result.success) {
        setPasswordMessage({ type: 'success', message: 'Password changed successfully!' })
        passwordForm.reset()
      } else {
        setPasswordMessage({ type: 'error', message: result.error })
      }

      // Clear message after 5 seconds
      setTimeout(() => setPasswordMessage(null), 5000)
    })
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">
                  Email Address
                </label>
                <Input 
                  value={userEmail} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {/* Full Name */}
              <FormField
                control={profileForm.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{PROFILE_FIELDS.full_name.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={PROFILE_FIELDS.full_name.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{PROFILE_FIELDS.phone.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={PROFILE_FIELDS.phone.placeholder}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profile Messages */}
              {profileMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  profileMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {profileMessage.message}
                </div>
              )}

              {/* Save Button */}
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              {/* Current Password */}
              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? 'text' : 'password'}
                          placeholder="Enter current password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('current')}
                        >
                          {showPasswords.current ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={passwordForm.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? 'text' : 'password'}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('new')}
                        >
                          {showPasswords.new ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={passwordForm.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => togglePasswordVisibility('confirm')}
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Messages */}
              {passwordMessage && (
                <div className={`p-3 rounded-md text-sm ${
                  passwordMessage.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {passwordMessage.message}
                </div>
              )}

              {/* Change Password Button */}
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Avatar Section (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Update your profile picture (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Profile picture upload will be available soon
              </p>
              <Button disabled variant="outline" size="sm">
                Upload Picture
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}