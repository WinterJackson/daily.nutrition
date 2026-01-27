"use server"

import { prisma } from "@/lib/prisma"

const DEFAULT_CALENDLY_URL = ""

/**
 * Fetches the configured Calendly URL from settings
 * Falls back to empty string if not configured
 */
export async function getCalendlyUrl(): Promise<string> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            select: { calendlyUrl: true }
        })

        return settings?.calendlyUrl || DEFAULT_CALENDLY_URL
    } catch (error) {
        console.warn("Failed to fetch Calendly URL (using default):", error instanceof Error ? error.message : String(error))
        return DEFAULT_CALENDLY_URL
    }
}
