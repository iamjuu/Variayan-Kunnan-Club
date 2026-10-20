import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { KasavuRule, Logo } from '../brand/Logo'
import { ButtonLink } from '../ui/Button'

export function PublicLayout() {
  const { pathname } = useLocation()
  const onRegister = pathname.startsWith('/register')
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="no-print sticky top-0 z-40 border-b border-primary-900/8 bg-canvas/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-18 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" end className={({ isActive }) => cn('hidden rounded-lg px-3 py-2 text-sm font-semibold sm:block', isActive ? 'text-primary-800' : 'text-ink/60 hover:text-ink')}>
              Home
            </NavLink>
            <NavLink to="/gallery" className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-semibold', isActive ? 'text-primary-800' : 'text-ink/60 hover:text-ink')}>
              Gallery
            </NavLink>
            {!onRegister && (
              <ButtonLink to="/register" size="sm" className="sm:h-10 sm:px-4">
                Register <ArrowRight className="size-4" />
              </ButtonLink>
            )}
          </nav>
        </div>
        <KasavuRule />
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="no-print mt-16 bg-primary-900 text-white/80">
        <KasavuRule />
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.5fr_1fr] sm:px-6">
          <div className="space-y-3">
            <Logo light />
            <p className="max-w-md text-sm text-white/60">
              Variayan Kunan Club — arts, sports and community through the year. Keralotsavam is our seasonal festival for individual and team competitions.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm sm:items-end">
            <Link to="/gallery" className="font-semibold text-white hover:text-accent-200">
              Club gallery →
            </Link>
            <Link to="/register" className="font-semibold text-accent-300 hover:text-accent-200">
              Keralotsavam registration →
            </Link>
            <Link to="/admin/login" className="inline-flex items-center gap-1.5 text-white/50 hover:text-white">
              <ShieldCheck className="size-4" /> Organiser login
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-white/40">© {new Date().getFullYear()} Variayan Kunan Club. All rights reserved.</div>
      </footer>
    </div>
  )
}
