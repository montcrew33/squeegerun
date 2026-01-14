import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search, Upload } from "lucide-react"
import { getCustomers } from "@/services/customers"
import { CustomersTable } from "@/components/tables/customers-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function CustomersContent({ searchQuery }: { searchQuery?: string }) {
  try {
    const customers = await getCustomers()
    
    const filteredCustomers = searchQuery
      ? customers.filter(customer =>
          customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          customer.phone?.includes(searchQuery)
        )
      : customers

    return <CustomersTable customers={filteredCustomers} />
  } catch (error) {
    console.error('Error fetching customers:', error)
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">Failed to load customers. Please try again.</p>
        </CardContent>
      </Card>
    )
  }
}

function CustomersSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-muted animate-pulse rounded-md" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-md" />
        ))}
      </div>
    </div>
  )
}

interface CustomersPageProps {
  searchParams?: Promise<{ search?: string }>
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams?.search

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database and track their service addresses
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/customers/import">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Link>
          </Button>
          <Button asChild>
            <Link href="/customers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form method="GET" className="flex gap-2">
            <Input
              name="search"
              placeholder="Search by name, email, or phone..."
              defaultValue={searchQuery}
              className="max-w-sm"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
            {searchQuery && (
              <Button variant="outline" asChild>
                <Link href="/customers">Clear</Link>
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      <Suspense fallback={<CustomersSkeleton />}>
        <CustomersContent searchQuery={searchQuery} />
      </Suspense>
    </div>
  )
}