'use client'

import { LanguageSpoken } from '@/types'
import { useTranslation } from '@/hooks/useTranslation'

interface Language {
  code: string
  name: string
  flag: string
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ir', name: 'Farsi', flag: '🇮🇷'},
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', flag: '🇵🇱' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷' },
  { code: 'he', name: 'Hebrew', flag: '🇮🇱' },
  { code: 'cs', name: 'Czech', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
  { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
  { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', flag: '🇸🇮' },
  { code: 'et', name: 'Estonian', flag: '🇪🇪' },
  { code: 'lv', name: 'Latvian', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', flag: '🇱🇹' },
]

const PROFICIENCY_LEVELS: { value: LanguageSpoken['proficiency']; label: string; dots: string }[] = [
  { value: 'beginner', label: 'Beginner', dots: '●○○' },
  { value: 'intermediate', label: 'Intermediate', dots: '●●○' },
  { value: 'fluent', label: 'Fluent', dots: '●●●' },
]

interface LanguageSelectorProps {
  languages: LanguageSpoken[]
  onChange: (languages: LanguageSpoken[]) => void
  className?: string
}

export default function LanguageSelector({
  languages,
  onChange,
  className = '',
}: LanguageSelectorProps) {
  const { t } = useTranslation()
  const addLanguage = () => {
    onChange([...languages, { language: '', proficiency: 'beginner' }])
  }

  const removeLanguage = (index: number) => {
    onChange(languages.filter((_, i) => i !== index))
  }

  const updateLanguage = (index: number, field: keyof LanguageSpoken, value: string) => {
    const updated = languages.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    )
    onChange(updated)
  }

  return (
    <div className={className}>
      {languages.map((language, index) => (
        <div key={index} className="flex gap-2 items-start mb-3">
          <div className="flex-1">
            <select
              value={language.language}
              onChange={(e) => updateLanguage(index, 'language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">{t('languages.selectLanguage')}</option>
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <select
              value={language.proficiency}
              onChange={(e) => updateLanguage(index, 'proficiency', e.target.value as LanguageSpoken['proficiency'])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {PROFICIENCY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.dots} {level.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => removeLanguage(index)}
            className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addLanguage}
        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
      >
        + {t('languages.addLanguage')}
      </button>
    </div>
  )
}

// Helper functions for displaying languages
export function getLanguageName(code: string): string {
  return LANGUAGES.find(lang => lang.code === code)?.name || code
}

export function getLanguageFlag(code: string): string {
  return LANGUAGES.find(lang => lang.code === code)?.flag || '🌐'
}

export function getProficiencyDots(proficiency: LanguageSpoken['proficiency']): string {
  return PROFICIENCY_LEVELS.find(level => level.value === proficiency)?.dots || '○○○'
}