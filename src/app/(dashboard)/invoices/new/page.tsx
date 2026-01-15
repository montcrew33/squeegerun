'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface LineItem {
  description: string
  quantity: number
  rate: number
  amount: number
}

export default function NewInvoicePage({
  searchParams
}: {
  searchParams?: { job_id?: string }
}) {
  const [customer, setCustomer] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, rate: 0, amount: 0 }
  ])
  const [notes, setNotes] = useState('')
  const [taxRate] = useState(0.08) // 8% tax

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = { ...newLineItems[index], [field]: value }
    
    // Recalculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      newLineItems[index].amount = newLineItems[index].quantity * newLineItems[index].rate
    }
    
    setLineItems(newLineItems)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0, amount: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
  const tax = subtotal * taxRate
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!customer) {
      alert('Please select a customer')
      return
    }

    const invoiceData = {
      customer_id: customer,
      status: 'draft',
      line_items: lineItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price_cents: Math.round(item.rate * 100),
        total_cents: Math.round(item.amount * 100)
      })),
      subtotal_cents: Math.round(subtotal * 100),
      tax_rate: taxRate,
      tax_cents: Math.round(tax * 100),
      total_cents: Math.round(total * 100),
      issued_date: issueDate,
      due_date: dueDate,
      notes: notes
    }

    console.log('Invoice data:', invoiceData)
    alert('Invoice functionality will be connected soon! Check console for data.')
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Invoice</h1>
          <p className="text-gray-600 mt-1">Create a new invoice for a customer</p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Invoice Details</h3>
            <p className="mt-1 text-sm text-gray-500">Fill in the invoice information below</p>
          </div>
          <div className="px-6 py-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700">
                  Customer
                </label>
                <select 
                  id="customer"
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select a customer...</option>
                  <option value="customer1">Sample Customer 1</option>
                  <option value="customer2">Sample Customer 2</option>
                  <option value="customer3">Sample Customer 3</option>
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
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="due-date" className="block text-sm font-medium text-gray-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="due-date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">Line Items</h4>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Item
                  </button>
                </div>
                
                <div className="border border-gray-200 rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-5">Description</div>
                    <div className="col-span-2">Quantity</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1">Action</div>
                  </div>
                  
                  {lineItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Service description"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-right font-medium">
                          ${item.amount.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        {lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(index)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Subtotal:</span>
                      <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%):</span>
                      <span className="text-sm font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total:</span>
                      <span className="font-medium">${total.toFixed(2)}</span>
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
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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