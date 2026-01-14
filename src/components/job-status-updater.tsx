"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JOB_STATUS_LABELS } from "@/lib/validations/job"
import { updateJobStatusAction } from "@/lib/actions/jobs"
import { toast } from "sonner"

interface JobStatusUpdaterProps {
  jobId: string
  currentStatus: string
}

export function JobStatusUpdater({ jobId, currentStatus }: JobStatusUpdaterProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    setIsLoading(true)
    try {
      const result = await updateJobStatusAction(jobId, newStatus)
      if (result.success) {
        toast.success(`Job status updated to ${JOB_STATUS_LABELS[newStatus as keyof typeof JOB_STATUS_LABELS]}`)
        // Page will refresh due to revalidatePath in the action
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

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Update Status</label>
      <Select
        value={currentStatus}
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
    </div>
  )
}