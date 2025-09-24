'use client'

import { useState, useEffect } from 'react'

export default function GDPRConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user has already given consent
    const consent = localStorage.getItem('gdpr-consent')
    if (!consent) {
      setShowBanner(true)
    }
  }, [])

  const acceptAll = () => {
    localStorage.setItem('gdpr-consent', 'accepted')
    localStorage.setItem('gdpr-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  const rejectAll = () => {
    localStorage.setItem('gdpr-consent', 'rejected')
    localStorage.setItem('gdpr-consent-date', new Date().toISOString())
    setShowBanner(false)
  }

  if (!mounted || !showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Privacy & Data Processing Notice
            </h3>
            <p className="text-sm text-gray-900 leading-relaxed">
              We process personal data including names, photos, and professional
              information to operate this family directory. By using this
              service, you consent to data processing according to our privacy
              policy. You have the right to access, correct, or delete your data
              at any time.
            </p>
            <div className="mt-2">
              <a
                href="/privacy-policy"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Read our full Privacy Policy
              </a>
            </div>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={rejectAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm"
            >
              Reject
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
