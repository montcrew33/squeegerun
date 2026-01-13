import Link from 'next/link'
import { ArrowLeft, CreditCard, CheckCircle, Calendar, Users, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

export default function BillingSettingsPage() {
  // Mock data - replace with real subscription data when Stripe is integrated
  const currentPlan = {
    name: 'Free Trial',
    price: 0,
    interval: 'month',
    trialDaysRemaining: 14,
    features: [
      'Up to 50 customers',
      'Unlimited jobs',
      'Basic invoicing',
      'Calendar view',
      'Email support'
    ]
  }

  const availablePlans = [
    {
      name: 'Solo',
      price: 29,
      interval: 'month',
      description: 'Perfect for individual window cleaners',
      features: [
        'Unlimited customers',
        'Unlimited jobs',
        'Advanced invoicing',
        'Route optimization',
        'Priority support',
        'Mobile app access'
      ],
      popular: false
    },
    {
      name: 'Pro',
      price: 79,
      interval: 'month',
      description: 'For growing cleaning businesses',
      features: [
        'Everything in Solo',
        'Team management',
        'Advanced reports',
        'Custom branding',
        'API access',
        'Phone support'
      ],
      popular: true
    }
  ]

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
            <CreditCard className="h-8 w-8" />
            Billing & Subscription
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your subscription and billing information
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your active subscription and usage details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{currentPlan.name}</h3>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Active
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">
                You're currently on the free trial with full access to all features.
              </p>
              <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Calendar className="h-4 w-4" />
                <span>
                  <strong>{currentPlan.trialDaysRemaining} days remaining</strong> in your free trial
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${currentPlan.price}
                <span className="text-base font-normal text-gray-500">
                  /{currentPlan.interval}
                </span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <h4 className="font-medium mb-3">Included Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {currentPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Your Plan</CardTitle>
          <CardDescription>
            Choose the plan that best fits your business needs (available soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {availablePlans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-6 rounded-lg border-2 ${
                  plan.popular
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600">
                      <Star className="mr-1 h-3 w-3" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-bold mb-2">
                    ${plan.price}
                    <span className="text-base font-normal text-gray-500">
                      /{plan.interval}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  disabled 
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  Coming Soon
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Manage your payment methods and billing information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No payment method required
            </h3>
            <p className="text-gray-600 mb-4">
              You're currently on a free trial. Add a payment method when you're ready to upgrade.
            </p>
            <Button disabled variant="outline">
              Add Payment Method (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>
            View and download your past invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No billing history yet
            </h3>
            <p className="text-gray-600">
              Your billing history will appear here once you start a paid subscription.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Team Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Usage
          </CardTitle>
          <CardDescription>
            Current usage and limits for your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1</div>
              <div className="text-sm text-gray-600">Team Members</div>
              <div className="text-xs text-gray-500">Unlimited on Pro</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Active Customers</div>
              <div className="text-xs text-gray-500">50 limit on trial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">28</div>
              <div className="text-sm text-gray-600">Jobs This Month</div>
              <div className="text-xs text-gray-500">Unlimited</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}