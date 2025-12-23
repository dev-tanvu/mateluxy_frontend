import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for frontend-domain cookie set after login
    // Backend cookies aren't visible to middleware on different domain
    const isAuthenticated = request.cookies.get('isAuthenticated');
    const isAuth = isAuthenticated?.value === 'true';

    const isLoginPage = request.nextUrl.pathname === '/login';
    const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

    if (isDashboard && !isAuth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isLoginPage && isAuth) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/login'],
};
