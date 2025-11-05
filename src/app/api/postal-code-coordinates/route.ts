import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

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

    return NextResponse.json(data)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
