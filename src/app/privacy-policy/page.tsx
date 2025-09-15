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
                <li>Children's names and class assignments</li>
                <li>Family descriptions and contact preferences</li>
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
                <li>Organize families by children's class assignments</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="text-gray-900 leading-relaxed">
                Your data is only shared with other families within the SBM Montessori School community who have 
                access to this directory. We do not sell, rent, or share your data with third parties outside our community.
              </p>
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
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Data</h2>
              <p className="text-gray-900 leading-relaxed">
                We only process children's data (names, photos, class information) with explicit parental consent. 
                Parents can request deletion of their children's data at any time.
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