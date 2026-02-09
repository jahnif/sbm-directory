import { NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
  // Check if user has entered the site password
  const sitePasswordCookie = request.cookies.get('site-access')
  const pathname = request.nextUrl.pathname

  // Allow access to login page
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Check if site password has been entered
  if (!sitePasswordCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Verify the site password is correct
  const sitePassword = process.env.NEXT_PUBLIC_SITE_PASSWORD
  if (sitePasswordCookie.value !== sitePassword) {
    // Clear invalid cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('site-access')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login page
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login).*)',
  ],
}
