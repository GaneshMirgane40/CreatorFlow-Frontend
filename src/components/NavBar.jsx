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

  useEffect(() => {
    let active = true
    getUnreadCount()
      .then((count) => active && setUnread(Number(count) || 0))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [location.pathname])

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
        className="relative rounded-xl border border-[#f0e7e3] bg-[#f7f2ef] p-2.5 text-slate-700 transition hover:bg-[#f5eae6] hover:text-[#c81e3f]"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex items-center justify-center rounded-full bg-[#ff3b57] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[#f2e4e1] bg-white/95 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-[#f3ece8] px-4 py-2.5">
            <span className="text-sm font-semibold text-slate-800">Notifications</span>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="text-xs font-medium text-[#c81e3f] hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {items === null ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">Loading…</li>
            ) : items.length === 0 ? (
              <li className="px-4 py-6 text-center text-sm text-slate-500">No notifications.</li>
            ) : (
              items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => openNotification(n)}
                    className={`block w-full px-4 py-3 text-left transition hover:bg-[#fff7f5] ${n.isRead ? '' : 'bg-[#fff1ee]'}`}
                  >
                    <p className="text-sm font-medium text-slate-900">{n.title}</p>
                    <p className="text-xs text-slate-600">{n.message}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{formatDate(n.createdAt, true)}</p>
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
    <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h1>
        <span className="hidden md:inline-block text-sm text-slate-500">/ CreatorFlow</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden items-center rounded-full border border-[#f0e0dc] bg-[#fff7f5] px-3 py-1.5 text-sm font-medium text-slate-700 sm:flex">
          <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#ff5c78]" />
          <span>{role || 'Guest'}</span>
        </div>

        <NotificationBell />

        <div className="flex items-center gap-2.5 rounded-full border border-[#f0e0dc] bg-[#fff9f6] px-2 py-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#ff5a64] to-[#d50a2f] text-sm font-semibold text-white">{(role && role[0]) || 'U'}</div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-medium text-slate-900">{role ? role.toLowerCase() : 'User'}</span>
            <span className="text-[11px] text-slate-500">Online</span>
          </div>
        </div>
      </div>
    </div>
  )
}
