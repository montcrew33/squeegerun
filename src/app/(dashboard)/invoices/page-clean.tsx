import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InvoiceFilters } from '@/components/invoice/invoice-filters'

interface InvoicesPageProps {
  searchParams: { status?: string }
}

export default function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const status = searchParams.status || 'all'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your customer invoices
          </p>
        </div>
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <InvoiceFilters />
          </div>
          <CardDescription>
            {status === 'all' 
              ? 'All your invoices across all statuses'
              : `Invoices with status: ${status}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No invoices found</h3>
            <p className="text-gray-600 mb-4">
              {status === 'all' 
                ? 'Create your first invoice to get started'
                : `No invoices found with status: ${status}`
              }
            </p>
            <Link href="/invoices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}