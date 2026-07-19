import React, { useState, useEffect, useCallback } from 'react'
import { getAssignments, closeAssignment } from '@/queries/assignmentQueries'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToast } from '@/contexts/ToastContext'

export default function AssignmentsPage() {
  const { addToast } = useToast()
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [closeId, setCloseId] = useState(null)
  const [closeLoading, setCloseLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const allAssignments = await getAssignments()
      // Filter only current assignments
      setAssignments(allAssignments.filter(a => a.is_current))
    } catch (err) {
      setError(err.message || 'Failed to load assignments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUnassign = async () => {
    if (!closeId) return
    try {
      setCloseLoading(true)
      await closeAssignment(closeId)
      await fetchData()
      setCloseId(null)
      addToast('Driver unassigned successfully')
    } catch (err) {
      const msg = err.message || 'Failed to unassign driver'
      addToast(msg, 'error')
    } finally {
      setCloseLoading(false)
    }
  }

  if (loading && !assignments.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader 
        title="Vehicle Assignments" 
      />

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {assignments.length === 0 ? (
          <EmptyState title="No active driver assignments." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Current Driver</th>
                <th>Assigned Since</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td>
                    {a.vehicle ? `${a.vehicle.make} ${a.vehicle.model} - ${a.vehicle.license_plate}` : 'Unknown Vehicle'}
                  </td>
                  <td>
                    {a.driver ? a.driver.full_name : 'Unknown Driver'}
                  </td>
                  <td>
                    {new Date(a.assigned_at).toLocaleString()}
                  </td>
                  <td>{a.notes || '-'}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCloseId(a.id)}
                        className="text-[13px] font-medium text-neutral-600 hover:text-danger-500 transition-colors"
                      >
                        Unassign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {closeId && (
        <ConfirmDialog
          isOpen={true}
          title="Unassign Driver"
          message="Are you sure you want to unassign this driver from the vehicle?"
          onConfirm={handleUnassign}
          onCancel={() => setCloseId(null)}
          loading={closeLoading}
          danger
        />
      )}
    </div>
  )
}
