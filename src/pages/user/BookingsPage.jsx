import { useState, useEffect, useCallback } from 'react'
import { getUserBookings, cancelBooking } from '@/queries/bookingQueries'
import { useAuth } from '@/hooks/useAuth'
import { StatusBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { ROUTES } from '@/constants'
import { Link } from 'react-router-dom'

function formatDate(iso) {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelId, setCancelId] = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState('')

  const fetchBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const data = await getUserBookings(user.id)
      setBookings(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  async function handleCancelConfirm() {
    setCancelLoading(true)
    setCancelError('')
    try {
      await cancelBooking(cancelId)
      setCancelId(null)
      fetchBookings()
    } catch (err) {
      setCancelError(err.message)
    } finally {
      setCancelLoading(false)
    }
  }

  const activeBookings = bookings.filter(b => b.status === 'confirmed')
  const pastBookings = bookings.filter(b => b.status !== 'confirmed')

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Bookings"
        subtitle={`${bookings.length} booking${bookings.length !== 1 ? 's' : ''} total`}
      />

      {error && (
        <div className="text-sm text-danger-400 bg-danger-950/40 border border-danger-700/40 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description="You haven't booked any journeys. Browse available routes to get started."
          action={{ label: 'Browse Journeys', onClick: () => {} }}
        />
      ) : (
        <>
          {/* Active Bookings */}
          {activeBookings.length > 0 && (
            <section aria-label="Active bookings">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
                Active ({activeBookings.length})
              </h2>
              <div className="space-y-3">
                {activeBookings.map(b => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    onCancel={() => { setCancelError(''); setCancelId(b.id) }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <section aria-label="Past bookings">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-3">
                Past ({pastBookings.length})
              </h2>
              <div className="space-y-3">
                {pastBookings.map(b => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!cancelId}
        title="Cancel booking"
        message={
          cancelError
            ? cancelError
            : 'Are you sure you want to cancel this booking? This cannot be undone.'
        }
        onConfirm={handleCancelConfirm}
        onCancel={() => { setCancelId(null); setCancelError('') }}
        loading={cancelLoading}
        danger
      />
    </div>
  )
}

// ─── Booking Card ─────────────────────────────────────────────

function BookingCard({ booking, onCancel }) {
  const journey = booking.journey
  const canCancel =
    booking.status === 'confirmed' &&
    journey?.status === 'scheduled'

  return (
    <div className="card">
      <div className="px-5 py-4 flex items-start justify-between gap-4">
        {/* Left: route + details */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Route */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-neutral-900">
              {journey?.origin ?? '—'}
            </span>
            <svg className="h-3.5 w-3.5 shrink-0 text-neutral-300" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-[15px] font-semibold text-neutral-900">
              {journey?.destination ?? '—'}
            </span>
            <StatusBadge type="booking" status={booking.status} />
          </div>

          {/* Meta */}
          <p className="text-[13px] text-neutral-400">
            Departs: {journey?.departure_time ? formatDate(journey.departure_time) : '—'}
          </p>
          <div className="flex flex-wrap gap-4 text-[12px] text-neutral-400">
            <span>🚌 {journey?.vehicle?.make} {journey?.vehicle?.model} · {journey?.vehicle?.license_plate}</span>
            {journey?.driver?.full_name && (
              <span>👤 {journey?.driver?.full_name}</span>
            )}
          </div>

          {booking.cancelled_at && (
            <p className="text-[12px] text-neutral-300">
              Cancelled: {formatDate(booking.cancelled_at)}
            </p>
          )}
        </div>

        {/* Right: fare + action */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <div className="text-right">
            <p className="text-[16px] font-semibold text-neutral-900">
              {journey?.fare
                ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(journey.fare)
                : '—'
              }
            </p>
            <p className="text-[12px] text-neutral-400">Full Vehicle</p>
          </div>

          {canCancel && (
            <button
              onClick={onCancel}
              className="text-[13px] font-medium text-neutral-400 hover:text-danger-500 transition-colors"
              id={`cancel-booking-${booking.id}`}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
