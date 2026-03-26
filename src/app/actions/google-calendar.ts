"use server"

import { logEmailAttempt } from "@/lib/email-logger"
import { createCalendarEvent, getAvailableSlots } from "@/lib/google-calendar"
import { parseISO } from "date-fns"

export async function fetchAvailability(dateStr: string) {
    try {
        const slots = await getAvailableSlots(dateStr)
        return { success: true, slots }
    } catch (error) {
        console.error("Availability Error:", error)
        // Return empty slots on error rather than crashing UI
        return { success: false, error: error instanceof Error ? error.message : "Failed to fetch availability", slots: [] }
    }
}

import { BookingConfirmationEmail } from "@/components/emails/BookingConfirmation"
import { NotificationManager } from "@/lib/notifications/manager"
import { prisma } from "@/lib/prisma"
import { bookingLimiter } from "@/lib/rate-limit"
import { Resend } from 'resend'

import { logAudit } from "@/lib/audit"
import { decrypt, encrypt } from "@/lib/encryption"

// Removed top-level Resend init to prevent crashes if API key is missing
// const resend = new Resend(process.env.RESEND_API_KEY)

/**
 * Generate a unique reference code with collision retry
 */
async function generateUniqueReferenceCode(maxRetries = 3): Promise<string> {
    for (let i = 0; i < maxRetries; i++) {
        const code = "DN-" + Math.random().toString(36).substring(2, 8).toUpperCase()
        const existing = await prisma.booking.findUnique({ where: { referenceCode: code } })
        if (!existing) return code
    }
    // Fallback: timestamp-based code for guaranteed uniqueness
    return "DN-" + Date.now().toString(36).toUpperCase().slice(-6)
}

