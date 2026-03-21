"use server"

import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { endOfDay, startOfDay } from "date-fns"
import { revalidatePath, unstable_noStore } from "next/cache"

export interface BlockedDateData {
    id?: string
    date: Date
    reason?: string
}

/**
 * Get all blocked dates
 */
export async function getBlockedDates() {
    unstable_noStore()
    try {
        const blockedDates = await prisma.blockedDate.findMany({
            orderBy: { date: 'asc' }
        })
        return { success: true, blockedDates }
    } catch (error) {
        console.error("Failed to fetch blocked dates:", error)
        return { success: false, blockedDates: [] }
    }
}

/**
 * Get blocked dates for a specific date range
 */
export async function getBlockedDatesInRange(startDate: Date, endDate: Date) {
    try {
        const blockedDates = await prisma.blockedDate.findMany({
            where: {
                date: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate)
                }
            },
            orderBy: { date: 'asc' }
        })
        return blockedDates.map(bd => bd.date)
    } catch (error) {
        console.error("Failed to fetch blocked dates in range:", error)
        return []
    }
}

/**
 * Check if a specific date is blocked
 */
export async function isDateBlocked(date: Date): Promise<boolean> {
    try {
        const blocked = await prisma.blockedDate.findFirst({
            where: {
                date: {
                    gte: startOfDay(date),
                    lte: endOfDay(date)
                }
            }
        })
        return !!blocked
    } catch (error) {
        console.error("Failed to check if date is blocked:", error)
        return false
    }
}

/**
 * Add a new blocked date
 */
export async function addBlockedDate(dateStr: string, reason?: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        // Construct a pristine UTC Date object strictly from the raw HTML input string.
        // Bypassing network JS serialization ensures East Africa Time never shifts midnight backwards.
        const utcMidnight = new Date(`${dateStr}T00:00:00.000Z`)

        const blockedDate = await prisma.blockedDate.create({
            data: {
                date: utcMidnight,
                reason: reason || undefined
            }
        })

        revalidatePath("/admin/bookings/calendar")
        revalidatePath("/booking/schedule")
        return { success: true, blockedDate }
    } catch (error: any) {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return { success: false, error: "This date is already blocked" }
        }
        console.error("Failed to add blocked date:", error)
        return { success: false, error: "Failed to add blocked date" }
    }
}

/**
 * Remove a blocked date by ID
 */
export async function removeBlockedDate(id: string) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        await prisma.blockedDate.delete({
            where: { id }
        })

        revalidatePath("/admin/bookings/calendar")
        revalidatePath("/booking/schedule")
        return { success: true }
    } catch (error) {
        console.error("Failed to remove blocked date:", error)
        return { success: false, error: "Failed to remove blocked date" }
    }
}

/**
 * Remove a blocked date by date value
 */
export async function removeBlockedDateByDate(date: Date) {
    const session = await verifySession()
    if (!session) return { success: false, error: "Unauthorized" }

    try {
        const normalizedDate = startOfDay(date)

        await prisma.blockedDate.deleteMany({
            where: {
                date: {
                    gte: normalizedDate,
                    lt: endOfDay(date)
                }
            }
        })

        revalidatePath("/admin/bookings/calendar")
        revalidatePath("/booking/schedule")
        return { success: true }
    } catch (error) {
        console.error("Failed to remove blocked date:", error)
        return { success: false, error: "Failed to remove blocked date" }
    }
}
