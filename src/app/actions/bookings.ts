"use server"

import { BookingCancellationEmail } from "@/components/emails/BookingCancellation"
import { BookingRescheduledEmail } from "@/components/emails/BookingRescheduled"
import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { logEmailAttempt } from "@/lib/email-logger"
import { deleteCalendarEvent } from "@/lib/google-calendar"
import { NotificationManager } from "@/lib/notifications/manager"
import { prisma } from "@/lib/prisma"
import { bookingLimiter } from "@/lib/rate-limit"
import { revalidatePath, revalidateTag } from "next/cache"
import { Resend } from "resend"

export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

export interface BookingData {
    clientName: string
    clientEmail: string
    clientPhone?: string
    serviceId?: string
    serviceName: string
    sessionType: "virtual" | "in-person"
    scheduledAt: Date
    duration?: number
    status?: BookingStatus
    notes?: string
}

/**
 * Get bookings with robust server-side pagination, search, and filtering.
 * All filtering happens at the DB level via Prisma — NO client-side filtering.
 */
export async function getBookings(
    filter?: "all" | "upcoming" | "past" | "today",
    page: number = 1,
    pageSize: number = 10,
    search?: string,
    statusFilter?: string
) {
    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

        // Always exclude soft-deleted bookings
        const conditions: any[] = [{ deletedAt: null }]

        // Time-range filter
        switch (filter) {
            case "upcoming":
                conditions.push({ scheduledAt: { gte: now } })
                break
            case "past":
                conditions.push({ scheduledAt: { lt: now } })
                break
            case "today":
                conditions.push({ scheduledAt: { gte: startOfToday, lt: endOfToday } })
                break
        }

        // Status filter (e.g. "CONFIRMED", "CANCELLED")
        if (statusFilter && statusFilter !== "ALL") {
            conditions.push({ bookingStatus: statusFilter })
        }

        // Server-side search across key text fields
        if (search && search.trim()) {
            const q = search.trim()
            conditions.push({
                OR: [
                    { clientName: { contains: q, mode: "insensitive" } },
                    { clientEmail: { contains: q, mode: "insensitive" } },
                    { serviceName: { contains: q, mode: "insensitive" } },
                    { referenceCode: { contains: q, mode: "insensitive" } },
                ]
            })
        }

        const where = { AND: conditions }

        // Execute count + paginated query in parallel for efficiency
        const [totalCount, bookingsData] = await Promise.all([
            prisma.booking.count({ where }),
            prisma.booking.findMany({
                where,
                orderBy: { scheduledAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            })
        ])

        const { decrypt } = await import("@/lib/encryption")

        // Normalize bookingStatus to status for the UI and decrypt meet links securely
        const bookings = bookingsData.map(b => {
            let pureMeetLink: string | undefined = undefined;
            if (b.encryptedMeetLink) {
                try {
                    pureMeetLink = decrypt(b.encryptedMeetLink)
                } catch (e) {
                    console.error("Failed to decrypt meet link for admin:", e)
                }
            }
            return {
                ...b,
                status: b.bookingStatus,
                meetLink: pureMeetLink
            }
        })

        return { bookings, totalCount, error: null }
    } catch (error) {
        console.error("Failed to fetch bookings:", error instanceof Error ? error.message : String(error))
        return {
            bookings: [],
            totalCount: 0,
            error: "Failed to fetch bookings"
        }
    }
}

/**
 * Get a single booking by ID
 */
export async function getBooking(id: string) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id }
        })
        return { booking, error: null }
    } catch (error) {
        console.warn("Failed to fetch booking:", error instanceof Error ? error.message : String(error))
        return { booking: null, error: "Failed to fetch booking" }
    }
}

/**
 * Create a new booking (used by webhook or manual entry)
 */
export async function createBooking(data: BookingData) {
    try {
        // Rate limit by client email to prevent booking spam
        const rateCheck = await bookingLimiter(data.clientEmail.toLowerCase())
        if (!rateCheck.success) {
            return { success: false, error: "Too many booking requests. Please wait before trying again." }
        }

        // Snapshot the exact Service pricing to rigidly decouple historic revenue from future Admin DB updates
        let finalAmountPaid = null;
        if (data.serviceId) {
            const service = await prisma.service.findUnique({
                where: { id: data.serviceId },
                select: { priceVirtual: true, priceInPerson: true }
            })
            if (service) {
                finalAmountPaid = data.sessionType === "in-person"
                    ? service.priceInPerson
                    : service.priceVirtual;
            }
        }

        const booking = await prisma.booking.create({
            data: {
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                serviceId: data.serviceId,
                serviceName: data.serviceName,
                sessionType: data.sessionType,
                scheduledAt: data.scheduledAt,
                duration: data.duration || 60,
                bookingStatus: data.status || "CONFIRMED",
                notes: data.notes,
                amountPaid: finalAmountPaid,
            }
        })

        revalidatePath("/admin/bookings")
        revalidateTag("dashboard", "max")

        logAudit({
            action: "BOOKING_CREATED",
            entity: "Booking",
            entityId: booking.id,
            metadata: { clientName: data.clientName, serviceName: data.serviceName },
        })

        return { success: true, booking }
    } catch (error) {
        console.warn("Failed to create booking:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to create booking" }
    }
}

