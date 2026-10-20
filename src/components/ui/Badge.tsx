import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'green' | 'gold' | 'gray' | 'red' | 'blue' | 'pink'

const tones: Record<Tone, string> = {
  green: 'bg-primary-50 text-primary-800 ring-primary-700/15',
  gold: 'bg-accent-50 text-accent-700 ring-accent-500/25',
  gray: 'bg-gray-100 text-gray-700 ring-gray-500/15',
  red: 'bg-red-50 text-red-700 ring-red-600/15',
  blue: 'bg-sky-50 text-sky-800 ring-sky-600/15',
  pink: 'bg-rose-50 text-rose-700 ring-rose-600/15',
}

export function Badge({ tone = 'gray', children, icon, className }: { tone?: Tone; children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset', tones[tone], className)}>
      {icon}
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' | 'archived' }) {
  const map = { active: ['green', 'Active'], inactive: ['gray', 'Inactive'], archived: ['gold', 'Archived'] } as const
  const [tone, label] = map[status]
  return (
    <Badge tone={tone}>
      <span className={cn('size-1.5 rounded-full', status === 'active' ? 'bg-primary-500' : status === 'archived' ? 'bg-accent-500' : 'bg-gray-400')} />
      {label}
    </Badge>
  )
}

export function GenderBadge({ gender }: { gender: 'male' | 'female' | 'any' }) {
  if (gender === 'male') return <Badge tone="blue">Male</Badge>
  if (gender === 'female') return <Badge tone="pink">Female</Badge>
  return <Badge tone="green">Open</Badge>
}
