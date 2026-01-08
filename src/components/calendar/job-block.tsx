"use client"

import Link from "next/link"
import { format } from "date-fns"
import { Clock, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JobWithDetails } from "@/services/jobs"

interface JobBlockProps {
  job: JobWithDetails
  size?: 'tiny' | 'small' | 'medium' | 'large'
  className?: string
}

export function JobBlock({ job, size = 'medium', className }: JobBlockProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 border-blue-200 text-blue-800'
      case 'in_progress':
        return 'bg-orange-100 border-orange-200 text-orange-800'
      case 'completed':
        return 'bg-green-100 border-green-200 text-green-800'
      case 'cancelled':
        return 'bg-gray-100 border-gray-200 text-gray-800'
      case 'rescheduled':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const formatTime = (timeString?: string | null) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours || '0')
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatPrice = (cents?: number) => {
    if (!cents) return null
    return `$${(cents / 100).toFixed(2)}`
  }

  const sizeClasses = {
    tiny: 'p-1 text-xs',
    small: 'p-2 text-xs',
    medium: 'p-3 text-sm',
    large: 'p-4 text-sm'
  }

  const showDetails = size === 'large' || size === 'medium'
  const showTime = size !== 'tiny'
  const showAddress = size === 'large'

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className={cn(
        'block rounded-md border-l-4 border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
        getStatusColor(job.status || 'scheduled'),
        sizeClasses[size],
        className
      )}>
        <div className="space-y-1">
          {/* Customer name */}
          <div className="font-medium truncate">
            {job.customer?.name || 'Unknown Customer'}
          </div>

          {/* Time and price row */}
          {showTime && (job.scheduled_time_start || job.price_cents) && (
            <div className="flex items-center justify-between text-muted-foreground">
              {job.scheduled_time_start && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(job.scheduled_time_start)}</span>
                  {job.scheduled_time_end && size === 'large' && (
                    <span> - {formatTime(job.scheduled_time_end)}</span>
                  )}
                </div>
              )}
              
              {job.price_cents && showDetails && (
                <div className="font-medium text-foreground">
                  {formatPrice(job.price_cents)}
                </div>
              )}
            </div>
          )}

          {/* Address */}
          {showAddress && job.service_address && (
            <div className="flex items-start gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              <div className="truncate text-xs">
                {job.service_address.street_address}
                {job.service_address.city && (
                  <span>, {job.service_address.city}</span>
                )}
              </div>
            </div>
          )}

          {/* Status badge for small sizes */}
          {size === 'tiny' && job.status && job.status !== 'scheduled' && (
            <div className="text-xs font-medium capitalize">
              {job.status.replace('_', ' ')}
            </div>
          )}

          {/* Notes preview for large size */}
          {size === 'large' && job.notes && (
            <div className="text-xs text-muted-foreground truncate">
              {job.notes}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}