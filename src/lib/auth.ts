import { NextRequest, NextResponse } from 'next/server'

export const createClientForMiddleware = (request: NextRequest) => {
  const supabaseResponse = NextResponse.next({
    request,
  })

  return { supabaseResponse }
}
