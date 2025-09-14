'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Family } from '@/types'

interface FamilyTableRowProps {
  family: Family
}

export default function FamilyTableRow({ family }: FamilyTableRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const truncateText = (text: string, limit: number = 150) => {
    if (text.length <= limit) return text
    return text.substring(0, limit) + '...'
  }

  const shouldTruncate = family.description.length > 150

  return (
    <div className="border-b border-gray-200 py-6 hover:bg-gray-50">
      <div className="flex items-start gap-6">
        {/* Family Name */}
        <div className="w-40 flex-shrink-0">
          <h3 className="font-semibold text-gray-900 text-lg">
            {family.family_name}
          </h3>
        </div>

        {/* Adults */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-4 mb-4">
            {family.adults.map((adult) => (
              <div key={adult.id} className="text-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mx-auto mb-2 border-2 border-white shadow-sm">
                  {adult.image_url ? (
                    <Image
                      src={adult.image_url}
                      alt={adult.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg">
                      {adult.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="w-24">
                  <p className="text-sm font-medium text-gray-900 truncate" title={adult.name}>
                    {adult.name}
                  </p>
                  {adult.job_title && (
                    <p className="text-xs text-gray-600 truncate" title={adult.job_title}>
                      {adult.job_title}
                    </p>
                  )}
                  {adult.industry && (
                    <p className="text-xs text-gray-500 truncate" title={adult.industry}>
                      {adult.industry}
                    </p>
                  )}
                  {adult.interested_in_connections && (
                    <div className="mt-1">
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                        🤝
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="flex-shrink-0">
          <div className="flex flex-wrap gap-3">
            {family.children.map((child) => (
              <div key={child.id} className="text-center">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mx-auto mb-1 border-2 border-white shadow-sm">
                  {child.image_url ? (
                    <Image
                      src={child.image_url}
                      alt={child.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="w-20">
                  <p className="text-xs font-medium text-gray-900 truncate" title={child.name}>
                    {child.name}
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                    child.class === 'Pegasus' ? 'bg-red-100 text-red-800' :
                    child.class === 'Orion' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {child.class}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="w-80 flex-shrink-0">
          <div className="text-sm text-gray-600 leading-relaxed">
            <p>
              {isExpanded || !shouldTruncate ? family.description : truncateText(family.description)}
            </p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}