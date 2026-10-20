import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const widths = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' }

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className={cn('relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-white shadow-2xl outline-none animate-fade-up sm:rounded-3xl', widths[size])}
      >
        <div className="flex items-start justify-between gap-4 border-b border-primary-900/8 px-5 py-4 sm:px-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-primary-900">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink/55">{description}</p>}
          </div>
          <button onClick={onClose} className="-mr-2 rounded-lg p-2 text-ink/50 hover:bg-gray-100 hover:text-ink" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-primary-900/8 px-5 py-4 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
