import React, { useState, useEffect } from 'react'
import { getDashboardStats } from '@/queries/dashboardQueries'
import { useAuth } from '@/hooks/useAuth'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const data = await getDashboardStats()
        setStats(data)
      } catch (err) {
        setError(err.message || 'Failed to load dashboard stats.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading || !stats) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  if (error) {
    return <div className="page-container text-danger-500">{error}</div>
  }

  return (
    <div className="page-container">
      <div>
        <h1>Admin Dashboard</h1>
        {profile?.email && (
          <p className="text-neutral-500 mt-2">Signed in as {profile.email}</p>
        )}
      </div>

      <section>
        <h2 className="mb-4">Fleet Overview</h2>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-neutral-900 w-1/2">Total Vehicles</td>
                <td className="text-neutral-700">{stats.vehicles.total}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Available Vehicles</td>
                <td className="text-neutral-700">{stats.vehicles.available}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">In Transit</td>
                <td className="text-neutral-700">{stats.vehicles.onJourney + stats.vehicles.booked}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">In Maintenance</td>
                <td className="text-neutral-700">{stats.vehicles.maintenance}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4">Operations</h2>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-neutral-900 w-1/2">Available Drivers</td>
                <td className="text-neutral-700">{stats.drivers.available}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">On Duty</td>
                <td className="text-neutral-700">{stats.drivers.onDuty}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Scheduled Journeys</td>
                <td className="text-neutral-700">{stats.journeys.scheduled}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Active Journeys</td>
                <td className="text-neutral-700">{stats.journeys.ongoing}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4">Bookings & Users</h2>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-neutral-900 w-1/2">Active Bookings</td>
                <td className="text-neutral-700">{stats.bookings.confirmed}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Total Bookings</td>
                <td className="text-neutral-700">{stats.bookings.total}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Registered Users</td>
                <td className="text-neutral-700">{stats.users.total}</td>
              </tr>
              <tr>
                <td className="font-medium text-neutral-900">Completed Journeys</td>
                <td className="text-neutral-700">{stats.journeys.completed}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
