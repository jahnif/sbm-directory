import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabase-server'

// Cache postal codes for 1 hour (they rarely change)
export const revalidate = 3600
export const dynamic = 'force-static'

export async function GET() {
  try {
    // Use cached server-side Supabase client
    const supabase = getServerSupabaseClient()

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

    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