/**
 * Update booking status
 */
export async function updateBookingStatus(id: string, status: BookingStatus) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Fetch prior booking state to inspect calendar linkage
        const existingBooking = await prisma.booking.findUnique({
            where: { id },
            select: { googleEventId: true, bookingStatus: true }
        })

        const booking = await prisma.booking.update({
            where: { id },
            data: { bookingStatus: status }
        })

        // Edge Case: If an admin explicitly uses a generic dropdown to change Status -> CANCELLED, cleanly decouple the blocked calendar slot to prevent ghost meetings.
        if (status === "CANCELLED" && existingBooking?.bookingStatus !== "CANCELLED" && existingBooking?.googleEventId) {
            try {
                const { deleteCalendarEvent } = await import("@/lib/google-calendar")
                await deleteCalendarEvent(existingBooking.googleEventId)
            } catch (gcErr) {
                console.warn("Failed to delete Google Calendar event during generic status update:", gcErr)
            }
        }

        revalidatePath("/admin/bookings")
        revalidateTag("dashboard", "max")

        logAudit({
            action: "BOOKING_STATUS_UPDATED",
            entity: "Booking",
            entityId: id,
            metadata: { newStatus: status },
        })

        return { success: true, booking }
    } catch (error) {
        console.warn("Failed to update booking status:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to update status" }
    }
}

/**
 * Update booking notes
 */
export async function updateBookingNotes(id: string, notes: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: { notes }
        })

        revalidatePath("/admin/bookings")
        return { success: true, booking }
    } catch (error) {
        console.warn("Failed to update booking notes:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to update notes" }
    }
}

/**
 * Delete a booking
 */
export async function deleteBooking(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            select: { googleEventId: true }
        })

        await prisma.booking.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        if (booking?.googleEventId) {
            try {
                await deleteCalendarEvent(booking.googleEventId)
            } catch (gcErr) {
                console.error("Failed to delete Google Calendar event during admin deletion:", gcErr)
            }
        }

        logAudit({
            action: "BOOKING_DELETED",
            entity: "Booking",
            entityId: id,
        })

        revalidatePath("/admin/bookings")
        revalidateTag("dashboard", "max")
        return { success: true }
    } catch (error) {
        console.warn("Failed to delete booking:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to delete booking" }
    }
}



/**
 * Get booking statistics for dashboard
 */
export async function getBookingStats() {
    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

        const notDeleted = { deletedAt: null }
        const [total, upcoming, today, completed] = await Promise.all([
            prisma.booking.count({ where: notDeleted }),
            prisma.booking.count({ where: { ...notDeleted, scheduledAt: { gte: now }, bookingStatus: "CONFIRMED" } }),
            prisma.booking.count({ where: { ...notDeleted, scheduledAt: { gte: startOfToday, lt: endOfToday } } }),
            prisma.booking.count({ where: { ...notDeleted, bookingStatus: "COMPLETED" } }),
        ])

        return { total, upcoming, today, completed }
    } catch (error) {
        console.error("Failed to fetch booking stats:", error instanceof Error ? error.message : String(error))
        return { total: 0, upcoming: 0, today: 0, completed: 0 }
    }
}

/**
 * Helper to get Resend client and branding for admin booking actions
 */
async function getEmailConfig() {
    // Read API key from SecretConfig table (where it's actually stored)
    const { INTERNAL_getSecret } = await import("@/lib/ai/secrets")
    const apiKey = await INTERNAL_getSecret("RESEND_API_KEY")

    if (!apiKey) return null

    const settings: any = await prisma.siteSettings.findUnique({
        where: { id: "default" },
        include: { ResendConfig: true, EmailBranding: true }
    })

    const resend = new Resend(apiKey)
    const fromEmail = settings?.ResendConfig?.fromEmail || "no-reply@edwaknutrition.co.ke"
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
        paymentAccountNumber: settings?.paymentAccountNumber
    }

    return { resend, fromEmail, branding }
}

