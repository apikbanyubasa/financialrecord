import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const rawToken = request.cookies.get('auth_token')?.value;
  const authToken =
    rawToken && rawToken !== 'undefined' && rawToken !== 'null' && rawToken.trim() !== ''
      ? rawToken
      : null;

  const { pathname, searchParams } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/wallets') ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/admin');

  // Handle explicit session reset / expired / logout requests
  const isSessionReset =
    searchParams.has('expired') ||
    searchParams.has('logout') ||
    searchParams.has('unauthenticated');

  // Handle Auth Pages (/login, /register)
  if (isAuthPage) {
    if (isSessionReset || !authToken) {
      const response = NextResponse.next();
      if (rawToken) {
        response.cookies.delete('auth_token');
        response.cookies.set({
          name: 'auth_token',
          value: '',
          path: '/',
          maxAge: 0,
        });
      }
      return response;
    }

    // Only redirect authenticated user if token is valid and no reset requested
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated user away from protected routes to login
  if (isProtectedPage && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*',
    '/transactions/:path*',
    '/wallets/:path*',
    '/budgets/:path*',
  ],
};
