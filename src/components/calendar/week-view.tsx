"use client"

import { format, addDays, isSameDay } from "date-fns"
import { JobBlock } from "./job-block"
import type { JobWithDetails } from "@/services/jobs"

interface WeekViewProps {
  weekStart: Date
  jobs: JobWithDetails[]
}

export function WeekView({ weekStart, jobs }: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM to 7 PM

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => 
      isSameDay(new Date(job.scheduled_date), date)
    )
  }

  const getJobsForTimeSlot = (date: Date, hour: number) => {
    const dayJobs = getJobsForDay(date)
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

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Days Header */}
      <div className="grid grid-cols-8 border-b">
        {/* Time column header */}
        <div className="p-3 border-r bg-muted/50">
          <span className="text-sm font-medium text-muted-foreground">Time</span>
        </div>
        
        {/* Day headers */}
        {days.map((day, index) => (
          <div key={index} className="p-3 text-center border-r last:border-r-0">
            <div className="text-sm font-medium text-muted-foreground">
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg font-semibold ${
              isSameDay(day, new Date()) 
                ? 'text-blue-600 bg-blue-50 rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1' 
                : ''
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time Slots */}
      <div className="max-h-[600px] overflow-y-auto">
        {timeSlots.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b last:border-b-0 min-h-[60px]">
            {/* Time label */}
            <div className="p-3 border-r bg-muted/20 flex items-start">
              <span className="text-sm text-muted-foreground font-medium">
                {formatTimeSlot(hour)}
              </span>
            </div>
            
            {/* Day columns */}
            {days.map((day, dayIndex) => {
              const timeSlotJobs = getJobsForTimeSlot(day, hour)
              
              return (
                <div 
                  key={dayIndex} 
                  className="border-r last:border-r-0 p-1 min-h-[60px] relative"
                >
                  {timeSlotJobs.map((job, jobIndex) => (
                    <JobBlock
                      key={job.id}
                      job={job}
                      className="mb-1 last:mb-0"
                      size="small"
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* All Day Events */}
      <div className="border-t bg-muted/10">
        <div className="grid grid-cols-8">
          <div className="p-2 border-r bg-muted/20">
            <span className="text-xs text-muted-foreground font-medium">All Day</span>
          </div>
          {days.map((day, dayIndex) => {
            const allDayJobs = getJobsForDay(day).filter(job => !job.scheduled_time_start)
            
            return (
              <div key={dayIndex} className="border-r last:border-r-0 p-1 min-h-[40px]">
                {allDayJobs.map((job) => (
                  <JobBlock
                    key={job.id}
                    job={job}
                    className="mb-1 last:mb-0"
                    size="small"
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}