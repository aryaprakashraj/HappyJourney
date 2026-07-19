import { forwardRef } from 'react'

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

const variantClasses = {
  primary:
    'bg-accent-600 text-white hover:bg-accent-500 focus-visible:ring-accent-500 border border-accent-500',
  secondary:
    'bg-white text-neutral-900 hover:bg-neutral-100 focus-visible:ring-neutral-500 border border-neutral-300',
  ghost:
    'bg-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-neutral-500 border border-transparent',
  danger:
    'bg-danger-700 text-white hover:bg-danger-600 focus-visible:ring-danger-500 border border-danger-600',
}

/**
 * Reusable Button component.
 * @param {('primary'|'secondary'|'ghost'|'danger')} variant
 * @param {('sm'|'md'|'lg')} size
 * @param {boolean} loading - shows a spinner and disables the button
 * @param {boolean} fullWidth
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2',
        'rounded-md font-medium shadow-none',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-3.5 w-3.5 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  )
})

export default Button
