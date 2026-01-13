import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, User } from 'lucide-react'

import { Button } from '@/components/ui/button'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { getProfileAction } from '@/lib/actions/settings'
import { ProfileForm } from '@/components/forms/profile-form'

async function ProfileSettings() {
  const result = await getProfileAction()

  if (!result.success || !result.profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Failed to load profile information</p>
            <p className="text-sm">{result.error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const profile = result.profile

  // Get user email from profile or auth user
  const userEmail = profile.organizations?.owner_id ? 'user@example.com' : 'user@example.com' // TODO: Get actual email

  return <ProfileForm profile={profile} userEmail={userEmail} />
}

export default function ProfileSettingsPage() {
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
            <User className="h-8 w-8" />
            Profile Settings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your personal information and account security
          </p>
        </div>
      </div>

      {/* Profile Form */}
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
                  <div className="h-10 bg-gray-200 animate-pulse rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <ProfileSettings />
      </Suspense>
    </div>
  )
}