"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Mail, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  Bell,
  AlertCircle 
} from "lucide-react"
import { format } from "date-fns"
import { formatDateSafely } from "@/lib/date-utils"
import { RAIN_DELAY_EMAIL_TEMPLATE, RAIN_DELAY_SMS_TEMPLATE } from "@/lib/constants"

interface NotificationPreviewProps {
  message: string
  onMessageChange: (message: string) => void
  customerName?: string
  originalDate: string
  newDate: string
  channel: 'email' | 'sms' | 'both'
  onChannelChange: (channel: 'email' | 'sms' | 'both') => void
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function NotificationPreview({
  message,
  onMessageChange,
  customerName = "John Smith", // Sample name for preview
  originalDate,
  newDate,
  channel,
  onChannelChange,
  enabled,
  onEnabledChange
}: NotificationPreviewProps) {
  const [showCustomMessage, setShowCustomMessage] = useState(false)
  const [previewMode, setPreviewMode] = useState<'email' | 'sms'>('email')
  
  // Format dates for display safely without timezone issues
  const originalFormatted = formatDateSafely(originalDate, 'EEEE, MMMM d')
  const newFormatted = formatDateSafely(newDate, 'EEEE, MMMM d')
  
  // Replace placeholders in message
  const previewMessage = message
    .replace(/\[Name\]/g, customerName)
    .replace(/\[Original Date\]/g, originalFormatted)
    .replace(/\[New Date\]/g, newFormatted)
  
  // Character limits
  const smsLimit = 160
  const isOverSmsLimit = previewMessage.length > smsLimit
  
  const resetToDefault = () => {
    const defaultTemplate = previewMode === 'email' 
      ? RAIN_DELAY_EMAIL_TEMPLATE 
      : RAIN_DELAY_SMS_TEMPLATE
    onMessageChange(defaultTemplate)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notify Customers
          </CardTitle>
          <Button
            variant={enabled ? "default" : "outline"}
            size="sm"
            onClick={() => onEnabledChange(!enabled)}
            className={enabled ? "bg-orange-500 hover:bg-orange-600" : ""}
          >
            {enabled ? "Notifications ON" : "Notifications OFF"}
          </Button>
        </div>
        {enabled && (
          <p className="text-sm text-muted-foreground">
            Customers will be notified immediately after you confirm the reschedule
          </p>
        )}
      </CardHeader>
      
      {enabled && (
        <CardContent className="space-y-6">
          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium mb-3">
              How to notify customers
            </label>
            <div className="flex gap-2">
              <Button
                variant={channel === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChannelChange('email')}
                className={`flex items-center gap-2 ${
                  channel === 'email' ? 'bg-orange-500 hover:bg-orange-600' : ''
                }`}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant={channel === 'sms' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChannelChange('sms')}
                className={`flex items-center gap-2 ${
                  channel === 'sms' ? 'bg-orange-500 hover:bg-orange-600' : ''
                }`}
                disabled // SMS coming later
                title="SMS notifications coming soon"
              >
                <MessageSquare className="h-4 w-4" />
                SMS
              </Button>
              <Button
                variant={channel === 'both' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChannelChange('both')}
                className={`flex items-center gap-2 ${
                  channel === 'both' ? 'bg-orange-500 hover:bg-orange-600' : ''
                }`}
                disabled // Both coming later
                title="SMS + Email notifications coming soon"
              >
                Both
              </Button>
            </div>
            {(channel === 'sms' || channel === 'both') && (
              <p className="text-xs text-muted-foreground mt-1">
                SMS notifications coming in a future update
              </p>
            )}
          </div>
          
          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Message Preview</label>
              <div className="flex items-center gap-2">
                {channel === 'both' && (
                  <div className="flex border rounded-md">
                    <Button
                      variant={previewMode === 'email' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('email')}
                      className="rounded-r-none"
                    >
                      Email
                    </Button>
                    <Button
                      variant={previewMode === 'sms' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewMode('sms')}
                      className="rounded-l-none"
                    >
                      SMS
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomMessage(!showCustomMessage)}
                >
                  {showCustomMessage ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide Editor
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Customize
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Preview Box */}
            <div className="border rounded-lg">
              <div className="bg-muted px-3 py-2 border-b flex items-center gap-2">
                {previewMode === 'email' ? (
                  <>
                    <Mail className="h-4 w-4" />
                    <span className="text-sm font-medium">Email Preview</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">SMS Preview</span>
                    <Badge variant={isOverSmsLimit ? "destructive" : "secondary"} className="text-xs">
                      {previewMessage.length}/{smsLimit} chars
                    </Badge>
                  </>
                )}
              </div>
              <div className="p-4 bg-white">
                <div className="text-sm whitespace-pre-wrap">
                  {previewMessage}
                </div>
                {previewMode === 'sms' && isOverSmsLimit && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">
                      Message is too long for SMS. Consider shortening or switch to email.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Custom Message Editor */}
          {showCustomMessage && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="custom-message" className="text-sm font-medium">
                  Custom Message
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetToDefault}
                >
                  Reset to Default
                </Button>
              </div>
              <Textarea
                id="custom-message"
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={6}
                className="w-full"
                placeholder="Enter your custom message..."
              />
              <div className="text-xs text-muted-foreground">
                <p>Available placeholders:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li><code>[Name]</code> - Customer's name</li>
                  <li><code>[Original Date]</code> - Original appointment date</li>
                  <li><code>[New Date]</code> - New appointment date</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}