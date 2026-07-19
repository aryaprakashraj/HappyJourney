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
  truck: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="4" width="10" height="7" rx="1" />
      <path d="M11 6h2l2 3v2h-4V6z" strokeLinejoin="round" />
      <circle cx="4" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  ),
  person: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="3" />
      <path d="M1 14c0-3.314 3.134-6 7-6s7 2.686 7 6" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 10l4-4M4 8a2 2 0 002 2h4a2 2 0 000-4H6a2 2 0 00-2 2z" strokeLinecap="round" />
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
  users: (
    <svg fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1 13c0-2.485 2.24-4.5 5-4.5s5 2.015 5 4.5" strokeLinecap="round" />
      <circle cx="12" cy="5" r="2" />
      <path d="M14 12.5c.65.34 1 .9 1 1.5" strokeLinecap="round" />
    </svg>
  ),
}

const ADMIN_NAV = [
  { to: ROUTES.ADMIN.DASHBOARD,   label: 'Dashboard',   icon: icons.dashboard },
  { to: ROUTES.ADMIN.VEHICLES,    label: 'Vehicles',    icon: icons.truck     },
  { to: ROUTES.ADMIN.DRIVERS,     label: 'Drivers',     icon: icons.person    },
  { to: ROUTES.ADMIN.ASSIGNMENTS, label: 'Assignments', icon: icons.link      },
  { to: ROUTES.ADMIN.JOURNEYS,    label: 'Journeys',    icon: icons.map       },
  { to: ROUTES.ADMIN.BOOKINGS,    label: 'Bookings',    icon: icons.bookmark  },
  { to: ROUTES.ADMIN.USERS,       label: 'Users',       icon: icons.users     },
]

export default function AdminLayout() {
  return <AppLayout navItems={ADMIN_NAV} />
}