/**
 * Admin: Cancel a booking with full GCal sync + email + notification
 */
export async function adminCancelBooking(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const booking = await prisma.booking.update({
            where: { id },
            data: { bookingStatus: "CANCELLED" }
        })

        // Delete from Google Calendar if linked
        if (booking.googleEventId) {
            try {
                await deleteCalendarEvent(booking.googleEventId)
            } catch (gcErr) {
                console.error("Failed to delete Google Calendar event during admin cancellation:", gcErr)
            }
        }

        // Send cancellation email to the client
        const emailConfig = await getEmailConfig()
        if (emailConfig) {
            const clientTimezone = booking.clientTimezone || "Africa/Nairobi"
            const scheduledDate = new Date(booking.scheduledAt)

            const formattedDate = scheduledDate.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
                timeZone: clientTimezone
            })
            const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", timeZone: clientTimezone
            })

            const emailSubject = `Booking Cancelled: ${booking.serviceName}`
            try {
                await emailConfig.resend.emails.send({
                    from: `Edwak Nutrition <${emailConfig.fromEmail}>`,
                    to: booking.clientEmail,
                    subject: emailSubject,
                    react: BookingCancellationEmail({
                        clientName: booking.clientName,
                        serviceName: booking.serviceName,
                        date: formattedDate,
                        time: `${formattedTime} (${clientTimezone})`,
                        branding: emailConfig.branding,
                        bookingUrl: `${emailConfig.branding.websiteUrl}/booking`
                    })
                })
                await logEmailAttempt({ recipientEmail: booking.clientEmail, subject: emailSubject, context: "BOOKING_CANCELLATION", entityId: booking.referenceCode || booking.id, success: true })
            } catch (emailErr) {
                console.error("Cancellation email failed:", emailErr)
                await logEmailAttempt({ recipientEmail: booking.clientEmail, subject: emailSubject, context: "BOOKING_CANCELLATION", entityId: booking.referenceCode || booking.id, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
            }
        }

        logAudit({
            action: "BOOKING_CANCELLED",
            entity: "Booking",
            entityId: id,
            metadata: { referenceCode: booking.referenceCode, clientName: booking.clientName },
        })

        await NotificationManager.sendAdminNotification("BOOKING_CANCELLED", {
            bookingCancelled: {
                clientName: booking.clientName,
                clientEmail: booking.clientEmail,
                serviceName: booking.serviceName,
                referenceCode: booking.referenceCode || id
            }
        })

        revalidatePath("/admin/bookings")
        return { success: true }
    } catch (error) {
        console.error("Admin Cancel Booking Error:", error)
        return { success: false, error: "Failed to cancel booking" }
    }
}

/**
 * Admin: Reschedule a booking with GCal sync + branded email + notification
 */
