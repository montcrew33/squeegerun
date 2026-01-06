import { Suspense } from "react"
import Link from "next/link"
import { Plus, Calendar, Briefcase, CloudRain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TabsContent } from "@/components/ui/tabs"
import { JobsTable } from "@/components/tables/jobs-table"
import { JobCard } from "@/components/cards/job-card"
import { getJobs } from "@/services/jobs"
import { JobsSearchForm } from "@/components/jobs-search-form"
import { JobsViewToggle } from "@/components/jobs-view-toggle"

interface JobsPageProps {
  searchParams: Promise<{
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    view?: 'table' | 'cards'
  }>
}

async function JobsContent({ 
  searchQuery, 
  statusFilter, 
  dateFromFilter, 
  dateToFilter,
  viewMode = 'table'
}: { 
  searchQuery?: string
  statusFilter?: string
  dateFromFilter?: string
  dateToFilter?: string
  viewMode?: 'table' | 'cards'
}) {
  const jobs = await getJobs({
    status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
    dateFrom: dateFromFilter,
    dateTo: dateToFilter,
  })

  // Client-side search filtering for customer names and addresses
  const filteredJobs = searchQuery
    ? jobs.filter(job =>
        job.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (job.service_address.label && job.service_address.label.toLowerCase().includes(searchQuery.toLowerCase())) ||
        job.service_address.street_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.service_address.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : jobs

  if (viewMode === 'cards') {
    if (filteredJobs.length === 0) {
      return (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter || dateFromFilter || dateToFilter
                  ? "No jobs match your current filters"
                  : "No jobs scheduled yet"
                }
              </p>
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule First Job
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    )
  }

  return <JobsTable jobs={filteredJobs} />
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const resolvedSearchParams = await searchParams
  const searchQuery = resolvedSearchParams?.search || ''
  const statusFilter = resolvedSearchParams?.status
  const dateFromFilter = resolvedSearchParams?.dateFrom
  const dateToFilter = resolvedSearchParams?.dateTo
  const viewMode = (resolvedSearchParams?.view as 'table' | 'cards') || 'table'

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Jobs
          </h1>
          <p className="text-muted-foreground">
            Manage and schedule window cleaning appointments
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/jobs/calendar">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline"
            className="bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600"
          >
            <Link href="/jobs/tools/rain-mode" title="Reschedule & notify customers for weather delays">
              <CloudRain className="h-4 w-4 mr-2" />
              ☁️ Rain Mode
            </Link>
          </Button>
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <JobsSearchForm />
        </CardContent>
      </Card>

      {/* View Toggle and Content */}
      <JobsViewToggle>
        <TabsContent value="table" className="space-y-4">
          <Suspense fallback={
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }>
            <JobsContent 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              dateFromFilter={dateFromFilter}
              dateToFilter={dateToFilter}
              viewMode="table"
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="cards" className="space-y-4">
          <Suspense fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          }>
            <JobsContent 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              dateFromFilter={dateFromFilter}
              dateToFilter={dateToFilter}
              viewMode="cards"
            />
          </Suspense>
        </TabsContent>
      </JobsViewToggle>
    </div>
  )
}