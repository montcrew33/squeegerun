'use client'

import { format } from 'date-fns'
import { Building, Mail, Phone, MapPin, Calendar, Hash, User } from 'lucide-react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

import {
  formatCurrency,
  INVOICE_STATUS_CONFIG,
  isOverdue,
  type InvoiceFormData
} from '@/lib/validations/invoice'
import type { CustomerWithDetails } from '@/services/customers'
import type { InvoiceWithDetails } from '@/services/invoices'

interface InvoicePreviewProps {
  invoice?: Partial<InvoiceWithDetails>
  formData?: Partial<InvoiceFormData>
  customer?: CustomerWithDetails
  className?: string
}

export function InvoicePreview({ 
  invoice, 
  formData, 
  customer,
  className 
}: InvoicePreviewProps) {
  // Merge data from either existing invoice or form data
  const data = invoice || {}
  const form = formData || {}
  
  const invoiceNumber = data.invoice_number || 'INV-XXXX-XXXX'
  const status = form.status || data.status || 'draft'
  const lineItems = form.line_items || data.line_items || []
  const subtotal = form.subtotal_cents || data.subtotal_cents || 0
  const taxRate = form.tax_rate || data.tax_rate || 0
  const taxAmount = form.tax_cents || data.tax_cents || 0
  const total = form.total_cents || data.total_cents || 0
  const issuedDate = form.issued_date || data.issued_date || new Date().toISOString().split('T')[0]
  const dueDate = form.due_date || data.due_date || new Date().toISOString().split('T')[0]
  const notes = form.notes || data.notes || ''

  // Get customer info
  const customerInfo = customer || data.customer
  const customerName = customerInfo?.name || 'Customer Name'
  const customerEmail = customerInfo?.email || 'customer@example.com'
  const customerPhone = customerInfo?.phone || 'Phone Number'
  const serviceAddress = customerInfo?.service_addresses?.[0]

  // Status configuration
  const statusConfig = INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG]
  const overdue = isOverdue(dueDate, status)
  const actualStatus = overdue ? 'overdue' : status
  const actualConfig = overdue ? INVOICE_STATUS_CONFIG.overdue : statusConfig

  // Calculate days until due
  const daysUntilDue = Math.ceil((new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <Card className={className}>
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SqueegeeRun</h1>
            <p className="text-gray-600">Professional Window Cleaning Services</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className={actualConfig?.color || 'bg-gray-100 text-gray-800'}>
                {actualConfig?.label || status}
              </Badge>
              {overdue && (
                <Badge variant="destructive">
                  {Math.abs(daysUntilDue)} days overdue
                </Badge>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">INVOICE</h2>
            <p className="text-lg font-medium text-gray-700">{invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Bill To */}
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-gray-900 mb-3">
              <User className="h-4 w-4" />
              Bill To:
            </h3>
            <div className="space-y-1 text-gray-700">
              <p className="font-medium">{customerName}</p>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-3 w-3 text-gray-400" />
                <span>{customerEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-3 w-3 text-gray-400" />
                <span>{customerPhone}</span>
              </div>
              {serviceAddress && (
                <div className="flex items-start gap-2 text-sm mt-2">
                  <MapPin className="h-3 w-3 text-gray-400 mt-0.5" />
                  <div>
                    <p>{serviceAddress.street_address}</p>
                    <p>
                      {serviceAddress.city}, {serviceAddress.state} {serviceAddress.zip_code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Info */}
          <div className="text-right">
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                  <Hash className="h-3 w-3" />
                  <span>Invoice Number:</span>
                </div>
                <p className="font-semibold text-gray-900">{invoiceNumber}</p>
              </div>
              
              <div>
                <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Issue Date:</span>
                </div>
                <p className="font-semibold text-gray-900">
                  {format(new Date(issuedDate), 'MMM dd, yyyy')}
                </p>
              </div>
              
              <div>
                <div className="flex items-center justify-end gap-2 text-sm text-gray-600">
                  <Calendar className="h-3 w-3" />
                  <span>Due Date:</span>
                </div>
                <p className={`font-semibold ${overdue ? 'text-red-600' : 'text-gray-900'}`}>
                  {format(new Date(dueDate), 'MMM dd, yyyy')}
                </p>
              </div>

              {daysUntilDue !== 0 && (
                <div>
                  <span className="text-sm text-gray-600">
                    {daysUntilDue > 0 ? 'Days Until Due:' : 'Days Overdue:'}
                  </span>
                  <p className={`font-semibold ${daysUntilDue < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(daysUntilDue)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Job */}
        {data.job && (
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Related Job</span>
            </div>
            <p className="text-blue-800 text-sm">
              Service at {data.job.service_address?.street_address}
            </p>
            {data.job.date && (
              <p className="text-blue-600 text-sm">
                Completed on {format(new Date(data.job.date), 'MMM dd, yyyy')}
              </p>
            )}
          </div>
        )}

        {/* Line Items */}
        <div className="mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                  <th className="text-center py-3 font-semibold text-gray-900 w-20">Qty</th>
                  <th className="text-right py-3 font-semibold text-gray-900 w-24">Rate</th>
                  <th className="text-right py-3 font-semibold text-gray-900 w-24">Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3 text-gray-900">
                        {item.description || 'Line item description'}
                      </td>
                      <td className="py-3 text-center text-gray-600">
                        {item.quantity || 1}
                      </td>
                      <td className="py-3 text-right text-gray-600">
                        {formatCurrency(item.unit_price_cents || 0)}
                      </td>
                      <td className="py-3 text-right text-gray-900 font-medium">
                        {formatCurrency(item.total_cents || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-500">
                      No line items added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            {taxAmount > 0 && (
              <div className="flex justify-between text-gray-700">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
            )}
            
            <Separator className="my-2" />
            
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Thank you for your business!</p>
          <p>If you have any questions about this invoice, please contact us.</p>
        </div>
      </CardContent>
    </Card>
  )
}