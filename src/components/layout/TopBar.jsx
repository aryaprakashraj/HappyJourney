import { useAuth } from '@/hooks/useAuth'
import { useSidebar } from '@/contexts/SidebarContext'
import { APP_NAME } from '@/constants'
import Button from '@/components/ui/Button'

/**
 * Top navigation bar — always shows the HappyJourney logo on the left,
 * regardless of sidebar state. Toggle button lives here.
 */
export default function TopBar({ title }) {
  const { profile, signOut } = useAuth()
  const { toggleSidebar } = useSidebar()

  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4">
      {/* ── Left: Toggle + Logo ──────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Hamburger toggle */}
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Logo — always visible */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-600">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <circle cx="8" cy="8" r="2" fill="white" />
            </svg>
          </span>
          <span className="text-[15px] font-bold text-neutral-900 tracking-tight select-none">
            {APP_NAME}
          </span>
        </div>
      </div>

      {/* ── Right: User info + sign out ────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-600 text-[13px] font-medium text-white uppercase select-none">
            {profile?.full_name?.[0] ?? profile?.email?.[0] ?? '?'}
          </span>
          <div className="text-left hidden sm:block">
            <p className="text-[14px] font-medium text-neutral-900 leading-none">
              {profile?.full_name || 'System Admin'}
            </p>
            <p className="text-[13px] text-neutral-500 mt-1.5 leading-none">
              {profile?.email}
            </p>
          </div>
        </div>

        <div className="h-5 w-px bg-neutral-200 hidden sm:block" />

        <Button
          variant="secondary"
          size="sm"
          onClick={signOut}
          id="sign-out-btn"
        >
          Sign out
        </Button>
      </div>
    </header>
  )
}
