import React, { useState, useEffect, useCallback } from 'react'
import { getDrivers, createDriver, updateDriver, deleteDriver } from '@/queries/driverQueries'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Modal from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/Badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { DRIVER_STATUS } from '@/constants'
import { useToast } from '@/contexts/ToastContext'

function DriverFormModal({ driver, onSuccess, onClose }) {
  const { addToast } = useToast()
  const [fullName, setFullName] = useState(driver?.full_name || '')
  const [licenseNumber, setLicenseNumber] = useState(driver?.license_number || '')
  const [phone, setPhone] = useState(driver?.phone || '')
  const [status, setStatus] = useState(driver?.status || DRIVER_STATUS.AVAILABLE)
  const [notes, setNotes] = useState(driver?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (fullName.trim().length < 2) {
      const msg = 'Full name must be at least 2 characters'
      setError(msg)
      return
    }

    setLoading(true)
    
    const payload = {
      full_name: fullName,
      license_number: licenseNumber,
      phone,
      status,
      notes
    }

    try {
      if (driver) {
        await updateDriver(driver.id, payload)
        addToast('Driver updated successfully')
      } else {
        await createDriver(payload)
        addToast('Driver added successfully')
      }
      onSuccess()
    } catch (err) {
      const msg = err.message || 'Failed to save driver'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = Object.values(DRIVER_STATUS).map(val => ({
    label: val.charAt(0).toUpperCase() + val.slice(1).replace('-', ' '),
    value: val
  }))

  return (
    <Modal
      open={true}
      onClose={onClose}
      title={driver ? 'Edit Driver' : 'Add New Driver'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-danger-500 text-sm">{error}</div>}
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <Input
          label="License Number"
          placeholder="e.g. DL-KE-100001"
          value={licenseNumber}
          onChange={(e) => setLicenseNumber(e.target.value)}
          required
        />
        <Input
          label="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
          <Button type="button" variant="secondary" onClick={onClose}>
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

export default function DriversPage() {
  const { addToast } = useToast()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editDriver, setEditDriver] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getDrivers()
      setDrivers(data)
    } catch (err) {
      setError(err.message || 'Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrivers()
  }, [fetchDrivers])

  const handleCreate = () => {
    setEditDriver(null)
    setShowForm(true)
  }

  const handleEdit = (driver) => {
    setEditDriver(driver)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      setDeleteLoading(true)
      await deleteDriver(deleteId)
      await fetchDrivers()
      setDeleteId(null)
      addToast('Driver deleted successfully')
    } catch (err) {
      const msg = err.message || 'Failed to delete driver'
      addToast(msg, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchDrivers()
  }

  if (loading && !drivers.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Drivers" 
        action={<Button onClick={handleCreate}>Add Driver</Button>}
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {drivers.length === 0 ? (
          <EmptyState message="No drivers found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>License Number</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map(d => (
                <tr key={d.id}>
                  <td>{d.full_name}</td>
                  <td>{d.license_number}</td>
                  <td>{d.phone}</td>
                  <td>
                    <StatusBadge type="driver" status={d.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(d)}
                        className="text-[13px] font-medium text-neutral-600 hover:text-accent-600 transition-colors"
                      >
                        Edit
                      </button>
                      <span className="text-neutral-200">·</span>
                      <button
                        onClick={() => setDeleteId(d.id)}
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
        <DriverFormModal
          driver={editDriver}
          onSuccess={handleFormSuccess}
          onClose={() => setShowForm(false)}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Driver"
          message="Are you sure you want to delete this driver?"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}
