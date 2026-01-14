"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, ChevronRight } from "lucide-react"
import { format, addDays, startOfToday } from "date-fns"
import { parseDateSafely } from "@/lib/date-utils"

interface RescheduleOptionsProps {
  originalDate: string
  selectedDate?: string
  onDateSelect: (newDate: string) => void
}

export function RescheduleOptions({ 
  originalDate, 
  selectedDate,
  onDateSelect 
}: RescheduleOptionsProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  
  // Parse original date safely
  const originalDateObj = parseDateSafely(originalDate)
  const today = startOfToday()
  
  // Calculate suggested dates
  const tomorrow = addDays(today, 1)
  const nextWeek = addDays(originalDateObj, 7)
  
  // Ensure we don't suggest dates in the past
  const suggestedDates = [
    {
      id: 'tomorrow',
      label: 'Tomorrow',
      date: tomorrow,
      subtitle: format(tomorrow, 'EEEE, MMMM d')
    },
    {
      id: 'next-week',
      label: `Next ${format(originalDateObj, 'EEEE')}`,
      date: nextWeek,
      subtitle: format(nextWeek, 'EEEE, MMMM d')
    }
  ].filter(option => option.date >= today) // Only show future dates
  
  const handleQuickSelect = (date: Date) => {
    setShowCustomPicker(false)
    onDateSelect(format(date, 'yyyy-MM-dd'))
  }
  
  const handleCustomDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      const selectedDateObj = new Date(value)
      if (selectedDateObj >= today) {
        onDateSelect(value)
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          When to Reschedule
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose a new date for your rescheduled appointments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Options */}
        <div className="space-y-3">
          {suggestedDates.map((option) => {
            const isSelected = selectedDate === format(option.date, 'yyyy-MM-dd')
            
            return (
              <Button
                key={option.id}
                variant={isSelected ? "default" : "outline"}
                className={`w-full justify-between h-auto p-4 ${
                  isSelected ? 'bg-orange-500 hover:bg-orange-600' : ''
                }`}
                onClick={() => handleQuickSelect(option.date)}
              >
                <div className="text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">{option.subtitle}</div>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            )
          })}
          
          {/* Custom Date Option */}
          <Button
            variant={showCustomPicker ? "default" : "outline"}
            className={`w-full justify-between h-auto p-4 ${
              showCustomPicker ? 'bg-orange-500 hover:bg-orange-600' : ''
            }`}
            onClick={() => setShowCustomPicker(!showCustomPicker)}
          >
            <div className="text-left">
              <div className="font-medium">Pick a Date</div>
              <div className="text-sm opacity-75">Choose any future date</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Custom Date Picker */}
        {showCustomPicker && (
          <div className="border rounded-lg p-4 bg-muted/20">
            <label htmlFor="custom-date" className="block text-sm font-medium mb-2">
              Select Custom Date
            </label>
            <Input
              id="custom-date"
              type="date"
              min={format(today, 'yyyy-MM-dd')}
              value={selectedDate || ''}
              onChange={handleCustomDateChange}
              className="w-full"
            />
          </div>
        )}
        
        {/* Preview */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Reschedule Preview</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              Jobs will move from{' '}
              <span className="font-medium">
                {format(originalDateObj, 'EEEE, MMMM d')}
              </span>
              {' '}to{' '}
              <span className="font-medium">
                {format(new Date(selectedDate), 'EEEE, MMMM d')}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}