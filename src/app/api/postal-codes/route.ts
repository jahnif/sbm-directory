import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use service role key for server-side queries (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { data, error } = await supabase
      .from('codigos_postales')
      .select('codigo_postal, localidad, latitud, longitud')

    if (error) {
      console.error('Error fetching postal codes:', error)
      return NextResponse.json(
        { error: 'Failed to fetch postal codes' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
