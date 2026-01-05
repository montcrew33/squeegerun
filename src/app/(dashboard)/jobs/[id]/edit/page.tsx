import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getJob } from "@/services/jobs"
import { getCustomers } from "@/services/customers"
import { getAllServiceAddresses } from "@/services/service-addresses"
import { getUsers } from "@/services/users"
import type { JobFormData } from "@/lib/validations/job"
import { EditJobForm } from "@/components/edit-job-form"

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

interface EditJobPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  try {
    const { id } = await params
    
    const [job, customersData, serviceAddressesData, usersData] = await Promise.all([
      getJob(id),
      getCustomers(),
      getAllServiceAddresses(),
      getUsers()
    ])

    // Transform job data to form format
    const jobData: JobFormData = {
      customer_id: job.customer_id,
      service_address_id: job.service_address_id,
      scheduled_date: job.scheduled_date,
      scheduled_time_start: job.scheduled_time_start || '',
      scheduled_time_end: job.scheduled_time_end || '',
      price: job.price_cents ? job.price_cents / 100 : undefined,
      notes: job.notes || '',
      assigned_to: job.assigned_to || '',
    }

    const customers: Customer[] = customersData.map(customer => ({
      id: customer.id,
      name: customer.name
    }))

    const serviceAddresses: ServiceAddress[] = serviceAddressesData.map(address => ({
      id: address.id,
      label: address.label || 'Unlabeled Address',
      street_address: address.street_address,
      city: address.city
    }))

    const users: User[] = usersData.map(user => ({
      id: user.id,
      full_name: user.full_name || 'Unnamed User'
    }))

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/jobs/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Job</h1>
            <p className="text-muted-foreground">
              Update job details and scheduling
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <EditJobForm
                jobId={id}
                initialData={jobData}
                customers={customers}
                serviceAddresses={serviceAddresses}
                users={users}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading job data:', error)
    notFound()
  }
}