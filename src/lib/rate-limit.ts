/**
 * Enterprise Rate Limiting — In-Memory Sliding Window
 * 
 * Zero external dependencies. Uses sliding window algorithm (same accuracy 
 * as Upstash) with automatic memory cleanup. Granular exported limiters 
 * for different action types.
 * 
 * Graceful by design: always returns a result, never throws.
 */

export interface RateLimitOptions {
    limit: number
    windowMs: number
}

interface RateLimitResult {
    success: boolean
    remaining: number
    reset: Date
}

interface RequestRecord {
    timestamps: number[]
}

// ═══════════════════════════════════════════════════════
// In-Memory Store with Auto-Cleanup
// ═══════════════════════════════════════════════════════

const store = new Map<string, RequestRecord>()

// Cleanup interval (runs every 5 minutes to prevent memory leaks)
let cleanupInterval: NodeJS.Timeout | null = null

function getStore() {
    if (!cleanupInterval && typeof window === "undefined") {
        cleanupInterval = setInterval(() => {
            const now = Date.now()
            for (const [key, record] of Array.from(store.entries())) {
                record.timestamps = record.timestamps.filter((ts) => now - ts < 60 * 60 * 1000)
                if (record.timestamps.length === 0) {
                    store.delete(key)
                }
            }
        }, 5 * 60 * 1000)
    }
    return store
}

// ═══════════════════════════════════════════════════════
// Core Rate Limit Check
// ═══════════════════════════════════════════════════════

export async function checkRateLimit(
    identifier: string,
    action: string,
    options: RateLimitOptions
): Promise<RateLimitResult> {
    const memoryStore = getStore()
    const key = `${action}:${identifier}`
    const now = Date.now()
    const windowStart = now - options.windowMs

    let record = memoryStore.get(key)

    if (!record) {
        record = { timestamps: [] }
        memoryStore.set(key, record)
    }

    // Filter out old timestamps (sliding window)
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart)

    if (record.timestamps.length >= options.limit) {
        const oldestTimestamp = record.timestamps[0]
        return {
            success: false,
            remaining: 0,
            reset: new Date(oldestTimestamp + options.windowMs),
        }
    }

    record.timestamps.push(now)

    return {
        success: true,
        remaining: options.limit - record.timestamps.length,
        reset: new Date(now + options.windowMs),
    }
}

// ═══════════════════════════════════════════════════════
// Pre-Configured Granular Limiters
// ═══════════════════════════════════════════════════════

export const RATE_LIMITS = {
    auth: { limit: 5, windowMs: 60 * 1000 },              // 5 per minute
    contact: { limit: 10, windowMs: 5 * 60 * 1000 },      // 10 per 5 minutes
    newsletter: { limit: 5, windowMs: 10 * 60 * 1000 },   // 5 per 10 minutes
    booking: { limit: 5, windowMs: 10 * 60 * 1000 },      // 5 per 10 minutes
    apiStandard: { limit: 60, windowMs: 60 * 1000 },      // 60 per minute
}

/**
 * Convenience limiters — call with just an identifier.
 */
export async function authLimiter(identifier: string): Promise<RateLimitResult> {
    return checkRateLimit(identifier, "auth", RATE_LIMITS.auth)
}

export async function contactLimiter(identifier: string): Promise<RateLimitResult> {
    return checkRateLimit(identifier, "contact", RATE_LIMITS.contact)
}

export async function newsletterLimiter(identifier: string): Promise<RateLimitResult> {
    return checkRateLimit(identifier, "newsletter", RATE_LIMITS.newsletter)
}

export async function bookingLimiter(identifier: string): Promise<RateLimitResult> {
    return checkRateLimit(identifier, "booking", RATE_LIMITS.booking)
}
