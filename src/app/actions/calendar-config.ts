"use server"

import { prisma } from "@/lib/prisma"

export interface CalendarConfig {
    provider: "google_calendar" | "none"
    calendarId: string
    businessName: string
    googleConfig?: {
        eventDuration: number
        bufferTime: number
        minNotice: number
        availability: any
    }
}

const DEFAULT_CONFIG: CalendarConfig = {
    provider: "none",
    calendarId: "",
    businessName: "Edwak Nutrition"
}

/**
 * Fetches the configured Google Calendar settings.
 * Returns the calendar ID and booking configuration (duration, buffer, availability).
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

        const calendarId = settings.googleCalendarId || ""
        const hasConfig = !!settings.GoogleCalendarConfig

        // If no calendar ID is set, treat as "none"
        if (!calendarId) {
            return DEFAULT_CONFIG
        }

        return {
            provider: "google_calendar",
            calendarId,
            businessName: settings.businessName || "Edwak Nutrition",
            googleConfig: hasConfig ? {
                eventDuration: settings.GoogleCalendarConfig!.eventDuration,
                bufferTime: settings.GoogleCalendarConfig!.bufferTime,
                minNotice: settings.GoogleCalendarConfig!.minNotice,
                availability: settings.GoogleCalendarConfig!.availability
            } : undefined
        }
    } catch (error) {
        console.warn("Failed to fetch calendar config (using default):", error instanceof Error ? error.message : String(error))
        return DEFAULT_CONFIG
    }
}
