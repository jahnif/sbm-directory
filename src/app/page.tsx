'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Family, ClassType } from '@/types'
// import FamilyCard from '@/components/FamilyCard';
import FamilyTableRow from '@/components/FamilyTableRow'
import SearchAndFilters from '@/components/SearchAndFilters'
import ProximitySearch from '@/components/ProximitySearch'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/hooks/useTranslation'
import { calculateDistance, getPostalCodeCoordinates, getAllPostalCodes } from '@/lib/distance-calculator'
import type { PostalCode } from '@/types'

export default function Home() {
  const { t } = useTranslation()
  const [families, setFamilies] = useState<Family[]>([])
  const [filteredFamilies, setFilteredFamilies] = useState<Family[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')

  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState<ClassType | 'all'>('all')
  const [connectionsFilter, setConnectionsFilter] = useState(false)

  // Proximity search states
  const [proximitySearch, setProximitySearch] = useState<{
    postalCode: string
    radius: number
    coordinates: { latitud: number; longitud: number } | null
  } | null>(null)

  // Cache postal codes for faster proximity search
  const [postalCodesCache, setPostalCodesCache] = useState<Map<string, { latitud: number; longitud: number }>>(new Map())

  useEffect(() => {
    loadFamilies()
    loadPostalCodes()
  }, [])

  // Load all postal codes once for caching
  const loadPostalCodes = async () => {
    try {
      const postalCodes = await getAllPostalCodes()
      const cache = new Map<string, { latitud: number; longitud: number }>()
      postalCodes.forEach((pc: PostalCode) => {
        cache.set(pc.codigo_postal, { latitud: pc.latitud, longitud: pc.longitud })
      })
      setPostalCodesCache(cache)
    } catch (err) {
      console.error('Error loading postal codes cache:', err)
    }
  }

  useEffect(() => {
    filterFamilies()
  }, [families, searchTerm, classFilter, connectionsFilter, proximitySearch]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const filterFamilies = async () => {
    let filtered = families

    // Proximity filter (highest priority, should run first)
    if (proximitySearch && proximitySearch.coordinates) {
      const nearbyFamilies: Family[] = []

      // Use cached postal codes instead of making API calls
      for (const family of families) {
        // Check if the family has a postal code
        if (family.codigo_postal) {
          const familyCoords = postalCodesCache.get(family.codigo_postal)
          if (familyCoords) {
            const distance = calculateDistance(
              proximitySearch.coordinates.latitud,
              proximitySearch.coordinates.longitud,
              familyCoords.latitud,
              familyCoords.longitud
            )

            if (distance <= proximitySearch.radius) {
              nearbyFamilies.push(family)
            }
          }
        }
      }

      filtered = nearbyFamilies
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (family) =>
          family.family_name.toLowerCase().includes(search) ||
          family.description.toLowerCase().includes(search) ||
          family.adults.some(
            (adult) =>
              adult.name.toLowerCase().includes(search) ||
              adult.industry?.toLowerCase().includes(search) ||
              adult.job_title?.toLowerCase().includes(search) ||
              adult.locations?.some(location =>
                location.city.toLowerCase().includes(search) ||
                location.country.toLowerCase().includes(search)
              ),
          ) ||
          family.children.some((child) =>
            child.name.toLowerCase().includes(search),
          ),
      )
    }

    // Class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter((family) =>
        family.children.some((child) => child.class === classFilter),
      )
    }

    // Connections filter
    if (connectionsFilter) {
      filtered = filtered.filter((family) =>
        family.adults.some((adult) => adult.interested_in_connections),
      )
    }

    setFilteredFamilies(filtered)
  }

  const handleProximitySearch = async (postalCode: string, radius: number) => {
    // Use cached postal code coordinates instead of API call
    const coordinates = postalCodesCache.get(postalCode)
    if (coordinates) {
      setProximitySearch({ postalCode, radius, coordinates })
    }
  }

  const handleClearProximitySearch = () => {
    setProximitySearch(null)
  }

  // Responsive view mode based on screen size
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'table' : 'table')
    }

    handleResize() // Set initial value
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          {/* <p className="text-gray-600">{t('admin.loadingFamilies')}</p> */}
          <p className="text-gray-600">{t('Loading Families...')}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {t('common.error')}: {error}
          </p>
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
      <header className="bg-white shadow-sm border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center flex-col lg:flex-row gap-4">
            <div className="lg:justify-start justify-start flex flex-col text-center lg:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {t('header.title')}
              </h1>
              <p className="text-gray-700 mt-1">{t('header.subtitle')}</p>
            </div>
            <div className="flex gap-3 text-sm">
              <LanguageToggle />
              <Link
                href="/register"
                className="px-4 py-2 flex items-center bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-center"
              >
                {t('header.addFamily')}
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 border flex items-center border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-center"
              >
                {t('header.admin')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-8">
        {/* Results Summary */}
        <div className="mb-6 mt-12 text-center">
          <img
            src="/logo-second-body-montessori.png"
            alt="Second Body Montessori Logo"
            className="mb-2 w-full max-w-[400px] text-center mx-auto"
          />
          <p className="text-3xl font-bold pb-1">{t('directory.title')}</p>

          <p className="font-light p-6 m-8 bg-amber-100 rounded-2xl max-w-[900px] mx-auto">
            {t('directory.description')}
          </p>

          {/* Search and Filters */}
          <SearchAndFilters
            onSearchChange={setSearchTerm}
            onClassFilter={setClassFilter}
            onConnectionsFilter={setConnectionsFilter}
            currentSearch={searchTerm}
            currentClassFilter={classFilter}
            currentConnectionsFilter={connectionsFilter}
          />

          {/* Proximity Search */}
          <div className="max-w-2xl mx-auto mt-6">
            <ProximitySearch
              onSearch={handleProximitySearch}
              onClear={handleClearProximitySearch}
              isActive={proximitySearch !== null}
            />
          </div>

          <p className="text-gray-800 mt-6">
            {proximitySearch ? (
              t('proximity.showingNearby', {
                count: filteredFamilies.length.toString(),
                radius: proximitySearch.radius.toString(),
                postalCode: proximitySearch.postalCode,
              })
            ) : (
              t('directory.showing', {
                count: filteredFamilies.length.toString(),
                total: families.length.toString(),
              })
            )}
          </p>
        </div>

        {/* Directory Display */}
        {filteredFamilies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg font-bold mb-4">
              {families.length === 0
                ? t('directory.noFamilies')
                : t('directory.noMatches')}
            </p>
            {families.length === 0 && (
              <Link
                href="/register"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                {t('directory.beFirst')}
              </Link>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white rounded-lg shadow-xl/5">
            {/* Sticky Headers */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 hidden lg:block">
              <div className="grid lg:grid-cols-[3fr_4fr_4fr_3fr] gap-4 px-6 py-2 text-sm text-center">
                {/* <div className="grid grid-cols-[3fr_4fr_4fr_3fr] gap-6 px-6 py-3 text-sm font-light text-gray-900 text-center"> */}
                <div className="">{t('family.familyName')}</div>
                <div className="">{t('family.adults')}</div>
                <div className="">{t('family.children')}</div>
                <div className="">{t('family.about')}</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200 family-list">
              {filteredFamilies.map((family) => (
                <FamilyTableRow
                  key={family.id}
                  family={family}
                  showNetworkingOnly={connectionsFilter}
                  classFilter={classFilter}
                />
              ))}
            </div>
          </div>
        ) : (
          // <div className="grid grid-cols-1 md:grid-cols-2 gap-6 family-list">
          //   {filteredFamilies.map((family, index) => (
          //     <FamilyCard
          //       key={`${family.id}-${searchTerm}-${classFilter}-${connectionsFilter}-${index}`}
          //       family={family}
          //       showNetworkingOnly={connectionsFilter}
          //     />
          //   ))}
          // </div>
          <div></div>
        )}
      </main>
    </div>
  )
}

// Task slist

// DONE - Add hometown
// DONE - Add Spanish version and ability to switch
// DONE - Add translation to form and submitted form content
// DONE - Add contact info for networking - not showing up in table content
// DONE - Translated form submissions are in the database but are not showing up using the language toggle
// DONE - Add  header and translation to 'add family' form
// DONE - Edit 'edit' form - add header

// DONE - Add animations to filter changes

// DONE - Remove non-networking spouses in filter?
// DONE - Add visual summary of family members with small circles under family name?
// DONE - Fix styling of cards - OR move to grid view
// DONE - Add Lynx class
// DONE - Fix filter in responsive view: Class dropdown and interested on the same line and remove extra whitespace
// DONE - Update form to move "add" buttons below fields
// DONE - Remove borders and backgrounds from form
// DONE - Add SBM logo to header
// DONE - Add SBM color scheme to admin page
// DONE - Fix header on Add Family form page
// DONE - Not all fields are being translted on Add Family Page
// DONE - Edit header on Edit Family form page
// DONE - Some fields list the field name instead of the content
// DONE - Add contact info to "Networking" button. Rename button "Networking - Show Contact Info" and expand to show info
// DONE - Add translation to Privacy page
// DONE - Vertical align adults in the main table
// DONE - Add favicon
// DONE - Update global font
// DONE - Test Spanish form sumbission to ensure it's translated to English
// DONE - Add color scheme to Admin Panel page
// DONE - Add some text about purpose of the director and the optional opt-in nature of the directory
// DONE - Fix error upon family form submission
// DONE - Fix language toggle description - language typte and flag
// DONE - Move filter under the directory title?
// DONE - Fix build errors
// DONE - Fix responsiveness of header, buttons
// DONE - Fix order of professional data in profiles
// DONE - Length about field length
// DONE - Fix color inversion in Safari and all browsers
// TODO - Fix horizontal scrolling on mobile
