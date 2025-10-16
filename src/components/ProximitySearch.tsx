'use client'

import { useState } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

interface ProximitySearchProps {
  onSearch: (postalCode: string, radius: number) => void
  onClear: () => void
  isActive: boolean
  className?: string
}

const RADIUS_OPTIONS = [0.25, 0.5, 1, 2, 5, 10, 15, 20]

export default function ProximitySearch({
  onSearch,
  onClear,
  isActive,
  className = '',
}: ProximitySearchProps) {
  const { t } = useTranslation()
  const [postalCode, setPostalCode] = useState('')
  const [radius, setRadius] = useState(5)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSearch = () => {
    // Validate postal code
    if (!postalCode.trim()) {
      setError(t('postalCode.required'))
      return
    }

    if (!/^46\d{3}$/.test(postalCode)) {
      setError(t('postalCode.invalid'))
      return
    }

    setError(null)
    onSearch(postalCode, radius)
  }

  const handleClear = () => {
    setPostalCode('')
    setRadius(5)
    setError(null)
    onClear()
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('proximity.title')}
        </h3>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          {isExpanded ? t('proximity.hide') : t('proximity.show')}
        </button>
      </div>

      {isExpanded && (
        <>
          <p className="text-sm text-gray-600 mb-4 mt-3">
            {t('proximity.enterPostalCode')}
          </p>

          <div className="space-y-4">
        <div>
          <label
            htmlFor="proximity-postal-code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('postalCode.label')}
          </label>
          <input
            id="proximity-postal-code"
            type="text"
            value={postalCode}
            onChange={(e) => {
              const value = e.target.value
              // Only allow Valencia postal codes (46xxx) - allow progressive typing
              if (value === '' || /^4?6?\d{0,3}$/.test(value)) {
                setPostalCode(value)
                setError(null)
              }
            }}
            maxLength={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            placeholder={t('postalCode.placeholder')}
          />
          {error && (
            <p className="text-xs text-red-600 mt-1">{error}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="proximity-radius"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {t('proximity.radius')}
          </label>
          <div className="flex items-center space-x-2">
            <select
              id="proximity-radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {RADIUS_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r} {t('proximity.km')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSearch}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            {t('proximity.search')}
          </button>
          {isActive && (
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {t('proximity.clear')}
            </button>
          )}
        </div>
      </div>

          {isActive && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {t('proximity.showingResults', { postalCode, radius })}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
