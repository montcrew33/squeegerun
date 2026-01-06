"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { jobFormSchema, type JobFormData, JOB_STATUS_LABELS } from "@/lib/validations/job"

interface JobFormProps {
  initialData?: Partial<JobFormData>
  onSubmit: (data: JobFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  customers: { id: string; name: string }[]
  serviceAddresses: { id: string; label: string; street_address: string; city: string }[]
  users: { id: string; full_name: string }[]
}

export function JobForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  customers,
  serviceAddresses,
  users,
}: JobFormProps) {
  const form = useForm({
    resolver: zodResolver(jobFormSchema),
    defaultValues: {
      customer_id: initialData?.customer_id ?? "",
      service_address_id: initialData?.service_address_id ?? "",
      scheduled_date: initialData?.scheduled_date ?? "",
      scheduled_time_start: initialData?.scheduled_time_start ?? "",
      scheduled_time_end: initialData?.scheduled_time_end ?? "",
      price: initialData?.price ?? undefined,
      notes: initialData?.notes ?? "",
      assigned_to: initialData?.assigned_to ?? "",
    },
  })

  const selectedCustomerId = form.watch("customer_id")
  const filteredServiceAddresses = serviceAddresses.filter(
    address => address.id === form.watch("service_address_id") || 
    customers.find(c => c.id === selectedCustomerId)
  )

  const handleSubmit = async (data: JobFormData) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Job form submission error:', error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Clear service address when customer changes
                    form.setValue("service_address_id", "")
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_address_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Address *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service address" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredServiceAddresses.map((address) => (
                      <SelectItem key={address.id} value={address.id}>
                        {address.label} - {address.street_address}, {address.city}
                      </SelectItem>
                    ))}
                    <SelectItem value="__new__">
                      + Add New Address
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
                {field.value === "__new__" && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Street address"
                      onChange={(e) => {
                        // Handle new address input - this would need more logic
                        console.log('New address:', e.target.value)
                      }}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="City" />
                      <Input placeholder="State" />
                      <Input placeholder="Postal Code" />
                    </div>
                  </div>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheduled Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scheduled_time_end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseFloat(e.target.value)
                      field.onChange(value)
                    }}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter any special instructions or notes for this job..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : (initialData ? 'Update Job' : 'Create Job')}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}