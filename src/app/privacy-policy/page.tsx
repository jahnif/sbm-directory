'use client'

import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Directory
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose max-w-none">
            <p className="text-gray-900 text-sm mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Data Controller</h2>
              <p className="text-gray-900 leading-relaxed">
                This family directory is operated by the SBM Montessori School community. 
                For data protection inquiries, please contact the school administration.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data We Collect</h2>
              <p className="text-gray-900 leading-relaxed mb-4">We collect and process the following personal data:</p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>Family and individual names</li>
                <li>Profile photographs (optional)</li>
                <li>Professional information (job titles, industries)</li>
                <li>Professional networking preferences and interests</li>
                <li>Email addresses and WhatsApp numbers (optional, for networking purposes)</li>
                <li>Contact sharing preferences and consent settings</li>
                <li>Children&apos;s names and class assignments</li>
                <li>Family descriptions and contact preferences</li>
                <li>Language preferences and translated content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Legal Basis for Processing</h2>
              <p className="text-gray-900 leading-relaxed">
                We process your data based on your explicit consent (Article 6(1)(a) GDPR) and for the legitimate 
                interests of facilitating community connections within our school (Article 6(1)(f) GDPR).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. How We Use Your Data</h2>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>Display family information in the community directory</li>
                <li>Enable families to connect with each other</li>
                <li>Facilitate professional networking within the community</li>
                <li>Provide contact information sharing for networking (only when explicitly consented)</li>
                <li>Translate content between English and Spanish for accessibility</li>
                <li>Organize families by children&apos;s class assignments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                Your data is shared in the following ways:
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>Family directory information is visible to all members of the SBM Montessori School community</li>
                <li>Contact information (email/WhatsApp) is only shared when you explicitly opt-in and other families choose to view it</li>
                <li>We do not sell, rent, or share your data with third parties outside our community</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5a. Translation Services</h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                We use DeepL&apos;s translation service to automatically translate family information between English and Spanish:
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>Your submitted text is sent to DeepL&apos;s secure API for translation</li>
                <li>DeepL processes the data according to their privacy policy and GDPR compliance</li>
                <li>Both original and translated versions are stored in our database</li>
                <li>Translation helps make our directory accessible to Spanish and English-speaking families</li>
                <li>You can review DeepL&apos;s privacy policy at: https://www.deepl.com/privacy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5b. Contact Information Sharing</h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                Contact information sharing operates on a double opt-in system:
              </p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li>You must opt-in to allow your contact information to be visible for networking</li>
                <li>Other families must actively choose to view contact information by clicking &quot;Show Contact Information&quot;</li>
                <li>This ensures contact sharing only happens when both parties explicitly consent</li>
                <li>You can change your contact sharing preferences at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-900 leading-relaxed mb-4">Under GDPR, you have the following rights:</p>
              <ul className="list-disc pl-6 text-gray-900 space-y-2">
                <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
                <li><strong>Right to Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
                <li><strong>Right to Restrict Processing:</strong> Limit how we use your data</li>
                <li><strong>Right to Data Portability:</strong> Receive your data in a structured format</li>
                <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
              <p className="text-gray-900 leading-relaxed">
                We retain your data while your family is part of the SBM Montessori School community. 
                Data will be deleted within 30 days of your request or when you are no longer part of the community.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Security</h2>
              <p className="text-gray-900 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal data, 
                including encryption, secure hosting, and access controls.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children&apos;s Data</h2>
              <p className="text-gray-900 leading-relaxed">
                We only process children&apos;s data (names, photos, class information) with explicit parental consent. 
                Parents can request deletion of their children&apos;s data at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact & Complaints</h2>
              <p className="text-gray-900 leading-relaxed mb-4">
                To exercise your rights or for any privacy concerns, please contact the school administration.
              </p>
              <p className="text-gray-900 leading-relaxed">
                You have the right to lodge a complaint with your local data protection authority if you believe 
                your data rights have been violated.
              </p>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-blue-900 font-medium">
                Need to update or delete your information? 
                <Link href="/admin" className="underline hover:text-blue-600 ml-1">
                  Use the admin panel
                </Link> or contact school administration.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}