export async function adminRescheduleBooking(id: string, newDateStr: string, newTime: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const booking = await prisma.booking.findUnique({ where: { id } })
        if (!booking) return { success: false, error: "Booking not found" }

        // Verify slot is available
        const { getAvailableSlots } = await import("@/lib/google-calendar")
        const slots = await getAvailableSlots(newDateStr)
        const reqSlot = slots.find(s => s.time === newTime)
        if (!reqSlot || !reqSlot.available) {
            return { success: false, error: "This time slot is no longer available." }
        }

        const newScheduledAt = new Date(newTime)
        if (newScheduledAt <= new Date()) {
            return { success: false, error: "New time must be in the future." }
        }

        // Store old time for email
        const oldScheduledAt = new Date(booking.scheduledAt)
        const clientTimezone = booking.clientTimezone || "Africa/Nairobi"

        const oldFormattedDate = oldScheduledAt.toLocaleDateString("en-US", {
            weekday: "long", month: "long", day: "numeric", year: "numeric",
            timeZone: clientTimezone
        })
        const oldFormattedTime = oldScheduledAt.toLocaleTimeString("en-US", {
            hour: "numeric", minute: "2-digit", timeZone: clientTimezone
        })

        // Update DB
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { scheduledAt: newScheduledAt }
        })

        // Update Google Calendar if linked
        if (updatedBooking.googleEventId) {
            try {
                const { updateCalendarEvent } = await import("@/lib/google-calendar")
                await updateCalendarEvent(updatedBooking.googleEventId, newTime, Math.round(updatedBooking.duration))
            } catch (gcErr) {
                console.error("Failed to update Google Calendar event during admin reschedule:", gcErr)
            }
        }

        // Send branded reschedule email
        const emailConfig = await getEmailConfig()
        if (emailConfig) {
            const newFormattedDate = newScheduledAt.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
                timeZone: clientTimezone
            })
            const newFormattedTime = newScheduledAt.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", timeZone: clientTimezone
            })

            const emailSubject = `Booking Rescheduled: ${updatedBooking.serviceName} (#${updatedBooking.referenceCode || ""})`
            try {
                await emailConfig.resend.emails.send({
                    from: `Edwak Nutrition <${emailConfig.fromEmail}>`,
                    to: updatedBooking.clientEmail,
                    subject: emailSubject,
                    react: BookingRescheduledEmail({
                        clientName: updatedBooking.clientName,
                        serviceName: updatedBooking.serviceName,
                        oldDate: oldFormattedDate,
                        oldTime: `${oldFormattedTime} (${clientTimezone})`,
                        newDate: newFormattedDate,
                        newTime: `${newFormattedTime} (${clientTimezone})`,
                        referenceCode: updatedBooking.referenceCode || "",
                        manageUrl: `${emailConfig.branding.websiteUrl}/booking/manage/${updatedBooking.referenceCode || ""}`,
                        branding: emailConfig.branding
                    })
                })
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "BOOKING_RESCHEDULED", entityId: updatedBooking.referenceCode || id, success: true })
            } catch (emailErr) {
                console.error("Reschedule email failed:", emailErr)
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "BOOKING_RESCHEDULED", entityId: updatedBooking.referenceCode || id, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
            }
        }

        logAudit({
            action: "BOOKING_RESCHEDULED",
            entity: "Booking",
            entityId: id,
            metadata: { referenceCode: updatedBooking.referenceCode, newScheduledAt: newScheduledAt.toISOString() },
        })

        await NotificationManager.sendAdminNotification("BOOKING_RESCHEDULED", {
            bookingRescheduled: {
                clientName: updatedBooking.clientName,
                clientEmail: updatedBooking.clientEmail,
                serviceName: updatedBooking.serviceName,
                referenceCode: updatedBooking.referenceCode || id,
                newDate: newDateStr,
                newTime: newTime
            }
        })

        revalidatePath("/admin/bookings")
        return { success: true }
    } catch (error) {
        console.error("Admin Reschedule Booking Error:", error)
        return { success: false, error: "Failed to reschedule booking" }
    }
}

/**
 * Admin: Verify Payment and Release Meeting Links
 */
export async function approvePaymentAndSendLink(id: string, manualMeetLink?: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { service: { select: { priceVirtual: true, priceInPerson: true } } }
        })
        if (!booking) return { success: false, error: "Booking not found" }
        if (booking.bookingStatus !== "PENDING") return { success: false, error: "Booking is not pending" }

        let finalAmountPaid = null
        if (booking.service) {
            finalAmountPaid = booking.sessionType === "in-person" || booking.sessionType === "IN_PERSON"
                ? booking.service.priceInPerson
                : booking.service.priceVirtual
        }

        const dataToUpdate: any = {
            bookingStatus: "CONFIRMED",
            amountPaid: finalAmountPaid
        }

        if (manualMeetLink?.trim()) {
            const { encrypt } = await import("@/lib/encryption")
            dataToUpdate.encryptedMeetLink = encrypt(manualMeetLink.trim())
        }

        // Update DB
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: dataToUpdate
        })

        // Decrypt google meet link if it exists OR use the one provided
        let meetLink = manualMeetLink || ""
        if (!meetLink && updatedBooking.encryptedMeetLink) {
            try {
                const { decrypt } = await import("@/lib/encryption")
                meetLink = decrypt(updatedBooking.encryptedMeetLink)
            } catch (decErr) {
                console.error("Failed to decrypt Google Meet link during payment verification:", decErr)
            }
        }

        // Send Payment Verified Email
        const emailConfig = await getEmailConfig()
        if (emailConfig) {
            const clientTimezone = updatedBooking.clientTimezone || "Africa/Nairobi"
            const scheduledDate = new Date(updatedBooking.scheduledAt)

            const formattedDate = scheduledDate.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
                timeZone: clientTimezone
            })
            const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", timeZone: clientTimezone
            })

            const emailSubject = `Payment Verified: ${updatedBooking.serviceName} Confirmed (#${updatedBooking.referenceCode || ""})`
            try {
                const { PaymentVerifiedEmail } = await import("@/components/emails/PaymentVerifiedEmail")
                await emailConfig.resend.emails.send({
                    from: `Edwak Nutrition <${emailConfig.fromEmail}>`,
                    to: updatedBooking.clientEmail,
                    subject: emailSubject,
                    react: PaymentVerifiedEmail({
                        clientName: updatedBooking.clientName,
                        serviceName: updatedBooking.serviceName,
                        date: formattedDate,
                        time: `${formattedTime} (${clientTimezone})`,
                        meetLink: meetLink,
                        referenceCode: updatedBooking.referenceCode || "",
                        sessionType: updatedBooking.sessionType as "virtual" | "in-person",
                        branding: emailConfig.branding
                    })
                })
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "PAYMENT_VERIFIED", entityId: updatedBooking.referenceCode || id, success: true })
            } catch (emailErr) {
                console.error("Payment verified email failed:", emailErr)
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "PAYMENT_VERIFIED", entityId: updatedBooking.referenceCode || id, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
            }
        }

        logAudit({
            action: "PAYMENT_VERIFIED",
            entity: "Booking",
            entityId: id,
            metadata: { referenceCode: updatedBooking.referenceCode },
        })

        revalidatePath("/admin/bookings")
        revalidateTag("dashboard", "max")
        return { success: true, meetLink }
    } catch (error) {
        console.error("Payment Verification Error:", error)
        return { success: false, error: "Failed to verify payment" }
    }
}

