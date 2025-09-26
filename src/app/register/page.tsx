'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import LocationSelector from '@/components/LocationSelector'
import LanguageSelector from '@/components/LanguageSelector'
import { supabase } from '@/lib/supabase'
import { FamilyFormData, ClassType, LanguageSpoken, LocationInfo } from '@/types'
import { translateFamilyData, detectLanguage } from '@/lib/translation'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/hooks/useTranslation'

export const dynamic = 'force-dynamic'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<FamilyFormData>({
    family_name: '',
    description: '',
    original_language: 'en',
    adults: [
      {
        name: '',
        image_url: null,
        hobbies: null,
        industry: null,
        job_title: null,
        interested_in_connections: false,
        connection_types: null,
        email: null,
        whatsapp_number: null,
        show_contact_in_networking: false,
        locations: [{ country: '', city: '' }],
        languages_spoken: null,
      },
    ],
    children: [
      {
        name: '',
        image_url: null,
        class: 'Pegasus' as ClassType,
      },
    ],
  })

  const addAdult = () => {
    setFormData((prev) => ({
      ...prev,
      adults: [
        ...prev.adults,
        {
          name: '',
          image_url: null,
          hobbies: null,
          industry: null,
          job_title: null,
          interested_in_connections: false,
          connection_types: null,
          email: null,
          whatsapp_number: null,
          show_contact_in_networking: false,
          locations: [{ country: '', city: '' }],
          languages_spoken: null,
        },
      ],
    }))
  }

  const removeAdult = (index: number) => {
    if (formData.adults.length > 1) {
      setFormData((prev) => ({
        ...prev,
        adults: prev.adults.filter((_, i) => i !== index),
      }))
    }
  }

  const addChild = () => {
    setFormData((prev) => ({
      ...prev,
      children: [
        ...prev.children,
        {
          name: '',
          image_url: null,
          class: 'Pegasus' as ClassType,
        },
      ],
    }))
  }

  const removeChild = (index: number) => {
    if (formData.children.length > 1) {
      setFormData((prev) => ({
        ...prev,
        children: prev.children.filter((_, i) => i !== index),
      }))
    }
  }

  const updateAdult = (
    index: number,
    field: string,
    value: string | boolean | null | LanguageSpoken[] | LocationInfo[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      adults: prev.adults.map((adult, i) =>
        i === index ? { ...adult, [field]: value } : adult,
      ),
    }))
  }

  const updateChild = (
    index: number,
    field: string,
    value: string | ClassType | null,
  ) => {
    setFormData((prev) => ({
      ...prev,
      children: prev.children.map((child, i) =>
        i === index ? { ...child, [field]: value } : child,
      ),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Detect language and translate content
      const detectedLanguage = detectLanguage(
        formData.family_name + ' ' + formData.description,
      )
      const originalLanguage = detectedLanguage

      // Translate family data if we have content to translate
      let translatedData = null
      if (formData.family_name.trim() || formData.description.trim()) {
        translatedData = await translateFamilyData(
          {
            family_name: formData.family_name,
            description: formData.description,
            adults: formData.adults.filter((adult) => adult.name.trim()).map((adult) => ({
              connection_types: adult.connection_types || undefined,
              hobbies: adult.hobbies || undefined,
              industry: adult.industry || undefined,
              job_title: adult.job_title || undefined,
            })),
          },
          originalLanguage,
        )
      }

      // Insert family with translations
      const familyInsert = {
        family_name: formData.family_name,
        description: formData.description,
        original_language: originalLanguage,
        ...(translatedData && {
          family_name_es:
            originalLanguage === 'en'
              ? translatedData.family_name_translated
              : formData.family_name,
          description_es:
            originalLanguage === 'en'
              ? translatedData.description_translated
              : formData.description,
        }),
      }

      // If original language is Spanish, store English translations in the base fields
      if (originalLanguage === 'es' && translatedData) {
        familyInsert.family_name = translatedData.family_name_translated
        familyInsert.description = translatedData.description_translated
        familyInsert.family_name_es = formData.family_name
        familyInsert.description_es = formData.description
      }

      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert([familyInsert])
        .select()
        .single()

      if (familyError) throw familyError

      // Insert adults with translations for connection_types only
      const adultsToInsert = formData.adults
        .filter((adult) => adult.name.trim())
        .map((adult, index) => {
          const adultData = {
            family_id: family.id,
            ...adult,
          }

          // Add translated connection_types if available
          if (
            translatedData &&
            translatedData.adults_connection_types_translated[index]
              ?.connection_types_translated
          ) {
            if (originalLanguage === 'en') {
              adultData.connection_types_es =
                translatedData.adults_connection_types_translated[
                  index
                ].connection_types_translated
            } else {
              adultData.connection_types =
                translatedData.adults_connection_types_translated[
                  index
                ].connection_types_translated
              adultData.connection_types_es = adult.connection_types
            }
          }

          // Add translated hobbies if available
          if (translatedData && translatedData.adults_connection_types_translated[index]?.hobbies_translated) {
            if (originalLanguage === 'en') {
              adultData.hobbies_es = translatedData.adults_connection_types_translated[index].hobbies_translated;
            } else {
              adultData.hobbies = translatedData.adults_connection_types_translated[index].hobbies_translated;
              adultData.hobbies_es = adult.hobbies;
            }
          }

          // Add translated industry if available
          if (translatedData && translatedData.adults_connection_types_translated[index]?.industry_translated) {
            if (originalLanguage === 'en') {
              adultData.industry_es = translatedData.adults_connection_types_translated[index].industry_translated;
            } else {
              adultData.industry = translatedData.adults_connection_types_translated[index].industry_translated;
              adultData.industry_es = adult.industry;
            }
          }

          // Add translated job_title if available
          if (translatedData && translatedData.adults_connection_types_translated[index]?.job_title_translated) {
            if (originalLanguage === 'en') {
              adultData.job_title_es = translatedData.adults_connection_types_translated[index].job_title_translated;
            } else {
              adultData.job_title = translatedData.adults_connection_types_translated[index].job_title_translated;
              adultData.job_title_es = adult.job_title;
            }
          }

          return adultData
        })

      if (adultsToInsert.length > 0) {
        const { error: adultsError } = await supabase
          .from('adults')
          .insert(adultsToInsert)

        if (adultsError) throw adultsError
      }

      // Insert children without translations (names stay as-is)
      const childrenToInsert = formData.children
        .filter((child) => child.name.trim())
        .map((child) => ({
          family_id: family.id,
          ...child,
        }))

      if (childrenToInsert.length > 0) {
        const { error: childrenError } = await supabase
          .from('children')
          .insert(childrenToInsert)

        if (childrenError) throw childrenError
      }

      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-sbm-background">
      <PageHeader
        title={t('register.title')}
        backLink={{
          href: '/',
          label: t('privacy.backToDirectory'),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Family Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('forms.familyInfo')}
              </h2>
              <div className="italic text-gray-400 text-sm">
                {t('forms.requiredIndicator')}
              </div>
              <div>
                <label
                  htmlFor="family_name"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  {t('forms.familyName')} *
                </label>
                <input
                  type="text"
                  id="family_name"
                  required
                  value={formData.family_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      family_name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-900 mb-1"
                >
                  {t('forms.familyDescription')} *
                </label>
                <textarea
                  id="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder={t('forms.familyDescriptionPlaceholder')}
                />
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('family.adults')}
              </h2>

              {formData.adults.map((adult, index) => (
                <div
                  key={index}
                  className="rounded-lg p-8 bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-900">
                      {t('forms.adult')} {index + 1}
                    </h3>
                    {formData.adults.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdult(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        {t('forms.remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={adult.name}
                        onChange={(e) =>
                          updateAdult(index, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.photo')}
                      </label>
                      <ImageUpload
                        onImageUploaded={(url) =>
                          updateAdult(index, 'image_url', url)
                        }
                        currentImage={adult.image_url}
                        placeholder={t('forms.addPhoto')}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">{t('forms.hobbies')}</label>
                      <textarea
                        value={adult.hobbies || ''}
                        onChange={(e) => updateAdult(index, 'hobbies', e.target.value || null)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder={t('forms.hobbiesPlaceholder')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.industry')}
                      </label>
                      <input
                        type="text"
                        value={adult.industry || ''}
                        onChange={(e) =>
                          updateAdult(index, 'industry', e.target.value || null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.jobTitle')}
                      </label>
                      <input
                        type="text"
                        value={adult.job_title || ''}
                        onChange={(e) =>
                          updateAdult(
                            index,
                            'job_title',
                            e.target.value || null,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.countriesOrigin')}
                      </label>
                      <LocationSelector
                        locations={adult.locations || []}
                        onChange={(locations) =>
                          updateAdult(index, 'locations', locations.length > 0 ? locations : null)
                        }
                        className="w-full"
                      />
                    </div>

                  </div>

                  {/* Languages Spoken Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      {t('forms.languagesSpoken')}
                    </label>
                    <LanguageSelector
                      languages={adult.languages_spoken || []}
                      onChange={(languages) =>
                        updateAdult(index, 'languages_spoken', languages.length > 0 ? languages : null)
                      }
                      className="w-full"
                    />
                  </div>

                  {/* Contact Information Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      {t('forms.contactInfo')}
                    </h4>
                    <p className="text-xs text-gray-600 mb-4">
                      {t('forms.contactInfoDescription')}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {t('forms.email')}
                        </label>
                        <input
                          type="email"
                          value={adult.email || ''}
                          onChange={(e) =>
                            updateAdult(index, 'email', e.target.value || null)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder={t('forms.emailPlaceholder')}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {t('forms.whatsappNumber')}
                        </label>
                        <input
                          type="tel"
                          value={adult.whatsapp_number || ''}
                          onChange={(e) =>
                            updateAdult(
                              index,
                              'whatsapp_number',
                              e.target.value || null,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder={t('forms.whatsappPlaceholder')}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`show-contact-${index}`}
                          checked={adult.show_contact_in_networking}
                          onChange={(e) =>
                            updateAdult(
                              index,
                              'show_contact_in_networking',
                              e.target.checked,
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`show-contact-${index}`}
                          className="ml-2 text-sm text-gray-700"
                        >
                          {t('forms.showContactInNetworking')}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`connections-${index}`}
                        checked={adult.interested_in_connections}
                        onChange={(e) =>
                          updateAdult(
                            index,
                            'interested_in_connections',
                            e.target.checked,
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`connections-${index}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {t('forms.interestedConnectionsLabel')}
                      </label>
                    </div>

                    {adult.interested_in_connections && (
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                          {t('forms.connectionTypesLabel')}
                        </label>
                        <textarea
                          value={adult.connection_types || ''}
                          onChange={(e) =>
                            updateAdult(
                              index,
                              'connection_types',
                              e.target.value || null,
                            )
                          }
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          placeholder={t('forms.connectionTypesPlaceholder')}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-start items-center">
                <button
                  type="button"
                  onClick={addAdult}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {t('forms.addAnotherAdult')}
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">{t('children.title')}</h2>

              {formData.children.map((child, index) => (
                <div
                  key={index}
                  className="rounded-lg p-8 bg-gray-50/50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-700">
                      {t('forms.childNumber', { number: (index + 1).toString() })}
                    </h3>
                    {formData.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChild(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        {t('forms.remove')}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.name')} *
                      </label>
                      <input
                        type="text"
                        required
                        value={child.name}
                        onChange={(e) =>
                          updateChild(index, 'name', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.class')} *
                      </label>
                      <select
                        required
                        value={child.class}
                        onChange={(e) =>
                          updateChild(
                            index,
                            'class',
                            e.target.value as ClassType,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        <option value="Pegasus">{t('classes.Pegasus')}</option>
                        <option value="Lynx">{t('classes.Lynx')}</option>
                        <option value="Orion">{t('classes.Orion')}</option>
                        <option value="Andromeda">
                          {t('classes.Andromeda')}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        {t('forms.photo')}
                      </label>
                      <ImageUpload
                        onImageUploaded={(url) =>
                          updateChild(index, 'image_url', url)
                        }
                        currentImage={child.image_url}
                        placeholder={t('forms.addPhoto')}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <div className="flex justify-start items-center">
                <button
                  type="button"
                  onClick={addChild}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {t('forms.addAnotherChild')}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Privacy and Data Usage Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                {t('register.privacyNoticeTitle')}
              </h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>{t('register.translationServices')}</p>
                <p>{t('register.informationDisplay')}</p>
                <p>{t('register.contactInformation')}</p>
                <p>
                  {t('register.privacyPolicyLink')}{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {t('privacy.title')}
                  </a>
                  .
                </p>
              </div>
            </div>

            <hr className="border-gray-100 text-gray-100 m-10" />

            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('register.submitting') : t('register.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
