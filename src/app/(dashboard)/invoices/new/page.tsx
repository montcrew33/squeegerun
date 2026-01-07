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

export default function NewInvoicePage() {
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
            Create a new invoice for a customer
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Creation</CardTitle>
            <CardDescription>
              The invoice creation form is being prepared...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Invoice creation functionality is being set up.
              </p>
              <p className="text-sm text-gray-500">
                This feature requires customer data and database connectivity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}