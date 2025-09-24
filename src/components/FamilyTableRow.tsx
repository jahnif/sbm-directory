'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Family } from '@/types';
import { getCountryDisplay, getCountryName } from '@/components/CountrySelector';
import { getLocalizedFamily, hasNetworkingContact, getNetworkingContact } from '@/lib/localization';
import { useTranslation } from '@/hooks/useTranslation';

interface FamilyTableRowProps {
  family: Family;
  showNetworkingOnly?: boolean;
}

export default function FamilyTableRow({ family, showNetworkingOnly = false }: FamilyTableRowProps) {
  const { t, locale } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);

  // Get localized family data
  const localizedFamily = getLocalizedFamily(family, locale);

  const truncateText = (text: string, limit: number = 250) => {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  const shouldTruncate = localizedFamily.description.length > 250;

  // Filter adults based on networking filter
  const displayedAdults = showNetworkingOnly ? localizedFamily.adults.filter((adult) => adult.interested_in_connections) : localizedFamily.adults;

  // hasContactInfo removed - no longer needed as contact functionality is integrated with networking tags

  return (
    <div className="border-b border-gray-200 py-6 hover:bg-gray-50 transition-all duration-300 ease-in-out animate-fadeIn">
      <div className="grid lg:grid-cols-[3fr_4fr_4fr_3fr] gap-4 px-6 py-2">
        {/* Family Name */}
        <div className="flex flex-col">
          <div className="lg:hidden text-xs text-gray-500 text-center mb-1">Family Name</div>
          <h3 className="font-semibold text-gray-900 lg:text-lg text-2xl text-center lg:text-left">{localizedFamily.family_name} Family</h3>

          <div className="flex mt-2 mx-auto lg:mx-0 mb-6">
            {displayedAdults.map((adult) => {
              return adult.image_url ? (
                <Image
                  key={adult.id}
                  src={adult.image_url}
                  alt={adult.name}
                  width={20}
                  height={20}
                  className="object-cover w-10 h-10 rounded-full mr-[-1em]"
                />
              ) : (
                <div
                  key={adult.id}
                  className="bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg w-11 h-11 rounded-full mr-[-1em]"
                >
                  {adult.name.charAt(0).toUpperCase()}
                </div>
              );
            })}

            {localizedFamily.children.map((child) => {
              return child.image_url ? (
                <Image
                  key={child.id}
                  src={child.image_url}
                  alt={child.name}
                  width={20}
                  height={20}
                  className="object-cover w-10 h-10 rounded-full mr-[-1em]"
                />
              ) : (
                <div
                  key={child.id}
                  className="bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium text-lg w-11 h-11 rounded-full mr-[-1em]"
                >
                  {child.name.charAt(0).toUpperCase()}
                </div>
              );
            })}
          </div>
        </div>

        {/* Adults */}
        <div className="flex flex-col items-center justify-center">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">{t('family.adults')}</div>
          <div className="flex lg:flex-col flex-wrap gap-4 mb-4 justify-center">
            {displayedAdults.map((adult) => (
              <div
                key={adult.id}
                className="flex items-start shrink-1 grow-1 basis-px"
              >
                <div className="w-22 h-22 shrink-0 rounded-full overflow-hidden bg-gray-200 mb-2 shadow-sm mr-3">
                  {adult.image_url ? (
                    <Image
                      src={adult.image_url}
                      alt={adult.name}
                      width={90}
                      height={90}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-lg">{adult.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="flex flex-col grow-1 justify-center">
                  <p
                    className="text-md text-gray-900 font-bold"
                    title={adult.name}
                  >
                    {adult.name}
                  </p>

                  {(adult.country || adult.city) && (
                    <p className="text-xs text-gray-700">
                      {adult.country && getCountryDisplay(adult.country)} {adult.country && getCountryName(adult.country)}, {adult.city}
                    </p>
                  )}
                  {adult.job_title && (
                    <p
                      className="text-xs text-gray-800 mt-3"
                      title={adult.job_title}
                    >
                      <span className="font-bold">Profession:</span> {adult.job_title}, {adult.industry}
                    </p>
                  )}
                  {adult.interested_in_connections && (
                    <div className="mt-1 space-y-1">
                      {adult.connection_types && (
                        <p className="text-xs text-gray-800 leading-relaxed">
                          <span className="font-bold">Professional interests:</span> {adult.connection_types}
                        </p>
                      )}
                      <div className="flex items-center gap-1">
                        {hasNetworkingContact(adult) ? (
                          <button
                            onClick={() => setShowContactInfo(!showContactInfo)}
                            className="inline-flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium transition-colors duration-200 cursor-pointer"
                          >
                            🤝 {showContactInfo ? t('family.hideContactInfo') : t('family.networkingShowContact')}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">🤝 {t('family.networking')}</span>
                        )}
                      </div>
                      {/* Contact Information Display - inline with networking section */}
                      {showContactInfo &&
                        hasNetworkingContact(adult) &&
                        (() => {
                          const contactInfo = getNetworkingContact(adult);
                          return (
                            contactInfo && (
                              <div className="mt-2 bg-blue-50 p-2 rounded-lg">
                                <div className="space-y-1">
                                  {contactInfo.email && (
                                    <div className="flex items-center gap-2 text-xs text-gray-700">
                                      <span>✉️</span>
                                      <a
                                        href={`mailto:${contactInfo.email}`}
                                        className="hover:text-blue-600 underline"
                                      >
                                        Email: {contactInfo.email}
                                      </a>
                                    </div>
                                  )}
                                  {contactInfo.whatsapp_number && (
                                    <div className="flex items-center gap-2 text-xs text-gray-700">
                                      <span>📱</span>
                                      <a
                                        href={`https://wa.me/${contactInfo.whatsapp_number.replace(/\D/g, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-green-600 underline"
                                      >
                                        WhatsApp: {contactInfo.whatsapp_number}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          );
                        })()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Children */}
        <div className="flex flex-wrap gap-3 flex-col items-center justify-center">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">{t('family.children')}</div>

          <div className="flex lg:flex-col flex-wrap gap-4 mb-4 justify-center">
            {localizedFamily.children.map((child) => (
              <div
                key={child.id}
                className="text-center"
              >
                <div className="w-22 h-22 rounded-full overflow-hidden bg-gray-200 mx-auto mb-1 shadow-sm">
                  {child.image_url ? (
                    <Image
                      src={child.image_url}
                      alt={child.name}
                      width={90}
                      height={90}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-medium">{child.name.charAt(0).toUpperCase()}</div>
                  )}
                </div>
                <div className="w-24">
                  <p
                    className="text-sm font-bold text-gray-900"
                    title={child.name}
                  >
                    {child.name}
                  </p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${child.class === 'Pegasus' ? 'bg-red-100 text-red-800' : child.class === 'Orion' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{child.class}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="">
          <div className="lg:hidden text-sm text-gray-500 text-center mb-4">{t('family.about')}</div>

          <div className="text-sm text-gray-800 leading-relaxed text-center lg:text-left">
            <p>{isExpanded || !shouldTruncate ? localizedFamily.description : truncateText(localizedFamily.description)}</p>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-1 font-medium"
              >
                {isExpanded ? t('family.showLess') : t('family.readMore')}
              </button>
            )}
          </div>

          {/* Contact Information Toggle removed - now integrated with networking tags above */}
        </div>
      </div>
    </div>
  );
}

// TODO - Add "languages spoken" to parents
// TODO - Add multiple countries of origin for parents
