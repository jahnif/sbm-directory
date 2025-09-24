'use client'

import Link from 'next/link'
import LanguageToggle from '@/components/LanguageToggle'
import { useTranslation } from '@/hooks/useTranslation'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backLink?: {
    href: string
    label: string
  }
  showLanguageToggle?: boolean
}

export default function PageHeader({
  title,
  subtitle,
  backLink,
  showLanguageToggle = true,
}: PageHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {backLink && (
              <Link
                href={backLink.href}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {backLink.label}
              </Link>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                {title}
              </h1>
              {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
            </div>
          </div>

          {showLanguageToggle && (
            <div className="ml-4">
              <LanguageToggle />
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
