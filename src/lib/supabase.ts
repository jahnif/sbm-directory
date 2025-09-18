import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          family_name: string
          description: string
          family_name_es: string | null
          description_es: string | null
          original_language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_name: string
          description: string
          family_name_es?: string | null
          description_es?: string | null
          original_language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_name?: string
          description?: string
          family_name_es?: string | null
          description_es?: string | null
          original_language?: string
          updated_at?: string
        }
      }
      adults: {
        Row: {
          id: string
          family_id: string
          name: string
          name_es: string | null
          image_url: string | null
          industry: string | null
          job_title: string | null
          interested_in_connections: boolean
          connection_types: string | null
          email: string | null
          whatsapp_number: string | null
          show_contact_in_networking: boolean
          country: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          name_es?: string | null
          image_url?: string | null
          industry?: string | null
          job_title?: string | null
          interested_in_connections?: boolean
          connection_types?: string | null
          email?: string | null
          whatsapp_number?: string | null
          show_contact_in_networking?: boolean
          country?: string | null
          city?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          name_es?: string | null
          image_url?: string | null
          industry?: string | null
          job_title?: string | null
          interested_in_connections?: boolean
          connection_types?: string | null
          email?: string | null
          whatsapp_number?: string | null
          show_contact_in_networking?: boolean
          country?: string | null
          city?: string | null
        }
      }
      children: {
        Row: {
          id: string
          family_id: string
          name: string
          name_es: string | null
          image_url: string | null
          class: 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          name_es?: string | null
          image_url?: string | null
          class: 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          name_es?: string | null
          image_url?: string | null
          class?: 'Pegasus' | 'Lynx' | 'Orion' | 'Andromeda'
        }
      }
    }
  }
}