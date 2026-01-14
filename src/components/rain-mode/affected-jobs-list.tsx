"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Mail, Phone, User } from "lucide-react"
import { format } from "date-fns"
import type { JobForReschedule } from "@/services/rain-mode"

interface AffectedJobsListProps {
  jobs: JobForReschedule[]
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export function AffectedJobsList({ 
  jobs, 
  selectedIds, 
  onSelectionChange 
}: AffectedJobsListProps) {
  const [showAll, setShowAll] = useState(false)
  
  const displayedJobs = showAll ? jobs : jobs.slice(0, 5)
  
  const handleJobToggle = (jobId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, jobId])
    } else {
      onSelectionChange(selectedIds.filter(id => id !== jobId))
    }
  }
  
  const handleSelectAll = () => {
    if (selectedIds.length === jobs.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(jobs.map(job => job.id))
    }
  }
  
  const formatTime = (time?: string) => {
    if (!time) return null
    try {
      return format(new Date(`1970-01-01T${time}`), 'h:mm a')
    } catch {
      return time
    }
  }

  const formatPrice = (priceCents?: number) => {
    if (!priceCents) return null
    return `$${(priceCents / 100).toFixed(2)}`
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No jobs found for this date</p>
            <p className="text-sm text-muted-foreground">
              Try selecting a different date or check if jobs have already been completed or cancelled.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Jobs to Reschedule ({jobs.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {selectedIds.length === jobs.length ? 'Deselect All' : 'Select All'}
            </Button>
            {selectedIds.length > 0 && (
              <Badge variant="secondary">
                {selectedIds.length} selected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedJobs.map((job) => {
          const isSelected = selectedIds.includes(job.id)
          const hasContactInfo = job.customer.email || job.customer.phone
          
          return (
            <div
              key={job.id}
              className={`p-4 border rounded-lg transition-colors ${
                isSelected ? 'border-orange-200 bg-orange-50' : 'border-border'
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => handleJobToggle(job.id, !!checked)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">
                        {job.customer.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        {job.scheduled_time_start && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTime(job.scheduled_time_start)}</span>
                            {job.scheduled_time_end && (
                              <span>- {formatTime(job.scheduled_time_end)}</span>
                            )}
                          </div>
                        )}
                        {formatPrice(job.price_cents) && (
                          <Badge variant="outline" className="text-xs">
                            {formatPrice(job.price_cents)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {job.customer.email && (
                        <span title="Has email">
                          <Mail className="h-4 w-4 text-blue-500" />
                        </span>
                      )}
                      {job.customer.phone && (
                        <span title="Has phone">
                          <Phone className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                      {!hasContactInfo && (
                        <Badge variant="destructive" className="text-xs">
                          No contact info
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate">
                        {job.service_address.street_address}
                      </div>
                      <div className="truncate">
                        {job.service_address.city}, {job.service_address.state} {job.service_address.postal_code}
                      </div>
                    </div>
                  </div>
                  
                  {job.service_address.label && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {job.service_address.label}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        
        {jobs.length > 5 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll 
                ? `Show Less (${jobs.length - 5} hidden)`
                : `Show All ${jobs.length} Jobs`
              }
            </Button>
          </div>
        )}
        
        {selectedIds.length === 0 && jobs.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Select jobs to reschedule using the checkboxes above
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              Select All {jobs.length} Jobs
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}