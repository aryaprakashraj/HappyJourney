import React, { useState, useEffect, useCallback } from 'react'
import { getAllUsers } from '@/queries/profileQueries'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { ROLES } from '@/constants'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getAllUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (u.full_name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower)
    )
  })

  if (loading && !users.length) {
    return <div className="page-container flex justify-center py-12"><LoadingSpinner /></div>
  }

  return (
    <div className="page-container">
      <PageHeader title="Users Management" />
      
      <div className="bg-blue-50 text-blue-800 p-4 rounded-md mb-6 text-sm">
        Note: Admin accounts are managed via the Supabase dashboard. You can view all registered users below.
      </div>

      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="data-table-container overflow-x-auto">
        {filteredUsers.length === 0 ? (
          <EmptyState message="No users found." />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined At</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.full_name || '-'}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '-'}</td>
                  <td>
                    <Badge variant={u.role === ROLES.ADMIN ? 'purple' : 'default'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
