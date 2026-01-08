import Link from 'next/link'
import { 
  User, 
  Building, 
  CreditCard, 
  Users, 
  Settings as SettingsIcon,
  ChevronRight 
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const settingsCards = [
  {
    title: 'Profile Settings',
    description: 'Manage your personal information, email, and password',
    href: '/settings/profile',
    icon: User,
    available: true
  },
  {
    title: 'Business Settings', 
    description: 'Configure your business information, tax rates, and invoice defaults',
    href: '/settings/business',
    icon: Building,
    available: true
  },
  {
    title: 'Billing & Subscription',
    description: 'Manage your subscription, billing information, and payment methods',
    href: '/settings/billing',
    icon: CreditCard,
    available: true,
    isPlaceholder: true
  },
  {
    title: 'Team Management',
    description: 'Invite team members and manage user roles and permissions',
    href: '/settings/team',
    icon: Users,
    available: false,
    comingSoon: true
  }
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your profile, business settings, and account preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCards.map((setting) => {
          const Icon = setting.icon
          
          if (!setting.available) {
            return (
              <Card key={setting.title} className="opacity-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-gray-500">{setting.title}</CardTitle>
                        {setting.comingSoon && (
                          <Badge variant="secondary" className="mt-1">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">
                    {setting.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button disabled variant="ghost" className="w-full justify-between">
                    Configure Settings
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={setting.title} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>{setting.title}</CardTitle>
                      {setting.isPlaceholder && (
                        <Badge variant="outline" className="mt-1">
                          Preview
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription>
                  {setting.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={setting.href}>
                  <Button variant="ghost" className="w-full justify-between">
                    Configure Settings
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common settings and account management tasks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/settings/profile">
              <Button variant="outline" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Update Profile
              </Button>
            </Link>
            
            <Link href="/settings/business">
              <Button variant="outline" className="w-full">
                <Building className="mr-2 h-4 w-4" />
                Business Info
              </Button>
            </Link>
            
            <Button variant="outline" disabled className="w-full">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing (Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account status and organization details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current Plan</h3>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Free Trial</Badge>
                <span className="text-sm text-gray-600">
                  Full access to all features
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Organization</h3>
              <p className="text-sm text-gray-600">
                You are the owner of this organization
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}