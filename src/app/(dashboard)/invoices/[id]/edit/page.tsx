import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { getInvoiceAction } from '@/lib/actions/invoices'
import { getCustomersAction } from '@/lib/actions/customers'
import { InvoiceForm } from '@/components/forms/invoice-form'
import { isInvoiceEditable, INVOICE_STATUS_CONFIG } from '@/lib/validations/invoice'

interface EditInvoicePageProps {
  params: { id: string }
}

async function EditInvoiceForm({ id }: { id: string }) {
  const [invoiceResult, customersResult] = await Promise.all([
    getInvoiceAction(id),
    getCustomersAction()
  ])

  if (!invoiceResult.success || !invoiceResult.invoice) {
    notFound()
  }

  if (!customersResult.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load customers</p>
            <p className="text-sm">{customersResult.error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const invoice = invoiceResult.invoice
  const customers = customersResult.customers

  // Check if invoice can be edited
  if (!isInvoiceEditable(invoice.status)) {
    const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG]
    
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <h3 className="text-lg font-medium mb-2">Cannot Edit Invoice</h3>
            <p className="mb-4">
              This invoice cannot be edited because it has status: 
              <Badge variant="outline" className={`ml-2 ${statusConfig?.color}`}>
                {statusConfig?.label || invoice.status}
              </Badge>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Only draft invoices can be edited. To make changes to this invoice, 
              you'll need to create a new one.
            </p>
            <div className="flex gap-2 justify-center">
              <Link href={`/invoices/${invoice.id}`}>
                <Button variant="outline">View Invoice</Button>
              </Link>
              <Link href={`/invoices/new?duplicate=${invoice.id}`}>
                <Button>Duplicate Invoice</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Transform invoice data for form
  const formInvoice = {
    ...invoice,
    line_items: invoice.line_items.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unit_price_cents: item.unit_price_cents,
      total_cents: item.total_cents
    }))
  }

  return <InvoiceForm customers={customers} invoice={formInvoice} isEditing={true} />
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/invoices/${params.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoice
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
          <p className="text-gray-600 mt-1">
            Make changes to your draft invoice
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Update the invoice details below. Only draft invoices can be edited.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  <div className="h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            }>
              <EditInvoiceForm id={params.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}