import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import {
  Calendar,
  DollarSign,
  Users,
  FileText,
  Plus,
  Briefcase,
  CloudRain,
} from 'lucide-react'
import { getTodaysJobsCount, getWeekJobsCount } from '@/services/jobs'
import { getCustomers } from '@/services/customers'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let profile = null
    let todaysJobs = 0
    let weekJobs = 0
    let customerCount = 0
    const weeklyRevenue = 0
    
    if (user) {
      // Load profile
      const { data } = await supabase
        .from('profiles')
        .select(`
          *,
          organizations (
            name
          )
        `)
        .eq('id', user.id)
        .single()
      
      profile = data

      // Load dashboard metrics with error handling
      try {
        const [todaysJobsCount, weekJobsCount, customers] = await Promise.all([
          getTodaysJobsCount().catch(() => 0),
          getWeekJobsCount().catch(() => 0),
          getCustomers().catch(() => [])
        ])

        todaysJobs = todaysJobsCount
        weekJobs = weekJobsCount
        customerCount = customers.filter((c: any) => c.status === 'active').length
      } catch (error) {
        console.error('Error loading dashboard metrics:', error)
        // Use default values
      }
    }


    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to SqueegeeRun
          </h1>
          <p className="text-gray-600">
            {profile && (profile as any).full_name && `Hello, ${(profile as any).full_name}! `}
            {profile && (profile as any).organizations?.name && `Managing ${(profile as any).organizations.name}.`}
          </p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Jobs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysJobs}</div>
            <p className="text-xs text-muted-foreground">
              {todaysJobs === 0 
                ? "No jobs scheduled today"
                : todaysJobs === 1
                ? "1 job scheduled"
                : `${todaysJobs} jobs scheduled`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weekJobs}</div>
            <p className="text-xs text-muted-foreground">
              {weekJobs === 0 
                ? "No jobs this week"
                : weekJobs === 1
                ? "1 job this week"
                : `${weekJobs} jobs this week`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerCount}</div>
            <p className="text-xs text-muted-foreground">
              {customerCount === 0 
                ? "Ready to add customers"
                : customerCount === 1
                ? "1 active customer"
                : `${customerCount} active customers`
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${weeklyRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {weeklyRevenue === 0 ? "No revenue this week" : "Revenue this week"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rain Mode Quick Action - Only show if there are jobs today */}
      {todaysJobs > 0 && (
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 rounded-full">
                  <CloudRain className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Bad weather today?</h3>
                  <p className="text-sm text-orange-700">
                    You have {todaysJobs} job{todaysJobs !== 1 ? 's' : ''} scheduled today.
                    Reschedule and notify customers instantly.
                  </p>
                </div>
              </div>
              <Button 
                asChild 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                size="lg"
              >
                <Link href="/jobs/tools/rain-mode">
                  <CloudRain className="h-4 w-4 mr-2" />
                  Activate Rain Mode
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link href="/customers/new" className="block">
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-medium">Add Customer</h3>
                <p className="text-sm text-muted-foreground">Start by adding your first customer</p>
              </div>
            </Link>
            <Link href="/jobs/new" className="block">
              <div className="text-center p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-medium">Schedule Job</h3>
                <p className="text-sm text-muted-foreground">Book a window cleaning appointment</p>
              </div>
            </Link>
            <div className="text-center p-4 border rounded-lg bg-muted/20 cursor-not-allowed">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <h3 className="font-medium text-muted-foreground">Create Invoice</h3>
              <p className="text-sm text-muted-foreground">Coming soon</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Jobs</CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link href="/jobs">
                View All Jobs
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {weekJobs === 0 ? (
            <div className="text-center py-6">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No jobs scheduled yet</p>
              <Button asChild>
                <Link href="/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Job
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                You have {weekJobs} job{weekJobs !== 1 ? 's' : ''} scheduled this week.
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/jobs">View All Jobs</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/jobs/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Job
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome to SqueegeeRun
          </h1>
          <p className="text-gray-600">
            Failed to load dashboard data
          </p>
        </div>
      </div>
    )
  }
}