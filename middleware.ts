import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ALLOWED_EMAILS } from './app/lib/auth-config'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('Middleware - Current path:', request.nextUrl.pathname)
  console.log('Middleware - Session:', session ? 'Present' : 'None')
  console.log('Middleware - User email:', session?.user?.email)
  console.log('Middleware - Allowed emails:', ALLOWED_EMAILS)
  console.log('Middleware - Is email allowed:', session?.user?.email ? ALLOWED_EMAILS.includes(session.user.email) : 'No session')

  // If there's no session and trying to access protected routes, redirect to login
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    console.log('Middleware - Redirecting to login (no session)')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there's a session but email is not allowed, redirect to unauthorized
  if (session && !ALLOWED_EMAILS.includes(session.user.email!)) {
    // Only redirect to unauthorized if we're not already there
    if (!request.nextUrl.pathname.startsWith('/unauthorized')) {
      console.log('Middleware - Redirecting to unauthorized (email not allowed)')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // If there's a session and email is allowed, allow access to all routes except login
  if (session && ALLOWED_EMAILS.includes(session.user.email!)) {
    if (request.nextUrl.pathname.startsWith('/login')) {
      console.log('Middleware - Redirecting to home (authorized user on login page)')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log('Middleware - Allowing access')
  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 