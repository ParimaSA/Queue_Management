import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    const isPublicPath = path === '/business/login' || path === '/business/signup';
    const token = getToken(); 

    // Redirect logged-in users trying to access the login page to the business page
    if (path === '/business/login' && token !== undefined) {
        return NextResponse.redirect(new URL('/business', request.nextUrl));
    }

    // Redirect logged-in users from public paths to the home page
    if (isPublicPath && token !== undefined) {
        return NextResponse.redirect(new URL('/business', request.nextUrl));
    }

    
}
