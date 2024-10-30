import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/business/login' || path === '/business/signup';
    const token = await getToken();
    const isAuthenticated = token !== undefined && token !== ''

    // If the user is not logged in and tries to access any protected page, redirect to login
    if (!isPublicPath && !isAuthenticated) {
        return NextResponse.redirect(new URL('/business/login', request.nextUrl));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/business'],
};
