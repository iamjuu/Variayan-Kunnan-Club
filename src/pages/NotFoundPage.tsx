import { ButtonLink } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-bold tracking-[0.2em] text-accent-600 uppercase">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-primary-900">Page not found</h1>
      <p className="mt-2 text-ink/60">That address is not part of the Variayan Kunan Club site.</p>
      <ButtonLink to="/" className="mt-6">
        Back to home
      </ButtonLink>
    </div>
  )
}
