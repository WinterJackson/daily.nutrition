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
import { revalidatePath } from "next/cache"
import { Resend } from "resend"

export type BookingStatus = "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW"

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
 * Get all bookings with optional filtering
 */
export async function getBookings(filter?: "all" | "upcoming" | "past" | "today") {
    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

        // Always exclude soft-deleted bookings
        const baseWhere = { deletedAt: null }
        let where: any = { ...baseWhere }

        switch (filter) {
            case "upcoming":
                where = { ...baseWhere, scheduledAt: { gte: now } }
                break
            case "past":
                where = { ...baseWhere, scheduledAt: { lt: now } }
                break
            case "today":
                where = {
                    ...baseWhere,
                    scheduledAt: {
                        gte: startOfToday,
                        lt: endOfToday
                    }
                }
                break
            default:
                // "all" - no filter, only exclude deleted
                break
        }

        const bookingsData = await prisma.booking.findMany({
            where,
            orderBy: { scheduledAt: "desc" },
        })

        // Normalize bookingStatus to status for the UI
        const bookings = bookingsData.map(b => ({
            ...b,
            status: b.bookingStatus
        }))

        return { bookings, error: null }
    } catch (error) {
        console.error("Failed to fetch bookings:", error instanceof Error ? error.message : String(error))
        return {
            bookings: [],
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
            }
        })

        revalidatePath("/admin/bookings")

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
        const booking = await prisma.booking.update({
            where: { id },
            data: { bookingStatus: status }
        })

        revalidatePath("/admin/bookings")

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
        await prisma.booking.update({
            where: { id },
            data: { deletedAt: new Date() }
        })

        logAudit({
            action: "BOOKING_DELETED",
            entity: "Booking",
            entityId: id,
        })

        revalidatePath("/admin/bookings")
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

    const settings = await prisma.siteSettings.findUnique({
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
        supportEmail: settings?.EmailBranding?.supportEmail || "info@edwaknutrition.co.ke"
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
        if (!slots.includes(newTime)) {
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
