import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Let the client-side AuthProvider handle rich dynamic redirect based on JWT tokens stored in localStorage / cookies
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/transactions/:path*', '/wallets/:path*', '/budgets/:path*'],
};
