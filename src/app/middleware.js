import { NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req) {
  const res = NextResponse.next();

  // Retrieve environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Initialize Supabase middleware client
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl,
    supabaseKey: supabaseAnonKey
  });

  try {
    // Retrieve session data
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error retrieving session:", error.message);
    }

    // Define protected routes
    const protectedRoutes = [
      '/Dashboard',
      '/Dashboard/add-transaction',
      '/Dashboard/transHistory',
      '/Dashboard/budget-setting',
      '/Dashboard/monthly-summary'
    ];

    // Redirect to login if no session exists for protected routes
    if (!session && protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    return res;

  } catch (err) {
    console.error('Unexpected middleware error:', err);
    return res;
  }
}

export const config = {
  matcher: [
    '/Dashboard',
    '/Dashboard/add-transaction',
    '/Dashboard/transHistory',
    '/Dashboard/budget-setting',
    '/Dashboard/monthly-summary'
  ],
};
