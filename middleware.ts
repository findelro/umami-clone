import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader) {
    const [, base64Credentials] = authHeader.split(' ')
    const credentials = atob(base64Credentials)
    const [username, password] = credentials.split(':')

    if (username === 'admin' && password === 'admin') {
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

export const config = {
  matcher: '/:path*',
} 