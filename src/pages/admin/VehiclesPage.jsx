import React, { useState, useEffect, useCallback } from 'react'
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '@/queries/vehicleQueries'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { VEHICLE_STATUS } from '@/constants'
import { useToast } from '@/contexts/ToastContext'

function VehicleFormModal({ vehicle, onSuccess, onClose }) {
  const { addToast } = useToast()
  const [make, setMake] = useState(vehicle?.make || '')
  const [model, setModel] = useState(vehicle?.model || '')
  const [year, setYear] = useState(vehicle?.year || '')
  const [licensePlate, setLicensePlate] = useState(vehicle?.license_plate || '')
  const [capacity, setCapacity] = useState(vehicle?.capacity || '')
  const [status, setStatus] = useState(vehicle?.status || VEHICLE_STATUS.AVAILABLE)
  const [notes, setNotes] = useState(vehicle?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const payload = {
      make,
      model,
      year: parseInt(year, 10),
      license_plate: licensePlate,
      capacity: parseInt(capacity, 10),
      status,
      notes
    }

    try {
      if (vehicle) {
        await updateVehicle(vehicle.id, payload)
        addToast('Vehicle updated successfully')
      } else {
        await createVehicle(payload)
        addToast('Vehicle added successfully')
      }
      onSuccess()
    } catch (err) {
      const msg = err.message || 'Failed to save vehicle'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = Object.values(VEHICLE_STATUS).map(val => ({
    label: val.charAt(0).toUpperCase() + val.slice(1).replace('-', ' '),
    value: val
  }))

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <Input
          label="Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
          required
        />
        <Input
          label="Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          required
        />
        <Input
          type="number"
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          min="1990"
          max="2030"
          required
        />
        <Input
          label="License Plate"
          value={licensePlate}
          onChange={(e) => setLicensePlate(e.target.value)}
          required
        />
        <Input
          type="number"
          label="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          min="1"
          required
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
          required
        />
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

export default function VehiclesPage() {
  const { addToast } = useToast()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editVehicle, setEditVehicle] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getVehicles()
      setVehicles(data)
    } catch (err) {
      setError(err.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  const handleCreate = () => {
    setEditVehicle(null)
    setShowForm(true)
  }

  const handleEdit = (vehicle) => {
    setEditVehicle(vehicle)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleteLoading(true)
      await deleteVehicle(deleteId)
      await fetchVehicles()
      setDeleteId(null)
      addToast('Vehicle deleted successfully')
    } catch (err) {
      const msg = err.message || 'Failed to delete vehicle'
      addToast(msg, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchVehicles()
  }

  if (loading && !vehicles.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Vehicles" 
        action={<Button onClick={handleCreate}>Add Vehicle</Button>}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {vehicles.length === 0 ? (
          <EmptyState message="No vehicles found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Make & Model</th>
                <th>License Plate</th>
                <th>Year</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id}>
                  <td>{v.make} {v.model}</td>
                  <td>{v.license_plate}</td>
                  <td>{v.year}</td>
                  <td>{v.capacity}</td>
                  <td>
                    <StatusBadge type="vehicle" status={v.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(v)}
                        className="text-[13px] font-medium text-neutral-600 hover:text-accent-600 transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-neutral-200">·</span>
                      <button
                        onClick={() => setDeleteId(v.id)}
                        className="text-[13px] font-medium text-neutral-600 hover:text-danger-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <VehicleFormModal
          vehicle={editVehicle}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Vehicle"
          message="Are you sure you want to delete this vehicle?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
