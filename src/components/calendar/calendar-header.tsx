"use client"

import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

type CalendarView = 'day' | 'week' | 'month'

interface CalendarHeaderProps {
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  currentDate: Date
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
}

export function CalendarHeader({
  view,
  onViewChange,
  currentDate,
  onPrevious,
  onNext,
  onToday
}: CalendarHeaderProps) {
  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      case 'week':
        // For week view, show the week range
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${format(weekStart, 'MMMM d')} - ${format(weekEnd, 'd, yyyy')}`
        } else {
          return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
        }
      case 'month':
        return format(currentDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
      {/* Date Navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center min-w-[200px]">
          <h2 className="text-lg font-semibold">
            {getDateRangeText()}
          </h2>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
        >
          Today
        </Button>
      </div>

      {/* View Toggle */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
        <Button
          variant={view === 'day' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('day')}
          className="h-8"
        >
          Day
        </Button>
        <Button
          variant={view === 'week' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('week')}
          className="h-8"
        >
          Week
        </Button>
        <Button
          variant={view === 'month' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewChange('month')}
          className="h-8"
        >
          Month
        </Button>
      </div>
    </div>
  )
}