export interface Family {
  id: string
  family_name: string
  description: string
  created_at: string
  updated_at: string
  adults: Adult[]
  children: Child[]
}

export interface Adult {
  id: string
  family_id: string
  name: string
  image_url: string | null
  industry: string | null
  job_title: string | null
  interested_in_connections: boolean
  connection_types: string | null
  country: string | null
  city: string | null
  created_at: string
}

export interface Child {
  id: string
  family_id: string
  name: string
  image_url: string | null
  class: 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'
  created_at: string
}

export type ClassType = 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'

export interface FamilyFormData {
  family_name: string
  description: string
  adults: Omit<Adult, 'id' | 'family_id' | 'created_at'>[]
  children: Omit<Child, 'id' | 'family_id' | 'created_at'>[]
}