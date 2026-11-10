import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Navbar from '@/components/NavBar'

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:w-72 md:flex md:flex-col border-r border-[#f2e3dd] bg-[#fffdfb]/90 backdrop-blur-xl">
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      <div className="flex flex-col md:ml-72">
        <header className="sticky top-0 z-20 border-b border-[#f2e3dd] bg-[#fffdfb]/80 backdrop-blur-xl h-16 flex items-center px-4 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
          <Navbar />
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

