import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabase-server'

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

    return NextResponse.json(data || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