/**
 * Admin: Update Meeting Link Manually post-approval
 */
export async function adminUpdateMeetLink(id: string, newMeetLink: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    if (!newMeetLink || !newMeetLink.trim()) {
        return { success: false, error: "Meeting link cannot be empty" }
    }

    try {
        const booking = await prisma.booking.findUnique({ where: { id } })
        if (!booking) return { success: false, error: "Booking not found" }
        // Only confirmed upcoming bookings should really have links changed, but we allow it as long as it's not cancelled.
        if (booking.bookingStatus === "CANCELLED") return { success: false, error: "Cannot add link to cancelled booking" }

        const { encrypt } = await import("@/lib/encryption")
        const encryptedLink = encrypt(newMeetLink.trim())

        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { encryptedMeetLink: encryptedLink }
        })

        // Send Email pointing to the new link
        const emailConfig = await getEmailConfig()
        if (emailConfig) {
            const clientTimezone = updatedBooking.clientTimezone || "Africa/Nairobi"
            const scheduledDate = new Date(updatedBooking.scheduledAt)

            const formattedDate = scheduledDate.toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
                timeZone: clientTimezone
            })
            const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
                hour: "numeric", minute: "2-digit", timeZone: clientTimezone
            })

            const emailSubject = `Updated Meeting Link: ${updatedBooking.serviceName} (#${updatedBooking.referenceCode || ""})`
            try {
                // Ensure this template exists!
                const { MeetLinkUpdatedEmail } = await import("@/components/emails/MeetLinkUpdatedEmail")
                await emailConfig.resend.emails.send({
                    from: `Edwak Nutrition <${emailConfig.fromEmail}>`,
                    to: updatedBooking.clientEmail,
                    subject: emailSubject,
                    react: MeetLinkUpdatedEmail({
                        clientName: updatedBooking.clientName,
                        serviceName: updatedBooking.serviceName,
                        date: formattedDate,
                        time: `${formattedTime} (${clientTimezone})`,
                        meetLink: newMeetLink.trim(),
                        referenceCode: updatedBooking.referenceCode || "",
                        sessionType: updatedBooking.sessionType as "virtual" | "in-person",
                        branding: emailConfig.branding
                    })
                })
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "MEET_LINK_UPDATED", entityId: updatedBooking.referenceCode || id, success: true })
            } catch (emailErr) {
                console.error("Meet link updated email failed:", emailErr)
                await logEmailAttempt({ recipientEmail: updatedBooking.clientEmail, subject: emailSubject, context: "MEET_LINK_UPDATED", entityId: updatedBooking.referenceCode || id, success: false, errorMessage: emailErr instanceof Error ? emailErr.message : "Unknown" })
            }
        }

        logAudit({
            action: "MEET_LINK_UPDATED",
            entity: "Booking",
            entityId: id,
            metadata: { referenceCode: updatedBooking.referenceCode },
        })

        revalidatePath("/admin/bookings")
        return { success: true }
    } catch (error) {
        console.error("Update Meet Link Error:", error)
        return { success: false, error: "Failed to update link" }
    }
}
