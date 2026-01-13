import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getCustomers } from '@/services/customers'
import { InvoiceForm } from '@/components/forms/invoice-form'

export default async function NewInvoicePage({
  searchParams
}: {
  searchParams: { job_id?: string }
}) {
  const customers = await getCustomers()
  const jobId = searchParams.job_id

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {jobId ? 'Create Invoice from Job' : 'Create New Invoice'}
          </h1>
          <p className="text-gray-600 mt-1">
            {jobId ? 'Generate an invoice for the completed job' : 'Create a new invoice for a customer'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <InvoiceForm customers={customers} jobId={jobId} />
      </div>
    </div>
  )
}