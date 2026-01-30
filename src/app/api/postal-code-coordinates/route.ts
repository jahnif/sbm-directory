import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/lib/supabase-server'

// Cache coordinates for 1 hour
export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const codigoPostal = searchParams.get('codigo_postal')

  if (!codigoPostal) {
    return NextResponse.json(
      { error: 'codigo_postal parameter is required' },
      { status: 400 }
    )
  }

  // Validate postal code format
  if (!/^46\d{3}$/.test(codigoPostal)) {
    return NextResponse.json(
      { error: 'Invalid Valencia postal code format' },
      { status: 400 }
    )
  }

  try {
    // Use cached server-side Supabase client
    const supabase = getServerSupabaseClient()

    const { data, error } = await supabase
      .from('codigos_postales')
      .select('latitud, longitud')
      .eq('codigo_postal', codigoPostal)
      .single()

    if (error) {
      console.error('Error fetching postal code coordinates:', codigoPostal, error)
      return NextResponse.json(
        { error: 'Postal code not found' },
        { status: 404 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Postal code not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data, {
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
