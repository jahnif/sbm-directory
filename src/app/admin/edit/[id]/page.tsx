'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ImageUpload from '@/components/ImageUpload'
import CountrySelector from '@/components/CountrySelector'
import LanguageSelector from '@/components/LanguageSelector'
import { supabase } from '@/lib/supabase'
import { Family, FamilyFormData, ClassType, LanguageSpoken } from '@/types'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/hooks/useTranslation'
import { detectLanguage, translateFamilyData } from '@/lib/translation'

export const dynamic = 'force-dynamic'

export default function EditFamilyPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const familyId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [family, setFamily] = useState<Family | null>(null)

  const [formData, setFormData] = useState<FamilyFormData>({
    family_name: '',
    description: '',
    original_language: 'en',
    adults: [],
    children: [],
  })

  useEffect(() => {
    if (familyId) {
      loadFamily()
    }
  }, [familyId]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadFamily = async () => {
    try {
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single()

      if (familyError) throw familyError

      const { data: adultsData, error: adultsError } = await supabase
        .from('adults')
        .select('*')
        .eq('family_id', familyId)

      if (adultsError) throw adultsError

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('family_id', familyId)

      if (childrenError) throw childrenError

      const loadedFamily: Family = {
        ...familyData,
        adults: adultsData || [],
        children: childrenData || [],
      }

      setFamily(loadedFamily)
      setFormData({
        family_name: loadedFamily.family_name,
        description: loadedFamily.description,
        original_language: loadedFamily.original_language || 'en',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        adults: loadedFamily.adults.map(
          ({ id, family_id, created_at, ...adult }) => ({
            ...adult,
            email: adult.email || null,
            whatsapp_number: adult.whatsapp_number || null,
            show_contact_in_networking:
              adult.show_contact_in_networking || false,
          }),
        ),
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        children: loadedFamily.children.map(
          ({ id, family_id, created_at, ...child }) => child,
        ),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load family')
    } finally {
      setLoading(false)
    }
  }

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
          country: null,
          city: null,
          languages_spoken: null,
          email: null,
          whatsapp_number: null,
          show_contact_in_networking: false,
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
    value: string | boolean | null | LanguageSpoken[],
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
            adults: formData.adults
              .filter((adult) => adult.name.trim())
              .map((adult) => ({
                connection_types: adult.connection_types || undefined,
              })),
          },
          originalLanguage,
        )
      }

      // Prepare family update with translations
      const familyUpdate = {
        family_name: formData.family_name,
        description: formData.description,
        original_language: originalLanguage,
        updated_at: new Date().toISOString(),
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
        familyUpdate.family_name = translatedData.family_name_translated
        familyUpdate.description = translatedData.description_translated
        familyUpdate.family_name_es = formData.family_name
        familyUpdate.description_es = formData.description
      }

      // Update family
      const { error: familyError } = await supabase
        .from('families')
        .update(familyUpdate)
        .eq('id', familyId)

      if (familyError) throw familyError

      // Delete existing adults and children
      await supabase.from('adults').delete().eq('family_id', familyId)
      await supabase.from('children').delete().eq('family_id', familyId)

      // Insert new adults with translations for connection_types only
      const adultsToInsert = formData.adults
        .filter((adult) => adult.name.trim())
        .map((adult, index) => {
          const adultData = {
            family_id: familyId,
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

          return adultData
        })

      if (adultsToInsert.length > 0) {
        const { error: adultsError } = await supabase
          .from('adults')
          .insert(adultsToInsert)

        if (adultsError) throw adultsError
      }

      // Insert new children
      const childrenToInsert = formData.children
        .filter((child) => child.name.trim())
        .map((child) => ({
          family_id: familyId,
          ...child,
        }))

      if (childrenToInsert.length > 0) {
        const { error: childrenError } = await supabase
          .from('children')
          .insert(childrenToInsert)

        if (childrenError) throw childrenError
      }

      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-800">Loading family...</p>
        </div>
      </div>
    )
  }

  if (!family) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Family not found</p>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sbm-background text-center">
      <PageHeader
        title={t('navigation.editFamily')}
        subtitle={t('forms.editFamilySubtitle')}
        backLink={{
          href: '/admin',
          label: t('navigation.backToAdmin'),
        }}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Family Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('forms.familyInformation')}
              </h2>

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
                  {t('forms.description')} *
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
                  placeholder={t('forms.descriptionPlaceholder')}
                />
              </div>
            </div>

            {/* Adults */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  {t('family.adults')}
                </h2>
              </div>

              {formData.adults.map((adult, index) => (
                <div key={index} className="rounded-lg p-4 bg-gray-50">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Personal Interests & Hobbies</label>
                      <textarea
                        value={adult.hobbies || ''}
                        onChange={(e) => updateAdult(index, 'hobbies', e.target.value || null)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder="e.g., Reading, hiking, photography, cooking, music..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.country')}
                      </label>
                      <CountrySelector
                        value={adult.country}
                        onChange={(country) =>
                          updateAdult(index, 'country', country)
                        }
                        placeholder={t('forms.selectCountry')}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('forms.city')}
                      </label>
                      <input
                        type="text"
                        value={adult.city || ''}
                        onChange={(e) =>
                          updateAdult(index, 'city', e.target.value || null)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        placeholder={t('forms.cityPlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Languages Spoken Section */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
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
                        {t('forms.interestedInConnections')}
                      </label>
                    </div>

                    {adult.interested_in_connections && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            {t('forms.connectionTypes')}
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              {t('forms.email')}
                            </label>
                            <input
                              type="email"
                              value={adult.email || ''}
                              onChange={(e) =>
                                updateAdult(
                                  index,
                                  'email',
                                  e.target.value || null,
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              placeholder={t('forms.emailPlaceholder')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                              {t('forms.whatsapp')}
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

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`share-contact-${index}`}
                            checked={adult.show_contact_in_networking || false}
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
                            htmlFor={`share-contact-${index}`}
                            className="ml-2 text-sm text-gray-700"
                          >
                            {t('forms.shareContactInfo')}
                          </label>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={addAdult}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {t('forms.addAdult')}
              </button>
            </div>

            {/* Children */}
            <div className="space-y-4">
              <div className="flex justify-start items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  {t('family.children')}
                </h2>
              </div>

              {formData.children.map((child, index) => (
                <div key={index} className="rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-medium text-gray-700">
                      {t('forms.child')} {index + 1}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        <option value="Pegasus">Pegasus</option>
                        <option value="Lynx">Lynx</option>
                        <option value="Orion">Orion</option>
                        <option value="Andromeda">Andromeda</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
            </div>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={addChild}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                {t('forms.addChild')}
              </button>
            </div>

            {error && (
              <div className="text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <hr />
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => router.push('/admin')}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                {t('forms.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('forms.saving') : t('forms.saveChanges')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
