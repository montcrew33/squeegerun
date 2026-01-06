"use client"

import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addDays, startOfWeek, endOfWeek } from "date-fns"
import { JobBlock } from "./job-block"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import type { JobWithDetails } from "@/services/jobs"

interface MonthViewProps {
  month: Date
  jobs: JobWithDetails[]
}

export function MonthView({ month, jobs }: MonthViewProps) {
  const monthStart = startOfMonth(month)
  const monthEnd = endOfMonth(month)
  
  // Get the calendar grid (includes days from previous/next month to fill the grid)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => 
      isSameDay(new Date(job.scheduled_date), date)
    )
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Month Header */}
      <div className="p-4 border-b bg-muted/20">
        <h3 className="text-lg font-semibold">
          {format(month, 'MMMM yyyy')}
        </h3>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center border-r last:border-r-0 bg-muted/10">
            <span className="text-sm font-medium text-muted-foreground">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, index) => {
          const dayJobs = getJobsForDay(date)
          const isCurrentMonth = isSameMonth(date, month)
          const isTodayDate = isToday(date)
          
          return (
            <div 
              key={index} 
              className={`min-h-[120px] border-r border-b last-in-row:border-r-0 last-row:border-b-0 p-2 ${
                !isCurrentMonth ? 'bg-muted/30' : ''
              }`}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  isTodayDate 
                    ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' 
                    : isCurrentMonth 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }`}>
                  {format(date, 'd')}
                </span>
                
                {isCurrentMonth && dayJobs.length === 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/jobs/new?date=${format(date, 'yyyy-MM-dd')}`}>
                      <Plus className="h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>

              {/* Jobs for this day */}
              <div className="space-y-1">
                {dayJobs.slice(0, 3).map((job) => (
                  <JobBlock
                    key={job.id}
                    job={job}
                    size="tiny"
                  />
                ))}
                
                {/* Show overflow indicator */}
                {dayJobs.length > 3 && (
                  <div className="text-xs text-muted-foreground bg-muted rounded px-1 py-0.5">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>

              {/* Empty state for current month */}
              {isCurrentMonth && dayJobs.length === 0 && (
                <div className="group">
                  <Button 
                    variant="ghost" 
                    className="w-full h-8 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    asChild
                  >
                    <Link href={`/jobs/new?date=${format(date, 'yyyy-MM-dd')}`}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Month Summary */}
      <div className="p-4 border-t bg-muted/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} this month
          </span>
          <Button variant="outline" size="sm" asChild>
            <Link href="/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}