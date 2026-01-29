"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface SettingsData {
    businessName: string
    contactEmail: string
    phoneNumber: string
    address: string
    pageTitle: string
    metaDescription: string
    keywords: string
    calendlyUrl: string
    profileImageUrl?: string | null
    themePreference: string
}

export async function getSettings() {
    try {
        const settings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
        })

        if (!settings) return null

        // Omit id and dates for clean return
        const { id, updatedAt, ...rest } = settings
        return rest as SettingsData
    } catch (error) {
        console.error("Failed to fetch settings:", error)
        return null
    }
}

export async function updateSettings(data: SettingsData) {
    try {
        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: data,
            create: {
                id: "default",
                ...data
            },
        })

        revalidatePath("/")
        return { success: true, settings }
    } catch (error) {
        console.error("Failed to update settings:", error)
        return { success: false, error: "Failed to update settings" }
    }
}

// Placeholder for password update since we don't have a robust Auth setup visible
// In a real app, this would verify current password and hash new one
export async function updatePassword(data: any) {
    // Mock implementation
    return { success: true }
}
