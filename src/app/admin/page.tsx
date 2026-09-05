'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Family } from '@/types'

export default function AdminPage() {
  const [families, setFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPasswordField, setShowPasswordField] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [view, setView] = useState<'active' | 'archived'>('active')
  const [archiveConfirm, setArchiveConfirm] = useState<string | null>(null)
  const archiveConfirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin-auth')
        const data = await res.json()
        setIsAdmin(Boolean(data.isAdmin))
      } catch {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [])

  useEffect(() => {
    loadFamilies()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view])

  useEffect(() => {
    return () => {
      if (archiveConfirmTimer.current) clearTimeout(archiveConfirmTimer.current)
    }
  }, [])

  const loadFamilies = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: familiesData, error: familiesError } = await supabase
        .from('families')
        .select('*')
        .eq('status', view)
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

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)
    try {
      const res = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Incorrect password')
        return
      }
      setIsAdmin(true)
      setShowPasswordField(false)
      setPasswordInput('')
    } catch {
      setPasswordError('Could not verify password')
    }
  }

  const signOutAdmin = async () => {
    await fetch('/api/admin-auth', { method: 'DELETE' })
    setIsAdmin(false)
    setView('active')
  }

  const archiveFamily = async (familyId: string) => {
    if (archiveConfirm !== familyId) {
      if (archiveConfirmTimer.current) clearTimeout(archiveConfirmTimer.current)
      setArchiveConfirm(familyId)
      archiveConfirmTimer.current = setTimeout(
        () => setArchiveConfirm(null),
        5000,
      )
      return
    }
    if (archiveConfirmTimer.current) {
      clearTimeout(archiveConfirmTimer.current)
      archiveConfirmTimer.current = null
    }
    try {
      const { error } = await supabase
        .from('families')
        .update({ status: 'archived', archived_at: new Date().toISOString() })
        .eq('id', familyId)
      if (error) throw error
      setArchiveConfirm(null)
      await loadFamilies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive family')
    }
  }

  const restoreFamily = async (familyId: string) => {
    try {
      const { error } = await supabase
        .from('families')
        .update({ status: 'active', archived_at: null })
        .eq('id', familyId)
      if (error) throw error
      await loadFamilies()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore family')
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
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <>
                  <div className="flex rounded-md border border-gray-300 overflow-hidden">
                    <button
                      onClick={() => setView('active')}
                      className={`px-3 py-2 text-sm font-medium ${view === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setView('archived')}
                      className={`px-3 py-2 text-sm font-medium ${view === 'archived' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Archived
                    </button>
                  </div>
                  <button
                    onClick={signOutAdmin}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Exit admin
                  </button>
                </>
              ) : showPasswordField ? (
                <form
                  onSubmit={submitPassword}
                  className="flex items-center gap-2"
                >
                  <input
                    type="password"
                    autoFocus
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Admin password"
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                  >
                    Unlock
                  </button>
                  {passwordError && (
                    <span className="text-sm text-red-600">
                      {passwordError}
                    </span>
                  )}
                </form>
              ) : (
                <button
                  onClick={() => setShowPasswordField(true)}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Admin access
                </button>
              )}
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
              >
                Back to Directory
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {families.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-800 text-lg mb-4">
              {view === 'archived'
                ? 'No archived families.'
                : 'No families have been added yet.'}
            </p>
            {view === 'active' && (
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Add the first family
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {view === 'archived' ? 'Archived' : 'Active'} Families (
                {families.length})
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
                <div
                  key={family.id}
                  className="hover:bg-gray-50 transition-colors"
                >
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
                        {isAdmin && view === 'active' && (
                          <button
                            onClick={() => archiveFamily(family.id)}
                            className={`px-3 py-1 rounded-md transition-colors ${archiveConfirm === family.id ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}
                          >
                            {archiveConfirm === family.id
                              ? 'Confirm Archive?'
                              : 'Archive'}
                          </button>
                        )}
                        {isAdmin && view === 'archived' && (
                          <button
                            onClick={() => restoreFamily(family.id)}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                          >
                            Restore
                          </button>
                        )}
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
