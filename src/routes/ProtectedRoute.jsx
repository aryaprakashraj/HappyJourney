import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES, ROLES } from '@/constants'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

/**
 * Wraps any route that requires authentication.
 * Unauthenticated users are redirected to /login.
 * Admins are redirected to /admin.
 */
export default function ProtectedRoute() {
  const { user, role, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />
  if (role === ROLES.ADMIN) return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />

  return <Outlet />
}
