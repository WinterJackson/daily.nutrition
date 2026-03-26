"use server"

import { setSecret } from "@/lib/ai/secrets"
import { verifySession } from "@/lib/auth"
import { encrypt } from "@/lib/encryption"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, RATE_LIMITS } from "@/lib/rate-limit"
import bcrypt from "bcryptjs"
import { revalidatePath, unstable_cache } from "next/cache"
import { EmailBrandingData } from "./email-branding"

const GLOBAL_SETTINGS_TAG = "global-settings"

export interface CloudinaryConfigData {
    cloudName: string
    apiKey: string
    apiSecret: string
    uploadPreset?: string
    hasSecret?: boolean
}
export interface EnvStatusMap {
    DATABASE_URL: boolean
    ENCRYPTION_KEY: boolean
    NEXT_PUBLIC_APP_URL: boolean
    RESEND_WEBHOOK_SECRET: boolean
}

export interface GoogleCalendarConfigData {
    eventDuration: number
    bufferTime: number
    minNotice: number
    availability: any
    clientEmail?: string
    privateKey?: string
}

export interface ResendConfigData {
    apiKey?: string
    fromEmail: string
}

export interface GeneralSettingsData {
    businessName: string
    contactEmail: string
    phoneNumber: string
    address: string
    latitude: number
    longitude: number
    googleMapsEmbedUrl: string
    pageTitle: string
    metaDescription: string
    keywords: string
    googleCalendarId: string
    themePreference: string
    profileImageUrl?: string | null
    googlePlaceId: string
    // Social & Legal
    instagramUrl: string
    facebookUrl: string
    twitterUrl: string
    linkedinUrl: string
    privacyPolicyContent: string
    termsContent: string
}

export interface SettingsData {
    businessName: string
    contactEmail: string
    phoneNumber: string
    address: string
    latitude: number
    longitude: number
    googleMapsEmbedUrl: string
    pageTitle: string
    metaDescription: string
    keywords: string
    profileImageUrl?: string | null
    themePreference: string
    googlePlaceId: string

    // Social & Legal
    instagramUrl: string
    facebookUrl: string
    twitterUrl: string
    linkedinUrl: string
    privacyPolicyContent: string
    termsContent: string

    // Google Calendar Config
    googleCalendarId: string
    googleCalendarConfig?: {
        eventDuration: number
        bufferTime: number
        minNotice: number
        availability: any // JSON
        // Optional credential updates
        clientEmail?: string
        privateKey?: string
        hasCredentials?: boolean
    }

    // Resend Config
    resendConfig?: {
        apiKey?: string
        fromEmail: string
        hasApiKey?: boolean // For UI state
    }

    hasGeminiKey: boolean

    // Email Branding
    emailBranding?: EmailBrandingData

    // Cloudinary Config
    cloudinaryConfig?: CloudinaryConfigData

    // Notification Preferences
    notificationPreferences?: NotificationPreferencesData

    // Optimistic Locking
    version?: number
}

export interface NotificationPreferencesData {
    emailOnNewBooking: boolean
    emailOnCancellation: boolean
    emailOnReschedule: boolean
    emailDailyAgenda: boolean
    agendaTime: string
}

