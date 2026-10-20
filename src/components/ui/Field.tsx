import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

export const controlClass = (invalid?: boolean) =>
  cn(
    'w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink/35 transition-colors',
    'focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-ink/50',
    invalid ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-primary-900/15 hover:border-primary-900/30 focus:border-primary-600 focus:ring-primary-100',
  )

interface FieldProps {
  label: ReactNode
  error?: string
  hint?: ReactNode
  required?: boolean
  children: (id: string, describedBy?: string) => ReactNode
  className?: string
}

export function Field({ label, error, hint, required, children, className }: FieldProps) {
  const id = useId()
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-ink/80">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children(id, describedBy)}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[13px] font-medium text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[13px] text-ink/50">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  ({ invalid, className, ...rest }, ref) => <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), 'h-11', className)} {...rest} />,
)
Input.displayName = 'Input'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  ({ invalid, className, children, ...rest }, ref) => (
    <select ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), 'h-11 appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-9', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2314532D' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")" }} {...rest}>
      {children}
    </select>
  ),
)
Select.displayName = 'Select'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  ({ invalid, className, ...rest }, ref) => <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass(invalid), 'min-h-24 py-2.5', className)} {...rest} />,
)
Textarea.displayName = 'Textarea'

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; description?: ReactNode; disabled?: boolean }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-ink/55">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50', checked ? 'bg-primary-700' : 'bg-gray-300')}
      >
        <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </button>
    </div>
  )
}
