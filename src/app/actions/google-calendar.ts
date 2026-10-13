"use server"

import { INTERNAL_getSecret } from "@/lib/ai/secrets"
import { logEmailAttempt } from "@/lib/email-logger"
import { TimeSlotAvailability, createCalendarEvent, getAvailableSlots } from "@/lib/google-calendar"
import { parseISO } from "date-fns"

export async function fetchAvailability(dateStr: string): Promise<{ success: boolean; error?: string; slots: TimeSlotAvailability[] }> {
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
import { getActiveInsuranceProviders } from "@/app/actions/insurance"
import { NotificationManager } from "@/lib/notifications/manager"
import { prisma } from "@/lib/prisma"
import { bookingLimiter } from "@/lib/rate-limit"
import { NotificationService } from "@/lib/services/notification-service"
import { Resend } from 'resend'

import { logAudit } from "@/lib/audit"
import { generateBookingAccessToken } from "@/lib/booking-access"
import { encrypt } from "@/lib/encryption"

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
    clientPhone?: string
    notes?: string
    serviceId: string
    serviceName: string
    clientTimezone?: string
    sessionType?: "virtual" | "in-person"
    /** Optional bespoke meal plan bought alongside the consultation. */
    addOnPlanId?: string
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
        let slots: TimeSlotAvailability[] = []
        try {
            slots = await getAvailableSlots(data.dateStr)
        } catch (availErr) {
            console.error("Availability check failed during booking:", availErr)
            return { success: false, error: "Unable to verify time slot availability. Please try again." }
        }

        const requestedSlot = slots.find(s => s.time === data.time)
        if (!requestedSlot || !requestedSlot.available) {
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
            meetLink = googleEvent.hangoutLink || googleEvent.conferenceData?.entryPoints?.find((e: any) => e.entryPointType === 'video')?.uri
            encryptedMeetLink = meetLink ? encrypt(meetLink) : undefined
        }

        // 3c. Generate Reference Code (with collision retry)
        const referenceCode = await generateUniqueReferenceCode()

        // Capability token binding this booking to the client's email. Every
        // self-service link (success screen, emails) must carry it.
        const normalisedEmail = data.clientEmail.trim().toLowerCase()
        const accessToken = generateBookingAccessToken(referenceCode, normalisedEmail)

        // 4. Save to Local Database
        // The incoming time is an absolute UTC ISO string, completely bypassing server timezone drift
        const scheduledAt = new Date(data.time)

        // Ensure we handle defaults if new fields are missing (though they are required in type)
        const clientTimezone = data.clientTimezone || "Africa/Nairobi"

        // Fetch service to snapshot the price at booking time
        const bookedService = data.serviceId ? await prisma.service.findUnique({
            where: { id: data.serviceId },
            select: { priceVirtual: true, priceInPerson: true }
        }) : null

        let expectedAmount = bookedService
            ? (data.sessionType === "in-person" ? bookedService.priceInPerson : bookedService.priceVirtual)
            : null

        // ── Meal plan add-on ────────────────────────────────────────────────
        // Priced into the booking's single total so the client enters one PIN for
        // both. Validated server-side: the browser supplies only an id, never a
        // price, and capacity is re-checked here because the widget's copy may be
        // seconds stale.
        let addOnPlan: { id: string; title: string; price: number; tier: string } | null = null

        if (data.addOnPlanId) {
            const candidate = await prisma.mealPlan.findFirst({
                where: {
                    id: data.addOnPlanId,
                    status: "PUBLISHED",
                    deletedAt: null,
                    tier: "PERSONALIZED",
                },
                select: { id: true, title: true, price: true, tier: true, capacityOverride: true },
            })

            if (candidate) {
                const { getPersonalizedCapacity } = await import("@/lib/meal-plans/settings")
                const capacity = await getPersonalizedCapacity(candidate.capacityOverride)

                // Silently dropping a sold-out add-on is the right call: the
                // consultation itself is still valid and must not fail because a
                // plan filled up between page load and submit.
                if (capacity.available) addOnPlan = candidate
            }
        }

        const addOnAmount = addOnPlan?.price ?? 0
        expectedAmount = expectedAmount === null || expectedAmount === undefined
            ? (addOnAmount > 0 ? addOnAmount : expectedAmount)
            : expectedAmount + addOnAmount

        const isFree = expectedAmount === 0

        // STK Push resolves in seconds, so a 45-minute hold needlessly freezes a
        // slot the customer has already abandoned. The manual Paybill flow genuinely
        // needs the longer window — the client has to leave the site, pay, and come
        // back — so the two rails get different deadlines.
        const platformSettings = await prisma.siteSettings.findUnique({
            where: { id: "default" },
            select: { mpesaStkEnabled: true },
        })
        const stkEnabled = platformSettings?.mpesaStkEnabled ?? false
        const holdMinutes = stkEnabled ? 15 : 45

        const paymentDeadline = isFree ? null : new Date(Date.now() + holdMinutes * 60 * 1000)

        try {
            await prisma.booking.create({
                data: {
                    clientName: data.clientName.trim(),
                    clientEmail: data.clientEmail.trim().toLowerCase(),
                    clientPhone: data.clientPhone?.trim() || undefined,
                    serviceId: data.serviceId,
                    serviceName: data.serviceName,
                    scheduledAt: scheduledAt,
                    duration: duration,
                    bookingStatus: isFree ? "CONFIRMED" : "PENDING",
                    notes: data.notes,
                    googleEventId: googleEvent?.id || undefined,
                    encryptedMeetLink: encryptedMeetLink,
                    sessionType: data.sessionType || "virtual",
                    // Keep the typed enum authoritative for reporting. Without this it
                    // stays at its VIRTUAL default and under-values in-person revenue.
                    type: data.sessionType === "in-person" ? "IN_PERSON" : "VIRTUAL",
                    referenceCode: referenceCode,
                    clientTimezone: clientTimezone,
                    expectedAmount: expectedAmount,
                    paymentDeadline: paymentDeadline
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

        // The order is created only after the booking row exists, so a failed
        // booking can never leave a dangling paid-for plan.
        if (addOnPlan) {
            try {
                const createdBooking = await prisma.booking.findUnique({
                    where: { referenceCode },
                    select: { id: true },
                })

                if (createdBooking) {
                    const { createMealPlanOrder } = await import("@/lib/meal-plans/orders")
                    await createMealPlanOrder({
                        mealPlanId: addOnPlan.id,
                        clientName: data.clientName.trim(),
                        clientEmail: data.clientEmail.trim().toLowerCase(),
                        clientPhone: data.clientPhone?.trim(),
                        linkedBookingId: createdBooking.id,
                        // Accepting the booking terms covers the add-on; the full
                        // clinical disclaimer is presented again at intake.
                        disclaimerAccepted: true,
                    })
                }
            } catch (addOnErr) {
                console.error("Add-on order creation failed (booking was saved):", addOnErr)
            }
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
            // Use INTERNAL_getSecret which reads from SecretConfig table (where the key is stored)
            const apiKey = await INTERNAL_getSecret("RESEND_API_KEY")

            const settings: any = await prisma.siteSettings.findUnique({
                where: { id: "default" },
                include: {
                    ResendConfig: true,
                    EmailBranding: true
                }
            })

            const fromEmail = settings?.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke"

            // Prepare Branding Data
            const branding = {
                logoUrl: settings?.EmailBranding?.logoUrl || null,
                primaryColor: settings?.EmailBranding?.primaryColor || "#556B2F",
                accentColor: settings?.EmailBranding?.accentColor || "#E87A1E",
                footerText: settings?.EmailBranding?.footerText || "Edwak Nutrition, Nairobi, Kenya",
                websiteUrl: settings?.EmailBranding?.websiteUrl || "https://edwaknutrition.co.ke",
                supportEmail: settings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke",
                clinicLocation: settings?.address,
                contactPhone: settings?.phoneNumber,
                paymentTill: settings?.paymentTillNumber,
                paymentPaybill: settings?.paymentPaybill,
                paymentAccountNumber: settings?.paymentAccountNumber,
                paymentAccountName: settings?.paymentAccountName
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
                const emailSubject = isFree 
                    ? `Booking Confirmed: ${data.serviceName} (#${referenceCode})`
                    : `Awaiting Payment: ${data.serviceName} (#${referenceCode})`

                try {
                    // Fetch active insurers to include in in-person booking confirmations
                    const insuranceProviders = await getActiveInsuranceProviders()
                    const acceptedInsurers = insuranceProviders.map(p => p.name)

                    await resend.emails.send({
                        from: `Edwak Nutrition <${fromEmail}>`,
                        to: data.clientEmail.trim(),
                        subject: emailSubject,
                        react: BookingConfirmationEmail({
                            clientName: data.clientName.trim(),
                            serviceName: data.serviceName,
                            date: clientFormattedDate,
                            time: `${clientFormattedTime} (${clientTimezone})`,
                            referenceCode: referenceCode,
                            sessionType: data.sessionType || "virtual",
                            branding: branding,
                            expectedAmount: expectedAmount,
                            isFree: isFree,
                            paymentMode: stkEnabled ? "stk" : "manual",
                            accessToken: accessToken,
                            acceptedInsurers
                        })
                    })
                    await logEmailAttempt({ recipientEmail: data.clientEmail, subject: emailSubject, context: "BOOKING_CONFIRMATION", entityId: referenceCode, success: true })
                } catch (emailErr) {
                    console.error("Booking confirmation email failed:", emailErr)
                    await logEmailAttempt({ recipientEmail: data.clientEmail, subject: emailSubject, context: "BOOKING_CONFIRMATION", entityId: referenceCode, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
                }
            } else {
                console.warn("Skipping email confirmation: No Resend API Key found in SecretConfig or ENV.")
            }

            // Notify Admin via Email (NotificationManager checks settings natively)
            await NotificationManager.sendAdminNotification("NEW_BOOKING", {
                newBooking: {
                    clientName: data.clientName.trim(),
                    clientEmail: data.clientEmail.trim(),
                    clientPhone: data.clientPhone,
                    serviceName: data.serviceName,
                    date: clientFormattedDate,
                    time: `${clientFormattedTime} (${clientTimezone})`,
                    referenceCode: referenceCode,
                    sessionType: data.sessionType || "virtual",
                    bookingUrl: `/admin/bookings`
                }
            })

            // In-App Bell Notification — broadcast to all admin users
            await NotificationService.broadcastToRoles({
                roles: ["SUPER_ADMIN", "ADMIN"],
                type: "SUCCESS",
                title: "New Booking Received",
                message: `${data.clientName.trim()} booked ${data.serviceName} on ${clientFormattedDate} at ${clientFormattedTime}.`,
                priority: "HIGH",
                link: `/admin/bookings`,
                expiresInDays: 7
            }).catch(console.error)

            // 7. Create corresponding Inquiry record for CRM visibility
            // This bridges the booking into the Inquiries page so admin can track follow-up
            try {
                await prisma.inquiry.create({
                    data: {
                        name: data.clientName.trim(),
                        email: data.clientEmail.trim().toLowerCase(),
                        message: `📅 Booking: ${data.serviceName}\n📆 ${clientFormattedDate} at ${clientFormattedTime} (${clientTimezone})\n🔖 Reference: ${referenceCode}\n📋 Session: ${data.sessionType || "virtual"}${data.clientPhone ? `\n📞 Phone: ${data.clientPhone}` : ""}`,
                        statusString: "NEW",
                    }
                })
            } catch (inquiryErr) {
                // Non-critical — booking is already saved
                console.error("Failed to create inquiry bridge for booking:", inquiryErr)
            }
        } catch (postBookingErr) {
            // Email/notification failures should NEVER crash the booking
            console.error("Post-booking steps failed (booking was saved):", postBookingErr)
        }

        return {
            success: true,
            referenceCode,
            accessToken,
            // Drives the checkout step: the widget needs to know whether to ask for
            // payment at all, and on which rail, without a second round trip.
            expectedAmount,
            isFree,
            stkEnabled,
            addOn: addOnPlan ? { title: addOnPlan.title, price: addOnPlan.price } : null,
            paymentDeadline,
            ...(googleEventError ? { warning: "Your booking is confirmed, but calendar sync encountered an issue. Our team will follow up." } : {})
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred"
        console.error("Booking Error:", message, error)
        return { success: false, error: `Booking failed: ${message}. Please try again or contact support.` }
    }
}
