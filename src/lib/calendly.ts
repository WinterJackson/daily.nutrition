/**
 * Calendly utility functions for URL building and validation
 * These are client-safe utilities that don't require server actions
 */

const DEFAULT_CALENDLY_URL = ""

/**
 * Builds a Calendly URL with optional prefill parameters
 */
export function buildCalendlyUrl(
    baseUrl: string,
    options?: {
        name?: string
        email?: string
        service?: string
        sessionType?: "virtual" | "in-person"
        backgroundColor?: string
        textColor?: string
        primaryColor?: string
    }
): string {
    if (!baseUrl) return DEFAULT_CALENDLY_URL

    try {
        const url = new URL(baseUrl)

        if (options?.name) {
            url.searchParams.set("name", options.name)
        }
        if (options?.email) {
            url.searchParams.set("email", options.email)
        }
        // Calendly uses a1, a2, etc. for custom question answers
        if (options?.service) {
            url.searchParams.set("a1", options.service)
        }
        if (options?.sessionType) {
            url.searchParams.set("a2", options.sessionType === "virtual" ? "Virtual" : "In-Person")
        }

        // Styling parameters (only active for Pro/Premium accounts)
        // Use provided colors or fallback to defaults
        url.searchParams.set("primary_color", options?.primaryColor || "E8751A") // Brand Orange
        url.searchParams.set("text_color", options?.textColor || "0E1110")       // Charcoal
        url.searchParams.set("background_color", options?.backgroundColor || "F8FAF5") // Off White

        url.searchParams.set("hide_event_type_details", "1")
        url.searchParams.set("hide_gdpr_banner", "1")

        return url.toString()
    } catch {
        return baseUrl
    }
}

/**
 * Checks if a Calendly URL is valid
 */
export function isValidCalendlyUrl(url: string): boolean {
    if (!url) return true // Empty is valid (will use default)

    try {
        const parsed = new URL(url)
        return parsed.hostname === "calendly.com" && parsed.protocol === "https:"
    } catch {
        return false
    }
}
