import Image from 'next/image'
import { useState } from 'react'
import { Family } from '@/types'
import { getCountryDisplay } from '@/components/CountrySelector'
import { getLocalizedFamily, hasNetworkingContact, getNetworkingContact } from '@/lib/localization'
import { useTranslation } from '@/hooks/useTranslation'

interface FamilyCardProps {
  family: Family
  showNetworkingOnly?: boolean
}

export default function FamilyCard({ family, showNetworkingOnly = false }: FamilyCardProps) {
  const { t, locale } = useTranslation();
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Get localized family data
  const localizedFamily = getLocalizedFamily(family, locale);

  // Filter adults based on networking filter
  const displayedAdults = showNetworkingOnly
    ? localizedFamily.adults.filter(adult => adult.interested_in_connections)
    : localizedFamily.adults;

  // hasContactInfo removed - no longer needed as contact functionality is integrated with networking tags
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all duration-300 ease-in-out animate-fadeIn hover:shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">
        {localizedFamily.family_name}
      </h3>

      {/* Adults */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('family.adults')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {displayedAdults.map((adult) => (
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
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                    {adult.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{adult.name}</p>
              {adult.job_title && (
                <p className="text-xs text-gray-800">{adult.job_title}</p>
              )}
              {adult.industry && (
                <p className="text-xs text-gray-700">{adult.industry}</p>
              )}
              {(adult.country || adult.city) && (
                <p className="text-xs text-gray-700">
                  {adult.country && getCountryDisplay(adult.country)} {adult.city}
                </p>
              )}
              {adult.interested_in_connections && (
                <div className="mt-1 space-y-1">
                  {hasNetworkingContact(adult) ? (
                    <button
                      onClick={() => setShowContactInfo(!showContactInfo)}
                      className="inline-flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-200 cursor-pointer"
                    >
                      🤝 {showContactInfo ? t('family.hideContactInfo') : t('family.networkingShowContact')}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                      🤝 {t('family.networking')}
                    </span>
                  )}
                  {adult.connection_types && (
                    <p className="text-xs text-gray-800 leading-relaxed">
                      {adult.connection_types}
                    </p>
                  )}
                  {/* Contact information - only shown when toggled and user has permitted */}
                  {showContactInfo && hasNetworkingContact(adult) && (() => {
                    const contactInfo = getNetworkingContact(adult);
                    return contactInfo && (
                      <div className="mt-2 bg-blue-50 p-2 rounded-lg">
                        <div className="space-y-1">
                          {contactInfo.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <span>📧</span>
                              <a href={`mailto:${contactInfo.email}`} className="hover:text-blue-600 underline">
                                {contactInfo.email}
                              </a>
                            </div>
                          )}
                          {contactInfo.whatsapp_number && (
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <span>📱</span>
                              <a
                                href={`https://wa.me/${contactInfo.whatsapp_number.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-green-600 underline"
                              >
                                {contactInfo.whatsapp_number}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Children */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">{t('family.children')}</h4>
        <div className="grid grid-cols-2 gap-4">
          {localizedFamily.children.map((child) => (
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
                  <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">
                    {child.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900">{child.name}</p>
              <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
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
      <div className="mb-4">
        <p className="text-sm text-gray-800 leading-relaxed">
          {localizedFamily.description}
        </p>
      </div>

      {/* Contact Information Toggle removed - now integrated with networking tags above */}
    </div>
  )
}