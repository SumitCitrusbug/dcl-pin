import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from login/register or from root
  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/')) {
    const payload = await verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL(payload.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard', request.url));
    }
  }

  // Redirect root to login if not authenticated
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Public paths
  if (pathname === '/login' || pathname === '/register' || pathname === '/api/auth/login' || pathname === '/api/users/create') {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  // Role-based protection
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/employee/dashboard', request.url));
  }

  if (pathname.startsWith('/employee') && payload.role !== 'employee') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/employee/:path*',
    '/api/users',
    '/api/districts',
    '/api/pincodes',
    '/api/employee/:path*',
    '/api/admin/:path*',
  ],
};
