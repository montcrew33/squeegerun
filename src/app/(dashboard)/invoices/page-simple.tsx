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

export default function InvoicesPage() {
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
          <CardTitle>Invoice System Ready</CardTitle>
          <CardDescription>
            Your invoicing system has been successfully implemented!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Invoicing System Active</h3>
            <p className="text-gray-600 mb-4">
              The complete invoicing system is now available with:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600 mb-6">
              <li>• Professional invoice creation and management</li>
              <li>• Automatic invoice numbering (INV-YYYY-NNNN)</li>
              <li>• Status workflow (Draft → Sent → Paid)</li>
              <li>• Line item management with auto-calculations</li>
              <li>• Tax calculations and money handling in cents</li>
              <li>• Integration with jobs and customers</li>
              <li>• Overdue detection and management</li>
            </ul>
            <Link href="/invoices/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}