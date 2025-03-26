import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ALLOWED_EMAILS } from './app/lib/auth-config'

export async function middleware(request: NextRequest) {
  console.log('\n=== Middleware Execution Start ===')
  console.log('Request URL:', request.url)
  console.log('Request path:', request.nextUrl.pathname)
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log('\nSession Details:')
  console.log('Session exists:', !!session)
  console.log('User email:', session?.user?.email || 'No email')
  console.log('\nAuth Configuration:')
  console.log('Allowed emails:', ALLOWED_EMAILS)
  console.log('Is email allowed:', session?.user?.email ? ALLOWED_EMAILS.includes(session.user.email) : 'No session')

  // If there's no session and trying to access protected routes, redirect to login
  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    console.log('\nRedirecting to login (no session)')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If there's a session but email is not allowed, redirect to unauthorized
  if (session && !ALLOWED_EMAILS.includes(session.user.email!)) {
    // Only redirect to unauthorized if we're not already there
    if (!request.nextUrl.pathname.startsWith('/unauthorized')) {
      console.log('\nRedirecting to unauthorized (email not allowed)')
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
  }

  // If there's a session and email is allowed, allow access to all routes except login
  if (session && ALLOWED_EMAILS.includes(session.user.email!)) {
    if (request.nextUrl.pathname.startsWith('/login')) {
      console.log('\nRedirecting to home (authorized user on login page)')
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  console.log('\nAllowing access')
  console.log('=== Middleware Execution End ===\n')
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
     * - auth/callback (auth callback route)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|auth/callback).*)',
  ],
} 