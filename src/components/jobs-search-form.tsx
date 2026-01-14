"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JOB_STATUS_LABELS } from "@/lib/validations/job"
import Link from "next/link"

export function JobsSearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get('search') || ''
  const statusFilter = searchParams.get('status') || 'all'
  const dateFromFilter = searchParams.get('dateFrom') || ''
  const dateToFilter = searchParams.get('dateTo') || ''

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const params = new URLSearchParams()
    const search = formData.get('search')?.toString()
    const status = formData.get('status')?.toString()
    const dateFrom = formData.get('dateFrom')?.toString()
    const dateTo = formData.get('dateTo')?.toString()
    
    if (search) params.set('search', search)
    if (status && status !== 'all') params.set('status', status)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    
    const currentView = searchParams.get('view')
    if (currentView) params.set('view', currentView)
    
    const queryString = params.toString()
    router.push(`/jobs${queryString ? `?${queryString}` : ''}`)
  }

  const hasFilters = searchQuery || (statusFilter && statusFilter !== 'all') || dateFromFilter || dateToFilter

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium">
            Search
          </label>
          <Input
            id="search"
            name="search"
            placeholder="Search customers or addresses..."
            defaultValue={searchQuery}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">
            Status
          </label>
          <Select name="status" defaultValue={statusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.entries(JOB_STATUS_LABELS).map(([status, label]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="dateFrom" className="text-sm font-medium">
            From Date
          </label>
          <Input
            id="dateFrom"
            name="dateFrom"
            type="date"
            defaultValue={dateFromFilter}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="dateTo" className="text-sm font-medium">
            To Date
          </label>
          <Input
            id="dateTo"
            name="dateTo"
            type="date"
            defaultValue={dateToFilter}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit">Apply Filters</Button>
        {hasFilters && (
          <Button asChild variant="outline">
            <Link href="/jobs">Clear Filters</Link>
          </Button>
        )}
      </div>
    </form>
  )
}