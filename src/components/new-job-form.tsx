"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { JobForm } from "@/components/forms/job-form"
import { createJobAction } from "@/lib/actions/jobs"
import type { JobFormData } from "@/lib/validations/job"
import { toast } from "sonner"

interface Customer {
  id: string
  name: string
}

interface ServiceAddress {
  id: string
  label: string
  street_address: string
  city: string
}

interface User {
  id: string
  full_name: string
}

interface NewJobFormProps {
  customers: Customer[]
  serviceAddresses: ServiceAddress[]
  users: User[]
}

export function NewJobForm({ customers, serviceAddresses, users }: NewJobFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: JobFormData) => {
    setIsLoading(true)
    try {
      const result = await createJobAction(data)
      
      if (result.success && result.job) {
        toast.success("Job scheduled successfully!")
        router.push(`/jobs/${result.job.id}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error creating job:', error)
      toast.error("Failed to schedule job")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/jobs")
  }

  return (
    <JobForm
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
      customers={customers}
      serviceAddresses={serviceAddresses}
      users={users}
    />
  )
}