import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getUserBookings } from '@/queries/bookingQueries'
import { getAvailableVehicles } from '@/queries/vehicleQueries'
import StatCard from '@/components/ui/StatCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { StatusBadge } from '@/components/ui/Badge'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import Button from '@/components/ui/Button'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function UserDashboard() {
  const { user, profile } = useAuth()
  const [bookings, setBookings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [bookingsData, vehiclesData] = await Promise.all([
        getUserBookings(user.id),
        getAvailableVehicles(),
      ])
      setBookings(bookingsData)
      setVehicles(vehiclesData.slice(0, 3))
    } catch {
      // Non-critical — dashboard degrades gracefully
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { loadData() }, [loadData])

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')

  return (
    <div className="space-y-8">
      {/* ── Welcome ───────────────────────────────────────────── */}
      <div>
        <h1 className="text-[22px] font-semibold text-neutral-900">
          Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-[14px] text-neutral-500 mt-1">
          Here's a summary of your activity.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner /></div>
      ) : (
        <>
          {/* ── Stats Row ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Active Bookings"
              value={confirmedBookings.length}
              variant="success"
            />
            <StatCard
              label="Completed Trips"
              value={completedBookings.length}
              variant="default"
            />
            <StatCard
              label="Available Vehicles"
              value={vehicles.length === 3 ? '3+' : vehicles.length}
              variant="info"
              description="Ready to book"
            />
          </div>

          {/* ── Upcoming Trips ────────────────────────────────── */}
          {confirmedBookings.length > 0 && (
            <section>
              <div className="section-header">
                <p className="section-title">Upcoming Trips</p>
                <Link to={ROUTES.USER.BOOKINGS} className="text-[13px] text-accent-600 hover:text-accent-700 transition-colors">
                  View all
                </Link>
              </div>
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Route</th>
                      <th>Departure</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmedBookings.slice(0, 3).map(b => (
                      <tr key={b.id}>
                        <td className="font-medium text-neutral-900">
                          {b.journey?.origin} → {b.journey?.destination}
                        </td>
                        <td className="text-neutral-500">
                          {b.journey?.departure_time ? formatDate(b.journey.departure_time) : '—'}
                        </td>
                        <td className="text-neutral-500">
                          {b.journey?.vehicle?.make} {b.journey?.vehicle?.model}
                        </td>
                        <td><StatusBadge type="booking" status={b.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Available Vehicles ────────────────────────────── */}
          {vehicles.length > 0 && (
            <section>
              <div className="section-header">
                <p className="section-title">Available Vehicles</p>
                <Link to={ROUTES.USER.JOURNEYS} className="text-[13px] text-accent-600 hover:text-accent-700 transition-colors">
                  Browse all
                </Link>
              </div>
              <div className="card divide-y divide-neutral-200">
                {vehicles.map(v => (
                  <div key={v.id} className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="text-[14px] font-medium text-neutral-900">
                        {v.make} {v.model}
                      </p>
                      <p className="text-[13px] text-neutral-400 mt-0.5">
                        Capacity: {v.capacity} passengers · {v.license_plate}
                      </p>
                    </div>
                    <Link to={ROUTES.USER.JOURNEYS}>
                      <Button variant="secondary" size="sm">Book</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Empty state ───────────────────────────────────── */}
          {confirmedBookings.length === 0 && bookings.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-[14px] text-neutral-500 mb-4">
                You haven&apos;t made any bookings yet.
              </p>
              <Link to={ROUTES.USER.JOURNEYS}>
                <Button variant="primary" size="sm" id="dashboard-browse-btn">
                  Book a Vehicle
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