export async function getSettings() {
    try {
        const getCached = unstable_cache(
            async () => {
                let settings = await prisma.siteSettings.findUnique({
                    where: { id: "default" },
                    include: {
                        GoogleCalendarConfig: true,
                        ResendConfig: true,
                        EmailBranding: true,
                        CloudinaryConfig: true,
                        NotificationPreferences: true
                    }
                })

                if (!settings) {
                    settings = await prisma.siteSettings.create({
                        data: {
                            id: "default",
                            businessName: "Edwak Nutrition",
                            contactEmail: "hello@edwaknutrition.co.ke",
                            phoneNumber: "+254 700 000000",
                            address: "Nairobi, Kenya",
                            latitude: -1.2921,
                            longitude: 36.8219,
                            googleMapsEmbedUrl: "",
                            pageTitle: "Edwak Nutrition | Expert Dietitian",
                            metaDescription: "Professional nutrition consulting and diet planning.",
                            keywords: "nutrition, health, diet, kenya",
                            themePreference: "light",
                            updatedAt: new Date()
                        },
                        include: {
                            GoogleCalendarConfig: true,
                            ResendConfig: true,
                            EmailBranding: true,
                            CloudinaryConfig: true,
                            NotificationPreferences: true
                        }
                    })
                }

                const { id: _id, updatedAt: _updatedAt, GoogleCalendarConfig, EmailBranding, CloudinaryConfig, NotificationPreferences, ResendConfig, version: _version, ...rest } = settings

                const result: SettingsData = {
                    ...rest,
                    hasGeminiKey: false,
                    latitude: settings.latitude,
                    longitude: settings.longitude,
                    googleMapsEmbedUrl: settings.googleMapsEmbedUrl,
                    instagramUrl: settings.instagramUrl,
                    facebookUrl: settings.facebookUrl,
                    twitterUrl: settings.twitterUrl,
                    linkedinUrl: settings.linkedinUrl,
                    privacyPolicyContent: settings.privacyPolicyContent,
                    termsContent: settings.termsContent,

                    googleCalendarConfig: GoogleCalendarConfig ? {
                        eventDuration: GoogleCalendarConfig.eventDuration,
                        bufferTime: GoogleCalendarConfig.bufferTime,
                        minNotice: GoogleCalendarConfig.minNotice,
                        availability: GoogleCalendarConfig.availability,
                        hasCredentials: !!(GoogleCalendarConfig.encryptedClientEmail && GoogleCalendarConfig.encryptedPrivateKey)
                    } : undefined,
                    resendConfig: ResendConfig ? {
                        fromEmail: ResendConfig.fromEmail,
                        hasApiKey: !!ResendConfig.encryptedApiKey
                    } : undefined,
                    emailBranding: EmailBranding ? {
                        logoUrl: EmailBranding.logoUrl,
                        primaryColor: EmailBranding.primaryColor,
                        accentColor: EmailBranding.accentColor,
                        footerText: EmailBranding.footerText,
                        websiteUrl: EmailBranding.websiteUrl,
                        supportEmail: EmailBranding.supportEmail
                    } : undefined,
                    cloudinaryConfig: CloudinaryConfig ? {
                        cloudName: CloudinaryConfig.cloudName,
                        apiKey: CloudinaryConfig.apiKey,
                        apiSecret: "",
                        uploadPreset: CloudinaryConfig.uploadPreset || undefined,
                        hasSecret: !!CloudinaryConfig.encryptedApiSecret
                    } : undefined,
                    notificationPreferences: NotificationPreferences ? {
                        emailOnNewBooking: NotificationPreferences.emailOnNewBooking,
                        emailOnCancellation: NotificationPreferences.emailOnCancellation,
                        emailOnReschedule: NotificationPreferences.emailOnReschedule,
                        emailDailyAgenda: NotificationPreferences.emailDailyAgenda,
                        agendaTime: NotificationPreferences.agendaTime
                    } : undefined,
                    version: settings.version
                }
                return result
            },
            [GLOBAL_SETTINGS_TAG],
            { tags: [GLOBAL_SETTINGS_TAG] }
        )

        return await getCached()
    } catch (error) {
        console.error("Failed to fetch settings:", error)
        return null
    }
}

