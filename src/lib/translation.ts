import { TranslationRequest, TranslationResponse, LanguageSpoken } from '@/types'

export async function translateText(
  text: string,
  sourceLang: 'en' | 'es',
  targetLang: 'en' | 'es',
): Promise<string> {
  if (!text || !text.trim()) {
    return text
  }

  if (sourceLang === targetLang) {
    return text
  }

  try {
    const request: TranslationRequest = {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
    }

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const result: TranslationResponse = await response.json()
    return result.translated_text
  } catch (error) {
    console.error('Translation error:', error)
    return text // Return original text if translation fails
  }
}

export async function translateFamilyData(
  familyData: {
    family_name: string
    description: string
    adults: Array<{ connection_types?: string; hobbies?: string; languages_spoken?: LanguageSpoken[] | null }>
  },
  sourceLang: 'en' | 'es',
): Promise<{
  family_name_translated: string
  description_translated: string
  adults_connection_types_translated: Array<{ connection_types_translated?: string; hobbies_translated?: string }>
}> {
  const targetLang = sourceLang === 'en' ? 'es' : 'en'

  try {
    // Translate family name and description
    const [familyNameTranslated, descriptionTranslated] = await Promise.all([
      translateText(familyData.family_name, sourceLang, targetLang),
      translateText(familyData.description, sourceLang, targetLang),
    ])

    // Translate adult connection_types (professional interests) and hobbies
    const adultsConnectionTypesTranslated = await Promise.all(
      familyData.adults.map(async (adult) => ({
        connection_types_translated: adult.connection_types
          ? await translateText(adult.connection_types, sourceLang, targetLang)
          : undefined,
        hobbies_translated: adult.hobbies
          ? await translateText(adult.hobbies, sourceLang, targetLang)
          : undefined
      }))
    )

    return {
      family_name_translated: familyNameTranslated,
      description_translated: descriptionTranslated,
      adults_connection_types_translated: adultsConnectionTypesTranslated,
    }
  } catch (error) {
    console.error('Family data translation error:', error)
    // Return original data if translation fails
    return {
      family_name_translated: familyData.family_name,
      description_translated: familyData.description,
      adults_connection_types_translated: familyData.adults.map(adult => ({
        connection_types_translated: adult.connection_types,
        hobbies_translated: adult.hobbies
      }))
    }
  }
}

export function detectLanguage(text: string): 'en' | 'es' {
  // Simple language detection based on common Spanish words
  const spanishWords = [
    'el',
    'la',
    'de',
    'que',
    'y',
    'a',
    'en',
    'un',
    'es',
    'se',
    'no',
    'te',
    'lo',
    'le',
    'da',
    'su',
    'por',
    'son',
    'con',
    'para',
    'está',
    'tienen',
    'del',
    'han',
    'una',
    'ser',
    'al',
    'todo',
    'como',
    'familia',
    'niños',
    'padres',
    'escuela',
    'montessori',
  ]

  const words = text.toLowerCase().split(/\s+/)
  const spanishWordCount = words.filter((word) =>
    spanishWords.includes(word),
  ).length
  const spanishRatio = spanishWordCount / words.length

  // If more than 20% of words are common Spanish words, assume it's Spanish
  return spanishRatio > 0.2 ? 'es' : 'en'
}
