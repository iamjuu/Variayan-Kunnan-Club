import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

export const STEPS = ['Mode', 'Category', 'Competitions', 'Details', 'Review']

export function Stepper({ step, onJump }: { step: number; onJump: (step: number) => void }) {
  return (
    <ol className="flex items-center gap-1.5 sm:gap-2" aria-label="Registration progress">
      {STEPS.map((label, i) => {
        const n = i + 1
        const done = n < step
        const current = n === step
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(n)}
              aria-current={current ? 'step' : undefined}
              className="group flex min-w-0 items-center gap-2 disabled:cursor-default"
            >
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-all',
                  done && 'bg-primary-700 text-white group-hover:bg-primary-600',
                  current && 'bg-accent-400 text-primary-950 ring-4 ring-accent-200',
                  !done && !current && 'bg-white text-ink/40 ring-1 ring-primary-900/12',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : n}
              </span>
              <span className={cn('hidden truncate text-sm font-semibold md:block', current ? 'text-primary-900' : done ? 'text-primary-800/80' : 'text-ink/40')}>{label}</span>
            </button>
            {n < STEPS.length && <span className={cn('h-0.5 flex-1 rounded-full', done ? 'bg-primary-600' : 'bg-primary-900/10')} />}
          </li>
        )
      })}
    </ol>
  )
}

export function StepHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold tracking-[0.16em] text-accent-600 uppercase">{eyebrow}</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-primary-900 sm:text-[28px]">{title}</h2>
      {description && <p className="mt-1.5 text-[15px] text-ink/60">{description}</p>}
    </div>
  )
}
