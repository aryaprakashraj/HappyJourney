import React, { useState, useEffect, useCallback } from 'react'
import { getJourneys, createJourney, updateJourney, deleteJourney } from '@/queries/journeyQueries'
import { getVehicles } from '@/queries/vehicleQueries'
import { getDrivers } from '@/queries/driverQueries'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { JOURNEY_STATUS, JOURNEY_DETAIL } from '@/constants'

function JourneyFormModal({ journey, vehicles, drivers, onSuccess, onClose }) {
  const formatDateTime = (isoString) => {
    if (!isoString) return ''
    return new Date(isoString).toISOString().slice(0, 16)
  }

  const [vehicleId, setVehicleId] = useState(journey?.vehicle_id || '')
  const [driverId, setDriverId] = useState(journey?.driver_id || '')
  const [origin, setOrigin] = useState(journey?.origin || '')
  const [destination, setDestination] = useState(journey?.destination || '')
  const [departureTime, setDepartureTime] = useState(formatDateTime(journey?.departure_time))
  const [arrivalTime, setArrivalTime] = useState(formatDateTime(journey?.arrival_time))
  const [fare, setFare] = useState(journey?.fare || '')
  const [status, setStatus] = useState(journey?.status || JOURNEY_STATUS.SCHEDULED)
  const [detail, setDetail] = useState(journey?.detail || JOURNEY_DETAIL.AT_ORIGIN)
  const [notes, setNotes] = useState(journey?.notes || '')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (new Date(arrivalTime) <= new Date(departureTime)) {
      setError('Arrival time must be after departure time.')
      return
    }

    setLoading(true)
    
    const payload = {
      vehicle_id: vehicleId,
      driver_id: driverId,
      origin,
      destination,
      departure_time: new Date(departureTime).toISOString(),
      arrival_time: new Date(arrivalTime).toISOString(),
      fare: parseFloat(fare),
      available_seats: 0,
      status,
      detail,
      notes
    }

    try {
      if (journey) {
        await updateJourney(journey.id, payload)
      } else {
        await createJourney(payload)
      }
      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to save journey')
    } finally {
      setLoading(false)
    }
  }

  const vehicleOptions = vehicles.map(v => ({
    label: `${v.make} ${v.model} (${v.license_plate})`,
    value: v.id
  }))

  const driverOptions = drivers.map(d => ({
    label: `${d.full_name} (${d.license_number})`,
    value: d.id
  }))

  const statusOptions = Object.values(JOURNEY_STATUS).map(val => ({
    label: val.charAt(0).toUpperCase() + val.slice(1),
    value: val
  }))

  const detailOptions = Object.values(JOURNEY_DETAIL).map(val => ({
    label: val.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    value: val
  }))

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={journey ? 'Edit Journey' : 'Add New Journey'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Vehicle"
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            options={[{ label: 'Select Vehicle...', value: '' }, ...vehicleOptions]}
            required
          />
          <Select
            label="Driver"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            options={[{ label: 'Select Driver...', value: '' }, ...driverOptions]}
            required
          />
          <Input
            label="Origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            required
          />
          <Input
            label="Destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            required
          />
          <Input
            type="datetime-local"
            label="Departure Time"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            required
          />
          <Input
            type="datetime-local"
            label="Arrival Time"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
            required
          />
          <Input
            type="number"
            label="Fare"
            value={fare}
            onChange={(e) => setFare(e.target.value)}
            min="0"
            step="0.01"
            required
          />
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            required
          />
          <Select
            label="Detail"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            options={detailOptions}
            required
          />
        </div>
        <Input
          label="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex justify-end space-x-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default function JourneysPage() {
  const [journeys, setJourneys] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editJourney, setEditJourney] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [allJourneys, allVehicles, allDrivers] = await Promise.all([
        getJourneys(),
        getVehicles(),
        getDrivers()
      ])
      setJourneys(allJourneys)
      setVehicles(allVehicles)
      setDrivers(allDrivers)
    } catch (err) {
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleCreate = () => {
    setEditJourney(null)
    setShowForm(true)
  }

  const handleEdit = (journey) => {
    setEditJourney(journey)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleteLoading(true)
      await deleteJourney(deleteId)
      await fetchData()
      setDeleteId(null)
    } catch (err) {
      alert(err.message || 'Failed to delete journey')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchData()
  }

  if (loading && !journeys.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Journeys" 
        action={<Button onClick={handleCreate}>Add Journey</Button>}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {journeys.length === 0 ? (
          <EmptyState message="No journeys found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Route</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Departure</th>
                <th>Arrival</th>
                <th>Status</th>
                <th>Fare</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {journeys.map(j => (
                <tr key={j.id}>
                  <td>{j.origin} → {j.destination}</td>
                  <td>{j.vehicle ? `${j.vehicle.make} ${j.vehicle.model}` : '-'}</td>
                  <td>{j.driver ? j.driver.full_name : '-'}</td>
                  <td>{new Date(j.departure_time).toLocaleString()}</td>
                  <td>{new Date(j.arrival_time).toLocaleString()}</td>
                  <td>
                    <StatusBadge type="journey" status={j.status} />
                  </td>
                  <td>${Number(j.fare).toFixed(2)}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(j)}>Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteId(j.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <JourneyFormModal
          journey={editJourney}
          vehicles={vehicles}
          drivers={drivers}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Journey"
          message="Are you sure you want to delete this journey?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
