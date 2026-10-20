import { Check, Medal, Palette, User, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { Category, Mode } from '../../lib/types'
import { StepHeading } from './Stepper'

function ChoiceCard({ selected, onClick, icon, title, malayalam, description, meta }: { selected: boolean; onClick: () => void; icon: ReactNode; title: string; malayalam: string; description: string; meta?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'group relative flex w-full flex-col items-start rounded-3xl border-2 bg-white p-5 text-left transition-all sm:p-6',
        selected ? 'border-primary-700 shadow-lift' : 'border-transparent shadow-soft ring-1 ring-primary-900/8 hover:-translate-y-0.5 hover:ring-primary-700/30',
      )}
    >
      <span className={cn('absolute top-5 right-5 grid size-6 place-items-center rounded-full border-2 transition-colors', selected ? 'border-primary-700 bg-primary-700 text-white' : 'border-primary-900/15')}>
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span className={cn('mb-5 grid size-14 place-items-center rounded-2xl transition-colors', selected ? 'bg-primary-800 text-accent-300' : 'bg-primary-50 text-primary-700 group-hover:bg-primary-100')}>{icon}</span>
      <span className="font-display text-xl font-semibold text-primary-900">{title}</span>
      <span className="text-sm font-medium text-accent-600" lang="ml">
        {malayalam}
      </span>
      <span className="mt-2 text-sm text-ink/60">{description}</span>
      {meta && <span className="mt-4">{meta}</span>}
    </button>
  )
}

export function ModeStep({ value, onSelect }: { value?: Mode; onSelect: (mode: Mode) => void }) {
  return (
    <>
      <StepHeading eyebrow="Step 1" title="How are you participating?" description="Choose individual for solo entries or group to register a team." />
      <div className="grid gap-4 sm:grid-cols-2">
        <ChoiceCard selected={value === 'individual'} onClick={() => onSelect('individual')} icon={<User className="size-7" />} title="Individual" malayalam="വ്യക്തിഗതം" description="Compete on your own in solo arts or sports items." />
        <ChoiceCard selected={value === 'group'} onClick={() => onSelect('group')} icon={<Users className="size-7" />} title="Group" malayalam="ഗ്രൂപ്പ്" description="Register a team with its leader and every member." />
      </div>
    </>
  )
}

export function CategoryStep({ categories, mode, value, onSelect }: { categories: Category[]; mode: Mode; value?: string; onSelect: (c: Category) => void }) {
  const meta: Record<string, { icon: ReactNode; ml: string; description: string }> = {
    arts: { icon: <Palette className="size-7" />, ml: 'കലാമത്സരങ്ങൾ', description: 'Dance, music, literary and performing arts.' },
    sports: { icon: <Medal className="size-7" />, ml: 'കായികമത്സരങ്ങൾ', description: 'Athletics, swimming, games and traditional sports.' },
  }
  return (
    <>
      <StepHeading eyebrow="Step 2" title="Choose a category" description="Competition items are shown for the category you pick." />
      <div className="grid gap-4 sm:grid-cols-2">
        {categories.map((c) => {
          const count = c.activeEvents?.[mode] ?? 0
          return (
            <ChoiceCard
              key={c._id}
              selected={value === c._id}
              onClick={() => onSelect(c)}
              icon={meta[c.slug]?.icon}
              title={c.name}
              malayalam={meta[c.slug]?.ml ?? ''}
              description={meta[c.slug]?.description ?? ''}
              meta={
                <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', count ? 'bg-primary-50 text-primary-800' : 'bg-gray-100 text-ink/50')}>
                  {count} {mode} {count === 1 ? 'item' : 'items'} open
                </span>
              }
            />
          )
        })}
      </div>
    </>
  )
}
