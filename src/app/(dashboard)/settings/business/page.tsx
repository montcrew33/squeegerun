import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { getOrganizationAction } from '@/lib/actions/settings'
import { BusinessForm } from '@/components/forms/business-form'

async function BusinessSettings() {
  const result = await getOrganizationAction()

  if (!result.success || !result.organization) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load business information</p>
            <p className="text-sm">{result.error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <BusinessForm organization={result.organization} />
}

export default function BusinessSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Settings
          </Button>
        </Link>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building className="h-8 w-8" />
            Business Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your business information and invoice defaults
          </p>
        </div>
      </div>

      {/* Admin Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-blue-900">Organization Settings</h3>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Owner Access
                </Badge>
              </div>
              <p className="text-blue-800 text-sm">
                As the organization owner, you can update business information that affects 
                invoices, branding, and default settings for all users.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Form */}
      <Suspense fallback={
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 animate-pulse rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-10 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <BusinessSettings />
      </Suspense>
    </div>
  )
}