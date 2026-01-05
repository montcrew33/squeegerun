"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Eye, Edit, Trash2, Calendar, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Database } from "@/types/database.types"
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/lib/validations/job"

type Job = Database['public']['Tables']['jobs']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  service_address: Database['public']['Tables']['service_addresses']['Row']
  assigned_user?: Database['public']['Tables']['profiles']['Row'] | null
}

interface JobsTableProps {
  jobs: Job[]
}

export function JobsTable({ jobs }: JobsTableProps) {
  const [sortBy, setSortBy] = useState<'scheduled_date' | 'status' | 'customer_name' | 'created_at'>('scheduled_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let aValue: string | number | Date
    let bValue: string | number | Date

    switch (sortBy) {
      case 'scheduled_date':
        aValue = new Date(a.scheduled_date)
        bValue = new Date(b.scheduled_date)
        break
      case 'customer_name':
        aValue = a.customer.name.toLowerCase()
        bValue = b.customer.name.toLowerCase()
        break
      case 'status':
        aValue = a.status || ''
        bValue = b.status || ''
        break
      case 'created_at':
        aValue = new Date(a.created_at || '')
        bValue = new Date(b.created_at || '')
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
    return 0
  })

  const getStatusBadgeVariant = (status: string | null) => {
    const color = status ? JOB_STATUS_COLORS[status as keyof typeof JOB_STATUS_COLORS] : 'gray'
    switch (color) {
      case 'green': return 'default'
      case 'blue': return 'default'
      case 'yellow': return 'secondary'
      case 'orange': return 'destructive'
      case 'red': return 'destructive'
      case 'gray': return 'secondary'
      default: return 'secondary'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatPrice = (priceCents: number | null) => {
    if (!priceCents) return null
    return `$${(priceCents / 100).toFixed(2)}`
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold">No jobs scheduled</h3>
        <p className="text-muted-foreground mb-6">Get started by creating your first job.</p>
        <Button asChild>
          <Link href="/jobs/new">Schedule First Job</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('scheduled_date')}
            >
              Scheduled Date {sortBy === 'scheduled_date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('customer_name')}
            >
              Customer {sortBy === 'customer_name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Time</TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleSort('status')}
            >
              Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
            </TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedJobs.map((job) => (
            <TableRow 
              key={job.id} 
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => window.location.href = `/jobs/${job.id}`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {formatDate(job.scheduled_date)}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{job.customer.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                    {job.customer.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{job.service_address.label || 'Address'}</div>
                  <div className="text-muted-foreground truncate max-w-[200px]">
                    {job.service_address.street_address}, {job.service_address.city}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {job.scheduled_time_start || job.scheduled_time_end ? (
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {formatTime(job.scheduled_time_start)}
                    {job.scheduled_time_end && ' - '}
                    {formatTime(job.scheduled_time_end)}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">All day</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(job.status)}>
                  {job.status ? JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] : 'Unknown'}
                </Badge>
              </TableCell>
              <TableCell>
                {formatPrice(job.price_cents) && (
                  <span className="font-medium">{formatPrice(job.price_cents)}</span>
                )}
              </TableCell>
              <TableCell>
                {job.assigned_user ? (
                  <span className="text-sm">{job.assigned_user.full_name}</span>
                ) : (
                  <span className="text-muted-foreground text-sm">Unassigned</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/jobs/${job.id}`} className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/jobs/${job.id}/edit`} className="flex items-center gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}