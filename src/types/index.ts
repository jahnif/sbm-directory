export interface Family {
  id: string
  family_name: string
  description: string
  family_name_es?: string | null
  description_es?: string | null
  original_language: 'en' | 'es'
  created_at: string
  updated_at: string
  adults: Adult[]
  children: Child[]
}

export interface LanguageSpoken {
  language: string // Language code (e.g., 'en', 'es', 'fr') or name (e.g., 'English', 'Spanish')
  proficiency: 'beginner' | 'intermediate' | 'fluent'
}

export interface LocationInfo {
  country: string // Country code (e.g., 'US', 'ES', 'FR')
  city: string    // City name
}

export interface Adult {
  id: string
  family_id: string
  name: string
  name_es?: string | null
  image_url: string | null
  hobbies: string | null
  hobbies_es?: string | null
  industry: string | null
  job_title: string | null
  interested_in_connections: boolean
  connection_types: string | null
  connection_types_es?: string | null
  email?: string | null
  whatsapp_number?: string | null
  show_contact_in_networking: boolean
  locations: LocationInfo[] | null
  locations_es?: LocationInfo[] | null
  languages_spoken: LanguageSpoken[] | null
  languages_spoken_es?: LanguageSpoken[] | null
  created_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  name_es?: string | null
  image_url: string | null
  class: 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'
  created_at: string
}

export type ClassType = 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'

export interface FamilyFormData {
  family_name: string
  description: string
  original_language: 'en' | 'es'
  adults: Omit<Adult, 'id' | 'family_id' | 'created_at'>[]
  children: Omit<Child, 'id' | 'family_id' | 'created_at'>[]
}

export interface TranslationRequest {
  text: string
  source_lang: 'en' | 'es'
  target_lang: 'en' | 'es'
}

export interface TranslationResponse {
  translated_text: string
  detected_source_lang?: string
}
