import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

/** Club mark: a nilavilakku (traditional Kerala brass lamp) flame over a stadium track. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-10', className)} aria-hidden>
      <rect width="48" height="48" rx="14" className="fill-primary-800" />
      <path d="M24 8.5c4.6 5.2 6.9 9.7 6.9 13.6a6.9 6.9 0 1 1-13.8 0c0-3.9 2.3-8.4 6.9-13.6Z" className="fill-accent-400" />
      <path d="M24 15.5c1.9 2.4 2.8 4.4 2.8 6.1a2.8 2.8 0 1 1-5.6 0c0-1.7.9-3.7 2.8-6.1Z" fill="#fff8ee" opacity=".9" />
      <path d="M13 34.5c3.2-2 7-3 11-3s7.8 1 11 3" stroke="#D4A373" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M10 39.5c4-2.4 8.8-3.6 14-3.6s10 1.2 14 3.6" stroke="#F8FAF9" strokeWidth="1.6" fill="none" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}

export function Logo({ light, className, to = '/' }: { light?: boolean; className?: string; to?: string }) {
  return (
    <Link to={to} className={cn('flex items-center gap-3', className)}>
      <LogoMark />
      <span className="leading-tight">
        <span className={cn('block font-display text-[17px] font-semibold tracking-tight', light ? 'text-white' : 'text-primary-900')}>Variayan Kunan Club</span>
        <span className={cn('block text-[11px] font-semibold tracking-[0.16em] uppercase', light ? 'text-accent-300' : 'text-accent-600')}>Arts · Sports · Community</span>
      </span>
    </Link>
  )
}

export function KasavuRule({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-[3px]', className)} aria-hidden>
      <div className="kasavu h-[3px]" />
      <div className="kasavu h-px opacity-60" />
    </div>
  )
}
