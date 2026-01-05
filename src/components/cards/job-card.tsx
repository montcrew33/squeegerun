"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, Trash2, Calendar, Clock, MapPin, User, DollarSign } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteJobAction, updateJobStatusAction } from "@/lib/actions/jobs"
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/lib/validations/job"
import type { Database } from "@/types/database.types"
import { toast } from "sonner"

type Job = Database['public']['Tables']['jobs']['Row'] & {
  customer: Database['public']['Tables']['customers']['Row']
  service_address: Database['public']['Tables']['service_addresses']['Row']
  assigned_user?: Database['public']['Tables']['profiles']['Row'] | null
}

interface JobCardProps {
  job: Job
  onUpdate?: () => void
}

export function JobCard({ job, onUpdate }: JobCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const handleStatusChange = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const result = await updateJobStatusAction(job.id, newStatus)
      if (result.success) {
        toast.success(`Job status updated to ${JOB_STATUS_LABELS[newStatus as keyof typeof JOB_STATUS_LABELS]}`)
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to update job status")
      }
    } catch (error) {
      console.error('Error updating job status:', error)
      toast.error("Failed to update job status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const result = await deleteJobAction(job.id)
      if (result.success) {
        toast.success("Job deleted successfully!")
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to delete job")
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast.error("Failed to delete job")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              {job.customer.name}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={getStatusBadgeVariant(job.status)}>
                {job.status ? JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] : 'Unknown'}
              </Badge>
              {formatPrice(job.price_cents) && (
                <div className="flex items-center gap-1 text-sm font-medium">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {formatPrice(job.price_cents)}
                </div>
              )}
            </div>
          </div>
          <CardAction>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/jobs/${job.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Job</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this job? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isLoading ? 'Deleting...' : 'Delete Job'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardAction>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDate(job.scheduled_date)}</span>
          </div>

          {(job.scheduled_time_start || job.scheduled_time_end) && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(job.scheduled_time_start)}
                {job.scheduled_time_end && ` - ${formatTime(job.scheduled_time_end)}`}
              </span>
            </div>
          )}

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{job.service_address.label || 'Address'}</div>
              <div className="text-muted-foreground">
                {job.service_address.street_address}
                {job.service_address.unit && `, Unit ${job.service_address.unit}`}
                <br />
                {job.service_address.city}, {job.service_address.state} {job.service_address.postal_code}
              </div>
            </div>
          </div>

          {job.assigned_user && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Assigned to {job.assigned_user.full_name}</span>
            </div>
          )}

          {job.notes && (
            <div className="text-sm">
              <div className="font-medium text-muted-foreground mb-1">Notes:</div>
              <div className="text-muted-foreground">{job.notes}</div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t">
          <div className="text-sm font-medium text-muted-foreground">Quick Actions</div>
          <div className="flex flex-col gap-2">
            <Select
              value={job.status || ''}
              onValueChange={handleStatusChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(JOB_STATUS_LABELS).map(([status, label]) => (
                  <SelectItem key={status} value={status}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button asChild size="sm" className="flex-1">
                <Link href={`/jobs/${job.id}`}>View Details</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/customers/${job.customer.id}`}>View Customer</Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}