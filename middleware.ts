import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a response to modify
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })
  
  try {
    // Get and validate the session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    const requestUrl = new URL(request.url)
    const isAuthPage = requestUrl.pathname === '/login' || requestUrl.pathname.startsWith('/auth')
    const isRootPage = requestUrl.pathname === '/'

    // Function to create a login redirect response
    const createLoginRedirect = () => {
      const response = NextResponse.redirect(new URL('/login', request.url))
      return response
    }

    // Check if we're in the auth flow
    const isAuthFlow = requestUrl.pathname.startsWith('/auth/callback')
    if (isAuthFlow) {
      return res
    }

    // Validate session has required fields
    const hasValidSession = session?.user && session?.access_token && !error

    // If no valid session, handle appropriately
    if (!hasValidSession) {
      // Allow access to auth pages
      if (isAuthPage) {
        return res
      }
      // Redirect to login for all other pages
      return createLoginRedirect()
    }

    // If has valid session and trying to access auth pages, redirect to dashboard
    if (isAuthPage || isRootPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Allow access to protected routes for authenticated users
    return res
  } catch (error) {
    console.error('Unexpected error in middleware:', error)
    return createLoginRedirect()
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
} 