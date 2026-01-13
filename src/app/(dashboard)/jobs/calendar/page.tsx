"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CalendarHeader } from "@/components/calendar/calendar-header"
import { WeekView } from "@/components/calendar/week-view"
import { DayView } from "@/components/calendar/day-view"
import { MonthView } from "@/components/calendar/month-view"
import { getJobsForDateRangeAction } from "@/lib/actions/calendar"
import { format, startOfWeek, addWeeks, subWeeks, addDays, subDays, startOfMonth, addMonths, subMonths } from "date-fns"
import type { JobWithDetails } from "@/services/jobs"

type CalendarView = 'day' | 'week' | 'month'

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [jobs, setJobs] = useState<JobWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Calculate date ranges based on view and current date
  const getDateRange = () => {
    switch (view) {
      case 'day':
        return {
          start: format(currentDate, 'yyyy-MM-dd'),
          end: format(currentDate, 'yyyy-MM-dd')
        }
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
        const weekEnd = addDays(weekStart, 6)
        return {
          start: format(weekStart, 'yyyy-MM-dd'),
          end: format(weekEnd, 'yyyy-MM-dd')
        }
      case 'month':
        const monthStart = startOfMonth(currentDate)
        const monthEnd = addDays(monthStart, 31) // Get a bit extra to cover full month
        return {
          start: format(monthStart, 'yyyy-MM-dd'),
          end: format(monthEnd, 'yyyy-MM-dd')
        }
    }
  }

  // Load jobs for current date range
  useEffect(() => {
    const loadJobs = async () => {
      setIsLoading(true)
      try {
        const range = getDateRange()
        const response = await getJobsForDateRangeAction(range.start, range.end)
        if (response.success) {
          setJobs(response.jobs)
        } else {
          console.error('Error loading jobs:', response.error)
          setJobs([])
        }
      } catch (error) {
        console.error('Error loading jobs:', error)
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }

    loadJobs()
  }, [view, currentDate])

  // Navigation handlers
  const goToPrevious = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => subDays(prev, 1))
        break
      case 'week':
        setCurrentDate(prev => subWeeks(prev, 1))
        break
      case 'month':
        setCurrentDate(prev => subMonths(prev, 1))
        break
    }
  }

  const goToNext = () => {
    switch (view) {
      case 'day':
        setCurrentDate(prev => addDays(prev, 1))
        break
      case 'week':
        setCurrentDate(prev => addWeeks(prev, 1))
        break
      case 'month':
        setCurrentDate(prev => addMonths(prev, 1))
        break
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="space-y-6">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              Calendar
            </h1>
            <p className="text-muted-foreground">
              View and manage your schedule at a glance
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button asChild variant="outline">
            <Link href="/jobs">
              <List className="h-4 w-4 mr-2" />
              List View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs/new">
              Add Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Calendar Header with controls */}
      <CalendarHeader
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onToday={goToToday}
      />

      {/* Calendar Views */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-2">
              <Calendar className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'day' && (
              <DayView
                date={currentDate}
                jobs={jobs}
              />
            )}
            {view === 'week' && (
              <WeekView
                weekStart={startOfWeek(currentDate, { weekStartsOn: 0 })}
                jobs={jobs}
              />
            )}
            {view === 'month' && (
              <MonthView
                month={currentDate}
                jobs={jobs}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}