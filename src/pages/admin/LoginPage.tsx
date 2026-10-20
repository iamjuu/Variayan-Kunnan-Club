import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Logo } from '../../components/brand/Logo'
import { Button } from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import { Spinner } from '../../components/ui/Feedback'
import { useAuth } from '../../context/AuthContext'
import { errorMessage } from '../../lib/api'

export function LoginPage() {
  const { admin, loading, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <Spinner label="Checking your session…" className="min-h-dvh" />
  if (admin) return <Navigate to="/admin" replace />

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await login(email, password)
      toast.success('Signed in')
      navigate(from.startsWith('/admin') ? from : '/admin', { replace: true })
    } catch (err) {
      setError(errorMessage(err, 'Invalid email or password'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo className="mb-8 justify-center" />
        <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8">
          <h1 className="font-display text-2xl font-semibold text-primary-900">Organiser login</h1>
          <p className="text-sm text-ink/55">Club office access for registrations, competition items and reports.</p>
          <Field label="Email" required>
            {(id) => <Input id={id} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />}
          </Field>
          <Field label="Password" required error={error ?? undefined}>
            {(id) => <Input id={id} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} invalid={Boolean(error)} required />}
          </Field>
          <Button type="submit" className="w-full" loading={busy}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  )
}
