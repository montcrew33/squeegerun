'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building, Save, MapPin, Percent, Calendar, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { updateBusinessAction } from '@/lib/actions/settings'
import {
  businessSchema,
  type BusinessFormData,
  BUSINESS_FIELDS
} from '@/lib/validations/settings'
import type { OrganizationWithSettings } from '@/services/settings'

interface BusinessFormProps {
  organization: OrganizationWithSettings
}

export function BusinessForm({ organization }: BusinessFormProps) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  // Convert organization data to form format
  const getDefaultValues = (): BusinessFormData => {
    const settings = organization.settings || {}
    
    return {
      name: organization.name || '',
      phone: organization.phone || '',
      email: organization.email || '',
      street_address: organization.street_address || '',
      city: organization.city || '',
      state: organization.state || '',
      postal_code: organization.postal_code || '',
      tax_rate: settings.tax_rate ? settings.tax_rate * 100 : 8.25, // Convert decimal to percentage
      invoice_due_days: settings.invoice_due_days || 14,
      invoice_notes_template: settings.invoice_notes_template || ''
    }
  }

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: getDefaultValues()
  })

  const onSubmit = (data: BusinessFormData) => {
    startTransition(async () => {
      const result = await updateBusinessAction(data)
      
      if (result.success) {
        setMessage({ type: 'success', message: 'Business settings updated successfully!' })
      } else {
        setMessage({ type: 'error', message: result.error })
      }

      // Clear message after 5 seconds
      setTimeout(() => setMessage(null), 5000)
    })
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Basic information about your window cleaning business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Business Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BUSINESS_FIELDS.name.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={BUSINESS_FIELDS.name.placeholder}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BUSINESS_FIELDS.phone.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={BUSINESS_FIELDS.phone.placeholder}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Business Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BUSINESS_FIELDS.email.label}</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={BUSINESS_FIELDS.email.placeholder}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </CardTitle>
              <CardDescription>
                Your business location for invoices and official documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Street Address */}
              <FormField
                control={form.control}
                name="street_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BUSINESS_FIELDS.street_address.label}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={BUSINESS_FIELDS.street_address.placeholder}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City, State, ZIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{BUSINESS_FIELDS.city.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={BUSINESS_FIELDS.city.placeholder}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{BUSINESS_FIELDS.state.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={BUSINESS_FIELDS.state.placeholder}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{BUSINESS_FIELDS.postal_code.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={BUSINESS_FIELDS.postal_code.placeholder}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Default settings for your invoices and billing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tax Rate */}
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      {BUSINESS_FIELDS.tax_rate.label}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          placeholder={BUSINESS_FIELDS.tax_rate.placeholder}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          %
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Default tax rate applied to new invoices (e.g., 8.25 for 8.25%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Due Days */}
              <FormField
                control={form.control}
                name="invoice_due_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {BUSINESS_FIELDS.invoice_due_days.label}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          placeholder={BUSINESS_FIELDS.invoice_due_days.placeholder}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 14)}
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                          days
                        </span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Number of days from invoice date until payment is due
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Notes Template */}
              <FormField
                control={form.control}
                name="invoice_notes_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{BUSINESS_FIELDS.invoice_notes_template.label}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={BUSINESS_FIELDS.invoice_notes_template.placeholder}
                        rows={3}
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormDescription>
                      Default notes that will appear on new invoices (payment terms, etc.)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Messages */}
          {message && (
            <div className={`p-4 rounded-md text-sm ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.message}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} size="lg">
              {isPending ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Business Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}