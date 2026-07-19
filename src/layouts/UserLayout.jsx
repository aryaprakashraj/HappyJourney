import AppLayout from '@/layouts/AppLayout'
import { ROUTES } from '@/constants'

// ─── Icons ────────────────────────────────────────────────────

const icons = {
  dashboard: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  ),
  map: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 3l4-2 6 2 4-2v10l-4 2-6-2-4 2V3z" strokeLinejoin="round" />
      <path d="M5 1v10M11 3v10" />
    </svg>
  ),
  bookmark: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10a1 1 0 011 1v11l-6-3-6 3V3a1 1 0 011-1z" strokeLinejoin="round" />
    </svg>
  ),
  user: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M1 14c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round" />
    </svg>
  ),
}

const USER_NAV = [
  { to: ROUTES.USER.DASHBOARD, label: 'Dashboard',       icon: icons.dashboard },
  { to: ROUTES.USER.JOURNEYS,  label: 'Browse Journeys', icon: icons.map       },
  { to: ROUTES.USER.BOOKINGS,  label: 'My Bookings',     icon: icons.bookmark  },
  { to: ROUTES.USER.PROFILE,   label: 'Profile',         icon: icons.user      },
]

export default function UserLayout() {
  return <AppLayout navItems={USER_NAV} />
}
