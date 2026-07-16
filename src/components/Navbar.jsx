import React from 'react'
import { useLocation } from 'react-router-dom'
import { Bell, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

function titleFromPath(pathname) {
  if (!pathname || pathname === '/') return 'Home'
  const parts = pathname.split('/').filter(Boolean)
  // Use last segment as title, prettify
  const last = parts[parts.length - 1]
  return last
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function Navbar() {
  const { role } = useAuth()
  const location = useLocation()
  const title = titleFromPath(location.pathname)

  return (
    <div className="w-full h-16 flex items-center justify-between px-4 md:px-6 bg-white border-b">
      {/* Left: Page title */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        <span className="hidden md:inline-block text-sm text-gray-500">/ CreatorFlow</span>
      </div>

      {/* Right: role, notifications, avatar */}
      <div className="flex items-center gap-4">
        {/* Role badge */}
        <div className="hidden sm:flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          <svg className="w-3 h-3 mr-2 text-indigo-500" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
          <span>{role || 'Guest'}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600"
        >
          <Bell className="w-5 h-5" />
          {/* badge */}
          <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">0</span>
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold">{(role && role[0]) || 'U'}</div>
          <div className="hidden sm:flex flex-col">
            <span className="text-sm font-medium text-gray-900">{role ? role.toLowerCase() : 'User'}</span>
            <span className="text-xs text-gray-500">Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}

