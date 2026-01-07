'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarIcon, Plus, Trash2, Calculator } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { createInvoiceAction, createInvoiceFromJobAction } from '@/lib/actions/invoices'
import {
  invoiceSchema,
  formatCurrency,
  dollarsToCents,
  centsToDollars,
  getDefaultDueDate,
  calculateLineTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  type InvoiceFormData,
  type LineItemFormData
} from '@/lib/validations/invoice'
import type { CustomerWithDetails } from '@/services/customers'

interface InvoiceFormProps {
  customers: CustomerWithDetails[]
  jobId?: string
  invoice?: any // For editing
  isEditing?: boolean
}

export function InvoiceForm({ customers, jobId, invoice, isEditing = false }: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isCalculating, setIsCalculating] = useState(false)

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer_id: invoice?.customer_id || '',
      job_id: jobId || invoice?.job_id || undefined,
      status: invoice?.status || 'draft',
      line_items: invoice?.line_items || [
        {
          description: '',
          quantity: 1,
          unit_price_cents: 0,
          total_cents: 0
        }
      ],
      subtotal_cents: invoice?.subtotal_cents || 0,
      tax_rate: invoice?.tax_rate || 0.08, // 8% default tax rate
      tax_cents: invoice?.tax_cents || 0,
      total_cents: invoice?.total_cents || 0,
      issued_date: invoice?.issued_date || new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date || getDefaultDueDate(),
      notes: invoice?.notes || ''
    }
  })

  const { watch, setValue, getValues } = form
  const lineItems = watch('line_items')
  const taxRate = watch('tax_rate')
  const issuedDate = watch('issued_date')

  // Auto-calculate totals when line items or tax rate changes
  useEffect(() => {
    const recalculateTotals = () => {
      setIsCalculating(true)
      
      // Calculate line item totals
      const updatedLineItems = lineItems.map(item => ({
        ...item,
        total_cents: calculateLineTotal(item.quantity, item.unit_price_cents)
      }))

      // Calculate subtotal
      const subtotal = calculateSubtotal(updatedLineItems)
      
      // Calculate tax
      const tax = calculateTax(subtotal, taxRate)
      
      // Calculate total
      const total = calculateTotal(subtotal, tax)

      setValue('line_items', updatedLineItems)
      setValue('subtotal_cents', subtotal)
      setValue('tax_cents', tax)
      setValue('total_cents', total)
      
      setTimeout(() => setIsCalculating(false), 100)
    }

    recalculateTotals()
  }, [lineItems.length, lineItems.map(item => `${item.quantity}-${item.unit_price_cents}`).join(','), taxRate, setValue])

  // Update due date when issued date changes
  useEffect(() => {
    setValue('due_date', getDefaultDueDate(issuedDate))
  }, [issuedDate, setValue])

  const addLineItem = () => {
    const currentItems = getValues('line_items')
    setValue('line_items', [
      ...currentItems,
      {
        description: '',
        quantity: 1,
        unit_price_cents: 0,
        total_cents: 0
      }
    ])
  }

  const removeLineItem = (index: number) => {
    const currentItems = getValues('line_items')
    if (currentItems.length > 1) {
      setValue('line_items', currentItems.filter((_, i) => i !== index))
    }
  }

  const updateLineItem = (index: number, field: keyof LineItemFormData, value: any) => {
    const currentItems = getValues('line_items')
    const updatedItems = [...currentItems]
    
    if (field === 'unit_price_cents') {
      // Convert dollar string to cents
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: dollarsToCents(value)
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      }
    }
    
    setValue('line_items', updatedItems)
  }

  const onSubmit = (data: InvoiceFormData) => {
    startTransition(async () => {
      try {
        let result

        if (jobId && !isEditing) {
          // Create from job (ignore form data for simplicity)
          result = await createInvoiceFromJobAction(jobId)
        } else {
          // Create new invoice or update existing
          result = await createInvoiceAction(data)
        }

        if (result.success) {
          router.push(`/invoices/${result.invoice.id}`)
        } else {
          console.error('Failed to save invoice:', result.error)
          // TODO: Show error toast
        }
      } catch (error) {
        console.error('Error saving invoice:', error)
        // TODO: Show error toast
      }
    })
  }

  // If creating from job, show simplified flow
  if (jobId && !isEditing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Invoice from Job</CardTitle>
            <CardDescription>
              This will automatically create an invoice based on the job details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={() => onSubmit({} as InvoiceFormData)} 
                disabled={isPending}
              >
                {isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer and Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="customer_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="issued_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>Add items or services for this invoice</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                <div className="col-span-12 md:col-span-5">
                  <Input
                    placeholder="Item description *"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  />
                </div>
                
                <div className="col-span-6 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    min="0.01"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <div className="col-span-6 md:col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    min="0"
                    step="0.01"
                    value={centsToDollars(item.unit_price_cents)}
                    onChange={(e) => updateLineItem(index, 'unit_price_cents', e.target.value)}
                  />
                </div>
                
                <div className="col-span-10 md:col-span-2 text-right font-medium">
                  {formatCurrency(item.total_cents)}
                </div>
                
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  {lineItems.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tax and Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculations
              {isCalculating && <Badge variant="outline">Calculating...</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tax_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="1"
                      step="0.0001"
                      placeholder="0.08"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatCurrency(watch('subtotal_cents'))}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(watch('tax_cents'))}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(watch('total_cents'))}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Additional notes or payment terms..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex gap-4 pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : isEditing ? 'Update Invoice' : 'Create Invoice'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}