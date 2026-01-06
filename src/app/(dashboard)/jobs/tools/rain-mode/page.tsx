"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, CloudRain, Calendar, Users, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AffectedJobsList } from "@/components/rain-mode/affected-jobs-list"
import { RescheduleOptions } from "@/components/rain-mode/reschedule-options"
import { NotificationPreview } from "@/components/rain-mode/notification-preview"
import { getJobsForRainModeAction, rainModeRescheduleAction } from "@/lib/actions/rain-mode"
import { RAIN_DELAY_EMAIL_TEMPLATE } from "@/lib/constants"
import { format } from "date-fns"
import { formatDateSafely, getTodayString } from "@/lib/date-utils"
import type { JobForReschedule } from "@/services/rain-mode"

type ViewState = 'setup' | 'processing' | 'success' | 'error'

export default function RainModePage() {
  const router = useRouter()
  const [viewState, setViewState] = useState<ViewState>('setup')

  // Form state
  const [selectedDate, setSelectedDate] = useState(getTodayString())
  const [newDate, setNewDate] = useState('')
  const [jobs, setJobs] = useState<JobForReschedule[]>([])
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [notifyCustomers, setNotifyCustomers] = useState(true)
  const [notificationChannel, setNotificationChannel] = useState<'email' | 'sms' | 'both'>('email')
  const [customMessage, setCustomMessage] = useState(RAIN_DELAY_EMAIL_TEMPLATE)
  
  // Result state
  const [result, setResult] = useState<{
    success: number
    failed: number
    notificationsSent: number
    errors: string[]
  } | null>(null)
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load jobs when date changes
  useEffect(() => {
    if (selectedDate) {
      loadJobsForDate(selectedDate)
    }
  }, [selectedDate])

  const loadJobsForDate = async (date: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await getJobsForRainModeAction(date)
      
      if (response.success) {
        setJobs(response.jobs)
        // Auto-select all jobs by default
        setSelectedJobIds(response.jobs.map(job => job.id))
      } else {
        setError(response.error || 'Failed to load jobs')
        setJobs([])
        setSelectedJobIds([])
      }
    } catch (err) {
      setError('Failed to load jobs')
      setJobs([])
      setSelectedJobIds([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!newDate || selectedJobIds.length === 0) {
      setError('Please select a new date and at least one job to reschedule')
      return
    }

    setViewState('processing')
    setError(null)

    try {
      const result = await rainModeRescheduleAction(
        selectedDate,
        newDate,
        selectedJobIds,
        {
          notify: notifyCustomers,
          customMessage: customMessage,
          channel: notificationChannel
        }
      )

      setResult(result)
      
      if (result.errors.length > 0) {
        setViewState('error')
        setError(result.errors.join('; '))
      } else {
        setViewState('success')
      }
    } catch (err) {
      setViewState('error')
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  const resetForm = () => {
    setViewState('setup')
    setNewDate('')
    setSelectedJobIds([])
    setResult(null)
    setError(null)
    // Reload jobs for the selected date
    loadJobsForDate(selectedDate)
  }

  const canProceed = newDate && selectedJobIds.length > 0

  // Processing view
  if (viewState === 'processing') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CloudRain className="h-16 w-16 mx-auto text-orange-500 animate-pulse mb-4" />
              <h2 className="text-xl font-semibold mb-2">Rescheduling Jobs...</h2>
              <p className="text-muted-foreground mb-4">
                Moving {selectedJobIds.length} jobs to {format(new Date(newDate), 'EEEE, MMMM d')}
              </p>
              {notifyCustomers && (
                <p className="text-sm text-muted-foreground">
                  Sending notifications to customers...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success view
  if (viewState === 'success' && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Done!</h2>
              <p className="text-muted-foreground mb-6">
                {result.success} job{result.success !== 1 ? 's' : ''} rescheduled
                {result.notificationsSent > 0 && (
                  <>, {result.notificationsSent} customer{result.notificationsSent !== 1 ? 's' : ''} notified</>
                )}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium mb-1">
                  Your customers know the plan.
                </p>
                <p className="text-green-700 text-sm">
                  No phone calls needed - they'll see you on {formatDateSafely(newDate, 'EEEE, MMMM d')}.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link href="/jobs">
                    View Rescheduled Jobs
                  </Link>
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reschedule More Jobs
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    Back to Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error view
  if (viewState === 'error') {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
              <p className="text-muted-foreground mb-6">
                {error || 'An unexpected error occurred while rescheduling jobs'}
              </p>
              
              {result && result.success > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 text-sm">
                    {result.success} job{result.success !== 1 ? 's' : ''} were successfully rescheduled, 
                    but {result.failed} failed.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={resetForm}>
                  Try Again
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/jobs">
                    View Jobs
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main setup view
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CloudRain className="h-8 w-8 text-orange-600" />
            </div>
            Rain Mode
          </h1>
          <p className="text-muted-foreground">
            Reschedule and notify customers in one tap
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && viewState === 'setup' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Section 1: What's affected */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                What's Affected
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Select the date with jobs to reschedule
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="affected-date" className="block text-sm font-medium mb-2">
                  Date with jobs to reschedule
                </label>
                <Input
                  id="affected-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  // Allow selecting future dates in case weather delays affect planned jobs
                />
              </div>
              
              {selectedDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    {isLoading ? (
                      'Loading jobs...'
                    ) : (
                      <>
                        <strong>{jobs.length}</strong> jobs scheduled for{' '}
                        <strong>{formatDateSafely(selectedDate, 'EEEE, MMMM d')}</strong>
                      </>
                    )}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Section 2: When to reschedule */}
          <RescheduleOptions
            originalDate={selectedDate}
            selectedDate={newDate}
            onDateSelect={setNewDate}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Section 3: Notify customers */}
          <NotificationPreview
            message={customMessage}
            onMessageChange={setCustomMessage}
            originalDate={selectedDate}
            newDate={newDate || selectedDate}
            channel={notificationChannel}
            onChannelChange={setNotificationChannel}
            enabled={notifyCustomers}
            onEnabledChange={setNotifyCustomers}
          />
        </div>
      </div>

      {/* Section 1.5: Affected Jobs List (full width) */}
      {!isLoading && jobs.length > 0 && (
        <AffectedJobsList
          jobs={jobs}
          selectedIds={selectedJobIds}
          onSelectionChange={setSelectedJobIds}
        />
      )}

      {/* Section 4: Confirm */}
      {jobs.length > 0 && newDate && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-orange-900">Ready to Reschedule</h3>
                <p className="text-orange-700 text-sm">
                  Move {selectedJobIds.length} job{selectedJobIds.length !== 1 ? 's' : ''} from{' '}
                  {format(new Date(selectedDate), 'MMM d')} → {format(new Date(newDate), 'MMM d')}
                  {notifyCustomers && (
                    <> and notify {selectedJobIds.length} customer{selectedJobIds.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleReschedule}
                  disabled={!canProceed}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <CloudRain className="h-4 w-4 mr-2" />
                  Reschedule & {notifyCustomers ? 'Notify' : 'Update'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}