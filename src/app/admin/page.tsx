'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Family } from '@/types'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    loadFamilies()
  }, [])

  const loadFamilies = async () => {
    try {
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .order('family_name')

      if (familiesError) throw familiesError

      const { data: adultsData, error: adultsError } = await supabase
        .from('adults')
        .select('*')

      if (adultsError) throw adultsError

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')

      if (childrenError) throw childrenError

      const familiesWithMembers: Family[] = familiesData.map(family => ({
        ...family,
        adults: adultsData.filter(adult => adult.family_id === family.id),
        children: childrenData.filter(child => child.family_id === family.id)
      }))

      setFamilies(familiesWithMembers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load families')
    } finally {
      setLoading(false)
    }
  }

  const deleteFamily = async (familyId: string) => {
    if (deleteConfirm !== familyId) {
      setDeleteConfirm(familyId)
      setTimeout(() => setDeleteConfirm(null), 5000) // Auto-cancel after 5 seconds
      return
    }

    try {
      const { error } = await supabase
        .from('families')
        .delete()
        .eq('id', familyId)

      if (error) throw error

      setFamilies(families.filter(f => f.id !== familyId))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete family')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading families...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={loadFamilies}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600 mt-1">Manage family directory entries</p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
            >
              Back to Directory
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {families.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No families have been added yet.</p>
            <Link
              href="/register"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              Add the first family
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                All Families ({families.length})
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Family Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adults
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Children
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {families.map((family) => (
                    <tr key={family.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {family.family_name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {family.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {family.adults.map(adult => (
                            <div key={adult.id} className="mb-1">
                              {adult.name}
                              {adult.interested_in_connections && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  🤝
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {family.children.map(child => (
                            <div key={child.id} className="mb-1">
                              {child.name} 
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                child.class === 'Pegasus' ? 'bg-red-100 text-red-800' :
                                child.class === 'Orion' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                              }`}>
                                {child.class}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(family.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/admin/edit/${family.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteFamily(family.id)}
                            className={`${
                              deleteConfirm === family.id
                                ? 'text-red-800 bg-red-100 px-2 py-1 rounded'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            {deleteConfirm === family.id ? 'Confirm Delete?' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}