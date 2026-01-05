import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCustomers } from "@/services/customers"
import { getAllServiceAddresses } from "@/services/service-addresses"
import { getUsers } from "@/services/users"
import { NewJobForm } from "@/components/new-job-form"

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

export default async function NewJobPage() {
  try {
    const [customersData, serviceAddressesData, usersData] = await Promise.all([
      getCustomers(),
      getAllServiceAddresses(),
      getUsers()
    ])

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
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule New Job</h1>
            <p className="text-muted-foreground">
              Create a new window cleaning appointment
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
              <NewJobForm
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
    console.error('Error loading form data:', error)
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Schedule New Job</h1>
            <p className="text-muted-foreground">
              Failed to load form data
            </p>
          </div>
        </div>
      </div>
    )
  }
}