import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use non-public env variables
const AUTH_USER = process.env.BASIC_AUTH_USER
const AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD

export const config = {
  matcher: '/:path*',
  // Specify that we need these env variables at the edge
  env: ['BASIC_AUTH_USER', 'BASIC_AUTH_PASSWORD'],
}

export function middleware(request: NextRequest) {
  // Check if auth is configured
  if (!AUTH_USER || !AUTH_PASSWORD) {
    console.warn('Basic auth credentials not configured')
    return NextResponse.next()
  }

  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [, base64Credentials] = authHeader.split(' ')
    const credentials = atob(base64Credentials)
    const [username, password] = credentials.split(':')

    if (username === AUTH_USER && password === AUTH_PASSWORD) {
      return NextResponse.next()
    }
  }

  return new NextResponse(null, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  })
} 