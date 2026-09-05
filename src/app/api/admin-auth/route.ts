import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin-access'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

// Constant-time-ish comparison. Not a meaningful defense here (the gate is
// UI-only per the design doc), but avoids the most obvious timing leak.
function matches(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export async function GET(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  const cookie = request.cookies.get(COOKIE_NAME)
  const isAdmin = Boolean(expected && cookie && matches(cookie.value, expected))
  return NextResponse.json({ isAdmin })
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { success: false, error: 'Admin access is not configured' },
      { status: 500 },
    )
  }

  let password: unknown
  try {
    password = (await request.json())?.password
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 },
    )
  }

  if (typeof password !== 'string' || !matches(password, expected)) {
    return NextResponse.json(
      { success: false, error: 'Incorrect password' },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE,
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}
