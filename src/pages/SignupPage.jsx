import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signUp } from '@/queries/authQueries'
import { ROUTES } from '@/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

function validateForm({ fullName, email, password, confirmPassword }) {
  const errors = {}
  if (!fullName.trim()) errors.fullName = 'Full name is required.'
  else if (fullName.trim().length < 2) errors.fullName = 'Name must be at least 2 characters.'

  if (!email.trim()) errors.email = 'Email is required.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.'

  if (!password) errors.password = 'Password is required.'
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.'

  if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.'
  else if (password && confirmPassword !== password) errors.confirmPassword = 'Passwords do not match.'

  return errors
}

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
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
      await signUp({
        email: form.email,
        password: form.password,
        fullName: form.fullName.trim(),
      })
      // Supabase sends a confirmation email by default.
      // If email confirmation is disabled, AuthContext picks up the session
      // and PublicRoute redirects automatically.
      setSuccess(true)
    } catch (err) {
      if (err.message.includes('already registered')) {
        setServerError('An account with this email already exists. Try signing in.')
      } else {
        setServerError('Could not create your account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Post-signup success state (when email confirmation is enabled)
  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-success-500/10 border border-success-500/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="text-success-500"
            aria-hidden="true"
          >
            <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-neutral-900">Check your email</h1>
        <p className="text-sm text-neutral-500 leading-relaxed">
          We sent a confirmation link to{' '}
          <span className="text-neutral-700 font-medium">{form.email}</span>. Click
          the link to activate your account.
        </p>
        <Link to={ROUTES.LOGIN}>
          <Button variant="secondary" size="sm" id="back-to-login-btn">
            Back to sign in
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
          Create an account
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Get started by filling in your details below.
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
          label="Full name"
          id="signup-fullname"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Jane Smith"
          value={form.fullName}
          onChange={handleChange}
          error={fieldErrors.fullName}
          required
        />

        <Input
          label="Email"
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        <Input
          label="Password"
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 6 characters"
          value={form.password}
          onChange={handleChange}
          error={fieldErrors.password}
          hint="Minimum 6 characters."
          required
        />

        <Input
          label="Confirm password"
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="md"
          fullWidth
          loading={loading}
          id="signup-submit-btn"
          className="mt-6"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      {/* Link to login */}
      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link
          to={ROUTES.LOGIN}
          className="text-accent-400 hover:text-accent-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
