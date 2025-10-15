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

      const familiesWithMembers: Family[] = familiesData.map((family) => ({
        ...family,
        adults: adultsData.filter((adult) => adult.family_id === family.id),
        children: childrenData.filter((child) => child.family_id === family.id),
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

      setFamilies(families.filter((f) => f.id !== familyId))
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
          <p className="text-gray-800">Loading families...</p>
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
    <div className="min-h-screen bg-sbm-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-800 mt-1">
                Manage family directory entries
              </p>
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
            <p className="text-gray-800 text-lg mb-4">
              No families have been added yet.
            </p>
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

            {/* Sticky Headers - Desktop Only */}
            <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 hidden lg:block">
              <div className="grid lg:grid-cols-[2fr_3fr_3fr_2fr_2fr] gap-4 px-6 py-3 text-xs font-medium text-gray-700 uppercase tracking-wider">
                <div>Family Name</div>
                <div>Adults</div>
                <div>Children</div>
                <div>Created</div>
                <div>Actions</div>
              </div>
            </div>

            {/* Family Rows */}
            <div className="divide-y divide-gray-200">
              {families.map((family) => (
                <div key={family.id} className="hover:bg-gray-50 transition-colors">
                  <div className="grid lg:grid-cols-[2fr_3fr_3fr_2fr_2fr] gap-4 px-6 py-6 lg:py-4">

                    {/* Family Name */}
                    <div className="flex flex-col">
                      <div className="lg:hidden text-xs text-gray-500 mb-1 font-medium">
                        Family Name
                      </div>
                      <div className="text-sm font-bold text-gray-900">
                        {family.family_name}
                      </div>
                      <div className="text-sm text-gray-700 lg:max-w-xs lg:truncate">
                        {family.description}
                      </div>
                    </div>

                    {/* Adults */}
                    <div className="flex flex-col">
                      <div className="lg:hidden text-xs text-gray-500 mb-1 font-medium">
                        Adults
                      </div>
                      <div className="text-sm text-gray-900">
                        {family.adults.map((adult) => (
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
                    </div>

                    {/* Children */}
                    <div className="flex flex-col">
                      <div className="lg:hidden text-xs text-gray-500 mb-1 font-medium">
                        Children
                      </div>
                      <div className="text-sm text-gray-900">
                        {family.children.map((child) => (
                          <div key={child.id} className="mb-1">
                            {child.name}
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${child.class === 'Pegasus' ? 'bg-red-100 text-red-800' : child.class === 'Orion' ? 'bg-blue-100 text-blue-800' : child.class === 'Andromeda' ? 'bg-green-100 text-green-800' : child.class === 'Lynx' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              {child.class}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="flex flex-col">
                      <div className="lg:hidden text-xs text-gray-500 mb-1 font-medium">
                        Created
                      </div>
                      <div className="text-sm text-gray-700">
                        {new Date(family.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col">
                      <div className="lg:hidden text-xs text-gray-500 mb-1 font-medium">
                        Actions
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm font-medium">
                        <Link
                          href={`/admin/edit/${family.id}`}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteFamily(family.id)}
                          className={`px-3 py-1 rounded-md transition-colors ${deleteConfirm === family.id ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                        >
                          {deleteConfirm === family.id
                            ? 'Confirm Delete?'
                            : 'Delete'}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
