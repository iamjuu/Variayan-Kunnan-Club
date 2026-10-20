import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: ReactNode; count?: number }[]
  className?: string
  size?: 'sm' | 'md'
}

export function Segmented<T extends string>({ value, onChange, options, className, size = 'md' }: SegmentedProps<T>) {
  return (
    <div role="tablist" className={cn('inline-flex rounded-xl bg-primary-900/5 p-1', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          type="button"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg font-semibold transition-all',
            size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
            value === o.value ? 'bg-white text-primary-900 shadow-sm' : 'text-ink/55 hover:text-ink',
          )}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={cn('rounded-full px-1.5 text-[11px]', value === o.value ? 'bg-primary-100 text-primary-800' : 'bg-black/5')}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  )
}

export function Pagination({ page, pages, total, onPage }: { page: number; pages: number; total: number; onPage: (p: number) => void }) {
  if (total === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-sm text-ink/60">
      <span>
        Page <b className="text-ink">{page}</b> of {pages} · {total} record{total === 1 ? '' : 's'}
      </span>
      <div className="flex gap-2">
        <button className="rounded-lg border border-primary-900/15 bg-white px-3 py-1.5 font-medium hover:bg-primary-50 disabled:opacity-40" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Previous
        </button>
        <button className="rounded-lg border border-primary-900/15 bg-white px-3 py-1.5 font-medium hover:bg-primary-50 disabled:opacity-40" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  )
}
