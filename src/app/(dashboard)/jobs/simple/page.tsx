import Link from "next/link"
import { ArrowLeft, Calendar, Plus, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SimpleJobsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Briefcase className="h-8 w-8" />
            Jobs - Simple Version
          </h1>
          <p className="text-muted-foreground">
            Manage and schedule window cleaning appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Job
          </Link>
        </Button>
      </div>

      {/* Simple Content */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>This is a simplified jobs page to test navigation.</p>
            
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              
              <Button asChild variant="outline">
                <Link href="/jobs/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Job
                </Link>
              </Button>
            </div>

            <div className="mt-6 p-4 border rounded">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <ul className="text-sm space-y-1">
                <li>✅ Basic React rendering works</li>
                <li>✅ Tailwind CSS is loading</li>
                <li>✅ Icons are working</li>
                <li>✅ Navigation links are functional</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}