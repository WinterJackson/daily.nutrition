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
    | "BOOKING_EXPIRED"
    | "BOOKING_CREATED_VIA_GCAL"
    | "PAYMENT_VERIFIED"
    | "MEET_LINK_UPDATED"

    | "BLOG_POST_CREATED"
    | "BLOG_POST_UPDATED"
    | "BLOG_POST_DELETED"
    | "BLOG_POSTS_BULK_DELETED"
    | "BLOG_POST_PUBLISHED"
    | "BLOG_POST_ARCHIVED"
    | "AI_TRENDS_SCOUTED"

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
    | "GOOGLE_REVIEWS_SYNCED"

    | "SETTINGS_UPDATED"
    | "SECRET_UPDATED"
    | "BOOKING_PAYMENT_REVIEW_OVERDUE"
    | "INTEGRATION_CONNECTED"
    | "INTEGRATION_DISCONNECTED"

    | "MEDIA_UPLOADED"
    | "MEDIA_DELETED"
    | "MEDIA_SYNCED"

    // Payments — every state change on the money ledger is auditable, because
    // "what was this customer actually charged" must be answerable months later.
    | "PAYMENT_INITIATED"
    | "PAYMENT_SUCCEEDED"
    | "PAYMENT_FAILED"
    | "PAYMENT_CANCELLED"
    | "PAYMENT_TIMED_OUT"
    | "PAYMENT_AMOUNT_MISMATCH"
    | "PAYMENT_RECONCILED"
    | "PAYMENT_MANUALLY_RECORDED"
    | "PAYMENT_CALLBACK_REJECTED"

    // Meal plans — catalogue lifecycle. PRICE_CHANGED records old and new values
    // in metadata; it is the answer to a later billing dispute.
    | "MEAL_PLAN_CREATED"
    | "MEAL_PLAN_UPDATED"
    | "MEAL_PLAN_PUBLISHED"
    | "MEAL_PLAN_UNPUBLISHED"
    | "MEAL_PLAN_ARCHIVED"
    | "MEAL_PLAN_RESTORED"
    | "MEAL_PLAN_DELETED"
    | "MEAL_PLAN_PRICE_CHANGED"
    | "MEAL_PLAN_SETTINGS_UPDATED"

    // Meal plan orders — fulfilment lifecycle.
    | "MEAL_PLAN_ORDER_CREATED"
    | "MEAL_PLAN_ORDER_PAID"
    | "MEAL_PLAN_ORDER_INTAKE_SUBMITTED"
    | "MEAL_PLAN_ORDER_DELIVERED"
    | "MEAL_PLAN_ORDER_REVISION_REQUESTED"
    | "MEAL_PLAN_ORDER_CANCELLED"
    | "MEAL_PLAN_ORDER_EXPIRED"
    | "MEAL_PLAN_ORDER_REFUNDED"
    | "MEAL_PLAN_SCREENING_BLOCKED"
    | "MEAL_PLAN_DOWNLOAD_ISSUED"
    | "MEAL_PLAN_DOWNLOAD_DENIED"

    // Insurance providers — partnership lifecycle.
    | "INSURANCE_PROVIDER_CREATED"
    | "INSURANCE_PROVIDER_UPDATED"
    | "INSURANCE_PROVIDER_TOGGLED"
    | "INSURANCE_PROVIDER_DELETED"
    | "INSURANCE_PROVIDERS_REORDERED"

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
