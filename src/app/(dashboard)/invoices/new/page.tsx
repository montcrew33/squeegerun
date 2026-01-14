import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default async function NewInvoicePage({
  searchParams
}: {
  searchParams: { job_id?: string }
}) {
  const jobId = searchParams.job_id

  // For now, let's create a simple form without complex dependencies
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/invoices">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </button>
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
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
            <p className="mt-1 text-sm text-gray-500">Fill in the invoice information below</p>
          </div>
          <div className="px-6 py-4">
            <form className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <select 
                  id="customer"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a customer...</option>
                  <option value="test">Test Customer</option>
                </select>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="issue-date" className="block text-sm font-medium text-gray-700">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    id="issue-date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due-date"
                    defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Line Items</h4>
                <div className="border border-gray-200 rounded-md p-4">
                  <div className="grid grid-cols-12 gap-4 mb-2">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Rate</label>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Service description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="1"
                        min="0.01"
                        step="0.01"
                        defaultValue="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="$0.00"
                        readOnly
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax:</span>
                      <span className="text-sm font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Additional notes or payment terms..."
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Create Invoice
                </button>
                <Link href="/invoices">
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}