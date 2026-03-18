"use server"

import { prisma } from "@/lib/prisma"

/**
 * Logs an email send attempt and its outcome.
 * Call AFTER attempting to send via Resend.
 */
export async function logEmailAttempt(params: {
    recipientEmail: string
    subject: string
    context: string // e.g. "BOOKING_CONFIRMATION", "BOOKING_CANCELLATION", "INQUIRY_REPLY"
    entityId?: string
    success: boolean
    errorMessage?: string
}) {
    try {
        await prisma.emailLog.create({
            data: {
                recipientEmail: params.recipientEmail,
                subject: params.subject,
                context: params.context,
                entityId: params.entityId,
                status: params.success ? "SENT" : "FAILED",
                errorMessage: params.errorMessage,
                sentAt: params.success ? new Date() : null,
            }
        })
    } catch (e) {
        // Never let logging crash the primary flow
        console.error("EmailLog write failed:", e)
    }
}

/**
 * Admin-facing: Fetch recent failed emails for the dashboard alert tray.
 */
export async function getFailedEmails(limit = 20) {
    try {
        return await prisma.emailLog.findMany({
            where: { status: "FAILED" },
            orderBy: { createdAt: "desc" },
            take: limit,
        })
    } catch (e) {
        console.error("Failed to fetch email logs:", e)
        return []
    }
}

/**
 * Admin-facing: Mark a failed email as manually resolved.
 */
export async function resolveEmailLog(id: string) {
    try {
        await prisma.emailLog.update({
            where: { id },
            data: { status: "RESOLVED" }
        })
        return { success: true }
    } catch (e) {
        return { success: false }
    }
}
