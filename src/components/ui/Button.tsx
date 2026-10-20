import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger' | 'outline' | 'hero'
type Size = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] whitespace-nowrap'
const variants: Record<Variant, string> = {
  primary: 'bg-primary-800 text-white shadow-sm hover:bg-primary-700 hover:shadow-lift',
  accent: 'bg-accent-400 text-primary-950 shadow-sm hover:bg-accent-300',
  secondary: 'bg-primary-50 text-primary-800 hover:bg-primary-100',
  outline: 'border border-primary-900/15 bg-white text-primary-900 hover:border-primary-800/40 hover:bg-primary-50/50',
  ghost: 'text-primary-900/80 hover:bg-primary-50 hover:text-primary-900',
  hero: 'bg-white/15 text-white ring-1 ring-white/70 [&:hover]:bg-white [&:hover]:text-primary-900 [&:hover]:ring-white [&:active]:bg-white [&:active]:text-primary-900 focus-visible:bg-white focus-visible:text-primary-900',
  danger: 'bg-red-600 text-white hover:bg-red-700',
}
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  icon?: ReactNode
}

export function Button({ variant = 'primary', size = 'md', loading, icon, className, children, disabled, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} {...rest}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  )
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...rest }: LinkProps & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />
}
