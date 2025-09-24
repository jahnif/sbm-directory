'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/components/LanguageToggle'

type Messages = Record<string, unknown>

export function useTranslation() {
  const locale = useLocale()
  const [messages, setMessages] = useState<Messages>({})

  useEffect(() => {
    // Dynamically import the messages for the current locale
    const loadMessages = async () => {
      try {
        const messageModule = await import(`@/messages/${locale}.json`)
        setMessages(messageModule.default)
      } catch (error) {
        console.error(`Failed to load messages for locale: ${locale}`, error)
        // Fallback to English if locale fails to load
        if (locale !== 'en') {
          const fallbackModule = await import(`@/messages/en.json`)
          setMessages(fallbackModule.default)
        }
      }
    }

    loadMessages()
  }, [locale])

  const t = (
    key: string,
    variables?: Record<string, string | number>,
  ): string => {
    const keys = key.split('.')
    let value: unknown = messages

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k]
      } else {
        console.warn(`Translation key not found: ${key}`)
        return key // Return the key if translation not found
      }
    }

    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string: ${key}`)
      return key
    }

    // Replace variables in the string (e.g., {count}, {total})
    if (variables) {
      return value.replace(/\{(\w+)\}/g, (match, varName) => {
        return variables[varName]?.toString() || match
      })
    }

    return value
  }

  return { t, locale }
}
