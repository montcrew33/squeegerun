"use client"

import { format, isSameDay } from "date-fns"
import { JobBlock } from "./job-block"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { JobWithDetails } from "@/services/jobs"

interface DayViewProps {
  date: Date
  jobs: JobWithDetails[]
}

export function DayView({ date, jobs }: DayViewProps) {
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM to 7 PM
  
  const dayJobs = jobs.filter(job => 
    isSameDay(new Date(job.scheduled_date), date)
  )

  const getJobsForTimeSlot = (hour: number) => {
    return dayJobs.filter(job => {
      if (!job.scheduled_time_start) return hour === 9 // Default to 9 AM for jobs without time
      
      const jobHour = parseInt(job.scheduled_time_start.split(':')[0])
      return jobHour === hour
    })
  }

  const formatTimeSlot = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour
    return `${displayHour}:00 ${ampm}`
  }

  const allDayJobs = dayJobs.filter(job => !job.scheduled_time_start)

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Day Header */}
      <div className="p-4 border-b bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {dayJobs.length} job{dayJobs.length !== 1 ? 's' : ''} scheduled
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/jobs/new?date=${format(date, 'yyyy-MM-dd')}`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Link>
          </Button>
        </div>
      </div>

      {/* All Day Events */}
      {allDayJobs.length > 0 && (
        <div className="p-4 border-b bg-blue-50/50">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">All Day</h4>
          <div className="space-y-2">
            {allDayJobs.map((job) => (
              <JobBlock
                key={job.id}
                job={job}
                size="medium"
              />
            ))}
          </div>
        </div>
      )}

      {/* Time Slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {timeSlots.map((hour) => {
          const timeSlotJobs = getJobsForTimeSlot(hour)
          
          return (
            <div key={hour} className="flex border-b last:border-b-0 min-h-[80px]">
              {/* Time label */}
              <div className="w-20 p-4 border-r bg-muted/10 flex items-start">
                <span className="text-sm text-muted-foreground font-medium">
                  {formatTimeSlot(hour)}
                </span>
              </div>
              
              {/* Job content */}
              <div className="flex-1 p-3 space-y-2">
                {timeSlotJobs.length > 0 ? (
                  timeSlotJobs.map((job) => (
                    <JobBlock
                      key={job.id}
                      job={job}
                      size="large"
                    />
                  ))
                ) : (
                  <div className="h-full flex items-center">
                    <Button 
                      variant="ghost" 
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link href={`/jobs/new?date=${format(date, 'yyyy-MM-dd')}&time=${hour.toString().padStart(2, '0')}:00`}>
                        <Plus className="h-3 w-3 mr-1" />
                        Add job at {formatTimeSlot(hour)}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {dayJobs.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No jobs scheduled for this day</p>
          <Button asChild>
            <Link href={`/jobs/new?date=${format(date, 'yyyy-MM-dd')}`}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule a Job
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}