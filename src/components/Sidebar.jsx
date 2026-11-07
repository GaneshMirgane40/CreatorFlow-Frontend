import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Home, Folder, ClipboardCheck, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Sidebar() {
  const { role, logout } = useAuth()
  const navigate = useNavigate()

  const dashboardRoute =
    role === 'CREATOR' ? '/creator/dashboard' : '/editor/dashboard'

  const navItems =
    role === 'CREATOR'
      ? [
          { name: 'Dashboard', to: dashboardRoute, icon: Home },
          { name: 'Projects', to: '/projects', icon: Folder },
          { name: 'Review', to: '/review', icon: ClipboardCheck },
        ]
      : [
          { name: 'Dashboard', to: dashboardRoute, icon: Home },
          { name: 'My Projects', to: '/editor/projects', icon: Folder },
        ]

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const linkClass = ({ isActive }) =>
    [
      'flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm',
      isActive
        ? 'bg-indigo-50 text-indigo-600 font-medium'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    ].join(' ')

  return (
    <div className="h-full flex flex-col justify-between">
      {/* Top: Logo */}
      <div className="px-4 py-6">
        <Link to={dashboardRoute} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">
            CF
          </div>
          <div>
            <span className="text-lg font-semibold">CreatorFlow</span>
            <div className="text-xs text-gray-500">Manage your content</div>
          </div>
        </Link>
      </div>

      {/* Middle: Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map(({ name, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="w-4 h-4" />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom: Logout */}
      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

