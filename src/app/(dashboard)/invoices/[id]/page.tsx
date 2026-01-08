import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Send, 
  CheckCircle, 
  Download, 
  Trash2,
  AlertCircle,
  Calendar,
  MapPin,
  User,
  Building
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import { getInvoiceAction } from '@/lib/actions/invoices'
import { 
  INVOICE_STATUS_CONFIG, 
  formatCurrency,
  isInvoiceEditable,
  isInvoiceDeletable,
  canMarkAsSent,
  canMarkAsPaid,
  isOverdue
} from '@/lib/validations/invoice'
import { InvoiceActions } from '@/components/invoice/invoice-actions'

interface InvoiceDetailPageProps {
  params: { id: string }
}

async function InvoiceDetail({ id }: { id: string }) {
  const result = await getInvoiceAction(id)

  if (!result.success || !result.invoice) {
    notFound()
  }

  const invoice = result.invoice
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG]
  const overdue = isOverdue(invoice.due_date, invoice.status)
  const actualStatus = overdue ? 'overdue' : invoice.status
  const actualConfig = overdue ? INVOICE_STATUS_CONFIG.overdue : statusConfig

  const issuedDate = new Date(invoice.issued_date)
  const dueDate = new Date(invoice.due_date)
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Button>
          </Link>
          
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{invoice.invoice_number}</h1>
              <Badge variant="outline" className={actualConfig.color}>
                {actualConfig.label}
              </Badge>
              {overdue && (
                <Badge variant="destructive">
                  {Math.abs(daysUntilDue)} days overdue
                </Badge>
              )}
            </div>
            <p className="text-gray-600">
              Invoice for {invoice.customer.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Suspense fallback={<Button disabled>Loading...</Button>}>
            <InvoiceActions invoice={invoice} />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <Card>
            <CardContent className="p-8">
              {/* Company Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">SqueegeeRun</h2>
                <p className="text-gray-600">Professional Window Cleaning Services</p>
              </div>

              {/* Invoice Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Bill To:</h3>
                  <div className="space-y-1">
                    <p className="font-medium">{invoice.customer.name}</p>
                    <p className="text-gray-600">{invoice.customer.email}</p>
                    <p className="text-gray-600">{invoice.customer.phone}</p>
                    {(invoice.customer as any).service_addresses?.[0] && (
                      <div className="text-gray-600">
                        <p>{(invoice.customer as any).service_addresses[0].street_address}</p>
                        <p>
                          {(invoice.customer as any).service_addresses[0].city}, {(invoice.customer as any).service_addresses[0].state} {(invoice.customer as any).service_addresses[0].zip_code}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600">Invoice Number:</span>
                      <p className="font-semibold">{invoice.invoice_number}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Issue Date:</span>
                      <p className="font-semibold">{issuedDate.toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Due Date:</span>
                      <p className={`font-semibold ${overdue ? 'text-red-600' : ''}`}>
                        {dueDate.toLocaleDateString()}
                      </p>
                    </div>
                    {daysUntilDue !== 0 && (
                      <div>
                        <span className="text-gray-600">
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

              {/* Job Reference */}
              {invoice.job && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Related Job</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Service at {invoice.job.service_address?.street_address}
                  </p>
                  <p className="text-blue-600 text-sm">
                    Completed on {invoice.job.date ? new Date(invoice.job.date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              )}

              {/* Line Items */}
              <div className="mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 font-semibold text-gray-900">Description</th>
                        <th className="text-center py-3 font-semibold text-gray-900">Qty</th>
                        <th className="text-right py-3 font-semibold text-gray-900">Rate</th>
                        <th className="text-right py-3 font-semibold text-gray-900">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.line_items.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 text-gray-900">{item.description}</td>
                          <td className="py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-600">
                            {formatCurrency(item.unit_price_cents)}
                          </td>
                          <td className="py-3 text-right text-gray-900 font-medium">
                            {formatCurrency(item.total_cents)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2 max-w-xs ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoice.subtotal_cents)}</span>
                  </div>
                  {invoice.tax_cents > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax ({(invoice.tax_rate * 100).toFixed(1)}%):</span>
                      <span className="font-medium">{formatCurrency(invoice.tax_cents)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(invoice.total_cents)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Invoice Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={actualConfig.color}>
                  {actualConfig.label}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600">
                {actualConfig.description}
              </p>

              {overdue && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                    <AlertCircle className="h-4 w-4" />
                    Payment Overdue
                  </div>
                  <p className="text-red-700 text-sm">
                    This invoice is {Math.abs(daysUntilDue)} days past due. Consider following up with the customer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {isInvoiceEditable(invoice.status) && (
                <Link href={`/invoices/${invoice.id}/edit`} className="w-full">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Invoice
                  </Button>
                </Link>
              )}

              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>

              {canMarkAsSent(invoice.status) && (
                <Button variant="outline" className="w-full justify-start">
                  <Send className="mr-2 h-4 w-4" />
                  Send to Customer
                </Button>
              )}

              {canMarkAsPaid(invoice.status) && (
                <Button className="w-full justify-start">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Paid
                </Button>
              )}

              {isInvoiceDeletable(invoice.status) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Invoice
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this invoice? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Delete Invoice
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="font-medium">{invoice.customer.name}</p>
                <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
              </div>
              
              <Link href={`/customers/${invoice.customer.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  View Customer Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-9 w-32 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="h-96 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    }>
      <InvoiceDetail id={params.id} />
    </Suspense>
  )
}