import React, { useState, useEffect, useCallback } from 'react'
import { getAllBookings, updateBookingStatus } from '@/queries/bookingQueries'
import Button from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { BOOKING_STATUS } from '@/constants'

export default function BookingsManagementPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelId, setCancelId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllBookings()
      setBookings(data)
    } catch (err) {
      setError(err.message || 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const handleMarkComplete = async (id) => {
    try {
      setActionLoading(true)
      await updateBookingStatus(id, BOOKING_STATUS.COMPLETED)
      await fetchBookings()
    } catch (err) {
      alert(err.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!cancelId) return
    try {
      setActionLoading(true)
      await updateBookingStatus(cancelId, BOOKING_STATUS.CANCELLED)
      await fetchBookings()
      setCancelId(null)
    } catch (err) {
      alert(err.message || 'Failed to cancel booking')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading && !bookings.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader title="Bookings Management" />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {bookings.length === 0 ? (
          <EmptyState message="No bookings found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Journey</th>
                <th>User</th>
                <th>Status</th>
                <th>Booked At</th>
                <th>Cancelled At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    {b.journey ? `${b.journey.origin} → ${b.journey.destination}` : '-'}
                  </td>
                  <td>
                    {b.profile ? `${b.profile.full_name} (${b.profile.email})` : '-'}
                  </td>
                  <td>
                    <StatusBadge type="booking" status={b.status} />
                  </td>
                  <td>{new Date(b.booked_at).toLocaleString()}</td>
                  <td>{b.cancelled_at ? new Date(b.cancelled_at).toLocaleString() : '-'}</td>
                  <td className="p-3 text-right space-x-2">
                    {b.status === BOOKING_STATUS.CONFIRMED && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkComplete(b.id)} disabled={actionLoading}>
                        Mark Complete
                      </Button>
                    )}
                    {b.status !== BOOKING_STATUS.CANCELLED && (
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setCancelId(b.id)} disabled={actionLoading}>
                        Cancel
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {cancelId && (
        <ConfirmDialog
          isOpen={true}
          title="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be fully undone (it will change status to cancelled)."
          onConfirm={handleCancel}
          onCancel={() => setCancelId(null)}
          loading={actionLoading}
        />
      )}
    </div>
  )
}
