import { createClient } from '@supabase/supabase-js'

// Cache the server-side Supabase client to avoid recreation on every API call
let serverSupabaseClient: ReturnType<typeof createClient> | null = null

export function getServerSupabaseClient() {
  if (!serverSupabaseClient) {
    serverSupabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }
  return serverSupabaseClient
}
