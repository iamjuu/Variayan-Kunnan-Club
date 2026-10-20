import { AlertTriangle, Inbox, Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export function Spinner({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-3 py-12 text-sm text-ink/55', className)} role="status">
      <Loader2 className="size-5 animate-spin text-primary-600" />
      {label}
    </div>
  )
}

export function EmptyState({ title, description, icon, action }: { title: string; description?: ReactNode; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-primary-50 text-primary-700">{icon ?? <Inbox className="size-6" />}</div>
      <h3 className="font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-md text-sm text-ink/55">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Alert({ tone = 'warning', title, children }: { tone?: 'warning' | 'error' | 'info'; title?: ReactNode; children?: ReactNode }) {
  const styles = {
    warning: 'border-accent-300 bg-accent-50 text-accent-700',
    error: 'border-red-200 bg-red-50 text-red-800',
    info: 'border-primary-200 bg-primary-50 text-primary-900',
  }
  return (
    <div className={cn('flex gap-3 rounded-2xl border px-4 py-3 text-sm', styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="opacity-90">{children}</div>}
      </div>
    </div>
  )
}
