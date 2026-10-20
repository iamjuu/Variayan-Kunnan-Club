import { ClipboardList, ExternalLink, Images, KeyRound, LayoutDashboard, LogOut, Menu, Settings, Trophy, X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { KasavuRule, Logo } from '../brand/Logo'
import { Spinner } from '../ui/Feedback'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
  { to: '/admin/competitions', label: 'Competition Items', icon: Trophy },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
              isActive ? 'bg-white/12 text-white shadow-inner' : 'text-white/65 hover:bg-white/6 hover:text-white',
            )
          }
        >
          <Icon className="size-[18px]" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function AdminLayout() {
  const { admin, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => setMenuOpen(false), [location.pathname])

  if (loading) return <Spinner label="Checking your session…" className="min-h-dvh" />
  if (!admin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />

  const signOut = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-primary-900 px-4 py-5 text-white">
      <div className="mb-8 px-1">
        <Logo light to="/admin" />
      </div>
      <NavItems onNavigate={() => setMenuOpen(false)} />
      <div className="mt-auto space-y-3 pt-6">
        <Link to="/" target="_blank" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/55 hover:text-white">
          <ExternalLink className="size-4" /> View public site
        </Link>
        <div className="rounded-2xl bg-white/6 p-3">
          <p className="truncate text-sm font-semibold">{admin.name}</p>
          <p className="truncate text-xs text-white/50">{admin.email}</p>
          <button onClick={signOut} className="mt-3 flex items-center gap-2 text-sm font-semibold text-accent-300 hover:text-accent-200">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block">{sidebar}</aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-primary-950/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 animate-fade-up">{sidebar}</div>
          <button onClick={() => setMenuOpen(false)} className="absolute top-4 right-4 rounded-xl bg-white p-2 text-ink" aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
      )}

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-primary-900/8 bg-canvas/90 backdrop-blur lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Logo to="/admin" />
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-primary-900/10 bg-white p-2.5" aria-label="Open menu">
              <Menu className="size-5" />
            </button>
          </div>
          <KasavuRule />
        </header>

        {admin.mustChangePassword && (
          <div className="border-b border-accent-300 bg-accent-50 px-4 py-2.5 text-sm text-accent-700 sm:px-8">
            <KeyRound className="mr-2 inline size-4" />
            {admin.isDevelopmentSeed ? 'You are using the local development admin account. ' : ''}
            Please set a strong password in{' '}
            <Link to="/admin/settings#password" className="font-semibold underline">
              Settings
            </Link>{' '}
            before deploying to production.
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-900 sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}
