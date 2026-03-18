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
import { Resend } from 'resend'

import { logAudit } from "@/lib/audit"
import { decrypt, encrypt } from "@/lib/encryption"

// Removed top-level Resend init to prevent crashes if API key is missing
// const resend = new Resend(process.env.RESEND_API_KEY)

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
        // 0. Double-Booking Guard: Verify slot is still open EAT natively
        const slots = await getAvailableSlots(data.dateStr)
        if (!slots.includes(data.time)) {
            return { success: false, error: "This time slot was just taken. Please choose another." }
        }

        const date = parseISO(data.dateStr)

        // 1. Create Google Calendar Event
        const googleEvent = await createCalendarEvent(
            date,
            data.time,
            {
                name: data.clientName,
                email: data.clientEmail,
                notes: data.notes
            },
            data.serviceName,
            // Enforce 15 mins for Discovery Call
            data.serviceName.toLowerCase().includes("discovery") ? 15 : undefined
        )

        // 2. Calculate duration from event times (if available) or default
        let duration = 30
        if (googleEvent.start?.dateTime && googleEvent.end?.dateTime) {
            const start = new Date(googleEvent.start.dateTime).getTime()
            const end = new Date(googleEvent.end.dateTime).getTime()
            duration = (end - start) / 60000
        } else if (data.serviceName.toLowerCase().includes("discovery")) {
            duration = 15;
        }

        // 2b. Extract and encrypt Meet Link early for DB storage
        const meetLink = googleEvent.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || googleEvent.htmlLink;
        const encryptedMeetLink = meetLink ? encrypt(meetLink) : undefined;

        // 2c. Generate Reference Code
        const referenceCode = "DN-" + Math.random().toString(36).substring(2, 8).toUpperCase();

        // 3. Save to Local Database
        // The incoming time is an absolute UTC ISO string, completely bypassing server timezone drift
        const scheduledAt = new Date(data.time)

        // Ensure we handle defaults if new fields are missing (though they are required in type)
        const clientTimezone = data.clientTimezone || "Africa/Nairobi"

        await prisma.booking.create({
            data: {
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                serviceName: data.serviceName,
                scheduledAt: scheduledAt,
                duration: duration,
                bookingStatus: "CONFIRMED",
                notes: data.notes,
                googleEventId: googleEvent.id || undefined,
                encryptedMeetLink: encryptedMeetLink,
                sessionType: data.sessionType || "virtual", // Use client-selected value
                referenceCode: referenceCode,
                clientTimezone: clientTimezone
            }
        })

        logAudit({
            action: "BOOKING_CREATED_VIA_GCAL",
            entity: "Booking",
            entityId: referenceCode,
            metadata: { clientName: data.clientName, serviceName: data.serviceName },
        })

        // 4. Send Confirmation Email via Resend
        // Fetch DB Config first
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
        // data.time and date are in Admin Time (EAT). We need to convert that to Client Timezone.
        // Step 1: Combine to ISO string assuming Admin Time (EAT +3)
        // Since scheduledAt is a Date object, it uses local server time. We'll rely on Intl to format it to client TZ.

        const clientFormattedTime = scheduledAt.toLocaleTimeString('en-US', {
            timeZone: clientTimezone,
            hour: 'numeric',
            minute: '2-digit'
        });

        const clientFormattedDate = scheduledAt.toLocaleDateString('en-US', {
            timeZone: clientTimezone,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        if (apiKey) {
            const resend = new Resend(apiKey)
            const meetLink = googleEvent.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri || googleEvent.htmlLink;
            const emailSubject = `Booking Confirmed: ${data.serviceName} (#${referenceCode})`

            try {
                await resend.emails.send({
                    from: `Edwak Nutrition <${fromEmail}>`,
                    to: data.clientEmail,
                    subject: emailSubject,
                    react: BookingConfirmationEmail({
                        clientName: data.clientName,
                        serviceName: data.serviceName,
                        date: clientFormattedDate,
                        time: `${clientFormattedTime} (${clientTimezone})`,
                        meetLink: meetLink || "",
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
                clientName: data.clientName,
                serviceName: data.serviceName,
                date: clientFormattedDate,
                time: `${clientFormattedTime} (${clientTimezone})`,
                bookingUrl: `/admin/bookings/${referenceCode}`
            }
        });

        return { success: true, referenceCode }
    } catch (error) {
        console.error("Booking Error:", error)
        return { success: false, error: "Failed to book appointment" }
    }
}
