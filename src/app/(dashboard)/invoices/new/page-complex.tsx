import { Suspense } from 'react'
import { redirect } from 'next/navigation'
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
import { getCustomersAction } from '@/lib/actions/customers'
import { InvoiceForm } from '@/components/forms/invoice-form'

async function NewInvoiceForm({ jobId }: { jobId?: string }) {
  const customersResult = await getCustomersAction()
  
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

  const customers = customersResult.customers

  if (!customers.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <p className="mb-4">You need to have customers before creating an invoice.</p>
            <Link href="/customers/new">
              <Button>Create Customer First</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <InvoiceForm customers={customers} jobId={jobId} />
}

interface NewInvoicePageProps {
  searchParams: { 
    job_id?: string
    customer_id?: string
  }
}

export default function NewInvoicePage({ searchParams }: NewInvoicePageProps) {
  const { job_id, customer_id } = searchParams

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">
            {job_id 
              ? 'Creating invoice from completed job'
              : 'Create a new invoice for a customer'
            }
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>
              Fill in the details below to create your invoice. All fields marked with * are required.
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
              <NewInvoiceForm jobId={job_id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}