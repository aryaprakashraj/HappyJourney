import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ROUTES } from '@/constants'

// ─── Route guards ─────────────────────────────────────────────
import PublicRoute    from '@/routes/PublicRoute'
import ProtectedRoute from '@/routes/ProtectedRoute'
import AdminRoute     from '@/routes/AdminRoute'

// ─── Layouts ──────────────────────────────────────────────────
import AuthLayout  from '@/layouts/AuthLayout'
import UserLayout  from '@/layouts/UserLayout'
import AdminLayout from '@/layouts/AdminLayout'

// ─── Public pages ─────────────────────────────────────────────
import LandingPage from '@/pages/LandingPage'
import LoginPage   from '@/pages/LoginPage'
import SignupPage  from '@/pages/SignupPage'

// ─── User pages ───────────────────────────────────────────────
import UserDashboard from '@/pages/user/UserDashboard'
import JourneysPage  from '@/pages/user/JourneysPage'
import BookingsPage  from '@/pages/user/BookingsPage'
import ProfilePage   from '@/pages/user/ProfilePage'

// ─── Admin pages ──────────────────────────────────────────────
import AdminDashboard          from '@/pages/admin/AdminDashboard'
import VehiclesPage            from '@/pages/admin/VehiclesPage'
import DriversPage             from '@/pages/admin/DriversPage'
import AssignmentsPage         from '@/pages/admin/AssignmentsPage'
import JourneysAdminPage       from '@/pages/admin/JourneysPage'
import BookingsManagementPage  from '@/pages/admin/BookingsManagementPage'
import UsersPage               from '@/pages/admin/UsersPage'

import { ToastProvider } from '@/contexts/ToastContext'
import { SidebarProvider } from '@/contexts/SidebarContext'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <SidebarProvider>
          <AuthProvider>
            <Routes>
              {/* ── Public landing ──────────────────────────────── */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />

          {/* ── Auth pages (redirect away if already logged in) ── */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN}  element={<LoginPage />}  />
              <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
            </Route>
          </Route>

          {/* ── Protected user routes ───────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<UserLayout />}>
              <Route path="/user" element={<Navigate to={ROUTES.USER.DASHBOARD} replace />} />
              <Route path={ROUTES.USER.DASHBOARD} element={<UserDashboard />} />
              <Route path={ROUTES.USER.JOURNEYS}  element={<JourneysPage />}  />
              <Route path={ROUTES.USER.BOOKINGS}  element={<BookingsPage />}  />
              <Route path={ROUTES.USER.PROFILE}   element={<ProfilePage />}   />
            </Route>
          </Route>

          {/* ── Protected admin routes ──────────────────────── */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to={ROUTES.ADMIN.DASHBOARD} replace />} />
              <Route path={ROUTES.ADMIN.DASHBOARD}   element={<AdminDashboard />}         />
              <Route path={ROUTES.ADMIN.VEHICLES}    element={<VehiclesPage />}            />
              <Route path={ROUTES.ADMIN.DRIVERS}     element={<DriversPage />}             />
              <Route path={ROUTES.ADMIN.ASSIGNMENTS} element={<AssignmentsPage />}         />
              <Route path={ROUTES.ADMIN.JOURNEYS}    element={<JourneysAdminPage />}       />
              <Route path={ROUTES.ADMIN.BOOKINGS}    element={<BookingsManagementPage />}  />
              <Route path={ROUTES.ADMIN.USERS}       element={<UsersPage />}               />
            </Route>
          </Route>

          {/* ── Catch-all ───────────────────────────────────── */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </AuthProvider>
        </SidebarProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
