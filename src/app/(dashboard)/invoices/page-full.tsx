import { Suspense } from 'react'
import Link from 'next/link'
import { Plus, FileText, Filter, Eye, Send, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getInvoicesAction } from '@/lib/actions/invoices'
import { INVOICE_STATUS_CONFIG, formatCurrency } from '@/lib/validations/invoice'
import type { InvoiceWithDetails } from '@/services/invoices'

interface InvoiceListProps {
  status?: string
}

async function InvoiceList({ status }: InvoiceListProps) {
  const filters = status && status !== 'all' ? { status: status as any } : undefined
  const result = await getInvoicesAction(filters)

  if (!result.success) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto h-8 w-8 mb-2" />
            <p>Failed to load invoices</p>
            <p className="text-sm text-red-600">{result.error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const invoices = result.invoices

  if (!invoices.length) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto h-8 w-8 mb-2" />
            <h3 className="text-lg font-medium">No invoices found</h3>
            <p className="text-sm">
              {status && status !== 'all' 
                ? `No invoices found with status: ${status}`
                : 'Create your first invoice to get started'
              }
            </p>
            <Link href="/invoices/new">
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: InvoiceWithDetails }) {
  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status as keyof typeof INVOICE_STATUS_CONFIG]
  const isOverdue = invoice.status === 'sent' && new Date(invoice.due_date) < new Date()
  const actualStatus = isOverdue ? 'overdue' : invoice.status
  const actualConfig = isOverdue ? INVOICE_STATUS_CONFIG.overdue : statusConfig

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-lg font-semibold">{invoice.invoice_number}</h3>
              <Badge 
                variant="outline" 
                className={actualConfig.color}
              >
                {actualConfig.label}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Customer:</span> {invoice.customer.name}
              </p>
              <p>
                <span className="font-medium">Issued:</span> {new Date(invoice.issued_date).toLocaleDateString()}
              </p>
              <p>
                <span className="font-medium">Due:</span> {new Date(invoice.due_date).toLocaleDateString()}
                {isOverdue && (
                  <span className="ml-2 text-red-600 font-medium">
                    ({Math.ceil((Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue)
                  </span>
                )}
              </p>
              {invoice.job && (
                <p>
                  <span className="font-medium">Job:</span> Window cleaning - {invoice.job.service_address?.street_address}
                </p>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatCurrency(invoice.total_cents)}
            </div>
            
            <div className="flex gap-2">
              <Link href={`/invoices/${invoice.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </Link>
              
              {invoice.status === 'draft' && (
                <Link href={`/invoices/${invoice.id}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </Link>
              )}
              
              {invoice.status === 'draft' && (
                <Button 
                  size="sm"
                  onClick={() => {
                    // TODO: Implement send action
                    console.log('Send invoice:', invoice.id)
                  }}
                >
                  <Send className="mr-1 h-3 w-3" />
                  Send
                </Button>
              )}
              
              {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                <Button 
                  size="sm"
                  onClick={() => {
                    // TODO: Implement mark as paid action  
                    console.log('Mark as paid:', invoice.id)
                  }}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Mark Paid
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function InvoiceStats({ status }: { status?: string }) {
  return (
    <Suspense fallback={
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    }>
      <InvoiceStatsContent status={status} />
    </Suspense>
  )
}

async function InvoiceStatsContent({ status }: { status?: string }) {
  const [allResult, draftResult, sentResult, paidResult] = await Promise.all([
    getInvoicesAction(),
    getInvoicesAction({ status: 'draft' }),
    getInvoicesAction({ status: 'sent' }),
    getInvoicesAction({ status: 'paid' })
  ])

  const allInvoices = allResult.success ? allResult.invoices : []
  const draftInvoices = draftResult.success ? draftResult.invoices : []
  const sentInvoices = sentResult.success ? sentResult.invoices : []
  const paidInvoices = paidResult.success ? paidResult.invoices : []

  const totalDraft = draftInvoices.reduce((sum, inv) => sum + inv.total_cents, 0)
  const totalSent = sentInvoices.reduce((sum, inv) => sum + inv.total_cents, 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total_cents, 0)

  const overdueInvoices = sentInvoices.filter(inv => 
    new Date(inv.due_date) < new Date()
  )
  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.total_cents, 0)

  const stats = [
    {
      label: 'Total Invoices',
      value: allInvoices.length.toString(),
      amount: formatCurrency(totalDraft + totalSent + totalPaid),
      icon: FileText,
      active: !status || status === 'all'
    },
    {
      label: 'Draft',
      value: draftInvoices.length.toString(),
      amount: formatCurrency(totalDraft),
      icon: FileText,
      active: status === 'draft'
    },
    {
      label: 'Awaiting Payment',
      value: sentInvoices.length.toString(),
      amount: formatCurrency(totalSent),
      icon: Send,
      active: status === 'sent'
    },
    {
      label: 'Overdue',
      value: overdueInvoices.length.toString(),
      amount: formatCurrency(totalOverdue),
      icon: AlertCircle,
      active: status === 'overdue',
      urgent: overdueInvoices.length > 0
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card key={index} className={stat.active ? 'ring-2 ring-blue-500' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className={`text-2xl font-bold ${stat.urgent ? 'text-red-600' : 'text-gray-900'}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.amount}</p>
                </div>
              </div>
              <stat.icon className={`h-5 w-5 ${stat.urgent ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

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

      <InvoiceStats status={status} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={status} onValueChange={(value) => {
                const url = new URL(window.location.href)
                if (value === 'all') {
                  url.searchParams.delete('status')
                } else {
                  url.searchParams.set('status', value)
                }
                window.history.pushState({}, '', url.toString())
                window.location.reload()
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Invoices</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardDescription>
            {status === 'all' 
              ? 'All your invoices across all statuses'
              : `Invoices with status: ${INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG]?.label || status}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <InvoiceList status={status} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}