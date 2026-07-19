import { useState, useEffect, useCallback } from 'react'
import { getAvailableVehicles } from '@/queries/vehicleQueries'
import { createBooking } from '@/queries/bookingQueries'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import { ROUTES } from '@/constants'
import { useNavigate } from 'react-router-dom'

// ─── Booking Confirmation Modal ───────────────────────────────

function BookingModal({ vehicle, bookingData, onClose, onSuccess }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate estimated fare (KES 5000 - 10000 range)
  const baseFare = 5000 + (vehicle.capacity * 100)
  
  async function handleBook() {
    setError('')
    setLoading(true)
    try {
      await createBooking({
        origin: bookingData.origin,
        destination: bookingData.destination,
        departureTime: bookingData.departureTime,
        vehicleId: vehicle.id,
        userId: user.id
      })
      onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open title="Confirm Full-Vehicle Booking" onClose={onClose} size="sm">
      <div className="space-y-4">
        <div className="rounded-lg bg-neutral-50 border border-neutral-300/50 p-4 space-y-2">
          <p className="text-sm font-semibold text-neutral-900">
            {bookingData.origin} → {bookingData.destination}
          </p>
          <p className="text-xs text-neutral-600">
            Departs: {new Date(bookingData.departureTime).toLocaleString()}
          </p>
          <p className="text-xs text-neutral-600 mt-2">
            <strong>Vehicle:</strong> {vehicle.make} {vehicle.model} ({vehicle.capacity} max capacity)
          </p>
        </div>

        <div className="flex justify-between items-center text-sm border-t border-neutral-200 pt-3">
          <span className="text-neutral-600">Estimated Total Fare</span>
          <span className="font-semibold text-neutral-900">
            KES {baseFare.toLocaleString()}
          </span>
        </div>
        <p className="text-[10px] text-neutral-500 italic">
          *A driver will be automatically assigned to your journey upon confirmation.
        </p>

        {error && (
          <p role="alert" className="text-xs text-danger-400">
            {error}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button variant="secondary" size="sm" fullWidth onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={loading}
            onClick={handleBook}
            id="confirm-booking-btn"
          >
            {loading ? 'Booking…' : 'Confirm Booking'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Vehicle Card ─────────────────────────────────────────────

function VehicleCard({ vehicle, onSelect, disabled }) {
  return (
    <div className={`card px-5 py-4 flex items-center justify-between gap-4 transition-colors ${
      disabled ? 'opacity-40 pointer-events-none' : 'hover:bg-neutral-50'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-semibold text-neutral-900 truncate">
            {vehicle.make} {vehicle.model}
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
            {vehicle.year}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1 text-[13px] text-neutral-400">
          <span>Plate: {vehicle.license_plate}</span>
          <span>·</span>
          <span>Capacity: {vehicle.capacity}</span>
        </div>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onSelect(vehicle)}
        disabled={disabled}
        id={`book-vehicle-${vehicle.id}`}
      >
        Select Vehicle
      </Button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────

export default function JourneysPage() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Booking form state
  const [bookingData, setBookingData] = useState({
    origin: '',
    destination: '',
    departureTime: ''
  })
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const fetchVehicles = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAvailableVehicles()
      setVehicles(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchVehicles() }, [fetchVehicles])

  function handleInputChange(e) {
    const { name, value } = e.target
    setBookingData(prev => ({ ...prev, [name]: value }))
  }

  function handleBookingSuccess() {
    setSelectedVehicle(null)
    setBookingSuccess(true)
    fetchVehicles() // refresh vehicles
    
    // Redirect to bookings page after short delay
    setTimeout(() => {
      navigate(ROUTES.USER.BOOKINGS)
    }, 2000)
  }

  const isFormValid = bookingData.origin && bookingData.destination && bookingData.departureTime

  return (
    <div className="space-y-6">
      <PageHeader
        title="Book a Journey"
        subtitle="Enter your route and select a vehicle. We will assign a driver."
      />

      {bookingSuccess && (
        <div
          role="alert"
          className="card px-4 py-3 text-[14px] text-success-500 border-success-500"
        >
          ✓ Journey booked successfully! Redirecting to My Bookings…
        </div>
      )}

      {/* Booking Details Form */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-4">1. Journey Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700" htmlFor="origin">
              Origin *
            </label>
            <input
              id="origin"
              name="origin"
              type="text"
              placeholder="e.g. Nairobi"
              value={bookingData.origin}
              onChange={handleInputChange}
              className="w-full rounded bg-white border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700" htmlFor="destination">
              Destination *
            </label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="e.g. Mombasa"
              value={bookingData.destination}
              onChange={handleInputChange}
              className="w-full rounded bg-white border border-neutral-300 px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700" htmlFor="departureTime">
              Departure Time *
            </label>
            <input
              id="departureTime"
              name="departureTime"
              type="datetime-local"
              value={bookingData.departureTime}
              onChange={handleInputChange}
              className="w-full rounded bg-white border border-neutral-300 px-3 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Selection */}
      <div>
        <p className="section-title mb-3">2. Select an Available Vehicle</p>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-sm text-danger-400 bg-danger-950/40 border border-danger-700/40 px-4 py-3 rounded">
            {error}
          </div>
        ) : vehicles.length === 0 ? (
          <EmptyState
            title="No vehicles available"
            description="All our vehicles are currently booked or under maintenance."
          />
        ) : (
          <div className="space-y-2">
            {!isFormValid && (
              <p className="text-[13px] text-neutral-400 mb-3">
                Please fill out your journey details above before selecting a vehicle.
              </p>
            )}
            {vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                disabled={!isFormValid}
                onSelect={setSelectedVehicle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedVehicle && (
        <BookingModal
          vehicle={selectedVehicle}
          bookingData={bookingData}
          onClose={() => setSelectedVehicle(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
