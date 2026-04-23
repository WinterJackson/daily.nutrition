"use server"

import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export interface EmailBrandingData {
    logoUrl?: string | null
    primaryColor: string
    accentColor: string
    footerText: string
    websiteUrl: string
    supportEmail: string
    clinicLocation?: string
    contactPhone?: string
    paymentTill?: string
    paymentPaybill?: string
    paymentAccountNumber?: string
    paymentAccountName?: string
}

const DEFAULT_BRANDING: EmailBrandingData = {
    logoUrl: null,
    primaryColor: "#556B2F",
    accentColor: "#E87A1E",
    footerText: "Edwak Nutrition, Nairobi, Kenya",
    websiteUrl: "https://edwaknutrition.co.ke",
    supportEmail: "info@edwaknutrition.co.ke"
}

/**
 * Get email branding configuration
 */
export async function getEmailBranding(): Promise<EmailBrandingData> {
    try {
        const settings: any = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            include: { EmailBranding: true }
        })

        if (!settings?.EmailBranding) {
            return DEFAULT_BRANDING
        }

        return {
            logoUrl: settings.EmailBranding.logoUrl,
            primaryColor: settings.EmailBranding.primaryColor,
            accentColor: settings.EmailBranding.accentColor,
            footerText: settings.EmailBranding.footerText,
            websiteUrl: settings.EmailBranding.websiteUrl,
            supportEmail: settings.EmailBranding.supportEmail,
            clinicLocation: settings.address,
            contactPhone: settings.phoneNumber,
            paymentTill: settings.paymentTillNumber,
            paymentPaybill: settings.paymentPaybill,
            paymentAccountNumber: settings.paymentAccountNumber,
            paymentAccountName: settings.paymentAccountName
        }
    } catch (error) {
        console.error("Failed to fetch email branding:", error)
        return DEFAULT_BRANDING
    }
}

/**
 * Update email branding configuration
 */
export async function updateEmailBranding(data: EmailBrandingData) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Ensure default settings exist
        await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default" },
            update: {}
        })

        // Upsert branding config
        await prisma.emailBranding.upsert({
            where: { settingsId: "default" },
            create: {
                settingsId: "default",
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor,
                accentColor: data.accentColor,
                footerText: data.footerText,
                websiteUrl: data.websiteUrl,
                supportEmail: data.supportEmail
            },
            update: {
                logoUrl: data.logoUrl,
                primaryColor: data.primaryColor,
                accentColor: data.accentColor,
                footerText: data.footerText,
                websiteUrl: data.websiteUrl,
                supportEmail: data.supportEmail
            }
        })

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update email branding:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to update" }
    }
}
