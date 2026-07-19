import { Outlet } from 'react-router-dom'
import { APP_NAME } from '@/constants'

/**
 * Minimal centered layout for login and signup pages.
 * Two-panel design: left brand panel (desktop) + right form panel.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* ── Left branding panel (hidden on mobile) ─────────────── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-[480px] flex-col justify-between bg-white border-r border-neutral-200 p-10 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-neutral-900 tracking-tight">
            {APP_NAME}
          </span>
        </div>

        {/* Quote / description */}
        <div className="space-y-4">
          <blockquote className="text-xl font-medium text-neutral-900 leading-snug tracking-tight">
            "Fleet management that keeps every journey on track."
          </blockquote>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Manage vehicles, drivers, and bookings from a single unified platform.
          </p>
        </div>

        {/* Footer */}
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2.5 mb-10">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent-600">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </span>
          <span className="text-sm font-semibold text-neutral-900">{APP_NAME}</span>
        </div>

        {/* Page content (LoginPage / SignupPage) */}
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
