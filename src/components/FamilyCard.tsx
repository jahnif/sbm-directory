import Image from 'next/image'
import { Family } from '@/types'

interface FamilyCardProps {
  family: Family
}

export default function FamilyCard({ family }: FamilyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {family.family_name}
      </h3>
      
      {/* Adults */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Adults</h4>
        <div className="grid grid-cols-2 gap-4">
          {family.adults.map((adult) => (
            <div key={adult.id} className="text-center">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 mx-auto mb-2">
                {adult.image_url ? (
                  <Image
                    src={adult.image_url}
                    alt={adult.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                    {adult.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{adult.name}</p>
              {adult.job_title && (
                <p className="text-xs text-gray-600">{adult.job_title}</p>
              )}
              {adult.industry && (
                <p className="text-xs text-gray-500">{adult.industry}</p>
              )}
              {adult.interested_in_connections && (
                <div className="mt-1">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    🤝 Networking
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Children */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Children</h4>
        <div className="grid grid-cols-2 gap-4">
          {family.children.map((child) => (
            <div key={child.id} className="text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mx-auto mb-2">
                {child.image_url ? (
                  <Image
                    src={child.image_url}
                    alt={child.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs">
                    {child.name.charAt(0)}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{child.name}</p>
              <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                child.class === 'Pegasus' ? 'bg-red-100 text-red-800' :
                child.class === 'Orion' ? 'bg-blue-100 text-blue-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {child.class}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <p className="text-sm text-gray-600 leading-relaxed">
          {family.description}
        </p>
      </div>
    </div>
  )
}