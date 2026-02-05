'use client'

import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/hooks/useTranslation'

export default function PrivacyPolicyPage() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-sbm-background">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('privacy.backToDirectory')}
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('privacy.title')}
            </h1>
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose max-w-none">
            <p className="text-gray-900 text-sm mb-6">
              <strong>{t('privacy.lastUpdated')}</strong>{' '}
              {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. {t('privacy.dataController')}
              </h2>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.dataControllerText')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. {t('privacy.dataWeCollect')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.dataWeCollectText')}
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.dataWeCollectItem1')}</li>
                <li>{t('privacy.dataWeCollectItem2')}</li>
                <li>{t('privacy.dataWeCollectItem3')}</li>
                <li>{t('privacy.dataWeCollectItem4')}</li>
                <li>{t('privacy.dataWeCollectItem5')}</li>
                <li>{t('privacy.dataWeCollectItem6')}</li>
                <li>{t('privacy.dataWeCollectItem7')}</li>
                <li>{t('privacy.dataWeCollectItem8')}</li>
                <li>{t('privacy.dataWeCollectItem9')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. {t('privacy.legalBasis')}
              </h2>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.legalBasisText')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. {t('privacy.howWeUse')}
              </h2>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.howWeUseItem1')}</li>
                <li>{t('privacy.howWeUseItem2')}</li>
                <li>{t('privacy.howWeUseItem3')}</li>
                <li>{t('privacy.howWeUseItem4')}</li>
                <li>{t('privacy.howWeUseItem5')}</li>
                <li>{t('privacy.howWeUseItem6')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. {t('privacy.dataSharing')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.dataSharingText')}
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.dataSharingItem1')}</li>
                <li>{t('privacy.dataSharingItem2')}</li>
                <li>{t('privacy.dataSharingItem3')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5a. {t('privacy.translationServices')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.translationServicesText')}
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.translationServicesItem1')}</li>
                <li>{t('privacy.translationServicesItem2')}</li>
                <li>{t('privacy.translationServicesItem3')}</li>
                <li>{t('privacy.translationServicesItem4')}</li>
                <li>{t('privacy.translationServicesItem5')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5b. {t('privacy.contactInfoSharing')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.contactInfoSharingText')}
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.contactInfoSharingItem1')}</li>
                <li>{t('privacy.contactInfoSharingItem2')}</li>
                <li>{t('privacy.contactInfoSharingItem3')}</li>
                <li>{t('privacy.contactInfoSharingItem4')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. {t('privacy.yourRights')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.yourRightsText')}
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>{t('privacy.yourRightsItem1')}</li>
                <li>{t('privacy.yourRightsItem2')}</li>
                <li>{t('privacy.yourRightsItem3')}</li>
                <li>{t('privacy.yourRightsItem4')}</li>
                <li>{t('privacy.yourRightsItem5')}</li>
                <li>{t('privacy.yourRightsItem6')}</li>
                <li>{t('privacy.yourRightsItem7')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. {t('privacy.dataRetention')}
              </h2>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.dataRetentionText')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. {t('privacy.dataSecurity')}
              </h2>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.dataSecurityText')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. {t('privacy.childrenData')}
              </h2>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.childrenDataText')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. {t('privacy.contact')}
              </h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                {t('privacy.contactText1')}
              </p>
              <p className="text-gray-900 leading-relaxed">
                {t('privacy.contactText2')}
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-blue-900 font-medium">
                {t('privacy.updateInfo')}
                <Link
                  href="/admin"
                  className="underline hover:text-blue-600 ml-1"
                >
                  {t('privacy.useAdminPanel')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
