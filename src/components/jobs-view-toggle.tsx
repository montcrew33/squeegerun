"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface JobsViewToggleProps {
  children: React.ReactNode
}

export function JobsViewToggle({ children }: JobsViewToggleProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentView = searchParams.get('view') || 'table'

  const handleViewChange = (view: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', view)
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <Tabs value={currentView} onValueChange={handleViewChange} className="space-y-4">
      <div className="flex justify-between items-center">
        <TabsList>
          <TabsTrigger value="table">
            Table View
          </TabsTrigger>
          <TabsTrigger value="cards">
            Card View
          </TabsTrigger>
        </TabsList>
      </div>
      {children}
    </Tabs>
  )
}