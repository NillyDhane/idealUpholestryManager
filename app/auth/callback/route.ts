import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  console.log('\n=== Auth Callback Start ===');
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  console.log('Auth Callback - Code received:', code ? 'Yes' : 'No');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    try {
      // Exchange the code for a session
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      console.log('Auth Callback - Session exchange result:', error ? 'Error' : 'Success');
      
      if (error || !session) {
        console.error('Auth Callback - Exchange error:', error);
        return NextResponse.redirect(new URL('/login', requestUrl.origin));
      }

      console.log('Auth Callback - User email:', session?.user?.email);

      // Set the session explicitly
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      // Create response with redirect
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin));

      // Set auth cookies
      response.cookies.set('sb-access-token', session.access_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      response.cookies.set('sb-refresh-token', session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    } catch (error) {
      console.error('Auth Callback - Unexpected error:', error);
      return NextResponse.redirect(new URL('/login', requestUrl.origin));
    }
  }

  console.log('Auth Callback - No code received, redirecting to login');
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
