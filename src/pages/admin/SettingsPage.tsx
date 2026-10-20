import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '../../components/layout/AdminLayout'
import { Button } from '../../components/ui/Button'
import { Field, Input, Toggle } from '../../components/ui/Field'
import { Alert, Spinner } from '../../components/ui/Feedback'
import { useAuth } from '../../context/AuthContext'
import { api, errorMessage } from '../../lib/api'
import { formatDateTime } from '../../lib/format'
import type { Admin, AdminSettings, ExportLogEntry } from '../../lib/types'
import { useApi } from '../../lib/useApi'

export function SettingsPage() {
  const { admin, setAdmin } = useAuth()
  const { data, loading, error, reload } = useApi<AdminSettings>('/admin/settings')
  const { data: logs } = useApi<ExportLogEntry[]>('/admin/export-logs')
  const [form, setForm] = useState<AdminSettings | null>(null)
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordBusy, setPasswordBusy] = useState(false)

  useEffect(() => {
    if (data) {
      setForm({
        ...data,
        ageReferenceDate: data.ageReferenceDate ? data.ageReferenceDate.slice(0, 10) : null,
      })
    }
  }, [data])

  const save = async () => {
    if (!form) return
    setSaving(true)
    try {
      await api.put('/admin/settings', {
        registrationOpen: form.registrationOpen,
        individualEventLimit: form.individualEventLimit,
        relayAllowance: form.relayAllowance,
        relayAllowanceConfirmed: form.relayAllowanceConfirmed,
        ageReferenceDate: form.ageReferenceDate || null,
        collectAadhaar: form.collectAadhaar,
        retentionDays: form.retentionDays,
      })
      toast.success('Settings saved')
      await reload()
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async () => {
    setPasswordBusy(true)
    try {
      const res = await api.post<{ admin: Admin }>('/auth/change-password', { currentPassword, newPassword })
      setAdmin(res.data.admin)
      setCurrentPassword('')
      setNewPassword('')
      toast.success('Password updated')
    } catch (err) {
      toast.error(errorMessage(err))
    } finally {
      setPasswordBusy(false)
    }
  }

  if (loading || !form) return <Spinner label="Loading settings…" />
  if (error) return <Alert tone="error" title={error} />

  return (
    <>
      <PageHeader title="Settings" description="Registration rules, privacy options and the organiser password." />

      {admin?.mustChangePassword && (
        <div className="mb-6">
          <Alert tone="warning" title="Change the development password before production">
            The local seed account uses a well-known password. Set a strong password below. Production will refuse to start while this seed password remains.
          </Alert>
        </div>
      )}

      <section className="card space-y-5 p-5 sm:p-6">
        <h2 className="font-semibold text-primary-900">Registration</h2>
        <Toggle checked={form.registrationOpen} onChange={(registrationOpen) => setForm({ ...form, registrationOpen })} label="Registration open" description="When off, the public form cannot submit new entries." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Individual event limit" hint="Default is 3. Public selection and server validation both use this number.">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={1}
                max={50}
                value={form.individualEventLimit}
                onChange={(e) => setForm({ ...form, individualEventLimit: Number(e.target.value) })}
              />
            )}
          </Field>
          <Field label="Relay allowance">
            {(id) => (
              <Input
                id={id}
                type="number"
                min={0}
                max={10}
                value={form.relayAllowance}
                onChange={(e) => setForm({ ...form, relayAllowance: Number(e.target.value) })}
              />
            )}
          </Field>
        </div>
        <Toggle
          checked={form.relayAllowanceConfirmed}
          onChange={(relayAllowanceConfirmed) => setForm({ ...form, relayAllowanceConfirmed })}
          label="Confirm extra relay allowance"
          description="Until this is confirmed, individual athletes cannot exceed the event limit even for relays."
        />
        <Field label="Age reference date" hint="Used when an item has a min/max age. Leave blank to use today.">
          {(id) => (
            <Input
              id={id}
              type="date"
              value={form.ageReferenceDate ?? ''}
              onChange={(e) => setForm({ ...form, ageReferenceDate: e.target.value || null })}
            />
          )}
        </Field>
        <Toggle
          checked={form.collectAadhaar}
          onChange={(collectAadhaar) => setForm({ ...form, collectAadhaar })}
          label="Collect Aadhaar (optional)"
          description="Off by default. Enable only when legally justified. Full numbers are never stored."
        />
        <Field label="Retention days" hint="Optional automatic purge window. Leave blank to keep records until deleted.">
          {(id) => (
            <Input
              id={id}
              type="number"
              min={30}
              value={form.retentionDays ?? ''}
              onChange={(e) => setForm({ ...form, retentionDays: e.target.value === '' ? null : Number(e.target.value) })}
            />
          )}
        </Field>
        <Button loading={saving} onClick={save}>
          Save settings
        </Button>
      </section>

      <section id="password" className="card mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold text-primary-900">Change password</h2>
        <p className="text-sm text-ink/55">At least 12 characters with upper and lower case letters, a number and a symbol.</p>
        <Field label="Current password">
          {(id) => <Input id={id} type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />}
        </Field>
        <Field label="New password">
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />}
        </Field>
        <Button loading={passwordBusy} onClick={changePassword}>
          Update password
        </Button>
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="font-semibold text-primary-900">Export audit log</h2>
          <p className="text-sm text-ink/55">PDF and Excel downloads are recorded.</p>
        </div>
        <table className="min-w-full text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Admin</th>
              <th className="px-4 py-2">Format</th>
              <th className="px-4 py-2">Records</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log._id} className="border-t border-primary-900/8">
                <td className="px-4 py-2">{formatDateTime(log.createdAt)}</td>
                <td className="px-4 py-2">{log.adminEmail}</td>
                <td className="px-4 py-2 uppercase">{log.format}</td>
                <td className="px-4 py-2">{log.recordCount}</td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-ink/50" colSpan={4}>
                  No exports yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  )
}
