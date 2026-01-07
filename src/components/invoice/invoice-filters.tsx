'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Filter } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function InvoiceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'all'

  const handleStatusChange = (value: string) => {
    const url = new URL(window.location.href)
    if (value === 'all') {
      url.searchParams.delete('status')
    } else {
      url.searchParams.set('status', value)
    }
    router.push(url.toString())
  }

  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4 text-gray-500" />
      <Select value={status} onValueChange={handleStatusChange}>
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
  )
}