export async function updateSettings(data: SettingsData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    // Rate limit settings updates per user
    const rateCheck = await checkRateLimit(session.user.id, "settings_write", RATE_LIMITS.apiStandard)
    if (!rateCheck.success) {
        return { success: false, error: "Too many requests. Please wait before updating settings again." }
    }

    try {
        // Separate nested config AND strip non-schema fields that getSettings() injects
        const { googleCalendarConfig, resendConfig, emailBranding, cloudinaryConfig, notificationPreferences, version: clientVersion, hasGeminiKey: _hasGeminiKey, calendarProvider: _calendarProvider, calendlyUrl: _calendlyUrl, savvycalUrl: _savvycalUrl, ...topLevelData } = data as any

        // Optimistic Locking: Verify version hasn't changed since page load
        if (clientVersion !== undefined) {
            const current = await prisma.siteSettings.findUnique({ where: { id: "default" }, select: { version: true } })
            if (current && current.version !== clientVersion) {
                return { success: false, error: "Settings were modified by another admin. Please refresh the page and try again." }
            }
        }

        // Prepare Google Config Payload
        let googleConfigPayload: any = undefined
        if (googleCalendarConfig) {
            const { clientEmail, privateKey, hasCredentials: _hasCredentials, ...restConfig } = googleCalendarConfig
            googleConfigPayload = { ...restConfig, updatedAt: new Date() }
            if (clientEmail?.trim()) googleConfigPayload.encryptedClientEmail = encrypt(clientEmail)
            if (privateKey?.trim()) googleConfigPayload.encryptedPrivateKey = encrypt(privateKey)
        }

        const now = new Date()

        // Upsert Main Settings
        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            update: {
                ...topLevelData,
                version: { increment: 1 },
                updatedAt: now,
                GoogleCalendarConfig: googleConfigPayload ? {
                    upsert: {
                        create: googleConfigPayload,
                        update: googleConfigPayload
                    }
                } : undefined
            },
            create: {
                id: "default",
                ...topLevelData,
                updatedAt: now,
                GoogleCalendarConfig: googleConfigPayload ? {
                    create: googleConfigPayload
                } : undefined
            },
        })

        // Upsert Resend Config
        if (settings && resendConfig) {
            const payload: any = { fromEmail: resendConfig.fromEmail, updatedAt: now }
            if (resendConfig.apiKey?.trim()) payload.encryptedApiKey = encrypt(resendConfig.apiKey)

            await prisma.resendConfig.upsert({
                where: { settingsId: settings.id },
                create: { settingsId: settings.id, ...payload },
                update: payload
            })
        }

        // Upsert Email Branding
        if (settings && emailBranding) {
            await prisma.emailBranding.upsert({
                where: { settingsId: settings.id },
                create: { settingsId: settings.id, ...emailBranding, updatedAt: now },
                update: { ...emailBranding, updatedAt: now }
            })
        }

        // Upsert Cloudinary Config
        if (settings && cloudinaryConfig) {
            const payload: any = {
                cloudName: cloudinaryConfig.cloudName,
                apiKey: cloudinaryConfig.apiKey,
                uploadPreset: cloudinaryConfig.uploadPreset,
                updatedAt: now
            }
            if (cloudinaryConfig.apiSecret?.trim()) {
                payload.encryptedApiSecret = encrypt(cloudinaryConfig.apiSecret)
            }

            await prisma.cloudinaryConfig.upsert({
                where: { settingsId: settings.id },
                create: { settingsId: settings.id, ...payload, encryptedApiSecret: payload.encryptedApiSecret || "" }, // Ensure secret is present on create
                update: payload
            })
        }

        // Upsert Notification Preferences
        if (settings && notificationPreferences) {
            await prisma.notificationPreferences.upsert({
                where: { settingsId: settings.id },
                create: { settingsId: settings.id, ...notificationPreferences, updatedAt: now },
                update: { ...notificationPreferences, updatedAt: now }
            })
        }

        revalidatePath("/", "layout")

        return { success: true, settings }
    } catch (error) {
        console.error("Failed to update settings:", error)
        return { success: false, error: error instanceof Error ? error.message : "Failed to update settings" }
    }
}

export async function updatePassword(data: any) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    // Rate limit password changes (same as auth — 5/min)
    const rateCheck = await checkRateLimit(session.user.id, "password_change", RATE_LIMITS.auth)
    if (!rateCheck.success) {
        return { success: false, error: "Too many password change attempts. Please wait." }
    }

    try {
        const { currentPassword, newPassword } = data

        // Get user (assuming single admin for now or first user found)
        // In real app, get session user
        const user = await prisma.user.findFirst()
        if (!user) throw new Error("User not found")

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password)
        if (!isValid) throw new Error("Incorrect current password")

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        // Invalidate all sessions to force re-login on all devices for security
        await prisma.session.deleteMany({
            where: { userId: session.user.id }
        })

        return { success: true }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : "Failed to update password" }
    }
}

export async function exportUserData() {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const [bookings, inquiries, posts, services] = await Promise.all([
            prisma.booking.findMany(),
            prisma.inquiry.findMany(),
            prisma.blogPost.findMany(),
            prisma.service.findMany()
        ])

        const data = {
            exportDate: new Date().toISOString(),
            bookings,
            inquiries,
            posts,
            services
        }

        return { success: true, data: JSON.stringify(data, null, 2) }
    } catch (error) {
        console.error("Export failed:", error)
        return { success: false, error: "Failed to export data" }
    }
}

// Granular Actions

