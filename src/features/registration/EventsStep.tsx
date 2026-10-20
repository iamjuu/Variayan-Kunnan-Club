import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge, GenderBadge } from '../../components/ui/Badge'
import { Alert, EmptyState } from '../../components/ui/Feedback'
import { Input } from '../../components/ui/Field'
import { ageRule, EVENT_GENDER_LABEL, participantRange } from '../../lib/format'
import type { CompetitionItem, EventGender, PublicSettings } from '../../lib/types'
import { cn } from '../../lib/cn'
import { selectionRules } from './rules'
import { StepHeading } from './Stepper'

function groupLabel(item: CompetitionItem) {
  return item.legacy?.subCategoryName || item.ageDivision || 'Competition items'
}

export function EventsStep({
  items,
  selected,
  onToggle,
  settings,
  mode,
}: {
  items: CompetitionItem[]
  selected: CompetitionItem[]
  onToggle: (item: CompetitionItem) => void
  settings: PublicSettings
  mode: 'individual' | 'group'
}) {
  const [q, setQ] = useState('')
  const [gender, setGender] = useState<'all' | EventGender>('all')
  const rules = selectionRules(settings)
  const selectedIds = new Set(selected.map((i) => i._id))

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return items.filter((item) => {
      if (gender !== 'all' && item.gender !== gender) return false
      if (!query) return true
      return [item.name, item.displayEventId, item.ageDivision, item.legacy?.subCategoryName].some((v) =>
        v?.toLowerCase().includes(query),
      )
    })
  }, [items, q, gender])

  const groups = useMemo(() => {
    const map = new Map<string, CompetitionItem[]>()
    for (const item of filtered) {
      const key = groupLabel(item)
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    return [...map.entries()]
  }, [filtered])

  const lockedGenders = new Set(selected.filter((e) => e.gender !== 'any').map((e) => e.gender))
  const genderConflict = lockedGenders.size > 1

  return (
    <>
      <StepHeading
        eyebrow="Step 3"
        title="Select competition items"
        description={mode === 'individual' ? rules.summary(selected) : 'Select every item this team will enter. Member limits are checked together.'}
      />

      {genderConflict && (
        <div className="mb-4">
          <Alert tone="error" title="These items cannot be combined">
            You have selected both male-only and female-only items. Remove one set so a single participant or team can be eligible.
          </Alert>
        </div>
      )}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/35" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or event ID" className="pl-9" />
        </div>
        <div className="flex gap-1 rounded-xl bg-primary-900/5 p-1">
          {(['all', 'male', 'female', 'any'] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold capitalize', gender === g ? 'bg-white text-primary-900 shadow-sm' : 'text-ink/55')}
            >
              {g === 'all' ? 'All' : g === 'any' ? 'Open' : g}
            </button>
          ))}
        </div>
      </div>

      {mode === 'individual' && (
        <p className="mb-4 text-sm text-ink/55">
          {rules.relayMode
            ? `You may choose up to ${settings.individualEventLimit} items plus ${settings.relayAllowance} relay.`
            : `You may choose up to ${settings.individualEventLimit} items.`}
        </p>
      )}

      {!items.length ? (
        <EmptyState title="No items are open" description="The organiser has not published active items for this combination yet." />
      ) : !filtered.length ? (
        <EmptyState title="No matching items" description="Try a different search or gender filter." />
      ) : (
        <div className="space-y-6">
          {groups.map(([label, group]) => (
            <section key={label}>
              <h3 className="mb-2 text-xs font-bold tracking-[0.14em] text-primary-800/70 uppercase">{label}</h3>
              <ul className="grid gap-2">
                {group.map((item) => {
                  const checked = selectedIds.has(item._id)
                  const canAdd = checked || rules.canAdd(selected, item)
                  return (
                    <li key={item._id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 transition-colors',
                          checked ? 'border-primary-700 shadow-soft' : 'border-primary-900/8 hover:border-primary-700/30',
                          !canAdd && 'cursor-not-allowed opacity-55',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 size-4 accent-primary-700"
                          checked={checked}
                          disabled={!canAdd}
                          onChange={() => onToggle(item)}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-primary-950">{item.name}</span>
                            <Badge tone="gray">#{item.displayEventId}</Badge>
                            {item.isRelay && <Badge tone="gold">Relay</Badge>}
                          </span>
                          <span className="mt-1 flex flex-wrap gap-2 text-xs text-ink/55">
                            <GenderBadge gender={item.gender} />
                            <span>{EVENT_GENDER_LABEL[item.gender]}</span>
                            {item.ageDivision && <span>· {item.ageDivision}</span>}
                            <span>· {participantRange(item)}</span>
                            {ageRule(item) && <span>· {ageRule(item)}</span>}
                          </span>
                          {item.rules && <span className="mt-1 block text-xs text-ink/50">{item.rules}</span>}
                        </span>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  )
}
