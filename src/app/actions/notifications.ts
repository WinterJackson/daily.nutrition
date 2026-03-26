"use server"

import { verifySession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

/**
 * Xinteck Pattern: Notification Actions
 * CRUD actions for the admin notification bell.
 */

export async function getNotifications() {
    const session = await verifySession()
    if (!session) return { notifications: [], totalCount: 0, unreadCount: 0 }

    try {
        const userId = session.user.id

        // Xinteck Optimization: Only fetch unread messages + last 10 read messages to prevent payload bloat.
        const [unreadNotifications, recentReadNotifications, totalCount, unreadCount] = await Promise.all([
            prisma.notification.findMany({
                where: { userId, isRead: false },
                orderBy: { createdAt: "desc" },
            }),
            prisma.notification.findMany({
                where: { userId, isRead: true },
                orderBy: { createdAt: "desc" },
                take: 10,
            }),
            prisma.notification.count({ where: { userId } }),
            prisma.notification.count({ where: { userId, isRead: false } }),
        ])

        // Combine and sort by newest first
        const notifications = [...unreadNotifications, ...recentReadNotifications].sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        )

        return { notifications, totalCount, unreadCount }
    } catch (error) {
        console.error("Failed to fetch notifications:", error)
        return { notifications: [], totalCount: 0, unreadCount: 0 }
    }
}

export async function markNotificationRead(notificationId: string) {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        // Enforce Strict Ownership RBAC
        const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
        if (!notification || notification.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true, readAt: new Date() },
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark notification as read:", error)
        return { success: false }
    }
}

export async function markAllNotificationsRead() {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        const userId = session.user.id

        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error)
        return { success: false }
    }
}

export async function deleteNotification(notificationId: string) {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        // Enforce Strict Ownership RBAC
        const notification = await prisma.notification.findUnique({ where: { id: notificationId } })
        if (!notification || notification.userId !== session.user.id) {
            return { success: false, error: "Unauthorized or not found" }
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete notification:", error)
        return { success: false }
    }
}

export async function deleteAllReadNotifications() {
    const session = await verifySession()
    if (!session) return { success: false }

    try {
        await prisma.notification.deleteMany({
            where: { userId: session.user.id, isRead: true },
        })
        revalidatePath("/admin")
        return { success: true }
    } catch (error) {
        console.error("Failed to delete read notifications:", error)
        return { success: false }
    }
}

export async function getSidebarNotificationCounts() {
    const session = await verifySession()
    if (!session) return { bookings: 0, inquiries: 0, testimonials: 0 }

    try {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        const [bookings, inquiries, testimonials] = await Promise.all([
            // Count new bookings from the last 24 hours that haven't been soft-deleted
            prisma.booking.count({ where: { createdAt: { gte: oneDayAgo }, deletedAt: null } }),
            prisma.inquiry.count({ where: { isRead: false, deletedAt: null } }),
            prisma.testimonial.count({ where: { contentStatus: "IN_REVIEW" } })
        ])

        return { bookings, inquiries, testimonials }
    } catch (error) {
        console.error("Failed to fetch sidebar notification counts:", error)
        return { bookings: 0, inquiries: 0, testimonials: 0 }
    }
}
