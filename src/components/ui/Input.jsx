import { forwardRef, useId } from 'react'

/**
 * Reusable Input component with label, error, and helper text.
 *
 * @param {string} label
 * @param {string} error - error message string
 * @param {string} hint  - helper text shown below input
 * @param {boolean} required
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    required = false,
    className = '',
    id: externalId,
    type = 'text',
    ...props
  },
  ref
) {
  // Auto-generate a stable id when not provided, so label htmlFor works correctly
  const generatedId = useId()
  const id = externalId || generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-medium text-neutral-700 select-none"
        >
          {label}
          {required && (
            <span className="ml-0.5 text-danger-500" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={[
          'w-full bg-white border rounded-md px-3 py-2 text-[15px] text-neutral-900',
          'placeholder:text-neutral-400',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-1 focus:ring-offset-white focus:border-accent-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error
            ? 'border-danger-500 text-danger-900 focus:border-danger-500 focus:ring-danger-500'
            : 'border-neutral-200 hover:border-neutral-300',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...props}
      />

      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger-400">
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${id}-hint`} className="text-xs text-neutral-500">
          {hint}
        </p>
      )}
    </div>
  )
})

export default Input
