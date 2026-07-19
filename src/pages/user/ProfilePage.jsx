import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from '@/queries/profileQueries'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import PageHeader from '@/components/ui/PageHeader'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function ProfilePage() {
  const { user, profile, role, refreshProfile } = useAuth()

  const [form, setForm] = useState({
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: '' }))
    setSuccess(false)
    setError('')
  }

  function validate() {
    const errors = {}
    if (!form.fullName.trim()) errors.fullName = 'Name is required.'
    else if (form.fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters.'
    return errors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length) { setFieldErrors(errors); return }

    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      await updateProfile(user.id, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || null,
      })
      await refreshProfile()
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8 max-w-xl">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information"
      />

      {/* Account info */}
      <div className="card p-5 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900">Account</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Email</p>
            <p className="text-neutral-700 font-medium">{profile?.email ?? user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Role</p>
            <p className="text-neutral-700 font-medium capitalize">{role}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 mb-0.5">Member since</p>
            <p className="text-neutral-700">
              {profile?.created_at ? formatDate(profile.created_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card p-5">
        <h2 className="text-sm font-semibold text-neutral-900 mb-5">Personal Information</h2>

        {success && (
          <div
            role="alert"
            className="mb-4 rounded border border-success-500/30 bg-success-500/10 px-4 py-3 text-sm text-success-500"
          >
            Profile updated successfully.
          </div>
        )}

        {error && (
          <div role="alert" className="mb-4 text-sm text-danger-400 bg-danger-950/40 border border-danger-700/40 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Full name"
            id="profile-fullname"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            error={fieldErrors.fullName}
            required
          />
          <Input
            label="Email"
            id="profile-email"
            type="email"
            value={profile?.email ?? ''}
            disabled
            hint="Email cannot be changed here."
          />
          <Input
            label="Phone number"
            id="profile-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+254 700 000 000"
            hint="Optional. Used for booking notifications."
          />
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loading}
              id="profile-save-btn"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
