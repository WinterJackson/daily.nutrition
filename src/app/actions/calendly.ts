"use server"

import { prisma } from "@/lib/prisma"

export type CalendarProvider = "calendly" | "savvycal" | "google_calendar" | "none"

export interface CalendarConfig {
    provider: CalendarProvider
    url: string
    googleConfig?: {
        eventDuration: number
        bufferTime: number
        minNotice: number
        availability: any
    }
}

const DEFAULT_CONFIG: CalendarConfig = {
    provider: "none",
    url: ""
}

/**
 * Fetches the configured calendar provider and URL from settings
 * Returns provider type and the corresponding URL
 */
export async function getCalendarConfig(): Promise<CalendarConfig> {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: {
                GoogleCalendarConfig: true
            }
        })

        if (!settings) return DEFAULT_CONFIG

        const provider = (settings.calendarProvider || "none") as CalendarProvider

        // Return the appropriate URL based on provider
        let url = ""
        let googleConfig = undefined

        if (provider === "calendly") {
            url = settings.calendlyUrl || ""
        } else if (provider === "savvycal") {
            url = settings.savvycalUrl || ""
        } else if (provider === "google_calendar") {
            url = settings.googleCalendarId || ""
            if (settings.GoogleCalendarConfig) {
                googleConfig = {
                    eventDuration: settings.GoogleCalendarConfig.eventDuration,
                    bufferTime: settings.GoogleCalendarConfig.bufferTime,
                    minNotice: settings.GoogleCalendarConfig.minNotice,
                    availability: settings.GoogleCalendarConfig.availability
                }
            }
        }

        if (googleConfig) {
            console.log("Returning Google Config:", JSON.stringify(googleConfig.availability, null, 2))
        }

        return { provider, url, googleConfig }
    } catch (error) {
        console.warn("Failed to fetch calendar config (using default):", error instanceof Error ? error.message : String(error))
        return DEFAULT_CONFIG
    }
}

/**
 * Legacy function for backwards compatibility
 * @deprecated Use getCalendarConfig() instead
 */
export async function getCalendlyUrl(): Promise<string> {
    const config = await getCalendarConfig()
    return config.provider === "calendly" ? config.url : ""
}
