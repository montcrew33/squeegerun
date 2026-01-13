"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { createCustomerAction } from "@/lib/actions/customers"
import { CustomerForm } from "@/components/forms/customer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerFormData } from "@/lib/validations/customer"
import { toast } from "sonner"

export default function NewCustomerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: CustomerFormData) => {
    setIsLoading(true)
    try {
      const result = await createCustomerAction(data)

      if (result.success && result.customer) {
        toast.success("Customer created successfully!")
        router.push(`/customers/${result.customer.id}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      toast.error("Failed to create customer")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/customers")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Customer</h1>
          <p className="text-muted-foreground">
            Create a new customer profile to track jobs and service addresses
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