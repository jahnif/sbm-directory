'use client'

import { ClassType } from '@/types'

interface SearchAndFiltersProps {
  onSearchChange: (search: string) => void
  onClassFilter: (classType: ClassType | 'all') => void
  onConnectionsFilter: (showConnections: boolean) => void
  currentSearch: string
  currentClassFilter: ClassType | 'all'
  currentConnectionsFilter: boolean
}

export default function SearchAndFilters({
  onSearchChange,
  onClassFilter,
  onConnectionsFilter,
  currentSearch,
  currentClassFilter,
  currentConnectionsFilter
}: SearchAndFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
        {/* Search */}
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Search families
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search families, names, descriptions..."
            value={currentSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Class Filter */}
        <div className="flex-shrink-0">
          <label htmlFor="class-filter" className="sr-only">
            Filter by class
          </label>
          <select
            id="class-filter"
            value={currentClassFilter}
            onChange={(e) => onClassFilter(e.target.value as ClassType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            <option value="Pegasus">Pegasus</option>
            <option value="Orion">Orion</option>
            <option value="Andromeda">Andromeda</option>
          </select>
        </div>

        {/* Connections Filter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <input
            type="checkbox"
            id="connections-filter"
            checked={currentConnectionsFilter}
            onChange={(e) => onConnectionsFilter(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="connections-filter" className="text-sm font-medium text-gray-700">
            Interested in connections
          </label>
        </div>

        {/* Clear Filters */}
        {(currentSearch || currentClassFilter !== 'all' || currentConnectionsFilter) && (
          <button
            onClick={() => {
              onSearchChange('')
              onClassFilter('all')
              onConnectionsFilter(false)
            }}
            className="flex-shrink-0 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear All
          </button>
        )}
      </div>
    </div>
  )
}