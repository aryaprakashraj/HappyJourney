/**
 * LoadingSpinner — inline or full-screen loading indicator.
 *
 * @param {boolean} fullScreen - centres spinner in the entire viewport
 * @param {('sm'|'md'|'lg')} size
 * @param {string} label - screen-reader text (default: 'Loading…')
 */
export default function LoadingSpinner({
  fullScreen = false,
  size = 'md',
  label = 'Loading…',
  className = '',
}) {
  const sizeMap = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }

  const spinner = (
    <span role="status" aria-label={label} className={`inline-block ${sizeMap[size]} ${className}`}>
      <svg
        className="animate-spin w-full h-full text-accent-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-neutral-50 z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
