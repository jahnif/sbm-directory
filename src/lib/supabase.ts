import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      families: {
        Row: {
          id: string
          family_name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          family_name: string
          description: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          family_name?: string
          description?: string
          updated_at?: string
        }
      }
      adults: {
        Row: {
          id: string
          family_id: string
          name: string
          image_url: string | null
          industry: string | null
          job_title: string | null
          interested_in_connections: boolean
          connection_types: string | null
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          image_url?: string | null
          industry?: string | null
          job_title?: string | null
          interested_in_connections?: boolean
          connection_types?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          image_url?: string | null
          industry?: string | null
          job_title?: string | null
          interested_in_connections?: boolean
          connection_types?: string | null
        }
      }
      children: {
        Row: {
          id: string
          family_id: string
          name: string
          image_url: string | null
          class: 'Pegasus' | 'Orion' | 'Andromeda'
          created_at: string
        }
        Insert: {
          id?: string
          family_id: string
          name: string
          image_url?: string | null
          class: 'Pegasus' | 'Orion' | 'Andromeda'
          created_at?: string
        }
        Update: {
          id?: string
          family_id?: string
          name?: string
          image_url?: string | null
          class?: 'Pegasus' | 'Orion' | 'Andromeda'
        }
      }
    }
  }
}