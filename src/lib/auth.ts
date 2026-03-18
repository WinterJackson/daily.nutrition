/**
 * Enterprise Auth System: JWT + DB Dual-Check Sessions
 * 
 * Defense in Depth:
 * 1. JWT signature verification (crypto check — no DB call)
 * 2. DB session lookup (ensures revokability)
 * 3. 2FA verification check (if enabled)
 * 
 * Uses `jose` for Edge-compatible JWT operations.
 */

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify, type JWTPayload } from "jose"
import { cookies } from "next/headers"

const SALT_ROUNDS = 10
const SESSION_DURATION_DAYS = 7
const COOKIE_NAME = "session_token"

interface SessionPayload extends JWTPayload {
    userId: string
    sessionId: string
}

interface AuthUser {
    id: string
    email: string
    name: string | null
    role: string
    twoFactorEnabled: boolean
}

interface SessionResult {
    user: AuthUser
    session: {
        id: string
        twoFactorVerified: boolean
    }
}

// ═══════════════════════════════════════════════════════
// Password Hashing
// ═══════════════════════════════════════════════════════

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

// ═══════════════════════════════════════════════════════
// JWT Operations (Edge-compatible via jose)
// ═══════════════════════════════════════════════════════

function getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) {
        throw new Error("JWT_SECRET must be at least 32 characters. Set it in your .env file.")
    }
    return new TextEncoder().encode(secret)
}

async function signToken(payload: SessionPayload): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
        .sign(getJwtSecret())
}

async function verifyToken(token: string): Promise<SessionPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getJwtSecret())
        return payload as SessionPayload
    } catch {
        return null
    }
}

// ═══════════════════════════════════════════════════════
// Session Management
// ═══════════════════════════════════════════════════════

/**
 * Create a new session: signs JWT, stores in DB, sets HTTP-only cookie.
 */
export async function createSession(
    userId: string,
    twoFactorVerified: boolean = false,
    rememberMe: boolean = false
): Promise<string> {
    const days = rememberMe ? 30 : 1
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    // Create DB session record first
    const session = await prisma.session.create({
        data: {
            userId,
            token: "pending", // Will be updated with JWT
            expiresAt,
            twoFactorVerified,
        },
    })

    // Generate JWT containing session ID and user ID
    const token = await signToken({
        userId,
        sessionId: session.id,
    })

    // Update session record with actual token
    await prisma.session.update({
        where: { id: session.id },
        data: { token },
    })

    // Set HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: expiresAt,
    })

    return token
}

/**
 * Dual-Check Session Verification:
 * Step 1: Verify JWT signature (crypto check — fails fast, no DB call)
 * Step 2: Lookup session in DB (ensures revokability)
 * Step 3: Check 2FA if user has it enabled
 */
export async function verifySession(): Promise<SessionResult | null> {
    try {
        // Get token from cookie
        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value
        if (!token) return null

        // Step 1: JWT signature verification (crypto check)
        const payload = await verifyToken(token)
        if (!payload?.userId || !payload?.sessionId) return null

        // Step 2: DB session lookup (ensures revokability)
        const session = await prisma.session.findUnique({
            where: { id: payload.sessionId },
            include: { user: true },
        })

        if (!session) return null
        if (session.token !== token) return null
        if (session.expiresAt < new Date()) {
            // Clean up expired session
            await prisma.session.delete({ where: { id: session.id } }).catch(() => { })
            return null
        }

        // Step 3: 2FA check
        const user = session.user
        if (user.twoFactorEnabled && !session.twoFactorVerified) {
            return null
        }

        // Update last active
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        }).catch(() => { }) // Fire-and-forget

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
            },
            session: {
                id: session.id,
                twoFactorVerified: session.twoFactorVerified,
            },
        }
    } catch {
        return null
    }
}

/**
 * Convenience wrapper: get the current authenticated user or null.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
    const result = await verifySession()
    return result?.user || null
}

/**
 * Destroy the current session: delete from DB and clear cookie.
 */
export async function destroySession(): Promise<void> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get(COOKIE_NAME)?.value

        if (token) {
            const payload = await verifyToken(token)
            if (payload?.sessionId) {
                await prisma.session.delete({ where: { id: payload.sessionId } }).catch(() => { })
            }
        }

        cookieStore.delete(COOKIE_NAME)
    } catch {
        // Best effort cleanup
    }
}

/**
 * Revoke all sessions for a user (forced logout everywhere).
 * Used by Super Admin for security events.
 */
export async function revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({ where: { userId } })
}

/**
 * Lightweight token check for Edge middleware (no DB call).
 * Only verifies JWT signature — used in middleware.ts for fast route protection.
 */
export async function verifyTokenOnly(token: string): Promise<boolean> {
    const payload = await verifyToken(token)
    return payload !== null
}

// Re-export for backward compatibility during migration
export { COOKIE_NAME }
