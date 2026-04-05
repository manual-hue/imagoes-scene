import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/room', '/evidence', '/accusation'];
const GATE_PATH = '/gate';
const ADMIN_PATHS = ['/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Admin paths: separate auth handled in API routes
  if (ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Protected player paths
  if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
    const authToken = req.cookies.get('csz_session')?.value;
    if (!authToken) {
      const gateUrl = req.nextUrl.clone();
      gateUrl.pathname = GATE_PATH;
      gateUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(gateUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/room/:path*',
    '/evidence/:path*',
    '/accusation/:path*',
    '/admin/:path*',
  ],
};
