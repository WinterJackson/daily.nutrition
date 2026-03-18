import { prisma } from "@/lib/prisma"
import { NotificationPriority } from "@prisma/client"

export type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR"

export interface CreateNotificationParams {
    userId: string
    type: NotificationType
    title: string
    message: string
    priority?: NotificationPriority
    link?: string
    metadata?: any
    expiresInDays?: number
}

export interface BroadcastNotificationParams {
    roles: string[]
    type: NotificationType
    title: string
    message: string
    priority?: NotificationPriority
    link?: string
    metadata?: any
    expiresInDays?: number
}

/**
 * Xinteck Architectural Standard: Centralized Notification Service
 * 
 * Enforces the "Single Source of Truth" paradigm.
 * All alerts, whether targeted or broadcast, must route through this Service Class 
 * rather than direct prisma.notification.create calls. This ensures structural 
 * integrity, RBAC logic encapsulation, and standardized cleanup behaviors.
 */
export class NotificationService {

    /**
     * Creates a highly targeted notification for a single User ID.
     */
    static async create(params: CreateNotificationParams) {
        const expiresAt = params.expiresInDays
            ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
            : null

        return prisma.notification.create({
            data: {
                userId: params.userId,
                type: params.type,
                title: params.title,
                message: params.message,
                priority: params.priority || "NORMAL",
                link: params.link,
                metadata: params.metadata || {},
                expiresAt
            }
        })
    }

    /**
     * The workhorse for system alerts (e.g. "New Lead Submitted").
     * Builds a payload array across all targeted roles and uses createMany for highly efficient bulk insertion.
     */
    static async broadcastToRoles(params: BroadcastNotificationParams) {
        const users = await prisma.user.findMany({
            where: {
                role: { in: params.roles },
                deletedAt: null // Only active users
            },
            select: { id: true }
        })

        if (users.length === 0) return { count: 0 }

        const expiresAt = params.expiresInDays
            ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
            : null

        const data = users.map(user => ({
            userId: user.id,
            type: params.type,
            title: params.title,
            message: params.message,
            priority: params.priority || "NORMAL",
            link: params.link,
            metadata: params.metadata || {},
            expiresAt
        }))

        // @ts-ignore prisma types for createMany JSON metadata can be strict
        const result = await prisma.notification.createMany({
            data
        })

        return { count: result.count }
    }

    /**
     * Maintenance function to be called by CRON/API scheduling.
     * Deletes expired notifications proactively keeping the DB lean.
     */
    static async cleanupExpired() {
        return prisma.notification.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        })
    }
}
