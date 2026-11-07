import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/services/notificationService'
import { formatDate, projectPath } from '@/lib/workflow'

const TITLES = [
  [/^\/(creator|editor)\/dashboard$/, 'Dashboard'],
  [/^\/projects\/\d+$/, 'Project Details'],
  [/^\/editor\/projects\/\d+$/, 'Project Details'],
  [/^\/(editor\/)?projects$/, 'Projects'],
  [/^\/review$/, 'Review'],
  [/^\/youtube\/callback$/, 'YouTube'],
]

function titleFromPath(pathname) {
  return TITLES.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'CreatorFlow'
}

function NotificationBell() {
  const { role } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState(null)
  const containerRef = useRef(null)

  // Refresh the unread badge on every navigation (cheap count query).
  useEffect(() => {
    let active = true
    getUnreadCount()
      .then((count) => active && setUnread(Number(count) || 0))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [location.pathname])

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!open) return undefined
    const onClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      try {
        setItems(await getNotifications())
      } catch {
        setItems([])
      }
    }
  }

  const openNotification = async (notification) => {
    setOpen(false)
    if (!notification.isRead) {
      setUnread((n) => Math.max(0, n - 1))
      markNotificationRead(notification.id).catch(() => {})
    }
    if (notification.projectId) navigate(projectPath(role, notification.projectId))
  }

  const markAll = async () => {
    await markAllNotificationsRead().catch(() => {})
    setUnread(0)
    setItems((list) => list?.map((n) => ({ ...n, isRead: true })) ?? list)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={toggle}
        className="relative p-2 rounded-md hover:bg-gray-100 text-gray-600"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs text-indigo-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items === null ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">Loading…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-gray-500">No notifications.</li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`block w-full px-4 py-3 text-left hover:bg-gray-50 ${n.isRead ? '' : 'bg-indigo-50/60'}`}
                  >
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-600">{n.message}</p>
                    <p className="mt-1 text-[11px] text-gray-400">{formatDate(n.createdAt, true)}</p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function NavBar() {
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
        <div className="hidden sm:flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
          <svg className="w-3 h-3 mr-2 text-indigo-500" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
          <span>{role || 'Guest'}</span>
        </div>

        <NotificationBell />

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
