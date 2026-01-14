'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Edit, 
  Send, 
  CheckCircle, 
  Download, 
  Trash2,
  MoreVertical,
  Copy,
  Eye
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import {
  markAsSentAction,
  markAsPaidAction,
  deleteInvoiceAction,
  sendInvoiceAction
} from '@/lib/actions/invoices'
import {
  isInvoiceEditable,
  isInvoiceDeletable,
  canMarkAsSent,
  canMarkAsPaid
} from '@/lib/validations/invoice'
import type { InvoiceWithDetails } from '@/services/invoices'

interface InvoiceActionsProps {
  invoice: InvoiceWithDetails
}

export function InvoiceActions({ invoice }: InvoiceActionsProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false)

  const handleMarkAsSent = () => {
    startTransition(async () => {
      const result = await markAsSentAction(invoice.id)
      if (result.success) {
        router.refresh()
      } else {
        console.error('Failed to mark as sent:', result.error)
        // TODO: Show error toast
      }
    })
  }

  const handleSendInvoice = () => {
    startTransition(async () => {
      const result = await sendInvoiceAction(invoice.id)
      if (result.success) {
        router.refresh()
      } else {
        console.error('Failed to send invoice:', result.error)
        // TODO: Show error toast
      }
    })
  }

  const handleMarkAsPaid = () => {
    startTransition(async () => {
      const result = await markAsPaidAction(invoice.id)
      if (result.success) {
        setShowMarkPaidDialog(false)
        router.refresh()
      } else {
        console.error('Failed to mark as paid:', result.error)
        // TODO: Show error toast
      }
    })
  }

  const handleDeleteInvoice = () => {
    startTransition(async () => {
      const result = await deleteInvoiceAction(invoice.id)
      if (result.success) {
        router.push('/invoices')
      } else {
        console.error('Failed to delete invoice:', result.error)
        // TODO: Show error toast
      }
    })
  }

  const handleDuplicateInvoice = () => {
    // Navigate to new invoice with pre-filled data
    router.push(`/invoices/new?duplicate=${invoice.id}`)
  }

  const handleDownloadPDF = () => {
    // TODO: Implement PDF generation
    console.log('Download PDF for invoice:', invoice.id)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Primary Actions */}
      {isInvoiceEditable(invoice.status) && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
          disabled={isPending}
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      )}

      {canMarkAsSent(invoice.status) && (
        <Button 
          size="sm"
          onClick={handleSendInvoice}
          disabled={isPending}
        >
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      )}

      {canMarkAsPaid(invoice.status) && (
        <Button 
          size="sm"
          onClick={() => setShowMarkPaidDialog(true)}
          disabled={isPending}
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Mark Paid
        </Button>
      )}

      {/* Secondary Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isPending}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}`)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleDuplicateInvoice}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>

          {canMarkAsSent(invoice.status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleMarkAsSent}>
                <Send className="mr-2 h-4 w-4" />
                Mark as Sent
              </DropdownMenuItem>
            </>
          )}

          {canMarkAsPaid(invoice.status) && (
            <DropdownMenuItem onClick={() => setShowMarkPaidDialog(true)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </DropdownMenuItem>
          )}

          {isInvoiceDeletable(invoice.status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice {invoice.invoice_number}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteInvoice}
              className="bg-red-600 hover:bg-red-700"
              disabled={isPending}
            >
              {isPending ? 'Deleting...' : 'Delete Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Mark as Paid Confirmation Dialog */}
      <AlertDialog open={showMarkPaidDialog} onOpenChange={setShowMarkPaidDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark Invoice as Paid</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark invoice {invoice.invoice_number} as paid? 
              This will update the invoice status and cannot be easily undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkAsPaid}
              disabled={isPending}
            >
              {isPending ? 'Updating...' : 'Mark as Paid'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}