export async function getServerEnvStatus() {
    const session = await verifySession()
    if (!session) return null

    return {
        DATABASE_URL: !!process.env.POSTGRES_URL,
        ENCRYPTION_KEY: !!process.env.ENCRYPTION_KEY,
        NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
        RESEND_WEBHOOK_SECRET: !!process.env.RESEND_WEBHOOK_SECRET,
    }
}

export async function upsertIntegrationSecrets(secrets: { key: string; value: string }[]) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        for (const secret of secrets) {
            if (secret.value.trim()) {
                await setSecret(secret.key, secret.value.trim())

                // Audit log for security
                await prisma.auditLog.create({
                    data: {
                        action: "SECRET_UPDATED",
                        entity: "Integration",
                        entityId: secret.key,
                        userId: session.user.id,
                        metadata: { key: secret.key }
                    }
                })
            }
        }
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to upsert secrets:", error)
        return { success: false, error: "Failed to securely save integrations" }
    }
}

export async function updateGeneralSettings(data: GeneralSettingsData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const now = new Date()
        await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default", updatedAt: now },
            update: {}
        })

        await prisma.siteSettings.update({
            where: { id: "default" },
            data: { ...data, updatedAt: now }
        })
        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update general settings:", error)
        return { success: false, error: "Failed to update general settings" }
    }
}

export async function updateGoogleCalendarConfig(data: GoogleCalendarConfigData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const { clientEmail, privateKey, ...restConfig } = data
        const payload: any = { ...restConfig }

        if (clientEmail?.trim()) payload.encryptedClientEmail = encrypt(clientEmail)
        if (privateKey?.trim()) payload.encryptedPrivateKey = encrypt(privateKey)

        const now = new Date()
        payload.updatedAt = now

        // Ensure settings exist
        await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default", updatedAt: now },
            update: {}
        })

        // Upsert Google Config
        await prisma.siteSettings.update({
            where: { id: "default" },
            data: {
                updatedAt: now,
                GoogleCalendarConfig: {
                    upsert: {
                        create: payload,
                        update: payload
                    }
                }
            }
        })

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update Google Calendar config:", error)
        return { success: false, error: "Failed to update Google Calendar settings" }
    }
}

export async function updateResendConfig(data: ResendConfigData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const payload: any = { fromEmail: data.fromEmail }
        if (data.apiKey?.trim()) payload.encryptedApiKey = encrypt(data.apiKey)

        const now = new Date()
        payload.updatedAt = now

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default", updatedAt: now },
            update: {}
        })

        await prisma.resendConfig.upsert({
            where: { settingsId: settings.id },
            create: { settingsId: settings.id, ...payload },
            update: payload
        })

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update Resend config:", error)
        return { success: false, error: "Failed to update Resend settings" }
    }
}

export async function updateCloudinaryConfig(data: CloudinaryConfigData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const payload: any = {
            cloudName: data.cloudName,
            apiKey: data.apiKey,
            uploadPreset: data.uploadPreset
        }
        if (data.apiSecret?.trim()) {
            payload.encryptedApiSecret = encrypt(data.apiSecret)
        }

        const now = new Date()
        payload.updatedAt = now

        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default", updatedAt: now },
            update: {}
        })

        await prisma.cloudinaryConfig.upsert({
            where: { settingsId: settings.id },
            create: { settingsId: settings.id, ...payload, encryptedApiSecret: payload.encryptedApiSecret || "" },
            update: payload
        })

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update Cloudinary config:", error)
        return { success: false, error: "Failed to update Cloudinary settings" }
    }
}

export async function updateNotificationPreferences(data: NotificationPreferencesData) {
    const session = await verifySession()
    if (!session) {
        return { success: false, error: "Unauthorized" }
    }

    try {
        const now = new Date()
        const settings = await prisma.siteSettings.upsert({
            where: { id: "default" },
            create: { id: "default", updatedAt: now },
            update: {}
        })

        // Ensure updatedAt is present for preferences (it has @updatedAt but nice to be explicit or if upsert needs it)
        // NotificationPreferences in schema HAS @updatedAt, so technically not needed, but SiteSettings does NOT.

        await prisma.notificationPreferences.upsert({
            where: { settingsId: settings.id },
            create: { settingsId: settings.id, ...data },
            update: data
        })

        revalidatePath("/admin/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update Notification preferences:", error)
        return { success: false, error: "Failed to update notification settings" }
    }
}
