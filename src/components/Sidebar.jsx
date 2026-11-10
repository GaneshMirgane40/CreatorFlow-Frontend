import { NavLink, Link, useNavigate } from 'react-router-dom'
import { Home, Folder, ClipboardCheck, MonitorPlay, LogOut, Sparkles } from 'lucide-react'
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
          { name: 'YouTube', to: '/youtube/connect', icon: MonitorPlay },
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
      'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm font-medium',
      isActive
        ? 'bg-[#fff1ee] text-[#c81e3f] shadow-sm ring-1 ring-[#ffd8df]'
        : 'text-slate-600 hover:bg-[#f5efe9] hover:text-slate-900',
    ].join(' ')

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="px-4 py-6">
        <Link to={dashboardRoute} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#ff5a64] to-[#d50a2f] shadow-sm ring-4 ring-[#ffe5ea]">
            <img src="/creatorflow-logo.svg" alt="CreatorFlow" className="h-8 w-8 object-cover" />
          </div>
          <div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">CreatorFlow</span>
            <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">studio</div>
          </div>
        </Link>
      </div>

      <nav className="px-2.5 space-y-1.5">
        {navItems.map(({ name, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={linkClass}>
            <Icon className="h-4 w-4" />
            <span>{name}</span>
          </NavLink>
        ))}

        <div className="mt-5 rounded-2xl border border-[#f7d7d8] bg-[#fff7f5] p-3 text-sm text-slate-700 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-[#ce1e3d]">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold">Workflow</span>
          </div>
          <p className="text-xs leading-5 text-slate-600">Keep your edits, reviews, and publish-ready videos neatly in one place.</p>
        </div>
      </nav>

      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 transition-colors hover:bg-[#fff0ef] hover:text-[#c81e3f]"
          aria-label="Logout"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
