import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * Wraps public-only routes (login, signup).
 * Already-authenticated users are redirected to their dashboard
 * so they never see the login form while logged in.
 */
export default function PublicRoute() {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  if (user) {
    const destination =
      role === ROLES.ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.USER.DASHBOARD
    return <Navigate to={destination} replace />
  }

  return <Outlet />
}
