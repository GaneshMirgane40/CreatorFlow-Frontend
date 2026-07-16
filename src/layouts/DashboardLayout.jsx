import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/NavBar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar: fixed on desktop */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-64 md:flex md:flex-col bg-white border-r">
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      {/* Main content area; margin-left on desktop to accommodate fixed sidebar */}
      <div className="flex flex-col md:ml-64">
        {/* Navbar: sticky at top of content area, full width of the content region */}
        <header className="sticky top-0 z-20 bg-white border-b h-16 flex items-center px-4">
          <Navbar />
        </header>

        {/* Scrollable main region */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

