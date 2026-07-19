import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROLES, ROUTES } from '@/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * Wraps any route that requires the admin role.
 * - Unauthenticated → /login
 * - Authenticated non-admin → /user/dashboard
 * - Admin → renders the route
 */
export default function AdminRoute() {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (role !== ROLES.ADMIN) return <Navigate to={ROUTES.USER.DASHBOARD} replace />

  return <Outlet />
}
