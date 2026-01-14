'use client'

import { useState } from 'react'
import { Sidebar, SidebarCompact } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { MobileNav } from '@/components/layout/mobile-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>
      
      {/* Compact Sidebar for medium screens */}
      <div className="hidden md:flex lg:hidden">
        <SidebarCompact />
      </div>

      {/* Mobile Navigation */}
      <MobileNav 
        open={mobileNavOpen} 
        onOpenChange={setMobileNavOpen} 
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto py-6 px-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}