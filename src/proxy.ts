/**
 * Enterprise Proxy Middleware
 * 
 * All middleware logic lives here — route protection via JWT verification.
 * Uses jose for Edge-compatible JWT operations (no DB call in middleware).
 * The full dual-check (JWT + DB) happens in verifySession() within server actions.
 */

import { jwtVerify } from "jose"
import { NextRequest, NextResponse } from "next/server"

const COOKIE_NAME = "session_token"

// Routes that require authentication
const PROTECTED_PATHS = ["/admin"]
// Routes that should redirect to admin if already authenticated  
const AUTH_PATHS = ["/admin/login"]

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET
    if (!secret) return new TextEncoder().encode("fallback-dev-key-not-for-production")
    return new TextEncoder().encode(secret)
}

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(COOKIE_NAME)?.value

    // ── Check if accessing login page while already authenticated ──
    const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p))
    if (isAuthPage && token) {
        try {
            await jwtVerify(token, getJwtSecret())
            // Valid token — redirect to admin dashboard
            return NextResponse.redirect(new URL("/admin/blog", request.url))
        } catch {
            // Invalid token — allow access to login page
        }
    }

    // ── Check if accessing a protected route ──
    const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p))
    if (!isProtected) return NextResponse.next()

    // Skip login page from protection
    if (isAuthPage) return NextResponse.next()

    // No token — redirect to login
    if (!token) {
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
    }

    // ── Verify JWT signature (lightweight — no DB call in Edge) ──
    try {
        await jwtVerify(token, getJwtSecret())

        // Add security headers to admin responses
        const response = NextResponse.next()
        response.headers.set("X-Frame-Options", "DENY")
        response.headers.set("X-Content-Type-Options", "nosniff")
        response.headers.set("Referrer-Policy", "origin-when-cross-origin")
        return response
    } catch {
        // Invalid/expired token — clear cookie and redirect
        const response = NextResponse.redirect(new URL("/admin/login", request.url))
        response.cookies.delete(COOKIE_NAME)
        return response
    }
}

export const config = { matcher: ["/admin/:path*"] }
