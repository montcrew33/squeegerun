import { notFound } from "next/navigation"
import { getCustomer } from "@/services/customers"
import { EditCustomerForm } from "./edit-customer-form"

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

interface EditCustomerPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCustomerPage({ params }: EditCustomerPageProps) {
  const { id } = await params

  let customer
  try {
    customer = await getCustomer(id)
  } catch (error) {
    console.error('Error fetching customer:', error)
    notFound()
  }

  return (
    <EditCustomerForm customer={customer} />
  )
}