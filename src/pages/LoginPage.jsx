import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signIn } from '@/queries/authQueries'
import { ROUTES } from '@/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function validateForm({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'
  if (!password) errors.password = 'Password is required.'
  return errors
}

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear the error for this field as the user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    }
    if (serverError) setServerError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errors = validateForm(form)
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    setServerError('')

    try {
      await signIn({ email: form.email, password: form.password })
      // AuthContext picks up the new session via onAuthStateChange.
      // PublicRoute then automatically redirects to the correct dashboard.
    } catch (err) {
      // Show a safe, user-friendly message — never expose raw Supabase errors.
      setServerError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Sign in to your account
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Enter your credentials to access your dashboard.
        </p>
      </div>

      {/* Server-level error */}
      {serverError && (
        <div
          role="alert"
          className="mb-5 rounded border border-danger-700/50 bg-danger-950/40 px-4 py-3 text-sm text-danger-400"
        >
          {serverError}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        <div className="space-y-1.5">
          <Input
            label="Password"
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          id="login-submit-btn"
          className="mt-6"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      {/* Link to signup */}
      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link
          to={ROUTES.SIGNUP}
          className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
