"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { updateCustomerAction } from "@/lib/actions/customers"
import { CustomerForm } from "@/components/forms/customer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerFormData } from "@/lib/validations/customer"
import type { Database } from "@/types/database.types"
import { toast } from "sonner"

type Customer = Database['public']['Tables']['customers']['Row'] & {
  service_addresses: Database['public']['Tables']['service_addresses']['Row'][]
}

interface EditCustomerFormProps {
  customer: Customer
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true)
    try {
      const result = await updateCustomerAction(customer.id, data)

      if (result.success && result.customer) {
        toast.success("Customer updated successfully!")
        router.push(`/customers/${result.customer.id}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      toast.error("Failed to update customer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push(`/customers/${customer.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/customers/${customer.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Customer</h1>
          <p className="text-muted-foreground">
            Update {customer.name}'s information
          </p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <CustomerForm
              initialData={{
                name: customer.name,
                email: customer.email || "",
                phone: customer.phone || "",
                status: customer.status as "active" | "inactive" | "prospect" || "active",
                source: customer.source as "referral" | "online" | "walk-in" | "phone" | "other" || undefined,
                notes: customer.notes || "",
              }}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}