"use server"

import { logAudit } from "@/lib/audit"
import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { bookingLimiter } from "@/lib/rate-limit"
import { revalidatePath } from "next/cache"

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
    calendlyId?: string
}

/**
 * Get all bookings with optional filtering
 */
export async function getBookings(filter?: "all" | "upcoming" | "past" | "today") {
    try {
        const now = new Date()
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const endOfToday = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000)

        let where = {}

        switch (filter) {
            case "upcoming":
                where = { scheduledAt: { gte: now } }
                break
            case "past":
                where = { scheduledAt: { lt: now } }
                break
            case "today":
                where = {
                    scheduledAt: {
                        gte: startOfToday,
                        lt: endOfToday
                    }
                }
                break
            default:
                // "all" - no filter
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
                calendlyId: data.calendlyId,
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
 * Upsert booking from Calendly webhook
 */
export async function upsertBookingFromCalendly(calendlyId: string, data: Omit<BookingData, "calendlyId">) {
    try {
        const booking = await prisma.booking.upsert({
            where: { calendlyId },
            update: {
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                serviceName: data.serviceName,
                sessionType: data.sessionType,
                scheduledAt: data.scheduledAt,
                duration: data.duration || 60,
                bookingStatus: data.status || "CONFIRMED",
            },
            create: {
                calendlyId,
                clientName: data.clientName,
                clientEmail: data.clientEmail,
                clientPhone: data.clientPhone,
                serviceId: data.serviceId,
                serviceName: data.serviceName,
                sessionType: data.sessionType,
                scheduledAt: data.scheduledAt,
                duration: data.duration || 60,
                bookingStatus: data.status || "CONFIRMED",
            }
        })

        revalidatePath("/admin/bookings")

        logAudit({
            action: "BOOKING_UPSERTED",
            entity: "Booking",
            entityId: booking.id,
            metadata: { calendlyId, clientName: data.clientName },
        })

        return { success: true, booking }
    } catch (error) {
        console.warn("Failed to upsert booking from Calendly:", error instanceof Error ? error.message : String(error))
        return { success: false, error: "Failed to sync booking" }
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

        const [total, upcoming, today, completed] = await Promise.all([
            prisma.booking.count(),
            prisma.booking.count({ where: { scheduledAt: { gte: now }, bookingStatus: "CONFIRMED" } }),
            prisma.booking.count({ where: { scheduledAt: { gte: startOfToday, lt: endOfToday } } }),
            prisma.booking.count({ where: { bookingStatus: "COMPLETED" } }),
        ])

        return { total, upcoming, today, completed }
    } catch (error) {
        console.error("Failed to fetch booking stats:", error instanceof Error ? error.message : String(error))
        return { total: 0, upcoming: 0, today: 0, completed: 0 }
    }
}
