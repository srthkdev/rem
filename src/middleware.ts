import { getSessionCookie } from "better-auth/cookies"
import { type NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    
    // Handle protected routes
    if (pathname.startsWith('/auth/settings')) {
        // Check cookie for optimistic redirects for protected routes
        const sessionCookie = getSessionCookie(request)

        if (!sessionCookie) {
            const redirectTo = request.nextUrl.pathname + request.nextUrl.search
            return NextResponse.redirect(new URL(`/auth/sign-in?redirectTo=${redirectTo}`, request.url))
        }
    }
    
    // Redirect authenticated users from home to project/new
    if (pathname === '/' || pathname === '/dashboard') {
        const sessionCookie = getSessionCookie(request)
        
        if (sessionCookie) {
            return NextResponse.redirect(new URL('/project/new', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    // Add / and /dashboard as paths to be handled by middleware
    matcher: ["/auth/settings", "/", "/dashboard"]
}