export async function bookAppointment(data: {
    dateStr: string
    time: string
    clientName: string
    clientEmail: string
    notes?: string
    serviceName: string
    clientTimezone?: string
    sessionType?: "virtual" | "in-person"
}) {
    try {
        // 0. Rate Limit — prevent booking spam
        const rateCheck = await bookingLimiter(data.clientEmail.toLowerCase().trim())
        if (!rateCheck.success) {
            return { success: false, error: "Too many booking requests. Please wait a few minutes before trying again." }
        }

        // 0b. Input Validation
        if (!data.clientName?.trim()) {
            return { success: false, error: "Please enter your name." }
        }
        if (!data.clientEmail?.trim() || !data.clientEmail.includes("@")) {
            return { success: false, error: "Please enter a valid email address." }
        }
        if (!data.dateStr || !data.time) {
            return { success: false, error: "Please select a date and time." }
        }
        if (!data.serviceName?.trim()) {
            return { success: false, error: "Please select a service." }
        }

        // 1. Double-Booking Guard: Verify slot is still open
        let slots: string[] = []
        try {
            slots = await getAvailableSlots(data.dateStr)
        } catch (availErr) {
            console.error("Availability check failed during booking:", availErr)
            return { success: false, error: "Unable to verify time slot availability. Please try again." }
        }

        if (!slots.includes(data.time)) {
            return { success: false, error: "This time slot was just taken. Please choose another." }
        }

        const date = parseISO(data.dateStr)

        // 2. Create Google Calendar Event (resilient — booking continues even if GCal fails)
        let googleEvent: any = null
        let googleEventError: string | null = null
        try {
            googleEvent = await createCalendarEvent(
                date,
                data.time,
                {
                    name: data.clientName.trim(),
                    email: data.clientEmail.trim(),
                    notes: data.notes
                },
                data.serviceName,
                // Enforce 15 mins for Discovery Call
                data.serviceName.toLowerCase().includes("discovery") ? 15 : undefined
            )
        } catch (gcalErr) {
            console.error("Google Calendar event creation failed (booking will continue):", gcalErr)
            googleEventError = gcalErr instanceof Error ? gcalErr.message : "Calendar sync failed"
        }

        // 3. Calculate duration from event times (if available) or default
        let duration = 30
        if (googleEvent?.start?.dateTime && googleEvent?.end?.dateTime) {
            const start = new Date(googleEvent.start.dateTime).getTime()
            const end = new Date(googleEvent.end.dateTime).getTime()
            duration = (end - start) / 60000
        } else if (data.serviceName.toLowerCase().includes("discovery")) {
            duration = 15
        }

        // 3b. Extract and encrypt Meet Link early for DB storage
        let encryptedMeetLink: string | undefined
        let meetLink: string | undefined
        if (googleEvent) {
            meetLink = googleEvent.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || googleEvent.htmlLink
            encryptedMeetLink = meetLink ? encrypt(meetLink) : undefined
        }

        // 3c. Generate Reference Code (with collision retry)
        const referenceCode = await generateUniqueReferenceCode()

        // 4. Save to Local Database
        // The incoming time is an absolute UTC ISO string, completely bypassing server timezone drift
        const scheduledAt = new Date(data.time)

        // Ensure we handle defaults if new fields are missing (though they are required in type)
        const clientTimezone = data.clientTimezone || "Africa/Nairobi"

        try {
            await prisma.booking.create({
                data: {
                    clientName: data.clientName.trim(),
                    clientEmail: data.clientEmail.trim().toLowerCase(),
                    serviceName: data.serviceName,
                    scheduledAt: scheduledAt,
                    duration: duration,
                    bookingStatus: "CONFIRMED",
                    notes: data.notes,
                    googleEventId: googleEvent?.id || undefined,
                    encryptedMeetLink: encryptedMeetLink,
                    sessionType: data.sessionType || "virtual",
                    referenceCode: referenceCode,
                    clientTimezone: clientTimezone
                }
            })
        } catch (dbErr) {
            console.error("Database save failed during booking:", dbErr)
            // If GCal event was created but DB save failed, log it for manual cleanup
            if (googleEvent?.id) {
                console.error(`ORPHANED GOOGLE EVENT: ${googleEvent.id} — DB save failed, manual cleanup needed`)
            }
            return { success: false, error: "Failed to save your booking. Please try again or contact support." }
        }

        logAudit({
            action: "BOOKING_CREATED_VIA_GCAL",
            entity: "Booking",
            entityId: referenceCode,
            metadata: {
                clientName: data.clientName,
                serviceName: data.serviceName,
                googleCalendarSynced: !googleEventError,
                ...(googleEventError ? { googleEventError } : {})
            },
        })

        // 5. Send Confirmation Email via Resend (non-blocking — should never crash the booking)
        try {
            const settings = await prisma.siteSettings.findUnique({
                where: { id: "default" },
                include: {
                    ResendConfig: true,
                    EmailBranding: true
                }
            })

            let apiKey = process.env.RESEND_API_KEY
            let fromEmail = "onboarding@resend.dev"

            if (settings?.ResendConfig?.encryptedApiKey) {
                try {
                    const decrypted = decrypt(settings.ResendConfig.encryptedApiKey)
                    if (decrypted) apiKey = decrypted
                } catch (e) {
                    console.error("Failed to decrypt Resend API key", e)
                }
                if (settings.ResendConfig.fromEmail) {
                    fromEmail = settings.ResendConfig.fromEmail
                }
            }

            // Prepare Branding Data
            const branding = {
                logoUrl: settings?.EmailBranding?.logoUrl || null,
                primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
                accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
                footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition, Nairobi, Kenya",
                websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                supportEmail: settings?.EmailBranding?.supportEmail || "support@edwaknutrition.co.ke"
            }

            // Format Date/Time in Client Timezone
            const clientFormattedTime = scheduledAt.toLocaleTimeString('en-US', {
                timeZone: clientTimezone,
                hour: 'numeric',
                minute: '2-digit'
            })

            const clientFormattedDate = scheduledAt.toLocaleDateString('en-US', {
                timeZone: clientTimezone,
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })

            if (apiKey) {
                const resend = new Resend(apiKey)
                const emailMeetLink = meetLink || ""
                const emailSubject = `Booking Confirmed: ${data.serviceName} (#${referenceCode})`

                try {
                    await resend.emails.send({
                        from: `Edwak Nutrition <${fromEmail}>`,
                        to: data.clientEmail.trim(),
                        subject: emailSubject,
                        react: BookingConfirmationEmail({
                            clientName: data.clientName.trim(),
                            serviceName: data.serviceName,
                            date: clientFormattedDate,
                            time: `${clientFormattedTime} (${clientTimezone})`,
                            meetLink: emailMeetLink,
                            referenceCode: referenceCode,
                            sessionType: data.sessionType || "virtual",
                            branding: branding
                        })
                    })
                    await logEmailAttempt({ recipientEmail: data.clientEmail, subject: emailSubject, context: "BOOKING_CONFIRMATION", entityId: referenceCode, success: true })
                } catch (emailErr) {
                    console.error("Booking confirmation email failed:", emailErr)
                    await logEmailAttempt({ recipientEmail: data.clientEmail, subject: emailSubject, context: "BOOKING_CONFIRMATION", entityId: referenceCode, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
                }
            } else {
                console.warn("Skipping email confirmation: No Resend API Key found in DB or ENV.")
            }

            // Notify Admin (NotificationManager checks settings natively)
            await NotificationManager.sendAdminNotification("NEW_BOOKING", {
                newBooking: {
                    clientName: data.clientName.trim(),
                    serviceName: data.serviceName,
                    date: clientFormattedDate,
                    time: `${clientFormattedTime} (${clientTimezone})`,
                    bookingUrl: `/admin/bookings/${referenceCode}`
                }
            })
        } catch (postBookingErr) {
            // Email/notification failures should NEVER crash the booking
            console.error("Post-booking steps failed (booking was saved):", postBookingErr)
        }

        return {
            success: true,
            referenceCode,
            ...(googleEventError ? { warning: "Your booking is confirmed, but calendar sync encountered an issue. Our team will follow up." } : {})
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred"
        console.error("Booking Error:", message, error)
        return { success: false, error: `Booking failed: ${message}. Please try again or contact support.` }
    }
}

