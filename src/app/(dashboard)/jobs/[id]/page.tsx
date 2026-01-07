import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, MapPin, User, DollarSign, Edit, Trash2, FileText, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getJob } from "@/services/jobs"
import { JOB_STATUS_LABELS, JOB_STATUS_COLORS } from "@/lib/validations/job"
import { JobStatusUpdater } from "@/components/job-status-updater"
import { checkInvoiceForJobAction } from "@/lib/actions/invoices"

interface JobDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params

  // Check if id is a valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(id)) {
    notFound()
  }

  try {
    const [job, invoiceCheck] = await Promise.all([
      getJob(id),
      checkInvoiceForJobAction(id)
    ])

    const formatDate = (dateString: string) => {
      // Parse date carefully to avoid timezone issues
      const parts = dateString.split('-')
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10)
        const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
        const day = parseInt(parts[2], 10)
        const date = new Date(year, month, day)
        
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      }
      
      // Fallback for other formats
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      })
    }

    const formatTime = (timeString: string | null) => {
      if (!timeString) return null
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }

    const formatPrice = (priceCents: number | null) => {
      if (!priceCents) return null
      return `$${(priceCents / 100).toFixed(2)}`
    }

    const getStatusBadgeVariant = (status: string | null) => {
      const color = status ? JOB_STATUS_COLORS[status as keyof typeof JOB_STATUS_COLORS] : 'gray'
      switch (color) {
        case 'green': return 'default'
        case 'blue': return 'default' 
        case 'yellow': return 'secondary'
        case 'orange': return 'destructive'
        case 'red': return 'destructive'
        case 'gray': return 'secondary'
        default: return 'secondary'
      }
    }

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Job Details</h1>
              <p className="text-muted-foreground">
                {job.customer.name} - {formatDate(job.scheduled_date)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {job.status ? JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS] : 'Unknown'}
            </Badge>
            
            {/* Invoice Button */}
            {job.status === 'completed' && invoiceCheck.success && !invoiceCheck.hasInvoice && (
              <Button asChild>
                <Link href={`/invoices/new?job_id=${job.id}`}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Create Invoice
                </Link>
              </Button>
            )}
            
            {invoiceCheck.success && invoiceCheck.hasInvoice && invoiceCheck.invoice && (
              <Button asChild variant="outline">
                <Link href={`/invoices/${invoiceCheck.invoice.id}`}>
                  <Receipt className="h-4 w-4 mr-2" />
                  View Invoice
                </Link>
              </Button>
            )}
            
            <Button asChild variant="outline">
              <Link href={`/jobs/${job.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Job
              </Link>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="history">Status History</TabsTrigger>
            <TabsTrigger value="notes">Notes & Files</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Schedule Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Schedule Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(job.scheduled_date)}</span>
                  </div>
                  
                  {(job.scheduled_time_start || job.scheduled_time_end) ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {formatTime(job.scheduled_time_start)}
                        {job.scheduled_time_end && ` - ${formatTime(job.scheduled_time_end)}`}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">All day</span>
                    </div>
                  )}

                  {job.assigned_user && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Assigned to {job.assigned_user.full_name}</span>
                    </div>
                  )}

                  {formatPrice(job.price_cents) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatPrice(job.price_cents)}</span>
                    </div>
                  )}

                  {/* Invoice Information */}
                  {invoiceCheck.success && invoiceCheck.hasInvoice && invoiceCheck.invoice && (
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-muted-foreground" />
                      <span>Invoice #{invoiceCheck.invoice.invoice_number}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {invoiceCheck.invoice.status.charAt(0).toUpperCase() + invoiceCheck.invoice.status.slice(1)}
                      </Badge>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <JobStatusUpdater jobId={job.id} currentStatus={job.status || 'scheduled'} />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium">{job.customer.name}</div>
                    {job.customer.email && (
                      <div className="text-sm text-muted-foreground">{job.customer.email}</div>
                    )}
                    {job.customer.phone && (
                      <div className="text-sm text-muted-foreground">{job.customer.phone}</div>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/customers/${job.customer.id}`}>
                        View Customer Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Service Address */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Service Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-medium">{job.service_address.label || 'Service Address'}</div>
                    <div className="text-muted-foreground">
                      {job.service_address.street_address}
                      {job.service_address.unit && (
                        <>
                          <br />
                          Unit {job.service_address.unit}
                        </>
                      )}
                      <br />
                      {job.service_address.city}, {job.service_address.state} {job.service_address.postal_code}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Status History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Status history tracking will be implemented in a future update.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Job Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {job.notes ? (
                  <div className="whitespace-pre-wrap text-sm">{job.notes}</div>
                ) : (
                  <p className="text-muted-foreground">No notes added for this job.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    console.error('Error fetching job:', error)
    notFound()
  }
}