import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

// Xinteck Pattern: Typed Audit Actions
export type AuditAction =
    | "USER_LOGIN"
    | "USER_LOGOUT"
    | "USER_REGISTER"
    | "PASSWORD_RESET_REQUEST"
    | "PASSWORD_RESET_COMPLETE"
    | "PASSWORD_CHANGE"

    | "BOOKING_CREATED"
    | "BOOKING_UPDATED"
    | "BOOKING_STATUS_UPDATED"
    | "BOOKING_DELETED"
    | "BOOKING_UPSERTED"
    | "BOOKING_CANCELLED"
    | "BOOKING_RESCHEDULED"
    | "BOOKING_NO_SHOW"
    | "BOOKING_CREATED_VIA_GCAL"

    | "BLOG_POST_CREATED"
    | "BLOG_POST_UPDATED"
    | "BLOG_POST_DELETED"
    | "BLOG_POSTS_BULK_DELETED"
    | "BLOG_POST_PUBLISHED"
    | "BLOG_POST_ARCHIVED"

    | "SERVICE_CREATED"
    | "SERVICE_UPDATED"
    | "SERVICE_DELETED"
    | "SERVICE_VISIBILITY_TOGGLED"

    | "INQUIRY_CREATED"
    | "INQUIRY_REPLIED"
    | "INQUIRY_ARCHIVED"
    | "INQUIRY_STATUS_UPDATED"
    | "INQUIRY_DELETED"
    | "INQUIRY_ASSIGNED"
    | "INQUIRY_UNASSIGNED"

    | "TESTIMONIAL_CREATED"
    | "TESTIMONIAL_UPDATED"
    | "TESTIMONIAL_DELETED"
    | "TESTIMONIAL_SUBMITTED"
    | "TESTIMONIAL_APPROVED"
    | "TESTIMONIAL_REJECTED"

    | "SETTINGS_UPDATED"
    | "INTEGRATION_CONNECTED"
    | "INTEGRATION_DISCONNECTED"

    | "MEDIA_UPLOADED"
    | "MEDIA_DELETED"

interface AuditLogParams {
    action: AuditAction
    entity: string
    entityId: string
    userId?: string
    metadata?: Record<string, any>
    ipAddress?: string
}

/**
 * Xinteck Pattern: Fire-and-forget audit logging.
 * NEVER blocks the main business logic flow.
 */
export async function logAudit({ action, entity, entityId, userId, metadata, ipAddress }: AuditLogParams) {
    try {
        // Fire and forget - purposefully not awaiting the promise in the caller
        // by handling the Promise returned from Prisma directly here.
        prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                userId,
                metadata: metadata ? (metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
                ipAddress,
            }
        }).catch((error: Error) => {
            // Log to a secondary secure channel if DB logging fails
            console.error("[AUDIT_LOG_ERROR] Failed to save audit log to DB:", error, { action, entityId })
        })
    } catch (error) {
        // Failsafe catch block internally
        console.error("[AUDIT_LOG_FATAL] Synchronous failure in logAudit:", error)
    }
}
